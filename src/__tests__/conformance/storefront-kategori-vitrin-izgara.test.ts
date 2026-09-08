import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KATEGORI-VITRIN-IZGARA-1 — ana sayfa kategori vitrini HER genişlikte ızgaradır;
 * yatay kaydırma geri gelemez.
 *
 * ⭐RECEP KARARI (2026-09-08), lafzıyla tek harf: **"A"**. Üç çerçeveli bir karşılaştırma
 * görseli üzerinden seçti: bugünkü karusel · A (iki sütunlu ızgara) · B (işaretli karusel).
 *
 * NİÇİN — ölçülmüş, tercih değil:
 * · Vitrinde **6 kart** var (canlı `/tr`, `h3` sayımı). İki sütunda üç satır eder; hepsi aşağı
 *   kaydırmayla görünür ve aşağı kaydırma telefonun doğal hareketidir.
 * · Yatay kaydırmada kullanıcıya devamı olduğunu söyleyen **hiçbir işaret yoktu** — ne yarım
 *   görünen sonraki kart, ne nokta, ne kenar solması. İçerik saklanıyordu.
 * · Masaüstü ZATEN ızgaraydı; mobili ızgara yapmak iki ayrı davranışı **teke** indirir.
 *
 * ⚠BU KAPI BİR YANLIŞ İNANCI DA KİLİTLER (K5) — ve o inanç bu depoda GERÇEKTEN yaşandı:
 * eski işaretlemede `hide-scrollbar` sınıfı vardı ve iki şerit birden (ALTYAPI, sonra ben)
 * Recep'e "çubuğu gizleyen sınıf zaten var, gördüğün emülasyonun çubuğu" dedik. **Yanlıştı.**
 * Ölçüldü: `hide-scrollbar` deponun HİÇBİR yerinde tanımlı değil — tek CSS dosyası
 * `src/index.css` ve içinde böyle bir kural yok. Dahası tersi var: aynı dosya
 * `::-webkit-scrollbar` genişliğini 8px yapıp tutamağa gradyan veriyor ve `*` için
 * `scrollbar-width: thin` diyor. Yani çubuk gizlenmiyor, **görünür kılınıyordu**; Recep'in
 * gözlemi doğruydu, bizim açıklamamız onu haksız çıkarıyordu.
 *
 * DERS, adıyla: bir sınıfın **işaretlemede olması**, o sınıfın **bir şey yaptığını**
 * kanıtlamaz. "Kodda var" ile "etkisi var" ayrı iddialardır; ikincisi tanımı görmeyi ister.
 *
 * ── SINIR ──
 * Bu kapı STATİKTİR: sınıf dizesini okur, PİKSEL ÖLÇMEZ. Kartın 390px'te gerçekten okunur
 * olduğu tarayıcı ölçümüyle doğrulanır ve o ölçüm ayrıca yapılır.
 */

const DOSYA = join(process.cwd(), 'src', 'components', 'home', 'GuidedCategoryDiscovery.tsx')
const kaynak = readFileSync(DOSYA, 'utf8')

/** Yorumları siler; açıklayıcı metinlerdeki desen adları kapıyı tetiklemesin. */
function koduSoyutla(icerik: string): string {
  return icerik
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(?<!:)\/\/[^\n]*/g, ' ')
}

/** `className="..."` ve `className={`...`}` içindeki sınıf dizeleri. */
function sinifDizeleri(): string[] {
  const kod = koduSoyutla(kaynak)
  return [
    ...[...kod.matchAll(/className="([^"]*)"/g)].map((m) => m[1]),
    ...[...kod.matchAll(/className=\{`([^`]*)`\}/g)].map((m) => m[1]),
  ]
}

/** Yatay karuselin imzası: kaydırma kabı ya da kaydırma-yakalama. */
const YATAY_KAYDIRMA = /\boverflow-x-auto\b|\bsnap-x\b|\bsnap-mandatory\b|\bsnap-center\b/

/** Karuselin kart genişliği imzası — ızgarada genişliği SÜTUN verir. */
const SABIT_KART_GENISLIGI = /\bw-\d{2,4}px\b|\bflex-shrink-0\b/

describe('INV-KATEGORI-VITRIN-IZGARA-1 — kategori vitrini ızgara, yatay kaydırma geri gelemez', () => {
  it('K1 (ön-koşul) — ölçtüğüm bileşen ve kap gerçekten duruyor', () => {
    // Bu kol olmadan aşağıdaki "ihlal yok" sonucu, "dosya boşaldı" ile aynı görünürdü.
    expect(kaynak).toContain('GuidedCategoryDiscovery')
    expect(kaynak).toContain('displayCategories.map')
    expect(sinifDizeleri().length).toBeGreaterThan(5)
  })

  it('K2 (kural) — kart kabı IZGARA, kaydırma kabı DEĞİL', () => {
    const kap = sinifDizeleri().find((c) => /\bgrid-cols-2\b/.test(c))
    expect(
      kap,
      'Kategori vitrininin kabında `grid-cols-2` yok. Recep kararı (A): mobilde de ızgara.',
    ).toBeTruthy()
    expect(/\bgrid\b/.test(kap ?? '')).toBe(true)
  })

  it('K3 (kural) — hiçbir sınıf dizesinde yatay kaydırma imzası YOK', () => {
    const ihlaller = sinifDizeleri().filter((c) => YATAY_KAYDIRMA.test(c))
    expect(
      ihlaller,
      'Yatay kaydırma imzası geri gelmiş. Karusel kalkmıştı; geri gelirse kullanıcıya ' +
        'devamı olduğunu söyleyen bir işaret de gelmek ZORUNDA (yarım kart / nokta / solma).',
    ).toEqual([])
  })

  it('K4 (kural) — kartta sabit genişlik yok; genişliği sütun verir', () => {
    const ihlaller = sinifDizeleri().filter((c) => SABIT_KART_GENISLIGI.test(c))
    expect(
      ihlaller,
      'Kartta sabit genişlik (`w-280px` / `flex-shrink-0`) var. Izgara hücresinde sabit ' +
        'genişlik taşmaya yol açar; genişlik sütundan gelmeli.',
    ).toEqual([])
  })

  it('K5 (yanlış inanç kilidi) — TANIMSIZ `hide-scrollbar` sınıfı geri gelemez', () => {
    // Bu kol bir SINIFI değil, bir İNANCI kilitler: "çubuğu gizleyen sınıfımız var".
    // Ölçüldü ve yanlıştı — deponun tek CSS dosyasında böyle bir kural yok. Sınıfı geri
    // koyan biri hiçbir şey gizlemez ama gizlediğini SANIR; en pahalı hata sınıfı budur.
    expect(
      koduSoyutla(kaynak).includes('hide-scrollbar'),
      '`hide-scrollbar` geri konmuş. Bu sınıf deponun HİÇBİR yerinde TANIMLI DEĞİL ' +
        '(tek CSS dosyası src/index.css; içinde böyle bir kural yok) — hiçbir şey gizlemez. ' +
        'Çubuk gerçekten gizlenecekse önce KURALI yaz, sonra sınıfı kullan.',
    ).toBe(false)
  })

  it('K6 (ayırt edicilik) — desenler eski işaretlemeyi GERÇEKTEN yakalıyor', () => {
    // K3/K4 yeşilse sebebi "ihlal yok" olabileceği gibi "desen hiçbir şeyi eşleştirmiyor"
    // da olabilir; ikisi dışarıdan aynı görünür. Burada eski dize BİLEREK sınanır.
    const eskiKap = 'flex overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar gap-4 md:grid md:grid-cols-2'
    const eskiKart = 'group relative flex-shrink-0 w-280px sm:w-320px md:w-auto snap-center'
    expect(YATAY_KAYDIRMA.test(eskiKap), 'eski kabı YAKALAMADI').toBe(true)
    expect(SABIT_KART_GENISLIGI.test(eskiKart), 'eski kartı YAKALAMADI').toBe(true)
    // Ve bugünkü meşru dizeleri SERBEST bırakmalı:
    expect(YATAY_KAYDIRMA.test('grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-2')).toBe(false)
    expect(SABIT_KART_GENISLIGI.test('group relative overflow-hidden bg-white')).toBe(false)
  })
})
