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
    `);
    console.log('PostgreSQL database initialized successfully (table: news)');

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

