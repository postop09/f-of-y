// 16 ─ no keyframes, no timeline
import { E, bump, hash, lerp, range, span } from '@/shared/lib/math'
import { fit, textW } from '@/shared/lib/textMeasure'
import { type Seg, countOn, typeOn } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'
import './16-timeline.css'

type Clip = [track: number, from: number, to: number, name: string]
const CLIPS: Clip[] = [
  [0, 0.06, 0.3, 'title.mov'], [0, 0.36, 0.66, 'hook_v3.mov'], [0, 0.74, 0.94, 'outro.mov'],
  [1, 0.02, 0.48, 'intro_final.mov'], [1, 0.52, 0.98, 'verse_cut2.mov'],
  [2, 0.12, 0.82, 'vox_take7.wav'],
  [3, 0, 1, 'beat.wav'],
]
const DOTS = CLIPS.flatMap(([tr, a, b], ci) => {
  const n = Math.max(2, Math.round((b - a) * 11))
  return range(0, n - 1).map((j) => ({ tr, x: a + ((j + 0.3 + 0.4 * hash(ci, j)) / n) * (b - a) }))
})
export const timeline: SceneSpec = {
  id: 'timeline',
  len: 8,
  text: 'no keyframes. no timeline. rm -rf ./timeline',
  // the title types, deletes and retypes on thirty-seconds; the timeline is squashed on the clap at 5
  sfx: [...typeCues('NO KEYFRAMES', 0), [2, 'blip', 3], ...typeCues('KEYFRAMES', 2.5, 1 / 8), ...typeCues('TIMELINE', 3.75, 1 / 8), [5, 'thud'], [5.25, 'whoosh'], ...typeCues('rm -rf ./timeline', 5.25), [7.5, 'enter']],
  view: (f) => {
    const { L, lb } = f
    const fs = fit('NO KEYFRAMES', (L.W - 2 * L.M) * 0.9, L.H * 0.12).fs
    const ty = L.H * 0.14
    const typedA = countOn(lb, 0, 12, 1 / 8)
    const delA = countOn(lb, 2.5, 9, 1 / 8)
    const typedB = countOn(lb, 3.75, 8, 1 / 8)
    const second = lb >= 3.625
    const title = second ? 'NO ' + 'TIMELINE'.slice(0, typedB) : 'NO KEYFRAMES'.slice(0, Math.max(0, typedA - delA))
    const hl = !second && lb >= 2 ? E.outCubic(span(2, 2.25, lb)) : 0
    const noW = textW('NO ', fs)
    const py = ty + fs * 0.95 + L.mono
    const P = { x: L.M, y: py, w: L.W - 2 * L.M, h: Math.max(120, Math.min(L.H * 0.44, L.H - py - L.H * 0.16)) }
    const lw = L.mono * 3
    const rh = L.mono * 1.5
    const th = (P.h - rh) / 4
    // the playhead eats the keyframes as it passes them
    const head = lerp(0.02, 1, E.inOutCubic(span(0.25, 2, lb)))
    const sweep = head
    const left = DOTS.filter((d) => d.x > sweep * 1.02).length
    const squash = E.inOutCubic(span(4.75, 5.25, lb))
    const shrink = E.inCubic(span(5.25, 5.75, lb))
    const rm: Seg[] = [['rm -rf ./timeline', '']]
    const t = typeOn(f, rm, 5.25)
    const out = span(7.5, 7.75, lb)
    return {
      cap: lb < 0.25 ? 'timeline.load(project)' : lb < 2 ? `timeline.keyframes = []  // ${left} left` : lb < 2.5 ? 'timeline.selectAll()' : lb < 4.75 ? 'type("TIMELINE")' : lb < 5.25 ? 'delete timeline' : 'sh("rm -rf ./timeline")',
      shake: lb > 4.75 ? 8 * bump(4.9, 5.2, lb) : 0,
      node: (
        <>
          {hl > 0 && <div className="bar sigbg" style={{ left: L.M + noW - fs * 0.05, top: ty - fs * 0.05, width: (textW('KEYFRAMES', fs) + fs * 0.1) * hl, height: fs * 0.9 }} />}
          <Word text={title} fs={fs} x={L.M} y={ty} ch={(i) => (hl > 0.5 && i >= 3 ? { style: { color: 'var(--void)' } } : null)} />
          {shrink < 1 && (
            <div className="nle" style={{ left: P.x, top: P.y, width: P.w, height: P.h, transform: `scaleY(${lerp(1, 0.05, squash).toFixed(4)}) scaleX(${(1 - shrink).toFixed(4)})`, opacity: span(0, 0.3, lb) }}>
              <div className="nle-lime" style={{ opacity: span(4.75, 4.875, lb) }} />
              <div className="nle-ruler" style={{ left: lw, height: rh }}>
                {range(0, 7).map((i) => <span key={i} style={{ left: `${(i / 8) * 100}%` }}>{P.w < 640 ? `0${i}:00` : `00:0${i}:00`}</span>)}
              </div>
              {['V2', 'V1', 'A2', 'A1'].map((name, r) => (
                <div key={name} className="nle-row" style={{ top: rh + r * th, height: th }}>
                  <span className="nle-name" style={{ width: lw }}>{name}</span>
                </div>
              ))}
              {CLIPS.map(([r, a, b, name]) => (
                <div key={name} className="nle-clip" style={{ left: lw + (P.w - lw) * a, top: rh + r * th + th * 0.14, width: (P.w - lw) * (b - a) - 3, height: th * 0.72 }}>
                  {name}
                </div>
              ))}
              {DOTS.map((d, i) => {
                const k = 1 - span(d.x - 0.02, d.x + 0.04, sweep * 1.02)
                return k > 0 && <i key={i} className="nle-kf" style={{ left: lw + (P.w - lw) * d.x, top: rh + d.tr * th + th * 0.62, transform: `translate(-50%,-50%) rotate(45deg) scale(${k.toFixed(3)})` }} />
              })}
              <i className="nle-head" style={{ left: lw + (P.w - lw) * head }} />
            </div>
          )}
          {lb >= 5.25 && (
            <>
              <Code x={P.x} y={P.y + L.mono} prompt="$" segs={rm} n={t.n} caret={t.caret} />
              <div className="code small dim" style={{ left: P.x + L.mono * 1.2, top: P.y + L.mono * 2.6, opacity: out }}>{`removed 4 tracks, ${DOTS.length} keyframes`}</div>
            </>
          )}
        </>
      ),
    }
  },
}
