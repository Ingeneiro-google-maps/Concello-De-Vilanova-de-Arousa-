import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const DEFAULT_DATABASE_URL = "postgresql://neondb_owner:npg_T31OMeknuDlx@ep-bitter-heart-auelry7k-pooler.c-10.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const connectionString = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });
  }
  return pool;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NEWS_FILE_PATH = path.join(__dirname, 'src', 'data', 'news.json');

export async function initDb() {
  const p = getPool();
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS news (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        content TEXT,
        category VARCHAR(100) DEFAULT 'Todas',
        image_url TEXT,
        original_url TEXT,
        author VARCHAR(255),
        author_role VARCHAR(255),
        date VARCHAR(100),
        read_time VARCHAR(100),
        is_breaking BOOLEAN DEFAULT false,
        is_hero BOOLEAN DEFAULT false,
        position INT DEFAULT 0,
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        tags JSONB DEFAULT '[]'::jsonb,
        comments JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS site_config (
        id VARCHAR(50) PRIMARY KEY,
        config_data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS visit_logs (
        id SERIAL PRIMARY KEY,
        ip_address VARCHAR(100),
        location VARCHAR(255) DEFAULT 'Vilanova de Arousa, Galicia',
        page_url TEXT,
        news_id VARCHAR(255),
        news_title TEXT,
        device VARCHAR(100) DEFAULT 'Ordenador (Windows)',
        visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sitemap_store (
        id VARCHAR(50) PRIMARY KEY,
        xml_content TEXT NOT NULL,
        url_count INT DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS monitored_news (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        content TEXT,
        category VARCHAR(100) DEFAULT 'Alcaldía',
        image_url TEXT,
        original_url TEXT NOT NULL,
        source_media VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        published_date VARCHAR(100),
        detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        relevance_score INT DEFAULT 95,
        highlight_phrase TEXT,
        raw_data JSONB DEFAULT '{}'::jsonb
      );

      CREATE TABLE IF NOT EXISTS monitoring_settings (
        id VARCHAR(50) PRIMARY KEY,
        is_enabled BOOLEAN DEFAULT true,
        interval_hours INT DEFAULT 12,
        last_scan_at TIMESTAMP WITH TIME ZONE,
        next_scan_at TIMESTAMP WITH TIME ZONE,
        keywords TEXT DEFAULT 'Gonzalo Durán, Alcalde de Vilanova de Arousa, Concello de Vilanova de Arousa',
        monitored_sources JSONB DEFAULT '["La Voz de Galicia (Arousa / Pontevedra)", "Diario de Arousa", "Faro de Vigo (Arousa)", "PontevedraViva", "Nós Diario", "CRTVG (Galicia Noticias)", "El Correo Gallego", "Cadena SER Arousa"]'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('PostgreSQL database initialized successfully (tables: news, site_config, visit_logs, sitemap_store, monitored_news, monitoring_settings)');

    // Check if visit_logs is empty, seed initial sample history if needed
    const visitCountRes = await p.query('SELECT COUNT(*) FROM visit_logs');
    if (parseInt(visitCountRes.rows[0].count, 10) === 0) {
      console.log('Seeding initial visitor history into PostgreSQL visit_logs...');
      const sampleLocations = [
        'Vilanova de Arousa, Galicia',
        'Vilagarcía de Arousa, Pontevedra',
        'Santiago de Compostela, A Coruña',
        'Pontevedra, Galicia',
        'Vigo, Pontevedra',
        'A Coruña, Galicia',
        'Madrid, España',
        'Ourense, Galicia',
        'Cambados, O Salnés',
        'Sanxenxo, Pontevedra'
      ];
      const sampleDevices = [
        'Móvil (iPhone / Safari)',
        'Móvil (Android / Chrome)',
        'Ordenador (Windows / Chrome)',
        'Ordenador (macOS / Safari)',
        'Tablet (iPad / Safari)',
        'Ordenador (Linux / Firefox)'
      ];
      const sampleNews = [
        { id: 'news-1', title: 'Obradoiro de Emprego Rías Baixas VI' },
        { id: 'news-2', title: 'Illa de Arousa e Vilanova melloran o transporte' },
        { id: 'news-3', title: 'Novedades na Festa do Cordeiro e do Vinho' },
        { id: 'news-4', title: 'Concello de Vilanova de Arousa - Portada Principal' },
        { id: 'news-5', title: 'Obras de remodelación no paseo marítimo de O Esteiro' },
        { id: 'news-6', title: 'Bando Alcaldía: Subvencións para o comercio local' }
      ];

      for (let i = 0; i < 25; i++) {
        const loc = sampleLocations[i % sampleLocations.length];
        const dev = sampleDevices[i % sampleDevices.length];
        const news = sampleNews[i % sampleNews.length];
        const minutesAgo = (25 - i) * 12 + Math.floor(Math.random() * 8);
        const pastDate = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

        await p.query(`
          INSERT INTO visit_logs (ip_address, location, page_url, news_id, news_title, device, visited_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          `193.144.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 250) + 1}`,
          loc,
          `/#noticia-${news.id}`,
          news.id,
          news.title,
          dev,
          pastDate
        ]);
      }
    }

    // Check if table is empty, seed from news.json if needed
    const countRes = await p.query('SELECT COUNT(*) FROM news');
    const count = parseInt(countRes.rows[0].count, 10);

    if (count === 0) {
      console.log('Database empty, seeding initial news data from news.json...');
      try {
        const fileContent = await fs.readFile(NEWS_FILE_PATH, 'utf-8');
        const initialNews = JSON.parse(fileContent);
        if (Array.isArray(initialNews) && initialNews.length > 0) {
          await saveAllNewsToDb(initialNews);
          console.log(`Successfully seeded ${initialNews.length} news items into PostgreSQL.`);
        }
      } catch (seedErr) {
        console.warn('Could not seed initial news from file:', seedErr);
      }
    }
  } catch (err) {
    console.error('Error initializing PostgreSQL table:', err);
  }
}

export async function getAllNewsFromDb(): Promise<any[]> {
  const p = getPool();
  try {
    const result = await p.query(`
      SELECT 
        id,
        title,
        subtitle,
        content,
        category,
        image_url AS "imageUrl",
        original_url AS "originalUrl",
        author,
        author_role AS "authorRole",
        date,
        read_time AS "readTime",
        is_breaking AS "isBreaking",
        is_hero AS "isHero",
        position,
        views,
        likes,
        tags,
        comments
      FROM news
      ORDER BY position ASC, created_at DESC
    `);
    return result.rows.map(row => ({
      ...row,
      tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags) : []),
      comments: Array.isArray(row.comments) ? row.comments : (typeof row.comments === 'string' ? JSON.parse(row.comments) : []),
      isBreaking: Boolean(row.isBreaking),
      isHero: Boolean(row.isHero),
      position: Number(row.position || 0),
      views: Number(row.views || 0),
      likes: Number(row.likes || 0)
    }));
  } catch (err) {
    console.error('Error getting news from DB:', err);
    throw err;
  }
}

export async function saveAllNewsToDb(newsArray: any[]): Promise<boolean> {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    
    // Clear current news
    await client.query('DELETE FROM news');

    // Insert all items
    for (let i = 0; i < newsArray.length; i++) {
      const news = newsArray[i];
      await client.query(`
        INSERT INTO news (
          id, title, subtitle, content, category, image_url, original_url,
          author, author_role, date, read_time, is_breaking, is_hero,
          position, views, likes, tags, comments
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [
        news.id || `news-${Date.now()}-${i}`,
        news.title || '',
        news.subtitle || '',
        news.content || '',
        news.category || 'Todas',
        news.imageUrl || '',
        news.originalUrl || null,
        news.author || 'Gabinete de Prensa',
        news.authorRole || 'Concello de Vilanova de Arousa',
        news.date || new Date().toISOString(),
        news.readTime || '3 min de lectura',
        Boolean(news.isBreaking),
        Boolean(news.isHero),
        Number(news.position || (i + 1)),
        Number(news.views || 0),
        Number(news.likes || 0),
        JSON.stringify(news.tags || []),
        JSON.stringify(news.comments || [])
      ]);
    }

    await client.query('COMMIT');

    // Also mirror to news.json file as backup
    try {
      await fs.mkdir(path.dirname(NEWS_FILE_PATH), { recursive: true });
      await fs.writeFile(NEWS_FILE_PATH, JSON.stringify(newsArray, null, 2), 'utf-8');
    } catch (fsErr) {
      console.warn('Backup write to news.json failed:', fsErr);
    }

    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error saving news to DB:', err);
    throw err;
  } finally {
    client.release();
  }
}

export async function upsertSingleNewsInDb(news: any): Promise<boolean> {
  const p = getPool();
  try {
    await p.query(`
      INSERT INTO news (
        id, title, subtitle, content, category, image_url, original_url,
        author, author_role, date, read_time, is_breaking, is_hero,
        position, views, likes, tags, comments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        content = EXCLUDED.content,
        category = EXCLUDED.category,
        image_url = EXCLUDED.image_url,
        original_url = EXCLUDED.original_url,
        author = EXCLUDED.author,
        author_role = EXCLUDED.author_role,
        date = EXCLUDED.date,
        read_time = EXCLUDED.read_time,
        is_breaking = EXCLUDED.is_breaking,
        is_hero = EXCLUDED.is_hero,
        position = EXCLUDED.position,
        views = EXCLUDED.views,
        likes = EXCLUDED.likes,
        tags = EXCLUDED.tags,
        comments = EXCLUDED.comments
    `, [
      news.id || `news-${Date.now()}`,
      news.title || '',
      news.subtitle || '',
      news.content || '',
      news.category || 'Todas',
      news.imageUrl || '',
      news.originalUrl || null,
      news.author || 'Gabinete de Prensa',
      news.authorRole || 'Concello de Vilanova de Arousa',
      news.date || new Date().toISOString(),
      news.readTime || '3 min de lectura',
      Boolean(news.isBreaking),
      Boolean(news.isHero),
      Number(news.position || 0),
      Number(news.views || 0),
      Number(news.likes || 0),
      JSON.stringify(news.tags || []),
      JSON.stringify(news.comments || [])
    ]);
    return true;
  } catch (err) {
    console.error('Error upserting single news in DB:', err);
    throw err;
  }
}

export async function checkDbHealth(): Promise<{
  connected: boolean;
  dbName: string;
  host: string;
  latencyMs: number;
  totalNews: number;
  error?: string;
  serverTime?: string;
}> {
  const start = Date.now();
  const p = getPool();
  try {
    const res = await p.query(`
      SELECT 
        current_database() AS db_name,
        NOW() AS server_time,
        (SELECT COUNT(*) FROM news) AS news_count
    `);
    const latencyMs = Date.now() - start;
    const row = res.rows[0];
    
    let hostStr = 'Neon PostgreSQL';
    try {
      const parsed = new URL(connectionString);
      hostStr = parsed.hostname;
    } catch (_) {}

    return {
      connected: true,
      dbName: row.db_name || 'neondb',
      host: hostStr,
      latencyMs,
      totalNews: parseInt(row.news_count || '0', 10),
      serverTime: row.server_time ? new Date(row.server_time).toLocaleTimeString() : new Date().toLocaleTimeString()
    };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    let hostStr = 'Neon PostgreSQL';
    try {
      const parsed = new URL(connectionString);
      hostStr = parsed.hostname;
    } catch (_) {}

    return {
      connected: false,
      dbName: 'neondb',
      host: hostStr,
      latencyMs,
      totalNews: 0,
      error: err?.message || 'Error de conexión a la base de datos'
    };
  }
}

export async function getSiteConfigFromDb(): Promise<any | null> {
  const p = getPool();
  try {
    const res = await p.query(`SELECT config_data FROM site_config WHERE id = 'main'`);
    if (res.rows.length > 0) {
      const data = res.rows[0].config_data;
      return typeof data === 'string' ? JSON.parse(data) : data;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching site config from DB:', err);
    return null;
  }
}

export async function saveSiteConfigToDb(config: any): Promise<boolean> {
  const p = getPool();
  try {
    await p.query(`
      INSERT INTO site_config (id, config_data, updated_at)
      VALUES ('main', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        config_data = EXCLUDED.config_data,
        updated_at = CURRENT_TIMESTAMP
    `, [JSON.stringify(config)]);
    return true;
  } catch (err) {
    console.error('Error saving site config to DB:', err);
    throw err;
  }
}

export async function recordVisitInDb(visit: {
  ipAddress?: string;
  location?: string;
  pageUrl?: string;
  newsId?: string;
  newsTitle?: string;
  device?: string;
}): Promise<boolean> {
  const p = getPool();
  try {
    await p.query(`
      INSERT INTO visit_logs (ip_address, location, page_url, news_id, news_title, device, visited_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    `, [
      visit.ipAddress || '193.144.18.42',
      visit.location || 'Vilanova de Arousa, Galicia',
      visit.pageUrl || '/',
      visit.newsId || null,
      visit.newsTitle || 'Portada Principal Concello',
      visit.device || 'Navegador Web'
    ]);
    return true;
  } catch (err) {
    console.error('Error recording visit in DB:', err);
    return false;
  }
}

export async function getVisitHistoryFromDb(limit: number = 100): Promise<{
  totalVisits: number;
  recentVisits: any[];
  topLocations: { name: string; count: number }[];
  topNews: { title: string; count: number }[];
}> {
  const p = getPool();
  try {
    const totalRes = await p.query(`SELECT COUNT(*) FROM visit_logs`);
    const totalVisits = parseInt(totalRes.rows[0].count, 10);

    const logsRes = await p.query(`
      SELECT 
        id,
        ip_address AS "ipAddress",
        location,
        page_url AS "pageUrl",
        news_id AS "newsId",
        news_title AS "newsTitle",
        device,
        visited_at AS "visitedAt"
      FROM visit_logs
      ORDER BY visited_at DESC
      LIMIT $1
    `, [limit]);

    const locRes = await p.query(`
      SELECT location AS name, COUNT(*) AS count
      FROM visit_logs
      WHERE location IS NOT NULL AND location != ''
      GROUP BY location
      ORDER BY count DESC
      LIMIT 8
    `);

    const newsRes = await p.query(`
      SELECT news_title AS title, COUNT(*) AS count
      FROM visit_logs
      WHERE news_title IS NOT NULL AND news_title != ''
      GROUP BY news_title
      ORDER BY count DESC
      LIMIT 8
    `);

    return {
      totalVisits,
      recentVisits: logsRes.rows.map(r => ({
        ...r,
        visitedAt: r.visitedAt ? new Date(r.visitedAt).toISOString() : new Date().toISOString()
      })),
      topLocations: locRes.rows.map(r => ({ name: r.name, count: parseInt(r.count, 10) })),
      topNews: newsRes.rows.map(r => ({ title: r.title, count: parseInt(r.count, 10) }))
    };
  } catch (err) {
    console.error('Error getting visit history from DB:', err);
    return {
      totalVisits: 0,
      recentVisits: [],
      topLocations: [],
      topNews: []
    };
  }
}

export async function saveSitemapXmlToDb(xmlContent: string, urlCount: number = 0): Promise<boolean> {
  const p = getPool();
  try {
    await p.query(`
      INSERT INTO sitemap_store (id, xml_content, url_count, updated_at)
      VALUES ('main', $1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        xml_content = EXCLUDED.xml_content,
        url_count = EXCLUDED.url_count,
        updated_at = CURRENT_TIMESTAMP
    `, [xmlContent, urlCount]);

    // Also persist directly to physical public and dist files for static web servers / Vercel
    try {
      const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
      await fs.mkdir(path.dirname(publicPath), { recursive: true });
      await fs.writeFile(publicPath, xmlContent, 'utf-8');

      const distPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
      try {
        await fs.mkdir(path.dirname(distPath), { recursive: true });
        await fs.writeFile(distPath, xmlContent, 'utf-8');
      } catch (_) {}
    } catch (fsErr) {
      console.warn('Could not write sitemap.xml to disk:', fsErr);
    }

    return true;
  } catch (err) {
    console.error('Error saving sitemap.xml to DB:', err);
    // Even if DB fails, try writing to disk
    try {
      const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
      await fs.mkdir(path.dirname(publicPath), { recursive: true });
      await fs.writeFile(publicPath, xmlContent, 'utf-8');
    } catch (_) {}
    throw err;
  }
}

export async function getSitemapXmlFromDb(): Promise<{ xmlContent: string; updatedAt: string; urlCount: number } | null> {
  const p = getPool();
  try {
    const res = await p.query(`SELECT xml_content, url_count, updated_at FROM sitemap_store WHERE id = 'main'`);
    if (res.rows.length > 0) {
      return {
        xmlContent: res.rows[0].xml_content,
        urlCount: res.rows[0].url_count || 0,
        updatedAt: res.rows[0].updated_at ? new Date(res.rows[0].updated_at).toISOString() : new Date().toISOString()
      };
    }
  } catch (err) {
    console.warn('Error reading sitemap.xml from DB:', err);
  }

  // Fallback to disk file if DB is empty or unreachable
  try {
    const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    const diskContent = await fs.readFile(publicPath, 'utf-8');
    if (diskContent && diskContent.includes('<urlset')) {
      return {
        xmlContent: diskContent,
        urlCount: (diskContent.match(/<url>/g) || []).length,
        updatedAt: new Date().toISOString()
      };
    }
  } catch (_) {}

  return null;
}

export async function getMonitoredNewsFromDb(): Promise<any[]> {
  const p = getPool();
  try {
    const res = await p.query(`
      SELECT 
        id, title, subtitle, content, category, 
        image_url as "imageUrl", original_url as "originalUrl", 
        source_media as "sourceMedia", author, published_date as "publishedDate",
        detected_at as "detectedAt", status, relevance_score as "relevanceScore",
        highlight_phrase as "highlightPhrase"
      FROM monitored_news
      ORDER BY detected_at DESC
      LIMIT 100
    `);
    return res.rows;
  } catch (err) {
    console.error('Error fetching monitored news from DB:', err);
    return [];
  }
}

export async function saveMonitoredNewsItemToDb(item: any): Promise<boolean> {
  const p = getPool();
  try {
    await p.query(`
      INSERT INTO monitored_news (
        id, title, subtitle, content, category, image_url,
        original_url, source_media, author, published_date,
        detected_at, status, relevance_score, highlight_phrase, raw_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        content = EXCLUDED.content,
        category = EXCLUDED.category,
        image_url = EXCLUDED.image_url,
        original_url = EXCLUDED.original_url,
        source_media = EXCLUDED.source_media,
        published_date = EXCLUDED.published_date,
        relevance_score = EXCLUDED.relevance_score,
        highlight_phrase = EXCLUDED.highlight_phrase
    `, [
      item.id,
      item.title,
      item.subtitle || '',
      item.content || '',
      item.category || 'Alcaldía',
      item.imageUrl || '',
      item.originalUrl,
      item.sourceMedia,
      item.author || 'Prensa Gallega',
      item.publishedDate || new Date().toLocaleDateString('es-ES'),
      item.detectedAt || new Date().toISOString(),
      item.status || 'pending',
      item.relevanceScore || 95,
      item.highlightPhrase || 'Gonzalo Durán, alcalde de Vilanova de Arousa',
      JSON.stringify(item)
    ]);
    return true;
  } catch (err) {
    console.error('Error saving monitored news item to DB:', err);
    return false;
  }
}

export async function updateMonitoredNewsStatusInDb(id: string, status: 'pending' | 'approved' | 'dismissed'): Promise<boolean> {
  const p = getPool();
  try {
    await p.query(`UPDATE monitored_news SET status = $1 WHERE id = $2`, [status, id]);
    return true;
  } catch (err) {
    console.error('Error updating monitored news status in DB:', err);
    return false;
  }
}

export async function getMonitoringSettingsFromDb(): Promise<any> {
  const p = getPool();
  try {
    const res = await p.query(`SELECT is_enabled as "isEnabled", interval_hours as "intervalHours", last_scan_at as "lastScanAt", next_scan_at as "nextScanAt", keywords, monitored_sources as "monitoredSources" FROM monitoring_settings WHERE id = 'main'`);
    if (res.rows.length > 0) {
      return res.rows[0];
    }
  } catch (err) {
    console.warn('Error reading monitoring settings from DB:', err);
  }
  return {
    isEnabled: true,
    intervalHours: 12,
    lastScanAt: null,
    nextScanAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    keywords: 'Gonzalo Durán, Alcalde de Vilanova de Arousa, Concello de Vilanova de Arousa',
    monitoredSources: [
      'La Voz de Galicia (Arousa / Pontevedra)',
      'Diario de Arousa',
      'Faro de Vigo (Arousa)',
      'PontevedraViva',
      'Nós Diario',
      'CRTVG (Galicia Noticias)',
      'El Correo Gallego',
      'Cadena SER Arousa'
    ]
  };
}

export async function saveMonitoringSettingsToDb(settings: any): Promise<boolean> {
  const p = getPool();
  try {
    await p.query(`
      INSERT INTO monitoring_settings (id, is_enabled, interval_hours, last_scan_at, next_scan_at, keywords, monitored_sources, updated_at)
      VALUES ('main', $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        is_enabled = EXCLUDED.is_enabled,
        interval_hours = EXCLUDED.interval_hours,
        last_scan_at = EXCLUDED.last_scan_at,
        next_scan_at = EXCLUDED.next_scan_at,
        keywords = EXCLUDED.keywords,
        monitored_sources = EXCLUDED.monitored_sources,
        updated_at = CURRENT_TIMESTAMP
    `, [
      settings.isEnabled !== false,
      settings.intervalHours || 12,
      settings.lastScanAt ? new Date(settings.lastScanAt) : null,
      settings.nextScanAt ? new Date(settings.nextScanAt) : null,
      settings.keywords || 'Gonzalo Durán, Alcalde de Vilanova de Arousa, Concello de Vilanova de Arousa',
      JSON.stringify(settings.monitoredSources || [])
    ]);
    return true;
  } catch (err) {
    console.error('Error saving monitoring settings to DB:', err);
    return false;
  }
}


