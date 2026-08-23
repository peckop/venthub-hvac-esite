#!/usr/bin/env node
/**
 * T138-VH — Model katmanı ayrıştırma (ÜRÜN şeridi). Plan: docs/plans/t138-model-katmani-plani-2026-08-21.md
 *
 * VARSAYILAN = DRY-RUN: hiçbir şey yazmaz, ne olacağını raporlar (yeni model aileleri,
 * family_id taşıma listesi, 308 haritası, çakışma/uyarı listesi).
 * Yazım YALNIZ `--apply` + service_role ile ve **Recep GO'su** ile yapılır (prod yazımı kapısı);
 * her yazımdan sonra envanter diske işlenir, `--rollback <envanter.json>` geri alır.
 *
 * Model türetme: ürün adından "varyant son ekleri" atılır; kalan = MODEL.
 * Ek listesi ölçülmüş (Lineo: "ES"; Quadro Evo: T/TP/PIR/HCS; SEAT: ATEX/XRM) ve
 * --suffixes ile genişletilebilir. Tek model kalırsa (bölünme yok) uyarı verir.
 *
 * Kullanım:
 *   node t138-model-split.mjs --family vortice-lineo-quiet --url <URL> --key <ANON>        # dry-run
 *   node t138-model-split.mjs --family ... --apply --url <URL> --key <SERVICE_ROLE>        # Recep GO sonrası
 */
import fs from 'node:fs';
import path from 'node:path';

const arg = (n, def = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : def; };
const has = (n) => process.argv.includes(`--${n}`);
const familySlug = arg('family'), dbUrl = arg('url'), dbKey = arg('key');
const outDir = arg('out', '.');
const APPLY = has('apply');
const ROLLBACK = arg('rollback');
if (!dbUrl || !dbKey || (!familySlug && !ROLLBACK)) {
  console.error('kullanım: --family <slug> --url <URL> --key <KEY> [--apply] [--out <dizin>]');
  console.error('   geri : --rollback <envanter.json> --url <URL> --key <SERVICE_ROLE>');
  process.exit(2);
}

/* ── GERI ALMA ───────────────────────────────────────────────────────────────
 * Envanterdeki "onceki family_id"leri geri yazar, sonra yaratilan model
 * ailelerini siler. SIRA TERS: once urunler geri (aksi halde FK, dolu aileyi
 * sildirmez), sonra aileler. Silme HARD delete — bu satirlari biz yarattik ve
 * soft-delete birakmak, slug'i isgal edip ikinci bir denemeyi bloklardi.
 * ────────────────────────────────────────────────────────────────────────── */
if (ROLLBACK) {
  const inv = JSON.parse(fs.readFileSync(ROLLBACK, 'utf8'));
  const rq = async (p, method, body) => {
    const r = await fetch(`${dbUrl}/rest/v1/${p}`, {
      method,
      headers: { apikey: dbKey, authorization: `Bearer ${dbKey}`, 'content-type': 'application/json', prefer: 'return=representation' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const t = await r.text();
    if (!r.ok) { console.error(`GERI ALMA HATASI ${r.status} ${method} ${p}: ${t}`); process.exit(1); }
    return t ? JSON.parse(t) : [];
  };

  console.log(`GERI ALMA: ${ROLLBACK} (durum: ${inv.status}, ${inv.product_previous_family?.length ?? 0} urun, ${inv.created_family_ids?.length ?? 0} aile)`);

  // 1) Urunleri eski ailelerine dondur — ESKI family_id'ye gore grupla, tek istek/grup.
  const byPrev = new Map();
  for (const p of inv.product_previous_family ?? []) {
    if (!byPrev.has(p.previous_family_id)) byPrev.set(p.previous_family_id, []);
    byPrev.get(p.previous_family_id).push(p.id);
  }
  let restored = 0;
  for (const [prev, ids] of byPrev) {
    const r = await rq(`products?id=in.(${ids.join(',')})`, 'PATCH', { family_id: prev });
    restored += r.length;
  }
  console.log(`  ${restored} urun eski ailesine donduruldu`);

  // 2) Yaratilan model ailelerini sil.
  const famIds = (inv.created_family_ids ?? []).map(f => f.id);
  let removed = 0;
  if (famIds.length) {
    const r = await rq(`product_families?id=in.(${famIds.join(',')})`, 'DELETE');
    removed = r.length;
  }
  console.log(`  ${removed} model ailesi silindi`);

  if (restored !== (inv.product_previous_family?.length ?? 0) || removed !== famIds.length) {
    console.error(`⚠ EKSIK GERI ALMA: urun ${restored}/${inv.product_previous_family?.length}, aile ${removed}/${famIds.length} — ELLE INCELE.`);
    process.exit(1);
  }
  console.log('GERI ALMA TAMAM.');
  process.exit(0);
}

// Varyant son ekleri (model = ad − bu ekler). Ölçülmüş varsayılanlar; --suffixes ile ekle.
const SUFFIXES = (arg('suffixes', 'ES,T,TP,PIR,HCS,ATEX,XRM,Wi-Fi') || '').split(',').map(s => s.trim()).filter(Boolean);

const slugify = (s) => s.toLowerCase()
  .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
  .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
  .replace(/["'”“]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// "Vortice Lineo 100 Quiet ES" -> model "Vortice Lineo 100 Quiet", varyant "ES"
function splitModel(name) {
  const toks = name.trim().split(/\s+/);
  const variant = [];
  while (toks.length > 1 && SUFFIXES.some(s => s.toLowerCase() === toks[toks.length - 1].toLowerCase())) {
    variant.unshift(toks.pop());
  }
  return { model: toks.join(' '), variant: variant.join(' ') || 'standart' };
}

const q = async (p) => {
  const r = await fetch(`${dbUrl}/rest/v1/${p}`, { headers: { apikey: dbKey, authorization: `Bearer ${dbKey}` } });
  if (!r.ok) { console.error(`DB HATA ${r.status}: ${p}`); process.exit(1); }
  return r.json();
};

// 1) Kaynak aile (bugünkü seri kaydı) + ürünleri
const fams = await q(`product_families?slug=eq.${familySlug}&select=*,products(id,name,sku,slug,family_id,technical_specs)`);
if (!fams.length) { console.error(`aile bulunamadi: ${familySlug}`); process.exit(1); }
const series = fams[0];
const products = series.products || [];
console.log(`SERI: ${series.name} (${series.slug}) · urun: ${products.length} · series_code: ${series.series_code}`);

// 2) Model gruplaması
const groups = new Map();
for (const p of products) {
  const { model, variant } = splitModel(p.name);
  if (!groups.has(model)) groups.set(model, []);
  groups.get(model).push({ ...p, _variant: variant });
}

// 3) Mevcut slug çakışması var mı (yeni model slug'ları serbest mi)
const proposed = [...groups.keys()].map(m => ({ model: m, slug: slugify(m) }));
const taken = await q(`product_families?slug=in.(${proposed.map(p => p.slug).join(',')})&select=slug`);
const takenSet = new Set(taken.map(t => t.slug));

// 4) Rapor
const warn = [];
if (groups.size < 2) warn.push(`BOLUNME YOK: tek model cikti (${[...groups.keys()][0]}) — son ek listesi (--suffixes) yetersiz olabilir`);
if (takenSet.size) warn.push(`SLUG CAKISMASI: ${[...takenSet].join(', ')}`);

const report = {
  generated_for: familySlug,
  mode: APPLY ? 'APPLY' : 'DRY-RUN',
  series: { id: series.id, slug: series.slug, name: series.name, series_code: series.series_code,
            category_id: series.category_id, subcategory_id: series.subcategory_id, tenant_id: series.tenant_id },
  new_families: proposed.map(p => ({
    name: p.model, slug: p.slug, series_code: series.series_code,
    category_id: series.category_id, subcategory_id: series.subcategory_id, tenant_id: series.tenant_id,
    slug_free: !takenSet.has(p.slug),
    products: groups.get(p.model).map(x => ({ sku: x.sku, name: x.name, variant: x._variant, id: x.id })),
  })),
  family_id_updates: products.map(p => ({ sku: p.sku, id: p.id, from: p.family_id, to_slug: slugify(splitModel(p.name).model) })),
  redirect_map_308: products.filter(p => p.slug).map(p => ({ from: p.slug, to: slugify(splitModel(p.name).model), sku: p.sku })),
  series_slug_unchanged: series.slug,
  warnings: warn,
};

fs.mkdirSync(outDir, { recursive: true });
const rp = path.join(outDir, `t138-dryrun-${familySlug}.json`);
fs.writeFileSync(rp, JSON.stringify(report, null, 2));

console.log(`\n== ${report.mode} — ${groups.size} MODEL onerisi (yeni product_families satiri)`);
for (const nf of report.new_families) {
  console.log(`  ${String(nf.products.length).padStart(2)} varyant  ${nf.slug}${nf.slug_free ? '' : '  ⚠SLUG DOLU'}`);
  nf.products.forEach(p => console.log(`        ${p.sku.padEnd(14)} ${p.variant.padEnd(10)} ${p.name}`));
}
console.log(`\n  family_id guncellemesi: ${report.family_id_updates.length} urun`);
console.log(`  308 haritasi: ${report.redirect_map_308.length} varyant slug'i -> model sayfasi`);
console.log(`  SERI slug'i DEGISMEZ: ${report.series_slug_unchanged}`);
warn.forEach(w => console.log(`  ⚠ ${w}`));
console.log(`\nrapor: ${rp}`);

if (!APPLY) {
  console.log('\nDRY-RUN — hicbir sey yazilmadi. Yazim icin: --apply + service_role key + RECEP GO.');
  process.exit(0);
}

/* ────────────────────────────────────────────────────────────────────────────
 * APPLY — PROD YAZIMI. Recep GO'su 2026-08-21 (Vortice Lineo Quiet pilotu).
 *
 * Tasarim kararlari:
 *  - ON KOSULLAR FAIL-CLOSED: bolunme yoksa, slug cakisiyorsa ya da kaynak satir
 *    zaten bir MODEL ise (parent_family_id dolu) HIC yazmadan durur. Yarim is,
 *    "kismen bolunmus aile" gibi tespiti zor bir durum birakir.
 *  - ENVANTER ONCE: geri alma bilgisi (urun -> ESKI family_id) diske YAZILMADAN
 *    tek satir bile yazilmaz. Rollback yolu garanti altinda olmayan bir yazim,
 *    geri alinamaz yazimdir.
 *  - SIRA: once model aileleri (INSERT), sonra urun tasima (UPDATE). Yarida
 *    kalirsa guvenli tarafta kalir: model aileleri urunsuz olur (sayfalari 404),
 *    urunler eski seride durur ve eski sayfa CALISMAYA DEVAM EDER.
 * ──────────────────────────────────────────────────────────────────────────── */

if (groups.size < 2) { console.error('\nDURDU: bolunme yok (tek model) — yazim yapilmadi.'); process.exit(3); }
if (takenSet.size)   { console.error(`\nDURDU: slug cakismasi (${[...takenSet].join(', ')}) — yazim yapilmadi.`); process.exit(3); }
if (series.parent_family_id) {
  console.error('\nDURDU: kaynak satir bir MODEL (parent_family_id dolu). Hiyerarsi TEK SEVIYE — model bolunemez.');
  process.exit(3);
}

const write = async (p, method, body) => {
  const r = await fetch(`${dbUrl}/rest/v1/${p}`, {
    method,
    headers: {
      apikey: dbKey, authorization: `Bearer ${dbKey}`,
      'content-type': 'application/json', prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) { console.error(`DB YAZIM HATASI ${r.status} ${method} ${p}: ${text}`); process.exit(1); }
  return text ? JSON.parse(text) : null;
};

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const invPath = path.join(outDir, `t138-apply-${familySlug}-${stamp}.json`);
const inventory = {
  applied_at: new Date().toISOString(),
  family: familySlug,
  series_id: series.id,
  // Geri almanin BEL KEMIGI: her urunun yazimdan ONCEKI family_id'si.
  product_previous_family: products.map(p => ({ id: p.id, sku: p.sku, previous_family_id: p.family_id })),
  created_family_ids: [],
  status: 'STARTED',
};
fs.writeFileSync(invPath, JSON.stringify(inventory, null, 2));
console.log(`\nAPPLY — envanter once yazildi: ${invPath}`);

// 1) Model aileleri (parent_family_id = seri) — tek istekte.
const rows = report.new_families.map((nf, i) => ({
  tenant_id: series.tenant_id,          // service_role'da JWT yok → acikca verilir
  brand_id: series.brand_id,            // NOT NULL — seriden devralinir
  parent_family_id: series.id,          // ⭐ MODEL isareti (NULL olsaydi ikinci bir SERI olurdu)
  name: nf.name,
  slug: nf.slug,
  series_code: nf.series_code,
  category_id: nf.category_id,
  subcategory_id: nf.subcategory_id,
  description: series.description ?? {},
  sort_order: i,
}));
const created = await write('product_families', 'POST', rows);
inventory.created_family_ids = created.map(c => ({ id: c.id, slug: c.slug }));
inventory.status = 'FAMILIES_CREATED';
fs.writeFileSync(invPath, JSON.stringify(inventory, null, 2));
console.log(`  ${created.length} model ailesi yaratildi`);

// 2) Urunleri modellerine tasi.
const slugToId = new Map(created.map(c => [c.slug, c.id]));
let moved = 0;
for (const nf of report.new_families) {
  const targetId = slugToId.get(nf.slug);
  if (!targetId) { console.error(`DURDU: ${nf.slug} icin id yok — envanter: ${invPath}`); process.exit(1); }
  const ids = nf.products.map(p => p.id);
  const upd = await write(`products?id=in.(${ids.join(',')})`, 'PATCH', { family_id: targetId });
  moved += upd.length;
  console.log(`  ${String(upd.length).padStart(2)} urun -> ${nf.slug}`);
}
inventory.status = 'DONE';
inventory.moved_products = moved;
fs.writeFileSync(invPath, JSON.stringify(inventory, null, 2));

console.log(`\nYAZIM TAMAM: ${created.length} model ailesi · ${moved} urun tasindi · seri slug'i degismedi (${series.slug})`);
console.log(`GERI ALMA: node ${path.basename(process.argv[1])} --rollback ${invPath} --url <URL> --key <SERVICE_ROLE>`);
if (moved !== products.length) {
  console.error(`⚠ UYARI: tasinan ${moved} != beklenen ${products.length} — envanteri incele.`);
  process.exit(1);
}
