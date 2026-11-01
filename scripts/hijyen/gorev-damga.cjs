#!/usr/bin/env node
'use strict'

/**
 * GÖREV DAMGASI (ARC-216 A kolu): düzenli görevi bitiren rol, tazelik sayacını sıfırlar.
 *
 *   node scripts/hijyen/gorev-damga.cjs "<satır adı>" [--rol <ROL>]
 *   node scripts/hijyen/gorev-damga.cjs --liste [--rol <ROL>]
 *
 * Satır adı, "⚠GÖREV" satırında yazan addır ("öz-değerlendirme", "SEO haftalık", …). Rol verilmezse pencerenin agent
 * anahtarından çözülür. Yazılan dosya kullanıcıya özeldir (~/.claude/mod-durum/gorev-damga.json), depoya girmez.
 * Mantık: scripts/hijyen/gorev-tazelik.cjs.
 */

const fs = require('node:fs')
const path = require('node:path')

const KOK = path.resolve(__dirname, '..', '..')
const z = require(path.join(__dirname, 'gorev-tazelik.cjs'))

function arg(argv, ad) {
  const i = argv.indexOf(ad)
  return i >= 0 ? argv[i + 1] : undefined
}

function rolBul(argv) {
  const verilen = arg(argv, '--rol')
  if (verilen) return String(verilen).toUpperCase()
  try {
    const k = require(path.join(KOK, 'scripts', 'board', 'pencere-kimligi.cjs'))
    return k.rolAdi(k.agentAdi({ cwd: process.cwd() }))
  } catch {
    return ''
  }
}

function main(argv) {
  const rol = rolBul(argv)
  const veri = JSON.parse(fs.readFileSync(path.join(KOK, 'scripts', 'belge', 'rol-gorevleri.json'), 'utf8'))
  const gorevler = z.gorevleriOku(veri)
  if (argv.includes('--liste')) {
    const hedef = rol ? { [rol]: gorevler[rol] || [] } : gorevler
    for (const [r, l] of Object.entries(hedef)) for (const g of l) process.stdout.write(`${r}\t${g.ad}\teşik ${g.esik} gün\n`)
    return 0
  }
  const ad = argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--rol')
  if (!ad) {
    process.stderr.write('Kullanım: gorev-damga.cjs "<satır adı>" [--rol <ROL>] | --liste\n')
    return 2
  }
  if (!rol || !(gorevler[rol] || []).some((g) => g.ad === ad)) {
    const var_ = Object.entries(gorevler).flatMap(([r, l]) => l.filter((g) => g.ad === ad).map(() => r))
    process.stderr.write(
      `Görev bulunamadı: "${ad}"${rol ? ` rol ${rol} için` : ' (rol çözülemedi, --rol ver)'}.` +
        (var_.length ? ` Bu ad şu rollerde var: ${var_.join(', ')}.` : ' Adlar: --liste') +
        '\n',
    )
    return 1
  }
  z.damgaYaz(ad, rol)
  process.stdout.write(`Damgalandı: ${rol} · ${ad} · ${new Date().toISOString()}\n`)
  return 0
}

if (require.main === module) {
  let kod = 1
  try {
    kod = main(process.argv.slice(2))
  } catch (e) {
    process.stderr.write(`gorev-damga: ${(e && e.message) || e}\n`)
  }
  process.exit(kod)
}

module.exports = { main }
