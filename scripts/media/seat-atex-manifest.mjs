#!/usr/bin/env node
/**
 * SEAT ATEX eki — Recep kararı (2026-08-21 öğleden sonra): SEAT sitesinde ATEX modeller
 * için de AYNI fotoğraf kullanılıyor (Recep kendisi inceledi ve onayladı) → ATEX SKU'larına
 * BAZ modelin (adından ' ATEX' atılmış halinin) görselleri bağlanır.
 * Kapsam: yalnız ' ATEX' son ekli adlar. 'STORM 10 XRM (*)' KAPSAM DIŞI (ayrı türev, karar yok).
 *
 * Girdi: media-seat kosumunun indirdiği yerel webp'ler + unmatched listesi.
 * Çıktı: <out-atex>/t139-manifest.json (upload-pilot-images.mjs şeması).
 *
 * Kullanım: node seat-atex-manifest.mjs --seat-out <media-seat> --out <media-seat-atex> --url <URL> --key <ANON>
 */
import fs from 'node:fs';
import path from 'node:path';

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const seatOut = arg('seat-out'), outDir = arg('out'), dbUrl = arg('url'), dbKey = arg('key');
const norm = (s) => s.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const seatState = JSON.parse(fs.readFileSync(path.join(seatOut, 't139-manifest.json'), 'utf8'));
const atex = seatState.unmatched.filter(u => / ATEX$/i.test(u.name.trim()));
console.log(`atex aday: ${atex.length} (unmatched ${seatState.unmatched.length} icinden; XRM kapsam disi)`);

// SKU -> product_id/tenant için DB
const res = await fetch(`${dbUrl}/rest/v1/products?select=id,name,sku,tenant_id&brand=eq.SEAT&deleted_at=is.null`, {
  headers: { apikey: dbKey, authorization: `Bearer ${dbKey}` } });
const rows = await res.json();
const bySku = new Map(rows.map(r => [r.sku, r]));

const state = { tenant_id: seatState.tenant_id, products: {}, skipped: [] };
for (const u of atex) {
  const r = bySku.get(u.sku);
  const baseName = u.name.replace(/ ATEX$/i, '').trim();
  const modelDir = path.join(seatOut, 'seat', norm(baseName).replace(/ /g, '_'));
  if (!r || !fs.existsSync(modelDir)) { state.skipped.push({ sku: u.sku, name: u.name, reason: 'baz model klasoru yok' }); continue; }
  const webps = fs.readdirSync(modelDir).filter(f => f.endsWith('.webp')).sort();
  if (!webps.length) { state.skipped.push({ sku: u.sku, name: u.name, reason: 'baz webp yok' }); continue; }
  state.products[r.sku] = {
    model_code: r.sku, product_id: r.id, name: r.name,
    images: webps.map((f, i) => ({
      sort_order: i, kind: 'gallery',
      source_url: `baz-model:${baseName} (Recep karari 08-21: ATEX ayni foto)`,
      webp_file: path.join(modelDir, f),
      alt: `${r.name} – ${r.sku} – ${i + 1}`,
      storage_path: `${state.tenant_id}/${r.id}/${String(i).padStart(2, '0')}.webp`,
    })),
  };
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 't139-manifest.json'), JSON.stringify(state, null, 2));
console.log(`manifest: ${Object.keys(state.products).length} sku, atlanan: ${state.skipped.length}`);
