/**
 * CatalogMode — ürün ailesi sayfasının katalog kipi, PDF görünümüyle (iş emri #4 madde 5). Çerçeve bizim dilde (petrol zemin, üst çubuk, atlama çipleri);
 * sayfa katalog gibi: yazısız zemin görseli + konumlu gerçek metin katmanı + tıklanır model adları. 595×842 korunur, metin cqw ile ölçeklenir.
 * "Bu sayfadaki modeller" çipleri (36/44) asıl yol, sayfadaki adlar ek yol. Mobil: tek satır üst çubuk (≤ 64 px), atlama + modeller "Bölümler" panelinde.
 * Katman yazısı Archivo 400–700; yalnız bu kip açılınca yüklenir.
 */
/** [x%, y% (taban çizgisi), boy cqw, yazı, kalın 0|1, renk, açı°, model anahtarı ('' = düz yazı)] */
export type CatalogKatmanOgesi = [number, number, number, string, number, string, number, string];
export interface CatalogSayfa {
  /** Katalog sayfa numarası. */
  no: number;
  /** Yazısız katalog sayfası görseli (katalog/<aile>/z<no>.jpg). */
  zemin?: string;
  alt?: string;
  /** Konumlu metin katmanı (dile göre ayrı). Dizi değilse yazı çizilmez; katman yokken kipin girişi (çip) çizilmez (K7). */
  katman?: CatalogKatmanOgesi[] | null;
}
export interface CatalogModeProps {
  baslik: string;
  /** Katmanı olan sayfalar; ‹ › bunlar arasında gezer. */
  sayfalar: CatalogSayfa[];
  /** Katalogdaki toplam sayfa (N). */
  toplam?: number;
  sayfa?: number;
  onSayfa?: (no: number) => void;
  /** "Tablo" s.28, "Eğri" s.30. */
  atlamalar?: Array<{ ad: string; no: number }>;
  onSiteyeDon?: () => void;
  /** Model adına ya da "Bu sayfadaki modeller" çipine basınca (katmandaki model anahtarı): o modelin sayfası / seçimi. Verilmezse adlar ve liste tıklanmaz. */
  onModel?: (anahtar: string) => void;
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  style?: React.CSSProperties;
}
export declare function CatalogMode(props: CatalogModeProps): JSX.Element | null;
