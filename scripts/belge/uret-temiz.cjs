#!/usr/bin/env node
/**
 * ÜRET-TEMİZ (HRT-122, OPS-256 2. dalga): rol kartı ve ajan tanımı üreticilerini tek komutta koşar, Windows CRLF checkout'unun
 * yarattığı satır-sonu gürültüsünü geri alır, yalnız GERÇEKTEN değişen üretilmiş dosyaları bırakır ve listeler.
 *
 * NİÇİN VAR: üreticiler `--yaz` ile 40 dosyayı LF yazar; CRLF checkout'ta bunların çoğu yalnız satır sonu farkıyla "değişmiş" görünür.
 * HRT-119 sayımı (8 Kasım): üretici `--yaz` 216, `git diff --ignore-cr-at-eol` ayıklaması 163, `git restore` 25 elle komut. Bu betik üçünü bire indirir.
 *
 * GÜVENLİK: yalnız ÜRETİLEN dizinlerde (docs/roller, .claude/agents, .claude/rules) ve yalnız `git diff --ignore-cr-at-eol` boş dönen dosyayı
 * `git restore` eder. Gerçek içerik farkı olan dosyaya dokunmaz; üretilen dizinlerin dışına dokunmaz.
 *
 * Kullanım: node scripts/belge/uret-temiz.cjs [--agac=<yol>] [--sadece-ayikla]
 *   --sadece-ayikla : üreticileri koşmaz, yalnız mevcut gürültüyü ayıklar.
 * Çıkış: 0 = bitti (gerçek değişen dosyalar listelendi), 1 = üretici ya da git hatası.
 */
'use strict'
const { execFileSync } = require('node:child_process')

const URETILEN = ['docs/roller', '.claude/agents', '.claude/rules']

/** `git status --porcelain` çıktısından, çalışma ağacında değişmiş (izlenen) dosya yollarını döndürür. */
function degisenYollar(porcelain) {
  const yollar = []
  for (const satir of porcelain.split('\n')) {
    if (satir.length < 4) continue
    const x = satir[0]
    const y = satir[1]
    if (x === '?' || x === '!') continue
    if (x !== 'M' && y !== 'M') continue
    yollar.push(satir.slice(3).trim().replace(/^"|"$/g, ''))
  }
  return yollar
}

/** Değişen yolları üretilen dizinlerle sınırlar. */
function uretilenMi(yol) {
  return URETILEN.some((d) => yol === d || yol.startsWith(d + '/'))
}

/**
 * Saf sınıflandırma: `gercekFarkVar(yol)` true ise dosyada satır sonu dışı fark vardır.
 * @returns {{gercek: string[], gurultu: string[], disarida: string[]}}
 */
function siniflandir(yollar, gercekFarkVar) {
  const gercek = []
  const gurultu = []
  const disarida = []
  for (const y of yollar) {
    if (!uretilenMi(y)) { disarida.push(y); continue }
    ;(gercekFarkVar(y) ? gercek : gurultu).push(y)
  }
  return { gercek, gurultu, disarida }
}

function calistir(agac, sadeceAyikla) {
  const git = (args) => execFileSync('git', ['-C', agac, '-c', 'core.safecrlf=false', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (!sadeceAyikla) {
    for (const betik of ['rol-karti-uret.cjs', 'ajan-tanimi-uret.cjs']) {
      execFileSync(process.execPath, ['scripts/belge/' + betik, '--yaz'], { cwd: agac, stdio: ['ignore', 'ignore', 'inherit'] })
    }
  }
  const yollar = degisenYollar(git(['status', '--porcelain', '--', ...URETILEN]))
  const { gercek, gurultu, disarida } = siniflandir(yollar, (y) => {
    try {
      git(['diff', '--ignore-cr-at-eol', '--quiet', '--', y])
      return false
    } catch {
      return true
    }
  })
  if (gurultu.length > 0) git(['restore', '--', ...gurultu])
  return { gercek, gurultu, disarida }
}

function main() {
  const argv = process.argv.slice(2)
  const agacBayrak = argv.find((a) => a.startsWith('--agac='))
  const agac = agacBayrak ? agacBayrak.slice('--agac='.length) : process.cwd()
  let sonuc
  try {
    sonuc = calistir(agac, argv.includes('--sadece-ayikla'))
  } catch (e) {
    process.stderr.write('uret-temiz: HATA — ' + (e && e.message ? String(e.message).split('\n')[0] : e) + '\n')
    process.exit(1)
  }
  process.stdout.write(`GERÇEK değişen üretilmiş dosya: ${sonuc.gercek.length}\n`)
  for (const y of sonuc.gercek) process.stdout.write('  ' + y + '\n')
  process.stdout.write(`CRLF gürültüsü geri alındı: ${sonuc.gurultu.length}\n`)
  if (sonuc.disarida.length > 0) process.stdout.write(`(üretilen dizinler dışında değişmiş, dokunulmadı: ${sonuc.disarida.length})\n`)
}

if (require.main === module) main()

module.exports = { URETILEN, degisenYollar, uretilenMi, siniflandir, calistir }
