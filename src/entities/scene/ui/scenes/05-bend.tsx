// 05 ─ bend: a curve whose handle is pulled by the scroll; the word rides it
import { E, lerp, range, span } from '@/shared/lib/math'
import { type Seg, typing } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Cursor } from '@/shared/ui/Cursor'
import type { SceneSpec } from '../../model/types'
import './05-bend.css'

type Pt = [number, number]
export const bend: SceneSpec = {
  id: 'bend',
  len: 4,
  text: "i don't bend a curve",
  view: (f) => {
    const { L, lb } = f
    const segs: Seg[] = [["i don't bend a ", ''], ['curve', 'sig']]
    const t = typing(f, segs, 0, 0.8)
    const gx = L.M + L.mono * 1.2
    const gy = L.TY + L.mono * 2.4
    const G = { x: gx, y: gy, w: L.W - L.M - gx, h: Math.max(120, Math.min(L.H * 0.5, L.H - gy - L.H * 0.14 - 20)) }
    const P0: Pt = [G.x, G.y + G.h * 0.92]
    const P3: Pt = [G.x + G.w, G.y + G.h * 0.06]
    const k = E.outBack(span(0.9, 2.2, lb))
    const mix = (a: Pt, b2: Pt, m: number): Pt => [lerp(a[0], b2[0], m), lerp(a[1], b2[1], m)]
    const H1 = mix(mix(P0, P3, 1 / 3), [G.x + G.w * 0.56, P0[1] + G.h * 0.03], k)
    const H2 = mix(mix(P0, P3, 2 / 3), [G.x + G.w * 0.44, P3[1]], k)
    const d = `M${P0} C${H1} ${H2} ${P3}`
    const off = lerp(14, 58, E.inOutCubic(span(2.3, 3.9, lb)))
    const op = span(0.7, 1, lb)
    const fs = Math.max(20, Math.min(G.h * 0.17, G.w * 0.09))
    const grab = lb > 0.85 && lb < 2.3
    return {
      cap: lb < 0.9 ? `type("i don't bend a curve")` : lb < 2.3 ? `curve.bend(${(k * 1.05).toFixed(2)})` : `text.along(curve, ${off.toFixed(0)}%)`,
      node: (
        <>
          <Code x={L.M} y={L.TY} segs={segs} n={t.n} caret={t.caret} />
          <svg className="bend" style={{ opacity: op }} width={L.W} height={L.H} aria-hidden="true">
            {range(0, 8).map((i) => <line key={'v' + i} className="grid-ln" x1={G.x + (G.w * i) / 8} x2={G.x + (G.w * i) / 8} y1={G.y} y2={G.y + G.h} />)}
            {range(0, 5).map((i) => <line key={'h' + i} className="grid-ln" x1={G.x} x2={G.x + G.w} y1={G.y + (G.h * i) / 5} y2={G.y + (G.h * i) / 5} />)}
            <text className="axis-lb" x={G.x + 6} y={G.y + 14}>value</text>
            <text className="axis-lb" x={G.x + G.w - 6} y={G.y + G.h - 8} textAnchor="end">time</text>
            <line className="handle-ln" x1={P0[0]} y1={P0[1]} x2={H1[0]} y2={H1[1]} />
            <line className="handle-ln" x1={P3[0]} y1={P3[1]} x2={H2[0]} y2={H2[1]} />
            <path id="bend-path" className="curve" d={d} />
            <text className="svgword" style={{ fontSize: fs }} dy={-fs * 0.12}>
              <textPath href="#bend-path" startOffset={`${off}%`} textAnchor="middle">BEND</textPath>
            </text>
            <rect className="pt" x={P0[0] - 4} y={P0[1] - 4} width="8" height="8" />
            <rect className="pt" x={P3[0] - 4} y={P3[1] - 4} width="8" height="8" />
            <circle className="h-open" cx={H2[0]} cy={H2[1]} r="5" />
            <circle className="h-on" cx={H1[0]} cy={H1[1]} r={grab ? 7 : 5} />
          </svg>
          {grab && <Cursor x={H1[0] + 2} y={H1[1] + 4} />}
        </>
      ),
    }
  },
}
