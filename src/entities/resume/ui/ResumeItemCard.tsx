// 경력 항목 하나: 회사·기간·제목, 이미지·영상 썸네일(있으면), 문제 → 해결 → 구현 → 결과, 카테고리 태그. 비어 있는 단계는 건너뛴다.
// 썸네일을 누르면 거기부터 라이트박스로 크게 본다(영상은 거기서 재생). 썸네일의 영상은 첫 프레임만 (preload metadata).
import { useState } from 'react'
import { Lightbox } from '@/shared/ui'
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
  // 라이트박스로 보고 있는 이미지·영상 (닫혀 있으면 null)
  const [open, setOpen] = useState<number | null>(null)
  const media = item.media ?? []
  return (
    <article className="ri">
      <header>
        <div className="ri-meta">
          {item.company} · {item.period}
          {p !== undefined && <span className="ri-p">{` · match ${p.toFixed(2)}`}</span>}
        </div>
        <h3>{item.title}</h3>
      </header>
      {media.length > 0 && (
        <div className="ri-figs">
          {media.map((m, i) => (
            <figure key={m.src}>
              <button type="button" onClick={() => setOpen(i)} aria-label={`${m.caption ?? m.alt} ${m.kind === 'video' ? '재생' : '크게 보기'}`}>
                {/* width·height: 불러오기 전에 자리를 잡아 새 차례로 스크롤할 때 밀리지 않게 */}
                {m.kind === 'video' ? (
                  <>
                    <video src={m.src} width={m.w} height={m.h} preload="metadata" muted playsInline aria-hidden tabIndex={-1} />
                    <span className="ri-fig-play" aria-hidden>
                      ▶
                    </span>
                  </>
                ) : (
                  <img src={m.src} alt={m.alt} width={m.w} height={m.h} loading="lazy" decoding="async" />
                )}
              </button>
              <figcaption>
                <span className="ri-fig-n">fig.{i + 1}</span>
                {m.caption && ` ${m.caption}`}
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
      {open !== null && <Lightbox items={media} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </article>
  )
}
