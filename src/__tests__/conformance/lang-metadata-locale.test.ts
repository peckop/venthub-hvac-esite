import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { generateMetadata } from '../../app/[lang]/layout'
import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'

/**
 * INV-LANG-META-1 · site geneli metadata DİLE GÖRE üretilir
 *
 * ÖLÇÜLMÜŞ KUSUR (2026-08-23): kök layout (`src/app/layout.tsx`) `[lang]` segmentinin
 * ÜSTÜNDE olduğu için rota parametresini göremiyor ve metadata'sını Türkçe sabitlerle
 * basıyordu. Sonuç: `[lang]` altındaki 47 sayfanın **42'si** kendi `generateMetadata`'sını
 * tanımlamadığı için `/en` altında İngilizce içerik gösterip TÜRKÇE başlık ve `tr_TR`
 * OG yereli basıyordu.
 *
 * ⚠ NİÇİN BU KAPI "İNGİLİZCE Mİ" DİYE SORMUYOR: bir dizenin hangi dilde olduğunu mekanik
 * olarak ölçemeyiz. Ölçebileceğimiz şey OKUMA YOLUNUN FİİLEN BAĞLI olmasıdır — dönen değer
 * sözlükteki anahtara EŞİT Mİ. Bu ayrım bu projede pahalıya mal oldu: anahtarın sözlükte
 * VAR OLMASI, ekranda GÖRÜNDÜĞÜ anlamına gelmiyor.
 *
 * ⚠ NİÇİN KÖK LAYOUT'UN SABİTLERİ BURAYA KOPYALANMADI: `src/app/layout.tsx` bu şeridin
 * dosyası değil (çoklu-kök restructure ayrı iş). Oradaki dizeleri buraya kopyalasaydık, o
 * dosya değiştiğinde bu test SESSİZCE bayatlar ve "hâlâ doğru ölçüyorum" sanılırdı.
 *
 * ⚠ KAPSAM SAYIMINDA GLOB YOK — `fs` ile yürünüyor. `[lang]` köşeli parantezi glob
 * dünyasında KARAKTER SINIFIDIR (`l`|`a`|`n`|`g`); aynı gün `git` pathspec'inde ölçüldü:
 * 10 dosyadan 2'sini gördü ve hata vermeden EKSİK liste döndü.
 */

const LANG_KOK = path.resolve(__dirname, '../../app/[lang]')

/** `[lang]` altındaki tüm `page.tsx` yolları — glob değil, dizin yürüyüşü. */
function sayfalariBul(kok: string): string[] {
  const bulunan: string[] = []
  const yuru = (dizin: string): void => {
    for (const giris of fs.readdirSync(dizin, { withFileTypes: true })) {
      const tam = path.join(dizin, giris.name)
      if (giris.isDirectory()) yuru(tam)
      else if (giris.name === 'page.tsx') bulunan.push(tam)
    }
  }
  yuru(kok)
  return bulunan
}

describe('INV-LANG-META-1 · site geneli metadata dile göre üretilir', () => {
  it('[lang]/layout.tsx generateMetadata TANIMLAR', () => {
    // Tanımlı değilse 42 sayfa sessizce kök layout'un Türkçe varsayılanına döner.
    expect(
      typeof generateMetadata,
      'generateMetadata kaldırılmış — /en altındaki metadata\'sız sayfalar yeniden Türkçe başlık basar',
    ).toBe('function')
  })

  it('OG yereli DİLE GÖRE değişir — ve tr tarafı da ölçülür (vacuous kanaryası)', async () => {
    const enMeta = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })
    const trMeta = await generateMetadata({ params: Promise.resolve({ lang: 'tr' }) })

    expect(enMeta.openGraph?.locale, '/en sayfaları hâlâ tr_TR OG yereli basıyor').toBe('en_US')
    // Bu satır olmadan "her zaman en_US döndüren" bir uygulama da yukarıdaki iddiayı geçerdi.
    expect(trMeta.openGraph?.locale, 'tr tarafı bozuldu — kapı tek yönlü ölçüyor olurdu').toBe('tr_TR')
  })

  it('3a · OKUMA YOLU BAĞLI: dönen başlık/açıklama SÖZLÜKTEKİ anahtara eşit', async () => {
    const enMeta = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })
    const trMeta = await generateMetadata({ params: Promise.resolve({ lang: 'tr' }) })

    // Anahtarın sözlükte var olması yetmez; okuma yolunun BAĞLI olduğunu ölçüyoruz.
    expect(enMeta.title, 'en başlığı sözlükten gelmiyor — okuma yolu bağlı değil').toBe(en.meta.siteTitle)
    expect(enMeta.description, 'en açıklaması sözlükten gelmiyor').toBe(en.meta.siteDesc)
    expect(trMeta.title, 'tr başlığı sözlükten gelmiyor').toBe(tr.meta.siteTitle)
    expect(trMeta.description, 'tr açıklaması sözlükten gelmiyor').toBe(tr.meta.siteDesc)
  })

  it('3b · İKİ DİL FARKLI ÜRETİR — sabit döndüren uygulama geçemez', async () => {
    const enMeta = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })
    const trMeta = await generateMetadata({ params: Promise.resolve({ lang: 'tr' }) })

    expect(enMeta.title, 'iki dil AYNI başlığı üretiyor — dil ayrımı fiilen yok').not.toBe(trMeta.title)
    expect(enMeta.description, 'iki dil AYNI açıklamayı üretiyor').not.toBe(trMeta.description)
  })

  it('3c · KÖK VARSAYILANA DÜŞMÜYOR: alanlar tanımsız/boş değil', async () => {
    // Metadata birleştirmesinde alan tanımsız kalırsa kök layout'un TÜRKÇE değeri geçerli olur.
    // Yani "boş dönmek" sessizce eski kusura geri dönmektir — boş dize de Türkçe değildir.
    for (const lang of ['en', 'tr']) {
      const meta = await generateMetadata({ params: Promise.resolve({ lang }) })
      expect(String(meta.title ?? ''), `${lang}: başlık boş — kök layout'un Türkçe varsayılanı devreye girer`).not.toBe('')
      expect(String(meta.description ?? ''), `${lang}: açıklama boş`).not.toBe('')
      expect(meta.openGraph?.title, `${lang}: OG başlığı yok`).toBeTruthy()
    }
  })

  it('KAPSAM KANARYASI: kaç sayfa bu varsayılana bağımlı — oran sessizce kaymasın', () => {
    const sayfalar = sayfalariBul(LANG_KOK)
    const kendiMetadatasi = sayfalar.filter(y => fs.readFileSync(y, 'utf8').includes('generateMetadata'))
    const mirasAlan = sayfalar.length - kendiMetadatasi.length

    // Sayıyı sabitlemiyoruz (sayfa eklenir/çıkar); ölçümün YAPILABİLDİĞİNİ ve sonucun
    // anlamlı olduğunu sabitliyoruz. Yürüyüş bozulursa 0 döner ve kapı sessizce yeşil kalırdı.
    expect(sayfalar.length, '[lang] altında hiç page.tsx bulunamadı — dizin yürüyüşü bozulmuş').toBeGreaterThan(20)
    expect(
      mirasAlan,
      'metadata\'sını tanımlamayan sayfa KALMADI — öyleyse bu layout varsayılanı artık kimseyi kapsamıyor, kapının gerekçesi ölçülmeli',
    ).toBeGreaterThan(0)
  })
})
