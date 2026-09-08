import fs from 'node:fs'
import path from 'node:path'

import { render, within } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { BrandIcon } from '@/components/HVACIcons'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { I18nProvider, type Lang } from '@/i18n/I18nProvider'

/**
 * INV-VITRIN-A11Y-1 — vitrinde iki erişilebilirlik kusur SINIFI geri gelemez:
 *   (a) marka logosu, yanında zaten yazan adı İKİNCİ KEZ okutamaz (WCAG 1.1.1)
 *   (b) bir düğmenin erişilebilir adı, GÖRÜNEN yazısını içermek zorundadır (WCAG 2.5.3)
 *
 * NİÇİN (REC-268). Ölçüm: `npx lighthouse --only-categories=accessibility`, master'ın YEREL
 * ÜRETİM DERLEMESİ üzerinde, 2026-09-08. Taban 96/100 ve üç kırmızı: `color-contrast` (1),
 * `image-redundant-alt` (15), `label-content-name-mismatch` (2). Onarım sonrası aynı ölçüm
 * **100/100, kırmızı 0**.
 *
 * ⭐ÖLÇÜM CANLIDA DEĞİL YERELDE ALINDI, ve bu bilinçli bir SAPMADIR: kaydın tabanı canlı
 * anasayfada ölçülmüştü, ama canlı o gün Vercel kota kilidi yüzünden master'ın GERİSİNDEYDİ.
 * Canlıyı ölçmek "ölçüt keskin, evren yanlış" olurdu — zaten onarılmış bir kusuru açık sanmak
 * ya da kalan kırmızıları yanlış işe mal etmek. (Ölçüm sırasında bu tuzağa BİR KEZ daha
 * yaklaşıldı: eski sunucu süreci portu tutmaya devam ediyordu, yani tarama ESKİ derlemeyi
 * ölçecekti; süreç kapatıldı ve tarama öncesi yeni sınıfın servis edilen HTML'de olduğu
 * doğrulandı.) Canlı ölçüm, kilit açılıp #1114 yayına çıkınca AYRICA yapılacak.
 *
 * ── BU KAPININ SINIRI, ADIYLA ──
 * ⚠`color-contrast` BURADA ÖLÇÜLMEZ. jsdom düzen ve boyama yapmaz; renk kontrastı gerçek
 * render ister. Üçüncü kırmızının koruması bu dosyada DEĞİL, iki ayrı yerdedir: stil mandalı
 * (ham `slate-*` sayacı, tavan 1457→1456 indirildi) ve yukarıdaki Lighthouse ölçümü. Bu kapı
 * yeşilken bile bir kontrast kusuru doğabilir — o yüzden bunu susarak geçmiyorum.
 */

// Yönlendirici sahtelenir: bu kapının konusu gezinme değil, etiket/görsel.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/tr',
}))

function saglayiciyla(ui: React.ReactElement, lang: Lang = 'tr') {
  return render(<I18nProvider lang={lang}>{ui}</I18nProvider>)
}

/**
 * GERÇEK ÇAĞRI DESENİ: logo + hemen yanında ADIN KENDİSİ yazı olarak, tek bağlantı içinde.
 * `image-redundant-alt` tam bu komşuluktan doğar; deseni bozarsam kapı kusuru göremez.
 * Bileşen SAHTELENMEZ — ölçtüğüm şey gerçek `BrandIcon`ın davranışıdır.
 */
function MarkaKarti({ dekoratif }: { dekoratif: boolean }) {
  // `href` BİLEREK bir sayfa adresi DEĞİL. İlk yazılışta `/tr/brands/vortice` yazmıştım ve
  // `next/no-html-link-for-pages` haklı olarak kırmızı verdi: sayfa adresine `<a>` ile
  // gidilmez, `next/link` kullanılır. Burada `next/link` getirmek ölçümü zenginleştirmez —
  // `image-redundant-alt` kuralı bağlantının HEDEFİNE bakmaz, yalnız görselin `alt` metniyle
  // komşu yazının aynı olup olmadığına bakar. Yani hedefi değiştirmek deseni bozmuyor,
  // yalnız gerçek bir yönlendirme taklidi yapmaktan vazgeçiyor.
  return (
    <a href="#marka">
      <BrandIcon brand="Vortice" dekoratif={dekoratif} />
      <span>Vortice</span>
    </a>
  )
}

describe('INV-VITRIN-A11Y-1 — mükerrer alt metni ve etiket/ad uyuşmazlığı geri gelemez', () => {
  it('K1 (ön-koşul) — güvenli VARSAYILAN bozulmamış: `dekoratif` geçilmezse ad OKUNUR', () => {
    // Bu kol kuralın TERSİNİ korur ve bilerek vardır: `alt=""` sessiz bir varsayılan olsaydı,
    // yarın adı yazıyla göstermeyen bir çağıran eklendiğinde o logo ekran okuyucuya GÖRÜNMEZ
    // olurdu ve hiçbir kapı bunu yakalamazdı. Varsayılan "oku", dekoratiflik AÇIK BEYANDIR.
    const { container } = render(<BrandIcon brand="Vortice" />)
    const img = container.querySelector('img')
    expect(img, 'marka görseli hiç çizilmedi — evren boş, aşağıdaki kollar anlamsız olurdu').not.toBeNull()
    expect(img?.getAttribute('alt')).toBe('Vortice')
  })

  it('K2 (kural) — `dekoratif` geçilince görsel erişilebilirlik ağacından çıkar', () => {
    const { container } = render(<BrandIcon brand="Vortice" dekoratif />)
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('')
  })

  it('K3 (ayırt edicilik) — axe kusurlu deseni GERÇEKTEN yakalıyor, kapı boş değil', async () => {
    // ⭐BU KOL KAPININ KENDİSİNİ SINAR. K4 yeşilse sebebi "kusur yok" olabileceği gibi
    // "axe bu kuralı jsdom'da hiç çalıştırmıyor" da olabilir — ikisi dışarıdan AYNI görünür.
    // Burada kusur BİLEREK üretilir; axe onu görmezse bu kapı boş bir tören demektir.
    const { container } = render(<MarkaKarti dekoratif={false} />)
    const sonuc = await axe(container, { runOnly: ['image-redundant-alt'] })
    const kimlikler = (sonuc.violations ?? []).map((v) => v.id)
    expect(
      kimlikler,
      'axe, mükerrer alt metnini jsdom ortamında YAKALAYAMIYOR. O hâlde K4 hiçbir şey ' +
        'kanıtlamaz ve bu dosya kaldırılmalı ya da kural başka bir yolla ölçülmelidir.',
    ).toContain('image-redundant-alt')
  })

  it('K4 (kural) — gerçek desen `dekoratif` ile ihlal ÜRETMEZ', async () => {
    const { container } = render(<MarkaKarti dekoratif />)
    const sonuc = await axe(container, { runOnly: ['image-redundant-alt'] })
    expect((sonuc.violations ?? []).map((v) => v.id)).toEqual([])
  })

  it('K5 (kapsam) — HER `BrandIcon` çağrısı dekoratifliğini AÇIKÇA beyan eder', () => {
    // K2/K4 bileşenin sözleşmesini ölçer; bu kol ÇAĞIRANLARI ölçer. İkisi ayrı sorulardır:
    // sözleşme doğruyken bir çağıranın `dekoratif` geçmeyi unutması, kusuru geri getirir.
    const kok = path.join(process.cwd(), 'src')
    const dosyalar: string[] = []
    const gez = (d: string) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name)
        if (e.isDirectory()) gez(p)
        else if (/\.tsx$/.test(e.name)) dosyalar.push(p)
      }
    }
    gez(kok)
    expect(dosyalar.length, 'kaynak evreni boş — tarama deseni bozuk').toBeGreaterThan(100)

    // ⚖MUAFİYET LİSTESİ — adıyla ve GEREKÇESİYLE.
    //
    // ⭐BU LİSTE BU KOLUN İLK KOŞUMUNDA DOĞDU: kapı, elle bulduğum dört çağrının ÜSTÜNE
    // dört tane daha buldu. Üçünde ad zaten yazıyla vardı (BrandDetailPage h1 · BrandsPage
    // h2 · CartPage "marka • sku") ve `dekoratif` geçtiler. Dördüncüsü FARKLI çıktı ve
    // muafiyetin sebebi tam olarak budur:
    //
    //   `views/AboutPage.tsx` — "markalarımız" logo şeridi. Burada marka adı HİÇBİR YERDE
    //   yazıyla geçmiyor; logonun `alt` metni o markanın TEK erişilebilir izidir. Dekoratif
    //   saymak, ekran okuyucu kullanan birine markaları GÖRÜNMEZ yapardı — yani mükerrer
    //   okumayı çözerken bilgiyi tamamen silerdi.
    //
    // Bu vaka, `dekoratif` varsayılanının niçin `false` bırakıldığının kanıtıdır: sessiz bir
    // `alt=""` varsayılanı bu sayfayı hiçbir uyarı vermeden sessizleştirirdi.
    const MUAF: string[] = ['views/AboutPage.tsx']

    const ihlaller: string[] = []
    for (const p of dosyalar) {
      const bagil = path.relative(kok, p).replace(/\\/g, '/')
      if (MUAF.includes(bagil)) continue
      // Bu kapının kendi dosyası: kusurlu deseni BİLEREK kuruyor (K3), o yüzden hariç.
      if (bagil.endsWith('vitrin-a11y-etiket-gorsel.test.tsx')) continue
      const kaynak = fs.readFileSync(p, 'utf8')
      for (const m of kaynak.matchAll(/<BrandIcon\b[^>]*>/g)) {
        if (!/\bdekoratif\b/.test(m[0])) ihlaller.push(`${bagil}: ${m[0].slice(0, 80)}`)
      }
    }
    expect(
      ihlaller,
      '`BrandIcon` çağrısı dekoratifliğini beyan etmiyor. Adı yanında YAZIYORSA `dekoratif` ' +
        'geç; YAZMIYORSA muafiyet listesine gerekçesiyle ekle. Sessiz geçiş, mükerrer okumayı ' +
        'geri getirir (REC-268).',
    ).toEqual([])
  })

  it('K6 (kural) — dil düğmesinin erişilebilir ADI, GÖRÜNEN yazısını içerir', () => {
    // WCAG 2.5.3. Bedeli somut: sesle komut veren kullanıcı ekranda gördüğü "TR"yi söyler;
    // erişilebilir ad yalnız "Türkçe" ise düğme BULUNAMAZ.
    const { container } = saglayiciyla(<LanguageSwitcher />)
    const dugmeler = within(container).getAllByRole('button')
    expect(dugmeler.length, 'dil düğmeleri çizilmedi — evren boş').toBeGreaterThanOrEqual(2)

    for (const d of dugmeler) {
      const gorunen = (d.textContent ?? '').trim()
      const ad = d.getAttribute('aria-label') ?? ''
      expect(gorunen.length, 'düğmenin görünen yazısı yok').toBeGreaterThan(0)
      expect(
        ad.includes(gorunen),
        `Erişilebilir ad görünen yazıyı içermiyor: görünen="${gorunen}" ad="${ad}"`,
      ).toBe(true)
    }
  })
})
