import type { RehberHedefi } from './tersDizin'

/**
 * REC-300 Faz 1-B (#1352) aile yeniden adlandırması: YENİ aile slug'ı → rehberlerin (`yazilar.ts`)
 * hâlâ bağlı olduğu ESKİ slug'lar.
 *
 * NİÇİN: ters dizin (`ilgiliRehberler`) aile sayfasından rehbere TAM dizgi eşleşmesiyle bakar.
 * Rehberler `vh:aile/danfoss-fc51` yazar; migration aileyi `danfoss-vlt-micro-drive-fc-51` yapınca
 * aile sayfasındaki "ilgili rehberler" bloğu hiçbir hata vermeden BOŞALIRDI (ölçüldü: üç Danfoss
 * ailesi). Rehber gövdesindeki bağlantılar etkilenmez: `aileKartiHazirla` eski slug'ı takma adla
 * çözer. Yalnız ters yön kırılıyordu.
 *
 * Kod ile migration aynı anda canlıya çıkmaz, o yüzden sayfa İKİ slug'la da aranır (eski slug
 * migration öncesi, yeni slug sonrası geçerli). `yazilar.ts` yeni slug'lara çevrilip migration
 * canlıda ölçüldüğünde (URN-53) bu dosya silinir.
 *
 * Bekçi: `src/__tests__/conformance/rehber-aile-slug-gecmisi.test.ts` (INV-REHBER-SLUG-GECMISI-1) —
 * migration'ın 40 çiftinden herhangi biri bir rehber tarafından anılıyorsa burada olmalıdır.
 */
export const ESKI_AILE_SLUGLARI: Readonly<Record<string, readonly string[]>> = {
  'danfoss-vlt-micro-drive-fc-51': ['danfoss-fc51'],
  'danfoss-vlt-hvac-basic-drive-fc-101': ['danfoss-fc101'],
  'danfoss-vlt-hvac-drive-fc-102': ['danfoss-fc102'],
}

/** Bir aile sayfasının rehber ararken bakacağı kimlikler: güncel slug + (varsa) eski slug'ları. */
export function aileRehberHedefleri(slug: string): RehberHedefi[] {
  return [slug, ...(ESKI_AILE_SLUGLARI[slug] ?? [])].map((s): RehberHedefi => `vh:aile/${s}`)
}
