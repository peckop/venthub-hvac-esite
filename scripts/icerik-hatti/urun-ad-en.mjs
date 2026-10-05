/**
 * ÜRÜN EN ADI — kural tabanlı dönüşüm (saf çekirdek; ağa, diske, DB'ye çıkmaz). Karar 116, REC-146.
 *
 * NİÇİN ÇEVİRİ DEĞİL KURAL: 2026-09-25 ölçümü, EN adı boş 417 aktif ürünün 251'inin adı dile bağlı
 * olmayan model adı (`Vortice MP 354 T`); EN sayfada TR adı göstermek doğru. 166 ürün ise EN sayfaya
 * Türkçe BİÇİM taşıyor ve adların tekil kelime envanterinde (104 kelime) Türkçe olan yalnız üç parça var:
 * `d/dk`, ondalık virgül, `HIZ ANAHTARI`. Bunlar sabit dönüşümdür; model kodu, marka, `1F`/`T`/`M`
 * gibi üretici kodları DOKUNULMAZ.
 *
 * KURALLAR (test: `__tests__/urun-ad-en.test.ts`):
 *   d/dk → rpm · rakam,rakam → rakam.rakam · HIZ ANAHTARI → SPEED CONTROLLER (sitenin EN kategori adı
 *   "Speed Controllers", üretici EN terimi "speed controller" — Casals plug fans s.4).
 *   Dönüşümden sonra ad TR'yle aynıysa EN adı GEREKMEZ (null). Sonuçta Türkçe harf, `d/dk`, rakam,rakam
 *   ya da "rakam.3 hane" (EN'de binlik mi ondalık mı belirsiz) kalırsa RED — elle bakılır, tahmin edilmez.
 */
const KURALLAR = [
  { ad: 'd/dk→rpm', re: /\bd\/dk\b/g, yeni: 'rpm' },
  { ad: 'ondalık virgül→nokta', re: /(\d),(\d)/g, yeni: '$1.$2' },
  { ad: 'HIZ ANAHTARI→SPEED CONTROLLER', re: /\bHIZ ANAHTARI\b/g, yeni: 'SPEED CONTROLLER' },
]
const KALINTI = [
  { ad: 'Türkçe harf', re: /[çğıöşüÇĞİÖŞÜ]/ },
  { ad: 'd/dk', re: /d\/dk/ },
  { ad: 'ondalık virgül', re: /\d,\d/ },
  { ad: 'belirsiz nokta+3 hane', re: /\d\.\d{3}(?!\d)/ },
  { ad: 'Türkçe kelime', re: /\b(HIZ|ANAHTARI|DEVİR|FANI|KANAL|ÇATI)\b/i },
]

/** @param {string} tr @returns {{en: string|null, kurallar: string[], red: string|null}} */
export function enAd(tr) {
  let en = tr
  const kurallar = []
  for (const k of KURALLAR) {
    const sonra = en.replace(k.re, k.yeni)
    if (sonra !== en) { kurallar.push(k.ad); en = sonra }
  }
  const kalinti = KALINTI.find(k => k.re.test(en))
  if (kalinti) return { en: null, kurallar, red: kalinti.ad }
  return { en: en === tr ? null : en, kurallar, red: null }
}

/**
 * @param {Array<{id: string, sku: string, name: string, status: string, name_i18n: Record<string, string> | null}>} urunler
 */
export function adYazimPlani(urunler) {
  const yazilacak = [], red = [], ayni = []
  let gereksiz = 0, dolu = 0
  for (const u of urunler) {
    if (u.status !== 'active') continue
    const canliEn = (u.name_i18n?.en ?? '').trim()
    const { en, kurallar, red: sebep } = enAd(u.name)
    if (canliEn && canliEn === en) { ayni.push(u.sku); continue }
    if (canliEn) { dolu++; continue } // elle yazılmış EN ad ezilmez; TR adı Türkçe olsa da RED değildir
    if (sebep) { red.push({ sku: u.sku, ad: u.name, sebep }); continue }
    if (en === null) { gereksiz++; continue }
    const onceki = u.name_i18n ?? {}
    yazilacak.push({ id: u.id, sku: u.sku, tr: u.name, en, kurallar, onceki_name_i18n: onceki, yeni_name_i18n: { ...onceki, en } })
  }
  return { yazilacak, red, ayni, gereksiz, dolu }
}
