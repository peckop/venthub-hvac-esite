/**
 * DutyPointGate — "İhtiyacınız" çubuğu: debi + statik basınç (mekân iptal, iş emri #4). Modeller listesinin üstünde durur; ayrı sonuç listesi yok,
 * girdi yalnız altındaki listeyi sıralar ve ModelRow'a sonuç yazar (hesap çağıranın; Performance ile aynı kesişim).
 * Kaynak: S5 `id="k-secim"` · ds-paketi 6c-2 · kararlar 39–40. Depo: NeedsAnalysisWizard yerine (yeni ad).
 */
export interface DutyPointGateDeger {
  debi: number | null;
  basinc: number | null;
}
export interface DutyPointGateProps {
  /** Kontrollü değer. Verilmezse bileşen kendi tutar. */
  deger?: DutyPointGateDeger;
  onDegisim?: (v: DutyPointGateDeger) => void;
  /** 390: girişler yan yana tam genişlik. */
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr (İ), 'EN' → en (I). Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function DutyPointGate(props: DutyPointGateProps): JSX.Element;
