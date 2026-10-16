import { describe, expect, it } from 'vitest'
import { type Seg, countOn, segLength, sliceCounts, typeEnd, typeOn, typeStep } from './typing'

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

describe('typeStep', () => {
  it('types short lines on sixteenths and long lines on thirty-seconds', () => {
    expect(typeStep(8)).toBe(0.25)
    expect(typeStep(9)).toBe(0.125)
  })
})

describe('countOn', () => {
  it('shows the first character on `at` and one more every step', () => {
    expect(countOn(0.99, 1, 4)).toBe(0)
    expect(countOn(1, 1, 4)).toBe(1)
    expect(countOn(1.24, 1, 4)).toBe(1)
    expect(countOn(1.25, 1, 4)).toBe(2)
    expect(countOn(9, 1, 4)).toBe(4)
  })
})

describe('typeOn', () => {
  it('types nothing before `at` and everything by typeEnd', () => {
    expect(typeOn({ lb: 0, blink: false }, segs, 0.5).n).toBe(0)
    expect(typeEnd(segs, 0.5)).toBe(1.625)
    expect(typeOn({ lb: 1.5, blink: false }, segs, 0.5).n).toBe(9)
  })
  it('shows a solid caret while typing, then only on blink', () => {
    expect(typeOn({ lb: 1, blink: false }, segs, 0.5).caret).toBe(true)
    expect(typeOn({ lb: 2, blink: false }, segs, 0.5).caret).toBe(false)
    expect(typeOn({ lb: 2, blink: true }, segs, 0.5).caret).toBe(true)
  })
  it('hides the caret after `until`', () => {
    expect(typeOn({ lb: 3, blink: true }, segs, 0, 2).caret).toBe(false)
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
