/**
 * PhotoStage — her yerde aynı ürün fotoğrafı sahnesi: açık petrol zemin (inset → page), fotoğrafın zeminini okuyarak
 * zeminsiz → gölge, beyaz zeminli → multiply. Boy kademesi: satir 60 · kart 160–200 · kapak 300 · seri/urun 360 (mobil 300) · buyuk 400.
 * Kaynak: foto-ve-kart-kurali-2026-10-23 §1, Foto Dili Akış 1–5. Fotoğraf yoksa çizilmez.
 */
export interface PhotoStageProps {
  src?: string | null;
  alt?: string;
  boy?: 'satir' | 'kart' | 'kapak' | 'seri' | 'urun' | 'buyuk';
  /** Boyu ezmek için (px sayı ya da CSS değeri), ör. kart 160/200. */
  yukseklik?: number | string;
  genislik?: string;
  /** otomatik: sol üst pikselden okunur (görsel CORS izni gerekir; okunamazsa zeminsiz sayılır). */
  zemin?: 'otomatik' | 'zeminsiz' | 'beyaz';
  /** Kapakta zemin dış kaptan geliyorsa false. */
  sahneZemini?: boolean;
  /** seri/urun/buyuk boyunu 300'e indirir. */
  mobil?: boolean;
  kose?: string;
  /** Sahnenin üstüne konumlanan öğeler (oklar, sayaç). Fotoğrafa rozet bindirilmez (istisna FamilyCard). */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function PhotoStage(props: PhotoStageProps): JSX.Element | null;
