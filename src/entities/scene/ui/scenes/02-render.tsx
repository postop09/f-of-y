// 02 ─ render → 전진: press, and push until the goal
import { type Seg, bump, fit, pad, span, typeOn } from '@/shared/lib'
import { Code, Word } from '@/shared/ui'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'
import './02-render.css'

const LINE: Seg[] = [['자기소개', '']]
const BIG = '시작'

export const render: SceneSpec = {
  id: 'render',
  len: 4,
  text: '자기소개 시작, 진행률 100%',
  // the press lands on beat 2, the bar runs two beats and fills on beat 4
  sfx: [...typeCues(LINE, 0), [1, 'hit'], [1, 'riser'], [3, 'blip', 9]],
  view: (f) => {
    const { L, lb } = f
    const t = typeOn(f, LINE, 0, 1)
    const R = fit(BIG, (L.W - 2 * L.M) * 0.32, L.H * 0.1)
    const bw = R.w + R.fs * 0.9
    const bh = R.fs * 1.15
    const bx = L.W / 2 - bw / 2
    const by = L.H * 0.48 - bh / 2
    const press = bump(0.875, 1.125, lb)
    const k = span(1, 3, lb)
    const pct = Math.floor(k * 100)
    return {
      cap: lb < 0.875 ? `type("${LINE[0][0]}")` : lb < 1 ? 'button.press()' : `push({ until: goal })  // ${Math.round(k * 100)}%`,
      node: (
        <>
          <Code x={bx} y={by - L.mono * 2.4} segs={LINE} n={t.n} caret={t.caret} />
          <div className="btn" style={{ left: bx, top: by, width: bw, height: bh, transform: `scale(${(1 - 0.06 * press).toFixed(4)})`, opacity: span(0.25, 0.5, lb) }}>
            <Word text={BIG} fs={R.fs} x={(bw - R.w) / 2} y={(bh - R.fs * 0.8) / 2} />
          </div>
          <div className="prog" style={{ left: bx, top: by + bh + L.mono * 1.2, width: bw }}>
            <i style={{ transform: `scaleX(${k.toFixed(4)})` }} />
          </div>
          <div className={'code small' + (k >= 1 ? ' sig' : ' dim')} style={{ left: bx, top: by + bh + L.mono * 1.9 }}>
            {k >= 1 ? '진행률 100% · 완료' : `진행률 ${pad(pct, 3)}%`}
          </div>
        </>
      ),
    }
  },
}
