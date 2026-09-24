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
 * geri kaçmasını engeller: sonradan bir GRANT, bir DROP+CREATE (varsayılan yetkileri geri getirir) ya
 * da tetiğin INVOKER'a dönmesi KIRMIZI verir. Canlı kanıt merge sonrası `has_function_privilege` ile
 * ölçülür (migration dosyasının sonundaki beş satır).
 */
const KOK = process.cwd()
const MIG_DIZIN = path.join(KOK, 'supabase', 'migrations')

type Mig = { ad: string; sql: string }

/** `--` satır yorumlarını ve blok yorumları siler — yorumda geçen ad seçimi ele geçirmesin. */
function yorumsuz(sql: string): string {
  return sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\n]*/g, '')
}

type Olay = { sira: number; tur: 'grant' | 'revoke' | 'yeniden-dogum' }

/**
 * Bir fonksiyon × rol için zincir boyunca olayları sırayla toplar.
 * `yeniden-dogum` = DROP FUNCTION ya da `or replace`SIZ CREATE FUNCTION: varsayılan yetkiler
 * (anon/authenticated EXECUTE) GERİ gelir, yani GRANT sayılır.
 */
function olaylar(zincir: Mig[], fonk: string, rol: string): Olay[] {
  const f = fonk
  const sonuc: Olay[] = []
  let sira = 0
  for (const m of zincir) {
    const ifadeler = yorumsuz(m.sql).split(';')
    for (const ifade of ifadeler) {
      sira++
      const s = ifade.replace(/\s+/g, ' ').trim().toLowerCase()
      if (!s.includes(f)) continue
      const hedef = new RegExp(`function (?:public\\.)?${f}\\s*\\(`)
      if (!hedef.test(s)) continue
      const rolGecer = new RegExp(`\\b(?:to|from) (?:[a-z_]+, ?)*${rol}\\b`).test(s)
      if (/^grant execute on function/.test(s) && rolGecer) sonuc.push({ sira, tur: 'grant' })
      else if (/^grant all on function/.test(s) && rolGecer) sonuc.push({ sira, tur: 'grant' })
      else if (/^revoke (?:execute|all)(?: privileges)? on function/.test(s) && rolGecer) sonuc.push({ sira, tur: 'revoke' })
      else if (/^drop function/.test(s)) sonuc.push({ sira, tur: 'yeniden-dogum' })
      else if (/^create function/.test(s)) sonuc.push({ sira, tur: 'yeniden-dogum' })
    }
  }
  return sonuc
}

/** Zincirin sonunda rolün EXECUTE hakkı kapalı mı? Son olay revoke olmalı. */
function sonHalKapali(zincir: Mig[], fonk: string, rol: string): boolean {
  const o = olaylar(zincir, fonk, rol)
  return o.length > 0 && o[o.length - 1].tur === 'revoke'
}

/** Fonksiyonun SON tanımı SECURITY DEFINER mı? */
function sonTanimDefiner(zincir: Mig[], fonk: string): boolean | null {
  const desen = new RegExp(
    `create\\s+(?:or\\s+replace\\s+)?function\\s+(?:public\\.)?${fonk}\\s*\\([\\s\\S]*?\\bas\\s+\\$(\\w*)\\$`,
    'gi',
  )
  let son: string | null = null
  for (const m of zincir) {
    const t = yorumsuz(m.sql)
    for (const e of t.matchAll(desen)) son = e[0]
  }
  if (son === null) return null
  return /security\s+definer/i.test(son)
}

function gercekZincir(): Mig[] {
  return fs
    .readdirSync(MIG_DIZIN)
    .filter((a) => a.endsWith('.sql'))
    .sort()
    .map((ad) => ({ ad, sql: fs.readFileSync(path.join(MIG_DIZIN, ad), 'utf8') }))
}

const AYO = 'admin_publish_quote'
const GON = 'generate_order_number'

describe('INV-AUTH-DEFINER-ANON-1 · sipariş sayacı ve teklif yayımı istemciden doğrudan çağrılamaz', () => {
  const zincir = gercekZincir()

  it('BOŞLUK MUHAFIZI — zincir gerçekten okunuyor ve iki fonksiyon zincirde var', () => {
    expect(zincir.length, 'migration okunamadi').toBeGreaterThan(50)
    // Bu kapının kendi migration'ından BAĞIMSIZ işaretler: onarım dosyası silinse bile muhafız yeşil
    // kalmalı, yoksa sabotaj ölçümü "okuyucu kör" ile "karar geri kaçtı"yı ayırt edemez.
    expect(sonTanimDefiner(zincir, GON), 'generate_order_number tanimi bulunamadi — okuyucu kor').not.toBeNull()
    // set_order_number BURADA ARANMAZ: 2026-09-24 ölçümü — canlıda var ama depoda onu tanımlayan
    // migration YOKTU (kayıt dışı kurulmuş); ilk kez bu kapının migration'ı onu depoya yazıyor.
    expect(olaylar(zincir, AYO, 'authenticated').length, 'admin_publish_quote olayi yok — okuyucu kor').toBeGreaterThan(0)
  })

  it('⭐generate_order_number: public, anon, authenticated için son hâl KAPALI', () => {
    for (const rol of ['public', 'anon', 'authenticated']) {
      expect(sonHalKapali(zincir, GON, rol), `generate_order_number ${rol} icin acik — gunluk sayac disaridan tuketilebilir`).toBe(true)
    }
  })

  it('⭐set_order_number SECURITY DEFINER — sayaç çağıranın yetkisine bağlı kalmaz', () => {
    expect(sonTanimDefiner(zincir, 'set_order_number'), 'set_order_number INVOKER — REVOKE siparis INSERTini kirar').toBe(true)
  })

  it('⭐admin_publish_quote: anon KAPALI, authenticated AÇIK (kabul kolu — yönetici ekranı bu yolu kullanır)', () => {
    expect(sonHalKapali(zincir, AYO, 'anon'), 'admin_publish_quote anon icin acik').toBe(true)
    expect(sonHalKapali(zincir, AYO, 'authenticated'), 'admin_publish_quote authenticated icin KAPANMIS — yonetici yayimlayamaz').toBe(false)
  })

  describe('AYIRT EDİCİLİK — değerlendirici yanlış zinciri reddediyor', () => {
    const taban: Mig[] = [
      { ad: '1_a.sql', sql: `create function public.${GON}() returns text language sql security definer as $$ select 'x' $$;` },
      { ad: '2_b.sql', sql: `revoke execute on function public.${GON}() from anon;` },
    ]

    it('sonradan GRANT gelirse açık sayılır', () => {
      expect(sonHalKapali(taban, GON, 'anon')).toBe(true)
      const bozuk = [...taban, { ad: '3_c.sql', sql: `grant execute on function public.${GON}() to anon, authenticated;` }]
      expect(sonHalKapali(bozuk, GON, 'anon')).toBe(false)
      expect(sonHalKapali(bozuk, GON, 'authenticated')).toBe(false)
    })

    it('DROP + CREATE (varsayılan yetkiler geri gelir) açık sayılır', () => {
      const bozuk = [
        ...taban,
        { ad: '3_c.sql', sql: `drop function public.${GON}(); create function public.${GON}() returns text language sql as $$ select 'y' $$;` },
      ]
      expect(sonHalKapali(bozuk, GON, 'anon')).toBe(false)
    })

    it('yorumdaki REVOKE sayılmaz', () => {
      const yorumlu: Mig[] = [taban[0], { ad: '2_b.sql', sql: `-- revoke execute on function public.${GON}() from anon;` }]
      expect(sonHalKapali(yorumlu, GON, 'anon')).toBe(false)
    })

    it('başka rolün REVOKE\'u bu rolü kapatmaz (anon ≠ authenticated)', () => {
      expect(sonHalKapali(taban, GON, 'authenticated')).toBe(false)
    })

    it('tetik INVOKER\'a dönerse yakalanır', () => {
      const t: Mig[] = [
        { ad: '1.sql', sql: 'create or replace function public.set_order_number() returns trigger language plpgsql security definer as $f$ begin return new; end; $f$;' },
        { ad: '2.sql', sql: 'create or replace function public.set_order_number() returns trigger language plpgsql as $f$ begin return new; end; $f$;' },
      ]
      expect(sonTanimDefiner(t.slice(0, 1), 'set_order_number')).toBe(true)
      expect(sonTanimDefiner(t, 'set_order_number')).toBe(false)
    })
  })
})
