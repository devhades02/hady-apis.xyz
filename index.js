const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(require('cors')());

// ================================
// FUNCIÓN PARA CARGAR ENDPOINTS
// ================================
function loadEndpoints() {
  const endpoints = [];
  const apiDir = path.join(__dirname, 'api');

  if (!fs.existsSync(apiDir)) return endpoints;

  const files = fs.readdirSync(apiDir).filter(f => f.endsWith('.js'));

  files.forEach(file => {
    const endpointName = file.replace('.js', '');
    const endpointPath = `/api/${endpointName}`;

    try {
      const endpointHandler = require(`./api/${file}`);
      app.get(endpointPath, endpointHandler);

      let meta = {
        name: endpointName,
        icon: "fa-solid fa-code",
        description: `Endpoint ${endpointName}`,
        method: "GET",
        category: "General",
        example: null,
        params: []
      };

      try {
        const code = fs.readFileSync(path.join(apiDir, file), "utf8");

        const match = code.match(/const metadata\s*=\s*`([\s\S]*?)`/);
        if (match) {
          const parsed = JSON.parse(match[1]);

          meta = {
            name: parsed.name || meta.name,
            icon: parsed.icon || meta.icon,
            description: parsed.description || meta.description,
            method: parsed.method || meta.method,
            category: parsed.category || meta.category,
            example: parsed.example
              ? `https://hady-apis-xyz.vercel.app${parsed.example}`
              : null,
            params: parsed.params || []
          };
        }
      } catch (e) {
        console.log(`⚠ Metadata inválida en ${file}`);
      }

      endpoints.push({
        file,
        name: meta.name,
        icon: meta.icon,
        method: meta.method,
        description: meta.description,
        category: meta.category,
        path: endpointPath,
        example: meta.example,
        params: meta.params
      });

      console.log(`✅ Endpoint cargado: ${endpointPath}`);

    } catch (error) {
      console.log(`❌ Error cargando ${endpointPath}:`, error.message);
    }
  });

  return endpoints;
}

// Cargar endpoints iniciales
let availableEndpoints = loadEndpoints();

// ================================
// LISTA DE ENDPOINTS
// ================================
app.get('/api/endpoints', (req, res) => {
  availableEndpoints = loadEndpoints();

  res.json({
    status: true,
    creator: "Hady D'xyz",
    madeBy: "DevHades02",
    total: availableEndpoints.length,
    endpoints: availableEndpoints
  });
});

// ================================
// STATUS
// ================================
app.get('/api/status', (req, res) => {
  const now = new Date();

  res.json({
    status: true,
    status_code: 200,
    service: "Hady APIs",
    creator: "Hady D'xyz",
    status_message: "Active",
    server_time: now.toISOString(),
    total_endpoints: availableEndpoints.length,
    endpoints: availableEndpoints.map(e => e.name)
  });
});

// ================================
// RUTA PRINCIPAL
// ================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ================================
// SERVIDOR
// ================================
app.listen(port, () => {
  console.log(`🚀 Hady APIs corriendo en http://localhost:${port}`);
  console.log(`👨‍💻 Creator: Hady D'xyz (DevHades02)`);
});