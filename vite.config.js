import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { hasBlobStore, readPromptCollections, writePromptCollections } from './lib/promptStore.js'

// Local development API for prompt persistence.
function promptsApiPlugin() {
  return {
    name: 'prompts-api',
    configureServer(server) {
      server.middlewares.use('/api/prompts', (req, res) => {
        if (req.method === 'GET') {
          readPromptCollections()
            .then(data => {
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({
                settings: data.settings,
                mcps: data.mcps,
                collections: data.collections,
                etag: data.etag,
                storage: data.source === 'blob' ? 'blob' : 'file',
                migrated: Boolean(data.migrated),
                blobConfigured: hasBlobStore(),
              }))
            })
            .catch(err => {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: err.message }))
            })
          return
        }

        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            const data = JSON.parse(body)
            const settings = typeof data?.settings === 'object' && data.settings !== null ? data.settings : null
            const mcps = Array.isArray(data?.mcps) ? data.mcps : null
            const collections = Array.isArray(data?.collections) ? data.collections : null

            if (!settings || !mcps || !collections) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Érvénytelen payload: hiányzó settings, mcps vagy collections.' }))
              return
            }

            const result = await writePromptCollections({ settings, mcps, collections }, {
              etag: data?.etag || null,
              fallbackToFile: true,
            })

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              success: true,
              etag: result.etag,
              storage: result.source,
            }))
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), promptsApiPlugin()],
})
