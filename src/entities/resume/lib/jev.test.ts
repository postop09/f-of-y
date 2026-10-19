import { describe, expect, it } from 'vitest'
import { CATEGORIES, ITEMS } from '../model/resume'
import { buildJevRequest, cleanQuery, isExploreResult, MAX_QUERY, readJevResponse } from './jev'

describe('cleanQuery', () => {
  it('trims, collapses spaces and caps the length', () => {
    expect(cleanQuery('  디자인   시스템 ')).toBe('디자인 시스템')
    expect(cleanQuery('x'.repeat(500))).toHaveLength(MAX_QUERY)
  })
  it('rejects empty and non-strings', () => {
    expect(cleanQuery('   ')).toBeNull()
    expect(cleanQuery(42)).toBeNull()
    expect(cleanQuery(undefined)).toBeNull()
  })
})

describe('buildJevRequest', () => {
  const req = buildJevRequest('AI를 어떻게 쓰나요?')
  it('puts the question in the state', () => {
    expect(req.state.visitor_question).toBe('AI를 어떻게 쓰나요?')
    expect(req.model).toBe('jev-latest')
  })
  it('asks for a category out of all six', () => {
    expect(req.questions.category.type).toBe('choice')
    expect(Object.keys(req.questions.category.criteria)).toEqual(CATEGORIES.map((c) => c.id))
  })
  it('asks for an item out of every project plus none', () => {
    expect(Object.keys(req.questions.item.criteria)).toEqual([...ITEMS.map((it) => it.id), 'none'])
  })
  it('asks whether the question is about the resume', () => {
    expect(req.questions.about_resume.type).toBe('noul')
  })
})

const jevAnswer = (cat: Record<string, number>, items: Record<string, number>, noul: number) => ({
  model: 'jev-1.13.0',
  answers: {
    category: { type: 'choice', choice: 'x', probabilities: cat, confidence: 0.8 },
    item: { type: 'choice', choice: 'x', probabilities: items, confidence: 0.8 },
    about_resume: { type: 'noul', noul },
  },
  usage: { input_tokens: 1, output_tokens: 1 },
})

describe('readJevResponse', () => {
  it('picks the most likely category and the top three items, without none', () => {
    const r = readJevResponse(jevAnswer({ ai: 0.7, team: 0.2, ux: 0.1 }, { none: 0.5, 'bigglz-ai': 0.3, 'sm-process': 0.15, 'tuneit-ds': 0.04, 'sm-sentry': 0.01 }, 0.93))
    expect(r).not.toBeNull()
    expect(r?.source).toBe('jev')
    expect(r?.model).toBe('jev-1.13.0')
    expect(r?.category).toBe('ai')
    expect(r?.categories.arch).toBe(0)
    expect(r?.items.map((it) => it.id)).toEqual(['bigglz-ai', 'sm-process', 'tuneit-ds'])
    expect(r?.aboutResume).toBe(0.93)
    expect(isExploreResult(r)).toBe(true)
  })
  it('returns null for a response of another shape', () => {
    expect(readJevResponse({ answers: {} })).toBeNull()
    expect(readJevResponse(null)).toBeNull()
    expect(readJevResponse({ answers: { category: {}, item: {}, about_resume: { noul: 'yes' } } })).toBeNull()
  })
})

describe('isExploreResult', () => {
  it('rejects unknown categories and malformed items', () => {
    const ok = { source: 'jev', category: 'ux', categories: {}, items: [{ id: 'a', p: 0.5 }], aboutResume: 1 }
    expect(isExploreResult(ok)).toBe(true)
    expect(isExploreResult({ ...ok, category: 'sales' })).toBe(false)
    expect(isExploreResult({ ...ok, items: [{ id: 1 }] })).toBe(false)
    expect(isExploreResult({ error: 'jev_not_configured' })).toBe(false)
  })
})
