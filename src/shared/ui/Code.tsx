// 모노 한 줄. `n` 글자까지만 보이고, 블록 캐럿이 따라붙는다.
import type { CSSProperties } from 'react'
import { type Seg, sliceCounts } from '@/shared/lib/typing'
import './code.css'

type Props = {
  x: number
  y: number
  segs: readonly Seg[]
  n?: number
  caret?: boolean
  prompt?: string
  className?: string
  style?: CSSProperties
  bodyStyle?: CSSProperties
}

export const Code = ({ x, y, segs, n = Infinity, caret = false, prompt, className = '', style, bodyStyle }: Props) => {
  const counts = sliceCounts(segs, n)
  return (
    <div className={`code ${className}`} style={{ left: x, top: y, ...style }}>
      {prompt && <span className="p">{prompt}&nbsp;</span>}
      <span className="bd" style={bodyStyle}>
        {segs.map(([t, cls], i) => (
          <span key={i} className={cls}>
            {[...t].slice(0, counts[i]).join('')}
          </span>
        ))}
      </span>
      <span className="caret" style={{ visibility: caret ? 'visible' : 'hidden' }} />
    </div>
  )
}
