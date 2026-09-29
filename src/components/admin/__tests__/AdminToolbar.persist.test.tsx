import { act, fireEvent, render, screen } from '@testing-library/react'
import React, { useMemo, useRef, useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AdminToolbar from '../AdminToolbar'

/**
 * REC-411 — AdminToolbar kalıcılık (localStorage) döngüsü.
 *
 * Kusur: "yükleme" etkisi YALNIZ açılışta değil, her `chips` / `select` / `toggles` kimlik
 * değişiminde koşuyordu (üst bileşen bunları her render'da yeniden kurar). Kullanıcı bir denetimi
 * değiştirince etki, bir önceki render'ın yazdığı ESKİ kayıtla yeni durumu karşılaştırıp farkı
 * `onToggle`/`onChange` ile GERİ ÇEVİRİYORDU; kayıt etkisi de yeni durumu yazdığı için bir sonraki
 * render'da aynısı ters yönde tekrarlanıyordu → sonsuz eşzamanlı render + (URL eşitlemeli
 * tablolarda) sonsuz `router.replace` seli. Canlı belirti: /admin/products'ta "Pasif" çipi.
 *
 * Bu testler üst bileşeni GERÇEK gövdelerin kurduğu gibi kurar: denetim nesneleri her render'da
 * yeniden üretilir, `onToggle` kapanış üzerinden durumu okur (işlevsel güncelleme DEĞİL).
 */

vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (key: string) => key, lang: 'tr' }),
}))

const STORAGE_KEY = 'toolbar:test'
const RENDER_TAVANI = 60

interface Sayaclar {
  render: number
  chipToggle: number
  selectChange: number
  toggleChange: number
}

function Harness({ sayac }: { sayac: Sayaclar }) {
  const [status, setStatus] = useState<string[]>([])
  const [category, setCategory] = useState('')
  const [featured, setFeatured] = useState(false)

  sayac.render += 1
  // Sonsuz döngüde test işçisini dondurmak yerine hızlıca ve okunur biçimde düş.
  if (sayac.render > RENDER_TAVANI) throw new Error(`render tavanı aşıldı (${RENDER_TAVANI}) — döngü`)

  const sayacRef = useRef(sayac)
  const chips = useMemo(
    () => [
      {
        key: 'inactive',
        label: 'Pasif',
        active: status.includes('inactive'),
        onToggle: () => {
          sayacRef.current.chipToggle += 1
          setStatus(status.includes('inactive') ? [] : ['inactive'])
        },
      },
    ],
    [status],
  )

  return (
    <AdminToolbar
      storageKey={STORAGE_KEY}
      select={{
        value: category,
        onChange: (v) => {
          sayacRef.current.selectChange += 1
          setCategory(v)
        },
        options: [
          { value: '', label: 'Hepsi' },
          { value: 'fan', label: 'Fan' },
        ],
      }}
      chips={chips}
      toggles={[
        {
          key: 'featured',
          label: 'Öne çıkan',
          checked: featured,
          onChange: (v) => {
            sayacRef.current.toggleChange += 1
            setFeatured(v)
          },
        },
      ]}
    />
  )
}

function yeniSayac(): Sayaclar {
  return { render: 0, chipToggle: 0, selectChange: 0, toggleChange: 0 }
}

async function yerles(ms = 60): Promise<void> {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms))
  })
}

function cip(): HTMLElement {
  return screen.getAllByRole('button', { name: 'Pasif' })[0]
}

beforeEach(() => {
  localStorage.clear()
})

describe('AdminToolbar kalıcılık — döngü yok (REC-411)', () => {
  it('çipe tıklamak durumu bir kez değiştirir ve yerinde kalır', async () => {
    const sayac = yeniSayac()
    render(<Harness sayac={sayac} />)
    await yerles()

    fireEvent.click(cip())
    await yerles()

    expect(cip().getAttribute('aria-pressed')).toBe('true')
    expect(sayac.chipToggle).toBe(1) // yalnız kullanıcının tıklaması; kalıcılık geri çevirmedi
    expect(sayac.render).toBeLessThan(15)
  })

  it('çipi açıp kapatmak da kararlı: iki tıklama = iki geçiş, kayıt son durumu tutar', async () => {
    const sayac = yeniSayac()
    render(<Harness sayac={sayac} />)
    await yerles()

    fireEvent.click(cip())
    await yerles()
    fireEvent.click(cip())
    await yerles()

    expect(cip().getAttribute('aria-pressed')).toBe('false')
    expect(sayac.chipToggle).toBe(2)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').chips).toEqual({ inactive: false })
  })

  it('seçiciyi değiştirmek kararlı: değer yerinde kalır, onChange yalnız kullanıcıdan gelir', async () => {
    const sayac = yeniSayac()
    render(<Harness sayac={sayac} />)
    await yerles()

    const secici = screen.getAllByRole('combobox')[0] as HTMLSelectElement
    fireEvent.change(secici, { target: { value: 'fan' } })
    await yerles()

    expect((screen.getAllByRole('combobox')[0] as HTMLSelectElement).value).toBe('fan')
    expect(sayac.selectChange).toBe(1)
    expect(sayac.render).toBeLessThan(15)
  })

  it('anahtarı değiştirmek kararlı: durum yerinde kalır, onChange yalnız kullanıcıdan gelir', async () => {
    const sayac = yeniSayac()
    render(<Harness sayac={sayac} />)
    await yerles()

    fireEvent.click(screen.getAllByRole('switch')[0])
    await yerles()

    expect(screen.getAllByRole('switch')[0].getAttribute('aria-checked')).toBe('true')
    expect(sayac.toggleChange).toBe(1)
    expect(sayac.render).toBeLessThan(15)
  })
})

describe('AdminToolbar kalıcılık — kayıtlı durum açılışta BİR KEZ geri yüklenir', () => {
  it('kayıtlı çip açıkken sayfa açılınca çip bir kez açılır, sonra kullanıcı kapatabilir', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ chips: { inactive: true } }))
    const sayac = yeniSayac()
    render(<Harness sayac={sayac} />)
    await yerles()

    expect(cip().getAttribute('aria-pressed')).toBe('true')
    expect(sayac.chipToggle).toBe(1) // geri yükleme tam bir kez

    fireEvent.click(cip()) // kullanıcı kapatır
    await yerles()

    expect(cip().getAttribute('aria-pressed')).toBe('false')
    expect(sayac.chipToggle).toBe(2) // geri yükleme kapatmayı geri AÇMADI
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').chips).toEqual({ inactive: false })
  })

  it('kayıtlı seçici değeri açılışta geri yüklenir ve kullanıcı değiştirince ezilmez', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ select: 'fan' }))
    const sayac = yeniSayac()
    render(<Harness sayac={sayac} />)
    await yerles()

    expect((screen.getAllByRole('combobox')[0] as HTMLSelectElement).value).toBe('fan')
    expect(sayac.selectChange).toBe(1)

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '' } })
    await yerles()

    expect((screen.getAllByRole('combobox')[0] as HTMLSelectElement).value).toBe('')
    expect(sayac.selectChange).toBe(2)
  })
})
