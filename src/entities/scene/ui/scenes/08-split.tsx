// 08 ─ split → 독고다이: the wall between teams drops in, a blade crosses it, and the halves drift apart
import { E, lerp, span } from '@/shared/lib/math'
import { Word } from '@/shared/ui/Word'
import { wordSlot } from '../../lib/wordSlot'
import type { SceneSpec } from '../../model/types'

const BIG = '독고다이'

export const split: SceneSpec = {
  id: 'split',
  len: 4,
  text: '팀 사이의 독고다이, 그리고 갈라진다',
  // the word lands on the downbeat, the blade sweeps in on the off-beat and cuts on beat 2,
  // then the halves spring apart and keep drifting a little, staying on screen
  sfx: [[0, 'boom'], [0.5, 'whoosh'], [1, 'shing']],
  view: (f) => {
    const { L, lb } = f
    const word = wordSlot(L, BIG)
    const blade = E.outCubic(span(0.5, 1, lb))
    const cut = lb >= 1
    // top half up and right, bottom half down and left: a quick crack, then a slow drift
    const e = E.outExpo(span(1, 1.5, lb)) + 0.6 * span(1.5, 4, lb)
    const dx = e * word.w * 0.05
    const dy = e * word.fs * 0.06
    const rot = 0.6 * e
    return {
      cap: lb < 0.5 ? 'wall = between(teams)' : !cut ? 'blade.cut(y = 0.5)' : `clip(y < 0.5).x += ${dx.toFixed(0)}px`,
      flash: cut ? 0.12 * (1 - span(1, 1.25, lb)) : 0.25 * (1 - span(0, 0.35, lb)),
      shake: cut ? 10 * (1 - span(1, 1.25, lb)) : 16 * (1 - span(0, 0.35, lb)),
      node: (
        <>
          {!cut && <Word text={BIG} fs={word.fs} x={word.x} y={word.y} style={{ transform: `scale(${lerp(1.3, 1, E.outExpo(span(0, 0.4, lb)))})`, transformOrigin: '50% 60%' }} />}
          {cut && (
            <>
              <Word text={BIG} fs={word.fs} x={word.x} y={word.y} style={{ clipPath: 'inset(-10% -5% 50% -5%)', transform: `translate(${dx.toFixed(1)}px,${(-dy).toFixed(1)}px) rotate(${(-rot).toFixed(3)}deg)` }} />
              <Word text={BIG} fs={word.fs} x={word.x} y={word.y} style={{ clipPath: 'inset(50% -5% -10% -5%)', transform: `translate(${(-dx).toFixed(1)}px,${dy.toFixed(1)}px) rotate(${rot.toFixed(3)}deg)` }} />
            </>
          )}
          {blade > 0 && <div className="bar sigbg" style={{ left: 0, top: word.y + word.fs * 0.4 - 1, width: blade * L.W, height: 2, opacity: 1 - span(1.05, 1.5, lb) }} />}
        </>
      ),
    }
  },
}
