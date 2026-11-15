/**
 * ÜRÜN ASİSTANI — İSTEMCİ IP ÇÖZÜCÜ (URN-171, adım 1).
 *
 * Kaynak (emsal, aynen taşındı): `supabase/functions/quote-request-guest/index.ts` satır 193-209
 * ("IP KAYNAĞI SIRASI DÜZELTİLDİ", güvenlik incelemesi, YÜKSEK bulgu 2), aynı sıra `iyzico-payment`'ta.
 *
 * SIRA: (1) `cf-connecting-ip`, (2) `x-real-ip`: kenar sunucusunun YAZDIĞI başlıklar; (3) hiçbiri yoksa
 * `x-forwarded-for`'un SON öğesi (zinciri kenar ekler, o güvenilir); (4) hiçbiri yoksa "bilinmeyen".
 *
 * `x-forwarded-for`'un İLK öğesi İSTEMCİ TARAFINDAN YAZILABİLİR: her istekte farklı bir değer göndermek hız
 * sınırını yok hükmüne sokar (hız sınırı var gibi görünür ama bir şey ölçmez). Bu yüzden o sırayla ALINMAZ;
 * kapı: `asistan-cekirdek.test.ts` ve `istemciIp.test.ts` ilk öğeyi yazan istemcinin sayaç anahtarını değiştirememesini ölçer.
 *
 * Emsalden TEK fark: dönüş, değerle birlikte KAYNAĞI da söyler. Plan §4 madde 8: paylaşılan genel sayaç anahtarı
 * olmamalı (anonim biri onu doldurup herkes için kapatabilir); çağıran `kaynak === 'bilinmeyen'` ise ortak "bilinmeyen"
 * anahtarına yazmak yerine isteği reddedebilir ya da çok daha sıkı bir sınır uygulayabilir. Karar çağıranındır.
 * Başlıkların güvenilir olduğu varsayımı barındırma ortamına bağlıdır (emsal Supabase Edge'dir): yeni uç Vercel'de
 * koşacaksa hangi başlığı kenarın yazdığı Altyapı ile doğrulanmalıdır.
 */

/** `Headers`, Next'in `ReadonlyHeaders` nesnesi ya da `{ get }` taşıyan her şey. */
export type BaslikOkuyucu = Readonly<{ get(ad: string): string | null }>

export type IpKaynagi = 'cf-connecting-ip' | 'x-real-ip' | 'x-forwarded-for-son' | 'bilinmeyen'

export const BILINMEYEN_IP = 'bilinmeyen'
/** Sayaç anahtarının uzunluğu sınırlı: uzun başlık sayaç tablosunu şişirmesin (emsalle aynı sınır). */
export const MAKS_IP_UZUNLUGU = 64

export type IstemciIp = Readonly<{ ip: string; kaynak: IpKaynagi }>

function doluMetin(deger: string | null): string | null {
  if (deger === null) return null
  const temiz = deger.trim()
  return temiz === '' ? null : temiz
}

export function istemciIpAl(basliklar: BaslikOkuyucu): IstemciIp {
  const cf = doluMetin(basliklar.get('cf-connecting-ip'))
  if (cf !== null) return { ip: cf.slice(0, MAKS_IP_UZUNLUGU), kaynak: 'cf-connecting-ip' }

  const gercek = doluMetin(basliklar.get('x-real-ip'))
  if (gercek !== null) return { ip: gercek.slice(0, MAKS_IP_UZUNLUGU), kaynak: 'x-real-ip' }

  const xff = (basliklar.get('x-forwarded-for') ?? '')
    .split(',')
    .map((parca) => parca.trim())
    .filter((parca) => parca !== '')
  const son = xff.length > 0 ? xff[xff.length - 1] : null
  if (son !== null) return { ip: son.slice(0, MAKS_IP_UZUNLUGU), kaynak: 'x-forwarded-for-son' }

  return { ip: BILINMEYEN_IP, kaynak: 'bilinmeyen' }
}
