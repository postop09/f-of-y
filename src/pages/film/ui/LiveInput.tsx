// live 모드의 입력 줄: $ YOURS▮. 단어를 고치면 잠시 뒤 필드가 새 단어로 옮겨 가고, Enter면 바로 옮기며 터뜨린다.
// Enter 뒤에도 포커스는 입력칸에 남아 계속 칠 수 있고, explore 를 치고 Enter면 이력서 탐색으로 간다.
// 1번 장면의 명령 줄처럼 강조된 줄에 놓이고, 브라우저 캐럿 대신 영상의 블록 캐럿이 글자를 따라간다.
// .world 밖(aria-hidden 아님)에 있어서 스크린리더·키보드로도 쓸 수 있다.
import { type Ref, useEffect, useRef, useState } from 'react'
import { MAX_WORD } from '../model/liveField'

type Props = {
  x: number
  y: number
  mono: number
  /** 스테이지 폭: 강조 줄이 1번 장면의 줄만큼 뻗는다 */
  W: number
  /** 장면의 캐럿과 같은 박으로 깜빡인다 */
  blink: boolean
  word: string
  inputRef: Ref<HTMLInputElement>
  /** 입력이 멈추면 (단어를 옮기며 살짝 띄운다) */
  onWord: (word: string) => void
  /** Enter: 바로 옮기고 터뜨린다 */
  onEnter: (word: string) => void
  /** explore + Enter: 이력서 탐색으로 */
  onExplore: () => void
}

/** 1번 장면의 명령 줄처럼 `run` 은 붙여도 되고 빼도 된다 (대소문자 무시) */
const isExplore = (text: string) => text.trim().toLowerCase().replace(/^run\s+/, '') === 'explore'

export const LiveInput = ({ x, y, mono, W, blink, word, inputRef, onWord, onEnter, onExplore }: Props) => {
  const [value, setValue] = useState(word)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  // the same highlighted row as the first scene's command line; the whole row is the input's label, so a tap anywhere on it starts typing
  const hx = Math.max(0, x - mono * 3)
  const top = mono * 0.3
  return (
    <>
      <label className="live-row" style={{ left: hx, top: y - top, width: W - x * 0.5 - hx, height: mono * 1.95 }}>
        <span className="code live-line" style={{ left: x - hx, top }}>
          <span className="p">$&nbsp;</span>
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
                  if (isExplore(value)) {
                    // the field takes the word like any other, then the page moves on
                    onWord(value)
                    onExplore()
                  } else onEnter(value)
                } else if (e.key === 'Escape') e.currentTarget.blur()
              }}
            />
          </span>
          <span className="caret" style={{ visibility: blink ? 'visible' : 'hidden' }} aria-hidden="true" />
        </span>
      </label>
      <div className="code dim live-hint" style={{ left: x, top: y + mono * 1.6 }}>
        # 자유롭게 단어를 입력해보세요
        <br/>
        # 화면을 누르면 터졌다가 제자리로 돌아와요 · 스크롤을 올리면 되감겨요
        <br/>
        # explore 를 입력하면 이력서 탐색으로 이동해요
      </div>
    </>
  )
}
