// 11 ─ snap back: two springs, stretched by their own velocity
import { clamp, lerp, springAt } from '@/shared/lib/math'
import { fit, textW } from '@/shared/lib/textMeasure'
import { Word } from '@/shared/ui/Word'
import type { SceneSpec } from '../../model/types'

export const snap: SceneSpec = {
  id: 'snap',
  len: 3,
  text: 'snap back',
  view: (f) => {
    const { L, lb } = f
    const fs = Math.min(fit('SNAP', (L.W - 2 * L.M) * 0.55, L.H * 0.24).fs, fit('BACK', (L.W - 2 * L.M) * 0.55, L.H * 0.24).fs)
    const wA = textW('SNAP', fs)
    const wB = textW('BACK', fs)
    const sp = (t0: number, x: number) => springAt(Math.max(0, x - t0), 9, 0.3)
    const word = (text: string, t0: number, from: number, to: number, y: number) => {
      const s = sp(t0, lb)
      const vel = (s - sp(t0, lb - 0.02)) / 0.02
      const st = 1 + clamp(Math.abs(vel) * 0.05, 0, 0.35)
      return { s, el: lb >= t0 && <Word key={text} text={text} fs={fs} x={lerp(from, to, s)} y={y} style={{ transform: `scale(${st.toFixed(3)},${(1 / Math.sqrt(st)).toFixed(3)})`, transformOrigin: '50% 50%' }} /> }
    }
    const a = word('SNAP', 0.1, -wA - 60, L.M, L.H * 0.26)
    const b = word('BACK', 0.7, L.W + 60, L.W - L.M - wB, L.H * 0.56)
    return { cap: `spring(k=81, ζ=0.30)  // x=${(lb < 0.7 ? a.s : b.s).toFixed(2)}`, node: <>{a.el}{b.el}</> }
  },
}
