// 04 ─ letters: an editor, then a word that moves only while you scroll
import { E, pad, range, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { type Seg, typing } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import type { SceneSpec } from '../../model/types'

type Row = { segs: Seg[]; at: number; dur: number } | null
export const letters: SceneSpec = {
  id: 'letters',
  len: 4,
  text: 'typed a little logic(); now the letters come alive',
  view: (f) => {
    const { L, lb } = f
    const rowH = L.mono * 1.55
    const x = L.M
    const y0 = L.TY - rowH * 1.6
    const rows: Row[] = [
      { segs: [[`// scene 04 · y = ${Math.round(f.y)}px`, 'dim']], at: -1, dur: 0.01 },
      null,
      { segs: [['typed', 'sig'], [' a little logic();', '']], at: 0, dur: 1 },
      { segs: [['now the', '']], at: 1.05, dur: 0.35 },
      { segs: [['letters come ', ''], ['alive', 'sig']], at: 2.2, dur: 0.6 },
    ]
    const cur = lb < 1.05 ? 2 : lb < 2.2 ? 3 : 4
    const hx = Math.max(0, x - L.mono * 3)
    const top = y0 + rowH * 5.6
    const h = Math.max(36, Math.min(L.H * 0.22, L.H - top - L.H * 0.14 - 30))
    const W0 = fit('LETTERS', L.W - 2 * L.M, h)
    const amp = span(2.2, 2.8, lb)
    let crest = 0
    let best = -2
    const ph = (i: number) => Math.PI * 2 * (lb - 2.2) - i * 0.8
    range(0, 6).forEach((i) => {
      const s = Math.sin(ph(i))
      if (s > best) [best, crest] = [s, i]
    })
    return {
      cap: lb < 1.05 ? 'typed("a little logic")' : lb < 2.2 ? 'compile("letters")' : `letters.forEach((l, i) => l.y = sin(2πy − .8i))  // wght ${Math.round(900 - 450 * amp * (0.5 + 0.5 * best))}`,
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
            const t = typing(f, r.segs, r.at, r.dur)
            return <Code key={i} x={x} y={y0 + i * rowH} segs={r.segs} n={t.n} caret={i === cur && t.caret} />
          })}
          {lb >= 1.4 && (
            <Word
              text="LETTERS"
              fs={W0.fs}
              x={x}
              y={top}
              ch={(i) => {
                const a = span(1.4 + i * 0.05, 1.8 + i * 0.05, lb)
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
