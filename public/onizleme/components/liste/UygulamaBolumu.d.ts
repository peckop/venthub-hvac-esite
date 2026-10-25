import type { SeriesCardSeri } from './SeriesCard';
/**
 * UygulamaBolumu — uygulama alanı sayfasında bir ihtiyaç bölümü: başlık + ilgili ürün türleri tek satır + seri kartları (SeriesCard) ızgarası.
 * Masaüstü 4 sütun, mobil 2 sütun. Serisi olmayan bölüm çizilmez. Kaynak: DESIGN-MENU Konut Listesi Taslak 2a · iş emri #6 madde 2.
 */
export interface UygulamaBolumuProps {
  /** Kapaktaki "↓" çiplerinin hedefi. */
  id?: string;
  baslik: string;
  /** İlgili ürün türlerinin adları (veriden). */
  turler?: string[];
  /** SeriesCard verisi (+ href: ailenin kendi sayfası). */
  seriler: Array<SeriesCardSeri & { href?: string }>;
  mobil?: boolean;
  /** Arayüz sözcükleri (sozluk-s5). */
  metin?: Record<string, string | null>;
  onSeri?: (seri: SeriesCardSeri) => void;
  /** Büyük harfe dönüşen öğelerin dili (lang): 'TR' → tr (İ), 'EN' → en (I). Varsayılan 'TR'. */
  dil?: 'TR' | 'EN';
  style?: React.CSSProperties;
}
export declare function UygulamaBolumu(props: UygulamaBolumuProps): JSX.Element | null;
