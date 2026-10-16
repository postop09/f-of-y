// Glyphs near the cursor lose weight and width. This pass is the only writer
// of font-variation-settings; scenes hand over their axes as data-w / data-d.
import type { Layout } from '@/shared/lib/layout'
import { clamp } from '@/shared/lib/math'
import type { Pointer } from '../model/motion'

const axes = new WeakMap<HTMLElement, number>()

const setAxes = (el: HTMLElement, w: number, d: number) => {
  const k = (w | 0) * 10000 + Math.round(d * 10)
  if (axes.get(el) === k) return
  axes.set(el, k)
  el.style.fontVariationSettings = `"wght" ${w | 0}, "wdth" ${d.toFixed(1)}`
}

export const lensPass = (root: HTMLElement | null, ptr: Pointer, L: Layout) => {
  if (!root) return
  const chars = root.querySelectorAll<HTMLElement>('.ch')
  const R = Math.min(L.W, L.H) * 0.24
  const rects = ptr.in ? Array.from(chars, (c) => c.getBoundingClientRect()) : null
  chars.forEach((c, i) => {
    let w = +(c.dataset.w ?? '') || 900
    let d = +(c.dataset.d ?? '') || 125
    if (rects) {
      const r = rects[i]
      const dist = Math.hypot(r.left + r.width / 2 - ptr.x, r.top + r.height / 2 - ptr.y)
      if (dist < R) {
        const b = (1 - dist / R) ** 2
        w -= 560 * b
        d -= 34 * b
      }
    }
    setAxes(c, clamp(w, 100, 900), clamp(d, 62, 125))
  })
}
