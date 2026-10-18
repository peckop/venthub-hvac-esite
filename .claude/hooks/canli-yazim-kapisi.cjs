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
 * OPS penceresi = ops-oturumu.cjs kimlikMi(session_id) ya da agent_type === 'ops-pencere' (cwd'ye bakılmaz). OPS'un alt ajanı OPS DEĞİLDİR.
 *
 * ── HATA YOLLARI ──
 *
 * Ayrıştırma ya da kimlik okuma çökerse: komutta hem `--apply|--rollback` hem `product-data` varsa DENY (kapalı düşer),
 * yoksa geçer. `settings.json` kaydı onFailure "block" ister (kanca süreci çökerse Claude Code komutu durdursun).
 *
 * Bilinen sınır: betik adı ve bayrak dosyadan/ortamdan okunuyorsa (komutta hiç geçmiyorsa) yakalanmaz; o durumda
 * settings.json deny satırları ve OPS onayı son savunmadır.
 */
const fs = require('fs')
const path = require('path')

const BAYRAK = /(^|\s|["'])--(apply|rollback)(\s|=|$|["'])/
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
function incele(komut, cwd, betikler = yazanBetikAdlari()) {
  const metin = String(komut || '')
  const kucuk = metin.toLowerCase()
  // Dosya adı BÜTÜN bir kelime olarak geçmeli ("baska.mjs" içinde "a.mjs" eşleşmesin).
  const kacis = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const dosyaAdiGecer = [...betikler].some((ad) => new RegExp('(^|[\\s/\\\\"\'=$])' + kacis(ad) + '($|[\\s"\';&|)])').test(kucuk))
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
    const calistiriciVar = kelimeler.some((w) => CALISTIRICI.test(path.basename(String(w).replace(/\\/g, '/'))))
    if (!calistiriciVar || !BAYRAK.test(parca)) continue
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
  return null
}

function opsMu(girdi) {
  const o = require(path.join(kokDizin(), 'scripts', 'board', 'ops-oturumu.cjs'))
  // YALNIZ kayıtlı OPS oturum kimliği ya da harness'in verdiği agent_type. opsAdayiMi'nin cwd'den yukarı
  // settings.local.json arama yolu KULLANILMAZ: cwd bir `cd` ile değişebilir, kimlik sahtelenebilirdi.
  return Boolean(o.kimlikMi(girdi.session_id) || girdi.agent_type === 'ops-pencere')
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
  if (girdi.tool_name !== 'Bash' || !BAYRAK.test(komut)) process.exit(0)
  let sebep = null
  try {
    sebep = incele(komut, girdi.cwd)
  } catch (e) {
    sebep = /product-data/i.test(komut) ? 'komut ayristirilamadi (' + ((e && e.message) || 'bilinmeyen') + ')' : null
  }
  if (!sebep) process.exit(0)
  let ops = false
  try {
    ops = opsMu(girdi)
  } catch {
    ops = false // kimlik okunamadi: OPS sayma (kapali dus)
  }
  if (ops) process.exit(0)
  reddet(sebep)
  process.exit(0)
}

module.exports = { incele, yazanBetikAdlari, klasordeMi }
if (require.main === module) main()
