/**
 * Hüküm kutusu — hesap ve uygunluk geri bildirimi. Ayrım 4 px sol kural (S5 Performance ile aynı) + büyük harf etiket (lang="tr").
 * yeter → petrol · sinirda → `--warn-amber` · yetmez → `--action-terracotta-deep` (kural + etiket, dolu zemin asla) · bilgi → petrol.
 * Hüküm metni suçlamaz, gerekçe verir. Verisi olmayanda kutu çizilmez.
 */
export interface HukumKutusuProps {
  hal?: 'yeter' | 'sinirda' | 'yetmez' | 'bilgi';
  /** Etiket metni. Varsayılan hâlin adı (YETER, SINIRDA, YETMEZ, BİLGİ). null verilirse etiket çizilmez. */
  etiket?: string | null;
  children: React.ReactNode;
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr (İ), 'EN' → en (I). Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function HukumKutusu(props: HukumKutusuProps): JSX.Element;
