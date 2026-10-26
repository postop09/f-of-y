// 03 ─ blink → 꾸준히: typed, backspaced to the core, the letters blink like eyelids
import { bump, range } from '@/shared/lib/math'
import { bigBox } from '@/shared/lib/layout'
import { fit, textW } from '@/shared/lib/textMeasure'
import { type Seg, countOn, typeOn } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { Cue, SceneSpec } from '../../model/types'

const LINE = '오늘도'
const FULL = '꾸준히 한다'
/** backspaced off the end, leaving the core word */
const DEL = 3
const N = [...FULL].length

export const blink: SceneSpec = {
  id: 'blink',
  len: 4,
  text: '오늘도 꾸준히 한다 — 꾸준히',
  // everything on sixteenths: type, type the big word, backspace three, then the letters blink
  sfx: [...typeCues(LINE, 0), ...typeCues(FULL, 1.25, 1 / 4), ...range(0, DEL - 1).map((i): Cue => [3.25 + i / 4, 'tick', i])],
  view: (f) => {
    const { L, lb } = f
    const segs: Seg[] = [[LINE, '']]
    const t = typeOn(f, segs, 0, 1.25)
    const b = bigBox(L, 0.32)
    const WG = 820
    const WD = 62
    const F = fit(FULL, b.w * 0.95, b.h, WG, WD)
    const del = countOn(lb, 3.25, DEL, 1 / 4)
    const shown = [...FULL].slice(0, Math.max(0, countOn(lb, 1.25, N, 1 / 4) - del)).join('')
    const cx = b.x + textW(shown, F.fs, WG, WD) + F.fs * 0.04
    const solid = lb >= 1.25 && lb < 3.875
    return {
      cap: lb < 1.25 ? `type("${LINE}")` : lb < 3.25 ? `type("${shown}")` : lb < 3.875 ? `backspace(${del})` : `caret.blink(${f.blink ? 1 : 0})  // ${f.blink ? 'on' : 'off'}`,
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
              const k = bump(3.25 + i * 0.0625, 3.625 + i * 0.0625, lb)
              return k ? { style: { transform: `scaleY(${(1 - 0.92 * k).toFixed(3)})`, transformOrigin: '50% 55%' } } : null
            }}
          />
          {lb >= 1.25 && (
            <div className="bigcaret" style={{ left: cx, top: b.y + F.fs * 0.02, width: Math.max(4, F.fs * 0.07), height: F.fs * 0.72, visibility: solid || f.blink ? 'visible' : 'hidden' }} />
          )}
        </>
      ),
    }
  },
}
