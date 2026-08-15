import { describe, expect, it } from 'vitest'

/**
 * INV-RENDER-2 · Tazeleme sözleşmesi: TETİK ⇄ HANDLER eşleşmesi.
 *
 * KURAL (SSOT: docs/standards/rendering-cache-standard.md §3):
 * "Statik vitrin sayfasında görünen HER tablonun (a) DB tetiği ve (b) webhook handler dalı olmalıdır."
 *
 * NİÇİN VAR: 2026-08-15'te 1044 fiyat satırı prod'a yazıldı ve vitrin DEĞİŞMEDİ. Sebep tek tek
 * bakınca görünmüyordu — ürün sayfası statik üretiliyor, tazeleme webhook'a bağlı, webhook üç
 * tabloyu dinliyor ve `product_prices` o üçünde yoktu. Yani zincirin iki ucundan biri eksikti ve
 * **hiçbir test bunu görmedi**: handler dalı yazılmış olsa bile tetik yoksa webhook hiç ateşlenmez;
 * tetik olsa bile handler dalı yoksa istek gelir ve sessizce düşer. İki ucu AYRI AYRI doğru olabilir,
 * yanlış olan EŞLEŞMEdir — bu yüzden kapı çift yönlü kurulmuştur.
 *
 * Cetvel bu kuralı yazdı ama onu zorlayan test yoktu; "yazdım ama bağlamadım" borcunu bu dosya kapatır.
 *
 * KAPSAM DIŞI (dürüstçe): bu statik bir tarama. Tetiğin prod'da GERÇEKTEN var olduğunu değil,
 * repodaki SQL kaynaklarında tanımlı olduğunu doğrular. Prod ile repo'nun ayrışması ayrı bir risktir
 * (migration ledger + `supabase-migrate.yml` oraya bakar). Handler dalının DOĞRU yolu tazelediğini de
 * denetlemez — yalnız dalın VAR olduğunu.
 */

/**
 * Cetvel §3'teki tablo. Buradaki liste ile cetveldeki tablo birlikte güncellenmelidir:
 * altıncı bir tablo vitrine çıktığında bu diziye eklenmezse kapı sessiz kalır.
 */
const REQUIRED_TABLES = [
  'products',
  'categories',
  'inventory_movements',
  'product_families',
  'product_prices',
] as const

const ROUTE_PATH = '/src/app/api/webhook/supabase/route.ts'
const WEBHOOK_FN = 'handle_supabase_webhook'

/**
 * SQL kaynakları İKİ yerde yaşıyor ve bu tesadüf değil:
 *  - `supabase/baselines/*.sql` — şema anlık görüntüleri. İlk üç webhook tetiği (`on_products_change`,
 *    `on_categories_change`, `on_inventory_movements_change`) YALNIZ burada tanımlı; hiçbir migration
 *    dosyasında geçmiyorlar (repo'dan önce elle kurulmuşlar).
 *  - `supabase/migrations/*.sql` — sonradan eklenenler (`product_prices`, `product_families`).
 * Yalnız `migrations/`'a bakan bir tarayıcı ilk üç tabloyu "tetiksiz" sanıp YANLIŞ kırmızı yanardı.
 */
const baselineSql = import.meta.glob('/supabase/baselines/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const migrationSql = import.meta.glob('/supabase/migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const routeSources = import.meta.glob('/src/app/api/webhook/supabase/route.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** `--` satır yorumlarını ve `/* *\/` bloklarını ele — yorumdaki örnek SQL gerçek tanım sanılmasın. */
function stripSqlComments(sql: string): string {
  return sql.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--[^\n]*/g, ' ')
}

/** TS/JS yorumlarını ele (aynı gerekçe; INV-WEBHOOK-1 bu tuzağa bir kez düştü). */
function stripTsComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

/**
 * Webhook tetiklerinin YAŞAYAN durumunu hesapla.
 *
 * Dosyalar kronolojik sırayla işlenir (önce baseline anlık görüntüleri, sonra migration'lar) ve
 * `create` / `drop` etkileri sırayla uygulanır. Tek bir `create trigger` görmek yetmez: sonraki bir
 * migration onu düşürmüş olabilir ve o durumda tablo fiilen tetiksizdir. Sözleşmenin kendisi
 * "tetik VAR MI" sorusudur, "bir zamanlar yazılmış mı" değil.
 */
function liveWebhookTriggers(): Map<string, string> {
  const files = [
    ...Object.keys(baselineSql).sort().map((k) => [k, baselineSql[k]] as const),
    ...Object.keys(migrationSql).sort().map((k) => [k, migrationSql[k]] as const),
  ]

  // tetikAdı -> tabloAdı (yalnız handle_supabase_webhook çağıran tetikler)
  const live = new Map<string, string>()

  for (const [, rawSql] of files) {
    const sql = stripSqlComments(rawSql)
    for (const stmt of sql.split(';')) {
      const dropMatch = /\bdrop\s+trigger\s+(?:if\s+exists\s+)?([\w."]+)\s+on\s+(?:public\.)?([\w."]+)/i.exec(stmt)
      if (dropMatch) {
        // Yalnız bizim izlediğimiz (webhook) tetikse haritadan düşer; diğer tetikler zaten haritada yok.
        live.delete(dropMatch[1].replace(/"/g, ''))
        continue
      }
      if (!stmt.toLowerCase().includes(WEBHOOK_FN)) continue
      const createMatch = /\bcreate\s+trigger\s+([\w."]+)[\s\S]*?\bon\s+(?:public\.)?([\w."]+)/i.exec(stmt)
      if (!createMatch) continue
      live.set(createMatch[1].replace(/"/g, ''), createMatch[2].replace(/"/g, ''))
    }
  }

  return live
}

/** Handler'ın hangi tablolar için dalı var: `table === 'x'` karşılaştırmaları. */
function handledTables(routeSrc: string): Set<string> {
  const src = stripTsComments(routeSrc)
  const found = new Set<string>()
  for (const m of src.matchAll(/\btable\s*===\s*'([\w]+)'/g)) found.add(m[1])
  return found
}

describe('INV-RENDER-2 · tazeleme sözleşmesi (tetik ⇄ handler)', () => {
  it('kaynaklar bulunabiliyor (stale-guard: glob boşa düşerse test sessizce yeşil kalmasın)', () => {
    expect(Object.keys(baselineSql).length, 'supabase/baselines/*.sql bulunamadı').toBeGreaterThan(0)
    expect(Object.keys(migrationSql).length, 'supabase/migrations/*.sql bulunamadı').toBeGreaterThan(0)
    expect(Object.keys(routeSources), `Webhook rotası ${ROUTE_PATH} bulunamadı`).toContain(ROUTE_PATH)
  })

  it('cetveldeki her tablonun YAŞAYAN bir DB tetiği var', () => {
    const tablesWithTrigger = new Set(liveWebhookTriggers().values())
    const missing = REQUIRED_TABLES.filter((t) => !tablesWithTrigger.has(t))
    expect(
      missing,
      `TETİK EKSİK: [${missing.join(', ')}] tablosu vitrinde görünüyor ama ${WEBHOOK_FN}() çağıran ` +
        'yaşayan bir tetiği yok. Bu tam olarak 2026-08-15 hatasıdır: veri değişir, webhook HİÇ ateşlenmez, ' +
        'statik sayfa eski kalır ve hiçbir şey hata vermez. Çözüm: supabase/migrations/ altına ' +
        '`create trigger ... execute function public.handle_supabase_webhook();` ekle.',
    ).toEqual([])
  })

  it('cetveldeki her tablonun bir handler dalı var', () => {
    const handled = handledTables(routeSources[ROUTE_PATH] ?? '')
    const missing = REQUIRED_TABLES.filter((t) => !handled.has(t))
    expect(
      missing,
      `HANDLER DALI EKSİK: [${missing.join(', ')}] için ${ROUTE_PATH} içinde "table === '<tablo>'" dalı yok. ` +
        'Tetik ateşlenir, istek gelir ve sessizce düşer — hiçbir sayfa tazelenmez.',
    ).toEqual([])
  })

  it('tetiği olan HER tablonun handler dalı da var (tetik → handler yönü)', () => {
    const tablesWithTrigger = [...new Set(liveWebhookTriggers().values())].sort()
    const handled = handledTables(routeSources[ROUTE_PATH] ?? '')
    const orphanTriggers = tablesWithTrigger.filter((t) => !handled.has(t))
    expect(
      orphanTriggers,
      `ÖKSÜZ TETİK: [${orphanTriggers.join(', ')}] tablosunda webhook tetiği var ama handler'da karşılığı yok. ` +
        'Her satır değişikliğinde boşuna HTTP isteği atılır ve hiçbir şey tazelenmez — maliyet var, etki yok. ' +
        'Ya handler dalını ekle ya tetiği kaldır.',
    ).toEqual([])
  })

  it('handler dalı olan HER tablonun tetiği de var (handler → tetik yönü)', () => {
    const tablesWithTrigger = new Set(liveWebhookTriggers().values())
    const orphanHandlers = [...handledTables(routeSources[ROUTE_PATH] ?? '')]
      .filter((t) => !tablesWithTrigger.has(t))
      .sort()
    expect(
      orphanHandlers,
      `ÖKSÜZ HANDLER: [${orphanHandlers.join(', ')}] için handler dalı yazılmış ama o tabloda ` +
        `${WEBHOOK_FN}() çağıran tetik yok. Kod doğru görünür, gözden geçirme geçer, ürün ÇALIŞMAZ — ` +
        'çünkü webhook hiç ateşlenmez. 2026-08-15 hatasının tam imzası budur.',
    ).toEqual([])
  })
})
