/**
 * ProductCover — ürün sayfası kapağı (5b): PageCover + logo + öne çıkan değer yuvası + VariantPicker + fiyat + ana eylem + ⇄, hepsi sol sütunda.
 * Seviye etiketi "MODEL · MARKA" başlığın üstünde. Karar 7 (1b): sütun 5 : 7, h1 40, seçim tek satır (çap listesi + AC | EC), Karşılaştır ikincil satırda. İlk ekran: sığmazsa yalnız iç boşluk 28 → 20.
 * Sağda PhotoStage 400 (mobil 300) + küçük resimler. Teklif kipinde fiyat yok. Mobilde seçim ve fiyat `MobileBuyBar`'a geçer.
 * Kaynak: Foto Dili Akış 5b · Ürün Sayfası Alternatifler 9a, 6a.
 */
export interface ProductCoverEksen {
  id: string;
  ad: string;
  secenekler: Array<{ deger: string; ad: string; pasif?: boolean }>;
  secili?: string;
}
export interface ProductCoverProps {
  /** Seçim satırının etiketi ("Çap · Motor"). Verilmezse eksen adları. */
  secimEtiketi?: string;
  marka?: string;
  markaLogo?: string;
  markaHref?: string;
  /** Ürün adı (h1). */
  ad: string;
  /** "Sessiz kanal fanı · VRT-17170". Kod `kod` ile de verilirse sondaki kod ayrılır; kod + kopyala düğmesi birlikte kırılır. */
  altSatir?: React.ReactNode;
  /** @deprecated Kapak konum çizmez (iş emri #6 madde 4); konum yalnız SectionRail'de. Verilirse yok sayılır. */
  konum?: unknown;
  gorseller?: string[];
  /** Öne çıkan değer yuvası: <FeatureSlot …/> (en çok iki). */
  yuva?: React.ReactNode;
  aciklama?: string;
  /** Katalog bağlantısı: { ad: 'Lineo kataloğu · PDF ↓', href }. */
  belge?: { ad: string; href?: string };
  eksenler?: ProductCoverEksen[];
  secim?: Record<string, string>;
  onSecim?: (secim: Record<string, string>, degisenEksen: string) => void;
  kip?: 'teklif' | 'satis';
  /** KDV hariç ₺. Yalnız satış kipinde görünür. Kaynakta yoksa verilmez. */
  fiyat?: number | null;
  kdvOrani?: number;
  listede?: boolean;
  onEkle?: (e: React.MouseEvent) => void;
  karsilastirmada?: boolean;
  onKarsilastir?: (e: React.MouseEvent) => void;
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Sayı biçimi (Intl yerel kodu). Varsayılan 'tr-TR'. */
  yerel?: string;
  /** Temel değerler (3–4; kanal fanı: Debi · Statik basınç · Güç · Ses). Değeri olmayan çizilmez. Paragraf (aciklama) kutuda çizilmez. */
  degerler?: Array<{ ad: string; v: React.ReactNode; birim?: string }>;
  /** Model kodu: alt satırın yanında kopyalama düğmesi. */
  kod?: string;
  /** Adet (ana eylemin yanında, AdetKontrolu). onEkle(adet) ile eyleme geçer. */
  adet?: number;
  onAdet?: (n: number) => void;
  /** Modelin kendi teknik föyü ("Teknik föy indir"). Yoksa çizilmez. Katalog modu ürün kapağında yok (#10 madde 6). */
  teknikFoy?: { href?: string; onClick?: (e: React.MouseEvent) => void };
  /** "Seçiminiz karşılıyor mu? ↓" — Performans'a kaydırır; Performans yoksa verilmez. */
  onSecimKarsiliyor?: () => void;
  /** Yalnız satış kipi: "Toplu alım için teklif iste". */
  onTopluAlim?: () => void;
  /** Masaüstünde fotoğrafın yeri. Varsayılan 'sol' (ürün seviyesi: fotoğraf solda, seçim · fiyat · eylem sağda; seri kapağıyla aynı). Mobilde etkisi yok. */
  fotoTaraf?: 'sol' | 'sag';
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr, 'EN' → en. Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function ProductCover(props: ProductCoverProps): JSX.Element;
