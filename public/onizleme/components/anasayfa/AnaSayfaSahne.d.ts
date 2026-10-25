/**
 * AnaSayfaSahne — ana sayfa üst sahnesi: ürün grupları yarım çemberde döner; öndeki grubun adı, sırası, üç ürün türü; "Teklif iste" (tek dolu kiremit) + "İncele →".
 * Masaüstü 500 px sürüklenir, noktalarla seçilir; mobil kaydırılır. Masaüstünde kendi kendine döner (6 sn), üstüne gelince durur; mobilde kendiliğinden dönmez; "hareketi azalt"ta dönmez.
 * Kaynak: DESIGN-MENU Ana Sayfa Sahne S5.dc.html · iş emri #6 madde 1. Renkler tokens/sahne.css (--sahne-ton-1…13) ve metin token'ları.
 */
export interface AnaSayfaSahneUrun {
  id: string;
  /** Grup adı (veriden). */
  ad: string;
  /** Sahnedeki görsel (zeminsiz PNG). */
  foto: string;
  /** İlk üç ürün türü adı (veriden). */
  alt?: string[];
  /** Başlıktaki vurgulu sözcük; verilmezse sözlükten ds.sahne-kelime-<id>. */
  kelime?: string;
  /** Uçuş geçişinin hedefi: header'da bu yazıyı taşıyan bağlantı (yoksa ekran üstü). */
  kisaAd?: string;
  /** Sahnedeki ölçek çarpanı (kaynak: fanlar .88, kontrol .8, şartlandırma 1.08, igk 1.12, perde 1.4). */
  olcek?: number;
  /** Görselin zeminden yüksekliği, px (perde 78). */
  hava?: number;
  /** Gölgenin sol/sağ sınırı, % ([15, 85]). */
  golge?: [number, number];
  /** Öndeki gruba ya da "İncele →"ye basınca (geçişten sonra). */
  onAc?: (id: string) => void;
}
export interface AnaSayfaSahneProps {
  urunler: AnaSayfaSahneUrun[];
  /** teklif: "Teklif iste" · satis: "Sepetim"; başlık cümlesi de kipe göre. */
  kip?: 'teklif' | 'satis';
  onTeklif?: () => void;
  mobil?: boolean;
  /** Arayüz sözcükleri (sozluk-s5): ds.sahne-on-*, ds.sahne-son-*, ds.sahne-kelime-*, tx.teklifIsteKisa, t.sepetim, tx.incele. */
  metin?: Record<string, string | null>;
  style?: React.CSSProperties;
}
export declare function AnaSayfaSahne(props: AnaSayfaSahneProps): JSX.Element | null;
