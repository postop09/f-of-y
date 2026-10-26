// 18 ─ boom: debris on a closed-form trajectory
import { COL } from '@/shared/config/typography'
import { E, hash, lerp, span } from '@/shared/lib/math'
import { Word } from '@/shared/ui/Word'
import { wordSlot } from '../../lib/wordSlot'
import type { SceneSpec } from '../../model/types'

export const boom: SceneSpec = {
  id: 'boom',
  len: 2,
  text: '문제해결',
  // straight on the downbeat; no crash, since the drop's crash two beats earlier is still ringing
  sfx: [[0, 'boom']],
  view: (f) => {
    const { L, lb } = f
    // 문제해결 sits in the shared word slot (wordSlot), the same place and size as split's and pixel's words
    const B = wordSlot(L, '문제해결')
    const q = lb
    return {
      cap: `impact({ amp: ${Math.max(0, 8 - q * 6).toFixed(1)} })`,
      flash: q > 0 ? 0.35 * Math.exp(-q * 8) : 0,
      shake: q > 0 ? 34 * Math.exp(-q * 4) : 0,
      node: <Word text="문제해결" fs={B.fs} x={B.x} y={B.y} style={{ transform: `scale(${lerp(1.5, 1, E.outExpo(span(0, 0.3, q))).toFixed(4)})`, transformOrigin: '50% 60%' }} />,
    }
  },
  draw: (g, f) => {
    const { L, lb } = f
    const q = lb
    if (q <= 0) return
    const cx = L.W / 2
    const cy = L.H * 0.5 // the middle of the word slot
    const R = Math.max(L.W, L.H)
    const fade = 1 - span(0.9, 1.8, q)
    for (let i = 0; i < 110; i++) {
      const a = hash(i, 1) * Math.PI * 2
      const sp = (0.25 + hash(i, 2) * 0.75) * R * 0.9
      const e = 1 - Math.exp(-2.6 * q)
      const x = cx + Math.cos(a) * sp * e
      const y = cy + Math.sin(a) * sp * e * 0.6 + L.H * 0.5 * q * q
      const s = Math.max(2, L.cs * (0.4 + hash(i, 3) * 0.8)) * fade
      g.fillStyle = hash(i, 4) < 0.18 ? COL.sig : COL.ink
      g.fillRect(x - s / 2, y - s / 2, s, s)
    }
  },
}
