// 10 ─ goes: anticipation, then off screen with a trail
import { E, clamp, range, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { type Seg, typing } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'

export const goes: SceneSpec = {
  id: 'goes',
  len: 3,
  text: 'then it goes',
  sfx: [...typeCues('then it', 0, 0.4), [1.3, 'whoosh']],
  view: (f) => {
    const { L, lb } = f
    const segs: Seg[] = [['then it', '']]
    const t = typing(f, segs, 0, 0.4)
    const G = fit('GOES', (L.W - 2 * L.M) * 0.62, L.H * 0.26)
    const x0 = L.M + (L.W - 2 * L.M) * 0.06
    const y = L.H * 0.5
    const xAt = (q: number) => x0 - L.W * 0.05 * E.outCubic(span(1, 1.3, q)) + L.W * 1.15 * E.inCubic(span(1.3, 2.5, q))
    const fill = E.inOutCubic(span(0.4, 0.9, lb))
    const x = xAt(lb)
    const v = (x - xAt(lb - 0.05)) / 0.05
    return {
      cap: lb < 1.3 ? 'word("GOES")' : `word.x += v  // v=${Math.round(v / 60)}px/f`,
      node: (
        <>
          <Code x={L.M} y={L.H * 0.5 - L.mono * 2.6} segs={segs} n={t.n} caret={t.caret} style={{ opacity: 1 - span(1.3, 1.8, lb) }} />
          {fill < 1 && <Word className="ghost" text="GOES" fs={G.fs} x={x0} y={y} />}
          {range(1, 5).map((j) => (
            <Word key={j} className="trail" text="GOES" fs={G.fs} x={xAt(lb - j * 0.035)} y={y} style={{ opacity: clamp(Math.abs(v) / L.W) * (0.32 / j) }} />
          ))}
          <Word text="GOES" fs={G.fs} x={x} y={y} style={{ clipPath: fill < 1 ? `inset(-10% ${((1 - fill) * 105).toFixed(2)}% -10% -5%)` : undefined }} />
        </>
      ),
    }
  },
}
