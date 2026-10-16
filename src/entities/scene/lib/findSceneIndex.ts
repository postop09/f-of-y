// 스크롤 위치 u(단위)가 어느 장면에 속하는지. 뒤에서부터 찾으므로 경계는 뒤 장면 것.
export const findSceneIndex = (scenes: readonly { at: number }[], u: number) => {
  for (let i = scenes.length - 1; i >= 0; i--) if (u >= scenes[i].at) return i
  return 0
}
