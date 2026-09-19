'use client'

import React, { useEffect } from 'react'

import { useI18n } from '@/i18n/I18nProvider'

/**
 * ADMIN SÖZLÜK KAPISI (REC-59 Faz 2, karar 47).
 *
 * NE YAPAR: admin kabuğu açılır açılmaz admin sözlüğünü ister ve sözlük gelene kadar
 * altındaki ekranı ÇİZMEZ.
 *
 * NİÇİN BEKLETİYOR: admin sözlüğü artık dinamik yükleniyor (vitrin paketinden çıkarıldı,
 * ölçüm için bkz. `I18nProvider.adminSozluguGetir`). Beklemeseydik ekran bir kare boyunca
 * ham anahtarlarla çizilirdi — kullanıcı "admin.users.title" gibi yazılar görürdü. Bu, bir
 * gecikmeden daha kötüdür: hata gibi görünür ve ekran görüntüsü alan kişi bunu bize hata
 * olarak bildirir.
 *
 * ⚠BEKLERKEN GÖSTERİLEN YAZI VİTRİN SÖZLÜĞÜNDEN GELİR (`common.loading`). Admin sözlüğünden
 * bir yazı seçemeyiz — beklediğimiz şey tam olarak o sözlük. Bu, "bekleme ekranının dili"
 * tuzağıdır: yüklenmeyen sözlükten yazı istemek sessizce ham anahtar basar.
 */
export function AdminSozlukKapisi({ children }: { children: React.ReactNode }) {
  const { ensureAdminDict, adminDictReady, t, lang } = useI18n()

  useEffect(() => {
    ensureAdminDict()
  }, [ensureAdminDict, lang])

  if (!adminDictReady) {
    /*
      Biçim, admin sayfalarının kendi bekleme kutusuyla aynı (ör. audit-logs/page.tsx):
      `p-8 text-center text-admin-fg-muted animate-pulse`. Keyfi Tailwind değeri YOK
      (kural 8) — ilk yazımda `min-h-[40vh]` kullanmıştım, derleme kapısı reddetti.
    */
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-8 text-center text-admin-fg-muted animate-pulse"
      >
        {t('common.loading')}
      </div>
    )
  }

  return <>{children}</>
}

export default AdminSozlukKapisi
