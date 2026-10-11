/**
 * KATALOG · ürün açıklama düzeltici kalıp kapısı (KTL-15) — kural birimleri + uçtan uca, SAHTE PostgREST'e karşı
 * (gerçek DB'ye çıkmaz).
 *
 * Kural → test eşlemesi (sabotaj tablosu bunu kullanır):
 *   P1 şema · P2 değişiklik · P3a iç referans · P3b abartı kalıbı (+ rakamlı hız kademesi muafiyeti) ·
 *   P3c editör notu · P3d biçim artığı · P3e EN dilinde Türkçe harf · P4 sonuç biçimi ·
 *   E1 kapı ağdan ÖNCE (kırmızıda sahte sunucuya sıfır istek) · E2 çıkış kodları (0/1/2) · E3 yazma yolu bozulmadı.
 */
import { execFile } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { abartiBul } from '../aile-blok-duzelt-kurallar.mjs'
import {
  editorIsaretiBul, planKapisi, planSemasi, sonucBicimBozuklugu, trHarfBul, urunPlani, yeniKapisi,
} from '../urun-aciklama-duzelt-kurallar.mjs'

const BETIK = join(__dirname, '..', 'urun-aciklama-duzelt.mjs')
type Plan = { eski: string; yeni: string; diller: string[]; skus: string[] }
const plan = (o: Partial<Plan> = {}): Plan => ({ eski: ', yüksek verimli ex-proof', yeni: ' ex-proof', diller: ['tr'], skus: ['VRT-1', 'VRT-2'], ...o })
const kural = (p: Plan, ad: string) => yeniKapisi(p).find((k) => k.kural === ad)
const kirmizi = (p: Plan) => yeniKapisi(p).filter((k) => k.ok === false).map((k) => k.kural)

// ------------------------------------------------------------------------------------------------
// P1 — şema
// ------------------------------------------------------------------------------------------------
describe('P1 şema', () => {
  it('geçerli plan: hata yok, plan döner', () => {
    const s = planSemasi(plan())
    expect(s.hatalar).toEqual([])
    expect(s.plan).not.toBeNull()
  })
  it('nesne olmayan girdi (dizi, null, metin) reddedilir', () => {
    for (const g of [null, [], 'plan', 7, undefined]) expect(planSemasi(g).hatalar.length, String(g)).toBeGreaterThan(0)
  })
  it('bilinmeyen anahtar reddedilir (yazım hatalı "yenı"/fazladan "not" sessizce geçmez)', () => {
    const s = planSemasi({ ...plan(), not: 'x' })
    expect(s.hatalar.join('|')).toContain('bilinmeyen anahtar "not"')
    expect(s.plan).toBeNull()
  })
  it('eski/yeni boş ya da metin değil → hata', () => {
    for (const o of [{ eski: '' }, { yeni: '' }, { eski: 5 }, { yeni: null }]) {
      expect(planSemasi({ ...plan(), ...o }).hatalar.length, JSON.stringify(o)).toBeGreaterThan(0)
    }
  })
  it('diller: boş, bilinmeyen dil, tekrar, dizi değil → hata', () => {
    for (const diller of [[], ['de'], ['tr', 'tr'], 'tr', ['TR']]) {
      expect(planSemasi({ ...plan(), diller }).hatalar.length, JSON.stringify(diller)).toBeGreaterThan(0)
    }
    expect(planSemasi(plan({ diller: ['tr', 'en'] })).hatalar).toEqual([])
  })
  it('skus: boş, tekrar, dizi değil, sayı ve SORGU ENJEKSİYONU ("A\\"),sku.neq.") → hata', () => {
    for (const skus of [[], ['A', 'A'], 'VRT-1', [7], ['VRT-1"),sku.neq.("x'], ['A B'], ['']]) {
      expect(planSemasi({ ...plan(), skus }).hatalar.length, JSON.stringify(skus)).toBeGreaterThan(0)
    }
  })
  it('planKapisi: şema hatasında kural ÇALIŞMAZ, gecti=false', () => {
    const k = planKapisi({ ...plan(), diller: [] })
    expect(k.semaHatalari.length).toBeGreaterThan(0)
    expect(k.kurallar).toEqual([])
    expect(k.gecti).toBe(false)
  })
})

// ------------------------------------------------------------------------------------------------
// P2 — değişiklik
// ------------------------------------------------------------------------------------------------
describe('P2 değişiklik', () => {
  it('temiz plan: bütün kurallar geçer', () => {
    const k = planKapisi(plan())
    expect(k.gecti).toBe(true)
    expect(k.kurallar.map((x) => x.kural)).toEqual(['P1', 'P2', 'P3a', 'P3b', 'P3c', 'P3d', 'P3e'])
  })
  it('eski = yeni → RED', () => {
    expect(kirmizi(plan({ eski: 'aynı', yeni: 'aynı' }))).toContain('P2')
  })
  it('NFC dışı yeni → RED (e + birleştirici işaret)', () => {
    expect(kirmizi(plan({ yeni: ' café' }))).toContain('P2')
  })
  it('çift boşluk → RED', () => {
    expect(kirmizi(plan({ yeni: ' ex  proof' }))).toContain('P2')
  })
  it('görünmez karakter (BOM, sıfır genişlik boşluk, yumuşak tire) → RED', () => {
    for (const c of ['﻿', '​', '­']) expect(kirmizi(plan({ yeni: ` ex${c}-proof` })), JSON.stringify(c)).toContain('P2')
  })
  it('kenar boşluk YASAK DEĞİL: silme komşu metinle yazılır (" ex-proof" geçer)', () => {
    expect(kirmizi(plan({ yeni: ' ex-proof' }))).toEqual([])
    expect(kirmizi(plan({ yeni: 'ex-proof ' }))).toEqual([])
  })
})

// ------------------------------------------------------------------------------------------------
// P3a..e — yeni metin kalıpları
// ------------------------------------------------------------------------------------------------
describe('P3a iç referans', () => {
  it('[DB], [Kaynak s.12], [s. 4], "Kaynak s. 9", html yorumu → RED', () => {
    for (const m of ['Gövde [DB] çelik.', 'Gövde [AVenS s.47] çelik.', 'Gövde [s. 4] çelik.', 'Gövde Kaynak s. 9 çelik.', 'Gövde <!-- not --> çelik.']) {
      expect(kirmizi(plan({ yeni: m })), m).toContain('P3a')
    }
  })
})

describe('P3b abartı kalıbı', () => {
  it('TR: üstün, maksimum, en iyi, garanti, tasarruf, gelişmiş, yüksek verimli → RED', () => {
    for (const m of ['Üstün verim.', 'Maksimum debi.', 'En iyi seçim.', '2 yıl garanti.', 'Enerji tasarrufu sağlar.', 'Gelişmiş kontrol.', 'Yüksek verimli motor.']) {
      expect(kirmizi(plan({ yeni: m })), m).toContain('P3b')
    }
  })
  it('EN: superior, best, maximum, most efficient, high-efficiency, advanced → RED', () => {
    for (const m of ['Superior airflow.', 'The best fan.', 'Maximum flow.', 'The most efficient unit.', 'High-efficiency motor.', 'Advanced control.']) {
      expect(kirmizi(plan({ diller: ['en'], yeni: m })), m).toContain('P3b')
    }
  })
  it('"üstünde" (üst + ünde) ve "karışık" gibi ek/gövde sözcükleri yanlış yakalanmaz', () => {
    expect(kirmizi(plan({ yeni: ' Gövdenin üstünde menteşe bulunur, karışık sinyal vermez.' }))).toEqual([])
  })
  it('hız kademesi SAYISI muaf: "iki hızlı", "4 hızlı kontrol seçeneği" (HR 450 AVEL D) geçer', () => {
    for (const m of ['iki hızlı motor', '4 hızlı kontrol seçeneğine sahip', 'Motor 3 hızlıdır.']) {
      expect(abartiBul(m).map((a) => a.ad), m).not.toContain('hızlı')
      expect(kirmizi(plan({ yeni: m })), m).toEqual([])
    }
  })
  it('muafiyet dar: "14 hızlı", "4 çok hızlı", "hızlı kurulum", "0 hızlı" ... hâlâ RED', () => {
    for (const m of ['14 hızlı motor', '4 çok hızlı motor', 'Hızlı kurulum', 'çok hızlı döner']) {
      expect(abartiBul(m).map((a) => a.ad), m).toContain('hızlı')
    }
  })
})

describe('P3c editör notu', () => {
  it('KALKTI/KALKAR/SİLİNİR/ÖNERİ/TODO/RED/ESKİ/YENİ büyük harfli editör sözcükleri → RED', () => {
    for (const s of ['KALKTI', 'KALKAR', 'KALDIRILDI', 'DÜŞER', 'SİLİNİR', 'SILINDI', 'ÖNERİ', 'TODO', 'RED', 'ESKİ', 'YENİ']) {
      expect(kirmizi(plan({ yeni: ` Gövde (… ${s} …) çelik.` })), s).toContain('P3c')
    }
  })
  it('GERÇEK VAKA: tablo hücresindeki "(… KALKTI …)" notu yeni metne taşınmıştı (10-09) → RED', () => {
    expect(kirmizi(plan({ yeni: ' Motor IE3 sınıfındadır (üstün dayanım KALKTI).' }))).toContain('P3c')
  })
  it('[[ ]], ok işareti, => ve parantezli büyük harfli not → RED', () => {
    for (const m of ['Gövde [[kontrol et]] çelik.', 'Eski → yeni', 'a => b', 'Gövde (NOT: ölçülmedi) çelik.', 'Gövde (ÖLÇÜ eksik) çelik.']) {
      expect(kirmizi(plan({ yeni: ` ${m}` })), m).toContain('P3c')
    }
  })
  it('küçük harfli normal sözcükler ve büyük harfli kısaltmalar geçer: "basınç düşer", "kalkar", "yeni model", "red", "IE3", "PTC", "HVLS"', () => {
    expect(editorIsaretiBul('Basınç düşer, kapak kalkar, yeni model red renkli, IE3 PTC HVLS.')).toEqual([])
    expect(kirmizi(plan({ yeni: ' Basınç düşer, kapak kalkar, IE3 PTC HVLS.' }))).toEqual([])
  })
})

describe('P3d biçim artığı', () => {
  it('---, [MANIFEST], "TR kaynak", satır başı >, dengesiz ** → RED', () => {
    for (const m of ['a --- b', 'a [MANIFEST] b', 'a TR kaynak b', 'a\n> alıntı', 'a **kalın b']) {
      expect(kirmizi(plan({ yeni: m })), m).toContain('P3d')
    }
  })
})

describe('P3e EN dili', () => {
  it('diller en içeriyorsa Türkçe harf → RED (en tek başına ve tr+en birlikte)', () => {
    expect(kirmizi(plan({ diller: ['en'], yeni: ' ışık and fan' }))).toContain('P3e')
    expect(kirmizi(plan({ diller: ['tr', 'en'], yeni: ' şık fan' }))).toContain('P3e')
    expect(trHarfBul('çğıöşüÇĞİÖŞÜ').length).toBe(12)
    expect(trHarfBul('ışık ışık')).toEqual(['ı', 'ş'])
  })
  it('TR planda Türkçe harf serbest; EN planda ASCII metin geçer', () => {
    expect(kural(plan({ yeni: ' şömine fanı' }), 'P3e')?.ok).toBeNull()
    expect(kirmizi(plan({ diller: ['en'], yeni: ' ex-proof' }))).toEqual([])
  })
})

// ------------------------------------------------------------------------------------------------
// P4 — sonuç biçimi
// ------------------------------------------------------------------------------------------------
describe('P4 sonuç biçimi', () => {
  it('değişimin yarattığı çift boşluk, noktalamadan önce boşluk, tekrarlı noktalama, kenar boşluk yakalanır', () => {
    expect(sonucBicimBozuklugu('Fan, ex-proof.', 'Fan,  ex-proof.')).toEqual(['cift bosluk'])
    expect(sonucBicimBozuklugu('Fan, ex-proof.', 'Fan , ex-proof.')).toEqual(['noktalamadan once bosluk'])
    expect(sonucBicimBozuklugu('Fan, ex-proof.', 'Fan,, ex-proof.')).toEqual(['tekrarli noktalama'])
    expect(sonucBicimBozuklugu('Fan, ex-proof.', 'Fan, ex-proof..')).toEqual(['tekrarli noktalama'])
    expect(sonucBicimBozuklugu('Fan, ex-proof.', ' Fan, ex-proof.')).toEqual(['kenar bosluk'])
  })
  it('eskiden beri var olan bozukluk bu değişikliğin suçu DEĞİL (ikisinde de varsa sayılmaz)', () => {
    expect(sonucBicimBozuklugu('Fan  ex-proof.', 'Fan  ex-proof tasarım.')).toEqual([])
  })
  it('temiz sonuç ve üç noktalı ifade: boş dizi', () => {
    expect(sonucBicimBozuklugu('Fan, ex-proof.', 'Fan ex-proof.')).toEqual([])
    expect(sonucBicimBozuklugu('Fan...', 'Fan...')).toEqual([])
  })
})

// ------------------------------------------------------------------------------------------------
// Uçtan uca — sahte PostgREST
// ------------------------------------------------------------------------------------------------
type Urun = { id: string; sku: string; name: string; updated_at: string; description_i18n: Record<string, string> }
// updated_at "+00:00" taşır: yazıcı bunu KODLAMAZSA sunucu '+'yı boşluk okur ve koşullu PATCH eşleşmez (PostgREST gibi).
const ilkUrunler = (): Urun[] => [
  { id: 'u1', sku: 'VRT-1', name: 'Ex fan 1', updated_at: '2026-10-09T10:00:00.123456+00:00', description_i18n: { tr: 'Güvenli fan, yüksek verimli ex-proof tasarım.', en: 'Safe fan, high-efficiency ex-proof design.' } },
  { id: 'u2', sku: 'VRT-2', name: 'Ex fan 2', updated_at: '2026-10-09T10:00:01.654321+00:00', description_i18n: { tr: 'Güvenli fan, yüksek verimli ex-proof tasarım.', en: 'Safe fan, high-efficiency ex-proof design.' } },
]

/**
 * Sunucu kipleri: normal · yaris-bir (başka yazar PATCH'ten hemen önce satırı değiştirir, ürün başına 1 kez) ·
 * yaris-surekli (her PATCH'ten önce) · yaris-ayni (başka yazar AYNI değişikliği yapar) · rls (PATCH sessizce 0 satır,
 * satır değişmez) · yut (PATCH yazmış gibi döner ama saklamaz) · jsonb-siralama (saklanan nesnenin anahtar sırası bozulur).
 */
type Kip = 'normal' | 'yaris-bir' | 'yaris-surekli' | 'yaris-ayni' | 'rls' | 'yut' | 'jsonb-siralama' | 'get-401' | 'patch-500'
let kip = 'normal' as Kip
const yarisYapildi = new Set<string>()
let zamanSayaci = 0
const yeniZaman = () => `2026-10-09T11:00:${String(++zamanSayaci).padStart(2, '0')}.000000+00:00`
const EZ_NOT = ' (eşzamanlı düzenleme)'
const baskaYazar = (u: Urun, ayni: boolean) => {
  u.description_i18n = ayni
    ? { ...u.description_i18n, tr: u.description_i18n.tr.replace(', yüksek verimli ex-proof', ' ex-proof') }
    : { ...u.description_i18n, en: u.description_i18n.en + EZ_NOT }
  u.updated_at = yeniZaman()
}

let urunler: Urun[] = ilkUrunler()
const istekler: { yontem: string; yol: string; govde: string }[] = []
let sunucu: Server
let taban = ''
let gecici = ''

beforeAll(async () => {
  gecici = mkdtempSync(join(tmpdir(), 'urun-aciklama-'))
  sunucu = createServer((req, res) => {
    let govde = ''
    req.on('data', (c) => { govde += String(c) })
    req.on('end', () => {
      istekler.push({ yontem: req.method ?? '', yol: req.url ?? '', govde })
      const url = new URL(req.url ?? '/', 'http://x')
      const json = (kod: number, v: unknown) => { res.writeHead(kod, { 'content-type': 'application/json' }); res.end(JSON.stringify(v)) }
      if (url.pathname !== '/rest/v1/products') return json(404, {})
      if (req.method === 'GET') {
        if (kip === 'get-401') return json(401, { message: 'Invalid API key' })
        const idKosul = url.searchParams.get('id')
        if (idKosul) return json(200, urunler.filter((u) => `eq.${u.id}` === idKosul))
        const istenen = [...(url.searchParams.get('sku') ?? '').matchAll(/"([^"]+)"/g)].map((m) => m[1])
        return json(200, urunler.filter((u) => istenen.includes(u.sku)))
      }
      if (req.method === 'PATCH') {
        const id = (url.searchParams.get('id') ?? '').replace(/^eq\./, '')
        const u = urunler.find((x) => x.id === id)
        if (!u) return json(200, [])
        if (kip === 'patch-500') return json(500, { message: 'internal error' })
        if (kip === 'yaris-surekli' || ((kip === 'yaris-bir' || kip === 'yaris-ayni') && !yarisYapildi.has(u.id))) {
          baskaYazar(u, kip === 'yaris-ayni')
          yarisYapildi.add(u.id)
        }
        if (kip === 'rls') return json(200, [])
        const kosul = url.searchParams.get('updated_at')   // URLSearchParams kodlanmamış '+'yı BOŞLUK okur (PostgREST gibi)
        if (kosul !== null && kosul !== `eq.${u.updated_at}`) return json(200, [])
        const istenenNesne = (JSON.parse(govde) as { description_i18n: Record<string, string> }).description_i18n
        if (kip === 'yut') return json(200, [{ ...u, description_i18n: istenenNesne }])
        u.description_i18n = kip === 'jsonb-siralama'
          ? Object.fromEntries(Object.entries(istenenNesne).sort(([a], [b]) => (a < b ? -1 : 1)))
          : istenenNesne
        u.updated_at = yeniZaman()   // products_set_updated_at tetiği
        return json(200, [u])
      }
      return json(405, {})
    })
  })
  await new Promise<void>((coz) => sunucu.listen(0, '127.0.0.1', coz))
  taban = `http://127.0.0.1:${(sunucu.address() as AddressInfo).port}`
})
afterAll(async () => {
  await new Promise<void>((coz) => sunucu.close(() => coz()))
  rmSync(gecici, { recursive: true, force: true })
})
beforeEach(() => {
  urunler = ilkUrunler(); istekler.length = 0; kip = 'normal'; yarisYapildi.clear(); zamanSayaci = 0
  rmSync(join(gecici, 'cikti'), { recursive: true, force: true })   // "envanter yok/var" doğrulamaları testler arası sızmasın
})

let sayac = 0
const planDosyasi = (p: unknown) => {
  const yol = join(gecici, `plan-${++sayac}.json`)
  writeFileSync(yol, typeof p === 'string' ? p : JSON.stringify(p), 'utf8')
  return yol
}
const calistir = (argumanlar: string[], onay = false) =>
  new Promise<{ kod: number; stdout: string; stderr: string }>((coz) => {
    const env = { ...process.env }
    delete env.CANLI_YAZIM_ONAYI
    if (onay) env.CANLI_YAZIM_ONAYI = 'evet'
    execFile(process.execPath, [BETIK, ...argumanlar], { env, timeout: 30000 }, (hata, stdout, stderr) => {
      const kod = hata ? (typeof (hata as NodeJS.ErrnoException & { code?: unknown }).code === 'number' ? ((hata as { code: number }).code) : 99) : 0
      coz({ kod, stdout, stderr })
    })
  })
const ag = (p: string, ...ek: string[]) => ['--plan', p, '--url', taban, '--key', 'k', '--out', join(gecici, 'cikti'), ...ek]

describe('E2 çıkış kodları ve --kapi-yalniz', () => {
  it('temiz plan --kapi-yalniz: çıkış 0, url/anahtar istenmez, ağa çıkılmaz', async () => {
    const r = await calistir(['--plan', planDosyasi(plan()), '--kapi-yalniz'])
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('KAPI TEMİZ')
    expect(istekler.length).toBe(0)
  })
  it('kirli plan --kapi-yalniz: çıkış 1, hangi kuralın düştüğü yazılır', async () => {
    const r = await calistir(['--plan', planDosyasi(plan({ yeni: ' ex-proof (üstün dayanım KALKTI)' })), '--kapi-yalniz'])
    expect(r.kod).toBe(1)
    expect(r.stdout).toMatch(/P3b abarti kalibi\s+GEÇMEDİ/)
    expect(r.stdout).toMatch(/P3c editor notu\s+GEÇMEDİ/)
    expect(r.stderr).toContain('KALIP KAPISI KIRMIZI')
  })
  it('şema hatası: çıkış 2 (plan hatası), kural satırı yok', async () => {
    const r = await calistir(['--plan', planDosyasi({ ...plan(), diller: [] }), '--kapi-yalniz'])
    expect(r.kod).toBe(2)
    expect(r.stderr).toContain('plan şeması geçersiz')
    expect(r.stdout).not.toContain('KALIP KAPISI')
  })
  it('plan JSON değil / dosya yok: çıkış 2', async () => {
    expect((await calistir(['--plan', planDosyasi('{bozuk'), '--kapi-yalniz'])).kod).toBe(2)
    expect((await calistir(['--plan', join(gecici, 'yok.json'), '--kapi-yalniz'])).kod).toBe(2)
  })
  it('--plan yok ya da (kapı-yalnız dışında) url/anahtar yok: çıkış 2', async () => {
    expect((await calistir([])).kod).toBe(2)
    expect((await calistir(['--plan', planDosyasi(plan())])).kod).toBe(2)
  })
})

describe('E1 kapı AĞDAN ÖNCE', () => {
  it('kırmızı kapıda --yaz + onay olsa bile sahte sunucuya SIFIR istek, PATCH yok, envanter yok, çıkış 1', async () => {
    const r = await calistir(ag(planDosyasi(plan({ yeni: ' ex-proof (ÖNERİ: üstün)' })), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('hiçbir şey okunmadı, hiçbir şey yazılmadı')
    expect(istekler).toEqual([])
    expect(existsSync(join(gecici, 'cikti'))).toBe(false)
  })
})

describe('E3 yazma yolu bozulmadı (iki anahtar, tam-1 eşleşme, ürün başına 1 PATCH)', () => {
  it('temiz plan KURU koşum: kapı satırları + "1 → değişecek", PATCH yok', async () => {
    const r = await calistir(ag(planDosyasi(plan())))
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('KALIP KAPISI')
    expect(r.stdout).toContain('tr: 1 → değişecek')
    expect(r.stdout).toContain('KURU KOŞUM')
    expect(istekler.filter((i) => i.yontem === 'PATCH')).toEqual([])
  })
  it('yalnız --yaz (onay ortamda yok): hâlâ kuru koşum, PATCH yok', async () => {
    const r = await calistir(ag(planDosyasi(plan()), '--yaz'))
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('KURU KOŞUM')
    expect(istekler.filter((i) => i.yontem === 'PATCH')).toEqual([])
  })
  it('--yaz + onay: iki ürüne 1\'er PATCH, TR değişir, EN dokunulmaz, envanter yazılır', async () => {
    const r = await calistir(ag(planDosyasi(plan()), '--yaz'), true)
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('YAZIM TAMAM: 2/2')
    expect(istekler.filter((i) => i.yontem === 'PATCH').length).toBe(2)
    for (const u of urunler) {
      expect(u.description_i18n.tr).toBe('Güvenli fan ex-proof tasarım.')
      expect(u.description_i18n.en).toBe('Safe fan, high-efficiency ex-proof design.')
    }
    expect(readdirSync(join(gecici, 'cikti')).some((a) => a.startsWith('aciklama-'))).toBe(true)
  })
  it('eski alanda 0 ya da 2 kez geçiyorsa ATLANIR (tam-1 eşleşme), yazılacak yoksa çıkış 0', async () => {
    urunler[0].description_i18n.tr = 'ex-proof ex-proof ex-proof'
    const r = await calistir(ag(planDosyasi(plan({ eski: 'ex-proof', yeni: 'ATEX ex-proof', skus: ['VRT-1'] })), '--yaz'), true)
    expect(r.stdout).toContain('3 kez geçiyor — ATLANDI')
    expect(istekler.filter((i) => i.yontem === 'PATCH')).toEqual([])
    expect(r.kod).toBe(0)
  })
})

describe('P4 uçtan uca — sonuç metni bozulursa HİÇBİR ŞEY yazılmaz', () => {
  it('"yüksek verimli " → " " canlı metinde çift boşluk üretir: çıkış 1, PATCH yok (--yaz + onay olsa da)', async () => {
    const r = await calistir(ag(planDosyasi(plan({ eski: 'yüksek verimli ', yeni: ' ', skus: ['VRT-1'] })), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stdout).toContain('SONUÇ BİÇİMİ BOZUK (cift bosluk)')
    expect(r.stdout, 'bozuk alan aynı satırda "değişecek" diye ilan edilmez').not.toContain('1 → değişecek')
    expect(r.stdout, 'RED durumunda ÖZET/KURU KOŞUM sonucu basılmaz').not.toContain('ÖZET')
    expect(r.stderr).toContain('P4 SONUÇ BİÇİMİ KIRMIZI')
    expect(istekler.filter((i) => i.yontem === 'PATCH')).toEqual([])
    expect(urunler[0].description_i18n.tr).toBe('Güvenli fan, yüksek verimli ex-proof tasarım.')
  })
})

// ------------------------------------------------------------------------------------------------
// K — urunPlani (saf): tam-1 eşleşme + "zaten uygulanmış"
// ------------------------------------------------------------------------------------------------
describe('K urunPlani — tam-1 eşleşme ve "zaten uygulanmış" ayrımı', () => {
  const satir = (tr: string, en = 'Safe fan.') => ({ description_i18n: { tr, en } })
  const p = plan({ eski: ', yüksek verimli ex-proof', yeni: ' ex-proof', diller: ['tr'] })

  it('eski tam 1 kez: değişecek, yalnız o dil değişir, girdi DEĞİŞMEZ', () => {
    const girdi = satir('Fan, yüksek verimli ex-proof tasarım.')
    const kopya = JSON.stringify(girdi)
    const r = urunPlani(girdi, p)
    expect(r.degisti).toBe(true)
    expect(r.sonraki).toEqual({ tr: 'Fan ex-proof tasarım.', en: 'Safe fan.' })
    expect(r.satirlar).toEqual(['tr: 1 → değişecek'])
    expect(JSON.stringify(girdi)).toBe(kopya)
  })
  it('eski yok + yeni tam 1 kez → ZATEN UYGULANMIŞ (ATLANDI değil), değişiklik yok', () => {
    const r = urunPlani(satir('Fan ex-proof tasarım.'), p)
    expect(r.degisti).toBe(false)
    expect(r.zaten).toBe(1)
    expect(r.atlanan).toBe(0)
    expect(r.satirlar[0]).toContain('ZATEN UYGULANMIŞ')
  })
  it('eski de yeni de yok → ATLANDI (zaten sayılmaz: yanlış plan olabilir, elle bak)', () => {
    const r = urunPlani(satir('Başka bir metin.'), p)
    expect(r).toMatchObject({ degisti: false, zaten: 0, atlanan: 1 })
    expect(r.satirlar[0]).toBe('tr: 0 kez geçiyor — ATLANDI')
  })
  it('eski 2 kez → ATLANDI; yeni de 2 kez → ATLANDI (belirsiz)', () => {
    expect(urunPlani(satir('a, yüksek verimli ex-proof b, yüksek verimli ex-proof'), p).satirlar[0]).toContain('2 kez geçiyor — ATLANDI')
    const r = urunPlani(satir('a ex-proof b ex-proof'), p)
    expect(r.zaten).toBe(0)
    expect(r.atlanan).toBe(1)
  })
  it('yeni, eski\'yi İÇERİYORSA ve alanda tam 1 kez varsa ikinci koşum tekrar eklemez (idempotent)', () => {
    const q = plan({ eski: 'ex-proof', yeni: 'ATEX ex-proof', diller: ['tr'] })
    const ilk = urunPlani(satir('Fan ex-proof tasarım.'), q)
    expect(ilk.sonraki.tr).toBe('Fan ATEX ex-proof tasarım.')
    const ikinci = urunPlani({ description_i18n: ilk.sonraki }, q)
    expect(ikinci.degisti).toBe(false)
    expect(ikinci.zaten).toBe(1)
  })
  it('eski kendi üstüne biner ("aa" ⊂ "aaa" = 2 eşleşme): ATLANDI, tahminle yazılmaz', () => {
    const r = urunPlani(satir('xaaay'), plan({ eski: 'aa', yeni: 'b', diller: ['tr'] }))
    expect(r.degisti).toBe(false)
    expect(r.satirlar[0]).toContain('2 kez geçiyor — ATLANDI')
  })
  it('yeni\'deki "$&" ve "$1" harfiyen kalır (replace kullanılmaz)', () => {
    const r = urunPlani(satir('Fan ve motor.'), plan({ eski: ' ve ', yeni: ' $& $1 ', diller: ['tr'] }))
    expect(r.sonraki.tr).toBe('Fan $& $1 motor.')
  })
  it('metin yok → METİN YOK, atlanan sayılır; description_i18n null/dizi ise boş nesne gibi davranır', () => {
    expect(urunPlani({ description_i18n: { en: 'x' } }, p)).toMatchObject({ degisti: false, atlanan: 1 })
    expect(urunPlani({ description_i18n: null }, p).satirlar[0]).toBe('tr: METİN YOK')
    expect(urunPlani({ description_i18n: ['tr'] }, p).satirlar[0]).toBe('tr: METİN YOK')
    expect(urunPlani({}, p).atlanan).toBe(1)
  })
  it('P4: sonuç metni bozulursa RED, o dil değişmez', () => {
    const r = urunPlani(satir('Fan, yüksek verimli ex-proof.'), plan({ eski: 'yüksek verimli ', yeni: ' ', diller: ['tr'] }))
    expect(r).toMatchObject({ degisti: false, bicimRed: 1 })
    expect(r.satirlar[0]).toContain('SONUÇ BİÇİMİ BOZUK')
  })
  it('iki dil: biri değişir, diğeri zaten uygulanmış — ikisi ayrı sayılır', () => {
    const q = plan({ eski: 'Smart home', yeni: 'Wireless', diller: ['tr', 'en'] })
    const r = urunPlani({ description_i18n: { tr: 'Smart home sensörü', en: 'Wireless sensor' } }, q)
    expect(r).toMatchObject({ degisti: true, zaten: 1, atlanan: 0 })
    expect(r.sonraki).toEqual({ tr: 'Wireless sensörü', en: 'Wireless sensor' })
  })
})

// ------------------------------------------------------------------------------------------------
// E4 — eşzamanlılık, geri okuma, ikinci koşum (sahte PostgREST, koşullu PATCH)
// ------------------------------------------------------------------------------------------------
describe('E4 koşullu PATCH, yarış, geri okuma, ikinci koşum', () => {
  const YAZ_PLAN = () => planDosyasi(plan())
  const patchler = () => istekler.filter((i) => i.yontem === 'PATCH')

  it('PATCH updated_at ile KOŞULLUDUR ve değer KODLANMIŞ gider (+ → %2B, : → %3A)', async () => {
    const r = await calistir(ag(YAZ_PLAN(), '--yaz'), true)
    expect(r.kod).toBe(0)
    expect(patchler().length).toBe(2)
    for (const i of patchler()) {
      expect(i.yol).toContain('updated_at=eq.2026-10-09T10%3A00%3A0')
      expect(i.yol).toContain('%2B00%3A00')
      expect(i.yol).not.toMatch(/updated_at=eq\.[^&]*\+/)
    }
  })
  it('yarış (ürün başına 1 kez): taze metne yeniden uygulanır, eşzamanlı düzenleme KAYBOLMAZ', async () => {
    kip = 'yaris-bir'
    const r = await calistir(ag(YAZ_PLAN(), '--yaz'), true)
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('taze metne yeniden uygulanıyor')
    expect(r.stdout).toContain('yarış yeniden denemesi: 2')
    expect(patchler().length).toBe(4)
    for (const u of urunler) {
      expect(u.description_i18n.tr).toBe('Güvenli fan ex-proof tasarım.')
      expect(u.description_i18n.en).toBe(`Safe fan, high-efficiency ex-proof design.${EZ_NOT}`)
    }
    const env = readdirSync(join(gecici, 'cikti')).filter((a) => a.startsWith('aciklama-')).sort().pop() as string
    const kayit = JSON.parse(readFileSync(join(gecici, 'cikti', env), 'utf8')) as { yarislar: { sku: string; onceki: Record<string, string> }[] }
    expect(kayit.yarislar.map((y) => y.sku)).toEqual(['VRT-1', 'VRT-2'])
    expect(kayit.yarislar[0].onceki.en).toContain(EZ_NOT)
  })
  it('sürekli yarış: yeniden denemede de 0 satır → çıkış 1, ilk üründe durur, TR hiçbir üründe değişmez', async () => {
    kip = 'yaris-surekli'
    const r = await calistir(ag(YAZ_PLAN(), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('yeniden denemede de 0 satır')
    expect(patchler().length).toBe(2)
    for (const u of urunler) expect(u.description_i18n.tr).toBe('Güvenli fan, yüksek verimli ex-proof tasarım.')
  })
  it('RLS/yetki: PATCH 0 satır ama satır DEĞİŞMEMİŞ → yarış sayılmaz, yeniden denenmez, çıkış 1', async () => {
    kip = 'rls'
    const r = await calistir(ag(YAZ_PLAN(), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('DEĞİŞMEMİŞ')
    expect(r.stderr).toContain('yetki/RLS')
    expect(patchler().length).toBe(1)
  })
  it('yutulan PATCH (yazmış gibi döner, saklamaz): geri okuma farkı yakalanır, çıkış 1', async () => {
    kip = 'yut'
    const r = await calistir(ag(YAZ_PLAN(), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('geri okuma beklenenden FARKLI')
    expect(urunler[0].description_i18n.tr).toBe('Güvenli fan, yüksek verimli ex-proof tasarım.')
  })
  it('jsonb anahtar sırasını bozsa bile geri okuma geçer (kanonik eşitlik)', async () => {
    kip = 'jsonb-siralama'
    const r = await calistir(ag(YAZ_PLAN(), '--yaz'), true)
    expect(r.kod).toBe(0)
    expect(Object.keys(urunler[0].description_i18n)).toEqual(['en', 'tr'])
    expect(r.stdout).toContain('geri okuma: hepsi beklenen')
  })
  it('ikinci koşum zararsız: "ZATEN UYGULANMIŞ", çıkış 0, ek PATCH yok', async () => {
    const p = YAZ_PLAN()
    expect((await calistir(ag(p, '--yaz'), true)).kod).toBe(0)
    expect(patchler().length).toBe(2)
    const ikinci = await calistir(ag(p, '--yaz'), true)
    expect(ikinci.kod).toBe(0)
    expect(ikinci.stdout).toContain('ZATEN UYGULANMIŞ')
    expect(ikinci.stdout).toContain('zaten uygulanmış 2')
    expect(ikinci.stdout).toContain('hepsi zaten uygulanmış')
    expect(patchler().length).toBe(2)
  })
  it('yarışta BAŞKASI aynı değişikliği yapmışsa tekrar yazılmaz ("yarışta zaten uygulanmış")', async () => {
    kip = 'yaris-ayni'
    const r = await calistir(ag(YAZ_PLAN(), '--yaz'), true)
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('yarışta zaten uygulanmış: 2')
    expect(patchler().length).toBe(2)
    for (const u of urunler) expect(u.description_i18n.tr).toBe('Güvenli fan ex-proof tasarım.')
  })
  it('HATA YOLU — updated_at okunamadı: koşullu PATCH kurulamaz, çıkış 2, PATCH yok, envanter yok', async () => {
    delete (urunler[0] as Partial<Urun>).updated_at
    const r = await calistir(ag(YAZ_PLAN(), '--yaz'), true)
    expect(r.kod).toBe(2)
    expect(r.stderr).toContain('updated_at okunamadı')
    expect(patchler()).toEqual([])
    expect(existsSync(join(gecici, 'cikti'))).toBe(false)
  })
  it('HATA YOLU — okuma 401 (yetki/anahtar): çıkış 1, hiçbir şey yazılmaz', async () => {
    kip = 'get-401'
    const r = await calistir(ag(YAZ_PLAN(), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('DB HATA 401')
    expect(patchler()).toEqual([])
  })
  it('HATA YOLU — PATCH 500: çıkış 1, ilk üründe durur, envanter ÖNCEDEN yazılmıştır', async () => {
    kip = 'patch-500'
    const r = await calistir(ag(YAZ_PLAN(), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('DB HATA 500')
    expect(patchler().length).toBe(1)
    expect(readdirSync(join(gecici, 'cikti')).some((a) => a.startsWith('aciklama-'))).toBe(true)
  })
  it('HATA YOLU — ağ yok (bağlantı reddedildi): yakalanmamış hata DEĞİL, ÖLÇÜLEMEDİ çıkış 2', async () => {
    const r = await calistir(['--plan', YAZ_PLAN(), '--url', 'http://127.0.0.1:1', '--key', 'k', '--out', join(gecici, 'cikti'), '--yaz'], true)
    expect(r.kod).toBe(2)
    expect(r.stderr).toContain('ÖLÇÜLEMEDİ — ağ hatası GET')
    expect(r.stderr).not.toContain('at ')   // yığın izi yok
  })
  it('HATA YOLU — istenen SKU canlıda yok (veri boş): çıkış 2, hiçbir şey yazılmaz', async () => {
    const r = await calistir(ag(planDosyasi(plan({ skus: ['VRT-1', 'VRT-YOK'] })), '--yaz'), true)
    expect(r.kod).toBe(2)
    expect(r.stderr).toContain('istenen 2 ürün, dönen 1')
    expect(patchler()).toEqual([])
  })
  it('kuru koşum updated_at taşır ama PATCH atmaz; zaten uygulanmış satır kuru koşumda da görünür', async () => {
    urunler[0].description_i18n.tr = 'Güvenli fan ex-proof tasarım.'
    const r = await calistir(ag(YAZ_PLAN()))
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('VRT-1')
    expect(r.stdout).toMatch(/VRT-1[\s\S]*ZATEN UYGULANMIŞ[\s\S]*VRT-2[\s\S]*1 → değişecek/)
    expect(patchler()).toEqual([])
  })
})
