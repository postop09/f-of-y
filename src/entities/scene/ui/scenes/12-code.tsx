// 12 ─ code → 꾸준한 노력, 그리고
import { E, countOn, fit, pad, span, textW } from '@/shared/lib'
import { Code, Word } from '@/shared/ui'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'
import './12-code.css'

const SOURCE = [
  'const unit = innerHeight * 0.18;   // one scroll unit',
  'const u = scrollY / unit;          // the only clock',
  '',
  'function frame(u) {',
  '  const sc = sceneAt(u);',
  '  return sc.view({ lb: u - sc.at }); // pure',
  '}',
  '',
  "word('꾸준한').pop(at.steady);",
  "word('노력').type(at.steady + .6, 1.5);",
  "word('책임감').drop(at.lands);",
  '',
  'for (let f = 0; f < 60; f++) {',
  '  render(f / 60);',
  '}',
  '// 핑계: 0',
  '// 한계: none',
  'export default frame;',
]
const TOP = '꾸준한'
const TYPED = '노력'
const AND = '그리고'
const nTyped = [...TYPED].length

export const code: SceneSpec = {
  id: 'code',
  len: 4,
  text: '꾸준한 노력, 그리고',
  // the first word on the downbeat, the second typed from beat 2, and the link from beat 4
  sfx: [[0, 'thud'], ...typeCues(TYPED, 1), ...typeCues(AND, 3)],
  view: (f) => {
    const { L, lb } = f
    const O = fit(TOP, (L.W - 2 * L.M) * 0.55, L.H * 0.2)
    const y = L.H * 0.22
    const n = countOn(lb, 1, nTyped)
    const word = [...TYPED].slice(0, n).join('')
    const cx = L.M + textW(word, O.fs) + O.fs * 0.04
    const typingCode = lb >= 1 && lb < 1 + nTyped / 4
    const lh = L.mono * 1.35
    return {
      cap: lb < 1 ? "word('꾸준한')" : 'const pace = "steady";',
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
          <Word text={TOP} fs={O.fs} x={L.M} y={y} style={{ opacity: span(0, 0.125, lb), transform: `translateY(${((1 - E.outBack(span(0, 0.375, lb))) * 0.4 * O.fs).toFixed(1)}px)` }} />
          <Word text={word} fs={O.fs} x={L.M} y={y + O.fs * 1.08} />
          {lb >= 1 && <div className="bigcaret" style={{ left: cx, top: y + O.fs * 1.08 + O.fs * 0.06, width: O.fs * 0.3, height: O.fs * 0.68, visibility: typingCode || f.blink ? 'visible' : 'hidden' }} />}
          {lb >= 3 && (
            <>
              <div className="ln" style={{ left: L.gx, top: L.H * 0.82 }}>26</div>
              <Code x={L.M} y={L.H * 0.82} segs={[[AND, '']]} n={countOn(lb, 3, [...AND].length)} caret={lb < 3.75 || f.blink} />
            </>
          )}
        </>
      ),
    }
  },
}
