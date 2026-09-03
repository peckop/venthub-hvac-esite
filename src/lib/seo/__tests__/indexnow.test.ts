import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { indexNowBildir } from '../indexnow'

/**
 * INV-INDEXNOW-1 · anahtar YOKKEN modül TAMAMEN SESSİZ
 *
 * RECEP KARARI (2026-09-03): IndexNow anahtarı ve `public/<anahtar>.txt` dosyası ŞİMDİ
 * girilmiyor — kategori adresleri kısa slug'a geçtiğinde aynı yayında girilecek, çünkü
 * Bing'i birazdan DEĞİŞECEK adreslerle beslemek işe yaramaz. Bu, modülün aylarca
 * anahtarsız yaşayacağı anlamına gelir.
 *
 * BU YÜZDEN "sessizlik" bir tercih değil, KAPI ALTINA ALINMIŞ BİR SÖZLEŞMEDİR:
 *   · ağ isteği DENENMEZ (403 gürültüsü olmaz),
 *   · hata günlüğüne HİÇBİR ŞEY yazılmaz,
 *   · webhook yanıtında "atlandı" olarak GÖRÜNÜR — sessiz olmak, görünmez olmak değildir.
 *
 * Son madde önemli: tamamen iz bırakmayan bir no-op, çalışmayan bir bildirimi çalışıyor
 * sanmamıza yol açardı. Sessizlik gürültüsüzlüktür, ölçülemezlik değil.
 */

const ORIJINAL_KEY = process.env.INDEXNOW_KEY

describe('INV-INDEXNOW-1 · anahtarsız sessizlik sözleşmesi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    delete process.env.INDEXNOW_KEY
  })

  afterEach(() => {
    if (ORIJINAL_KEY === undefined) delete process.env.INDEXNOW_KEY
    else process.env.INDEXNOW_KEY = ORIJINAL_KEY
    vi.restoreAllMocks()
  })

  it('⭐ANAHTAR YOK — ağ isteği DENENMEZ ve hata günlüğüne yazılmaz', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const sonuc = await indexNowBildir(['/tr/products/lineo-quiet'])

    expect(
      fetchSpy,
      'Anahtar yokken ağ isteği atıldı — IndexNow 403 döner ve her webhook koşumunda ' +
        'gereksiz gecikme + gürültü üretir. Anahtar aylarca gelmeyecek (Recep kararı).',
    ).not.toHaveBeenCalled()
    expect(
      errorSpy,
      'Anahtar yokken hata günlüğüne yazıldı — beklenen bir durum hata gibi raporlanırsa ' +
        'günlük gürültüye boğulur ve GERÇEK hata görünmez olur.',
    ).not.toHaveBeenCalled()
    expect(sonuc).toEqual({ durum: 'atlandi', sebep: 'anahtar-yok' })
  })

  it('⭐sessiz ≠ görünmez — "atlandı" durumu yanıtta AYIRT EDİLEBİLİR', async () => {
    const sonuc = await indexNowBildir(['/tr/products/x'])
    // Bu kol bilerek ayrı: yukarıdaki "hiçbir şey yapma" sözleşmesini sağlayan bir modül,
    // sonucu da yutarsa çalışmayan bildirimi çalışıyor sanardık. Ayrım ÖLÇÜLEBİLİR olmalı.
    expect(sonuc.durum, 'atlandığı yanıttan anlaşılmıyor').toBe('atlandi')
    expect(sonuc).not.toEqual({ durum: 'gonderildi' })
  })

  it('anahtar VAR ama gönderilecek yol YOK — yine ağ isteği denenmez', async () => {
    process.env.INDEXNOW_KEY = 'test-anahtar'
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const sonuc = await indexNowBildir([])

    expect(fetchSpy, 'boş kümeyi bildirmek ölçüm değildir — istek atılmamalı').not.toHaveBeenCalled()
    expect(sonuc).toEqual({ durum: 'atlandi', sebep: 'yol-yok' })
  })

  it('anahtar VAR — tek istek atılır, yollar tekilleştirilir ve tam URL yapılır', async () => {
    process.env.INDEXNOW_KEY = 'test-anahtar'
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }))

    // Webhook aynı yolu birden çok dalda biriktirebiliyor (zincir yürüyüşü) — tekilleştirme
    // burada ölçülüyor, yoksa aynı URL defalarca bildirilir.
    const sonuc = await indexNowBildir(['/tr/products/a', '/tr/products/a', '/en/products/a'])

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    const govde = JSON.parse(String(init.body)) as { key: string; keyLocation: string; urlList: string[] }

    expect(govde.urlList, 'yollar tekilleştirilmemiş').toHaveLength(2)
    expect(govde.urlList.every((u) => u.startsWith('http')), 'göreli yol gönderilmiş — IndexNow tam URL ister').toBe(true)
    expect(govde.key).toBe('test-anahtar')
    expect(govde.keyLocation, 'keyLocation anahtar dosyasını göstermeli').toContain('test-anahtar.txt')
    expect(sonuc).toEqual({ durum: 'gonderildi', adet: 2, http: 200 })
  })

  it('⭐ağ HATA verirse modül THROW ETMEZ — webhook düşmez', async () => {
    process.env.INDEXNOW_KEY = 'test-anahtar'
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ag koptu'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const sonuc = await indexNowBildir(['/tr/products/a'])

    // Webhook'un ASIL işi önbellek tazelemek; bildirim best-effort yan etki. Bu kol
    // düşerse bir ağ arızası tüm katalog tazelemesini durdurur.
    expect(sonuc.durum, 'ağ hatası yukarı fırlatılmış olabilir').toBe('hata')
    // Burada günlüğe YAZILMALI: bu BEKLENMEDİK bir durum. Yukarıdaki "anahtar yok"
    // sessizliğiyle karıştırılmamalı — biri normal hâl, diğeri arıza.
    expect(errorSpy, 'gerçek arıza sessizce yutulmuş — yutulan hata günlerce gizlenir').toHaveBeenCalled()
  })
})
