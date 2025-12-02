// =============================
//   METADATA
// =============================
const metadata = `
{
    "name": "YT Search",
    "icon": "fa-brands fa-youtube",
    "description": "Busca música o videos en YouTube sin límites.",
    "method": "GET",
    "category": "Música",
    "example": "/api/yt-search?query=los puntos del amor",
    "params": [
        {"name": "query", "type": "string", "required": true, "example": "los puntos del amor"}
    ]
}
`;

// =============================
//   YOUTUBE SEARCH
// =============================
const yts = require("yt-search");

module.exports = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.json({
            success: false,
            status_code: 400,
            creator: "Hady D'xyz",
            message: 'Parámetro requerido: ?query=texto'
        });
    }

    try {
        const search = await yts(query);

        const videos = search.videos.map(video => ({
            id: video.videoId,
            title: video.title,
            url: video.url,
            duration: video.duration.timestamp,
            views: video.views,
            thumbnail: video.thumbnail,
            channel: {
                name: video.author.name,
                url: video.author.url
            },
            uploaded: video.ago
        }));

        return res.json({
            success: true,
            status_code: 200,
            creator: "Hady D'xyz",
            query: query,
            total_results: videos.length,
            results: videos
        });

    } catch (error) {
        return res.json({
            success: false,
            status_code: 500,
            creator: "Hady D'xyz",
            message: "Error al buscar en YouTube",
            error: error.message
        });
    }
};