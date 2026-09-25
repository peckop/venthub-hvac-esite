// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-QUOTE-YAYIM-1 — teklif yayımının yan etkileri SUNUCUDA (REC-384).
 *
 * ⭐NİÇİN VAR: karar 104 canlı koşumunda (2026-09-24) teklif yayımlandı ama müşteri e-postası gitmedi —
 * bildirim tarayıcıdan, yayım döndükten SONRA ateşleniyordu. sent_at ve quote_no da yazılmıyordu; fiyat
 * tutarlılığı yalnız istemcideydi. Onarım bunları draft→quoted tetiklerine taşıdı. Bu kapı onarımın
 * güvenlik ve doğruluk şartlarının GERİ KAÇMASINI tutar:
 *   (a) damga tetiği: adı geçiş kapısından SONRA sıralanır, WHEN draft→quoted, DEFINER; sunucu fiyat/para/
 *       kalem kapısı; toplam snapshot; sent_at; sayaç anahtarı new.tenant_id (JWT değil), taşmada RAISE.
 *   (b) sayaç tablosu: RLS açık, politika YOK, public/anon/authenticated'dan REVOKE.
 *   (c) bildirim: AFTER tetiği WHEN draft→quoted; ortak yardımcı Vault bayrağını okur; yeniden gönderim
 *       aynı yardımcıyı ZORUNLU kipte çağırır (bayrak kapalıyken hata).
 *   (d) yetkiler: yardımcı üç rolden kapalı; yeniden gönderim anon kapalı, authenticated açık.
 *   (e) kalem kilidi: yayımlanmış belgenin kalemi değişmez.
 * İstemci çağrısının kaldırılması (Vault bayrağı açıldıktan sonra, ayrı PR) bu kapıya o PR'da eklenir.
 */
const MIG_DIZIN = path.join(process.cwd(), 'supabase', 'migrations')

type Mig = { ad: string; sql: string }

const yorumsuz = (s: string) => s.replace(/--[^\n]*/g, '')
const tek = (s: string) => yorumsuz(s).toLowerCase().replace(/\s+/g, ' ')

function gercekZincir(): Mig[] {
  return fs
    .readdirSync(MIG_DIZIN)
    .filter((a) => a.endsWith('.sql'))
    .sort()
    .map((ad) => ({ ad, sql: fs.readFileSync(path.join(MIG_DIZIN, ad), 'utf8') }))
}

/** Zincirdeki SON fonksiyon tanımı (başlık + gövde), tek satıra indirilmiş. */
function sonFonk(zincir: Mig[], ad: string): string | null {
  const desen = new RegExp(
    `create\\s+(?:or\\s+replace\\s+)?function\\s+(?:public\\.)?${ad}\\s*\\([\\s\\S]*?\\$(\\w*)\\$[\\s\\S]*?\\$\\1\\$`,
    'gi',
  )
  let son: string | null = null
  for (const m of zincir) for (const e of yorumsuz(m.sql).matchAll(desen)) son = e[0]
  return son === null ? null : son.toLowerCase().replace(/\s+/g, ' ')
}

/** Zincirdeki SON tetik tanımı. */
function sonTetik(zincir: Mig[], ad: string): string | null {
  const desen = new RegExp(`create\\s+trigger\\s+${ad}\\b[^;]*;`, 'gi')
  let son: string | null = null
  for (const m of zincir) for (const e of yorumsuz(m.sql).matchAll(desen)) son = e[0]
  return son === null ? null : son.toLowerCase().replace(/\s+/g, ' ')
}

/** Nesne için son GRANT/REVOKE (execute|all) olayı. */
function sonYetki(zincir: Mig[], hedef: RegExp, rol: string): 'grant' | 'revoke' | null {
  let son: 'grant' | 'revoke' | null = null
  const rolDes = new RegExp(`\\b(?:to|from) (?:[a-z_]+ ?, ?)*${rol}\\b`)
  for (const m of zincir) {
    for (const ifade of tek(m.sql).split(';')) {
      if (!hedef.test(ifade) || !rolDes.test(ifade)) continue
      if (/\bgrant (?:execute|all)/.test(ifade)) son = 'grant'
      else if (/\brevoke (?:execute|all)/.test(ifade)) son = 'revoke'
    }
  }
  return son
}

const DRAFT_QUOTED = /when \( ?old\.status = 'draft' and new\.status = 'quoted' ?\)/

function degerlendir(zincir: Mig[]): string[] {
  const h: string[] = []

  // (a) damga tetiği
  const damgaTetik = sonTetik(zincir, 'trg_stamp_quote_published')
  if (!damgaTetik) h.push('(a) trg_stamp_quote_published yok')
  else {
    if (!/before update on public\.venthub_quotes/.test(damgaTetik)) h.push('(a) damga tetigi BEFORE UPDATE degil')
    if (!DRAFT_QUOTED.test(damgaTetik)) h.push('(a) damga tetiginde WHEN draft→quoted yok')
  }
  // Aynı olayda tetikler ADA göre koşar: geçiş kapısı önce, damga sonra, updated_at en son.
  if (!('trg_enforce_quote_status_transition' < 'trg_stamp_quote_published' && 'trg_stamp_quote_published' < 'trg_venthub_quotes_updated_at'))
    h.push('(a) tetik adi siralamasi bozuk')
  const damga = sonFonk(zincir, 'stamp_quote_published')
  if (!damga) h.push('(a) stamp_quote_published yok')
  else {
    if (!/security definer/.test(damga)) h.push('(a) damga DEFINER degil — sayac tablosuna yazamaz')
    if (!/unit_price is null/.test(damga)) h.push('(a) fiyatsiz kalem sunucuda reddedilmiyor')
    if (!/currency is distinct from new\.currency/.test(damga)) h.push('(a) karisik para birimi sunucuda reddedilmiyor')
    if (!/v_kalem = 0/.test(damga)) h.push('(a) kalemsiz belge sunucuda reddedilmiyor')
    if (!/new\.total_amount :=/.test(damga)) h.push('(a) toplam snapshot yazilmiyor')
    if (!/new\.sent_at := now\(\)/.test(damga)) h.push('(a) sent_at yazilmiyor')
    if (!/values \( ?new\.tenant_id, v_gun, 1 ?\)/.test(damga)) h.push('(a) sayac anahtari new.tenant_id degil')
    if (/jwt_tenant_id/.test(damga)) h.push('(a) sayac JWT kiracisina bagli — service_role yolunda NULL')
    if (!/v_sira > 9999/.test(damga)) h.push('(a) tasmada RAISE yok')
    if (!/new\.amended_from is null and new\.quote_no is null/.test(damga)) h.push('(a) numara yalniz koke ve bir kez kurali yok')
    if (!/'tk-' \|\| to_char\(v_gun, 'yyyymmdd'\)/.test(damga)) h.push('(a) numara bicimi TK-YYYYMMDD-NNNN degil')
    if (!/europe\/istanbul/.test(damga)) h.push('(a) is gunu Europe/Istanbul degil')
  }

  // (b) sayaç tablosu
  const tum = zincir.map((m) => tek(m.sql)).join(' ')
  if (!/alter table public\.quote_number_counters enable row level security/.test(tum)) h.push('(b) sayac tablosunda RLS acik degil')
  if (!/revoke all on public\.quote_number_counters from public, anon, authenticated/.test(tum)) h.push('(b) sayac tablosu REVOKE eksik')
  if (/create policy [^;]* on public\.quote_number_counters/.test(tum)) h.push('(b) sayac tablosunda politika var — erisim yalniz DEFINER olmali')

  // (c) bildirim
  const bildirimTetik = sonTetik(zincir, 'trg_notify_quote_published')
  if (!bildirimTetik || !/after update on public\.venthub_quotes/.test(bildirimTetik) || !DRAFT_QUOTED.test(bildirimTetik))
    h.push('(c) bildirim tetigi AFTER UPDATE + WHEN draft→quoted degil')
  const kuyruk = sonFonk(zincir, '_quote_published_enqueue')
  if (!kuyruk || !/'quote_published_webhook_enabled'/.test(kuyruk)) h.push('(c) gonderim yardimcisi Vault bayragini okumuyor')
  const bildirim = sonFonk(zincir, 'notify_quote_published')
  if (!bildirim || !/_quote_published_enqueue\(new\.id, false\)/.test(bildirim)) h.push('(c) tetik ortak yardimciyi kullanmiyor')
  const tekrar = sonFonk(zincir, 'admin_resend_quote_published')
  if (!tekrar) h.push('(c) admin_resend_quote_published yok')
  else {
    if (!/_quote_published_enqueue\(p_quote_id, true\)/.test(tekrar)) h.push('(c) yeniden gonderim zorunlu kipte degil — bayrak kapaliyken sessiz gecer')
    if (!/is_admin_user\(\)/.test(tekrar)) h.push('(c) yeniden gonderimde admin kontrolu yok')
    if (!/for update/.test(tekrar)) h.push('(c) yeniden gonderimde satir kilidi yok')
    if (!/interval '15 minutes'/.test(tekrar)) h.push('(c) yeniden gonderim tavani yok')
  }

  // (d) yetkiler
  const kuyrukH = /on function (?:public\.)?_quote_published_enqueue\b/
  for (const rol of ['public', 'anon', 'authenticated'])
    if (sonYetki(zincir, kuyrukH, rol) !== 'revoke') h.push(`(d) gonderim yardimcisi ${rol} icin kapali degil`)
  const tekrarH = /on function (?:public\.)?admin_resend_quote_published\b/
  if (sonYetki(zincir, tekrarH, 'anon') !== 'revoke') h.push('(d) yeniden gonderim anon icin kapali degil')
  if (sonYetki(zincir, tekrarH, 'authenticated') !== 'grant') h.push('(d) yeniden gonderim authenticated icin acik degil')

  // (e) kalem kilidi
  const kilit = sonTetik(zincir, 'trg_quote_items_durum_kilidi')
  if (!kilit || !/before insert or update or delete on public\.venthub_quote_items/.test(kilit)) h.push('(e) kalem kilidi tetigi yok')
  const kilitF = sonFonk(zincir, 'quote_items_durum_kilidi')
  if (!kilitF || !/not in \('requested', 'draft'\)/.test(kilitF)) h.push('(e) kalem kilidi requested/draft disini reddetmiyor')

  return h
}

describe('INV-QUOTE-YAYIM-1 · teklif yayımının yan etkileri sunucuda', () => {
  const zincir = gercekZincir()

  it('⭐gerçek zincir sözleşmeyi sağlıyor', () => {
    expect(degerlendir(zincir)).toEqual([])
  })

  describe('AYIRT EDİCİLİK — her ihlal yakalanıyor', () => {
    const iyi = zincir.find((m) => m.ad.endsWith('_quote_yayim_sunucu.sql'))
    const bozuk = (d: (s: string) => string): Mig[] => {
      expect(iyi, 'REC-384 migration bulunamadi').toBeDefined()
      const yeni = d((iyi as Mig).sql)
      expect(yeni, 'sabotaj metni degistirmedi').not.toBe((iyi as Mig).sql)
      return [{ ad: 'x.sql', sql: yeni }]
    }
    const sabotajlar: [string, (s: string) => string, RegExp][] = [
      ['WHEN koşulu kalktı', (s) => s.replace(/when \(old\.status = 'draft' and new\.status = 'quoted'\)\n  execute function public\.stamp_quote_published/, 'execute function public.stamp_quote_published'), /\(a\) damga tetiginde WHEN/],
      ['fiyatsız kalem kapısı kalktı', (s) => s.replace("count(*) filter (where unit_price is null)", 'count(*) filter (where false)'), /\(a\) fiyatsiz/],
      ['sayaç JWT kiracısına bağlandı', (s) => s.replace('values (new.tenant_id, v_gun, 1)', 'values (public.jwt_tenant_id(), v_gun, 1)'), /\(a\) sayac/],
      ['taşma kontrolü kalktı', (s) => s.replace('if v_sira > 9999 then', 'if false then'), /\(a\) tasmada/],
      ['damga INVOKER oldu', (s) => s.replace(/(function public\.stamp_quote_published\(\)\nreturns trigger\nlanguage plpgsql\n)security definer/, '$1security invoker'), /\(a\) damga DEFINER/],
      ['sayaç tablosuna politika eklendi', (s) => s.replace('revoke all on public.quote_number_counters from public, anon, authenticated;', "$&\ncreate policy herkes on public.quote_number_counters for select using (true);"), /\(b\) sayac tablosunda politika/],
      ['bayrak okuması kalktı', (s) => s.replace("where name = 'quote_published_webhook_enabled'", "where name = 'baska'"), /\(c\) gonderim yardimcisi Vault/],
      ['yeniden gönderim sessiz kipe düştü', (s) => s.replace('_quote_published_enqueue(p_quote_id, true)', '_quote_published_enqueue(p_quote_id, false)'), /\(c\) yeniden gonderim zorunlu/],
      ['yardımcı authenticated\'a açıldı', (s) => s.replace('revoke all on function public._quote_published_enqueue(uuid, boolean) from public, anon, authenticated;', "$&\ngrant execute on function public._quote_published_enqueue(uuid, boolean) to authenticated;"), /\(d\) gonderim yardimcisi authenticated/],
      ['yeniden gönderim anon\'a açık kaldı', (s) => s.replace('revoke execute on function public.admin_resend_quote_published(uuid) from anon;', ''), /\(d\) yeniden gonderim anon/],
      ['kalem kilidi quoted\'a izin verdi', (s) => s.replace("not in ('requested', 'draft')", "not in ('requested', 'draft', 'quoted')"), /\(e\) kalem kilidi requested/],
    ]

    it('taban (yalnız bu migration) temiz', () => {
      expect(degerlendir(bozuk((s) => s + '\n'))).toEqual([])
    })
    for (const [ad, d, beklenen] of sabotajlar) {
      it(ad, () => {
        expect(degerlendir(bozuk(d)).join(' | ')).toMatch(beklenen)
      })
    }
  })
})
