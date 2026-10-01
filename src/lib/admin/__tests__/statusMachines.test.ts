import { describe, expect, it } from 'vitest'

import { allowedNextOrderStatuses, canTransitionOrder } from '../orderStatusMachine'
import { allowedNextStatuses } from '../returnStatusMachine'

/**
 * T057-VH / T058-VH — operasyon döngüsü denetiminde ölçülen iki kusuru
 * geri gelmekten alıkoyan testler.
 *
 * Bunlar "makine ne diyor" testi değil, **yeteneğin var olduğunun** testidir:
 * aksiyon butonları ve toplu işlem hedefleri doğrudan bu haritalardan üretiliyor,
 * dolayısıyla haritadaki bir eksik = arayüzde tamamen kapalı bir yetenek.
 */

describe('returnStatusMachine — iade reddi (T057-VH)', () => {
  it('bekleyen bir talep REDDEDİLEBİLİR', () => {
    // Bu geçiş YOKTU: "Reddet" butonu hiç render edilmiyordu ve toplu işlemde
    // `rejected` daima 0 hedef buluyordu. Admin bir iadeyi reddedemiyordu.
    expect(allowedNextStatuses('requested')).toContain('rejected')
  })

  it('reddetmek `cancelled` ile KARIŞTIRILMAZ — ikisi de ayrı ayrı mümkün', () => {
    // `cancelled` "müşteri vazgeçti" demektir; reddi onunla kapatmak kaydı
    // yanlış sebeple kapatır ve raporlamayı bozar.
    const next = allowedNextStatuses('requested')
    expect(next).toContain('cancelled')
    expect(next).toContain('approved')
  })

  it('ONAYLANMIŞ bir talep reddedilemez (monotonluk, kural 11)', () => {
    expect(allowedNextStatuses('approved')).not.toContain('rejected')
  })

  it('`rejected` terminaldir', () => {
    expect(allowedNextStatuses('rejected')).toEqual([])
  })
})

describe('orderStatusMachine — kanban monotonluk kapısı (T058-VH)', () => {
  it('teslim edilmiş sipariş başa döndürülemez', () => {
    // Panoda hiçbir koruma yoktu: teslim edilmiş sipariş "Yeni" sütununa
    // sürüklenebiliyordu.
    expect(canTransitionOrder('delivered', 'pending')).toBe(false)
    expect(canTransitionOrder('delivered', 'confirmed')).toBe(false)
    expect(canTransitionOrder('delivered', 'shipped')).toBe(false)
  })

  it('teslim sonrası tek çıkış iadedir (iptal DEĞİL)', () => {
    // Teslim edilmiş bir siparişi "iptal" saymak yanlış kayıt üretir; para geri
    // dönüyorsa doğru statü iadedir. Kısmi iade de meşru bir sonuçtur.
    expect(allowedNextOrderStatuses('delivered')).toEqual(['refunded', 'partial_refunded'])
    expect(canTransitionOrder('delivered', 'cancelled')).toBe(false)
  })

  it('iade HER aşamadan mümkün — kargo çıkmadan da para geri dönebilir', () => {
    // İlk yazımda iade yalnız `delivered`'dan izinliydi; mevcut servis testleri
    // (`processing → refunded`) bunu yakaladı. Dar makine gerçek bir iş akışını
    // kapatıyordu — makine düzeltildi, test değil.
    for (const s of ['pending', 'paid', 'confirmed', 'processing', 'shipped']) {
      expect(canTransitionOrder(s, 'refunded')).toBe(true)
    }
  })

  it('iptal ve iade terminaldir', () => {
    expect(allowedNextOrderStatuses('cancelled')).toEqual([])
    expect(allowedNextOrderStatuses('refunded')).toEqual([])
  })

  it('normal ileri akış açık', () => {
    expect(canTransitionOrder('pending', 'confirmed')).toBe(true)
    expect(canTransitionOrder('confirmed', 'processing')).toBe(true)
    expect(canTransitionOrder('processing', 'shipped')).toBe(true)
    expect(canTransitionOrder('shipped', 'delivered')).toBe(true)
  })

  it('"hazırlanıyor" adımı ATLANAMAZ: kargoya yalnız `processing`ten girilir (karar 221)', () => {
    // `confirmed → shipped` kestirmesi vardı; `paid → shipped` eklemek (mutasyon S08)
    // bütün paketi yeşil bırakıyordu. Tek tek geçiş saymak yerine DEĞİŞMEZİ sabitliyoruz:
    // dokuz durumun hangisinden `shipped`e girilebildiği. Yeni bir kestirme eklenirse
    // (hangi durumdan olursa olsun) bu test kırmızı verir.
    const hepsi = [
      'pending', 'paid', 'confirmed', 'processing', 'shipped',
      'delivered', 'cancelled', 'refunded', 'partial_refunded',
    ]
    const kargoyaGirebilen = hepsi.filter((s) => canTransitionOrder(s, 'shipped'))
    expect(kargoyaGirebilen).toEqual(['processing'])
  })

  it('teslim edilene kadar iptal her aşamada mümkün', () => {
    for (const s of ['pending', 'paid', 'confirmed', 'processing', 'shipped']) {
      expect(canTransitionOrder(s, 'cancelled')).toBe(true)
    }
    expect(canTransitionOrder('delivered', 'cancelled')).toBe(false)
  })

  it('bilinmeyen statü KİLİTLİ (fail-closed)', () => {
    expect(allowedNextOrderStatuses('bilinmeyen')).toEqual([])
    expect(canTransitionOrder('bilinmeyen', 'shipped')).toBe(false)
  })
})

/**
 * REC-535 — mutasyon testi ilk koşusu (sipariş + iade durum makineleri).
 *
 * Yukarıdaki testler yasak geçişleri (teslimden geri dönüş, terminal çıkış) ve birkaç izinli
 * geçişi sabitliyor; ama izinli akışın çoğu ve geri-gitme yasağının çoğu KİLİTSİZDİ:
 * `confirmed → processing`, `partial_refunded → refunded`, `pending → partial_refunded`,
 * `shipped → pending` gibi tek satırlık bozulmalar bütün paketi yeşil bırakıyordu.
 * Aşağıdaki her test, o bozulmalardan en az birini öldürdüğü koşuyla ölçülerek eklendi.
 */
describe('orderStatusMachine — izinli akış ve geri gidememe (REC-535)', () => {
  it('ileri akışın her halkası açık: pending → confirmed → processing → shipped → delivered', () => {
    expect(canTransitionOrder('pending', 'confirmed')).toBe(true)
    expect(canTransitionOrder('paid', 'confirmed')).toBe(true)
    expect(canTransitionOrder('confirmed', 'processing')).toBe(true)
    expect(canTransitionOrder('processing', 'shipped')).toBe(true)
    expect(canTransitionOrder('shipped', 'delivered')).toBe(true)
  })

  it('hiçbir aşamadan geriye gidilemez (monotonluk, kural 11)', () => {
    // `pending` ve `paid` panoda aynı "Yeni" sütunu; iade/iptal zincir dışı çıkış durumlarıdır.
    const sira: Record<string, number> = {
      pending: 0,
      paid: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
    }
    const geriye: string[] = []
    for (const kaynak of Object.keys(sira)) {
      for (const hedef of allowedNextOrderStatuses(kaynak)) {
        if (hedef in sira && sira[hedef] < sira[kaynak]) geriye.push(`${kaynak} → ${hedef}`)
      }
    }
    expect(geriye, `geri geçiş izinli: ${geriye.join(', ')}`).toEqual([])
  })

  it('kısmi iade HER aşamadan mümkün — tam iade gibi teslimden önce de olur', () => {
    for (const s of ['pending', 'paid', 'confirmed', 'processing', 'shipped', 'delivered']) {
      expect(canTransitionOrder(s, 'partial_refunded')).toBe(true)
    }
  })

  it('kısmi iade sonradan tam iadeye tamamlanabilir, başka yere gidemez', () => {
    expect(allowedNextOrderStatuses('partial_refunded')).toEqual(['refunded'])
  })

  it('dönen liste değiştirilse makinenin kendisi bozulmaz (kopya döner)', () => {
    const liste = allowedNextOrderStatuses('pending')
    liste.length = 0
    liste.push('delivered')
    expect(allowedNextOrderStatuses('pending')).toEqual([
      'confirmed',
      'cancelled',
      'refunded',
      'partial_refunded',
    ])
    expect(canTransitionOrder('pending', 'delivered')).toBe(false)
  })
})

describe('returnStatusMachine — iade zinciri ve giriş kuralları (REC-535)', () => {
  it('iade baştan sona tamamlanabilir: requested → approved → in_transit → received → refunded', () => {
    expect(allowedNextStatuses('requested')).toContain('approved')
    expect(allowedNextStatuses('approved')).toContain('in_transit')
    expect(allowedNextStatuses('in_transit')).toContain('received')
    expect(allowedNextStatuses('received')).toContain('refunded')
  })

  it('her statüye yalnız kendi öncülünden girilir — aşama atlanamaz, geri dönülemez', () => {
    // Yukarıdaki `toContain` testleri makine GENİŞLERSE (fazladan geçiş eklenirse) fark etmezdi.
    // Bu test ters yönden bakar: kim hangi statüye girebiliyor.
    const hepsi = ['requested', 'approved', 'rejected', 'in_transit', 'received', 'refunded', 'cancelled']
    const girenler = (hedef: string): string[] =>
      hepsi.filter((kaynak) => allowedNextStatuses(kaynak).includes(hedef))

    expect(girenler('requested')).toEqual([]) // talep başlangıçtır, hiçbir yerden dönülmez
    expect(girenler('approved')).toEqual(['requested'])
    expect(girenler('rejected')).toEqual(['requested'])
    expect(girenler('in_transit')).toEqual(['approved'])
    expect(girenler('received')).toEqual(['in_transit'])
    expect(girenler('refunded')).toEqual(['received'])
  })

  it('bilinmeyen statü KİLİTLİ (fail-closed) — sessizce ileri geçiş vermez', () => {
    expect(allowedNextStatuses('bilinmeyen')).toEqual([])
    expect(allowedNextStatuses('')).toEqual([])
  })

  it('dönen liste değiştirilse makinenin kendisi bozulmaz (kopya döner)', () => {
    const liste = allowedNextStatuses('requested')
    liste.length = 0
    liste.push('refunded')
    expect(allowedNextStatuses('requested')).toEqual(['approved', 'rejected', 'cancelled'])
  })
})
