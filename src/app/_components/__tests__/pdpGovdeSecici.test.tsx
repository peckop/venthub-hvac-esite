import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import React, { Suspense } from 'react'
import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { modellerdenVeri, yayindaVeriAyarla } from '@/config/__tests__/yayindaTestKiti'
import { modelSlugluHarita } from '@/lib/adres/__tests__/fikstur'
import { eskiAdresEsle } from '@/lib/adres/eslestirici'

import { PdpGovdeSecici } from '../pdpGovdeSecici'

/**
 * URN-59 — ürün (aile) sayfası gövdesi ham HTML'de BİR kez (Yol A, bayrağa bağlı). OPS şartları (10-06):
 *  (1) bayrak KAPALIYKEN çıktı bugünkü yapıyla birebir;
 *  (2) bayrak AÇIKKEN SSR'da H1=1 ve `?sku=` aynı testte 308 → model adresi;
 *  (3) canlı kapı CIFT-GOVDE ayrı (scripts/seo/canli-kapi.mjs, bayrak açıkken ölçer).
 *
 * Bu test gerçek gövdeyi (çok bağımlılıklı `ProductDetailBody`) çizmez: seçicinin SÖZLEŞMESİNİ ölçer. Çift gövdenin
 * sebebi `useSearchParams` köprüsünün (CSR bailout) varlığıdır; bayrak açıkken köprü HİÇ çağrılmaz = bailout yok.
 */
vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())
const SEA = { aile: 'storm-serisi', sku: 'SEA-61143003', tr: 'storm-14-atex-cati-fani', en: 'storm-14-atex-roof-fan' }
beforeEach(() => yayindaVeriAyarla(modellerdenVeri([SEA])))

const BASLIK = 'Ürün adı'
const METIN = 'gövde'
const govdeCiz = (secili: string | null) => (
  <main>
    <h1>{BASLIK}</h1>
    <p data-secili={secili ?? 'varsayilan'}>{METIN}</p>
  </main>
)
const h1Sayisi = (html: string) => (html.match(/<h1\b/g) ?? []).length

function koprusuz() {
  const koprulerCagrildi = vi.fn()
  const Kopru: React.FC<{ govde: (s: string | null) => React.ReactNode }> = ({ govde }) => {
    koprulerCagrildi()
    return <>{govde('SEA-61143003')}</>
  }
  return { Kopru, koprulerCagrildi }
}

describe('PdpGovdeSecici — bayrak AÇIK: gövde bir kez, köprü yok', () => {
  it('H1=1, varsayılan model, köprü ve Suspense hiç çağrılmaz', () => {
    const { Kopru, koprulerCagrildi } = koprusuz()
    const html = renderToString(<PdpGovdeSecici adresSemasiAcik govde={govdeCiz} SkuKoprusu={Kopru} />)
    expect(h1Sayisi(html)).toBe(1)
    expect(html).toContain('data-secili="varsayilan"')
    expect(koprulerCagrildi).not.toHaveBeenCalled()
  })

  it('ÖN KOŞUL (aynı testte): ?sku= bayrak açıkken adres katmanında TEK 308 ile model adresine gider (aile sayfasına ?sku= ulaşmaz)', () => {
    const sonuc = eskiAdresEsle(modelSlugluHarita(), { yol: '/tr/products/storm-serisi', sku: 'SEA-61143003', dilTespit: () => 'tr' })
    expect(sonuc?.durum).toBe(308)
    expect(sonuc?.hedef).toContain('SEA-61143003'.toLowerCase())
    // 308'in hedefinde query YOK: ikinci sıçrama / döngü yok.
    expect(sonuc?.hedef).not.toContain('?')
  })
})

describe('PdpGovdeSecici — model rotası (sunucuSku): seçim sunucuda, köprü yok', () => {
  it.each([true, false])('adresSemasiAcik=%s iken sunucuSku ile gövde bir kez ve seçili model işlenir', (acik) => {
    const { Kopru, koprulerCagrildi } = koprusuz()
    const html = renderToString(<PdpGovdeSecici sunucuSku="VRT-65195" adresSemasiAcik={acik} govde={govdeCiz} SkuKoprusu={Kopru} />)
    expect(h1Sayisi(html)).toBe(1)
    expect(html).toContain('data-secili="VRT-65195"')
    expect(koprulerCagrildi).not.toHaveBeenCalled()
  })
})

describe('PdpGovdeSecici — bayrak KAPALI: bugünkü yapı BİREBİR (köprü + Suspense)', () => {
  it('çıktı, eski satır içi yapıyla (Suspense fallback=gövde(null) + köprü) bayt bayt AYNI', () => {
    const { Kopru, koprulerCagrildi } = koprusuz()
    const yeni = renderToString(<PdpGovdeSecici adresSemasiAcik={false} govde={govdeCiz} SkuKoprusu={Kopru} />)
    const eski = renderToString(
      <Suspense fallback={govdeCiz(null)}>
        <Kopru govde={govdeCiz} />
      </Suspense>
    )
    expect(yeni).toBe(eski)
    expect(koprulerCagrildi).toHaveBeenCalled()
    // Köprünün okuduğu ?sku= seçimi korunur (bayrak kapalıyken davranış değişmez).
    expect(yeni).toContain('data-secili="SEA-61143003"')
  })
})

describe('ProductDetailPageView — seçici bağlantısı (kaynak kapısı)', () => {
  const kaynak = readFileSync(join(process.cwd(), 'src', 'app', '_components', 'ProductDetailPageView.tsx'), 'utf8')

  it('ProductDetailPage seçiciyi kullanır ve bayrağı ADRES_SEMASI_K3B\'den alır; satır içi Suspense YOK', () => {
    expect(kaynak).toContain('<PdpGovdeSecici')
    expect(kaynak).toContain('adresSemasiAcik={ADRES_SEMASI_K3B}')
    expect(kaynak, 'sayfa kökünde satır içi <Suspense> geri gelirse köprü bayraktan bağımsız çift gövde üretir').not.toMatch(/<Suspense\b/)
  })
})
