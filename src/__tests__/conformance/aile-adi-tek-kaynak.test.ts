/**
 * INV-AILE-ADI-1 — AİLE ADI TEK KAYNAKTAN ÇÖZÜLÜR.
 *
 * NİÇİN VAR (ölçülmüş olay, REC-108 / 2026-09-01):
 * İngilizce ürün sayfasının kırıntı yolu `HOME › AIR TREATMENT › ELECTRIC DUCT HEATERS ›
 * AVENS ELEKTRIKLI KANAL ISITICILARI` idi — ilk üç basamak İngilizce, dördüncü Türkçe.
 * Kök: `get_family_detail` RPC'si `p_lang`'ı çözüp AÇIKLAMA için kullanıyor ama ad için
 * ham kolonu döndürüyordu (`'name', f.name`). `product_families.name_i18n` iki migration
 * ile açılıp 40 ailenin 31'inde DOLDURULMUŞTU; okuyan kod SIFIRDI.
 * ⭐Sınıf: "iş bitti != iş erişilebilir" — DB ayağı inmiş, istemci hiç bağlanmamış.
 *
 * ⭐NİÇİN AST, METİN TARAMASI DEĞİL:
 * 2026-09-01'de bu sınıf DÖRT kez yaşandı — `readFileSync(...).includes(...)` ile kurulan
 * kollar kendi AÇIKLAMA YORUMLARIMI bulguya saydı. Bu dosyanın kendisi de "ham `family.name`
 * render EDİLMEZ" cümlesini yorumlarda geçiriyor; metin taraması burada da yanılırdı.
 *
 * Cetvel: docs/plans/rec108-aile-adi-dil-zinciri-2026-09-01.md
 * Kardeş kapı: kategori-adi-tek-kaynak.test.ts (INV-KATEGORI-ADI-1).
 *
 * BU KAPININ GÖREMEDİĞİ (gizlenmiyor):
 *  · Arama yüzeyleri. `fts_search_products` / `get_search_suggestions` AİLE değil ÜRÜN adı
 *    basar ve `products.name_i18n` kolonu YOKTUR → REC-110.
 *  · `getProductDisplayName` (utils/productHelpers.ts) aile adına DÜŞEBİLİR; o zincir
 *    sepet/sipariş/e-posta yüzeylerine kadar gider ve `lang` oralara taşınmamıştır → REC-110.
 *  · Sunucu tarafı SIRALAMA: `getSeriesLanding` modelleri `.order('name')` ile TR ada göre
 *    sıralar; EN sayfada adlar İngilizce görünse de sıra TR'ye göre kalır (plan §6.5/B3).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { familyName } from '../../lib/i18n/familyName'

const KOK = join(process.cwd(), 'src')

/** Aile adının BASILDIĞI vitrin yüzeyleri — kapının evreni. */
const VITRIN_YOLLARI = [
  join(KOK, 'app', '[lang]', 'products'),
  join(KOK, 'app', '_components', 'ProductDetailPageView.tsx'),
  join(KOK, 'components', 'products'),
  join(KOK, 'views', 'category'),
  join(KOK, 'lib', 'seo'),
]

/** Ham erişimi yasak olan değişken adları — bunlar aile/seri satırını taşır. */
const AILE_DEGISKENLERI = new Set(['family', 'series'])

function dosyalar(yol: string): string[] {
  const bulunan: string[] = []
  const gez = (p: string): void => {
    const st = statSync(p)
    if (st.isFile()) {
      if (/\.tsx?$/.test(p) && !/\.test\.tsx?$/.test(p)) bulunan.push(p)
      return
    }
    for (const ad of readdirSync(p)) {
      if (ad === '__tests__') continue
      gez(join(p, ad))
    }
  }
  gez(yol)
  return bulunan
}

function ayrıştır(dosya: string): ts.SourceFile {
  return ts.createSourceFile(
    dosya,
    readFileSync(dosya, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
}

function gez(n: ts.Node, ziyaret: (x: ts.Node) => void): void {
  ziyaret(n)
  ts.forEachChild(n, (c) => gez(c, ziyaret))
}

const vitrinDosyalari = (): string[] => VITRIN_YOLLARI.flatMap(dosyalar)

describe('INV-AILE-ADI-1 · aile adı tek kaynaktan çözülür', () => {
  it('⭐HAM ERİŞİM YASAK — vitrinde family.name / series.name kullanılmaz', () => {
    const ihlaller: string[] = []
    for (const dosya of vitrinDosyalari()) {
      const sf = ayrıştır(dosya)
      gez(sf, (n) => {
        if (!ts.isPropertyAccessExpression(n)) return
        if (n.name.text !== 'name') return
        if (!ts.isIdentifier(n.expression)) return
        if (!AILE_DEGISKENLERI.has(n.expression.text)) return
        const { line } = sf.getLineAndCharacterOfPosition(n.getStart(sf))
        ihlaller.push(`${dosya.replace(KOK, 'src')}:${line + 1} → ${n.expression.text}.name`)
      })
    }
    expect(
      ihlaller,
      'Ham aile adı okunuyor. Çözüm: familyName(family, lang) — EN sayfada TR ad basar.'
    ).toEqual([])
  })

  it('⭐LANG ATLANAMAZ — her familyName çağrısı iki argüman verir', () => {
    const eksik: string[] = []
    let cagriSayisi = 0
    for (const dosya of vitrinDosyalari()) {
      const sf = ayrıştır(dosya)
      gez(sf, (n) => {
        if (!ts.isCallExpression(n)) return
        if (!ts.isIdentifier(n.expression) || n.expression.text !== 'familyName') return
        cagriSayisi += 1
        if (n.arguments.length < 2) {
          const { line } = sf.getLineAndCharacterOfPosition(n.getStart(sf))
          eksik.push(`${dosya.replace(KOK, 'src')}:${line + 1}`)
        }
      })
    }
    // ⭐BOŞLUK MUHAFIZI: kol 1 ve bu kol, hiç çağrı olmadığında da YEŞİL olurdu —
    // yani "ham erişim yok" iddiası "hiç ad basılmıyor" ile aynı cevabı verirdi.
    // Ayırt ediciliği bu satır sağlar.
    expect(cagriSayisi, 'Hiç familyName çağrısı ölçülmedi — kapı sahte-yeşil').toBeGreaterThan(0)
    expect(eksik).toEqual([])
  })

  it('⭐SERVİS ALANI TAŞIR — çözüm servise kaçmaz, alan da düşmez', () => {
    // Plan §6.5/B2: liste verisi `unstable_cache` içinde tutuluyor. Çözüm servise
    // konsaydı önbellek içeriği dile bağımlı hale gelirdi. Bu yüzden servis TAŞIR.
    const servis = join(KOK, 'lib', 'services', 'family.service.ts')
    const sf = ayrıştır(servis)

    let seriSelectindeVar = false
    let atamaVar = false
    let servisteCozumVar = false

    gez(sf, (n) => {
      if (ts.isStringLiteral(n) && n.text.includes('name_i18n') && n.text.includes('series_code')) {
        seriSelectindeVar = true
      }
      // `detail.family.name_i18n = ...` ya da nesne kurucusunda `name_i18n:` alanı
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
        if (ts.isPropertyAccessExpression(n.left) && n.left.name.text === 'name_i18n') atamaVar = true
      }
      if (ts.isPropertyAssignment(n) && ts.isIdentifier(n.name) && n.name.text === 'name_i18n') {
        atamaVar = true
      }
      if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'familyName') {
        servisteCozumVar = true
      }
    })

    expect(seriSelectindeVar, 'getSeriesLanding select listesinde name_i18n YOK').toBe(true)
    expect(atamaVar, 'Servis name_i18n alanını TAŞIMIYOR — tek giriş noktası boşa çalışır').toBe(true)
    expect(
      servisteCozumVar,
      'Servis içinde familyName çağrılıyor — çözüm render anında olmalı (önbellek dile bağımlı olur)'
    ).toBe(false)
  })

  it('⭐İKİ YÖNLÜ — EN çevirisi VARSA EN döner, YOKSA TR ada düşülür', () => {
    // Tek yönlü kol, fallback'i sessizce HER ŞEYE uygulayan bir hatayı göremez:
    // "EN ad yoksa TR bas" doğru, ama "EN ad varken de TR bas" da o kolu geçerdi.
    const cevirili = { name: 'AVenS Elektrikli Kanal Isıtıcıları', name_i18n: { tr: null, en: 'AVenS Electric Duct Heaters' } }
    const cevirisiz = { name: 'AVenS Hız Anahtarları', name_i18n: null }

    expect(familyName(cevirili, 'en')).toBe('AVenS Electric Duct Heaters')
    expect(familyName(cevirili, 'tr')).toBe('AVenS Elektrikli Kanal Isıtıcıları')
    // 40 ailenin 9'unda EN ad henüz yok (REC-109) — fallback KUSUR DEĞİL, sözleşme.
    expect(familyName(cevirisiz, 'en')).toBe('AVenS Hız Anahtarları')
  })

  it('BOŞ DİZE DOLU SAYILMAZ — toplu betik boş hücre bırakabilir', () => {
    // `name_i18n` toplu bir migration ile dolduruldu. Boşu "çeviri var" saymak adı
    // görünmez yapardı — sessiz kayıp, en pahalı kusur sınıfı.
    expect(familyName({ name: 'Vortice Lineo', name_i18n: { en: '' } }, 'en')).toBe('Vortice Lineo')
    expect(familyName({ name: 'Vortice Lineo', name_i18n: { en: '   ' } }, 'en')).toBe('Vortice Lineo')
    expect(familyName(null, 'en')).toBe('')
  })
})
