// what Jev decided: the top categories as cell bars
import { type ExploreResult, CATEGORIES, top } from '@/entities/resume'
import { CellBar } from '@/shared/ui'
import './decision.css'

export const Decision = ({ r, empty }: { r: ExploreResult; empty: boolean }) => {
  const cats = top(CATEGORIES.map((c) => ({ c, p: r.categories[c.id] })))
  return (
    <div className="ex-decision">
      {empty ? (
        <p className="ex-miss"># 이력서와 관련된 질문을 해 주세요. categories 로 카테고리별로 둘러볼 수도 있어요.</p>
      ) : (
        <ul className="ex-cat-probs">
          {cats.map(({ c, p }, i) => (
            <li key={c.id} className={i === 0 ? 'top' : ''}>
              <span className="ex-arrow">{i === 0 ? '→' : ' '}</span>
              <span className="ex-cat-label">{c.label}</span>
              <CellBar value={p} />
              <span className="ex-num">{p.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
