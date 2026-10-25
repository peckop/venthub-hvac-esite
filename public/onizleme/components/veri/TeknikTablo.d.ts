/**
 * Teknik tablo — alan · değer · anlam. 16 px kart kabı, 1 px `--border-row` satır ayırıcı, zebra yok.
 * Değerler Onest 500 + tabular-nums. K7 gömülü: değeri boş satır çizilmez; hepsi boşsa null.
 */
export interface TeknikTabloSatiri {
  alan: string;
  /** Boşsa satır çizilmez. */
  deger?: string | number | null;
  /** Değerin ne anlama geldiği. Boşsa hücre boş kalır. */
  anlam?: string | null;
}
export interface TeknikTabloKolonlari {
  /** Varsayılan "190px". */
  alan?: string;
  /** Varsayılan "150px". */
  deger?: string;
  /** Varsayılan "minmax(0,1fr)". */
  anlam?: string;
}
export interface TeknikTabloProps {
  satirlar: TeknikTabloSatiri[];
  /** Başlık satırı (overline, --surface-subtle). Verilmezse çizilmez. */
  basliklar?: string[];
  kolonlar?: TeknikTabloKolonlari;
  /** İlk satır --surface-inset ile vurgulanır. */
  ilkSatirVurgulu?: boolean;
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr (İ), 'EN' → en (I). Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function TeknikTablo(props: TeknikTabloProps): JSX.Element | null;
