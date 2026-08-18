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
 * TEK KURAL — ve bu bilinçli bir DARALTMA
 *
 * Bu kapı YALNIZ şunu ölçer: üst-düzey `or()` içinde gömülü kaynağa atıf
 * (SIFIR TOLERANS; "kısmen çalışan" hâli yok, sorgu düşer, muafiyet yok).
 *
 * İlk sürümünde ikinci bir kural daha vardı: kullanıcı metninin filtre
 * DİLBİLGİSİNE ham gömülmesi. O kural aynı gün EDGE şeridinde de yazılmıştı
 * (**INV-FILTER-1**, T078-VH) ve aynı sınıfa iki cetvel koymak — duplicate ruler —
 * zamanla sessizce ayrışan iki taban çizgisi üretirdi. OPS-AUDIT kararıyla o
 * kuralın SSOT'u **INV-FILTER-1**'dir; burada TEKRARLANMAZ.
 *
 * İKİSİ TAMAMLAYICI, EŞ DEĞİL — ve bu ölçüldü: INV-FILTER-1'in düzelttiği satır
 *
 *     orIlikeContains(['reason', 'venthub_orders.order_number'], query)
 *
 * kaçış açısından DOĞRUDUR ama gömülü atfı korur, yani sorgu hâlâ 400 döner —
 * üstelik artık yardımcıyı kullandığı için DÜZELMİŞ GÖRÜNÜR. Aşağıdaki dedektör
 * öz-testi tam o satırı vaka olarak taşır.
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

interface Ihlal {
  dosya: string
  arg: string
}

function tara(): { kaynakSayisi: number; orSayisi: number; a: Ihlal[] } {
  const a: Ihlal[] = []
  let orSayisi = 0
  let kaynakSayisi = 0

  for (const [yol, ham] of Object.entries(ALL)) {
    if (yol.includes('/__tests__/')) continue
    kaynakSayisi += 1
    const kod = stripComments(ham)
    for (const arg of orArguments(kod)) {
      orSayisi += 1
      if (hasEmbeddedReference(arg)) a.push({ dosya: yol, arg: arg.trim().slice(0, 160) })
    }
  }
  return { kaynakSayisi, orSayisi, a }
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
    /*
      Vakaların ikisi UYDURMA DEĞİL: INV-FILTER-1'in (EDGE, #650) ürettiği GERÇEK
      satırlar. O PR kaçışı düzeltirken gömülü atfı koruyor; bu kapının onu
      yakaladığı burada kalıcı olarak bağlanıyor — yoksa "tamamlayıcı" sözü bir
      iddia olarak kalırdı.

      Yanlış-KIRMIZI vakaları da şart: bir dedektör her şeyi işaretleyerek de
      "çalışıyor" görünebilir.
    */
    const vakalar: ReadonlyArray<readonly [string, boolean, string]> = [
      [
        "orIlikeContains(['reason', 'venthub_orders.order_number'], query)",
        true,
        'INV-FILTER-1 sonrası KIRIK kalan iade satırı',
      ],
      [
        "orIlikeContains(['reason', 'products.name', 'products.sku'], query)",
        true,
        'INV-FILTER-1 sonrası KIRIK kalan hareket satırı',
      ],
      [
        '`reason.ilike.%${q}%,venthub_orders.customer_name.ilike.%${q}%`',
        true,
        'eski satır-içi biçim',
      ],
      ["orIlikeContains(['order_number', 'conversation_id'], query)", false, 'temiz — iki kolon'],
      ["orIlikeContains(['reason', 'status'], term)", false, 'temiz — yardımcıyla'],
    ]

    for (const [girdi, beklenen, ad] of vakalar) {
      expect(hasEmbeddedReference(girdi), `dedektör yanıldı: ${ad}`).toBe(beklenen)
    }
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
