/**
 * PageCover — kategori, alt kategori, seri ve ürün sayfasının ortak kapağı. Sol: konum, başlık (Schibsted 800), 28 px petrol çizgi + açıklama,
 * en çok 4 çip + "Tümü ↓" ya da tek eylem. Sağ: PhotoStage. Mobilde fotoğraf üstte. Kaynak: foto-ve-kart-kurali §2 · Foto Dili Akış 2·3·4.
 */
export interface PageCoverBag {
  ad: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}
export interface PageCoverProps {
  /** Kapak etiketi (simge + yazı): ÜRÜN GRUBU · ÜRÜN TÜRÜ · ÜRÜN AİLESİ · SERİ · MODEL. 'urunler' etiket yazmaz, simge h1'in başında. */
  seviye?: 'urunler' | 'urun-grubu' | 'urun-turu' | 'urun-ailesi' | 'seri' | 'model' | 'uygulama-alani';
  /** Seri ve model etiketinde: "SERİ · VORTICE". */
  marka?: string;
  /** Çiplerin üstündeki küçük başlık ("Özel ihtiyaç", "Seri seçin · 3 seri"). */
  cipBaslik?: string;
  /** @deprecated Kapak konum çizmez (iş emri #6 madde 4); konum yalnız SectionRail'de. Verilirse yok sayılır. */
  konum?: unknown;
  baslik?: React.ReactNode;
  /** h1'in içini ezmek için (SeriesHeader logo + gizli marka metni). */
  baslikIcerik?: React.ReactNode;
  /** Çizgili açıklama satırı. Ürün türü kapağında "n seri · n ürün ailesi · n model" (tümu = "Seriler ↓"). */
  altSatir?: React.ReactNode;
  /** Değer satırı (Çap · Debi · Basınç · Motor): tek satır, auto-fit minmax(90px,132px), sola toplu, ara 24. Ürün türü ve seri kapağı. */
  ozet?: Array<{ ad: string; v: React.ReactNode }>;
  /** Sade kapak: gezinti/fotoğraf yok; yalnız seviye etiketi · başlık · alt satır · çipler (Kombin madde 8). */
  sade?: boolean;
  /** Gösterilen en çok çip (varsayılan 4; uygulama alanı kapağında bölüm sayısı). */
  enCokCip?: number;
  /** En çok 4 gösterilir. */
  cipler?: PageCoverBag[];
  /** "Tümü ↓" çipi. */
  tumu?: PageCoverBag;
  /** Çip yoksa sayfanın tek eylemi. */
  eylem?: React.ReactNode;
  foto?: { src?: string | null; alt?: string; zemin?: 'otomatik' | 'zeminsiz' | 'beyaz'; ust?: React.ReactNode };
  /** kapak 300 (kategori, alt kategori) · seri 360 · urun/buyuk 400. */
  fotoBoy?: 'kapak' | 'seri' | 'urun' | 'buyuk';
  /** Masaüstünde fotoğrafın yeri: kategori ve ürün sağ, seri ve seri şablonlu alt kategori sol (foto-ve-kart-kurali §2). */
  fotoTaraf?: 'sag' | 'sol';
  /** Fotoğraf noktaları: kategori kapağında alt kategoriler, alt kategori kapağında seriler. Verilirse `foto` yerine seçilenin fotoğrafı; altta seçilenin adı →. Kendiliğinden dönmez. */
  gezinti?: { ad: string; foto?: string | null; href?: string; onClick?: (e: React.MouseEvent) => void }[];
  /** Fotoğrafın altındaki öğe (küçük resimler). */
  fotoEk?: React.ReactNode;
  /** Mobilde fotoğraf üstte: sayfa kapağında 220 px, fotoBoy 'buyuk'/'urun' (ürün kapağı) 300 px. */
  mobil?: boolean;
  /** Açıklama satırı ile çipler arasındaki içerik (değer kartı, fiyat). */
  children?: React.ReactNode;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr (İ), 'EN' → en (I). Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  /** Masaüstü h1 boyu (CSS). Varsayılan '44px'. ProductCover dizüstünde ilk ekran için clamp verir (#10 madde 7). Mobil 32 değişmez. */
  baslikBoy?: string;
  /** Masaüstü iki sütun (CSS grid-template-columns, kaynak sırasıyla: fotoTaraf 'sol'da önce fotoğraf). Varsayılan eşit. ProductCover 5 : 7 verir (Karar 7). */
  sutunlar?: string;
  style?: React.CSSProperties;
}
export declare function PageCover(props: PageCoverProps): JSX.Element;
