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
 *  · `git -C <yol>` yolu bu çalışma kopyasının ya da ana deponun ağacı dışındaysa.
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
const SARMALAYICI = new Set(['command', 'exec', 'nohup', 'time', 'builtin'])
const KABUKLAR = new Set(['bash', 'sh', 'zsh', 'dash'])

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

function dalAdi(hedef) {
  return String(hedef).replace(/^refs\/heads\//, '')
}

/**
 * Bir parçadan (token dizisi) push varsa { c: -C yolu | null, args } döner; yoksa null.
 * Baştaki VAR=değer atamaları ve command/exec/nohup/time atlanır; git'in -C/-c global seçenekleri okunur.
 */
function pushBul(t) {
  let i = 0
  while (i < t.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(t[i]) || SARMALAYICI.has(t[i]))) i++
  if (t[i] !== 'git') return null
  i++
  let c = null
  while (i < t.length) {
    if (t[i] === '-C' && i + 1 < t.length) {
      c = t[i + 1]
      i += 2
    } else if (t[i] === '-c' && i + 1 < t.length) i += 2
    else if (/^--(git-dir|work-tree|namespace)(=|$)/.test(t[i])) i += t[i].includes('=') ? 1 : 2
    else if (/^-/.test(t[i])) i++
    else break
  }
  if (t[i] !== 'push') return null
  return { c, args: t.slice(i + 1) }
}

/**
 * Saf karar. girdi: komut metni. o: { cwd, mevcutDal(cwd)->string|null, kokler: [mutlak yol] }.
 * Dönüş: null (geçer) ya da neden metni (reddedilir).
 */
function degerlendir(komut, o) {
  for (const t of parcala(String(komut || ''))) {
    // bash -c "..." / eval "..." içini de tara
    const ilk = t.findIndex((x) => !/^[A-Za-z_][A-Za-z0-9_]*=/.test(x) && !SARMALAYICI.has(x))
    const ad = ilk >= 0 ? path.basename(t[ilk]) : ''
    if (KABUKLAR.has(ad)) {
      const ci = t.indexOf('-c', ilk + 1)
      if (ci >= 0 && t[ci + 1]) {
        const ic = degerlendir(t[ci + 1], o)
        if (ic) return ic
      }
    } else if (ad === 'eval') {
      const ic = degerlendir(t.slice(ilk + 1).join(' '), o)
      if (ic) return ic
    }
    const p = pushBul(t)
    if (!p) continue
    const neden = pushDegerlendir(p, o)
    if (neden) return neden
  }
  return null
}

function pushDegerlendir({ c, args }, o) {
  let cwd = o.cwd
  if (c !== null) {
    const cozulen = path.resolve(o.cwd, c)
    const icinde = (o.kokler || []).some((k) => {
      const r = path.relative(k, cozulen)
      return r === '' || (!r.startsWith('..') && !path.isAbsolute(r))
    })
    if (!icinde) return `git -C ${c}: yol bu çalışma kopyasının ve ana deponun ağacı dışında; push yalnız kendi ağacından yapılır`
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
    if (i < 0 && kaynak === 'HEAD') {
      const d = mevcutAl()
      if (d && KORUNAN.has(d)) return `HEAD ve mevcut dal ${d}: master/main'e doğrudan push yok`
    }
    if (i >= 0 && kaynak === 'HEAD' && hedef === 'HEAD') {
      const d = mevcutAl()
      if (d && KORUNAN.has(d)) return `HEAD:HEAD ve mevcut dal ${d}: master/main'e doğrudan push yok`
    }
    if (/[*?[\]{}~^]/.test(hedef)) return `${r}: hedefte joker/özel karakter; dal adını açık yaz`
  }
  return null
}

function git(cwd, ...a) {
  const r = spawnSync('git', ['-C', cwd, ...a], { encoding: 'utf8', timeout: 4000 })
  return r.status === 0 ? String(r.stdout).trim() : null
}

/** -C yolunun izinli kökleri: bu çalışma kopyası + ana depo (ortak git dizininin ebeveyni, worktree'leri altında). */
function kokleriBul(cwd) {
  const kokler = new Set([path.resolve(cwd)])
  const top = git(cwd, 'rev-parse', '--show-toplevel')
  if (top) kokler.add(path.resolve(top))
  const ortak = git(cwd, 'rev-parse', '--path-format=absolute', '--git-common-dir')
  if (ortak) kokler.add(path.resolve(ortak, '..'))
  return [...kokler]
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
      if (typeof komut !== 'string' || !/\bpush\b/.test(komut)) process.exit(0)
      const cwd = girdi.cwd || process.cwd()
      const neden = degerlendir(komut, { cwd, mevcutDal: mevcutDalBul, kokler: kokleriBul(cwd) })
      if (neden) deny(neden)
    } catch (e) {
      process.stderr.write('[push-kapisi] cozulemedi (' + ((e && e.message) || 'bilinmeyen') + '), karisilmadi\n')
    }
    process.exit(0)
  })
}

module.exports = { degerlendir, parcala, pushBul }

if (require.main === module) main()
