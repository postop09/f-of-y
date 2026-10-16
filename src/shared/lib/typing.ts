// 모노 한 줄이 이 스크롤 위치에서 몇 글자까지 쳐졌는지. 시계가 아니라 f.lb(장면 안 위치)로 계산한다.
// 1스크롤 단위 = 반주 1박이라, 글자는 박 격자에 떨어진다: 짧은 줄은 16분음표, 긴 줄은 32분음표마다 한 글자.
import { clamp } from './math'

/** [text, className] — Code 한 줄을 이루는 조각 */
export type Seg = readonly [text: string, cls: string]

/** typeOn()이 읽는 프레임의 일부: 장면 안 위치와 캐럿 깜빡임 상태 */
export type Clock = { lb: number; blink: boolean }

export const segLength = (segs: readonly Seg[]) => segs.reduce((a, [t]) => a + [...t].length, 0)

const lengthOf = (line: string | readonly Seg[]) => (typeof line === 'string' ? [...line].length : segLength(line))

/** 이보다 긴 줄은 32분음표로 친다 */
export const LONG_LINE = 8

/** 글자 하나의 간격 (박): 16분음표, 긴 줄은 32분음표 */
export const typeStep = (n: number) => (n > LONG_LINE ? 1 / 8 : 1 / 4)

/** at부터 글자를 치기 시작하면 다 쳐지는 위치 (마지막 글자 다음 칸) */
export const typeEnd = (line: string | readonly Seg[], at: number) => {
  const n = lengthOf(line)
  return at + n * typeStep(n)
}

/** at에 첫 글자, 그 뒤 step마다 한 글자: lb에서 몇 글자가 보이나 */
export const countOn = (lb: number, at: number, n: number, step = typeStep(n)) =>
  lb < at ? 0 : clamp(Math.floor((lb - at) / step + 1e-6) + 1, 0, n)

// How much of a line is typed at this scroll position, and whether its caret shows.
// The caret is solid while typing, then blinks until `until`.
export const typeOn = (f: Clock, line: string | readonly Seg[], at: number, until = Infinity) => {
  const N = lengthOf(line)
  const n = countOn(f.lb, at, N)
  return { n, caret: f.lb < until && ((f.lb >= at && n < N) || f.blink) }
}

// Split the first `n` typed characters across segments: how many of each segment shows.
export const sliceCounts = (segs: readonly Seg[], n: number) => {
  let left = n
  return segs.map(([t]) => {
    const m = clamp(left, 0, [...t].length)
    left -= m
    return m
  })
}
