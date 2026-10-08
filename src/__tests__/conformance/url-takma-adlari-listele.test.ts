// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-TAKMA-AD-LISTE-1 — `public.url_takma_adlari_listele()` işlevinin sözleşmesi (ALT-37e, karar 310 = A).
 *
 * ⭐NİÇİN VAR: `url_takma_adlari` tablosu anon'a KAPALIDIR (eski slug'lar ürün adı taşır; 20260923083021, güvenlik
 * incelemesi bulgu 4). Eski adres haritası üreteci tabloyu service_role olmadan okuyabilsin diye karar 310 = A, tabloyu
 * AÇMAK yerine yalnız-okuma bir LİSTE işlevi ekledi. Bu işlev anon'a TAM liste verir; yani onu güvenli kılan ŞEYLER
 * tek tek bu kapıda durur: (1) gövdedeki kiracı süzgeci — sökülürse anon HER kiracının eski adreslerini okur (kural 12:
 * data bleeding), (2) tablonun kapalı kalışı — işlev açılırken tablo da açılmış olmasın, (3) PUBLIC'in kapalı olması —
 * açıksa kimlik doğrulaması bile gerekmez, (4) DEFINER + sabit search_path + STABLE + parametresiz + yalnız 5 kolon —
 * yazma yolu, arama yolu kaçırma ya da `sebep` (iç kimlikler) sızıntısı olmasın.
 *
 * KOLLAR
 *  A. STATİK SQL — migration zincirinin SON hâlini hesaplar (CI'da prod DB yok). Tanım, gövde, yetki, tablo.
 *  B. TİP DOSYASI — `database.types.ts` elle eklendi (canlıdan üretilemez: işlev henüz canlıda yok); dosya ile
 *     `returns table` kolonları ayrışırsa tipler yalan söyler.
 *  C. DAVRANIŞ (PGlite, bellek-içi PostgreSQL) — migration'ın KENDİ SQL'i iki kiracılı veride koşar: anon, service_role
 *     ve başka kiracının JWT'si için yalnız KENDİ kiracısının satırları döner; YABANCI KİRACI SATIRI DÖNERSE KIRMIZI.
 *  D. AYIRT EDİCİLİK — her kol, bilerek bozulmuş migration kopyasında KIRMIZI verir (vakumda yeşil yok).
 *
 * ⚠PGlite depoya bağımlılık OLARAK EKLİ DEĞİL (emsal: docs/audits/rec168-satis-kipi-golge-2026-09-29.mjs "Depoya
 * bağımlılık EKLENMEZ"). Kol C bu yüzden yüklenemezse ATLANIR ve atlandığı SÖYLENİR (vitest "skipped" sayar);
 * ATLANMIŞ KOL YEŞİL DEĞİLDİR. Yerelde koşturmak için PGlite'ı geçici bir klasöre kurup girişini verin:
 *   PGLITE_GIRIS=<klasör>/node_modules/@electric-sql/pglite/dist/index.js PGLITE_ZORUNLU=1 pnpm exec vitest run <bu dosya>
 * `PGLITE_ZORUNLU=1` iken PGlite yoksa kol KIRMIZI verir ("ölçemedim" ≠ "temiz"). Depoya devDependency eklenirse
 * (package.json + pnpm-lock.yaml) kol CI'da kendiliğinden koşar; bu dosyada değişiklik gerekmez.
 *
 * ⚠ÖLÇMEDİĞİ (ve ölçemeyeceği): canlıdaki GERÇEK `jwt_tenant_id()` (burada aynı mantıkta bir taklit var: claim yoksa
 * ya da app_metadata.tenant_id yoksa varsayılan kiracı), PostgREST/GET kipi, canlı ACL. Onları merge SONRASI OPS salt-okuma
 * ile ölçer (migration dosyasının sonundaki doğrulama satırları). Kiracı kimlikleri BURADA SAHTEDİR; gerçek kiracı
 * kimliği hiçbir test dosyasına yazılmaz.
 */
const KOK = process.cwd()
const MIG_DIZIN = path.join(KOK, 'supabase', 'migrations')
const TIP_DOSYASI = path.join(KOK, 'src', 'types', 'database.types.ts')

const FONK = 'url_takma_adlari_listele'
const TABLO = 'url_takma_adlari'
/** `returns table` kolonları, SIRASIYLA. `sebep` (iç kimlikler) ve `created_at` BİLEREK yok. */
const KOLONLAR = ['tenant_id uuid', 'tur text', 'dil text', 'eski_slug text', 'hedef_id uuid'] as const
const ACIK_ROLLER = ['anon', 'authenticated', 'service_role'] as const

type Mig = { ad: string; sql: string }

/** Yorumları siler, tırnaklı tanımlayıcıları açar, küçük harfe indirir, boşlukları tekler. */
function normalize(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--[^\n]*/g, '')
    .replace(/"([a-z_][a-z0-9_]*)"/gi, '$1')
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function gercekZincir(): Mig[] {
  return fs
    .readdirSync(MIG_DIZIN)
    .filter((a) => a.endsWith('.sql'))
    .sort()
    .map((ad) => ({ ad, sql: fs.readFileSync(path.join(MIG_DIZIN, ad), 'utf8') }))
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// KOL A · STATİK SQL
// ─────────────────────────────────────────────────────────────────────────────────────────────────

interface Tanim {
  /** İşlev adından `as $tag$`a kadar (normalize): `() returns table (...) language sql stable ...`. */
  baslik: string
  /** Dolar işaretleri arası (normalize). */
  govde: string
}

/** Zincirdeki SON `create [or replace] function ... url_takma_adlari_listele` tanımı. */
function sonTanim(zincir: Mig[]): Tanim | null {
  const desen = new RegExp(
    `create (?:or replace )?function (?:public\\.)?${FONK}(?![a-z0-9_])([\\s\\S]*?) as \\$(\\w*)\\$([\\s\\S]*?)\\$\\2\\$`,
    'g',
  )
  let son: Tanim | null = null
  for (const m of zincir) for (const e of normalize(m.sql).matchAll(desen)) son = { baslik: e[1], govde: e[3].trim() }
  return son
}

function fonksiyonHatalari(zincir: Mig[]): string[] {
  const t = sonTanim(zincir)
  if (!t) return ['(0) fonksiyon tanimi zincirde yok']
  const h: string[] = []
  const b = t.baslik
  const g = t.govde

  if (!/\bsecurity definer\b/.test(b) || /\bsecurity invoker\b/.test(b)) {
    h.push('(a) SECURITY DEFINER degil — tablo anon\'a kapali, okuma yalniz sahip yetkisiyle olabilir')
  }
  if (!/\bstable\b/.test(b) || /\b(volatile|immutable)\b/.test(b)) h.push('(b) STABLE degil — yalniz-okuma sozlesmesi')
  if (!/\blanguage sql\b/.test(b)) h.push('(c) language sql degil — tek SELECT sozlesmesi')
  if (!/\bset search_path (?:to|=) ('public', 'pg_temp'|'')(?: |$)/.test(b)) {
    h.push('(d) search_path sabit degil — DEFINER islevde arama yolu kacirilabilir')
  }
  if (!/^\s*\(\s*\)/.test(b)) h.push('(e) parametre var — islev kiraciyi JWT\'den cozer, parametre ALMAZ')
  const kolonlar = /returns table \((.*?)\) language/.exec(b)?.[1]?.split(',').map((s) => s.trim()) ?? []
  if (kolonlar.join(', ') !== KOLONLAR.join(', ')) {
    h.push(`(f) donus kolonlari [${kolonlar.join(', ')}] — beklenen [${KOLONLAR.join(', ')}] (sebep/created_at SIZMAZ)`)
  }

  if (!/^select\b/.test(g)) h.push('(g) govde SELECT ile baslamiyor — yalniz okuma')
  if (!new RegExp(`\\bfrom public\\.${TABLO}\\b`).test(g)) h.push(`(g) govde public.${TABLO} tablosunu okumuyor`)
  if (!/\btenant_id = (?:\(select )?public\.jwt_tenant_id\(\)\)?/.test(g)) {
    h.push('(h) kiraci suzgeci yok — anon baska kiracinin eski adreslerini (urun adi tasir) okur')
  }
  if (/\bor\b/.test(g)) h.push('(h) govdede OR var — kiraci suzgeci zayiflatilmis olabilir')
  if (/\b(insert|update|delete|truncate|merge|alter|drop|create|grant|revoke|copy|call|perform|execute)\b/.test(g)) {
    h.push('(i) govde yazma/DDL/kilit iceriyor — yalniz-okuma sozlesmesi')
  }
  if (!/\border by (?:t\.)?tur, (?:t\.)?dil, (?:t\.)?eski_slug\b/.test(g)) {
    h.push('(j) siralama yok — sayfali okuma (offset/limit) tekrar ve atlama uretir')
  }
  return h
}

/** Rol için ZİNCİR boyunca son EXECUTE olayı (yalnız bu işlevi hedefleyen GRANT/REVOKE). */
function sonYetki(zincir: Mig[], rol: string): 'grant' | 'revoke' | null {
  let son: 'grant' | 'revoke' | null = null
  const hedef = new RegExp(`\\bon function (?:public\\.)?${FONK}(?![a-z0-9_])`)
  const rolDes = new RegExp(`\\b(?:to|from) (?:[a-z_]+ ?, ?)*${rol}\\b`)
  for (const m of zincir) {
    for (const ifade of normalize(m.sql).split(';')) {
      if (!hedef.test(ifade) || !rolDes.test(ifade)) continue
      if (/^\s*grant (?:execute|all)/.test(ifade)) son = 'grant'
      else if (/^\s*revoke (?:execute|all)/.test(ifade)) son = 'revoke'
    }
  }
  return son
}

function yetkiHatalari(zincir: Mig[]): string[] {
  const h: string[] = []
  for (const rol of ACIK_ROLLER) {
    const son = sonYetki(zincir, rol)
    if (son !== 'grant') h.push(`(k) ${rol} icin ACIK grant yok (son olay: ${son ?? 'yok'}) — varsayilan yetkiye guvenilmez`)
  }
  const pub = sonYetki(zincir, 'public')
  if (pub !== 'revoke') h.push(`(k) PUBLIC icin son olay revoke degil (${pub ?? 'yok'}) — herkese acik: anahtar bile gerekmez`)
  return h
}

/**
 * Tablonun ZİNCİR sonundaki durumu: anon/authenticated/PUBLIC için tablo yetkisi, politika sayısı, RLS.
 * Başlangıç: Supabase varsayılan yetkileri yeni tabloya anon/authenticated için TAM yetki verir; PUBLIC'e vermez.
 * Yalnız tablonun doğumundan SONRAKİ olaylar sayılır (öncesindeki `grant ... on all tables` onu etkilemez).
 */
function tabloHatalari(zincir: Mig[]): string[] {
  const acik: Record<'anon' | 'authenticated' | 'public', boolean> = { anon: true, authenticated: true, public: false }
  let politika = 0
  let rls: boolean | null = null
  let dogdu = false
  const tabloAd = `(?:public\\.)?${TABLO}(?![a-z0-9_])`
  const olusturDes = new RegExp(`^\\s*create table (?:if not exists )?${tabloAd}`)
  const hedefDes = new RegExp(`\\bon (?:table )?${tabloAd}|\\bon all tables in schema public\\b`)
  const politikaDes = new RegExp(`^\\s*create policy .+? on ${tabloAd}`)
  const rlsAcDes = new RegExp(`^\\s*alter table (?:only )?${tabloAd} enable row level security`)
  const rlsKapaDes = new RegExp(`^\\s*alter table (?:only )?${tabloAd} (?:disable|no force) row level security`)
  for (const m of zincir) {
    for (const ifade of normalize(m.sql).split(';')) {
      if (olusturDes.test(ifade)) {
        dogdu = true
        continue
      }
      if (!dogdu) continue
      if (politikaDes.test(ifade)) politika++
      if (rlsAcDes.test(ifade)) rls = true
      if (rlsKapaDes.test(ifade)) rls = false
      if (!hedefDes.test(ifade)) continue
      const veriyor = /^\s*grant /.test(ifade)
      const aliyor = /^\s*revoke /.test(ifade)
      if (!veriyor && !aliyor) continue
      for (const rol of ['anon', 'authenticated', 'public'] as const) {
        const rolDes = new RegExp(`\\b(?:${veriyor ? 'to' : 'from'}) (?:[a-z_]+ ?, ?)*${rol}\\b`)
        if (rolDes.test(ifade)) acik[rol] = veriyor
      }
    }
  }
  const h: string[] = []
  if (!dogdu) h.push(`(l) ${TABLO} tablosunun dogumu zincirde yok — okuyucu kor`)
  for (const rol of ['anon', 'authenticated', 'public'] as const) {
    if (acik[rol]) h.push(`(l) ${TABLO} tablosu ${rol} icin ACIK — liste islevi tabloyu ACMAMALI`)
  }
  if (politika > 0) h.push(`(l) ${TABLO} uzerinde ${politika} politika var — karar 310: tablo kapali, okuma yalniz islevden`)
  if (rls !== true) h.push(`(l) ${TABLO} icin RLS son durumda acik degil (${String(rls)})`)
  return h
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// KOL B · TİP DOSYASI
// ─────────────────────────────────────────────────────────────────────────────────────────────────

function tipHatalari(tipMetni: string): string[] {
  const m = new RegExp(`\\b${FONK}: \\{\\s*Args: never\\s*Returns: \\{([\\s\\S]*?)\\}\\[\\]\\s*\\}`).exec(tipMetni)
  if (!m) return [`(t) tip dosyasinda ${FONK} yok ya da bicimi "Args: never / Returns: {...}[]" degil`]
  const alanlar = [...m[1].matchAll(/^\s*([a-z_]+): ([a-z]+)\s*$/gm)].map((x) => `${x[1]}: ${x[2]}`).sort()
  // uuid ve text, üretilmiş tiplerde `string` olur.
  const beklenen = KOLONLAR.map((k) => `${k.split(' ')[0]}: string`).sort()
  return alanlar.join(', ') === beklenen.join(', ')
    ? []
    : [`(t) tip dosyasi kolonlari [${alanlar.join(', ')}] — returns table'dan beklenen [${beklenen.join(', ')}]`]
}

/** A + B toplu. */
const statikHatalar = (zincir: Mig[], tipMetni: string): string[] => [
  ...fonksiyonHatalari(zincir),
  ...yetkiHatalari(zincir),
  ...tabloHatalari(zincir),
  ...tipHatalari(tipMetni),
]

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// KOL C · DAVRANIŞ (PGlite)
// ─────────────────────────────────────────────────────────────────────────────────────────────────

interface PgliteDb {
  exec(sql: string): Promise<unknown>
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>
  close(): Promise<void>
}
type PgliteKurucu = new () => PgliteDb

/** PGlite'ı yükler; yoksa null. Depoya bağımlılık ekli değil: `PGLITE_GIRIS` (dist/index.js) ya da paket adı. */
async function pgliteYukle(): Promise<PgliteKurucu | null> {
  const giris = (process.env.PGLITE_GIRIS ?? '').trim()
  try {
    // INV-KAPI-IMPORT-1 (kapi-import-guvenligi.test.ts): `await import(` sonrası ya TIRNAKLI belirteç ya da pathToFileURL/.href
    // olmalı; ham değişken yol YASAK. Paket adı bu yüzden LİTERAL yazılır. Paket yokken (depoda bağımlılık değil) dinamik
    // import çalışma anında reddedilir ve aşağıdaki catch null döndürür; Vite SSR eksik paketi Node'a bırakır, dosya düşmez.
    // `as string`: paket depoda YOK, çıplak literal tsc'de TS2307 verir (CI "Type check"); tür iddiası belirteci çözülmez yapar.
    const modul: unknown = giris
      ? await import(/* @vite-ignore */ pathToFileURL(giris).href)
      : await import(/* @vite-ignore */ '@electric-sql/pglite' as string)
    const kurucu = (modul as { PGlite?: unknown }).PGlite
    return typeof kurucu === 'function' ? (kurucu as PgliteKurucu) : null
  } catch {
    return null
  }
}

/** SAHTE kiracı kimlikleri: gerçek kiracı kimliği hiçbir dosyaya yazılmaz. */
const VARSAYILAN_K = '00000000-0000-4000-8000-0000000000d1'
const DIGER_K = '00000000-0000-4000-8000-0000000000d2'

const ROLLER_VE_JWT_SQL = `
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  -- Supabase varsayılanı: yeni public işleve/tabloya anon, authenticated, service_role yetkisi verilir.
  alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  -- jwt_tenant_id() TAKLİDİ (aynı mantık: claim yok / app_metadata.tenant_id yok / hata -> varsayılan kiracı).
  create function public.jwt_tenant_id() returns uuid language plpgsql set search_path to 'public', 'pg_catalog' as $f$
  declare claims_str text; kiraci text;
  begin
    claims_str := current_setting('request.jwt.claims', true);
    if claims_str is null or claims_str = '' then return '${VARSAYILAN_K}'::uuid; end if;
    kiraci := claims_str::jsonb -> 'app_metadata' ->> 'tenant_id';
    if kiraci is null or kiraci = '' then return '${VARSAYILAN_K}'::uuid; end if;
    return kiraci::uuid;
  exception when others then return '${VARSAYILAN_K}'::uuid;
  end;
  $f$;`

/** İki kiracılı tohum. Aynı (tur, dil, eski_slug) iki kiracıda da var; ekleme sırası bilerek sıralı DEĞİL. */
const TOHUM_SQL = `
  insert into public.url_takma_adlari (tenant_id, tur, dil, eski_slug, hedef_id, sebep) values
    ('${VARSAYILAN_K}', 'urun',     '*',  'b-eski-urun',  '00000000-0000-4000-8000-000000000a01', 'tohum: ic kimlik'),
    ('${DIGER_K}',      'urun',     '*',  'b-eski-urun',  '00000000-0000-4000-8000-000000000b01', 'baska kiraci'),
    ('${VARSAYILAN_K}', 'kategori', 'tr', 'c-eski-kat',   '00000000-0000-4000-8000-000000000a02', 'tetik: categories'),
    ('${DIGER_K}',      'sku',      '*',  'z-diger-sku',  '00000000-0000-4000-8000-000000000b02', 'baska kiraci'),
    ('${VARSAYILAN_K}', 'aile',     '*',  'a-eski-aile',  '00000000-0000-4000-8000-000000000a03', 'tetik: product_families'),
    ('${DIGER_K}',      'aile',     '*',  'z-diger-aile', '00000000-0000-4000-8000-000000000b03', 'baska kiraci');`

const VARSAYILAN_BEKLENEN = [
  `${VARSAYILAN_K}|aile|*|a-eski-aile`,
  `${VARSAYILAN_K}|kategori|tr|c-eski-kat`,
  `${VARSAYILAN_K}|urun|*|b-eski-urun`,
]
const DIGER_BEKLENEN = [
  `${DIGER_K}|aile|*|z-diger-aile`,
  `${DIGER_K}|sku|*|z-diger-sku`,
  `${DIGER_K}|urun|*|b-eski-urun`,
]

/** Zincirden tablonun doğum DDL'i: kopya değil, tek kaynak (migration değişirse test onu izler). */
function tabloDdlCikar(zincir: Mig[]): string[] | null {
  for (const m of zincir) {
    const olustur = /create table if not exists public\.url_takma_adlari \([\s\S]*?\n\);/i.exec(m.sql)
    if (!olustur) continue
    const rls = /alter table public\.url_takma_adlari enable row level security;/i.exec(m.sql)
    const iptal = /revoke all on table public\.url_takma_adlari from public, anon, authenticated;/i.exec(m.sql)
    if (rls && iptal) return [olustur[0], rls[0], iptal[0]]
  }
  return null
}

/** İşlevi getiren (zincirdeki SON) migration dosyası. */
function islevMigration(zincir: Mig[]): Mig | null {
  const desen = new RegExp(`create (?:or replace )?function (?:public\\.)?${FONK}(?![a-z0-9_])`, 'i')
  const bulunan = zincir.filter((m) => desen.test(normalize(m.sql)))
  return bulunan.length > 0 ? bulunan[bulunan.length - 1] : null
}

/** Migration'ın içindeki `do $$ ... $$;` GUARD bloğunu söker: davranış kolu guard'dan BAĞIMSIZ ölçsün diye. */
const guardsiz = (sql: string): string => sql.replace(/^do \$\$[\s\S]*?^\$\$;/im, '')

async function kurDb(Pglite: PgliteKurucu, tabloDdl: string[], migrationSql: string): Promise<PgliteDb> {
  const db = new Pglite()
  try {
    await db.exec(ROLLER_VE_JWT_SQL)
    for (const ddl of tabloDdl) await db.exec(ddl)
    await db.exec(TOHUM_SQL)
    await db.exec(migrationSql)
    return db
  } catch (e) {
    await db.close().catch(() => undefined)
    throw e
  }
}

type Sonuc = { ok: true; rows: Record<string, unknown>[] } | { ok: false; kod: string | undefined; mesaj: string }

/** `claims === null`: GUC'a DOKUNMA (hiç kurulmamış = NULL yolu). */
async function olarak(db: PgliteDb, rol: string, claims: string | null, sorgu: string): Promise<Sonuc> {
  await db.exec('reset role')
  if (claims !== null) await db.query(`select set_config('request.jwt.claims', $1, false)`, [claims])
  await db.exec(`set role ${rol}`)
  try {
    const r = await db.query(sorgu)
    return { ok: true, rows: r.rows }
  } catch (e) {
    const hata = e as { code?: string; message?: string }
    return { ok: false, kod: hata.code, mesaj: String(hata.message ?? e) }
  } finally {
    await db.exec('reset role')
  }
}

const anahtar = (r: Record<string, unknown>): string => `${String(r.tenant_id)}|${String(r.tur)}|${String(r.dil)}|${String(r.eski_slug)}`
const LISTE = 'select * from public.url_takma_adlari_listele()'

/**
 * Davranış ölçümü: iki kiracılı veride her rol/JWT için YALNIZ kendi kiracısının satırları, sıralı, 5 kolon;
 * tablo anon/authenticated'a kapalı. YABANCI KİRACI SATIRI DÖNERSE ayrı ve açık bir mesajla KIRMIZI.
 */
async function davranisHatalari(db: PgliteDb): Promise<string[]> {
  const h: string[] = []
  const senaryolar: Array<[string, string, string | null, string, string[]]> = [
    // GUC hiç kurulmadan ÖNCE koşar (NULL yolu); sonrakiler kendi claim'ini kurar.
    ['anon, claim YOK (NULL)', 'anon', null, VARSAYILAN_K, VARSAYILAN_BEKLENEN],
    ['anon, app_metadata yok', 'anon', '{"role":"anon"}', VARSAYILAN_K, VARSAYILAN_BEKLENEN],
    ['service_role, app_metadata yok', 'service_role', '{"role":"service_role"}', VARSAYILAN_K, VARSAYILAN_BEKLENEN],
    [
      'authenticated, BAŞKA kiracının JWT\'si',
      'authenticated',
      `{"role":"authenticated","app_metadata":{"tenant_id":"${DIGER_K}"}}`,
      DIGER_K,
      DIGER_BEKLENEN,
    ],
  ]
  for (const [ad, rol, claims, kiraci, beklenen] of senaryolar) {
    const s = await olarak(db, rol, claims, LISTE)
    if (!s.ok) {
      h.push(`(B) ${ad}: islev CAGRILAMADI (${s.kod ?? '?'}: ${s.mesaj})`)
      continue
    }
    const yabanci = s.rows.filter((r) => r.tenant_id !== kiraci)
    if (yabanci.length > 0) {
      h.push(`(B) ${ad}: YABANCI KIRACI SATIRI DONDU (${yabanci.length}): ${yabanci.map(anahtar).join(', ')}`)
    }
    const alinan = s.rows.map(anahtar)
    if (alinan.join(' ; ') !== beklenen.join(' ; ')) {
      h.push(`(B) ${ad}: satirlar [${alinan.join(' ; ')}] — beklenen (sirali) [${beklenen.join(' ; ')}]`)
    }
    const kolonlar = Object.keys(s.rows[0] ?? {}).join(',')
    if (s.rows.length > 0 && kolonlar !== 'tenant_id,tur,dil,eski_slug,hedef_id') {
      h.push(`(B) ${ad}: kolonlar ${kolonlar} — beklenen tenant_id,tur,dil,eski_slug,hedef_id`)
    }
  }
  for (const rol of ['anon', 'authenticated']) {
    const t = await olarak(db, rol, '{"role":"anon"}', `select count(*) from public.${TABLO}`)
    if (t.ok || t.kod !== '42501') h.push(`(B) ${rol}: tabloya DOGRUDAN SELECT 42501 vermedi (tablo acilmis)`)
  }
  return h
}

/** Uygulanmış tanımın katalog görünümü (statik kolun DB'deki karşılığı: volatile/parametre/PUBLIC burada da yakalanır). */
async function katalogHatalari(db: PgliteDb): Promise<string[]> {
  const h: string[] = []
  const k = (
    await db.query<{ prosecdef: boolean; provolatile: string; pronargs: number; proconfig: string[] | null; acl: string | null }>(
      `select p.prosecdef, p.provolatile, p.pronargs, p.proconfig, p.proacl::text as acl
         from pg_proc p where p.oid = 'public.${FONK}()'::regprocedure`,
    )
  ).rows[0]
  if (!k.prosecdef) h.push('(C) uygulanan islev SECURITY DEFINER degil')
  if (k.provolatile !== 's') h.push(`(C) uygulanan islev STABLE degil (${k.provolatile})`)
  if (k.pronargs !== 0) h.push(`(C) uygulanan islev ${k.pronargs} parametre aliyor`)
  if (!(k.proconfig ?? []).includes('search_path=public, pg_temp')) h.push(`(C) search_path sabit degil (${JSON.stringify(k.proconfig)})`)
  if (k.acl === null || /(^|[{,])=/.test(k.acl)) h.push(`(C) PUBLIC EXECUTE acik (acl: ${String(k.acl)})`)
  for (const rol of ACIK_ROLLER) {
    const v = (await db.query<{ v: boolean }>(`select has_function_privilege('${rol}', 'public.${FONK}()', 'EXECUTE') as v`)).rows[0].v
    if (!v) h.push(`(C) ${rol} EXECUTE yetkisi yok`)
  }
  for (const rol of ['anon', 'authenticated']) {
    const acilan = (
      await db.query<{ y: string }>(
        `select y from unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) y
          where has_table_privilege('${rol}', 'public.${TABLO}', y)`,
      )
    ).rows
    if (acilan.length > 0) h.push(`(C) ${rol} tabloda yetkili: ${acilan.map((a) => a.y).join(',')}`)
  }
  const politika = (await db.query<{ n: number }>(`select count(*)::int as n from pg_policies where tablename = '${TABLO}'`)).rows[0].n
  if (politika !== 0) h.push(`(C) tabloda ${politika} politika var`)
  const rls = (await db.query<{ v: boolean }>(`select relrowsecurity as v from pg_class where oid = 'public.${TABLO}'::regclass`)).rows[0].v
  if (!rls) h.push('(C) tabloda RLS kapali')
  return h
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// TESTLER
// ─────────────────────────────────────────────────────────────────────────────────────────────────

describe('INV-TAKMA-AD-LISTE-1 · url_takma_adlari_listele() sözleşmesi', () => {
  const zincir = gercekZincir()
  const tipMetni = fs.readFileSync(TIP_DOSYASI, 'utf8')
  const iyi = islevMigration(zincir)

  it('BOŞLUK MUHAFIZI — zincir, işlev migration\'ı ve tablo doğumu gerçekten okunuyor', () => {
    expect(zincir.length, 'migration okunamadi').toBeGreaterThan(50)
    expect(iyi, 'islevi getiren migration zincirde yok — okuyucu kor').not.toBeNull()
    expect(iyi?.ad, 'migration damgasi 14 hane degil (INV-MIGRATION-2)').toMatch(/^\d{14}_/)
    expect(sonTanim(zincir), 'islev tanimi ayristirilamadi').not.toBeNull()
    expect(tabloDdlCikar(zincir), 'tablo dogum DDL\'i zincirde bulunamadi').not.toBeNull()
    expect(sonYetki(zincir, 'anon'), 'yetki olaylari okunamiyor — okuyucu kor').not.toBeNull()
  })

  it('⭐A+B · gerçek zincir sözleşmeyi sağlıyor (tanım, gövde, yetki, tablo kapalı, tip dosyası)', () => {
    expect(statikHatalar(zincir, tipMetni)).toEqual([])
  })

  describe('D · AYIRT EDİCİLİK — statik kol her bozmada KIRMIZI (vakumda yeşil yok)', () => {
    /**
     * Zincirde işlev migration'ını bozulmuş metinle değiştirilmiş kopya. Bozma YORUMSUZ metne uygulanır: başlık
     * yorumları "SECURITY DEFINER", "STABLE", "order by" gibi aynı sözcükleri taşır ve ilk eşleşme yorumda kalırsa
     * mutasyon KODU değiştirmeden "yeşil" sanılırdı (ilk koşuda 5 vaka tam böyle etkisiz çıktı). Bozma HİÇBİR ŞEYİ
     * DEĞİŞTİRMEZSE test düşer.
     */
    const bozuk = (donustur: (s: string) => string): Mig[] => {
      expect(iyi, 'islev migration\'i bulunamadi').not.toBeNull()
      const kaynak = iyi as Mig
      const kod = kaynak.sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\n]*/g, '')
      const yeni = donustur(kod)
      expect(yeni, 'bozma metni DEGISTIRMEDI — mutasyon etkisiz, test hicbir sey olcmuyor').not.toBe(kod)
      return zincir.map((m) => (m.ad === kaynak.ad ? { ad: m.ad, sql: yeni } : m))
    }

    /** Tip dosyasında YALNIZ işlev bloğunu bozar (`tenant_id: string` tablo satır tiplerinde de geçer). */
    const tipIslevBlogu = (donustur: (blok: string) => string): string => {
      const i = tipMetni.indexOf(`${FONK}: {`)
      expect(i, 'tip dosyasinda islev blogu yok').toBeGreaterThanOrEqual(0)
      return tipMetni.slice(0, i) + donustur(tipMetni.slice(i))
    }

    it('taban (bozulmamış kopya) temiz — vakaların anlamlı olması için ön koşul', () => {
      expect(statikHatalar(zincir, tipMetni)).toEqual([])
    })

    const MUTASYONLAR: Array<[string, (s: string) => string, RegExp]> = [
      [
        'kiracı süzgeci kaldırıldı (where true)',
        (s) => s.replace(/where\s+t\.tenant_id\s*=\s*\(select public\.jwt_tenant_id\(\)\)/i, 'where true'),
        /\(h\) kiraci suzgeci yok/,
      ],
      [
        'kiracı süzgecine OR true eklendi',
        (s) => s.replace(/(where\s+t\.tenant_id\s*=\s*\(select public\.jwt_tenant_id\(\)\))/i, '$1 or true'),
        /\(h\) govdede OR var/,
      ],
      ['SECURITY DEFINER kaldırıldı', (s) => s.replace(/security\s+definer/i, ''), /\(a\) SECURITY DEFINER degil/],
      ['SECURITY INVOKER yazıldı', (s) => s.replace(/security\s+definer/i, 'security invoker'), /\(a\) SECURITY DEFINER degil/],
      ['search_path kaldırıldı', (s) => s.replace(/set\s+search_path\s+to\s+'public',\s*'pg_temp'/i, ''), /\(d\) search_path sabit degil/],
      ['search_path gevşetildi (yalnız public)', (s) => s.replace(/'public',\s*'pg_temp'/i, "'public'"), /\(d\) search_path sabit degil/],
      ['STABLE yerine VOLATILE', (s) => s.replace(/\bstable\b/i, 'volatile'), /\(b\) STABLE degil/],
      [
        'parametre eklendi',
        (s) => s.replace(/function public\.url_takma_adlari_listele\(\)/i, 'function public.url_takma_adlari_listele(p_kiraci uuid default null)'),
        /\(e\) parametre var/,
      ],
      [
        'sebep kolonu sızdırıldı (returns table + select)',
        (s) => s.replace(/hedef_id\s+uuid\s*\)/i, 'hedef_id uuid, sebep text)').replace(/t\.hedef_id\s+from/i, 't.hedef_id, t.sebep from'),
        /\(f\) donus kolonlari/,
      ],
      ['gövdeye yazma/kilit eklendi (for update)', (s) => s.replace(/order by/i, 'for update order by'), /\(i\) govde yazma/],
      ['sıralama kaldırıldı', (s) => s.replace(/order by t\.tur, t\.dil, t\.eski_slug/i, ''), /\(j\) siralama yok/],
      [
        'PUBLIC\'e EXECUTE verildi',
        (s) => s.replace(/(grant execute on function public\.url_takma_adlari_listele\(\) to anon, authenticated, service_role;)/i, '$1\ngrant execute on function public.url_takma_adlari_listele() to public;'),
        /\(k\) PUBLIC icin son olay revoke degil/,
      ],
      [
        'revoke ... from public kaldırıldı',
        (s) => s.replace(/from public, anon, authenticated;/i, 'from anon, authenticated;'),
        /\(k\) PUBLIC icin son olay revoke degil/,
      ],
      [
        'service_role grant\'ı kaldırıldı (varsayılan yetkiye güvenilmez)',
        (s) => s.replace(/to anon, authenticated, service_role;/i, 'to anon, authenticated;'),
        /\(k\) service_role icin ACIK grant yok/,
      ],
      [
        'anon grant\'ı kaldırıldı (harita üretilemez)',
        (s) => s.replace(/to anon, authenticated, service_role;/i, 'to authenticated, service_role;'),
        /\(k\) anon icin ACIK grant yok/,
      ],
      [
        'tabloya anon GRANT SELECT eklendi',
        (s) => s.replace(/comment on function/i, 'grant select on table public.url_takma_adlari to anon;\ncomment on function'),
        /\(l\) url_takma_adlari tablosu anon icin ACIK/,
      ],
      [
        'tabloya TÜM tablolar üzerinden anon GRANT',
        (s) => s.replace(/comment on function/i, 'grant select on all tables in schema public to anon;\ncomment on function'),
        /\(l\) url_takma_adlari tablosu anon icin ACIK/,
      ],
      [
        'tabloya politika eklendi',
        (s) => s.replace(/comment on function/i, 'create policy x on public.url_takma_adlari for select using (true);\ncomment on function'),
        /\(l\) url_takma_adlari uzerinde 1 politika var/,
      ],
      [
        'tabloda RLS kapatıldı',
        (s) => s.replace(/comment on function/i, 'alter table public.url_takma_adlari disable row level security;\ncomment on function'),
        /\(l\) url_takma_adlari icin RLS son durumda acik degil/,
      ],
    ]
    it.each(MUTASYONLAR)('%s → KIRMIZI', (_ad, donustur, desen) => {
      expect(statikHatalar(bozuk(donustur), tipMetni).join('\n')).toMatch(desen)
    })

    it('tip dosyasında kolon eksik (tenant_id) → KIRMIZI', () => {
      const bozulan = tipIslevBlogu((b) => b.replace(/^\s*tenant_id: string\s*$/m, ''))
      expect(bozulan).not.toBe(tipMetni)
      expect(tipHatalari(bozulan).join('\n')).toMatch(/\(t\) tip dosyasi kolonlari/)
    })
    it('tip dosyasında fazladan kolon (sebep) → KIRMIZI', () => {
      const bozulan = tipIslevBlogu((b) => b.replace(/^(\s*)tenant_id: string/m, '$1sebep: string\n$1tenant_id: string'))
      expect(bozulan).not.toBe(tipMetni)
      expect(tipHatalari(bozulan).join('\n')).toMatch(/\(t\) tip dosyasi kolonlari/)
    })
    it('tip dosyasında Args: never yerine parametre → KIRMIZI', () => {
      const bozulan = tipIslevBlogu((b) => b.replace(/Args: never/, 'Args: { p_x: string }'))
      expect(bozulan).not.toBe(tipMetni)
      expect(tipHatalari(bozulan).join('\n')).toMatch(/\(t\) tip dosyasinda/)
    })
    it('tip dosyasında işlev hiç yok → KIRMIZI', () => {
      const bozulan = tipMetni.replace(`${FONK}: {`, 'baska_islev: {')
      expect(bozulan).not.toBe(tipMetni)
      expect(tipHatalari(bozulan).join('\n')).toMatch(/\(t\) tip dosyasinda/)
    })
  })

  describe('C · DAVRANIŞ — migration\'ın kendi SQL\'i PGlite\'ta iki kiracılı veride koşar', () => {
    let Pglite: PgliteKurucu | null = null
    let db: PgliteDb | null = null
    /**
     * Kurulum hatası YUTULMAZ ve beforeAll'dan FIRLATILMAZ: vitest, fırlatılan beforeAll'da bütün testleri "skipped"
     * gösterir (atlanmış = yeşil gibi görünür). Hata burada tutulur, aşağıdaki testler açıkça KIRMIZI verir.
     */
    let kurulumHatasi: string | null = null
    const tabloDdl = tabloDdlCikar(zincir)
    const migrationSql = iyi?.sql ?? ''

    beforeAll(async () => {
      Pglite = await pgliteYukle()
      if (!Pglite) return
      if (!tabloDdl) {
        kurulumHatasi = 'tablo dogum DDL\'i zincirde bulunamadi'
        return
      }
      try {
        db = await kurDb(Pglite, tabloDdl, migrationSql)
      } catch (e) {
        kurulumHatasi = String((e as { message?: string }).message ?? e)
      }
    }, 90_000)

    afterAll(async () => {
      await db?.close().catch(() => undefined)
    })

    /** PGlite YOKSA test atlanır (görünür "skipped"); PGlite VARSA ama migration uygulanamadıysa KIRMIZI. */
    const hazirDb = (ctx: { skip: () => never }): PgliteDb | null => {
      if (!Pglite) return ctx.skip()
      expect(kurulumHatasi, 'migration PGlite\'ta UYGULANAMADI (guard ya da sozdizimi) — davranis olculemedi').toBeNull()
      expect(db, 'PGlite veritabani kurulamadi').not.toBeNull()
      return db
    }

    it('PGlite kolu KOŞTU (PGLITE_ZORUNLU=1 iken yokluk KIRMIZIDIR; atlanmış kol yeşil değildir)', () => {
      if (process.env.PGLITE_ZORUNLU === '1') {
        expect(Pglite, 'PGlite yuklenemedi (PGLITE_GIRIS) — davranis kolu OLCULEMEDI').not.toBeNull()
      }
      // PGLITE_ZORUNLU yoksa: yükleme yoksa aşağıdaki davranış testleri "skipped" görünür; bu bilinçli ve görünür.
    })

    it('⭐migration (guard dahil) İKİ kiracılı veride hatasız uygulanır', (ctx) => {
      expect(hazirDb(ctx)).not.toBeNull()
    })

    it('⭐her rol/JWT yalnız KENDİ kiracısının satırlarını görür; YABANCI KİRACI SATIRI DÖNERSE KIRMIZI', async (ctx) => {
      const d = hazirDb(ctx)
      expect(d).not.toBeNull()
      if (d) expect(await davranisHatalari(d)).toEqual([])
    })

    it('uygulanan tanım katalogda sözleşmeyi sağlıyor (DEFINER, STABLE, parametresiz, search_path, ACL, tablo kapalı)', async (ctx) => {
      const d = hazirDb(ctx)
      expect(d).not.toBeNull()
      if (d) expect(await katalogHatalari(d)).toEqual([])
    })

    describe('D · AYIRT EDİCİLİK (davranış) — süzgeç sökülmüş migration', () => {
      const suzgecsiz = (s: string): string =>
        s.replace(/where\s+t\.tenant_id\s*=\s*\(select public\.jwt_tenant_id\(\)\)/i, 'where true')

      /** Yorumsuz metne uygulanır (başlık yorumları aynı sözcükleri taşır); etkisiz mutasyon testi düşürür. */
      const yorumsuzSql = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\n]*/g, '')

      it('guard\'sız uygulanınca YABANCI KİRACI SATIRI döner ve davranış kolu KIRMIZI verir', async (ctx) => {
        if (!Pglite) return ctx.skip()
        expect(tabloDdl, 'tablo dogum DDL\'i zincirde yok').not.toBeNull()
        if (!tabloDdl) return
        const kod = yorumsuzSql(migrationSql)
        const bozulan = suzgecsiz(kod)
        expect(bozulan, 'mutasyon etkisiz').not.toBe(kod)
        const d = await kurDb(Pglite, tabloDdl, guardsiz(bozulan))
        try {
          const hatalar = await davranisHatalari(d)
          expect(hatalar.join('\n')).toMatch(/YABANCI KIRACI SATIRI DONDU/)
        } finally {
          await d.close().catch(() => undefined)
        }
      }, 60_000)

      it('migration\'ın kendi GUARD\'ı da süzgeçsiz sürümü iki kiracılı veride UYGULATMAZ', async (ctx) => {
        if (!Pglite) return ctx.skip()
        expect(tabloDdl, 'tablo dogum DDL\'i zincirde yok').not.toBeNull()
        if (!tabloDdl) return
        const kod = yorumsuzSql(migrationSql)
        expect(suzgecsiz(kod), 'mutasyon etkisiz').not.toBe(kod)
        await expect(kurDb(Pglite, tabloDdl, suzgecsiz(kod))).rejects.toThrow(/GUARD/)
      }, 60_000)
    })
  })
})
