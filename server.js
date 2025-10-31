// ✅ server.js - Compatible con Vercel (sin escritura de archivos)
// ⚡ Sistema Multi-API Auto-Detectable por devhades02 (Hady D'xyz)

import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import fs from 'fs'

// ==================== CONFIGURACIÓN ====================

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

const CONFIG = {
  nombre: 'Hady APIs',
  version: '3.0',
  autor: 'devhades02 (Hady D\'xyz)',
  descripcion: 'Sistema Multi-API Auto-Detectable compatible con Vercel'
}

const pluginsPath = path.join(__dirname, 'plugins')

// ==================== FUNCIÓN PARA CARGAR PLUGINS ====================

async function cargarPlugins() {
  const plugins = []
  try {
    const archivos = fs
      .readdirSync(pluginsPath)
      .filter(f => f.endsWith('.js') && !f.startsWith('_'))

    for (const archivo of archivos) {
      const pluginPath = path.join(pluginsPath, archivo)
      try {
        const pluginModule = await import(pluginPath + '?t=' + Date.now())
        const plugin = pluginModule.default

        if (plugin?.name && plugin?.route && plugin?.run) {
          app.get(plugin.route, plugin.run)
          plugins.push({
            name: plugin.name,
            route: plugin.route,
            category: plugin.category || 'general',
            description: plugin.description || 'Sin descripción',
            method: plugin.method || 'GET',
            author: plugin.author || CONFIG.autor
          })
          console.log(`✅ Plugin cargado: ${plugin.name}`)
        } else {
          console.log(`⚠️ Plugin inválido: ${archivo}`)
        }
      } catch (err) {
        console.log(`❌ Error en plugin ${archivo}:`, err.message)
      }
    }
  } catch (err) {
    console.log('❌ Error leyendo carpeta plugins:', err.message)
  }
  return plugins
}

// ==================== ENDPOINTS ====================

let cache = { plugins: [], lastUpdate: null }

app.get('/api/status', (req, res) => {
  res.json({
    ...CONFIG,
    estado: 'online',
    total_plugins: cache.plugins.length,
    ultima_actualizacion: cache.lastUpdate,
    ejemplo: '/api/youtube?q=musica'
  })
})

app.post('/api/recargar', async (req, res) => {
  cache.plugins = await cargarPlugins()
  cache.lastUpdate = new Date().toISOString()
  res.json({
    success: true,
    mensaje: 'Plugins recargados correctamente',
    total: cache.plugins.length
  })
})

app.get('/api/categorias', (req, res) => {
  const categorias = {}
  for (const p of cache.plugins) {
    if (!categorias[p.category]) categorias[p.category] = []
    categorias[p.category].push(p)
  }
  res.json(categorias)
})

// Página base
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ==================== INICIALIZAR ====================

const init = async () => {
  cache.plugins = await cargarPlugins()
  cache.lastUpdate = new Date().toISOString()
  console.log('🚀 Sistema inicializado con', cache.plugins.length, 'plugins')
}
await init()

// Exportar el servidor para Vercel
export default app