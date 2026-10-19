// 뷰포트 크기 → 레이아웃 (영상의 boot 장면과 같은 자리를 잡기 위해). 리사이즈마다 다시 잰다.
import { useLayoutEffect, useRef, useState } from 'react'
import { type Layout, makeLayout } from '@/shared/lib/layout'

export const useViewportLayout = () => {
  const [L, setL] = useState<Layout | null>(null)
  const ver = useRef(0)
  useLayoutEffect(() => {
    const measure = () => setL(makeLayout(window.innerWidth, window.innerHeight, ++ver.current))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return L
}
