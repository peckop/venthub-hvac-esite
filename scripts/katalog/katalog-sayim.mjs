#!/usr/bin/env node
/**
 * Katalog sayımı — TEK KAYNAK (REC-136).
 *
 * NİÇİN VAR (2026-09-04, Recep'in tespiti): *"ölçümler hem tekrar hem hatalı, bu nasıl iş."*
 * Haklıydı ve payım vardı. Aynı gün aynı katalog soruları elle yazılmış farklı SQL'lerle
 * dört kez soruldu ve **üç kez yanlış cevaplandı**:
 *   · "624 önek-eksik galeri alt metni" → 624 aslında SKU'nun tam dizesini taşımayanlardı;
 *     gerçek kusur 6 satırdı ve yazım yapılsaydı erişilebilirlik BOZULACAKTI.
 *   · "375 ürünün tamamı kökte" → yalnız `category_id`'ye bakılmıştı; `subcategory_id`'de 365 dolu.
 *   · Kök başına ürün sayımı bir LATERAL birleşimde çarpıldı; anahtar sayısı ürün sanıldı.
 * Her biri tek başına dikkatsizlik gibi görünür; ÜÇÜ BİRDEN sistem kusurudur: **sayının
 * üretildiği yer her seferinde yeniden icat ediliyordu.**
 *
 * KURAL: *sayısal bir katalog iddiası, bu tabloyu kaynak göstermeden yapılmaz.*
 * Panoya, Linear'a, PR gövdesine yazılan her katalog sayısı buradan gelir.
 *
 * NE ÖLÇMEZ — bilerek: "bu ürün doğru dalda mı" gibi YARGI soruları. Ölçülseydi "kapı var"
 * sanılırdı. Bu bir KAPI DEĞİL, bir SAYAÇTIR: kırmızı vermez, sayı üretir.
 *
 * ⭐SAYIM SÖZLEŞMESİ — yukarıdaki üç hatanın ikisi buraya kural olarak yazıldı:
 *  1. **Ağaç ataması `subcategory_id`'dedir**; `category_id` yalnız kökü taşır. Yalnız birine
 *     bakan her sorgu yanlış cevap verir — aşağıdaki sayımlar İKİSİNİ de anar.
 *  2. **`jsonb_each_text` satır ÇOĞALTIR.** O birleşimde `count(*)` ürünü değil ANAHTARI sayar;
 *     ürün gereken her yerde `count(DISTINCT ...)` yazılıdır.
 *
 * YERLEŞİM NOTU: `scripts/db/checks/**` ALTYAPI şeridinindir ve şerit kapısı yazmayı
 * (doğru biçimde) reddetti. Bash ile aşılmadı; sayaç katalog işine hizmet ettiği için
 * sahipsiz `scripts/katalog/` altına kondu. ALTYAPI isterse taşınabilir.
 *
 * KOŞTURMA:
 *   SUPABASE_DB_URL=... node scripts/katalog/katalog-sayim.mjs [--json] [--yaz]
 *   --yaz → docs/audits/katalog-sayim-<YYYY-MM-DD>.md + .json
 * Bağlantı dizesi yoksa ÇIKIŞ 1 ve "ÖLÇÜLEMEDİ" — boş tablo ya da "0 kayıt" DÖNMEZ.
 * Yoklukla ölçmek, bu betiğin düzeltmek için yazıldığı hatanın ta kendisidir.
 */
import fs from 'node:fs'
import path from 'node:path'
import tls from 'node:tls'
import { fileURLToPath } from 'node:url'

import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_KOK = path.join(__dirname, '..', '..')

/** `catalog-integrity.mjs` ile AYNI çözüm — kopya değil, aynı tuzağın aynı cevabı. */
function resolveTls() {
  const caPath = process.env.PGSSLROOTCERT
  if (!caPath) return { rejectUnauthorized: true }
  const provided = fs.readFileSync(caPath, 'utf8')
  const blocks = (provided.match(/-----BEGIN CERTIFICATE-----/g) ?? []).length
  if (blocks === 0) {
    throw new Error(`PGSSLROOTCERT bir PEM sertifikasi degil (BEGIN CERTIFICATE blogu yok, ${provided.length} bayt).`)
  }
  return { ca: [...tls.rootCertificates, provided], rejectUnauthorized: true }
}

/**
 * Sayımlar: her biri bir SORU ve o sorunun TEK doğru sorgusu.
 * Yeni bir katalog sorusu doğduğunda buraya eklenir — PR gövdesine elle SQL yazılmaz.
 */
const SAYIMLAR = [
  {
    id: 'ozet',
    baslik: 'Özet',
    sql: `select
            (select count(*) from public.products where deleted_at is null)              as urun,
            (select count(*) from public.product_families)                                as aile,
            (select count(*) from public.categories)                                      as kategori,
            (select count(*) from public.categories where parent_id is null)              as kok,
            (select count(*) from public.categories where parent_id is not null)          as dal,
            (select count(*) from public.categories where is_active)                      as aktif_kategori,
            (select count(distinct brand) from public.products where brand is not null)   as marka`,
  },
  {
    id: 'agac',
    baslik: 'Kök başına dal ve ürün',
    // ⭐Ürün köke `category_id`, dala `subcategory_id` ile bağlanır. İkisi AYRI sayılır.
    sql: `select k.name as kok, k.slug, k.is_active,
                 (select count(*) from public.categories ch where ch.parent_id = k.id) as dal_sayisi,
                 (select count(*) from public.products p
                    where p.category_id = k.id and p.deleted_at is null)                as urun,
                 (select count(*) from public.products p
                    join public.categories s on s.id = p.subcategory_id
                   where s.parent_id = k.id and p.deleted_at is null)                    as dalda_urun
            from public.categories k
           where k.parent_id is null
           order by urun desc, k.name`,
  },
  {
    id: 'dalsiz',
    baslik: 'Dalsız ürün / aile ve bütünlük',
    sql: `select
            (select count(*) from public.products
              where subcategory_id is null and deleted_at is null)         as dalsiz_urun,
            (select count(*) from public.product_families
              where subcategory_id is null)                                as dalsiz_aile,
            (select count(*) from public.products p
               left join public.categories s on s.id = p.subcategory_id
              where p.subcategory_id is not null and s.id is null)         as yetim_referans,
            (select count(*) from public.products p
               join public.categories s on s.id = p.subcategory_id
              where s.parent_id is distinct from p.category_id)            as ust_uyusmazligi`,
  },
  {
    id: 'bos_dal',
    baslik: 'Ürün almayan dal',
    sql: `select par.name as ust, c.name as dal, c.slug, c.is_active
            from public.categories c
            join public.categories par on par.id = c.parent_id
           where not exists (select 1 from public.products p
                              where p.subcategory_id = c.id and p.deleted_at is null)
           order by c.is_active desc, par.name, c.name`,
  },
  {
    id: 'spec_doluluk',
    baslik: 'technical_specs doluluğu (kök başına)',
    // ⭐count(DISTINCT p.id): jsonb açılımı satır çoğaltır, count(*) burada ANAHTAR sayardı.
    sql: `with u as (
            select p.id,
                   coalesce(par.name, k.name) as kok,
                   (select count(*) from jsonb_each_text(p.technical_specs) kv
                     where btrim(kv.value) <> '')::int as anahtar
              from public.products p
              join public.categories k on k.id = p.category_id
              left join public.categories par on par.id = k.parent_id
             where p.deleted_at is null
               and p.technical_specs is not null
               and p.technical_specs::text not in ('{}','null'))
          select kok,
                 count(*)                              as specli_urun,
                 min(anahtar)                          as en_az_anahtar,
                 round(avg(anahtar)::numeric, 1)       as ortalama_anahtar,
                 max(anahtar)                          as en_cok_anahtar,
                 count(*) filter (where anahtar <= 3)  as seyrek_urun
            from u group by kok order by specli_urun desc`,
  },
]

async function olc(connectionString) {
  const hadSslMode = /[?&]sslmode=/.test(connectionString)
  const cleaned = connectionString.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
  if (hadSslMode) console.error('katalog-sayim: baglanti dizesindeki sslmode kaldirildi (TLS ayari kodda)')

  const client = new pg.Client({ connectionString: cleaned, ssl: resolveTls() })
  await client.connect()
  const sonuc = {}
  try {
    for (const s of SAYIMLAR) sonuc[s.id] = (await client.query(s.sql)).rows
  } finally {
    await client.end()
  }
  return sonuc
}

function tabloya(satirlar) {
  if (!satirlar || satirlar.length === 0) return '_(kayıt yok)_\n'
  const basliklar = Object.keys(satirlar[0])
  return [
    `| ${basliklar.join(' | ')} |`,
    `| ${basliklar.map(() => '---').join(' | ')} |`,
    ...satirlar.map((r) => `| ${basliklar.map((b) => String(r[b] ?? '')).join(' | ')} |`),
  ].join('\n') + '\n'
}

function markdown(sonuc, tarih) {
  const p = [
    `# Katalog sayımı — ${tarih}`,
    '',
    'Bu dosya **üretilmiştir** (`scripts/katalog/katalog-sayim.mjs`). Elle düzenlenmez.',
    '',
    '> **Sayısal bir katalog iddiası bu tabloyu kaynak göstermeden yapılmaz** (REC-136).',
    '> Sebebi ölçülmüş bir olaydır: aynı sorular elle yazılan farklı SQL\'lerle tekrar tekrar',
    '> soruldu ve üç kez yanlış cevaplandı. Sayının üretildiği yer TEK olmalı.',
    '',
    '⚠**Bu bir KAPI DEĞİL, bir SAYAÇTIR.** Kırmızı vermez; "bu ürün doğru dalda mı" gibi',
    'YARGI gerektiren soruları ölçmez — ölçseydi var olmayan bir kapı sanılırdı.',
    '',
  ]
  for (const s of SAYIMLAR) p.push(`## ${s.baslik}`, '', tabloya(sonuc[s.id]), '')
  p.push(
    '## Sayım sözleşmesi — iki tuzak',
    '',
    '1. **Ağaç ataması `subcategory_id`\'dedir**; `category_id` yalnız kökü taşır. Yalnız birine',
    '   bakan sorgu yanlış cevap verir — 2026-09-04\'te "375 ürün kökte" tam bu yüzden denildi.',
    '2. **`jsonb_each_text` satır çoğaltır**; o birleşimde `count(*)` ürünü değil ANAHTARI sayar.',
    '',
  )
  return p.join('\n')
}

async function main() {
  const asJson = process.argv.includes('--json')
  const yaz = process.argv.includes('--yaz')
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

  if (!connectionString) {
    console.error('katalog-sayim: OLCULEMEDI — baglanti dizesi yok (SUPABASE_DB_URL). Sayi URETILMEDI.')
    process.exit(1)
  }

  const sonuc = await olc(connectionString)
  const tarih = new Date().toISOString().slice(0, 10)

  console.log(asJson ? JSON.stringify({ tarih, sonuc }, null, 2) : markdown(sonuc, tarih))

  if (yaz) {
    const dizin = path.join(REPO_KOK, 'docs', 'audits')
    fs.mkdirSync(dizin, { recursive: true })
    fs.writeFileSync(path.join(dizin, `katalog-sayim-${tarih}.md`), markdown(sonuc, tarih), 'utf8')
    fs.writeFileSync(path.join(dizin, `katalog-sayim-${tarih}.json`), JSON.stringify({ tarih, sonuc }, null, 2), 'utf8')
    console.error(`katalog-sayim: yazildi → docs/audits/katalog-sayim-${tarih}.md + .json`)
  }
}

main().catch((e) => {
  console.error('katalog-sayim: HATA —', e.message)
  process.exit(1)
})
