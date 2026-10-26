// 14 ─ pixel → 문제를 쪼개고 … 해답: a scan line turns the words into cells, rows slide, they scatter, the answer lands
import { COL } from '@/shared/config/typography'
import { E, hash, lerp, span } from '@/shared/lib/math'
import { type Layout, memo } from '@/shared/lib/layout'
import { canvasFit, canvasFont, cell, layoutAt, rasterize } from '@/shared/lib/canvasText'
import { type Seg, countOn, typeOn } from '@/shared/lib/typing'
import { Code } from '@/shared/ui/Code'
import { Word } from '@/shared/ui/Word'
import { typeCues } from '../../lib/cues'
import { wordSlot } from '../../lib/wordSlot'
import type { SceneSpec } from '../../model/types'

const TOP = '문제를'
const BOTTOM = '쪼개고'
const S1: Seg[] = [['하나씩 풀어서', '']]
/** typed in two bursts: before and after the scatter */
const S2A = '다시 엮어'
const S2B = ' 만든'
const nA = [...S2A].length
const nB = [...S2B].length
const ANSWER = '해답'

const pixelWords = (L: Layout) =>
  memo(L, 'every-pixel', () => {
    const w = (L.W - 2 * L.M) * 0.8
    const h = Math.min(L.H * 0.19, (L.H - L.TY) * 0.32)
    const fs = Math.min(canvasFit(TOP, w, h), canvasFit(BOTTOM, w, h))
    const y = L.TY - L.mono * 0.5
    const a = layoutAt(TOP, L.M, y, fs)
    const b = layoutAt(BOTTOM, L.M, y + fs * 1.05, fs)
    const cells = [...rasterize(TOP, a, L.cs), ...rasterize(BOTTOM, b, L.cs)].map((c, i) => ({ ...c, i, lime: hash(i, 7) < 0.07 }))
    const x0 = Math.min(...cells.map((c) => c.x))
    const x1 = Math.max(...cells.map((c) => c.x)) + L.cs
    return { lines: [a, b], cells, x0, x1, top: a.top }
  })
export const pixel: SceneSpec = {
  id: 'pixel',
  len: 8,
  text: '문제를 쪼개고 하나씩 풀어서 다시 엮어 만든 해답',
  // scan, two lines on thirty-seconds, rows slide at 3.75, scatter at 5, the answer lands at 6
  sfx: [[0.5, 'riser'], ...typeCues(S1, 2), [3.75, 'whoosh'], ...typeCues(S2A, 3.75, 1 / 8), [5, 'crash'], ...typeCues(S2B, 5, 1 / 8), [6, 'boom']],
  view: (f) => {
    const { L, lb } = f
    const s2: Seg[] = [[S2A, ''], [S2B, 'sig']]
    const t1 = typeOn(f, S1, 2)
    const n2 = countOn(lb, 3.75, nA, 1 / 8) + countOn(lb, 5, nB, 1 / 8)
    const x = Math.max(L.M, L.W * 0.56)
    const gone = 1 - span(5.75, 6, lb)
    const R = lb < 3.75 ? pixelWords(L) : null
    const word = wordSlot(L, ANSWER)
    const on = lb >= 6
    return {
      cap: lb < 2 ? `pieces = raster(problem, ${L.cs})${R ? `  // n=${R.cells.length}` : ''}` : lb < 5 ? 'px.x += row % 2 ? v : −v' : lb < 6 ? 'px.scatter()' : 'answer = vector(pieces)',
      flash: on ? 0.25 * (1 - span(6, 6.35, lb)) : 0,
      shake: on ? 16 * (1 - span(6, 6.35, lb)) : 0,
      node: (
        <>
          {lb >= 2 && gone > 0 && (
            <>
              <Code x={x} y={L.TY - L.mono * 3.6} segs={S1} n={t1.n} caret={lb < 3.75 && t1.caret} style={{ opacity: gone }} />
              <Code x={x} y={L.TY - L.mono * 2.2} segs={s2} n={n2} caret={lb >= 3.75 && (n2 < nA + nB ? lb < 3.75 + nA / 8 || (lb >= 5 && lb < 5 + nB / 8) || f.blink : f.blink)} style={{ opacity: gone }} />
            </>
          )}
          {on && <Word text={ANSWER} fs={word.fs} x={word.x} y={word.y} style={{ transform: `scale(${lerp(1.3, 1, E.outExpo(span(6, 6.4, lb)))})`, transformOrigin: '50% 60%' }} />}
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
        g.fillText(ln === R.lines[0] ? TOP : BOTTOM, ln.left, ln.base)
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
