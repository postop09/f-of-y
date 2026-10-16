// 03 ─ blink: typed, backspaced, the letters blink like eyelids
import { bump, span } from '@/shared/lib/math'
import { bigBox } from '@/shared/lib/layout'
import { fit, textW } from '@/shared/lib/textMeasure'
import { type Seg, typing } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'

export const blink: SceneSpec = {
  id: 'blink',
  len: 4,
  text: 'and a blinking cursor',
  sfx: [...typeCues('and a', 0, 0.45), ...typeCues('BLINKING', 0.5, 1.4), ...typeCues('ING', 2.3, 0.5)],
  view: (f) => {
    const { L, lb } = f
    const segs: Seg[] = [['and a', '']]
    const t = typing(f, segs, 0, 0.45, 0.5)
    const b = bigBox(L, 0.32)
    const FULL = 'BLINKING'
    const WG = 820
    const WD = 62
    const F = fit(FULL, b.w * 0.95, b.h, WG, WD)
    const del = Math.round(3 * span(2.3, 2.8, lb))
    const shown = FULL.slice(0, Math.max(0, Math.round(8 * span(0.5, 1.9, lb)) - del))
    const cx = b.x + textW(shown, F.fs, WG, WD) + F.fs * 0.04
    const solid = lb >= 0.5 && lb < 2.9
    return {
      cap: lb < 0.5 ? 'type("and a")' : lb < 2.3 ? `type("${shown}")` : lb < 2.85 ? `backspace(${del})` : `caret.blink(${f.blink ? 1 : 0})  // ${f.blink ? 'on' : 'off'}`,
      node: (
        <>
          <Code x={L.M} y={L.TY} segs={segs} n={t.n} caret={t.caret} />
          <Word
            text={shown}
            fs={F.fs}
            x={b.x}
            y={b.y}
            w={WG}
            d={WD}
            ch={(i) => {
              const k = bump(3 + i * 0.12, 3.35 + i * 0.12, lb)
              return k ? { style: { transform: `scaleY(${(1 - 0.92 * k).toFixed(3)})`, transformOrigin: '50% 55%' } } : null
            }}
          />
          {lb >= 0.5 && (
            <div className="bigcaret" style={{ left: cx, top: b.y + F.fs * 0.02, width: Math.max(4, F.fs * 0.07), height: F.fs * 0.72, visibility: solid || f.blink ? 'visible' : 'hidden' }} />
          )}
        </>
      ),
    }
  },
}
