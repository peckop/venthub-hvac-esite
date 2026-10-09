/**
 * ALT-38d · ölçüm kurulumu (SONRA): setupFiles listesinin SONUNA konur. Buraya gelindiğinde projenin kendi kurulum dosyaları
 * (`vitest.setup.ts`, `vitest-setup.tsx`) bitmiştir; bundan sonrası test dosyasının içe aktarılması ve koşusudur.
 * Evre "test"e geçer ve dosya bitince ham kayıt klasöre yazılır (`afterAll`: test kırmızı olsa da koşar).
 */
import { createRequire } from 'node:module'

import { afterAll } from 'vitest'

type Kaydedici = {
  fazDegistir: (faz: string) => void
  bitir: () => string | null
}

const kaydedici = createRequire(import.meta.url)('./test-haritasi-kaydedici.cjs') as Kaydedici
const isci = Reflect.get(globalThis, '__vitest_worker__') as { filepath?: string } | undefined

if (typeof isci?.filepath === 'string') {
  kaydedici.fazDegistir('test')
  afterAll(() => {
    kaydedici.bitir()
  })
}
