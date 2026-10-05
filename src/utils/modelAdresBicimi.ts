/**
 * MODEL ADRESİ BİÇİMİ — ayırıcı, segment ÜRETİMİ ve AYRIŞTIRMA, TEK modül (URN-31; plan
 * `rec-adres-agac-tek-yayin-2026-09-07.md` §2 ve Faz 3 madde 3, kural D1).
 *
 * Biçim: `<slug metni>-p-<sku>` (SKU adreste küçük harf; harf duyarsız çözülür). Segment üretimini YALNIZ
 * `adresUret` (utils/adresUret.ts) çağırır, ayrıştırmayı sayfa çözücüsü (`urunSegmentiniCoz`) ve eşleyici
 * kullanır; ayırıcı metni başka hiçbir üretim dosyasında yazılmaz (kapı: INV-YAYINDA-MODEL-6a).
 * Biçim değişirse bu dosya değişir; ayrıştırma ile üretim BİRLİKTE durur (gidiş-dönüş testi:
 * `adresUret.test.ts` "gidiş-dönüş").
 */

/** Model adresinde slug metni ile SKU'yu ayıran işaret. Slug metninde ve SKU başında geçemez (plan §2, D1). */
export const MODEL_AYIRICI = '-p-'

/** Model segmenti: yüzde-kodlanmış slug metni + ayırıcı + küçük harfli SKU. (Dil önekini `adresUret` ekler.) */
export function modelSegmentiUret(slugMetni: string, sku: string): string {
  return `${encodeURIComponent(slugMetni)}${MODEL_AYIRICI}${encodeURIComponent(sku.trim().toLowerCase())}`
}

/** Slug metni adreste TAŞINABİLİR mi? (ayırıcı içermez; segmentte geri çözülür.) Liste doğrulamasının biçim ölçüsü. */
export function slugMetniUygunMu(slugMetni: string): boolean {
  if (slugMetni.includes(MODEL_AYIRICI)) return false
  const c = modelAdresiCoz(modelSegmentiUret(slugMetni, 'x1'))
  return c !== null && c.slugMetni === slugMetni && c.sku === 'X1'
}

/** SKU adreste TAŞINABİLİR mi? (üretilen segmentte ayırıcıyla çakışmaz; geri çözülünce aynı SKU.) */
export function skuAdreseUygunMu(sku: string): boolean {
  const c = modelAdresiCoz(modelSegmentiUret('x', sku))
  return c !== null && c.slugMetni === 'x' && c.sku === sku
}

/** Segment model segmenti biçiminde mi (ayırıcı içeriyor mu)? Ham ve hızlı; kanonikliğe karar vermez. */
export function modelSegmentiMi(segment: string): boolean {
  return segment.includes(MODEL_AYIRICI)
}

export interface CozulmusModelAdresi {
  /** Adresteki slug metni (yanlış olabilir — doğrusu yayındaki listedendir, farklıysa 308). */
  slugMetni: string
  /** DB biçiminde SKU (büyük harf; DB kısıtı `^[A-Z0-9-]+$`). */
  sku: string
  /** Adresteki SKU zaten kanonik (küçük harf) biçimde mi? Değilse çağıran 308 verir. */
  skuKanonik: boolean
}

/**
 * `/urun/<segment>` segmentinin model adresi olup olmadığını çözer (plan §5 Faz 3 madde 3).
 * SON ayırıcıdan bölünür: slug metni ayırıcı içeremez, SKU `P-` ile başlayamaz (D1) — ikisi birlikte
 * bölmeyi tek anlamlı yapar. Ayırıcı yoksa → null (aile adresi). Boş parça → null (geçersiz).
 * SAF: DB'ye bakmaz; SKU'nun yayında olup olmadığını çağıran ölçer.
 */
export function modelAdresiCoz(segment: string): CozulmusModelAdresi | null {
  let cozulmus: string
  try {
    cozulmus = decodeURIComponent(segment)
  } catch {
    return null
  }
  const i = cozulmus.lastIndexOf(MODEL_AYIRICI)
  if (i < 0) return null
  const slugMetni = cozulmus.slice(0, i)
  const skuParca = cozulmus.slice(i + MODEL_AYIRICI.length)
  if (!slugMetni || !skuParca) return null
  // Kanonik = büyük-küçük harf gidiş-dönüşünde DEĞİŞMEYEN metin. Yalnız `toLowerCase` karşılaştırması yetmezdi: 'ſ'
  // (uzun s) ve 'ı' (noktasız i) büyütülünce 'S' ve 'I' olur (listedeki SKU'ya çözülür) ama küçük harfte kendileri
  // kalır; adres 200 verir, 308 vermezdi.
  return { slugMetni, sku: skuParca.toUpperCase(), skuKanonik: skuParca === skuParca.toUpperCase().toLowerCase() }
}
