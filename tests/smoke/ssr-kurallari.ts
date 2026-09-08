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
export type Sinif = 'anasayfa' | 'liste' | 'altgruplu-kategori' | 'yaprak-kategori' | 'pdp'

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

export interface Kural {
  yol: string
  sinif: Sinif
  /** `<main>` yerine TAM dokümanda aranan, gerçekten render edilmiş DOM işaretleri. */
  markerlar: RegExp[]
  /** İzin verilen `BAILOUT_TO_CLIENT_SIDE_RENDERING` sayısı (bilinçli ssr:false adaları). */
  maxBailout: number
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
  sayimlar: { kategori: number; ikiSegmentli: number; pdp: number }
  /** Seçim İÇERİKTEN mi yapıldı (kaç aday çekildi) — beyan, koşum çıktısına basılır. */
  secim: { icerikten: boolean; denenenAday: number; adayTavani: number }
  /** Temsilcisi bulunamayan sınıflar + SEBEP. Boş dizi = her sınıf ölçüldü. */
  atlananlar: Atlanan[]
}

const SITEMAP_YOLU = '/sitemap.xml'

/** `<loc>` değerlerini çıkarır. Tam XML ayrıştırıcı gerekmez: aranan tek şey adres listesi. */
function locListesi(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
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

  // Sınıf ayrımı YOL DERİNLİĞİNDEN çıkar: /tr/category/X = kök, /tr/category/X/Y = alt.
  const yollar = loclar
    .map((l) => {
      try {
        return new URL(l).pathname
      } catch {
        return ''
      }
    })
    .filter(Boolean)

  const kategori = yollar.filter((p) => /^\/tr\/category\/[^/]+$/.test(p))
  const ikiSegmentli = yollar.filter((p) => /^\/tr\/category\/[^/]+\/[^/]+$/.test(p))
  const pdp = yollar.filter((p) => /^\/tr\/products\/[^/]+$/.test(p))

  const sayimlar = {
    kategori: kategori.length,
    ikiSegmentli: ikiSegmentli.length,
    pdp: pdp.length,
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

  const adaylar = [...kategori].sort()
  const atlananlar: Atlanan[] = []

  // Geriye dönük kol: iki seviyeli yol VARSA eski (ucuz, isteksiz) ayrım korunur.
  if (ikiSegmentli.length > 0) {
    const altPrefixleri = new Set(ikiSegmentli.map((p) => p.split('/').slice(0, 4).join('/')))
    const t: Temsilciler = {
      altgrupluKategori: ilk(kategori.filter((p) => altPrefixleri.has(p))),
      yaprakKategori: ilk(ikiSegmentli),
      pdp: ilk(pdp),
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
    zorunluKontrol(t, sayimlar)
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

  const t: Temsilciler = {
    altgrupluKategori,
    yaprakKategori,
    pdp: ilk(pdp),
    sayimlar,
    secim: { icerikten: true, denenenAday, adayTavani: ADAY_TAVANI },
    atlananlar,
  }
  zorunluKontrol(t, sayimlar)
  return t
}

/**
 * FAIL-CLOSED: kapıda koşan sınıfların temsilcisi yoksa HATA.
 *
 * `altgruplu-kategori` bu listede YOK ve olmaması bilinçli: o sınıf `kapida: false`
 * (i18n sözlük metnine bağlı, bkz. kural bloğu). Temsilcisi bulunamadığında kapı kırmızı
 * OLMAZ ama sınıf `atlananlar`a yazılır — ölçülmeyen şey yeşil sayılmaz, GÖRÜNÜR olur.
 */
function zorunluKontrol(t: Temsilciler, sayimlar: Temsilciler['sayimlar']): void {
  if (!t.yaprakKategori || !t.pdp) {
    throw new Error(
      'SSR duman kuralları: KAPIDA koşan sınıfların temsilcisi YOK ' +
        `(kategori=${sayimlar.kategori}, iki-segmentli=${sayimlar.ikiSegmentli}, pdp=${sayimlar.pdp}, ` +
        `içerikten=${t.secim.icerikten}, denenen aday=${t.secim.denenenAday}/${t.secim.adayTavani}). ` +
        'Kapı KIRMIZI. NOT: sitemap\'te HİÇ kategori/PDP yolu yoksa bu gerçek bir kusurdur; ' +
        'aday çekilebildiği hâlde hiçbiri aile kartı basmıyorsa bu da gerçek bir kusurdur.'
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
    { yol: '/tr', sinif: 'anasayfa', markerlar: [/<h1[\s>]/], maxBailout: 0, kapida: true },

    // Ürün listesi: aile kartları SSR'da olmalı — `data-ssr` işareti ÜRÜN tarafının
    // bilerek koyduğu ölçüm kancası, i18n metnine bağlı değil, bu yüzden kapıya uygun.
    {
      yol: '/tr/products',
      sinif: 'liste',
      markerlar: [/<h1[\s>]/, /data-ssr="family-card"/],
      maxBailout: 0,
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
  ]
  return yalnizKapi ? hepsi.filter((k) => k.kapida) : hepsi
}

/** Bir yanıt gövdesini bir kurala göre denetler; ihlal listesi döner (boş = geçti). */
export function ihlaller(kural: Kural, html: string): string[] {
  const cikti: string[] = []
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
