// 14 ─ sixty: a counter you drive with the wheel
import { lerp, pad, range, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { Word } from '@/shared/ui/Word'
import type { SceneSpec } from '../../model/types'
import './14-sixty.css'

export const sixty: SceneSpec = {
  id: 'sixty',
  len: 3,
  text: 'sixty frames per second',
  view: (f) => {
    const { L, lb } = f
    const raw = lerp(0, 60, span(0.2, 2.4, lb))
    const n = Math.round(raw)
    const N = fit('00', (L.W - 2 * L.M) * 0.42, L.H * 0.4)
    const x = L.M + (L.W - 2 * L.M) * 0.04
    const y = L.H * 0.5 - N.fs * 0.45
    const SX = fit('SIXTY', (L.W - 2 * L.M) * 0.3, L.H * 0.09)
    const full = n >= 60
    const bw = N.w / 60
    return {
      cap: `frame++  // ${n}`,
      flash: full ? 0.18 * (1 - span(2.4, 2.7, lb)) : 0,
      node: (
        <>
          <Word text={pad(n, 2)} fs={N.fs} x={x} y={y} ch={() => ({ sig: full })} style={{ transform: `scale(${(1 + 0.035 * (1 - (raw % 1))).toFixed(4)})`, transformOrigin: '0% 100%' }} />
          <Word text="SIXTY" fs={SX.fs} x={L.W - L.M - SX.w} y={y + N.fs * 0.02} style={{ opacity: span(0.1, 0.4, lb) }} />
          <div className="code dim" style={{ left: L.W - L.M - SX.w, top: y + N.fs * 0.32 }}>fps</div>
          {range(0, 59).map((i) => (
            <i key={i} className={'meter-b' + (i < n ? ' on' : '')} style={{ left: x + i * bw, top: y + N.fs * 0.86, width: Math.max(1, bw * 0.55), height: L.mono * 0.8 }} />
          ))}
        </>
      ),
    }
  },
}
