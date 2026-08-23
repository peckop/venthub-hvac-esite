import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { hazirlaUrunSatirlari, kategoriIdBul, metadataSluglari, slugAnahtari, urunSlugUret } from '@/lib/admin/csvProductMapping'

/**
 * INV-CSV-MAP-1 — CSV içe aktarımında kategori SLUG ile eşlenir, ürün slug'ı Türkçe
 * harfleri ÇEVİRİR (silmez), ve eşleşmeyen kategori SESSİZ GEÇİLMEZ.
 *
 * Cetvel: docs/standards/csv-import-export-standard.md
 *   §3 — "CSV slug = canlı DB slug'ı, BİREBİR. İcat etme, dil değiştirme, tahmin etme."
 *   §4 — ERR_SLUG_NOT_IN_DB: severity Error, satır conflict, insana işaretlenir.
 * Ölçüm: docs/audits/t146-csv-import-kategori-slug-2026-08-23.md (ÜRÜN şeridi ölçtü)
 *
 * NİÇİN BU KAPI VAR: kusur bir tıklama işleyicisinin gövdesinde yaşıyordu. Orada yaşayan
 * mantık yalnız tarayıcıda, yalnız gerçek bir CSV yüklenince çalışır — hiçbir kapı göremez.
 * Kusurun kendisi de görünmezdi: kategori eşleşmeyince kod null yazıyor, ürün kategorisiz
 * kaydoluyor, vitrinde hiçbir yerde görünmüyor, ekranda ise "içe aktarma tamamlandı" yazıyordu.
 *
 * ÜÇ KOL: (1) saf mantığın davranışı · (2) İLERİ BAKAN KANARYA · (3) veri yolu —
 * çünkü düzeltmeyi kod değil VERİ öldürebilir: bileşene slug ulaşmazsa eşleme yine boş döner.
 */

const KOK = path.resolve(__dirname, '../../..')
const BILESEN = path.join(KOK, 'src/components/admin/products/ProductCsvImport.tsx')
const CAGIRAN = path.join(KOK, 'src/views/admin/ProductsTableBody.tsx')

/** Canlı kataloğun gerçek şeklinden alınmış küçük bir kesit (kanonik slug EN, görünen slug metadata'da). */
const KATEGORILER = [
  { id: 'kat-cati', name: 'Çatı Tipi Fanlar', slug: 'roof-fans', metadata: { slug: { tr: 'cati-tipi-fanlar', en: 'roof-fans' } } },
  { id: 'kat-sig', name: 'Sığınak Fanları', slug: 'shelter-fans', metadata: { slug: { tr: 'siginak-fanlari', en: 'shelter-fans' } } },
  { id: 'kat-duz', name: 'roof-fans', slug: 'flat-fans', metadata: null },
]

describe('INV-CSV-MAP-1 · saf eşleme mantığı', () => {
  it('ürün slug üretimi Türkçe harfi ÇEVİRİR, silmez', () => {
    // ESKİ KUSUR: /[^\w-]+/g kullanılıyordu; \w Türkçe harfi eşleştirmez ve o dal harfi SİLER.
    expect(urunSlugUret('Çatı Tipi Fan Küçük')).toBe('cati-tipi-fan-kucuk')
    expect(urunSlugUret('Sığınak Fanı')).toBe('siginak-fani')
    expect(urunSlugUret('İç Ortam Fanı')).toBe('ic-ortam-fani')
    expect(urunSlugUret('ÖZEL ÜRÜN Şğ')).toBe('ozel-urun-sg')
  })

  it('slug üretimi baştaki/sondaki ve tekrarlı ayırıcıları temizler', () => {
    expect(urunSlugUret('  Fan   Modeli!!  ')).toBe('fan-modeli')
    expect(urunSlugUret('---')).toBe('')
  })

  it('kategori kanonik slug ile eşleşir', () => {
    expect(kategoriIdBul('roof-fans', KATEGORILER)).toBe('kat-cati')
  })

  it('kategori dile özgü slug (metadata.slug.tr) ile eşleşir', () => {
    expect(kategoriIdBul('cati-tipi-fanlar', KATEGORILER)).toBe('kat-cati')
  })

  it('kategori ADIYLA da eşleşir — eski dosyalar bozulmasın diye', () => {
    expect(kategoriIdBul('Sığınak Fanları', KATEGORILER)).toBe('kat-sig')
  })

  it('SLUG, ADIN ÖNÜNDE gelir — çakışmada yanlış kategori kazanmaz', () => {
    // 'kat-duz' kategorisinin ADI, 'kat-cati' kategorisinin kanonik SLUG'ı ile aynı.
    expect(kategoriIdBul('roof-fans', KATEGORILER)).toBe('kat-cati')
  })

  it('eşleşmeyen değer null döner — çağıran bunu ERR_SLUG_NOT_IN_DB olarak işler', () => {
    expect(kategoriIdBul('boyle-bir-kategori-yok', KATEGORILER)).toBeNull()
    expect(kategoriIdBul('', KATEGORILER)).toBeNull()
    expect(kategoriIdBul('   ', KATEGORILER)).toBeNull()
  })

  it('bozuk metadata şekli çökmez, sessizce boş döner', () => {
    expect(metadataSluglari(null)).toEqual([])
    expect(metadataSluglari('metin')).toEqual([])
    expect(metadataSluglari({ slug: 'dize' })).toEqual([])
    expect(metadataSluglari([1, 2])).toEqual([])
  })

  it('karşılaştırma anahtarı İKİ TARAFA da uygulanır — boşluk ve tire aynı şeye iner', () => {
    expect(slugAnahtari('Çatı Tipi Fanlar')).toBe(slugAnahtari('cati-tipi-fanlar'))
  })
})

describe('INV-CSV-MAP-1 · İLERİ BAKAN KANARYA', () => {
  /**
   * NİÇİN İLERİ BAKAN: bu kusur BUGÜN zarar vermiş DEĞİL. I18N canlı DB'de ölçtü —
   * 374 ürün / 31 kategori / 38 ailenin hiçbirinde bozuk slug YOK, çünkü mevcut katalog
   * bu içe aktarıcıdan GEÇMEMİŞ. Yani "bugün zarar yok" bir VERİ KAZASI, kod güvencesi değil.
   * Kimse bir şeyi değiştirmese bile, ilk Türkçe adlı CSV yüklendiği gün kusur doğardı.
   * Bu kanarya o günü beklemez: bugünün verisinde bulunmayan bir satırı şimdiden sınar.
   */
  it('Türkçe adlı + slug ile kategorilenmiş bir CSV satırı DOĞRU çözülür', () => {
    const satir = { name: 'Çatı Tipi Fan Küçük', category_slug: 'cati-tipi-fanlar' }

    expect(urunSlugUret(satir.name)).toBe('cati-tipi-fan-kucuk')
    expect(kategoriIdBul(satir.category_slug, KATEGORILER)).toBe('kat-cati')

    // Kusurun iki yüzü de burada çivili: harf SİLİNMEZ ve kategori SESSİZ NULL olmaz.
    expect(urunSlugUret(satir.name)).not.toBe('at-tipi-fan-kucuk')
    expect(kategoriIdBul(satir.category_slug, KATEGORILER)).not.toBeNull()
  })
})

describe('INV-CSV-MAP-1 · yüzey ve veri yolu', () => {
  const bilesen = fs.readFileSync(BILESEN, 'utf8')
  const cagiran = fs.readFileSync(CAGIRAN, 'utf8')

  it('bileşen saf modülü kullanır (mantık tıklama işleyicisine geri dönmez)', () => {
    expect(bilesen).toMatch(/from '@\/lib\/admin\/csvProductMapping'/)
    expect(bilesen).toMatch(/hazirlaUrunSatirlari\(/)
    // Döngü bileşene GERİ TAŞINIRSA (kapıyı kör eden hâl) bu assert kırmızı verir.
    expect(bilesen).not.toMatch(/payloads\.push\(/)
  })

  it('eski kusur kalıpları geri gelmez', () => {
    expect(bilesen).not.toMatch(/c\.name\.toLowerCase\(\)\s*===/)
    expect(bilesen).not.toMatch(/\[\^\\w-\]/)
  })

  it('eşleşmeyen kategori SESSİZ GEÇİLMEZ — yazımdan önce durulur ve insana bildirilir', () => {
    expect(bilesen).toMatch(/reddedilen/)
    expect(bilesen).toMatch(/unknownCategoryTitle/)
    expect(bilesen).toMatch(/unknownCategoryHelp/)
  })

  it('VERİ YOLU: çağıran slug ve metadata da çeker', () => {
    /**
     * Bu kolu ayrıca ölçüyoruz çünkü düzeltmeyi KOD değil VERİ öldürebilir: sorgu yalnız
     * id,name çekerse bileşene slug hiç ulaşmaz, eşleme yine ada düşer ve kusur — kod
     * doğruyken — geri gelir. Sessiz, kimse hata almaz.
     */
    expect(cagiran).toMatch(/\.select\('id,name,slug,metadata'\)/)
  })
})

describe('INV-CSV-MAP-1 · satır hazırlama DAVRANIŞI', () => {
  /**
   * NİÇİN DAVRANIŞSAL: ilk sürümde bu kol yalnız METİN tarıyordu (dosyada "reddedilen"
   * kelimesi geçiyor mu). Kasıtlı bozma turunda S4 — reddetme dalını silmek — YEŞİL geçti,
   * çünkü kelimeler yerinde duruyordu ama artık hiçbir şeye bağlı değildi.
   * Ders: kapsamı ADA değil ŞEKLE/DAVRANIŞA bağla. Mantık saf hâle getirildi ve burada
   * çıktısıyla ölçülüyor; aynı sabotaj artık kırmızı verir.
   */
  it('kategorisi çözülemeyen satır YAZILMAZ ve reddedilenlere düşer', () => {
    const sonuc = hazirlaUrunSatirlari(
      [
        { sku: 'A-1', name: 'Çatı Tipi Fan Küçük', category_slug: 'cati-tipi-fanlar' },
        { sku: 'A-2', name: 'Hayalet Fan', category_slug: 'boyle-bir-kategori-yok' },
      ],
      KATEGORILER,
    )

    expect(sonuc.payloads.map(p => p.sku)).toEqual(['A-1'])
    expect(sonuc.reddedilen).toEqual([{ sku: 'A-2', deger: 'boyle-bir-kategori-yok' }])
  })

  it('çözülen satırın kategori kimliği ve harf-çevrimli slug ı yazılır', () => {
    const { payloads } = hazirlaUrunSatirlari(
      [{ sku: 'A-1', name: 'Sığınak Fanı', category: 'siginak-fanlari' }],
      KATEGORILER,
    )

    expect(payloads).toHaveLength(1)
    expect(payloads[0].category_id).toBe('kat-sig')
    expect(payloads[0].slug).toBe('siginak-fani')
  })

  it('category_id doğrudan verilmişse eşleme denenmez', () => {
    const { payloads, reddedilen } = hazirlaUrunSatirlari(
      [{ sku: 'A-1', name: 'Fan', category_id: 'elle-verilen-id', category_slug: 'boyle-bir-kategori-yok' }],
      KATEGORILER,
    )

    expect(reddedilen).toHaveLength(0)
    expect(payloads[0].category_id).toBe('elle-verilen-id')
  })

  it('kategori sütunu hiç yoksa satır normal yazılır (kategori zorunlu değil)', () => {
    const { payloads, reddedilen } = hazirlaUrunSatirlari([{ sku: 'A-1', name: 'Fan' }], KATEGORILER)
    expect(reddedilen).toHaveLength(0)
    expect(payloads[0].category_id).toBeUndefined()
  })

  it('sku veya name eksik satır sessizce atlanır (mevcut davranış korunur)', () => {
    const { payloads } = hazirlaUrunSatirlari(
      [{ sku: '', name: 'Fan' }, { sku: 'A-2', name: '' }, { sku: 'A-3', name: 'Fan' }],
      KATEGORILER,
    )
    expect(payloads.map(p => p.sku)).toEqual(['A-3'])
  })
})
