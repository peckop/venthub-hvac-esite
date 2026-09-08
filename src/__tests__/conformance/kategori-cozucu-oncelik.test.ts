import { describe, expect, it, vi } from 'vitest'

import { kategoriSatiriSec } from '@/lib/data/preload'

/**
 * INV-KATEGORI-COZUCU-1 — bir kategori adresi, BAŞKA bir kategorinin satırını çözemez.
 *
 * NİÇİN (REC-286). Canlıda ölçülmüş bir arıza var: `/tr/category/aksiyel-sanayi-fanlari`
 * adresine yayın anında AKSESUARLAR sayfası döndü (title "Aksesuarlar ve Bileşenler",
 * canonical `/tr/category/aksesuarlar`, HTTP 200, yönlendirme yok). O arızanın KÖK SEBEBİ
 * bu dosyayla kapanmadı — beş hipotez ölçülüp çürütüldü ve sebep hâlâ adlandırılmadı.
 *
 * ⛔BU KAPININ NE OLMADIĞINI ÖNCE YAZIYORUM: bu kapı yeşil diye REC-286 kapanmaz.
 * Burada kapatılan şey, ölçerken görülen AYRI ve sessiz bir koldur:
 *
 *   eski hâl → `rows.find((r) => r.slug === slug) ?? rows[0]`
 *
 * Gelen adres kanonik slug değilse `find` daima ıskalar ve seçim `rows[0]`'a düşer.
 * TR yüzeyinde adreslerin ÇOĞU kanonik değildir (kanonik = EN slug, cetvel §4), yani bu
 * dal istisna değil KURAL. PostgREST sırasız döndüğü için, `.or()` sorgusuna iki satır
 * eşleştiği an hangisinin geleceği belirsizdir. Bugün ölçüldü ve zararsız: bu adrese tek
 * satır uyuyor. Ama "bugün tek satır uyuyor" bir kod güvencesi değil, bir VERİ tesadüfü —
 * ikinci satır eşleştiği an ziyaretçiye başka kategorinin sayfası döner ve HİÇBİR YERDE
 * ses çıkmaz. Sessiz kolu kapatmak, kök sebebi beklemeyi gerektirmez.
 */

/** Gerçek satır şekli: kanonik `slug` + `metadata.slug.{tr,en}`. */
const satir = (id: string, slug: string, tr?: string, en?: string) => ({
  id,
  slug,
  metadata: tr || en ? { slug: { ...(tr ? { tr } : {}), ...(en ? { en } : {}) } } : null,
})

const AKSESUAR = satir('a1', 'accessories', 'aksesuarlar', 'accessories')
const AKSIYEL = satir('b2', 'axial-industrial-fans', 'aksiyel-sanayi-fanlari', 'axial-industrial-fans')

describe('INV-KATEGORI-COZUCU-1 — adres, başka kategorinin satırını çözemez', () => {
  it('K1 (ön-koşul) — tek eşleşmede o satır döner; evren boş değil', () => {
    expect(kategoriSatiriSec([AKSIYEL], 'aksiyel-sanayi-fanlari')?.slug).toBe('axial-industrial-fans')
    expect(kategoriSatiriSec([], 'her-hangi')).toBeNull()
  })

  it('K2 (kural) — TR yerel slug, satır sırasından BAĞIMSIZ olarak doğru satırı çözer', () => {
    // ⭐ARIZANIN ŞEKLİ TAM BURADA. Eski kodda `find` ıskalayıp `rows[0]` seçiliyordu; bu
    // dizide `rows[0]` AKSESUAR, yani eski kod aksiyel adresine AKSESUARLAR satırını
    // verirdi — canlıda gözlenen sayfayla aynı sonuç.
    expect(kategoriSatiriSec([AKSESUAR, AKSIYEL], 'aksiyel-sanayi-fanlari')?.slug)
      .toBe('axial-industrial-fans')
    // Sıra ters çevrilince de aynı: seçim sıraya değil KURALA bağlı.
    expect(kategoriSatiriSec([AKSIYEL, AKSESUAR], 'aksiyel-sanayi-fanlari')?.slug)
      .toBe('axial-industrial-fans')
  })

  it('K3 (ayırt edicilik) — ESKİ davranış bu veride GERÇEKTEN yanlış cevap verirdi', () => {
    // ⭐BU KOL KAPININ KENDİSİNİ SINAR. K2 yeşilse sebebi "kural doğru kuruldu" olabileceği
    // gibi "kurgu zaten hiçbir kodda yanlış sonuç vermiyor" da olabilir — ikisi dışarıdan
    // AYNI görünür. Eski ifadeyi burada BİREBİR yeniden kurup yanlış cevabı ÜRETİYORUM.
    const rows = [AKSESUAR, AKSIYEL]
    const eski = rows.find((r) => r.slug === 'aksiyel-sanayi-fanlari') ?? rows[0]
    expect(
      eski.slug,
      'Eski ifade bu veride YANLIŞ satır vermiyorsa, K2 hiçbir şey kanıtlamaz ve bu kapı ' +
        'boş bir törendir.',
    ).toBe('accessories')
  })

  it('K4 (kural) — öncelik sırası: kanonik > TR yerel > EN yerel', () => {
    // Aynı dizeyi üç ayrı satır farklı düzeyden iddia ediyor: kanonik olan kazanmalı.
    const kanonik = satir('k', 'ortak-ad', undefined, undefined)
    const trIddia = satir('t', 'baska-kanonik', 'ortak-ad', undefined)
    const enIddia = satir('e', 'yine-baska', undefined, 'ortak-ad')
    expect(kategoriSatiriSec([enIddia, trIddia, kanonik], 'ortak-ad')?.id).toBe('k')
    expect(kategoriSatiriSec([enIddia, trIddia], 'ortak-ad')?.id).toBe('t')
  })

  it('K5 (kural) — hiçbir satır adresi iddia etmiyorsa null; rastgele satır DÖNMEZ', () => {
    // Eski koddaki `?? rows[0]` en zararlı hâlini burada gösterirdi: sorgu alakasız bir
    // satır döndürdüğünde onu "bulundu" sayardı. Yokluk, uydurulmuş varlığa yeğdir.
    expect(kategoriSatiriSec([AKSESUAR, AKSIYEL], 'hic-alakasiz-adres')).toBeNull()
  })

  it('K6 (belirsizlik) — aynı öncelikte iki satır: seçim DETERMİNİSTİK ve SESSİZ DEĞİL', () => {
    // İki kategorinin aynı adresi iddia etmesi bir VERİ kusurudur; çözücü doğruyu bilemez.
    // Yapabileceği tek şey (a) aynı isteğe daima aynı cevabı vermek — salınan bir seçim
    // "bazen doğru" görünür ve tam o yüzden hiçbir ölçüm onu yakalayamaz — ve (b) sessiz
    // kalmamak.
    const ikiz1 = satir('z-sonra', 'ikiz-bir', 'cakisan-adres')
    const ikiz2 = satir('a-once', 'ikiz-iki', 'cakisan-adres')
    const uyari = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const a = kategoriSatiriSec([ikiz1, ikiz2], 'cakisan-adres')
      const b = kategoriSatiriSec([ikiz2, ikiz1], 'cakisan-adres')
      expect(a?.id, 'seçim giriş sırasına göre değişiyor — belirsizlik gizlendi').toBe(b?.id)
      expect(uyari, 'çakışma sessizce yutuldu; veri kusuru hiçbir yerde görünmüyor')
        .toHaveBeenCalled()
    } finally {
      uyari.mockRestore()
    }
  })
})
