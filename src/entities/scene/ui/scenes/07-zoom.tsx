// 07 ─ zoom → 몰입: the camera dives through the 0 of 100% and comes out 몰입
import { REDUCE } from '@/shared/config/motion'
import { E, lerp, span } from '@/shared/lib/math'
import { SPB } from '@/shared/lib/synth'
import { memo } from '@/shared/lib/layout'
import { fit, textW } from '@/shared/lib/textMeasure'
import { measureO } from '@/shared/lib/canvasText'
import type { Seg } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { centre } from '../../lib/centre'
import type { Cam, SceneSpec } from '../../model/types'

const LINE_IT: Seg[] = [['한번 붙잡으면', '']]
const BIG = '100%'
/** the letter the camera dives through, and what comes out the other side */
const DIVE = 2
const OUT = '몰입'

export const zoom: SceneSpec = {
  id: 'zoom',
  len: 6,
  text: '한번 붙잡으면 100% 몰입',
  // the riser fills the whole breakdown bar, the dive rides it, and 몰입 lands on the drop (synth DROP)
  sfx: [[0, 'riser', 4 * SPB], [1, 'blip', 2], [4, 'boom'], [4, 'crash']],
  view: (f) => {
    const { L, lb } = f
    const Z = fit(BIG, (L.W - 2 * L.M) * 0.8, L.H * 0.3)
    const p = centre(L, Z, 0.55)
    const m = memo(L, 'O:' + BIG[DIVE], () => measureO(BIG[DIVE]))
    const ox = p.x + textW(BIG.slice(0, DIVE), Z.fs) + m.cx * Z.fs
    const oy = p.y + 0.734 * Z.fs + m.cy * Z.fs
    const S = (1.15 * Math.hypot(L.W, L.H)) / 2 / (Math.min(m.cw, m.ch) * Z.fs)
    const fill = E.inOutCubic(span(0, 1, lb))
    const k = span(1, 4, lb)
    const close = lb >= 4
    let cam: Cam | null = null
    let s = 1
    if (k > 0 && !close) {
      if (REDUCE) s = 1
      else {
        s = Math.exp(Math.log(S) * Math.pow(k, 2.4))
        const mm = E.inOutCubic(k)
        cam = { s, fx: ox, fy: oy, px: lerp(ox, L.W / 2, mm), py: lerp(oy, L.H / 2, mm) }
      }
    }
    const C = fit(OUT, L.W * 1.12, L.H * 0.92, 900, 62)
    const cp = centre(L, C, 0.5)
    return {
      cam,
      cap: lb < 1 ? `focus(word[${DIVE}])` : `camera.zoom = ${Math.round((close ? S : s) * 100)}%`,
      flash: close ? 0.3 * (1 - span(4, 4.3, lb)) : 0,
      shake: close ? 22 * (1 - span(4, 4.3, lb)) : 0,
      node: close ? (
        <Word text={OUT} fs={C.fs} x={cp.x} y={cp.y} d={62} style={{ transform: `scale(${lerp(1.5, 1, E.outExpo(span(4, 4.45, lb))).toFixed(4)})`, transformOrigin: '50% 50%' }} />
      ) : (
        <div style={REDUCE ? { opacity: 1 - k } : undefined}>
          <Code x={L.M} y={L.TY} segs={LINE_IT} caret={f.blink && lb < 1} />
          <Word className="ghost" text={BIG} fs={Z.fs} x={p.x} y={p.y} />
          <Word text={BIG} fs={Z.fs} x={p.x} y={p.y} style={{ clipPath: `inset(-10% ${((1 - fill) * 105).toFixed(2)}% -10% -5%)` }} ch={(i) => ({ sig: i === DIVE && lb > 1 })} />
        </div>
      ),
    }
  },
}
