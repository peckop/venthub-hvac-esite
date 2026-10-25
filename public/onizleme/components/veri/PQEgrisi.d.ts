/**
 * P-Q eğrisi — fanın debi (Q) / statik basınç (P) karakteristiği (kılavuz G · K35).
 * Ana eğri 2 px petrol · ikincil seri 1.5 px kesikli petrol · ızgara `--border-row` · eksen `--border-control`.
 * Çalışma noktası kiremit #D95D0E (5 px daire + iniş çizgisi + etiket) — grafikteki tek kiremit.
 * Ölçü tam 520×260 · kisa 330×200. İki noktadan az veride bileşen çizilmez (K7).
 */
export interface PQNoktasi {
  q: number;
  p: number;
}
export interface PQEgrisiProps {
  noktalar: PQNoktasi[];
  /** İkincil seri (ör. hat direnci) — kesikli petrol. Kısa boyda düşer. */
  ikincilNoktalar?: PQNoktasi[];
  calismaNoktasi?: PQNoktasi;
  boyut?: 'tam' | 'kisa';
  qBirim?: string;
  pBirim?: string;
  style?: React.CSSProperties;
}
export declare function PQEgrisi(props: PQEgrisiProps): JSX.Element | null;
