#!/usr/bin/env node
/**
 * T148-VH — KİMLİK DÜZELTMESİ (`sku` / `model_code` / `name` / `slug`).
 *
 * `content-write.mjs`'ten AYRI bir betiktir ve bilerek öyle: o betik `technical_specs`
 * yazar (değer düzeltmesi), bu betik ÜRÜNÜN KİMLİĞİNİ değiştirir. Kimlik değişimi URL,
 * arama motoru verisi, dışa aktarım dosyaları ve paylaşılmış linkleri etkiler — ayrı
 * onay, ayrı ön koşul, ayrı geri alma ister.
 *
 * VARSAYILAN = DRY-RUN. Yazım YALNIZ `--apply` + service_role + kullanıcı GO'su ile.
 *
 * ÖN KOŞULLAR (fail-closed — biri bile düşerse HİÇ yazmaz):
 *   Ö1. Her kaynak SKU tam olarak 1 ürüne denk gelmeli.
 *   Ö2. Hedef `sku`/`slug` değerleri DB'de KULLANILMIYOR olmalı (çakışma yok).
 *   Ö3. Hedef satırların sipariş kaydı 0 olmalı — **yazım anında YENİDEN ölçülür.**
 *       (2026-08-22'de 0'dı; ölçüm bayatlayabilir, o yüzden burada tekrar ölçülür.)
 *   Ö4. Manifest'in kendi iç tutarlılığı: next_sku == 'AVE-' + next_model_code.
 *
 * YAZIM SONRASI DOĞRULAMA:
 *   D1. Değişmez `sku = <MARKA>-<model_code>` TÜM markalarda korunmalı (ölçüm: 374/374).
 *       Bozulursa betik KENDİ YAZDIĞINI GERİ ALIR ve hata ile çıkar.
 *
 * Kullanım:
 *   node identity-fix.mjs --url <URL> --key <ANON>                          # dry-run
 *   node identity-fix.mjs --url <URL> --key <SERVICE> --apply --out <dizin>
 *   node identity-fix.mjs --rollback <envanter.json> --url <URL> --key <SERVICE>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const arg = (n, def = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : def; };
const has = (n) => process.argv.includes(`--${n}`);
const dbUrl = arg('url'), dbKey = arg('key'), outDir = arg('out', '.');
const APPLY = has('apply'), ROLLBACK = arg('rollback');
const manifestArg = arg('manifest', 'avens-identity-manifest.json');

if (!dbUrl || !dbKey) {
  console.error('kullanım: --url <URL> --key <KEY> [--manifest <dosya>] [--apply] [--out <dizin>]');
  console.error('   geri : --rollback <envanter.json> --url <URL> --key <SERVICE_ROLE>');
  process.exit(2);
}

const rest = async (p, method = 'GET', body) => {
  const r = await fetch(`${dbUrl}/rest/v1/${p}`, {
    method,
    headers: {
      apikey: dbKey, authorization: `Bearer ${dbKey}`,
      'content-type': 'application/json', prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  if (!r.ok) { console.error(`DB HATA ${r.status} ${method} ${p}: ${t}`); process.exit(1); }
  return t ? JSON.parse(t) : [];
};

/** Değişmez ölçümü: kaç ürün `sku == <MARKA_ONEKI>-<model_code>` kuralına uyuyor. */
async function invariantCount() {
  const rows = await rest('products?deleted_at=is.null&select=sku,model_code');
  let ok = 0, total = 0;
  for (const r of rows) {
    if (!r.sku || !r.model_code) continue;
    total += 1;
    if (r.sku.endsWith(`-${r.model_code}`)) ok += 1;
  }
  return { ok, total };
}

/* ── GERİ ALMA ────────────────────────────────────────────────────────────── */
if (ROLLBACK) {
  const inv = JSON.parse(fs.readFileSync(ROLLBACK, 'utf8'));
  console.log(`GERI ALMA: ${path.basename(ROLLBACK)} (${inv.items?.length ?? 0} urun)`);
  let restored = 0;
  for (const it of inv.items ?? []) {
    const r = await rest(`products?id=eq.${it.id}`, 'PATCH', {
      sku: it.previous.sku,
      model_code: it.previous.model_code,
      name: it.previous.name,
      slug: it.previous.slug,
    });
    restored += r.length;
  }
  console.log(`  ${restored} urun eski kimligine donduruldu`);
  if (restored !== (inv.items?.length ?? 0)) {
    console.error(`⚠ EKSIK GERI ALMA: ${restored}/${inv.items?.length} — ELLE INCELE.`);
    process.exit(1);
  }
  const after = await invariantCount();
  console.log(`  degismez: ${after.ok}/${after.total}`);
  console.log('GERI ALMA TAMAM.');
  process.exit(0);
}

const manifestPath = path.isAbsolute(manifestArg) ? manifestArg : path.join(__dirname, manifestArg);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
console.log(`MANIFEST: ${path.basename(manifestPath)} — ${manifest.items.length} kimlik duzeltmesi`);

const violations = [];

// Ö4 — manifest iç tutarlılığı (DB'ye hiç gitmeden ölçülür)
for (const it of manifest.items) {
  const beklenen = `AVE-${it.next_model_code}`;
  if (it.next_sku !== beklenen) violations.push(`${it.current_sku}: next_sku "${it.next_sku}" != "${beklenen}" (degismez ihlali)`);
  if (it.katalog_kod !== it.next_model_code) violations.push(`${it.current_sku}: katalog_kod "${it.katalog_kod}" != next_model_code "${it.next_model_code}"`);
  if (!it.next_slug.endsWith(`-${it.next_model_code}`)) violations.push(`${it.current_sku}: next_slug "${it.next_slug}" model_code ile bitmiyor (kurulu kalip)`);
}

// Ö1 — kaynak satırlar
const currentSkus = manifest.items.map(i => i.current_sku);
const rows = await rest(`products?sku=in.(${currentSkus.join(',')})&deleted_at=is.null&select=id,sku,model_code,name,slug`);
for (const sku of currentSkus) {
  const n = rows.filter(r => r.sku === sku).length;
  if (n !== 1) violations.push(`${sku}: DB'de ${n} satir bulundu (1 olmali)`);
}

// Ö2 — hedef çakışması
const nextSkus = manifest.items.map(i => i.next_sku);
const nextSlugs = manifest.items.map(i => i.next_slug);
const clashSku = await rest(`products?sku=in.(${nextSkus.join(',')})&select=sku`);
for (const c of clashSku) violations.push(`HEDEF CAKISMASI: sku "${c.sku}" DB'de ZATEN VAR`);
const clashSlug = await rest(`products?slug=in.(${nextSlugs.map(encodeURIComponent).join(',')})&select=slug`);
for (const c of clashSlug) violations.push(`HEDEF CAKISMASI: slug "${c.slug}" DB'de ZATEN VAR`);

// Ö3 — sipariş kaydı YENİDEN ölçülür (önceki ölçüm bayatlamış olabilir)
const orderRows = await rest(
  `venthub_order_items?or=(product_sku.in.(${currentSkus.join(',')}),product_sku_snapshot.in.(${currentSkus.join(',')}))&select=product_sku,product_sku_snapshot`
);
if (orderRows.length > 0) {
  violations.push(`SIPARIS KAYDI VAR (${orderRows.length} satir) — kimlik degisimi siparis gecmisini kopartir. ELLE INCELE.`);
}

const before = await invariantCount();
console.log(`DEGISMEZ (yazim oncesi): ${before.ok}/${before.total} urun "sku = <onek>-<model_code>" kuralina uyuyor`);
console.log(`SIPARIS KAYDI: ${orderRows.length} satir`);

console.log(`\n== ${APPLY ? 'APPLY' : 'DRY-RUN'} — KIMLIK DEGISIKLIKLERI`);
const writes = [];
for (const it of manifest.items) {
  const row = rows.find(r => r.sku === it.current_sku);
  if (!row) continue;
  console.log(`\n  ${it.current_sku}  ->  ${it.next_sku}`);
  console.log(`    model_code : ${row.model_code} -> ${it.next_model_code}`);
  console.log(`    name       : ${row.name}`);
  console.log(`               -> ${it.next_name}`);
  console.log(`    slug       : ${row.slug}`);
  console.log(`               -> ${it.next_slug}`);
  writes.push({
    id: row.id,
    previous: { sku: row.sku, model_code: row.model_code, name: row.name, slug: row.slug },
    next: { sku: it.next_sku, model_code: it.next_model_code, name: it.next_name, slug: it.next_slug },
  });
}

if (manifest.denetim?.length) {
  console.log(`\n⚠ DENETIM KALEMLERI (${manifest.denetim.length}) — BU BETIK DOKUNMAZ:`);
  for (const d of manifest.denetim) console.log(`   [${d.durum}] ${d.kalem}: ${String(d.gerekce).slice(0, 120)}`);
}

if (violations.length) {
  console.error(`\n⛔ ON KOSUL IHLALI (${violations.length}) — HIC YAZILMADI:`);
  violations.forEach(v => console.error(`   ${v}`));
  process.exit(3);
}
console.log('\n  on kosullar (O1 kaynak · O2 cakisma · O3 siparis · O4 manifest): TEMIZ');

if (!APPLY) {
  console.log('\nDRY-RUN — hicbir sey yazilmadi. Yazim icin: --apply + service_role + GO.');
  process.exit(0);
}

// ── APPLY: envanter ÖNCE
fs.mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const invPath = path.join(outDir, `identity-avens-${stamp}.json`);
fs.writeFileSync(invPath, JSON.stringify({
  applied_at: new Date().toISOString(), status: 'STARTED',
  manifest: path.basename(manifestPath),
  invariant_before: before,
  items: writes.map(w => ({ id: w.id, previous: w.previous, next: w.next })),
}, null, 2));
console.log(`\nAPPLY — envanter once yazildi: ${invPath}`);

let ok = 0;
for (const w of writes) {
  const r = await rest(`products?id=eq.${w.id}`, 'PATCH', w.next);
  ok += r.length;
}
console.log(`YAZIM: ${ok}/${writes.length} urun guncellendi`);

// D1 — değişmez korunmuş mu? Bozulduysa KENDİ YAZDIĞINI GERİ AL.
const after = await invariantCount();
console.log(`DEGISMEZ (yazim sonrasi): ${after.ok}/${after.total}`);
if (after.ok < before.ok || after.total !== before.total) {
  console.error(`⛔ DEGISMEZ BOZULDU (${before.ok}/${before.total} -> ${after.ok}/${after.total}) — GERI ALINIYOR`);
  for (const w of writes) await rest(`products?id=eq.${w.id}`, 'PATCH', w.previous);
  const back = await invariantCount();
  console.error(`   geri alindi; degismez: ${back.ok}/${back.total}`);
  process.exit(1);
}

fs.writeFileSync(invPath, JSON.stringify({
  applied_at: new Date().toISOString(), status: 'DONE', written: ok,
  manifest: path.basename(manifestPath),
  invariant_before: before, invariant_after: after,
  items: writes.map(w => ({ id: w.id, previous: w.previous, next: w.next })),
}, null, 2));

console.log(`\nYAZIM TAMAM. GERI ALMA:`);
console.log(`  node ${path.basename(process.argv[1])} --rollback ${invPath} --url <URL> --key <SERVICE_ROLE>`);
if (ok !== writes.length) { console.error(`⚠ UYARI: ${ok} != ${writes.length} — envanteri incele.`); process.exit(1); }
