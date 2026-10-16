// prefers-reduced-motion: 카메라 줌·흔들림·플래시를 끄고 스크롤 추적도 즉시 반영한다.
export const REDUCE =
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
export const FX = REDUCE ? 0 : 1 // shake / flash strength
