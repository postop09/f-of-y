// 순수 수학 헬퍼. 모든 장면은 스크롤 위치 하나의 함수라서, 여기엔 상태가 없다.

export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
// where v sits between a and b, as 0..1
export const span = (a: number, b: number, v: number) => clamp((v - a) / (b - a))
// 0 → 1 → 0 across a..b
export const bump = (a: number, b: number, v: number) => Math.sin(Math.PI * span(a, b, v))

export const E = {
  outCubic: (t: number) => 1 - (1 - t) ** 3,
  inCubic: (t: number) => t * t * t,
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  outBack: (t: number) => {
    const c = 1.70158
    return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2
  },
  outBounce: (t: number) => {
    const n = 7.5625
    const d = 2.75
    if (t < 1 / d) return n * t * t
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375
    return n * (t -= 2.625 / d) * t + 0.984375
  },
}

export const hash = (a: number, b = 0) => {
  const x = Math.sin(a * 127.1 + b * 311.7 + 17.13) * 43758.5453
  return x - Math.floor(x)
}

// closed-form damped spring: the value at τ without simulating up to it
export const springAt = (tau: number, w0: number, z: number) => {
  if (tau <= 0) return 0
  const wd = w0 * Math.sqrt(1 - z * z)
  return 1 - Math.exp(-z * w0 * tau) * (Math.cos(wd * tau) + ((z * w0) / wd) * Math.sin(wd * tau))
}

export const pad = (n: number, w: number) => String(n).padStart(w, '0')
export const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
