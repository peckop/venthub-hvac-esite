/**
 * MARKA İDDİA LİSTESİ — INV-MARKA-IDDIA-1'in ölçüt kaynağı (URN-79, OPS karar 317, 2026-10-09).
 *
 * Üç kapı AYNI listeyi okur (liste çoğalırsa biri eskir): `conformance/marka-iddia-yasagi.test.ts` (veri + sözlük),
 * `views/__tests__/BrandDetailPage.iddia.test.tsx` (çizilen sayfa), `app/__tests__/markaSayfasiIddia.test.ts` (JSON-LD).
 * Canlı karşılığı: `scripts/seo/canli-kapi.mjs` VITRIN_YASAK_IFADELER (URN-79 satırları) — orada kesme işareti
 * içeren ifadeler kullanılamaz (React `&#x27;` yazar); burada düzenli ifade olduğu için `.` ile geçilir.
 */

/** Marka metninden KALDIRILMIŞ ifade: `ifade` (TR+EN kalıbı), `neden` (hangi taramada neden kalktı). */
export interface YasakIfade {
  ifade: RegExp
  neden: string
}

export const MARKA_YASAK_IFADELER: readonly YasakIfade[] = [
  { ifade: /dünya lider|world leader/i, neden: 'liderlik iddiası, kaynak dizininde karşılığı yok (Vortice brands.ts:73, Nicotra BrandDetailPage:70)' },
  { ifade: /standartları belirliyor|set the standard/i, neden: 'üstünlük iddiası (Vortice brands.ts:73)' },
  { ifade: /dünyanın en geniş|world.s broadest/i, neden: 'Nicotra kataloğu "dünya" demiyor (brands.ts:150)' },
  { ifade: /öncüsüdür|pioneered/i, neden: 'Danfoss öz beyanı, sayfada atıf yok; kaynak dizininde "pioneer" 0 eşleşme (brands.ts:137)' },
  { ifade: /%\s?80|up to 80\s?%/i, neden: 'atıfsız üretici sayısı; Danfoss FC102 kataloğu "%50\'den fazla" diyor (brands.ts:137)' },
  { ifade: /önde gelen yerli|leading domestic/i, neden: 'Avens, kaynak dizininde karşılığı yok (BrandDetailPage:51)' },
  { ifade: /dünya çapında tanınan|globally recognised/i, neden: 'Vortice, kaynaksız (BrandDetailPage:40)' },
  { ifade: /lider konumda|it leads/i, neden: 'Vortice liderlik iddiası (BrandDetailPage:40)' },
  { ifade: /yüksek performanslı|high-performance/i, neden: 'ölçütsüz sıfat, Avens (brands.ts:86)' },
  { ifade: /yüksek verimli|high-efficiency/i, neden: 'ölçütsüz sıfat, Nicotra uzmanlık etiketi (brands.ts:157)' },
  { ifade: /modern mühendislik yaklaşım|modern engineering practice/i, neden: 'soyut, Avens (brands.ts:86)' },
  { ifade: /operatör ve personel güvenliğini|keeping operators/i, neden: 'güvenlik vaadi, SEAT (brands.ts:119)' },
  { ifade: /uzun ömürlü|long-lasting/i, neden: 'ömür vaadi, SEAT (brands.ts:119)' },
  // DİKKAT: genel "en zorlu" kalıbı KULLANILAMAZ — sözlükteki `brands.detail.technicalExcellenceDesc` ("en zorlu endüstriyel
  // koşullara dayanacak şekilde test edilmiş", tr.ts:1087) her marka sayfasında görünür; o satır başka bir işin kapsamında
  // (abartı taraması BLOG bölümü, tr.ts:1085/1087) ve bu kapı onu yakalamaz. Burada yalnız Nicotra hikâyesinin cümlesi.
  { ifade: /en zorlu havalandırma|most demanding ventilation/i, neden: 'kıyas, Nicotra hikâyesi (BrandDetailPage:70)' },
  // Başta `\b` YOK: çizilen sayfanın textContent'i bitişik düğümleri boşluksuz birleştirir ("Garanti2 Yıl") — bkz. `yillariBul`.
  { ifade: /2 Yıl|2 Years/, neden: 'Avens garantisi: fiyat listesinde 2 yıl yok, garanti-servis sayfasıyla çelişiyordu (BrandDetailPage:57)' },
]

/**
 * KURULUŞ YILI KURALI: marka sayfasında bir kuruluş yılı YALNIZ kaynak dizininde (`venthub-pdf-ingestor/kaynak-dizini/
 * sayfalar.jsonl`) marka adıyla birebir geçiyorsa yazılır. Ölçüm 2026-10-09 (her marka × kayıtlı yıl):
 *  · Vortice 1954 — GEÇİYOR: 7 broşür sayfası, "Since 1954 Vortice has been synonymous with quality and excellence".
 *  · SEAT 1968   — GEÇİYOR: SEAT-CATALOGUE.pdf s.4, "1968 : Creation of SEAT by Mr. Bernard Chapel".
 *  · Avens 2010  — GEÇMİYOR ("2010" yalnız bir basınç değeri: avensair-ADH-400-E2.pdf, "Maximum Delivery Pressure Pa 2010").
 *  · Danfoss 1933 / 1968 — GEÇMİYOR (Danfoss belgelerinde 1933, 1968, Nordborg, pioneer: 0 eşleşme).
 *  · Nicotra Gebhardt 1959 — GEÇMİYOR (belgelerde Waldenburg ve İtalya adresi var, kuruluş yılı yok).
 * Dizine yeni kanıt girince (`catalog-ingestion-standard.md` §6.3) yıl BURAYA kaynağıyla eklenir; sessizce `brands.ts`'e eklenemez.
 */
export const KAYNAKLI_KURULUS: Readonly<Record<string, { yil: number; kaynak: string }>> = {
  vortice: { yil: 1954, kaynak: 'Vortice broşürleri: "Since 1954 Vortice has been synonymous with quality and excellence"' },
  seat: { yil: 1968, kaynak: 'SEAT-CATALOGUE.pdf s.4: "1968 : Creation of SEAT by Mr. Bernard Chapel"' },
}

/**
 * WEB ADRESİYLE ATIFLI OLGU İSTİSNASI (URN-82, Blog yanıtı 2026-10-09): kaynak dizini yalnız katalog PDF'lerini kapsar; üreticinin
 * kendi resmî web sayfasında birebir geçen olgu, SAYFA ADRESİ burada yazılıysa marka metninde yer alabilir. İstisna iki şeyle
 * sınırlıdır ve genişletmek için kaynak adresi yazmak ZORUNLUDUR (sessizce eklenemez):
 *  · `yillar`: metinde geçmesine izin verilen yıllar (kuruluş yılı alanı `founded` değildir; o hâlâ KAYNAKLI_KURULUS'a bağlı).
 *  · `atifliOran`: yasak listesindeki bir ORAN ifadesi (`yasakIfadeler` içindeki deseni) yalnız metinde şirkete atfedildiğinde
 *    ("belirtiyor", "states") serbesttir; atıfsız olgu cümlesi hâlâ KIRMIZI.
 * Danfoss: BLOG ham metni (BLOG departmanının marka ham metin klasörü, 10-09); BLG-7 `docs/standards/marka-olgu-kaydi.json`
 * dosyasını getirince bu tablo o dosyadan okunacak.
 */
export const WEB_ATIFLI_OLGU: Readonly<Record<string, { yillar: readonly number[]; atifliOran: readonly RegExp[]; kaynaklar: readonly string[] }>> = {
  danfoss: {
    yillar: [1933, 1968],
    atifliOran: [/%\s?80|up to 80\s?%/i],
    kaynaklar: [
      'https://www.danfoss.com/en/about-danfoss/company/history/ — "began on September 1, 1933, when Mads Clausen founded Danfoss"; "Mass production of frequency converters began in 1968"',
      'https://www.danfoss.com/en/about-danfoss/our-businesses/drives/ — "reducing energy consumption by up to 80%" (üreticinin beyanı)',
    ],
  },
}

/** Şirkete atfeden fiil/kalıp: atıflı oran cümlesinin parçası (TR "belirtiyor", EN "states"). */
const ATIF_KALIBI = /belirtiyor|states|according to|says/i

/** Bir marka metnindeki yasak ifadeler; web adresiyle atıflı olgu istisnası uygulanmış hâli. Sözlük şablonlarında slug olmaz (istisna yok). */
export function yasakIfadeIhlalleri(slug: string | undefined, metin: string): YasakIfade[] {
  const istisna = slug ? WEB_ATIFLI_OLGU[slug] : undefined
  return MARKA_YASAK_IFADELER.filter(({ ifade }) => {
    const eslesme = new RegExp(ifade.source, ifade.flags.replace('g', '')).exec(metin)
    if (!eslesme) return false
    // Atıf eşleşmenin HEMEN çevresinde aranır (±200 karakter): sayfanın başka yerinde geçen "states" istisnayı açmaz.
    const cevre = metin.slice(Math.max(0, eslesme.index - 200), eslesme.index + eslesme[0].length + 200)
    const atifliSerbest = istisna?.atifliOran.some((o) => o.source === ifade.source && o.flags === ifade.flags) && ATIF_KALIBI.test(cevre)
    return !atifliSerbest
  })
}

/** Marka metninde geçmesine izin verilen yıllar: kaynak dizininde kanıtlı kuruluş yılı + web adresiyle atıflı yıllar. */
export function izinliYillar(slug: string): number[] {
  const kurulus = KAYNAKLI_KURULUS[slug]?.yil
  return [...(kurulus === undefined ? [] : [kurulus]), ...(WEB_ATIFLI_OLGU[slug]?.yillar ?? [])]
}

/**
 * Metindeki yıl benzeri sayılar (tam 4 haneli rakam dizisi, 1800-2099). Model kodları/sayfa sayıları için tek başına geçen
 * sayılar da yakalanır; marka metninde bunlar yoktur.
 *
 * ⚠`\b` KULLANILMAZ: çizilen sayfanın `textContent`'i bitişik düğümleri boşluksuz birleştirir ("Kuruluş 2010Endüstriyel…") ve
 * `2010E` içinde sözcük sınırı yoktur — `\b`li kalıp bu yüzden sabotajda (Avens `founded: 2010` geri konunca) SESSİZCE geçti.
 * Rakam dizisi ölçütü bitişik harfe bakmaz.
 */
export function yillariBul(metin: string): number[] {
  return (metin.match(/\d+/g) ?? [])
    .filter((s) => s.length === 4)
    .map(Number)
    .filter((y) => y >= 1800 && y <= 2099)
}
