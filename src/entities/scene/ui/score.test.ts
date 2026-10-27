// 1스크롤 단위 = 반주 1박. 장면은 반 마디(2박) 경계에서 바뀌고, 효과음은 32분음표 격자에 떨어져야 한다.
import { describe, expect, it } from 'vitest'
import { DROP } from '../model/music'
import { CUES, SCENES, TOTAL } from './score'

const onGrid = (x: number, step: number) => Math.abs(x / step - Math.round(x / step)) < 1e-9

describe('scene timing', () => {
  it('starts every scene on a half bar', () => {
    for (const sc of SCENES) expect(onGrid(sc.at, 2), `${sc.id} at ${sc.at}`).toBe(true)
  })
  it('puts every sound cue on the thirty-second grid', () => {
    for (const c of CUES) expect(onGrid(c.u, 1 / 8), `${c.kind} at ${c.u}`).toBe(true)
  })
  it('lands CLOSE on the drop after the breakdown', () => {
    const zoom = SCENES.find((s) => s.id === 'zoom')
    expect(CUES.filter((c) => c.kind === 'boom').map((c) => c.u)).toContain(DROP)
    expect(zoom && zoom.at + 4).toBe(DROP)
  })
  it('runs 100 beats', () => {
    expect(TOTAL).toBe(100)
  })
})
