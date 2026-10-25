/**
 * QuoteRequestButton — teklif/sepet eylemi; sitede her yerde aynı renk ve simge (teklif = belge, sepet = araba).
 * Satış kipi + fiyatlı ürün → sepet; aksi hâlde teklif. Depo `components/quotes/QuoteRequestButton.tsx`.
 * `boyut="ikon"` 44×44: sepet dolu kiremit, teklif çerçeveli petrol · `boyut="etiket"` 48 px dolu kiremit, sayfanın tek ana eylemi.
 */
export interface QuoteRequestButtonProps {
  kip?: 'teklif' | 'satis';
  /** Üründe fiyat var mı. Satış kipinde fiyatsız ürün teklif listesine gider. */
  fiyatVar?: boolean;
  /** ikon: kart, model satırı, açılan kutu · etiket: ürün sayfası, mobil alt çubuk. */
  boyut?: 'ikon' | 'etiket';
  /** Ürün listede/sepette: simge yerine ✓. */
  listede?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  /** Etikette kabın tam genişliği. */
  tam?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  style?: React.CSSProperties;
}
export declare function QuoteRequestButton(props: QuoteRequestButtonProps): JSX.Element;
