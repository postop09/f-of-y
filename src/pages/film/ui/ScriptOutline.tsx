// 스크린리더용 대본. 스테이지는 aria-hidden이라 장면 텍스트를 여기서 읽는다.
import type { Scene } from '@/entities/scene'

type Props = { scenes: readonly Scene[] }

export const ScriptOutline = ({ scenes }: Props) => (
  <section className="sr-only" aria-label="장면 대본">
    <h1>F(Y) — 스크롤로 움직이는 키네틱 타이포그래피</h1>
    <ol>
      {scenes.map((s) => (
        <li key={s.id}>{s.text}</li>
      ))}
    </ol>
  </section>
)
