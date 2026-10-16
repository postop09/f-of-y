// 네 귀퉁이의 모니터 표시: 파일명, 장면 번호와 박자, 캡션, 속도와 Y.
import { pad } from '@/shared/lib/math'

type Props = {
  /** 현재 장면 index (0부터) */
  idx: number
  count: number
  /** 장면 안 4분박 중 켜질 칸 0..3 */
  quarter: number
  cap: string
  /** 스크롤 속도 px/s */
  vpx: number
  /** 스크롤 위치 px */
  y: number
}

export const Hud = ({ idx, count, quarter, cap, vpx, y }: Props) => (
  <div className="hud" aria-hidden="true">
    <i className="corner a" />
    <i className="corner b" />
    <i className="corner c" />
    <i className="corner d" />
    <div className="c tl">
      <span>F_OF_Y.TSX</span>
    </div>
    <div className="c tr">
      <span className="hide-s">SCROLL-DRIVEN</span>
      <span>
        SCENE <b>{pad(idx + 1, 2)}</b>/{count}
      </span>
      <span className="beats">
        {[0, 1, 2, 3].map((i) => (
          <i key={i} className={i === quarter ? 'on' : ''} />
        ))}
      </span>
    </div>
    <div className="c bl">
      <span className="gt">&gt;</span>
      <span className="cap">{cap}</span>
    </div>
    <div className="c br">
      <span className="hide-s">{`v ${vpx >= 0 ? '+' : '−'}${pad(Math.abs(vpx), 4)}px/s`}</span>
      <span>{`Y ${pad(y, 5)}`}</span>
    </div>
  </div>
)
