'use client'

import { useEffect } from 'react'

import type { AdminThemeResolved } from './themeCookie'

/** Tema kapsamını taşıyan öznitelik — `src/index.css` bu seçiciyle tanımlar. */
export const ADMIN_THEME_ATTR = 'data-admin-theme'

/**
 * Tema kapsamını `document.body`ye de basar — PORTAL'lar için.
 *
 * KUSUR (2026-08-18, kullanıcı bildirdi)
 *
 * Admin token'ları `src/index.css`'te `[data-admin-theme]` altında tanımlıdır ve
 * bu öznitelik yalnız `AdminLayout` içindeki `<div>`lerde yaşıyordu. Radix
 * `Dialog.Portal` / `DropdownMenu.Portal` ve `AdminSidePanel`'in `createPortal`'ı
 * içeriği `document.body`ye TAŞIR — yani portal ağacı, değişkenlerin tanımlı
 * olduğu kapsamın DIŞINDA kalıyordu.
 *
 * `hsl(var(--admin-surface))` tanımsız bir değişkenle geçersiz bir renge dönüşür.
 * İki belirti ayrı görünüyordu ama sebep TEKTİ:
 *
 *   · modal panelleri ŞEFFAF — altındaki tablo satırları modalın içinden görünüp
 *     etiketlerle çakışıyordu (Yeni Ürün, Yeni Kategori),
 *   · tema menüsünün seçenekleri OKUNAMIYOR — `text-admin-fg` düştüğü için metin
 *     miras alınan renge iniyordu (koyu temada koyu-üstüne-koyu).
 *
 * Düzeltme tek yerde olmak ZORUNDA: portal'ları tek tek `container` ile içeri
 * almak, her yeni overlay'de tekrar hatırlanması gereken bir disiplin yaratırdı
 * ve üçüncü parti portal'ları hiç kapsamazdı.
 *
 * NİÇİN `<html>` DEĞİL
 *
 * `[data-admin-theme] select option` gibi genel kurallar ve `color-scheme`
 * vitrine de sızardı. Gövdedeki işaret admin yüzeyi çözüldüğünde geri alınır.
 *
 * NİÇİN SUNUCUDA DEĞİL
 *
 * Gövdeyi kök yerleşim render eder; admin segmenti ona öznitelik basamaz. İlk
 * boyada portal İÇERİĞİ zaten yoktur (portal ancak etkileşimle doğar), bu yüzden
 * istemci etkisi bir sıçrama üretmez — sayfanın kendi teması ilk boyada
 * `<div>`den gelmeye devam eder.
 */
export function useAdminThemeBodyScope(themeResolved: AdminThemeResolved): void {
  useEffect(() => {
    const { body } = document
    /*
      Önceki değer saklanır, körü körüne silinmez: iki admin yüzeyi iç içe
      mount olursa (yerleşim + bir alt yerleşim) dıştakinin kapsamı, içteki
      çözüldüğünde kaybolmamalı.
    */
    const onceki = body.getAttribute(ADMIN_THEME_ATTR)
    body.setAttribute(ADMIN_THEME_ATTR, themeResolved)
    return () => {
      if (onceki === null) body.removeAttribute(ADMIN_THEME_ATTR)
      else body.setAttribute(ADMIN_THEME_ATTR, onceki)
    }
  }, [themeResolved])
}
