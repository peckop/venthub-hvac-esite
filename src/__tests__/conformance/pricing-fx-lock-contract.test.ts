/**
 * INV-PRICE-7 — Fiyat kilidi (dondurma) sözleşmesi
 *
 * CETVEL: `docs/standards/pricing-standard.md` §8.2 (fiyat kilidi) + §8.3 (politika katmanı).
 *
 * İKİ KURAL, İKİSİ DE DAVRANIŞSAL:
 *
 * 1. **Kilit zincirin İKİ halkasında da uygulanır.** Cetvel §8.2: *"Kilitli kapsam hem
 *    `refreshCostInBase` hem materialize tarafından ATLANIR. Yalnız gösterimi dondurup
 *    maliyet tazelemesini serbest bırakmak yetmez: ertesi gün marj kelepçesi fiyatı yine
 *    oynatır."* Tek halkada uygulanan kilit, kilit değil gecikmedir.
 *
 * 2. **Merdiven tektir.** Cetvel §8.3: *"Merdiven §3.1 ile birebir aynıdır — ikinci bir
 *    öncelik mantığı icat edilmez."* Politika ve kural hedef eşleşmesi için AYNI
 *    fonksiyonu kullanmalı; iki kopya, bir gün ayrışacak iki mantık demektir.
 *
 * TEHDİT MODELİ: drift dedektörü. Yakalaması gereken, zincire yeni bir halka ekleyen ya da
 * politika için ikinci bir eşleşme fonksiyonu yazan birinin bunu fark etmemesi.
 *
 * Bu dosya iki katmanı birden sınar: DAVRANIŞ (saf çekirdeği gerçekten çalıştırarak) ve
 * YAPI (kaynak taraması). Davranış testi olan yerde kaynak taramasına güvenilmez — tarama
 * yalnızca "çağrı hâlâ duruyor mu" sorusunu cevaplar.
 */
import { describe, expect, it } from 'vitest'

import {
  type PricingPolicyRow,
  resolveFxLockWithPolicies,
  sortPolicies,
} from '../../lib/services/pricingPolicy.service'

const migrationSql = import.meta.glob('/supabase/migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const serviceSources = import.meta.glob('/src/lib/services/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const MATERIALIZE_SRC = '/src/lib/services/pricingMaterialize.service.ts'
const POLICY_SRC = '/src/lib/services/pricingPolicy.service.ts'

/** Test kolaylığı: yalnız merdiven alanlarını verip gerisini varsayılana bırakır. */
function policy(over: Partial<PricingPolicyRow> & { id: string; scope: number }): PricingPolicyRow {
  return {
    brand_id: null,
    category_id: null,
    created_at: '2026-01-01T00:00:00.000Z',
    frozen_at: '2026-01-01T00:00:00.000Z',
    frozen_by: null,
    fx_frozen_rate: 55.32,
    fx_lock: true,
    is_active: true,
    note: null,
    priority: 0,
    product_id: null,
    tenant_id: 't',
    updated_at: '2026-01-01T00:00:00.000Z',
    updated_by: null,
    ...over,
  }
}

const URUN = { id: 'p1', brandId: 'b1', categoryId: 'c-child' }
const ATALAR = new Set(['c-child', 'c-parent'])

describe('INV-PRICE-7 — fiyat kilidi (dondurma)', () => {
  describe('merdiven davranışı — en özel kazanır', () => {
    it('global kilit tüm ürünleri kilitler', () => {
      const d = resolveFxLockWithPolicies(URUN, [policy({ id: 'g', scope: 4 })], ATALAR)
      expect(d.locked).toBe(true)
      expect(d.frozenRate).toBe(55.32)
    })

    it('kategori kilidi ATA zincirinden de eşleşir (cascade)', () => {
      const d = resolveFxLockWithPolicies(URUN, [policy({ id: 'k', scope: 3, category_id: 'c-parent' })], ATALAR)
      expect(d.locked).toBe(true)
    })

    it('ilgisiz marka kilidi eşleşmez', () => {
      const d = resolveFxLockWithPolicies(URUN, [policy({ id: 'm', scope: 2, brand_id: 'baska' })], ATALAR)
      expect(d.locked).toBe(false)
    })

    it('DAHA ÖZEL bir `fx_lock=false`, daha genel kilidi BOZAR', () => {
      // "Global kilit ama şu ürün hariç" ifade edilebilmeli. Belirleyici olan kilidin
      // havuzda BULUNMASI değil, en özel politikanın DEĞERİdir. Bu, en kolay yanlış
      // uygulanacak kural: `policies.some(p => p.fx_lock)` yazmak testi burada patlatır.
      const d = resolveFxLockWithPolicies(
        URUN,
        [policy({ id: 'g', scope: 4 }), policy({ id: 'u', scope: 1, product_id: 'p1', fx_lock: false })],
        ATALAR,
      )
      expect(d.locked).toBe(false)
    })

    it('pasif politika hiç sayılmaz', () => {
      const d = resolveFxLockWithPolicies(URUN, [policy({ id: 'g', scope: 4, is_active: false })], ATALAR)
      expect(d.locked).toBe(false)
    })

    it('sıralama scope ASC → priority DESC → id DESC', () => {
      const sirali = sortPolicies([
        policy({ id: 'a', scope: 4, priority: 0 }),
        policy({ id: 'b', scope: 2, brand_id: 'b1', priority: 5 }),
        policy({ id: 'c', scope: 2, brand_id: 'b1', priority: 9 }),
      ]).map((p) => p.id)
      expect(sirali).toEqual(['c', 'b', 'a'])
    })
  })

  it('merdiven TEK yerde: politika, kuralın hedef eşleştiricisini KULLANIR', () => {
    // Cetvel §8.3 — ikinci bir öncelik mantığı icat edilmez. Politika servisi kendi
    // `switch (scope)` bloğunu yazarsa iki mantık bir gün ayrışır ve "kural bu ürüne
    // uyuyor ama politika uymuyor" gibi teşhisi zor bir durum doğar.
    const src = serviceSources[POLICY_SRC]
    expect(src, `${POLICY_SRC} okunamadı.`).toBeTruthy()

    expect(
      /\bscopeMatchesProduct\s*\(/.test(src),
      'Politika servisi ortak `scopeMatchesProduct` fonksiyonunu ÇAĞIRMIYOR. Cetvel §8.3: ' +
        'merdiven §3.1 ile birebir aynıdır, ikinci bir öncelik mantığı icat edilmez.',
    ).toBe(true)

    // Kendi scope switch'ini yazmış mı? (import satırları çıkarılır — ad geçmesi ≠ kullanım,
    // ve tersi de geçerli: yorum içindeki örnek kod suçlama sebebi olmamalı.)
    const kodsuz = src
      .replace(/^\s*import[\s\S]*?from\s+['"][^'"]+['"]\s*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
    expect(
      /switch\s*\(\s*\w+\.scope\s*\)/.test(kodsuz),
      'Politika servisi KENDİ `switch (x.scope)` merdivenini yazmış. Ortak ' +
        '`scopeMatchesProduct` kullanılmalı — iki kopya, bir gün ayrışacak iki mantıktır.',
    ).toBe(false)
  })

  it('kilit zincirin İKİ halkasında da uygulanır (refresh + materialize)', () => {
    const src = serviceSources[MATERIALIZE_SRC]
    expect(src, `${MATERIALIZE_SRC} okunamadı.`).toBeTruthy()

    const kodsuz = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

    // İki ayrı fonksiyon: `refreshCostInBase` toplu çözücüyü, `materializePrices` sayfalama
    // yüzünden saf çekirdeği kullanır. İkisinin de kilidi SORMASI şart.
    const refreshGovde = kodsuz.slice(
      kodsuz.indexOf('export async function refreshCostInBase'),
      kodsuz.indexOf('export async function materializePrices'),
    )
    const materializeGovde = kodsuz.slice(kodsuz.indexOf('export async function materializePrices'))

    expect(
      /resolveFxLocks?\s*\(|resolveFxLockWithPolicies\s*\(/.test(refreshGovde),
      '`refreshCostInBase` fiyat kilidini SORMUYOR. Cetvel §8.2: kilitli kapsamın ' +
        '`cost_in_base`\'i tazelenmez — yalnız materialize\'i atlamak yetmez, ertesi gün ' +
        'herhangi bir yeniden-hesaplama fiyatı oynatır.',
    ).toBe(true)

    expect(
      /resolveFxLockWithPolicies\s*\(|resolveFxLocks\s*\(/.test(materializeGovde),
      '`materializePrices` fiyat kilidini SORMUYOR. Kilitli kapsamın cache satırı yeniden ' +
        'hesaplanmamalı.',
    ).toBe(true)

    // Sayaçlar: dondurma bir KARARdır, sessiz atlama değil. Panelde görünmeyen bir atlama,
    // "bu fiyat neden güncellenmedi" sorusunu cevapsız bırakır.
    expect(
      /skippedFxLocked/.test(refreshGovde) && /skippedFxLocked/.test(materializeGovde),
      'Atlanan ürünler `skippedFxLocked` sayacına yazılmıyor — sessiz atlama kabul edilemez.',
    ).toBe(true)
  })

  it('şema tarafı: kilit KÜNYESİZ olamaz + merdiven kısıtı kuralınkiyle aynı', () => {
    const sql = Object.entries(migrationSql)
      .filter(([, s]) => s.toLowerCase().includes('create table if not exists public.pricing_policy'))
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
      .pop()
    expect(sql, 'Hiçbir migration `pricing_policy` tablosunu oluşturmuyor.').toBeTruthy()

    const n = sql![1].toLowerCase()

    // Kilit bir karardır; dayandığı kur kaydedilmezse denetlenebilirliği kaybolur (§8.2).
    expect(
      /fx_lock\s*=\s*false\s+or\s+fx_frozen_rate\s+is\s+not\s+null/.test(n),
      'Kilit künyesi CHECK\'i yok: `fx_lock=true` ama `fx_frozen_rate` boş bir satır mümkün. ' +
        'Cetvel §8.2 kilidin "hangi kurdan" donduğunu taşımasını şart koşuyor.',
    ).toBe(true)

    // scope↔hedef kısıtı `pricing_rule` ile aynı olmalı — merdivenin şema tarafındaki eşi.
    expect(
      /scope in \(0, 1\) and product_id is not null/.test(n),
      '`pricing_policy_scope_target` kısıtı `pricing_rule_scope_target` ile aynı biçimde değil.',
    ).toBe(true)
  })
})
