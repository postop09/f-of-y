// 06 ─ pixel: a scan line turns the word into cells, rows slide, they scatter, and the WORD they make is cut in two
import { COL } from '@/shared/config/typography'
import { E, hash, lerp, span } from '@/shared/lib/math'
import { type Layout, memo } from '@/shared/lib/layout'
import { fit } from '@/shared/lib/textMeasure'
import { canvasFit, canvasFont, cell, layoutAt, rasterize } from '@/shared/lib/canvasText'
import { type Seg, countOn, typeOn } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { centre } from '../../lib/centre'
import { typeCues } from '../../lib/cues'
import type { SceneSpec } from '../../model/types'

const pixelWords = (L: Layout) =>
  memo(L, 'every-pixel', () => {
    const w = (L.W - 2 * L.M) * 0.8
    const h = Math.min(L.H * 0.19, (L.H - L.TY) * 0.32)
    const fs = Math.min(canvasFit('EVERY', w, h), canvasFit('PIXEL', w, h))
    const y = L.TY - L.mono * 0.5
    const a = layoutAt('EVERY', L.M, y, fs)
    const b = layoutAt('PIXEL', L.M, y + fs * 0.92, fs)
    const cells = [...rasterize('EVERY', a, L.cs), ...rasterize('PIXEL', b, L.cs)].map((c, i) => ({ ...c, i, lime: hash(i, 7) < 0.07 }))
    const x0 = Math.min(...cells.map((c) => c.x))
    const x1 = Math.max(...cells.map((c) => c.x)) + L.cs
    return { lines: [a, b], cells, x0, x1, top: a.top }
  })
export const pixel: SceneSpec = {
  id: 'pixel',
  len: 8,
  text: 'every pixel on this screen is moving off a word, and it splits',
  // scan, two lines on thirty-seconds, rows slide at 3.75, scatter at 5, WORD lands at 6,
  // the blade sweeps in on the off-beat and cuts it on the clap at 7
  sfx: [[0.5, 'riser'], ...typeCues('on this screen', 2), [3.75, 'whoosh'], ...typeCues('is moving', 3.75, 1 / 8), [5, 'crash'], ...typeCues(' off a', 5, 1 / 8), [6, 'boom'], [6.5, 'whoosh'], [7, 'shing']],
  view: (f) => {
    const { L, lb } = f
    const s1: Seg[] = [['on this screen', '']]
    const s2: Seg[] = [['is moving', ''], [' off a', 'sig']]
    const t1 = typeOn(f, s1, 2)
    const n2 = countOn(lb, 3.75, 9, 1 / 8) + countOn(lb, 5, 6, 1 / 8)
    const x = Math.max(L.M, L.W * 0.56)
    const gone = 1 - span(5.75, 6, lb)
    const R = lb < 3.75 ? pixelWords(L) : null
    const word = fit('WORD', (L.W - 2 * L.M) * 0.92, L.H * 0.34)
    const p = centre(L, word, 0.5)
    const on = lb >= 6
    // the split: a blade crosses at half height, then the halves drift apart
    const blade = E.outCubic(span(6.5, 7, lb))
    const cut = lb >= 7
    const e = E.outExpo(span(7, 7.5, lb)) + 0.6 * span(7.5, 8, lb)
    const dx = e * word.w * 0.05
    const dy = e * word.fs * 0.06
    return {
      cap:
        lb < 2 ? `pixels = raster(text, ${L.cs})${R ? `  // n=${R.cells.length}` : ''}`
        : lb < 5 ? 'px.x += row % 2 ? v : −v'
        : lb < 6 ? 'px.scatter()'
        : lb < 6.5 ? 'word = vector(pixels)'
        : !cut ? 'blade.cut(y = 0.5)'
        : `clip(y < 0.5).x += ${dx.toFixed(0)}px`,
      flash: cut ? 0.12 * (1 - span(7, 7.25, lb)) : on ? 0.25 * (1 - span(6, 6.35, lb)) : 0,
      shake: cut ? 10 * (1 - span(7, 7.25, lb)) : on ? 16 * (1 - span(6, 6.35, lb)) : 0,
      node: (
        <>
          {lb >= 2 && gone > 0 && (
            <>
              <Code x={x} y={L.TY - L.mono * 3.6} segs={s1} n={t1.n} caret={lb < 3.75 && t1.caret} style={{ opacity: gone }} />
              <Code x={x} y={L.TY - L.mono * 2.2} segs={s2} n={n2} caret={lb >= 3.75 && (n2 < 15 ? lb < 4.875 || (lb >= 5 && lb < 5.75) || f.blink : f.blink)} style={{ opacity: gone }} />
            </>
          )}
          {on && !cut && <Word text="WORD" fs={word.fs} x={p.x} y={p.y} style={{ transform: `scale(${lerp(1.3, 1, E.outExpo(span(6, 6.4, lb)))})`, transformOrigin: '50% 60%' }} />}
          {cut && (
            <>
              <Word text="WORD" fs={word.fs} x={p.x} y={p.y} style={{ clipPath: 'inset(-10% -5% 50% -5%)', transform: `translate(${dx.toFixed(1)}px,${(-dy).toFixed(1)}px) rotate(${(-0.6 * e).toFixed(3)}deg)` }} />
              <Word text="WORD" fs={word.fs} x={p.x} y={p.y} style={{ clipPath: 'inset(50% -5% -10% -5%)', transform: `translate(${(-dx).toFixed(1)}px,${dy.toFixed(1)}px) rotate(${(0.6 * e).toFixed(3)}deg)` }} />
            </>
          )}
          {blade > 0 && <div className="bar sigbg" style={{ left: 0, top: p.y + word.fs * 0.4 - 1, width: blade * L.W, height: 2, opacity: 1 - span(7.05, 7.5, lb) }} />}
        </>
      ),
    }
  },
  draw: (g, f) => {
    const { L, lb } = f
    if (lb >= 6) return
    const R = pixelWords(L)
    const cs = L.cs
    const appear = span(0, 0.5, lb)
    const k = span(0.5, 2, lb)
    const scan = lerp(R.x0 - cs, R.x1 + cs, k)
    const slide = E.inOutCubic(span(3.75, 4.75, lb))
    const out = E.inCubic(span(5, 5.75, lb))
    const flick = Math.floor(lb * 6)
    g.globalAlpha = appear
    if (k < 1) {
      g.save()
      g.beginPath()
      g.rect(scan, 0, L.W, L.H)
      g.clip()
      g.fillStyle = COL.ink
      g.textBaseline = 'alphabetic'
      for (const ln of R.lines) {
        canvasFont(g, ln.fs)
        g.fillText(ln === R.lines[0] ? 'EVERY' : 'PIXEL', ln.left, ln.base)
      }
      g.restore()
    }
    for (const c of R.cells) {
      if (c.x + cs > scan) continue
      const row = Math.round((c.y - R.top) / cs)
      const dir = row % 2 ? 1 : -1
      const mag = Math.floor(hash(row, 11) * 7 + 1) * cs * (row % 3 === 0 ? 2 : 1)
      const x = c.x + Math.round((dir * mag * slide) / cs) * cs + (hash(c.i, 13) - 0.5) * L.W * out
      const y = c.y + (hash(c.i, 14) - 0.3) * L.H * 0.5 * out
      const lime = c.lime || (lb > 2 && hash(c.i, flick) < 0.03)
      cell(g, x, y, cs, lime ? COL.sig : COL.ink, 1 - out, 1 + 2.2 * slide * hash(c.i, 12) * (1 - out))
    }
    if (k > 0 && k < 1) {
      g.fillStyle = COL.sig
      g.fillRect(scan, R.top - cs, 2, R.lines[1].base - R.top + cs * 3)
    }
    g.globalAlpha = 1
  },
}
