#!/usr/bin/env node
/**
 * PreCompact DURUM KAPISI — REC-86 Faz 1 (ALTYAPI).
 *
 * NİÇİN VAR (ölçülmüş vakalar, hipotez değil):
 *  · 2026-08-27: compact dönüşünde durum dosyası okunmadı, gün boyu bedel ödendi.
 *  · 2026-08-28: Recep'in geçiş anında yazdığı mesaj yutuldu — 3 tur kayıp + güven hasarı.
 *  · Bugüne kadar compact dayanıklılığı TAMAMEN ajan disiplinine dayanıyordu: bu makinede
 *    hiçbir ayar katmanında PreCompact kancası TANIMLI DEĞİLDİ (ölçüldü: proje/kullanıcı/local
 *    settings + 11 eklenti hooks.json → 0 eşleşme; negatif kontrol SessionStart 153 dosya).
 *    Platform olayı destekliyor, biz yazmamışız. Bu dosya o boşluğu kapatır.
 *
 * NE YAPAR: compact'e girmeden önce oturumun kendi durum dosyasını bulur ve TAZE olup
 * olmadığını ölçer. Bulamazsa BLOKLAR (exit 2); bayatsa UYARIR (exit 0, stdout).
 *
 * ⚠ ÖLÇÜLMEMİŞ VARSAYIM, BİLEREK YAZIYORUM: platform belgesi exit 2 için "blocking error,
 * stderr fed back to Claude" diyor ama PreCompact'ta compact'i GERÇEKTEN iptal ettiği bu
 * makinede ölçülmedi (compact'i kullanıcı tetikler, ajan tetikleyemez). Tasarım buna
 * GÜVENMİYOR: blok çalışmasa bile stderr Claude'a beslenir ve uyarı görünür. Yani kapının
 * değeri exit 2'nin semantiğine bağlı değil. İlk gerçek compact'te davranış ölçülüp bu yorum
 * güncellenecek.
 *
 * GÜVENLİK VALFİ: kilitlenme riskine karşı `VENTHUB_PRECOMPACT_KAPALI=1` kapıyı atlar.
 * Blok YALNIZ "hiç durum dosyası yok" halinde; bayatlık asla bloklamaz (compact'i
 * engellemek, kaybettiğinden fazlasını maliyet yazabilir).
 */

const fs = require('fs')
const os = require('os')
const path = require('path')

// Eşik SAYIYLA yazılı (OPS hükmü: "bayatlık eşiği cetvelde SAYIYLA olacak").
// ÖLÇÜLDÜ 2026-08-28: aktif beş şeridin durum dosyaları 1 / 9 / 17 / 27 / 35 / 39 / 46
// dakika yaşındaydı; bir sonraki değer 356 dakika (dünkü, kapanmış gün). Aradaki boşluk
// büyük ve nettir. 60 dakika, en eski AKTİF dosyaya %30 pay bırakır ve kapanmış günü
// ayırt eder. Eşiği düşürmek (ör. 30) AUTH'u yanlış alarmla vururdu — o gün 46 dakikaydı.
const BAYAT_ESIK_DK = 60

// MEMORY.md boyut bekçisi. ÖLÇÜM TABANI: indeks ~24.4KB'de okunamaz oluyor ve 27.5KB'de
// sessizce kırpıldığı gözlendi (memory-index-truncates-silently). Filo 16KB'yi çalışma
// eşiği seçti; uyarı onun üstünde başlar. Ölçü BAYT, satır DEĞİL — kırpma bayta bakıyor.
const MEMORY_ESIK_BAYT = 16384

/**
 * ⭐TÜRKÇE HARFLERİ ASCII'YE KATLAR — ölçülmüş kusur (2026-09-01, URUN bildirdi, ALTYAPI ölçtü).
 *
 * VAKA: Bu kapı GÜNDE İKİ KEZ yanlış alarm verdi. `DORT_ALAN` desenleri ASCII yazılıydı
 * (`son girdi` / `SON GIRDI`), oysa şeritlerin başlıkları Türkçe: **`SON GİRDİ`**.
 * JavaScript'in `/i` bayrağı **noktalı İ'yi i'ye KATLAMAZ** (`u` bayrağıyla da katlamaz).
 * Dahası — ve asıl tuzak bu — `'SON GİRDİ'.toLowerCase()` düz `'son girdi'` DEĞİL,
 * **`'son gi̇rdi̇'`** verir: `i` + BİRLEŞİK NOKTA (U+0307). Yani "küçük harfe çevir" TEK BAŞINA
 * ÇÖZMEZ; birleşik işaretlerin de atılması gerekir.
 *
 * ÇÖZÜM: NFD ile ayrıştır → birleşik işaretleri (U+0300-U+036F) at → `ı`/`İ` gibi
 * ayrıştırılamayanları elle eşle → küçült. Böylece `İ→i`, `ş→s`, `ğ→g`, `ö→o`, `ü→u`, `ç→c`,
 * `ı→i` olur ve desenler SADE ASCII kalabilir (desen başına iki varyant yazmak zorunda
 * kalmak, varyantlardan birini unutmanın ta kendisiydi).
 *
 * ⚠KENDİ DOSYAM TESADÜFEN GEÇİYORDU: eski bloklarımda ASCII `SON GIRDI` başlığı vardı, yani
 * kapı bende YEŞİLDİ ama **sebebi doğru değildi**. "Yeşil gördüm" ≠ "ölçüt çalışıyor".
 */
function asciiKatla(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')
    .replace(/I/g, 'i')
    .toLowerCase()
}

// 4 SABİT ALAN (filo standardı, REC-86). Compact bloğu bu dördünü taşımazsa dönüşte
// "neredeydim" sorusu cevapsız kalır. Eşleştirme gevşek: başlık metni şeritten şeride
// değişebiliyor, aranan şey ALANIN VARLIĞI.
// Desenler ASCII-KATLANMIŞ metne karşı koşar (bkz. asciiKatla) — o yüzden burada yalnız
// küçük harfli ASCII biçim yazılır, Türkçe varyant YAZILMAZ.
const DORT_ALAN = [
  { ad: 'son girdi', desen: /son\s+girdi|bana ulasan son/ },
  { ad: 'acik kuyruk', desen: /acik\s+kuyruk|sonraki\s+is|kuyruk/ },
  { ad: 'verilen sozler', desen: /verilen\s+soz|taahhut/ },
  { ad: 'bekleyen kararlar', desen: /bekleyen\s+karar|recep(te|'te)\s+bekleyen/ },
]

function girdiOku() {
  let ham = ''
  try {
    ham = fs.readFileSync(0, 'utf8')
  } catch {
    return {}
  }
  try {
    return JSON.parse(ham || '{}')
  } catch {
    return {}
  }
}

/**
 * Proje dizinini SID'DEN çözer, cwd'den DEĞİL.
 *
 * NİÇİN böyle: cwd'den slug türetmek bu filoda YANLIŞ dizine gider — ölçüldü 2026-08-28.
 * Worktree'de açılan oturumlar kendi proje dizinlerini yaratıyor (`C--tmp-vh-altyapi-851`
 * GERÇEKTEN var) ve o dizinlerde `memory/` YOK; hafıza ana dizinin slug'ı altında duruyor.
 * cwd'ye güvenen bir kapı, worktree'de sessizce "durum dosyası yok" derdi — yani en çok
 * ihtiyaç duyulan yerde kör olurdu. Ayırt eden ölçüt: oturumun transcript'i hangi dizinde.
 */
function projeDiziniBul(sid, transcriptPath) {
  // 1) En doğrudan kanıt: transcript yolu zaten proje dizininin içindedir.
  if (transcriptPath) {
    const d = path.dirname(transcriptPath)
    if (fs.existsSync(d)) return d
  }
  // 2) Kanıtı ara: <sid>.jsonl hangi proje dizininde duruyor.
  const kok = path.join(os.homedir(), '.claude', 'projects')
  let adaylar = []
  try {
    adaylar = fs.readdirSync(kok, { withFileTypes: true }).filter(e => e.isDirectory())
  } catch {
    return null
  }
  for (const e of adaylar) {
    if (sid && fs.existsSync(path.join(kok, e.name, sid + '.jsonl'))) return path.join(kok, e.name)
  }
  return null
}

// Durum dosyası ad kalıbı. ÖLÇÜLDÜ 2026-08-28: filodaki gerçek adlar
// `altyapi-lane-day-2026-08-28.md`, `ops-cycle-audit-state.md`, `i18n-lane-day-*.md`.
const AD_KALIBI = /(lane-day|state|durum)/i

/**
 * Bu oturuma AİT DURUM dosyaları.
 *
 * ⚠ İLK UYGULAMAM YANLIŞTI, kapıyı bağlamadan önce testte yakalandı: ölçüt yalnız
 * "originSessionId eşleşen en taze dosya"ydı ve bu AYIRT ETMİYOR — bu oturumun 23 hafıza
 * dosyası var, çoğu DERS dosyası. Kapı `dizin-olcum-kanit-dersleri.md`'yi durum dosyası
 * sanıp "dört alan eksik" diye YANLIŞ ALARM verdi. Ders dosyasında o alanların olmaması
 * doğru; ölçülmesi gereken dosya o değildi.
 *
 * Düzeltme iki katmanlı, çünkü tek katman kırılgan olurdu:
 *  (1) ad kalıbı — filoda gerçekten kullanılan adlar,
 *  (2) ad tutmazsa İÇERİK: dört sabit alandan en az BİRİNİ taşıyan dosya durum dosyasıdır.
 * Bir şerit dosyasını başka türlü adlandırırsa (2) yakalar; hiçbiri yoksa liste boş döner
 * ve blok kolu çalışır — sessiz yanlış eşleşme yerine görünür blok.
 * (2)'nin eşiği ölçümle seçildi; gerekçesi gövdedeki yorumda — önce 2 yazmıştım ve o değer
 * katmanı ÖLÜ bırakıyordu, çünkü gerçek durum dosyaları da dörtten yalnız birini tutuyor.
 */
function oturumunDosyalari(memoryDir, sid) {
  let adlar = []
  try {
    adlar = fs.readdirSync(memoryDir).filter(a => a.endsWith('.md'))
  } catch {
    return []
  }
  const adEsleseni = []
  const icerikEsleseni = []
  for (const ad of adlar) {
    const tam = path.join(memoryDir, ad)
    try {
      const govde = fs.readFileSync(tam, 'utf8')
      // Kimlik yalnız frontmatter'da aranır: gövdede geçen bir sid ATIFTIR, sahiplik değil.
      if (!sid || !govde.slice(0, 600).includes(sid)) continue
      const kayit = { ad, tam, mt: fs.statSync(tam).mtimeMs }
      // İçerik eşiği 1 — ÖLÇÜLDÜ 2026-08-28, ilk yazdığım 2 değeri ÖLÜ KATMAN üretiyordu:
      // filodaki gerçek durum dosyaları bu dört desenden yalnız BİRİNİ tutuyor
      // (altyapi-lane-day: 1 alan), ders dosyaları ise SIFIR (dizin-olcum-kanit-dersleri: 0,
      // dizin-kapi-test-dersleri: 0). Yani 1, durum dosyasını yakalar ve dersi yine dışlar;
      // 2 ise ikisini birden dışlıyordu — katman hiç iş görmüyordu ve bunu ancak ölçünce gördüm.
      if (AD_KALIBI.test(ad)) adEsleseni.push(kayit)
      else if (DORT_ALAN.filter(a => a.desen.test(asciiKatla(govde))).length >= 1) icerikEsleseni.push(kayit)
    } catch { /* okunamayan dosya kapıyı düşürmez */ }
  }
  const secilen = adEsleseni.length ? adEsleseni : icerikEsleseni
  return secilen.sort((a, b) => b.mt - a.mt)
}

/**
 * DIŞARIDAN kullanılan yüzey — `session-board.cjs`'in SessionStart(compact) kolu bunu çağırır.
 * Aynı çözümleme iki yerde iki kez yazılırsa bir gün ayrışır; bu depoda o sınıf bir gün
 * kaybettirdi (saf fonksiyon doğruydu, yazma noktası onu kullanmıyordu).
 */
function durumDosyasiBul(sid, transcriptPath) {
  const pd = projeDiziniBul(sid, transcriptPath)
  if (!pd) return null
  const liste = oturumunDosyalari(path.join(pd, 'memory'), sid)
  return liste.length ? liste[0] : null
}

/**
 * Dosyanın SON bloğu: son `##` başlığından sonuna kadar.
 *
 * Niçin son blok, tüm dosya değil: durum dosyaları gün boyunca büyüyor (bugün 57 satır) ve
 * hepsini bağlama basmak, kırpılmış bağlamı yeniden doldurmak olur. En taze blok, dönüşte
 * gereken tek şey. Başlık yoksa son 40 satır — biçimi tutmayan dosyada da bir şey vermek,
 * hiçbir şey vermemekten iyi.
 */
function sonBlok(yol, enFazlaSatir = 60) {
  let govde = ''
  try {
    govde = fs.readFileSync(yol, 'utf8')
  } catch {
    return '(durum dosyasi okunamadi)'
  }
  const satirlar = govde.split(/\r?\n/)
  let bas = -1
  for (let i = satirlar.length - 1; i >= 0; i--) {
    if (/^##\s/.test(satirlar[i])) { bas = i; break }
  }
  const dilim = bas >= 0 ? satirlar.slice(bas) : satirlar.slice(-40)
  return dilim.slice(0, enFazlaSatir).join('\n')
}

function main() {
const girdi = girdiOku()
const sid = girdi.session_id || girdi.sessionId || process.env.CLAUDE_SESSION_ID || ''
const tetik = girdi.trigger || 'manual'

if (process.env.VENTHUB_PRECOMPACT_KAPALI === '1') {
  process.stdout.write('[precompact] kapi ATLANDI (VENTHUB_PRECOMPACT_KAPALI=1).\n')
  process.exit(0)
}

const projeDizini = projeDiziniBul(sid, girdi.transcript_path || girdi.transcriptPath)
if (!projeDizini) {
  // Kapıyı fail-open bırakıyoruz AMA sessiz değil: sebebi bilinmeli.
  process.stdout.write(
    '[precompact] proje dizini COZULEMEDI (sid=' + (sid || 'YOK') + ') — durum tazeligi ' +
      'OLCULEMEDI. Compact bloklanmadi; durum dosyani ELLE guncelle.\n',
  )
  process.exit(0)
}

const memoryDir = path.join(projeDizini, 'memory')
const dosyalar = oturumunDosyalari(memoryDir, sid)
const uyarilar = []

// KOL 1 — durum dosyası hiç yok mu? Tek BLOKLAYAN kol.
if (dosyalar.length === 0) {
  process.stderr.write(
    '⛔ COMPACT DURDURULDU — bu oturumun HIC durum dosyasi yok (' + memoryDir + ' icinde ' +
      'originSessionId=' + (sid || 'YOK') + ' tasiyan dosya 0).\n' +
      'Compact baglami kirpar; yazilmayan sey KAYBOLUR. Once durum dosyani yaz:\n' +
      '  <serit>-lane-day-<tarih>.md, frontmatter metadata.originSessionId = ' + sid + '\n' +
      'Icinde DORT SABIT ALAN olsun: son girdi / acik kuyruk / verilen sozler / bekleyen kararlar.\n' +
      'Yazdiktan sonra /compact tekrar. Zorunluysa: VENTHUB_PRECOMPACT_KAPALI=1\n',
  )
  process.exit(2)
}

// KOL 2 — en taze dosya bayat mı? (uyarır, bloklamaz)
const enTaze = dosyalar[0]
const yasDk = Math.round((Date.now() - enTaze.mt) / 60000)
if (yasDk > BAYAT_ESIK_DK) {
  uyarilar.push(
    'BAYAT: en taze durum dosyan ' + yasDk + ' dakika onceki (esik ' + BAYAT_ESIK_DK +
      ' dk) — ' + enTaze.ad + '. Bu turda konusulanlar ORADA YOK.',
  )
}

// KOL 3 — dört sabit alan var mı? (uyarır, bloklamaz)
try {
  const govde = fs.readFileSync(enTaze.tam, 'utf8')
  const katlanmis = asciiKatla(govde)
  const eksik = DORT_ALAN.filter(a => !a.desen.test(katlanmis)).map(a => a.ad)
  if (eksik.length) {
    uyarilar.push('EKSIK ALAN (' + enTaze.ad + '): ' + eksik.join(', ') + ' — donuste bu sorular cevapsiz kalir.')
  }
} catch { /* gövde okunamadıysa alan denetimi atlanır, bayatlık kolu yine çalışır */ }

// KOL 4 — MEMORY.md boyut bekçisi. Kırpma SESSIZ olduğu için uyarı compact anında değerli:
// hafıza yazımı tam bu anda yoğunlaşıyor ve indeks satırı eklemek isteyen burada uyarılmalı.
try {
  const idx = path.join(memoryDir, 'MEMORY.md')
  const bayt = fs.statSync(idx).size
  if (bayt > MEMORY_ESIK_BAYT) {
    uyarilar.push(
      'MEMORY.md ' + bayt + ' bayt (esik ' + MEMORY_ESIK_BAYT + ', asim ' + (bayt - MEMORY_ESIK_BAYT) +
        ') — yeni satir eklemeden ONCE bir eskisini katla/kisalt. Indeks SESSIZCE kirpilir; olcu BAYT.',
    )
  }
} catch { /* indeks yoksa bu kol sessiz geçer */ }

if (uyarilar.length) {
  process.stdout.write(
    '[precompact] durum kapisi — ' + uyarilar.length + ' uyari (tetik: ' + tetik + ', compact BLOKLANMADI):\n' +
      uyarilar.map(u => '  ⚠ ' + u).join('\n') + '\n' +
      '  YAPILACAK: compact ONCESI ' + enTaze.ad + ' dosyasini guncelle.\n',
  )
} else {
  process.stdout.write(
    '[precompact] durum kapisi TEMIZ — ' + enTaze.ad + ' ' + yasDk + ' dk once guncellenmis, dort alan tam.\n',
  )
}
process.exit(0)
}

// `require` edildiğinde kapı KOŞMAMALI: session-board.cjs bu dosyayı modül olarak çağırıyor ve
// stdin okuyup process.exit çağıran bir modül, çağıranın oturumunu öldürürdü.
module.exports = {
  durumDosyasiBul, sonBlok, BAYAT_ESIK_DK, MEMORY_ESIK_BAYT, DORT_ALAN, AD_KALIBI,
  // Testin ölçütü KOPYALAMAMASI için dışa açık: kapının katlaması ile testin katlaması
  // ayrışırsa biri bayatlar ve yanlış alarm sessizce geri gelir.
  asciiKatla,
}
if (require.main === module) main()
