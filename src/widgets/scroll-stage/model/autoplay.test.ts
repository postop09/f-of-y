import { describe, expect, it } from 'vitest'
import { markAutoplayed, shouldAutoplay } from './autoplay'

const memory = () => {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }
}
const broken = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }

describe('autoplay', () => {
  it('plays once per session', () => {
    const s = memory()
    expect(shouldAutoplay(false, s)).toBe(true)
    markAutoplayed(s)
    expect(shouldAutoplay(false, s)).toBe(false)
  })
  it('never plays with reduced motion', () => {
    expect(shouldAutoplay(true, memory())).toBe(false)
  })
  it('still plays when storage is missing or blocked', () => {
    expect(shouldAutoplay(false, null)).toBe(true)
    expect(shouldAutoplay(false, broken)).toBe(true)
    expect(() => markAutoplayed(broken)).not.toThrow()
  })
})
