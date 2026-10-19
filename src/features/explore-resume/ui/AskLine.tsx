// 탐색 입력 줄: `$ ▮`. 영상의 타이핑 줄처럼 프롬프트와 깜빡이는 블록 캐럿만 있고, 친 글자가 캐럿 앞에 쌓인다. Enter로 질문을 보내고 비운다.
// 진짜 입력칸은 글자 폭에 맞춰 늘어나고(숨은 복사본이 폭을 정함) 브라우저 캐럿은 감춘다. 줄 어디를 눌러도 입력칸으로 간다.
import { type Ref, useState } from 'react'
import { MAX_QUERY } from '@/entities/resume/lib/jev'
import './askLine.css'

type Props = {
  busy: boolean
  inputRef?: Ref<HTMLInputElement>
  onAsk: (q: string) => void
}

export const AskLine = ({ busy, inputRef, onAsk }: Props) => {
  const [value, setValue] = useState('')
  return (
    <label className="ask-line">
      <span className="p">$&nbsp;</span>
      <span className="ask-word" data-value={value}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          maxLength={MAX_QUERY}
          spellCheck={false}
          autoComplete="off"
          enterKeyHint="search"
          aria-label="이력서에 대해 묻기"
          size={1}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && value.trim() && !busy) {
              e.preventDefault()
              onAsk(value)
              setValue('') // sent: it now shows in the log above
            } else if (e.key === 'Escape') e.currentTarget.blur()
          }}
        />
      </span>
      {/* solid while Jev is deciding, blinking otherwise (like the film's caret after typing) */}
      <span className={'ask-caret' + (busy ? ' busy' : '')} aria-hidden="true" />
    </label>
  )
}
