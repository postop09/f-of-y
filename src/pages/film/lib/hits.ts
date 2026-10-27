// 클릭 히트: 박자에 맞춰 네모가 퍼지고 파편이 튄다(public/keyframe.html에서 가져옴). 캔버스 층에 그린다.
import { E, hash } from '@/shared/lib'

export type Hit = { x: number; y: number; /** 보이기 시작하는 시각 (performance.now 초) */ t: number; seed: number }

/** 히트 하나가 보이는 시간 (초) */
export const HIT_LIFE = 0.6

const burst = (g: CanvasRenderingContext2D, x: number, y: number, k: number, seed: number, n: number, R: number, size: number) => {
  if (k <= 0 || k >= 1) return
  const e = E.outCubic(k)
  for (let i = 0; i < n; i++) {
    const a = Math.PI + hash(seed, i) * Math.PI
    const r = (0.35 + 0.65 * hash(seed, i + 31)) * R * e
    const s = size * (1 - k)
    g.fillRect(x + Math.cos(a) * r - s / 2, y + Math.sin(a) * r * 0.55 - s / 2, s, s)
  }
}

/** 지난 히트는 버리고, 아직 남은 게 있으면 true */
export const pruneHits = (hits: Hit[], now: number) => {
  for (let i = hits.length - 1; i >= 0; i--) if (now - hits[i].t > HIT_LIFE) hits.splice(i, 1)
  return hits.length > 0
}

export const drawHits = (g: CanvasRenderingContext2D, hits: readonly Hit[], now: number, color: string) => {
  g.save()
  g.strokeStyle = color
  g.fillStyle = color
  g.lineWidth = 2
  for (const h of hits) {
    const q = now - h.t
    if (q < 0 || q > HIT_LIFE) continue
    const k = q / HIT_LIFE
    const s = 10 + 70 * E.outCubic(k)
    g.globalAlpha = 1 - k
    g.strokeRect(h.x - s / 2, h.y - s / 2, s, s)
    burst(g, h.x, h.y, k, h.seed, 8, 70, 7)
  }
  g.restore()
}
