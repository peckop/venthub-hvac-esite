/**
 * SoundTable — seri sayfası ses karşılaştırması: cevap cümlesi, 20–60 dB(A) ölçek, model başına hız noktaları (katalog değeri, emiş, 3 m).
 * Satıra basınca kutu: hız etiketleri, Ürün sayfası →, ⇄, teklif/sepet. Altta değer notu. Mekân uygunluğu iptal (iş emri #4). Kaynak: S5 `data-ses-sade` · 6c-1.
 */
export interface SoundTableModel {
  sku: string;
  /** Kısa ad: "Lineo 100 Quiet". */
  ad: string;
  foto?: string;
  /** Katalog değeri: ses basıncı, emiş, 3 m. */
  hizlar: Array<{ ad: string; db: number }>;
  fiyat?: number | null;
}
export interface SoundTableProps {
  modeller: SoundTableModel[];
  olcek?: { min: number; max: number };
  kip?: 'teklif' | 'satis';
  /** sku → listede mi. */
  listede?: Record<string, boolean>;
  karsilastirmada?: Record<string, boolean>;
  onEkle?: (sku: string) => void;
  onKarsilastir?: (sku: string) => void;
  onAc?: (sku: string) => void;
  /** Satır 48 px (masaüstü 34). */
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Sayı biçimi (Intl yerel kodu). Varsayılan 'tr-TR'. */
  yerel?: string;
  style?: React.CSSProperties;
}
export declare function SoundTable(props: SoundTableProps): JSX.Element | null;
