import { describe, expect, it } from 'vitest'

/**
 * INV-KATEGORI-MARKETING-EMEKLI-1 — `marketing_title` EMEKLİ, hiçbir RENDER yolu okumaz
 *
 * KORUNAN DEĞİŞMEZ:
 *   "Kategori adı TEK zincirden gelir (`translation_key → menu_label → name`).
 *    `marketing_title` hiçbir görünen yüzeye bağlanamaz."
 *
 * KARAR (Recep, 2026-09-09 — cetvel `kategori-adlandirma-standard.md` §4):
 *   Alan 23 kategorinin 12'sinde DOLUYDU ve hiçbir yüzeyde görünmüyordu. İki yol sunuldu —
 *   (a) `h1`'e bağla, (b) emekli et — ve **(b)** seçildi. Bağlamak, kategori adını İKİ BAŞLI
 *   yapardı: menüde kısa ad, sayfada uzun pazarlama başlığı.
 *
 * NİÇİN KAPI GEREKLİ (ve niçin bu iş kapısız bitmiş sayılmaz):
 *   "Emekli" bir NİYETTİR; niyet kod tabanında yaşamaz. Çözücü silindi ama kolon DB'de,
 *   tipte ve SELECT listelerinde duruyor — yani alan hâlâ ELVERİŞLİ. Kapı olmadan altı ay
 *   sonra biri `vm.raw.marketing_title || displayName` yazar, kimse fark etmez ve karar
 *   sessizce çürür. Bu depoda tam bu şekil bir kez yaşandı: `marketing_title`'ın kendisi
 *   "bağlanmayan alan eklenmez" kuralının YOKLUĞUNDA doğdu (cetvel §5).
 *
 * KAPSAM — NEREYE BAKAR, NEREYE BAKMAZ (sınırı açık yazıyorum):
 *   BAKAR:   `src/views/**`, `src/components/**`, `src/app/**` (RENDER yüzeyleri)
 *   BAKMAZ:  `src/types/**` (kolon tipte kalır), `src/lib/data/preload.ts` ve
 *            `src/lib/services/**` SELECT listeleri (kolon okunmaya devam eder),
 *            `src/hooks/useCategoryViewModel.ts` (alanı zaten üretmiyor),
 *            testler ve `.md` companion dosyaları.
 *   Yani kapı "kolon okunuyor mu" diye sormaz — **"okunan değer EKRANA gidiyor mu"** diye sorar.
 *   Emeklilik kolonu yasaklamaz, RENDER'ı yasaklar.
 *
 * BOŞ EVREN KORUMASI: taranan dosya sayısı 0 ise test KIRMIZI olur — "ihlal yok" ile
 * "hiç bakmadım" aynı çıktıyı vermemelidir.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const RENDER_DOSYALARI: Record<string, string> = {
  ...import.meta.glob('/src/views/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }),
  ...import.meta.glob('/src/components/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }),
  ...import.meta.glob('/src/app/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }),
}

/** Test dosyaları kapsam dışı — bir kuralı SINAYAN dosya, o kuralı İHLAL sayılmaz. */
function testDosyasi(yol: string): boolean {
  return /__tests__|\.test\.|\.spec\./.test(yol)
}

/**
 * SELECT listeleri kolon adını taşır ve bu MEŞRUDUR (kolon okunmaya devam eder).
 * Ayırt edici: satırda `.select(` ya da uzun kolon dizisi varsa bu bir SORGU satırıdır,
 * bir render değil. Bu ayrım olmadan kapı, emekliliğin yasaklamadığı bir şeyi yasaklardı.
 */
function sorguSatiri(satir: string): boolean {
  return /\.select\(/.test(satir) || /'id, name, parent_id/.test(satir) || /"id, name, parent_id/.test(satir)
}

/** Yorum satırı — kararı ANLATAN metin, kararı İHLAL eden kod değildir. */
function yorumSatiri(satir: string): boolean {
  const s = satir.trim()
  return s.startsWith('//') || s.startsWith('*') || s.startsWith('/*')
}

/**
 * KOLON EŞLEMESİ — `marketing_title: <ifade>.marketing_title` deseni.
 *
 * Bu satır kolonu bir satır nesnesinden `DbCategory` sözleşmesine TAŞIR; ekrana hiçbir şey
 * basmaz. İlk yazışta bu muafiyet yoktu ve kapı `page.tsx:236`'yı ihlal saydı — haksızdı,
 * çünkü emeklilik kolonu değil RENDER'ı yasaklar ve orada kolon yalnız tipi doldurmak için
 * kopyalanıyor. Muafiyet KASTEN DAR: sağ tarafta yine `.marketing_title` olmalı. Yani
 * `marketing_title: vm.displayName` ya da `title: c.marketing_title` bu muafiyete GİRMEZ.
 */
function kolonEslemesi(satir: string): boolean {
  return /marketing_title\s*:\s*[A-Za-z_$][\w$]*(\?\.|\.)marketing_title\b/.test(satir)
}

describe('INV-KATEGORI-MARKETING-EMEKLI-1 — marketing_title emekli', () => {
  it('K1: BOŞ EVREN DEĞİL — render dosyaları gerçekten tarandı', () => {
    expect(
      Object.keys(RENDER_DOSYALARI).length,
      'Hiç dosya taranmadı: "ihlal yok" sonucu ölçümden değil, boş evrenden geliyor olurdu',
    ).toBeGreaterThan(50)
  })

  it('K2: hiçbir render yüzeyi `marketing_title` / `marketingTitle` okumuyor', () => {
    const ihlaller: string[] = []

    for (const [yol, kaynak] of Object.entries(RENDER_DOSYALARI)) {
      if (testDosyasi(yol)) continue
      const satirlar = kaynak.split(/\r?\n/)
      satirlar.forEach((satir, i) => {
        if (!/marketing_title|marketingTitle/.test(satir)) return
        if (yorumSatiri(satir)) return
        if (sorguSatiri(satir)) return
        if (kolonEslemesi(satir)) return
        ihlaller.push(`${yol}:${i + 1}  ${satir.trim().slice(0, 100)}`)
      })
    }

    expect(
      ihlaller,
      'marketing_title EMEKLİ (Recep 2026-09-09, cetvel §4) — render yüzeyine bağlanamaz. ' +
        'Kategori adı TEK zincirden gelir: translation_key → menu_label → name. ' +
        'Bağlamak adı iki başlı yapar (menüde kısa, sayfada uzun) ve §2 kuralını zayıflatır.\n' +
        ihlaller.join('\n'),
    ).toEqual([])
  })

  it('K3: ölü çözücü geri gelmedi — `getCategoryMarketingTitle` artık YOK', () => {
    const helpers: Record<string, string> = import.meta.glob(
      '/src/utils/categoryHelpers.ts',
      { query: '?raw', import: 'default', eager: true },
    )
    const kaynak = Object.values(helpers)[0]
    expect(kaynak, 'BOŞ EVREN: categoryHelpers.ts okunamadı').toBeTruthy()

    // Yorumda adı geçebilir (emekliliği ANLATIYOR); yasak olan bir EXPORT olarak dönmesi.
    const disaAcilmis = /export\s+(const|function)\s+getCategoryMarketingTitle\b/.test(kaynak)
    expect(
      disaAcilmis,
      'Emekli çözücü yeniden dışa açılmış — emeklilik kararı sessizce geri alınıyor demektir',
    ).toBe(false)
  })
})
