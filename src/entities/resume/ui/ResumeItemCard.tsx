// 경력 항목 하나: 회사·기간·제목, 이미지 썸네일(있으면), 문제 → 해결 → 구현 → 결과, 카테고리 태그. 비어 있는 단계는 건너뛴다.
// 썸네일을 누르면 그 이미지부터 라이트박스로 크게 본다.
import { useState } from 'react'
import { Lightbox } from '@/shared/ui/Lightbox'
import { CATEGORY } from '../model/resume'
import type { ResumeItem } from '../model/types'
import './resumeItemCard.css'

const STEPS = [
  ['problem', '문제'],
  ['solution', '해결'],
  ['impl', '구현'],
  ['result', '결과'],
] as const

type Props = { item: ResumeItem; /** 질문과의 일치도 0..1 (있으면 제목 옆에) */ p?: number }

export const ResumeItemCard = ({ item, p }: Props) => {
  // 라이트박스로 보고 있는 이미지 (닫혀 있으면 null)
  const [open, setOpen] = useState<number | null>(null)
  const images = item.images ?? []
  return (
    <article className="ri">
      <header>
        <div className="ri-meta">
          {item.company} · {item.period}
          {p !== undefined && <span className="ri-p">{` · match ${p.toFixed(2)}`}</span>}
        </div>
        <h3>{item.title}</h3>
      </header>
      {images.length > 0 && (
        <div className="ri-figs">
          {images.map((img, i) => (
            <figure key={img.src}>
              <button type="button" onClick={() => setOpen(i)} aria-label={`${img.caption ?? img.alt} 크게 보기`}>
                {/* width·height: 불러오기 전에 자리를 잡아 새 차례로 스크롤할 때 밀리지 않게 */}
                <img src={img.src} alt={img.alt} width={img.w} height={img.h} loading="lazy" decoding="async" />
              </button>
              <figcaption>
                <span className="ri-fig-n">fig.{i + 1}</span>
                {img.caption && ` ${img.caption}`}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {STEPS.map(([key, label]) =>
        item[key].length ? (
          <section key={key} className={'ri-step ' + key}>
            <h4># {label}</h4>
            <ul>
              {item[key].map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        ) : null,
      )}
      <footer>
        {item.categories.map((c) => (
          <span key={c} className="ri-tag">
            {CATEGORY[c].label}
          </span>
        ))}
        {item.site && (
          <a className="ri-link" href={item.site} target="_blank" rel="noreferrer">
            사이트 ↗
          </a>
        )}
        {item.link && (
          <a className="ri-link" href={item.link} target="_blank" rel="noreferrer">
            문서 ↗
          </a>
        )}
      </footer>
      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </article>
  )
}
