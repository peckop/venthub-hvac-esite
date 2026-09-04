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

/** Rotanın SINIFI — dinamik seçimde sınıf korunur (temsilci değişir, sınıf değişmez). */
export type Sinif = 'anasayfa' | 'liste' | 'kok-kategori' | 'alt-kategori' | 'pdp'

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
  kokKategori: string | null
  altKategori: string | null
  pdp: string | null
  sayimlar: { kokKategori: number; altKategori: number; pdp: number }
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

  const kok = yollar.filter((p) => /^\/tr\/category\/[^/]+$/.test(p))
  const alt = yollar.filter((p) => /^\/tr\/category\/[^/]+\/[^/]+$/.test(p))
  const pdp = yollar.filter((p) => /^\/tr\/products\/[^/]+$/.test(p))

  const sayimlar = { kokKategori: kok.length, altKategori: alt.length, pdp: pdp.length }
  // Sıralama SABİTLENİR: sitemap sırası değişse bile aynı taban aynı temsilciyi verir,
  // yoksa "dün geçti bugün düştü" gürültüsünün sebebi ölçülemez hâle gelir.
  const ilk = (l: string[]): string | null => (l.length ? [...l].sort()[0] : null)

  /**
   * ⭐KÖK KATEGORİ TEMSİLCİSİ, ALT KATEGORİSİ OLANLARDAN SEÇİLİR — ölçümle öğrenildi.
   *
   * İlk hâlinde "ilk kök kategori" seçiliyordu ve `aksesuarlar` geldi; kol DÜŞTÜ.
   * Ölçtüm (canlı, üç sayfa yan yana): kök kategoriler HOMOJEN DEĞİL —
   *   · `fanlar` (alt kategorili) → `>Alt Ürün Grupları<` = 1, `family-card` = 0
   *   · `aksesuarlar` (alt kategorisiz) → `>Alt Ürün Grupları<` = 0, `family-card` = 1
   * Yani alt kategorisi olmayan kök kategori YAPRAK gibi davranıp aile kartı basıyor.
   * Sınıfın markerı doğruydu, TEMSİLCİ SEÇİMİ sınıfın tanımına uymuyordu: "kök kategori"
   * dediğim şey aslında "alt kategorisi olan kök kategori"ydi. Ölçüt keskin, evren yanlış.
   */
  const altPrefixleri = new Set(alt.map((p) => p.split('/').slice(0, 4).join('/')))
  const kokAltli = kok.filter((p) => altPrefixleri.has(p))

  const t: Temsilciler = {
    kokKategori: ilk(kokAltli),
    altKategori: ilk(alt),
    pdp: ilk(pdp),
    sayimlar,
  }
  if (!t.altKategori || !t.pdp) {
    throw new Error(
      'SSR duman kuralları: zorunlu sınıfların temsilcisi YOK ' +
        `(alt-kategori=${sayimlar.altKategori}, pdp=${sayimlar.pdp}). Kapı KIRMIZI.`
    )
  }
  return t
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
    ...(t.kokKategori
      ? [
          {
            yol: t.kokKategori,
            sinif: 'kok-kategori' as Sinif,
            markerlar: [/<h1[\s>]/, />Alt Ürün Grupları</],
            maxBailout: 0,
            kapida: false,
          },
        ]
      : []),

    // Yaprak alt-kategori: aile kartları SSR'da olmalı (sağlam işaret → kapıda).
    {
      yol: t.altKategori as string,
      sinif: 'alt-kategori',
      markerlar: [/data-ssr="family-card"/],
      maxBailout: 0,
      kapida: true,
    },

    // PDP: 2 bailout BİLİNÇLİ (galeri + 3D adaları). `>Model Seçimi<` DOM-only eşleşir —
    // RSC payload'ında metin tırnak-escape'li geçtiği için yalnız gerçek DOM'da bulunur.
    // Ölçüldü: üç ayrı PDP'de de h1=1, `>Model Seçimi<`=1, bailout=2 → beklenti sayfaya
    // değil PDP SINIFINA ait.
    {
      yol: t.pdp as string,
      sinif: 'pdp',
      markerlar: [/<h1[\s>]/, />Model Seçimi</],
      maxBailout: 2,
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
