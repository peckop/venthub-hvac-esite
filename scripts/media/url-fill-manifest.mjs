#!/usr/bin/env node
/**
 * Genel URL-dolgu — Recep'in "URL ile bağlama yetkisi" kalıbı (08-21 OPS environment'ta kalıcı):
 * bir eşleme dosyasındaki {SKU: {urls:[...], note}} kayıtlarını indirir, webp'e çevirir,
 * upload-pilot-images.mjs şemasında manifest üretir. source_url'e kaynak URL + not yazılır.
 *
 * Eşleme dosyası (JSON): { "AVE-60006": { "urls": ["https://..."], "note": "Recep karari ..." }, ... }
 * Kullanım: node url-fill-manifest.mjs --map <eslesme.json> --out <dizin> --url <SUPABASE_URL> --key <ANON>
 */
import fs from 'node:fs';
import path from 'node:path';

const UA = 'VentHub-image-pilot/0.1 (HVAC distributor catalog import; sequential polite run)';
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const mapFile = arg('map'), outDir = arg('out'), dbUrl = arg('url'), dbKey = arg('key');
if (!mapFile || !outDir || !dbUrl || !dbKey) { console.error('kullanım: --map --out --url --key'); process.exit(2); }
const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
const skus = Object.keys(map);

const res = await fetch(`${dbUrl}/rest/v1/products?select=id,name,sku,tenant_id&sku=in.(${skus.join(',')})&deleted_at=is.null`, {
  headers: { apikey: dbKey, authorization: `Bearer ${dbKey}` } });
const rows = await res.json();
if (rows.length !== skus.length) { console.error(`beklenen ${skus.length}, gelen ${rows.length}: ${rows.map(r => r.sku)}`); process.exit(1); }
const tenants = new Set(rows.map(r => r.tenant_id));
if (tenants.size !== 1) { console.error('tenant tekil degil'); process.exit(1); }

const { default: sharp } = await import('sharp');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const state = { tenant_id: [...tenants][0], products: {} };
const cache = new Map();
for (const r of rows) {
  const { urls, note } = map[r.sku];
  const images = [];
  for (let i = 0; i < urls.length; i++) {
    const src = urls[i];
    let webp = cache.get(src);
    if (!webp) {
      const dir = path.join(outDir, 'kaynak', r.sku.toLowerCase());
      fs.mkdirSync(dir, { recursive: true });
      const ext = (path.extname(new URL(src).pathname) || '.jpg').toLowerCase();
      const orig = path.join(dir, `${String(i).padStart(2, '0')}${ext}`);
      if (!fs.existsSync(orig)) {
        await sleep(1500);
        const rr = await fetch(src, { headers: { 'user-agent': UA }, redirect: 'follow' });
        if (!rr.ok) { console.error(`[indirme HATA] ${r.sku} ${rr.status} ${src}`); process.exit(1); }
        fs.writeFileSync(orig, Buffer.from(await rr.arrayBuffer()));
        console.log(`[download] ${r.name} #${i}`);
      }
      webp = orig.replace(/\.[a-z]+$/, '.webp');
      if (!fs.existsSync(webp)) {
        await sharp(orig).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(webp);
      }
      cache.set(src, webp);
    }
    images.push({
      sort_order: i, kind: 'gallery', source_url: `${src} (${note})`, webp_file: webp,
      alt: `${r.name} – ${r.sku} – ${i + 1}`,
      storage_path: `${state.tenant_id}/${r.id}/${String(i).padStart(2, '0')}.webp`,
    });
  }
  state.products[r.sku] = { model_code: r.sku, product_id: r.id, name: r.name, images };
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 't139-manifest.json'), JSON.stringify(state, null, 2));
console.log(`manifest: ${Object.keys(state.products).length} sku -> ${path.join(outDir, 't139-manifest.json')}`);
