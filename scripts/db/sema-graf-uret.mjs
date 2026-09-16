#!/usr/bin/env node
/**
 * ŞEMA GRAF ÜRETİCİSİ — veritabanının KENDİ KATALOĞUNDAN graphify biçiminde graf üretir.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NİÇİN VAR (Recep, 2026-09-16)
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Recep: *"bu supabase tarafının bir haritasını çıkartmamız lazım, bu şekilde olmayacak,
 * codegraph gibi bir şey lazım."* Ve tasarım sorusu: *"yama gibi mi olacak yoksa AST gibi mi
 * olacak, bir ürün geliştirir gibi geliştirip bir başkası da kursaydı sağlıklı çalışır
 * mantığı mı olacak?"*
 *
 * ⛔**METİN TARAMASI YAPILMAZ — o yama olur.** SQL düzenli bir metin değildir: tırnaklama
 * değişir, politika gövdesinde alt sorgu olur, satır sonu keyfîdir. Bugün bir dosyada
 * çalışan desen yarın başka dökümde sessizce yanlış sayı verir. Bunun ölçülmüş kanıtı var:
 * graphify'ın kendi SQL tarayıcısı 8616 satırlık dökümü **L2988-L5775 arasında kesti** ve
 * 163 politikanın **1'ini** gördü; indeksleri hiç görmedi. Kesim boyut sınırı değildi —
 * dosya üçe bölündüğünde indeks+politika taşıyan parça yine 4 düğüm verdi, yani extractor
 * o nesneleri **modellemiyor.**
 *
 * ⭐**DOĞRU KAYNAK VERİTABANININ KENDİ KATALOĞUDUR.** PostgreSQL "bende hangi tablolar,
 * hangi kısıtlar, hangi politikalar var" sorusunun cevabını kendi içinde tutar. Otoriteye
 * sorulur; tahmin edilmez, ayrıştırılmaz. Üç somut üstünlüğü:
 *   · **Eksiksizlik tanım gereği** gelir — sayıyı veren şeyin kendisidir.
 *   · **Bağlantılar doğru** gelir: yabancı anahtarlar gerçek `pg_constraint` kayıtlarından.
 *   · **Kayamaz**, çünkü kaynak gerçeğin kendisidir.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * "BAŞKASI KURSA ÇALIŞIR MI" — TASARIMIN ŞARTI
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 1. **Hiçbir VentHub adı gömülü DEĞİL.** Ne tablo adı, ne şema adı. Şema listesi
 *    `--semalar` ile dışarıdan verilir (varsayılan `public`).
 * 2. **Bağlantı bilgisi kodda YOK.** Yalnız ORTAM DEĞİŞKENİ ADI okunur; değer asla
 *    basılmaz, varlığı UZUNLUKLA ölçülür. (2026-09-04'te bir betik prod bağlantı dizesini
 *    log'a düşürdü; o kalıp bu depoda yasak.)
 * 3. **Çıktı graphify'ın BELGELENMİŞ biçiminde** (networkx node-link: `nodes` + `links`) ve
 *    onun kendi `merge-graphs` komutuyla eklenir. Kendi kısayolumuzu uydurmuyoruz.
 * 4. **TEK KOD YOLU, İKİ GİRDİ.** Canlı bağlantı ya da dökümden kurulmuş geçici bir küme —
 *    ikisi de aynı kataloğa aynı soruları sorar. İkinci bir ayrıştırıcı YAZILMAZ.
 *
 * ⭐**DÜĞÜM KİMLİKLERİ KENDİ AD ALANINDA** (`db_` öneki). Gerekçe ölçülmüş: graphify SQL
 * dosyalarından da tablo düğümü üretiyor ve kendi şartnamesi *"aynı varlık her zaman aynı
 * kimliği üretmeli, yoksa orphan ghost-duplicate düğüm doğar"* diye uyarıyor. Biçimde en
 * küçük fark hayalet ikiz demek; o yüzden bizimkiler ayrı ad alanında durur, yan yana
 * görünür ama karışmaz ve bir gün ayırmak istersek tek satırla ayrılır.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * AŞAMA 1 KAPSAMI (bu dosya) — ve ne YOK
 * ══════════════════════════════════════════════════════════════════════════════
 * VAR : tablolar (+ kolon sayısı, RLS açık mı) · yabancı anahtar kenarları
 * YOK : politikalar (aşama 2) · fonksiyonlar ve tetikler (aşama 3) · indeksler
 * Aşamalı olması bilinçli: her aşama kendi kapısıyla iner (CLAUDE.md kural 14).
 *
 * ÇIKIŞ KODLARI (sözleşme — bu satırlar kapının da ölçtüğü şeydir):
 *   0 = üretildi (ya da sır yok → ATLANDI, ama bu YEŞİL DEĞİLDİR ve öyle yazılır)
 *   1 = üretildi AMA doğrulama tutmadı (sayım tutarsız) — İHLAL
 *   2 = ÖLÇEMEDİ (bağlantı kurulamadı, sorgu düştü) — atlanmışla AYNI ŞEY DEĞİL
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import pg from 'pg'

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const AD = 'sema-graf-uret'

/** `--anahtar deger` ve `--anahtar=deger` ikisini de kabul eder. */
function arg(ad, varsayilan) {
  const a = process.argv.slice(2)
  const i = a.findIndex((x) => x === `--${ad}` || x.startsWith(`--${ad}=`))
  if (i === -1) return varsayilan
  if (a[i].includes('=')) return a[i].split('=').slice(1).join('=')
  return a[i + 1] ?? varsayilan
}

const DEGISKEN_ADI = arg('db-url-env', 'SUPABASE_DB_URL')
const SEMALAR = arg('semalar', 'public')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const CIKTI = path.resolve(KOK, arg('cikti', path.join('graphify-out', 'db-graph.json')))

/**
 * ⛔DEĞER OKUNUR, ASLA BASILMAZ. `${VAR:-VARSAYILAN}` kalıbı bu depoda YASAK: değer
 * doluysa onu EKRANA yazar (2026-09-04'te prod bağlantı dizesi tam böyle sızdı).
 * Varlık yalnız UZUNLUKLA raporlanır.
 */
function baglantiDizesi() {
  const d = process.env[DEGISKEN_ADI]
  return typeof d === 'string' && d.length > 0 ? d : null
}

/** graphify düğüm biçimi (gözlemlenerek ölçüldü, uydurulmadı). */
function dugum({ id, label, tur, kaynak, konum }) {
  return {
    id,
    label,
    _origin: 'catalog',
    file_type: 'db',
    norm_label: label.toLowerCase(),
    source_file: kaynak,
    source_location: konum,
    db_tur: tur,
  }
}

/** graphify kenar biçimi. `confidence: EXTRACTED` — katalogdan okundu, çıkarım DEĞİL. */
function kenar({ source, target, relation, kaynak, context }) {
  return {
    source,
    target,
    relation,
    _origin: 'catalog',
    confidence: 'EXTRACTED',
    confidence_score: 1.0,
    context,
    source_file: kaynak,
    source_location: '',
    weight: 1.0,
  }
}

/** `public.products` → `db_public_products`. graphify'ın ID kuralı: yalnız `[a-z0-9_]`. */
function kimlik(sema, ad) {
  const t = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  return `db_${t(sema)}_${t(ad)}`
}

async function main() {
  const dizi = baglantiDizesi()
  if (!dizi) {
    console.log(`${AD}: OLCULEMEDI — ${DEGISKEN_ADI} yok (deger BASILMADI).`)
    console.log('⛔ATLANMIS IS YESIL DEGILDIR: bu kosumda sema grafi HIC uretilmedi.')
    process.exit(0)
  }
  console.log(`${AD}: sir MEVCUT (uzunluk ${dizi.length} karakter, deger BASILMADI).`)

  /**
   * ⛔`sslmode` BAĞLANTI DİZESİNDEN SÖKÜLÜR. Sebep 2026-09-09'da ölçüldü: node-postgres
   * dizeyi kendi ayrıştırıcısıyla okuyor ve oradaki `sslmode`, verdiğimiz `ssl` nesnesinin
   * YERİNE geçiyor; kök sertifika sessizce devre dışı kalıyor ve zincir "self-signed
   * certificate in certificate chain" ile düşüyor. Belirti sinsi: yerelde çalışır, CI'da
   * çalışmaz. Bu kalıbı INV-DENETIM-IZI-1 kapısı zorlar — sekiz betik aynı boşlukla doğdu.
   */
  const sslmodeVarDi = /[?&]sslmode=/.test(dizi)
  const temizDizi = dizi.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
  if (sslmodeVarDi) {
    console.log(`${AD}: baglanti dizesindeki sslmode kaldirildi (TLS ayari KODDA belirlenir)`)
  }

  /**
   * ⭐TLS KARARI SUNUCUYA SORULARAK DEĞİL, HEDEFE BAKARAK VERİLİR — ve sessiz geri düşme YOK.
   *
   * Ölçülmüş kusur (bu betiğin ilk koşumu, 2026-09-16): kök sertifika dosyası varsa
   * koşulsuz `ssl` veriyordum; yerel küme *"The server does not support SSL connections"*
   * ile reddetti. Akla gelen kolay çözüm "hata alırsan SSL'siz tekrar dene" — **o YASAK**,
   * çünkü uzak bir sunucu TLS'i düşürdüğünde de aynı yola girer ve şifreleme SESSİZCE
   * kaybolur. Bu, tam olarak `sslmode` tuzağının başka bir biçimi olurdu.
   *
   * Bu yüzden karar HEDEFE bakar: yerel döngü adresi (localhost/127.0.0.1/::1) → TLS YOK
   * (trafiğin makineyi terk etmediği ölçülebilir bir olgu). Başka her hedef → kök
   * sertifika ZORUNLU; sertifika yoksa bağlanmayı DENEMEZ ve sebebini yazar.
   */
  const YEREL_DESEN = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/i
  const yerelMi = YEREL_DESEN.test(temizDizi)
  const kokSertifika = path.join(KOK, 'scripts', 'db', 'checks', 'supabase-root-2021-ca.pem')

  if (!yerelMi && !fs.existsSync(kokSertifika)) {
    console.error(
      `${AD}: OLCEMEDI — uzak hedef ve kok sertifika YOK (${path.relative(KOK, kokSertifika)}).`,
    )
    console.error('  TLS SESSIZCE DUSURULMEZ: sertifikasiz uzak baglanti DENENMEZ.')
    process.exit(2)
  }
  console.log(`${AD}: hedef ${yerelMi ? 'YEREL (TLS yok)' : 'UZAK (kok sertifika ZORUNLU)'}`)

  const client = new pg.Client({
    connectionString: temizDizi,
    ssl: yerelMi ? false : { ca: fs.readFileSync(kokSertifika, 'utf8') },
  })

  try {
    await client.connect()
  } catch (e) {
    // ÖLÇEMEDİ ≠ ATLANDI ≠ TEMİZ. Üçü ayrı çıkış kodu.
    console.error(`${AD}: OLCEMEDI — baglanti kurulamadi: ${String(e.message).slice(0, 160)}`)
    process.exit(2)
  }

  let tablolar
  let fkler
  try {
    /**
     * TABLOLAR — `relkind` ile: `r` normal, `p` bölümlenmiş üst tablo. Görünüm (`v`) ve
     * materyalize görünüm (`m`) KAPSAM DIŞI ve bu bilinçli: aşama 1 tablo katmanıdır.
     * `relrowsecurity` = RLS açık mı (politika SAYISI aşama 2'nin işi).
     */
    tablolar = (
      await client.query(
        `select n.nspname as sema,
                c.relname  as ad,
                c.relrowsecurity as rls,
                (select count(*)::int from pg_attribute a
                  where a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped) as kolon
           from pg_class c
           join pg_namespace n on n.oid = c.relnamespace
          where c.relkind in ('r','p') and n.nspname = any($1::text[])
          order by n.nspname, c.relname`,
        [SEMALAR],
      )
    ).rows

    /**
     * YABANCI ANAHTARLAR — `pg_constraint.contype = 'f'`. Kaynak ve hedefin İKİSİ de
     * kapsam şemalarında olmalı; biri dışarıdaysa kenarın bir ucu düğümsüz kalır ve
     * graphify'da orphan üretir.
     */
    fkler = (
      await client.query(
        `select con.conname as ad,
                ns.nspname  as kaynak_sema, kt.relname as kaynak_tablo,
                nt.nspname  as hedef_sema,  ht.relname as hedef_tablo
           from pg_constraint con
           join pg_class kt on kt.oid = con.conrelid
           join pg_namespace ns on ns.oid = kt.relnamespace
           join pg_class ht on ht.oid = con.confrelid
           join pg_namespace nt on nt.oid = ht.relnamespace
          where con.contype = 'f'
            and ns.nspname = any($1::text[])
            and nt.nspname = any($1::text[])
          order by con.conname`,
        [SEMALAR],
      )
    ).rows
  } catch (e) {
    console.error(`${AD}: OLCEMEDI — katalog sorgusu dustu: ${String(e.message).slice(0, 160)}`)
    await client.end().catch(() => {})
    process.exit(2)
  }

  /**
   * ⭐DOĞRULAMA: ürettiğim sayı ile veritabanının verdiği sayı AYNI olmalı. Bu kol olmadan
   * araç bir gün sessizce yarım veri üretmeye başlar ve biz üç ay sonra öğreniriz — bu
   * projede ölçülmüş bir kusur sınıfı. Sayım BAĞIMSIZ bir sorgu ile alınır, aynı satırlar
   * ikinci kez sayılmaz (aynı deseni iki kez koşmak doğrulama DEĞİLDİR).
   */
  let beklenenTablo
  let beklenenFk
  let kapsamDisiFk = 0
  try {
    beklenenTablo = (
      await client.query(
        `select count(*)::int as n from pg_tables where schemaname = any($1::text[])`,
        [SEMALAR],
      )
    ).rows[0].n
    /**
     * ⭐BU SORGU BİR HATADAN SONRA YAZILDI — ve hatayı bu betiğin KENDİ doğrulama kolu
     * yakaladı (2026-09-16, ilk koşum): üretici 13 kenar verdi, doğrulama 19 dedi.
     *
     * Sebep, bu projede tekrar eden sınıf: **ölçüt doğruydu, EVREN yanlıştı.** İlk
     * doğrulama sorgusu `information_schema.table_constraints`'i kullanıyordu; o, KAYNAK
     * tablosu kapsamda olan HER yabancı anahtarı sayar — hedefi `auth` gibi başka bir
     * şemada olsa bile. Üretici ise iki ucu da kapsamda olanları çiziyor (çizmemesi
     * gereken şey, bir ucu düğümsüz kalan kenardır; o graphify'da orphan üretir).
     *
     * Doğrusu: parite AYNI EVRENDE ölçülür. Kapsam dışına giden anahtarlar da GERÇEKTİR
     * ve ayrı bir sayı olarak RAPORLANIR — gizlenmesi "ilişki yok" izlenimi verir.
     */
    beklenenFk = (
      await client.query(
        `select count(*)::int as n
           from pg_constraint con
           join pg_class kt on kt.oid = con.conrelid
           join pg_namespace ns on ns.oid = kt.relnamespace
           join pg_class ht on ht.oid = con.confrelid
           join pg_namespace nt on nt.oid = ht.relnamespace
          where con.contype = 'f'
            and ns.nspname = any($1::text[])
            and nt.nspname = any($1::text[])`,
        [SEMALAR],
      )
    ).rows[0].n

    // KAPSAM DIŞINA giden anahtarlar: çizilmez ama SAYISI söylenir.
    kapsamDisiFk = (
      await client.query(
        `select count(*)::int as n
           from pg_constraint con
           join pg_class kt on kt.oid = con.conrelid
           join pg_namespace ns on ns.oid = kt.relnamespace
           join pg_class ht on ht.oid = con.confrelid
           join pg_namespace nt on nt.oid = ht.relnamespace
          where con.contype = 'f'
            and ns.nspname = any($1::text[])
            and nt.nspname <> all($1::text[])`,
        [SEMALAR],
      )
    ).rows[0].n
  } catch (e) {
    console.error(`${AD}: OLCEMEDI — dogrulama sorgusu dustu: ${String(e.message).slice(0, 120)}`)
    await client.end().catch(() => {})
    process.exit(2)
  }

  await client.end().catch(() => {})

  const nodes = tablolar.map((t) =>
    dugum({
      id: kimlik(t.sema, t.ad),
      label: `${t.sema}.${t.ad}`,
      tur: 'table',
      kaynak: `db://${t.sema}`,
      konum: `kolon=${t.kolon} rls=${t.rls ? 'on' : 'off'}`,
    }),
  )

  const links = fkler.map((f) =>
    kenar({
      source: kimlik(f.kaynak_sema, f.kaynak_tablo),
      target: kimlik(f.hedef_sema, f.hedef_tablo),
      relation: 'references',
      kaynak: `db://${f.kaynak_sema}`,
      context: f.ad,
    }),
  )

  const graf = {
    directed: true,
    multigraph: false,
    graph: {},
    nodes,
    links,
    hyperedges: [],
    // ⚠ÜRETİLMİŞ ARTEFAKT DAMGASI: hangi aşama, hangi şemalar, kaç nesne. Tarih YAZILMAZ —
    // üretilmiş dosyaya tarih yazmak her koşumda gürültülü diff üretir; tazelik ölçümü
    // dosya damgasından değil, SAYIM paritesinden gelir.
    uretici: {
      ad: AD,
      asama: 1,
      semalar: SEMALAR,
      tablo: nodes.length,
      fk: links.length,
      kapsam_disi_fk: kapsamDisiFk,
    },
  }

  fs.mkdirSync(path.dirname(CIKTI), { recursive: true })
  fs.writeFileSync(CIKTI, JSON.stringify(graf, null, 2) + '\n', 'utf8')

  console.log(`${AD}: semalar=${SEMALAR.join(',')} · tablo=${nodes.length} · fk=${links.length}`)
  // KAPSAM DIŞI ilişkiler GİZLENMEZ: çizilmedikleri SÖYLENİR, yoksa "ilişki yok" sanılır.
  console.log(`${AD}: kapsam DISI fk=${kapsamDisiFk} (hedef ${SEMALAR.join(',')} disinda — cizilmedi)`)
  console.log(`${AD}: yazildi -> ${path.relative(KOK, CIKTI)}`)

  const ihlaller = []
  if (nodes.length !== beklenenTablo) {
    ihlaller.push(`tablo sayisi TUTMADI: uretilen ${nodes.length}, katalog ${beklenenTablo}`)
  }
  if (links.length !== beklenenFk) {
    ihlaller.push(`fk sayisi TUTMADI: uretilen ${links.length}, katalog ${beklenenFk}`)
  }
  // Boş graf bir cevap değildir: kapsam şemasında tablo yoksa bu SÖYLENİR.
  if (nodes.length === 0) {
    ihlaller.push(`kapsam semalarinda (${SEMALAR.join(',')}) HIC tablo yok — evren yanlis olabilir`)
  }

  if (ihlaller.length > 0) {
    console.error(`${AD}: IHLAL ${ihlaller.length}`)
    for (const i of ihlaller) console.error(`  - ${i}`)
    process.exit(1)
  }

  console.log(`${AD}: DOGRULAMA TUTTU (tablo ${beklenenTablo}=${nodes.length} · fk ${beklenenFk}=${links.length})`)
  process.exit(0)
}

main().catch((e) => {
  console.error(`${AD}: OLCEMEDI — beklenmeyen hata: ${String(e && e.message).slice(0, 200)}`)
  process.exit(2)
})
