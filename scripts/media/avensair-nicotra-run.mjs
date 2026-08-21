#!/usr/bin/env node
/**
 * NICOTRA — avensair.com/nicotra-gebhardt görselleri: keşif + eşleme + indirme + webp.
 * Recep kararı (2026-08-21): "avensair sayfasında alabilirsin eksik nicotraları;
 * indirdikten sonra eşleşenleri direk bağla" — eşleşmeyen YÜKLENMEZ, fail-visible listeye düşer.
 *
 * Keşif: kategori sayfası (AT) + site araması (ADH/RDH/DD) → ürün slug'ları.
 * Eşleme: slug'ın model bölümü ↔ DB adı (DD'de ad sonundaki " - <kod>" atılır; kod
 * avensair slug'ında da var ama iki kaynakta 1↔N yazım farkı ölçüldü → kod eşlemeye
 * SOKULMAZ, rapora yazılır).
 * Görsel: ürün sayfası carousel'indeki `thumbnail fancybox` img'leri (teknik tablo
 * sekmelerindeki görseller ALINMAZ).
 * Çıktı: <out>/t139-manifest.json (upload-pilot-images.mjs şeması) — yükleme AYRI adım.
 *
 * Kullanım:
 *   node scripts/media/avensair-nicotra-run.mjs --out <dizin> --url <SUPABASE_URL> --key <ANON_KEY>
 */
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://www.avensair.com';
const DELAY_MS = 1500;
const UA = 'VentHub-image-pilot/0.1 (HVAC distributor catalog import; sequential polite run)';
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const outDir = arg('out'), dbUrl = arg('url'), dbKey = arg('key');
if (!outDir || !dbUrl || !dbKey) { console.error('kullanım: --out <dizin> --url <URL> --key <ANON>'); process.exit(2); }

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

// 1) Keşif — kategori sayfası + arama uçları. DİKKAT: arama sorgu başına sonucu
// SINIRLIYOR (ölçüldü 08-21: 6M061U/6M06MF/6M06HX yalnız "DD 10"/"DD 12" sorgusunda
// çıktı) → DD boyut-bazlı sorgularla taranır.
const DISCOVERY = [
  `${BASE}/nicotra-gebhardt-fanlar`,
  `${BASE}/search?q=ADH`, `${BASE}/search?q=RDH`, `${BASE}/search?q=akuple`,
  `${BASE}/search?q=DD`, `${BASE}/search?q=DD%207`, `${BASE}/search?q=DD%209`,
  `${BASE}/search?q=DD%2010`, `${BASE}/search?q=DD%2012`,
];
const slugs = new Set();
for (const u of DISCOVERY) {
  const html = await (await politeFetch(u)).text();
  for (const m of html.matchAll(/href="(nicotra-gebhardt-(?:at|adh|rdh|dd)-[^"]+)"/gi)) slugs.add(m[1]);
}
console.log(`kesif: ${slugs.size} slug`);

// 2) DB Nicotra ürünleri (public SELECT, anon)
const res = await fetch(`${dbUrl}/rest/v1/products?select=id,name,sku,tenant_id&brand=ilike.*nicotra*&deleted_at=is.null`, {
  headers: { apikey: dbKey, authorization: `Bearer ${dbKey}` } });
if (!res.ok) { console.error('DB okuma hatasi', res.status); process.exit(1); }
const rows = await res.json();
console.log(`db: ${rows.length} Nicotra sku`);
const tenants = new Set(rows.map(r => r.tenant_id));
if (tenants.size !== 1) { console.error('tenant tekil degil'); process.exit(1); }

// Eşleme anahtarları
// slug: nicotra-gebhardt-<model...>-cift-emisli-radyal-fan | -direkt-akuple-motorlu-fan-<kod>
const slugKey = (s) => s
  .replace(/^nicotra-gebhardt-/, '')
  .replace(/-cift-emisli-radyal-fan$/, '')
  .replace(/-direkt-akuple-motorlu-fan-[a-z0-9]+$/, '');
// DB adı: "AT 10/10" | "ADH-200 E2" | "DD 10/10 373W 1F 4P 1V - 6M0627" (kod atılır)
const nameKey = (n) => n
  .replace(/\s*-\s*[A-Z0-9]{6}\s*$/i, '')   // DD sipariş kodu
  .replace(/\*/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const bySlugKey = new Map([...slugs].map(s => [slugKey(s), s]));

// 3) Eşle + indir + webp
const { default: sharp } = await import('sharp');
const state = { tenant_id: [...tenants][0], products: {}, unmatched: [], download_errors: [] };
const imageCache = new Map(); // kaynak URL -> yerel webp (seri fotoğrafı paylaşılır)
for (const r of rows.sort((a, b) => a.name.localeCompare(b.name))) {
  const key = nameKey(r.name);
  const slug = bySlugKey.get(key);
  if (!slug) { state.unmatched.push({ sku: r.sku, name: r.name, reason: 'avensair-da eslesme yok - Recep karari: vekil foto YOK' }); continue; }
  let html;
  try { html = await (await politeFetch(`${BASE}/${slug}`)).text(); }
  catch (e) { state.download_errors.push({ sku: r.sku, slug, error: String(e.message) }); continue; }
  // carousel içindeki ürün görselleri (fancybox thumbnail); tablo sekmeleri hariç
  const srcs = [...html.matchAll(/<img src="(https?:\/\/www\.avensair\.com\/uploads\/[^"]+\.(?:png|jpe?g|webp))"[^>]*class="thumbnail fancybox"/gi)]
    .map(m => m[1]);
  if (!srcs.length) { state.unmatched.push({ sku: r.sku, name: r.name, reason: `sayfada carousel gorseli yok (${slug})` }); continue; }
  const images = [];
  for (let i = 0; i < srcs.length; i++) {
    const src = srcs[i];
    let webpFile = imageCache.get(src);
    if (!webpFile) {
      const dlDir = path.join(outDir, 'nicotra', key.replace(/-/g, '_'));
      fs.mkdirSync(dlDir, { recursive: true });
      const orig = path.join(dlDir, `${String(i).padStart(2, '0')}${path.extname(new URL(src).pathname) || '.png'}`);
      try {
        if (!fs.existsSync(orig)) {
          console.log(`[download] ${r.name} #${i}`);
          fs.writeFileSync(orig, Buffer.from(await (await politeFetch(src)).arrayBuffer()));
        }
        webpFile = orig.replace(/\.[a-z]+$/i, '.webp');
        if (!fs.existsSync(webpFile)) {
          await sharp(orig).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(webpFile);
        }
        imageCache.set(src, webpFile);
      } catch (e) { state.download_errors.push({ sku: r.sku, src, error: String(e.message) }); continue; }
    }
    images.push({
      sort_order: i, kind: 'gallery', source_url: src, webp_file: webpFile,
      alt: `${r.name} – ${r.sku} – ${i + 1}`,
      storage_path: `${state.tenant_id}/${r.id}/${String(i).padStart(2, '0')}.webp`,
    });
  }
  if (images.length) state.products[r.sku] = { model_code: r.sku, product_id: r.id, name: r.name, slug, images };
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 't139-manifest.json'), JSON.stringify(state, null, 2));
console.log(`bitti — yuklenecek sku: ${Object.keys(state.products).length}, eslesmeyenler (Recep karari): ${state.unmatched.length}, indirme hatasi: ${state.download_errors.length}, benzersiz gorsel: ${imageCache.size}`);
state.unmatched.forEach(u => console.log(`  [eslesmedi] ${u.sku} ${u.name} — ${u.reason}`));
state.download_errors.forEach(d => console.log(`  [hata] ${d.sku} ${d.error}`));
console.log(`manifest: ${path.join(outDir, 't139-manifest.json')}`);
