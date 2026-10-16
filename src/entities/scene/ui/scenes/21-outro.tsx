// 21 ─ outro: NO KEYFRAMES, struck out on paper, then a single line that is wiped away
import { E, span } from '@/shared/lib/math'
import { fit, textW } from '@/shared/lib/textMeasure'
import { monoW } from '@/shared/lib/canvasText'
import { type Seg, countOn, typeOn } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'

const FINAL = '// 0 keyframes. 1 file. every frame = f(scrollY).'
export const outro: SceneSpec = {
  id: 'outro',
  len: 12,
  text: 'no keyframes. 0 keyframes, 1 file, every frame is f(scrollY).',
  // the big caret waits a beat, KEYFRAMES is typed on thirty-seconds from 1, paper on the downbeat at 4,
  // the struck-out word on the next sixteenth, then the last line on thirty-seconds, wiped off as the bar ends
  sfx: [...typeCues('KEYFRAMES', 1, 1 / 8), [4, 'boom'], [4.25, 'shing'], ...typeCues(FINAL, 5.5), [11.5, 'whoosh']],
  view: (f) => {
    const { L, lb } = f
    const N = fit('NO', (L.W - 2 * L.M) * 0.42, L.H * 0.26)
    const y = L.H * 0.17
    const K = fit('KEYFRAMES', (L.W - 2 * L.M) * 0.95, L.H * 0.24, 900, 62)
    const ky = y + N.fs * 0.95
    const shown = 'KEYFRAMES'.slice(0, countOn(lb, 1, 9, 1 / 8))
    const typingK = lb >= 1 && shown.length < 9
    const paper = lb >= 4 && lb < 5.5
    const strike = E.outCubic(span(4.25, 4.75, lb))
    const fsz = L.mono * 1.15
    const fw = monoW(FINAL, fsz)
    const fx = Math.max(L.M, L.W / 2 - fw / 2)
    const fy = L.H * 0.47
    const fin: Seg[] = [[FINAL, '']]
    const ft = typeOn(f, fin, 5.5)
    const wipe = E.outCubic(span(11.5, 11.75, lb))
    const wipeOut = E.inCubic(span(11.75, 12, lb))
    const A = lb < 5.5
    const C = lb >= 5.5 && lb < 11.75
    return {
      paper,
      cap: lb < 1 ? 'export const keyframes = [];' : lb < 4 ? 'type("KEYFRAMES")' : lb < 5.5 ? 'keyframes.length  // 0' : lb < 11.5 ? 'render complete  // exit 0' : 'clear()',
      flash: lb >= 4 ? 0.2 * (1 - span(4, 4.2, lb)) : 0,
      shake: lb >= 4 ? 10 * (1 - span(4, 4.2, lb)) : 0,
      node: (
        <>
          {A && (
            <>
              <Word text="NO" fs={N.fs} x={L.M} y={y} style={{ transform: `scale(${E.outBack(span(0, 0.25, lb)).toFixed(4)})`, transformOrigin: '0% 100%' }} />
              {shown && <Word text={shown} fs={K.fs} x={L.M} y={ky} d={62} />}
              {lb >= 0.25 && !paper && <div className="bigcaret" style={{ left: L.M + textW(shown, K.fs, 900, 62) + K.fs * 0.04, top: ky + K.fs * 0.03, width: K.fs * 0.06, height: K.fs * 0.72, visibility: typingK || f.blink ? 'visible' : 'hidden' }} />}
              {strike > 0 && <div className="bar fgbg" style={{ left: L.M - K.fs * 0.05, top: ky + K.fs * 0.34, width: (K.w + K.fs * 0.1) * strike, height: Math.max(4, K.fs * 0.075) }} />}
            </>
          )}
          {C && <Code x={fx} y={fy} segs={fin} n={ft.n} caret={ft.caret} style={{ fontSize: fsz }} />}
          {wipe > 0 && wipeOut < 1 && <div className="bar sigbg" style={{ left: fx - 6 + (fw + 12) * wipe * wipeOut, top: fy - fsz * 0.35, width: (fw + 12) * wipe * (1 - wipeOut), height: fsz * 2 }} />}
        </>
      ),
    }
  },
}
