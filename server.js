// ✅ server.js — Versión compacta sin plugins
// ⚡ Sistema Multi-API por devhades02 (Hady D'xyz)

import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import ytSearch from 'yt-search'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

const CONFIG = {
  nombre: 'Hady APIs',
  version: '3.0',
  autor: 'devhades02 (Hady D\'xyz)',
  descripcion: 'API centralizada de Hady sin plugins (todo en server.js)'
}

// ==================== ENDPOINTS PRINCIPALES ====================

// Estado
app.get('/api/status', (req, res) => {
  res.json({
    ...CONFIG,
    estado: 'online',
    ejemplo: '/api/youtube?q=bad bunny',
    endpoints: ['/api/youtube', '/api/recargar', '/api/status']
  })
})

// Buscar música en YouTube
app.get('/api/youtube', async (req, res) => {
  try {
    const q = req.query.q
    if (!q) return res.status(400).json({ error: 'Falta el parámetro ?q=' })

    const result = await ytSearch(q)
    const videos = result.videos.slice(0, 5).map(v => ({
      title: v.title,
      url: v.url,
      thumbnail: v.thumbnail,
      duration: v.timestamp,
      views: v.views
    }))

    res.json({
      consulta: q,
      resultados: videos.length,
      videos
    })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor', detalle: err.message })
  }
})

// Recargar (solo simulación)
app.post('/api/recargar', (req, res) => {
  res.json({ success: true, mensaje: 'Sistema recargado correctamente 🚀' })
})

// Página base
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ==================== EXPORTAR SERVIDOR ====================
export default app