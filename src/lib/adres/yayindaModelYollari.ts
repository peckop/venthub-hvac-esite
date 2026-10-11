import { yayindaModelKayitlari } from '@/config/yayindaModeller'
import { type AdresDili, adresUret } from '@/utils/adresUret'

/**
 * YAYINDAKİ MODELLERİN SAYFA YOLLARI — webhook tazelemesi için hazır yol üreticisi (URN-31).
 *
 * NİÇİN: webhook model sayfalarını (`/tr/urun/<slug>-p-<sku>`) tazelemiyordu (`tazemeYollari.ts` yalnız aile/
 * kategori); pilot modelleri ISR yedeğiyle (1 saat) bayat kalır. Webhook dosyası ALTYAPI'nındır: bağlama ONDAN
 * yapılır, bu modül yalnız yolları hazırlar. Yollar `adresUret`'in ÜRETTİĞİ model adresleridir (biçim kopyası yok):
 * biçim ya da liste değişince burası kendiliğinden izler.
 *
 * Her iki dil ve bayrak AÇIK şeması: bayrak derleme sabiti olduğundan açılış anında önceki derlemenin önbelleği ve
 * geri alma da aynı listeyle güvenlidir (`tazelemeYollari.ts` ile aynı gerekçe). Var olmayan yolu geçersiz kılmanın
 * maliyeti yok; eksik bırakmanın maliyeti bayat vitrin. Liste boşsa / SKU yayında değilse → boş küme.
 *
 * Saf: `next/cache` ya da DB'ye dokunmaz; çağıran `revalidatePath` yapar.
 */
const DILLER: readonly AdresDili[] = ['tr', 'en']

const yollar = (kayitlar: ReturnType<typeof yayindaModelKayitlari>): string[] => {
  const kume = new Set<string>()
  for (const k of kayitlar) {
    for (const dil of DILLER) kume.add(String(adresUret({ tur: 'model', aileSlug: k.aileSlug, sku: k.sku }, dil, true)))
  }
  return [...kume]
}

/** Yayındaki TÜM modellerin (sürümler dahil) yolları: kayıt × iki dil. */
export function yayindaModelYollari(): string[] {
  return yollar(yayindaModelKayitlari())
}

/** Bir SKU'nun model sayfası yolları (iki dil); SKU yayında değilse / geçersizse boş. Sürüm kendi yollarını verir. */
export function skuModelYollari(sku: string): string[] {
  const kimlik = typeof sku === 'string' ? sku.trim().toUpperCase() : ''
  return yollar(yayindaModelKayitlari().filter((k) => k.sku === kimlik))
}

/** Bir ailenin yayındaki tüm model sayfası yolları (aile adı/kategorisi değişince modeller de bayatlar). */
export function aileModelYollari(aileSlug: string): string[] {
  return yollar(yayindaModelKayitlari().filter((k) => k.aileSlug === aileSlug))
}
