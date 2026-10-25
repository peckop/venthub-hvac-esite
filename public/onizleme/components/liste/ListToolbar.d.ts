/**
 * ListToolbar — tek araç çubuğu: arama · model sayısı · Sırala · Grupla · Liste/Kart · Sütunlar. S5 `parca/ListToolbar` (yeni ad, depoda karşılığı yok) · karar 7.
 * `kapsam="kat"` (ürün grubu) Grupla seçicisini gizler. Değerler verilmezse bileşen kendi tutar.
 */
export type ListToolbarSira = 'seri' | 'debi-artan' | 'debi-azalan' | 'basinc-azalan' | 'ses' | 'guc';
export type ListToolbarGrup = 'yok' | 'seri' | 'cap' | 'devir' | 'motor';
export interface ListToolbarProps {
  /** Görünen model sayısı. */
  sayi: number;
  kapsam?: 'kat' | 'dal' | 'aile';
  sira?: ListToolbarSira;
  onSira?: (v: ListToolbarSira) => void;
  grup?: ListToolbarGrup;
  onGrup?: (v: ListToolbarGrup) => void;
  gorunum?: 'liste' | 'kart';
  onGorunum?: (v: 'liste' | 'kart') => void;
  /** Kontrollü arama metni. arama ya da onArama verilince arama kutusu çizilir. */
  arama?: string;
  onArama?: (q: string) => void;
  /** Liste görünümünde "Sütunlar" seçimi (ModelRow değer sütunları). */
  sutunlar?: Array<{ id: string; ad: string; secili?: boolean }>;
  onSutunlar?: (v: Array<{ id: string; ad: string; secili?: boolean }>) => void;
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Sayı biçimi (Intl yerel kodu). Varsayılan 'tr-TR'. */
  yerel?: string;
  style?: React.CSSProperties;
}
export declare function ListToolbar(props: ListToolbarProps): JSX.Element;
