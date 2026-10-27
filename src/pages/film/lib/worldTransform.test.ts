import { describe, expect, it } from 'vitest'
import { flashOpacity, worldTransform } from './worldTransform'

describe('worldTransform', () => {
  it('is empty with no camera and no shake', () => {
    expect(worldTransform(null, 1, 0)).toBe('')
    expect(worldTransform({}, 1, 0.5)).toBe('')
    expect(worldTransform({ shake: 20 }, 0, 0.5)).toBe('')
  })
  it('zooms around the camera focus', () => {
    const cam = { s: 2, fx: 100, fy: 50, px: 100, py: 50 }
    expect(worldTransform({ cam }, 0, 0, 1)).toBe('translate(-100.00px,-50.00px) scale(2.0000)')
  })
  it('drops the shake when motion effects are off', () => {
    expect(worldTransform({ shake: 30 }, 1, 0.37, 0)).toBe('')
    expect(worldTransform({ shake: 30 }, 1, 0.37, 1)).toMatch(/^translate\(.+\) scale\(1\.0000\)$/)
  })
})

describe('flashOpacity', () => {
  it('scales with speed and caps at .5', () => {
    expect(flashOpacity(null, 1)).toBe(0)
    expect(flashOpacity({ flash: 0.2 }, 0.5, 1)).toBeCloseTo(0.1)
    expect(flashOpacity({ flash: 2 }, 1, 1)).toBe(0.5)
    expect(flashOpacity({ flash: 2 }, 1, 0)).toBe(0)
  })
})
