// 탐색 세션: 입력 줄에서 온 글을 명령이면 바로 처리하고, 아니면 Jev 에 묻는다. 차례는 아래로 쌓인다.
// DOM 은 건드리지 않는다. cd .. 와 clear 뒤의 화면 처리는 콜백으로 페이지가 맡는다.
import { useEffect, useRef, useState } from 'react'
import type { CategoryId } from '@/entities/resume'
import { ask } from '../api/ask'
import { parseCommand } from './commands'
import type { Turn, TurnKind } from './turns'

type Options = {
  /** cd .. : 영상으로 */
  onBack: () => void
  /** clear 뒤 (페이지는 맨 위로 스크롤한다) */
  onClear?: () => void
}

export const useExploreSession = ({ onBack, onClear }: Options) => {
  const [turns, setTurns] = useState<Turn[]>([])
  const [busy, setBusy] = useState(false)
  const nextId = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  // 페이지를 떠나면 기다리던 질문을 끊는다
  useEffect(() => () => abortRef.current?.abort(), [])

  const push = (t: TurnKind) => {
    const id = nextId.current++
    setTurns((ts) => [...ts, { ...t, id }])
    return id
  }

  const askQuestion = async (q: string) => {
    abortRef.current?.abort()
    const ctl = new AbortController()
    abortRef.current = ctl
    const id = push({ kind: 'ask', q, r: null })
    setBusy(true)
    try {
      const r = await ask(q, ctl.signal)
      setTurns((ts) => ts.map((t) => (t.id === id && t.kind === 'ask' ? { ...t, r } : t)))
    } catch {
      // cut short (left the page, cleared, or a newer question took over): drop the turn rather than leave it deciding forever
      setTurns((ts) => ts.filter((t) => t.id !== id))
    } finally {
      if (abortRef.current === ctl) setBusy(false)
    }
  }

  const clear = () => {
    abortRef.current?.abort()
    setTurns([])
    onClear?.()
  }

  // what the prompt sends: a command, or a question for Jev
  const submit = (text: string) => {
    const cmd = parseCommand(text)
    if (cmd === 'cd ..') onBack()
    else if (cmd === 'clear') clear()
    else if (cmd) push({ kind: cmd })
    else void askQuestion(text)
  }
  const showCategory = (cat: CategoryId) => push({ kind: 'cat', cat })

  return { turns, busy, ask: askQuestion, submit, showCategory, clear }
}
