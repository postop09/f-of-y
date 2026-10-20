// explore: 영상 끝 live 입력칸에 explore 를 치고 버튼을 누르면 오는 이력서 탐색 화면.
// 채팅처럼 입력 줄(`$ ▮`)은 화면 맨 아래에 붙어 있고, 질문과 결과는 그 위에 차례로 쌓인다(새 것이 아래).
// 질문은 Jev(/api/explore)가 카테고리와 경력 항목을 골라 확률과 함께 돌려주고, 화면은 그 항목을 이력서 데이터로 그린다.
// help · categories · all · clear · cd .. 는 질문 대신 명령으로 처리한다. categories 목록에서 고른 카테고리는 Jev 없이 바로 그 항목을, all 은 모든 항목을 쌓는다.
import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ExploreResult } from '@/entities/resume/lib/jev'
import { CATEGORIES, CATEGORY, ITEM, ITEMS } from '@/entities/resume/model/resume'
import type { CategoryId, ResumeItem } from '@/entities/resume/model/types'
import { ResumeItemCard } from '@/entities/resume/ui/ResumeItemCard'
import { ask } from '@/features/explore-resume/api/ask'
import { COMMANDS, parseCommand } from '@/features/explore-resume/model/commands'
import { AskLine } from '@/features/explore-resume/ui/AskLine'
import { REDUCE } from '@/shared/config/motion'
import { pad } from '@/shared/lib/math'
import { CellBar } from '@/shared/ui/CellBar'
import { useViewportLayout } from '../lib/useViewportLayout'
import './explore.css'

const EXAMPLES = ['디자인 시스템을 만들어 본 적 있나요?', 'AI를 개발에 어떻게 쓰나요?', '장애 대응은 어떻게 하나요?']
/** 이보다 낮은 일치도의 항목은 결과에 넣지 않는다 */
const MIN_P = 0.15
/** 이보다 낮으면 이력서와 무관한 질문으로 본다 */
const MIN_ABOUT = 0.4

/** 쌓이는 한 차례: 질문(답을 기다리는 중이면 r = null), 카테고리 보기, 명령어(all 은 모든 카테고리 보기) */
type TurnKind =
  | { kind: 'ask'; q: string; r: ExploreResult | null }
  | { kind: 'cat'; cat: CategoryId }
  | { kind: 'help' }
  | { kind: 'categories' }
  | { kind: 'all' }

/** 차례 맨 위에 다시 찍는 명령 줄 */
const commandLine = (t: TurnKind) =>
  t.kind === 'ask' ? t.q : t.kind === 'cat' ? `ls categories/${CATEGORY[t.cat].label}` : t.kind
type Turn = TurnKind & { id: number }

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
  const [turns, setTurns] = useState<Turn[]>([])
  const [busy, setBusy] = useState(false)
  const [dockH, setDockH] = useState(0)
  const nextId = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  const askRef = useRef<HTMLInputElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const lastRef = useRef<HTMLElement>(null)

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

  // the log keeps clear of the docked prompt, whatever its height
  useLayoutEffect(() => {
    const dock = dockRef.current
    if (!dock) return
    const ro = new ResizeObserver(() => setDockH(dock.offsetHeight))
    ro.observe(dock)
    return () => ro.disconnect()
  }, [])

  // a new turn scrolls up to its own first line, like a sent message
  const count = turns.length
  useEffect(() => {
    if (count) lastRef.current?.scrollIntoView({ block: 'start', behavior: REDUCE ? 'auto' : 'smooth' })
  }, [count])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !(e.target instanceof HTMLInputElement)) onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

  const push = (t: TurnKind) => {
    const id = nextId.current++
    setTurns((ts) => [...ts, { ...t, id }])
    return id
  }

  const onAsk = async (q: string) => {
    abortRef.current?.abort()
    const ctl = new AbortController()
    abortRef.current = ctl
    const id = push({ kind: 'ask', q, r: null })
    setBusy(true)
    try {
      const r = await ask(q, ctl.signal)
      setTurns((ts) => ts.map((t) => (t.id === id && t.kind === 'ask' ? { ...t, r } : t)))
    } catch {
      // left the page
    } finally {
      if (abortRef.current === ctl) setBusy(false)
    }
  }

  // what the prompt sends: a command, or a question for Jev
  const onSubmit = (text: string) => {
    const cmd = parseCommand(text)
    if (cmd === 'cd ..') onBack()
    else if (cmd === 'clear') {
      abortRef.current?.abort()
      setTurns([])
      window.scrollTo(0, 0)
    } else if (cmd) push({ kind: cmd })
    else void onAsk(text)
  }
  const showCategory = (cat: CategoryId) => push({ kind: 'cat', cat })

  const gutter = L ? L.gx - L.M : 0
  const side = L ? { paddingLeft: L.M, paddingRight: L.M } : undefined
  // the prompt band reaches into the gutter and almost to the right edge, as the film's current line does
  const band = L ? ({ ...side, '--row-out': `${Math.min(L.M, L.mono * 3)}px`, '--row-end': `${L.M * 0.5}px` } as CSSProperties) : undefined

  return (
    <main className="explore" style={{ paddingBottom: dockH }}>
      <h1 className="sr-only">조윤식 이력서 탐색</h1>
      <div className="dots" aria-hidden="true" />
      <button type="button" className="explore-back" onClick={onBack}>
        <span aria-hidden="true">←&nbsp;</span>cd ..
      </button>

      {/* bottom-anchored: a short log sits just above the prompt, a long one scrolls */}
      <div className="ex-log" style={{ ...side, minHeight: `calc(100dvh - ${dockH}px)` }} aria-live="polite" aria-busy={busy}>
        {count === 0 && (
          <div className="ex-empty">
            <p className="dim"># 이력서에 대해 물어보세요.</p>
            <p className="ex-examples dim">
              # 예:
              {EXAMPLES.map((q) => (
                <button key={q} type="button" onClick={() => onAsk(q)}>
                  {q}
                </button>
              ))}
            </p>
            <p className="dim"># help 로 명령어 목록을 볼 수 있어요.</p>
          </div>
        )}
        {turns.map((t, i) => (
          <section key={t.id} ref={i === count - 1 ? lastRef : undefined} className="ex-turn">
            <p className="ex-cmd">
              <span className="ex-ln" style={{ left: gutter }} aria-hidden="true">
                {pad(i + 1, 2)}
              </span>
              <span className="dim">$ </span>
              {commandLine(t)}
            </p>
            <TurnBody turn={t} onCategory={showCategory} />
          </section>
        ))}
      </div>

      <div className="ex-dock" ref={dockRef} style={band}>
        <div className="ex-prompt">
          <span className="ex-ln cur" style={{ left: gutter }} aria-hidden="true">
            {pad(count + 1, 2)}
          </span>
          <AskLine busy={busy} inputRef={askRef} onAsk={onSubmit} />
        </div>
      </div>
    </main>
  )
}

const TurnBody = ({ turn, onCategory }: { turn: Turn; onCategory: (cat: CategoryId) => void }) => {
  if (turn.kind === 'help') return <HelpList />
  if (turn.kind === 'categories') return <CategoryList onCategory={onCategory} />
  if (turn.kind === 'ask' && !turn.r) return <p className="dim ex-wait"># jev is deciding…</p>
  const cards =
    turn.kind === 'ask' && turn.r
      ? picked(turn.r)
      : turn.kind === 'cat'
        ? ITEMS.filter((it) => it.categories.includes(turn.cat)).map((item) => ({ item, p: undefined }))
        : turn.kind === 'all'
          ? ITEMS.map((item) => ({ item, p: undefined }))
          : []
  return (
    <>
      {turn.kind === 'ask' && turn.r && <Decision r={turn.r} empty={!cards.length} />}
      {cards.length > 0 && (
        <div className="ex-cards">
          {cards.map(({ item, p }) => (
            <ResumeItemCard key={item.id} item={item} p={p} />
          ))}
        </div>
      )}
    </>
  )
}

const HelpList = () => (
  <div className="ex-list">
    <dl>
      {COMMANDS.map((c) => (
        <div key={c.name}>
          <dt>{c.name}</dt>
          <dd className="dim">{c.desc}</dd>
        </div>
      ))}
    </dl>
    <p className="dim"># 이력서에 대해 자유롭게 질문해보세요.</p>
  </div>
)

const CategoryList = ({ onCategory }: { onCategory: (cat: CategoryId) => void }) => (
  <div className="ex-list">
    <dl>
      {CATEGORIES.map((c) => (
        <div key={c.id}>
          <dt>
            <button type="button" onClick={() => onCategory(c.id)}>
              {c.label}
            </button>
          </dt>
          <dd className="dim">{`${ITEMS.filter((it) => it.categories.includes(c.id)).length}개 항목`}</dd>
        </div>
      ))}
    </dl>
  </div>
)

/** what Jev decided: the top categories as cell bars, and where the answer came from */
const Decision = ({ r, empty }: { r: ExploreResult; empty: boolean }) => {
  const top = CATEGORIES.map((c) => ({ c, p: r.categories[c.id] }))
    .sort((a, b) => b.p - a.p)
    .slice(0, 3)
  return (
    <div className="ex-decision">
      {empty ? (
        <p className="ex-miss"># 이력서와 관련된 질문을 해 주세요. categories 로 카테고리별로 둘러볼 수도 있어요.</p>
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
    </div>
  )
}
