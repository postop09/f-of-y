// 뷰포트 크기 → 장면이 쓰는 레이아웃 값. `key`는 크기·글꼴 버전마다 바뀌어 memo 캐시를 가른다.
import { clamp } from './math'

export type Layout = {
  W: number
  H: number
  /** 좌우 여백 */
  M: number
  /** 모노 글꼴 크기 */
  mono: number
  /** 줄 번호 거터 x */
  gx: number
  /** 타이핑 줄의 y */
  TY: number
  /** 픽셀 셀 크기 */
  cs: number
  dpr: number
  key: string
}

export const makeLayout = (W: number, H: number, ver: number): Layout => {
  const M = Math.round(Math.max(22, W * 0.075))
  const mono = clamp(Math.min(W * 0.019, H * 0.034), 12.5, 25)
  return {
    W,
    H,
    M,
    mono,
    gx: Math.max(4, M - Math.min(mono * 2.4, M - 6)), // line-number gutter, squeezed on phones
    TY: Math.round(H * 0.26),
    cs: Math.round(clamp(Math.min(W, H * 1.5) / 74, 6, 16)),
    dpr: Math.min(2, window.devicePixelRatio || 1),
    key: `${W}x${H}#${ver}`,
  }
}

export type Box = { x: number; y: number; w: number; h: number }

export const bigBox = (L: Layout, hFrac = 0.3): Box => {
  const y = L.TY + L.mono * 3.4
  return { x: L.M, y, w: L.W - 2 * L.M, h: Math.max(36, Math.min(L.H * hFrac, L.H - y - L.H * 0.2 - 30)) }
}

const memoMap = new Map<string, unknown>()
export const memo = <T,>(L: Layout, k: string, fn: () => T): T => {
  const key = `${L.key}|${k}`
  if (!memoMap.has(key)) memoMap.set(key, fn())
  return memoMap.get(key) as T
}
export const clearLayoutMemo = () => memoMap.clear()
