// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { dilGecerliMi } from '@/i18n/yoldanDil'

import LangLayout from '../[lang]/layout'

/**
 * URN-15 derin savunma: `[lang]` parametresi desteklenen dil değilse 500 değil 404 (notFound).
 * Canlıda `/ai.txt` → `lang="ai.txt"` → `new Intl.Collator("ai.txt")` → RangeError → 500 idi.
 * `notFound()` Next'te `NEXT_HTTP_ERROR_FALLBACK;404` digest'li bir hata fırlatır.
 */
describe('dilGecerliMi', () => {
  it.each(['tr', 'en'])('%s geçerli', (dil) => {
    expect(dilGecerliMi(dil)).toBe(true)
  })

  it.each(['ai.txt', 'xyz.txt', 'TR', 'de', '', 'tr-TR'])('%j geçersiz', (dil) => {
    expect(dilGecerliMi(dil)).toBe(false)
  })
})

describe('[lang]/layout — geçersiz dil', () => {
  it.each(['ai.txt', 'llms-full.txt', 'xyz'])('%s → notFound', async (lang) => {
    await expect(
      LangLayout({ children: null, params: Promise.resolve({ lang }) }),
    ).rejects.toMatchObject({ digest: expect.stringContaining('404') })
  })

  it.each(['tr', 'en'])('%s → hata fırlatmaz', async (lang) => {
    await expect(
      LangLayout({ children: null, params: Promise.resolve({ lang }) }),
    ).resolves.toBeDefined()
  })
})
