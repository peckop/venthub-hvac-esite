import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-KATEGORI-STATIK-1 — kategori rotası ÖNCEDEN ÜRETİLEBİLİR kalır.
 *
 * NİÇİN (REC-59, ölçüm 2026-09-08). Rota `revalidate = 3600` beyan ediyordu ama build
 * hiçbir kategori sayfası üretmiyordu: 46 yol listeleniyor, diskte **0 HTML**. Sebep İKİ
 * taneydi ve her biri TEK BAŞINA yeterliydi — üç kollu sabotajla ölçüldü:
 *
 *   taban (ikisi de var)            → 0 HTML
 *   yalnız `searchParams` kaldırıldı → 0 HTML
 *   yalnız `headers()` kaldırıldı    → 0 HTML
 *   İKİSİ birden kaldırıldı          → 46 HTML ✔
 *
 * Yani biri geri gelirse kazanımın TAMAMI gider. Bu kapı ikisini birden bekler.
 *
 * ── ⚠BU KAPININ SINIRI, ADIYLA ──
 * Kapı KAYNAK KODU okur, `.next` çıktısını DEĞİL. Sebebi bilinçli: konformans testi
 * derleme artefaktına bakarsa, `.next` yoksa (temiz makine, CI sırası) ya kırmızı yanıp
 * yalan söyler ya atlanıp FAIL-OPEN olur. Yani bu kapı "prerender EDİLDİ" demez;
 * **"prerender'ı engelleyen iki desen geri gelmedi"** der. Üretilen dosyayı saymak ayrı
 * bir ÖLÇÜM işidir (build sonrası betik) ve bu dosyanın işi değildir — susarak geçmiyorum.
 */

const KOK = path.join(process.cwd(), 'src')
const ROTA = path.join(KOK, 'app', '[lang]', 'category', '[categorySlug]', 'page.tsx')

const kaynak = (): string => fs.readFileSync(ROTA, 'utf8')

/**
 * ⭐AST — VE NİÇİN AST OLDUĞU, İLK KOŞUMDA ÖLÇÜLEREK ÖĞRENİLDİ.
 * İlk sürüm ham metin tarıyordu ve K3 KIRMIZI verdi: ihlal eden şey kodun kendisi değil,
 * yukarıdaki `tenantId` satırının AÇIKLAMA YORUMUYDU — "eskiden `getTenantConfig()` idi"
 * diye yazdığım cümle. Yani kapı, kendi gerekçesini ihlal saydı.
 * Bu bu depoda ikinci kez yaşanan sınıf (`kategori-adi-tek-kaynak.test.ts` aynı dersi
 * yazmış): **metin taraması yorumla tatmin olur; AST yorum düğümü üretmez.**
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

/** `Page`/`generateMetadata` imzalarında `searchParams` adlı bir bağ var mı? */
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

describe('INV-KATEGORI-STATIK-1 — kategori rotası önceden üretilebilir kalır', () => {
  it('K1 (ön-koşul) — rota dosyası duruyor ve boş değil', () => {
    expect(fs.existsSync(ROTA), `rota dosyası bulunamadı: ${ROTA}`).toBe(true)
    expect(kaynak().length, 'rota dosyası boş — aşağıdaki kollar anlamsız olurdu').toBeGreaterThan(1000)
  })

  it('K2 (kural) — sayfa `searchParams` ALMIYOR', () => {
    // Next 15: `searchParams` alan sayfa build'de prerender EDİLEMEZ. Sorgu parametresi
    // yerine sayfa boyu büyütüldü (ölçüm: 23 kategoriden yalnız 1'i 24'ü aşıyordu).
    expect(
      searchParamsBagi(kaynak()),
      '`searchParams` geri gelmiş. Bu tek başına 46 sayfanın TAMAMINI dinamikleştirir ' +
        've `revalidate = 3600` yine ölü bir beyana döner. Sayfalama gerekiyorsa sorgu ' +
        'parametresi değil AYRI ADRES SEGMENTİ açılır (bkz. PAGE_SIZE notu).',
    ).toBe(false)
  })

  it('K3 (kural) — sayfa `headers()` okumuyor, tenant DERLEME SABİTİ', () => {
    const s = kaynak()
    const adlar = tanimlayicilar(s)
    expect(
      adlar.has('getTenantConfig') || adlar.has('headers'),
      'Tenant çözümü `headers()` okumaya dönmüş. Build bunu "couldn\'t be rendered ' +
        'statically because it used `headers`" diye reddeder ve rota yine istek anında ' +
        'üretilir. Çok-kiracılı yapı geri açılacaksa doğru yol kiracı başına ayrı yayındır, ' +
        'RSC render yolunda başlık okumak değil.',
    ).toBe(false)
    expect(
      importYollari(s).some((y) => y.includes('next/headers') || y.includes('tenantServer')),
      '`next/headers` ya da `tenantServer` yeniden import edilmiş — tenantServer sunucu ' +
        'başlığı okur ve rotayı dinamikleştirir.',
    ).toBe(false)
    expect(
      adlar.has('DEFAULT_TENANT_ID'),
      'tenant sabiti kaybolmuş — `unstable_cache` anahtarı ve `discoveryTag` bir tenant ' +
        'değeri bekliyor; boş kalırsa webhook tazelemesi ISKALAR.',
    ).toBe(true)
  })

  it('K4 (ayırt edicilik) — AST çözücüsü kusurlu deseni GERÇEKTEN yakalıyor', () => {
    // ⭐BU KOL KAPININ KENDİSİNİ SINAR. K2/K3 yeşilse sebebi "desen yok" olabileceği gibi
    // "çözücü hiçbir şeyi eşleştirmiyor" da olabilir — ikisi dışarıdan AYNI görünür.
    const kusurlu = `
      import { getTenantConfig } from '../../utils/tenantServer'
      export default async function Page({ params, searchParams }: {
        searchParams: Promise<{ page?: string }>
      }) {
        const tenantId = (await getTenantConfig()).id
      }
    `
    expect(searchParamsBagi(kusurlu), 'searchParams çözücüsü ölü').toBe(true)
    expect(tanimlayicilar(kusurlu).has('getTenantConfig'), 'tanımlayıcı çözücüsü ölü').toBe(true)
    expect(importYollari(kusurlu).some((y) => y.includes('tenantServer')), 'import çözücüsü ölü').toBe(true)

    // ⭐VE TERSİ — AST'nin YORUMU görmediği burada KANITLANIYOR. İlk sürüm ham metin
    // tarıyordu ve tam bu yüzden kırmızı vermişti: aşağıdaki dize gerçek kodda `headers`
    // KULLANMIYOR, yalnız ondan SÖZ EDİYOR. Kapı bunu ihlal sayarsa yine yanlış olur.
    const yalnizYorum = `
      // eskiden (await getTenantConfig()).id idi; searchParams da vardı
      const tenantId = DEFAULT_TENANT_ID
    `
    expect(tanimlayicilar(yalnizYorum).has('getTenantConfig'), 'AST yorumu kod sandı').toBe(false)
    expect(searchParamsBagi(yalnizYorum), 'AST yorumu bağ sandı').toBe(false)
  })

  it('K5 (sessiz eksilme) — sayfa boyu, en kalabalık kategoriyi KAPSAR', () => {
    // ⭐SESSİZ KUSUR KOLU: sayfalama kalktığı için, en kalabalık kategori PAGE_SIZE'ı
    // aştığı gün fazlası EKRANDA HİÇ GÖRÜNMEZ ve hiçbir hata çıkmaz — liste sessizce
    // eksilir. Bu kol o günü KIRMIZI yapar; o gün ayrı segment sayfalaması işi açılır.
    //
    // ⚠SINIR: aşağıdaki sayı DONDURULMUŞ bir ölçümdür (canlı DB, 2026-09-08: en kalabalık
    // kategori `fans` = 34 aile; ikinci 12, üçüncü 6). Konformans testi ağa çıkamaz, yani
    // bu kol DB büyümesini KENDİLİĞİNDEN görmez — kataloğa toplu yükleme yapan iş bu sayıyı
    // güncellemekle yükümlüdür. Ölçmediğini bilmek, ölçtüğünü sanmaktan iyidir.
    const OLCULEN_EN_KALABALIK = 34
    const m = kaynak().match(/const PAGE_SIZE\s*=\s*(\d+)/)
    expect(m, '`PAGE_SIZE` bulunamadı — kolun evreni boş').not.toBeNull()
    const pageSize = Number(m![1])
    expect(
      pageSize,
      `PAGE_SIZE (${pageSize}) en kalabalık kategoriyi (${OLCULEN_EN_KALABALIK} aile) ` +
        'kapsamıyor. Sayfalama kalktığı için fazlası SESSİZCE görünmez olur. Ya PAGE_SIZE ' +
        'büyütülür ya da ayrı adres segmentiyle sayfalama açılır.',
    ).toBeGreaterThanOrEqual(OLCULEN_EN_KALABALIK)
  })

  it('K6 (vaat bütünlüğü) — `revalidate` beyanı duruyor', () => {
    // Rota statikken `revalidate` ISR yedeğidir ve ANLAMLIDIR (birincil yol webhook).
    // Beyan kalkarsa sayfa sonsuza kadar donar; webhook sinyali kaçarsa düzelme YOLU KALMAZ.
    expect(
      /export const revalidate\s*=\s*\d+/.test(kaynak()),
      '`revalidate` beyanı kaybolmuş — webhook sinyali kaçarsa sayfayı tazeleyecek emniyet ' +
        'kemeri kalmaz.',
    ).toBe(true)
  })
})
