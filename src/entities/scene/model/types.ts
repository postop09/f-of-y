// 장면 = 스크롤 위치의 순수 함수. { id, len, at, view(f), draw?(g, f) }
// len·at은 스크롤 단위(1단위 = 뷰포트 높이의 18%)이고, f.lb는 장면 안 위치라서
// 내리면 재생, 멈추면 정지, 올리면 되감긴다 — 시계도 키프레임도 없다.
import type { ReactNode } from 'react'
import type { Layout } from '@/shared/lib/layout'
import type { SfxKind } from '@/shared/lib/synth'
import type { Clock } from '@/shared/lib/typing'

export type Frame = Clock & {
  /** 장면 안 위치 (스크롤 단위) */
  lb: number
  /** 장면 진행률 0..1 */
  p: number
  len: number
  at: number
  /** 전체 스크롤 위치 (단위) */
  u: number
  /** 스크롤 속도 (단위/초) */
  v: number
  blink: boolean
  L: Layout
  /** 스크롤 위치 (px) */
  y: number
  /** 1 스크롤 단위의 px */
  unitPx: number
  /** 전체 장면 수 */
  count: number
  /** 처음부터 소리와 함께 다시 자동 재생 (클릭 핸들러 안에서만 부른다) */
  replay: () => void
}

/** 카메라: 초점(fx, fy)을 (px, py)로 옮기며 s배 확대 */
export type Cam = { s: number; fx: number; fy: number; px: number; py: number }

export type SceneOut = {
  node: ReactNode
  /** HUD 캡션 */
  cap: string
  flash?: number
  shake?: number
  cam?: Cam | null
  /** 밝은 종이 배경 */
  paper?: boolean
}

/** 효과음 신호: 장면 안 위치(lb)를 앞으로 지나갈 때 울린다. arg는 소리마다 다르다(tick·blip은 음높이, riser는 길이). */
export type Cue = readonly [lb: number, kind: SfxKind, arg?: number]

export type SceneDef = {
  /** 스크린리더용 대본 한 줄 */
  text: string
  /** 효과음 악보 */
  sfx?: readonly Cue[]
  view: (f: Frame) => SceneOut
  draw?: (g: CanvasRenderingContext2D, f: Frame) => void
}

/** 장면 파일 하나가 내보내는 것. at은 레지스트리가 순서대로 쌓으며 붙인다. */
export type SceneSpec = SceneDef & { id: string; len: number }

export type Scene = SceneSpec & { at: number }
