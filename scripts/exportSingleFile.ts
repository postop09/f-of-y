// `npm run export`: F(Y) as one self-contained HTML file.
//
// Builds the app into a temp folder, then inlines its script, stylesheet and
// favicon into the page, so export/f-of-y.html opens straight from disk
// (double-click, no server). Fonts still come from Google Fonts.
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = join(ROOT, 'export', 'f-of-y.html')
const tmp = mkdtempSync(join(tmpdir(), 'f-of-y-'))

try {
  await build({
    configFile: join(ROOT, 'vite.config.ts'),
    root: ROOT,
    logLevel: 'warn',
    build: {
      outDir: tmp,
      emptyOutDir: true,
      cssCodeSplit: false,
      modulePreload: false,
      assetsInlineLimit: Infinity,
    },
  })

  const assets = join(tmp, 'assets')
  const file = (ext: string) =>
    readdirSync(assets)
      .filter((f) => f.endsWith(ext))
      .map((f) => readFileSync(join(assets, f), 'utf8'))
  const js = file('.js').join('\n').replace(/<\/script/gi, '<\\/script')
  const css = file('.css').join('\n')
  const icon = `data:image/svg+xml,${encodeURIComponent(readFileSync(join(ROOT, 'public', 'favicon.svg'), 'utf8').trim())}`

  let html = readFileSync(join(tmp, 'index.html'), 'utf8')
  html = html
    .replace(/\s*<script type="module"[^>]*src="[^"]+"><\/script>/g, '')
    .replace(/\s*<link rel="stylesheet"[^>]*href="\/assets\/[^"]+"\s*\/?>/g, '')
    .replace(/<link rel="icon"[^>]*>/, () => `<link rel="icon" href="${icon}" />`)
    .replace('</head>', () => `  <style>\n${css}\n  </style>\n</head>`)
    .replace('</body>', () => `  <script type="module">\n${js}\n  </script>\n</body>`)

  mkdirSync(join(ROOT, 'export'), { recursive: true })
  writeFileSync(OUT, html)
  console.log(`wrote ${OUT} (${(html.length / 1024).toFixed(0)} KB)`)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
