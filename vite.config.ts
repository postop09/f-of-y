import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const alias = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/app': alias('./src/app'),
      '@/pages': alias('./src/pages'),
      '@/widgets': alias('./src/widgets'),
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
