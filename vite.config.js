import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin to save prompts.json via API
function savePromptsPlugin() {
  return {
    name: 'save-prompts',
    configureServer(server) {
      server.middlewares.use('/api/save-prompts', (req, res) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const filePath = path.resolve(__dirname, 'src/data/prompts.json')
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: true }))
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: err.message }))
            }
          })
        } else {
          res.writeHead(405)
          res.end()
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), savePromptsPlugin()],
})
