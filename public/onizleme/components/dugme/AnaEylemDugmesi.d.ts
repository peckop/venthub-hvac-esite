/**
 * Sayfanın tek dolu kiremit düğmesi — sayfanın işini bitiren eylem (kılavuz G · K5).
 * Oval (`--radius-dugme`), zemin `--action-terracotta-deep` #BF5309, beyaz etiket (4.71), 48 px.
 * Sayfada bir tane olur; öteki bütün eylemler `CerceveliDugme`.
 */
export interface AnaEylemDugmesiProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  /** Verilirse <a> olarak çizilir. */
  href?: string;
  /** Kabın tam genişliği (mobil alt panel, sepet). */
  tam?: boolean;
  /** Devre dışı: --surface-inset zemin + --text-muted (5.19). Opaklık kullanılmaz. */
  disabled?: boolean;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
}
export declare function AnaEylemDugmesi(props: AnaEylemDugmesiProps): JSX.Element;
