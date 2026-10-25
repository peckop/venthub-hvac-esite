/**
 * SeriesCard — seri kartı = CategoryCard görünümü (iş emri #14 D): fotoğraf · "marka + kısa seri adı →" · "n model"; kartın tamamı basılır. Marka satırı ve "Aç →" yok.
 * Parça yalnız seri verisini CategoryCard'a çevirir; ikinci görünüm kopyası yok.
 */
export interface SeriesCardSeri {
  slug: string;
  /** Tam ad (title'da). */
  ad: string;
  /** Ekrandaki kısa ad ("Lineo Quiet") veriden gelir; verilmezse `ad` gösterilir. Parça ad kısaltmaz (dil bağımlı kural, iş emri #3). */
  kisaAd?: string;
  /** Ekranda büyük harf (sayfa diline göre). */
  marka?: string;
  modelSayisi?: number;
  foto?: string | null;
  /** Seri 2+ serili bir ürün ailesindeyse true: "Aç →" simgesi ürün ailesi (14b). */
  ailede?: boolean;
}
export interface SeriesCardProps {
  seri: SeriesCardSeri;
  onAc?: (slug: string) => void;
  href?: string;
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr (İ), 'EN' → en (I). Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  /** Sayı biçimi; verilmezse dil'den. */
  yerel?: string;
  /** CategoryCard fotoğraf yüksekliği (varsayılan 160, mobil 120). */
  fotoYukseklik?: number;
  style?: React.CSSProperties;
}
export declare function SeriesCard(props: SeriesCardProps): JSX.Element | null;
