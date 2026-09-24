/**
 * REC-209 · product-image-standard §7 — görsel kapıları. Ağa, DB'ye çıkmaz; veri UYDURMA.
 *
 * Kilitlenenler:
 *   1. Veri kapısı (gorsel-sozlesme.mjs): yetim satır, tenant, kova öneki, tam URL, path↔satır uyumu,
 *      şema dışı path, kapaksız ürün, sıra/path tekrarı, boş alt metni — her biri ayrı sayılır ve KIRMIZI.
 *   2. `foto.webp` (2026-09-08 tek seferlik yükleme) donmuş istisnadır: 97'ye kadar yeşil, 98'de KIRMIZI.
 *   3. INV-IMG-1 (statik): scripts/media betikleri tek varyant üretir (1600px, büyütme yok), üretici
 *      sitesine paralel istek atmaz, kova önekli path yazmaz. Sabotaj yönü: bu desenleri taşıyan
 *      sentetik kaynak aynı denetimde KIRMIZI.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { gorselSozlesmesi, DONMUS_FOTO_WEBP, IHLAL_ADLARI } from '../gorsel-sozlesme.mjs'

const T = '11111111-1111-1111-1111-111111111111'
const T2 = '22222222-2222-2222-2222-222222222222'
const P = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
const urun = (n: number, status = 'active', tenant = T) => ({ id: P(n), sku: `X-${n}`, status, tenant_id: tenant })
const gorsel = (id: string, n: number, over: Record<string, unknown> = {}) =>
  ({ id, product_id: P(n), tenant_id: T, path: `${T}/${P(n)}/0.webp`, alt: `X-${n} – 0`, sort_order: 0, ...over })

describe('görsel sözleşmesi — veri kapısı', () => {
  it('temiz veri: ihlal 0, kırmızı değil; görselsiz aktif ürün adıyla sayılır', () => {
    const r = gorselSozlesmesi([urun(1), urun(2), urun(3, 'draft')], [
      gorsel('a', 1), gorsel('b', 1, { path: `${T}/${P(1)}/1.webp`, sort_order: 1 }),
    ])
    expect(r.ihlal_toplam).toBe(0)
    expect(r.kirmizi).toBe(false)
    expect(r.aktif_gorselsiz).toEqual(['X-2']) // taslak ürün sayılmaz
  })

  it('her ihlal ayrı sayılır', () => {
    const U = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => urun(n)).concat([urun(10, 'active', T2)])
    const r = gorselSozlesmesi(U, [
      gorsel('yetim', 99),
      gorsel('t0', 1, { tenant_id: null }),
      gorsel('tf', 10),                                                  // ürün T2, satır T
      gorsel('onek', 2, { path: `product-images/${T}/${P(2)}/0.webp` }),
      gorsel('url', 3, { path: `https://x.supabase.co/storage/v1/object/public/product-images/${T}/${P(3)}/0.webp` }),
      gorsel('pu', 4, { path: `${T}/${P(5)}/0.webp` }),                  // path başka ürünün
      gorsel('jpg', 5, { path: `${T}/${P(5)}/0.jpg` }),
      gorsel('kapak', 6, { sort_order: 2, path: `${T}/${P(6)}/2.webp` }),
      gorsel('s1', 7), gorsel('s2', 7, { path: `${T}/${P(7)}/9.webp` }), // aynı sıra
      gorsel('alt', 8, { alt: '  ' }),
      gorsel('p1', 9, { sort_order: 0 }), gorsel('p2', 9, { sort_order: 1 }), // aynı path
    ])
    const n = (a: string) => r.ihlal[a].length
    expect(n('yetim_satir')).toBe(1)
    expect(n('tenant_bos')).toBe(1)
    expect(n('tenant_urunle_farkli')).toBe(1)
    expect(n('kova_onekli_path')).toBe(1)
    expect(n('tam_url_path')).toBe(1)
    expect(n('path_urun_farkli')).toBe(1)
    expect(n('sema_disi_path')).toBe(3) // önekli, tam URL, jpg
    expect(n('kapaksiz_urun')).toBe(1)
    expect(n('ayni_sira_tekrar')).toBe(1)
    expect(n('ayni_path_tekrar')).toBe(1)
    expect(n('alt_bos')).toBe(1)
    expect(r.kirmizi).toBe(true)
    expect(IHLAL_ADLARI).toHaveLength(12)
  })

  it(`foto.webp donmuş istisna: ${DONMUS_FOTO_WEBP}'e kadar yeşil, bir fazlası KIRMIZI`, () => {
    const foto = (n: number) => gorsel(`f${n}`, n, { path: `${T}/${P(n)}/foto.webp` })
    const U = Array.from({ length: DONMUS_FOTO_WEBP + 1 }, (_, i) => urun(i + 1))
    const sinirda = gorselSozlesmesi(U, U.slice(0, DONMUS_FOTO_WEBP).map((_, i) => foto(i + 1)))
    expect(sinirda.foto_webp).toBe(DONMUS_FOTO_WEBP)
    expect(sinirda.ihlal.sema_disi_path).toEqual([])
    expect(sinirda.kirmizi).toBe(false)
    const asti = gorselSozlesmesi(U, U.map((_, i) => foto(i + 1)))
    expect(asti.mandal_asildi).toBe(true)
    expect(asti.kirmizi).toBe(true)
  })
})

// ── INV-IMG-1 (statik) ────────────────────────────────────────────────────────────────
// Paralel istek yalnız ÜRETİCİ sitesine giderken yasak (§3). Aşağıdaki betik kendi kovamızı ve
// DB'mizi okur, üreticiye gitmez — istisna gerekçesiyle yazılı.
const PARALEL_ISTISNA: Record<string, string> = {
  'gorsel-envanteri.mjs': 'salt okuma; yalnız kendi Supabase kovası/DB — üretici sitesine istek YOK',
}
const PARALEL_DESEN = [/Promise\.all\s*\(/, /Promise\.allSettled\s*\(/, /Promise\.race\s*\(/]
function medyaIhlalleri(ad: string, kaynak: string): string[] {
  const out: string[] = []
  for (const m of kaynak.matchAll(/\.resize\(\s*\{([^}]*)\}/g)) {
    if (!/width:\s*1600\b/.test(m[1]) || !/withoutEnlargement:\s*true/.test(m[1])) out.push(`${ad}: boyut varyantı / büyütme (${m[1].trim()})`)
  }
  if (/\.resize\(\s*\d/.test(kaynak)) out.push(`${ad}: sabit boyutlu resize (varyant)`)
  if (PARALEL_DESEN.some((d) => d.test(kaynak)) && !PARALEL_ISTISNA[ad]) out.push(`${ad}: paralel istek deseni`)
  if (/['"`]product-images\/[^'"`]/.test(kaynak)) out.push(`${ad}: kova önekli path yazımı`)
  return out
}

describe('INV-IMG-1 — scripts/media sözleşmesi', () => {
  const DIZIN = join(__dirname, '..', '..', 'media')
  const dosyalar = readdirSync(DIZIN).filter((f) => /\.(mjs|js|py)$/.test(f))

  it('gerçek betikler temiz', () => {
    expect(dosyalar.length).toBeGreaterThan(5)
    const ihlal = dosyalar.flatMap((f) => medyaIhlalleri(f, readFileSync(join(DIZIN, f), 'utf8')))
    expect(ihlal).toEqual([])
  })

  it('istisna listesi bayat değil: her istisna gerçekten var ve paralel desen taşıyor', () => {
    for (const ad of Object.keys(PARALEL_ISTISNA)) {
      expect(dosyalar).toContain(ad)
      expect(readFileSync(join(DIZIN, ad), 'utf8')).toMatch(/Promise\.all\s*\(/)
    }
  })

  it('sabotaj: varyant, büyütme, paralel indirme, önekli path KIRMIZI', () => {
    expect(medyaIhlalleri('x.mjs', 'sharp(a).resize({ width: 400 }).webp()')).toHaveLength(1)
    expect(medyaIhlalleri('x.mjs', 'sharp(a).resize({ width: 1600 }).webp()')).toHaveLength(1)
    expect(medyaIhlalleri('x.mjs', 'sharp(a).resize(800, 600)')).toHaveLength(1)
    expect(medyaIhlalleri('x.mjs', 'await Promise.all(urls.map((u) => fetch(u)))')).toHaveLength(1)
    expect(medyaIhlalleri('x.mjs', 'const path = `product-images/${t}/${p}/0.webp`')).toHaveLength(1)
    expect(medyaIhlalleri('x.mjs', "sb.storage.from('product-images').upload(`${t}/${p}/0.webp`, b)")).toEqual([])
  })
})
