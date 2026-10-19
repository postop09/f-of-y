// live 모드의 입력 줄: $ type("YOURS"). 단어를 고치면 잠시 뒤 필드가 새 단어로 옮겨 가고, Enter면 바로 옮기며 터뜨린다.
// 단어가 explore 면 그 아래에 다음 화면으로 가는 버튼이 생긴다.
// .world 밖(aria-hidden 아님)에 있어서 스크린리더·키보드로도 쓸 수 있다.
import { type Ref, useEffect, useRef, useState } from 'react'
import { MAX_WORD } from '../lib/liveField'

/** 이 단어를 치면 explore 화면으로 가는 버튼이 나온다 (대소문자 무시) */
const EXPLORE = 'explore'

type Props = {
  x: number
  y: number
  mono: number
  word: string
  inputRef: Ref<HTMLInputElement>
  /** 입력이 멈추면 (단어를 옮기며 살짝 띄운다) */
  onWord: (word: string) => void
  /** Enter: 바로 옮기고 터뜨린다 */
  onEnter: (word: string) => void
  /** explore 버튼 */
  onExplore: () => void
}

export const LiveInput = ({ x, y, mono, word, inputRef, onWord, onEnter, onExplore }: Props) => {
  const [value, setValue] = useState(word)
  const timer = useRef(0)
  const explore = value.trim().toLowerCase() === EXPLORE
  // the button takes the first hint row and pushes the hints down
  const hy = y + mono * (explore ? 3.4 : 1.6)
  useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <>
      <div className="code live-line" style={{ left: x, top: y }}>
        <span className="p">$&nbsp;</span>type(&quot;
        {/* the box is sized by a hidden copy of the text in the same font, so wide glyphs (Hangul, IME composition) never get clipped */}
        <span className="live-word" data-value={value}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            maxLength={MAX_WORD}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            enterKeyHint="done"
            aria-label="화면에 띄울 단어"
            size={1}
            onChange={(e) => {
              const v = e.target.value
              setValue(v)
              clearTimeout(timer.current)
              timer.current = window.setTimeout(() => onWord(v), 350)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault()
                clearTimeout(timer.current)
                onEnter(value)
                e.currentTarget.blur()
              } else if (e.key === 'Escape') e.currentTarget.blur()
            }}
          />
        </span>
        &quot;)
      </div>
      {explore && (
        <button type="button" className="code live-go" style={{ left: x, top: y + mono * 1.6 }} onClick={onExplore}>
          <span className="p">$&nbsp;</span>run explore<span aria-hidden="true">&nbsp;→</span>
        </button>
      )}
      <div className="code dim live-hint" style={{ left: x, top: hy }}>
        # 입력칸을 눌러 단어를 바꾸고 Enter
      </div>
      <div className="code dim live-hint" style={{ left: x, top: hy + mono * 0.95 }}>
        # 화면을 누르면 터졌다가 제자리로 돌아와요 · 스크롤을 올리면 되감겨요
      </div>
    </>
  )
}
