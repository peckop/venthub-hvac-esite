/**
 * HeaderTeklifPaneli — header "Teklif"/"Sepet" ile açılan liste paneli: masaüstünde sağdan 440 px, mobilde alttan 390 px.
 * Satırda foto, ad, kod, adet (− +), Listeden çıkar; altta "Talebi tamamla →" (dolu kiremit) + "Sayfaya dön". Esc kapatır.
 * Depo `components/navigation/HeaderTeklifPaneli.tsx` · `TeklifPaneliIcerigi.tsx`. Kaynak: S5 6c-9 · karar 21.
 */
export interface HeaderTeklifPaneliUrun {
  sku: string;
  ad: string;
  kod?: string;
  foto?: string;
  adet: number;
}
export interface HeaderTeklifPaneliProps {
  acik?: boolean;
  onKapat?: () => void;
  /** satis: "Sepetiniz", "Siparişi tamamla →". */
  kip?: 'teklif' | 'satis';
  urunler: HeaderTeklifPaneliUrun[];
  onAdet?: (sku: string, adet: number) => void;
  onSil?: (sku: string) => void;
  /** Ürüne basınca ürün sayfası (panel kapanır — çağıranın). */
  onAc?: (sku: string) => void;
  onTamamla?: () => void;
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Teklif kipinde proje adı ve not (MetinGirisi), "Talebi tamamla"nın üstünde. */
  projeAdi?: string;
  onProjeAdi?: (v: string) => void;
  not?: string;
  onNot?: (v: string) => void;
  style?: React.CSSProperties;
}
export declare function HeaderTeklifPaneli(props: HeaderTeklifPaneliProps): JSX.Element | null;
