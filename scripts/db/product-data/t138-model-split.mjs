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
if (!familySlug || !dbUrl || !dbKey) { console.error('kullanım: --family <slug> --url <URL> --key <KEY> [--apply] [--out <dizin>]'); process.exit(2); }

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
console.error('\n--apply yolu bu surumde KAPALI: Recep GO kaydi + service_role ile ayri turda acilacak (plan §3).');
process.exit(3);
