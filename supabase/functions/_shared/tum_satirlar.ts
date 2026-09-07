/**
 * `_shared/tum_satirlar.ts` — PostgREST'in **SESSİZ 1000 SATIR TAVANI** için sayfalama.
 *
 * ⛔KAPATTIĞI SINIF: PostgREST bir sorguya varsayılan olarak en çok 1000 satır döner ve bunu
 * HATA İLE BİLDİRMEZ. 1001. satırdan sonrası yoktur; çağıran taraf "hepsi bu" sanır. Kusur
 * veri büyüyünce doğar, kod değişmeden: bugün yeşil olan bir iş yarın sessizce eksik çalışır.
 * `stock-alert` bu hâlde uyarı üretmeyi bırakırdı, `order-housekeeping` ödenmemiş siparişleri
 * atlardı — ikisi de **200 ve "ok" dönerek**, yani hiçbir alarm çalmadan.
 *
 * ⭐İLKE: ÖNCE SAY, SONRA TOPLA, SONUNDA KARŞILAŞTIR.
 *   1. `toplam` okunamadıysa **fırlat** — "ölçemedim" ile "hepsini aldım" aynı şey değildir.
 *   2. Sayfa sayfa topla, üst sınırı aşarsan **fırlat** (sessizce kesme yok).
 *   3. Toplanan ≠ toplam ise **fırlat** — eksik veriyle iş yapmak, hiç yapmamaktan kötüdür,
 *      çünkü rapor başarılı görünür.
 *
 * ⚠BU DOSYA URUN ŞERİDİNDEKİ `src/lib/supabase/tumSatirlar.ts` İLE YAPISAL İKİZDİR:
 * Edge fonksiyonları Deno'da koşar ve `src/` altından import EDEMEZ. İkizlik kazara değil;
 * anlamları (say → topla → karşılaştır) aynı kalmalı, ikisi ayrı ayrı değişirse haber verilir.
 */

/** Bir sayfa okuma sonucu. `toplam`, sunucunun bildirdiği GERÇEK satır sayısıdır (tahmin değil). */
export type SayfaSonucu<T> = {
  satirlar: T[]
  /** Sunucudan okunan toplam; okunamadıysa null (o hâl HATA sayılır, sessizce geçilmez). */
  toplam: number | null
}

/** `bas`-`son` (dahil) aralığını okuyan fonksiyon. */
export type SayfaOkuyucu<T> = (bas: number, son: number) => Promise<SayfaSonucu<T>>

export type SayfalamaSecenegi = {
  /** Sayfa boyu. PostgREST tavanı 1000; varsayılan 1000. */
  sayfaBoyu?: number
  /**
   * Toplanabilecek EN FAZLA satır — kaçak döngüye karşı emniyet. Aşılırsa fırlatır;
   * sessizce kesmek, kapatmaya çalıştığımız kusurun aynısı olurdu.
   */
  enFazla?: number
  /** Hata metninde görünecek ad (hangi sorgu olduğu anlaşılsın). */
  ad?: string
}

export async function tumSatirlar<T>(oku: SayfaOkuyucu<T>, secenek: SayfalamaSecenegi = {}): Promise<T[]> {
  const sayfaBoyu = Math.max(1, Math.min(secenek.sayfaBoyu ?? 1000, 1000))
  const enFazla = secenek.enFazla ?? 100_000
  const ad = secenek.ad ?? 'sorgu'

  const ilk = await oku(0, sayfaBoyu - 1)
  if (ilk.toplam === null || !Number.isFinite(ilk.toplam)) {
    throw new Error(
      `[tum_satirlar] ${ad}: toplam satir sayisi OKUNAMADI. "Olcemedim" ile "hepsini aldim" ayni sey degil; ` +
        `eksik veriyle is yapilmaz. (PostgREST icin count=exact / Prefer basligi gerekir.)`,
    )
  }

  const toplam = ilk.toplam
  if (toplam > enFazla) {
    throw new Error(`[tum_satirlar] ${ad}: ${toplam} satir, ust sinir ${enFazla}. Sessizce KESMIYORUM — sinir bilerek yukseltilmeli.`)
  }

  const hepsi: T[] = [...ilk.satirlar]
  while (hepsi.length < toplam) {
    const bas = hepsi.length
    const sayfa = await oku(bas, bas + sayfaBoyu - 1)
    if (sayfa.satirlar.length === 0) break // sunucu boş sayfa döndü: aşağıdaki karşılaştırma yakalar
    hepsi.push(...sayfa.satirlar)
  }

  if (hepsi.length !== toplam) {
    throw new Error(
      `[tum_satirlar] ${ad}: sunucu ${toplam} satir bildirdi, ${hepsi.length} satir toplandi. ` +
        `Eksik veriyle devam etmek, basarili gorunen sessiz bir kusur uretir.`,
    )
  }
  return hepsi
}

/**
 * PostgREST HAM REST ucu için sayfa okuyucu (`fetch` ile koşan fonksiyonlar).
 * `Prefer: count=exact` + `Range` başlıkları kullanır ve toplamı `Content-Range`'den okur
 * (biçim: `0-999/12345`).
 */
/**
 * `fetch`in bu modülün KULLANDIĞI kadarı. Dar tutulmasının sebebi test kolaylığı değil TİP
 * GÜVENLİĞİ: geniş `typeof fetch` istenirse sahte bir sunucu ancak zorlama tip dönüşümüyle
 * verilebilir; o tür kestirmeler yasaktır (kural 3) ve haklı olarak yasaktır — sözleşmeyi
 * görünmez kılarlar. Dar arayüz, sahte sunucunun sözleşmeye UYMASINI zorunlu kılar.
 */
export type YanitBenzeri = {
  ok: boolean
  status: number
  json: () => Promise<unknown>
  text: () => Promise<string>
  headers: { get: (ad: string) => string | null }
}
export type FetchBenzeri = (url: string, init?: { headers?: Record<string, string> }) => Promise<YanitBenzeri>

export function restSayfaOkuyucu<T>(url: string, basliklar: Record<string, string>, fetchFn: FetchBenzeri = fetch): SayfaOkuyucu<T> {
  return async (bas, son) => {
    const yanit = await fetchFn(url, {
      headers: { ...basliklar, Prefer: 'count=exact', Range: `${bas}-${son}`, 'Range-Unit': 'items' },
    })
    if (!yanit.ok) {
      throw new Error(`[tum_satirlar] REST ${yanit.status}: ${await yanit.text().catch(() => '')}`.slice(0, 300))
    }
    const satirlar = (await yanit.json().catch(() => [])) as T[]
    const aralik = yanit.headers.get('content-range') || ''
    const parca = aralik.split('/')[1]
    // ⚠`Number(null)` SIFIRDIR: bu satır önce `Number.isFinite(Number(toplam))` diye yazılmıştı ve
    // Content-Range yokken "ölçemedim"i sessizce "0 satır"a çeviriyordu — tam da kapatmaya
    // çalıştığımız sınıf. Test yakaladı; null, sayıya DÖNÜŞTÜRÜLMEDEN önce elenir.
    const toplam = parca && parca !== '*' ? Number(parca) : null
    return {
      satirlar: Array.isArray(satirlar) ? satirlar : [],
      toplam: toplam !== null && Number.isFinite(toplam) ? toplam : null,
    }
  }
}

/**
 * supabase-js sorgu kurucusu için sayfa okuyucu.
 *
 * ⚠`count` SEÇENEĞİ `select()` ÇAĞRISINA VERİLİR — filtre zincirinin SONUNA eklenirse
 * sessizce yutulur (2026-09-07'de ölçüldü). Bu yüzden fabrika, `select`i kendisi kurmalı:
 *   `(k) => supabase.from('products').select('id,name', k).filter('stock_qty','lte',esik)`
 */
export function supabaseSayfaOkuyucu<T>(
  fabrika: (secenek: { count: 'exact' }) => {
    range: (bas: number, son: number) => PromiseLike<{ data: T[] | null; count: number | null; error: unknown }>
  },
): SayfaOkuyucu<T> {
  return async (bas, son) => {
    const { data, count, error } = await fabrika({ count: 'exact' }).range(bas, son)
    if (error) throw error
    return { satirlar: (data || []) as T[], toplam: typeof count === 'number' ? count : null }
  }
}
