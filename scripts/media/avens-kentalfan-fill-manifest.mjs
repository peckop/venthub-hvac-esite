#!/usr/bin/env node
/**
 * KENTALFAN eki — Recep işareti (2026-08-21 ~15:20, casals.com KENTALROOF URL'siyle
 * "bu mu acaba?"): ölçümle DOĞRULANDI — KENTALFAN, Casals'ın plug fan serisi;
 * fanware seri sayfası casals.com/en/fanware/50/fans/kentalfan 14 varyant listeliyor
 * ve DB'deki 14 KENTALFAN SKU'suyla BİREBİR (315 M4/T2/T4, 355 M4/T4, 400 M4/T4,
 * 450 T4, 500 T4/T6, 560 T4/T6, 630 T4/T6). Varyant sayfaları TEK seri fotoğrafını
 * kullanıyor (series/1049, 700x700; 31206 sayfasında doğrulandı) → hepsine o bağlanır.
 *
 * Kullanım: node avens-kentalfan-fill-manifest.mjs --out <dizin> --img <kentalfan-casals.jpg> --url <URL> --key <ANON>
 */
import fs from 'node:fs';
import path from 'node:path';

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const outDir = arg('out'), imgFile = arg('img'), dbUrl = arg('url'), dbKey = arg('key');
const SOURCE = 'https://casals-fanware-prod-static.s3.eu-west-1.amazonaws.com/media/tenant/1/fans/series/1049/original-1653470392-0436.jpg (casals.com/en/fanware/50/fans/kentalfan seri fotografi; Recep isareti 08-21, 14/14 varyant birebir olculdu)';
if (!outDir || !imgFile || !dbUrl || !dbKey) { console.error('kullanım: --out --img --url --key'); process.exit(2); }
if (!fs.existsSync(imgFile)) { console.error('kaynak jpg yok: ' + imgFile); process.exit(1); }

const res = await fetch(`${dbUrl}/rest/v1/products?select=id,name,sku,tenant_id&brand=ilike.*avens*&deleted_at=is.null&name=like.KENTALFAN*`, {
  headers: { apikey: dbKey, authorization: `Bearer ${dbKey}` } });
const rows = await res.json();
console.log(`db KENTALFAN: ${rows.length} sku`);
if (rows.length !== 14) { console.error(`beklenen 14, gelen ${rows.length} — kapsami dogrula`); process.exit(1); }

const { default: sharp } = await import('sharp');
fs.mkdirSync(outDir, { recursive: true });
const webp = path.join(outDir, 'kentalfan-casals.webp');
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
