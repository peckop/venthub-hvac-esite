import { describe, expect, it } from 'vitest'
import { tr } from '../../i18n/dictionaries/tr'
import { getDictValue } from '../../i18n/getDictValue'

// Vite's raw glob loading for scanning files in the codebase
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

function verifyNoDotsInPropertyNames(obj: Record<string, unknown>, pathPrefix = ''): string[] {
  const offenders: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key
    if (key.includes('.')) {
      offenders.push(fullPath)
    }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      offenders.push(...verifyNoDotsInPropertyNames(value as Record<string, unknown>, fullPath))
    }
  }
  return offenders
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/(^|[^:])\/\/.*$/gm, '$1') // line comments
}

function toRelPath(globKey: string): string {
  const marker = '/src/'
  const idx = globKey.indexOf(marker)
  return (idx >= 0 ? globKey.slice(idx + marker.length) : globKey).replace(/\\/g, '/')
}

describe('INV-i18n · i18n key and structure conformance', () => {
  it('nested-only: no flat dictionary keys should contain dots', () => {
    const trOffenders = verifyNoDotsInPropertyNames(tr as Record<string, unknown>)
    expect(
      trOffenders,
      `Flat dotted keys found in dictionary. Use real nested objects instead:\n  ${trOffenders.join('\n  ')}`,
    ).toEqual([])
  })

  it('keycheck: all static t(...) calls in codebase must resolve in translation dictionaries', () => {
    const missingKeys: { file: string; key: string }[] = []
    const staticKeyRegex = /\bt\(\s*['"]([a-zA-Z0-9_.-]+)['"]\s*[),]/g

    for (const [key, source] of Object.entries(SOURCES)) {
      const rel = toRelPath(key)
      if (
        rel.endsWith('.d.ts') ||
        rel.includes('__tests__') ||
        rel.includes('.test.') ||
        rel.startsWith('i18n/dictionaries/') ||
        rel === 'i18n/I18nProvider.tsx' ||
        rel === 'i18n/getDictValue.ts'
      ) {
        continue
      }

      const clean = stripComments(source)
      let match
      // Reset regex index
      staticKeyRegex.lastIndex = 0
      while ((match = staticKeyRegex.exec(clean)) !== null) {
        const tKey = match[1]
        // Check if the key starts with 'common.' or 'legal.' or 'admin.'
        // Exclude common next/third-party keys if any
        if (
          !tKey.startsWith('common.') &&
          !tKey.startsWith('legal.') &&
          !tKey.startsWith('admin.') &&
          !tKey.startsWith('homeGallery.') &&
          !tKey.startsWith('homeShowcase.') &&
          !tKey.startsWith('products.') &&
          !tKey.startsWith('search.') &&
          !tKey.startsWith('resources.') &&
          !tKey.startsWith('knowledge.') &&
          !tKey.startsWith('home.') &&
          !tKey.startsWith('megamenu.') &&
          !tKey.startsWith('header.') &&
          !tKey.startsWith('roles.')
        ) {
          continue
        }

        const resolved = getDictValue(tr, tKey)
        if (resolved === tKey) {
          missingKeys.push({ file: rel, key: tKey })
        }
      }
    }

    const uniqueMissing = Array.from(new Set(missingKeys.map(m => `${m.file} -> ${m.key}`)))

    expect(
      uniqueMissing,
      `Missing i18n keys found in codebase (these keys are called with t() but not defined in tr.ts):\n  ${uniqueMissing.join('\n  ')}`,
    ).toEqual([])
  })
})
