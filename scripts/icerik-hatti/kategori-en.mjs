/**
 * KATEGORİ EN METNİ — yazım planı (saf çekirdek; ağa, diske, DB'ye çıkmaz). Karar 115, REC-146.
 *
 * NİÇİN AYRI: EN metin, canlıdaki onaylı TR paragrafın SADIK çevirisidir. Çeviri hangi TR'ye
 * bakılarak yapıldıysa canlıdaki TR hâlâ o olmalı; aradan TR değiştiyse EN bayat bir metnin
 * çevirisidir ve yazılmaz. Bu karar, yazıcının geri kalanından (ağ, yedek, geri okuma) ayrı
 * test edilebilsin diye burada durur.
 *
 * KURALLAR (her biri test edilir, `__tests__/kategori-en.test.ts`):
 *  - Çeviri anındaki TR'nin md5'i (`plan.json` → `tr_md5`) canlı TR'ninkiyle aynı değilse RED (bayat TR).
 *  - EN boşsa ya da Türkçe harf taşıyorsa RED.
 *  - Kategori canlıda yoksa RED.
 *  - Canlı EN aynıysa AYNI (idempotent: ikinci koşum hiçbir şey yazmaz).
 *  - Canlı EN farklı ve doluysa yazılır ama ÜZERİNE YAZILIR diye işaretlenir.
 *  - TR ve metadata'nın diğer anahtarları hiçbir durumda değişmez: yeni metadata = eski + description_i18n.en.
 */
import { createHash } from 'node:crypto'

export const md5 = (s) => createHash('md5').update(s).digest('hex')

/** Anahtar sırasından bağımsız JSON: jsonb geri okumada anahtarları kendi sırasıyla döndürür. */
export const kanon = (v) => Array.isArray(v) ? `[${v.map(kanon).join(',')}]`
  : v && typeof v === 'object' ? `{${Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + kanon(v[k])).join(',')}}`
  : JSON.stringify(v)
const TURKCE_HARF = /[çğıöşüÇĞİÖŞÜ]/

/**
 * @typedef {{ description_i18n?: { tr?: string, en?: string } } & Record<string, unknown>} KategoriMeta
 * @param {{kategoriler: Array<{id: string, slug: string, metadata: KategoriMeta | null}>,
 *          plan: Array<{slug: string, tr_md5: string}>,
 *          en: Record<string, string | undefined>}} girdi
 */
export function enYazimPlani({ kategoriler, plan, en }) {
  const bySlug = new Map(kategoriler.map(c => [c.slug, c]))
  const yazilacak = [], ayni = [], red = []
  for (const p of plan) {
    const c = bySlug.get(p.slug)
    if (!c) { red.push({ slug: p.slug, sebep: 'canlıda kategori yok' }); continue }
    const metin = (en[p.slug] ?? '').replace(/\s+/g, ' ').trim()
    if (!metin) { red.push({ slug: p.slug, sebep: 'EN metin boş' }); continue }
    if (TURKCE_HARF.test(metin)) { red.push({ slug: p.slug, sebep: 'EN metinde Türkçe harf' }); continue }
    const canliTr = c.metadata?.description_i18n?.tr
    if (typeof canliTr !== 'string' || md5(canliTr) !== p.tr_md5) {
      red.push({ slug: p.slug, sebep: 'canlı TR çeviri anındakinden farklı (bayat çeviri)' }); continue
    }
    const canliEn = c.metadata?.description_i18n?.en
    if (canliEn === metin) { ayni.push(p.slug); continue }
    const onceki = c.metadata ?? {}
    const yeni = { ...onceki, description_i18n: { ...(onceki.description_i18n ?? {}), en: metin } }
    yazilacak.push({ slug: p.slug, id: c.id, onceki_metadata: onceki, yeni_metadata: yeni, uzerine: typeof canliEn === 'string' && canliEn.length > 0 })
  }
  return { yazilacak, ayni, red }
}
