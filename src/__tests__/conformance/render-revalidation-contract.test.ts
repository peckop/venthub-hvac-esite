import { describe, expect, it } from 'vitest'

/**
 * INV-RENDER-2 · Tazeleme sözleşmesi: TETİK ⇄ HANDLER eşleşmesi.
 *
 * KURAL (SSOT: docs/standards/rendering-cache-standard.md §3):
 * "Statik vitrin sayfasında görünen HER tablonun (a) DB tetiği ve (b) webhook handler dalı olmalıdır."
 *
 * NİÇİN VAR: 2026-08-15'te 1044 fiyat satırı prod'a yazıldı ve vitrin DEĞİŞMEDİ. Sebep tek tek
 * bakınca görünmüyordu — ürün sayfası statik üretiliyor, tazeleme webhook'a bağlı, webhook üç
 * tabloyu dinliyor ve `product_prices` o üçünde yoktu. Zincirin iki ucundan biri eksikti ve
 * **hiçbir test bunu görmedi**: handler dalı yazılmış olsa bile tetik yoksa webhook hiç ateşlenmez;
 * tetik olsa bile handler dalı yoksa istek gelir ve sessizce düşer. İki uç AYRI AYRI doğru olabilir,
 * yanlış olan EŞLEŞMEdir — bu yüzden kapı çift yönlüdür.
 *
 * ── Bu dosyanın ilk sürümü DENETİMDEN GEÇEMEDİ; iki kanıtlanmış sessiz-yeşil vardı ──
 *
 *  (1) `handledTables()` `table === 'x'` metnini dosyanın HER yerinde arıyordu. `route.ts` içindeki
 *      keşif-kapısı koşulu (`if (table === 'inventory_movements' || table === 'product_prices')`)
 *      bir handler dalı DEĞİL — ama tarayıcı onu dal sanıyordu. Sonuç: `product_prices`'ın GERÇEK
 *      handler bloğu tamamen silinebiliyor ve test yeşil kalıyordu. Yani kapı, var oluş sebebi olan
 *      hatanın tam imzasını kaçırıyordu. → Artık yalnız **dal başı** eşleşir (tek koşullu
 *      `if (table === 'x') {`), koşul içindeki geçişler değil.
 *
 *  (2) SQL düz `;` ile bölünüyordu. PostgreSQL'de gövdeler dollar-quote'ludur (`$$ … $$`) ve
 *      noktalı virgül içerirler; üstelik hiç çağrılmayan bir fonksiyonun gövdesinde METİN olarak
 *      geçen `create trigger … handle_supabase_webhook()` gerçek tetik sayılıyordu. Denetçi bunu
 *      gerçek tetiği düşürüp metni fonksiyon gövdesine koyarak kanıtladı: test yeşil kaldı.
 *      → Artık dollar-quote blokları ve dizgeler MASKELENİR, ifade `create trigger` ile BAŞLAMALIDIR.
 *
 * ── ÜÇÜNCÜ denetim pası, İKİNCİ sürümde ÜÇ kaçak daha buldu ──
 *
 *  (3) **Ölü SQL dizgesi.** Kurulum iddiası dosyadaki METNE bakıyordu. Fiyat tetiklerini
 *      çalıştırılan şablondan alıp kullanılmayan bir `legacySql` değişkenine taşımak yetiyordu:
 *      betik 4 tabloya tetik kuruyor, yine "Setup Completed Successfully" yazıyor, kapı yeşil.
 *      Bu, (2)'nin birebir JavaScript boyutuydu. → `executedSql()` artık yalnız bir yürütme
 *      çağrısına BESLENEN şablon literallerini tarar.
 *
 *  (4) **İç içe blok yorumu.** PostgreSQL `/* … /* … *​/ … *​/` iç içe yorumu kabul eder (PG el
 *      kitabı §4.1.5, C'den farklı). Tarayıcı ilk kapanışta duruyordu, dolayısıyla "bir bloğu
 *      yorum yaparak kapatma" — en sık devre-dışı bırakma biçimi — görünmez kalıyordu.
 *      → Derinlik sayacı.
 *
 *  (5) **Tarihsiz migration adı.** `hotfix_drop_products_webhook.sql` gibi rakamla başlamayan bir
 *      ad `chronoKey`'de en başa düşüyor; içindeki `drop trigger` henüz var olmayan bir tetiği
 *      düşürmeye çalışıp hiçbir şeye denk gelmiyordu. Denetçi ölçtü: aynı içerik tarihsiz adla
 *      SESSİZ YEŞİL, `20260816_` önekiyle kırmızı. → Ayrı bir fail-closed iddia.
 *
 *  Ayrıca: `table === "x"` (çift tırnak) bir öksüz handler'ı kaçırıyordu — repoda `quotes` lint
 *  kuralı ve Prettier yapılandırması yok, yani çift tırnak meşru bir yazım.
 *
 * Ders (kaydedilmeye değer): statik tarayıcının yanlış-negatifi, kapının hiç olmamasından daha
 * kötüdür — çünkü yeşil ışık güven üretir. Üç denetim pası, üç ayrı sürümde toplam beş sessiz-yeşil
 * çıkardı; hiçbiri koda bakarak "doğru görünüyor" demekle bulunamazdı. Bu yüzden aşağıdaki her
 * iddia bilerek bozularak kanıtlanmıştır.
 *
 * ── KAPSAM DIŞI (dürüstçe, kapatılmamış) ──
 *
 *  • **Tetiğin OLAY kapsamı denetlenmiyor.** `AFTER INSERT ON public.products` (UPDATE/DELETE
 *    olmadan) bu kapıdan geçer; `on_product_prices_upd`'nin `WHEN` koşulunun kaybolması da repo
 *    tarafında görünmez. Cetvelin §3 tablosundaki tetik ADLARI da doğrulanmıyor.
 *  • **Aynı-gün sıralaması** ad-sırası ile tam örtüşmüyor (197 migration'ın 7'si yer değiştiriyor);
 *    bugün hiçbiri webhook tetiğine dokunmadığı için etkisiz.
 *  • **Zincirin çalıştığı** denetlenmiyor, yalnız bağlı olduğu. `scripts/webhook_setup.sql`
 *    `REPLACE_WITH_ENV_SECRET` ile gelir; olduğu gibi koşulursa tetikler kurulur, her webhook 401
 *    alır ve kapı yine yeşildir.
 *
 *  • "Vitrinde görünen tablo" kümesi KODDAN türetilmiyor; cetvelin §3 tablosundan okunuyor.
 *    Altıncı bir tablo vitrine çıkar ve cetvele de yazılmazsa bu kapı sessiz kalır. Gerçek çözüm
 *    `generateStaticParams()` içeren rotalardan servis zinciri boyunca `.from('x')` çağrılarını
 *    türetmektir; ayrı ve daha büyük bir iş.
 *  • Tetiğin PROD'da gerçekten var olduğunu değil, repo SQL'inde tanımlı olduğunu doğrular.
 *    İlk üç tetiğin (`on_products_change`, `on_categories_change`, `on_inventory_movements_change`)
 *    repoda HİÇBİR migration karşılığı yok — yalnız `supabase/baselines/2026-06-12_public_schema.sql`
 *    anlık görüntüsünde tanımlılar. Bunları idempotent bir migration'la repoya yazmak açık kalemdir
 *    (migration = prod'a otomatik uygulanır → kullanıcı onayı gerekir, CLAUDE.md kural 13).
 *  • Handler dalının DOĞRU yolu tazelediğini denetlemez — yalnız dalın VAR olduğunu.
 */

const ROUTE_PATH = '/src/app/api/webhook/supabase/route.ts'
const STANDARD_PATH = '/docs/standards/rendering-cache-standard.md'
const WEBHOOK_FN = 'handle_supabase_webhook'

/**
 * SQL kaynakları İKİ yerde yaşıyor ve bu tesadüf değil:
 *  - `supabase/baselines/*.sql` — anlık görüntüler. İlk üç webhook tetiği YALNIZ burada tanımlı.
 *  - `supabase/migrations/*.sql` — sonradan eklenenler (`product_prices`, `product_families`).
 * Yalnız `migrations/`'a bakan bir tarayıcı ilk üç tabloyu "tetiksiz" sanıp YANLIŞ alarm verirdi.
 *
 * DİKKAT — baseline'lar tam şema dökümü DEĞİL: `2026-08-13_public_schema.sql` kendi başlığında
 * "trigger/RLS politikaları DAHİL DEĞİL" diyor ve içinde sıfır `create trigger` var. Bu yüzden
 * "en yeni baseline yaşayan durumu tanımlar" varsayımı YANLIŞ olurdu; tüm kaynaklar tek bir
 * KRONOLOJİK defter gibi işlenir.
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

/**
 * KURULUM (bootstrap) kaynakları — sıfırdan bir ortamda webhook altyapısını kuran betikler.
 *
 * NİÇİN AYRI BİR KÜME: bunlar migration DEĞİL, kronolojik deftere ait değiller; her biri tek
 * başına "tam kurulum" iddiasındadır. Denetim (2026-08-15) şunu ölçtü: üçü de yalnız İLK ÜÇ
 * tetiği kuruyordu. Yani cetvel doğru, migration doğru, test yeşil — ama depo, 08-15 hatasını
 * yeni bir ortamda **birebir yeniden kuran bir düğme** taşıyordu ve hiçbir kapı oraya bakmıyordu.
 * Üstelik `setup_webhooks.js` sonunda "Setup Completed Successfully" yazıyordu: sahte başarı.
 */
const bootstrapSources = {
  ...(import.meta.glob('/scripts/webhook_setup*.sql', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>),
  ...(import.meta.glob('/scripts/setup_webhook*.js', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>),
}

const routeSources = import.meta.glob('/src/app/api/webhook/supabase/route.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const standardSources = import.meta.glob('/docs/standards/rendering-cache-standard.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/**
 * Dosya adından kronolojik anahtar. Adlandırma tek biçimli değil:
 * `2026-06-12_public_schema.sql` · `20260815_x.sql` · `202508260945_y.sql`
 * Baştaki rakamlar çıkarılır, ilk 8 hane gün, kalanı sıra numarası olarak kullanılır.
 * Grup grup (önce baseline'lar, sonra migration'lar) işlemek yanlıştır: gerçek bir pg_dump
 * baseline'ı eklendiğinde ondan ÖNCEKİ migration'ların `drop`ları baseline'dan SONRA uygulanır.
 */
function leadingDigits(filePath: string): string {
  const base = filePath.split('/').pop() ?? filePath
  return (base.match(/^[\d_-]+/)?.[0] ?? '').replace(/\D/g, '')
}

function chronoKey(filePath: string): string {
  const d = leadingDigits(filePath)
  return `${d.slice(0, 8).padEnd(8, '0')}${d.slice(8).padEnd(6, '0')}|${filePath.split('/').pop()}`
}

/** `"public"."products"` · `public.products` · `products` → `products` */
function normalizeIdent(raw: string): string {
  const bare = raw.replace(/"/g, '')
  return bare.slice(bare.lastIndexOf('.') + 1)
}

/**
 * SQL'i ayrıştırılabilir hale getir: yorumlar, dizgeler ve dollar-quote gövdeleri maskelenir,
 * geriye yalnız yapısal metin kalır.
 *
 * TEK GEÇİŞLİ TARAYICI — ard arda `replace()` ÇAĞIRMAK YETMEZ. İlk sürüm öyleydi ve kendi
 * kapısında yakalandı: dizge maskesi satır yorumlarından ÖNCE koşuyordu, dolayısıyla bir `--`
 * yorumunun içindeki Türkçe kesme işaretleri (`INSERT'te`, `DELETE'te`) dizge sınırı sanılıyor ve
 * maskeleme oradan kayarak gerçek SQL'i yutuyordu. Ters sıra da çözmez: o zaman `raise notice
 * 'a -- b'` gibi bir dizgedeki `--` yorum sanılır. İki kural birbirine bağımlıdır — hangisinin
 * içinde olduğunu ancak metni baştan sona TEK KEZ, durum takip ederek yürüyerek bilebilirsin.
 */
function normalizeSql(sql: string): string {
  let out = ''
  let i = 0
  while (i < sql.length) {
    const two = sql.slice(i, i + 2)

    if (two === '--') {
      while (i < sql.length && sql[i] !== '\n') i++
      out += ' '
      continue
    }

    // PostgreSQL blok yorumları İÇ İÇE GEÇEBİLİR (PG el kitabı §4.1.5 — C'den farklı olarak).
    // İlk `*/`'de durmak, "bir bloğu yorum yaparak devre dışı bırakma" gibi EN SIK devre-dışı
    // bırakma biçimini görünmez kılıyordu: dıştaki yorumun gövdesindeki CREATE TRIGGER'lar canlı
    // sayılıyor, betik hiç tetik kurmadığı hâlde kapı yeşil yanıyordu. Derinlik sayacı şart.
    if (two === '/*') {
      let depth = 0
      while (i < sql.length) {
        if (sql.slice(i, i + 2) === '/*') { depth++; i += 2; continue }
        if (sql.slice(i, i + 2) === '*/') { depth--; i += 2; if (depth === 0) break; continue }
        i++
      }
      out += ' '
      continue
    }

    const dollar = /^\$([A-Za-z_]\w*)?\$/.exec(sql.slice(i, i + 32))
    if (dollar) {
      const tag = dollar[0]
      const end = sql.indexOf(tag, i + tag.length)
      i = end === -1 ? sql.length : end + tag.length
      out += ' BODY '
      continue
    }

    if (sql[i] === "'") {
      i++
      while (i < sql.length) {
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") { i += 2; continue } // SQL'de kaçış: '' = tek tırnak
          i++
          break
        }
        i++
      }
      out += "''"
      continue
    }

    out += sql[i]
    i++
  }
  return out
}

/** TS/JS yorumlarını ele (INV-WEBHOOK-1 bir kez kendi JSDoc örneğine takıldı). */
function stripTsComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

/**
 * Webhook tetiklerinin YAŞAYAN durumu. Dosyalar kronolojik işlenir; `create`/`drop` etkileri
 * sırayla uygulanır. Tek bir `create trigger` görmek yetmez — sonraki bir migration onu düşürmüş
 * olabilir ve o durumda tablo fiilen tetiksizdir.
 *
 * Anahtar `tablo::tetik` — yalnız ada bakmak hatalıydı: bu repoda tetik adları tablolar arasında
 * tekrar ediyor (`*_set_updated_at` ailesi tek dosyada 6 kez), dolayısıyla başka bir tablodaki
 * aynı adlı tetiğin düşürülmesi izlenen tetiği yanlışlıkla siliyordu.
 */
function liveWebhookTriggers(): Set<string> {
  const files = [...Object.entries(baselineSql), ...Object.entries(migrationSql)].sort(
    (a, b) => chronoKey(a[0]).localeCompare(chronoKey(b[0])),
  )

  const live = new Set<string>() // "tablo::tetik"

  for (const [, rawSql] of files) {
    for (const stmt of normalizeSql(rawSql).split(';')) {
      const head = stmt.trimStart()

      const drop = /^drop\s+trigger\s+(?:if\s+exists\s+)?([\w."]+)\s+on\s+([\w."]+)/i.exec(head)
      if (drop) {
        live.delete(`${normalizeIdent(drop[2])}::${normalizeIdent(drop[1])}`)
        continue
      }

      // İfade `create trigger` ile BAŞLAMALI — fonksiyon gövdesinde metin olarak geçen
      // `create trigger` (maskeleme sonrası artakalan) gerçek tanım sayılmasın.
      const create = /^create\s+(?:or\s+replace\s+)?(?:constraint\s+)?trigger\s+([\w."]+)[\s\S]*?\son\s+([\w."]+)/i.exec(head)
      if (!create) continue
      if (!head.toLowerCase().includes(WEBHOOK_FN)) continue
      live.add(`${normalizeIdent(create[2])}::${normalizeIdent(create[1])}`)
    }
  }

  return live
}

function tablesWithLiveTrigger(): Set<string> {
  return new Set([...liveWebhookTriggers()].map((k) => k.split('::')[0]))
}

/**
 * Handler'ın DAL BAŞLARI. Yalnız tek koşullu `if (table === 'x') {` / `else if (table === 'x') {`
 * eşleşir. Çok koşullu bir `if` (ör. keşif kapısı `table === 'a' || table === 'b'`) bilerek
 * DIŞARIDA bırakılır: o bir tazeleme dalı değil, bir politika kapısıdır — dal sanılması bu testin
 * ilk sürümündeki kanıtlanmış yanlış-negatifin sebebiydi.
 */
function handlerBranches(routeSrc: string): Set<string> {
  const src = stripTsComments(routeSrc)
  const found = new Set<string>()
  // Üç tırnak biçimi de kabul edilir: repoda `quotes` lint kuralı ve Prettier yapılandırması YOK,
  // yani `table === "x"` tamamen meşru bir yazım. Yalnız tek tırnağı eşleyen sürüm, çift tırnakla
  // yazılmış bir öksüz handler'ı sessizce kaçırıyordu.
  for (const m of src.matchAll(/(?:\belse\s+)?\bif\s*\(\s*table\s*===\s*['"`](\w+)['"`]\s*\)\s*\{/g)) {
    found.add(m[1])
  }
  return found
}

/**
 * Cetvel §3 tablosundaki tablo adları = SSOT. Elle tutulan bir kopya, dokümanla testin
 * ayrışmasına davetiyedir; liste tek yerden okunur.
 */
function requiredTablesFromStandard(md: string): string[] {
  const start = md.indexOf('## 3.')
  const end = md.indexOf('## 4.')
  // indexOf -1 dönerse slice sessizce dosyanın sonundan/başından keser ve liste ya boşalır ya
  // §4'ü de yutar. İkisi de sessiz bozulma; başlık bulunamadıysa boş dön, iddia gürültülü patlasın.
  if (start === -1 || end === -1 || end <= start) return []
  return [...md.slice(start, end).matchAll(/^\|\s*`(\w+)`\s*\|/gm)].map((m) => m[1])
}

/**
 * Bir kurulum betiğinin GERÇEKTEN ÇALIŞTIRDIĞI SQL.
 *
 * NİÇİN: denetim (2026-08-15, üçüncü pas) şunu kanıtladı — `product_prices` tetiklerini
 * çalıştırılan şablondan çıkarıp kullanılmayan bir `legacySql` değişkenine taşımak yetiyordu;
 * betik 4 tabloya tetik kuruyor, sonunda yine "Setup Completed Successfully" yazıyor ve kapı
 * YEŞİL kalıyordu. Bu, SQL tarafında kapatılan "gövdede metin olarak geçen create trigger"
 * kusurunun birebir JavaScript boyutudur: dosyada METİN olması ≠ çalıştırılıyor olması.
 *
 * Bu yüzden `.js` betiklerinde tüm dosya değil, yalnız bir yürütme çağrısına (`client.query(...)`,
 * `writeFileSync(..., x)`) BESLENEN şablon literalleri taranır. `.sql` dosyalarında dosyanın
 * tamamı zaten yürütülür.
 */
function executedSql(path: string, src: string): string {
  if (path.endsWith('.sql')) return src

  const chunks: string[] = []
  for (const m of src.matchAll(/const\s+(\w+)\s*=\s*`([\s\S]*?)`/g)) {
    const [, name, body] = m
    const isExecuted = new RegExp(`(?:\\.query|writeFileSync|execSync)\\s*\\([^)]*\\b${name}\\b`).test(src)
    if (isExecuted) chunks.push(body)
  }
  return chunks.join('\n;\n')
}

const REQUIRED_TABLES = requiredTablesFromStandard(standardSources[STANDARD_PATH] ?? '')

describe('INV-RENDER-2 · tazeleme sözleşmesi (tetik ⇄ handler)', () => {
  it('kaynaklar bulunabiliyor (stale-guard: glob boşa düşerse test sessizce yeşil kalmasın)', () => {
    expect(Object.keys(baselineSql).length, 'supabase/baselines/*.sql bulunamadı').toBeGreaterThan(0)
    expect(Object.keys(migrationSql).length, 'supabase/migrations/*.sql bulunamadı').toBeGreaterThan(0)
    expect(Object.keys(routeSources), `Webhook rotası ${ROUTE_PATH} bulunamadı`).toContain(ROUTE_PATH)
    expect(Object.keys(standardSources), `Cetvel ${STANDARD_PATH} bulunamadı`).toContain(STANDARD_PATH)
  })

  it('her SQL kaynağı tarihle başlıyor (kronolojik defterin ön koşulu)', () => {
    const undated = [...Object.keys(baselineSql), ...Object.keys(migrationSql)]
      .filter((p) => leadingDigits(p).length < 8)
      .sort()
    expect(
      undated,
      `TARİHSİZ SQL DOSYASI: [${undated.join(', ')}]\n\n` +
        'Yaşayan tetik durumu, dosya adındaki tarihe göre KRONOLOJİK hesaplanır. Adı rakamla ' +
        'başlamayan bir dosya en başa sıralanır — yani içindeki "drop trigger" henüz var olmayan ' +
        'bir tetiği düşürmeye çalışır ve HİÇBİR ŞEYE denk gelmez. Denetimde ölçüldü: aynı içerik ' +
        '"hotfix_drop_products_webhook.sql" adıyla SESSİZ YEŞİL, "20260816_..." adıyla kırmızı. ' +
        'Prod\'da tetik ölür, vitrin donar, kapı görmez. (Supabase CLI de bu dosyaları sıralayamaz.)',
    ).toEqual([])
  })

  it('cetvel §3 tablosu okunabiliyor (SSOT boşa düşerse tüm iddialar anlamsızlaşır)', () => {
    expect(
      REQUIRED_TABLES.length,
      `${STANDARD_PATH} §3 tablosundan tablo adı çıkarılamadı. Cetvelin biçimi değiştiyse ` +
        'requiredTablesFromStandard() da güncellenmeli — yoksa bu dosyadaki HER iddia boş kümeyi ' +
        'denetler ve sessizce yeşil kalır.',
    ).toBeGreaterThanOrEqual(5)
  })

  it('handler sevk şekli beklenen biçimde (refactor olursa SESSİZ değil GÜRÜLTÜLÜ kırılsın)', () => {
    expect(
      handlerBranches(routeSources[ROUTE_PATH] ?? '').size,
      `${ROUTE_PATH} içinde "if (table === '<tablo>') {" biçiminde dal bulunamadı. Sevk mekanizması ` +
        'switch/case ya da tablo→işleyici sözlüğüne çevrildiyse bu doğru bir refactor olabilir; ama ' +
        'o zaman handlerBranches() ayrıştırıcısı da güncellenmelidir. Bu iddia, ayrıştırıcı körleşince ' +
        'testin sessizce yeşil kalmasını engellemek için var.',
    ).toBeGreaterThanOrEqual(3)
  })

  it('cetveldeki her tablonun YAŞAYAN bir DB tetiği var', () => {
    const withTrigger = tablesWithLiveTrigger()
    const missing = REQUIRED_TABLES.filter((t) => !withTrigger.has(t))
    expect(
      missing,
      `TETİK EKSİK: [${missing.join(', ')}] tablosu vitrinde görünüyor ama ${WEBHOOK_FN}() çağıran ` +
        'yaşayan bir tetiği yok. Bu tam olarak 2026-08-15 hatasıdır: veri değişir, webhook HİÇ ateşlenmez, ' +
        'statik sayfa eski kalır ve hiçbir şey hata vermez. Çözüm: supabase/migrations/ altına ' +
        '"create trigger ... execute function public.handle_supabase_webhook();" ekle.',
    ).toEqual([])
  })

  it('cetveldeki her tablonun bir handler dalı var', () => {
    const branches = handlerBranches(routeSources[ROUTE_PATH] ?? '')
    const missing = REQUIRED_TABLES.filter((t) => !branches.has(t))
    expect(
      missing,
      `HANDLER DALI EKSİK: [${missing.join(', ')}] için ${ROUTE_PATH} içinde "if (table === '<tablo>') {" ` +
        'dalı yok. Tetik ateşlenir, istek gelir ve sessizce düşer — hiçbir sayfa tazelenmez.',
    ).toEqual([])
  })

  it('tetiği olan HER tablonun handler dalı da var (tetik → handler yönü)', () => {
    const branches = handlerBranches(routeSources[ROUTE_PATH] ?? '')
    const orphanTriggers = [...tablesWithLiveTrigger()].filter((t) => !branches.has(t)).sort()
    expect(
      orphanTriggers,
      `ÖKSÜZ TETİK: [${orphanTriggers.join(', ')}] tablosunda webhook tetiği var ama handler'da karşılığı yok. ` +
        'Her satır değişikliğinde boşuna HTTP isteği atılır ve hiçbir şey tazelenmez — maliyet var, etki yok. ' +
        'Ya handler dalını ekle ya tetiği kaldır.',
    ).toEqual([])
  })

  it('KURULUM betikleri cetveldeki TÜM tabloların tetiğini kuruyor', () => {
    const paths = Object.keys(bootstrapSources).sort()
    expect(
      paths.length,
      'Kurulum betiği bulunamadı (beklenen desen: scripts/webhook_setup*.sql, scripts/setup_webhook*.js). ' +
        'Yeniden adlandırıldılarsa bu glob da güncellenmeli — yoksa iddia sessizce boşa düşer. ' +
        'Glob desen tabanlı: yeni bir kurulum betiği eklendiğinde kendiliğinden kapsama girer.',
    ).toBeGreaterThanOrEqual(3)

    const gaps: string[] = []
    for (const p of paths) {
      const runnable = executedSql(p, bootstrapSources[p])
      expect(
        runnable.trim().length,
        `${p} içinde ÇALIŞTIRILAN SQL bulunamadı. Betik SQL'ini bir yürütme çağrısına ` +
          '(client.query / writeFileSync / execSync) beslenen bir şablon literalinde tutmalı; ' +
          'aksi hâlde bu iddia neyin gerçekten koşduğunu bilemez ve sessizce boşa düşer.',
      ).toBeGreaterThan(0)

      const installed = new Set(
        [...normalizeSql(runnable).split(';')]
          .map((s) => s.trimStart())
          .filter((s) => /^create\s+(?:or\s+replace\s+)?(?:constraint\s+)?trigger\b/i.test(s))
          .filter((s) => s.toLowerCase().includes(WEBHOOK_FN))
          .map((s) => /\son\s+([\w."]+)/i.exec(s)?.[1])
          .filter((t): t is string => Boolean(t))
          .map(normalizeIdent),
      )
      const missing = REQUIRED_TABLES.filter((t) => !installed.has(t))
      if (missing.length) gaps.push(`${p} → eksik: [${missing.join(', ')}]`)
    }

    expect(
      gaps,
      'KURULUM BETİĞİ EKSİK TABLO KURUYOR:\n' + gaps.join('\n') + '\n\n' +
        'Bu betikler sıfırdan bir ortamda "kurulum tamam" diyerek biter. Eksik tablo bırakırlarsa ' +
        'yeni ortam 2026-08-15 hatasıyla DOĞAR: veri değişir, sayfa değişmez, kimse fark etmez. ' +
        'Migration eklerken kurulum betikleri de güncellenmelidir — ikisi ayrı kaynaktır.',
    ).toEqual([])
  })

  it('handler dalı olan HER tablonun tetiği de var (handler → tetik yönü)', () => {
    const withTrigger = tablesWithLiveTrigger()
    const orphanHandlers = [...handlerBranches(routeSources[ROUTE_PATH] ?? '')]
      .filter((t) => !withTrigger.has(t))
      .sort()
    expect(
      orphanHandlers,
      `ÖKSÜZ HANDLER: [${orphanHandlers.join(', ')}] için handler dalı yazılmış ama o tabloda ` +
        `${WEBHOOK_FN}() çağıran tetik yok. Kod doğru görünür, gözden geçirme geçer, ürün ÇALIŞMAZ — ` +
        'çünkü webhook hiç ateşlenmez. 2026-08-15 hatasının tam imzası budur.',
    ).toEqual([])
  })
})
