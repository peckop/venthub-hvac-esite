/**
 * Çip — filtre ve seçim öğesi. Oval, 44 px dokunma hedefi.
 * Seçilmemiş `--p2-tint` + petrol etiket; seçili dolu petrol + beyaz + ✓ + `--shadow-ince`.
 * Rozet değildir: rozet tıklanmaz.
 */
export interface CipProps {
  children: React.ReactNode;
  secili?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function Cip(props: CipProps): JSX.Element;
