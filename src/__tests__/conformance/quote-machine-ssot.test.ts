import { describe, expect, it } from 'vitest'

import {
  QUOTE_ADMIN_TRANSITIONS,
  QUOTE_CUSTOMER_TRANSITIONS,
  QUOTE_STATUSES,
  QUOTE_TRANSITIONS,
  type QuoteStatus,
} from '../../lib/quotes/quoteStatusMachine'

/**
 * INV-QUOTE-1 · Teklif durum-makinesi SSOT conformance (kalıcı bekçi).
 * Cetvel: docs/standards/quote-standard.md (R1–R6). Doğuş: T067-VH (2026-08-16).
 *
 * ÇAĞRI-BAZLI yarısı: makine modülü GERÇEKTEN import edilir (R1a/R3a) — metin
 * eşleşmesi değil, çalışan kod doğrulanır (substring-assert dersi).
 * STATİK yarısı: kaynaklar import.meta.glob('?raw') ile okunur; yorum sıyırma
 * [^\r\n] ile yapılır — bu depo CRLF saklar ve JS'te '.' \r ile EŞLEŞMEZ;
 * /--.*$/m deseni burada HİÇBİR ŞEYİ temizlemez (T017 fantomu / LEGAL dersi).
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SRC: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const QUOTE_MIGRATIONS: Record<string, string> = import.meta.glob(
  '/supabase/migrations/*_quotes_*.sql',
  { query: '?raw', import: 'default', eager: true },
)

/** SQL satır-yorumlarını CRLF-güvenli sıyırır (LEGAL dersi: [^\r\n], NOKTA DEĞİL). */
function stripSqlComments(sql: string): string {
  return sql.replace(/--[^\r\n]*/g, '')
}

/** TS/TSX yorumlarını CRLF-güvenli sıyırır. */
function stripTsComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\r\n]*/g, '$1')
}

function relPath(globKey: string): string {
  const idx = globKey.indexOf('/src/')
  return (idx >= 0 ? globKey.slice(idx + '/src/'.length) : globKey).replace(/\\/g, '/')
}

const TERMINALS: QuoteStatus[] = ['accepted', 'rejected', 'expired']

function migrationSource(): { path: string; sql: string } {
  const entries = Object.entries(QUOTE_MIGRATIONS)
  expect(entries.length, 'quotes migration bulunamadı (*_quotes_*.sql)').toBeGreaterThan(0)
  // Birden çok quotes migration'ı gelirse geçiş tetiği İLK kurulan dosyada yaşar;
  // tetiği yeniden tanımlayan sonraki migration da aynı kurallardan geçmek zorunda.
  const withTrigger = entries.filter(([, sql]) => sql.includes('enforce_quote_status_transition'))
  expect(withTrigger.length, 'enforce_quote_status_transition tetiği hiçbir quotes migration\'ında yok').toBeGreaterThan(0)
  const [path, sql] = withTrigger[withTrigger.length - 1]
  return { path, sql }
}

/** Migration'daki izinli geçişleri ayrıştır: if old.status = 'x' and new.status in ('a', 'b') */
function parseMigrationTransitions(sql: string): Record<string, string[]> {
  const clean = stripSqlComments(sql)
  const out: Record<string, string[]> = {}
  const re = /old\.status\s*=\s*'([a-z_]+)'\s*and\s*new\.status\s+in\s*\(([^)]*)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(clean)) !== null) {
    const from = m[1]
    const targets = [...m[2].matchAll(/'([a-z_]+)'/g)].map((t) => t[1])
    out[from] = [...new Set([...(out[from] ?? []), ...targets])]
  }
  return out
}

describe('INV-QUOTE-1 · teklif durum-makinesi SSOT', () => {
  /* ---- R1a (çağrı-bazlı): rol dilimleri haritanın alt kümesi + birleşimi haritayı KAPLAR ---- */
  it('R1a: rol dilimleri SSOT haritasının içinde ve birleşimleri haritayı tam kaplar', () => {
    for (const status of QUOTE_STATUSES) {
      const full = new Set(QUOTE_TRANSITIONS[status])
      const admin = QUOTE_ADMIN_TRANSITIONS[status]
      const customer = QUOTE_CUSTOMER_TRANSITIONS[status]
      for (const target of [...admin, ...customer]) {
        expect(full.has(target), `${status} -> ${target} rol diliminde var ama SSOT haritasında yok`).toBe(true)
      }
      const union = new Set([...admin, ...customer])
      expect([...full].sort(), `${status}: dilimlerin birleşimi haritayı kaplamıyor (ölü geçiş)`)
        .toEqual([...union].sort())
    }
  })

  /* ---- R1b (statik): SSOT dışında geçiş haritası tanımlanamaz ---- */
  it('R1b: views/components içinde ikinci bir quote geçiş listesi tanımlanamaz', () => {
    const offenders: string[] = []
    for (const [key, source] of Object.entries(SRC)) {
      const rel = relPath(key)
      if (!rel.startsWith('views/') && !rel.startsWith('components/')) continue
      if (rel.includes('.test.') || rel.includes('__tests__')) continue
      const clean = stripTsComments(source)
      // Tanım (=/:) yakalanır; SSOT'tan import edip ÇAĞIRMAK serbest.
      if (/\b(?:QUOTE_TRANSITIONS|QUOTE_ADMIN_TRANSITIONS|QUOTE_CUSTOMER_TRANSITIONS)\s*[:=]/.test(clean)) {
        offenders.push(rel)
      }
    }
    expect(offenders, `SSOT dışında geçiş haritası tanımı: ${offenders.join(', ')}`).toEqual([])
  })

  /* ---- R1c (çağrı-bazlı kullanım): karar yüzeyleri SSOT fonksiyonlarını çağırır ---- */
  it('R1c: müşteri karar yüzeyi allowedCustomerQuoteActions çağırır', () => {
    const detail = SRC['/src/views/account/quotes/QuoteDetailPage.tsx']
    expect(detail, 'QuoteDetailPage.tsx bulunamadı').toBeTruthy()
    expect(stripTsComments(detail)).toMatch(/allowedCustomerQuoteActions\s*\(/)
  })

  it('R1c: admin kuyruğu allowedAdminQuoteActions çağırır', () => {
    const admin = SRC['/src/views/admin/quotes/QuotesTableBody.tsx']
    expect(
      admin,
      'views/admin/quotes/QuotesTableBody.tsx YOK — admin kuyruğu olmadan teklif modülü yarımdır (T067 kapsam)',
    ).toBeTruthy()
    expect(stripTsComments(admin)).toMatch(/allowedAdminQuoteActions\s*\(/)
  })

  /* ---- R2: migration tetiği SSOT'un birebir aynası ---- */
  it('R2: enforce_quote_status_transition geçişleri SSOT ile birebir aynı', () => {
    const { path, sql } = migrationSource()
    const parsed = parseMigrationTransitions(sql)

    for (const status of QUOTE_STATUSES) {
      const expected = [...QUOTE_TRANSITIONS[status]].sort()
      const actual = [...(parsed[status] ?? [])].sort()
      expect(actual, `${path}: '${status}' geçişleri SSOT'tan sapmış`).toEqual(expected)
    }
    // Migration SSOT'ta olmayan bir kaynak-durum da tanımlayamaz.
    for (const from of Object.keys(parsed)) {
      expect(
        (QUOTE_STATUSES as readonly string[]).includes(from),
        `${path}: SSOT'ta olmayan kaynak durum '${from}'`,
      ).toBe(true)
    }
  })

  /* ---- R3: terminaller soğurucu — hem makinede hem migration'da ---- */
  it('R3: terminal durumlardan çıkış ne SSOT ta ne migration da var', () => {
    for (const terminal of TERMINALS) {
      expect(QUOTE_TRANSITIONS[terminal], `SSOT: '${terminal}' terminalden çıkış var`).toEqual([])
    }
    const { path, sql } = migrationSource()
    const parsed = parseMigrationTransitions(sql)
    for (const terminal of TERMINALS) {
      expect(parsed[terminal] ?? [], `${path}: '${terminal}' terminalden çıkış tanımlı`).toEqual([])
    }
  })

  /* ---- R4: RLS politikaları sahiplik VE tenant şartını birlikte taşır ---- */
  it('R4: her quotes RLS politikası tenant_id + (sahiplik|admin) şartı taşır', () => {
    const { path, sql } = migrationSource()
    const clean = stripSqlComments(sql)
    const policyRe = /create\s+policy\s+([a-z_]+)\s+on\s+public\.(venthub_quotes|venthub_quote_items)[\s\S]*?;/g
    const policies = [...clean.matchAll(policyRe)]
    expect(policies.length, `${path}: hiç policy bulunamadı — RLS ilk günden şart (cetvel Q3)`).toBeGreaterThan(0)

    for (const [block, name, table] of policies) {
      expect(block, `${path} · ${table}.${name}: tenant kapsamı yok (T057 regresyon sınıfı)`)
        .toMatch(/tenant_id\s*=\s*public\.jwt_tenant_id\(\)/)
      expect(
        /auth\.uid\(\)/.test(block) || /is_admin_user\(\)/.test(block),
        `${path} · ${table}.${name}: ne sahiplik (auth.uid) ne admin şartı var`,
      ).toBe(true)
    }
  })

  /* ---- R5: müşteri yüzü fiyat kolonu YAZMAZ ---- */
  it('R5: müşteri yüzünde unit_price/currency/valid_until anahtar konumunda geçmez', () => {
    // Kapsam = TEKLİF müşteri yüzeyleri. views/account/ TAMAMI değil: sipariş
    // sayfaları kendi sipariş-kalemi snapshot'larında unit_price'ı meşru kullanır
    // (ilk koşuda OrderDetailPage yanlış-pozitif verdi — kapsam bilinçli dar).
    const scope = [
      'views/account/quotes/',
      'components/quotes/',
      'lib/services/quoteService.ts',
    ]
    const offenders: string[] = []
    for (const [key, source] of Object.entries(SRC)) {
      const rel = relPath(key)
      if (!scope.some((s) => rel.startsWith(s))) continue
      if (rel.includes('.test.') || rel.includes('__tests__')) continue
      const clean = stripTsComments(source)
      // Anahtar konumu (`unit_price:` / `valid_until:`) = yazma/tanım niyeti.
      // Okuma erişimi (`item.unit_price`) serbest — tipler quotes.bridge.ts'te yaşar.
      if (/\b(?:unit_price|valid_until)\s*:/.test(clean)) offenders.push(rel)
    }
    expect(
      offenders,
      `Fiyat kolonu anahtar-konumunda (yazma niyeti) — fiyat otoritesi admin (cetvel Q3/R5): ${offenders.join(', ')}`,
    ).toEqual([])
  })

  /* ---- R6: sayfa ↔ rota ↔ nav zinciri kopuk olamaz (404/ölü-sayfa sınıfı) ---- */
  it('R6: quotes sayfaları varsa Routes.account tanımı ve nav bağlantısı da var', () => {
    const listPage = SRC['/src/app/[lang]/account/quotes/page.tsx']
    const detailPage = SRC['/src/app/[lang]/account/quotes/detail/page.tsx']
    expect(listPage, '/account/quotes sayfası yok').toBeTruthy()
    expect(detailPage, '/account/quotes/detail sayfası yok').toBeTruthy()

    const routes = SRC['/src/utils/routes.ts']
    expect(routes, 'utils/routes.ts bulunamadı').toBeTruthy()
    const cleanRoutes = stripTsComments(routes)
    expect(cleanRoutes, 'Routes.account.quotes tanımı yok — sayfa var ama rota SSOT bilmiyor (ölü sayfa)')
      .toMatch(/quotes\s*:\s*\(\)\s*=>/)
    expect(cleanRoutes, 'Routes.account.quoteDetail tanımı yok').toMatch(/quoteDetail\s*:/)

    const layout = SRC['/src/views/account/AccountLayout.tsx']
    expect(layout, 'AccountLayout.tsx bulunamadı').toBeTruthy()
    expect(
      stripTsComments(layout),
      'AccountLayout nav\'ında quotes sekmesi yok — sayfa menüden erişilemez (ölü sayfa)',
    ).toMatch(/account\.quotes\(\)/)
  })
})
