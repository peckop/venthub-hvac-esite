// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-AUTH-DEFINER-ANON-1 — sipariş sayacı ve teklif yayımı istemci rollerinden doğrudan çağrılamaz.
 *
 * ⭐NİÇİN VAR (canlıda ölçüldü 2026-09-24): `generate_order_number()` SECURITY DEFINER ve gövdesinde
 * rol kontrolü yok; her çağrı günün sayacını kalıcı artırıyor, 9999'u aşınca RAISE ediyor. anon ya
 * da (üyeliği ücretsiz) authenticated rolüyle /rpc/generate_order_number'a 9999 istek = o gün kalan
 * tüm sipariş INSERT'leri düşer. `admin_publish_quote` üzerinde de anon EXECUTE açık kalmıştı:
 * Supabase varsayılan yetkileri anon'a DOĞRUDAN EXECUTE verir, `revoke ... from public` onu kaldırmaz.
 *
 * ⭐NİÇİN METİN KOLU: CI'da prod DB yok. Bu kapı migration zincirinin SON hâlini hesaplar ve kararın
 * geri kaçmasını engeller. Metin kolu her biçimi yakalayamaz; asıl kanıt merge sonrası canlıda
 * `has_function_privilege` ile ölçülür (migration dosyasının sonundaki doğrulama satırları).
 *
 * ⭐YENİDEN DOĞUM = AÇILMA: Supabase `ALTER DEFAULT PRIVILEGES` yeni doğan her public fonksiyona
 * anon/authenticated EXECUTE verir. Bu yüzden şunlar GRANT sayılır: DROP FUNCTION · `or replace`sız
 * CREATE · ad değiştirme (RENAME — sonraki CREATE OR REPLACE yeni fonksiyon doğurur; açığın
 * 2026-09-06'daki doğum şekli buydu: 20260906043551) · FARKLI imzalı CREATE OR REPLACE (yeni overload).
 * (plan-challenger + security-reviewer 2026-09-24 kör nokta listesi: a–h, her biri aşağıda bir vaka.)
 */
const KOK = process.cwd()
const MIG_DIZIN = path.join(KOK, 'supabase', 'migrations')

type Mig = { ad: string; sql: string }
type Olay = 'grant' | 'revoke' | 'yeniden-dogum'

/** Yorumları siler, tırnaklı tanımlayıcıları açar, küçük harfe indirir, boşlukları tekler. */
function normalize(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--[^\n]*/g, '')
    .replace(/"([a-z_][a-z0-9_]*)"/gi, '$1')
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

const TIP_ESI: Record<string, string> = {
  'timestamp with time zone': 'timestamptz',
  'character varying': 'varchar',
  integer: 'int',
  int4: 'int',
  boolean: 'bool',
}

/** "p_quote_id uuid, p_valid_until timestamp with time zone default now()" → ['uuid','timestamptz'] */
function argTipleri(args: string): string[] {
  if (args.trim() === '') return []
  return args.split(',').map((a) => {
    let s = a.replace(/\b(default|=)\b[\s\S]*$/, '').replace(/^\s*(in|out|inout|variadic)\s+/, '').trim()
    const kelimeler = s.split(' ')
    // Parametre adı varsa at: tek kelimelik tip listesinde adı olmayan argüman yalnız tiptir.
    if (kelimeler.length >= 2 && !TIP_ESI[s] && !/^(timestamp|character|double|time)\b/.test(s)) {
      s = kelimeler.slice(1).join(' ')
    }
    return TIP_ESI[s] ?? s
  })
}

const ad = (f: string) => `(?:public\\.)?${f}(?![a-z0-9_])`

/** Bir fonksiyon × rol için zincir boyunca olayları sırayla toplar. `imza` = kanonik tip listesi. */
function olaylar(zincir: Mig[], fonk: string, rol: string, imza: string[]): Olay[] {
  const sonuc: Olay[] = []
  const rolDes = new RegExp(`\\b(?:to|from) (?:[a-z_]+ ?, ?)*${rol}\\b`)
  const hedef = `(?:function|routine|procedure) ${ad(fonk)}`
  const grantDes = new RegExp(`\\bgrant (?:execute|all(?: privileges)?) on (?:${hedef}|all (?:functions|routines) in schema public)\\b`)
  const revokeDes = new RegExp(`\\brevoke (?:grant option for )?(?:execute|all(?: privileges)?) on ${hedef}`)
  const dropDes = new RegExp(`\\bdrop (?:function|routine) (?:if exists )?${ad(fonk)}`)
  const renameDes = new RegExp(`\\balter (?:function|routine) ${ad(fonk)}\\s*(?:\\([^)]*\\))? rename to`)
  const createDes = new RegExp(`\\bcreate (or replace )?function ${ad(fonk)}\\s*\\(([^)]*)\\)`)
  for (const m of zincir) {
    for (const ifade of normalize(m.sql).split(';')) {
      // ^ çapası YOK: DO bloğu içindeki `execute 'grant ...'` de ifade içinde yakalanır.
      if (grantDes.test(ifade) && rolDes.test(ifade)) sonuc.push('grant')
      else if (revokeDes.test(ifade) && rolDes.test(ifade)) sonuc.push('revoke')
      else if (dropDes.test(ifade) || renameDes.test(ifade)) sonuc.push('yeniden-dogum')
      else {
        const c = createDes.exec(ifade)
        if (c && (!c[1] || argTipleri(c[2]).join(',') !== imza.join(','))) sonuc.push('yeniden-dogum')
      }
    }
  }
  return sonuc
}

function sonHalKapali(zincir: Mig[], fonk: string, rol: string, imza: string[]): boolean {
  const o = olaylar(zincir, fonk, rol, imza)
  return o.length > 0 && o[o.length - 1] === 'revoke'
}

/** Fonksiyonun son güvenlik kipi: CREATE gövdesindeki ya da sonradan ALTER FUNCTION ... SECURITY ile. */
function sonKip(zincir: Mig[], fonk: string): 'definer' | 'invoker' | null {
  let kip: 'definer' | 'invoker' | null = null
  const createDes = new RegExp(`\\bcreate (?:or replace )?function ${ad(fonk)}\\s*\\(`)
  const alterDes = new RegExp(`\\balter function ${ad(fonk)}\\s*(?:\\([^)]*\\))?[^;]*\\bsecurity (definer|invoker)\\b`)
  for (const m of zincir) {
    for (const ifade of normalize(m.sql).split(';')) {
      const a = alterDes.exec(ifade)
      if (a) kip = a[1] as 'definer' | 'invoker'
      else if (createDes.test(ifade)) {
        // Başlık gövdeden önce biter: `as $tag$` öncesinde SECURITY yazılmadıysa varsayılan INVOKER.
        const baslik = ifade.split(/\bas \$/)[0]
        kip = /\bsecurity definer\b/.test(baslik) ? 'definer' : 'invoker'
      }
    }
  }
  return kip
}

function gercekZincir(): Mig[] {
  return fs
    .readdirSync(MIG_DIZIN)
    .filter((a) => a.endsWith('.sql'))
    .sort()
    .map((ad) => ({ ad, sql: fs.readFileSync(path.join(MIG_DIZIN, ad), 'utf8') }))
}

const GON = 'generate_order_number'
const AYO = 'admin_publish_quote'
const AYO_IMZA = ['uuid', 'timestamptz', 'text']

describe('INV-AUTH-DEFINER-ANON-1 · sipariş sayacı ve teklif yayımı istemciden doğrudan çağrılamaz', () => {
  const zincir = gercekZincir()

  it('BOŞLUK MUHAFIZI — zincir gerçekten okunuyor (onarım migration\'ından bağımsız işaretler)', () => {
    expect(zincir.length, 'migration okunamadi').toBeGreaterThan(50)
    expect(sonKip(zincir, GON), 'generate_order_number tanimi bulunamadi — okuyucu kor').not.toBeNull()
    expect(olaylar(zincir, AYO, 'authenticated', AYO_IMZA).length, 'admin_publish_quote olayi yok — okuyucu kor').toBeGreaterThan(0)
    // set_order_number BURADA ARANMAZ: tanımı migration ZİNCİRİNDE yoktu (yalnız supabase/baselines
    // şema dökümlerinde vardı); zincire ilk kez bu kapının migration'ı yazıyor.
  })

  it('⭐generate_order_number: public, anon, authenticated için son hâl KAPALI', () => {
    for (const rol of ['public', 'anon', 'authenticated']) {
      expect(sonHalKapali(zincir, GON, rol, []), `generate_order_number ${rol} icin acik — gunluk sayac disaridan tuketilebilir`).toBe(true)
    }
  })

  it('⭐set_order_number SECURITY DEFINER — sayaç çağıranın yetkisine bağlı kalmaz', () => {
    expect(sonKip(zincir, 'set_order_number'), 'set_order_number INVOKER — REVOKE siparis INSERTini kirar').toBe('definer')
  })

  it('⭐admin_publish_quote: anon KAPALI, authenticated AÇIK (kabul kolu — yönetici ekranı bu yolu kullanır)', () => {
    expect(sonHalKapali(zincir, AYO, 'anon', AYO_IMZA), 'admin_publish_quote anon icin acik').toBe(true)
    expect(sonHalKapali(zincir, AYO, 'authenticated', AYO_IMZA), 'admin_publish_quote authenticated icin KAPANMIS — yonetici yayimlayamaz').toBe(false)
  })

  describe('AYIRT EDİCİLİK — değerlendirici her geri kaçışı reddediyor', () => {
    const taban: Mig[] = [
      { ad: '1.sql', sql: `create function public.${GON}() returns text language sql security definer as $$ select 'x' $$;` },
      { ad: '2.sql', sql: `revoke execute on function public.${GON}() from public, anon, authenticated;` },
    ]
    const ekle = (sql: string): Mig[] => [...taban, { ad: '3.sql', sql }]

    it('taban kapalı (vakaların anlamlı olması için ön koşul)', () => {
      for (const rol of ['public', 'anon', 'authenticated']) expect(sonHalKapali(taban, GON, rol, [])).toBe(true)
    })

    it('düz GRANT', () => {
      expect(sonHalKapali(ekle(`grant execute on function public.${GON}() to anon, authenticated;`), GON, 'anon', [])).toBe(false)
    })

    it('a · RENAME + CREATE OR REPLACE (2026-09-06 deseni)', () => {
      const bozuk = ekle(
        `alter function public.${GON}() rename to ${GON}_eski; create or replace function public.${GON}() returns text language sql security definer as $$ select 'y' $$;`,
      )
      expect(sonHalKapali(bozuk, GON, 'anon', [])).toBe(false)
    })

    it('b · farklı imzalı CREATE OR REPLACE (yeni overload)', () => {
      const bozuk = ekle(`create or replace function public.${GON}(p_gun date) returns text language sql as $$ select 'y' $$;`)
      expect(sonHalKapali(bozuk, GON, 'anon', [])).toBe(false)
    })

    it('aynı imzalı CREATE OR REPLACE yetkiyi KORUR (yanlış alarm yok)', () => {
      const iyi = ekle(`create or replace function public.${GON}() returns text language sql security definer as $$ select 'z' $$;`)
      expect(sonHalKapali(iyi, GON, 'anon', [])).toBe(true)
    })

    it('c · ALTER FUNCTION ... SECURITY INVOKER tetiği geri çevirir', () => {
      const t: Mig[] = [
        { ad: '1.sql', sql: 'create or replace function public.set_order_number() returns trigger language plpgsql security definer set search_path = public as $f$ begin return new; end; $f$;' },
      ]
      expect(sonKip(t, 'set_order_number')).toBe('definer')
      expect(sonKip([...t, { ad: '2.sql', sql: 'alter function public.set_order_number() security invoker;' }], 'set_order_number')).toBe('invoker')
      expect(sonKip([...t, { ad: '2.sql', sql: 'create or replace function public.set_order_number() returns trigger language plpgsql as $f$ begin return new; end; $f$;' }], 'set_order_number')).toBe('invoker')
    })

    it('d · GRANT ... ON ALL FUNCTIONS IN SCHEMA public', () => {
      expect(sonHalKapali(ekle('grant execute on all functions in schema public to anon;'), GON, 'anon', [])).toBe(false)
    })

    it('e · pg_dump biçimi (tırnaklı adlar)', () => {
      expect(sonHalKapali(ekle(`GRANT ALL ON FUNCTION "public"."${GON}"() TO "anon";`), GON, 'anon', [])).toBe(false)
    })

    it('f · GRANT ALL PRIVILEGES', () => {
      expect(sonHalKapali(ekle(`grant all privileges on function public.${GON}() to authenticated;`), GON, 'authenticated', [])).toBe(false)
    })

    it('g · parantezsiz yazım', () => {
      expect(sonHalKapali(ekle(`grant execute on function public.${GON} to anon;`), GON, 'anon', [])).toBe(false)
    })

    it('h · DO bloğu içinde dinamik GRANT', () => {
      expect(sonHalKapali(ekle(`do $$ begin execute 'grant execute on function public.${GON}() to anon'; end $$;`), GON, 'anon', [])).toBe(false)
    })

    it('DROP + CREATE', () => {
      expect(sonHalKapali(ekle(`drop function public.${GON}(); create or replace function public.${GON}() returns text language sql as $$ select 'y' $$;`), GON, 'anon', [])).toBe(false)
    })

    it('yorumdaki GRANT sayılmaz; benzer adlı başka fonksiyon sayılmaz', () => {
      expect(sonHalKapali(ekle(`-- grant execute on function public.${GON}() to anon;`), GON, 'anon', [])).toBe(true)
      expect(sonHalKapali(ekle(`grant execute on function public.${GON}_saat_tabanli() to anon;`), GON, 'anon', [])).toBe(true)
    })

    it('başka rolün GRANT\'ı bu rolü açmaz (anon ≠ authenticated)', () => {
      expect(sonHalKapali(ekle(`grant execute on function public.${GON}() to authenticated;`), GON, 'anon', [])).toBe(true)
    })

    it('admin_publish_quote imza eşlemesi: gerçek imzalı CREATE OR REPLACE yetkiyi korur', () => {
      const z: Mig[] = [
        { ad: '1.sql', sql: `revoke execute on function public.${AYO}(uuid, timestamptz, text) from anon;` },
        { ad: '2.sql', sql: `create or replace function public.${AYO}(p_quote_id uuid, p_valid_until timestamptz, p_currency text) returns void language plpgsql security definer as $$ begin end $$;` },
      ]
      expect(sonHalKapali(z, AYO, 'anon', AYO_IMZA)).toBe(true)
    })
  })
})
