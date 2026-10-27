// 20 ─ yours: "and now it's" — YOURS slams in, and a scan line turns it into the pixel field you get to play with.
// Everything is drawn on the canvas so the last frame is exactly the field the live mode starts from.
import { COL } from '@/shared/config'
import { type Seg, E, canvasFont, cell, hash, lerp, span, typeOn } from '@/shared/lib'
import { Code } from '@/shared/ui'
import { typeCues } from '../../lib/cues'
import { liveRaster } from '../../lib/liveWord'
import type { SceneSpec } from '../../model/types'

const LINE: Seg[] = [["and now it's", '']]

export const yours: SceneSpec = {
  id: 'yours',
  len: 4,
  text: "and now it's yours",
  // typed on thirty-seconds, YOURS slams in on beat 3, the scan turns it into cells across beat 4
  sfx: [...typeCues(LINE, 0), [2, 'boom'], [2, 'crash'], [3, 'blip', 2], [3.25, 'blip', 5], [3.5, 'blip', 7]],
  view: (f) => {
    const { L, lb } = f
    const t = typeOn(f, LINE, 0, 2)
    const on = lb >= 2
    return {
      cap: lb < 2 ? `type("and now it's")` : lb < 3 ? 'handoff(you)' : `field = raster("YOURS", ${L.cs})`,
      flash: on ? 0.25 * (1 - span(2, 2.3, lb)) : 0,
      shake: on ? 26 * (1 - span(2, 2.3, lb)) : 0,
      node: <Code x={L.M} y={L.TY} segs={LINE} n={t.n} caret={t.caret} />,
    }
  },
  draw: (g, f) => {
    const { L, lb } = f
    if (lb < 2) return
    const R = liveRaster(L, 'YOURS')
    const { lay, bbox } = R
    const cs = L.cs
    const k = span(3, 3.5, lb)
    const scan = lerp(bbox.x - cs, bbox.x + bbox.w + cs, k)
    const cx = lay.left + lay.width / 2
    // the word, right of the scan line, slammed in from 135%
    const s = lerp(1.35, 1, E.outExpo(span(2, 2.2, lb)))
    g.save()
    g.beginPath()
    g.rect(scan, 0, L.W, L.H)
    g.clip()
    g.translate(cx, lay.base)
    g.scale(s, s)
    g.translate(-cx, -lay.base)
    g.fillStyle = COL.ink
    g.textBaseline = 'alphabetic'
    canvasFont(g, lay.fs)
    g.fillText('YOURS', lay.left, lay.base)
    g.restore()
    // the cells, left of it
    for (const c of R.cells) if (c.x + cs <= scan) cell(g, c.x, c.y, cs, c.lime ? COL.sig : COL.ink)
    if (k > 0 && k < 1) {
      g.fillStyle = COL.sig
      g.fillRect(scan, bbox.y - cs, 2, bbox.h + 2 * cs)
    }
    // debris thrown up off the baseline by the slam
    const q = span(2, 2.8, lb)
    if (q > 0 && q < 1) {
      const e = E.outCubic(q)
      const size = Math.max(3, cs * 0.6) * (1 - q)
      g.fillStyle = COL.ink
      for (let i = 0; i < 26; i++) {
        const a = Math.PI + hash(77, i) * Math.PI
        const r = (0.35 + 0.65 * hash(77, i + 31)) * lay.width * 0.55 * e
        g.fillRect(cx + Math.cos(a) * r - size / 2, lay.base + Math.sin(a) * r * 0.55 - size / 2, size, size)
      }
    }
  },
}
