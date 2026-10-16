// A kinetic-type film whose only clock is the scroll position.
//
// The page is a tall empty track; the stage is pinned over it. Every frame the
// scroll offset becomes u (scroll units), u picks a scene, and that scene's
// pure view(f) is rendered. Scrolling plays, stopping freezes, scrolling up
// rewinds, and a reload lands on exactly the same frame.
import { type CSSProperties, type PointerEvent, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SCENES, TOTAL, sceneAt } from '@/entities/scene/model/scenes'
import type { Frame } from '@/entities/scene/model/types'
import { REDUCE } from '@/shared/config/motion'
import { resetCaches } from '@/shared/lib/caches'
import { type Layout, makeLayout } from '@/shared/lib/layout'
import { clamp } from '@/shared/lib/math'
import { lensPass } from '../lib/lensPass'
import { flashOpacity, worldTransform } from '../lib/worldTransform'
import { type FrameState, type Motion, createMotion } from '../model/motion'
import { UNIT } from '../model/unit'
import { Help } from './Help'
import { Hud } from './Hud'
import { ScriptOutline } from './ScriptOutline'
import { Transport } from './Transport'
import './scrollStage.css'

const jump = (top: number) => window.scrollTo({ top, behavior: REDUCE ? 'auto' : 'smooth' })

export const ScrollStage = () => {
  const stageRef = useRef<HTMLElement>(null)
  const probeRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const mRef = useRef<Motion | null>(null)
  if (mRef.current === null) mRef.current = createMotion()
  const [L, setL] = useState<Layout | null>(null)
  const [fr, setFr] = useState<FrameState>({ u: 0, v: 0, now: 0, blink: true, unitPx: 0 })

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
      if (!m.unitPx) m.u = window.scrollY / unitPx // start where the browser restored the scroll
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
      .then(() => alive && measure())
    return () => {
      alive = false
      ro.disconnect()
    }
  }, [])

  // the loop: follow the scroll with a little damping, re-render only on change
  useEffect(() => {
    const m = mRef.current
    if (!m) return
    let raf = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (!m.unitPx) return
      const dt = clamp((now - (m.last || now)) / 1000, 0.001, 0.25)
      m.last = now
      const target = clamp(window.scrollY / m.unitPx, 0, TOTAL)
      const prev = m.u
      m.u = REDUCE || Math.abs(target - m.u) < 1e-3 ? target : m.u + (target - m.u) * (1 - Math.exp(-dt * 11))
      m.v += ((m.u - prev) / dt - m.v) * (1 - Math.exp(-dt * 12))
      if (Math.abs(m.v) < 0.005) m.v = 0
      const blink = now % 1060 < 560
      if (m.u !== prev || m.v !== m.lastV || blink !== m.blink || m.dirty) {
        m.dirty = false
        m.blink = blink
        m.lastV = m.v
        setFr({ u: m.u, v: m.v, now: now / 1000, blink, unitPx: m.unitPx })
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // pointer (lens) and keyboard (scene jumps)
  useEffect(() => {
    const m = mRef.current
    if (!m) return
    const onMove = (e: globalThis.PointerEvent) => {
      if (e.pointerType === 'touch') return
      m.ptr.x = e.clientX
      m.ptr.y = e.clientY
      m.ptr.in = true
      m.dirty = true
    }
    const onLeave = () => {
      m.ptr.in = false
      m.dirty = true
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || !m.unitPx) return
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
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  // ── this frame
  const idx = sceneAt(fr.u)
  const sc = SCENES[idx]
  const lb = Math.min(fr.u - sc.at, sc.len)
  const f: Frame | null = L && { lb, p: lb / sc.len, len: sc.len, at: sc.at, u: fr.u, v: fr.v, blink: fr.blink, L, y: fr.u * fr.unitPx, unitPx: fr.unitPx, count: SCENES.length }
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
    lensPass(layerRef.current, m.ptr, f.L)
  })

  // ── transport: the bar is a scrubber for the scroll position
  const scrubTo = (x: number) => {
    const m = mRef.current
    const track = trackRef.current
    if (!m || !track) return
    const r = track.getBoundingClientRect()
    window.scrollTo(0, clamp((x - r.left) / r.width) * TOTAL * m.unitPx)
  }
  const onScrubDown = (e: PointerEvent<HTMLDivElement>) => {
    const m = mRef.current
    if (!m) return
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
          <div ref={layerRef} className="layer" key={sc.id}>
            {out?.node}
          </div>
          <div className="flash" style={{ opacity: flash.toFixed(3) }} />
        </div>

        <Hud idx={idx} count={SCENES.length} quarter={quarter} cap={out?.cap ?? 'await fonts.ready'} vpx={vpx} y={Math.round(fr.u * fr.unitPx)} />
        <Help hidden={fr.u > 0.3} />
        <Transport
          scenes={SCENES}
          total={TOTAL}
          idx={idx}
          prog={prog}
          trackRef={trackRef}
          onHome={() => jump(0)}
          onPointerDown={onScrubDown}
          onPointerMove={onScrubMove}
          onPointerUp={onScrubUp}
        />
      </main>

      <ScriptOutline scenes={SCENES} />
    </>
  )
}
