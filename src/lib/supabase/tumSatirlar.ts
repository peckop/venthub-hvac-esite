/**
 * INV-TAVAN-1 — PostgREST satır tavanına karşı SAYFALI ÇEKİM + KESİN SAYI DOĞRULAMASI.
 *
 * ## Niçin var (ölçülmüş kusur sınıfı, 2026-09-06 filo notu)
 *
 * PostgREST bir istekte varsayılan olarak **en çok 1000 satır** döner ve bunu
 * SESSİZCE yapar: hata yok, uyarı yok, `error` alanı boş. Sayfalanmamış bir
 * `select()` 1001. satırdan itibaren veriyi kaybeder ve çağıran bunu "tablo bu
 * kadarmış" diye okur. Yazma yolunda bu, veri kaybının ta kendisidir:
 * güncellenmesi gereken satır hiç görülmediği için güncellenmez.
 *
 * Canlı ölçüm (2026-09-07 06:5xZ, prod SELECT):
 *   product_prices = 1044 satır  → tavan ZATEN aşılıyor
 *   products (aktif) = 375 satır → bugün aşmıyor, ama sınır yok
 * Yani kusurun bir yüzü bugün canlı, öteki yüzü katalog büyüdüğü gün doğacak.
 *
 * ## Ölçüt: SAYFALAMA TEK BAŞINA YETMEZ
 *
 * Sayfalayan bir döngü de sessizce eksik çekebilir (kısa sayfa erken kırar,
 * `order` yoksa sayfalar örtüşür/atlar). Bu yüzden burada iki ayrı şey yapılır:
 *   1. sayfa sayfa çekilir (`range`),
 *   2. sunucunun bildirdiği **kesin toplam** ile çekilen satır sayısı KARŞILAŞTIRILIR.
 * Eşit değilse **fırlatılır**. Fail-open yasak: eksik veriyle devam etmek,
 * hiç çalışmamaktan daha zararlıdır çünkü sonuç doğru görünür.
 *
 * ⛔**ÖLÇÜLMÜŞ TUZAK — `count` nereye yazılır:** `count: 'exact'` seçeneği
 * `.select()` çağrısının İKİNCİ ARGÜMANINA verilir. Filtre zincirinin sonuna
 * eklenen bir `count` sessizce yutulur ve `count` alanı `null` döner — o hâlde
 * doğrulama kolu hiçbir şey ölçmez, yani kapı sahte-yeşile döner. Bu yüzden
 * `count === null` de KIRMIZI sayılır (aşağıdaki üçüncü kol).
 *
 * ## Sayfa boyu niçin 100 (1000 değil)
 *
 * Sınav evreni: 500'lük sayfa 375 satırlık bir tabloda İLK sayfada biter, yani
 * `offset` hiç kullanılmaz ve sayfalama sabotajı hiçbir yere değmez (Katalog'un
 * 2026-09-06 dersi). Küçük sayfa boyu, sayfalama yolunun gerçekten koştuğunu
 * garanti eder. Maliyeti birkaç ek istek; kazancı, sınavın boş olmaması.
 */

/** Bir sayfa isteğinin cevabı — supabase-js'in döndürdüğü şekle yapısal olarak uyar. */
export type SayfaCevabi<T> = {
  data: T[] | null
  error: { message: string } | null
  count: number | null
}

/** Varsayılan sayfa boyu. Bilerek 1000'in ÇOK altında — yukarıdaki gerekçeye bak. */
export const VARSAYILAN_SAYFA_BOYU = 100

/**
 * Bir sorguyu sayfa sayfa koşturup TÜM satırları döner ve eksik çekimi KIRMIZI yapar.
 *
 * @param etiket  Hata mesajında görünecek insan-okur ad (ör. "products (aktif)").
 * @param sayfa   `(bas, son) => supabase...select(kolonlar, { count: 'exact' }).order(...).range(bas, son)`
 *                Sıra ŞART: `order` olmadan sayfaların hangi satırları taşıdığı belirsizdir.
 * @param sayfaBoyu Sınav için küçültülebilir; üretimde varsayılan bırakılır.
 */
export async function tumSatirlariCek<T>(
  etiket: string,
  sayfa: (bas: number, son: number) => PromiseLike<SayfaCevabi<T>>,
  sayfaBoyu: number = VARSAYILAN_SAYFA_BOYU,
): Promise<T[]> {
  if (!Number.isInteger(sayfaBoyu) || sayfaBoyu < 1) {
    throw new Error(`${etiket}: sayfa boyu pozitif tam sayı olmalı (verilen: ${sayfaBoyu}).`)
  }

  const hepsi: T[] = []
  let kesinToplam: number | null = null
  let bas = 0

  for (;;) {
    const { data, error, count } = await sayfa(bas, bas + sayfaBoyu - 1)
    if (error) throw new Error(`${etiket}: sayfa çekilemedi (offset ${bas}) — ${error.message}`)

    // Kesin toplam yalnız İLK sayfadan alınır. Sonraki sayfalarda satır sayısı
    // değişmiş olabilir (eşzamanlı yazma); bunu tespit etmek de bu kapının işi.
    if (kesinToplam === null) kesinToplam = count

    const satirlar = data ?? []
    hepsi.push(...satirlar)
    if (satirlar.length < sayfaBoyu) break
    bas += sayfaBoyu
  }

  if (kesinToplam === null) {
    throw new Error(
      `${etiket}: sunucu KESİN SAYI döndürmedi (count = null). ` +
        `count: 'exact' seçeneği .select()'in ikinci argümanına verilmiş olmalı; ` +
        `zincirin sonuna eklenen count sessizce yutulur ve doğrulama kolu körleşir.`,
    )
  }

  if (hepsi.length !== kesinToplam) {
    throw new Error(
      `${etiket}: EKSİK ÇEKİM — sunucu ${kesinToplam} satır bildirdi, ${hepsi.length} satır alındı. ` +
        `Aradaki fark sessizce kaybolurdu; bu yüzden fırlatılıyor (fail-closed).`,
    )
  }

  return hepsi
}
