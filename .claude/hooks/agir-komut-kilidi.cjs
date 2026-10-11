#!/usr/bin/env node
'use strict'

/**
 * AĞIR KOMUT KİLİDİ — aynı anda en çok N pencere ağır komut koşar (ARC-81, Ops emri 2026-10-09 madde 3b).
 *
 * ── NİÇİN VAR ──
 *
 * 2026-10-09 19:57'de uygulama bellek bittiği için kapandı: 32,6 GB'ın 123 MB'ı boştu, dokuz pencere
 * 14,9 GB tutuyordu, 399 süreç vardı ve 19:58-20:02 arasında beş yeniden başlama oldu. Her pencere
 * kendi başına makul davranıyordu (tam test, type-check, install); sorun AYNI ANDA koşmalarıydı ve
 * pencerelerden hiçbiri diğerinin ne koştuğunu bilmiyordu. `.claude/rules/filo-ortak.md` "ağır komut
 * başlatma" der ama kural tek pencereyi bağlar; makineyi bağlayan bir şey yoktu.
 *
 * ── NASIL ──
 *
 * PreToolUse(Bash): komut ağır sayılırsa bir "yuva" alınır. Yuva = `<pano>/agir-kilit/yuva-<i>`
 * dizini; `mkdir` atomiktir, iki pencere aynı anda denerse biri EEXIST alır (dosya kilidi, sunucu,
 * bağımlılık YOK). Yuva yoksa komut REDDEDİLİR ve sebebi (kim, ne, kaç dk önce) söylenir.
 * PostToolUse(Bash) `--birak` ile yuvayı geri verir.
 *
 * ⭐NİÇİN TTL: PostToolUse her zaman gelmez (pencere kapanır, kullanıcı iptal eder, arka plan komutu
 * hemen döner). Yuva `TTL_DK` dakikadan eskiyse BAYAT sayılır ve bir sonraki deneyen onu siler.
 * Arka plan komutu (`run_in_background`) yuvayı PostToolUse'ta BIRAKMAZ: komut hâlâ koşuyor.
 *
 * ⭐ARKA PLAN SARMALAYICI (ARC-87, OPS kararı 2026-10-11): arka plan ağır komut yuvayı alınca PreToolUse
 * komutu `( KOMUT ); rc=$?; node <bu betik> --birak --yuva <i> --belirtec <t>; exit $rc` biçiminde
 * SARAR (`updatedInput`); komut GERÇEKTEN bitince yuva bırakılır, çıkış kodu aynen korunur. Belirteç
 * (`--belirtec`) şart: TTL ile yuvayı başkası aldıysa geç gelen bırakma onu DÜŞÜRMEZ. TTL güvenlik
 * ağı olarak kalır (pencere kapanır, süreç öldürülür, sarmalayıcı hiç çalışmaz). Yalnız ARKA PLANDA
 * koşan ağır komut sarılır; ön plan akışı değişmez. KARAR (`permissionDecision`) DÖNMEZ: normal izin
 * akışı sürer; `updatedInput` kararsız uygulanmıyorsa sarmalayıcı etkisiz kalır ve TTL işler
 * (çökme yok, canlı kabulle ölçülür). Kapatmak: `VENTHUB_AGIR_KILIT_SARMA=0`.
 *
 * ⭐AÇIK KALIR (fail-open): kilit dizini yazılamıyor, girdi bozuk, beklenmeyen hata → komut geçer.
 * Kilit bir emniyet kemeridir; bozulduğunda işi durduran bir şeye dönüşmemeli.
 *
 * ⭐AĞIR SAYILAN: type-check/tsc, build, tam test (dosya argümansız vitest/pnpm test), tam lint,
 * knip, install/add/ci, docker. `pnpm test:ilgili` ve dosya argümanlı vitest/eslint HAFİFTİR
 * (kural: yerelde yalnız `test:ilgili`). Sınıflama komut ZİNCİRİNİN her parçasına ayrı bakar
 * (`cd x && pnpm type-check`); `grep tsc` gibi komut konumunda olmayan geçişler ağır sayılmaz.
 *
 * ⭐EŞİKLER ÖLÇÜMDEN: N=1 (varsayılan). Gerekçe: boş bellek 2 GB civarında seyrediyor; tek type-check
 * ~730 MB (bellek-yoklama.cjs, tsc --extendedDiagnostics), tam vitest ve next build bunun katıdır.
 * `VENTHUB_AGIR_KILIT_N`, `VENTHUB_AGIR_KILIT_TTL_DK`, `VENTHUB_AGIR_KILIT_DIR` ile ayarlanır.
 *
 * Kayıt: `.claude/settings.json` PreToolUse(Bash) ve PostToolUse(Bash) — OPS kapısı; metin PR gövdesinde.
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const SARMA_ACIK = process.env.VENTHUB_AGIR_KILIT_SARMA !== '0'
const N = Math.max(1, Number(process.env.VENTHUB_AGIR_KILIT_N || 1))
const TTL_DK = Math.max(1, Number(process.env.VENTHUB_AGIR_KILIT_TTL_DK || 20))
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function kilitDizini() {
  if (process.env.VENTHUB_AGIR_KILIT_DIR) return process.env.VENTHUB_AGIR_KILIT_DIR
  const pano = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'
  return path.join(pano, 'agir-kilit')
}

// ── Sınıflama ────────────────────────────────────────────────────────────────

const ZINCIR = /&&|\|\||;|\||\r?\n/
const ORTAM_ATAMASI = /^(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)+/
const PAKET_YONETICILERI = ['pnpm', 'npm', 'yarn']

/** Argümanlardan biri dosya/dizin yolu gibi mi? (vitest/eslint dosya verilince hafiftir) */
function dosyaArgumani(arglar) {
  return arglar.some((a) => !a.startsWith('-') && (/[\\/]/.test(a) || /\.(?:test|spec)\./.test(a) || /\.[cm]?[jt]sx?$/.test(a)))
}

/** Tek bir komut parçasını sınıflar: ağırsa kısa ad, değilse null. */
function parcaSinifla(parca) {
  const t = parca.split(/\s+/).filter(Boolean)
  if (!t.length) return null
  let k = t[0].replace(/\.(?:cmd|exe)$/i, '')
  let a = t.slice(1)
  if (k === 'npx' || k === 'bunx') {
    k = (a[0] || '').replace(/\.(?:cmd|exe)$/i, '')
    a = a.slice(1)
  } else if (PAKET_YONETICILERI.includes(k)) {
    if (a[0] === 'exec' || a[0] === 'dlx') {
      k = (a[1] || '').replace(/\.(?:cmd|exe)$/i, '')
      a = a.slice(2)
    } else {
      let s = a[0] || ''
      if (s === 'run') {
        s = a[1] || ''
        a = a.slice(2)
      } else {
        a = a.slice(1)
      }
      if (['install', 'i', 'add', 'ci', 'update', 'up'].includes(s)) return 'install'
      if (s === 'type-check' || s === 'typecheck') return 'type-check'
      if (s === 'build') return 'build'
      if (s === 'knip') return 'knip'
      if (s === 'lint') return dosyaArgumani(a) ? null : 'lint'
      if (['test', 'vitest', 'test:ci', 'test:run'].includes(s)) return dosyaArgumani(a) ? null : 'tam test'
      return null
    }
  }
  if (k === 'tsc') return 'type-check'
  if (k === 'next' && a[0] === 'build') return 'build'
  if (k === 'vitest') return dosyaArgumani(a) ? null : 'tam test'
  if (k === 'docker') return 'docker'
  return null
}

/** Komut zincirindeki ilk ağır parçanın kısa adı; hiçbiri ağır değilse null. */
function agirMi(komut) {
  const parcalar = String(komut || '')
    .split(ZINCIR)
    .map((p) => p.trim().replace(/^\(+/, '').replace(ORTAM_ATAMASI, '').trim())
    .filter(Boolean)
  for (const p of parcalar) {
    const ad = parcaSinifla(p)
    if (ad) return ad
  }
  return null
}

// ── Yuva ────────────────────────────────────────────────────────────────────

function sahipOku(yuvaYolu) {
  try {
    return JSON.parse(fs.readFileSync(path.join(yuvaYolu, 'sahip.json'), 'utf8'))
  } catch {
    return null
  }
}

/** Yuva bayat mı: sahip dosyasındaki damga (yoksa dizin mtime'ı) TTL'den eski. */
function bayatMi(yuvaYolu, simdi) {
  const s = sahipOku(yuvaYolu)
  let ts = s && typeof s.ts === 'number' ? s.ts : NaN
  if (!Number.isFinite(ts)) {
    try {
      ts = fs.statSync(yuvaYolu).mtimeMs
    } catch {
      return true
    }
  }
  return simdi - ts > TTL_DK * 60000
}

function yuvalar(dizin, adet) {
  return Array.from({ length: adet }, (_, i) => path.join(dizin, 'yuva-' + i))
}

/**
 * Yuva almayı dener.
 * @returns {{ok:true, yuva:number, belirtec?:string}|{ok:false, sahipler:Array<{sid:string,lane:string,komut:string,ad:string,ts:number}>}}
 *   `belirtec` yalnız ARKA PLAN alımında döner: sarmalayıcının bırakırken göstereceği tek kullanımlık kimlik.
 */
function kilitAl({ sid, komut, ad, lane, simdi = Date.now(), dizin = kilitDizini(), adet = N, arkaPlan = false }) {
  fs.mkdirSync(dizin, { recursive: true })
  const belirtec = arkaPlan ? crypto.randomBytes(6).toString('hex') : undefined
  const kayit = {
    sid,
    lane: lane || '',
    ad,
    komut: String(komut || '').slice(0, 120),
    ts: simdi,
    arkaPlan: Boolean(arkaPlan),
    belirtecler: belirtec ? [belirtec] : [],
  }
  const sahipler = []
  const hepsi = yuvalar(dizin, adet)
  for (let i = 0; i < hepsi.length; i += 1) {
    const yol = hepsi[i]
    for (let deneme = 0; deneme < 2; deneme += 1) {
      try {
        fs.mkdirSync(yol)
        fs.writeFileSync(path.join(yol, 'sahip.json'), JSON.stringify(kayit))
        return belirtec ? { ok: true, yuva: i, belirtec } : { ok: true, yuva: i }
      } catch (e) {
        if (!e || e.code !== 'EEXIST') throw e
      }
      const s = sahipOku(yol)
      if (s && s.sid === sid) {
        // Aynı pencere: yeniden giriş (arka plan komutunun üstüne ikinci ağır komut) yuvayı yeniler.
        // ⭐arkaPlan İŞARETİ ve BELİRTEÇLER KORUNUR (OPS 10-10): arka plandaki komut hâlâ koşuyorken
        // öndeki ikinci ağır komutun PostToolUse'u yuvayı düşürmemeli; yuvayı arka plan komutunun
        // kendi sarmalayıcısı (belirteçle) ya da TTL düşürür.
        const onceki = Array.isArray(s.belirtecler) ? s.belirtecler : []
        fs.writeFileSync(
          path.join(yol, 'sahip.json'),
          JSON.stringify({ ...kayit, arkaPlan: Boolean(s.arkaPlan) || kayit.arkaPlan, belirtecler: belirtec ? [...onceki, belirtec] : onceki }),
        )
        return belirtec ? { ok: true, yuva: i, belirtec } : { ok: true, yuva: i }
      }
      if (bayatMi(yol, simdi)) {
        fs.rmSync(yol, { recursive: true, force: true })
        continue
      }
      if (s) sahipler.push(s)
      break
    }
  }
  return { ok: false, sahipler }
}

/**
 * Pencerenin tuttuğu yuvayı geri verir; kaç yuva bırakıldığını döner.
 * Arka plan komutunun yuvası (`arkaPlan: true`) bırakılmaz: komut hâlâ koşuyor, yuva TTL'le düşer.
 */
function kilitBirak({ sid, dizin = kilitDizini(), adet = N }) {
  let n = 0
  for (const yol of yuvalar(dizin, adet)) {
    const s = sahipOku(yol)
    if (s && s.sid === sid && !s.arkaPlan) {
      fs.rmSync(yol, { recursive: true, force: true })
      n += 1
    }
  }
  return n
}

/**
 * Arka plan komutunun SARMALAYICISI bırakır (ARC-87): yalnız kendi belirteci yuvadaysa.
 * Belirteç yuvada yoksa (TTL ile başkası aldı, yuva bayat silindi, kanca açılmadan önce) HİÇBİR ŞEY düşmez.
 * @returns {boolean} yuva fiilen verildiyse true (başka belirteç kaldıysa yuva tutulur, false)
 */
function belirtecBirak({ yuva, belirtec, dizin = kilitDizini() }) {
  if (!Number.isInteger(yuva) || yuva < 0 || !belirtec) return false
  const yol = path.join(dizin, 'yuva-' + yuva)
  const s = sahipOku(yol)
  const hepsi = s && Array.isArray(s.belirtecler) ? s.belirtecler : []
  if (!hepsi.includes(belirtec)) return false
  const kalan = hepsi.filter((t) => t !== belirtec)
  if (kalan.length) {
    fs.writeFileSync(path.join(yol, 'sahip.json'), JSON.stringify({ ...s, belirtecler: kalan }))
    return false
  }
  fs.rmSync(yol, { recursive: true, force: true })
  return true
}

/** bash çift tırnak içi için kaçış (yol ve kimlikler sabit karakterlerdir; yine de savunmacı). */
function tirnak(s) {
  return '"' + String(s).replace(/(["\\$`])/g, '\\$1') + '"'
}

/**
 * Arka plan komutunu sarar: komut alt kabukta (satır sonu + `)` yorum satırını yutmasın diye ayrı
 * satırlarda) koşar, çıkış kodu saklanır, sarmalayıcı yuvayı bırakır, çıkış kodu AYNEN döner.
 * Bırakma çıktısı bastırılır (komutun çıktısı değişmez); node yoksa ya da bırakma düşerse TTL işler.
 */
function sarmala(komut, { betik, dizin, yuva, belirtec }) {
  const birak =
    'node ' + tirnak(String(betik).split(path.sep).join('/')) + ' --birak --yuva ' + Number(yuva) + ' --belirtec ' + belirtec + ' --dizin ' + tirnak(String(dizin).split(path.sep).join('/'))
  return '(\n' + String(komut) + '\n)\n__agir_rc=$?\n' + birak + ' >/dev/null 2>&1\nexit $__agir_rc'
}

/** Doluluk durumu (istem satırı için): bayatlar hariç, sahipleriyle. */
function durum({ simdi = Date.now(), dizin = kilitDizini(), adet = N } = {}) {
  const dolu = []
  for (const yol of yuvalar(dizin, adet)) {
    if (!fs.existsSync(yol) || bayatMi(yol, simdi)) continue
    const s = sahipOku(yol)
    dolu.push(s || { sid: '', lane: '', ad: '?', komut: '', ts: simdi })
  }
  return { adet, dolu }
}

/**
 * İstem satırı. EŞİKLİ: yuva boşsa SUSAR. Doluysa kim tutuyor ve kaç dk önce başladığı söylenir;
 * kendi penceren tutuyorsa "sende" der (başkasını bekleyen sen değilsin).
 */
function satir(sid, simdi = Date.now(), secenek = {}) {
  const d = durum({ simdi, ...secenek })
  if (!d.dolu.length) return null
  const parca = d.dolu.map((s) => {
    const dk = Math.max(0, Math.round((simdi - s.ts) / 60000))
    const kim = s.sid && s.sid === sid ? 'sende' : s.lane || String(s.sid || '?').slice(0, 8)
    return kim + ' ' + s.ad + ' ' + dk + ' dk'
  })
  return '⚠KILIT: agir komut ' + d.dolu.length + '/' + d.adet + ' dolu (' + parca.join(', ') + ') — ikinci agir komut reddedilir'
}

// ── Kanca girişi ─────────────────────────────────────────────────────────────

function sebep(ad, sahipler, simdi) {
  const kim = sahipler.length
    ? sahipler
        .map((s) => (s.lane || String(s.sid || '?').slice(0, 8)) + ' "' + s.ad + '" ' + Math.max(0, Math.round((simdi - s.ts) / 60000)) + ' dk once basladi')
        .join('; ')
    : 'baska bir pencere'
  return (
    'AGIR KOMUT KILIDI (ARC-81): "' +
    ad +
    '" simdi baslatilamaz, makinede ' +
    kim +
    '. Dokuz pencere ayni anda agir komut kosunca bellek biter (2026-10-09 19:57). ' +
    'Bu komutu kosma; baska ise gec, birkac dk sonra BIR kez daha dene, dongu kurma. ' +
    'Yerelde yalniz pnpm test:ilgili kosulur; tam test/tsc/build CI isidir.'
  )
}

function girdiOku() {
  try {
    const ham = fs.readFileSync(0, 'utf8')
    return ham.trim() ? JSON.parse(ham) : {}
  } catch {
    return {}
  }
}

function argDegeri(ad) {
  const i = process.argv.indexOf(ad)
  return i >= 0 ? process.argv[i + 1] : undefined
}

function calistir() {
  // ⭐Sarmalayıcının bırakması (ARC-87): stdin OKUNMAZ. Arka plan kabuğunda stdin açık kalabilir;
  // okuma takılır ve yuva TTL'e kalırdı. Yuva ve belirteç komut satırından gelir.
  if (process.argv.includes('--birak') && process.argv.includes('--yuva')) {
    belirtecBirak({
      yuva: Number(argDegeri('--yuva')),
      belirtec: argDegeri('--belirtec'),
      dizin: argDegeri('--dizin') || kilitDizini(),
    })
    return
  }
  const girdi = girdiOku()
  // BAŞARISIZ ağır komut (tsc çıkış 2, kırmızı test) PostToolUse üretmez; olay PostToolUseFailure'dır.
  // Aynı kayıt (`--birak`) iki olayda da çalışır; olay adı girdiden de okunur (OPS 10-10).
  const birak = process.argv.includes('--birak') || girdi.hook_event_name === 'PostToolUseFailure'
  if (girdi.tool_name && girdi.tool_name !== 'Bash') return
  const komut = girdi.tool_input && girdi.tool_input.command
  const sid = UUID.test(String(girdi.session_id || '')) ? String(girdi.session_id) : String(process.env.CLAUDE_SESSION_ID || '')
  if (!sid) return
  const simdi = Date.now()
  if (birak) {
    // ⭐YALNIZ AĞIR KOMUTUN olayı yuvayı bırakır (OPS 10-10): kilitBirak sid'e bakar, komuta bakmaz;
    // aynı pencerenin sonraki hafif Bash çağrısı (git status) arka plandaki tsc'nin yuvasını düşürürdü.
    if (!agirMi(komut)) return
    // Arka plan komutu hemen döner ama koşmaya devam eder: yuvası `arkaPlan` işaretiyle alındı,
    // kilitBirak onu bırakmaz, TTL düşürür (tek mekanizma; ayrıca run_in_background bakmak gereksizdi).
    kilitBirak({ sid })
    return
  }
  const ad = agirMi(komut)
  if (!ad) return
  const arkaPlan = Boolean(girdi.tool_input && girdi.tool_input.run_in_background)
  const r = kilitAl({ sid, komut, ad, lane: process.env.CC_LANE || '', simdi, arkaPlan })
  if (r.ok) {
    // ⭐Yalnız ARKA PLAN alımı sarılır (belirteç yalnız onda üretilir); karar (`permissionDecision`)
    // DÖNMEZ: izin akışı değişmez. `updatedInput` girdi nesnesinin TAMAMINI değiştirir: diğer alanlar korunur.
    if (r.belirtec && SARMA_ACIK && !/--birak\s+--yuva/.test(String(komut))) {
      const yeni = sarmala(komut, { betik: __filename, dizin: kilitDizini(), yuva: r.yuva, belirtec: r.belirtec })
      process.stdout.write(
        JSON.stringify({
          hookSpecificOutput: { hookEventName: 'PreToolUse', updatedInput: { ...girdi.tool_input, command: yeni } },
        }) + '\n',
      )
    }
    return
  }
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: sebep(ad, r.sahipler, simdi),
      },
    }) + '\n',
  )
}

if (require.main === module) {
  try {
    calistir()
  } catch {
    /* açık kalır: kilit bozulduysa komut geçer */
  }
  process.exit(0)
}

module.exports = { agirMi, parcaSinifla, kilitAl, kilitBirak, belirtecBirak, sarmala, durum, satir, bayatMi, kilitDizini, N, TTL_DK }
