/**
 * CutawayView — "İçinde ne var": kesit görseli + numaralı işaretler + kısa açıklama listesi.
 * Kapalıyken küçük önizleme satırı; satıra basınca açılır, görsele basınca tam ekran. Katalog görseli beyaz zeminde. Görsel ya da işaret yoksa çizilmez (K7).
 */
export interface CutawayIsaret {
  /** Görsel genişliğinin yüzdesi (0–100). */
  x: number;
  /** Görsel yüksekliğinin yüzdesi (0–100). */
  y: number;
  /** "Pervane". */
  ad: string;
  /** Kısa açıklama (kaynaklı). */
  aciklama?: string;
}
export interface CutawayViewProps {
  gorsel: string;
  alt?: string;
  isaretler: CutawayIsaret[];
  /** Varsayılan "İçinde ne var". */
  baslik?: string;
  acik?: boolean;
  onAcik?: (acik: boolean) => void;
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  style?: React.CSSProperties;
}
export declare function CutawayView(props: CutawayViewProps): JSX.Element | null;
