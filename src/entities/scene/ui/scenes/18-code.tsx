// 18 ─ only code
import { E, pad, span } from '@/shared/lib/math'
import { fit, textW } from '@/shared/lib/textMeasure'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'
import './18-code.css'

const SOURCE = [
  'const unit = innerHeight * 0.18;   // one scroll unit',
  'const u = scrollY / unit;          // the only clock',
  '',
  'function frame(u) {',
  '  const sc = sceneAt(u);',
  '  return sc.view({ lb: u - sc.at }); // pure',
  '}',
  '',
  "word('ONLY').pop(at.only);",
  "word('code').type(at.only + .6, 1.5);",
  "word('LANDS').drop(at.lands);",
  '',
  'for (let f = 0; f < 60; f++) {',
  '  render(f / 60);',
  '}',
  '// keyframes: 0',
  '// timeline: none',
  'export default frame;',
]
export const code: SceneSpec = {
  id: 'code',
  len: 4,
  text: 'only code',
  sfx: [[0.05, 'thud'], ...typeCues('code', 0.6, 0.9), ...typeCues('and', 2.4, 0.3)],
  view: (f) => {
    const { L, lb } = f
    const O = fit('ONLY', (L.W - 2 * L.M) * 0.55, L.H * 0.24)
    const y = L.H * 0.22
    const n = Math.round(4 * span(0.6, 1.5, lb))
    const word = 'code'.slice(0, n)
    const cx = L.M + textW(word, O.fs) + O.fs * 0.04
    const typingCode = lb > 0.6 && lb < 1.5
    const lh = L.mono * 1.35
    return {
      cap: lb < 0.6 ? "word('ONLY')" : 'const engine = "only code";',
      node: (
        <>
          <div className="src" style={{ left: Math.max(L.M, L.W * 0.56), top: L.H * 0.12, height: L.H * 0.7 }}>
            <div style={{ transform: `translateY(${(lh * 3 - lb * lh * 1.4).toFixed(1)}px)` }}>
              {SOURCE.map((s, i) => (
                <div key={i} style={{ height: lh }}>
                  <span className="src-n">{pad(i + 1, 2)}</span>
                  {s}
                </div>
              ))}
            </div>
          </div>
          <Word text="ONLY" fs={O.fs} x={L.M} y={y} style={{ opacity: span(0.05, 0.2, lb), transform: `translateY(${((1 - E.outBack(span(0.05, 0.4, lb))) * 0.4 * O.fs).toFixed(1)}px)` }} />
          <Word text={word} fs={O.fs} x={L.M} y={y + O.fs * 0.92} />
          {lb >= 0.6 && <div className="bigcaret" style={{ left: cx, top: y + O.fs * 0.92 + O.fs * 0.06, width: O.fs * 0.3, height: O.fs * 0.68, visibility: typingCode || f.blink ? 'visible' : 'hidden' }} />}
          {lb >= 2.4 && (
            <>
              <div className="ln" style={{ left: L.gx, top: L.H * 0.82 }}>26</div>
              <Code x={L.M} y={L.H * 0.82} segs={[['and', '']]} n={Math.round(3 * span(2.4, 2.7, lb))} caret={f.blink} />
            </>
          )}
        </>
      ),
    }
  },
}
