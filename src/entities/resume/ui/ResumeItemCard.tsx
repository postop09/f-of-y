// 경력 항목 하나: 회사·기간·제목, 문제 → 해결 → 구현 → 결과, 카테고리 태그. 비어 있는 단계는 건너뛴다.
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

export const ResumeItemCard = ({ item, p }: Props) => (
  <article className="ri">
    <header>
      <div className="ri-meta">
        {item.company} · {item.period}
        {p !== undefined && <span className="ri-p">{` · match ${p.toFixed(2)}`}</span>}
      </div>
      <h3>{item.title}</h3>
    </header>
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
      {item.link && (
        <a className="ri-link" href={item.link} target="_blank" rel="noreferrer">
          문서 ↗
        </a>
      )}
    </footer>
  </article>
)
