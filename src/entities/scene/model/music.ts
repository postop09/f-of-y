// 반주 악보: 16분음표 한 칸(step)마다 어떤 소리를 예약할지. 신스(shared/lib/synth)는 악기만 알고, 곡은 여기 있다.
// 장면 악보(ui/score.ts)는 이 박자에 맞춰 잘려 있다 (ui/score.test.ts 가 확인).
import { type Synth, SPB, STEP, hash } from '@/shared/lib'

const ROOT = [87.31, 69.3, 103.83, 77.78] // F, Db, Ab, Eb
const CHORD = [
  [174.61, 207.65, 261.63, 311.13],
  [138.59, 174.61, 207.65, 261.63],
  [207.65, 261.63, 311.13, 392.0],
  [155.56, 196.0, 233.08, 277.18],
]

/** 반주가 숨을 고른 뒤 다시 터지는 박. 영상에서는 zoom의 CLOSE가 여기에 떨어진다(score.test.ts가 확인). */
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
