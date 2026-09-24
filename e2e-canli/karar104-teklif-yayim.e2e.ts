import { expect, test } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../src/types/database.types'

/**
 * KARAR 104 — canlı kabul kanıtı: yönetici teklifi EKRANIN GERÇEK YOLUNDAN fiyatlayıp yayımlar.
 *
 * NİÇİN: yayım düğmesi hiç çalışmıyordu (ekran yalnız `status` güncelliyordu, yayım tetiği başlıkta süre +
 * para birimi istiyordu) ve fiyat girişi yalnız 'requested'ta açıktı. Onarım (REC-54) birim testlerle
 * kanıtlandı; bu spec aynı onarımın CANLIDA, gerçek yönetici oturumuyla çalıştığının tek seferlik kanıtıdır.
 * Hedef: 2026-09-01 deneme teklifi (taslak, tek kalem, fiyatsız — 2026-09-24 salt okuma ile ölçüldü).
 *
 * YAZIM: kalem fiyatı (ekranda "Fiyatları Kaydet") + yayım (ekranda "Teklif Verildi olarak işaretle" →
 * admin_publish_quote). Yayım müşteriye e-posta tetikler; teklifin muhatabı Recep'in kendisidir.
 *
 * İDEMPOTENT: teklif zaten 'quoted' ise HİÇBİR ŞEY yazmadan ölçer ve çıkar. Fiyat zaten doğru girilmişse
 * fiyat adımı atlanır (yarıda kalmış koşumun tekrarı ikinci fiyat yazımı yapmaz).
 *
 * KANIT = iş günlüğüne basılan [K104] ölçüm satırları. E-posta, parola, oturum anahtarı BASILMAZ (repo PUBLIC, iş günlüğü açık).
 * Ayar: e2e-canli/playwright.config.ts (retries 0, trace kapalı). Bekçi: INV-CANLI-KANIT-1.
 * Ömür: kanıt Linear'a yazılınca bu dosya iş akışıyla birlikte ayrı PR'la silinir.
 */

const TEKLIF_ID = '89024b5f-6913-4f64-91d7-1608c3c345ad'
const KALEM_ADI = 'AVenS 5 A HIZ ANAHTARI'
const FIYAT = 1000
const PARA_BIRIMI = 'TRY'
const GECERLILIK_GUN = 30

/** Kanıt satırı iş günlüğüne gider (console.log kod kuralında yasak; stdout doğrudan yazılır). */
const kanit = (satir: string) => process.stdout.write(`${satir}\n`)

/** Eksik ortam değişkeni SESSİZ YEŞİL değil açık hatadır — atlanan koşum kanıt sayılmaz. */
function gerekli(ad: string): string {
  const deger = process.env[ad]
  if (!deger) throw new Error(`${ad} ortamda yok — canlı kanıt koşulamaz (atlama değil, hata).`)
  return deger
}

type Olcum = {
  durum: string
  baslikGecerlilik: string | null
  baslikParaBirimi: string | null
  gonderim: string | null
  guncelleme: string | null
  kalemler: { id: string; fiyat: number | null; paraBirimi: string | null; gecerlilik: string | null }[]
}

async function olc(db: SupabaseClient<Database>): Promise<Olcum> {
  const { data: q, error } = await db
    .from('venthub_quotes')
    .select('status, valid_until, currency, sent_at, updated_at')
    .eq('id', TEKLIF_ID)
    .maybeSingle()
  if (error) throw new Error(`teklif okunamadı: ${error.code ?? ''} ${error.message}`)
  if (!q) throw new Error('teklif bulunamadı — yönetici oturumu bu teklifi göremiyor (RLS/kiracı?)')
  const { data: items, error: e2 } = await db
    .from('venthub_quote_items')
    .select('id, unit_price, currency, valid_until')
    .eq('quote_id', TEKLIF_ID)
  if (e2) throw new Error(`kalemler okunamadı: ${e2.code ?? ''} ${e2.message}`)
  return {
    durum: q.status,
    baslikGecerlilik: q.valid_until,
    baslikParaBirimi: q.currency,
    gonderim: q.sent_at,
    guncelleme: q.updated_at,
    kalemler: (items ?? []).map((i) => ({
      id: i.id,
      fiyat: i.unit_price === null ? null : Number(i.unit_price),
      paraBirimi: i.currency,
      gecerlilik: i.valid_until,
    })),
  }
}

/** Ölçüm satırı — yalnız durum/sayı/zaman; kişisel veri yok. */
function bas(etiket: string, o: Olcum): void {
  const k = o.kalemler
    .map((i) => `kalem ${i.id.slice(0, 8)}: fiyat=${i.fiyat ?? 'YOK'} pb=${i.paraBirimi ?? 'YOK'} gecerlilik=${i.gecerlilik ?? 'YOK'}`)
    .join(' | ')
  kanit(
    `[K104] ${etiket}: durum=${o.durum} baslik_gecerlilik=${o.baslikGecerlilik ?? 'YOK'} ` +
      `baslik_pb=${o.baslikParaBirimi ?? 'YOK'} sent_at=${o.gonderim ?? 'YOK'} updated_at=${o.guncelleme ?? 'YOK'} · ${k}`,
  )
}

const fiyatHazir = (o: Olcum) =>
  o.kalemler.length > 0 &&
  o.kalemler.every(
    (i) => i.fiyat === FIYAT && i.paraBirimi === PARA_BIRIMI && i.gecerlilik !== null && Date.parse(i.gecerlilik) > Date.now(),
  )

test('karar 104 · 09-01 teklifi yönetici ekranından fiyatlanır ve yayımlanır', async ({ page }) => {
  const EPOSTA = gerekli('E2E_ADMIN_EMAIL')
  const PAROLA = gerekli('E2E_ADMIN_PASSWORD')
  const db = createClient<Database>(gerekli('NEXT_PUBLIC_SUPABASE_URL'), gerekli('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Ölçüm kanalı: aynı yönetici hesabı, RLS altında salt okuma. Yazım YALNIZ ekrandan yapılır.
  const { error: girisHatasi } = await db.auth.signInWithPassword({ email: EPOSTA, password: PAROLA })
  if (girisHatasi) throw new Error(`ölçüm oturumu açılamadı: ${girisHatasi.status ?? ''} ${girisHatasi.code ?? ''}`)

  const once = await olc(db)
  bas('ONCE', once)

  // İDEMPOTENT ÇIKIŞ — yayımlanmışsa hiçbir şey yazılmaz.
  if (once.durum === 'quoted') {
    kanit('[K104] SONUC: zaten yayimli — yazim yapilmadi.')
    expect(once.baslikParaBirimi, 'yayımlı teklifin başlığında para birimi yok').not.toBeNull()
    expect(once.baslikGecerlilik, 'yayımlı teklifin başlığında geçerlilik yok').not.toBeNull()
    return
  }
  expect(once.durum, 'beklenen başlangıç durumu taslak — başka durumdaki teklife yazılmaz').toBe('draft')
  expect(once.kalemler.length, 'teklifin kalemi yok').toBeGreaterThan(0)

  // Ekranda satır kalem adıyla bulunur; bu adın başka teklifte geçmediği ÖNCE ölçülür (yanlış satıra yazım yok).
  const { data: eslesen, error: e3 } = await db.from('venthub_quote_items').select('quote_id').ilike('product_name', KALEM_ADI)
  if (e3) throw new Error(`kalem adı eşleşmesi okunamadı: ${e3.message}`)
  const teklifler = [...new Set((eslesen ?? []).map((m) => m.quote_id))]
  expect(teklifler, 'kalem adı birden çok teklifte geçiyor — satır tekil seçilemez').toEqual([TEKLIF_ID])

  // 1) Gerçek giriş
  await page.goto('/tr/auth/login')
  await page.fill('input[name="email"]', EPOSTA)
  await page.fill('input[name="password"]', PAROLA)
  await page.click('button[type="submit"]')
  await page.waitForURL((u) => !u.pathname.includes('/auth/login'), { timeout: 25_000 })

  // 2) Teklif ekranı, hedef satır
  await page.goto('/admin/quotes')
  // Açılan detay satırı da kalem adını taşır; ana satır DOM'da ilk gelir ve açmadan önce tekil olduğu ölçülür.
  await expect(page.locator('tr', { hasText: KALEM_ADI }), 'teklif satırı ekranda görünmedi').toHaveCount(1, { timeout: 30_000 })
  const satir = page.locator('tr', { hasText: KALEM_ADI }).first()

  // 3) Fiyat — yalnız henüz doğru girilmemişse
  if (!fiyatHazir(once)) {
    await satir.getByRole('button', { name: /^(Detaylar|Details)$/ }).click()
    const detay = satir.locator('xpath=following-sibling::tr[1]')
    const fiyatAlani = detay.locator('input[type="number"]')
    await expect(
      fiyatAlani,
      'taslakta fiyat alanı yok — canlı sürüm onarımı (fiyat girişi taslakta da açık) içermiyor olabilir',
    ).toHaveCount(once.kalemler.length, { timeout: 15_000 })

    const bitis = new Date(Date.now() + GECERLILIK_GUN * 86_400_000).toISOString().slice(0, 10)
    for (let i = 0; i < once.kalemler.length; i++) {
      await fiyatAlani.nth(i).fill(String(FIYAT))
      await detay.locator('input[maxlength="3"]').nth(i).fill(PARA_BIRIMI)
      await detay.locator('input[type="date"]').nth(i).fill(bitis)
    }
    await detay.getByRole('button', { name: /^(Fiyatları Kaydet|Save Prices)$/ }).click()
    await expect.poll(async () => fiyatHazir(await olc(db)), { message: 'fiyat DB\'ye yazılmadı', timeout: 20_000 }).toBe(true)
    bas('FIYAT_SONRASI', await olc(db))
  } else {
    kanit('[K104] fiyat zaten dogru girilmis — fiyat adimi atlandi.')
  }

  // 4) Yayım — ekrandaki durum düğmesi (admin_publish_quote)
  const yayimDugmesi = satir.getByRole('button', { name: /^(Teklif Verildi olarak işaretle|Mark as Quoted)$/ })
  await expect(yayimDugmesi, 'yayım düğmesi görünmedi').toBeVisible({ timeout: 20_000 })
  await yayimDugmesi.click()
  // Ekranın verdiği bildirim de kanıttır (başarı ya da düşme sebebi); kişisel veri içermez.
  const bildirim = page.locator('[data-sonner-toast]').last()
  await bildirim.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => undefined)
  kanit(`[K104] ekran bildirimi: ${(await bildirim.textContent().catch(() => null)) ?? 'YOK'}`)

  await expect.poll(async () => (await olc(db)).durum, { message: 'teklif yayımlanmadı', timeout: 30_000 }).toBe('quoted')
  const sonra = await olc(db)
  bas('SONRA', sonra)
  expect(sonra.baslikParaBirimi, 'yayımda başlık para birimi yazılmadı').toBe(PARA_BIRIMI)
  expect(sonra.baslikGecerlilik, 'yayımda başlık geçerliliği yazılmadı').not.toBeNull()
  kanit('[K104] SONUC: taslak -> yayimlandi (ekran yolu).')

  await db.auth.signOut()
})
