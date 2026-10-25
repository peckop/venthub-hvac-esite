/**
 * ProductCard — ürün kartı: fotoğraf (PhotoStage 180) · ad · seri · fiyat + ⇄ ve teklif/sepet. En çok üç bilgi; kartta teknik değer yok.
 * Depo `components/ProductCard.tsx` sözleşmesi: `quoteMode` (fiyatsız ya da teklif kipi → teklif) · `showPrice` (satış + fiyat).
 * `yerlesim="liste"` aynı veriyle `ModelRow` çizer. Kaynak: Foto Dili Akış 1 · foto-ve-kart-kurali §3.
 */
export interface ProductCardUrun {
  sku: string;
  /** Ürün adı. Liste satırında kısa ad (marka başta yazmaz). */
  ad: string;
  /** Seri adı: "Lineo Quiet". */
  seri?: string;
  marka?: string;
  /** Model kodu (liste satırı). */
  kod?: string;
  /** Motor işareti, kodun sağında (liste satırı): "AC" · "EC". */
  motor?: string;
  /** Liste satırındaki iki değer: [{ v: '300', birim: 'm³/h' }, { v: '27,4', birim: 'dB(A)' }]. */
  degerler?: Array<{ v?: string | null; birim?: string }>;
  gorseller?: string[];
  /** KDV hariç ₺; yalnız satış kipinde. Kaynakta yoksa verilmez. */
  fiyat?: number | null;
}
export interface ProductCardProps {
  urun: ProductCardUrun;
  yerlesim?: 'kart' | 'liste';
  kip?: 'teklif' | 'satis';
  listede?: boolean;
  karsilastirmada?: boolean;
  onEkle?: (sku: string, eylem: 'teklif' | 'sepet') => void;
  onKarsilastir?: (sku: string) => void;
  onAc?: (sku: string) => void;
  /** Kart fotoğraf sahnesi boyu (160–200), varsayılan 180. */
  fotoYukseklik?: number;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Sayı biçimi (Intl yerel kodu). Varsayılan 'tr-TR'. */
  yerel?: string;
  style?: React.CSSProperties;
}
export declare function ProductCard(props: ProductCardProps): JSX.Element | null;
