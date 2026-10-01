'use strict'
/**
 * MERGE SONRASI ANA AĞACI İLERİ SAR (karar 165 W4, Ops 2026-09-28) — PostToolUse · Bash.
 *
 * ── NİÇİN VAR ──
 *
 * Güvenli ileri sarma zaten var: `scripts/hijyen/ana-agac-tazelik.cjs` → `ileriSar` (yalnız
 * `--ff-only`; izlenen dosyada kaydedilmemiş değişiklik varsa DURUR, stash/reset yapmaz) ve
 * `merge-ritueli.cjs --merge` her merge'ün sonunda onu çağırır. Ama pencereler (ARAÇ dahil)
 * merge'ü çoğunlukla doğrudan `gh pr merge` ile yapıyor → ritüel atlanıyor → ana ağaç geride
 * kalıyor; kancalar, CLAUDE.md ve .mcp.json ana ağaçtan yüklendiği için bütün pencereler eski
 * kuralla açılıyor. Ölçüm 09-27/28: 24 saatte 20 elle ileri sarma; 09-28 sabahı ana ağaç 1 commit
 * geride açıldı.
 *
 * ── NE YAPAR ──
 *
 * Komut `gh pr merge` içeriyorsa: `git fetch origin master` → `ileriSar(anaAgac)`. Sonuç satırı
 * pencereye döner (ilerlendi / güncel / ENGELLİ + sebep). Başka komutta hiçbir şey yapmaz.
 * Merge başarısız olduysa origin/master değişmemiştir → `ileriSar` "guncel" der; ayrıca başarı
 * ayrıştırılmaz. Kanca hiçbir durumda komutu engellemez (çıkış 0); ölçemezse bunu SÖYLER.
 *
 * ── ZAMAN BÜTÇESİ + YENİDEN DENEME (REC-441, ölçüldü 09-29; REC-459 ile İLERLEME KANITINA çevrildi 09-30) ──
 *
 * #1481'in merge'ünde sanal bellek %89'du; `git` çağrısı zaman aşımına düştü ve ana ağaç bayat kaldı.
 * Ayrıca asıl tuzak: Claude Code PostToolUse kancasını ~60 sn'de SESSİZCE öldürür; içerideki git çağrıları
 * tek başına 30–60 sn'lik zaman aşımı taşıyordu, yani yük altında kanca çıktı üretmeden ölebilirdi.
 * Bu yüzden iş bir ÇOCUK SÜREÇTE (`--is`) yapılır.
 *
 * REC-459 KÖK SEBEBİ (ölçüldü 09-30, çekirdeğin 2 katı CPU yükünde 3 koşumun 3'ünde düştü): önceki sürüm her denemeye
 * SABİT süre (15 sn) verip çocuğu yarı yolda öldürüyor ve baştan başlatıyordu. Yük altında iş YAVAŞ ama İLERLİYOR;
 * öldürülünce ilerleme çöpe gidiyor, üç deneme de aynı yerde tükeniyor. Sabit süre "yavaş ama canlı" ile "takılmış"ı
 * ayırt edemez. Şimdi çocuk her adımda VE her git çağrısından önce stderr'e bir işaret yazar (`ADIM <ad>`); ebeveyn çocuğu YALNIZ
 * BOSTA_MS boyunca işaret gelmezse (takılma) ya da TÜM denemelerin toplamı TAVAN_MS'yi aşarsa (harness sınırı) öldürür.
 * Takılmada en fazla DENEME_SAYISI kez yeniden dener. Hepsi başarısızsa bunu ve elle komutu SÖYLER — sessiz kalmaz.
 */
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync, spawn } = require('node:child_process')

const MERGE = /\bgh\s+pr\s+merge\b/
const DENEME_SAYISI = 3
const sayi = (ad, varsayilan) => (Number.isFinite(Number(process.env[ad])) && process.env[ad] !== '' ? Number(process.env[ad]) : varsayilan)
const BOSTA_MS = sayi('VH_ILERI_SAR_BOSTA_MS', 20_000) // ilerleme işareti gelmeyen en uzun süre (TEK git çağrısı; yük altında saniyeler sürer)
const TAVAN_MS = sayi('VH_ILERI_SAR_TAVAN_MS', 45_000) // TÜM denemeler + geri çekilme; harness ~60 sn'de sessizce öldürür
const BEKLE_MS = sayi('VH_ILERI_SAR_BEKLE_MS', 1_000)

const bekle = (ms) => ms > 0 && Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
const uyu = (ms) => new Promise((coz) => setTimeout(coz, ms))

/** Çocuktan ebeveyne ilerleme işareti (stderr, SENKRON yazım: olay döngüsü bloklu olsa da satır çıkar). */
function ilerle(ad) {
  try {
    fs.writeSync(2, `ADIM ${ad}\n`)
  } catch {
    /* işaret yazılamadıysa ebeveyn takılma sayar: güvenli yön */
  }
}

/** Komut merge mi? Test bunu çağırır. */
function mergeMi(komut) {
  return typeof komut === 'string' && MERGE.test(komut)
}

/** ileriSar sonucunu tek satıra çevirir. */
function satir(s) {
  if (!s) return null
  if (s.durum === 'ilerlendi') return `ANA AGAC: merge sonrasi ${s.geride} commit ileri sarildi.`
  if (s.durum === 'guncel') return null
  if (s.durum === 'engelli') return `⚠ANA AGAC ${s.geride} COMMIT GERIDE, ileri sarilamadi: ${s.sebep}. Stash/reset YAPMA; sahibini bul.`
  return `⚠ANA AGAC: olculemedi (${s.sebep || s.durum})`
}

/** Ölçüm + ileri sarma; {durum, satir}. Çocuk süreçte (`--is`) koşar; `calistir` eski yüzeyi korur. */
function olcum(girdi) {
  const komut = girdi && girdi.tool_input && girdi.tool_input.command
  if (!mergeMi(komut)) return { durum: 'yok', satir: null }
  ilerle('basla')
  // Yalnız TEST: takılma (işaret yazmadan uyku) — yeniden denemenin ve ilerleme izlemenin ayırt edici kanıtı.
  if (process.env.VH_ILERI_SAR_TEST_HEP_TAKIL) bekle(120_000)
  const uykuDosyasi = process.env.VH_ILERI_SAR_TEST_UYKU_DOSYA
  if (uykuDosyasi && !fs.existsSync(uykuDosyasi)) {
    fs.writeFileSync(uykuDosyasi, '1')
    bekle(120_000)
  }
  // Yalnız TEST: YAVAŞ AMA İLERLEYEN çocuk (yük altındaki gerçek duruma benzer): her 500 ms'de işaret yazar.
  const yavasMs = Number(process.env.VH_ILERI_SAR_TEST_YAVAS_MS)
  if (yavasMs > 0) {
    for (let i = 0; i < Math.ceil(yavasMs / 500); i++) {
      bekle(500)
      ilerle('yavas')
    }
  }
  // Her git çağrısından ÖNCE işaret (REC-459, yük altı ölçümü: `basla` ile `fetch` arasında anaAgacYolu'nun git çağrıları
  // seyrek işaret yüzünden takılma sayılıyordu). ana-agac-tazelik.cjs `execFileSync`i modül yüklenirken destructure eder:
  // yama ONDAN ÖNCE yapılmalı. Yalnız bu (çocuk) süreçte; yama saran işlev işlevselliği değiştirmez.
  const cp = require('node:child_process')
  if (!cp.execFileSync.__isaretli) {
    const asil = cp.execFileSync
    const sarili = (...a) => {
      ilerle('git')
      return asil(...a)
    }
    sarili.__isaretli = true
    cp.execFileSync = sarili
  }
  const tazelik = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'ana-agac-tazelik.cjs'))
  const cwd = girdi.cwd || process.cwd()
  let agac
  try {
    agac = tazelik.anaAgacYolu(cwd)
    ilerle('fetch')
    execFileSync('git', ['-C', agac, 'fetch', '-q', 'origin', 'master'], { stdio: 'ignore', windowsHide: true, timeout: 30_000 })
  } catch (e) {
    const s = { durum: 'olcemedi', sebep: String((e && e.message) || e).slice(0, 120) }
    return { durum: s.durum, satir: satir(s) }
  }
  ilerle('ileri-sar')
  const s = tazelik.ileriSar(agac)
  return { durum: s.durum, satir: satir(s) }
}

function calistir(girdi) {
  return olcum(girdi).satir
}

/**
 * Tek deneme: çocuğu başlatır ve İLERLEME işaretine göre izler (REC-459). Çocuk BOSTA_MS boyunca işaret yazmazsa
 * ('bosta' = takıldı) ya da bu denemenin payı `kalanMs` dolarsa ('tavan') öldürülür; yavaş ama işaret yazan çocuk beklenir.
 * @returns {Promise<{sonuc: object|null, sebep: 'bosta'|'tavan'|'hata'|null}>}
 */
function cocukKos(veri, kalanMs) {
  return new Promise((coz) => {
    let bitti = false
    let sebep = null
    let cikti = ''
    let son = Date.now()
    const t0 = son
    const bitir = (sonuc) => {
      if (bitti) return
      bitti = true
      clearInterval(bekci)
      coz({ sonuc, sebep })
    }
    let c
    try {
      c = spawn(process.execPath, [__filename, '--is'], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, env: process.env })
    } catch {
      sebep = 'hata'
      coz({ sonuc: null, sebep })
      return
    }
    const bekci = setInterval(() => {
      const simdi = Date.now()
      if (!sebep && simdi - son > BOSTA_MS) sebep = 'bosta'
      else if (!sebep && simdi - t0 > kalanMs) sebep = 'tavan'
      if (sebep && !bitti) {
        try {
          c.kill()
        } catch {
          /* çocuk zaten bitmiş olabilir */
        }
        // Öldürülen sürecin alt süreçleri (git) boruyu açık tutabilir: 'close' gelmezse de kanca çıktısız kalmasın.
        setTimeout(() => bitir(null), 2_000).unref()
      }
    }, 100)
    c.stdout.on('data', (d) => (cikti += d))
    c.stderr.on('data', () => {
      son = Date.now() // her ilerleme işareti bekleme saatini sıfırlar
    })
    c.stdin.on('error', () => {}) // çocuk erken ölürse EPIPE: yut, yukarıdaki izleyici karar verir
    c.on('error', () => {
      sebep = sebep || 'hata'
      bitir(null)
    })
    c.on('exit', () => {
      if (sebep) bitir(null) // öldürüldü: eksik çıktıyı sonuç sayma
    })
    c.on('close', (kod) => {
      if (sebep) return bitir(null)
      let sonuc = null
      if (kod === 0) {
        try {
          sonuc = JSON.parse(cikti)
        } catch {
          sonuc = null
        }
      }
      bitir(sonuc)
    })
    c.stdin.end(veri)
  })
}

/**
 * Ebeveyn: işi çocuk süreçte, İLERLEME izleyerek ve takılmada yeniden denemeli koşturur. Tüm denemeler + geri çekilme
 * TAVAN_MS'yi (varsayılan 45 sn) geçmez — harness'in 60 sn'lik sessiz öldürmesinin altında.
 */
async function denemeli(veri) {
  let girdi = {}
  try {
    girdi = JSON.parse(veri || '{}')
  } catch {
    girdi = {}
  }
  if (!mergeMi(girdi && girdi.tool_input && girdi.tool_input.command)) return null
  const t0 = Date.now()
  const kalan = () => TAVAN_MS - (Date.now() - t0)
  let sonNot = ''
  let yapilan = 0
  for (let d = 1; d <= DENEME_SAYISI && kalan() > 0; d++) {
    yapilan = d
    const { sonuc, sebep } = await cocukKos(veri, kalan())
    if (sonuc && sonuc.durum !== 'olcemedi') return sonuc.satir ? sonuc.satir + (d > 1 ? ` (deneme ${d}/${DENEME_SAYISI})` : '') : null
    if (sonuc) sonNot = String(sonuc.satir || '')
    else if (sebep === 'tavan') sonNot = `toplam ${TAVAN_MS} ms doldu (cocuk yavas ama ilerliyordu)`
    else if (sebep === 'bosta') sonNot = `deneme ${d}: ${BOSTA_MS} ms ilerleme isareti gelmedi (takildi)`
    else sonNot = `deneme ${d}: cocuk sonuc vermedi`
    if (sebep === 'tavan') break // toplam pay bitti; yeniden denemek harness sınırını aşar
    if (d < DENEME_SAYISI) await uyu(Math.max(0, Math.min(BEKLE_MS * d, kalan())))
  }
  return (
    `⚠ANA AGAC: ileri sarma ${yapilan} denemede tamamlanamadi (takilma/olcum hatasi/toplam sure; bellek ya da yuk?) — ` +
    `elle: node scripts/hijyen/ana-agac-tazelik.cjs --ileri-sar. Son: ${sonNot.slice(0, 160)}`
  )
}

if (require.main === module) {
  let veri = ''
  process.stdin.on('data', (d) => (veri += d))
  process.stdin.on('end', async () => {
    if (process.argv.includes('--is')) {
      let o
      try {
        o = olcum(JSON.parse(veri || '{}'))
      } catch (e) {
        o = { durum: 'olcemedi', satir: `⚠ANA AGAC: kanca hatasi (${String((e && e.message) || e).slice(0, 100)})` }
      }
      process.stdout.write(JSON.stringify(o))
      process.exit(0)
    }
    let s = null
    try {
      s = await denemeli(veri)
    } catch (e) {
      s = `⚠ANA AGAC: kanca hatasi (${String((e && e.message) || e).slice(0, 100)})`
    }
    if (s) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: s } }))
    process.exit(0)
  })
}

module.exports = { mergeMi, satir, calistir, olcum, denemeli }
