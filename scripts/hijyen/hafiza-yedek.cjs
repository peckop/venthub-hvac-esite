#!/usr/bin/env node
'use strict'
/**
 * HAFIZA YEDEĞİ — ARC-92 (OPS-104 K-047). Cetvel: docs/standards/hafiza-kancalari-standard.md §9.
 *
 * ── NİÇİN VAR ──
 *
 * Hafıza deposu (peckop/venthub-ops-hafiza, ~/.claude/projects/c--Users-alize-venthub-hvac/memory) yalnız
 * OTURUM KAPANIŞINDA commit/push alıyordu (~/.claude/hafiza-commit.sh). Pencere compact'ta ya da uzun
 * oturumda kapanmadan çökerse o oturumun hafıza yazıları yedeksiz kalırdı. Bu modül üç noktadan yedek alır:
 *   - PreCompact: compact'tan hemen önce (hafızaya yazılanlar compact'ta eriyen bağlamdan kurtarılır);
 *   - SessionStart ve UserPromptSubmit: son commit eşikten (3600 sn) eskiyse VE bekleyen değişiklik varsa
 *     arka planda yedek başlatılır, satır uyarır. ZAMANLAYICI YOK (karar 53): tetik kullanıcının mesajıdır.
 *   - Oturum kapanışı: eski betiğin yerine `--yedekle --sebep kapanis` (ayar kaydı OPS'ta).
 *
 * ── DAVRANIŞ (eski betikle AYNI, gevşetilmedi) ──
 *
 * `git add -- '*.md' 'MEMORY.md.oncesi-*'`; değişiklik yoksa sessiz çık; STAGED farkta tam anahtar kalıbı varsa
 * commit ATMAZ, `.hafiza-commit-uyari.log`'a yazar ve `git reset -q` ile indeksi temizler; yoksa commit +
 * best-effort `git push origin master` (push düşerse sessiz).
 *
 * ── YAŞ ÖLÇÜSÜ ──
 *
 * Yaş = son COMMIT'in saniye cinsinden yaşı (`git log -1 --format=%ct`). Bekleyen değişiklik yokken yaş
 * büyüse de risk yoktur (yedeklenecek bir şey yok), bu yüzden uyarı ve arka plan yedeği yalnız
 * `bekleyen değişiklik VAR ve yaş > 3600 sn` iken çalışır. Arka plan denemeleri 600 sn'de birden sık olmaz
 * (`.hafiza-yedek-deneme` işaretinin mtime'ı; *.md olmadığı için commit'e girmez).
 *
 * ⛔SESSİZ ve FAIL-OPEN: hata → çıkış 0. ⛔Daemon/zamanlayıcı başlatmaz.
 */
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')
const { kopukBaslat } = require('../board/kopuk-baslat.cjs')

const ESIK_SN = 3600
const DENEME_ARALIGI_SN = 600
const ISARET = '.hafiza-yedek-deneme'
const UYARI_LOGU = '.hafiza-commit-uyari.log'
const SON_KAYIT = '.hafiza-yedek-son'
const PATHSPEC = ['*.md', 'MEMORY.md.oncesi-*']

// Tam değer kalıpları (kırpılmış "..." parçaları eşleşmez). Eski betikle AYNI liste; gevşetilmez.
const SIR_KALIBI =
  /(sk-ant-[A-Za-z0-9_-]{60,}|ghp_[A-Za-z0-9]{36}|gho_[A-Za-z0-9]{36}|lin_api_[A-Za-z0-9]{40}|sbp_[a-f0-9]{40}|eyJ[A-Za-z0-9_-]{80,}\.[A-Za-z0-9_-]{20,}|postgres(ql)?:\/\/[^ ]+:[^ @]+@)/

function hafizaDizini() {
  return process.env.HAFIZA_DIZINI || path.join(os.homedir(), '.claude', 'projects', 'c--Users-alize-venthub-hvac', 'memory')
}

function git(dir, args, zamanAsimiMs = 15000) {
  return execFileSync('git', ['-C', dir, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    timeout: zamanAsimiMs,
  })
}

/** Farkın herhangi bir SATIRINDA tam anahtar kalıbı var mı (grep -E satır semantiği). */
function sirKalibiVar(fark) {
  return String(fark)
    .split('\n')
    .some((satir) => SIR_KALIBI.test(satir))
}

/** Son commit'in yaşı (sn); depo yok / commit yok / hata → null. */
function yedekYasiSn(dir, simdiSn) {
  try {
    const ct = Number.parseInt(git(dir, ['log', '-1', '--format=%ct']).trim(), 10)
    return Number.isFinite(ct) ? Math.max(0, simdiSn - ct) : null
  } catch {
    return null
  }
}

/** Yedeklenecek (md) değişiklik var mı: izlenmeyen dosya dahil. Hata → false (fail-open). */
function bekleyenVar(dir) {
  try {
    return git(dir, ['status', '--porcelain', '--', ...PATHSPEC]).trim().length > 0
  } catch {
    return false
  }
}

/**
 * Yedek al. Dönüş: { durum: 'yok-depo' | 'degisiklik-yok' | 'sir-kalibi' | 'commit' | 'hata', push?: boolean }
 */
function yedekle({ dir = hafizaDizini(), sebep = 'yedek', simdi = new Date() } = {}) {
  try {
    if (!fs.existsSync(path.join(dir, '.git'))) return { durum: 'yok-depo' }
    // Kalıplar AYRI eklenir: git add, eşleşmeyen bir kalıpta ("did not match any files") HİÇBİR şey eklemeden
    // düşer. Eski betik iki kalıbı tek komutta veriyordu ve MEMORY.md.oncesi-* dosyası yokken sessizce
    // hiçbir şey yedeklemiyordu (ARC-92'de test bunu yakaladı).
    for (const kalip of PATHSPEC) {
      try {
        git(dir, ['add', '--', kalip])
      } catch {
        // Bu kalıba uyan dosya yok: öteki kalıp yine eklenir.
      }
    }
    const dosyalar = git(dir, ['diff', '--cached', '--name-only', '-z']).split('\0').filter(Boolean)
    if (dosyalar.length === 0) return sonuc(dir, simdi, sebep, { durum: 'degisiklik-yok' })
    // ARC-319: sır kalıbı yalnız KENDİ dosyasını dışarıda bırakır, kalan yedek alınır. (Eskiden tek eşleşme TÜM yedeği
    // durduruyordu: 9-15 Kasım arası 6 gün commit atılmadı; bir nottaki sahte bağlantı örneği kalıbı tetikledi.)
    const disarida = []
    for (const d of dosyalar) {
      if (!sirKalibiVar(git(dir, ['diff', '--cached', '-U0', '--', d]))) continue
      disarida.push(d)
      git(dir, ['reset', '-q', '--', d])
      try {
        fs.appendFileSync(path.join(dir, UYARI_LOGU), simdi.toISOString() + ' SIR KALIBI: ' + d + ' yedege ALINMADI, elle bak (' + sebep + ')\n')
      } catch {
        // Günlük yazılamazsa da dosya dışarıda kalır; asıl koruma indeksten çıkarmaktır.
      }
    }
    if (git(dir, ['diff', '--cached', '--name-only']).trim() === '') return sonuc(dir, simdi, sebep, { durum: 'sir-kalibi', disarida })
    const iso = simdi.toISOString().slice(0, 16) + 'Z'
    git(dir, ['commit', '-q', '-m', 'hafiza: ' + sebep + ' ' + iso])
    let push = false
    try {
      git(dir, ['push', '-q', 'origin', 'master'], 25000)
      push = true
    } catch {
      // Ağ yok / uzak yok: yerel commit yeterli; push durumu son-durum kaydına yazılır, kanca satırı söyler.
    }
    return sonuc(dir, simdi, sebep, { durum: 'commit', push, disarida })
  } catch (e) {
    return sonuc(dir, simdi, sebep, { durum: 'hata', neden: String((e && e.message) || e).split('\n')[0].slice(0, 160) })
  }
}

/** Son yedek denemesinin sonucunu .hafiza-yedek-son dosyasına yazar (md değil: commit'e girmez); kanca satırı bunu okur. */
function sonuc(dir, simdi, sebep, r) {
  try {
    fs.writeFileSync(path.join(dir, SON_KAYIT), JSON.stringify({ sn: Math.floor(simdi.getTime() / 1000), sebep, ...r }))
  } catch {
    // Kayıt yazılamazsa kanca eski kaydı okur; yedeğin kendisi etkilenmez.
  }
  return r
}

/** Son deneme kaydı; yok/bozuk → null. */
function sonKayit(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, SON_KAYIT), 'utf8'))
  } catch {
    return null
  }
}

/** Kayıt BAŞARISIZ bir son denemeyi gösteriyorsa kısa neden, yoksa null. */
function basarisizNeden(k) {
  if (!k) return null
  const dosya = Array.isArray(k.disarida) && k.disarida.length ? ' (' + k.disarida.slice(0, 3).join(', ') + ' sır kalıbı nedeniyle dışarıda)' : ''
  if (k.durum === 'sir-kalibi') return 'hiçbir şey yedeklenemedi' + dosya
  if (k.durum === 'hata') return 'yedek hata verdi: ' + (k.neden || 'bilinmiyor')
  if (k.durum === 'commit' && k.push === false) return 'commit atıldı ama push düştü' + dosya
  if (k.durum === 'commit' && dosya) return 'kısmen yedeklendi' + dosya
  return null
}

/**
 * Saf karar. girdi: { olay, yasSn, bekleyen, sonDenemeYasSn }.
 * Dönüş: { yedekle: boolean, satir: string | null }.
 */
function karar({ olay, yasSn, bekleyen, sonDenemeYasSn, sonBasarisiz }) {
  if (olay === 'PreCompact') return { yedekle: true, satir: null }
  if (olay !== 'SessionStart' && olay !== 'UserPromptSubmit') return { yedekle: false, satir: null }
  if (yasSn === null || yasSn === undefined) return { yedekle: false, satir: null }
  const dk = Math.floor(yasSn / 60)
  const eski = yasSn > ESIK_SN
  const denemeAraligiGecti = sonDenemeYasSn === null || sonDenemeYasSn === undefined || sonDenemeYasSn >= DENEME_ARALIGI_SN
  const yedekle = bekleyen && eski && denemeAraligiGecti
  // "Başlatıldı" yalnız gerçekten başlatıldıysa; son deneme başarısızsa neden açıkça yazılır (6 gün sessiz düşme dersi).
  const basarisiz = bekleyen && sonBasarisiz ? ' · ⛔SON YEDEK BAŞARISIZ: ' + sonBasarisiz : ''
  const arka = yedekle ? ' (arka planda yedek başlatıldı)' : ''
  if (olay === 'SessionStart') {
    const durum = !bekleyen ? 'bekleyen değişiklik yok' : eski ? 'bekleyen değişiklik VAR ⚠' + arka : 'bekleyen değişiklik var'
    return { yedekle, satir: 'HAFIZA YEDEK: son commit ' + dk + ' dk önce · ' + durum + basarisiz }
  }
  // UserPromptSubmit: yalnız uyarılacak durumda konuşur.
  if (bekleyen && eski) {
    return { yedekle, satir: '⚠HAFIZA YEDEK: son commit ' + dk + ' dk önce, bekleyen değişiklik var' + arka + basarisiz }
  }
  return { yedekle: false, satir: null }
}

function arkaPlandaYedekle(dir, sebep) {
  try {
    // `detached: true` yalnız başlatıcıda (INV-KOPUK-1, REC-415): kopuk süreç konsolsuzdur, başlatıcı çocuğa
    // windowsHide enjekte eder; doğrudan spawn içindeki git yeni konsol penceresi açardı.
    kopukBaslat(__filename, ['--yedekle', '--sebep', sebep], { env: { ...process.env, HAFIZA_DIZINI: dir } })
  } catch {
    // Başlatılamazsa bir sonraki mesajda yeniden denenir.
  }
}

function isaretYasiSn(dir, simdiSn) {
  try {
    return Math.max(0, simdiSn - Math.floor(fs.statSync(path.join(dir, ISARET)).mtimeMs / 1000))
  } catch {
    return null
  }
}

/**
 * Kanca girişi: stdin JSON'u ({ hook_event_name }) → { cikti } (null: sessiz). PreCompact'ta yedeği ELDE alır
 * (compact'tan önce bitmeli); öteki olaylarda arka planda başlatır ve işareti günceller.
 */
function kancaKosIc(girdi, { dir = hafizaDizini(), simdiSn = Math.floor(Date.now() / 1000) } = {}) {
  const olay = girdi && girdi.hook_event_name
  if (!fs.existsSync(path.join(dir, '.git'))) return { cikti: null }
  if (olay === 'PreCompact') {
    yedekle({ dir, sebep: 'precompact', simdi: new Date(simdiSn * 1000) })
    return { cikti: null }
  }
  const k = karar({
    olay,
    yasSn: yedekYasiSn(dir, simdiSn),
    bekleyen: bekleyenVar(dir),
    sonDenemeYasSn: isaretYasiSn(dir, simdiSn),
    sonBasarisiz: basarisizNeden(sonKayit(dir)),
  })
  if (k.yedekle) {
    try {
      fs.writeFileSync(path.join(dir, ISARET), String(simdiSn))
    } catch {
      // İşaret yazılamazsa her mesajda denenir; yedeğin kendisi yine güvenlidir.
    }
    arkaPlandaYedekle(dir, 'saatlik')
  }
  if (!k.satir) return { cikti: null }
  return { cikti: { hookSpecificOutput: { hookEventName: olay, additionalContext: k.satir } } }
}

function kancaKos(girdi, secenek) {
  const r = kancaKosIc(girdi, secenek)
  const olay = girdi && girdi.hook_event_name
  const uyari = yedekUyariSatiri(olay)
  if (!uyari) return r
  const hs = (r.cikti && r.cikti.hookSpecificOutput) || { hookEventName: olay, additionalContext: '' }
  hs.additionalContext = hs.additionalContext ? hs.additionalContext + '\n' + uyari : uyari
  return { cikti: { hookSpecificOutput: hs } }
}

/**
 * ARC-292: drive-yedek.cmd (UnoPIM yedeği) atlanır/düşerse ~/.claude/zamanli/yedek-uyari.txt yazar, başarıda siler.
 * Dosya varsa SessionStart'ta tek satır "⚠YEDEK UYARI: <ilk satır>"; yok/okunamaz/boş → null (fail-open).
 * Vana: VENTHUB_YEDEK_UYARI_KAPAT=1. Test için VENTHUB_YEDEK_UYARI_DOSYA yolu geçersiz kılar.
 */
function yedekUyariSatiri(olay) {
  try {
    if (olay !== 'SessionStart' || process.env.VENTHUB_YEDEK_UYARI_KAPAT === '1') return null
    const yol = process.env.VENTHUB_YEDEK_UYARI_DOSYA || path.join(os.homedir(), '.claude', 'zamanli', 'yedek-uyari.txt')
    const ilk = String(fs.readFileSync(yol, 'utf8')).split(/\r?\n/).find((s) => s.trim())
    // Kontrol karakterleri (ESC, NUL, U+2028 vb.) bağlama girmesin.
    const temiz = ilk ? ilk.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, ' ').trim() : ''
    return temiz ? '⚠YEDEK UYARI: ' + temiz.slice(0, 200) : null
  } catch {
    return null
  }
}

function main() {
  const arg = process.argv.slice(2)
  if (arg.includes('--yedekle')) {
    const i = arg.indexOf('--sebep')
    const sebep = i >= 0 && arg[i + 1] ? arg[i + 1] : 'yedek'
    yedekle({ sebep })
    process.exit(0)
  }
  if (arg.includes('--yas')) {
    const yas = yedekYasiSn(hafizaDizini(), Math.floor(Date.now() / 1000))
    process.stdout.write(String(yas === null ? 'bilinmiyor' : yas) + '\n')
    process.exit(0)
  }
  // Kanca kipi: stdin.
  let girdi = {}
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    process.exit(0)
  }
  let r = { cikti: null }
  try {
    r = kancaKos(girdi)
  } catch {
    // fail-open
  }
  if (r.cikti) process.stdout.write(JSON.stringify(r.cikti))
  process.exit(0)
}

module.exports = {
  ESIK_SN,
  DENEME_ARALIGI_SN,
  hafizaDizini,
  sirKalibiVar,
  yedekYasiSn,
  bekleyenVar,
  yedekle,
  karar,
  sonKayit,
  basarisizNeden,
  kancaKos,
  yedekUyariSatiri,
}
if (require.main === module) main()
