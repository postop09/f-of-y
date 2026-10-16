// 첫 화면 안내. 조금만 스크롤하면 사라진다.
type Props = { hidden: boolean }

export const Help = ({ hidden }: Props) => (
  <div className="help" hidden={hidden}>
    <div className="go">아래로 스크롤하면 재생돼요. 멈추면 화면도 멈추고, 위로 올리면 되감겨요.</div>
    <div className="keys">
      <span>
        <kbd>휠</kbd>
        <kbd>스와이프</kbd>재생·되감기
      </span>
      <span>
        <kbd>←</kbd>
        <kbd>→</kbd>장면 이동
      </span>
      <span>
        <kbd>마우스</kbd>글자 렌즈
      </span>
    </div>
  </div>
)
