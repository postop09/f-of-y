import { describe, expect, it } from 'vitest'
import { localMatch } from './localMatch'

describe('localMatch', () => {
  it('finds the design system for a design system question', () => {
    const r = localMatch('디자인 시스템을 만들어 본 적 있나요?')
    expect(r.source).toBe('local')
    expect(r.items[0].id).toBe('tuneit-ds')
    expect(r.category).toBe('ui')
  })
  it('routes sentry to operations', () => {
    const r = localMatch('Sentry 써 봤어요?')
    expect(r.items[0].id).toBe('sm-sentry')
    expect(r.category).toBe('ops')
  })
  it('routes AI questions to the AI work, with a particle stuck to the word', () => {
    const r = localMatch('AI를 개발에 어떻게 쓰나요?')
    expect(r.items[0].id).toBe('bigglz-ai')
    expect(r.category).toBe('ai')
  })
  it('does not find "ai" inside other latin words', () => {
    expect(localMatch('tell me the details').items).toEqual([])
  })
  it('marks an unrelated question as not about the resume', () => {
    const r = localMatch('오늘 날씨 어때요?')
    expect(r.items).toEqual([])
    expect(r.aboutResume).toBeLessThan(0.5)
  })
  it('gives probabilities that sum to one', () => {
    const r = localMatch('모노레포와 협업 프로세스')
    expect(Object.values(r.categories).reduce((a, b) => a + b, 0)).toBeCloseTo(1)
  })
})
