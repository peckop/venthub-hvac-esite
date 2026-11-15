/**
 * INV-ASISTAN-* — ürün asistanının DETERMİNİSTİK çekirdeğinin kalıcı kapıları (URN-171, adım 1).
 *
 * Cetvel: docs/plans/urun-asistani-kapsam-guvenlik-notu-2026-11-15.md §4 (docs/standards/urun-asistani-standard.md
 * yazılana dek). Bu dosya model ÇAĞIRMAZ: modele giden yükü ve kullanıcıya basılan metni üreten saf kodu sınar.
 * Model kolu (süzgeç doğruluğu, enjeksiyon vb.) CI dışı değerlendirme kümesinin işidir (plan §4 madde 12-b).
 *
 *  · INV-ASISTAN-1      modele giden satırda YASAK alan yok (sku, model_code, barkod, price, purchase_price, stock_qty,
 *                       description_i18n): davranış (sentinel değerler) + okunan ham alanların statik listesi.
 *  · INV-ASISTAN-2      şablon çıktısında "uygun" yok, her sayı satırdan, ses sayısı daima "3 m" koşullu, ham anahtar yok.
 *  · INV-ASISTAN-TENANT asistan kodu kiracıyı istek başlığından okumaz (kiracı RLS'ten gelir, plan §4 madde 11).
 *  · INV-ASISTAN-IP     istemci IP sırası emsalle (quote-request-guest) aynı.
 *
 * Her kapının KANARYASI iki yönlüdür: bozuk örnek YAKALANMALI, temiz örnek yakalanMAMALI. Tek yönlü kanarya, deseni
 * ".*" yaparak da geçilir (docs/standards, spec-axis-gate.test.ts ile aynı ders).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'
import {
  ADH_225,
  ADH_225_ID,
  cevirEn,
  cevirTr,
  cokSatir,
  hamSatir,
  LINEO_125,
  LINEO_125_3M,
  LINEO_125_3M_ID,
  LINEO_125_ID,
  satirKur,
  SEAT_20,
  SEAT_20_B,
  SEAT_20_B_ID,
  SEAT_20_ID,
  SENTINELLER,
  STORM_16,
  STORM_16_ID,
  TUM_HAM_SATIRLAR,
} from '@/lib/asistan/__tests__/fikstur'
import { MAKS_URUN } from '@/lib/asistan/hataYollari'
import {
  type AsistanSatiri,
  IZINLI_SPEC_ANAHTARLARI,
  izinliSatirlariKur,
  MODELE_GITMEYEN_ALANLAR,
  yasakAlanBul,
} from '@/lib/asistan/izinListesi'
import { cevapMetniUret } from '@/lib/asistan/sablonBasici'
import type { Karsilastirma } from '@/lib/asistan/semalar'
import { SPEC_ANAHTARLARI } from '@/lib/services/wizard.service'

const ASISTAN_DIZINI = join(process.cwd(), 'src', 'lib', 'asistan')

function kaynakDosyalari(): Array<{ ad: string; kaynak: string }> {
  return readdirSync(ASISTAN_DIZINI)
    .filter((ad) => ad.endsWith('.ts') && statSync(join(ASISTAN_DIZINI, ad)).isFile())
    .sort()
    .map((ad) => ({ ad, kaynak: readFileSync(join(ASISTAN_DIZINI, ad), 'utf8') }))
}

/** Yorumları siler (örnek kod ve açıklamalar kapıyı yanıltmasın). Satır sayısı korunmaz; yalnız içerik taranır. */
function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1')
}

describe('kapsam sağlığı (boş evren = kör kapı)', () => {
  it('asistan dizininde beklenen kaynak dosyalar taranıyor', () => {
    const adlar = kaynakDosyalari().map((d) => d.ad)
    for (const beklenen of [
      'ceviri.ts',
      'hataYollari.ts',
      'istemciIp.ts',
      'izinListesi.ts',
      'maskele.ts',
      'sablonBasici.ts',
      'semalar.ts',
    ]) {
      expect(adlar, `${beklenen} taranmiyor: dizin tasinmis olabilir`).toContain(beklenen)
    }
  })
})

// ───────────────────────── INV-ASISTAN-1 ─────────────────────────

describe('INV-ASISTAN-1 — modele giden satırda yasak alan yok', () => {
  const { satirlar } = izinliSatirlariKur(TUM_HAM_SATIRLAR)

  it('girdi gerçekten yasak alanları taşıyor (kanaryanın kendisi kör değil)', () => {
    expect(satirlar).toHaveLength(TUM_HAM_SATIRLAR.length)
    for (const ham of TUM_HAM_SATIRLAR) {
      const bulunan = yasakAlanBul(ham).map((y) => y.split('.').pop())
      for (const alan of MODELE_GITMEYEN_ALANLAR) expect(bulunan, `${alan} girdide yok`).toContain(alan)
    }
  })

  it('çıktı yükünde yasak alan adı yok ve sentinel değerlerin hiçbiri geçmiyor', () => {
    expect(yasakAlanBul(satirlar)).toEqual([])
    const yuk = JSON.stringify(satirlar)
    for (const iz of SENTINELLER) expect(yuk, `${iz} modele giden yuke SIZDI`).not.toContain(iz)
    for (const alan of MODELE_GITMEYEN_ALANLAR) expect(yuk, `"${alan}" alan adi yukte`).not.toMatch(new RegExp(`"${alan}"`, 'i'))
  })

  it('satırın üst düzey alanları TAM id, ad, slug, marka, ozellikler; spec anahtarları izinli kümenin altkümesi', () => {
    for (const s of satirlar) {
      expect(Object.keys(s).sort()).toEqual(['ad', 'id', 'marka', 'ozellikler', 'slug'])
      for (const a of Object.keys(s.ozellikler)) expect(IZINLI_SPEC_ANAHTARLARI as readonly string[]).toContain(a)
    }
  })

  it('yasak alan listesi plandaki yedi alandır (sessizce daraltılamaz)', () => {
    expect([...MODELE_GITMEYEN_ALANLAR].sort()).toEqual(
      ['barcode', 'description_i18n', 'model_code', 'price', 'purchase_price', 'sku', 'stock_qty'].sort(),
    )
  })

  it('izinli debi/çap/ses anahtarları wizard.service eksen eşlemesinden türer; sürücü gücü listede yok', () => {
    const wizardAnahtarlari = [...SPEC_ANAHTARLARI.debiM3h, ...SPEC_ANAHTARLARI.sesDbA, ...SPEC_ANAHTARLARI.capMm]
    for (const a of wizardAnahtarlari) expect(IZINLI_SPEC_ANAHTARLARI as readonly string[]).toContain(a)
    expect(IZINLI_SPEC_ANAHTARLARI as readonly string[]).not.toContain('rated_power_w')
  })

  /** Satır kurucunun ham satırdan OKUDUĞU alan adları: `oku(ham, '<ad>')` çağrıları + `ham.` / `ham[` doğrudan erişimi. */
  function okunanHamAlanlar(kaynak: string): { adlar: string[]; dogrudanErisim: string[] } {
    const temiz = yorumsuz(kaynak)
    const adlar = [...temiz.matchAll(/\boku\(\s*ham\s*,\s*'([^']+)'\s*\)/g)].map((m) => m[1]).sort()
    const dogrudanErisim = [...temiz.matchAll(/\bham\s*(?:\.\s*\w+|\[)/g)].map((m) => m[0])
    return { adlar, dogrudanErisim }
  }

  it('satır kurucu ham satırdan YALNIZ id, name, slug, marka ve technical_specs okur', () => {
    const izin = kaynakDosyalari().find((d) => d.ad === 'izinListesi.ts')
    expect(izin).toBeDefined()
    const { adlar, dogrudanErisim } = okunanHamAlanlar(izin?.kaynak ?? '')
    expect(adlar).toEqual(['id', 'marka', 'name', 'slug', 'technical_specs'])
    expect(dogrudanErisim, 'ham satira dogrudan erisim: izin listesini atlar').toEqual([])
  })

  it('kanarya: tarayıcı yasak okumayı YAKALAR, temiz kaynağı yakalamaz', () => {
    const kotu = okunanHamAlanlar("const s = oku(ham, 'sku'); const f = ham.price; const g = ham['model_code']")
    expect(kotu.adlar).toEqual(['sku'])
    expect(kotu.dogrudanErisim).toHaveLength(2)
    const temiz = okunanHamAlanlar("const id = oku(ham, 'id') // oku(ham, 'sku') yorumdur")
    expect(temiz.adlar).toEqual(['id'])
    expect(temiz.dogrudanErisim).toEqual([])
  })
})

// ───────────────────────── INV-ASISTAN-2 ─────────────────────────

const YARGI_DESENI = /uygun|suitab|appropriate|en iyi|\bbest\b|recommend|öner(?:i|il)/i

function karsilastirma(
  basvurular: Array<[string, Karsilastirma['basvurular'][number]['alan']]>,
  gerekce: Karsilastirma['gerekceKodlari'] = [],
): Karsilastirma {
  return { basvurular: basvurular.map(([urunId, alan]) => ({ urunId, alan })), gerekceKodlari: gerekce }
}

const TUM_SATIRLAR: AsistanSatiri[] = [SEAT_20, SEAT_20_B, STORM_16, ADH_225, LINEO_125, LINEO_125_3M]
const OZEL_MARKASIZ = satirKur(
  hamSatir({ id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', name: 'ADH-225 E2', slug: 'adh-225-e2-3m', marka: null, specs: { noise_lpa_3m_db: 50 } }),
)

/** Çıktı matrisi: her biçim iki dilde. */
function matris(): Array<{ ad: string; dil: 'tr' | 'en'; metin: string; satirlar: readonly AsistanSatiri[] }> {
  const senaryolar: Array<{ ad: string; satirlar: readonly AsistanSatiri[]; k?: Karsilastirma }> = [
    { ad: 'liste', satirlar: TUM_SATIRLAR },
    {
      ad: 'debi karsilastirmasi + veri yok',
      satirlar: TUM_SATIRLAR,
      k: karsilastirma(
        [
          [SEAT_20_ID, 'max_delivery_m3h'],
          [STORM_16_ID, 'max_delivery_m3h'],
          [ADH_225_ID, 'max_delivery_m3h'],
          [LINEO_125_ID, 'nominal_delivery_m3h'],
        ],
        ['EN_YUKSEK_DEBI'],
      ),
    },
    {
      ad: 'ses: farkli uretici',
      satirlar: TUM_SATIRLAR,
      k: karsilastirma([[SEAT_20_ID, 'noise_lpa_3m_db'], [LINEO_125_3M_ID, 'noise_lpa_3m_db']], ['EN_DUSUK_SES']),
    },
    {
      ad: 'ses: ayni uretici',
      satirlar: TUM_SATIRLAR,
      k: karsilastirma([[SEAT_20_ID, 'noise_lpa_3m_db'], [SEAT_20_B_ID, 'noise_lpa_3m_db']], ['EN_DUSUK_SES']),
    },
    { ad: 'ses: mesafesiz', satirlar: TUM_SATIRLAR, k: karsilastirma([[LINEO_125_ID, 'noise_level_db_a']]) },
    {
      ad: 'metin alanlari',
      satirlar: TUM_SATIRLAR,
      k: karsilastirma([[SEAT_20_ID, 'ip_rating'], [STORM_16_ID, 'atex_zone'], [ADH_225_ID, 'atex_zone']], ['IP_KORUMA', 'ATEX_BOLGESI']),
    },
    { ad: 'markasiz ses', satirlar: [SEAT_20, OZEL_MARKASIZ], k: karsilastirma([[SEAT_20_ID, 'noise_lpa_3m_db'], [OZEL_MARKASIZ.id, 'noise_lpa_3m_db']], ['EN_DUSUK_SES']) },
    { ad: 'bos', satirlar: [] },
    { ad: 'cok genis', satirlar: cokSatir(30) },
  ]
  return (['tr', 'en'] as const).flatMap((dil) =>
    senaryolar.map((s) => ({
      ad: s.ad,
      dil,
      satirlar: s.satirlar,
      metin: cevapMetniUret({ satirlar: s.satirlar, karsilastirma: s.k, dil, cevir: dil === 'tr' ? cevirTr : cevirEn }).metin,
    })),
  )
}

const SAYI_TOKENI = /\d+(?:[.,]\d+)*/g

/** Satırlardan türeyen ve çıktıda geçmesine İZİN VERİLEN sayı yazımları (bağımsız biçimleyici: `toLocaleString`). */
function izinliSayilar(satirlar: readonly AsistanSatiri[], dil: 'tr' | 'en'): Set<string> {
  const izinli = new Set<string>([String(0), String(3), String(MAKS_URUN)])
  const ekle = (metin: string) => (metin.match(SAYI_TOKENI) ?? []).forEach((t) => izinli.add(t))
  for (const s of satirlar) {
    ekle(s.ad)
    ekle(s.slug)
    ekle(s.marka ?? '')
    for (const deger of Object.values(s.ozellikler)) {
      if (typeof deger === 'string') ekle(deger)
      else izinli.add(deger.toLocaleString(dil === 'tr' ? 'tr-TR' : 'en-US', { maximumFractionDigits: 20 }))
    }
  }
  return izinli
}

function yabanciSayilar(metin: string, satirlar: readonly AsistanSatiri[], dil: 'tr' | 'en'): string[] {
  const izinli = izinliSayilar(satirlar, dil)
  return (metin.match(SAYI_TOKENI) ?? []).filter((t) => !izinli.has(t))
}

describe('INV-ASISTAN-2 — şablon çıktısı', () => {
  const cikti = matris()

  it('matris boş değil: dokuz senaryo iki dilde', () => {
    expect(cikti).toHaveLength(18)
    expect(cikti.every((c) => c.metin.length > 0)).toBe(true)
  })

  it('hiçbir çıktıda yargı sözcüğü ("uygun", "suitable", "en iyi") yok', () => {
    for (const c of cikti) expect(c.metin, `${c.dil}/${c.ad}`).not.toMatch(YARGI_DESENI)
  })

  it('çıktıdaki HER sayı satırdan (ad, slug, teknik değer) ya da sabit (0 Pa, 3 m, ürün sınırı) gelir', () => {
    for (const c of cikti) expect(yabanciSayilar(c.metin, c.satirlar, c.dil), `${c.dil}/${c.ad}`).toEqual([])
  })

  it('kanarya: yabancı sayı YAKALANIR, satırdan gelen sayı yakalanmaz', () => {
    const c = cikti[0]
    expect(yabanciSayilar(`${c.metin}\nen sessiz: 9999 m³/h`, c.satirlar, c.dil)).toEqual(['9999'])
    expect(yabanciSayilar(c.metin, c.satirlar, c.dil)).toEqual([])
    expect(YARGI_DESENI.test('bu ürün işiniz için uygun')).toBe(true)
    expect(YARGI_DESENI.test('Serbest üfleme (0 Pa) en yüksek debi')).toBe(false)
  })

  it('dB(A) sayısı DAİMA "3 m" koşuluyla basılır; mesafesiz ses sayısı hiç basılmaz', () => {
    let dbSayisi = 0
    for (const c of cikti) {
      const eslesmeler = c.metin.match(/\d[\d.,]* dB\(A\)[^;\n]*/g) ?? []
      dbSayisi += eslesmeler.length
      for (const e of eslesmeler) expect(e, `${c.dil}/${c.ad}`).toMatch(/ dB\(A\) · 3 m$/)
      // Lineo 125'in noise_level_db_a değeri 38 (mesafe yok): ayrı sayı olarak asla geçmez.
      expect(c.metin, `${c.dil}/${c.ad}`).not.toMatch(/(?<![\d.,])38(?![\d.,])/)
    }
    expect(dbSayisi, 'dB(A) hic basilmiyor: kapi kor').toBeGreaterThan(10)
  })

  it('farklı (ya da bilinmeyen) üreticilerin ses değeri SIRALANMAZ ve not düşülür; aynı üretici sıralanır', () => {
    const sirali = (metin: string) => /sıralıdır|Sorted by value/.test(metin)
    const not = (metin: string) => /Farklı üreticilerin ses|Sound values from different manufacturers/.test(metin)
    for (const ad of ['ses: farkli uretici', 'markasiz ses']) {
      for (const c of cikti.filter((x) => x.ad === ad)) {
        expect(not(c.metin), `${c.dil}/${ad}: not yok`).toBe(true)
        expect(sirali(c.metin), `${c.dil}/${ad}: farkli uretici sirali`).toBe(false)
      }
    }
    for (const c of cikti.filter((x) => x.ad === 'ses: ayni uretici')) {
      expect(sirali(c.metin), `${c.dil}: ayni uretici siralanmali`).toBe(true)
      expect(not(c.metin), `${c.dil}: ayni uretici icin not gereksiz`).toBe(false)
    }
  })

  it('ham sözlük anahtarı ya da yer tutucu çıktıya sızmaz', () => {
    for (const c of cikti) expect(c.metin, `${c.dil}/${c.ad}`).not.toMatch(/asistan\.[a-z]|\{\{|\}\}|undefined|NaN/)
  })

  it('bağlantı satırları /<dil>/ ile başlar (dil öneki adresUret\'ten gelir)', () => {
    for (const c of cikti.filter((x) => x.satirlar.length > 0)) {
      const baglantilar = c.metin.split('\n').filter((s) => /^\s+\/\w/.test(s))
      expect(baglantilar.length, `${c.dil}/${c.ad}`).toBeGreaterThan(0)
      for (const b of baglantilar) expect(b.trim().startsWith(`/${c.dil}/`), b).toBe(true)
    }
  })
})

describe('INV-ASISTAN-2 — sözlük ve kaynak', () => {
  const asistan = { tr: tr.asistan, en: en.asistan }

  function yapraklar(obj: unknown, onek = ''): string[] {
    if (typeof obj === 'string') return [onek]
    if (obj === null || typeof obj !== 'object') return []
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => yapraklar(v, onek ? `${onek}.${k}` : k))
  }

  it('TR ve EN asistan ağaçlarının yaprakları aynı, değerleri boş değil', () => {
    const trYaprak = yapraklar(asistan.tr).sort()
    expect(trYaprak.length).toBeGreaterThan(20)
    expect(yapraklar(asistan.en).sort()).toEqual(trYaprak)
    for (const y of trYaprak) {
      expect(getDictValue(tr, `asistan.${y}`).length, `tr ${y}`).toBeGreaterThan(2)
      expect(getDictValue(en, `asistan.${y}`).length, `en ${y}`).toBeGreaterThan(2)
    }
  })

  it('sözlükte yargı sözcüğü yok ve yer tutucu kümesi iki dilde aynı', () => {
    for (const y of yapraklar(asistan.tr)) {
      const t = getDictValue(tr, `asistan.${y}`)
      const e = getDictValue(en, `asistan.${y}`)
      expect(t, `tr ${y}`).not.toMatch(YARGI_DESENI)
      expect(e, `en ${y}`).not.toMatch(YARGI_DESENI)
      expect((t.match(/\{\{\w+\}\}/g) ?? []).sort(), y).toEqual((e.match(/\{\{\w+\}\}/g) ?? []).sort())
    }
  })

  it('kodda geçen her asistan.* anahtarı iki sözlükte ÇÖZÜLÜR ve her yaprağın tüketicisi var (ölü anahtar yok)', () => {
    const kullanilan = new Set<string>()
    for (const d of kaynakDosyalari()) {
      for (const m of yorumsuz(d.kaynak).matchAll(/'(asistan\.[A-Za-z0-9.]+)'/g)) kullanilan.add(m[1])
    }
    expect(kullanilan.size).toBeGreaterThan(20)
    for (const anahtar of kullanilan) {
      expect(getDictValue(tr, anahtar), `tr: ${anahtar}`).not.toBe(anahtar)
      expect(getDictValue(en, anahtar), `en: ${anahtar}`).not.toBe(anahtar)
    }
    const oluler = yapraklar(asistan.tr).map((y) => `asistan.${y}`).filter((a) => !kullanilan.has(a))
    expect(oluler, 'sozlukte var ama kodda kullanilmayan anahtar').toEqual([])
  })

  it('şablon, şema ve hata yolu kaynağında "uygun" geçmez (yorumlar hariç)', () => {
    for (const d of kaynakDosyalari()) {
      expect(yorumsuz(d.kaynak), d.ad).not.toMatch(/uygun/i)
    }
  })
})

// ───────────────────────── INV-ASISTAN-TENANT ─────────────────────────

/** Kiracıyı başlıktan okuyan ya da kiracı kimliğiyle çalışan her kod izi. */
const TENANT_DESENI = /x-tenant|tenant/i

describe('INV-ASISTAN-TENANT — asistan uçları kiracıyı istek başlığından okumaz', () => {
  it('src/lib/asistan altındaki hiçbir kaynak (yorum hariç) "tenant" içermez', () => {
    const dosyalar = kaynakDosyalari()
    expect(dosyalar.length).toBeGreaterThanOrEqual(7)
    for (const d of dosyalar) expect(yorumsuz(d.kaynak), `${d.ad}: kiraci basligi ya da kimligi`).not.toMatch(TENANT_DESENI)
  })

  it('kanarya: başlıktan kiracı okuma YAKALANIR; yorumdaki söz ve ilgisiz kod yakalanmaz', () => {
    expect(yorumsuz("const t = req.headers.get('x-tenant-id')")).toMatch(TENANT_DESENI)
    expect(yorumsuz("const t = headers.get('X-Tenant')")).toMatch(TENANT_DESENI)
    expect(yorumsuz('const tenantId = ctx.tenantId')).toMatch(TENANT_DESENI)
    expect(yorumsuz("// x-tenant başlığı okunmaz\nconst ip = h.get('cf-connecting-ip')")).not.toMatch(TENANT_DESENI)
    expect(yorumsuz("/* tenant */ const ip = h.get('x-real-ip')")).not.toMatch(TENANT_DESENI)
  })
})

// ───────────────────────── INV-ASISTAN-IP ─────────────────────────

describe('INV-ASISTAN-IP — istemci IP sırası emsalle aynı', () => {
  const EMSAL = join(process.cwd(), 'supabase', 'functions', 'quote-request-guest', 'index.ts')
  const SON_OGE = /xff\[\s*xff\.length\s*-\s*1\s*\]/
  const ILK_OGE = /xff\[\s*0\s*\]|\.split\([^)]*\)\s*\[\s*0\s*\]/

  /** Metinde `.get('<başlık>')` çağrılarının geçiş SIRASI. */
  function baslikAdlari(metin: string): string[] {
    return [...metin.matchAll(/\.get\(\s*'(cf-connecting-ip|x-real-ip|x-forwarded-for)'\s*\)/g)].map((m) => m[1])
  }

  /** Emsaldeki `const ip = ( ... ).slice(0, 64)` ifadesi. */
  function emsalIfadesi(kaynak: string): string | null {
    const m = yorumsuz(kaynak).match(/const ip = \(([\s\S]*?)\)\.slice\(0,\s*64\)/)
    return m ? m[1] : null
  }

  it('emsal kaynak duruyor: cf-connecting-ip → x-real-ip → x-forwarded-for SON öğe; ilk öğe alınmaz', () => {
    const ifade = emsalIfadesi(readFileSync(EMSAL, 'utf8'))
    expect(ifade, 'emsal ifadesi bulunamadi: dosya tasinmis ya da yeniden yazilmis olabilir').not.toBeNull()
    expect(baslikAdlari(ifade ?? '')).toEqual(['cf-connecting-ip', 'x-real-ip'])
    expect(SON_OGE.test(ifade ?? '')).toBe(true)
    expect(ILK_OGE.test(ifade ?? '')).toBe(false)
  })

  it('asistan çözücüsü aynı sırayı ve aynı son-öğe seçimini kullanır; ilk öğeyi hiçbir yerde seçmez', () => {
    const kendi = yorumsuz(readFileSync(join(ASISTAN_DIZINI, 'istemciIp.ts'), 'utf8'))
    expect(baslikAdlari(kendi)).toEqual(['cf-connecting-ip', 'x-real-ip', 'x-forwarded-for'])
    expect(SON_OGE.test(kendi)).toBe(true)
    expect(ILK_OGE.test(kendi)).toBe(false)
  })

  it('kanarya: sıra bozulursa ve ilk öğe seçilirse YAKALANIR', () => {
    expect(baslikAdlari("a.get('x-forwarded-for') b.get('cf-connecting-ip')")).toEqual(['x-forwarded-for', 'cf-connecting-ip'])
    expect(ILK_OGE.test("const ip = xff[0] || 'bilinmeyen'")).toBe(true)
    expect(ILK_OGE.test("const ip = h.get('x-forwarded-for').split(',')[0]")).toBe(true)
    expect(ILK_OGE.test('const ip = xff[xff.length - 1]')).toBe(false)
    expect(SON_OGE.test('const ip = xff[xff.length - 1]')).toBe(true)
  })
})
