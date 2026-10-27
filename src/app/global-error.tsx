'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect, useState } from 'react'

import { en } from '../i18n/dictionaries/en'
import { tr } from '../i18n/dictionaries/tr'
import type { Lang } from '../i18n/I18nContext'
import { VARSAYILAN_DIL, yoldanDilCoz } from '../i18n/yoldanDil'

/**
 * Kök düzende yakalanamayan çizim hatalarının son sınırı (ALT-46). Sentry'ye `captureException`
 * ile bildirir; ziyaretçiye sözlükten gelen kısa bir mesaj ve "tekrar dene" düğmesi gösterir.
 *
 * Bu dosya kök düzenin YERİNE geçer: `I18nProvider` ve Tailwind CSS yoktur. Bu yüzden dil yoldan
 * çözülür (`yoldanDilCoz`) ve görünüm sade tutulur. Metinler mevcut sözlük anahtarlarından gelir
 * (`common.errorGeneric`, `search.retry`); yeni anahtar eklenmedi. İlk çizim varsayılan dilde,
 * dil etkiden sonra ayarlanır (sunucu/istemci çizim uyuşmazlığı olmasın).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [dil, setDil] = useState<Lang>(VARSAYILAN_DIL)

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  useEffect(() => {
    setDil(yoldanDilCoz(window.location.pathname))
  }, [])

  const sozluk = dil === 'en' ? en : tr

  return (
    <html lang={dil}>
      <body>
        <main style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 1rem', textAlign: 'center' }}>
          <h1>{sozluk.common.errorGeneric}</h1>
          <button type="button" onClick={reset}>
            {sozluk.search.retry}
          </button>
        </main>
      </body>
    </html>
  )
}
