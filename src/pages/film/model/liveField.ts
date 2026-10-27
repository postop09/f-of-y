// live 필드: 영상 끝에서 YOURS 픽셀이 손에 넘어온다(public/keyframe.html의 live 장면을 옮김).
// 칸마다 제자리로 당기는 스프링이 있고, 커서가 밀고, 클릭하면 터졌다가 돌아오고, 반주 박마다 살짝 부푼다.
// 단어를 바꾸면 칸들이 새 단어 자리로 옮겨 가고, 남는 칸은 사라지고 모자란 칸은 기존 칸 근처에서 생겨난다.
// 장면들과 달리 스크롤의 순수 함수가 아니라 시간으로 흐르는 상태라서, 페이지가 rAF 루프에서 직접 굴린다.
import { liveRaster } from '@/entities/scene'
import { COL } from '@/shared/config'
import { type Layout, cell, hash } from '@/shared/lib'

type LiveCell = { x: number; y: number; vx: number; vy: number; hx: number; hy: number; lime: boolean; a: number; dying: boolean }
type Pointer = { x: number; y: number; in: boolean }

export const LIVE_START = 'YOURS'
export const MAX_WORD = 12

const byX = (a: { x: number; y: number }, b: { x: number; y: number }) => a.x - b.x || a.y - b.y

export type LiveField = ReturnType<typeof createLiveField>

export const createLiveField = () => {
  let word = LIVE_START
  let cells: LiveCell[] = []
  let bbox = { x: 0, y: 0, w: 1, h: 1 }
  let key = ''
  let boomAt = -1e9
  let lastBeat = -1
  let moved = 0

  const home = (L: Layout, w: string) => {
    const R = liveRaster(L, w)
    cells = R.cells.map((c) => ({ x: c.x, y: c.y, vx: 0, vy: 0, hx: c.x, hy: c.y, lime: c.lime, a: 1, dying: false }))
    bbox = R.bbox
    key = L.key
  }

  /** retarget the cells to `next`: survivors move over, extras fade out, missing ones grow out of the old word */
  const retarget = (L: Layout, next: string, kick: boolean) => {
    const R = liveRaster(L, next)
    if (!R.cells.length) return
    const tg = R.cells.slice().sort(byX)
    const old = cells.filter((c) => !c.dying).sort(byX)
    const n = tg.length
    const m = old.length
    const out: LiveCell[] = []
    for (let i = 0; i < Math.max(n, m); i++) {
      if (i < n) {
        let c = old[i]
        if (!c) {
          const s = m ? old[(i * 7919) % m] : { x: L.W / 2, y: L.H / 2 }
          c = { x: s.x, y: s.y, vx: 0, vy: 0, hx: 0, hy: 0, lime: false, a: 0, dying: false }
        }
        c.hx = tg[i].x
        c.hy = tg[i].y
        c.lime = tg[i].lime
        c.dying = false
        out.push(c)
      } else {
        const c = old[i]
        const t = tg[i % n]
        c.dying = true
        c.hx = t.x
        c.hy = t.y
        out.push(c)
      }
    }
    cells = out
    bbox = R.bbox
    word = next
    if (kick)
      cells.forEach((c, i) => {
        c.vy -= 160 + 260 * hash(i, 9)
        c.vx += (hash(i, 8) - 0.5) * 260
      })
  }

  const physics = (L: Layout, dt: number, ptr: Pointer) => {
    const cs = L.cs
    const Ks = 120
    const C = 12
    const R = cs * 8
    const F = cs * 900
    for (const c of cells) {
      let ax = Ks * (c.hx - c.x) - C * c.vx
      let ay = Ks * (c.hy - c.y) - C * c.vy
      if (ptr.in) {
        const dx = c.x + cs / 2 - ptr.x
        const dy = c.y + cs / 2 - ptr.y
        const d2 = dx * dx + dy * dy
        if (d2 < R * R) {
          const d = Math.sqrt(d2) + 0.001
          const k = 1 - d / R
          ax += (dx / d) * F * k * k
          ay += (dy / d) * F * k * k
        }
      }
      c.vx += ax * dt
      c.vy += ay * dt
      c.x += c.vx * dt
      c.y += c.vy * dt
      c.a = c.dying ? Math.max(0, c.a - dt * 2.5) : Math.min(1, c.a + dt * 4)
    }
    cells = cells.filter((c) => !(c.dying && c.a <= 0))
  }

  return {
    get word() {
      return word
    },
    get bbox() {
      return bbox
    },

    /** the stage reached the end: start from YOURS exactly where the yours scene left it, then morph to the word kept from last time */
    enter(L: Layout) {
      const keep = word
      home(L, LIVE_START)
      word = LIVE_START
      lastBeat = -1
      if (keep !== LIVE_START) retarget(L, keep, false)
    },

    /** a new word from the input; `kick` throws the cells up as they move */
    setWord(L: Layout, next: string, kick: boolean) {
      const w = next.trim().toUpperCase().slice(0, MAX_WORD)
      if (w && w !== word) retarget(L, w, kick)
    },

    /** a click: every cell is pushed away from (x, y), harder the closer it is */
    boom(L: Layout, x: number, y: number, now: number) {
      const cs = L.cs
      const reach = Math.max(L.W, L.H) * 0.8
      for (const c of cells) {
        const dx = c.x + cs / 2 - x
        const dy = c.y + cs / 2 - y
        const d = Math.hypot(dx, dy) + 1
        const J = (900 + 700 * Math.random()) * Math.max(0.15, 1 - d / reach) * (cs / 10)
        c.vx += (dx / d) * J
        c.vy += (dy / d) * J - 220 * Math.random()
      }
      boomAt = now
    },

    /** advance by dt seconds; `beat` is the music position in beats (null without sound) */
    step(L: Layout, dt: number, ptr: Pointer, beat: number | null) {
      if (key !== L.key) home(L, word) // resized: rebuild in place
      const b = beat === null ? -1 : Math.floor(beat)
      if (b >= 0 && b !== lastBeat) {
        // every beat the word breathes out a little from its centre
        if (lastBeat >= 0) {
          const cx = bbox.x + bbox.w / 2
          const cy = bbox.y + bbox.h / 2
          for (const c of cells) {
            const dx = c.x - cx
            const dy = c.y - cy
            const d = Math.hypot(dx, dy) + 1
            c.vx += (dx / d) * 70
            c.vy += (dy / d) * 70
          }
        }
        lastBeat = b
      }
      const n = Math.ceil(dt / (1 / 120))
      for (let s = 0; s < n; s++) physics(L, dt / n, ptr)
    },

    draw(g: CanvasRenderingContext2D, L: Layout, beat: number | null) {
      const cs = L.cs
      const pulse = beat === null ? 0 : Math.exp(-6 * (beat - Math.floor(beat)))
      moved = 0
      for (const c of cells) {
        const hot = Math.abs(c.x - c.hx) + Math.abs(c.y - c.hy) > cs * 1.2
        if (hot) moved++
        cell(g, c.x, c.y, cs, c.lime || hot ? COL.sig : COL.ink, c.a * (1 + 0.14 * pulse))
      }
    },

    /** the HUD line and the camera kick of the last click */
    status(now: number) {
      const q = now - boomAt
      return {
        cap: `field.step(dt)  // n=${cells.length}  moved=${moved}`,
        shake: q < 1 ? 20 * Math.exp(-q * 9) : 0,
        flash: q < 1 ? 0.14 * Math.exp(-q * 16) : 0,
      }
    },
  }
}
