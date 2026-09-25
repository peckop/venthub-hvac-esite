import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SITE_URL } from '../../../config/siteUrl'
import { YAZILAR } from '../../../data/bilgiMerkezi/yazilar'
import { en } from '../../../i18n/dictionaries/en'
import { tr } from '../../../i18n/dictionaries/tr'
import BilgiMerkeziListe from '../../../views/knowledge/BilgiMerkeziListe'
import { bolumAcik, ListeRotasi, listeUstVerisi } from '../../../views/knowledge/bilgiMerkeziRotasi'
import { ORNEK_YAZI } from './ornekYazi'

/**
 * INV-BILGI-MERKEZI-BOS-1 — yazı YOKKEN liste sayfası 404 vermez, düzgün bir boş durum gösterir
 * (karar 121/c, Recep 2026-09-25: eski üç yazı kalktı; menü, altbilgi ve geçici yönlendirmeler bu
 * sayfaya gidiyor). Boş durum metni sözlükten gelir; arama kutusu ve kart ızgarası basılmaz; Ürün
 * Seçici kapısı kalır. Yazı varken boş durum basılmaz (iki kol da ölçülür — biri kör kalmasın).
 */
describe('Bilgi Merkezi — boş durum', () => {
  it('bölüm yazı sayısına bağlı değil: TR yazısızken de AÇIK (404 değil)', () => {
    expect(bolumAcik('tr', 'tr')).toBe(true)
    expect(bolumAcik('en', 'tr')).toBe(false)
  })

  it('⭐GERÇEK ROTA FONKSİYONLARI yazısızken ATMAZ: üst veri canonical + noindex, gövde boş durumu basar', async () => {
    // #1416'nın ilk CI koşusu: bileşen testi yeşildi ama `/tr/bilgi-merkezi` ön üretimi düştü —
    // `listeUstVerisi` dil yolu vermiyordu, `sayfaUstVerisi` attı. Bu test rotanın KENDİSİNİ çağırır.
    const params = Promise.resolve({ lang: 'tr' })
    const ust = await listeUstVerisi(params, 'tr')
    expect(ust.alternates).toEqual({ canonical: `${SITE_URL}/tr/bilgi-merkezi` })
    if (YAZILAR.length === 0) expect(ust.robots).toEqual({ index: false, follow: true })
    render(await ListeRotasi({ params, bolumDili: 'tr' }))
    if (YAZILAR.length === 0) expect(screen.getByText(tr.bilgiMerkezi.liste.bosBaslik)).toBeTruthy()
  })

  for (const [dil, dict] of [['tr', tr], ['en', en]] as const) {
    it(`${dil}: yazı yokken "hazırlanıyor" başlığı + açıklaması sözlükten; arama yok; Ürün Seçici var`, () => {
      render(<BilgiMerkeziListe dil={dil} yazilar={[]} />)
      expect(screen.getByRole('heading', { level: 2, name: dict.bilgiMerkezi.liste.bosBaslik })).toBeTruthy()
      expect(screen.getByText(dict.bilgiMerkezi.liste.bosAciklama)).toBeTruthy()
      expect(screen.queryByRole('searchbox')).toBeNull()
      expect(screen.queryByLabelText(dict.bilgiMerkezi.liste.aramaEtiketi)).toBeNull()
      expect(screen.getByRole('link', { name: dict.bilgiMerkezi.liste.seciciDugme })).toBeTruthy()
    })
  }

  it('⛔SABOTAJ karşı kolu: yazı VARKEN boş durum basılmaz, kart ve arama basılır', () => {
    render(<BilgiMerkeziListe dil="tr" yazilar={[ORNEK_YAZI]} />)
    expect(screen.queryByText(tr.bilgiMerkezi.liste.bosBaslik)).toBeNull()
    expect(screen.getByLabelText(tr.bilgiMerkezi.liste.aramaEtiketi)).toBeTruthy()
    expect(screen.getByText('Örnek Rehber Yazısı')).toBeTruthy()
  })

  it('boş durum metni iki dilde de dolu ve birbirinden farklı (çevrilmemiş kopya yok)', () => {
    expect(tr.bilgiMerkezi.liste.bosBaslik.trim()).not.toBe('')
    expect(en.bilgiMerkezi.liste.bosBaslik.trim()).not.toBe('')
    expect(tr.bilgiMerkezi.liste.bosAciklama).not.toBe(en.bilgiMerkezi.liste.bosAciklama)
  })
})
