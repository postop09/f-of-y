// 09 ─ stack up, flip
import { E, bump, range, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { Word } from '@/shared/ui/Word'
import type { Cue, SceneSpec } from '../../model/types'

export const stack: SceneSpec = {
  id: 'stack',
  len: 4,
  text: 'stack it up, flip it',
  sfx: [...range(0, 3).map((i): Cue => [0.45 + i * 0.42, 'thud', i]), [2, 'blip', 4], [2.6, 'whoosh']],
  view: (f) => {
    const { L, lb } = f
    const S = fit('STACK', (L.W - 2 * L.M) * 0.42, L.H * 0.12)
    const lineH = S.fs * 0.8
    const base = L.H * 0.76 - S.fs * 0.8
    const cx = L.W * 0.42
    const n = range(0, 3).filter((i) => lb >= 0.15 + i * 0.42).length
    const U = fit('UP', S.w * 0.5, S.fs * 0.9)
    const up = E.outBack(span(2, 2.3, lb))
    const th = 360 * E.inOutCubic(span(2.6, 3.7, lb))
    const F = fit('FLIP', (L.W - 2 * L.M) * 0.3, L.H * 0.12)
    return {
      cap: lb < 2 ? `stack.push(word)  // n=${n}` : lb < 2.6 ? 'stack.push("UP")' : `flip(rx=${th.toFixed(0)}deg)`,
      shake: 6 * range(0, 3).reduce((a, i) => a + bump(0.15 + i * 0.42 + 0.3, 0.15 + i * 0.42 + 0.42, lb), 0),
      node: (
        <>
          <div className="flip3d" style={{ transform: `perspective(900px) rotateX(${th.toFixed(2)}deg)`, transformOrigin: `${cx}px ${base - lineH}px` }}>
            {range(0, 3).map((i) => {
              const a = span(0.15 + i * 0.42, 0.5 + i * 0.42, lb)
              if (a <= 0) return null
              return <Word key={i} text="STACK" fs={S.fs} x={cx - S.w / 2} y={base - i * lineH - (1 - E.outBack(a)) * L.H * 0.6} />
            })}
            {up > 0 && <Word text="UP" fs={U.fs} x={cx - U.w / 2} y={base - 4 * lineH - U.fs * 0.05} ch={() => ({ sig: true })} style={{ transform: `scale(${up.toFixed(4)})`, transformOrigin: '50% 100%' }} />}
          </div>
          {lb >= 2.5 && <Word text="FLIP" fs={F.fs} x={L.W - L.M - F.w} y={L.H * 0.4} style={{ transform: `perspective(700px) rotateX(${(th * 2 + 70 * (1 - span(2.5, 2.7, lb))).toFixed(2)}deg)`, transformOrigin: '50% 50%' }} />}
        </>
      ),
    }
  },
}
