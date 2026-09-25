import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { en } from '../../../i18n/dictionaries/en'
import { tr } from '../../../i18n/dictionaries/tr'
import BilgiMerkeziListe from '../../../views/knowledge/BilgiMerkeziListe'
import { bolumAcik } from '../../../views/knowledge/bilgiMerkeziRotasi'
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
