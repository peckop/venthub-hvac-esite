// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KATEGORI-SAYILARI-ONBELLEK-1 — kategori sayfası `get_category_counts`'u DOĞRUDAN çağırmaz (REC-300).
 *
 * KORUDUĞU KUSUR: RPC çağrı başı 42 ms / 35.188 tampon (canlı ölçüm 2026-09-29; anon `statement_timeout` 3 sn).
 * Sayfa onu her kategori için önbelleksiz çağırınca derlemede ≈48 eşzamanlı çağrı yığılıyor, 57014 riski
 * doğuyordu (kural 6 + render cetveli de ihlal). Ana sayfa / ürünler sayfası / site haritası aynı RPC'yi
 * zaten önbellekte çağırıyor; bu kapı kategori sayfasını onlara bağlar.
 *
 * KAPI: (1) RPC adı dosyada YALNIZ `unstable_cache` sarmalının içinde geçer, (2) önbellek anahtarı `lang` ve
 * `tenantId` içerir (kural 12), (3) hata FIRLATILIR (önbelleğe hata yazılmaz).
 * NE ÖLÇMEZ: derlemedeki gerçek çağrı sayısı (CI 57014 sayısı ve derleme günlüğü ölçer).
 */
const KOK = path.resolve(__dirname, '../../..')
const kaynak = fs.readFileSync(path.join(KOK, 'src/app/_components/kategoriSayfasi.tsx'), 'utf8')

describe('INV-KATEGORI-SAYILARI-ONBELLEK-1', () => {
  it("`get_category_counts` yalnız `getCachedKategoriSayimlari` içinde çağrılır (doğrudan çağrı yok)", () => {
    const cagrilar = [...kaynak.matchAll(/\.rpc\(\s*'get_category_counts'\s*\)/g)]
    expect(cagrilar, 'kategori sayfasında tam bir RPC çağrısı beklenir').toHaveLength(1)
    const sarmal = kaynak.match(/const getCachedKategoriSayimlari = [\s\S]*?\)\(\)/)
    expect(sarmal, 'getCachedKategoriSayimlari sarmalı bulunamadı').not.toBeNull()
    expect(sarmal![0], 'RPC unstable_cache sarmalının DIŞINDA').toMatch(/\.rpc\(\s*'get_category_counts'\s*\)/)
    expect(sarmal![0]).toMatch(/unstable_cache\(/)
  })

  it('önbellek anahtarı lang ve tenantId içerir; hata fırlatılır', () => {
    const sarmal = kaynak.match(/const getCachedKategoriSayimlari = [\s\S]*?\)\(\)/)![0]
    expect(sarmal).toMatch(/\['category-counts', lang, tenantId\]/)
    expect(sarmal).toMatch(/if \(error\) throw error/)
  })

  it('sayfa sayıları sarmaldan okur', () => {
    expect(kaynak).toMatch(/getCachedKategoriSayimlari\(lang, tenantId\)/)
  })
})
