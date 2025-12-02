// =============================
//   METADATA
// =============================
const metadata = `
{
    "name": "Info",
    "icon": "fa-solid fa-circle-info",
    "description": "Muestra información general del sistema y lista todos los endpoints detectados.",
    "method": "GET",
    "category": "Información",
    "example": "/api/info",
    "params": []
}
`;

// =============================
//   INFO: LISTA TODOS LOS ARCHIVOS
// =============================
const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
    const apiDir = path.join(__dirname);

    let archivos = [];

    try {
        archivos = fs.readdirSync(apiDir)
            .filter(f => f.endsWith(".js"))
            .map(f => f.replace(".js", ""));
    } catch (e) {
        archivos = [];
    }

    res.json({
        status: true,
        message: "Información general del sistema.",
        creator: "Hady D'xyz",
        total_endpoints: archivos.length,
        endpoints: archivos
    });
};