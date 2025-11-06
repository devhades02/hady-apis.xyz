const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(require('cors')());

// Función para cargar endpoints automáticamente
function loadEndpoints() {
  const endpoints = [];
  const apiDir = path.join(__dirname, 'api');
  
  if (fs.existsSync(apiDir)) {
    const files = fs.readdirSync(apiDir);
    
    files.forEach(file => {
      if (file.endsWith('.js')) {
        const endpointName = file.replace('.js', '');
        const endpointPath = `/api/${endpointName}`;
        
        try {
          // Cargar el endpoint
          const endpointHandler = require(`./api/${file}`);
          app.get(endpointPath, endpointHandler);
          
          // Obtener metadata del endpoint
          let description = `Endpoint ${endpointName}`;
          let method = "GET";
          let parameters = [];
          
          // Intentar obtener metadata del archivo
          try {
            const endpointCode = fs.readFileSync(path.join(apiDir, file), 'utf8');
            const metaMatch = endpointCode.match(/\/\*\s*@metadata\s*({[\s\S]*?})\s*\*\//);
            if (metaMatch) {
              const metadata = JSON.parse(metaMatch[1]);
              description = metadata.description || description;
              method = metadata.method || method;
              parameters = metadata.parameters || parameters;
            }
          } catch (e) {}
          
          endpoints.push({
            name: endpointName,
            method: method,
            description: description,
            path: endpointPath,
            parameters: parameters
          });
          
          console.log(`✅ Endpoint cargado: ${endpointPath}`);
        } catch (error) {
          console.log(`❌ Error cargando ${endpointPath}:`, error.message);
        }
      }
    });
  }
  
  return endpoints;
}

// Cargar endpoints al iniciar
let availableEndpoints = loadEndpoints();

// Endpoint dinámico para lista de APIs
app.get('/api/endpoints', (req, res) => {
  // Recargar endpoints en cada solicitud para detectar cambios
  availableEndpoints = loadEndpoints();
  
  res.json({
    status: true,
    creator: "Hady D'xyz",
    madeBy: "DevHades02",
    total: availableEndpoints.length,
    endpoints: availableEndpoints
  });
});

// Endpoint de status
app.get('/api/status', (req, res) => {
  const now = new Date();
  res.json({
    status: true,
    status_code: 200,
    service: "Hady APIs",
    creator: "Hady D'xyz", 
    developer: "DevHades02",
    country: "Perú",
    status_message: "Active",
    server_time: now.toISOString(),
    local_time: now.toLocaleString("es-PE", { timeZone: "America/Lima" }),
    total_endpoints: availableEndpoints.length,
    endpoints: availableEndpoints.map(e => e.name)
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Hady APIs running on http://localhost:${port}`);
  console.log(`👨‍💻 Creator: Hady D'xyz (DevHades02) - Perú`);
  console.log(`📊 Endpoints cargados: ${availableEndpoints.length}`);
  console.log(`🌍 País: Perú (America/Lima)`);
});