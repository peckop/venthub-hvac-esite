#!/usr/bin/env node
/**
 * GENEL İÇERİK YAZIMI — `technical_specs` (ÜRÜN şeridi).
 *
 * `seat-content-write.mjs`'ten türetildi; farkı MARKADAN BAĞIMSIZ olması: hangi markaya
 * yazacağını manifest'in `_marka` alanından okur. SEAT betiği tarihsel kayıt olarak
 * yerinde bırakıldı (koştuğu haliyle envanteri onunla eşleşiyor).
 *
 * VARSAYILAN = DRY-RUN: hiçbir şey yazmaz, **üçgeni** raporlar
 * (DEĞİŞEN / YENİ DOLAN / DOKUNULMAYAN) ve ön koşul ihlallerini gösterir.
 * Yazım YALNIZ `--apply` + service_role ile ve **Recep GO'su** ile yapılır.
 *
 * MANİFEST SÖZLEŞMESİ:
 *   _marka   : DB'deki `brands.name` — birebir eşleşmeli (yoksa betik durur).
 *   series   : seri varsayılanları. `source` ve `_` ile başlayan anahtarlar YAZILMAZ.
 *   rpm_points: (opsiyonel) "<seri>|<rpm>" anahtarlı devir noktası değerleri.
 *   skus     : `model_code` anahtarlı SKU'ya özel değerler. `series` anahtarı ve
 *              `_` ile başlayanlar (ör. `_confidence`, `_not`) YAZILMAZ — bunlar
 *              manifest'in kendi üstverisi, ürünün teknik verisi değil.
 *   denetim  : YAZILMAZ. Karar/kimlik kalemleri; yalnız raporlanır ve ayrı GO ister.
 *
 * Kullanım:
 *   node content-write.mjs --manifest <dosya> --url <URL> --key <ANON>            # dry-run
 *   node content-write.mjs --manifest <dosya> --url <URL> --key <SERVICE> --apply --out <dizin>
 *   node content-write.mjs --rollback <envanter.json> --url <URL> --key <SERVICE>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const arg = (n, def = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : def; };
const has = (n) => process.argv.includes(`--${n}`);
const dbUrl = arg('url'), dbKey = arg('key'), outDir = arg('out', '.');
const APPLY = has('apply'), ROLLBACK = arg('rollback'), manifestArg = arg('manifest');
const ALLOW_REMOVE = has('allow-remove');

if (!dbUrl || !dbKey) {
  console.error('kullanım: --manifest <dosya> --url <URL> --key <KEY> [--apply] [--out <dizin>]');
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
 * alan alan geri almak yerine nesneyi bütün olarak geri yazarız — yazım da bütün
 * nesneyi değiştiriyor (PostgREST'te jsonb merge yok), geri alma yazımın tam tersi
 * olmalı, "sildiğim alanları hatırlıyorum" gibi kısmi bir kayıt değil.
 * ─────────────────────────────────────────────────────────────────────────── */
if (ROLLBACK) {
  const inv = JSON.parse(fs.readFileSync(ROLLBACK, 'utf8'));
  console.log(`GERI ALMA: ${path.basename(ROLLBACK)} (marka: ${inv.marka ?? '?'}, durum: ${inv.status}, ${inv.items?.length ?? 0} urun)`);
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

if (!manifestArg) { console.error('--manifest zorunlu'); process.exit(2); }
const manifestPath = path.isAbsolute(manifestArg) ? manifestArg : path.join(__dirname, manifestArg);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const MARKA = manifest._marka;
if (!MARKA) { console.error('manifest `_marka` alani YOK — hangi markaya yazilacagi belirsiz.'); process.exit(2); }

// Marka bağı: ürünler ailenin brand_id'si üzerinden bulunur.
const brands = await rest(`brands?name=eq.${encodeURIComponent(MARKA)}&select=id,name`);
if (!brands.length) { console.error(`marka bulunamadi: "${MARKA}" — DB'de brands.name ile BIREBIR eslesmeli.`); process.exit(1); }
const fams = await rest(`product_families?brand_id=eq.${brands[0].id}&select=id`);
if (!fams.length) { console.error(`"${MARKA}" markasinin ailesi yok`); process.exit(1); }
const famIds = fams.map(f => f.id).join(',');
const products = await rest(
  `products?family_id=in.(${famIds})&deleted_at=is.null&select=id,sku,name,model_code,technical_specs&order=sku`
);
console.log(`MANIFEST: ${path.basename(manifestPath)}`);
console.log(`MARKA   : ${MARKA} — ${fams.length} aile, ${products.length} aktif urun`);

/** Manifest üstverisi mi? (`_`-önekli anahtarlar ve `series`/`source` bağları yazılmaz.) */
const isMeta = (k) => k.startsWith('_') || k === 'series' || k === 'source';

/** Bir ürünün hedef spec'ini kur: seri varsayılanı → devir noktası (varsa) → SKU'ya özel. */
function targetFor(p) {
  const m = manifest.skus?.[p.model_code];
  if (!m) return null;
  const out = {};
  const series = manifest.series?.[m.series] ?? {};
  for (const [k, v] of Object.entries(series)) if (!isMeta(k)) out[k] = v;

  // Devir noktası anahtarı KAYNAK devrini kullanır (DB'deki yuvarlanmış değeri değil).
  const point = m.rpm_max && manifest.rpm_points
    ? manifest.rpm_points[`${m.series}|${m.rpm_max}`]
    : null;
  if (point) for (const [k, v] of Object.entries(point)) if (!isMeta(k)) out[k] = v;

  for (const [k, v] of Object.entries(m)) if (!isMeta(k)) out[k] = v;
  return { fields: out, source: series.source ?? null };
}

/* ── ÖN KOŞULLAR (fail-closed) ──────────────────────────────────────────────
 * §11.6 (birim) + §11.7 (semantik) sözleşmesini YAZIMDAN ÖNCE doğrular. Bir tanesi
 * bile ihlal edilirse hiç yazmadan durur: yarım yazılmış bir sözleşme,
 * sözleşmesizlikten daha kötüdür çünkü "kural var" sanılır.
 * ─────────────────────────────────────────────────────────────────────────── */
const violations = [];
function checkContract(sku, f) {
  const pairs = [
    ['min_delivery_m3h', 'max_delivery_m3h'],
    ['min_static_pressure_pa', 'max_static_pressure_pa'],
    ['min_voltage_v', 'max_voltage_v'],
  ];
  for (const [lo, hi] of pairs) {
    if (f[lo] != null && f[hi] == null) violations.push(`${sku}: ${lo} var ama ${hi} yok (§11.7 cift yazilir)`);
    if (f[hi] != null && f[lo] != null && Number(f[lo]) > Number(f[hi])) violations.push(`${sku}: ${lo}(${f[lo]}) > ${hi}(${f[hi]})`);
  }
  const nomTriples = [
    ['nominal_delivery_m3h', 'min_delivery_m3h', 'max_delivery_m3h'],
    ['nominal_static_pressure_pa', 'min_static_pressure_pa', 'max_static_pressure_pa'],
  ];
  for (const [nom, lo, hi] of nomTriples) {
    if (f[nom] != null && f[lo] != null && f[hi] != null) {
      const n = Number(f[nom]);
      if (n < Number(f[lo]) || n > Number(f[hi])) {
        violations.push(`${sku}: ${nom}(${n}) aralik disi [${f[lo]}, ${f[hi]}]`);
      }
    }
  }
  for (const [k, v] of Object.entries(f)) {
    if (/_(v|m3h|w|pa|kg|mm|a|hz|db)$/.test(k) && typeof v === 'string') {
      violations.push(`${sku}: ${k} birimli alan ama METIN ("${v}") — §11.6 ihlali`);
    }
  }
  if (f.voltage_alt_v != null && f.wiring == null) violations.push(`${sku}: voltage_alt_v var ama wiring yok`);
}

const changed = [], filled = [], untouched = [], nomanifest = [];
const removals = [], removalsPending = [], removalsBlocked = [];
const writes = [];
const dbModelCodes = new Set(products.map(p => p.model_code).filter(Boolean));

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
  /* ── ALAN KALDIRMA — ayrı bayrak ardında ────────────────────────────────
   * Manifest `kaldirilacak: { "<model_code>": ["alan", ...] }` diyebilir. Bu, "değer
   * doğrulanamadı" durumu DEĞİLDİR (o durumda değer BIRAKILIR); bu, alan ADININ yanlış
   * bir semantik taahhüt taşıdığı ve aynı bilginin doğru adlı karşılığının bu turda
   * yazıldığı durumdur. İki koşul birlikte aranır:
   *   (a) `--allow-remove` bayrağı açıkça verilmiş olmalı — kazara silme olmasın;
   *   (b) kaldırılacak alanın yerine geçen alan hedefte GERÇEKTEN dolu olmalı.
   * (b) olmadan kaldırma yapılmaz: yerine bir şey koymadan silmek veri kaybıdır.
   * Geri alma yolu tam nesneyi tuttuğu için rollback bu silmeyi de geri alır.
   * ──────────────────────────────────────────────────────────────────────── */
  const kaldirList = manifest.kaldirilacak?.[p.model_code] ?? [];
  for (const alan of kaldirList) {
    if (!(alan in after)) continue;
    const yerine = manifest.kaldirilacak_yerine?.[alan];
    if (yerine && after[yerine] == null) {
      removalsBlocked.push(`${p.sku}: ${alan} KALDIRILMADI — yerine gecen ${yerine} dolu degil`);
      continue;
    }
    if (!ALLOW_REMOVE) { removalsPending.push({ sku: p.sku, alan, value: after[alan] }); continue; }
    removals.push({ sku: p.sku, alan, value: after[alan] });
    delete after[alan];
    diffs.push({ k: alan, from: before[alan], to: null, kind: 'KALDIRILDI' });
  }

  if (!diffs.length) { untouched.push(p.sku); continue; }
  if (diffs.some(d => d.kind === 'DEGISTI')) changed.push({ sku: p.sku, diffs: diffs.filter(d => d.kind === 'DEGISTI') });
  if (diffs.some(d => d.kind === 'YENI')) filled.push({ sku: p.sku, n: diffs.filter(d => d.kind === 'YENI').length });
  writes.push({ id: p.id, sku: p.sku, previous_specs: before, next_specs: after, source: t.source });
}

/* Manifest'te olup DB'de KARŞILIĞI OLMAYAN model_code'lar — sessizce yutulmaz.
 * Bu, manifest ile katalog arasında bir kapsam farkı demektir (ürün DB'ye hiç
 * girmemiş olabilir) ve yazımdan bağımsız bir bulgudur. */
const manifestOnly = Object.keys(manifest.skus ?? {}).filter(mc => !dbModelCodes.has(mc));

console.log(`\n== ${APPLY ? 'APPLY' : 'DRY-RUN'} UCGENI`);
console.log(`  DEGISEN deger  : ${changed.length} urun (${changed.reduce((a, c) => a + c.diffs.length, 0)} alan)`);
console.log(`  YENI DOLAN     : ${filled.length} urun (${filled.reduce((a, c) => a + c.n, 0)} alan)`);
console.log(`  DOKUNULMAYAN   : ${untouched.length} urun (hedef = mevcut)`);
console.log(`  MANIFESTSIZ    : ${nomanifest.length} urun (DB'de var, manifest'te yok)`);
console.log(`  DB'DE YOK      : ${manifestOnly.length} model_code${manifestOnly.length ? ' -> ' + manifestOnly.join(', ') : ''}`);
console.log(`  KALDIRILAN alan: ${removals.length}${ALLOW_REMOVE ? '' : ' (--allow-remove YOK)'}`);
if (removalsPending.length) {
  console.log(`  ⏸ KALDIRILACAK : ${removalsPending.length} alan — BEKLIYOR, --allow-remove verilmedi:`);
  for (const r of removalsPending) console.log(`     ${r.sku.padEnd(14)} ${r.alan.padEnd(24)} ("${r.value}")`);
}
if (removalsBlocked.length) {
  console.log(`  ⛔ KALDIRMA ENGELLENDI (${removalsBlocked.length}) — yerine gecen alan bos:`);
  removalsBlocked.forEach(x => console.log(`     ${x}`));
}
console.log(`  NULL'A DONEN   : 0 alan (dogrulanamayan mevcut deger SILINMEZ — kaldirma bundan AYRI, §bkz. kod)`);

if (changed.length) {
  console.log('\n-- DEGISEN DEGERLER (kaynak kazanir):');
  for (const c of changed) {
    for (const d of c.diffs) console.log(`   ${c.sku.padEnd(14)} ${d.k.padEnd(28)} ${String(d.from).padEnd(12)} -> ${d.to}`);
  }
}

const denetim = manifest.denetim ?? [];
if (denetim.length) {
  console.log(`\n⚠ DENETIM KALEMLERI (${denetim.length}) — BU BETIK BUNLARA DOKUNMAZ, ayri GO ister:`);
  for (const d of denetim) {
    const key = d.sku ?? d.kalem ?? '(genel)';
    const txt = d.sorun ?? d.aciklama ?? JSON.stringify(d);
    console.log(`   ${String(key).padEnd(14)} ${String(txt).slice(0, 150)}`);
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
const slug = MARKA.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const invPath = path.join(outDir, `content-${slug}-${stamp}.json`);
const inventory = {
  applied_at: new Date().toISOString(),
  marka: MARKA,
  manifest: path.basename(manifestPath),
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
