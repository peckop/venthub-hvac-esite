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
import tls from 'node:tls'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CA_PATH = path.join(__dirname, 'supabase-root-2021-ca.pem')

const KOK = path.resolve(__dirname, '../../..')
const MIGRATION_DIZIN = path.join(KOK, 'supabase/migrations')

/**
 * Koşum kipi: `pr` (bekleyen migration SARI sayılır) · `master` (tam sertlik).
 * Elle verilirse o kazanır — kapının kendisi fikstürle sınanabilsin.
 */
function kipSec(argv) {
  const i = argv.indexOf('--kip')
  if (i === -1) return null
  const v = argv[i + 1]
  if (v !== 'pr' && v !== 'master') {
    console.error('[denetim-izi] --kip yalniz pr ya da master olabilir — olcemedim (fail-closed).')
    process.exit(2)
  }
  return v
}

/**
 * Depoda tetikleri kuran migration dosyası var mı?
 * ⚠Bu, "migration UYGULANDI" demek DEĞİLDİR — yalnız "kurulum kaydı depoda var" demektir.
 * Ayrım şemadan yapılamaz; kip ile yapılır (SARI hükmü, aşağıda).
 */
function migrationDosyasiVarMi() {
  try {
    return fs.readdirSync(MIGRATION_DIZIN).some((f) => /denetim_izi/.test(f) && f.endsWith('.sql'))
  } catch {
    return false
  }
}

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

/**
 * ⛔TLS AYARI — ve niçin `sslmode` bağlantı dizesinden SÖKÜLÜYOR (ölçülmüş kusur, 2026-09-09).
 *
 * İlk yazışta kök sertifikayı dosyadan okuyup `ssl: { ca }` veriyordum ve CI'da kapı
 * `self-signed certificate in certificate chain` ile **exit 2** verdi. Teşhisi ölçtüm:
 *
 *   · Sunucunun sunduğu zincir: `*.pooler.supabase.com` ← `Supabase Intermediate 2021 CA`
 *     ← `Supabase Root 2021 CA`. Depodaki PEM **tam o kök** ve `openssl -CAfile` ile
 *     doğrulama **0 (ok)** veriyor. Yani kök ne bayat ne yanlış; ara sertifika da eksik değil.
 *   · Node ile üç kipte el sıkışma denedim: `ca:[sistem+kök]` GEÇTİ · `ca:[kök]` GEÇTİ ·
 *     `ca` HİÇ VERİLMEDİĞİNDE **birebir CI hatası** çıktı.
 *   · Sebep: bağlantı dizesindeki `sslmode`, node-postgres'in yeni sürümünde bizim `ssl`
 *     nesnemizin **yerine geçiyor** ve kök sertifika sessizce devre dışı kalıyor. CI günlüğü
 *     bunu zaten söylüyordu: "If you want the current behavior, explicitly use
 *     'sslmode=verify-full'".
 *
 * ⭐**ASIL BULGU — bilgi depoda VARDI, en yeni iki betiğe GEÇMEMİŞTİ.** `sslmode` sökümü
 * `rls-role-coverage` · `catalog-integrity` · `anon-yazma-nobetcisi` · `rls-politika-sarma`
 * içinde AYRI AYRI kopyalanmış; sökmeyen iki betik (`aile-kategori-tutarlilik` ve bu dosya)
 * tam olarak CI'da düşen ikisiydi. Yani kusur bir bilgi eksikliği değil, **kopya sürüklenmesi**:
 * çözüm her betiğe elle kopyalandığı için yeni betik onu almadan doğuyor. Bunun tekrarını
 * `INV-DENETIM-IZI-1` kilidindeki bir kol engelliyor (paylaşılan yardımcıya çıkarma işi ayrı
 * kalem — dört çalışan kapıyı bu PR'da elden geçirmek riski hak etmiyordu).
 */
function tlsAyari() {
  const caYol = process.env.PGSSLROOTCERT || (fs.existsSync(CA_PATH) ? CA_PATH : '')
  if (!caYol) return { rejectUnauthorized: true }
  const pem = fs.readFileSync(caYol, 'utf8')
  const blok = (pem.match(/-----BEGIN CERTIFICATE-----/g) ?? []).length
  if (blok === 0) {
    throw new Error(`PGSSLROOTCERT bir PEM sertifikasi degil (BEGIN CERTIFICATE blogu yok, ${pem.length} bayt).`)
  }
  console.log(`denetim-izi-tetik-kapisi: kok sertifika yuklendi (${blok} blok, ${pem.length} bayt)`)
  // Sistem kökleri DE verilir: `ca` verildiğinde Node varsayılan depoyu devre dışı bırakır.
  return { ca: [...tls.rootCertificates, pem], rejectUnauthorized: true }
}

async function semadanTopla(connectionString) {
  // `sslmode` SÖKÜLÜR (yukarıdaki gerekçe). Söküldüğünü ilan ediyoruz: sessiz bir düzeltme,
  // bir sonraki kişinin aynı teşhisi baştan yapmasına yol açar.
  const vardi = /[?&]sslmode=/.test(connectionString)
  const temiz = connectionString.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
  if (vardi) console.log('denetim-izi-tetik-kapisi: baglanti dizesindeki sslmode kaldirildi (TLS ayari KODDA belirlenir)')

  const client = new pg.Client({ connectionString: temiz, ssl: tlsAyari() })
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

  // ─────────────────────────────────────────────────────────────────────────────
  // ⭐BEKLEYEN MIGRATION = SARI, KIRMIZI DEĞİL (OPS hükmü, 2026-09-09)
  //
  // TAVUK-YUMURTA: bu kapı ile onu anlamlı kılan migration AYNI PR'da iner. PR kipinde
  // tetikler prod'da HENÜZ YOKTUR — çünkü migration master'a merge edilene kadar
  // uygulanmaz (kural 13). Kapı o hâlde kırmızı verirse **hiçbir migration'lı PR kendi
  // kapısından geçemez** ve kapı, doğduğu PR'ı bloklar.
  //
  // AYIRT EDİCİ: "migration henüz uygulanmadı" ile "tetik SÖKÜLDÜ" aynı şemayı üretir —
  // ikisi de "tetik yok"tur. Şemadan ayırt EDİLEMEZ. Ayrım koşum BAĞLAMINDAN gelir:
  //   · `pull_request` → migration daha uygulanmamış olabilir → SARI (bekleyen migration)
  //   · master'a `push` → migration UYGULANMIŞ olmalı → hâlâ yoksa KIRMIZI
  // Bu, gevşetme DEĞİL yer değiştirmedir: kapı master koşumunda tam sertliğiyle durur.
  //
  // ⛔SARI YALNIZ `TETIK-YOK` SINIFINA VERİLİR. `FAIL-OPEN` ve `SUZGEC-*` ancak tetik
  // VARKEN doğar; onlar bekleyen migration ile açıklanamaz ve PR kipinde de KIRMIZIDIR.
  const kip =
    kipSec(process.argv) ||
    (process.env.GITHUB_EVENT_NAME === 'pull_request' ? 'pr' : 'master')
  const migrationVar = migrationDosyasiVarMi()
  const tumuTetikYok = ihlaller.every((i) => i.sinif === 'TETIK-YOK')

  if (kip === 'pr' && migrationVar && tumuTetikYok) {
    console.log('')
    console.log('denetim-izi-tetik-kapisi: SARI — BEKLEYEN MIGRATION (kirmizi DEGIL, yesil de DEGIL)')
    for (const i of ihlaller) console.log(`  [BEKLEYEN] ${i.tablo} — tetik prod'da yok`)
    console.log('')
    console.log('Depoda tetikleri kuran migration dosyasi VAR, prod\'da tetikler YOK. PR kipinde')
    console.log('bu BEKLENEN haldir: migration master\'a merge edilmeden uygulanmaz (kural 13).')
    console.log(`::warning title=Denetim izi: bekleyen migration::${ihlaller.length} tabloda tetik henuz YOK. ` +
      'Bu PR kipinde SARI sayildi. ⛔MASTER kosumunda ayni hal KIRMIZI verir — merge sonrasi ' +
      'ilk master kosumu kapinin gercekten olctugunun kanitidir.')
    process.exit(0)
  }

  console.log('')
  console.log('denetim-izi-tetik-kapisi: IHLAL VAR -> KIRMIZI')
  if (kip === 'pr' && tumuTetikYok && !migrationVar) {
    console.log('  ⚠PR kipindesin ama tetikleri kuran MIGRATION DOSYASI da YOK: bu bekleyen')
    console.log('   migration degil, EKSIK migration. SARI verilmedi.')
  }
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

/**
 * ⛔MODUL IMPORT EDILDIGINDE KOSMAZ — yalnizca DOGRUDAN cagrildiginda.
 *
 * OLCULDU (2026-09-09, URUN un yan bulgusu, ben dogruladim): bu dosyayi bir birim
 * testinden `import` etmek kapinin KENDISINI kosturuyordu; ekrana "kok sertifika
 * yuklendi" yazdi ve ardindan CANLI DB-ye baglanmayi denedi
 * ("password authentication failed"). Yani `degerlendir`-i sinamak icin dosyayi
 * import eden her kol, kimlik bilgisi olmayan bir makinede prod-a UZANIYORDU.
 *
 * NICIN CIDDI: (a) birim testi ag-a cikmamali - yavas, kirilgan ve makineye gore
 * farkli sonuc verir; (b) sirsiz makinede uretilen hata, testin ASIL olctugu seyi
 * GOLGELER (bugun tam bu oldu: kollar dusunce sebep import yolu mu, DB mi, ayirt
 * edilemedi); (c) bir kapi betiginin yan etkisi, onu okuyan araca sizmamali.
 */
const dogrudanCagrildi = (() => {
  const giris = process.argv[1]
  if (!giris) return false
  try {
    return pathToFileURL(path.resolve(giris)).href === import.meta.url
  } catch {
    return false
  }
})()

// Import edildiyse hicbir sey KOSMAZ; `degerlendir` disa acik ve sinanabilir kalir.
if (dogrudanCagrildi) {
  main().catch((err) => {
    if (/certificate|self-signed|SELF_SIGNED/i.test(err.message)) {
      console.error('denetim-izi-tetik-kapisi: OLCULEMEDI — TLS zinciri dogrulanamadi:', err.message)
      console.error('Kok sertifikayi PGSSLROOTCERT ile verin (dogrulamayi KAPATMAK cozum degildir).')
    } else {
      console.error('denetim-izi-tetik-kapisi: kosum HATASI —', err.message)
    }
    process.exit(2)
  })
}
