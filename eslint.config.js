import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'

// FSD 레이어, 위에서 아래로만 import. (widgets 는 쓰지 않는다: 영상 스테이지는 pages/film 안)
const layers = ['app', 'pages', 'features', 'entities', 'shared']
const sliced = ['pages', 'features', 'entities'] // sliced[i] === layers[i + 1]

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'public', 'export'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2023, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh, boundaries },
    settings: {
      // 요소(element) 단위.
      //  app:                     폴더 전체가 요소 하나 (routes/entrypoint/styles 는 세그먼트, 서로 자유롭게 import)
      //  pages/features/entities: 슬라이스 하나 = 요소 하나
      //  shared:                  세그먼트(ui/lib/config) 하나 = 요소 하나
      // 같은 요소 안의 import 는 검사하지 않는다 (dependencies 의 checkInternals 기본 false).
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        ...sliced.map((l) => ({ type: l, pattern: `src/${l}/*`, capture: ['slice'] })),
        { type: 'shared', pattern: 'src/shared/*', capture: ['segment'] },
      ],
      'boundaries/include': ['src/**/*.*'],
      'boundaries/ignore': ['src/vite-env.d.ts'],
      'import/resolver': { typescript: { project: './tsconfig.app.json' } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // 정책은 순서대로 평가되고 마지막에 맞은 것이 이긴다. 한 정책 안에선 disallow 가 allow 보다 먼저.
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            // 1. 레이어 방향: app → 전부, pages → features/entities/shared, features → entities/shared, entities → shared, shared → shared
            { from: { element: { type: 'app' } }, allow: { to: { element: { type: layers } } } },
            ...sliced.map((layer, i) => ({
              from: { element: { type: layer } },
              allow: { to: { element: { type: layers.slice(i + 2) } } },
            })),
            { from: { element: { type: 'shared' } }, allow: { to: { element: { type: 'shared' } } } },
            // 2. 공개 API: 다른 요소로 들어가는 import 는 그 요소의 index.ts 뿐 (타입·css 도). 마지막이라 1번을 덮어쓴다.
            //    같은 요소 안은 internal 이라 애초에 평가되지 않는다 → 슬라이스 안의 상대 경로 import 는 그대로.
            {
              to: { element: { type: [...sliced, 'shared'] } },
              disallow: { to: { element: { fileInternalPath: '!index.ts' } } },
              message: '{{to.element.type}}/{{to.element.captured.slice}}{{to.element.captured.segment}} 는 index.ts(공개 API)로만 import 한다',
            },
          ],
        },
      ],
      // 어느 요소에도 속하지 않는 파일(src/ 바로 아래의 떠돌이 파일) 금지. vite-env.d.ts 는 ignore.
      'boundaries/no-unknown-files': 'error',
    },
  },
  {
    // 배럴(index.ts)은 컴포넌트와 상수를 같이 재수출한다. Fast Refresh 경계는 컴포넌트 파일 쪽이다.
    files: ['src/**/index.ts'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // api/ 는 boundaries 밖(include 가 src/**). src 에서는 entities/resume 의 서버 진입점만 (Node ESM 이라 .js).
    files: ['api/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ regex: '^\\.\\./src/(?!entities/resume/index\\.server\\.js$)', message: 'api/ 는 ../src/entities/resume/index.server.js 만 import 한다' }] },
      ],
    },
  },
)
