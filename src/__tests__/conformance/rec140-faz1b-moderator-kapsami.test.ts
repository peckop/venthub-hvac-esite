/**
 * INV-REC140-FAZ1B — karar 95: moderatör maliyet ve tedarik tablolarını göremez
 *
 * CETVEL: `docs/plans/rec140-maliyet-kolonlari-kilidi-2026-09-24.md` §4 Faz 1b ·
 * `docs/standards/rls-yetki-karari-standard.md` §1 (rol kararı yalnız `is_admin_user()`) ·
 * `docs/standards/purchasing-standard.md` §8.1 (UI izni ⊆ DB izni).
 *
 * TEHDİT MODELİ: dört tablodaki (pricing_rule, purchase_orders, purchase_order_items,
 * suppliers) 16 politikadan biri sonradan satır içi `role = any(array[…,'moderator'])`
 * biçimine geri döner ya da rbac matrisi moderatöre satınalma yüzeyini geri verir; ikisi de
 * karar 95'i sessizce deler. Politikalar migration dosyalarında "son tanım kazanır"
 * kuralıyla okunur (CI bayt sırasıyla uygular).
 *
 * Parser sağlığı sentetik örnekle ölçülür; gerçek ihlalin varlığına bağlanmaz.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { canAccessPage, canViewCost, canWrite, type UserRole } from '@/lib/rbac'

const TABLOLAR = ['pricing_rule', 'purchase_orders', 'purchase_order_items', 'suppliers'] as const
const KOMUTLAR = ['select', 'insert', 'update', 'delete'] as const

const POLITIKALAR: readonly { tablo: string; ad: string }[] = TABLOLAR.flatMap((tablo) =>
  KOMUTLAR.map((komut) => ({ tablo, ad: `${tablo}_admin_${komut}` })),
)

const MIGRATION_KLASORU = join(process.cwd(), 'supabase', 'migrations')
const GERI_ALMA = join(
  process.cwd(),
  'scripts',
  'db',
  'geri-alma',
  '20261011140000_rec140_faz1b_moderator_kapsami.geri-al.sql',
)

function sqlYorumsuz(sql: string): string {
  return sql.replace(/--[^\r\n]*/g, '')
}

/** Verilen politikanın SON tanımını (dosya adı sırasına göre) döndürür; yoksa null. */
function sonTanim(dosyalar: Record<string, string>, ad: string): { dosya: string; govde: string } | null {
  const kalip = new RegExp(`create\\s+policy\\s+${ad}\\s+on\\s+public\\.`, 'i')
  const adaylar = Object.entries(dosyalar)
    .map(([dosya, sql]) => [dosya, sqlYorumsuz(sql)] as const)
    .filter(([, sql]) => kalip.test(sql))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  for (let i = adaylar.length - 1; i >= 0; i--) {
    const [dosya, sql] = adaylar[i]
    const bas = sql.search(kalip)
    const govde = sql.slice(bas, sql.indexOf(';', bas) + 1)
    if (govde.length > 0) return { dosya, govde }
  }
  return null
}

/** Karar 95 ihlallerini döndürür (boş dizi = temiz). */
function ihlaller(dosyalar: Record<string, string>): string[] {
  const sonuc: string[] = []
  for (const { ad } of POLITIKALAR) {
    const tanim = sonTanim(dosyalar, ad)
    if (!tanim) {
      sonuc.push(`${ad}: hiçbir migration'da tanımlı değil`)
      continue
    }
    if (/moderator/i.test(tanim.govde)) sonuc.push(`${ad}: moderator içeriyor (${tanim.dosya})`)
    if (!/is_admin_user\s*\(\s*\)/i.test(tanim.govde)) sonuc.push(`${ad}: is_admin_user() kararını kullanmıyor (${tanim.dosya})`)
    if (!/jwt_tenant_id\s*\(\s*\)/i.test(tanim.govde)) sonuc.push(`${ad}: tenant koşulu yok (${tanim.dosya})`)
  }
  return sonuc
}

function gercekMigrationlar(): Record<string, string> {
  const cikti: Record<string, string> = {}
  for (const ad of readdirSync(MIGRATION_KLASORU)) {
    if (!ad.endsWith('.sql')) continue
    cikti[ad] = readFileSync(join(MIGRATION_KLASORU, ad), 'utf8')
  }
  return cikti
}

describe('INV-REC140-FAZ1B — moderatör kapsamı', () => {
  it('parser sağlığı: eski biçim, yeni biçim ve geri dönüş ayırt ediliyor', () => {
    const eski =
      "create policy suppliers_admin_select on public.suppliers for select to authenticated " +
      "using (tenant_id = (select public.jwt_tenant_id()) and exists (select 1 from public.user_profiles up " +
      "where up.role::text = any (array['super_admin','admin','moderator'])));"
    const yeni =
      'create policy suppliers_admin_select on public.suppliers for select to authenticated ' +
      'using (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));'

    expect(sonTanim({ '20260101000000_a.sql': eski }, 'suppliers_admin_select')?.govde).toMatch(/moderator/)
    // Son tanım kazanır: yeni biçim eskisinin üstüne yazar.
    const ikisi = { '20260101000000_a.sql': eski, '20260201000000_b.sql': yeni }
    expect(sonTanim(ikisi, 'suppliers_admin_select')?.dosya).toBe('20260201000000_b.sql')
    // Dosya adı sırası ters ise eski kazanır (ayrıştırıcı sırayı gerçekten kullanıyor).
    const ters = { '20260301000000_a.sql': eski, '20260201000000_b.sql': yeni }
    expect(sonTanim(ters, 'suppliers_admin_select')?.dosya).toBe('20260301000000_a.sql')
    // Yorum satırındaki "create policy" son tanım sayılmaz.
    const yorumlu = { '20260401000000_c.sql': `-- create policy suppliers_admin_select on public.suppliers ...\nselect 1;` }
    expect(sonTanim(yorumlu, 'suppliers_admin_select')).toBeNull()
  })

  it('sabotaj: bir politika moderatöre geri açılırsa ihlal listesi dolar', () => {
    const migrationlar = gercekMigrationlar()
    const dosyaAdi = '20261011140000_rec140_faz1b_moderator_kapsami.sql'
    const gercek = migrationlar[dosyaAdi]
    expect(gercek, `${dosyaAdi} bulunamadı`).toBeTruthy()

    const bozuk = gercek.replace(
      /(create policy suppliers_admin_select[\s\S]*?)\(select public\.is_admin_user\(\)\)/i,
      "$1exists (select 1 from public.user_profiles up where up.role::text = any (array['admin','moderator']))",
    )
    expect(bozuk).not.toBe(gercek)
    const ihlal = ihlaller({ ...migrationlar, [dosyaAdi]: bozuk })
    expect(ihlal.some((s) => s.startsWith('suppliers_admin_select') && s.includes('moderator'))).toBe(true)
    expect(ihlal.some((s) => s.startsWith('suppliers_admin_select') && s.includes('is_admin_user'))).toBe(true)
  })

  it('16 politikanın hepsi is_admin_user() ve tenant koşuluyla tanımlı, hiçbirinde moderator yok', () => {
    expect(POLITIKALAR).toHaveLength(16)
    expect(ihlaller(gercekMigrationlar())).toEqual([])
  })

  it('geri alma betiği var ve eski politika gövdesini taşıyor', () => {
    expect(existsSync(GERI_ALMA), `${GERI_ALMA} yok`).toBe(true)
    const sql = readFileSync(GERI_ALMA, 'utf8')
    for (const { ad } of POLITIKALAR) {
      expect(sql, `${ad} geri alma betiğinde yok`).toMatch(new RegExp(`create policy ${ad} on public\\.`, 'i'))
    }
  })

  it('UI izni DB iznini aşmaz: moderatör satınalma sayfasını açamaz, yazamaz, maliyeti göremez', () => {
    const moderator: UserRole = 'moderator'
    expect(canAccessPage(moderator, '/admin/purchasing')).toBe(false)
    expect(canWrite(moderator, 'purchasing')).toBe(false)
    expect(canViewCost(moderator)).toBe(false)

    const gorebilenler: UserRole[] = (['super_admin', 'admin', 'moderator', 'warehouse', 'sales', 'viewer', 'user'] as UserRole[]).filter(
      (r) => canViewCost(r),
    )
    expect(gorebilenler).toEqual(['super_admin', 'admin'])
    expect(canViewCost(null)).toBe(false)
    expect(canViewCost(undefined)).toBe(false)
  })
})
