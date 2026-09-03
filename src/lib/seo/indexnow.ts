import { SITE_URL } from '@/config/siteUrl'

/**
 * IndexNow — değişen sayfaları arama motorlarına ANINDA bildirir (REC-127, Bing paketi).
 *
 * NİÇİN VAR: sitemap "bir ara gel bak" der, IndexNow "şu sayfa DEĞİŞTİ" der. Katalogda
 * fiyat/görsel/ad değiştiğinde vitrin sayfası tazeleniyor ama arama motoru bunu ancak
 * kendi tarama takvimi gelince görüyordu. Zincirin son halkası eksikti.
 *
 * ⚠ANAHTAR YOKSA SESSİZCE HİÇBİR ŞEY YAPMAZ — ve bu BİLEREK böyle.
 * ⭐RECEP KARARI (2026-09-03): anahtar ve `public/<anahtar>.txt` ŞİMDİ girilmiyor —
 * kategori adresleri kısa slug'a geçtiğinde aynı yayında girilecek, çünkü Bing'i birazdan
 * DEĞİŞECEK adreslerle beslemek işe yaramaz. Yani bu modül aylarca anahtarsız yaşayacak;
 * sessizlik geçici bir hâl değil, NORMAL hâl. Sözleşme `INV-INDEXNOW-1` ile kapı altında:
 * ağ isteği denenmez, hata günlüğüne yazılmaz, ama yanıtta "atlandi" olarak GÖRÜNÜR —
 * sessiz olmak görünmez olmak değildir (görünmez olsaydı çalışmayan bildirimi çalışıyor
 * sanardık).
 * `INDEXNOW_KEY` tanımlı değilse çağrı no-op'tur. Bildirim BEST-EFFORT bir yan etkidir: başarısız olması
 * webhook'u ASLA düşürmemeli, çünkü webhook'un asıl işi önbellek tazelemektir ve o iş
 * arama motoru bildiriminden çok daha kritiktir. Bu yüzden burada hiçbir hata yukarı
 * fırlatılmaz; yutulan hata GÜNLÜĞE yazılır (sessiz yutma on gün gizlenir — ölçüldü).
 */

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

/** Tek istekte bildirilebilecek üst sınır (IndexNow sözleşmesi 10.000). */
const MAX_URL = 10_000

type BildirimSonucu =
  | { durum: 'atlandi'; sebep: 'anahtar-yok' | 'yol-yok' }
  | { durum: 'gonderildi'; adet: number; http: number }
  | { durum: 'hata'; mesaj: string }

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
  const key = process.env.INDEXNOW_KEY
  if (!key) return { durum: 'atlandi', sebep: 'anahtar-yok' }

  // Tekilleştir: webhook aynı yolu birden çok dalda biriktirebiliyor (zincir yürüyüşü).
  const urlList = [...new Set(yollar.map(tamUrl))].slice(0, MAX_URL)
  if (urlList.length === 0) return { durum: 'atlandi', sebep: 'yol-yok' }

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
    return { durum: 'gonderildi', adet: urlList.length, http: res.status }
  } catch (error: unknown) {
    const mesaj = error instanceof Error ? error.message : String(error)
    // Yutuluyor AMA görünür: sessiz yutulan adım günlerce fark edilmez (ölçülmüş ders).
    console.error('[IndexNow] bildirim basarisiz (webhook etkilenmedi):', mesaj)
    return { durum: 'hata', mesaj }
  }
}
