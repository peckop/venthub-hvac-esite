/**
 * URN-83 — hava perdesi sihirbazı kapalı: `BottomCTA` sihirbaz kartını VARSAYILANDA basmaz.
 *
 * NİÇİN: `EnhancedNeedsWizard` 3. adımdan sonra boş panel açıyor ve 6. adıma (sonuç) ulaşılamıyor.
 * Eskiden `showWizard` varsayılanı `true` idi; sayfa `onOpenWizard` verip `showWizard`'ı atlarsa kart
 * kendiliğinden çıkardı. Varsayılan kapalı olunca sihirbaz kartı yalnız çağıran AÇIKÇA isterse görünür
 * (bugün tek isteyen sessiz fan sayfası; onun sihirbazı ayrı bileşen ve çalışıyor).
 *
 * Gerçek `I18nProvider` + gerçek sözlük kullanılır: `t()` provider'sız ham anahtarı döner ve
 * "kart yok" iddiası metni hiç görmeden yeşil kalırdı (bkz. SeriesLandingView.test.tsx).
 */
import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { tr } from '@/i18n/dictionaries/tr'
import { I18nProvider } from '@/i18n/I18nProvider'

import BottomCTA from '../BottomCTA'

const SIHIRBAZ_KARTI = tr.category.bottomCta.findFit

function renderCta(props: React.ComponentProps<typeof BottomCTA>) {
  return render(
    <I18nProvider lang="tr">
      <BottomCTA {...props} />
    </I18nProvider>,
  )
}

describe('BottomCTA — sihirbaz kartı (URN-83)', () => {
  it('OLCUM KONTROLU: gercek sozlukte sihirbaz kartinin metni var (sahte-yesil muhafizi)', () => {
    expect(SIHIRBAZ_KARTI.length).toBeGreaterThan(3)
  })

  it('showWizard VERİLMEZSE sihirbaz kartı yok — onOpenWizard verilmiş olsa bile', () => {
    renderCta({ onOpenWizard: vi.fn(), onShowProducts: vi.fn() })
    expect(screen.queryByText(SIHIRBAZ_KARTI)).toBeNull()
  })

  it('showWizard={false} ise sihirbaz kartı yok', () => {
    renderCta({ onOpenWizard: vi.fn(), onShowProducts: vi.fn(), showWizard: false })
    expect(screen.queryByText(SIHIRBAZ_KARTI)).toBeNull()
  })

  it('sihirbaz kartı yokken diğer eylemler yerinde: modelleri incele + uzman desteği', () => {
    renderCta({ onOpenWizard: vi.fn(), onShowProducts: vi.fn() })
    expect(screen.getByText(tr.category.inspectModels)).toBeInTheDocument()
    expect(screen.getByText(tr.category.bottomCta.expertSupport)).toBeInTheDocument()
  })

  it('AÇIKÇA istenirse (sessiz fan sayfasının yolu) kart çıkar ve tıklanınca onOpenWizard çalışır', () => {
    const acildi = vi.fn()
    renderCta({ onOpenWizard: acildi, onShowProducts: vi.fn(), showWizard: true })
    const kart = screen.getByText(SIHIRBAZ_KARTI)
    kart.click()
    expect(acildi).toHaveBeenCalledTimes(1)
  })

  it('showWizard açık ama onOpenWizard yoksa kart yine yok (tıklanınca hiçbir şey açmayan düğme basılmaz)', () => {
    renderCta({ onShowProducts: vi.fn(), showWizard: true })
    expect(screen.queryByText(SIHIRBAZ_KARTI)).toBeNull()
  })
})
