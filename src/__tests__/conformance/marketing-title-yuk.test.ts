import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-MARKETING-YUK-1 — emekli `marketing_title` VİTRİN sorgularında taşınmaz
 *
 * KORUNAN DEĞİŞMEZ:
 *   "Emekli bir alan yalnız RENDER'dan değil, VİTRİN SORGUSUNDAN da çıkar.
 *    Yönetim yüzeyleri okumaya devam eder."
 *
 * NİÇİN (REC-297, 2026-09-09): `marketing_title` Recep kararıyla EMEKLİ oldu ve çözücüsü
 * silindi — yani hiçbir yüzey onu BASMIYOR. Kapı yazıldı, yeşil yandı, iş bitti sanıldı.
 * Sonra canlı ölçüm başka bir şey söyledi: `/tr/category/fanlar` HTML'inde kolon **11 kez**
 * taşınıyordu. Görünmüyordu ama GÖNDERİLİYORDU.
 *
 * ⭐DERSİN ADI: "render etmiyoruz" ile "veri gitmiyor" AYNI ŞEY DEĞİL. Emeklilik kararı
 * çözücüyü kaldırdı, sorguyu kaldırmadı; arada `select` listesi vardı ve hiçbir kapı ona
 * bakmıyordu. Bu kapı tam o boşluğu kapatır.
 *
 * ⭐AYIRT EDİCİ ÖLÇÜM (niçin "hiç geçmiyor" demedim): iki kategoride `marketing_title` ile
 * `menu_label` AYNI dizedir ("Radyal Fanlar"), o yüzden metnin ekranda görünmesi hangi
 * alandan geldiğini KANITLAMAZ. Ayırt eden vaka `fanlar`: alan "Industrial Ventilation",
 * ekran "Fanlar". Ekranda o dize YOKTU → render `menu_label`'dan besleniyor.
 *
 * BU KAPININ ÖLÇMEDİĞİ: kolonun DB'de var olmasını yasaklamaz — kolon KASITEN duruyor
 * (Recep: emekli, silinmiş değil) ve 12 satırdaki metin yerinde. Yönetim yüzeyleri de
 * kapsam DIŞIDIR ve bu bir eksik değil, hükmün kendisidir.
 */

const KOK = join(__dirname, '..', '..', '..')

/** Vitrin yolu — ziyaretçiye giden sorgular. Buradan `marketing_title` ÇIKMIŞ olmalı. */
const VITRIN = [
  join(KOK, 'src', 'lib', 'data', 'preload.ts'),
  join(KOK, 'src', 'lib', 'services', 'category.service.ts'),
  join(KOK, 'src', 'app', '[lang]', 'category', '[categorySlug]', 'page.tsx'),
]

/** Yönetim yolu — KASITEN okumaya devam eder. Pozitif çapa: kapı her şeyi reddetmiyor. */
const YONETIM = [
  join(KOK, 'src', 'views', 'admin', 'CategoriesTableBody.tsx'),
  join(KOK, 'src', 'views', 'admin', 'CategoryBuilderView.tsx'),
]

function ayristir(yol: string): ts.SourceFile {
  const kaynak = readFileSync(yol, 'utf8')
  expect(kaynak.length, `BOŞ EVREN: ${yol} okunamadı ya da boş`).toBeGreaterThan(200)
  return ts.createSourceFile(yol, kaynak, ts.ScriptTarget.Latest, true)
}

/**
 * Dosyadaki KOD metni içinde geçen `marketing_title` içeren dize değişmezlerini toplar.
 *
 * NİÇİN AST, NİÇİN DÜZ ARAMA DEĞİL: bu dosyaların hepsinde alanın NİÇİN çıkarıldığını
 * anlatan yorum satırları var ve o yorumlar alanın adını GEÇİRİYOR. Metin tabanlı bir
 * kapı kendi gerekçesini ihlal sayardı — depoda bu tuzağa bir kez düşüldü.
 */
function sorgudakiIhlaller(kaynak: ts.SourceFile): string[] {
  const bulunanlar: string[] = []
  const gez = (n: ts.Node): void => {
    if (ts.isStringLiteral(n) && n.text.includes('marketing_title')) {
      const satir = kaynak.getLineAndCharacterOfPosition(n.getStart()).line + 1
      bulunanlar.push(`${kaynak.fileName}:${satir}`)
    }
    // Nesne anahtarı olarak da yazılabilir: `{ marketing_title: ... }`
    if (
      ts.isPropertyAssignment(n) &&
      ts.isIdentifier(n.name) &&
      n.name.text === 'marketing_title'
    ) {
      const satir = kaynak.getLineAndCharacterOfPosition(n.getStart()).line + 1
      bulunanlar.push(`${kaynak.fileName}:${satir} (nesne alanı)`)
    }
    ts.forEachChild(n, gez)
  }
  gez(kaynak)
  return bulunanlar
}

describe('INV-MARKETING-YUK-1 — emekli alan vitrin sorgusunda taşınmaz', () => {
  it('K1: VİTRİN sorguları `marketing_title` istemiyor', () => {
    const ihlaller = VITRIN.flatMap((yol) => sorgudakiIhlaller(ayristir(yol)))
    expect(
      ihlaller,
      'Emekli `marketing_title` vitrin yoluna geri girmiş. Alan RENDER edilmese bile ' +
        'RSC yükünde HER ZİYARETÇİYE gider — "basmıyoruz" ile "göndermiyoruz" aynı şey ' +
        'değildir (REC-297; canlıda 11 kez ölçüldü).\n' +
        ihlaller.join('\n'),
    ).toEqual([])
  })

  it('K2: `mapDatabaseCategoryToDomain` alanı ÜRETMİYOR (yedek dize dahil)', () => {
    const kaynak = ayristir(join(KOK, 'src', 'lib', 'type-converters.ts'))
    expect(
      sorgudakiIhlaller(kaynak),
      'Dönüştürücü `marketing_title` üretiyor. Eskiden `name`e düşen bir YEDEK yazıyordu; ' +
        'kimse okumadığı için ürettiği tek şey RSC yüküydü.',
    ).toEqual([])
  })

  it('K3: POZİTİF ÇAPA — yönetim yüzeyleri alanı OKUMAYA DEVAM EDER', () => {
    // Bu kol KASITEN terstir. Kapı "her yerde yasak" deseydi, yönetim ekranını da
    // körleştirir ve emekli ETMEK ile SİLMEK arasındaki farkı yok ederdi. Kolon DB'de
    // duruyor (Recep kararı) ve yönetim onu görebilmeli.
    const okuyanlar = YONETIM.filter((yol) => sorgudakiIhlaller(ayristir(yol)).length > 0)
    expect(
      okuyanlar.length,
      'Yönetim yüzeylerinin HİÇBİRİ `marketing_title` okumuyor. Bu kapı vitrini ölçer; ' +
        'yönetimi de kapatmışsak emekli etmedik, körleştirdik.',
    ).toBeGreaterThan(0)
  })

  it('K4: BOŞ EVREN DEĞİL — vitrin dosyaları gerçekten kategori sorgusu içeriyor', () => {
    for (const yol of VITRIN) {
      const metin = readFileSync(yol, 'utf8')
      expect(/categories/.test(metin), `${yol} kategori sorgusu içermiyor — yanlış dosya ölçülüyor`).toBe(
        true,
      )
    }
  })
})
