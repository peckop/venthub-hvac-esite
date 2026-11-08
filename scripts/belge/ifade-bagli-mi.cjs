#!/usr/bin/env node
/**
 * İFADE-BAĞLI-MI (HRT-122, OPS-256 2. dalga): bir metni (ya da bir dosyadan silinen/değişen satırların parçalarını) kısaltmadan ya da
 * silmeden ÖNCE, o ifadeyi harfi harfine bekleyen testleri ve betikleri bulur.
 *
 * NİÇİN VAR: filo-ortak.md ve rol kartı tavanına sığmak için satır kısaltılırken bağlı test ifadesi birkaç kez silindi (HRT-67, HRT-116,
 * HRT-121: CI ya da yerel test kırmızı). HRT-119 sayımı: elle "bağlı test grep" 77 kez koşuldu.
 *
 * Kullanım:
 *   node scripts/belge/ifade-bagli-mi.cjs "<ifade>" ["<ifade2>" ...]
 *   node scripts/belge/ifade-bagli-mi.cjs --silinen=<dosya>      (HEAD'e göre silinen/değişen satırların ≥14 karakterlik parçaları)
 * Arama kökleri: src/__tests__, scripts/belge, scripts/hijyen, .claude/hooks (hedef dosyanın kendisi hariç). CRLF normalize edilir.
 * Çıkış: 0 = hiçbir ifade bağlı değil, 1 = en az bir ifade bağlı (kısaltma testi düşürür), 2 = kullanım hatası.
 */
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const KOKLER = ['src/__tests__', 'scripts/belge', 'scripts/hijyen', '.claude/hooks']
const UZANTI = /\.(ts|tsx|cjs|mjs|js|json)$/
const ASGARI_PARCA = 14

function dosyalar(agac, dal, cikti) {
  let girdiler
  try { girdiler = fs.readdirSync(path.join(agac, dal), { withFileTypes: true }) } catch { return cikti }
  for (const g of girdiler) {
    const gorece = dal + '/' + g.name
    if (g.isDirectory()) { if (g.name !== 'node_modules') dosyalar(agac, gorece, cikti) }
    else if (UZANTI.test(g.name)) cikti.push(gorece)
  }
  return cikti
}

/** Satırı, doğal kesme işaretlerinden (; : , . parantez) ≥ASGARI_PARCA karakterlik parçalara böler. */
function parcalar(satir) {
  return satir
    .replace(/^[-*\s]+/, '')
    .split(/[;:,.()—]/)
    .map((p) => p.trim())
    .filter((p) => p.length >= ASGARI_PARCA)
}

/** @returns {Array<{ifade: string, vurgular: Array<{dosya: string, satir: number}>}>} */
function ara(agac, ifadeler, haric) {
  const tum = []
  for (const k of KOKLER) dosyalar(agac, k, tum)
  const icerikler = new Map()
  for (const d of tum) {
    if (haric && path.normalize(d) === path.normalize(haric)) continue
    try { icerikler.set(d, fs.readFileSync(path.join(agac, d), 'utf8').replace(/\r\n/g, '\n').split('\n')) } catch { /* okunamayan atlanır */ }
  }
  return ifadeler.map((ifade) => {
    const vurgular = []
    for (const [d, satirlar] of icerikler) {
      satirlar.forEach((s, i) => { if (s.includes(ifade)) vurgular.push({ dosya: d, satir: i + 1 }) })
    }
    return { ifade, vurgular }
  })
}

function silinenParcalar(agac, dosya) {
  const fark = execFileSync('git', ['-C', agac, '-c', 'core.safecrlf=false', 'diff', '-U0', '--ignore-cr-at-eol', 'HEAD', '--', dosya], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  const out = new Set()
  for (const s of fark.split('\n')) {
    if (s.startsWith('-') && !s.startsWith('---')) for (const p of parcalar(s.slice(1))) out.add(p)
  }
  return [...out]
}

function main() {
  const argv = process.argv.slice(2)
  const silinenBayrak = argv.find((a) => a.startsWith('--silinen='))
  const agac = process.cwd()
  let ifadeler = argv.filter((a) => !a.startsWith('--'))
  let haric
  if (silinenBayrak) {
    haric = silinenBayrak.slice('--silinen='.length)
    ifadeler = ifadeler.concat(silinenParcalar(agac, haric))
  }
  if (ifadeler.length === 0) {
    process.stderr.write('Kullanım: node scripts/belge/ifade-bagli-mi.cjs "<ifade>" ... | --silinen=<dosya>\n')
    process.exit(2)
  }
  let bagli = 0
  for (const { ifade, vurgular } of ara(agac, ifadeler, haric)) {
    if (vurgular.length === 0) { process.stdout.write(`BAĞSIZ  ${JSON.stringify(ifade)}\n`); continue }
    bagli++
    process.stdout.write(`BAĞLI   ${JSON.stringify(ifade)}\n`)
    for (const v of vurgular.slice(0, 5)) process.stdout.write(`        ${v.dosya}:${v.satir}\n`)
    if (vurgular.length > 5) process.stdout.write(`        … +${vurgular.length - 5} yer\n`)
  }
  process.stdout.write(`${bagli} / ${ifadeler.length} ifade bağlı\n`)
  process.exit(bagli > 0 ? 1 : 0)
}

if (require.main === module) main()

module.exports = { KOKLER, parcalar, ara, silinenParcalar }
