/**
 * MobileTree — mobil katalog ağacı: ad → sayfa; sağda 44 px "⌄" yalnız o dalı açar. Ürün grubu › ürün türü › ürün ailesi (yalnız 2+ seri) › seri › model (en çok 12).
 * Bulunulan dal açık; bulunulan satır solda 3 px petrol + kalın. Her seviyenin simgesi ilk satırda. `panel`: alttan açılan "Kategori" paneli (FloatingNav'dan).
 */
export interface MobileTreeDugum {
  id: string;
  ad: string;
  seviye?: 'urunler' | 'urun-grubu' | 'urun-turu' | 'urun-ailesi' | 'seri' | 'model';
  /** Sağdaki sayı (model sayısı). */
  n?: number | string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  cocuklar?: MobileTreeDugum[];
}
export interface MobileTreeProps {
  dugumler: MobileTreeDugum[];
  /** Bulunulan düğümün id'si. */
  bulunulan?: string;
  onGit?: (d: MobileTreeDugum) => void;
  /** Alt panel olarak çiz (perde, tutamak, sekmeler). */
  panel?: boolean;
  acik?: boolean;
  onKapat?: () => void;
  /** filtre verilirse "Kategori | Filtrele" sekmeleri. */
  sekme?: 'kategori' | 'filtre';
  onSekme?: (s: 'kategori' | 'filtre') => void;
  /** Filtrele sekmesinin içi (FiltreGruplari). */
  filtre?: React.ReactNode;
  filtreSayisi?: number;
  /** Filtrele sekmesinin altı (Temizle + "n modeli göster"). */
  filtreAlt?: React.ReactNode;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  style?: React.CSSProperties;
}
export declare function MobileTree(props: MobileTreeProps): JSX.Element | null;
