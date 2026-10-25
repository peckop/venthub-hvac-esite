/**
 * VariantPicker — ürün sayfasında model seçimi: eksen başına bir satır çip (Çap (mm), Motor tipi).
 * Etiket her satırda üstte (13/600), çipler altında. Seçili çip dolu petrol + ✓. İkiden az seçenekli eksen çizilmez. Seçimin ürüne yansıması çağıranın işi.
 * Kaynak: Foto Dili Akış 5b · Ürün Sayfası Alternatifler 5a, 6a-2, 9a.
 */
export interface VariantPickerSecenek {
  deger: string;
  /** Çipteki yazı: "100" · "Ø125" · "ES (EC motor)". */
  ad: string;
  /** 'satir' listesinde ve düğmede yazı ("Ø250 mm"). Yoksa ad. */
  liste?: string;
  /** 'satir' listesinde sağdaki değer ("1 485 m³/h"). */
  ek?: string;
  /** Bu bileşim yok: inset zemin + muted, tıklanmaz ('satir'da çizilmez). */
  pasif?: boolean;
}
export interface VariantPickerEksen {
  id: string;
  /** "Çap (mm)" · "Motor". */
  ad: string;
  secenekler: VariantPickerSecenek[];
  /** Kontrolsüz başlangıç. */
  secili?: string;
}
export interface VariantPickerProps {
  eksenler: VariantPickerEksen[];
  /** Kontrollü seçim: { cap: '100', motor: 'EC' }. */
  secim?: Record<string, string>;
  onSecim?: (secim: Record<string, string>, degisenEksen: string) => void;
  /** @deprecated Etiket her satırda üstte (not 10-25); yok sayılır. */
  etiketGenisligi?: string;
  /** Satırlar arası (CSS). Varsayılan 14, mobil 16. */
  satirAra?: string;
  /** 'cip' (varsayılan): eksen başına çip satırı, etiket üstte. 'satir' (Karar 7 · 1b): tek satır — etiket solda, ilk eksen açılır liste, ikinci eksen AC | EC anahtarı; pasif seçenek çizilmez. Mobilde yok sayılır. */
  yerlesim?: 'cip' | 'satir';
  /** 'satir' etiketi ("Çap · Motor"). Verilmezse eksen adları ' · ' ile. */
  etiket?: string;
  /** Alt panelde: satırlar arası 16. */
  mobil?: boolean;
  style?: React.CSSProperties;
}
export declare function VariantPicker(props: VariantPickerProps): JSX.Element | null;
