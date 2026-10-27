// categories: 카테고리 목록. 이름을 누르면 그 카테고리의 항목을 쌓는다.
import { type CategoryId, CATEGORIES, itemsIn } from '@/entities/resume'
import './commandList.css'

export const CategoryList = ({ onCategory }: { onCategory: (cat: CategoryId) => void }) => (
  <div className="ex-list">
    <dl>
      {CATEGORIES.map((c) => (
        <div key={c.id}>
          <dt>
            <button type="button" onClick={() => onCategory(c.id)}>
              {c.label}
            </button>
          </dt>
          <dd className="dim">{`${itemsIn(c.id).length}개 항목`}</dd>
        </div>
      ))}
    </dl>
  </div>
)
