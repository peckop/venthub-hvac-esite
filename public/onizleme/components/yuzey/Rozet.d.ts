/**
 * Rozet — tıklanmayan oval etiket (kılavuz G). Üç sınıf: `nesnel` (p2-tint + body) · `hukum` (petrol + beyaz) · `soluk` (inset + muted).
 * Büyük harf, `lang="tr"`. Kiremit rozette yok. Tıklanan seçim için `Cip`.
 */
export interface RozetProps {
  children: React.ReactNode;
  /** nesnel: belge/değer (IP54) · hukum: sistemin sözü (Önerilen) · soluk: veri yok/edilgen (Arşiv). */
  sinif?: 'nesnel' | 'hukum' | 'soluk';
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr (İ), 'EN' → en (I). Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function Rozet(props: RozetProps): JSX.Element;
