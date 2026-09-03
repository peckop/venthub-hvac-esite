import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CETVEL-YAPI · Cetvellerin BÖLÜM YAPISI tutarlı olmalı.
 *
 * KAPSAM: `docs/standards/**\/*.md` — numaralandırma KULLANAN dosyalar.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN VAR — ölçülmüş bir kusurdan doğdu, varsayımdan değil
 * ─────────────────────────────────────────────────────────────────────────────
 * 2026-08-20'de `deploy-build-skip-standard.md`'ye `## D13` bölümü İKİ KEZ yazıldı:
 * biri 08-19 akşamı, ikincisi ertesi gün aynı yazar tarafından, dosyaya bakılmadan.
 * İki özdeş başlık oluştu ve HİÇBİR KAPI KIRMIZI VERMEDİ.
 *
 * Sebep yapısaldı: cetvelleri okuyan tek bir kapı yoktu. `build-skip-positive-logic`
 * betiği ölçer, cetveli değil. 400+ satırlık bir belgenin başlık listesini kimse elle
 * saymaz. SINIF: "cetvel var, onu ölçen kapı yok" — cetvel + zorlayıcı test = kontrol;
 * tek başına cetvel iyi niyettir.
 *
 * ÖNKOŞUL KARŞILANDI: genelleşmeden önce 35 cetvelin tamamı tarandı, 0 ihlal çıktı
 * (OPS-AUDIT onayı, 2026-08-20). Yeni kapı mevcut ihlalle açılmaz.
 *
 * NUMARASIZ CETVELLER KURAL DIŞIDIR, bilerek: beş cetvel düz metin başlık kullanıyor
 * (`## Kural`, `## KOMUT-A`). Onları numaralandırmaya zorlamak kusur onarımı değil,
 * biçim dayatmasıdır. Kural şudur: **numaralandırma kullanan tutarlı kullanır.**
 */

const KOK = 'docs/standards'

/**
 * Geniş sözlük — cetveller üç ayrı biçim kullanıyor ve üçü de meşru:
 *   `## 3. Başlık`  ·  `## 0) Başlık`  ·  `## 2.4 Başlık`  ·  `## D13 — Başlık`
 * Dar bir desen buranın %90'ını sessizce atlar; bu bir kez yaşandı (aşağıdaki
 * "kendi kapsamını ölçer" testinin varlık sebebi).
 */
const BASLIK =
  /^(#{2,4})\s+(?:[^\p{L}\p{N}\s]+\s*)?(?:§\s*)?([A-ZÇĞİÖŞÜ]{0,6})[\s-]*(\d+(?:\.\d+)*(?:\.[a-zA-Z])?)\s*[.):\-—–]?\s/u

/**
 * ⭐REC-120 · DESEN İKİ YERDEN KÖRDÜ — ölçülerek bulundu, varsayımla değil (2026-09-03).
 *
 * **(1) BAŞTAKİ SÜSLEME.** Bu depoda başlıklar sık sık bir işaretle başlıyor
 * (`### ⭐D8.1`, `### ⚠D8.3`, `#### ✅D8.3 SONUÇ`). Eski desen ilk karakterin harf ya da
 * rakam olmasını bekliyordu, dolayısıyla bunların **hiçbirini görmüyordu.**
 *
 * Bedeli soyut değil: `deploy-build-skip-standard.md` içinde **`D8.3` İKİ KEZ tanımlıydı**
 * (satır 286 `⚠D8.3`, satır 315 `✅D8.3 SONUÇ`) ve bu kapı — *"aynı bölüm numarası iki kez
 * yazılmasın"* diye **tam bu dosyadaki `## D13` ikizlemesinden doğan** kapı — ikisini de
 * göremiyordu. Yani kapı, kendi doğuş sebebine kör kalmıştı.
 *
 * **(2) HARF SONEKİ.** `#### B2.1.b` gibi kimlikler (`notification-standard.md:60`) sayı
 * grubuna uymuyordu; kardeşi `### B2.1` ölçülürken o atlanıyordu. Aynı dosyada bir kısım
 * başlığın ölçülüp bir kısmının **sessizce** atlanması, bu depoda adı konmuş sınıftır:
 * ayırt etmeyen gösterge ölçüm değildir.
 *
 * ÖLÇÜM (üç senaryo, tüm cetveller): eski desen 743 başlık / 0 mükerrer · yeni desen
 * 747 başlık (**+4**) / **1 mükerrer** — yani genişleme gürültü değil, GERÇEK bir ihlal
 * açığa çıkardı. Sahipsiz alt bölüm her iki desende de 0.
 *
 * ⚠GENİŞLEME NİÇİN GÜRÜLTÜ ÜRETMEDİ: süsleme atlandıktan sonra kalan metin yine sayı
 * kuralına uymak zorunda. `### ⭐Dört ders` gibi **numarasız** düz metin başlıkları hâlâ
 * kapsam dışıdır — ki öyle kalmalı: numaralandırma kullanmayan başlığı numaraya zorlamak
 * kusur onarımı değil biçim dayatmasıdır (dosya başındaki gerekçe).
 */

type Bolum = { seviye: number; no: string; satir: number; ust: string }

function bolumleriCikar(metin: string): Bolum[] {
  const out: Bolum[] = []
  let ustL2 = ''
  metin.split(/\r?\n/).forEach((satir, i) => {
    const m = BASLIK.exec(satir)
    if (!m) return
    const seviye = m[1].length
    const no = `${m[2] ?? ''}${m[3]}`
    if (seviye === 2) ustL2 = no
    out.push({ seviye, no, satir: i + 1, ust: seviye === 2 ? '' : ustL2 })
  })
  return out
}

/**
 * ⭐REC-120 · TEKİLLİK ANAHTARI — kimlik ebeveynini KODLUYOR mu?
 *
 * ÖLÇÜLMÜŞ YANLIŞ ALARM (2026-09-01): `fleet-mechanism-standard.md`'de §23 ile §24'ün
 * **kendi** hükümleri vardı (`### HÜKÜM 1`, `### HÜKÜM 2`, …). Desen bunları `HÜKÜM1`
 * diye okuyor ve **dosya çapında** tekil sanıyordu; sonuç: farklı bölümlerin hükümleri
 * birbirine numara kilitliyordu. Sahadaki geçici çözüm §24'ün başlıklarını numarasız
 * yazmak olmuştu — yani cetvel, kapının kusuru yüzünden şeklini değiştirmişti. Kapı
 * belgeye biçim dayatmaya başladığında ölçüt olmaktan çıkar.
 *
 * ⚠DÜZ "hepsini bölüme göre kapsa" ÇÖZÜMÜ REDDEDİLDİ: `2.4` numarası `## 2` altında ve
 * `## 3` altında ayrı ayrı meşru sayılırdı, oysa ikincisi gerçek bir kusurdur. O yüzden
 * ayrım kimliğin KENDİSİNDEN okunur:
 *   · ebeveynini KODLAYAN kimlik (nokta içerir ya da üst kimliğin önekiyle başlar:
 *     `D8.3`, `2.4`, `B2.1.b`) → **DOSYA ÇAPINDA** tekil. Eski güç birebir korunur.
 *   · ÇIPLAK kimlik (`HÜKÜM 1`) → **en yakın ana bölüme** göre tekil.
 *
 * Ölçüldü: bu ayrım `D8.3` ikizlemesini yakalamaya devam ediyor (kayıp yok) ve HÜKÜM
 * fikstüründe çakışmayı 1'den 0'a indiriyor. İki kol aşağıda bunu ayrı ayrı kanıtlıyor.
 */
function tekillikAnahtari(b: Bolum): string {
  const ebeveyniKodluyor = b.no.includes('.') || (b.ust !== '' && b.no.startsWith(b.ust))
  return ebeveyniKodluyor || b.seviye === 2 ? b.no : `${b.ust}::${b.no}`
}

function cetvelDosyalari(): string[] {
  const kok = resolve(process.cwd(), KOK)
  return readdirSync(kok, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.md'))
    .map((d) => join(KOK, d.name))
    .sort()
}

function olculenler(): { yol: string; bolumler: Bolum[] }[] {
  return cetvelDosyalari()
    .map((yol) => ({
      yol,
      bolumler: bolumleriCikar(readFileSync(resolve(process.cwd(), yol), 'utf8')),
    }))
    // Numaralandırma kullanmayan cetvel kural dışıdır (yukarıdaki gerekçe).
    .filter((d) => d.bolumler.length > 0)
}

describe('INV-CETVEL-YAPI · cetvellerin bölüm yapısı', () => {
  it('aynı bölüm numarası bir cetvelde İKİ KEZ tanımlanmaz', () => {
    const ihlaller = olculenler().flatMap(({ yol, bolumler }) => {
      const sayim = new Map<string, number[]>()
      for (const b of bolumler) {
        const k = tekillikAnahtari(b)
        sayim.set(k, [...(sayim.get(k) ?? []), b.satir])
      }
      return [...sayim.entries()]
        .filter(([, satirlar]) => satirlar.length > 1)
        .map(([no, satirlar]) => `${yol} → ${no} (satır ${satirlar.join(', ')})`)
    })
    expect(
      ihlaller,
      'mükerrer bölüm numarası. Kimlik ebeveynini kodluyorsa (D8.3, 2.4, B2.1.b) dosya ' +
      'çapında tekil olmalı; çıplak kimlik (HÜKÜM 1) yalnız kendi ana bölümünde tekildir.',
    ).toEqual([])
  })

  it('⭐REC-120 · SÜSLEMELİ ve HARF SONEKLİ başlıklar GÖRÜLÜR (kapı kendi doğuş sebebine kör kalmasın)', () => {
    // Fikstür şart: gerçek cetveller bugün 0 mükerrer veriyor ve 0, hem "ihlal yok"un hem
    // "desen kör"ün cevabıdır. Ayırt etmeyen gösterge ölçüm değildir.
    const gorulen = bolumleriCikar([
      '## D8 — ana bölüm',
      '### ⭐D8.1 — yıldız önekli',
      '### ⚠D8.3 — uyarı önekli',
      '#### ✅D8.3 SONUÇ — onay önekli, AYNI numara',
      '### B2.1 — sayı',
      '#### B2.1.b — harf sonekli',
      '### ⭐Dört ders — NUMARASIZ, kapsam dışı kalmalı',
    ].join('\n')).map(b => b.no)

    expect(gorulen, 'yıldız önekli numaralı başlık ATLANDI').toContain('D8.1')
    expect(gorulen, 'harf sonekli numara ATLANDI').toContain('B2.1.b')
    expect(
      gorulen.filter(n => n === 'D8.3').length,
      'Aynı numarayı taşıyan İKİ süslemeli başlığın ikisi de görülmeli — yoksa mükerrer ' +
      'tespiti (bu kapının doğuş sebebi) süslemeyle atlatılabilir.',
    ).toBe(2)
    expect(
      gorulen.some(n => /ders/i.test(n)),
      'NUMARASIZ düz metin başlığı kapsama girdi — numaralandırma kullanmayan başlığı ' +
      'numaraya zorlamak kusur onarımı değil biçim dayatmasıdır.',
    ).toBe(false)
  })

  it('⭐REC-120 · ÇIPLAK kimlik iki AYRI ana bölümde çakışmaz, AYNI bölümde çakışır (ayırt edici çift)', () => {
    const anahtarlari = (metin: string): string[] => bolumleriCikar(metin).map(tekillikAnahtari)
    const cakisanlar = (ks: string[]): string[] => {
      const s = new Map<string, number>()
      for (const k of ks) s.set(k, (s.get(k) ?? 0) + 1)
      return [...s.entries()].filter(([, n]) => n > 1).map(([k]) => k)
    }

    // YANLIŞ ALARM OLMAMALI: iki ayrı ana bölümün KENDİ hükümleri.
    expect(
      cakisanlar(anahtarlari([
        '## 23. Bir bölüm', '### HÜKÜM 1 — birinci', '### HÜKÜM 2 — ikinci',
        '## 24. Başka bölüm', '### HÜKÜM 1 — bunun kendi hükmü',
      ].join('\n'))),
      'Farklı ana bölümlerin ÇIPLAK kimlikleri birbirine numara kilitliyor — ölçülmüş ' +
      'yanlış alarm (§23/§24). Kapı belgeye biçim dayatmaya başlar.',
    ).toEqual([])

    // GERÇEK İHLAL YAKALANMALI: aynı ana bölümde aynı çıplak kimlik. Bu kol olmasan
    // "hiç çakışma görmeyen" bir anahtar da yukarıdaki iddiayı geçerdi.
    expect(
      cakisanlar(anahtarlari([
        '## 23. Bir bölüm', '### HÜKÜM 1 — birinci', '### HÜKÜM 1 — yanlışlıkla İKİNCİ kez',
      ].join('\n'))),
      'AYNI ana bölümde aynı çıplak kimlik İKİ KEZ yazıldı ve yakalanmadı — kapsamlama ' +
      'kapıyı sökmüş olurdu.',
    ).toEqual(['23::HÜKÜM1'])

    // EBEVEYNİNİ KODLAYAN kimlik DOSYA ÇAPINDA tekil kalmalı: aksi hâlde `2.4` iki ayrı
    // ana bölüm altında meşru sayılırdı, oysa ikincisi gerçek kusurdur.
    expect(
      cakisanlar(anahtarlari([
        '## 2. Bölüm', '### 2.4 — burada', '## 3. Başka bölüm', '### 2.4 — YANLIŞ yerde',
      ].join('\n'))),
      'Ebeveynini KODLAYAN kimlik iki ayrı bölümde meşru sayıldı — kapsamlama eski gücü ' +
      'yok etmiş olurdu.',
    ).toEqual(['2.4'])
  })

  it('her alt bölüm (X<n>.<m>) kendi ana bölümüne sahiptir', () => {
    const ihlaller = olculenler().flatMap(({ yol, bolumler }) => {
      const anahtarlar = new Set(bolumler.map((b) => b.no))
      return bolumler
        .filter((b) => b.seviye >= 3 && b.no.includes('.'))
        .filter((b) => !anahtarlar.has(b.no.slice(0, b.no.lastIndexOf('.'))))
        .map((b) => `${yol} → ${b.no} (satır ${b.satir})`)
    })
    expect(ihlaller, 'sahipsiz alt bölüm: ana bölümü yok').toEqual([])
  })

  /**
   * KAPININ KENDİ KÖRLÜĞÜNE KARŞI — bugünün asıl dersi.
   *
   * Bu envanterin ilk koşusu "0 ihlal" döndürdü ve o sıfır BOŞTU: desen 445 başlığın
   * yalnız 47'sini görüyordu, 35 dosyanın 29'unda tamamen kördü. Sıfır "ihlal yok"
   * değil "bakmadım" demekti.
   *
   * Bu yüzden kapı kendi kapsamını da ölçer. Desen ileride bozulur/daraltılırsa
   * yukarıdaki iki test sessizce yeşile döner; bu test KIRMIZI verir.
   *
   * Kanarya olarak sabit bir dosya seçildi — eşik zamanla kaymaz.
   */
  it('kendi kapsamını ölçer: desen bozulursa sessizce yeşile dönmez', () => {
    const KANARYA = `${KOK}/deploy-build-skip-standard.md`
    const kanaryaBolumleri = bolumleriCikar(
      readFileSync(resolve(process.cwd(), KANARYA), 'utf8'),
    )
    expect(
      kanaryaBolumleri.length,
      `${KANARYA} numaralı bölüm içerir; sıfır çıkması desenin bozulduğunu gösterir`,
    ).toBeGreaterThanOrEqual(5)

    expect(olculenler().length, 'ölçülen cetvel sayısı').toBeGreaterThanOrEqual(10)
  })

  /**
   * YANLIŞ KIRMIZI KORUMASI — AUTH'un (99fa366e, 2026-08-20 10:11Z) uyarısından doğdu.
   *
   * "Her alt bölüm ana bölümüne sahip olmalı" cümlesi iki biçimde kodlanabilir:
   * ANA = en üst düzey (`3`) ya da ANA = DOĞRUDAN ebeveyn (`3.8`). İlkini kodlayan
   * üç düzeyli belgelerde hiçbir şey yakalamaz; ikincisini kodlarken ebeveyn kümesine
   * yalnız noktasız başlıkları koyan, `3.8.1`'e YANLIŞ KIRMIZI verir.
   *
   * AUTH tam bu tuzağa düştü ve `admin-design-standard` ile `pricing-standard`
   * dosyalarına iki yanlış alarm üretti (ikisi de başka şeritlerin dosyası).
   * Yeni bir kapının ilk işi yanlış kırmızı olursa kapıya güven biter.
   */
  it('meşru üç düzeyli başlığa YANLIŞ KIRMIZI vermez', () => {
    const SATIR_SONU = String.fromCharCode(10)
    const temiz = ['## 3. Ana', '### 3.8 Ara', '#### 3.8.1 Alt alt'].join(SATIR_SONU)
    const bolumler = bolumleriCikar(temiz)
    const anahtarlar = new Set(bolumler.map((b) => b.no))

    // Ara başlık `3.8` ebeveyn kümesinde OLMALI — asıl tuzak burada.
    expect(anahtarlar.has('3.8'), '`3.8` ebeveyn adayı sayılmalı').toBe(true)

    const yetim = bolumler
      .filter((b) => b.seviye >= 3 && b.no.includes('.'))
      .filter((b) => !anahtarlar.has(b.no.slice(0, b.no.lastIndexOf('.'))))
    expect(yetim.map((b) => b.no), 'meşru üç düzeyli belge temiz dönmeli').toEqual([])
  })

  it('ayıklayıcı gerçekten çalışıyor: bozuk girdi yakalanır (vacuous-pass koruması)', () => {
    const SATIR_SONU = String.fromCharCode(10)
    const bozuk = ['## 3. Bir bolum', '### 3.1 Alt', '## 3. AYNI NUMARA', '### 9.7 Anasiz'].join(
      SATIR_SONU,
    )
    const bolumler = bolumleriCikar(bozuk)

    expect(bolumler.filter((b) => b.no === '3')).toHaveLength(2)

    const anahtarlar = new Set(bolumler.map((b) => b.no))
    const yetim = bolumler.filter(
      (b) => b.seviye >= 3 && b.no.includes('.') && !anahtarlar.has(b.no.split('.')[0]),
    )
    expect(yetim.map((b) => b.no)).toEqual(['9.7'])
  })
})

/**
 * ÇAPA KOLU (INV-CETVEL-YAPI · tekrar) — LEGAL'in 2026-08-20 isteği üzerine eklendi.
 *
 * ONLARIN SORUSU: mükerrer 3.6'yı yakaladık ama numarayı doğru artırsalardı aynı
 * mükerrerlik SESSİZ kalırdı. Kapının gerçek hedefi numara değil TEKRAR.
 *
 * ÜÇ TASARIM ÖLÇÜLDÜ (42 dosya, 557 başlık), İKİSİ ÇÜRÜDÜ:
 *   A · normalize edilmiş başlık metni birebir eşit → 0 bulgu, AMA gerçek vakayı
 *       YAKALAYAMIYOR (iki başlığın metni farklıydı). Boş sıfır, yanlış güven.
 *   B · sözcük kümesi Jaccard ≥ 0.5 → 4 bulgu ve DÖRDÜ DE MEŞRU (admin 8↔10.4,
 *       purchasing 10↔13.3, companion C4↔C5, admin 9↔10.5); üstelik gerçek vaka
 *       j≈0.45 ile eşiğin ALTINDA. Hem gürültü hem ıska.
 *   C · ÇAPA: başlıkta geçen KOD KİMLİĞİ (backtickli yol/dosya ya da çıplak /rota)
 *       aynı dosyada iki başlıkta geçiyorsa → tek bulgu = gerçek vaka, yanlış
 *       pozitif SIFIR, ve numara değişse de yakalar. KABUL EDİLEN.
 *
 * ⚠ BU DARALTMANIN KIRILGAN BİR BAĞIMLILIĞI VAR (ÜRÜN şeridi yakaladı, kayda geçiyorum):
 * yukarıdaki yanlış kırmızının temizlenmesi, o dosyada `2.6`'nın `###` ve `11.6`'nın `##`
 * olmasına — yani bir YAPISAL TUTARSIZLIĞA — dayanıyor. Biri o başlık düzeylerini
 * "düzeltirse" aynı çapa aynı düzeyde iki kez görünür ve kol yeniden yanlış kırmızı verir;
 * üstelik bu sefer HAKLI görünür. Yani kolun doğruluğu, düzeltilmesi gereken bir
 * tutarsızlığın DURMASINA bağlı. Bu rahatsız edici ve gizlenmemeli: düzey normalizasyonu
 * yapılacaksa önce bu kola ADIYLA muafiyet eklenmeli (şema tanımı ↔ sözleşme çifti meşrudur).
 *
 * MENZİL DÜRÜSTLÜĞÜ: 557 başlığın yalnız ~32'si çapa taşır. Bu kol DAR ama KESİN;
 * çapasız iki tarifi görmez. Dar-kesin, geniş-gürültülüye tercih edildi çünkü B'nin
 * dört yanlış kırmızısı kapıyı ilk gününde gürültüye çevirirdi.
 */
const CAPA = /`([^`]+)`|(?<![\w`])(\/[a-z0-9][a-z0-9\-/[\]]{3,})/g

function capalar(baslikMetni: string): string[] {
  const out = new Set<string>()
  for (const m of baslikMetni.matchAll(CAPA)) {
    const ham = (m[1] ?? m[2] ?? '').trim()
    if (ham.length < 4) continue
    // yalnız yol/dosya benzeri kimlikler: içinde / . veya _ geçmeli
    if (!/[/._]/.test(ham)) continue
    out.add(ham.replace(/\/+$/, '').toLowerCase())
  }
  return [...out]
}

describe('INV-CETVEL-YAPI · aynı konunun İKİ TARİFİ (çapa kolu)', () => {
  it('bir cetvelde aynı KOD KİMLİĞİ iki ayrı başlıkta anlatılmaz', () => {
    const ihlaller: string[] = []
    let capaliBaslik = 0

    for (const yol of cetvelDosyalari()) {
      // Çapa → aynı BAŞLIK DÜZEYİNDEKİ satırlar (düzey neden ayırt edici: yorum bloğunda).
      const harita = new Map<string, Map<number, number[]>>()
      readFileSync(yol, 'utf8')
        .split(/\r?\n/)
        .forEach((satir, i) => {
          const m = /^(#{2,4})\s+(.*)$/.exec(satir)
          if (!m) return
          const seviye = m[1].length
          const c = capalar(m[2])
          if (c.length > 0) capaliBaslik++
          for (const x of c) {
            const seviyeler = harita.get(x) ?? new Map<number, number[]>()
            seviyeler.set(seviye, [...(seviyeler.get(seviye) ?? []), i + 1])
            harita.set(x, seviyeler)
          }
        })
      for (const [capa, seviyeler] of harita) {
        for (const [seviye, satirlar] of seviyeler) {
        if (satirlar.length > 1) ihlaller.push(`${yol} → ${capa} (satır ${satirlar.join(', ')})`)
        }
      }
    }

    // KAPSAM KANARYASI: hiç çapa bulunmadıysa karşılaştırma boş kümede yapılmıştır
    // ve kol sessizce yeşil kalır. Sıfırın "ihlal yok" mu "hiçbir yere bakmadım" mı
    // olduğunu ayıran tek şey bu satır.
    expect(
      capaliBaslik,
      'hiçbir başlıkta kod kimliği bulunamadı — ÇAPA deseni bozulmuş olabilir',
    ).toBeGreaterThan(0)

    expect(
      ihlaller,
      'aynı kod kimliği bir cetvelde iki kez başlık olmuş: bir konunun iki tarifi. ' +
        'Biri güncellenir öteki kalır ve okuyan hangisine bakacağını bilemez. ' +
        'Numarayı değiştirmek bunu ÇÖZMEZ — blokları birleştirin.',
    ).toEqual([])
  })

  it('çapa ayıklayıcısı gerçekten çalışıyor (bozuk girdi yakalanır)', () => {
    const iki = capalar('3.6 Veri sahibinin kendi kanalı — `/account/data-requests` (T063)')
    expect(iki).toContain('/account/data-requests')
    // çapasız başlık hiçbir şey döndürmemeli — aksi hâlde kol her başlığı eşleştirirdi
    expect(capalar('4. Fiyat ve Stok')).toEqual([])
    // tek sözcüklü backtick (yol değil) çapa SAYILMAZ
    expect(capalar('C4 — `Companion` kuralı')).toEqual([])
  })
})
