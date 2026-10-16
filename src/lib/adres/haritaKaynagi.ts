/**
 * Middleware'in okuduğu eski adres haritası — TEK bağlantı noktası (REC-300 Faz 3 madde 4).
 *
 * Faz 3-C ile BAĞLANDI. Harita COMMIT'LİDİR (`src/data/generated/eski-adres-haritasi.json`): CI'da DB yok ve
 * derleme anında üretim DB'ye bağımlı olmamalı; üretim `harita-uret.yml` iş akışıyla (ALTYAPI) canlı DB'ye karşı
 * salt-okuma koşar, çıktı bu dosyaya konur. DB değişirse (katalog güncellemesi, yeni ürün/aile/kategori adı)
 * harita YENİDEN üretilip commit'lenir; bayat harita = eski adreslerin bir kısmı 404. Bayatlık kapısı:
 * `__tests__/harita-3c-karsiliklari.test.ts` (25 config kuralının, 8 yeni kategori adının ve `?sku=` davranışının
 * karşılığı) + zamanlanmış DB kolu (plan §4.1 INV-ADRES-HARITA-1).
 *
 * Kapı: `__tests__/bayrak-kapisi.test.ts` — `ADRES_SEMASI_K3B` true iken bu değer null ise KIRMIZI.
 */
import uretilmis from '@/data/generated/eski-adres-haritasi.json'

import type { EskiAdresHaritaDosyasi } from './haritaTipi'

export const ESKI_ADRES_HARITASI: EskiAdresHaritaDosyasi | null = uretilmis as EskiAdresHaritaDosyasi
