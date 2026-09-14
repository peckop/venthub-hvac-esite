import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-ANASAYFA-STATIK-1 — ana sayfa (`/tr`, `/en`) ÖNCEDEN ÜRETİLEBİLİR kalır.
 *
 * NİÇİN (REC-59 adım 2). Rota `export const revalidate = 3600` beyan ediyordu ve bu beyan
 * ÖLÜYDÜ: canlı ölçüm 2026-09-14, `curl -I https://venthub.com.tr/tr` →
 * `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` + `X-Vercel-Cache: MISS`.
 * Yani ana sayfa HER ZİYARETÇİ İÇİN sıfırdan üretiliyordu. Tek sebep vardı:
 * `await getTenantConfig()` → `utils/tenantServer.ts` → `await headers()`.
 *
 * Düzeltme sonrası aynı gün `pnpm build` çıktısı (kanıt, iddia değil):
 *   ● /[lang]   …   Revalidate 1h   Expire 1y
 *   ├ /tr  ●
 *   └ /en  ●
 * ve "couldn't be rendered statically because it used `headers`" satırlarının tamamı
 * `/admin/*` rotalarına aitti — orası ZATEN dinamik olmalıdır.
 *
 * Desen yeni değil: kategori rotası aynı onarımı PR #1136'da aldı ve bekçisi
 * `kategori-rotasi-statik.test.ts` (INV-KATEGORI-STATIK-1). Bu dosya onun ana sayfa ikizidir;
 * ortak ders: **beyan (`revalidate`) tek başına hiçbir şey garanti etmez, onu geçersiz kılan
 * deseni yasaklayan bir kapı gerekir.**
 *
 * ── ⚠BU KAPININ SINIRI, ADIYLA ──
 * Kapı KAYNAK KODU okur, `.next` çıktısını DEĞİL — konformans testi derleme artefaktına
 * bakarsa `.next` yokken ya yalandan kırmızı yanar ya atlanıp FAIL-OPEN olur. Yani bu kapı
 * "prerender EDİLDİ" demez; **"prerender'ı engelleyen desen geri gelmedi"** der. Üretilen
 * sayfayı saymak ayrı bir ölçüm işidir (build çıktısı + canlı `X-Vercel-Cache`) ve bu
 * dosyanın işi değildir — susarak geçmiyorum.
 */

const KOK = path.join(process.cwd(), 'src')
const ROTA = path.join(KOK, 'app', '[lang]', 'page.tsx')

const kaynak = (): string => fs.readFileSync(ROTA, 'utf8')

/**
 * ⭐AST, ham metin DEĞİL. Bu depoda üçüncü kez öğrenilen ders (`kategori-adi-tek-kaynak`,
 * `kategori-rotasi-statik`): metin taraması GEREKÇE YORUMUYLA tatmin olur. Bu dosyanın
 * denetlediği rotanın içinde tam olarak "eskiden `getTenantConfig()` idi" diye yazan bir
 * yorum var; metin tabanlı bir kapı kendi gerekçesini ihlal sayardı. AST yorum düğümü üretmez.
 */
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

describe('INV-ANASAYFA-STATIK-1 — ana sayfa önceden üretilebilir kalır', () => {
  it('K1 (ön-koşul) — rota dosyası duruyor ve boş değil', () => {
    expect(fs.existsSync(ROTA), `rota dosyası bulunamadı: ${ROTA}`).toBe(true)
    expect(
      kaynak().length,
      'ana sayfa dosyası boş — aşağıdaki kollar anlamsız olurdu (yokluk kanıtı değildir)',
    ).toBeGreaterThan(1000)
  })

  it('K2 (kural) — sayfa `headers()` okumuyor, kiracı DERLEME SABİTİ', () => {
    const s = kaynak()
    const adlar = tanimlayicilar(s)
    expect(
      adlar.has('getTenantConfig') || adlar.has('headers') || adlar.has('cookies'),
      'Kiracı çözümü istek anına bağlı okumaya dönmüş. Build bunu "couldn\'t be rendered ' +
        'statically because it used `headers`" diye reddeder; `/tr` ve `/en` yine her ' +
        'ziyaretçi için üretilir ve `revalidate` beyanı ölü bir vaade döner. Çok-kiracılı ' +
        'yapı geri açılacaksa (REC-88 PARK) doğru yol kiracı başına ayrı yayındır, RSC ' +
        'render yolunda başlık okumak değil.',
    ).toBe(false)
    expect(
      adlar.has('DEFAULT_TENANT_ID'),
      'kiracı sabiti kaybolmuş — `unstable_cache` anahtarı ve tazeleme etiketi bir kiracı ' +
        'değeri bekliyor (CLAUDE.md kural 12); boşalırsa webhook tazelemesi ISKALAR.',
    ).toBe(true)
  })

  it('K3 (kural) — başlık okuyan modül vitrinin grafiğine SOKULMUYOR', () => {
    // ⭐AYRI KOL, K2'nin kopyası DEĞİL. K2 ÇAĞRIYI yasaklar; bu kol İTHALİ yasaklar.
    // Fark önemli: import tek başına bugün dinamikleştirmez (2026-09-14 build'i bunu
    // gösterdi — `/[lang]` sabitleri `tenantServer`'dan alırken bile prerender edildi).
    // Ama `tenantServer.ts` modül düzeyinde `next/headers` import eder; o dosyaya sonradan
    // eklenecek modül-düzeyi bir okuma ana sayfayı SESSİZCE düşürürdü ve hiçbir kapı
    // görmezdi. Sabitler bu yüzden `tenantConstants.ts`'e taşındı (başlık okumayan dosya).
    expect(
      importYollari(kaynak()).some((y) => y.includes('next/headers') || y.includes('tenantServer')),
      '`next/headers` ya da `tenantServer` ana sayfaya yeniden import edilmiş. Kiracı ' +
        'sabitleri `utils/tenantConstants` içindedir ve orası başlık OKUMAZ.',
    ).toBe(false)
  })

  it('K4 (kural) — sayfa `searchParams` ALMIYOR', () => {
    // Next 15: `searchParams` alan sayfa build'de prerender EDİLEMEZ — `headers()` ile
    // AYNI sonucu verir ve tek başına yeterlidir (kategori rotasında sabotajla ölçüldü:
    // yalnız biri kaldırılınca hâlâ 0 HTML, ikisi kalkınca 46 HTML).
    expect(
      searchParamsBagi(kaynak()),
      '`searchParams` eklenmiş — ana sayfa yine istek anında üretilir. Filtre/sayfalama ' +
        'gerekiyorsa sorgu parametresi değil AYRI ADRES SEGMENTİ açılır (Recep kararı ' +
        '2026-09-04, "Adım B": 1. sayfa statik, `?page=N` ayrı dinamik yol, adres değişmez).',
    ).toBe(false)
  })

  it('K5 (sınıf ilanı) — rota ait olduğu sınıfı AÇIKÇA ilan eder', () => {
    // ⭐BU KOLU KAPI ÖĞRETTİ. Ana sayfa statiğe geçtiği gün `admin-smoke` kırmızı verdi:
    // HTML'de 2 adet `BAILOUT_TO_CLIENT_SIDE_RENDERING`. İşaretler çatıdaki iki BİLİNÇLİ
    // adadan geliyor (kök layout `<Analytics/>`, `ClientLayout` içindeki `NavigationTracker`);
    // ikisi de `useSearchParams()` çağırıyor ve ikisi de ZATEN Suspense sınırlı. Suspense
    // işareti KALDIRMAZ, KAPSAR — yani "daha çok Suspense" çözüm değildi.
    //
    // ÖLÇÜM (2026-09-14, tek build, 245 HTML): `about` 0 · kategori 0 · ana sayfa 2 ·
    // marka 2. Ayırt edici değişken bileşenler değil SINIF İLANIYDI; aynı dosyada A/B
    // denendi ve ilan eklenince 2 → 0.
    //
    // İlan, ada bildirimini (`ANASAYFA_BILINCLI_ADALAR`, ALTYAPI) GEÇERSİZ KILMAZ: bildirim
    // üst sınır olarak bekçi kalır, bu ilan adaların işaret bırakmamasını sağlar.
    expect(
      /export const dynamic\s*=\s*'force-static'/.test(kaynak()),
      '`force-static` ilanı kalkmış — çatıdaki `<Analytics/>` ve `NavigationTracker` yeniden ' +
        'CSR bailout işareti üretir ve `admin-smoke` SSR kapısı kırmızı yanar. Kırmızıyı ' +
        'kapının tavanını büyüterek kapatmayın; rotayı ait olduğu sınıfa koyun.',
    ).toBe(true)
  })

  it('K6 (kural 14) — veri çekimi HATA YOLUYLA sarılı (ağsız build\'i düşürmez)', () => {
    // ⭐ÜRÜNLER ROTASINDA CANIMIZI YAKAN DERSİN İKİZİ — orada eksikti ve CI'ın
    // `Build (blocking)` adımını devirdi (`getaddrinfo ENOTFOUND dummy.supabase.co` →
    // "exiting the build"). Ana sayfada bu koruma ZATEN vardı ve tam bu yüzden aynı CI'da
    // yeşil geçmişti; kol onu KİLİTLER.
    //
    // NİÇİN SINIF ÖNEMLİ: rota dinamikken veri çekimi İSTEK anında koşar — düşerse tek
    // ziyaretçi etkilenir. Statikken aynı çağrı BUILD'İN İÇİNDE koşar ve orada düşmek TÜM
    // BUILD'i devirir. CI'ın build adımı SAHTE Supabase adresiyle (ağsız) koşar
    // (`ci.yml`: `NEXT_PUBLIC_SUPABASE_URL: https://dummy.supabase.co`), yani bu rotanın
    // ağsız ortamda da üretilebilmesi ZORUNLUDUR (CLAUDE.md kural 14).
    const s = kaynak()
    let sarili = false
    const gez = (n: ts.Node): void => {
      if (sarili) return
      if (
        ts.isCallExpression(n) &&
        ts.isIdentifier(n.expression) &&
        n.expression.text === 'getCachedHomeData'
      ) {
        let p: ts.Node | undefined = n.parent
        while (p) {
          if (ts.isTryStatement(p)) { sarili = true; return }
          p = p.parent
        }
      }
      ts.forEachChild(n, gez)
    }
    gez(agac(s))
    expect(
      sarili,
      '`getCachedHomeData` çağrısı bir `try` bloğunun İÇİNDE değil. Ağsız build ortamında ' +
        'fetch düşer ve prerender TÜM BUILD\'i devirir. Hata yolu kodla birlikte yazılır: ' +
        'düşerse sayfa yine gelir (boş veriyle), prod\'da ISR sonraki tazelemede doldurur.',
    ).toBe(true)
  })

  it('K7 (vaat bütünlüğü) — `revalidate` beyanı duruyor', () => {
    // Rota statikken `revalidate` ISR YEDEĞİDİR ve anlamlıdır; birincil tazeleme yolu
    // webhook'tur (`rendering-cache-standard.md` §3). Beyan kalkarsa webhook sinyali
    // kaçtığı gün sayfayı düzeltecek ikinci bir yol KALMAZ.
    expect(
      /export const revalidate\s*=\s*\d+/.test(kaynak()),
      '`revalidate` beyanı kaybolmuş — webhook sinyali kaçarsa emniyet kemeri kalmaz ' +
        've sayfa SONSUZA DEK eski kalır (2026-08-15: 1044 fiyat satırı yazıldı, vitrin ' +
        'değişmedi, hiçbir kapı görmedi).',
    ).toBe(true)
  })

  it('K8 (kural 12) — önbellek anahtarı ve etiketi KİRACI-KAPSAMLI kalır', () => {
    // ⭐SESSİZ KUSUR KOLU. Kiracı artık sabit diye `tenantId`yi anahtardan/etiketten
    // atmak cazip görünür ama YANLIŞTIR: tazeleme webhook'u etiketi DB SATIRINDAKİ
    // `tenant_id` ile kurar (`homeDataTag(tenantId)`). İki taraf ayrışırsa webhook bir
    // etiketi tazeler, sayfa başka etiketle önbelleklenmiş olur — tazeleme ISKALAR ve
    // hata SESSİZDİR. CLAUDE.md kural 12 bunu zaten zorunlu kılıyor.
    const s = kaynak()
    expect(
      /unstable_cache\(/.test(s),
      '`unstable_cache` kaybolmuş — ana sayfa verisi artık etiketle tazelenemez.',
    ).toBe(true)
    expect(
      /\[\s*['"]home-page-data['"]\s*,\s*lang\s*,\s*tenantId\s*\]/.test(s),
      'önbellek anahtarı `lang` ve `tenantId` ikilisini taşımıyor (kural 12).',
    ).toBe(true)
    expect(
      /tags:\s*\[[^\]]*homeDataTag\(tenantId\)/.test(s),
      'kiracı-kapsamlı tazeleme etiketi (`homeDataTag(tenantId)`) düşmüş — webhook ' +
        'tazelemesi bu etiketi kullanır, sayfa kullanmazsa sinyal ıskalar.',
    ).toBe(true)
  })

  it('K9 (ayırt edicilik) — çözücüler kusurlu deseni GERÇEKTEN yakalıyor', () => {
    // ⭐BU KOL KAPININ KENDİSİNİ SINAR. Yukarısı yeşilse sebebi "desen yok" olabileceği
    // gibi "çözücü hiçbir şeyi eşleştirmiyor" da olabilir — ikisi dışarıdan AYNI görünür.
    const kusurlu = `
      import { getTenantConfig } from '../../utils/tenantServer'
      export default async function Page({ params, searchParams }: {
        searchParams: Promise<{ q?: string }>
      }) {
        const tenantId = (await getTenantConfig()).id
      }
    `
    expect(tanimlayicilar(kusurlu).has('getTenantConfig'), 'tanımlayıcı çözücüsü ölü').toBe(true)
    expect(importYollari(kusurlu).some((y) => y.includes('tenantServer')), 'import çözücüsü ölü').toBe(true)
    expect(searchParamsBagi(kusurlu), 'searchParams çözücüsü ölü').toBe(true)

    // ⭐VE TERSİ — AST'nin YORUMU görmediği burada KANITLANIYOR. Denetlenen rotanın içinde
    // tam olarak böyle bir gerekçe yorumu var; kapı onu ihlal sayarsa kendi kendini yer.
    const yalnizYorum = `
      // eskiden (await getTenantConfig()).id idi; headers() okunuyordu, searchParams da vardı
      const tenantId = DEFAULT_TENANT_ID
    `
    expect(tanimlayicilar(yalnizYorum).has('getTenantConfig'), 'AST yorumu kod sandı').toBe(false)
    expect(tanimlayicilar(yalnizYorum).has('headers'), 'AST yorumu kod sandı').toBe(false)
    expect(searchParamsBagi(yalnizYorum), 'AST yorumu bağ sandı').toBe(false)
  })
})
