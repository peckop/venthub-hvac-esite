/**
 * SeriesPicker — ürün ailesi sayfasında "Seri seçin · n seri" + çipler (✓ seçili). Seçince seri kısmı değişir; adres o serinin adresi.
 * Çip 36 px görünür / 44 basılır. Tek serili ailede çizilmez. Mobilde yüzen düğmedeki "‹ seri n/m ›" ile aynı `secili`.
 */
export interface SeriesPickerSeri {
  id: string;
  /** Kısa ad: "Lineo Quiet". */
  ad: string;
  /** Serinin adresi (aile sayfası o seri seçili). */
  href?: string;
}
export interface SeriesPickerProps {
  /** Veride olmayan seri konmaz (K7). */
  seriler: SeriesPickerSeri[];
  secili?: string;
  onSec?: (id: string) => void;
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  style?: React.CSSProperties;
}
export declare function SeriesPicker(props: SeriesPickerProps): JSX.Element | null;
