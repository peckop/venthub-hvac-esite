// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-QUOTE-ATOMIK-1 — teklif başlığı + kalemleri TEK transaction'da yazan fonksiyonun sözleşmesi (REC-295).
 *
 * ⭐NİÇİN VAR: teklif talebi iki ayrı INSERT'le yazılıyordu; kalem düşerse başlık kalemsiz ve kalıcı kalıyordu.
 * `create_quote_with_items` SECURITY INVOKER'dır (RLS yürürlükte kalsın diye) ve bu kapı o kararın ve fonksiyonun
 * güvenlik şartlarının GERİ KAÇMASINI tutar. Davranış kanıtı (gölge, 2026-09-24): aynı kalem hatasında yeni yol
 * 0 başlık bırakır, eski iki adımlı yol 1 kalemsiz başlık bırakır.
 *
 * Kollar: (a) INVOKER + search_path DEĞERİ · (b) anon EXECUTE kapalı, authenticated + service_role açık ·
 * (c) gövde `status`/`user_id`'yi girdiden okumaz ve iki dalda da boş kalem listesini reddeder.
 * (d) "yazım yollarında doğrudan INSERT = 0" kolu çağıranlar RPC'ye geçince (PR-B/C) eklenir.
 */
const MIG_DIZIN = path.join(process.cwd(), 'supabase', 'migrations')
const FONK = 'create_quote_with_items'

type Mig = { ad: string; sql: string }

const yorumsuz = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\n]*/g, '')

/** Zincirdeki SON tanımın tam metni (başlık + gövde). */
function sonTanim(zincir: Mig[]): string | null {
  const desen = new RegExp(
    `create\\s+(?:or\\s+replace\\s+)?function\\s+(?:public\\.)?${FONK}\\s*\\([\\s\\S]*?\\$(\\w*)\\$[\\s\\S]*?\\$\\1\\$`,
    'gi',
  )
  let son: string | null = null
  for (const m of zincir) for (const e of yorumsuz(m.sql).matchAll(desen)) son = e[0]
  return son
}

/** Başlık = gövde dolar işaretinden önceki kısım. */
const baslik = (tanim: string) => tanim.split(/\bas\s+\$/i)[0].toLowerCase().replace(/\s+/g, ' ')
/** Gövde = dolar işaretleri arası. */
const govde = (tanim: string) => (/\$(\w*)\$([\s\S]*)\$\1\$/.exec(tanim)?.[2] ?? '').toLowerCase()

/** Rol için son GRANT/REVOKE olayı. */
function sonYetki(zincir: Mig[], rol: string): 'grant' | 'revoke' | null {
  let son: 'grant' | 'revoke' | null = null
  const hedef = new RegExp(`on function (?:public\\.)?${FONK}\\b`)
  const rolDes = new RegExp(`\\b(?:to|from) (?:[a-z_]+ ?, ?)*${rol}\\b`)
  for (const m of zincir) {
    for (const ifade of yorumsuz(m.sql).toLowerCase().replace(/\s+/g, ' ').split(';')) {
      if (!hedef.test(ifade) || !rolDes.test(ifade)) continue
      if (/\bgrant (?:execute|all)/.test(ifade)) son = 'grant'
      else if (/\brevoke (?:execute|all)/.test(ifade)) son = 'revoke'
    }
  }
  return son
}

function gercekZincir(): Mig[] {
  return fs
    .readdirSync(MIG_DIZIN)
    .filter((a) => a.endsWith('.sql'))
    .sort()
    .map((ad) => ({ ad, sql: fs.readFileSync(path.join(MIG_DIZIN, ad), 'utf8') }))
}

function degerlendir(zincir: Mig[]): string[] {
  const hatalar: string[] = []
  const t = sonTanim(zincir)
  if (!t) return ['fonksiyon tanimi yok']
  const b = baslik(t)
  const g = govde(t)
  if (/security definer/.test(b)) hatalar.push('(a) SECURITY DEFINER — RLS atlanir, govde tek koruma olur')
  if (!/security invoker/.test(b)) hatalar.push('(a) SECURITY INVOKER acikca yazili degil')
  if (!/set search_path = pg_catalog, public, pg_temp\b/.test(b)) hatalar.push('(a) search_path degeri pg_catalog, public, pg_temp degil')
  if (sonYetki(zincir, 'anon') !== 'revoke') hatalar.push('(b) anon EXECUTE kapali degil')
  if (sonYetki(zincir, 'public') !== 'revoke') hatalar.push('(b) public EXECUTE kapali degil')
  if (sonYetki(zincir, 'authenticated') !== 'grant') hatalar.push('(b) authenticated EXECUTE yok — oturumlu teklif duser')
  if (sonYetki(zincir, 'service_role') !== 'grant') hatalar.push('(b) service_role EXECUTE yok — misafir teklif duser')
  if (/p_quote\s*->>?\s*'status'/.test(g)) hatalar.push('(c) status girdiden okunuyor — musteri durum yazabilir')
  if (/p_quote\s*->>?\s*'user_id'/.test(g)) hatalar.push('(c) user_id girdiden okunuyor — baskasi adina teklif')
  if (!/jsonb_array_length\(p_items\)\s*<\s*1/.test(g)) hatalar.push('(c) bos kalem listesi reddedilmiyor — kalemsiz teklifi fonksiyon uretir')
  if (!/current_user\s*=\s*'service_role'/.test(g)) hatalar.push('(c) dal ayrimi oturum rolune bagli degil')
  return hatalar
}

describe('INV-QUOTE-ATOMIK-1 · teklif başlığı + kalemleri tek transaction', () => {
  const zincir = gercekZincir()

  it('⭐gerçek zincir sözleşmeyi sağlıyor', () => {
    expect(degerlendir(zincir)).toEqual([])
  })

  describe('AYIRT EDİCİLİK — her ihlal yakalanıyor', () => {
    const iyi = zincir.find((m) => m.ad.endsWith('_quote_atomik_yazim.sql'))
    const bozuk = (d: (s: string) => string): Mig[] => {
      expect(iyi, 'REC-295 migration bulunamadi').toBeDefined()
      return [{ ad: 'x.sql', sql: d((iyi as Mig).sql) }]
    }

    it('taban (yalnız bu migration) temiz', () => {
      expect(degerlendir(bozuk((s) => s))).toEqual([])
    })
    it('DEFINER', () => {
      expect(degerlendir(bozuk((s) => s.replace('security invoker', 'security definer'))).join()).toMatch(/\(a\) SECURITY DEFINER/)
    })
    it('search_path değişti', () => {
      expect(degerlendir(bozuk((s) => s.replace('set search_path = pg_catalog, public, pg_temp', 'set search_path = public'))).join()).toMatch(/\(a\) search_path/)
    })
    it('anon REVOKE kalktı', () => {
      expect(degerlendir(bozuk((s) => s.replace(/revoke execute on function public\.create_quote_with_items\(jsonb, jsonb\) from anon;/, ''))).join()).toMatch(/\(b\) anon/)
    })
    it('authenticated GRANT kalktı', () => {
      expect(degerlendir(bozuk((s) => s.replace('to authenticated, service_role', 'to service_role'))).join()).toMatch(/\(b\) authenticated/)
    })
    it('status girdiden okunuyor', () => {
      expect(degerlendir(bozuk((s) => s.replace("p_quote ->> 'source',", "p_quote ->> 'source', p_quote ->> 'status',"))).join()).toMatch(/\(c\) status/)
    })
    it('boş liste kontrolü kalktı', () => {
      expect(degerlendir(bozuk((s) => s.replace('or jsonb_array_length(p_items) < 1', ''))).join()).toMatch(/\(c\) bos kalem/)
    })
    it('dal JWT claim\'ine bağlandı', () => {
      expect(degerlendir(bozuk((s) => s.replace("(current_user = 'service_role')", "(auth.role() = 'service_role')"))).join()).toMatch(/\(c\) dal/)
    })
  })
})
