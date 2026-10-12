import { ADRES_SEMASI_K3B } from '@/config/features'
import { INDEXNOW_ANAHTARI } from '@/config/indexnow'
import { SITE_URL } from '@/config/siteUrl'
import { enKapaliMi } from '@/lib/seo/enYayinKurali'
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
 * görünmez olmak değildir).
 *
 * ⭐URN-10 (2026-10-11) — BAYRAK AÇIKKEN DE SÜZGEÇ ÇALIŞIR: webhook yol listesi (`tazelemeYollari`) önbellek tazeleme
 * için İKİ şemayı da üretir (doğrudur; tazeleme kümesi iki şemalı KALIR). Bayrak açıkken süzgeç devre dışı olunca Bing'e
 * eski şema adresleri (`/tr/products/<aile>`, `/tr/category/<slug>`, `/tr/brands/<marka>`: 308 verir), `/sitemap.xml`
 * ve dizine kapalı `/en/...` yolları da gidiyordu; arama motoru adresi öğrenir, geri alınamaz. Artık bildirilen küme
 * YALNIZ `adresUret(…, true)`'nun ürettiği biçimdeki adresler (`YENI_SEMA_BICIMLERI`, çıktıdan türetilir) + şemadan
 * etkilenmeyen bölümlerdir (`indexNoweGiderMi`). Bayrak AÇIKKEN `EN_YAYIN` kapalıysa `/en/...` HİÇ gitmez (yayın
 * bayrağının kendi kuralı: `enKapaliMi`; dizine kapalı sayfayı bildirmek anlamsız). Bayrak KAPALIYKEN davranış bu
 * işle değişmez: etkilenmeyen EN yolları bugünkü gibi gider (K4; kapalı kipi değiştirmek ayrı karardır).
 * Plan: docs/plans/rec-300-plan-tazeleme-2026-09-29.md §4 madde 4c ("Eski adresler BİLDİRİLMEZ").
 *
 * KAPATMA (REC-405): bildirim sorun çıkarırsa (yanlış adres öğretme şüphesi, arama motoru şikâyeti) kod
 * değişmeden kapatılır: Vercel'de `INDEXNOW_KAPALI=1` (ya da `true`) tanımlanıp yeniden dağıtılır. Bu durumda yol
 * süzgecine ve ağa hiç girilmez, sonuç `atlandi/kapatildi` olarak webhook yanıtında GÖRÜNÜR. Değişken yok, boş ya da
 * başka değerdeyse bildirim AÇIKTIR (varsayılan).
 *
 * Bildirim BEST-EFFORT bir yan etkidir: başarısız olması webhook'u ASLA düşürmemeli, çünkü
 * webhook'un asıl işi önbellek tazelemektir. Bu yüzden burada hiçbir hata yukarı fırlatılmaz;
 * yutulan hata GÜNLÜĞE yazılır (sessiz yutma on gün gizlenir — ölçüldü). Aynısı IndexNow'un 2xx DIŞI yanıtı için
 * geçerlidir (URN-10): günlüğe yazılır ve sonuç `gonderildi` yerine `reddedildi` + http kodu olarak ayrışır.
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
  { tur: 'markalar' },
]

export const K3B_BOLUMLERI: ReadonlySet<string> = new Set(
  ORNEK_NESNELER.flatMap((n) =>
    DILLER.flatMap((dil) => [false, true].map((bayrak) => adresUret(n, dil, bayrak).split('/')[2] ?? '')),
  ).filter((s) => s !== ''),
)

/**
 * YENİ ŞEMANIN ADRES BİÇİMLERİ (URN-10) — `adresUret(…, true)` çıktısından türetilir, elle yazılmaz.
 * Anahtar `<dil>/<bölüm>`; değer, o bölümde üretilen yolun parça sayısı kümesidir (dil öneki dahil, sorgu hariç):
 * liste `/tr/urunler` 2, tek kayıt `/tr/urun/<slug>` 3. Bölüm adı TEK BAŞINA yetmez: EN'de eski ve yeni şema aynı
 * bölüm adını kullanır (`/en/products`, `/en/category`, `/en/brands`) ve iç içe kategori yolu (`/en/category/<üst>/<alt>`)
 * her iki şemada yalnız 308'dir; parça sayısı onu `adresUret`'in üretmediği biçim olarak eler (SEO-35 B-1).
 * Bugün ölçülen küme: tr/urunler {2} · tr/kategori {3} · tr/urun {3} · tr/markalar {2,3} · en/products {2,3} ·
 * en/category {3} · en/brands {2,3} (kapı sabitler).
 */
export const YENI_SEMA_BICIMLERI: ReadonlyMap<string, ReadonlySet<number>> = (() => {
  const harita = new Map<string, Set<number>>()
  for (const nesne of ORNEK_NESNELER) {
    for (const dil of DILLER) {
      const parcalar = new URL(adresUret(nesne, dil, true), NORMALIZE_TABANI).pathname.split('/').filter(Boolean)
      const bolum = parcalar[1]
      if (bolum === undefined) continue
      const anahtar = `${dil}/${bolum}`
      const sayilar = harita.get(anahtar) ?? new Set<number>()
      sayilar.add(parcalar.length)
      harita.set(anahtar, sayilar)
    }
  }
  return harita
})()

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
  const parcalar = yolParcalari(yol)
  if (parcalar === null) return true
  if (!DILLER.some((d) => d === parcalar[0])) return true
  const bolum = parcalar[1]
  if (bolum === undefined) return false
  if (K3B_BOLUMLERI.has(bolum)) return true
  return !K3B_DISI_BOLUMLER.has(bolum)
}

/**
 * Girdiyi normalize edip yol parçalarına ayırır (`/tr/urun/x?a=1` → `['tr','urun','x']`). Çözülemeyen ya da başka
 * sunucuya giden girdi `null` döner: iki süzgeç de onu güvenli tarafa (düşer) yazar. Normalizasyon gerekçesi
 * `k3bdenEtkilenirMi` açıklamasındadır (`..` ile bölüm kaçırma, sunucu adı denetimi).
 */
function yolParcalari(yol: string): string[] | null {
  try {
    const cozulen = new URL(yol, NORMALIZE_TABANI)
    const tamUrlMi = yol.startsWith('http://') || yol.startsWith('https://')
    if (tamUrlMi) {
      // Başka sunucunun adresi bu sitenin bildirimi değildir; yol kısmı masum görünse de düşer.
      if (cozulen.host !== new URL(SITE_URL).host) return null
    } else if (cozulen.origin !== NORMALIZE_TABANI) {
      return null
    }
    return cozulen.pathname.split('/').filter(Boolean)
  } catch {
    return null
  }
}

/**
 * Yol IndexNow'a GİDEBİLİR mi — bildirim listesinin TEK süzgeci (URN-10; dosya başındaki gerekçe).
 *
 * Sırayla (hepsi güvenli tarafa düşer):
 *  1. çözülemeyen / başka sunucu / dilsiz yol (`/sitemap.xml` dahil: sayfa değil, bildirilecek adres değil) → HAYIR,
 *  2. K3-b AÇIKKEN ve EN yayında değilse (`EN_YAYIN` kapalı) her `/en/...` yolu → HAYIR (dizine kapalı sayfa,
 *     `enKapaliMi`); K3-b KAPALIYKEN bu kural YOKTUR (kapalı kip davranışı bu işle değişmez, K4),
 *  3. dil kökü ve şemadan etkilenmeyen bölümler (`K3B_DISI_BOLUMLER`) → EVET (iki bayrak durumunda da),
 *  4. şemadan etkilenen ya da bilinmeyen bölüm: K3-b KAPALIYKEN HAYIR (K4: değişecek adres); AÇIKKEN yalnız yolun
 *     `<dil>/<bölüm>` ve parça sayısı `adresUret(…, true)`'nun ürettiği biçimlerden biriyse EVET — eski şemanın
 *     TR adresleri (`/tr/products/…`, `/tr/category/…`, `/tr/brands/…`) bölüm adından, iç içe kategori yolu parça
 *     sayısından düşer.
 *
 * `k3bAcik` yalnız test içindir; üretim kodu varsayılanı kullanır (`adresUret`'teki `bayrak` ile aynı kalıp).
 */
export function indexNoweGiderMi(yol: string, k3bAcik: boolean = ADRES_SEMASI_K3B): boolean {
  const parcalar = yolParcalari(yol)
  if (parcalar === null) return false
  const dil = DILLER.find((d) => d === parcalar[0])
  if (dil === undefined) return false
  // EN kuralı yalnız AÇIK kipte (URN-10 kapsamı): kapalı kipte etkilenmeyen EN yolları bugünkü gibi gider (K4).
  if (k3bAcik && enKapaliMi(dil)) return false
  const bolum = parcalar[1]
  if (bolum === undefined) return true
  if (K3B_DISI_BOLUMLER.has(bolum)) return true
  if (!k3bAcik) return false
  return YENI_SEMA_BICIMLERI.get(`${dil}/${bolum}`)?.has(parcalar.length) === true
}

export type BildirimSonucu =
  | { durum: 'atlandi'; sebep: 'kapatildi' }
  | { durum: 'atlandi'; sebep: 'yol-yok' }
  /** K3-b KAPALI: değişecek adresler düştü, gidecek yol kalmadı. */
  | { durum: 'atlandi'; sebep: 'yayin-oncesi'; dusurulen: number }
  /** K3-b AÇIK: eski şema adresleri, `/sitemap.xml` ve dizine kapalı EN yolları düştü, gidecek yol kalmadı. */
  | { durum: 'atlandi'; sebep: 'bildirilecek-yol-yok'; dusurulen: number }
  | { durum: 'gonderildi'; gonderilen: number; dusurulen: number; http: number }
  /** IndexNow 2xx DIŞI yanıt verdi (400 biçim, 403 anahtar, 422 sunucu/anahtar uyuşmazlığı, 429 sınır…). */
  | { durum: 'reddedildi'; denenen: number; dusurulen: number; http: number }
  | { durum: 'hata'; mesaj: string; dusurulen: number }

/** `INDEXNOW_KAPALI` değeri (boşluk kırpılır, büyük/küçük harf fark etmez) `1` ya da `true` ise bildirim kapalıdır. */
function bildirimKapaliMi(): boolean {
  const deger = process.env.INDEXNOW_KAPALI?.trim().toLowerCase()
  return deger === '1' || deger === 'true'
}

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
  // Kapatma anahtarı: yol süzgecinden ve ağdan ÖNCE (dosya başındaki "KAPATMA" notu).
  if (bildirimKapaliMi()) return { durum: 'atlandi', sebep: 'kapatildi' }

  const key = process.env.INDEXNOW_KEY?.trim() || INDEXNOW_ANAHTARI

  // Tekilleştir: webhook aynı yolu birden çok dalda biriktirebiliyor (zincir yürüyüşü).
  const tekil = [...new Set(yollar.map(tamUrl))]
  if (tekil.length === 0) return { durum: 'atlandi', sebep: 'yol-yok' }

  // K4 + URN-10: süzgeç bayrağın İKİ durumunda da çalışır (dosya başındaki gerekçe). Bayrak okuması tek yerde.
  const k3bAcik = ADRES_SEMASI_K3B
  const suzulmus = tekil.filter((u) => indexNoweGiderMi(u, k3bAcik))
  const dusurulen = tekil.length - suzulmus.length
  if (suzulmus.length === 0) {
    // Sebep bayrağa göre AYRIŞIR: açık kipte "yayın öncesi" demek yanıltır (sitenin adresleri zaten yayında).
    return k3bAcik
      ? { durum: 'atlandi', sebep: 'bildirilecek-yol-yok', dusurulen }
      : { durum: 'atlandi', sebep: 'yayin-oncesi', dusurulen }
  }
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
    // Yalnız 2xx kabul demektir (200 işlendi, 202 anahtar doğrulaması bekliyor). 400/403/422/429 `gonderildi` DEĞİLDİR:
    // eskiden bu yanıtlar "gonderildi" diye döner, anahtar/sunucu uyuşmazlığı kimse bakmadan günlerce sürerdi.
    // `res.ok` yerine aralık: yanıtı taklit eden sahte nesnelerde `ok` alanı olmayabilir.
    if (res.status < 200 || res.status > 299) {
      console.error(
        `[IndexNow] bildirim REDDEDILDI (webhook etkilenmedi): http=${res.status} denenen=${urlList.length} dusurulen=${dusurulen}`,
      )
      return { durum: 'reddedildi', denenen: urlList.length, dusurulen, http: res.status }
    }
    return { durum: 'gonderildi', gonderilen: urlList.length, dusurulen, http: res.status }
  } catch (error: unknown) {
    const mesaj = error instanceof Error ? error.message : String(error)
    // Yutuluyor AMA görünür: sessiz yutulan adım günlerce fark edilmez (ölçülmüş ders).
    console.error('[IndexNow] bildirim basarisiz (webhook etkilenmedi):', mesaj)
    return { durum: 'hata', mesaj, dusurulen }
  }
}
