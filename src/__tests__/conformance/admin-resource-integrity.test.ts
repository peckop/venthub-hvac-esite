import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-ADMIN-RESOURCE-1 — admin kaynak registry'si gerçekten var olan şeyi gösterir.
 *
 * NİÇİN VAR
 *
 * `admin-resources.ts` sidebar'ı, komut paletini ve breadcrumb'ı besleyen TEK kaynaktır
 * (cetvel `admin-standard.md §10.4 S1`). Yeni bir satır eklemenin beş şartı vardı —
 * tek nesne, mevcut grup, alfabetik ikon, `labelKey` iki sözlükte de var, `route` gerçek —
 * ama bunları ölçen **hiçbir kapı yoktu**: şartlar insan disiplininde yaşıyordu.
 * ADMIN-CUSTOMER şeridi bu boşluğu 2026-08-20'de bildirdi; kapı burada kapanıyor.
 *
 * Boşluğun bedeli somut: `labelKey` sözlükte yoksa çözücü anahtarı bulamaz ve menüye
 * **ham anahtar** basılır (bu depoda yaşanmış sınıf). `route` gerçek bir sayfaya
 * gitmiyorsa menü öğesi 404'e götürür ve kimse fark etmez, çünkü hiçbir test
 * registry ile dosya sistemini karşılaştırmıyordu.
 *
 * KAPININ GÖREMEDİĞİ (dürüst sınır): tarama STATİKTİR. `requiredAccess` değerinin
 * RBAC'ta gerçekten anlamlı olduğunu değil, yalnızca rotayla tutarlı olduğunu ölçer;
 * rolün o rotayı görüp göremediği çalışma anı sorusudur.
 */

const KOK = path.resolve(__dirname, '../../..')
const REGISTRY = path.join(KOK, 'src/config/admin-resources.ts')
const MENU_TR = path.join(KOK, 'src/i18n/dictionaries/admin/menu.tr.ts')
const MENU_EN = path.join(KOK, 'src/i18n/dictionaries/admin/menu.en.ts')

interface Kaynak {
  key: string
  labelKey: string
  route: string
  requiredAccess: string
}

/** Registry'yi metin olarak ayrıştırır — modülü import etmek lucide/React zinciri getirir. */
function kaynaklar(): Kaynak[] {
  const kaynak = readFileSync(REGISTRY, 'utf8')
  const bloklar = kaynak.split(/\n\s*\{/).slice(1)
  const cikti: Kaynak[] = []
  for (const b of bloklar) {
    const al = (alan: string) => {
      const m = b.match(new RegExp(`\\b${alan}:\\s*'([^']+)'`))
      return m ? m[1] : ''
    }
    const key = al('key')
    const route = al('route')
    if (!key || !route) continue
    cikti.push({ key, labelKey: al('labelKey'), route, requiredAccess: al('requiredAccess') })
  }
  return cikti
}

/** Sözlükteki düz anahtarlar: `menu` nesnesinin birinci seviye alan adları. */
function menuAnahtarlari(dosya: string): Set<string> {
  const metin = readFileSync(dosya, 'utf8')
  return new Set([...metin.matchAll(/^\s{2,}(\w+):/gm)].map((m) => m[1]))
}

/** Rota gerçek bir sayfaya karşılık geliyor mu? Dinamik segment varsa klasör yeter. */
function rotaVar(route: string): boolean {
  const rel = route.replace(/^\//, '')
  const taban = path.join(KOK, 'src/app', rel)
  return (
    existsSync(path.join(taban, 'page.tsx')) ||
    existsSync(path.join(taban, 'page.ts')) ||
    existsSync(taban)
  )
}

describe('INV-ADMIN-RESOURCE-1 — admin kaynak registry bütünlüğü', () => {
  const hepsi = kaynaklar()

  it('R0 — ayrıştırıcı gerçekten kaynak buluyor (sahte-yeşil kilidi)', () => {
    expect(
      hepsi.length,
      'admin-resources.ts ayrıştırılamadı — desen değişmiş olabilir, kapı KÖR koşuyor',
    ).toBeGreaterThan(10)
    expect(hepsi.some((k) => k.key === 'orders')).toBe(true)
  })

  it('R0b — dedektör sağlıklı: olmayan rota gerçekten YOK görünür', () => {
    expect(rotaVar('/admin/orders')).toBe(true)
    expect(rotaVar('/admin/boyle-bir-sayfa-yok')).toBe(false)
  })

  it('R1 — her labelKey İKİ menü sözlüğünde de var (ham anahtar ekrana basılmaz)', () => {
    const tr = menuAnahtarlari(MENU_TR)
    const en = menuAnahtarlari(MENU_EN)
    const eksik: string[] = []

    for (const k of hepsi) {
      // `admin.menu.*` dışındaki anahtarlar başka sözlük ağacında yaşar (ör. quotes.admin.*)
      const m = k.labelKey.match(/^admin\.menu\.(\w+)$/)
      if (!m) continue
      if (!tr.has(m[1])) eksik.push(`${k.key}: menu.tr.ts içinde "${m[1]}" YOK`)
      if (!en.has(m[1])) eksik.push(`${k.key}: menu.en.ts içinde "${m[1]}" YOK`)
    }

    expect(
      eksik,
      '\nMenü etiketi sözlükte bulunamadı. Çözücü anahtarı çözemezse menüye HAM ANAHTAR ' +
        'basılır — kullanıcı "admin.menu.invoices" görür. İki dilde de eklenmelidir.',
    ).toEqual([])
  })

  it('R2 — her route gerçek bir sayfaya gidiyor (menü 404 üretmez)', () => {
    const kirik = hepsi.filter((k) => !rotaVar(k.route)).map((k) => `${k.key} → ${k.route}`)
    expect(
      kirik,
      '\nRegistry’de olan ama dosya sisteminde OLMAYAN rota var. Menü öğesi 404’e götürür ' +
        've bunu hiçbir test görmezdi.',
    ).toEqual([])
  })

  it('R3 — requiredAccess rotayla tutarlı (yanlış kapıya bağlanmış öğe yok)', () => {
    const tutarsiz = hepsi
      .filter((k) => k.requiredAccess && !k.route.startsWith(k.requiredAccess))
      .map((k) => `${k.key}: route=${k.route} requiredAccess=${k.requiredAccess}`)
    expect(
      tutarsiz,
      '\nrequiredAccess rotanın önekiyle uyuşmuyor. Öğe BAŞKA bir sayfanın iznine bağlanmış ' +
        'demektir: kullanıcı göremeyeceği bir yere yönlendirilir ya da görmemesi gereken ' +
        'bir öğeyi görür.',
    ).toEqual([])
  })

  it('R4 — anahtarlar tekil (registry iki kez tüketiliyor: sidebar + komut paleti)', () => {
    const sayac = new Map<string, number>()
    for (const k of hepsi) sayac.set(k.key, (sayac.get(k.key) ?? 0) + 1)
    const tekrar = [...sayac.entries()].filter(([, n]) => n > 1).map(([k]) => k)
    expect(tekrar, '\nAynı key birden fazla kez tanımlı — menüde çift öğe doğar.').toEqual([])
  })
})
