/**
 * URN-31 test kiti — "yayındaki modeller" listesini TEST içinde enjekte eder.
 *
 * NİÇİN: üretimdeki liste derleme sabitidir ve mekanizma PR'ında BOŞTUR (OPS hükmü: 30 SKU açma
 * PR'ında girer; repo PUBLIC). Model sayfası listede olmayan SKU için üretilmediğinden, model
 * adresini ölçen her test kendi sentetik listesini verir. Üretim koduna test girişi (kanca, ortam
 * değişkeni, ayarlanabilir sabit) EKLENMEDİ: gerçek modül `vi.mock` ile değiştirilir.
 *
 * SADE BİÇİM: testler yalnız SKU'ları verir; model adres metinleri (slug_tr / slug_en) burada
 * deterministik üretilir (`sentetikSlug`) — gerçek CSV'den okunmaz.
 *
 * KULLANIM (test dosyasının üstünde):
 *   vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())
 *   beforeEach(() => yayindaListesiAyarla({ modeller: { 'storm-serisi': ['SEA-61143003'] } }))
 *
 * `vi.resetModules()` kullanan testler durumu yitirir: onlar `yayindaModuluSahtele` ile fabrikada
 * veriyi kendi kapanışından verir (bkz. sitemapYayindaModel.test.ts).
 */
import { vi } from 'vitest'

import type * as GercekModul from '../yayindaModeller'

type Veri = GercekModul.YayindaVeri

/** Testlerin yazdığı sade liste: aile slug'ı → SKU'lar; sürüm SKU → temel SKU. */
export interface SadeListe {
  modeller?: Readonly<Record<string, readonly string[]>>
  surumler?: Readonly<Record<string, string>>
}

/** Sentetik model adres metni (küçük harf, ASCII, ayırıcı içermez; dil sonekli → iki dilde tekil). */
export const sentetikSlug = (sku: string, dil: 'tr' | 'en'): string => `m-${sku.trim().toLowerCase()}-${dil}`

/** Sade listeyi doğrulayıcıdan geçebilecek tam veriye çevirir. */
export function sentetikVeri(sade: SadeListe = {}): Veri {
  const metin = (sku: string) => ({ tr: sentetikSlug(sku, 'tr'), en: sentetikSlug(sku, 'en') })
  const modeller: Record<string, Record<string, { tr: string; en: string }>> = {}
  for (const [aile, skular] of Object.entries(sade.modeller ?? {})) {
    modeller[aile] = Object.fromEntries(skular.map((s) => [s, metin(s)]))
  }
  const surumler: Record<string, { temel: string; tr: string; en: string }> = {}
  for (const [surum, temel] of Object.entries(sade.surumler ?? {})) surumler[surum] = { temel, ...metin(surum) }
  return { modeller, surumler }
}

let aktif: Veri = sentetikVeri()

/** Sonraki çağrılar için sentetik listeyi kurar (verilmeyen alan boş). */
export function yayindaListesiAyarla(sade: SadeListe = {}): void {
  aktif = sentetikVeri(sade)
}

/** Ham veri ile kurar: mevcut testlerin beklediği ADRES METNİNİ (slug_tr/slug_en) birebir verebilmek için. */
export function yayindaVeriAyarla(v: Veri): void {
  aktif = v
}

/** Tek modelli ham veri kısayolu: `{ aile, sku, tr, en }` kayıtları → `YayindaVeri` (sürümsüz). */
export function modellerdenVeri(kayitlar: readonly { aile: string; sku: string; tr: string; en: string }[]): Veri {
  const modeller: Record<string, Record<string, { tr: string; en: string }>> = {}
  for (const k of kayitlar) (modeller[k.aile] ??= {})[k.sku] = { tr: k.tr, en: k.en }
  return { modeller, surumler: {} }
}

/** Gerçek modülün fonksiyonlarını verilen veriden okuyan sahte modül üretir. */
export function yayindaModuluSahtele(gercek: typeof GercekModul, veri: () => Veri): typeof GercekModul {
  const liste = () => gercek.yayindaListesiKur(veri())
  return {
    ...gercek,
    modelAdresiVarMi: (sku: unknown) => liste().modelAdresiVarMi(sku),
    sitemapModelMi: (sku: unknown) => liste().sitemapModelMi(sku),
    kanonikModelSku: (sku: unknown) => liste().kanonikModelSku(sku),
    modelSlugu: (sku: unknown, dil: 'tr' | 'en') => liste().modelSlugu(sku, dil),
    yayindaModelKayitlari: () => liste().kayitlar(),
  }
}

/** `vi.mock('@/config/yayindaModeller', …)` fabrikası için: durum bu modülde (`yayindaListesiAyarla`) tutulur. */
export async function sahteYayindaModulu(): Promise<typeof GercekModul> {
  const gercek = await vi.importActual<typeof GercekModul>('../yayindaModeller')
  return yayindaModuluSahtele(gercek, () => aktif)
}
