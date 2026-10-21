// 첫 화면 안내. 재생을 기다리는 중이면 start 를 치거나 클릭해서 시작하라는 안내, 재생 중 소리가 멈췄으면 이어 가라는 안내,
// 스크롤 모드면 조작법. 조금 지나면 사라진다.
type Props = { hidden: boolean; wait: boolean; paused: boolean }

export const Help = ({ hidden, wait, paused }: Props) => (
  <div className="help" hidden={hidden}>
    {paused ? (
      <div className="go">소리가 멈춰서 재생도 멈췄어요. 클릭하거나 Space를 누르면 이어서 재생돼요.</div>
    ) : wait ? (
      <>
        <div className="go">start 를 입력하고 Enter를 누르면(클릭이나 Space도 돼요) 끝까지 영상처럼 재생돼요. 소리도 함께 나와요.</div>
        <div className="keys">
          <span>
            <kbd>M</kbd>소리
          </span>
          <span>
            <kbd>클릭</kbd>박자에 맞춰 히트 넣기
          </span>
          <span>다 보고 나면 스크롤로 되감을 수 있어요</span>
        </div>
      </>
    ) : (
      <>
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
            <kbd>클릭</kbd>소리 켜기·히트
          </span>
          <span>
            <kbd>M</kbd>소리
          </span>
        </div>
      </>
    )}
  </div>
)
