/**
 * FAQ — "Sık sorulan sorular" (iş emri #11 · Site S5 SSS biçimi, birebir). Kart yok, en çok 760 px; üstte ve her satırın altında 1 px hairline.
 * Satır: KatliCagriSatiri (numara 01/02 …, soru 17/600, en az 64 px, 36 px ok). Cevabı olmayan soru çizilmez.
 * Kullanıldığı yer: ürün şablonu, aile sayfası kartı (ürün türü / seri eklenince aynı parça).
 */
export interface FAQSoru {
  soru: string;
  cevap: React.ReactNode;
}
export interface FAQProps {
  /** h2 (Schibsted 800, clamp 24–34). Verilmezse başlık dışarıda. */
  baslik?: string;
  alt?: string;
  sorular: FAQSoru[];
  /** Bir soru açılınca öteki kapanır. */
  tekAcik?: boolean;
  /** İlk soru açık başlar. */
  ilkAcik?: boolean;
  /** Numara sütunu (01, 02 …). Varsayılan true. */
  numarali?: boolean;
  /** Bölümün dili (lang). */
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function FAQ(props: FAQProps): JSX.Element | null;
