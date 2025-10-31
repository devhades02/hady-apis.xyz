import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Configuración para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuración - RUTAS ABSOLUTAS
const pluginsPath = path.join(__dirname, 'plugins');
const dbPath = path.join(__dirname, 'db.json');

const CONFIG = {
  nombre: "Hady APIs",
  version: "3.0",
  autor: "devhades02 (Hady D'xyz)",
  descripcion: "Sistema Multi-API Auto-Detectable"
};

// ==================== SISTEMA AUTO-DETECTABLE ====================

function inicializarSistema() {
  console.log(`📁 Ruta plugins: ${pluginsPath}`);
  console.log(`📄 Ruta DB: ${dbPath}`);
  
  // Crear DB si no existe
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
    console.log('✅ DB inicializada');
  }

  // Crear directorio plugins si no existe
  if (!fs.existsSync(pluginsPath)) {
    fs.mkdirSync(pluginsPath, { recursive: true });
    console.log('📁 Directorio plugins creado');
  }
}

async function escanearYRegistrarPlugins() {
  let pluginsEncontrados = 0;
  
  try {
    // Leer DB actual
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Verificar si existe la carpeta plugins
    if (!fs.existsSync(pluginsPath)) {
      console.log('❌ No existe la carpeta plugins');
      return;
    }
    
    // Buscar todos los archivos .js en plugins
    const archivos = fs.readdirSync(pluginsPath)
      .filter(file => file.endsWith('.js') && !file.startsWith('_'));

    console.log(`\n🔍 Encontrados ${archivos.length} archivos en plugins...`);

    for (const archivo of archivos) {
      try {
        const pluginPath = path.join(pluginsPath, archivo);
        console.log(`📂 Intentando cargar: ${archivo}`);
        
        // Verificar si el archivo existe
        if (!fs.existsSync(pluginPath)) {
          console.log(`❌ No existe: ${pluginPath}`);
          continue;
        }
        
        // Importar el plugin (ES Modules)
        const pluginModule = await import(pluginPath + '?update=' + Date.now());
        const plugin = pluginModule.default;
        
        console.log(`✅ Cargado: ${archivo}`);
        
        // Validar que sea un plugin válido
        if (plugin.name && plugin.route && plugin.run && plugin.category) {
          console.log(`🔧 Plugin válido: ${plugin.name}`);
          
          // REGISTRAR en Express (si no está ya registrado)
          let rutaRegistrada = false;
          app._router.stack.forEach(layer => {
            if (layer.route && layer.route.path === plugin.route) {
              rutaRegistrada = true;
            }
          });
          
          if (!rutaRegistrada) {
            app.get(plugin.route, plugin.run);
            console.log(`✅ RUTA REGISTRADA: ${plugin.name} -> ${plugin.route}`);
          }
          
          // BUSCAR O CREAR CATEGORÍA
          let categoria = db.categorias.find(cat => cat.id === plugin.category);
          if (!categoria) {
            categoria = {
              id: plugin.category,
              nombre: plugin.category.charAt(0).toUpperCase() + plugin.category.slice(1),
              descripcion: `APIs de ${plugin.category}`,
              icono: obtenerIcono(plugin.category),
              color: obtenerColor(plugin.category),
              apis: []
            };
            db.categorias.push(categoria);
            console.log(`📂 NUEVA CATEGORÍA: ${plugin.category}`);
          }
          
          // VERIFICAR si el plugin ya existe en la categoría
          const pluginId = plugin.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const pluginExistente = categoria.apis.find(api => api.id === pluginId);
          
          if (!pluginExistente) {
            // AGREGAR NUEVO PLUGIN A LA CATEGORÍA
            categoria.apis.push({
              id: pluginId,
              nombre: plugin.name,
              descripcion: plugin.description || 'Sin descripción disponible',
              endpoint: plugin.route,
              metodo: plugin.method || "GET",
              ejemplo: `${plugin.route}?q=ejemplo`,
              autor: plugin.author || "devhades02",
              version: plugin.version || "1.0.0",
              activo: true,
              timestamp: new Date().toISOString()
            });
            
            pluginsEncontrados++;
            console.log(`🆕 NUEVO PLUGIN: ${plugin.name} en ${plugin.category}`);
          } else {
            console.log(`🔁 PLUGIN EXISTENTE: ${plugin.name}`);
          }
        } else {
          console.log(`❌ Plugin inválido: ${archivo}`);
        }
      } catch (error) {
        console.log(`❌ ERROR cargando ${archivo}:`, error.message);
      }
    }

    // Actualizar metadata
    db.metadata = {
      ultimaActualizacion: new Date().toISOString(),
      totalAPIs: db.categorias.reduce((total, cat) => total + cat.apis.length, 0),
      categoriasActivas: db.categorias.filter(cat => cat.apis.length > 0).length,
      totalPlugins: pluginsEncontrados
    };

    // Guardar DB actualizada
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`   Plugins nuevos: ${pluginsEncontrados}`);
    console.log(`   Total APIs: ${db.metadata.totalAPIs}`);
    console.log(`   Categorías: ${db.metadata.categoriasActivas}`);
    console.log(`   DB actualizada: ${db.metadata.ultimaActualizacion}`);

  } catch (error) {
    console.log('❌ Error en sistema de plugins:', error.message);
  }
}

function obtenerIcono(categoria) {
  const iconos = {
    'ia': 'fas fa-robot',
    'multimedia': 'fas fa-play-circle', 
    'utilidades': 'fas fa-tools',
    'internet': 'fas fa-globe',
    'seguridad': 'fas fa-shield-alt',
    'entretenimiento': 'fas fa-gamepad',
    'default': 'fas fa-cube'
  };
  return iconos[categoria] || iconos.default;
}

function obtenerColor(categoria) {
  const colores = {
    'ia': '#10B981',
    'multimedia': '#FF0000',
    'utilidades': '#3B82F6',
    'internet': '#8B5CF6',
    'seguridad': '#EF4444',
    'entretenimiento': '#F59E0B',
    'default': '#6B7280'
  };
  return colores[categoria] || colores.default;
}

// ==================== ENDPOINTS ====================

app.get('/api/status', (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    res.json({
      ...db.sistema,
      estado: 'online',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
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

app.get('/api/db', (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    res.json(db);
  } catch (error) {
    res.status(500).json({ error: 'Error cargando DB' });
  }
});

// 🔄 RECARGAR PLUGINS
app.post('/api/recargar', async (req, res) => {
  try {
    await escanearYRegistrarPlugins();
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== INICIALIZACIÓN ====================

inicializarSistema();

// Iniciar después de un breve delay
setTimeout(async () => {
  await escanearYRegistrarPlugins();
  
  app.listen(PORT, () => {
    console.log('\n🌈 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀  Hady APIs - Sistema Auto-Detectable`);
    console.log(`👨‍💻  Por: ${CONFIG.autor}`);
    console.log(`🌐  URL: http://localhost:${PORT}`);
    console.log(`📊  Panel: http://localhost:${PORT}/`);
    console.log(`🔄  Recargar plugins: POST http://localhost:${PORT}/api/recargar`);
    console.log('🌈 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
}, 100);

// Escanear automáticamente cada 10 segundos
setInterval(escanearYRegistrarPlugins, 10000);