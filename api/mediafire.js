// =============================
//          METADATA
// =============================
const metadata = `
{
    "name": "Mediafire Downloader",
    "icon": "fa-solid fa-download",
    "description": "Descarga archivos de Mediafire con nombre, tamaño, MIME y enlace directo.",
    "method": "GET",
    "category": "Descargas",
    "example": "/api/mediafire?url=https://www.mediafire.com/file/xxxx/archivo.zip/file",
    "params": [
        { "name": "url", "type": "string", "required": true, "example": "https://www.mediafire.com/file/xxxx/archivo.zip/file" }
    ]
}
`;

// =============================
//        MEDIAFIRE API
// =============================
const axios = require("axios");
const cheerio = require("cheerio");
const { lookup } = require("mime-types");

module.exports = async (req, res) => {

    const { url } = req.query;

    if (!url) {
        return res.json({
            success: false,
            status_code: 400,
            creator: "Hady D'xyz",
            message: 'Parámetro requerido: ?url=https://www.mediafire.com/file/xxxx/archivo.zip/file'
        });
    }

    if (!/mediafire\.com\/file\//i.test(url)) {
        return res.json({
            success: false,
            status_code: 400,
            creator: "Hady D'xyz",
            message: "URL inválida. Debes ingresar un enlace de Mediafire válido."
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
            return res.json({
                success: false,
                status_code: 500,
                creator: "Hady D'xyz",
                message: "No se pudo obtener el enlace directo de descarga."
            });
        }

        return res.json({
            success: true,
            status_code: 200,
            creator: "Hady D'xyz",
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
        return res.json({
            success: false,
            status_code: 500,
            creator: "Hady D'xyz",
            message: "Error procesando la solicitud.",
            error: error.message
        });
    }
};