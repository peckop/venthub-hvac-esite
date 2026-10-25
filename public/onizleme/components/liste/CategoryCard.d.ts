/**
 * CategoryCard — ürün grubu / ürün türü kartı: fotoğraf · ad → · "n model". Sade kart (A+ noktalı kart iptal, kart-dili-kararlar 10-24).
 * Kart sonraki sayfayı açar; kısalma (tek serili tür → seri, tek modelli seri → ürün sayfası) href'te.
 */
export interface CategoryCardKategori {
  slug: string;
  ad: string;
  foto?: string | null;
  /** Kartta "n model". */
  modelSayisi?: number;
}
export interface CategoryCardProps {
  kategori: CategoryCardKategori;
  onAc?: (slug: string) => void;
  href?: string;
  /** Varsayılan 160 (mobil 120). */
  fotoYukseklik?: number;
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Sayı biçimi (Intl yerel kodu). Varsayılan 'tr-TR'. */
  yerel?: string;
  style?: React.CSSProperties;
}
export declare function CategoryCard(props: CategoryCardProps): JSX.Element | null;
