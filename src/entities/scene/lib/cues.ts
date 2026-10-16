// 장면들의 효과음 신호를 전체 스크롤 위치(u) 순으로 펼치고, 구간 (a, b] 에 든 신호를 꺼낸다.
import type { SfxKind } from '@/shared/lib/synth'
import type { Seg } from '@/shared/lib/typing'
import type { Cue } from '../model/types'

export type TimedCue = { u: number; kind: SfxKind; arg?: number }

/** 타이핑 한 줄의 틱: 공백이 아닌 글자마다, typing()이 그 글자를 보여 주는 순간에 하나. */
export const typeCues = (line: string | readonly Seg[], at: number, dur: number): Cue[] => {
  const ch = typeof line === 'string' ? [...line] : line.flatMap(([t]) => [...t])
  return ch.flatMap((c, i): Cue[] => (c.trim() ? [[at + ((i + 0.5) * dur) / ch.length, 'tick', i]] : []))
}

export const collectCues = (scenes: readonly { at: number; len: number; sfx?: readonly Cue[] }[]): TimedCue[] =>
  scenes
    .flatMap((sc) => (sc.sfx ?? []).filter(([lb]) => lb >= 0 && lb < sc.len).map(([lb, kind, arg]) => ({ u: sc.at + lb, kind, arg })))
    .sort((p, q) => p.u - q.u)

/** 정렬된 신호 중 a < u ≤ b 인 것 */
export const cuesBetween = (cues: readonly TimedCue[], a: number, b: number) => {
  if (b <= a) return []
  const first = (x: number) => {
    let lo = 0
    let hi = cues.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (cues[mid].u <= x) lo = mid + 1
      else hi = mid
    }
    return lo
  }
  return cues.slice(first(a), first(b))
}
