// 08 ─ spin
import { E, clamp, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { typing } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { centre } from '../../lib/centre'
import type { SceneSpec } from '../../model/types'
import { LINE_IT } from './lineIt'

export const spin: SceneSpec = {
  id: 'spin',
  len: 3,
  text: 'scroll and it spins',
  view: (f) => {
    const { L, lb } = f
    const t = typing(f, LINE_IT, 0, 0.55)
    const S = fit('SPIN', Math.min((L.W - 2 * L.M) * 0.8, L.H * 0.78), L.H * 0.3)
    const p = centre(L, S, 0.55)
    const th = (x: number) => 360 * E.inOutCubic(span(0.7, 2.5, x))
    const t0 = th(lb)
    const vel = Math.abs(t0 - th(lb - 0.06))
    const blur = clamp(vel / 25) * (0.35 + 0.65 * clamp(Math.abs(f.v) / 2))
    return {
      cap: `rotate(word, ${t0.toFixed(1)}deg)`,
      node: (
        <>
          <Code x={L.M} y={L.TY} segs={LINE_IT} n={t.n} caret={t.caret} />
          {[4, 3, 2, 1].map((k) => (
            <Word key={k} text="SPIN" fs={S.fs} x={p.x} y={p.y} style={{ opacity: (blur * 0.3) / k, transform: `rotate(${th(lb - k * 0.035).toFixed(2)}deg)`, transformOrigin: '50% 50%' }} />
          ))}
          <Word text="SPIN" fs={S.fs} x={p.x} y={p.y} style={{ transform: `rotate(${t0.toFixed(2)}deg)`, transformOrigin: '50% 50%' }} />
        </>
      ),
    }
  },
}
