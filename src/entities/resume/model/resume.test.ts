import { describe, expect, it } from 'vitest'
import { ITEMS } from './resume'

// public/ 에 실제로 있는 파일 (불러오지는 않고 경로만 본다)
const FILES = new Set(Object.keys(import.meta.glob('/public/work/**/*')).map((k) => k.slice('/public'.length)))
const MEDIA = ITEMS.flatMap((it) => (it.media ?? []).map((m) => ({ id: it.id, company: it.company, ...m })))

describe('resume media', () => {
  it('live in public/work/<company folder>/ and exist', () => {
    for (const { id, src } of MEDIA) {
      expect(src, id).toMatch(/^\/work\/[a-z0-9-]+\/[^/]+$/)
      expect(FILES.has(src), `${src} is missing`).toBe(true)
    }
  })
  it('keep one folder per company', () => {
    const folders = new Map<string, Set<string>>()
    for (const { company, src } of MEDIA) folders.set(company, (folders.get(company) ?? new Set()).add(src.split('/')[2]))
    for (const [company, set] of folders) expect([...set], company).toHaveLength(1)
  })
  it('have alt text and a size', () => {
    for (const { src, alt, w, h } of MEDIA) {
      expect(alt.trim(), src).not.toBe('')
      expect(w, src).toBeGreaterThan(0)
      expect(h, src).toBeGreaterThan(0)
    }
  })
  it('use web formats: images png/webp/jpg, videos mp4 (no .mov originals)', () => {
    for (const { kind, src } of MEDIA) expect(src, kind ?? 'image').toMatch(kind === 'video' ? /\.mp4$/ : /\.(png|webp|jpe?g)$/)
  })
})
