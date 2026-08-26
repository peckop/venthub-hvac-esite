import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-FORM-1 · MÜŞTERİ-YÜZÜ FORM GERÇEKTEN YAZAR, BAŞARI EKRANI KANITA BAĞLIDIR.
 *
 * Cetvel: `docs/standards/form-submission-standard.md` §8 bu bekçiyi ŞART KOŞUYOR.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN — cetvel yazıldı, bekçi HİÇ KURULMADI ve kusur yaşamaya devam etti
 *
 * Cetvel 2026-08-19'da yazıldı ve §8'de "bekçi iki koldan ölçer" dedi. 2026-08-26'da
 * ölçüldü: `src/__tests__/conformance/form-submission*.test.ts` **mevcut değildi**.
 * Yani kural vardı, kapı yoktu — ve tam o boşlukta iki form CANLI olarak sahte-başarı
 * gösteriyordu:
 *
 *   `LeadModal.tsx`   : validate → setSubmitted(true) → setTimeout(1200) → setIsSuccess(true)
 *                       yorumu aynen: "Simulate API Call for better UX instead of mailto"
 *   `ContactPage.tsx` : tek satır yorum: "Form submission logic using supabase would go here"
 *
 * Üç bağımsız kanıt, hiçbiri diğerinden türetilmedi:
 *   1. Dosyalarda tek bir yazma yolu yoktu (supabase/rpc/fetch/await/service: sıfır).
 *   2. Prod'da `public.contact_messages` **boştu** — 0 kayıt; tablo 19 Ağustos'ta kurulmuş.
 *   3. İki yüzey de canlıydı (LeadModal ana sayfa + her ürün sayfası).
 *
 * Kaybedilen yalnız talep değil, **KVKK rızasının kendisiydi**. Cetvel §3: rızayı toplayıp
 * saklamamak, rıza almamış olmakla aynı kapıya çıkar.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN AST, METİN TARAMASI DEĞİL
 *
 * §7'nin yasakladığı şeylerin çoğu SIRA ve YAPI sorusudur: "başarı durumu yazmadan ÖNCE
 * kuruluyor mu", "başarı bir zamanlayıcı geri çağrımının İÇİNDE mi", "hata dalı BOŞ mu".
 * Bunların hiçbiri düz metinde güvenilir biçimde okunmaz; metin taraması yorumla tatmin
 * olur. AST bu soruları yapısal olarak cevaplar.
 *
 * NİÇİN BAŞARI KURUCULARI ELLE YAZILI — ad sezgisi BURADA YANILIYOR, ölçüldü:
 * `LeadModal`'da `setSubmitted` bir YÜKLENİYOR bayrağıdır, başarı değil; `ContactPage`'te
 * ise `setFormSubmitted` BAŞARI'dır. Aynı kökten iki zıt anlam. Ad kalıbına güvenen bir
 * bekçi ya yanlış yeri ölçer ya sessizce yeşil kalır — o yüzden her yüzeyin başarı
 * kurucusu adıyla yazılır ve yeni yüzey eklenirken de yazılmak ZORUNDADIR.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/**
 * KAPSAM — cetvel §5'teki "hangi form hangi tabloya yazar" tablosunun birebir karşılığı.
 * Oraya yeni satır eklenirse buraya da eklenir; §5 zaten "hedefi yazılmamış form,
 * sahte-başarının açık davetidir" diyor.
 */
const YUZEYLER: ReadonlyArray<{
  readonly dosya: string
  readonly isleyici: string
  readonly basariKurucu: string
}> = [
  { dosya: 'src/components/LeadModal.tsx', isleyici: 'submit', basariKurucu: 'setIsSuccess' },
  { dosya: 'src/views/ContactPage.tsx', isleyici: 'handleSubmit', basariKurucu: 'setFormSubmitted' },
  { dosya: 'src/components/quotes/QuoteRequestModal.tsx', isleyici: 'handleSubmit', basariKurucu: 'setSubmitted' },
]

/** §7.2 — yazma yerine geçen yorum. İkisi de gerçek vakadan alındı. */
const YASAK_YORUM = /simulate\s+api|would\s+go\s+here/i

const ZAMANLAYICI = new Set(['setTimeout', 'setInterval'])

interface Yuzey {
  dosya: string
  kaynak: ts.SourceFile
  metin: string
  handler: ts.Node | null
  basariKurucu: string
}

function kaynakBul(dosya: string): string | null {
  for (const [yol, ham] of Object.entries(SOURCES)) {
    if (yol.replace(/^\//, '') === dosya) return ham
  }
  return null
}

/** Dosyadaki yerel fonksiyonlar: ad → gövde. */
function yerelFonksiyonlar(kaynak: ts.SourceFile): Map<string, ts.Node> {
  const harita = new Map<string, ts.Node>()
  const gez = (n: ts.Node): void => {
    if (ts.isFunctionDeclaration(n) && n.name) harita.set(n.name.getText(), n)
    if (
      ts.isVariableDeclaration(n) && n.initializer &&
      (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer))
    ) {
      harita.set(n.name.getText(), n.initializer)
    }
    ts.forEachChild(n, gez)
  }
  gez(kaynak)
  return harita
}

/**
 * Gönderim işleyicisi ADIYLA çözülür — yapısal tahmin BURADA DA yanıldı, ölçüldü:
 * ilk sürüm `<form onSubmit={X}>` niteliğinden çıkarıyordu ve `LeadModal` ile
 * `ContactPage`'te çalıştı, ama `QuoteRequestModal`'da **çözülemedi**: o yüzeyde `<form>`
 * yok, gönderim bir butonda `onClick={() => void handleSubmit()}` ile yapılıyor.
 * Tek bir yapısal kural üç yüzeyi birden yakalamıyor.
 *
 * Kapsam kanaryası bu boşluğu SESSİZ bırakmadı — kırmızı verdi ve tasarım düzeldi.
 * Yeni yüzey eklenirken işleyici adı da YUZEYLER'e yazılır; yazılmazsa kanarya kırmızıdır.
 */
function gonderimIsleyicisi(kaynak: ts.SourceFile, ad: string): ts.Node | null {
  return yerelFonksiyonlar(kaynak).get(ad) ?? null
}

/** Düğüm altında verilen adla yapılan `ad(true)` çağrılarının konumları. */
function basariCagrilari(kok: ts.Node, ad: string): ts.CallExpression[] {
  const bulunan: ts.CallExpression[] = []
  const gez = (n: ts.Node): void => {
    if (
      ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.getText() === ad &&
      n.arguments.length === 1 && n.arguments[0].kind === ts.SyntaxKind.TrueKeyword
    ) {
      bulunan.push(n)
    }
    ts.forEachChild(n, gez)
  }
  gez(kok)
  return bulunan
}

/** Düğüm altındaki `await` ifadelerinin konumları. */
function awaitler(kok: ts.Node): ts.AwaitExpression[] {
  const bulunan: ts.AwaitExpression[] = []
  const gez = (n: ts.Node): void => {
    if (ts.isAwaitExpression(n)) bulunan.push(n)
    ts.forEachChild(n, gez)
  }
  gez(kok)
  return bulunan
}

/** Zamanlayıcı geri çağrımının İÇİNDE verilen adla `ad(true)` var mı? */
function zamanlayiciIcindeBasari(kok: ts.Node, ad: string): boolean {
  let bulundu = false
  const gez = (n: ts.Node): void => {
    if (bulundu) return
    if (
      ts.isCallExpression(n) && ts.isIdentifier(n.expression) &&
      ZAMANLAYICI.has(n.expression.getText())
    ) {
      for (const arg of n.arguments) {
        if ((ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)) && basariCagrilari(arg, ad).length > 0) {
          bulundu = true
          return
        }
      }
    }
    ts.forEachChild(n, gez)
  }
  gez(kok)
  return bulundu
}

/** Gövdesi BOŞ OLMAYAN bir `catch` var mı? (§2: sessiz yutma yasak) */
function dolucatchVarMi(kok: ts.Node): boolean {
  let bulundu = false
  const gez = (n: ts.Node): void => {
    if (bulundu) return
    if (ts.isCatchClause(n) && n.block.statements.length > 0) {
      bulundu = true
      return
    }
    ts.forEachChild(n, gez)
  }
  gez(kok)
  return bulundu
}

function yuzeyleriTopla(): Yuzey[] {
  return YUZEYLER.map(({ dosya, isleyici, basariKurucu }) => {
    const metin = kaynakBul(dosya) ?? ''
    const kaynak = ts.createSourceFile(dosya, metin, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    return {
      dosya,
      kaynak,
      metin,
      handler: metin ? gonderimIsleyicisi(kaynak, isleyici) : null,
      basariKurucu,
    }
  })
}

const MESAJ_KAPSAM =
  'Cetvel §5 tablosundaki bir yüzey okunamadı ya da gönderim işleyicisi bulunamadı. ' +
  'Dosya taşındıysa YUZEYLER listesi güncellenir; bekçi sessizce yeşile dönmez.'

const MESAJ_YORUM =
  'Yazma yerine geçen yorum bulundu (§7.2). "Simulate API call" / "would go here" türü ' +
  'yorumlar gerçek vakadan alındı: iki form aylarca müşteriye "aldık" derken hiçbir yere yazmadı.'

const MESAJ_ZAMANLAYICI =
  'Başarı durumu bir zamanlayıcı geri çağrımının İÇİNDE kuruluyor (§7.1). Zamanlayıcı ' +
  'başarı kanıtı değildir — kalıcı kayıt döndüğünü göstermez, yalnız zaman geçtiğini gösterir.'

const MESAJ_YAZMA =
  'Gönderim işleyicisinde hiçbir `await` yok — yani yazma çağrısı yapılmıyor ya da ' +
  'sonucu beklenmiyor. Beklenmeyen yazmanın hatası da okunamaz (§7.4).'

const MESAJ_CATCH =
  'Gönderim işleyicisinde gövdesi dolu bir `catch` yok. Cetvel §2: yazma hata verirse ' +
  'kullanıcıya hata GÖSTERİLİR; sessiz yutma sahte-başarının ikinci biçimidir.'

const MESAJ_SIRA =
  'Başarı durumu, yazma beklenmeden ÖNCE kuruluyor (§7.3). Başarı ekranı ile yazma ' +
  'arasında hiçbir koşul olmamalı: yazma başarılıysa açılır, değilse açılmaz.'

describe('INV-FORM-1: müşteri-yüzü form gerçekten yazar', () => {
  const yuzeyler = yuzeyleriTopla()

  it('KAPSAM KANARYASI: cetvel §5 yüzeylerinin hepsi okundu ve işleyicisi bulundu', () => {
    // "0 ihlal" ancak tarama gerçekten koştuysa bilgi taşır.
    const eksik = yuzeyler
      .filter((y) => !y.metin || !y.handler)
      .map((y) => `${y.dosya}${y.metin ? ' (onSubmit işleyicisi çözülemedi)' : ' (dosya okunamadı)'}`)
    expect(eksik, MESAJ_KAPSAM).toEqual([])
    expect(yuzeyler.length).toBeGreaterThanOrEqual(3)
  })

  it('§7.2 — İŞLEYİCİNİN İÇİNDE yazma yerine geçen yorum yok', () => {
    // KAPSAM İŞLEYİCİ GÖVDESİ, DOSYANIN TAMAMI DEĞİL — ölçüldü, ilk sürüm KENDİ
    // düzeltmemi ihlal saydı: iki gerçek vakayı ("Simulate API Call…", "…would go here")
    // dosya başındaki açıklamada TARİHSEL KANIT olarak alıntılamıştım. Düz metin taraması
    // alıntıyı talimattan ayıramaz. Yapısal ayrım şu: yazma yerine geçen yorum, yazmanın
    // olması gereken yerde — yani İŞLEYİCİNİN İÇİNDE — durur. `getStart()` öndeki JSDoc'u
    // atladığı için niçin-yazısı kapsam dışında kalır, sahte yorum kalmaz.
    const ihlal = yuzeyler
      .filter((y) => y.handler && YASAK_YORUM.test(y.metin.slice(y.handler.getStart(), y.handler.getEnd())))
      .map((y) => y.dosya)
    expect(ihlal, MESAJ_YORUM).toEqual([])
  })

  it('§7.1 — başarı durumu zamanlayıcı içinde kurulmuyor', () => {
    const ihlal = yuzeyler
      .filter((y) => y.handler && zamanlayiciIcindeBasari(y.handler, y.basariKurucu))
      .map((y) => `${y.dosya} (${y.basariKurucu})`)
    expect(ihlal, MESAJ_ZAMANLAYICI).toEqual([])
  })

  it('§7.4 — gönderim işleyicisi yazmayı BEKLİYOR (await var)', () => {
    const ihlal = yuzeyler
      .filter((y) => y.handler && awaitler(y.handler).length === 0)
      .map((y) => y.dosya)
    expect(ihlal, MESAJ_YAZMA).toEqual([])
  })

  it('§2 — hata dalı var ve BOŞ değil', () => {
    const ihlal = yuzeyler
      .filter((y) => y.handler && !dolucatchVarMi(y.handler))
      .map((y) => y.dosya)
    expect(ihlal, MESAJ_CATCH).toEqual([])
  })

  it('§7.3 — başarı durumu yazma BEKLENDİKTEN SONRA kuruluyor', () => {
    const ihlal: string[] = []
    for (const y of yuzeyler) {
      if (!y.handler) continue
      const basari = basariCagrilari(y.handler, y.basariKurucu)
      if (basari.length === 0) {
        ihlal.push(`${y.dosya}: ${y.basariKurucu}(true) hiç bulunamadı — kurucu adı bayat olabilir`)
        continue
      }
      const ilkAwait = awaitler(y.handler)[0]
      if (!ilkAwait) continue // bir üstteki kol zaten kırmızı verir
      const erken = basari.filter((c) => c.getStart() < ilkAwait.getStart())
      if (erken.length > 0) ihlal.push(`${y.dosya}: ${y.basariKurucu}(true) await'ten ÖNCE`)
    }
    expect(ihlal, MESAJ_SIRA).toEqual([])
  })
})
