/**
 * ModelListesi — model listesi 4c: masaüstü filtre solda (240 px) + liste; mobil seri çip şeridi + liste + alttan "Filtrele" paneli.
 * 24 model/sayfa (iş emri #5), numaralı (mobil "‹ Sayfa 2 / 4 ›"); filtre değişince 1. sayfa. Kaynak: kart-dili-kararlar 10-24 · Kart Dili Akış v2 3a.
 * FiltreGruplari — işaret kutulu filtre grupları (sol kart ve mobil panel içi; sayılar diğer seçimlere göre canlı).
 */
import type { ModelRowUrun } from './ModelRow';
export interface ModelListesiUrun extends ModelRowUrun {
  /** Filtre değerleri: { seri: 'lineo-quiet', motor: 'EC', cap: 125 }. */
  suz?: Record<string, string | number>;
}
export interface FiltreGrubu {
  id: string;
  /** "Seri", "Marka", "Motor", "Çap". */
  baslik: string;
  secenekler: Array<{ deger: string | number; ad: string; n?: number }>;
}
export interface ModelListesiProps {
  /** Mobilde süzgeç şeridinin yapıştığı üst boşluk = mobil header boyu (px). Varsayılan 61 (Kombin madde 12). */
  mobilUst?: number;
  /** Ürün grubu sayfasında "Tüm modeller", ürün türü ve seride "Modeller". */
  baslik?: string;
  modeller: ModelListesiUrun[];
  gruplar?: FiltreGrubu[];
  /** Değer sütunu başlıkları (masaüstü): ["Debi", "Basınç", "Ses"]. */
  sutunlar?: string[];
  /** Mobilde yapışkan çip şeridine giden grup id'si (genelde "seri"). */
  serit?: string;
  secili?: Record<string, Array<string | number>>;
  onSecili?: (s: Record<string, Array<string | number>>) => void;
  sayfa?: number;
  onSayfa?: (s: number) => void;
  /** Varsayılan 12. */
  sayfaBoyutu?: number;
  kip?: 'teklif' | 'satis';
  onEkle?: (sku: string, eylem: 'teklif' | 'sepet') => void;
  onKarsilastir?: (sku: string) => void;
  onAc?: (sku: string) => void;
  seriGoster?: boolean;
  mobil?: boolean;
  /** Mobilde listenin üstüne "Filtrele" düğmesi (FloatingNav yoksa). */
  filtreDugmesi?: boolean;
  /** Mobil "Filtrele" paneli (FloatingNav'dan açılır). */
  panelAcik?: boolean;
  onPanel?: (acik: boolean) => void;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Sayı biçimi (Intl yerel kodu). Varsayılan 'tr-TR'. */
  yerel?: string;
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr (İ), 'EN' → en (I). Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function ModelListesi(props: ModelListesiProps): JSX.Element;
export interface FiltreGruplariProps {
  gruplar: FiltreGrubu[];
  secili?: Record<string, Array<string | number>>;
  onDegis?: (s: Record<string, Array<string | number>>) => void;
  /** Sayıları canlı hesaplamak için. */
  modeller?: ModelListesiUrun[];
  mobil?: boolean;
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr (İ), 'EN' → en (I). Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function FiltreGruplari(props: FiltreGruplariProps): JSX.Element;
