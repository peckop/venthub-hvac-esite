#!/usr/bin/env node
/**
 * DOSYA ALANI ÖLÇÜMÜ (HRT-65, OPS-168 O3, 2026-10-16): rol kartlarındaki "Dosyalar" satırını tahmin değil git geçmişi belirlesin.
 * Son N günün (varsayılan 14) birleşen commit'lerini alır, her commit'in rolünü başlık önekinden çıkarır ("ARAÇ (ARC-152): ..." → ARAC),
 * dokunduğu yolları iki-üç düzeyli dizin öbeklerine toplar ve rol başına tablo verir. İki ya da daha çok rolün dokunduğu öbek "ORTAK" olarak
 * ayrıca listelenir (çift sahipli yol OPS'a gider). Salt-okuma; hiçbir dosyaya yazmaz.
 *
 * Kullanım: node scripts/belge/dosya-alani-olc.cjs [--gun=14] [--dal=origin/master] [--json]
 * Sınır: rolü öneksiz commit ("chore ...", "Merge ...") hiçbir role yazılmaz, "öneksiz" sayacında görünür.
 */
'use strict'
const { execFileSync } = require('node:child_process')

const ROLLER = ['3D', 'ADMIN', 'ALTYAPI', 'ARAC', 'BLOG', 'EDGE', 'GEO-SEO', 'HARITA', 'I18N', 'KATALOG', 'MARKA', 'MEVZUAT', 'OPS', 'SATIS', 'TAKIP', 'TASARIM', 'URUN', 'YETENEK']

/** "HARİTA" → "HARITA", "ÜRÜN" → "URUN" (Türkçe harfler ASCII'ye iner, büyük harf). */
function rolAdi(oge) {
  const s = oge
    .toLocaleUpperCase('tr')
    .replace(/İ/g, 'I')
    .replace(/Ç/g, 'C')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
  return ROLLER.includes(s) ? s : null
}

/** Commit başlığından rol: ilk boşluğa ya da " (" öncesine kadar olan öbek. */
function basliktanRol(baslik) {
  const m = /^([^\s(:]+)/.exec(baslik.trim())
  return m ? rolAdi(m[1]) : null
}

/** Yolu öbeğe indir: src/lib/seo/jsonld.ts → src/lib/seo/ ; docs/standards/x.md → docs/standards/ ; kökteki dosya → kendisi. */
function obek(yol) {
  const p = yol.split('/')
  if (p.length === 1) return yol
  if (p[0] === 'src' && p.length > 3) return p.slice(0, 3).join('/') + '/'
  return p.slice(0, Math.min(p.length - 1, 2)).join('/') + '/'
}

function olc({ gun = 14, dal = 'origin/master' } = {}) {
  const cikti = execFileSync('git', ['log', `--since=${gun} days ago`, '--no-merges', '--name-only', '--format=@@%s', dal], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  const roller = {}
  let onekSiz = 0
  let rol = null
  let sayac = 0
  for (const satir of cikti.split(/\r?\n/)) {
    if (satir.startsWith('@@')) {
      sayac++
      rol = basliktanRol(satir.slice(2))
      if (!rol) onekSiz++
      continue
    }
    if (!satir || !rol) continue
    const o = obek(satir)
    roller[rol] = roller[rol] || {}
    roller[rol][o] = (roller[rol][o] || 0) + 1
  }
  const ortak = {}
  for (const [r, obekler] of Object.entries(roller)) {
    for (const o of Object.keys(obekler)) (ortak[o] = ortak[o] || []).push(r)
  }
  for (const o of Object.keys(ortak)) if (ortak[o].length < 2) delete ortak[o]
  return { gun, dal, commit: sayac, onekSiz, roller, ortak }
}

function tablo(sonuc, enCok = 12) {
  const s = [`# Dosya alanı ölçümü: son ${sonuc.gun} gün, ${sonuc.dal}, ${sonuc.commit} commit (${sonuc.onekSiz} öneksiz)`, '']
  for (const r of Object.keys(sonuc.roller).sort()) {
    const siralı = Object.entries(sonuc.roller[r]).sort((a, b) => b[1] - a[1]).slice(0, enCok)
    s.push(`## ${r}`, '', '| Yol öbeği | Dosya dokunuşu |', '|---|---|', ...siralı.map(([o, n]) => `| ${o} | ${n} |`), '')
  }
  s.push('## ORTAK (iki ya da daha çok rol dokunmuş; sahibi OPS belirler)', '', '| Yol öbeği | Roller |', '|---|---|')
  for (const [o, rs] of Object.entries(sonuc.ortak).sort((a, b) => b[1].length - a[1].length)) s.push(`| ${o} | ${rs.join(', ')} |`)
  return s.join('\n')
}

module.exports = { rolAdi, basliktanRol, obek, olc, tablo }

if (require.main === module) {
  const arg = (ad, varsayilan) => {
    const a = process.argv.find((x) => x.startsWith(`--${ad}=`))
    return a ? a.slice(ad.length + 3) : varsayilan
  }
  const sonuc = olc({ gun: Number(arg('gun', 14)), dal: arg('dal', 'origin/master') })
  process.stdout.write((process.argv.includes('--json') ? JSON.stringify(sonuc, null, 2) : tablo(sonuc)) + '\n')
}
