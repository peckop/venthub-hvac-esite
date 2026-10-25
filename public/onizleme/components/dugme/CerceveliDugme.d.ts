/**
 * Çerçeveli oval düğme — ana eylem dışındaki her eylem (kılavuz G). Sayı sınırı yok.
 * `ton="petrol"` 1.5 px petrol kenar, 48 px · `ton="sade"` 1 px --border-control, 44 px.
 * Üstüne gelince dolu petrol + beyaz etiket (S5 parçalarıyla aynı).
 */
export interface CerceveliDugmeProps {
  children: React.ReactNode;
  /** petrol (varsayılan): ana eylemin yanındaki ikinci fiil · sade: ikincil araç eylemi. */
  ton?: 'petrol' | 'sade';
  /** Koyu alt bilgi bandında: --text-on-dark-muted kenar, beyaz etiket. */
  koyuZemin?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  tam?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
}
export declare function CerceveliDugme(props: CerceveliDugmeProps): JSX.Element;
