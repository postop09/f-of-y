// 방문자의 질문 → Jev 요청, Jev 응답 → 탐색 결과. 서버 함수(api/explore.ts)와 화면이 같은 모양을 쓴다.
// Jev는 글을 쓰지 않는다: 카테고리와 항목을 고르고 확률만 돌려준다. 보여 줄 문구는 이력서 데이터에서 온다.
// api/ 는 Vercel이 파일마다 따로 컴파일하는 Node ESM이라, 여기서 런타임에 읽는 상대 경로는 .js 확장자를 붙인다.
import { CATEGORIES, ITEMS } from '../model/resume.js'
import type { CategoryId } from '../model/types'

export const JEV_MODEL = 'jev-latest'
export const MAX_QUERY = 200
/** 항목 고르기의 '해당 없음' 선택지 */
const NONE = 'none'
/** 결과로 돌려줄 항목 수 */
const TOP = 3

export type ExploreResult = {
  source: 'jev' | 'local'
  /** jev가 답했을 때 실제 모델 버전 */
  model?: string
  category: CategoryId
  categories: Record<CategoryId, number>
  /** 확률 순, 많아야 TOP개 */
  items: { id: string; p: number }[]
  /** 이 질문이 이력서(경력·역량)에 대한 것일 확률 */
  aboutResume: number
}

/** 공백을 정리하고 길이를 자른 질문. 비었으면 null */
export const cleanQuery = (q: unknown) => {
  if (typeof q !== 'string') return null
  const s = q.replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY)
  return s ? s : null
}

export const buildJevRequest = (query: string) => ({
  state: { visitor_question: query, context: "A visitor is exploring a frontend developer's resume and asked this question." },
  model: JEV_MODEL,
  questions: {
    category: {
      type: 'choice',
      instructions: 'Which area of the developer’s experience is the visitor asking about?',
      criteria: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.hint])),
    },
    item: {
      type: 'choice',
      instructions: 'Which project from the resume best answers the visitor’s question?',
      criteria: { ...Object.fromEntries(ITEMS.map((it) => [it.id, `${it.title} (${it.company}): ${it.summary}`])), [NONE]: 'None of these projects answers the question' },
    },
    about_resume: {
      type: 'noul',
      instructions: 'Is the visitor asking about the developer’s work, skills or experience?',
      criteria: { true: 'A question about the developer’s career, projects or abilities', false: 'Small talk, off-topic or unrelated to the resume' },
    },
  },
})

type Rec = Record<string, unknown>
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v)
const probs = (v: unknown): Record<string, number> | null => {
  if (!isRec(v)) return null
  const out: Record<string, number> = {}
  for (const [k, p] of Object.entries(v)) if (typeof p === 'number' && Number.isFinite(p)) out[k] = p
  return out
}
const CATEGORY_IDS = CATEGORIES.map((c) => c.id)

const byP = (a: { p: number }, b: { p: number }) => b.p - a.p

/** Jev 응답 → 탐색 결과. 모양이 다르면 null */
export const readJevResponse = (json: unknown): ExploreResult | null => {
  if (!isRec(json) || !isRec(json.answers)) return null
  const { category, item, about_resume } = json.answers
  if (!isRec(category) || !isRec(item) || !isRec(about_resume)) return null
  const cp = probs(category.probabilities)
  const ip = probs(item.probabilities)
  if (!cp || !ip || typeof about_resume.noul !== 'number') return null
  const categories = Object.fromEntries(CATEGORY_IDS.map((id) => [id, cp[id] ?? 0])) as Record<CategoryId, number>
  const best = CATEGORY_IDS.slice().sort((a, b) => categories[b] - categories[a])[0]
  const items = ITEMS.map((it) => ({ id: it.id, p: ip[it.id] ?? 0 }))
    .sort(byP)
    .slice(0, TOP)
  return { source: 'jev', model: typeof json.model === 'string' ? json.model : undefined, category: best, categories, items, aboutResume: about_resume.noul }
}

/** 서버 응답 검사 (화면 쪽): 모양이 맞으면 그대로, 아니면 null */
export const isExploreResult = (v: unknown): v is ExploreResult =>
  isRec(v) &&
  (v.source === 'jev' || v.source === 'local') &&
  typeof v.category === 'string' &&
  (CATEGORY_IDS as string[]).includes(v.category) &&
  isRec(v.categories) &&
  Array.isArray(v.items) &&
  v.items.every((it) => isRec(it) && typeof it.id === 'string' && typeof it.p === 'number') &&
  typeof v.aboutResume === 'number'
