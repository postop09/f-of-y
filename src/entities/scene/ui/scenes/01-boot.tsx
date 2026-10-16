// 01 ─ boot: a prompt, a command, enter
import { E, lerp, pad, range, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { type Seg, typing } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { centre } from '../../lib/centre'
import type { SceneSpec } from '../../model/types'

export const boot: SceneSpec = {
  id: 'boot',
  len: 4,
  text: '$ scroll(y) — SCROLL',
  view: (f) => {
    const { L, lb } = f
    const rowH = L.mono * 1.9
    const x = L.M
    const y = L.TY
    const segs: Seg[] = [['scroll(', ''], ['y', 'sig'], [')', '']]
    const t = typing(f, segs, 0.45, 1.3)
    const o = 1 - span(2.5, 3, lb)
    const fl = span(2.0, 2.45, lb)
    const col = E.inCubic(span(2.45, 2.9, lb))
    const hx = Math.max(0, x - L.mono * 3)
    const big = fit('SCROLL', (L.W - 2 * L.M) * 0.9, L.H * 0.3)
    const p = centre(L, big)
    const on = lb >= 2.9
    return {
      cap: lb < 0.45 ? 'await user.scroll()' : lb < 2 ? 'type("scroll(y)")' : lb < 2.45 ? 'enter()' : lb < 2.9 ? 'collapse(toCaret)' : 'compile("SCROLL", { wdth: 125, wght: 900 })',
      flash: on ? 0.22 * (1 - span(2.9, 3.3, lb)) : 0,
      shake: on ? 18 * (1 - span(2.9, 3.3, lb)) : 0,
      node: (
        <>
          {o > 0 && (
            <>
              {range(-3, 4).map((i) => (
                <div key={i} className={'ln' + (i === 0 ? ' cur' : '')} style={{ left: L.gx, top: y + i * rowH + L.mono * 0.14, opacity: i === 0 ? o : o * 0.5 }}>
                  {pad(5 + i, 2)}
                </div>
              ))}
              <div className="rowhl" style={{ left: hx, top: y - L.mono * 0.3, width: L.W - L.M * 0.5 - hx, height: L.mono * 1.95, opacity: 1 - span(2.6, 3, lb) }}>
                <div className="rowflash" style={{ opacity: fl > 0 && fl < 1 ? (1 - fl) * 0.45 : 0 }} />
              </div>
              <div className="code dim" style={{ left: x + L.mono * 0.2, top: y - rowH, opacity: o }}>~/f-of-y  (main)</div>
            </>
          )}
          {!on && <Code x={x} y={y} prompt="$" segs={segs} n={t.n} caret={t.caret} bodyStyle={col ? { transform: `scaleX(${1 - col})` } : undefined} />}
          {on && <Word text="SCROLL" fs={big.fs} x={p.x} y={p.y} style={{ transform: `scale(${lerp(1.35, 1, E.outExpo(span(2.9, 3.35, lb)))})`, transformOrigin: '50% 60%' }} />}
        </>
      ),
    }
  },
}
