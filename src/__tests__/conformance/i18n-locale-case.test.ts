import fs from 'node:fs'
import path from 'node:path'

import { describe, expect,it } from 'vitest'

/**
 * INV-8 — locale'siz kasa çevirimi KULLANICI METNİNE uygulanmaz.
 *
 * Cetvel: docs/standards/i18n-localization-standard.md — eksen C
 *         (INV-8 satırı ALTYAPI şeridinde eklenecek; hazır metin ölçüm belgesinin §8'inde)
 * Ölçüm:  docs/audits/locale-kasa-envanteri-2026-08-23.md
 *
 * NİÇİN: `String.prototype.toLowerCase()` / `toUpperCase()` **locale'den bağımsızdır**.
 * Türkçe'de `İ → i̇` (birleşen nokta) ve `I → i` (`ı` değil) üretirler. Sonuç sessizdir:
 * arama boş döner, ekrana yanlış harf basılır, CSV içe alımında kategori eşleşmez.
 *
 * NE ÖLÇER: kasa çevirimini, önünde KULLANICI METNİ adı geçen bir ifadeye uygulayan
 * satırlar. Teknik dizeler (slug, SKU, para birimi, durum enum'u, hex kimlik, DOM
 * `tagName`) bilerek KAPSAM DIŞIDIR — orada locale'siz çağrı DOĞRU kullanımdır.
 *
 * NASIL ÇALIŞIR: mandal (ratchet). Aşağıdaki DONMUS_BORC dışında hiçbir dosya ihlal
 * edemez; borçlu dosyalar da sayılarını ARTIRAMAZ. Düşürünce liste güncellenir
 * (4. kol bunu zorlar) — böylece borç yalnız tek yönde, aşağı gider.
 *
 * DÜZELTME: `src/i18n/case.ts` → `localeLower` / `localeUpper` (ekran),
 * `foldForSearch` (arama/eşleştirme).
 */

const KOK = path.resolve(__dirname, '../../..')
const SRC = path.join(KOK, 'src')

const CAGRI = /\.to(?:Lower|Upper)Case\(\)/g
/** Çağrının ÖNÜNDEKİ ifadede geçerse "kullanıcı metni" sayılır. */
const METIN_ADI = /(?:name|title|label|summary|query|search|term|heading|caption|description)/i
/** Çağrıdan geriye bakılacak karakter sayısı (alıcı ifade zinciri). */
const ONEK_PENCERE = 90

/**
 * Donmuş borç — dosya → ihlal sayısı. Her satırda SAHİP ve SINIF yazılıdır.
 * "teknik" = yanlış pozitif, dize zaten ASCII; kayıt amaçlı donmuştur.
 * "GERÇEK" = düzeltilmesi gereken kusur; sahibi kendi şeridinde kapatacak.
 */
const DONMUS_BORC: ReadonlyArray<readonly [string, number]> = [
  // --- teknik (ASCII dize; locale'siz çağrı DOĞRU) ---
  ['src/components/authority/AuthorityRenderer.tsx', 1], // teknik: Lucide ikon adı
  ['src/components/authority/TechnicalDrawingAuthority.tsx', 1], // teknik: dosya formatı (pdf→PDF)
  ['src/views/OrdersPage.tsx', 2], // teknik: sipariş kodu + kimlik dilimi (hex)
  ['src/views/admin/quotes/QuotesTableBody.tsx', 1], // teknik: kullanıcı kimliği dilimi (hex)
  ['src/views/checkout/injectCheckoutForm.ts', 2], // teknik: DOM nodeName / tagName

  // --- GERÇEK kusur; sahibi kapatacak ---
  ['src/components/admin/CommandPalette.tsx', 2], // GERÇEK · ADMIN · komut araması Türkçe etiketi bulamaz
  ['src/components/admin/dashboard/ActivityHeatmap.tsx', 1], // GERÇEK · ADMIN · gün adı "PAZARTESI"
  ['src/components/category/sections/BottomCTA.tsx', 1], // GERÇEK · ÜRÜN · MÜŞTERİ EKRANI: "i̇ç ortam fanları"
  ['src/views/admin/AdminInventoryReportPage.tsx', 6], // GERÇEK · ADMIN · ürün adı araması
  ['src/views/admin/AdminUsersTableBody.tsx', 1], // GERÇEK · ADMIN · avatar baş harfi
  ['src/views/admin/CategoriesTableBody.tsx', 1], // GERÇEK · ADMIN · kategori adı "SIRKÜLASYON"
  ['src/views/admin/ProductsTableBody.tsx', 1], // GERÇEK · ÜRÜN · kategori adı "SIRKÜLASYON"
]

interface Ihlal {
  dosya: string
  satir: number
  metin: string
}

function kaynakDosyalari(dizin: string, birikim: string[] = []): string[] {
  for (const giris of fs.readdirSync(dizin, { withFileTypes: true })) {
    if (giris.isDirectory()) {
      if (giris.name === 'node_modules' || giris.name === '.next' || giris.name === '__tests__') continue
      kaynakDosyalari(path.join(dizin, giris.name), birikim)
    } else if (giris.name.endsWith('.ts') || giris.name.endsWith('.tsx')) {
      birikim.push(path.join(dizin, giris.name))
    }
  }
  return birikim
}

/** Tek bir kaynak metninde ihlalleri bulur. Kanarya da bu fonksiyonu çağırır. */
function ihlalleriBul(kaynak: string, dosyaAdi: string): Ihlal[] {
  const cikti: Ihlal[] = []
  kaynak.split('\n').forEach((satir, i) => {
    CAGRI.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = CAGRI.exec(satir)) !== null) {
      const onek = satir.slice(Math.max(0, m.index - ONEK_PENCERE), m.index)
      if (METIN_ADI.test(onek)) cikti.push({ dosya: dosyaAdi, satir: i + 1, metin: satir.trim().slice(0, 120) })
    }
  })
  return cikti
}

function tara(): { ihlaller: Ihlal[]; taranan: number } {
  const dosyalar = kaynakDosyalari(SRC)
  const ihlaller: Ihlal[] = []
  for (const tam of dosyalar) {
    const goreli = path.relative(KOK, tam).split(path.sep).join('/')
    ihlaller.push(...ihlalleriBul(fs.readFileSync(tam, 'utf8'), goreli))
  }
  return { ihlaller, taranan: dosyalar.length }
}

const { ihlaller, taranan } = tara()
const borcHaritasi = new Map(DONMUS_BORC.map(([d, n]) => [d, n]))
const sayim = new Map<string, number>()
for (const i of ihlaller) sayim.set(i.dosya, (sayim.get(i.dosya) ?? 0) + 1)

describe('INV-8: locale-siz kasa çevirimi kullanıcı metnine uygulanmaz', () => {
  it('0. KAPSAM: tarayıcı gerçekten dosya görüyor', () => {
    // Kapsam kanıtı olmadan "ihlal yok" cümlesi kanıt değildir — tarayıcı kör olabilir.
    expect(taranan).toBeGreaterThan(400)
  })

  it('0b. POZİTİF KONTROL: köşeli-parantezli App Router dizinleri taranıyor', () => {
    // 2026-08-23 (ALTYAPI ölçümü): git pathspec'te köşeli parantez GLOB KARAKTER SINIFIDIR.
    // `src/app/[lang]/**` deseni 'l|a|n|g' harflerinden BİRİNİ eşler, literal [lang] dizinini
    // DEĞİL — ve hata vermeden EKSİK liste döner. Bu tarayıcı fs.readdirSync ile yürür,
    // yani bağışıktır; ama "bağışık" bir varsayımdır ve varsayım ölçülmedikçe kanıt değildir.
    // Sayı tek başına kanıt olmadığı için ADIYLA iki dosya sınanır.
    const taranmisYollar = new Set(
      kaynakDosyalari(SRC).map((t) => path.relative(KOK, t).split(path.sep).join('/'))
    )
    for (const beklenen of [
      'src/app/[lang]/products/[slug]/page.tsx',
      'src/app/[lang]/page.tsx',
    ]) {
      expect(taranmisYollar.has(beklenen), `TARAYICI KÖR: ${beklenen} taranmadı`).toBe(true)
    }
  })

  it('1. KANARYA: dedektör bilinen bir ihlali YAKALAR', () => {
    // Sentetik girdi — dosya sisteminden bağımsız, regex'in kendisini sınar.
    const sentetik = [
      "const x = category.name.toUpperCase()",
      "const y = searchQuery.toLowerCase()",
      "const z = `${topic.title} ${topic.summary}`.toLowerCase()",
    ].join('\n')
    expect(ihlalleriBul(sentetik, 'kanarya.ts')).toHaveLength(3)
  })

  it('2. KANARYA: dedektör teknik dizeyi YAKALAMAZ (aşırı geniş değil)', () => {
    const teknik = [
      "const a = slug.toLowerCase()",
      "const b = currency.toUpperCase()",
      "const c = (status ?? '').toLowerCase()",
      "const d = key.toLowerCase()",
    ].join('\n')
    expect(ihlalleriBul(teknik, 'kanarya.ts')).toEqual([])
  })

  it('3. Donmuş listede OLMAYAN hiçbir dosya ihlal etmiyor', () => {
    const yeni = [...sayim.keys()].filter((d) => !borcHaritasi.has(d)).sort()
    expect(
      yeni,
      `YENİ İHLAL: locale'siz kasa çevirimi kullanıcı metnine uygulanmış.\n` +
        `Düzeltme: src/i18n/case.ts → localeLower / localeUpper (ekran), foldForSearch (arama).\n` +
        `Dosyalar:\n${yeni.map((d) => `  - ${d}`).join('\n')}`
    ).toEqual([])
  })

  it('4. Borçlu dosyalar ihlal sayısını ARTIRMIYOR', () => {
    const artan = [...sayim.entries()]
      .filter(([d, n]) => borcHaritasi.has(d) && n > borcHaritasi.get(d)!)
      .map(([d, n]) => `${d}: ${borcHaritasi.get(d)} → ${n}`)
      .sort()
    expect(artan, `BORÇ BÜYÜDÜ:\n${artan.join('\n')}`).toEqual([])
  })

  it('5. MANDAL: düşen borç listede güncellenmiş (ratchet tek yönlü)', () => {
    const bayat = DONMUS_BORC.filter(([d, n]) => (sayim.get(d) ?? 0) < n)
      .map(([d, n]) => `${d}: liste ${n}, gerçek ${sayim.get(d) ?? 0}`)
      .sort()
    expect(
      bayat,
      `BORÇ DÜŞTÜ ama liste güncellenmedi. DONMUS_BORC'u gerçek sayıya indir ` +
        `(0 olduysa satırı SİL) — yoksa mandal gevşer ve aynı kusur sessizce geri gelebilir:\n${bayat.join('\n')}`
    ).toEqual([])
  })
})
