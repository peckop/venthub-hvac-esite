/**
 * TabbedPanel — ürün sayfasının alt bölümü: tek beyaz kart (24 px), üstte sekmeler, tek bölüm görünür; öteki bölümler DOM'da kalır.
 * Mobilde aynı bölümler açılır satır olur. İçeriği olmayan bölüm çizilmez. Kaynak: Ürün Sayfası Alternatifler 5a, 6a.
 */
export interface TabbedPanelBolum {
  id: string;
  /** "Teknik özellikler" · "Performans" · "Ürün hakkında" · "Belgeler". */
  baslik: string;
  icerik?: React.ReactNode;
}
export interface TabbedPanelProps {
  bolumler: TabbedPanelBolum[];
  /** Kontrollü etkin sekme id. */
  etkin?: string;
  onEtkin?: (id: string) => void;
  mobil?: boolean;
  style?: React.CSSProperties;
}
export declare function TabbedPanel(props: TabbedPanelProps): JSX.Element | null;
