// scripts/edge/yeniden-dene.mjs
//
// Sapma dedektörünün (drift-check.mjs) kaynak indirmesi için YAN ETKİSİZ yeniden deneme yardımcısı.
//
// NİÇİN VAR (REC-355 alt işi · 2026-09-30)
// ----------------------------------------
// `supabase functions download` ağ hatasıyla ara sıra düşüyor (bir koşumda 3/29, sonrakinde 2/29,
// sonra 1/29 fonksiyon; ALTYAPI kaynaklı değil, deploy adımı yeşilken yalnız RAPOR üretilemedi).
// Tek bir slug bile inmezse dedektör exit 2 verir ve tüm deploy kırmızı görünür.
//
// NE YAPAR, NE YAPMAZ
//  • YALNIZ işlemin "error" döndürdüğü durumu yeniden dener (CLI çıkış kodu ≠ 0 = ağ/geçici hata).
//  • Deneme sayısı SINIRLIDIR; tükenirse SON hata, deneme sayısıyla birlikte döner. "Sonsuz
//    yeniden deneme" ya da sessiz yutma YOK — bu bir ört-bas mekanizması değil.
//  • Her yeniden deneme `haber` ile görünür kılınır (günlükte "yeniden deneniyor" satırı çıkar).
//  • "Sapma yok" demeyi KOLAYLAŞTIRMAZ: kısmi sonuç hâlâ exit 2'dir; yalnız geçici hata artık
//    tüm koşumu düşürmez.

export const VARSAYILAN_DENEME = 3
export const VARSAYILAN_BEKLEME_MS = 2000

const gercekUyku = (ms) => new Promise((coz) => setTimeout(coz, ms))

/**
 * @param {(deneme: number) => Promise<{ error?: string } & Record<string, unknown>>} islem
 *        Başarıda `error` alanı OLMAYAN, başarısızlıkta `error` (metin) taşıyan bir nesne döner.
 * @param {{ deneme?: number, beklemeMs?: number, uyku?: (ms: number) => Promise<void>,
 *           haber?: (deneme: number, hata: string) => void }} [ayar]
 * @returns {Promise<{ error?: string, denemeSayisi: number } & Record<string, unknown>>}
 */
export async function yenidenDene(islem, ayar = {}) {
  const deneme = Math.max(1, Math.floor(ayar.deneme ?? VARSAYILAN_DENEME))
  const beklemeMs = ayar.beklemeMs ?? VARSAYILAN_BEKLEME_MS
  const uyku = ayar.uyku ?? gercekUyku
  const haber = ayar.haber ?? (() => undefined)

  let son
  for (let n = 1; n <= deneme; n++) {
    son = await islem(n)
    if (!son.error) return { ...son, denemeSayisi: n }
    if (n < deneme) {
      haber(n, son.error)
      // Doğrusal artan bekleme (2 sn, 4 sn): ağ dalgalanması için yeterli, koşumu uzatmaz.
      await uyku(beklemeMs * n)
    }
  }
  return { ...son, denemeSayisi: deneme }
}
