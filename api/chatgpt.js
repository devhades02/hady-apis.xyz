// =============================
//   METADATA
// =============================
const metadata = `
{
    "name": "ChatGPT",
    "icon": "fa-solid fa-robot",
    "description": "Genera respuestas usando Open AI chatgpt.",
    "method": "GET",
    "category": "IA",
    "example": "/api/chatgpt?msg=Hola",
    "params": [
        { "name": "msg", "type": "string", "required": true, "example": "Hola, explícame la física cuántica" }
    ]
}
`;

// =============================
//   CHATGPT API
// =============================
const axios = require("axios");

module.exports = async (req, res) => {

    const { msg } = req.query;

    if (!msg) {
        return res.json({
            success: false,
            status_code: 400,
            creator: "Hady D'xyz",
            message: "Parámetro requerido: ?msg=Hola"
        });
    }

    try {

        // Modelo Fijo
        const model = "gpt-3.5-turbo-0125";

        const payload = {
            messages: [
                { role: "user", content: msg }
            ],
            model: model
        };

        const response = await axios.post(
            "https://mpzxsmlptc4kfw5qw2h6nat6iu0hvxiw.lambda-url.us-east-2.on.aws/process",
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "HadyAPIs/1.0"
                }
            }
        );

        return res.json({
            success: true,
            status_code: 200,
            creator: "Hady D'xyz",
            model: model,
            input: msg,
            output: response.data
        });

    } catch (error) {
        return res.json({
            success: false,
            status_code: 500,
            creator: "Hady D'xyz",
            message: "Error al procesar ChatGPT",
            error: error.message
        });
    }
};