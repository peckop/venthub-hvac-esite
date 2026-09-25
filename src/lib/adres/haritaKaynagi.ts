/**
 * Middleware'in okuduğu eski adres haritası — TEK bağlantı noktası (REC-300 Faz 3 madde 4).
 *
 * ⚠BUGÜN null — BİLEREK. Üretilmiş harita (`src/data/generated/eski-adres-haritasi.json`) commit
 * edilmez (plan §4.1) ve derleme adımına henüz bağlı değil (`package.json` / `.gitignore` ALTYAPI'nın).
 * Dosya yokken buradan statik `import` yazmak derlemeyi kırar; boş bir iskelet commit'lemek ise
 * "harita var ama boş" hâlini üretir — bayrak açıldığında her eski adres sessizce 404 kalır.
 *
 * Faz 3-C (bayrak `true`) aynı PR'da bu satırı şuna çevirir:
 *   import uretilmis from '@/data/generated/eski-adres-haritasi.json'
 *   export const ESKI_ADRES_HARITASI: EskiAdresHaritaDosyasi | null = uretilmis as EskiAdresHaritaDosyasi
 * Kapı: `__tests__/bayrak-kapisi.test.ts` — `ADRES_SEMASI_K3B` true iken bu değer null ise KIRMIZI.
 */
import type { EskiAdresHaritaDosyasi } from './haritaTipi'

export const ESKI_ADRES_HARITASI: EskiAdresHaritaDosyasi | null = null
