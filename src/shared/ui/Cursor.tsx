// 마우스 포인터 모양. 키프레임을 끌거나 곡선 핸들을 잡는 장면에서 쓴다.
import './cursor.css'

type Props = { x: number; y: number }

export const Cursor = ({ x, y }: Props) => (
  <svg className="cursor" style={{ left: x, top: y }} viewBox="0 0 16 20" aria-hidden="true">
    <path d="M1 1v15l4-4 3 7 3-1.4-3-6.8h6z" />
  </svg>
)
