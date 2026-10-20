// Jev 없이 고르는 대체 경로: 질문에 든 키워드로 항목 점수를 매기고, 항목 점수를 카테고리로 모은다.
// 서버 함수가 없거나(npm run export의 단일 HTML) 키가 없거나 Jev가 실패했을 때 쓴다.
import { CATEGORIES, ITEMS } from '../model/resume'
import type { CategoryId } from '../model/types'
import type { ExploreResult } from './jev'

/** 카테고리 이름·별칭이 질문에 그대로 나오면 그 카테고리 쪽으로 기운다 */
const CATEGORY_WORDS: Record<CategoryId, readonly string[]> = {
  ux: ['사용자 경험', 'ux', '사용성', '사용자', '고객', '피드백'],
  ui: ['ui', '디자인', '화면', '컴포넌트', '시각화', '인터페이스'],
  ai: ['ai', '인공지능', 'claude', 'cursor', 'llm', 'gpt'],
  arch: ['구조', '아키텍처', '설계', 'monorepo', '모노레포', 'fsd', '리팩터링', '리팩토링', '유지보수'],
  ops: ['운영', '안정', '장애', '에러', '모니터링', 'sentry'],
  team: ['협업', '프로세스', '팀', '소통', '커뮤니케이션', '문서', '온보딩', '리더'],
}

const TOP = 3

// latin words match whole (so "ai" is not found in "detail"), Hangul anywhere (particles stick to it: "AI를")
const has = (q: string, w: string) =>
  /^[a-z0-9 .]+$/.test(w) ? new RegExp(`(^|[^a-z0-9])${w.replace(/\./g, '\\.')}($|[^a-z0-9])`).test(q) : q.includes(w)

export const localMatch = (query: string): ExploreResult => {
  const q = query.toLowerCase()
  const hits = (words: readonly string[]) => words.reduce((n, w) => n + (has(q, w) ? 1 : 0), 0)
  const itemScore = ITEMS.map((it) => ({ id: it.id, s: hits(it.keywords) + (has(q, it.company.replace('㈜', '').toLowerCase()) ? 1 : 0) }))
  const catScore = Object.fromEntries(
    CATEGORIES.map((c) => [c.id, 2 * hits(CATEGORY_WORDS[c.id]) + itemScore.reduce((n, x, i) => n + (ITEMS[i].categories.includes(c.id) ? x.s : 0), 0)]),
  ) as Record<CategoryId, number>

  const total = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
  const ct = total(Object.values(catScore))
  const categories = Object.fromEntries(CATEGORIES.map((c) => [c.id, ct ? catScore[c.id] / ct : 1 / CATEGORIES.length])) as Record<CategoryId, number>
  const category = CATEGORIES.map((c) => c.id).sort((a, b) => categories[b] - categories[a])[0]

  const it = total(itemScore.map((x) => x.s))
  const items = itemScore
    .filter((x) => x.s > 0)
    .map((x) => ({ id: x.id, p: x.s / it }))
    .sort((a, b) => b.p - a.p)
    .slice(0, TOP)

  return { source: 'local', category, categories, items, aboutResume: ct > 0 ? 0.9 : 0.1 }
}
