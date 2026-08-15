import { describe, expect, it } from 'vitest'

/**
 * INV · edge-function güvenlik conformance (kalıcı bekçi · ratchet).
 *
 * 2026-08-14 denetimi: 26 edge fonksiyonunda **4 canlı kimlik-doğrulamasız açık**
 * (anonim çağrı service_role verisi döndürüyordu) + **2 yatay yetki açığı** bulundu.
 * Bunların HİÇBİRİNİ mevcut kapılar göremedi:
 *   • tsc — edge dosyaları proje tsconfig'inde değil,
 *   • lint — sözdizimi temiz (ölü import bile `_`-prefix codemod'undan sonra "kullanılıyor" görünür),
 *   • `deno check` — TİP hatası yakalar, DAVRANIŞ hatası (auth eksikliği) yakalamaz,
 *   • build/Vercel — supabase/ dizinini derlemez,
 *   • runtime smoke — mutlu-yol test eder, yetkisiz-yol denemez.
 * Yalnız bu invariant yakalar.
 *
 * AMAÇ: geriye dönük her şeyi temizlemek DEĞİL. Mevcut ihlaller `KNOWN_VIOLATIONS`'ta
 * ADLA sabitlenir (ratchet baseline); GELECEK kilitlenir. Baseline'daki bir ad artık
 * ihlal etmiyorsa test FAIL eder ("listeden SİL") — böylece liste çöplüğe dönmez ve
 * ratchet her düzeltmede SIKIŞIR.
 *
 * Zorlanan 11 kural için gerekçeler tek tek aşağıdaki describe bloklarının başındadır.
 * Cetvel: docs/standards/edge-function-security-standard.md
 *
 * Test kuralı ↔ cetvel maddesi eşlemesi (R-numarası ile E-numarası AYNI DEĞİLDİR):
 *   R1→E1 · R2→E3 · R3→E4 · R4→E5 · R5→E6 · R6→E2 ·
 *   R7→E7 (config kapsamı) · R8→E9 (admin rol kontrolü) · R9→E10 (webhook fail-closed) ·
 *   R10→E11 (çağıran sınıfı beyanı) · R11→E12 (tenant_id önceliği)
 * (E8 kod değil hat kuralıdır — `scripts/edge/select-functions.mjs` ile karşılanır.)
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

/* ------------------------------------------------------------------ *
 * Kaynaklar — glob kökü TAM LİTERAL olmalı (Vite statik analiz eder).
 * ------------------------------------------------------------------ */

const EDGE_TS: Record<string, string> = import.meta.glob('/supabase/functions/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const CONFIG_TOML: Record<string, string> = import.meta.glob('/supabase/config.toml', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const PER_FUNCTION_TOML: Record<string, string> = import.meta.glob(
  '/supabase/functions/*/supabase.toml',
  { query: '?raw', import: 'default', eager: true },
)

/* ------------------------------------------------------------------ *
 * RATCHET BASELINE
 * Buraya bir ad EKLEMEK = borç kabul etmek. Bir ihlali DÜZELTTİĞİNDE adı
 * buradan SİL (silmezsen stale-guard testi FAIL eder).
 * ------------------------------------------------------------------ */
const KNOWN_VIOLATIONS = {
  // R1 — 2026-08-14'te 16 fonksiyonda düzeltildi; baseline BOŞ (sıfır tolerans).
  R1: [] as string[],

  // R2 — codemod'un bıraktığı 9 ölü import 2026-08-14'te onarıldı; baseline BOŞ.
  R2: [] as string[],

  // R3 — apply-coupon kendi `buildCors()`'unu yazıyor (ALLOWED_ORIGINS mantığı
  // _shared/cors.ts'te ZATEN var; iki uygulama = iki farklı davranış riski).
  R3: ['supabase/functions/apply-coupon/index.ts'],

  // R4 — 6 yanıltıcı per-fonksiyon toml 2026-08-14'te silindi; baseline BOŞ.
  R4: [] as string[],

  // R5 — gövdesinde statik olarak görülebilir kimlik/imza kontrolü OLMAYAN,
  // `verify_jwt = false` ile açık duran uçlar. İkisi de BORÇ, "kabul edilmiş tasarım" değil:
  //  • iyzico-callback — kimliği yalnız iyzico'nun `token`'ı taşıyor; token yokken orderId
  //    ile DB'den geri-doldurulabiliyor (imza/HMAC doğrulaması YOK).
  //  • shipping-status — takip numarasıyla sipariş durumu döndürür; tek koruma IP rate-limit.
  R5: ['iyzico-callback', 'shipping-status'],

  // R6 — _shared/tenant_config.ts JWT payload'ını İMZASIZ çözüp `tenant_id` seçiyor.
  // Sahte JWT ile tenant sınırı aşılabilir (data bleeding). ÇÖZÜM: tenant_id'yi
  // doğrulanmış `getUser()` sonucunun app_metadata'sından al.
  R6: ['supabase/functions/_shared/tenant_config.ts:29'],

  // R7 (E7) — `supabase/config.toml`'da [functions."<ad>"] BLOĞU OLMAYAN fonksiyonlar.
  // Blok yokken değer örtük `true` olur; bu güvenli TARAF ama BİLİNÇLİ karar değildir:
  // çağıran sınıfı (a/b/c/d) hiçbir yerde yazılı olmadığı için bir sonraki düzenleyen
  // "storefront'tan auth'suz çağrılıyor" diyerek sessizce `false` ekleyebilir (§3.7 · §3.1).
  // 2026-08-15 ölçümü: 26 fonksiyondan 13'ünde blok var, 13'ünde YOK. Her satır = BORÇ.
  // Gerekçe notları gövdedeki KANIT durumunu söyler, blok yokluğunu meşrulaştırmaz.
  R7: [
    'admin-create-coupon', // gövdede getUser+rol var; blok yazılıp sınıf (a) olarak sabitlenmeli
    'admin-update-shipping', // gövdede getUser+rol var; sınıf (a) — §3.2 canlı açığı buradaydı
    'apply-coupon', // gövdede kimlik sinyali YOK; sınıf belirsiz — blokla birlikte denetlenmeli
    'delivery-notification', // gövdede service-key (Bearer) karşılaştırması var; sınıf (b) adayı
    'healthz', // gövdede kimlik yok (uptime probe); sınıf yazılmadan (d)/public sayılamaz
    'iyzico-payment', // gövdede kimlik sinyali YOK; ödeme başlatan uç — sınıf yazılmalı
    'iyzico-refund', // gövdede getUser var (admin ya da sipariş sahibi); sınıf (a) adayı
    'log-client-error', // gövdede getUser var; tarayıcıdan çağrılıyor — sınıf (a) adayı
    'notification-service', // gövdede getUser var; sınıf (a)/(b) ayrımı yazılı değil
    'order-housekeeping', // gövdede getUser var; per-fonksiyon toml'u `false` diyordu (silindi)
    'order-validate', // gövdede getUser var; checkout doğrulaması — sınıf (a) adayı
    'release-expired-reservations', // service-key (Bearer) karşılaştırması var; sınıf (b)/(d) adayı
    'stock-alert', // service-key karşılaştırması + getUser var; 2026-08-14 anonim açığı buradaydı
  ],

  // R8 (E9) — admin-* uçlarında 'admin'/'superadmin' rol kontrolü YOK.
  // 2026-08-14'te `admin-orders-latest` + `admin-update-shipping` tam bu yüzden yatay
  // yetki açığıydı; ikisi de düzeltildi. Baseline BOŞ = sıfır tolerans.
  R8: [] as string[],

  // R9 (E10) — *webhook* uçlarında HMAC imza doğrulaması VE/VEYA zorunlu timestamp guard'ı
  // eksik. `shipping-webhook`'un "başlık varsa kontrol et" fail-OPEN guard'ı T025-VH'de
  // (2026-08-15) zorunlu hâle getirildi; `returns-webhook` zaten zorunluydu. Baseline BOŞ.
  R9: [] as string[],

  // R10 (E11) — dosya başında çağıran sınıfı (a/b/c/d) beyanı OLMAYAN fonksiyonlar.
  // Cetvel §2: "Fonksiyonun dosya başında, Deno.serve'den önce hangi sınıfa ait olduğu
  // yorumla yazılır." Bugün 26/26 fonksiyonda beyan YOK — bu, §3.1–§3.5'in hangi kuralının
  // hangi uca uygulanacağının hiçbir yerde yazılı olmaması demektir (26 fonksiyon,
  // 26 ayrı güvenlik duruşunun kök sebebi). Beyan biçimi: `// Çağıran sınıfı: (a) ...`
  // Tek tek düzeltilecek borç; YENİ fonksiyon beyansız eklenemez.
  R10: [
    'supabase/functions/admin-create-coupon/index.ts',
    'supabase/functions/admin-iyzico-reconcile/index.ts',
    'supabase/functions/admin-order-inspect/index.ts',
    'supabase/functions/admin-orders-latest/index.ts',
    'supabase/functions/admin-update-order/index.ts',
    'supabase/functions/admin-update-shipping/index.ts',
    'supabase/functions/apply-coupon/index.ts',
    'supabase/functions/delivery-notification/index.ts',
    'supabase/functions/healthz/index.ts',
    'supabase/functions/iyzico-callback/index.ts',
    'supabase/functions/iyzico-payment/index.ts',
    'supabase/functions/iyzico-refund/index.ts',
    'supabase/functions/log-client-error/index.ts',
    'supabase/functions/notification-service/index.ts',
    'supabase/functions/order-confirmation/index.ts',
    'supabase/functions/order-housekeeping/index.ts',
    'supabase/functions/order-validate/index.ts',
    'supabase/functions/refund-order-mock/index.ts',
    'supabase/functions/release-expired-reservations/index.ts',
    'supabase/functions/return-status-notification/index.ts',
    'supabase/functions/returns-webhook/index.ts',
    'supabase/functions/shipping-notification/index.ts',
    'supabase/functions/shipping-status/index.ts',
    'supabase/functions/shipping-webhook/index.ts',
    'supabase/functions/stock-alert/index.ts',
    'supabase/functions/tcmb-rates-sync/index.ts',
  ],

  // R11 (E12) — `?tenant_id=` query parametresi DOĞRULANMIŞ kimlikten (getUser) ÖNCE
  // okunuyor → istekten gelen değer JWT'yi EZİYOR (cetvel §3.9, açık borç).
  // Tek tenant canlıyken etkisi sınırlı; Faz 2 açılır açılmaz doğrudan data-bleeding.
  // ÇÖZÜM (§3.9): resolveTenantId async olup tenant_id'yi auth.getUser(jwt) sonucunun
  // app_metadata'sından okumalı; query/gövde yalnız sınıf (c)/(d) uçlarında, imza
  // kontrolünden SONRA kabul edilmeli. R6 (atob) ile birlikte düzeltilir.
  R11: ['supabase/functions/_shared/tenant_config.ts:20'],
} as const

/** R5 muafiyeti — çağıran Authorization header'ı GÖNDEREMEZ. Ada göre, kapsam değil. */
const R5_EXEMPT: Record<string, string> = {
  // pg_cron `net.http_post` ile auth header'sız çağırır; uç dışarıya veri döndürmez,
  // TCMB kurlarını yazar. Muafiyet ADLA verilir ki yeni uçlara sessizce sızmasın.
  'tcmb-rates-sync': 'pg_cron auth header gönderemez (yalnız yazan, veri döndürmeyen uç)',
}

/* ------------------------------------------------------------------ *
 * Yardımcılar
 * ------------------------------------------------------------------ */

/** Glob anahtarını repo-göreli yola indirger: '/supabase/...' → 'supabase/...' */
const rel = (key: string): string => key.replace(/^\//, '')

/** '/supabase/functions/<ad>/index.ts' → '<ad>' */
const fnNameOf = (key: string): string => {
  const m = key.match(/\/supabase\/functions\/([^/]+)\//)
  return m ? m[1] : ''
}

/**
 * Yorum satırlarını siler; string/template içeriğine DOKUNMAZ (URL'lerdeki `https://`
 * yanlış-pozitif olurdu) ve satır numaralarını KORUR.
 * Gerekçe: `refund-order-mock/index.ts` içinde `// Auth check using auth.getUser()`
 * yorumu var — naif grep bunu R1 ihlali sanardı.
 */
function stripComments(src: string): string {
  let out = ''
  let mode: 'code' | 'line' | 'block' | 'sq' | 'dq' | 'tpl' = 'code'
  for (let i = 0; i < src.length; ) {
    const c = src[i]
    const d = src[i + 1]
    if (mode === 'code') {
      if (c === '/' && d === '/') {
        mode = 'line'
        i += 2
        continue
      }
      if (c === '/' && d === '*') {
        mode = 'block'
        i += 2
        continue
      }
      if (c === "'") mode = 'sq'
      else if (c === '"') mode = 'dq'
      else if (c === '`') mode = 'tpl'
      out += c
      i++
      continue
    }
    if (mode === 'line') {
      if (c === '\n') {
        mode = 'code'
        out += c
      }
      i++
      continue
    }
    if (mode === 'block') {
      if (c === '*' && d === '/') {
        mode = 'code'
        i += 2
      } else {
        if (c === '\n') out += c // satır numarası hizası korunur
        i++
      }
      continue
    }
    // string modları
    if (c === '\\') {
      out += c
      if (i + 1 < src.length) out += src[i + 1]
      i += 2
      continue
    }
    if (
      (mode === 'sq' && c === "'") ||
      (mode === 'dq' && c === '"') ||
      (mode === 'tpl' && c === '`')
    ) {
      mode = 'code'
    }
    out += c
    i++
  }
  return out
}

/** İlk eşleşmenin 1-tabanlı satır numarası (yoksa 0). */
function lineOf(src: string, re: RegExp): number {
  const m = src.match(re)
  if (!m || m.index === undefined) return 0
  return src.slice(0, m.index).split('\n').length
}

/**
 * Kaynak havuzu: fonksiyon .ts dosyaları (companion .md ve testler hariç).
 * `code` = yorumları ayıklanmış hâl (R1–R6, R8–R9, R11 için — yorumdaki metin ihlal değildir).
 * `raw`  = ham dosya (R10 için ŞART: çağıran sınıfı beyanı zaten bir YORUMDUR).
 */
const SOURCES: { key: string; path: string; fn: string; code: string; raw: string }[] =
  Object.entries(EDGE_TS)
    .filter(([k]) => !k.includes('.test.') && !k.includes('__tests__'))
    .map(([k, v]) => ({ key: k, path: rel(k), fn: fnNameOf(k), code: stripComments(v), raw: v }))

const INDEX_SOURCES = SOURCES.filter((s) => s.key.endsWith('/index.ts'))

/** supabase/config.toml'dan `verify_jwt = false` olan fonksiyon adlarını çıkarır. */
function parseVerifyJwtFalse(toml: string): string[] {
  const out: string[] = []
  let current: string | null = null
  for (const raw of toml.split('\n')) {
    const line = raw.trim()
    const header = line.match(/^\[functions\."?([^"\].]+)"?\]/)
    if (header) {
      current = header[1]
      continue
    }
    if (line.startsWith('[')) {
      current = null
      continue
    }
    const kv = line.match(/^verify_jwt\s*=\s*(true|false)\b/)
    if (kv && current && kv[1] === 'false') out.push(current)
  }
  return out
}

/** supabase/config.toml içindeki TÜM `[functions."<ad>"]` blok adlarını çıkarır. */
function parseFunctionBlocks(toml: string): string[] {
  const out: string[] = []
  for (const raw of toml.split('\n')) {
    const m = raw.trim().match(/^\[functions\."?([^"\].]+)"?\]/)
    if (m) out.push(m[1])
  }
  return out
}

/** İlk eşleşen SATIRIN 1-tabanlı numarası (yoksa 0). `re` global OLMAMALI. */
function firstLineMatching(src: string, re: RegExp): number {
  const lines = src.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) return i + 1
  }
  return 0
}

/**
 * ÇAĞIRAN SINIFI BEYANI — kanonik biçim (cetvel §2 · E11):
 *     // Çağıran sınıfı: (a) oturumlu admin tarayıcısı — getUser(jwt) + rol kapısı
 * Kabul: satır yorumu, "Çağıran sınıfı:" etiketi, parantez içinde tek harf a|b|c|d.
 * Dar tutulur (serbest metinde geçen "sınıf (a)" ifadesi yanlış-pozitif üretmesin).
 */
const CALLER_CLASS_RE = /^\s*\/\/\s*Çağıran sınıfı:\s*\(\s*[abcd]\s*\)/
/** `Deno.serve(` veya `serve(` — import satırındaki `{ serve }` eşleşmez. */
const SERVE_RE = /(?:^|[^.\w])(?:Deno\s*\.\s*)?serve\s*\(/
/** Beyanın bulunabileceği en son satır (dosya başı). */
const CALLER_CLASS_HEADER_LINES = 15

/**
 * DOĞRULANMAMIŞ tenant kaynağı (E12): query string `?tenant_id=` ya da istek gövdesi.
 * İkisi de saldırgan tarafından serbestçe yazılır — JWT'den ÖNCE okunurlarsa JWT'yi ezerler.
 */
const UNTRUSTED_TENANT_RE =
  /searchParams\s*\.\s*get\s*\(\s*['"]tenant_?[iI]d['"]\s*\)|\b(?:parsedBody|body|payload|input|req)\s*\??\s*\.\s*tenant_?[iI]d\b/
/** DOĞRULANMIŞ kimlik: imzayı Supabase'e doğrulatan tek çağrı. */
const VERIFIED_IDENTITY_RE = /\.auth\s*\.\s*getUser\s*\(/

/**
 * Webhook fail-closed dedektörü (§3.5 · E10). Eksik olan kapıların ADINI döndürür.
 * KRİTİK AYRIM: "başlık VARSA kontrol et" (`if (tsHeader) {...}`) fail-OPEN'dır —
 * başlığı hiç göndermeyen çağıran için guard çalışmaz. Zorunluluk ancak
 * `if (!tsHeader) return ... 401` biçiminde REDDEDEN bir dalla kanıtlanır.
 * Dedektörün bu ikisini ayırt ettiği R9 içinde ayrıca test edilir.
 */
function webhookGaps(code: string): string[] {
  const gaps: string[] = []

  const hasHmacPrimitive = /crypto\s*\.\s*subtle/.test(code) || /\bhmacValid\s*\(/.test(code)
  const readsSignature = /headers\s*\.\s*get\s*\(\s*['"][^'"]*signature[^'"]*['"]\s*\)/i.test(code)
  if (!hasHmacPrimitive || !readsSignature) gaps.push('HMAC-imza')

  const tsVar = code.match(
    /(?:const|let)\s+(\w+)\s*=\s*\w+\s*\.\s*headers\s*\.\s*get\s*\(\s*['"][^'"]*(?:timestamp|event-time)[^'"]*['"]/i,
  )?.[1]
  const rejectsMissing = tsVar
    ? new RegExp(`if\\s*\\(\\s*!\\s*${tsVar}\\b[^)]*\\)[\\s\\S]{0,200}?\\b401\\b`).test(code)
    : false
  const hasStaleWindow = /Math\s*\.\s*abs\s*\(\s*Date\s*\.\s*now\s*\(\s*\)/.test(code)
  if (!tsVar || !rejectsMissing || !hasStaleWindow) gaps.push('zorunlu-timestamp')

  return gaps
}

/**
 * Ratchet + stale-guard tek yerde. `found` = ŞU ANKİ ihlal kimlikleri.
 * - baseline'da OLMAYAN yeni ihlal → FAIL (kural mesajı ile)
 * - baseline'da olup artık ihlal ETMEYEN ad → FAIL (listeden sil)
 */
function assertRatchet(rule: keyof typeof KNOWN_VIOLATIONS, found: string[], fixHint: string): void {
  const baseline = KNOWN_VIOLATIONS[rule] as readonly string[]
  const isNew = found.filter((f) => !baseline.includes(f)).sort()
  const stale = baseline.filter((b) => !found.includes(b)).sort()

  expect(
    isNew,
    `${rule} · YENİ İHLAL — ratchet kırıldı.\n${fixHint}\nİhlal eden:\n  ${isNew.join('\n  ')}\n` +
      `(Bilinçli borç kabul ediyorsan KNOWN_VIOLATIONS.${rule}'e gerekçesiyle ekle — ama önce DÜZELT.)`,
  ).toEqual([])

  expect(
    stale,
    `${rule} · BAYAT BASELINE — bu ad(lar) artık ihlal ETMİYOR, KNOWN_VIOLATIONS.${rule}'den SİL:\n  ` +
      stale.join('\n  ') +
      `\n(Ratchet ancak düzeltilen borç listeden çıkarılırsa sıkışır; çıkarmazsan regresyon sessizce geri döner.)`,
  ).toEqual([])
}

/* ------------------------------------------------------------------ *
 * Bayat-bekçi (vacuous-pass koruması)
 * ------------------------------------------------------------------ */

describe('edge-security · tarama sağlık kontrolü', () => {
  it('edge kaynakları gerçekten yükleniyor', () => {
    expect(SOURCES.length).toBeGreaterThan(20)
    expect(INDEX_SOURCES.length).toBeGreaterThan(20)
  })

  it('supabase/config.toml yükleniyor ve verify_jwt=false uçları çözülüyor', () => {
    expect(Object.keys(CONFIG_TOML).length).toBe(1)
    const open = parseVerifyJwtFalse(Object.values(CONFIG_TOML)[0])
    // Bilinen harici-webhook uçları; parser bayatlarsa burası düşer.
    expect(open).toContain('returns-webhook')
    expect(open).toContain('iyzico-callback')
    expect(open.length).toBeGreaterThanOrEqual(5)
    // `verify_jwt = true` satırları YANLIŞLIKLA toplanmamalı (2026-08-14'te dördü true'ya alındı).
    expect(open).not.toContain('admin-order-inspect')
  })

  it('yorum-ayıklayıcı doğru çalışıyor (R1 yanlış-pozitif koruması)', () => {
    const src = [
      `// Auth check using auth.getUser()`,
      `const url = 'https://esm.sh/x' // yorum`,
      `/* blok auth.getUser() */`,
      `await c.auth.getUser()`,
    ].join('\n')
    const out = stripComments(src)
    expect(out.split('\n').length).toBe(4) // satır hizası korunuyor
    expect(out).toContain(`'https://esm.sh/x'`) // string içi `//` KORUNDU
    expect(out.match(/\.auth\.getUser\(\s*\)/g)?.length).toBe(1) // yalnız GERÇEK çağrı
  })

  it('config.toml blok adları çözülüyor (R7 parser koruması)', () => {
    const blocks = parseFunctionBlocks(Object.values(CONFIG_TOML)[0])
    expect(blocks.length).toBeGreaterThanOrEqual(10)
    expect(blocks).toContain('iyzico-callback')
    expect(blocks).toContain('tcmb-rates-sync')
    // `[functions]` başlığının kendisi bir fonksiyon adı DEĞİLDİR.
    expect(blocks).not.toContain('functions')
  })

  it('çağıran-sınıfı beyan dedektörü dar (R10 yanlış-pozitif/negatif koruması)', () => {
    expect(CALLER_CLASS_RE.test('// Çağıran sınıfı: (c) harici kargo webhook — HMAC')).toBe(true)
    expect(CALLER_CLASS_RE.test('  //  Çağıran sınıfı:(a)')).toBe(true)
    // Serbest metinde geçen benzer ifadeler beyan SAYILMAZ:
    expect(CALLER_CLASS_RE.test('// bu uç sınıf (a) gibi davranıyor')).toBe(false)
    expect(CALLER_CLASS_RE.test("const s = 'Çağıran sınıfı: (a)'")).toBe(false)
    expect(CALLER_CLASS_RE.test('// Çağıran sınıfı: (e) yok böyle bir sınıf')).toBe(false)
  })

  it('serve dedektörü import satırını çağrı sanmıyor (R10 hizası)', () => {
    expect(SERVE_RE.test('import { serve } from "https://deno.land/std/http/server.ts"')).toBe(
      false,
    )
    expect(SERVE_RE.test('Deno.serve(async (req: Request) => {')).toBe(true)
    expect(SERVE_RE.test('serve(async (req) => {')).toBe(true)
  })

  it('E12 dedektörü hedefini gerçekten buluyor (R11 bayat-tarama koruması)', () => {
    const hits = SOURCES.filter((s) => UNTRUSTED_TENANT_RE.test(s.code)).map((s) => s.path)
    // Tarama bir gün hiçbir şey bulmazsa R11 SESSİZCE yeşile döner — bu kontrol onu engeller.
    expect(hits.length).toBeGreaterThan(0)
  })
})

/* ------------------------------------------------------------------ *
 * R1 — argümansız auth.getUser()
 * ------------------------------------------------------------------ */

describe('R1 · auth.getUser() argümansız çağrılamaz', () => {
  /**
   * supabase-js v2'de argümansız `getUser()` ÖNCE oturum deposuna (localStorage/
   * cookie) bakar. Edge runtime'da oturum deposu YOKTUR → "Auth session missing"
   * → geçerli admin token'ı gönderilse bile 401. 2026-08-14'te 16 fonksiyonda vardı.
   * DOĞRUSU: JWT'yi AÇIKÇA geçir.
   */
  it('hiçbir edge fonksiyonu argümansız getUser() çağırmıyor', () => {
    const found: string[] = []
    for (const s of SOURCES) {
      const re = /\.auth\s*\.\s*getUser\s*\(\s*\)/
      if (re.test(s.code)) found.push(`${s.path}:${lineOf(s.code, re)}`)
    }
    assertRatchet(
      'R1',
      found,
      "NEDEN: argümansız getUser() edge runtime'da oturum deposu arar, bulamaz → geçerli " +
        'token ile bile "Auth session missing"/401 (fonksiyon herkese kapanır, sessizce). ' +
        "ÇÖZÜM: JWT'yi açıkça geçir → getUser(authHeader.replace(/^Bearer\\s+/i, '')).",
    )
  })
})

/* ------------------------------------------------------------------ *
 * R2 — ölü getCorsHeaders import'u
 * ------------------------------------------------------------------ */

describe('R2 · getCorsHeaders import edilip çağrılmadan bırakılamaz', () => {
  /**
   * 2026-08-14: bir codemod 9 fonksiyonda import'u BIRAKIP çağrıyı sildi.
   * Sonuç: yanıtta ACAO başlığı yok → tarayıcıdan çağrılan fonksiyon tamamen kırık,
   * üstelik "import var, demek ki CORS var" diye okunuyor. lint bunu yakalamadı.
   */
  it('getCorsHeaders import eden her dosya onu çağırıyor', () => {
    const found: string[] = []
    for (const s of SOURCES) {
      const imported = /import\s*\{[^}]*\bgetCorsHeaders\b[^}]*\}/.test(s.code)
      const called = /\bgetCorsHeaders\s*\(/.test(s.code)
      if (imported && !called) found.push(s.path)
    }
    assertRatchet(
      'R2',
      found,
      'NEDEN: ölü import = Access-Control-Allow-Origin başlığı ÜRETİLMİYOR → tarayıcı isteği ' +
        'CORS ile bloklanır (fonksiyon "deploy edilmiş ve sağlıklı" görünür, çağrı asla ulaşmaz). ' +
        "ÇÖZÜM: yanıt başlıklarına `...getCorsHeaders(req)` ekle (ve OPTIONS preflight'ı döndür), " +
        "gerçekten gereksizse import'u sil.",
    )
  })
})

/* ------------------------------------------------------------------ *
 * R3 — elle yazılmış CORS
 * ------------------------------------------------------------------ */

describe('R3 · elle yazılmış CORS objesi yasak (SSOT: _shared/cors.ts)', () => {
  /**
   * CORS politikası (izinli origin listesi, preflight, allow-headers) TEK yerde
   * yaşamalı. Kopyalar sessizce ayrışır: biri `*` döner, biri ALLOWED_ORIGINS boşken
   * herkese açar, biri yeni bir header'ı bilmez.
   * DETEKTÖR: 'Access-Control-Allow-Headers' yazan ama getCorsHeaders() ÇAĞIRMAYAN dosya.
   * (_shared/cors.ts SSOT'un kendisidir — muaf.)
   */
  it('_shared/cors.ts dışında elle CORS başlığı kuran dosya yok', () => {
    const found: string[] = []
    for (const s of SOURCES) {
      if (s.path === 'supabase/functions/_shared/cors.ts') continue
      const handRolled = /Access-Control-Allow-Headers/.test(s.code)
      const usesSsot = /\bgetCorsHeaders\s*\(/.test(s.code)
      if (handRolled && !usesSsot) found.push(s.path)
    }
    assertRatchet(
      'R3',
      found,
      "NEDEN: CORS kopyaları ayrışır — allowlist'i tek yerde güncellersin, kopya eski " +
        'davranışta kalır (ya herkese açık ya tamamen kırık). ' +
        'ÇÖZÜM: `import { getCorsHeaders } from "../_shared/cors.ts"` ve elle kurulan objeyi sil.',
    )
  })
})

/* ------------------------------------------------------------------ *
 * R4 — per-fonksiyon supabase.toml
 * ------------------------------------------------------------------ */

describe('R4 · per-fonksiyon supabase.toml oluşturulamaz', () => {
  /**
   * Supabase CLI `supabase/functions/<ad>/supabase.toml` dosyalarını OKUMAZ — no-op.
   * Ama insanı yanıltır: 2026-08-14'te 6 tane vardı; biri `verify_jwt = false` diyordu
   * (prod TRUE'ydu), bir diğerinde "storefront'tan auth'suz çağrılıyor" yorumu YANLIŞTI.
   * Denetim sırasında yanlış dosyaya bakmak = açığı "yok" sanmak.
   * TEK KAYNAK: supabase/config.toml
   */
  it('hiçbir fonksiyon dizininde supabase.toml yok', () => {
    const found = Object.keys(PER_FUNCTION_TOML).map(rel).sort()
    assertRatchet(
      'R4',
      found,
      'NEDEN: CLI bu dosyaları okumaz (no-op) ama denetçiyi yanıltır — prod ayarıyla çelişen, ' +
        '"resmî görünümlü" bir yalan kaynak. ' +
        'ÇÖZÜM: dosyayı SİL, ayarı supabase/config.toml içindeki [functions."<ad>"] bloğuna taşı.',
    )
  })
})

/* ------------------------------------------------------------------ *
 * R5 — verify_jwt=false ⇒ gövdede kimlik/imza kontrolü ŞART
 * ------------------------------------------------------------------ */

/**
 * Gövdede kimlik/imza kontrolü sinyalleri.
 * DİKKAT: `Bearer ${...}` tek başına YETMEZ — o çoğunlukla PostgREST'e GİDEN bir
 * başlıktır (iyzico-callback'te 12 kez geçer, hiçbiri kimlik kontrolü değil).
 * Yalnız GELEN header ile KARŞILAŞTIRMA (`=== \`Bearer ...\``) sayılır.
 */
const IDENTITY_SIGNALS: { name: string; re: RegExp }[] = [
  { name: 'auth.getUser(<jwt>)', re: /\.auth\s*\.\s*getUser\s*\(\s*[^)\s]/ },
  { name: 'hmacValid()', re: /\bhmacValid\b/ },
  { name: 'crypto.subtle', re: /crypto\s*\.\s*subtle/ },
  { name: 'x-webhook-secret', re: /x-webhook-secret/i },
  { name: 'service-key karşılaştırması', re: /[!=]==\s*`Bearer\s/ },
]

describe('R5 · verify_jwt=false olan her fonksiyon gövdesinde kimlik doğrulamalı', () => {
  /**
   * EN DEĞERLİ KURAL. `verify_jwt = false` geçidi KAPATIR: istek gövdeye auth'suz
   * ulaşır. Gövde de kontrol etmiyorsa uç ANONİME AÇIKTIR. `admin-order-inspect`
   * tam bu yüzden service_role ile sipariş döndürüyordu (2026-08-14, prod'da CANLI).
   * Bu kural o kombinasyonu imkânsız kılar.
   */
  it('gövdesinde hiçbir kimlik/imza sinyali olmayan açık uç yok', () => {
    const open = parseVerifyJwtFalse(Object.values(CONFIG_TOML)[0])
    const found: string[] = []

    for (const fn of open) {
      if (fn in R5_EXEMPT) continue
      const src = INDEX_SOURCES.find((s) => s.fn === fn)
      if (!src) {
        // config.toml'da tanımlı ama kodu yok → ayrı bir tutarsızlık; yine de raporla.
        found.push(fn)
        continue
      }
      if (!IDENTITY_SIGNALS.some((sig) => sig.re.test(src.code))) found.push(fn)
    }

    assertRatchet(
      'R5',
      found.sort(),
      'NEDEN: verify_jwt=false geçidi kapatır — istek platform kontrolü OLMADAN gövdeye ulaşır. ' +
        "Gövde de doğrulamıyorsa uç ANONİME AÇIKTIR (admin-order-inspect prod'da tam böyle sızdırdı). " +
        'ÇÖZÜM (biri yeterli): auth.getUser(jwt) + rol kontrolü · HMAC imza doğrulaması ' +
        '(crypto.subtle/hmacValid) · x-webhook-secret karşılaştırması · gelen Authorization === ' +
        '`Bearer ${SERVICE_KEY}`. Çağıran JWT gönderebiliyorsa daha iyisi: config.toml\'da ' +
        "verify_jwt = true yap. Gerçekten auth gönderemeyen bir çağıran varsa (pg_cron) " +
        "R5_EXEMPT'e ADLA ve gerekçesiyle ekle.",
    )
  })

  it('R5 muafiyetleri gerçekten verify_jwt=false uçlar (bayat muafiyet koruması)', () => {
    const open = parseVerifyJwtFalse(Object.values(CONFIG_TOML)[0])
    const staleExempt = Object.keys(R5_EXEMPT).filter((fn) => !open.includes(fn))
    expect(
      staleExempt,
      "Bu ad(lar) artık verify_jwt=false DEĞİL — R5_EXEMPT'ten sil, muafiyet listesi " +
        'gerçeği yansıtmalı:\n  ' +
        staleExempt.join('\n  '),
    ).toEqual([])
  })
})

/* ------------------------------------------------------------------ *
 * R6 — atob() ile imzasız JWT çözümü
 * ------------------------------------------------------------------ */

describe('R6 · atob() ile JWT çözüp yetki/kapsam kararı verilemez', () => {
  /**
   * `atob(token.split('.')[1])` JWT payload'ını İMZAYI DOĞRULAMADAN okur — yani
   * saldırganın yazdığı JSON'a güvenmek demektir.
   * 2026-08-14: `refund-order-mock` bununla `sub` okuyup admin kararı veriyordu →
   * elle uydurulmuş bir JWT ile iade tetiklenebiliyordu.
   * DOĞRUSU: `supabase.auth.getUser(jwt)` — imzayı Supabase doğrular; rol/tenant
   * bilgisini dönen user'ın `app_metadata`'sından oku.
   */
  it('hiçbir edge kaynağında atob( yok', () => {
    const found: string[] = []
    for (const s of SOURCES) {
      const re = /\batob\s*\(/
      if (re.test(s.code)) found.push(`${s.path}:${lineOf(s.code, re)}`)
    }
    assertRatchet(
      'R6',
      found,
      "NEDEN: atob() JWT'yi İMZASIZ çözer — payload saldırgan tarafından serbestçe uydurulabilir; " +
        'ondan okunan sub/role/tenant_id ile verilen HER yetki kararı sahtelenebilir ' +
        '(tenant_id için = tenant sınırı aşımı / data bleeding). ' +
        'ÇÖZÜM: supabase.auth.getUser(jwt) ile imzayı doğrulat, kararı dönen user.app_metadata ' +
        'üzerinden ver.',
    )
  })
})

/* ------------------------------------------------------------------ *
 * R7 (E7) — config.toml kapsamı: her fonksiyonun bloğu OLMALI
 * ------------------------------------------------------------------ */

describe('R7 · her edge fonksiyonunun config.toml bloğu var', () => {
  /**
   * Blok yokken Supabase CLI değeri örtük `true` alır — güvenli TARAF, ama SESSİZ:
   * o ucun çağıran sınıfı (a/b/c/d) hiçbir yerde yazılı DEĞİLDİR (§3.7: "her blok tek
   * satırlık gerekçe yorumu taşır"). Yazılı olmayan karar savunulamaz: 2026-08-14'te
   * dört ucun `false` değeri tam da "gerekçesi konuşulmamış" olduğu için yıllarca durdu.
   * Blok zorunlu olduğunda `verify_jwt` + gerekçe tek dosyada, gözle sayılabilir olur.
   */
  it('config.toml, functions/ altındaki her fonksiyonu kapsıyor', () => {
    const declared = new Set(parseFunctionBlocks(Object.values(CONFIG_TOML)[0]))
    const found = INDEX_SOURCES.map((s) => s.fn)
      .filter((fn) => fn && !declared.has(fn))
      .sort()

    assertRatchet(
      'R7',
      found,
      'NEDEN: bloğu olmayan uçta verify_jwt örtük `true` olur — doğru taraf ama BİLİNÇSİZ: ' +
        'çağıran sınıfı (a/b/c/d) hiçbir yerde yazılı değildir, dolayısıyla bir sonraki ' +
        "düzenleyen gerekçesiz `false` ekleyebilir (2026-08-14'teki 4 canlı anonim açığın deseni). " +
        'ÇÖZÜM: supabase/config.toml\'a\n' +
        '  [functions."<ad>"]\n' +
        '  verify_jwt = true          # sınıf (a) — <kim çağırıyor, hangi kanıtı taşıyor>\n' +
        "bloğunu ekle. Değeri değiştirmeden ÖNCE prod'daki gerçek değeri doğrula (§3.7).",
    )
  })
})

/* ------------------------------------------------------------------ *
 * R8 (E9) — admin-* uçlarında rol kontrolü
 * ------------------------------------------------------------------ */

describe('R8 · admin-* uçları gövdede rol kontrolü yapmalı', () => {
  /**
   * §3.2: `verify_jwt = true` YETKİ DEĞİLDİR, yalnız "geçerli BİR JWT var" der.
   * 2026-08-14: `admin-orders-latest` ve `admin-update-shipping` tam bu boşluktaydı —
   * oturum açmış HERHANGİ bir müşteri tüm siparişleri sayfalayabiliyor, hatta kargo
   * bilgisini YAZABİLİYORDU. İkisi de düzeltildi; bu kural geri gelmesini imkânsız kılar.
   * DEDEKTÖR: dosyada hem `'admin'` hem `'superadmin'` STRING LİTERALİ geçmeli.
   * ('superadmin' içindeki "admin" tırnaklı eşleşmez — iki ayrı literal aranır.)
   */
  it("her admin-* fonksiyonu 'admin'/'superadmin' rolünü kontrol ediyor", () => {
    const adminFns = INDEX_SOURCES.filter((s) => s.fn.startsWith('admin-'))
    // Bayat-tarama koruması: admin ucu bulunamıyorsa kural vacuous-pass ederdi.
    expect(adminFns.length).toBeGreaterThanOrEqual(5)

    const found: string[] = []
    for (const s of adminFns) {
      const hasAdmin = /['"]admin['"]/.test(s.code)
      const hasSuper = /['"]superadmin['"]/.test(s.code)
      if (!hasAdmin || !hasSuper) found.push(s.path)
    }

    assertRatchet(
      'R8',
      found.sort(),
      'NEDEN: kimlik ≠ yetki. verify_jwt=true yalnız token GEÇERLİ der; rol kontrolü yoksa ' +
        'sıradan bir müşteri admin ucunu çağırabilir (yatay yetki açığı — 2026-08-14 canlı örneği: ' +
        'admin-orders-latest tüm siparişleri döndürüyordu). ' +
        "ÇÖZÜM (§3.2 kanonik deseni): getUser(jwt) ile kimliği doğrula → doğrulanmış user.id ile " +
        "supabaseAdmin üzerinden user_profiles.role oku → ['admin','superadmin'].includes(role) " +
        'değilse 403 dön. İstek gövdesinden gelen role/is_admin ASLA yetki kaynağı değildir.',
    )
  })
})

/* ------------------------------------------------------------------ *
 * R9 (E10) — webhook uçları fail-CLOSED
 * ------------------------------------------------------------------ */

describe('R9 · *webhook* uçları HMAC + ZORUNLU timestamp guard taşımalı', () => {
  /**
   * Sınıf (c) uçlarında `verify_jwt = false` MEŞRUDUR (harici sistem JWT üretemez) —
   * bu yüzden TEK kimlik kanıtı gövdededir (§3.5): (1) ham gövde üzerinden HMAC-SHA256,
   * (2) ZORUNLU timestamp başlığı + dar pencere replay guard.
   * "Başlık varsa kontrol et" YETMEZ: göndermeyen çağıran için guard hiç çalışmaz = fail-OPEN.
   * `shipping-webhook` tam böyleydi, T025-VH'de (2026-08-15) zorunlu hâle getirildi.
   * DEDEKTÖR bu ikisini AYIRT ETMEK zorunda; ayırt ettiği aşağıda ayrıca test edilir.
   */
  it('her webhook ucu imza doğruluyor ve timestamp başlığını ZORUNLU tutuyor', () => {
    const webhooks = INDEX_SOURCES.filter((s) => s.fn.includes('webhook'))
    // Bayat-tarama koruması.
    expect(webhooks.length).toBeGreaterThanOrEqual(2)

    const found: string[] = []
    for (const s of webhooks) {
      const missing = webhookGaps(s.code)
      if (missing.length > 0) found.push(`${s.path} [${missing.join('+')}]`)
    }

    assertRatchet(
      'R9',
      found.sort(),
      "NEDEN: verify_jwt=false olan webhook ucunda platform kapısı YOKTUR; imza tek kimlik " +
        'kanıtıdır ve timestamp guard tekrar-oynatmayı (replay) engeller. Guard "başlık varsa" ' +
        'çalışıyorsa göndermeyen çağıran için hiç çalışmaz — kapı fail-OPEN olur (cetvel §3.5: ' +
        'yeni bir güvenlik kapısına ASLA geçiş modu konmaz). ' +
        'ÇÖZÜM (returns-webhook deseni): ham gövdeyi req.text() ile al → crypto.subtle ile ' +
        "HMAC-SHA256 doğrula (x-signature) → `const ts = req.headers.get('x-timestamp') || " +
        "req.headers.get('x-event-time') || ''` → `if (!ts) return json(..., 401)` → " +
        'Math.abs(Date.now() - t) > 5dk ise 401.',
    )
  })

  it("dedektör fail-OPEN guard ile fail-CLOSED guard'ı AYIRT EDİYOR", () => {
    const hmac = [
      `const key = await crypto.subtle.importKey('raw', k, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])`,
      `const sig = req.headers.get('x-signature') || ''`,
    ].join('\n')
    const window = `if (!t || Math.abs(Date.now() - t) > SKEW_MS) return json({}, { status: 401 })`

    // ESKİ (T025 öncesi) fail-OPEN biçim: başlık yoksa guard hiç çalışmaz.
    const failOpen = [
      hmac,
      `const tsHeader = req.headers.get('x-timestamp') || req.headers.get('x-event-time') || ''`,
      `if (tsHeader) {`,
      window,
      `}`,
    ].join('\n')
    expect(webhookGaps(failOpen)).toContain('zorunlu-timestamp')

    // YENİ fail-CLOSED biçim.
    const failClosed = [
      hmac,
      `const tsHeader = req.headers.get('x-timestamp') || req.headers.get('x-event-time') || ''`,
      `if (!tsHeader) { return json({ error: 'Missing timestamp header' }, { status: 401 }) }`,
      window,
    ].join('\n')
    expect(webhookGaps(failClosed)).toEqual([])

    // İmzasız uç da yakalanmalı.
    expect(webhookGaps(failClosed.replace(/crypto\.subtle/g, 'noop'))).toContain('HMAC-imza')
  })
})

/* ------------------------------------------------------------------ *
 * R10 (E11) — çağıran sınıfı beyanı
 * ------------------------------------------------------------------ */

describe('R10 · her fonksiyon dosya başında çağıran sınıfını beyan etmeli', () => {
  /**
   * Cetvel §2: bir ucun güvenlik duruşu KİMİN ÇAĞIRDIĞINDAN türetilir; sınıf
   * belirlenmeden §3.1–§3.6'nın hangisinin uygulanacağı bilinemez. "26 fonksiyon,
   * 26 farklı güvenlik duruşu" sonucunun kök sebebi budur.
   * KANONİK BİÇİM (hem burada hem cetvel §2'de yazılı):
   *     // Çağıran sınıfı: (a) oturumlu admin tarayıcısı — getUser(jwt) + rol kapısı
   * KONUM: dosyanın ilk 15 satırı İÇİNDE **ve** serve/Deno.serve çağrısından ÖNCE.
   * (Beyan bir YORUM olduğu için bu kural ham kaynağı tarar, stripComments'i değil.)
   */
  it('her index.ts başında geçerli bir "Çağıran sınıfı: (a|b|c|d)" beyanı var', () => {
    const found: string[] = []
    for (const s of INDEX_SOURCES) {
      const declLine = firstLineMatching(s.raw, CALLER_CLASS_RE)
      const serveLine = firstLineMatching(s.code, SERVE_RE)
      const ok =
        declLine > 0 &&
        declLine <= CALLER_CLASS_HEADER_LINES &&
        (serveLine === 0 || declLine < serveLine)
      if (!ok) found.push(s.path)
    }

    assertRatchet(
      'R10',
      found.sort(),
      'NEDEN: çağıran sınıfı yazılı değilse ucun hangi kanıtı istemesi gerektiği (JWT mi, HMAC mi, ' +
        "hiçbiri mi) kimse tarafından bilinemez — cetvelin §3'ü uygulanamaz ve her fonksiyon kendi " +
        'güvenlik modelini icat eder. ' +
        'ÇÖZÜM: dosyanın en başına, serve() çağrısından ÖNCE (ilk ' +
        `${CALLER_CLASS_HEADER_LINES} satır içinde) tek satır ekle:\n` +
        '  // Çağıran sınıfı: (a) oturumlu kullanıcı tarayıcısı — getUser(jwt) + rol/sahiplik kapısı\n' +
        '  // Çağıran sınıfı: (b) sunucu→sunucu — Authorization === `Bearer ${SERVICE_KEY}`\n' +
        '  // Çağıran sınıfı: (c) harici sistem — HMAC + zorunlu timestamp (verify_jwt=false meşru)\n' +
        '  // Çağıran sınıfı: (d) pg_cron — auth header yok; idempotent, dışa veri sızdırmaz\n' +
        'Sınıfı yazmadan geçmek YASAK: sınıf, §3.1–§3.6 kurallarının giriş kapısıdır (§2).',
    )
  })
})

/* ------------------------------------------------------------------ *
 * R11 (E12) — tenant_id önce DOĞRULANMIŞ kimlikten
 * ------------------------------------------------------------------ */

describe('R11 · tenant_id istekten önce doğrulanmış kimlikten okunmalı', () => {
  /**
   * §3.9 (AÇIK BORÇ). `_shared/tenant_config.ts::resolveTenantId` önce `?tenant_id=`
   * query parametresini okuyor (satır 20) — yani istekten gelen değer JWT'yi EZİYOR.
   * Tek tenant (DEFAULT_TENANT_ID) canlıyken etkisi sınırlı; Faz 2 açılır açılmaz bu
   * doğrudan DATA BLEEDING'dir: fonksiyonlar tenant_id'yi PostgREST filtresine koyduğu
   * için "başka tenant'ın satırını oku/yaz"a kadar gider (CLAUDE.md §12 ihlali).
   * NOT: sırayı çevirmek YETMEZ — JWT dalı da `atob` ile imzasız (R6). İkisi birlikte
   * düzeltilir: resolveTenantId async olup getUser(jwt).app_metadata'dan okumalı.
   */
  it('doğrulanmamış tenant kaynağı (query/gövde) getUser() sonrasına bırakılmış', () => {
    const found: string[] = []
    for (const s of SOURCES) {
      const untrustedLine = lineOf(s.code, UNTRUSTED_TENANT_RE)
      if (!untrustedLine) continue
      const verifiedLine = lineOf(s.code, VERIFIED_IDENTITY_RE)
      if (verifiedLine === 0 || untrustedLine < verifiedLine) {
        found.push(`${s.path}:${untrustedLine}`)
      }
    }

    assertRatchet(
      'R11',
      found.sort(),
      "NEDEN: tenant sınırı istekten gelen bir değerle çizilirse sınır YOKTUR — `?tenant_id=<başkası>` " +
        "eklemek yeter. Bugün tek tenant canlı olduğu için görünmüyor; multi-tenant açılır açılmaz " +
        "başka tenant'ın satırlarını okumak/yazmak demektir (CLAUDE.md §12: data bleeding = felaket). " +
        'ÇÖZÜM (§3.9): resolveTenantId async olsun ve tenant_id\'yi ÖNCE ' +
        'auth.getUser(jwt) ile doğrulanmış user.app_metadata.tenant_id\'den okusun; query/gövde ' +
        'değeri YALNIZ sınıf (c)/(d) uçlarında ve o ucun HMAC kontrolünden SONRA kabul edilsin. ' +
        'Yarım düzeltme (sadece sırayı çevirmek) saldırıyı query-param\'dan sahte JWT\'ye taşır — ' +
        'R6 (atob) ile BİRLİKTE düzeltilmelidir.',
    )
  })
})
