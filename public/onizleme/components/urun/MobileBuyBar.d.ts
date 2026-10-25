/**
 * MobileBuyBar — ürün sayfası mobil alt çubuğu: seçim çipi ("Ø100 · EC ▾") + fiyat + ana eylem; çipe basınca alttan "Model seçin" paneli
 * (VariantPicker, canlı değerler, fiyat, ana eylem). Çağıran çubuğu sayfanın altına sabitler (position: sticky/fixed).
 * Kaynak: Ürün Sayfası Alternatifler 6a, 6a-2.
 */
export interface MobileBuyBarEksen {
  id: string;
  ad: string;
  secenekler: Array<{ deger: string; ad: string; pasif?: boolean }>;
  secili?: string;
}
export interface MobileBuyBarProps {
  /** Çipteki seçim özeti: "Ø100 · EC". */
  secimEtiketi?: string;
  eksenler?: MobileBuyBarEksen[];
  secim?: Record<string, string>;
  onSecim?: (secim: Record<string, string>, degisenEksen: string) => void;
  /** Paneldeki değerler (seçime göre): [{ e: 'Debi', v: '300 m³/h' }]. */
  degerler?: Array<{ e: string; v?: string | null }>;
  kip?: 'teklif' | 'satis';
  fiyat?: number | null;
  kdvOrani?: number;
  listede?: boolean;
  onEkle?: (e: React.MouseEvent) => void;
  /** Kontrollü panel. */
  acik?: boolean;
  onAcik?: (acik: boolean) => void;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Sayı biçimi (Intl yerel kodu). Varsayılan 'tr-TR'. */
  yerel?: string;
  /** Adet: kapalı çubukta görünür (AdetKontrolu); onEkle(adet). */
  adet?: number;
  onAdet?: (n: number) => void;
  style?: React.CSSProperties;
}
export declare function MobileBuyBar(props: MobileBuyBarProps): JSX.Element;
