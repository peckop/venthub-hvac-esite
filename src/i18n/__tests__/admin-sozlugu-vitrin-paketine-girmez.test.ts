import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { admin as adminEn } from '../dictionaries/admin/en'
import { admin as adminTr } from '../dictionaries/admin/tr'
import { en } from '../dictionaries/en'
import { tr } from '../dictionaries/tr'

/**
 * INV-ADMIN-SOZLUK-2 — admin sözlüğü VİTRİN PAKETİNE girmez (REC-59 Faz 2, karar 47).
 *
 * NİÇİN VAR — canlı ölçüm (2026-09-18):
 * `src/i18n/dictionaries/tr.ts` admin sözlüğünü STATİK import ediyordu. Sonuç: admin
 * sözlüğü, müşteri sayfalarının indirdiği JS parçasına giriyordu —
 * `static/chunks/7681-*.js` = **356.040 bayt** ve ana sayfa bunu indiriyordu. Müşteri
 * "Kuponlar", "Stok Hareketleri", "Denetim Kaydı" gibi hiç görmeyeceği yazıları taşıyordu.
 * Aynı gün ölçülen kardeş kusur: sözlüğün TAMAMI sayfa HTML'ine de gömülüyordu (ana sayfa
 * 430.617 bayttı, 205.991'i sözlüktü = %47,8); o kısım REC-59 Faz 0/1'de kapandı ve canlıda
 * doğrulandı (sayfa 224.537 bayta düştü). Bu kapı KALAN kısmı, yani paket tarafını korur.
 *
 * ⭐KUSURUN SINIFI: sessiz geri alma. Biri `import { admin } from './admin/tr'` satırını
 * geri koyarsa kod derlenir, tipler geçer, bütün ekranlar DOĞRU çalışır — yalnız paket
 * yeniden şişer. Hiçbir davranış testi bunu görmez; ölçüt davranış değil, PAKET İÇERİĞİ.
 *
 * ⛔`import type` SERBEST: TypeScript tip-only import'u derlemede siler, pakete bir bayt
 * eklemez. Kapı bu ayrımı yapar — yapmasaydı `I18nContext.ts`'teki meşru tip importunu
 * yanlış kırmızı verirdi (ve o satır silinseydi admin kodunda otomatik tamamlama ölürdü).
 */

const PROJE_KOKU = join(__dirname, '..', '..', '..')

/** Vitrin sözlüğünün kökünden başlayan, admin sözlüğüne DEĞER olarak bağlanamayacak dosyalar. */
const VITRIN_SOZLUK_DOSYALARI = [
  join('src', 'i18n', 'dictionaries', 'tr.ts'),
  join('src', 'i18n', 'dictionaries', 'en.ts'),
  join('src', 'i18n', 'I18nProvider.tsx'),
  join('src', 'i18n', 'I18nContext.ts'),
]

/**
 * DEĞER importu: `import { admin } from './admin/tr'` · `import x from "./admin/en"`.
 * TİP importu (serbest): `import type { admin } from './admin/tr'`.
 * Dinamik import (serbest ve istenen): `await import('./dictionaries/admin/tr')`.
 */
/**
 * ⚠DESENİN İLK HÂLİ KÖRDÜ, çapa testi yakaladı: yol içinde `dictionaries/` geçmesini
 * bekliyordum, oysa kusurun yaşadığı asıl satır `dictionaries/tr.ts` İÇİNDE ve göreli
 * yazılıyor: `import { admin } from './admin/tr'`. Yani kapı, var olma sebebi olan tek
 * satırı kaçırıyordu ve yeşil yanacaktı. Desen artık `admin/tr` ya da `admin/en` ile
 * BİTEN her yolu tanır; `@/components/admin/Foo` gibi yolları tanımaz.
 */
const DEGER_IMPORT_DESENI =
  /^\s*import\s+(?!type\b)[^;]*?from\s+['"][^'"]*admin\/(?:tr|en)(?:\.[jt]sx?)?['"]/gm

function anahtarlar(nesne: object, onek = ''): string[] {
  return Object.entries(nesne).flatMap(([k, v]) => {
    const tam = onek ? `${onek}.${k}` : k
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      return anahtarlar(v, tam)
    }
    return [tam]
  })
}

/** Saf fonksiyon — çapa testi bunu ölçer, dosya okumadan. */
export function degerImportlari(kaynak: string): string[] {
  return (kaynak.match(DEGER_IMPORT_DESENI) ?? []).map(s => s.trim())
}

describe('INV-ADMIN-SOZLUK-2 · admin sözlüğü vitrin paketine girmez', () => {
  it('1. KOL: vitrin sözlük dosyaları admin sözlüğünü DEĞER olarak import etmez', () => {
    const ihlaller: string[] = []
    for (const yol of VITRIN_SOZLUK_DOSYALARI) {
      const kaynak = readFileSync(join(PROJE_KOKU, yol), 'utf8')
      for (const satir of degerImportlari(kaynak)) ihlaller.push(`${yol} → ${satir}`)
    }
    if (ihlaller.length > 0) {
      console.error(
        '[INV-ADMIN-SOZLUK-2] Admin sözlüğü vitrin sözlüğüne DEĞER olarak bağlanmış.\n' +
          'Bu, admin sözlüğünü müşteri paketine geri sokar (ölçüm: 356.040 baytlık parça).\n' +
          'ONARIM: tip gerekiyorsa `import type`, çalışma zamanı gerekiyorsa dinamik `import()`.\n' +
          ihlaller.map(s => `  · ${s}`).join('\n')
      )
    }
    expect(ihlaller).toEqual([])
  })

  it('2. KOL: vitrin sözlüğünde admin bölümü YOKTUR (çalışma zamanı kanıtı)', () => {
    expect(Object.prototype.hasOwnProperty.call(tr, 'admin')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(en, 'admin')).toBe(false)
  })

  it('3. KOL: admin sözlüğü dinamik yükleniyor — sağlayıcıda import() çağrısı var', () => {
    const saglayici = readFileSync(join(PROJE_KOKU, 'src', 'i18n', 'I18nProvider.tsx'), 'utf8')
    expect(saglayici).toMatch(/import\(\s*'\.\/dictionaries\/admin\/tr'\s*\)/)
    expect(saglayici).toMatch(/import\(\s*'\.\/dictionaries\/admin\/en'\s*\)/)
  })

  it('4. KOL: admin TR/EN anahtar paritesi korunuyor (vitrin paritesi artık kapsamıyor)', () => {
    const trK = anahtarlar(adminTr).sort()
    const enK = anahtarlar(adminEn).sort()
    const trdeEksik = enK.filter(k => !trK.includes(k))
    const endeEksik = trK.filter(k => !enK.includes(k))
    if (trdeEksik.length || endeEksik.length) {
      console.error('[INV-ADMIN-SOZLUK-2] admin sözlüğü parite kaybı:', { trdeEksik, endeEksik })
    }
    expect(trdeEksik).toEqual([])
    expect(endeEksik).toEqual([])
    expect(trK.length).toBeGreaterThan(500) // sözlük boşalırsa parite "yeşil" görünürdü
  })

  it('⭐ÇAPA: dedektör değer importunu yakalar, tip ve dinamik importu yakalamaz', () => {
    // POZİTİF — kusurun gerçek yazılış biçimleri
    expect(degerImportlari("import { admin } from './admin/tr'")).toHaveLength(1) // dictionaries/tr.ts içindeki göreli hâl
    expect(degerImportlari('import adminEn from "../dictionaries/admin/en"')).toHaveLength(1)
    expect(degerImportlari("import { admin } from '@/i18n/dictionaries/admin/tr'")).toHaveLength(1)
    // NEGATİF — kapı her şeyi reddetmiyor
    expect(degerImportlari("import type { admin } from './admin/tr'")).toEqual([])
    expect(degerImportlari("const m = await import('./dictionaries/admin/tr')")).toEqual([])
    expect(degerImportlari("import { tr } from './tr'")).toEqual([])
    expect(degerImportlari("import { AdminSozlukKapisi } from '@/components/admin/AdminSozlukKapisi'")).toEqual([])
  })
})
