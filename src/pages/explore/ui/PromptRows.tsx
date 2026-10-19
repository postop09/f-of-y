// explore 화면 맨 위: 영상의 01 boot 장면과 같은 자리의 줄 번호와 강조된 현재 줄. 그 줄에 프롬프트(children)가 들어간다.
import type { ReactNode } from 'react'
import '@/entities/scene/ui/scenes.css'
import type { Layout } from '@/shared/lib/layout'
import { pad, range } from '@/shared/lib/math'

/** 현재 줄의 번호 (영상의 `run start`가 05번 줄이었으니 그다음) */
const LINE = 6

type Props = {
  /** the layout of the viewport (positions match the film's boot scene) */
  L: Layout | null
  children: ReactNode
}

export const PromptRows = ({ L, children }: Props) => {
  if (!L) return null
  const rowH = L.mono * 1.9
  const y = L.TY
  const hx = Math.max(0, L.M - L.mono * 3)
  return (
    <div className="prompt-rows" style={{ height: y + rowH * 1.2 }}>
      {range(-3, 0).map((i) => (
        <div key={i} className={'ln' + (i === 0 ? ' cur' : '')} style={{ left: L.gx, top: y + i * rowH + L.mono * 0.14, opacity: i === 0 ? 1 : 0.5 }} aria-hidden="true">
          {pad(LINE + i, 2)}
        </div>
      ))}
      <div className="rowhl" style={{ left: hx, top: y - L.mono * 0.3, width: L.W - L.M * 0.5 - hx, height: L.mono * 1.95 }} aria-hidden="true" />
      <div className="prompt-row" style={{ left: L.M, top: y, width: L.W - L.M * 1.5 }}>
        {children}
      </div>
    </div>
  )
}
