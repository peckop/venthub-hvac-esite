import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-URUNLER-STATIK-1 — ürünler listesi (`/tr/products`, `/en/products`) ÖNCEDEN
 * ÜRETİLEBİLİR kalır VE kendi kimliğini (başlık + kanonik) taşır.
 *
 * NİÇİN (REC-59 adım 2 ikinci yarı + REC-338). Bu rota `revalidate` beyanı bile
 * taşımıyordu ve İKİ sebeple dinamikti — her biri TEK BAŞINA yeterli:
 *   1. `await getTenantConfig()` → `utils/tenantServer.ts` → `await headers()`,
 *   2. gövdede `searchParams` bağı (`?page=`).
 * Kategori rotasında üç kollu sabotajla ölçülmüştü: yalnız biri kaldırılınca hâlâ 0 HTML;
 * ikisi birden kalkınca 46 HTML. Yani yarım onarım kazanç GETİRMEZ — bu kapı ikisini de bekler.
 *
 * REC-338 ayrı bir kusurdu, aynı dosyada yaşıyordu: `generateMetadata` HİÇ YOKTU. Canlı
 * ölçüm (2026-09-14): `/tr/products` ve `/en/products` HTML'inde `rel="canonical"` SIFIR,
 * `<title>` kök layout'un varsayılanı. Sitenin en büyük liste sayfası arama motoruna ana
 * sayfanın kopyası gibi görünüyordu. `?page=` ile birlikte onarılmasının sebebi: sorgu
 * parametreli adresler kanonik koruması OLMADAN duruyordu.
 *
 * ── ⚠BU KAPININ SINIRI, ADIYLA ──
 * Kapı KAYNAK KODU okur, `.next` çıktısını DEĞİL (`anasayfa-rotasi-statik.test.ts` ile aynı
 * gerekçe: artefakta bakan konformans testi temiz makinede ya yalandan kırmızı yanar ya
 * FAIL-OPEN olur). Yani "prerender EDİLDİ" demez; **"prerender'ı engelleyen desen geri
 * gelmedi"** der.
 *
 * ⚠SAYFA BOYUTU BU DOSYADA ÖLÇÜLEMEZ — ve susarak geçmiyorum. Sıkıştırılmış HTML boyutu
 * ancak build çıktısında ölçülür. Değişiklik günü ölçülen değer (2026-09-14, `gzip -9`):
 * `/tr/products` **111 KB** (ham 488 KB), `/en/products` 103 KB — 47 ailenin TAMAMI tek
 * sayfada. Kabul edilen üst sınır ölçülenin 1,5 katı, yuvarlanmış: **170 KB**. Bu sınırı
 * zorlayacak kol build/e2e katmanına aittir (`tests/smoke/**`, ALTYAPI şeridi); buraya
 * üçüncü bir kopya yazmak üçüncü bir yalan kaynağı olurdu. K7 kolu boyutun VEKİLİNİ
 * (aile sayısı ≤ PAGE_SIZE) zorlar.
 */

const KOK = path.join(process.cwd(), 'src')
const ROTA = path.join(KOK, 'app', '[lang]', 'products', 'page.tsx')

const kaynak = (): string => fs.readFileSync(ROTA, 'utf8')

const agac = (src: string) =>
  ts.createSourceFile('page.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

/** Dosyanın GERÇEK kodunda (yorumlar hariç) geçen tanımlayıcı adları. */
function tanimlayicilar(src: string): Set<string> {
  const bulunan = new Set<string>()
  const gez = (n: ts.Node): void => {
    if (ts.isIdentifier(n)) bulunan.add(n.text)
    ts.forEachChild(n, gez)
  }
  gez(agac(src))
  return bulunan
}

/** Dosyanın import ettiği modül yolları. */
function importYollari(src: string): string[] {
  const yollar: string[] = []
  const gez = (n: ts.Node): void => {
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
      yollar.push(n.moduleSpecifier.text)
    }
    ts.forEachChild(n, gez)
  }
  gez(agac(src))
  return yollar
}

/** Sayfa/metadata imzalarında `searchParams` adlı bir bağ var mı? */
function searchParamsBagi(src: string): boolean {
  let bulundu = false
  const gez = (n: ts.Node): void => {
    if (bulundu) return
    if (ts.isBindingElement(n) && ts.isIdentifier(n.name) && n.name.text === 'searchParams') {
      bulundu = true
    }
    if (ts.isPropertySignature(n) && n.name && ts.isIdentifier(n.name) && n.name.text === 'searchParams') {
      bulundu = true
    }
    ts.forEachChild(n, gez)
  }
  gez(agac(src))
  return bulundu
}

/** Dosyanın dışa aktardığı fonksiyon adları (AST — `export async function X`). */
function disaAktarilanFonksiyonlar(src: string): Set<string> {
  const bulunan = new Set<string>()
  const gez = (n: ts.Node): void => {
    if (
      ts.isFunctionDeclaration(n) &&
      n.name &&
      n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      bulunan.add(n.name.text)
    }
    ts.forEachChild(n, gez)
  }
  gez(agac(src))
  return bulunan
}

describe('INV-URUNLER-STATIK-1 — ürünler listesi önceden üretilebilir ve kendi kimliğini taşır', () => {
  it('K1 (ön-koşul) — rota dosyası duruyor ve boş değil', () => {
    expect(fs.existsSync(ROTA), `rota dosyası bulunamadı: ${ROTA}`).toBe(true)
    expect(
      kaynak().length,
      'rota dosyası boş — aşağıdaki kollar anlamsız olurdu (yokluk kanıtı değildir)',
    ).toBeGreaterThan(1000)
  })

  it('K2 (kural) — sayfa `searchParams` ALMIYOR', () => {
    expect(
      searchParamsBagi(kaynak()),
      '`searchParams` geri gelmiş. Bu TEK BAŞINA rotayı dinamikleştirir ve `revalidate` ' +
        'beyanı yine ölü bir vaade döner. Sayfalama gerekiyorsa sorgu parametresi değil ' +
        'AYRI ADRES SEGMENTİ açılır (Recep kararı 2026-09-04, "Adım B": 1. sayfa statik, ' +
        '`?page=N` ayrı dinamik yol, adres değişmez) — ve bu YAPISAL bir karardır.',
    ).toBe(false)
  })

  it('K3 (kural) — sayfa `headers()` okumuyor, kiracı DERLEME SABİTİ', () => {
    const adlar = tanimlayicilar(kaynak())
    expect(
      adlar.has('getTenantConfig') || adlar.has('headers') || adlar.has('cookies'),
      'Kiracı çözümü istek anına bağlı okumaya dönmüş. Build bunu "couldn\'t be rendered ' +
        'statically because it used `headers`" diye reddeder. Çok-kiracılı yapı geri ' +
        'açılacaksa (REC-88 PARK) doğru yol kiracı başına ayrı yayındır.',
    ).toBe(false)
    expect(
      adlar.has('DEFAULT_TENANT_ID'),
      'kiracı sabiti kaybolmuş — `unstable_cache` anahtarı ve `discoveryTag` bir kiracı ' +
        'değeri bekliyor (kural 12); boşalırsa webhook tazelemesi ISKALAR.',
    ).toBe(true)
  })

  it('K4 (kural) — başlık okuyan modül vitrinin grafiğine SOKULMUYOR', () => {
    expect(
      importYollari(kaynak()).some((y) => y.includes('next/headers') || y.includes('tenantServer')),
      '`next/headers` ya da `tenantServer` yeniden import edilmiş. Kiracı sabitleri ' +
        '`utils/tenantConstants` içindedir ve orası başlık OKUMAZ — o modüle sonradan ' +
        'eklenecek modül-düzeyi bir okuma rotayı SESSİZCE dinamiğe düşürürdü.',
    ).toBe(false)
  })

  it('K5 (vaat bütünlüğü) — rota sınıfı İLAN EDİLİYOR ve `revalidate` duruyor', () => {
    const s = kaynak()
    // `force-static` yalnız bir niyet beyanı değil: ÖLÇÜLDÜ (2026-09-14, aynı build) —
    // ilan eden rotalarda (`about`, kategori, bu rota) üretilen HTML'de CSR bailout işareti
    // 0; ilan etmeyende (o günkü ana sayfa, marka sayfaları) 2. `useSearchParams()` bu
    // sınıfta boş döner ve çatıdaki bilinçli adalar sayfayı istemciye düşürmez.
    expect(
      /export const dynamic\s*=\s*'force-static'/.test(s),
      '`force-static` ilanı kalkmış — çatıdaki `<Analytics/>` ve `NavigationTracker` ' +
        'yeniden CSR bailout işareti üretir ve `admin-smoke` SSR kapısı kırmızı yanar.',
    ).toBe(true)
    expect(
      /export const revalidate\s*=\s*\d+/.test(s),
      '`revalidate` beyanı kaybolmuş — webhook sinyali kaçarsa emniyet kemeri kalmaz ' +
        've liste SONSUZA DEK eski kalır.',
    ).toBe(true)
    expect(
      disaAktarilanFonksiyonlar(s).has('generateStaticParams'),
      '`generateStaticParams` düşmüş — iki dil için sayfa build\'de üretilmez.',
    ).toBe(true)
  })

  it('K6 (kural 12) — önbellek anahtarları ve etiketleri KİRACI-KAPSAMLI kalır', () => {
    // Kiracı artık sabit diye `tenantId`yi anahtardan/etiketten atmak cazip görünür ama
    // YANLIŞTIR: tazeleme webhook'u etiketi DB satırındaki `tenant_id` ile kurar. İki taraf
    // ayrışırsa webhook bir etiketi tazeler, sayfa başka etiketle önbelleklenmiş olur —
    // tazeleme ISKALAR ve hata SESSİZDİR.
    const s = kaynak()
    expect(
      /\[\s*['"]products-discovery-families['"]\s*,\s*lang\s*,\s*tenantId\s*,/.test(s),
      'aile önbellek anahtarı `lang` ve `tenantId` taşımıyor (kural 12).',
    ).toBe(true)
    expect(
      /\[\s*['"]products-discovery-categories['"]\s*,\s*lang\s*,\s*tenantId\s*\]/.test(s),
      'kategori önbellek anahtarı `lang` ve `tenantId` taşımıyor (kural 12).',
    ).toBe(true)
    expect(
      (s.match(/tags:\s*\[[^\]]*discoveryTag\(tenantId\)/g) ?? []).length,
      'kiracı-kapsamlı tazeleme etiketi (`discoveryTag(tenantId)`) iki önbellekte de ' +
        'bulunmalı — webhook bu etiketi kullanır.',
    ).toBe(2)
  })

  it('K7 (sessiz eksilme) — sayfa boyu, ÖLÇÜLEN aile sayısını KAPSAR', () => {
    // ⭐SESSİZ KUSUR KOLU: sayfalama kalktığı için, aile sayısı PAGE_SIZE'ı aştığı gün
    // fazlası EKRANDA HİÇ GÖRÜNMEZ ve hiçbir hata çıkmaz. Bu kol o günü KIRMIZI yapar;
    // o gün ayrı segment sayfalaması işi açılır (YAPISAL karar → Recep'e gider).
    //
    // ⚠SINIR: aşağıdaki sayı DONDURULMUŞ bir ölçümdür (canlı DB SELECT, 2026-09-14:
    // `product_families` = 47 satır; 47 seri/landing, 0 model). Konformans testi ağa
    // çıkamaz, yani bu kol DB büyümesini KENDİLİĞİNDEN görmez — kataloğa toplu yükleme
    // yapan iş bu sayıyı güncellemekle yükümlüdür. Ölçmediğini bilmek, ölçtüğünü
    // sanmaktan iyidir. (Aynı sınır kategori kapısının K5 kolunda da yazılı.)
    const OLCULEN_AILE_SAYISI = 47
    const m = kaynak().match(/const PAGE_SIZE\s*=\s*(\d+)/)
    expect(m, '`PAGE_SIZE` bulunamadı — kolun evreni boş').not.toBeNull()
    const pageSize = Number(m![1])
    expect(
      pageSize,
      `PAGE_SIZE (${pageSize}) ölçülen aile sayısını (${OLCULEN_AILE_SAYISI}) kapsamıyor. ` +
        'Sayfalama kalktığı için fazlası SESSİZCE görünmez olur.',
    ).toBeGreaterThanOrEqual(OLCULEN_AILE_SAYISI)
  })

  it('K8 (REC-338) — sayfa KENDİ başlığını ve KANONİK adresini üretir', () => {
    const s = kaynak()
    expect(
      disaAktarilanFonksiyonlar(s).has('generateMetadata'),
      '`generateMetadata` kaybolmuş — sayfa yine kök layout\'un varsayılan başlığını basar ' +
        've `rel="canonical"` üretmez (2026-09-14 canlı ölçümünde tam bu hâldeydi).',
    ).toBe(true)
    expect(
      /canonical:\s*canonicalUrl/.test(s),
      'kanonik adres üretimi düşmüş — sorgu parametreli ya da çoğaltılmış adresler ' +
        'korumasız kalır.',
    ).toBe(true)
    expect(
      /'x-default':\s*trUrl/.test(s),
      'hreflang `x-default` düşmüş — dili belirsiz ziyaretçi için hedef bildirilmez ' +
        '(REC-127\'de ana sayfada ölçülen kusurun aynısı).',
    ).toBe(true)
    expect(
      /dict\.products\.discovery\.seoTitle/.test(s) && /dict\.products\.discovery\.seoDesc/.test(s),
      'başlık/açıklama sözlükten gelmiyor — kural 7 (kullanıcıya görünen metin sözlükten).',
    ).toBe(true)
  })

  it('K9 (kural 14) — veri çekimi HATA YOLUYLA sarılı (ağsız build\'i düşürmez)', () => {
    // ⭐BU KOLU KAPI ÖĞRETTİ, tahmin etmedim. İlk sürümde `getCachedFamilies` çıplaktı ve
    // CI `Build (blocking)` KIRMIZI verdi (koşum 34842305934):
    //   `getaddrinfo ENOTFOUND dummy.supabase.co` → "Export encountered an error on
    //   /[lang]/products/page: /tr/products, exiting the build."
    //
    // NİÇİN SINIF DEĞİŞTİ: rota dinamikken bu çağrı İSTEK anında koşuyordu — düşerse o tek
    // ziyaretçi hata görürdü. Statiğe geçince aynı çağrı BUILD'İN İÇİNE taşındı ve orada
    // düşmek TÜM BUILD'i düşürür. CI'ın build adımı SAHTE Supabase adresiyle (ağsız) koşar.
    //
    // Kategori rotası bu tuzağa düşmez: `generateStaticParams`'ını DB'den alır, ağ yoksa
    // liste boşalır ve hiç sayfa üretilmez. Bizim dil listemiz SABİT (tr/en) — her koşulda
    // üretilmek zorundayız, yani hata yolu ZORUNLU (CLAUDE.md kural 14).
    //
    // Kanıt: bu PR'ın CI'ı, ve yerelde `NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co`
    // ile `pnpm run build:ci` → çıkış 0, rota tabloda hâlâ `● /[lang]/products`.
    const s = kaynak()
    const kaynakDosya = agac(s)
    let sarili = false
    const gez = (n: ts.Node): void => {
      if (sarili) return
      if (
        ts.isCallExpression(n) &&
        ts.isIdentifier(n.expression) &&
        n.expression.text === 'getCachedFamilies'
      ) {
        let p: ts.Node | undefined = n.parent
        while (p) {
          if (ts.isTryStatement(p)) { sarili = true; return }
          p = p.parent
        }
      }
      ts.forEachChild(n, gez)
    }
    gez(kaynakDosya)
    expect(
      sarili,
      '`getCachedFamilies` çağrısı bir `try` bloğunun İÇİNDE değil. Ağsız build ortamında ' +
        '(CI: `dummy.supabase.co`) fetch düşer ve prerender TÜM BUILD\'i devirir. Hata ' +
        'yolu kodla birlikte yazılır (kural 14): düşerse liste boş görünür, sayfa yine gelir, ' +
        've prod\'da ISR bir sonraki tazelemede doldurur.',
    ).toBe(true)
  })

  it('K10 (ayırt edicilik) — çözücüler kusurlu deseni GERÇEKTEN yakalıyor', () => {
    // ⭐BU KOL KAPININ KENDİSİNİ SINAR. Yukarısı yeşilse sebebi "desen yok" olabileceği
    // gibi "çözücü hiçbir şeyi eşleştirmiyor" da olabilir — ikisi dışarıdan AYNI görünür.
    const kusurlu = `
      import { getTenantConfig } from '../../../utils/tenantServer'
      export async function generateMetadata() { return {} }
      export default async function Page({ params, searchParams }: {
        searchParams: Promise<{ page?: string }>
      }) {
        const tenantId = (await getTenantConfig()).id
      }
    `
    expect(tanimlayicilar(kusurlu).has('getTenantConfig'), 'tanımlayıcı çözücüsü ölü').toBe(true)
    expect(importYollari(kusurlu).some((y) => y.includes('tenantServer')), 'import çözücüsü ölü').toBe(true)
    expect(searchParamsBagi(kusurlu), 'searchParams çözücüsü ölü').toBe(true)
    expect(disaAktarilanFonksiyonlar(kusurlu).has('generateMetadata'), 'export çözücüsü ölü').toBe(true)

    // ⭐VE TERSİ — AST'nin YORUMU görmediği burada KANITLANIYOR. Denetlenen rotanın içinde
    // tam olarak böyle gerekçe yorumları var; kapı onları ihlal sayarsa kendi kendini yer.
    const yalnizYorum = `
      // eskiden (await getTenantConfig()).id idi; headers() okunuyordu, searchParams da vardı
      const tenantId = DEFAULT_TENANT_ID
    `
    expect(tanimlayicilar(yalnizYorum).has('getTenantConfig'), 'AST yorumu kod sandı').toBe(false)
    expect(tanimlayicilar(yalnizYorum).has('headers'), 'AST yorumu kod sandı').toBe(false)
    expect(searchParamsBagi(yalnizYorum), 'AST yorumu bağ sandı').toBe(false)
  })
})
