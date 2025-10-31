import axios from 'axios';

export default {
  name: 'Gemini AI',
  description: 'Asistente IA potenciado por Gemini',
  route: '/api/gemini-ai',
  category: 'ia',
  version: '1.3.1',
  author: 'devhades02',

  async run(req, res) {
    const { q: mensaje } = req.query;

    if (!mensaje) {
      return res.status(400).json({
        success: false,
        respuesta: 'Debes enviar un mensaje con ?q=',
        creador: 'devhades02'
      });
    }

    try {
      const API_URL = 'https://sadiya-tech-apis.vercel.app/ai/gemini';
      const API_KEY = 'sadiya';

      const response = await axios.post(API_URL, {
        message: mensaje,
        key: API_KEY
      }, {
        timeout: 20000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GeminiAI/1.3.1 (devhades02)'
        }
      });

      // Analizar respuesta
      const datos = response.data || {};
      const respuesta = datos.response || datos.answer || datos.message || null;

      if (!respuesta) {
        return res.status(502).json({
          success: false,
          respuesta: 'El servidor de Gemini no devolvió una respuesta válida.',
          creador: 'devhades02'
        });
      }

      res.json({
        success: true,
        respuesta: respuesta.trim(),
        creador: 'devhades02'
      });

    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data || {};
      const detalle = data.error || data.message || JSON.stringify(data) || error.message;

      console.error('Error Gemini AI:', detalle);

      res.status(status).json({
        success: false,
        respuesta: `Error desde el servidor Gemini (${status}): ${detalle}`,
        creador: 'devhades02'
      });
    }
  }
};