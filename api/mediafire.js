const axios = require("axios");
const cheerio = require("cheerio");
const { lookup } = require("mime-types");

/* @metadata {
  "description": "Descarga archivos de Mediafire con detalles como nombre, tamaño, tipo MIME y enlace directo.",
  "method": "GET",
  "category": "Descargas",
  "parameters": [
    {"name": "url", "type": "string", "required": true, "example": "https://www.mediafire.com/file/xxxx/archivo.zip/file"}
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
      message: 'Parámetro "url" requerido. Ejemplo: /api/mediafire?url=https://www.mediafire.com/file/xxxx/archivo.zip/file'
    });
  }

  if (!/mediafire\.com\/file\//i.test(url)) {
    return res.status(400).json({
      success: false,
      status_code: 400,
      message: "URL inválida. Asegúrate de ingresar un enlace de Mediafire válido."
    });
  }

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const fileName = $(".dl-btn-label").attr("title") || "Desconocido";
    const fileSize = $('.details li:contains("File size") span').text().trim() || "Desconocido";
    const extension = fileName.split(".").pop();
    const mimeType = lookup(extension.toLowerCase()) || "application/octet-stream";
    const uploadDate = $('.details li:contains("Uploaded") span').text().trim() || "Desconocido";
    const downloadUrl = $(".download_link a.input").attr("href");

    if (!downloadUrl) {
      return res.status(500).json({
        success: false,
        status_code: 500,
        message: "No se pudo obtener el enlace de descarga de Mediafire."
      });
    }

    res.status(200).json({
      success: true,
      status_code: 200,
      creator: "Hady D'xyz",
      madeBy: "DevHades02",
      file: {
        name: fileName,
        size: fileSize,
        mime: mimeType,
        uploaded: uploadDate,
        download: downloadUrl
      },
      meta: {
        processed_time: Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status_code: 500,
      message: "Error procesando la solicitud.",
      error: error.message
    });
  }
};