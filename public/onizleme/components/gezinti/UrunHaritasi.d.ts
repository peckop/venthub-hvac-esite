/**
 * UrunHaritasi — Ürünler sayfasının ürün haritası: her ürün grubu bir kutu (grup satırı: 64×56 foto · ad → · n model; altında ürün türü satırları, 44 px).
 * Masaüstü auto-fill minmax(320px,1fr), mobil tek sütun. yerlesim='anasayfa' (iş emri #12 C): ana sayfa "Ürünler" bölümü — h2 + grup başlık satırı (simge · ad · n model →) + ürün türü küçük kartları (fotoğraf · ad · n model); masaüstünde grup başına satır (200px | türler 3 sütun, satır üstü hairline); mobilde alt alta, 2 sütun, fotoğraf üstte 72. Her satır gerçek <a href>. Kaynak: DESIGN-MENU paket-B/Kombin Urunler Harita · iş emri #6 madde 3.
 */
export interface UrunHaritasiTur { id?: string; ad: string; model: number; /** 'anasayfa' kartındaki fotoğraf. */ foto?: string | null; href?: string; onClick?: (e: React.MouseEvent) => void; }
export interface UrunHaritasiGrup { id?: string; ad: string; model: number; foto?: string | null; /** 'anasayfa' başlık satırındaki kategori simgesi (24). */ ikon?: string; href?: string; onClick?: (e: React.MouseEvent) => void; turler: UrunHaritasiTur[]; }
export interface UrunHaritasiProps {
  /** Modeli olmayan tür (ve grup) çizilmez. Tek serili türün href'ini çağıran doğrudan seri sayfasına verir. */
  gruplar: UrunHaritasiGrup[];
  mobil?: boolean;
  /** Arayüz sözcükleri (sozluk-s5): ds.n-model. */
  metin?: Record<string, string | null>;
  /** Sayı biçimi. Varsayılan 'tr-TR'. */
  yerel?: string;
  /** 'harita' (varsayılan, Ürünler sayfası) · 'anasayfa' (ana sayfa Ürünler bölümü). */
  yerlesim?: 'harita' | 'anasayfa';
  /** 'anasayfa' h2 (sözlükten, "Ürünler"). */
  baslik?: string;
  style?: React.CSSProperties;
}
export declare function UrunHaritasi(props: UrunHaritasiProps): JSX.Element | null;
