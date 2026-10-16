// 01 ─ boot: a prompt, a command, enter
import { pad, range, span } from '@/shared/lib/math'
import { type Seg, typing } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'

export const boot: SceneSpec = {
  id: 'boot',
  len: 3,
  text: '$ scroll(y)',
  sfx: [...typeCues('scroll(y)', 0.45, 1.3), [2, 'enter']],
  view: (f) => {
    const { L, lb } = f
    const rowH = L.mono * 1.9
    const x = L.M
    const y = L.TY
    const segs: Seg[] = [['scroll(', ''], ['y', 'sig'], [')', '']]
    const t = typing(f, segs, 0.45, 1.3)
    const fl = span(2.0, 2.45, lb)
    const hx = Math.max(0, x - L.mono * 3)
    return {
      cap: lb < 0.45 ? 'await user.scroll()' : lb < 2 ? 'type("scroll(y)")' : 'enter()',
      node: (
        <>
          {range(-3, 4).map((i) => (
            <div key={i} className={'ln' + (i === 0 ? ' cur' : '')} style={{ left: L.gx, top: y + i * rowH + L.mono * 0.14, opacity: i === 0 ? 1 : 0.5 }}>
              {pad(5 + i, 2)}
            </div>
          ))}
          <div className="rowhl" style={{ left: hx, top: y - L.mono * 0.3, width: L.W - L.M * 0.5 - hx, height: L.mono * 1.95 }}>
            <div className="rowflash" style={{ opacity: fl > 0 && fl < 1 ? (1 - fl) * 0.45 : 0 }} />
          </div>
          <div className="code dim" style={{ left: x + L.mono * 0.2, top: y - rowH }}>~/f-of-y  (main)</div>
          <Code x={x} y={y} prompt="$" segs={segs} n={t.n} caret={t.caret} />
        </>
      ),
    }
  },
}
