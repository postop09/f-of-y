// 하단 바: 처음으로(끝까지 보면 다시 재생) 버튼 + 스크롤 위치를 문지르는 스크러버 + 소리 버튼. 스테이지에서 유일하게 포인터를 받는 곳.
// 자동 재생 중(locked)에는 진행만 보여 주고 처음으로·스크러버는 받지 않는다. 소리 버튼은 언제나 된다.
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
  locked: boolean
  /** 끝까지 왔다: 처음으로 대신 다시 재생 */
  ended: boolean
  muted: boolean
  onMute: () => void
  onHome: () => void
  onReplay: () => void
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: PointerEvent<HTMLDivElement>) => void
  onPointerUp: () => void
}

export const Transport = ({ scenes, total, idx, prog, trackRef, locked, ended, muted, onMute, onHome, onReplay, onPointerDown, onPointerMove, onPointerUp }: Props) => {
  const sc = scenes[idx]
  return (
    <div className={'transport' + (locked ? ' locked' : '')}>
      <button type="button" className="home" aria-label={ended ? '다시 재생' : '처음으로'} disabled={locked} onClick={ended ? onReplay : onHome}>
        {ended ? (
          <svg viewBox="0 0 14 14" aria-hidden="true">
            <path d="M11.6 7.4A4.6 4.6 0 1 1 7.2 2.5h1.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8.4 0.2l3.1 2.3-3.1 2.3z" />
          </svg>
        ) : (
          <svg viewBox="0 0 14 14" aria-hidden="true">
            <path d="M2 2h10v1.6H2zM7 4.6l5 5.6H8.4V13H5.6v-2.8H2z" />
          </svg>
        )}
      </button>
      <div
        id="scrub"
        ref={trackRef}
        role="slider"
        tabIndex={locked ? -1 : 0}
        aria-disabled={locked || undefined}
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
      <button type="button" aria-label={muted ? '소리 켜기' : '소리 끄기'} aria-pressed={muted} onClick={onMute}>
        <svg viewBox="0 0 16 14" aria-hidden="true">
          <path d="M1 4.5h3l4-3.5v12l-4-3.5H1z" />
          {muted ? (
            <path d="M10.6 4.6l4 4.8M14.6 4.6l-4 4.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
          ) : (
            <path d="M10.6 4.3a4 4 0 0 1 0 5.4M12.7 2.3a7 7 0 0 1 0 9.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
          )}
        </svg>
      </button>
    </div>
  )
}
