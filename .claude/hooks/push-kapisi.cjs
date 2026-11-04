#!/usr/bin/env node
'use strict'

/**
 * PUSH KAPISI — PreToolUse(Bash): `git push` komutunu AYRIŞTIRARAK denetler (ARC-171, #1988 güvenlik incelemesi).
 *
 * NİÇİN: settings.json deny satırları ham desendir (`git push * master*`); refspec ayrıştırmaz
 * (`git push origin HEAD:refs/heads/ma*`, `git push origin feat:master`, `git -C <başka depo> push` gibi biçimleri
 * desenler kaçırır). GitHub master koruması (PR zorunlu, force push kapalı) esas güvencedir; bu kanca ikinci katmandır
 * ve yanlışı komut koşmadan, sebebiyle söyler. deny satırları üçüncü katman olarak kalır.
 *
 * İZİN (tek biçim): `git push [-u|--set-upstream] [-n] [--no-verify] <uzak-ad> [<dal> | HEAD | <kaynak>:<hedef-dal>]...`
 * REDDEDİLEN:
 *  · hedef dal master/main (düz ad, `refs/heads/` önekli, `kaynak:master`, `HEAD:main`);
 *  · --force, -f, --force-with-lease, --force-if-includes, +refspec, --delete, -d, `:dal` (silme), --mirror, --all, --prune;
 *  · uzak ad yerine adres (https://..., git@..., yol): yalnız adlı uzak (origin) geçer;
 *  · refspec yok ya da `HEAD` iken MEVCUT dal master/main ise;
 *  · `git -C <yol>` yolu bir git deposu değilse (kardeş depo dahil HER git deposu serbest; kurallar o deponun dalında uygulanır);
 *    `cd X && git push` zincirinde mevcut dal X'te ölçülür.
 * Zincirler (`&&`, `;`, `|`, satır sonu), `bash -c "..."` ve `eval` içi de taranır. Çözülemeyen biçim → fail-open (geçer).
 *
 * Güvenlik: salt-okuma (yalnız `git rev-parse` çağırır), fail-open, vana `VENTHUB_PUSH_KAPISI_KAPAT=1`.
 * settings.json PreToolUse(Bash) kaydı OPS kapısıdır.
 */

const path = require('node:path')
const { spawnSync } = require('node:child_process')

const KORUNAN = new Set(['master', 'main'])
const YASAK_BAYRAK = new Set([
  '--force', '-f', '--force-with-lease', '--force-if-includes', '--delete', '-d', '--mirror', '--all', '--prune', '--tags-delete',
])
const IZINLI_BAYRAK = new Set(['-u', '--set-upstream', '-n', '--dry-run', '--no-verify', '--verify', '-q', '--quiet', '-v', '--verbose', '--tags', '--no-tags', '--follow-tags', '--progress', '--porcelain'])
const SARMALAYICI = new Set(['command', 'exec', 'nohup', 'time', 'builtin', 'env', 'sudo', 'nice', 'ionice', 'xargs', 'setsid', 'stdbuf', 'timeout'])
const KABUKLAR = new Set(['bash', 'sh', 'zsh', 'dash', 'pwsh', 'powershell', 'cmd'])
const ATAMA = /^[A-Za-z_][A-Za-z0-9_]*=/

/** Komut adı: yol ve .exe atılır, küçük harf (`/usr/bin/GIT.exe` → `git`). */
const komutAdi = (x) => path.basename(String(x)).replace(/\.exe$/i, '').toLowerCase()

/** Baştaki atama/sarmalayıcıları (ve sarmalayıcının kendi bayraklarını) atlayıp asıl komutun dizinini döner; yoksa -1. */
function asilKomut(t) {
  let i = 0
  while (i < t.length) {
    if (ATAMA.test(t[i])) i++
    else if (SARMALAYICI.has(komutAdi(t[i]))) {
      // Sarmalayıcıların bayrak sözdizimi (timeout SÜRE, nice -n N, sudo -u KULLANICI ...) tek tek modellenmez:
      // sarmalayıcıdan sonra ilk `git` tokenına atlanır (yoksa asıl komut sarmalayıcıdan sonraki ilk bayraksız token).
      const sonraki = t.findIndex((x, k) => k > i && komutAdi(x) === 'git')
      if (sonraki >= 0) return sonraki
      i++
      while (i < t.length && t[i].startsWith('-')) i++
    } else break
  }
  return i < t.length ? i : -1
}

/** Git davranışını ortamdan değiştiren değişkenler (inline atama ya da export): push varken fail-closed. */
const GIT_ORTAM = /^(?:export\s+)?GIT_(?:CONFIG_PARAMETERS|CONFIG_COUNT|CONFIG_KEY_\d+|CONFIG_VALUE_\d+|CONFIG_GLOBAL|CONFIG_SYSTEM|DIR|EXEC_PATH|NAMESPACE|WORK_TREE|SSH_COMMAND)=/
/** `-c anahtar=değer` için tek serbest küme: görünüm ve kimlik adı. core.pager yalnız `cat` (başka pager komut çalıştırır). */
const ZARARSIZ_ANAHTAR = /^(?:core\.quotepath=|color\.[a-z.]+=|advice\.[a-z.]+=|core\.pager=cat$|user\.(?:name|email)=|log\.[a-z.]+=|diff\.renames=)/i

/** Tırnakları koruyarak komutu operatörlerden (&&, ||, ;, |, &, satır sonu) bölüp parçaları token dizilerine çevirir. */
function parcala(komut) {
  const parcalar = []
  let tokenlar = []
  let jeton = ''
  let jetonVar = false
  let tirnak = null
  const jetonuKapat = () => {
    if (jetonVar) tokenlar.push(jeton)
    jeton = ''
    jetonVar = false
  }
  const parcayiKapat = () => {
    jetonuKapat()
    if (tokenlar.length) parcalar.push(tokenlar)
    tokenlar = []
  }
  for (let i = 0; i < komut.length; i++) {
    const c = komut[i]
    if (tirnak) {
      if (c === tirnak) tirnak = null
      else if (c === '\\' && tirnak === '"' && i + 1 < komut.length) jeton += komut[++i]
      else jeton += c
      continue
    }
    if (c === "'" || c === '"') {
      tirnak = c
      jetonVar = true
    } else if (c === '\\' && i + 1 < komut.length) {
      jeton += komut[++i]
      jetonVar = true
    } else if (c === ' ' || c === '\t') jetonuKapat()
    else if (c === '\n' || c === ';' || c === '|' || c === '&' || c === '(' || c === ')' || c === '`') parcayiKapat()
    else {
      jeton += c
      jetonVar = true
    }
  }
  parcayiKapat()
  return parcalar
}

/**
 * Hedef dal adını git'in çözdüğü gibi sadeleştirir: `refs/heads/x`, `heads/x` → `x`; `@` = HEAD.
 * `refs/` ile başlayan ve refs/heads/ olmayan hedef (refs/tags, refs/remotes, refs/for ...) ayrıca reddedilir (hedefDurumu).
 */
function dalAdi(hedef) {
  return String(hedef).replace(/^refs\/heads\//, '').replace(/^heads\//, '')
}
const hedefRefsDisi = (h) => /^refs\//.test(h) && !/^refs\/heads\//.test(h)

/**
 * Bir parçadan (token dizisi) push varsa { c: -C yolu zinciri, args } ya da { yasak } döner; yoksa null.
 * Baştaki atamalar/sarmalayıcılar atlanır. git'in global seçeneklerinden yalnız -C (art arda çözülür) serbest;
 * -c, --git-dir, --work-tree, --namespace, --exec-path, --config-env push hedefini ya da kancayı değiştirebilir → reddedilir.
 */
function pushBul(t) {
  let i = asilKomut(t)
  if (i < 0 || komutAdi(t[i]) !== 'git') return null
  i++
  const yollar = []
  while (i < t.length) {
    if (t[i] === '-C' && i + 1 < t.length) {
      yollar.push(t[i + 1])
      i += 2
    } else if (t[i] === '-c' && i + 1 < t.length && ZARARSIZ_ANAHTAR.test(t[i + 1])) {
      // Yalnız zararsız (görünüm/ad) anahtarlar serbest; komut çalıştıran ya da hedef/alias değiştiren anahtar aşağıda reddedilir.
      i += 2
    } else if (t[i] === '-c' || /^--(git-dir|work-tree|namespace|exec-path|config-env)(=|$)/.test(t[i]) || /^-c./.test(t[i])) {
      // Fail-closed: zararsız listede olmayan yapılandırma/hedef seçeneği (core.fsmonitor, core.sshCommand, alias.*, remote.*,
      // credential.helper, core.hooksPath ...) komut çalıştırabilir ya da push'u gizleyebilir → reddedilir. Alt komut ne olursa olsun.
      const degerli = t[i] === '-c' || /^--(git-dir|work-tree|namespace|exec-path|config-env)$/.test(t[i])
      let k = i + (degerli ? 2 : 1)
      while (k < t.length && t[k].startsWith('-') && t[k] !== '-C') k += t[k] === '-c' ? 2 : 1
      return { yasak: `git global seçeneği ${t[i]}${degerli && t[i + 1] ? ' ' + t[i + 1] : ''}: komut çalıştırabilir ya da push hedefini/alias'ı gizleyebilir; seçeneksiz yaz (serbest: core.quotepath, color.*, advice.*, core.pager=cat, user.name/email)` }
    } else if (/^-/.test(t[i])) i++
    else break
  }
  if (t[i] !== 'push') return null
  return { c: yollar, args: t.slice(i + 1) }
}

/**
 * Saf karar. girdi: komut metni. o: { cwd, mevcutDal(cwd)->string|null, gitDeposu(yol)->boolean (varsayılan: git rev-parse) }.
 * Dönüş: null (geçer) ya da neden metni (reddedilir).
 */
function degerlendir(komut, o) {
  const parcalar = parcala(String(komut || ''))
  // Tırnaklı yük da tek token olur ("git push origin master"): git sözcüğü token içinde de aranır.
  const gitGecer = (x) => komutAdi(x) === 'git' || /(^|[\s/\\])git(\.exe)?(\s|$)/i.test(x)
  const gitPushVar = parcalar.some((t) => t.some(gitGecer) && t.some((x) => x.includes('push')))
  // Ortamdan git yapılandırması (inline ya da export): komutta bir git push varken fail-closed.
  if (gitPushVar && parcalar.some((t) => t.some((x, k) => GIT_ORTAM.test(x) || (komutAdi(x) === 'export' && GIT_ORTAM.test('export ' + (t[k + 1] || '')))))) {
    return 'GIT_CONFIG_*/GIT_DIR/GIT_EXEC_PATH/GIT_NAMESPACE/GIT_SSH_COMMAND ortam değişkeni push hedefini/yapılandırmasını değiştirebilir; değişkensiz yaz'
  }
  // `cd X && git push` biçimi: çalışma klasörü zincir boyunca izlenir; mevcut dal (HEAD/argümansız push denetimi) ve göreli
  // -C yolları X'e göre çözülür. SINIR: alt kabuk `( cd X ... )` kapsamı ayrılmaz (cd sonraki parçalara sızar, konservatif);
  // `cd` argümansız ya da `cd -` ise klasör değişmedi sayılır.
  let cwd = o.cwd
  for (const t of parcalar) {
    // xargs ve env -S: argümanlar statik görülemez → git ve push birlikte geçiyorsa fail-closed
    const tGitPush = t.some(gitGecer) && t.some((x) => x.includes('push'))
    if (tGitPush && t.some((x) => komutAdi(x) === 'xargs')) return 'xargs ile git push: argümanlar önceden bilinemez; push\'u doğrudan yaz'
    if (tGitPush && t.some((x) => x === '-S' || x === '--split-string' || /^-S./.test(x))) return 'env -S ile git push: komut dizgesi önceden bilinemez; push\'u doğrudan yaz'
    // bash -c "..." / eval "..." / pwsh -Command "..." / cmd /c "..." içini de tara
    const ilk = asilKomut(t)
    const ad = ilk >= 0 ? komutAdi(t[ilk]) : ''
    const oo = { ...o, cwd }
    if (ad === 'cd' && t[ilk + 1] && !t[ilk + 1].startsWith('-')) cwd = path.resolve(cwd, t[ilk + 1])
    if (KABUKLAR.has(ad)) {
      if (t.some((x, k) => k > ilk && /^-(e|ec|enc|encodedcommand)$/i.test(x))) return 'kodlanmış kabuk komutu (-EncodedCommand): içerik denetlenemez; düz yaz'
      const ci = t.findIndex((x, k) => k > ilk && (/^-[a-z]*c[a-z]*$/i.test(x) || /^\/c$/i.test(x) || /^-command$/i.test(x)))
      if (ci >= 0 && t[ci + 1]) {
        const yuk = t.slice(ci + 1).join(' ')
        if (/git/i.test(yuk) && /push/i.test(yuk) && /[$%^`]/.test(yuk)) return 'kabuk komutunda genişletme ($, %, ^) git push ile birlikte: hedef önceden bilinemez; dal adını açık yaz'
        const ic = degerlendir(yuk, oo)
        if (ic) return ic
      }
    } else if (ad === 'eval') {
      const ic = degerlendir(t.slice(ilk + 1).join(' '), oo)
      if (ic) return ic
    }
    // Fail-closed: parçadaki HER `git` tokeni aday komut başlangıcıdır (sarmalayıcıların bayrak sözdizimi modellenmez);
    // hiçbiri master/main'e, force ile ya da dışarıya push yapmamalı.
    for (let k = 0; k < t.length; k++) {
      if (komutAdi(t[k]) !== 'git') continue
      const p = pushBul(t.slice(k))
      if (!p) continue
      if (p.yasak) return p.yasak
      const neden = pushDegerlendir(p, oo)
      if (neden) return neden
    }
  }
  return null
}

function pushDegerlendir({ c, args }, o) {
  let cwd = o.cwd
  if (c.length > 0) {
    // art arda -C değerleri git gibi birikir: her biri öncekine göre çözülür, SON yol denetlenir.
    // OPS kararı (4 Kasım, #2252): -C yolu HERHANGİ bir git deposu olabilir (kardeş depo venthub-pdf-ingestor dahil);
    // kurallar (master/main, force, silme) O deponun dalında uygulanır. Git deposu olmayan yol reddedilir.
    const cozulen = c.reduce((onceki, y) => path.resolve(onceki, y), o.cwd)
    const depoMu = o.gitDeposu || ((y) => git(y, 'rev-parse', '--git-dir') !== null)
    if (!depoMu(cozulen)) return `git -C ${c.join(' -C ')}: yol bir git deposu değil; push yalnız bir git deposundan yapılır`
    cwd = cozulen
  }
  const konumsal = []
  for (const a of args) {
    if (YASAK_BAYRAK.has(a) || /^--force/.test(a) || /^--delete/.test(a) || /^--mirror/.test(a)) return `yasak bayrak ${a} (zorla/silme/toplu push)`
    if (/^-[A-Za-z]{2,}$/.test(a) && /[fd]/.test(a.slice(1)) && !/^--/.test(a)) return `birleşik bayrak ${a} force/delete içeriyor olabilir; bayrakları ayrı yaz (-u)`
    if (a.startsWith('-')) {
      if (!IZINLI_BAYRAK.has(a) && !/^--(receive-pack|exec|repo|push-option|signed|recurse-submodules|thin|atomic)(=|$)/.test(a)) return `tanınmayan push bayrağı ${a}; izinli biçim: git push [-u] <uzak-ad> <dal>`
      if (/^--(receive-pack|exec|repo)(=|$)/.test(a)) return `bayrak ${a} push hedefini değiştirir`
      continue
    }
    konumsal.push(a)
  }
  const uzak = konumsal[0]
  const refspecler = konumsal.slice(1)
  if (uzak !== undefined && !/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(uzak)) return `uzak '${uzak}' adlı bir uzak değil (adres/yol); yalnız adlı uzak (origin) geçer`
  let mevcut
  const mevcutAl = () => {
    if (mevcut === undefined) mevcut = o.mevcutDal ? o.mevcutDal(cwd) : null
    return mevcut
  }
  if (refspecler.length === 0) {
    const d = mevcutAl()
    if (d && KORUNAN.has(d)) return `refspec yok ve mevcut dal ${d}: master/main'e doğrudan push yok; önce dal aç`
    return null
  }
  for (const r of refspecler) {
    if (r.startsWith('+')) return `${r}: + öneki force demektir`
    if (r.startsWith(':')) return `${r}: boş kaynak uzaktaki dalı siler`
    const i = r.indexOf(':')
    const kaynak = i >= 0 ? r.slice(0, i) : r
    const hedef = i >= 0 ? r.slice(i + 1) : r
    if (i >= 0 && hedef === '') return `${r}: boş hedef`
    if (KORUNAN.has(dalAdi(hedef))) return `${r}: hedef ${dalAdi(hedef)} korunan dal; PR ile birleşir`
    // refs/heads/ dışındaki tam ad (refs/tags, refs/remotes, refs/for ...) ve joker/özel karakter: dal adını açık yaz
    if (hedefRefsDisi(hedef)) return `${r}: hedef refs/heads/ dışında; yalnız dal adı ya da refs/heads/<dal> yazılır`
    if (/[*?[\]{}~^]/.test(hedef)) return `${r}: hedefte joker/özel karakter; dal adını açık yaz`
    // HEAD ve @ aynı şeydir; kaynak ya da hedef olarak mevcut dalı gösterir
    const basKaynak = /^(HEAD|@)$/.test(kaynak) || /^(HEAD|@)$/.test(hedef)
    if (basKaynak) {
      const d = mevcutAl()
      if (d && KORUNAN.has(d)) return `${r}: HEAD/@ mevcut dal ${d}'i gösteriyor; master/main'e doğrudan push yok`
    }
  }
  return null
}

function git(cwd, ...a) {
  const r = spawnSync('git', ['-C', cwd, ...a], { encoding: 'utf8', timeout: 4000 })
  return r.status === 0 ? String(r.stdout).trim() : null
}

function mevcutDalBul(cwd) {
  return git(cwd, 'rev-parse', '--abbrev-ref', 'HEAD')
}

function deny(neden) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          '[push-kapisi] ' + neden + '. İzinli biçim: git push [-u] origin <dal-adı> (dal master/main değil). Vana: VENTHUB_PUSH_KAPISI_KAPAT=1 (yalnız OPS kararıyla).',
      },
    }),
  )
}

function main() {
  if (process.env.VENTHUB_PUSH_KAPISI_KAPAT === '1') process.exit(0)
  let raw = ''
  process.stdin.on('data', (c) => (raw += c))
  process.stdin.on('end', () => {
    try {
      const girdi = JSON.parse(raw)
      if (girdi.hook_event_name && girdi.hook_event_name !== 'PreToolUse') process.exit(0)
      if (girdi.tool_name !== 'Bash') process.exit(0)
      const komut = girdi.tool_input && girdi.tool_input.command
      // Ön süzgeç yalnız maliyet içindir: komutta "git" hiç yoksa ayrıştırma boşuna. Karar ayrıştırılmış tokenlardadır
      // (yol/.exe/sarmalayıcı/alias öncesi seçenek yakalanır; yapılandırma alias'ı kancanın göremediği bilinen sınırdır).
      if (typeof komut !== 'string' || !/git/i.test(komut)) process.exit(0)
      const cwd = girdi.cwd || process.cwd()
      const neden = degerlendir(komut, { cwd, mevcutDal: mevcutDalBul })
      if (neden) deny(neden)
    } catch (e) {
      process.stderr.write('[push-kapisi] cozulemedi (' + ((e && e.message) || 'bilinmeyen') + '), karisilmadi\n')
    }
    process.exit(0)
  })
}

module.exports = { degerlendir, parcala, pushBul }

if (require.main === module) main()
