// 19 ─ done.
import { E, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { type Seg, typing } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import type { SceneSpec } from '../../model/types'

export const done: SceneSpec = {
  id: 'done',
  len: 3,
  text: "and it's done. // render complete",
  view: (f) => {
    const { L, lb } = f
    const segs: Seg[] = [["and it's", '']]
    const t = typing(f, segs, 0, 0.45, 1)
    const D = fit('DONE', (L.W - 2 * L.M) * 0.62, L.H * 0.26)
    const x = L.W / 2 - D.w / 2
    const y = L.H * 0.42
    const ds = D.fs * 0.16
    const dot = E.outBack(span(1, 1.25, lb))
    const cm: Seg[] = [['// render complete', 'dim']]
    const c = typing(f, cm, 1.4, 0.6)
    return {
      cap: lb < 1 ? 'await render()' : 'process.exit(0)',
      shake: lb > 1 ? 8 * (1 - span(1, 1.2, lb)) : 0,
      node: (
        <>
          <Code x={x} y={y - L.mono * 2.4} segs={segs} n={t.n} caret={t.caret} />
          <Word
            text="DONE"
            fs={D.fs}
            x={x}
            y={y}
            ch={(i) => {
              const a = span(0.45 + i * 0.08, 0.75 + i * 0.08, lb)
              return { style: { opacity: a > 0 ? 1 : 0, transform: `translateY(${((1 - E.outCubic(a)) * 0.4 * D.fs).toFixed(1)}px)` } }
            }}
          />
          {dot > 0 && <div className="bar sigbg" style={{ left: x + D.w + D.fs * 0.04, top: y + 0.734 * D.fs - ds, width: ds, height: ds, transform: `scale(${dot.toFixed(4)})` }} />}
          <Code x={x} y={y + D.fs * 0.95} segs={cm} n={c.n} caret={c.caret} />
        </>
      ),
    }
  },
}
