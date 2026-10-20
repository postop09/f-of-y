// 매 프레임 갱신되는 가변 상태. 렌더를 일으키지 않고 rAF 루프·이벤트 핸들러만 만진다.
import type { Hit } from '../lib/hits'

export type Motion = {
  /** 감쇠된 스크롤 위치 (단위) */
  u: number
  /** 속도 (단위/초) */
  v: number
  lastV: number
  last: number
  unitPx: number
  blink: boolean
  /** 렌더 없이 바뀐 것이 있어 다음 프레임에 setState가 필요함 */
  dirty: boolean
  jumpTo: number | null
  jumpAt: number
  scrubbing: boolean
  /** 자동 재생 중의 위치 (단위). null이면 스크롤이 시계다. */
  auto: number | null
  /** 글꼴까지 준비됨 */
  ready: boolean
  /** 사용자가 클릭·Space로 재생을 시작함 (소리를 켤 수 있는 첫 입력) */
  go: boolean
  /** 효과음을 여기(u)까지 울렸거나 예약했다 */
  sfxU: number
  hits: Hit[]
  /** 마우스 위치 (live 필드가 밀려난다) */
  ptr: { x: number; y: number; in: boolean }
  /** 영상 끝의 live 필드가 돌고 있다 */
  live: boolean
}

export const createMotion = (autoplay = false): Motion => ({
  u: 0,
  v: 0,
  lastV: 0,
  last: 0,
  unitPx: 0,
  blink: true,
  dirty: true,
  jumpTo: null,
  jumpAt: 0,
  scrubbing: false,
  auto: autoplay ? 0 : null,
  ready: false,
  go: false,
  sfxU: 0,
  hits: [],
  ptr: { x: -1e4, y: -1e4, in: false },
  live: false,
})

/** 렌더에 쓰는 프레임 스냅샷 */
export type FrameState = {
  u: number
  v: number
  now: number
  blink: boolean
  unitPx: number
  auto: boolean
  wait: boolean
  /** live 필드가 돌고 있으면 그 HUD 줄과 클릭의 흔들림·번쩍임 */
  live: { cap: string; shake: number; flash: number } | null
}
