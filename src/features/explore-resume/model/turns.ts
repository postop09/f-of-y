// 탐색 화면에 쌓이는 차례(turn)의 모양과, 질문 결과에서 보여 줄 항목을 고르는 규칙.
import { type CategoryId, type ExploreResult, type ResumeItem, CATEGORY, ITEM, itemsIn } from '@/entities/resume'

/** 이보다 낮은 일치도의 항목은 결과에 넣지 않는다 */
export const MIN_P = 0.15
/** 이보다 낮으면 이력서와 무관한 질문으로 본다 */
export const MIN_ABOUT = 0.4

/** 쌓이는 한 차례: 질문(답을 기다리는 중이면 r = null), 카테고리 보기, 명령어(all 은 모든 카테고리 보기) */
export type TurnKind =
  | { kind: 'ask'; q: string; r: ExploreResult | null }
  | { kind: 'cat'; cat: CategoryId }
  | { kind: 'help' }
  | { kind: 'categories' }
  | { kind: 'all' }
export type Turn = TurnKind & { id: number }

/** 차례 맨 위에 다시 찍는 명령 줄 */
export const commandLine = (t: TurnKind) =>
  t.kind === 'ask' ? t.q : t.kind === 'cat' ? `ls categories/${CATEGORY[t.cat].label}` : t.kind

export type Pick = { item: ResumeItem; p?: number }

/** 질문 결과에서 보여 줄 항목: 일치도가 충분한 것, 없으면 고른 카테고리의 항목 */
export const picked = (r: ExploreResult): Pick[] => {
  if (r.aboutResume < MIN_ABOUT) return []
  const hits = r.items.filter((it) => it.p >= MIN_P).map((it) => ({ item: ITEM[it.id], p: it.p }))
  return hits.length ? hits : itemsIn(r.category).map((item) => ({ item }))
}
