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
 * Dayanak ölçümü: 23 aktif kategorinin 23'ünde `hide_price=true`; çevrimiçi ödeme KAPALI
 * (kapalılığın taşıyıcısı burada yazılmıyor — karar tek yerde, `checkout/page.tsx`).
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
 * kapısı katalog tarafındadır. Ayrıca ödemenin AÇIK/KAPALI değerini test etmez —
 * kuralı test eder: ödeme vaadi yalnız ödeme akışının ağacında yazılır. (Değeri test
 * etmemek bilinçli: kapı, bayrak hangi taşıyıcıda durursa dursun aynı kuralı ölçer.)
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
 * ödeme kapısının ARKASINDA çalışır ve orada ödeme vaadi DOĞRUDUR.
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
  // REC-148 (2026-09-05): AYNI SINIF, İKİ YENİ BOŞLUK. Marka detay sayfası "Bu markaya ait
  // ürünler yakında eklenecektir" basıyordu, hızlı önizleme "Ürün açıklaması yakında
  // eklenecektir" — ikisi de vitrin, ikisi de taranan hiçbir yolun altında DEĞİLDİ.
  // (`views/BrandsPage.tsx` listedeydi ama detay sayfası ayrı dosya; `components/products`
  // listedeydi ama QuickViewModal `components/` kökünde duruyor.) Kusuru yine insan gözü
  // buldu. Ölçüldükçe genişleyen liste, kapının kendi kör noktasının kaydıdır.
  'views/BrandDetailPage.tsx',
  'components/QuickViewModal.tsx',
  // REC-340 (2026-09-15): AYNI SINIF, ÜÇÜNCÜ VAKA. Arama kutusu placeholder'ı "Ürün,
  // kategori veya YAPAY ZEKA DESTEKLİ arama..." diyordu; arkasında yapay zeka yoktu.
  // `SearchOverlay.tsx` `components/` kökünde duruyor ve taranan HİÇBİR yolun altında
  // DEĞİLDİ — yani kapı, sitenin en çok görülen giriş alanını hiç görmüyordu. Kusuru
  // YİNE insan gözü buldu (Recep), kapı değil. Bu liste kapının kendi kör noktasının
  // kaydıdır ve üçüncü kez aynı sebeple genişliyor: dosya adı bazlı yol listesi,
  // kapsamı KENDİ BAŞINA güvenceye almaz.
  'components/SearchOverlay.tsx',
]

/**
 * ZAMAN VAADİ AĞACI (INV-VAAT-SIZINTI-2) — vitrin YOLLARI + ÖDEME AKIŞI.
 *
 * ⭐NİÇİN MUAFİYET YOK, INV-1'den farklı olarak: ödeme akışında "güvenli ödeme" yazmak
 * MEŞRUDUR (orası zaten ödeme yapar), ama "yakında açılıyor" yazmak meşru DEĞİLDİR —
 * o tarihi kimse bilmiyor. Yani iki kapının muafiyeti aynı olamaz: yetenek vaadi bağlama
 * göre doğrulanabilir, zaman vaadi hiçbir bağlamda doğrulanamaz.
 */
const ZAMAN_VAADI_YOLLARI = [...VITRIN_YOLLARI, 'views/checkout']

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

/**
 * ZAMAN VAADİ TERİMLERİ (REC-148, 2026-09-05).
 *
 * NİÇİN AYRI LİSTE: bunlar bir YETENEK değil bir TARİH iddia eder. "Yakında eklenecektir"
 * cümlesinin arkasında hiçbir taahhüt yoktur — ürün açıklaması aylardır boş olabilir ve
 * ziyaretçiye söylenen şey her gün biraz daha yalan olur. K1: vitrin var olanı gösterir.
 *
 * ⭐ÖLÇÜT ÖBEK, TEK KELİME DEĞİL — bu dosyanın kendi doktrini: ayırt etmeyen ölçüt ölçüm
 * değildir. Çıplak "yakında" meşru cümlelerde geçebilir ("yakında bir bayi"); vaadi
 * taşıyan şey FİİLLE kurulan öbektir.
 */
const ZAMAN_VAADI_TERIMLERI = [
  'yakında eklenecek',
  'yakında açıl',
  'yakında sunul',
  'çok yakında',
  'will be added soon',
  'added soon',
  'opening soon',
  'coming soon',
]

/**
 * TEKNOLOJİ VAADİ TERİMLERİ (REC-340 Faz 0, 2026-09-15).
 *
 * NİÇİN ÜÇÜNCÜ AYRI LİSTE: kardeş iki liste farklı eksenlerde ölçüyor — VAAT_TERIMLERI bir
 * TİCARİ YETENEK (taksit, ücretsiz kargo), ZAMAN_VAADI_TERIMLERI bir TARİH iddia ediyor.
 * "Yapay zeka destekli arama" ikisi de değil: bir TEKNOLOJİNİN ÜRÜNDE VAR OLDUĞUNU iddia
 * ediyor. Bu iddia ölçülebilir ve ölçüldüğünde YANLIŞ çıktı — arama düz PostgreSQL
 * tam-metin aramasıydı (to_tsvector/plainto_tsquery), embedding yok, vektör yok, dış
 * çağrı yok. Yani ziyaretçi "otoparkım 400 m2, hangi fan" diye yazınca hiçbir şey
 * bulamıyordu; kutunun kendi etiketi ona yanlış şeyi denemeyi öğretiyordu.
 *
 * ⭐ÖLÇÜT ÖBEK, TEK KELİME DEĞİL — bu dosyanın doktrini burada da geçerli. Çıplak "yapay
 * zeka" KOYULMAZ: meşru bağlamda geçebilir (bir bilgi yazısı yapay zekadan bahsedebilir,
 * bir ürün açıklaması "yapay zeka ile tasarlanmış" demeyebilir ama bir başlık anabilir).
 * İddiayı taşıyan şey, teknolojiyi ÜRÜNÜN ÖZELLİĞİ olarak bağlayan öbektir.
 *
 * YETENEK GELİRSE İDDİA HAK EDİLİR: REC-340 Faz 2/3 anlam bazlı aramayı getirirse bu terim
 * yeniden yazılabilir. O gün kapı kırmızı derse, listeden ÇIKARMANIN gerekçesi ÖLÇÜM olur —
 * tıpkı bugün konmasının gerekçesinin ölçüm olduğu gibi.
 */
const TEKNOLOJI_VAADI_TERIMLERI = [
  'yapay zeka destekli',
  'yapay zekâ destekli',
  'yapay zeka ile',
  'ai destekli',
  'ai-powered',
  'ai powered',
  'powered by ai',
]

/**
 * ⭐TÜRKÇE KÜÇÜLTME İNGİLİZCE TERİMİ KÖRLEŞTİRİR — SABOTAJLA ÖLÇÜLDÜ (2026-09-15, REC-340).
 *
 * INV-VAAT-SIZINTI-3'ü yazarken yalnız `toLocaleLowerCase('tr')` kullandım, kardeş iki kapı
 * gibi. Ayırt edici kol KIRMIZI yandı: Türkçede büyük `I` harfinin küçüğü NOKTASIZ `ı`
 * olduğu için "AI-powered" metni "aı-powered"a dönüyor ve `'ai-powered'` terimi HİÇ
 * eşleşmiyor. Ölçüt doğruydu, EVREN yanlıştı; bunu ancak silinmiş cümleyi ölçüte geri
 * veren kol gösterdi.
 *
 * ⭐KARDEŞ KAPILAR DA AYNI KÖRDÜ — ÖLÇÜLDÜ, VARSAYILMADI: INV-1'in listesindeki
 * `'installment'` ve `'pci dss'` terimleri, metin "Installment" ya da "PCI DSS" diye
 * yazılmışsa hiç yakalanmıyordu ("ınstallment", "pcı dss"). Bugün ihlal YOK, ama kapı bu
 * yazımı yarın da göremezdi. Aynı kusur olduğu için üç kapı da bu yardımcıya bağlandı.
 *
 * Bu değişiklik kapıyı yalnız GENİŞLETİR: bir terim iki küçültmeden BİRİNDE geçiyorsa
 * yakalanır. Hiçbir meşru metni ihlal saymadığı, her üç bölümün ters yön kollarıyla ölçülür.
 */
const ikiBicimdeAra = (metin: string, terimler: readonly string[]): string | undefined => {
  const trKucuk = metin.toLocaleLowerCase('tr')
  const enKucuk = metin.toLowerCase()
  return terimler.find((t2) => trKucuk.includes(t2) || enKucuk.includes(t2))
}

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
        const carpan = ikiBicimdeAra(metin, VAAT_TERIMLERI)
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
    expect(ikiBicimdeAra(mesruVaat, VAAT_TERIMLERI)).toBeDefined()
  })

  it('⭐AYIRT EDİCİ — BÜYÜK HARFLİ İngilizce yazım da yakalanıyor (REC-340 ölçümü)', () => {
    // Türkçe küçültme büyük `I`yı noktasız `ı` yapar; eski ölçüt "Installment" ve
    // "PCI DSS" yazımlarını HİÇ görmüyordu. Bugün sözlükte böyle bir metin yok, ama
    // yarın yazılırsa kapı görsün diye körlük ADIYLA ölçülür.
    for (const metin of ['Installment available', 'PCI DSS compliant']) {
      expect(ikiBicimdeAra(metin, VAAT_TERIMLERI), `yakalanmadı: ${metin}`).toBeDefined()
    }
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

/**
 * INV-VAAT-SIZINTI-2 — hiçbir yüzey "yakında" diye TARİH vaat edemez.
 *
 * NİÇİN VAR (ölçülmüş, REC-148 / 2026-09-05): Recep bir önizlemeye bakıp *"ikilik üçlük
 * olmamalı"* dedi. Çıkan tabloda dört ayrı yerde zaman vaadi vardı:
 *   · ürün detayında açıklama yoksa "Bu ürün için detaylı açıklama yakında eklenecektir."
 *   · hızlı önizlemede "Ürün açıklaması yakında eklenecektir."
 *   · marka detayında "Bu markaya ait ürünler yakında eklenecektir."
 *   · ödeme kapalı ekranında "Ödeme yakında açılıyor"
 * Dördünün de arkasında hiçbir taahhüt yoktu. Bir ürünün açıklaması aylardır boş olabilir;
 * "yakında" her geçen gün biraz daha yalan olur — ve kimse fark etmez, çünkü hata değil.
 *
 * ⭐KARDEŞİNDEN FARKI — MUAFİYET: INV-1 ödeme akışını MUAF tutar (orada "güvenli ödeme"
 * yazmak doğrudur). Bu kapı ödeme akışını TARAR, çünkü zaman vaadi orada da doğrulanamaz;
 * nitekim yakalanan dört vaatten biri tam oradaydı. İki kapı aynı dosyada durur ama
 * muafiyetleri aynı OLAMAZ — bunu tek kapıya sıkıştırmak, birini gevşetmek olurdu.
 *
 * Cetvel: docs/standards/vaat-butunlugu-standard.md · Kararlar Vitrin 15A K1/K1a/K7
 */
const zamanVaadiDosyalari = (): string[] => {
  const bulunan: string[] = []
  for (const yol of ZAMAN_VAADI_YOLLARI) dosyalariTopla(join(KOK, yol), bulunan)
  return bulunan
}

const zamanVaadiBul = (metin: string): string | undefined =>
  ikiBicimdeAra(metin, ZAMAN_VAADI_TERIMLERI)

describe('INV-VAAT-SIZINTI-2 · hiçbir yüzey "yakında" diye tarih vaat etmez', () => {
  it('⭐ASIL İDDİA — taranan hiçbir yüzeyin bastığı metin zaman vaadi taşımaz', () => {
    const ihlaller: string[] = []
    for (const dosya of zamanVaadiDosyalari()) {
      const kaynak = readFileSync(dosya, 'utf8')
      for (const anahtar of anahtarlariTopla(kaynak)) {
        const metin = coz(anahtar)
        if (!metin) continue
        const carpan = zamanVaadiBul(metin)
        if (carpan) {
          ihlaller.push(`${dosya.replace(KOK, 'src')} · ${anahtar} · "${metin}" (terim: ${carpan})`)
        }
      }
    }
    expect(
      ihlaller,
      'Zaman vaadi sızıntısı — bu metinler bir TARİH söz veriyor ama arkasında taahhüt yok.\n' +
        'Doğrusu: ya olgu dili ("henüz katalogda değil"), ya satırın HİÇ basılmaması (K7).\n' +
        ihlaller.join('\n'),
    ).toEqual([])
  })

  it('⭐AYIRT EDİCİ — terim listesi kaldırılan DÖRT cümlenin dördünü de yakalıyor', () => {
    // Ayırt etmeyen ölçüt ölçüm değildir: liste boşaltılsa ya da terimler yanlış yazılsa
    // üstteki kol "ihlal yok" der ve SAHTE-YEŞİL geçerdi. Bu kol, kaldırılan gerçek
    // cümleleri ölçüte geri verip listenin hâlâ çalıştığını kanıtlar.
    const kaldirilanCumleler = [
      'Bu ürün için detaylı açıklama yakında eklenecektir.',
      'Ürün açıklaması yakında eklenecektir.',
      'Bu markaya ait ürünler yakında eklenecektir.',
      'Ödeme yakında açılıyor',
      'A detailed description for this product will be added soon.',
      'Checkout opening soon',
    ]
    const kacan = kaldirilanCumleler.filter((c) => !zamanVaadiBul(c))
    expect(kacan, `Terim listesi bu cümleleri YAKALAMIYOR: ${kacan.join(' | ')}`).toEqual([])
  })

  it('⭐AYIRT EDİCİ (ters yön) — meşru metni ihlal saymıyor', () => {
    // Kapı her şeye kırmızı derse de ölçüm değildir. Yerine yazılan olgu dili ve
    // K1a cümlesi TEMİZ geçmeli; geçmezse ekip kapıyı gevşetmek zorunda kalırdı.
    const mesruMetinler = [
      'Bu markanın ürünleri henüz katalogda değil.',
      'This brand has no products in the catalogue yet.',
      'Şu an teklif kipindeyiz; sipariş ve ödeme kapalı.',
      'We are in quote mode; ordering and payment are closed.',
      'Mağazamız kuruluş aşamasında. Fiyatlar günceldir; sipariş için bizden teklif isteyebilirsiniz — aynı gün dönüş yapıyoruz.',
    ]
    const yanlisYakalanan = mesruMetinler.filter((m) => zamanVaadiBul(m))
    expect(
      yanlisYakalanan,
      `Kapı MEŞRU metni ihlal sayıyor: ${yanlisYakalanan.join(' | ')}`,
    ).toEqual([])
  })

  it('BOŞLUK MUHAFIZI — tarayıcı dosyaları ve ödeme ağacını GERÇEKTEN görüyor', () => {
    // Yol listesi bozulsa ya da ödeme ağacı sessizce kapsam dışı kalsa kapı "ihlal yok"
    // deyip geçerdi. Kapsamın kendisi ölçülür — kardeş kapının muafiyetiyle karışmasın.
    const dosyalar = zamanVaadiDosyalari()
    expect(dosyalar.length).toBeGreaterThan(20)
    expect(
      dosyalar.some((d) => d.includes(join('views', 'checkout'))),
      'Ödeme akışı bu kapının kapsamında OLMALI (kardeş kapıdan farkı tam budur).',
    ).toBe(true)
    // REC-148'de kör nokta çıkan iki dosya adıyla kapsamda mı — liste sessizce daralmasın.
    for (const beklenen of ['BrandDetailPage.tsx', 'QuickViewModal.tsx']) {
      expect(
        dosyalar.some((d) => d.endsWith(beklenen)),
        `${beklenen} kapsamda DEĞİL — REC-148'de kör nokta çıkan dosya kapsamdan düşmüş.`,
      ).toBe(true)
    }
    const toplamAnahtar = dosyalar.reduce(
      (t2, d) => t2 + anahtarlariTopla(readFileSync(d, 'utf8')).filter((a) => coz(a)).length,
      0,
    )
    expect(toplamAnahtar, 'Hiçbir anahtar çözülemedi — tarayıcı kör.').toBeGreaterThan(50)
  })
})

/**
 * INV-VAAT-SIZINTI-3 — hiçbir vitrin metni, üründe OLMAYAN bir teknolojiyi iddia etmez.
 *
 * NİÇİN VAR (ölçülmüş, REC-340 Faz 0 / 2026-09-15): arama kutusunun placeholder'ı TR'de
 * "Ürün, kategori veya yapay zeka destekli arama...", EN'de "...AI-powered search..."
 * diyordu. Prod'da fonksiyonun gövdesi okundu (iddia değil, ölçüm): to_tsvector var,
 * sözlük `turkish`, plainto_tsquery var; embedding YOK, vektör YOK, dış HTTP çağrısı YOK.
 * Yani düz tam-metin arama. Müşteriye olmayan bir özellik vaat ediliyordu.
 *
 * ⭐KARDEŞLERİNDEN FARKI — EKSEN: INV-1 ticari yeteneği, INV-2 tarihi ölçer. Bu kapı bir
 * TEKNOLOJİNİN VARLIĞINI ölçer ve muafiyeti INV-1 ile aynıdır (ödeme akışı dışarıda),
 * çünkü orada da yapay zeka iddiası doğru olmaz. Üç ekseni tek listeye sıkıştırmak,
 * üçünün de ölçütünü körleştirirdi.
 *
 * Cetvel: docs/standards/vaat-butunlugu-standard.md · Kararlar Vitrin 15A K1
 */
const teknolojiVaadiBul = (metin: string): string | undefined =>
  ikiBicimdeAra(metin, TEKNOLOJI_VAADI_TERIMLERI)

describe('INV-VAAT-SIZINTI-3 · vitrin, üründe olmayan teknolojiyi iddia etmez', () => {
  it('⭐ASIL İDDİA — vitrinin bastığı hiçbir metin teknoloji vaadi taşımaz', () => {
    const ihlaller: string[] = []
    for (const dosya of vitrinDosyalari()) {
      const kaynak = readFileSync(dosya, 'utf8')
      for (const anahtar of anahtarlariTopla(kaynak)) {
        const metin = coz(anahtar)
        if (!metin) continue
        const carpan = teknolojiVaadiBul(metin)
        if (carpan) {
          ihlaller.push(`${dosya.replace(KOK, 'src')} · ${anahtar} · "${metin}" (terim: ${carpan})`)
        }
      }
    }
    expect(
      ihlaller,
      'Teknoloji vaadi sızıntısı — bu metinler üründe bir teknolojinin VAR olduğunu söylüyor.\n' +
        'Doğrusu: ya iddiayı kaldırmak, ya yeteneği gerçekten getirmek. Arada bir yer YOK.\n' +
        ihlaller.join('\n'),
    ).toEqual([])
  })

  it('⭐AYIRT EDİCİ — terim listesi KALDIRILAN iki cümlenin ikisini de yakalıyor', () => {
    // Ayırt etmeyen ölçüt ölçüm değildir: liste boşaltılsa üstteki kol "ihlal yok" der ve
    // SAHTE-YEŞİL geçerdi. Bu kol, REC-340'ta sözlükten SİLİNEN gerçek iki cümleyi ölçüte
    // geri verip listenin hâlâ çalıştığını kanıtlar. Silinmiş metnin yokluğunu başka
    // hiçbir kapı gösteremez — gösterecek bir şey kalmaz.
    const kaldirilanCumleler = [
      'Ürün, kategori veya yapay zeka destekli arama...',
      'Search products, categories, or AI-powered search...',
    ]
    const kacan = kaldirilanCumleler.filter((c) => !teknolojiVaadiBul(c))
    expect(kacan, `Terim listesi bu cümleleri YAKALAMIYOR: ${kacan.join(' | ')}`).toEqual([])
  })

  it('⭐AYIRT EDİCİ (ters yön) — meşru metni ve yerine konan metni ihlal saymıyor', () => {
    // Kapı her şeye kırmızı derse de ölçüm değildir. İki şey TEMİZ geçmeli: (1) yerine
    // konan gerçek placeholder, (2) yapay zekadan meşru biçimde söz eden cümleler. Çıplak
    // "yapay zeka" ölçüte KONMADI tam bu yüzden — konsaydı bu kol kırmızı yanardı ve ekip
    // kapıyı gevşetmek zorunda kalırdı.
    const mesruMetinler = [
      'Ürün, kategori veya marka ara...',
      'Search products, categories, brands...',
      'Yapay zeka alanındaki gelişmeler HVAC sektörünü de etkiliyor.',
      'Bu yazıda yapay zeka kavramını kısaca anlatıyoruz.',
    ]
    const yanlisYakalanan = mesruMetinler.filter((m) => teknolojiVaadiBul(m))
    expect(
      yanlisYakalanan,
      `Kapı MEŞRU metni ihlal sayıyor: ${yanlisYakalanan.join(' | ')}`,
    ).toEqual([])
  })

  it('BOŞLUK MUHAFIZI — arama kutusu GERÇEKTEN kapsamda ve tarayıcı anahtar görüyor', () => {
    // REC-340'ın asıl kusuru terim listesi değil KAPSAMDI: kutu taranan hiçbir yolun
    // altında değildi. O yüzden bu kol dosyayı ADIYLA arar — yol listesi sessizce
    // daralırsa kapı "ihlal yok" deyip geçmesin.
    const dosyalar = vitrinDosyalari()
    const kutu = dosyalar.find((d) => d.endsWith('SearchOverlay.tsx'))
    expect(kutu, 'SearchOverlay.tsx kapsamda DEĞİL — REC-340 kör noktası geri gelmiş.').toBeDefined()

    // ⭐KAPSAMDA OLMAK YETMEZ, ZİNCİR İŞLEMELİ: dosya taranıyor olsa bile AST anahtarı
    // görmezse ya da anahtar sözlükte çözülmezse kapı yine SAHTE-YEŞİL geçerdi. Üç halka
    // (dosya bulundu → anahtar toplandı → metin çözüldü) burada TEK SEFERDE ölçülür;
    // ölçülen anahtar da tam olarak REC-340'ta değiştirilen anahtardır.
    const kutuAnahtarlari = anahtarlariTopla(readFileSync(kutu as string, 'utf8'))
    expect(
      kutuAnahtarlari,
      'Arama kutusunun placeholder anahtarı AST ile toplanamadı — zincir kopuk.',
    ).toContain('search.placeholder')
    expect(
      coz('search.placeholder'),
      'search.placeholder sözlükte çözülemedi — kapı metni hiç göremez.',
    ).toBeTruthy()
    const toplamAnahtar = dosyalar.reduce(
      (t2, d) => t2 + anahtarlariTopla(readFileSync(d, 'utf8')).filter((a) => coz(a)).length,
      0,
    )
    expect(toplamAnahtar, 'Hiçbir anahtar çözülemedi — tarayıcı kör.').toBeGreaterThan(50)
  })
})
