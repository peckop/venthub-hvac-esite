import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { ADMIN_RESOURCES } from '../../config/admin-resources'
import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import { getDictValue } from '../../i18n/getDictValue'

/**
 * INV-ERP-RESOURCE-1 · Admin kaynak registry'si DAVRANIŞSAL bütünlük kapısı.
 *
 * Cetvel: `docs/standards/erp-workspace-design-standard.md §7` (yeni modül kontrol listesi)
 * + `admin-standard.md §10.4 S1` ("nav + arama + hızlı aksiyon TEK listeden").
 *
 * NİÇİN VAR — ölçülmüş boşluk (T133-VH §8/Ç3, 2026-08-20):
 * `src/config/admin-resources.ts` admin kabuğunun TEK giriş noktası; `AdminSidebar` ve
 * `CommandPalette` yalnız onu tüketir. Buna rağmen kaydı koruyan HİÇBİR kapı yoktu:
 *
 *   • `i18n-key-resolution.test.ts` — kapsamı `components/ views/ app/ hooks/`; `config/`
 *     DIŞARIDA. Üstelik yalnız `t('...')` ÇAĞRILARINI tarar, `labelKey: '...'` ALANINI değil.
 *     Yani iki ayrı sebeple bu dosyayı hiç görmüyor.
 *   • `tsc` — `labelKey` tipi `string`; var olmayan bir anahtar da geçerli bir string.
 *   • i18n parity — tr ve en AYNI eksik anahtarı taşırsa parity GEÇER.
 *   • lint/build — hata yok.
 *
 * Kaçan sınıf İKİ biçimde ölür, ikisi de SESSİZ:
 *   (1) `labelKey` sözlükte yoksa → çözücü HAM ANAHTAR döndürür → menüde
 *       "admin.menu.foo" yazar (2026-08-15 denetiminin bulduğu ailenin aynısı).
 *   (2) `route` gerçek bir sayfaya karşılık gelmiyorsa → menü öğesi 404'e götürür.
 *
 * KAPSAM DIŞI (bilinçli, sessiz cap DEĞİL): dinamik segment taşıyan rotalar
 * (`/admin/categories/[id]/builder`) registry'de köküyle temsil edilir; bu kapı
 * kök eşleşmesini yeterli sayar. RBAC (`requiredAccess`) doğruluğu bu kapının işi
 * değil — o `src/lib/rbac.ts` sahibinin (AUTH) alanı.
 */

const APP_ADMIN_DIR = path.resolve(__dirname, '../../app/admin')

/** Diskteki GERÇEK admin rotaları — `page.tsx` taşıyan her dizin bir rotadır. */
function gercekRotalar(dir: string, prefix = '/admin'): string[] {
  const out: string[] = []
  if (fs.existsSync(path.join(dir, 'page.tsx'))) out.push(prefix)
  for (const girdi of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!girdi.isDirectory()) continue
    out.push(...gercekRotalar(path.join(dir, girdi.name), `${prefix}/${girdi.name}`))
  }
  return out
}

const ROTALAR = new Set(gercekRotalar(APP_ADMIN_DIR))

describe('INV-ERP-RESOURCE-1 · admin kaynak registry bütünlüğü', () => {
  it('registry BOŞ DEĞİL — kapı vakumda yeşil vermez', () => {
    // Sessiz-boş sınıfı: kayıt listesi bir gün boşalırsa aşağıdaki iki test
    // sıfır kayıt üzerinde koşup GEÇER ve kapı kör olur.
    expect(ADMIN_RESOURCES.length).toBeGreaterThan(20)
    expect(ROTALAR.size).toBeGreaterThan(20)
  })

  it('her labelKey HEM tr HEM en sözlüğünde ÇÖZÜLÜR (ham anahtar dönmez)', () => {
    const kirik: string[] = []
    for (const r of ADMIN_RESOURCES) {
      if (getDictValue(tr, r.labelKey) === r.labelKey) kirik.push(`tr · ${r.key} → ${r.labelKey}`)
      if (getDictValue(en, r.labelKey) === r.labelKey) kirik.push(`en · ${r.key} → ${r.labelKey}`)
    }
    expect(kirik, `Sözlükte çözülmeyen labelKey (menüde HAM ANAHTAR görünür):\n${kirik.join('\n')}`).toEqual([])
  })

  it('her route diskte GERÇEK bir sayfaya karşılık gelir (menü 404 üretmez)', () => {
    const yetim: string[] = []
    for (const r of ADMIN_RESOURCES) {
      if (!ROTALAR.has(r.route)) yetim.push(`${r.key} → ${r.route}`)
    }
    expect(yetim, `src/app/admin altında page.tsx'i olmayan registry rotası:\n${yetim.join('\n')}`).toEqual([])
  })
})
