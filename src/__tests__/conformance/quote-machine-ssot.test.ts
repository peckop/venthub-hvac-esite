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

/**
 * KAPSAM ADA DEĞİL İÇERİĞE BAĞLI — T134'te ölçülen kusurun onarımı.
 *
 * Eskiden burada `'/supabase/migrations/*_quotes_*.sql'` yazıyordu, yani seçim DOSYA
 * ADINA bakıyordu ve ad ÇOĞULDU. `20260817200000_quote_request_notification.sql`
 * (TEKİL `_quote_`) `venthub_quotes`'a dokunduğu HALDE kapıya GÖRÜNMÜYORDU — ve
 * içinde `quote_email_events_admin_read` politikası var, **tenant_id şartı YOK**.
 * Yani kör nokta varsayımsal bir risk değildi: gerçek bir tenant kapsamı boşluğunu
 * saklıyordu. Bir dosyayı yeniden adlandırmak, kapıyı kapatmanın en sessiz yoluydu.
 *
 * Artık TÜM migration'lar okunur ve seçim İÇERİKTEN yapılır: quote adlı bir tabloya
 * veya durum-geçiş tetiğine dokunan her dosya kapsamdadır. Ad değişse de kapsamda kalır.
 */
const ALL_MIGRATIONS: Record<string, string> = import.meta.glob(
  '/supabase/migrations/*.sql',
  { query: '?raw', import: 'default', eager: true },
)

/** İçerikte quote adlı bir tabloya ya da geçiş tetiğine dokunuyor mu? */
function touchesQuotes(sql: string): boolean {
  return /public\.[a-z_]*quote[a-z_]*/i.test(sql) || sql.includes('enforce_quote_status_transition')
}

const QUOTE_MIGRATIONS: Record<string, string> = Object.fromEntries(
  Object.entries(ALL_MIGRATIONS).filter(([, sql]) => touchesQuotes(sql)),
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

/**
 * SOĞURUCU TERMİNALLER — cetvel §4'ün listesi (v2, T131-VH).
 *
 * ⚠ `accepted` BU LİSTEDEN ÇIKTI ve bu bir GEVŞETMEDİR; sessizce yapılmıyor.
 * Yetkisi cetvelin kendisidir: §4 "accepted → converted" köprüsünü (§10) tanımlar,
 * yani kabul artık soğurucu değil. Kapıyı geçirmek için kapıyı değiştirmek
 * tehlikeli bir desendir; o yüzden değişiklikten sonra bekçi BİLEREK BOZULARAK
 * (ör. `accepted → quoted` eklenerek) hâlâ kırmızı verdiği kanıtlandı — yeşil
 * geçmesi çalıştığını kanıtlamaz (§15 son paragraf).
 */
const TERMINALS: QuoteStatus[] = ['rejected', 'expired', 'cancelled', 'superseded', 'converted']

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
  /* ---- R0: KAPSAM KANARYASI — kapi bos kumede kosup YESIL veremez ---- */
  it('R0: kapsam gercekten okundu (bos kume sessizce GECEMEZ)', () => {
    // Bu kapinin bugune kadarki en sinsi kusuru "hicbir sey olcmeden yesil" idi:
    // dosya adi degisince glob bos donuyor, dongu sifir eleman uzerinde kosuyor ve
    // TUM assert'ler GECIYORDU. Once tarama gercekten oldu mu, ONU olceriz.
    expect(Object.keys(ALL_MIGRATIONS).length, 'migration dizini hic okunamadi').toBeGreaterThan(50)
    expect(
      Object.keys(QUOTE_MIGRATIONS).length,
      'icerikte quote gecen migration BULUNAMADI — secim bozulmus olabilir',
    ).toBeGreaterThanOrEqual(2)

    // Ayirt edicilik: secici gercekten AYIKLIYOR mu, yoksa her seyi mi aliyor?
    // Ikisi esit olsaydi filtre calismiyor demekti ve "2 dosya bulundu" yanlis guven verirdi.
    expect(
      Object.keys(QUOTE_MIGRATIONS).length,
      'filtre hicbir seyi elemiyor — icerik secimi calismiyor',
    ).toBeLessThan(Object.keys(ALL_MIGRATIONS).length)

    // Gecis tetigi kapsamda mi? (R2/R3 buna dayaniyor)
    const tetikli = Object.keys(QUOTE_MIGRATIONS).filter((k) =>
      QUOTE_MIGRATIONS[k].includes('enforce_quote_status_transition'),
    )
    expect(tetikli.length, 'gecis tetigini tanimlayan migration kapsamda yok').toBeGreaterThan(0)
  })

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

  /* ---- R1d: quote yüzeylerinde YEREL statü dizisi tanımlanamaz ---- */
  it('R1d: teklif yüzeylerinde durum kümesi elle yazılmış bir dizi olarak tanımlanamaz', () => {
    // NİÇİN AYRI BİR MADDE: R1b AD-BAZLI. Yalnız QUOTE_TRANSITIONS ve kardeşlerinin
    // adını arıyor. T131'de ölçüldü ki admin kuyruğunda `STATUS_VALUES` adıyla İKİNCİ
    // bir durum listesi yaşıyordu ve R1b onu GÖRMÜYORDU — harita beşten dokuza
    // çıktığında dört yeni durum admin süzgecinde sessizce görünmez olurdu. Kusur
    // R1b'nin engellemek istediği şeydi; sadece adı tutmuyordu.
    //
    // KAPSAM BİLİNÇLİ DAR: yalnız TEKLİF yüzeyleri. `venthub_returns` kendi durum
    // kümesini taşıyor ve 'requested'/'rejected'/'cancelled' sözcükleri ORTAK —
    // depo geneline açılan bir desen İADE şeridinin listesini yanlış-pozitif
    // suçlardı. Kapı başka şeridin işini suçlayamaz.
    const KAPSAM = ['views/admin/quotes/', 'views/account/quotes/', 'components/quotes/']
    const offenders: string[] = []

    for (const [key, source] of Object.entries(SRC)) {
      const rel = relPath(key)
      if (!KAPSAM.some((s) => rel.startsWith(s))) continue
      if (rel.includes('.test.') || rel.includes('__tests__')) continue
      const clean = stripTsComments(source)

      // Dizi literalleri: içinde İKİ VE DAHA FAZLA quote statüsü dizesi geçen bir
      // literal, elle yazılmış bir durum kümesidir. SSOT'tan türetme (`QUOTE_STATUSES`
      // referansı) bu desende değildir, o yüzden yakalanmaz.
      for (const [literal] of clean.matchAll(/\[[^[\]]*\]/g)) {
        const sayim = (QUOTE_STATUSES as readonly string[]).filter((s) =>
          new RegExp(`['"]${s}['"]`).test(literal),
        ).length
        if (sayim >= 2) offenders.push(`${rel} → ${literal.slice(0, 60)}`)
      }
    }

    expect(
      offenders,
      `Teklif yüzeyinde yerel durum kümesi (SSOT'tan türet: QUOTE_STATUSES): ${offenders.join(' | ')}`,
    ).toEqual([])
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
    // T134 ONARIMI: eskiden yalniz migrationSource() yani TEK dosya denetleniyordu.
    // Politika baska bir migration'da tanimlanirsa (ki normal akis budur — sonraki
    // migration politikayi yeniden yazar) kapi onu HIC gormezdi. Artik kapsamdaki
    // TUM migration'lar taranir.
    const policyRe = /create\s+policy\s+([a-z_]+)\s+on\s+public\.(venthub_quotes|venthub_quote_items)[\s\S]*?;/g
    let toplam = 0

    for (const [path, sql] of Object.entries(QUOTE_MIGRATIONS)) {
      const clean = stripSqlComments(sql)
      for (const [block, name, table] of clean.matchAll(policyRe)) {
        toplam += 1
        expect(block, `${path} · ${table}.${name}: tenant kapsamı yok (T057 regresyon sınıfı)`)
          .toMatch(/tenant_id\s*=\s*public\.jwt_tenant_id\(\)/)
        expect(
          /auth\.uid\(\)/.test(block) || /is_admin_user\(\)/.test(block),
          `${path} · ${table}.${name}: ne sahiplik (auth.uid) ne admin şartı var`,
        ).toBe(true)
      }
    }

    expect(toplam, 'hiç policy bulunamadı — RLS ilk günden şart (cetvel Q3)').toBeGreaterThan(0)
  })

  /* ---- R4b: quote ADLI HER tabloda tenant kapsami (R4'un kapsam genislemesi) ---- */
  it('R4b: quote tablolarindaki politikalar tenant kapsami tasir; muaflar ADIYLA sayili', () => {
    // NICIN AYRI BIR MADDE: R4 yalniz venthub_quotes / venthub_quote_items'a bakiyor.
    // Ama kapsam icerige baglandiginda quote adli BASKA tablolar da gorunur oldu ve
    // ilkinde gercek bir bosluk cikti. Kapi bunu ya olcer ya gizler; gizlemesin.
    //
    // MUAF LISTE, "gecis modu" DEGIL: kusuru GORUNUR kilar. Onarim migration ister,
    // migration Recep kapisidir; o gelene kadar kusurun ADI burada yazili durur.
    // Grace mode kusuru gizler, bu liste ISIMLENDIRIR — fark budur.
    const TENANT_KAPSAMI_MUAFLARI: Record<string, string> = {
      quote_email_events_admin_read:
        'T068 bildirim defteri (20260817200000_quote_request_notification.sql). Politika yalniz ' +
        'user_profiles.role bakiyor, tenant_id sarti YOK -> bir tenant admini digerinin teklif ' +
        'e-posta defterini okuyabilir. ESKI GLOB BU DOSYAYI HIC GORMUYORDU. Onarim migration ' +
        'ister (Recep kapisi); indigi gun bu satir SILINECEK.',
    }

    const policyRe = /create\s+policy\s+([a-z_]+)\s+on\s+public\.([a-z_]*quote[a-z_]*)[\s\S]*?;/gi
    const bulunanlar: string[] = []
    const ihlaller: string[] = []

    for (const [path, sql] of Object.entries(QUOTE_MIGRATIONS)) {
      const clean = stripSqlComments(sql)
      for (const [block, name, table] of clean.matchAll(policyRe)) {
        bulunanlar.push(name)
        if (/tenant_id\s*=\s*(public\.)?jwt_tenant_id\(\)/.test(block)) continue
        if (name in TENANT_KAPSAMI_MUAFLARI) continue
        ihlaller.push(`${path} · ${table}.${name}`)
      }
    }

    expect(bulunanlar.length, 'quote tablolarinda hic politika bulunamadi — secim bozulmus olabilir')
      .toBeGreaterThan(0)
    expect(
      ihlaller,
      `Tenant kapsami olmayan politika (cok-kiracili sizinti sinifi, CLAUDE.md kural 12): ${ihlaller.join(', ')}`,
    ).toEqual([])
  })

  /* ---- R4b-kanarya: muafiyet BAYATLAYAMAZ ---- */
  it('R4b-kanarya: muaf edilen politika hala VAR ve hala ihlalci', () => {
    // Bayat muafiyet kendi kapisini kor eder: politika duzeltilse ya da silinse bile
    // liste orada kalir ve bir dahaki gercek ihlali sessizce yutar. O yuzden her
    // muafiyetin HALA GEREKLI oldugunu kanitlariz.
    const MUAF_ADLAR = ['quote_email_events_admin_read']
    const policyRe = /create\s+policy\s+([a-z_]+)\s+on\s+public\.([a-z_]*quote[a-z_]*)[\s\S]*?;/gi
    const hala: string[] = []

    for (const sql of Object.values(QUOTE_MIGRATIONS)) {
      const clean = stripSqlComments(sql)
      for (const [block, name] of clean.matchAll(policyRe)) {
        if (!MUAF_ADLAR.includes(name)) continue
        if (!/tenant_id\s*=\s*(public\.)?jwt_tenant_id\(\)/.test(block)) hala.push(name)
      }
    }

    expect(
      hala.sort(),
      'Muaf listedeki politika ya ONARILMIS ya SILINMIS — muafiyeti KALDIR (bayat muafiyet kapiyi kor eder)',
    ).toEqual([...MUAF_ADLAR].sort())
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
      // Okuma erişimi (`item.unit_price`) serbest — tipler `database.types.ts`'ten
      // (supabase:gen) gelir, quoteService bunları QuoteRow/QuoteItemRow olarak dışa verir.
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
