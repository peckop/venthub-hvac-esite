import { describe, expect, it } from 'vitest'

/**
 * INV-HERO-ROUTE-1 — anasayfa hero'sunda ham URL dizesi ve rota cast'i YASAK.
 *
 * NİÇİN (T141 denetimi, 2026-08-22 — ölçülmüş vaka):
 * `HomeSinevizyon.tsx` içindeki 3 slaytın 6 ürün linki elle yazılmış URL dizeleriydi:
 *   link: '/category/fans/duct-type-fans'
 *   link: '/category/fans/quiet-duct-fans'
 * Üç şey birden yanlıştı ve **altısı da kırıktı**:
 *   (a) `fans`, `duct-type-fans`, `quiet-duct-fans` slug'larının hiçbiri canlı DB'de YOK
 *       (`select ... where slug in (...)` → 0 satır; katalogda 31 kategori var).
 *   (b) Dil öneki yoktu — `/[lang]/category/...` şemasında `lang="category"` diye parse edilir.
 *   (c) `as import('next').Route` cast'i, Next.js'in tipli rota korumasını **susturuyordu**.
 *
 * ⭐MEVCUT KAPI NİÇİN GÖRMEDİ: `localized-route-ssot` testi "Routes'u import edip
 * localize etmeyen" dosyaları arıyor. Bu dosya `Routes`'u zaten doğru kullanıyordu
 * (başka bir bağlantı için) — kusur, Routes'un **yanlış kullanımı** değil, **hiç
 * kullanılmaması**ydı. Kapı bir kullanım biçimini ölçüyordu, yokluğunu değil.
 * Bu test tam o boşluğu kapatır.
 *
 * Kapsam bilinçli olarak DAR: yalnız hero bileşeni. Genel "ham rota literali" yasağı
 * INV-2'nin (localized-route-ssot) işidir ve o başka bir şeridin dosyasıdır; burada
 * onun kapsamını gasp etmeden, ölçülmüş vakanın yaşadığı yeri kilitliyoruz.
 */

const SOURCES: Record<string, string> = import.meta.glob('/src/components/home/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Yorumları siler — açıklayıcı yorumdaki örnek desen bekçiyi tetiklemesin. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

const HERO = Object.entries(SOURCES).find(([k]) => k.includes('HomeSinevizyon'))

describe('INV-HERO-ROUTE-1 — anasayfa hero rota SSOT', () => {
  it('hero bileseni bulunabiliyor (kapinin kendi onkosulu)', () => {
    // Dosya yeniden adlandirilirsa bu test SESSIZCE bos gecerdi; onkosul acikca olculur.
    expect(HERO, 'HomeSinevizyon kaynagi bulunamadi — kapi kor kalmis olabilir').toBeTruthy()
  })

  it('⭐ham kategori/urun URL dizesi YOK (SSOT disi yol yazilamaz)', () => {
    if (!HERO) return
    const clean = stripComments(HERO[1])
    // Elle yazilmis '/category/...' veya '/products/...' dizesi.
    const offenders = clean.match(/['"`]\/(?:category|products)\/[^'"`]*['"`]/g) ?? []
    expect(
      offenders,
      `Hero'da ham URL dizesi var — yol Routes.product()/Routes.category() ile uretilmeli:\n  ${offenders.join('\n  ')}`,
    ).toEqual([])
  })

  it('⭐rota cast (as Route) YOK — tipli rota korumasi susturulamaz', () => {
    if (!HERO) return
    const clean = stripComments(HERO[1])
    const offenders = clean.match(/as\s+(?:import\(['"]next['"]\)\.)?Route\b/g) ?? []
    expect(
      offenders,
      'Hero\'da rota cast\'i var — cast, Next.js tipli rota korumasini susturur ve kirik ' +
        'yolu derleme zamaninda gorunmez kilar. Yol SSOT yardimcisindan gelmeli.',
    ).toEqual([])
  })

  it('hero yol uretimi icin localize SSOT kullaniyor', () => {
    if (!HERO) return
    const clean = stripComments(HERO[1])
    expect(
      /useLocalizedRoutes\s*\(/.test(clean),
      'Hero, dil onekini SSOT\'tan almali (useLocalizedRoutes) — elle /tr/ eklenemez.',
    ).toBe(true)
  })
})
