// 하단 바: 처음으로 버튼 + 스크롤 위치를 문지르는 스크러버. 스테이지에서 유일하게 포인터를 받는 곳.
import type { PointerEvent, Ref } from 'react'
import type { Scene } from '@/entities/scene/model/types'
import { pad } from '@/shared/lib/math'

type Props = {
  scenes: readonly Scene[]
  total: number
  idx: number
  /** 전체 진행률 0..1 */
  prog: number
  trackRef: Ref<HTMLDivElement>
  onHome: () => void
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: PointerEvent<HTMLDivElement>) => void
  onPointerUp: () => void
}

export const Transport = ({ scenes, total, idx, prog, trackRef, onHome, onPointerDown, onPointerMove, onPointerUp }: Props) => {
  const sc = scenes[idx]
  return (
    <div className="transport">
      <button type="button" aria-label="처음으로" onClick={onHome}>
        <svg viewBox="0 0 14 14" aria-hidden="true">
          <path d="M2 2h10v1.6H2zM7 4.6l5 5.6H8.4V13H5.6v-2.8H2z" />
        </svg>
      </button>
      <div
        id="scrub"
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="장면 위치"
        aria-valuemin={1}
        aria-valuemax={scenes.length}
        aria-valuenow={idx + 1}
        aria-valuetext={`${idx + 1}번째 장면, ${sc.id}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <i className="trk" />
        {scenes.map((s, i) => (
          <i key={s.id} className={'tk' + (i % 4 === 0 ? ' big' : '')} style={{ left: `${(s.at / total) * 100}%` }} />
        ))}
        <i className="fill" style={{ width: `${prog * 100}%` }} />
        <i className="head" style={{ left: `${prog * 100}%` }} />
      </div>
      <span className="scene-lb">{`${pad(idx + 1, 2)} ${sc.id.toUpperCase()}`}</span>
    </div>
  )
}
