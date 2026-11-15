'use strict'
/**
 * KANCA SAYACI — ARC-323 (OPS-292 Adım 2 onayı, ARC-320 ÖNCE ölçümünde 16 kanca ölçülemedi).
 *
 * NE YAPAR: `say(kanca, karar, sid)` pano dizinindeki `kanca-sayac.jsonl` dosyasına TEK satır ekler:
 *   { t: ISO zaman, sid: ilk 8 karakter ya da "-", kanca, karar }.
 * `karar` kapalı sözlüktür: kosu (çalıştı, karar vermedi) · allow · deny · ask · uyari · birak.
 * Amaç: dökümde izi kalmayan (sessiz izin veren ya da yalnız yan etki yazan) kancaların 7 günlük tetik ve durdurma
 * sayısını tahminle değil kayıtla vermek ("SONRA" ölçümü, ARC-320 alt adımı).
 *
 * NE YAPMAZ: davranışı değiştirmez. Hata fırlatmaz (kancayı ASLA bozmaz), stdout/stderr'e yazmaz, çıkış kodu vermez,
 * komut ya da araç girdisi yazmaz (yalnız kanca adı ve kısa karar). Kaydı OKUMAZ. 8 MB'ı geçerse `.1` yedeğine döner
 * (tek nesil). Vana: VENTHUB_KANCA_SAYAC_KAPALI=1. Test koşusunda (VITEST) yazmaz; pano dizini: VENTHUB_BOARD_DIR.
 */
const fs = require('node:fs')
const path = require('node:path')

const GUNLUK_ADI = 'kanca-sayac.jsonl'
const TAVAN_BAYT = 8 * 1024 * 1024 // ~84 bin satır/nesil: günde ~8 bin satırla 7 günlük ölçüm tek nesilde kalır (ARC-323 denetçi bulgusu)
const KARARLAR = ['kosu', 'allow', 'deny', 'ask', 'uyari', 'birak']

function panoDizini() {
  return require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'sage-enjeksiyon-defteri.cjs')).panoDizini()
}

/** SAF: kayıt nesnesi. Kanca adı ya da karar tanınmazsa null. */
function kayitUret(kanca, karar, sid, simdi = new Date()) {
  if (typeof kanca !== 'string' || !/^[a-z0-9][a-z0-9-]{1,60}$/.test(kanca)) return null
  if (!KARARLAR.includes(karar)) return null
  const s = typeof sid === 'string' && sid ? sid.replace(/[^A-Za-z0-9-]/g, '').slice(0, 8) : ''
  return { t: simdi.toISOString(), sid: s || '-', kanca, karar }
}

/** Kayda ekler; hata fırlatmaz. `pano` yalnız testte verilir. */
function say(kanca, karar, sid, pano) {
  try {
    if (!pano && (process.env.VENTHUB_KANCA_SAYAC_KAPALI === '1' || process.env.VITEST)) return false
    const k = kayitUret(kanca, karar, sid)
    if (!k) return false
    const dizin = pano || panoDizini()
    fs.mkdirSync(dizin, { recursive: true })
    const yol = path.join(dizin, GUNLUK_ADI)
    try {
      if (fs.statSync(yol).size > TAVAN_BAYT) fs.renameSync(yol, yol + '.1')
    } catch {
      /* günlük henüz yok: sorun değil */
    }
    fs.appendFileSync(yol, JSON.stringify(k) + '\n', 'utf8')
    return true
  } catch {
    return false
  }
}

module.exports = { say, kayitUret, GUNLUK_ADI, TAVAN_BAYT, KARARLAR }
