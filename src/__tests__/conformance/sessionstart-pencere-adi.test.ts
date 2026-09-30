import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-SESSIONSTART-AD-1..6 · SessionStart kancası pencere adını ŞERİT adına sabitler (REC-525).
 *
 * NİÇİN: `hookSpecificOutput.sessionTitle` Claude Code'da `/rename` ile aynı etkidir (belge:
 * code.claude.com/docs/en/hooks). Pencereleri IDE eklentisi `--resume=<sid>` ile açıyor, `--name` bayrağı yok;
 * ad verilmezse pencereler anlamsız adlarla açılır ve şerit ↔ pencere eşlemesi karışır (REC-404).
 * Belge: alan startup/resume/fork'ta UYGULANIR, clear ve compact'ta YOK SAYILIR.
 *
 * DÜZENEK: hermetik. Pano geçici dizinde (`VENTHUB_BOARD_DIR`), pencere kayıtları geçici dizinde
 * (`VENTHUB_OTURUM_KAYIT_DIZINI`); kanca gerçekten çalıştırılır. Kanca `cwd` olarak git DEPOSU OLMAYAN bir dizin alır:
 * aksi hâlde kanca çalışma ağacının gerçek `venthub-sid` kimlik dosyasını sahte oturum numarasıyla ezerdi.
 *
 * ⭐KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: ad var / talep yok / clear-compact / bozuk kayıt / bağlam korunumu / JSON
 * geçerliliği ayrı davranışlardır; biri yeşil diye ötekiler ölçülmüş olmaz.
 *
 * Cetvel: `execution-method-standard.md` §9 (ölçüm) · kanca `.claude/hooks/session-board.cjs` · kardeş kapı
 * `sessionstart-tavan.test.ts` (çıktı boyutu ve rol kartı).
 */

const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude/hooks/session-board.cjs')
const SID = '0dfe070e-0000-4000-8000-pencereadi01'

let gecici = ''
let calismaDizini = ''
let kayitDizini = ''
let sayac = 0

interface Sonuc {
  durum: number | null
  ham: string
  hso: Record<string, unknown> | null
  ek: string
  baslik: unknown
}

beforeAll(() => {
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-ad-'))
  calismaDizini = path.join(gecici, 'proje') // git deposu DEĞİL (bkz. dosya başı)
  kayitDizini = path.join(gecici, 'oturum-kayitlari')
  fs.mkdirSync(calismaDizini)
  fs.mkdirSync(kayitDizini)
})

afterAll(() => {
  // Kanca KOPUK bir arka plan süreci başlatır (registry-autosync) ve o süreç çalışma dizinini kısa süre tutar
  // (Windows EBUSY). Temizlik en iyi çabadır: geçici dizin işletim sistemi temizliğine kalabilir, test bozulmaz.
  try {
    if (gecici) fs.rmSync(gecici, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 })
  } catch {
    /* geçici dizin kilitli: sonraki OS temizliğine kalır */
  }
})

/** Her senaryoya kendi (boş) pano dizini: senaryolar birbirinin talebini görmez. */
function yeniPano(): string {
  sayac += 1
  const d = path.join(gecici, `pano-${sayac}`)
  fs.mkdirSync(d)
  return d
}

function olayYaz(pano: string, olay: Record<string, unknown>, sid = SID): void {
  fs.appendFileSync(
    path.join(pano, `events.${sid}.jsonl`),
    JSON.stringify({ ts: new Date().toISOString(), sid, ...olay }) + '\n',
    'utf8',
  )
}

function talepYaz(pano: string, lane: unknown, ts = new Date().toISOString()): void {
  fs.appendFileSync(
    path.join(pano, `events.${SID}.jsonl`),
    JSON.stringify({ ts, sid: SID, type: 'claim', lane, globs: ['ornek/**'] }) + '\n',
    'utf8',
  )
}

function calistir(source: string, pano: string, ekEnv: Record<string, string> = {}): Sonuc {
  const girdi = JSON.stringify({ session_id: SID, source, cwd: calismaDizini, hook_event_name: 'SessionStart' })
  const r = spawnSync(process.execPath, [KANCA], {
    input: girdi,
    encoding: 'utf8',
    cwd: calismaDizini,
    // Geliştiricinin kendi kabuğundaki değerler testi etkilemesin: rol ipucu, arşiv anahtarı, tavan geçersiz kılması.
    env: {
      ...process.env,
      CLAUDE_PROJECT_DIR: KOK,
      VENTHUB_BOARD_DIR: pano,
      VENTHUB_OTURUM_KAYIT_DIZINI: kayitDizini,
      VH_SESSIONSTART_TOPLAM_TEST: '',
      VH_ROL_KARTI_URETICI: '',
      CC_LANE: '',
      LINEAR_API_KEY: '',
      ...ekEnv,
    },
    windowsHide: true,
    timeout: 60_000,
  })
  const ham = r.stdout || ''
  let hso: Record<string, unknown> | null = null
  try {
    const j = JSON.parse(ham) as { hookSpecificOutput?: Record<string, unknown> }
    hso = j.hookSpecificOutput ?? null
  } catch {
    /* JSON değilse hso null kalır; ilgili kontroller başarısız olur */
  }
  return {
    durum: r.status,
    ham,
    hso,
    ek: typeof hso?.additionalContext === 'string' ? hso.additionalContext : '',
    baslik: hso ? hso.sessionTitle : undefined,
  }
}

const alanVar = (s: Sonuc): boolean => s.hso !== null && Object.prototype.hasOwnProperty.call(s.hso, 'sessionTitle')

/**
 * Şerit → pencere adı tablosu (Recep 09-30: pencereleri elle "Ops", "Yetenek", "Harita", "Araç" diye adlandırdı).
 * Kancadaki PENCERE_ADLARI ile AYNI olmalı; burada bağımsız yazılıdır ki kancada bir satır bozulunca kırmızı yansın.
 */
const TABLO: ReadonlyArray<readonly [string, string]> = [
  ['ARAC', 'Araç'],
  ['HARITA', 'Harita'],
  ['OPS', 'Ops'],
  ['YETENEK', 'Yetenek'],
  ['URUN', 'Ürün'],
  ['ALTYAPI', 'Altyapı'],
  ['ADMIN', 'Admin'],
  ['GEO-SEO', 'Geo-SEO'],
]

describe('INV-SESSIONSTART-AD-1 · talep varsa startup/resume/fork pencere adını şeridin insan adına sabitler', () => {
  for (const source of ['startup', 'resume', 'fork']) {
    it(`${source}: sessionTitle = tablodaki ad (ARAC → "Araç")`, () => {
      const pano = yeniPano()
      talepYaz(pano, 'ARAC')
      const s = calistir(source, pano)
      expect(s.durum).toBe(0)
      expect(s.baslik).toBe('Araç')
    })
  }

  it('TABLONUN HER SATIRI ölçülür: şerit adı → pencere adı', () => {
    for (const [serit, ad] of TABLO) {
      const pano = yeniPano()
      talepYaz(pano, serit)
      expect(calistir('resume', pano).baslik, serit).toBe(ad)
    }
  })

  it('tablo anahtarı büyük/küçük harfe duyarsız: panoda küçük yazılmış "ops" da "Ops" olur', () => {
    const pano = yeniPano()
    talepYaz(pano, 'ops')
    expect(calistir('startup', pano).baslik).toBe('Ops')
  })

  it('tabloda OLMAYAN şerit: ilk harf büyük, kalanı küçük; Türkçe karakter üretilmez, ham ad çıplak basılmaz', () => {
    for (const [serit, ad] of [
      ['KATALOG', 'Katalog'],
      ['ADMIN-CUSTOMER', 'Admin-customer'],
      ['MEKANIZMA-PROBU', 'Mekanizma-probu'],
      ['GORSEL', 'Gorsel'], // "Görsel" TAHMİN EDİLMEZ — tabloya satır eklenene kadar ASCII kalır
      ['constructor', 'Constructor'], // prototip adı sıradan şerit gibi işlenir
    ] as const) {
      const pano = yeniPano()
      talepYaz(pano, serit)
      expect(calistir('startup', pano).baslik, serit).toBe(ad)
    }
  })

  it('aynı oturum sonradan şerit genişletse de (ikinci claim) ad değişmez', () => {
    const pano = yeniPano()
    talepYaz(pano, 'URUN')
    olayYaz(pano, { type: 'heartbeat' })
    talepYaz(pano, 'URUN')
    expect(calistir('startup', pano).baslik).toBe('Ürün')
  })
})

describe('INV-SESSIONSTART-AD-2 · talep YOKSA sessionTitle alanı hiç eklenmez (mevcut ad bozulmaz)', () => {
  it('pano boş: alan yok; talep edilmemiş satırı korunur', () => {
    const s = calistir('startup', yeniPano())
    expect(s.durum).toBe(0)
    expect(alanVar(s)).toBe(false)
    expect(s.ek).toContain('TALEP EDİLMEMİŞ')
  })

  it('CC_LANE ortam değişkeni ad SAYILMAZ: talep yoksa ipucu tek başına pencereyi adlandırmaz', () => {
    const s = calistir('startup', yeniPano(), { CC_LANE: 'ARAC' })
    expect(alanVar(s)).toBe(false)
  })

  it('başka oturumun talebi bu pencereye ad vermez', () => {
    const pano = yeniPano()
    olayYaz(pano, { type: 'claim', lane: 'OPS', globs: ['x/**'] }, '11111111-2222-4333-8444-555555555555')
    expect(alanVar(calistir('resume', pano))).toBe(false)
  })

  it('BIRAKILMIŞ talep (release) ad vermez', () => {
    const pano = yeniPano()
    talepYaz(pano, 'ARAC')
    olayYaz(pano, { type: 'release' })
    expect(alanVar(calistir('resume', pano))).toBe(false)
  })

  it('SÜRESİ DOLMUŞ (5 saat atışsız) talep ad vermez: ölü talep canlı kimlik değildir', () => {
    const pano = yeniPano()
    talepYaz(pano, 'ARAC', new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString())
    expect(alanVar(calistir('resume', pano))).toBe(false)
  })

  it("lane alanı hiç yazılmamış talep ('lane' yer tutucusu) pencereyi 'lane' diye adlandırmaz", () => {
    const pano = yeniPano()
    olayYaz(pano, { type: 'claim', globs: ['x/**'] })
    expect(alanVar(calistir('startup', pano))).toBe(false)
  })
})

describe('INV-SESSIONSTART-AD-3 · clear ve compact çıktısında sessionTitle YOKTUR (belge zaten yok sayar)', () => {
  for (const source of ['clear', 'compact']) {
    it(`${source}: talep olsa bile alan yok, şerit satırı bağlamda durur`, () => {
      const pano = yeniPano()
      talepYaz(pano, 'ARAC')
      const s = calistir(source, pano)
      expect(s.durum).toBe(0)
      expect(alanVar(s)).toBe(false)
      expect(s.ek).toContain('Şeridin: ARAC')
    })
  }
})

describe('INV-SESSIONSTART-AD-4 · bozuk talep / pano hatası: alan yok, kanca çıkış 0 (fail-open)', () => {
  it('lane string değil (nesne): alan yok, çıkış 0', () => {
    const pano = yeniPano()
    talepYaz(pano, { x: 1 })
    const s = calistir('startup', pano)
    expect(s.durum).toBe(0)
    expect(alanVar(s)).toBe(false)
    expect(s.ek.startsWith(`Oturum kimliğin: ${SID}`)).toBe(true)
  })

  it('lane sayı: alan yok', () => {
    const pano = yeniPano()
    talepYaz(pano, 42)
    expect(alanVar(calistir('startup', pano))).toBe(false)
  })

  it('lane yalnız boşluk/kontrol karakteri: alan yok (boş ad verilmez)', () => {
    const pano = yeniPano()
    talepYaz(pano, ' \n\t ')
    expect(alanVar(calistir('startup', pano))).toBe(false)
  })

  it('bozuk JSONL satırı: alan yok, çıkış 0, kimlik bağlamı yine basılır', () => {
    const pano = yeniPano()
    fs.writeFileSync(path.join(pano, `events.${SID}.jsonl`), '{bu json degil\n', 'utf8')
    const s = calistir('resume', pano)
    expect(s.durum).toBe(0)
    expect(alanVar(s)).toBe(false)
    expect(s.ek.startsWith(`Oturum kimliğin: ${SID}`)).toBe(true)
  })

  it('board.cjs İSTİSNA FIRLATIRSA (satır `null` JSON: sıralamada TypeError): alan yok, çıkış 0, kimlik bağlamı basılır', () => {
    // Ölçüldü: geçerli JSON ama nesne olmayan satır readEvents'e girer ve liveClaims'i düşürür — kancanın catch kolu.
    const pano = yeniPano()
    fs.writeFileSync(path.join(pano, `events.${SID}.jsonl`), 'null\n', 'utf8')
    talepYaz(pano, 'ARAC')
    const s = calistir('resume', pano)
    expect(s.durum).toBe(0)
    expect(alanVar(s)).toBe(false)
    expect(s.ek.startsWith(`Oturum kimliğin: ${SID}`)).toBe(true)
    expect(s.ek).toContain('pano okunamadı')
  })

  it('pano dizini yerine DOSYA gösterilirse (okunamaz pano): alan yok, çıkış 0', () => {
    const dosya = path.join(gecici, 'pano-dosya.txt')
    fs.writeFileSync(dosya, 'dizin degil', 'utf8')
    const s = calistir('startup', dosya)
    expect(s.durum).toBe(0)
    expect(alanVar(s)).toBe(false)
    expect(s.hso).not.toBeNull()
  })

  it('kontrol karakterli ad temizlenir (satır sonu/zil atılır) ve 60 karakteri aşmaz', () => {
    const pano = yeniPano()
    talepYaz(pano, 'ARAC\nSAHTE\u0007SATIR')
    expect(calistir('startup', pano).baslik).toBe('Arac sahte satir')

    const uzun = yeniPano()
    talepYaz(uzun, 'U'.repeat(200))
    const ad = calistir('startup', uzun).baslik
    expect(typeof ad).toBe('string')
    expect((ad as string).length).toBeLessThanOrEqual(60)
    expect((ad as string).length).toBeGreaterThan(0)
  })
})

describe('INV-SESSIONSTART-AD-5 · mevcut additionalContext KORUNUR (regresyon)', () => {
  for (const source of ['startup', 'resume', 'fork', 'clear', 'compact']) {
    it(`${source}: kimlik ilk satır, rol kartı ve şerit satırı yerinde`, () => {
      const pano = yeniPano()
      talepYaz(pano, 'ARAC')
      const s = calistir(source, pano)
      const satirlar = s.ek.split('\n')
      expect(satirlar[0]).toBe(`Oturum kimliğin: ${SID}`)
      expect(satirlar[1]).toBe(`Açılış türü (source): ${source}`)
      expect(satirlar[2]).toContain('ROL KARTI: ARAC')
      expect(s.ek).toContain('Şeridin: ARAC — ornek/**')
      expect(s.hso?.hookEventName).toBe('SessionStart')
      expect(s.ek.length).toBeLessThanOrEqual(9000)
    })
  }

  it('talep yokken de bağlam aynen: kimlik + rol kartı bilinmiyor + talep edilmemiş', () => {
    const s = calistir('startup', yeniPano())
    expect(s.ek.startsWith(`Oturum kimliğin: ${SID}`)).toBe(true)
    expect(s.ek).toContain('ROL KARTI:')
    expect(s.ek).toContain('TALEP EDİLMEMİŞ')
  })
})

describe('INV-SESSIONSTART-AD-7 · scripts/board/pencere-adlari.cjs tek kaynaktır: tablo dışa aktarılır, ad() ölçülür', () => {
  const modul = createRequire(path.join(KOK, 'package.json'))('./scripts/board/pencere-adlari.cjs') as {
    ad: (serit: unknown) => string
    TABLO: ReadonlyArray<readonly [string, string]>
    PENCERE_ADLARI: Map<string, string>
  }

  it('dışa aktarılan TABLO beklenen sekiz satırın aynısıdır (sıra dahil)', () => {
    expect(modul.TABLO.map(([k, v]) => [k, v])).toEqual(TABLO.map(([k, v]) => [k, v]))
    expect(modul.PENCERE_ADLARI.size).toBe(TABLO.length)
  })

  it('ad(): her tablo satırı, küçük harfli yazım ve bilinmeyen şerit', () => {
    for (const [serit, ad] of TABLO) {
      expect(modul.ad(serit), serit).toBe(ad)
      expect(modul.ad(serit.toLowerCase()), serit.toLowerCase()).toBe(ad)
    }
    expect(modul.ad('KATALOG')).toBe('Katalog')
    expect(modul.ad('  ARAC  ')).toBe('Araç')
  })

  it("ad(): bozuk girdi '' verir (alan eklenmez)", () => {
    for (const bozuk of [undefined, null, 42, {}, [], '', '   ', '\n\t', 'lane']) {
      expect(modul.ad(bozuk), String(bozuk)).toBe('')
    }
  })

  it('ad(): kontrol karakterleri temizlenir, 60 karakterle sınırlanır, prototip anahtarı sızmaz', () => {
    expect(modul.ad('ARAC\nSAHTE\u0007SATIR')).toBe('Arac sahte satir')
    expect(modul.ad('u'.repeat(200)).length).toBe(60)
    expect(modul.ad('__proto__')).toBe('__proto__')
    expect(modul.ad('toString')).toBe('Tostring')
  })

  it('kanca tabloyu KENDİ İÇİNDE tutmaz: modülü çağırır (kopya = ayrışma)', () => {
    const kaynak = fs.readFileSync(KANCA, 'utf8')
    expect(kaynak).toContain('pencere-adlari.cjs')
    expect(kaynak).not.toMatch(/\['URUN',\s*'Ürün'\]/)
  })
})

describe('INV-SESSIONSTART-AD-6 · çıktı TEK geçerli JSON nesnesidir, beklenmeyen alan yok', () => {
  for (const source of ['startup', 'resume', 'fork', 'clear', 'compact']) {
    it(`${source}: stdout yalnız { hookSpecificOutput } ve alanlar izinli kümede`, () => {
      const pano = yeniPano()
      talepYaz(pano, 'ARAC')
      const s = calistir(source, pano)
      expect(s.durum).toBe(0)
      const j = JSON.parse(s.ham) as Record<string, unknown> // ham metin bütünüyle JSON: fazladan çıktı olsa atar
      expect(Object.keys(j)).toEqual(['hookSpecificOutput'])
      const izinli = new Set(['hookEventName', 'additionalContext', 'sessionTitle'])
      for (const k of Object.keys(s.hso ?? {})) expect(izinli.has(k), `beklenmeyen alan: ${k}`).toBe(true)
    })
  }
})
