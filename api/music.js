const yts = require('yt-search');

/* @metadata {
  "description": "Buscar música en YouTube",
  "method": "GET", 
  "category": "Música",
  "parameters": [
    {"name": "query", "type": "string", "required": true, "example": "los puntos del amor "}
  ]
} */

module.exports = async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({
      status: false,
      status_code: 400,
      error: 'Parámetro "query" requerido'
    });
  }

  try {
    const searchResult = await yts(query);
    
    // SIN LÍMITES - Devuelve TODOS los resultados
    const videos = searchResult.videos.map(video => ({
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

    res.json({
      status: true,
      status_code: 200,
      creator: "Hady D'xyz",
      madeBy: "DevHades02",
      query: query,
      totalResults: searchResult.videos.length,
      results: videos
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      status_code: 500,
      error: error.message
    });
  }
};