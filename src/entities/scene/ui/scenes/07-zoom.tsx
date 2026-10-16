// 07 ─ zoom: the camera dives through the O and comes out CLOSE
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

const LINE_IT: Seg[] = [['scroll and it', '']]

export const zoom: SceneSpec = {
  id: 'zoom',
  len: 6,
  text: 'scroll and it zooms close',
  // the dive rides a three-beat riser through the breakdown and CLOSE lands on the drop (synth DROP)
  sfx: [[1, 'blip', 2], [1, 'riser', 3 * SPB], [4, 'boom'], [4, 'crash']],
  view: (f) => {
    const { L, lb } = f
    const Z = fit('ZOOM', (L.W - 2 * L.M) * 0.8, L.H * 0.3)
    const p = centre(L, Z, 0.55)
    const m = memo(L, 'O', measureO)
    const ox = p.x + textW('ZO', Z.fs) + m.cx * Z.fs
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
    const C = fit('CLOSE', L.W * 1.12, L.H * 0.92, 900, 62)
    const cp = centre(L, C, 0.5)
    return {
      cam,
      cap: lb < 1 ? 'focus(word[2])' : `camera.zoom = ${Math.round((close ? S : s) * 100)}%`,
      flash: close ? 0.3 * (1 - span(4, 4.3, lb)) : 0,
      shake: close ? 22 * (1 - span(4, 4.3, lb)) : 0,
      node: close ? (
        <Word text="CLOSE" fs={C.fs} x={cp.x} y={cp.y} d={62} style={{ transform: `scale(${lerp(1.5, 1, E.outExpo(span(4, 4.45, lb))).toFixed(4)})`, transformOrigin: '50% 50%' }} />
      ) : (
        <div style={REDUCE ? { opacity: 1 - k } : undefined}>
          <Code x={L.M} y={L.TY} segs={LINE_IT} caret={f.blink && lb < 1} />
          <Word className="ghost" text="ZOOM" fs={Z.fs} x={p.x} y={p.y} />
          <Word text="ZOOM" fs={Z.fs} x={p.x} y={p.y} style={{ clipPath: `inset(-10% ${((1 - fill) * 105).toFixed(2)}% -10% -5%)` }} ch={(i) => ({ sig: i === 2 && lb > 1 })} />
        </div>
      ),
    }
  },
}
