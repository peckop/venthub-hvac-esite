/**
 * TAŞINABİLİR KATALOG — YÜKLEME ÇEKİRDEĞİ (REC-212, yazma kolu). Saf: ağa, DB'ye, diske çıkmaz.
 *
 * NİÇİN AYRI: `katalog-geri-yukle.mjs` ağa çıkar; kilitleri ve fark ölçümünü orada sınamak
 * gerçek bir DB ister. Kilidin kendisi burada sınanır — sınav geçmeden kol açılmaz.
 *
 * KAPSAM (OPS onayı 2026-09-27): yazma kolu YALNIZ BOŞ ve CANLI OLMAYAN hedefe açılır.
 *   - Hedef canlı projeyse RED (adres canlı adresle aynı proje).
 *   - Hedefte ürün varsa RED (sayılamadıysa da RED — "bilinmiyor" boş sayılmaz).
 * Boş hedefte çakışma olmaz; bu yüzden upsert/sil-yaz ve tenant eşlemesi kararlarına gerek
 * kalmaz: id ve tenant_id paketteki gibi yazılır. Dolu/canlı hedefe yükleme AYRI karardır.
 */

export const SIRA = ['brands', 'categories', 'product_families', 'price_lists', 'products', 'product_prices', 'product_images']

/** Supabase adresinden proje kimliği: https://<ref>.supabase.co → ref; yerel adres → host:port. */
export function projeKimligi(adres) {
  if (!adres) return null
  let u
  try { u = new URL(adres) } catch { return null }
  const host = u.hostname.toLowerCase()
  if (host.endsWith('.supabase.co')) return host.split('.')[0]
  return `${host}:${u.port || (u.protocol === 'https:' ? '443' : '80')}`
}

/** @returns {{izin: boolean, sebep: string}} */
export function hedefKilidi({ hedefAdres, canliAdres, hedefUrunSayisi }) {
  const hedef = projeKimligi(hedefAdres)
  if (!hedef) return { izin: false, sebep: 'HEDEF ADRES YOK ya da okunamadı' }
  const canli = projeKimligi(canliAdres)
  if (!canli) return { izin: false, sebep: 'CANLI ADRES OKUNAMADI — hedefin canlı olmadığı kanıtlanamıyor' }
  if (hedef === canli) return { izin: false, sebep: `HEDEF CANLI PROJE (${hedef}) — bu kol canlıya yazmaz` }
  if (!Number.isInteger(hedefUrunSayisi)) return { izin: false, sebep: 'HEDEFTEKİ ÜRÜN SAYISI ÖLÇÜLEMEDİ — boş olduğu kanıtlanamıyor' }
  if (hedefUrunSayisi !== 0) return { izin: false, sebep: `HEDEF DOLU (${hedefUrunSayisi} ürün) — bu kol yalnız boş hedefe yazar` }
  return { izin: true, sebep: 'boş, canlı olmayan hedef' }
}

/**
 * Tablo içi yazım sırası. categories kendine bağlı (parent_id): ebeveyn çocuktan önce yazılmazsa
 * yabancı anahtar reddeder. Pakette olmayan ebeveyne bağlı satır = yarım paket → hata.
 */
export function tabloSirala(tablo, satirlar) {
  const idSirali = [...satirlar].sort((a, b) => String(a.id).localeCompare(String(b.id)))
  if (tablo !== 'categories') return idSirali
  const varOlan = new Set(idSirali.map(s => s.id))
  for (const s of idSirali) {
    if (s.parent_id != null && !varOlan.has(s.parent_id)) {
      throw new Error(`categories ${s.id}: ebeveyn ${s.parent_id} pakette YOK — yarım paket`)
    }
  }
  const yazildi = new Set()
  const cikti = []
  let kalan = idSirali
  while (kalan.length) {
    const hazir = kalan.filter(s => s.parent_id == null || yazildi.has(s.parent_id))
    if (!hazir.length) throw new Error(`categories: döngüsel ebeveyn zinciri (${kalan.length} satır)`)
    for (const s of hazir) { cikti.push(s); yazildi.add(s.id) }
    kalan = kalan.filter(s => !yazildi.has(s.id))
  }
  return cikti
}

export function partiler(satirlar, boy = 500) {
  const p = []
  for (let i = 0; i < satirlar.length; i += boy) p.push(satirlar.slice(i, i + boy))
  return p
}

const kolonlar = (satirlar) => {
  const k = new Set()
  for (const s of satirlar) for (const a of Object.keys(s)) k.add(a)
  return k
}

/**
 * Paket satırları ↔ hedef satırları.
 *
 * ⚠KÖR NOKTA (bu modülün niçini): satırlar yalnız PAKETİN kolonlarıyla karşılaştırılırsa,
 * paketten düşen bir kolon HİÇ görünmez — eski geri yükleyici tam olarak böyle ölçüyordu,
 * yani "sıfır fark" bir kolonun eksikliğini kanıtlamıyordu. Bu yüzden kolon KÜMESİ ayrıca
 * karşılaştırılır: hedefte olup pakette olmayan kolon = eksik paket (KIRMIZI); pakette olup
 * hedefte olmayan = hedef şeması eski (KIRMIZI). Hedef boşsa kolon kümesi bilinmez → ölçülmez.
 */
export function farkOlc(paketSatir, hedefSatir) {
  const pk = kolonlar(paketSatir)
  const hk = kolonlar(hedefSatir)
  const eksikKolon = hedefSatir.length ? [...hk].filter(k => !pk.has(k)).sort() : []
  const fazlaKolon = hedefSatir.length ? [...pk].filter(k => !hk.has(k)).sort() : []
  return { ...satirFarki(paketSatir, hedefSatir), eksikKolon, fazlaKolon }
}

export const farkSifirMi = (f) =>
  f.degisik === 0 && f.yeni === 0 && f.fazla === 0 && f.eksikKolon.length === 0 && f.fazlaKolon.length === 0

function satirFarki(paketSatir, hedefSatir) {
  const hedefMap = new Map(hedefSatir.map(h => [h.id, h]))
  let ayni = 0, degisik = 0, yeni = 0
  const ornekler = []
  for (const s of paketSatir) {
    const h = hedefMap.get(s.id)
    if (!h) { yeni++; if (ornekler.length < 20) ornekler.push(`YENİ ${s.id}`); continue }
    const hNorm = {}
    const sNorm = {}
    for (const k of Object.keys(s).sort()) { hNorm[k] = h[k] === undefined ? null : h[k]; sNorm[k] = s[k] }
    if (JSON.stringify(sNorm) === JSON.stringify(hNorm)) ayni++
    else { degisik++; if (ornekler.length < 20) ornekler.push(`DEĞİŞİK ${s.id}`) }
  }
  const paketId = new Set(paketSatir.map(s => s.id))
  const fazla = hedefSatir.filter(h => !paketId.has(h.id)).length
  return { ayni, degisik, yeni, fazla, ornekler }
}

/** Kaydın bitiş ölçütündeki sayılar — iki taraf aynı fonksiyonla sayılır. */
export function bitisSayilari(urunler, gorseller) {
  let teknikDeger = 0, aciklamaTr = 0, aciklamaEn = 0
  for (const u of urunler) {
    const t = u.technical_specs
    if (t && typeof t === 'object' && !Array.isArray(t)) teknikDeger += Object.keys(t).length
    const d = u.description_i18n
    if (d && typeof d === 'object') {
      if (typeof d.tr === 'string' && d.tr.trim()) aciklamaTr++
      if (typeof d.en === 'string' && d.en.trim()) aciklamaEn++
    }
  }
  return { urun: urunler.length, teknikDeger, aciklamaTr, aciklamaEn, gorselBagi: gorseller.length }
}
