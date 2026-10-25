/**
 * CategoryFilters — kategori ağacı + tek arama + süzgeç çipleri. S5 `parca/CategoryFilters` · depo `components/category/CategoryFilters.tsx`.
 * Masaüstünde 16 px kart; `mobil` tetik düğmesi + alttan açılan panel. Sayımlar ve ağaç çağırandan gelir (veri katmanı bileşende değil).
 * Arama ≥ 2 harfte ağacın yerine sonuç listesi çizilir; `sonuclar` verilmezse ağaç adlarında aranır.
 */
export interface CategoryFiltersAgacOgesi {
  ad: string;
  /** Ürün sayısı. */
  n?: number | string;
  /** 0 ürün grubu · 1 alt kategori (26 px girinti). */
  seviye?: 0 | 1;
  /** Bulunulan sayfa: p2-tint zemin, aria-current. */
  secili?: boolean;
  /** Açık ürün grubu (kalın petrol). */
  acik?: boolean;
  onSec?: () => void;
}
export interface CategoryFiltersSecenek {
  deger: string;
  ad: string;
  /** Öteki süzgeçlerle kalan sayı. 0 ve seçili değilse çip devre dışı. */
  n?: number;
}
export interface CategoryFiltersGrup {
  id: string;
  /** "Marka" · "Çap" · "Motor". */
  baslik: string;
  /** Aralık süzgeci (Debi, Basınç): çiplerin üstünde dağılım sütunları (sütun boyu `n`'e göre, en az 3 px; basma alanı üstte 44 px şeffaf pay). */
  dagilim?: boolean;
  /** İkiden az seçenekli grup çizilmez. */
  secenekler: CategoryFiltersSecenek[];
}
export interface CategoryFiltersSonuc {
  ad: string;
  /** "Ürün grubu" · "Alt kategori" · "Seri" · "Model". */
  tur: string;
  onSec?: () => void;
}
export interface CategoryFiltersProps {
  agac?: CategoryFiltersAgacOgesi[];
  gruplar?: CategoryFiltersGrup[];
  /** Kontrollü süzgeç: { marka: ['vortice'], cap: ['100'] }. */
  secili?: Record<string, string[]>;
  onSuzgec?: (secili: Record<string, string[]>) => void;
  /** Kontrollü arama metni. */
  arama?: string;
  onArama?: (q: string) => void;
  sonuclar?: CategoryFiltersSonuc[];
  /** Mobil panelin "N modeli göster" düğmesi. */
  gorunurSayi?: number;
  onTemizle?: () => void;
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  style?: React.CSSProperties;
}
export declare function CategoryFilters(props: CategoryFiltersProps): JSX.Element;
