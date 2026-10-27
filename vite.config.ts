import { defineConfig } from 'vitest/config'
import { type Plugin, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const alias = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// `npm run dev`: serve the Vercel function api/explore.ts at the same path, with TYPESAFE_API_KEY from .env.local
const apiDev = (): Plugin => ({
  name: 'f-of-y:api',
  apply: 'serve',
  configureServer(server) {
    const env = loadEnv(server.config.mode, server.config.root, '')
    if (env.TYPESAFE_API_KEY && !process.env.TYPESAFE_API_KEY) process.env.TYPESAFE_API_KEY = env.TYPESAFE_API_KEY
    server.middlewares.use('/api/explore', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.end()
        return
      }
      const { POST } = (await server.ssrLoadModule('/api/explore.ts')) as typeof import('./api/explore')
      const chunks: Buffer[] = []
      for await (const c of req) chunks.push(c as Buffer)
      const out = await POST(new Request('http://localhost/api/explore', { method: 'POST', headers: { 'content-type': 'application/json' }, body: Buffer.concat(chunks) }))
      res.statusCode = out.status
      out.headers.forEach((v, k) => res.setHeader(k, v))
      res.end(await out.text())
    })
  },
})

export default defineConfig({
  plugins: [react(), apiDev()],
  resolve: {
    alias: {
      '@/app': alias('./src/app'),
      '@/pages': alias('./src/pages'),
      '@/features': alias('./src/features'),
      '@/entities': alias('./src/entities'),
      '@/shared': alias('./src/shared'),
      '@': alias('./src'),
    },
  },
  server: { port: 5173 },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
})
