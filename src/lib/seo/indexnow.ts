import { ADRES_SEMASI_K3B } from '@/config/features'
import { INDEXNOW_ANAHTARI } from '@/config/indexnow'
import { SITE_URL } from '@/config/siteUrl'
import { type AdresDili, type AdresNesnesi, adresUret } from '@/utils/adresUret'

/**
 * IndexNow — değişen sayfaları arama motorlarına ANINDA bildirir (REC-127, Bing paketi; REC-405).
 *
 * NİÇİN VAR: sitemap "bir ara gel bak" der, IndexNow "şu sayfa DEĞİŞTİ" der. Katalogda
 * fiyat/görsel/ad değiştiğinde vitrin sayfası tazeleniyor ama arama motoru bunu ancak
 * kendi tarama takvimi gelince görüyordu. Zincirin son halkası eksikti.
 *
 * ANAHTAR (REC-405): `src/config/indexnow.ts` sabiti; doğrulama dosyası `public/<anahtar>.txt`.
 * Anahtar SIR DEĞİL (protokol gereği kamuya açık dosya). `INDEXNOW_KEY` ortam değişkeni yalnız
 * geçersiz kılma içindir; boş/boşluk değer geçersiz kılma SAYILMAZ (boş anahtarla istek atmak
 * 403 üretir, sabite düşmek doğru dosyayı gösterir).
 *
 * ⭐RECEP KARARI K4 (2026-09-03): "Bing'i değişecek adreslerle beslemeyelim." K3-b adres şeması
 * (`ADRES_SEMASI_K3B`) KAPALIYKEN ürün/kategori/marka adresleri yakında DEĞİŞECEK; bunları bugün
 * bildirmek, arama motoruna birazdan 308 verecek adresleri öğretmek olur. Bu yüzden bayrak kapalıyken
 * `k3bdenEtkilenirMi` süzgeci o yolları DÜŞÜRÜR; etkilenmeyen yollar (bilgi merkezi, destek…) GİDER.
 * Hepsi düşerse ağ isteği atılmaz ve sonuç `atlandi/yayin-oncesi` olarak GÖRÜNÜR (sessiz olmak
 * görünmez olmak değildir). Bayrak açıldığı yayında süzgeç kendiliğinden devreden çıkar.
 *
 * Bildirim BEST-EFFORT bir yan etkidir: başarısız olması webhook'u ASLA düşürmemeli, çünkü
 * webhook'un asıl işi önbellek tazelemektir. Bu yüzden burada hiçbir hata yukarı fırlatılmaz;
 * yutulan hata GÜNLÜĞE yazılır (sessiz yutma on gün gizlenir — ölçüldü).
 */

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

/** Tek istekte bildirilebilecek üst sınır (IndexNow sözleşmesi 10.000). */
const MAX_URL = 10_000

const DILLER: readonly AdresDili[] = ['tr', 'en']

/** Göreli yolları çözmek için sahte kök (`URL` göreli girdiyi tabansız çözmez; yalnız pathname okunur). */
const NORMALIZE_TABANI = 'http://x'

/**
 * K3-b'nin DOKUNDUĞU bölüm adları — elle yazılmaz, TEK ADRES ÜRETİCİSİNDEN türetilir.
 * `adresUret` her nesne türü için iki dilde, bayrak KAPALI (bugünkü şema) ve AÇIK (yeni şema)
 * kipinde çağrılır; çıkan adreslerin dil önekinden sonraki ilk segmenti toplanır. Şemaya yeni bir
 * bölüm eklenirse süzgeç kendiliğinden genişler. Bugün ölçülen küme (kapı sabitler):
 * brands, category, kategori, markalar, products, urun, urunler.
 */
const ORNEK_NESNELER: readonly AdresNesnesi[] = [
  { tur: 'urunler' },
  { tur: 'kategori', kok: 'k', dal: 'd' },
  { tur: 'aile', slug: 'a' },
  { tur: 'model', aileSlug: 'a', sku: 'X1', slug: 's' },
  { tur: 'marka', slug: 'm' },
]

export const K3B_BOLUMLERI: ReadonlySet<string> = new Set(
  ORNEK_NESNELER.flatMap((n) =>
    DILLER.flatMap((dil) => [false, true].map((bayrak) => adresUret(n, dil, bayrak).split('/')[2] ?? '')),
  ).filter((s) => s !== ''),
)

/**
 * K3-b'den ETKİLENMEYEN bölümler — açık liste. Burada OLMAYAN her bölüm "etkilenir" sayılır
 * (bilinmeyen = güvenli taraf: yanlışlıkla bildirilmeyen sayfa bir sonraki taramada zaten gelir,
 * yanlışlıkla bildirilen değişecek adres ise K4'ü çiğner). Her girdinin `src/app/[lang]/<bölüm>`
 * dizini olarak var olduğu kapı altında (INV-INDEXNOW-1).
 */
export const K3B_DISI_BOLUMLER: ReadonlySet<string> = new Set([
  'about',
  'bilgi-merkezi',
  'contact',
  'destek',
  'knowledge-hub',
  'legal',
  'urun-secici',
])

/**
 * Yol, K3-b adres şeması açıldığında DEĞİŞECEK (ya da bunu bilemediğimiz) bir adres mi?
 * Girdi göreli yol (`/tr/products/x`) veya tam URL olabilir. Dil kökü (`/tr`, `/en`) etkilenmez;
 * dilsiz yollar (`/sitemap.xml`, `/products/x`) vitrin sayfası değil ya da yönlendirilir → etkilenir.
 *
 * Girdi ÖNCE `URL` ile normalize edilir: `/tr/destek/../urun/x` gerçekte `/tr/urun/x`'tir; bölüm kontrolü ham
 * metne bakarsa `destek` görür ve değişecek adresi bildirirdi (K4 ihlali). Çözülemeyen girdi (geçersiz URL)
 * ve başka sunucuya giden girdi (tam URL'de sunucu adı `SITE_URL` ile aynı değil; göreli girdide
 * `//baska-kok/tr` gibi tabanı değiştiren biçim) güvenli taraftadır: etkilenir → düşer.
 */
export function k3bdenEtkilenirMi(yol: string): boolean {
  let yolAdi: string
  try {
    const cozulen = new URL(yol, NORMALIZE_TABANI)
    const tamUrlMi = yol.startsWith('http://') || yol.startsWith('https://')
    if (tamUrlMi) {
      // Başka sunucunun adresi bu sitenin bildirimi değildir; yol kısmı masum görünse de düşer.
      if (cozulen.host !== new URL(SITE_URL).host) return true
    } else if (cozulen.origin !== NORMALIZE_TABANI) {
      return true
    }
    yolAdi = cozulen.pathname
  } catch {
    return true
  }
  const parcalar = yolAdi.split('/').filter(Boolean)
  if (!DILLER.some((d) => d === parcalar[0])) return true
  const bolum = parcalar[1]
  if (bolum === undefined) return false
  if (K3B_BOLUMLERI.has(bolum)) return true
  return !K3B_DISI_BOLUMLER.has(bolum)
}

export type BildirimSonucu =
  | { durum: 'atlandi'; sebep: 'yol-yok' }
  | { durum: 'atlandi'; sebep: 'yayin-oncesi'; dusurulen: number }
  | { durum: 'gonderildi'; gonderilen: number; dusurulen: number; http: number }
  | { durum: 'hata'; mesaj: string; dusurulen: number }

/** Göreli yolu tam URL'ye çevirir; zaten tam URL ise dokunmaz. */
function tamUrl(yol: string): string {
  if (yol.startsWith('http://') || yol.startsWith('https://')) return yol
  return `${SITE_URL}${yol.startsWith('/') ? yol : `/${yol}`}`
}

/**
 * Değişen yolları IndexNow'a bildirir. ASLA throw etmez.
 *
 * @param yollar `revalidatePath`'e verilen yollar (ör. `/tr/products/lineo-quiet`).
 *               Yinelenenler tekilleştirilir; boş liste no-op'tur.
 */
export async function indexNowBildir(yollar: readonly string[]): Promise<BildirimSonucu> {
  const key = process.env.INDEXNOW_KEY?.trim() || INDEXNOW_ANAHTARI

  // Tekilleştir: webhook aynı yolu birden çok dalda biriktirebiliyor (zincir yürüyüşü).
  const tekil = [...new Set(yollar.map(tamUrl))]
  if (tekil.length === 0) return { durum: 'atlandi', sebep: 'yol-yok' }

  // K4: bayrak kapalıyken değişecek adresler bildirilmez (dosya başındaki gerekçe).
  const suzulmus = ADRES_SEMASI_K3B ? tekil : tekil.filter((u) => !k3bdenEtkilenirMi(u))
  const dusurulen = tekil.length - suzulmus.length
  if (suzulmus.length === 0) return { durum: 'atlandi', sebep: 'yayin-oncesi', dusurulen }
  const urlList = suzulmus.slice(0, MAX_URL)

  const host = new URL(SITE_URL).host

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key,
        // Doğrulama dosyası `public/<key>.txt` olarak yayınlanır; middleware'de kök
        // seviyedeki `.txt` dosyaları dil önekinden MUAF (yoksa /tr/<key>.txt'ye
        // yönlendirilir ve doğrulama başarısız olur).
        keyLocation: `${SITE_URL}/${key}.txt`,
        urlList,
      }),
    })
    return { durum: 'gonderildi', gonderilen: urlList.length, dusurulen, http: res.status }
  } catch (error: unknown) {
    const mesaj = error instanceof Error ? error.message : String(error)
    // Yutuluyor AMA görünür: sessiz yutulan adım günlerce fark edilmez (ölçülmüş ders).
    console.error('[IndexNow] bildirim basarisiz (webhook etkilenmedi):', mesaj)
    return { durum: 'hata', mesaj, dusurulen }
  }
}
