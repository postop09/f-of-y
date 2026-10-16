// 큰 Archivo 단어. 글자마다 span 하나씩, 축(wght/wdth)은 style이 아니라 data-w / data-d로 넘긴다.
// font-variation-settings를 쓰는 곳은 스테이지의 렌즈 패스 하나뿐이라서 (커서 근처 글자를 깎는다).
import type { CSSProperties } from 'react'
import './word.css'

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
        <span key={i} className={`ch${o.sig ? ' sig' : ''}`} data-w={o.w ?? w} data-d={o.d ?? d} style={o.style}>
          {g === ' ' ? '\u00a0' : g}
        </span>
      )
    })}
  </div>
)
