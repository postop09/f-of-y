// A kinetic-type film whose only clock is the scroll position.
//
// The page is a tall empty track; the stage is pinned over it. Every frame the
// scroll offset becomes u (scroll units), u picks a scene, and that scene's
// pure view(f) is rendered. Scrolling plays, stopping freezes, scrolling up
// rewinds, and a reload lands on exactly the same frame.
//
// The first visit plays once like a video: a click (or Space) starts it with
// sound, scrolling is locked, u runs on the music clock from 0 to the end, then
// the scroll position is parked on that last frame and handed back to the reader.
// The 94 BPM loop keeps going after that; scene sound effects fire as the scroll
// passes them, and a click drops a hit on the next sixteenth note.
import { type CSSProperties, type PointerEvent, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cuesBetween } from '@/entities/scene/lib/cues'
import { CUES, SCENES, TOTAL, sceneAt } from '@/entities/scene/model/scenes'
import type { Frame } from '@/entities/scene/model/types'
import { REDUCE } from '@/shared/config/motion'
import { COL } from '@/shared/config/typography'
import { resetCaches } from '@/shared/lib/caches'
import { type Layout, makeLayout } from '@/shared/lib/layout'
import { clamp } from '@/shared/lib/math'
import { drawHits, pruneHits } from '../lib/hits'
import { type Sound, createSound } from '../lib/sound'
import { flashOpacity, worldTransform } from '../lib/worldTransform'
import { AUTOPLAY_SPEED, markAutoplayed, shouldAutoplay } from '../model/autoplay'
import { type FrameState, type Motion, createMotion } from '../model/motion'
import { UNIT } from '../model/unit'
import { Help } from './Help'
import { Hud } from './Hud'
import { ScriptOutline } from './ScriptOutline'
import { Transport } from './Transport'
import './scrollStage.css'

const jump = (top: number) => window.scrollTo({ top, behavior: REDUCE ? 'auto' : 'smooth' })
/** the end card and the transport ask for a replay with this event; the stage's input effect does the work (no refs read in render) */
const REPLAY = 'f-of-y:replay'
const requestReplay = () => window.dispatchEvent(new Event(REPLAY))
/** keys that would scroll the page; swallowed while the film plays itself */
const SCROLL_KEYS = new Set([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'])

export const ScrollStage = () => {
  const stageRef = useRef<HTMLElement>(null)
  const probeRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [autoplay] = useState(() => shouldAutoplay(REDUCE))
  const mRef = useRef<Motion | null>(null)
  if (mRef.current === null) mRef.current = createMotion(autoplay)
  const soundRef = useRef<Sound | null>(null)
  if (soundRef.current === null) soundRef.current = createSound()
  const [L, setL] = useState<Layout | null>(null)
  const [fr, setFr] = useState<FrameState>({ u: 0, v: 0, now: 0, blink: true, unitPx: 0, auto: autoplay, wait: autoplay })
  const [muted, setMuted] = useState(false)

  // layout: stage size, scroll unit, fonts
  useLayoutEffect(() => {
    const m = mRef.current
    const stage = stageRef.current
    const probe = probeRef.current
    if (!m || !stage || !probe) return
    let ver = 0
    let alive = true
    const measure = () => {
      const r = stage.getBoundingClientRect()
      const unitPx = probe.getBoundingClientRect().height * UNIT
      if (!m.unitPx) m.u = m.auto ?? window.scrollY / unitPx // start where the browser restored the scroll
      else if (Math.abs(unitPx - m.unitPx) > 0.5) window.scrollTo(0, (window.scrollY / m.unitPx) * unitPx)
      m.unitPx = unitPx
      resetCaches()
      setL(makeLayout(r.width, r.height, ++ver))
      m.dirty = true
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    Promise.race([
      Promise.all([document.fonts.load('900 100px "Archivo"'), document.fonts.load('500 16px "IBM Plex Mono"')]),
      new Promise((r) => setTimeout(r, 3000)),
    ])
      .catch(() => {})
      .then(() => {
        if (!alive) return
        m.ready = true
        measure()
      })
    return () => {
      alive = false
      ro.disconnect()
    }
  }, [])

  // the loop: follow the scroll with a little damping, re-render only on change
  useEffect(() => {
    const m = mRef.current
    const sound = soundRef.current
    if (!m || !sound) return
    let raf = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      sound.pump()
      if (!m.unitPx) return
      const dt = clamp((now - (m.last || now)) / 1000, 0.001, 0.25)
      m.last = now
      // while autoplaying the music is the clock (wall time if there is no sound); it waits for the fonts and the first click
      if (m.auto !== null && m.ready && m.go) {
        const c = sound.clock()
        m.auto = Math.min(TOTAL, c === null ? m.auto + dt * AUTOPLAY_SPEED : c * AUTOPLAY_SPEED)
      }
      const target = m.auto ?? clamp(window.scrollY / m.unitPx, 0, TOTAL)
      const prev = m.u
      m.u = m.auto !== null || REDUCE || Math.abs(target - m.u) < 1e-3 ? target : m.u + (target - m.u) * (1 - Math.exp(-dt * 11))
      m.v += ((m.u - prev) / dt - m.v) * (1 - Math.exp(-dt * 12))
      if (Math.abs(m.v) < 0.005) m.v = 0
      // sound effects: booked ahead on the beat while autoplaying, fired as the scroll passes them otherwise
      if (m.auto !== null) {
        if (m.go) {
          const until = Math.min(TOTAL, m.auto + 0.15 * AUTOPLAY_SPEED)
          for (const c of cuesBetween(CUES, m.sfxU, until)) sound.fx(c.kind, c.arg, c.u / AUTOPLAY_SPEED)
          m.sfxU = Math.max(m.sfxU, until)
        }
      } else {
        // forward only, and not on a jump: a scrub across the film should not fire every cue at once
        const du = m.u - m.sfxU
        if (du > 0 && du < 2) for (const c of cuesBetween(CUES, m.sfxU, m.u).slice(0, 8)) sound.fx(c.kind, c.arg)
        m.sfxU = m.u
      }
      if (m.hits.length) {
        pruneHits(m.hits, now / 1000)
        m.dirty = true
      }
      if (m.auto !== null && m.auto >= TOTAL) {
        // the end: park the scroll on the last frame and hand it over
        m.auto = null
        m.dirty = true
        markAutoplayed()
        window.scrollTo(0, TOTAL * m.unitPx)
      }
      const blink = now % 1060 < 560
      if (m.u !== prev || m.v !== m.lastV || blink !== m.blink || m.dirty) {
        m.dirty = false
        m.blink = blink
        m.lastV = m.v
        setFr({ u: m.u, v: m.v, now: now / 1000, blink, unitPx: m.unitPx, auto: m.auto !== null, wait: m.auto !== null && !m.go })
      }
    }
    raf = requestAnimationFrame(loop)
    // keep the music booked while rAF is throttled
    const timer = setInterval(sound.pump, 25)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(timer)
    }
  }, [])

  // clicks (start, hits) and keyboard (start, scene jumps, mute)
  useEffect(() => {
    const m = mRef.current
    const sound = soundRef.current
    if (!m || !sound) return
    // the first click or key is also what lets the browser make sound
    const begin = () => {
      sound.start()
      if (m.auto === null || m.go) return false
      m.go = true
      m.dirty = true
      return true
    }
    const onClick = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest('button, #scrub')) return
      if (begin()) return
      const delay = sound.hit()
      m.hits.push({ x: e.clientX, y: e.clientY, t: performance.now() / 1000 + delay, seed: Math.floor(Math.random() * 1e4) })
      m.dirty = true
    }
    // the root is overflow:hidden while autoplaying; these also cover iOS touch and keyboard paging
    const onBlock = (e: Event) => {
      if (m.auto !== null) e.preventDefault()
    }
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey || e.altKey
      const onButton = e.target instanceof Element && e.target.closest('button') !== null
      if (!mod && (e.key === 'm' || e.key === 'M')) {
        setMuted(sound.toggleMute())
        return
      }
      if (m.auto !== null) {
        if (!mod && !onButton && (e.key === ' ' || e.key === 'Enter')) begin()
        if (SCROLL_KEYS.has(e.key)) e.preventDefault()
        return
      }
      if (mod || !m.unitPx) return
      sound.start()
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      e.preventDefault()
      // a second press while a smooth jump is still travelling counts from where it is going
      const inFlight = m.jumpTo != null && performance.now() - m.jumpAt < 900 && Math.abs(window.scrollY - m.jumpTo) > 2
      const u = (inFlight && m.jumpTo != null ? m.jumpTo : window.scrollY) / m.unitPx
      const i = sceneAt(u + 0.02)
      const next = e.key === 'ArrowRight' ? Math.min(SCENES.length - 1, i + 1) : u - SCENES[i].at > 0.25 ? i : Math.max(0, i - 1)
      m.jumpTo = Math.ceil(SCENES[next].at * m.unitPx) + 1 // land just inside the scene, never a pixel short
      m.jumpAt = performance.now()
      jump(m.jumpTo)
    }
    const onVisibility = () => (document.hidden ? sound.suspend() : sound.resume())
    // the end card's button: play the whole film again from the top, music and all, with the scroll locked
    const onReplay = () => {
      sound.start()
      sound.restart()
      m.auto = 0
      m.go = true
      m.sfxU = 0
      m.hits.length = 0
      m.dirty = true
      window.scrollTo(0, 0)
    }
    window.addEventListener(REPLAY, onReplay)
    window.addEventListener('keydown', onKey)
    window.addEventListener('click', onClick)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('wheel', onBlock, { passive: false })
    window.addEventListener('touchmove', onBlock, { passive: false })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('click', onClick)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener(REPLAY, onReplay)
      window.removeEventListener('wheel', onBlock)
      window.removeEventListener('touchmove', onBlock)
    }
  }, [])

  // lock the page scroll for as long as the film plays itself
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('autoplay', fr.auto)
  }, [fr.auto])

  // ── this frame
  const idx = sceneAt(fr.u)
  const sc = SCENES[idx]
  const lb = Math.min(fr.u - sc.at, sc.len)
  const f: Frame | null = L && { lb, p: lb / sc.len, len: sc.len, at: sc.at, u: fr.u, v: fr.v, blink: fr.blink, L, y: fr.u * fr.unitPx, unitPx: fr.unitPx, count: SCENES.length, replay: requestReplay }
  const out = f ? sc.view(f) : null
  const speed = clamp(Math.abs(fr.v) / 1.5)
  const world = worldTransform(out, speed, fr.now)
  const flash = flashOpacity(out, speed)

  useLayoutEffect(() => {
    const c = canvasRef.current
    const m = mRef.current
    if (!c || !f || !m) return
    const W = Math.round(f.L.W * f.L.dpr)
    const H = Math.round(f.L.H * f.L.dpr)
    if (c.width !== W || c.height !== H) {
      c.width = W
      c.height = H
    }
    const g = c.getContext('2d')
    if (!g) return
    g.setTransform(f.L.dpr, 0, 0, f.L.dpr, 0, 0)
    g.clearRect(0, 0, f.L.W, f.L.H)
    if (sc.draw) sc.draw(g, f)
    if (m.hits.length) drawHits(g, m.hits, performance.now() / 1000, out?.paper ? COL.void : COL.sig)
  })

  // ── transport: the bar is a scrubber for the scroll position
  const scrubTo = (x: number) => {
    const m = mRef.current
    const track = trackRef.current
    if (!m || !track || m.auto !== null) return
    const r = track.getBoundingClientRect()
    window.scrollTo(0, clamp((x - r.left) / r.width) * TOTAL * m.unitPx)
  }
  const onScrubDown = (e: PointerEvent<HTMLDivElement>) => {
    const m = mRef.current
    if (!m || m.auto !== null) return
    m.scrubbing = true
    e.currentTarget.setPointerCapture(e.pointerId)
    scrubTo(e.clientX)
  }
  const onScrubMove = (e: PointerEvent<HTMLDivElement>) => {
    if (mRef.current?.scrubbing) scrubTo(e.clientX)
  }
  const onScrubUp = () => {
    if (mRef.current) mRef.current.scrubbing = false
  }

  const prog = fr.u / TOTAL
  const quarter = Math.min(3, Math.floor(f ? f.p * 4 : 0))
  const vpx = Math.round(fr.v * fr.unitPx)

  return (
    <>
      <div className="track" style={{ '--units': TOTAL * UNIT } as CSSProperties}>
        <div className="vh-probe" ref={probeRef} />
      </div>

      <main id="stage" ref={stageRef} className={out?.paper ? 'paper' : ''} aria-label="스크롤 위치에 따라 움직이는 키네틱 타이포그래피">
        <div className="grid" aria-hidden="true" />
        <div className="world" style={{ transform: world }} aria-hidden="true">
          <canvas ref={canvasRef} className="fx" />
          <div className="layer" key={sc.id}>
            {out?.node}
          </div>
          <div className="flash" style={{ opacity: flash.toFixed(3) }} />
        </div>

        <Hud idx={idx} count={SCENES.length} quarter={quarter} cap={out?.cap ?? 'await fonts.ready'} vpx={vpx} y={Math.round(fr.u * fr.unitPx)} />
        <Help wait={fr.wait} hidden={fr.auto ? !fr.wait : fr.u > 0.3} />
        <Transport
          scenes={SCENES}
          total={TOTAL}
          idx={idx}
          prog={prog}
          trackRef={trackRef}
          locked={fr.auto}
          ended={fr.u >= TOTAL - 0.05}
          muted={muted}
          onMute={() => soundRef.current && setMuted(soundRef.current.toggleMute())}
          onHome={() => jump(0)}
          onReplay={requestReplay}
          onPointerDown={onScrubDown}
          onPointerMove={onScrubMove}
          onPointerUp={onScrubUp}
        />
      </main>

      <ScriptOutline scenes={SCENES} />
    </>
  )
}
