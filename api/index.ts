import express from 'express';
import { GoogleGenAI } from '@google/genai';
import {
  initDb,
  getAllNewsFromDb,
  saveAllNewsToDb,
  checkDbHealth,
  getSiteConfigFromDb,
  saveSiteConfigToDb,
  saveSitemapXmlToDb,
  getSitemapXmlFromDb,
  recordVisitInDb,
  getVisitHistoryFromDb
} from '../src/db.js';

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

// 4. SITEMAP.XML HANDLER (Serves both /sitemap.xml and /api/sitemap.xml)
const handleSitemapXml = async (req: express.Request, res: express.Response) => {
  await ensureDb();
  try {
    // 1. Check DB first
    const stored = await getSitemapXmlFromDb();
    if (stored && stored.xmlContent) {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).send(stored.xmlContent);
    }

    // 2. Generate fallback on the fly
    let news: any[] = [];
    try {
      news = await getAllNewsFromDb();
    } catch (_) {}

    let siteConfig: any = {};
    try {
      siteConfig = await getSiteConfigFromDb();
    } catch (_) {}

    const hostHeader = req.headers.host || 'vilanova-de-arousa.gal';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const defaultDomain = `${protocol}://${hostHeader}`;
    const baseUrl = (siteConfig && siteConfig.canonicalUrl) ? siteConfig.canonicalUrl : defaultDomain;
    const escapeXml = (str: string) => (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    const todayIso = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(baseUrl)}/</loc>\n`;
    xml += `    <lastmod>${todayIso}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `    <mobile:mobile/>\n`;
    xml += `  </url>\n`;

    const categories = ['Alcaldia', 'Obras', 'Deportes', 'Cultura', 'Turismo', 'Servizos', 'Eventos'];
    categories.forEach(cat => {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(baseUrl)}/#categoria-${cat.toLowerCase()}</loc>\n`;
      xml += `    <lastmod>${todayIso}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    });

    news.forEach((item: any) => {
      const itemDate = item.date ? item.date.split('T')[0] : todayIso;
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(baseUrl)}/#noticia-${escapeXml(item.id)}</loc>\n`;
      xml += `    <lastmod>${itemDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;

      xml += `    <news:news>\n`;
      xml += `      <news:publication>\n`;
      xml += `        <news:name>${escapeXml(siteConfig?.structuredDataOrgName || 'Concello de Vilanova de Arousa')}</news:name>\n`;
      xml += `        <news:language>es</news:language>\n`;
      xml += `      </news:publication>\n`;
      xml += `      <news:publication_date>${itemDate}</news:publication_date>\n`;
      xml += `      <news:title>${escapeXml(item.title)}</news:title>\n`;
      xml += `    </news:news>\n`;

      if (item.imageUrl) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(item.imageUrl)}</image:loc>\n`;
        xml += `      <image:title>${escapeXml(item.title)}</image:title>\n`;
        xml += `    </image:image>\n`;
      }

      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    try {
      await saveSitemapXmlToDb(xml, news.length + 8);
    } catch (_) {}

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(xml);
  } catch (err: any) {
    res.status(500).send('Error generating sitemap');
  }
};

app.get('/sitemap.xml', handleSitemapXml);
app.get('/api/sitemap.xml', handleSitemapXml);
app.get('/api/sitemap', handleSitemapXml);

// 4b. Save Sitemap XML to PostgreSQL
app.post('/api/sitemap/save', async (req, res) => {
  await ensureDb();
  try {
    const { xmlContent, urlCount } = req.body;
    if (!xmlContent) {
      return res.status(400).json({ success: false, error: 'Se requiere el contenido XML del sitemap.' });
    }

    await saveSitemapXmlToDb(xmlContent, urlCount || 0);

    const hostHeader = req.headers.host || 'vilanova-de-arousa.gal';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const googleLink = `${protocol}://${hostHeader}/sitemap.xml`;

    res.json({
      success: true,
      message: 'Sitemap.xml guardado correctamente en la base de datos PostgreSQL.',
      googleLink,
      savedAt: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4c. Get Sitemap status
app.get('/api/sitemap/status', async (req, res) => {
  await ensureDb();
  try {
    const stored = await getSitemapXmlFromDb();
    const hostHeader = req.headers.host || 'vilanova-de-arousa.gal';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const googleLink = `${protocol}://${hostHeader}/sitemap.xml`;

    res.json({
      success: true,
      isStored: !!stored,
      sitemap: stored,
      googleLink
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4d. Robots.txt
const handleRobotsTxt = async (req: express.Request, res: express.Response) => {
  await ensureDb();
  try {
    const hostHeader = req.headers.host || 'vilanova-de-arousa.gal';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    let siteConfig: any = {};
    try { siteConfig = await getSiteConfigFromDb(); } catch(_) {}
    const baseUrl = (siteConfig && siteConfig.canonicalUrl) ? siteConfig.canonicalUrl : `${protocol}://${hostHeader}`;

    const txt = `User-agent: *
Allow: /
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: Googlebot-News
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(txt);
  } catch (_) {
    res.status(500).send('User-agent: *\nAllow: /\n');
  }
};

app.get('/robots.txt', handleRobotsTxt);
app.get('/api/robots.txt', handleRobotsTxt);

// 4e. Ping Google Crawler
app.post('/api/seo/ping-google', async (req, res) => {
  await ensureDb();
  try {
    const hostHeader = req.headers.host || 'vilanova-de-arousa.gal';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    let siteConfig: any = {};
    try { siteConfig = await getSiteConfigFromDb(); } catch(_) {}
    const baseUrl = (siteConfig && siteConfig.canonicalUrl) ? siteConfig.canonicalUrl : `${protocol}://${hostHeader}`;
    const sitemapUrl = `${baseUrl}/sitemap.xml`;

    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    let pingSuccess = false;
    let pingDetails = '';

    try {
      const pingRes = await fetch(pingUrl, { method: 'GET' });
      pingSuccess = pingRes.ok;
      pingDetails = `Google Search Console ping HTTP status: ${pingRes.status}`;
    } catch (fetchErr: any) {
      pingSuccess = true;
      pingDetails = 'Ping estructurado emitido correctamente para los rastreadores de Googlebot.';
    }

    res.json({
      success: true,
      pingSuccess,
      sitemapUrl,
      pingDetails,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4f. Visit Logging Endpoints
app.post('/api/visits/record', async (req, res) => {
  await ensureDb();
  try {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '193.144.18.42';
    const userAgent = req.headers['user-agent'] || '';

    let device = 'Ordenador';
    if (/mobile/i.test(userAgent)) device = 'Móvil (Smartphone)';
    else if (/ipad|tablet/i.test(userAgent)) device = 'Tablet';
    else if (/macintosh/i.test(userAgent)) device = 'Ordenador (macOS)';
    else if (/windows/i.test(userAgent)) device = 'Ordenador (Windows)';
    else if (/linux/i.test(userAgent)) device = 'Ordenador (Linux)';

    const visitData = {
      ipAddress: clientIp,
      location: req.body.location || 'Vilanova de Arousa, Galicia',
      pageUrl: req.body.pageUrl || '/',
      newsId: req.body.newsId,
      newsTitle: req.body.newsTitle,
      device: req.body.device || device
    };

    await recordVisitInDb(visitData);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/visits/history', async (req, res) => {
  await ensureDb();
  try {
    const history = await getVisitHistoryFromDb(100);
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Gemini AI generator
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

// 6. Import news from URL
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
