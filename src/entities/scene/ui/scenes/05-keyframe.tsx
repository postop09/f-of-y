// 05 ─ keyframe: the one keyframe gets dragged, then refused
import { E, lerp, range, span, springAt } from '@/shared/lib/math'
import { bigBox } from '@/shared/lib/layout'
import { fit } from '@/shared/lib/textMeasure'
import { type Seg, typing } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Cursor } from '@/shared/ui/Cursor'
import { Word } from '@/shared/ui/Word'
import type { SceneSpec } from '../../model/types'
import './05-keyframe.css'

export const keyframe: SceneSpec = {
  id: 'keyframe',
  len: 4,
  text: "i don't drag a keyframe",
  view: (f) => {
    const { L, lb } = f
    const segs: Seg[] = [["i don't drag a", '']]
    const t = typing(f, segs, 0, 0.7)
    const b = bigBox(L, 0.26)
    const K = fit('KEYFRAME', b.w * 0.92, b.h)
    const tr = { x: L.M, y: b.y + K.fs * 0.8 + L.mono * 1.8, w: L.W - 2 * L.M, h: Math.max(34, L.mono * 2.3) }
    const x0 = tr.x + tr.w * 0.12
    const x1 = tr.x + tr.w * 0.62
    const drag = E.inOutCubic(span(1.2, 2.3, lb))
    const dx = lb < 2.9 ? lerp(x0, x1, drag) : lerp(x1, x0, springAt((lb - 2.9) * 1.4, 12, 0.4))
    const strike = E.outCubic(span(2.35, 2.75, lb))
    const dimmed = span(2.45, 2.8, lb)
    const dragging = lb > 1.15 && lb < 2.35
    const ds = Math.max(10, L.mono * 0.75)
    return {
      cap: lb < 1.2 ? 'keyframe.select()' : lb < 2.35 ? `keyframe.drag(x=${Math.round(dx - tr.x)})` : 'keyframe.drag()  // refused',
      shake: lb > 2.35 ? 10 * (1 - span(2.35, 2.6, lb)) : 0,
      node: (
        <>
          <Code x={L.M} y={L.TY} segs={segs} n={t.n} caret={t.caret} />
          {lb >= 0.7 && (
            <Word text="KEYFRAME" fs={K.fs} x={b.x} y={b.y} style={{ opacity: 1 - 0.55 * dimmed, transform: `scale(${E.outBack(span(0.7, 1, lb)).toFixed(4)})`, transformOrigin: '0% 100%' }} />
          )}
          {strike > 0 && <div className="bar sigbg" style={{ left: b.x - K.fs * 0.04, top: b.y + K.fs * 0.34, width: (K.w + K.fs * 0.08) * strike, height: Math.max(4, K.fs * 0.07) }} />}
          <div className="kf-track" style={{ left: tr.x, top: tr.y, width: tr.w, height: tr.h, opacity: span(0.8, 1.1, lb) }}>
            {range(1, 6).map((i) => (
              <span key={i} className="kf-tick" style={{ left: `${((i - 1) / 5) * 100}%` }}>
                {i}
              </span>
            ))}
            <span className="kf-label">position</span>
          </div>
          {lb >= 0.8 && (
            <>
              {dragging && <div className="kf-trail" style={{ left: x0, top: tr.y + tr.h / 2 - 1, width: Math.max(0, dx - x0) }} />}
              <div className={'kf-diamond' + (dragging ? ' on' : '')} style={{ left: dx, top: tr.y + tr.h / 2, width: ds, height: ds }} />
              {dragging && <Cursor x={dx + ds * 0.2} y={tr.y + tr.h / 2 + ds * 0.1} />}
            </>
          )}
        </>
      ),
    }
  },
}
