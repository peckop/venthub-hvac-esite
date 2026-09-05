#!/usr/bin/env node
/**
 * COMPANION BORÇ LİSTESİ — uyku kipinin defterdarı (REC-142).
 *
 * NİÇİN AYRI BETİK, NİÇİN TESTTEN DEĞİL: borç listesi bir DOSYA olmalı (uyandırma günü
 * iş emri buradan çıkacak), ama onu test koşumu yazamaz — test koşumunda repoya dosya
 * yazmak çalışma ağacını kirletir ve tazelik/INV-DOC-4b kapılarıyla çarpışır. Kapı kolu
 * yalnız ÇIKTIYA basar; kalıcı kayıt bu betiğin işi. (OPS hükmü, 2026-09-05.)
 *
 * KOŞUM: gün sonu, OPS. Çıktı `docs/proje-takip/companion-borc.md` — defterin demet 11
 * kapsamında, `hafiza-sinavi-sonuc.md` emsali. `.gitignore` DEĞİL: bu dosya deftere gider.
 *
 * ⭐NİÇİN "SAYIM" DEĞİL "LİSTE": uyandırma günü lazım olan şey sayı değil, hangi dosya ve
 * ne kadar süredir borçlu olduğudur. Sayı "ne kadar" der; liste "ne yapacağım" der.
 *
 * ⚠ÖLÇEMEMEK GEÇMEK DEĞİLDİR: sayaç git okuyamazsa bu betik SIFIR borç yazmaz, "ölçülemedi"
 * yazar ve 1 ile çıkar. Boş bir borç listesi, borcun bittiği anlamına gelir — o yalanı
 * dosyaya yazmak, kapının susmasından beterdir.
 */
'use strict'

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const CIKTI = 'docs/proje-takip/companion-borc.md'

function kok() {
  return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
}

function main() {
  const KOK = kok()
  const anahtar = require('./tasiyici-anahtari.cjs')
  const sayac = require('./companion-sayim.cjs')
  const durum = anahtar.oku(KOK)

  let b
  try {
    b = sayac.olc({ kok: KOK })
  } catch (e) {
    process.stderr.write(`[companion-borc] OLCULEMEDI: ${(e && e.message) || e}\n`)
    process.stderr.write('[companion-borc] Dosya YAZILMADI — bos liste "borc bitti" yalanidir.\n')
    process.exit(1)
  }

  // ⭐DAMGA BETİKTEN ÜRETİLİR, ELLE YAZILMAZ. 2026-09-04'te elle yazılan bir damga üç
  // turda ancak düzeldi (önce 3 saat geri, sonra 23 dakika ileri) ve ileri damga bir
  // tazelik kapısını KÖR edecekti. Tek biçim: ISO, UTC, saniyeli.
  const damga = new Date().toISOString()

  const satirlar = []
  satirlar.push('# Companion borç listesi (üretilmiş — elle düzenleme)')
  satirlar.push('')
  satirlar.push(`<!-- ureten: scripts/hijyen/companion-borc.cjs · damga: ${damga} -->`)
  satirlar.push('')
  satirlar.push(`**Taşıyıcı:** ${durum.durum}${durum.okundu ? '' : ` (ANAHTAR OKUNAMADI: ${durum.sebep})`}`)
  satirlar.push('')
  satirlar.push('> Bu dosya UYANDIRMA GÜNÜNÜN İŞ EMRİDİR (companion-doc-standard §C9.4).')
  satirlar.push('> Taşıyıcı açıldığında bu listedeki her satır bir yapılacak iştir; liste')
  satirlar.push('> boşalmadan kapılar kırmızı verir ve bu DOĞRU davranıştır.')
  satirlar.push('')
  satirlar.push(`## C4 — companion'ı OLMAYAN kaynaklar (${b.eksik.length})`)
  satirlar.push('')
  if (b.eksik.length === 0) {
    satirlar.push('_yok_')
  } else {
    satirlar.push('| kaynak | borç yaşı (gün) |')
    satirlar.push('|---|---|')
    for (const e of b.eksik) satirlar.push(`| \`${e.yol}\` | ${e.yasGun} |`)
  }
  satirlar.push('')
  satirlar.push(`## C5 — kaynağından ESKİ companion'lar (${b.bayat.length})`)
  satirlar.push('')
  if (b.bayat.length === 0) {
    satirlar.push('_yok_')
  } else {
    satirlar.push('| companion |')
    satirlar.push('|---|')
    for (const y of b.bayat) satirlar.push(`| \`${y}\` |`)
  }
  satirlar.push('')
  satirlar.push('## Eşik penceresi (henüz borç DEĞİL, sıradaki)')
  satirlar.push('')
  satirlar.push(`- companion'ı olmayan, ${'7'} gün dolmamış: **${b.eksikTaze}**`)
  satirlar.push(`- bayat, ${'7'} gün dolmamış: **${b.bayatTaze}**`)
  satirlar.push('')
  satirlar.push('⚠Bu iki sayı, taşıyıcı kapalı kaldıkça **borca dönüşecek** olanlardır —')
  satirlar.push('uyku ne kadar uzarsa uyandırma o kadar pahalıdır.')
  satirlar.push('')
  satirlar.push('## Kapsam dışı (tarihsel borç)')
  satirlar.push('')
  satirlar.push(`- eksik: ${b.tarihselEksik.length} · bayat: ${b.tarihselBayat.length}`)
  satirlar.push(`- kapı kapsamındaki kaynak: ${b.kapidakiKaynak} / ${b.kaynakSayisi}`)
  satirlar.push('')

  const hedef = path.join(KOK, CIKTI)
  fs.mkdirSync(path.dirname(hedef), { recursive: true })
  fs.writeFileSync(hedef, satirlar.join('\n'), 'utf8')
  process.stdout.write(
    `[companion-borc] yazildi: ${CIKTI}\n` +
    `[companion-borc] C4 eksik ${b.eksik.length} · C5 bayat ${b.bayat.length} · ` +
    `pencerede ${b.eksikTaze + b.bayatTaze}\n`,
  )
}

if (require.main === module) main()
module.exports = { CIKTI }
