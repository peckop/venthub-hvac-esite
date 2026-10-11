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
const { execFileSync, spawn } = require('child_process')

const ESIK_SN = 3600
const DENEME_ARALIGI_SN = 600
const ISARET = '.hafiza-yedek-deneme'
const UYARI_LOGU = '.hafiza-commit-uyari.log'
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
    if (git(dir, ['diff', '--cached', '--name-only']).trim() === '') return { durum: 'degisiklik-yok' }
    if (sirKalibiVar(git(dir, ['diff', '--cached', '-U0']))) {
      try {
        fs.appendFileSync(path.join(dir, UYARI_LOGU), simdi.toISOString() + ' SIR KALIBI: commit atilmadi, elle bak (' + sebep + ')\n')
      } catch {
        // Günlük yazılamazsa da commit atılmaz; asıl koruma indeksi temizlemektir.
      }
      git(dir, ['reset', '-q'])
      return { durum: 'sir-kalibi' }
    }
    const iso = simdi.toISOString().slice(0, 16) + 'Z'
    git(dir, ['commit', '-q', '-m', 'hafiza: ' + sebep + ' ' + iso])
    let push = false
    try {
      git(dir, ['push', '-q', 'origin', 'master'], 25000)
      push = true
    } catch {
      // Ağ yok / uzak yok: yerel commit yeterli, yaş uyarısı zaten görünür.
    }
    return { durum: 'commit', push }
  } catch {
    return { durum: 'hata' }
  }
}

/**
 * Saf karar. girdi: { olay, yasSn, bekleyen, sonDenemeYasSn }.
 * Dönüş: { yedekle: boolean, satir: string | null }.
 */
function karar({ olay, yasSn, bekleyen, sonDenemeYasSn }) {
  if (olay === 'PreCompact') return { yedekle: true, satir: null }
  if (olay !== 'SessionStart' && olay !== 'UserPromptSubmit') return { yedekle: false, satir: null }
  if (yasSn === null || yasSn === undefined) return { yedekle: false, satir: null }
  const dk = Math.floor(yasSn / 60)
  const eski = yasSn > ESIK_SN
  const denemeAraligiGecti = sonDenemeYasSn === null || sonDenemeYasSn === undefined || sonDenemeYasSn >= DENEME_ARALIGI_SN
  const yedekle = bekleyen && eski && denemeAraligiGecti
  if (olay === 'SessionStart') {
    const durum = !bekleyen ? 'bekleyen değişiklik yok' : eski ? 'bekleyen değişiklik VAR ⚠ (arka planda yedek başlatıldı)' : 'bekleyen değişiklik var'
    return { yedekle, satir: 'HAFIZA YEDEK: son commit ' + dk + ' dk önce · ' + durum }
  }
  // UserPromptSubmit: yalnız uyarılacak durumda konuşur.
  if (bekleyen && eski) {
    return { yedekle, satir: '⚠HAFIZA YEDEK: son commit ' + dk + ' dk önce, bekleyen değişiklik var (arka planda yedek başlatıldı)' }
  }
  return { yedekle: false, satir: null }
}

function arkaPlandaYedekle(dir, sebep) {
  try {
    const cocuk = spawn(process.execPath, [__filename, '--yedekle', '--sebep', sebep], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
      env: { ...process.env, HAFIZA_DIZINI: dir },
    })
    cocuk.unref()
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
function kancaKos(girdi, { dir = hafizaDizini(), simdiSn = Math.floor(Date.now() / 1000) } = {}) {
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
  kancaKos,
}
if (require.main === module) main()
