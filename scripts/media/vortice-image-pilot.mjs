#!/usr/bin/env node
/**
 * T139-VH — Vortice ürün görseli pilotu: keşif + indirme + webp dönüşüm.
 *
 * Kısıtlar (OPS-AUDIT dört şartı, 2026-08-21):
 *  - vortice.com'a istekler SIRALI; her istek arası >= DELAY_MS bekleme; paralel YOK.
 *  - Dürüst User-Agent.
 *  - Boyut varyantı ÜRETİLMEZ: ürün görseli başına tek webp; küçük boylar
 *    Supabase transform / next/image katmanının işi.
 *  - Her indirilen/üretilen dosya manifest'e yazılır (geri-alma envanteri).
 *
 * Kullanım:
 *   node scripts/media/vortice-image-pilot.mjs --manifest scripts/media/t139-pilot.json \
 *     --out <cikti-dizini> [--stage discover|download|convert|all]
 *
 * Çıktı: <out>/t139-manifest.json + <out>/<code>/original/* + <out>/<code>/webp/*
 * Yükleme (ADIM-4) AYRI betiktir; bu betik prod'a hiçbir şey yazmaz.
 */
import fs from 'node:fs';
import path from 'node:path';

const DELAY_MS = 1500;
const UA = 'VentHub-image-pilot/0.1 (HVAC distributor catalog import; single sequential pilot run)';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

const manifestPath = arg('manifest');
const outDir = arg('out');
const stage = arg('stage', 'all');
if (!manifestPath || !outDir) {
  console.error('kullanım: --manifest <json> --out <dizin> [--stage discover|download|convert|all]');
  process.exit(2);
}

const pilot = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const statePath = path.join(outDir, 't139-manifest.json');
const state = fs.existsSync(statePath)
  ? JSON.parse(fs.readFileSync(statePath, 'utf8'))
  : { tenant_id: pilot.tenant_id, products: {} };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastRequestAt = 0;
async function politeFetch(url) {
  const wait = lastRequestAt + DELAY_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

/**
 * Sayfa HTML'inden media2 görsel URL'lerini sınıflandırarak çıkar.
 * Ölçülmüş gerçekler (17160 ham HTML, 2026-08-21):
 *  - URL'ler çoğunlukla GÖRELİ (/media2/...) ve yol ayracı TERS-BÖLÜ olabilir.
 *  - Sayfada aksesuar görselleri de var (/media2/Matele/, kendi kodlarıyla) —
 *    ürüne ait olanlar dosya adında _<model_code>_ taşır; onunla filtrelenir.
 */
function extractImages(html, modelCode) {
  const re = /(?:https?:\/\/(?:www\.)?vortice\.com)?\/media2\/[^"'\s)]+?\.(?:png|jpe?g)/gi;
  const seen = new Set();
  const urls = [];
  for (const m of html.matchAll(re)) {
    const normalized = m[0].replace(/\\/g, '/');
    const abs = normalized.startsWith('http') ? normalized : `https://www.vortice.com${normalized}`;
    if (!abs.includes(`_${modelCode}_`)) continue; // aksesuar/banner değil, bu ürünün dosyası
    if (!seen.has(abs)) { seen.add(abs); urls.push(abs); }
  }
  const cls = (u) =>
    /ambiente/i.test(u) ? 'environment'
    : /Foto_WEB/i.test(u) ? 'gallery'
    : /Foto_Pubblicita|Documenti_Curve|quota|Curv/i.test(u) ? 'technical'
    : 'other';
  // sıra: galeri (kapak=ilk), ortam, teknik; 'other' alınmaz (logo/banner riski)
  const order = { gallery: 0, environment: 1, technical: 2 };
  return urls
    .map((u) => ({ url: u, kind: cls(u) }))
    .filter((x) => x.kind !== 'other')
    .sort((a, b) => order[a.kind] - order[b.kind] || a.url.localeCompare(b.url));
}

function save() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

async function discover() {
  for (const p of pilot.pilots) {
    console.log(`[discover] ${p.model_code} ${p.page_url}`);
    const html = await (await politeFetch(p.page_url)).text();
    const images = extractImages(html, p.model_code);
    if (images.length === 0) throw new Error(`gorsel bulunamadi: ${p.model_code} — sayfa yapisi degismis olabilir, HTML elle incelenmeli`);
    state.products[p.model_code] = {
      ...p,
      images: images.map((img, i) => ({
        sort_order: i,
        kind: img.kind,
        source_url: img.url,
        alt: `${p.name} – ${p.model_code} – ${i + 1}`,
      })),
    };
    console.log(`  -> ${images.length} gorsel (${images.filter(i=>i.kind==='gallery').length} galeri / ${images.filter(i=>i.kind==='environment').length} ortam / ${images.filter(i=>i.kind==='technical').length} teknik)`);
    save();
  }
}

async function download() {
  for (const [code, prod] of Object.entries(state.products)) {
    const dir = path.join(outDir, code, 'original');
    fs.mkdirSync(dir, { recursive: true });
    for (const img of prod.images) {
      const ext = path.extname(new URL(img.source_url).pathname).toLowerCase();
      const file = path.join(dir, `${String(img.sort_order).padStart(2, '0')}${ext}`);
      if (fs.existsSync(file) && fs.statSync(file).size > 0) { img.original_file = file; continue; }
      console.log(`[download] ${code}#${img.sort_order} ${img.source_url}`);
      try {
        const buf = Buffer.from(await (await politeFetch(img.source_url)).arrayBuffer());
        fs.writeFileSync(file, buf);
        img.original_file = file;
        img.original_bytes = buf.length;
      } catch (e) {
        // Tek görselin ölü linki koşuyu ÖLDÜRMEZ; sessiz de düşmez — manifest'e adıyla yazılır.
        img.download_error = String(e.message || e);
        console.log(`  !! INDIRILEMEDI (kayda gecti): ${img.download_error}`);
      }
      save();
    }
  }
}

async function convert() {
  const { default: sharp } = await import('sharp');
  for (const [code, prod] of Object.entries(state.products)) {
    const dir = path.join(outDir, code, 'webp');
    fs.mkdirSync(dir, { recursive: true });
    for (const img of prod.images) {
      if (!img.original_file) { console.log(`[convert] ${code}#${img.sort_order} ATLANDI (indirilememisti)`); continue; }
      const file = path.join(dir, `${String(img.sort_order).padStart(2, '0')}.webp`);
      // Tek varyant: genişlik tavanı 1600px (büyütme yok), kalite 82 — şart (2).
      const out = await sharp(img.original_file)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(file);
      img.webp_file = file;
      img.webp_bytes = out.size;
      img.storage_path = `${state.tenant_id}/${prod.product_id}/${String(img.sort_order).padStart(2, '0')}.webp`;
      console.log(`[convert] ${code}#${img.sort_order} ${img.original_bytes ?? '?'}B -> ${out.size}B`);
      save();
    }
  }
}

const stages = { discover, download, convert };
if (stage === 'all') {
  await discover(); await download(); await convert();
} else if (stages[stage]) {
  await stages[stage]();
} else {
  console.error(`bilinmeyen stage: ${stage}`);
  process.exit(2);
}
console.log(`bitti — manifest: ${statePath}`);
