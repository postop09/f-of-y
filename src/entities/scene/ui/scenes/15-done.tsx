// 15 ─ done.
import { E, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { type Seg, typeOn } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'

export const done: SceneSpec = {
  id: 'done',
  len: 6,
  text: "and it's done. // render complete",
  // DONE drops from beat 3, the dot lands on beat 4, then the comment on thirty-seconds
  sfx: [...typeCues("and it's", 0), [3, 'enter'], ...typeCues('// render complete', 3.5)],
  view: (f) => {
    const { L, lb } = f
    const segs: Seg[] = [["and it's", '']]
    const t = typeOn(f, segs, 0, 3)
    const D = fit('DONE', (L.W - 2 * L.M) * 0.62, L.H * 0.26)
    const x = L.W / 2 - D.w / 2
    const y = L.H * 0.42
    const ds = D.fs * 0.16
    const dot = E.outBack(span(3, 3.25, lb))
    const cm: Seg[] = [['// render complete', 'dim']]
    const c = typeOn(f, cm, 3.5)
    return {
      cap: lb < 3 ? 'await render()' : 'process.exit(0)',
      shake: lb > 3 ? 8 * (1 - span(3, 3.2, lb)) : 0,
      node: (
        <>
          <Code x={x} y={y - L.mono * 2.4} segs={segs} n={t.n} caret={t.caret} />
          <Word
            text="DONE"
            fs={D.fs}
            x={x}
            y={y}
            ch={(i) => {
              const a = span(2 + i * 0.125, 2.5 + i * 0.125, lb)
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
