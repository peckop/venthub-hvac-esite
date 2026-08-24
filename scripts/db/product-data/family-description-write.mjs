#!/usr/bin/env node
/**
 * AİLE AÇIKLAMASI YAZIMI — `product_families.description` (JSONB `{tr, en}`).
 *
 * `content-write.mjs` ürünün `technical_specs`'ini yazar; bu betik AİLENİN vitrin metnini
 * yazar. Ayrı tablo, ayrı alan, ayrı risk: burada yazılan şey doğrudan müşterinin okuduğu
 * cümledir ve yanlış olduğunda "veri eksik" gibi değil, **yanlış teknik bilgi** gibi davranır.
 *
 * VARSAYILAN = DRY-RUN. Yazım YALNIZ `--apply` + service_role + kullanıcı GO'su ile.
 *
 * ⭐ÇAP ÖN KOŞULU (bu betiğin varlık sebebi):
 * Manifest'te bir aile için `diameter_mm` yazıyorsa, o değer ailenin ÜRÜNLERİNDEN yeniden
 * ölçülür (`technical_specs->>'diameter_mm'`) ve eşleşmezse **hiç yazılmaz**. Sebep şu:
 * 2026-08-21 model bölme pilotunda model ailelerine SERİ açıklaması olduğu gibi kopyalandı
 * ve beş modelde "100 mm çaplı" yazan bir metin doğdu. Metin veriden koptuğunda hiçbir tip
 * hatası, hiçbir kırmızı test oluşmaz — yalnız müşteri yanlış okur. Kapı tam o kopmayı ölçer.
 *
 * Kullanım:
 *   node family-description-write.mjs --manifest <dosya> --url <URL> --key <ANON>
 *   node family-description-write.mjs --manifest <dosya> --url <URL> --key <SERVICE> --apply --out <dizin>
 *   node family-description-write.mjs --rollback <envanter.json> --url <URL> --key <SERVICE>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const arg = (n, def = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : def; };
const has = (n) => process.argv.includes(`--${n}`);
const dbUrl = arg('url'), dbKey = arg('key'), outDir = arg('out', '.');
const APPLY = has('apply'), ROLLBACK = arg('rollback');
const manifestArg = arg('manifest', 'vortice-lineo-descriptions.json');

if (!dbUrl || !dbKey) {
  console.error('kullanım: --manifest <dosya> --url <URL> --key <KEY> [--apply] [--out <dizin>]');
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

if (ROLLBACK) {
  const inv = JSON.parse(fs.readFileSync(ROLLBACK, 'utf8'));
  console.log(`GERI ALMA: ${path.basename(ROLLBACK)} (${inv.items?.length ?? 0} aile)`);
  let restored = 0;
  for (const it of inv.items ?? []) {
    const r = await rest(`product_families?id=eq.${it.id}`, 'PATCH', { description: it.previous_description });
    restored += r.length;
  }
  console.log(`  ${restored} aile eski aciklamasina donduruldu`);
  if (restored !== (inv.items?.length ?? 0)) { console.error('⚠ EKSIK GERI ALMA — ELLE INCELE.'); process.exit(1); }
  console.log('GERI ALMA TAMAM.');
  process.exit(0);
}

const manifestPath = path.isAbsolute(manifestArg) ? manifestArg : path.join(__dirname, manifestArg);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
console.log(`MANIFEST: ${path.basename(manifestPath)} — ${manifest.families.length} aile`);

const slugs = manifest.families.map(f => f.slug);
const fams = await rest(`product_families?slug=in.(${slugs.join(',')})&deleted_at=is.null&select=id,slug,description,parent_family_id`);

const violations = [];
const writes = [];

for (const m of manifest.families) {
  const fam = fams.find(f => f.slug === m.slug);
  if (!fam) { violations.push(`${m.slug}: aile DB'de bulunamadi`); continue; }

  // Manifest "seri" mi "model" mi diyor — DB ile tutuyor mu?
  const dbKind = fam.parent_family_id === null ? 'seri' : 'model';
  if (m.kind !== dbKind) violations.push(`${m.slug}: manifest "${m.kind}" diyor, DB "${dbKind}"`);

  // ⭐ÇAP ÖN KOŞULU — metin veriden kopmuş mu?
  if (m.diameter_mm != null) {
    const prods = await rest(`products?family_id=eq.${fam.id}&deleted_at=is.null&select=sku,technical_specs`);
    const capSet = new Set(prods.map(p => p.technical_specs?.diameter_mm).filter(v => v != null).map(String));
    if (capSet.size === 0) {
      violations.push(`${m.slug}: manifest cap ${m.diameter_mm} diyor ama urunlerde diameter_mm YOK — dogrulanamaz`);
    } else if (capSet.size > 1) {
      violations.push(`${m.slug}: urunlerde BIRDEN COK cap var (${[...capSet].join(', ')}) — tek capli metin yazilamaz`);
    } else if (![...capSet][0].startsWith(String(m.diameter_mm))) {
      violations.push(`${m.slug}: manifest cap ${m.diameter_mm}, URUN VERISI ${[...capSet][0]} — METIN VERIDEN KOPUK`);
    }
  }

  const before = fam.description ?? {};
  const next = { ...before, tr: m.tr, en: m.en };
  const trChanged = before.tr !== m.tr;
  const enChanged = before.en !== m.en;
  if (!trChanged && !enChanged) { console.log(`  ${m.slug}: degisiklik yok`); continue; }
  writes.push({ id: fam.id, slug: m.slug, previous_description: before, next_description: next, trChanged, enChanged });
}

console.log(`\n== ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
for (const w of writes) {
  console.log(`\n  ${w.slug}`);
  console.log(`    TR eski: ${String(w.previous_description.tr ?? '').slice(0, 100)}`);
  console.log(`    TR yeni: ${w.next_description.tr.slice(0, 100)}`);
}
console.log(`\n  DEGISECEK: ${writes.length} aile · DOKUNULMAYAN: ${manifest.families.length - writes.length}`);

if (violations.length) {
  console.error(`\n⛔ ON KOSUL IHLALI (${violations.length}) — HIC YAZILMADI:`);
  violations.forEach(v => console.error(`   ${v}`));
  process.exit(3);
}
console.log('\n  on kosullar (aile var · seri/model tutarli · CAP VERIYLE ESLESIYOR): TEMIZ');

if (!APPLY) {
  console.log('\nDRY-RUN — hicbir sey yazilmadi. Yazim icin: --apply + service_role + GO.');
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const invPath = path.join(outDir, `family-desc-${stamp}.json`);
fs.writeFileSync(invPath, JSON.stringify({
  applied_at: new Date().toISOString(), status: 'STARTED',
  manifest: path.basename(manifestPath),
  items: writes.map(w => ({ id: w.id, slug: w.slug, previous_description: w.previous_description })),
}, null, 2));
console.log(`\nAPPLY — envanter once yazildi: ${invPath}`);

let ok = 0;
for (const w of writes) {
  const r = await rest(`product_families?id=eq.${w.id}`, 'PATCH', { description: w.next_description });
  ok += r.length;
}
fs.writeFileSync(invPath, JSON.stringify({
  applied_at: new Date().toISOString(), status: 'DONE', written: ok,
  manifest: path.basename(manifestPath),
  items: writes.map(w => ({ id: w.id, slug: w.slug, previous_description: w.previous_description })),
}, null, 2));

console.log(`YAZIM TAMAM: ${ok}/${writes.length} aile`);
console.log(`GERI ALMA: node ${path.basename(process.argv[1])} --rollback ${invPath} --url <URL> --key <SERVICE_ROLE>`);
if (ok !== writes.length) { console.error(`⚠ UYARI: ${ok} != ${writes.length}`); process.exit(1); }
