// 이미지 한 장을 화면 가득: 처음엔 화면에 맞추고, 누르면 원본 크기(넘치면 스크롤). ←/→ 로 넘기고 Esc·바깥 클릭으로 닫는다.
// 네이티브 <dialog> 의 showModal 이라 포커스 가두기·뒤쪽 inert 는 브라우저가 한다. 열려 있을 때만 그린다.
import { type KeyboardEvent, useLayoutEffect, useRef, useState } from 'react'
import './lightbox.css'

export type LightboxImage = { src: string; alt: string; caption?: string; w: number; h: number }

type Props = {
  images: readonly LightboxImage[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
}

export const Lightbox = ({ images, index, onIndex, onClose }: Props) => {
  const ref = useRef<HTMLDialogElement>(null)
  // 원본 크기로 보는 중인 이미지 (다른 장으로 넘기면 다시 화면에 맞춤)
  const [full, setFull] = useState<number | null>(null)
  const img = images[index]
  const n = images.length
  const zoomed = full === index

  // layout effect: 닫을 때 dialog 가 아직 DOM 에 있어야 close() 가 포커스를 썸네일로 돌려준다
  useLayoutEffect(() => {
    const d = ref.current
    if (!d) return
    d.showModal()
    // 첫 포커스는 ← 대신 닫기에
    d.querySelector<HTMLElement>('.lb-close')?.focus()
    document.documentElement.classList.add('lightbox-open')
    return () => {
      d.close()
      document.documentElement.classList.remove('lightbox-open')
    }
  }, [])

  const step = (by: number) => onIndex((index + by + n) % n)

  const onKeyDown = (e: KeyboardEvent) => {
    // preventDefault: 바깥(explore 의 Esc → 영상으로)이 이 키를 다시 처리하지 않게
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (n > 1 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault()
      step(e.key === 'ArrowLeft' ? -1 : 1)
    }
  }

  return (
    <dialog
      ref={ref}
      className={'lightbox' + (zoomed ? ' full' : '')}
      aria-label={img.caption ?? img.alt}
      onKeyDown={onKeyDown}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      // 이미지 바깥(빈 곳)을 누르면 닫는다
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('lb-stage')) onClose()
      }}
    >
      <div className="lb-stage">
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          width={img.w}
          height={img.h}
          title={zoomed ? '화면에 맞추기' : '원본 크기'}
          onClick={() => setFull(zoomed ? null : index)}
        />
      </div>
      <div className="lb-bar">
        <span className="lb-cap">
          <span className="lb-num">{`fig.${index + 1}${n > 1 ? `/${n}` : ''}`}</span>
          {img.caption && ` ${img.caption}`}
        </span>
        <span className="lb-ctl">
          {n > 1 && (
            <>
              <button type="button" onClick={() => step(-1)} aria-label="이전 이미지">
                ←
              </button>
              <button type="button" onClick={() => step(1)} aria-label="다음 이미지">
                →
              </button>
            </>
          )}
          <button type="button" className="lb-close" onClick={onClose}>
            [esc] close
          </button>
        </span>
      </div>
    </dialog>
  )
}
