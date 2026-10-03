/**
 * META AÇIKLAMA KIRPICI (REC-497, GEO-SEO 2026-10-02).
 *
 * NİÇİN VAR: ürün ailesi sayfası açıklamayı `metin.substring(0, 160)` ile kesiyordu. Canlı ölçüm
 * (canlı kapı, 2026-10-02): 29 aile sayfasının açıklaması tam 160 karakterde ve cümle ortasında
 * bitiyordu ("... debili BVU 1000 modeli", "... dikdörtgen kanal tipi rady"). Google'ın belgesi
 * açıklamanın kesilebileceğini söyler; ama arama sonucunda yarım sözcükle biten bir cümle,
 * markanın gördüğü ilk metindir ve kusurdur. Kesme TEK yerde, sözcük ve cümle sınırına saygılı
 * yapılır; çağıran `.substring` yazamaz (INV-ACIKLAMA-KIRP-1 kaynağı tarar).
 *
 * KURAL (sırayla):
 *  1. Boşluk normalize edilir (art arda boşluk/satır sonu → tek boşluk), uçlar kırpılır.
 *  2. `azami` içinde sığıyorsa AYNEN döner.
 *  3. Sığmıyorsa `azami` içindeki SON CÜMLE SONUNDA biter; yalnız sonuç `ACIKLAMA_ASGARI`
 *     karakterden kısa değilse (tek kısa cümle arama sonucunu boş bırakır).
 *     Cümle sonu = `.` `!` `?` `…` + boşluk + BÜYÜK harf. "maks. 1200 m³/h" ya da "yaklaşık 3 m. 5 kW"
 *     gibi kısaltma noktaları cümle sonu SAYILMAZ (sonraki harf büyük değil).
 *  4. Cümle sınırı yoksa son SÖZCÜK sınırında kesilir, sondaki ayraçlar (`,` `;` `:` `-` `(`) atılır,
 *     `…` eklenir. Yarım sözcük ASLA kalmaz; yalnız boşluksuz tek uzun parçada zorunlu kesim olur.
 *
 * Sonuç uzunluğu HER ZAMAN `azami`'yi aşmaz. Uzunluk UTF-16 birimiyle sayılır; Türkçe harfler tek
 * birimdir (canlı kapı da `[...d].length` ile aynı sonucu görür). Saf fonksiyon: ağ, DB, zaman yok.
 */

/** Arama sonucunda görünür kalan makul üst sınır (Google 150-160 civarında keser). */
export const ACIKLAMA_AZAMI = 155

/** Cümle sınırında bitirmek için asgari uzunluk: bundan kısa tek cümle yerine sözcük sınırı seçilir. */
export const ACIKLAMA_ASGARI = 70

const BUYUK_HARF = /[A-ZÇĞİÖŞÜ]/
const CUMLE_SONU = /[.!?…]/
const SONDA_ATILAN = /[\s,;:\-–—([/]+$/u
const CUMLE_BITISI = /[.!?…]$/

export function aciklamaKirp(metin: string | null | undefined, azami: number = ACIKLAMA_AZAMI): string {
  const t = (metin ?? '').replace(/\s+/g, ' ').trim()
  if (!t) return ''
  if (t.length <= azami) return t

  // 3) azami içindeki son cümle sonu
  let cumleSonu = -1
  for (let i = 0; i < azami; i++) {
    if (CUMLE_SONU.test(t[i]) && t[i + 1] === ' ' && BUYUK_HARF.test(t[i + 2] ?? '')) cumleSonu = i
  }
  if (cumleSonu + 1 >= ACIKLAMA_ASGARI) return t.slice(0, cumleSonu + 1)

  // 4) sözcük sınırı + "…" için bir karakter yer bırak
  const pencere = t.slice(0, azami - 1)
  const bosluk = pencere.lastIndexOf(' ')
  const kesik = (bosluk >= ACIKLAMA_ASGARI ? pencere.slice(0, bosluk) : pencere).replace(SONDA_ATILAN, '')
  return CUMLE_BITISI.test(kesik) ? kesik : `${kesik}…`
}
