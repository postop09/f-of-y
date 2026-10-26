// 09 ─ goes → 실행: anticipation, then off screen with a trail
import { E, clamp, range, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { type Seg, typeOn } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'

const LINE: Seg[] = [['마음먹으면', '']]
const BIG = '실행'

export const goes: SceneSpec = {
  id: 'goes',
  len: 4,
  text: '마음먹으면 바로 실행',
  // typed on sixteenths, filled, a half-beat wind-up, and gone on the kick at 2.5
  sfx: [...typeCues(LINE, 0), [2.5, 'whoosh']],
  view: (f) => {
    const { L, lb } = f
    const t = typeOn(f, LINE, 0)
    const G = fit(BIG, (L.W - 2 * L.M) * 0.62, L.H * 0.26)
    const x0 = L.M + (L.W - 2 * L.M) * 0.06
    const y = L.H * 0.5
    const xAt = (q: number) => x0 - L.W * 0.05 * E.outCubic(span(2, 2.5, q)) + L.W * 1.15 * E.inCubic(span(2.5, 3.5, q))
    const fill = E.inOutCubic(span(1, 2, lb))
    const x = xAt(lb)
    const v = (x - xAt(lb - 0.05)) / 0.05
    return {
      cap: lb < 2.5 ? `word("${BIG}")` : `word.x += v  // v=${Math.round(v / 60)}px/f`,
      node: (
        <>
          <Code x={L.M} y={L.H * 0.5 - L.mono * 2.6} segs={LINE} n={t.n} caret={t.caret} style={{ opacity: 1 - span(2.5, 3, lb) }} />
          {fill < 1 && <Word className="ghost" text={BIG} fs={G.fs} x={x0} y={y} />}
          {range(1, 5).map((j) => (
            <Word key={j} className="trail" text={BIG} fs={G.fs} x={xAt(lb - j * 0.035)} y={y} style={{ opacity: clamp(Math.abs(v) / L.W) * (0.32 / j) }} />
          ))}
          <Word text={BIG} fs={G.fs} x={x} y={y} style={{ clipPath: fill < 1 ? `inset(-10% ${((1 - fill) * 105).toFixed(2)}% -10% -5%)` : undefined }} />
        </>
      ),
    }
  },
}
