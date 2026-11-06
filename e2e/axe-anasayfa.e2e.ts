import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test, type TestInfo } from '@playwright/test'

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
 * Ölçüm: canlıda ilk koşu 23, sonraki beş koşu kararlı 17; CI (#1708, admin-smoke) de 17 verdi, yani
 * canlı-CI farkı yok. Tavan 17'ye sıkıldı (OPS, 10-05). Sabotaj (tavan 23 iken): 10 görsel arka planlı metin
 * → 27, kırmızı; tavan 17'de aynı sabotaj 27 > 17 ile kırmızıdır.
 *
 * BLG-3 (12 Ekim, OPS kararı): ikinci rehber kartı +2 belirsiz düğüm (KnowledgeBlock yarı saydam zemin);
 * bilinçli tek seferlik açma, kök onarım TSR-17 tavanı geri indirir. TSR-17 birleşince 17'ye döner,
 * en geç 16 Ekim.
 *
 * BLG-15 (16 Ekim, OPS kararı): üçüncü rehber kartı +2 belirsiz düğüm, tavan 19 → 21. Ana sayfa yalnız son 3 rehber
 * kartını basar (enYeniRehberler adet=3): son 3 rehber kartı × 2 belirsiz düğüm, OPS 16 Ekim; sonraki yazılar tavanı
 * daha fazla büyütmez. Kök onarım TSR-17 tavanı geri indirir.
 */
const BELIRSIZ_KONTRAST_TABAN = 21

/**
 * ALT-158 (6 Kasım, OPS kararı C): çerez onay bandı (`CookieConsent.tsx`) yüklemeden 1500 ms sonra açılır
 * (`setTimeout(syncVisibility, 1500)`). Tek tarama bu yüzden yarışıyordu: axe bant açılmadan biterse 21,
 * açıldıktan sonra biterse 27 (fark tam 6 düğüm, hepsi bant; ölçüm: koşu 42180185428 deneme 2, iki liste).
 * Çözüm: bandın görünmesi BEKLENİR, sonra iki ayrı tarama yapılır. Sayfa (bant hariç) tavanı 21 kalır,
 * bandın kendi tavanı 6. Hiçbir tavan gevşemedi; bandın 6 belirsiz düğümü ayrı iştir (yeni bant Design'dan).
 */
const BANT = '[role="dialog"][aria-label="Çerez İzni"]'
const BANT_KONTRAST_TABAN = 6

const ETIKETLER = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const

async function ac(page: Page): Promise<void> {
  await page.setViewportSize({ width: 390, height: 844 })
  const res = await page.goto('/tr', { waitUntil: 'networkidle' })
  // Uygulama gerçekliği: koruma/hata sayfası değil, bizim sayfamız (html[lang] + gövde içeriği).
  expect(res?.status(), '/tr HTTP durumu').toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr')
  await expect(page.locator('main, [role="main"]').first()).toBeVisible()
}

/** Bandın görünmesini ve giriş animasyonunun bitmesini bekler: tarama zamanlamaya bağlı kalmasın. */
async function bantBekle(page: Page): Promise<void> {
  const bant = page.locator(BANT)
  await expect(bant, 'çerez bandı görünmedi: taze ziyaretçide açılmalıydı').toBeVisible({ timeout: 10_000 })
  await bant.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((an) => an.finished)))
}

type Kapsam = { etiket: string; tavan: number; dahil?: string; haric?: string }

async function taraVeDenetle(page: Page, testInfo: TestInfo, k: Kapsam): Promise<void> {
  let kurucu = new AxeBuilder({ page }).withTags([...ETIKETLER])
  if (k.dahil) kurucu = kurucu.include(k.dahil)
  if (k.haric) kurucu = kurucu.exclude(k.haric)
  const sonuc = await kurucu.analyze()
  const bulunan = Object.fromEntries(sonuc.violations.map((v) => [v.id, v.nodes.length]))
  testInfo.annotations.push({ type: `ihlaller (${k.etiket})`, description: JSON.stringify(bulunan) })

  const yeni = Object.keys(bulunan).filter((id) => !(id in TABAN))
  const artan = Object.entries(bulunan)
    .filter(([id, n]) => id in TABAN && n > TABAN[id])
    .map(([id, n]) => `${id}: ${n} > taban ${TABAN[id]}`)
  expect(yeni, `[${k.etiket}] TABANDA olmayan yeni axe kuralı ihlali: ${yeni.join(', ')}`).toEqual([])
  expect(artan, `[${k.etiket}] taban aşıldı: ${artan.join(' | ')}`).toEqual([])

  // "Karar verilemedi" (incomplete) color-contrast düğümleri: geçti DEĞİL, görülmeyen alan. Sayı artarsa
  // (yeni gradyan/görsel arka plan üstü metin) kırmızı; azalırsa tabanı düşürme notu çıkar (OPS şartı, 10-05).
  const belirsizDugumler = sonuc.incomplete.find((v) => v.id === 'color-contrast')?.nodes ?? []
  const belirsiz = belirsizDugumler.length
  // TEŞHİS (ALT-158): her düğümün hedefi ve axe'ın sebebi basılır; bir sonraki sapma kendini teşhis eder.
  const teshis = belirsizDugumler.map((d) => {
    const sebep = [...d.any, ...d.all, ...d.none].map((c) => c.message).find(Boolean) ?? '(sebep yok)'
    return `${d.target.join(' ')} | ${sebep}`
  })
  testInfo.annotations.push({ type: `color-contrast-incomplete (${k.etiket})`, description: String(belirsiz) })
  testInfo.annotations.push({ type: `color-contrast-incomplete-dugumler (${k.etiket})`, description: teshis.join('\n') })
  console.warn(`[INV-AXE-1 ${k.etiket}] color-contrast incomplete ${belirsiz} düğüm:\n${teshis.join('\n')}`)
  if (belirsiz < k.tavan) {
    console.warn(`NOT [${k.etiket}]: color-contrast incomplete ${belirsiz} < taban ${k.tavan}; tavanı düşür (sıkılır).`)
  }
  expect(
    belirsiz,
    `[${k.etiket}] color-contrast "karar verilemedi" düğümü ${belirsiz} > taban ${k.tavan}: ` +
      'yeni gradyan/görsel arka plan üstü metin eklenmiş, kontrastı kimse ölçmüyor.',
  ).toBeLessThanOrEqual(k.tavan)
}

test.describe('INV-AXE-1 — ana sayfa TR 390px axe taraması', () => {
  test('ihlal tabanı aşılmadı (sayfa, çerez bandı hariç)', async ({ page }, testInfo) => {
    await ac(page)
    await bantBekle(page)
    await taraVeDenetle(page, testInfo, { etiket: 'sayfa', tavan: BELIRSIZ_KONTRAST_TABAN, haric: BANT })
  })

  test('ihlal tabanı aşılmadı (yalnız çerez bandı)', async ({ page }, testInfo) => {
    await ac(page)
    await bantBekle(page)
    await taraVeDenetle(page, testInfo, { etiket: 'bant', tavan: BANT_KONTRAST_TABAN, dahil: BANT })
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
