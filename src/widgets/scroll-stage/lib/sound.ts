// 소리 담당: AudioContext 하나, 94 BPM 반주 스케줄러, 효과음, 박자에 맞춘 클릭 히트, 음소거.
// 브라우저는 클릭·키 입력 전에는 소리를 막으므로 start()는 반드시 그 이벤트 안에서 부른다.
// 반주의 시계는 AudioContext.currentTime이다. 탭이 가려져 suspend되면 시계도, 반주도 함께 멈춘다.
import { type SfxKind, type Synth, STEP, makeSynth, music, noiseBuffer } from '@/shared/lib/synth'

const VOLUME = 0.8
/** 반주를 미리 예약해 두는 길이 (초) */
const AHEAD = 0.14

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

export type Sound = ReturnType<typeof createSound>

export const createSound = () => {
  let ac: AudioContext | null = null
  let master: GainNode | null = null
  /** 모든 소리가 지나는 버스. 다시 재생할 땐 새 버스로 갈아 끼워, 이미 예약된 소리를 끊는다. */
  let bus: GainNode | null = null
  let S: Synth | null = null
  /** 반주 0번 칸이 울리는 AudioContext 시각 */
  let t0 = 0
  let next = 0
  let muted = false

  const lat = () => (ac ? Math.min(0.06, ac.outputLatency || ac.baseLatency || 0) : 0)
  const live = () => (ac && bus && S && ac.state === 'running' ? { ac, bus, S } : null)
  const newBus = () => {
    if (!ac || !master) return
    const old = bus
    if (old) {
      old.gain.setTargetAtTime(0, ac.currentTime, 0.012)
      setTimeout(() => old.disconnect(), 400)
    }
    bus = ac.createGain()
    bus.connect(master)
  }

  return {
    /** 첫 사용자 입력에서 소리를 켠다. 이미 켜져 있으면 깨우기만 한다. */
    start() {
      if (ac) {
        if (ac.state === 'suspended' && !document.hidden) ac.resume().catch(() => {})
        return
      }
      const C = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
      if (!C) return
      try {
        ac = new C({ latencyHint: 'interactive' })
      } catch {
        ac = null
        return
      }
      const comp = ac.createDynamicsCompressor()
      comp.threshold.value = -16
      comp.knee.value = 10
      comp.ratio.value = 4
      comp.attack.value = 0.004
      comp.release.value = 0.2
      master = ac.createGain()
      master.gain.value = muted ? 0 : VOLUME
      master.connect(comp)
      comp.connect(ac.destination)
      S = makeSynth(ac, noiseBuffer(ac))
      newBus()
      t0 = ac.currentTime + 0.06
      next = 0
      if (ac.state === 'suspended') ac.resume().catch(() => {})
    },

    /** 반주가 시작된 뒤 귀에 들리는 시각 (초). 소리를 못 켰으면 null. */
    clock: () => (ac ? Math.max(0, ac.currentTime - lat() - t0) : null),

    /** 반주를 AHEAD만큼 앞서 예약한다. rAF와 타이머 양쪽에서 불러도 된다. */
    pump() {
      const L = live()
      if (!L) return
      const now = L.ac.currentTime
      // after a stall, skip what is already past instead of firing it all at once
      if (t0 + next * STEP < now - 0.05) next = Math.ceil((now - t0) / STEP)
      try {
        for (; t0 + next * STEP < now + AHEAD; next++) music(L.S, L.bus, next, Math.max(now, t0 + next * STEP))
      } catch (err) {
        console.warn(err)
      }
    },

    /** 효과음. at(반주 시계, 초)을 주면 그 시각에, 아니면 바로 */
    fx(kind: SfxKind, arg?: number, at?: number) {
      const L = live()
      if (!L) return
      const now = L.ac.currentTime
      // clock() already subtracts the output latency, so a cue at `at` is heard when clock() reads `at`
      L.S[kind](L.bus, at === undefined ? now + 0.005 : Math.max(now, t0 + at), arg)
    },

    /** 클릭 히트를 다음 16분음표에 예약하고, 소리가 들릴 때까지 남은 초를 돌려준다. */
    hit() {
      const L = live()
      if (!L) return 0
      const now = L.ac.currentTime
      const q = Math.ceil((now - t0 + 0.01) / STEP) * STEP
      L.S.hit(L.bus, t0 + q)
      return t0 + q + lat() - now
    },

    /** 반주를 첫 칸부터 다시: 예약해 둔 소리는 끊고, clock()도 0부터 다시 센다. */
    restart() {
      if (!ac) return
      newBus()
      t0 = ac.currentTime + 0.06
      next = 0
    },

    get muted() {
      return muted
    },
    toggleMute() {
      muted = !muted
      if (ac && master) master.gain.setTargetAtTime(muted ? 0 : VOLUME, ac.currentTime, 0.02)
      return muted
    },

    /** 탭이 가려지면 멈추고, 돌아오면 이어서 */
    suspend: () => void ac?.suspend().catch(() => {}),
    resume: () => void ac?.resume().catch(() => {}),
  }
}
