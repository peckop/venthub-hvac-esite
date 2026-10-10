// URN-38 — model sayfasında "veriye ulaşılamadı" 200 ile çizilmez.
//
// `resolveProductRoute` ağ/RPC hatasında `unavailable` döner (404 DEĞİL: geçici arıza kalıcı yokluk
// beyanı olmasın). Aile rotası bu durumda "bulunamadı" görünümünü çizmeye devam eder. MODEL rotası
// (`sunucuSku` verilmiş) ise canonical'ı kendi adresi olan bir sayfadır; içi boş 200 çizilirse
// önbelleğe girer ve indekslenebilir. Bu yüzden model rotasında hata fırlatılır: sayfa önbelleğe
// alınmaz, ISR son iyi sayfayı korur.
//
// Pasif/arşivli/silinmiş SKU zaten 404'tür (RPC yalnız aktif varyantı döndürür, model satırı yoksa
// `notFound()`); o yol bu dosyada değil `productRoute`/`aileSayfasi` yol testlerindedir.
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/data/preload', () => ({
  preloadFamily: vi.fn(),
  getCachedFamilyDetail: vi.fn(),
}))
vi.mock('@/lib/data/urunSegmenti', () => ({ urunRotasiBagimliliklari: vi.fn(() => ({})) }))
vi.mock('@/lib/data/productRoute', () => ({
  resolveProductRoute: vi.fn(async () => ({ kind: 'unavailable' })),
}))

import { AileSayfasi } from '../_components/aileSayfasi'

describe('URN-38: veri yokken sayfa sınıfı', () => {
  it('model rotasında (sunucuSku verilmiş) hata fırlatır, 200 çizmez', async () => {
    await expect(AileSayfasi({ lang: 'tr', slug: 'storm-serisi', sunucuSku: 'SEA-61143003' })).rejects.toThrow(
      /model sayfası/i,
    )
  })

  it('aile rotasında bugünkü davranış korunur: "bulunamadı" görünümü çizilir', async () => {
    await expect(AileSayfasi({ lang: 'tr', slug: 'storm-serisi' })).resolves.toBeTruthy()
  })

  it('generic prerender tohumu etkilenmez', async () => {
    await expect(AileSayfasi({ lang: 'tr', slug: 'generic' })).resolves.toBeTruthy()
  })
})
