/**
 * KTL-11 · kategori-meta-duzelt.mjs — kuralların davranış kilidi. Betik GERÇEK alt süreç olarak koşar
 * (çıkış kodu, ortam anahtarı, yedek dosyası sözleşmesi dahil); canlı DB yerine yerel SAHTE PostgREST
 * sunucusu (127.0.0.1) cevap verir, ağa çıkılmaz. Test değerleri uydurmadır (anahtar: "test-anahtar").
 *
 * Kural numaraları betik çıktısındaki R1..R11 ile aynıdır (kategori-meta-duzelt-kurallar.mjs başlığı):
 *   R1 yol kapısı · R2 eşleşme · R3 a-e metin kapıları · R4 slug yok/çift · R5 alan düzeyi birleştirme
 *   R6 idempotent · R7 tek+koşullu PATCH, tek yeniden deneme · R8 yedek önce + geri okuma
 *   R9 iki anahtar · R10 kısmi yazım yok · R11 hata yolları.
 * SABOTAJ: `KMD_BETIK` ortamı, repo dışındaki (os.tmpdir) geçici bir betik kopyasını gösterirse testler ONA karşı koşar.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { createServer, type Server } from 'node:http'

vi.setConfig({ testTimeout: 60000 })

// vitest depo kökünden koşar (jsdom ortamında import.meta.url file: şemasında değildir)
const BETIK = process.env.KMD_BETIK || join(process.cwd(), 'scripts', 'icerik-hatti', 'kategori-meta-duzelt.mjs')

type Meta = Record<string, unknown>
type Satir = { id: string; tenant_id: string; slug: string; metadata: Meta | null; updated_at: string }
type Istek = { yontem: string; url: string; govde?: { metadata?: Meta }; yedekVardi?: boolean }
type Kalem = { slug: string; yol: Array<string | number>; eski: string | null; yeni: string; tam: boolean }

const ILK = '2026-10-09T10:00:00.123456+00:00'
const varsayilan = () => ({
  getDurum: 200, patchDurum: 200, bosSonuc: false, sayiSapmasi: 0, hep0: false, patchYoksay: false, okumaBoz: false,
  patchHataNo: 0, yedekYolu: '', patchBaslamadanOnce: null as null | (() => void),
})

let satirlar: Satir[] = []
let istekler: Istek[] = []
let ayar = varsayilan()
let patchSayisi = 0
let sunucu: Server
let dizin = ''
let envDosya = ''

const meta1 = (): Meta => ({
  slug: { tr: 'kanal-fanlari', en: 'duct-fans' },
  hide_price: true,
  description_i18n: { tr: 'Eski TR metni, en iyi fanlar.' },
  hero_description: 'Hero eski metin. Sessiz fan. Sessiz fan.',
  marketing_title: 'Eski başlık',
  features: [{ title: 'Birinci', description: 'Yüksek verimli motor.', icon: 'fan' }, { title: 'İkinci', description: 'Sessiz çalışma.' }],
  ek_alan: { x: [1, 2] },
})

beforeAll(async () => {
  dizin = mkdtempSync(join(tmpdir(), 'kmd-test-'))
  sunucu = createServer((req, res) => {
    const u = new URL(req.url ?? '/', 'http://x')
    let govde = ''
    req.on('data', (c) => (govde += c))
    req.on('end', () => {
      const kayit: Istek = { yontem: req.method ?? '', url: u.pathname + u.search, govde: govde ? JSON.parse(govde) : undefined }
      istekler.push(kayit)
      const json = (kod: number, v: unknown, b: Record<string, string> = {}) => { res.writeHead(kod, { 'content-type': 'application/json', ...b }); res.end(JSON.stringify(v)) }
      if (u.pathname !== '/rest/v1/categories') return json(404, {})
      if (req.method === 'GET') {
        if (ayar.getDurum !== 200) return json(ayar.getDurum, { message: 'x' })
        const goster = ayar.okumaBoz && patchSayisi > 0 ? satirlar.map((s) => ({ ...s, metadata: { ...(s.metadata ?? {}), hide_price: undefined } })) : satirlar
        if (req.headers.range) {
          const n = ayar.bosSonuc ? 0 : satirlar.length + ayar.sayiSapmasi
          return json(206, goster.slice(0, 1).map((s) => ({ id: s.id })), { 'content-range': `0-0/${n}` })
        }
        if (ayar.bosSonuc) return json(200, [])
        const id = u.searchParams.get('id')
        return json(200, id ? goster.filter((s) => `eq.${s.id}` === id) : goster)
      }
      if (req.method === 'PATCH') {
        patchSayisi++
        kayit.yedekVardi = ayar.yedekYolu ? existsSync(ayar.yedekYolu) : undefined
        if (ayar.patchBaslamadanOnce) { const f = ayar.patchBaslamadanOnce; ayar.patchBaslamadanOnce = null; f() }
        if (ayar.patchDurum !== 200) return json(ayar.patchDurum, { message: 'yetki' })
        if (ayar.patchHataNo === patchSayisi) return json(500, { message: 'sunucu hatası' })
        if (ayar.hep0) return json(200, [])
        // URLSearchParams `+` işaretini boşluk okur — gerçek PostgREST gibi; kodlanmamış updated_at HİÇ eşleşmez.
        const s = satirlar.find((r) => `eq.${r.id}` === u.searchParams.get('id') && `eq.${r.tenant_id}` === u.searchParams.get('tenant_id') && `eq.${r.updated_at}` === u.searchParams.get('updated_at'))
        if (!s) return json(200, [])
        if (!ayar.patchYoksay) { s.metadata = JSON.parse(govde).metadata; s.updated_at = `2026-10-09T11:00:0${patchSayisi}.000001+00:00` }
        return json(200, [{ id: s.id }])
      }
      json(405, {})
    })
  })
  await new Promise<void>((coz) => sunucu.listen(0, '127.0.0.1', () => coz()))
  const port = (sunucu.address() as { port: number }).port
  envDosya = join(dizin, 'env')
  writeFileSync(envDosya, `SUPABASE_URL=http://127.0.0.1:${port}\nSUPABASE_SERVICE_ROLE_KEY=test-anahtar\n`)
})
afterAll(() => { sunucu.close(); rmSync(dizin, { recursive: true, force: true }) })

beforeEach(() => {
  satirlar = [
    { id: 'c1', tenant_id: 't1', slug: 'duct-fans', metadata: meta1(), updated_at: ILK },
    { id: 'c2', tenant_id: 't1', slug: 'axial-fans', metadata: { marketing_title: 'aaa', description_i18n: { tr: 'x' } }, updated_at: ILK },
  ]
  istekler = []; ayar = varsayilan(); patchSayisi = 0
})

type Sonuc = { kod: number; cikti: string }
function kos(plan: unknown, o: { yaz?: boolean; onay?: boolean; yedek?: string; ham?: string; env?: string; planYok?: boolean } = {}): Promise<Sonuc> {
  const planYolu = join(dizin, 'plan.json')
  if (o.planYok) rmSync(planYolu, { force: true })
  else writeFileSync(planYolu, o.ham ?? JSON.stringify(plan))
  const args = [BETIK, '--plan', planYolu]
  if (o.yaz) args.push('--yaz')
  if (o.yedek) args.push('--yedek', o.yedek)
  return new Promise((coz) => {
    execFile(process.execPath, args, { env: { ...process.env, VENTHUB_ENV: o.env ?? envDosya, CANLI_YAZIM_ONAYI: o.onay ? 'evet' : '' } },
      (hata, so, se) => coz({ kod: hata ? Number((hata as NodeJS.ErrnoException).code) : 0, cikti: `${so}${se}` }))
  })
}
const kalem = (o: Partial<Kalem> = {}): Kalem => ({ slug: 'duct-fans', yol: ['description_i18n', 'en'], eski: null, yeni: 'Fans that carry air through duct lines.', tam: true, ...o })
const plan = (...k: Kalem[]) => ({ kalemler: k })
const patchler = () => istekler.filter((i) => i.yontem === 'PATCH')
const blok = (c: string, slug: string) => { const i = c.indexOf(`\n${slug}\n`); const j = c.indexOf('\n\n', i + 1); return c.slice(i, j < 0 ? undefined : j) }
const yedekYolu = (ad: string) => join(dizin, ad)
/** n tane bağımsız boş kategori: m0..m(n-1) — metin kapısı matrislerini tek koşumda ölçmek için. */
function coklu(n: number) { satirlar = Array.from({ length: n }, (_, i) => ({ id: `x${i}`, tenant_id: 't1', slug: `m${i}`, metadata: { hide_price: false }, updated_at: ILK })) }
const matris = async (yeniler: string[], yol: Kalem['yol'] = ['hero_description']) => {
  coklu(yeniler.length)
  const r = await kos(plan(...yeniler.map((y, i) => kalem({ slug: `m${i}`, yol, yeni: y }))))
  return yeniler.map((y, i) => ({ y, blok: blok(r.cikti, `m${i}`) }))
}

describe('KTL-11 · kuru koşum varsayılan', () => {
  it('ESKİ→YENİ ve geçen kurallar yazılır, PATCH yok, çıkış 0', async () => {
    const r = await kos(plan(kalem(), kalem({ yol: ['hero_description'], tam: false, eski: 'Hero eski metin.', yeni: 'Hero yeni metin.' })))
    expect(r.kod).toBe(0)
    expect(r.cikti).toContain('KURU KOŞUM')
    expect(r.cikti).toContain('ESKİ:')
    expect(r.cikti).toContain('YENİ: Fans that carry air through duct lines.')
    expect(r.cikti).toContain('✓R1 yol-kapısı')
    expect(r.cikti).toMatch(/ÖZET: yazılacak 2 · zaten aynı 0 · RED 0/)
    expect(patchler()).toHaveLength(0)
  })
})

describe('R1 · yol kapısı', () => {
  it('izinli altı yolun hepsi geçer', async () => {
    const r = await kos(plan(
      kalem({ yol: ['description_i18n', 'tr'], tam: false, eski: 'Eski TR metni', yeni: 'Yeni TR metni' }),
      kalem(),
      kalem({ yol: ['hero_description'], tam: false, eski: 'Hero eski metin.', yeni: 'Hero yeni.' }),
      kalem({ yol: ['marketing_title'], eski: 'Eski başlık', yeni: 'Yeni başlık' }),
      kalem({ yol: ['features', 0, 'title'], eski: 'Birinci', yeni: 'Ilk madde' }),
      kalem({ yol: ['features', 1, 'description'], tam: false, eski: 'Sessiz çalışma', yeni: 'Düşük ses seviyesi' }),
    ))
    expect(r.kod).toBe(0)
    expect(r.cikti).toMatch(/yazılacak 6 · zaten aynı 0 · RED 0/)
  })

  it('izinsiz yollar RED (slug, hide_price, name, parent, kök, bilinmeyen dil, features kökü/icon)', async () => {
    const yollar: Array<Array<string | number>> = [['slug'], ['hide_price'], ['name'], ['parent'], ['description_i18n'], ['description_i18n', 'de'], ['features'], ['features', 0], ['features', 0, 'icon'], ['ek_alan', 'x']]
    coklu(yollar.length)
    const r = await kos(plan(...yollar.map((y, i) => kalem({ slug: `m${i}`, yol: y, yeni: 'Yeni metin.' }))), { yaz: true, onay: true, yedek: yedekYolu('r1.json') })
    expect(r.kod).toBe(1)
    yollar.forEach((y, i) => expect(blok(r.cikti, `m${i}`)).toContain('yol izinli değil'))
    expect(patchler()).toHaveLength(0)
  })

  it('features indeksi mevcut dizinin dışındaysa ya da negatifse RED', async () => {
    const r = await kos(plan(kalem({ yol: ['features', 2, 'title'], eski: null, yeni: 'Üçüncü' }), kalem({ yol: ['features', -1, 'title'], eski: null, yeni: 'Eksi' }), kalem({ slug: 'axial-fans', yol: ['features', 0, 'title'], eski: null, yeni: 'Dizi yok' })))
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('features[2] yok')
    expect(r.cikti).toContain('yol izinli değil')
    expect(r.cikti).toContain('features dizisi yok')
  })
})

describe('R2 · eşleşme', () => {
  it('tam=false: 0 eşleşme RED, 2 eşleşme RED, tam 1 eşleşme geçer', async () => {
    const sifir = await kos(plan(kalem({ yol: ['hero_description'], tam: false, eski: 'Olmayan parça', yeni: 'Yeni.' })))
    expect(sifir.kod).toBe(1); expect(sifir.cikti).toContain('0 kez')
    const iki = await kos(plan(kalem({ yol: ['hero_description'], tam: false, eski: 'Sessiz fan.', yeni: 'Sessiz.' })))
    expect(iki.kod).toBe(1); expect(iki.cikti).toContain('2 kez')
    const bir = await kos(plan(kalem({ yol: ['hero_description'], tam: false, eski: 'Hero eski metin.', yeni: 'Hero yeni metin.' })))
    expect(bir.kod).toBe(0)
  })

  it('tam=false: örtüşen eşleşme de sayılır ("aa" → "aaa" içinde 2)', async () => {
    const r = await kos(plan(kalem({ slug: 'axial-fans', yol: ['marketing_title'], tam: false, eski: 'aa', yeni: 'b' })))
    expect(r.kod).toBe(1); expect(r.cikti).toContain('2 kez')
  })

  it('tam=true: eski şu anki değere eşitse geçer, farklıysa RED', async () => {
    const iyi = await kos(plan(kalem({ yol: ['marketing_title'], eski: 'Eski başlık', yeni: 'Yeni başlık' })))
    expect(iyi.kod).toBe(0)
    const kotu = await kos(plan(kalem({ yol: ['marketing_title'], eski: 'Başka başlık', yeni: 'Yeni başlık' })))
    expect(kotu.kod).toBe(1); expect(kotu.cikti).toContain('eşit değil')
  })

  it('tam=true: eski=null yalnız alan boş/yoksa geçer; dolu alanda RED; eski verilip alan boşsa RED', async () => {
    const bos = await kos(plan(kalem()))
    expect(bos.kod).toBe(0)
    const dolu = await kos(plan(kalem({ yol: ['marketing_title'], eski: null, yeni: 'Yeni başlık' })))
    expect(dolu.kod).toBe(1); expect(dolu.cikti).toContain('eski=null')
    const eskiVarAlanYok = await kos(plan(kalem({ eski: 'Olmayan', yeni: 'Fans.' })))
    expect(eskiVarAlanYok.kod).toBe(1); expect(eskiVarAlanYok.cikti).toContain('eşit değil')
  })

  it('bozuk kalem şekli (tam yok, yeni metin değil, eski sayı) RED', async () => {
    const r = await kos({ kalemler: [{ slug: 'duct-fans', yol: ['hero_description'], eski: null, yeni: 'x' }, { slug: 'duct-fans', yol: ['marketing_title'], tam: true, eski: 5, yeni: 'x' }] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('tam true/false olmalı'); expect(r.cikti).toContain('eski null ya da metin olmalı')
  })
})

describe('R3 · yeni metin kapıları', () => {
  it('(a) boş / yalnız boşluk RED', async () => {
    const m = await matris(['', '   \n '])
    for (const x of m) expect(x.blok).toContain('✗R3a')
  })

  it('(b) EN alanında Türkçe harf RED; TR alanında Türkçe harf serbest', async () => {
    const en = await matris(['Fans için kanal', 'Çıkış air', 'Duct ğ ı İ ö ş ü fans'], ['description_i18n', 'en'])
    for (const x of en) expect(x.blok).toContain('✗R3b')
    const tr = await matris(['Kanal hattında çalışan fanlar.'])
    expect(tr[0].blok).not.toContain('✗R3b')
    expect(tr[0].blok).toContain('✓R3b')
  })

  it('(c) iç not/biçim artıkları RED; dengeli ** serbest', async () => {
    const kotu = ['Metin --- notu', 'Metin [MANIFEST] satırı', 'TR kaynak: tablo', 'Birinci satır\n> alıntı satırı', '  > girintili alıntı', 'Kalın **dengesiz metin']
    const m = await matris(kotu)
    for (const x of m) expect(x.blok, x.y).toContain('✗R3c')
    const iyi = await matris(['Dengeli **kalın** metin', 'Büyüktür işareti a > b ortada'])
    for (const x of iyi) expect(x.blok, x.y).toContain('✓R3c')
  })

  it('(d) abartı kalıpları RED (TR+EN, büyük/küçük harf, çekimsiz sözcük sınırı)', async () => {
    const kotu = ['Üstün performanslı', 'Maksimum verim', 'En iyi fan', 'En verimli seçim', 'Yüksek performans sunar', 'Yüksek verimli motor', 'Gelişmiş kontrol', 'Estetik görünüm', 'ŞIK tasarım', 'Optimum akış', 'GARANTİ verilir', 'Tasarruf sağlar',
      'Superior airflow', 'Maximum output', 'The best fan', 'Most efficient motor', 'High-Performance blade', 'high-efficiency drive', 'Advanced control']
    const m = await matris(kotu)
    for (const x of m) expect(x.blok, x.y).toContain('✗R3d')
  })

  it('(d) sözcük sınırı: "bütünleşiktir", "üstünde", "bestow", "garantili" yanlış pozitif DEĞİL', async () => {
    const m = await matris(['Gövdeyle bütünleşiktir.', 'Kanalın üstünde durur.', 'Hava akışını bestow etmez.', 'Esteticism değil.'])
    for (const x of m) expect(x.blok, x.y).toContain('✓R3d')
  })

  it('(e) REF_DESENI ve iş numarası RED', async () => {
    const kotu = ['Kaynak [s.41] içinde', 'Değer [DB] alanında', 'Kaynak s.12 tablosu', 'Gizli <!-- not -->', 'REC-146 ile eklendi', 'KTL-11 kapsamında', 'OPS tarafından', 'Katalog [Aile s.7] sayfası']
    const m = await matris(kotu)
    for (const x of m) expect(x.blok, x.y).toContain('✗R3e')
    const iyi = await matris(['Kanal hattında kullanılan fanlar.'])
    expect(iyi[0].blok).toContain('✓R3e')
  })
})

describe('R4 · slug yok / çift', () => {
  it('kategori canlıda yoksa RED', async () => {
    const r = await kos(plan(kalem({ slug: 'yok-boyle-slug' })))
    expect(r.kod).toBe(1); expect(r.cikti).toContain('canlıda yok')
  })
  it('aynı slug iki satırda ise RED (belirsiz hedef)', async () => {
    satirlar.push({ id: 'c9', tenant_id: 't2', slug: 'duct-fans', metadata: {}, updated_at: ILK })
    const r = await kos(plan(kalem()))
    expect(r.kod).toBe(1); expect(r.cikti).toContain('aynı slug 2 satırda')
  })
  it('planda aynı slug+aynı yol iki kalemde ise RED', async () => {
    const r = await kos(plan(kalem(), kalem({ yeni: 'Another text about fans.' })))
    expect(r.kod).toBe(1); expect(r.cikti).toContain('birden çok kalemde')
  })
})

describe('R5 · alan düzeyi birleştirme', () => {
  it('yazımdan sonra slug, hide_price, ek_alan ve features.icon AYNEN durur; yalnız hedef alan değişir', async () => {
    const once = meta1()
    const r = await kos(plan(kalem(), kalem({ yol: ['features', 0, 'title'], eski: 'Birinci', yeni: 'Ilk madde' })), { yaz: true, onay: true, yedek: yedekYolu('r5.json') })
    expect(r.kod).toBe(0)
    const sonra = satirlar[0].metadata as Meta
    expect(sonra.slug).toEqual(once.slug)
    expect(sonra.hide_price).toBe(true)
    expect(sonra.ek_alan).toEqual(once.ek_alan)
    expect(sonra.marketing_title).toBe('Eski başlık')
    expect(sonra.description_i18n).toEqual({ tr: 'Eski TR metni, en iyi fanlar.', en: 'Fans that carry air through duct lines.' })
    expect((sonra.features as Array<Record<string, unknown>>)[0]).toEqual({ title: 'Ilk madde', description: 'Yüksek verimli motor.', icon: 'fan' })
    expect(patchler()[0].govde?.metadata).toEqual(sonra)
  })
})

describe('R6 · idempotent', () => {
  it('tam=true alan zaten yeniyse "zaten uygulanmış": PATCH yok, çıkış 0', async () => {
    const r = await kos(plan(kalem({ yol: ['marketing_title'], eski: 'Başka', yeni: 'Eski başlık' })), { yaz: true, onay: true, yedek: yedekYolu('r6a.json') })
    expect(r.kod).toBe(0); expect(r.cikti).toContain('zaten uygulanmış'); expect(r.cikti).toMatch(/zaten aynı 1 · RED 0/)
    expect(patchler()).toHaveLength(0)
  })
  it('tam=false: eski yok + yeni alanda tam 1 kez → atlanır; yeni 0 kez → RED; yeni 2 kez → RED', async () => {
    const a = await kos(plan(kalem({ yol: ['hero_description'], tam: false, eski: 'Silinmiş parça', yeni: 'Hero eski metin.' })))
    expect(a.kod).toBe(0); expect(a.cikti).toContain('zaten uygulanmış')
    const b = await kos(plan(kalem({ yol: ['hero_description'], tam: false, eski: 'Silinmiş parça', yeni: 'Hiç yok.' })))
    expect(b.kod).toBe(1)
    const c = await kos(plan(kalem({ yol: ['hero_description'], tam: false, eski: 'Silinmiş parça', yeni: 'Sessiz fan.' })))
    expect(c.kod).toBe(1)
  })
  it('yeni, eski\'yi içeriyorsa ikinci koşum parçayı iki kez UYGULAMAZ', async () => {
    const p = plan(kalem({ yol: ['hero_description'], tam: false, eski: 'Hero eski', yeni: 'Hero eski ve yeni' }))
    const bir = await kos(p, { yaz: true, onay: true, yedek: yedekYolu('r6c1.json') })
    expect(bir.kod).toBe(0)
    expect((satirlar[0].metadata as Meta).hero_description).toBe('Hero eski ve yeni metin. Sessiz fan. Sessiz fan.')
    const iki = await kos(p, { yaz: true, onay: true, yedek: yedekYolu('r6c2.json') })
    expect(iki.kod).toBe(0); expect(iki.cikti).toContain('zaten uygulanmış')
    expect((satirlar[0].metadata as Meta).hero_description).toBe('Hero eski ve yeni metin. Sessiz fan. Sessiz fan.')
    expect(patchler()).toHaveLength(1)
  })
  it('gerçek ikinci koşum: hepsi "zaten aynı", hiç PATCH yok', async () => {
    const p = plan(kalem(), kalem({ yol: ['marketing_title'], eski: 'Eski başlık', yeni: 'Yeni başlık' }))
    expect((await kos(p, { yaz: true, onay: true, yedek: yedekYolu('r6d1.json') })).kod).toBe(0)
    const n = patchler().length
    const iki = await kos(p, { yaz: true, onay: true, yedek: yedekYolu('r6d2.json') })
    expect(iki.kod).toBe(0); expect(patchler().length).toBe(n); expect(iki.cikti).toMatch(/yazılacak 0 · zaten aynı 2/)
    expect(existsSync(yedekYolu('r6d2.json'))).toBe(false)
  })
})

describe('R7 · tek + koşullu PATCH', () => {
  it('aynı kategorinin birden çok kalemi TEK PATCH; iki kategori iki PATCH', async () => {
    const r = await kos(plan(kalem(), kalem({ yol: ['marketing_title'], eski: 'Eski başlık', yeni: 'Yeni başlık' }), kalem({ yol: ['features', 1, 'title'], eski: 'İkinci', yeni: 'Ikinci madde' }), kalem({ slug: 'axial-fans', yol: ['marketing_title'], eski: 'aaa', yeni: 'bbb' })), { yaz: true, onay: true, yedek: yedekYolu('r7a.json') })
    expect(r.kod).toBe(0)
    expect(patchler()).toHaveLength(2)
    const m = patchler()[0].govde?.metadata as Meta
    expect(m.marketing_title).toBe('Yeni başlık')
    expect((m.description_i18n as Meta).en).toBe('Fans that carry air through duct lines.')
    expect(((m.features as Meta[])[1]).title).toBe('Ikinci madde')
  })

  it('PATCH süzgeci id + tenant_id + updated_at (kodlanmış +) taşır', async () => {
    await kos(plan(kalem()), { yaz: true, onay: true, yedek: yedekYolu('r7b.json') })
    const url = patchler()[0].url
    expect(url).toContain('id=eq.c1')
    expect(url).toContain('tenant_id=eq.t1')
    expect(url).toContain(`updated_at=eq.${encodeURIComponent(ILK)}`)
    expect(url).toContain('%2B00%3A00')
  })

  it('0 satır etkilenirse satır yeniden okunur, kalemler yeniden uygulanır, TEK yeniden deneme başarılı olur (eşzamanlı yazı korunur)', async () => {
    ayar.patchBaslamadanOnce = () => {
      const s = satirlar[0]
      s.metadata = { ...(s.metadata as Meta), baska_yazar: 'korunmali' }
      s.updated_at = '2026-10-09T10:30:00.000001+00:00'
    }
    const r = await kos(plan(kalem()), { yaz: true, onay: true, yedek: yedekYolu('r7c.json') })
    expect(r.kod).toBe(0)
    expect(patchler()).toHaveLength(2)
    expect(patchler()[1].url).toContain(encodeURIComponent('2026-10-09T10:30:00.000001+00:00'))
    const m = satirlar[0].metadata as Meta
    expect(m.baska_yazar).toBe('korunmali')
    expect((m.description_i18n as Meta).en).toBe('Fans that carry air through duct lines.')
    const yedek = JSON.parse(readFileSync(yedekYolu('r7c.json'), 'utf8'))
    expect(yedek.yeniden_okuma).toHaveLength(1)
  })

  it('yine 0 satır → hata (çıkış 1), toplam yalnız 2 PATCH', async () => {
    ayar.hep0 = true
    const r = await kos(plan(kalem()), { yaz: true, onay: true, yedek: yedekYolu('r7d.json') })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('iki kez 0 satır')
    expect(patchler()).toHaveLength(2)
  })
})

describe('R8 · yedek önce, geri okuma sonra', () => {
  it('yedek dosyası İLK PATCH\'ten ÖNCE diskte; canlı öncesi metadata + updated_at taşır', async () => {
    const y = yedekYolu('r8a.json'); ayar.yedekYolu = y
    const r = await kos(plan(kalem()), { yaz: true, onay: true, yedek: y })
    expect(r.kod).toBe(0)
    expect(patchler()[0].yedekVardi).toBe(true)
    const d = JSON.parse(readFileSync(y, 'utf8'))
    expect(d.satirlar).toHaveLength(1)
    expect(d.satirlar[0]).toMatchObject({ id: 'c1', slug: 'duct-fans', updated_at: ILK, metadata: meta1() })
  })

  it('--yaz için --yedek yoksa YAZILMAZ (çıkış 1); var olan yedek dosyası EZİLMEZ', async () => {
    const yok = await kos(plan(kalem()), { yaz: true, onay: true })
    expect(yok.kod).toBe(1); expect(yok.cikti).toContain('--yedek'); expect(patchler()).toHaveLength(0)
    const y = yedekYolu('r8b.json'); writeFileSync(y, 'ESKI YEDEK')
    const var_ = await kos(plan(kalem()), { yaz: true, onay: true, yedek: y })
    expect(var_.kod).toBe(1); expect(var_.cikti).toContain('zaten var'); expect(readFileSync(y, 'utf8')).toBe('ESKI YEDEK'); expect(patchler()).toHaveLength(0)
  })

  it('yedek yazılamıyorsa (klasör yok) hiçbir şey yazılmaz, çıkış 1', async () => {
    const r = await kos(plan(kalem()), { yaz: true, onay: true, yedek: join(dizin, 'olmayan-klasor', 'y.json') })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('yedek yazılamadı'); expect(patchler()).toHaveLength(0)
  })

  it('geri okuma birebirse "1/1 birebir" yazar', async () => {
    const r = await kos(plan(kalem()), { yaz: true, onay: true, yedek: yedekYolu('r8c.json') })
    expect(r.cikti).toContain('GERİ OKUMA: 1/1 kategori birebir')
  })

  it('PATCH başarılı görünüp canlıya yazmazsa geri okuma yakalar (çıkış 1)', async () => {
    ayar.patchYoksay = true
    const r = await kos(plan(kalem()), { yaz: true, onay: true, yedek: yedekYolu('r8d.json') })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('geri okuma farklı')
  })

  it('metadata\'nın kalan anahtarı geri okumada değişmişse (hide_price düşmüş) çıkış 1', async () => {
    ayar.okumaBoz = true
    const r = await kos(plan(kalem()), { yaz: true, onay: true, yedek: yedekYolu('r8e.json') })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('geri okuma farklı')
  })
})

describe('R9 · iki anahtar', () => {
  it('--yaz yoksa (onay olsa bile) yazılmaz', async () => {
    const r = await kos(plan(kalem()), { onay: true, yedek: yedekYolu('r9a.json') })
    expect(r.kod).toBe(0); expect(patchler()).toHaveLength(0); expect(existsSync(yedekYolu('r9a.json'))).toBe(false)
  })
  it('--yaz var ama CANLI_YAZIM_ONAYI yoksa yazılmaz ve çıkış 1', async () => {
    const r = await kos(plan(kalem()), { yaz: true, yedek: yedekYolu('r9b.json') })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('CANLI_YAZIM_ONAYI'); expect(patchler()).toHaveLength(0); expect(existsSync(yedekYolu('r9b.json'))).toBe(false)
  })
  it('iki anahtar da varsa yazar', async () => {
    const r = await kos(plan(kalem()), { yaz: true, onay: true, yedek: yedekYolu('r9c.json') })
    expect(r.kod).toBe(0); expect(patchler()).toHaveLength(1)
  })
})

describe('R10 · kısmi yazım yok', () => {
  it('tek bir RED bile varsa --yaz ile bile HİÇBİR kategori yazılmaz', async () => {
    const r = await kos(plan(kalem(), kalem({ slug: 'axial-fans', yol: ['marketing_title'], eski: 'yanlış', yeni: 'bbb' })), { yaz: true, onay: true, yedek: yedekYolu('r10.json') })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('kısmi yazım yok')
    expect(patchler()).toHaveLength(0); expect(existsSync(yedekYolu('r10.json'))).toBe(false)
    expect(satirlar[0].metadata).toEqual(meta1())
  })
})

describe('R11 · hata yolları', () => {
  it('ağ yok → çıkış 2, anlaşılır ileti', async () => {
    const e = join(dizin, 'env-olu'); writeFileSync(e, 'SUPABASE_URL=http://127.0.0.1:1\nSUPABASE_SERVICE_ROLE_KEY=test-anahtar\n')
    const r = await kos(plan(kalem()), { env: e })
    expect(r.kod).toBe(2); expect(r.cikti).toContain('AĞ HATASI')
  })
  it('boş sonuç → çıkış 2', async () => {
    ayar.bosSonuc = true
    const r = await kos(plan(kalem()))
    expect(r.kod).toBe(2); expect(r.cikti).toContain('BOŞ SONUÇ')
  })
  it('eksik veri (kesin sayı ≠ çekilen) → çıkış 2', async () => {
    ayar.sayiSapmasi = 3
    const r = await kos(plan(kalem()))
    expect(r.kod).toBe(2); expect(r.cikti).toContain('EKSİK VERİ')
  })
  it('okumada 401 ve 403 → çıkış 2 YETKİ HATASI', async () => {
    for (const d of [401, 403]) {
      ayar.getDurum = d
      const r = await kos(plan(kalem()))
      expect(r.kod).toBe(2); expect(r.cikti).toContain(`YETKİ HATASI (${d})`)
    }
  })
  it('yazımda 403 → çıkış 1 YETKİ HATASI', async () => {
    ayar.patchDurum = 403
    const r = await kos(plan(kalem()), { yaz: true, onay: true, yedek: yedekYolu('r11a.json') })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('YETKİ HATASI (403)')
  })
  it('ikinci kategoride yazım hatası → çıkış 1, yazılan/yazılmayan listelenir', async () => {
    ayar.patchHataNo = 2
    const r = await kos(plan(kalem(), kalem({ slug: 'axial-fans', yol: ['marketing_title'], eski: 'aaa', yeni: 'bbb' })), { yaz: true, onay: true, yedek: yedekYolu('r11b.json') })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('yazılan: duct-fans'); expect(r.cikti).toContain('yazılmayan: axial-fans')
  })
  it('kötü plan JSON\'u, kalemler dizi değil, boş plan, plan dosyası yok, ortam dosyası yok → çıkış 2', async () => {
    const a = await kos(null, { ham: '{bozuk json' }); expect(a.kod).toBe(2); expect(a.cikti).toContain("plan JSON'u okunamadı")
    const b = await kos({ kalemler: 'x' }); expect(b.kod).toBe(2)
    const c = await kos({ kalemler: [] }); expect(c.kod).toBe(2); expect(c.cikti).toContain('boş plan')
    const d = await kos(null, { planYok: true }); expect(d.kod).toBe(2); expect(d.cikti).toContain('plan dosyası yok')
    const e = await kos(plan(kalem()), { env: join(dizin, 'olmayan-env') }); expect(e.kod).toBe(2); expect(e.cikti).toContain('ortam dosyası okunamadı')
    expect(istekler).toHaveLength(0)
  })
})
