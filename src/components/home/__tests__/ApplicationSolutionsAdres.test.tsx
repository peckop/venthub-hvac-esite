/**
 * URN-19 — ana sayfa çözüm kartlarının GERÇEK çıktısı: TR sayfada bağlantı kanonik EN slug'a
 * (`/tr/category/air-curtains`) değil görünen slug'a gitmeli.
 *
 * Canlı ham HTML ölçümü (2026-10-03, ÖNCE): `/tr` sayfasında bu iki kart
 * `/tr/category/air-curtains` ve `/tr/category/heat-recovery-vmc` veriyordu; sayfa katmanı 308 ile
 * düzeltiyordu. Bu test bileşenin ürettiği `href`'leri doğrudan okur (adres fonksiyonunu değil),
 * böylece bileşen eski çağrıya dönerse kırılır.
 */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ApplicationSolutions from '../ApplicationSolutions'

const sozluk = {
  eyebrow: 'e',
  title: 't',
  subtitle: 's',
  viewAll: 'v',
  items: {
    entrance: { title: 'Giriş', eyebrow: 'e', description: 'd', point1: 'a', point2: 'b' },
    comfort: { title: 'Konfor', eyebrow: 'e', description: 'd', point1: 'a', point2: 'b' },
  },
}

const kategoriler = [
  { slug: 'air-curtains', metadata: { slug: { tr: 'hava-perdeleri', en: 'air-curtains' } } },
  { slug: 'heat-recovery-vmc', metadata: { slug: { tr: 'isi-geri-kazanim', en: 'heat-recovery-vmc' } } },
]

const kategoriHrefleri = (kap: HTMLElement) =>
  Array.from(kap.querySelectorAll('a'))
    .map((a) => a.getAttribute('href') ?? '')
    .filter((h) => h.includes('/category/') || h.includes('/kategori/'))

describe('ApplicationSolutions — kart bağlantıları görünen slug ile (URN-19)', () => {
  it('TR, liste verilmiş: görünen TR slug', () => {
    const { container } = render(<ApplicationSolutions dictionary={sozluk} lang="tr" categories={kategoriler} />)
    expect(kategoriHrefleri(container)).toEqual(['/tr/category/hava-perdeleri', '/tr/category/isi-geri-kazanim'])
  })

  it('TR, liste verilmemiş (veri alınamadı): yedek TR slug — EN slug ASLA', () => {
    const { container } = render(<ApplicationSolutions dictionary={sozluk} lang="tr" />)
    const hrefler = kategoriHrefleri(container)
    expect(hrefler).toEqual(['/tr/category/hava-perdeleri', '/tr/category/isi-geri-kazanim'])
    expect(hrefler.join(' ')).not.toMatch(/air-curtains|heat-recovery-vmc/)
  })

  it('EN: kanonik EN slug', () => {
    const { container } = render(<ApplicationSolutions dictionary={sozluk} lang="en" categories={kategoriler} />)
    expect(kategoriHrefleri(container)).toEqual(['/en/category/air-curtains', '/en/category/heat-recovery-vmc'])
  })
})
