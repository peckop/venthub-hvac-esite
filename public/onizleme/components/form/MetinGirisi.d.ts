/**
 * MetinGirisi — metin giriş kutusu: etiket üstte, 44 px kutu (çok satırda en az 3 satır), köşe 12, odakta 2 px petrol halka, açıklama altta.
 * "Teklif bilgileri" (proje adı, not) ve teklif formu. Kaynak: iş emri #5 madde 5 (DESIGN-MENU paket-B/Kombin Model v2 "Teklif bilgileri" kutusu yerine).
 */
export interface MetinGirisiProps {
  /** Etiket (çağıran verir; sözlükten). */
  etiket?: string;
  deger?: string;
  onDeger?: (deger: string) => void;
  /** Yer tutucu (--text-muted). */
  yerTutucu?: string;
  /** Çok satır (textarea, en az 3 satır, dikey büyür). */
  cokSatir?: boolean;
  /** Etiket yanında "· Zorunlu" (t.zorunlu) + aria-required. */
  zorunlu?: boolean;
  /** Etiket yanındaki ek yazı ("· " + ek); verilirse t.zorunlu yerine yazılır. Zorunlu olmayan alanda "isteğe bağlı" için de kullanılır. */
  ek?: string;
  /** Kutunun altındaki açıklama (aria-describedby). */
  aciklama?: string;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (sozluk-s5). Eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  id?: string;
  style?: React.CSSProperties;
}
export declare function MetinGirisi(props: MetinGirisiProps): JSX.Element;
