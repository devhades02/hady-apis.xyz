const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

/* @metadata {
  "description": "Descarga audio de YouTube en formato MP3 y devuelve info para bots",
  "method": "GET",
  "category": "Descargas",
  "parameters": [
    {"name": "url", "type": "string", "required": true, "example": "https://youtu.be/76zzapFpgJM"}
  ]
} */

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      status_code: 400,
      message: 'Parámetro "url" requerido. Ejemplo: /api/ytmp3?url=https://youtu.be/xxxx'
    });
  }

  try {
    const tempFile = path.join("/tmp", `yt-${Date.now()}.mp3`);
    const command = `yt-dlp -x --audio-format mp3 --output "${tempFile}" "${url}"`;

    exec(command, (error, stdout, stderr) => {
      if (error || !fs.existsSync(tempFile)) {
        return res.status(500).json({
          success: false,
          status_code: 500,
          message: "Error descargando o convirtiendo el audio",
          error: stderr || error?.message
        });
      }

      const stats = fs.statSync(tempFile);

      res.status(200).json({
        success: true,
        status_code: 200,
        creator: "Hady D'xyz",
        madeBy: "DevHades02",
        source: "yt-dlp (Real-Time)",
        video: {
          url,
          filename: path.basename(tempFile),
          format: "mp3",
          size_bytes: stats.size
        },
        meta: {
          processed_time: Date.now()
        }
      });

      // Limpiar temporal
      fs.unlinkSync(tempFile);
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      status_code: 500,
      message: "Error procesando la petición",
      error: err.message
    });
  }
};