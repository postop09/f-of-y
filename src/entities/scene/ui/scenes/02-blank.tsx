// 02 ─ blank: letters decode into place
import { E, hash, range, span } from '@/shared/lib/math'
import { bigBox } from '@/shared/lib/layout'
import { fit } from '@/shared/lib/textMeasure'
import type { Seg } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { Cue, SceneSpec } from '../../model/types'

const SCRAMBLE = 'ABCKLNSX#'
export const blank: SceneSpec = {
  id: 'blank',
  len: 4,
  text: 'it starts with a blank page',
  sfx: [...typeCues('it starts with a ', 0, 0.9), ...range(0, 4).map((i): Cue => [1.72 + i * 0.14, 'blip', i]), ...typeCues('blank page', 2.7, 0.6)],
  view: (f) => {
    const { L, lb } = f
    const segs: Seg[] = [['it starts with a ', ''], ['blank', 'sig'], [' page', '']]
    const n = Math.round(17 * span(0, 0.9, lb) + 10 * span(2.7, 3.3, lb))
    const caret = lb < 0.9 || (lb > 2.7 && lb < 3.3) || f.blink
    const b = bigBox(L, 0.3)
    const B = fit('BLANK', b.w * 0.85, b.h)
    const at = (i: number) => span(0.9 + i * 0.14, 1.9 + i * 0.14, lb)
    const settled = range(0, 4).filter((i) => at(i) > 0.82).length
    return {
      cap: lb < 0.9 ? 'type("it starts with a")' : settled < 5 ? `decode("BLANK")  // ${settled}/5` : 'compile(word, { wdth: 125, wght: 900 })',
      node: (
        <>
          <Code x={L.M} y={L.TY} segs={segs} n={n} caret={caret} />
          <Word
            text="BLANK"
            fs={B.fs}
            x={b.x}
            y={b.y}
            ch={(i, c) => {
              const a = at(i)
              if (a <= 0) return { style: { opacity: 0 } }
              const e = 1 - E.outCubic(a)
              const done = a > 0.82
              const dx = (hash(i, 1) - 0.5) * 1.4 * B.fs * e
              const dy = (hash(i, 2) - 0.5) * 1.6 * B.fs * e
              const r = (hash(i, 3) - 0.5) * 140 * e
              return {
                text: done ? c : SCRAMBLE[Math.floor(hash(i, Math.floor(lb * 14)) * SCRAMBLE.length)],
                sig: !done && hash(i, 4) < 0.45,
                style: { transform: `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) rotate(${r.toFixed(1)}deg)` },
              }
            }}
          />
        </>
      ),
    }
  },
}
