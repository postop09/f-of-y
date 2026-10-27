// 16 ─ sixty → 100가지: a counter you drive with the wheel
import { fit, lerp, monoW, range, span } from '@/shared/lib'
import { Word } from '@/shared/ui'
import type { Cue, SceneSpec } from '../../model/types'
import './16-sixty.css'

const TO = 100
const LABEL = '가지'
const SUB = '모든 문제를 해결할 때까지'
const BARS = 60

export const sixty: SceneSpec = {
  id: 'sixty',
  len: 4,
  text: '100가지, 모든 문제를 해결할 때까지',
  // counts up over three beats: 100 lands on beat 4 with a blip only, since the breakdown's crash follows a beat later
  sfx: [...range(1, 11).map((k): Cue => [k / 4, 'tick', k]), [3, 'blip', 9]],
  view: (f) => {
    const { L, lb } = f
    const raw = lerp(0, TO, span(0, 3, lb))
    const n = Math.floor(raw + 1e-6)
    const N = fit('000', (L.W - 2 * L.M) * 0.5, L.H * 0.4)
    const x = L.M + (L.W - 2 * L.M) * 0.04
    const y = L.H * 0.5 - N.fs * 0.45
    const SX = fit(LABEL, (L.W - 2 * L.M) * 0.3, L.H * 0.09)
    const full = n >= TO
    const bw = N.w / BARS
    const lit = Math.round((BARS * n) / TO)
    // label and line share a left edge, the wider of the two set against the right margin
    const tx = L.W - L.M - Math.max(SX.w, monoW(SUB, L.mono))
    return {
      cap: `solved++  // ${n}`,
      flash: full ? 0.18 * (1 - span(3, 3.3, lb)) : 0,
      node: (
        <>
          <Word text={String(n)} fs={N.fs} x={x} y={y} ch={() => ({ sig: full })} style={{ transform: `scale(${(1 + 0.035 * (1 - (raw % 1))).toFixed(4)})`, transformOrigin: '0% 100%' }} />
          <Word text={LABEL} fs={SX.fs} x={tx} y={y + N.fs * 0.02} style={{ opacity: span(0, 0.5, lb) }} />
          <div className="code dim" style={{ left: tx, top: y + N.fs * 0.02 + SX.fs * 1.05 }}>{SUB}</div>
          {range(0, BARS - 1).map((i) => (
            <i key={i} className={'meter-b' + (i < lit ? ' on' : '')} style={{ left: x + i * bw, top: y + N.fs * 0.86, width: Math.max(1, bw * 0.55), height: L.mono * 0.8 }} />
          ))}
        </>
      ),
    }
  },
}
