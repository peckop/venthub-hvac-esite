/**
 * FamilyHeader — ürün türü sayfasında 2+ serili ürün ailesinin başlığı: simge · ÜRÜN AİLESİ · ad · "n seri · n model".
 * Seri kartı ızgarasında tam satır. `seriSayisi` < 2 ise çizilmez. Sıra: önce tek seriler, sonra aileler.
 */
export interface FamilyHeaderProps {
  ad: string;
  seriSayisi: number;
  modelSayisi?: number;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  style?: React.CSSProperties;
}
export declare function FamilyHeader(props: FamilyHeaderProps): JSX.Element | null;
