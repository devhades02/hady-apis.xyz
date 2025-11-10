const fs = require("fs");
const path = require("path");

/* @metadata {
  "description": "Información general de las APIs de Hady D'xyz",
  "method": "GET",
  "category": "Información"
} */

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  try {
    const apiDir = path.join(__dirname); // carpeta /api/
    const files = fs.readdirSync(apiDir).filter(f => f.endsWith(".js"));

    const endpoints = files.map(file => {
      const content = fs.readFileSync(path.join(apiDir, file), "utf-8");

      // Buscar bloque de metadatos
      const metaMatch = content.match(/@metadata\s*{([\s\S]*?)}/);
      let meta = {};

      if (metaMatch) {
        try {
          meta = JSON.parse(`{${metaMatch[1]}}`);
        } catch (e) {
          meta = {};
        }
      }

      return {
        file,
        description: meta.description || "Sin descripción",
        method: meta.method || "GET",
        path: `/api/${file.replace(".js", "")}`
      };
    });

    res.status(200).json({
      success: true,
      creator: "Hady D'xyz",
      madeBy: "DevHades02",
      project: "Hady APIs",
      github: "https://github.com/devhades02",
      website: "https://hady-apis-xyz.vercel.app/",
      total_endpoints: endpoints.length,
      endpoints
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};