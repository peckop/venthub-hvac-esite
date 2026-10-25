/**
 * Pagination — sayfalama. S5 `parca/Pagination` · depo `components/ui/Pagination.tsx`.
 * 44 px oval düğmeler; tek sayfada çizilmez. Sınırdaki ok düğmesi --text-muted (opaklık yok).
 */
export interface PaginationProps {
  /** Toplam öğe sayısı. */
  toplam: number;
  /** Sayfa başına öğe, varsayılan 24. */
  boyut?: number;
  /** Kontrollü geçerli sayfa (1 tabanlı). */
  sayfa?: number;
  onSayfa?: (sayfa: number) => void;
  /** Mobil kısa biçim: "‹ Sayfa 2 / 4 ›". */
  kisa?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  style?: React.CSSProperties;
}
export declare function Pagination(props: PaginationProps): JSX.Element | null;
