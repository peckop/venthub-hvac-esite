/**
 * SeriesHeader — seri sayfası kapağı: PageCover + h1'de marka logosu (marka adı ekranda gizli, h1 metninde kalır) + seri tanımı +
 * aralık değerleri + çerçeveli "Sessiz modelinizi bulun ↓" / "Uygun modeli bulun ↓". Yeni ad (depoda SeriesLandingView içinde).
 * Kaynak: Foto Dili Akış 4 · S5 6c-4. Logo dosyaları `assets/marka-logolari/`.
 */
export interface SeriesHeaderProps {
  /** Marka adı, veriden gelen yazımla (Vortice, AVenS). */
  marka?: string;
  /** Yatay logo yolu (assets/marka-logolari/vortice-yatay.png). Yoksa marka adı görünür yazılır. */
  markaLogo?: string;
  markaHref?: string;
  seriAdi: string;
  /** "Sessiz Kanal Fanları". */
  seriTanimi?: string;
  /** Alt satıra basınca alt kategori sayfası. */
  tanimHref?: string;
  /** @deprecated Kapak konum çizmez (iş emri #6 madde 4); konum yalnız SectionRail'de. Verilirse yok sayılır. */
  konum?: unknown;
  /** Aralık değerleri: [{ e: 'Çap', v: 'Ø100–315 mm' }]. Boş değer çizilmez. */
  degerler?: Array<{ e: string; v?: string | null }>;
  foto?: { src?: string | null; alt?: string; zemin?: 'otomatik' | 'zeminsiz' | 'beyaz' };
  /** Bul düğmesi: İhtiyacınız çubuğuna kaydırır. null → düğme çizilmez. */
  onBul?: ((e: React.MouseEvent) => void) | null;
  /** Varsayılan seri adına göre: Quiet/Sessiz → "Sessiz modelinizi bulun ↓". */
  bulEtiketi?: string;
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Sessiz seri (veriden): eylem "Sessiz modelinizi bulun ↓". Parça addan çıkarmaz (dil bağımlı kural, iş emri #4). */
  sessiz?: boolean;
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr, 'EN' → en. Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function SeriesHeader(props: SeriesHeaderProps): JSX.Element;
