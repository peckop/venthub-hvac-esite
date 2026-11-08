import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { kapsamla, prDegisenleri } from './_ortak/pr-kapsami'
import {
  bolumleriCikar,
  capalar,
  capaTara,
  cetvelDosyalari,
  type Kapsam,
  KOK,
  KONTROL_KODU,
  MESAJ,
  mukerrerIhlalleri,
  olculenler,
  sahipsizIhlalleri,
  taramaKumesi,
  tekillikAnahtari,
} from './standard-section-integrity.yardimci'

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
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BU DOSYA PR KOLUDUR (ALT-38i parça 2, OPS hükmü 2026-10-09; cetvel: test-karnesi-standard.md §3 ve §7.4)
 * ─────────────────────────────────────────────────────────────────────────────
 * Karne ölçümü (docs/audits/test-karnesi-2026-10-09.json, CI geçmişi 2026-07-06..10-07): bu kapı 13 koşuda kırmızı
 * verdi, 12 farklı dalda; 11'i dünya olayı kümesinde (tanım, cetvel §3: aynı test ≥3 farklı dalda 12 saat içinde
 * kırmızı), 2'si izole (sonraki koşuda düzeldi: PR'ın kendi hatası). Çare "kapıyı PR'dan çıkarmak" değil BÖLMEKTİR,
 * çünkü PR'ın kendi hatasını yakalayan kol PR'da kalmak zorundadır:
 *
 *   · PR KOLU (bu dosya; PR kapısında HER PR'da koşar):
 *       - fikstür ve ayıklayıcı testleri (b, c, e, f, g, i): hiçbir cetvele bağlı değil, olduğu gibi kaldı;
 *       - mükerrer numara, sahipsiz alt bölüm ve çapa tekrarı: yalnız PR'ın DEĞİŞTİRDİĞİ docs/standards/*.md
 *         cetvellerinde taranır. Üç kural da DOSYA BAŞINADIR; bir cetvelin ihlali yalnız o cetvelin içeriğinden
 *         doğar, dolayısıyla dokunulmamış cetvelin ihlali PR'ın kusuru değildir;
 *       - FAIL-CLOSED: değişen dosya listesi okunamazsa (`null`) ya da kontrolün kendi kodu değiştiyse TAM klasör
 *         taranır, boş küme ASLA kullanılmaz. Boş küme yalnız "liste okundu ve hiçbir cetvele dokunulmadı" iken olur;
 *       - KANARYALAR kapsamdan bağımsızdır, TAM klasörden hesaplanır (cetvel sayısı, çapalı başlık sayısı): diff
 *         kümesi boş ya da küçük diye "hiçbir yere bakmadım" sessiz yeşile dönmez.
 *   · DÜNYA KOLU (`standard-section-integrity-dunya.test.ts`; PR kapısından ÇIKAR, master push + zamanlı koşu):
 *       mükerrer numara, sahipsiz alt bölüm ve çapa tekrarının TAM klasör taraması, kendi kanaryalarıyla.
 *       Liste: scripts/ci/dunya-durumu-testleri.json. Kırmızısı her mesajda `DUNYA:` kanca satırında görünür.
 *   · ORTAK KOD: `standard-section-integrity.yardimci.ts` (başlık deseni, tekillik anahtarı, çapa ayıklayıcısı,
 *       tarama işlevleri, kapsam seçimi). İki kol AYNI kodu çalıştırır; kopya yok, kayma testi gerekmez.
 *
 * Değişen dosyalar `scripts/ci/dunya-durumu.cjs` `degisenYollariniOku` ile okunur (CI'da `git diff HEAD^1 HEAD`;
 * yerelde `VENTHUB_DUNYA_DEGISEN_DOSYALAR=<dosya yolu>` ile elle verilebilir). ⚠Yerelde commit sonrası `HEAD^1..HEAD`
 * yalnız SON commit'tir: yerel çok-commitli dalda PR'ın tamamı için değişen listesini elle verin ya da dünya
 * kolunu (tam klasör) koşun.
 */

/**
 * PR kolunun taranacak cetvelleri (bir kez hesaplanır): PR'ın değişen cetvelleri; okunamazsa ya da kontrolün kendi
 * kodu değiştiyse TAM klasör. Seçim mantığı `taramaKumesi`dedir (yardımcı) ve aşağıda kendi testleriyle sabittir.
 */
let kapsamOnbellegi: Kapsam | null = null
function kapsam(): Kapsam {
  kapsamOnbellegi ??= taramaKumesi(prDegisenleri(), cetvelDosyalari())
  return kapsamOnbellegi
}

describe('INV-CETVEL-YAPI · cetvellerin bölüm yapısı', () => {
  it('aynı bölüm numarası bir cetvelde İKİ KEZ tanımlanmaz (PR kapsamı: değişen cetveller)', () => {
    const k = kapsam()
    expect(mukerrerIhlalleri(olculenler(k.yollar)), `${MESAJ.mukerrer} [PR kapsamı: ${k.neden}]`).toEqual([])
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

  it('her alt bölüm (X<n>.<m>) kendi ana bölümüne sahiptir (PR kapsamı: değişen cetveller)', () => {
    const k = kapsam()
    expect(sahipsizIhlalleri(olculenler(k.yollar)), `${MESAJ.sahipsiz} [PR kapsamı: ${k.neden}]`).toEqual([])
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

    expect(olculenler(cetvelDosyalari()).length, 'ölçülen cetvel sayısı').toBeGreaterThanOrEqual(10)
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
 * ÇAPA KOLU (INV-CETVEL-YAPI · tekrar): tasarım geçmişi ve ölçümler `standard-section-integrity.yardimci.ts`
 * içinde, `CAPA` desenin yanındadır (LEGAL'in 2026-08-20 isteği; üç tasarım ölçüldü, ikisi çürüdü).
 */
describe('INV-CETVEL-YAPI · aynı konunun İKİ TARİFİ (çapa kolu)', () => {
  it('bir cetvelde aynı KOD KİMLİĞİ iki ayrı başlıkta anlatılmaz (PR kapsamı: değişen cetveller)', () => {
    const k = kapsam()
    expect(capaTara(k.yollar).ihlaller, `${MESAJ.capa} [PR kapsamı: ${k.neden}]`).toEqual([])
  })

  /**
   * KAPSAM KANARYASI (TAM klasörden): kapsam diff kümesine daraldığı için "hiç çapa bulunmadı" artık yalnız deseni
   * değil KÜMEYİ de gösterir. Diff'te çapalı başlık bulunmaması normaldir; deseni tam klasör ölçer. Dünya kolu aynı
   * kanaryayı kendi taramasının içinde de taşır.
   */
  it('çapa kanaryası: TAM klasörde çapa taşıyan başlık vardır (kanarya diff kümesinden hesaplanmaz)', () => {
    expect(capaTara(cetvelDosyalari()).capaliBaslik, MESAJ.capaKanarya).toBeGreaterThan(0)
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

/**
 * KAPSAM SEÇİMİNİN KENDİSİ (ALT-38i parça 2). Üç tarama değişen cetvellerle sınırlandığı için "kimi tarıyoruz?"
 * sorusunun cevabı da bir kapıdır: seçim sessizce boş kümeye düşerse üç kural hiçbir şey ölçmeden yeşil kalır.
 * Bu testler seçimi ve uçtan uca davranışı (geçici bir cetvel kökünde) sabitler.
 */
describe('INV-CETVEL-YAPI · PR kapsamı: değişen cetveller, fail-closed', () => {
  const TUM = ['docs/standards/a.md', 'docs/standards/b.md', 'docs/standards/c.md']

  it('KANARYA (TAM klasör): cetvel kümesi ve numaralı cetvel sayısı kapsamdan bağımsız ölçülür', () => {
    const tum = cetvelDosyalari()
    expect(tum.length, 'docs/standards/*.md bulunamadı: kök bozuk ya da çalışma dizini yanlış').toBeGreaterThanOrEqual(10)
    expect(olculenler(tum).length, 'numaralı cetvel sayısı').toBeGreaterThanOrEqual(10)
  })

  it('değişen liste OKUNAMADIYSA (null) TAM klasör taranır: boş küme ASLA kullanılmaz', () => {
    const k = taramaKumesi(null, TUM)
    expect(k.tam, 'null liste tam klasöre düşmedi').toBe(true)
    expect(k.yollar, 'null liste boş kümeye düştü: üç kural hiçbir şey ölçmeden yeşil kalırdı').toEqual(TUM)
  })

  it('liste okundu ve hiçbir cetvele dokunulmadıysa kapsam boştur (dünya kolu tam klasörü tarar)', () => {
    for (const degisen of [[], ['README.md', 'src/lib/x.ts', 'docs/plans/y.md']]) {
      const k = taramaKumesi(degisen, TUM)
      expect({ tam: k.tam, yollar: k.yollar }, `değişen=${JSON.stringify(degisen)}`).toEqual({ tam: false, yollar: [] })
    }
  })

  it('yalnız değişen cetvel taranır; silinen cetvel, alt dizin ve .md olmayan yol kendiliğinden düşer', () => {
    const k = taramaKumesi(
      ['docs/standards/b.md', 'docs/standards/silinen.md', 'docs/standards/alt/d.md', 'docs/standards/b.md.bak', 'docs/standards/notlar.txt'],
      TUM,
    )
    expect({ tam: k.tam, yollar: k.yollar }).toEqual({ tam: false, yollar: ['docs/standards/b.md'] })
    // Sıra cetvel kümesinin sırasıdır (değişen listenin sırası değil): çıktı belirlenimlidir.
    expect(taramaKumesi(['docs/standards/c.md', 'docs/standards/a.md'], TUM).yollar).toEqual(['docs/standards/a.md', 'docs/standards/c.md'])
  })

  it('kontrolün KENDİ kodu değişirse (test, yardımcı, dünya kolu, kapsam yardımcısı, değişen-liste okuyucusu) TAM klasör taranır', () => {
    expect(KONTROL_KODU.length, 'kontrol kodu listesi boş').toBeGreaterThanOrEqual(5)
    for (const kod of KONTROL_KODU) {
      const k = taramaKumesi([kod], TUM)
      expect({ kod, tam: k.tam, yollar: k.yollar }, `${kod} değişti ama TAM klasör taranmadı`).toEqual({ kod, tam: true, yollar: TUM })
    }
  })

  it('KONTROL_KODU gerçek dosyaları gösterir (yazım hatası "kontrol değişince tam tara" kuralını sessizce kapatırdı)', () => {
    const yok = KONTROL_KODU.filter((y) => !existsSync(resolve(process.cwd(), y)))
    expect(yok, 'KONTROL_KODU diskte olmayan yol taşıyor').toEqual([])
    expect(KONTROL_KODU, 'iki kol, yardımcı, kapsam yardımcısı ve okuyucu listede olmalı').toEqual(
      expect.arrayContaining([
        'src/__tests__/conformance/standard-section-integrity.test.ts',
        'src/__tests__/conformance/standard-section-integrity-dunya.test.ts',
        'src/__tests__/conformance/standard-section-integrity.yardimci.ts',
        'src/__tests__/conformance/_ortak/pr-kapsami.ts',
        'scripts/ci/dunya-durumu.cjs',
      ]),
    )
  })

  it('_ortak/pr-kapsami kapsamla: okunamayan liste (null) tumu AYNEN + tam; okunan liste tumu sırasında kesişim', () => {
    const tumu = [{ y: 'a/1' }, { y: 'a/2' }, { y: 'b/3' }]
    const anahtar = (x: { y: string }): string => x.y
    const okunamadi = kapsamla(tumu, anahtar, null)
    expect(okunamadi.tam, 'null liste tam=true vermedi').toBe(true)
    expect(okunamadi.liste, 'null liste tumu AYNEN döndürmedi (boş küme/kopya)').toBe(tumu)
    expect(kapsamla(tumu, anahtar, ['b/3', 'a/1', 'x/9'])).toEqual({ liste: [{ y: 'a/1' }, { y: 'b/3' }], tam: false })
    expect(kapsamla(tumu, anahtar, []), 'okundu ve hiçbirine dokunulmadı').toEqual({ liste: [], tam: false })
    // Varsayılan (üçüncü parametre yok) gerçek okuyucuya bağlanır: sonuç ya tam ya da tumu'nun alt kümesidir, asla başka bir şey.
    const varsayilan = kapsamla(tumu, anahtar)
    expect(varsayilan.liste.every((x) => tumu.includes(x))).toBe(true)
    expect(varsayilan.tam ? varsayilan.liste : tumu).toBe(tumu)
  })

  it('UÇTAN UCA (geçici cetvel kökü): ihlal yalnız DEĞİŞEN cetvelde görülür; liste okunamazsa ya da kontrol değişirse TAM klasör yakalar', () => {
    const depo = mkdtempSync(join(tmpdir(), 'cetvel-yapi-'))
    try {
      mkdirSync(join(depo, KOK), { recursive: true })
      writeFileSync(join(depo, KOK, 'temiz.md'), ['## 1. Bir', '### 1.1 Alt', '## 2. İki'].join('\n'))
      // Bozuk: aynı numara iki kez (mükerrer) + ana bölümü olmayan alt bölüm (sahipsiz).
      writeFileSync(join(depo, KOK, 'bozuk.md'), ['## 3. Bir bolum', '### 3.1 Alt', '## 3. AYNI NUMARA', '### 9.7 Anasiz'].join('\n'))
      // Çapa: aynı kod kimliği iki başlıkta (numaralar tekil, yalnız çapa kolu görür).
      writeFileSync(join(depo, KOK, 'capa.md'), ['## 1. Birinci `src/x.ts`', '## 2. Ikinci `src/x.ts`'].join('\n'))

      const tum = cetvelDosyalari(depo)
      expect(tum, 'geçici kökteki cetvel kümesi').toEqual([`${KOK}/bozuk.md`, `${KOK}/capa.md`, `${KOK}/temiz.md`])

      // Gerçek PR kolunun yaptığı işin AYNISI: kapsamı seç, üç kuralı o kapsamda tara.
      const tara = (degisen: string[] | null): string[] => {
        const k = taramaKumesi(degisen, tum)
        const o = olculenler(k.yollar, depo)
        return [...mukerrerIhlalleri(o), ...sahipsizIhlalleri(o), ...capaTara(k.yollar, depo).ihlaller]
      }

      expect(tara([`${KOK}/temiz.md`]), 'yalnız temiz cetvel değişti: bozuk cetvel PR\'ın kusuru değildir').toEqual([])
      expect(tara([]), 'hiçbir cetvele dokunulmadı').toEqual([])
      expect(tara([`${KOK}/bozuk.md`]), 'bozuk cetvel değişti: iki ihlal yakalanmalı').toEqual([
        `${KOK}/bozuk.md → 3 (satır 1, 3)`,
        `${KOK}/bozuk.md → 9.7 (satır 4)`,
      ])
      expect(tara([`${KOK}/capa.md`]), 'çapalı cetvel değişti: çapa tekrarı yakalanmalı').toEqual([`${KOK}/capa.md → src/x.ts (satır 1, 2)`])

      const tamKlasor = [`${KOK}/bozuk.md → 3 (satır 1, 3)`, `${KOK}/bozuk.md → 9.7 (satır 4)`, `${KOK}/capa.md → src/x.ts (satır 1, 2)`]
      expect(tara(null), 'liste okunamadı: TAM klasör üç ihlali de görmeli').toEqual(tamKlasor)
      expect(tara(['src/lib/x.ts', KONTROL_KODU[0]]), 'kontrolün kodu değişti: TAM klasör üç ihlali de görmeli').toEqual(tamKlasor)
    } finally {
      rmSync(depo, { recursive: true, force: true })
    }
  })
})
