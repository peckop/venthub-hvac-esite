/**
 * INV-KATEGORI-ADI-1 — kategori ADI TEK kaynaktan çözülür ve çözücü sözlüksüz çağrılmaz.
 *
 * NİÇİN VAR (ölçülmüş canlı kusur, REC-103 / 2026-09-01):
 * `/en` ana sayfasında kategori vitrini TÜRKÇE ad basıyordu — ama hepsi değil. Canlı
 * tarayıcı ölçümü: "Fanlar" 2 kez, "Kontrol Sistemleri" 2 kez Türkçe; aynı ekranda
 * "Air Curtains" ve "Accessories" İngilizce. Yani ölçüt AYIRT EDİYORDU ve iki ayrı kök
 * vardı:
 *
 *   KÖK 1 (veri): 23 aktif DB kategorisinin 8'inin `translation_key`'i sözlükte HİÇ
 *   yoktu (`sub.chimney`, `control-systems`, `sub.duct-fans`, `sub.ducted-central-hrv`,
 *   `fans`, `sub.single-room-hrv`, `sub.speed-controllers`, `sub.water-coils`).
 *   Recep'in ekran görüntüsünde saydığı 6 adın 6'sı bu listedeydi; ölçüm üstüne 2 tane
 *   daha buldu.
 *   ⭐İLK ÖLÇÜMÜM YANLIŞ EVRENDEYDİ: sözlüğü `slug` ile karşılaştırıp "21/23 eksik"
 *   dedim. Anahtar slug DEĞİL `translation_key`. Doğru evrende sayı 8. Keskin bir ölçüt
 *   yanlış kümeye uygulanınca keskinliği işe yaramaz.
 *
 *   KÖK 2 (kod): `getCategoryDisplayName(category, t?)` — `t` OPSİYONEL. Verilmezse
 *   sözlük adımı hiç çalışmaz, doğrudan `menu_label`/`name`'e düşer; ikisi de Türkçedir.
 *   Yani anahtar EKLENSE BİLE `t`'siz çağrılar Türkçe basmaya devam ederdi. Ölçüm:
 *   25 çağrının 12'si `t` vermiyordu (breadcrumb dahil — her sayfada).
 *
 *   KÖK 3 (kopya): `useCategoryViewModel` aynı zinciri (sözlük → menu_label → name)
 *   ELLE İKİNCİ KEZ yazmıştı. Mutlak Kural 7 "ad daima getCategoryDisplayName" der;
 *   ⭐KOPYALAMAK DA İHLALDİR — kuralın bir kolu düzeltilince diğeri sessizce eski
 *   davranışta kalır. Menüler ve showcase görünümleri o kopyadan besleniyordu.
 *
 *   KÖK 4 (ham ad): `SearchOverlay` doğrudan `cat.name` basıyordu, fallback bile yoktu.
 *
 * Cetvel: Mutlak Kural 7 (CLAUDE.md) · docs/standards/i18n-localization-standard.md
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'

const KOK = join(process.cwd(), 'src')

/**
 * DB'deki aktif kategorilerin `translation_key` değerleri — 2026-09-01'de canlı
 * veritabanından ölçüldü (23/23). Konformans testi ağa çıkamaz, bu yüzden liste
 * DONDURULMUŞTUR. DB'ye yeni kategori eklendiğinde bu liste ve iki sözlük birlikte
 * güncellenir; güncellenmezse o kategori İngilizce sayfada Türkçe ad basar.
 */
const DB_TRANSLATION_KEYS = [
  'accessories',
  'air-treatment',
  'control-systems',
  'fans',
  'hrv',
  'hvls',
  'sub.acid-fans',
  'sub.air-curtain',
  'sub.axial-ind',
  'sub.bathroom',
  'sub.chimney',
  'sub.dehumidifier',
  'sub.duct-fans',
  'sub.duct-heaters',
  'sub.ducted-central-hrv',
  'sub.freq-converters',
  'sub.radial',
  'sub.roof',
  'sub.shelter',
  'sub.single-room-hrv',
  'sub.smoke',
  'sub.speed-controllers',
  'sub.water-coils',
]

type Sozluk = typeof tr

const cozKategoriAdi = (sozluk: Sozluk, tKey: string): string | null => {
  let dugum: unknown = sozluk.common.categoryList
  for (const parca of tKey.split('.')) {
    if (typeof dugum !== 'object' || dugum === null) return null
    dugum = (dugum as Record<string, unknown>)[parca]
  }
  return typeof dugum === 'string' ? dugum : null
}

const kaynakDosyalari = (): string[] => {
  const bulunan: string[] = []
  const gez = (yol: string): void => {
    const st = statSync(yol)
    if (st.isFile()) {
      if (/\.tsx?$/.test(yol) && !/\.test\.tsx?$/.test(yol)) bulunan.push(yol)
      return
    }
    for (const ad of readdirSync(yol)) {
      if (ad === '__tests__') continue
      gez(join(yol, ad))
    }
  }
  gez(KOK)
  return bulunan
}

/** AST: `getCategoryDisplayName(...)` çağrılarının argüman sayısını toplar. */
const cagrilar = (kaynak: string): number[] => {
  const sf = ts.createSourceFile('x.tsx', kaynak, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const sayilar: number[] = []
  const gez = (n: ts.Node): void => {
    if (
      ts.isCallExpression(n) &&
      ts.isIdentifier(n.expression) &&
      n.expression.text === 'getCategoryDisplayName'
    ) {
      sayilar.push(n.arguments.length)
    }
    ts.forEachChild(n, gez)
  }
  gez(sf)
  return sayilar
}

/**
 * AST: dosyanın DİZE değişmezlerinde (şablon parçaları dahil) `common.categoryList.`
 * öneki geçiyor mu?
 *
 * ⭐NİÇİN AST — İLK SÜRÜM METİN TARIYORDU VE KENDİ YORUMLARINI YAKALADI:
 * `kaynak.includes('common.categoryList.')` yazınca kapı, `useCategoryViewModel`'deki
 * "burada şu zincir vardı" açıklama yorumumu ve `getDictValue.ts`'teki örnek anahtarı
 * ihlal saydı. İkisi de KOD DEĞİL. Bu, bugün üçüncü kez yaşanan sınıf: metin taraması
 * yorumla tatmin olur. AST yorum düğümü üretmez — doğru araç budur.
 */
const sozlukYoluKuranDize = (kaynak: string): boolean => {
  const sf = ts.createSourceFile('x.tsx', kaynak, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  let bulundu = false
  const gez = (n: ts.Node): void => {
    if (bulundu) return
    if (
      ts.isStringLiteral(n) ||
      ts.isNoSubstitutionTemplateLiteral(n) ||
      ts.isTemplateHead(n) ||
      ts.isTemplateMiddle(n) ||
      ts.isTemplateTail(n)
    ) {
      if (n.text.includes('common.categoryList.')) bulundu = true
    }
    ts.forEachChild(n, gez)
  }
  gez(sf)
  return bulundu
}

/** AST: JSX içinde doğrudan `{<kategori>.name}` basan yerler. */
const KATEGORI_ADLARI = new Set(['category', 'cat', 'sub', 'subCategory', 'parentCategory'])
const hamAdBasanlar = (kaynak: string): string[] => {
  const sf = ts.createSourceFile('x.tsx', kaynak, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const bulgular: string[] = []
  const gez = (n: ts.Node): void => {
    if (ts.isJsxExpression(n) && n.expression) {
      const e = n.expression
      if (
        ts.isPropertyAccessExpression(e) &&
        e.name.text === 'name' &&
        ts.isIdentifier(e.expression) &&
        KATEGORI_ADLARI.has(e.expression.text)
      ) {
        bulgular.push(`${e.expression.text}.name`)
      }
    }
    ts.forEachChild(n, gez)
  }
  gez(sf)
  return bulgular
}

describe('INV-KATEGORI-ADI-1 · kategori adı tek kaynaktan', () => {
  it('⭐VERİ KÖKÜ — DB\'deki her aktif kategorinin anahtarı İKİ sözlükte de var', () => {
    const eksik: string[] = []
    for (const k of DB_TRANSLATION_KEYS) {
      if (!cozKategoriAdi(tr, k)) eksik.push(`tr · ${k}`)
      if (!cozKategoriAdi(en, k)) eksik.push(`en · ${k}`)
    }
    expect(
      eksik,
      'Bu anahtarlar sözlükte YOK. getCategoryDisplayName sessizce menu_label/name ' +
        'fallback\'ine düşer ve İngilizce sayfada TÜRKÇE ad basar.\n' + eksik.join('\n'),
    ).toEqual([])
  })

  it('AYIRT EDİCİ — çözücü her anahtara "var" demiyor', () => {
    // Bu kol olmadan yukarıdaki iddia sahte-yeşil olabilirdi: çözücü hatalıysa
    // (ör. her zaman bir dize döndürürse) eksik anahtarı da "var" sayardı.
    expect(cozKategoriAdi(tr, 'sub.olmayan-anahtar')).toBeNull()
    expect(cozKategoriAdi(en, 'boyle-bir-kategori-yok')).toBeNull()
    expect(DB_TRANSLATION_KEYS.length).toBe(23)
  })

  it('⭐KOD KÖKÜ — getCategoryDisplayName sözlüksüz çağrılmaz', () => {
    const ihlaller: string[] = []
    let toplamCagri = 0
    for (const dosya of kaynakDosyalari()) {
      const kaynak = readFileSync(dosya, 'utf8')
      if (!kaynak.includes('getCategoryDisplayName')) continue
      for (const argSayisi of cagrilar(kaynak)) {
        toplamCagri += 1
        if (argSayisi < 2) ihlaller.push(dosya.replace(KOK, 'src'))
      }
    }
    // Boşluk muhafızı: tarayıcı gerçekten çağrı görüyor mu?
    expect(toplamCagri).toBeGreaterThan(15)
    expect(
      [...new Set(ihlaller)],
      '`t` verilmeyen çağrı sözlük adımını HİÇ çalıştırmaz ve doğrudan Türkçe ' +
        '`menu_label`/`name`\'e düşer. Çözücüyü daima (category, t) ile çağır.',
    ).toEqual([])
  })

  it('⭐KOPYA ZİNCİR — çözüm mantığı yalnız categoryHelpers içinde yaşar', () => {
    // `common.categoryList.` önekini elle kuran her yer, getCategoryDisplayName'in
    // KOPYASIDIR. Kural 7 kopyayı da yasaklar: bir kol düzeltilince diğeri sessizce
    // eski davranışta kalır (2026-09-01'de useCategoryViewModel'de tam bu oldu).
    const kopyalar: string[] = []
    for (const dosya of kaynakDosyalari()) {
      const goreli = dosya.replace(KOK, 'src')
      if (goreli.includes(join('utils', 'categoryHelpers'))) continue
      if (goreli.includes(join('i18n', 'dictionaries'))) continue
      if (sozlukYoluKuranDize(readFileSync(dosya, 'utf8'))) kopyalar.push(goreli)
    }
    expect(
      kopyalar,
      'Bu dosyalar sözlük yolunu ELLE kuruyor — yani ad çözümünün ikinci bir kopyası. ' +
        'getCategoryDisplayName çağır.',
    ).toEqual([])
  })

  it('HAM AD — kategori adı JSX\'e doğrudan basılmaz', () => {
    const ihlaller: string[] = []
    for (const dosya of kaynakDosyalari()) {
      const goreli = dosya.replace(KOK, 'src')
      if (goreli.includes(join('components', 'admin'))) continue
      if (goreli.includes(join('views', 'admin'))) continue
      const bulgu = hamAdBasanlar(readFileSync(dosya, 'utf8'))
      for (const b of bulgu) ihlaller.push(`${goreli} · {${b}}`)
    }
    expect(
      ihlaller,
      'Ham `name` DB\'de Türkçedir; müşteri yüzeyinde getCategoryDisplayName kullanılır.',
    ).toEqual([])
  })

  /**
   * KÖK 5 (arama önerisi) — REC-114, 2026-09-01.
   *
   * `get_search_suggestions` etiketi `c.name::text AS label` ile kuruluyor: ham TR.
   * SearchOverlay bu etiketi İKİ yerde tüketiyordu — listede render, klavyeyle Enter'da
   * arama geçmişine yazım — ve ikisi de ham basıyordu. Aynı bileşenin popüler-kategori
   * çipleri REC-103'te düzeltilmişti; öneri dalı atlanmıştı.
   *
   * ⭐KOLLAR NEDEN DÖRT: "oneriEtiketi çağrılıyor mu" tek başına ölçüm DEĞİL. Fonksiyon
   * boşaltılsa, ya da filtreli kategori setinden çözse, çağrı yine duruyor olurdu ve kapı
   * yeşil kalırdı. Bugün tam bu sınıftan bir kusur yaşandı (INV-AILE-ADI-1'in servis kolu
   * "herhangi biri taşıyor mu" diye sorduğu için kördü). Bu yüzden çağrının VARLIĞI,
   * ham etiketin YOKLUĞU, çözücüye BAĞLILIK ve TAM SET kullanımı ayrı ayrı ölçülür.
   */
  describe('KÖK 5 · arama önerisi etiketi (REC-114)', () => {
    const OVERLAY = join(KOK, 'components', 'SearchOverlay.tsx')
    const kaynak = (): string => readFileSync(OVERLAY, 'utf8')

    /** AST: `oneriEtiketi` fonksiyonunun gövde metni (yoksa null). */
    const cozucuGovdesi = (src: string): string | null => {
      const sf = ts.createSourceFile('x.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
      let govde: string | null = null
      const gez = (n: ts.Node): void => {
        if (
          ts.isVariableDeclaration(n) &&
          ts.isIdentifier(n.name) &&
          n.name.text === 'oneriEtiketi' &&
          n.initializer
        ) {
          govde = n.initializer.getText(sf)
        }
        ts.forEachChild(n, gez)
      }
      gez(sf)
      return govde
    }

    /** AST: `goToSuggestion(...)` çağrılarının İKİNCİ argümanının kaynak metni. */
    const gecisArgumanlari = (src: string): string[] => {
      const sf = ts.createSourceFile('x.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
      const args: string[] = []
      const gez = (n: ts.Node): void => {
        if (
          ts.isCallExpression(n) &&
          ts.isIdentifier(n.expression) &&
          n.expression.text === 'goToSuggestion' &&
          n.arguments.length >= 2
        ) {
          args.push(n.arguments[1].getText(sf))
        }
        ts.forEachChild(n, gez)
      }
      gez(sf)
      return args
    }

    it('⭐ÇÖZÜCÜ VAR — öneri etiketi için tek giriş noktası tanımlı', () => {
      expect(
        cozucuGovdesi(kaynak()),
        'SearchOverlay içinde `oneriEtiketi` yok — öneri etiketi tek noktadan çözülmüyor.',
      ).not.toBeNull()
    })

    it('⭐ÇÖZÜCÜ GERÇEKTEN ÇÖZÜYOR — sözlük çözücüsüne ve TAM kategori setine bağlı', () => {
      const govde = cozucuGovdesi(kaynak()) ?? ''
      expect(
        govde.includes('getCategoryDisplayName'),
        '`oneriEtiketi` getCategoryDisplayName çağırmıyor — etiket sözlükten geçmiyor demektir.',
      ).toBe(true)
      expect(
        govde.includes('getCategoryBySlug'),
        '`oneriEtiketi` getCategoryBySlug kullanmıyor. Kategoriyi filtreli `categories` ' +
          'listesinden aramak SESSİZ bir boşluk açar: öneri RPC\'si yalnız is_active ' +
          'filtreler, o liste ise ürünü olmayan kategoriyi hiç içermez — eşleşme kaçar ve ' +
          'ham TR ada düşülür.',
      ).toBe(true)
    })

    it('⭐İKİ YÖNLÜ — hiçbir geçiş yolu ham `s.label` taşımaz VE çözücü fiilen geçiliyor', () => {
      const args = gecisArgumanlari(kaynak())
      expect(args.length, 'goToSuggestion hiç çağrılmıyor — ölçüt boşa ölçüyor olurdu.')
        .toBeGreaterThan(0)
      expect(
        args.filter((a) => /\bs\.label\b/.test(a)),
        'Bir goToSuggestion çağrısı ham `s.label` geçiriyor — İngilizce gezen müşterinin ' +
          'arama geçmişine Türkçe kategori adı yazılır.',
      ).toEqual([])
      expect(
        args.some((a) => a.includes('oneriEtiketi')),
        'Hiçbir goToSuggestion çağrısı `oneriEtiketi` geçirmiyor — ham etiket kaldırılmış ' +
          'ama yerine çözülmüş etiket KONMAMIŞ olabilir.',
      ).toBe(true)
    })

    it('RENDER — listede basılan etiket çözücüden gelir', () => {
      const src = kaynak()
      const sf = ts.createSourceFile('x.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
      let atama: string | null = null
      const gez = (n: ts.Node): void => {
        if (
          ts.isVariableDeclaration(n) &&
          ts.isIdentifier(n.name) &&
          n.name.text === 'label' &&
          n.initializer
        ) {
          atama = n.initializer.getText(sf)
        }
        ts.forEachChild(n, gez)
      }
      gez(sf)
      expect(atama, 'Öneri satırındaki `label` ataması bulunamadı.').not.toBeNull()
      expect(
        (atama ?? '').includes('oneriEtiketi'),
        'Render edilen etiket `oneriEtiketi`den geçmiyor — kategori önerisi ham TR basar.',
      ).toBe(true)
    })
  })
})
