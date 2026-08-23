#!/usr/bin/env node
/**
 * Nicotra DD eki — Recep kararı (2026-08-21 ~14:20, ekranda URL vererek):
 * avensair'da bulunmayan 2 DD SKU'suna (NIC-11911 DD 9/7 300W, NIC-11912 DD 9/9 373W)
 * DD 7/7 150W sayfasının fotoğrafı bağlanır
 * (kaynak: nicotra-gebhardt-dd-7-7-150w-1f-4p-1v-direkt-akuple-motorlu-fan-610982;
 * sitede tüm DD'ler aynı seri fotoğrafını kullanıyor — SEAT-ATEX kararıyla aynı sınıf).
 *
 * Kullanım: node nicotra-dd-fill-manifest.mjs --nicotra-out <media-nicotra> --out <media-nicotra-dd> --url <URL> --key <ANON>
 */
import fs from 'node:fs';
import path from 'node:path';

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const nicotraOut = arg('nicotra-out'), outDir = arg('out'), dbUrl = arg('url'), dbKey = arg('key');
const SOURCE_SLUG = 'nicotra-gebhardt-dd-7-7-150w-1f-4p-1v-direkt-akuple-motorlu-fan-610982';
const TARGET_SKUS = ['NIC-11911', 'NIC-11912'];

const webp = path.join(nicotraOut, 'nicotra', 'dd_7_7_150w_1f_4p_1v', '00.webp');
if (!fs.existsSync(webp)) { console.error('kaynak webp yok: ' + webp); process.exit(1); }

const res = await fetch(`${dbUrl}/rest/v1/products?select=id,name,sku,tenant_id&sku=in.(${TARGET_SKUS.join(',')})`, {
  headers: { apikey: dbKey, authorization: `Bearer ${dbKey}` } });
const rows = await res.json();
if (rows.length !== TARGET_SKUS.length) { console.error(`beklenen ${TARGET_SKUS.length}, gelen ${rows.length}`); process.exit(1); }

const state = { tenant_id: rows[0].tenant_id, products: {} };
for (const r of rows) {
  state.products[r.sku] = {
    model_code: r.sku, product_id: r.id, name: r.name,
    images: [{
      sort_order: 0, kind: 'gallery',
      source_url: `baz-model:DD 7/7 150W (Recep karari 08-21: DD ayni foto; https://www.avensair.com/${SOURCE_SLUG})`,
      webp_file: webp,
      alt: `${r.name} – ${r.sku} – 1`,
      storage_path: `${rows[0].tenant_id}/${r.id}/00.webp`,
    }],
  };
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 't139-manifest.json'), JSON.stringify(state, null, 2));
console.log(`manifest: ${Object.keys(state.products).length} sku -> ${path.join(outDir, 't139-manifest.json')}`);
