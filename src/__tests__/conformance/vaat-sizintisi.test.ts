/**
 * INV-VAAT-SIZINTI-1 — vitrin, arkasında yeteneği olmayan ticari vaadi yazamaz.
 *
 * NİÇİN VAR (ölçülmüş canlı olay, REC-104 / 2026-09-01):
 * Site teklif modundaydı ve bunu kendi de söylüyordu — canlı `/checkout` "Ödeme yakında
 * açılıyor / Mağazamız kuruluş aşamasında" basıyordu. Aynı anda vitrin şunları vaat ediyordu:
 *   · her PDP'de tek CTA "TEKNİK TEKLİF İSTE" iken hemen altında "ÜCRETSİZ KARGO ·
 *     GÜVENLİ ÖDEME" rozetleri (tarayıcıda ölçüldü, 40 TR + 40 EN ürün adresi)
 *   · hava perdeleri iniş sayfasında "Taksit İmkanı — 12 aya varan taksit" ve
 *     "Güvenli Ödeme — SSL şifreli işlem" (tarayıcıda 6/6 rozet sayıldı)
 *   · /destek/sss "iyzico aracılığıyla ... güvenli ödeme yapabilirsiniz"
 * Dayanak ölçümü: 23 aktif kategorinin 23'ünde `hide_price=true`; çevrimiçi ödeme
 * `NEXT_PUBLIC_ODEME_ACIK` ile kapalı.
 *
 * NİÇİN HİÇBİR KAPI GÖRMEDİ: vaat tek dosyanın içinde YANLIŞ DEĞİL. "12 aya varan taksit"
 * geçerli bir dizedir; `tsc`, `lint`, i18n parite ve ölü-anahtar kapıları hepsi tek dosyaya
 * bakar. Kusur iki yüzeyin birbirinden habersiz konuşmasıydı — yani DOSYALAR ARASI bir
 * tutarlılık iddiası. Bu kapı tam o boşlukta durur.
 *
 * NASIL ÖLÇER: vitrin ağacındaki bileşenleri AST ile tarar, `t('a.b.c')` çağrılarını
 * toplar, anahtarları TR sözlüğünde çözer ve çözülen METİNDE vaat terimi arar.
 * Metin taraması DEĞİL AST: kaynağı düz metin olarak taramak, bu dosyadaki açıklama
 * yorumlarını da ihlal sayardı (aynı sınıf 2026-08-31'de iki kez yaşandı).
 *
 * ⭐ÖLÇÜT AYIRT EDİCİ OLMAK ZORUNDA: tek kelime "ödeme" ile taranmaz — o kelime hukuki
 * metinlerde ve admin'de meşru geçer, iki halde de aynı değeri verir, yani hiçbir şeyi
 * ayırt etmez. Terim listesi vaadi TEK BAŞINA taşıyan öbeklerden kuruludur.
 *
 * KAPSAM SINIRI (gizlenmiyor): bu kapı KAYNAK metni ölçer. DB'den gelen içeriğe
 * (kategori hero_description, ürün açıklaması) yazılmış bir vaadi GÖRMEZ; o katmanın
 * kapısı katalog tarafındadır. Ayrıca `NEXT_PUBLIC_ODEME_ACIK` değerini test etmez —
 * kuralı test eder: ödeme vaadi yalnız ödeme akışının ağacında yazılır.
 *
 * KARDEŞ KAPI — KARIŞTIRILMASIN: `promise-backing-behavior.test.tsx` (INV-PROMISE-1) da
 * "vaat" der ama BAŞKA EKSENDİR: o, bir EYLEM vaadinin ("Talebiniz Alındı!") gerçekten
 * ağ/yazma yapıp yapmadığını DAVRANIŞSAL olarak ölçer. Bu kapı ise bir YETENEK iddiasının
 * ("12 aya varan taksit") vitrinde yazılıp yazılmadığını ölçer. INV-PROMISE-1'in kendi
 * ölçümü statik taramanın "yüzey ne YAPIYOR" sorusuna cevap veremediğini kanıtlamıştı;
 * burada sorulan soru "yüzey ne SÖYLÜYOR" olduğu için statik tarama DOĞRU araçtır.
 *
 * Cetvel: docs/standards/vaat-butunlugu-standard.md
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { tr } from '../../i18n/dictionaries/tr'

const KOK = join(process.cwd(), 'src')

/**
 * VİTRİN AĞACI — müşteriye görünen, ödeme kapısının ARKASINDA OLMAYAN yüzeyler.
 * `views/checkout/**` ve `PaymentSuccessPage` KASITLI OLARAK DIŞARIDA: orası zaten
 * `NEXT_PUBLIC_ODEME_ACIK` kapısının arkasında çalışır ve orada ödeme vaadi DOĞRUDUR.
 */
const VITRIN_YOLLARI = [
  'app/_components/ProductDetailPageView.tsx',
  'components/category',
  'components/home',
  'components/products',
  'components/navigation',
  'views/category',
  'views/support',
  'views/CartPage.tsx',
  'views/BrandsPage.tsx',
  // REC-94 (2026-09-04): site kabuğu KAPSAMA ALINDI. Buraya "Hızlı Sipariş" düğmesi
  // yazılmıştı ve kapı GÖRMÜYORDU — çünkü StickyHeader hiçbir taranan yolun altında
  // değildi. Kusuru insan gözü buldu, kapı değil; boşluk kapatıldı.
  'components/StickyHeader.tsx',
]

/** Ödeme akışının kendi ağacı — vaat burada meşrudur, taranmaz. */
const MUAF_YOLLAR = ['views/checkout', 'views/PaymentSuccessPage.tsx']

/**
 * Vaat terimleri. Her biri TEK BAŞINA bir ticari yetenek iddia eder.
 * Küçük harfe indirgenmiş metinde aranır.
 */
const VAAT_TERIMLERI = [
  'taksit',
  'installment',
  'güvenli ödeme',
  'secure payment',
  'ücretsiz kargo',
  'free shipping',
  'ssl',
  '3d secure',
  'pci dss',
  'kredi kart',
  'credit card',
]

const dosyalariTopla = (mutlak: string, biriktir: string[]): void => {
  let st
  try {
    st = statSync(mutlak)
  } catch {
    return
  }
  if (st.isFile()) {
    if (/\.tsx?$/.test(mutlak) && !/\.test\.tsx?$/.test(mutlak)) biriktir.push(mutlak)
    return
  }
  for (const ad of readdirSync(mutlak)) {
    if (ad === '__tests__') continue
    dosyalariTopla(join(mutlak, ad), biriktir)
  }
}

/**
 * AST: dosyadaki TÜM dize değişmezlerini toplar (yorumlar hariç — AST yorum düğümü
 * üretmez, bu yüzden kapı kendi açıklama metnini ihlal saymaz).
 *
 * ⭐NİÇİN `t('...')` ÇAĞRISINI DEĞİL DE HER DİZEYİ TOPLUYORUZ — SABOTAJLA ÖLÇÜLDÜ:
 * İlk sürüm yalnız `t('a.b.c')` biçimindeki çağrıları topluyordu. Sabotaj testinde
 * `pdp.trust.warranty` değerini "Ücretsiz Kargo" yaptım ve kapı YEŞİL KALDI. Sebep:
 * aynı PR'da rozet listesini veri-güdümlü yapmıştım, anahtar artık `{ anahtar:
 * 'pdp.trust.warranty' }` nesnesinde duruyor ve çağrı `t(anahtar)` — yani DEĞİŞKEN.
 * Kendi refaktörüm kendi kapımı kör etmişti. Anahtarı nerede tutulursa tutulsun
 * yakalamanın tek yolu, dizeyi ÇAĞRIDAN değil DOSYADAN toplamaktır.
 */
const anahtarlariTopla = (kaynak: string): string[] => {
  const sf = ts.createSourceFile('x.tsx', kaynak, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const anahtarlar: string[] = []
  const gez = (n: ts.Node): void => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      if (/^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/.test(n.text)) anahtarlar.push(n.text)
    }
    ts.forEachChild(n, gez)
  }
  gez(sf)
  return anahtarlar
}

const coz = (anahtar: string): string | null => {
  let dugum: unknown = tr
  for (const parca of anahtar.split('.')) {
    if (typeof dugum !== 'object' || dugum === null) return null
    dugum = (dugum as Record<string, unknown>)[parca]
  }
  return typeof dugum === 'string' ? dugum : null
}

const vitrinDosyalari = (): string[] => {
  const bulunan: string[] = []
  for (const yol of VITRIN_YOLLARI) dosyalariTopla(join(KOK, yol), bulunan)
  return bulunan.filter((d) => !MUAF_YOLLAR.some((m) => d.includes(join(...m.split('/')))))
}

describe('INV-VAAT-SIZINTI-1 · vitrin ödeme/kargo vaadi yazmaz', () => {
  it('⭐ASIL İDDİA — vitrin bileşenlerinin bastığı hiçbir metin vaat terimi taşımaz', () => {
    const ihlaller: string[] = []
    for (const dosya of vitrinDosyalari()) {
      const kaynak = readFileSync(dosya, 'utf8')
      for (const anahtar of anahtarlariTopla(kaynak)) {
        const metin = coz(anahtar)
        if (!metin) continue
        const kucuk = metin.toLocaleLowerCase('tr')
        const carpan = VAAT_TERIMLERI.find((t2) => kucuk.includes(t2))
        if (carpan) {
          ihlaller.push(`${dosya.replace(KOK, 'src')} · ${anahtar} · "${metin}" (terim: ${carpan})`)
        }
      }
    }
    expect(ihlaller, `Vitrinde vaat sızıntısı:\n${ihlaller.join('\n')}`).toEqual([])
  })

  it('BOŞLUK MUHAFIZI — tarayıcı gerçekten dosya ve anahtar görüyor', () => {
    // Bu kol olmadan kapı SAHTE-YEŞİL olurdu: yol listesi bozulsa, AST çağrı adını
    // kaçırsa ya da glob hiçbir şeyle eşleşmese "ihlal yok" der ve geçerdi.
    const dosyalar = vitrinDosyalari()
    expect(dosyalar.length).toBeGreaterThan(20)
    const toplamAnahtar = dosyalar.reduce(
      (n, d) => n + anahtarlariTopla(readFileSync(d, 'utf8')).length,
      0
    )
    expect(toplamAnahtar).toBeGreaterThan(100)
  })

  it('AYIRT EDİCİ — terim listesi gerçekten vaat metnini yakalıyor', () => {
    // Kapı "her metni temiz sayan" bir ölçüt kullanmıyor: ödeme akışının kendi
    // sözlüğündeki meşru vaat metni terim listesine TAKILIR. Takılmasaydı liste ölüydü.
    const mesruVaat = tr.checkout.securePaymentProvider
    const kucuk = mesruVaat.toLocaleLowerCase('tr')
    expect(VAAT_TERIMLERI.some((t2) => kucuk.includes(t2))).toBe(true)
  })

  it('⭐DÖNÜŞ YÖNÜ — geri dönüş listesi cetvelde DURUYOR ve boş değil', () => {
    // Mod-bağımlı kapılar iki yönlü yazılır (kapalıyken yok, açıkken var) ve bir
    // DAVRANIŞIN dönüşünü güvenceye alır. Ama buradaki vaatlerin bir kısmı davranış
    // değil İÇERİKTİ ve sözlükten SİLİNDİ. Silinmiş metnin yokluğunu hiçbir kapı
    // gösteremez — gösterecek bir şey kalmaz. Tek savunma, neyin geri gelmesi
    // gerektiğini ADIYLA yazan bir liste ve o listenin kaybolmadığını ölçmek.
    //
    // Soru Recep'ten geldi: "fiyatlı hâle dönüş yolculuğunda aynı sorunları
    // yaşayacak mıyız?" — bu kol o sorunun mekanik cevabı.
    const cetvel = readFileSync(
      join(process.cwd(), 'docs', 'standards', 'vaat-butunlugu-standard.md'),
      'utf8'
    )
    expect(cetvel, 'Cetvelde GERİ DÖNÜŞ LİSTESİ bölümü yok').toContain('GERİ DÖNÜŞ LİSTESİ')

    // Liste gerçekten dolu mu? Kaldırılan anahtarlar adıyla geçmeli — bölüm başlığının
    // tek başına durması (içi boşaltılmış liste) kapıyı geçmemeli.
    const kaldirilanlar = [
      'cart.securePayment',
      'category.trustSignals.installment',
      'pdp.trust.freeShipping',
      'support.faq',
    ]
    const eksik = kaldirilanlar.filter((k) => !cetvel.includes(k))
    expect(eksik, `Geri dönüş listesinde bu kalemler ADIYLA yok: ${eksik.join(', ')}`).toEqual([])
  })

  it('MUAFİYET GERÇEK — ödeme akışı ağacı taramanın dışında', () => {
    // Muafiyet olmasaydı kapı, doğru yerde duran vaadi de ihlal sayardı; o zaman
    // ekip kapıyı gevşetmek zorunda kalırdı. Muafiyetin ölçülmesi bunu belgeler.
    const hepsi: string[] = []
    dosyalariTopla(join(KOK, 'views', 'checkout'), hepsi)
    expect(hepsi.length).toBeGreaterThan(0)
    expect(vitrinDosyalari().some((d) => d.includes(join('views', 'checkout')))).toBe(false)
  })
})
