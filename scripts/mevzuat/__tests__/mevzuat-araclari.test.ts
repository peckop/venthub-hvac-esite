import { createServer, type IncomingHttpHeaders, type Server } from 'node:http'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * MVZ-10 / OPS-256 · scripts/mevzuat/ham-cekim.cjs ve kanit-ekle.cjs.
 *
 * Değişmezler: (1) kullanıcı etmeni ve başlıklar gönderilir (curl/* düşürülüyor, ALT-174); (2) windows-1254 sayfa doğru çözülür
 * ve sha ham baytla etiketsiz metin için AYRI hesaplanır; (3) alıntı yalnız birebir eşleşirse doğrulanır; (4) kanıt eklemek
 * CRLF'yi korur, resmi_kaynak_sayisi'ni yeniden sayar, aynı kaynağı iki kez eklemez ve doğrulanmamış alıntıyı reddeder.
 */

interface HamCekimSonuc {
  http: number
  bayt: number
  kodlama: string
  sha256_ilk12: string
  sha256_metin_ilk12: string
  alintilar: { metin: string; bulundu: boolean }[]
  metin: string
  son_url: string
  url: string
}
interface KaynakGirdisi {
  url: string
  alinti: string
  alinti_dogrulandi: boolean
  sha256_ilk12: string
  erisim_tarihi: string
  resmi: boolean
}
interface HamCekimModulu {
  VARSAYILAN_UA: string
  sha12: (v: Buffer | string) => string
  kodlamaBul: (bayt: Buffer, contentType: string | null, istenen?: string) => string
  metinNormalize: (bayt: Buffer, kodlama: string) => string
  hamCek: (s: { url: string; accept?: string; dil?: string; alinti?: string[]; kodlama?: string }) => Promise<HamCekimSonuc>
  kaynakGirdisi: (s: HamCekimSonuc, ek?: { bugun?: string }) => KaynakGirdisi
}
interface KanitEkleModulu {
  uygula: (g: { bugun?: string; isler: Record<string, unknown>[] }, s?: { kok?: string; kuru?: boolean }) => { rapor: string[]; uyari: string[] }
}

const require_ = createRequire(import.meta.url)
const ham = require_('../ham-cekim.cjs') as HamCekimModulu
const ekle = require_('../kanit-ekle.cjs') as KanitEkleModulu

// "Yönetmelik ŞĞİ ıöüç" windows-1254: Ş=0xDE Ğ=0xD0 İ=0xDD ı=0xFD ö=0xF6 ü=0xFC ç=0xE7
const CP1254 = Buffer.concat([
  Buffer.from('<html><head><meta charset="windows-1254"></head><body><script>x()</script><p>Yönetmelik&nbsp;', 'latin1'),
  Buffer.from([0xde, 0xd0, 0xdd, 0xfd, 0xf6, 0xfc, 0xe7]),
  Buffer.from('  tamam</p></body></html>', 'latin1'),
])

let sunucu: Server
let taban = ''
let sonBaslik: IncomingHttpHeaders = {}

beforeAll(async () => {
  sunucu = createServer((istek, yanit) => {
    sonBaslik = istek.headers
    if (istek.url === '/cp1254') {
      yanit.writeHead(200, { 'Content-Type': 'text/html' })
      yanit.end(CP1254)
    } else if (istek.url === '/utf8') {
      yanit.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      yanit.end('<p>Madde 1 – Bu Yönetmelik yayımı tarihinde yürürlüğe girer.</p>')
    } else {
      yanit.writeHead(404)
      yanit.end('yok')
    }
  })
  await new Promise<void>((coz) => sunucu.listen(0, '127.0.0.1', coz))
  taban = `http://127.0.0.1:${(sunucu.address() as AddressInfo).port}`
})
afterAll(() => {
  sunucu.close()
})

describe('ham-cekim.cjs', () => {
  it('kullanıcı etmenini ve istenen başlıkları gönderir', async () => {
    await ham.hamCek({ url: `${taban}/utf8`, accept: 'application/xhtml+xml', dil: 'eng' })
    expect(sonBaslik['user-agent']).toBe(ham.VARSAYILAN_UA)
    expect(sonBaslik['user-agent']).not.toMatch(/^curl\//i)
    expect(sonBaslik.accept).toBe('application/xhtml+xml')
    expect(sonBaslik['accept-language']).toBe('eng')
  })

  it('windows-1254 sayfayı <meta charset> ile çözer; etiket ve betik soyulur, NFC uygulanır', async () => {
    const s = await ham.hamCek({ url: `${taban}/cp1254`, alinti: ['Yönetmelik ŞĞİıöüç tamam'] })
    expect(s.kodlama).toBe('windows-1254')
    expect(s.metin).toBe('Yönetmelik ŞĞİıöüç tamam')
    expect(s.alintilar[0].bulundu).toBe(true)
    expect(s.metin).not.toContain('x()')
  })

  it('ham sha baytın, metin sha etiketsiz metnin sha256 ilk 12\'sidir ve ikisi farklıdır', async () => {
    const s = await ham.hamCek({ url: `${taban}/cp1254` })
    expect(s.sha256_ilk12).toBe(ham.sha12(CP1254))
    expect(s.sha256_metin_ilk12).toBe(ham.sha12(s.metin))
    expect(s.sha256_ilk12).not.toBe(s.sha256_metin_ilk12)
    expect(s.bayt).toBe(CP1254.length)
  })

  it('alıntı birebir eşleşmezse bulundu=false ve kaynak girdisinde alinti_dogrulandi=false', async () => {
    const s = await ham.hamCek({ url: `${taban}/utf8`, alinti: ['bu yönetmelik yayımı tarihinde'] })
    expect(s.alintilar[0].bulundu).toBe(false)
    const k = ham.kaynakGirdisi(s, { bugun: '2026-11-08' })
    expect(k.alinti_dogrulandi).toBe(false)
    expect(k.erisim_tarihi).toBe('2026-11-08')
  })

  it('doğru alıntıda kaynak girdisi doğrulanmış ve resmi:true gelir', async () => {
    const a = 'Bu Yönetmelik yayımı tarihinde yürürlüğe girer.'
    const s = await ham.hamCek({ url: `${taban}/utf8`, alinti: [a] })
    const k = ham.kaynakGirdisi(s, { bugun: '2026-11-08' })
    expect(k.alinti).toBe(a)
    expect(k.alinti_dogrulandi).toBe(true)
    expect(k.resmi).toBe(true)
  })

  it('kodlamaBul: başlık > meta > utf-8; verilen kodlama kazanır', () => {
    expect(ham.kodlamaBul(Buffer.from('x'), 'text/html; charset=ISO-8859-9')).toBe('iso-8859-9')
    expect(ham.kodlamaBul(Buffer.from('<meta charset="windows-1254">'), 'text/html')).toBe('windows-1254')
    expect(ham.kodlamaBul(Buffer.from('x'), null)).toBe('utf-8')
    expect(ham.kodlamaBul(Buffer.from('x'), 'text/html; charset=utf-8', 'windows-1254')).toBe('windows-1254')
  })

  it('http(s) olmayan adresi reddeder', async () => {
    await expect(ham.hamCek({ url: 'file:///etc/passwd' })).rejects.toThrow(/http/)
  })
})

describe('ham-cekim.cjs toplu (yeniden doğrulama)', () => {
  it('alintiKanittan eski alıntıyı kanıt dosyasından alır; sayfada yoksa doğrulandı=false üretir', async () => {
    const kok = mkdtempSync(path.join(tmpdir(), 'mvz-toplu-'))
    try {
      mkdirSync(path.join(kok, 'docs/mevzuat/kanit'), { recursive: true })
      const a = 'Madde 1 – Bu Yönetmelik yayımı tarihinde yürürlüğe girer.'
      writeFileSync(path.join(kok, 'docs/mevzuat/kayit.json'), JSON.stringify({ kalemler: [{ kimlik: 'K-1', kaynaklar_kanit: 'docs/mevzuat/kanit/K_1.json' }] }))
      writeFileSync(path.join(kok, 'docs/mevzuat/kanit/K_1.json'), JSON.stringify({ kaynaklar: [{ url: `${taban}/utf8`, alinti: a }] }))
      const topluHazirla = (require_('../ham-cekim.cjs') as { topluHazirla: (g: unknown, s: { kok: string }) => Promise<{ isler: { kimlik: string; kaynak: KaynakGirdisi; son_kontrol?: boolean }[] }> }).topluHazirla
      const ok = await topluHazirla({ bugun: '2026-11-08', isler: [{ kimlik: 'K-1', url: `${taban}/utf8`, alintiKanittan: true, son_kontrol: false }] }, { kok })
      expect(ok.isler[0].kaynak.alinti).toBe(a)
      expect(ok.isler[0].kaynak.alinti_dogrulandi).toBe(true)
      expect(ok.isler[0].kaynak.erisim_tarihi).toBe('2026-11-08')
      expect(ok.isler[0].son_kontrol).toBe(false)
      const yok = await topluHazirla({ isler: [{ kimlik: 'K-1', url: `${taban}/utf8`, alinti: 'sayfada olmayan cümle' }] }, { kok })
      expect(yok.isler[0].kaynak.alinti_dogrulandi).toBe(false)
      await expect(topluHazirla({ isler: [{ kimlik: 'K-1', url: `${taban}/baska`, alintiKanittan: true }] }, { kok })).rejects.toThrow(/alıntılı kaynak yok/)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })
})

describe('kanit-ekle.cjs', () => {
  let kok = ''
  const kaynak = (ek: Record<string, unknown> = {}) => ({
    url: 'https://www.resmigazete.gov.tr/eskiler/2026/01/x.htm',
    son_url: 'https://www.resmigazete.gov.tr/eskiler/2026/01/x.htm',
    http: 200,
    robots: 'ölçülmedi',
    erisim_tarihi: '2026-11-08',
    yayinci: 'www.resmigazete.gov.tr',
    resmi: true,
    yontem: 'Node fetch',
    durum_satiri: '',
    bayt: 10,
    sha256_ilk12: 'aaaaaaaaaaaa',
    sha256_metin_ilk12: 'bbbbbbbbbbbb',
    sha256_normalizasyon: 'n',
    alinti: 'a',
    alinti_dogrulandi: true,
    ...ek,
  })

  const kur = () => {
    kok = mkdtempSync(path.join(tmpdir(), 'mvz-kanit-'))
    mkdirSync(path.join(kok, 'docs/mevzuat/kanit'), { recursive: true })
    const kayit = {
      surum: '0.5',
      guncellendi: '2026-11-06',
      kalemler: [
        { kimlik: 'TR-X-1', eksen: 'F', kaynaklar_kanit: 'docs/mevzuat/kanit/TR-X_1.json', resmi_kaynak_sayisi: 0, son_kontrol: '2026-09-25', tarihler: { yayim: 'a', yururluk: 'b' }, iliski_notlari: [], acik_sorular: [] },
        { kimlik: 'TR-Y-2', eksen: 'F', kaynaklar_kanit: 'docs/mevzuat/kanit/TR-Y_2.json', resmi_kaynak_sayisi: 0, son_kontrol: '2026-09-25', iliski_notlari: [], acik_sorular: [] },
      ],
    }
    writeFileSync(path.join(kok, 'docs/mevzuat/kayit.json'), JSON.stringify(kayit, null, 2).replace(/\n/g, '\r\n') + '\r\n')
    writeFileSync(path.join(kok, 'docs/mevzuat/kanit/TR-X_1.json'), JSON.stringify({ kimlik: 'TR-X-1', eksen: 'F', kaynaklar: [{ url: 'https://eski', resmi: false }] }, null, 2).replace(/\n/g, '\r\n') + '\r\n')
  }
  const okuKayit = () => JSON.parse(readFileSync(path.join(kok, 'docs/mevzuat/kayit.json'), 'utf8')) as { guncellendi: string; kalemler: Record<string, unknown>[] }
  const okuKanit = () => JSON.parse(readFileSync(path.join(kok, 'docs/mevzuat/kanit/TR-X_1.json'), 'utf8')) as { kaynaklar: Record<string, unknown>[] }

  it('kaynağı ekler, resmi sayısını yeniden sayar, son_kontrol ve guncellendi\'yi yazar, CRLF\'yi korur', () => {
    kur()
    try {
      const { rapor } = ekle.uygula({ bugun: '2026-11-08', isler: [{ kimlik: 'TR-X-1', kaynak: kaynak(), iliski_notlari: ['n1'], acik_sorular: ['s1'], tarihler: { yayim: 'yeni' } }] }, { kok })
      expect(rapor[0]).toMatch(/kaynak eklendi/)
      const kalem = okuKayit().kalemler[0]
      expect(kalem.resmi_kaynak_sayisi).toBe(1)
      expect(kalem.son_kontrol).toBe('2026-11-08')
      expect(kalem.iliski_notlari).toEqual(['n1'])
      expect(kalem.tarihler).toEqual({ yayim: 'yeni', yururluk: 'b' })
      expect(okuKayit().guncellendi).toBe('2026-11-08')
      expect(okuKanit().kaynaklar).toHaveLength(2)
      expect(readFileSync(path.join(kok, 'docs/mevzuat/kayit.json'), 'utf8')).toContain('\r\n')
      expect(readFileSync(path.join(kok, 'docs/mevzuat/kanit/TR-X_1.json'), 'utf8').replace(/\r\n/g, '')).not.toContain('\n')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('aynı kaynak ve aynı not ikinci koşumda eklenmez (idempotent)', () => {
    kur()
    try {
      const is = { kimlik: 'TR-X-1', kaynak: kaynak(), iliski_notlari: ['n1'] }
      ekle.uygula({ bugun: '2026-11-08', isler: [is] }, { kok })
      const { rapor } = ekle.uygula({ bugun: '2026-11-08', isler: [is] }, { kok })
      expect(rapor[0]).toMatch(/zaten var/)
      expect(okuKanit().kaynaklar).toHaveLength(2)
      expect(okuKayit().kalemler[0].iliski_notlari).toEqual(['n1'])
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('doğrulanmamış alıntıyı reddeder ve hiçbir dosya yazmaz; izinle uyarıyla ekler', () => {
    kur()
    try {
      const once = readFileSync(path.join(kok, 'docs/mevzuat/kayit.json'), 'utf8')
      expect(() => ekle.uygula({ isler: [{ kimlik: 'TR-X-1', kaynak: kaynak({ alinti_dogrulandi: false }) }] }, { kok })).toThrow(/alinti_dogrulandi/)
      expect(readFileSync(path.join(kok, 'docs/mevzuat/kayit.json'), 'utf8')).toBe(once)
      const { uyari } = ekle.uygula({ bugun: '2026-11-08', isler: [{ kimlik: 'TR-X-1', kaynak: kaynak({ alinti_dogrulandi: false }), izinDogrulanmamis: true }] }, { kok })
      expect(uyari[0]).toMatch(/doğrulanmamış/)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('bilinmeyen kalemi ve kanıt dosyası olmayan kalemi (kanitOlustur yokken) reddeder; kanitOlustur iskelet kurar', () => {
    kur()
    try {
      expect(() => ekle.uygula({ isler: [{ kimlik: 'YOK', kaynak: kaynak() }] }, { kok })).toThrow(/kalem yok/)
      expect(() => ekle.uygula({ isler: [{ kimlik: 'TR-Y-2', kaynak: kaynak() }] }, { kok })).toThrow(/kanitOlustur/)
      ekle.uygula({ bugun: '2026-11-08', isler: [{ kimlik: 'TR-Y-2', kaynak: kaynak(), kanitOlustur: true }] }, { kok })
      const y = JSON.parse(readFileSync(path.join(kok, 'docs/mevzuat/kanit/TR-Y_2.json'), 'utf8')) as { kimlik: string; kaynaklar: unknown[] }
      expect(y.kimlik).toBe('TR-Y-2')
      expect(y.kaynaklar).toHaveLength(1)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('kuru koşumda hiçbir dosya değişmez', () => {
    kur()
    try {
      const once = readFileSync(path.join(kok, 'docs/mevzuat/kayit.json'), 'utf8')
      const { rapor } = ekle.uygula({ bugun: '2026-11-08', isler: [{ kimlik: 'TR-X-1', kaynak: kaynak() }] }, { kok, kuru: true })
      expect(rapor[rapor.length - 1]).toMatch(/KURU/)
      expect(readFileSync(path.join(kok, 'docs/mevzuat/kayit.json'), 'utf8')).toBe(once)
      expect(okuKanit().kaynaklar).toHaveLength(1)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('bozuk bugun biçimini reddeder', () => {
    kur()
    try {
      expect(() => ekle.uygula({ bugun: '8 Kasım', isler: [{ kimlik: 'TR-X-1', kaynak: kaynak() }] }, { kok })).toThrow(/YYYY-AA-GG/)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })
})
