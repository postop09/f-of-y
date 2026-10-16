// DOM 글자 폭 측정. .word와 같은 글꼴 설정의 숨은 span 하나를 100px로 재고 캐시한다.
let probe: HTMLSpanElement | null = null
const widths = new Map<string, number>()

export const measureWord = (text: string, wght = 900, wdth = 125) => {
  if (!text) return 0
  const k = `${text}|${wght}|${wdth}`
  let w = widths.get(k)
  if (w == null) {
    if (!probe) {
      probe = document.createElement('span')
      probe.className = 'measure'
      probe.setAttribute('aria-hidden', 'true')
      document.body.appendChild(probe)
    }
    probe.style.fontVariationSettings = `"wght" ${wght}, "wdth" ${wdth}`
    probe.textContent = text
    w = probe.getBoundingClientRect().width || 1
    widths.set(k, w)
  }
  return w
}

export type Fit = { fs: number; w: number }

// font size that fits the word into maxW × maxH (line-height .8)
export const fit = (text: string, maxW: number, maxH: number, wght = 900, wdth = 125): Fit => {
  const ww = measureWord(text, wght, wdth) || 1
  const fs = Math.max(8, Math.min((100 * maxW) / ww, maxH / 0.8))
  return { fs, w: (ww * fs) / 100 }
}

export const textW = (text: string, fs: number, wght = 900, wdth = 125) => (measureWord(text, wght, wdth) * fs) / 100

export const clearWidthCache = () => widths.clear()
