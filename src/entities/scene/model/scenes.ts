// F(Y)의 악보. 20장면이 이 배열 순서대로 쌓이고, 각 장면의 view(f)는 이 프레임의 JSX와
// 카메라 / 플래시 / 흔들림 / HUD 캡션을 돌려준다. draw(g, f)는 캔버스 층을 그린다.
// 장면 하나 = ui/scenes/NN-id.tsx 파일 하나 (전용 CSS가 있으면 같은 이름의 .css).
import { collectCues } from '../lib/cues'
import { findSceneIndex } from '../lib/findSceneIndex'
import { stackScenes } from '../lib/stackScenes'
import { boot } from '../ui/scenes/01-boot'
import { render } from '../ui/scenes/02-render'
import { blank } from '../ui/scenes/03-blank'
import { goes } from '../ui/scenes/04-goes'
import { timeline } from '../ui/scenes/05-timeline'
import { lands } from '../ui/scenes/06-lands'
import { done } from '../ui/scenes/07-done'
import { split } from '../ui/scenes/08-split'
import { letters } from '../ui/scenes/09-letters'
import { bend } from '../ui/scenes/10-bend'
import { strip } from '../ui/scenes/11-strip'
import { code } from '../ui/scenes/12-code'
import { everyone } from '../ui/scenes/13-everyone'
import { take } from '../ui/scenes/14-take'
import { pixel } from '../ui/scenes/15-pixel'
import { sixty } from '../ui/scenes/16-sixty'
import { zoom } from '../ui/scenes/17-zoom'
import { boom } from '../ui/scenes/18-boom'
import { outro } from '../ui/scenes/19-outro'
import { yours } from '../ui/scenes/20-yours'
import '../ui/scenes.css'

const stacked = stackScenes([
  boot, render, blank, goes, timeline, lands, done, split,
  letters, bend, strip, code, everyone, take, pixel, sixty, zoom, boom, outro, yours,
])

export const SCENES = stacked.scenes
/** 전체 길이 (스크롤 단위) */
export const TOTAL = stacked.total
export const sceneAt = (u: number) => findSceneIndex(SCENES, u)
/** 모든 장면의 효과음 신호, 전체 위치 순 */
export const CUES = collectCues(SCENES)
