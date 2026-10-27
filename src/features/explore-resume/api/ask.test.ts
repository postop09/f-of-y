import { afterEach, describe, expect, it, vi } from 'vitest'
import { CATEGORIES } from '@/entities/resume'
import { ask } from './ask'

const reply = (status: number, body: unknown) => vi.fn(async () => new Response(JSON.stringify(body), { status }))

const CATS = { ...Object.fromEntries(CATEGORIES.map((c) => [c.id, 0.02])), ops: 0.9 }

afterEach(() => vi.unstubAllGlobals())

describe('ask', () => {
  it('uses the server answer when it has the right shape, dropping unknown items', async () => {
    const body = { source: 'jev', model: 'jev-1.13.0', category: 'ops', categories: CATS, items: [{ id: 'sm-sentry', p: 0.8 }, { id: 'gone', p: 0.1 }], aboutResume: 0.95 }
    const fetch = reply(200, body)
    vi.stubGlobal('fetch', fetch)
    const r = await ask('  장애 대응은? ')
    expect(fetch).toHaveBeenCalledWith('/api/explore', expect.objectContaining({ method: 'POST', body: JSON.stringify({ q: '장애 대응은?' }) }))
    expect(r.source).toBe('jev')
    expect(r.items.map((it) => it.id)).toEqual(['sm-sentry'])
  })
  it('falls back to the keyword match when the server answer is missing categories', async () => {
    vi.stubGlobal('fetch', reply(200, { source: 'jev', category: 'ops', categories: { ops: 0.9 }, items: [], aboutResume: 0.95 }))
    const r = await ask('Sentry 써 봤어요?')
    expect(r.source).toBe('local')
  })
  it('falls back to the keyword match when the server has no key', async () => {
    vi.stubGlobal('fetch', reply(503, { error: 'jev_not_configured' }))
    const r = await ask('Sentry 써 봤어요?')
    expect(r.source).toBe('local')
    expect(r.items[0].id).toBe('sm-sentry')
  })
  it('falls back when the server answers something else', async () => {
    vi.stubGlobal('fetch', reply(200, { hello: 'world' }))
    expect((await ask('디자인 시스템')).source).toBe('local')
  })
  it('falls back when there is no server at all', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))))
    expect((await ask('디자인 시스템')).source).toBe('local')
  })
})
