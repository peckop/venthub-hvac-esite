import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { girdiOzeti, useCalculatorUsage } from '../useCalculatorUsage'

/**
 * `calculator_used` DAVRANIŞ testi (T021-VH).
 *
 * Buradaki asıl iddia R1'dir: **sayfa açılışı olay üretmez.** Dört hesaplayıcının da
 * girdileri varsayılan değerle doluyor ve sonuç mount anında hesaplanıyor; "ilk geçerli
 * sonuçta ateşle" deseydik olay sayacı sayfa görüntülemesini sayardı ve GA4'te
 * "hesaplayıcı kullanımı" diye okunurdu. Statik bir kapı bunu göremez — ancak davranış görür.
 */

const trackEventMock = vi.fn()
vi.mock('../../utils/analytics', () => ({
  trackEvent: (...args: unknown[]) => trackEventMock(...args),
}))

const VARSAYILAN = { length: '100', width: '30', height: '3' }

beforeEach(() => {
  trackEventMock.mockClear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useCalculatorUsage', () => {
  it('R1 — girdilere DOKUNULMADAN olay göndermez (sayfa görüntülemesi ≠ kullanım)', () => {
    renderHook(() => useCalculatorUsage('jetfan', VARSAYILAN))
    act(() => {
      vi.advanceTimersByTime(10_000)
    })
    expect(trackEventMock).not.toHaveBeenCalled()
  })

  it('R2 — girdi değişip durulunca tek olay gider, özet güncel girdiyi taşır', () => {
    const { rerender } = renderHook(({ g }) => useCalculatorUsage('jetfan', g), {
      initialProps: { g: VARSAYILAN },
    })

    rerender({ g: { ...VARSAYILAN, length: '250' } })
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(trackEventMock).toHaveBeenCalledTimes(1)
    expect(trackEventMock).toHaveBeenCalledWith('calculator_used', {
      calculator: 'jetfan',
      inputs_summary: 'height=3;length=250;width=30',
    })
  })

  it('R3 — gecikme dolmadan olay gitmez (tuş vuruşu sayılmaz)', () => {
    const { rerender } = renderHook(({ g }) => useCalculatorUsage('duct', g), {
      initialProps: { g: VARSAYILAN },
    })

    rerender({ g: { ...VARSAYILAN, length: '2' } })
    act(() => {
      vi.advanceTimersByTime(700)
    })
    rerender({ g: { ...VARSAYILAN, length: '25' } })
    act(() => {
      vi.advanceTimersByTime(700)
    })
    expect(trackEventMock).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(800)
    })
    expect(trackEventMock).toHaveBeenCalledTimes(1)
    expect(trackEventMock.mock.calls[0][1]).toMatchObject({
      inputs_summary: 'height=3;length=25;width=30',
    })
  })

  it('R4 — mount başına en fazla bir olay (sonraki değişimler sessiz)', () => {
    const { rerender } = renderHook(({ g }) => useCalculatorUsage('hrv', g), {
      initialProps: { g: VARSAYILAN },
    })

    rerender({ g: { ...VARSAYILAN, length: '250' } })
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    rerender({ g: { ...VARSAYILAN, length: '400' } })
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(trackEventMock).toHaveBeenCalledTimes(1)
  })

  it('R5 — girdi tabanına GERİ dönülürse olay gitmez', () => {
    const { rerender } = renderHook(({ g }) => useCalculatorUsage('aircurtain', g), {
      initialProps: { g: VARSAYILAN },
    })

    rerender({ g: { ...VARSAYILAN, length: '250' } })
    act(() => {
      vi.advanceTimersByTime(400)
    })
    rerender({ g: VARSAYILAN })
    act(() => {
      vi.advanceTimersByTime(10_000)
    })

    expect(trackEventMock).not.toHaveBeenCalled()
  })

  it('R6 — özet sıralı ve kararlı (aynı girdi, farklı anahtar sırası → aynı metin)', () => {
    expect(girdiOzeti({ b: '2', a: '1' })).toBe('a=1;b=2')
    expect(girdiOzeti({ a: '1', b: '2' })).toBe('a=1;b=2')
    expect(girdiOzeti({ a: null, b: undefined })).toBe('a=;b=')
  })
})
