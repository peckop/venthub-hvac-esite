// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SIPARIS-ISTEMCI-YAZMA-1 · müşteri sipariş verisine yazamaz (REC-355 VULN-002 + kardeşleri a/b)
 *
 * NİÇİN: 2026-09-27 canlı ölçüm — oturumlu müşteri kendi siparişine `status='confirmed'` yazınca tetik
 * zinciri parasız "ödendi" + onay e-postası üretiyordu; kendi siparişine fiyatlı kalem ekleyebiliyor,
 * iadeyi `status='approved'` açabiliyordu. Onarım üç BEFORE tetiği (migration 20260927162755). Bu kapı
 * onarımın zincirde GERİ ALINMASINI yakalar: tetik düşerse, bekçi yasak listesine dönerse, anon'a yazma
 * geri verilirse, iade tablosuna yeni bir yönetici kolonu eklenip bekçiye girmezse KIRMIZI.
 *
 * Kolon evreni (g) = taban şemasının YALNIZ `"public".` bloğu ∪ taban tarihinden SONRAKİ migration'lardaki
 * `add column` ifadeleri (tabanda aynı ad arşiv şemasında da var — plan-challenger K2).
 *
 * Plan: docs/plans/rec355-vuln002-siparis-kolon-bekcisi-2026-09-27.md (v3, iki tur çürütme).
 */

const KOK = process.cwd()
const MIG_DIZIN = path.join(KOK, 'supabase', 'migrations')
const TABAN_DIZIN = path.join(KOK, 'supabase', 'baselines')
const REC355 = '20260927162755_rec355_siparis_kolon_bekcisi.sql'

type Mig = { ad: string; sql: string }

// Windows kopyasında text=auto CRLF yazar; kalıplar \n arar → tek biçime indirilir (#1442 dersi).
const oku = (p: string): string => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n')
const yorumsuz = (s: string) => s.replace(/--[^\n]*/g, '')
const tek = (s: string) => yorumsuz(s).toLowerCase().replace(/\s+/g, ' ')

function gercekZincir(): Mig[] {
  return fs
    .readdirSync(MIG_DIZIN)
    .filter((a) => a.endsWith('.sql'))
    .sort()
    .map((ad) => ({ ad, sql: oku(path.join(MIG_DIZIN, ad)) }))
}

function enYeniTaban(): { tarih: string; sql: string } {
  const ad = fs
    .readdirSync(TABAN_DIZIN)
    .filter((a) => /^\d{4}-\d{2}-\d{2}_public_schema\.sql$/.test(a))
    .sort()
    .pop()
  if (!ad) throw new Error('taban şeması yok')
  return { tarih: ad.slice(0, 10).replace(/-/g, ''), sql: oku(path.join(TABAN_DIZIN, ad)) }
}

/** Zincirdeki SON fonksiyon tanımı, tek satır, küçük harf. */
function sonFonk(zincir: Mig[], ad: string): string | null {
  const desen = new RegExp(
    `create\\s+(?:or\\s+replace\\s+)?function\\s+(?:public\\.)?${ad}\\s*\\([\\s\\S]*?\\$(\\w*)\\$[\\s\\S]*?\\$\\1\\$`,
    'gi',
  )
  let son: string | null = null
  for (const m of zincir) for (const e of yorumsuz(m.sql).matchAll(desen)) son = e[0]
  return son === null ? null : son.toLowerCase().replace(/\s+/g, ' ')
}

/** Tetiğin zincirdeki son durumu: son create'ten sonra drop gelmişse null. */
function sonTetik(zincir: Mig[], ad: string): string | null {
  const olay = new RegExp(`(create\\s+trigger\\s+${ad}\\b[^;]*;)|(drop\\s+trigger\\s+(?:if\\s+exists\\s+)?${ad}\\b[^;]*;)`, 'gi')
  let son: string | null = null
  for (const m of zincir) {
    for (const e of yorumsuz(m.sql).matchAll(olay)) son = e[1] ? e[1].toLowerCase().replace(/\s+/g, ' ') : null
  }
  return son
}

const TABLOLAR = ['venthub_orders', 'venthub_order_items', 'venthub_returns'] as const
const TETIKLER: [string, (typeof TABLOLAR)[number], string][] = [
  ['orders_istemci_yazma_bekcisi', 'venthub_orders', 'istemci_yazma_bekcisi'],
  ['order_items_istemci_yazma_bekcisi', 'venthub_order_items', 'istemci_yazma_bekcisi'],
  ['iade_istemci_kayit_bekcisi', 'venthub_returns', 'iade_istemci_kayit_bekcisi'],
]
const IZIN_LISTESI = "current_user not in ('service_role', 'postgres', 'supabase_admin')"
const IADE_IZIN = "current_user in ('service_role', 'postgres', 'supabase_admin') or public.is_admin_claim()"
/** Müşteri formunun gönderdiği + sunucu damgaları + kimlik: bunlar dışında her iade kolonu yasaklı olmalı. */
const IADE_IZINLI = new Set(['id', 'user_id', 'order_id', 'status', 'reason', 'description', 'tenant_id', 'requested_at', 'created_at', 'updated_at'])

/** venthub_returns kolon evreni = taban "public". bloğu ∪ taban tarihinden sonraki add column'lar. */
function iadeKolonlari(zincir: Mig[], taban: { tarih: string; sql: string }): Set<string> {
  const kolonlar = new Set<string>()
  const blok = taban.sql.match(/CREATE TABLE IF NOT EXISTS "public"\."venthub_returns" \(([\s\S]*?)\n\);/)
  if (!blok) throw new Error('tabanda "public"."venthub_returns" bloğu yok')
  for (const m of blok[1].matchAll(/^\s+"([a-z_0-9]+)"\s/gm)) kolonlar.add(m[1])
  for (const mig of zincir) {
    if (mig.ad.slice(0, 8) <= taban.tarih) continue
    for (const alter of tek(mig.sql).matchAll(/alter table (?:only )?(?:if exists )?(?:public\.)?venthub_returns ([^;]*);/g)) {
      for (const add of alter[1].matchAll(/add column (?:if not exists )?"?([a-z_0-9]+)"?/g)) kolonlar.add(add[1])
    }
  }
  return kolonlar
}

function degerlendir(zincir: Mig[], taban: { tarih: string; sql: string }): string[] {
  const h: string[] = []

  // (a)+(e) üç tetik: son durum var, BEFORE INSERT OR UPDATE, doğru tablo ve fonksiyon
  for (const [ad, tablo, fonk] of TETIKLER) {
    const t = sonTetik(zincir, ad)
    if (!t) { h.push(`(a) ${ad} tetiği zincirde yok ya da düşürülmüş`); continue }
    if (!t.includes(`before insert or update on public.${tablo}`)) h.push(`(a) ${ad} BEFORE INSERT OR UPDATE on ${tablo} değil`)
    if (!t.includes(`execute function public.${fonk}()`)) h.push(`(a) ${ad} ${fonk}'ı çağırmıyor`)
  }

  // (b)+(c) genel bekçi: INVOKER, izin listesi, işaret
  const g = sonFonk(zincir, 'istemci_yazma_bekcisi')
  if (!g) h.push('(b) istemci_yazma_bekcisi fonksiyonu yok')
  else {
    if (!g.includes('security invoker') || g.includes('security definer')) h.push('(b) istemci_yazma_bekcisi INVOKER değil')
    if (!g.includes(IZIN_LISTESI)) h.push('(b) istemci_yazma_bekcisi izin listesi kuralı yok')
    if (/current_user in \('anon'/.test(g)) h.push('(b) istemci_yazma_bekcisi YASAK listesine döndü')
    if (!g.includes('not public.is_admin_claim()')) h.push('(b) istemci_yazma_bekcisi is_admin_claim kullanmıyor')
    if (!g.includes("'rec355_bekci:")) h.push('(c) istemci_yazma_bekcisi REC355_BEKCI işaretini taşımıyor')
  }

  // (b)+(c)+(g) iade bekçisi
  const i = sonFonk(zincir, 'iade_istemci_kayit_bekcisi')
  if (!i) h.push('(b) iade_istemci_kayit_bekcisi fonksiyonu yok')
  else {
    if (!i.includes('security invoker') || i.includes('security definer')) h.push('(b) iade bekçisi INVOKER değil')
    if (!i.includes(IADE_IZIN)) h.push('(b) iade bekçisi izin listesi kuralı yok')
    if (!i.includes("'rec355_bekci:")) h.push('(c) iade bekçisi REC355_BEKCI işaretini taşımıyor')
    if (!i.includes("new.status is distinct from 'requested'")) h.push('(g) iade bekçisi status kontrolü yok')
    for (const kol of iadeKolonlari(zincir, taban)) {
      if (IADE_IZINLI.has(kol)) continue
      if (!i.includes(`new.${kol} is not null`)) h.push(`(g) iade kolonu ${kol} müşteriye açık — bekçi yasak listesinde yok`)
    }
  }

  // (d) anon'a yazma, rec355'ten SONRA geri verilmemeli (tablo adıyla ya da "all tables in schema")
  const idx = zincir.findIndex((m) => m.ad === REC355)
  const sonra = idx < 0 ? [] : zincir.slice(idx + 1)
  const hedef = `(?:(?:public\\.)?(?:${TABLOLAR.join('|')})|all tables in schema public)`
  const geriVer = new RegExp(`grant [^;]*\\b(?:all|insert|update|delete|truncate)\\b[^;]* on (?:table )?${hedef}\\b[^;]* to [^;]*\\banon\\b`)
  for (const m of sonra) if (geriVer.test(tek(m.sql))) h.push(`(d) ${m.ad} anon'a yazma yetkisini geri veriyor`)
  if (idx >= 0) {
    const r = tek(zincir[idx].sql)
    for (const t of TABLOLAR) if (!r.includes(`revoke all on public.${t} from anon;`)) h.push(`(d) rec355 ${t} için anon revoke yok`)

    // (f) davranış guard'ı yanlış yeşile karşı: ön koşul sayımı, önek işaret denetimi, "ateşlenmedi" raise
    if (!r.includes('select count(*) into v_gorunur')) h.push('(f) guard ön koşul sayımı yok')
    if (!r.includes("v_msg not like 'rec355\\_bekci:%'")) h.push('(f) guard işaret önek denetimi yok')
    if (!r.includes('bekci atesl')) h.push('(f) guard "bekçi ateşlenmedi" raise yok')
  } else h.push('rec355 migration zincirde yok')

  return h
}

describe('INV-SIPARIS-ISTEMCI-YAZMA-1 · müşteri sipariş verisine yazamaz', () => {
  const zincir = gercekZincir()
  const taban = enYeniTaban()

  it('⭐gerçek zincir sözleşmeyi sağlıyor', () => {
    expect(degerlendir(zincir, taban)).toEqual([])
  })

  it('iade kolon evreni tabanın YALNIZ public bloğundan okunuyor (15 kolon, arşiv şeması karışmıyor)', () => {
    expect(iadeKolonlari(zincir, taban).size).toBe(15)
  })

  describe('AYIRT EDİCİLİK — her ihlal yakalanıyor', () => {
    const idx = zincir.findIndex((m) => m.ad === REC355)
    const degis = (d: (s: string) => string): Mig[] => {
      expect(idx, 'rec355 migration bulunamadı').toBeGreaterThanOrEqual(0)
      const yeni = d(zincir[idx].sql)
      expect(yeni, 'sabotaj metni değiştirmedi').not.toBe(zincir[idx].sql)
      return zincir.map((m, i) => (i === idx ? { ...m, sql: yeni } : m))
    }
    const ekle = (sql: string): Mig[] => [...zincir, { ad: '29991231000000_sabotaj.sql', sql }]
    // Kolon YALNIZ "public". bloğuna eklenir (arşiv şemasındaki aynı adlı tablo evrene girmemeli).
    const tabanEk = (kol: string) => {
      const bas = 'CREATE TABLE IF NOT EXISTS "public"."venthub_returns" (\n'
      expect(taban.sql.includes(bas), 'tabanda public iade bloğu yok').toBe(true)
      return { ...taban, sql: taban.sql.replace(bas, `${bas}    "${kol}" "text",\n`) }
    }

    const kollar: [string, () => string[], RegExp][] = [
      ['sipariş tetiği sonradan düşürüldü', () => degerlendir(ekle('drop trigger if exists orders_istemci_yazma_bekcisi on public.venthub_orders;'), taban), /\(a\) orders_istemci_yazma_bekcisi tetiği/],
      ['kalem tetiği yalnız INSERT oldu', () => degerlendir(degis((s) => s.replace('before insert or update on public.venthub_order_items', 'before insert on public.venthub_order_items')), taban), /\(a\) order_items_istemci_yazma_bekcisi BEFORE/],
      ['bekçi DEFINER oldu', () => degerlendir(degis((s) => s.replace(/(istemci_yazma_bekcisi\(\)\nreturns trigger\nlanguage plpgsql\n)security invoker/, '$1security definer')), taban), /\(b\) istemci_yazma_bekcisi INVOKER/],
      ['yasak listesine dönüldü', () => degerlendir(degis((s) => s.replace("current_user not in ('service_role', 'postgres', 'supabase_admin')", "current_user in ('anon', 'authenticated')")), taban), /\(b\) istemci_yazma_bekcisi izin listesi/],
      ['işaret kalktı', () => degerlendir(degis((s) => s.replace("'REC355_BEKCI: % tablosuna", "'% tablosuna")), taban), /\(c\) istemci_yazma_bekcisi REC355_BEKCI/],
      ['iade bekçisi refund_amount kontrolünü kaybetti', () => degerlendir(degis((s) => s.replace('or new.refund_amount is not null', '')), taban), /\(g\) iade kolonu refund_amount/],
      ['iadeye yeni yönetici kolonu eklendi (sonraki migration)', () => degerlendir(ekle('alter table public.venthub_returns add column if not exists refund_iban text;'), taban), /\(g\) iade kolonu refund_iban/],
      ['iadeye yeni yönetici kolonu eklendi (taban)', () => degerlendir(zincir, tabanEk('refund_iban')), /\(g\) iade kolonu refund_iban/],
      ['anon\'a tabloyla yetki geri verildi', () => degerlendir(ekle('grant insert on public.venthub_returns to anon;'), taban), /\(d\) 29991231000000_sabotaj\.sql anon/],
      ['anon\'a "all tables in schema" ile yetki geri verildi', () => degerlendir(ekle('grant all on all tables in schema public to anon, authenticated;'), taban), /\(d\) 29991231000000_sabotaj\.sql anon/],
      ['anon revoke kalktı', () => degerlendir(degis((s) => s.replace('revoke all on public.venthub_order_items from anon;', '')), taban), /\(d\) rec355 venthub_order_items/],
      ['guard ön koşulu kalktı', () => degerlendir(degis((s) => s.replace('select count(*) into v_gorunur', 'select 1 into v_gorunur')), taban), /\(f\) guard ön koşul/],
      ['guard işaret denetimi kalktı', () => degerlendir(degis((s) => s.replace("v_msg not like 'REC355\\_BEKCI:%'", 'false')), taban), /\(f\) guard işaret/],
    ]

    it('taban (değişmemiş zincir + ilgisiz ek) temiz', () => {
      expect(degerlendir(ekle('select 1;'), taban)).toEqual([])
    })
    for (const [ad, kos, beklenen] of kollar) {
      it(ad, () => {
        expect(kos().join(' | ')).toMatch(beklenen)
      })
    }
  })
})
