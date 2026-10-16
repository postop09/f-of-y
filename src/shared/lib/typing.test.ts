import { describe, expect, it } from 'vitest'
import { type Seg, segLength, sliceCounts, typing } from './typing'

const segs: Seg[] = [
  ['scroll(', ''],
  ['y', 'sig'],
  [')', ''],
]

describe('segLength', () => {
  it('counts code points across segments', () => {
    expect(segLength(segs)).toBe(9)
    expect(segLength([['한글 é', '']])).toBe(4)
  })
})

describe('typing', () => {
  it('types nothing before `at` and everything after at + dur', () => {
    expect(typing({ lb: 0, blink: false }, segs, 0.45, 1.3).n).toBe(0)
    expect(typing({ lb: 2, blink: false }, segs, 0.45, 1.3).n).toBe(9)
  })
  it('shows a solid caret while typing, then only on blink', () => {
    expect(typing({ lb: 1, blink: false }, segs, 0.45, 1.3).caret).toBe(true)
    expect(typing({ lb: 2, blink: false }, segs, 0.45, 1.3).caret).toBe(false)
    expect(typing({ lb: 2, blink: true }, segs, 0.45, 1.3).caret).toBe(true)
  })
  it('hides the caret after `until`', () => {
    expect(typing({ lb: 3, blink: true }, segs, 0, 1, 2).caret).toBe(false)
  })
})

describe('sliceCounts', () => {
  it('fills segments in order and never exceeds their length', () => {
    expect(sliceCounts(segs, 0)).toEqual([0, 0, 0])
    expect(sliceCounts(segs, 3)).toEqual([3, 0, 0])
    expect(sliceCounts(segs, 8)).toEqual([7, 1, 0])
    expect(sliceCounts(segs, Infinity)).toEqual([7, 1, 1])
  })
})
