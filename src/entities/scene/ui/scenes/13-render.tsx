// 13 ─ hit render
import { bump, pad, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { type Seg, typeOn } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'
import './13-render.css'

export const render: SceneSpec = {
  id: 'render',
  len: 4,
  text: 'hit render',
  // the press lands on beat 2, the render runs two beats and finishes on beat 4
  sfx: [...typeCues('hit', 0), [1, 'hit'], [1, 'riser'], [3, 'blip', 9]],
  view: (f) => {
    const { L, lb } = f
    const segs: Seg[] = [['hit', '']]
    const t = typeOn(f, segs, 0, 1)
    const R = fit('RENDER', (L.W - 2 * L.M) * 0.32, L.H * 0.1)
    const bw = R.w + R.fs * 0.9
    const bh = R.fs * 1.15
    const bx = L.W / 2 - bw / 2
    const by = L.H * 0.48 - bh / 2
    const press = bump(0.875, 1.125, lb)
    const k = span(1, 3, lb)
    const fr = Math.round(k * 2142)
    return {
      cap: lb < 0.875 ? 'type("hit")' : lb < 1 ? 'button.press()' : `render({ fps: 60 })  // ${Math.round(k * 100)}%`,
      node: (
        <>
          <Code x={bx} y={by - L.mono * 2.4} segs={segs} n={t.n} caret={t.caret} />
          <div className="btn" style={{ left: bx, top: by, width: bw, height: bh, transform: `scale(${(1 - 0.06 * press).toFixed(4)})`, opacity: span(0.25, 0.5, lb) }}>
            <Word text="RENDER" fs={R.fs} x={(bw - R.w) / 2} y={(bh - R.fs * 0.8) / 2} />
          </div>
          <div className="prog" style={{ left: bx, top: by + bh + L.mono * 1.2, width: bw }}>
            <i style={{ transform: `scaleX(${k.toFixed(4)})` }} />
          </div>
          <div className={'code small' + (k >= 1 ? ' sig' : ' dim')} style={{ left: bx, top: by + bh + L.mono * 1.9 }}>
            {k >= 1 ? 'frame 2142 / 2142 · done' : `frame ${pad(fr, 4)} / 2142`}
          </div>
        </>
      ),
    }
  },
}
