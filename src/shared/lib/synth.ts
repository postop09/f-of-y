// 소리는 전부 Web Audio로 합성한다(파일 없음). public/keyframe.html의 신스와 94 BPM 루프를 옮긴 것.
// 각 소리는 (출력 노드, 시작 시각[AudioContext 초], 인자) → 노드를 만들어 예약만 하고 끝난다.
import { hash, springAt } from './math'

export const BPM = 94
/** 1박 (초) */
export const SPB = 60 / BPM
/** 16분음표 (초) */
export const STEP = SPB / 4

/** 장면 효과음으로 쓸 수 있는 한 방짜리 소리 */
export type SfxKind = 'tick' | 'enter' | 'blip' | 'boom' | 'crash' | 'whoosh' | 'shing' | 'boing' | 'thud' | 'riser' | 'hit'

type Voice = (d: AudioNode, a: number, arg?: number) => void
export type Synth = Record<SfxKind | 'kick' | 'clap' | 'hat', Voice> & {
  bass: (d: AudioNode, a: number, f: number, dur: number, v?: number) => void
  pad: (d: AudioNode, a: number, freqs: readonly number[], dur: number, v?: number) => void
}

/** 1초짜리 흰 잡음. 잡음 계열 소리가 돌려 쓴다. */
export const noiseBuffer = (ac: BaseAudioContext) => {
  const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate)
  const ch = b.getChannelData(0)
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1
  return b
}

export const makeSynth = (ac: BaseAudioContext, NB: AudioBuffer): Synth => {
  const gn = (dest: AudioNode, v = 0) => {
    const x = ac.createGain()
    x.gain.value = v
    x.connect(dest)
    return x
  }
  const flt = (dest: AudioNode, type: BiquadFilterType, f: number, q = 0.7) => {
    const b = ac.createBiquadFilter()
    b.type = type
    b.frequency.value = f
    b.Q.value = q
    b.connect(dest)
    return b
  }
  const osc = (dest: AudioNode, type: OscillatorType, f: number, a: number, dur: number, set = true) => {
    const o = ac.createOscillator()
    o.type = type
    if (set) o.frequency.setValueAtTime(f, a)
    else o.frequency.value = f
    o.connect(dest)
    o.start(a)
    o.stop(a + dur)
    return o
  }
  const noise = (dest: AudioNode, a: number, dur: number) => {
    const s = ac.createBufferSource()
    s.buffer = NB
    s.loop = true
    s.connect(dest)
    s.start(a, Math.random() * 0.8)
    s.stop(a + dur)
    return s
  }
  const env = (x: GainNode, a: number, peak: number, atk: number, dec: number) => {
    x.gain.setValueAtTime(0.0001, a)
    x.gain.exponentialRampToValueAtTime(peak, a + atk)
    x.gain.exponentialRampToValueAtTime(0.0001, a + atk + dec)
  }

  return {
    kick(d, a, v = 1) {
      const x = gn(d)
      env(x, a, 0.95 * v, 0.003, 0.36)
      osc(x, 'sine', 155, a, 0.42).frequency.exponentialRampToValueAtTime(44, a + 0.11)
      const c = gn(d)
      env(c, a, 0.14 * v, 0.001, 0.018)
      osc(c, 'square', 1100, a, 0.03)
    },
    clap(d, a, v = 0.62) {
      const x = gn(flt(d, 'bandpass', 1650, 0.9))
      x.gain.setValueAtTime(0.0001, a)
      for (const o of [0, 0.011, 0.022]) {
        x.gain.exponentialRampToValueAtTime(v, a + o + 0.001)
        x.gain.exponentialRampToValueAtTime(v * 0.18, a + o + 0.009)
      }
      x.gain.exponentialRampToValueAtTime(v * 0.8, a + 0.034)
      x.gain.exponentialRampToValueAtTime(0.0001, a + 0.26)
      noise(x, a, 0.3)
      const b = gn(d)
      env(b, a, v * 0.25, 0.002, 0.08)
      osc(b, 'triangle', 205, a, 0.12)
    },
    hat(d, a, v = 0.1) {
      const x = gn(flt(d, 'highpass', 7600, 0.6))
      env(x, a, v, 0.001, 0.045)
      noise(x, a, 0.07)
    },
    bass(d, a, f, dur, v = 0.34) {
      const lp = flt(d, 'lowpass', 900, 3.5)
      lp.frequency.setValueAtTime(950, a)
      lp.frequency.exponentialRampToValueAtTime(170, a + 0.2)
      const x = gn(lp)
      x.gain.setValueAtTime(0.0001, a)
      x.gain.exponentialRampToValueAtTime(v, a + 0.008)
      x.gain.setTargetAtTime(0.0001, a + dur * 0.75, 0.05)
      osc(x, 'sawtooth', f, a, dur + 0.4)
      osc(x, 'sine', f, a, dur + 0.4)
    },
    pad(d, a, freqs, dur, v = 0.022) {
      const x = gn(flt(d, 'lowpass', 1250, 0.4))
      x.gain.setValueAtTime(0.0001, a)
      x.gain.exponentialRampToValueAtTime(v, a + 0.4)
      x.gain.setValueAtTime(v, a + dur - 0.1)
      x.gain.exponentialRampToValueAtTime(0.0001, a + dur + 0.45)
      for (const f of freqs) for (const dt of [-7, 7]) osc(x, 'sawtooth', f, a, dur + 0.5).detune.value = dt
    },
    tick(d, a, i = 0) {
      const x = gn(flt(d, 'highpass', 1200, 0.7))
      env(x, a, 0.045, 0.001, 0.022)
      osc(x, 'triangle', 1700 + ((i * 173) % 900), a, 0.04)
    },
    enter(d, a) {
      const x = gn(d)
      env(x, a, 0.14, 0.002, 0.07)
      osc(x, 'square', 440, a, 0.1)
      const n = gn(flt(d, 'highpass', 3000))
      env(n, a, 0.1, 0.001, 0.03)
      noise(n, a, 0.05)
    },
    blip(d, a, i = 0) {
      const x = gn(d)
      env(x, a, 0.06, 0.002, 0.07)
      osc(x, 'sine', 660 * Math.pow(2, (i % 6) / 6), a, 0.1)
    },
    boom(d, a) {
      const x = gn(d)
      env(x, a, 0.9, 0.004, 0.9)
      osc(x, 'sine', 95, a, 1).frequency.exponentialRampToValueAtTime(30, a + 0.55)
      const n = gn(flt(d, 'lowpass', 700))
      env(n, a, 0.45, 0.002, 0.45)
      noise(n, a, 0.5)
    },
    crash(d, a) {
      const x = gn(flt(d, 'highpass', 4800, 0.5))
      env(x, a, 0.16, 0.002, 1.5)
      noise(x, a, 1.6)
    },
    whoosh(d, a) {
      const bp = flt(d, 'bandpass', 280, 1.3)
      bp.frequency.setValueAtTime(280, a)
      bp.frequency.exponentialRampToValueAtTime(3800, a + 0.6)
      const x = gn(bp)
      x.gain.setValueAtTime(0.0001, a)
      x.gain.exponentialRampToValueAtTime(0.35, a + 0.38)
      x.gain.exponentialRampToValueAtTime(0.0001, a + 0.75)
      noise(x, a, 0.8)
    },
    shing(d, a) {
      const x = gn(flt(d, 'highpass', 5500))
      env(x, a, 0.22, 0.001, 0.2)
      noise(x, a, 0.25)
      ;[3150, 4720].forEach((f, i) => {
        const s = gn(d)
        env(s, a, 0.05 / (i + 1), 0.001, 0.35)
        osc(s, 'sine', f, a, 0.4)
      })
    },
    boing(d, a) {
      const x = gn(d)
      env(x, a, 0.16, 0.004, 1)
      const o = osc(x, 'triangle', 360, a, 1.05, false)
      const N = 48
      const c = new Float32Array(N)
      for (let i = 0; i < N; i++) c[i] = 210 + 150 * (1 - springAt(i / (N - 1), 19, 0.26))
      o.frequency.setValueCurveAtTime(c, a, 1)
    },
    thud(d, a, i = 0) {
      const x = gn(d)
      env(x, a, 0.55, 0.002, 0.17)
      osc(x, 'sine', 120 - i * 6, a, 0.22).frequency.exponentialRampToValueAtTime(46, a + 0.1)
      const n = gn(flt(d, 'lowpass', 500))
      env(n, a, 0.18, 0.001, 0.07)
      noise(n, a, 0.1)
    },
    riser(d, a, dur = 2 * SPB) {
      const bp = flt(d, 'bandpass', 200, 1.6)
      bp.frequency.setValueAtTime(200, a)
      bp.frequency.exponentialRampToValueAtTime(6000, a + dur)
      const x = gn(bp)
      x.gain.setValueAtTime(0.0001, a)
      x.gain.exponentialRampToValueAtTime(0.3, a + dur * 0.95)
      x.gain.exponentialRampToValueAtTime(0.0001, a + dur + 0.05)
      noise(x, a, dur + 0.1)
      const s = gn(d)
      s.gain.setValueAtTime(0.0001, a)
      s.gain.exponentialRampToValueAtTime(0.035, a + dur)
      s.gain.exponentialRampToValueAtTime(0.0001, a + dur + 0.05)
      osc(s, 'sawtooth', 110, a, dur + 0.1).frequency.exponentialRampToValueAtTime(880, a + dur)
    },
    hit(d, a) {
      const x = gn(flt(d, 'bandpass', 2400, 2.5))
      env(x, a, 0.5, 0.001, 0.05)
      noise(x, a, 0.08)
      const s = gn(d)
      env(s, a, 0.12, 0.001, 0.08)
      osc(s, 'square', 1250, a, 0.1)
    },
  }
}

const ROOT = [87.31, 69.3, 103.83, 77.78] // F, Db, Ab, Eb
const CHORD = [
  [174.61, 207.65, 261.63, 311.13],
  [138.59, 174.61, 207.65, 261.63],
  [207.65, 261.63, 311.13, 392.0],
  [155.56, 196.0, 233.08, 277.18],
]

/** 반주가 숨을 고른 뒤 다시 터지는 박. 영상에서는 zoom의 CLOSE가 여기에 떨어진다(scenes.test.ts가 확인). */
export const DROP = 80

/** 16분음표 한 칸(step)의 반주. 첫 마디는 패드와 하이햇만, DROP 앞 한 마디는 숨 고르기(직전 박의 클랩 롤로 예고하고,
 * 크래시와 긴 베이스 한 음으로 들어간다), 그 뒤로는 4마디 진행이 계속 돈다. */
export const music = (S: Synth, d: AudioNode, step: number, a: number) => {
  const bar = Math.floor(step / 16)
  const s = step % 16
  const beat = step / 4
  if (beat < 4) {
    if (s === 0) S.pad(d, a, CHORD[0], 4 * SPB, 0.016)
    if (s >= 8 && s % 2 === 0) S.hat(d, a, 0.06)
    return
  }
  if (s === 0) S.pad(d, a, CHORD[bar % 4], 4 * SPB)
  if (beat >= DROP - 4 && beat < DROP) {
    // enter on a crash with one long bass note under it, so the floor does not just vanish
    if (beat === DROP - 4) {
      S.crash(d, a)
      S.bass(d, a, ROOT[bar % 4], 3.5 * SPB, 0.26)
    }
    if (beat < DROP - 1) {
      S.hat(d, a, 0.04 + (0.1 * (beat - (DROP - 4))) / 3)
      if (s === 0 || s === 8) S.kick(d, a, 0.8)
    }
    return
  }
  if (s === 0 || s === 7 || s === 10) S.kick(d, a, s === 0 ? 1 : 0.78)
  if (s === 4 || s === 12) S.clap(d, a)
  // the last beat before the breakdown: a clap roll on sixteenths, getting louder, says a change is coming
  if (beat >= DROP - 5 && beat < DROP - 4 && s > 12) S.clap(d, a, 0.3 + 0.1 * (s - 12))
  if (s % 2 === 0) S.hat(d, a, s % 4 === 0 ? 0.13 : 0.075)
  else if (hash(step, 3) < 0.2) S.hat(d, a, 0.04)
  const f = ROOT[bar % 4]
  if (s === 0) S.bass(d, a, f, STEP * 5.5)
  else if (s === 10) S.bass(d, a, f, STEP * 2.6)
  else if (s === 14) S.bass(d, a, f * 2, STEP * 1.7, 0.22)
}
