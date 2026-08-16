/**
 * TCKN / VKN doğrulaması — fatura kimliği.
 *
 * NİÇİN VAR (T055-VH · 2026-08-16)
 *
 * Fatura, siparişin `invoice_type` + `invoice_info` alanlarından kesilir. 2026-08-16
 * ölçümünde bu alanların **hiçbir yerde doğrulanmadığı** görüldü: `validateAddress`
 * yalnız adres/il/ilçe bakıyor, `StepAddressInfo` ise sadece rakam-dışını ayıklayıp
 * uzunluğu kırpıyordu. Sonuç: kurumsal faturada VKN ve vergi dairesi **boş**, bireysel
 * faturada TCKN **boş** bırakılarak ödeme adımına geçilebiliyordu; `11111111111` gibi
 * on bir haneli ama geçersiz bir değer de kabul ediliyordu.
 *
 * Bunun bedeli köprü döneminde doğrudan görünür: fatura entegratör panelinden ELLE
 * kesilecek ve geçersiz kimlikle kesilemeyecek — yani sipariş kargolanamayacak.
 * Bkz. `docs/standards/legal-compliance-standard.md` §4.
 *
 * KAPSAM SINIRI: bu iki fonksiyon yalnız **sağlama (checksum)** doğrular; numaranın
 * gerçekten var olduğunu, kişiye/şirkete ait olduğunu veya aktif olduğunu SÖYLEMEZ.
 * Onun için GİB sorgusu gerekir ve o, entegratörün işidir. Buradaki kontrol, tipografi
 * hatalarını ve uydurma değerleri eler — daha fazlasını iddia etmez.
 */

/**
 * T.C. Kimlik Numarası sağlaması.
 *
 * Kurallar: 11 hane, yalnız rakam, ilk hane 0 olamaz.
 * 10. hane: (1.+3.+5.+7.+9. hanelerin toplamı × 7 − 2.+4.+6.+8. hanelerin toplamı) mod 10
 * 11. hane: ilk 10 hanenin toplamı mod 10
 */
export function isValidTckn(value: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(value)) return false

  const d = value.split('').map(Number)
  const tekler = d[0] + d[2] + d[4] + d[6] + d[8]
  const ciftler = d[1] + d[3] + d[5] + d[7]

  // Fark negatif olabilir (ör. tekler küçük, çiftler büyükse) — JS'te `%` işareti korur,
  // bu yüzden +10 ile normalize ediliyor. Bu satır atlanırsa geçerli numaralar reddedilir.
  const onuncu = (((tekler * 7 - ciftler) % 10) + 10) % 10
  if (onuncu !== d[9]) return false

  const ilkOnToplam = d.slice(0, 10).reduce((toplam, hane) => toplam + hane, 0)
  return ilkOnToplam % 10 === d[10]
}

/**
 * Vergi Kimlik Numarası (VKN) sağlaması — 10 hane.
 *
 * GİB algoritması: her hane için `t = (hane + 9 − sıra) mod 10`; t 9 ise katkı 9,
 * değilse `(t × 2^(9−sıra)) mod 9`. Kontrol hanesi `(10 − toplam mod 10) mod 10`.
 */
export function isValidVkn(value: string): boolean {
  if (!/^[0-9]{10}$/.test(value)) return false

  const d = value.split('').map(Number)
  let toplam = 0

  for (let i = 0; i < 9; i++) {
    const t = (d[i] + 9 - i) % 10
    toplam += t === 9 ? 9 : (t * Math.pow(2, 9 - i)) % 9
  }

  return (10 - (toplam % 10)) % 10 === d[9]
}
