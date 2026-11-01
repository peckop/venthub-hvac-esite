#!/usr/bin/env node
/**
 * INV-MALIYET-KOLON-2 nöbetçisi — anon rolü products'ın MALİYET kolonlarını okuyamaz, vitrin kolonlarını okuyabilir.
 *
 * ALT-73 (karar 412 (a)). Ölçüldü (2026-11-01, canlı, salt okuma): anon, products üzerinde tablo düzeyi SELECT'e
 * sahipti ve 7 maliyet kolonu (alış fiyatı, para birimi, kur, taban maliyet, son alış maliyeti/para birimi/zamanı)
 * sitenin herkese açık anahtarıyla okunabiliyordu. Migration 20261101150000 tablo düzeyi SELECT'i alıp hassas
 * olmayan kolonlara kolon düzeyi SELECT verir. Bu nöbetçi o durumun CANLI KATALOGDA sürdüğünü ölçer
 * (depo metninden değil: panelden ya da elle verilen bir GRANT hiçbir migration'da görünmez).
 *
 * Ölçüm: has_column_privilege('anon', 'public.products', kolon, 'select') — tablo düzeyi yetki de kolonu
 * okunabilir sayar, yani iki yol da tek sorguda yakalanır. Değerlere HİÇ dokunulmaz (veri okunmaz, yalnız katalog).
 *
 * Hüküm:
 *  - Hassas kolon anon'a okunabilir  -> KIRMIZI (zarar geri geldi).
 *  - Hassas kolon katalogda YOK      -> KIRMIZI (kolon yeniden adlandırıldı: nöbetçi ve migration bayat, fail-closed).
 *  - Çekirdek vitrin kolonu okunamaz -> KIRMIZI (vitrin kırık: permission denied).
 *  - Başka bir hassas olmayan kolon okunamaz -> ::warning (yeni kolon anon'a grant edilmemiş; vitrin seçerse 42501).
 * Ölçememek geçmek değildir: SUPABASE_DB_URL yoksa ya da sorgu patlarsa KIRMIZI.
 *
 * ⚠SINIR (adıyla): yalnız `anon` ölçülür. `authenticated` hâlâ okuyabilir (kayıt açık) — kapanışı ALT-73 Aşama B.
 * Bu nöbetçi onu KIRMIZI saymaz; saysaydı doğar doğmaz kırmızı olurdu ve güvenilmez hâle gelirdi.
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import pg from 'pg'

import { resolveTls } from '../../katalog/katalog-sayim.mjs'

/** Anon'a KAPALI olması gereken maliyet kolonları (migration 20261101150000 ile aynı liste). */
export const HASSAS_KOLONLAR = [
  'purchase_price',
  'purchase_currency',
  'purchase_rate_to_base',
  'cost_in_base',
  'last_purchase_cost',
  'last_purchase_currency',
  'last_purchased_at',
  'supplier_name', // tedarikçi adı: canlıda VAR (2026-11-01 ölçüldü), maliyet/tedarik sınıfı
]

/** Vitrinin her sayfada seçtiği; okunamazsa site kırılır. */
export const CEKIRDEK_KOLONLAR = ['id', 'name', 'sku', 'status', 'family_id']

const SORGU = `
  select a.attname::text as kolon,
         has_column_privilege('anon', 'public.products', a.attnum, 'select') as okunabilir
    from pg_attribute a
   where a.attrelid = 'public.products'::regclass
     and a.attnum > 0
     and not a.attisdropped
`

/** Migration uygulandı mı? display_price(uuid) aşırı yüklemesi yalnız ALT-73 migration'ıyla gelir. */
const UYGULANDI_SORGU = "select to_regprocedure('public.display_price(uuid)') is not null as uygulandi"

/**
 * Saf karar: katalog satırlarından hüküm çıkarır (ağ/DB yok; testlenir).
 * `uygulandi === false` (migration henüz prod'a inmedi): PR koşumunda canlı katalog doğal olarak eski durumdadır;
 * bu KIRMIZI sayılmaz, açıkça "beklemede" denir (birleşme + supabase-migrate sonrası ilk koşum gerçek ölçümdür).
 * @param {Array<{kolon: string, okunabilir: boolean}>} satirlar
 * @param {{uygulandi?: boolean}} [baglam]
 */
export function degerlendir(satirlar, baglam = {}) {
  if (baglam.uygulandi === false) {
    return {
      toplam: satirlar.length,
      acik: [],
      eksik: [],
      cekirdekKapali: [],
      digerKapali: [],
      kirmizi: false,
      uyari: false,
      beklemede: true,
    }
  }
  const harita = new Map(satirlar.map((s) => [s.kolon, s.okunabilir === true]))
  const acik = HASSAS_KOLONLAR.filter((k) => harita.get(k) === true)
  const eksik = HASSAS_KOLONLAR.filter((k) => !harita.has(k))
  const cekirdekKapali = CEKIRDEK_KOLONLAR.filter((k) => harita.get(k) !== true)
  const digerKapali = [...harita.entries()]
    .filter(([k, ok]) => !ok && !HASSAS_KOLONLAR.includes(k) && !CEKIRDEK_KOLONLAR.includes(k))
    .map(([k]) => k)
  const kirmizi = acik.length > 0 || eksik.length > 0 || cekirdekKapali.length > 0
  const uyari = !kirmizi && digerKapali.length > 0
  return { toplam: satirlar.length, acik, eksik, cekirdekKapali, digerKapali, kirmizi, uyari, beklemede: false }
}

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL
  if (!dbUrl) {
    console.error(
      '::error title=maliyet kolon nobetcisi::SUPABASE_DB_URL yok — nobetci OLCEMEDI. Olcememek gecmek DEGILDIR.',
    )
    process.exit(1)
  }
  // sslmode bağlantı dizesinden sökülür (kardeş nöbetçilerle aynı gerekçe: doğrulanmış CA sessizce düşmesin).
  const temizUrl = dbUrl.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
  const client = new pg.Client({ connectionString: temizUrl, ssl: resolveTls() })
  await client.connect()
  let satirlar
  let uygulandi
  try {
    satirlar = (await client.query(SORGU)).rows
    uygulandi = (await client.query(UYGULANDI_SORGU)).rows[0]?.uygulandi === true
  } finally {
    await client.end()
  }

  const o = degerlendir(satirlar, { uygulandi })
  if (o.beklemede) {
    console.error(
      '::notice title=maliyet kolon nobetcisi::ALT-73 migration\'i canli veritabanina HENUZ UYGULANMAMIS (display_price(uuid) yok) — ' +
        'olcum BEKLEMEDE, gecmis sayilmaz. Birlesme + supabase-migrate sonrasi ilk kosumda gercek olcum yapilir.',
    )
    return
  }
  console.error(
    `maliyet-kolon-nobetcisi: ${o.toplam} kolon olculdu; anon'a acik hassas kolon sayisi=${o.acik.length}, eksik hassas=${o.eksik.length}`,
  )

  if (o.acik.length > 0) {
    console.error(
      `::error title=maliyet kolon nobetcisi::anon su maliyet kolonlarini OKUYABILIYOR: ${o.acik.join(', ')} — site anahtari herkese acik, zarar geri geldi (ALT-73).`,
    )
  }
  if (o.eksik.length > 0) {
    console.error(
      `::error title=maliyet kolon nobetcisi::hassas kolon katalogda YOK (${o.eksik.join(', ')}) — yeniden adlandirilmis olabilir; nobetci ve migration listesi guncellenmeli.`,
    )
  }
  if (o.cekirdekKapali.length > 0) {
    console.error(
      `::error title=maliyet kolon nobetcisi::vitrin cekirdek kolonu anon icin OKUNAMIYOR: ${o.cekirdekKapali.join(', ')} — vitrin permission denied verir.`,
    )
  }
  if (o.kirmizi) {
    console.error(
      "YAPILACAK: yetkiyi kapat (`revoke select (<kolon>) on public.products from anon` + tablo duzeyi SELECT varsa kaldir) ya da vitrin kolonuna `grant select (<kolon>) on public.products to anon`. Geri alma: scripts/db/rollback/20261101150000_alt73_anon_maliyet_kolon_kilidi_geri_al.sql",
    )
    process.exit(1)
  }
  if (o.uyari) {
    console.error(
      `::warning title=maliyet kolon nobetcisi::anon su hassas olmayan kolonlari okuyamiyor: ${o.digerKapali.join(', ')} — yeni kolon anon'a grant edilmemis olabilir; vitrin secerse 42501 alir.`,
    )
  }
  console.error('maliyet-kolon-nobetcisi: TEMIZ — anon maliyet kolonlarini okuyamiyor, vitrin cekirdegi okunuyor.')
}

// Yalnız doğrudan koşulunca main() çalışır; test `degerlendir`i içe aktarır.
if (import.meta.url === pathToFileURL(path.resolve(process.argv[1] ?? '')).href) {
  main().catch((e) => {
    console.error(`::error title=maliyet kolon nobetcisi::nobetci KOSAMADI: ${e.message}`)
    process.exit(1)
  })
}
