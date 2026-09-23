/**
 * FARK KIYASI KAYNAĞIN ONDALIK HASSASİYETİNDE — saf fonksiyonlar.
 * Cetvel: product-schema-standard "Türetilen değer: kaynak basılıysa KAYNAK kazanır" (OPS hükmü 2026-09-23).
 *
 * Kaynak 48,6 (1 ondalık) basmışsa bizdeki 48,61 → 48,6 = aynı; kaynak hassasiyetinin ötesindeki basamak
 * farkı çelişki değildir. Eski kural %0,5 göreli toleranstı — hassasiyetle ilgisiz ve büyük sayılarda
 * gerçek farkı yutuyordu (1000 ↔ 1004 "aynı" çıkıyordu).
 *
 * ⚠ HASSASİYET KAYNAĞIN BASILI METNİNDEN okunur (`ham`), çevrilmiş sayıdan değil: Casals "4,00" basar,
 * sayıya çevrilince 4 olur ve sıfırlar kaybolur — o zaman bizdeki 4,4 "aynı" çıkardı (testte yakalandı).
 * `ham` yoksa sayının kendi ondalığına düşülür (en iyi çaba; o durumda satır bu sınırı taşır).
 */
export const ondalik = (x) => {
  const s = String(x)
  const i = s.indexOf('.')
  return i < 0 ? 0 : s.length - i - 1
}

/** Basılı kaynak metnindeki ondalık hane sayısı. `binlikNokta`: "5.500" gibi 3'lü noktalar binliktir. */
export const ondalikHam = (ham, binlikNokta = false) => {
  let t = String(ham).replace(/\s|m³\/h|m3\/h|kW|kg|W|A/gi, '')
  if (binlikNokta) t = t.replace(/\.(?=\d{3}(\D|$))/g, '')
  const m = /[.,](\d+)$/.exec(t)
  return m ? m[1].length : 0
}

/**
 * @param {number} bizim
 * @param {number} kaynak
 * @param {string | null} [ham] kaynağın basılı metni ("48,6", "4,00", "5.500")
 * @param {boolean} [binlikNokta]
 * @returns {boolean}
 */
export const kaynakHassasiyetindeAyni = (bizim, kaynak, ham = null, binlikNokta = false) => {
  const d = ham != null ? ondalikHam(ham, binlikNokta) : ondalik(kaynak)
  return +Number(bizim).toFixed(d) === +Number(kaynak).toFixed(d)
}
