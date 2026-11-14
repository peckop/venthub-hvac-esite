#!/usr/bin/env node
'use strict'
/**
 * MOD DEPOSU YEDEĞİ (ARC-134, karar 363 madde 7). C:/Users/alize/mods (kendi git deposu) özel uzak depoya
 * (peckop/venthub-mods, dal `yedek`) yedeklenir. Yalnız kaynak: sır kalıbı görülürse commit atılmaz.
 *
 *   node scripts/arac/mod-yedek.cjs            → commit (değişiklik varsa) + itme + durum dosyası
 *   node scripts/arac/mod-yedek.cjs --yerel    → itme yok (deneme)
 *   node scripts/arac/mod-yedek.cjs --yas      → son yedek yaşını yaz
 *
 * Durum: ~/.claude/mod-durum/mod-yedek.json { ozet, seviye, saat, sonYedek } — kokpit "son yedek" satırı buradan okur.
 * Ortam: MODS_DIZINI (varsayılan ~/mods), MOD_DURUM_DIZINI (varsayılan ~/.claude/mod-durum).
 * Çıkış: 0 yedeklendi ya da değişiklik yok · 1 sır kalıbı / hata · 2 uzak yok.
 */
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { sirKalibiVar } = require('../hijyen/hafiza-yedek.cjs')

const UZAK_DAL = 'yedek'

function modsDizini() {
  return process.env.MODS_DIZINI || path.join(os.homedir(), 'mods')
}
function durumDosyasi() {
  return path.join(process.env.MOD_DURUM_DIZINI || path.join(os.homedir(), '.claude', 'mod-durum'), 'mod-yedek.json')
}
function git(dir, args, ms = 20000) {
  return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, timeout: ms })
}

function durumYaz(seviye, ozet, sonYedek, simdi) {
  const hh = String(simdi.getHours()).padStart(2, '0') + ':' + String(simdi.getMinutes()).padStart(2, '0')
  try {
    fs.mkdirSync(path.dirname(durumDosyasi()), { recursive: true })
    fs.writeFileSync(durumDosyasi(), JSON.stringify({ ozet, seviye, saat: hh, sonYedek }))
  } catch {
    /* durum yazılamazsa yedek yine geçerli */
  }
}

function sonYedek() {
  try {
    return JSON.parse(fs.readFileSync(durumDosyasi(), 'utf8')).sonYedek || null
  } catch {
    return null
  }
}

/** @returns {{ durum: 'yok-depo'|'yok-uzak'|'yerel'|'sir-kalibi'|'commit'|'hata', push?: boolean }} */
function yedekle({ dir = modsDizini(), push = true, simdi = new Date() } = {}) {
  try {
    if (!fs.existsSync(path.join(dir, '.git'))) return { durum: 'yok-depo' }
    if (push && git(dir, ['remote']).trim() === '') return { durum: 'yok-uzak' }
    git(dir, ['add', '-A'])
    if (git(dir, ['diff', '--cached', '--name-only']).trim() !== '') {
      if (sirKalibiVar(git(dir, ['diff', '--cached', '-U0']))) {
        git(dir, ['reset', '-q'])
        return { durum: 'sir-kalibi' }
      }
      git(dir, ['commit', '-q', '-m', 'mod yedek ' + simdi.toISOString().slice(0, 16) + 'Z'])
    }
    if (!push) return { durum: 'yerel', push: false }
    git(dir, ['push', '-q', 'origin', 'master:' + UZAK_DAL], 40000)
    return { durum: 'commit', push: true }
  } catch (e) {
    return { durum: 'hata', mesaj: String(e.message || e).split('\n')[0].slice(0, 160) }
  }
}

function main(argv) {
  const simdi = new Date()
  if (argv.includes('--yas')) {
    const s = sonYedek()
    process.stdout.write(s ? 'son yedek ' + s + '\n' : 'yedek kaydı yok\n')
    return 0
  }
  const r = yedekle({ push: !argv.includes('--yerel'), simdi })
  if (r.durum === 'commit') durumYaz('iyi', 'mod yedeği alındı', simdi.toISOString(), simdi)
  else if (r.durum === 'yerel') durumYaz('uyari', 'mod yedeği yalnız yerel commit (itilmedi)', sonYedek(), simdi)
  else durumYaz('hata', 'mod yedeği ALINAMADI: ' + r.durum, sonYedek(), simdi)
  process.stdout.write(r.durum + (r.mesaj ? ': ' + r.mesaj : '') + '\n')
  return r.durum === 'commit' || r.durum === 'yerel' ? 0 : r.durum === 'yok-uzak' ? 2 : 1
}

module.exports = { yedekle, UZAK_DAL }
if (require.main === module) process.exit(main(process.argv.slice(2)))
