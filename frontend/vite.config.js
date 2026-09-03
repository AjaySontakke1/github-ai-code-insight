import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-fallback-generator',
      closeBundle() {
        const distDir = path.resolve('dist')
        const indexHtml = path.join(distDir, 'index.html')
        if (fs.existsSync(indexHtml)) {
          const content = fs.readFileSync(indexHtml, 'utf-8')

          // 1. Generate 404.html (Render static sites automatically fallback to 404.html)
          fs.writeFileSync(path.join(distDir, '404.html'), content)

          // 2. Generate analysis.html (Render static sites automatically map /analysis to analysis.html)
          fs.writeFileSync(path.join(distDir, 'analysis.html'), content)

          // 3. Generate analysis/index.html (Render static sites map /analysis/ to analysis/index.html)
          const analysisDir = path.join(distDir, 'analysis')
          if (!fs.existsSync(analysisDir)) {
            fs.mkdirSync(analysisDir, { recursive: true })
          }
          fs.writeFileSync(path.join(analysisDir, 'index.html'), content)
        }
      }
    }
  ],
  server: {
    port: 5173,
  }
})
