import { describe, expect, it } from 'vitest'

/**
 * INV-ADMIN-SHELL-1/2 · Admin kabuk değişmezleri (kalıcı bekçi).
 *
 * Cetvel: `docs/standards/admin-design-standard.md` §2.
 *
 * 2026-08-15 denetiminde ölçülen ve bu testin GERİ GELMESİNİ engellediği kusurlar:
 *
 *  D1  Üç kat iç içe tam-ekran kabuk (`min-h-screen` > `h-screen`+`overflow-hidden`
 *      > `h-screen`) → kalıcı iki scrollbar, footer katlanın altında.
 *  D3  Kökte `overflow-hidden` → %400 zoom'da kaçış scroll'u yok (WCAG SC 1.4.10,
 *      Level AA; `overflow:hidden` failure tekniği F69'da birebir adlandırılmış).
 *  D4  Sidebar kökünde açık genişlik + `-translate-x-full` → collapse layout'u
 *      daraltmıyor, 280px ölü sütun kalıyor.
 *  D6  Kapalı menü yalnız `translate` ile gizlenmiş → hâlâ Tab ile geziliyor.
 *  D9  `aria-current` yok → ekran okuyucu konumu bildirmiyor.
 * D11  `<Toaster/>` admin ağacında mount edilmemiş → 127 `toast.*` çağrısı ölü.
 *
 * Bu sınıfı mevcut hiçbir kapı yakalamaz: tsc geçerli tip görür, lint sözdizimi
 * temiz bulur, birim testleri layout'u hiç render etmez (denetimde `AdminLayout`
 * için TEK bir test dosyası yoktu), `next build` de hata vermez. Kusur yalnız
 * tarayıcıda ve yalnız gözle fark edilir — o yüzden statik değişmez olarak kilitlenir.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/**
 * Kabuk zinciri: admin sayfalarını saran ve tam-ekran yükseklik kurabilecek dosyalar.
 * Tam-literal yollar (glob değil) — `conformance-test-static-scan-gotchas` dersi:
 * kök glob'u yanlış yazmak testi sessizce boş kümeye düşürür.
 */
const SHELL_CHAIN = [
  '/src/views/admin/AdminLayout.tsx',
  '/src/app/admin/layout.tsx',
  '/src/components/admin/shell/AdminSidebar.tsx',
  '/src/views/admin/CategoryBuilderView.tsx',
] as const

/**
 * Scroll SAHİPLİĞİ zinciri — kırpma yasağı yalnız buraya uygulanır.
 * `CategoryBuilderView` kasten dışarıda: içinde meşru bir kırpma var (cihaz
 * önizleme çerçevesi). Kök elemanı ayrıca aşağıda tek tek denetleniyor.
 * Muafiyet ADLA yazılır, sessiz geçilmez.
 */
const SCROLL_OWNER_CHAIN = [
  '/src/views/admin/AdminLayout.tsx',
  '/src/app/admin/layout.tsx',
  '/src/components/admin/shell/AdminSidebar.tsx',
] as const

function read(path: string): string {
  const source = SOURCES[path]
  if (source === undefined) {
    throw new Error(
      `Kabuk zinciri dosyası bulunamadı: ${path}. Dosya taşındıysa SHELL_CHAIN'i güncelle — ` +
        'sessizce atlanması bu invariant\'ı devre dışı bırakır (stale-guard).',
    )
  }
  return source
}

/** JSX className içinde geçen sınıf adlarını kabaca yakalar (yorum satırları hariç). */
function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n')
}

describe('INV-ADMIN-SHELL-1 · kabuk scroll sahipliği', () => {
  it('kabuk zincirindeki her dosya diskte var (stale-guard)', () => {
    for (const path of SHELL_CHAIN) {
      expect(() => read(path), `${path} okunamadı`).not.toThrow()
    }
  })

  it.each(SHELL_CHAIN)('%s viewport-yüksekliği kilidi kurmuyor', (path) => {
    const source = withoutComments(read(path))

    // `h-screen` / `min-h-screen` = 100vh. MDN: `vh` ≡ `lvh`, yani "araç çubuğu
    // gizliyken" — kutu daima taşar. Kabukta `svh` kullanılır (§2.2).
    expect(source, `${path}: h-screen yasak → min-h-svh kullan (cetvel §2.2)`).not.toMatch(
      /className[^\n]*\bh-screen\b/,
    )
    expect(
      source,
      `${path}: min-h-screen yasak → min-h-svh kullan (cetvel §2.2)`,
    ).not.toMatch(/className[^\n]*\bmin-h-screen\b/)

    // `dvh` de varsayılan DEĞİL: MDN, scroll sırasında yeniden düzen ürettiğini ve
    // performans kaybına yol açtığını açıkça yazıyor. Kabukta `svh` (§2.2).
    expect(source, `${path}: kabukta dvh yerine svh kullan (cetvel §2.2)`).not.toMatch(
      /className[^\n]*\b(?:min-)?h-dvh\b/,
    )
  })

  it.each(SCROLL_OWNER_CHAIN)('%s kaçış scroll\'unu kesmiyor (overflow-hidden yok)', (path) => {
    const source = withoutComments(read(path))
    // WCAG F69: `overflow: hidden` metin büyütüldüğünde kırpılmanın birebir
    // adlandırılmış sebebi. Scroll sahipliği zincirinde yasak (§2.1, §2.3).
    expect(
      source,
      `${path}: scroll sahipliği zincirinde overflow-hidden yasak — %400 zoom'da içerik kırpılır (WCAG F69, SC 1.4.10)`,
    ).not.toMatch(/className[^\n]*\boverflow-hidden\b/)
  })

  it('CategoryBuilderView kök elemanında kırpma kurmuyor', () => {
    /**
     * ADLANDIRILMIŞ MUAFİYET: builder, `SCROLL_OWNER_CHAIN`'in dışındadır çünkü
     * içinde MEŞRU bir kırpma var — cihaz önizleme çerçevesi (mobil mockup) kasten
     * `overflow-hidden` ile kırpar. Yasak *scroll sahipliği* içindir, sayfa içindeki
     * her kutu için değil. Bu yüzden burada yalnız KÖK elemanı denetliyoruz:
     * builder kendi tam-ekran kabuğunu kurmamalı (D1).
     */
    const source = withoutComments(read('/src/views/admin/CategoryBuilderView.tsx'))
    const rootMatch = source.match(/return\s*\(\s*<div className="([^"]*)"/)
    expect(rootMatch, 'CategoryBuilderView kök <div> className bulunamadı').not.toBeNull()
    const rootClasses = rootMatch?.[1] ?? ''
    expect(
      rootClasses,
      'Builder kök elemanı overflow-hidden kurmamalı (cetvel §2.1)',
    ).not.toMatch(/\boverflow-hidden\b/)
    expect(
      rootClasses,
      'Builder kök elemanı viewport yüksekliği kilidi kurmamalı (cetvel §2.1)',
    ).not.toMatch(/\b(?:min-)?h-screen\b/)
  })

  it('admin kabuğu tek tam-ekran katman kurar', () => {
    // `MainLayout` admin dalı hiçbir kabuk sarmalamamalı; aksi halde D1 geri gelir.
    const mainLayout = withoutComments(read('/src/components/layout/MainLayout.tsx'))
    const adminBranch = mainLayout.match(/if\s*\(isAdmin\)\s*\{[\s\S]*?\n\s{4}\}/)
    expect(adminBranch, 'MainLayout içinde isAdmin dalı bulunamadı').not.toBeNull()
    expect(
      adminBranch?.[0],
      'MainLayout admin dalı kendi kabuğunu kurmamalı — AdminLayout tek kabuktur (cetvel §2.1)',
    ).not.toMatch(/\b(?:min-)?h-screen\b|\boverflow-auto\b/)
  })
})

describe('INV-ADMIN-SHELL-2 · sol navigasyon değişmezleri', () => {
  const sidebar = () => withoutComments(read('/src/components/admin/shell/AdminSidebar.tsx'))

  it('collapse layout kutusunu daraltır (gap + fixed deseni)', () => {
    const source = sidebar()
    // Daralan yer tutucu AKIŞTA ve genişliği duruma göre değişiyor olmalı.
    expect(
      source,
      'Sidebar rail genişliği token\'ı (w-admin-rail) bulunamadı — collapse layout\'u daraltmıyor olabilir (cetvel §2.4)',
    ).toMatch(/w-admin-rail/)
    expect(source, 'Sidebar açık genişlik token\'ı (w-admin-nav) bulunamadı').toMatch(
      /w-admin-nav/,
    )
    // Görünen panel akıştan çıkmalı, yoksa iki kutu birden yer tutar.
    expect(source, 'Görünen panel `fixed` olmalı (cetvel §2.4)').toMatch(
      /className[^\n]*\bfixed\b/,
    )
  })

  it('gizleme yalnız transform ile yapılmıyor', () => {
    // D4/D6: `-translate-x-full` görsel bir hiledir — kutu yer tutmaya, linkler
    // Tab sırasında kalmaya devam eder. Kapatma ya layout genişliğini 0'a indirmeli
    // ya da içeriği unmount etmelidir.
    expect(
      sidebar(),
      'Sidebar gizlemede -translate-x-full YASAK: layout kutusu durur ve linkler Tab ile gezilmeye devam eder (cetvel §2.4, §2.5)',
    ).not.toMatch(/-translate-x-full/)
  })

  it('aktif öğe aria-current="page" taşır', () => {
    expect(
      sidebar(),
      'Aktif nav öğesinde aria-current="page" zorunlu (MDN: yalnız BİR öğe) — cetvel §2.6',
    ).toMatch(/aria-current=\{[^}]*'page'/)
  })

  it('mobil drawer Overlay ile birlikte render edilir (body scroll lock)', () => {
    // Radix'te body scroll lock `<Dialog.Overlay>` içindedir; Overlay çıkarılırsa
    // kilit SESSİZCE kaybolur (lokal dist doğrulaması, cetvel §2.5).
    expect(
      sidebar(),
      'Dialog.Overlay ASLA çıkarılmaz — body scroll lock oradadır (cetvel §2.5)',
    ).toMatch(/Dialog\.Overlay/)
  })

  it('mobil drawer aria-modal taşır (Radix basmıyor)', () => {
    // Radix Dialog `aria-modal` BASMIYOR (dist grep'lendi) → elle verilmeli.
    expect(
      sidebar(),
      'Radix aria-modal basmaz, elle eklenmeli (cetvel §2.5)',
    ).toMatch(/aria-modal="true"/)
  })

  it('navigasyon RBAC ile filtrelenir (yetkisiz link listelenmez)', () => {
    expect(
      sidebar(),
      'Nav öğeleri canAccess ile filtrelenmeli — görünür link + AccessDenied duvarı kabul edilemez (cetvel §2.4)',
    ).toMatch(/canAccess\(/)
  })
})

describe('INV-ADMIN-SHELL-2 · kabuk sorumlulukları', () => {
  const layout = () => withoutComments(read('/src/views/admin/AdminLayout.tsx'))

  it('skip-link sunar (WCAG SC 2.4.1, Level A)', () => {
    // Kalıcı sol nav "tekrarlanan blok"tur; atlama yolu kabuğun sorumluluğudur.
    const source = layout()
    expect(source, 'Ana içeriğe atlama linki zorunlu (SC 2.4.1) — cetvel §2.6').toMatch(
      /href="#admin-main"/,
    )
    expect(source, 'Atlama hedefi id="admin-main" bulunamadı').toMatch(/id="admin-main"/)
  })

  it('Toaster admin ağacında mount edilir', () => {
    // D11: mount edilmediği için 127 `toast.*` çağrısı sessizce ölüydü ve geri
    // bildirim `alert()`'e kaçmıştı.
    expect(
      layout(),
      'Admin kabuğu <Toaster/> mount etmeli — yoksa tüm toast çağrıları sessizce ölür (cetvel §4.6)',
    ).toMatch(/<Toaster\b/)
  })

  /**
   * KABUK İŞLEV ENVANTERİ — sessiz işlev kaybına karşı.
   *
   * Kabuk v2 yazılırken `MainLayout`'un admin çubuğu kaldırıldı; içindeki
   * "siteye dön" linki ve `AdminLayout`'un footer'ı da onunla birlikte düştü.
   * Lint bunları "kullanılmayan import" diye raporladı, yani kayıp KULLANICI
   * TARAFINDAN bildirilene kadar hiçbir kapıya takılmadı.
   *
   * Aşağıdaki liste kabuğun sunmak ZORUNDA olduğu kullanıcı yüzeyleridir.
   * Kabuk yeniden düzenlenirse bu test kırılır ve kayıp merge öncesi görülür.
   */
  it.each([
    ['admin.common.copyright', 'admin footer telif satırı'],
    ['admin.common.secureNode', 'admin footer güvenli-düğüm rozeti'],
    ['header.adminBar.backToSite', 'vitrine dönüş linki (admin\'den çıkmanın TEK yolu)'],
    ['admin.a11y.skipToContent', 'içeriğe atlama linki'],
  ])('kabuk %s sunar (%s)', (key) => {
    expect(
      layout(),
      `Kabuk "${key}" anahtarını kullanmalı — bu bir KULLANICI YÜZEYİ, sessizce düşmemeli`,
    ).toContain(key)
  })

  it('vitrine dönüş linki lokalize rota üreticisinden geçer', () => {
    // Kural 7: manuel `/tr/` öneki yasak; URL `useLocalizedRoutes` ile üretilir.
    expect(layout(), 'Siteye dönüş linki useLocalizedRoutes ile üretilmeli (kural 7)').toMatch(
      /useLocalizedRoutes/,
    )
  })

  it('nav tetikleyicileri aria-expanded + aria-controls taşır', () => {
    const source = layout()
    expect(source, 'Nav tetikleyicisinde aria-expanded zorunlu (cetvel §2.5)').toMatch(
      /aria-expanded=/,
    )
    expect(source, 'Nav tetikleyicisinde aria-controls zorunlu (cetvel §2.5)').toMatch(
      /aria-controls=/,
    )
  })

  it('nav tercihi çerezde saklanır (localStorage değil)', () => {
    const source = layout()
    expect(
      source,
      'Nav durumu çerezde saklanmalı — localStorage sunucuda okunamaz, SSR yanlış varsayılanı render eder (cetvel §2.4)',
    ).toMatch(/document\.cookie/)
    expect(
      source,
      'Nav durumu için localStorage kullanma (SSR\'da okunamaz) — cetvel §2.4',
    ).not.toMatch(/localStorage/)
  })

  it('sunucu tarafı çerezi GERÇEKTEN okur (yazılıp okunmayan tercih = sessiz kayıp)', () => {
    // shadcn/ui dokümanından bu okuma adımı kaldırıldığı için sık düşülen tuzak:
    // çerez yazılır, hiç okunmaz, kalıcılık sessizce çalışmaz.
    const rsc = withoutComments(read('/src/app/admin/layout.tsx'))
    expect(rsc, 'RSC layout çerezi okumalı (cetvel §2.4)').toMatch(/cookies\(\)/)
    expect(rsc, 'Okunan çerez AdminLayout\'a geçirilmeli').toMatch(/defaultNavCollapsed/)
  })
})
