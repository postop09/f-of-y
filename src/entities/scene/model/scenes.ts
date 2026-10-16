// F(Y)의 악보. 24장면이 이 배열 순서대로 쌓이고, 각 장면의 view(f)는 이 프레임의 JSX와
// 카메라 / 플래시 / 흔들림 / HUD 캡션을 돌려준다. draw(g, f)는 캔버스 층을 그린다.
// 장면 하나 = ui/scenes/NN-id.tsx 파일 하나 (전용 CSS가 있으면 같은 이름의 .css).
import { findSceneIndex } from '../lib/findSceneIndex'
import { stackScenes } from '../lib/stackScenes'
import { boot } from '../ui/scenes/01-boot'
import { blank } from '../ui/scenes/02-blank'
import { blink } from '../ui/scenes/03-blink'
import { letters } from '../ui/scenes/04-letters'
import { keyframe } from '../ui/scenes/05-keyframe'
import { bend } from '../ui/scenes/06-bend'
import { pixel } from '../ui/scenes/07-pixel'
import { spin } from '../ui/scenes/08-spin'
import { split } from '../ui/scenes/09-split'
import { zoom } from '../ui/scenes/10-zoom'
import { snap } from '../ui/scenes/11-snap'
import { stack } from '../ui/scenes/12-stack'
import { goes } from '../ui/scenes/13-goes'
import { sixty } from '../ui/scenes/14-sixty'
import { everyone } from '../ui/scenes/15-everyone'
import { render } from '../ui/scenes/16-render'
import { take } from '../ui/scenes/17-take'
import { boom } from '../ui/scenes/18-boom'
import { done } from '../ui/scenes/19-done'
import { timeline } from '../ui/scenes/20-timeline'
import { code } from '../ui/scenes/21-code'
import { lands } from '../ui/scenes/22-lands'
import { strip } from '../ui/scenes/23-strip'
import { outro } from '../ui/scenes/24-outro'
import '../ui/scenes.css'

const stacked = stackScenes([
  boot, blank, blink, letters, keyframe, bend, pixel, spin, split, zoom, snap, stack,
  goes, sixty, everyone, render, take, boom, done, timeline, code, lands, strip, outro,
])

export const SCENES = stacked.scenes
/** 전체 길이 (스크롤 단위) */
export const TOTAL = stacked.total
export const sceneAt = (u: number) => findSceneIndex(SCENES, u)
