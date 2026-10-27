// 캔버스 글자 측정·배치·래스터화. DOM 단어와 같은 Archivo 900 / wdth 125로 맞춘다.
import { FAM, MONO } from '@/shared/config'
import { hash } from './math'

const STRETCH = typeof CanvasRenderingContext2D !== 'undefined' && 'fontStretch' in CanvasRenderingContext2D.prototype
let mctx: CanvasRenderingContext2D | null = null
const measureCtx = () => (mctx ||= document.createElement('canvas').getContext('2d')!)

export const canvasFont = (ctx: CanvasRenderingContext2D, px: number) => {
  ctx.font = `900 ${px}px ${FAM}`
  if (STRETCH) ctx.fontStretch = 'expanded' // = wdth 125, same as the DOM words
  if ('fontKerning' in ctx) ctx.fontKerning = 'none'
}

export const monoW = (text: string, px: number, weight = 500) => {
  const c = measureCtx()
  c.font = `${weight} ${px}px ${MONO}`
  return c.measureText(text).width
}

export type CanvasWord = { fs: number; left: number; top: number; base: number; width: number }

// canvas word placed with its top-left at (x, y) and the given size
export const layoutAt = (text: string, x: number, y: number, fs: number): CanvasWord => {
  const c = measureCtx()
  canvasFont(c, 100)
  const width = (c.measureText(text).width * fs) / 100
  return { fs, left: x, top: y, base: y + 0.734 * fs, width } // .734 = Archivo baseline at line-height .8
}

export const canvasFit = (text: string, maxW: number, maxH: number) => {
  const c = measureCtx()
  canvasFont(c, 100)
  const adv = Math.max(1, c.measureText(text).width)
  return Math.max(8, Math.min((100 * maxW) / adv, maxH / 0.8))
}

export type Cell = { x: number; y: number; i: number; lime: boolean }

// Text → grid of cells: draw it small on an offscreen canvas, sample each cell for ink.
export const rasterize = (text: string, lay: CanvasWord, cs: number): Cell[] => {
  const padd = cs * 2
  const Wc = Math.ceil(lay.width + padd * 2)
  const Hc = Math.ceil(lay.fs * 1.15 + padd * 2)
  const r = 4 / cs
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.ceil(Wc * r))
  c.height = Math.max(1, Math.ceil(Hc * r))
  const x = c.getContext('2d', { willReadFrequently: true })!
  x.scale(r, r)
  canvasFont(x, lay.fs)
  x.fillStyle = '#fff'
  x.textBaseline = 'alphabetic'
  const ox = lay.left - padd
  const oy = lay.base - lay.fs * 0.95 - padd
  x.fillText(text, lay.left - ox, lay.base - oy)
  const img = x.getImageData(0, 0, c.width, c.height).data
  const cw = c.width
  const chh = c.height
  const cells: Cell[] = []
  for (let gy = 0; gy * cs < Hc; gy++)
    for (let gx = 0; gx * cs < Wc; gx++) {
      let sum = 0
      for (let sy = 0; sy < 3; sy++)
        for (let sx = 0; sx < 3; sx++) {
          const px = Math.min(cw - 1, Math.floor((gx * cs + ((sx + 0.5) * cs) / 3) * r))
          const py = Math.min(chh - 1, Math.floor((gy * cs + ((sy + 0.5) * cs) / 3) * r))
          sum += img[(py * cw + px) * 4 + 3]
        }
      if (sum / 9 > 110) {
        const i = cells.length
        cells.push({ x: ox + gx * cs, y: oy + gy * cs, i, lime: hash(i, 7) < 0.07 })
      }
    }
  return cells
}

export type OMetrics = { cx: number; cy: number; cw: number; ch: number }

// Outer outline and inner counter of a ring-shaped letter (O, 0), as fractions of the font size.
export const measureO = (ch = 'O'): OMetrics => {
  const z = 200
  const c = document.createElement('canvas')
  c.width = z * 1.6
  c.height = z * 1.4
  const x = c.getContext('2d', { willReadFrequently: true })!
  canvasFont(x, z)
  x.fillStyle = '#fff'
  x.textBaseline = 'alphabetic'
  const base = z * 1.1
  x.fillText(ch, 0, base)
  const d = x.getImageData(0, 0, c.width, c.height).data
  const W = c.width
  const H = c.height
  const ink = (px: number, py: number) => d[(py * W + px) * 4 + 3] > 128
  let x0 = W
  let x1 = 0
  let y0 = H
  let y1 = 0
  for (let py = 0; py < H; py++)
    for (let px = 0; px < W; px++)
      if (ink(px, py)) {
        if (px < x0) x0 = px
        if (px > x1) x1 = px
        if (py < y0) y0 = py
        if (py > y1) y1 = py
      }
  if (x1 <= x0) return { cx: 0.45, cy: -0.36, cw: 0.2, ch: 0.14 }
  const cx = Math.round((x0 + x1) / 2)
  const cy = Math.round((y0 + y1) / 2)
  let l = cx
  let r = cx
  let t = cy
  let bt = cy
  while (l > x0 && !ink(l, cy)) l--
  while (r < x1 && !ink(r, cy)) r++
  while (t > y0 && !ink(cx, t)) t--
  while (bt < y1 && !ink(cx, bt)) bt++
  return { cx: cx / z, cy: (cy - base) / z, cw: (r - l) / 2 / z, ch: (bt - t) / 2 / z }
}

export const cell = (g: CanvasRenderingContext2D, x: number, y: number, cs: number, color: string, scale = 1, stretch = 1) => {
  if (scale <= 0.02) return
  const s = cs * 0.82 * scale
  const o = (cs - s) / 2
  g.fillStyle = color
  g.fillRect(x + o, y + o, s * stretch, s)
}
