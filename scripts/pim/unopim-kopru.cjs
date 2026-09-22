#!/usr/bin/env node
'use strict'
/**
 * REC-357 §3.3 — AKTARIM KÖPRÜSÜ: UnoPim REST → yerel gölge `pim_golge.pim_onizleme` (TEK YÖN).
 *
 * Ne yapar: UnoPim'deki ailenin ürünlerini SALT-OKUMA API anahtarıyla okur, `technical_specs` biçimine
 * geri çevirir (`specsCevir`, türetilen alanlar dahil), `pim_onizleme.urun`a YALNIZ DEĞİŞENİ yazar, sonra
 * önizlemeyi aynı DB'deki `products` kopyasıyla karşılaştırır (gölge ↔ PIM farkı).
 *
 * ⛔YAZMA SINIRI (red-team B4, kural 13'ün ruhu): hedef YALNIZ yerel Supabase konteynerindeki `pim_golge`
 * veritabanı ve onun `pim_onizleme` şeması. `arama_golge`'ye (URUN'un) ve CANLIYA hiç yazılmaz — hedef
 * adı sabittir, ortamdan değiştirilemez. UnoPim'e geri yazma YOK (anahtar zaten salt okuma: yazma 403, ölçüldü).
 *
 * KOŞUM: UNOPIM_SIR_DOSYASI=<.sirlar/kopru-okuma.json> node scripts/pim/unopim-kopru.cjs [aile_kodu]
 * Çıktı: eklenen / güncellenen / değişmeyen sayısı + gölge ile fark listesi. İkinci koşum = 0 değişiklik.
 */
const { spawnSync } = require('node:child_process')
const { istemci, specsCevir } = require('./unopim.cjs')

const KONTEYNER = 'supabase_db_venthub-hvac'
const HEDEF_DB = 'pim_golge' // SABİT — ortamdan okunmaz
const AILE = process.argv[2] || 'vortice_lineo_quiet'

function psql(sql) {
  const r = spawnSync('docker', ['exec', '-i', KONTEYNER, 'psql', '-U', 'postgres', '-d', HEDEF_DB, '-v', 'ON_ERROR_STOP=1', '-At', '-q'], {
    input: sql, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  })
  if (r.status !== 0) throw new Error(`psql ${r.status}: ${(r.stderr || '').slice(0, 400)}`)
  return r.stdout.trim()
}

/** Dolar-alıntı etiketi, içerikte geçmeyecek biçimde seçilir (SQL enjeksiyonu yok). */
function dolar(metin) {
  let e = 'kopru'
  while (metin.includes(`$${e}$`)) e += 'x'
  return `$${e}$${metin}$${e}$`
}

async function urunleriOku(api) {
  const out = []
  for (let sayfa = 1; ; sayfa++) {
    const r = await api('GET', `products?limit=100&page=${sayfa}`)
    if (r.durum !== 200) throw new Error(`products sayfa ${sayfa}: ${r.durum}`)
    out.push(...(r.json.data ?? []).filter((u) => u.family === AILE))
    if (!r.json.last_page || sayfa >= r.json.last_page) break
  }
  return out
}

async function main() {
  if (psql("select current_database()") !== HEDEF_DB) throw new Error('hedef DB dogrulanamadi')
  const api = istemci()
  const urunler = await urunleriOku(api)
  if (!urunler.length) throw new Error(`UnoPim'de '${AILE}' ailesinde urun yok — koprude yazilacak bir sey yok (bos sonuc basari degil)`)

  const satirlar = []
  const bilinmeyen = new Set()
  for (const u of urunler) {
    const { specs, bilinmeyen: b } = specsCevir(u)
    b.forEach((x) => bilinmeyen.add(x))
    satirlar.push({ sku: u.sku, aile: u.family, ad: u.values?.channel_locale_specific?.default?.en_US?.name ?? null,
      technical_specs: specs, unopim_guncelleme: u.updated_at })
  }

  const json = JSON.stringify(satirlar)
  const sonuc = psql(`
create schema if not exists pim_onizleme;
create table if not exists pim_onizleme.urun (
  sku text primary key, aile text not null, ad text, technical_specs jsonb not null,
  unopim_guncelleme timestamptz, alindi timestamptz not null default now()
);
with gelen as (
  select * from jsonb_to_recordset(${dolar(json)}::jsonb)
    as g(sku text, aile text, ad text, technical_specs jsonb, unopim_guncelleme timestamptz)
), yaz as (
  insert into pim_onizleme.urun as u (sku, aile, ad, technical_specs, unopim_guncelleme)
  select sku, aile, ad, technical_specs, unopim_guncelleme from gelen
  on conflict (sku) do update set aile = excluded.aile, ad = excluded.ad,
    technical_specs = excluded.technical_specs, unopim_guncelleme = excluded.unopim_guncelleme, alindi = now()
  where (u.aile, u.ad, u.technical_specs) is distinct from (excluded.aile, excluded.ad, excluded.technical_specs)
  returning (xmax = 0) as yeni
)
select count(*) filter (where yeni) || ' ' || count(*) filter (where not yeni) from yaz;
`)
  const [eklenen, guncellenen] = sonuc.split('\n').pop().split(/\s+/).map(Number)
  if (![eklenen, guncellenen].every(Number.isInteger)) throw new Error(`yazma sayaci okunamadi: ${sonuc.slice(0, 200)}`)
  const fark = psql(`
select o.sku || ' | ' || coalesce(k.key, '(tum satir)') || ' | golge=' || coalesce(p.technical_specs -> k.key, 'null') ||
       ' | pim=' || coalesce(o.technical_specs -> k.key, 'null')
from pim_onizleme.urun o
left join public.products p on p.sku = o.sku and p.deleted_at is null
left join lateral (
  select key from (select jsonb_object_keys(o.technical_specs) as key
                   union select jsonb_object_keys(coalesce(p.technical_specs, '{}'::jsonb))) k0
  where p.technical_specs -> key is distinct from o.technical_specs -> key
) k on true
where o.aile = ${dolar(AILE)} and (p.sku is null or k.key is not null)
order by 1;`)
  const farklar = fark ? fark.split('\n') : []
  console.log(`kopru ${AILE}: UnoPim ${urunler.length} urun · eklenen ${eklenen} · guncellenen ${guncellenen} · degismeyen ${urunler.length - eklenen - guncellenen}`)
  if (bilinmeyen.size) console.log(`  ⚠tanimsiz oznitelik (onizlemeye YAZILMADI): ${[...bilinmeyen].join(', ')}`)
  console.log(`  golge(products) ↔ pim_onizleme farki: ${farklar.length}`)
  for (const f of farklar.slice(0, 20)) console.log('   ', f)
}

main().catch((e) => { console.error(`kopru: ${e.message}`); process.exitCode = 1 })
