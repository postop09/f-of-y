// 맞춤 크기 s의 글자를 화면 가운데(세로는 yFrac 지점)에 놓는 좌상단 좌표.
import type { Layout } from '@/shared/lib/layout'
import type { Fit } from '@/shared/lib/textMeasure'

export const centre = (L: Layout, s: Fit, yFrac = 0.47) => ({ x: L.W / 2 - s.w / 2, y: L.H * yFrac - s.fs * 0.4 })
