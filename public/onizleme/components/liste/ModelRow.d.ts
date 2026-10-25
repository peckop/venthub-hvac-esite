/**
 * ModelRow — model satırı: 60 px fotoğraf sahnesi · ad + kod (+ AC/EC) · alt kategorinin iki değeri · fiyat · ⇄ + teklif/sepet.
 * İhtiyacınız girilince sonuç etiketi (kademe · ses + Yeter/Sınırda/Yetmez). = `ProductCard yerlesim="liste"`.
 * Kaynak: Foto Dili Akış 4 · foto-ve-kart-kurali §4 · S5 6c-3 · kopya-secimi kararları 4, 5, 8, 20, 25, 40.
 */
export interface ModelRowUrun {
  sku: string;
  /** Kısa ad: marka başta yazmaz ("Lineo 150 Quiet"). Tam ad aria-label'da. */
  ad: string;
  marka?: string;
  kod?: string;
  /** "AC" · "EC" — kodun sağında. */
  motor?: string;
  seri?: string;
  /** Alt kategori ayarındaki değerler (kanal fanı: debi + ses). Boş değerin hücresi boş kalır. */
  degerler?: Array<{ v?: string | null; birim?: string }>;
  gorseller?: string[];
  fiyat?: number | null;
}
export interface ModelRowSonuc {
  /** "3. hız · 28,5 dB(A)". */
  metin?: string;
  durum?: 'yeter' | 'sinirda' | 'yetmez';
  /** Mekân seçili ve sınır altıysa sınır değeri (dB(A)). */
  sinirAlti?: number | string;
}
export interface ModelRowProps {
  urun: ModelRowUrun;
  kip?: 'teklif' | 'satis';
  listede?: boolean;
  karsilastirmada?: boolean;
  onEkle?: (sku: string, eylem: 'teklif' | 'sepet') => void;
  onKarsilastir?: (sku: string) => void;
  onAc?: (sku: string) => void;
  /** İhtiyaç girilince. Verilmezse etiket yok. */
  sonuc?: ModelRowSonuc | null;
  /** Arama sonucu ya da kategori listesi: seri adı satırda yazar (karar 15). */
  seriGoster?: boolean;
  /** Gösterilen değer sütunu (ListToolbar "Sütunlar" ile artar). Varsayılan 2. */
  degerSayisi?: number;
  mobil?: boolean;
  /** Arayüz sözcükleri: sözlük anahtarı → yazı (DESIGN-MENU veri/sozluk-s5.<dil>.json). Parça yazı tutmaz; eksik anahtar ⟦anahtar⟧ çizilir, TR'ye düşülmez. */
  metin?: Record<string, string | null>;
  /** Sayı biçimi (Intl yerel kodu). Varsayılan 'tr-TR'. */
  yerel?: string;
  style?: React.CSSProperties;
}
/** Masaüstü satır ızgarası: 72px · ad 1.5fr · n değer · fiyat 150px · eylem 96px. */
export declare const MODEL_SATIR_SUTUN: (degerSayisi: number) => string;
export declare function ModelRow(props: ModelRowProps): JSX.Element | null;
