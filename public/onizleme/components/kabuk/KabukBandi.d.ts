/**
 * KabukBandi — site kabuğu (S5). Varsayılan header TEK BANT: logo · arama · İletişim (simge) · Teklif/Sepet (simge + yazı, sayaçlı) · Hesap (simge) · Menü (simge).
 * Bilgi Merkezi ve "Ürünler" header'da yok. `ikiKat` (varsayılan değil): ≥1180 px'te Bilgi Merkezi + yazılı İletişim / Giriş yap + ürün grubu şeridi.
 * header beyaz, ≥74 px (mobil 56); sayaç çerçeveli petrol, artısız simge (dolu değil, K5). footer `--primary-navy` (#0B4F6C), logo `-tamrenk-koyu`.
 * Kaynak: Site S5.dc.html · ds-cevap-2026-10-23 madde 1 (düzeltilmiş) · Ürün Sayfası Alternatifler 6a, 9a.
 */
export interface KabukBandiKategori {
  ad: string;
  /** Kategori ikonu (assets/icons/venthub-kat-*-24-*.svg). */
  ikon?: string;
  etkin?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}
export interface KabukBandiProps {
  rol?: 'header' | 'footer';
  /** header: venthub-kilit-yatay-tamrenk.svg · footer: venthub-kilit-yatay-tamrenk-koyu.svg. */
  logoSrc?: string;
  logoHref?: string;
  /** header: sağ kümeye ek öğe (mobilde ⌕) · footer: sütunlar ve alt satır. */
  children?: React.ReactNode;
  /** Varsayılan arama kutusu (true), kendi öğeniz ya da false. Mobilde çizilmez. */
  arama?: boolean | React.ReactNode;
  aramaDeger?: string;
  onArama?: (q: string) => void;
  /** Teklif/Sepet sayacı. Verilmezse çizilmez. */
  sayac?: number | null;
  /** Varsayılan kipe göre "Teklif" / "Sepet". */
  sayacEtiketi?: string;
  kip?: 'teklif' | 'satis';
  onSayacClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** İletişim paneli (K37-c). */
  onIletisim?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onHesap?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Tam ekran menü. */
  onMenu?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Hesap simgesinin adı: false "Giriş yap", true "Hesabım". */
  girisYapildi?: boolean;
  /** Menü düğmesinin yerine kendi öğeniz (verilmezse yerleşik menü simgesi). */
  sonEk?: React.ReactNode;
  /** "İki kat" header seçeneği (varsayılan değil). */
  ikiKat?: boolean;
  onBilgiMerkezi?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Ürün grubu şeridi — yalnız ikiKat'ta çizilir. */
  kategoriler?: KabukBandiKategori[];
  yapiskan?: boolean;
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  style?: React.CSSProperties;
}
export declare function KabukBandi(props: KabukBandiProps): JSX.Element;
