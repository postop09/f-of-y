// 07 ─ split: an outline fills, a blade cuts, the halves drift
import { E, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { centre } from '../../lib/centre'
import type { SceneSpec } from '../../model/types'
import { LINE_IT } from './lineIt'

export const split: SceneSpec = {
  id: 'split',
  len: 4,
  text: 'scroll and it splits',
  // the outline fills over two beats, the blade sweeps in, and cuts on beat 4
  sfx: [[2.5, 'whoosh'], [3, 'shing']],
  view: (f) => {
    const { L, lb } = f
    const S = fit('SPLIT', (L.W - 2 * L.M) * 0.86, L.H * 0.3)
    const p = centre(L, S, 0.55)
    const fill = E.inOutCubic(span(0, 2, lb))
    const blade = E.outCubic(span(2.5, 3, lb))
    const e = E.outExpo(span(3, 3.5, lb)) + 0.6 * span(3.5, 4, lb)
    const dx = e * S.w * 0.05
    const dy = e * S.fs * 0.06
    const cut = lb >= 3
    return {
      cap: lb < 2 ? 'layout(word("SPLIT"))' : lb < 3 ? 'blade.cut(y = 0.5)' : `clip(y < 0.5).x += ${dx.toFixed(0)}px`,
      flash: cut ? 0.12 * (1 - span(3, 3.25, lb)) : 0,
      shake: cut ? 10 * (1 - span(3, 3.25, lb)) : 0,
      node: (
        <>
          <Code x={L.M} y={L.TY} segs={LINE_IT} caret={f.blink && lb < 2.5} />
          {!cut && <Word className="ghost" text="SPLIT" fs={S.fs} x={p.x} y={p.y} />}
          {!cut && <Word text="SPLIT" fs={S.fs} x={p.x} y={p.y} style={{ clipPath: `inset(-10% ${((1 - fill) * 105).toFixed(2)}% -10% -5%)` }} />}
          {cut && (
            <>
              <Word text="SPLIT" fs={S.fs} x={p.x} y={p.y} style={{ clipPath: 'inset(-10% -5% 50% -5%)', transform: `translate(${dx.toFixed(1)}px,${(-dy).toFixed(1)}px) rotate(${(-0.6 * e).toFixed(3)}deg)` }} />
              <Word text="SPLIT" fs={S.fs} x={p.x} y={p.y} style={{ clipPath: 'inset(50% -5% -10% -5%)', transform: `translate(${(-dx).toFixed(1)}px,${dy.toFixed(1)}px) rotate(${(0.6 * e).toFixed(3)}deg)` }} />
            </>
          )}
          {blade > 0 && <div className="bar sigbg" style={{ left: 0, top: p.y + S.fs * 0.4 - 1, width: blade * L.W, height: 2, opacity: 1 - span(3.05, 3.5, lb) }} />}
        </>
      ),
    }
  },
}
