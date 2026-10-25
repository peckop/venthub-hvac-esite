/**
 * CompareButton — ürünü karşılaştırmaya ekler/çıkarır. 44×44 oval, `--border-control` kenar; seçili `--p2-tint` + petrol kenar.
 * Teklif/sepet düğmesinin solunda durur.
 */
export interface CompareButtonProps {
  secili?: boolean;
  /** ikon 44 px (kart, satır) · etiket 48 px (ürün sayfasında ana eylemin yanında). */
  boyut?: 'ikon' | 'etiket';
  onClick?: (e: React.MouseEvent) => void;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** ⇄ simgesinin yanında yazı ("Karşılaştır"); ürün kapağı kutusunda (iş emri #10). */
  yazili?: boolean;
  style?: React.CSSProperties;
}
export declare function CompareButton(props: CompareButtonProps): JSX.Element;
