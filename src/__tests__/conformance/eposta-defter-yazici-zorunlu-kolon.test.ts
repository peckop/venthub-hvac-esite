/**
 * INV-EPOSTA-DEFTER-YAZICI-1 · REC-368 M0 — order_email_events yazıcısı şemaya uyar ve hatasını yutmaz.
 *
 * NİÇİN: `order_email_events.email_to` ve `subject` NOT NULL ve varsayılansızdır; `order-paid-webhook`
 * bu iki alanı vermeden insert ediyordu. supabase-js şema ihlalinde hata FIRLATMAZ, `{ error }` döner;
 * kod `try { } catch { }` içinde olduğundan hiçbir şey yakalanmadı, `denemeId` sessizce `null` kaldı
 * ve defter (T137-VH'nin "niçin gitmedi" cevabı) HİÇ satır yazmadı. Yol canlıda hiç koşmadığı için
 * (ödenmiş sipariş 0) bugüne dek görünmedi.
 *
 * Kollar (her biri bağımsız; biri yeşil diye ötekiler yeşil sayılmaz):
 *  (a) yazıcının her insert'i, şema tabanındaki NOT NULL + varsayılansız kolonların HEPSİNİ verir
 *  (b) her `order_email_events` yazımının sonucu `{ error }` olarak alınıp denetlenir (yalnız try/catch DEĞİL)
 *  (c) ayrıştırıcı sağlam: eksik alanlı ve hata yok sayan eski kodu yakalar (sabotaj çapası)
 *  (d) evren kanaryası: tabanda tablo ve zorunlu kolonlar gerçekten bulundu (boş küme sessizce yeşil olmasın)
 *
 * Kapsam: yalnız `order-paid-webhook` (M0). Tüm gönderim uçlarını kapsayan INV-NOTIFY-3 A PR'ıyla gelir.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = resolve(__dirname, '../../..')
const TABAN_DIZINI = join(KOK, 'supabase/baselines')
const YAZICI = join(KOK, 'supabase/functions/order-paid-webhook/index.ts')

/** Yorumları düşürür: açıklama metnindeki örnekler ihlal/kanıt sayılmaz (satır tabanlı, dize içi `//` korunur). */
function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
}

/**
 * Tabloyu tanımlayan EN YENİ `*_public_schema.sql`. "En yeni dosya" tek başına seçim kuralı DEĞİLDİR
 * (supabase/baselines/README.md, REC-336: dosyaların kapsamı farklı olabilir); bu yüzden dosya adına
 * değil İÇERİĞE bakılır: tablonun CREATE TABLE gövdesini taşıyan en yeni dosya. Hiçbirinde yoksa boş
 * döner ve (d) evren kanaryası kırmızı verir.
 */
function tanimliTaban(tablo: string): string {
  const adlar = readdirSync(TABAN_DIZINI).filter((a) => /^\d{4}-\d{2}-\d{2}_public_schema\.sql$/.test(a)).sort().reverse()
  for (const ad of adlar) {
    const icerik = readFileSync(join(TABAN_DIZINI, ad), 'utf8')
    if (zorunluKolonlar(icerik, tablo).length > 0) return icerik
  }
  return ''
}

/**
 * CREATE TABLE gövdesinden NOT NULL ve DEFAULT'suz kolonlar. İki döküm biçimini de okur:
 * eski `pg_dump` (`CREATE TABLE public.x (` / tırnaksız) ve `supabase db dump`
 * (`CREATE TABLE IF NOT EXISTS "public"."x" (` / tırnaklı).
 */
export function zorunluKolonlar(taban: string, tablo: string): string[] {
  const m = taban.match(new RegExp(`CREATE TABLE (?:IF NOT EXISTS )?"?public"?\\."?${tablo}"? \\(([\\s\\S]*?)\\n\\);`))
  if (!m) return []
  return m[1]
    .split('\n')
    .map((s) => s.trim().replace(/,$/, '').replace(/"/g, ''))
    .filter((s) => /^[a-z_]+\s/.test(s) && !/^(CONSTRAINT|PRIMARY|UNIQUE|CHECK|FOREIGN)\b/i.test(s))
    .filter((s) => /\bNOT NULL\b/.test(s) && !/\bDEFAULT\b/i.test(s))
    .map((s) => s.split(/\s+/)[0])
}

/** `.from('order_email_events')` sonrası `.insert({ ... })` gövdelerinin ÜST DÜZEY anahtarları. */
export function insertAnahtarKumeleri(kod: string): string[][] {
  const sonuc: string[][] = []
  const re = /\.from\('order_email_events'\)\s*\.insert\(\{/g
  for (let m = re.exec(kod); m; m = re.exec(kod)) {
    let derinlik = 1
    let i = m.index + m[0].length
    const bas = i
    while (i < kod.length && derinlik > 0) {
      if (kod[i] === '{') derinlik++
      else if (kod[i] === '}') derinlik--
      i++
    }
    const govde = kod.slice(bas, i - 1)
    const anahtarlar: string[] = []
    let d = 0
    for (const parca of govde.split(/(?<=[,\n])/)) {
      if (d === 0) {
        const a = parca.match(/^\s*([A-Za-z_]\w*)\s*(:|,|$)/)
        if (a) anahtarlar.push(a[1])
      }
      d += (parca.match(/[{[(]/g)?.length ?? 0) - (parca.match(/[})\]]/g)?.length ?? 0)
    }
    sonuc.push(anahtarlar)
  }
  return sonuc
}

/** Her `.from('order_email_events')` yazımı (insert/update) `error` alanını yakalıyor mu? */
export function hatasizYazimlar(kod: string): string[] {
  const bulunan: string[] = []
  const re = /\.from\('order_email_events'\)/g
  for (let m = re.exec(kod); m; m = re.exec(kod)) {
    const sonrasi = kod.slice(m.index, m.index + 600)
    if (!/\.(insert|update)\(/.test(sonrasi.slice(0, 120))) continue // okuma/sorgu bu kolun konusu değil
    const oncesi = kod.slice(Math.max(0, m.index - 120), m.index)
    // `const { error: x } = await supabase` (ya da `{ data, error: x }`) kalıbı bu çağrıdan hemen önce olmalı.
    if (!/\{[^}]*\berror\b[^}]*\}\s*=\s*await\s+supabase\s*$/.test(oncesi.replace(/\s+/g, ' ').trimEnd() + ' ')) {
      bulunan.push(sonrasi.slice(0, 60).replace(/\s+/g, ' '))
    }
  }
  return bulunan
}

describe('INV-EPOSTA-DEFTER-YAZICI-1', () => {
  const kod = yorumsuz(readFileSync(YAZICI, 'utf8'))
  const zorunlu = zorunluKolonlar(tanimliTaban('order_email_events'), 'order_email_events')
  const kumeler = insertAnahtarKumeleri(kod)

  it('(d) evren kanaryası: tabanda zorunlu kolonlar ve yazıcıda insert bulundu', () => {
    expect(zorunlu).toEqual(expect.arrayContaining(['order_id', 'email_to', 'subject']))
    // attempt + failed(yedek) + sent(yedek) = en az 3 insert.
    expect(kumeler.length).toBeGreaterThanOrEqual(3)
  })

  it('(a) her insert NOT NULL + varsayılansız kolonların hepsini verir', () => {
    const eksikler = kumeler.flatMap((anahtarlar, sira) =>
      zorunlu.filter((k) => !anahtarlar.includes(k)).map((k) => `insert #${sira + 1}: '${k}' verilmiyor`),
    )
    expect(eksikler).toEqual([])
  })

  it('(b) her defter yazımı { error } alır; try/catch tek başına yeterli sayılmaz', () => {
    expect(hatasizYazimlar(kod)).toEqual([])
  })

  it('(c-a) sabotaj: alıcı/konu vermeyen eski insert kırmızı verir', () => {
    const eski = `
      await supabase.from('order_email_events')
        .insert({ order_id: order.id, kind: KIND, provider: 'resend', status: 'attempt' })
    `
    const [anahtarlar] = insertAnahtarKumeleri(eski)
    expect(anahtarlar).toEqual(['order_id', 'kind', 'provider', 'status'])
    expect(zorunlu.filter((k) => !anahtarlar.includes(k))).toEqual(expect.arrayContaining(['email_to', 'subject']))
  })

  it('(c-b) sabotaj: sonucu hiç almayan yazım kırmızı verir, error alan yeşil kalır', () => {
    const kotu = `
      try {
        await supabase.from('order_email_events').update({ status: 'sent' }).eq('id', denemeId)
      } catch {}
    `
    const iyi = `
      const { error: yazimHatasi } = await supabase.from('order_email_events')
        .update({ status: 'sent' })
        .eq('id', denemeId)
    `
    expect(hatasizYazimlar(kotu)).toHaveLength(1)
    expect(hatasizYazimlar(iyi)).toEqual([])
  })

  it('(c-c) sabotaj: iç içe nesne (ör. after: { ... }) üst düzey anahtar sayılmaz', () => {
    const [anahtarlar] = insertAnahtarKumeleri(`
      supabase.from('order_email_events').insert({
        order_id: a,
        meta: { email_to: 'x', subject: 'y' },
      })
    `)
    expect(anahtarlar).toEqual(['order_id', 'meta'])
  })
})
