// 22 ─ frame by frame: a film strip that steps one frame per notch
import { E, bump, pad, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { monoW } from '@/shared/lib/canvasText'
import { type Seg, typing } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import type { SceneSpec } from '../../model/types'
import './22-strip.css'

const FRAMES = ['lime', 'solid', 'outline', 'paper', 'lime', 'solid'] // F01–F04 sit in the middle
export const strip: SceneSpec = {
  id: 'strip',
  len: 5,
  text: 'frame by frame',
  view: (f) => {
    const { L, lb } = f
    const band = { y: L.H * 0.19, h: L.H * 0.56 }
    const sh = Math.max(14, L.mono * 0.95)
    const fw = Math.min(L.W * 0.64, (band.h - sh * 2) * 2.2)
    const gap = L.W * 0.05
    const fh = band.h - sh * 2 - 16
    const step = [0.4, 1.5, 2.6].reduce((a, s) => a + E.inOutCubic(span(s, s + 0.8, lb)), 0)
    const off = L.W / 2 - fw / 2 - (step + 1) * (fw + gap)
    const cur = Math.round(step) + 1
    const W1 = fit('FRAME', fw * 0.86, fh * 0.6)
    const W2 = fit('FRAME', fw * 0.86, fh * 0.7, 900, 62)
    const by: Seg[] = [['by', '']]
    const fbf = typing(f, by, 3.6, 0.2)
    return {
      cap: `strip.step(${cur})  // frame ${cur} of 4`,
      shake: 5 * [0.4, 1.5, 2.6].reduce((a, s) => a + bump(s + 0.6, s + 0.85, lb), 0),
      node: (
        <>
          <div className="strip" style={{ top: band.y, height: band.h, opacity: span(0, 0.25, lb) }}>
            <i className="holes" style={{ top: 4, height: sh - 8, backgroundPositionX: off }} />
            <i className="holes" style={{ bottom: 4, height: sh - 8, backgroundPositionX: off }} />
            {FRAMES.map((kind, i) => {
              const W = kind === 'paper' || kind === 'lime' ? W2 : W1
              const fx = off + i * (fw + gap)
              if (fx > L.W || fx + fw < 0) return null
              return (
                <div key={i} className={`frame frame--${kind}`} style={{ left: fx, top: sh + 8, width: fw, height: fh }}>
                  <span className="frame-no">{`F${pad(i, 2)}`}</span>
                  <Word className={kind === 'outline' ? 'ghost ghost--ink' : ''} text="FRAME" fs={W.fs} x={(fw - W.w) / 2} y={(fh - W.fs * 0.8) / 2} d={W === W2 ? 62 : 125} />
                </div>
              )
            })}
          </div>
          <Code x={L.W / 2 - monoW('by', L.mono) / 2} y={band.y + band.h + L.mono * 1.4} segs={by} n={fbf.n} caret={lb >= 3.6 && fbf.caret} />
        </>
      ),
    }
  },
}
