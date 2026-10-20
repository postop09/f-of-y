// 큰 Archivo 단어. 글자마다 span 하나씩, 축(wght/wdth)은 w / d 또는 ch()로 넘긴다.
// 기본 축(900 / 125)은 .word가 갖고, 다른 글자만 font-variation-settings를 직접 단다.
import type { CSSProperties } from 'react'
import { clamp } from '@/shared/lib/math'
import './word.css'

const axes = (w: number, d: number): CSSProperties | undefined =>
  w === 900 && d === 125 ? undefined : { fontVariationSettings: `"wght" ${clamp(w, 100, 900) | 0}, "wdth" ${clamp(d, 62, 125).toFixed(1)}` }

/** ch(i, c)가 돌려주는 글자별 덮어쓰기 */
export type Glyph = {
  text?: string
  sig?: boolean
  w?: number
  d?: number
  style?: CSSProperties
}

type Props = {
  text: string
  fs: number
  x: number
  y: number
  w?: number
  d?: number
  className?: string
  style?: CSSProperties
  ch?: (i: number, c: string) => Glyph | null | undefined
}

export const Word = ({ text, fs, x, y, w = 900, d = 125, className = '', style, ch }: Props) => (
  <div className={`word ${className}`} style={{ left: x, top: y, fontSize: fs, ...style }} aria-hidden="true">
    {[...text].map((c, i) => {
      const o = (ch && ch(i, c)) || {}
      const g = o.text ?? c
      return (
        <span key={i} className={`ch${o.sig ? ' sig' : ''}`} style={{ ...axes(o.w ?? w, o.d ?? d), ...o.style }}>
          {g === ' ' ? '\u00a0' : g}
        </span>
      )
    })}
  </div>
)
