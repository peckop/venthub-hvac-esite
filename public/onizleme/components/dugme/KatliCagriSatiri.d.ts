/**
 * Katlı çağrı satırı — SSS satırı (iş emri #11 · Site S5 SSS): kapsız, altında 1 px hairline; grid 32 · 1fr · 36, en az 64 px;
 * numara 14 tabular petrol; soru 17/600; 36 px ok (açıkken dolu petrol); gövde 280 ms, cevap 17/1.6, sol hiza soru. FAQ bunu dizer.
 */
export interface KatliCagriSatiriProps {
  baslik: React.ReactNode;
  /** Açık gövde içeriği. */
  children?: React.ReactNode;
  /** Numara ("01"). Verilmezse numara sütunu yok, gövde sol 6. */
  no?: string;
  acik?: boolean;
  onDegisim?: (acik: boolean) => void;
  /** 'yok' verilirse alt çizgi çizilmez. Varsayılan: her satırın altında çizgi (S5). */
  sonSatir?: boolean | 'yok';
  style?: React.CSSProperties;
}
export declare function KatliCagriSatiri(props: KatliCagriSatiriProps): JSX.Element;
