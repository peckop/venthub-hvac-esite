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
 * hiçbir test bunu görmedi: handler dalı yazılmış olsa bile tetik yoksa webhook hiç ateşlenmez;
 * tetik olsa bile handler dalı yoksa istek gelir ve sessizce düşer. İki uç AYRI AYRI doğru
 * olabilir, yanlış olan EŞLEŞMEdir — bu yüzden kapı çift yönlüdür.
 *
 * ── DÖRT DENETİM PASI, ALTI KANITLANMIŞ SESSİZ-YEŞİL ──
 *
 * Bu dosyanın ilk üç sürümü denetimden geçemedi. Aşağıdakilerin hepsi ÖLÇÜLDÜ (bozma yapıldı,
 * test yeşil kaldı); hiçbiri koda bakıp "doğru görünüyor" diyerek bulunamazdı.
 *
 *  1. Keşif-kapısı koşulu (`table === 'a' || table === 'b'`) handler dalı sanılıyordu → gerçek
 *     `product_prices` bloğu silinebiliyordu. Artık yalnız TEK KOŞULLU dal başı eşleşir.
 *  2. SQL düz `;` ile bölünüyordu → dollar-quote'lu bir fonksiyon gövdesinde METİN olarak geçen
 *     `create trigger` gerçek tetik sayılıyordu. Artık tek geçişli tarayıcı maskeliyor.
 *  3. Kurulum taraması dosyadaki metne bakıyordu → tetikleri ölü bir `legacySql` değişkenine
 *     taşımak yetiyordu. **Sonraki sürümde "hangi literal çalışıyor" sorusunu statik olarak
 *     cevaplamayı denedim; o da kaçak verdi** — çağrıyı `if (false)` dalına ya da yoruma almak
 *     kapıyı yeşil bırakıyordu. Erişilebilirlik analizi metin taramasıyla YAPILAMAZ. Çözüm
 *     soruyu ortadan kaldırmak oldu: SQL artık TEK KAYNAKTA, JS betikleri onu okuyor.
 *  4. İç içe blok yorumu (`/* … /* … *​/ … *​/`, PG el kitabı §4.1.5) — "bloğu yorum yaparak
 *     kapatma", en sık devre-dışı bırakma biçimi, görünmezdi. Artık derinlik sayacı var.
 *  5. Tarihsiz migration adı sıralamayı bozuyordu. Artık fail-closed bir iddia var.
 *  6. Sıralama modeli CI'ın GERÇEK sırası değildi (aşağıya bkz. `byteCompare`).
 *
 * Ayrıca `table === "x"` (çift tırnak) bir öksüz handler'ı kaçırıyordu; repoda `quotes` lint
 * kuralı ve Prettier yapılandırması yok, yani çift tırnak meşru bir yazım.
 *
 * DERS: statik tarayıcının yanlış-negatifi, kapının hiç olmamasından daha kötüdür — çünkü yeşil
 * ışık güven üretir. Ve tekrarlayan ders: bir kaçağı statik olarak "daha iyi tarayarak" kapatmaya
 * çalışmak çoğu zaman kusuru bir kabuk yukarı taşır; kalıcı çözüm sorunun kendisini kaldırmaktır.
 *
 * ── KAPSAM DIŞI (dürüstçe, kapatılmamış) ──
 *
 *  • "Vitrinde görünen tablo" kümesi KODDAN türetilmiyor; cetvelin §3 tablosundan okunuyor.
 *    Altıncı bir tablo vitrine çıkar ve cetvele de yazılmazsa bu kapı sessiz kalır.
 *  • Tetiğin PROD'da var olduğunu değil, repo SQL'inde tanımlı olduğunu doğrular. (Prod ayrıca
 *    elle ölçüldü — cetvel §3 "Prod doğrulaması" tablosu, 2026-08-15.)
 *  • Tetiğin OLAY kapsamı denetlenmiyor: `AFTER INSERT` (UPDATE/DELETE olmadan) geçer; ayrıca
 *    `on_product_prices_upd`'nin `WHEN` koşulunun kaybolması repo tarafında görünmez.
 *  • Zincirin ÇALIŞTIĞI denetlenmiyor, yalnız BAĞLI olduğu. `webhook_setup.sql`
 *    `REPLACE_WITH_ENV_SECRET` ile gelir; olduğu gibi koşulursa tetikler kurulur, her webhook
 *    401 alır ve kapı yine yeşildir.
 *  • Ada uymayan YENİ bir kurulum betiği (`install_webhooks.js` gibi) glob'a düşmez.
 */

const ROUTE_PATH = '/src/app/api/webhook/supabase/route.ts'
const STANDARD_PATH = '/docs/standards/rendering-cache-standard.md'
const SETUP_SQL_PATH = '/scripts/webhook_setup.sql'
const WEBHOOK_FN = 'handle_supabase_webhook'

/**
 * `create trigger` dilbilgisi TEK YERDE tanımlı. Denetim (beşinci pas) şunu ölçtü: bu dosyanın
 * iki ayrı tarayıcısı farklı SQL dilbilgisi varsayıyordu — biri `or replace` / `constraint`
 * varyantlarını karşılıyor, öbürü yalnız `create trigger` arıyordu. Sonuç: PG14+ sözdizimiyle
 * (`CREATE OR REPLACE TRIGGER`) yazılmış bir SQL kopyası kapıdan görünmeden geçiyordu.
 * Aynı kavramın iki tanımı = sessiz kaçak.
 */
const CREATE_TRIGGER_SRC = String.raw`create\s+(?:or\s+replace\s+)?(?:constraint\s+)?trigger`
const CREATE_TRIGGER_RE = new RegExp(CREATE_TRIGGER_SRC, 'i')
const CREATE_TRIGGER_HEAD_RE = new RegExp(
  `^${CREATE_TRIGGER_SRC}` + String.raw`\s+([\w."]+)[\s\S]*?\son\s+([\w."]+)`,
  'i',
)

/**
 * SQL kaynakları İKİ yerde yaşıyor ve bu tesadüf değil:
 *  - `supabase/baselines/*.sql` — anlık görüntüler. İlk üç webhook tetiği YALNIZ burada tanımlı;
 *    hiçbir migration dosyasında geçmiyorlar (repo'dan önce elle kurulmuşlar).
 *  - `supabase/migrations/*.sql` — sonradan eklenenler (`product_prices`, `product_families`).
 * Yalnız `migrations/`'a bakan bir tarayıcı ilk üç tabloyu "tetiksiz" sanıp YANLIŞ alarm verirdi.
 *
 * DİKKAT — baseline'lar tam şema dökümü DEĞİL: `2026-08-13_public_schema.sql` kendi başlığında
 * "trigger/RLS politikaları DAHİL DEĞİL" diyor ve içinde sıfır `create trigger` var. Bu yüzden
 * "en yeni baseline yaşayan durumu tanımlar" varsayımı yanlış olurdu.
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
 * `webhook_setup.sql` TEK KAYNAKTIR; iki `.js` betiği onu `readFileSync` ile okur.
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

/**
 * `scripts/**` altındaki TÜM çalıştırılabilir metin dosyaları. Amaç: "webhook tetiği kuran tek
 * dosya hangisidir" sorusunu TÜM depoda cevaplayabilmek.
 *
 * NİÇİN: önceki sürüm yalnız OLUMSUZ bir iddia kuruyordu — "şu iki .js dosyasında `create
 * trigger` metni yok". Denetim (beşinci pas) bunun üç ayrı kaçağını ölçtü: SQL'i başka bir
 * dosyaya taşımak (`scripts/webhook_trigger_sql.js`), betiğe BAŞKA bir .sql okutmak, ya da
 * kurulumu tamamen SİLMEK — üçünde de kapı yeşil kalıyordu ve betik yine "Setup Completed
 * Successfully" yazıyordu. Olumsuz iddia, "kurulum gerçekten yapılıyor"un ne gerek ne yeter
 * koşuludur. Aşağıdaki iki iddia bunu OLUMLU kurar: (a) tetik kuran dosya kümesi tam olarak
 * tek kaynak, (b) betikler o dosyaya bağlı.
 */
const allScriptSources = import.meta.glob('/scripts/**/*.{js,mjs,cjs,ts,json,txt,sql}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

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
 * SIRALAMA — CI'IN FİİLEN YAPTIĞINI taklit eder, idealize bir kronolojiyi DEĞİL.
 *
 * `.github/workflows/supabase-migrate.yml` migration'ları şöyle uygular:
 *     for f in $(ls -1 supabase/migrations/*.sql | sort); do
 * yani düz BAYT SIRASI (runner'da `LC_ALL` set edilmiyor). Depoda 8-haneli (`20250903_*`) ve
 * 14-haneli (`20250915152500_*`) adlar yan yana yaşıyor; aynı gün için bu iki biçim bayt
 * sırasında TERS dizilir (`'1'` 0x31 < `'_'` 0x5F).
 *
 * Önceki sürüm "ilk 8 hane gün + kalanı sıra" diye normalleştiriyordu ve denetim bunun
 * sessiz-yeşil ürettiğini ÖLÇTÜ: aynı push'ta gelen `20260815_zz_drop…` + `20260815120000_zz_recreate…`
 * ikilisinde test "önce drop, sonra create → tetik yaşıyor" diyordu, CI ise tersini uygular ve
 * prod'da tetik ÖLÜR. Kapının kendi varsayımı gerçekle çelişiyordu.
 *
 * Ders: bir kapı, doğru sandığı sırayı değil, ORTAMIN uyguladığı sırayı modellemelidir.
 *
 * AÇIK VARSAYIM (kapatılmadı): `byteCompare`, `sort`'un **C locale'de** koştuğu varsayımına
 * dayanır. Workflow `LC_ALL` set etmiyor; glibc `sort` bir UTF-8 locale'de noktalamayı atlayan
 * collation kullanır ve aynı-gün 8-hane/14-hane çiftini TERS dizer. Denetim iki senaryoda da
 * ölçtü: bu model `LC_ALL=C sort` ile BİREBİR, varsayılan locale ile ters. Kalıcı düzeltme
 * workflow'da `LC_ALL=C sort` yazmaktır — `.github/workflows/**` başka bir şeridin sahipliğinde
 * olduğu için panodan bildirildi (EDGE). O yapılana kadar doğruluk runner locale'ine bağlıdır.
 */
function byteCompare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function leadingDigits(filePath: string): string {
  const base = filePath.split('/').pop() ?? filePath
  return (base.match(/^[\d_-]+/)?.[0] ?? '').replace(/\D/g, '')
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
 * TEK GEÇİŞLİ TARAYICI — ard arda `replace()` çağırmak YETMEZ. İlk sürüm öyleydi ve kendi
 * kapısında yakalandı: dizge maskesi satır yorumlarından ÖNCE koşuyordu, dolayısıyla bir `--`
 * yorumunun içindeki Türkçe kesme işaretleri (`INSERT'te`) dizge sınırı sanılıyor ve maskeleme
 * oradan kayarak gerçek SQL'i yutuyordu. Ters sıra da çözmez: o zaman `raise notice 'a -- b'`
 * gibi bir dizgedeki `--` yorum sanılır. İki kural birbirine bağımlıdır — hangisinin içinde
 * olduğunu ancak metni baştan sona TEK KEZ, durum takip ederek yürüyerek bilebilirsin.
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
        if (sql.slice(i, i + 2) === '/*') {
          depth++
          i += 2
          continue
        }
        if (sql.slice(i, i + 2) === '*/') {
          depth--
          i += 2
          if (depth === 0) break
          continue
        }
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
          if (sql[i + 1] === "'") {
            i += 2 // SQL'de kaçış: '' = tek tırnak
            continue
          }
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

/** Bir SQL metnindeki, `handle_supabase_webhook()` çağıran `create trigger` ifadelerinin tabloları. */
function webhookTriggerStatements(sql: string): Array<{ table: string; trigger: string }> {
  const found: Array<{ table: string; trigger: string }> = []
  for (const stmt of normalizeSql(sql).split(';')) {
    const head = stmt.trimStart()
    // İfade `create trigger` ile BAŞLAMALI — bir fonksiyon gövdesinde/başka bir ifadenin ortasında
    // geçen `create trigger` metni gerçek tanım sayılmasın.
    const create = CREATE_TRIGGER_HEAD_RE.exec(head)
    if (!create) continue
    if (!head.toLowerCase().includes(WEBHOOK_FN)) continue
    found.push({ table: normalizeIdent(create[2]), trigger: normalizeIdent(create[1]) })
  }
  return found
}

/**
 * Webhook tetiklerinin YAŞAYAN durumu. `create`/`drop` etkileri CI'ın sırasıyla uygulanır.
 * Tek bir `create trigger` görmek yetmez — sonraki bir migration onu düşürmüş olabilir.
 *
 * Anahtar `tablo::tetik` — yalnız ada bakmak hatalıydı: bu repoda tetik adları tablolar arasında
 * tekrar ediyor (`*_set_updated_at` ailesi tek dosyada 6 kez), dolayısıyla başka bir tablodaki
 * aynı adlı tetiğin düşürülmesi izlenen tetiği yanlışlıkla siliyordu.
 */
function liveWebhookTriggers(): Set<string> {
  // Baseline'lar önce: CI onları HİÇ uygulamaz, başlangıç durumunu belgeleyen anlık görüntülerdir.
  // Migration'lar sonra ve CI'ın birebir sırasıyla (bayt).
  const files = [
    ...Object.entries(baselineSql).sort((a, b) => byteCompare(a[0], b[0])),
    ...Object.entries(migrationSql).sort((a, b) => byteCompare(a[0], b[0])),
  ]

  const live = new Set<string>()

  for (const [, rawSql] of files) {
    for (const stmt of normalizeSql(rawSql).split(';')) {
      const head = stmt.trimStart()

      const drop = /^drop\s+trigger\s+(?:if\s+exists\s+)?([\w."]+)\s+on\s+([\w."]+)/i.exec(head)
      if (drop) {
        live.delete(`${normalizeIdent(drop[2])}::${normalizeIdent(drop[1])}`)
        continue
      }

      const create = CREATE_TRIGGER_HEAD_RE.exec(head)
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
 * Handler'ın DAL BAŞLARI. Yalnız tek koşullu `if (table === 'x') {` eşleşir. Çok koşullu bir `if`
 * (ör. keşif kapısı `table === 'a' || table === 'b'`) bilerek DIŞARIDA bırakılır: o bir tazeleme
 * dalı değil, bir politika kapısıdır — dal sanılması ilk sürümdeki kanıtlanmış kaçağın sebebiydi.
 * Üç tırnak biçimi de kabul edilir; repoda `quotes` lint kuralı yok.
 */
function handlerBranches(routeSrc: string): Set<string> {
  const src = stripTsComments(routeSrc)
  const found = new Set<string>()
  for (const m of src.matchAll(/(?:\belse\s+)?\bif\s*\(\s*table\s*===\s*['"`](\w+)['"`]\s*\)\s*\{/g)) {
    found.add(m[1])
  }
  return found
}

/**
 * Cetvel §3 SÖZLEŞME tablosundaki tablo adları = SSOT. Elle tutulan bir kopya, dokümanla testin
 * ayrışmasına davetiyedir.
 *
 * Dilim ilk `### ` alt başlığında kesilir: §3 altında `### Prod doğrulaması` gibi başka
 * `| \`tablo\` |` tabloları da var. Onları da yutmak listeyi mükerrer girişlerle şişiriyor, hata
 * mesajlarını tekrar bastırıyor ve "en az 5 tablo okundu" korumasını GEVŞETİYOR — asıl sözleşme
 * tablosu tamamen silinse bile prod-doğrulama tablosu tek başına eşiği karşılardı.
 */
function requiredTablesFromStandard(md: string): string[] {
  const start = md.indexOf('## 3.')
  const end = md.indexOf('## 4.')
  // indexOf -1 dönerse slice sessizce keser: liste ya boşalır ya §4'ü yutar. İkisi de sessiz
  // bozulma; başlık bulunamadıysa boş dön, iddia gürültülü patlasın.
  if (start === -1 || end === -1 || end <= start) return []

  let section = md.slice(start, end)
  const subHeading = section.indexOf('\n### ')
  if (subHeading !== -1) section = section.slice(0, subHeading)

  return [...new Set([...section.matchAll(/^\|\s*`(\w+)`\s*\|/gm)].map((m) => m[1]))]
}

const REQUIRED_TABLES = requiredTablesFromStandard(standardSources[STANDARD_PATH] ?? '')

describe('INV-RENDER-2 · tazeleme sözleşmesi (tetik ⇄ handler)', () => {
  it('kaynaklar bulunabiliyor (stale-guard: glob boşa düşerse test sessizce yeşil kalmasın)', () => {
    expect(Object.keys(baselineSql).length, 'supabase/baselines/*.sql bulunamadı').toBeGreaterThan(0)
    expect(Object.keys(migrationSql).length, 'supabase/migrations/*.sql bulunamadı').toBeGreaterThan(0)
    expect(Object.keys(routeSources), `Webhook rotası ${ROUTE_PATH} bulunamadı`).toContain(ROUTE_PATH)
    expect(Object.keys(standardSources), `Cetvel ${STANDARD_PATH} bulunamadı`).toContain(STANDARD_PATH)
  })

  it('her SQL kaynağı tarihle başlıyor (sıralamanın ön koşulu)', () => {
    const undated = [...Object.keys(baselineSql), ...Object.keys(migrationSql)]
      .filter((p) => leadingDigits(p).length < 8)
      .sort()
    expect(
      undated,
      `TARİHSİZ SQL DOSYASI: [${undated.join(', ')}]\n\n` +
        'Migration adları Supabase adlandırma sözleşmesine uymalı (tarihle başlamalı): ' +
        '`supabase migration list` ve ledger bu dosyaları sıralayamaz, insan gözü de sırayı okuyamaz.\n\n' +
        'NOT (dürüstlük): bu bir SIRALAMA ARIZASI değil, adlandırma ihlalidir. Önceki sürüm ' +
        '"tarihsiz ad sıralamayı bozar" diyordu; o gerekçe kaldırılan `chronoKey` modeline aitti. ' +
        'Şimdiki model CI\'ın bayt sırasının aynısı olduğu için tarihsiz dosya da CI\'ın koyduğu ' +
        'yere oturur — denetimde iki uçta da ölçüldü.',
    ).toEqual([])
  })

  it('cetvel §3 tablosu okunabiliyor (SSOT boşa düşerse tüm iddialar anlamsızlaşır)', () => {
    expect(
      REQUIRED_TABLES.length,
      `${STANDARD_PATH} §3 SÖZLEŞME tablosundan tablo adı çıkarılamadı. Cetvelin biçimi ` +
        'değiştiyse requiredTablesFromStandard() da güncellenmeli — yoksa bu dosyadaki HER iddia ' +
        'boş kümeyi denetler ve vakumda yeşil kalır.',
    ).toBeGreaterThanOrEqual(5)
  })

  it('AYRIŞTIRICI SAĞLIĞI: handler sevk biçimi tanınıyor (ön koşul)', () => {
    // Bu bir ÖN KOŞULdur, bağımsız bir kural değil. Denetim (beşinci pas) şunu ölçtü: sevk
    // `switch/case`'e çevrildiğinde — ki iddia mesajının kendisi bunu "doğru bir refactor olabilir"
    // diye kabul ediyor — aşağıdaki iddialar da patlıyor ve GERÇEK DIŞI teşhis koyuyordu:
    // "ÖKSÜZ TETİK … ya handler dalını ekle YA TETİĞİ KALDIR". Hiçbir dal eksik, hiçbir tetik
    // öksüz değilken kapı geliştiriciye CANLI TETİKLERİ DÜŞÜRMESİNİ söylüyordu — bir kapının
    // verebileceği en kötü yanlış-kırmızı. Ayrıştırıcı körse önce BU iddia konuşsun.
    expect(
      handlerBranches(routeSources[ROUTE_PATH] ?? '').size,
      `${ROUTE_PATH} içinde "if (table === '<tablo>') {" biçiminde dal bulunamadı.\n\n` +
        'ÖNCE BUNU OKU: sevk mekanizması switch/case ya da tablo→işleyici sözlüğüne çevrildiyse bu ' +
        'DOĞRU bir refactor olabilir ve aşağıdaki "HANDLER DALI EKSİK" / "ÖKSÜZ TETİK" hataları ' +
        'YANLIŞ TEŞHİStir — hiçbir tetiği kaldırma. Yapılacak iş handlerBranches() ayrıştırıcısını ' +
        'yeni biçime uyarlamaktır.',
    ).toBeGreaterThanOrEqual(3)
  })

  it('cetveldeki her tablonun YAŞAYAN bir DB tetiği var', () => {
    const withTrigger = tablesWithLiveTrigger()
    const missing = REQUIRED_TABLES.filter((t) => !withTrigger.has(t))
    expect(
      missing,
      `TETİK EKSİK: [${missing.join(', ')}] tablosu vitrinde görünüyor ama ${WEBHOOK_FN}() çağıran ` +
        'yaşayan bir tetiği yok. Bu tam olarak 2026-08-15 hatasıdır: veri değişir, webhook HİÇ ' +
        'ateşlenmez, statik sayfa eski kalır ve hiçbir şey hata vermez.',
    ).toEqual([])
  })

  it('cetveldeki her tablonun bir handler dalı var', () => {
    const branches = handlerBranches(routeSources[ROUTE_PATH] ?? '')
    const missing = REQUIRED_TABLES.filter((t) => !branches.has(t))
    expect(
      missing,
      `HANDLER DALI EKSİK: [${missing.join(', ')}] için ${ROUTE_PATH} içinde dal yok. ` +
        'Tetik ateşlenir, istek gelir ve sessizce düşer — hiçbir sayfa tazelenmez.',
    ).toEqual([])
  })

  it('tetiği olan HER tablonun handler dalı da var (tetik → handler yönü)', () => {
    const branches = handlerBranches(routeSources[ROUTE_PATH] ?? '')
    const orphanTriggers = [...tablesWithLiveTrigger()].filter((t) => !branches.has(t)).sort()
    expect(
      orphanTriggers,
      `ÖKSÜZ TETİK: [${orphanTriggers.join(', ')}] tablosunda webhook tetiği var ama handler'da ` +
        'karşılığı yok. Her satır değişikliğinde boşuna HTTP isteği atılır ve hiçbir şey tazelenmez ' +
        '— maliyet var, etki yok. Ya handler dalını ekle ya tetiği kaldır.\n\n' +
        'ÖNCE: "AYRIŞTIRICI SAĞLIĞI" iddiası da kırmızıysa BU TEŞHİS YANLIŞTIR — sevk biçimi ' +
        'değişmiştir, tetikleri KALDIRMA; handlerBranches() ayrıştırıcısını güncelle.',
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
        `${WEBHOOK_FN}() çağıran tetik yok. Kod doğru görünür, gözden geçirme geçer, ürün ÇALIŞMAZ ` +
        '— çünkü webhook hiç ateşlenmez. 2026-08-15 hatasının tam imzası budur.',
    ).toEqual([])
  })

  it('KURULUM tek kaynağı cetveldeki TÜM tabloların tetiğini kuruyor', () => {
    expect(
      Object.keys(bootstrapSources),
      `Kurulum tek kaynağı ${SETUP_SQL_PATH} bulunamadı — taşındıysa bu glob da güncellenmeli.`,
    ).toContain(SETUP_SQL_PATH)

    const installed = new Set(
      webhookTriggerStatements(bootstrapSources[SETUP_SQL_PATH]).map((t) => t.table),
    )
    const missing = REQUIRED_TABLES.filter((t) => !installed.has(t))
    expect(
      missing,
      `KURULUM BETİĞİ EKSİK TABLO KURUYOR: [${missing.join(', ')}]\n\n` +
        'Bu betik sıfırdan bir ortamda webhook altyapısını kurar ve "Setup Completed Successfully" ' +
        'diyerek biter. Eksik tablo bırakırsa yeni ortam 2026-08-15 hatasıyla DOĞAR: veri değişir, ' +
        'sayfa değişmez, kimse fark etmez. Migration eklerken bu betik de güncellenmelidir.',
    ).toEqual([])
  })

  it('webhook tetiği kuran TEK dosya kurulum kaynağıdır (tüm scripts/** tarandı)', () => {
    const scanned = Object.keys(allScriptSources)
    expect(
      scanned.length,
      'scripts/** taraması boş döndü — glob bozulmuşsa bu iddia sessizce anlamsızlaşır.',
    ).toBeGreaterThan(5)

    const installers = scanned
      .filter((p) => CREATE_TRIGGER_RE.test(allScriptSources[p]))
      .filter((p) => allScriptSources[p].includes(WEBHOOK_FN))
      .sort()

    expect(
      installers,
      `WEBHOOK TETİĞİ KURAN DOSYA KÜMESİ BEKLENENDEN FARKLI:\n  bulunan: [${installers.join(', ')}]\n` +
        `  beklenen: [${SETUP_SQL_PATH}]\n\n` +
        "Kurulum SQL'i TEK KAYNAKTA olmalı. İkinci bir dosya tetik kuruyorsa iki kopya ayrışır ve " +
        '"hangisi güncel" sorusu geri gelir — bu repoda üç kopya varken üçü de eksik tablo kuruyordu. ' +
        'Kaynak taşındıysa SETUP_SQL_PATH da güncellenmeli.',
    ).toEqual([SETUP_SQL_PATH])
  })

  it('kurulum betikleri tek kaynağa BAĞLI (okuyor ve çalıştırıyor)', () => {
    const scripts = Object.keys(bootstrapSources).filter((p) => p.endsWith('.js')).sort()
    expect(scripts.length, 'Kurulum .js betiği bulunamadı — glob bozulmuş olabilir.').toBeGreaterThanOrEqual(2)

    const unbound = scripts.filter((p) => {
      const src = stripTsComments(bootstrapSources[p])
      const readsSource = src.includes('webhook_setup.sql') && /readFileSync/.test(src)
      const executes = /\.query\s*\(|execSync\s*\(|writeFileSync\s*\(/.test(src)
      return !(readsSource && executes)
    })

    expect(
      unbound,
      `KURULUM BETİĞİ TEK KAYNAĞA BAĞLI DEĞİL: [${unbound.join(', ')}]

` +
        'Betik "webhook_setup.sql" dosyasını readFileSync ile okumalı ve bir yürütme çağrısına ' +
        '(query / execSync / writeFileSync) beslemelidir. Denetimde ölçüldü: kurulum adımı tamamen ' +
        'silindiğinde ya da başka bir .sql dosyasına yönlendirildiğinde betik hiçbir şey kurmuyor ' +
        'ama yine "Setup Completed Successfully" yazıyordu — cetvelin "sahte başarı" dediği desen.\n\n' +
        'DÜRÜST SINIR: bu iddia BAĞLILIĞI kanıtlar, ERİŞİLEBİLİRLİĞİ değil. Çağrının gerçekten ' +
        'koşulan bir dalda olduğu statik olarak kanıtlanamaz (bu dosyanın tarihçesindeki en ' +
        'inatçı ders). Gerçekçi drift yollarını görünür kılar; kasıtlı bir sabotajı değil.',
    ).toEqual([])
  })
})
