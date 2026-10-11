// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'

/**
 * INV-VITRIN-KAYNAKSIZ-1 (URN-80) — marka dışı vitrin yüzeylerinde KAYNAĞI OLMAYAN metin/rakam yok.
 *
 * CETVEL: docs/standards/vitrin-metni-standard.md K4/K4.1 — bir iddia kaynakta AYNEN geçmiyorsa
 * doğrulanmış sayılmaz; karar 317: kaldırma sorulmaz, yerine somut metin girer, yeni iddia girmez.
 *
 * NİÇİN VAR (2026-10-09 abartı taraması, dokuz satır): altbilgide uydurma çalışma saatleri, ana sayfada
 * koda gömülü "15+" deneyim sayacı, hava perdesi sayfasında '%30' / '15°C' / '2.5 m/s' rakamları, görsel
 * alt metninde 'Futuristic Premium', müşteriye giden föyde 'HVAC PREMIUM' ve 'Akıllı Sistem'. Hiçbirinin
 * kaynağı yoktu; derleyici, sözlük eşliği ve mevcut testler bunları görmedi (metin var, iki dilde dolu,
 * yalnız doğru değil).
 *
 * ÖLÇÜT: kod YORUMLARI sayılmaz, yalnız çalışma anında basılan metin sabitleri (string, şablon, JSX
 * metni) taranır — yoksa "neden kaldırıldı" açıklaması kendi yasağını tetikler. Taramayı AST yapar.
 *
 * ⚠KAPSAM SINIRI, adıyla: bu kapı YALNIZ bu dokuz yüzeyi kilitler. Başka bir yüzeydeki kaynaksız söz
 * (bkz. URN-80 raporu "riskler") burada yeşil görünür; genel tarama değildir. TEK GENİŞ KOL: şirketin "15+ yıl"
 * deneyim iddiası (Hakkımızda sayfası + TR/EN sözlüğün TÜM değerleri, URN-82 yenilemesi); yalnız o söz için geneldir.
 */

const KOK = process.cwd()

function oku(...yol: string[]): string {
  return fs.readFileSync(path.join(KOK, ...yol), 'utf8')
}

/** Dosyadaki ÇALIŞMA ANINDA basılan metin sabitleri (yorumlar dahil DEĞİL). */
function metinSabitleri(metin: string, dosyaAdi = 'x.tsx'): string[] {
  const sf = ts.createSourceFile(dosyaAdi, metin, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const bulunan: string[] = []
  const gez = (n: ts.Node): void => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) bulunan.push(n.text)
    else if (ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) bulunan.push(n.text)
    else if (ts.isJsxText(n)) bulunan.push(n.text)
    ts.forEachChild(n, gez)
  }
  gez(sf)
  return bulunan
}

/** Dosyadaki özellik adları (`{ stat: ... }` → 'stat'). */
function ozellikAdlari(metin: string, dosyaAdi = 'x.tsx'): string[] {
  const sf = ts.createSourceFile(dosyaAdi, metin, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const adlar: string[] = []
  const gez = (n: ts.Node): void => {
    if (ts.isPropertyAssignment(n) || ts.isShorthandPropertyAssignment(n)) adlar.push(n.name.getText())
    ts.forEachChild(n, gez)
  }
  gez(sf)
  return adlar
}

/**
 * JSX içinde ÇOCUK olarak çıplak sayı (`<div>{15}</div>`) var mı — koda gömülü sayaç değerinin imzası.
 * Nitelik değerleri (`width={18}`) sayılmaz: onlar ekranda okunan metin değil.
 */
function jsxCiplakSayilar(metin: string): string[] {
  const sf = ts.createSourceFile('x.tsx', metin, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const sayilar: string[] = []
  const gez = (n: ts.Node): void => {
    if (ts.isJsxExpression(n) && !ts.isJsxAttribute(n.parent) && n.expression && ts.isNumericLiteral(n.expression)) {
      sayilar.push(n.expression.text)
    }
    ts.forEachChild(n, gez)
  }
  gez(sf)
  return sayilar
}

/** `src` altındaki test OLMAYAN kaynak dosyaları (.ts/.tsx). */
function kaynakDosyalari(dizin: string, cikti: string[] = []): string[] {
  for (const ad of fs.readdirSync(dizin, { withFileTypes: true })) {
    const tam = path.join(dizin, ad.name)
    if (ad.isDirectory()) {
      if (ad.name === '__tests__' || ad.name === 'node_modules') continue
      kaynakDosyalari(tam, cikti)
    } else if (/\.(ts|tsx)$/.test(ad.name) && !/\.(test|spec)\.(ts|tsx)$/.test(ad.name)) {
      cikti.push(tam)
    }
  }
  return cikti
}

/** Bir sözlük alt ağacındaki tüm metin değerleri `yol → değer`. */
function duzlestir(agac: unknown, onek: string, cikti: Record<string, string> = {}): Record<string, string> {
  if (typeof agac === 'string') cikti[onek] = agac
  else if (agac && typeof agac === 'object') {
    for (const [k, v] of Object.entries(agac as Record<string, unknown>)) duzlestir(v, onek ? `${onek}.${k}` : k, cikti)
  }
  return cikti
}

const DILLER = [
  ['tr', tr],
  ['en', en],
] as const

/**
 * Kaynağı ELLE doğrulanıp eklenmiş rakamlar: `sözlük anahtarı → kaynak satırı`. BUGÜN BOŞ: hava perdesi
 * "problem" bölümünün hiçbir rakamı kaynak dizininde (Vortice AIR DOOR kataloğu) geçmiyor. Rakam geri
 * koymak isteyen, kaynağın dosya + sayfa + AYNEN geçen ifadesini buraya yazar; yazamıyorsa rakam girmez.
 */
const KAYNAKLI_RAKAM_IZNI: Readonly<Record<string, string>> = {}

describe('INV-VITRIN-KAYNAKSIZ-1 (URN-80)', () => {
  describe('altbilgi: çalışma saati yok', () => {
    it('hiçbir kaynak dosyada SAAT ARALIĞI metin sabiti yok (ör. "09:00 - 18:00")', () => {
      const aralik = /\b\d{1,2}:\d{2}\s*[-–—]\s*\d{1,2}:\d{2}\b/
      const ihlal: string[] = []
      let tarananDosya = 0
      for (const dosya of kaynakDosyalari(path.join(KOK, 'src'))) {
        const metin = fs.readFileSync(dosya, 'utf8')
        tarananDosya++
        if (!aralik.test(metin)) continue // ucuz ön eleme; yorumdaki eşleşmeyi aşağıdaki AST eler
        for (const sabit of metinSabitleri(metin, dosya)) {
          if (aralik.test(sabit)) ihlal.push(`${path.relative(KOK, dosya)} · "${sabit.trim().slice(0, 60)}"`)
        }
      }
      // BOŞ EVREN MUHAFIZI: dizin yolu bozulursa liste boş kalır ve kapı sahte-yeşil verirdi.
      expect(tarananDosya, 'src altında kaynak dosya bulunamadı — tarayıcı kör').toBeGreaterThan(500)
      expect(ihlal, 'kaynaksız çalışma saati geri gelmiş:\n' + ihlal.join('\n')).toEqual([])
    })

    it.each(DILLER)('%s altbilgi sözlüğünde saat aralığı yok; başlık ve yönlendirme cümlesi, iletişim formu bağlantısı ve e-posta var', (_dil, d) => {
      const altbilgi = d.footer as Record<string, unknown>
      // URN-82: `workingHours`/`weekdays` anahtar ADLARI tarihsel (Blog tablosu bu adlarla yazar); değerleri artık saat değil,
      // "Teklif ve Sorular" başlığı ve yönlendirme cümlesi. Kapı adı değil DEĞERİ denetler: saat aralığı geri gelirse kırılır.
      expect(Object.keys(altbilgi), 'footer.saturday (boş, tüketicisiz anahtar) geri gelmiş').not.toContain('saturday')
      for (const anahtar of ['workingHours', 'weekdays'] as const) {
        const deger = altbilgi[anahtar]
        expect(deger, `footer.${anahtar} metin değil`).toEqual(expect.any(String))
        expect((deger as string).trim().length, `footer.${anahtar} boş`).toBeGreaterThan(3)
        expect(deger as string, `footer.${anahtar} saat aralığı taşıyor`).not.toMatch(/\d{1,2}\s?[:.]\s?\d{2}/)
        expect(deger as string, `footer.${anahtar} çalışma saati kalıbı`).not.toMatch(/Çalışma Saat|Working Hours|Hafta İçi|Cumartesi|Saturday|Monday/i)
      }
      expect(altbilgi.contactForm, 'footer.contactForm (iletişim formu bağlantı metni) yok').toEqual(expect.any(String))
      expect((altbilgi.contactForm as string).length).toBeGreaterThan(3)
      expect(altbilgi.email).toBe('info@venthub.com.tr')
    })

    it('Footer bileşeni saat sabitleri taşımıyor; "Teklif ve Sorular" başlığını, cümlesini ve iletişim bağlantısını sözlükten çiziyor', () => {
      const sabitler = metinSabitleri(oku('src', 'components', 'Footer.tsx'), 'Footer.tsx').join('\n')
      expect(sabitler, 'footer.saturday Footer\'da yeniden kullanılıyor').not.toContain('footer.saturday')
      expect(sabitler).not.toMatch(/\d{1,2}\s?:\s?\d{2}/)
      for (const gerekli of ['footer.workingHours', 'footer.weekdays', 'footer.contactForm']) {
        expect(sabitler, `${gerekli} Footer'da çizilmiyor`).toContain(gerekli)
      }
    })
  })

  describe('ana sayfa: koda gömülü deneyim sayacı yok', () => {
    it('KnowledgeBlock JSX içinde çıplak sayı basmaz ve sayaç props/anahtarlarını taşımaz', () => {
      const metin = oku('src', 'components', 'home', 'KnowledgeBlock.tsx')
      expect(jsxCiplakSayilar(metin), 'JSX içinde koda gömülü sayı (ör. {15}) var').toEqual([])
      const adlar = ozellikAdlari(metin)
      expect(metin.includes('statsExperience'), 'statsExperience props geri gelmiş').toBe(false)
      expect(metin.includes('statsPipelineLabel'), 'statsPipelineLabel geri gelmiş').toBe(false)
      expect(adlar).not.toContain('statsExperience')
    })

    it.each(DILLER)('%s sözlükte home.stats ve knowledge.statsPipelineLabel yok', (_dil, d) => {
      const ana = d.home as Record<string, unknown>
      expect(Object.keys(ana), 'home.stats geri gelmiş (deneyim yılı kayıtlı değil)').not.toContain('stats')
      expect(Object.keys(ana.knowledge as Record<string, unknown>)).not.toContain('statsPipelineLabel')
    })
  })

  describe('hava perdesi problem bölümü: kaynaksız rakam yok', () => {
    it('ProblemSection kartlarında `stat` alanı ve rakamlı metin sabiti yok', () => {
      const metin = oku('src', 'components', 'category', 'sections', 'ProblemSection.tsx')
      expect(ozellikAdlari(metin), 'kartlara `stat` alanı geri gelmiş').not.toContain('stat')
      const rakamli = metinSabitleri(metin).filter((s) => /%\s?\d|\d\s?%|\d\s?°|\d\s?m\/s|^\s*\d+\s*\/\s*\d+\s*$/.test(s))
      expect(rakamli, 'koda gömülü rakam/birim sabiti var').toEqual([])
    })

    it.each(DILLER)('%s category.problemSection sözlüğü rakam taşımaz (kaynaklı izin listesi dışında)', (_dil, d) => {
      const bolum = (d.category as Record<string, unknown>).problemSection
      const rakamli = Object.entries(duzlestir(bolum, 'category.problemSection'))
        .filter(([anahtar, deger]) => /\d/.test(deger) && !(anahtar in KAYNAKLI_RAKAM_IZNI))
        .map(([anahtar, deger]) => `${anahtar} = "${deger}"`)
      expect(
        rakamli,
        'kaynak dizininde geçmeyen rakam (ör. "%30\'a varan tasarruf") geri gelmiş. Rakam gerçekten kaynaklıysa ' +
          'KAYNAKLI_RAKAM_IZNI\'ne dosya + sayfa + AYNEN geçen ifadeyle eklenir:\n' + rakamli.join('\n'),
      ).toEqual([])
      // BOŞ EVREN MUHAFIZI: bölüm adı değişirse `duzlestir` boş döner ve kol sahte-yeşil verirdi.
      expect(Object.keys(duzlestir(bolum, '')).length, 'category.problemSection bulunamadı — tarayıcı kör').toBeGreaterThan(10)
    })
  })

  describe('ana sayfa vitrini: görsel alt metni olgusal', () => {
    it('CinematicProductShowcase ham İngilizce pazarlama etiketi taşımaz, alt metni sözlükten alır', () => {
      const metin = oku('src', 'components', 'home', 'CinematicProductShowcase.tsx')
      // Görsel DOSYA YOLLARI ('/images/vortice_lineo_futuristic.webp') dosya adıdır, ekranda okunan metin değil.
      const sabitler = metinSabitleri(metin).filter((s) => !s.startsWith('/images/')).join('\n')
      expect(sabitler).not.toMatch(/futuristic|premium|360 series/i)
      expect(sabitler).toContain('home.cinematicShowcase.imageAlt.airflow')
      expect(sabitler).toContain('home.cinematicShowcase.imageAlt.side')
    })

    it.each(DILLER)('%s sözlükte iki görsel alt metni var, marka/ürün adı taşır, üstünlük sözü taşımaz', (_dil, d) => {
      const alt = ((d.home as Record<string, unknown>).cinematicShowcase as Record<string, unknown>).imageAlt as Record<string, string>
      for (const anahtar of ['airflow', 'side']) {
        expect(alt[anahtar], `imageAlt.${anahtar} yok`).toEqual(expect.any(String))
        expect(alt[anahtar]).toMatch(/Vortice/)
        expect(alt[anahtar]).not.toMatch(/futuristic|premium|en iyi|best|akıllı|smart|ultra/i)
      }
    })
  })

  describe('müşteriye giden föy: marka dışı söz yok', () => {
    it('pdfGenerator metin sabitlerinde "HVAC PREMIUM", "Akıllı Sistem" ve "Smart System" yok', () => {
      const sabitler = metinSabitleri(oku('src', 'lib', 'pdfGenerator.ts'), 'pdfGenerator.ts').join('\n')
      expect(sabitler).not.toMatch(/HVAC PREMIUM/i)
      expect(sabitler).not.toMatch(/Akıllı Sistem/i)
      expect(sabitler).not.toMatch(/Smart System/i)
      // alt bilgi marka adıyla kalır
      expect(sabitler).toContain('VentHub ile oluşturulmuştur.')
      expect(sabitler).toContain('Generated by VentHub.')
    })
  })

  describe('Hakkımızda ve sözlük: şirketin "15+ yıl" deneyim iddiası yok (URN-82, karar 317)', () => {
    /**
     * Şirketin deneyim yılı iddiası: "15+", "15 yıl", "15 yıllık", "15 years", "15-year". NİÇİN: kayıtta şirketin deneyim
     * yılı YOK (kurucunun saha yılı vitrinde şirket iddiasına dönüşüyordu): Hakkımızda sayaç kartı, hero rozeti, hikâye
     * ve üst veri cümlesi, ana sayfa "neden biz" paragrafı. Sayının önünde rakam ya da ondalık ayracı varsa ("2015",
     * "1,5") 15 başka bir sayının parçasıdır, eşleşmez.
     */
    const DENEYIM_IDDIASI = /(?:^|[^\d.,])15\s*\+|(?:^|[^\d.,])15[\s-]*(?:yıl|yil|year)/i
    /** Deneyim ETİKETİ: sayı olmasa da şirketin yıllık deneyimini söyleyen kalıp (sayaç etiketi `aboutPage.experience`). */
    const DENEYIM_ETIKETI = /yıllık\s+(?:tecrübe|deneyim)|years?\s+of\s+(?:field\s+|engineering\s+)?experience|yıl\s+(?:mühendislik\s+)?deneyim/i

    /**
     * ADI KONMUŞ İSTİSNA: bir MÜHENDİSLİK DEĞERİ (hesap girdisi, öneri aralığı: "15+ ACH") şirket iddiası değildir.
     * `sözlük anahtarı → gerekçe + kaynak`. BUGÜN BOŞ: master'daki tek örnek (`calculators.jetFan.achTunnelHint`,
     * "Tünel: 15+ ACH önerilen") URN-82 metin tablosunda zaten başka bir cümleyle değişti. Mühendislik değeri geri
     * konursa anahtar yolu + kaynağın AYNEN geçen ifadesi buraya yazılır; yazılamıyorsa değer girmez.
     */
    const MUHENDISLIK_DEGERI_ISTISNASI: Readonly<Record<string, string>> = {}

    /**
     * Saf dedektör: değer bir deneyim iddiası mı (sentetik girdiyle sınanır). Türkçe büyük harfli yazım ("YILLIK
     * DENEYİM") ve bölünmez boşluk (NBSP) kalıbı atlatmasın diye metin iki küçük harf kuralıyla da denenir: genel
     * (İngilizce "EXPERIENCE" için) ve tr-TR ("I" → "ı", "İ" → "i").
     */
    const deneyimIddiasiMi = (deger: string): boolean => {
      const duz = deger.replace(/ /g, ' ')
      return [duz.toLowerCase(), duz.toLocaleLowerCase('tr-TR')].some((k) => DENEYIM_IDDIASI.test(k) || DENEYIM_ETIKETI.test(k))
    }

    it('dedektör (sentetik): master\'daki ham ifadeleri yakalar, mühendislik sayısı da takılır (adlı istisna için), başka sayıların parçası takılmaz', () => {
      const yakalanmali = [
        '15+ Yıl Mühendislik Deneyimi',
        '15 yılı aşkın saha deneyimimizle',
        '15 yıllık saha tecrübesiyle',
        '15+ yıllık deneyimimiz ve dünya standartlarındaki ürünlerimizle',
        '15+ Years of Engineering Experience',
        'With more than 15 years of field experience',
        '15 years of field experience',
        'With 15+ years of experience and world-class products',
        'Yıllık Tecrübe',
        'Years of Experience',
        'a 15-year track record',
      ]
      for (const s of yakalanmali) expect(deneyimIddiasiMi(s), `yakalanmadı: ${s}`).toBe(true)
      // Mühendislik sayısı DEDEKTÖRE takılır (bu yüzden adlı istisna tablosu var); başka sayının parçası takılmaz.
      expect(deneyimIddiasiMi('Tünel: 15+ ACH önerilen')).toBe(true)
      for (const s of ['2015 yılında', '115 yıllık', '1,5 yıl', 'Ürün Ailesi', 'Katalog ve Teklif Sitesi', 'Hava değişim hızını girin']) {
        expect(deneyimIddiasiMi(s), `yanlış yakalandı: ${s}`).toBe(false)
      }
    })

    it('AboutPage: sayaç kartı, deneyim etiketi anahtarı ve deneyim ifadesi taşımaz (kod yorumları sayılmaz)', () => {
      const metin = oku('src', 'views', 'AboutPage.tsx')
      const sabitler = metinSabitleri(metin, 'AboutPage.tsx')
      const iddia = sabitler.filter(deneyimIddiasiMi)
      expect(iddia, 'AboutPage çalışma anında bir deneyim yılı iddiası basıyor:\n' + iddia.join('\n')).toEqual([])
      expect(sabitler, 'AboutPage hâlâ aboutPage.experience etiketini okuyor').not.toContain('aboutPage.experience')
      expect(ozellikAdlari(metin, 'AboutPage.tsx'), 'stats kartında `experience` alanı').not.toContain('experience')
    })

    it.each(DILLER)('%s sözlüğünün HİÇBİR değeri şirketin deneyim yılı iddiasını taşımaz (adlı istisna dışında)', (_dil, d) => {
      const tum = duzlestir(d, '')
      // BOŞ EVREN MUHAFIZI: düzleştirme boş dönerse kol sahte-yeşil verirdi.
      expect(Object.keys(tum).length, 'sözlük düzleştirilemedi — tarayıcı kör').toBeGreaterThan(1000)
      const ihlal = Object.entries(tum)
        .filter(([anahtar, deger]) => deneyimIddiasiMi(deger) && !(anahtar in MUHENDISLIK_DEGERI_ISTISNASI))
        .map(([anahtar, deger]) => `${anahtar} = "${deger}"`)
      expect(
        ihlal,
        'sözlükte şirketin deneyim yılı iddiası var (kayıtta deneyim yılı yok; karar 317: yerine yıl ya da deneyim ' +
          'söylemeyen metin girer). Mühendislik DEĞERİ ise MUHENDISLIK_DEGERI_ISTISNASI\'na kaynakla yazılır:\n' + ihlal.join('\n'),
      ).toEqual([])
    })

    it('adlı istisna tablosundaki her anahtar sözlükte gerçekten var (bayat istisna kalmaz)', () => {
      const trDuz = duzlestir(tr, '')
      const enDuz = duzlestir(en, '')
      for (const anahtar of Object.keys(MUHENDISLIK_DEGERI_ISTISNASI)) {
        expect(trDuz[anahtar], `istisna anahtarı TR sözlükte yok: ${anahtar}`).toEqual(expect.any(String))
        expect(enDuz[anahtar], `istisna anahtarı EN sözlükte yok: ${anahtar}`).toEqual(expect.any(String))
      }
    })

    it.each(DILLER)('%s aboutPage bloğunda deneyim etiketi anahtarı (experience) yok', (_dil, d) => {
      const sayfa = d.aboutPage as Record<string, unknown>
      expect(Object.keys(sayfa)).not.toContain('experience')
    })
  })

  describe('sözlük: şirketin / mağazanın kuruluş durumu ilanı yok (URN-96, karar 317)', () => {
    /**
     * Kuruluş durumunu ilan eden kalıp: "Mağazamız kuruluş aşamasında", "Our store is still being set up",
     * "Şirket bilgileri kuruluşla eklenecek", "upon incorporation". NİÇİN: kayıtta şirket kurulmuş sayılmıyor ve kuruluş
     * durumunu söylemek vitrinde kaynaksız bir şirket beyanıdır (#1813 içerik kuralı). URN-94 yasal sayfa gövdesinden,
     * URN-96 SSS cevabından kaldırdı; bu kol aynı sınıfın sözlüğe başka yerden geri girmesini kapıda tutar.
     * Gerçek (çevrimiçi ödeme kapalı, sipariş için teklif istenir) ayrıca ve nötr söylenir.
     */
    const KURULUS_DURUMU = /kuruluş\s+aşamasında|kuruluşla\s+eklenecek|being\s+set\s+up|upon\s+incorporation/i

    /**
     * JS'te `i` bayrağı "ı" ile "I"yı eşleştirmez (ASCII'ye düşen büyük harf dönüşümü yasak); "AŞAMASINDA" kaçardı.
     * Deneyim dedektöründeki gibi metin iki küçük harf kuralıyla da denenir: genel ve tr-TR ("I" → "ı").
     * Bölünmez boşluk (NBSP) kalıptaki `\s` ile zaten eşleşir.
     */
    const kurulusDurumuMu = (deger: string): boolean =>
      [deger.toLowerCase(), deger.toLocaleLowerCase('tr-TR')].some((k) => KURULUS_DURUMU.test(k))

    it('dedektör (sentetik): ilan kalıbını yakalar, nötr gerçek cümlesini ve "teklif aşamasında"yı yakalamaz', () => {
      const yakalanmali = [
        'Mağazamız kuruluş aşamasında olduğu için çevrimiçi ödeme henüz açık değil.',
        'Şirket bilgileri kuruluşla eklenecek',
        'MAĞAZAMIZ KURULUŞ AŞAMASINDA',
        'Our store is still being set up, so online payment is not open yet.',
        'Company details will be added upon incorporation',
      ]
      for (const s of yakalanmali) expect(kurulusDurumuMu(s), `yakalanmadı: ${s}`).toBe(true)
      const yakalanmamali = [
        'Çevrimiçi ödeme henüz açık değil. Sipariş için bizden teklif isteyebilirsiniz.',
        'Online payment is not open yet. You can request a quote from us to place an order.',
        'Bilgi eklenecek',
        'To be added',
        'Teslimat süresi ve sevkiyat koşulları teklif aşamasında netleştirilir.',
      ]
      for (const s of yakalanmamali) expect(kurulusDurumuMu(s), `yanlış yakalandı: ${s}`).toBe(false)
    })

    it.each(DILLER)('%s sözlüğünün HİÇBİR değeri şirketin/mağazanın kuruluş durumunu ilan etmez', (_dil, d) => {
      const tum = duzlestir(d, '')
      // BOŞ EVREN MUHAFIZI: düzleştirme boş dönerse kol sahte-yeşil verirdi.
      expect(Object.keys(tum).length, 'sözlük düzleştirilemedi — tarayıcı kör').toBeGreaterThan(1000)
      const ihlal = Object.entries(tum)
        .filter(([, deger]) => kurulusDurumuMu(deger))
        .map(([anahtar, deger]) => `${anahtar} = "${deger}"`)
      expect(
        ihlal,
        'sözlükte şirketin/mağazanın kuruluş durumu ilan ediliyor (karar 317: kaldırma sorulmaz; gerçek nötr cümleyle ' +
          'söylenir: "Çevrimiçi ödeme henüz açık değil"):\n' + ihlal.join('\n'),
      ).toEqual([])
    })
  })
})
