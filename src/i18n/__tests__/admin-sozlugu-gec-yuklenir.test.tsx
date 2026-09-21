import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { AdminSozlukKapisi } from '@/components/admin/AdminSozlukKapisi'
import { I18nProvider, useI18n } from '@/i18n/I18nProvider'

/**
 * INV-ADMIN-SOZLUK-3 — admin sözlüğü GEÇ yüklenir ama TAM gelir (REC-59 Faz 2, karar 47).
 *
 * NİÇİN DAVRANIŞ TESTİ: Faz 2'nin paket ölçümü (admin sözlüğü müşteri paketinde 0 bayt)
 * yalnız "çıkarıldı"yı kanıtlar, "yerine geldi"yi kanıtlamaz. Bir ayırma işi iki şekilde
 * yanlış biter: sözlük çıkar ama yüklenmez (admin ekranı ham anahtar basar), ya da yüklenir
 * ama eksik gelir. Paket ölçümü ikisini de göremez — ikisi de ÇALIŞMA ZAMANI olayıdır.
 *
 * ⚠BU TEST TARAYICIDAKİ ADMIN EKRANININ YERİNE GEÇMEZ. Gerçek admin ekranı oturum ister;
 * bu test sözlüğün yükleme yolunu ve kabuğun bekleme davranışını ölçer, yetki/veri yolunu
 * DEĞİL. Tarayıcı ölçümü ayrı bir adım ve raporda ayrı yazılır.
 */

function AdminYazisi() {
  const { t } = useI18n()
  return <div data-testid="yazi">{t('admin.common.yes')}</div>
}

describe('INV-ADMIN-SOZLUK-3 · admin sözlüğü geç yüklenir ama tam gelir', () => {
  it('önce bekleme gösterir, sözlük gelince admin yazısını çizer (TR)', async () => {
    render(
      <I18nProvider lang="tr">
        <AdminSozlukKapisi>
          <AdminYazisi />
        </AdminSozlukKapisi>
      </I18nProvider>
    )

    // 1. AN: sözlük daha gelmedi → kabuk çizilmez, bekleme yazısı VİTRİN sözlüğünden gelir
    expect(screen.getByRole('status')).toBeTruthy()
    expect(screen.queryByTestId('yazi')).toBeNull()

    // 2. AN: dinamik import çözülür → çocuk çizilir ve admin yazısı GERÇEK karşılığıyla gelir
    await waitFor(() => expect(screen.getByTestId('yazi')).toBeTruthy())
    expect(screen.getByTestId('yazi').textContent).toBe('Evet')
  })

  it('İngilizcede de tam gelir (dil başına ayrı yükleme)', async () => {
    render(
      <I18nProvider lang="en">
        <AdminSozlukKapisi>
          <AdminYazisi />
        </AdminSozlukKapisi>
      </I18nProvider>
    )
    await waitFor(() => expect(screen.getByTestId('yazi')).toBeTruthy())
    expect(screen.getByTestId('yazi').textContent).toBe('Yes')
  })

  it('⭐ÇAPA: kapı OLMADAN admin yazısı HAM ANAHTAR basar (beklemenin niçin gerektiği)', async () => {
    render(
      <I18nProvider lang="tr">
        <AdminYazisi />
      </I18nProvider>
    )
    // Kapı yok → sözlük istenmez → anahtar çözülemez ve ham hâliyle basılır.
    // Kullanıcının "admin.common.yes" görmesi tam olarak budur; kapı bunu engelliyor.
    expect(screen.getByTestId('yazi').textContent).toBe('admin.common.yes')
  })
})
