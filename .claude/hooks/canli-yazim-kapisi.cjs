#!/usr/bin/env node
'use strict'
/**
 * CANLI YAZIM KAPISI — ARC-178 B (18 Ekim 2026). PreToolUse, Bash.
 *
 * ── NİÇİN VAR ──
 *
 * `scripts/db/product-data/*.mjs` betikleri `--apply` ile canlı veritabanına yazar, `--rollback` ile geri alır.
 * Canlı yazımın kararı Recep'indir; sözü OPS penceresinde söyler ve yalnız OPS koşar (filo-ortak kuralı).
 * settings.json'daki deny satırları (`node --env-file=.env scripts/db/product-data/*--apply*`) YOL BİÇİMİNE bağlıdır:
 * mutlak yol, `cd klasör && node betik.mjs --apply` ya da `--env-file` olmadan çağrı satırı yakalamaz (18 Ekim ölçümü,
 * ARC-178 A geçici mutlak yol satırlarıyla kapattı). Bu kapı yolu çözer, biçime bakmaz.
 *
 * ── KARAR ──
 *
 * Komutta bir ÇALIŞTIRICI parçası (node, pnpm, npx, tsx, bun, deno, bash, sh, env, xargs, eval ...) varsa ve o parçada
 * `--apply` ya da `--rollback` bayrağı geçiyorsa, parça product-data betiğine işaret ediyorsa → OPS penceresi değilse DENY.
 * "İşaret etmek" üç yoldan biridir:
 *   (1) parçadaki bir .mjs/.cjs/.js/.ts argümanı, cd zinciri izlenerek ve realpath ile çözülünce `scripts/db/product-data/`
 *       altına düşer (göreli, mutlak, `..`, bağlantı fark etmez);
 *   (2) oturumun çalışma dizini (cwd) ya da komuttaki `cd` hedefi product-data klasörünün içindedir;
 *   (3) komut metninde klasör adı `product-data` ya da klasördeki apply'li bir betiğin dosya adı geçer (değişken
 *       üzerinden dolaylı çağrı: `S=x.mjs; node $S --apply`).
 * OPS penceresi = kanca girdisinde `agent_type === 'ops-pencere'` VE `agent_id` YOK. Ölçüm (19 Ekim, 2.1.296, başsız
 * `claude -p --agent ops-pencere`): ana oturumda agent_type "ops-pencere", agent_id yok; alt ajan aynı session_id ile gelir,
 * agent_id doludur, agent_type alt ajanın türüdür. Yani session_id kimliği ALT AJANI da OPS yapardı (eski sürümün deliği);
 * artık yalnız agent_id'siz ops-pencere sayılır. Kimlik yazılabilir dosyaya (ops-oturumu.json, `--yaz` ile herkes
 * yazabiliyor) BAĞLI DEĞİL; cwd'ye de bakılmaz. Sınır: `--agent ops-pencere` ile açılan her pencere OPS sayılır; bu ayar
 * Recep/OPS'un elindedir (settings.local.json yazımı protect-config altında).
 * PowerShell aracı da aynı kapıdan geçer (matcher "Bash|PowerShell"); PowerShell'de çalıştırıcı kelimesi aranmaz
 * (Start-Process, iex, & ... çok), bayrak + product-data işareti yeter.
 * Gizlenmiş bayrak: tırnak/ters bölü/`$`/süslü parantez sökülünce de bayrak aranır (`--appl'y'`, `--app\<satır sonu>ly`),
 * ve `--ap`/`--ro` başlangıcı product-data bağlamında bayrak sayılır (`A=--app; node x.mjs ${A}ly`); ayrıca product-data +
 * çalıştırıcı + değişken/komut ikamesi/`\x`/eval/base64 birlikteyse DENY (bayrak düz görünmese de).
 *
 * ── HATA YOLLARI ──
 *
 * Ayrıştırma ya da kimlik okuma çökerse: komutta hem `--apply|--rollback` hem `product-data` varsa DENY (kapalı düşer),
 * yoksa geçer. `settings.json` kaydına `onFailure "block"` ARC-180 / #2004 ile gelir (kanca süreci çökerse Claude Code
 * komutu durdursun); #2004 birleşince bu kapının satırına da eklenir.
 *
 * Bilinen sınır: betik adı ve bayrak dosyadan/ortamdan okunuyorsa (komutta hiç geçmiyorsa) yakalanmaz; o durumda
 * settings.json deny satırları ve OPS onayı son savunmadır.
 */
const fs = require('fs')
const path = require('path')

const BAYRAK = /(^|\s|["'=,(])--(apply|rollback)(\s|=|$|["'),])/
// PowerShell kurucuları: dize birleştirme, iex, [char], -join, -f: bayrak düz görünmez, product-data işareti varsa DENY.
const PSKUR = /\biex\b|Invoke-Expression|Invoke-Command|\bicm\b|\[char\]|-join\b|\[string\]::|\+\s*["']|["']\s*\+|-f\s+["']/i
// OPS kimliği taklidi: başka pencere `claude --agent ops-pencere` ile kendini OPS yapıp komut koşturamaz.
const OPS_TAKLIT = /\bclaude(\.exe|\.cmd)?\b[\s\S]*--agent[\s=]+["']?ops-pencere/i
// Söküm sonrası gevşek başlangıç: `${A}ly` gibi parçalanmış bayrağın A=--app kısmı.
const GEVSEK = /--(ap|ro)/
// Gizleme belirtisi: değişken/komut ikamesi, $'..', \x kaçışı, eval, base64, satır sonu kaçışı.
const OBFUSK = /\$\{?[A-Za-z_@*#?0-9]|\$'|\$\(|`|\\x[0-9a-fA-F]{2}|\beval\b|base64|\\\r?\n/

/** Tırnak, ters bölü, `$`, süslü parantez ve satır sonu kaçışını söker (gizlenmiş bayrağı düzleştirir). */
function sokum(m) {
  return String(m).replace(/\\\r?\n/g, '').replace(/["'`\\${}]/g, '')
}
/** Bayrak düz ya da gizlenmiş olarak geçiyor mu. */
function bayrakVar(m) {
  if (BAYRAK.test(m)) return true
  const s = sokum(m)
  return s !== m && (BAYRAK.test(s) || GEVSEK.test(s))
}
const CALISTIRICI = /^(node|nodejs|pnpm|npx|npm|yarn|tsx|ts-node|bun|deno|bash|sh|zsh|env|xargs|eval|exec|time|nohup|start|cmd|powershell|pwsh)(\.exe|\.cmd)?$/i
const BETIK_UZANTI = /\.(mjs|cjs|js|ts|mts|cts)$/i
const KLASOR = /scripts[\\/]+db[\\/]+product-data([\\/]|$)/i

function kokDizin() {
  return path.resolve(__dirname, '..', '..')
}

/** product-data klasöründeki, apply/rollback bayrağını anan betiklerin dosya adları (küçük harf). */
function yazanBetikAdlari(kok = kokDizin()) {
  const dizin = path.join(kok, 'scripts', 'db', 'product-data')
  const adlar = new Set()
  try {
    for (const ad of fs.readdirSync(dizin)) {
      if (!BETIK_UZANTI.test(ad)) continue
      try {
        if (/--(apply|rollback)/.test(fs.readFileSync(path.join(dizin, ad), 'utf8'))) adlar.add(ad.toLowerCase())
      } catch {
        adlar.add(ad.toLowerCase()) // okunamayan betik: yazıyor say (kapalı düş)
      }
    }
  } catch {
    /* klasör yok: yalnız yol/ad kuralları çalışır */
  }
  return adlar
}

function gercekYol(p) {
  const coz = (y) => (fs.realpathSync.native ? fs.realpathSync.native(y) : fs.realpathSync(y))
  try {
    return coz(p)
  } catch {
    // Dosya henüz yoksa üst klasörü çöz (bağlantı/junction üzerinden gelen yeni dosya adı)
    try {
      return path.join(coz(path.dirname(p)), path.basename(p))
    } catch {
      return path.resolve(p)
    }
  }
}

const gitBashYolu = (y) => String(y).replace(/^\/([a-zA-Z])(\/|$)/, '$1:/')

function klasordeMi(p) {
  return KLASOR.test(gercekYol(p).replace(/\\/g, '/') + '/')
}

/** Tırnakları sıyırarak kelimelere böl (ayrıştırıcı sıkı değil, yalnız yönlendirme için; karar muhafazakâr). */
function kelimele(parca) {
  const k = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m
  while ((m = re.exec(parca))) k.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3])
  return k
}

/** Parçanın ilk gerçek komut kelimesi (VAR=değer atamaları atlanır). */
function komutKelimesi(kelimeler) {
  for (const k of kelimeler) {
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(k)) continue
    return path.basename(k.replace(/\\/g, '/'))
  }
  return ''
}

/**
 * Komut product-data betiğine --apply/--rollback ile işaret ediyorsa sebep, yoksa null.
 * `cwd`: kancaya gelen çalışma dizini. `betikler`: yazanBetikAdlari() (test için dışarıdan verilebilir).
 */
function incele(komut, cwd, betikler = yazanBetikAdlari(), ps = false) {
  const metin = String(komut || '')
  const kucuk = metin.toLowerCase()
  // Dosya adı BÜTÜN bir kelime olarak geçmeli ("baska.mjs" içinde "a.mjs" eşleşmesin).
  const kacis = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const dosyaAdiGecer = [...betikler].some((ad) => new RegExp('(^|[\\s/\\\\"\'=$])' + kacis(ad) + '($|[\\s"\';&|)`}])').test(kucuk))
  const klasorAdiGecer = /product-data/i.test(metin)
  let mevcut = path.resolve(gitBashYolu(cwd || process.cwd()))
  // Ayırıcılar geniş: & ; | satır sonu, ( ) { } ters tırnak ve $( — ayrıştırıcı farkıyla parça gizlenemesin.
  for (const parca of metin.split(/&|;|\||\r?\n|\(|\)|\{|\}|`|\$\(/)) {
    const kelimeler = kelimele(parca)
    if (!kelimeler.length) continue
    const ilk = komutKelimesi(kelimeler)
    if (/^(cd|pushd)$/i.test(ilk)) {
      const hedef = kelimeler.filter((k) => !/^(cd|pushd|\/d|-[a-zA-Z]+)$/i.test(k))[0]
      if (hedef) mevcut = path.resolve(mevcut, gitBashYolu(hedef))
      continue
    }
    // Çalıştırıcı YALNIZ ilk kelime olmak zorunda değil (sudo/time/env sarmalları): parçadaki herhangi bir kelime.
    const calistiriciVar = ps || kelimeler.some((w) => CALISTIRICI.test(path.basename(String(w).replace(/\\/g, '/'))))
    if (!calistiriciVar || !bayrakVar(parca)) continue
    // (1) betik argümanı çözülünce klasöre düşüyor mu
    for (const k of kelimeler) {
      if (!BETIK_UZANTI.test(k)) continue
      const tam = path.resolve(mevcut, gitBashYolu(k))
      if (klasordeMi(tam)) return 'betik product-data klasorunde: ' + path.basename(tam)
    }
    // (2) cwd ya da cd hedefi klasörün içinde ve parçada betik adı var
    if (klasordeMi(mevcut) && kelimeler.some((k) => BETIK_UZANTI.test(k))) {
      return 'calisma dizini product-data klasorunde'
    }
    // (3) klasör adı ya da apply'li bir betiğin adı komutta geçiyor (dolaylı çağrı)
    if (klasorAdiGecer || dosyaAdiGecer) return 'komutta product-data betigine dolayli isaret'
  }
  // Kapalı düşen yedek: parçalar ayrıldığında çalıştırıcı, bayrak ve betik parçalara dağılabilir
  // (`node $(echo …/product-data/a.mjs) --apply`). Bütün komutta üçü birden varsa parçalamaya bakmadan reddet.
  const tumKelimeler = kelimele(metin)
  const tumCalistirici = ps || tumKelimeler.some((w) => CALISTIRICI.test(path.basename(String(w).replace(/\\/g, '/'))))
  const productVar = klasorAdiGecer || dosyaAdiGecer
  if (tumCalistirici && productVar && bayrakVar(metin)) {
    return 'komutta calistirici, --apply/--rollback ve product-data birlikte (parcalanmis ya da gizlenmis cagri)'
  }
  if (tumCalistirici && productVar && OBFUSK.test(metin)) {
    return 'product-data betigi degisken/komut ikamesi/kacis ile cagriliyor (bayrak gorunmeyebilir)'
  }
  // PowerShell: bayrak sayısız yolla kurulabilir; product-data işareti + kurucu yapı varsa çalıştırıcı/bayrak aranmadan DENY
  if (ps && productVar && PSKUR.test(metin)) {
    return 'PowerShell: product-data betigi dize birlestirme/iex/[char]/-join ile cagriliyor (bayrak gorunmeyebilir)'
  }
  return null
}

/** OPS kimliği taklidi: `claude ... --agent ops-pencere` (sökülmüş halde de). */
function opsTaklidi(metin) {
  // Yalnız komutun KENDİSİ claude (ya da bir çalıştırıcı sarmalının içinde claude) ise: `git commit -m "... claude --agent ..."`
  // gibi metinler yanlış alarm vermesin.
  for (const parca of String(metin).split(/&|;|\||\r?\n|`|\$\(/)) {
    const ilk = komutKelimesi(kelimele(parca))
    const claudeMi = /^claude(\.exe|\.cmd)?$/i.test(ilk)
    const sarmal = CALISTIRICI.test(ilk) && /\bclaude\b/i.test(parca)
    if ((claudeMi || sarmal) && (OPS_TAKLIT.test(parca) || OPS_TAKLIT.test(sokum(parca)))) return true
  }
  return false
}

/**
 * OPS penceresi mi: harness'in verdiği agent_type "ops-pencere" ve agent_id YOK. Alt ajan ebeveynin session_id'si ile gelir
 * ama agent_id taşır (19 Ekim ölçümü); session_id ve cwd'ye bakılmaz, yazılabilir kimlik dosyasına bağlı değil.
 */
function opsMu(girdi) {
  return girdi.agent_type === 'ops-pencere' && !girdi.agent_id
}

function reddet(sebep) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          '[canli-yazim-kapisi] ' +
          sebep +
          ' — canli veritabani yazimi (--apply/--rollback) yalniz OPS penceresinde, Recep "yaz" dedikten sonra kosulur. ' +
          'Kuru kosumu (bayraksiz) kos, komutu ve geri alma yolunu OPS\'a SendMessage ile ver (ARC-178).',
      },
    }),
  )
}

function main() {
  let girdi = {}
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    process.exit(0)
  }
  const komut = (girdi.tool_input || {}).command || ''
  const ps = girdi.tool_name === 'PowerShell'
  if (girdi.tool_name !== 'Bash' && !ps) process.exit(0)
  let sebep = null
  try {
    if (opsTaklidi(komut)) sebep = 'OPS kimligi taklidi: claude --agent ops-pencere baska pencereden baslatilamaz'
    // Ön süzgeç: gizleme belirtisi/bayrak/PowerShell kurucusu yoksa (ve PowerShell'de product-data de yoksa) karışma
    else if (ps || bayrakVar(komut) || OBFUSK.test(komut)) sebep = incele(komut, girdi.cwd, undefined, ps)
  } catch (e) {
    sebep = /product-data/i.test(komut) ? 'komut ayristirilamadi (' + ((e && e.message) || 'bilinmeyen') + ')' : null
  }
  if (!sebep) process.exit(0)
  let ops = false
  try {
    ops = opsMu(girdi)
  } catch {
    ops = false // kimlik okunamadı: OPS sayma (kapalı düş)
  }
  if (ops) process.exit(0)
  reddet(sebep)
  process.exit(0)
}

module.exports = { incele, yazanBetikAdlari, klasordeMi }
if (require.main === module) main()
