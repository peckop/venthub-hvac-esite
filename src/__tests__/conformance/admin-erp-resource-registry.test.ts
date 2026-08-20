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
 * kök eşleşmesini yeterli sayar. `requiredAccess` değerinin RBAC'ta ÇALIŞMA ANINDA
 * ne yaptığı bu kapının işi değil — o `src/lib/rbac.ts` sahibinin (AUTH) alanı;
 * burada yalnız rotayla TUTARLILIĞI ölçülür.
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
    // Sessiz-boş sınıfı: kayıt listesi bir gün boşalırsa aşağıdaki testler
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
    expect(kirik, `Sözlükte çözülmeyen labelKey (menüde HAM ANAHTAR görünür): ${kirik.join(' · ')}`).toEqual([])
  })

  it('her route diskte GERÇEK bir sayfaya karşılık gelir (menü 404 üretmez)', () => {
    const yetim: string[] = []
    for (const r of ADMIN_RESOURCES) {
      if (!ROTALAR.has(r.route)) yetim.push(`${r.key} → ${r.route}`)
    }
    expect(yetim, `src/app/admin altında page.tsx'i olmayan registry rotası: ${yetim.join(' · ')}`).toEqual([])
  })

  /*
   * Aşağıdaki iki kontrol LEGAL şeridinin (eda80084) `admin-resource-integrity.test.ts`
   * taslağından alındı — PR #701, R3 ve R4. Aynı boşluğu aynı gün iki şerit kapattı;
   * OPS-AUDIT kapının ADMIN'de kalmasına hükmetti, LEGAL kendi dosyasını #701'den çıkardı.
   * Onların BENDE OLMAYAN iki kontrolünü kaynak göstererek devraldım: aynı şeyi ölçen iki
   * kapı zamanla ayrışır ve hangisinin otorite olduğu belirsizleşir — birini gevşetip
   * diğerini unuttuğunda "kapı var" hissi kalır, koruma kalmaz. Tek kapı iki kapıdan iyidir.
   */

  it('requiredAccess rotayla TUTARLI — öğe başka sayfanın iznine bağlanmamış', () => {
    // Kaynak: LEGAL / PR #701, R3.
    const tutarsiz = ADMIN_RESOURCES
      .filter((r) => r.requiredAccess && !r.route.startsWith(r.requiredAccess))
      .map((r) => `${r.key}: route=${r.route} requiredAccess=${r.requiredAccess}`)
    expect(
      tutarsiz,
      `requiredAccess rotanın önekiyle uyuşmuyor — öğe BAŞKA bir sayfanın iznine bağlanmış: ${tutarsiz.join(' · ')}`,
    ).toEqual([])
  })

  it('key TEKİL — registry iki kez tüketiliyor (sidebar + komut paleti)', () => {
    // Kaynak: LEGAL / PR #701, R4.
    const sayac = new Map<string, number>()
    for (const r of ADMIN_RESOURCES) sayac.set(r.key, (sayac.get(r.key) ?? 0) + 1)
    const tekrar = [...sayac.entries()].filter(([, n]) => n > 1).map(([k]) => k)
    expect(tekrar, `Aynı key birden fazla tanımlı — menüde çift öğe doğar: ${tekrar.join(' · ')}`).toEqual([])
  })
})
