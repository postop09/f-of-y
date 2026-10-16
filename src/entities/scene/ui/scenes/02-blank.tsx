// 02 ─ blank: letters decode into place
import { E, hash, range, span } from '@/shared/lib/math'
import { bigBox } from '@/shared/lib/layout'
import { fit } from '@/shared/lib/textMeasure'
import { type Seg, countOn } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { Cue, SceneSpec } from '../../model/types'

const SCRAMBLE = 'ABCKLNSX#'
export const blank: SceneSpec = {
  id: 'blank',
  len: 4,
  text: 'it starts with a blank page',
  // one long line typed in two bursts on thirty-seconds; BLANK settles a letter per sixteenth
  sfx: [...typeCues('it starts with a ', 0, 1 / 8), ...range(0, 4).map((i): Cue => [1.75 + i * 0.25, 'blip', i]), ...typeCues('blank page', 2.75, 1 / 8)],
  view: (f) => {
    const { L, lb } = f
    const segs: Seg[] = [['it starts with a ', ''], ['blank', 'sig'], [' page', '']]
    const n = countOn(lb, 0, 17, 1 / 8) + countOn(lb, 2.75, 10, 1 / 8)
    const caret = lb < 2.125 || (lb >= 2.75 && lb < 3.875) || f.blink
    const b = bigBox(L, 0.3)
    const B = fit('BLANK', b.w * 0.85, b.h)
    const at = (i: number) => span(1 + i * 0.25, 1.75 + i * 0.25, lb)
    const settled = range(0, 4).filter((i) => at(i) >= 1).length
    return {
      cap: lb < 1 ? 'type("it starts with a")' : settled < 5 ? `decode("BLANK")  // ${settled}/5` : 'compile(word, { wdth: 125, wght: 900 })',
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
              const done = a >= 1
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
