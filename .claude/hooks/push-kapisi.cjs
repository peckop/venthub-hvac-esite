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
 * İZİN (tek biçim): `git push [-u|--set-upstream] [-n] <uzak-ad> [<dal> | HEAD | <kaynak>:<hedef-dal>]...`
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
  // ARC-277: --no-verify git pre-push katmanını (push-hedef-kapisi, depo-dökümü, kapalı-dal) atlar; 15 Ekim sonrası agent komutlarında meşru kullanım 0 ölçüldü.
  '--no-verify',
])
const IZINLI_BAYRAK = new Set(['-u', '--set-upstream', '-n', '--dry-run', '--verify', '-q', '--quiet', '-v', '--verbose', '--tags', '--no-tags', '--follow-tags', '--progress', '--porcelain'])
const SARMALAYICI = new Set(['command', 'exec', 'nohup', 'time', 'builtin', 'env', 'sudo', 'nice', 'ionice', 'xargs', 'setsid', 'stdbuf', 'timeout'])
const KABUKLAR = new Set(['bash', 'sh', 'zsh', 'dash', 'ksh', 'fish', 'busybox', 'pwsh', 'powershell', 'cmd'])
/** `#` yalnız bu kabuklarda (ve üst düzeyde) yorumdur; pwsh/cmd yüklerinde yorum atlama kapalı (gizlenen komut kalmasın). */
const YORUMLU_KABUK = new Set(['bash', 'sh', 'zsh', 'dash', 'ksh', 'fish', 'busybox'])
const ATAMA = /^[A-Za-z_][A-Za-z0-9_]*=/
/** UNC (\\sunucu\paylaşım), // ağ yolu ve \\?\ \\.\ aygıt önekleri: kanca bunlara dokunmaz (SMB/dosya sistemi erişimi tetiklenmesin). */
const AG_YOLU = (y) => /^[\\/]{2}/.test(String(y))

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

/**
 * ARC-277 (MVZ-10 yanlış pozitifi): `cat > dosya <<'E' ... arr.push(...) ... E` gövdesindeki sözcükler komut sanılıyordu.
 * TIRNAKLI sınırlayıcılı (<<'E', <<"E": genişleme yok) heredoc gövdesi, alıcı salt veri okuyorsa ve aynı satırda yorumlayıcıya
 * giden bir şey yoksa komut metninden çıkarılır. Tırnaksız sınırlayıcıda $(...) çalışır, bu yüzden gövde TARANMAYA devam eder.
 * Kapanış sınırlayıcısı yoksa gövde komutun sonuna kadar sayılır (bash gibi); yine de ayıklanır.
 */
function heredocGovdesiniAyikla(komut) {
  // Fail-closed (güvenlik incelemesi, 2 tur): ayrıştırıcı farkı doğmasın diye YALNIZ tek, basit, tam anlaşılır biçim ayıklanır:
  // komutun TAMAMI `cat|tee [> dosya] <<'E'` satırı + gövde + kapanış satırı; başka satır, komut, tırnak, boru, zincir, kaçış, genişleme yok.
  // Başka her biçimde (yürütme, zincir, ikinci heredoc, kapanışsız gövde ...) gövde taranmaya devam eder.
  // Ters eğik çizgi sınıfta YOK: `cat \<<'E'` bash'te `\<` kaçışıdır (heredoc değil), dosya adı sayılmamalı. Windows yolu / ile yazılır.
  const hedef = String.raw`(?:>>?\s*[A-Za-z0-9_./~:-]+)`
  const op = String.raw`<<(-?)(['"])([A-Za-z_][A-Za-z0-9_]*)\2`
  const bicim1 = new RegExp(String.raw`^[ \t]*(?:cat|tee)(?:[ \t]+(?:${hedef}|[A-Za-z0-9_./~:-]+))?[ \t]*${op}[ \t]*$`)
  const bicim2 = new RegExp(String.raw`^[ \t]*cat[ \t]*${op}[ \t]*${hedef}[ \t]*$`)
  const satirlar = String(komut).replace(/\r/g, '').split('\n')
  while (satirlar.length && satirlar[satirlar.length - 1].trim() === '') satirlar.pop()
  const m = bicim1.exec(satirlar[0]) || bicim2.exec(satirlar[0])
  if (!m) return String(komut)
  const [, tire, , sinirlayici] = m
  const kapanis = satirlar.length - 1
  const son = tire ? satirlar[kapanis].replace(/^\t+/, '') : satirlar[kapanis]
  // Kapanış sınırlayıcısı son satır olmalı ve gövdede BAŞKA kapanış satırı olmamalı (erken kapanıştan sonra gelen satır komuttur).
  if (kapanis < 1 || son !== sinirlayici) return String(komut)
  for (let k = 1; k < kapanis; k++) if ((tire ? satirlar[k].replace(/^\t+/, '') : satirlar[k]) === sinirlayici) return String(komut)
  return satirlar[0]
}

/** `\` + LF satır devamı mı? Evetse silinecek karakter sayısını (2), değilse 0 döner. `\` + CR + LF devam DEĞİLDİR (bash CR'yi kaçırır, LF komutu bitirir): birleştirmek bash'ten sapmak olur. */
function satirDevami(komut, i) {
  if (komut[i] !== '\\') return 0
  if (komut[i + 1] === '\n') return 2
  return 0
}

/** Tırnakları koruyarak komutu operatörlerden (&&, ||, ;, |, &, satır sonu) bölüp parçaları token dizilerine çevirir. */
function parcala(komut, yorumAtla = true) {
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
      // Çift tırnak içinde ters eğik çizgi yalnız $ ` " \ önünde kaçıştır (bash gibi); "D:\depolar\..." yolu bozulmaz.
      // ARC-278: ters eğik çizgi + satır sonu çift tırnak içinde de satır devamıdır (ikisi birlikte silinir).
      else if (c === '\\' && tirnak === '"' && satirDevami(komut, i)) i += satirDevami(komut, i) - 1
      else if (c === '\\' && tirnak === '"' && i + 1 < komut.length && '$`"\\'.includes(komut[i + 1])) jeton += komut[++i]
      else jeton += c
      continue
    }
    if (c === "'" || c === '"') {
      tirnak = c
      jetonVar = true
    } else if (c === '\\' && satirDevami(komut, i)) {
      // ARC-278 (denetçi bulgusu): `git \⏎push origin master` ve `mas\⏎ter` bash'te satır devamıdır; eskiden `\n` jetona giriyor, push tanınmıyordu.
      i += satirDevami(komut, i) - 1
    } else if (c === '\\' && i + 1 < komut.length) {
      jeton += komut[++i]
      jetonVar = true
    } else if (c === '#' && !jetonVar && yorumAtla) {
      // Satır başı/boşluk sonrası # yorumdur (bash gibi): satır sonuna kadar atlanır; dal adı içindeki # (feat#1) etkilenmez.
      while (i + 1 < komut.length && komut[i + 1] !== '\n') i++
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
function pushBul(t, genisletme = false) {
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
  // Alt komut yerine koyma ile gizlenmiş olabilir (`git $(echo push) origin master`): ayrıştırıcı `$(`'de parçayı böler, alt komut düşer.
  if (genisletme && (t[i] === undefined || /[$`]/.test(t[i]))) return { yasak: 'git alt komutu genişletmeyle belirleniyor ($(…), `…`): push gizlenebilir; alt komutu açık yaz' }
  if (t[i] !== 'push') return null
  return { c: yollar, args: t.slice(i + 1) }
}

const HOOKSPATH_OKUMA = new Set(['--get', '--get-all', '--get-regexp', '--get-urlmatch', '--list', '-l', '--unset', '--unset-all', '--show-origin', '--show-scope'])

/**
 * `git config core.hooksPath <değer>` (ARC-281, OPS onaylı): pre-push katmanını (push-hedef-kapisi) atlatır; `-c core.hooksPath=` zaten
 * pushBul'da reddedilir. `git` tokeninden sonraki parça verilir. Okuma (--get/--list) ve silme (--unset: varsayılan kancalara döner)
 * serbest; anahtar büyük-küçük harf duyarsız. Yalnız git config alt komutu (global seçenekler -C/-c atlanır). Dönüş: neden ya da null.
 * SINIR: `.git/config` dosyasını elle yazmak, `git -c` dışı ortam yolları ve Bash dışı yazım bu kapıdan görünmez (git pre-push ve GitHub master koruması arkada).
 */
function hooksPathYazimi(sonrasi) {
  let i = 0
  while (i < sonrasi.length && /^-/.test(sonrasi[i])) i += sonrasi[i] === '-C' || sonrasi[i] === '-c' ? 2 : 1
  if (sonrasi[i] !== 'config') return null
  const arg = sonrasi.slice(i + 1)
  if (arg.some((a) => HOOKSPATH_OKUMA.has(a))) return null
  const ki = arg.findIndex((a) => /^core\.hookspath(=|$)/i.test(a))
  if (ki < 0) return null
  if (/=/.test(arg[ki]) || arg.slice(ki + 1).some((a) => !/^-/.test(a))) {
    return 'git config core.hooksPath <değer>: pre-push kapısını (push hedef/kapalı dal/döküm) atlatır; ayarı değiştirme (kurulum scripts/setup-hooks.mjs shim modeliyle, okuma ve --unset serbest)'
  }
  return null
}

/**
 * Saf karar. girdi: komut metni. o: { cwd, mevcutDal(cwd)->string|null, gitDeposu(yol)->boolean (varsayılan: git rev-parse) }.
 * Dönüş: null (geçer) ya da neden metni (reddedilir).
 */
function degerlendir(komut, o) {
  // İç içe yük (eval / bash -c) ayıklanmaz: dış kabuk yükteki $(...) ve ters tırnağı heredoc'tan ÖNCE genişletir (güvenlik incelemesi, 3. tur).
  if (!o.heredocYok) komut = heredocGovdesiniAyikla(komut || '')
  // UNC/ağ/aygıt yolu: ayrıştırıcı ters eğik çizgileri kaçış sayıp yolu bozabileceği için HAM metinde aranır (-C ve cd hedefi).
  if (/(?:\s-C\s*|\bcd\s+)(?:["']*)[\\/]{2}/.test(String(komut || ''))) return 'UNC/ağ/aygıt yolu (\\\\sunucu, //sunucu, \\\\?\\) denetlenmez; yerel yol yaz'
  const parcalar = parcala(String(komut || ''), !o.yorumYok)
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
  // Tek tırnak dışında komut yerine koyma var mı ($(…) ya da ters tırnak): alt komut/komut adı gizlenebilir.
  // Ham metin regex'leri satır devamı silinmiş metinde koşar (`$\<LF>(echo push)`, `pu\<LF>sh`: bash birleştirir; ARC-278 denetçi bulgusu). Tek tırnak içi literal kalır.
  const devamsiz = String(komut || '').replace(/'[^']*'|\\\n/g, (m) => (m === '\\\n' ? '' : m))
  const genisletme = /\$\(|`/.test(devamsiz.replace(/'[^']*'/g, ''))
  for (const t of parcalar) {
    // Komut adı genişletmeyle belirleniyorsa (`$(echo git) push ...`, `$G push ...`) ve komutta push geçiyorsa fail-closed.
    const ilkAd = asilKomut(t)
    if (ilkAd >= 0 && /[$`]/.test(t[ilkAd]) && /\bpush\b/.test(devamsiz)) return 'komut adı genişletmeyle belirleniyor ($…) ve komutta push geçiyor: git push gizlenebilir; komutu açık yaz'
    // xargs ve env -S: argümanlar statik görülemez → git ve push birlikte geçiyorsa fail-closed
    const tGitPush = t.some(gitGecer) && t.some((x) => x.includes('push'))
    if (tGitPush && t.some((x) => komutAdi(x) === 'xargs')) return 'xargs ile git push: argümanlar önceden bilinemez; push\'u doğrudan yaz'
    if (tGitPush && t.some((x) => x === '-S' || x === '--split-string' || /^-S./.test(x))) return 'env -S ile git push: komut dizgesi önceden bilinemez; push\'u doğrudan yaz'
    // bash -c "..." / eval "..." / pwsh -Command "..." / cmd /c "..." içini de tara
    const ilk = asilKomut(t)
    const ad = ilk >= 0 ? komutAdi(t[ilk]) : ''
    // İç içe çağrılarda önceki klasörler SİLİNMEZ, birikir (özgün klasör her zaman ölçülür).
    const oo = { ...o, heredocYok: true, cwd, ekCwd: [...new Set([...(o.ekCwd || []), ...(cwd !== o.cwd ? [o.cwd] : [])])] }
    if (ad === 'cd' && t[ilk + 1] && !t[ilk + 1].startsWith('-')) {
      if (AG_YOLU(t[ilk + 1])) return `cd ${t[ilk + 1]}: UNC/ağ/aygıt yolu denetlenmez; yerel yol yaz`
      cwd = path.resolve(cwd, t[ilk + 1])
    }
    if (KABUKLAR.has(ad)) {
      if (t.some((x, k) => k > ilk && /^-(e|ec|enc|encodedcommand)$/i.test(x))) return 'kodlanmış kabuk komutu (-EncodedCommand): içerik denetlenemez; düz yaz'
      const ci = t.findIndex((x, k) => k > ilk && (/^-[a-z]*c[a-z]*$/i.test(x) || /^\/c$/i.test(x) || /^-command$/i.test(x)))
      // stdin'den çalışan kabuk (`... | bash`, `bash <<< "..."`): komut metni tırnaklı yük olarak başka parçada durur, içeriği değerlendirilemez.
      // Stdin göstergeleri: argümansız, -s, tek `-`, /dev/stdin, /proc/self/fd/0, <<< (kabuk betik dosyası verirse yalnız o dosya, denetlenebilir değil ama stdin değil).
      const kabukArg = t.slice(ilk + 1)
      const stdinKabuk = t.some((x) => x.startsWith('<<<') || x === '<' || /^<[^<]/.test(x)) || kabukArg.every((x) => x.startsWith('-')) || kabukArg.some((x) => x === '-s' || x === '-' || /^\/(dev\/stdin|proc\/self\/fd\/0|dev\/fd\/0)$/.test(x))
      if (ci < 0 && gitPushVar && stdinKabuk) {
        return 'stdin\'den çalışan kabuk (| bash, <<<, -s, /dev/stdin) ile git push: komut metni denetlenemez; push\'u doğrudan yaz'
      }
      if (ci >= 0 && t[ci + 1]) {
        const yuk = t.slice(ci + 1).join(' ')
        // Yük başka yerden komut okuyor/üretiyorsa ($(…), `…`, eval, stdin) ve komutta git push varsa içerik görülemez → fail-closed.
        if (gitPushVar && /\$\(|`|\beval\b|\/dev\/stdin|\/fd\/0|\bread\b/.test(yuk) && !(/git/i.test(yuk) && /push/i.test(yuk))) {
          return 'kabuk -c yükü komut üretiyor/okuyor ($(…), `…`, eval, stdin) ve komutta git push var: içerik denetlenemez; push\'u doğrudan yaz'
        }
        if (/git/i.test(yuk) && /push/i.test(yuk) && /[$%^`]/.test(yuk)) return 'kabuk komutunda genişletme ($, %, ^) git push ile birlikte: hedef önceden bilinemez; dal adını açık yaz'
        // cmd'de # yorum değildir: yük içinde yorum atlama kapalı (yoksa `echo x # & git push origin master` gizlenirdi).
        const ic = degerlendir(yuk, YORUMLU_KABUK.has(ad) ? oo : { ...oo, yorumYok: true })
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
      const hp = hooksPathYazimi(t.slice(k + 1))
      if (hp) return hp
      const p = pushBul(t.slice(k), genisletme)
      if (!p) continue
      if (p.yasak) return p.yasak
      // Ters tırnaklı komut yerine koyma (`echo master`) ayrıştırıcıda parçayı böler; push argümanı sessizce düşer → fail-closed.
      if (String(komut).includes('`')) return 'git push ile birlikte ters tırnaklı komut yerine koyma (`...`): hedef önceden bilinemez; dal adını açık yaz'
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
    if (c.some(AG_YOLU)) return `git -C ${c.join(' -C ')}: UNC/ağ/aygıt yolu (\\\\, //, \\\\?\\) denetlenmez; yerel yol yaz`
    const cozulen = c.reduce((onceki, y) => path.resolve(onceki, y), o.cwd)
    const depoMu = o.gitDeposu || ((y) => git(y, 'rev-parse', '--git-dir') !== null)
    if (!depoMu(cozulen)) return `git -C ${c.join(' -C ')}: yol bir git deposu değil; push yalnız bir git deposundan yapılır`
    cwd = cozulen
  }
  const konumsal = []
  for (let ai = 0; ai < args.length; ai++) {
    const a = args[ai]
    // Dal/uzak adı genişletmesi ($DEĞİŞKEN, $(...), `...`): değer önceden bilinemez → fail-closed (en üst düzeyde de, kabuk -c içindeki gibi).
    if (/[$`]/.test(a)) return `push argümanında genişletme (${a}): hedef önceden bilinemez; dal adını açık yaz`
    // -o/--push-option ayrı değer alır (CI atlatma seçeneği gibi); değer uzak/dal sayılmaz.
    if (a === '-o' || a === '--push-option') {
      ai++
      continue
    }
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
  // Mevcut dal: izlenen klasörde VE (açık -C yoksa) komutun başladığı özgün klasörde ölçülür; ikisinden biri korunan dalsa o döner.
  // `cd X` koşullu çalışmamış olabilir ( `false || cd X` ), alt kabukta kalmış olabilir: iki ölçümden biri master ise reddet (fail-closed).
  let mevcut
  const mevcutAl = () => {
    if (mevcut === undefined) {
      const klasorler = [cwd, ...(c.length === 0 ? o.ekCwd || [] : [])]
      const dallar = klasorler.map((k) => (o.mevcutDal ? o.mevcutDal(k) : null))
      mevcut = dallar.find((d) => d && KORUNAN.has(d)) || dallar[0] || null
    }
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

module.exports = { degerlendir, parcala, pushBul, heredocGovdesiniAyikla }

if (require.main === module) main()
