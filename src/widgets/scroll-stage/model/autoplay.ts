// 처음 한 번은 영상처럼 끝까지 자동 재생된다. 클릭(또는 Space)으로 소리와 함께 시작하고, 그동안 스크롤은
// 잠기고 u는 반주 시계로 흐르며, 끝나면 스크롤 위치를 마지막 프레임에 맞춰 놓고 조작을 넘긴다.
// 같은 탭에서는 다시 재생하지 않는다.
import { BPM } from '@/shared/lib/synth'

/** 자동 재생 속도 (스크롤 단위/초): 1단위 = 반주 1박이라 장면 경계와 효과음이 박자에 맞는다 */
export const AUTOPLAY_SPEED = BPM / 60

const KEY = 'f-of-y:autoplayed'

type Store = Pick<Storage, 'getItem' | 'setItem'> | null

const session = (): Store => {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage
  } catch {
    return null
  }
}

/** 이번 방문에서 자동 재생할지. 동작 줄이기 설정이면 건너뛴다. */
export const shouldAutoplay = (reduce: boolean, s: Store = session()) => {
  if (reduce) return false
  try {
    return s?.getItem(KEY) !== '1'
  } catch {
    return true
  }
}

export const markAutoplayed = (s: Store = session()) => {
  try {
    s?.setItem(KEY, '1')
  } catch {
    // private mode or blocked storage: it just plays again next time
  }
}
