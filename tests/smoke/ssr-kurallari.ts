/**
 * SSR duman kurallarının TEK KAYNAĞI (§26) — REC-138.
 *
 * İKİ TÜKETİCİ, TEK KURAL:
 *   · `tests/smoke/ssr-html.spec.ts`  → PROD ALARMI (vitest, canlı master'ı ölçer, bloklamaz)
 *   · `e2e/ssr-html.e2e.ts`           → PR KAPISI (playwright/admin-smoke, PR'ın kodunu ölçer)
 *
 * NİÇİN TEK KAYNAK: aynı kural iki dosyada iki kopya olarak yaşarsa **sessizce ayrışır** —
 * biri güncellenir, öteki bayatlar ve kimse görmez. Bugün bunun bedeli ödendi: kilit hiç
 * koşmadığı için `<h2` marker'ı ve `seat-storm-jet` slug'ı bayatladı, ikisini de ölçüm
 * buldu, kapı değil.
 *
 * ⭐SLUG'LAR SABİT YAZILMAZ — SITEMAP'TEN TÜRETİLİR. Ölçüldü (2026-09-04, canlı):
 * sitemap YAYINLANAN kümedir — pasif kategori `konut-tipi-havalandirma` 0 kez, dün 404
 * veren `seat-storm-jet` 0 kez, aktif olanlar var. Yani sabit slug yazmanın iki kusuru
 * (bayat slug → 404; pasif kategori → boş sayfada bedava yeşil) bu kaynakla kendiliğinden
 * kapanır ve "temsilci slug yenileme prosedürü" yazmaya gerek kalmaz.
 * SINIRI ADIYLA: sitemap "üretildi" der, "DOLU üretildi" DEMEZ. Doluluk sorusunu
 * marker'lar cevaplar; seçim kaynağını değiştirmek onu çözmez. İkisi ayrı eksen.
 */

/**
 * Rotanın SINIFI — dinamik seçimde sınıf korunur (temsilci değişir, sınıf değişmez).
 *
 * ⭐ADLAR 2026-09-08'DE DEĞİŞTİ, ÇÜNKÜ ESKİ ADLAR YALAN SÖYLÜYORDU (REC-286).
 * Eski `kok-kategori` / `alt-kategori`, adresin KAÇ SEGMENTLİ olduğunu anlatıyordu.
 * REC-205 iki seviyeli adresleri kaldırdıktan sonra bu ayrım adreste KALMADI: DB'de kök
 * olan 6 kategori ile onun altındaki 17 kategori aynı biçimde, tek segmentli adreste
 * yayınlanıyor. O gün "kok-kategori" adı, ölçülen şeyin adı olmaktan çıktı ve kapı
 * `aksiyel-sanayi-fanlari`yı (DB'de FANLAR'ın ALTI) "kök kategori" sanıp 09-07 19:14Z'den
 * itibaren her yayında kırmızı verdi — canlıda hiçbir arıza yokken.
 *
 * Yeni adlar sayfanın YAPISINI söyler, adresini değil: bir kategori sayfası ya alt grup
 * başlığı basar (`altgruplu-kategori`) ya aile kartı basar (`yaprak-kategori`). Ölçülen
 * şey buydu; ad artık ona uyuyor.
 */
export type Sinif =
  | 'anasayfa'
  | 'liste'
  | 'liste-en'
  | 'altgruplu-kategori'
  | 'yaprak-kategori'
  | 'pdp'
  | 'marka-listesi'
  | 'marka'

/** Bir sınıfın niçin ölçülemediği — ⛔SESSİZ ATLAMA YASAK, sebep tüketiciye TAŞINIR. */
export interface Atlanan {
  sinif: Sinif
  sebep: string
}

/** PDP'de bilinçli olarak istemciye düşen bir ada — İLAN kalemi. */
export interface BilincliAda {
  /** Adanın kısa adı (insan için; kapı bunu HTML'de ARAMAZ — bkz. aşağıdaki niçin). */
  ada: string
  /** Niçin istemcide olması MEŞRU. Boş bırakılamaz (kol zorlar). */
  nicin: string
  /** Bu adanın SSR HTML'ine kattığı `BAILOUT` markerı sayısı — ÖLÇÜLEN değer. */
  marker: number
}

/**
 * PDP'DE BİLİNÇLİ ADALAR — İLAN + MANDAL.
 *
 * ⭐NİÇİN İLAN, NİÇİN ÇIPLAK SAYI DEĞİL: tavan tek bir sayı olarak yazıldığında onu
 * büyütmek bedava olur — biri kapıyı kırmızı görür, sayıyı bir artırır, gerekçe yazmak
 * zorunda kalmaz ve kapı sessizce körleşir. Tavan bu listeden TÜRETİLDİĞİ için sayıyı
 * büyütmenin tek yolu **hangi ada** ve **niçin meşru** yazmaktır.
 *
 * ⭐NİÇİN MARKER SAYIMI ADA ADIYLA YAPILMIYOR (muafiyet niçin uygulanamaz):
 * `BAILOUT_TO_CLIENT_SIDE_RENDERING` markerının HTML'de KİMLİĞİ YOK — hangi Suspense
 * sınırından doğduğu ayırt edilemez. Bu yüzden "şu adayı muaf tut" yazılabilir bir ölçüt
 * değildir; uygulanabilir tek ölçüt SAYIdır. İlan, sayının arkasındaki muhakemeyi
 * insan tarafında tutar — makine tarafında ölçülen hâlâ sayıdır.
 *
 * ⭐`marker` NİÇİN AYRI ALAN: "her ada 1 marker" bir yasa değil, bugün ÖLÇÜLEN bir
 * eşleşme. Yarın iki marker doğuran bir ada gelirse ada sayısı ile marker sayısı ayrışır;
 * alan ayrı olduğu için o durum İLAN EDİLEBİLİR, uydurma bir "ada" eklemek gerekmez.
 *
 * ⚠SINIF: bu liste PDP sınıfına aittir. `analytics` kök layout'ta olduğu için ilkece
 * TÜM prerender edilen sınıfları etkiler; bugün ölçümde yalnız PDP'de marker doğuyor
 * (anasayfa/liste/alt-kategori tavan 0 ile geçti — 2026-09-04, koşum 33864696266).
 * Başka bir sınıf prerender'a geçerse kapı KIRMIZI verir; o kırmızıyı sayıyı büyüterek
 * kapatmayın — önce markerın hangi adadan geldiğini ölçün, sonra buraya yazın.
 */
export const PDP_BILINCLI_ADALAR: readonly BilincliAda[] = [
  {
    ada: 'galeri',
    nicin: 'Ürün görsel galerisi etkileşimli (kaydırma/yakınlaştırma) — sunucuda anlamı yok.',
    marker: 1,
  },
  {
    ada: '3d-gorunum',
    nicin: 'R3F/Drei sahnesi WebGL bağlamı ister; sunucuda render edilemez (kural 9).',
    marker: 1,
  },
  {
    ada: 'vercel-analytics',
    nicin:
      'Kök layout içindeki <Analytics/> bileşeni useSearchParams() çağırıyor; Suspense ' +
      'sınırı markerı KALDIRMIYOR ama KAPSIYOR — sayfa gövdesi sunucudan gelmeye devam ' +
      'ediyor. 2026-09-04 ölçümü: #989 (a1d7d4f4, Suspense İÇERİDEYKEN) PDP bailout 3, ' +
      'içerik markerları (h1, >Model Seçimi<) GEÇTİ. Sınır olmadan tüm ağaç düşüyordu.',
    marker: 1,
  },
]

/** İlan edilen adaların kattığı toplam marker — PDP tavanı budur. */
export const PDP_MAX_BAILOUT = PDP_BILINCLI_ADALAR.reduce((n, a) => n + a.marker, 0)

/**
 * ANASAYFADA BİLİNÇLİ ADALAR — İLAN + MANDAL (REC-59 adım 2, 2026-09-14).
 *
 * ⭐NİÇİN ŞİMDİ DOĞDU: anasayfa tavanı `0` yazıldığında anasayfa **dinamikti** — istek
 * anında üretilen bir sayfada prerender markerı hiç doğmaz, yani tavan 0 o gün hiçbir
 * şeyi kısıtlamıyordu. Anasayfa statiğe geçince (REC-59 adım 2) aynı 0, kök layout'taki
 * meşru adaları yasaklayan bir tavana dönüştü. Yani sayı değişmedi, **sayının ölçtüğü
 * evren** değişti.
 *
 * Bu dosyanın kendi uyarısı bugünü öngörmüştü: *"Başka bir sınıf prerender'a geçerse kapı
 * KIRMIZI verir; o kırmızıyı sayıyı büyüterek kapatmayın — önce markerın hangi adadan
 * geldiğini ölçün, sonra buraya yazın."* Ölçüm yapıldı, buraya yazılıyor.
 *
 * ⭐İKİ ADA DA CLAUDE.md KURAL 5'E UYGUN: ikisi de `useSearchParams()` çağırıyor ve ikisi
 * de `<Suspense>` ile sarılı. Suspense markerı **KALDIRMIYOR, KAPSIYOR** — sayfa gövdesi
 * sunucudan gelmeye devam ediyor. Bu, PDP ilanındaki `vercel-analytics` kaleminde
 * 2026-09-04'te ölçülen davranışın aynısıdır.
 *
 * ⚠ÖLÇÜMÜN KİMDE OLDUĞU AYRI YAZILIR (ikisi ayrı yüzeydir):
 *   · KAYNAK olguları (iki bileşen de `useSearchParams` çağırıyor, ikisi de Suspense
 *     içinde) bu ilanı yazan ALTYAPI tarafından koddan doğrulandı — 2026-09-14:
 *     `src/app/layout.tsx:106-108` ve `src/components/layout/ClientLayout.tsx:124-126`.
 *   · HTML'DEKİ MARKER SAYISI (2) URUN'un yerel `pnpm build` ölçümünden gelir
 *     (`.next/server/app/tr.html`, REC-59 adım 2 / #1192). ALTYAPI bu sayıyı kendi
 *     derlemesiyle TEKRAR ÖLÇMEDİ.
 *   Sayı yanlışsa kapı **kırmızı** verir, sessizce geçmez: tavan bir ÜST sınırdır ve
 *   gerçek sayım CI'da yapılır. Yani bu ilan fail-closed'dır.
 *
 * ⚠TAVANIN BUGÜN NEYİ ÖLÇTÜĞÜ: master'da anasayfa HÂLÂ dinamiktir. Dinamik sayfada
 * bailout 0 doğar, dolayısıyla bu tavanın STATİK davranışı bu PR'ın CI'ında
 * KANITLANMAZ — yalnız #1192 master'a indikten sonra kanıtlanır. Bu, "kapı yeşil ama
 * bakmadığı şeyi kanıtlamadı" sınıfıdır ve adıyla yazılmıştır.
 *
 * ⛔GEREKÇE DÜZELTMESİ (2026-09-14, bu ilan indikten SONRA ölçüldü — ölçen URUN):
 * Yukarıda ve aşağıdaki `nicin` metinlerinde markerı **bileşene** bağlayan okuma
 * EKSİKTİR. Ayırt edici bileşen DEĞİL, **ROTA SINIFI İLANIDIR:**
 * `export const dynamic = 'force-static'` altında `useSearchParams()` boş döner ve marker
 * **0** olur. 245 HTML'lik TEK bir derlemede ölçüldü: ilanı olan rotalar (`about`,
 * `category`) **0**; ilanı olmayanlar (anasayfa, `brands`) **2**; anasayfaya ilan
 * eklenince **0**.
 *
 * Yani bu iki ada marker **üretebilir**, ama üretip üretmemeleri rotanın ilanına bağlıdır.
 * Doğru okuma: *"bu iki ada, rota statik ilan edilmemişse marker doğurur."*
 *
 * **Tavan geçerli kalır** çünkü bir ÜST SINIRDIR: ilanlı rotada gerçek sayı 0, tavan 2 —
 * kapı yine yeşil ve yine üçüncü bir adayı yakalar. Değişen şey hüküm değil GEREKÇEDİR;
 * ayrıca yazıyorum çünkü *bir hükmü doğru sebeple vermek, doğru hükmü yanlış sebeple
 * vermekten farklıdır — yanlış sebep bir sonraki kararda yanlış yere götürür.*
 *
 * ⚠BUNDAN DOĞAN AÇIK KALEM: `brands/[slug]` sınıfının kapı kuralı bu dosyada YOK ve o
 * rota bugün 2 marker üretiyor — yani kimse bakmıyor. Sınıf kuralı + tavan ilanı bu
 * dosyanın işi ve REC-59'da açık kalem olarak duruyor.
 */
export const ANASAYFA_BILINCLI_ADALAR: readonly BilincliAda[] = [
  {
    ada: 'vercel-analytics',
    nicin:
      'Kök layout içindeki <Analytics/> bileşeni useSearchParams() çağırıyor ' +
      '(src/app/layout.tsx:106-108, Suspense fallback={null} ile sarılı). Suspense sınırı ' +
      'markerı KALDIRMIYOR ama KAPSIYOR — anasayfa gövdesi sunucudan gelmeye devam ediyor. ' +
      'Aynı ada PDP ilanında da var: kök layout tüm prerender edilen sınıfları etkiler.',
    marker: 1,
  },
  {
    ada: 'navigation-tracker',
    nicin:
      'ClientLayout içindeki NavigationTracker useSearchParams() çağırıyor ' +
      '(src/components/layout/ClientLayout.tsx:124-126, Suspense fallback={null} ile sarılı). ' +
      'Geri/ileri gezinme yığınını sessionStorage ile izliyor; sunucuda karşılığı yok. ' +
      'Bileşen zaten kural 5 gereği AYRI bir bileşene çıkarılmış ve sınıra alınmış.',
    marker: 1,
  },
]

/** İlan edilen adaların kattığı toplam marker — anasayfa tavanı budur. */
export const ANASAYFA_MAX_BAILOUT = ANASAYFA_BILINCLI_ADALAR.reduce((n, a) => n + a.marker, 0)

/**
 * MARKA SINIFINDA BİLİNÇLİ ADALAR — İLAN + MANDAL (REC-59 açık kalemi, 2026-09-15).
 *
 * ⭐AÇIK KALEM KAPANDI: yukarıdaki not *"`brands/[slug]` sınıfının kapı kuralı bu dosyada
 * YOK ve o rota bugün 2 marker üretiyor — yani kimse bakmıyor"* diyordu. Kural artık var.
 *
 * ⭐SAYIYI BU KEZ ALTYAPI KENDİ ÖLÇTÜ (anasayfa ilanında sayı URUN'un derlemesinden
 * aktarılmıştı ve bu sınır adıyla yazılmıştı). Ölçüm: ALTYAPI worktree'sinde `pnpm build`,
 * 105 HTML üretildi, `.next/server/app/{tr,en}/brands/*.html` **altı marka sayfasının
 * altısında da marker sayısı 2**; `brands.html` (liste) da **2**.
 *
 * ⚠**105 vs 245 FARKI ADIYLA:** aynı ilanın anasayfa bölümü "245 HTML'lik tek bir
 * derlemede" diyor; benim derlemem **105** HTML üretti. İki sayı iki farklı ana ait (arada
 * rota sınıfı ilanları ve kategori/ürün kümesi değişti) ve bu fark **ölçülmedi**. Burada
 * yazma sebebim: ileride biri iki sayıyı karşılaştırıp birini bozuk sanmasın.
 *
 * İKİ ADA DA KÖK LAYOUT'TAN GELİYOR — yani anasayfa ilanındaki aynı iki ada:
 * `vercel-analytics` ve `navigation-tracker`. Marka sayfasının KENDİ sayfa-düzeyi adası
 * YOK; ölçümle doğrulandı (HTML'deki iki marker da footer/layout bölgesinde).
 *
 * ⭐KARŞILAŞTIRMALI ÖLÇÜM — ÜÇÜNCÜ ADA BAŞKA SINIFLARDA VAR: aynı derlemede `auth/login`,
 * `auth/callback`, `payment-success`, `destek/hesaplayicilar/hrv` ve
 * `destek/hesaplayicilar/hava-perdesi` **3** marker veriyor. Üçüncü marker sayfa düzeyinde
 * doğuyor (girişte `animate-spin` bekleme göstergesiyle sarılı ada). Marka sınıfında o yok;
 * bu yüzden tavan 2, 3 değil. *İki sınıfın aynı sayıyı vermesi tesadüf olabilir — ayrımı
 * ölçmeden tek tavan yazmak, iki sınıfı birbirine kefil yapardı.*
 *
 * ⚠ROTA SINIFI İLANI: `brands/[slug]` bugün `export const revalidate = 3600` +
 * `generateStaticParams()` taşıyor ama **`export const dynamic` ilanı YOK** (ölçüldü:
 * `src/app/[lang]/brands/[slug]/page.tsx`). Yukarıdaki gerekçe düzeltmesine göre ayırt edici
 * olan tam budur: ilanı olmayan rotada `useSearchParams()` çağıran adalar marker DOĞURUR.
 * Yani 2 sayısı bu rotanın BUGÜNKÜ ilan durumunun sonucudur. Rota bir gün
 * `force-static` ilan ederse sayı **0**'a düşer ve tavan (üst sınır olduğu için) yine
 * yeşil kalır — kapı gevşemez, yalnız boşluğu daralır.
 */
export const MARKA_BILINCLI_ADALAR: readonly BilincliAda[] = [
  {
    ada: 'vercel-analytics',
    nicin:
      'Kök layout içindeki <Analytics/> useSearchParams() çağırıyor (src/app/layout.tsx). ' +
      'Kök layout PRERENDER EDİLEN HER SINIFI etkiler; marka sayfaları da prerender ' +
      'ediliyor (generateStaticParams + revalidate), bu yüzden aynı ada burada da sayılır.',
    marker: 1,
  },
  {
    ada: 'navigation-tracker',
    nicin:
      'ClientLayout içindeki NavigationTracker useSearchParams() çağırıyor. Aynı gerekçe: ' +
      'kök layout kaynaklı, sayfaya özgü değil. Marka sayfasının KENDİ sayfa-düzeyi adası ' +
      'YOK — ölçüldü, HTML’deki iki marker da layout bölgesinde.',
    marker: 1,
  },
]

/** İlan edilen adaların kattığı toplam marker — marka sınıfı tavanı budur. */
export const MARKA_MAX_BAILOUT = MARKA_BILINCLI_ADALAR.reduce((n, a) => n + a.marker, 0)

/**
 * ⚠MARKA DETAYINDA ÜRÜN LİSTESİ SUNUCUDAN GELMİYOR — ÖLÇÜLDÜ, VE KAPI BUNU İDDİA ETMEZ.
 *
 * `.next/server/app/tr/brands/vortice.html` içinde:
 *   · `<h1>` **1** (marka adı gövdede, sunucudan geliyor — 39 kez "Vortice" geçiyor)
 *   · `href="/tr/products/` **0**  ·  `href="/tr/category/` **0**
 *   · `animate-pulse` **4** (iskelet)
 *
 * Yani sayfanın başlığı ve marka anlatısı SSR'da, **ürün listesi DEĞİL** — istemcide
 * yükleniyor ve HTML'de yerine dört iskelet duruyor.
 *
 * ⛔BU YÜZDEN MARKA KURALINA "ürün bağlantısı var" İŞARETİ KOYULMADI. Koyulsaydı kapı
 * bugün KIRMIZI olurdu; sayıyı 0'a çekip "geçti" demek ise kapının olmayan bir şeyi
 * doğruladığı izlenimi verirdi. Kapı yalnız ölçtüğünü iddia eder.
 *
 * ⭐BU BİR AÇIK KALEMDİR, SESSİZ GEÇİLMİYOR: marka detayında ürün listesinin sunucuda
 * üretilip üretilmemesi gerektiği bir ÜRÜN kararıdır (vitrin/SEO eksenli) ve bu dosyanın
 * işi değil. Karar "SSR olsun" çıkarsa bu bloğun yerine bir işaret eklenir ve o gün kapı
 * gerçekten bir şey daha ölçer. Liste sayfasında durum FARKLI ve orada işaret KOYULDU:
 * `brands.html` altı `href="/tr/brands/` bağlantısı basıyor, yani liste SSR'da GERÇEKTEN var.
 */
export const MARKA_DETAY_SSR_SINIRI =
  'marka detayinda urun listesi SSR degil (olculdu 2026-09-15: href="/tr/products/" 0, animate-pulse 4)'

export interface Kural {
  yol: string
  sinif: Sinif
  /** `<main>` yerine TAM dokümanda aranan, gerçekten render edilmiş DOM işaretleri. */
  markerlar: RegExp[]
  /** İzin verilen `BAILOUT_TO_CLIENT_SIDE_RENDERING` sayısı (bilinçli ssr:false adaları). */
  maxBailout: number
  /**
   * ⭐GÖVDE GİZLİ AKIŞ BLOĞUNA İTİLMEZ (URN-25): HTML'de `<div hidden id="S:n">` bloğu 0 ve
   * `<h1>` bu bloklarının DIŞINDA. Verilmezse bu ölçüt koşmaz — yalnız ölçülmüş sınıflara
   * verilir (kategori + /products); marka sayfaları ve PDP hâlâ S bloğu taşıyor (kapsam dışı)
   * ve bu bayrak onları kırmızıya çevirmesin diye varsayılan KAPALI.
   * Niçin ayrı bir ölçüt: `BAILOUT_TO_CLIENT_SIDE_RENDERING` sayımı bu arızayı GÖRMEZ — gövde
   * HTML'de vardır, yalnız `hidden` blokta durur (ölçüldü: bailout 0 iken gizli kelime 719).
   */
  govdeGorunur?: boolean
  /**
   * ZORUNLU KAPIDA da koşar mı?
   *
   * ⭐NİÇİN AYRIM VAR: PR kapısı kırmızı olduğunda HERKESİN merge'i durur. Depo bu kararı
   * zaten bir kez vermiş — `playwright.config.ts` `checkout-smoke`'u tam bu sebeple
   * zorunlu kapının dışında tutuyor ("doğrulayamadığım bir spec'i zorunlu kontrole
   * sokmak, kırmızı çıkarsa herkesin merge'ini bloklardı"). Aynı ölçüt burada da geçerli:
   * kapıya yalnız SAĞLAM ölçütü olan sınıflar girer. Alarm bloklamaz, orada kırılgan
   * ölçüt meşrudur.
   */
  kapida: boolean
}

/** Sitemap'ten seçilen temsilciler — koşum çıktısında BASILIR (hangi slug seçildi görünsün). */
export interface Temsilciler {
  altgrupluKategori: string | null
  yaprakKategori: string | null
  pdp: string | null
  /**
   * Tüm ürünler LİSTESİ yolu — haritadan gelir (ESKİ `/tr/products`, AÇIK `/tr/urunler`). Verilmezse eski yol.
   * İsteğe bağlı: bu alan gelmeden önce kurulmuş fikstürler (`kurallar(fake)`) derlenmeye devam eder.
   */
  liste?: string | undefined
  /** Marka LİSTESİ yolu — haritadan (ESKİ `/tr/brands`, AÇIK `/tr/markalar`). Verilmezse eski yol. */
  markaListesi?: string | undefined
  /**
   * Marka detay temsilcisi (REC-59 açık kalemi). Adresten seçilir, içerikten DEĞİL — ve
   * bu ayrım kasıtlı: kategori sınıflarında içerikten seçim gerekmişti çünkü "alt gruplu"
   * olmak ADRESTEN anlaşılmıyordu (REC-286). Marka sınıfında böyle bir belirsizlik YOK:
   * `/tr/brands/<slug>` tek bir sınıftır ve site haritası onu kanonik olarak ilan ediyor.
   * Gereksiz ağ isteği yapmamak da bir ölçüttür.
   */
  marka: string | null
  sayimlar: { kategori: number; ikiSegmentli: number; pdp: number; marka: number }
  /** Seçim İÇERİKTEN mi yapıldı (kaç aday çekildi) — beyan, koşum çıktısına basılır. */
  secim: { icerikten: boolean; denenenAday: number; adayTavani: number }
  /** Temsilcisi bulunamayan sınıflar + SEBEP. Boş dizi = her sınıf ölçüldü. */
  atlananlar: Atlanan[]
}

const SITEMAP_YOLU = '/sitemap.xml'

/**
 * ADRES ŞEMALARI — kapı İKİSİNİ de tanır (URN-85, Faz 3-C 2/2, 2026-10-10).
 *
 * ESKİ (bayrak `ADRES_SEMASI_K3B` kapalı, bugünkü canlı):
 *   `/tr/products` · `/tr/products/<aile>` · `/tr/category/<slug>` · `/tr/brands` · `/tr/brands/<marka>`
 *   (REC-205'ten beri kategori TEK seviyeli; `/tr/category/<x>/<y>` yalnız REC-205 ÖNCESİ iki seviyeli biçimdir)
 * AÇIK (bayrak açık, plan §2):
 *   `/tr/urunler` · `/tr/urun/<aile>` (+ model segmenti) · `/tr/kategori/<kök>` · `/tr/kategori/<kök>/<dal>` ·
 *   `/tr/markalar` · `/tr/markalar/<marka>`
 *
 * ⛔NİÇİN İKİSİ BİRDEN: kapı bayrağı OKUMAZ, sunucunun HARİTASINI ölçer. Yalnız eski şemayı tanıyan kalıp, bayrak
 * açılınca sayımları `kategori=0, iki-segmentli=0, pdp=0` verip kapıyı kırmızıya çevirdi (PR #1811, E2E Smoke):
 * sayfalar doluydu, kusur kalıptaydı. İki şemayı birlikte tanımak, bayrağın iki durumunda da AYNI kapının koşmasını
 * sağlar. Ölçüt SIKILIĞI değişmedi: aynı içerik işaretleri, aynı bailout tavanları; yalnız adres biçimi genişledi.
 *
 * ⚠KALIPLAR BİLEREK ELLE YAZILI: üreticiden (`adresUret`) türetilseydi üretici bozulduğunda kapı da onunla birlikte
 * "doğru" kalırdı — bağımsız bir ölçüt olmazdı. Üreticiyle uyumu iki kol ölçer: `ssr-duman-kilidi.test.ts` INV-DUMAN-9
 * (elle fikstür) ve `src/app/__tests__/sitemapSsrDumanKapisi.test.ts` (GERÇEK site haritası üreticisinin çıktısı).
 */
const YOL = {
  /** ESKİ: tek seviyeli kategori (REC-205 sonrası kök de dal da bu biçimde). */
  eskiKategori: /^\/tr\/category\/[^/]+$/,
  /** ESKİ: REC-205 ÖNCESİ iki seviyeli biçim — haritada VARSA seçim ADRESTEN yapılır (geriye dönük kol). */
  eskiIkiSeviye: /^\/tr\/category\/[^/]+\/[^/]+$/,
  /** AÇIK: kök kategori. */
  acikKok: /^\/tr\/kategori\/[^/]+$/,
  /** AÇIK: dal kategori. KANONİK iki seviyedir, eski iki-seviyeli biçim DEĞİL → seçim yine İÇERİKTEN yapılır. */
  acikDal: /^\/tr\/kategori\/[^/]+\/[^/]+$/,
  /** Ürün detayı: ESKİ `/tr/products/<x>`, AÇIK `/tr/urun/<x>` (aile ya da model segmenti). */
  urun: /^\/tr\/(?:products|urun)\/[^/]+$/,
  /** Marka detayı: ESKİ `/tr/brands/<x>`, AÇIK `/tr/markalar/<x>`. */
  marka: /^\/tr\/(?:brands|markalar)\/[^/]+$/,
}

/** Liste sayfası yolları: AÇIK önce (haritada ikisi birden olmaz; olursa kanonik olan açık şemadır). */
const URUN_LISTESI_YOLLARI = ['/tr/urunler', '/tr/products'] as const
const MARKA_LISTESI_YOLLARI = ['/tr/markalar', '/tr/brands'] as const
/** Haritada liste yolu bulunamazsa (yapay fikstür) düşülen yol: kapının bugüne kadarki sabit yolu. */
const ESKI_URUN_LISTESI = '/tr/products'
const ESKI_MARKA_LISTESI = '/tr/brands'

/**
 * Bir yol ya da bağlantı ÜRÜN DETAY adresi mi? ESKİ `/<dil>/products/<x>` ve AÇIK `/tr/urun/<x>`; sorgu (`?sku=`) ve
 * parça yok sayılır, mutlak adres yola indirilir. `/tr/products` (liste), `/tr/urunler`, `/tr/urun-secici` ve ek
 * segmentli yollar ürün detayı DEĞİLDİR.
 *
 * Tek yer: E2E huni testi (`checkout-smoke`) kart bağlantısını bununla süzer ve ürün sayfasına vardığını bununla
 * doğrular. Adres biçimi kapı modülünde TEK kez yazılır (aynı kural iki dosyada iki kopya yaşarsa sessizce ayrışır).
 */
export function urunDetayAdresiMi(yol: string): boolean {
  let temiz: string
  try {
    temiz = new URL(yol, 'http://adres.invalid').pathname
  } catch {
    return false
  }
  return /^\/(?:tr\/(?:products|urun)|en\/products)\/[^/]+\/?$/.test(temiz)
}

/** `<loc>` değerlerini çıkarır. Tam XML ayrıştırıcı gerekmez: aranan tek şey adres listesi. */
function locListesi(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
}

/**
 * Haritadaki `/tr/<bölüm>/…` dağılımı. Temsilci bulunamadığında `0/0/0` sayımı tek başına "adres kalıbı mı bozuk,
 * harita mı boş" sorusunu cevaplamaz; bu özet hata metninde cevabı verir (#1811'de soru koddan okunarak cevaplandı).
 */
function bolumDagilimi(yollar: string[]): string {
  const sayac = new Map<string, number>()
  for (const p of yollar) {
    const m = /^\/tr\/([^/]+)\/./.exec(p)
    if (m) sayac.set(m[1], (sayac.get(m[1]) ?? 0) + 1)
  }
  const satir = [...sayac.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([bolum, n]) => `${bolum}=${n}`)
  return satir.length ? satir.join(', ') : '(yok)'
}

/**
 * Sitemap'i okur ve her sınıf için İLK temsilciyi seçer.
 *
 * FAIL-CLOSED: sitemap erişilemez ya da bir sınıfın hiç üyesi yoksa HATA atar.
 * Sessizce "0 rota" ile yeşil dönmek, ölçmediğini geçmek demektir.
 */
export async function temsilcileriSec(
  taban: string,
  getir: (url: string) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>
): Promise<Temsilciler> {
  const url = `${taban}${SITEMAP_YOLU}`
  const res = await getir(url)
  if (!res.ok) {
    throw new Error(
      `SSR duman kuralları: sitemap okunamadı (${url} -> HTTP ${res.status}). ` +
        'Ölçememek geçmek DEĞİLDİR — rota seçilemediği için kapı KIRMIZI.'
    )
  }
  const xml = await res.text()
  const loclar = locListesi(xml)
  if (loclar.length === 0) {
    throw new Error(
      `SSR duman kuralları: sitemap BOŞ (${url}, ${xml.length} bayt, 0 <loc>). ` +
        'Sıfır rotayla yeşil dönmek yasak — kapı KIRMIZI.'
    )
  }

  // Sınıf ayrımı YOL DERİNLİĞİNDEN çıkar ve İKİ şemayı tanır (bkz. `YOL`):
  //   ESKİ `/tr/category/X` = tek seviyeli kategori · AÇIK `/tr/kategori/<kök>` = kök, `/tr/kategori/<kök>/<dal>` = dal.
  const yollar = loclar
    .map((l) => {
      try {
        return new URL(l).pathname
      } catch {
        return ''
      }
    })
    .filter(Boolean)

  const kategoriEski = yollar.filter((p) => YOL.eskiKategori.test(p))
  const ikiSeviyeEski = yollar.filter((p) => YOL.eskiIkiSeviye.test(p))
  const kokAcik = yollar.filter((p) => YOL.acikKok.test(p))
  const dalAcik = yollar.filter((p) => YOL.acikDal.test(p))
  const pdp = yollar.filter((p) => YOL.urun.test(p))
  // Marka detayı: site haritası bunları kanonik olarak ilan ediyor (`sitemap.ts` §3 Brand
  // Routes, `HVAC_BRANDS` üzerinden). Liste sayfası SABİT yol olduğu için temsilci gerektirmez
  // (haritadan okunur: ESKİ `/tr/brands`, AÇIK `/tr/markalar`); yalnız detay sınıfı seçilir.
  const marka = yollar.filter((p) => YOL.marka.test(p))
  const liste = URUN_LISTESI_YOLLARI.find((y) => yollar.includes(y))
  const markaListesi = MARKA_LISTESI_YOLLARI.find((y) => yollar.includes(y))
  const bolumler = bolumDagilimi(yollar)

  // Sayımlar derinliği AÇIK şemadan da yansıtır: `kategori` = kök (tek seviyeli) sayfa, `ikiSegmentli` = iki seviyeli.
  const sayimlar = {
    kategori: kategoriEski.length + kokAcik.length,
    ikiSegmentli: ikiSeviyeEski.length + dalAcik.length,
    pdp: pdp.length,
    marka: marka.length,
  }
  // Sıralama SABİTLENİR: sitemap sırası değişse bile aynı taban aynı temsilciyi verir,
  // yoksa "dün geçti bugün düştü" gürültüsünün sebebi ölçülemez hâle gelir.
  const ilk = (l: string[]): string | null => (l.length ? [...l].sort()[0] : null)

  /**
   * ⭐TEMSİLCİ ARTIK ADRESTEN DEĞİL İÇERİKTEN SEÇİLİR — REC-286, 2026-09-08.
   *
   * ÖNCEKİ HÂL VE BEDELİ: iki seviyeli yol kalmadığı için (REC-205) `ikiSegmentli` kümesi
   * boştu ve seçim `kategoriler[1]`e, yani ALFABETİK İKİNCİ yola düşüyordu. Canlıda o yol
   * `aksiyel-sanayi-fanlari` — DB'de kök DEĞİL, FANLAR'ın altı; alt grubu olmadığı için
   * `>Alt Ürün Grupları<` basmıyor. Sonuç: alarm 09-07 19:14Z'den itibaren HER yayında
   * kırmızı, canlıda hiçbir arıza yokken. Üç kaynak birebir uyuştu: alarm logu kategori=23 ·
   * prod DB kök 6 + alt 17 = 23 · katalog şeridinin kendi sayımı. Bir gözlem daha geri
   * çekildi: "canlı yanlış sayfa döndürüyor" ölçüm hatasıydı (iki ayrı /tmp), site hiç
   * yanlış sayfa vermedi.
   *
   * ⭐DERS, VE NİÇİN TAM BU DOSYADA: bu dosya yukarıda "kök kategoriler HOMOJEN DEĞİL,
   * ölçüt keskin evren yanlış" dersini ZATEN yazmıştı — ama çareyi yalnız yaprak sınıfının
   * markerına uygulayıp TEMSİLCİ SEÇİMİNE uygulamayı atlamıştı. Yani ders yazılıydı, sadece
   * yarısı işletiliyordu. Bu yüzden ayrım artık tek yerde ve ADRESE HİÇ BAKMADAN yapılıyor.
   *
   * NASIL: adaylar alfabetik sırayla (deterministik) çekilir; her aday BİR kez indirilir ve
   * iki desen AYNI gövdede aranır. İkisi de dolduğunda döngü durur, yani ek istek sayısı
   * `adayTavani`yi geçmez.
   * ⛔TAVAN SESSİZ DEĞİL: tavana takılırsa `secim.denenenAday` ile birlikte raporlanır ve
   * bulunamayan sınıf `atlananlar`a SEBEBİYLE yazılır — "bulamadım" hâli yeşile karışmaz.
   */
  /**
   * ⭐TAVAN 8 DEĞİL 24 — ÖLÇÜLDÜ, İLK DEĞER SINIFI ÖLÇÜLMEDEN BIRAKIYORDU (2026-09-08).
   *
   * İlk hâlinde tavan 8'di. Canlıya karşı koşulduğunda alarm YEŞİL döndü ama çıktısında
   * şu yazıyordu: "8 aday çekildi, hiçbiri alt grup başlığı basmadı → sınıf ÖLÇÜLMEDİ".
   * Sebep: sitemap'teki 23 kategori alfabetik ve alt grubu OLAN `fanlar` ilk sekizde
   * değil. Yani onarım çalışıyordu, tavan kördü — ve tam da bu yüzden atlamanın SEBEBİYLE
   * raporlanması şart: sessiz olsaydı "yeşil" der geçerdim, sınıf ölçülmeden.
   *
   * 24 = sitemap'teki kategori sayısının (23) bir fazlası; katalog birkaç kategori büyürse
   * de tarama tamamlanır. Erken çıkış zaten var (iki temsilci dolunca döngü durur), yani
   * tipik koşum tavana DEĞMEZ. Tavan sonsuz döngüye değil, KATALOG PATLAMASINA karşı.
   * ⚠MALİYET ÖLÇÜLDÜ: tavan 8 iken alarm 17.5s (temsilcisiz), taban hâli 5.75s idi.
   */
  const ADAY_TAVANI = 24
  const ALTGRUP_DESENI = />Alt Ürün Grupları</
  const YAPRAK_DESENI = /data-ssr="family-card"/

  // ⭐AÇIK ŞEMADA `kök/dal` KANONİK adrestir: aday kümesi iki derinliği BİRLİKTE içerir ve seçim yine İÇERİKTEN
  // yapılır (aşağıdaki geriye dönük kol YALNIZ REC-205 öncesi eski iki seviyeli biçimde devreye girer). Açık şema
  // `kök/dal` adresini "doğrulanmamış temsilci" sayıp gevşek ölçüte düşürseydi yaprak ölçütü gevşerdi (ratchet kaybı).
  // Aday sayısı iki şemada aynıdır (kategori sayfası sayısı): ESKİ 23 tek seviyeli, AÇIK 6 kök + 17 dal (REC-286 sayımı).
  const adaylar = [...kategoriEski, ...kokAcik, ...dalAcik].sort()
  const atlananlar: Atlanan[] = []

  // Geriye dönük kol: REC-205 ÖNCESİ iki seviyeli yol VARSA eski (ucuz, isteksiz) ayrım korunur.
  if (ikiSeviyeEski.length > 0) {
    const altPrefixleri = new Set(ikiSeviyeEski.map((p) => p.split('/').slice(0, 4).join('/')))
    const t: Temsilciler = {
      altgrupluKategori: ilk(kategoriEski.filter((p) => altPrefixleri.has(p))),
      yaprakKategori: ilk(ikiSeviyeEski),
      pdp: ilk(pdp),
      marka: ilk(marka),
      liste,
      markaListesi,
      sayimlar,
      secim: { icerikten: false, denenenAday: 0, adayTavani: ADAY_TAVANI },
      atlananlar,
    }
    if (!t.altgrupluKategori) {
      atlananlar.push({
        sinif: 'altgruplu-kategori',
        sebep: 'iki segmentli yol var ama hiçbiri tek segmentli bir kategoriyle eşleşmedi',
      })
    }
    zorunluKontrol(t, sayimlar, bolumler)
    return t
  }

  let altgrupluKategori: string | null = null
  let yaprakKategori: string | null = null
  let denenenAday = 0

  for (const yol of adaylar) {
    if (altgrupluKategori && yaprakKategori) break
    if (denenenAday >= ADAY_TAVANI) break
    denenenAday++
    let html = ''
    try {
      const r = await getir(`${taban}${yol}`)
      if (!r.ok) continue
      html = await r.text()
    } catch {
      // Tek adayın çekilememesi seçimi bitirmez; tavan zaten üst sınırı koyuyor.
      continue
    }
    if (!altgrupluKategori && ALTGRUP_DESENI.test(html)) altgrupluKategori = yol
    if (!yaprakKategori && YAPRAK_DESENI.test(html)) yaprakKategori = yol
  }

  if (!altgrupluKategori) {
    atlananlar.push({
      sinif: 'altgruplu-kategori',
      sebep:
        `${denenenAday} aday çekildi (tavan ${ADAY_TAVANI}, sitemap'te ${sayimlar.kategori} kategori), ` +
        'hiçbiri alt grup başlığı basmadı — temsilci YOK, sınıf ÖLÇÜLMEDİ (yeşil DEĞİL)',
    })
  }

  // Marka temsilcisi yoksa SESSİZ GEÇİLMEZ: sınıf `atlananlar`a sebebiyle yazılır.
  // Site haritası marka adreslerini ilan etmiyorsa bu bir HARİTA kusurudur ve o kusurun
  // görünmesi gerekir — kapının "marka sınıfını ölçtüm" sanması daha kötüdür.
  if (marka.length === 0) {
    atlananlar.push({
      sinif: 'marka',
      sebep:
        "site haritasinda /tr/brands/<slug> ya da /tr/markalar/<slug> deseni HIC YOK — temsilci secilemedi, " +
        'sinif OLCULMEDI (yesil DEGIL). Harita marka rotalarini ilan ediyor olmali ' +
        '(sitemap.ts §3 Brand Routes).',
    })
  }

  const t: Temsilciler = {
    altgrupluKategori,
    yaprakKategori,
    pdp: ilk(pdp),
    marka: ilk(marka),
    liste,
    markaListesi,
    sayimlar,
    secim: { icerikten: true, denenenAday, adayTavani: ADAY_TAVANI },
    atlananlar,
  }
  zorunluKontrol(t, sayimlar, bolumler)
  return t
}

/**
 * FAIL-CLOSED: kapıda koşan sınıfların temsilcisi yoksa HATA.
 *
 * `altgruplu-kategori` bu listede YOK ve olmaması bilinçli: o sınıf `kapida: false`
 * (i18n sözlük metnine bağlı, bkz. kural bloğu). Temsilcisi bulunamadığında kapı kırmızı
 * OLMAZ ama sınıf `atlananlar`a yazılır — ölçülmeyen şey yeşil sayılmaz, GÖRÜNÜR olur.
 */
function zorunluKontrol(t: Temsilciler, sayimlar: Temsilciler['sayimlar'], bolumler: string): void {
  if (!t.yaprakKategori || !t.pdp) {
    throw new Error(
      'SSR duman kuralları: KAPIDA koşan sınıfların temsilcisi YOK ' +
        `(kategori=${sayimlar.kategori}, iki-segmentli=${sayimlar.ikiSegmentli}, pdp=${sayimlar.pdp}, ` +
        `içerikten=${t.secim.icerikten}, denenen aday=${t.secim.denenenAday}/${t.secim.adayTavani}). ` +
        'Kapı KIRMIZI. NOT: sitemap\'te HİÇ kategori/PDP yolu yoksa bu gerçek bir kusurdur; ' +
        'aday çekilebildiği hâlde hiçbiri aile kartı basmıyorsa bu da gerçek bir kusurdur. ' +
        'Sayımlar SIFIRSA önce adres kalıbına bak: tanınan şemalar ESKİ (/tr/category, /tr/products, /tr/brands) ' +
        've AÇIK (/tr/kategori, /tr/urun, /tr/markalar). ' +
        `Sitemap bölüm dağılımı: ${bolumler} (bölüm adı=yol sayısı)`
    )
  }

  /**
   * MARKA sınıfı da `kapida: true` — temsilcisi yoksa kapı KIRMIZI.
   *
   * ⭐AYRI `throw`, VE SIRASI SONRA: sebep karışmasın diye ayrı yazıldı (kategori/PDP
   * temsilcisinin yokluğu İÇERİK seçimiyle ilgilidir; marka temsilcisinin yokluğu doğrudan
   * SİTE HARİTASININ marka rotalarını ilan etmemesi demektir). Sırası sonda, çünkü ilk
   * yazımda başa koymuştum ve **mevcut altı kolu düşürdü**: eski kollar kategori/PDP hata
   * metnini bekliyordu, benim kontrolüm onlardan önce atıp başka bir metin veriyordu.
   * Yani yeni bir kontrol eklerken ESKİ kontrolün mesajını çalmamak da ölçütün parçası.
   */
  if (!t.marka) {
    throw new Error(
      'SSR duman kurallari: MARKA sinifinin temsilcisi YOK ' +
        `(sitemap'te /tr/brands/<slug> ya da /tr/markalar/<slug> sayisi=${sayimlar.marka}). Kapi KIRMIZI. ` +
        'Bu gercek bir kusurdur: sitemap.ts §3 Brand Routes marka adreslerini ilan ediyor ' +
        `olmali. Olcememek gecmek DEGILDIR. Sitemap bolum dagilimi: ${bolumler}`
    )
  }
}

/**
 * Kural kümesini üretir.
 *
 * `yalnizKapi=true` verilirse kapıda koşmayan sınıflar DÜŞÜLÜR.
 */
export function kurallar(t: Temsilciler, yalnizKapi = false): Kural[] {
  const hepsi: Kural[] = [
    // Ana sayfa: tek sağlam işaret h1. Bailout 0 — REC-94'te 3D şerit kaldırıldı, eşik
    // 1'den 0'a İNDİ; eşiği indirmek işin parçası, yoksa kazanç kayda geçmez (ratchet).
    // Anasayfa: bailout tavanı İLAN'dan türetilir (`ANASAYFA_BILINCLI_ADALAR`) — çıplak sayı yok.
    {
      yol: '/tr',
      sinif: 'anasayfa',
      markerlar: [/<h1[\s>]/],
      maxBailout: ANASAYFA_MAX_BAILOUT,
      kapida: true,
    },

    // Ürün listesi: aile kartları SSR'da olmalı — `data-ssr` işareti ÜRÜN tarafının
    // bilerek koyduğu ölçüm kancası, i18n metnine bağlı değil, bu yüzden kapıya uygun.
    // Yol haritadan gelir: ESKİ `/tr/products`, AÇIK `/tr/urunler` (açıkta `/tr/products` yalnız 308 verir; kapı
    // kanonik sayfayı ölçer, yönlendirmenin ardındakini değil). Haritada yoksa eski yol (bugüne kadarki sabit).
    {
      yol: t.liste ?? ESKI_URUN_LISTESI,
      sinif: 'liste',
      markerlar: [/<h1[\s>]/, /data-ssr="family-card"/],
      maxBailout: 0,
      govdeGorunur: true,
      kapida: true,
    },

    // Ürün listesi, İNGİLİZCE: aynı çekirdek (`urunlerSayfasi`), ayrı üretilmiş HTML — `en/products.html`
    // ayrı dosya olduğu için ayrı ölçülür (URN-25: tr 99/1015, en 93/1165 kelime gizli blokta idi).
    {
      yol: '/en/products',
      sinif: 'liste-en',
      markerlar: [/<h1[\s>]/, /data-ssr="family-card"/],
      maxBailout: 0,
      govdeGorunur: true,
      kapida: true,
    },

    /**
     * ⭐KÖK KATEGORİ: ALARMDA KALIR, KAPIYA GİRMEZ — ölçümle verilmiş karar.
     *
     * Ölçüldü (2026-09-04, canlı, aktif `fanlar` ile pasif `konut-tipi-havalandirma`
     * yan yana): kök kategori sayfası SSR'da `data-ssr` işareti BASMIYOR (0) ve kendi
     * alt kategorilerine `href` de basmıyor (0; sayfada 35 `<a>` var, hiçbiri kategori
     * linki değil — o linkler istemci tarafında doğuyor). Ayırt eden tek şey i18n
     * sözlüğünden gelen "Alt Ürün Grupları" başlığı: aktif sayfada var, pasifte yok.
     *
     * Sözlük de VERİDİR. Onu zorunlu kapıya koymak, URUN bir anahtarı yeniden
     * adlandırdığında tüm filonun merge'ini durdurur — `checkout-smoke` kararının
     * aynı sınıfı. Bu yüzden bu sınıf yalnız ALARMDA ölçülür (bloklamaz) ve kırılganlığı
     * burada yazılıdır.
     *
     * DÜN ÖDENEN BEDEL: bu rota REC-134'te `[<h1|<h2]` markerıyla kapıya girmişti ve
     * `konut-tipi-havalandirma` PASİF olduğu için boş sayfada da yeşil veriyordu —
     * "6/6 yeşil" dedim, o yeşilin biri BEDAVAYDI. Artık temsilci sitemap'ten geldiği
     * için pasif kategori zaten seçilemiyor; marker da ayırt edici olana çevrildi.
     */
    ...(t.altgrupluKategori
      ? [
          {
            yol: t.altgrupluKategori,
            sinif: 'altgruplu-kategori' as Sinif,
            markerlar: [/<h1[\s>]/, />Alt Ürün Grupları</],
            maxBailout: 0,
            govdeGorunur: true,
            kapida: false,
          },
        ]
      : []),

    /**
     * Kategori sayfası: SSR'da GÖVDE basmalı — kapıda kalır.
     *
     * ⚠MARKER "YA/YA DA" OLDU ve BEDELİ BURAYA YAZILIYOR (2026-09-07): eskiden yalnız
     * `family-card` aranıyordu, çünkü bu sınıf yol derinliğiyle "yaprak" diye seçiliyordu.
     * REC-205 sonrası hiyerarşi yolda kodlanmadığı için seçilen sayfa yaprak DA olabilir,
     * alt grupları olan DA. İkisinin SSR imzası farklı: yaprak `family-card` basar, üstteki
     * `Alt Ürün Grupları` başlığını. Bu yüzden ölçüt "ikisinden BİRİ" oldu.
     * **Ne kaybettik:** artık "bu sayfa YAPRAK ve aile kartı basıyor" diye kesin bir şey
     * söylemiyoruz. **Ne korunuyor:** boş kabuk (ikisi de yok) hâlâ KIRMIZI, bailout tavanı 0.
     * Daha güçlü hâli, temsilciyi içerikten seçmeyi gerektirir (bir tur ön-getirme) — ayrı iş.
     *
     * ✅O AYRI İŞ YAPILDI (REC-286, 2026-09-08) ve ÖLÇÜT GERİ SIKILAŞTI — RATCHET.
     * Temsilci artık içerikten seçildiği için "yaprak" sınıfının temsilcisi `family-card`
     * BASTIĞI ÖLÇÜLEREK seçiliyor; o hâlde ölçüt "ikisinden biri" olmak zorunda değil,
     * `family-card`ın KENDİSİ. Yukarıda "ne kaybettik" diye yazılan şey geri alındı.
     * ⛔GEVŞEK KOL NİÇİN DURUYOR: iki segmentli yol varsa (REC-205 öncesi biçim) seçim
     * içerikten YAPILMAZ, temsilci doğrulanmamış olur — o hâlde eski gevşek ölçüt geçerli.
     * Yani ölçütün sıkılığı, seçimin gücüne BAĞLI ve bu bağ burada yazılı; sıkı ölçütü
     * doğrulanmamış temsilciye uygulamak sahte kırmızı üretirdi.
     */
    {
      yol: t.yaprakKategori as string,
      sinif: 'yaprak-kategori',
      markerlar: t.secim.icerikten
        ? [/<h1[\s>]/, /data-ssr="family-card"/]
        : [/<h1[\s>]/, /(data-ssr="family-card"|>Alt Ürün Grupları<)/],
      maxBailout: 0,
      govdeGorunur: true,
      kapida: true,
    },

    // PDP: bailout tavanı İLAN'dan türetilir (`PDP_BILINCLI_ADALAR`) — çıplak sayı yok.
    // `>Model Seçimi<` DOM-only eşleşir — RSC payload'ında metin tırnak-escape'li geçtiği
    // için yalnız gerçek DOM'da bulunur. Ölçüldü: üç ayrı PDP'de de h1=1,
    // `>Model Seçimi<`=1 → beklenti sayfaya değil PDP SINIFINA ait.
    {
      yol: t.pdp as string,
      sinif: 'pdp',
      markerlar: [/<h1[\s>]/, />Model Seçimi</],
      maxBailout: PDP_MAX_BAILOUT,
      kapida: true,
    },

    /**
     * MARKA LİSTESİ — REC-59 açık kaleminin birinci yarısı.
     *
     * SABİT YOL: temsilci gerekmez, liste her zaman var (sitemap statik rotası): ESKİ `/tr/brands`,
     * AÇIK `/tr/markalar` — yol haritadan okunur, haritada yoksa eski yol.
     *
     * İKİ İŞARET DE ÖLÇÜLDÜ (kendi derlemem, `.next/server/app/tr/brands.html`):
     * `<h1>` 1 · `href="/tr/brands/` **6**. İkinci işaret ayırt edicidir: yalnız `<h1>`
     * arayan bir kural, liste boş gelse bile yeşil kalırdı — başlık kabuğun parçası,
     * bağlantılar ise VERİNİN sunucuda çözüldüğünün kanıtı. Bağlantı işareti iki şemayı da
     * tanır (`/tr/brands/<x>` ya da `/tr/markalar/<x>`); ölçüt aynı, yalnız adres biçimi genişledi.
     *
     * KAPIDA KOŞAR: ölçüt sağlam (dil metnine bağlı değil, adres desenine bağlı).
     */
    {
      yol: t.markaListesi ?? ESKI_MARKA_LISTESI,
      sinif: 'marka-listesi',
      markerlar: [/<h1[\s>]/, /href="\/tr\/(?:brands|markalar)\//],
      maxBailout: MARKA_MAX_BAILOUT,
      kapida: true,
    },

    /**
     * MARKA DETAYI — REC-59 açık kaleminin ikinci yarısı, kapanan asıl kalem.
     *
     * ⚠TEK İŞARET, VE SEBEBİ YUKARIDA ADIYLA YAZILI (`MARKA_DETAY_SSR_SINIRI`): bu sayfada
     * ürün listesi SSR'da YOK (ölçüldü: `href="/tr/products/` 0, `animate-pulse` 4). Bu
     * yüzden "ürün bağlantısı var" işareti KOYULMADI — koyulsaydı kapı bugün kırmızı olurdu
     * ve kırmızıyı kapatmak için ölçütü gevşetmek gerekirdi. Kapı yalnız ölçtüğünü iddia eder.
     *
     * Konan işaret `<h1>`: marka adı gövdede sunucudan geliyor (39 kez "Vortice"). Yani
     * kural şunu güvenceye alır: marka detayı boş kabuk DÖNMEZ ve bailout sayısı 2'yi geçmez.
     *
     * KAPIDA KOŞAR: temsilci adresten seçiliyor (içerik denemesi yok) ve işaret sağlam.
     */
    {
      yol: t.marka as string,
      sinif: 'marka',
      markerlar: [/<h1[\s>]/],
      maxBailout: MARKA_MAX_BAILOUT,
      kapida: true,
    },
  ]
  return yalnizKapi ? hepsi.filter((k) => k.kapida) : hepsi
}

/**
 * HTML'deki gizli akış bloklarının (`<div hidden id="S:n">…</div>`) açılış/kapanış konumları.
 * `<div>` derinliği sayılır: ilk `</div>` bloğu kapatmaz, iç içe div'ler atlanır. Eşleşmeyen
 * (kapanmamış) blok HTML sonuna kadar sayılır — kusurlu çıktı "blok yok" gibi okunmaz.
 */
export function gizliAkisBloklari(html: string): Array<{ bas: number; son: number }> {
  const bloklar: Array<{ bas: number; son: number }> = []
  const acilis = /<div hidden id="S:\d+">/g
  let m: RegExpExecArray | null
  while ((m = acilis.exec(html))) {
    const etiket = /<(\/?)div\b[^>]*>/g
    etiket.lastIndex = m.index + m[0].length
    let derinlik = 1
    let son = html.length
    let t: RegExpExecArray | null
    while ((t = etiket.exec(html))) {
      derinlik += t[1] ? -1 : 1
      if (derinlik === 0) {
        son = etiket.lastIndex
        break
      }
    }
    bloklar.push({ bas: m.index, son })
    acilis.lastIndex = son
  }
  return bloklar
}

/** `<h1>` açılışlarının kaçı gizli akış bloklarının DIŞINDA (gerçekten görünür yerde). */
export function gorunurH1Sayisi(html: string): number {
  const bloklar = gizliAkisBloklari(html)
  let say = 0
  for (const h of html.matchAll(/<h1[\s>]/g)) {
    const i = h.index ?? 0
    if (!bloklar.some((b) => i >= b.bas && i < b.son)) say++
  }
  return say
}

/** Bir yanıt gövdesini bir kurala göre denetler; ihlal listesi döner (boş = geçti). */
export function ihlaller(kural: Kural, html: string): string[] {
  const cikti: string[] = []
  if (kural.govdeGorunur) {
    const blok = gizliAkisBloklari(html).length
    if (blok > 0) {
      cikti.push(
        `${kural.yol} (${kural.sinif}) gövde gizli akış bloğunda: <div hidden id="S:n"> ${blok} adet ` +
          '(Suspense sınırı içeriği sarıyor; JS çalıştırmayan okuyucu h1 ve listeyi görmez)'
      )
    }
    if (gorunurH1Sayisi(html) === 0) {
      cikti.push(`${kural.yol} (${kural.sinif}) görünür yerde <h1> yok (gizli blokta ya da hiç yok)`)
    }
  }
  for (const m of kural.markerlar) {
    if (!m.test(html)) cikti.push(`${kural.yol} (${kural.sinif}) SSR HTML'inde beklenen içerik yok: ${m}`)
  }
  const bailout = (html.match(/BAILOUT_TO_CLIENT_SIDE_RENDERING/g) ?? []).length
  if (bailout > kural.maxBailout) {
    cikti.push(
      `${kural.yol} (${kural.sinif}) beklenmeyen CSR bailout (SSR boş-kabuk riski): ` +
        `${bailout} > ${kural.maxBailout}`
    )
  }
  return cikti
}
