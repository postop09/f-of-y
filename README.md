# f-of-y — F(Y) · 스크롤 키네틱 타이포

키프레임 없이 **스크롤 위치 하나로만** 계산되는 키네틱 타이포그래피 22장면.
내리면 재생, 멈추면 정지, 올리면 되감기. 마우스 근처 글자는 굵기·폭이 깎인다.
`parc-etoile-ui-lab`의 `web/07-scroll/`을 독립 프로젝트로 옮긴 것.

## 실행

```bash
npm install
npm run dev          # http://localhost:5173
npm run build && npm run preview
npm run export       # export/f-of-y.html — 서버 없이 더블클릭으로 열리는 단일 파일
```

explore 화면의 질문은 TypeSafe의 Jev가 고른다. 키는 서버 쪽에만 둔다.

```bash
echo 'TYPESAFE_API_KEY=…' > .env.local   # npm run dev 가 /api/explore 에서 읽는다 (.gitignore 됨)
```

배포(Vercel)에서는 프로젝트 환경변수에 `TYPESAFE_API_KEY`를 등록한다. 키가 없거나 Jev에 닿지 않으면(단일 HTML export 포함) 키워드 매칭으로 대신 고른다.

## 검증

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## 어떻게 움직이나

- 페이지는 키 큰 빈 트랙이고, 스테이지는 그 위에 고정돼 있다. 매 프레임 `scrollY / unitPx`가 `u`(스크롤 단위, 1단위 = 뷰포트 높이의 18%)가 되고, `u`가 장면을 고른다.
- 장면은 `{ id, len, at, view(f), draw?(g, f) }`. `view(f)`는 순수 함수로 이 프레임의 JSX와 카메라·플래시·흔들림·HUD 캡션을 돌려주고, `draw`는 캔버스 층을 그린다.
- `f.lb`는 장면 안 위치. 시계도 키프레임도 없으니 새로고침해도 같은 프레임에 선다.
- 조작: 휠·스와이프 재생/되감기, `←` `→` 장면 이동, 하단 바 스크러빙. `prefers-reduced-motion`이면 카메라·흔들림·플래시가 꺼진다.
- 처음 들어오면 클릭(또는 Space)을 기다렸다가, 소리와 함께 영상처럼 끝까지 한 번 자동 재생된다. 1스크롤 단위 = 반주 1박(94 BPM, `AUTOPLAY_SPEED`)이라 112박, 약 72초이고, 위치는 반주 시계를 따른다. 그동안 스크롤·키·스크러버는 잠기고, 끝나면 스크롤 위치가 마지막 프레임에 놓인 채 조작이 넘어온다. 끝에 있을 때 하단 바 왼쪽의 ↻ 버튼은 반주까지 첫 칸부터 다시 맞춰 처음부터 다시 자동 재생한다. 같은 탭에서는 다시 재생하지 않고(`sessionStorage`), `prefers-reduced-motion`이면 건너뛴다.
- 소리는 전부 Web Audio 합성이다(`public/keyframe.html`에서 옮김). 시작한 뒤로는 94 BPM 반주가 계속 돌고, 장면의 효과음(`sfx`)은 자동 재생 중엔 박자에 맞춰 미리 예약되고 스크롤 모드에선 앞으로 지나갈 때 울린다(되감기·점프에선 안 울림). 클릭하면 다음 16분음표에 히트(소리 + 퍼지는 네모)가 들어간다. `M`이나 하단 바 오른쪽 버튼으로 음소거, 탭이 가려지면 소리도 멈춘다.
- 영상 끝(yours 장면 다음)에서는 live 필드가 된다(`public/keyframe.html`의 live를 옮김). YOURS 픽셀이 시간으로 움직이는 상태가 되어, 커서에 밀리고, 클릭하면 터졌다가 스프링으로 돌아오고, 반주 박마다 부푼다. `$ type("…")` 입력칸에 단어를 치면 픽셀이 그 단어로 옮겨 간다(Enter면 바로, 아니면 입력이 멈춘 뒤). 스크롤을 올리면 다시 영상으로 돌아가고, 바꾼 단어는 다음에 돌아올 때도 남는다. 구현은 `widgets/scroll-stage/lib/liveField.ts`(물리)와 `ui/LiveInput.tsx`(입력 줄).

## explore: 이력서 탐색

- 영상 끝 live 입력칸에 `explore`를 치면 `$ run explore` 버튼이 생기고, 누르면 `#explore` 화면으로 간다(`app/App.tsx`가 해시로 화면을 고름, 뒤로 가기·`cd ..`·Esc면 영상의 마지막 프레임으로 돌아옴).
- 채팅처럼 입력 줄이 화면 맨 아래에 붙어 있다. 영상의 현재 줄처럼 강조된 줄에 `$`와 깜빡이는 블록 캐럿만 있고, 친 글자가 캐럿 앞에 쌓인다. Enter로 보낸 질문과 명령은 한 차례씩 위로 쌓이고(줄 번호가 붙음), 새 차례가 생기면 그 첫 줄까지 스크롤된다. 명령어 `help`(목록) · `categories`(카테고리 목록, 눌러서 보기) · `all`(모든 카테고리의 항목 전체) · `clear`(화면 지우기) · `cd ..`(영상으로 돌아가기)는 질문 대신 바로 처리한다(`features/explore-resume/model/commands.ts`).
- 방문자가 질문을 치면 `POST /api/explore`(`api/explore.ts`, Vercel 함수)가 Jev에 묻는다. Jev는 글을 쓰지 않고 정해진 형식으로만 답하는 모델이라, 세 가지를 확률로 고르게 한다: 카테고리(choice), 경력 항목(choice, `none` 포함), 이력서에 대한 질문인지(noul). 서버는 id와 확률만 돌려주고, 화면이 `entities/resume/model/resume.ts`의 데이터로 카드를 그린다.
- 카테고리: 사용자 경험 · UI 개선 · AI 활용 · 구조·아키텍처 · 운영 안정성 · 협업·프로세스. 항목 하나가 여러 카테고리에 들 수 있고, `categories` 목록에서 고르면 Jev 없이 바로 거른다.
- 이력서 원본 PDF는 `private/`(gitignore)에 둔다. 연락처·주소가 있어 `public/`에 두면 배포에 그대로 공개되기 때문. 화면 데이터에는 이메일·GitHub·포트폴리오만 싣는다.
- `api/`는 Vercel이 파일마다 따로 컴파일하는 Node ESM이라, 서버가 읽는 `entities/resume/lib/jev.ts`·`model/resume.ts`의 런타임 상대 import에는 `.js`를 붙인다.

## 구조 (Feature-Sliced Design)

```
app → pages → widgets → features → entities → shared   (import 는 아래 방향으로만, eslint boundaries 로 강제)

src/app/                  main.tsx, App.tsx (해시로 화면 고르기), styles/index.css (색·글꼴 토큰)
src/pages/film/           FilmPage — 스테이지가 곧 페이지
src/pages/explore/        ExplorePage (이력서 탐색: 아래 붙은 입력 줄 + 위로 쌓이는 결과), lib/useViewportLayout
src/features/explore-resume/  api/ask (/api/explore → 실패하면 키워드 매칭), model/commands (help·categories·all·clear·cd ..), ui/AskLine (`$ ▮` 입력 줄)
src/entities/resume/      model/resume.ts (소개·카테고리·경력 항목), lib/jev (Jev 요청·응답 ↔ ExploreResult), lib/localMatch (키워드 대체 경로), ui/ResumeItemCard
api/explore.ts            Vercel 함수: TYPESAFE_API_KEY로 Jev 호출 (개발 중엔 vite.config.ts 플러그인이 같은 함수를 서빙)
src/widgets/scroll-stage/ ScrollStage (트랙·스테이지·rAF 루프·키보드·자동 재생), Hud, Transport(스크러버), Help, ScriptOutline(sr-only 대본)
                          lib/sound (AudioContext·반주 스케줄러·효과음·히트·음소거), lib/hits (클릭 히트 그리기), lib/liveField + ui/LiveInput (끝의 live 필드), model/autoplay (첫 방문 자동 재생 여부·속도)
                          lib/worldTransform (카메라·흔들림 → transform)
src/entities/scene/       model/scenes.ts (22장면 순서 → SCENES/TOTAL/sceneAt), model/types.ts (Frame, SceneSpec, Scene, SceneOut, Cam),
                          ui/scenes/NN-id.tsx (장면 하나 = 파일 하나, 전용 클래스는 같은 이름의 .css), ui/scenes.css (여러 장면 공용 클래스),
                          lib/stackScenes (at·TOTAL 누적), lib/cues (typeCues·효과음 신호 펼치기 → CUES), lib/wordSlot (WORD·BOOM 자리), lib/liveWord (YOURS·live 단어 자리와 격자), lib/findSceneIndex, lib/centre
src/shared/config/        motion (prefers-reduced-motion), typography (글꼴·색 상수)
src/shared/lib/           math (clamp·span·bump·easing·spring·hash), layout (뷰포트 → 레이아웃, memo), textMeasure (DOM 글자 폭),
                          canvasText (캔버스 글자·래스터), typing (타이핑 진행), caches (리사이즈 시 초기화)
                          synth (Web Audio 신스·94 BPM 반주, keyframe.html에서 옮김)
src/shared/ui/            Word (글자별 span, 기본 축이 아닌 글자만 font-variation-settings), Code (모노 한 줄 + 캐럿), Cursor, CellBar (0..1 → 네모 칸 막대)
scripts/exportSingleFile.ts   npm run export
```

테스트는 소스 옆 `*.test.ts` (vitest, node 환경; 레이아웃만 jsdom).

## 장면 추가하기

`src/entities/scene/ui/scenes/NN-id.tsx`에 `export const id: SceneSpec = { id, len, text, view, draw? }`를 만들고,
`src/entities/scene/model/scenes.ts`의 배열 원하는 위치에 끼우면 `at`과 `TOTAL`이 자동으로 밀린다. 그 장면에서만 쓰는 클래스는 옆의 `NN-id.css`에 둔다.
효과음은 `sfx: [[lb, 'boom'], ...typeCues('타이핑한 줄', at)]`처럼 장면 안 위치로 적는다. `typeCues`는 `typeOn()`과 같은 시간표로 글자마다 틱을 만든다.

### 박자에 맞추기

`lb` 1 = 1박이다. 장면 길이는 4박(짧으면 2박) 단위라 장면은 마디 첫 박(최소한 반 마디)에서 바뀐다. 장면 안의 사건은 16분음표(0.25) 격자에, 큰 충격은 정박에 둔다. 타이핑은 `typeOn(f, line, at)`으로: 8자 이하는 16분음표, 그보다 긴 줄은 32분음표마다 한 글자(`LONG_LINE`). 반주는 첫 마디(0–4박)가 드럼 없는 인트로, `DROP`(32박) 앞 한 마디가 숨 고르기, `DROP`에서 다시 터진다. zoom의 CLOSE가 그 박에 떨어진다. `scenes.test.ts`가 장면 경계와 효과음이 격자에 있는지 검사한다.
큰 글자는 `<Word>`, 모노 줄은 `<Code>` + `typeOn()`, 크기 맞춤은 `fit()`을 쓴다. 글자 축(wght/wdth)은 style이 아니라 `Word`의 `w`/`d` 또는 `ch()`로 넘긴다.
