import { describe, expect, it } from 'vitest'
import { collectCues, cuesBetween, typeCues } from './cues'

describe('typeCues', () => {
  it('ticks once per visible character, on the sixteenth typeOn() shows it', () => {
    expect(typeCues('ab c', 1)).toEqual([
      [1, 'tick', 0],
      [1.25, 'tick', 1],
      [1.75, 'tick', 3],
    ])
  })
  it('uses thirty-seconds for long lines, or the step given', () => {
    expect(typeCues('abcdefghijklmnopq', 0)[1][0]).toBe(0.125)
    expect(typeCues('abc', 0, 0.5)[2][0]).toBe(1)
  })
  it('reads segments the same as plain text', () => {
    expect(typeCues([['ab', ''], [' c', 'sig']], 1)).toEqual(typeCues('ab c', 1))
  })
})

describe('collectCues', () => {
  it('places cues at scene start + lb, sorted, and drops ones outside the scene', () => {
    const cues = collectCues([
      { at: 0, len: 2, sfx: [[1.5, 'boom'], [0.5, 'tick', 3], [2, 'crash']] },
      { at: 2, len: 2, sfx: [[0, 'enter']] },
      { at: 4, len: 1 },
    ])
    expect(cues).toEqual([
      { u: 0.5, kind: 'tick', arg: 3 },
      { u: 1.5, kind: 'boom', arg: undefined },
      { u: 2, kind: 'enter', arg: undefined },
    ])
  })
})

describe('cuesBetween', () => {
  const cues = [1, 2, 2, 3].map((u) => ({ u, kind: 'tick' as const }))
  it('takes a < u <= b', () => {
    expect(cuesBetween(cues, 1, 2).map((c) => c.u)).toEqual([2, 2])
    expect(cuesBetween(cues, 0, 1).map((c) => c.u)).toEqual([1])
    expect(cuesBetween(cues, 3, 9)).toEqual([])
  })
  it('is empty when not moving forward', () => {
    expect(cuesBetween(cues, 2, 2)).toEqual([])
    expect(cuesBetween(cues, 3, 1)).toEqual([])
  })
})
