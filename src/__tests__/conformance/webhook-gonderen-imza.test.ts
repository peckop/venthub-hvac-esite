// @vitest-environment node
import { createHmac } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { webhookImzaGecerli, webhookImzaMetni } from '../../../supabase/functions/_shared/sabit_zaman'

/**
 * INV-WEBHOOK-GONDEREN-IMZA-1 · `notify_order_paid`, `notify_quote_request_created` ve `_quote_published_enqueue`
 * Edge webhook uçlarının İMZALI sözleşmesiyle gönderir (OPS-293 D2).
 *
 * Sözleşme (supabase/functions/_shared/sabit_zaman.ts): imza = BASE64(HMAC-SHA256(sır, `<x-timestamp>.<x-event-id>.<ham gövde>`)),
 * başlıklar x-signature / x-timestamp / x-event-id; düz `x-webhook-secret` ARTIK gitmez. Ham gövde `v_govde::text`
 * (pg_net `convert_to(body::text,'UTF8')` ile yazar, 2026-11-15'te canlıdan okundu).
 *
 * KAPI TEK FONKSİYONDAN GEÇER (`ihlaller`): gerçek migration ve sabotajlı kopyalar aynı denetçiyle ölçülür; böylece
 * sabotajın kırmızı vermesi totoloji değildir. Keşif fs'ten; boş evren kırmızı.
 *
 * SABİT VEKTÖR: canlı DB'de (2026-11-15, salt okuma, sahte sır) `encode(extensions.hmac('t.e.govde','sahte-sir','sha256'),'base64')`
 * = VEKTOR; Node formülü ile eşitliği SQL formülü = Node formülü kanıtıdır.
 */

const DIR = join(process.cwd(), 'supabase', 'migrations')
const DOSYA = '20261115213000_webhook_gonderen_imzali_base64.sql'
const FONKSIYONLAR = ['notify_order_paid', 'notify_quote_request_created', '_quote_published_enqueue'] as const
const VEKTOR = 'wm33VSXovFZvhgxjwo9eMEr5/RiZ98JCd06uhvFp9wI='

function temizle(sql: string): string {
  return sql
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((s) => s.replace(/--.*$/, ''))
    .join('\n')
}

function govdeler(sql: string): Record<string, string> {
  const kod = temizle(sql)
  const sonuc: Record<string, string> = {}
  for (const ad of FONKSIYONLAR) {
    const bas = kod.search(new RegExp(`create\\s+or\\s+replace\\s+function\\s+public\\.${ad}\\s*\\(`, 'i'))
    if (bas < 0) continue
    const kalan = kod.slice(bas + 1)
    const sonraki = kalan.search(/create\s+or\s+replace\s+function/i)
    const bitis = sonraki < 0 ? kalan.search(/\nrevoke\s/i) : sonraki
    sonuc[ad] = kod.slice(bas, bitis < 0 ? undefined : bas + 1 + bitis)
  }
  return sonuc
}

/** Tek kilit fonksiyonu: boş dizi = sözleşmeye uyuyor. */
function ihlaller(sql: string): string[] {
  const g = govdeler(sql)
  const out: string[] = []
  for (const ad of FONKSIYONLAR) {
    const f = g[ad]
    if (!f) {
      out.push(`${ad}: tanim yok`)
      continue
    }
    if (!/v_govde\s*:=\s*jsonb_build_object\(/i.test(f)) out.push(`${ad}: govde v_govde jsonb degiskeninde degil`)
    if (!/v_olay\s*:=\s*gen_random_uuid\(\)::text/i.test(f)) out.push(`${ad}: olay kimligi gen_random_uuid()::text degil`)
    if (!/v_zaman\s*:=\s*\(extract\(epoch from now\(\)\)\s*\*\s*1000\)::bigint::text/i.test(f)) out.push(`${ad}: zaman epoch ms degil`)
    if (!/extensions\.hmac\(\s*v_zaman\s*\|\|\s*'\.'\s*\|\|\s*v_olay\s*\|\|\s*'\.'\s*\|\|\s*v_govde::text\s*,\s*(?:webhook_secret|v_sir)\s*,\s*'sha256'\s*\)/i.test(f)) {
      out.push(`${ad}: imza metni zaman||'.'||olay||'.'||v_govde::text + sha256 + extensions.hmac degil`)
    }
    if (!/encode\([\s\S]*?,\s*'base64'\s*\)/i.test(f)) out.push(`${ad}: base64 kodlama yok`)
    if (/'hex'/i.test(f)) out.push(`${ad}: hex kodlama var`)
    if (/x-webhook-secret/i.test(f)) out.push(`${ad}: x-webhook-secret basligi var`)
    // Başlık DEĞERİ imzalanan değişkene bağlı olmalı (aksi hâlde imza tutmaz, canlıda 401).
    for (const [b, v] of [['x-signature', 'v_imza'], ['x-timestamp', 'v_zaman'], ['x-event-id', 'v_olay']]) {
      if (!new RegExp(`'${b}'\\s*,\\s*${v}\\b`, 'i').test(f)) out.push(`${ad}: ${b} basligi ${v} degiskenine bagli degil`)
    }
    if (!/body\s*:=\s*v_govde\b/i.test(f)) out.push(`${ad}: http_post govdesi v_govde degil`)
    if (!/security\s+definer/i.test(f)) out.push(`${ad}: security definer yok`)
  }
  return out
}

const sql = readFileSync(join(DIR, DOSYA), 'utf8')

describe('INV-WEBHOOK-GONDEREN-IMZA-1 migration metni', () => {
  it('evren boş değil: migration dizinde ve üç fonksiyon tanımlı', () => {
    expect(readdirSync(DIR)).toContain(DOSYA)
    expect(Object.keys(govdeler(sql)).sort()).toEqual([...FONKSIYONLAR].sort())
  })

  it('üç fonksiyon da base64 imzalı, üç başlıklı, düz sırsız (tek kilit fonksiyonu)', () => {
    expect(ihlaller(sql)).toEqual([])
  })

  it('REVOKE kolları korunur (public, anon, authenticated)', () => {
    const kod = temizle(sql)
    expect(kod).toMatch(/revoke\s+execute\s+on\s+function\s+public\.notify_order_paid\(\)\s+from\s+public,\s*anon,\s*authenticated/i)
    expect(kod).toMatch(/revoke\s+execute\s+on\s+function\s+public\.notify_quote_request_created\(\)\s+from\s+public,\s*anon,\s*authenticated/i)
    expect(kod).toMatch(/revoke\s+all\s+on\s+function\s+public\._quote_published_enqueue\(uuid,\s*boolean\)\s+from\s+public,\s*anon,\s*authenticated/i)
  })

  it('_quote_published_enqueue search_path eskisi gibi pg_catalog,public,pg_temp (extensions yok → hmac nitelikli)', () => {
    const f = govdeler(sql)._quote_published_enqueue
    expect(f).toMatch(/set\s+search_path\s+to\s+'pg_catalog',\s*'public',\s*'pg_temp'/i)
    expect(f).not.toMatch(/search_path[^\n]*extensions/i)
  })
})

describe('INV-WEBHOOK-GONDEREN-IMZA-1 davranış: Node formülü Edge doğrulayıcısına karşı', () => {
  const sir = 'imza-test-siri'
  const zaman = '1763200000000'
  const olay = '6f1c2d3e-4a5b-4c6d-8e7f-0a1b2c3d4e5f'
  const govde = '{"event": "quote_published", "quote_id": "55555555-5555-4555-8555-555555555555"}'
  const imza = (metin: string, kodlama: 'base64' | 'hex' = 'base64') => createHmac('sha256', sir).update(metin).digest(kodlama)

  it('SQL formülüyle aynı imza Edge webhookImzaGecerli tarafından KABUL edilir', async () => {
    expect(await webhookImzaGecerli(sir, zaman, olay, govde, imza(`${zaman}.${olay}.${govde}`))).toBe(true)
    expect(webhookImzaMetni(zaman, olay, govde)).toBe(`${zaman}.${olay}.${govde}`)
  })

  it('yanlış sıra, hex ve yalnız-gövde imzası REDDEDİLİR', async () => {
    expect(await webhookImzaGecerli(sir, zaman, olay, govde, imza(`${olay}.${zaman}.${govde}`))).toBe(false)
    expect(await webhookImzaGecerli(sir, zaman, olay, govde, imza(`${zaman}.${olay}.${govde}`, 'hex'))).toBe(false)
    expect(await webhookImzaGecerli(sir, zaman, olay, govde, imza(govde))).toBe(false)
    expect(await webhookImzaGecerli(sir, zaman, olay, govde, imza(`${zaman}.${govde}`))).toBe(false)
  })

  it('SABİT VEKTÖR: canlı SQL hmac(base64) çıktısı Node hesabına eşit', () => {
    const node = createHmac('sha256', 'sahte-sir').update('t.e.govde').digest('base64')
    expect(node).toBe(VEKTOR)
  })
})

describe('INV-WEBHOOK-GONDEREN-IMZA-1 sabotaj: aynı kilit bozuk metinde KIRMIZI verir', () => {
  const bozuk: [string, (s: string) => string][] = [
    ['base64 -> hex', (s) => s.replace(/'base64'/g, "'hex'")],
    ['imza metninden olay çıkar', (s) => s.replace(/v_zaman \|\| '\.' \|\| v_olay \|\| '\.' \|\| v_govde::text/g, "v_zaman || '.' || v_govde::text")],
    ['x-webhook-secret ekle', (s) => s.replace(/'x-signature', v_imza,/g, "'x-webhook-secret', webhook_secret, 'x-signature', v_imza,")],
    ['x-event-id başlığını sil', (s) => s.replace(/,\s*'x-event-id', v_olay/g, '')],
    ['extensions şemasını sil', (s) => s.replace(/extensions\.hmac\(/g, 'hmac(')],
    ['olay başlığı imzadan bağımsız', (s) => s.replace(/'x-event-id', v_olay/g, "'x-event-id', gen_random_uuid()::text")],
    ['imza anahtarı Vault sırrı değil', (s) => s.replace(/, webhook_secret, 'sha256'/g, ", webhook_url, 'sha256'")],
    ['zaman başlığı imzadan bağımsız', (s) => s.replace(/'x-timestamp', v_zaman/g, "'x-timestamp', '1'")],
    ['gövdeyi imzadan ayır', (s) => s.replace(/body := v_govde/g, "body := jsonb_build_object('x', 1)")],
  ]

  it('gerçek metin temiz (kontrol)', () => {
    expect(ihlaller(sql)).toEqual([])
  })

  for (const [ad, don] of bozuk) {
    it(`${ad}`, () => {
      const m = don(sql)
      expect(m).not.toBe(sql)
      expect(ihlaller(m).length).toBeGreaterThan(0)
    })
  }
})
