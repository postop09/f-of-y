// 11 ─ every one: sixty frame cells, filled in order
import { E, pad, range, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { type Seg, typeOn } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { Cue, SceneSpec } from '../../model/types'
import './11-everyone.css'

export const everyone: SceneSpec = {
  id: 'everyone',
  len: 4,
  text: 'a second, and i wrote every one',
  // six frames per sixteenth from beat 2; EVERY drops on beat 3, ONE on beat 4
  sfx: [...typeCues('a second, and i wrote', 0), ...range(1, 10).map((k): Cue => [1 + k / 4, 'tick', k]), [2, 'whoosh'], [3, 'thud']],
  view: (f) => {
    const { L, lb } = f
    const segs: Seg[] = [['a second, and i ', ''], ['wrote', 'sig']]
    const t = typeOn(f, segs, 0)
    const gy = L.TY + L.mono * 1.4
    const G = { x: L.M, y: gy, w: L.W - 2 * L.M, h: Math.max(120, Math.min(L.H * 0.52, L.H - gy - L.H * 0.14)) }
    const cw = G.w / 10
    const chh = G.h / 6
    const done = Math.floor(60 * span(1, 3.5, lb) + 1e-6)
    const EV = fit('EVERY ONE', G.w * 0.92, G.h * 0.36)
    return {
      cap: lb < 1 ? 'for (f = 0; f < 60; f++)  // 60' : `write(frame[${Math.max(0, done - 1)}])  // ${done}/60`,
      node: (
        <>
          <Code x={L.M} y={L.TY - L.mono * 1.2} segs={segs} n={t.n} caret={t.caret} />
          {range(0, 59).map((i) => {
            const a = span(0.35 + i * 0.012, 0.55 + i * 0.012, lb)
            if (a <= 0) return null
            const c = i % 10
            const r = Math.floor(i / 10)
            return (
              <div key={i} className={'fcell' + (i < done ? ' on' : '')} style={{ left: G.x + c * cw, top: G.y + r * chh, width: cw - 4, height: chh - 4, opacity: a }}>
                <span className="fno">{pad(i + 1, 2)}</span>
                <i className="fdot" style={{ left: `${10 + 78 * (i / 59)}%`, top: `${50 + 28 * Math.sin(i * 0.45)}%` }} />
              </div>
            )
          })}
          {lb >= 2 && (
            <Word
              className="outlined"
              text="EVERY ONE"
              fs={EV.fs}
              x={G.x + G.w / 2 - EV.w / 2}
              y={G.y + G.h / 2 - EV.fs * 0.4}
              ch={(i) => {
                const a0 = i < 6 ? 2 + i * 0.125 : 3 + (i - 6) * 0.125
                const a = span(a0, a0 + 0.25, lb)
                return { style: { opacity: a > 0 ? 1 : 0, transform: `translateY(${((1 - E.outBack(a)) * 0.5 * EV.fs).toFixed(1)}px)` } }
              }}
            />
          )}
        </>
      ),
    }
  },
}
