import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_FILE_PATH = path.join(__dirname, 'src', 'data', 'news.json');

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper to read news from JSON file
  async function readNewsFromFile() {
    try {
      const data = await fs.readFile(NEWS_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Could not read news.json, returning empty array or fallback:', error);
      return [];
    }
  }

  // Helper to write news to JSON file
  async function writeNewsToFile(newsArray: any[]) {
    try {
      await fs.mkdir(path.dirname(NEWS_FILE_PATH), { recursive: true });
      await fs.writeFile(NEWS_FILE_PATH, JSON.stringify(newsArray, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('Error writing to news.json file:', error);
      throw error;
    }
  }

  // API Endpoints
  // 1. Get all news
  app.get('/api/news', async (req, res) => {
    try {
      const news = await readNewsFromFile();
      res.json({ success: true, news });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Save news directly to news.json code file
  app.post('/api/news', async (req, res) => {
    try {
      const { news } = req.body;
      if (!Array.isArray(news)) {
        return res.status(400).json({ success: false, error: 'Se requiere un arreglo de noticias.' });
      }
      await writeNewsToFile(news);
      res.json({ success: true, message: 'Noticias guardadas directamente en el código (src/data/news.json).' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. AI News Generator using Gemini API
  app.post('/api/generate-news', async (req, res) => {
    try {
      const { prompt, category } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: 'Por favor proporciona un tema o indicación para la noticia.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          success: false, 
          error: 'GEMINI_API_KEY no está configurada. Puedes escribir la noticia manualmente o configurar la clave en Ajustes.' 
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `
Eres un periodista profesional de alto nivel redactando para un portal de noticias hispanohablante.
Escribe un artículo de noticia completo, riguroso, objetivo y profesional basado en la siguiente indicación del usuario.

Devuelve EXCLUSIVAMENTE un objeto JSON válido con los siguientes campos exactamente:
{
  "title": "Un titular llamativo, claro e informativo en español (máx 15 palabras)",
  "subtitle": "Un subtítulo o bajada con contexto clave (máx 25 palabras)",
  "content": "El cuerpo completo del artículo dividido en varios párrafos bien redactados en español (mínimo 3 párrafos)",
  "category": "${category || 'Nacional'}", // Debe ser una de: "Nacional", "Internacional", "Tecnología", "Economía", "Deportes", "Cultura", "Opinión"
  "author": "Nombre ficticio realista de periodista",
  "authorRole": "Cargo Periodístico",
  "tags": ["Etiqueta1", "Etiqueta2", "Etiqueta3"],
  "readTime": "4 min de lectura",
  "imageKeyword": "keyword en inglés para Unsplash (ej. fusion energy, robot, soccer stadium, economy)"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nTema/Indicación: ${prompt}` }] }
        ],
        config: {
          responseMimeType: 'application/json',
        }
      });

      const responseText = response.text || '';
      const generatedData = JSON.parse(responseText);

      const imageUrl = `https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80`;

      res.json({
        success: true,
        data: {
          ...generatedData,
          imageUrl,
          date: new Date().toISOString(),
          views: 1,
          likes: 0,
          isBreaking: false,
          isHero: false,
          comments: []
        }
      });
    } catch (err: any) {
      console.error('Error generating AI news:', err);
      res.status(500).json({ success: false, error: err.message || 'Error al generar la noticia con IA' });
    }
  });

  // 4. Import / Scrape News Preview from URL
  app.post('/api/import-from-url', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ success: false, error: 'Por favor proporciona un enlace URL válido.' });
      }

      let fetchedTitle = '';
      let fetchedDescription = '';
      let fetchedImage = '';
      let fetchedSiteName = '';

      // Try fetching the raw webpage metadata
      try {
        const fetchRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });

        if (fetchRes.ok) {
          const html = await fetchRes.text();
          
          // Match open graph title
          const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                             html.match(/<meta[^>]*name=["']title["'][^>]*content=["']([^"']+)["']/i) ||
                             html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch) fetchedTitle = titleMatch[1].trim();

          // Match open graph description
          const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
          if (descMatch) fetchedDescription = descMatch[1].trim();

          // Match open graph image
          const imgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                           html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
          if (imgMatch) fetchedImage = imgMatch[1].trim();

          // Match site name
          const siteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
          if (siteMatch) fetchedSiteName = siteMatch[1].trim();
        }
      } catch (e) {
        console.warn('Metadata fetch failed for URL, falling back to Gemini or URL parsing:', e);
      }

      // If Gemini API is available, use it to refine and format clean news structured data
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `Analiza y convierte el siguiente enlace de noticia en un artículo de vista previa profesional estructurado.
URL de la noticia: ${url}
${fetchedTitle ? `Título extraído: ${fetchedTitle}` : ''}
${fetchedDescription ? `Descripción extraída: ${fetchedDescription}` : ''}
${fetchedSiteName ? `Medio: ${fetchedSiteName}` : ''}

Devuelve EXCLUSIVAMENTE un objeto JSON válido con los siguientes campos:
{
  "title": "Titular profesional, claro e impactante en español (máx 15 palabras)",
  "subtitle": "Subtítulo o resumen ejecutivo conciso (máx 25 palabras)",
  "content": "Vista previa informativa del contenido de la noticia estructurada en 2 o 3 párrafos en español.",
  "category": "Categoría adecuada entre: Nacional, Internacional, Tecnología, Economía, Deportes, Cultura, Opinión",
  "author": "Nombre del redactor o medio original (${fetchedSiteName || 'Agencia de Noticias'})",
  "authorRole": "Redacción Digital",
  "tags": ["Noticias", "Actualidad"],
  "readTime": "3 min de lectura"
}`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
          });

          const responseText = response.text || '';
          const geminiData = JSON.parse(responseText);

          // Use fetched image if valid URL, otherwise high quality unsplash fallback
          const finalImage = (fetchedImage && fetchedImage.startsWith('http'))
            ? fetchedImage
            : `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80`;

          return res.json({
            success: true,
            data: {
              ...geminiData,
              imageUrl: finalImage,
              originalUrl: url,
              date: new Date().toISOString(),
              views: 100,
              likes: 12,
              isBreaking: false,
              isHero: false,
              comments: []
            }
          });
        } catch (geminiError) {
          console.warn('Gemini URL analysis fallback:', geminiError);
        }
      }

      // Fallback if no Gemini or error
      const parsedUrl = new URL(url);
      const domainName = parsedUrl.hostname.replace('www.', '');
      const finalTitle = fetchedTitle || `Noticia publicada en ${domainName}`;
      const finalSubtitle = fetchedDescription || `Accede a la cobertura completa directamente en el sitio original de ${domainName}.`;

      res.json({
        success: true,
        data: {
          title: finalTitle,
          subtitle: finalSubtitle,
          content: `${finalSubtitle}\n\nEste artículo es una vista previa de la información alojada originalmente en ${domainName}. Haz clic en "Ir a la noticia original" para leer la publicación completa en la fuente oficial.`,
          category: 'Nacional',
          imageUrl: fetchedImage || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80`,
          originalUrl: url,
          author: fetchedSiteName || domainName,
          authorRole: 'Fuente Original',
          date: new Date().toISOString(),
          readTime: '2 min de lectura',
          views: 50,
          likes: 5,
          tags: [domainName, 'Noticias'],
          isBreaking: false,
          isHero: false,
          comments: []
        }
      });
    } catch (err: any) {
      console.error('Error importing news from URL:', err);
      res.status(500).json({ success: false, error: err.message || 'Error al procesar el enlace de la noticia' });
    }
  });

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
