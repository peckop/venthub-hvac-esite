/**
 * SectionRail — sayfa içi bölüm şeridi. Masaüstü: konum satırı solda tam ve tek satır (kırılmaz, kesilmez); sekmeler kalan yere sağa yaslı sığar, sığmayanlar "Diğer (n) ⌄".
 * Mobil: "‹ geri · Bölüm ⌄ n/m" tek satır + açılan bölüm listesi. Depo `components/ui/ScrollObserver.tsx` (davranış).
 * Kaynak: S5 6c-6, 6c-10 · Ürün Sayfası Alternatifler 6a · kopya-secimi kararları 14, 16, 19, 38, 42.
 */
export interface SectionRailBolum {
  /** Hedef bölümün id'si. */
  id: string;
  ad: string;
  /** Mobil kısa ad ("Rehber"). */
  kisa?: string;
}
export interface SectionRailProps {
  /** Masaüstü konum satırı. Yapılı veri (önerilen): son öğe bulunulan sayfa, bağlantısız. Sığmazsa ortadaki seviyeler "…"ya katlanır: ilk + … + son iki (gerekirse son bir); "…" altında gizli seviyeler listesi (iş emri #9). ReactNode geriye uyum için kalır, katlanmaz. */
  konum?: Array<{ ad: string; href?: string; onClick?: (e: React.MouseEvent) => void }> | React.ReactNode;
  /** Mobil geri bağlantısı (üst sayfa). */
  geri?: { ad: string; href?: string; onClick?: (e: React.MouseEvent) => void };
  /** Mobil listenin başında bulunulan sayfa adı. */
  sayfaAdi?: string;
  /** Boş olabilir: o zaman şerit yalnız konum (masaüstü) ya da "‹ geri" (mobil) taşır. Kapaklar konum çizmez; konumun tek yeri bu şerit (iş emri #6 madde 4). */
  bolumler: SectionRailBolum[];
  /** Yapılı konumda görünür seviye üst sınırı (varsayılan 4). Aşınca sığsa da katlanır: ilk + … + son iki (iş emri #10 madde 4). */
  enCok?: number;
  /** Kaydırmaya göre etkin bölüm (izleme çağıranın). */
  etkin?: string;
  onSec?: (id: string) => void;
  /** Masaüstünde sığan sekme sayısını elle verir; verilmezse bileşen kalan genişliği ölçer. Kalanlar "Diğer (n)". */
  sigan?: number;
  yapiskan?: boolean;
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  style?: React.CSSProperties;
}
export declare function SectionRail(props: SectionRailProps): JSX.Element | null;
