#!/usr/bin/env node
'use strict'
/**
 * İZİN İSTEĞİ KAPISI — ARC-179. Olay: PermissionRequest (Claude Code izin penceresi AÇILMADAN önce koşar).
 *
 * ── NİÇİN VAR ──
 *
 * 18 Ekim: departman pencerelerinin izin soruları Recep'e düşüyor, fark etmezse iş duruyor. Örnek: GEO-SEO'nun
 * salt-okuma zinciri (cd && git status && curl ... "$U" && grep) auto kipte sınıflandırıcıda takıldı ve insana
 * düştü. Karar (OPS, Recep onaylı): zararsız olan Recep'e hiç gelmesin; olmayan da Recep'e değil, OPS'a gitsin.
 *
 * ── DAVRANIŞ ──
 *
 * (1) Bash komutu SIKI ayrıştırıcıyla yalnız salt-okuma parçalardan oluşuyorsa → allow.
 * (2) Değilse → deny + modele mesaj ("Recep'e izin sorusu düşmez; tek tek koş; gerçekten izin gerekiyorsa OPS'a yaz").
 * (3) Her yakalanan istek kayıt dosyasına yazılır (oturum, pencere, kip, komut, karar): izin retleri dökümü (ARC-173).
 * (4) OPS penceresi ve Bash dışı araçlar kapsam dışı (karar yok → izin akışı değişmez).
 * (5) Kanca çökerse karar VERMEZ (çıkış 0, çıktı yok): normal izin akışı sürer, kanca hatası işi kilitlemez.
 *     (onFailure "block" burada bilerek kullanılmaz: kanca bozulunca bütün pencereler reddedilirdi.)
 *
 * ── GÜVENLİK ÇERÇEVESİ ──
 *
 * - Belge (hooks, PermissionRequest): kanca allow dese bile eşleşen deny/ask kuralları ÖNCE uygulanır; bu kanca
 *   yasakları aşamaz, yalnız sorulacak şeyi sorusuz geçirir.
 * - Bilinmeyen her şey allow değildir. Allowlist; kara liste değil.
 * - Ayrıştırıcı komut ikamesi, ters tirnak, yönlendirme, arka plan, alt kabuk, tanımsız değişken, ortam ön eki
 *   görürse allow VERMEZ.
 *
 * ── ÖLÇÜLMEDİ ──
 *
 * Auto kipte sınıflandırıcı insana düşürdüğünde bu olayın tetiklenip tetiklenmediği belgede yok; kayıt dosyası
 * bunu gözleme çevirir (ilk gün: kayıt var mı?). Tetiklenmiyorsa bu kanca o durumu çözmez, ayrı çare gerekir.
 */
const fs = require('fs')
const os = require('os')
const path = require('path')

const MAX_KOMUT = 4000

// ───────────────────────── ayrıştırıcı ─────────────────────────

/**
 * Komutu parçalara (komut + argümanlar) böler. Güvenli ayrıştırılamıyorsa { hata } döner.
 * Desteklenen: tırnaklar, ters bölü kaçışı, ; && || | satır sonu, bilinen değişken genişletmesi, /dev/null ve 2>&1 yönlendirmesi.
 */
function ayristir(komut) {
  const s = String(komut || '')
  if (!s.trim()) return { hata: 'boş komut' }
  if (s.length > MAX_KOMUT) return { hata: 'komut çok uzun' }
  const atamalar = new Map()
  const parcalar = []
  let args = []
  let globIdx = [] // args ile paralel: o argümanda TIRNAKSIZ glob karakteri (* ? [) var mı — kabuk yalnız onları genişletir
  let curGlob = false
  let cur = ''
  let basladi = false
  let tirnak = null
  let i = 0

  const jetonBitir = () => {
    if (basladi) {
      args.push(cur)
      globIdx.push(curGlob)
    }
    cur = ''
    basladi = false
    curGlob = false
  }
  const parcaBitir = () => {
    jetonBitir()
    if (!args.length) return null
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(args[0])) {
      if (args.length > 1) return 'ortam ön eki (VAR=değer komut)'
      const eq = args[0].indexOf('=')
      atamalar.set(args[0].slice(0, eq), args[0].slice(eq + 1))
    } else {
      args.globlu = globIdx
      parcalar.push(args)
    }
    args = []
    globIdx = []
    return null
  }
  const degiskenOku = () => {
    // s[i] === '$'
    const sonra = s[i + 1]
    if (sonra === '(') return { hata: 'komut ikamesi $(' }
    if (sonra === "'") return { hata: "ANSI-C tırnak $'" }
    let ad
    let uzunluk
    if (sonra === '{') {
      const kapa = s.indexOf('}', i + 2)
      if (kapa < 0) return { hata: 'kapanmamış ${' }
      ad = s.slice(i + 2, kapa)
      uzunluk = kapa - i + 1
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(ad)) return { hata: 'değişken biçimi ${' + ad + '}' }
    } else if (sonra && /[A-Za-z_]/.test(sonra)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i + 1))
      ad = m[0]
      uzunluk = 1 + ad.length
    } else {
      return { hata: 'özel parametre $' + (sonra || '') }
    }
    if (!atamalar.has(ad)) return { hata: 'tanımsız değişken: ' + ad }
    return { deger: atamalar.get(ad), uzunluk }
  }

  while (i < s.length) {
    const c = s[i]
    if (tirnak === "'") {
      if (c === "'") tirnak = null
      else cur += c
      i += 1
      continue
    }
    if (tirnak === '"') {
      if (c === '"') {
        tirnak = null
        i += 1
        continue
      }
      if (c === '\\' && i + 1 < s.length && '"\\$`'.includes(s[i + 1])) {
        cur += s[i + 1]
        i += 2
        continue
      }
      if (c === '`') return { hata: 'ters tirnak komut ikamesi' }
      if (c === '$') {
        const r = degiskenOku()
        if (r.hata) return r
        cur += r.deger
        i += r.uzunluk
        continue
      }
      cur += c
      i += 1
      continue
    }
    // tırnak dışı
    if (c === ' ' || c === '\t' || c === '\r') {
      jetonBitir()
      i += 1
      continue
    }
    if (c === '\n' || c === ';') {
      const e = parcaBitir()
      if (e) return { hata: e }
      i += 1
      continue
    }
    if (c === "'" || c === '"') {
      tirnak = c
      basladi = true
      i += 1
      continue
    }
    if (c === '\\') {
      if (i + 1 >= s.length) return { hata: 'sonda ters bölü' }
      if (s[i + 1] === '\n') {
        i += 2
        continue
      }
      cur += s[i + 1]
      basladi = true
      i += 2
      continue
    }
    if (c === '`') return { hata: 'ters tirnak komut ikamesi' }
    if (c === '$') {
      const r = degiskenOku()
      if (r.hata) return r
      if (/\s/.test(r.deger)) return { hata: 'tırnaksız değişken boşluk içeriyor' }
      if (/[*?[]/.test(r.deger)) curGlob = true
      cur += r.deger
      basladi = true
      i += r.uzunluk
      continue
    }
    if (c === '#' && !basladi) {
      while (i < s.length && s[i] !== '\n') i += 1
      continue
    }
    if (c === '(' || c === ')') return { hata: 'alt kabuk / gruplama ()' }
    // Tırnaksız { } hiçbir yerde kabul edilmez: brace expansion ({.en,v}), gruplama ve komut kümesi allowlist'i aşar.
    if (c === '{' || c === '}') return { hata: 'tırnaksız süslü parantez (brace expansion / küme)' }
    if (c === '<') return { hata: 'girdi yönlendirmesi / here-doc / süreç ikamesi' }
    if (c === '>') {
      // yalnız /dev/null ve 2>&1 / >&2
      const kalan = s.slice(i)
      const fd = basladi && /^[12]$/.test(cur) ? cur : null
      if (basladi && !fd) return { hata: 'çıktı yönlendirmesi' }
      const m = /^>\s*\/dev\/null(?![\w./-])/.exec(kalan)
      const m2 = /^>&[12](?![\w])/.exec(kalan)
      if (m || m2) {
        cur = ''
        basladi = false
        i += (m || m2)[0].length
        continue
      }
      return { hata: 'çıktı yönlendirmesi (dosyaya yazma)' }
    }
    if (c === '&') {
      if (s[i + 1] === '&') {
        const e = parcaBitir()
        if (e) return { hata: e }
        i += 2
        continue
      }
      if (s[i + 1] === '>') {
        const m = /^&>\s*\/dev\/null(?![\w./-])/.exec(s.slice(i))
        if (!m) return { hata: 'çıktı yönlendirmesi &>' }
        i += m[0].length
        continue
      }
      return { hata: 'arka plan &' }
    }
    if (c === '|') {
      const e = parcaBitir()
      if (e) return { hata: e }
      i += s[i + 1] === '|' ? 2 : 1
      continue
    }
    if (c === '*' || c === '?' || c === '[') curGlob = true
    cur += c
    basladi = true
    i += 1
  }
  if (tirnak) return { hata: 'kapanmamış tırnak' }
  const e = parcaBitir()
  if (e) return { hata: e }
  if (!parcalar.length) return { hata: 'çalıştırılacak komut yok' }
  return { parcalar }
}

// ───────────────────────── komut kuralları ─────────────────────────

// Ayırıcı kümesine ':' dahil: `git show HEAD:.env` biçimi de yakalanır (OPS incelemesi, #1997).
const HASSAS = [
  /(^|[/\\:])\.env(\.(?!example$)[^/\\:]*)?$/i,
  /\.(pem|key|p12|pfx)$/i,
  /id_(rsa|ed25519|ecdsa|dsa)/i,
  /(^|[/\\:])\.(git-credentials|netrc|npmrc|pgpass)$/i,
  /service[-_]?account[^/\\:]*\.json$/i,
  // Kimlik dosyaları: oturum anahtarı, bulut, gh, ssh (OPS incelemesi, #1997).
  /(^|[/\\:])\.?credentials(\.json)?$/i,
  /hosts\.yml$/i,
  // Canlı yazım onay anahtarı (ARC-181): ajanlara otomatik okuma izni verilmez; normal izin sorusuna düşer.
  /ops-yazim-onayi/i,
  /\.aws[/\\]/i,
  /\.ssh[/\\]/i,
  // Adında "token" geçen DOSYA: yol ayırıcılı ya da uzantılı argüman (arama sözcüğü `grep token` etkilenmez).
  /[/\\:][^/\\:]*token[^/\\:]*$/i,
  /^[^/\\:\s]*token[^/\\:\s]*\.[a-z0-9]{1,5}$/i,
]
// Nokta ile başlayan segmentte glob karakteri (.e*, .*, .e?v, .[!0]nv, .[0e]nv): kabuk bunu .env'e genişletebilir.
// Yalnız TIRNAKSIZ glob içeren argümanlara uygulanır (kabuk tırnak içini genişletmez); jq süzgeci `".[0].title"` etkilenmez.
const HASSAS_GLOB = /(^|[/\\])\.[^/\\]*[*?[]|[*?[][^/\\]*env/i
const hassasMi = (a) => HASSAS.some((r) => r.test(String(a)))
const globHassasMi = (a) => HASSAS_GLOB.test(String(a))

// DARALTMA (OPS, 18 Ekim): rg ve find YOK (aracın kendi glob/ignore genişletmesi tırnaklı .env* desenini okutabilir);
// grep yalnız tek dosyalı sade biçim; özyineleme, --include/--exclude ve tanınmayan her uzun seçenek yasak.
const SADE = new Set([
  'ls', 'pwd', 'cat', 'head', 'tail', 'wc', 'stat', 'file', 'du', 'df', 'date', 'which', 'basename', 'dirname',
  'realpath', 'readlink', 'echo', 'printf', 'true', 'false', 'test', '[', 'cd', 'cut', 'tr', 'cmp',
  'sha256sum', 'md5sum', 'tree', 'grep', 'egrep', 'fgrep', 'sort', 'jq',
])

// grep'in kabul edilen uzun seçenekleri TAM ADLARIYLA (kısaltma ve bilinmeyen ad yasak). --file ve --include/--exclude* yok.
const GREP_UZUN_IZIN = new Set([
  'ignore-case', 'line-number', 'count', 'files-with-matches', 'files-without-match', 'invert-match', 'no-filename',
  'with-filename', 'fixed-strings', 'extended-regexp', 'word-regexp', 'line-regexp', 'only-matching', 'quiet', 'silent',
  'no-messages', 'text', 'regexp', 'max-count', 'after-context', 'before-context', 'context', 'color', 'colour',
])

/** grep: özyineleme (-r -R -d -D ve her kısa kümedeki r/R/d/D) ve izinsiz uzun seçenek yasak. */
function grepSade(geri) {
  for (const a of geri) {
    if (a === '--') break
    if (a.startsWith('--')) {
      if (!GREP_UZUN_IZIN.has(a.slice(2).split('=')[0])) return false
      continue
    }
    if (a.startsWith('-') && a.length > 1 && /[rRdD]/.test(a)) return false
  }
  return true
}

function sadeOkuma(args) {
  const ad = args[0]
  const geri = args.slice(1)
  // sort: yalnız sade sıralama bayrakları; --compress-program, -T, -o, --output komut çalıştırır ya da dosya yazar.
  if (ad === 'sort' && !geri.every((a) => !a.startsWith('-') || /^-[nruf]+$/.test(a))) return false
  if (ad === 'date' && geri.some((a) => a === '-s' || a === '--set' || /^--set=/.test(a))) return false
  if (ad === 'tail' && geri.some((a) => a === '-f' || a === '-F' || a === '--follow' || /^--follow=/.test(a))) return false
  if ((ad === 'grep' || ad === 'egrep' || ad === 'fgrep') && !grepSade(geri)) return false
  if (ad === 'jq' && geri.some((a) => /\benv\b|\$ENV|input_filename/.test(a))) return false
  if (ad === 'tree' && geri.some((a) => a === '-o')) return false
  // cd ~/.claude (ya da glob/8.3 ad) sonraki parçadaki `cat ops*` gibi yol-bağlamsız argümanı anahtar dosyasına çevirir
  // (güvenlik taraması 19 Ekim); bu biçimde cd otomatik izin almaz.
  if (ad === 'cd' && geri.some((a) => /\.claude|\.cl[*?[]|~\d|[*?[]/i.test(a))) return false
  // file -C magic.mgc yazar; uniq çıkış dosyası alır (listeden çıktı); curl -w/--write-out %output{dosya} yazar (listeden çıktı).
  if (ad === 'file' && geri.some((a) => /^-[^-]*C/.test(a) || (a.startsWith('--') && a !== '--'))) return false
  return true
}

const GIT_ALT = new Set([
  'status', 'log', 'diff', 'show', 'rev-parse', 'ls-files', 'ls-tree', 'blame', 'describe', 'rev-list', 'shortlog',
  'show-ref', 'cat-file', 'merge-base', 'diff-tree', 'name-rev', 'grep', 'count-objects', 'whatchanged',
])
// ls-remote listede YOK: --upload-pack=<komut> ile komut çalıştırabilir ve ağa çıkar (güvenlik taraması, #1997).
// Program çalıştıran ya da işaretli dosya dışına bakan seçenekler her alt komutta yasak.
const GIT_YASAK = [
  'output', 'ext-diff', 'textconv', 'filters', 'open-files-in-pager', 'exec-path', 'exec', 'upload-pack',
  'receive-pack', 'no-index', 'untracked', 'no-exclude-standard', 'paginate',
]
/**
 * Uzun seçenek yasak bir adın KENDİSİ ya da ÖNEKİ ise true (git ve rg tek anlamlı kısaltmaları kabul eder:
 * `--outp`, `--ext`, `--upload`, `--hid`). Eşit uzunlukta ya da kısa her önek yasak sayılır; false-deny kabul edilir.
 */
function uzunSecenekYasakMi(a, yasak) {
  if (!String(a).startsWith('--') || a === '--') return false
  const ad = a.slice(2).split('=')[0]
  if (!ad) return false
  return yasak.some((f) => f.startsWith(ad)) || /(program|pack)$/.test(ad)
}
const GIT_BRANCH_YAZAN = new Set(['-d', '-D', '-m', '-M', '-c', '-C', '-u', '-f', '--delete', '--move', '--copy', '--set-upstream-to', '--unset-upstream', '--edit-description', '--force'])

function gitOkuma(args) {
  let i = 1
  while (i < args.length && args[i].startsWith('-')) {
    if (args[i] === '-C') i += 2
    else if (args[i] === '--no-pager' || args[i] === '--no-optional-locks') i += 1
    else return false
  }
  const alt = args[i]
  const geri = args.slice(i + 1)
  if (!alt) return false
  if (geri.some((a) => uzunSecenekYasakMi(a, GIT_YASAK) || a === '-O' || /^-O./.test(a))) return false
  // Pathspec sihri (:(glob)**/.env* vb.) git'in kendi genişletmesidir; tırnaklı olsa da yasak.
  if (geri.some((a) => /:\(/.test(a))) return false
  if (GIT_ALT.has(alt)) return true
  if (alt === 'branch') {
    if (geri.some((a) => GIT_BRANCH_YAZAN.has(a))) return false
    const bayrakDisi = geri.filter((a) => !a.startsWith('-'))
    if (!bayrakDisi.length) return true
    return geri.some((a) => /^(--list|-l|--contains|--merged|--no-merged|--points-at)/.test(a))
  }
  if (alt === 'tag') return !geri.some((a) => /^(-d|-f|-a|-s|-m|--delete|--force)/.test(a)) && (geri.length === 0 || geri.some((a) => a === '-l' || a === '--list'))
  if (alt === 'remote') return geri.length === 0 || geri.every((a) => a === '-v' || a === '--verbose') || (geri[0] === 'get-url' && geri.length === 2)
  if (alt === 'stash') return geri[0] === 'list' || geri[0] === 'show'
  if (alt === 'worktree') return geri[0] === 'list'
  if (alt === 'reflog') return geri.length === 0 || geri[0] === 'show'
  return false
}

const GH_ALT = {
  pr: new Set(['view', 'list', 'diff', 'checks', 'status']),
  run: new Set(['list', 'view']),
  issue: new Set(['list', 'view']),
  release: new Set(['list', 'view']),
  repo: new Set(['view']),
  auth: new Set(['status']),
}

function ghOkuma(args) {
  const geri = args.slice(1)
  if (geri.some((a) => a === '--web' || a === '-w')) return false
  // gh auth status --show-token oturum anahtarını basar.
  if (geri[0] === 'auth' && geri.some((a) => a === '-t' || a === '--show-token')) return false
  if (geri[0] === 'api') {
    const r = geri.slice(1)
    const DEGERLI = new Set(['-H', '--header', '--jq', '-q', '--cache', '--template', '-t'])
    const BOOL = new Set(['--paginate', '--slurp', '-i', '--include', '--silent'])
    let uc = 0
    for (let i = 0; i < r.length; i += 1) {
      const a = r[i]
      const sonraki = String(r[i + 1] || '')
      if (a === '-X' || a === '--method') {
        if (sonraki.toUpperCase() !== 'GET') return false
        i += 1
        continue
      }
      if (/^--method=/.test(a)) {
        if (a.slice(9).toUpperCase() !== 'GET') return false
        continue
      }
      if (/^-X=?./.test(a)) {
        if (a.replace(/^-X=?/, '').toUpperCase() !== 'GET') return false
        continue
      }
      if (DEGERLI.has(a)) {
        // @dosya değeri yerel dosyayı okutur; jq süzgeci ortamı sızdırabilir.
        if (sonraki.startsWith('@') || sonraki.startsWith('<')) return false
        if ((a === '--jq' || a === '-q') && /\benv\b|\$ENV|input_filename/.test(sonraki)) return false
        i += 1
        continue
      }
      if (/^--(header|jq|cache|template)=/.test(a)) {
        if (/=[@<]/.test(a)) return false
        continue
      }
      if (BOOL.has(a)) continue
      // Tanınmayan her bayrak: allow VERİLMEZ (yazan alanlar -f/-F/--field/--input dahil).
      if (a.startsWith('-')) return false
      uc += 1
    }
    return uc >= 1
  }
  const set = GH_ALT[geri[0]]
  return Boolean(set && set.has(geri[1]))
}

// -L / --location BİLEREK yok: yönlendirme zinciri özel adrese (169.254.169.254, localhost) sıçrayabilir (SSRF, #1997).
const CURL_BOOL = /^-[sSIifk46]+$/
const CURL_UZUN_BOOL = new Set(['--silent', '--show-error', '--head', '--include', '--fail', '--compressed', '--insecure', '--fail-with-body'])
const CURL_DEGERLI = new Set(['-m', '--max-time', '--connect-timeout', '-A', '--user-agent', '-H', '--header', '--retry', '--retry-delay'])

function ozelHostMu(host) {
  const h = String(host).toLowerCase().replace(/^\[|\]$/g, '')
  if (!h || h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return true
  // Her IPv6 sabit adresi reddedilir (::ffff:7f00:1 gibi IPv4-eşlemeli ve özel aralıklar dahil); ondalık/onaltılık IPv4
  // biçimlerini URL ayrıştırıcısı zaten 127.0.0.1 biçimine çevirir.
  if (h.includes(':')) return true
  if (h === '0.0.0.0') return true
  const m = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(h)
  if (m) {
    const a = Number(m[1])
    const b = Number(m[2])
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
  }
  return false
}

function curlOkuma(args) {
  const r = args.slice(1)
  let url = 0
  for (let i = 0; i < r.length; i += 1) {
    const a = r[i]
    if (a === '-o' || a === '--output') {
      if (r[i + 1] !== '/dev/null') return false
      i += 1
      continue
    }
    if (a === '-X' || a === '--request') {
      if (String(r[i + 1] || '').toUpperCase() !== 'GET') return false
      i += 1
      continue
    }
    if (/^-X./.test(a)) {
      if (a.slice(2).toUpperCase() !== 'GET') return false
      continue
    }
    if (a === '--url') {
      if (!urlTamam(r[i + 1])) return false
      url += 1
      i += 1
      continue
    }
    if (CURL_DEGERLI.has(a)) {
      // -H @dosya / -w @dosya yerel dosyayı okutup sunucuya gönderir ya da basar: @ ve < ile başlayan değer reddedilir.
      if (/^[@<]/.test(String(r[i + 1] || ''))) return false
      i += 1
      continue
    }
    if (/^--(max-time|connect-timeout|user-agent|header|retry|retry-delay)=/.test(a)) {
      if (/=[@<]/.test(a)) return false
      continue
    }
    if (CURL_UZUN_BOOL.has(a) || CURL_BOOL.test(a)) continue
    if (a.startsWith('-')) return false
    if (!urlTamam(a)) return false
    url += 1
  }
  return url > 0
}

function urlTamam(u) {
  try {
    if (!/^https?:\/\//i.test(String(u))) return false
    // curl URL globbing: {a,b} ve [1-3] tek komutta birçok istek üretir (host listesi dahil) — hiç kabul edilmez.
    if (/[{}[\]]/.test(String(u))) return false
    const p = new URL(u)
    if (p.username || p.password) return false
    return !ozelHostMu(p.hostname)
  } catch {
    return false
  }
}

function npmOkuma(args) {
  if (args[0] === 'npm') return args[1] === 'view' || args[1] === 'ls' || args[1] === 'list'
  return args[1] === 'ls' || args[1] === 'list' || args[1] === 'why'
}

function nodeOkuma(args) {
  return args.length === 3 && args[1] === '--check' && !args[2].startsWith('-')
}

/** Tek bir komut parçası (args) salt-okuma mı. */
function parcaOkumaMi(args) {
  const ad = args[0]
  // URL'ler dosya yolu değildir (uzak adres yerel dosyayı okutmaz); yalnız yerel yol benzeri argümanlar denetlenir.
  const globlu = args.globlu || []
  // Güvenlik taraması 19 Ekim: ~/.claude içine uzanan tırnaksız glob (ops-yazim-onay?.txt, ops*) ve Windows 8.3 kısa adı (OPS-YA~1.TXT)
  // ad desenini atlatır; bu iki biçim otomatik izin almaz (normal izin sorusuna düşer).
  const claudeGlobu = (a, k) => globlu[k] && /\.claude/i.test(a)
  const kisaAd = (a) => /~\d/.test(a)
  if (args.some((a, k) => !/^https?:\/\//i.test(a) && (claudeGlobu(a, k) || kisaAd(a)))) {
    return { okuma: false, sebep: 'glob ile ~/.claude yolu ya da 8.3 kısa ad: ' + ad }
  }
  if (args.some((a, k) => !/^https?:\/\//i.test(a) && (hassasMi(a) || (globlu[k] && globHassasMi(a))))) {
    return { okuma: false, sebep: 'hassas dosya yolu ya da glob: ' + ad }
  }
  let ok = false
  if (SADE.has(ad)) ok = sadeOkuma(args)
  else if (ad === 'git') ok = gitOkuma(args)
  else if (ad === 'gh') ok = ghOkuma(args)
  else if (ad === 'curl') ok = curlOkuma(args)
  else if (ad === 'npm' || ad === 'pnpm') ok = npmOkuma(args)
  else if (ad === 'node') ok = nodeOkuma(args)
  return ok ? { okuma: true } : { okuma: false, sebep: 'salt-okuma listesinde değil: ' + [ad, args[1]].filter(Boolean).join(' ') }
}

/** Komut bütünüyle salt-okuma mı. Dönüş { karar: 'allow'|'deny', sebep }. */
function siniflandir(komut) {
  const r = ayristir(komut)
  if (r.hata) return { karar: 'deny', sebep: 'ayrıştırılamadı: ' + r.hata }
  for (const p of r.parcalar) {
    const k = parcaOkumaMi(p)
    if (!k.okuma) return { karar: 'deny', sebep: k.sebep }
  }
  return { karar: 'allow', sebep: 'tüm parçalar salt-okuma (' + r.parcalar.length + ' parça)' }
}

// ───────────────────────── kayıt ─────────────────────────

// Kayıt dosyasına sır yazmamak için çok desenli maske (güvenlik taraması #1997): anahtar önekleri, başlıklar, -u kullanıcı:parola,
// URL kullanıcı bilgisi, bulut/slack anahtarları.
const GIZLI_DESENLER = [
  /gh[pousr]_[A-Za-z0-9]{20,}/g,
  /sk-[A-Za-z0-9_-]{16,}/g,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /xox[abprs]-[A-Za-z0-9-]{10,}/g,
  /(?:token|key|secret|password|passwd|pwd)=[^\s&"']+/gi,
  /\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{6,}/gi,
  /\b(?:authorization|x-api-key|cookie|x-auth-token)\s*[:=]\s*[^\n"']+/gi,
  /(?:^|\s)(?:-u|--user)\s+\S+/g,
  /\/\/[^/\s:@]+:[^/\s@]+@/g,
]
const gizle = (m) => GIZLI_DESENLER.reduce((s, d) => s.replace(d, '[GIZLI]'), String(m))

function kayitDizini() {
  return process.env.IZIN_KAYIT_DIZINI || path.join(os.homedir(), '.claude', 'izin-kayit')
}

function kayitYaz(satir) {
  try {
    const d = kayitDizini()
    fs.mkdirSync(d, { recursive: true })
    const gun = new Date().toISOString().slice(0, 10)
    fs.appendFileSync(path.join(d, gun + '.jsonl'), JSON.stringify(satir) + '\n')
  } catch {
    // kayıt hatası kararı etkilemez
  }
}

function pencereAdi(girdi) {
  try {
    const kok = path.join(__dirname, '..', '..', 'scripts', 'board')
    const pk = require(path.join(kok, 'pencere-kimligi.cjs'))
    return pk.rolAdi(pk.agentAdi({ cwd: girdi.cwd, agentType: girdi.agent_type })) || path.basename(String(girdi.cwd || ''))
  } catch {
    return path.basename(String(girdi.cwd || ''))
  }
}

function opsMu(girdi) {
  try {
    const o = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'ops-oturumu.cjs'))
    return Boolean(o.kimlikMi(girdi.session_id) || o.opsAdayiMi({ cwd: girdi.cwd, agentType: girdi.agent_type }))
  } catch {
    return false
  }
}

const RED_MESAJI =
  "Recep'e izin sorusu düşmez. Komutu değişkensiz, zincirsiz tek tek koş; gerçekten izin gereken bir iş ise OPS'a SendMessage ile yaz."

// ───────────────────────── giriş ─────────────────────────

function main() {
  let girdi
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    process.exit(0)
  }
  try {
    if (String(girdi.tool_name || '') !== 'Bash') process.exit(0)
    const komut = String((girdi.tool_input || {}).command || '')
    const satir = {
      t: new Date().toISOString(),
      sid: String(girdi.session_id || '').slice(0, 36),
      pencere: pencereAdi(girdi),
      kip: girdi.permission_mode || null,
      komut: gizle(komut).slice(0, 400),
    }
    if (opsMu(girdi)) {
      kayitYaz({ ...satir, karar: 'muaf', sebep: 'OPS penceresi' })
      process.exit(0)
    }
    const k = siniflandir(komut)
    kayitYaz({ ...satir, karar: k.karar, sebep: k.sebep })
    const decision = k.karar === 'allow' ? { behavior: 'allow' } : { behavior: 'deny', message: RED_MESAJI, interrupt: false }
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PermissionRequest', decision } }))
    process.exit(0)
  } catch {
    process.exit(0)
  }
}

module.exports = { ayristir, siniflandir, parcaOkumaMi, kayitDizini, RED_MESAJI }
if (require.main === module) main()
