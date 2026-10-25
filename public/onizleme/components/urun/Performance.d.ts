/**
 * **S5 ile doğrulanmadı** (ds-cevap-2026-10-22 madde 2): parça 10-21 gecesi çizilmiş, Recep kararıyla (0d) geçersiz sayılan dosyadan kuruldu; DS Kontrol'de S5 ile yan yana ölçülür, fark varsa S5'e göre düzelir.
 * Performance — ürün sayfası performans bölümü. S5 `parca/Performance` (DESIGN-MENU, yeni ad).
 * Debi + statik basınç girişi → kademe başına çalışma noktası (sistem eğrisi p = P·(q/Q)² kesişimi) ve hüküm:
 * r = q₀ / Q (q₀: kesişim debisi) · r ≥ 1 YETER (r > 1,3 gereğinden büyük) · 0,9 ≤ r < 1 SINIRDA · r < 0,9 YETMEZ.
 * Grafik: seçili kademe 2.5 px petrol, öteki kademeler `--border-control`, kesikli hat direnci, kiremit çalışma noktası, fareyle okuma.
 * Kademe yoksa (iki noktadan az) bileşen çizilmez (K7). Hesaplanan değerler "hesaplanan" etiketlidir.
 */
export interface PerformanceKademe {
  /** "1. hız" · "En yüksek hız". */
  ad: string;
  /** [debi m³/h, basınç Pa] noktaları. */
  pq: Array<[number, number]>;
  /** [debi m³/h, güç W] noktaları (varsa emilen güç ve SFP hesaplanır). */
  pw?: Array<[number, number]>;
}
export interface PerformanceIhtiyac {
  debi: number | null;
  basinc: number | null;
}
export interface PerformanceOneri {
  /** Model adı. */
  ad: string;
  /** Yeten kademenin adı. */
  kademe: string;
  onSec?: () => void;
}
export interface PerformanceProps {
  kademeler: PerformanceKademe[];
  /** Kontrollü ihtiyaç. Verilmezse bileşen kendi tutar. */
  ihtiyac?: PerformanceIhtiyac;
  onIhtiyac?: (v: PerformanceIhtiyac) => void;
  /** Kontrollü seçili kademe indeksi; null → önerilen ya da en yüksek. */
  kademe?: number | null;
  onKademe?: (i: number | null) => void;
  /** PqEgriNotu kaynağı. Verilmezse kademelerin nokta sayısıyla katalog grafiği notu. null → not çizilmez. */
  egri?: { noktaSay?: number; kaynakTur?: string } | null;
  /** Hiçbir kademe yetmezse seride yeten büyük model. */
  seriBuyugu?: (debi: number, basinc: number) => PerformanceOneri | null;
  /** Gereğinden büyükse seride yeten küçük model. */
  seriKucugu?: (debi: number, basinc: number) => PerformanceOneri | null;
  /** Seride yeten yoksa yönlendirilecek alt kategoriler. */
  yuksekBasinc?: Array<{ ad: string; onSec?: () => void }>;
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Sayı biçimi (Intl yerel kodu). Varsayılan 'tr-TR'. */
  yerel?: string;
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr (İ), 'EN' → en (I). Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function Performance(props: PerformanceProps): JSX.Element | null;
