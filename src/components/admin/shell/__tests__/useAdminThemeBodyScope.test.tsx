import { render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AdminModal } from '../../overlay/AdminModal'
import { ADMIN_THEME_ATTR, useAdminThemeBodyScope } from '../useAdminThemeBodyScope'

/**
 * Tema kapsamının PORTAL'a ulaştığının kanıtı (2026-08-18 kusuru).
 *
 * NİÇİN RENDER TESTİ, NİÇİN STATİK TARAMA DEĞİL
 *
 * Kusur "yanlış sınıf yazılmış" değildi: sınıflar (`bg-admin-surface`,
 * `text-admin-fg`) TAM DOĞRUYDU. Yanlış olan, o sınıfların dayandığı CSS
 * değişkenlerinin portal ağacında TANIMSIZ olmasıydı. Bir statik tarayıcı
 * dosyada doğru sınıfı görür ve YEŞİL der — bu depoda daha önce de yaşanan
 * "statik kapı runtime'ı görmez" sınıfının aynısı (admin donma vakası).
 *
 * Bu yüzden ölçüm DOM ilişkisi üzerinden yapılır: portal'lanmış içeriğin,
 * tema kapsamını taşıyan bir ATASI olmak zorundadır.
 *
 * ÖLÇMEDİĞİ ŞEY (adıyla): jsdom `src/index.css`'i uygulamaz, dolayısıyla
 * "hesaplanmış arka plan rengi şeffaf mı" sorusunu bu dosya CEVAPLAMAZ.
 * O ölçüm gerçek tarayıcı ister ve `e2e/admin-smoke.e2e.ts` içindedir.
 */

vi.mock('../../../../i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (key: string) => key, lang: 'tr' }),
}))

/*
  TESTLER ARASI SIZINTI KAPATILIR.

  Bu bir suslemek degil, OLCUMUN SARTI: kancayi bilerek bozdugumda iki portal
  testi YINE YESIL kaldi. Sebep, bir onceki testin BASARISIZ olup temizligine
  hic ulasamamasi ve govdede kalan ozniteligin sonraki testleri kurtarmasiydi.
  Yani kapi, kendi urettigi kirli durumla sahte-yesil veriyordu.
*/
beforeEach(() => document.body.removeAttribute(ADMIN_THEME_ATTR))
afterEach(() => document.body.removeAttribute(ADMIN_THEME_ATTR))

const Kapsam: React.FC<{ tema: 'light' | 'dark'; children?: React.ReactNode }> = ({
  tema,
  children,
}) => {
  useAdminThemeBodyScope(tema)
  return <div data-admin-theme={tema}>{children}</div>
}

describe('useAdminThemeBodyScope', () => {
  it('gövdeye tema kapsamını basar', () => {
    render(<Kapsam tema="dark" />)
    expect(document.body.getAttribute(ADMIN_THEME_ATTR)).toBe('dark')
  })

  it('tema değişince gövdedeki değeri GÜNCELLER', () => {
    const { rerender } = render(<Kapsam tema="dark" />)
    rerender(<Kapsam tema="light" />)
    expect(document.body.getAttribute(ADMIN_THEME_ATTR)).toBe('light')
  })

  it('admin yüzeyi çözülünce işareti KALDIRIR (vitrine sızmasın)', () => {
    const { unmount } = render(<Kapsam tema="dark" />)
    unmount()
    expect(document.body.hasAttribute(ADMIN_THEME_ATTR)).toBe(false)
  })

  it('önceki değeri körü körüne silmez — geri yükler', () => {
    document.body.setAttribute(ADMIN_THEME_ATTR, 'light')
    const { unmount } = render(<Kapsam tema="dark" />)
    expect(document.body.getAttribute(ADMIN_THEME_ATTR)).toBe('dark')
    unmount()
    expect(document.body.getAttribute(ADMIN_THEME_ATTR)).toBe('light')
    document.body.removeAttribute(ADMIN_THEME_ATTR)
  })
})

describe('portal ağacı tema kapsamının İÇİNDE', () => {
  it('modal içeriğinin tema kapsamı taşıyan bir ATASI var', () => {
    /*
      KUSURUN BİREBİR YENİDEN ÜRETİMİ: Radix `Dialog.Portal` içeriği
      `document.body`ye taşır. Kanca olmadan bu ağacın hiçbir atasında
      `data-admin-theme` bulunmuyordu; `hsl(var(--admin-surface))` geçersize
      düşüyor ve modal panelinin arka planı ŞEFFAF kalıyordu — altındaki tablo
      satırları modalın içinden görünüyordu.
    */
    render(
      <Kapsam tema="dark">
        <AdminModal
          open
          onOpenChange={() => {}}
          title="Yeni Kategori"
          description="Kategori bilgilerini yönetin."
          closeLabel="Kapat"
        >
          <p>gövde</p>
        </AdminModal>
      </Kapsam>,
    )

    const icerik = screen.getByRole('dialog')
    expect(
      icerik.closest(`[${ADMIN_THEME_ATTR}]`),
      'Portal içeriğinin tema kapsamı taşıyan atası YOK — admin değişkenleri\n' +
        'tanımsız kalır: modal paneli şeffaf, menü metni okunmaz olur.',
    ).not.toBeNull()
  })

  it('perde (overlay) de kapsam içinde', () => {
    /* Perde de portal'lanır; kapsamı kaçırırsa arka plan kilidi/rengi ayrışır. */
    const { container } = render(
      <Kapsam tema="light">
        <AdminModal
          open
          onOpenChange={() => {}}
          title="Başlık"
          description="Açıklama."
          closeLabel="Kapat"
        >
          <p>gövde</p>
        </AdminModal>
      </Kapsam>,
    )
    void container
    const perde = document.querySelector('.z-backdrop')
    expect(perde, 'perde render edilmedi').not.toBeNull()
    expect(perde?.closest(`[${ADMIN_THEME_ATTR}]`), 'perde kapsam dışında').not.toBeNull()
  })
})
