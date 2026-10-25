/**
 * HiyerarsiSimgesi — katalog seviye simgesi (13a + 14b): Ürünler › Ürün grubu › Ürün türü › Ürün ailesi › Seri › Model. Yalnız yazıyla birlikte.
 * SeviyeEtiketi — simge 18 + ÜRÜN GRUBU / ÜRÜN TÜRÜ / ÜRÜN AİLESİ / SERİ / MODEL (12.5/700, 0,08em, petrol); `marka` verilirse "SERİ · VORTICE".
 */
export type Seviye = 'urunler' | 'urun-grubu' | 'urun-turu' | 'urun-ailesi' | 'seri' | 'model';
/** Etikette ek seviye: 'uygulama-alani' → "UYGULAMA ALANI" (simgesiz, iş emri #6). */
export type EtiketSeviye = Seviye | 'uygulama-alani';
export interface HiyerarsiSimgesiProps {
  seviye?: Seviye;
  /** px. Varsayılan 22. */
  boyut?: number;
  /** Varsayılan petrol; petrol zeminde `#fff`. */
  renk?: string;
  style?: React.CSSProperties;
}
export declare function HiyerarsiSimgesi(props: HiyerarsiSimgesiProps): JSX.Element;
export interface SeviyeEtiketiProps {
  seviye?: EtiketSeviye;
  marka?: string;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr (İ), 'EN' → en (I). Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function SeviyeEtiketi(props: SeviyeEtiketiProps): JSX.Element;
