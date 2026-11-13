#!/usr/bin/env node
/**
 * ZAMAN (ARC-302): gün adını ve tarihi TAHMİN ETME, bu komutu çalıştır. 13 Kasım 2026'da bir ajan gün adını tahminle yazdı.
 * Çıktı tek satır, Europe/Istanbul: "Cuma 13 Kasım 2026 15:05 TSİ (ISO hafta 46)". Makinenin saat dilimine bağlı değildir.
 * Kullanım: node scripts/arac/zaman.cjs            → şimdi
 *           node scripts/arac/zaman.cjs --an <ISO> → verilen an (test ve geçmiş tarih sorusu için)
 */
const BICIM = new Intl.DateTimeFormat('tr-TR', {
  timeZone: 'Europe/Istanbul',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** ISO 8601 hafta numarası: yerel (TSİ) takvim gününün perşembesine göre. */
function isoHafta(yil, ay, gun) {
  const d = new Date(Date.UTC(yil, ay - 1, gun))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  return Math.ceil(((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 86400000 + 1) / 7)
}

function zamanSatiri(an) {
  const parcalar = Object.fromEntries(BICIM.formatToParts(an).map((p) => [p.type, p.value]))
  const hafta = isoHafta(Number(parcalar.year), ayNo(an), Number(parcalar.day))
  const gunAdi = parcalar.weekday.charAt(0).toLocaleUpperCase('tr') + parcalar.weekday.slice(1)
  return `${gunAdi} ${parcalar.day} ${parcalar.month} ${parcalar.year} ${parcalar.hour}:${parcalar.minute} TSİ (ISO hafta ${hafta})`
}

/** Verilen anın İstanbul takvimindeki ay numarası (1-12). */
function ayNo(an) {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Istanbul', month: 'numeric' }).format(an))
}

module.exports = { zamanSatiri, isoHafta }

if (require.main === module) {
  const i = process.argv.indexOf('--an')
  const an = i >= 0 ? new Date(process.argv[i + 1]) : new Date()
  if (Number.isNaN(an.getTime())) {
    process.stderr.write('zaman: geçersiz an (ISO biçimi bekleniyor: 2026-11-13T12:05:00Z)\n')
    process.exit(2)
  }
  process.stdout.write(zamanSatiri(an) + '\n')
}
