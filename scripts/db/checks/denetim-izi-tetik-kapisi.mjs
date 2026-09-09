#!/usr/bin/env node
/**
 * INV-DENETIM-IZI-1 — denetim tetiği CANLI DB'de duruyor mu, ve HÂLÂ fail-closed mı?
 *
 * NİÇİN CANLI DB'YE BAKIYOR (metin taraması NEDEN YETMEZ)
 *
 * Bu deponun ölçülmüş gerçeği: migration dosyası, prod'da hangi tetiklerin var olduğu
 * sorusunda YETKİLİ KAYNAK DEĞİL. `on_products_change` ve `on_categories_change`
 * migration'larda YOK — `scripts/webhook_setup.sql` üzerinden, migration hattının dışından
 * kurulmuşlar (2026-09-09 prod ölçümü: repoda ≥10 tetik göründü, prod'da 10 tetik var ama
 * ikisinin tanımı repoda yok). Yani "migration dosyası duruyor" ile "tetik prod'da çalışıyor"
 * AYNI ŞEY DEĞİLDİR. Bir dosyayı okuyan kapı, `DROP TRIGGER` ile sökülmüş bir tetiği
 * göremez ve YEŞİL döner.
 *
 * Bu kalem REC-292 çürütmesinde EDGE şeridine yazılmıştı
 * (`20260826213000_enforce_role_change_actor_guard.sql:130` — "doğru bekçi metin taraması
 * DEĞİL canlı DB'ye bakan kontrol betiğidir"); EDGE şeridi kapalı olduğu için ALTYAPI'ya
 * döndü (OPS hükmü H5, 2026-09-09).
 *
 * ÜÇ ŞEYİ BİRDEN ÖLÇER — ve üçü ayrı arıza sınıfıdır:
 *   (1) TETİK VAR MI: altı tablonun her birinde `denetim_izi*` tetiği duruyor mu.
 *   (2) FONKSİYON FAIL-CLOSED MI: gövdesinde `exception` yakalayıcısı BELİRMİŞ mi. Biri
 *       iyi niyetle "göç kırılmasın" diye exception eklerse tetik AYAKTA görünür ama
 *       denetim kaybı SESSİZ hale gelir — yani kapı tetiği sayıp fail-closed'ı ölçmezse,
 *       tam olarak korumaya çalıştığı şeyi kaçırır.
 *   (3) products SÜZGECİ DURUYOR MU: UPDATE tetiği kolon listesiyle bağlı mı (süzgeç
 *       kalkarsa tablo stok gürültüsüyle dolar; süzgeç daralırsa fiyat değişimi kaydolmaz).
 *
 * ⛔NE ÖLÇMEZ, ADIYLA: TRUNCATE. Satır tetiği TRUNCATE'te ateşlenmez ve o yetkinin
 * altı tabloda `anon`'a kadar açık olduğu ölçüldü (2026-09-09). Onarımı ayrı kayıtta;
 * bu kapı o boşluğu KAPATTIĞINI İDDİA ETMEZ.
 *
 * KOŞTURMA:
 *   SUPABASE_DB_URL=... node scripts/db/checks/denetim-izi-tetik-kapisi.mjs [--json]
 *   node scripts/db/checks/denetim-izi-tetik-kapisi.mjs --fixture <dosya.json>
 * Bağlantı dizesi yoksa çıkış kodu 2'dir ve "ÖLÇÜLEMEDİ" der — "geçti" DEMEZ.
 * (Ölçemediği hâli geçti sayan kapı, kapı değildir.)
 */
import pg from 'pg'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CA_PATH = path.join(__dirname, 'supabase-root-2021-ca.pem')

/** Denetim izi ZORUNLU olan tablolar (REC-292 kapsamı, ölçümle 6). */
const KAPSAM = [
  'categories',
  'products',
  'product_families',
  'product_images',
  'brands',
  'site_settings',
]

/** `products` UPDATE süzgecinde BULUNMASI ZORUNLU kolonlar (ticari çekirdek). */
const PRODUCTS_ZORUNLU_KOLON = ['price', 'category_id', 'status', 'deleted_at', 'sku']

const SORGU = `
  select c.relname                          as tablo,
         t.tgname                           as tetik,
         p.proname                           as fonksiyon,
         p.prosrc                            as govde,
         pg_get_triggerdef(t.oid)            as tanim
  from pg_trigger t
  join pg_class c     on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  join pg_proc p      on p.oid = t.tgfoid
  where n.nspname = 'public'
    and not t.tgisinternal
    and c.relname = any($1::text[])
  order by c.relname, t.tgname
`

async function semadanTopla(connectionString) {
  const ssl = fs.existsSync(CA_PATH)
    ? { ca: fs.readFileSync(CA_PATH, 'utf8') }
    : undefined
  const client = new pg.Client({ connectionString, ssl })
  await client.connect()
  try {
    const { rows } = await client.query(SORGU, [KAPSAM])
    return rows
  } finally {
    await client.end()
  }
}

/** Tetik satırlarından hüküm çıkar. Saf fonksiyon: fikstürle de sınanabilir. */
export function degerlendir(satirlar) {
  const ihlaller = []
  const denetimSatirlari = satirlar.filter((r) => /^denetim_izi/.test(r.tetik))

  // (1) TETİK VAR MI
  for (const tablo of KAPSAM) {
    const bulunan = denetimSatirlari.filter((r) => r.tablo === tablo)
    if (bulunan.length === 0) {
      ihlaller.push({
        sinif: 'TETIK-YOK',
        tablo,
        aciklama:
          `${tablo} tablosunda denetim_izi tetigi YOK. Bu tabloya yapilan her yazim ` +
          `KAYITSIZ gecer. Migration dosyasinin repoda durmasi bunu KANITLAMAZ — ` +
          `tetik DROP edilmis olabilir.`,
      })
    }
  }

  // (2) FAIL-CLOSED MI — fonksiyon gövdesinde exception yakalayıcısı var mı
  const govdeler = new Map()
  for (const r of denetimSatirlari) govdeler.set(r.fonksiyon, r.govde)
  for (const [fn, govde] of govdeler) {
    if (/\bexception\s+when\b/i.test(String(govde))) {
      ihlaller.push({
        sinif: 'FAIL-OPEN',
        tablo: fn,
        aciklama:
          `${fn} govdesinde "exception when" YAKALAYICISI var. Tetik AYAKTA gorunur ama ` +
          `denetim yazimi patladiginda hata yutulur ve veri yazimi GECER: kayip SESSIZ olur. ` +
          `REC-292 karari fail-CLOSED (OPS H1). Yakalayici bilincli eklendiyse karar ` +
          `YENIDEN alinmali, sessizce degistirilmemeli.`,
      })
    }
  }

  // (3) products SÜZGECİ
  //
  // ⛔BURADA BİR KEZ YANILDIM, ve kendi fikstür kolum yakaladı — düzeltme yorumda kalsın:
  // önce "products üzerinde tanımında `update` geçen İLK tetik" diye arıyordum. `products`
  // üzerinde birden çok denetim tetiği var (biri INSERT/DELETE, biri UPDATE OF) ve gevşek
  // eşleşme YANLIŞ tetiği seçip süzgeci yok sanıyordu. Doğru soru "hangi tetik UPDATE'te
  // ateşleniyor" ve cevabı TEK tetik olmak zorunda değil.
  const productsUpdTetikleri = denetimSatirlari.filter(
    (r) => r.tablo === 'products' && /\bupdate\b/i.test(String(r.tanim)),
  )
  if (productsUpdTetikleri.length > 0) {
    const suzgecli = productsUpdTetikleri.filter((r) => /update\s+of/i.test(String(r.tanim)))

    if (suzgecli.length === 0) {
      ihlaller.push({
        sinif: 'SUZGEC-YOK',
        tablo: 'products',
        aciklama:
          `products UPDATE tetigi kolon suzgeci OLMADAN kurulmus (UPDATE OF yok). ` +
          `Her siparisin stok dusumu denetim satiri uretir ve "kim fiyati degistirdi" ` +
          `sorusunun cevabi gurultude kaybolur (OPS H2).`,
      })
    } else {
      // Zorunlu kolon, süzgeçli tetiklerin HERHANGİ BİRİNDE geçiyorsa kapsanmış sayılır:
      // süzgeç birden çok tetiğe bölünmüş olabilir ve bu meşrudur.
      const hepsi = suzgecli.map((r) => String(r.tanim)).join(' ')
      const eksik = PRODUCTS_ZORUNLU_KOLON.filter((k) => !new RegExp(`\\b${k}\\b`).test(hepsi))
      if (eksik.length > 0) {
        ihlaller.push({
          sinif: 'SUZGEC-DAR',
          tablo: 'products',
          aciklama:
            `products UPDATE tetiginin kolon suzgecinde ticari cekirdek kolonlar EKSIK: ` +
            `${eksik.join(', ')}. Bu kolonlarin degisimi KAYITSIZ gecer.`,
        })
      }
    }
  }

  return { ihlaller, denetimTetikSayisi: denetimSatirlari.length }
}

async function main() {
  const asJson = process.argv.includes('--json')
  const fixtureIdx = process.argv.indexOf('--fixture')
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

  let satirlar
  if (fixtureIdx !== -1) {
    const yol = process.argv[fixtureIdx + 1]
    if (!yol) {
      console.error('denetim-izi-tetik-kapisi: --fixture verildi ama YOL YOK — olcemedim (fail-closed).')
      process.exit(2)
    }
    satirlar = JSON.parse(fs.readFileSync(yol, 'utf8'))
    console.log(`denetim-izi-tetik-kapisi: FIXTURE modu — sema OKUNMADI (${satirlar.length} satir verildi)`)
  } else if (!connectionString) {
    console.error(
      'denetim-izi-tetik-kapisi: OLCULEMEDI — baglanti dizesi yok (SUPABASE_DB_URL). ' +
        'Kapi olcemedigi icin YESIL DONMUYOR.',
    )
    process.exit(2)
  } else {
    satirlar = await semadanTopla(connectionString)
  }

  // DEDEKTÖR SAĞLIĞI — sorgu tamamen boş dönerse tablolar taşınmış/yeniden adlandırılmış
  // olabilir. O hâlde "ihlal yok" demek, YOKLUKLA ÖLÇMEKtir; kapı kör koşmaktansa kırmızı döner.
  if (satirlar.length === 0) {
    console.error(
      'denetim-izi-tetik-kapisi: OLCULEMEDI — kapsamdaki alti tablonun HICBIRINDE tetik ' +
        'bulunamadi. Bu, tetiklerin silinmis olmasi KADAR tablolarin yeniden adlandirilmis ' +
        'olmasi da olabilir. Ayirt edemedigim icin YESIL DONMUYORUM.',
    )
    process.exit(2)
  }

  const { ihlaller, denetimTetikSayisi } = degerlendir(satirlar)

  if (asJson) {
    console.log(JSON.stringify({ kapsam: KAPSAM, denetimTetikSayisi, ihlaller }, null, 2))
  }

  console.log(
    `denetim-izi-tetik-kapisi: kapsam ${KAPSAM.length} tablo | canli denetim tetigi ` +
      `${denetimTetikSayisi} | ihlal ${ihlaller.length}`,
  )
  console.log(
    '  ⛔KAPSAM DISI, ADIYLA: TRUNCATE. Satir tetigi TRUNCATE-te ateslenmez; o yetki ' +
      'alti tabloda anon-a kadar acik (2026-09-09 olcumu). Ayri kayit.',
  )

  if (ihlaller.length === 0) {
    console.log('denetim-izi-tetik-kapisi: ihlal YOK -> YESIL')
    process.exit(0)
  }

  console.log('')
  console.log('denetim-izi-tetik-kapisi: IHLAL VAR -> KIRMIZI')
  for (const i of ihlaller) {
    console.log(`  [${i.sinif}] ${i.tablo}`)
    console.log(`      ${i.aciklama}`)
  }
  console.log('')
  console.log('Onarim bir MIGRATION-dir (= prod-a otomatik uygulama, Recep kapisi).')
  console.log('Kapiyi susturmak icin taban dosyasi YOKTUR: denetim izinin eksigi')
  console.log('gerekcelendirilebilir bir hal DEGILDIR.')
  process.exit(1)
}

main().catch((err) => {
  if (/certificate|self-signed|SELF_SIGNED/i.test(err.message)) {
    console.error('denetim-izi-tetik-kapisi: OLCULEMEDI — TLS zinciri dogrulanamadi:', err.message)
    console.error('Kok sertifikayi PGSSLROOTCERT ile verin (dogrulamayi KAPATMAK cozum degildir).')
  } else {
    console.error('denetim-izi-tetik-kapisi: kosum HATASI —', err.message)
  }
  process.exit(2)
})
