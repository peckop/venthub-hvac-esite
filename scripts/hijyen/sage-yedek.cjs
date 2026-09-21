#!/usr/bin/env node
/**
 * SAGE YEDEĞİ — çapalı hafızanın TUTARLI anlık görüntüsü (REC-345).
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NİÇİN VAR
 * ══════════════════════════════════════════════════════════════════════════════
 * Hafıza dersleri sage'e taşınıyor (dosya hafızasından puanlı tek depoya). Tek depo
 * **tek arıza noktasıdır**: `.wrongstack/memories/sage.db` git DIŞIDIR (bilerek — ikili
 * SQLite üç pencerede çatışır, sır taraması ikiliyi görmez, içerik PR incelemesini atlar),
 * yani depoyu kaybetmek dersleri kaybetmektir ve geri dönüşü yoktur.
 *
 * ⛔CANLI DOSYA KOPYASI YEDEK DEĞİLDİR. Ölçüldü (2026-09-18): veritabanı WAL kipinde ve
 * yanında 758 KB'lık bir `sage.db-wal` duruyordu. `sage.db`yi tek başına kopyalamak, WAL'da
 * bekleyen yazımları ATLAR — elde sessizce eksik, hatta tutarsız bir dosya kalır. Bu yüzden
 * yedek `VACUUM INTO` ile alınır: kaynak SALT-OKUMA açılır, çıktı WAL dahil tek tutarlı
 * dosyadır.
 *
 * ⛔YEDEK GIT'E KONMAZ. Özel hafıza deposu bile üç pencerenin yazdığı bir git deposudur ve
 * ikili dosya çatışması birleştirilemez. Yedek git DIŞI bir dizine iner
 * (`%LOCALAPPDATA%/venthub-sage-yedek`, ya da `VENTHUB_SAGE_YEDEK_DIZINI`).
 *
 * ⭐YEDEK DOĞRULANMADAN YEDEK SAYILMAZ. Her koşum, ürettiği dosyayı salt-okuma açar, kayıt
 * sayısını ve tabloları KAYNAKLA KARŞILAŞTIRIR. Sayı tutmuyorsa çıkış kodu kırmızıdır ve dosya
 * `.DOGRULANMADI` uzantısıyla bırakılır — "yedek aldım" cümlesi ölçülmüş olmadan kurulmaz.
 * (Bu depoda ölçülmüş kusur sınıfı: "koşuyor" ≠ "geçti".)
 *
 * KOŞTURMA:
 *   node scripts/hijyen/sage-yedek.cjs            # yedek al + doğrula
 *   node scripts/hijyen/sage-yedek.cjs --liste    # mevcut yedekleri yaz
 *
 * Yöneten cetvel: docs/standards/hafiza-kancalari-standard.md §7.
 */
const fs = require('fs')
const path = require('path')

const { anaKok } = require('./ana-kok.cjs')

/** Kaç yedek tutulur (en yenileri). Eski olanlar silinir — sonsuz büyüme de bir arızadır. */
const TUTULACAK = 14

/**
 * ⛔KÖK = ANA AĞAÇ, `cwd` DEĞİL. Ölçüldü 2026-09-18: worktree'den koşulunca eski kök çözümü
 * kendi kopyasına bakıyor, orada `.wrongstack` hiç yok, betik "sage kurulu degil" deyip
 * ÇIKIŞ 0 ile dönüyordu. Oturum kapanışı kancasına bağlansa yedek HİÇ alınmaz, başarılı görünürdü.
 */
function kok() {
  return anaKok()
}

/**
 * ⭐YEDEKLENEN DEPOLAR — "sage" tek başına değil.
 *
 * 2026-09-19 ölçüldü: iş kartı panosu da aynı yerde, aynı biçimde yaşıyor —
 * `.wrongstack/kanbans/_kanban.sqlite`, WAL kipli, git DIŞI, yedeksiz. Ölçüm anında ana dosya
 * **4 KB**, yanındaki WAL **148 KB** idi: yani panonun içeriği pratikte TAMAMEN WAL'daydı ve
 * düz bir dosya kopyası neredeyse BOŞ bir pano verirdi. Bu, sage'de bedel ödeyerek öğrendiğimiz
 * kusurun aynısıdır; ders zaten yazılıydı ("WAL kipli HERHANGİ bir SQLite verisi").
 *
 * `ana`: kayıt sayısının anlamlı olduğu tablo (varsa). Yoksa parmak izi tüm tabloların
 * satır sayılarından kurulur — depo biçimini bilmek gerekmez.
 */
const DEPOLAR = [
  { ad: 'sage', goreli: ['.wrongstack', 'memories', 'sage.db'], onek: 'sage-', uzanti: '.db', ana: 'memories' },
  {
    ad: 'kanban',
    goreli: ['.wrongstack', 'kanbans', '_kanban.sqlite'],
    onek: 'kanban-',
    uzanti: '.sqlite',
    ana: null,
  },
]

const depoBul = (ad) => DEPOLAR.find((d) => d.ad === ad) || DEPOLAR[0]

function kaynakYolu(k = kok(), depoAdi = 'sage') {
  return path.join(k, ...depoBul(depoAdi).goreli)
}

/** Git DIŞI hedef dizin. Depo içine ASLA yazılmaz (ikili + üç yazar = çözülemez çatışma). */
function yedekDizini() {
  if (process.env.VENTHUB_SAGE_YEDEK_DIZINI) return process.env.VENTHUB_SAGE_YEDEK_DIZINI
  const taban =
    process.env.LOCALAPPDATA || process.env.XDG_STATE_HOME || path.join(process.env.HOME || '.', '.local', 'state')
  return path.join(taban, 'venthub-sage-yedek')
}

/** node:sqlite deneysel: uyarı stderr'e düşmesin (dinleyici require'DAN ÖNCE kaldırılır). */
function sqlite() {
  process.removeAllListeners('warning')
  process.on('warning', () => {})
  return require('node:sqlite')
}

/**
 * Bir veritabanının parmak izi: tablo adları + HER TABLONUN satır sayısı. Karşılaştırma bununla.
 *
 * ⛔TABLO LİSTESİ TEK BAŞINA YETMEZ: boş bir kopya da aynı tablo listesini taşır. Satır
 * sayıları olmadan "doğrulandı" cümlesi kurulamaz — sage'de ölçülen kusur tam buydu
 * (düz kopya 26 kaydın 20'sini veriyordu, tablolar aynıydı).
 *
 * @param {string} yol veritabanı dosyası
 * @param {string|null} ana kayıt sayısının anlamlı olduğu tablo; yoksa toplam satır kullanılır
 */
function parmakIzi(yol, ana = 'memories') {
  const { DatabaseSync } = sqlite()
  const db = new DatabaseSync(yol, { readOnly: true })
  try {
    const kayitlar = db
      .prepare("select name, sql from sqlite_master where type='table' and name not like 'sqlite_%' order by name")
      .all()
    const tablolar = kayitlar.map((r) => r.name)
    /**
     * ⛔SANAL TABLO SAYILMAZ. Ölçüldü 2026-09-19: sage'in `memories_fts` tablosu harici
     * içerikli bir FTS5 sanal tablosudur ve `count(*)` "no such column: T.text" ile PATLAR.
     * İlk genel yazımda bu yüzden sage yedeği tamamen düştü — ve iyi ki düştü, çünkü sessiz
     * kalsaydı yedek alınmadan "alındı" denecekti. Sanal tablo LİSTEDE kalır (varlığı
     * karşılaştırılır), yalnız satır sayımının dışında tutulur; gölge tabloları
     * (`*_fts_data`, `*_fts_idx`, `*_fts_docsize`) zaten gerçek tablodur ve sayılır.
     */
    const satirlar = {}
    for (const r of kayitlar) {
      if (/^\s*create\s+virtual\s+table/i.test(String(r.sql || ''))) {
        satirlar[r.name] = 'SANAL'
        continue
      }
      try {
        satirlar[r.name] = Number(db.prepare(`select count(*) as c from "${r.name.replace(/"/g, '""')}"`).get().c)
      } catch (e) {
        // Sayılamayan tablo "yok" sayılmaz; iki tarafta AYNI sebeple sayılamıyorsa eşleşir.
        satirlar[r.name] = 'OLCULEMEDI:' + String((e && e.message) || e).slice(0, 60)
      }
    }
    const anaVar = ana !== null && tablolar.includes(ana)
    const sayilabilir = Object.values(satirlar).filter((v) => typeof v === 'number')
    const sayi = anaVar ? satirlar[ana] : sayilabilir.reduce((a, b) => a + b, 0)
    // `aktif` yalnız `status` sütunu GERÇEKTEN varsa ölçülür; yoksa null — uydurulmaz.
    let aktif = null
    if (anaVar) {
      const sutunlar = db.prepare(`pragma table_info("${ana.replace(/"/g, '""')}")`).all().map((r) => r.name)
      if (sutunlar.includes('status')) {
        aktif = Number(db.prepare(`select count(*) as c from "${ana}" where status='active'`).get().c)
      }
    }
    return { tablolar, satirlar, sayi, aktif }
  } finally {
    try {
      db.close()
    } catch {
      /* süreç zaten bitiyor */
    }
  }
}

function damga(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(
    d.getUTCMinutes(),
  )}Z`
}

/**
 * Tutarlı yedek alır ve DOĞRULAR.
 * @returns {{durum:'alindi'|'dogrulanmadi'|'kaynak-yok'|'hata', yol?:string, kaynak?:object, yedek?:object, sebep?:string}}
 */
function yedekAl(simdi = new Date(), depoAdi = 'sage') {
  const depo = depoBul(depoAdi)
  const kaynak = kaynakYolu(kok(), depo.ad)
  if (!fs.existsSync(kaynak)) return { durum: 'kaynak-yok', depo: depo.ad, sebep: kaynak }

  const dizin = yedekDizini()
  fs.mkdirSync(dizin, { recursive: true })
  const hedef = path.join(dizin, `${depo.onek}${damga(simdi)}${depo.uzanti}`)

  let kaynakIzi
  try {
    kaynakIzi = parmakIzi(kaynak, depo.ana)
    const { DatabaseSync } = sqlite()
    const db = new DatabaseSync(kaynak, { readOnly: true })
    try {
      // ⭐VACUUM INTO: WAL dahil TEK tutarlı dosya. Kaynağa YAZMAZ (readOnly ile açıldı).
      db.exec(`VACUUM INTO '${hedef.replace(/'/g, "''")}'`)
    } finally {
      try {
        db.close()
      } catch {
        /* süreç zaten bitiyor */
      }
    }
  } catch (e) {
    return { durum: 'hata', sebep: String((e && e.message) || e).slice(0, 200) }
  }

  // GERİ YÜKLEME DENEMESİ: yedeği aç, parmak izini kaynakla karşılaştır.
  let yedekIzi
  try {
    yedekIzi = parmakIzi(hedef, depo.ana)
  } catch (e) {
    const bozuk = hedef + '.DOGRULANMADI'
    try {
      fs.renameSync(hedef, bozuk)
    } catch {
      /* yeniden adlandırma başarısızsa dosya yerinde kalır; durum yine kırmızı */
    }
    return { durum: 'dogrulanmadi', yol: bozuk, sebep: 'yedek acilamadi: ' + String((e && e.message) || e).slice(0, 160) }
  }

  const uyusuyor =
    yedekIzi.sayi === kaynakIzi.sayi &&
    yedekIzi.aktif === kaynakIzi.aktif &&
    yedekIzi.tablolar.join(',') === kaynakIzi.tablolar.join(',') &&
    JSON.stringify(yedekIzi.satirlar) === JSON.stringify(kaynakIzi.satirlar)
  if (!uyusuyor) {
    const bozuk = hedef + '.DOGRULANMADI'
    try {
      fs.renameSync(hedef, bozuk)
    } catch {
      /* aynı: durum kırmızı kalır */
    }
    return {
      durum: 'dogrulanmadi',
      yol: bozuk,
      kaynak: kaynakIzi,
      yedek: yedekIzi,
      sebep: `parmak izi uyusmuyor (kaynak ${kaynakIzi.sayi}/${kaynakIzi.aktif}, yedek ${yedekIzi.sayi}/${yedekIzi.aktif})`,
    }
  }

  budama(dizin, depo.ad)
  return { durum: 'alindi', depo: depo.ad, yol: hedef, kaynak: kaynakIzi, yedek: yedekIzi }
}

/**
 * HER deponun yedeğini alır. Oturum kancası ve CLI bunu çağırır.
 *
 * ⛔"Biri alındı" HEPSİ ALINDI DEMEK DEĞİLDİR: her depo ayrı ayrı döner, çağıran hepsini
 * raporlar. Tek bir başarılı satırın ötekinin düştüğünü örtmesi, yedeksizliğin sessiz hâlidir.
 */
function hepsiniAl(simdi = new Date()) {
  return DEPOLAR.map((d) => ({ depo: d.ad, ...yedekAl(simdi, d.ad) }))
}

/** En yeni TUTULACAK yedeği bırakır. `.DOGRULANMADI` dosyalarına DOKUNMAZ (kanıt olarak kalır). */
function budama(dizin = yedekDizini(), depoAdi = 'sage') {
  const depo = depoBul(depoAdi)
  const desen = new RegExp('^' + depo.onek + '.*' + depo.uzanti.replace('.', '\\.') + '$')
  let dosyalar
  try {
    dosyalar = fs
      .readdirSync(dizin)
      .filter((f) => desen.test(f))
      .sort()
  } catch {
    return []
  }
  const silinecek = dosyalar.slice(0, Math.max(0, dosyalar.length - TUTULACAK))
  for (const f of silinecek) {
    try {
      fs.unlinkSync(path.join(dizin, f))
    } catch {
      /* silinemezse bir sonraki koşumda tekrar denenir */
    }
  }
  return silinecek
}

function liste(dizin = yedekDizini(), onek = null) {
  const onekler = onek ? [onek] : DEPOLAR.map((d) => d.onek)
  try {
    return fs
      .readdirSync(dizin)
      .filter((f) => onekler.some((o) => f.startsWith(o)))
      .sort()
      .map((f) => {
        const s = fs.statSync(path.join(dizin, f))
        return { ad: f, bayt: s.size, tarih: s.mtime.toISOString() }
      })
  } catch {
    return []
  }
}

/**
 * "Yedeğim ne kadar eski" sorusunun TEK cevabı — istem satırı ve oturum kancası bunu okur.
 *
 * ⛔`.DOGRULANMADI` dosyaları YEDEK SAYILMAZ: onlar bir koşumun düştüğünün kanıtıdır.
 * Doğrulanmamış bir dosyayı "son yedek" saymak, kaybı taze gösterir.
 *
 * @returns {{sonYedek: string|null, gun: number|null, dogrulanmadi: string[], adet: number}}
 */
function sonDurum(dizin = yedekDizini(), simdi = Date.now()) {
  const hepsi = liste(dizin)
  const dogrulanmadi = hepsi.filter((y) => y.ad.endsWith('.DOGRULANMADI')).map((y) => y.ad)

  const depolar = DEPOLAR.map((d) => {
    const desen = new RegExp('^' + d.onek + '.*' + d.uzanti.replace('.', '\\.') + '$')
    const saglam = hepsi.filter((y) => desen.test(y.ad))
    const son = saglam.length ? saglam[saglam.length - 1] : null
    let kaynakVar = false
    try {
      kaynakVar = fs.existsSync(kaynakYolu(kok(), d.ad))
    } catch {
      /* kök çözülemedi: depo "ilgisiz" sayılır, uydurma rapor üretilmez */
    }
    return {
      depo: d.ad,
      kaynakVar,
      sonYedek: son ? son.tarih : null,
      gun: son ? Math.floor((simdi - Date.parse(son.tarih)) / 86_400_000) : null,
      adet: saglam.length,
    }
  })

  /**
   * ⭐ÜST DÜZEY ALANLAR EN KÖTÜ HÂLİ ANLATIR. İki depo var; biri dün, biri hiç yedeklenmişse
   * "son yedek dün" demek yalandır. Ölçüt: bu makinede KAYNAĞI OLAN depoların en kötüsü.
   * Kaynağı olmayan depo (ör. pano hiç açılmamış) rapora girmez — olmayan şeyin yedeği istenmez.
   */
  const ilgili = depolar.filter((d) => d.kaynakVar)
  const temel = ilgili.length ? ilgili : depolar
  const yedeksiz = temel.find((d) => d.sonYedek === null)
  const enEski = temel.slice().sort((a, b) => (b.gun === null ? 1 : b.gun) - (a.gun === null ? 1 : a.gun))[0]
  const secilen = yedeksiz || enEski

  return {
    sonYedek: secilen ? secilen.sonYedek : null,
    gun: secilen ? secilen.gun : null,
    dogrulanmadi,
    adet: temel.reduce((a, d) => a + d.adet, 0),
    depolar,
  }
}

module.exports = {
  TUTULACAK,
  DEPOLAR,
  kaynakYolu,
  yedekDizini,
  parmakIzi,
  yedekAl,
  hepsiniAl,
  budama,
  liste,
  damga,
  sonDurum,
}

if (require.main === module) {
  if (process.argv.includes('--liste')) {
    const l = liste()
    if (!l.length) process.stdout.write(`sage-yedek: ${yedekDizini()} altinda yedek YOK\n`)
    for (const y of l) process.stdout.write(`${y.ad}  ${y.bayt} bayt  ${y.tarih}\n`)
    process.exit(0)
  }
  /**
   * ⛔HER DEPO AYRI RAPORLANIR. "Biri alındı" hepsinin alındığı anlamına gelmez; tek başarılı
   * satırın ötekini örtmesi, yedeksizliğin sessiz hâlidir.
   *
   * ÇIKIŞ KODU: bu makinede KAYNAĞI OLAN bir depo düşerse kırmızı; hiçbir depo yedek
   * üretemediyse de kırmızı. Kaynağı hiç olmayan depo (ör. pano bu makinede açılmamış)
   * tek başına kırmızı yapmaz — olmayan şeyin yedeği istenmez, ama SATIRI yazılır.
   */
  const sonuclar = hepsiniAl()
  let kirmizi = false
  let alinan = 0
  for (const s of sonuclar) {
    if (s.durum === 'alindi') {
      alinan++
      const aktif = s.yedek.aktif === null ? '' : ` (aktif ${s.yedek.aktif})`
      process.stdout.write(
        `sage-yedek [${s.depo}]: ALINDI ve DOGRULANDI -> ${s.yol}\n` +
          `  kayit ${s.yedek.sayi}${aktif}, tablo ${s.yedek.tablolar.length} — kaynakla BIREBIR\n`,
      )
    } else if (s.durum === 'kaynak-yok') {
      process.stdout.write(
        `sage-yedek [${s.depo}]: kaynak YOK — ${s.sebep}\n` +
          `  bu depo bu makinede kurulu degil; yedek alinmadi (tek basina kirmizi DEGIL)\n`,
      )
    } else {
      kirmizi = true
      process.stderr.write(`sage-yedek [${s.depo}]: ⛔${String(s.durum).toUpperCase()} — ${s.sebep}\n`)
    }
  }
  if (alinan === 0) {
    /**
     * ⛔SESSIZ ATLAMA YOK. Eskiden burada çıkış 0 vardı ve "yedek alınmadı" cümlesi başarı
     * gibi okunuyordu. Ölçülen arıza: worktree'den koşumda kaynak HER ZAMAN bulunamıyordu.
     * Artık kök ana ağaca bağlı; orada da hiçbir depo yoksa bu ya gerçek bir kayıptır ya da
     * hiçbiri kurulmamıştır — ikisi de "yedeğim var" demenin karşıtıdır, kırmızıdır.
     */
    process.stderr.write(
      `sage-yedek: ⛔KAYNAK YOK — HICBIR yedek ALINMADI (bu satir BASARI DEGILDIR)\n` +
        `  ana agac : ${kok()}  (git --git-common-dir ile cozuldu)\n` +
        `  aranan   : ${sonuclar.map((s) => s.sebep).join(' · ')}\n`,
    )
    process.exit(2)
  }
  process.exit(kirmizi ? 1 : 0)
}
