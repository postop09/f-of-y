// 확률 순위: Jev 응답(api/jev), 키워드 매칭(model/localMatch), 화면의 카테고리 막대가 같이 쓴다.
// 서버 함수도 읽으므로 상대 import 는 .js 로 끝나고, DOM·React 는 없다.
import { CATEGORIES } from '../model/resume.js'
import type { CategoryId } from '../model/types'

/** 결과로 돌려줄 항목 수 */
export const TOP = 3
const CATEGORY_IDS = CATEGORIES.map((c) => c.id)

/** 확률 순으로 많아야 TOP개 */
export const top = <T extends { p: number }>(xs: T[]) => xs.sort((a, b) => b.p - a.p).slice(0, TOP)
/** 확률이 가장 높은 카테고리 */
export const bestCategory = (categories: Record<CategoryId, number>) => top(CATEGORY_IDS.map((id) => ({ id, p: categories[id] })))[0].id
