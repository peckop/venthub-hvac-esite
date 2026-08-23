#!/usr/bin/env node
/**
 * DANFOSS FC-101 — Recep talimatı (2026-08-21 ~14:50, iki URL vererek):
 * "bu 2 fotoyu da koyalım ama danfossun kendisi kapak olsun"
 *  kapak (sort_order 0) = danfoss.com resmi FC-101 fotoğrafı (og:image, 1120x747)
 *  sort_order 1+        = avensair.com DanfossFrekansInventorleri ürün sayfası carousel'i
 * Kapsam: FC-101 ailesi (Recep'in verdiği danfoss.com sayfası FC-101). FC102 ve FC-51
 * avensair'da YOK ve verilen resmi sayfa onların değil → fail-visible listeye.
 *
 * Kullanım: node scripts/media/danfoss-fc101-run.mjs --out <dizin> --url <URL> --key <ANON>
 */
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://www.avensair.com';
const DANFOSS_IMG = 'https://www.danfoss.com/media/7655/fc101-basic-120x747.jpg';
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

// avensair FC101 slug'ları (08-21 offset taramasıyla ölçüldü, 17 adet)
const SLUGS = ['fc101pk75-0-75kw','fc101p1k5-1-5kw','fc101p2k2-2-2kw','fc101p3k0-3kw','fc101p4k0-4kw',
  'fc101p5k5-5-5kw','fc101p7k5-7-5kw','fc101p11k-11kw','fc101p15k-15-kw','fc101p18k-18-5kw',
  'fc101p22k-22kw','fc101p30k-30kw','fc101p37k-37kw','fc101p45k-45kw','fc101p55k-55kw',
  'fc101p75k-75kw','fc101p90k-90kw'].map(s => ['danfoss-' + s, s.match(/^fc101(p[k0-9]+)/)[1]]);
const byPcode = new Map(SLUGS.map(([slug, p]) => [p, slug]));
const KW_TO_P = { '0.75':'pk75','1.1':'p1k1','1.5':'p1k5','2.2':'p2k2','3':'p3k0','4':'p4k0','5.5':'p5k5',
  '7.5':'p7k5','11':'p11k','15':'p15k','18.5':'p18k','22':'p22k','30':'p30k','37':'p37k','45':'p45k',
  '55':'p55k','75':'p75k','90':'p90k' };

// DB Danfoss ürünleri
const res = await fetch(`${dbUrl}/rest/v1/products?select=id,name,sku,tenant_id&brand=ilike.*danfoss*&deleted_at=is.null`, {
  headers: { apikey: dbKey, authorization: `Bearer ${dbKey}` } });
const rows = await res.json();
console.log(`db: ${rows.length} Danfoss sku`);
const tenants = new Set(rows.map(r => r.tenant_id));
if (tenants.size !== 1) { console.error('tenant tekil degil'); process.exit(1); }

function matchSlug(name) {
  const p = name.match(/FC101(P[K0-9]+)/i)?.[1]?.toLowerCase();   // FC101P11K biçimi
  if (p && byPcode.has(p)) return byPcode.get(p);
  if (/FC\s?-?\s?101/i.test(name)) {                              // "FC-101 - 380V - 1,5kW" biçimi
    const kw = name.match(/([\d.,]+)\s*kw/i)?.[1]?.replace(',', '.');
    const pk = kw && KW_TO_P[kw.replace(/\.0$/, '')];
    if (pk && byPcode.has(pk)) return byPcode.get(pk);
  }
  return null;
}

const { default: sharp } = await import('sharp');
fs.mkdirSync(path.join(outDir, 'danfoss'), { recursive: true });

// Kapak: danfoss.com resmi fotoğraf (tek indirme, tüm ürünlere)
const coverOrig = path.join(outDir, 'danfoss', 'fc101-danfoss.jpg');
if (!fs.existsSync(coverOrig)) {
  fs.writeFileSync(coverOrig, Buffer.from(await (await politeFetch(DANFOSS_IMG)).arrayBuffer()));
}
const coverWebp = coverOrig.replace(/\.jpg$/, '.webp');
if (!fs.existsSync(coverWebp)) {
  await sharp(coverOrig).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(coverWebp);
}

const state = { tenant_id: [...tenants][0], products: {}, unmatched: [], download_errors: [] };
const imageCache = new Map();
for (const r of rows.sort((a, b) => a.name.localeCompare(b.name))) {
  const slug = matchSlug(r.name);
  if (!slug) {
    state.unmatched.push({ sku: r.sku, name: r.name, reason: 'FC-101 ailesi disi (FC102/FC-51) veya kW eslesmedi - avensair listesinde yok' });
    continue;
  }
  const images = [{
    sort_order: 0, kind: 'gallery', source_url: `${DANFOSS_IMG} (Recep karari 08-21: danfoss.com kapak)`,
    webp_file: coverWebp, alt: `${r.name} – ${r.sku} – 1`,
    storage_path: `${state.tenant_id}/${r.id}/00.webp`,
  }];
  let html;
  try { html = await (await politeFetch(`${BASE}/${slug}`)).text(); }
  catch (e) { state.download_errors.push({ sku: r.sku, slug, error: String(e.message) }); }
  if (html) {
    const srcs = [...html.matchAll(/<img src="(https?:\/\/www\.avensair\.com\/uploads\/[^"]+\.(?:png|jpe?g|webp))"[^>]*class="thumbnail fancybox"/gi)].map(m => m[1]);
    for (let i = 0; i < srcs.length; i++) {
      const src = srcs[i];
      let webpFile = imageCache.get(src);
      if (!webpFile) {
        const dlDir = path.join(outDir, 'danfoss', slug.replace(/-/g, '_'));
        fs.mkdirSync(dlDir, { recursive: true });
        const orig = path.join(dlDir, `av${String(i).padStart(2, '0')}${path.extname(new URL(src).pathname) || '.jpg'}`);
        try {
          if (!fs.existsSync(orig)) {
            console.log(`[download] ${r.name} avensair #${i}`);
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
        sort_order: i + 1, kind: 'gallery', source_url: src, webp_file: webpFile,
        alt: `${r.name} – ${r.sku} – ${i + 2}`,
        storage_path: `${state.tenant_id}/${r.id}/${String(i + 1).padStart(2, '0')}.webp`,
      });
    }
  }
  state.products[r.sku] = { model_code: r.sku, product_id: r.id, name: r.name, slug, images };
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 't139-manifest.json'), JSON.stringify(state, null, 2));
console.log(`bitti — yuklenecek sku: ${Object.keys(state.products).length}, eslesmeyenler: ${state.unmatched.length}, hata: ${state.download_errors.length}`);
state.unmatched.forEach(u => console.log(`  [eslesmedi] ${u.sku} ${u.name} — ${u.reason}`));
console.log(`manifest: ${path.join(outDir, 't139-manifest.json')}`);
