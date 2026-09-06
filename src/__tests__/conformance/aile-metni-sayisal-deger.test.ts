/**
 * INV-AILE-SAYI-1 — seri (aile) metnindeki teknik değer, TEK MODELİN değeri olamaz.
 *
 * OLAY (ölçülmüş, 2026-09-06 · REC-157): aile sayfalarında müşteri şunu okuyor —
 *   `slimroof-roof`: *"Nominal debisi **460 m3/h** olup…"* — serinin gerçek aralığı
 *   **460–18.600 m³/h**. Yazılan sayı serinin **en küçük** modelininki; alıcı 40 kat
 *   yanlış bir kapasite okuyor. `slimroof-smoke` aynı: *"Maksimum debisi 2580"*,
 *   gerçek aralık **2.580–22.550** (8,7 kat), yine **en küçük** model.
 *
 * ⭐ÖLÇÜT NİÇİN "ARALIKTA MI" DEĞİL — İLK TASARIM ÇÜRÜDÜ (ölçülerek):
 * Emirdeki ilk öneri «metindeki sayı ürünlerin `technical_specs` aralığından türemiş
 * değilse KIRMIZI» idi. Prod'da koştum: **raporlanan ailelerin HİÇBİRİNİ yakalamadı.**
 * Sebep basit ve önemli — `460`, `460–18.600` aralığının **İÇİNDE**. Kusuru sinsi yapan
 * şey tam da bu: sayı "yanlış" değil, **eksik**; seriyi tek modele indiriyor.
 * Üstelik o ölçüt iki **yanlış-pozitif** üretti (`25 mm` taşyünü izolasyon kalınlığını
 * çap sanmak gibi) — kurt masalı okuyan kapı, kapatılan kapıdır.
 *
 * DOĞRU ÖLÇÜT (ölçümle bulundu):
 *   Aile çok ürünlü **ve** o eksende yayılma ≥ 2 kat **ve** metin o eksen için bir sayı
 *   veriyor **ve** metinde ARALIK ifadesi yok  →  KIRMIZI.
 * Doğrulandı: `lineo-quiet` (yayılma 11×) **yeşil**, çünkü metni "100–315 mm" ve
 * "260–2890 m³/h" diye **aralık** yazıyor — yani yazar yayılmanın farkında.
 *
 * ⚖EŞİK 2 KAT, BİLİNÇLİ SEÇİM: bir modelin çapı diğerinin iki katıysa tek sayı yazmak
 * alıcıyı yanıltır. Daha gevşek eşik gerçek kusurları kaçırır, daha sıkı eşik
 * (ör. 1,5×) dar serilerde gürültü üretir. Eşik değişirse borç listesi de değişir.
 *
 * ⚠SINIRLAR, ADIYLA:
 *  1. Bu kapı **damgalı bir veri paketi** üzerinde koşar (fixture), CANLI DB'ye bakmaz.
 *     Ölçtüğü şey: bilinen borcun büyümemesi + ölçüt mantığının bozulmaması.
 *     "Yeşil" = "canlıda kusur yok" DEMEK DEĞİLDİR. Canlı kol ayrı iştir (CI adımı
 *     ALTYAPI'nın workflow dosyasında; devredildi).
 *  2. "Aralık ifadesi var" kolu **bilerek gevşek**: metnin herhangi bir yerinde aralık
 *     görürse o aileyi aklar — o aralık başka bir eksene ait olabilir. Gevşeklik
 *     yanlış-KIRMIZI vermemek içindir; yani gerçek borç ölçülenden **biraz büyük**
 *     olabilir, asla daha küçük değil.
 *  3. Yalnız iki eksen ölçülür: çap (mm) ve debi (m³/h). Diğer eksenler (Pa, dB, kg)
 *     metinlerde henüz geçmiyor — ölçüldü; geçmeye başlarsa buraya eklenir.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

type Aile = {
  slug: string
  urun: number
  cap_min: number | null
  cap_max: number | null
  debi_min: number | null
  debi_max: number | null
  metin_tr: string
}
type Paket = { damga: string; kaynak: string; aileler: Aile[] }

const PAKET_YOLU = join(
  process.cwd(),
  'src', '__tests__', 'fixtures', 'aile-metni-sayisal-2026-09-06.json',
)
const paket: Paket = JSON.parse(readFileSync(PAKET_YOLU, 'utf8'))

/** Metinde aralık ifadesi: "100–315", "460-18600" ya da "arası/ile/kadar". */
const ARALIK_IFADESI = /[0-9][0-9.\s]*[–—-][0-9]|aras[ıi]|ile|kadar/i

/** Eşik: yayılma bu katı BULURSA tek değer yazmak yanıltıcıdır. */
const YAYILMA_ESIGI = 2

type Eksen = { ad: 'cap_mm' | 'debi_m3h'; desen: RegExp; min: keyof Aile; max: keyof Aile }
const EKSENLER: Eksen[] = [
  { ad: 'cap_mm', desen: /([0-9]+(?:[.,][0-9]+)?)\s*mm/g, min: 'cap_min', max: 'cap_max' },
  { ad: 'debi_m3h', desen: /([0-9]+(?:[.,][0-9]+)?)\s*m[3³]\/h/g, min: 'debi_min', max: 'debi_max' },
]

export type Ihlal = { slug: string; eksen: string; metinde: number[]; min: number; max: number; yayilma: number }

/** ÖLÇÜT — saf fonksiyon, kapının kalbi. Sentetik vakalarla ayrıca sınanır. */
export function ihlalleriBul(aileler: Aile[]): Ihlal[] {
  const sonuc: Ihlal[] = []
  for (const a of aileler) {
    if (a.urun <= 1) continue
    if (ARALIK_IFADESI.test(a.metin_tr)) continue // yazar yayılmanın farkında
    for (const e of EKSENLER) {
      const min = a[e.min] as number | null
      const max = a[e.max] as number | null
      if (min == null || max == null || min <= 0) continue
      const yayilma = max / min
      if (yayilma < YAYILMA_ESIGI) continue
      const bulunan = [...a.metin_tr.matchAll(e.desen)].map((m) => Number(m[1].replace(',', '.')))
      if (bulunan.length === 0) continue
      sonuc.push({ slug: a.slug, eksen: e.ad, metinde: bulunan, min, max, yayilma: Math.round(yayilma * 10) / 10 })
    }
  }
  return sonuc
}

/**
 * DONDURULMUŞ BORÇ — 2026-09-06'da ÖLÇÜLEN, henüz düzeltilmemiş aile metinleri.
 * Düzeltme Katalog şeridinin taslak işinde; metin düzelince buradan da SİLİNMEK ZORUNDA
 * (aşağıdaki "borç bayatlamaz" kolu bunu zorlar). Liste yalnız KÜÇÜLEBİLİR.
 */
const DONMUS_BORC: ReadonlySet<string> = new Set([
  'avens-plug-fanlar|cap_mm',                          // metinde 315; aralık 315–630 (2,0×)
  'vortice-vort-e-atex|cap_mm',                        // metinde 250; aralık 250–630 (2,5×)
  'vortice-vort-heatmaster-slimroof-roof|debi_m3h',    // metinde 460; aralık 460–18.600 (40,4×)
  'vortice-vort-heatmaster-slimroof-smoke|debi_m3h',   // metinde 2580; aralık 2.580–22.550 (8,7×)
  'vortice-vort-industrial-ventilation-axial|cap_mm',  // metinde 350; aralık 300–600 (2,0×)
  'vortice-vort-qbk-sal-kc-evo|cap_mm',                // metinde 315 (+25 izolasyon); aralık 315–630 (2,0×)
])

const anahtar = (i: Ihlal) => `${i.slug}|${i.eksen}`

describe('INV-AILE-SAYI-1 · aile metni tek modelin sayısını serinin sayısı gibi sunmaz', () => {
  const ihlaller = ihlalleriBul(paket.aileler)

  it('⭐ASIL İDDİA — YENİ ihlal yok (borç listesi dışında)', () => {
    const yeni = ihlaller.map(anahtar).filter((k) => !DONMUS_BORC.has(k))
    expect(
      yeni,
      'Aile metninde YENI bir "tek modelin sayisi" ihlali dogdu. Metin ya ARALIK yazmali\n' +
        '("460–18.600 m³/h") ya da o sayiyi hic vermemeli. Isabetler:\n  ' +
        ihlaller.filter((i) => yeni.includes(anahtar(i)))
          .map((i) => `${i.slug} [${i.eksen}] metinde ${i.metinde.join(', ')} — aralik ${i.min}–${i.max} (${i.yayilma}×)`)
          .join('\n  '),
    ).toEqual([])
  })

  it('⭐⭐BORÇ BAYATLAMAZ — düzelen aile listeden SİLİNMELİ (tek yönlü mandal)', () => {
    // Kazanilan zemin sessizce geri verilemesin: bir metin duzeltilince borc kaydi da
    // kucultulmeli, yoksa yarin ayni aile yeniden bozulur ve kapi SUSAR.
    const olculen = new Set(ihlaller.map(anahtar))
    const gereksiz = [...DONMUS_BORC].filter((k) => !olculen.has(k))
    expect(
      gereksiz,
      'Bu kalemler artik ihlal DEGIL — DONMUS_BORC listesinden CIKAR (borc yalniz kuculur):\n  ' +
        gereksiz.join('\n  '),
    ).toEqual([])
  })

  it('⭐AYIRT EDİCİ — ölçüt sentetik vakalarda doğru karar veriyor', () => {
    const kur = (metin: string, min: number, max: number): Aile => ({
      slug: 'sinama', urun: 5, cap_min: min, cap_max: max, debi_min: null, debi_max: null, metin_tr: metin,
    })
    // (a) genis yayilma + tek deger + aralik ifadesi YOK → KIRMIZI
    expect(ihlalleriBul([kur('250 mm nominal çaplı fan.', 250, 630)]).length).toBe(1)
    // (b) AYNI yayilma ama metin ARALIK yaziyor → YESIL  (lineo-quiet vakasi)
    expect(ihlalleriBul([kur('100–315 mm çap seçenekleri sunar.', 100, 315)]).length).toBe(0)
    // (c) DAR yayilma (<2×) + tek deger → YESIL (punto-evo-flexo vakasi)
    expect(ihlalleriBul([kur('100 mm çaplı aspiratör.', 100, 120)]).length).toBe(0)
    // (d) metin o eksende sayi VERMIYOR → YESIL (soylenmemis sey olculmez)
    expect(ihlalleriBul([kur('IPX7 korumalı radyal fan.', 97, 197)]).length).toBe(0)
    // (e) tek urunlu aile → YESIL (seri degil, yayilma kavrami yok)
    expect(ihlalleriBul([{ ...kur('250 mm çaplı.', 250, 630), urun: 1 }]).length).toBe(0)
  })

  it('⭐BİLİNEN KUSURLAR GERÇEKTEN YAKALANIYOR (sabotaj değil, saha vakası)', () => {
    // Kapinin "0 ihlal" demesi, olcutun KOR olmasindan da gelebilirdi. Bu kol, bilinen
    // iki saha vakasinin GERCEKTEN yakalandigini olcer.
    const olculen = new Set(ihlaller.map(anahtar))
    expect(olculen.has('vortice-vort-heatmaster-slimroof-roof|debi_m3h'), 'slimroof-roof yakalanmadi').toBe(true)
    expect(olculen.has('vortice-vort-heatmaster-slimroof-smoke|debi_m3h'), 'slimroof-smoke yakalanmadi').toBe(true)
    // Ve lineo-quiet YESIL kalmali (OPS'un dogru ornegi).
    expect([...olculen].some((k) => k.startsWith('vortice-lineo-quiet')), 'lineo-quiet yanlislikla kirmizi').toBe(false)
  })

  it('BOŞLUK MUHAFIZI — veri paketi gerçekten okundu ve damgalı', () => {
    expect(paket.aileler.length, 'Paket bos okundu.').toBeGreaterThan(10)
    expect(/^\d{4}-\d{2}-\d{2}T/.test(paket.damga), 'Damga yok/bozuk — paketin ne zaman alindigi bilinmiyor.').toBe(true)
    expect(paket.aileler.every((a) => typeof a.metin_tr === 'string' && a.metin_tr.length > 20), 'Metinler bos.').toBe(true)
  })
})
