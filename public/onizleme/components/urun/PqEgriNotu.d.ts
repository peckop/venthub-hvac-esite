/**
 * **S5 ile doğrulanmadı** (ds-cevap-2026-10-22 madde 2): parça 10-21 gecesi çizilmiş, Recep kararıyla (0d) geçersiz sayılan dosyadan kuruldu; DS Kontrol'de S5 ile yan yana ölçülür, fark varsa S5'e göre düzelir.
 * PqEgriNotu — P-Q eğrisinin kaynağını bildiren tek satır not. S5 `parca/PqEgriNotu` · depo `components/products/PqEgriNotu.tsx`.
 * ≤3 nokta ya da `kaynakTur="turetilmis"` → yaklaşık eğri notu; aksi hâlde katalog grafiği notu; `egri` yoksa çizilmez.
 */
export interface PqEgriKaynagi {
  /** Kademelerdeki en az nokta sayısı. */
  noktaSay?: number;
  kaynakTur?: 'kitapcik_grafik' | 'turetilmis' | string;
}
export interface PqEgriNotuProps {
  egri?: PqEgriKaynagi | null;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  style?: React.CSSProperties;
}
export declare function PqEgriNotu(props: PqEgriNotuProps): JSX.Element | null;
