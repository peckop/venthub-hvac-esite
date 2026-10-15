/**
 * URN-127 (karar 348) — ürün sayfası teknik tablosunda `pq_curve` satırının yanındaki eğri notu.
 *
 * Üç durum ölçülür: yaklaşık (≤3 nokta ya da `turetilmis`), grafikten okundu (`kitapcik_grafik`, ≥4 nokta),
 * not yok. Bileşen GERÇEK `egriNotuTuru` ile koşar; `t` anahtarın kendisini döndürür, böylece ekranda hangi
 * sözlük anahtarının çizildiği ölçülür ve ham kaynak metninin (`kitapcik_grafik`) HİÇBİR koşulda basılmadığı görülür.
 */
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { PqEgriNotu } from '../PqEgriNotu'

const t = (k: string) => k
const ALTI = '[[0,210.9],[100,190],[255,105.5],[380,55],[450,25],[510,0]]'
const UC = '[[0, 210.9], [255, 105.5], [510, 0]]'

function ciz(egri: unknown, kaynak: unknown) {
  return render(<PqEgriNotu egri={egri} kaynak={kaynak} t={t} />)
}

describe('PqEgriNotu — PDP eğri satırı notu', () => {
  it('6 nokta + kitapcik_grafik: grafik notu (testid grafik-egri-notu), yaklaşık notu YOK', () => {
    const { container } = ciz(ALTI, 'kitapcik_grafik')
    const not = container.querySelector('[data-testid="grafik-egri-notu"]')
    expect(not?.textContent).toBe('pdp.labels.curveFromChart')
    expect(container.querySelector('[data-testid="yaklasik-egri-notu"]')).toBeNull()
  })

  it('3 nokta: yaklaşık notu (testid yaklasik-egri-notu) — kaynak kitapcik_grafik olsa da, etiketsiz olsa da', () => {
    for (const kaynak of ['kitapcik_grafik', undefined, null]) {
      const { container, unmount } = ciz(UC, kaynak)
      expect(container.querySelector('[data-testid="yaklasik-egri-notu"]')?.textContent, String(kaynak)).toBe('pdp.labels.approxCurve')
      expect(container.querySelector('[data-testid="grafik-egri-notu"]')).toBeNull()
      unmount()
    }
  })

  it('6 nokta + turetilmis: yaklaşık notu (nokta sayısı ne olursa olsun)', () => {
    const { container } = ciz(ALTI, 'turetilmis')
    expect(container.querySelector('[data-testid="yaklasik-egri-notu"]')?.textContent).toBe('pdp.labels.approxCurve')
    expect(container.querySelector('[data-testid="grafik-egri-notu"]')).toBeNull()
  })

  it('6 nokta etiketsiz / kitapcik_tablo / tanınmayan değer: HİÇBİR şey çizilmez (boş kutu yok)', () => {
    for (const kaynak of [undefined, null, '', 'kitapcik_tablo', 'olculmus', 42]) {
      const { container, unmount } = ciz(ALTI, kaynak)
      expect(container.innerHTML, `kaynak=${String(kaynak)}`).toBe('')
      unmount()
    }
  })

  it('eğri yok / bozuk: not yok', () => {
    for (const egri of [null, undefined, '', 'bozuk', '[]']) {
      const { container, unmount } = ciz(egri, 'kitapcik_grafik')
      expect(container.innerHTML).toBe('')
      unmount()
    }
  })

  it('ham kaynak metni (kitapcik_grafik) ekrana HİÇBİR durumda basılmaz', () => {
    for (const [egri, kaynak] of [[ALTI, 'kitapcik_grafik'], [UC, 'kitapcik_grafik'], [ALTI, 'turetilmis']] as const) {
      const { container, unmount } = ciz(egri, kaynak)
      expect(container.textContent).not.toMatch(/kitapcik_|turetilmis/)
      unmount()
    }
  })
})
