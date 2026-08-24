#!/usr/bin/env node
/**
 * SEAT-FAZ2 — seat-ventilation.fr (Shopify) görselleri: eşleme + indirme + webp.
 * Recep kararı (2026-08-21): ürünün KENDİ fotoğrafı varsa yüklenir, yoksa yüklenmez —
 * vekil foto YOK (ATEX türevleri baz-model fotoğrafı ALMAZ, fail-visible listeye düşer).
 *
 * Eşleme: DB ürün adı (JET 20 vb.) --normalize--> Shopify başlığı BİREBİR eşleşirse o
 * modelin görselleri üründeki HER SKU'ya (ayrı products satırı) bağlanır.
 * Çıktı: <out>/t139-manifest.json (upload-pilot-images.mjs ile aynı şema) — yükleme AYRI adım.
 *
 * Kullanım:
 *   node scripts/media/seat-image-run.mjs --out <dizin> --url <SUPABASE_URL> --key <ANON_KEY>
 */
import fs from 'node:fs';
import path from 'node:path';

const DELAY_MS = 1500;
const UA = 'VentHub-image-pilot/0.1 (HVAC distributor catalog import; sequential polite run)';
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const outDir = arg('out'), dbUrl = arg('url'), dbKey = arg('key');
if (!outDir || !dbUrl || !dbKey) { console.error('kullanım: --out <dizin> --url <URL> --key <ANON>'); process.exit(2); }

const norm = (s) => s.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let last = 0;
async function politeFetch(url) {
  const wait = last + DELAY_MS - Date.now();
  if (wait > 0) await sleep(wait);
  last = Date.now();
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

// 1) Shopify katalog (tek sayfa yeter: 129 < 250)
const shop = await (await politeFetch('https://seat-ventilation.fr/products.json?limit=250')).json();
const byTitle = new Map(shop.products.map(p => [norm(p.title), p]));
console.log(`shopify: ${shop.products.length} urun`);

// 2) DB SEAT ürünleri (public SELECT, anon)
const res = await fetch(`${dbUrl}/rest/v1/products?select=id,name,sku,tenant_id&brand=eq.SEAT&deleted_at=is.null`, {
  headers: { apikey: dbKey, authorization: `Bearer ${dbKey}` } });
if (!res.ok) { console.error('DB okuma hatasi', res.status); process.exit(1); }
const rows = await res.json();
console.log(`db: ${rows.length} SEAT sku`);
const tenants = new Set(rows.map(r => r.tenant_id));
if (tenants.size !== 1) { console.error('tenant tekil degil'); process.exit(1); }

// 3) Eşle + benzersiz görselleri indir + webp
const { default: sharp } = await import('sharp');
const state = { tenant_id: [...tenants][0], products: {}, unmatched: [] };
const imageCache = new Map(); // kaynak URL -> yerel webp
for (const r of rows) {
  const hit = byTitle.get(norm(r.name));
  if (!hit || !(hit.images || []).length) {
    state.unmatched.push({ sku: r.sku, name: r.name, reason: hit ? 'shopify-urunde gorsel yok' : 'birebir eslesme yok (ATEX/XRM sinifi dahil) - Recep karari: vekil foto YOK' });
    continue;
  }
  const images = [];
  for (let i = 0; i < hit.images.length; i++) {
    const src = hit.images[i].src.split('?')[0];
    let webpFile = imageCache.get(src);
    if (!webpFile) {
      const modelDir = path.join(outDir, 'seat', norm(hit.title).replace(/ /g, '_'));
      fs.mkdirSync(modelDir, { recursive: true });
      const orig = path.join(modelDir, `${String(i).padStart(2, '0')}${path.extname(new URL(src).pathname) || '.jpg'}`);
      if (!fs.existsSync(orig)) {
        console.log(`[download] ${hit.title} #${i}`);
        fs.writeFileSync(orig, Buffer.from(await (await politeFetch(src)).arrayBuffer()));
      }
      webpFile = path.join(modelDir, `${String(i).padStart(2, '0')}.webp`);
      if (!fs.existsSync(webpFile)) {
        await sharp(orig).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(webpFile);
      }
      imageCache.set(src, webpFile);
    }
    images.push({
      sort_order: i, kind: 'gallery', source_url: src, webp_file: webpFile,
      alt: `${r.name} – ${r.sku} – ${i + 1}`,
      storage_path: `${state.tenant_id}/${r.id}/${String(i).padStart(2, '0')}.webp`,
    });
  }
  state.products[r.sku] = { model_code: r.sku, product_id: r.id, name: r.name, images };
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 't139-manifest.json'), JSON.stringify(state, null, 2));
console.log(`bitti — yuklenecek sku: ${Object.keys(state.products).length}, fotosuz (Recep karari): ${state.unmatched.length}, benzersiz gorsel: ${imageCache.size}`);
console.log(`manifest: ${path.join(outDir, 't139-manifest.json')}`);
