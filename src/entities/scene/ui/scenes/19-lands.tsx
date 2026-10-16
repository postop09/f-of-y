// 19 ─ lands right on cue
import { E, bump, hash, range, span } from '@/shared/lib/math'
import { fit, textW } from '@/shared/lib/textMeasure'
import { monoW } from '@/shared/lib/canvasText'
import { Word } from '@/shared/ui/Word'
import type { SceneSpec } from '../../model/types'
import './19-lands.css'

export const lands: SceneSpec = {
  id: 'lands',
  len: 4,
  text: 'lands right on cue',
  view: (f) => {
    const { L, lb } = f
    const LW = fit('LANDS', (L.W - 2 * L.M) * 0.72, L.H * 0.24)
    const x = L.W / 2 - LW.w / 2
    const y = L.H * 0.24
    const rx0 = L.M
    const rx1 = L.W - L.M
    const ry = L.H * 0.8
    const head = span(1.2, 3.6, lb)
    const marks = [0.12, 0.5, 0.88]
    const hit = (m: number) => 1.2 + m * 2.4
    const R = fit('RIGHT ON CUE', LW.w * 1.05, LW.fs * 0.42)
    const parts: [string, number][] = [['RIGHT ', 0], ['ON ', 1], ['CUE', 2]]
    let px = L.W / 2 - R.w / 2
    const line = E.outCubic(span(0.8, 1.2, lb))
    const label = (m: number) => `${Math.round((f.at + hit(m)) * f.unitPx)}px`
    return {
      cap: lb < 1.2 ? 'word("LANDS").drop()' : 'assert(hit === beat)  // ok',
      shake: 6 * range(0, 4).reduce((a, i) => a + bump(i * 0.08 + 0.38, i * 0.08 + 0.5, lb), 0) + 8 * marks.reduce((a, m) => a + bump(hit(m), hit(m) + 0.12, lb), 0),
      node: (
        <>
          <Word
            text="LANDS"
            fs={LW.fs}
            x={x}
            y={y}
            ch={(i) => {
              const a = span(i * 0.08, i * 0.08 + 0.45, lb)
              const sq = bump(i * 0.08 + 0.38, i * 0.08 + 0.55, lb) * 0.18
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
          <div className="ruler" style={{ left: rx0, top: ry, width: rx1 - rx0, opacity: span(0.9, 1.2, lb) }}>
            {marks.map((m) => (
              <span key={m} style={{ left: `${m * 100}%` }}>
                <i className={lb >= hit(m) ? 'on' : ''} />
                {label(m)}
              </span>
            ))}
            <b style={{ left: `${head * 100}%` }} />
          </div>
          {lb >= hit(0.88) && <div className="code small sig" style={{ left: rx1 - monoW('offset 0px', L.mono * 0.68), top: ry + L.mono * 1.8 }}>offset 0px</div>}
        </>
      ),
    }
  },
}
