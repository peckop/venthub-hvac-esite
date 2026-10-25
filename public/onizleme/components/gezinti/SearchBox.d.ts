/**
 * SearchBox — katalog araması; sonuçlar seviyeye göre gruplu (ürün grubu · ürün türü · ürün ailesi · seri · model), en az 2 harfte açılır.
 * Masaüstü: 44 px oval kutu + altında açılan liste. Mobil: ⌕ düğmesi → tam ekran arama. Eşleştirme çağıranda (VHKatalog.ara, #16); bileşen sırayı, boş hâlleri ve klavyeyi (↑↓ Enter Tab Esc) yönetir.
 */
export interface SearchBoxSonuc {
  ad: string;
  /** "VRT-17170 · Lineo Quiet" ya da "Fanlar · 43 model". */
  alt?: string;
  /** Sağda: "Ürün türü", "Seri" ya da satış kipinde fiyat. */
  sag?: string;
  foto?: string | null;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  /** Vurgulu satır (surface-subtle + 1 px petrol): sorguda rakam varsa ilk model (#16 B-3). */
  vurgu?: boolean;
}
export interface SearchBoxGrup {
  seviye: 'urun-grubu' | 'urun-turu' | 'urun-ailesi' | 'seri' | 'model';
  /** "Ürün grupları", "Ürün türleri", "Ürün aileleri", "Seriler", "Ürünler". */
  ad: string;
  sonuclar: SearchBoxSonuc[];
  /** Gösterilecek en çok satır (model 6, diğerleri 4). */
  sinir?: number;
}
export interface SearchBoxProps {
  deger?: string;
  onDeger?: (q: string) => void;
  /** Sıra verildiği gibi çizilir. */
  gruplar?: SearchBoxGrup[];
  /** #16 B-1: sorgu bir ürün türüyle tam/baştan eşleşirse en üstte tek vurgulu satır (Enter açar) + altında o türün serileri (en çok 4). */
  dogrudan?: SearchBoxSonuc & { seriler?: SearchBoxSonuc[] };
  /** #16 C-1: yazı yokken "Son baktıklarınız" (en çok 3; boşsa liste açılmaz). */
  sonBakilan?: SearchBoxSonuc[];
  /** #16 F-1: sonuçsuz hâlde en üstte "Bunu mu demek istediniz: {ad}?" (çağıran ds.arama-bunu-mu ile yazar); basınca öneriyi uygular. */
  bunuMu?: { metin: string; onClick?: (e: React.MouseEvent) => void };
  /** #16 F-2: sonuçların üstünde tek satır not (gevşetme: ds.arama-gevsek). */
  uyari?: string;
  /** #16 C-2: eşleşme yokken grup çipleri + teklif. Başlık ds.arama-yok-baslik ({q}), ds.arama-yok-yazim, ds.arama-yok-gruplar, ds.arama-yok-teklif. */
  bos?: { gruplar?: Array<{ ad: string; onClick?: (e: React.MouseEvent) => void }>; onTeklif?: (e: React.MouseEvent) => void };
  /** Eksik Sayfalar (2): sonuçların altında "tüm sonuçlar" satırı (arama sayfası; ds.arama-tum-sonuclar). Klavyede son satır; sonuçsuz hâlde çizilmez. */
  tumSonuc?: { metin: string; href?: string; onClick?: (e: React.MouseEvent) => void };
  /** "Kanal Tipi Fanlar içinde" / "Bütün katalogda". */
  kapsam?: { secili: string; secenekler: Array<{ deger: string; ad: string }>; onSec?: (d: string) => void };
  mobil?: boolean;
  acik?: boolean;
  onAcik?: (a: boolean) => void;
  yerTutucu?: string;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr (İ), 'EN' → en (I). Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function SearchBox(props: SearchBoxProps): JSX.Element;
