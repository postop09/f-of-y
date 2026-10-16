import { describe, expect, it } from 'vitest'
import { E, bump, clamp, hash, lerp, pad, range, span, springAt } from './math'

describe('clamp / lerp / span / bump', () => {
  it('clamp defaults to 0..1', () => {
    expect(clamp(-1)).toBe(0)
    expect(clamp(2)).toBe(1)
    expect(clamp(0.5)).toBe(0.5)
    expect(clamp(15, 10, 12)).toBe(12)
  })
  it('lerp interpolates', () => {
    expect(lerp(0, 10, 0.25)).toBe(2.5)
  })
  it('span maps a..b to 0..1 and clamps outside', () => {
    expect(span(2, 4, 1)).toBe(0)
    expect(span(2, 4, 3)).toBe(0.5)
    expect(span(2, 4, 9)).toBe(1)
  })
  it('bump rises to 1 in the middle and is 0 at both ends', () => {
    expect(bump(0, 1, 0)).toBeCloseTo(0)
    expect(bump(0, 1, 0.5)).toBeCloseTo(1)
    expect(bump(0, 1, 1)).toBeCloseTo(0)
  })
})

describe('easings', () => {
  it.each(Object.entries(E))('%s maps 0→0 and 1→1', (_name, fn) => {
    expect(fn(0)).toBeCloseTo(0)
    expect(fn(1)).toBeCloseTo(1)
  })
  it('outBack overshoots past 1', () => {
    expect(E.outBack(0.7)).toBeGreaterThan(1)
  })
})

describe('hash', () => {
  it('is deterministic and in [0, 1)', () => {
    expect(hash(3, 7)).toBe(hash(3, 7))
    for (let i = 0; i < 50; i++) {
      const v = hash(i, i * 3)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('springAt', () => {
  it('starts at 0 and settles to 1', () => {
    expect(springAt(0, 12, 0.4)).toBe(0)
    expect(springAt(-1, 12, 0.4)).toBe(0)
    expect(springAt(20, 12, 0.4)).toBeCloseTo(1, 3)
  })
})

describe('pad / range', () => {
  it('pad zero-fills', () => {
    expect(pad(5, 2)).toBe('05')
    expect(pad(123, 2)).toBe('123')
  })
  it('range is inclusive', () => {
    expect(range(-1, 2)).toEqual([-1, 0, 1, 2])
  })
})
