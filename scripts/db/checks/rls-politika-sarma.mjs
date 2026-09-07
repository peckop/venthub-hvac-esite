#!/usr/bin/env node
/**
 * INV-RLS-SARMA-1 — RLS politika ifadelerinde İÇ İÇE `(SELECT auth.uid())` sarması var mı.
 * Kayıt: REC-216 · Rapor: `C:/tmp/ops-rapor/rls-politika-sismesi-2026-09-07.md`
 *
 * NİÇİN VAR — ölçülmüş vaka (2026-09-07, canlı DB):
 * `public` şemasındaki 11 politikanın ifadesi iç içe `(SELECT ...)` katmanlarıyla şişmişti;
 * en derini **153 katman**, toplam politika ifadesi 25.357 bayt. Kaynak
 * `supabase/migrations/20250910_rls_initplan_rewrite.sql` ve altı kardeşi: Supabase Advisor'ın
 * `auth_rls_initplan` uyarısı için `auth.uid()` çağrısını `(select auth.uid())` içine alan
 * MEŞRU bir optimizasyon. Dosyanın kendi başlığında şu yazıyordu:
 *
 *     -- Idempotent: running again will not introduce double wrappers due to exact-match replacement.
 *
 * ⭐İDDİA YANLIŞTI, ve niçin yanlış olduğu bu kapının varlık sebebi: ilk koşumdan sonra ifade
 * `( SELECT auth.uid() AS uid)` olarak saklanır ve İÇTEKİ `auth.uid()` hâlâ çıplak bir
 * belirteçtir. `\m...\M` kelime sınırı "zaten sarılmış mı" sorusuna cevap VERMEZ. İkinci
 * koşumda iç çağrı yeniden eşleşir ve bir katman daha eklenir. **Her koşum bir katman.**
 * Üstüne: o yedi dosya `schema_migrations`'ta YOK (8 haneli `20250910_` ad; cetvel 14 hane
 * ister, INV-MIGRATION-2), yani CLI onları izlemiyor ve "zaten uygulandı" koruması hiç
 * devreye girmiyor. İzlenmeyen dosya + kendini tekrar sarabilen dönüşüm = sınırsız büyüme.
 *
 * BUGÜNKÜ ZARAR ABARTILMAZ: politikaların ANLAMI bozulmadı (`(SELECT (SELECT x))` ile `x` aynı
 * değeri döndürür), `public`'te RLS kapalı tablo 0, yazma politikaları kapılı. Canlı sızıntı
 * YOK. Zarar iki yerde: (1) 153 katmanlı bir politikayı hiçbir insan okuyup denetleyemez —
 * güvenlik kararının gözden geçirilebilirliği, kararın kendisi kadar önemlidir; (2) dönüşüm
 * bir kez daha koşarsa 154. katman gelir.
 *
 * ⭐ÖLÇÜT NİÇİN "SAYMAK" DEĞİL "İÇ İÇELİK" — kapının en pahalı tuzağı, ve ilk yazımda ben de
 * düştüm. İlk ölçümümde ifadedeki `AS uid` GEÇİŞLERİNİ saydım. O sayı iç içelik DEĞİLDİR:
 * bir politikada İKİ AYRI DOĞRU sarma varsa sayaç 2 gösterir ama iç içelik yoktur. Ölçtüm —
 * `order_notes`, `order_attachments`, `venthub_returns` politikaları tam olarak böyle:
 * sayaç 2, iç içelik 1, yani SAĞLIKLI. Sayan bir ölçüt bu üçüne kırmızı verirdi ve kapı ilk
 * gününde üç sahte bulguyla doğardı; bu depoda sahte bulgu üreten kapıların sonu kapatılmaktır.
 * Doğru ölçüt: ifadede `AS uid) AS uid` dizisinin GEÇMESİ. Bu dizi yalnızca iç içe sarmada
 * oluşur — iki ayrı sarma arasında daima başka belirteçler vardır. Ölçüldü: bu ölçütle eşleşen
 * politika tam 11, üç sağlıklı politika eşleşmiyor. **Ayırt ediyor.**
 *
 * ⛔FAIL-CLOSED: bağlantı dizesi yoksa, sorgu düşerse ya da evren şüpheli derecede darsa
 * ÇIKIŞ 2. "Ölçemedim" asla "temiz" diye okunmaz.
 *
 * ⛔BU KAPI ONARMAZ. Politikaları düzeltmek migration'dır ve kural 13 gereği Recep kapısıdır.
 * Kapı ölçer ve adıyla raporlar; hükmü ve onarımı insan yapar.
 *
 * KİPLER
 *   (varsayılan)        : canlı şemayı ölçer; ihlal varsa ÇIKIŞ 1
 *   --json              : bulguyu JSON basar
 *   --fikstur <yol>     : DB'siz sınama yolu (kapının kendisi de sınanabilir olmalı;
 *                         sınanamayan kapı kanıt değil iddiadır)
 *   --esik <n>          : izin verilen en fazla iç içelik (varsayılan 1 = sarma tek katman)
 */
import pg from 'pg'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CA_PATH = path.join(__dirname, 'supabase-root-2021-ca.pem')

/**
 * İfadeyi `qual` ve `with_check` birleşiminden kurar; `sarma` = `AS uid` geçiş sayısı,
 * `icIce` = iç içe bağ sayısı. Karar `icIce`ye göre verilir, `sarma`ya göre DEĞİL.
 * `sarma` yine de raporlanır: onarımı yazacak insanın ihtiyacı olan sayı odur.
 */
const SORGU = `
  with p as (
    select schemaname, tablename, policyname, cmd, roles::text as roller,
           coalesce(qual,'') || ' ~ ' || coalesce(with_check,'') as ifade
    from pg_policies
    where schemaname = 'public'
  )
  select tablename, policyname, cmd, roller,
         (length(ifade) - length(replace(ifade, 'AS uid', ''))) / 6 as sarma,
         (ifade like '%AS uid) AS uid%') as ic_ice,
         length(ifade) as ifade_bayti
  from p
  order by 5 desc, tablename, policyname
`

function tlsAyari() {
  if (!fs.existsSync(CA_PATH)) return { rejectUnauthorized: true }
  return { ca: fs.readFileSync(CA_PATH, 'utf8'), rejectUnauthorized: true }
}

async function semadanTopla(connectionString) {
  // `sslmode` URL'den sökülür — node-postgres onu bizim `ssl` nesnemizin YERİNE geçirebiliyor
  // ve kök sertifika sessizce devre dışı kalıyor (catalog-integrity'de ölçülmüş kusur).
  const vardi = /[?&]sslmode=/.test(connectionString)
  const temiz = connectionString.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
  if (vardi) console.log('rls-politika-sarma: baglanti dizesindeki sslmode kaldirildi')

  const client = new pg.Client({ connectionString: temiz, ssl: tlsAyari() })
  await client.connect()
  try {
    const { rows } = await client.query(SORGU)
    return rows
  } finally {
    await client.end()
  }
}

async function main() {
  const asJson = process.argv.includes('--json')
  const fIdx = process.argv.indexOf('--fikstur')
  const eIdx = process.argv.indexOf('--esik')
  const esik = eIdx !== -1 ? Number(process.argv[eIdx + 1]) : 1
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

  if (!Number.isFinite(esik) || esik < 1) {
    console.error('rls-politika-sarma: --esik en az 1 olmali (sarma tek katman mesrudur)')
    process.exit(2)
  }

  let satirlar
  if (fIdx !== -1) {
    satirlar = JSON.parse(fs.readFileSync(process.argv[fIdx + 1], 'utf8'))
    console.log(`rls-politika-sarma: FIKSTUR modu — sema OKUNMADI (${satirlar.length} satir verildi)`)
  } else if (!connectionString) {
    console.error(
      'rls-politika-sarma: OLCULEMEDI — baglanti dizesi yok (SUPABASE_DB_URL). ' +
        'Kapi olcemedigi icin YESIL DONMUYOR.',
    )
    process.exit(2)
  } else {
    try {
      satirlar = await semadanTopla(connectionString)
    } catch (e) {
      console.error('rls-politika-sarma: OLCULEMEDI — sorgu dustu: ' + String(e && e.message))
      process.exit(2)
    }
  }

  /**
   * ⭐EVREN SAĞLIK KOLU — boş evrende koşan kapı ölçüm değildir.
   * `public` şemasında onlarca politika var (2026-09-07 ölçümü: 90+). Sorgu bir avuç satır
   * dönerse şema taşınmış, izin daralmış ya da sorgu bozulmuş demektir; o hâlde "ihlal yok"
   * demek yoklukla ölçmektir. Fikstür modunda bu kol kapalı — fikstür bilerek dardır.
   */
  if (fIdx === -1 && satirlar.length < 20) {
    console.error(
      `rls-politika-sarma: OLCULEMEDI — public semasinda yalniz ${satirlar.length} politika ` +
        'gorundu (20+ bekleniyor). Sema/izin degismis olabilir; kapi KOR kosmaktansa KIRMIZI doner.',
    )
    process.exit(2)
  }

  // ⭐KARAR `ic_ice` ile verilir, `sarma` ile DEĞİL (bkz. baş yorumu: sayan ölçüt üç sağlıklı
  // politikaya sahte kırmızı verirdi). `sarma` yalnızca raporlanır.
  const sismisler = satirlar.filter((r) => r.ic_ice === true && Number(r.sarma) > esik)

  /**
   * ⭐TABAN NİÇİN VAR — ve niçin çürüyemez.
   * Onarım MIGRATION'dır ve Recep kapısındadır; kapı bugün inerse 11 bilinen politika
   * yüzünden master KIRMIZI kalır ve BÜTÜN FİLO kilitlenir. Kapıyı onarımdan sonraya
   * bırakmak da yanlış: o zaman onarım korumasız iner. Çare kardeş kapının kalıbı —
   * bilinen borç tabanda, YENİ hiçbir iç içe sarma geçemez.
   *
   * ⛔TABAN SESSİZCE ÇÜRÜMEZ: taban satırı diskteki gerçekle eşleşmiyorsa (politika
   * onarıldı, adı değişti ya da silindi) kapı KIRMIZI verir ve "tabandan düş" der.
   * Aksi halde onarılmış bir politika sessizce yeniden şişebilir ve taban onu örterdi —
   * yani taban, kapının kendi fail-open kapısı olurdu.
   */
  const tabanYolu = path.join(__dirname, 'rls-politika-sarma-taban.json')
  let taban = { girdiler: {} }
  if (fs.existsSync(tabanYolu)) {
    try {
      taban = JSON.parse(fs.readFileSync(tabanYolu, 'utf8'))
    } catch (e) {
      console.error('rls-politika-sarma: OLCULEMEDI — taban dosyasi ayristirilamadi: ' + String(e && e.message))
      process.exit(2)
    }
  }
  const tabanGirdiler = taban.girdiler || {}
  const anahtar = (r) => `${r.tablename}.${r.policyname}`

  const ihlaller = sismisler.filter((r) => !(anahtar(r) in tabanGirdiler))
  const bilinenBorc = sismisler.filter((r) => anahtar(r) in tabanGirdiler)
  const bayatTaban = Object.keys(tabanGirdiler).filter(
    (k) => !sismisler.some((r) => anahtar(r) === k),
  )

  if (asJson) {
    console.log(
      JSON.stringify(
        { esik, toplamPolitika: satirlar.length, ihlaller, bilinenBorc, bayatTaban },
        null,
        2,
      ),
    )
    process.exit(ihlaller.length || bayatTaban.length ? 1 : 0)
  }

  if (bilinenBorc.length) {
    console.log(
      `rls-politika-sarma: BILINEN BORC ${bilinenBorc.length} politika (REC-216, tabanda) — ` +
        'onarim migration Recep kapisinda; kapi bunlar icin kirmizi VERMEZ.',
    )
  }

  if (bayatTaban.length) {
    console.error(
      `rls-politika-sarma: KIRMIZI — ${bayatTaban.length} TABAN SATIRI artik gercekle eslesmiyor.`,
    )
    for (const k of bayatTaban) console.error(`   ${k} — ic ice sarma YOK, taban satirini DUS`)
    console.error(
      '  NICIN KIRMIZI: onarilmis bir politikanin taban satiri kalirsa, o politika sessizce\n' +
        '  YENIDEN sisebilir ve taban onu orter. Taban borcu KAYDEDER, kapiyi KORLESTIRMEZ.\n' +
        '  Onarim: rls-politika-sarma-taban.json icinden bu satirlari kaldir (ayni PR\'da).\n',
    )
  }

  if (!ihlaller.length && !bayatTaban.length) {
    console.log(
      `rls-politika-sarma: YESIL — ${satirlar.length} politika tarandi, taban disinda ` +
        `ic ice sarma YOK (esik ${esik} katman).`,
    )
    process.exit(0)
  }

  if (ihlaller.length) {
    console.error(`rls-politika-sarma: KIRMIZI — ${ihlaller.length} YENI politikada IC ICE sarma var.`)
    for (const r of ihlaller) {
      console.error(
        `   ${r.tablename}.${r.policyname} [${r.cmd}, ${r.roller}] — ` +
          `${r.sarma} sarma, ifade ${r.ifade_bayti} bayt`,
      )
    }
  }
  console.error(
    '\n  NICIN ONEMLI: ic ice sarilmis politikayi hicbir insan okuyup denetleyemez, ve\n' +
      '  donusum bir kez daha kosarsa bir katman daha eklenir (sinirsiz buyume).\n' +
      '  KOK SEBEP: supabase/migrations/20250910_rls_initplan_rewrite.sql + 6 kardesi —\n' +
      '  "idempotent" oldugunu IDDIA eden ama olmayan regexp donusumu (REC-216).\n' +
      '  ONARIM MIGRATION\'DIR ve Recep kapisidir (kural 13); bu kapi olcer, onarmaz.\n',
  )
  process.exit(1)
}

main().catch((e) => {
  console.error('rls-politika-sarma: OLCULEMEDI — beklenmeyen hata: ' + String(e && e.message))
  process.exit(2)
})
