// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-ALT135-1 — Security Advisor sıkılaştırma migration'ı (ALT-135) ve süper admin koruma kuralı.
 *
 * ⭐NİÇİN METİN KOLU: CI'da veritabanı yok. Bu kapı migration METNİNİN kararı taşıdığını ve geri kaçmadığını ölçer;
 * DAVRANIŞ (tetiğin gerçekten reddetmesi, anon/authenticated yetkisi) yerel Postgres'te ayrıca koşturuldu:
 * scripts/db/alt135-yerel-kurulum.sql + alt135-yerel-sinama.sql (25 sınama; sıra dosya başlığında). Bu test
 * o sınamanın yerine GEÇMEZ; yalnız "kural satırı söküldü" sabotajını CI'da kırmızıya çevirir.
 */
const KOK = process.cwd()
const MIG_DIZIN = path.join(KOK, 'supabase', 'migrations')
const TABAN = path.join(KOK, 'supabase', 'baselines', '2026-11-01_public_schema.sql')

const adaylar = fs.readdirSync(MIG_DIZIN).filter((f) => f.endsWith('_alt135_definer_yetki_sikilastirma.sql'))
const MIG = adaylar.length === 1 ? fs.readFileSync(path.join(MIG_DIZIN, adaylar[0]), 'utf8') : ''

/** Yorumları siler, tırnaklı tanımlayıcıları açar, küçük harfe indirir, boşlukları tekler. */
function normalize(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--[^\n]*/g, '')
    .replace(/"([a-z_][a-z0-9_]*)"/gi, '$1')
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

const TETIK_YALNIZ = ['denetim_izi_yaz', 'notify_order_paid', 'notify_quote_request_created', 'set_order_number', 'stamp_order_paid_at']
const DENETIMLI: [string, string][] = [
  ['set_stock', 'uuid, integer, text'],
  ['set_stock', 'uuid, integer, text, uuid'],
  ['admin_resend_quote_published', 'uuid'],
  ['anonymize_user_personal_data', 'uuid, uuid, boolean'],
]
const TABLOLAR = ['order_number_counters', 'quote_number_counters', 'search_reindex_queue', 'url_takma_adlari']
const DOKUNULMAYAN = [
  'adjust_stock', 'set_user_admin_role', 'admin_list_all_users', 'admin_list_users', 'admin_publish_quote',
  'process_goods_receipt', 'process_order_stock_restore', 'satis_kipi_oku', 'submit_contact_message',
  'url_takma_ad_coz', 'url_takma_adlari_listele',
]

/** enforce_role_change gövdesinin ($$ ... $$ arası) normalize hâli. */
function rolGovdesi(sql: string): string {
  const n = normalize(sql)
  const bas = n.search(/function (?:public\.)?enforce_role_change\(\)/)
  if (bas < 0) return ''
  const a = n.indexOf('$$', bas)
  const b = n.indexOf('$$', a + 2)
  return a < 0 || b < 0 ? '' : n.slice(a + 2, b)
}

/** Kural (a) ve (b) blokları: normalize edilmiş gövdeden ayıklamak için kalıplar. */
const BLOK_B =
  /if tg_op = 'update' and old\.role = 'super_admin' and new\.role is distinct from 'super_admin' then perform pg_advisory_xact_lock\([^;]*\); if not exists \(.*?\) then raise exception [^;]*; end if; end if;/
const BLOK_A =
  /if tg_op = 'update' and old\.role = 'super_admin' and aktor is distinct from 'super_admin' then raise exception [^;]*; end if;/

/** Süper admin kuralının yapısını ölçer; ihlal listesi döner (boş = sağlam). */
function kuralIhlalleri(govde: string): string[] {
  const h: string[] = []
  if (!govde) return ['enforce_role_change gövdesi bulunamadı']
  const b = govde.match(BLOK_B)
  const a = govde.match(BLOK_A)
  if (!b) h.push('(b) son super_admin bloğu yok')
  if (!a) h.push('(a) super_admin satırını yalnız super_admin değiştirir bloğu yok')
  const oturumsuz = govde.indexOf('auth.uid() is null or')
  const aktorSecimi = govde.indexOf('select role into aktor')
  if (b && oturumsuz >= 0 && b.index! > oturumsuz) h.push('(b) oturumsuz/service_role dalından SONRA — o dal erken dönüyor, service_role kuralı atlar')
  const degismiyor = govde.indexOf('new.role is not distinct from old.role')
  if (b && degismiyor >= 0 && b.index! < degismiyor)
    h.push('(b) rol-değişmiyor erken dönüşünden ÖNCE — ad/telefon güncellemeleri de kilitlenir')
  if (a && aktorSecimi >= 0 && a.index! < aktorSecimi) h.push('(a) aktör rolü seçilmeden önce — aktor boş')
  if (b && !/pg_advisory_xact_lock/.test(b[0])) h.push('(b) eşzamanlı düşürme kilidi yok')
  if (b && !/up\.role = 'super_admin' and up\.id <> old\.id/.test(b[0])) h.push('(b) "başka super_admin var mı" sayımı yok')
  return h
}

describe('INV-ALT135-1 · migration dosyası', () => {
  it('tek migration dosyası var, 14 haneli damgalı', () => {
    expect(adaylar).toHaveLength(1)
    expect(adaylar[0]).toMatch(/^\d{14}_alt135_definer_yetki_sikilastirma\.sql$/)
  })

  const n = normalize(MIG)

  it.each(TETIK_YALNIZ)('yalnız-tetik %s(): PUBLIC/anon/authenticated EXECUTE alınır', (f) => {
    expect(n).toContain(`revoke execute on function public.${f}() from public, anon, authenticated;`)
  })

  it('stamp_order_paid_at search_path boş sabitlenir', () => {
    expect(n).toContain("alter function public.stamp_order_paid_at() set search_path = '';")
  })

  it.each(DENETIMLI)('denetimli %s(%s): istemci kapalı, service_role açık', (f, imza) => {
    expect(n).toContain(`revoke execute on function public.${f}(${imza}) from public, anon, authenticated;`)
    expect(n).toContain(`grant execute on function public.${f}(${imza}) to service_role;`)
  })

  it.each(TABLOLAR)('%s: RLS açık + RESTRICTIVE deny politikası + açıklama', (t) => {
    expect(n).toContain(`alter table public.${t} enable row level security;`)
    expect(n).toContain(
      `create policy ${t}_deny_all on public.${t} as restrictive for all to anon, authenticated using (false) with check (false);`,
    )
    expect(n).toMatch(new RegExp(`comment on table public\\.${t} is 'rls açık, istemci erişimi yok;`))
  })

  it('_migration_ledger: istemci yetkisi alınır + deny politikası', () => {
    expect(n).toContain('revoke all on table public._migration_ledger from anon, authenticated;')
    expect(n).toContain(
      'create policy _migration_ledger_deny_all on public._migration_ledger as restrictive for all to anon, authenticated using (false) with check (false);',
    )
  })

  it.each(DOKUNULMAYAN)('dokunulmayan %s: REVOKE/GRANT/ALTER/CREATE satırı yok', (f) => {
    const ad = `(?:public\\.)?${f}(?![a-z0-9_])`
    expect(n).not.toMatch(new RegExp(`\\b(?:revoke|grant)\\b[^;]*?\\bfunction ${ad}`))
    expect(n).not.toMatch(new RegExp(`\\balter function ${ad}`))
    expect(n).not.toMatch(new RegExp(`\\bcreate (?:or replace )?function ${ad}`))
  })

  it('PUBLIC dışında anon/authenticated\'a hiçbir GRANT eklenmez (yalnız service_role)', () => {
    for (const m of n.matchAll(/(?<=^|; )grant [^;]*;/g)) {
      expect(m[0], m[0]).toMatch(/\bto service_role;$/)
    }
  })
})

describe('INV-ALT135-1 · süper admin kuralı (enforce_role_change)', () => {
  const govde = rolGovdesi(MIG)

  it('gerçek migration kuralı sağlıyor', () => {
    expect(kuralIhlalleri(govde)).toEqual([])
  })

  it('mevcut gövde korunmuş: iki blok çıkarılınca 2026-11-01 tabanıyla birebir aynı', () => {
    const taban = rolGovdesi(fs.readFileSync(TABAN, 'utf8'))
    expect(taban.length).toBeGreaterThan(500)
    const sade = govde.replace(BLOK_B, '').replace(BLOK_A, '').replace(/\s+/g, ' ')
    expect(sade).toBe(taban)
  })

  it('tetik fonksiyonu SECURITY DEFINER ve search_path sabit kalır (başlık korunmuş)', () => {
    const n = normalize(MIG)
    const bas = n.search(/function public\.enforce_role_change\(\)/)
    const baslik = n.slice(bas, n.indexOf('$$', bas))
    expect(baslik).toContain('security definer')
    expect(baslik).toContain("set search_path to 'pg_catalog', 'public'")
  })

  describe('sabotaj: kural satırı sökülünce kırmızı', () => {
    const sabotajlar: [string, (s: string) => string, RegExp][] = [
      ['(b) bloğu tamamen söküldü', (s) => s.replace(BLOK_B, ''), /\(b\) son super_admin bloğu yok/],
      ['(a) bloğu tamamen söküldü', (s) => s.replace(BLOK_A, ''), /\(a\) super_admin satırını/],
      [
        '(b) koşulu etkisiz bırakıldı',
        (s) => s.replace("if tg_op = 'update' and old.role = 'super_admin' and new.role is distinct from 'super_admin' then", 'if false then'),
        /\(b\) son super_admin bloğu yok/,
      ],
      [
        '(a) koşulu etkisiz bırakıldı',
        (s) => s.replace("old.role = 'super_admin' and aktor is distinct from 'super_admin' then", 'false then'),
        /\(a\) super_admin satırını/,
      ],
      [
        '(b) service_role dalının ardına taşındı',
        (s) => {
          const blok = s.match(BLOK_B)![0]
          return s.replace(BLOK_B, '').replace('select role into aktor', `${blok} select role into aktor`)
        },
        /\(b\) oturumsuz\/service_role dalından SONRA/,
      ],
      ['(b) kilidi söküldü', (s) => s.replace(/perform pg_advisory_xact_lock\([^;]*\);/, ''), /\(b\) (?:son super_admin bloğu yok|eşzamanlı düşürme kilidi yok)/],
      ["(b) 'başka super_admin' sayımı bozuldu", (s) => s.replace('and up.id <> old.id', 'and true'), /\(b\) (?:son super_admin bloğu yok|"başka super_admin var mı" sayımı yok)/],
    ]
    it.each(sabotajlar)('%s', (_ad, boz, beklenen) => {
      const bozuk = boz(govde)
      expect(bozuk).not.toBe(govde)
      expect(kuralIhlalleri(bozuk).join(' | ')).toMatch(beklenen)
    })
  })
})
