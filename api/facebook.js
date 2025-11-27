const axios = require("axios");
const cheerio = require("cheerio");

/* @metadata {
  "description": "Descarga videos de Facebook en varias calidades usando FDownloader.",
  "method": "GET",
  "category": "Descargas",
  "parameters": [
    {"name": "url", "type": "string", "required": true, "example": "https://www.facebook.com/share/v/1FJeGXq7z5/"}
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
      message: 'Parámetro "url" requerido. Ejemplo: /api/facebook?url=https://www.facebook.com/share/v/xxxx'
    });
  }

  if (!/facebook\.\w+\/(reel|watch|share)/gi.test(url)) {
    return res.status(400).json({
      success: false,
      status_code: 400,
      message: "URL inválida. Asegúrate de ingresar una URL de video de Facebook válida."
    });
  }

  try {
    const response = await axios.get("https://fdownloader.net/id", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
      }
    });

    const html = response.data;
    const exMatch = html.match(/k_exp\s*=\s*"(\d+)"/i);
    const toMatch = html.match(/k_token\s*=\s*"([a-f0-9]+)"/i);
    const ex = exMatch ? exMatch[1] : null;
    const to = toMatch ? toMatch[1] : null;

    if (!ex || !to) {
      return res.status(500).json({
        success: false,
        status_code: 500,
        message: "No se pudo obtener el token de sesión de FDownloader."
      });
    }

    const searchResponse = await axios.post(
      "https://v3.fdownloader.net/api/ajaxSearch?lang=id",
      new URLSearchParams({
        k_exp: ex,
        k_token: to,
        q: url,
        lang: "id",
        web: "fdownloader.net",
        v: "v2",
        w: ""
      }),
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
          Origin: "https://fdownloader.net"
        }
      }
    );

    const data = searchResponse.data;
    if (data.status !== "ok") {
      return res.status(500).json({
        success: false,
        status_code: 500,
        message: "Error al buscar el video en FDownloader."
      });
    }

    const $ = cheerio.load(data.data);
    const title = $(".thumbnail > .content > .clearfix > h3").text().trim();
    const duration = $(".thumbnail > .content > .clearfix > p").text().trim();
    const thumbnail = $(".thumbnail > .image-fb > img").attr("src") || "";
    const media = $("#popup_play > .popup-body > .popup-content > #vid").attr("src") || "";
    const music = $("#fbdownloader").find("#audioUrl").attr("value") || "";

    const videos = [];
    $("#fbdownloader")
      .find(".tab__content")
      .eq(0)
      .find("tr")
      .each((_, el) => {
        const quality = $(el).find(".video-quality").text().trim();
        const vurl =
          $(el).find("a").attr("href") ||
          $(el).find("button").attr("data-videourl") ||
          null;

        if (vurl && vurl !== "#note_convert") {
          videos.push({ quality, url: vurl });
        }
      });

    res.status(200).json({
      success: true,
      status_code: 200,
      creator: "Hady D'xyz",
      madeBy: "DevHades02",
      video: {
        url,
        title,
        duration,
        thumbnail
      },
      download: {
        media,
        music,
        videos
      },
      meta: {
        processed_time: Date.now()
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      status_code: 500,
      message: "Error procesando la petición.",
      error: err.message
    });
  }
};