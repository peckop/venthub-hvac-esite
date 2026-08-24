#!/usr/bin/env node
/**
 * DANFOSS FC-102 eki — Recep talimatı (2026-08-21 ~15:15, URL vererek):
 * danfoss.com VLT HVAC Drive FC-102 sayfasının fotoğrafı FC102 SKU'larına kapak olur.
 * (FC-101 kalıbının devamı; avensair'da FC102 ürünü YOK → tek görsel: resmi foto.)
 * Kaynak: https://www.danfoss.com/en-us/products/dds/low-voltage-drives/vlt-drives/vlt-hvac-drive-fc-102/
 * og:image (1120x747) önceden indirilmiş olmalı: <out>/fc102-danfoss.jpg
 *
 * Kullanım: node danfoss-fc102-fill-manifest.mjs --out <media-danfoss-fc102> --img <fc102-danfoss.jpg> --url <URL> --key <ANON>
 */
import fs from 'node:fs';
import path from 'node:path';

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const outDir = arg('out'), imgFile = arg('img'), dbUrl = arg('url'), dbKey = arg('key');
const SOURCE = 'https://www.danfoss.com/media/t5xdo2rv/untitled-1.jpg (vlt-hvac-drive-fc-102 og:image; Recep karari 08-21: danfoss.com kapak)';
if (!outDir || !imgFile || !dbUrl || !dbKey) { console.error('kullanım: --out --img --url --key'); process.exit(2); }
if (!fs.existsSync(imgFile)) { console.error('kaynak jpg yok: ' + imgFile); process.exit(1); }

const res = await fetch(`${dbUrl}/rest/v1/products?select=id,name,sku,tenant_id&brand=ilike.*danfoss*&deleted_at=is.null&name=like.FC102*`, {
  headers: { apikey: dbKey, authorization: `Bearer ${dbKey}` } });
const rows = await res.json();
console.log(`db FC102: ${rows.length} sku`);
if (!rows.length) process.exit(1);

const { default: sharp } = await import('sharp');
fs.mkdirSync(outDir, { recursive: true });
const webp = path.join(outDir, 'fc102-danfoss.webp');
if (!fs.existsSync(webp)) {
  await sharp(imgFile).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(webp);
}

const state = { tenant_id: rows[0].tenant_id, products: {} };
for (const r of rows) {
  state.products[r.sku] = {
    model_code: r.sku, product_id: r.id, name: r.name,
    images: [{
      sort_order: 0, kind: 'gallery', source_url: SOURCE, webp_file: webp,
      alt: `${r.name} – ${r.sku} – 1`,
      storage_path: `${rows[0].tenant_id}/${r.id}/00.webp`,
    }],
  };
}
fs.writeFileSync(path.join(outDir, 't139-manifest.json'), JSON.stringify(state, null, 2));
console.log(`manifest: ${Object.keys(state.products).length} sku -> ${path.join(outDir, 't139-manifest.json')}`);
