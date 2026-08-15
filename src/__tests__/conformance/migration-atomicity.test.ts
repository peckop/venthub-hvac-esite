import { describe, expect, it } from 'vitest'

/**
 * INV-MIGRATION-1 · Migration atomikliği conformance (kalıcı bekçi).
 *
 * ## Niçin bu kural var
 *
 * `master`'a inen bir migration **prod DB'ye otomatik uygulanır** (`supabase-migrate.yml`,
 * CLAUDE.md kural 13). Bu yüzden "yarım uygulanmış migration" bu repoda teorik bir risk
 * değil, doğrudan üretim veri bütünlüğü meselesidir.
 *
 * Çalıştırıcı iki biçimi kabul eder ve üçüncüsü yoktur:
 *
 *   (a) **Dosya kendi işlemini yönetir** — içinde `BEGIN;` … `COMMIT;` vardır.
 *       Olduğu gibi koşulur. Bu biçim bilinçlidir: bazı ifadeler bir transaction
 *       bloğunun İÇİNDE çalışamaz (`CREATE INDEX CONCURRENTLY`, `VACUUM`, …) ve
 *       yazar bunları `COMMIT;`'ten SONRA bırakır.
 *   (b) **Dosya işlem denetimi içermez** — çalıştırıcı `psql --single-transaction`
 *       ile sarar, dosya bütün olarak uygulanır ya da hiç uygulanmaz.
 *
 * ## Bu testin yakaladığı, başka hiçbir şeyin görmediği hata
 *
 * Kural (a)/(b) ayrımına DEĞİL, o ayrımın **bozulduğu** duruma bakar:
 *
 *   1. **İşlem-dışı ifade, sarılacak bir dosyada** → çalıştırıcı `--single-transaction`
 *      uygular, PostgreSQL `CREATE INDEX CONCURRENTLY cannot run inside a transaction
 *      block` der ve migration **deploy anında** patlar. Yazar bunu asla yerelde görmez.
 *   2. **İşlem-dışı ifade, `BEGIN`…`COMMIT` ARASINDA** → aynı hata, bu kez dosya kendi
 *      işlemini yönettiği için çalıştırıcı da kurtaramaz.
 *   3. **Dengesiz `BEGIN`/`COMMIT`** → açık kalan bir işlem ya da erken kapanan blok;
 *      psql oturumu kapanınca sessiz ROLLBACK, ledger'a "uygulandı" yazılabilir.
 *
 * `tsc`, `lint`, `deno check` ve mevcut hiçbir test SQL metnini yorumlamaz. Bu sınıf
 * ancak burada ya da **prod'a uygularken** görülür — ikincisi çok geç.
 *
 * ## Kapsam dışı (bilinçli, sessiz cap değil)
 * SQL'in doğruluğu, şema anlamı, RLS içeriği. Burada yalnız **işlem sınırı** denetlenir.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const MIGRATIONS: Record<string, string> = import.meta.glob('/supabase/migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/**
 * Bir transaction bloğunun içinde çalışamayan ifadeler. PostgreSQL bunları
 * `... cannot run inside a transaction block` ile reddeder.
 */
const NON_TRANSACTIONAL: ReadonlyArray<{ ad: string; re: RegExp }> = [
  { ad: 'CREATE INDEX CONCURRENTLY', re: /\bcreate\s+(?:unique\s+)?index\s+concurrently\b/i },
  { ad: 'DROP INDEX CONCURRENTLY', re: /\bdrop\s+index\s+concurrently\b/i },
  { ad: 'REINDEX CONCURRENTLY', re: /\breindex\b[^;]*\bconcurrently\b/i },
  { ad: 'VACUUM', re: /^\s*vacuum\b/im },
  { ad: 'CREATE DATABASE', re: /\bcreate\s+database\b/i },
  { ad: 'ALTER SYSTEM', re: /\balter\s+system\b/i },
  { ad: 'CREATE TABLESPACE', re: /\bcreate\s+tablespace\b/i },
]

const BEGIN_RE = /^\s*(?:begin|start\s+transaction)\s*;/gim
const COMMIT_RE = /^\s*commit\s*;/gim

/** `--` satır yorumlarını ve `/* *​/` blok yorumlarını siler (SQL metni yorumlanmaz). */
function stripSqlComments(sql: string): string {
  return sql.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--[^\n]*/g, ' ')
}

/** Bir eşleşmenin kaçıncı satırda olduğunu döndürür (1-tabanlı, yoksa 0). */
function lineOf(text: string, re: RegExp): number {
  const m = new RegExp(re.source, re.flags.replace('g', '')).exec(text)
  return m ? text.slice(0, m.index).split('\n').length : 0
}

function countMatches(text: string, re: RegExp): number {
  return (text.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')) ?? [])
    .length
}

describe('INV-MIGRATION-1 · her migration ya kendi işlemini yönetir ya da sarılabilir', () => {
  const dosyalar = Object.entries(MIGRATIONS).map(([path, raw]) => ({
    path,
    ad: path.split('/').pop() as string,
    raw,
    code: stripSqlComments(raw),
  }))

  it('migration dosyaları gerçekten yükleniyor (glob boşalırsa burada patlar)', () => {
    expect(dosyalar.length).toBeGreaterThan(100)
  })

  it('BEGIN ve COMMIT sayıları dengeli', () => {
    const bozuk = dosyalar
      .map((d) => ({ ...d, b: countMatches(d.code, BEGIN_RE), c: countMatches(d.code, COMMIT_RE) }))
      .filter((d) => d.b !== d.c)
      .map((d) => `${d.ad} (BEGIN=${d.b}, COMMIT=${d.c})`)

    expect(
      bozuk,
      'Dengesiz işlem sınırı:\n  ' +
        bozuk.join('\n  ') +
        '\n\nAçık kalan bir işlem psql oturumu kapanınca SESSİZCE geri alınır, ama çalıştırıcı ' +
        'çıkış kodunu 0 görüp ledger\'a "uygulandı" yazabilir — yani migration kaybolur ve ' +
        'bir daha DENENMEZ. Her BEGIN kendi COMMIT\'ini bulmalı.',
    ).toEqual([])
  })

  it('işlem-dışı ifadeler transaction bloğunun İÇİNDE değil', () => {
    const ihlaller: string[] = []

    for (const d of dosyalar) {
      const beginLine = lineOf(d.code, BEGIN_RE)
      const commitLine = lineOf(d.code, COMMIT_RE)
      const kendiIslemi = beginLine > 0 && commitLine > 0

      for (const { ad, re } of NON_TRANSACTIONAL) {
        const satir = lineOf(d.code, re)
        if (!satir) continue

        if (!kendiIslemi) {
          // (b) yolu: çalıştırıcı --single-transaction ile saracak → PostgreSQL reddeder.
          ihlaller.push(
            `${d.ad}:${satir} — ${ad}, dosyada BEGIN/COMMIT YOK → çalıştırıcı sarar → hata`,
          )
        } else if (satir > beginLine && satir < commitLine) {
          // (a) yolu ama ifade bloğun İÇİNDE.
          ihlaller.push(
            `${d.ad}:${satir} — ${ad}, BEGIN(${beginLine})…COMMIT(${commitLine}) ARASINDA`,
          )
        }
      }
    }

    expect(
      ihlaller.sort(),
      'Transaction bloğunda çalışamayacak ifade(ler):\n  ' +
        ihlaller.join('\n  ') +
        '\n\nPostgreSQL bunlari "cannot run inside a transaction block" ile REDDEDER. ' +
        'Bu hata yerelde görünmez; master\'a merge edildiği an prod deploy\'unda patlar ' +
        '(CLAUDE.md kural 13: migration merge = prod\'a otomatik uygulama).\n' +
        'ÇÖZÜM: dosyaya açık `BEGIN;` … `COMMIT;` koy ve işlem-dışı ifadeyi COMMIT\'ten ' +
        'SONRA bırak — örnek: 20260402000000_security_and_performance_hardening.sql ' +
        '(BEGIN@7, COMMIT@95, CREATE INDEX CONCURRENTLY@103+).',
    ).toEqual([])
  })

  it('kendi kendini doğrular: dedektör sentetik ihlalleri GERÇEKTEN görür', () => {
    // Dedektör körleşirse (regex çürür, glob boşalır) yukarıdaki iki test sessizce
    // yeşile döner. Sağlık, repo durumundan BAĞIMSIZ ölçülmeli.
    for (const ornek of [
      'CREATE INDEX CONCURRENTLY idx_a ON t(c);',
      'create unique index concurrently idx_b on t(c);',
      'DROP INDEX CONCURRENTLY idx_c;',
      'VACUUM ANALYZE products;',
      'ALTER SYSTEM SET work_mem = 64;',
    ]) {
      expect(
        NON_TRANSACTIONAL.some(({ re }) => re.test(ornek)),
        `yakalanmalıydı: ${ornek}`,
      ).toBe(true)
    }

    for (const ornek of [
      'CREATE INDEX idx_a ON t(c);',
      "COMMENT ON INDEX idx_a IS 'concurrently degil';",
      'ALTER TABLE products ADD COLUMN tenant_id uuid;',
    ]) {
      expect(
        NON_TRANSACTIONAL.some(({ re }) => re.test(ornek)),
        `yanlış-pozitif: ${ornek}`,
      ).toBe(false)
    }

    // Yorum ayıklayıcı: yorumdaki ifade ihlal DEĞİLDİR.
    expect(stripSqlComments('-- CREATE INDEX CONCURRENTLY x\nselect 1;')).not.toMatch(
      /concurrently/i,
    )
    expect(stripSqlComments('/* VACUUM */ select 1;')).not.toMatch(/vacuum/i)

    // Sınır mantığı: aynı ifade COMMIT'ten sonra MEŞRU, önce İHLAL.
    const mesru = 'BEGIN;\nselect 1;\nCOMMIT;\nCREATE INDEX CONCURRENTLY i ON t(c);'
    const ihlal = 'BEGIN;\nCREATE INDEX CONCURRENTLY i ON t(c);\nCOMMIT;'
    const idx = (sql: string) => lineOf(sql, NON_TRANSACTIONAL[0].re)
    expect(idx(mesru)).toBeGreaterThan(lineOf(mesru, COMMIT_RE))
    expect(idx(ihlal)).toBeLessThan(lineOf(ihlal, COMMIT_RE))
  })
})
