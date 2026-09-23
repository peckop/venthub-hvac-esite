/**
 * `Accept-Language` başlığından ziyaretçinin TERCİH ettiği desteklenen dili seçer.
 *
 * NİÇİN (2026-09-23, canlı ölçüm): middleware eskiden başlıkta `en` harfleri geçiyor mu diye
 * bakıyordu. Türkçe Chrome'un varsayılanı `tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7` — İngilizce
 * yalnız YEDEK dil olarak listede, ama `includes('en')` doğru döndüğü için Türkçe ziyaretçi
 * dil öneksiz her adreste (`/category/fans`) İngilizce sayfaya gönderiliyordu. Başlığın
 * anlamı bir öncelik listesidir (RFC 9110 §12.5.4): her öğenin `q` ağırlığı vardır, yoksa 1.
 *
 * Kural: desteklenen diller içinde en yüksek `q`; eşitlikte listede önce gelen; `q=0` "istemiyorum"
 * demektir ve seçilmez; hiçbiri desteklenmiyorsa (ya da başlık yok/bozuk) varsayılan dil.
 */
export type DesteklenenDil = 'tr' | 'en'

const DESTEKLENEN: readonly DesteklenenDil[] = ['tr', 'en']

export function tercihEdilenDil(acceptLanguage: string | null | undefined, varsayilan: DesteklenenDil = 'tr'): DesteklenenDil {
  if (!acceptLanguage) return varsayilan
  let secilen: DesteklenenDil | null = null
  let enYuksek = 0
  for (const oge of acceptLanguage.split(',')) {
    const [etiket, ...parametreler] = oge.trim().split(';')
    const birincil = etiket.trim().toLowerCase().split('-')[0]
    if (!DESTEKLENEN.includes(birincil as DesteklenenDil)) continue
    let q = 1
    for (const p of parametreler) {
      const [ad, deger] = p.trim().split('=')
      if (ad?.trim().toLowerCase() === 'q') {
        const sayi = Number(deger)
        q = Number.isFinite(sayi) ? Math.min(Math.max(sayi, 0), 1) : 0
      }
    }
    if (q > enYuksek) {
      enYuksek = q
      secilen = birincil as DesteklenenDil
    }
  }
  return secilen ?? varsayilan
}
