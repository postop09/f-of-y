// 리사이즈·글꼴 로드 뒤에는 폭 측정과 레이아웃 memo가 모두 무효다.
import { clearLayoutMemo } from './layout'
import { clearWidthCache } from './textMeasure'

export const resetCaches = () => {
  clearLayoutMemo()
  clearWidthCache()
}
