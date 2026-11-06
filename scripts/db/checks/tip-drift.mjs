#!/usr/bin/env node
/**
 * INV-TIP-DRIFT-1 — `src/types/database.types.ts` CANLI ŞEMAYLA SENKRON MU (REC-121).
 *
 * NİÇİN VAR — saha kanıtı (2026-09-01, URUN ölçtü): #946 sonrası `pnpm supabase:gen`
 * koşulunca diff **+76/-1** çıktı ve içinde yalnız beklenen `products.name_i18n` yoktu;
 * `venthub_orders.currency`, `venthub_quotes` FK ilişkileri ve PostgrestVersion değişimi de
 * geldi. Yani daha önce **en az bir migration inmiş, tipler yenilenmemişti** — tip dosyası
 * sessizce canlı şemanın gerisinde kalmıştı. Migration merge edilince prod'a OTOMATİK
 * uygulanıyor (kural 13); tip dosyası ise elle üretiliyor. Arada kapı yoktu.
 *
 * 2026-09-07'de ALTYAPI yeniden ölçtü ve drift HÂLÂ VARDI:
 *   · `order_number_counters` tablosu (2 kolon) commit'li tiplerde YOK
 *   · `generate_order_number_saat_tabanli_20260906` fonksiyonu YOK
 *
 * ⭐ÖLÇÜT HAM METİN DİFF'İ DEĞİL, ŞEMA YÜZEYİ — VE BU KARAR ÖLÇÜMLE ALINDI.
 * Aynı ölçümde diff'in KALANI tamamen CLI sürüm gürültüsüydü: dosya kuyruğundaki jenerik
 * yardımcı tiplerde parantezleme değişmiş (`TableName extends (DefaultSchema…` ve
 * `: never) = never`), 6 yerde. Ham diff'e bağlı bir kapı bu yüzden **kimsenin
 * onaramayacağı bir kırmızı** üretirdi: CLI sürümü her değiştiğinde yanar, şema değişmese de.
 * Sürekli kırmızı kapı, sürekli yanan lambanın kardeşidir — birkaç gün sonra kimse bakmaz.
 * Bu yüzden ölçüt ŞEMA İÇERİĞİ: tablo · görünüm · kolon · fonksiyon · enum (+değerleri) ·
 * bileşik tip. Biçim/sürüm farkı sessiz, ŞEMA farkı KIRMIZI.
 *
 * ⛔FAIL-CLOSED: kimlik yoksa, üretim başarısızsa ya da ayrıştırıcı sağlıksızsa çıkış 2 ve
 * sebep YAZILIR. "Ölçemedim" ile "temiz" aynı görünemez. Özellikle: iki taraf da BOŞ
 * ayrıştırılırsa kümeler eşit çıkar ve kapı vakumda yeşil verirdi — ayrıştırıcı sağlığı
 * bu yüzden ayrı bir kapı.
 *
 * ⛔BU BETİK `src/types/database.types.ts`'İ YAZMAZ, yalnız OKUR. O dosya URUN şeridinin
 * mülkü ve üretilmiş bir artefakt; kapı ölçer, onarımı sahibi yapar (AXIOM 3).
 *
 * KULLANIM: node scripts/db/checks/tip-drift.mjs [--tip-dosyasi <yol>]
 * ÇIKIŞ: 0 = senkron · 1 = DRIFT (şema farkı) · 2 = ÖLÇEMEDİM (fail-closed)
 * (0, canlıya henüz uygulanmamış migration'ın yarattığı kalemleri de kapsar — ALT-159, aşağıda.)
 *
 * ⭐`--tip-dosyasi` NİÇİN VAR (REC-121 CI bağlama adımı, 2026-09-08): kapının KIRMIZI
 * tarafını göstermek için commit'li tip dosyasını BOZMAK gerekiyordu — ama o dosya URUN'un
 * mülkü ve üretilmiş bir artefakt (AXIOM 3). Kardeş kapıda (`aile-kategori-tutarlilik.mjs`)
 * aynı sorun `--fikstur` ile çözülmüştü, çünkü orada sabotaj PROD'a yazmak olurdu ve o
 * Recep kapısıdır. Aynı gerekçe burada da geçerli: sabotaj başkasının artefaktına
 * yazmak olurdu. Bayrak yalnız OKUNAN yolu değiştirir; canlı taraf her zaman API'den
 * üretilir, yani "iki taraf da fikstür" hâli MÜMKÜN DEĞİLDİR.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const VARSAYILAN_TIP_DOSYASI = 'src/types/database.types.ts'

/** `--tip-dosyasi <yol>` verilmişse onu okur; yoksa commit'li artefakt. */
function tipDosyasiSec(argv) {
  const i = argv.indexOf('--tip-dosyasi')
  if (i === -1) return VARSAYILAN_TIP_DOSYASI
  const yol = argv[i + 1]
  if (!yol) {
    console.error('[tip-drift] --tip-dosyasi verildi ama YOL YOK — olcemedim (fail-closed).')
    process.exit(2)
  }
  return yol
}

const TIP_DOSYASI = tipDosyasiSec(process.argv)

/**
 * Ayrıştırıcı sağlık tabanı — ÖLÇÜLDÜ (2026-09-07, canlı şema): 4580 satır üretimde
 * 100+ tablo/görünüm ve 800+ kolon var. Eşikler o ölçümün çok altında tutuldu: amaç
 * "şema küçüldü mü" demek DEĞİL, ayrıştırıcının HİÇ ÇALIŞMADIĞI hâli yakalamak.
 */
const EN_AZ_VARLIK = 20
const EN_AZ_KOLON = 100

/**
 * Üretim yolu commit'li dosyayla AYNI olmalı: dosya `--project-id` (API) ile üretiliyor
 * (`package.json` → `supabase:gen`). `--db-url` ile üretim de mümkün ama çıktısı API
 * yolundan farklı olabilir ve o fark drift sanılırdı. Aynı yolu kullanmak, karşılaştırmayı
 * tek değişkenli tutar: FARK VARSA ŞEMADANDIR.
 */
/**
 * ⭐PROJE KİMLİĞİ `package.json`'DAN OKUNUR, ORTAM DEĞİŞKENİNDEN DEĞİL — ve bu kasıtlı.
 *
 * Kimliği `SUPABASE_PROJECT_REF` gibi bir ortam değişkeninden almak İKİNCİ BİR DOĞRULUK
 * KAYNAĞI yaratır: CI'daki değer `supabase:gen`'in kullandığından farklıysa kapı, dosyanın
 * üretildiği veritabanından BAŞKA bir veritabanıyla karşılaştırır ve ürettiği "drift" listesi
 * baştan sona yanlış olur — üstelik gayet inandırıcı görünür. Kimliği, commit'li dosyanın
 * ÜRETİLDİĞİ yerden (aynı komut satırından) okumak karşılaştırmayı tek değişkenli tutar.
 * Bu depoda bu sınıfın adı var: aynı kavramın iki adı, yönlendirmenin yarısını taşır.
 */
function projeKimligi() {
  let pkg
  try {
    pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  } catch (e) {
    return { hata: 'package.json okunamadi: ' + String((e && e.message) || e).slice(0, 120) }
  }
  const komut = String((pkg.scripts || {})['supabase:gen'] || '')
  if (!komut) return { hata: 'package.json scripts["supabase:gen"] YOK' }
  const m = /--project-id\s+([A-Za-z0-9]+)/.exec(komut)
  if (!m) return { hata: 'supabase:gen icinde --project-id bulunamadi: ' + komut.slice(0, 120) }
  return { ref: m[1], komut }
}

const JETON = process.env.SUPABASE_ACCESS_TOKEN || ''

function oldur(mesaj) {
  console.error('[tip-drift] OLCEMEDIM: ' + mesaj)
  console.error('[tip-drift] Bu satir ALARMDIR, "senkron" demek DEGILDIR.')
  process.exit(2)
}

/**
 * Şema yüzeyini çıkar. Girintiye dayalı, çünkü üretilen dosyanın biçimi kararlı:
 *   `  <sema>: {` → `    Tables: {` → `      <ad>: {` → `        Row: {` → `          <kolon>:`
 * `export const Constants` bloğu AYRI bir gövdedir (aynı şema adlarını tekrar eder) ve
 * ayrıştırma orada DURUR; yoksa enum değerleri iki kez sayılır ve karşılaştırma yine
 * doğru çalışır ama sağlık eşikleri yanıltıcı şişer.
 */
export function yuzeyCikar(metin) {
  const yuzey = new Set()
  let sema = ''
  let bolum = ''
  let varlik = ''
  let rowIci = false

  for (const satir of String(metin).split(/\r?\n/)) {
    if (/^export const Constants/.test(satir)) break

    let m
    if ((m = /^ {2}([A-Za-z_]\w*): \{$/.exec(satir))) {
      sema = m[1]; bolum = ''; varlik = ''; rowIci = false; continue
    }
    if ((m = /^ {4}(Tables|Views|Functions|Enums|CompositeTypes): \{/.exec(satir))) {
      bolum = m[1]; varlik = ''; rowIci = false; continue
    }
    if (!sema || !bolum) continue

    if (bolum === 'Enums') {
      if ((m = /^ {6}([A-Za-z_]\w*): (.+)$/.exec(satir))) {
        yuzey.add('enum:' + sema + '.' + m[1])
        for (const parca of m[2].split('|')) {
          const d = parca.trim().replace(/^"|"$/g, '').replace(/,$/, '')
          if (d && d !== 'never') yuzey.add('enum-deger:' + sema + '.' + m[1] + '.' + d)
        }
      }
      continue
    }
    if (bolum === 'Functions') {
      // Ad YETERLİ: kaydın saha kanıtı "fonksiyon hiç yok" sınıfıydı. Aşırı yüklü
      // (overload) fonksiyonlar aynı ada düşer, bu bilinçli — imza karşılaştırması
      // biçim gürültüsüne açıktır ve bu kapının amacı VARLIK ölçmek.
      if ((m = /^ {6}([A-Za-z_]\w*):/.exec(satir))) yuzey.add('fonksiyon:' + sema + '.' + m[1])
      continue
    }
    if (bolum === 'CompositeTypes') {
      if ((m = /^ {6}([A-Za-z_]\w*): \{/.exec(satir))) yuzey.add('bilesik:' + sema + '.' + m[1])
      continue
    }

    // Tables | Views
    if ((m = /^ {6}([A-Za-z_]\w*): \{$/.exec(satir))) {
      varlik = m[1]
      rowIci = false
      yuzey.add((bolum === 'Tables' ? 'tablo:' : 'gorunum:') + sema + '.' + varlik)
      continue
    }
    if (/^ {8}Row: \{$/.test(satir)) { rowIci = true; continue }
    if (rowIci) {
      if (/^ {8}\}$/.test(satir)) { rowIci = false; continue }
      if ((m = /^ {10}([A-Za-z_]\w*)\??:/.exec(satir))) {
        yuzey.add('kolon:' + sema + '.' + varlik + '.' + m[1])
      }
    }
  }
  return yuzey
}

/** Ayrıştırıcı sağlığı: boş küme ile "fark yok" AYNI GÖRÜNMESİN. */
export function saglikOlc(yuzey) {
  let varlik = 0
  let kolon = 0
  for (const k of yuzey) {
    if (k.startsWith('tablo:') || k.startsWith('gorunum:')) varlik++
    else if (k.startsWith('kolon:')) kolon++
  }
  return { varlik, kolon, saglikli: varlik >= EN_AZ_VARLIK && kolon >= EN_AZ_KOLON }
}

/**
 * ⭐BEKLEYEN MIGRATION İSTİSNASI (ALT-159, 2026-11-06) — "TİPLERDE VAR, CANLIDA YOK" kalemlerinin
 * TEK meşru sebebi: tabloyu/kolonu/fonksiyonu yaratan migration depoda VAR ama canlıya HENÜZ
 * uygulanmadı. Migration'lı PR'da tam bu olur: kod yeni tabloyu kullanır, tipler PR'da üretilir,
 * migration ise ancak birleşince `supabase-migrate.yml` ile uygulanır (kural 13). Saha: #2283
 * (webhook_olaylari) bu kapıda 4 kalemle kırmızıydı ve tipleri çıkarmak tsc'yi kırardı.
 *
 * ⛔DAR TUTULDU: istisna YALNIZ (a) canlı defterde (`public._migration_ledger`) KAYDI OLMAYAN migration
 * dosyalarının (b) metninde YARATILAN nesnelerle BİREBİR eşleşen kalemlere uygulanır. "Canlıda
 * var, tiplerde yok" yönü hiç etkilenmez. Defter okunamazsa ölçüm durur (çıkış 2), yeşil verilmez.
 */
export function migrationNesneleri(metinler) {
  const nesne = new Set()
  const ad = (sema, isim) => (sema || 'public') + '.' + isim
  for (const ham of metinler) {
    const metin = String(ham)
      .replace(/\$(\w*)\$[\s\S]*?\$\1\$/g, (m) => (/^\$\w*\$\s*$/.test(m) ? m : ' '))
      .replace(/--[^\n]*/g, '')
      .replace(/"/g, '')
    let m
    const tablo = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:(\w+)\.)?(\w+)\s*\(([\s\S]*?)\n\s*\)\s*;/gi
    while ((m = tablo.exec(metin))) {
      const t = ad(m[1], m[2])
      nesne.add('tablo:' + t)
      for (const satir of m[3].split('\n')) {
        const k = /^\s*([a-z_]\w*)\s+[a-z]/i.exec(satir)
        if (k && !/^(constraint|primary|unique|foreign|check|exclude|like)$/i.test(k[1])) nesne.add('kolon:' + t + '.' + k[1])
      }
    }
    const kolon = /alter\s+table\s+(?:only\s+)?(?:if\s+exists\s+)?(?:(\w+)\.)?(\w+)\s+add\s+column\s+(?:if\s+not\s+exists\s+)?(\w+)/gi
    while ((m = kolon.exec(metin))) nesne.add('kolon:' + ad(m[1], m[2]) + '.' + m[3])
    const fonk = /create\s+(?:or\s+replace\s+)?function\s+(?:(\w+)\.)?(\w+)\s*\(/gi
    while ((m = fonk.exec(metin))) nesne.add('fonksiyon:' + ad(m[1], m[2]))
  }
  return nesne
}

/** Fazla kalemleri bekleyen migration'ın açıkladıkları ve açıklanamayanlar diye ayırır. */
export function fazlaAyir(fazla, nesneler) {
  return {
    aciklanan: fazla.filter((k) => nesneler.has(k)),
    kalan: fazla.filter((k) => !nesneler.has(k)),
  }
}

/** Defterde kaydı olmayan migration dosyaları. `kayitli` boşsa (defter okunamadı) null döner. */
export function bekleyenDosyalar(dosyalar, kayitli) {
  if (!kayitli || kayitli.size === 0) return null
  return dosyalar.filter((d) => !kayitli.has(d)).sort()
}

async function defterOku(proje) {
  // SALT OKUMA: Management API sorgu ucu, yalnız SELECT. Kimlik kapının zaten kullandığı jeton.
  const yanit = await fetch('https://api.supabase.com/v1/projects/' + proje + '/database/query', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + JETON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'select name from public._migration_ledger' }),
  })
  if (!yanit.ok) throw new Error('defter sorgusu HTTP ' + yanit.status)
  const satirlar = await yanit.json()
  if (!Array.isArray(satirlar)) throw new Error('defter yaniti dizi degil')
  return new Set(satirlar.map((r) => String(r.name)))
}

async function ana() {
  if (!fs.existsSync(TIP_DOSYASI)) oldur(TIP_DOSYASI + ' yok — depo kokunde mi kosuyorsun?')
  const kimlik = projeKimligi()
  if (kimlik.hata) oldur('proje kimligi cozulemedi — ' + kimlik.hata)
  const PROJE = kimlik.ref
  if (!JETON) oldur('SUPABASE_ACCESS_TOKEN bos. Tip uretimi yapilamaz.')
  console.log('[tip-drift] proje ' + PROJE + ' (kaynak: package.json supabase:gen)')

  const gecici = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tip-drift-')), 'canli.ts')
  let uretilen = ''
  try {
    // ⚠WINDOWS: Node 20'den beri `.cmd` sarmalayıcıları doğrudan spawn EDİLEMİYOR
    // (`spawnSync npx.cmd EINVAL` — sahada ölçüldü). `shell: true` şart. CI Linux olduğu için
    // orada gerekmiyor; dal yalnız yerel ölçüm içindir. Argümanlar sabit liste + `PROJE`, ve
    // `PROJE` yalnız `[A-Za-z0-9]+` eşleşmesinden geliyor — kabuğa geçen serbest metin yok.
    uretilen = execFileSync(
      'npx',
      ['--yes', 'supabase@latest', 'gen', 'types', 'typescript', '--project-id', PROJE],
      {
        encoding: 'utf8',
        timeout: 300_000,
        maxBuffer: 64 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: process.platform === 'win32',
      },
    )
  } catch (e) {
    oldur('tip uretimi basarisiz: ' + String((e && e.message) || e).slice(0, 300))
  }
  if (!uretilen || uretilen.length < 1000) oldur('uretilen cikti kucuk/bos (' + uretilen.length + ' bayt)')
  fs.writeFileSync(gecici, uretilen, 'utf8')

  const commitli = yuzeyCikar(fs.readFileSync(TIP_DOSYASI, 'utf8'))
  const canli = yuzeyCikar(uretilen)

  const sC = saglikOlc(commitli)
  const sL = saglikOlc(canli)
  console.log('[tip-drift] commitli: ' + sC.varlik + ' tablo/gorunum, ' + sC.kolon + ' kolon')
  console.log('[tip-drift] canli   : ' + sL.varlik + ' tablo/gorunum, ' + sL.kolon + ' kolon')
  if (!sC.saglikli) oldur('COMMITLI dosya ayristirilamadi (esik ' + EN_AZ_VARLIK + '/' + EN_AZ_KOLON + '). Bicim degismis olabilir; ayristirici GUNCELLENMELI.')
  if (!sL.saglikli) oldur('CANLI cikti ayristirilamadi (esik ' + EN_AZ_VARLIK + '/' + EN_AZ_KOLON + '). Bicim degismis olabilir; ayristirici GUNCELLENMELI.')

  const hamEksik = [...canli].filter((k) => !commitli.has(k)).sort()
  let fazla = [...commitli].filter((k) => !canli.has(k)).sort()
  let bekleyenNot = ''
  if (fazla.length) {
    const migDizin = 'supabase/migrations'
    const dosyalar = fs.readdirSync(migDizin).filter((d) => d.endsWith('.sql'))
    let kayitli
    try {
      kayitli = await defterOku(PROJE)
    } catch (e) {
      oldur('tiplerde fazla kalem var ama canli migration defteri okunamadi: ' + String((e && e.message) || e).slice(0, 160))
    }
    const bekleyen = bekleyenDosyalar(dosyalar, kayitli)
    if (bekleyen === null) oldur('canli migration defteri BOS dondu — bekleyen migration olculemez.')
    const nesneler = migrationNesneleri(bekleyen.map((d) => fs.readFileSync(path.join(migDizin, d), 'utf8')))
    const { aciklanan, kalan } = fazlaAyir(fazla, nesneler)
    if (aciklanan.length) {
      bekleyenNot = aciklanan.length + ' kalem canliya HENUZ uygulanmamis migration ile aciklandi (' + bekleyen.join(', ') + ')'
      console.log('[tip-drift] BEKLEYEN MIGRATION — tiplerde var, canlida henuz yok (' + aciklanan.length + '):')
      for (const k of aciklanan) console.log('    ~ ' + k)
    }
    fazla = kalan
  }

  /**
   * ⭐BİLİNEN BORÇ TABANI — niçin var ve niçin KENDİSİ DE ÖLÇÜLÜYOR.
   *
   * Bu kapı yazıldığında drift ZATEN VARDI (4 kalem) ve onarımı `src/types/database.types.ts`
   * dosyasını tazelemekten geçiyor — o dosya URUN şeridinin mülkü olan bir ÜRETİLMİŞ artefakt.
   * Kapıyı taban olmadan bloklayıcı yapmak, master'ı BAŞKA bir şeridin kuyruğu yüzünden
   * kırmızıya çevirmek olurdu; bu, benim vermeyeceğim bir karar.
   *
   * ⛔TABAN BAYATLAYINCA KIRMIZI: bir taban satırı artık drift değilse (yani tipler tazelenmiş)
   * kapı kırmızı verir ve satırın DÜŞÜRÜLMESİNİ ister. Bu olmadan taban sessizce büyür, kapının
   * evrenini daraltır ve bir gün kapı hiçbir şey ölçmediği hâlde yeşil görünür — bu deponun
   * "vakumda yeşil" dediği sınıf. Taban bir muafiyet değil, TARİHİ OLAN bir borç kaydı.
   */
  let taban = []
  // `fileURLToPath` — Windows'ta ham `import.meta.url` yolu `/C:/...` gelir ve elle
  // kırpmak sessizce yanlış yol üretir; taban okunamazsa kapı fail-closed düşer.
  const tabanYolu = path.join(path.dirname(fileURLToPath(import.meta.url)), 'tip-drift-taban.json')
  try {
    const t = JSON.parse(fs.readFileSync(tabanYolu, 'utf8'))
    if (!Array.isArray(t.bilinen_borc)) throw new Error('bilinen_borc dizi degil')
    taban = t.bilinen_borc.map(String)
  } catch (e) {
    oldur('taban dosyasi okunamadi/ayristirilamadi (' + String((e && e.message) || e).slice(0, 120) + '). Taban OKUNAMAYINCA yesil verilemez: muafiyet listesi bilinmeden "senkron" denemez.')
  }

  const tabanKumesi = new Set(taban)
  const eksik = hamEksik.filter((k) => !tabanKumesi.has(k))
  const bayatTaban = taban.filter((k) => !hamEksik.includes(k)).sort()

  if (bayatTaban.length) {
    console.error('[tip-drift] INV-TIP-DRIFT-1 KIRMIZI — TABAN BAYAT: asagidaki kalemler artik drift DEGIL.')
    for (const k of bayatTaban) console.error('    ! ' + k)
    console.error('  ONARIM: bu satirlari scripts/db/checks/tip-drift-taban.json icinden DUS.')
    console.error('  NICIN KIRMIZI: bayat taban kapinin evrenini daraltir; kapi durur ama YESIL gorunur.')
    process.exit(1)
  }

  if (eksik.length === 0 && fazla.length === 0) {
    console.log(
      '[tip-drift] INV-TIP-DRIFT-1 YESIL — sema yuzeyi SENKRON (bicim/surum farki olcut DEGIL)' +
      (taban.length ? '; ' + taban.length + ' kalem BILINEN BORC tabanda (bunlar HALA DRIFT, onarimi bekliyor).' : '.') +
      (bekleyenNot ? ' ' + bekleyenNot + '; migration uygulaninca kalemler canlida da gorunur.' : ''),
    )
    process.exit(0)
  }

  console.error('[tip-drift] INV-TIP-DRIFT-1 KIRMIZI — tip dosyasi canli semanin GERISINDE ya da ONUNDE.')
  if (eksik.length) {
    console.error('  CANLIDA VAR, TIPLERDE YOK (' + eksik.length + '):')
    for (const k of eksik.slice(0, 40)) console.error('    + ' + k)
    if (eksik.length > 40) console.error('    ... ' + (eksik.length - 40) + ' kalem daha')
  }
  if (fazla.length) {
    console.error('  TIPLERDE VAR, CANLIDA YOK (' + fazla.length + '):')
    for (const k of fazla.slice(0, 40)) console.error('    - ' + k)
    if (fazla.length > 40) console.error('    ... ' + (fazla.length - 40) + ' kalem daha')
  }
  console.error('  ONARIM: pnpm supabase:gen  (tip dosyasini SAHIBI tazeler — bu betik onu YAZMAZ)')
  process.exit(1)
}

// Modül olarak import edildiğinde (konformans kolu) ana akış koşmaz. Karşılaştırma
// `pathToFileURL` ile yapılır: Windows'ta ham `import.meta.url` yolu `/C:/...` biçiminde
// gelir ve düz string karşılaştırması sessizce HİÇ eşleşmez — betik "koşmuş" görünür,
// hiçbir şey ölçmez.
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  ana().catch((e) => oldur('beklenmeyen hata: ' + String((e && e.message) || e).slice(0, 200)))
}
