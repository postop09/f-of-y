// 21 ─ outro: NO KEYFRAMES, struck out on paper, then a single line
import { REDUCE } from '@/shared/config/motion'
import { E, span } from '@/shared/lib/math'
import { fit, textW } from '@/shared/lib/textMeasure'
import { monoW } from '@/shared/lib/canvasText'
import { type Seg, typing } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import type { SceneSpec } from '../../model/types'
import './21-outro.css'

const FINAL = '// 0 keyframes. 1 file. every frame = f(scrollY).'
export const outro: SceneSpec = {
  id: 'outro',
  len: 7,
  text: 'no keyframes. 0 keyframes, 1 file, every frame is f(scrollY).',
  view: (f) => {
    const { L, lb } = f
    const N = fit('NO', (L.W - 2 * L.M) * 0.42, L.H * 0.26)
    const y = L.H * 0.17
    const kfSeg: Seg[] = [['keyframe', '']]
    const kf = typing(f, kfSeg, 0.3, 0.6, 1.2)
    const K = fit('KEYFRAMES', (L.W - 2 * L.M) * 0.95, L.H * 0.24, 900, 62)
    const ky = y + N.fs * 0.95
    const shown = 'KEYFRAMES'.slice(0, Math.round(9 * span(1.2, 1.8, lb)))
    const paper = lb >= 2.4 && lb < 3.6
    const strike = E.outCubic(span(2.6, 3.1, lb))
    const fsz = L.mono * 1.15
    const fw = monoW(FINAL, fsz)
    const fx = Math.max(L.M, L.W / 2 - fw / 2)
    const fy = L.H * 0.47
    const fin: Seg[] = [[FINAL, '']]
    const ft = typing(f, fin, 3.8, 1.2)
    const wipe = E.outCubic(span(5.1, 5.35, lb))
    const wipeOut = E.inCubic(span(5.45, 5.85, lb))
    const end = span(5.9, 6.3, lb)
    const A = lb < 3.6
    const C = lb >= 3.6 && lb < 5.45
    return {
      paper,
      cap: lb < 1.2 ? 'export const keyframes = [];' : lb < 2.4 ? 'type("KEYFRAMES")' : lb < 3.6 ? 'keyframes.length  // 0' : lb < 5.1 ? 'render complete  // exit 0' : 'clear()',
      flash: lb >= 2.4 ? 0.2 * (1 - span(2.4, 2.6, lb)) : 0,
      shake: lb >= 2.4 ? 10 * (1 - span(2.4, 2.6, lb)) : 0,
      node: (
        <>
          {A && (
            <>
              <Word text="NO" fs={N.fs} x={L.M} y={y} style={{ transform: `scale(${E.outBack(span(0, 0.3, lb)).toFixed(4)})`, transformOrigin: '0% 100%' }} />
              {lb < 1.2 && <Code x={L.M} y={ky} segs={kfSeg} n={kf.n} caret={kf.caret} style={{ fontSize: L.mono * 1.3 }} />}
              {lb >= 1.2 && <Word text={shown} fs={K.fs} x={L.M} y={ky} d={62} />}
              {lb >= 1.2 && !paper && <div className="bigcaret" style={{ left: L.M + textW(shown, K.fs, 900, 62) + K.fs * 0.04, top: ky + K.fs * 0.03, width: K.fs * 0.06, height: K.fs * 0.72, visibility: lb < 1.8 || f.blink ? 'visible' : 'hidden' }} />}
              {strike > 0 && <div className="bar fgbg" style={{ left: L.M - K.fs * 0.05, top: ky + K.fs * 0.34, width: (K.w + K.fs * 0.1) * strike, height: Math.max(4, K.fs * 0.075) }} />}
            </>
          )}
          {C && <Code x={fx} y={fy} segs={fin} n={ft.n} caret={ft.caret} style={{ fontSize: fsz }} />}
          {wipe > 0 && wipeOut < 1 && <div className="bar sigbg" style={{ left: fx - 6 + (fw + 12) * wipe * wipeOut, top: fy - fsz * 0.35, width: (fw + 12) * wipe * (1 - wipeOut), height: fsz * 2 }} />}
          {end > 0 && (
            <div className="endcard" style={{ opacity: end, transform: `translateY(${((1 - E.outCubic(end)) * 16).toFixed(1)}px)` }}>
              <p className="end-big">f(y)</p>
              <p>스크롤을 위로 올리면 모든 장면이 그대로 되감겨요.</p>
              <p className="dim">{`${f.count} scenes · 0 keyframes · 1 scroll`}</p>
              {/* the stage is aria-hidden; keyboard users get the same action from the transport bar */}
              <button type="button" className="end-btn" tabIndex={-1} onClick={() => window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' })}>
                처음으로 ↑
              </button>
            </div>
          )}
        </>
      ),
    }
  },
}
