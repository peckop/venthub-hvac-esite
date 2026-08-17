import { describe, expect, it } from 'vitest'

/**
 * INV-6 · admin-write real-effect conformance (kalıcı bekçi).
 *
 * Her admin yazma yolu `mutateWithAudit(supabase, { ..., fn })` tek kapısından geçer.
 * `fn` = ASIL mutasyon. Eğer `fn` gerçek bir DB yazımı yapmıyorsa (boş gövde /
 * `return Promise.resolve()` / no-op) ama çağıran kod yine de "başarıyla kaydedildi"
 * bildirimi gösteriyorsa → **SAHTE-SUCCESS**: kullanıcı kaydettiğini sanır, hiçbir şey
 * kalıcılaşmaz. (AdminSettingsPage admins/system sekmeleri bu sınıfta yakalandı.)
 *
 * Bu sınıfı mevcut hiçbir gate yakalamaz:
 *   • tsc — no-op fn geçerli tip (Promise<void>),
 *   • lint — sözdizimi temiz,
 *   • test — write yok ki kırılsın,
 *   • build — hata yok.
 * Yalnız bu invariant yakalar: her `mutateWithAudit` `fn` gövdesi en az bir GERÇEK yazma
 * yüzeyi (`.insert/.update/.upsert/.delete/.rpc`) içermeli; içermiyorsa FAIL.
 *
 * KURAL: bir yazma eyleminin başarı bildirimi göstermesi için `fn` gerçekten kalıcılaştırmalı.
 * "İskelet" sekme demek = no-op + success toast DEĞİL; ya gerçek yaz ya da butonu disable/yok et.
 * (admin-standard.md §8 — sahte-success YASAK.)
 *
 * Kapsam: prod kaynak (views/ components/ lib/). Test dosyaları (kasıtlı sahte fn) atlanır.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// Gerçek yazma/etki yüzeyi. Bunlardan biri fn gövdesinde olmalı:
// direkt tablo mutasyonu · RPC · Edge Function invoke (sunucu-tarafı yazım).
const WRITE_TOKENS = [
  '.insert(',
  '.update(',
  '.upsert(',
  '.delete(',
  '.rpc(',
  '.functions.invoke(',
]

// Servise-delege yazım: `await <servis>(...)` (yazımı içeride yapar, ör. setUserAdminRole→rpc).
// `Promise.resolve()`/`Promise.reject()` HARİÇ (no-op sahteyi geçirmez).
const SERVICE_AWAIT = /await\s+(?!Promise\b)[A-Za-z_$][\w$.]*\s*\(/

// Toplu servise-delege: `await Promise.all(ids.map(id => servis(id)))` gibi kombinatör-sarmalı
// gerçek operasyonlar. Kör nokta: SERVICE_AWAIT `await Promise`'i (no-op sahteyi yakalamak için)
// dışlıyordu → meşru `Promise.all`/`allSettled`/`race` desenini de tanımıyordu. No-op sahte
// `Promise.resolve()`/`reject()` kullanır, ASLA bu kombinatörleri değil → güvenle gerçek-etki sayılır.
const PROMISE_COMBINATOR = /await\s+Promise\.(all|allSettled|race)\s*\(/

function toRelPath(globKey: string): string {
  const marker = '/src/'
  const idx = globKey.indexOf(marker)
  return (idx >= 0 ? globKey.slice(idx + marker.length) : globKey).replace(/\\/g, '/')
}

/** Yorumları siler: comment içindeki örnek `.update(` bekçiyi yanıltmasın. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

/** openIdx '{' konumundan başlayıp eşleşen kapanış '}'ye kadar gövdeyi döndürür. */
function matchBlock(src: string, openIdx: number): string {
  let depth = 0
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i]
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return src.slice(openIdx, i + 1)
    }
  }
  return src.slice(openIdx)
}

/**
 * Bir kaynaktaki tüm `mutateWithAudit(...)` çağrılarının `fn:` gövdelerini çıkarır.
 * fn blok-gövdeli arrow (`fn: async () => { ... }`) varsayımı; değilse satır-kalanı alınır.
 */
function extractMutateFnBodies(source: string): string[] {
  const bodies: string[] = []
  const callRe = /mutateWithAudit\s*\(/g
  let m: RegExpExecArray | null
  while ((m = callRe.exec(source)) !== null) {
    const fnIdx = source.indexOf('fn:', m.index)
    if (fnIdx === -1) continue
    const arrowIdx = source.indexOf('=>', fnIdx)
    if (arrowIdx === -1) continue
    // arrow sonrası ilk anlamlı karakter
    let i = arrowIdx + 2
    while (i < source.length && /\s/.test(source[i])) i++
    if (source[i] === '{') {
      bodies.push(matchBlock(source, i))
    } else {
      // expression-body arrow: makul bir pencere al (mevcut korpusta yok ama güvenli)
      bodies.push(source.slice(i, i + 200))
    }
  }
  return bodies
}

describe('INV-6 · admin-write real-effect conformance', () => {
  it('her mutateWithAudit fn gövdesi GERÇEK bir DB yazımı içermeli (sahte-success yasak)', () => {
    const offenders: { file: string; snippet: string }[] = []

    for (const [globKey, source] of Object.entries(SOURCES)) {
      const rel = toRelPath(globKey)
      if (rel.endsWith('.d.ts') || rel.includes('__tests__') || rel.includes('.test.')) continue
      if (rel.endsWith('lib/admin/mutateWithAudit.ts')) continue // tanımın kendisi

      const clean = stripComments(source)
      if (!clean.includes('mutateWithAudit')) continue

      for (const body of extractMutateFnBodies(clean)) {
        const hasWrite = WRITE_TOKENS.some((tok) => body.includes(tok))
        const hasServiceAwait = SERVICE_AWAIT.test(body)
        const hasPromiseCombinator = PROMISE_COMBINATOR.test(body)
        if (!hasWrite && !hasServiceAwait && !hasPromiseCombinator) {
          offenders.push({ file: rel, snippet: body.replace(/\s+/g, ' ').slice(0, 120) })
        }
      }
    }

    expect(
      offenders,
      `SAHTE-SUCCESS: mutateWithAudit fn gövdesi gerçek yazma (.insert/.update/.upsert/.delete/.rpc) ` +
        `içermiyor. Ya gerçek yaz ya da başarı bildirimini kaldır.\n` +
        // Kapının en sık YANLIŞ-POZİTİF görünen dalı. Mesaj yol göstermezse geliştirici
        // testin kaynağını okumak zorunda kalıyor (AUTH bunu yaşadı, T063). Kural keyfî
        // değil: `await`siz çağrının sonucu beklenmez, hata yutulur ve `mutateWithAudit`
        // yazma başarısız olsa bile başarı sanar — yani gerçekten sahte-success olur.
        `İPUCU — servise delege ediyorsan ASYNC + AWAIT zorunlu:\n` +
        `  YANLIS  fn: () => guncelleServis(supabase, veri)        (arrow-return: sahte-success sayılır)\n` +
        `  DOGRU   fn: async () => { await guncelleServis(supabase, veri) }\n` +
        `Toplu işte kombinatör de kabul edilir: await Promise.all / allSettled / race (...)\n` +
        offenders.map((o) => `  ${o.file}  →  fn{ ${o.snippet} }`).join('\n'),
    ).toEqual([])
  })
})
