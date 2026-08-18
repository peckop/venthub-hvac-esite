import { describe, expect, it } from 'vitest'

/**
 * INV-ADMIN-SEARCH-1 · Admin liste aramasının değişmezleri (T090-VH).
 *
 * NİÇİN VAR
 *
 * `/admin/returns` araması **üretimden beri hiç çalışmadı**. Fetcher şunu kuruyordu:
 *
 *     .or('reason.ilike.%X%,venthub_orders.customer_name.ilike.%X%, ...')
 *
 * PostgREST'te üst-düzey `or=` içindeki bir koşul GÖMÜLÜ tabloya atıfta bulunamaz.
 * Sorgu 400 ile düşüyor, arayüz "Veriler yüklenirken bir hata oluştu" diyordu.
 * Prod'da 0 iade olduğu için (ölçüldü 2026-08-18) kimse fark edemedi; kusuru
 * kullanıcının el testi ortaya çıkardı, hiçbir kapı görmedi.
 *
 * Aynı kusur ikinci ve ÜÇÜNCÜ kez, komut paletinde de bulundu
 * (`resourceSearchers.ts` · iadeler ve stok hareketleri). Yani bu bir yazım hatası
 * değil, TEKRARLAYAN bir sınıf — kapı bu yüzden var.
 *
 * İKİ AYRI KURAL, İKİ AYRI SERTLİK
 *
 *   R-A (SIFIR TOLERANS): üst-düzey `or()` içinde gömülü kaynağa atıf. Bunun
 *        "kısmen çalışan" hâli yok; sorgu düşer. Muafiyet yok.
 *   R-B (RATCHET): kullanıcı metninin filtre DİLBİLGİSİNE ham gömülmesi. #642 bu
 *        sınıfı üç dosyada kapattı ama tekrarını engelleyen hiçbir şey yoktu.
 *        Kalan ihlaller AŞAĞIDA ADIYLA ve SAHİBİYLE yazılıdır; sayı artamaz.
 *
 * ÖLÇMEDİĞİ ŞEY (adıyla)
 *
 *   · Bu dosya SORGU ÇALIŞTIRMAZ. "Arama doğru sonucu döndürüyor mu" sorusunu
 *     ölçmez; yalnızca sorgunun kurulumunu ölçer.
 *   · Yorum ayıklama YALNIZ tam-satır yorumlarını atar. Satır sonuna eklenmiş bir
 *     yorumda örnek kod varsa YANLIŞ-KIRMIZI verir (yanlış-yeşil vermez).
 *   · Parantez dengeleyici, dize İÇİNDEKİ parantezi saymaz — `.or("(a,b)")` gibi
 *     bir yazım argümanı kısa keser. Depoda böyle bir kullanım yok (ölçüldü).
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const ALL: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Kuralı ANLATAN metin, kuralın İHLALİ sayılmasın. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n')
}

/**
 * `.or(` çağrılarının argüman metnini çıkar (parantez dengeli).
 *
 * Zod'un da bir `.or()` metodu var (`SettingsFormModal`); onun argümanı ne dizeli
 * bir kolon yolu ne de şablon aradeğeri içerir, dolayısıyla iki kural da sessiz kalır.
 */
function orArguments(source: string): string[] {
  const out: string[] = []
  const re = /\.or\(/g
  let match: RegExpExecArray | null
  while ((match = re.exec(source)) !== null) {
    let depth = 1
    let i = match.index + match[0].length
    const start = i
    while (i < source.length && depth > 0) {
      const ch = source[i]
      if (ch === '(') depth += 1
      else if (ch === ')') depth -= 1
      i += 1
    }
    out.push(source.slice(start, i - 1))
  }
  return out
}

const OPS = 'ilike|like|eq|neq|gt|gte|lt|lte|in|is|cs|cd|fts|plfts'

/** `tablo.kolon.islec.` — gömülü kaynağa satır-içi atıf. */
const INLINE_EMBEDDED = new RegExp(`[A-Za-z_]\\w*\\.[A-Za-z_]\\w*\\.(?:${OPS})\\.`)

/** `'tablo.kolon'` — yardımcıya dizi olarak verilmiş gömülü kolon adı. */
const QUOTED_EMBEDDED = /['"`]\s*[A-Za-z_]\w*\.[A-Za-z_]\w*\s*['"`]/

function hasEmbeddedReference(orArg: string): boolean {
  return INLINE_EMBEDDED.test(orArg) || QUOTED_EMBEDDED.test(orArg)
}

function hasRawInterpolation(orArg: string): boolean {
  return orArg.includes('${')
}

interface Ihlal {
  dosya: string
  arg: string
}

function tara(): { kaynakSayisi: number; orSayisi: number; a: Ihlal[]; b: Map<string, number> } {
  const a: Ihlal[] = []
  const b = new Map<string, number>()
  let orSayisi = 0
  let kaynakSayisi = 0

  for (const [yol, ham] of Object.entries(ALL)) {
    if (yol.includes('/__tests__/')) continue
    kaynakSayisi += 1
    const kod = stripComments(ham)
    for (const arg of orArguments(kod)) {
      orSayisi += 1
      if (hasEmbeddedReference(arg)) a.push({ dosya: yol, arg: arg.trim().slice(0, 160) })
      if (hasRawInterpolation(arg)) b.set(yol, (b.get(yol) ?? 0) + 1)
    }
  }
  return { kaynakSayisi, orSayisi, a, b }
}

const OLCUM = tara()

/* ------------------------------------------------------------------ */

describe('INV-ADMIN-SEARCH-1 · kapsam (stale-guard)', () => {
  it('tarama gerçekten kaynak gördü', () => {
    /* Glob deseni bozulursa aşağıdaki HER test sessizce "temiz" derdi. */
    expect(OLCUM.kaynakSayisi, 'hiç kaynak dosya taranmadı').toBeGreaterThan(200)
    expect(OLCUM.orSayisi, 'hiç or() çağrısı bulunamadı — ayıklayıcı bozuk').toBeGreaterThanOrEqual(10)
  })

  it('dedektör BİLİNEN bir ihlali gerçekten yakalıyor', () => {
    /*
      Aracın kendisi kör olabilir (bu depoda yaşandı: yorum ayıklayıcı URL'deki
      `//` yüzünden dedektörü köreltmişti). Bu yüzden dedektör, kaldırdığımız
      GERÇEK kusurun metniyle sınanır — kural değişirse burası da düşer.
    */
    const eskiKusur = '`reason.ilike.%${q}%,venthub_orders.customer_name.ilike.%${q}%`'
    expect(hasEmbeddedReference(eskiKusur), 'satır-içi gömülü atıf yakalanmadı').toBe(true)
    expect(hasRawInterpolation(eskiKusur), 'ham aradeğer yakalanmadı').toBe(true)

    const yardimciyla = "orIlikeContains(['venthub_orders.customer_name'], term)"
    expect(hasEmbeddedReference(yardimciyla), 'dizili gömülü kolon adı yakalanmadı').toBe(true)

    const temiz = "orIlikeContains(['reason', 'status'], term)"
    expect(hasEmbeddedReference(temiz), 'temiz kullanım yanlışlıkla işaretlendi').toBe(false)
    expect(hasRawInterpolation(temiz), 'temiz kullanım yanlışlıkla işaretlendi').toBe(false)
  })
})

describe('INV-ADMIN-SEARCH-1 · R-A üst-düzey or() gömülü kaynağa atamaz', () => {
  it('sıfır ihlal', () => {
    /*
      Gömülü kaynağa süzme YOLU VAR: ikinci argüman `{ foreignTable: 'x' }`.
      O yolda kolon adları YALINDIR (`name.ilike.…`), dolayısıyla bu kural onu
      işaretlemez — doğru desen serbest, yanlış desen kapalı.
    */
    const rapor = OLCUM.a.map((i) => `  ${i.dosya}\n    ${i.arg}`).join('\n')
    expect(
      OLCUM.a.length,
      'Üst-düzey or() içinde gömülü kaynağa atıf var — PostgREST bunu ayrıştıramaz\n' +
        've sorgu 400 ile DÜŞER (arama hiç çalışmaz):\n' +
        rapor +
        '\n\nDoğrusu: ya `{ foreignTable: ... }` ikinci argümanı, ya birleştirmeyi\n' +
        'DB tarafında yapan bir view (bkz. view_admin_returns / view_admin_orders).',
    ).toBe(0)
  })
})

/**
 * R-B TABAN ÇİZGİSİ — 2026-08-18 ölçümü.
 *
 * Her satır: dosya → o dosyadaki ham-aradeğerli or() sayısı, ve ŞERİT SAHİBİ.
 * Bu bir muafiyet değil BORÇ kaydıdır: sayı düşebilir, ASLA artamaz. Yeni kod
 * `src/utils/adminQueryFilters.ts` yardımcılarını kullanır.
 */
const R_B_TABAN: Record<string, number> = {
  /* ADMIN-CUSTOMER şeridi (benim) — sıradaki dalgada düşecek */
  '/src/views/admin/ErrorGroupsTableBody.tsx': 1,
  '/src/views/admin/WebhookEventsTableBody.tsx': 1,
  '/src/views/admin/MovementsTableBody.tsx': 1,
  /* PRICING-STOK şeridi */
  '/src/components/admin/pricing/RuleScopeTargetPicker.tsx': 1,
  '/src/components/admin/purchasing/CreatePurchaseOrderPanel.tsx': 1,
  '/src/views/admin/PricePreviewPanel.tsx': 1,
  '/src/lib/services/pricing.service.ts': 1,
  /* Vitrin tarafı — kullanıcı metni değil ama değer yine dilbilgisine giriyor */
  '/src/lib/data/preload.ts': 1,
  '/src/lib/services/product.service.ts': 1,
}

describe('INV-ADMIN-SEARCH-1 · R-B kullanıcı metni filtre dilbilgisine gömülmez', () => {
  it('taban çizgisi AŞILMADI', () => {
    const asanlar: string[] = []
    const bilinmeyenler: string[] = []

    for (const [dosya, sayi] of OLCUM.b) {
      const taban = R_B_TABAN[dosya]
      if (taban === undefined) bilinmeyenler.push(`${dosya} (${sayi})`)
      else if (sayi > taban) asanlar.push(`${dosya}: ${sayi} > ${taban}`)
    }

    expect(
      bilinmeyenler,
      'Taban çizgisinde OLMAYAN dosyada ham aradeğerli or() var. Yeni kod\n' +
        '`orIlikeContains` / `ilikeContains` / `eqValue` kullanmalı (adminQueryFilters):\n' +
        bilinmeyenler.join('\n'),
    ).toEqual([])

    expect(asanlar, 'Taban çizgisi AŞILDI:\n' + asanlar.join('\n')).toEqual([])
  })

  it('taban çizgisi BAYAT DEĞİL', () => {
    /*
      BAYAT TABAN da bir kusurdur: bir dosya temizlendiğinde satırı burada kalırsa
      kapı, ölmüş bir borcu canlı sanar ve gelecekte o dosyaya yeni ihlal SESSİZCE
      girebilir (1 yerine 1 görülür). Ayrı bir test olması şart — aynı `it` içinde
      olsaydı "borç arttı" ile "borç öldü" aynı kırmızıyı verirdi ve hangi sabotajın
      neyi yakaladığı ölçülemezdi.
    */
    const olmus = Object.keys(R_B_TABAN).filter((d) => !OLCUM.b.has(d))
    expect(
      olmus,
      'Taban çizgisi BAYAT — bu dosyalar temizlenmiş, satırları silinmeli:\n' + olmus.join('\n'),
    ).toEqual([])
  })
})

describe('INV-ADMIN-SEARCH-1 · iade listesi view üzerinden okur (T090-VH)', () => {
  const RETURNS = stripComments(ALL['/src/views/admin/ReturnsTableBody.tsx'] ?? '')
  const PALET = stripComments(ALL['/src/lib/admin/search/resourceSearchers.ts'] ?? '')

  it('iki dosya da bulundu', () => {
    expect(RETURNS.length, 'ReturnsTableBody.tsx okunamadı').toBeGreaterThan(500)
    expect(PALET.length, 'resourceSearchers.ts okunamadı').toBeGreaterThan(500)
  })

  it('sayfa ve komut paleti AYNI kaynağı okur', () => {
    /*
      İki yüzey ayrı sorgu kurarsa aynı terim için farklı sonuç verebilirler ve
      hangisinin doğru olduğu ölçülemez. Tek kaynak = tek cevap.
    */
    expect(RETURNS.includes('view_admin_returns'), 'Sayfa view_admin_returns okumuyor').toBe(true)
    expect(PALET.includes('view_admin_returns'), 'Komut paleti view_admin_returns okumuyor').toBe(true)
  })

  it('iade sorgusunda `venthub_orders` gömme YOK', () => {
    /* Geri dönüş, kusurun kendisine geri dönüştür. */
    expect(
      /venthub_orders!inner|foreignTable:\s*['"]venthub_orders['"]/.test(RETURNS),
      'İade listesi yeniden gömülü join kurmuş — arama/sıralama tekrar kırılır.',
    ).toBe(false)
  })
})
