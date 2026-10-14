#!/usr/bin/env node
/**
 * WRONGSTACK MCP SUNUCULARI BU PENCEREDE KULLANILABİLİR Mİ — açılış satırı (ARC-128, 14 Ekim 2026).
 *
 * OLAY: OPS penceresinin WrongStack bağlantı sorunu `disabledMcpjsonServers`'tan çıktı ve açılışta HİÇBİR satır
 * görünmedi; "posta kutusu ÖLÇÜLEMEDİ" satırı sunucunun cevapsızlığını yakalıyor ama sunucunun AYARDA devre dışı
 * bırakıldığını ayırt etmiyordu. Sebep açılışta söylenseydi pencere kendi adına saatlerce sebebi aramazdı.
 *
 * NE ÖLÇER (yalnız AYAR, bağlantı DEĞİL): dört sunucu (wrongstack-kanban, -mailbox, -sage, -codebase-index)
 *   1) `disabledMcpjsonServers` içinde adı geçiyor mu: `<cwd>/.claude/settings.json`, `settings.local.json`,
 *      kök deponun aynıları, `~/.claude/settings.json` ve `~/.claude.json` içindeki proje kaydı;
 *   2) kök deponun `.mcp.json` dosyasında tanımlı mı.
 * Gerçek bağlantı durumunu (sunucu ayakta mı) SessionStart anında ölçemez; o iş "posta kutusu" sayacındadır.
 *
 * ⛔"OKUYAMADIM" ≠ "DEVRE DIŞI YOK": ayar dosyası bozuksa ya da okunamıyorsa satır "OLCULEMEDI" der, temiz sayılmaz.
 * Salt-okuma; hiçbir dosyaya yazmaz; kanca açılışını bozmaz (fail-open, çağıran try/catch eder).
 */
'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')

const SUNUCULAR = ['wrongstack-kanban', 'wrongstack-mailbox', 'wrongstack-sage', 'wrongstack-codebase-index']

/** @returns {{veri?: any, yok?: boolean, hata?: string}} */
function jsonOku(dosya) {
  let ham
  try {
    ham = fs.readFileSync(dosya, 'utf8')
  } catch (e) {
    if (e && e.code === 'ENOENT') return { yok: true }
    return { hata: (e && (e.code || e.message)) || 'okunamadi' }
  }
  try {
    return { veri: JSON.parse(ham.replace(/^﻿/, '')) }
  } catch (e) {
    return { hata: 'JSON bozuk' }
  }
}

function norm(p) {
  return path.resolve(String(p)).split(path.sep).join('/').toLowerCase()
}

/**
 * @param {{cwd?: string, kok?: string, home?: string}} secenek
 * @returns {{devreDisi: {ad: string, kaynak: string}[], tanimsiz: string[], okunamayan: {dosya: string, sebep: string}[], bakilanDosya: number}}
 */
function incele(secenek = {}) {
  const home = secenek.home || os.homedir()
  const dizinler = [...new Set([secenek.cwd, secenek.kok].filter(Boolean).map((d) => path.resolve(d)))]
  const dosyalar = []
  for (const d of dizinler) {
    dosyalar.push(path.join(d, '.claude', 'settings.json'), path.join(d, '.claude', 'settings.local.json'))
  }
  dosyalar.push(path.join(home, '.claude', 'settings.json'))

  const devre = new Map()
  const okunamayan = []
  let bakilan = 0
  const isle = (liste, kaynak) => {
    if (!Array.isArray(liste)) return
    for (const ad of liste) {
      if (SUNUCULAR.includes(ad) && !devre.has(ad)) devre.set(ad, kaynak)
    }
  }

  for (const f of [...new Set(dosyalar)]) {
    const r = jsonOku(f)
    if (r.yok) continue
    bakilan += 1
    if (r.hata) okunamayan.push({ dosya: f, sebep: r.hata })
    else if (r.veri && typeof r.veri === 'object') isle(r.veri.disabledMcpjsonServers, `${path.basename(f)} disabledMcpjsonServers`)
  }

  const kullanici = jsonOku(path.join(home, '.claude.json'))
  if (kullanici.hata) {
    okunamayan.push({ dosya: path.join(home, '.claude.json'), sebep: kullanici.hata })
  } else if (kullanici.veri && kullanici.veri.projects && typeof kullanici.veri.projects === 'object') {
    bakilan += 1
    const hedefler = dizinler.map(norm)
    for (const [yol, kayit] of Object.entries(kullanici.veri.projects)) {
      if (hedefler.includes(norm(yol)) && kayit && typeof kayit === 'object') {
        isle(kayit.disabledMcpjsonServers, '~/.claude.json projects disabledMcpjsonServers')
      }
    }
  }

  let tanimsiz = []
  const kokDizin = secenek.kok || secenek.cwd
  if (kokDizin) {
    const m = jsonOku(path.join(kokDizin, '.mcp.json'))
    if (m.hata) okunamayan.push({ dosya: path.join(kokDizin, '.mcp.json'), sebep: m.hata })
    else if (m.veri) {
      const tanimli = m.veri.mcpServers && typeof m.veri.mcpServers === 'object' ? Object.keys(m.veri.mcpServers) : []
      tanimsiz = SUNUCULAR.filter((ad) => !tanimli.includes(ad))
    }
  }

  return {
    devreDisi: SUNUCULAR.filter((ad) => devre.has(ad)).map((ad) => ({ ad, kaynak: devre.get(ad) })),
    tanimsiz,
    okunamayan,
    bakilanDosya: bakilan,
  }
}

/** Açılış satırı: uyarı varsa uyarı, yoksa tek temiz satır. */
function acilisSatiri(sonuc) {
  const parcalar = []
  if (sonuc.devreDisi.length) {
    parcalar.push(
      '⚠WRONGSTACK MCP DEVRE DISI: ' +
        sonuc.devreDisi.map((d) => `${d.ad} (${d.kaynak})`).join(', ') +
        ' — bu pencerede KULLANILAMAZ; ayarı OPS duzeltir, kendin degistirme.',
    )
  }
  if (sonuc.tanimsiz.length) {
    parcalar.push('⚠WRONGSTACK MCP .mcp.json\'da TANIMSIZ: ' + sonuc.tanimsiz.join(', ') + '.')
  }
  if (sonuc.okunamayan.length) {
    parcalar.push(
      '⚠WRONGSTACK MCP devre disi durumu OLCULEMEDI (ayar dosyasi okunamadi: ' +
        sonuc.okunamayan.map((o) => `${path.basename(o.dosya)} ${o.sebep}`).join(', ') +
        ').',
    )
  }
  if (!parcalar.length) return `WRONGSTACK MCP: ${SUNUCULAR.length}/${SUNUCULAR.length} sunucu tanimli, devre disi yok (ayar; baglanti degil).\n`
  return parcalar.join('\n') + '\n'
}

/** Uyarı satırı var mı (kanca öncelik seçimi için). */
function uyariVar(sonuc) {
  return sonuc.devreDisi.length > 0 || sonuc.tanimsiz.length > 0 || sonuc.okunamayan.length > 0
}

module.exports = { SUNUCULAR, incele, acilisSatiri, uyariVar }

if (require.main === module) {
  const s = incele({ cwd: process.cwd(), kok: path.resolve(__dirname, '..', '..') })
  process.stdout.write(acilisSatiri(s))
  process.exit(uyariVar(s) ? 1 : 0)
}
