// 14 ─ one take
import { E, span, springAt } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { Word } from '@/shared/ui/Word'
import type { SceneSpec } from '../../model/types'
import './14-take.css'

export const take: SceneSpec = {
  id: 'take',
  len: 3,
  text: 'one take',
  view: (f) => {
    const { L, lb } = f
    const T = fit('TAKE', (L.W - 2 * L.M) * 0.42, L.H * 0.2)
    const y = L.H * 0.3
    const bw = Math.min((L.W - 2 * L.M) * 0.34, L.H * 0.55)
    const bh = L.H * 0.6
    const bx = L.W - L.M - bw
    const by = L.H * 0.2
    const one = fit('1', bw * 0.72, bh * 0.82, 900, 62)
    const s = springAt(lb - 0.8, 12, 0.35)
    const pop = (a: number, b: number) => {
      const k = span(a, b, lb)
      return { opacity: k > 0 ? 1 : 0, transform: `translateY(${((1 - E.outBack(k)) * 0.5 * T.fs).toFixed(1)}px)` }
    }
    return {
      cap: 'takes.length === 1  // no retakes',
      shake: lb > 0.8 ? 12 * (1 - span(0.8, 1.1, lb)) : 0,
      node: (
        <>
          <Word text="ONE" fs={T.fs} x={L.M} y={y} style={pop(0.1, 0.4)} />
          <Word text="TAKE" fs={T.fs} x={L.M} y={y + T.fs * 0.85} style={pop(0.35, 0.65)} />
          <div className="takebox" style={{ left: bx, top: by, width: bw, height: bh, opacity: span(0.5, 0.75, lb) }}>
            <span className="code small dim" style={{ left: 10, top: 8 }}>TAKE</span>
            <span className="code small dim" style={{ right: 10, top: 8, left: 'auto' }}>01 / 01</span>
          </div>
          {lb >= 0.8 && <Word text="1" fs={one.fs} x={bx + bw / 2 - one.w / 2} y={by + bh / 2 - one.fs * 0.38} d={62} ch={() => ({ sig: true })} style={{ transform: `scale(${s.toFixed(4)})`, transformOrigin: '50% 60%' }} />}
        </>
      ),
    }
  },
}
