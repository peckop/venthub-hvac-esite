import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { odemeSiparisleEslesiyorMu } from '../odeme_eslesme'

/**
 * INV-PAY-ESLESME-1 — VULN-001 kapısının kilidi (REC-355).
 *
 * ⭐BU TESTİN EN ÖNEMLİ ÖZELLİĞİ: VAKALARIN YAPISI GERÇEK YANITLARDAN ÖLÇÜLMÜŞ.
 * Kapının geçirmesi gereken 13 vaka, `fixtures/odeme-eslesme-13-yanit.json` dosyasındaki
 * 13 SENTETİK İyzico yanıtıdır. Dosya, eski dökümdeki 13 gerçek yanıtın YAPISINI
 * (alan adları, iç içe şekil, bu testin okuduğu ilişkiler) taşır; DEĞERLERİ satır başına
 * BAĞIMSIZ üretilmiş sentetik değerlerdir ve gerçek veriden TÜRETİLMEDİ (ölçekleme,
 * kaydırma ya da harf eşlemesi yok — dosyadaki `aciklama`). Gerçek döküm herkese açık
 * depodan KALDIRILDI (ALT-39): kart parçası, yetkilendirme kodu, belirteç ve müşteri alanı
 * içeriyordu. Kural cetveli: `docs/standards/depoya-giremeyecek-veri-standard.md`
 * (zorlayan kapı: INV-DEPO-DOKUM-1).
 *
 * Sebebi bir ders: *"stub gerçeği taklit etmiyorsa test kördür."* İlk onarım tasarımım tam
 * bu yüzden çöktü — varsaydığım yanıt biçimi gerçek yanıtla uyuşmuyordu ve bunu ancak
 * gerçek veriyi okuyunca gördüm. Ders değişmedi: taklit edilmesi gereken şey DEĞERLER değil
 * YAPI ve İLİŞKİLERDİR (basketId ≠ id, conversationId 11/13, epoch bağı 13/13, price =
 * total_amount); fikstür onları aynen taşır.
 *
 * İki yön birlikte ölçülür:
 *   · GEÇMESİ GEREKEN: 13 ödeme yanıtının 13'ü. Biri düşerse kapı geliri keser.
 *   · GEÇMEMESİ GEREKEN: saldırı biçimleri, fikstürün yapısının ÜZERİNDEN kurulur (kurbanın
 *     satırı + saldırganın yanıtı), uydurma alanlarla değil.
 *
 * ⚠Fikstür YENİDEN ÜRETİLİRSE gerçek veriye DOKUNULMAZ: satırlar sıfırdan, her satır için
 * bağımsız sentetik değerlerle yazılır. Tek sabit çarpan, tek sabit kaydırma ya da harf
 * eşlemesi gibi geri çevrilebilir bir dönüşüm "sentetik" SAYILMAZ: gerçek değer ondan geri
 * kurulur. Aşağıdaki son kol (sentetik fikstür) ve depo kapısı sızıntıyı kırmızıyla yakalar.
 */

type FiksturSatiri = {
  id: string
  conversation_id: string | null
  total_amount: number | string | null
  currency?: string | null
  payment_debug?: { raw?: Record<string, unknown> } | null
}

type Fikstur = { aciklama: string; satirlar: FiksturSatiri[] }

const FIKSTUR = resolve(
  process.cwd(),
  'supabase/functions/_shared/__tests__/fixtures/odeme-eslesme-13-yanit.json',
)

function fiksturOku(): Fikstur {
  return JSON.parse(readFileSync(FIKSTUR, 'utf8')) as Fikstur
}

function fiksturVakalari(): Array<{ satir: FiksturSatiri; raw: Record<string, unknown> }> {
  const out: Array<{ satir: FiksturSatiri; raw: Record<string, unknown> }> = []
  for (const satir of fiksturOku().satirlar) {
    const raw = satir.payment_debug?.raw
    if (raw && typeof raw === 'object') out.push({ satir, raw: raw as Record<string, unknown> })
  }
  return out
}

describe('INV-PAY-ESLESME-1 — evren: fikstür gerçekten 13 yanıt taşıyor', () => {
  it('fikstür dosyası VAR ve 13 yanıt içeriyor', () => {
    // ⭐Evren kolu: dosya taşınır ya da boşalırsa aşağıdaki 13 kol SESSİZCE 0 vakayla
    // geçerdi. "Vaka bulunamadı" bir başarı değildir.
    expect(fiksturVakalari().length).toBe(13)
  })

  it('13 yanıtın 13ünde basketId VAR — çapanın ön koşulu', () => {
    const v = fiksturVakalari()
    expect(v.filter((x) => typeof x.raw.basketId === 'string').length).toBe(13)
  })

  it('conversationId 11/13 — çapa olarak KULLANILAMAZ olduğunun kaydı', () => {
    // Bu kol bir davranış değil, bir ÖLÇÜM kilidi: ilk tasarımım conversationId'yi çapa
    // yapmıştı ve 2 koşumda alan hiç yok. Sayı değişirse tasarım gerekçesi de değişir.
    const v = fiksturVakalari()
    expect(v.filter((x) => x.raw.conversationId != null).length).toBe(11)
  })

  it('basketId hiçbir vakada siparişin id si DEĞİL — biçim B nin niçin gerektiği', () => {
    const v = fiksturVakalari()
    expect(v.filter((x) => x.raw.basketId === x.satir.id).length).toBe(0)
  })
})

describe('INV-PAY-ESLESME-1 — GEÇMESİ GEREKEN: 13 ödeme yanıtı (gerçek yapıda)', () => {
  it('13 ödeme yanıtının 13ü de GEÇER (biri düşerse kapı geliri keser)', () => {
    const dusenler: string[] = []
    for (const { satir, raw } of fiksturVakalari()) {
      const k = odemeSiparisleEslesiyorMu(raw, satir)
      if (!k.gecti) dusenler.push(`${satir.id}: ${k.sebep}`)
    }
    expect(dusenler, `odeme yaniti REDDEDILDI:\n${dusenler.join('\n')}`).toEqual([])
  })

  it('13ünün hepsi EPOCH biçimiyle eşleşiyor (bugünkü canlı gerçek)', () => {
    const bicimler = fiksturVakalari().map((x) => odemeSiparisleEslesiyorMu(x.raw, x.satir).bicim)
    expect(bicimler.filter((b) => b === 'epoch').length).toBe(13)
    expect(bicimler.filter((b) => b === 'id').length).toBe(0)
  })

  it('conversationId YOK olan iki koşum da GEÇER — reconcile yolu kapanmaz', () => {
    // ⚠BU KOL BİR GELİR KAYBI YOLUNU KİLİTLER: `order-housekeeping` callback'i yalnız
    // {orderId} ile çağırıyor, yani conversationId GÖNDERMİYOR. İlk tasarımım o yolda
    // yapısal olarak reddederdi ve 15 dakika sonra sipariş iptal edilirdi.
    const konvsuz = fiksturVakalari().filter((x) => x.raw.conversationId == null)
    expect(konvsuz.length).toBe(2)
    for (const { satir, raw } of konvsuz) {
      expect(odemeSiparisleEslesiyorMu(raw, satir).gecti, `${satir.id} reddedildi`).toBe(true)
    }
  })
})

describe('INV-PAY-ESLESME-1 — GEÇMEMESİ GEREKEN: saldırı biçimleri', () => {
  /** Saldırı senaryosu: A nın ödemesi, B nin sipariş satırı. Fikstürün iki vakasından kurulur. */
  function capraz(): { kurban: FiksturSatiri; saldirganRaw: Record<string, unknown> } {
    const v = fiksturVakalari()
    return { kurban: v[0].satir, saldirganRaw: v[1].raw }
  }

  it('⛔ASIL SALDIRI: baska siparisin odemesi bu siparise YAZILAMAZ', () => {
    const { kurban, saldirganRaw } = capraz()
    const k = odemeSiparisleEslesiyorMu(saldirganRaw, kurban)
    expect(k.gecti).toBe(false)
    expect(k.sebep).toBe('kimlik_eslesmedi')
  })

  it('⛔TOTOLOJI KAPANDI: saldirgan kurbanin conversationId sini EKLESE de gecemez', () => {
    // İlk tasarımımı öldüren senaryo: saldırgan kurbanın conversation_id'sini de gönderir,
    // İyzico onu ECHO eder. Burada onu taklit ediyoruz — yanıta kurbanın conversationId'si
    // eklenmiş. Çapa `basketId` olduğu için kapı YİNE kapalı.
    const { kurban, saldirganRaw } = capraz()
    const yansimali = { ...saldirganRaw, conversationId: kurban.conversation_id }
    expect(odemeSiparisleEslesiyorMu(yansimali, kurban).gecti).toBe(false)
  })

  it('⛔basketId DUSURULEREK gecilemez (eksik alan = gecmedi, atla DEGIL)', () => {
    const { satir, raw } = fiksturVakalari()[0]
    const eksik = { ...raw }
    delete eksik.basketId
    const k = odemeSiparisleEslesiyorMu(eksik, satir)
    expect(k.gecti).toBe(false)
    expect(k.sebep).toBe('basketId_yok')
  })

  it('⛔kimlik tutsa bile TUTAR tutmuyorsa gecmez', () => {
    const { satir, raw } = fiksturVakalari()[0]
    const azTutar = { ...raw, price: 1, paidPrice: 1 }
    const k = odemeSiparisleEslesiyorMu(azTutar, satir)
    expect(k.gecti).toBe(false)
    expect(k.sebep).toBe('tutar_eslesmedi')
  })

  it('⛔paidPrice, price in ALTINDA olamaz', () => {
    const { satir, raw } = fiksturVakalari()[0]
    const k = odemeSiparisleEslesiyorMu({ ...raw, paidPrice: Number(raw.price) - 1 }, satir)
    expect(k.gecti).toBe(false)
    expect(k.sebep).toBe('paidPrice_price_altinda')
  })

  it('✔paidPrice price in USTUNDE olabilir — TAKSIT reddedilmez', () => {
    // ⭐`iyzico-payment` kendi yorumunda "paidPrice >= price olabilir" diyor ve taksit
    // [1,2,3,6,9,12] ile acik. Vade farki musteriye yansiyan bir kurulumda bu kol,
    // gercek taksitli odemenin reddedilmedigini kilitler.
    const { satir, raw } = fiksturVakalari()[0]
    expect(odemeSiparisleEslesiyorMu({ ...raw, paidPrice: Number(raw.price) + 250 }, satir).gecti)
      .toBe(true)
  })

  it('⛔satir YOKSA gecmez (satir bulunamadi = fail-closed)', () => {
    const { raw } = fiksturVakalari()[0]
    expect(odemeSiparisleEslesiyorMu(raw, null).sebep).toBe('siparis_satiri_yok')
  })

  it('⛔odeme sonucu YOKSA gecmez', () => {
    const { satir } = fiksturVakalari()[0]
    expect(odemeSiparisleEslesiyorMu(null, satir).sebep).toBe('odeme_sonucu_yok')
  })

  it('⛔para birimi TRY degilse gecmez', () => {
    const { satir, raw } = fiksturVakalari()[0]
    const k = odemeSiparisleEslesiyorMu({ ...raw, currency: 'USD' }, satir)
    expect(k.gecti).toBe(false)
    expect(k.sebep).toBe('para_birimi_eslesmedi')
  })

  it('⛔uydurma epoch ile gecilemez (yakin ama ayni degil)', () => {
    const { satir, raw } = fiksturVakalari()[0]
    const epoch = /^CONV-(\d+)$/.exec(String(satir.conversation_id))![1]
    const bir = { ...raw, basketId: `VH-${Number(epoch) + 1}-zzzzzz` }
    expect(odemeSiparisleEslesiyorMu(bir, satir).sebep).toBe('kimlik_eslesmedi')
  })
})

describe('INV-PAY-ESLESME-1 — BİÇİM A (yeni) kolu', () => {
  it('basketId siparisin id si ise dogrudan ESLESIR', () => {
    const { satir, raw } = fiksturVakalari()[0]
    const k = odemeSiparisleEslesiyorMu({ ...raw, basketId: satir.id }, satir)
    expect(k.gecti).toBe(true)
    expect(k.bicim).toBe('id')
  })

  it('bicim A da conversation_id HIC OLMASA bile eslesir', () => {
    const { satir, raw } = fiksturVakalari()[0]
    const k = odemeSiparisleEslesiyorMu(
      { ...raw, basketId: satir.id },
      { ...satir, conversation_id: null },
    )
    expect(k.gecti).toBe(true)
    expect(k.bicim).toBe('id')
  })

  it('bicim A da baska siparisin id si GECMEZ', () => {
    const v = fiksturVakalari()
    const k = odemeSiparisleEslesiyorMu({ ...v[0].raw, basketId: v[1].satir.id }, v[0].satir)
    expect(k.gecti).toBe(false)
  })

  it('sebep metni DEGER tasimaz — denetim izi sir tasiyici olmaz', () => {
    const { kurban, saldirganRaw } = (() => {
      const v = fiksturVakalari()
      return { kurban: v[0].satir, saldirganRaw: v[1].raw }
    })()
    const sebep = odemeSiparisleEslesiyorMu(saldirganRaw, kurban).sebep ?? ''
    expect(sebep).not.toContain(String(saldirganRaw.basketId))
    expect(sebep).not.toContain(String(kurban.conversation_id))
    expect(sebep).not.toContain(String(kurban.total_amount))
    expect(sebep).toMatch(/^[a-z_]+$/)
  })
})

describe('INV-PAY-ESLESME-1 — fikstür SENTETİK (kişisel veri sızıntı kolu)', () => {
  // ⭐Depo PUBLIC: fikstür gerçek değer taşırsa herkese açık yayımlanır (eski döküm
  // bu yüzden depodan kaldırıldı — ALT-39). Asıl kapı `scripts/security/depo-dokum-kapisi.cjs`
  // (INV-DEPO-DOKUM-1); bu kol fikstürün KENDİ sözleşmesini kilitler: biri fikstürü gerçek
  // değerlerle ya da gerçek dökümden türetilmiş bir eşlemeyle yeniden üretirse burada
  // kırmızı verir.
  const metin = (): string => readFileSync(FIKSTUR, 'utf8')

  /** RFC 2606 ayrılmış alan adları: gerçek bir proje ya da barındırma adresine ÇÖZÜLMEZ. */
  const AYRILMIS_SUNUCU = /^([a-z0-9-]+\.)*example\.(com|net|org)$/

  it('müşteri alanı adı ve e-posta deseni YOK', () => {
    const t = metin()
    for (const alan of [
      'customer_email',
      'customer_phone',
      'customer_name',
      'billing_address',
      'shipping_address',
      'invoice_info',
      'tckn',
    ]) {
      expect(t, `fikstür '${alan}' alanı taşıyor`).not.toContain(alan)
    }
    expect(t.includes('@'), "fikstürde '@' var (e-posta deseni)").toBe(false)
  })

  it('callbackUrl sunucuları IANA ayrılmış (example.*) — gerçek adres yok', () => {
    const vakalar = fiksturVakalari()
    expect(vakalar.length).toBe(13)
    for (const { satir, raw } of vakalar) {
      const u = new URL(String(raw.callbackUrl))
      expect(u.host, 'callbackUrl sunucusu ayrılmış ad değil').toMatch(AYRILMIS_SUNUCU)
      const basari = new URL(String(u.searchParams.get('successUrl')))
      expect(basari.host, 'successUrl sunucusu ayrılmış ad değil').toMatch(AYRILMIS_SUNUCU)
      // callbackUrl'deki orderId ve conversationId, satırın (sentetik) kimlikleriyle aynı: ilişki korunmuş
      expect(satir.id).toMatch(/^[0-9a-f-]{36}$/)
      expect(u.searchParams.get('orderId')).toBe(satir.id)
      expect(u.searchParams.get('conversationId')).toBe(satir.conversation_id)
    }
  })

  it('kart parçaları açıkça SAHTE: BIN ve son dört yalnız sıfır sayacı', () => {
    for (const { raw } of fiksturVakalari()) {
      expect(String(raw.binNumber), 'binNumber sahte değil').toMatch(/^0{5}\d$/)
      expect(String(raw.lastFourDigits), 'lastFourDigits sahte değil').toMatch(/^0{3}\d$/)
    }
  })

  it('opak alanlar açıkça SAHTE işaretli: belirteç, imza, yetkilendirme kodu, sunucu başvurusu, kart ailesi, ödeme ve işlem numarası', () => {
    for (const { raw } of fiksturVakalari()) {
      expect(String(raw.token), 'token sahte işaretli değil').toMatch(/^SENTETIK-TOKEN-\d{2}$/)
      expect(String(raw.signature), 'signature sahte işaretli değil').toMatch(/^SENTETIK-IMZA-\d{2}$/)
      expect(String(raw.authCode), 'authCode sahte işaretli değil').toMatch(/^SNT\d{3}$/)
      expect(String(raw.hostReference), 'hostReference sahte işaretli değil').toMatch(
        /^sentetik-host-ref-\d{2}$/,
      )
      expect(String(raw.cardFamily), 'cardFamily uydurma sözcük değil').toMatch(/^TestKarti[A-Z]$/)
      // ALT-39 2. tur (D6): bu iki alan gerçek iyzico biçimli 8 haneli sayılardı ("açıkça sahte" iddiasına rağmen, hiçbir test
      // kilitlemiyordu). Kod bunlara sayısal bakmaz; metinsel SENTETIK-… biçimi gerçek numarayla karışamaz.
      expect(String(raw.paymentId), 'paymentId sahte işaretli değil').toMatch(/^SENTETIK-ODEME-\d{2}$/)
      const kalemler = raw.itemTransactions as Array<Record<string, unknown>>
      expect(kalemler.length, 'kalem yok').toBeGreaterThan(0)
      for (const k of kalemler) {
        expect(String(k.paymentTransactionId), 'paymentTransactionId sahte işaretli değil').toMatch(/^SENTETIK-ISLEM-\d{2}-\d+$/)
      }
    }
  })

  it('ödeme ve işlem numaraları TEKİL ve hiçbir dize yedi haneli saf sayı değil (gerçek numara biçimi yok)', () => {
    const tumu: string[] = []
    const gez = (d: unknown): void => {
      if (typeof d === 'string') tumu.push(d)
      else if (Array.isArray(d)) d.forEach(gez)
      else if (d && typeof d === 'object') Object.values(d).forEach(gez)
    }
    gez(fiksturOku())
    expect(tumu.filter((s) => /^\d{7,}$/.test(s)), 'yedi+ haneli saf sayı dizesi var').toEqual([])
    const v = fiksturVakalari()
    expect(new Set(v.map((x) => String(x.raw.paymentId))).size).toBe(13)
    const islemler = v.flatMap((x) => (x.raw.itemTransactions as Array<Record<string, unknown>>).map((k) => String(k.paymentTransactionId)))
    expect(new Set(islemler).size).toBe(islemler.length)
  })

  it('13 sipariş id si ve 13 conversation_id TEKİL (çakışma yok)', () => {
    const v = fiksturVakalari()
    expect(new Set(v.map((x) => x.satir.id)).size).toBe(13)
    expect(new Set(v.map((x) => x.satir.conversation_id)).size).toBe(13)
  })

  it('tutarlar satır başına BAĞIMSIZ: 13 farklı tutar, hiçbiri başkasının tam katı değil', () => {
    // ⭐Tek sabit çarpanla ölçeklenmiş gerçek tutarlar tekrar eder (aynı ürün, aynı tutar) ve
    // birbirinin katı çıkabilir; bağımsız çekilmiş tutarlarda ikisi de olmaz. Bu kol, fikstürün
    // gerçek tutarlardan türetilmiş bir eşlemeye geri dönmesini yakalayan ucuz bir bekçidir.
    const kurus = fiksturVakalari().map((x) => Math.round(Number(x.satir.total_amount) * 100))
    expect(new Set(kurus).size, 'tekrar eden tutar var').toBe(13)
    for (const a of kurus) {
      for (const b of kurus) {
        if (a > b) expect(a % b, 'bir tutar başka bir tutarın tam katı').not.toBe(0)
      }
    }
  })

  it('iç tutarlı: kalem toplamları ödenen tutara, kalem ödemesi komisyonlara uyuyor', () => {
    const topla = (xs: number[]): number => xs.reduce((s, x) => s + x, 0)
    const KURUS = 5e-3 // tutarlar iki ondalık haneli
    const ONDALIK = 1e-4 // komisyon ve kalem ödemesi dört ondalık haneli
    for (const { satir, raw } of fiksturVakalari()) {
      const kalemler = raw.itemTransactions as Array<Record<string, number>>
      expect(kalemler.length, `${satir.id}: kalem yok`).toBeGreaterThan(0)
      const toplamUyuyor = (alan: string, tolerans: number): void => {
        const fark = Math.abs(topla(kalemler.map((k) => k[alan])) - Number(raw[alan]))
        expect(fark, `${satir.id}: kalem toplamı ${alan} ile uyuşmuyor`).toBeLessThanOrEqual(tolerans)
      }
      toplamUyuyor('price', KURUS)
      toplamUyuyor('paidPrice', KURUS)
      toplamUyuyor('iyziCommissionFee', ONDALIK)
      toplamUyuyor('iyziCommissionRateAmount', ONDALIK)
      for (const k of kalemler) {
        const beklenen =
          k.paidPrice - k.iyziCommissionFee - k.iyziCommissionRateAmount - k.merchantCommissionRateAmount
        const fark = Math.abs(beklenen - k.merchantPayoutAmount)
        expect(fark, `${satir.id}: kalem ödemesi formüle uymuyor`).toBeLessThanOrEqual(ONDALIK)
      }
    }
  })

  it('fikstür kendini SENTETİK ilan ediyor (aciklama)', () => {
    const f = fiksturOku()
    expect(f.aciklama).toMatch(/SENTETİK/)
    expect(f.aciklama).toMatch(/TÜRETİLMEDİ/)
    expect(f.aciklama).toMatch(/GERÇEK DEĞER YOK/)
  })
})
