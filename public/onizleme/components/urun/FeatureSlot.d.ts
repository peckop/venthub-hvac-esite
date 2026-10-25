/**
 * FeatureSlot — ürün kapağında başlığın altındaki öne çıkan değer yuvası: büyük sayı + birim + tek çizgi üstünde işaret.
 * Kutusuz (zemin, çerçeve, dolgu yok); sayı Schibsted 800 56, −0.02em, tabular yok. Birim iki satır: kalın birim, altında açıklama (kırılmaz).
 * İçi alt kategoriye göre: SoundCard (dB(A), ölçek 20–60, mekân yazısı ve sınır yok) · WidthCard (hava perdesi: mm, aralık bölümü).
 * Bir üründe en çok iki yuva. Değer yoksa çizilmez. Kaynak: Foto Dili Akış 5b · Alternatifler 8a · DESIGN-MENU denetim 10-23.
 */
export interface FeatureSlotOlcek {
  min: number;
  max: number;
  /** Çizgi altı etiketler, eşit aralıklı (ör. ["20", "30", "40", "50", "60 dB(A)"]; mekân yazısı yok). */
  etiketler?: string[];
}
export type FeatureSlotIsaret =
  | { tur: 'nokta'; deger: number }
  | { tur: 'bolum'; bas: number; son: number };
export interface FeatureSlotProps {
  /** Görsel varyant (blok 5: motor tipini görselden tanıyın). Verilince değer yerine görsel + numaralı işaret + açıklama. */
  gorseller?: FeatureSlotGorsel[];
  /** Görsel varyantta başlık. */
  baslik?: string;
  /** Üretici atfı: "Kaynak: Vortice LINEO kataloğu, Mayıs 2026, s.5". */
  atif?: string;
  /** Görsel varyantta görseller alt alta. */
  mobil?: boolean;
  /** Biçimlenmiş sayı, kaynaktan: "27,4" · "900". */
  deger?: string | number | null;
  /** "dB(A)" · "mm" · "m/s". */
  birim: string;
  /** Anlam: "katalog ses seviyesi, 3 m". */
  etiket?: string;
  olcek?: FeatureSlotOlcek;
  isaret?: FeatureSlotIsaret;
  /** Kartın altındaki tek cümle. */
  not?: string;
  /** Mobil (6a): sayı solda, çizgi sağda. */
  kompakt?: boolean;
  genislik?: string;
  style?: React.CSSProperties;
}
export interface FeatureSlotGorsel {
  src: string;
  alt?: string;
  /** Halkanın konumu, görselin yüzdesi. */
  isaret?: { x: number; y: number };
  /** "AC · kırmızı pervane halkası". */
  etiket: string;
  aciklama?: string;
}
export declare function FeatureSlot(props: FeatureSlotProps): JSX.Element | null;
