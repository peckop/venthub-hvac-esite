#!/usr/bin/env node
/**
 * INV-AILE-KATEGORI-1 — ÜRÜNÜN kategorisi ile AİLESİNİN kategorisi AYRIŞMASIN (REC-290).
 *
 * ⭐NİÇİN VAR — vakayı cetvel yazdı, ben yalnız ölçüyorum:
 * Kategori vitrini ürün değil **AİLE** listeler ("N ürün ailesi"). Bu yüzden bir ürünü
 * başka kategoriye taşımak `products` satırını güncellemekle tamamlanmaz; `product_families`
 * de birlikte güncellenmezse **veri doğru, vitrin sessizce yanlış** kalır — ürün müşteriye
 * görünmez ve hiçbir test bunu yakalamaz.
 *
 * 2026-09-08'de iki taşıma da tam bu sebeple yarım kaldı (7 AVenS → duct-fans, 11 VORTICENT
 * ATEX → axial-industrial-fans). Birincisi vitrin sayımıyla, ikincisi cetveldeki SQL ilk
 * koşulduğunda yakalandı: sayı 0 değil **11** çıktı ve 11'in hepsi "taşındı" diye raporlanmış
 * ürünlerdi. Yani bu kapının ölçtüğü şey varsayımsal değil, bir kez GERÇEKLEŞMİŞ bir kusur.
 *
 * CETVEL: docs/standards/category-taxonomy-standard.md §8 (SQL'in kanonik hâli orada) +
 * docs/standards/rendering-cache-standard.md "veri değişti, sayfa değişmedi" deseni.
 *
 * ⛔SALT OKUR: yalnız SELECT. Yazma, migration, şema değişikliği YOK.
 *
 * ÇIKIŞ KODLARI — "ölçemedim" ile "ihlal yok" AYRI:
 *   0 = ölçüldü, ihlal 0
 *   1 = ölçüldü, İHLAL VAR (satırlar adıyla basılır)
 *   2 = ÖLÇÜLEMEDİ (bağlantı yok, şema beklenmedik, ya da evren BOŞ) — yeşil DEĞİL
 */
import fs from 'node:fs'
import tls from 'node:tls'

/**
 * TLS — doğrulama DAİMA açık. Deseni `catalog-integrity.mjs`ten devraldım ve gerekçesi
 * aynı: bu bağlantı prod DB kimlik bilgisi taşıyor ve repo PUBLIC. `rejectUnauthorized:
 * false` yazan eski betikler var; o deseni DEVRALMIYORUM.
 */
function tlsCoz() {
  const caPath = process.env.PGSSLROOTCERT
  if (!caPath) return { rejectUnauthorized: true }
  const pem = fs.readFileSync(caPath, 'utf8')
  const blok = (pem.match(/-----BEGIN CERTIFICATE-----/g) ?? []).length
  if (blok === 0) {
    throw new Error(
      `PGSSLROOTCERT bir PEM sertifikasi degil (BEGIN CERTIFICATE blogu yok, ${pem.length} bayt).`
    )
  }
  // Sistem kökleri DE verilir: `ca` verildiğinde Node varsayılan depoyu devre dışı bırakır;
  // doğrudan bağlantı özel kök, havuz ucu kamu CA kullanabiliyor. İkisi birden vermek
  // doğrulamayı zayıflatmaz, güvenilen küme eksiksiz olur.
  return { ca: [...tls.rootCertificates, pem], rejectUnauthorized: true }
}

function oldur(mesaj) {
  console.error(`aile-kategori: OLCULEMEDI — ${mesaj} Kapi olcemedigi icin YESIL DONMUYOR.`)
  process.exit(2)
}

/**
 * ⭐KAPININ KENDİ KÖRLÜĞÜNÜ ÖLÇEN SORGU.
 *
 * `ihlal` tek başına yeterli DEĞİL: join hiç satır üretmezse (kolon adı değişti, `family_id`
 * boşaldı, tablo taşındı) ihlal de 0 çıkar ve kapı "temiz" der. O hâl temizlik değil
 * KÖRLÜKTÜR. Bu yüzden aynı sorgu evren büyüklüklerini de getirir ve `join_evreni = 0`
 * ise betik çıkış 2 verir.
 */
const SORGU = `
select
  (select count(*) from products) as urun,
  (select count(*) from products where family_id is not null) as ailesi_olan,
  (select count(*) from product_families where deleted_at is null) as aktif_aile,
  (select count(*) from products p
     join product_families f on f.id = p.family_id
    where f.deleted_at is null) as join_evreni,
  (select count(*) from products p
     join product_families f on f.id = p.family_id
    where f.deleted_at is null
      and (p.subcategory_id is distinct from f.subcategory_id
        or p.category_id   is distinct from f.category_id)) as ihlal
`

/** İhlal satırları ADIYLA — "11 ihlal" bir sayı, "hangi ürün" bir iş emri. */
const SORGU_SATIRLAR = `
select p.sku, p.name as urun, f.name as aile,
       p.category_id as urun_kategori, f.category_id as aile_kategori,
       p.subcategory_id as urun_alt, f.subcategory_id as aile_alt
  from products p
  join product_families f on f.id = p.family_id
 where f.deleted_at is null
   and (p.subcategory_id is distinct from f.subcategory_id
     or p.category_id   is distinct from f.category_id)
 order by f.name, p.sku
 limit 200
`

/**
 * ⭐FİKSTÜR KOLU — ve niçin var, açıkça: SABOTAJ PROD'A YAZILAMAZ.
 *
 * Kabul ölçütü "bir aileyi bilerek ayrıştır, KIRMIZI gör, geri al" diyor. O sabotaj prod
 * `product_families` tablosuna YAZMAK demektir ve prod yazımı Recep kapısıdır (kural 13);
 * kapı yazarken kapının koruduğu veriyi bozmak, hem izinsiz hem de yarıda kalırsa vitrini
 * gerçekten kırar. Bu yüzden ayırt edicilik FİKSTÜRLE ölçülür: sayımlar dışarıdan verilir,
 * KARAR MANTIĞI aynı koddan geçer. Canlı taraf ayrıca iki yönlü ölçülür (bkz. PR gövdesi).
 *
 * ⚠SINIRI ADIYLA: fikstür SQL'in kendisini DEĞİL, sayıya verilen tepkiyi ölçer. Sorgunun
 * doğru şeyi saydığı canlıda ölçülür; ikisi ayrı eksen ve ikisi de gerekli.
 */
function fiksturOku(yol) {
  const j = JSON.parse(fs.readFileSync(yol, 'utf8'))
  for (const alan of ['urun', 'ailesi_olan', 'aktif_aile', 'join_evreni', 'ihlal']) {
    if (!(alan in j)) throw new Error(`fikstur eksik alan: ${alan}`)
  }
  return { sayimlar: j, satirlar: j.satirlar ?? [] }
}

async function main() {
  const fiksturIdx = process.argv.indexOf('--fikstur')
  if (fiksturIdx !== -1) {
    const { sayimlar: s, satirlar: st } = fiksturOku(process.argv[fiksturIdx + 1])
    return karar(s, st, '(fikstur)')
  }

  const baglanti = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL
  if (!baglanti) {
    // ÇIKIŞ 0 DEĞİL: kardeş kapıların (INV-CATALOG-1, INV-RLS-COVERAGE-1) aynı kararı.
    // "Ölçülemedi" bir ETİKET değil, kırmızıdır; sırların hiç olmadığı hâl (fork PR'ı)
    // iş SEVİYESİNDE atlanır ve atlanmış iş başarılı değildir.
    oldur('baglanti dizesi yok (SUPABASE_DB_URL).')
  }

  let Client
  try {
    ;({ Client } = await import('pg'))
  } catch {
    oldur('pg surucusu yuklenemedi (npm install pg@8).')
  }

  // ⛔`sslmode` SÖKÜLÜR — bu kapı 2026-09-09'da CI'da tam bu yüzden düşüyordu
  // (`self-issued certificate in certificate chain`, exit 2, master'da da kırmızı).
  // Teşhis ölçüldü: kök sertifika DOĞRU ve zincir TAM (`openssl -CAfile` → 0 ok); sorun,
  // bağlantı dizesindeki `sslmode`'un node-postgres'te bizim `ssl` nesnemizin YERİNE
  // geçmesi ve kökü sessizce devre dışı bırakmasıydı. Söküm dört kardeş betikte zaten
  // vardı, bu ikisinde YOKTU — kopya sürüklenmesi. Tekrarı `INV-DENETIM-IZI-1` kolu ölçer.
  const sslmodeVardi = /[?&]sslmode=/.test(baglanti)
  const temizBaglanti = baglanti.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
  if (sslmodeVardi) console.log('aile-kategori: baglanti dizesindeki sslmode kaldirildi (TLS ayari KODDA belirlenir)')

  const client = new Client({ connectionString: temizBaglanti, ssl: tlsCoz() })
  let sayimlar
  let satirlar = []
  try {
    await client.connect()
    const r = await client.query(SORGU)
    sayimlar = r.rows[0]
    if (Number(sayimlar.ihlal) > 0) {
      satirlar = (await client.query(SORGU_SATIRLAR)).rows
    }
  } catch (e) {
    // Şema değişikliği de buraya düşer (kolon yok → sorgu hatası) ve DOĞRU yer burası:
    // beklediği kolonu bulamayan bir kapı "ihlal yok" DEMEZ, ölçemediğini söyler.
    oldur(`sorgu kosulamadi: ${e instanceof Error ? e.message : String(e)}`)
  } finally {
    await client.end().catch(() => {})
  }

  return karar(sayimlar, satirlar, '(canli)')
}

/** Sayımdan çıkış koduna giden TEK karar noktası — canlı ve fikstür aynı yoldan geçer. */
function karar(sayimlar, satirlar, kaynak) {
  const urun = Number(sayimlar.urun)
  const ailesiOlan = Number(sayimlar.ailesi_olan)
  const aktifAile = Number(sayimlar.aktif_aile)
  const evren = Number(sayimlar.join_evreni)
  const ihlal = Number(sayimlar.ihlal)

  console.log(
    `aile-kategori ${kaynak}: urun ${urun} · ailesi olan ${ailesiOlan} · aktif aile ${aktifAile} · ` +
      `olculen evren ${evren} · ihlal ${ihlal}`
  )

  if (evren === 0) {
    // KÖRLÜK: ölçülecek hiçbir satır yok. Bu, "her şey tutarlı" ile AYNI ŞEY DEĞİL.
    oldur(
      `olculen evren 0 (urun ${urun}, ailesi olan ${ailesiOlan}, aktif aile ${aktifAile}). ` +
        'Ihlal 0 cikmasi TUTARLILIK DEGIL KORLUK olur; kolon/tablo adi degismis olabilir.'
    )
  }

  if (ihlal > 0) {
    console.error(`\naile-kategori: ⛔${ihlal} URUN ailesinden AYRISMIS — vitrin sessizce yanlis.`)
    console.error('Vitrin AILE listeler; aile yanlis kategoride kalirsa urun musteriye GORUNMEZ.')
    console.error('Onarim: products VE product_families birlikte guncellenir (cetvel §8).\n')
    for (const s of satirlar) {
      console.error(
        `  · ${s.sku ?? '(sku yok)'} "${s.urun}" | aile "${s.aile}" | ` +
          `urun kat=${s.urun_kategori} alt=${s.urun_alt} <-> aile kat=${s.aile_kategori} alt=${s.aile_alt}`
      )
    }
    if (ihlal > satirlar.length) {
      // Sessiz kesme YASAK: kaç satır basıldığı ve kaçının basılmadığı YAZILIR.
      console.error(`  ... ${ihlal - satirlar.length} satir daha (listede ilk ${satirlar.length})`)
    }
    process.exit(1)
  }

  console.log('aile-kategori: YESIL — urun ile ailesinin kategorisi ayrismiyor (INV-AILE-KATEGORI-1).')
  process.exit(0)
}

main().catch((e) => {
  oldur(`beklenmeyen hata: ${e instanceof Error ? e.message : String(e)}`)
})
