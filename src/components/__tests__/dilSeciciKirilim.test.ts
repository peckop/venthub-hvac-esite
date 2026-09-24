/**
 * Dil seçici HER ekran genişliğinde erişilebilir kalır: geniş ekranda yüzer, dar ekranda menüdedir.
 *
 * NİÇİN VAR (REC-89, 2026-09-24 canlı ölçüm, iPhone 13 görünümü): yüzen TR/EN düğmesi mobilde
 * ürün sayfasının küçük görsellerinin ve kart metninin üstüne biniyordu. Onarım düğmeyi mobilde
 * gizleyip açılır menünün üst satırına taşıdı. Bu onarımın tek tehlikesi şudur: iki kırılımdan biri
 * ileride değişirse (ör. yüzen düğme `md:block`, menü düğmesi `lg:hidden` kalırsa) aradaki genişlikte
 * dil seçici HİÇ bulunmaz — müşteri dili değiştiremez ve bunu hiçbir statik kapı görmez.
 *
 * Test üç kırılımın BİREBİR aynı olmasını ölçer:
 *  (1) yüzen dil seçici: `hidden <k>:block` · (2) menü düğmesi: `<k>:hidden` · (3) menüdeki dil seçici: `<k>:hidden`.
 * Yalnız eski gezinmede (YENI_KABUK_GEZINMESI kapalı) geçerlidir; yeni kabukta dil seçici alt
 * sekme çubuğundadır ve INV-ALTSEKME-1 onu ayrıca ölçer.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const oku = (...parca: string[]) => readFileSync(join(__dirname, '..', ...parca), 'utf8')

const anaYerlesim = oku('layout', 'MainLayout.tsx')
const baslik = oku('StickyHeader.tsx')
const menu = oku('MegaMenu.tsx')

describe('dil seçici kırılımları birbirini tamamlar', () => {
  // Yüzen dil seçicinin kapsayıcısı: bayrak kapalı dalındaki `<div className="... hidden <k>:block">` + `<LanguageSwitcher />`.
  const yuzen = anaYerlesim.match(/!YENI_KABUK_GEZINMESI && \(\s*<div className="[^"]*\bhidden (sm|md|lg|xl):block\b[^"]*">\s*<LanguageSwitcher \/>/)
  // Menü düğmesi: `openMenu()` çağıran NavActionButton'un className'i.
  const menuDugmesi = baslik.match(/openMenu\(\);[^\n]*className="(sm|md|lg|xl):hidden"/)
  // Menü içindeki dil seçici: `<div className="<k>:hidden ...">` + `<LanguageSwitcher id="menu-dil-secici" />`.
  const menudeki = menu.match(/<div className="(sm|md|lg|xl):hidden[^"]*">\s*<LanguageSwitcher id="menu-dil-secici" \/>/)

  it('üç yer de bulunur (sınıf ya da yapı değiştiyse testi güncelle)', () => {
    expect(yuzen, 'yüzen dil seçici `hidden <k>:block` kapsayıcısı bulunamadı').not.toBeNull()
    expect(menuDugmesi, 'menü düğmesinin `<k>:hidden` sınıfı bulunamadı').not.toBeNull()
    expect(menudeki, 'menüdeki dil seçici `<k>:hidden` kapsayıcısı bulunamadı').not.toBeNull()
  })

  it('yüzen seçicinin göründüğü kırılım = menü düğmesinin kaybolduğu kırılım', () => {
    expect(yuzen?.[1]).toBe(menuDugmesi?.[1])
  })

  it('menüdeki seçici menü düğmesiyle aynı kırılımda kaybolur', () => {
    expect(menudeki?.[1]).toBe(menuDugmesi?.[1])
  })
})
