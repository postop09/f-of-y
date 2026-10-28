import { describe, expect, it } from 'vitest'
import { type ExploreResult, itemsIn } from '@/entities/resume'
import { MIN_ABOUT, MIN_P, SURE_P, commandLine, picked } from './turns'

const res = (over: Partial<ExploreResult>): ExploreResult => ({
  source: 'jev',
  category: 'ops',
  categories: { ux: 0, ui: 0, ai: 0, arch: 0, ops: 1, team: 0 },
  items: [],
  aboutResume: 0.9,
  ...over,
})

describe('picked', () => {
  it('shows nothing for a question that is not about the resume', () => {
    expect(picked(res({ aboutResume: MIN_ABOUT - 0.01, items: [{ id: 'sm-sentry', p: SURE_P - 0.01 }] }))).toEqual([])
  })
  it('still shows a sure item when the relevance is low (one-word questions like "ai")', () => {
    const out = picked(res({ aboutResume: MIN_ABOUT - 0.05, items: [{ id: 'bigglz-ai', p: SURE_P }, { id: 'sm-sentry', p: 0.01 }] }))
    expect(out.map((x) => [x.item.id, x.p])).toEqual([['bigglz-ai', SURE_P]])
  })
  it('keeps items at or above MIN_P, in order, with their p', () => {
    const out = picked(res({ items: [{ id: 'sm-sentry', p: 0.8 }, { id: 'bigglz-ai', p: MIN_P }, { id: 'tuneit-ds', p: 0.1 }] }))
    expect(out.map((x) => [x.item.id, x.p])).toEqual([['sm-sentry', 0.8], ['bigglz-ai', MIN_P]])
  })
  it('falls back to the chosen category when no item is strong enough', () => {
    const out = picked(res({ items: [{ id: 'sm-sentry', p: 0.05 }] }))
    expect(out.map((x) => x.item)).toEqual(itemsIn('ops'))
    expect(out.every((x) => x.p === undefined)).toBe(true)
  })
})

describe('commandLine', () => {
  it('echoes the question', () => expect(commandLine({ kind: 'ask', q: 'AI?', r: null })).toBe('AI?'))
  it('lists a category by label', () => expect(commandLine({ kind: 'cat', cat: 'ops' })).toBe('ls categories/운영 안정성'))
  it('prints the command name', () => expect(commandLine({ kind: 'all' })).toBe('all'))
})
