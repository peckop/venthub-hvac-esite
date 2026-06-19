import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useRole } from '../useRole'

/**
 * Davranışsal regresyon bekçisi (2026-06-19 admin donması).
 *
 * Burada useAuth STABİL bir değerle mock'lanır AMA `useRole`'un KENDİSİ gerçek çalışır.
 * Böylece useRole'un memoizasyonu regrese olursa (canAccess/canWrite tekrar inline arrow
 * döndürürse), aşağıdaki harness'taki `useEffect([canWrite])` her render yeniden çalışır →
 * spy çağrı sayısı patlar → test KIRILIR. Bu, gerçek panel donmasının birim-test düzeyindeki
 * imzasıdır (mevcut bileşen testleri useRole'u stabil mock'ladığı için bu sınıfı KAÇIRMIŞTI).
 */

const STABLE_AUTH = { role: 'admin', loading: false, roleLoading: false }
vi.mock('../useAuth', () => ({ useAuth: () => STABLE_AUTH }))

function EffectDepHarness({ onEffect }: { onEffect: () => void }) {
  const { canWrite } = useRole()
  React.useEffect(() => {
    onEffect()
  }, [canWrite])
  return null
}

function AccessEffectHarness({ onEffect }: { onEffect: () => void }) {
  const { canAccess } = useRole()
  React.useEffect(() => {
    onEffect()
  }, [canAccess])
  return null
}

describe('useRole effect-dependency stability (gerçek useRole)', () => {
  it('canWrite bir useEffect bağımlılığıyken parent re-render efekti TEKRAR çalıştırmaz', () => {
    const onEffect = vi.fn()
    const ui = <EffectDepHarness onEffect={onEffect} />
    const { rerender } = render(ui)
    rerender(ui)
    rerender(ui)
    // Stabil canWrite → efekt yalnız mount'ta. Regresyon (inline canWrite) → her render → 4.
    expect(onEffect).toHaveBeenCalledTimes(1)
  })

  it('canAccess bir useEffect bağımlılığıyken parent re-render efekti TEKRAR çalıştırmaz', () => {
    const onEffect = vi.fn()
    const ui = <AccessEffectHarness onEffect={onEffect} />
    const { rerender } = render(ui)
    rerender(ui)
    rerender(ui)
    expect(onEffect).toHaveBeenCalledTimes(1)
  })
})
