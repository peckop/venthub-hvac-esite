// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-ALT145-1 — yetki sıkılaştırması Y4 + Y5-b + K5 (ALT-145; #2217'nin yerine geçen migration).
 *
 * ⭐NİÇİN VAR: #2217 aynı üç açığı kapatıyordu ama (1) damgası alt135'ten ESKİYDİ, defter modeli onu alt135'ten
 * SONRA uygulardı ve (2) enforce_role_change'i 11-01 tabanından yazıyordu: alt135'in "son super_admin düşürülemez"
 * korumasını (danışma kilidi) canlıda silerdi. Bu kapı o iki hatanın geri gelmesini ölçer: damga sırası, alt135
 * korumalarının varlığı, gövdenin alt135 gövdesine eklemeden başka bir şey yapmadığı.
 *
 * ⭐NİÇİN METİN KOLU: CI'da veritabanı yok. Bu test migration METNİNİN kararı taşıdığını ölçer; tetiğin gerçekten
 * reddetmesi ve politikanın gerçekten satır kestiği DAVRANIŞ olarak burada ölçülmez (yerel Postgres kanıtı
 * ayrıca gerekir). "Yeşil kapı kendi başına kanıt değildir": aşağıdaki sabotaj kolları, kasıtlı bozuk kopyada
 * kapının KIRMIZI verdiğini ölçer.
 *
 * Kapsam sınırı (adıyla): Y5-a ve super_admin'e yükseltme kuralı alt135'te; bu test onları yalnız "silinmedi"
 * olarak ölçer, yeniden tanımlamaz.
 */
const KOK = process.cwd()
const MIG_DIZIN = path.join(KOK, 'supabase', 'migrations')
const GERI_DIZIN = path.join(KOK, 'scripts', 'db', 'rollback')
const TABAN_YOLU = path.join(KOK, 'supabase', 'baselines', '2026-11-03_public_schema.sql')

const MIG_SONEK = '_alt145_yetki_y4_y5b_k5.sql'
const GERI_SONEK = '_alt145_yetki_y4_y5b_k5_geri_al.sql'
const ALT135_SONEK = '_alt135_definer_yetki_sikilastirma.sql'

const oku = (p: string): string => fs.readFileSync(p, 'utf8').replace(/\r/g, '')

const migAdlari = fs.readdirSync(MIG_DIZIN)
const adaylar = migAdlari.filter((f) => f.endsWith(MIG_SONEK))
const alt135Adaylar = migAdlari.filter((f) => f.endsWith(ALT135_SONEK))
const geriAdaylar = fs.existsSync(GERI_DIZIN) ? fs.readdirSync(GERI_DIZIN).filter((f) => f.endsWith(GERI_SONEK)) : []

const MIG = adaylar.length === 1 ? oku(path.join(MIG_DIZIN, adaylar[0])) : ''
const MIG135 = alt135Adaylar.length === 1 ? oku(path.join(MIG_DIZIN, alt135Adaylar[0])) : ''
const GERI = geriAdaylar.length === 1 ? oku(path.join(GERI_DIZIN, geriAdaylar[0])) : ''
const TABAN = oku(TABAN_YOLU)

/** Yorumları siler, tırnaklı tanımlayıcıları açar, küçük harfe indirir, boşlukları tekler. */
function normalize(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--[^\n]*/g, '')
    .replace(/"([a-z_][a-z0-9_]*)"/gi, '$1')
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

interface Fonksiyon {
  baslik: string
  govde: string
}

/** İlk `function [public.]<ad>()` tanımının başlığı (gövdeden önce) ve gövdesi ($$ ... $$), normalize. */
function fonksiyon(sql: string, ad: string): Fonksiyon | null {
  const n = normalize(sql)
  const bas = n.search(new RegExp(`function (?:public\\.)?${ad}\\(\\)`))
  if (bas < 0) return null
  const a = n.indexOf('$$', bas)
  const b = n.indexOf('$$', a + 2)
  if (a < 0 || b < 0) return null
  return { baslik: n.slice(bas, a).replace(/^function (?:public\.)?/, ''), govde: n.slice(a + 2, b) }
}

// alt135 testindeki kalıplarla AYNI (koruma blokları): normalize edilmiş gövdeden ayıklanır.
const BLOK_B =
  /if tg_op = 'update' and old\.role = 'super_admin' and new\.role is distinct from 'super_admin' then perform pg_advisory_xact_lock\([^;]*\); if not exists \(.*?\) then raise exception [^;]*; end if; end if;/
const BLOK_A =
  /if tg_op = 'update' and old\.role = 'super_admin' and aktor is distinct from 'super_admin' then raise exception [^;]*; end if;/
const YUKSELTME = /if new\.role = 'super_admin' and aktor is distinct from 'super_admin' then raise exception [^;]*; end if;/

/** Oturumlu dalın denetim insert'ü: action ifadesi `'role_insert' else 'role_change'` (service_role dalınınki `_service_role` son ekli). */
const OTURUMLU_IZ =
  /insert into public\.admin_audit_log \(([^)]*)\) values \([^;]*?'role_insert' else 'role_change' end[^;]*\); ?/
const KOLON_LISTESI = /insert into public\.admin_audit_log \(([^)]*)\)/

const damgaOf = (ad: string): string => ad.slice(0, 14)

/** Defter sırası: bu migration alt135'ten SONRA uygulanmalı (#2217'nin birinci hatası). */
function siraIhlalleri(ad145: string, ad135: string): string[] {
  const h: string[] = []
  if (!/^\d{14}_/.test(ad145)) h.push('damga 14 haneli değil (INV-MIGRATION-2)')
  if (!(damgaOf(ad145) > damgaOf(ad135))) h.push(`damga alt135'ten (${damgaOf(ad135)}) sonra değil: ${damgaOf(ad145)}`)
  return h
}

/** begin; sonra lock_timeout ve statement_timeout, ilk DDL'den önce; commit; ile biter (Squawk INV-MIGRATION-3). */
function zamanSiniriIhlalleri(sql: string): string[] {
  const n = normalize(sql)
  const h: string[] = []
  const bas = n.indexOf('begin;')
  const lk = n.indexOf("set lock_timeout = '1s';")
  const st = n.indexOf("set statement_timeout = '5s';")
  const ddl = n.search(/create or replace function|alter policy/)
  if (bas < 0) h.push('begin; yok')
  if (lk < 0 || (bas >= 0 && lk < bas)) h.push("begin;'den sonra set lock_timeout = '1s' yok")
  if (st < 0 || (bas >= 0 && st < bas)) h.push("begin;'den sonra set statement_timeout = '5s' yok")
  if (ddl >= 0 && ((lk >= 0 && lk > ddl) || (st >= 0 && st > ddl))) h.push('zaman sınırları ilk DDL ifadesinden SONRA')
  if (!n.trim().endsWith('commit;')) h.push('commit; ile bitmiyor')
  return h
}

/** Y4: admin_list_all_users rol kapısı yalnız admin + super_admin; gövde tabandan YALNIZ rol listesiyle ayrışır. */
function y4Ihlalleri(sql: string): string[] {
  const f = fonksiyon(sql, 'admin_list_all_users')
  const taban = fonksiyon(TABAN, 'admin_list_all_users')
  if (!f) return ['admin_list_all_users tanımı bulunamadı']
  if (!taban) return ['taban admin_list_all_users tanımı bulunamadı (test girdisi bozuk)']
  const h: string[] = []
  const liste = f.govde.match(/up\.role in \(([^)]*)\)/)
  if (!liste) {
    h.push('rol kapısı (up.role in (...)) bulunamadı')
  } else {
    const roller = liste[1].split(',').map((r) => r.trim().replace(/'/g, '')).sort()
    if (roller.includes('moderator')) h.push('moderator rol listesinde')
    if (roller.join(',') !== 'admin,super_admin') h.push(`rol listesi beklenenden farklı: ${roller.join(',')}`)
  }
  const beklenen = taban.govde.replace(/(up\.role in \()[^)]*(\))/, "$1'admin','super_admin'$2")
  if (f.govde !== beklenen) h.push('gövde tabandan rol listesi dışında ayrışıyor')
  if (f.baslik !== taban.baslik) h.push('başlık (imza, security definer, search_path) tabandan ayrışıyor')
  return h
}

/** Y5-b + alt135 korumaları: gövde = alt135 gövdesi + yalnız oturumlu denetim insert'ü, fail-closed. */
function y5bIhlalleri(sql: string): string[] {
  const f = fonksiyon(sql, 'enforce_role_change')
  const ref = fonksiyon(MIG135, 'enforce_role_change')
  if (!f) return ['enforce_role_change tanımı bulunamadı']
  if (!ref) return ['alt135 enforce_role_change tanımı bulunamadı (test girdisi bozuk)']
  const h: string[] = []
  // alt135 korumaları SİLİNMEMİŞ olmalı (#2217'nin ikinci hatası)
  if (!BLOK_B.test(f.govde)) h.push('alt135 (b) son super_admin bloğu yok')
  if (!f.govde.includes('perform pg_advisory_xact_lock(hashtextextended(')) h.push('alt135 danışma kilidi (pg_advisory_xact_lock) yok')
  if (!BLOK_A.test(f.govde)) h.push('alt135 (a) super_admin satırını yalnız super_admin değiştirir bloğu yok')
  if (!YUKSELTME.test(f.govde)) h.push('alt135 super_admin yükseltme kuralı yok')
  // Y5-b: oturumlu rol değişikliği tam bir iz bırakır
  const iz = f.govde.match(OTURUMLU_IZ)
  if (!iz) {
    h.push('oturumlu rol değişikliği admin_audit_log insert\'ü yok')
  } else {
    const aktorSecimi = f.govde.indexOf('select role into aktor')
    const sonKapi = f.govde.indexOf("can grant super_admin'")
    const yer = f.govde.indexOf(iz[0])
    if (yer < aktorSecimi || yer < sonKapi) h.push('denetim insert\'ü oturumlu kapıların ÖNCESİNDE (reddedilen değişiklik de iz bırakırdı)')
    const ilk = f.govde.match(KOLON_LISTESI)
    const oturumsuz = ilk ? ilk[1] : ''
    if (iz[1] !== oturumsuz) h.push(`sütun kümesi oturumsuz daldakiyle aynı değil: (${iz[1]}) ≠ (${oturumsuz})`)
    // gövde alt135 gövdesine yalnız bu insert'ü ekler
    if (f.govde.replace(iz[0], '') !== ref.govde) h.push('gövde, alt135 gövdesine bu insert dışında bir şey ekliyor/siliyor')
  }
  // fail-closed: oturumlu dalda exception guard yok
  const oturumluDal = f.govde.slice(Math.max(0, f.govde.indexOf('select role into aktor')))
  if (/exception when/.test(oturumluDal)) h.push('oturumlu dalda exception guard var (fail-open)')
  if (f.baslik !== ref.baslik) h.push('başlık (security definer, search_path) alt135 ile ayrışıyor')
  return h
}

/** K5: admin_audit_log_insert_v2 WITH CHECK'i actor = (select auth.uid()) taşır, diğer şartlar korunur, initplan biçimi. */
function k5Ihlalleri(sql: string): string[] {
  const n = normalize(sql)
  const m = n.match(/alter policy admin_audit_log_insert_v2 on public\.admin_audit_log with check \(([^;]*)\);/)
  if (!m) return ['admin_audit_log_insert_v2 için ALTER POLICY ... WITH CHECK ifadesi yok']
  const ifade = m[1]
  const h: string[] = []
  if (!ifade.includes('actor = (select auth.uid())')) h.push('actor = (select auth.uid()) şartı yok')
  if (!ifade.includes('tenant_id = public.jwt_tenant_id()')) h.push('kiracı şartı (tenant_id = public.jwt_tenant_id()) düşmüş')
  if (!ifade.includes('public.is_admin_user()')) h.push('admin şartı (public.is_admin_user()) düşmüş')
  const tum = ifade.match(/auth\.\w+\(\)/g) ?? []
  const tek = ifade.match(/\(\s*select\s+auth\.\w+\(\)\s*\)/g) ?? []
  if (tum.length !== tek.length) h.push('auth çağrısı alt sorguda tek başına değil (initplan biçimi bozuk)')
  return h
}

/** Geri alma: yalnız eklenenleri kaldırır; alt135 korumaları KALIR. */
function geriIhlalleri(sql: string): string[] {
  const h: string[] = []
  const f = fonksiyon(sql, 'enforce_role_change')
  const ref = fonksiyon(MIG135, 'enforce_role_change')
  const liste = fonksiyon(sql, 'admin_list_all_users')
  const taban = fonksiyon(TABAN, 'admin_list_all_users')
  if (!f || !ref) h.push('geri alma: enforce_role_change tanımı yok')
  else if (f.govde !== ref.govde || f.baslik !== ref.baslik) h.push('geri alma: enforce_role_change alt135 hâline BİREBİR dönmüyor (korumaları siler ya da iz bırakır)')
  if (!liste || !taban) h.push('geri alma: admin_list_all_users tanımı yok')
  else if (liste.govde !== taban.govde) h.push('geri alma: admin_list_all_users tabandaki (moderator\'lü) hâline dönmüyor')
  const n = normalize(sql)
  const m = n.match(/alter policy admin_audit_log_insert_v2 on public\.admin_audit_log with check \(([^;]*)\);/)
  if (!m) h.push('geri alma: politika geri alınmıyor')
  else if (m[1].includes('actor')) h.push('geri alma: politika hâlâ actor şartı taşıyor')
  h.push(...zamanSiniriIhlalleri(sql).map((x) => `geri alma: ${x}`))
  return h
}

describe('INV-ALT145-1 · girdiler ve defter sırası', () => {
  it('tek migration, tek geri alma, tek alt135 dosyası var; evren boş değil', () => {
    expect(adaylar).toHaveLength(1)
    expect(alt135Adaylar).toHaveLength(1)
    expect(geriAdaylar).toHaveLength(1)
    expect(MIG.length).toBeGreaterThan(2000)
    expect(MIG135.length).toBeGreaterThan(2000)
    expect(GERI.length).toBeGreaterThan(2000)
    expect(TABAN.length).toBeGreaterThan(100000)
  })

  it('damga alt135\'ten sonra ve 14 haneli', () => {
    expect(siraIhlalleri(adaylar[0], alt135Adaylar[0])).toEqual([])
  })

  it('geri alma dosyasının damgası migration ile aynı', () => {
    expect(geriAdaylar[0]).toBe(`${damgaOf(adaylar[0])}${GERI_SONEK}`)
  })

  it('begin; + lock_timeout + statement_timeout + commit; (Squawk)', () => {
    expect(zamanSiniriIhlalleri(MIG)).toEqual([])
  })

  it('taban, bu migration\'ın nedeni olan üç açığı taşıyor (girdi doğrulaması)', () => {
    const t = fonksiyon(TABAN, 'admin_list_all_users')
    expect(t?.govde).toContain("up.role in ('admin','moderator','super_admin','super_admin')")
    const n = normalize(TABAN)
    expect(n).toContain(
      'create policy admin_audit_log_insert_v2 on public.admin_audit_log for insert to authenticated with check (((tenant_id = public.jwt_tenant_id()) and public.is_admin_user()));',
    )
  })

  it('beklenen tek nesne kümesi: yalnız iki fonksiyon ve bir politika (Y5-a / yükseltme / GRANT / REVOKE tekrarı yok)', () => {
    const n = normalize(MIG)
    const ifadeler = n.replace(/\$\$.*?\$\$/g, '$$$$').split(';').map((s) => s.trim()).filter(Boolean)
    // Her ifadenin ilk beş sözcüğü: fazladan GRANT/REVOKE/DROP/CREATE POLICY ifadesi eklenirse liste bozulur.
    const kinds = ifadeler.map((s) => s.split(' ').slice(0, 5).join(' '))
    expect(kinds).toEqual([
      'begin',
      "set lock_timeout = '1s'",
      "set statement_timeout = '5s'",
      'create or replace function public.admin_list_all_users()',
      'create or replace function public.enforce_role_change()',
      'alter policy admin_audit_log_insert_v2 on public.admin_audit_log',
      'commit',
    ])
  })
})

describe('INV-ALT145-1 · Y4 admin_list_all_users', () => {
  it('rol listesi yalnız admin + super_admin; gövde tabandan yalnız o satırla ayrışır', () => {
    expect(y4Ihlalleri(MIG)).toEqual([])
  })
})

describe('INV-ALT145-1 · Y5-b enforce_role_change (alt135 korumaları + oturumlu iz)', () => {
  it('alt135 korumaları duruyor, oturumlu denetim insert\'ü var ve fail-closed', () => {
    expect(y5bIhlalleri(MIG)).toEqual([])
  })

  it('alt135 dosyasının KENDİSİ de aynı korumaları taşıyor (referans girdisi sağlam)', () => {
    const ref = fonksiyon(MIG135, 'enforce_role_change')!
    expect(BLOK_B.test(ref.govde)).toBe(true)
    expect(BLOK_A.test(ref.govde)).toBe(true)
    expect(OTURUMLU_IZ.test(ref.govde)).toBe(false)
  })
})

describe('INV-ALT145-1 · K5 admin_audit_log_insert_v2', () => {
  it('actor şartı initplan biçiminde, diğer iki şart korunmuş', () => {
    expect(k5Ihlalleri(MIG)).toEqual([])
  })
})

describe('INV-ALT145-1 · geri alma yalnız eklenenleri kaldırır', () => {
  it('moderator geri gelir, enforce_role_change alt135 hâline BİREBİR döner, politika eski', () => {
    expect(geriIhlalleri(GERI)).toEqual([])
  })
})

describe('INV-ALT145-1 · sabotaj: kasıtlı bozuk kopyada kapı KIRMIZI', () => {
  const kilit = "perform pg_advisory_xact_lock(hashtextextended('user_profiles:super_admin_sayisi', 0));"

  it('alt135 danışma kilidi satırı silinince (#2217\'nin ikinci hatası)', () => {
    const bozuk = MIG.replace(kilit, '')
    expect(bozuk).not.toBe(MIG)
    expect(y5bIhlalleri(bozuk).join(' | ')).toMatch(/danışma kilidi|\(b\) son super_admin bloğu yok/)
  })

  it('"son super_admin" bloğunun koşulu etkisiz bırakılınca', () => {
    const bozuk = MIG.replace(
      "if tg_op = 'UPDATE' and old.role = 'super_admin' and new.role is distinct from 'super_admin' then",
      'if false then',
    )
    expect(bozuk).not.toBe(MIG)
    expect(y5bIhlalleri(bozuk).join(' | ')).toMatch(/\(b\) son super_admin bloğu yok/)
  })

  it('Y5-a (super_admin satırını yalnız super_admin değiştirir) bloğu silinince', () => {
    const bozuk = MIG.replace(
      "if tg_op = 'UPDATE' and old.role = 'super_admin' and aktor is distinct from 'super_admin' then",
      'if false then',
    )
    expect(bozuk).not.toBe(MIG)
    expect(y5bIhlalleri(bozuk).join(' | ')).toMatch(/\(a\) super_admin satırını/)
  })

  it('moderator rol listesine geri eklenince (Y4)', () => {
    const bozuk = MIG.replace("up.role IN ('admin','super_admin')", "up.role IN ('admin','moderator','super_admin')")
    expect(bozuk).not.toBe(MIG)
    expect(y4Ihlalleri(bozuk).join(' | ')).toMatch(/moderator rol listesinde/)
  })

  it('super_admin rol listesinden düşürülünce (Y4 aşırı sıkılaştırma)', () => {
    const bozuk = MIG.replace("up.role IN ('admin','super_admin')", "up.role IN ('admin')")
    expect(bozuk).not.toBe(MIG)
    expect(y4Ihlalleri(bozuk).join(' | ')).toMatch(/rol listesi beklenenden farklı/)
  })

  it('oturumlu denetim insert\'ü silinince (Y5-b)', () => {
    const bozuk = MIG.replace(/^ {2}insert into public\.admin_audit_log[\s\S]*?\);\n/m, '')
    expect(bozuk).not.toBe(MIG)
    expect(y5bIhlalleri(bozuk).join(' | ')).toMatch(/insert'ü yok/)
  })

  it('oturumlu denetim insert\'ü exception guard ile sarılınca (fail-open)', () => {
    const bozuk = MIG.replace(
      /^( {2}insert into public\.admin_audit_log[\s\S]*?\);\n)/m,
      "  begin\n$1  exception when others then raise warning 'iz yazilamadi';\n  end;\n",
    )
    expect(bozuk).not.toBe(MIG)
    expect(y5bIhlalleri(bozuk).join(' | ')).toMatch(/fail-open/)
  })

  it('oturumlu denetim insert\'ü kapılardan ÖNCEYE taşınınca', () => {
    const m = MIG.match(/^ {2}insert into public\.admin_audit_log[\s\S]*?\);\n/m)
    expect(m).not.toBeNull()
    const bozuk = MIG.replace(m![0], '').replace('  select role into aktor from', `${m![0]}  select role into aktor from`)
    expect(bozuk).not.toBe(MIG)
    expect(y5bIhlalleri(bozuk).join(' | ')).toMatch(/kapıların ÖNCESİNDE/)
  })

  it('actor şartı politikadan çıkarılınca (K5)', () => {
    const bozuk = MIG.replace(/\n\s+and actor = \(select auth\.uid\(\)\)/, '')
    expect(bozuk).not.toBe(MIG)
    expect(k5Ihlalleri(bozuk).join(' | ')).toMatch(/actor = \(select auth\.uid\(\)\) şartı yok/)
  })

  it('politikada çıplak auth.uid() kalınca (initplan biçimi)', () => {
    const bozuk = MIG.replace('and actor = (select auth.uid())', 'and actor = auth.uid()')
    expect(bozuk).not.toBe(MIG)
    expect(k5Ihlalleri(bozuk).join(' | ')).toMatch(/actor = \(select auth\.uid\(\)\) şartı yok|initplan/)
  })

  it('damga alt135\'ten ESKİ olunca (#2217\'nin birinci hatası)', () => {
    expect(siraIhlalleri('20261103090000_alt145_yetki_y4_y5b_k5.sql', alt135Adaylar[0]).join(' | ')).toMatch(/alt135'ten/)
  })

  it('8 haneli damga (INV-MIGRATION-2)', () => {
    expect(siraIhlalleri('20261104_alt145_yetki_y4_y5b_k5.sql', alt135Adaylar[0]).join(' | ')).toMatch(/14 haneli değil/)
  })

  it('lock_timeout satırı silinince (Squawk)', () => {
    const bozuk = MIG.replace("set lock_timeout = '1s';\n", '')
    expect(bozuk).not.toBe(MIG)
    expect(zamanSiniriIhlalleri(bozuk).join(' | ')).toMatch(/lock_timeout/)
  })

  it('geri alma alt135 korumasını silerse (11-01 gövdesine dönerse) kırmızı', () => {
    const bozuk = GERI.replace(kilit, '')
    expect(bozuk).not.toBe(GERI)
    expect(geriIhlalleri(bozuk).join(' | ')).toMatch(/alt135 hâline BİREBİR dönmüyor/)
  })

  it('geri alma politikaya actor şartını bırakırsa kırmızı', () => {
    const bozuk = GERI.replace('and public.is_admin_user()\n  );', 'and public.is_admin_user()\n    and actor = (select auth.uid())\n  );')
    expect(bozuk).not.toBe(GERI)
    expect(geriIhlalleri(bozuk).join(' | ')).toMatch(/actor şartı taşıyor/)
  })
})
