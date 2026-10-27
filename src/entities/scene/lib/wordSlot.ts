// split·pixel의 큰 단어와 boom의 BOOM이 같은 자리에 같은 크기로 놓이는 공용 자리.
// WORD에 맞춘 글자 크기로, 가로는 가운데, 세로는 화면 50% 지점에 둔다.
import { type Layout, fit, textW } from '@/shared/lib'
import { centre } from './centre'

export const wordSlot = (L: Layout, text = 'WORD') => {
  const W = fit('WORD', (L.W - 2 * L.M) * 0.92, L.H * 0.34)
  const w = text === 'WORD' ? W.w : textW(text, W.fs)
  return { fs: W.fs, w, x: L.W / 2 - w / 2, y: centre(L, W, 0.5).y }
}
