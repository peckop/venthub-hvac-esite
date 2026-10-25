/**
 * 23 Ekim: karşılaştırma tablosu standardı için `CompareTable` kullanın (DESIGN-MENU CLAUDE.md). Bu bileşen geriye dönük durur.
 * Karşılaştırma tablosu — satır = alan, kolon = model. 16 px kart kabı, yatay kaydırmada alan kolonu sabit.
 * K7: en az bir modelde değer varsa satır çizilir, boş hücre boş kalır; hiçbirinde yoksa satır düşer.
 */
export interface KarsilastirmaSatiri {
  alan: string;
  /** Model sırasıyla değerler. */
  degerler: Array<string | number | null | undefined>;
}
export interface KarsilastirmaTablosuProps {
  /** Kolon başlıkları (model adları, veriden gelen yazımla). */
  modeller: string[];
  satirlar: KarsilastirmaSatiri[];
  /** Alan kolonu genişliği, varsayılan "200px". */
  alanKolonu?: string;
  /** 1 tabanlı; o model kolonu da kaydırmada sabitlenir. 0 = kapalı. */
  sabitKolon?: number;
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr (İ), 'EN' → en (I). Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function KarsilastirmaTablosu(props: KarsilastirmaTablosuProps): JSX.Element | null;
