// =============================
//   METADATA
// =============================
const metadata = `
{
    "name": "TikTok Downloader",
    "icon": "fa-brands fa-tiktok",
    "description": "Descarga videos de TikTok sin marca de agua.",
    "method": "GET",
    "category": "Descargas",
    "example": "/api/tiktok?url=https://vt.tiktok.com/xxxxx/",
    "params": [
        { "name": "url", "type": "string", "required": true, "example": "https://vt.tiktok.com/xxxxx/" }
    ]
}
`;

// =============================
//   TIKTOK API
// =============================
const axios = require("axios");

module.exports = async (req, res) => {

    const { url } = req.query;

    // Validación obligatoria (tu estilo)
    if (!url) {
        return res.json({
            success: false,
            status_code: 400,
            creator: "Hady D'xyz",
            message: 'Parámetro requerido: ?url=https://vt.tiktok.com/xxxxx/'
        });
    }

    try {

        const response = await axios.post(
            "https://www.tikwm.com/api/",
            new URLSearchParams({ url }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const data = response.data;

        if (data.code !== 0 || !data.data) {
            return res.json({
                success: false,
                status_code: 500,
                creator: "Hady D'xyz",
                message: "No se pudo obtener información del video."
            });
        }

        const v = data.data;

        // =============================
        //   RESPUESTA FORMATO Hady APIs
        // =============================
        return res.json({
            success: true,
            status_code: 200,
            creator: "Hady D'xyz",
            id: v.id,
            title: v.title,
            author: {
                username: v.author?.unique_id,
                nickname: v.author?.nickname,
                avatar: v.author?.avatar
            },
            cover: v.cover,
            duration: v.duration,
            no_watermark: v.play,
            watermark: v.wmplay,
            music: {
                title: v.music_info?.title,
                author: v.music_info?.author,
                url: v.music_info?.play
            }
        });

    } catch (error) {

        return res.json({
            success: false,
            status_code: 500,
            creator: "Hady D'xyz",
            message: "Error al procesar el enlace de TikTok",
            error: error.message
        });
    }
};