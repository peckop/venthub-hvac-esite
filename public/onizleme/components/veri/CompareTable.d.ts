/**
 * CompareTable — sitedeki her karşılaştırma tablosunun tek kalıbı (seri farkı, model karşılaştırma, ses, teknik kıyas).
 * Başlık üstten/sola hizalı (marka + kısa ad), hücrede yalnız sayı, birim satır adının altında, değere göre renk yok, gezinince satır + sütun izlenir.
 * `baslik` verilince açılır satır içinde (SSS düğmesiyle aynı 36 px düğme). Kaynak: DESIGN-MENU CLAUDE.md tablo standardı · S5 "Seriler arasındaki fark".
 */
export interface CompareTableKolon {
  /** Küçük, büyük harf: "VORTICE". */
  marka?: string;
  /** Kısa ad: "Lineo Quiet". */
  kisa: string;
  /** Tam ad (üzerine gelince). */
  tam?: string;
  /** Başlığa basınca ilgili sayfa. */
  onAc?: (e: React.MouseEvent) => void;
}
export interface CompareTableSatir {
  /** "Debi" — anlamı söyler. */
  ad: string;
  /** "m³/h" — satır adının altında. */
  birim?: string;
  /** Kolon sırasıyla yalnız sayı: "260–2.890". */
  degerler: Array<string | number | null | undefined>;
  /** İsteğe bağlı satır grubu adı (E-2, Recep 10-25): ardışık aynı gruptaki satırların üstüne bir kez, tam genişlik, sola hizalı ara başlık (13/600 büyük harf, altta tek ince çizgi, değere göre renk yok). */
  grup?: string;
}
export interface CompareTableProps {
  kolonlar: CompareTableKolon[];
  satirlar: CompareTableSatir[];
  /** Tablonun altındaki not ("Aralıklar: …"). */
  not?: string;
  /** Verilirse tablo açılır satırın içinde durur. */
  baslik?: string;
  altBaslik?: string;
  acik?: boolean;
  onAcik?: (acik: boolean) => void;
  mobil?: boolean;
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr (İ), 'EN' → en (I). Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  /** Kart içinde tek dil (Tablo Kabı Yan Yana 2a/2b): hücre zemini yok, sütunlar kartın sağ kenarına kadar (minmax(72px,1fr), dolgu sütunu yok), ad sütunu 240 (mobil 130), satır ≥ 52, not içeride 13 px. Kartı çağıran çizer (iç boşluk 0). Varsayılan false: bugünkü hücreli biçim (aile/seri "Seriler arasındaki fark"). baslik verilirse yok sayılır. */
  kartIci?: boolean;
  /** kartIci: vurgulanan sütun (0'dan). --p2-tint, başlık altı 2 px petrol. */
  secili?: number;
  /** kartIci: seçili sütun başlığının altındaki yazı ("bu model"). */
  seciliEtiket?: string;
  style?: React.CSSProperties;
}
export declare function CompareTable(props: CompareTableProps): JSX.Element | null;
