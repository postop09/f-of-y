// 매 프레임 갱신되는 가변 상태. 렌더를 일으키지 않고 rAF 루프·이벤트 핸들러만 만진다.
export type Pointer = { x: number; y: number; in: boolean }

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
  ptr: Pointer
}

export const createMotion = (): Motion => ({
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
  ptr: { x: -1e4, y: -1e4, in: false },
})

/** 렌더에 쓰는 프레임 스냅샷 */
export type FrameState = { u: number; v: number; now: number; blink: boolean; unitPx: number }
