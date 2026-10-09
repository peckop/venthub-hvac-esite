import { describe, expect, it } from 'vitest'

import { sayfaUstVerisi, VARSAYILAN_OG_GORSELI } from '../sayfaUstVerisi'

/**
 * INV-OG-GORSEL-1 (URN-61) — ortak üst veri yazıcısı dizine açık her sayfaya varsayılan paylaşım görseli yazar.
 *
 * NİÇİN VAR (canlı ölçüm, 2026-10-09): rehber, hakkımızda, iletişim, yasal sayfalar, ürünler ve markalar
 * listesi `og:image` taşımıyordu ve `twitter:card` "summary" idi. Kök neden: sayfanın kendi `openGraph` bloğu
 * dil layout'unun `openGraph`ını bütünüyle ezer; görsel her yazıcıda açıkça yazılmak zorundadır.
 *
 * BU KAPI NE ÖLÇER: (a) dizine açık sayfada `openGraph.images` dolu ve 1200x630, (b) dizin dışı işlem
 * yüzeyinde (sepet, ödeme, giriş) görsel YOK, (c) görsel adresi göreli kalmaz — `metadataBase` kök layout'ta
 * tanımlıdır, ama sabit adres dosya adı değişirse sessizce kırılır: dosyanın var olduğu burada ölçülür.
 * ÖLÇMEDİĞİ: canlıda `og:image` etiketinin basıldığı (canlı kapı OG-GORSEL kuralı ölçer).
 */
describe('INV-OG-GORSEL-1 — varsayılan paylaşım görseli', () => {
  const girdi = { lang: 'tr', yol: '/destek/sss', baslik: 'X', aciklama: 'Y' }

  it('dizine açık sayfada openGraph.images varsayılan görseldir', () => {
    const og = sayfaUstVerisi(girdi).openGraph as { images?: unknown } | undefined
    expect(og?.images, 'dizine açık sayfada og:image yok').toEqual(VARSAYILAN_OG_GORSELI)
  })

  it('görsel 1200x630 (büyük kart oranı)', () => {
    expect(VARSAYILAN_OG_GORSELI).toEqual([{ url: '/images/og-default.jpg', width: 1200, height: 630 }])
  })

  it('dizin dışı sayfada görsel yazılmaz', () => {
    const og = sayfaUstVerisi({ ...girdi, dizinDisi: true }).openGraph as { images?: unknown } | undefined
    expect(og?.images, 'dizin dışı işlem yüzeyine paylaşım görseli yazıldı').toBeUndefined()
  })

  it('görsel dosyası public altında gerçekten var', async () => {
    const { existsSync } = await import('node:fs')
    const { join } = await import('node:path')
    const dosya = join(process.cwd(), 'public', VARSAYILAN_OG_GORSELI[0].url)
    expect(existsSync(dosya), `${dosya} yok — olmayan görseli beyan etmek görsel beyan etmemekten kötü`).toBe(true)
  })
})
