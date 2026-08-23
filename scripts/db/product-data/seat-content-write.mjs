#!/usr/bin/env node
/**
 * T140-VH — SEAT içerik yazımı (ÜRÜN şeridi).
 *
 * VARSAYILAN = DRY-RUN: hiçbir şey yazmaz, **üçgeni** raporlar
 * (DEĞİŞEN / YENİ DOLAN / DOKUNULMAYAN) ve ön koşul ihlallerini gösterir.
 * Yazım YALNIZ `--apply` + service_role ile ve **Recep GO'su** ile yapılır.
 *
 * Veri kaynağı: `seat-content-manifest.json` — üreticinin kendi teknik föyünden
 * (seat-ventilation.fr fiche technique) okunmuş, `Reference Number` ↔ `products.model_code`
 * BİREBİR eşlemesiyle bağlanmış değerler. Ada göre eşleme YAPILMAZ.
 *
 * Recep kararları (2026-08-21):
 *   1. KAYNAK KAZANIR — çelişkide kaynak değeri DB'yi ezer.
 *   2. Doğrulanamayan mevcut değer BIRAKILIR (silinmez), denetim listesinde durur.
 *   3. Şema = product-schema-standard §11.7 (min_/max_ · nominal_ · ölçüt adda · voltage+wiring).
 *   4. STORM 18 ağırlık kopyası AYRI denetim kalemi — bu betik ağırlığa DOKUNMAZ.
 *
 * Kullanım:
 *   node seat-content-write.mjs --url <URL> --key <ANON>                      # dry-run
 *   node seat-content-write.mjs --url <URL> --key <SERVICE_ROLE> --apply --out <dizin>
 *   node seat-content-write.mjs --rollback <envanter.json> --url <URL> --key <SERVICE_ROLE>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const arg = (n, def = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : def; };
const has = (n) => process.argv.includes(`--${n}`);
const dbUrl = arg('url'), dbKey = arg('key'), outDir = arg('out', '.');
const APPLY = has('apply'), ROLLBACK = arg('rollback');

if (!dbUrl || !dbKey) {
  console.error('kullanım: --url <URL> --key <KEY> [--apply] [--out <dizin>]');
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

/* ── GERİ ALMA ──────────────────────────────────────────────────────────────
 * Envanter her ürünün yazımdan ÖNCEKİ `technical_specs` nesnesinin TAMAMINI tutar;
 * alan alan geri almak yerine nesneyi bütün olarak geri yazarız. Sebep: yazım da
 * bütün nesneyi değiştiriyor (PostgREST'te jsonb merge yok) — geri alma, yazımın
 * tam tersi olmalı, "sildiğim alanları hatırlıyorum" gibi kısmi bir kayıt değil.
 * ─────────────────────────────────────────────────────────────────────────── */
if (ROLLBACK) {
  const inv = JSON.parse(fs.readFileSync(ROLLBACK, 'utf8'));
  console.log(`GERI ALMA: ${path.basename(ROLLBACK)} (durum: ${inv.status}, ${inv.items?.length ?? 0} urun)`);
  let restored = 0;
  for (const it of inv.items ?? []) {
    const r = await rest(`products?id=eq.${it.id}`, 'PATCH', { technical_specs: it.previous_specs });
    restored += r.length;
  }
  console.log(`  ${restored} urun eski technical_specs'ine donduruldu`);
  if (restored !== (inv.items?.length ?? 0)) {
    console.error(`⚠ EKSIK GERI ALMA: ${restored}/${inv.items?.length} — ELLE INCELE.`);
    process.exit(1);
  }
  console.log('GERI ALMA TAMAM.');
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'seat-content-manifest.json'), 'utf8'));

// SEAT ürünleri — marka bağı ailenin brand_id'si üzerinden.
const brands = await rest(`brands?name=eq.SEAT&select=id`);
if (!brands.length) { console.error('SEAT markasi bulunamadi'); process.exit(1); }
const fams = await rest(`product_families?brand_id=eq.${brands[0].id}&select=id`);
const famIds = fams.map(f => f.id).join(',');
const products = await rest(
  `products?family_id=in.(${famIds})&deleted_at=is.null&select=id,sku,name,model_code,technical_specs&order=sku`
);
console.log(`SEAT urun: ${products.length}`);

/** Bir ürünün hedef spec'ini kur: seri varsayılanı → devir noktası → SKU'ya özel. */
function targetFor(p) {
  const m = manifest.skus[p.model_code];
  if (!m) return null;
  const out = {};
  const series = manifest.series[m.series] ?? {};
  for (const [k, v] of Object.entries(series)) {
    if (!k.startsWith('_') && k !== 'source') out[k] = v;
  }
  // Devir noktası anahtarı KAYNAK devrini kullanır (DB'deki yuvarlanmış değeri değil).
  const point = m.rpm_max ? manifest.rpm_points[`${m.series}|${m.rpm_max}`] : null;
  if (point) Object.assign(out, point);
  for (const [k, v] of Object.entries(m)) {
    if (k !== 'series') out[k] = v;
  }
  return { fields: out, source: series.source ?? null };
}

/* ── ÖN KOŞULLAR (fail-closed) ──────────────────────────────────────────────
 * §11.7 sözleşmesini YAZIMDAN ÖNCE doğrular. Bir tanesi bile ihlal edilirse hiç
 * yazmadan durur: yarım yazılmış bir sözleşme, sözleşmesizlikten daha kötüdür
 * çünkü "kural var" sanılır.
 * ─────────────────────────────────────────────────────────────────────────── */
const violations = [];
function checkContract(sku, f) {
  const pairs = [['min_delivery_m3h', 'max_delivery_m3h'], ['min_static_pressure_pa', 'max_static_pressure_pa']];
  for (const [lo, hi] of pairs) {
    if (f[lo] != null && f[hi] == null) violations.push(`${sku}: ${lo} var ama ${hi} yok (§11.7 cift yazilir)`);
    if (f[hi] != null && f[lo] != null && Number(f[lo]) > Number(f[hi])) violations.push(`${sku}: ${lo}(${f[lo]}) > ${hi}(${f[hi]})`);
  }
  const nomPairs = [['nominal_delivery_m3h', 'min_delivery_m3h', 'max_delivery_m3h'],
                   ['nominal_static_pressure_pa', 'min_static_pressure_pa', 'max_static_pressure_pa']];
  for (const [nom, lo, hi] of nomPairs) {
    if (f[nom] != null && f[lo] != null && f[hi] != null) {
      const n = Number(f[nom]);
      if (n < Number(f[lo]) || n > Number(f[hi])) {
        violations.push(`${sku}: ${nom}(${n}) aralik disi [${f[lo]}, ${f[hi]}]`);
      }
    }
  }
  for (const [k, v] of Object.entries(f)) {
    if (/_(v|m3h|w|pa|kg|mm|a|hz)$/.test(k) && typeof v === 'string') {
      violations.push(`${sku}: ${k} birimli alan ama METIN ("${v}") — §11.6 ihlali`);
    }
  }
  if (f.voltage_alt_v != null && f.wiring == null) violations.push(`${sku}: voltage_alt_v var ama wiring yok`);
}

const changed = [], filled = [], untouched = [], nomanifest = [];
const writes = [];

for (const p of products) {
  const t = targetFor(p);
  if (!t || Object.keys(t.fields).length === 0) { nomanifest.push(p.sku); continue; }
  checkContract(p.sku, t.fields);

  const before = p.technical_specs ?? {};
  const after = { ...before };
  const diffs = [];
  for (const [k, v] of Object.entries(t.fields)) {
    const old = before[k];
    if (old === undefined) { diffs.push({ k, from: null, to: v, kind: 'YENI' }); after[k] = v; }
    else if (String(old) !== String(v)) { diffs.push({ k, from: old, to: v, kind: 'DEGISTI' }); after[k] = v; }
  }
  if (!diffs.length) { untouched.push(p.sku); continue; }
  if (diffs.some(d => d.kind === 'DEGISTI')) changed.push({ sku: p.sku, diffs: diffs.filter(d => d.kind === 'DEGISTI') });
  if (diffs.some(d => d.kind === 'YENI')) filled.push({ sku: p.sku, n: diffs.filter(d => d.kind === 'YENI').length });
  writes.push({ id: p.id, sku: p.sku, previous_specs: before, next_specs: after, source: t.source });
}

console.log(`\n== ${APPLY ? 'APPLY' : 'DRY-RUN'} UCGENI`);
console.log(`  DEGISEN deger  : ${changed.length} urun (${changed.reduce((a, c) => a + c.diffs.length, 0)} alan)`);
console.log(`  YENI DOLAN     : ${filled.length} urun (${filled.reduce((a, c) => a + c.n, 0)} alan)`);
console.log(`  DOKUNULMAYAN   : ${untouched.length} urun (hedef = mevcut)`);
console.log(`  MANIFESTSIZ    : ${nomanifest.length} urun -> ${nomanifest.join(', ') || '—'}`);
console.log(`  NULL'A DONEN   : 0 alan (Recep karari: dogrulanamayan deger SILINMEZ)`);

if (changed.length) {
  console.log('\n-- DEGISEN DEGERLER (kaynak kazanir):');
  for (const c of changed) {
    for (const d of c.diffs) console.log(`   ${c.sku.padEnd(14)} ${d.k.padEnd(26)} ${String(d.from).padEnd(10)} -> ${d.to}`);
  }
}

if (violations.length) {
  console.error(`\n⛔ SOZLESME IHLALI (${violations.length}) — HIC YAZILMADI:`);
  violations.forEach(v => console.error(`   ${v}`));
  process.exit(3);
}
console.log('\n  sozlesme on kosullari (§11.6 + §11.7): TEMIZ');

if (!APPLY) {
  console.log('\nDRY-RUN — hicbir sey yazilmadi. Yazim icin: --apply + service_role + RECEP GO.');
  process.exit(0);
}

// ── APPLY: envanter ÖNCE (rollback yolu garanti altına alınmadan yazım yok).
fs.mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const invPath = path.join(outDir, `t140-seat-content-${stamp}.json`);
const inventory = {
  applied_at: new Date().toISOString(),
  status: 'STARTED',
  items: writes.map(w => ({ id: w.id, sku: w.sku, previous_specs: w.previous_specs, source: w.source })),
};
fs.writeFileSync(invPath, JSON.stringify(inventory, null, 2));
console.log(`\nAPPLY — envanter once yazildi: ${invPath}`);

let ok = 0;
for (const w of writes) {
  const r = await rest(`products?id=eq.${w.id}`, 'PATCH', { technical_specs: w.next_specs });
  ok += r.length;
}
inventory.status = 'DONE';
inventory.written = ok;
fs.writeFileSync(invPath, JSON.stringify(inventory, null, 2));

console.log(`YAZIM TAMAM: ${ok}/${writes.length} urun guncellendi`);
console.log(`GERI ALMA: node ${path.basename(process.argv[1])} --rollback ${invPath} --url <URL> --key <SERVICE_ROLE>`);
if (ok !== writes.length) { console.error(`⚠ UYARI: ${ok} != ${writes.length} — envanteri incele.`); process.exit(1); }
