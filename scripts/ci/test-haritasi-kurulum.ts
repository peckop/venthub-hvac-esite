/**
 * ALT-38d · ölçüm kurulumu (ÖNCE): `test-haritasi.vitest.config.ts` bu dosyayı setupFiles listesinin BAŞINA koyar.
 * Kaydediciyi bu işçiye (iş parçacığı) kurar ve test dosyası bağlamını başlatır; sonraki kurulum dosyalarının okumaları
 * "kurulum" evresine yazılır (küresel bağımlılık: değişirse HER test etkilenir).
 */
import { createRequire } from 'node:module'

type Kaydedici = {
  kur: () => unknown
  basla: (testYolu: string, faz: string) => unknown
}

const kaydedici = createRequire(import.meta.url)('./test-haritasi-kaydedici.cjs') as Kaydedici
const isci = Reflect.get(globalThis, '__vitest_worker__') as { filepath?: string } | undefined

if (typeof isci?.filepath === 'string') {
  kaydedici.kur()
  kaydedici.basla(isci.filepath, 'kurulum')
}
