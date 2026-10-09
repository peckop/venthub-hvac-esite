/**
 * KATALOG · aile blok düzeltici — uçtan uca, SAHTE PostgREST'e karşı (gerçek DB'ye çıkmaz).
 *
 * Sahte sunucu sorgu dizesini `URLSearchParams` ile çözer: PostgREST gibi kodlanmamış `+`'yı BOŞLUK okur.
 * Yani yazıcı `updated_at`'i kodlamazsa eşleşme olmaz ve sınav düşer. Her PATCH kaydedilir: "aile başına
 * 1 PATCH" ve PATCH gövdesi buradan ölçülür. Sunucu kipleri: yarış, PATCH'i yutma (satır döner ama
 * saklanmaz), jsonb gibi anahtar sırasını bozma, 401/403/500.
 *
 * Kural → test eşlemesi (sabotaj tablosu bunu kullanır):
 *   K1 yol · K2 tek eşleşme · K3 iç referans + abartı kalıbı · K4 biçim artığı · K5 idempotent ·
 *   K6 tek PATCH + sıralı uygulama · K7 koşullu PATCH + tek yeniden deneme · K8 yedek + geri okuma ·
 *   K9 iki anahtar · K10 hata yolları (ağ, boş sonuç, yetki, kötü plan).
 */
import { execFile } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  ABARTI_KALIPLARI, abartiBul, ailePlani, alanOku, alanYaz, artikBul, kalanKaliplar,
  kalemDegerlendir, kanonik, kanonikEsit, planDogrula, say, yolBicimi,
} from '../aile-blok-duzelt-kurallar.mjs'

const BETIK = join(__dirname, '..', 'aile-blok-duzelt.mjs')
type Yol = (string | number)[]
type Kalem = { slug: string; yol: Yol; eski: string; yeni: string | null }
type Aciklama = Record<string, unknown>
type Aile = { id: string; tenant_id: string; slug: string; description: Aciklama; is_description_manual: boolean; updated_at: string }

// ------------------------------------------------------------------------------------------------
// Örnek veri
// ------------------------------------------------------------------------------------------------
const SEAT_ACIKLAMA = (): Aciklama => ({
  tr: 'SEAT serisi endüstriyel eksenel fanlardır. Üstün verimle çalışır. Galvanizli çelik gövdelidir.',
  en: 'SEAT series industrial axial fans. They offer superior efficiency. Galvanised steel housing.',
  bloklar_tr: { Motor: 'IE3 sınıfı, maksimum verim sağlayan motor.', Gövde: 'Galvanizli çelik gövde.' },
  maddeler_tr: ['Fan gövdesi galvanizlidir.', 'En verimli kanat profili kullanılır.', 'Üç fazlı beslemeyle çalışır.'],
})
const ilkAileler = (): Aile[] => [
  { id: '1', tenant_id: 't1', slug: 'seat-serisi', is_description_manual: true, updated_at: '2026-09-18T07:59:00.123+00:00', description: SEAT_ACIKLAMA() },
  { id: '2', tenant_id: 't1', slug: 'jet-serisi', is_description_manual: true, updated_at: '2026-09-18T08:00:00+00:00',
    description: { tr: 'JET serisi tünel fanlarıdır. Gelişmiş kanat tasarımı vardır.', en: 'JET series tunnel fans with advanced blade design.' } },
  { id: '3', tenant_id: 't1', slug: 'storm-serisi', is_description_manual: false, updated_at: '2026-09-07T10:00:00+00:00',
    description: { tr: 'Storm serisi fanlar. Birinci cümle. Üçüncü cümle. Tekrar. Tekrar.' } },
]

// Cümle silme BAĞLAMLI yazılır (eski komşu metni de içerir): yeni alanda tam 1 kez kalır, yani K5 çalışır.
const K_SEAT_TR: Kalem = { slug: 'seat-serisi', yol: ['tr'], eski: 'eksenel fanlardır. Üstün verimle çalışır.', yeni: 'eksenel fanlardır.' }
const K_SEAT_EN: Kalem = { slug: 'seat-serisi', yol: ['en'], eski: 'They offer superior efficiency.', yeni: 'They are driven by IE3 motors.' }
const K_SEAT_BLOK: Kalem = { slug: 'seat-serisi', yol: ['bloklar_tr', 'Motor'], eski: 'maksimum verim sağlayan motor', yeni: 'üç fazlı motor' }
const K_SEAT_MADDE: Kalem = { slug: 'seat-serisi', yol: ['maddeler_tr', 1], eski: 'En verimli kanat profili', yeni: 'Kanat profili' }
const K_JET_TR: Kalem = { slug: 'jet-serisi', yol: ['tr'], eski: 'Gelişmiş kanat tasarımı vardır.', yeni: 'Kanatlar tünel havalandırması için tasarlanmıştır.' }
const KALEMLER: Kalem[] = [K_SEAT_TR, K_SEAT_EN, K_SEAT_BLOK, K_SEAT_MADDE, K_JET_TR]

const SEAT_SONRA: Aciklama = {
  tr: 'SEAT serisi endüstriyel eksenel fanlardır. Galvanizli çelik gövdelidir.',
  en: 'SEAT series industrial axial fans. They are driven by IE3 motors. Galvanised steel housing.',
  bloklar_tr: { Motor: 'IE3 sınıfı, üç fazlı motor.', Gövde: 'Galvanizli çelik gövde.' },
  maddeler_tr: ['Fan gövdesi galvanizlidir.', 'Kanat profili kullanılır.', 'Üç fazlı beslemeyle çalışır.'],
}

// ------------------------------------------------------------------------------------------------
// Sahte PostgREST
// ------------------------------------------------------------------------------------------------
type Mod = {
  yaris?: { slug: string; kalan: number; eszamanli?: Aciklama }
  yut?: string[]
  sirayiBoz?: boolean
  getDurum?: number
  patchDurum?: number
}
let kok = ''
let sunucu: Server
let port = 0
let aileler: Aile[] = []
let patchler: { url: string; govde: { description: Aciklama; is_description_manual: boolean } }[] = []
let mod: Mod = {}

const filtre = (q: URLSearchParams) => (a: Aile) => {
  const slugIn = q.get('slug')
  if (slugIn?.startsWith('in.(')) return slugIn.slice(4, -1).split(',').includes(a.slug)
  const esit = (k: keyof Aile) => !q.has(k) || q.get(k) === `eq.${a[k]}`
  return esit('id') && esit('tenant_id') && esit('updated_at')
}
const ters = (d: Aciklama): Aciklama =>
  Object.fromEntries(Object.entries(d).reverse().map(([k, v]) => [k, v && typeof v === 'object' && !Array.isArray(v) ? ters(v as Aciklama) : v]))

beforeAll(async () => {
  kok = mkdtempSync(join(tmpdir(), 'aile-blok-'))
  sunucu = createServer((req, res) => {
    const u = new URL(req.url || '', 'http://x')
    const q = u.searchParams // PostgREST gibi: kodlanmamış '+' → boşluk
    let govde = ''
    req.on('data', (c) => { govde += c })
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json')
      if (req.method === 'GET') {
        if (mod.getDurum) { res.statusCode = mod.getDurum; return res.end('{"message":"sahte hata"}') }
        return res.end(JSON.stringify(aileler.filter(filtre(q))))
      }
      if (req.method === 'PATCH') {
        patchler.push({ url: req.url || '', govde: JSON.parse(govde) })
        if (mod.patchDurum) { res.statusCode = mod.patchDurum; return res.end('{"message":"sahte hata"}') }
        const y = mod.yaris
        if (y && y.kalan > 0) {
          const a = aileler.find((x) => x.slug === y.slug)
          if (a && q.get('id') === `eq.${a.id}`) {
            y.kalan--
            Object.assign(a.description, y.eszamanli ?? {}) // araya başka yazım girdi
            a.updated_at = `2026-10-09T10:0${y.kalan}:00+00:00`
          }
        }
        const hedef = aileler.filter(filtre(q))
        const d = JSON.parse(govde) as { description: Aciklama; is_description_manual: boolean }
        for (const a of hedef) {
          if (mod.yut?.includes(a.slug)) continue // satır döner ama saklanmaz
          Object.assign(a, d, { description: mod.sirayiBoz ? ters(d.description) : d.description, updated_at: '2026-10-09T12:00:00.5+00:00' })
        }
        return res.end(JSON.stringify(hedef))
      }
      res.statusCode = 405
      res.end('[]')
    })
  })
  await new Promise<void>((r) => sunucu.listen(0, '127.0.0.1', () => r()))
  port = (sunucu.address() as { port: number }).port
  writeFileSync(join(kok, '.env'), `SUPABASE_URL=http://127.0.0.1:${port}\nSUPABASE_SERVICE_ROLE_KEY=sahte\n`)
})
afterAll(() => { sunucu.close(); rmSync(kok, { recursive: true, force: true }) })

const YEDEK = () => join(kok, 'yedek.json')
const hazirla = (plan: unknown, m: Mod = {}) => {
  aileler = ilkAileler()
  patchler = []
  mod = m
  rmSync(YEDEK(), { force: true })
  writeFileSync(join(kok, 'plan.json'), typeof plan === 'string' ? plan : JSON.stringify(plan))
}
type Kos = { kod: number; cikti: string }
const calistir = (args: string[], env: Record<string, string>) => new Promise<Kos>((coz) => {
  execFile(process.execPath, [BETIK, ...args], { env: { ...process.env, CANLI_YAZIM_ONAYI: '', ...env } },
    (hata, stdout, stderr) => coz({ kod: hata ? (hata.code as number) : 0, cikti: stdout + stderr }))
})
const kos = (ek: string[] = [], opsiyon: { onay?: boolean; env?: string; yedek?: string; planYolu?: string | null } = {}) => {
  const { onay = true, env = join(kok, '.env'), yedek = YEDEK(), planYolu = join(kok, 'plan.json') } = opsiyon
  const args = [...(planYolu ? ['--plan', planYolu] : []), '--yedek', yedek, ...ek]
  return calistir(args, { VENTHUB_ENV: env, ...(onay ? { CANLI_YAZIM_ONAYI: 'evet' } : {}) })
}
const aile = (slug: string) => aileler.find((a) => a.slug === slug)!
const plan = (kalemler: Kalem[]) => ({ kalemler })

// ================================================================================================
// SAF KURALLAR
// ================================================================================================
describe('K1 yol kapısı (saf)', () => {
  it('izinli yollar geçer: tr | en | bloklar_tr.<anahtar> | maddeler_tr[i]', () => {
    const iyi: Yol[] = [['tr'], ['en'], ['bloklar_tr', 'Motor'], ['maddeler_tr', 0], ['maddeler_tr', 2]]
    for (const y of iyi) expect(yolBicimi(y), JSON.stringify(y)).toBeNull()
    const d = SEAT_ACIKLAMA()
    expect(alanOku(d, ['bloklar_tr', 'Motor'])).toEqual({ metin: 'IE3 sınıfı, maksimum verim sağlayan motor.' })
    expect(alanOku(d, ['maddeler_tr', 2])).toEqual({ metin: 'Üç fazlı beslemeyle çalışır.' })
  })
  it('başka yol reddedilir: name, slug, description kökü, bilinmeyen anahtar, aralık dışı indeks, bozuk biçim', () => {
    const kotu: unknown[] = [['name'], ['slug'], ['description'], [], 'tr', null, ['tr', 'x'], ['bloklar_tr'], ['bloklar_tr', 1], ['bloklar_tr', ''],
      ['maddeler_tr'], ['maddeler_tr', '1'], ['maddeler_tr', -1], ['maddeler_tr', 1.5], ['maddeler_tr', 1, 'x'], ['tr', 'en'], ['__proto__']]
    for (const y of kotu) expect(yolBicimi(y as Yol), JSON.stringify(y)).toEqual(expect.any(String))
    const d = SEAT_ACIKLAMA()
    expect(alanOku(d, ['bloklar_tr', 'Yok'])).toHaveProperty('hata')
    expect(alanOku(d, ['maddeler_tr', 3])).toHaveProperty('hata') // 3 madde var: indeks 0..2
    expect(alanOku(d, ['maddeler_tr', 99])).toHaveProperty('hata')
  })
  it('miras anahtarlar ("constructor", "__proto__", "toString") "yok" sayılır; metin olmayan alan reddedilir', () => {
    const d = SEAT_ACIKLAMA()
    for (const a of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) expect(alanOku(d, ['bloklar_tr', a]), a).toHaveProperty('hata')
    expect(alanOku({ tr: 5 }, ['tr'])).toHaveProperty('hata')
    expect(alanOku({ maddeler_tr: [null] }, ['maddeler_tr', 0])).toHaveProperty('hata')
    expect(alanOku({ en: 'x' }, ['tr'])).toHaveProperty('hata') // alan hiç yok
    expect(alanOku(null, ['tr'])).toHaveProperty('hata')
  })
  it('yol kapısı kalem düzeyinde RED verir (K1 GECMEDI) ve başka kural bakmaz', () => {
    const s = kalemDegerlendir(SEAT_ACIKLAMA(), { slug: 's', yol: ['name'], eski: 'a', yeni: 'b' })
    expect(s.durum).toBe('red')
    expect(s.kurallar.find((k) => k.kural === 'K1')?.ok).toBe(false)
    expect(s.kurallar.filter((k) => k.kural !== 'K1').every((k) => k.ok === null)).toBe(true)
  })
})

describe('K2 tek eşleşme (saf)', () => {
  const d = (): Aciklama => ({ tr: 'Bir cümle. Başka cümle. Bir cümle sonu.' })
  it('tam 1 eşleşme uygulanır', () => {
    const s = kalemDegerlendir(d(), { slug: 's', yol: ['tr'], eski: 'Başka cümle.', yeni: 'Yeni cümle.' })
    expect(s.durum).toBe('uygula')
    expect(s.aciklama.tr).toBe('Bir cümle. Yeni cümle. Bir cümle sonu.')
  })
  it('0 eşleşme RED', () => {
    const s = kalemDegerlendir(d(), { slug: 's', yol: ['tr'], eski: 'Olmayan cümle.', yeni: 'Yeni cümle.' })
    expect(s.durum).toBe('red')
    expect(s.neden).toMatch(/0 eslesme/)
  })
  it('2+ eşleşme RED (ve girdi değişmez)', () => {
    const girdi = d()
    const s = kalemDegerlendir(girdi, { slug: 's', yol: ['tr'], eski: 'Bir cümle', yeni: 'Yeni' })
    expect(s.durum).toBe('red')
    expect(s.neden).toMatch(/2 eslesme/)
    expect(girdi).toEqual(d())
  })
  it('üst üste binen eşleşme de belirsizdir (say: "aa" ⊂ "aaa" = 2); boş eski ve eski===yeni RED', () => {
    expect(say('aaa', 'aa')).toBe(2)
    expect(say('abc', '')).toBe(0)
    expect(kalemDegerlendir({ tr: 'aaa' }, { slug: 's', yol: ['tr'], eski: 'aa', yeni: 'b' }).durum).toBe('red')
    expect(kalemDegerlendir(d(), { slug: 's', yol: ['tr'], eski: '', yeni: 'x' }).durum).toBe('red')
    expect(kalemDegerlendir(d(), { slug: 's', yol: ['tr'], eski: 'Başka cümle.', yeni: 'Başka cümle.' }).durum).toBe('red')
  })
  it('değiştirme harfiyen yapılır: yeni içindeki "$&" ve "$1" özel dizge sayılmaz', () => {
    const s = kalemDegerlendir(d(), { slug: 's', yol: ['tr'], eski: 'Başka cümle.', yeni: 'Fiyat $& ve $1 dizgesi.' })
    expect(s.aciklama.tr).toBe('Bir cümle. Fiyat $& ve $1 dizgesi. Bir cümle sonu.')
  })
  it('silme ("yeni" boş) alanda tam 1 eşleşmeyle uygulanır', () => {
    const s = kalemDegerlendir({ tr: 'A. B. C.' }, { slug: 's', yol: ['tr'], eski: ' B.', yeni: '' })
    expect(s.durum).toBe('uygula')
    expect(s.aciklama.tr).toBe('A. C.')
  })
  it('sonuç alan boş kalacaksa RED (alanın tamamı silinemez)', () => {
    const s = kalemDegerlendir({ tr: 'Tek cümle.' }, { slug: 's', yol: ['tr'], eski: 'Tek cümle.', yeni: '' })
    expect(s.durum).toBe('red')
    expect(s.neden).toMatch(/bos kalir/)
  })
  it('silme ("yeni" boş) alanda 0 eşleşmede RED olur: zaten uygulanmış mı ayırt edilemez', () => {
    const s = kalemDegerlendir(d(), { slug: 's', yol: ['tr'], eski: 'Olmayan.', yeni: '' })
    expect(s.durum).toBe('red')
    expect(s.neden).toMatch(/ayirt edilemez/)
  })
})

describe('K3 yeni metin: iç referans ve abartı kalıbı (saf)', () => {
  const dene = (yeni: string) => kalemDegerlendir({ tr: 'Eski cümle.' }, { slug: 's', yol: ['tr'], eski: 'Eski cümle.', yeni })
  it('temiz metin geçer', () => {
    const s = dene('Üç fazlı asenkron motorla sürülen eksenel fandır.')
    expect(s.durum).toBe('uygula')
    expect(s.kurallar.find((k) => k.ad === 'ic referans')?.ok).toBe(true)
    expect(s.kurallar.find((k) => k.ad === 'abarti kalibi')?.ok).toBe(true)
  })
  it('iç kaynak referansı RED: [AVenS s.27], [DB], Kaynak s.4, <!--', () => {
    for (const m of ['Galvanizli gövde [AVenS s.27].', 'Motor [DB] alanından.', 'Gövde. Kaynak s.4', 'Metin <!-- not -->']) {
      const s = dene(m)
      expect(s.durum, m).toBe('red')
      expect(s.kurallar.find((k) => k.ad === 'ic referans')?.ok, m).toBe(false)
    }
  })
  it('abartı kalıbının her biri RED (TR ve EN, büyük harf dahil)', () => {
    const ornek: Record<string, string> = {
      'üstün': 'Üstün verimli fan.', maksimum: 'Maksimum debi sağlar.', 'en iyi': 'En iyi seçimdir.', 'en verimli': 'En verimli modeldir.',
      'yüksek performans': 'Yüksek performanslı motor.', 'yüksek verimli': 'Yüksek verimli kanat.', gelişmiş: 'Gelişmiş kontrol.',
      estetik: 'Estetik görünüm.', şık: 'ŞIK tasarım.', optimum: 'Optimum çalışma.', garanti: 'Garantili ürün.', tasarruf: 'Tasarruf sağlar.',
      superior: 'Superior airflow.', maximum: 'MAXIMUM airflow.', best: 'The best fan.', 'most efficient': 'The most efficient fan.',
      'high-performance': 'A high-performance motor.', 'high-efficiency': 'A high-efficiency motor.', advanced: 'Advanced control.',
      lider: 'Sektörün lideri.', profesyonel: 'Profesyonel kullanım.', kaliteli: 'Kaliteli işçilik.', hızlı: 'Hızlı montaj.',
      konforlu: 'Konforlu ortam.', güvenilir: 'Güvenilir çalışma.', 'çözüm ortağı': 'Çözüm ortağınız.', 'en geniş': 'En geniş ürün yelpazesi.',
    }
    expect(Object.keys(ornek).sort()).toEqual(ABARTI_KALIPLARI.map((k) => k.ad).sort()) // listede olup örneği olmayan kalıp kalmasın
    for (const [ad, m] of Object.entries(ornek)) {
      const s = dene(m)
      expect(s.durum, m).toBe('red')
      expect(s.kurallar.find((k) => k.ad === 'abarti kalibi')?.ok, m).toBe(false)
      expect(abartiBul(m).map((a) => a.ad), m).toContain(ad)
    }
  })
  it('sözcük sınırı \\p{L}: "karışık", "kaşık", "bütünleşik", "üstünde", "şıkırtı", "bestseller" yanlış pozitif vermez', () => {
    for (const m of ['Karışık gaz akışı.', 'Kaşık biçimli kanat.', 'Gövde bütünleşiktir.', 'Motorun üstünde durur.', 'Şıkırtı sesi yoktur.', 'Bestseller listesinde.', 'Stabil çalışır.']) {
      expect(abartiBul(m), m).toEqual([])
      expect(dene(m).durum, m).toBe('uygula')
    }
  })
  it('hız kademesi sayısı muaf: "iki hızlı", "üç hızlıdır", "çift hızlı", "tek hızlı", "dört hızlılar" geçer', () => {
    for (const m of ['İki hızlı motorlarla çalışır.', 'Motorlar iki hızlıdır.', 'Üç hızlıdır.', 'Çift hızlı motor.', 'TEK HIZLI sürüş.', 'Dört hızlılar serisi.']) {
      expect(abartiBul(m), m).toEqual([])
      expect(dene(m).durum, m).toBe('uygula')
    }
  })
  it('muafiyet dar: "hızlı kurulum", "çok hızlı", tek başına "hızlıdır", "yüksek hızlı", "iki çok hızlı", "iki hızlıca" hâlâ RED', () => {
    for (const m of ['Hızlı kurulum sağlar.', 'Çok hızlı çalışır.', 'Hızlıdır.', 'Yüksek hızlı fan.', 'İki çok hızlı motor.', 'İki hızlıca döner.', 'Motor iki hızlıdır ve hızlı kurulur.']) {
      expect(abartiBul(m).map((a) => a.ad), m).toContain('hızlı')
      expect(dene(m).durum, m).toBe('red')
    }
  })
  it('ekli biçimler yakalanır: üstünlüğü, estetiği, tasarrufu, en iyisi', () => {
    for (const m of ['Üstünlüğü kanıtlıdır.', 'Estetiği öne çıkar.', 'Tasarrufu artırır.', 'En iyisidir.']) expect(abartiBul(m).length, m).toBeGreaterThan(0)
  })
  it('eski metinde abartı olması yeni metni affettirmez: yeni abartıyı koruyorsa RED', () => {
    const s = kalemDegerlendir({ tr: 'Üstün verimli fan. Gövde çeliktir.' }, { slug: 's', yol: ['tr'], eski: 'Gövde çeliktir.', yeni: 'Üstün gövde çeliktir.' })
    expect(s.durum).toBe('red')
  })
  it('alanın kalan metnindeki kalıp bloklamaz, yalnız sayılır (kalanKaliplar)', () => {
    const s = kalemDegerlendir({ tr: 'Gelişmiş kontrol. Gövde çeliktir.' }, { slug: 's', yol: ['tr'], eski: 'Gövde çeliktir.', yeni: 'Gövde galvanizlidir.' })
    expect(s.durum).toBe('uygula')
    expect(kalanKaliplar(s.aciklama)).toEqual([{ yol: 'tr', ad: 'gelişmiş' }])
    expect(kalanKaliplar(SEAT_SONRA)).toEqual([])
  })
})

describe('K4 biçim artığı (saf)', () => {
  const dene = (yeni: string) => kalemDegerlendir({ tr: 'Eski cümle.' }, { slug: 's', yol: ['tr'], eski: 'Eski cümle.', yeni })
  it('temiz ve dengeli ** geçer; satır ortasındaki ">" ve "--" geçer', () => {
    for (const m of ['Düz metin.', '**Kalın** metin ve **bir daha**.', 'ΔP > 5 Pa olduğunda; 10 -- 20 °C.']) expect(dene(m).durum, m).toBe('uygula')
  })
  it('--- RED', () => { expect(dene('Metin --- bölücü').durum).toBe('red'); expect(artikBul('a --- b')).toContain('---') })
  it('[MANIFEST] RED', () => { expect(dene('Metin [MANIFEST] satırı').durum).toBe('red'); expect(artikBul('[manifest]')).toContain('[MANIFEST]') })
  it('"TR kaynak" RED', () => { expect(dene('TR kaynak: katalog').durum).toBe('red'); expect(artikBul('tr KAYNAK')).toContain('TR kaynak') })
  it('satır başı ">" RED (satır 1 ve sonraki satırlar, girintili dahil)', () => {
    for (const m of ['> alıntı satırı', 'Birinci satır\n> ikinci satır', 'Birinci\n  > girintili']) {
      expect(dene(m).durum, m).toBe('red')
      expect(artikBul(m), m).toContain('satir basi >')
    }
  })
  it('** tek sayıda (dengesiz) RED', () => {
    for (const m of ['**Kalın kapanmamış', 'a ** b ** c **', '***']) {
      expect(dene(m).durum, m).toBe('red')
      expect(artikBul(m), m).toContain('** dengesiz')
    }
  })
})

describe('K5 idempotent (saf)', () => {
  const k: Kalem = { slug: 's', yol: ['tr'], eski: 'Eski cümle.', yeni: 'Yeni cümle.' }
  it('eski yok + yeni alanda tam 1 kez → atla (hata değil)', () => {
    const s = kalemDegerlendir({ tr: 'Başı. Yeni cümle. Sonu.' }, k)
    expect(s.durum).toBe('atla')
    expect(s.kurallar.find((x) => x.kural === 'K5')?.ok).toBe(true)
    expect(s.aciklama.tr).toBe('Başı. Yeni cümle. Sonu.')
  })
  it('eski yok + yeni de yok → RED; eski yok + yeni 2 kez → RED (tek eşleşme yok)', () => {
    expect(kalemDegerlendir({ tr: 'Hiçbiri.' }, k).durum).toBe('red')
    expect(kalemDegerlendir({ tr: 'Yeni cümle. Yeni cümle.' }, k).durum).toBe('red')
  })
  it('eski hâlâ varsa uygulanır (atlanmaz)', () => {
    expect(kalemDegerlendir({ tr: 'Eski cümle.' }, k).durum).toBe('uygula')
  })
  it('yeni, eski\'yi içeriyorsa tekrar uygulama olmaz: ikinci çalıştırma atlar', () => {
    const k2: Kalem = { slug: 's', yol: ['tr'], eski: 'IE3', yeni: 'IE3 sınıfı' }
    const ilk = kalemDegerlendir({ tr: 'Motor IE3.' }, k2)
    expect(ilk.aciklama.tr).toBe('Motor IE3 sınıfı.')
    const ikinci = kalemDegerlendir(ilk.aciklama, k2)
    expect(ikinci.durum).toBe('atla')
    expect(ikinci.aciklama.tr).toBe('Motor IE3 sınıfı.')
  })
})

describe('K6 aile planı: sıralı uygulama, yapı korunur (saf)', () => {
  it('birden çok kalem sırayla uygulanır: ikinci kalem birincinin sonucunu görür', () => {
    const p = ailePlani({ tr: 'A. B. C.' }, [
      { slug: 's', yol: ['tr'], eski: 'B.', yeni: 'B2 ve ek.' },
      { slug: 's', yol: ['tr'], eski: 'B2 ve ek.', yeni: 'B3.' },
    ])
    expect(p.red).toBe(false)
    expect(p.aciklama.tr).toBe('A. B3. C.')
  })
  it('yalnız hedef alan değişir; bloklar_tr/maddeler_tr/diğer anahtarlar aynen kalır', () => {
    const d = { ...SEAT_ACIKLAMA(), ek: { x: 1 } }
    const p = ailePlani(d, KALEMLER.filter((k) => k.slug === 'seat-serisi'))
    expect(p.red).toBe(false)
    expect(p.aciklama).toEqual({ ...SEAT_SONRA, ek: { x: 1 } })
    expect(d).toEqual({ ...SEAT_ACIKLAMA(), ek: { x: 1 } }) // girdi değişmedi
  })
  it('bir kalem RED ise aile RED; hepsi atlanırsa değişiklik yok', () => {
    expect(ailePlani({ tr: 'A. B.' }, [{ slug: 's', yol: ['tr'], eski: 'Yok.', yeni: 'Z.' }]).red).toBe(true)
    const p = ailePlani({ tr: 'A. Z.' }, [{ slug: 's', yol: ['tr'], eski: 'B.', yeni: 'Z.' }])
    expect(p.red).toBe(false)
    expect(p.degisti).toBe(false)
  })
  it('alanYaz kopya döner ve bloklar_tr/maddeler_tr yollarını yazar', () => {
    const d = SEAT_ACIKLAMA()
    expect((alanYaz(d, ['bloklar_tr', 'Motor'], 'X').bloklar_tr as Aciklama).Motor).toBe('X')
    expect((alanYaz(d, ['maddeler_tr', 0], 'Y').maddeler_tr as string[])[0]).toBe('Y')
    expect(d).toEqual(SEAT_ACIKLAMA())
  })
})

describe('K11 maddeler_tr öğe silme: yeni:null (saf)', () => {
  const D = (): Aciklama => ({ tr: 'Metin.', maddeler_tr: ['a madde', 'b madde', 'c madde', 'd madde'], bloklar_tr: { Motor: 'IE3' } })
  const sil = (i: number, eski: string): Kalem => ({ slug: 's', yol: ['maddeler_tr', i], eski, yeni: null })
  it('öğe tam değeriyle eşleşince diziden çıkar; diğer anahtarlar aynen kalır, girdi değişmez', () => {
    const girdi = D()
    const s = kalemDegerlendir(girdi, sil(1, 'b madde'))
    expect(s.durum).toBe('uygula')
    expect(s.aciklama).toEqual({ ...D(), maddeler_tr: ['a madde', 'c madde', 'd madde'] })
    expect(girdi).toEqual(D())
  })
  it('yeni:null yalnız maddeler_tr[i] yolunda geçerli: tr, en, bloklar_tr yollarında RED (K1)', () => {
    for (const yol of [['tr'], ['en'], ['bloklar_tr', 'Motor']] as Yol[]) {
      const s = kalemDegerlendir({ ...D(), en: 'English text.' }, { slug: 's', yol, eski: 'IE3', yeni: null })
      expect(s.durum, JSON.stringify(yol)).toBe('red')
      expect(s.kurallar.find((k) => k.kural === 'K1')?.ok, JSON.stringify(yol)).toBe(false)
      expect(s.neden, JSON.stringify(yol)).toMatch(/yalniz maddeler_tr\[i\]/)
    }
    expect(kalemDegerlendir({ tr: 'x' }, sil(0, 'x')).durum).toBe('red') // maddeler_tr hiç yok
    expect(kalemDegerlendir(D(), { slug: 's', yol: ['name'], eski: 'a', yeni: null }).durum).toBe('red')
  })
  it('eski öğenin TAM değerine eşit olmalı: parça eşleşmesi (alt dizge) silmez', () => {
    const s = kalemDegerlendir(D(), sil(1, 'b mad'))
    expect(s.durum).toBe('atla') // dizide "b mad" değerli öğe yok → silinmez (ATLA, dizi değişmez)
    expect(s.aciklama.maddeler_tr).toEqual(['a madde', 'b madde', 'c madde', 'd madde'])
    const yanlisIndeks = kalemDegerlendir(D(), sil(0, 'b madde')) // öğe var ama 1. indekste
    expect(yanlisIndeks.durum).toBe('red')
    expect(yanlisIndeks.neden).toMatch(/1\. indekste var/)
  })
  it('aynı ailede değişiklikler önce (indeks sabitken), silmeler AZALAN indeksle: plandaki sıra fark etmez', () => {
    const kalemler: Kalem[] = [
      sil(1, 'b madde'),
      { slug: 's', yol: ['maddeler_tr', 2], eski: 'c madde', yeni: 'c2 madde' },
      sil(3, 'd madde'),
    ]
    const p = ailePlani(D(), kalemler)
    expect(p.red).toBe(false)
    expect(p.aciklama.maddeler_tr).toEqual(['a madde', 'c2 madde'])
    expect(p.sonuclar.map((s) => s.kalem.yeni)).toEqual(['c2 madde', null, null]) // uygulama sırası: değişiklik, sil(3), sil(1)
    expect(p.sonuclar.slice(1).map((s) => s.kalem.yol[1])).toEqual([3, 1])
    const ters = ailePlani(D(), [...kalemler].reverse())
    expect(ters.aciklama.maddeler_tr).toEqual(['a madde', 'c2 madde'])
  })
  it('idempotent: öğe dizide yoksa "zaten uygulanmış" ATLA; ikinci çalıştırma değişiklik üretmez', () => {
    const kalemler = [sil(1, 'b madde'), sil(3, 'd madde')]
    const ilk = ailePlani(D(), kalemler)
    expect(ilk.aciklama.maddeler_tr).toEqual(['a madde', 'c madde'])
    const ikinci = ailePlani(ilk.aciklama, kalemler)
    expect(ikinci.red).toBe(false)
    expect(ikinci.degisti).toBe(false)
    expect(ikinci.sonuclar.map((s) => s.durum)).toEqual(['atla', 'atla'])
    expect(ikinci.sonuclar[0].kurallar.find((k) => k.kural === 'K5')?.ok).toBe(true)
  })
  it('silme sonrası maddeler_tr boş kalacaksa RED', () => {
    const s = kalemDegerlendir({ maddeler_tr: ['tek'] }, sil(0, 'tek'))
    expect(s.durum).toBe('red')
    expect(s.neden).toMatch(/bos kalir/)
    const hepsi = ailePlani({ maddeler_tr: ['a', 'b'] }, [sil(0, 'a'), sil(1, 'b')])
    expect(hepsi.red).toBe(true)
  })
  it('yeni "" ile PARÇA silme tr/en/bloklar_tr/maddeler_tr alanında çalışır (tam 1 eşleşme), sonuç alan boş olamaz', () => {
    const d: Aciklama = { tr: 'A. B. C.', en: 'A. B. C.', bloklar_tr: { Motor: 'IE3 sınıfı. Fazla cümle.' }, maddeler_tr: ['Tek öğe. Fazla cümle.'] }
    const yollar: [Yol, string][] = [[['tr'], ' B.'], [['en'], ' B.'], [['bloklar_tr', 'Motor'], ' Fazla cümle.'], [['maddeler_tr', 0], ' Fazla cümle.']]
    for (const [yol, eski] of yollar) {
      const s = kalemDegerlendir(d, { slug: 's', yol, eski, yeni: '' })
      expect(s.durum, JSON.stringify(yol)).toBe('uygula')
      expect(s.kurallar.find((k) => k.kural === 'K2')?.ok, JSON.stringify(yol)).toBe(true)
    }
    expect(kalemDegerlendir(d, { slug: 's', yol: ['bloklar_tr', 'Motor'], eski: 'IE3 sınıfı. Fazla cümle.', yeni: '' }).durum).toBe('red')
    expect(kalemDegerlendir(d, { slug: 's', yol: ['maddeler_tr', 0], eski: 'Tek öğe. Fazla cümle.', yeni: '' }).durum).toBe('red')
  })
  it('plan yapısı: yeni null kabul edilir, sayı/nesne reddedilir', () => {
    expect(planDogrula({ kalemler: [{ slug: 's', yol: ['maddeler_tr', 0], eski: 'x', yeni: null }] }).hatalar).toEqual([])
    expect(planDogrula({ kalemler: [{ slug: 's', yol: ['maddeler_tr', 0], eski: 'x', yeni: 5 }] }).hatalar.length).toBeGreaterThan(0)
  })
})

describe('K8 kanonik eşitlik (saf)', () => {
  it('anahtar sırasından bağımsız eşit; değer ya da dizi sırası farkı eşit değil', () => {
    expect(kanonikEsit({ a: 1, b: { x: [1, 2], y: 'z' } }, { b: { y: 'z', x: [1, 2] }, a: 1 })).toBe(true)
    expect(kanonikEsit({ a: 1 }, { a: 2 })).toBe(false)
    expect(kanonikEsit({ a: [1, 2] }, { a: [2, 1] })).toBe(false)
    expect(kanonikEsit({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    expect(kanonik(null)).toBe('null')
  })
})

describe('K10 plan dosyası yapısı (saf)', () => {
  it('geçerli plan', () => {
    expect(planDogrula({ kalemler: KALEMLER }).hatalar).toEqual([])
  })
  it('kötü planlar: nesne değil, kalemler yok/boş, kalem nesne değil, slug/eski/yeni bozuk, bilinmeyen anahtar, yol yok', () => {
    const kotu: unknown[] = [null, [], 'x', {}, { kalemler: 'x' }, { kalemler: [] }, { kalemler: [5] },
      { kalemler: [{ slug: 'a b', yol: ['tr'], eski: 'x', yeni: 'y' }] },
      { kalemler: [{ slug: 's', yol: ['tr'], eski: '', yeni: 'y' }] },
      { kalemler: [{ slug: 's', yol: ['tr'], eski: 'x' }] },
      { kalemler: [{ slug: 's', eski: 'x', yeni: 'y' }] },
      { kalemler: [{ slug: 's', yol: ['tr'], eski: 'x', yeni: 'y', not: 'z' }] }]
    for (const p of kotu) expect(planDogrula(p).hatalar.length, JSON.stringify(p)).toBeGreaterThan(0)
  })
})

// ================================================================================================
// UCTAN UCA (sahte PostgREST)
// ================================================================================================
describe('K9 iki anahtar: kuru koşu varsayılan (CLI)', () => {
  it('kuru koşu: hiçbir şey yazmaz, yedek dosyası bırakmaz; her kalem için ESKİ→YENİ ve kural sonuçları yazar', async () => {
    hazirla(plan(KALEMLER))
    const r = await kos([], { onay: false })
    expect(r.kod, r.cikti).toBe(0)
    expect(patchler.length).toBe(0)
    expect(existsSync(YEDEK())).toBe(false)
    expect(aile('seat-serisi').description).toEqual(SEAT_ACIKLAMA())
    expect(r.cikti).toMatch(/KURU KOSUM/)
    expect(r.cikti).toMatch(/\[1\/5\] seat-serisi · tr/)
    expect(r.cikti).toMatch(/ESKI: "eksenel fanlardır\. Üstün verimle çalışır\."/)
    expect(r.cikti).toMatch(/YENI: "They are driven by IE3 motors\."/)
    expect(r.cikti).toMatch(/K1 yol\s+GECTI/)
    expect(r.cikti).toMatch(/K2 tek eslesme\s+GECTI/)
    expect(r.cikti).toMatch(/K3 ic referans\s+GECTI/)
    expect(r.cikti).toMatch(/K3 abarti kalibi\s+GECTI/)
    expect(r.cikti).toMatch(/K4 bicim artigi\s+GECTI/)
    expect(r.cikti).toMatch(/=> UYGULANIR/)
    expect(r.cikti).toMatch(/jet-serisi: uygulama sonrasi description'da kalan abarti kalibi 1 \(en:advanced\)/)
  })
  it('kuru koşuda reddedilen kalem hangi kuralın geçmediğini gösterir ve çıkış ≠ 0 verir', async () => {
    hazirla(plan([{ ...K_JET_TR, yeni: 'Üstün kanat tasarımı.' }]))
    const r = await kos([], { onay: false })
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/K3 abarti kalibi\s+GECMEDI "üstün"/)
    expect(r.cikti).toMatch(/=> RED/)
  })
  it('yalnız --yaz (CANLI_YAZIM_ONAYI yok) hiçbir şey yazmaz', async () => {
    hazirla(plan(KALEMLER))
    const r = await kos(['--yaz'], { onay: false })
    expect(r.kod, r.cikti).toBe(0)
    expect(patchler.length).toBe(0)
    expect(r.cikti).toMatch(/--yaz var, ortam anahtari YOK/)
  })
  it('yalnız CANLI_YAZIM_ONAYI=evet (--yaz yok) hiçbir şey yazmaz', async () => {
    hazirla(plan(KALEMLER))
    const r = await kos([], { onay: true })
    expect(r.kod, r.cikti).toBe(0)
    expect(patchler.length).toBe(0)
    expect(r.cikti).toMatch(/ortam anahtari var, --yaz YOK/)
  })
  it('CANLI_YAZIM_ONAYI "evet" dışında bir değerse yazmaz', async () => {
    hazirla(plan(KALEMLER))
    const r = await calistir(['--plan', join(kok, 'plan.json'), '--yedek', YEDEK(), '--yaz'], { VENTHUB_ENV: join(kok, '.env'), CANLI_YAZIM_ONAYI: 'true' })
    expect(r.kod).toBe(0)
    expect(patchler.length).toBe(0)
  })
})

describe('K6/K8 yazım: aile başına tek PATCH, yedek, geri okuma (CLI)', () => {
  it('iki anahtarla: aile başına TEK PATCH {description, is_description_manual:true}; yalnız hedef alanlar değişir', async () => {
    hazirla(plan(KALEMLER))
    const r = await kos(['--yaz'])
    expect(r.kod, r.cikti).toBe(0)
    expect(patchler.length).toBe(2) // seat: 4 kalem → 1 PATCH ; jet: 1 PATCH ; storm dokunulmadı
    const seatPatch = patchler.find((p) => p.url.includes('id=eq.1'))!
    expect(Object.keys(seatPatch.govde).sort()).toEqual(['description', 'is_description_manual'])
    expect(seatPatch.govde.is_description_manual).toBe(true)
    expect(seatPatch.govde.description).toEqual(SEAT_SONRA)
    expect(aile('seat-serisi').description).toEqual(SEAT_SONRA)
    expect(aile('jet-serisi').description).toEqual({ tr: 'JET serisi tünel fanlarıdır. Kanatlar tünel havalandırması için tasarlanmıştır.', en: 'JET series tunnel fans with advanced blade design.' })
    expect(aile('storm-serisi').description).toEqual(ilkAileler()[2].description)
    expect(aile('storm-serisi').is_description_manual).toBe(false)
    expect(r.cikti).toMatch(/YAZILAN: 2\/2/)
    expect(r.cikti).toMatch(/kanonik esit 2\/2/)
  })
  it('birden çok kalem aynı alanı etkilerse sırayla uygulanır (ikinci kalem birincinin çıktısını eşler)', async () => {
    hazirla(plan([
      { slug: 'storm-serisi', yol: ['tr'], eski: 'Üçüncü cümle.', yeni: 'İkinci ve ek cümle.' },
      { slug: 'storm-serisi', yol: ['tr'], eski: 'İkinci ve ek cümle.', yeni: 'Düzeltilmiş cümle.' },
    ]))
    const r = await kos(['--yaz'])
    expect(r.kod, r.cikti).toBe(0)
    expect(patchler.length).toBe(1)
    expect(aile('storm-serisi').description.tr).toBe('Storm serisi fanlar. Birinci cümle. Düzeltilmiş cümle. Tekrar. Tekrar.')
    expect(aile('storm-serisi').is_description_manual).toBe(true)
  })
  it('YAZMADAN önce canlıdan okunan satırların yedeği dosyaya yazılır (updated_at dahil)', async () => {
    hazirla(plan(KALEMLER))
    const r = await kos(['--yaz'])
    expect(r.kod, r.cikti).toBe(0)
    expect(existsSync(YEDEK())).toBe(true)
    const yedek = JSON.parse(readFileSync(YEDEK(), 'utf8')) as Aile[]
    const seat = yedek.find((a) => a.slug === 'seat-serisi')!
    expect(seat.description).toEqual(SEAT_ACIKLAMA()) // ESKİ hâli, yazımdan öncekini saklar
    expect(seat.updated_at).toBe('2026-09-18T07:59:00.123+00:00')
    expect(yedek.map((a) => a.slug).sort()).toEqual(['jet-serisi', 'seat-serisi'])
  })
  it('yedek yazılamıyorsa hiçbir PATCH gitmez', async () => {
    hazirla(plan(KALEMLER))
    const r = await kos(['--yaz'], { yedek: join(kok, 'olmayan-klasor', 'yedek.json') })
    expect(r.kod).toBe(1)
    expect(patchler.length).toBe(0)
    expect(r.cikti).toMatch(/yedek dosyasi yazilamadi/)
    expect(aile('seat-serisi').description).toEqual(SEAT_ACIKLAMA())
  })
  it('geri okuma: canlıda beklenenden farklıysa (PATCH satır döner ama saklanmaz) KIRMIZI', async () => {
    hazirla(plan(KALEMLER), { yut: ['jet-serisi'] })
    const r = await kos(['--yaz'])
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/canlida beklenenle uymayan: jet-serisi/)
    expect(r.cikti).toMatch(/kanonik esit 1\/2/)
  })
  it('geri okuma anahtar sırasından bağımsızdır (jsonb sırayı bozar): yine yeşil', async () => {
    hazirla(plan(KALEMLER), { sirayiBoz: true })
    const r = await kos(['--yaz'])
    expect(r.kod, r.cikti).toBe(0)
    expect(Object.keys(aile('seat-serisi').description)[0]).toBe('maddeler_tr') // sıra gerçekten bozuldu
    expect(r.cikti).toMatch(/kanonik esit 2\/2/)
  })
})

describe('K7 koşullu PATCH ve tek yeniden deneme (CLI)', () => {
  it('PATCH yolu id + tenant_id + KODLANMIŞ updated_at taşır (okuma anındaki durum koşul)', async () => {
    hazirla(plan(KALEMLER))
    const r = await kos(['--yaz'])
    expect(r.kod, r.cikti).toBe(0)
    const seat = patchler.find((p) => p.url.includes('id=eq.1'))!
    expect(seat.url).toBe('/rest/v1/product_families?id=eq.1&tenant_id=eq.t1&updated_at=eq.2026-09-18T07%3A59%3A00.123%2B00%3A00')
  })
  it('yarış bir kez olursa yeniden okur, kalemleri taze satıra uygular (eşzamanlı yazım korunur) ve yazar', async () => {
    hazirla(plan(KALEMLER), { yaris: { slug: 'seat-serisi', kalan: 1, eszamanli: { ek_alan: 'baska yazim' } } })
    const r = await kos(['--yaz'])
    expect(r.kod, r.cikti).toBe(0)
    expect(patchler.length).toBe(3) // yarış gerçekten oldu: seat 2 deneme + jet
    expect(aile('seat-serisi').description).toEqual({ ...SEAT_SONRA, ek_alan: 'baska yazim' })
    const yedek = JSON.parse(readFileSync(YEDEK(), 'utf8')) as Aile[]
    expect(yedek.filter((a) => a.slug === 'seat-serisi').length).toBe(2) // yeniden okunan taze satır da yedeklendi
  })
  it('yarış sürerse (ikinci denemede de 0 satır) KIRMIZI; sonsuz döngü yok', async () => {
    hazirla(plan(KALEMLER), { yaris: { slug: 'seat-serisi', kalan: 5 } })
    const r = await kos(['--yaz'])
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/seat-serisi: donen satir 0/)
    expect(patchler.filter((p) => p.url.includes('id=eq.1')).length).toBe(2) // 1 deneme + 1 yeniden deneme
  })
  it('yeniden okumada kalem artık uygulanamıyorsa (eşzamanlı yazım alanı değiştirdi) KIRMIZI, yazılmaz', async () => {
    hazirla(plan([K_SEAT_EN]), { yaris: { slug: 'seat-serisi', kalan: 1, eszamanli: { en: 'Tamamen baska metin.' } } })
    const r = await kos(['--yaz'])
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/seat-serisi: yeniden okumada yazilamaz/)
    expect(aile('seat-serisi').description.en).toBe('Tamamen baska metin.')
  })
})

describe('K1 yol kapısı (CLI)', () => {
  it('izinsiz yol → çıkış 1, 0 PATCH, K1 GECMEDI; geçerli kalemler de yazılmaz (kısmi yazım yok)', async () => {
    const kotuYollar: Yol[] = [['name'], ['slug'], ['description'], ['bloklar_tr', 'Yok'], ['maddeler_tr', 9]]
    for (const yol of kotuYollar) {
      hazirla(plan([K_JET_TR, { slug: 'seat-serisi', yol, eski: 'olmayan parca', yeni: 'baska parca' }]))
      const r = await kos(['--yaz'])
      expect(r.kod, JSON.stringify(yol)).toBe(1)
      expect(patchler.length, JSON.stringify(yol)).toBe(0)
      expect(r.cikti, JSON.stringify(yol)).toMatch(/K1 yol\s+GECMEDI/)
      expect(aile('jet-serisi').description).toEqual(ilkAileler()[1].description)
    }
  })
})

describe('K2 tek eşleşme (CLI)', () => {
  it('0 eşleşme ve 2+ eşleşme → çıkış 1, 0 PATCH, hiçbir aile yazılmaz', async () => {
    hazirla(plan([K_JET_TR, { slug: 'storm-serisi', yol: ['tr'], eski: 'Olmayan cümle.', yeni: 'Yeni.' }]))
    const r0 = await kos(['--yaz'])
    expect(r0.kod).toBe(1)
    expect(r0.cikti).toMatch(/eski alanda 0 eslesme/)
    expect(patchler.length).toBe(0)
    hazirla(plan([K_JET_TR, { slug: 'storm-serisi', yol: ['tr'], eski: 'Tekrar.', yeni: 'Bir.' }]))
    const r2 = await kos(['--yaz'])
    expect(r2.kod).toBe(1)
    expect(r2.cikti).toMatch(/eski alanda 2 eslesme/)
    expect(patchler.length).toBe(0)
    expect(aile('jet-serisi').description).toEqual(ilkAileler()[1].description)
  })
})

describe('K3/K4 yeni metin kapıları (CLI)', () => {
  it('iç referans, abartı kalıbı ve biçim artığı taşıyan yeni metin → çıkış 1, 0 PATCH', async () => {
    const yeniler: Record<string, string> = {
      referans: 'Galvanizli gövde [AVenS s.27].',
      abarti: 'Gelişmiş kanat tasarımı.',
      'satir-basi >': 'Kanat tasarımı.\n> not',
      '---': 'Kanat --- tasarımı.',
      '** dengesiz': '**Kanat tasarımı.',
    }
    for (const [ad, yeni] of Object.entries(yeniler)) {
      hazirla(plan([{ ...K_JET_TR, yeni }]))
      const r = await kos(['--yaz'])
      expect(r.kod, ad).toBe(1)
      expect(patchler.length, ad).toBe(0)
      expect(r.cikti, ad).toMatch(/GECMEDI/)
    }
  })
})

describe('K5 idempotent (CLI)', () => {
  it('aynı plan ikinci kez: zaten uygulanmış kalemler atlanır, 0 PATCH, çıkış 0', async () => {
    hazirla(plan(KALEMLER))
    expect((await kos(['--yaz'])).kod).toBe(0)
    const once = patchler.length
    const r = await kos(['--yaz'])
    expect(r.kod, r.cikti).toBe(0)
    expect(patchler.length).toBe(once)
    expect(r.cikti).toMatch(/ATLANIR \(zaten uygulanmis\)/)
    expect(r.cikti).toMatch(/Yazilacak degisiklik yok/)
  })
  it('kısmen uygulanmış plan: yalnız uygulanmamış kalem yazılır', async () => {
    hazirla(plan(KALEMLER))
    // yalnız en + maddeler_tr uygulanmış hâli: tr ve bloklar_tr özgün kalır
    aile('seat-serisi').description = { ...SEAT_SONRA, tr: SEAT_ACIKLAMA().tr as string, bloklar_tr: SEAT_ACIKLAMA().bloklar_tr as Aciklama }
    const r = await kos(['--yaz'])
    expect(r.kod, r.cikti).toBe(0)
    expect(aile('seat-serisi').description).toEqual(SEAT_SONRA)
    expect((r.cikti.match(/ATLANIR/g) || []).length).toBe(2)
  })
})

describe('K11 maddeler_tr öğe silme (CLI)', () => {
  const SILME_PLANI: Kalem[] = [
    { slug: 'seat-serisi', yol: ['maddeler_tr', 1], eski: 'En verimli kanat profili kullanılır.', yeni: null },
    { slug: 'seat-serisi', yol: ['maddeler_tr', 2], eski: 'beslemeyle çalışır.', yeni: 'beslemeyle sürülür.' },
  ]
  it('silme + değişiklik aynı ailede: tek PATCH, öğe çıkar, indeks kayması olmaz; ikinci çalıştırma 0 PATCH', async () => {
    hazirla(plan(SILME_PLANI))
    const r = await kos(['--yaz'])
    expect(r.kod, r.cikti).toBe(0)
    expect(patchler.length).toBe(1)
    expect(aile('seat-serisi').description.maddeler_tr).toEqual(['Fan gövdesi galvanizlidir.', 'Üç fazlı beslemeyle sürülür.'])
    expect(aile('seat-serisi').description.tr).toBe(SEAT_ACIKLAMA().tr) // diğer alanlar aynen
    expect(r.cikti).toMatch(/YENI: null \(maddeler_tr ogesi SILINIR\)/)
    const r2 = await kos(['--yaz'])
    expect(r2.kod, r2.cikti).toBe(0)
    expect(patchler.length).toBe(1)
    expect(r2.cikti).toMatch(/ATLANIR \(zaten uygulanmis\)/)
  })
  it('yeni:null tr/en/bloklar_tr yolunda → çıkış 1, 0 PATCH; öğe tam değer değilse atlanır, değişiklik yok', async () => {
    hazirla(plan([{ slug: 'seat-serisi', yol: ['tr'], eski: 'SEAT serisi', yeni: null }]))
    const r = await kos(['--yaz'])
    expect(r.kod).toBe(1)
    expect(patchler.length).toBe(0)
    expect(r.cikti).toMatch(/K1 yol\s+GECMEDI/)
    hazirla(plan([{ slug: 'seat-serisi', yol: ['maddeler_tr', 1], eski: 'En verimli', yeni: null }]))
    const r2 = await kos(['--yaz'])
    expect(r2.kod, r2.cikti).toBe(0)
    expect(patchler.length).toBe(0)
    expect(aile('seat-serisi').description.maddeler_tr).toEqual(SEAT_ACIKLAMA().maddeler_tr)
  })
})

describe('K10 hata yolları (CLI)', () => {
  it('ağ yok: sunucuya ulaşılamıyor → anlaşılır ileti, çıkış ≠ 0, yazılmaz', async () => {
    const gecici = createServer()
    await new Promise<void>((r) => gecici.listen(0, '127.0.0.1', () => r()))
    const kapaliPort = (gecici.address() as { port: number }).port
    await new Promise<void>((r) => gecici.close(() => r()))
    writeFileSync(join(kok, '.env-kapali'), `SUPABASE_URL=http://127.0.0.1:${kapaliPort}\nSUPABASE_SERVICE_ROLE_KEY=sahte\n`)
    hazirla(plan(KALEMLER))
    const r = await kos(['--yaz'], { env: join(kok, '.env-kapali') })
    expect(r.kod).not.toBe(0)
    expect(r.cikti).toMatch(/ag hatasi \(aile sorgusu\)/)
    expect(r.cikti).toMatch(/Hicbir aile yazilmadi/)
    expect(patchler.length).toBe(0)
  })
  it('boş sonuç: aile bulunamadı → çıkış 1, bulunamayan slug adıyla', async () => {
    hazirla(plan([{ slug: 'yok-serisi', yol: ['tr'], eski: 'a', yeni: 'b' }]))
    const r = await kos(['--yaz'])
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/aile bulunamadi/)
    expect(r.cikti).toMatch(/bulunamayan: yok-serisi/)
    expect(patchler.length).toBe(0)
  })
  it('aynı slug iki kiracıda → kiracı belirsiz, çıkış 1', async () => {
    hazirla(plan(KALEMLER))
    aileler.push({ ...ilkAileler()[0], id: '9', tenant_id: 't2' })
    const r = await kos(['--yaz'])
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/birden cok kiracida/)
    expect(patchler.length).toBe(0)
  })
  it('yetki hatası: okumada 401 → çıkış 1, "yetki hatasi (401"', async () => {
    hazirla(plan(KALEMLER), { getDurum: 401 })
    const r = await kos(['--yaz'])
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/yetki hatasi \(401, aile sorgusu\)/)
    expect(patchler.length).toBe(0)
  })
  it('yetki hatası: yazımda 403 → çıkış 1, YAZILAN 0, "yetki hatasi (403"', async () => {
    hazirla(plan(KALEMLER), { patchDurum: 403 })
    const r = await kos(['--yaz'])
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/yetki hatasi \(403, PATCH\)/)
    expect(r.cikti).toMatch(/YAZILAN: 0\/2/)
  })
  it('sunucu hatası: 500 → çıkış 1, durum kodu iletide', async () => {
    hazirla(plan(KALEMLER), { getDurum: 500 })
    const r = await kos([])
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/aile sorgusu basarisiz: 500/)
  })
  it('kötü plan JSON: JSON değil / kalemler yok / kalem bozuk → çıkış 2, anlaşılır ileti, ağa çıkılmaz', async () => {
    hazirla('{ bu json degil')
    let r = await kos([])
    expect(r.kod).toBe(2)
    expect(r.cikti).toMatch(/plan dosyasi gecerli JSON degil/)
    hazirla({ kalemler: [] })
    r = await kos([])
    expect(r.kod).toBe(2)
    expect(r.cikti).toMatch(/kalemler bos/)
    hazirla({ kalemler: [{ slug: 'seat-serisi', yol: ['tr'], eski: 'x' }] })
    r = await kos([])
    expect(r.kod).toBe(2)
    expect(r.cikti).toMatch(/kalem 1: yeni metin olmali/)
    expect(patchler.length).toBe(0)
  })
  it('önkoşullar: --plan yok, plan dosyası yok, ortam dosyası yok → çıkış 2', async () => {
    hazirla(plan(KALEMLER))
    let r = await kos([], { planYolu: null })
    expect(r.kod).toBe(2)
    expect(r.cikti).toMatch(/--plan zorunlu/)
    r = await kos([], { planYolu: join(kok, 'yok-plan.json') })
    expect(r.kod).toBe(2)
    expect(r.cikti).toMatch(/plan dosyasi okunamadi/)
    r = await kos([], { env: join(kok, 'yok.env') })
    expect(r.kod).toBe(2)
    expect(r.cikti).toMatch(/ortam dosyasi okunamadi/)
  })
})
