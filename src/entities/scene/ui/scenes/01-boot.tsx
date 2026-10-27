// 01 ─ boot: a prompt, a command, enter
// Before the typing starts the visitor can type the command instead (ScrollStage puts a real input on this line, f.prompt).
import { type Seg, pad, range, span, typeOn } from '@/shared/lib'
import { Code } from '@/shared/ui'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'

const COMMAND: Seg[] = [['run ', ''], ['start', 'sig']]

export const boot: SceneSpec = {
  id: 'boot',
  len: 4,
  text: '$ run start',
  // the intro bar: no drums yet. Typed on thirty-seconds, enter on beat 4, and the groove comes in with the next scene
  sfx: [...typeCues(COMMAND, 1.5), [3, 'enter']],
  view: (f) => {
    const { L, lb } = f
    const rowH = L.mono * 1.9
    const x = L.M
    const y = L.TY
    const t = typeOn(f, COMMAND, 1.5)
    const fl = span(3, 3.45, lb)
    const hx = Math.max(0, x - L.mono * 3)
    return {
      cap: f.prompt ? 'await user.input()' : lb < 1.5 ? 'await user.scroll()' : lb < 3 ? 'type("run start")' : 'enter()',
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
          {!f.prompt && <Code x={x} y={y} prompt="$" segs={COMMAND} n={t.n} caret={t.caret} />}
        </>
      ),
    }
  },
}
