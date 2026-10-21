// 1번 장면의 명령 줄 `$ ▮` 에 직접 치는 입력칸. start 면 영상을 재생하고, explore 면 친 글자가 흩어진 뒤 다음 화면으로 간다.
// 장면이 그리던 줄과 같은 자리·글꼴이라, 재생이 시작되면 장면의 `$ run start` 가 그 자리를 이어받는다.
// .world 밖(aria-hidden 아님)에 있어서 스크린리더·키보드로도 쓸 수 있다.
import { type CSSProperties, type Ref, useEffect, useRef, useState } from 'react'
import { REDUCE } from '@/shared/config/motion'

/** 글자가 흩어지는 시간 (ms). 다 흩어지면 다음 화면으로 간다 (scrollStage.css 의 boot-scatter 와 같게) */
const SCATTER_MS = 640

/** 흩어지는 글자 하나: 날아갈 거리(px)·회전(deg)·늦게 출발하는 시간(ms) */
type Bit = { ch: string; dx: number; dy: number; r: number; delay: number }

/** 글자마다 제멋대로 바깥으로: 대체로 위로 튀고, 멀리 갈수록 많이 돈다 */
const scatter = (text: string, mono: number): Bit[] =>
  [...text, ''].map((ch) => {
    const a = Math.random() * Math.PI * 2
    const dist = mono * (3 + Math.random() * 9)
    return { ch, dx: Math.cos(a) * dist, dy: Math.sin(a) * dist - mono * 2.5, r: (Math.random() - 0.5) * 2 * (90 + dist), delay: Math.random() * 90 }
  })

/** 친 줄을 명령으로: `run` 은 붙여도 되고 빼도 된다 (대소문자 무시) */
const parse = (text: string) => {
  const cmd = text.trim().toLowerCase().replace(/^run\s+/, '')
  return cmd === 'start' || cmd === 'explore' ? cmd : null
}

type Props = {
  x: number
  y: number
  mono: number
  /** 스테이지 폭: 누를 수 있는 곳이 장면이 강조하는 줄 전체다 */
  W: number
  /** 장면의 캐럿과 같은 박으로 깜빡인다 */
  blink: boolean
  inputRef: Ref<HTMLInputElement>
  onStart: () => void
  onExplore: () => void
}

export const BootInput = ({ x, y, mono, W, blink, inputRef, onStart, onExplore }: Props) => {
  const [value, setValue] = useState('')
  /** 모르는 명령을 쳤을 때 다시 찍어 주는 줄 */
  const [miss, setMiss] = useState<string | null>(null)
  /** explore: 흩어지는 중인 글자들 (마지막 하나는 캐럿) */
  const [bits, setBits] = useState<Bit[] | null>(null)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const explore = () => {
    if (REDUCE) return onExplore()
    setBits(scatter(value.trim(), mono))
    timer.current = window.setTimeout(onExplore, SCATTER_MS + 90)
  }

  if (bits)
    return (
      <>
        <div className="code boot-line" style={{ left: x, top: y }} aria-hidden="true">
          <span className="p">$&nbsp;</span>
          {bits.map((b, i) => (
            <span
              key={i}
              className={'boot-bit' + (b.ch ? '' : ' caret')}
              style={{ '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, '--r': `${b.r}deg`, animationDelay: `${b.delay}ms` } as CSSProperties}
            >
              {b.ch}
            </span>
          ))}
        </div>
        <div className="code dim boot-hint leaving" style={{ left: x, right: x, top: y + mono * 1.6 }} aria-live="polite">
          # cd explore …
        </div>
      </>
    )

  // the row 01-boot highlights (same geometry)
  const hx = Math.max(0, x - mono * 3)
  const top = mono * 0.3
  return (
    <>
      {/* the whole row the scene highlights is the input's label, so a tap anywhere on it starts typing */}
      <label className="boot-row" style={{ left: hx, top: y - top, width: W - x * 0.5 - hx, height: mono * 1.95 }}>
        <span className="code boot-line" style={{ left: x - hx, top }}>
          <span className="p">$&nbsp;</span>
          <span className="boot-word" data-value={value}>
            <input
              ref={inputRef}
              type="text"
              value={value}
              maxLength={24}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              enterKeyHint="go"
              aria-label="명령 입력: start 는 영상 재생, explore 는 이력서 탐색"
              size={1}
              onChange={(e) => {
                setValue(e.target.value)
                setMiss(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing && value.trim()) {
                  e.preventDefault()
                  const cmd = parse(value)
                  if (cmd === 'start') onStart()
                  else if (cmd === 'explore') explore()
                  else {
                    setMiss(value.trim())
                    setValue('')
                  }
                } else if (e.key === 'Escape') e.currentTarget.blur()
              }}
            />
          </span>
          <span className="caret" style={{ visibility: blink ? 'visible' : 'hidden' }} aria-hidden="true" />
        </span>
      </label>
      {/* right: x so the hint wraps on a narrow screen instead of running off it */}
      <div className="code dim boot-hint" style={{ left: x, right: x, top: y + mono * 1.6 }} aria-live="polite">
        {miss !== null ? `# command not found: ${miss} · start 나 explore 를 입력해 보세요.` : '# start 를 입력하면 영상이 재생되고, explore 를 입력하면 이력서 탐색으로 바로 이동해요.'}
      </div>
    </>
  )
}
