// shared/lib 의 공개 API. 이 폴더 안에서는 서로 상대 경로(./math)로 가져오고, 이 파일을 되가져오지 않는다.
export { resetCaches } from './caches'
export { type CanvasWord, type Cell, canvasFit, canvasFont, cell, layoutAt, measureO, monoW, rasterize } from './canvasText'
export { type Layout, bigBox, makeLayout, memo } from './layout'
export { E, bump, clamp, hash, lerp, pad, range, span, springAt } from './math'
export { type SfxKind, type Synth, BPM, SPB, STEP, makeSynth, noiseBuffer } from './synth'
export { type Fit, fit, textW } from './textMeasure'
export { type Clock, type Seg, countOn, sliceCounts, typeOn, typeStep } from './typing'
