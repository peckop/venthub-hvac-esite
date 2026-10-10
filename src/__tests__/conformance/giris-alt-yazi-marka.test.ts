/**
 * INV-GIRIS-ALT-YAZI-1 — giriş sayfası alt yazısı yasal unvan taşımaz (URN-83).
 *
 * KORUDUĞU KUSUR: giriş sayfasının altında "© 2026 VentHub HVAC Solutions." yazıyordu. Şirket henüz kurulmadı;
 * "… Solutions." bir tescilli unvan gibi okunur ve olmayan bir tüzel kişiyi var gösterir. Bu yüzden alt yazı yalnız
 * marka adını ("© 2026 VentHub") taşır. Unvan kesinleşip yasal ayara yazıldığında (`legalConfig.sellerTitle` dolunca)
 * kısıt kendiliğinden kalkar ve değer tescilli unvanla DEĞİŞTİRİLİR; bu kapı o gün bilerek güncellenmez, kalkar.
 *
 * NE ÖLÇMEZ: alt yazının tarayıcıda çizildiğini (LoginPage render edilmez; kaynak + sözlük okunur).
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import legalConfig, { satisIcinEksikSaticiAlanlari } from '../../config/legal'
import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'

const KOK = process.cwd()
const govde = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

/** Tüzel kişilik eki / unvan kalıbı: bunlardan biri varsa değer artık bir "marka adı" değil, iddia edilen bir unvandır. */
const UNVAN_KALIBI = /\b(solutions|a\.?ş\.?|ltd\.?|limited|şti\.?|inc\.?|llc|gmbh|corp\.?)\b/i

const SIRKET_KURULMADI = satisIcinEksikSaticiAlanlari(legalConfig).includes('sellerTitle')

describe('INV-GIRIS-ALT-YAZI-1 — giriş alt yazısı yasal unvan taşımaz', () => {
  it('ÖLÇÜM KONTROLÜ: alt yazı sözlük anahtarı sayfada kullanılıyor ve iki sözlükte de var', () => {
    const giris = govde(fs.readFileSync(path.join(KOK, 'src', 'views', 'LoginPage.tsx'), 'utf8'))
    expect(giris, "LoginPage © satırı artık common.brandLegalName'den okumuyor: ölçüt kör").toMatch(
      /&copy;\s*\{new Date\(\)\.getFullYear\(\)\}\s*\{t\('common\.brandLegalName'\)\}/,
    )
    expect(tr.common.brandLegalName.length).toBeGreaterThan(0)
    expect(en.common.brandLegalName.length).toBeGreaterThan(0)
  })

  it('şirket kurulana kadar: alt yazı yalnız marka adı (TR ve EN)', () => {
    // Kısıt yalnız satıcı unvanı yer tutucuyken geçerli; unvan yazılınca kendiliğinden kalkar.
    if (!SIRKET_KURULMADI) return
    expect(tr.common.brandLegalName).toBe(tr.common.brand)
    expect(en.common.brandLegalName).toBe(en.common.brand)
    expect(tr.common.brandLegalName).toBe('VentHub')
    expect(en.common.brandLegalName).toBe('VentHub')
  })

  it('şirket kurulana kadar: alt yazı tüzel kişilik eki / unvan kalıbı taşımaz', () => {
    if (!SIRKET_KURULMADI) return
    expect(tr.common.brandLegalName).not.toMatch(UNVAN_KALIBI)
    expect(en.common.brandLegalName).not.toMatch(UNVAN_KALIBI)
  })

  it('eski ifade ("VentHub HVAC Solutions") kodun hiçbir yerinde geri gelmedi', () => {
    const ihlaller: string[] = []
    const tara = (dizin: string) => {
      for (const ad of fs.readdirSync(dizin)) {
        const yol = path.join(dizin, ad)
        if (fs.statSync(yol).isDirectory()) {
          if (ad === 'node_modules' || ad === '__tests__') continue
          tara(yol)
          continue
        }
        if (!/\.(ts|tsx)$/.test(ad) || /\.test\.(ts|tsx)$/.test(ad)) continue
        if (/VentHub HVAC Solutions/.test(govde(fs.readFileSync(yol, 'utf8')))) {
          ihlaller.push(path.relative(KOK, yol).replace(/\\/g, '/'))
        }
      }
    }
    tara(path.join(KOK, 'src'))
    expect(ihlaller, 'olmayan bir tüzel kişiyi var gösteren unvan geri gelmiş').toEqual([])
  })
})
