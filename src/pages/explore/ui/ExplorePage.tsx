// explore: 영상 끝 live 입력칸에 explore 를 치고 버튼을 누르면 오는 이력서 탐색 화면.
// 터미널 세션 하나처럼 위에서 아래로 쌓인다: 프롬프트 줄(`$ ▮`, 여기에 질문을 친다) → 예시 → 카테고리 → 결과.
// 질문은 Jev(/api/explore)가 카테고리와 경력 항목을 골라 확률과 함께 돌려주고, 화면은 그 항목을 이력서 데이터로 그린다.
// 카테고리 칩은 Jev 없이 바로 거른다.
import { useEffect, useRef, useState } from 'react'
import type { ExploreResult } from '@/entities/resume/lib/jev'
import { CATEGORIES, CATEGORY, ITEM, ITEMS } from '@/entities/resume/model/resume'
import type { CategoryId, ResumeItem } from '@/entities/resume/model/types'
import { ResumeItemCard } from '@/entities/resume/ui/ResumeItemCard'
import { ask } from '@/features/explore-resume/api/ask'
import { AskLine } from '@/features/explore-resume/ui/AskLine'
import { REDUCE } from '@/shared/config/motion'
import { CellBar } from '@/shared/ui/CellBar'
import { useViewportLayout } from '../lib/useViewportLayout'
import { PromptRows } from './PromptRows'
import './explore.css'

const EXAMPLES = ['디자인 시스템을 만들어 본 적 있나요?', 'AI를 개발에 어떻게 쓰나요?', '장애 대응은 어떻게 하나요?']
/** 이보다 낮은 일치도의 항목은 결과에 넣지 않는다 */
const MIN_P = 0.15
/** 이보다 낮으면 이력서와 무관한 질문으로 본다 */
const MIN_ABOUT = 0.4

type View = { kind: 'all' } | { kind: 'cat'; id: CategoryId } | { kind: 'ask'; q: string; r: ExploreResult }

/** 질문 결과에서 보여 줄 항목: 일치도가 충분한 것, 없으면 고른 카테고리의 항목 */
const picked = (r: ExploreResult): { item: ResumeItem; p?: number }[] => {
  if (r.aboutResume < MIN_ABOUT) return []
  const hits = r.items.filter((it) => it.p >= MIN_P).map((it) => ({ item: ITEM[it.id], p: it.p }))
  return hits.length ? hits : ITEMS.filter((it) => it.categories.includes(r.category)).map((item) => ({ item }))
}

type Props = {
  /** cd .. (the button or Esc): back to the film */
  onBack: () => void
}

export const ExplorePage = ({ onBack }: Props) => {
  const L = useViewportLayout()
  const [view, setView] = useState<View>({ kind: 'all' })
  const [busy, setBusy] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const outRef = useRef<HTMLDivElement>(null)
  const askRef = useRef<HTMLInputElement>(null)

  // a fresh page: the film's tall scroll does not carry over
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  useEffect(() => () => abortRef.current?.abort(), [])
  // the prompt is the page: type straight away (once it is laid out, not again on every resize)
  const laidOut = L !== null
  useEffect(() => {
    if (laidOut) askRef.current?.focus({ preventScroll: true })
  }, [laidOut])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !(e.target instanceof HTMLInputElement)) onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

  const show = (v: View) => {
    setView(v)
    requestAnimationFrame(() => outRef.current?.scrollIntoView({ block: 'start', behavior: REDUCE ? 'auto' : 'smooth' }))
  }

  const onAsk = async (q: string) => {
    abortRef.current?.abort()
    const ctl = new AbortController()
    abortRef.current = ctl
    setBusy(true)
    try {
      const r = await ask(q, ctl.signal)
      show({ kind: 'ask', q, r })
    } catch {
      // aborted by a newer question
    } finally {
      if (abortRef.current === ctl) setBusy(false)
    }
  }

  const cards =
    view.kind === 'all'
      ? ITEMS.map((item) => ({ item, p: undefined }))
      : view.kind === 'cat'
        ? ITEMS.filter((it) => it.categories.includes(view.id)).map((item) => ({ item, p: undefined }))
        : picked(view.r)
  const pad = L ? { paddingLeft: L.M, paddingRight: L.M } : undefined

  return (
    <main className="explore">
      <h1 className="sr-only">조윤식 이력서 탐색</h1>
      <div className="dots" aria-hidden="true" />
      <PromptRows L={L}>
        <AskLine busy={busy} inputRef={askRef} onAsk={onAsk} />
      </PromptRows>

      <div className="explore-out" style={pad}>
        <p className="ex-examples dim">
          # 예:
          {EXAMPLES.map((q) => (
            <button key={q} type="button" disabled={busy} onClick={() => onAsk(q)}>
              {q}
            </button>
          ))}
        </p>

        <section className="ex-cats" aria-label="카테고리">
          <p className="dim">$ ls categories/</p>
          <div className="ex-chips">
            <button type="button" aria-pressed={view.kind === 'all'} onClick={() => show({ kind: 'all' })}>
              전체
            </button>
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" aria-pressed={view.kind === 'cat' && view.id === c.id} onClick={() => show({ kind: 'cat', id: c.id })}>
                {c.label}
              </button>
            ))}
          </div>
        </section>

        <div className="ex-result" ref={outRef} aria-live="polite" aria-busy={busy}>
          {view.kind === 'ask' && <AskHeader q={view.q} r={view.r} empty={!cards.length} />}
          {view.kind === 'cat' && <p className="dim">$ ls categories/{CATEGORY[view.id].label}</p>}
          {view.kind === 'all' && <p className="dim">$ ls projects/</p>}
          <div className="ex-cards">
            {cards.map(({ item, p }) => (
              <ResumeItemCard key={item.id} item={item} p={p} />
            ))}
          </div>
        </div>
      </div>

      <button type="button" className="explore-back" onClick={onBack}>
        <span aria-hidden="true">←&nbsp;</span>cd ..
      </button>
    </main>
  )
}

/** what Jev decided: the question, the top categories as cell bars, where the answer came from */
const AskHeader = ({ q, r, empty }: { q: string; r: ExploreResult; empty: boolean }) => {
  const top = CATEGORIES.map((c) => ({ c, p: r.categories[c.id] }))
    .sort((a, b) => b.p - a.p)
    .slice(0, 3)
  return (
    <div className="ex-decision">
      <p className="dim">$ {q}</p>
      {empty ? (
        <p className="ex-miss"># 이력서와 관련된 질문을 해 주세요. 위의 예시나 카테고리로 둘러볼 수도 있어요.</p>
      ) : (
        <ul className="ex-cat-probs">
          {top.map(({ c, p }, i) => (
            <li key={c.id} className={i === 0 ? 'top' : ''}>
              <span className="ex-arrow">{i === 0 ? '→' : ' '}</span>
              <span className="ex-cat-label">{c.label}</span>
              <CellBar value={p} />
              <span className="ex-num">{p.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="dim ex-src">{r.source === 'jev' ? `# via ${r.model ?? 'jev'}` : '# offline match — Jev에 닿지 않아 키워드로 골랐어요'}</p>
    </div>
  )
}
