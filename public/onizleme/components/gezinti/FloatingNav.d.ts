/**
 * FloatingNav — mobil yüzen düğme: petrol, 48 px, alt çubuğun üstünde. Sol: bulunulan yer (simge + ad) → MobileTree; sağ: "Filtrele" (+ sayı).
 * Seri/ürün sayfasında "‹ seri adı n/m ›". Ürünler sayfasında konmaz.
 */
export interface FloatingNavSeriGecis {
  /** 1 tabanlı. */
  sira: number;
  toplam: number;
  oncekiAd?: string;
  sonrakiAd?: string;
  onOnceki?: () => void;
  onSonraki?: () => void;
}
export interface FloatingNavProps {
  /** Bulunulan yerin adı. */
  yer: string;
  /** Simge: bulunulan sayfanın seviyesi. */
  seviye?: 'urun-grubu' | 'urun-turu' | 'urun-ailesi' | 'seri' | 'model';
  onYer?: () => void;
  /** Verilmezse sağ parça yok. */
  onFiltrele?: () => void;
  filtreSayisi?: number;
  seriGecis?: FloatingNavSeriGecis;
  /** Kapak çipleri görünürken true. */
  gizli?: boolean;
  /** true: ekrana sabit (alttan 76 px). false: akışta (kart önizlemesi). */
  sabit?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  style?: React.CSSProperties;
}
export declare function FloatingNav(props: FloatingNavProps): JSX.Element;
