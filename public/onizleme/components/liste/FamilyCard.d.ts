/**
 * @deprecated Kullanım dışı (iş emri #4 · kart-dili-kararlar 10-24): yerini SeriesCard + FamilyHeader aldı. Metin kuralına dönüştürülmedi; yeni sayfada kullanmayın.
 * **S5 ile doğrulanmadı** (ds-cevap-2026-10-22 madde 2): parça 10-21 gecesi çizilmiş, Recep kararıyla (0d) geçersiz sayılan dosyadan kuruldu; DS Kontrol'de S5 ile yan yana ölçülür, fark varsa S5'e göre düzelir.
 * FamilyCard — seri kartı / seri satırı. S5 `parca/FamilyCard` (DESIGN-MENU) · depo `components/products/FamilyCard.tsx`.
 * Model sayısı rozeti, marka · kod, ad, değer aralığı hapları (Ø, debi), "Seriyi incele" + 44 px ok düğmesi.
 */
export interface FamilyCardDeger {
  /** Etiket: "Ø" · "Debi". */
  e: string;
  /** Biçimlenmiş aralık: "100–150 mm" · "175–510 m³/h". */
  v: string;
}
export interface FamilyCardAile {
  slug: string;
  ad: string;
  marka: string;
  kod?: string;
  /** variant_count */
  modelSayisi: number;
  /** cover_image_path. Yoksa 2 px petrol kural. */
  kapak?: string | null;
  degerler?: FamilyCardDeger[];
}
export interface FamilyCardProps {
  aile: FamilyCardAile;
  yerlesim?: 'kart' | 'liste';
  /** Liste satırında görsel kolonu 76 px (masaüstü 96). */
  mobil?: boolean;
  onAc?: (slug: string) => void;
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function FamilyCard(props: FamilyCardProps): JSX.Element | null;
