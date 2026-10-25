/**
 * AILE YEDEKTEN GERI — saf kurallar (ag yok, DB yok). `aile-yedekten-geri.mjs` bunlari kullanir;
 * `__tests__/aile-yedekten-geri.test.ts` kilitler. (KTL-62)
 *
 * NE: `aile-blok-duzelt.mjs` yazmadan once canlidan okunan satirlari `--yedek` dosyasina yazar (dizi:
 * {id, tenant_id, slug, description, is_description_manual, updated_at}). Duzeltici K4 yuzunden uretim
 * artigini (`[MANIFEST]`, `---`, `>`) geri YAZAMAZ; ters plan bu yuzden artikli eski metne donemez.
 * Bu arac yedekteki `description` ve `is_description_manual` degerini AYNEN geri koyar.
 */
import { kanonikEsit } from './aile-blok-duzelt-kurallar.mjs'

/**
 * @typedef {{ id: string, tenant_id: string, slug: string, description: unknown, is_description_manual: boolean | null, updated_at: string }} AileSatiri
 * @typedef {{ slug: string, durum: 'geri' | 'zaten' | 'red', neden: string }} GeriKarari
 */

/**
 * Yedek dosyasinin icerigini dogrular; ayni slug icin EN ESKI kayit (yazimdan onceki ilk okuma) gecerlidir.
 * @param {unknown} ham
 * @returns {{ hatalar: string[], satirlar: AileSatiri[] }}
 */
export function yedekDogrula(ham) {
  /** @type {string[]} */
  const hatalar = []
  if (!Array.isArray(ham) || ham.length === 0) return { hatalar: ['yedek bos olmayan bir dizi olmali'], satirlar: [] }
  /** @type {Map<string, AileSatiri>} */
  const ilk = new Map()
  ham.forEach((s, i) => {
    const n = `yedek[${i}]`
    if (s === null || typeof s !== 'object' || Array.isArray(s)) return void hatalar.push(`${n}: nesne degil`)
    const o = /** @type {Record<string, unknown>} */ (s)
    for (const k of ['id', 'tenant_id', 'slug', 'updated_at']) if (typeof o[k] !== 'string' || !o[k]) hatalar.push(`${n}: ${k} metin olmali`)
    if (o.description === null || typeof o.description !== 'object') hatalar.push(`${n}: description nesne olmali`)
    if (typeof o.is_description_manual !== 'boolean' && o.is_description_manual !== null) hatalar.push(`${n}: is_description_manual boolean/null olmali`)
    if (typeof o.slug === 'string' && !ilk.has(o.slug)) ilk.set(o.slug, /** @type {AileSatiri} */ (s))
  })
  return { hatalar, satirlar: hatalar.length ? [] : [...ilk.values()] }
}

/**
 * @param {AileSatiri} yedek
 * @param {AileSatiri | undefined} mevcut canlidaki satir
 * @returns {GeriKarari}
 */
export function geriKarari(yedek, mevcut) {
  if (!mevcut) return { slug: yedek.slug, durum: 'red', neden: 'aile canlida yok (silinmis ya da sorgu bos)' }
  if (mevcut.id !== yedek.id || mevcut.tenant_id !== yedek.tenant_id) return { slug: yedek.slug, durum: 'red', neden: 'canlidaki satirin id/tenant_id yedektekiyle ayni degil' }
  if (kanonikEsit(mevcut.description, yedek.description) && mevcut.is_description_manual === yedek.is_description_manual) {
    return { slug: yedek.slug, durum: 'zaten', neden: 'canli deger zaten yedekle ayni' }
  }
  return { slug: yedek.slug, durum: 'geri', neden: 'canli deger yedekten farkli: yedekteki description geri konur' }
}
