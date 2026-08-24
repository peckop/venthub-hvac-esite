import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-9 — `localeCompare` DİL ARGÜMANI OLMADAN ÇAĞRILAMAZ.
 *
 * Cetvel: docs/standards/i18n-localization-standard.md — eksen D
 * Ölçüm:  docs/audits/locale-kasa-envanteri-2026-08-23.md §7
 *
 * NİÇİN: dil verilmezse `localeCompare` **çalışma ortamının varsayılan yerelini**
 * kullanır. Bu varsayılan sunucuda (Node) ve istemcide (tarayıcı) aynı olmak zorunda
 * değildir. Kusur "yanlış sıra" değil, **hidrasyonda DEĞİŞEN sıra**dır: sunucu bir
 * sırayla HTML basar, istemci başka bir sırayla yeniden sıralar.
 *
 * Ölçüldü (2026-08-23, aynı dizi, aynı çalıştırma):
 *   'tr' → Cam · Çatı · Isıtıcı · İç Ortam · Sığınak · Sirkülasyon
 *   'en' → Cam · Çatı · İç Ortam · Isıtıcı · Sirkülasyon · Sığınak
 * İki çift yer değiştirdi. Hangisini alacağınız TESADÜFE kalır.
 *
 * KURAL BİLEREK SEMANTİK DEĞİL: "bu ifade kullanıcı metni mi" diye tahmin etmiyoruz.
 * Kural tek ve kesin — dil argümanı VAR ya da YOK. Teknik sıralamalar (uuid, anahtar)
 * donmuş borçtadır; onlarda da dil vermek zararsızdır, sadece bugün yazılmamıştır.
 *
 * DÜZELTME: `src/i18n/sort.ts` → `compareText(a, b, lang)` / `byText(seçici, lang)`.
 */

const KOK = path.resolve(__dirname, '../../..')
const SRC = path.join(KOK, 'src')

/**
 * Donmuş borç — dosya → DİL ARGÜMANSIZ çağrı sayısı (2026-08-23: ölçüm 8 dosya / 9 çağrı → bu PR sonrası 5 dosya / 6 çağrı).
 *
 * Dosya→sayı tabanı bilinçli: `dosya:satır` kaydı komşu şeridin her düzenlemesinde
 * bayatlar ve KOD BOZULMADAN kırmızı verir (INV-7 bunu 2026-08-23'te yaşadı).
 *
 * Ratchet: liste yalnız KÜÇÜLEBİLİR.
 */
const DONMUS_BORC: ReadonlyArray<readonly [string, number]> = [
  // --- MÜŞTERİ EKRANI ---
  // Üçü bu PR'da DÜZELTİLDİ (ana sayfa · kategori geçidi · kategori listesi) ve listeden
  // ÇIKARILDI; mandal düşüşü kendisi zorladı (5. kol kırmızı verdi, elle hatırlamadım).
  ['src/components/products/VariantSelector.tsx', 1], // GERÇEK · ÜRÜN'e devredildi (OPS route, 2026-08-23)

  // --- teknik sıralama (uuid / anahtar); dil vermek zararsız ama acil değil ---
  ['src/lib/services/pricing.service.ts', 1], // teknik: id sıralaması
  ['src/lib/services/pricingPolicy.service.ts', 1], // teknik: id sıralaması
  ['src/utils/checkoutHelpers.ts', 2], // teknik: id sıralaması
  ['src/views/admin/AdminDashboardPage.tsx', 1], // teknik · ADMIN-CUSTOMER · anahtar sıralaması
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

/**
 * `localeCompare(` çağrısının argüman listesini PARANTEZ DENGELEYEREK okur ve
 * en üst seviyede virgül var mı diye bakar.
 *
 * NİÇİN dengeleme: naif `localeCompare\([^)]*,` deseni `String(b)` içindeki KAPANIŞ
 * parantezinde durur ve `String(a).localeCompare(String(b), 'tr')` çağrısını
 * "dil YOK" diye sayar. Bu kusuru 2026-08-23'te ölçüm aracımda YAŞADIM: araç
 * TEK YÖNE yanılıyordu ve dil argümanı olan iki satırı ihlal gösteriyordu.
 * Bu yüzden aşağıda iki taraflı kanarya var.
 */
function dilArgumaniVar(satir: string, cagriSonu: number): boolean {
  let derinlik = 1
  for (let i = cagriSonu; i < satir.length; i++) {
    const ch = satir[i]
    if (ch === '(') derinlik++
    else if (ch === ')') {
      derinlik--
      if (derinlik === 0) return false // argüman listesi bitti, virgül görülmedi
    } else if (ch === ',' && derinlik === 1) {
      return true // en üst seviyede ikinci argüman VAR
    }
  }
  // Satır içinde kapanmadı (çok satırlı çağrı) — kararsız; ihlal SAYMA.
  return true
}

/** Tek bir kaynak metninde ihlalleri bulur. Kanaryalar da bunu çağırır. */
function ihlalleriBul(kaynak: string, dosyaAdi: string): Ihlal[] {
  const cikti: Ihlal[] = []
  const CAGRI = /\.localeCompare\(/g
  kaynak.split('\n').forEach((satir, i) => {
    // YORUM SATIRLARI KAPSAM DISI. Bu kapinin SSOT'u olan `src/i18n/sort.ts`, kusuru
    // ANLATMAK icin dokuman yorumunda `localeCompare(b)` yaziyor; tarayici yorumu koddan
    // ayirmazsa kendi cozumunu ihlal sayar (olculdu, 2026-08-23'te tam bunu yapti).
    const kirpik = satir.trim()
    if (kirpik.startsWith('*') || kirpik.startsWith('//') || kirpik.startsWith('/*')) return
    CAGRI.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = CAGRI.exec(satir)) !== null) {
      if (!dilArgumaniVar(satir, m.index + m[0].length)) {
        cikti.push({ dosya: dosyaAdi, satir: i + 1, metin: satir.trim().slice(0, 120) })
      }
    }
  })
  return cikti
}

function tara(): { ihlaller: Ihlal[]; taranan: number; yollar: Set<string> } {
  const dosyalar = kaynakDosyalari(SRC)
  const ihlaller: Ihlal[] = []
  const yollar = new Set<string>()
  for (const tam of dosyalar) {
    const goreli = path.relative(KOK, tam).split(path.sep).join('/')
    yollar.add(goreli)
    ihlaller.push(...ihlalleriBul(fs.readFileSync(tam, 'utf8'), goreli))
  }
  return { ihlaller, taranan: dosyalar.length, yollar }
}

const { ihlaller, taranan, yollar } = tara()
const borcHaritasi = new Map(DONMUS_BORC.map(([d, n]) => [d, n]))
const sayim = new Map<string, number>()
for (const i of ihlaller) sayim.set(i.dosya, (sayim.get(i.dosya) ?? 0) + 1)

describe('INV-9: localeCompare dil argümanı olmadan çağrılamaz', () => {
  it('0. KAPSAM: tarayıcı gerçekten dosya görüyor', () => {
    expect(taranan).toBeGreaterThan(400)
  })

  it('0b. POZİTİF KONTROL: köşeli-parantezli App Router dizinleri taranıyor', () => {
    // git pathspec ve glob dünyasında `[lang]` KARAKTER SINIFIDIR ve o dizin sessizce
    // listeden düşer. Bu tarayıcı fs.readdirSync ile yürüdüğü için bağışık — ama
    // "bağışık" bir varsayımdır; ADIYLA sınanır.
    for (const beklenen of ['src/app/[lang]/page.tsx', 'src/app/[lang]/products/[slug]/page.tsx']) {
      expect(yollar.has(beklenen), `TARAYICI KÖR: ${beklenen} taranmadı`).toBe(true)
    }
  })

  it('1. KANARYA (pozitif): dilsiz çağrıyı YAKALAR', () => {
    const sentetik = [
      'sorted.sort((a, b) => a.name.localeCompare(b.name))',
      '.sort(([a], [b]) => a.localeCompare(b))',
      'x.sort((a, b) => (m.get(b)! - m.get(a)!) || a.localeCompare(b))',
    ].join('\n')
    expect(ihlalleriBul(sentetik, 'kanarya.ts')).toHaveLength(3)
  })

  it('2. KANARYA (negatif): dilli çağrıyı YAKALAMAZ — İÇ İÇE PARANTEZ DAHİL', () => {
    // İkinci satır, ölçüm aracımı 2026-08-23'te yanıltan tam biçimdir:
    // naif `[^)]*,` deseni String(b)'nin kapanışında durur ve bunu ihlal sayar.
    const dilli = [
      "return a.localeCompare(b, 'tr')",
      "return String(a).localeCompare(String(b), 'tr')",
      'return valueOf(a).localeCompare(valueOf(b), lang) * factor',
    ].join('\n')
    expect(ihlalleriBul(dilli, 'kanarya.ts')).toEqual([])
  })

  it('2b. KANARYA: YORUM icindeki cagriyi ihlal SAYMAZ', () => {
    const yorumlu = [
      ' * `String.prototype.localeCompare(b)` dil parametresi verilmezse...',
      '// eski kod: a.localeCompare(b)',
      '/* a.localeCompare(b) */',
    ].join('\n')
    expect(ihlalleriBul(yorumlu, 'kanarya.ts')).toEqual([])
  })

  it('3. Donmuş listede OLMAYAN hiçbir dosya ihlal etmiyor', () => {
    const yeni = [...sayim.keys()].filter((d) => !borcHaritasi.has(d)).sort()
    expect(
      yeni,
      'localeCompare dil argümanı olmadan çağrılmış. Dil verilmezse sıra ÇALIŞMA ORTAMININ ' +
        'varsayılanına kalır ve SSR ile istemci arasında DEĞİŞEBİLİR.\n' +
        'Düzeltme: src/i18n/sort.ts → compareText(a, b, lang) / byText(seçici, lang).\n' +
        `Dosyalar:\n${yeni.map((d) => `  - ${d}`).join('\n')}`,
    ).toEqual([])
  })

  it('4. Borçlu dosyalar ihlal sayısını ARTIRMIYOR', () => {
    const artan = [...sayim.entries()]
      .filter(([d, n]) => borcHaritasi.has(d) && n > borcHaritasi.get(d)!)
      .map(([d, n]) => `${d}: ${borcHaritasi.get(d)} → ${n}`)
      .sort()
    expect(artan, `BORÇ BÜYÜDÜ:\n${artan.join('\n')}`).toEqual([])
  })

  it('5. MANDAL: düşen borç listede güncellenmiş (tek yönlü)', () => {
    const bayat = DONMUS_BORC.filter(([d, n]) => (sayim.get(d) ?? 0) < n)
      .map(([d, n]) => `${d}: liste ${n}, gerçek ${sayim.get(d) ?? 0}`)
      .sort()
    expect(
      bayat,
      "BORÇ DÜŞTÜ ama liste güncellenmedi. DONMUS_BORC'u gerçek sayıya indir " +
        `(0 olduysa satırı SİL) — yoksa mandal gevşer:\n${bayat.join('\n')}`,
    ).toEqual([])
  })
})
