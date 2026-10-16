import { describe, expect, it } from 'vitest'
import { findSceneIndex } from './findSceneIndex'

const scenes = [{ at: 0 }, { at: 4 }, { at: 8 }, { at: 12 }]

describe('findSceneIndex', () => {
  it('picks the last scene whose start is at or before u', () => {
    expect(findSceneIndex(scenes, 0)).toBe(0)
    expect(findSceneIndex(scenes, 3.99)).toBe(0)
    expect(findSceneIndex(scenes, 4)).toBe(1)
    expect(findSceneIndex(scenes, 11)).toBe(2)
    expect(findSceneIndex(scenes, 100)).toBe(3)
  })
  it('falls back to the first scene for negative u', () => {
    expect(findSceneIndex(scenes, -1)).toBe(0)
  })
})
