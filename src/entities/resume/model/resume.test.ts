import { describe, expect, it } from 'vitest'
import { ITEMS } from './resume'

// public/ 에 실제로 있는 이미지 (불러오지는 않고 경로만 본다)
const FILES = new Set(Object.keys(import.meta.glob('/public/work/**/*')).map((k) => k.slice('/public'.length)))
const IMAGES = ITEMS.flatMap((it) => (it.images ?? []).map((img) => ({ id: it.id, ...img })))

describe('resume images', () => {
  it('live in public/work/<item id>/ and exist', () => {
    for (const { id, src } of IMAGES) {
      expect(src, id).toMatch(new RegExp(`^/work/${id}/`))
      expect(FILES.has(src), `${src} is missing`).toBe(true)
    }
  })
  it('have alt text and a size', () => {
    for (const { src, alt, w, h } of IMAGES) {
      expect(alt.trim(), src).not.toBe('')
      expect(w, src).toBeGreaterThan(0)
      expect(h, src).toBeGreaterThan(0)
    }
  })
})
