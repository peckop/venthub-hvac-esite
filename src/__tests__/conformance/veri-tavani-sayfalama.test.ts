import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { type SayfaCevabi, tumSatirlariCek } from '@/lib/supabase/tumSatirlar'

/**
 * INV-TAVAN-1 — PostgREST satır tavanına karşı sayfalı çekim + kesin sayı doğrulaması.
 *
 * ## Niçin var
 * PostgREST bir istekte varsayılan **1000 satır** döner ve fazlasını SESSİZCE atar:
 * `error` boş, uyarı yok. Yazma yollarında bu doğrudan veri kaybıdır — görülmeyen satır
 * güncellenmez. Canlı ölçüm (2026-09-07, prod): `product_prices` = 1044 satır (tavan
 * ZATEN aşılıyor), aktif `products` = 375 (bugün aşmıyor, sınırı yoktu).
 *
 * ## Bu sınavın ölçtüğü şey
 * İki ayrı iddia var ve ikisi de ayrı ayrı ölçülür:
 *   A. Yardımcının KENDİSİ doğru mu — eksik çekimde kırmızı veriyor mu (birim kolları).
 *   B. Çağrı yerleri onu DOĞRU kullanıyor mu — `count: 'exact'`, `order`, `range` var mı
 *      (kaynak kolu). B olmadan A boşa çalışır: kusursuz bir yardımcı yanlış çağrılırsa
 *      hiçbir şeyi korumaz.
 *
 * ## Sabotajın şekli — ölçülmüş ders
 * Sabotaj evreni BOŞALTMAZ, DARALTIR/BOZAR ve bozduğu yolun gerçekten koştuğu ayrıca
 * gösterilir. Var olmayan bir yol vermek (ENOENT gibi) kırmızı verir ama hiçbir şey
 * kanıtlamaz. Bu yüzden aşağıdaki her sabotaj kolunda önce "bu kol gerçekten koştu"
 * kanıtı (çağrı sayacı) vardır.
 */

/** Sunucu taklidi: `toplam` satırlık bir tablo, `range` semantiğiyle sayfalar. */
function sahteSunucu(toplam: number) {
  const cagrilar: Array<[number, number]> = []
  const satirlar = Array.from({ length: toplam }, (_, i) => ({ id: i + 1 }))
  const sayfa = (bas: number, son: number): PromiseLike<SayfaCevabi<{ id: number }>> => {
    cagrilar.push([bas, son])
    return Promise.resolve({ data: satirlar.slice(bas, son + 1), error: null, count: toplam })
  }
  return { sayfa, cagrilar }
}

describe('INV-TAVAN-1 · sayfalı çekim + kesin sayı doğrulaması', () => {
  it('TAVANIN ÜSTÜNDE — 1044 satır (canlı product_prices sayısı) eksiksiz gelir', async () => {
    const { sayfa, cagrilar } = sahteSunucu(1044)
    const hepsi = await tumSatirlariCek('sinav', sayfa, 100)
    expect(hepsi).toHaveLength(1044)
    // Sayfalama yolu GERÇEKTEN koştu: tek istekle bitmedi.
    expect(cagrilar.length).toBeGreaterThan(1)
    // Son satır da geldi — yani kayıp kuyrukta değil.
    expect(hepsi[hepsi.length - 1]).toEqual({ id: 1044 })
  })

  it('SABOTAJ A — sunucu eksik satır döndürürse KIRMIZI (sessiz kayıp yasak)', async () => {
    // 250 satır bildiriliyor ama üçüncü sayfa boş dönüyor: klasik "kısa sayfa erken kırar".
    let cagri = 0
    const eksikSayfa = (bas: number, son: number): PromiseLike<SayfaCevabi<{ id: number }>> => {
      cagri++
      const tam = Array.from({ length: 250 }, (_, i) => ({ id: i + 1 }))
      const dilim = cagri >= 3 ? [] : tam.slice(bas, son + 1)
      return Promise.resolve({ data: dilim, error: null, count: 250 })
    }
    await expect(tumSatirlariCek('sinav', eksikSayfa, 100)).rejects.toThrow(/EKSİK ÇEKİM/)
    // Sabotaj HEDEFE DEĞDİ: döngü gerçekten üçüncü sayfaya kadar gitti.
    expect(cagri).toBe(3)
  })

  it('SABOTAJ B — count null gelirse KIRMIZI (yutulan count kapıyı körleştirir)', async () => {
    // Ölçülmüş tuzak: `count: 'exact'` zincirin SONUNA eklenirse sessizce yutulur ve
    // `count` null döner. O hâlde doğrulama kolu hiçbir şey ölçmez; kapı sahte-yeşile döner.
    let cagri = 0
    const sayimsiz = (bas: number, son: number): PromiseLike<SayfaCevabi<{ id: number }>> => {
      cagri++
      const tam = Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }))
      return Promise.resolve({ data: tam.slice(bas, son + 1), error: null, count: null })
    }
    await expect(tumSatirlariCek('sinav', sayimsiz, 100)).rejects.toThrow(/KESİN SAYI döndürmedi/)
    expect(cagri).toBe(1)
  })

  it('NEGATİF KOL — doğru çalışan çekim KIRMIZI VERMEZ (yanlış-kırmızı avı)', async () => {
    // Tam bölünen hâl: 200 satır / 100 sayfa. Döngü fazladan bir boş sayfa ister;
    // bu yol bir off-by-one'a en açık yerdir, o yüzden ayrı kol.
    const { sayfa, cagrilar } = sahteSunucu(200)
    await expect(tumSatirlariCek('sinav', sayfa, 100)).resolves.toHaveLength(200)
    expect(cagrilar.length).toBe(3)
  })

  it('ÖN KOŞUL — geçersiz sayfa boyu sessizce kabul edilmez', async () => {
    const { sayfa } = sahteSunucu(10)
    await expect(tumSatirlariCek('sinav', sayfa, 0)).rejects.toThrow(/sayfa boyu/)
  })

  it('KAYNAK — çağrı yerleri yardımcıyı DOĞRU çağırıyor (count exact + order + range)', () => {
    // A kolu (birim) kusursuz olsa bile, çağrı yeri `count: 'exact'`i unutursa koruma
    // çalışmaz. Bu yüzden kaynak ayrıca okunur — "yardımcı var" ile "yardımcı doğru
    // besleniyor" ayrı iddialardır.
    const yol = join(process.cwd(), 'src', 'lib', 'services', 'pricingMaterialize.service.ts')
    const kaynak = readFileSync(yol, 'utf8')

    const cagrilar = [...kaynak.matchAll(/tumSatirlariCek<[^>]+>\(([\s\S]*?)\n  \)/g)]
    expect(
      cagrilar.length,
      'Hiç tumSatirlariCek çağrısı ölçülmedi — dosya taşındıysa bu kolun yolunu güncelle, silme.',
    ).toBe(2)

    for (const [govde] of cagrilar) {
      expect(govde, "count: 'exact' yok — kesin sayı gelmez, doğrulama kolu körleşir").toContain(
        "count: 'exact'",
      )
      expect(govde, 'order yok — sayfalar arasında satır sırası belirsiz olur').toContain('.order(')
      expect(govde, 'range yok — sayfalama hiç kurulmamış demektir').toContain('.range(bas, son)')
    }
  })
})
