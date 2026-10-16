// 장면을 순서대로 쌓는다: 각 장면의 at은 앞 장면들 len의 합, total은 전체 길이 (스크롤 단위).
import type { Scene, SceneSpec } from '../model/types'

export const stackScenes = (specs: readonly SceneSpec[]): { scenes: Scene[]; total: number } => {
  let at = 0
  const scenes = specs.map((s) => {
    const sc = { ...s, at }
    at += s.len
    return sc
  })
  return { scenes, total: at }
}
