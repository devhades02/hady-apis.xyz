import ytSearch from 'yt-search';

export default {
  name: 'YouTube Search',
  description: 'Busca videos en YouTube',
  route: '/api/youtube',
  category: 'multimedia',
  version: '1.0.0',
  author: 'devhades02',
  
  async run(req, res) {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Parámetro q requerido',
        ejemplo: '/api/youtube?q=musica'
      });
    }

    try {
      const resultado = await ytSearch(query);
      const videos = resultado.videos.slice(0, 5).map(v => ({
        titulo: v.title,
        url: v.url,
        canal: v.author.name,
        vistas: v.views,
        duracion: v.timestamp,
        thumbnail: v.thumbnail
      }));

      res.json({
        success: true,
        query: query,
        resultados: videos.length,
        datos: videos,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error YouTube:', error);
      res.status(500).json({ 
        error: 'Error al buscar en YouTube',
        detalle: error.message
      });
    }
  }
};