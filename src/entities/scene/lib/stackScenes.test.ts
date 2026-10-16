import { describe, expect, it } from 'vitest'
import type { SceneSpec } from '../model/types'
import { stackScenes } from './stackScenes'

const spec = (id: string, len: number): SceneSpec => ({ id, len, text: id, view: () => ({ node: null, cap: id }) })

describe('stackScenes', () => {
  it('starts each scene where the previous one ends', () => {
    const { scenes, total } = stackScenes([spec('a', 4), spec('b', 3), spec('c', 5)])
    expect(scenes.map((s) => [s.id, s.at])).toEqual([['a', 0], ['b', 4], ['c', 7]])
    expect(total).toBe(12)
  })
  it('keeps the spec fields', () => {
    const a = spec('a', 2)
    const [sc] = stackScenes([a]).scenes
    expect(sc.view).toBe(a.view)
    expect(sc.text).toBe('a')
  })
  it('is empty for no scenes', () => {
    expect(stackScenes([])).toEqual({ scenes: [], total: 0 })
  })
})
