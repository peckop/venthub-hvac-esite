#!/usr/bin/env node
/**
 * INV-RLS-COVERAGE-1 — kodun OKUDUĞU ile DB'nin İZİN VERDİĞİ ayrışmasın.
 *
 * NİÇİN VAR (ölçülmüş sınıf, bugün üçüncü örneği)
 *
 * RLS açık bir tabloya yetki verilmiş olması, o tabloyu okuyabileceğin anlamına GELMEZ:
 * satır kapısı politikadır. Politika okuyan ROLE yazılmamışsa sorgu hata vermez —
 * **boş döner**. Yüzey "kayıt yok" gösterir, log temizdir, kimse bakmaz. Bu depoda üç kez
 * yaşandı: T062 (warehouse → purchasing), T063 (moderator → KVKK defteri), ve
 * `client_errors` (admin hata sayfası 39 gerçek hatayı SIFIR gösteriyor).
 *
 * KURALIN İKİ KEZ DARALTILDIĞI YER — bu kapının asıl değeri burada:
 *
 *   (1) "RLS açık + GRANT var + politika YOK = kırmızı" → tüm şemada 1 tablo buluyor
 *       (`_migration_ledger`) ve asıl kusuru (`client_errors`) KAÇIRIYOR, çünkü orada
 *       iki politika VAR — ama ikisi de yalnız `service_role` için.
 *   (2) "(komut, rol) bazlı: SELECT verilmiş ama o rolü kapsayan politika yok" → 16 çift
 *       buluyor, ve çoğu DOĞRU TASARIM: `payment_transactions`'ta `authenticated`,
 *       `suppliers`/`purchase_orders`'ta `anon` zaten okumamalı. Oradaki GRANT varsayılan
 *       ACL artığıdır ve RLS doğru şekilde engeller. **Politika yokluğu tek başına kusur
 *       değildir; çoğu zaman güvenli hâldir.**
 *
 * DOĞRU SORU — ve bu kapının sorduğu soru: *kodda o tabloyu okuyan bir yüzey varken,
 * okuyan rolün politikası var mı?* Şema tek başına yetmez, KOD ile kesişim gerekir.
 * Ölçüldü: kesişim 16 adaydan **tek** gerçek bulguya iniyor ve o da zaten gözlenen kusur.
 *
 * KAPSAM: yönetim yüzeyleri (`src/views/admin`, `src/lib/admin`, `src/components/admin`)
 * tarayıcıdan **`authenticated`** rolüyle okur. Edge fonksiyonları `service_role` ile
 * okur ve RLS'i ilgilendirmez — bu yüzden burada YOK. Vitrin (`anon`) yüzeyleri ayrı bir
 * sorudur ve bilinçli olarak kapsam dışıdır (oradaki boşluk "veri sızıyor mu" sorusudur,
 * "boş mu görünüyor" değil).
 *
 * ÇIRÇIR: bugünkü ihlalin onarımı bir MIGRATION'dır (= prod'a otomatik uygulama, Recep
 * kapısı). Kapı bu yüzden "sıfır ihlal" istemez; bilinenleri `rls-role-coverage-baseline.json`
 * içinde GEREKÇESİYLE tutar ve tabanın dışındaki her yeni ihlalde kırmızı olur. Taban
 * yalnız küçülebilir.
 *
 * KOŞTURMA:
 *   SUPABASE_DB_URL=... node scripts/db/checks/rls-role-coverage.mjs [--json]
 * Bağlantı dizesi yoksa çıkış kodu 2'dir ve "ÖLÇÜLEMEDİ" der — "geçti" DEMEZ.
 */
import pg from 'pg'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KOK = path.resolve(__dirname, '../../..')
const BASELINE_PATH = path.join(__dirname, 'rls-role-coverage-baseline.json')
const CA_PATH = path.join(__dirname, 'supabase-root-2021-ca.pem')

/** `authenticated` rolüyle okuyan yüzeyler. */
const YONETIM_DIZINLERI = ['src/views/admin', 'src/lib/admin', 'src/components/admin']

/** Kodda okunan tabloları çıkar: `.from('tablo')`. */
function kodunOkuduguTablolar() {
  const tablolar = new Set()
  const dosyalar = []

  const yuru = (d) => {
    if (!fs.existsSync(d)) return
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name)
      if (f.isDirectory()) {
        if (f.name !== '__tests__') yuru(p)
      } else if (/\.tsx?$/.test(f.name) && !/\.test\.tsx?$/.test(f.name)) {
        dosyalar.push(p)
      }
    }
  }
  for (const d of YONETIM_DIZINLERI) yuru(path.join(KOK, d))

  for (const p of dosyalar) {
    const kaynak = fs.readFileSync(p, 'utf8')
    for (const m of kaynak.matchAll(/\.from\(\s*['"]([a-z_][a-z0-9_]*)['"]/g)) {
      tablolar.add(m[1])
    }
  }
  return { tablolar: [...tablolar].sort(), dosyaSayisi: dosyalar.length }
}

const SORGU = `
  with rls as (
    select c.relname::text as tablo
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
  ),
  kapsayan as (
    select distinct p.tablename::text as tablo
    from pg_policies p
    where p.schemaname = 'public'
      and p.cmd in ('SELECT', 'ALL')
      and (p.roles::text[] @> array['public'] or p.roles::text[] @> array['authenticated'])
  )
  select r.tablo,
         (select count(*)::int from pg_policies p
           where p.schemaname = 'public' and p.tablename = r.tablo) as politika_sayisi
  from rls r
  left join kapsayan k on k.tablo = r.tablo
  where k.tablo is null
    and r.tablo = any($1::text[])
  order by r.tablo
`

function tlsAyari() {
  if (!fs.existsSync(CA_PATH)) return { rejectUnauthorized: true }
  return { ca: fs.readFileSync(CA_PATH, 'utf8'), rejectUnauthorized: true }
}

async function semadanTopla(connectionString, tablolar) {
  // `sslmode` URL'den sökülür — node-postgres onu bizim `ssl` nesnemizin YERİNE geçirebiliyor
  // ve kök sertifika sessizce devre dışı kalıyor (catalog-integrity'de ölçülmüş kusur).
  const vardi = /[?&]sslmode=/.test(connectionString)
  const temiz = connectionString.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
  if (vardi) console.log('rls-role-coverage: baglanti dizesindeki sslmode kaldirildi')

  const client = new pg.Client({ connectionString: temiz, ssl: tlsAyari() })
  await client.connect()
  try {
    const { rows } = await client.query(SORGU, [tablolar])
    return rows
  } finally {
    await client.end()
  }
}

function tabaniOku() {
  if (!fs.existsSync(BASELINE_PATH)) return { entries: {} }
  return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
}

async function main() {
  const asJson = process.argv.includes('--json')
  const fixtureIdx = process.argv.indexOf('--fixture')
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

  const { tablolar, dosyaSayisi } = kodunOkuduguTablolar()

  // DEDEKTÖR SAĞLIĞI — kod taraması boşalırsa kapı "ihlal yok" der ve KÖR koşar.
  // Bu, tam olarak bugün üç kez düştüğümüz tuzağın kendisi: yoklukla ölçmek.
  if (dosyaSayisi < 20 || tablolar.length < 10) {
    console.error(
      `rls-role-coverage: OLCULEMEDI — kod taramasi bos/dar dondu ` +
        `(${dosyaSayisi} dosya, ${tablolar.length} tablo). Dizinler tasinmis olabilir. ` +
        `Kapi kor kosmaktansa KIRMIZI doner.`,
    )
    process.exit(2)
  }

  let bulunanlar
  if (fixtureIdx !== -1) {
    // DB'siz sinama yolu: cirkir mantigi ve taban okumasi, semaya bagli olmadan kanitlanabilsin.
    // Kapinin kendisi de sinanabilir olmali — sinanamayan kapi, kanit degil iddiadir.
    bulunanlar = JSON.parse(fs.readFileSync(process.argv[fixtureIdx + 1], 'utf8'))
    console.log(`rls-role-coverage: FIXTURE modu — sema OKUNMADI (${bulunanlar.length} satir verildi)`)
  } else if (!connectionString) {
    console.error(
      'rls-role-coverage: OLCULEMEDI — baglanti dizesi yok (SUPABASE_DB_URL). ' +
        'Kapi olcemedigi icin YESIL DONMUYOR.',
    )
    process.exit(2)
  } else {
    bulunanlar = await semadanTopla(connectionString, tablolar)
  }
  const taban = tabaniOku()

  const bulunanAnahtar = new Map(
    bulunanlar.map((r) => [`authenticated:${r.tablo}`, r]),
  )
  const yeni = [...bulunanAnahtar.entries()].filter(([k]) => !(k in taban.entries))
  const bayat = Object.keys(taban.entries).filter((k) => !bulunanAnahtar.has(k))

  if (asJson) {
    console.log(
      JSON.stringify(
        { taranan_tablo: tablolar.length, bulunan: [...bulunanAnahtar.keys()], yeni: yeni.map(([k]) => k), bayat },
        null,
        2,
      ),
    )
  }

  console.log(
    `rls-role-coverage: kodda okunan ${tablolar.length} tablo tarandi | ` +
      `kapsanmayan ${bulunanAnahtar.size} | tabanda ${bulunanAnahtar.size - yeni.length} | ` +
      `YENI ${yeni.length} | bayat taban satiri ${bayat.length}`,
  )

  // Bayat taban satırı KIRMIZI yapmaz, yalnız uyarır: onarım bir prod yazımıdır ve o an
  // konuyla ilgisi olmayan bir şeridin PR'ını kırmak yanlış-kırmızı olurdu.
  for (const k of bayat) {
    console.log(
      `::warning title=Bayat taban satiri::${k} artik ihlal DEGIL — ${BASELINE_PATH} icinden silinmeli.`,
    )
  }

  if (yeni.length === 0) {
    console.log('rls-role-coverage: tabanin disinda YENI ihlal yok -> YESIL')
    process.exit(0)
  }

  console.log('')
  console.log('rls-role-coverage: TABANIN DISINDA YENI IHLAL VAR -> KIRMIZI')
  for (const [anahtar, satir] of yeni) {
    console.log(`  ${anahtar}  (tabloda ${satir.politika_sayisi} politika var, ama hicbiri authenticated'i kapsamiyor)`)
  }
  console.log('')
  console.log('Yonetim yuzeyi bu tabloyu OKUYOR ama RLS satir vermeyecek: ekranda hata degil')
  console.log('BOS LISTE gorunur. Ya okuyan role SELECT politikasi eklenir (migration = Recep')
  console.log('kapisi), ya yuzey o tabloyu okumayi birakir, ya da bilincli bir karar ise tabana')
  console.log('GEREKCESIYLE yazilir. Gerekcesiz taban satiri kabul edilmez.')
  process.exit(1)
}

main().catch((err) => {
  if (/certificate|self-signed|SELF_SIGNED/i.test(err.message)) {
    console.error('rls-role-coverage: OLCULEMEDI — TLS zinciri dogrulanamadi:', err.message)
    console.error('Kok sertifikayi PGSSLROOTCERT ile verin (dogrulamayi KAPATMAK cozum degildir).')
  } else {
    console.error('rls-role-coverage: kosum HATASI —', err.message)
  }
  process.exit(2)
})
