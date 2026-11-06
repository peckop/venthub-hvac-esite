// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { Client } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-YETKI-PG-1 · güvenlik karnesi 2026-11 Y4 / Y5-b / K5 — üç kilit davranış GERÇEK Postgres'te koşar (ALT-155).
 *
 * ⭐NİÇİN VAR: ALT-145 (20261104100000) ve ALT-136 (20261104110000) karnedeki Y4, Y5 ve K5 maddelerini kapattı, ama CI'da
 * bu kapıların davranışını bir veritabanında KOŞTURAN test yoktu; yalnız migration METNİNİ okuyan testler vardı. Metin
 * okuyan test "listede moderator yok" der, "moderator çağırınca fonksiyon hata verir" demez. Bu dosya iki migration'ı
 * OLDUĞU GİBİ boş bir Postgres'e uygular ve şunları gerçek rollerle dener:
 *   Y4)   `admin_list_all_users()` moderator ile çağrılınca 'not authorized'; admin ve super_admin geçer.
 *   Y5)   (a) admin bir super_admin satırının rolünü düşüremez; (b) oturumlu rol değişikliği `admin_audit_log`a satır
 *         bırakır ve FAIL-CLOSED'dur (iz yazılamazsa rol değişikliği de düşer; oturumsuz service_role dalı ise bilerek yutar).
 *   K5)   authenticated admin, `actor` başkası ya da NULL iken `admin_audit_log`a yazamaz; `actor` kendisi iken yazar.
 *
 * ⭐ZİNCİRİN SON TANIMI: ikisi de sırayla, damga sırasıyla uygulanır (ALT145 sonra ALT136). `admin_list_all_users` iki
 * migration'da da tanımlı; geçerli olan SONUNCUSUDUR (alt136, kiracı süzgeçli). Tek dosya uygulansaydı test, prod'da
 * artık geçerli olmayan gövdeyi ölçerdi. 'son tanım alt136' bir test ile ayrıca kilitli (profilsiz satır listelenmez).
 *
 * ⭐ÖLÇÜ DUYARLILIĞI (before-proof): aynı sondalar TABAN (2026-11-03, migration ÖNCESİ) üzerinde de koşar ve taban AÇIK
 * çıkar (moderator listeler, actor sahteciliği geçer, oturumlu rol değişikliği iz bırakmaz). Böylece testin açığı
 * gerçekten GÖREBİLDİĞİ bu dosyanın içinde kanıtlıdır; "yeşil" bir şeyi ölçmemekten gelmiyor.
 *
 * NEREDEN GELİR: migration'lar OLDUĞU GİBİ uygulanır. Migration'ın DAYANDIĞI ön-durum (user_profiles, admin_audit_log ve
 * RLS politikaları, jwt_tenant_id, is_admin_user, enforce_role_change gövdesi, admin_list_all_users öncesi gövde) elle
 * yazılmaz: `supabase/baselines/2026-11-03_public_schema.sql` dosyasından ifade ifade ÇEKİLİR. Taban bilerek SABİT
 * dosya adıdır: alt145'in ön-durumu budur (taban alt135'i içerir, alt145'i içermez); daha yeni bir taban alt145'in etkisini
 * içereceğinden 'öncesi' kolu anlamsızlaşırdı. Çekilen ifade bulunamazsa test AÇIKÇA düşer (sessiz boş kurulum yok).
 *
 * KOŞUM: `VENTHUB_TEST_PG_URL` bir Postgres sunucusunu gösterir. Test URL'deki veritabanına YAZMAZ: önce orada
 * user_profiles / admin_audit_log / auth şeması YOKTUR diye doğrular (varsa hiçbir şey yazmadan düşer), sonra iki
 * GEÇİCİ veritabanı açar (öncesi / sonrası), işi bitince `drop database ... with (force)` ile siler. Geçici veritabanı
 * seçimi bilerek: aynı sunucuda `siparis-monoton-tetik-pg.test.ts` de koşar ve ikisi sabit adlı nesneler (auth şeması,
 * varsayılan yetkiler) kurar; ayrı veritabanı sıra bağımlılığını ve artık nesneyi ortadan kaldırır. CREATEDB yetkisi
 * gerekir (CI'daki `postgres` süper kullanıcısında vardır). CI: `.github/workflows/siparis-tetik-pg.yml` (ikinci adım),
 * `VENTHUB_TEST_PG_ZORUNLU=1`. Normal paketde (adres yok) kol ATLANIR ve atlandığı görünür; ATLANMIŞ KOL YEŞİL DEĞİLDİR.
 * Yerelde:
 *   VENTHUB_TEST_PG_URL=postgres://postgres:postgres@localhost:5432/postgres VENTHUB_TEST_PG_ZORUNLU=1 \
 *     pnpm exec vitest run src/__tests__/conformance/yetki-davranis-pg.test.ts
 *
 * ⚠SINIRLAR (ölçmediği): (1) Supabase taklidi: `auth.uid()`/`auth.role()` Supabase'in gerçek tanımıyla aynı biçimde
 * `request.jwt.claims` okur, ama PostgREST, GoTrue ve erişim jetonu kancası (user_role claim'ini üreten) yoktur; claim'i
 * test koyar. (2) `user_profiles` üzerinde RLS BİLEREK kapalıdır: Y5 sondaları tetiği ölçer, RLS'in önce engellemesini
 * değil (prod'da tabloda RLS açık ve UPDATE politikası admin'e izin verir, yani güncelleme tetiğe ulaşır). (3) Roller
 * (anon, authenticated, service_role) kümeye yoksa burada oluşturulur; Supabase'in ek rolleri (supabase_auth_admin
 * vb.) yoktur. (4) Prod'daki ACL (EXECUTE) bu testte ölçülmez; o INV-AUTH-DEFINER-ANON-1'in işidir. (5) CI sunucusu
 * postgres:16'dır; yerelde başka sürüm koşabilir, test yalnız SQLSTATE kodu ve migration'ın kendi iletisine bakar.
 */

const KOK = path.resolve(__dirname, '../../..')
const MIGRASYONLAR = path.join(KOK, 'supabase/migrations')
const OLCUM = path.join(KOK, 'scripts/db/alt155-canli-uygulama-olcum.sql')
const TABAN = path.join(KOK, 'supabase/baselines/2026-11-03_public_schema.sql')
const ALT145 = '20261104100000_alt145_yetki_y4_y5b_k5.sql'
const ALT136 = '20261104110000_alt136_definer_kiraci_kapisi.sql'
/** Uygulama sırası = damga sırası (supabase-migrate.yml defteri böyle uygular). */
const ZINCIR = [ALT145, ALT136]
/** enforce_role_change gövdesinin tabana girdiği son migration (alt135) — bundan sonrakiler 'taban sonrası' sayılır. */
const TABAN_SON_DAMGA = '20261103140000'

const URL_ = (process.env.VENTHUB_TEST_PG_URL ?? '').trim()
const ZORUNLU = process.env.VENTHUB_TEST_PG_ZORUNLU === '1'

const VARSAYILAN_KIRACI = 'd3b07384-d113-495f-a558-8c38634e0000'
const DIGER_KIRACI = '11111111-1111-4111-8111-111111111111'
const ID = {
  super1: '00000000-0000-4000-8000-000000000001',
  super2: '00000000-0000-4000-8000-000000000002',
  admin: '00000000-0000-4000-8000-000000000003',
  moderator: '00000000-0000-4000-8000-000000000004',
  kullanici: '00000000-0000-4000-8000-000000000005',
  digerKiraci: '00000000-0000-4000-8000-000000000006',
  profilsiz: '00000000-0000-4000-8000-000000000007',
}

type Kim = { rol: 'authenticated' | 'service_role'; sub?: string; userRole?: string; kiraci?: string }
type PgHata = { kod: string; mesaj: string }
type Yakalanan<T> = { veri: T; hata: null } | { veri: null; hata: PgHata }

const ADMIN: Kim = { rol: 'authenticated', sub: ID.admin, userRole: 'admin' }
const MODERATOR: Kim = { rol: 'authenticated', sub: ID.moderator, userRole: 'moderator' }
const SUPER1: Kim = { rol: 'authenticated', sub: ID.super1, userRole: 'super_admin' }
const SERVICE: Kim = { rol: 'service_role' }

// ───────────────────────────── taban ifadelerini çekme ─────────────────────────────

function tabandanBlok(taban: string, bas: string, bitis: string): string {
  const i = taban.indexOf(bas)
  if (i < 0) throw new Error(`taban beklenen ifadeyi icermiyor: ${bas}`)
  const j = taban.indexOf(bitis, i)
  if (j < 0) throw new Error(`taban blogu kapanmiyor: ${bas}`)
  return taban.slice(i, j + bitis.length)
}

/** Ön-durum kurulumu: Supabase taklidi (roller, auth) + tabandan çekilen nesneler. Migration'lar BURADA YOK. */
function kurulumSql(): string {
  const taban = fs.readFileSync(TABAN, 'utf8').replace(/\r/g, '')
  const fonksiyon = (ad: string) => tabandanBlok(taban, `CREATE OR REPLACE FUNCTION "public"."${ad}"(`, '\n$$;')
  const tablo = (ad: string) => tabandanBlok(taban, `CREATE TABLE IF NOT EXISTS "public"."${ad}" (`, '\n);')
  const ifade = (bas: string) => tabandanBlok(taban, bas, ';\n')
  return `
do $r$ begin
  begin create role anon nologin; exception when duplicate_object or unique_violation then null; end;
  begin create role authenticated nologin; exception when duplicate_object or unique_violation then null; end;
  begin create role service_role nologin bypassrls; exception when duplicate_object or unique_violation then null; end;
end $r$;
create schema auth;
grant usage on schema auth, public to anon, authenticated, service_role;
create function auth.uid() returns uuid language sql stable as
$$ select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
                   (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'))::uuid $$;
create function auth.role() returns text language sql stable as
$$ select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''),
                   (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')) $$;
grant execute on function auth.uid(), auth.role() to anon, authenticated, service_role;
create table auth.users (
  id uuid primary key, email text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
${fonksiyon('jwt_tenant_id')}
${tablo('user_profiles')}
${tablo('admin_audit_log')}
alter table public.user_profiles add constraint user_profiles_pkey primary key (id);
alter table public.admin_audit_log add constraint admin_audit_log_pkey primary key (id);
grant all on public.user_profiles, public.admin_audit_log to authenticated, service_role;
${fonksiyon('is_admin_user')}
${fonksiyon('enforce_role_change')}
${ifade('CREATE OR REPLACE TRIGGER "trg_enforce_role_change"')}
${fonksiyon('admin_list_all_users')}
alter table public.admin_audit_log enable row level security;
${ifade('CREATE POLICY "admin_audit_log_insert_v2"')}
${ifade('CREATE POLICY "admin_audit_log_select_v2"')}
${ifade('CREATE POLICY "admin_audit_log_service_role"')}
`
}

/** Tohum veri: oturumsuz ayrıcalıklı yazım yalnız service_role bağlamında geçer (trigger kuralı), claim'i oturum düzeyinde veririz. */
const TOHUM_SQL = `
select set_config('request.jwt.claims', '{"role":"service_role"}', false);
insert into auth.users (id, email) values
  ('${ID.super1}', 'super1@ornek.test'), ('${ID.super2}', 'super2@ornek.test'), ('${ID.admin}', 'admin@ornek.test'),
  ('${ID.moderator}', 'moderator@ornek.test'), ('${ID.kullanici}', 'kullanici@ornek.test'),
  ('${ID.digerKiraci}', 'diger@ornek.test'), ('${ID.profilsiz}', 'profilsiz@ornek.test');
insert into public.user_profiles (id, role) values ('${ID.super1}', 'super_admin'), ('${ID.super2}', 'super_admin');
insert into public.user_profiles (id, role) values ('${ID.admin}', 'admin'), ('${ID.moderator}', 'moderator'), ('${ID.kullanici}', 'user');
insert into public.user_profiles (id, role, tenant_id) values ('${ID.digerKiraci}', 'user', '${DIGER_KIRACI}');
select set_config('request.jwt.claims', '', false);
`

// ───────────────────────────── yardımcılar ─────────────────────────────

async function yakala<T>(f: () => Promise<T>): Promise<Yakalanan<T>> {
  try {
    return { veri: await f(), hata: null }
  } catch (e) {
    const x = e as { code?: string; message?: string }
    return { veri: null, hata: { kod: x.code ?? 'bilinmiyor', mesaj: x.message ?? String(e) } }
  }
}

/** Beklenen HATA gelmediyse (sorgu geçtiyse) açık bir iletiyle düşer; "undefined içermez" gibi okunaksız kırmızı üretmez. */
function hataMesaji(s: Yakalanan<unknown>, etiket: string): string {
  expect(s.hata, `${etiket}: hata BEKLENIYORDU ama sorgu GECTI`).not.toBeNull()
  return s.hata?.mesaj ?? ''
}
function hataKodu(s: Yakalanan<unknown>, etiket: string): string {
  expect(s.hata, `${etiket}: hata BEKLENIYORDU ama sorgu GECTI`).not.toBeNull()
  return s.hata?.kod ?? ''
}

/** Her deneme tek işlemdir ve GERİ ALINIR (kalıcı veri bırakmaz). */
async function islem<T>(c: Client, f: () => Promise<T>): Promise<T> {
  await c.query('begin')
  try {
    return await f()
  } finally {
    await c.query('rollback')
  }
}

/** İstemci kimliği: PostgREST'in yaptığı gibi `request.jwt.claims` + postgres rolü (işlem yerel). */
async function kimlikKur(c: Client, k: Kim): Promise<void> {
  const claims: Record<string, unknown> = { role: k.rol }
  if (k.sub) claims.sub = k.sub
  if (k.userRole) claims.user_role = k.userRole
  if (k.kiraci) claims.app_metadata = { tenant_id: k.kiraci }
  await c.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify(claims)])
  await c.query(`set local role ${k.rol}`)
}

async function listele(c: Client, k: Kim): Promise<Yakalanan<string[]>> {
  return islem(c, async () => {
    await kimlikKur(c, k)
    return yakala(async () => (await c.query<{ id: string }>('select id from public.admin_list_all_users()')).rows.map((r) => r.id))
  })
}

/** `actor`: uuid | null (açıkça NULL) | 'varsayilan' (sütun hiç verilmez, varsayılan auth.uid() dolar). Başarıda yazılan actor'u döner. */
async function denetimYaz(c: Client, k: Kim, actor: string | null, kiraci = VARSAYILAN_KIRACI): Promise<Yakalanan<string | null>> {
  return islem(c, async () => {
    await kimlikKur(c, k)
    const r = await yakala(() =>
      actor === 'varsayilan'
        ? c.query("insert into public.admin_audit_log (table_name, action, tenant_id) values ('sonda', 'sonda', $1)", [kiraci])
        : c.query("insert into public.admin_audit_log (actor, table_name, action, tenant_id) values ($1, 'sonda', 'sonda', $2)", [actor, kiraci]),
    )
    if (r.hata) return { veri: null, hata: r.hata }
    await c.query('reset role')
    const yazilan = await c.query<{ actor: string | null }>("select actor from public.admin_audit_log where table_name = 'sonda'")
    return { veri: yazilan.rows[0]?.actor ?? null, hata: null }
  })
}

async function rolOku(c: Client, id: string): Promise<string> {
  const r = await c.query<{ role: string }>('select role from public.user_profiles where id = $1', [id])
  return r.rows[0].role
}

/** Denetim satırı: bu hedef için 'role_change%' eylemleri. Süper kullanıcı olarak okunur (RLS select politikası admin ister). */
async function rolIzleri(c: Client, hedef: string) {
  const r = await c.query<{ actor: string | null; table_name: string; action: string; before: unknown; after: unknown; tenant_id: string }>(
    "select actor, table_name, action, before, after, tenant_id from public.admin_audit_log where row_pk = $1 and action like 'role_change%' order by at",
    [hedef],
  )
  return r.rows
}

// ───────────────────────────── koşum koşulu (veritabanı gerekmeyen kapılar) ─────────────────────────────

describe('INV-YETKI-PG-1 · koşum koşulu', () => {
  it('ZORUNLU kipte veritabanı adresi VAR (yokluk "temiz" değil, "ölçülemedi"dir)', () => {
    if (ZORUNLU) expect(URL_, 'VENTHUB_TEST_PG_URL yok — yetki davranisi OLCULEMEDI').not.toBe('')
  })

  it('migration dosyaları ve taban var; zincir damga sırasında', () => {
    for (const ad of ZINCIR) expect(fs.existsSync(path.join(MIGRASYONLAR, ad)), `${ad} tasindi ya da silindi`).toBe(true)
    expect(fs.existsSync(TABAN), 'taban 2026-11-03 silindi: alt145 on-durumu kayboldu').toBe(true)
    expect(ZINCIR, 'zincir damga sirasinda degil (supabase-migrate.yml damga sirasiyla uygular)').toEqual([...ZINCIR].sort())
  })

  it('canlı ölçüm sorgusu SALT OKUMA: tek ifade, with/select ile başlar, yazma/DDL/kilit sözcüğü yok', () => {
    const govde = fs
      .readFileSync(OLCUM, 'utf8')
      .replace(/\r/g, '')
      .replace(/--.*$/gm, '') // satır yorumları
      .replace(/\$(\w*)\$[\s\S]*?\$\1\$/g, "''") // dolar-tırnaklı dizgeler
      .replace(/'(?:[^']|'')*'/g, "''") // tırnaklı dizgeler (içerikleri sözcük sayılmaz)
    expect(govde.trim(), 'sorgu with/select ile baslamali').toMatch(/^(?:with|select)\b/i)
    expect((govde.match(/;/g) ?? []).length, 'tek ifade olmali (yalniz sondaki ;)').toBe(1)
    expect(govde).not.toMatch(/\b(?:insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|vacuum|call|do|set|reset|execute|lock|refresh|reindex|notify|listen|comment|merge|into)\b/i)
  })

  it('zincir kapısı: bu nesneleri yeniden tanımlayan, zincire EKLENMEMİŞ daha yeni migration yok', () => {
    // Niçin: 'zincirdeki SON tanım' iddiası, sonradan eklenen bir migration admin_list_all_users / enforce_role_change /
    // admin_audit_log_insert_v2'yi yeniden tanımlarsa sessizce bayatlar (test eski gövdeyi ölçerdi). #2217 vakası tam
    // buydu: daha eski damgalı bir dosya daha yeni bir korumayı canlıda silecekti. Yeni migration eklenirse ZINCIR'e girer.
    const desenler: [RegExp, string][] = [
      [/(?:create\s+(?:or\s+replace\s+)?|alter\s+|drop\s+)function\s+"?public"?\."?(?:admin_list_all_users|enforce_role_change)\b/i, 'admin_list_all_users/enforce_role_change fonksiyonu'],
      [/(?:create|alter|drop)\s+policy\s+"?admin_audit_log_insert_v2"?/i, 'admin_audit_log_insert_v2 politikası'],
      [/(?:drop\s+trigger[^;]*|disable\s+trigger\s+)"?trg_enforce_role_change"?/i, 'trg_enforce_role_change tetiği'],
    ]
    const ihlal: string[] = []
    for (const ad of fs.readdirSync(MIGRASYONLAR).sort()) {
      if (!ad.endsWith('.sql') || ad.slice(0, 14) <= TABAN_SON_DAMGA || ZINCIR.includes(ad)) continue
      const metin = fs.readFileSync(path.join(MIGRASYONLAR, ad), 'utf8').replace(/\r/g, '')
      for (const [desen, etiket] of desenler) if (desen.test(metin)) ihlal.push(`${ad}: ${etiket}`)
    }
    expect(ihlal, 'bu migration ZINCIR listesine eklenmeli (ve test yeniden ölçülmeli)').toEqual([])
  })
})

// ───────────────────────────── gerçek Postgres ─────────────────────────────

describe.skipIf(!URL_)('INV-YETKI-PG-1 · Y4 / Y5-b / K5 gerçek Postgres\'te (karne)', () => {
  let yonetim: Client
  let once: Client
  let sonra: Client
  const acilanlar: string[] = []

  function urlDb(ad: string): string {
    const u = new URL(URL_)
    u.pathname = `/${ad}`
    return u.toString()
  }

  async function veritabaniAc(ad: string, zincir: boolean): Promise<Client> {
    await yonetim.query(`create database "${ad}"`)
    acilanlar.push(ad)
    const c = new Client({ connectionString: urlDb(ad) })
    await c.connect()
    await c.query(kurulumSql())
    await c.query(TOHUM_SQL)
    if (zincir) {
      // Migration'lar OLDUĞU GİBİ, damga sırasıyla (kendi begin/commit ve set'leri dahil).
      for (const dosya of ZINCIR) await c.query(fs.readFileSync(path.join(MIGRASYONLAR, dosya), 'utf8'))
      await c.query('reset statement_timeout; reset lock_timeout')
    }
    return c
  }

  beforeAll(async () => {
    yonetim = new Client({ connectionString: URL_ })
    await yonetim.connect()
    const k = await yonetim.query<{ a: string | null; b: string | null; c: boolean }>(
      "select to_regclass('public.user_profiles')::text as a, to_regclass('public.admin_audit_log')::text as b, exists (select 1 from pg_namespace where nspname = 'auth') as c",
    )
    const { a, b, c } = k.rows[0]
    if (a || b || c) {
      throw new Error('VENTHUB_TEST_PG_URL gercek bir veritabanina benziyor (user_profiles / admin_audit_log / auth var): hicbir sey yazilmadi')
    }
    const son = `${Date.now().toString(36)}_${process.pid}`
    once = await veritabaniAc(`vh_yetki_once_${son}`, false)
    sonra = await veritabaniAc(`vh_yetki_sonra_${son}`, true)
  }, 60_000)

  afterAll(async () => {
    await once?.end().catch(() => undefined)
    await sonra?.end().catch(() => undefined)
    for (const ad of acilanlar) await yonetim?.query(`drop database if exists "${ad}" with (force)`).catch(() => undefined)
    await yonetim?.end().catch(() => undefined)
  }, 60_000)

  describe('ölçü duyarlılığı · TABAN (migration öncesi) açığı gösterir', () => {
    it('taban: moderator admin_list_all_users() çağırabilir (Y4 açığı)', async () => {
      const s = await listele(once, MODERATOR)
      expect(s.hata).toBeNull()
      expect(s.veri?.length).toBeGreaterThan(0)
    })

    it('taban: admin başkası adına denetim satırı yazabilir (K5 açığı)', async () => {
      const s = await denetimYaz(once, ADMIN, ID.kullanici)
      expect(s.hata).toBeNull()
      expect(s.veri).toBe(ID.kullanici)
    })

    it('taban: oturumlu rol değişikliği iz BIRAKMAZ (Y5-b açığı)', async () => {
      const iz = await islem(once, async () => {
        await kimlikKur(once, ADMIN)
        await once.query("update public.user_profiles set role = 'moderator' where id = $1", [ID.kullanici])
        await once.query('reset role')
        return rolIzleri(once, ID.kullanici)
      })
      expect(iz).toEqual([])
    })
  })

  describe('Y4 · admin_list_all_users rol kapısı (zincirin SON tanımı)', () => {
    it('moderator çağırınca "not authorized" hatası alır', async () => {
      const s = await listele(sonra, MODERATOR)
      expect(hataMesaji(s, 'moderator')).toContain('not authorized')
      expect(s.hata?.kod).toBe('P0001')
    })

    it('rolsüz kullanıcı ve profili olmayan kimlik de reddedilir (kapı yalnız moderator\'ü değil herkesi süzer)', async () => {
      for (const sub of [ID.kullanici, ID.digerKiraci, ID.profilsiz]) {
        const s = await listele(sonra, { rol: 'authenticated', sub, userRole: 'user' })
        expect(hataMesaji(s, sub), sub).toContain('not authorized')
      }
    })

    it('admin ve super_admin geçer ve liste döner', async () => {
      for (const k of [ADMIN, SUPER1]) {
        const s = await listele(sonra, k)
        expect(s.hata, k.userRole).toBeNull()
        expect(s.veri?.length, k.userRole).toBeGreaterThan(0)
      }
    })

    it('SON tanım ALT-136: başka kiracının profili ve profilsiz auth.users satırı listelenmez', async () => {
      const s = await listele(sonra, ADMIN)
      expect([...(s.veri ?? [])].sort()).toEqual([ID.super1, ID.super2, ID.admin, ID.moderator, ID.kullanici].sort())
    })
  })

  describe('Y5 · enforce_role_change (oturumlu yol)', () => {
    it('(a) admin bir super_admin satırının rolünü "user" yapamaz; satır değişmez', async () => {
      const s = await islem(sonra, async () => {
        await kimlikKur(sonra, ADMIN)
        await sonra.query('savepoint sp')
        const h = await yakala(() => sonra.query("update public.user_profiles set role = 'user' where id = $1", [ID.super1]))
        await sonra.query('rollback to savepoint sp')
        await sonra.query('reset role')
        return { h, rol: await rolOku(sonra, ID.super1) }
      })
      expect(hataMesaji(s.h, 'admin -> super_admin satiri')).toContain('only super_admin can change a super_admin role')
      expect(s.rol).toBe('super_admin')
    })

    it('(a) moderator da super_admin satırını düşüremez', async () => {
      const s = await islem(sonra, async () => {
        await kimlikKur(sonra, MODERATOR)
        return yakala(() => sonra.query("update public.user_profiles set role = 'admin' where id = $1", [ID.super1]))
      })
      expect(hataMesaji(s, 'moderator -> super_admin satiri')).toContain('only super_admin can change a super_admin role')
    })

    it('kontrol: super_admin başka bir super_admini düşürebilir (kural "kimse" değil "yalnız super_admin" der)', async () => {
      const s = await islem(sonra, async () => {
        await kimlikKur(sonra, SUPER1)
        return yakala(() => sonra.query("update public.user_profiles set role = 'admin' where id = $1", [ID.super2]))
      })
      expect(s.hata).toBeNull()
    })

    it('kontrol: SON super_admin service_role ile bile düşürülemez (alt135 (b), alt145 sonrası yürürlükte)', async () => {
      const s = await islem(sonra, async () => {
        await kimlikKur(sonra, SERVICE)
        await sonra.query("update public.user_profiles set role = 'admin' where id = $1", [ID.super2]) // super1 kalır
        await sonra.query('savepoint sp')
        const h = await yakala(() => sonra.query("update public.user_profiles set role = 'admin' where id = $1", [ID.super1]))
        await sonra.query('rollback to savepoint sp')
        return h
      })
      expect(hataMesaji(s, 'son super_admin')).toContain('son super_admin dusurulemez')
    })

    it('Y5-b: oturumlu rol değişikliği TAM bir denetim satırı bırakır (actor, eylem, önce/sonra, kiracı)', async () => {
      const iz = await islem(sonra, async () => {
        await kimlikKur(sonra, ADMIN)
        await sonra.query("update public.user_profiles set role = 'moderator' where id = $1", [ID.kullanici])
        await sonra.query('reset role')
        return rolIzleri(sonra, ID.kullanici)
      })
      expect(iz).toEqual([
        {
          actor: ID.admin,
          table_name: 'user_profiles',
          action: 'role_change',
          before: { role: 'user' },
          after: { role: 'moderator' },
          tenant_id: VARSAYILAN_KIRACI,
        },
      ])
    })

    it('Y5-b FAIL-CLOSED: denetim satırı yazılamazsa oturumlu rol değişikliği de düşer (hata yutulmaz, rol aynı kalır)', async () => {
      const s = await islem(sonra, async () => {
        // Denetim yazımını zorla düşür: 'role_change%' eylemini reddeden bir kısıt (işlem içinde, geri alınır).
        await sonra.query("alter table public.admin_audit_log add constraint sonda_iz_dusur check (action not like 'role_change%')")
        await kimlikKur(sonra, ADMIN)
        await sonra.query('savepoint sp')
        const h = await yakala(() => sonra.query("update public.user_profiles set role = 'moderator' where id = $1", [ID.kullanici]))
        await sonra.query('rollback to savepoint sp')
        await sonra.query('reset role')
        return { h, rol: await rolOku(sonra, ID.kullanici) }
      })
      expect(hataKodu(s.h, 'iz yazilamadi, rol degisti')).toBe('23514')
      expect(s.rol).toBe('user')
    })

    it('kontrol (zıt tasarım): oturumsuz service_role dalı denetim düşse de rol değişikliğini YUTAR, geçer', async () => {
      const s = await islem(sonra, async () => {
        await sonra.query("alter table public.admin_audit_log add constraint sonda_iz_dusur check (action not like 'role_change%')")
        await kimlikKur(sonra, SERVICE)
        const h = await yakala(() => sonra.query("update public.user_profiles set role = 'admin' where id = $1", [ID.kullanici]))
        await sonra.query('reset role')
        return { h, rol: await rolOku(sonra, ID.kullanici) }
      })
      expect(s.h.hata).toBeNull()
      expect(s.rol).toBe('admin')
    })
  })

  describe('K5 · admin_audit_log INSERT politikası actor şartı', () => {
    it('admin actor = kendi kimliği iken yazar', async () => {
      const s = await denetimYaz(sonra, ADMIN, ID.admin)
      expect(s.hata).toBeNull()
      expect(s.veri).toBe(ID.admin)
    })

    it('admin actor = başka kullanıcı iken RLS reddi (42501): iz sahteciliği yok', async () => {
      for (const baskasi of [ID.kullanici, ID.moderator, ID.super1]) {
        const s = await denetimYaz(sonra, ADMIN, baskasi)
        expect(hataKodu(s, `actor=${baskasi}`), baskasi).toBe('42501')
      }
    })

    it('admin actor = NULL (açıkça) iken RLS reddi', async () => {
      const s = await denetimYaz(sonra, ADMIN, null)
      expect(hataKodu(s, 'actor=NULL')).toBe('42501')
    })

    it('actor hiç verilmezse sütun varsayılanı auth.uid() doldurur ve yazım geçer (normal istemci yolu)', async () => {
      const s = await denetimYaz(sonra, ADMIN, 'varsayilan')
      expect(s.hata).toBeNull()
      expect(s.veri).toBe(ID.admin)
    })

    it('kontrol: admin olmayan authenticated, actor kendisi olsa da reddedilir; başka kiracıya yazım da reddedilir', async () => {
      const yonetici = await denetimYaz(sonra, MODERATOR, ID.moderator)
      expect(hataKodu(yonetici, 'admin olmayan')).toBe('42501')
      const kiraci = await denetimYaz(sonra, ADMIN, ID.admin, DIGER_KIRACI)
      expect(hataKodu(kiraci, 'baska kiraci')).toBe('42501')
    })
  })

  describe('canlı ölçüm sorgusu (scripts/db/alt155-canli-uygulama-olcum.sql) iki yönde doğru hüküm verir', () => {
    type Satir = { kontrol: string; beklenen: string; gercek: string | null; tamam: boolean | null }
    /** Sorguyu verilen defter içeriğiyle koşar (supabase-migrate.yml'in yazdığı biçim: basename + .sql). Geri alınır. */
    async function olc(c: Client, defter: string[]): Promise<Satir[]> {
      return islem(c, async () => {
        await c.query('create table public._migration_ledger (name text primary key, applied_at timestamptz not null default now())')
        for (const ad of defter) await c.query('insert into public._migration_ledger (name) values ($1)', [ad])
        return (await c.query<Satir>(fs.readFileSync(OLCUM, 'utf8'))).rows
      })
    }
    const alt = (satirlar: Satir[], on: string) => satirlar.filter((s) => s.kontrol.startsWith(on))

    it('migration uygulanmış DB + defter: alt145 ve alt136 hüküm satırlarının HEPSİ tamam', async () => {
      const s = await olc(sonra, ZINCIR)
      for (const on of ['alt145 · ', 'alt136 · ']) {
        const hukum = alt(s, on)
        expect(hukum.length, on).toBeGreaterThanOrEqual(5)
        expect(hukum.filter((x) => x.tamam !== true).map((x) => `${x.kontrol} -> ${x.gercek}`), on).toEqual([])
      }
      expect(s.map((x) => x.kontrol).sort()).toEqual([...new Set(s.map((x) => x.kontrol))].sort()) // kontrol başlıkları tekil
    })

    it('migration ÖNCESİ taban + boş defter: alt145 ve alt136 hüküm satırlarının HİÇBİRİ tamam değil; OZET false', async () => {
      const s = await olc(once, [])
      for (const on of ['alt145 · ', 'alt136 · ']) {
        const tamamOlan = alt(s, on).filter((x) => x.tamam !== false)
        expect(tamamOlan.map((x) => `${x.kontrol} -> ${x.gercek}`), `${on}: taban/öncesi hiçbir satır tamam sayılmamalı`).toEqual([])
      }
      expect(s.find((x) => x.kontrol.startsWith('OZET'))?.tamam).toBe(false)
    })

    it('defter kaydı yok ama gövdeler yeni: yalnız defter satırları false (iki kanıt birbirini doğrular)', async () => {
      const s = await olc(sonra, [])
      const defterSatirlari = s.filter((x) => x.kontrol.includes('defter kaydı'))
      expect(defterSatirlari).toHaveLength(3)
      expect(defterSatirlari.every((x) => x.tamam === false)).toBe(true)
      expect(alt(s, 'alt145 · ').filter((x) => !x.kontrol.includes('defter kaydı')).every((x) => x.tamam === true)).toBe(true)
    })

    it('hüküm taşımayan BİLGİ satırları tamam=NULL', async () => {
      const s = await olc(sonra, ZINCIR)
      expect(s.filter((x) => x.kontrol.startsWith('bilgi ·')).map((x) => x.tamam)).toEqual([null, null, null])
    })
  })
})
