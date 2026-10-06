/**
 * MARKA ÜRÜN DURUMU — "ürünsüz marka" kararının TEK noktası (OPS-51, OPS denetimi düzeltmesi).
 *
 * NİÇİN: karar önce `brands.ts`'teki STATİK `urunsuz: true` bayrağındaydı. DB'ye Flexiva ürünü girse sayfa noindex +
 * site haritası dışı KALIR, kimse görmezdi (bayrağı ürünle birlikte elle silme işi vardı). Artık karar render ve site
 * haritası anında DB'deki aktif ürün sayısından TÜRER; ürün gelince sayfa kendiliğinden indekslenir ve haritaya girer.
 *
 * Üç yüzey AYNI fonksiyondan karar verir: marka sayfası üst verisi (robots + meta açıklama), marka sayfası gövdesi
 * (teklif cümlesi), `sitemap.ts`. Sayaç (`MarkaUrunSayaci`) DIŞARIDAN verilir — kural 2 (DI) ve testte enjeksiyon için.
 *
 * HATA YOLU (kararlı, testle kilitli — `markaUrunDurumu.test.ts`):
 *  · Sayaç hata verirse karar FIRLATIR. Yanlış "ürünsüz" → ürünlü markaya noindex + haritadan düşürme; yanlış "ürünlü"
 *    → ürünsüz sayfa indekslenir. İkisi de sessiz kusur; bu yüzden sayı okunamadıysa varsayılan YOK.
 *    ISR yenilemesi/harita üretimi düşer → Next son iyi sayfayı/haritayı tutar (stale-if-error), build ise kırılır
 *    ve Vercel önceki başarılı yayını tutar (`sitemap.ts` aynı katı kuralı uygular, INV-SITEMAP-HATA-1).
 *  · TEK İSTİSNA: `NEXT_PUBLIC_SUPABASE_URL === 'https://dummy.supabase.co'` (CI `Build (blocking)` adımı, ağ yok).
 *    Orada sayı hiç gelmez ve build düşmemeli; karar "ürünlü" (robots yazılmaz = bugünkü varsayılan) sayılır ve
 *    uyarı basılır. BİREBİR eşitlik: `xdummy.supabase.co` gibi kaçak adres gevşek kola GİRMEZ (`sitemap.ts` ile aynı ölçüt).
 *  · Sayı geçersizse (NaN, negatif, tam sayı değil) FIRLATIR — `NaN <= 0` gibi bir karşılaştırma yanlışlıkla "ürünsüz" yazmasın.
 */

/** Markanın (ad ile) aktif ürünü olan aile sayısını verir; okuyamazsa FIRLATIR. */
export type MarkaUrunSayaci = (markaAdi: string) => Promise<number>

/** Kararın TEK eşiği: aktif ürün sayısı sıfırsa marka ürünsüzdür. Geçersiz sayı karar yerine hata üretir. */
export function urunsuzMu(aktifUrunSayisi: number): boolean {
  if (!Number.isInteger(aktifUrunSayisi) || aktifUrunSayisi < 0) {
    throw new Error(`markaUrunDurumu: geçersiz aktif ürün sayısı (${String(aktifUrunSayisi)})`)
  }
  return aktifUrunSayisi === 0
}

/** CI'ın sahte-veritabanlı derlemesi mi? (`sitemap.ts` ile birebir aynı ölçüt.) */
export function veritabaniSahteMi(): boolean {
  return process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://dummy.supabase.co'
}

/** Marka (ad) ürünsüz mü? Sayaç hatası yukarıdaki HATA YOLU'na göre fırlar (yalnız sahte DB'de "ürünlü"). */
export async function markaUrunsuzMu(markaAdi: string, sayac: MarkaUrunSayaci): Promise<boolean> {
  try {
    return urunsuzMu(await sayac(markaAdi))
  } catch (hata) {
    if (!veritabaniSahteMi()) throw hata
    console.warn(`[markaUrunDurumu] sahte veritabanı (dummy.supabase.co): ${markaAdi} "ürünlü" sayıldı — yalnız CI derlemesi için`, hata)
    return false
  }
}

/** Site haritası için: verilen markalardan ürünsüz olanların slug kümesi. */
export async function urunsuzMarkaSluglari(
  markalar: readonly { name: string; slug: string }[],
  sayac: MarkaUrunSayaci,
): Promise<Set<string>> {
  const sonuc = await Promise.all(markalar.map(async (m) => [m.slug, await markaUrunsuzMu(m.name, sayac)] as const))
  return new Set(sonuc.filter(([, urunsuz]) => urunsuz).map(([slug]) => slug))
}
