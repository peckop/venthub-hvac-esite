import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-WS-ETIKET-1 · ARC-24 (karar 257) — günlük WrongStack etiket kontrolü sessizce sökülemez.
 *
 * NİÇİN VAR: Dependabot npm'e bakar, GitHub'daki sürümü görmez; WrongStack GitHub'da npm'den ÖNCE çıkıyor.
 * Kontrol iki parçadır ve ikisi de sessizce bozulabilir: (a) betiğin sürüm kararı (sözlük sırasına dönerse
 * 1.0.9 > 1.0.10 olur ve yeni etiket görünmez; yalnız `releases/latest`e bakarsa etiketlenmiş ama yayını
 * hazırlanmamış sürüm kaçar; kalıcı bozulma "geçici" sayılırsa kontrol sonsuza dek yeşil ve kör kalır),
 * (b) workflow'un güvenlik sözleşmesi (yazma izni, secret, self-hosted runner, sabitlenmemiş eylem, kalıcı
 * kimlik bilgisi: depo PUBLIC iken yabancı koda kapı açar). Hiçbiri tsc/lint/build'e görünmez.
 *
 * Betik GERÇEK ağ olmadan, enjekte edilen sahte ağla sınanır — `main()` dahil (çıkış kodu, `::error::` satırı,
 * `--ozet` yazımı). Workflow dosyası ham metin üzerinden okunur (depoda YAML ayrıştırıcı yok) ve ⭐yorum
 * satırları ATILIR: gerekçe metninde geçen "self-hosted", "secret" gibi kelimeler kapıyı yanlış kırmızı,
 * silinmiş bir adımın gerekçesi ise yanlış yeşil yapardı.
 */

const KOK = path.resolve(__dirname, '../../..')
const BETIK = path.join(KOK, 'scripts', 'board', 'wrongstack-etiket-bak.cjs')
const WF = '.github/workflows/wrongstack-etiket-kontrol.yml'
const TABAN_DOSYASI = 'tools/wrongstack-mcp/etiket-taban.json'

// Windows kopyasında text=auto satır sonunu CRLF yazar; kalıplar \n arar → tek biçime indirilir.
const oku = (p: string): string => fs.readFileSync(path.join(KOK, p), 'utf8').replace(/\r\n/g, '\n')
const yorumsuz = (metin: string): string =>
  metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')
/** JS yorum satırlarını atar (satır bazlı: dize içeriğine dokunmaz). */
const jsYorumsuz = (metin: string): string =>
  metin
    .split('\n')
    .filter((s) => !/^\s*(\/\/|\/\*|\*)/.test(s))
    .join('\n')

interface Surum {
  etiket: string
  tarih: string | null
  notMetni: string
  kaynak: string
}
interface Sonuc {
  durum: 'yeni' | 'yok' | 'belirsiz' | 'bozuk'
  taban: string
  yeni?: string
  son?: string
  kaynak?: string
  tarih?: string | null
  compare?: string
  notSatirlari?: string[]
  npm?: string
  uyari?: string
  uyarilar?: string[]
  cikis: number
}
interface Ag {
  getir: (yol: string) => Promise<unknown>
}
interface Okuyucu {
  readFileSync: (y: string, k: string) => string
}
interface Modul {
  surumCoz: (e: string) => number[] | null
  surumKarsilastir: (a: string, b: string) => number
  hataSinifi: (mesaj: string) => 'gecici' | 'kalici'
  tabanOku: (yol: string, okuyucu?: Okuyucu) => string
  sonEtiketiOku: (ag: Ag) => Promise<Surum>
  notuSuz: (metin: string) => string[]
  karar: (taban: string, son: Surum | null, hata?: { mesaj: string; sinif: string } | null) => Sonuc
  kontrolEt: (g: { tabanYolu: string; ag: Ag; npm: (s: string) => Promise<string>; okuyucu?: Okuyucu }) => Promise<Sonuc>
  ozetMetni: (s: Sonuc) => string
  main: (
    argv: string[],
    bag?: { ag?: Ag; npm?: (s: string) => Promise<string>; yaz?: (s: string) => void }
  ) => Promise<number>
}
const m = createRequire(import.meta.url)(BETIK) as Modul

const TABAN_OKUYUCU = (icerik: string): Okuyucu => ({ readFileSync: () => icerik })
const TABAN_V30 = TABAN_OKUYUCU('{"sonGorulen":"v1.0.30"}')

/** Sahte GitHub: latest verilen yanıtı döner (ya da reddeder); tags verilen listeyi. */
function sahteAg(o: { latest?: unknown; tags?: unknown }): Ag {
  return {
    getir: async (yol: string) => {
      const yanit = yol.includes('/releases/latest') ? o.latest : o.tags
      if (yanit instanceof Error) throw yanit
      if (yanit === undefined) throw new Error(`sahte ag: ${yol} icin yanit yok`)
      return yanit
    },
  }
}
const surum = (tag: string, govde = 'not'): unknown => ({
  tag_name: tag,
  published_at: '2026-10-01T21:49:54Z',
  body: govde,
})
const npmSahte = (d: string) => async (): Promise<string> => d
const e404 = (): Error => new Error('gh api x basarisiz (gh: Not Found (HTTP 404))')
const e503 = (): Error => new Error('gh api x basarisiz (gh: Service Unavailable (HTTP 503))')

describe('INV-WS-ETIKET-1 · sürüm kararı (betik, sahte ağ)', () => {
  it('sürüm sayısal karşılaştırılır: v1.0.30 > v1.0.29, 1.0.9 < 1.0.10, v öneki fark etmez', () => {
    expect(m.surumKarsilastir('v1.0.30', 'v1.0.29')).toBe(1)
    expect(m.surumKarsilastir('1.0.9', '1.0.10'), 'sözlük sırası: 1.0.9 > 1.0.10 sanılıyor').toBe(-1)
    expect(m.surumKarsilastir('v1.2.0', 'v1.10.0')).toBe(-1)
    expect(m.surumKarsilastir('v2.0.0', 'v1.99.99')).toBe(1)
    expect(m.surumKarsilastir('v1.0.30', '1.0.30')).toBe(0)
  })

  it('ön-sürüm ve bozuk etiket çözülmez (tabana girmez), karşılaştırma ATAR', () => {
    expect(m.surumCoz('v1.0.31-rc.1')).toBeNull()
    expect(m.surumCoz('nightly')).toBeNull()
    expect(() => m.surumKarsilastir('nightly', 'v1.0.30')).toThrow()
  })

  it('son etiket tabandan büyük → YENİ (çıkış 1), compare bağlantısı + not ilk 40 satır', async () => {
    const govde = Array.from({ length: 60 }, (_, i) => `satir ${i + 1}`).join('\n')
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: surum('v1.0.31', govde), tags: [{ name: 'v1.0.31' }, { name: 'v1.0.30' }] }),
      npm: npmSahte('yok'),
      okuyucu: TABAN_V30,
    })
    expect(s.durum).toBe('yeni')
    expect(s.cikis, 'yeni etiket iş KIRMIZI bitirmeli').toBe(1)
    expect(s.yeni).toBe('v1.0.31')
    expect(s.compare).toBe('https://github.com/WrongStack/WrongStack/compare/v1.0.30...v1.0.31')
    expect(s.notSatirlari).toHaveLength(40)
    expect(s.notSatirlari?.[39]).toBe('satir 40')
    expect(s.npm).toBe('yok')
  })

  it('son etiket tabana EŞİT → yeni yok (çıkış 0), özet metni SESSİZ (boş)', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: surum('v1.0.30'), tags: [{ name: 'v1.0.30' }] }),
      npm: npmSahte('var'),
      okuyucu: TABAN_V30,
    })
    expect(s.durum).toBe('yok')
    expect(s.cikis).toBe(0)
    expect(m.ozetMetni(s), 'yeni yokken özet yazıldı — sessiz olmalı').toBe('')
  })

  it('son etiket tabandan KÜÇÜK (geri alınmış yayın) → yeni yok, kırmızı DEĞİL', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: surum('v1.0.29'), tags: [{ name: 'v1.0.29' }] }),
      npm: npmSahte('var'),
      okuyucu: TABAN_V30,
    })
    expect(s.durum).toBe('yok')
    expect(s.cikis).toBe(0)
  })

  it('1.0.9 → 1.0.10 gerçek akışta YENİ sayılır (sözlük sırası sabotajına karşı akış kolu)', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: surum('v1.0.10'), tags: [{ name: 'v1.0.10' }] }),
      npm: npmSahte('yok'),
      okuyucu: TABAN_OKUYUCU('{"sonGorulen":"v1.0.9"}'),
    })
    expect(s.durum, 'v1.0.10, v1.0.9 tabanından yeni sayılmadı').toBe('yeni')
  })

  it('⭐İKİ KAYNAK BİRLEŞİR: latest=v1.0.29 ama tags içinde v1.0.31 var → v1.0.31 (BULGU 1)', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: surum('v1.0.29'), tags: [{ name: 'v1.0.31' }, { name: 'v1.0.30' }] }),
      npm: npmSahte('yok'),
      okuyucu: TABAN_V30,
    })
    expect(s.durum, 'latest başarılı diye /tags okunmadı: yayını hazırlanmamış etiket kaçıyor').toBe('yeni')
    expect(s.yeni).toBe('v1.0.31')
    expect(s.kaynak).toBe('tags')
    expect(s.tarih, 'tags kaynağında yayın tarihi uydurulmamalı').toBeNull()
  })

  it('eşit sürümde latest kazanır (tarih ve yayın notu onda); tags sırası sonucu değiştirmez', async () => {
    const s = await m.sonEtiketiOku(
      sahteAg({
        latest: surum('v1.0.31', 'yayin notu'),
        tags: [{ name: 'v1.0.9' }, { name: 'v1.0.31' }, { name: 'v1.0.10' }, { name: 'v1.0.32-rc.1' }],
      })
    )
    expect(s.etiket).toBe('v1.0.31')
    expect(s.kaynak).toBe('releases/latest')
    expect(s.notMetni).toBe('yayin notu')
  })

  it('latest düşse de /tags tek başına yeter (yayın kaydı olmayan depo): en büyük sürüm, ön-sürüm hariç', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({
        latest: e404(),
        tags: [{ name: 'v1.0.9' }, { name: 'v1.0.31' }, { name: 'v1.0.10' }, { name: 'v1.0.32-rc.1' }],
      }),
      npm: npmSahte('belirsiz'),
      okuyucu: TABAN_V30,
    })
    expect(s.durum).toBe('yeni')
    expect(s.yeni, 'ön-sürüm ya da sıradaki ilk etiket seçilmiş').toBe('v1.0.31')
    expect(s.uyarilar?.join(' '), 'kısmi okuma uyarısı kayboldu').toContain('releases/latest')
  })

  it('YENİ etiket özeti: etiket, tarih, taban, compare, npm durumu, not — hepsi yazılı', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: surum('v1.0.31', 'degisiklik notu'), tags: [] }),
      npm: npmSahte('yok'),
      okuyucu: TABAN_V30,
    })
    const metin = m.ozetMetni(s)
    for (const beklenen of [
      'v1.0.31',
      '2026-10-01T21:49:54Z',
      'v1.0.30',
      '/compare/v1.0.30...v1.0.31',
      "npm'de henüz yok",
      'degisiklik notu',
    ]) {
      expect(metin, `özette "${beklenen}" yok`).toContain(beklenen)
    }
    const var_ = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: surum('v1.0.31'), tags: [] }),
      npm: npmSahte('var'),
      okuyucu: TABAN_V30,
    })
    expect(m.ozetMetni(var_)).toContain("npm'de var")
  })

  it('taban dosyası bozuk/eksik → HATA (sessiz varsayılan yok); gerçek taban geçerli ve çözülür', () => {
    expect(() => m.tabanOku('x', TABAN_OKUYUCU('degil json'))).toThrow(/JSON/)
    expect(() => m.tabanOku('x', TABAN_OKUYUCU('{"sonGorulen":"nightly"}'))).toThrow(/sonGorulen/)
    expect(() => m.tabanOku(path.join(KOK, 'yok', 'dosya.json'))).toThrow(/okunamadi/)
    const gercek = m.tabanOku(path.join(KOK, TABAN_DOSYASI))
    expect(m.surumCoz(gercek), 'depodaki taban dosyası geçerli bir sürüm taşımalı').not.toBeNull()
  })
})

describe('INV-WS-ETIKET-1 · geçici ile KALICI bozulma ayrımı (BULGU 2)', () => {
  it.each([
    ['gh: Not Found (HTTP 404)', 'kalici'],
    ['gh: Resource not accessible (HTTP 403)', 'kalici'],
    ['gh: Bad credentials (HTTP 401)', 'kalici'],
    ['gh: Moved Permanently (HTTP 301)', 'kalici'],
    ['gh: Gone (HTTP 410)', 'kalici'],
    ['spawnSync gh ENOENT', 'kalici'],
    ['', 'kalici'],
    ['tanimadigim bir hata', 'kalici'],
    ['gh: Bad Gateway (HTTP 502)', 'gecici'],
    ['gh: Service Unavailable (HTTP 503)', 'gecici'],
    ['gh: Too Many Requests (HTTP 429)', 'gecici'],
    ['ETIMEDOUT', 'gecici'],
    ['spawnSync gh ETIMEDOUT', 'gecici'],
    ['dial tcp: lookup api.github.com: no such host', 'gecici'],
    ['getaddrinfo ENOTFOUND api.github.com', 'gecici'],
    ['Post "https://api.github.com": context deadline exceeded (Client.Timeout exceeded)', 'gecici'],
  ])('hataSinifi(%j) → %s', (mesaj, beklenen) => {
    expect(m.hataSinifi(mesaj)).toBe(beklenen)
  })

  it('⭐404 + 404 (depo adı değişti/silindi) → KALICI BOZUK, çıkış 1 (sessiz yeşil değil)', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: e404(), tags: e404() }),
      npm: npmSahte('var'),
      okuyucu: TABAN_V30,
    })
    expect(s.durum).toBe('bozuk')
    expect(s.cikis, 'kalıcı bozulma sessiz geçildi: kontrol sonsuza dek yeşil ve kör').toBe(1)
    expect(s.uyari).toContain('KALICI')
    expect(m.ozetMetni(s)).toContain('KALICI BOZUK')
  })

  it('geçerli etiket YOK (iki uç da boş döndü) → KALICI BOZUK, çıkış 1', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: {}, tags: [] }),
      npm: npmSahte('var'),
      okuyucu: TABAN_V30,
    })
    expect(s.durum).toBe('bozuk')
    expect(s.cikis).toBe(1)
  })

  it('yalnız ön-sürüm etiketleri varsa da "geçerli etiket yok" sayılır (KALICI)', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: surum('v2.0.0-beta.1'), tags: [{ name: 'v2.0.0-beta.1' }] }),
      npm: npmSahte('var'),
      okuyucu: TABAN_V30,
    })
    expect(s.durum).toBe('bozuk')
  })

  it('⭐GEÇİCİ hata (5xx / zaman aşımı) KIRMIZI DEĞİL: belirsiz + uyarı, çıkış 0', async () => {
    for (const hata of [e503(), new Error('spawnSync gh ETIMEDOUT')]) {
      const s = await m.kontrolEt({
        tabanYolu: 'x',
        ag: sahteAg({ latest: hata, tags: hata }),
        npm: npmSahte('var'),
        okuyucu: TABAN_V30,
      })
      expect(s.durum).toBe('belirsiz')
      expect(s.cikis, 'geçici hata işi kırmızı yaptı — her gün alarm bakılmayan alarma döner').toBe(0)
      expect(s.uyari, 'uyarı satırı yok — sessizlik "yeni yok" ile karışır').toContain('olculemedi')
      expect(m.ozetMetni(s), 'belirsiz sonuç özette görünmeli').toContain('ÖLÇÜLEMEDİ')
    }
  })

  it('karışık hata: biri geçici biri kalıcı → henüz KALICI değil (kendiliğinden düzelebilir), çıkış 0', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: e404(), tags: e503() }),
      npm: npmSahte('var'),
      okuyucu: TABAN_V30,
    })
    expect(s.durum).toBe('belirsiz')
    expect(s.cikis).toBe(0)
  })
})

describe('INV-WS-ETIKET-1 · main(): çıkış kodu, ::error:: satırı, --ozet yazımı (BULGU 3)', () => {
  /** Geçici dizinde taban dosyası kurar; `tabanYolu` ve `ozet` döner. */
  function kur(taban: string): { taban: string; ozet: string; temizle: () => void } {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-etiket-'))
    const t = path.join(d, 'taban.json')
    fs.writeFileSync(t, JSON.stringify({ sonGorulen: taban }))
    return { taban: t, ozet: path.join(d, 'ozet.md'), temizle: () => fs.rmSync(d, { recursive: true, force: true }) }
  }
  async function kos(
    taban: string,
    ag: Ag,
    npm: (s: string) => Promise<string> = npmSahte('yok'),
    ekArgv: string[] = []
  ): Promise<{ kod: number; cikti: string; satirlar: string[]; ozet: string }> {
    const k = kur(taban)
    try {
      let cikti = ''
      const kod = await m.main(['--taban', k.taban, '--ozet', k.ozet, ...ekArgv], { ag, npm, yaz: (s) => (cikti += s) })
      return {
        kod,
        cikti,
        satirlar: cikti.split('\n'),
        ozet: fs.existsSync(k.ozet) ? fs.readFileSync(k.ozet, 'utf8') : '',
      }
    } finally {
      k.temizle()
    }
  }

  it('YENİ etiket → 1, ::error:: satırı, özet dosyasına yazılır, npm sürümü "v"siz sorulur', async () => {
    const sorulan: string[] = []
    const r = await kos(
      'v1.0.30',
      sahteAg({ latest: surum('v1.0.31', 'notum'), tags: [{ name: 'v1.0.31' }] }),
      async (s) => {
        sorulan.push(s)
        return 'yok'
      }
    )
    expect(r.kod, 'yeni etiket çıkışı 1 değil: iş yeşil biter, sinyal görünmez').toBe(1)
    expect(r.cikti).toContain('::error::WrongStack yeni etiket: v1.0.31 (taban v1.0.30)')
    expect(r.ozet, '--ozet dosyasına yazılmadı').toContain('WrongStack YENİ ETİKET: v1.0.31')
    expect(r.ozet).toContain('/compare/v1.0.30...v1.0.31')
    expect(r.ozet).toContain("npm'de henüz yok")
    expect(sorulan).toEqual(['1.0.31'])
  })

  it('yeni etiket YOK → 0, ::error:: YOK, özet dosyası oluşmaz', async () => {
    const r = await kos('v1.0.30', sahteAg({ latest: surum('v1.0.30'), tags: [{ name: 'v1.0.30' }] }))
    expect(r.kod).toBe(0)
    expect(r.cikti).not.toContain('::error::')
    expect(r.cikti).toContain('yeni etiket yok')
    expect(r.ozet, 'sessiz durumda özet yazıldı').toBe('')
  })

  it('GEÇİCİ hata → 0 + ::warning::; KALICI bozulma → 1 + ::error::', async () => {
    const gecici = await kos('v1.0.30', sahteAg({ latest: e503(), tags: e503() }))
    expect(gecici.kod).toBe(0)
    expect(gecici.cikti).toContain('::warning::')
    expect(gecici.cikti).not.toContain('::error::')

    const kalici = await kos('v1.0.30', sahteAg({ latest: e404(), tags: e404() }))
    expect(kalici.kod, 'kalıcı bozulma çıkışı 1 değil').toBe(1)
    expect(kalici.cikti).toContain('::error::')
    expect(kalici.ozet).toContain('KALICI BOZUK')
  })

  it('taban dosyası bozuk → 2 + ::error:: (kontrol kör kalamaz)', async () => {
    let cikti = ''
    const kod = await m.main(['--taban', path.join(KOK, 'yok', 'taban.json')], {
      ag: sahteAg({ latest: surum('v9.9.9'), tags: [] }),
      npm: npmSahte('yok'),
      yaz: (s) => (cikti += s),
    })
    expect(kod).toBe(2)
    expect(cikti).toContain('::error::')
  })

  it('--json: ayrıştırılabilir JSON basar, çıkış kodu değişmez', async () => {
    const r = await kos('v1.0.30', sahteAg({ latest: surum('v1.0.31'), tags: [] }), npmSahte('var'), ['--json'])
    expect(r.kod).toBe(1)
    const sonuc = JSON.parse(r.cikti.slice(0, r.cikti.indexOf('\n}\n') + 2)) as Sonuc
    expect(sonuc.durum).toBe('yeni')
    expect(sonuc.npm).toBe('var')
  })

  it('kısmi okuma (bir uç düştü, ötekiyle karar verildi) ::warning:: satırı basar', async () => {
    const r = await kos('v1.0.30', sahteAg({ latest: e503(), tags: [{ name: 'v1.0.30' }] }))
    expect(r.kod).toBe(0)
    expect(r.cikti).toMatch(/::warning::.*kismen okunamadi.*releases\/latest/)
  })

  it('CLI süreci: taban dosyası yoksa çıkış 2 ve ::error:: satırı (gerçek alt süreç)', () => {
    let kod = 0
    let cikti = ''
    try {
      execFileSync(process.execPath, [BETIK, '--taban', path.join(KOK, 'yok', 'taban.json')], {
        encoding: 'utf8',
        stdio: 'pipe',
      })
    } catch (e) {
      const err = e as { status?: number; stdout?: string }
      kod = err.status ?? -1
      cikti = err.stdout ?? ''
    }
    expect(kod).toBe(2)
    expect(cikti).toContain('::error::')
  })
})

describe('INV-WS-ETIKET-1 · dış kaynaklı sürüm notu iş akışı komutu enjekte edemez (BULGU 5)', () => {
  const SALDIRI = 'ok\n::add-mask::v1\n::error::SAHTE\n```\n# kapandi'

  it('notuSuz: satır başı ::komut:: ve ##[komut] etkisiz, düz satırlar aynen', () => {
    const s = m.notuSuz(`${SALDIRI}\n  ::stop-commands::x\n##[error]eski`)
    expect(s.filter((l) => /^\s*(::|##\[)/.test(l)), 'komut öneki etkisizleşmedi').toEqual([])
    expect(s[0]).toBe('ok')
    expect(s[1]).toContain('::add-mask::v1') // metin KORUNUR, yalnız önek etkisiz
    expect(s).toHaveLength(7)
  })

  it('main() çıktısında satır başı komut YOK; tek ::error:: satırı meşru olandır', async () => {
    let cikti = ''
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-etiket-'))
    try {
      const t = path.join(d, 'taban.json')
      fs.writeFileSync(t, '{"sonGorulen":"v1.0.30"}')
      await m.main(['--taban', t, '--ozet', path.join(d, 'o.md')], {
        ag: sahteAg({ latest: surum('v1.0.31', SALDIRI), tags: [] }),
        npm: npmSahte('yok'),
        yaz: (s) => (cikti += s),
      })
      const satirlar = cikti.split('\n')
      expect(satirlar.filter((l) => /^\s*::add-mask::/.test(l)), 'sahte ::add-mask:: komutu geçti').toEqual([])
      const hatalar = satirlar.filter((l) => /^\s*::error::/.test(l))
      expect(hatalar, 'sahte ::error:: satırı geçti').toEqual(['::error::WrongStack yeni etiket: v1.0.31 (taban v1.0.30)'])
    } finally {
      fs.rmSync(d, { recursive: true, force: true })
    }
  })

  it('özet: notta ``` varsa çit DAHA UZUN seçilir; not bloğu erken kapatamaz', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: surum('v1.0.31', SALDIRI), tags: [] }),
      npm: npmSahte('yok'),
      okuyucu: TABAN_V30,
    })
    const satirlar = m.ozetMetni(s).split('\n')
    const acilis = satirlar.findIndex((l) => /^`{3,}text$/.test(l))
    expect(acilis, 'kod bloğu açılışı yok').toBeGreaterThan(-1)
    const cit = satirlar[acilis].replace('text', '')
    expect(cit.length, 'çit nottaki ``` ile aynı uzunlukta: not bloğu kapatır').toBeGreaterThanOrEqual(4)
    // Çitin kendisi olan satır SAYISI tam 1 olmalı (kapanış); notun ``` satırı çit DEĞİL.
    expect(satirlar.filter((l) => l === cit)).toHaveLength(1)
    expect(satirlar.indexOf('```'), 'notun ``` satırı bloğun İÇİNDE kalmalı').toBeGreaterThan(acilis)
    expect(satirlar.indexOf('```')).toBeLessThan(satirlar.indexOf(cit))
  })

  it('özet: ISO olmayan tarih ("x\\n::error::y") yazılmaz', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: { tag_name: 'v1.0.31', published_at: 'x\n::error::y', body: 'n' }, tags: [] }),
      npm: npmSahte('yok'),
      okuyucu: TABAN_V30,
    })
    const metin = m.ozetMetni(s)
    expect(metin).not.toContain('::error::y')
    expect(metin).toContain('bilinmiyor')
  })
})

describe('INV-WS-ETIKET-1 · workflow sözleşmesi (public depo, yalnız okur)', () => {
  const ham = oku(WF)
  const w = yorumsuz(ham)
  const betikKodu = jsYorumsuz(oku('scripts/board/wrongstack-etiket-bak.cjs'))

  it('günde bir zamanlanmış koşar ve elle tetiklenebilir', () => {
    expect(w, 'schedule bloğu yok: kontrol hiç koşmaz').toMatch(/^on:\s*\n\s+schedule:\s*\n\s+-\s*cron:/m)
    const cron = /-\s*cron:\s*'([^']+)'/.exec(w)?.[1] ?? ''
    // Günde bir = gün-ay-haftanın günü alanları '*'; dakika ve saat tek sayı (aralık/adım değil).
    expect(cron, `cron "${cron}" günde bir değil`).toMatch(/^\d{1,2} \d{1,2} \* \* \*$/)
    expect(w, 'workflow_dispatch yok: elle doğrulanamaz').toMatch(/^\s+workflow_dispatch:/m)
  })

  it('permissions YALNIZ `contents: read` (başka izin, özellikle write, YOK)', () => {
    const bloklar = [...w.matchAll(/^([ \t]*)permissions:[^\n]*\n((?:\1[ \t]+\S[^\n]*\n?)*)/gm)]
    expect(bloklar.length, 'permissions bloğu yok: varsayılanlar geniş kalır').toBeGreaterThanOrEqual(1)
    for (const b of bloklar) {
      const izinler = b[2]
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      expect(izinler, `permissions yalnız "contents: read" olmalı: ${izinler.join(' | ')}`).toEqual([
        'contents: read',
      ])
    }
    expect(w, 'yorum dışında "write" geçiyor').not.toMatch(/\bwrite\b/i)
  })

  it('self-hosted runner, secrets (her biçim), pull_request_target YOK (public depo: yabancı kod yüzeyi)', () => {
    expect(w, 'runs-on self-hosted: fork PR yabancı kodu makinede çalıştırır').not.toMatch(/self-hosted/i)
    for (const r of w.matchAll(/runs-on:\s*(\S+)/g)) {
      expect(r[1], `runs-on GitHub barındırmalı olmalı: ${r[1]}`).toMatch(/^ubuntu-/)
    }
    // `secrets.X`, `secrets['X']`, `secrets["X"]`, `toJSON(secrets)`, `secrets: inherit` — hepsini yakalar.
    expect(w, 'secrets geçiyor: kontrol yalnız github.token ile okur').not.toMatch(/\bsecrets\b/i)
    expect(w, 'pull_request_target geçiyor').not.toMatch(/pull_request_target/)
    expect(w, 'pull_request tetiği geçiyor: kontrol PR kodu hakkında bir şey söylemez').not.toMatch(
      /^\s+pull_request:/m
    )
  })

  it('her `uses:` 40 haneli commit SHA\'sına sabit (@main / @v4 gibi kayan başvuru YOK)', () => {
    const kullanimlar = [...w.matchAll(/^\s*(?:-\s*)?uses:\s*(\S+)/gm)].map((x) => x[1])
    expect(kullanimlar.length, 'uses: bulunamadı — ayrıştırma kırık').toBeGreaterThanOrEqual(2)
    for (const u of kullanimlar) {
      expect(u, `eylem SHA'ya sabit değil: ${u} (tedarik zinciri: etiket/dal kayar)`).toMatch(/@[0-9a-f]{40}$/)
    }
  })

  it('checkout kalıcı kimlik bilgisi BIRAKMAZ (`persist-credentials: false`)', () => {
    expect(
      w,
      'checkout GITHUB_TOKEN\'ı .git/config\'te bırakıyor: sonraki adımlar/betik onu okuyabilir'
    ).toMatch(/actions\/checkout@[0-9a-f]{40}[^\n]*\n\s+with:\s*\n(?:\s+\S[^\n]*\n)*?\s+persist-credentials:\s*false\b/)
  })

  it('betiği çağırır, GH_TOKEN yalnız github.token, dışarı yazan adım YOK', () => {
    expect(w, 'workflow kararı betiğe devretmiyor').toContain('node scripts/board/wrongstack-etiket-bak.cjs')
    expect(w).toMatch(/GH_TOKEN:\s*\$\{\{\s*github\.token\s*\}\}/)
    // Dışarıya yazan her yol: issue/PR/yorum açan gh alt komutları, git push/commit, yazan eylemler.
    expect(w, 'gh ile yazma komutu').not.toMatch(/\bgh\s+(issue|pr|release|workflow|label|repo)\b/)
    expect(w, 'git push/commit').not.toMatch(/\bgit\s+(push|commit)\b/)
    expect(w, 'continue-on-error: kırmızı sinyal yutulur').not.toMatch(/continue-on-error/)
    expect(w, 'workflow gh api çağırıyor: örtük POST riski betikte kilitli, burada olmamalı').not.toMatch(/\bgh\s+api\b/)
  })

  it('betiğin gh çağrısı YALNIZ GET: `-X/--method/-f/-F/--field/--raw-field/--input` yok (örtük POST)', () => {
    expect(betikKodu, 'gh api çağrısı beklenen biçimde değil').toContain("execFileSync('gh', ['api', yol]")
    const yasak = /(['"`\s])(-X|--method|-f|-F|--field|--raw-field|--input)(['"`\s=])/
    expect(betikKodu, 'betikte gh api yazma bayrağı: -f/-F/--field/--input örtük POST yapar').not.toMatch(yasak)
    // Dışarıya yazan başka yollar: git push, issue/PR açan gh alt komutları, dosya commit.
    expect(betikKodu).not.toMatch(/\bgit\b.*\b(push|commit)\b/)
    expect(betikKodu).not.toMatch(/\['(issue|pr|release|workflow|label)'/)
  })

  it('betik ve taban dosyası yerinde (workflow ikisine de bağlı)', () => {
    expect(fs.existsSync(BETIK)).toBe(true)
    expect(fs.existsSync(path.join(KOK, TABAN_DOSYASI))).toBe(true)
    expect(ham, 'taban dosyasının yolu workflow gerekçesinde anılmalı').toContain(TABAN_DOSYASI)
  })
})

describe('INV-WS-ETIKET-1 · taban güncelleme prosedürü belgeli (BULGU 6)', () => {
  it('tools/wrongstack-mcp/README.md "Yeni etiket bildirimi" bölümü: ölçüm, dal, kart/karar numarası', () => {
    const r = oku('tools/wrongstack-mcp/README.md')
    const bolum = r.split(/^##+\s*Yeni etiket bildirimi/m)[1] ?? ''
    expect(bolum, 'README\'de "Yeni etiket bildirimi" bölümü yok: alarm kırmızı yanar, ne yapılacağı belgesiz').not.toBe('')
    const govde = bolum.split(/^##\s/m)[0]
    for (const parca of ['npm view', 'gh api', 'etiket-taban.json', 'ARC-24', '257', 'Kanban']) {
      expect(govde, `prosedürde "${parca}" yok`).toContain(parca)
    }
  })
})
