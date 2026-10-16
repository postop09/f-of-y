import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'

const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']

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
      // 슬라이스 단위 요소. 같은 레이어라도 다른 슬라이스는 import 금지, 같은 슬라이스 내부는 허용.
      'boundaries/elements': layers.map((l) => ({ type: l, pattern: `src/${l}/*`, capture: ['slice'] })),
      'boundaries/include': ['src/**/*.*'],
      'import/resolver': { typescript: { project: './tsconfig.app.json' } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // FSD: 상위 레이어만 하위 레이어를 import 할 수 있다. (app → pages → widgets → features → entities → shared)
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            { from: { element: { type: 'app' } }, allow: [{ to: { element: { type: layers } } }] },
            ...['pages', 'widgets', 'features', 'entities'].map((layer, i) => ({
              from: { element: { type: layer } },
              allow: [
                { to: { element: { type: layer, captured: { slice: '{{from.captured.slice}}' } } } },
                { to: { element: { type: layers.slice(i + 2) } } },
              ],
            })),
            { from: { element: { type: 'shared' } }, allow: [{ to: { element: { type: 'shared' } } }] },
          ],
        },
      ],
    },
  },
)
