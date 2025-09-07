// scripts/generate-sitemap.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const BASE_URL = process.env.SITEMAP_BASE_URL || 'http://localhost:5173'

async function fetchData() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[sitemap] VITE_SUPABASE_URL/ANON_KEY eksik; minimal sitemap üretilecek')
    return { categories: [], products: [] }
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const [{ data: cats, error: ce }, { data: prods, error: pe }] = await Promise.all([
    supabase.from('categories').select('id, slug, parent_id, level, updated_at').limit(1000),
    supabase.from('products').select('id, updated_at').limit(5000),
  ])
  if (ce) console.warn('[sitemap] kategori hatası:', ce.message)
  if (pe) console.warn('[sitemap] ürün hatası:', pe.message)
  return { categories: cats || [], products: prods || [] }
}

function xmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildUrls({ categories, products }) {
  const urls = []
  const now = new Date().toISOString()

  // Core pages
  urls.push({ loc: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0', lastmod: now })
  urls.push({ loc: `${BASE_URL}/products`, changefreq: 'daily', priority: '0.9', lastmod: now })
  urls.push({ loc: `${BASE_URL}/brands`, changefreq: 'weekly', priority: '0.6', lastmod: now })

  // Categories
  const byId = new Map(categories.map(c => [c.id, c]))
  for (const c of categories) {
    if (c.level === 0) {
      urls.push({ loc: `${BASE_URL}/category/${c.slug}`, changefreq: 'weekly', priority: '0.7', lastmod: now })
    }
  }
  for (const c of categories) {
    if (c.level === 1 && c.parent_id && byId.get(c.parent_id)) {
      const parent = byId.get(c.parent_id)
      urls.push({ loc: `${BASE_URL}/category/${parent.slug}/${c.slug}`, changefreq: 'weekly', priority: '0.6', lastmod: now })
    }
  }

  // Products (id tabanlı URL yapınız var)
  for (const p of products) {
    urls.push({ loc: `${BASE_URL}/product/${p.id}`, changefreq: 'weekly', priority: '0.8', lastmod: p.updated_at || now })
  }
  return urls
}

function toSitemapXml(urls) {
  const body = urls.map(u => {
    return [
      '  <url>',
      `    <loc>${xmlEscape(u.loc)}</loc>`,
      u.lastmod ? `    <lastmod>${xmlEscape(u.lastmod)}</lastmod>` : null,
      u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>` : null,
      u.priority ? `    <priority>${u.priority}</priority>` : null,
      '  </url>'
    ].filter(Boolean).join('\n')
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

async function main() {
  try {
    const data = await fetchData()
    const urls = buildUrls(data)
    const xml = toSitemapXml(urls)
    const outPath = resolve(__dirname, '../public/sitemap.xml')
    mkdirSync(resolve(__dirname, '../public'), { recursive: true })
    writeFileSync(outPath, xml, 'utf8')
    console.warn(`[sitemap] Yazıldı: ${outPath} (${urls.length} URL)`) 
  } catch (e) {
    console.error('[sitemap] Hata:', e)
    // Minimal fallback
    const now = new Date().toISOString()
    const fallback = toSitemapXml([
      { loc: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0', lastmod: now },
      { loc: `${BASE_URL}/products`, changefreq: 'daily', priority: '0.9', lastmod: now },
    ])
    const outPath = resolve(__dirname, '../public/sitemap.xml')
    writeFileSync(outPath, fallback, 'utf8')
    console.warn('[sitemap] Fallback sitemap yazıldı')
  }
}

main()

