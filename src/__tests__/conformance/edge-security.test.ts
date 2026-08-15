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
 * Zorlanan 6 kural için gerekçeler tek tek aşağıdaki describe bloklarının başındadır.
 * Cetvel: docs/standards/edge-function-security-standard.md
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

/** Kaynak havuzu: fonksiyon .ts dosyaları (companion .md ve testler hariç). */
const SOURCES: { key: string; path: string; fn: string; code: string }[] = Object.entries(EDGE_TS)
  .filter(([k]) => !k.includes('.test.') && !k.includes('__tests__'))
  .map(([k, v]) => ({ key: k, path: rel(k), fn: fnNameOf(k), code: stripComments(v) }))

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
