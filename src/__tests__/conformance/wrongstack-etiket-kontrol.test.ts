import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-WS-ETIKET-1 · ARC-24 (karar 257) — günlük WrongStack etiket kontrolü sessizce sökülemez.
 *
 * NİÇİN VAR: Dependabot npm'e bakar, GitHub'daki sürümü görmez; WrongStack GitHub'da npm'den ÖNCE çıkıyor.
 * Kontrol iki parçadır ve ikisi de sessizce bozulabilir: (a) betiğin sürüm kararı (sözlük sırasına dönerse
 * 1.0.9 > 1.0.10 olur ve yeni etiket görünmez), (b) workflow'un güvenlik sözleşmesi (yazma izni, secret,
 * self-hosted runner depo PUBLIC iken yabancı koda kapı açar). Hiçbiri tsc/lint/build'e görünmez.
 *
 * Betik GERÇEK ağ olmadan, enjekte edilen sahte ağla sınanır; workflow dosyası ham metin üzerinden okunur
 * (depoda YAML ayrıştırıcı yok) ve ⭐yorum satırları ATILIR: gerekçe metninde geçen "self-hosted", "secret"
 * gibi kelimeler kapıyı yanlış kırmızı, silinmiş bir adımın gerekçesi ise yanlış yeşil yapardı.
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

interface Surum {
  etiket: string
  tarih: string | null
  notMetni: string
  kaynak: string
}
interface Sonuc {
  durum: 'yeni' | 'yok' | 'belirsiz'
  taban: string
  yeni?: string
  son?: string
  compare?: string
  notSatirlari?: string[]
  npm?: string
  uyari?: string
  cikis: number
}
interface Ag {
  getir: (yol: string) => Promise<unknown>
}
interface Modul {
  surumCoz: (e: string) => number[] | null
  surumKarsilastir: (a: string, b: string) => number
  tabanOku: (yol: string, okuyucu?: { readFileSync: (y: string, k: string) => string }) => string
  sonEtiketiOku: (ag: Ag) => Promise<Surum>
  karar: (taban: string, son: Surum | null, hata?: string) => Sonuc
  kontrolEt: (g: {
    tabanYolu: string
    ag: Ag
    npm: (s: string) => Promise<string>
    okuyucu?: { readFileSync: (y: string, k: string) => string }
  }) => Promise<Sonuc>
  ozetMetni: (s: Sonuc) => string
}
const m = createRequire(import.meta.url)(BETIK) as Modul

const TABAN_OKUYUCU = (icerik: string) => ({ readFileSync: () => icerik })
const TABAN_V30 = TABAN_OKUYUCU('{"sonGorulen":"v1.0.30"}')

/** Sahte GitHub: latest verilen yanıtı döner (ya da reddeder); tags verilen listeyi. */
function sahteAg(o: { latest?: unknown | Error; tags?: unknown | Error }): Ag {
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
const npmSahte = (d: string) => async () => d

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
      ag: sahteAg({ latest: surum('v1.0.31', govde) }),
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
      ag: sahteAg({ latest: surum('v1.0.30') }),
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
      ag: sahteAg({ latest: surum('v1.0.29') }),
      npm: npmSahte('var'),
      okuyucu: TABAN_V30,
    })
    expect(s.durum).toBe('yok')
    expect(s.cikis).toBe(0)
  })

  it('1.0.9 → 1.0.10 gerçek akışta YENİ sayılır (sözlük sırası sabotajına karşı akış kolu)', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: surum('v1.0.10') }),
      npm: npmSahte('yok'),
      okuyucu: TABAN_OKUYUCU('{"sonGorulen":"v1.0.9"}'),
    })
    expect(s.durum, 'v1.0.10, v1.0.9 tabanından yeni sayılmadı').toBe('yeni')
  })

  it('⭐AĞ HATASINDA KIRMIZI DEĞİL: belirsiz sonuç + uyarı satırı, çıkış 0', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: new Error('ag yok'), tags: new Error('ag yok') }),
      npm: npmSahte('var'),
      okuyucu: TABAN_V30,
    })
    expect(s.durum).toBe('belirsiz')
    expect(s.cikis, 'geçici ağ hatası işi kırmızı yaptı — her gün alarm bakılmayan alarma döner').toBe(0)
    expect(s.uyari, 'uyarı satırı yok — sessizlik "yeni yok" ile karışır').toContain('olculemedi')
    expect(s.uyari).toContain('ag yok')
    expect(m.ozetMetni(s), 'belirsiz sonuç özette görünmeli').toContain('ÖLÇÜLEMEDİ')
  })

  it('releases/latest düşerse /tags yedeğine geçer ve EN BÜYÜK sürümü seçer (sıra değil)', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({
        latest: new Error('404'),
        tags: [{ name: 'v1.0.9' }, { name: 'v1.0.31' }, { name: 'v1.0.10' }, { name: 'v1.0.32-rc.1' }],
      }),
      npm: npmSahte('belirsiz'),
      okuyucu: TABAN_V30,
    })
    expect(s.durum).toBe('yeni')
    expect(s.yeni, 'ön-sürüm ya da sıradaki ilk etiket seçilmiş').toBe('v1.0.31')
  })

  it('YENİ etiket özeti: etiket, tarih, taban, compare, npm durumu, not — hepsi yazılı', async () => {
    const s = await m.kontrolEt({
      tabanYolu: 'x',
      ag: sahteAg({ latest: surum('v1.0.31', 'degisiklik notu') }),
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
      ag: sahteAg({ latest: surum('v1.0.31') }),
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

  it('CLI: taban dosyası yoksa çıkış 2 ve ::error:: satırı (kontrol kör kalamaz)', () => {
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

describe('INV-WS-ETIKET-1 · workflow sözleşmesi (public depo, yalnız okur)', () => {
  const ham = oku(WF)
  const w = yorumsuz(ham)

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

  it('self-hosted runner, secrets, pull_request_target YOK (public depo: yabancı kod yüzeyi)', () => {
    expect(w, 'runs-on self-hosted: fork PR yabancı kodu makinede çalıştırır').not.toMatch(/self-hosted/i)
    for (const r of w.matchAll(/runs-on:\s*(\S+)/g)) {
      expect(r[1], `runs-on GitHub barındırmalı olmalı: ${r[1]}`).toMatch(/^ubuntu-/)
    }
    expect(w, 'secrets. geçiyor: kontrol yalnız github.token ile okur').not.toMatch(/secrets\./)
    expect(w, 'pull_request_target geçiyor').not.toMatch(/pull_request_target/)
    expect(w, 'pull_request tetiği geçiyor: kontrol PR kodu hakkında bir şey söylemez').not.toMatch(
      /^\s+pull_request:/m
    )
  })

  it('betiği çağırır, GH_TOKEN yalnız github.token, dışarı yazan adım YOK', () => {
    expect(w, 'workflow kararı betiğe devretmiyor').toContain('node scripts/board/wrongstack-etiket-bak.cjs')
    expect(w).toMatch(/GH_TOKEN:\s*\$\{\{\s*github\.token\s*\}\}/)
    // Dışarıya yazan her yol: issue/PR/yorum açan gh alt komutları, git push/commit, yazan eylemler.
    expect(w, 'gh ile yazma komutu').not.toMatch(/\bgh\s+(issue|pr|release|workflow|api\s+-X|api\s+--method)\b/)
    expect(w, 'git push/commit').not.toMatch(/\bgit\s+(push|commit)\b/)
    expect(w, 'continue-on-error: kırmızı sinyal yutulur').not.toMatch(/continue-on-error/)
  })

  it('betik ve taban dosyası yerinde (workflow ikisine de bağlı)', () => {
    expect(fs.existsSync(BETIK)).toBe(true)
    expect(fs.existsSync(path.join(KOK, TABAN_DOSYASI))).toBe(true)
    expect(ham, 'taban dosyasının yolu workflow gerekçesinde anılmalı').toContain(TABAN_DOSYASI)
  })
})
