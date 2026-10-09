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
 * (bkz. URN-80 raporu "riskler") burada yeşil görünür; genel tarama değildir.
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
})
