// 장면이 돌려준 카메라·흔들림을 .world의 transform 문자열로. 흔들림은 스크롤 속도에 비례한다.
import type { Cam } from '@/entities/scene'
import { FX } from '@/shared/config'

type Out = { shake?: number; cam?: Cam | null }

export const worldTransform = (out: Out | null, speed: number, t: number, fx = FX) => {
  if (!out) return ''
  const a = Math.min(40, (out.shake || 0) * speed) * fx
  const sx = a * (Math.sin(t * 97.1) * 0.6 + Math.sin(t * 61.3 + 1.7) * 0.4)
  const sy = a * (Math.sin(t * 83.7 + 0.4) * 0.6 + Math.sin(t * 47.9 + 2.1) * 0.4)
  const c = out.cam
  const s = c ? c.s : 1
  const tx = (c ? c.px - c.fx * s : 0) + sx
  const ty = (c ? c.py - c.fy * s : 0) + sy
  if (s !== 1 || Math.abs(tx) > 0.01 || Math.abs(ty) > 0.01) return `translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) scale(${s.toFixed(4)})`
  return ''
}

export const flashOpacity = (out: { flash?: number } | null, speed: number, fx = FX) => (out ? Math.min(0.5, (out.flash || 0) * speed) * fx : 0)
