const axios = require("axios");

/* @metadata {
  "description": "Descarga videos de TikTok con todos los datos disponibles (sin marca de agua)",
  "method": "GET",
  "category": "Descargas",
  "parameters": [
    {"name": "url", "type": "string", "required": true, "example": "https://vt.tiktok.com/ZSyHxu4Vh/"}
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
      message: 'Parámetro "url" requerido. Ejemplo: /api/tiktok?url=https://vt.tiktok.com/xxxxx/'
    });
  }

  try {
    // API real de TikWM
    const response = await axios.post(
      "https://www.tikwm.com/api/",
      new URLSearchParams({ url }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const data = response.data;

    if (data.code !== 0 || !data.data) {
      throw new Error(data.msg || "Error desconocido en respuesta de TikWM");
    }

    const v = data.data;

    // Respuesta limpia y completa para bots
    res.status(200).json({
      success: true,
      status_code: 200,
      creator: "Hady D'xyz",
      madeBy: "DevHades02",
      source: "TikWM (Real-Time API)",
      video: {
        id: v.id,
        title: v.title,
        author: {
          id: v.author?.id,
          username: v.author?.unique_id,
          nickname: v.author?.nickname,
          avatar: v.author?.avatar
        },
        region: v.region,
        duration: v.duration,
        resolution: v.ratio || "unknown",
        views: v.play_count,
        likes: v.digg_count,
        comments: v.comment_count,
        shares: v.share_count,
        favorites: v.collect_count,
        published_time: v.create_time,
        cover: v.cover,
        dynamic_cover: v.ai_dynamic_cover,
        origin_cover: v.origin_cover,
        no_watermark: v.play,
        watermark: v.wmplay,
        music: {
          id: v.music_info?.id,
          title: v.music_info?.title,
          author: v.music_info?.author,
          duration: v.music_info?.duration,
          album: v.music_info?.album,
          cover: v.music_info?.cover,
          url: v.music_info?.play
        },
        stats: {
          size_bytes: v.size,
          play_url_valid: !!v.play,
          music_valid: !!v.music
        }
      },
      meta: {
        processed_time: data.processed_time,
        is_ad: v.is_ad,
        commerce_info: v.commerce_info,
        hashtags: v.anchors_extras || [],
        mention_users: v.mentioned_users || []
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      status_code: 500,
      message: "Error al procesar el enlace de TikTok",
      error: error.message
    });
  }
};