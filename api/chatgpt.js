const axios = require("axios");

/* @metadata {
  "description": "Genera respuestas usando ChatGPT con modelos GPT disponibles",
  "method": "GET",
  "category": "IA",
  "parameters": [
    {"name": "model", "type": "string", "required": true, "example": "gpt-3.5-turbo-0125"},
    {"name": "msg", "type": "string", "required": true, "example": "Explica la física cuántica"}
  ]
} */

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { model, msg } = req.query;

  if (!model || !msg) {
    return res.status(400).json({
      success: false,
      status_code: 400,
      message: 'Parámetros requeridos: ?model=gpt-4o-mini&msg=Hola'
    });
  }

  try {

    const modelosPermitidos = [
      "gpt-3.5-turbo",
      "gpt-3.5-turbo-0125",
      "gpt-4o-mini",
      "gpt-4o"
    ];

    if (!modelosPermitidos.includes(model)) {
      return res.status(400).json({
        success: false,
        status_code: 400,
        message: "Modelo inválido. Modelos disponibles: " + modelosPermitidos.join(", ")
      });
    }

    // Construye el payload del chatbot
    const payload = {
      messages: [
        { role: "user", content: msg }
      ],
      model: model
    };

    // Llama a tu endpoint de procesamiento
    const response = await axios.post(
      "https://mpzxsmlptc4kfw5qw2h6nat6iu0hvxiw.lambda-url.us-east-2.on.aws/process",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Postify/1.0.0"
        }
      }
    );

    return res.status(200).json({
      success: true,
      status_code: 200,
      creator: "Hady D'xyz",
      madeBy: "DevHades02",
      model: model,
      input: msg,
      output: response.data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      status_code: 500,
      message: "Error al procesar ChatGPT",
      error: error.message
    });
  }
};