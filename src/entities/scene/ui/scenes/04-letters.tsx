// 04 ─ letters: an editor, then a word that moves only while you scroll
import { E, pad, range, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { type Seg, typeOn } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'

type Row = { segs: Seg[]; at: number } | null
export const letters: SceneSpec = {
  id: 'letters',
  len: 8,
  text: 'typed a little logic(); now the letters come alive',
  // the wave runs at one cycle per beat once the last line is typed
  sfx: [...typeCues('typed a little logic();', 0), ...typeCues('now the', 3), [5, 'whoosh'], ...typeCues('letters come alive', 5.75)],
  view: (f) => {
    const { L, lb } = f
    const rowH = L.mono * 1.55
    const x = L.M
    const y0 = L.TY - rowH * 1.6
    const rows: Row[] = [
      { segs: [[`// scene 04 · y = ${Math.round(f.y)}px`, 'dim']], at: -Infinity },
      null,
      { segs: [['typed', 'sig'], [' a little logic();', '']], at: 0 },
      { segs: [['now the', '']], at: 3 },
      { segs: [['letters come ', ''], ['alive', 'sig']], at: 5.75 },
    ]
    const cur = lb < 3 ? 2 : lb < 5.75 ? 3 : 4
    const hx = Math.max(0, x - L.mono * 3)
    const top = y0 + rowH * 5.6
    const h = Math.max(36, Math.min(L.H * 0.22, L.H - top - L.H * 0.14 - 30))
    const W0 = fit('LETTERS', L.W - 2 * L.M, h)
    const amp = span(6, 7, lb)
    let crest = 0
    let best = -2
    const ph = (i: number) => Math.PI * 2 * (lb - 6) - i * 0.8
    range(0, 6).forEach((i) => {
      const s = Math.sin(ph(i))
      if (s > best) [best, crest] = [s, i]
    })
    return {
      cap: lb < 3 ? 'typed("a little logic")' : lb < 6 ? 'compile("letters")' : `letters.forEach((l, i) => l.y = sin(2πy − .8i))  // wght ${Math.round(900 - 450 * amp * (0.5 + 0.5 * best))}`,
      node: (
        <>
          {range(0, 5).map((i) => (
            <div key={i} className={'ln' + (i === cur ? ' cur' : '')} style={{ left: L.gx, top: y0 + i * rowH + L.mono * 0.14 }}>
              {pad(5 + i, 2)}
            </div>
          ))}
          <div className="rowhl" style={{ left: hx, top: y0 + cur * rowH - L.mono * 0.25, width: L.W - L.M * 0.5 - hx, height: L.mono * 1.5 }} />
          {rows.map((r, i) => {
            if (!r) return null
            const t = typeOn(f, r.segs, r.at)
            return <Code key={i} x={x} y={y0 + i * rowH} segs={r.segs} n={t.n} caret={i === cur && t.caret} />
          })}
          {lb >= 5 && (
            <Word
              text="LETTERS"
              fs={W0.fs}
              x={x}
              y={top}
              ch={(i) => {
                const a = span(5 + i * 0.125, 5.5 + i * 0.125, lb)
                const s = Math.sin(ph(i)) * amp
                const c = Math.cos(ph(i) + 0.5) * amp
                const y = (1 - E.outBack(a)) * 0.6 * W0.fs - s * 0.12 * W0.fs
                return {
                  sig: amp > 0 ? i === crest : i === 6 && a > 0.5,
                  w: 900 - 450 * amp * (0.5 + 0.5 * Math.sin(ph(i))),
                  d: 125 - 40 * amp * (0.5 + 0.5 * Math.cos(ph(i))),
                  style: { opacity: a > 0 ? 1 : 0, transform: `translateY(${y.toFixed(1)}px) rotate(${(c * 9).toFixed(2)}deg)` },
                }
              }}
            />
          )}
        </>
      ),
    }
  },
}
