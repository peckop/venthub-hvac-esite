#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const publicDir = path.join(root, 'public')

if (!fs.existsSync(publicDir)) {
  console.error('[generate-meta] public/ not found, skipping.')
  process.exit(0)
}

const rawSiteUrl = process.env.VITE_SITE_URL || 'http://localhost:4173'
let siteUrl
try {
  const u = new URL(rawSiteUrl)
  // strip trailing slash
  siteUrl = `${u.origin}`
} catch {
  console.warn(`[generate-meta] VITE_SITE_URL invalid (${rawSiteUrl}), falling back to http://localhost:4173`)
  siteUrl = 'http://localhost:4173'
}

const isPreview = (() => {
  if (process.env.VITE_NOINDEX === 'true') return true
  try {
    const host = new URL(siteUrl).hostname
    return /\.pages\.dev$/.test(host)
  } catch {
    return false
  }
})()

// robots.txt
const robotsLines = []
robotsLines.push('User-agent: *')
if (isPreview) {
  robotsLines.push('Disallow: /')
} else {
  robotsLines.push('Allow: /')
}
robotsLines.push(`Sitemap: ${siteUrl}/sitemap.xml`)
const robotsTxt = robotsLines.join('\n') + '\n'
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8')
console.warn('[generate-meta] robots.txt:', isPreview ? 'noindex (preview)' : 'index (prod)')

// sitemap.xml
const sitemapPath = path.join(publicDir, 'sitemap.xml')
let sitemap
if (fs.existsSync(sitemapPath)) {
  // Replace common localhost bases with siteUrl
  const original = fs.readFileSync(sitemapPath, 'utf8')
  const replaced = original
    .replaceAll('http://localhost:4173', siteUrl)
    .replaceAll('https://localhost:4173', siteUrl)
    .replaceAll('http://localhost:5173', siteUrl)
    .replaceAll('https://localhost:5173', siteUrl)
  sitemap = replaced
} else {
  // Minimal sitemap fallback
  sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
`  <url><loc>${siteUrl}/</loc></url>\n` +
`</urlset>\n`
}
fs.writeFileSync(sitemapPath, sitemap, 'utf8')
console.warn('[generate-meta] sitemap.xml base:', siteUrl)
