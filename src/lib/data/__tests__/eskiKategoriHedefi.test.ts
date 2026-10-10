/**
 * URN-55 — eski kategori adresi, YANLIŞ dil önekiyle gelse de tek yönlendirmeyle yeni adrese gider.
 *
 * Takma ad satırları dile özeldir (Faz 1-A tetiği: `dil = 'en'` eski EN slug, `dil = 'tr'` eski TR slug),
 * çözücü RPC yalnız `dil in (istek dili, '*')` ile bakar. Bu yüzden #1352 sonrası
 * `/en/category/asit-dayanikli-fanlar` (eski TR slug, EN önekiyle) ve `/tr/category/acid-resistant-fans`
 * (eski EN slug, TR önekiyle) "kayıt yok" → 404 olurdu. Doğrusu: öbür dilde de ara, bulunursa tek 308.
 *
 * Kapı: istek dilindeki eşleşme ÖNCELİKLİDİR (öbür dil yalnız bulunamayınca sorulur); hiçbir dilde yoksa
 * davranış bugünküyle aynı (null → 404); DB hatası her iki sorguda da FIRLATILIR (kalıcı yokluk sayılmaz).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const rpc = vi.fn()
const kategoriSatiri = vi.fn()

vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    rpc: (...a: unknown[]) => rpc(...a),
    from: () => ({
      select: () => ({
        eq: () => ({ limit: () => ({ maybeSingle: () => kategoriSatiri() }) }),
      }),
    }),
  },
}))

import { eskiKategoriHedefi } from '../preload'

const KORO = {
  slug: 'corrosion-and-acid-resistant-fans',
  metadata: { slug: { tr: 'korozyona-ve-aside-dayanimli-fanlar', en: 'corrosion-and-acid-resistant-fans' } },
}

/** Takma ad tablosu: [dil, eski slug] → hedef kimlik. RPC `dil in (p_dil,'*')` süzgecini birebir taklit eder. */
function takmaAdTablosu(satirlar: Array<[string, string, string]>) {
  rpc.mockImplementation(async (_ad: string, a: { p_tur: string; p_dil: string; p_eski_slug: string }) => {
    const bulunan = satirlar.find(([dil, eski]) => (dil === a.p_dil || dil === '*') && eski === a.p_eski_slug.toLowerCase())
    return { data: bulunan ? bulunan[2] : null, error: null }
  })
}

beforeEach(() => {
  rpc.mockReset()
  kategoriSatiri.mockReset()
  kategoriSatiri.mockResolvedValue({ data: KORO, error: null })
})

describe('eskiKategoriHedefi — dil karışık eski adres', () => {
  it('eski TR slug EN önekiyle gelirse EN yeni adrese gider', async () => {
    takmaAdTablosu([['tr', 'asit-dayanikli-fanlar', 'kat-1']])
    expect(await eskiKategoriHedefi('asit-dayanikli-fanlar', 'en')).toBe('corrosion-and-acid-resistant-fans')
  })

  it('eski EN slug TR önekiyle gelirse TR yeni adrese gider', async () => {
    takmaAdTablosu([['en', 'acid-resistant-fans', 'kat-1']])
    expect(await eskiKategoriHedefi('acid-resistant-fans', 'tr')).toBe('korozyona-ve-aside-dayanimli-fanlar')
  })

  it('doğru dil önekiyle gelen eski adres bugünkü gibi çözülür (öbür dile hiç sorulmaz)', async () => {
    takmaAdTablosu([['tr', 'asit-dayanikli-fanlar', 'kat-1']])
    expect(await eskiKategoriHedefi('asit-dayanikli-fanlar', 'tr')).toBe('korozyona-ve-aside-dayanimli-fanlar')
    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc.mock.calls[0][1].p_dil).toBe('tr')
  })

  it('hiçbir dilde kayıt yoksa null döner (404 davranışı değişmez)', async () => {
    takmaAdTablosu([])
    expect(await eskiKategoriHedefi('hic-yok', 'en')).toBeNull()
    expect(rpc).toHaveBeenCalledTimes(2)
  })

  it('hedef gelen slug’ın kendisiyse null döner (döngü yok)', async () => {
    takmaAdTablosu([['tr', 'korozyona-ve-aside-dayanimli-fanlar', 'kat-1']])
    expect(await eskiKategoriHedefi('korozyona-ve-aside-dayanimli-fanlar', 'tr')).toBeNull()
  })

  it('öbür dil sorgusu hata verirse FIRLATIR (geçici arıza 404 sayılmaz)', async () => {
    const hata = new Error('rpc arızası')
    rpc.mockResolvedValueOnce({ data: null, error: null }).mockResolvedValueOnce({ data: null, error: hata })
    await expect(eskiKategoriHedefi('x', 'en')).rejects.toBe(hata)
  })
})
