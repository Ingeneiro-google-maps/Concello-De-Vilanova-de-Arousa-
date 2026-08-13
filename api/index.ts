import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { initDb, getAllNewsFromDb, saveAllNewsToDb, checkDbHealth, getSiteConfigFromDb, saveSiteConfigToDb } from '../src/db.js';

const app = express();

app.use(express.json({ limit: '10mb' }));

// Helper to ensure DB initialization
let dbInitialized = false;
async function ensureDb() {
  if (!dbInitialized) {
    try {
      await initDb();
      dbInitialized = true;
    } catch (e) {
      console.error('Failed DB init in Vercel function:', e);
    }
  }
}

// 1. Get all news
app.get('/api/news', async (req, res) => {
  await ensureDb();
  try {
    const news = await getAllNewsFromDb();
    res.json({ success: true, news });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error de base de datos' });
  }
});

// 2. Save all news
app.post('/api/news', async (req, res) => {
  await ensureDb();
  try {
    const { news } = req.body;
    if (!Array.isArray(news)) {
      return res.status(400).json({ success: false, error: 'Se requiere un arreglo de noticias' });
    }
    await saveAllNewsToDb(news);
    res.json({ success: true, message: 'Noticias guardadas en PostgreSQL' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error al guardar' });
  }
});

// 3. DB Health Check
app.get('/api/db-health', async (req, res) => {
  await ensureDb();
  try {
    const health = await checkDbHealth();
    res.json({ success: true, health });
  } catch (err: any) {
    res.status(500).json({ success: false, health: { connected: false, error: err.message } });
  }
});

// 3b. Site Configuration
app.get('/api/config', async (req, res) => {
  await ensureDb();
  try {
    const config = await getSiteConfigFromDb();
    res.json({ success: true, config });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/config', async (req, res) => {
  await ensureDb();
  try {
    const { config } = req.body;
    if (!config) {
      return res.status(400).json({ success: false, error: 'Se requiere la configuración.' });
    }
    await saveSiteConfigToDb(config);
    res.json({ success: true, message: 'Configuración guardada' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Gemini AI generator
app.post('/api/generate-news', async (req, res) => {
  try {
    const { prompt, category } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Se requiere el prompt' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'La variable GEMINI_API_KEY no está configurada en las variables de entorno de Vercel.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Eres el redactor jefe del portal del Concello de Vilanova de Arousa.
Genera un artículo completo en formato JSON con la siguiente estructura exacta (sin markdown extra):
{
  "title": "Titular impactante periodístico",
  "subtitle": "Subtítulo de 1 o 2 frases",
  "content": "Cuerpo del artículo con 3-4 párrafos bien estructurados...",
  "category": "${category || 'Todas'}",
  "imageUrl": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
  "author": "Redacción Vilanova",
  "authorRole": "Servicios de Información Municipal",
  "readTime": "3 min de lectura",
  "tags": ["Vilanova", "${category || 'Noticias'}"]
}

Petición del usuario: ${prompt}`
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    res.json({ success: true, data: parsed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error al generar noticia con Gemini' });
  }
});

// 5. Import news from URL
app.post('/api/import-from-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Se requiere la URL de la noticia.' });
    }

    const parsedUrl = new URL(url);
    const domainName = parsedUrl.hostname.replace('www.', '');

    let fetchedTitle = '';
    let fetchedDescription = '';
    let fetchedImage = '';
    let fetchedSiteName = '';

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (response.ok) {
        const html = await response.text();
        const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) || html.match(/<title>(.*?)<\/title>/i);
        if (ogTitleMatch) fetchedTitle = ogTitleMatch[1].replace(/&#\d+;/g, '');

        const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) || html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
        if (ogDescMatch) fetchedDescription = ogDescMatch[1].replace(/&#\d+;/g, '');

        const ogImgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
        if (ogImgMatch) fetchedImage = ogImgMatch[1];

        const ogSiteMatch = html.match(/<meta\s+property=["']og:site_name["']\s+content=["'](.*?)["']/i);
        if (ogSiteMatch) fetchedSiteName = ogSiteMatch[1];
      }
    } catch (e) {
      console.warn('Scraping error:', e);
    }

    const finalTitle = fetchedTitle || `Noticia en ${domainName}`;
    const finalSubtitle = fetchedDescription || `Información publicada originalmente en ${domainName}.`;

    const importedItem = {
      title: finalTitle,
      subtitle: finalSubtitle,
      content: `${finalSubtitle}\n\nPara leer el artículo original completo en ${domainName}, utiliza el enlace directo proporcionado.`,
      category: 'Todas',
      imageUrl: fetchedImage || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80`,
      originalUrl: url,
      author: fetchedSiteName || domainName,
      authorRole: 'Fuente Original',
      date: new Date().toISOString(),
      readTime: '3 min de lectura',
      views: 100,
      likes: 10,
      tags: [domainName, 'Noticias'],
      isBreaking: false,
      isHero: false,
      comments: []
    };

    res.json({
      success: true,
      data: importedItem,
      item: importedItem
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error al procesar la URL' });
  }
});

export default app;
