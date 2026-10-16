# f-of-y — F(Y) · 스크롤 키네틱 타이포

키프레임 없이 **스크롤 위치 하나로만** 계산되는 키네틱 타이포그래피 23장면.
내리면 재생, 멈추면 정지, 올리면 되감기. 마우스 근처 글자는 굵기·폭이 깎인다.
`parc-etoile-ui-lab`의 `web/07-scroll/`을 독립 프로젝트로 옮긴 것.

## 실행

```bash
npm install
npm run dev          # http://localhost:5173
npm run build && npm run preview
npm run export       # export/f-of-y.html — 서버 없이 더블클릭으로 열리는 단일 파일
```

## 검증

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## 어떻게 움직이나

- 페이지는 키 큰 빈 트랙이고, 스테이지는 그 위에 고정돼 있다. 매 프레임 `scrollY / unitPx`가 `u`(스크롤 단위, 1단위 = 뷰포트 높이의 18%)가 되고, `u`가 장면을 고른다.
- 장면은 `{ id, len, at, view(f), draw?(g, f) }`. `view(f)`는 순수 함수로 이 프레임의 JSX와 카메라·플래시·흔들림·HUD 캡션을 돌려주고, `draw`는 캔버스 층을 그린다.
- `f.lb`는 장면 안 위치. 시계도 키프레임도 없으니 새로고침해도 같은 프레임에 선다.
- 조작: 휠·스와이프 재생/되감기, `←` `→` 장면 이동, 하단 바 스크러빙, 마우스 글자 렌즈. `prefers-reduced-motion`이면 카메라·흔들림·플래시가 꺼진다.

## 구조 (Feature-Sliced Design)

```
app → pages → widgets → features → entities → shared   (import 는 아래 방향으로만, eslint boundaries 로 강제)

src/app/                  main.tsx, styles/index.css (색·글꼴 토큰)
src/pages/film/           FilmPage — 스테이지가 곧 페이지
src/widgets/scroll-stage/ ScrollStage (트랙·스테이지·rAF 루프·키보드), Hud, Transport(스크러버), Help, ScriptOutline(sr-only 대본)
                          lib/lensPass (커서 근처 글자 축 깎기), lib/worldTransform (카메라·흔들림 → transform)
src/entities/scene/       model/scenes.ts (23장면 순서 → SCENES/TOTAL/sceneAt), model/types.ts (Frame, SceneSpec, Scene, SceneOut, Cam),
                          ui/scenes/NN-id.tsx (장면 하나 = 파일 하나, 전용 클래스는 같은 이름의 .css), ui/scenes.css (여러 장면 공용 클래스),
                          lib/stackScenes (at·TOTAL 누적), lib/findSceneIndex, lib/centre
src/shared/config/        motion (prefers-reduced-motion), typography (글꼴·색 상수)
src/shared/lib/           math (clamp·span·bump·easing·spring·hash), layout (뷰포트 → 레이아웃, memo), textMeasure (DOM 글자 폭),
                          canvasText (캔버스 글자·래스터), typing (타이핑 진행), caches (리사이즈 시 초기화)
src/shared/ui/            Word (글자별 span, 축은 data-w/data-d), Code (모노 한 줄 + 캐럿), Cursor
scripts/exportSingleFile.ts   npm run export
```

테스트는 소스 옆 `*.test.ts` (vitest, node 환경; 레이아웃만 jsdom).

## 장면 추가하기

`src/entities/scene/ui/scenes/NN-id.tsx`에 `export const id: SceneSpec = { id, len, text, view, draw? }`를 만들고,
`src/entities/scene/model/scenes.ts`의 배열 원하는 위치에 끼우면 `at`과 `TOTAL`이 자동으로 밀린다. 그 장면에서만 쓰는 클래스는 옆의 `NN-id.css`에 둔다.
큰 글자는 `<Word>`, 모노 줄은 `<Code>` + `typing()`, 크기 맞춤은 `fit()`을 쓴다. 글자 축(wght/wdth)은 style이 아니라 `Word`의 `w`/`d` 또는 `ch()`로 넘긴다 — 렌즈 패스가 `font-variation-settings`의 유일한 작성자다.
