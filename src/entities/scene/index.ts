// 장면 슬라이스의 공개 API: 영상 페이지가 쓰는 것만. 슬라이스 안(장면 파일·lib)은 상대 경로로 가져오고 이 파일을 되가져오지 않는다.
export { CUES, SCENES, TOTAL, sceneAt } from './ui/score'
export { cuesBetween } from './lib/cues'
export { liveRaster } from './lib/liveWord'
export { music } from './model/music'
export type { Cam, Frame, Scene } from './model/types'
