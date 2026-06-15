import { describe, expect, it } from 'vitest'

/**
 * INV-1 · Entity-i18n SSOT conformance (kalıcı bekçi).
 *
 * Kategori adı (display name) DAİMA SSOT üzerinden çözülmelidir:
 *   • getCategoryDisplayName(category, t)            — src/utils/categoryHelpers.ts
 *   • useCategoryViewModel (translation_key + dict)  — src/hooks/useCategoryViewModel.ts
 *
 * `common.categoryList` sözlüğünü doğrudan SLUG ile computed-index ile okumak SSOT'u
 * ATLAR: slug ile translation_key farklıysa yanlış / karışık dil üretir. 2026-06 anasayfa
 * bug'ı tam buydu — page.tsx slug kullandı, translation_key'i atladı.
 *
 * Bu test o kaçağı kaynak taramasıyla yakalar; biri tekrar yazarsa kırmızı yanar.
 * NOT 1: template-string path (sözlük indekslemesi DEĞİL) MEŞRU'dur; regex yalnız "[" ile
 *        yapılan computed index'i hedefler. Yorumlar taranmadan silinir → false-positive yok.
 * NOT 2: Kaynağı Vite'ın import.meta.glob('?raw')'ı ile okuyoruz — node 'fs'/'path' tipleri
 *        bu projede tsc'de çözülmüyor (diSignature.test.ts bu yüzden tsconfig exclude'da).
 *        Glob ile ne protected tsconfig'e dokunmak ne de tip-susturma direktifi gerekir.
 */

// import.meta.glob'u Vite birebir yazıldığında derler; vite/client tipleri yüklü
// olmadığından imzayı yerel olarak bildiriyoruz.
declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// SSOT'un kendisi + sözlük tanımları meşru. (Testler ayrıca aşağıda elenir.)
const ALLOWLIST = [
  'utils/categoryHelpers.ts',
  'lib/type-converters.ts',
  'i18n/dictionaries/',
]

// categoryList / categoryListDict ardından (?.)?[ → sözlüğü doğrudan indeksleme.
const DIRECT_INDEX = /categoryList\w*\s*(\?\.)?\s*\[/

/** Yorumları siler ki açıklayıcı yorumlardaki örnek desenler bekçiyi tetiklemesin. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')      // /* blok */ yorum
    .replace(/(^|[^:])\/\/.*$/gm, '$1')     // // satır yorum ("http://" gibi şemaları koru)
}

function toRelPath(globKey: string): string {
  const marker = '/src/'
  const idx = globKey.indexOf(marker)
  return (idx >= 0 ? globKey.slice(idx + marker.length) : globKey).replace(/\\/g, '/')
}

describe('INV-1 · entity-i18n SSOT conformance', () => {
  it('kategori adı için categoryList sözlüğü doğrudan indekslenmemeli (SSOT zorunlu)', () => {
    const offenders: string[] = []

    for (const [key, source] of Object.entries(SOURCES)) {
      const rel = toRelPath(key)
      if (rel.endsWith('.d.ts') || rel.includes('__tests__') || rel.includes('.test.')) continue
      if (ALLOWLIST.some((allowed) => rel.startsWith(allowed))) continue

      if (DIRECT_INDEX.test(stripComments(source))) offenders.push(rel)
    }

    expect(
      offenders,
      `SSOT-dışı kategori adı çözümü bulundu — getCategoryDisplayName kullan:\n  ${offenders.join('\n  ')}`,
    ).toEqual([])
  })
})
