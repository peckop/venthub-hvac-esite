/**
 * INV-SEARCH-BEHAVIOR-1 — yeni vaka ölçütlerinin SAF karar fonksiyonları (URN-168, 16 Kasım 2026).
 *
 * Neden ayrı dosya: `arama-davranisi.mjs` canlı veritabanına bağlanır ve vitest'te (CI'da sahte
 * adres) koşamaz. Karar mantığı buraya saf fonksiyon olarak çıkarıldı ki sabotaj testi
 * (`arama-davranisi.test.ts`) bozuk girdiyle "ihlal döner mi" diye CI'da ölçebilsin. Fonksiyon
 * hata metni döndürür; boş/`null` = geçti. Veritabanı sorgusu yok, yan etki yok.
 *
 * Cetvel: `docs/standards/arama-standard.md` §8 vaka 18-23.
 */

const kucuk = (s) => String(s ?? '').toLocaleLowerCase('tr-TR')
const markaMi = (r, marka) => kucuk(r.brand).includes(marka)

/**
 * Marka katalogdaysa (aktif ≥ 1): ≥ 1 sonuç ve HEPSİ o marka; katalogda yoksa: 0 sonuç.
 * Sabit sayı yok (cetvel K8.3): ürün eklenince/çıkınca kırılmaz.
 */
export function markaVeyaSifir(rows, marka, markaAktif) {
  const n = rows.length
  if (markaAktif > 0) {
    if (n === 0) return `0 sonuc (marka "${marka}" katalogda ${markaAktif} aktif urun)`
    const disi = rows.filter((r) => !markaMi(r, marka)).length
    if (disi > 0) return `marka disi sonuc ${disi}/${n} (beklenen 0, marka "${marka}")`
    if (n > markaAktif) return `marka TAVANI asildi: ${n} > ${marka} aktif ${markaAktif}`
    return null
  }
  return n === 0 ? null : `marka "${marka}" katalogda YOK ama ${n} sonuc geldi (beklenen 0)`
}

/** Sıfır sonuç beklenen vaka (katalogda olmayan terim). Gerçek ürün eklenirse vaka güncellenir. */
export function sifirBeklenen(rows) {
  return rows.length === 0 ? null : `0 sonuc beklenirken ${rows.length}`
}

/**
 * İlk `k` sonucun ADI beklenen ibareyi taşır ("125 mm fan" → ilk dört Lineo 125 idi; E 254 değil).
 * Ad isabeti yerine ibare ölçülür: ada ve kataloğa bağlı sabit sayı yok, yalnız "çap ibaresi
 * ilk sıralarda" davranışı ölçülür.
 */
export function ilkSonuclarAdIbaresi(adlar, ibare, k) {
  if (adlar.length === 0) return '0 sonuc — sira olculemez'
  const ilk = adlar.slice(0, k)
  const eksik = ilk.filter((a) => !kucuk(a).includes(kucuk(ibare)))
  return eksik.length === 0 ? null : `ilk ${ilk.length} sonucun ${eksik.length}'i "${ibare}" ibaresini tasimiyor: ${eksik.slice(0, 2).join(' | ')}`
}

/** Öneri listesinde `type=category` olan ve etiketi ibareyi taşıyan en az bir satır (URN-139). */
export function oneriKategoriVar(oneriler, ibare) {
  const kat = oneriler.filter((o) => o?.type === 'category')
  if (kat.length === 0) return `kategori onerisi YOK (${oneriler.length} oneri)`
  return kat.some((o) => kucuk(o.label).includes(kucuk(ibare)))
    ? null
    : `kategori onerisi var ama etiketi "${ibare}" tasimiyor: ${kat.map((o) => o.label).join(' | ')}`
}
