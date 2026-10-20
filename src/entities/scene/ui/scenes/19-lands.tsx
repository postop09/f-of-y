// 19 ─ lands right on cue
import { E, bump, hash, range, span } from '@/shared/lib/math'
import { fit, textW } from '@/shared/lib/textMeasure'
import { monoW } from '@/shared/lib/canvasText'
import { Word } from '@/shared/ui/Word'
import type { Cue, SceneSpec } from '../../model/types'
import './19-lands.css'

// the playhead crosses the ruler over the whole scene, so the three marks fall on beats 2, 3 and 4
const MARKS = [0.25, 0.5, 0.75]
const hit = (m: number) => m * 4
/** each letter bounces in over 11/16 of a beat, touching down a sixteenth after the last */
const touch = (i: number) => 0.25 + i * 0.125

export const lands: SceneSpec = {
  id: 'lands',
  len: 4,
  text: 'lands right on cue',
  sfx: [...range(0, 4).map((i): Cue => [touch(i), 'thud', i]), ...MARKS.flatMap((m, j): Cue[] => [[hit(m), 'hit'], [hit(m), 'blip', j * 2]])],
  view: (f) => {
    const { L, lb } = f
    const LW = fit('LANDS', (L.W - 2 * L.M) * 0.72, L.H * 0.24)
    const x = L.W / 2 - LW.w / 2
    const y = L.H * 0.24
    const rx0 = L.M
    const rx1 = L.W - L.M
    const ry = L.H * 0.8
    const head = span(0, 4, lb)
    const marks = MARKS
    const R = fit('RIGHT ON CUE', LW.w * 1.05, LW.fs * 0.42)
    const parts: [string, number][] = [['RIGHT ', 0], ['ON ', 1], ['CUE', 2]]
    let px = L.W / 2 - R.w / 2
    const line = E.outCubic(span(0.75, 1.25, lb))
    const label = (m: number) => `${Math.round((f.at + hit(m)) * f.unitPx)}px`
    return {
      cap: lb < 1 ? 'word("LANDS").drop()' : 'assert(hit === beat)  // ok',
      shake: 6 * range(0, 4).reduce((a, i) => a + bump(touch(i), touch(i) + 0.125, lb), 0) + 8 * marks.reduce((a, m) => a + bump(hit(m), hit(m) + 0.12, lb), 0),
      node: (
        <>
          <Word
            text="LANDS"
            fs={LW.fs}
            x={x}
            y={y}
            ch={(i) => {
              const a = span(i * 0.125, i * 0.125 + 0.6875, lb)
              const sq = bump(touch(i), touch(i) + 0.1875, lb) * 0.18
              return { style: { opacity: a > 0 ? 1 : 0, transform: `translateY(${(-(1 - E.outBounce(a)) * L.H * 0.6).toFixed(1)}px) scale(${(1 + sq * 0.7).toFixed(3)},${(1 - sq).toFixed(3)})` } }
            }}
          />
          <div className="bar sigbg" style={{ left: x, top: y + LW.fs * 0.82, width: LW.w * line, height: 2 }} />
          {range(0, 39).map((i) => {
            const k = span(0.9 + i * 0.012, 1.1 + i * 0.012, lb)
            return k > 0 && <i key={i} className="onset" style={{ left: x + LW.w * hash(i, 21), top: y + LW.fs * 0.82 + 4, height: (3 + hash(i, 22) * LW.fs * 0.12) * k }} />
          })}
          {parts.map(([w, j]) => {
            const k = E.outBack(span(hit(marks[j]), hit(marks[j]) + 0.15, lb))
            const el = (
              <Word key={j} text={w.trim()} fs={R.fs} x={px} y={y + LW.fs * 1.08} ch={() => ({ sig: j === 2 })} style={{ opacity: k > 0 ? 1 : 0, transform: `scale(${k.toFixed(4)})`, transformOrigin: '50% 100%' }} />
            )
            px += textW(w, R.fs)
            return el
          })}
          <div className="ruler" style={{ left: rx0, top: ry, width: rx1 - rx0, opacity: span(0, 0.25, lb) }}>
            {marks.map((m) => (
              <span key={m} style={{ left: `${m * 100}%` }}>
                <i className={lb >= hit(m) ? 'on' : ''} />
                {label(m)}
              </span>
            ))}
            <b style={{ left: `${head * 100}%` }} />
          </div>
          {lb >= hit(0.75) && <div className="code small sig" style={{ left: rx1 - monoW('offset 0px', L.mono * 0.68), top: ry + L.mono * 1.8 }}>offset 0px</div>}
        </>
      ),
    }
  },
}
