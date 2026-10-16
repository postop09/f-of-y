// 모노 한 줄이 이 스크롤 위치에서 몇 글자까지 쳐졌는지. 시계가 아니라 f.lb(장면 안 위치)로 계산한다.
import { clamp } from './math'

/** [text, className] — Code 한 줄을 이루는 조각 */
export type Seg = readonly [text: string, cls: string]

/** typing()이 읽는 프레임의 일부: 장면 안 위치와 캐럿 깜빡임 상태 */
export type Clock = { lb: number; blink: boolean }

export const segLength = (segs: readonly Seg[]) => segs.reduce((a, [t]) => a + [...t].length, 0)

// How much of a line is typed at this scroll position, and whether its caret shows.
// The caret is solid while typing, then blinks until `until`.
export const typing = (f: Clock, segs: readonly Seg[], at: number, dur: number, until = Infinity) => {
  const k = clamp((f.lb - at) / dur)
  return { n: Math.round(k * segLength(segs)), caret: f.lb < until && ((f.lb >= at && k < 1) || f.blink) }
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
