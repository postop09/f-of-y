// 07 ─ done → 끝까지.
import { type Seg, E, fit, range, span, typeOn } from '@/shared/lib'
import { Code, Word } from '@/shared/ui'
import { typeCues } from '../../lib/cues'
import type { Cue, SceneSpec } from '../../model/types'

const LINE: Seg[] = [['맡은 일은', '']]
const BIG = '끝까지'
const NOTE: Seg[] = [['// 흐지부지는 없다', 'dim']]

export const done: SceneSpec = {
  id: 'done',
  len: 6,
  text: '맡은 일은 끝까지. // 흐지부지는 없다',
  // the letters drop from beat 3 and touch down on thirty-seconds, the dot lands on beat 4, then the comment
  sfx: [...typeCues(LINE, 0), ...range(0, [...BIG].length - 1).map((i): Cue => [2.5 + i / 8, 'thud', i]), [3, 'enter'], ...typeCues(NOTE, 3.5)],
  view: (f) => {
    const { L, lb } = f
    const t = typeOn(f, LINE, 0, 3)
    const D = fit(BIG, (L.W - 2 * L.M) * 0.62, L.H * 0.26)
    const x = L.W / 2 - D.w / 2
    const y = L.H * 0.42
    const ds = D.fs * 0.16
    const dot = E.outBack(span(3, 3.25, lb))
    const c = typeOn(f, NOTE, 3.5)
    return {
      cap: lb < 3 ? 'await finish(task)' : 'process.exit(0)',
      shake: lb > 3 ? 8 * (1 - span(3, 3.2, lb)) : 0,
      node: (
        <>
          <Code x={x} y={y - L.mono * 2.4} segs={LINE} n={t.n} caret={t.caret} />
          <Word
            text={BIG}
            fs={D.fs}
            x={x}
            y={y}
            ch={(i) => {
              const a = span(2 + i * 0.125, 2.5 + i * 0.125, lb)
              return { style: { opacity: a > 0 ? 1 : 0, transform: `translateY(${((1 - E.outCubic(a)) * 0.4 * D.fs).toFixed(1)}px)` } }
            }}
          />
          {dot > 0 && <div className="bar sigbg" style={{ left: x + D.w + D.fs * 0.04, top: y + 0.734 * D.fs - ds, width: ds, height: ds, transform: `scale(${dot.toFixed(4)})` }} />}
          <Code x={x} y={y + D.fs * 0.95} segs={NOTE} n={c.n} caret={c.caret} />
        </>
      ),
    }
  },
}
