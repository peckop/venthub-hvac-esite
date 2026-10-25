/**
 * Adet kontrolü — oval, 44 px dokunma hedefi; − değer +. Sınırda düğme --text-muted (opaklık yok).
 */
export interface AdetKontroluProps {
  /** Verilirse kontrollü. */
  deger?: number;
  /** Kontrolsüz başlangıç değeri, varsayılan 1. */
  varsayilan?: number;
  min?: number;
  max?: number;
  adim?: number;
  onDegisim?: (deger: number) => void;
  /** Erişilebilir ad, varsayılan "Adet". */
  etiket?: string;
  style?: React.CSSProperties;
}
export declare function AdetKontrolu(props: AdetKontroluProps): JSX.Element;
