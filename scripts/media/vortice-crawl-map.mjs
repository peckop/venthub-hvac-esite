#!/usr/bin/env node
/**
 * T139-OLCEK hazırlık — vortice.com kategori ağacını NAZİK gezerek
 * model_code -> ürün sayfası URL haritası çıkarır. PROD'A YAZMAZ.
 *
 * Yöntem (ölçüme dayalı, 2026-08-21): site haritası yalnız statik sayfalar
 * taşıyor; kategori listeleme sayfaları ürün linklerini (/.../<5-hane>) taşıyor;
 * robots.txt tüm siteye Allow veriyor (yalnız /DownloadPDF.cshtml kapalı).
 * Kısıtlar: SIRALI, istek arası >= 1.5sn, dürüst UA, sayfa tavanı (varsayılan 400).
 *
 * Kullanım:
 *   node scripts/media/vortice-crawl-map.mjs --codes <kod-listesi.txt> --out <dizin> [--max-pages 400]
 * Çıktı: <out>/vortice-url-map.json  { found: {kod: url}, missing: [kod], crawled: N }
 */
import fs from 'node:fs';
import path from 'node:path';

const DELAY_MS = 1500;
const UA = 'VentHub-image-pilot/0.1 (HVAC distributor catalog import; sequential polite crawl)';
const ORIGIN = 'https://www.vortice.com';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}
const codesPath = arg('codes');
const outDir = arg('out');
const maxPages = Number(arg('max-pages', '400'));
if (!codesPath || !outDir) { console.error('kullanım: --codes <txt> --out <dizin> [--max-pages N]'); process.exit(2); }

const wanted = new Set(fs.readFileSync(codesPath, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(s => /^[0-9]{5}$/.test(s)));
console.log(`aranan kod: ${wanted.size}`);

// Statik/sayfa-dışı yollar (sitemap_EN ölçümünden) — kuyruğa girmez.
// NOT: /en/families BURAYA GIRMEZ — o kategori ağacının TOHUMU (ilk koşuda bu
// hatayla 0 sayfa gezildi: tohum kendi kara-listeme takıldı).
const SKIP = /(cookie|privacy|login|register|newsletter|unsubscribe|contact|catalogues|after-sales|become_a|find_|trova_|download|footer_|sitemap|products_search|prodotto$|accessorio$|designer|wholesale|the_history|instruction_booklet)/i;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let last = 0;
async function politeFetch(url) {
  const wait = last + DELAY_MS - Date.now();
  if (wait > 0) await sleep(wait);
  last = Date.now();
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.text();
}

const found = {};            // kod -> tam URL
const queued = new Set();    // kuyruğa girmiş kategori yolları
const queue = [];
function enqueue(p) {
  if (queued.has(p) || SKIP.test(p)) return;
  const depth = p.split('/').filter(Boolean).length; // en/a/b/c -> 4
  if (depth < 2 || depth > 5) return;
  queued.add(p); queue.push(p);
}
// Tohumlar filtreden muaf — kuyruğa doğrudan girer.
for (const seed of ['/en/families', '/en']) { queued.add(seed); queue.push(seed); }

let crawled = 0;
while (queue.length && crawled < maxPages && Object.keys(found).length < wanted.size) {
  const p = queue.shift();
  let html;
  try { html = await politeFetch(ORIGIN + p); }
  catch (e) { console.log(`  !! ${p}: ${e.message}`); crawled++; continue; }
  crawled++;
  for (const m of html.matchAll(/href="(\/en\/[a-z0-9_\-\/%]+)"/gi)) {
    const href = m[1].replace(/\/+$/, '');
    const tail = href.split('/').pop();
    if (/^[0-9]{5}$/.test(tail)) {
      if (wanted.has(tail) && !found[tail]) {
        found[tail] = ORIGIN + href;
      }
    } else {
      enqueue(href);
    }
  }
  if (crawled % 20 === 0) console.log(`sayfa ${crawled} | bulunan ${Object.keys(found).length}/${wanted.size} | kuyruk ${queue.length}`);
}

const missing = [...wanted].filter(c => !found[c]).sort();
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'vortice-url-map.json');
fs.writeFileSync(outPath, JSON.stringify({ crawled, found, missing }, null, 2));
console.log(`bitti — sayfa: ${crawled}, bulunan: ${Object.keys(found).length}/${wanted.size}, eksik: ${missing.length}`);
console.log(`harita: ${outPath}`);
