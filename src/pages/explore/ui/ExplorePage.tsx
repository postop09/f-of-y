// explore: 영상 끝 live 입력칸에 explore 를 치고 버튼을 누르면 오는 이력서 탐색 화면.
// 채팅처럼 입력 줄(`$ ▮`)은 화면 맨 아래에 붙어 있고, 질문과 결과는 그 위에 차례로 쌓인다(새 것이 아래).
// 질문·명령의 처리는 features/explore-resume 의 useExploreSession 이 맡고, 이 파일은 화면 배치와 스크롤·포커스·Esc 만 다룬다.
// 차례 하나의 본문(TurnBody)은 이 화면에서만 쓰는 조합이라 여기 둔다.
import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { type CategoryId, ITEMS, ResumeItemCard, itemsIn } from '@/entities/resume'
import { type Turn, AskLine, CategoryList, Decision, HelpList, commandLine, picked, useExploreSession } from '@/features/explore-resume'
import { REDUCE } from '@/shared/config'
import { pad } from '@/shared/lib'
import { useViewportLayout } from '../lib/useViewportLayout'
import './explore.css'

const EXAMPLES = ['디자인 시스템을 만들어 본 적 있나요?', 'AI를 개발에 어떻게 쓰나요?', '장애 대응은 어떻게 하나요?']

type Props = {
  /** cd .. (the button or Esc): back to the film */
  onBack: () => void
}

export const ExplorePage = ({ onBack }: Props) => {
  const L = useViewportLayout()
  const { turns, busy, ask, submit, showCategory } = useExploreSession({ onBack, onClear: () => window.scrollTo(0, 0) })
  const [dockH, setDockH] = useState(0)
  const askRef = useRef<HTMLInputElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const lastRef = useRef<HTMLElement>(null)

  // a fresh page: the film's tall scroll does not carry over
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
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
      // defaultPrevented: 라이트박스처럼 먼저 Esc 를 받아 닫은 것이 있으면 영상으로 가지 않는다
      if (e.key === 'Escape' && !e.defaultPrevented && !(e.target instanceof HTMLInputElement)) onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

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
                <button key={q} type="button" onClick={() => ask(q)}>
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
          <AskLine busy={busy} inputRef={askRef} onAsk={submit} />
        </div>
      </div>
    </main>
  )
}

/** 차례 하나의 본문: 명령어 목록, 카테고리 목록, 기다리는 중, 또는 Jev 의 결정과 카드들 */
const TurnBody = ({ turn, onCategory }: { turn: Turn; onCategory: (cat: CategoryId) => void }) => {
  if (turn.kind === 'help') return <HelpList />
  if (turn.kind === 'categories') return <CategoryList onCategory={onCategory} />
  if (turn.kind === 'ask' && !turn.r) return <p className="dim ex-wait"># jev is deciding…</p>
  const cards =
    turn.kind === 'ask' && turn.r
      ? picked(turn.r)
      : turn.kind === 'cat'
        ? itemsIn(turn.cat).map((item) => ({ item, p: undefined }))
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
