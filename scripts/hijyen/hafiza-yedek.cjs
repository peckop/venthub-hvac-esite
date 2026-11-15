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
 * Adaylar `git status --porcelain -z` ile okunur (md ve MEMORY.md.oncesi-*); değişiklik yoksa sessiz çık. Her aday
 * indekse GİRMEDEN taranır (yeni dosya: tüm içerik; izlenen: HEAD'e göre YALNIZ eklenen satırlar; NUL baytları
 * silinir, UTF-16 ve ikili dosya da taranır). Tam anahtar kalıbı taşıyan DOSYA stage'lenmez ve
 * `.hafiza-commit-uyari.log`'a adıyla yazılır (ARC-319: eskiden tek eşleşme TÜM yedeği durduruyordu); kalanlar
 * stage'lenir, commit'ten hemen önce indeks farkı bir kez daha taranır, sonra commit + best-effort push.
 * Koşular atomik kilitle (`.hafiza-yedek-kilit`, mkdir, 120 sn bayat) sıralanır. Her denemenin sonucu
 * `.hafiza-yedek-son` dosyasına yazılır; kanca satırı gerçek sonucu söyler. Push düşmüşse sonraki "değişiklik yok"
 * koşusunda yeniden denenir.
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
    maxBuffer: 512 * 1024 * 1024,
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

// Kontrol ve BiDi karakterleri; kaçışlar kaynakta yazılı (ham karakter yok): 0000-001f 007f-009f 2028 2029 202a-202e 2066-2069
const KONTROL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g
/** Konsol/BiDi kontrol karakterlerini bağlama sokmamak için boşluğa çevirir. */
function temiz(s) {
  return String(s)
    .replace(KONTROL, ' ')
    .trim()
}

/** UTF-16 (PowerShell `>` çıktısı) ve ikili dosyalar için NUL baytlarını siler: kalıp yine eşleşir (denetçi N1). */
function nulSil(s) {
  return String(s).replace(/\0/g, '')
}

/** Eklenen satırlar mı taranacak (fark) yoksa tüm metin mi. Silinen (-) satır yeni içerik taşımaz (denetçi N2). */
function sirliMetin(metin, farkMi) {
  const t = nulSil(metin)
  if (!farkMi) return sirKalibiVar(t)
  const satirlar = t.split('\n')
  const ilk = satirlar.findIndex((x) => x.startsWith('@@'))
  return ilk >= 0 && sirKalibiVar(satirlar.slice(ilk).filter((x) => x.startsWith('+')).join('\n'))
}

/** Değişen/yeni md adaylarını `-z` ile oku (alıntısız, Türkçe ve boşluklu ad güvenli; denetçi B2). */
function adaylar(dir) {
  const t = git(dir, ['status', '--porcelain', '-z', '-uall', '--', ...PATHSPEC]).split('\0')
  const liste = []
  for (let i = 0; i < t.length; i++) {
    const s = t[i]
    if (s.length < 4) continue
    const x = s[0]
    const y = s[1]
    if (x === 'R' || x === 'C') i++ // yeniden adlandırmada eski ad ayrı jeton
    liste.push({ p: s.slice(3), yeni: x === '?', silindi: x === 'D' || y === 'D' })
  }
  return liste
}

/** Dosya indekse GİRMEDEN taranır: sırlı dosya hiç stage'lenmez, eşzamanlı koşu onu geri koyamaz (denetçi B1). */
function dosyaSirli(dir, a) {
  if (a.silindi) return false
  const oku = () => fs.readFileSync(path.join(dir, a.p), 'latin1')
  if (a.yeni) return sirliMetin(oku(), false)
  try {
    return sirliMetin(git(dir, ['--literal-pathspecs', 'diff', '-U0', '--text', 'HEAD', '--', a.p]), true)
  } catch {
    return sirliMetin(oku(), false) // HEAD yok (ilk commit): tüm içerik taranır
  }
}

const KILIT = '.hafiza-yedek-kilit'
const KILIT_BAYAT_MS = 120000

/** Atomik tek-koşu kilidi (mkdir). Bayat (>120 sn) kilit düşürülür. Kurulamazsa (EEXIST dışı) fail-open: devam. */
function kilitAl(dir, jeton) {
  const yol = path.join(dir, KILIT)
  for (let i = 0; i < 2; i++) {
    try {
      fs.mkdirSync(yol)
      try {
        fs.writeFileSync(path.join(yol, 'sahip'), jeton)
      } catch {
        // Jeton yazılamazsa bırakma yine dizini siler.
      }
      return true
    } catch (e) {
      if (!e || e.code !== 'EEXIST') return true
      try {
        if (Date.now() - fs.statSync(yol).mtimeMs <= KILIT_BAYAT_MS) return false
        fs.rmSync(yol, { recursive: true, force: true }) // bayat kilit düşürülür
      } catch {
        return false
      }
    }
  }
  return false
}

/** Kilit alınana kadar en çok bekleMs bekler (PreCompact: compact öncesi son notlar yedeksiz kalmasın). */
function kilitBekle(dir, jeton, bekleMs) {
  const son = Date.now() + bekleMs
  while (!kilitAl(dir, jeton)) {
    if (Date.now() >= son) return false
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250)
  }
  return true
}

/** Yalnız KENDİ jetonuyla alınmış kilidi bırakır: bayat düşüp başkasına geçen kilit silinmez (denetçi N-B). */
function kilitBirak(dir, jeton) {
  const yol = path.join(dir, KILIT)
  try {
    if (fs.readFileSync(path.join(yol, 'sahip'), 'utf8') !== jeton) return
  } catch {
    // Jeton okunamadı: eski biçim ya da yazılamamış; dizin boşsa aşağıda silinir.
  }
  try {
    fs.rmSync(yol, { recursive: true, force: true })
  } catch {
    // Zaten yok.
  }
}

function uzagaGonder(dir) {
  try {
    git(dir, ['push', '-q', 'origin', 'master'], 25000)
    return true
  } catch {
    return false // Ağ yok / uzak yok: yerel commit yeterli; durum son-durum kaydına yazılır, kanca satırı söyler.
  }
}

/**
 * Yedek al. Dönüş: { durum: 'yok-depo' | 'mesgul' | 'degisiklik-yok' | 'push-tekrar' | 'sir-kalibi' | 'commit' | 'hata', push?: boolean, disarida?: string[] }
 */
function yedekle({ dir = hafizaDizini(), sebep = 'yedek', simdi = new Date(), taramaSonrasi = null, commitOncesi = null, bekleMs = 0 } = {}) {
  let kilitli = false
  const jeton = process.pid + '-' + Math.random().toString(36).slice(2)
  try {
    if (!fs.existsSync(path.join(dir, '.git'))) return { durum: 'yok-depo' }
    if (!kilitBekle(dir, jeton, bekleMs)) return { durum: 'mesgul' } // başka koşu sürüyor: kaydı ezme, sessiz çık
    kilitli = true
    // Önceki (çöken) koşudan kalan indeks temizlenir; aday seçimi baştan yapılır.
    git(dir, ['reset', '-q'])
    const hepsi = adaylar(dir)
    if (hepsi.length === 0) {
      const onceki = sonKayit(dir)
      if (onceki && (onceki.durum === 'commit' || onceki.durum === 'push-tekrar') && onceki.push === false) return sonuc(dir, simdi, sebep, { durum: 'push-tekrar', push: uzagaGonder(dir) })
      return sonuc(dir, simdi, sebep, { durum: 'degisiklik-yok' })
    }
    // ARC-319: sır kalıbı yalnız KENDİ dosyasını dışarıda bırakır, kalan yedek alınır. (Eskiden tek eşleşme TÜM yedeği
    // durduruyordu: 9-15 Kasım arası 6 gün commit atılmadı; bir nottaki sahte bağlantı örneği kalıbı tetikledi.)
    const disarida = []
    const temizler = []
    for (const a of hepsi) {
      let sirli = false
      try {
        sirli = dosyaSirli(dir, a)
      } catch {
        sirli = true // okunamayan dosya yedeğe alınmaz (güvenli taraf)
      }
      if (!sirli) {
        temizler.push(a.p)
        continue
      }
      disarida.push(a.p)
      try {
        fs.appendFileSync(path.join(dir, UYARI_LOGU), simdi.toISOString() + ' SIR KALIBI: ' + temiz(a.p).slice(0, 120) + ' yedege ALINMADI, elle bak (' + sebep + ')\n')
      } catch {
        // Günlük yazılamazsa da dosya hiç stage'lenmez; asıl koruma budur.
      }
    }
    if (taramaSonrasi) taramaSonrasi() // test dikişi: tarama ile git add arasındaki yarış penceresini taklit eder
    for (let i = 0; i < temizler.length; i += 50) {
      const grup = temizler.slice(i, i + 50)
      try {
        git(dir, ['--literal-pathspecs', 'add', '--', ...grup])
      } catch {
        // Tarama ile add arasında biri silinmiş olabilir: tek tek dene, kaybolanı atla (denetçi N-G).
        for (const t of grup) {
          try {
            git(dir, ['--literal-pathspecs', 'add', '--', t])
          } catch {
            // Kayıp dosya bir sonraki koşuda zaten aday olmaz.
          }
        }
      }
    }
    // Commit'ten hemen önce tüm indeks farkı BİR KEZ daha taranır (derinlemesine koruma).
    if (git(dir, ['diff', '--cached', '--name-only']).trim() === '') return sonuc(dir, simdi, sebep, { durum: 'sir-kalibi', disarida })
    if (sirliMetin(git(dir, ['diff', '--cached', '-U0', '--text']), true)) {
      git(dir, ['reset', '-q'])
      return sonuc(dir, simdi, sebep, { durum: 'sir-kalibi', disarida: disarida.concat('(indeks son taramada)') })
    }
    if (commitOncesi) commitOncesi() // test dikişi: son tarama ile commit arasındaki kilitsiz dış yazar penceresi
    const iso = simdi.toISOString().slice(0, 16) + 'Z'
    git(dir, ['commit', '-q', '-m', 'hafiza: ' + sebep + ' ' + iso])
    // Commit sonrası, PUSH'tan önce son kapı: kilitsiz bir dış yazar (eski kapanış betiği) indekse sırlı dosya soktuysa
    // commit geri alınır ve hiçbir şey uzağa gitmez (denetçi N-A).
    if (sirliMetin(git(dir, ['show', '-U0', '--text', '--format=', 'HEAD']), true)) {
      try {
        git(dir, ['reset', '-q', '--soft', 'HEAD~1'])
      } catch {
        git(dir, ['update-ref', '-d', 'HEAD']) // ilk commit idi
      }
      git(dir, ['reset', '-q'])
      return sonuc(dir, simdi, sebep, { durum: 'sir-kalibi', disarida: disarida.concat('(commit sonrası taramada)') })
    }
    return sonuc(dir, simdi, sebep, { durum: 'commit', push: uzagaGonder(dir), disarida })
  } catch (e) {
    try {
      git(dir, ['reset', '-q'])
    } catch {
      // Sessiz.
    }
    // İlk anlamlı satır: git hatasında asıl neden stderr'dedir; mutlak yol bağlama girmesin (denetçi N6).
    const ham = String((e && e.stderr) || (e && e.message) || e)
      .split('\n')
      .find((s) => s.trim())
    return sonuc(dir, simdi, sebep, { durum: 'hata', neden: temiz(String(ham || 'bilinmiyor').split(dir).join('<depo>').split(dir.replace(/\\/g, '/')).join('<depo>')).slice(0, 160) })
  } finally {
    if (kilitli) kilitBirak(dir, jeton)
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
  // Dosya adları bağlama girer: kontrol/BiDi karakter süzülür, ad başına 80 karakter, üç addan fazlası "(+N)" (denetçi N5).
  const adlar = Array.isArray(k.disarida) ? k.disarida : []
  const dosya = adlar.length
    ? ' (' + adlar.slice(0, 3).map((a) => temiz(a).slice(0, 80)).join(', ') + (adlar.length > 3 ? ' (+' + (adlar.length - 3) + ')' : '') + ' sır kalıbı nedeniyle dışarıda)'
    : ''
  if (k.durum === 'sir-kalibi') return 'hiçbir şey yedeklenemedi' + dosya
  if (k.durum === 'hata') return 'yedek hata verdi: ' + temiz(k.neden || 'bilinmiyor').slice(0, 160)
  if ((k.durum === 'commit' || k.durum === 'push-tekrar') && k.push === false) return 'commit atıldı ama push düştü' + dosya
  if (k.durum === 'commit' && dosya) return 'kısmen yedeklendi' + dosya
  return null
}

/**
 * Saf karar. girdi: { olay, yasSn, bekleyen, sonDenemeYasSn, sonBasarisiz }.
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
    yedekle({ dir, sebep: 'precompact', simdi: new Date(simdiSn * 1000), bekleMs: 15000 })
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
