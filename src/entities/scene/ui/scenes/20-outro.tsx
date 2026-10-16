// 20 ─ outro: NO KEYFRAMES, struck out on paper, then a single line
import { E, span } from '@/shared/lib/math'
import { fit, textW } from '@/shared/lib/textMeasure'
import { monoW } from '@/shared/lib/canvasText'
import { type Seg, countOn, typeOn } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'
import './20-outro.css'

const FINAL = '// 0 keyframes. 1 file. every frame = f(scrollY).'
export const outro: SceneSpec = {
  id: 'outro',
  len: 13,
  text: 'no keyframes. 0 keyframes, 1 file, every frame is f(scrollY).',
  // paper on the downbeat at 4, the struck-out word on the next sixteenth, then the last line on thirty-seconds
  sfx: [...typeCues('keyframe', 0.25), ...typeCues('KEYFRAMES', 2.25, 1 / 8), [4, 'boom'], [4.25, 'shing'], ...typeCues(FINAL, 5.5), [11.75, 'whoosh'], [12.25, 'blip', 0]],
  view: (f) => {
    const { L, lb } = f
    const N = fit('NO', (L.W - 2 * L.M) * 0.42, L.H * 0.26)
    const y = L.H * 0.17
    const kfSeg: Seg[] = [['keyframe', '']]
    const kf = typeOn(f, kfSeg, 0.25, 2.25)
    const K = fit('KEYFRAMES', (L.W - 2 * L.M) * 0.95, L.H * 0.24, 900, 62)
    const ky = y + N.fs * 0.95
    const shown = 'KEYFRAMES'.slice(0, countOn(lb, 2.25, 9, 1 / 8))
    const paper = lb >= 4 && lb < 5.5
    const strike = E.outCubic(span(4.25, 4.75, lb))
    const fsz = L.mono * 1.15
    const fw = monoW(FINAL, fsz)
    const fx = Math.max(L.M, L.W / 2 - fw / 2)
    const fy = L.H * 0.47
    const fin: Seg[] = [[FINAL, '']]
    const ft = typeOn(f, fin, 5.5)
    const wipe = E.outCubic(span(11.75, 12, lb))
    const wipeOut = E.inCubic(span(12, 12.25, lb))
    const end = span(12.25, 12.75, lb)
    const A = lb < 5.5
    const C = lb >= 5.5 && lb < 12
    return {
      paper,
      cap: lb < 2.25 ? 'export const keyframes = [];' : lb < 4 ? 'type("KEYFRAMES")' : lb < 5.5 ? 'keyframes.length  // 0' : lb < 11.75 ? 'render complete  // exit 0' : 'clear()',
      flash: lb >= 4 ? 0.2 * (1 - span(4, 4.2, lb)) : 0,
      shake: lb >= 4 ? 10 * (1 - span(4, 4.2, lb)) : 0,
      node: (
        <>
          {A && (
            <>
              <Word text="NO" fs={N.fs} x={L.M} y={y} style={{ transform: `scale(${E.outBack(span(0, 0.25, lb)).toFixed(4)})`, transformOrigin: '0% 100%' }} />
              {lb < 2.25 && <Code x={L.M} y={ky} segs={kfSeg} n={kf.n} caret={kf.caret} style={{ fontSize: L.mono * 1.3 }} />}
              {lb >= 2.25 && <Word text={shown} fs={K.fs} x={L.M} y={ky} d={62} />}
              {lb >= 2.25 && !paper && <div className="bigcaret" style={{ left: L.M + textW(shown, K.fs, 900, 62) + K.fs * 0.04, top: ky + K.fs * 0.03, width: K.fs * 0.06, height: K.fs * 0.72, visibility: lb < 3.375 || f.blink ? 'visible' : 'hidden' }} />}
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
              {/* the stage is aria-hidden; keyboard users rewind with the scroll or the transport bar instead */}
              <button type="button" className="end-btn" tabIndex={-1} onClick={f.replay}>
                다시 재생 ↺
              </button>
            </div>
          )}
        </>
      ),
    }
  },
}
