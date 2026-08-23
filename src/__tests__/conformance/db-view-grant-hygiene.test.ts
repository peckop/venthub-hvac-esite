import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-VIEW-GRANT-1 — `public` şemasında VIEW oluşturan her migration, yetkileri
 * ADIYLA geri almalıdır. `GRANT SELECT` tek başına bir kapı DEĞİLDİR.
 *
 * NİÇİN VAR (T101-VH · 2026-08-19)
 *
 * Prod ölçümü (`pg_default_acl`, şema public, objtype 'r'):
 *
 *     anon=arwdDxtm   authenticated=arwdDxtm   service_role=arwdDxtm
 *
 * Sekiz yetki VARSAYILAN AYRICALIK olarak tanımlı. Yani public şemasında doğan her
 * view, hiçbir GRANT yazılmasa bile anon ve authenticated için INSERT/UPDATE/DELETE/
 * TRUNCATE/REFERENCES/TRIGGER/MAINTAIN taşır. Migration'a yazılan `GRANT SELECT`
 * satırı rolün ZATEN sahip olduğu bir yetkiyi tekrar verir: etkisizdir. Durumu
 * değiştiren tek ifade REVOKE'tur.
 *
 * Bu bir "olabilir" değil, ölçülmüş vaka: `view_admin_returns` migration'ı
 * (20260818130000) yorumunda "view'a YALNIZ SELECT verilir" der; prod'da
 * `authenticated` o view üzerinde SEKİZ yetki tutuyordu.
 *
 * TABLO NİÇİN KAPSAM DIŞI: Supabase modelinde tabloda kapı RLS politikasıdır, yetki
 * bilerek geniştir. VIEW'in kendi RLS politikası YOKTUR — orada kapı yalnızca GRANT'tır.
 * Bu yüzden varsayılan ayrıcalıklara DOKUNULMAZ, view'lar tek tek kapatılır.
 *
 * KAPININ GÖREMEDİĞİ: canlı DB durumu (statik tarama dosyaya bakar). Onu migration'ın
 * kendi doğrulama bloğu ve elle `pg_class.relacl` sorgusu ölçer — cetvel §7.
 *
 * Cetvel: docs/standards/db-grant-hygiene-standard.md
 * Ölçüm:  docs/audits/t101-view-grant-hygiene-2026-08-19.md
 */

const KOK = path.resolve(__dirname, '../../..')
const MIGRATIONS = path.join(KOK, 'supabase/migrations')

/** Hijyen migration'ı — R3 bunun İÇERİĞİNİ kilitler. */
const HIJYEN_DOSYA = '20260819103000_view_grant_hygiene.sql'

/** Prod'da 2026-08-19'da ölçülen altı view. */
const BILINEN_VIEWLER = [
  'admin_users',
  'inventory_summary',
  'inventory_velocity',
  'reserved_orders',
  'view_admin_orders',
  'view_admin_returns',
] as const

/**
 * MUAFİYET — uygulanmış migration DEĞİŞTİRİLEMEZ, o yüzden view oluşturan eski
 * dosyalar ADIYLA muaftır. Liste kısalır, uzamaz: yeni bir dosya buraya eklenmeden
 * kapıyı geçemez ve ekleme PR'da görünür.
 */
const ESKI_DOSYALAR: Record<string, string> = {
  '20250903_role_based_admin_system.sql':
    'admin_users — 2025-09; SELECT 20250910_security_hardening ile zaten alındı',
  '20250904_inventory_views.sql': 'inventory_summary + reserved_orders — 2025-09',
  '20260225_admin_orders_search_view.sql':
    'view_admin_orders — anon/PUBLIC revoke edilmiş, authenticated edilmemiş',
  '20260225_admin_system_fix.sql': 'view_admin_orders yeniden oluşturuluyor — 2026-02',
  '20260225_admin_system_fix_final.sql': 'view_admin_orders yeniden oluşturuluyor — 2026-02',
  '20260302_inventory_premium.sql': 'inventory_summary + inventory_velocity — 2026-03',
  '20260402000000_security_and_performance_hardening.sql':
    'inventory_summary + inventory_velocity yeniden oluşturuluyor — 2026-04',
  '20260818130000_admin_returns_search_view.sql':
    'view_admin_returns — anon/PUBLIC revoke var, authenticated yok (T090)',
}

/** SQL yorumlarını sil. Depo CRLF; satır sonu için [^\r\n] şart. */
function yorumsuz(sql: string): string {
  return sql.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--[^\r\n]*/g, ' ')
}

const OLUSTUR_RE =
  /\bCREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\s*\.\s*)?"?([a-z0-9_]+)"?/gi

function olusturulanViewler(sql: string): Array<{ ad: string; konum: number }> {
  const cikti: Array<{ ad: string; konum: number }> = []
  const metin = yorumsuz(sql)
  for (const m of metin.matchAll(OLUSTUR_RE)) {
    cikti.push({ ad: m[1].toLowerCase(), konum: m.index ?? 0 })
  }
  return cikti
}

const ROLLER = ['PUBLIC', 'anon', 'authenticated', 'service_role'] as const

/**
 * Bir dosyanın §1 desenine uyup uymadığı. Sıra ÖNEMLİDİR: REVOKE, view'i oluşturan
 * CREATE'ten SONRA gelmelidir — daha önce gelen bir REVOKE, yeniden oluşturulan
 * view'in tazelediği varsayılan yetkileri temizlemez.
 */
function eksikRoller(sql: string, view: string, createKonum: number): string[] {
  const metin = yorumsuz(sql)
  return ROLLER.filter((rol) => {
    const re = new RegExp(
      String.raw`REVOKE\s+ALL[\w\s,()]*?\s+ON\s+(?:TABLE\s+)?(?:public\s*\.\s*)?"?` +
        view +
        String.raw`"?\s+FROM\s+[^;]*\b` +
        rol +
        String.raw`\b`,
      'gi',
    )
    for (const m of metin.matchAll(re)) {
      if ((m.index ?? 0) > createKonum) return false
    }
    return true
  })
}

function migrationDosyalari(): string[] {
  return readdirSync(MIGRATIONS)
    .filter((f) => f.toLowerCase().endsWith('.sql'))
    .sort()
}

describe('INV-VIEW-GRANT-1 — VIEW yetki hijyeni', () => {
  const dosyalar = migrationDosyalari()
  const viewOlusturanlar = dosyalar
    .map((f) => ({ ad: f, sql: readFileSync(path.join(MIGRATIONS, f), 'utf8') }))
    .map((d) => ({ ...d, viewler: olusturulanViewler(d.sql) }))
    .filter((d) => d.viewler.length > 0)

  it('R0 — tarayıcı gerçekten dosya buluyor (sahte-yeşil kilidi)', () => {
    expect(dosyalar.length, 'migration dizini boş okundu — yol yanlış olabilir').toBeGreaterThan(100)
    expect(
      viewOlusturanlar.length,
      'HİÇ view oluşturan migration bulunamadı — CREATE VIEW deseni tutmuyor demektir',
    ).toBeGreaterThanOrEqual(8)
  })

  it('R0b — dedektör sağlıklı: bozuk örneği REDDEDER, doğru örneği KABUL EDER', () => {
    const kotu = 'CREATE VIEW public.ornek AS SELECT 1;\nGRANT SELECT ON public.ornek TO authenticated;'
    const iyi =
      'CREATE VIEW public.ornek AS SELECT 1;\n' +
      'REVOKE ALL ON public.ornek FROM PUBLIC;\n' +
      'REVOKE ALL ON public.ornek FROM anon;\n' +
      'REVOKE ALL ON public.ornek FROM authenticated;\n' +
      'REVOKE ALL ON public.ornek FROM service_role;\n' +
      'GRANT SELECT ON public.ornek TO authenticated;'
    const tersSira =
      'REVOKE ALL ON public.ornek FROM PUBLIC;\n' +
      'REVOKE ALL ON public.ornek FROM anon;\n' +
      'REVOKE ALL ON public.ornek FROM authenticated;\n' +
      'REVOKE ALL ON public.ornek FROM service_role;\n' +
      'CREATE VIEW public.ornek AS SELECT 1;'

    expect(olusturulanViewler(kotu).map((v) => v.ad)).toEqual(['ornek'])
    expect(eksikRoller(kotu, 'ornek', olusturulanViewler(kotu)[0].konum)).toEqual([
      'PUBLIC',
      'anon',
      'authenticated',
      'service_role',
    ])
    expect(eksikRoller(iyi, 'ornek', olusturulanViewler(iyi)[0].konum)).toEqual([])
    // CREATE'ten ÖNCE gelen REVOKE sayılmaz.
    expect(
      eksikRoller(tersSira, 'ornek', olusturulanViewler(tersSira)[0].konum).length,
      'CREATE öncesi REVOKE geçerli sayıldı — sıra kontrolü bozuk',
    ).toBe(4)
    // Yorum içindeki REVOKE de sayılmaz.
    const yorumlu = 'CREATE VIEW public.ornek AS SELECT 1;\n-- REVOKE ALL ON public.ornek FROM anon;'
    expect(eksikRoller(yorumlu, 'ornek', olusturulanViewler(yorumlu)[0].konum)).toContain('anon')
  })

  it('R1 — yeni migration view oluşturuyorsa dört rolden de REVOKE ALL yapar', () => {
    const ihlaller: string[] = []
    for (const d of viewOlusturanlar) {
      if (d.ad in ESKI_DOSYALAR) continue
      for (const v of d.viewler) {
        const eksik = eksikRoller(d.sql, v.ad, v.konum)
        if (eksik.length > 0) {
          ihlaller.push(`${d.ad} · public.${v.ad} → REVOKE ALL eksik: ${eksik.join(', ')}`)
        }
      }
    }
    expect(
      ihlaller,
      '\nVIEW oluşturan migration yetkileri geri almıyor. GRANT SELECT tek başına kapı DEĞİLDİR — ' +
        'varsayılan ayrıcalıklar anon ve authenticated için sekiz yetkiyi zaten vermiştir. ' +
        'Cetvel: docs/standards/db-grant-hygiene-standard.md §1',
    ).toEqual([])
  })

  it('R2 — muafiyet listesi bayat değil (her kayıt var ve gerçekten view oluşturuyor)', () => {
    const olusturanAdlar = new Set(viewOlusturanlar.map((d) => d.ad))
    const yetim = Object.keys(ESKI_DOSYALAR).filter((f) => !olusturanAdlar.has(f))
    expect(
      yetim,
      '\nMuafiyet listesinde artık view oluşturmayan (ya da silinmiş) dosya var — ' +
        'liste kısalmalı, satırı düşür.',
    ).toEqual([])
  })

  it('R3 — hijyen migration altı view için de dört rolü geri alıyor', () => {
    const sql = readFileSync(path.join(MIGRATIONS, HIJYEN_DOSYA), 'utf8')
    const govde = yorumsuz(sql)

    const eksikView = BILINEN_VIEWLER.filter((v) => !new RegExp("'" + v + "'").test(govde))
    expect(
      eksikView,
      '\n' + HIJYEN_DOSYA + ' içindeki view listesinden düşen ad(lar) var — sessizce daraltma.',
    ).toEqual([])

    const eksikRol = ROLLER.filter(
      (rol) =>
        !new RegExp(String.raw`REVOKE\s+ALL\s+ON\s+[^']*%I[^']*FROM\s+` + rol + String.raw`\b`, 'i').test(
          govde,
        ),
    )
    expect(eksikRol, '\n' + HIJYEN_DOSYA + ' şu rol(ler) için REVOKE ALL içermiyor.').toEqual([])

    // Kaldırılan yetkinin geri verilmediği: view'a INSERT/UPDATE/DELETE GRANT'ı olmamalı.
    const yazmaGrant = govde.match(/GRANT\s+[^;]*\b(INSERT|UPDATE|DELETE)\b[^;]*;/gi) ?? []
    expect(
      yazmaGrant,
      '\n' + HIJYEN_DOSYA + " view'a yazma yetkisi veriyor — yazma yolu her zaman TABLODUR (cetvel §5).",
    ).toEqual([])

    // admin_users'ın SELECT'i bilerek geri VERİLMEZ (20250910 hardening kararı).
    expect(
      /GRANT\s+SELECT\s+ON\s+(?:public\s*\.\s*)?admin_users\s+TO\s+authenticated/i.test(govde),
      '\nadmin_users için authenticated SELECT geri verilmiş — bu 20250910 hardening kararını bozar.',
    ).toBe(false)
  })

  it('R4 — cetvel dosyası yerinde ve kapıyı adıyla anıyor', () => {
    const cetvel = readFileSync(path.join(KOK, 'docs/standards/db-grant-hygiene-standard.md'), 'utf8')
    expect(cetvel).toContain('INV-VIEW-GRANT-1')
    expect(cetvel).toContain('pg_default_acl')
  })
})
