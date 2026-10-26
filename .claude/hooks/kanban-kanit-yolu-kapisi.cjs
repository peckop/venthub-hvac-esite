#!/usr/bin/env node
'use strict'
/**
 * KANBAN KANIT KAPISI — ARC-93 (yol) + ARC-78 (komut). Kural: .claude/hooks/kanban-kanit-yolu-kapisi.md
 *
 * ── NİÇİN VAR ──
 *
 * (1) YOL (ARC-93). @wrongstack/kanban `resolveProjectPath` (dist/index.js:6208) ilk satırda `path.isAbsolute(yol)`
 * ise null döner; proje kökünün İÇİNDEKİ mutlak yol bile reddedilir. Sonuç: file_exists kanıtı dosya diskte VARKEN
 * "File not found", file_matches "Path escapes the project root" verir (URN-104, KTL-19, HRT-50'de görüldü).
 * 1.0.36 ve 1.0.37 aynı satırı taşıyor; çözüm yükseltme değil, kanıtı EKLEME ANINDA doğru yola çevirmek.
 *
 * (2) KOMUT (ARC-78, 26 Ekim 2026). Doğrulayıcı arızalı değil, güvenlik politikası bilerek dar: komut kart
 * açılırken kabul edilir ama Done anında `verify_completion` "not in the verifier allowlist" / "blocked by the
 * verifier security policy" / "Unsupported verifier command shape" ile reddeder (git, node, pnpm test:ilgili,
 * boru, mutlak yol, `test -s`). Kanıt ŞİMDİ ölçülür: doğrulayıcının kendi kuralları (dist/index.js validateCommand,
 * parseConstrainedPnpmExec ve çalıştırma şekilleri, @wrongstack/kanban 1.1.x) burada uygulanır.
 *
 * ── KARAR ──
 *
 * Matcher mcp__wrongstack-kanban__kanban_manage; action add_check/update_check.
 *  · file_exists / file_matches: yol mutlak (C:/..., /..., \\...), `~` ile başlayan ya da kökten çıkan (`..`) ise DENY.
 *    file_matches'te yol checkNotes içindeki JSON'un `file` alanıdır; JSON okunamazsa karışmaz.
 *  · command: komut doğrulayıcıda koşmayacaksa DENY ve dört geçerli kanıt biçimini söyler.
 *  · manual ve başka her çağrı sessiz geçer.
 *
 * İZİN LİSTESİ sunucuyla aynı kaynaktan: ortam değişkeni WRONGSTACK_KANBAN_VERIFIER_COMMANDS, yoksa .mcp.json
 * `wrongstack-kanban` env'i. Okunamazsa liste denetlenmez (fail-open); kesin engeller (operatör, engel listesi,
 * mutlak yol, kısıtlı pnpm exec şekli) yine uygulanır. Kurallar paketten ayrışırsa kıran test sentinel'i:
 * src/__tests__/conformance/kanban-kanit-yolu-kapisi.test.ts.
 */
const fs = require('fs')
const path = require('path')

const ARAC = 'mcp__wrongstack-kanban__kanban_manage'
const EYLEMLER = new Set(['add_check', 'update_check'])
const DOSYA_TIPLERI = new Set(['file_exists', 'file_matches'])
// Yalnız `command` komut koşar. `test` türü AYRI eklentidir (TestPlugin): gövde bir test KALIBIDIR, komut değil
// (dist/index.js "plugins/test.ts", 26 Ekim ölçümü); onu komut kuralıyla denetlemek yanlış red verirdi.
const KOMUT_TIPLERI = new Set(['command'])
const IZIN_ENV = 'WRONGSTACK_KANBAN_VERIFIER_COMMANDS'

// ── Doğrulayıcı kuralları (dist/index.js "command-security", @wrongstack/kanban 1.1.2) ──
const SHELL_OPERATOR_RE = /(?:&&|\|\||[;&<>|`\n\r]|\$[({])/
const ENV_EXPANSION_RE = /(?:\$[A-Za-z_]|%[^%\r\n]+%|![^!\r\n]+!)/
const VARSAYILAN_IZINLI = ['pwd', 'true', 'false', 'test']
const ENGELLI = [
  'rm', 'del', 'erase', 'rmdir', 'rd', 'rmtree', 'mk', 'mkdir', 'md', 'mv', 'move', 'cp', 'copy', 'xcopy', 'robocopy',
  'ren', 'rename', 'ln', 'link', 'mklink', 'install', 'touch', 'kill', 'taskkill', 'pkill', 'shutdown', 'reboot', 'halt',
  'poweroff', 'init', 'chmod', 'chown', 'chgrp', 'attrib', 'cacls', 'icacls', 'format', 'fdisk', 'dd', 'mkfs', 'mount',
  'umount', 'diskpart', 'wget', 'curl', 'fetch', 'nc', 'netcat', 'telnet', 'ssh', 'scp', 'rsync', 'ftp', 'sftp', 'sudo',
  'su', 'runas', 'doas', 'sh', 'bash', 'zsh', 'ksh', 'dash', 'ash', 'cmd', 'powershell', 'pwsh', 'apt', 'apt-get', 'dpkg',
  'rpm', 'yum', 'dnf', 'pacman', 'zypper', 'brew', 'port', 'choco', 'scoop', 'winget', 'npm', 'npx', 'pnpm', 'yarn', 'bun',
  'deno', 'node', 'make', 'cmake', 'gcc', 'g++', 'clang', 'rustc', 'tar', 'gzip', 'gunzip', 'zip', 'unzip', '7z', 'rar',
  'base64', 'base32', 'openssl', 'gpg', 'reg', 'regedit', 'sc', 'net', 'netsh', 'vssadmin', 'bcdedit', 'invoke-webrequest',
  'iwr', 'perl', 'python', 'python3', 'ruby', 'php', 'lua', 'tclsh', 'find',
]

const GECERLI_BICIMLER =
  'Geçerli kanıt biçimleri: (1) PR işi: command `gh api repos/peckop/venthub-hvac-esite/pulls/<N>/merge` (birleşmişse 204, değilse 404); ' +
  '(2) kod işi: command `pnpm exec vitest run <göreli test yolu>`; ' +
  '(3) belge/dosya işi: file_matches {"file":"<proje-göreli yol>","pattern":"..."} (64 KiB sonrasını görmez); ' +
  '(4) depo dışı iş (canlı yazım, ayar, Search Console): checkType manual + karta kanıt notu (ölçüm çıktısı, kim onayladı, ne zaman). ' +
  'git, node, pnpm test:ilgili, boru/yönlendirme ve mutlak yol doğrulayıcıda KOŞMAZ.'

function normalizeBaseCommand(token) {
  return String(token).replace(/^.*[/\\]/, '').toLowerCase().replace(/\.(?:exe|cmd|bat|com)$/i, '')
}

/** Tırnak/boşluk ayrıştırması: doğrulayıcıdaki parseCommandArguments. Hata → string. */
function parseCommandArguments(command) {
  const args = []
  let current = ''
  let quote = null
  let tokenStarted = false
  for (const char of command) {
    if (quote) {
      if (char === quote) quote = null
      else current += char
      tokenStarted = true
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      tokenStarted = true
    } else if (/\s/.test(char)) {
      if (tokenStarted) {
        args.push(current)
        current = ''
        tokenStarted = false
      }
    } else {
      current += char
      tokenStarted = true
    }
  }
  if (quote) return 'komutta kapatılmamış tırnak var'
  if (tokenStarted) args.push(current)
  return args
}

function projeGoreli(deger) {
  const n = deger.replaceAll('\\', '/')
  return n.length > 0 && !n.startsWith('-') && !n.startsWith('/') && !/^[A-Za-z]:/.test(n) && !n.split('/').includes('..') && !SHELL_OPERATOR_RE.test(n) && !ENV_EXPANSION_RE.test(n)
}

/** pnpm: yalnız `pnpm exec vitest run <*.test.*>` ve `pnpm exec tsc --noEmit --project <göreli>` geçer. null = geçer. */
function pnpmSorunu(tokens) {
  const ikinci = tokens[1] ?? ''
  if (normalizeBaseCommand(ikinci) !== 'exec' || /[/\\]/.test(ikinci)) {
    return 'pnpm doğrulayıcıda engelli; yalnız `pnpm exec vitest run <test yolu>` ve `pnpm exec tsc --noEmit --project <tsconfig>` geçer (`pnpm test:ilgili` ve `pnpm vitest` REDDEDİLİR)'
  }
  const ham = tokens[2] ?? ''
  const exe = normalizeBaseCommand(ham)
  if (ham.trim() !== ham || /[/\\]/.test(ham) || /\.(?:exe|cmd|bat|com)$/i.test(ham) || (exe !== 'tsc' && exe !== 'vitest')) {
    return '`pnpm exec` yalnız yerel tsc ve vitest çalıştırır'
  }
  const args = tokens.slice(3)
  if (exe === 'tsc') {
    return args.length === 3 && args[0] === '--noEmit' && args[1] === '--project' && projeGoreli(args[2] ?? '')
      ? null
      : '`pnpm exec tsc` tam şu biçimde olmalı: --noEmit --project <proje-göreli tsconfig>'
  }
  if (args[0] !== 'run') return '`pnpm exec vitest` için `run` alt komutu gerekir'
  let ilk = 1
  if (args[1] === '--root') {
    if (args[2] !== '.') return '`pnpm exec vitest` yalnız `--root .` kabul eder'
    ilk = 3
  }
  const yollar = args.slice(ilk)
  if (yollar.length === 0 || yollar.some((y) => !projeGoreli(y) || !/\.test\.[cm]?[jt]sx?$/i.test(y))) {
    return '`pnpm exec vitest run` bir ya da daha çok proje-göreli *.test.* yolu ister'
  }
  return null
}

/**
 * İzin listesi ek girdilerinden (ör. "+gh") izinli küme. `null` girdi = liste bilinmiyor (denetlenmez).
 * Sunucudaki buildAllowlist ile aynı: "+x"/"x" ekler, "-x" çıkarır.
 */
function izinKumesi(ekler) {
  if (ekler === null) return null
  const izin = new Set(VARSAYILAN_IZINLI.map(normalizeBaseCommand))
  for (const e of ekler) {
    if (e.startsWith('+')) izin.add(normalizeBaseCommand(e.slice(1)))
    else if (e.startsWith('-')) izin.delete(normalizeBaseCommand(e.slice(1)))
    else izin.add(normalizeBaseCommand(e))
  }
  return izin
}

/** Sunucunun okuduğu izin listesi: ortam değişkeni, yoksa .mcp.json wrongstack-kanban env. Okunamazsa null. */
function izinEkleriniOku(env = process.env, kok = env.CLAUDE_PROJECT_DIR || process.cwd()) {
  const ayir = (ham) => String(ham).split(',').map((x) => x.trim()).filter(Boolean)
  if (env[IZIN_ENV] !== undefined && String(env[IZIN_ENV]).trim() !== '') return ayir(env[IZIN_ENV])
  try {
    const j = JSON.parse(fs.readFileSync(path.join(kok, '.mcp.json'), 'utf8'))
    const e = j && j.mcpServers && j.mcpServers['wrongstack-kanban'] && j.mcpServers['wrongstack-kanban'].env
    return e && e[IZIN_ENV] ? ayir(e[IZIN_ENV]) : []
  } catch {
    return null
  }
}

/**
 * Kanıt komutunun doğrulayıcıda koşmama sebebi; koşuyorsa null.
 * @param {string} komut
 * @param {string[]|null} ekler izin listesi ekleri (null = liste bilinmiyor)
 */
function komutSorunu(komut, ekler = izinEkleriniOku()) {
  const ham = String(komut ?? '')
  if (!ham.trim()) return null // boş: doğrulayıcı kendi hatasını verir, karışma
  const tokens = parseCommandArguments(ham)
  if (typeof tokens === 'string') return tokens
  const taban = normalizeBaseCommand(tokens[0] ?? '')
  if (!taban) return null
  if (ham.includes('\n') || ham.includes('\r')) return 'komutta satır sonu var'
  const hedef = process.platform === 'win32' ? ham.replaceAll('^', '') : ham
  if (SHELL_OPERATOR_RE.test(hedef)) return 'komutta kabuk işleci var (&&, ||, ;, |, &, >, <, ` ya da $()); tek komut, boru yok'
  if (ENV_EXPANSION_RE.test(hedef)) return 'komutta ortam değişkeni açılımı var ($VAR, %VAR%)'
  if (taban === 'pnpm') return pnpmSorunu(tokens)
  if (ENGELLI.includes(taban)) return `"${taban}" doğrulayıcı güvenlik politikasıyla ENGELLİ (izin listesine eklenemez)`
  if (/[/\\]/.test(tokens[0] ?? '')) return `"${taban}" çıplak ad olmalı; yol içeren çalıştırılabilir kabul edilmez`
  const izin = izinKumesi(ekler)
  if (izin && !izin.has(taban)) return `"${taban}" doğrulayıcı izin listesinde yok (izinli: ${[...izin].sort().join(', ')})`
  // Koşma şekilleri: pwd/true/false tek başına; `test -e|-f|-d <göreli yol>`; geri kalanı yapılandırılmış komut.
  if (['pwd', 'true', 'false'].includes(tokens[0]) && tokens.length !== 1) return `"${tokens[0]}" yalnız tek başına koşar`
  if (tokens[0] === 'test') {
    if (tokens.length !== 3 || !['-e', '-f', '-d'].includes(tokens[1])) return '`test` yalnız `test -e|-f|-d <göreli yol>` biçiminde koşar (`test -s` desteklenmez)'
    if (!projeGoreli(tokens[2])) return '`test` yolu proje-göreli olmalı'
  }
  return null
}

/** Kanıt yolunun doğrulayıcıda çalışmama sebebi; çalışıyorsa null. */
function yolSorunu(ham) {
  const yol = String(ham || '').trim()
  if (!yol) return null
  if (/^[a-zA-Z]:([\\/]|$)/.test(yol) || yol.startsWith('/') || yol.startsWith('\\')) return 'mutlak yol'
  if (yol === '~' || yol.startsWith('~/') || yol.startsWith('~\\')) return 'ev dizini (~) genişletilmez'
  const duz = path.posix.normalize(yol.replace(/\\/g, '/'))
  if (duz === '..' || duz.startsWith('../')) return 'proje kökünün dışına çıkıyor (..)'
  return null
}

/** Kontrolün dosya yolu: file_exists'te checkNotes (yoksa checkDescription), file_matches'te JSON'daki file. */
function kanitYolu(girdi) {
  const govde = String(girdi.checkNotes || girdi.checkDescription || '').trim()
  if (girdi.checkType === 'file_exists') return govde
  try {
    const j = JSON.parse(govde)
    return j && typeof j.file === 'string' ? j.file : ''
  } catch {
    return ''
  }
}

/** hook girdisi → reddetme sebebi ya da null. `ekler` testte izin listesini sabitler. */
function incele(hookGirdisi, ekler) {
  if (!hookGirdisi || hookGirdisi.tool_name !== ARAC) return null
  const g = hookGirdisi.tool_input || {}
  if (!EYLEMLER.has(g.action)) return null

  if (KOMUT_TIPLERI.has(g.checkType)) {
    const komut = String(g.checkNotes || g.checkDescription || '').trim()
    const sorun = komutSorunu(komut, ekler === undefined ? izinEkleriniOku() : ekler)
    if (!sorun) return null
    return `${g.checkType} kanıtı "${komut}" doğrulayıcıda KOŞMAZ: ${sorun}. Kart bugün kabul eder, Done anında kanıt patlar. ${GECERLI_BICIMLER}`
  }

  if (!DOSYA_TIPLERI.has(g.checkType)) return null
  const yol = kanitYolu(g)
  const sorun = yolSorunu(yol)
  if (!sorun) return null
  return (
    g.checkType +
    ' kanıtı "' +
    yol +
    '" geçmez: ' +
    sorun +
    '. Kanban doğrulayıcısı mutlak yolu kök içinde olsa bile reddeder; dosya diskte VARKEN "File not found" ya da ' +
    '"Path escapes the project root" verir. Üç çalışan yol: (1) depo içindeki dosyayı repo-göreli yaz (docs/..., tmp/...); ' +
    '(2) dosya depo dışındaysa kanıt kopyasını depo içi tmp/ altına (gitignored) koy ve onu göster, ya da manual kontrol ' +
    'yaz ve karta ls -l çıktısını not düş; (3) PR/merge kanıtı için command tipinde gh api repos/peckop/venthub-hvac-esite/pulls/<N>/merge.'
  )
}

function main() {
  let girdi = {}
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    process.exit(0)
  }
  let sebep = null
  try {
    sebep = incele(girdi)
  } catch {
    // Kapı yüzünden iş durmaz: ayrıştırılamayan girdi sessiz geçer.
  }
  if (!sebep) process.exit(0)
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: '[kanban-kanit-yolu-kapisi] ' + sebep + ' (ARC-93, ARC-78)',
      },
    }),
  )
  process.exit(0)
}

module.exports = { incele, yolSorunu, kanitYolu, komutSorunu, izinEkleriniOku, izinKumesi, ENGELLI, SHELL_OPERATOR_RE, ENV_EXPANSION_RE }
if (require.main === module) main()
