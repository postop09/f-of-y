// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { bigBox, clearLayoutMemo, makeLayout, memo } from './layout'

describe('makeLayout', () => {
  it('keeps the gutter on screen for phone widths', () => {
    const L = makeLayout(360, 640, 1)
    expect(L.M).toBe(27)
    expect(L.gx).toBeGreaterThanOrEqual(4)
    expect(L.gx).toBeLessThan(L.M)
    expect(L.cs).toBeGreaterThanOrEqual(6)
    expect(L.key).toBe('360x640#1')
  })
  it('clamps the mono size and cell size on large screens', () => {
    const L = makeLayout(2560, 1440, 2)
    expect(L.mono).toBe(25)
    expect(L.cs).toBe(16)
  })
})

describe('bigBox', () => {
  it('sits under the typed line and never leaves the stage', () => {
    const L = makeLayout(1280, 800, 1)
    const b = bigBox(L)
    expect(b.x).toBe(L.M)
    expect(b.y).toBeGreaterThan(L.TY)
    expect(b.y + b.h).toBeLessThan(L.H)
  })
})

describe('memo', () => {
  it('caches per layout key and clears', () => {
    const L = makeLayout(800, 600, 1)
    let calls = 0
    const f = () => memo(L, 'k', () => ++calls)
    expect(f()).toBe(1)
    expect(f()).toBe(1)
    clearLayoutMemo()
    expect(f()).toBe(2)
  })
})
