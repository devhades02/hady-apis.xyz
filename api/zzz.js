const axios = require("axios");
const cheerio = require("cheerio");

/* @metadata {
  "description": "API de Zenless Zone Zero (lista y personajes). Scraper de genshin.gg",
  "method": "GET",
  "category": "ZenlessZoneZero",
  "parameters": [
    { "name": "type", "type": "string", "required": true, "example": "list | character" },
    { "name": "name", "type": "string", "required": false, "example": "ellen" }
  ]
} */

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Content-Type", "application/json");

  const type = req.query.type?.toLowerCase();
  const name = req.query.name?.toLowerCase();

  // Para debug
  console.log("QUERY RECIBIDA:", req.query);

  if (!type) {
    return res.status(400).json({
      success: false,
      status_code: 400,
      message: 'Parámetro "type" requerido. Usa: list | character'
    });
  }

  try {

    // ============================================
    //  📌 TYPE = list
    // ============================================
    if (type === "list") {

      const html = await axios.get("https://genshin.gg/zzz");
      const $ = cheerio.load(html.data);

      const characters = [];

      $(".character-list a").each((i, a) => {
        characters.push({
          name: $(a).find("h2").text(),
          image: $(a).find("img").attr("src"),
          role: $(a).find(".character-type").attr("alt"),
          url: "https://genshin.gg/zzz" + $(a).attr("href")
        });
      });

      return res.status(200).json({
        success: true,
        status_code: 200,
        creator: "Hady D'xyz",
        madeBy: "DevHades02",
        type: "list",
        total_characters: characters.length,
        characters
      });
    }

    // ============================================
    //  📌 TYPE = character
    // ============================================
    if (type === "character") {

      if (!name) {
        return res.status(400).json({
          success: false,
          status_code: 400,
          message: 'Parámetro "name" requerido. Ejemplo: /api/zzz?type=character&name=ellen'
        });
      }

      const url = `https://genshin.gg/zzz/characters/${encodeURIComponent(name.replace(/\s+/g, ""))}/`;

      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const data = {
        info: {
          name: $(".character-info-portrait").attr("alt"),
          element: $(".character-info-element").attr("alt"),
          image: $(".character-info-portrait").attr("src")
        },
        paths: [],
        stats: [],
        team: [],
        skills: [],
        talents: []
      };

      $(".character-info-path").each((i, el) => {
        data.paths.push($(el).find(".character-info-path-icon").attr("alt"));
      });

      $(".character-info-stat").each((i, el) => {
        data.stats.push({
          name: $(el).find(".character-info-stat-name").text(),
          value: $(el).find(".character-info-stat-value").text()
        });
      });

      $(".character-portrait").each((i, el) => {
        data.team.push({
          name: $(el).find(".character-name").text(),
          rarity: $(el).find(".character-icon").attr("class")?.split(" ")[1],
          element: $(el).find(".character-type").attr("alt"),
          role: $(el).find(".character-weapon").attr("alt"),
          image: $(el).find("img").attr("src")
        });
      });

      $("#skills .character-info-skill").each((i, el) => {
        data.skills.push({
          name: $(el).find(".character-info-skill-name").text(),
          description: $(el).find(".character-info-skill-description").text()
        });
      });

      $("#talents .character-info-skill").each((i, el) => {
        data.talents.push({
          name: $(el).find(".character-info-skill-name").text(),
          description: $(el).find(".character-info-skill-description").text()
        });
      });

      return res.status(200).json({
        success: true,
        status_code: 200,
        creator: "Hady D'xyz",
        madeBy: "DevHades02",
        type: "character",
        character: data
      });
    }

    // ============================================
    //  ❌ TYPE inválido
    // ============================================
    return res.status(400).json({
      success: false,
      status_code: 400,
      message: 'Valor de "type" inválido. Usa: list | character'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      status_code: 500,
      message: "Error al procesar datos de Zenless Zone Zero",
      error: error.message
    });
  }
};