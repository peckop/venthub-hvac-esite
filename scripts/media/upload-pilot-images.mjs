#!/usr/bin/env node
/**
 * T139-VH ADIM-4 — pilot webp'lerini product-images bucket'ına yükler ve
 * product_images satırlarını yazar. PROD YAZIMIDIR — Recep onayı olmadan koşturulmaz.
 *
 * Kimlik: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY ortam değişkenleri
 * (çağır: node --env-file=<.env yolu> scripts/media/upload-pilot-images.mjs ...).
 * Sır betiğe/manifest'e YAZILMAZ. service_role bilinçli: product_images'ta INSERT
 * politikası yok (ölçüm 2026-08-21) — RLS'e tabi bir rolle bu iş bugün imkânsız.
 *
 * Envanter (OPS şart-4): yazılan HER storage nesnesi + DB satırı
 * <out>/t139-upload-inventory.json dosyasına işlenir; --rollback bu envanteri
 * okuyup satırları siler + nesneleri kaldırır.
 *
 * Kullanım:
 *   node --env-file=../venthub-hvac/.env scripts/media/upload-pilot-images.mjs --out <dizin>
 *   node --env-file=../venthub-hvac/.env scripts/media/upload-pilot-images.mjs --out <dizin> --rollback
 */
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}
const outDir = arg('out');
const rollback = process.argv.includes('--rollback');
if (!outDir) { console.error('kullanım: --out <dizin> [--rollback]'); process.exit(2); }

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY eksik (--env-file verildi mi?)'); process.exit(2); }
const supabase = createClient(url, key, { auth: { persistSession: false } });

const BUCKET = 'product-images';
const manifestPath = path.join(outDir, 't139-manifest.json');
const invPath = path.join(outDir, 't139-upload-inventory.json');

if (rollback) {
  const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));
  for (const row of inv.db_rows) {
    const { error } = await supabase.from('product_images').delete().eq('id', row.id);
    console.log(`[rollback-db] ${row.id} ${error ? 'HATA ' + error.message : 'silindi'}`);
  }
  if (inv.storage_paths.length) {
    const { error } = await supabase.storage.from(BUCKET).remove(inv.storage_paths);
    console.log(`[rollback-storage] ${inv.storage_paths.length} nesne ${error ? 'HATA ' + error.message : 'silindi'}`);
  }
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const inv = fs.existsSync(invPath)
  ? JSON.parse(fs.readFileSync(invPath, 'utf8'))
  : { started_at: null, storage_paths: [], db_rows: [] };
const saveInv = () => fs.writeFileSync(invPath, JSON.stringify(inv, null, 2));

for (const [code, prod] of Object.entries(manifest.products)) {
  for (const img of prod.images) {
    if (img.download_error) { console.log(`[atla] ${code}#${img.sort_order} kaynakta indirilememisti: ${img.download_error}`); continue; }
    if (!img.webp_file || !img.storage_path) { console.error(`EKSIK webp: ${code}#${img.sort_order} — convert kosmadi mi?`); process.exit(1); }

    // 1) Storage nesnesi (idempotent: upsert=false, varsa hata verir — sessiz ezme yok)
    const buf = fs.readFileSync(img.webp_file);
    const { error: upErr } = await supabase.storage.from(BUCKET)
      .upload(img.storage_path, buf, { contentType: 'image/webp', upsert: false });
    if (upErr && !`${upErr.message}`.includes('already exists')) {
      console.error(`[upload HATA] ${img.storage_path}: ${upErr.message}`); process.exit(1);
    }
    if (!inv.storage_paths.includes(img.storage_path)) inv.storage_paths.push(img.storage_path);
    saveInv();

    // 2) DB satırı (tenant_id ZORUNLU — kural 12; path bucket önexisiz saklanır, resolver ekler)
    const { data, error: dbErr } = await supabase.from('product_images').insert({
      product_id: prod.product_id,
      tenant_id: manifest.tenant_id,
      path: img.storage_path,
      alt: img.alt,
      sort_order: img.sort_order,
    }).select('id').single();
    if (dbErr) { console.error(`[insert HATA] ${code}#${img.sort_order}: ${dbErr.message}`); process.exit(1); }
    inv.db_rows.push({ id: data.id, product_id: prod.product_id, code, sort_order: img.sort_order, path: img.storage_path });
    saveInv();
    console.log(`[yazildi] ${code}#${img.sort_order} -> ${img.storage_path} (row ${data.id})`);
  }
}
console.log(`bitti — envanter: ${invPath} (${inv.db_rows.length} satir, ${inv.storage_paths.length} nesne)`);
