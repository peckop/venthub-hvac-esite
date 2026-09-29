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
 * ── ZAMAN BÜTÇESİ + YENİDEN DENEME (REC-441, ölçüldü 09-29) ──
 *
 * #1481'in merge'ünde sanal bellek %89'du; `git` çağrısı zaman aşımına düştü ve ana ağaç bayat kaldı.
 * Ayrıca asıl tuzak: Claude Code PostToolUse kancasını ~60 sn'de SESSİZCE öldürür; içerideki git çağrıları
 * tek başına 30–60 sn'lik zaman aşımı taşıyordu, yani yük altında kanca çıktı üretmeden ölebilirdi.
 * Bu yüzden iş bir ÇOCUK SÜREÇTE (`--is`) yapılır; ebeveyn her denemeye DENEME_MS süre verir, ölçüm hatası ya da
 * zaman aşımında en fazla DENEME_SAYISI kez tekrar eder ve toplam ~48 sn'yi geçmez. Hepsi başarısızsa bunu ve
 * elle komutu SÖYLER — sessiz kalmaz.
 */
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync, spawnSync } = require('node:child_process')

const MERGE = /\bgh\s+pr\s+merge\b/
const DENEME_SAYISI = 3
const sayi = (ad, varsayilan) => (Number.isFinite(Number(process.env[ad])) && process.env[ad] !== '' ? Number(process.env[ad]) : varsayilan)
const DENEME_MS = sayi('VH_ILERI_SAR_DENEME_MS', 15_000)
const BEKLE_MS = sayi('VH_ILERI_SAR_BEKLE_MS', 1_000)

const bekle = (ms) => ms > 0 && Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)

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
  // Yalnız TEST: ilk deneme belirtilen dosya yokken takılır (yeniden denemenin ayırt edici kanıtı).
  if (process.env.VH_ILERI_SAR_TEST_HEP_TAKIL) bekle(120_000)
  const uykuDosyasi = process.env.VH_ILERI_SAR_TEST_UYKU_DOSYA
  if (uykuDosyasi && !fs.existsSync(uykuDosyasi)) {
    fs.writeFileSync(uykuDosyasi, '1')
    bekle(120_000)
  }
  const tazelik = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'ana-agac-tazelik.cjs'))
  const cwd = girdi.cwd || process.cwd()
  let agac
  try {
    agac = tazelik.anaAgacYolu(cwd)
    execFileSync('git', ['-C', agac, 'fetch', '-q', 'origin', 'master'], { stdio: 'ignore', windowsHide: true, timeout: 30_000 })
  } catch (e) {
    const s = { durum: 'olcemedi', sebep: String((e && e.message) || e).slice(0, 120) }
    return { durum: s.durum, satir: satir(s) }
  }
  const s = tazelik.ileriSar(agac)
  return { durum: s.durum, satir: satir(s) }
}

function calistir(girdi) {
  return olcum(girdi).satir
}

/**
 * Ebeveyn: işi çocuk süreçte, zaman sınırlı ve yeniden denemeli koşturur. Toplam süre
 * DENEME_SAYISI × DENEME_MS + geri çekilme (varsayılan ~48 sn) — harness'in 60 sn'lik sessiz öldürmesinin altında.
 */
function denemeli(veri) {
  let girdi = {}
  try {
    girdi = JSON.parse(veri || '{}')
  } catch {
    girdi = {}
  }
  if (!mergeMi(girdi && girdi.tool_input && girdi.tool_input.command)) return null
  let sonNot = ''
  for (let d = 1; d <= DENEME_SAYISI; d++) {
    const r = spawnSync(process.execPath, [__filename, '--is'], { input: veri, encoding: 'utf8', timeout: DENEME_MS, windowsHide: true, env: process.env })
    let sonuc = null
    if (!r.error && r.status === 0) {
      try {
        sonuc = JSON.parse(r.stdout)
      } catch {
        sonuc = null
      }
    }
    if (sonuc && sonuc.durum !== 'olcemedi') return sonuc.satir ? sonuc.satir + (d > 1 ? ` (deneme ${d}/${DENEME_SAYISI})` : '') : null
    sonNot = sonuc ? String(sonuc.satir || '') : `deneme ${d} ${DENEME_MS} ms icinde bitmedi`
    if (d < DENEME_SAYISI) bekle(BEKLE_MS * d)
  }
  return (
    `⚠ANA AGAC: ileri sarma ${DENEME_SAYISI} denemede tamamlanamadi (zaman asimi/olcum hatasi; bellek ya da yuk?) — ` +
    `elle: node scripts/hijyen/ana-agac-tazelik.cjs --ileri-sar. Son: ${sonNot.slice(0, 160)}`
  )
}

if (require.main === module) {
  let veri = ''
  process.stdin.on('data', (d) => (veri += d))
  process.stdin.on('end', () => {
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
      s = denemeli(veri)
    } catch (e) {
      s = `⚠ANA AGAC: kanca hatasi (${String((e && e.message) || e).slice(0, 100)})`
    }
    if (s) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: s } }))
    process.exit(0)
  })
}

module.exports = { mergeMi, satir, calistir, olcum, denemeli }
