import { describe, expect, it } from 'vitest'

/**
 * INV-FILTER-1 — kullanıcı metni PostgREST filtre GRAMERİNE gömülmez.
 *
 * ÖLÇÜLEN KATMAN (K6): `src/` altındaki ÜRÜN kodu (test dosyaları hariç). Ölçülen şey tek bir
 * biçim: `.or(…)` çağrısına şablon dizesiyle (interpolasyonlu) verilen filtre metni.
 *
 * NİÇİN VAR (T078-VH · 2026-08-18)
 * ---------------------------------
 * PostgREST'in `or` filtresi bir GRAMERDİR: virgül koşulları ayırır, nokta kolon/operatör/değer
 * ayırır, parantez gruplar. Arama kutusunun metnini bu gramerin içine doğrudan yazmak, metnin
 * bir parçasının YAPI olarak okunmasına yol açar:
 *
 *   .or(sku.ilike.%<metin>%,name.ilike.%<metin>%)     ← "fan, 100" yazınca koşul sayısı değişir
 *
 * ŞİDDET, ABARTILMADAN: güvenlik kazancı YOK — istemci kendi token'ıyla sorar, RLS aynı kalır,
 * tablo dışına çıkılamaz. ASIL kusur **sessiz-boşluk**: sorgu 400 döner ve çağıranların birçoğu
 * hatayı yutup boş liste gösterir; kullanıcı "sonuç yok" sanır. Yani virgül içeren her arama
 * canlı, sessiz bir işlevsel hatadır.
 *
 * ÇÖZÜM TEK YERDE: `@/utils/adminQueryFilters` (değeri çift tırnağa alır, içindeki tırnak ve
 * ters bölüyü kaçırır). Bu kapının işi ikinci bir kaçış kopyası doğmasını değil, **yeni bir ham
 * interpolasyon** doğmasını engellemektir — yoksa yirmincisi yarın eklenir.
 *
 * RATCHET: taban ADIYLA yazılı ve yalnız KISALABİLİR. R1 yeni ham interpolasyonu, R2 (stale-guard)
 * bayat taban satırını yakalar. Tabandaki her satırın gerekçesi yanında yazılı — üçü kullanıcı
 * metni TAŞIMIYOR (rota slug'ı, zaman damgası, kategori kimliği) ve düzeltilmeleri davranış
 * değiştirmez; kalanlar başka şeritlerin mülkü ve BİLEREK bu PR'ın dışında bırakıldı.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const KAYNAKLAR: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/**
 * Yorumları boşlukla değiştirir — satır numaraları korunur.
 *
 * `(?<!:)` ŞART (INV-SCRUB-1): onsuz bir URL'in şeması yorum sanılır ve satırın geri kalanı
 * silinir; dedektör sessizce körleşir. Bu dosyanın kendisi de o kapının kapsamında.
 */
function yorumlariSil(kaynak: string): string {
  return kaynak
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(?<!:)\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '))
}

/** `.or(` çağrısına şablon dizesiyle verilen filtre — interpolasyon varsa ham demektir. */
const OR_SABLON_RE = /\.or\(\s*`([^`]*)`/g

function hamInterpolasyonSatirlari(kaynak: string): number[] {
  const kodsuz = yorumlariSil(kaynak)
  const bulunan: number[] = []
  OR_SABLON_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = OR_SABLON_RE.exec(kodsuz)) !== null) {
    if (m[1].includes('${')) {
      bulunan.push(kodsuz.slice(0, m.index).split('\n').length)
    }
  }
  return bulunan
}

function ihlalHaritasi(): Map<string, number[]> {
  const harita = new Map<string, number[]>()
  for (const [yol, kaynak] of Object.entries(KAYNAKLAR)) {
    // Test dosyaları ölçüm dışı: örnekleri METİN olarak taşırlar (bu dosya dâhil).
    if (/\.(test|spec)\.tsx?$/.test(yol)) continue
    const satirlar = hamInterpolasyonSatirlari(kaynak)
    if (satirlar.length > 0) harita.set(yol.replace(/^\//, ''), satirlar)
  }
  return harita
}

/**
 * TABAN (ratchet) — 2026-08-18'de ÖLÇÜLDÜ.
 *
 * Kullanıcı metni TAŞIMAYAN üç satır (aşağıda işaretli) bir arıza değil; yine de listede,
 * çünkü kapı biçimi ölçer, niyeti değil. Düzeltilirlerse R2 onları listeden çıkarttırır.
 */
const TABAN: readonly string[] = [
  // — kullanıcı metni TAŞIMIYOR (bugün arıza yok, biçim borcu) —
  'src/lib/data/preload.ts', // rota slug'ı (kullanıcının serbest metni değil)
  'src/lib/services/pricing.service.ts', // zaman damgası
  'src/lib/services/product.service.ts', // kategori kimliği (UUID)
  // — ham kullanıcı metni taşıyanlar; sahibi başka şeritte, BİLEREK dokunulmadı —
  'src/components/admin/pricing/RuleScopeTargetPicker.tsx', // ADMIN-CUSTOMER
  'src/components/admin/purchasing/CreatePurchaseOrderPanel.tsx', // PRICING-STOK
  'src/views/admin/ErrorGroupsTableBody.tsx', // ADMIN-CUSTOMER
  'src/views/admin/MovementsTableBody.tsx', // ADMIN-CUSTOMER
  'src/views/admin/PricePreviewPanel.tsx', // ADMIN-CUSTOMER
  'src/views/admin/WebhookEventsTableBody.tsx', // PRICING-STOK
]

describe('INV-FILTER-1 · kullanıcı metni PostgREST filtre gramerine gömülmez', () => {
  it('dedektör çalışıyor: taranan kaynak sayısı makul', () => {
    // Boş/az tarama "temiz" demek değil, "dedektör kör" demektir.
    expect(Object.keys(KAYNAKLAR).length).toBeGreaterThan(500)
  })

  it('dedektör kendini doğrular: hamı yakalar, yardımcıyı ve anışı yakalamaz', () => {
    // HAM interpolasyon — yakalanmalı.
    expect(hamInterpolasyonSatirlari('q.or(`sku.ilike.%${t}%,name.ilike.%${t}%`)')).toEqual([1])
    // Çok satırlı çağrı da yakalanır; bildirilen satır ÇAĞRININ satırıdır (şablonun değil) —
    // hata mesajında aranacak yer `.or(` çağrısıdır.
    expect(hamInterpolasyonSatirlari('q.or(\n  `code.eq.${v}`\n)')).toEqual([1])

    // YARDIMCI üzerinden — yakalanmamalı (doğru biçim cezalandırılmaz).
    expect(hamInterpolasyonSatirlari("q.or(orIlikeContains(['sku', 'name'], t))")).toEqual([])

    // SABİT şablon (interpolasyonsuz) — gramer kullanıcıdan gelmiyor, yakalanmamalı.
    expect(hamInterpolasyonSatirlari('q.or(`effective_to.is.null`)')).toEqual([])

    // ANIŞ — kuralı ANLATAN yorum ihlal değildir (yardımcının kendi docstring'i böyle).
    expect(hamInterpolasyonSatirlari('// q.or(`sku.ilike.%${t}%`)')).toEqual([])
    expect(hamInterpolasyonSatirlari('/* q.or(`sku.ilike.%${t}%`) */')).toEqual([])

    // …ama yorumun ALTINDAKİ gerçek çağrı yine yakalanır ve satır no doğru bildirilir.
    expect(
      hamInterpolasyonSatirlari('// ornek: q.or(`a.eq.${x}`)\nq.or(`b.eq.${y}`)'),
    ).toEqual([2])
  })

  it('R1 · tabanda olmayan yeni bir ham filtre interpolasyonu YOK', () => {
    const yeni = [...ihlalHaritasi().entries()]
      .filter(([yol]) => !TABAN.includes(yol))
      .map(([yol, satirlar]) => yol + ':' + satirlar.join(','))

    expect(
      yeni.sort(),
      [
        'Kullanıcı metni PostgREST filtre GRAMERİNE gömülmüş.',
        'Virgül koşul ayırıcıdır: aramaya virgül yazan kullanıcı filtrenin YAPISINI değiştirir,',
        'sorgu 400 döner ve hata yutuluyorsa liste SESSİZCE boşalır.',
        '',
        'Düzeltme: @/utils/adminQueryFilters yardımcılarını kullan (orIlikeContains / eqValue).',
        'İkinci bir kaçış kopyası YAZMA — kaçış tek yerde yaşar.',
        '',
        ...yeni,
      ].join('\n'),
    ).toEqual([])
  })

  it('R2 · stale-guard: taban BAYATLAMAZ — düzeltilen dosya listeden çıkarılır', () => {
    const halaIhlalli = new Set(ihlalHaritasi().keys())
    const bayat = TABAN.filter((yol) => !halaIhlalli.has(yol))

    expect(
      bayat,
      [
        'Bu dosya(lar) artık ham interpolasyon içermiyor — TABAN listesinden ÇIKAR.',
        'Ratchet ancak kısaldığında ratchet olur: bayat taban, düzeltilmiş bir kusuru hâlâ',
        'borç gibi gösterir ve bir sonraki okuyanı yanlış yere bakmaya iter.',
        '',
        ...bayat,
      ].join('\n'),
    ).toEqual([])
  })
})
