/**
 * INV-OPS211-DB — karne 2026-11 kök 2, DB tarafı (Y4 · Y5 · K5)
 *
 * CETVEL: `docs/audits/guvenlik-karnesi-2026-11.md` §4 (Y4, Y5, K5) · CLAUDE.md kural 11 (admin işlemleri
 * `admin_audit_log`) · `docs/standards/migration-safety-standard.md`.
 *
 * TEHDİT MODELİ: üç nesnenin her biri bir sonraki migration'da tabandaki gevşek hâline geri dönebilir:
 *   Y4  `admin_list_all_users` rol listesine `moderator` (ya da başka rol) geri girer → tüm kullanıcıların
 *       e-posta/telefonu (KVKK) yöneticiden fazlasına açılır.
 *   Y5  `enforce_role_change` super_admin'i düşürme kuralını ya da oturumlu denetim yazımını kaybeder.
 *   K5  `admin_audit_log_insert_v2` politikası `actor = auth.uid()` şartını kaybeder → iz sahteciliği.
 * Nesneler migration dosyalarında "son tanım kazanır" kuralıyla okunur (CI bayt sırasıyla uygular).
 *
 * DAVRANIŞ KANITI bu dosyada değil (vitest'te Postgres yok): migration yazılırken yerel PostgreSQL 16'da
 * asgari auth taklidiyle önce/sonra senaryoları koşuldu (PR gövdesinde tablo). Migration'ın kendi öz-kontrol
 * bloğu canlıda uygulama anında aynı üç şartı yeniden ölçer; biri tutmazsa migration geri döner.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const MIGRATION_KLASORU = join(process.cwd(), 'supabase', 'migrations')
const BU_MIGRATION = '20261103090000_ops211_yetki_rpc_rol_denetimi.sql'
const GERI_ALMA = join(
  process.cwd(),
  'scripts',
  'db',
  'rollback',
  '20261103090000_ops211_yetki_rpc_rol_denetimi_geri_al.sql',
)

function sqlYorumsuz(sql: string): string {
  return sql.replace(/--[^\r\n]*/g, '')
}

function tumMigrationlar(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const ad of readdirSync(MIGRATION_KLASORU).filter((f) => f.endsWith('.sql')).sort()) {
    out[ad] = readFileSync(join(MIGRATION_KLASORU, ad), 'utf8').replace(/\r\n/g, '\n')
  }
  return out
}

/** `kalip` ile başlayan tanımın SON geçtiği dosya ve o tanımdan sonraki gövde (ilk `$$ ...$$` bloğu). */
function sonFonksiyonGovdesi(
  dosyalar: Record<string, string>,
  ad: string,
): { dosya: string; govde: string } | null {
  const kalip = new RegExp(`create\\s+or\\s+replace\\s+function\\s+(?:"?public"?\\.)?"?${ad}"?\\s*\\(`, 'gi')
  let son: { dosya: string; govde: string } | null = null
  for (const [dosya, ham] of Object.entries(dosyalar)) {
    const sql = sqlYorumsuz(ham)
    for (const m of sql.matchAll(kalip)) {
      const bas = sql.indexOf('$$', m.index ?? 0)
      const bitis = bas >= 0 ? sql.indexOf('$$', bas + 2) : -1
      if (bas >= 0 && bitis > bas) son = { dosya, govde: sql.slice(bas + 2, bitis) }
    }
  }
  return son
}

function sonPolitika(dosyalar: Record<string, string>, ad: string): { dosya: string; govde: string } | null {
  const kalip = new RegExp(`create\\s+policy\\s+"?${ad}"?\\s+on\\s+(?:"?public"?\\.)?"?admin_audit_log"?`, 'gi')
  let son: { dosya: string; govde: string } | null = null
  for (const [dosya, ham] of Object.entries(dosyalar)) {
    const sql = sqlYorumsuz(ham)
    for (const m of sql.matchAll(kalip)) {
      const bitis = sql.indexOf(';', m.index ?? 0)
      son = { dosya, govde: sql.slice(m.index ?? 0, bitis > 0 ? bitis : undefined) }
    }
  }
  return son
}

/** IN (...) içindeki rol literalleri. */
function rolListesi(govde: string): string[] {
  const m = /role\s+in\s*\(([^)]*)\)/i.exec(govde)
  return m ? [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : []
}

const DOSYALAR = tumMigrationlar()

describe('INV-OPS211-DB · ayıklayıcı sağlığı (sentetik)', () => {
  it('fonksiyon gövdesi ve rol listesi doğru ayıklanıyor; son tanım kazanıyor', () => {
    const sentetik = {
      '1.sql': "create or replace function public.f() returns int as $$ select 1 where up.role in ('a','b') $$;",
      '2.sql': "create or replace function public.f() returns int as $$ select 1 where up.role in ('a') $$;",
    }
    const g = sonFonksiyonGovdesi(sentetik, 'f')
    expect(g?.dosya).toBe('2.sql')
    expect(rolListesi(g?.govde ?? '')).toEqual(['a'])
  })

  it('bu migration gerçekten okunuyor (kapsam kanaryası)', () => {
    expect(Object.keys(DOSYALAR)).toContain(BU_MIGRATION)
  })
})

describe('Y4 · admin_list_all_users yalnız admin/super_admin', () => {
  it('son tanımın rol listesi tam olarak (admin, super_admin)', () => {
    const t = sonFonksiyonGovdesi(DOSYALAR, 'admin_list_all_users')
    expect(t, 'admin_list_all_users hiçbir migration\'da tanımlı değil — ayıklayıcı bozuk').not.toBeNull()
    expect(
      [...new Set(rolListesi(t?.govde ?? ''))].sort(),
      `admin_list_all_users (${t?.dosya}) tüm kullanıcıların e-posta/telefonunu döndürür; rol listesi ` +
        'yalnız admin ve super_admin olabilir (karne 2026-11 Y4, KVKK).',
    ).toEqual(['admin', 'super_admin'])
  })
})

describe('Y5 · enforce_role_change super_admin korumalı ve oturumlu değişikliği denetler', () => {
  const t = sonFonksiyonGovdesi(DOSYALAR, 'enforce_role_change')

  it('super_admin hedefi yalnız super_admin değiştirebilir', () => {
    expect(t).not.toBeNull()
    expect(
      /old\.role\s*=\s*'super_admin'\s+and\s+aktor\s+is\s+distinct\s+from\s+'super_admin'/i.test(t?.govde ?? ''),
      `enforce_role_change (${t?.dosya}): admin bir super_admin'i düşürebilir hâle geldi (karne Y5-a).`,
    ).toBe(true)
  })

  it('oturumlu dalda exception ile SARILMAMIŞ denetim yazımı var', () => {
    const govde = t?.govde ?? ''
    const oturumsuzSonu = govde.indexOf('select role into aktor')
    expect(oturumsuzSonu, 'aktör okuması bulunamadı — gövde biçimi değişti').toBeGreaterThan(0)
    const oturumlu = govde.slice(oturumsuzSonu)
    expect(
      /insert\s+into\s+public\.admin_audit_log/i.test(oturumlu),
      'oturumlu rol değişikliği admin_audit_log\'a yazmıyor (kural 11, karne Y5-b).',
    ).toBe(true)
    expect(
      /exception\s+when/i.test(oturumlu),
      'oturumlu denetim yazımı exception ile sarılmış — iz yazılamazsa değişiklik yine geçer (fail-open).',
    ).toBe(false)
  })
})

describe('K5 · admin_audit_log INSERT politikası actor = auth.uid() zorlar', () => {
  it('son tanım actor şartını taşıyor', () => {
    const p = sonPolitika(DOSYALAR, 'admin_audit_log_insert_v2')
    // Politika taban dökümünde tanımlı; migration zincirinde ilk kez bu migration'da yeniden yazılıyor.
    expect(p, 'admin_audit_log_insert_v2 hiçbir migration\'da yok').not.toBeNull()
    expect(
      /actor\s*=\s*\(?\s*select\s+auth\.uid\(\)\s*\)?|actor\s*=\s*auth\.uid\(\)/i.test(p?.govde ?? ''),
      `admin_audit_log_insert_v2 (${p?.dosya}) başkası adına iz yazmaya izin veriyor (karne K5).`,
    ).toBe(true)
  })
})

describe('Geri alma', () => {
  it('geri alma dosyası var ve üç nesnenin üçüne de dokunuyor', () => {
    expect(existsSync(GERI_ALMA)).toBe(true)
    const sql = readFileSync(GERI_ALMA, 'utf8')
    expect(sql).toMatch(/function public\.admin_list_all_users\(\)/)
    expect(sql).toMatch(/function public\.enforce_role_change\(\)/)
    expect(sql).toMatch(/policy "admin_audit_log_insert_v2"/)
  })
})
