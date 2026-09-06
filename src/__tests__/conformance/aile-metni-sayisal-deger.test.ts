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
  'src', '__tests__', 'fixtures', 'aile-metni-sayisal-2026-09-06T0945Z.json',
)
const paket: Paket = JSON.parse(readFileSync(PAKET_YOLU, 'utf8'))

/**
 * Metinde aralık ifadesi: "100–315", "460-18600" ya da "arası / ile / kadar".
 *
 * ⛔**KELİME SINIRI ŞART — bu desen 2026-09-06'da SESSİZCE BOZUKTU ve sabotajla bulundu.**
 * Önceki hâli `ile` ve `kadar`ı **kelime içinde** de eşleştiriyordu. Türkçede bu felaket:
 * `ailesi`, `abilen`, `edilebilen`, `ileri`, `vesile` — hepsi `ile` içerir. Sonuç: aile
 * "aralık yazmış" sayılıp muaf tutuluyor, yani kapı ONU HİÇ ÖLÇMÜYORDU.
 *
 * ÖLÇÜLDÜ (13 ailelik paket üzerinde): eski desen **8** aileyi muaf sayıyordu, doğrusu
 * **4**. Yani evrenin **%31'i sessizce atlanıyordu** — ve atlananların ikisi (`vort-e-atex`,
 * `qbk-sal-kc-evo`) tam da bu kapının izlediği eski borç kalemleriydi. Kapı onları
 * "düzeldi" diye değil, "bakmadım" diye temiz gösteriyor olabilirdi.
 *
 * Bugün filoda sekizinci kez aynı sınıf: **alt-dize eşleşmesi ölçüm değildir**
 * (`returns.created` ↔ `returns.createdToast` vakasının birebir kardeşi).
 */
const ARALIK_IFADESI = /[0-9][0-9.\s]*[–—-][0-9]|\baras[ıi]|\bile\b|\bkadar\b/i

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
 * DONDURULMUŞ BORÇ — ⭐**BOŞ. Altı kalemin ALTISI DA KAPANDI (2026-09-06 16:00).**
 *
 * Liste tek yönlü mandaldır: yalnız küçülebilir. Bugün sıfıra indi, çünkü URUN-KATALOG
 * 38 ailenin TR metnini yeniden yazıp prod'a uyguladı (REC-146 / K7.8) ve paket o
 * yazımdan SONRA yeniden üretildi.
 *
 * NASIL KAPANDI — iki farklı meşru yolla, ölçüldü:
 *  · `vort-e-atex` ve `qbk-sal-kc-evo`: metin artık o eksende **hiç sayı vermiyor**
 *    (mm / m³/h geçmiyor) — cetvel §2'nin ikinci seçeneği: *söylenmemiş şey yanıltmaz*.
 *  · `slimroof-roof`, `slimroof-smoke`, `plug-fanlar`, `industrial-ventilation-axial`:
 *    yeni metinlerinde **hiç rakam yok**, bu yüzden paketin evrenine (`metin ~ '[0-9]'`)
 *    girmiyorlar. Dördünü de ayrıca DB'den doğruladım: metin DOLU, uzunluk 150–318,
 *    yalnızca rakamsız. Yani "kayboldular" değil, DÜZELDİLER.
 *
 * ⚠**BOŞ LİSTE KAPIYI KÖRLEŞTİRMEZ:** aşağıdaki "ÖLÇÜT HÂLÂ GÖRÜYOR" kolu, kapanan iki
 * saha vakasının **eski metinlerini** kalıcı olarak taşır ve ölçütün onları hâlâ
 * yakaladığını her koşumda kanıtlar. Borç bittiğinde ayırt edicilik kanıtı da bitmesin
 * diye böyle: gerçek vaka listeden çıkar, ama SINAV olarak kalır.
 */
const DONMUS_BORC: ReadonlySet<string> = new Set<string>([])

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

  it('⭐⭐MUAFİYET KELİME İÇİNDE TETİKLENEMEZ (alt-dize eşleşmesi ölçüm değildir)', () => {
    // NİÇİN: bu kol, ölçülmüş bir kusurun kalıcı bekçisidir. `ARALIK_IFADESI` deseni
    // 2026-09-06'da `ile`/`kadar`ı KELİME İÇİNDE de eşleştiriyordu; Türkçede `ailesi`,
    // `abilen`, `edilebilen` hepsi `ile` içerir. Ölçüldü: 13 ailelik pakette eski desen
    // 8 aileyi muaf sayıyordu, doğrusu 4 — evrenin %31'i SESSİZCE atlanıyordu, üstelik
    // atlananların ikisi bu kapının izlediği borç kalemleriydi.
    //
    // Sabotajla bulundu: pakete "Sabotaj ailesi: 200 mm nominal çaplı…" diye AÇIK bir
    // ihlal koydum ve kapı YEŞİL kaldı — çünkü "ailesi" kelimesi muafiyeti tetikliyordu.
    const kelimeIcinde = [
      'Sabotaj ailesi: 200 mm nominal çaplı fan.',      // "ailesi"      içinde "ile"
      'Patlayıcı ortam oluşabilen 200 mm çaplı fan.',   // "oluşabilen"  içinde "ile"
      'Gömme monte edilebilen 200 mm çaplı aspiratör.', // "edilebilen"  içinde "ile"
      'İleri teknoloji 200 mm çaplı fan.',              // "İleri"       içinde "ile"
    ]
    for (const metin of kelimeIcinde) {
      expect(
        ARALIK_IFADESI.test(metin),
        `MUAFİYET KELİME İÇİNDEN TETİKLENDİ: "${metin}" — desen kelime sınırı kullanmıyor, ` +
          'bu aile sessizce ÖLÇÜLMEDEN geçer.',
      ).toBe(false)
    }

    // TERS YÖN — gerçek aralık ifadeleri HÂLÂ muaf tutulmalı (kol fazla sıkılaşmasın):
    for (const metin of [
      '100–315 mm çap seçenekleri sunar.',
      '1200 m³/h ile 3200 m³/h arasında debi sunar.',
      'Kapasitesi 11 kW seviyesine kadar uzanır.',
      'Çap aralığı 250 ile 630 mm arasıdır.',
    ]) {
      expect(ARALIK_IFADESI.test(metin), `GERÇEK aralık ifadesi TANINMADI: "${metin}"`).toBe(true)
    }

    // Ve uçtan uca: kelime-içi eşleşme artık ihlali GİZLEYEMEZ.
    expect(
      ihlalleriBul([{
        slug: 'sinama-kelime-ici', urun: 9,
        cap_min: 200, cap_max: 600, debi_min: null, debi_max: null,
        metin_tr: 'Sabotaj ailesi: 200 mm nominal çaplı endüstriyel fan serisi.',
      }]).length,
      'Kelime-içi "ile" ihlali GİZLEDİ — muafiyet kelime sınırı ile korunmalı.',
    ).toBe(1)
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

  it('⭐⭐ÖLÇÜT HÂLÂ GÖRÜYOR — kapanan saha vakaları KALICI SINAV olarak duruyor', () => {
    // NİÇİN BU KOL BÖYLE DEĞİŞTİ (2026-09-06 16:00): önceki hâli, iki saha vakasının
    // CANLI pakette yakalandığını ölçüyordu. Katalog metinleri düzeltti, borç sıfıra
    // indi — ve o kol düşmeye başladı. **Doğru tepki kolu SİLMEK DEĞİL**: silseydik
    // "0 ihlal" demesi ölçütün KÖR olmasından mı geliyor sorusunu bir daha hiç
    // soramazdık. Bunun yerine vakaların METİNLERİ dondurularak buraya taşındı.
    //
    // Yani: gerçek kusur listeden çıktı, ama SINAV olarak kaldı. Borç bitince ayırt
    // edicilik kanıtı da bitmesin diye. Bu metinler TARİHTİR, değiştirilmez.
    const KAPANMIS_SAHA_VAKALARI: ReadonlyArray<{ ad: string; aile: Aile; eksen: string }> = [
      {
        ad: 'slimroof-roof (eski metin, 40,4× sapma)',
        eksen: 'debi_m3h',
        aile: {
          slug: 'tarihsel-slimroof-roof', urun: 10,
          cap_min: 155, cap_max: 630, debi_min: 460, debi_max: 18600,
          metin_tr: 'Çatı tipi montaja uygun, radyal atışlı, yüksek verimli EC motorlu Slimroof ES çatı fanı. Nominal debisi 460 m3/h olup, IP54 koruma sınıfına sahiptir.',
        },
      },
      {
        ad: 'slimroof-smoke (eski metin, 8,7× sapma)',
        eksen: 'debi_m3h',
        aile: {
          slug: 'tarihsel-slimroof-smoke', urun: 10,
          cap_min: 315, cap_max: 630, debi_min: 2580, debi_max: 22550,
          metin_tr: '400°C/2h sıcaklık dayanım sertifikalı (F400), çift amaçlı (genel havalandırma ve duman egzozu) radyal atışlı çatı fanı. Maksimum debisi 2580 m3/h olup, IP55 koruma sınıfına sahiptir.',
        },
      },
    ]

    for (const vaka of KAPANMIS_SAHA_VAKALARI) {
      const bulunan = ihlalleriBul([vaka.aile])
      expect(
        bulunan.map((i) => i.eksen),
        `ÖLÇÜT KÖRLEŞTİ — ${vaka.ad} artık YAKALANMIYOR. Bu metin tarihsel bir KUSURDUR ` +
          've ölçüt onu görmek ZORUNDA; görmüyorsa kapının "0 ihlal" demesi hiçbir şey ifade etmez.',
      ).toContain(vaka.eksen)
    }

    // TERS YÖN — doğru yazılmış metin SERBEST kalmalı (lineo-quiet, aralık yazan vaka).
    const lineoQuiet: Aile = {
      slug: 'tarihsel-lineo-quiet', urun: 12,
      cap_min: 100, cap_max: 315, debi_min: 260, debi_max: 2890,
      metin_tr: 'Ultra sessiz çalışan, akustik susturucu gövdeli kanal tipi karma akışlı havalandırma fanı serisi. 100–315 mm çap seçenekleri ve 260–2890 m³/h debi aralığı ile konut ve ticari havalandırma uygulamalarına uygundur.',
    }
    expect(
      ihlalleriBul([lineoQuiet]),
      'lineo-quiet YANLIŞLIKLA kırmızı — metni aralık yazıyor (11× yayılmanın farkında), serbest kalmalı.',
    ).toEqual([])
  })

  it('⭐BORÇ SIFIR — canlı pakette ihlal YOK (kapanışın kendi ölçümü)', () => {
    // Bu kol, yukarıdaki "ölçüt hâlâ görüyor" kolunun KARDEŞİDİR ve ancak onunla
    // birlikte anlam taşır: ölçütün gördüğü kanıtlı, ve gördüğü halde 0 buluyor.
    expect(
      ihlalleriBul(paket.aileler).map(anahtar),
      'Canlı pakette ihlal DOĞDU. Borç 2026-09-06 16:00 itibarıyla SIFIRDI; yeni bir\n' +
        'kalem çıktıysa ya metin bozuldu ya paket bayat. Önce paketin damgasına bak.',
    ).toEqual([])
  })

  it('BOŞLUK MUHAFIZI — veri paketi gerçekten okundu ve damgalı', () => {
    expect(paket.aileler.length, 'Paket bos okundu.').toBeGreaterThan(10)
    expect(/^\d{4}-\d{2}-\d{2}T/.test(paket.damga), 'Damga yok/bozuk — paketin ne zaman alindigi bilinmiyor.').toBe(true)
    expect(paket.aileler.every((a) => typeof a.metin_tr === 'string' && a.metin_tr.length > 20), 'Metinler bos.').toBe(true)
  })
})
