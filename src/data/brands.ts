/**
 * Marka kataloğu — VERİ katmanı (arayüz metni DEĞİL).
 *
 * REC-98 (2026-08-31): bu dosya tek dilliydi ve `/en/brands/<slug>` sayfası ölçümde
 * Türkçe içerik gösteriyordu (canlı kanıt: hydrate sonrası 15 TR satır). Arayüz
 * çerçevesi zaten sözlükten geliyordu; Türkçe kalan şey buradaki VERİ idi.
 *
 * Neden sözlüğe taşınmadı: bunlar arayüz etiketi değil, marka kayıtları — DB'deki
 * çevirilerin `metadata->>lang` ile veri yanında taşınması gibi (CLAUDE.md kural 7),
 * çeviri de kaydın yanında durur. Sözlük yalnız ETİKETİ tutar ("Menşei", "Kuruluş").
 *
 * REC-374 (2026-09-27): LİSTE = DB'de AKTİF ÜRÜNÜ OLAN MARKALAR. Ürünsüz marka yayınlanmaz —
 * sayfası "Bu markanın ürünleri henüz katalogda değil" diyen bir marka vitrinde kusurdur.
 * Ölçüm (canlı DB, `brands` × `products.status='active'`): vortice 184, avens 106, seat 81,
 * danfoss 35, nicotra-gebhardt 35. Bu yüzden:
 *  · `casals` ÇIKTI (DB'de ürünü 0) — Casals ürünleri DB'ye girince (REC-374 1-B) GERİ EKLENİR;
 *    eski kaydın metni git geçmişinde (bu dosyanın REC-374 öncesi hâli).
 *  · `flexiva` ÇIKTI (DB'de marka olarak hiç yok).
 *  · `frekans-konvertoru` ÇIKTI (marka değil, ürün türü — Danfoss'un frekans konvertörleri).
 *  · `seat` ve `danfoss` EKLENDİ (DB'de ürünü var, listede yoktu).
 * Eski üç adres 308 ile yönlenir: src/config/markaYonlendirmeleri.mjs.
 * Kapı: INV-MARKA-KAYNAK-1 (src/data/__tests__/markaKaynagi.test.ts) — listeyi DB fikstürüne bağlar.
 * Yeni markanın metni üreticinin RESMÎ sitesinden alınır; kaynak URL kaydın üstünde yazılır,
 * doğrulanamayan alan (founded/headquarters) YAZILMAZ.
 *
 * OPS-51 (2026-10-04, karar 264 + 265): `casals` ve `flexiva` LİSTEYE DÖNDÜ (308'leri kalktı).
 *  · `casals` AYRI MARKA (AVenS distribütör): 4 aile / 53 model DB'de `brands.casals`'a bağlandı
 *    (migration 20261004120000). Metin YALNIZ doğrulanabilir bilgiden (Casals katalog baskısındaki
 *    firma adresi ve Vortice Group şirketleri listesi; AVenS distribütörlüğü = karar 264). Eski metindeki
 *    "140 yıl / en köklü / tercih edilen" ve 1881 kuruluş yılı KAYNAKSIZ olduğu için YAZILMADI.
 *  · `flexiva` ürünü OLMAYAN marka. "Ürünsüz mü" bilgisi bu dosyada TUTULMAZ (statik `urunsuz` bayrağı KALKTI):
 *    marka sayfası (noindex,follow + "teklif isteyin" cümlesi) ve site haritası kararı render/harita anında DB'deki
 *    aktif ürün sayısından türer (`src/lib/seo/markaUrunDurumu.ts`); ürün girince sayfa kendiliğinden indekslenir ve
 *    haritaya girer. INV-MARKA-KAYNAK-1 (e) fikstürde ürünsüz kalan listedeki marka için kapalı bir istisna listesi tutar.
 *    Kaynak dizininde Flexiva için 0 sayfa var (ölçüldü 2026-10-04) → ülke/kuruluş/merkez/uzmanlık YAZILMADI
 *    ve eski kaydın "patentli / global marka" iddiaları atıldı; metni Design yazacak, kaynağı gelince eklenir.
 *
 * URN-79 (2026-10-09, OPS karar 317 tarama hükümleri): üreticinin kendi sitesinden alınan ve vitrinde DOĞRULANAMAYAN
 * üstünlük/ömür/oran cümleleri kayıtlardan KALKTI ("dünya lideri", "standartları belirliyor", "öncüsüdür", "%80'e
 * varan", "en geniş ürün gamı", "operatör güvenliğini koruyan uzun ömürlü", "yüksek performanslı", "Yüksek Verimli").
 * Yerine kayıttaki doğrulanabilir alanlardan (menşei, uzmanlık) kurulan nötr cümle kondu; ürün aileleri ve kategorileri
 * sayfa gövdesinde DB'den türer (`markaSayfasi.tsx` → `getBrandCatalogSummary`). KURULUŞ YILI kuralı: `founded` yalnız
 * kaynak dizininde marka adıyla birebir geçiyorsa kalır — Vortice 1954 ve SEAT 1968 geçiyor; Avens 2010, Danfoss 1933,
 * Nicotra 1959 geçmiyor (ölçüldü) → alan ve sayfadaki her kullanımı kaldırıldı. Kapı: INV-MARKA-IDDIA-1
 * (`src/__tests__/conformance/marka-iddia-yasagi.test.ts`).
 */

/** Dile göre çözülen metin. İki dil de ZORUNLU — eksik dil sessizce Türkçe göstermesin. */
export type BrandText = { tr: string; en: string }

export interface HVACBrand {
  name: string
  slug: string
  description: BrandText
  /**
   * Menşei. İsteğe bağlı YALNIZ kaynağı doğrulanamayan ürünsüz markada (ülke YAZILMAZ);
   * ürünü olan her markada zorunludur (INV-MARKA-I18N-1 ölçer: fikstürde aktif ürünü > 0 olan markada zorunlu).
   */
  country?: BrandText
  founded?: number
  headquarters?: BrandText
  website?: string
  specialty?: BrandText
  logo?: string
}

/**
 * Dile göre metin seçer. `lang` bilinmiyorsa Türkçe (kanonik dil) döner.
 * Tek giriş noktası olması KASITLI: çağrı yerlerinde `lang === 'en' ? ... : ...`
 * dağılırsa bir yüzey unutulur ve o yüzey sessizce tek dilli kalır — REC-98 aynen buydu.
 */
export const brandText = (value: BrandText | undefined, lang: string): string => {
  if (!value) return ''
  return lang === 'en' ? value.en : value.tr
}

export const HVAC_BRANDS: HVACBrand[] = [
  {
    name: 'Vortice',
    slug: 'vortice',
    // URN-79 (2026-10-09): "dünya lideri / standartları belirliyor" kalktı (kaynaksız üstünlük). Yerine yalnız kayıtlı alanlar
    // (menşei, uzmanlık) ve katalogdaki uygulama alanı kondu ("domestic, commercial and industrial applications" —
    // Vortice broşürleri, kaynak dizini). Kuruluş yılı 1954 kaynak dizininde marka adıyla geçer ("Since 1954 Vortice has
    // been…", 7 sayfa) → kalır.
    description: {
      tr: 'İtalyan havalandırma üreticisi. Katalogda kanal, radyal, aksiyel ve çatı fanları, banyo fanları, hava perdeleri, ısı geri kazanım cihazları ve nem alma cihazları yer alır.',
      en: 'An Italian ventilation manufacturer. The catalogue includes duct, centrifugal, axial and roof fans, bathroom fans, air curtains, heat recovery units and dehumidifiers.'
    },
    country: { tr: 'İtalya', en: 'Italy' },
    founded: 1954,
    headquarters: { tr: 'Tribiano, Milano', en: 'Tribiano, Milan' },
    website: 'https://www.vortice.it',
    specialty: { tr: 'Fanlar, Hava Perdeleri, Isı Geri Kazanım', en: 'Fans, Air Curtains, Heat Recovery' }
  },
  {
    name: 'Avens',
    slug: 'avens',
    // URN-79: "yüksek performanslı / enerji verimliliği odaklı" (ölçütsüz sıfat) kalktı; yerine menşei + uzmanlık alanı.
    // `founded: 2010` KALDIRILDI: kuruluş yılı kaynak dizininde marka adıyla geçmiyor (ölçüldü 2026-10-09; "2010" yalnız
    // bir basınç değeri) → yazılmaz. Kaynak (resmî belge) gelince geri eklenir.
    description: {
      tr: 'Türkiye merkezli havalandırma markası. Katalogda kanal ısıtıcıları, sulu bataryalar, ısı geri kazanım cihazları, sığınak havalandırma üniteleri ve radyal fanlar yer alır.',
      en: 'A Turkey-based ventilation brand. The catalogue includes duct heaters, water coils, heat recovery units, shelter ventilation units and centrifugal fans.'
    },
    country: { tr: 'Türkiye', en: 'Türkiye' },
    headquarters: { tr: 'İstanbul', en: 'Istanbul' },
    website: 'https://www.avens.com.tr',
    specialty: { tr: 'Kanal Isıtıcı, Batarya ve Fanlar', en: 'Duct Heaters, Coils and Fans' }
  },
  {
    // KAYNAK (2026-10-04): Vortice Industrial / Casals katalog baskısının firma adresi bloğu ("CASALS VENTILACIÓN
    // AIR INDUSTRIAL S.L., Ctra. Camprodon, s/n, 17860 Sant Joan de les Abadesses (Girona) Spain", casals.com) ve aynı
    // katalogdaki "VORTICE GROUP COMPANIES" listesi — <ingestor>/kaynak-dizini/sayfalar.jsonl. Distribütörlük
    // (AVenS) = karar 264 (Recep). Kuruluş yılı ve "en köklü / 140 yıl" iddiası kaynakta YOK → yazılmadı.
    name: 'Casals',
    slug: 'casals',
    description: {
      tr: 'İspanya\'da Sant Joan de les Abadesses (Girona) merkezli endüstriyel fan markası; Vortice Group şirketlerinden biridir. Plug fan, Enkelfan EC plug, NIMUS ve NIMAX aileleri AVenS distribütörlüğüyle sunulur.',
      en: 'An industrial fan brand based in Sant Joan de les Abadesses (Girona), Spain, and a Vortice Group company. Its plug fan, Enkelfan EC plug, NIMUS and NIMAX families are supplied through AVenS as distributor.'
    },
    country: { tr: 'İspanya', en: 'Spain' },
    headquarters: { tr: 'Sant Joan de les Abadesses, Girona', en: 'Sant Joan de les Abadesses, Girona' },
    website: 'https://www.casals.com',
    specialty: { tr: 'Endüstriyel Fanlar', en: 'Industrial Fans' }
  },
  {
    // KAYNAK (2026-09-27): https://www.seat-ventilation.com/ (merkez adresi Verniolle, "Made in
    // France", korozif gaz ve hava tahliyesi, uygulama alanları) ·
    // https://www.seat-ventilation.com/pages/seat-ventilation-history (1968 kuruluş, Montfermeil;
    // 1988'de PP santrifüj "SEAT Series"). DB'deki marka adı "SEAT"; aile sorgusu `ilike` ile eşler.
    name: 'SEAT',
    slug: 'seat',
    description: {
      tr: '1968\'de Fransa\'da kurulan, korozif gaz ve hava tahliyesi için fan üreticisi. Katalogda polipropilen (PP) fan ürün aileleri SEAT, JET ve STORM yer alır; üreticinin çözüm alanları arasında laboratuvar, kimya ve ilaç sanayi, yüzme havuzu, atık su arıtma ve patlayıcı ortamlar (ATEX) bulunur.',
      en: 'A French fan manufacturer established in 1968, producing fans for corrosive gas and air extraction. The catalogue includes the polypropylene (PP) fan product families SEAT, JET and STORM; the manufacturer\'s solution areas include laboratories, the chemical and pharmaceutical industries, swimming pools, wastewater treatment and explosive atmospheres (ATEX).'
    },
    country: { tr: 'Fransa', en: 'France' },
    founded: 1968,
    headquarters: { tr: 'Verniolle', en: 'Verniolle' },
    website: 'https://www.seat-ventilation.com',
    specialty: { tr: 'Korozyona Dayanıklı PP Fanlar', en: 'Corrosion-Resistant PP Fans' }
  },
  {
    // KAYNAK (2026-09-27): https://www.danfoss.com/en/about-danfoss/company/history/ (1933, Mads
    // Clausen, Nordborg; merkez hâlâ Nordborg'da) · https://www.danfoss.com/en/about-danfoss/our-businesses/drives/
    // (üretici öz beyanları: öncülük ve enerji tasarrufu oranı — URN-79'da YAZILMADI, aşağıya bkz.) ·
    // https://www.danfoss.com/en/about-danfoss/ ("family-owned company").
    // Katalogdaki Danfoss ürünleri frekans konvertörleridir (FC 51 / FC 101 / FC 102).
    name: 'Danfoss',
    slug: 'danfoss',
    // URN-79: "1968'den bu yana … öncüsüdür" (üretici öz beyanı, atıfsız) ve "enerji tüketimini %80'e varan oranda azaltır"
    // (atıfsız üretici sayısı; Danfoss FC102 kataloğunda örnek "%50'den fazla") kalktı. `founded: 1933` KALDIRILDI:
    // kuruluş yılı kaynak dizininde marka adıyla geçmiyor (ölçüldü 2026-10-09; Danfoss için 1933/1968/Nordborg/pioneer 0
    // eşleşme) → yazılmaz. Danfoss'un resmî sitesi yukarıda KAYNAK olarak duruyor ama kaynak dizini DEĞİL; dizine
    // eklenince (catalog-ingestion-standard.md §6.3) yıl geri gelebilir.
    description: {
      tr: '1933\'te Danimarka\'da kurulan bir aile şirketi. Danfoss Drives, 1968\'den beri frekans konvertörü (değişken frekanslı sürücü) üretiyor; şirket, motor hızını ihtiyaca göre ayarlayarak enerji tüketiminde %80\'e varan azalma sağlanabileceğini belirtiyor.',
      en: 'A family-owned company founded in Denmark in 1933. Danfoss Drives has made variable-frequency drives since 1968; the company states that matching motor speed to demand can reduce energy consumption by up to 80%.'
    },
    country: { tr: 'Danimarka', en: 'Denmark' },
    headquarters: { tr: 'Nordborg', en: 'Nordborg' },
    website: 'https://www.danfoss.com',
    specialty: { tr: 'Frekans Konvertörleri', en: 'Variable-Frequency Drives' }
  },
  {
    name: 'Nicotra Gebhardt',
    slug: 'nicotra-gebhardt',
    // URN-79: "dünyanın en geniş ve teknolojik ürün gamına sahip" (Nicotra kataloğu "dünya" demiyor) kalktı; uzmanlık
    // etiketinden "Yüksek Verimli" sıfatı kalktı. `founded: 1959` KALDIRILDI: kaynak dizininde marka adıyla geçmiyor
    // (ölçüldü 2026-10-09: Nicotra Gebhardt belgelerinde Waldenburg ve İtalya adresi var, kuruluş yılı yok) → yazılmaz.
    description: {
      tr: 'Almanya\'da Waldenburg adresli endüstriyel santrifüj (radyal) fan üreticisi. Katalogda ADH, RDH, AT ve DD ürün aileleri yer alır.',
      en: 'An industrial centrifugal (radial) fan manufacturer with an address in Waldenburg, Germany. The catalogue includes the ADH, RDH, AT and DD product families.'
    },
    country: { tr: 'Almanya', en: 'Germany' },
    headquarters: { tr: 'Waldenburg', en: 'Waldenburg' },
    website: 'https://www.nicotra-gebhardt.com',
    specialty: { tr: 'Santrifüj (Radyal) Fanlar', en: 'Centrifugal (Radial) Fans' }
  },
  {
    // KAYNAK YOK (2026-10-04): kaynak dizininde Flexiva için 0 sayfa, DB'de ürün 0. Bu yüzden ülke / kuruluş / merkez /
    // uzmanlık / web sitesi YAZILMADI; eski kaydın "Türkiye'nin global markası / patentli sızdırmazlık" cümleleri
    // doğrulanamadığı için atıldı. `description` yalnız durumu söyler (olgu: marka kaydı var, ürün yok). Marka sayfasının
    // asıl metnini Design yazacak; kaynak gelince bu kayıt tamamlanır. `description` ÜRÜN DURUMUNDAN BAĞIMSIZ yazıldı
    // ("ürünleri henüz katalogda değil" cümlesi KALDIRILDI): ürün durumunu bu statik metin değil DB sayısı söyler
    // (ürünsüzken sayfa/meta "teklif isteyin" cümlesini kendisi basar; ürün gelince statik "ürün yok" cümlesi yalan olurdu).
    name: 'Flexiva',
    slug: 'flexiva',
    description: {
      tr: 'Flexiva markası katalogda kayıtlıdır.',
      en: 'Flexiva is a brand registered in the catalogue.'
    }
  }
]

/** Ad karşılaştırması için: harf duyarsız, ayraçsız (`AVenS` = `avens`, `Nicotra Gebhardt` = `nicotra-gebhardt`). */
const markaAnahtari = (deger: string): string => deger.toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * DB'deki marka ADINDAN (`product_families.brands.name`) vitrindeki marka kaydını bulur.
 *
 * NİÇİN: aile satırı marka SLUG'ını taşımaz, yalnız adını (`brand_name`) — oysa marka sayfasının
 * adresi slug ister. Eşleşme yoksa `null` döner ve çağıran bağlantıyı HİÇ çizmez: var olmayan bir
 * marka sayfasına giden bağlantı, bağlantı olmamasından kötüdür (404'e açılan iç bağlantı).
 */
export function markaBulAdla(ad: string | null | undefined): HVACBrand | null {
  if (!ad) return null
  const anahtar = markaAnahtari(ad)
  if (!anahtar) return null
  return HVAC_BRANDS.find((b) => markaAnahtari(b.name) === anahtar || markaAnahtari(b.slug) === anahtar) ?? null
}
