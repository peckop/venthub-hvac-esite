import fs from 'node:fs'
import path from 'node:path'

import { render, within } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import GuidedCategoryDiscovery, { type CategoryViewModelLite } from '@/components/home/GuidedCategoryDiscovery'
import { I18nProvider, type Lang } from '@/i18n/I18nProvider'
import ProductsDiscoveryView from '@/views/ProductsDiscoveryView'

// Yönlendirici ve ağır ürün kartı sahtelenir — bu kapının konusu KATEGORİ KAPISI.
// (Desen `seo-h1-tekilligi.test.tsx`ten alındı; orası da bu görünümü çiziyor.)
// I18nProvider SAHTELENMEZ: başlıkların gerçekten sözlükten geldiğini ölçüyoruz.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/tr/products',
}))

vi.mock('@/components/products/FamilyCard', () => ({
  default: () => <div data-testid="family-card" />,
}))

/**
 * jsdom'da `IntersectionObserver` YOKTUR; `ScrollObserver` onsuz mount anında patlar.
 * (Bu kapı 2026-09-07'de tam bu satırda kırmızı verdi — görünürlük onarımı geldiğinde.)
 *
 * ⚠TAKLİDİN NE YAPTIĞI, AÇIKÇA: gerçeğe UYUMLU davranır — gözlenen her öğeyi "görünür"
 * sayıp geri çağırıyı `isIntersecting: true` ile çağırır, yani tarayıcıda kaydırma sonrası
 * oluşan DOM'un aynısını üretir. Böylece test sahte bir "hiç açılmayan" dünyada değil,
 * gerçeğin karşılığı olan dünyada ölçer.
 *
 * ⚠TAKLİDİN NE YAPMADIĞI, AYNI AÇIKLIKLA: jsdom düzen/boyama yapmaz — bu taklit bloğun
 * GÖRÜNDÜĞÜNÜ kanıtlamaz, yalnız ağacın çizildiğini. Görünürlüğün gerçek kanıtı tarayıcı
 * ölçümüdür (2026-09-07, Playwright: 7 öğenin 7'si opaklık 1) ve yapısal güvencesi
 * INV-GOZLEMCI-1'dir (gozlemci-sozlesmesi.test.ts). Bu satır o ikisinin YERİNE GEÇMEZ.
 *
 * Arayüz TAM uygulanır (`root`/`rootMargin`/`thresholds` dahil): eksik bırakıp tip
 * dökümüyle geçmek, taklidin gerçekten IntersectionObserver yerine geçtiğini SÖYLER ama
 * KANITLAMAZ — derleyicinin itirazı burada bilgidir, susturulacak gürültü değil.
 */
class SahteIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = [0]
  private readonly geriCagri: IntersectionObserverCallback

  constructor(geriCagri: IntersectionObserverCallback) {
    this.geriCagri = geriCagri
  }

  observe(hedef: Element): void {
    const kayit: IntersectionObserverEntry = {
      boundingClientRect: hedef.getBoundingClientRect(),
      intersectionRatio: 1,
      intersectionRect: hedef.getBoundingClientRect(),
      isIntersecting: true,
      rootBounds: null,
      target: hedef,
      time: 0,
    }
    this.geriCagri([kayit], this)
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] { return [] }
}
vi.stubGlobal('IntersectionObserver', SahteIntersectionObserver)

/**
 * INV-URUNLER-KATEGORI-1 — Ürünler sayfası kategori ağacına GİDEN bir kapı taşır.
 *
 * NİÇİN VAR (REC-213-A · canlı ölçüm 2026-09-07):
 * `https://venthub.com.tr/tr/products` sayfasının **ham HTML'inde** `/tr/category/…`
 * bağlantısı **0** idi. Kategori adları metin olarak vardı (ürün kartı etiketlerinden)
 * ama hiçbiri tıklanmıyordu — yani ürün listesi sayfasından kategori ağacına geçiş YOKTU.
 *
 * Sebebi ihmal değil, bir yan etkiydi: REC-94'te 3D orbital kategori seçici müşteri
 * yüzeyinden kaldırıldı ve `ProductsDiscoveryView` içindeki yorumda *"yerine gelecek
 * kategori kartları ayrı PR'da"* yazıyordu. O PR hiç gelmedi; arada sayfa kategorisiz kaldı
 * ve hiçbir kapı bunu görmedi. **Bu dosya o boşluğun kapısıdır.**
 *
 * ⭐NİÇİN ÖNEMLİ (REC-213-B'nin ÖN KOŞULU): bir sonraki adımda header'daki "Kategoriler"
 * öğesi kalkacak ve keşif kapısı tekleşecek. O adım ancak burası doluysa güvenlidir —
 * aksi halde kategori ağacına giden SON kapı da kapanırdı. Yani bu kapı yeşil kalmadan
 * 213-B yapılamaz.
 *
 * BU KAPI NE ÖLÇER: kategori kartı ızgarasının, verilen kategoriler için gerçekten
 * `/<dil>/category/<slug>` adresine giden BAĞLANTI ürettiğini — ve bunu iki dilde de.
 *
 * BU KAPI NE ÖLÇMEZ: canlıda sayfanın o bloğu çizdiğini (ağ ister; onu yayın sonrası
 * ölçüm ve duman kapısı yapar). Burada ölçülen şey BİLEŞEN SÖZLEŞMESİ: veri verildiğinde
 * tıklanabilir kategori kapısı çıkıyor mu.
 */

function kategoriler(): CategoryViewModelLite[] {
  return [
    { id: 'k1', slug: 'fanlar', displayName: 'Fanlar', description: 'Fan ailesi', image_url: null },
    { id: 'k2', slug: 'hava-perdeleri', displayName: 'Hava Perdeleri', description: '', image_url: null },
  ]
}

function ciz(veri: CategoryViewModelLite[], lang: Lang = 'tr') {
  return render(
    <I18nProvider lang={lang}>
      <GuidedCategoryDiscovery
        displayCategories={veri}
        eyebrowKey={null}
        headingKey="products.popularCategories"
        introKey={null}
      />
    </I18nProvider>
  )
}

/**
 * Yorumları ayıklar; tripwire YALNIZ kodu ölçsün diye.
 *
 * `(^|[^:])` öneki ZORUNLU: onsuz `https://…` içindeki `//` yorum sanılır, satırın
 * geri kalanı silinir ve tarama SESSİZCE körleşir (bu depoda yaşandı, INV-SCRUB-1).
 */
function yorumsuz(kaynak: string): string {
  return kaynak
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

/** Kategori bloğunu sayfanın geri kalanından ayırır (blok `id="categories"` taşır). */
function blok(): HTMLElement {
  const el = document.getElementById('categories')
  if (!el) throw new Error('Kategori blogu hic cizilmedi — id="categories" bulunamadi.')
  return el
}

describe('INV-URUNLER-KATEGORI-1 — Ürünler sayfasının kategori kapısı', () => {
  it('K1 · SABOTAJ HEDEFİ — her kategori için TIKLANABİLİR /category/ bağlantısı üretir', () => {
    ciz(kategoriler())
    const icinde = within(blok())

    const baglantilar = icinde.getAllByRole('link')
    expect(
      baglantilar.length,
      'Kategori kartlari bagalanti uretmiyor — /products sayfasindan kategori agacina gecis YOK (canlida 2026-09-07 durumu)'
    ).toBe(2)

    const adresler = baglantilar.map((a) => a.getAttribute('href'))
    expect(adresler).toEqual(['/tr/category/fanlar', '/tr/category/hava-perdeleri'])
  })

  it('K2 · başlık SÖZLÜKTEN gelir — ham anahtar basmaz (kural 7)', () => {
    ciz(kategoriler())
    const baslik = within(blok()).getByRole('heading', { level: 2 })

    // `getDictValue` NESTED-ONLY: anahtar çözülemezse HAM ANAHTARI basar ve hiçbir
    // statik kapı bunu görmez. Bu kol tam o hâli yakalar.
    expect(baslik.textContent).toBe('Popüler Kategoriler')
    expect(baslik.textContent).not.toContain('products.')
  })

  it('K3 · İngilizce sayfada adres ÖNEKİ ve başlık dile göre kurulur (elle /tr/ yazılmaz)', () => {
    ciz(kategoriler(), 'en')
    const icinde = within(blok())

    expect(icinde.getAllByRole('link')[0].getAttribute('href')).toBe('/en/category/fanlar')
    expect(icinde.getByRole('heading', { level: 2 }).textContent).toBe('Popular Categories')
  })

  it('K4 · AYIRT EDİCİ — kategori yoksa hiç bağlantı üretmez (boş başlık bırakmaz)', () => {
    // Sayfa tarafı bu hâlde bloğu HİÇ çizmiyor; bileşen tek başına çizilse de
    // uyduruk bağlantı üretmediğini burada kilitliyoruz. Ayırt etmeyen bir kapı
    // ölçüm değildir: K1 iki bağlantı bekliyorsa, bu kol sıfır beklemeli.
    ciz([])
    expect(within(blok()).queryAllByRole('link')).toHaveLength(0)
  })

  /**
   * ⭐K5 — ASIL SABOTAJ HEDEFİ: BAĞLANTI (wiring).
   *
   * NİÇİN AYRI KOL (kendi hatamdan doğdu): K1–K4 bileşeni TEK BAŞINA ölçüyor. Kapıyı ilk
   * yazdığımda sabotaj denemesi yaptım — `/products` görünümündeki bloğu `false &&` ile
   * kapattım ve kapı YEŞİL KALDI. Yani kapı bileşen sözleşmesini tutuyordu ama sayfanın o
   * bileşeni gerçekten çizdiğini HİÇ ölçmüyordu. Ölçüt keskin, evren yanlış.
   *
   * Bu kol keşif görünümünü GERÇEKTEN çizer: kategori verildiğinde blok çıkmalı.
   */
  it('K5 · SABOTAJ HEDEFİ — keşif görünümü kategori verilince bloğu GERÇEKTEN çizer', () => {
    render(
      <I18nProvider lang="tr">
        <ProductsDiscoveryView kategoriler={kategoriler()} families={[]} total={0} />
      </I18nProvider>
    )

    const icinde = within(blok())
    expect(
      icinde.getAllByRole('link').map((a) => a.getAttribute('href')),
      'Kesif gorunumu kategori blogunu cizmiyor — /products sayfasindan kategori agacina gecis YOK'
    ).toEqual(['/tr/category/fanlar', '/tr/category/hava-perdeleri'])
  })

  it('K6 · AYIRT EDİCİ — keşif görünümü kategori YOKKEN bloğu hiç çizmez', () => {
    render(
      <I18nProvider lang="tr">
        <ProductsDiscoveryView families={[]} total={0} />
      </I18nProvider>
    )
    expect(
      document.getElementById('categories'),
      'Kategori yokken bos baslik birakiliyor — 3D kutusunun dustugu tuzagin aynisi'
    ).toBeNull()
  })

  /**
   * K7 — TRİPWIRE: veriyi taşıyan ZİNCİR yerinde mi?
   *
   * SINIRI ADIYLA: K5 keşif görünümünü gerçekten çizer ama zincirin yalnız SON halkasını
   * ölçer. Veri şu yoldan geliyor:
   *   `app/[lang]/products/page.tsx` → `CategoryMasterView` → `ProductsDiscoveryView`
   * Aradaki iki halkadan biri koparsa K5 yine yeşil kalır (denedim: `CategoryMasterView`
   * prop'u geçirmeyi bıraktığında kapı görmedi). Bu kol o iki halkayı kaynaktan tutar.
   *
   * Tripwire "var mı" der, "doğru çalışıyor mu" demez — asıl hüküm K5'te. Ölçüm YORUMSUZ
   * metin üzerinde yapılır: bir kapının kendi gerekçe yorumunu kod sanması bu depoda iki kez
   * yaşandı ve tersi (yorumdaki desenin kapıyı YEŞİL yapması) daha tehlikelidir.
   */
  it('K7 · TRİPWIRE — sayfa ve ana görünüm `kategoriler` prop\'unu ZİNCİR boyunca geçirir', () => {
    const kok = path.resolve(__dirname, '../../..')
    const halkalar = [
      'src/app/[lang]/products/page.tsx',
      'src/views/CategoryMasterView.tsx',
    ]

    for (const rel of halkalar) {
      const kod = yorumsuz(fs.readFileSync(path.join(kok, rel), 'utf8'))
      expect(
        /kategoriler=\{/.test(kod),
        `${rel} artik \`kategoriler\` prop'unu gecirmiyor — zincir koptu, /products sayfasi ` +
          'kategorisiz kalir ve K5 bunu GORMEZ (son halkayi olcuyor).'
      ).toBe(true)
    }
  })

  it('K8 · SOĞUK OKUYUCU — ana sayfanın başlıkları DEĞİŞMEDEN duruyor (varsayılanlar)', () => {
    // Aynı bileşen iki sayfada. Varsayılan anahtarlar ana sayfanınki olduğu için
    // ana sayfa bu işten etkilenmemeli; etkilenirse burada görünür.
    render(
      <I18nProvider lang="tr">
        <GuidedCategoryDiscovery displayCategories={kategoriler()} />
      </I18nProvider>
    )
    const icinde = within(blok())
    // Başlık ana sayfanın kendi cümlesi olmalı — products'ınki DEĞİL.
    expect(icinde.getByRole('heading', { level: 2 }).textContent).toBe('Hava Akışının Mühendislik Estetiği')
    // Göz satırı ve giriş cümlesi ana sayfada ÇİZİLİR (products'ta `null` geçilip susturuluyor).
    // Bu iki satır olmadan kol boş bir iddiaya döner: "bir şeyler var" ölçüm değildir.
    expect(icinde.getByText('DETERMİNİSTİK SİSTEMLER')).toBeInTheDocument()
    expect(
      icinde.getByText('VentHub kürasyonu ile endüstriyel standartlarda havalandırma çözümlerini keşfedin.')
    ).toBeInTheDocument()
  })
})
