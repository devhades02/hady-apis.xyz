const axios = require("axios");
const qs = require("qs");

/* @metadata {
  "description": "Convierte videos de YouTube a MP3 usando la API interna de SSVID",
  "method": "GET",
  "category": "Descargas",
  "parameters": [
    {"name": "url", "type": "string", "required": true, "example": "https://youtu.be/abc123"}
  ]
} */

const headers = {
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  "Origin": "https://ssvid.net",
  "Referer": "https://ssvid.net/",
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
  "X-Requested-With": "XMLHttpRequest",
};

async function searchVideo(url) {
  const { data } = await axios.post(
    "https://ssvid.net/api/ajax/search",
    qs.stringify({ query: url, vt: "home" }),
    { headers, timeout: 15000 }
  );
  return data;
}

async function convertMP3(vid, key) {
  const { data } = await axios.post(
    "https://ssvid.net/api/ajax/convert",
    qs.stringify({ vid, k: key }),
    { headers, timeout: 20000 }
  );
  return data;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      status_code: 400,
      message:
        'Parámetro "url" requerido. Ejemplo: /api/ytmp3?url=https://youtu.be/xxxxx'
    });
  }

  try {
    // 1) Buscar el video
    const info = await searchVideo(url);

    if (!info || !info.vid) {
      throw new Error("No se pudo obtener información del video.");
    }

    // Key MP3 válida
    const key = info?.links?.mp3?.mp3128?.k;
    if (!key) {
      throw new Error("No hay key MP3 disponible para este video.");
    }

    // 2) Convertir con reintento
    let result;
    for (let i = 0; i < 2; i++) {
      try {
        result = await convertMP3(info.vid, key);
        if (result?.status === "success" || result?.download) break;
      } catch (e) {
        if (i === 1) throw e;
      }
    }

    if (!result?.download) {
      throw new Error("La conversión MP3 no devolvió un enlace válido.");
    }

    return res.status(200).json({
      success: true,
      status_code: 200,
      creator: "Hady D'xyz",
      madeBy: "DevHades02",
      type: "ytmp3",
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      download_url: result.download
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      status_code: 500,
      message: "Error al convertir el video a MP3",
      error: err.message
    });
  }
};