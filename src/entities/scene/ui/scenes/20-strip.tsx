// 20 ─ 한 걸음, 또 한 걸음: a film strip that steps one frame per notch
import { E, bump, pad, span } from '@/shared/lib/math'
import { fit } from '@/shared/lib/textMeasure'
import { monoW } from '@/shared/lib/canvasText'
import { type Seg, typeOn } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { Cue, SceneSpec } from '../../model/types'
import './20-strip.css'

const FRAMES = ['lime', 'solid', 'outline', 'paper', 'lime', 'solid'] // F01–F04 sit in the middle
/** each step starts here and lands three sixteenths later, on beats 2, 3 and 4 */
const STEPS = [0.25, 1.25, 2.25]
const BIG = '한 걸음'
const BY = '또'

export const strip: SceneSpec = {
  id: 'strip',
  len: 4,
  text: '한 걸음, 또 한 걸음',
  sfx: [...STEPS.flatMap((s, i): Cue[] => [[s, 'whoosh'], [s + 0.75, 'thud', i]]), ...typeCues(BY, 3.25)],
  view: (f) => {
    const { L, lb } = f
    const band = { y: L.H * 0.19, h: L.H * 0.56 }
    const sh = Math.max(14, L.mono * 0.95)
    const fw = Math.min(L.W * 0.64, (band.h - sh * 2) * 2.2)
    const gap = L.W * 0.05
    const fh = band.h - sh * 2 - 16
    const step = STEPS.reduce((a, s) => a + E.inOutCubic(span(s, s + 0.75, lb)), 0)
    const off = L.W / 2 - fw / 2 - (step + 1) * (fw + gap)
    const cur = Math.round(step) + 1
    const W1 = fit(BIG, fw * 0.86, fh * 0.6)
    const W2 = fit(BIG, fw * 0.86, fh * 0.7, 900, 62)
    const by: Seg[] = [[BY, '']]
    const fbf = typeOn(f, by, 3.25)
    return {
      cap: `strip.step(${cur})  // step ${cur} of 4`,
      shake: 5 * STEPS.reduce((a, s) => a + bump(s + 0.7, s + 0.9, lb), 0),
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
                  <Word className={kind === 'outline' ? 'ghost ghost--ink' : ''} text={BIG} fs={W.fs} x={(fw - W.w) / 2} y={(fh - W.fs * 0.8) / 2} d={W === W2 ? 62 : 125} />
                </div>
              )
            })}
          </div>
          <Code x={L.W / 2 - monoW(BY, L.mono) / 2} y={band.y + band.h + L.mono * 1.4} segs={by} n={fbf.n} caret={lb >= 3.25 && fbf.caret} />
        </>
      ),
    }
  },
}
