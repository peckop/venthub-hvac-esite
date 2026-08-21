#!/usr/bin/env node
/**
 * AVenS — avensair.com (kendi markamız) görselleri: kategori keşfi + eşleme + indirme + webp.
 * Recep talimatı (2026-08-21 14:28+): "daha avense ait bir sürü ürün resmi eklenmemiş" +
 * kategori URL'leri verdi. Eşleşmeyen YÜKLENMEZ, fail-visible listeye düşer.
 *
 * Keşif: kategori sayfaları statik HTML + "Daha Fazla" JSON ucu (aynı URL ?offset=9,18...
 * + sayfadaki _token; response {products:[html], end:bool}) — statik HTML tam liste DEĞİL.
 * Havuz: (slug, title) çiftleri — ürün kartındaki <a href="slug" title="BAŞLIK">.
 * Eşleme: DB adı ↔ site başlığı normalize birebir; olmazsa token-alt-küme (DB adının
 * anlamlı token'ları başlıkta tam geçiyorsa ve TEK aday ise). Çok aday = fail-visible.
 *
 * Kullanım:
 *   node scripts/media/avensair-avens-run.mjs --out <dizin> --url <SUPABASE_URL> --key <ANON_KEY>
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
async function politeFetch(url, extra = {}) {
  const wait = last + DELAY_MS - Date.now();
  if (wait > 0) await sleep(wait);
  last = Date.now();
  const res = await fetch(url, { headers: { 'user-agent': UA, ...extra } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

// TR aksan + noktalama normalize (İ/ı/Ş/Ğ/Ü/Ö/Ç; virgüllü ondalık nokta olur)
const norm = (s) => s
  .replace(/İ/g, 'I').replace(/ı/g, 'i').replace(/Ş/g, 'S').replace(/ş/g, 's')
  .replace(/Ğ/g, 'G').replace(/ğ/g, 'g').replace(/Ü/g, 'U').replace(/ü/g, 'u')
  .replace(/Ö/g, 'O').replace(/ö/g, 'o').replace(/Ç/g, 'C').replace(/ç/g, 'c')
  .toUpperCase()
  .replace(/(\d),(\d)/g, '$1.$2')      // 2,5 -> 2.5
  .replace(/[^A-Z0-9./ ]+/g, ' ')
  .replace(/\s+/g, ' ').trim();

// 1) Keşif — kategoriler: statik HTML + Daha Fazla JSON ucu
const CATEGORIES = [
  'siginak-havalandirma-fanlari', 'konut-tipi', 'ticari-tip',           // Recep'in verdikleri
  'cati-tipi-fanlar', 'duman-egzoz-fanlari', 'kanal-tipi-fanlar',
  'sessiz-kanal-tipi-fanlar', 'duvar-tipi-kompakt-aksiyal-fanlar',
  'basinclandirma-fanlari', 'plug-fanlar', 'santrifuj-fanlar',
  'otopark-jet-fanlari', 'ortam-havali', 'konut-tipi-fanlar',
  'elektrikli-isiticili', 'hiz-anahtari', 'gemici-anemostadi',
  'ex-proof-fanlar-patlama-karsi-atex-fanlar',
];
const pool = new Map(); // slug -> title
const cardExtract = (html) => {
  for (const m of html.matchAll(/<a href="([a-z0-9-]+)" title="([^"]+)"/g)) {
    if (!CATEGORIES.includes(m[1])) pool.set(m[1], m[2]);
  }
};
for (const cat of CATEGORIES) {
  let html;
  try { html = await (await politeFetch(`${BASE}/${cat}`)).text(); }
  catch (e) { console.log(`[kategori-hata] ${cat}: ${e.message}`); continue; }
  cardExtract(html);
  const token = html.match(/_token: "([^"]+)"/)?.[1];
  if (!token || !/moreBut/.test(html)) continue;
  for (let offset = 9; offset < 200; offset += 9) {
    let j;
    try {
      j = await (await politeFetch(`${BASE}/${cat}?_token=${encodeURIComponent(token)}&offset=${offset}`,
        { accept: 'application/json', 'x-requested-with': 'XMLHttpRequest' })).json();
    } catch { break; }
    for (const p of j.products || []) cardExtract(p);
    if (j.end || !(j.products || []).length) break;
  }
  console.log(`[kategori] ${cat} -> havuz ${pool.size}`);
}
console.log(`kesif: ${pool.size} urun karti (slug+baslik)`);

// 2) DB AVenS ürünleri
const res = await fetch(`${dbUrl}/rest/v1/products?select=id,name,sku,tenant_id&brand=ilike.*avens*&deleted_at=is.null`, {
  headers: { apikey: dbKey, authorization: `Bearer ${dbKey}` } });
if (!res.ok) { console.error('DB okuma hatasi', res.status); process.exit(1); }
const rows = await res.json();
console.log(`db: ${rows.length} AVenS sku`);
const tenants = new Set(rows.map(r => r.tenant_id));
if (tenants.size !== 1) { console.error('tenant tekil degil'); process.exit(1); }

const byTitle = new Map([...pool].map(([slug, title]) => [norm(title), slug]));

// Elle-ölçülmüş eşlemeler (08-21): model adı birebir, yalnız ek/tekil-çoğul farkı
// otomatik eşlemeyi kaçırtıyor ("CİHAZI" vs "CİHAZLARI"; BVU'da DB adında fazladan watt).
const MANUAL = new Map([
  ['AVE-13010', 'aluminyum-esanjorlu-isi-geri-kazanim-cihazlari-avens-750'],
  ['AVE-13011', 'aluminyum-esanjorlu-isi-geri-kazanim-cihazlari-avens-1000'],
  ['AVE-13013', 'aluminyum-esanjorlu-isi-geri-kazanim-cihazlari-avens-2000'],
  ['AVE-30100', 'bvu-1000-siginak-havalandirma-unitesi-1200-m-h'],
  ['AVE-30101', 'bvu-2000-siginak-havalandirma-unitesi-2000-m-h'],
  ['AVE-30102', 'bvu-3000-siginak-havalandirma-unitesi-3200-m-h'],
]);

// Eşleme: birebir; olmazsa DB-token alt-kümesi TEK adayda
function matchSlug(name, sku) {
  if (MANUAL.has(sku)) return { slug: MANUAL.get(sku), how: 'elle-olculmus' };
  const n = norm(name);
  if (byTitle.has(n)) return { slug: byTitle.get(n), how: 'birebir' };
  const toks = n.split(' ').filter(t => t.length > 1);
  const cands = [...pool].filter(([, title]) => {
    const tn = ` ${norm(title)} `;
    return toks.every(t => tn.includes(` ${t} `));
  });
  if (cands.length === 1) return { slug: cands[0][0], how: `token-altkume (${cands[0][1]})` };
  if (cands.length > 1) return { multi: cands.map(c => c[0]) };
  return null;
}

// 3) Eşle + indir + webp
const { default: sharp } = await import('sharp');
const state = { tenant_id: [...tenants][0], products: {}, unmatched: [], download_errors: [] };
const imageCache = new Map();
for (const r of rows.sort((a, b) => a.name.localeCompare(b.name))) {
  const hit = matchSlug(r.name, r.sku);
  if (!hit || !hit.slug) {
    state.unmatched.push({ sku: r.sku, name: r.name,
      reason: hit?.multi ? `COK aday: ${hit.multi.join(', ')}` : 'eslesme yok (kesif havuzu + token)' });
    continue;
  }
  let html;
  try { html = await (await politeFetch(`${BASE}/${hit.slug}`)).text(); }
  catch (e) { state.download_errors.push({ sku: r.sku, slug: hit.slug, error: String(e.message) }); continue; }
  const srcs = [...html.matchAll(/<img src="(https?:\/\/www\.avensair\.com\/uploads\/[^"]+\.(?:png|jpe?g|webp))"[^>]*class="thumbnail fancybox"/gi)].map(m => m[1]);
  if (!srcs.length) { state.unmatched.push({ sku: r.sku, name: r.name, reason: `sayfada carousel gorseli yok (${hit.slug})` }); continue; }
  const images = [];
  for (let i = 0; i < srcs.length; i++) {
    const src = srcs[i];
    let webpFile = imageCache.get(src);
    if (!webpFile) {
      const dlDir = path.join(outDir, 'avens', hit.slug.replace(/-/g, '_').slice(0, 60));
      fs.mkdirSync(dlDir, { recursive: true });
      const orig = path.join(dlDir, `${String(i).padStart(2, '0')}${path.extname(new URL(src).pathname) || '.jpg'}`);
      try {
        if (!fs.existsSync(orig)) {
          console.log(`[download] ${r.name} #${i} (${hit.how})`);
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
  if (images.length) state.products[r.sku] = { model_code: r.sku, product_id: r.id, name: r.name, slug: hit.slug, match: hit.how, images };
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 't139-manifest.json'), JSON.stringify(state, null, 2));
fs.writeFileSync(path.join(outDir, 'kesif-havuzu.json'), JSON.stringify([...pool], null, 2));
console.log(`bitti — yuklenecek sku: ${Object.keys(state.products).length}, eslesmeyenler: ${state.unmatched.length}, hata: ${state.download_errors.length}, benzersiz gorsel: ${imageCache.size}`);
state.unmatched.forEach(u => console.log(`  [eslesmedi] ${u.sku} ${u.name} — ${u.reason}`));
state.download_errors.forEach(d => console.log(`  [hata] ${d.sku} ${d.error}`));
console.log(`manifest: ${path.join(outDir, 't139-manifest.json')}`);
