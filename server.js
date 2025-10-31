import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// ========== CONFIGURACIÓN ==========
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pluginsPath = path.join(__dirname, 'plugins');
const dbPath = path.join(__dirname, 'db.json');

const CONFIG = {
  nombre: 'Hady APIs',
  version: '3.0',
  autor: "devhades02 (Hady D'xyz)",
  descripcion: 'Sistema Multi-API Auto-Detectable'
};

// ========== SISTEMA DE INICIALIZACIÓN ==========
function inicializarSistema() {
  if (!fs.existsSync(dbPath)) {
    const dbBase = {
      sistema: CONFIG,
      categorias: [],
      metadata: {
        ultimaActualizacion: new Date().toISOString(),
        totalAPIs: 0,
        categoriasActivas: 0
      }
    };
    fs.writeFileSync(dbPath, JSON.stringify(dbBase, null, 2));
  }

  if (!fs.existsSync(pluginsPath)) {
    fs.mkdirSync(pluginsPath, { recursive: true });
  }
}

async function escanearYRegistrarPlugins() {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const archivos = fs.existsSync(pluginsPath)
    ? fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js'))
    : [];

  for (const archivo of archivos) {
    try {
      const pluginPath = path.join(pluginsPath, archivo);
      const pluginModule = await import(pluginPath + '?update=' + Date.now());
      const plugin = pluginModule.default;

      if (plugin.name && plugin.route && plugin.run && plugin.category) {
        app.get(plugin.route, plugin.run);

        let categoria = db.categorias.find(c => c.id === plugin.category);
        if (!categoria) {
          categoria = {
            id: plugin.category,
            nombre: plugin.category.charAt(0).toUpperCase() + plugin.category.slice(1),
            descripcion: `APIs de ${plugin.category}`,
            apis: []
          };
          db.categorias.push(categoria);
        }

        const pluginId = plugin.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (!categoria.apis.some(a => a.id === pluginId)) {
          categoria.apis.push({
            id: pluginId,
            nombre: plugin.name,
            descripcion: plugin.description || 'Sin descripción disponible',
            endpoint: plugin.route,
            metodo: plugin.method || 'GET',
            ejemplo: `${plugin.route}?q=ejemplo`,
            autor: plugin.author || 'devhades02',
            version: plugin.version || '1.0.0'
          });
        }
      }
    } catch (err) {
      console.log(`❌ Error cargando ${archivo}:`, err.message);
    }
  }

  db.metadata = {
    ultimaActualizacion: new Date().toISOString(),
    totalAPIs: db.categorias.reduce((sum, c) => sum + c.apis.length, 0),
    categoriasActivas: db.categorias.length
  };

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  return db;
}

// ========== ENDPOINTS ==========
app.get('/api/status', (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    res.json({
      ...db.sistema,
      estado: 'online',
      timestamp: new Date().toISOString(),
      metadata: db.metadata
    });
  } catch (error) {
    res.status(500).json({ error: 'Error cargando estado' });
  }
});

app.get('/api/categorias', (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    res.json(db.categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error cargando categorías' });
  }
});

app.post('/api/recargar', async (req, res) => {
  try {
    const db = await escanearYRegistrarPlugins();
    res.json({
      success: true,
      mensaje: 'Sistema recargado exitosamente',
      plugins_encontrados: db.metadata.totalAPIs,
      categorias: db.metadata.categoriasActivas,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/db', (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    res.json(db);
  } catch (error) {
    res.status(500).json({ error: 'Error cargando DB' });
  }
});

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializar sistema antes de exportar
inicializarSistema();
await escanearYRegistrarPlugins();

// ✅ EXPORTAR PARA VERCEL
export default app;