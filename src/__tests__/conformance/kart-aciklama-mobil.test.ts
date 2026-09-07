import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KART-ACIKLAMA-MOBIL-1 — kategori kartının açıklaması HER cihazda görünür ve
 * okunurluğu tesadüfe bırakılmaz.
 *
 * ── KURALIN İKİ SÜRÜMÜ VAR; İKİNCİSİ BİRİNCİYİ KAPSIYOR ──
 *
 * v1 (2026-09-07 öğleden sonra, REC-266). Recep: *"görünmeyen açıklamalar mobilde
 * görünmesi lazım, bunu da çözün"*. Kutu `max-h-0 opacity-0` ile başlayıp yalnız
 * `group-hover` ile açılıyordu; dokunmatik cihazda hover YOKTUR. 390×844'te ölçüldü:
 * altı kartın altısında max-height 0px, opacity 0. Çözüm mobil-öncelikliydi: küçük ekran
 * açık, `md:` ve üstünde eski hover davranışı korunuyordu. Kapı o gün `md:` ön ekinin
 * silinmesini yasaklıyordu.
 *
 * v2 (2026-09-07 akşam, RECEP KARARI — lafzıyla): *"zaten bizdeki A seçeneği ve ben
 * bundan rahatsızım.. Yani B"*. İki varyant canlı sayfaya uygulanıp 390px'te fotoğraflandı,
 * Recep yan yana görüp seçti. **B = metin fotoğrafın ÜSTÜNDE DEĞİL, ALTINDA düz zeminde.**
 *
 * NİÇİN v1 YETMEDİ: v1 metni GÖRÜNÜR yaptı ama hâlâ fotoğrafın üstündeydi ve karartma
 * katmanı yoktu. Yani okunurluk HER KARTIN KENDİ FOTOĞRAFINA bağlıydı — birinde okunur,
 * diğerinde kaybolur. WCAG AA metin/zemin kontrastının en az 4,5:1 olmasını ister ve düz
 * fotoğraf üstüne yazıda bu GARANTİ EDİLEMEZ. Canlı a11y taramasında anasayfa 96/100'dü
 * ve üç kırmızıdan biri kontrasttı. "Görünüyor" ile "okunuyor" ayrı iddialar.
 *
 * v2'nin YAN SONUCU: masaüstü ve mobil artık AYNI. Hover'a bağlı gizleme kalmadığı için
 * v1'in `md:` kırılımı gereksizleşti ve KALDIRILDI. Bu kapı o yüzden GENİŞLEDİ: artık
 * "mobilde açık olsun" değil, **"hiçbir genişlikte gizli başlamasın VE metin fotoğrafın
 * üstünde durmasın"** ölçülüyor. Kapı silinmedi; kural büyüdü.
 *
 * ── KAPININ SINIRI, ADIYLA ──
 * Bu kapı STATİKTİR: sınıf dizesini okur, PİKSEL ÖLÇMEZ ve KONTRAST HESAPLAMAZ. Gerçek
 * okunurluk kanıtı tarayıcı ölçümüdür ve yayın sonrası ayrıca yapılır. Buradaki ölçüm
 * yalnız kusur SINIFININ sessizce geri gelmesini engeller.
 */

const DOSYA = join(process.cwd(), 'src', 'components', 'home', 'GuidedCategoryDiscovery.tsx')
const kaynak = readFileSync(DOSYA, 'utf8')

/** `className="..."` dizelerinin tamamı — kural bunların üzerinde ölçülür. */
function sinifDizeleri(): string[] {
  return [...kaynak.matchAll(/className="([^"]*)"/g)].map((m) => m[1])
}

/** Açıklama paragrafını taşıyan sarmalın bulunduğu satır. */
function aciklamaSatiri(): string {
  const satirlar = kaynak.split('\n')
  const i = satirlar.findIndex((s) => s.includes('category.description'))
  if (i < 0) throw new Error('Açıklama paragrafı bulunamadı — bileşenin yapısı değişmiş olabilir.')
  // Paragrafın kendisi ve onu saran kutu: ikisi birlikte ölçülür.
  return satirlar.slice(Math.max(0, i - 3), i + 2).join('\n')
}

/** Gizleme sınıfı: ön ekli (`md:`, `lg:`, `hover:` …) ya da ön eksiz, ikisi de yasak. */
const GIZLEME = /(^|\s|:)(max-h-0|opacity-0)(\s|"|$)/

describe('INV-KART-ACIKLAMA-MOBIL-1 — kart açıklaması her cihazda görünür, fotoğraf üstünde durmaz', () => {
  it('K1 (ön-koşul) — ölçtüğüm yapı GERÇEKTEN duruyor (evren boş değil)', () => {
    // Bileşen yeniden yazılırsa kapı sessizce anlamsızlaşır; önce varlığını kanıtlar.
    // Bu kol OLMADAN aşağıdaki "ihlal yok" sonucu, "dosya boş" ile aynı şeye benzerdi.
    expect(kaynak).toContain('category.description')
    expect(kaynak).toContain('GuidedCategoryDiscovery')
    expect(sinifDizeleri().length).toBeGreaterThan(5)
  })

  it('K2 (kural) — açıklama HİÇBİR genişlikte gizli başlamaz', () => {
    // v1'de yalnız ön EKSİZ `max-h-0`/`opacity-0` yasaktı (mobil açık kalsın diye).
    // v2'de metin fotoğraftan indiği için gizlemenin HİÇBİR sürümü meşru değil:
    // `md:opacity-0` da, `lg:max-h-0` da aynı kusuru başka bir ekranda üretir.
    const parca = aciklamaSatiri()
    expect(
      GIZLEME.test(parca),
      'Kart açıklaması gizli başlıyor. Recep kararı (B): metin fotoğrafın altında, ' +
        'her genişlikte AÇIK. Gizleme kuralı hiçbir ön ekle geri gelemez.',
    ).toBe(false)
  })

  it('K3 (kural) — açıklama metni fotoğrafın ÜZERİNE binmez', () => {
    // B'nin özü bu: yazı görselin üstünde YÜZMEZ, kontrast fotoğrafa kalmaz.
    //
    // ⚠BU KOL BİR KEZ FAIL-OPEN YAZILDI ve sabotaj onu yakaladı: ilk hâli yalnız
    // paragrafın ±3 satırına bakıyordu, oysa metin panelinin sınıfı daha yukarıdaydı —
    // yani "ihlal yok" diyordu çünkü İHLALİN DURDUĞU YERE BAKMIYORDU. Ölçüt keskindi,
    // evren yanlıştı. Şimdi TÜM sınıf dizeleri taranıyor.
    //
    // Ayırt edici imza: mutlak kaplama + metin yığını (`flex-col` / ortalama / hizalama).
    // Köşe vurguları (`absolute top-6 right-6`) ve görsel sarmalı bu desene UYMAZ.
    const metinKaplamasi = sinifDizeleri().filter(
      (c) =>
        /\babsolute\b/.test(c) &&
        /\binset-0\b/.test(c) &&
        /(flex-col|text-center|justify-center|items-center)/.test(c),
    )
    expect(
      metinKaplamasi,
      'Metin yığını mutlak konumla fotoğrafın üstüne yerleştirilmiş (A düzeninin imzası). ' +
        'Recep kararı B: kontrast fotoğrafa değil, düz bir zemine bağlı olmalı.',
    ).toEqual([])
  })

  it('K4 (ayırt edicilik) — kural gerçekten ölçüyor, her dizeyi geçirmiyor', () => {
    // K2/K3 yeşilse bunun sebebi "desen hiçbir şeyi eşleştiremiyor" olabilir.
    // Bu kol, desenlerin bilinen kusurlu yazılışları YAKALADIĞINI kanıtlar.
    expect(GIZLEME.test('mt-6 max-h-0 opacity-0 group-hover:max-h-24')).toBe(true)
    expect(GIZLEME.test('mt-6 md:max-h-0 md:opacity-0')).toBe(true)
    expect(GIZLEME.test('mt-3 text-xs line-clamp-2')).toBe(false)
    // `opacity-90` gibi masum değerler yanlışlıkla yakalanmamalı.
    expect(GIZLEME.test('flex flex-col opacity-90')).toBe(false)
    expect(/absolute[^"]*inset-0/.test('absolute inset-0 z-10 p-10 flex')).toBe(true)
    expect(/absolute[^"]*inset-0/.test('bg-white px-5 py-4 text-left')).toBe(false)
  })
})
