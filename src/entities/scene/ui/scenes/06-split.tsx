// 06 ─ split: WORD drops in, a blade crosses it, and the halves drift off screen at one steady speed
import { E, lerp, span } from '@/shared/lib/math'
import { Word } from '@/shared/ui/Word'
import { wordSlot } from '../../lib/wordSlot'
import type { SceneSpec } from '../../model/types'

export const split: SceneSpec = {
  id: 'split',
  len: 4,
  text: 'a word, and it splits',
  // WORD lands on the downbeat, the blade sweeps in on the off-beat and cuts on beat 2,
  // then the halves leave at a constant speed and are gone just before the scene ends
  sfx: [[0, 'boom'], [0.5, 'whoosh'], [1, 'shing']],
  view: (f) => {
    const { L, lb } = f
    const word = wordSlot(L)
    const blade = E.outCubic(span(0.5, 1, lb))
    const cut = lb >= 1
    // top half up and right, bottom half down and left
    const fly = span(1, 3.75, lb)
    const dx = fly * L.W
    const dy = fly * L.H * 0.18
    const rot = 14 * fly
    return {
      cap: lb < 0.5 ? 'word = vector(pixels)' : !cut ? 'blade.cut(y = 0.5)' : `clip(y < 0.5).x += ${dx.toFixed(0)}px`,
      flash: cut ? 0.12 * (1 - span(1, 1.25, lb)) : 0.25 * (1 - span(0, 0.35, lb)),
      shake: cut ? 10 * (1 - span(1, 1.25, lb)) : 16 * (1 - span(0, 0.35, lb)),
      node: (
        <>
          {!cut && <Word text="WORD" fs={word.fs} x={word.x} y={word.y} style={{ transform: `scale(${lerp(1.3, 1, E.outExpo(span(0, 0.4, lb)))})`, transformOrigin: '50% 60%' }} />}
          {cut && (
            <>
              <Word text="WORD" fs={word.fs} x={word.x} y={word.y} style={{ clipPath: 'inset(-10% -5% 50% -5%)', transform: `translate(${dx.toFixed(1)}px,${(-dy).toFixed(1)}px) rotate(${(-rot).toFixed(3)}deg)` }} />
              <Word text="WORD" fs={word.fs} x={word.x} y={word.y} style={{ clipPath: 'inset(50% -5% -10% -5%)', transform: `translate(${(-dx).toFixed(1)}px,${dy.toFixed(1)}px) rotate(${rot.toFixed(3)}deg)` }} />
            </>
          )}
          {blade > 0 && <div className="bar sigbg" style={{ left: 0, top: word.y + word.fs * 0.4 - 1, width: blade * L.W, height: 2, opacity: 1 - span(1.05, 1.5, lb) }} />}
        </>
      ),
    }
  },
}
