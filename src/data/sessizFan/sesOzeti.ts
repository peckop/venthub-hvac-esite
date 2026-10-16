// Lineo Quiet ses özeti: sitedeki CANLI model kodlarının ses aralığı (URN-135, U3).
// Neden: kategori sayfasındaki sessiz fan metni "en düşük gövde değeri" gibi sayılar söyler; bu sayılar yazılı
// metinden değil, veri modülünün (`sesVerisi.ts`) SİTEDE CANLI olan kodlarla KESİŞİMİNDEN hesaplanır. Veri
// modülünde olup sitede satılmayan kodun (örn. 17163, 17173) değeri hiçbir yerde çizilmez ve sayılmaz.
// Saf modüldür: sözlük ve UI içermez, `SesDegeri` kurmaz (tek kurucu `sesVerisi.ts`); çıktı düz nesnedir, sunucudan
// istemci bileşenine prop olarak güvenle taşınır.

import { kademeSesTablosu, modelAdi, type SeriOzeti,seriOzeti, type SesDegeri } from './sesVerisi'

/**
 * Sessiz fan anlatısının konusu olan seri (kanonik `product_families.slug`).
 * Görünüm tarafındaki ikizi `CategoryLandingView.tsx` içindeki `SESSIZ_FAN_SERILERI` sabitidir (AST kapısı onu okur);
 * iki liste `sesOzeti.test.ts` içinde birbirine eşitlenir, ayrışırlarsa kırmızı verir.
 */
export const SESSIZ_FAN_SERI_SLUGLARI = ['vortice-lineo-quiet-sessiz-kanal-fanlari'] as const

/** Vortice SKU öneki; model kodu = önekten sonraki rakamlar (`VRT-17164` → `17164`). Kalıba uymayan SKU kod sayılmaz. */
const SKU_KALIBI = /^VRT-(\d+)$/

/**
 * Ürün SKU'larından model kodları (tekil, giriş sırası korunur). Kalıba uymayan, boş ya da eksik SKU atlanır
 * (fail-closed). Servis katmanı (`sessizFanKodlari.service.ts`) sitedeki aktif ürünlerin SKU'larını buraya verir.
 */
export function skudanModelKodlari(skular: ReadonlyArray<string | null | undefined>): string[] {
  const kodlar: string[] = []
  for (const sku of skular) {
    const eslesme = typeof sku === 'string' ? SKU_KALIBI.exec(sku.trim()) : null
    const kod = eslesme?.[1]
    if (kod && !kodlar.includes(kod)) kodlar.push(kod)
  }
  return kodlar
}

/** Ø200 AC ve Ø150 ES örnek modelleri veri modülündeki ADLARIYLA bulunur (kod sabiti elle yazılmaz). */
const AD_Q200 = 'LINEO 200 QUIET'
const AD_ES150 = 'LINEO 150 QUIET ES'

export type SesOzeti = Readonly<{
  /** Canlı kodların gövde ve emiş aralığı (uç değerler + hangi kodlardan geldikleri). */
  seri: SeriOzeti
  /** Dört uç değerin görünen model adı ("Lineo 100 Quiet ES"). */
  adlar: Readonly<{
    enDusukGovde: string
    enYuksekGovde: string
    enDusukEmis: string
    enYuksekEmis: string
  }>
  /** Ø200 AC modelinin en yüksek hız değerleri; model canlı değilse null. */
  q200: Readonly<{ govde: SesDegeri; emis: SesDegeri }> | null
  /** Ø150 ES modelinin 4 V gövde değeri; model canlı değilse null. */
  es150Govde4V: SesDegeri | null
}>

/**
 * Veri adını ("LINEO 100 QUIET ES") görünen adına çevirir ("Lineo 100 Quiet ES"): iki harfli ve kısa sözcükler
 * (ES, T) ile sayılar olduğu gibi kalır, diğer sözcükler baş harfi büyük yazılır.
 */
export function gorunenModelAdi(ad: string): string {
  return ad
    .split(' ')
    .map((s) => (s.length <= 2 || /^\d/.test(s) ? s : `${s.charAt(0)}${s.slice(1).toLowerCase()}`))
    .join(' ')
}

function adiBul(kodlar: readonly string[], ad: string): string | null {
  return kodlar.find((k) => modelAdi(k) === ad) ?? null
}

function gorunenAd(kod: string): string | null {
  const ad = modelAdi(kod)
  return ad ? gorunenModelAdi(ad) : null
}

/**
 * Canlı kodlardan ses özeti. Kesişim boşsa (canlı kodların hiçbirinde veri yok) ya da bir uç değerin model adı
 * çözülemezse `null` döner: çağıran ses cümlelerini ÇİZMEZ (fail-closed).
 */
export function sesOzetiHesapla(canliKodlar: readonly string[]): SesOzeti | null {
  const seri = seriOzeti(canliKodlar)
  if (!seri) return null
  const adlar = {
    enDusukGovde: gorunenAd(seri.kodlar.enDusukGovde),
    enYuksekGovde: gorunenAd(seri.kodlar.enYuksekGovde),
    enDusukEmis: gorunenAd(seri.kodlar.enDusukEmis),
    enYuksekEmis: gorunenAd(seri.kodlar.enYuksekEmis),
  }
  if (!adlar.enDusukGovde || !adlar.enYuksekGovde || !adlar.enDusukEmis || !adlar.enYuksekEmis) return null

  let q200: SesOzeti['q200'] = null
  const kodQ200 = adiBul(canliKodlar, AD_Q200)
  const satirQ200 = kodQ200 ? kademeSesTablosu(kodQ200)?.at(-1) : undefined
  if (satirQ200 && satirQ200.kademe === 'en yüksek') q200 = { govde: satirQ200.govdeLp, emis: satirQ200.emisLp }

  let es150Govde4V: SesDegeri | null = null
  const kodEs150 = adiBul(canliKodlar, AD_ES150)
  const satirEs150 = kodEs150 ? kademeSesTablosu(kodEs150)?.find((s) => s.kademe === '4 V') : undefined
  if (satirEs150) es150Govde4V = satirEs150.govdeLp

  return {
    seri,
    adlar: {
      enDusukGovde: adlar.enDusukGovde,
      enYuksekGovde: adlar.enYuksekGovde,
      enDusukEmis: adlar.enDusukEmis,
      enYuksekEmis: adlar.enYuksekEmis,
    },
    q200,
    es150Govde4V,
  }
}
