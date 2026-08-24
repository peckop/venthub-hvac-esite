/**
 * INV-SILENTFAN-WIZARD-1 — sihirbaz arayüzünün sözleşmesi.
 *
 * NİÇİN VAR:
 * Seçim motorunun 40 testi var ama motor doğru olduğu hâlde EKRAN yanlış davranabilir —
 * adım geçmez, boş sonuç sessiz kalır, hata yutulur. Hava perdesi sihirbazı tam bu boşlukta
 * beş ay öldü: sorgu patlıyordu, `catch` yutuyordu, hiçbir test bakmıyordu. Bu dosya o
 * boşluğu kapatır; iddiası "motor doğru" değil, **"kullanıcı ne görüyor"**.
 *
 * Sözlük anahtarları bu dalda henüz eklenmedi (I18N ekleyecek), bu yüzden `t` sahtesi
 * anahtarın kendisini döndürür ve testler METİNLE değil ROL ve ANAHTARLA eşleşir — sözlük
 * gelince bu testler kırılmaz.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FanAdayi } from '@/lib/hvac/ductFanSelection'

const getWizardCandidatesMock = vi.fn()

vi.mock('@/lib/services/wizard.service', () => ({
  getWizardCandidates: (...args: unknown[]) => getWizardCandidatesMock(...args),
}))

vi.mock('@/lib/supabase/client', () => ({
  supabaseBrowserClient: {},
}))

vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${Object.values(params).join(',')}` : key,
    lang: 'tr',
  }),
}))

vi.mock('@/hooks/useLocalizedRoutes', () => ({
  useLocalizedRoutes: () => ({ product: (slug: string) => `/tr/products/${slug}` }),
}))

import SilentFanWizard from './SilentFanWizard'

/** Gerçek katalog verisi: Lineo 150 ve 250 Quiet (2026-08-23 canlı ölçümü). */
const ADAYLAR: FanAdayi[] = [
  {
    id: 'p-150',
    sku: 'VRT-17162',
    ad: 'Vortice Lineo 150 Quiet',
    slug: 'vortice-lineo-150-quiet',
    pqCurveHam: '[[0, 210.9], [255, 105.5], [510, 0]]',
    maksDebiM3h: 510,
    sesDbA: 30.7,
    gucW: 46,
    capMm: 150,
  },
  {
    id: 'p-250',
    sku: 'VRT-17165',
    ad: 'Vortice Lineo 250 Quiet',
    slug: 'vortice-lineo-250-quiet',
    pqCurveHam: '[[0, 339.3], [775, 170], [1550, 0]]',
    maksDebiM3h: 1550,
    sesDbA: 40.1,
    gucW: 128,
    capMm: 250,
  },
]

function ac() {
  return render(<SilentFanWizard isOpen onClose={vi.fn()} categorySlug="inline-duct-fans" />)
}

beforeEach(() => {
  getWizardCandidatesMock.mockReset()
  getWizardCandidatesMock.mockResolvedValue(ADAYLAR)
})

describe('INV-SILENTFAN-WIZARD-1 — açılış ve gezinme', () => {
  it('kapalıyken HİÇBİR şey basmaz ve veri de çekmez', () => {
    render(<SilentFanWizard isOpen={false} onClose={vi.fn()} categorySlug="inline-duct-fans" />)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(getWizardCandidatesMock).not.toHaveBeenCalled()
  })

  it('açıkken modal ve ilk adım görünür', () => {
    ac()
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('silentFanWizard.step1Title')).toBeTruthy()
  })

  it('mahal seçilince ikinci adıma geçer', () => {
    ac()
    fireEvent.click(screen.getByText('silentFanWizard.room.kitchen'))
    expect(screen.getByText('silentFanWizard.step2Title')).toBeTruthy()
  })

  it('geri butonu bir önceki adıma döndürür', () => {
    ac()
    fireEvent.click(screen.getByText('silentFanWizard.room.bedroom'))
    fireEvent.click(screen.getByLabelText('silentFanWizard.goBack'))
    expect(screen.getByText('silentFanWizard.step1Title')).toBeTruthy()
  })

  it('⭐kullanıcı hiçbir şeye dokunmadan sonuca atlayabilir (varsayılanlar dolu)', async () => {
    ac()
    fireEvent.click(screen.getByText('silentFanWizard.skipToResult'))
    await waitFor(() => expect(screen.getByText('silentFanWizard.resultTitle')).toBeTruthy())
    expect(getWizardCandidatesMock).toHaveBeenCalledWith(expect.anything(), 'inline-duct-fans')
  })
})

describe('sonuç ekranı', () => {
  it('üç öneri rozetini ve gerekçe cümlesini basar', async () => {
    ac()
    fireEvent.click(screen.getByText('silentFanWizard.skipToResult'))

    await waitFor(() => expect(screen.getByText('silentFanWizard.badgeBest')).toBeTruthy())
    expect(screen.getByText('silentFanWizard.badgeQuietest')).toBeTruthy()
    expect(screen.getByText('silentFanWizard.badgeEfficient')).toBeTruthy()

    // Gerekçe cümlesi hacim ve debiyi TAŞIR — kullanıcı sayıyı görebilmeli.
    expect(screen.getByText(/^silentFanWizard\.resultNeed:\d+,\d+$/)).toBeTruthy()
  })

  it('önerilen ürün kartı gerçek ürüne link verir', async () => {
    ac()
    fireEvent.click(screen.getByText('silentFanWizard.skipToResult'))
    // Aynı model birden fazla rozette çıkabilir (en uygun + en sessiz aynı fan olabilir),
    // o yüzden getAllByText — tekil arama burada "birden çok eşleşme" ile patlar.
    await waitFor(() => expect(screen.getAllByText(/Vortice Lineo/).length).toBeGreaterThan(0))

    const linkler = screen.getAllByText('silentFanWizard.cardCta')
    expect(linkler[0].closest('a')?.getAttribute('href')).toContain('/tr/products/vortice-lineo-')
  })

  it('hesap dökümü İSTENİRSE açılır — varsayılan kapalı', async () => {
    ac()
    fireEvent.click(screen.getByText('silentFanWizard.skipToResult'))
    await waitFor(() => expect(screen.getByText('silentFanWizard.showDetails')).toBeTruthy())

    expect(screen.queryByText('silentFanWizard.detailVolume')).toBeNull()
    fireEvent.click(screen.getByText('silentFanWizard.showDetails'))
    expect(screen.getByText('silentFanWizard.detailVolume')).toBeTruthy()
    expect(screen.getByText('silentFanWizard.detailNeed')).toBeTruthy()
  })

  it('⭐uygun model yoksa SESSİZ kalmaz, açıkça söyler', async () => {
    // Tek aday ve çok zayıf: mutfak varsayılanından bile yetersiz kalacak.
    getWizardCandidatesMock.mockResolvedValue([
      { ...ADAYLAR[0], pqCurveHam: '[[0, 20], [15, 10], [30, 0]]', maksDebiM3h: 30 },
    ])
    ac()
    fireEvent.click(screen.getByText('silentFanWizard.skipToResult'))

    await waitFor(() => expect(screen.getByText('silentFanWizard.noMatchTitle')).toBeTruthy())
    expect(screen.queryByText('silentFanWizard.badgeBest')).toBeNull()
  })

  it('⭐sorgu patlarsa hata YUTULMAZ — kullanıcı görür', async () => {
    // Hava perdesi sihirbazını beş ay öldüren kusur tam buydu: catch yutuyor,
    // ekran sessizce boş kalıyordu.
    getWizardCandidatesMock.mockRejectedValue(new Error('column category_slugs does not exist'))
    ac()
    fireEvent.click(screen.getByText('silentFanWizard.skipToResult'))

    await waitFor(() => expect(screen.getByText('silentFanWizard.errorTitle')).toBeTruthy())
    expect(screen.queryByText('silentFanWizard.resultTitle')).toBeNull()
  })

  it('aday listesi iki kez ÇEKİLMEZ (baştan başlayınca da)', async () => {
    ac()
    fireEvent.click(screen.getByText('silentFanWizard.skipToResult'))
    await waitFor(() => expect(screen.getByText('silentFanWizard.resultTitle')).toBeTruthy())

    fireEvent.click(screen.getByText('silentFanWizard.restart'))
    fireEvent.click(screen.getByText('silentFanWizard.skipToResult'))
    await waitFor(() => expect(screen.getByText('silentFanWizard.resultTitle')).toBeTruthy())

    expect(getWizardCandidatesMock).toHaveBeenCalledTimes(1)
  })
})
