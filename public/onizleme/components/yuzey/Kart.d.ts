/**
 * Kart — beyaz yüzey, 1 px `--border-hairline`, köşe 16 px (`--radius-kart`).
 * Tıklanır kartta üstüne gelince `--shadow-kart-hover` + 2 px kalkma (ölçek yok).
 * Ürün kartı alanları (`gorsel`, `marka`, `baslik`, `ozet`) verilirse kılavuz G'deki ürün kartı çizilir;
 * fotoğraf yoksa kutu kalkar ve kart 2 px petrol üst kuralla başlar (K7).
 */
export interface KartProps {
  children?: React.ReactNode;
  /** Ürün fotoğrafı (beyaz fonlu). Verilmezse fotoğraf kutusu çizilmez. */
  gorsel?: string;
  gorselAlt?: string;
  /** Marka adı, veriden gelen yazımla (AVenS, SEAT). Büyük harfe çevrilmez. */
  marka?: string;
  baslik?: React.ReactNode;
  /** Kısa teknik özet, tabular-nums: "175 m³/h · 34 dB(A)". */
  ozet?: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  /** Gölge/kalkma tepkisini zorla aç/kapat. Varsayılan: href ya da onClick varsa açık. */
  etkilesimli?: boolean;
  /** İç dolgu. Varsayılan: ürün kartı 10/14 px, genel kart --space-card-loose (20 px). */
  dolgu?: string;
  style?: React.CSSProperties;
}
export declare function Kart(props: KartProps): JSX.Element;
