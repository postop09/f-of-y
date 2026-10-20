// 0..1 값을 네모 칸 막대로: ▮▮▮▮▮▯▯▯. 영상의 픽셀 셀과 같은 말투.
import './cellBar.css'

type Props = { value: number; cells?: number }

export const CellBar = ({ value, cells = 10 }: Props) => {
  const on = Math.round(Math.min(1, Math.max(0, value)) * cells)
  return (
    <span className="cellbar" aria-hidden="true">
      {Array.from({ length: cells }, (_, i) => (
        <i key={i} className={i < on ? 'on' : ''} />
      ))}
    </span>
  )
}
