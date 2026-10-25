// Lineo Quiet ses ETİKETİ biçimleme: tipler + tek basıcı `sesEtiketi` (URN-135).
// Neden ayrı dosya: istemci bileşenleri ('use client' kategori görünümü ve altındaki sessiz fan bölümleri) ses sayısını
// basmak için bu üreticiye ihtiyaç duyar; ses VERİ dosyası (`lineoQuiet.veri.json`, tüm eğriler, ~54 KB) ise yalnız
// sunucuda okunur. Bu dosya JSON'u ve `sesVerisi.ts`'i İMPORT ETMEZ, böylece istemci demetine yalnız biçimleyici girer
// (kapı: `CategoryLandingSessizFanMetin.test.tsx` (h), aile yolunda `aileMetniLineoQuiet.test.tsx` (e)).
// `SesDegeri` KURMAK hâlâ yalnız `sesVerisi.ts` içindeki `degerKur`un işidir (yapısal kapı: `sesVerisi.test.ts` (f)).

/** Ses basıncının ölçüldüğü/hesaplandığı yer. */
export type SesYeri = 'emis' | 'ufleme' | 'govde'

/** Ses değerinin ZORUNLU koşulu: 3 m, serbest alan; yer ve kademe adı. */
export type SesKosulu = Readonly<{ mesafeM: 3; yer: SesYeri; kademe: string }>

/** Koşullu ses basıncı (dB(A)). Koşul alanı zorunludur; koşulsuz değer kurulamaz. */
export type SesDegeri = Readonly<{ dbA: number; kosul: SesKosulu }>

/** Çağıranın sözlükten verdiği sözcükler (bu modül sözlük dosyasına dokunmaz). */
export type SesEtiketSozlugu = {
  yer: Record<SesYeri, string>
  metre: string
  kademe: Record<string, string>
}

function sayiMetni(n: number, lang: 'tr' | 'en'): string {
  const metin = String(n)
  return lang === 'tr' ? metin.replace('.', ',') : metin
}

/**
 * SES DEĞERİNİ BASAN TEK ÜRETİCİ. Hiçbir yerde `dbA` ham sayı olarak yazılmaz; çıktı daima
 * koşullu bir cümledir: TR '9,9 dB(A) · 4 V · gövde, 3 m', EN '9.9 dB(A) · 4 V · casing, 3 m'.
 * Yer ve kademe sözcüklerini çağıran sözlükten verir; kademe sözlükte yoksa veri adı aynen yazılır.
 * Geçersiz değer (sonlu olmayan sayı) boş metin döner: çağıran boş kutuyu ÇİZMEZ.
 */
export function sesEtiketi(d: SesDegeri, lang: 'tr' | 'en', etiket: SesEtiketSozlugu): string {
  if (!Number.isFinite(d.dbA)) return ''
  const kademe = Object.prototype.hasOwnProperty.call(etiket.kademe, d.kosul.kademe)
    ? etiket.kademe[d.kosul.kademe]
    : d.kosul.kademe
  return `${sayiMetni(d.dbA, lang)} dB(A) · ${kademe} · ${etiket.yer[d.kosul.yer]}, ${d.kosul.mesafeM} ${etiket.metre}`
}
