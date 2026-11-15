#!/usr/bin/env node
'use strict'

/**
 * SIRADAKİ KART NUMARASI — ARC-325 (OPS-292 DÜZELT: "add_task yanıtı numara döndürmüyor, numarayı bulmak 5-6 çağrı").
 *
 * NİÇİN: WrongStack add_task kartın numarasını üretmez; numara başlığa elle yazılır ve "pano sayacından alınır" kuralı
 * fiilen "en büyük numarayı bul, bir ekle" demektir. Bu araç o aramayı TEK çağrıya indirir ve add_task sonrası kanca
 * (.claude/hooks/kart-numara-bildirimi.cjs) aynı cümleyi bir sonraki kart için bağlama yazar.
 *
 * KULLANIM: node scripts/board/siradaki-kart-no.cjs ARC      → "ARC: en büyük 325, sıradaki ARC-326 (n kart, arşivsiz)"
 *           node scripts/board/siradaki-kart-no.cjs ARC --json
 * Kaynak: scripts/board/kanban-anlik.cjs --kisa (salt-okunur SQLite, TÜM panolar; ön ek numarası panolar arası ortaktır).
 * SINIR: arşivli kartlar okunmaz (kanban-anlik kuralı); arşivlenmiş daha büyük numara varsa araç onu görmez. Aynı sınır
 * kart-onek-tekrari kapısında da vardır; çakışma kapısı yine ikinci kartı reddeder.
 * Alt kart ekleri ("ALT-38g", "REC-400 H1") numara sayılmaz: yalnız saf "ÖN-sayı" başlıkları (ek harfsiz) sayılır.
 */

const { spawnSync } = require('node:child_process')
const path = require('node:path')

const ANLIK = path.join(__dirname, 'kanban-anlik.cjs')
const ON_EK = /^[A-Za-z0-9]{2,6}$/

/** "ARC-326 · başlık" → { onek: 'ARC', sayi: 326 }; numara yoksa ya da alt kart eki varsa null. */
function numaraCoz(baslik) {
  const m = /^\s*([A-Za-z0-9]{2,6})-(\d{1,5})(?![A-Za-z0-9])/.exec(String(baslik || ''))
  return m ? { onek: m[1].toUpperCase(), sayi: Number(m[2]) } : null
}

/** SAF: başlık listesi + ön ek → { onek, enBuyuk, siradaki, kartSayisi }. Ön ekte kart yoksa enBuyuk 0. */
function siradaki(basliklar, onek) {
  const o = String(onek || '').toUpperCase()
  let enBuyuk = 0
  let kartSayisi = 0
  for (const b of basliklar) {
    const n = numaraCoz(b)
    if (!n || n.onek !== o) continue
    kartSayisi++
    if (n.sayi > enBuyuk) enBuyuk = n.sayi
  }
  return { onek: o, enBuyuk, siradaki: o + '-' + (enBuyuk + 1), kartSayisi }
}

/** Canlı panodan başlıkları okur; okunamazsa null (çağıran fail-open karar verir). */
function basliklariOku(extraArgs = []) {
  try {
    const r = spawnSync(process.execPath, [ANLIK, '--kisa', ...extraArgs], { encoding: 'utf8', timeout: 5000, maxBuffer: 64 * 1024 * 1024 })
    if (r.status !== 0 || !r.stdout) return null
    const j = JSON.parse(r.stdout)
    if (!j || j.ok !== true || !Array.isArray(j.tasks)) return null
    return j.tasks.map((t) => (t && t.task && t.task.title) || '')
  } catch {
    return null
  }
}

function main(argv) {
  const onek = String(argv.find((a) => !a.startsWith('--')) || '').toUpperCase()
  const json = argv.includes('--json')
  if (!ON_EK.test(onek)) {
    process.stdout.write('kullanım: node scripts/board/siradaki-kart-no.cjs <ÖN-EK> [--json]   (örn. ARC)\n')
    return 0
  }
  const basliklar = basliklariOku()
  if (!basliklar) {
    process.stdout.write('pano okunamadı (kanban-anlik); numarayı elle bul: node scripts/board/kanban-anlik.cjs --kisa\n')
    return 0
  }
  const s = siradaki(basliklar, onek)
  process.stdout.write(
    json
      ? JSON.stringify(s) + '\n'
      : `${s.onek}: en büyük ${s.enBuyuk}, sıradaki ${s.siradaki} (${s.kartSayisi} kart, arşivsiz)\n`,
  )
  return 0
}

if (require.main === module) process.exit(main(process.argv.slice(2)))

module.exports = { numaraCoz, siradaki, basliklariOku, main, ON_EK }
