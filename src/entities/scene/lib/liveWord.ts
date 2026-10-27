// yours 장면과 영상 끝의 live 필드가 같이 쓰는 큰 단어 자리와 그 픽셀 격자(keyframe.html의 liveBox·rasterLive).
// 같은 단어면 yours가 그린 마지막 픽셀과 live가 시작하는 픽셀이 정확히 겹친다.
import { type CanvasWord, type Cell, type Layout, canvasFit, layoutAt, memo, rasterize } from '@/shared/lib'

export type LiveRaster = { lay: CanvasWord; cells: Cell[]; bbox: { x: number; y: number; w: number; h: number } }

const liveBox = (L: Layout) => {
  const y = L.TY + L.mono * 4.2
  return { x: L.M, y, w: L.W - 2 * L.M, h: Math.max(36, Math.min(L.H * 0.36, L.H - y - L.H * 0.17 - 30)) }
}

/** 단어를 상자 크기에 맞추고 화면 세로 가운데(단, 상자 위보다 위로는 안 감)에 놓아 L.cs 격자로 래스터. 레이아웃이 바뀔 때까지 캐시한다. */
export const liveRaster = (L: Layout, word: string): LiveRaster =>
  memo(L, 'live:' + word, () => {
    const b = liveBox(L)
    const fs = canvasFit(word, b.w, b.h)
    const w = layoutAt(word, 0, b.y, fs).width
    // centre the glyphs (line-height .8) on the middle of the screen, never above the box, so it stays clear of the input line
    const top = Math.max(b.y, L.H * 0.5 - fs * 0.4)
    const lay = layoutAt(word, b.x + (b.w - w) / 2, top, fs)
    const cells = rasterize(word, lay, L.cs)
    if (!cells.length) return { lay, cells, bbox: { x: lay.left, y: lay.top, w: 1, h: 1 } }
    const x0 = Math.min(...cells.map((c) => c.x))
    const y0 = Math.min(...cells.map((c) => c.y))
    const x1 = Math.max(...cells.map((c) => c.x)) + L.cs
    const y1 = Math.max(...cells.map((c) => c.y)) + L.cs
    return { lay, cells, bbox: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } }
  })
