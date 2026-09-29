import { describe, expect, it } from 'vitest'

/**
 * INV-FIYAT-GUNLUGU-1 · Fiyat tablolarına yazan HER istemci yolu değişiklik YÖNTEM başlığını taşır.
 *
 * Cetvel: docs/standards/denetim-izi-standard.md §8 (REC-412 Faz 0.5). DB tetiği fiyat tablolarındaki her yazımı
 * `admin_audit_log`'a düşürür; "hangi yoldan" bilgisini yalnız istemci söyleyebilir ve bunu `x-degisiklik-yontemi`
 * istek başlığıyla söyler. Başlıksız yazım günlüğe `yontem=BILINMIYOR` olarak girer — veri kaybı yok ama bilgi kaybı
 * var; OPS hükmü (2026-09-29): başlıksız yazan yol KIRMIZI.
 *
 * Neden test: tsc/lint bir `.from('pricing_rule').insert(...)` çağrısının başlık taşıyıp taşımadığını göremez;
 * yeni bir yazma yolu eklendiğinde kimse hatırlamaz, günlük sessizce bilgisizleşir.
 *
 * KAPSAM: `src/**` ve `supabase/functions/**` içindeki DOĞRUDAN `.from('<tablo>')` zincirleri.
 * ⛔KAPSAM DIŞI, ADIYLA: `scripts/icerik-hatti/katalog-yukle|geri-yukle.mjs` tablo adını DEĞİŞKENLE verir
 * (`SIRA` döngüsü) — bu tarayıcı onları göremez; başlıksız yazarlar, günlükte `BILINMIYOR` kalır. Sahibi katalog hattı.
 *
 * Tarayıcı iki kabul biçimi tanır: (1) `yontemli(<sorgu>, '<yöntem>')` sarmalayıcısı (src/lib/pricing/degisiklikYontemi.ts),
 * (2) zincirde doğrudan `.setHeader('x-degisiklik-yontemi', …)`.
 */

declare global {
  interface ImportMeta {
    glob(pattern: string | string[], options: { query: string; import: string; eager: true }): Record<string, string>
  }
}

const KAYNAKLAR: Record<string, string> = import.meta.glob(['/src/**/*.{ts,tsx}', '/supabase/functions/**/*.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const MIGRATIONLAR: Record<string, string> = import.meta.glob('/supabase/migrations/20260929110000_fiyat_degisiklik_gunlugu.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const MALIYET_MIGRATION: Record<string, string> = import.meta.glob('/supabase/migrations/20260929143000_maliyet_yenileme_gunlugu.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Fiyat günlüğü kapsamındaki tablolar (migration 20260929110000 ile AYNI beş tablo). */
const TABLOLAR = ['pricing_rule', 'pricing_policy', 'price_lists', 'currency_rates', 'product_prices']
const YAZMA = new Set(['insert', 'update', 'upsert', 'delete'])

/**
 * Bilinçli muafiyet (ratchet, iki yönlü): dosya başlıksız yazar VE gerekçesi yazılıdır. Başlık eklenirse
 * ratchet testi listeden çıkarmayı ister; liste büyümez.
 */
const MUAF: Record<string, string> = {
  'supabase/functions/tcmb-rates-sync/index.ts':
    "Günlük TCMB kur INSERT'i (source='tcmb') tetikte bilerek günlüğe GİRMEZ (tablo kendi tarihçesi). Her gün koşan bir Deno " +
    'cron fonksiyonuna, orada sınanmamış bir başlık eklemek kazanç getirmeden senkronu kırma riski taşır.',
}

function normalize(yol: string): string {
  return yol.replace(/\\/g, '/').replace(/^\/+/, '')
}

/** Yorumu sıyırır (bekçi KODU ölçmeli; kodu anlatan yorumu değil). CRLF ve `https://` tuzakları için bkz. pricing-cache-invariants. */
function yorumSiyir(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(?<!:)\/\/[^\r\n]*/g, ' ')
}

interface ZincirHalkasi {
  ad: string
  arg: string
}

/** `.from('t')` sonrasındaki ardışık `.yöntem(...)` halkalarını çözer (dengeli parantez, tırnaklara saygılı). */
function zincirCoz(kod: string, baslangic: number): ZincirHalkasi[] {
  const halkalar: ZincirHalkasi[] = []
  let p = baslangic
  for (;;) {
    while (p < kod.length && /\s/.test(kod[p])) p++
    if (kod[p] !== '.') break
    p++
    while (p < kod.length && /\s/.test(kod[p])) p++
    const adBas = p
    while (p < kod.length && /[\w$]/.test(kod[p])) p++
    const ad = kod.slice(adBas, p)
    if (ad === '') break
    let q = p
    while (q < kod.length && /\s/.test(kod[q])) q++
    if (kod[q] !== '(') {
      halkalar.push({ ad, arg: '' })
      continue
    }
    let derinlik = 0
    let i = q
    let tirnak: string | null = null
    for (; i < kod.length; i++) {
      const c = kod[i]
      if (tirnak) {
        if (c === '\\') i++
        else if (c === tirnak) tirnak = null
        continue
      }
      if (c === '"' || c === "'" || c === '`') tirnak = c
      else if (c === '(') derinlik++
      else if (c === ')' && --derinlik === 0) break
    }
    halkalar.push({ ad, arg: kod.slice(q + 1, i) })
    p = i + 1
  }
  return halkalar
}

/** `.from(` ifadesinin hemen öncesinde `yontemli(<ifade-başı>` var mı (sarmalayıcı biçimi)? */
function sarmalanmis(kod: string, fromIndeksi: number): boolean {
  return /\byontemli\(\s*[A-Za-z_$][\w$.]*\s*$/.test(kod.slice(Math.max(0, fromIndeksi - 200), fromIndeksi))
}

export interface YazmaBulgusu {
  tablo: string
  yazma: string
  baslikli: boolean
}

/** Bir kaynaktaki her fiyat-tablosu YAZMA zincirini bulur ve başlık taşıyıp taşımadığını söyler. */
export function yazmalariBul(kaynak: string): YazmaBulgusu[] {
  const kod = yorumSiyir(kaynak)
  const bulgular: YazmaBulgusu[] = []
  const re = new RegExp(`\\.from\\(\\s*['"](${TABLOLAR.join('|')})['"]\\s*\\)`, 'g')
  for (const m of kod.matchAll(re)) {
    const zincir = zincirCoz(kod, m.index + m[0].length)
    const yazma = zincir.find((h) => YAZMA.has(h.ad))
    if (!yazma) continue
    const dogrudan = zincir.some((h) => h.ad === 'setHeader' && /x-degisiklik-yontemi|YONTEM_BASLIGI/.test(h.arg))
    bulgular.push({ tablo: m[1], yazma: yazma.ad, baslikli: dogrudan || sarmalanmis(kod, m.index) })
  }
  return bulgular
}

function ihlalVarMi(kaynak: string): boolean {
  return yazmalariBul(kaynak).some((b) => !b.baslikli)
}

// ── Maliyet yolu (REC-412 Faz 0.5b, karar 186) ─────────────────────────────────────────────────────────────
// `products.cost_in_base` / `purchase_rate_to_base` tek meşru yazım yolu `maliyet_yenile` RPC'sidir (tek UPDATE ifadesi,
// yönetici kapılı, parti başına TEK özet günlüğü). Ürün başına PATCH ile yazan ESKİ yol günlüğü 348 ayrı istekle böler
// ve ortada hata olursa katalog yarım yenilenmiş kalır → KIRMIZI.
// ⛔KAPSAM SINIRI, ADIYLA: kolon adı `.update(...)` argümanında DOĞRUDAN geçmelidir; yamayı önce bir değişkene koyup
// `.update(yama)` diye veren kod bu tarayıcıdan kaçar (DB tarafı yine çalışır: ifade tetiği HER kaynağı görür, yalnız
// "parti özeti" sözleşmesi kaybolur).

const MALIYET_KOLONLARI = /\b(?:cost_in_base|purchase_rate_to_base)\b/

/** `products` üzerinde maliyet kolonlarına DOĞRUDAN yazan zincirlerin yazma yöntemleri (boşsa temiz). */
export function dogrudanMaliyetYazmalari(kaynak: string): string[] {
  const kod = yorumSiyir(kaynak)
  const bulgular: string[] = []
  for (const m of kod.matchAll(/\.from\(\s*['"]products['"]\s*\)/g)) {
    const zincir = zincirCoz(kod, m.index + m[0].length)
    const yazma = zincir.find((h) => YAZMA.has(h.ad) && MALIYET_KOLONLARI.test(h.arg))
    if (yazma) bulgular.push(yazma.ad)
  }
  return bulgular
}

/** Her `.rpc('maliyet_yenile', …)` çağrısı `yontemli(…, 'maliyet_yenileme')` içinde mi? (bir çağrı = bir bulgu) */
export function maliyetRpcBulgulari(kaynak: string): { dogru: boolean }[] {
  const kod = yorumSiyir(kaynak)
  const bulgular: { dogru: boolean }[] = []
  for (const m of kod.matchAll(/\.rpc\(\s*['"]maliyet_yenile['"]/g)) {
    const once = kod.slice(Math.max(0, m.index - 80), m.index)
    const sonra = kod.slice(m.index, m.index + 1200)
    const sarili = /\byontemli\(\s*[A-Za-z_$][\w$.]*\s*$/.test(once)
    const yontemDogru = /\)\s*,\s*['"]maliyet_yenileme['"]/.test(sonra)
    bulgular.push({ dogru: sarili && yontemDogru })
  }
  return bulgular
}

describe('INV-FIYAT-GUNLUGU-1 · tarayıcının kendisi ayırt edici (sabotaj)', () => {
  it('başlıksız insert → KIRMIZI', () => {
    expect(ihlalVarMi(`await supabase.from('pricing_rule').insert(x).select('*').single()`)).toBe(true)
  })

  it('çok satırlı başlıksız upsert (product_prices) → KIRMIZI', () => {
    const kaynak = `const { error } = await supabase\n  .from('product_prices')\n  .upsert(rows, { onConflict: 'a,b' })\nif (error) throw error`
    expect(ihlalVarMi(kaynak)).toBe(true)
  })

  it('başlıksız delete().in() → KIRMIZI (DELETE yük taşımaz, yalnız başlık taşıyabilir)', () => {
    expect(ihlalVarMi(`await supabase.from('pricing_policy').delete().in('id', ids)`)).toBe(true)
  })

  it('yontemli(...) sarmalayıcısı → YEŞİL (tek ve çok satırlı)', () => {
    expect(ihlalVarMi(`await yontemli(supabase.from('pricing_rule').insert(x).select('*').single(), 'panel')`)).toBe(false)
    expect(ihlalVarMi(`await yontemli(\n  supabaseBrowserClient\n    .from('price_lists')\n    .update(p)\n    .eq('id', i),\n  'panel',\n)`)).toBe(false)
  })

  it('doğrudan .setHeader(YONTEM_BASLIGI …) → YEŞİL; başka başlık → KIRMIZI', () => {
    expect(ihlalVarMi(`await supabase.from('currency_rates').insert(r).setHeader('x-degisiklik-yontemi', 'sistem')`)).toBe(false)
    expect(ihlalVarMi(`await supabase.from('currency_rates').insert(r).setHeader('x-baska', 'sistem')`)).toBe(true)
  })

  it('okuma (select) ve kapsam dışı tablo → YEŞİL', () => {
    expect(ihlalVarMi(`await supabase.from('pricing_rule').select('*').order('scope')`)).toBe(false)
    expect(ihlalVarMi(`await supabase.from('categories').update({ name: 'x' }).eq('id', 1)`)).toBe(false)
  })

  it('yorumda geçen yasak çağrı ihlal SAYILMAZ (yanlış-KIRMIZI da kusurdur)', () => {
    expect(ihlalVarMi(`// supabase.from('pricing_rule').insert(x)\n/* supabase.from('product_prices').delete() */`)).toBe(false)
  })

  it('başka bir yerdeki yontemli(...) çağrısı sarmalamaz: yazma yine KIRMIZI', () => {
    const kaynak = `const a = yontemli(baska, 'panel')\nawait supabase.from('pricing_rule').update(p).eq('id', 1)`
    expect(ihlalVarMi(kaynak)).toBe(true)
  })
})

describe('INV-FIYAT-GUNLUGU-1 · maliyet yolu tarayıcısı ayırt edici (sabotaj)', () => {
  it('products.update içinde cost_in_base → KIRMIZI (eski ürün-başına PATCH yolu)', () => {
    expect(dogrudanMaliyetYazmalari(`await supabase.from('products').update({ cost_in_base: 1, purchase_rate_to_base: 2 }).eq('id', i)`)).toEqual(['update'])
  })

  it('çok satırlı upsert içinde purchase_rate_to_base → KIRMIZI', () => {
    expect(dogrudanMaliyetYazmalari(`await supabase\n  .from('products')\n  .upsert(rows.map(r => ({ id: r.id, purchase_rate_to_base: r.k })))`)).toEqual(['upsert'])
  })

  it('maliyet olmayan products yazması, okuma ve yorum → YEŞİL', () => {
    expect(dogrudanMaliyetYazmalari(`await supabase.from('products').update({ name: 'x' }).eq('id', 1)`)).toEqual([])
    expect(dogrudanMaliyetYazmalari(`await supabase.from('products').select('id, cost_in_base').eq('id', 1)`)).toEqual([])
    expect(dogrudanMaliyetYazmalari(`// supabase.from('products').update({ cost_in_base: 1 })`)).toEqual([])
  })

  it('.rpc("maliyet_yenile") başlıksız → KIRMIZI; yanlış yöntemle sarılı → KIRMIZI; doğru sarmal → YEŞİL', () => {
    expect(maliyetRpcBulgulari(`await supabase.rpc('maliyet_yenile', { p_satirlar: x })`)).toEqual([{ dogru: false }])
    expect(maliyetRpcBulgulari(`await yontemli(supabase.rpc('maliyet_yenile', { p_satirlar: x }), 'panel')`)).toEqual([{ dogru: false }])
    expect(
      maliyetRpcBulgulari(`await yontemli(\n  supabase.rpc('maliyet_yenile', { p_satirlar: x.map(r => ({ id: r.id })) }),\n  'maliyet_yenileme',\n  yeniOturumKimligi(),\n)`),
    ).toEqual([{ dogru: true }])
  })
})

describe('INV-FIYAT-GUNLUGU-1 · maliyet yolu · gerçek kod', () => {
  const dosyalar = Object.entries(KAYNAKLAR)
    .map(([yol, kaynak]) => ({ yol: normalize(yol), kaynak }))
    .filter((d) => !d.yol.includes('__tests__') && !/\.test\.tsx?$/.test(d.yol))

  it('products maliyet kolonlarına DOĞRUDAN yazan istemci yolu YOK (tek yol maliyet_yenile RPC)', () => {
    const ihlaller = dosyalar.flatMap((d) => dogrudanMaliyetYazmalari(d.kaynak).map((y) => `${d.yol} → products.${y}`))
    expect(
      ihlaller,
      `Maliyet kolonlarına ürün-başına yazan eski yol: ${ihlaller.join(' | ')}. Toplu yenileme refreshCostInBase üzerinden ` +
        `TEK atomik RPC ile (maliyet_yenile) yazılır; ayrı PATCH'ler günlüğü böler ve yarım yenileme bırakır. Cetvel: denetim-izi-standard §8.`,
    ).toEqual([])
  })

  it('bekçi kör değil + her maliyet_yenile çağrısı yontemli(…, "maliyet_yenileme") içinde', () => {
    const cagrilar = dosyalar.flatMap((d) => maliyetRpcBulgulari(d.kaynak).map((b) => ({ ...b, yol: d.yol })))
    expect(cagrilar.length, 'maliyet_yenile çağrısı bulunamadı — tarayıcı ya da servis bozulmuş').toBeGreaterThanOrEqual(1)
    expect(cagrilar.filter((c) => !c.dogru).map((c) => c.yol), 'başlıksız/yanlış yöntemli maliyet_yenile çağrısı').toEqual([])
  })
})

describe('INV-FIYAT-GUNLUGU-1 · maliyet_yenile RPC sözleşmesi (istemci ↔ DB kayma bekçisi)', () => {
  const migration = Object.values(MALIYET_MIGRATION)[0] ?? ''
  const servis = Object.entries(KAYNAKLAR).find(([yol]) => normalize(yol) === 'src/lib/services/pricingMaterialize.service.ts')?.[1] ?? ''

  it('yönetici kapısı JWT tabanlı, INVOKER, anon/PUBLIC kapalı, tek UPDATE', () => {
    expect(migration.length, 'maliyet migration bulunamadı').toBeGreaterThan(0)
    expect(migration).toContain('public.is_admin_claim()')
    expect(migration).not.toMatch(/is_admin_user\(\)|user_profiles/) // kural 12: tabloya düşen kapı YOK
    expect(migration).toMatch(/security invoker/i)
    expect(migration).toContain('revoke all on function public.maliyet_yenile(jsonb) from public, anon')
    expect((migration.match(/update public\.products p/g) ?? []).length, 'RPC gövdesinde TEK update ifadesi olmalı').toBe(1)
  })

  it('parti sınırı istemci ile DB’de aynı (kayma → yarım/erken reddedilen yenileme)', () => {
    const db = /v_tavan constant int := (\d+);/.exec(migration)?.[1]
    const istemci = /const MALIYET_PARTI_TAVANI = (\d+)/.exec(servis)?.[1]
    expect(db, 'migration tavanı bulunamadı').toBeDefined()
    expect(istemci, 'istemci tavanı bulunamadı').toBeDefined()
    expect(istemci).toBe(db)
  })
})

describe('INV-FIYAT-GUNLUGU-1 · gerçek kod', () => {
  const dosyalar = Object.entries(KAYNAKLAR)
    .map(([yol, kaynak]) => ({ yol: normalize(yol), kaynak }))
    .filter((d) => !d.yol.includes('__tests__') && !/\.test\.tsx?$/.test(d.yol))

  it('bekçi kör değil: kapsamdaki başlıklı yazma zincirleri okunuyor', () => {
    expect(dosyalar.length, 'kaynak taraması boşaldı — glob eskimiş olabilir').toBeGreaterThan(100)
    const basliklilar = dosyalar.flatMap((d) => yazmalariBul(d.kaynak)).filter((b) => b.baslikli)
    // pricingAdmin 4 + materialize 2 + politika formu 2 = 8: sayı düşerse tarayıcı ya da kod bozulmuştur.
    expect(basliklilar.length).toBeGreaterThanOrEqual(8)
  })

  it('fiyat tablosuna başlıksız yazan yol YOK (muaflar hariç)', () => {
    const ihlaller = dosyalar
      .filter((d) => !(d.yol in MUAF))
      .flatMap((d) => yazmalariBul(d.kaynak).filter((b) => !b.baslikli).map((b) => `${d.yol} → ${b.tablo}.${b.yazma}`))
    expect(
      ihlaller,
      `Fiyat tablosuna başlıksız yazma yolu: ${ihlaller.join(' | ')}. Sorguyu yontemli(<sorgu>, '<yöntem>') ile sarın ` +
        `(src/lib/pricing/degisiklikYontemi.ts); yoksa günlükte yontem=BILINMIYOR kalır. Cetvel: denetim-izi-standard §8.`,
    ).toEqual([])
  })

  it('RATCHET: muaf dosya hâlâ başlıksız yazıyor (başlık eklendiyse listeden ÇIKAR) ve liste büyümedi', () => {
    expect(Object.keys(MUAF).length, 'muaf listesi büyüdü — gerekçeyle karar gerekir').toBeLessThanOrEqual(1)
    for (const yol of Object.keys(MUAF)) {
      const d = dosyalar.find((x) => x.yol === yol)
      expect(d, `${yol} bulunamadı — muaf listesi eskimiş`).toBeDefined()
      expect(
        d ? ihlalVarMi(d.kaynak) : false,
        `${yol} artık başlıklı (ya da fiyat tablosuna yazmıyor) — MUAF listesinden çıkarın`,
      ).toBe(true)
    }
  })
})

describe('INV-FIYAT-GUNLUGU-1 · istemci ↔ DB sözleşmesi aynı (kayma bekçisi)', () => {
  const migration = Object.values(MIGRATIONLAR)[0] ?? ''
  const yardimci = Object.entries(KAYNAKLAR).find(([yol]) => normalize(yol) === 'src/lib/pricing/degisiklikYontemi.ts')?.[1] ?? ''

  it('başlık adları ve yöntem beyaz listesi migration ile birebir', () => {
    expect(migration.length, 'migration bulunamadı').toBeGreaterThan(0)
    expect(yardimci.length, 'yardımcı modül bulunamadı').toBeGreaterThan(0)

    const istemciYontemler = [...(/type DegisiklikYontemi =([^\n]+)/.exec(yardimci)?.[1] ?? '').matchAll(/'([a-z_]+)'/g)].map((m) => m[1]).sort()
    const dbListe = /not in \(([^)]+)\)/.exec(migration)?.[1] ?? ''
    const dbYontemler = [...dbListe.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]).sort()

    expect(istemciYontemler.length).toBeGreaterThanOrEqual(6)
    expect(istemciYontemler, 'istemci tipi ile DB beyaz listesi ayrıştı').toEqual(dbYontemler)
    expect(yardimci).toContain("'x-degisiklik-yontemi'")
    expect(yardimci).toContain("'x-degisiklik-oturumu'")
    expect(migration).toContain("'x-degisiklik-yontemi'")
    expect(migration).toContain("'x-degisiklik-oturumu'")
  })
})
