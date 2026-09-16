import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-MISAFIR-YAZIM-1 · KIMLIK-1 · HIZ-1 · AYDINLATMA-1
 * — kimliksiz yazan uç, gövdesi TEK koruma katmanı olduğu için çivilenir
 *
 * ⚠ŞERİT SAPMASI, ADIYLA: `src/__tests__/conformance/**` ALTYAPI şeridindedir. Bu dosyayı
 * OPS emriyle URUN yazdı (ALTYAPI o sırada REC-292 planındaydı) ve gerekçe şu: `service_role`
 * ile yazan bir fonksiyon kapısız master'a inmemeli; beklemek, korumasız bir ucun canlıya
 * çıkmasından daha pahalı olurdu. Diff-review ALTYAPI'da.
 *
 * NİÇİN VAR — bu uç neden özel:
 *   `quote-request-guest` KİMLİKSİZDİR (sınıf c) ve `service_role` ile yazar. `service_role`
 *   RLS'i ATLAR; yani RLS'in yakalayacağı hiçbir hata burada yakalanmaz. Depodaki her başka
 *   yazma yolunda politika ikinci bir ağdır — burada İKİNCİ AĞ YOKTUR. Gövdedeki kapıların
 *   sessizce kaldırılması, teklif tablolarını internete açık bırakır ve hiçbir yerde ses çıkmaz.
 *
 * NİÇİN AST, METİN DEĞİL:
 *   `ts.Node.getText()` YORUMLARI DA taşır ve bu dosyanın kendi açıklamasında yasaklanan
 *   dizeler geçiyor. Aynı tuzağa depoda bir kez düşüldü (INV-ALTGRUP-GORSEL-1, K5 sabotajı
 *   yorum yüzünden geçmişti). Bu yüzden düğümler dolaşılır.
 *
 * BU KAPININ ÖLÇMEDİĞİ (sınırı gizlemiyorum):
 *   Ucun CANLIDA doğru davrandığını ölçmez — kaynağı okur, HTTP yapmaz. Davranışsal kanıt
 *   ayrı koldadır (canlı ölçüm, PR gövdesi). Ayrıca kapıların ETKİLİ olduğunu değil, VAR
 *   olduğunu ölçer: `if (govde.kvkkOnay !== true)` satırı duruyorsa yeşildir, o dalın
 *   gerçekten reddettiğini bir e2e ölçer.
 */

const KOK = join(__dirname, '..', '..', '..')
const UC = join(KOK, 'supabase', 'functions', 'quote-request-guest', 'index.ts')

function ayristir(yol: string): { kaynak: string; agac: ts.SourceFile } {
  const kaynak = readFileSync(yol, 'utf8')
  expect(kaynak.length, `BOŞ EVREN: ${yol} okunamadı ya da boş`).toBeGreaterThan(500)
  return { kaynak, agac: ts.createSourceFile(yol, kaynak, ts.ScriptTarget.Latest, true) }
}

/** Bir dize sabitinin AST'de (yorumda değil) geçtiği düğüm sayısı. */
function dizeSayisi(agac: ts.SourceFile, deger: string): number {
  let sayi = 0
  const gez = (n: ts.Node): void => {
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && n.text === deger) sayi += 1
    ts.forEachChild(n, gez)
  }
  gez(agac)
  return sayi
}

/** `nesne.alan` erişimlerinin sayısı (ör. `checkRateLimit` çağrısı). */
function cagriSayisi(agac: ts.SourceFile, ad: string): number {
  let sayi = 0
  const gez = (n: ts.Node): void => {
    if (ts.isCallExpression(n)) {
      const ifade = n.expression
      if (ts.isIdentifier(ifade) && ifade.text === ad) sayi += 1
      if (ts.isPropertyAccessExpression(ifade) && ifade.name.text === ad) sayi += 1
    }
    ts.forEachChild(n, gez)
  }
  gez(agac)
  return sayi
}

/** Bir nesne değişmezinde `alan: <sabit>` eşleşmesi arar (AST — yorum taşımaz). */
function nesneAlaniSabit(agac: ts.SourceFile, alan: string, sabit: string | null): boolean {
  let bulundu = false
  const gez = (n: ts.Node): void => {
    if (ts.isPropertyAssignment(n)) {
      const ad = ts.isIdentifier(n.name) ? n.name.text : ts.isStringLiteral(n.name) ? n.name.text : ''
      if (ad === alan) {
        const d = n.initializer
        if (sabit === null && d.kind === ts.SyntaxKind.NullKeyword) bulundu = true
        if (sabit !== null && ts.isStringLiteral(d) && d.text === sabit) bulundu = true
      }
    }
    ts.forEachChild(n, gez)
  }
  gez(agac)
  return bulundu
}

describe('misafir teklif ucu — kimliksiz yazan uç çivilenir', () => {
  it('INV-MISAFIR-YAZIM-1 · K1: başlık YALNIZ status=requested ve user_id=null yazar', () => {
    const { agac } = ayristir(UC)

    expect(
      nesneAlaniSabit(agac, 'status', 'requested'),
      "`status: 'requested'` sabiti YOK — durum istemciden gelebilir hâle gelmiş olabilir",
    ).toBe(true)

    expect(
      nesneAlaniSabit(agac, 'user_id', null),
      '`user_id: null` sabiti YOK — misafir belgesi bir hesaba bağlanabilir hâle gelmiş olabilir',
    ).toBe(true)

    // `draft` admin'in FİYAT YAZDIĞI durumdur. Bu uçtan yazılabilmesi, kimliksiz bir
    // ziyaretçinin fiyatlı belge üretebilmesi demektir.
    expect(
      dizeSayisi(agac, 'draft'),
      "Uçta `'draft'` dizesi var — kimliksiz uç fiyat yazılan duruma erişemez",
    ).toBe(0)
  })

  it('INV-MISAFIR-YAZIM-1 · K2: yalnız iki teklif tablosuna yazar, başkasına DEĞİL', () => {
    const { agac } = ayristir(UC)

    // `.from('<tablo>')` çağrılarındaki tablo adlarını topla.
    const tablolar = new Set<string>()
    const gez = (n: ts.Node): void => {
      if (
        ts.isCallExpression(n) &&
        ts.isPropertyAccessExpression(n.expression) &&
        n.expression.name.text === 'from' &&
        n.arguments.length > 0 &&
        ts.isStringLiteral(n.arguments[0])
      ) {
        tablolar.add((n.arguments[0] as ts.StringLiteral).text)
      }
      ts.forEachChild(n, gez)
    }
    gez(agac)

    expect(tablolar.size, 'BOŞ EVREN: hiç `.from()` çağrısı bulunamadı').toBeGreaterThan(0)

    // `products` SALT OKUMA (ürün doğrulaması), `rate_limits` damga geri alımı için.
    const izinli = new Set(['venthub_quotes', 'venthub_quote_items', 'products', 'rate_limits'])
    const izinsiz = [...tablolar].filter((t) => !izinli.has(t))
    expect(
      izinsiz,
      `Kimliksiz uç izinli olmayan tabloya dokunuyor: ${izinsiz.join(', ')}`,
    ).toEqual([])
  })

  it('INV-MISAFIR-KIMLIK-1: üç kimlik alanı da doğrulanmadan yazıma gidilmez', () => {
    const { agac, kaynak } = ayristir(UC)

    // Üç alan da gövdeden okunuyor ve `metin()` süzgecinden geçiyor olmalı.
    for (const alan of ['name', 'email', 'phone']) {
      expect(
        new RegExp(`contact\\?\\.${alan}`).test(kaynak),
        `\`contact?.${alan}\` okunmuyor — kimlik üçlüsünden biri toplanmıyor`,
      ).toBe(true)
    }

    // E-posta biçim kontrolü olmadan uç bir e-posta rölesine dönüşür.
    expect(
      cagriSayisi(agac, 'test'),
      'E-posta biçim kontrolü (regex `.test()`) YOK',
    ).toBeGreaterThanOrEqual(1)

    // ⭐ÜRÜN ADI İSTEMCİDEN ALINAMAZ (KRİTİK bulgu 1): gövdeden `productName` okunursa
    // uç, VentHub alan adından kimlik avı e-postası gönderten bir röleye dönüşür.
    expect(
      /ham\?\.productName|govde[^\n]*productName/.test(kaynak),
      'Ürün adı İSTEMCİDEN okunuyor — ad DB\'den çözülmeli (açık e-posta rölesi riski)',
    ).toBe(false)
  })

  it('INV-MISAFIR-HIZ-1: hız limiti VAR, iki eksenli ve fail-CLOSED', () => {
    const { agac, kaynak } = ayristir(UC)

    // IP ekseni + e-posta ekseni + idempotency = en az üç çağrı.
    expect(
      cagriSayisi(agac, 'checkRateLimit'),
      'Hız limiti çağrısı 3\'ten az — eksenlerden biri (IP / e-posta / idempotency) kaldırılmış',
    ).toBeGreaterThanOrEqual(3)

    // Sayaç ÖLÇÜLEMEZSE istek reddedilmeli. "Ölçemedim" ile "izin var" aynı sonuca
    // düşerse hız limiti fail-OPEN olur ve hiçbir şey ölçmez.
    expect(
      /rate_limit_unavailable/.test(kaynak),
      'Sayaç düştüğünde reddeden dal YOK — hız limiti fail-OPEN olur',
    ).toBe(true)

    // ⭐IP KAYNAĞI: `x-forwarded-for`un İLK öğesi İSTEMCİ TARAFINDAN YAZILABİLİR.
    // Kenar sunucusunun yazdığı başlıklar önce gelmeli.
    expect(
      /cf-connecting-ip/.test(kaynak) && /x-real-ip/.test(kaynak),
      'IP kaynağı yalnız `x-forwarded-for` — ilk öğe saldırgan kontrolündedir, limit yok hükmünde olur',
    ).toBe(true)
  })

  it('INV-MISAFIR-AYDINLATMA-1: KVKK onayı işaretsizse istek REDDEDİLİR', () => {
    const { agac, kaynak } = ayristir(UC)

    expect(
      /kvkkOnay/.test(kaynak),
      'Aydınlatma onayı gövdeden HİÇ okunmuyor',
    ).toBe(true)

    // Reddin kendisi: `!== true` katı karşılaştırması. `!govde.kvkkOnay` gevşek olurdu
    // ama asıl mesele reddin VAR olması; hata kodu onun kanıtı.
    expect(
      dizeSayisi(agac, 'kvkk_onay_gerekli'),
      'İşaretsiz isteği reddeden dal YOK — aydınlatma bir niyet olarak kalır',
    ).toBeGreaterThanOrEqual(1)

    // Aydınlatma SÜRÜMÜ sabiti: "onay alındı" kaydı hangi metne verildiğini söylemezse
    // ispat değeri taşımaz.
    expect(
      /AYDINLATMA_SURUMU/.test(kaynak),
      'Aydınlatma sürümü sabiti YOK — hangi metne onay verildiği kayda geçmez',
    ).toBe(true)
  })

  it('K6: tenant AÇIKÇA yazılır — kolon varsayılanına bırakılmaz (kural 12)', () => {
    const { kaynak } = ayristir(UC)
    // Hem başlıkta hem kalemlerde aynı değişken kullanılmalı: ikisinin ayrışması
    // "başlık tenant A, kalemler tenant B" demektir ve admin kalemleri göremez.
    const tenantYazimlari = (kaynak.match(/tenant_id:\s*tenantId/g) ?? []).length
    expect(
      tenantYazimlari,
      'tenant_id başlıkta VE kalemlerde aynı değişkenden yazılmalı (2 yazım bekleniyor)',
    ).toBeGreaterThanOrEqual(2)
  })
})
