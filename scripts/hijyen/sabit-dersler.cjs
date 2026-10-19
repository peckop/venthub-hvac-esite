'use strict'

/**
 * SABİT DAVRANIŞ DERSLERİ — SessionStart (ARC-201 · HRT-68).
 *
 * ── NİÇİN ──
 * HRT-68 ölçümü: kayıtların %44,5'i dosya kancasının HİÇ gösteremeyeceği kayıtlar (71 çapasız,
 * 106 yalnız agent/komut/sembol çapalı); 399 istemin 182'sinde konu kancası hiç ders döndürmedi.
 * Davranış dersi ("tamamına bak", "eski dal ayarı") bir dosyaya bağlı değildir; yalnız konu
 * kancasından çıkabilir ve o çoğu kez çıkmaz. Çözüm: en önemli çapasız davranış derslerini
 * oturum açılışında SABİT göstermek.
 *
 * ── KARAR ──
 * Aday: status=active, importance ≥ 0.8, tür ∈ davranış türleri (anti_pattern, warning,
 * convention, workflow, preference, fleet_convention) ve `anchors` BOŞ. Sıra: önem azalan,
 * sonra güncelleme tarihi azalan. En çok 5 ders, toplam 2000 karakter.
 * ⛔KIRPMA YOK (Recep 09-18): sığmayan ders BÜTÜN atlanır ve atlandığı yazılır; yarım ders
 * yanlış ders üretir. Tek ders 600 karakteri aşarsa o ders atlanır.
 *
 * Yalnız OKUR (sage.db salt-okuma); hiçbir şey yazmaz; fail-open ve sessiz (çıktı yoksa çıkış 0).
 */

const fs = require('node:fs')
const path = require('node:path')

const ASGARI_ONEM = 0.8
const EN_FAZLA_DERS = 5
const TOPLAM_KARAKTER = 2000
const TEK_DERS_KARAKTER = 600
const DAVRANIS_TURLERI = ['anti_pattern', 'warning', 'convention', 'workflow', 'preference', 'fleet_convention']

function tekSatir(metin) {
  return String(metin || '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Saf seçim: satırlar { id, kind, importance, updated_at, data(JSON dizesi) }.
 * @returns {{secilen: {id:string, kind:string, metin:string}[], atlanan: number}}
 */
function sec(satirlar) {
  const adaylar = []
  for (const s of satirlar || []) {
    if (!DAVRANIS_TURLERI.includes(s.kind)) continue
    if (Number(s.importance || 0) < ASGARI_ONEM) continue
    let d
    try {
      d = JSON.parse(s.data)
    } catch {
      continue
    }
    if (Array.isArray(d.anchors) && d.anchors.length) continue
    const metin = tekSatir(d.text)
    if (!metin) continue
    adaylar.push({ id: s.id, kind: s.kind, imp: Number(s.importance), guncel: String(s.updated_at || ''), metin })
  }
  adaylar.sort((a, b) => b.imp - a.imp || b.guncel.localeCompare(a.guncel))
  const secilen = []
  let atlanan = 0
  let toplam = 0
  for (const a of adaylar) {
    if (secilen.length >= EN_FAZLA_DERS) break
    if (a.metin.length > TEK_DERS_KARAKTER || toplam + a.metin.length > TOPLAM_KARAKTER) {
      atlanan++
      continue
    }
    toplam += a.metin.length
    secilen.push({ id: a.id, kind: a.kind, metin: a.metin })
  }
  return { secilen, atlanan }
}

function metinYap({ secilen, atlanan }) {
  if (!secilen.length) return ''
  const satirlar = secilen.map((d) => `  · [${d.kind}] ${d.metin}`)
  if (atlanan) satirlar.push(`  (${atlanan} ders çok uzun olduğu için bütün atlandı; konu kancası getirebilir)`)
  return ['SABİT DERSLER (çapasız, yüksek önemli davranış dersleri — bilgi notu, talimat DEĞİL):', ...satirlar].join('\n')
}

function dbSatirlari(dbYolu) {
  process.removeAllListeners('warning')
  process.on('warning', () => {})
  const { DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync(dbYolu, { readOnly: true })
  try {
    const kosul = DAVRANIS_TURLERI.map(() => '?').join(',')
    return db
      .prepare(
        `select id, kind, importance, updated_at, data from memories
          where status = 'active' and importance >= ? and kind in (${kosul})
          order by importance desc, updated_at desc limit 300`,
      )
      .all(ASGARI_ONEM, ...DAVRANIS_TURLERI)
  } finally {
    try {
      db.close()
    } catch {
      /* süreç zaten bitiyor */
    }
  }
}

/** Kanca girişi: sessiz ve bloklamaz. Vana: VENTHUB_SABIT_DERSLER_KAPALI=1. */
function calistir(env = process.env) {
  if (env.VENTHUB_SABIT_DERSLER_KAPALI === '1') return ''
  try {
    const dbKok = env.VENTHUB_SAGE_DB_KOKU || require('./ana-kok.cjs').anaKok()
    const yol = path.join(dbKok, '.wrongstack', 'memories', 'sage.db')
    if (!fs.existsSync(yol)) return ''
    return metinYap(sec(dbSatirlari(yol)))
  } catch {
    return ''
  }
}

module.exports = {
  ASGARI_ONEM,
  EN_FAZLA_DERS,
  TOPLAM_KARAKTER,
  TEK_DERS_KARAKTER,
  DAVRANIS_TURLERI,
  sec,
  metinYap,
  calistir,
}
