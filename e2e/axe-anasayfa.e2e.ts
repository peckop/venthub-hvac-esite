import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

/**
 * INV-AXE-1 — ana sayfa (TR, 390 px) gerçek tarayıcıda axe taramasından GEÇMELİ; ihlal tabanı sabit.
 *
 * NİÇİN VAR (ALT-31, TASARIM M8 ön koşulu · cetvel docs/plans/tasarim-kod-plani-v2.2-2026-10-05.md §7)
 * jsdom'da axe `color-contrast` kuralını KOŞAMAZ ve `index.css` yüklenmez (bkz.
 * `marka-palet-tokenlari.test.ts` başlığı): "vitest-axe yeşil" kontrastı doğrulamaz. Gerçek tarayıcıdaki
 * bu tarama o boşluğu kapatır. `@axe-core/playwright` bu dosyanın var olma sebebidir (kullanılmayan
 * bağımlılık eklenmez, kural 14).
 *
 * TABAN YAKLAŞIMI: bugünkü ihlaller `TABAN`'a yazıldı (kural kimliği → en çok düğüm). Yeni bir kural
 * kimliği ya da bir kuralın düğüm sayısının artması KIRMIZI verir; azalma yeşil kalır (tavan ratchet:
 * iyileşince `TABAN` elle sıkılır). Sıfır ihlal hedefi TASARIM Faz 2a'nın işidir.
 *
 * ENSTRÜMAN KANITI (reflow.e2e.ts ile aynı ilke): ikinci test sayfaya KASITLI olarak alt metni olmayan
 * bir görsel enjekte eder; axe bunu `image-alt` olarak GÖREMEZSE tarama "ölçülemedi" diye kırmızıdır.
 * Yani tarama sessizce hep-yeşil olamaz.
 */

/**
 * Ölçüm 2026-10-05, `https://venthub.com.tr/tr`, 390x844: **0 ihlal**, 26 kural geçti. Taban BOŞ, yani bugün
 * her yeni ihlal kırmızıdır. ⚠Dürüstlük notu: `color-contrast` bu sayfada 23 düğümde `incomplete`
 * (axe karar veremedi: görsel/gradyan arka plan); bu "geçti" değildir ve bu kapının görmediği alandır,
 * elle/PageSpeed ölçümüne kalır. Kural kimliği → en çok düğüm.
 */
const TABAN: Readonly<Record<string, number>> = {}

/**
 * `color-contrast` incomplete düğüm sayısı tavanı (OPS şartı, 2026-10-05). Yalnız AZALABİLİR.
 * Ölçüm: canlıda ilk koşu 23, sonraki beş koşu kararlı 17 (yayın arası fark); tavan 23 CI/canlı farkına pay
 * bırakır. İlk CI okumasından sonra gerçek değere sıkılır. Sabotaj: 10 görsel arka planlı metin → 27, kırmızı.
 */
const BELIRSIZ_KONTRAST_TABAN = 23

const ETIKETLER = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const

async function ac(page: Page): Promise<void> {
  await page.setViewportSize({ width: 390, height: 844 })
  const res = await page.goto('/tr', { waitUntil: 'networkidle' })
  // Uygulama gerçekliği: koruma/hata sayfası değil, bizim sayfamız (html[lang] + gövde içeriği).
  expect(res?.status(), '/tr HTTP durumu').toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr')
  await expect(page.locator('main, [role="main"]').first()).toBeVisible()
}

test.describe('INV-AXE-1 — ana sayfa TR 390px axe taraması', () => {
  test('ihlal tabanı aşılmadı', async ({ page }, testInfo) => {
    await ac(page)
    const sonuc = await new AxeBuilder({ page }).withTags([...ETIKETLER]).analyze()
    const bulunan = Object.fromEntries(sonuc.violations.map((v) => [v.id, v.nodes.length]))
    testInfo.annotations.push({
      type: 'ihlaller',
      description: JSON.stringify(bulunan),
    })

    const yeni = Object.keys(bulunan).filter((id) => !(id in TABAN))
    const artan = Object.entries(bulunan)
      .filter(([id, n]) => id in TABAN && n > TABAN[id])
      .map(([id, n]) => `${id}: ${n} > taban ${TABAN[id]}`)
    expect(yeni, `TABANDA olmayan yeni axe kuralı ihlali: ${yeni.join(', ')}`).toEqual([])
    expect(artan, `taban aşıldı: ${artan.join(' | ')}`).toEqual([])

    // "Karar verilemedi" (incomplete) color-contrast düğümleri: geçti DEĞİL, görülmeyen alan. Sayı artarsa
    // (yeni gradyan/görsel arka plan üstü metin) kırmızı; azalırsa tabanı düşürme notu çıkar (OPS şartı, 10-05).
    const belirsiz = sonuc.incomplete.find((v) => v.id === 'color-contrast')?.nodes.length ?? 0
    testInfo.annotations.push({ type: 'color-contrast-incomplete', description: String(belirsiz) })
    if (belirsiz < BELIRSIZ_KONTRAST_TABAN) {
      console.warn(
        `NOT: color-contrast incomplete ${belirsiz} < taban ${BELIRSIZ_KONTRAST_TABAN}; ` +
          'BELIRSIZ_KONTRAST_TABAN sabitini düşür (tavan sıkılır).',
      )
    }
    expect(
      belirsiz,
      `color-contrast "karar verilemedi" düğümü ${belirsiz} > taban ${BELIRSIZ_KONTRAST_TABAN}: ` +
        'yeni gradyan/görsel arka plan üstü metin eklenmiş, kontrastı kimse ölçmüyor.',
    ).toBeLessThanOrEqual(BELIRSIZ_KONTRAST_TABAN)
  })

  test('enstrüman kanıtı: alt metni olmayan görsel axe tarafından görülüyor', async ({ page }) => {
    await ac(page)
    await page.evaluate(() => {
      const img = document.createElement('img')
      img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='
      img.width = 4
      img.height = 4
      document.body.appendChild(img)
    })
    const sonuc = await new AxeBuilder({ page }).withTags([...ETIKETLER]).analyze()
    expect(
      sonuc.violations.map((v) => v.id),
      'axe alt metni olmayan görseli GÖREMEDİ: tarama ölçüm-geçersiz (ölçülemedi ≠ geçti)',
    ).toContain('image-alt')
  })
})
