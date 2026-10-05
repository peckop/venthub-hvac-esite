import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-SESSIONSTART-AD-1..10 · SessionStart kancası pencere adını ŞERİT adına sabitler (REC-525).
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

function talepYaz(pano: string, lane: unknown, ts = new Date().toISOString(), sid = SID): void {
  fs.appendFileSync(
    path.join(pano, `events.${sid}.jsonl`),
    JSON.stringify({ ts, sid, type: 'claim', lane, globs: ['ornek/**'] }) + '\n',
    'utf8',
  )
}

const BASKA_SID = '11111111-2222-4333-8444-555555555555'
const besSaatOnce = (): string => new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()

/** `girdiEk`: SessionStart stdin'ine eklenen alanlar (örn. `session_title`, ya da `session_id` ile başka oturum). */
function calistir(
  source: string,
  pano: string,
  ekEnv: Record<string, string> = {},
  girdiEk: Record<string, unknown> = {},
): Sonuc {
  const girdi = JSON.stringify({
    session_id: SID,
    source,
    cwd: calismaDizini,
    hook_event_name: 'SessionStart',
    ...girdiEk,
  })
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
  ['BLOG', 'Blog'],
  // ARC-61 (10-05): rol kartı olup tabloda olmayan yedi departman. Tablo ↔ rol kartı eşitliği ayrıca departman-ac-kapat.test.ts INV-DEPARTMAN-AC-9.
  ['TASARIM', 'Tasarım'],
  ['SATIS', 'Satış'],
  ['MARKA', 'Marka'],
  ['KATALOG', 'Katalog'],
  ['EDGE', 'Edge'],
  ['I18N', 'I18N'],
  ['MEVZUAT', 'Mevzuat'],
]

describe('INV-SESSIONSTART-AD-1 · talep varsa startup/resume/fork pencere adını şeridin insan adına sabitler', () => {
  // ⚠SINIR (fork): gerçek fork'ta yeni oturum YENİ sid alır ve panoda talebi olmaz; aşağıdaki döngü aynı sid ile yalnız
  // `source` dalını ölçer (fork'ta alan üretilebiliyor). Gerçek fork'un claim'siz ilk açılışı ayrı testte: ad ALMAZ.
  for (const source of ['startup', 'resume', 'fork']) {
    it(`${source}: sessionTitle = tablodaki ad (ARAC → "Araç")`, () => {
      const pano = yeniPano()
      talepYaz(pano, 'ARAC')
      const s = calistir(source, pano)
      expect(s.durum).toBe(0)
      expect(s.baslik).toBe('Araç')
    })
  }

  it("gerçek fork: YENİ sid'in talebi yok → alan yok (kaynak oturumun talebi çocuğa ad vermez)", () => {
    const pano = yeniPano()
    talepYaz(pano, 'ARAC') // kaynak oturum (SID) talepli
    const s = calistir('fork', pano, {}, { session_id: BASKA_SID }) // çocuk oturum: yeni sid, talep yok
    expect(s.durum).toBe(0)
    expect(alanVar(s)).toBe(false)
    // Kaynak oturumun talebi BAYATSA da (canlı çakışma kuralı devreye girmeden) çocuk ad almaz: eşleşme yalnız sid'dir.
    const bayat = yeniPano()
    talepYaz(bayat, 'ARAC', besSaatOnce())
    expect(alanVar(calistir('fork', bayat, {}, { session_id: BASKA_SID }))).toBe(false)
  })

  it('TABLONUN HER SATIRI ölçülür: şerit adı → pencere adı', () => {
    for (const [serit, ad] of TABLO) {
      const pano = yeniPano()
      talepYaz(pano, serit)
      expect(calistir('resume', pano).baslik, serit).toBe(ad)
    }
  }, 120_000) // her satır gerçek kancayı ayrı süreçte koşturur; tablo 16 satıra çıkınca varsayılan 20 sn yetmedi (ARC-61)

  it('tablo anahtarı büyük/küçük harfe duyarsız: panoda küçük yazılmış "ops" da "Ops" olur', () => {
    const pano = yeniPano()
    talepYaz(pano, 'ops')
    expect(calistir('startup', pano).baslik).toBe('Ops')
  })

  it('tabloda OLMAYAN şerit: ilk harf büyük, kalanı küçük; Türkçe karakter üretilmez, ham ad çıplak basılmaz', () => {
    for (const [serit, ad] of [
      ['DENEME-SERIT', 'Deneme-serit'], // tabloda olmayan örnek (KATALOG 10-05'te tabloya girdi, ARC-61)
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

  it("BAŞKA oturumun SÜRESİ DOLMUŞ talebi bu pencereye ad vermez (bayat talep yalnız kendi sid'ine ad verir; AD-10)", () => {
    const pano = yeniPano()
    talepYaz(pano, 'ARAC', besSaatOnce(), BASKA_SID)
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

describe('INV-SESSIONSTART-AD-8 · session_title: FARKLI dolu ad EZİLMEZ; boş ya da tablodaki adla AYNI ise kanonik ad YAZILIR', () => {
  // Belge (SessionStart girdisi): `session_title` = başlık zaten ayarlıysa (--name, /rename) dolu gelir. Ölçüm (Ops): restart/
  // resume'da harness dökümdeki /rename adını geri yüklemiyor, pid kaydına türetilmiş ad yazıyor → aynı değeri yazmak zararsız.
  for (const source of ['startup', 'resume', 'fork']) {
    it(`${source}: session_title FARKLI ve dolu → alan yok, talep olsa bile`, () => {
      const pano = yeniPano()
      talepYaz(pano, 'ARAC')
      const s = calistir(source, pano, {}, { session_title: 'Recep-in-verdigi-ad' })
      expect(s.durum).toBe(0)
      expect(alanVar(s)).toBe(false)
      expect(s.ek).toContain('Şeridin: ARAC') // bağlam yine tam
    })
  }

  it('farklı ad ezilmez: "Araç-2", tablodaki BAŞKA şeridin adı ("Ops") ve önek/sonek benzerleri', () => {
    for (const farkli of ['Araç-2', 'Ops', 'Arac Yeni', 'Araçlar', 'A', 'venthub-hvac-72']) {
      const pano = yeniPano()
      talepYaz(pano, 'ARAC')
      expect(alanVar(calistir('resume', pano, {}, { session_title: farkli })), farkli).toBe(false)
    }
  })

  it('AYNI ad (harf/Türkçe harf farksız) → kanonik biçim YAZILIR: Araç = arac = ARAÇ = ARAC = araç = " Araç "', () => {
    for (const ayni of ['Araç', 'arac', 'ARAÇ', 'ARAC', 'araç', 'Arac', ' Araç ', 'ARAC\t']) {
      const pano = yeniPano()
      talepYaz(pano, 'ARAC')
      const s = calistir('resume', pano, {}, { session_title: ayni })
      expect(s.durum).toBe(0)
      expect(s.baslik, JSON.stringify(ayni)).toBe('Araç') // kanonik: tablodaki yazım, gelen yazım DEĞİL
    }
  })

  it('Türkçe harf katlaması tabloda: Ü/Ö/Ç/Ş/Ğ/İ/ı — ÜRÜN=urun, ALTYAPI=altyapı, GEO-SEO=geo-seo', () => {
    for (const [serit, ayni, kanonik] of [
      ['URUN', 'ÜRÜN', 'Ürün'],
      ['URUN', 'urun', 'Ürün'],
      ['URUN', 'ürün', 'Ürün'],
      ['ALTYAPI', 'altyapı', 'Altyapı'],
      ['ALTYAPI', 'ALTYAPI', 'Altyapı'],
      ['ALTYAPI', 'Altyapi', 'Altyapı'],
      ['GEO-SEO', 'geo-seo', 'Geo-SEO'],
      ['GEO-SEO', 'GEO-SEO', 'Geo-SEO'],
      ['OPS', 'OPS', 'Ops'],
    ] as const) {
      const pano = yeniPano()
      talepYaz(pano, serit)
      expect(calistir('startup', pano, {}, { session_title: ayni }).baslik, `${serit} / ${ayni}`).toBe(kanonik)
    }
  })

  it('tabloda olmayan şerit: İ/ı/Ş katlaması da geçerli (IZMIR → "Izmir"; session_title "İZMİR" aynı sayılır)', () => {
    const pano = yeniPano()
    talepYaz(pano, 'IZMIR')
    expect(calistir('resume', pano, {}, { session_title: 'İZMİR' }).baslik).toBe('Izmir')
    const kalan = yeniPano()
    talepYaz(kalan, 'ISIK')
    expect(calistir('resume', kalan, {}, { session_title: 'ışık' }).baslik).toBe('Isik')
  })

  it('aynı ad ama başka CANLI oturum aynı adı alıyor: çakışma kuralı önce gelir, alan yok', () => {
    const pano = yeniPano()
    talepYaz(pano, 'ARAC')
    talepYaz(pano, 'ARAC', new Date().toISOString(), BASKA_SID)
    expect(alanVar(calistir('resume', pano, {}, { session_title: 'Araç' }))).toBe(false)
  })

  it('aynı ad ama talep YOK: yazılmaz (talep yokken alan hiç eklenmez, mevcut ad zaten korunur)', () => {
    expect(alanVar(calistir('resume', yeniPano(), {}, { session_title: 'Araç' }))).toBe(false)
  })

  it('session_title boş/yalnız boşluk/yok/string değil → alan VAR ve tablodaki ad yazılır', () => {
    for (const bos of ['', '   ', undefined, null, 5, {}]) {
      const pano = yeniPano()
      talepYaz(pano, 'ARAC')
      const s = calistir('resume', pano, {}, bos === undefined ? {} : { session_title: bos })
      expect(s.baslik, JSON.stringify(bos) ?? 'undefined').toBe('Araç')
    }
  })
})

describe('INV-SESSIONSTART-AD-9 · aynı adı alacak başka CANLI oturum varsa alan yok (ORTA-2: belirsiz ad, adsızlıktan kötü)', () => {
  it('aynı şeritte iki canlı oturum: İKİSİ DE ad almaz', () => {
    const pano = yeniPano()
    talepYaz(pano, 'ARAC')
    talepYaz(pano, 'ARAC', new Date().toISOString(), BASKA_SID)
    expect(alanVar(calistir('resume', pano))).toBe(false)
    expect(alanVar(calistir('resume', pano, {}, { session_id: BASKA_SID }))).toBe(false)
  })

  it("aynı adı veren farklı yazım ('arac' ile 'ARAC') çakışma sayılır", () => {
    const pano = yeniPano()
    talepYaz(pano, 'ARAC')
    talepYaz(pano, 'arac', new Date().toISOString(), BASKA_SID)
    expect(alanVar(calistir('startup', pano))).toBe(false)
  })

  it('farklı şeritler çakışmaz: ARAC ve OPS ayrı adı alır', () => {
    const pano = yeniPano()
    talepYaz(pano, 'ARAC')
    talepYaz(pano, 'OPS', new Date().toISOString(), BASKA_SID)
    expect(calistir('startup', pano).baslik).toBe('Araç')
    expect(calistir('startup', pano, {}, { session_id: BASKA_SID }).baslik).toBe('Ops')
  })

  it('aynı şeritteki diğer oturum BAYAT (ölü) ya da BIRAKILMIŞSA çakışma sayılmaz', () => {
    const bayat = yeniPano()
    talepYaz(bayat, 'ARAC')
    talepYaz(bayat, 'ARAC', besSaatOnce(), BASKA_SID)
    expect(calistir('resume', bayat).baslik).toBe('Araç')

    const birakilmis = yeniPano()
    talepYaz(birakilmis, 'ARAC')
    talepYaz(birakilmis, 'ARAC', new Date().toISOString(), BASKA_SID)
    olayYaz(birakilmis, { type: 'release' }, BASKA_SID)
    expect(calistir('resume', birakilmis).baslik).toBe('Araç')
  })

  it('başka canlı oturumun kayıtlı adı harf/Türkçe harf farkıyla aynıysa ("arac") da çakışma sayılır', () => {
    const pano = yeniPano()
    talepYaz(pano, 'ARAC')
    talepYaz(pano, 'OPS', new Date().toISOString(), BASKA_SID)
    const kayit = path.join(kayitDizini, '434343.json')
    fs.writeFileSync(kayit, JSON.stringify({ sessionId: BASKA_SID, name: 'ARAÇ' }), 'utf8')
    try {
      expect(alanVar(calistir('resume', pano))).toBe(false)
    } finally {
      fs.rmSync(kayit, { force: true })
    }
  })

  it('başka canlı oturumun PENCERE ADI zaten aynıysa (talebi başka şeritte olsa da) alan yok', () => {
    const pano = yeniPano()
    talepYaz(pano, 'ARAC')
    talepYaz(pano, 'OPS', new Date().toISOString(), BASKA_SID)
    const kayit = path.join(kayitDizini, '424242.json')
    fs.writeFileSync(kayit, JSON.stringify({ sessionId: BASKA_SID, name: 'Araç' }), 'utf8')
    try {
      expect(alanVar(calistir('resume', pano))).toBe(false)
    } finally {
      fs.rmSync(kayit, { force: true })
    }
    expect(calistir('resume', pano).baslik).toBe('Araç') // kayıt kalkınca ad verilir: karar gerçekten kayda bağlıydı
  })
})

describe('INV-SESSIONSTART-AD-10 · BAYAT (TTL dolmuş) talep KENDİ sid için ad verir; makine kapanıp sabah resume (ORTA-3)', () => {
  it('5 saat atışsız kendi talebi + resume/startup: ad var', () => {
    for (const source of ['resume', 'startup']) {
      const pano = yeniPano()
      talepYaz(pano, 'ARAC', besSaatOnce())
      const s = calistir(source, pano)
      expect(s.durum).toBe(0)
      expect(s.baslik, source).toBe('Araç')
    }
  })

  it('bayat talep: pano bağlamı BAYAT şeridi "TALEP EDİLMEMİŞ" diye gösterse de ad verilir (ad talebi bağlamdan bağımsız)', () => {
    const pano = yeniPano()
    talepYaz(pano, 'HARITA', besSaatOnce())
    expect(calistir('resume', pano).baslik).toBe('Harita')
  })

  it("başka sid'in bayat talebi bu pencereye ad vermez; kendi talebi bayat + başkası canlı aynı şerit: ad yok", () => {
    const baskasi = yeniPano()
    talepYaz(baskasi, 'ARAC', besSaatOnce(), BASKA_SID)
    expect(alanVar(calistir('resume', baskasi))).toBe(false)

    const cakisma = yeniPano()
    talepYaz(cakisma, 'ARAC', besSaatOnce())
    talepYaz(cakisma, 'ARAC', new Date().toISOString(), BASKA_SID)
    expect(alanVar(calistir('resume', cakisma))).toBe(false)
  })

  it('bayat sonra BIRAKILMIŞ talep ad vermez', () => {
    const pano = yeniPano()
    talepYaz(pano, 'ARAC', besSaatOnce())
    olayYaz(pano, { type: 'release' })
    expect(alanVar(calistir('resume', pano))).toBe(false)
  })

  it('SINIR: hiç talep etmemiş yeni pencere ilk açılışta ad ALMAZ (yalnız talepten sonraki açılışlarda)', () => {
    expect(alanVar(calistir('startup', yeniPano()))).toBe(false)
  })
})

describe('INV-SESSIONSTART-AD-7 · scripts/board/pencere-adlari.cjs tek kaynaktır: tablo dışa aktarılır, ad() ölçülür', () => {
  const modul = createRequire(path.join(KOK, 'package.json'))('./scripts/board/pencere-adlari.cjs') as {
    ad: (serit: unknown) => string
    katla: (metin: unknown) => string
    ayniMi: (a: unknown, b: unknown) => boolean
    TABLO: ReadonlyArray<readonly [string, string]>
    PENCERE_ADLARI: Map<string, string>
  }

  it('dışa aktarılan TABLO beklenen on altı satırın aynısıdır (sıra dahil)', () => {
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

  it('ad(): Türkçe harfli bilinmeyen şerit — İ bozulmaz (i + U+0307 olmaz), ASCII I → i kalır, ayrık yazım NFC olur', () => {
    expect(modul.ad('İZMİR')).toBe('İzmir') // varsayılan toLowerCase 'İ' → 'i̇' (2 kod noktası) üretirdi
    expect(modul.ad('İZMİR')).not.toContain('̇')
    expect(modul.ad('ADMIN-CUSTOMER')).toBe('Admin-customer') // tr kuralı 'Admın' YAPMAZ
    expect(modul.ad('ıslak')).toBe('Islak')
    expect(modul.ad('ÜRUNX')).toBe('Ürunx') // ayrık Ü → tek karakter Ü, sonra küçültme
    expect(modul.ad('ÜRUNX')).toBe('Ürunx'.normalize('NFC'))
  })

  it('ayniMi(): harf ve Türkçe harf farksız eşitlik; boş ve farklı adlar eşit DEĞİL', () => {
    const esit: ReadonlyArray<readonly [string, string]> = [
      ['Araç', 'arac'], ['ARAÇ', 'Araç'], ['ÜRÜN', 'Ürün'], ['urun', 'ÜRÜN'], ['altyapı', 'ALTYAPI'],
      ['İZMİR', 'izmir'], ['ışık', 'ISIK'], ['ÖĞRENCİ', 'ogrenci'], ['ŞEHİR', 'sehir'], [' Araç ', 'araç'],
      ['ÜRUN', 'Ürün'], // ayrık ve tek karakterli Ü aynı
    ]
    for (const [a, b] of esit) expect(modul.ayniMi(a, b), `${a} = ${b}`).toBe(true)
    const farkli: ReadonlyArray<readonly [string, string]> = [
      ['Araç', 'Araç-2'], ['Ops', 'Araç'], ['Araç', 'Araçlar'], ['', ''], ['   ', ''], ['', 'Araç'], ['Araç', ''],
    ]
    for (const [a, b] of farkli) expect(modul.ayniMi(a, b), `${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`).toBe(false)
  })

  it('katla(): bozuk girdide istisna atmaz', () => {
    expect(modul.katla(undefined)).toBe('undefined')
    expect(modul.katla(null)).toBe('null')
    const patlayan = { toString: (): string => { throw new Error('toString patladı') } }
    expect(() => modul.katla(patlayan)).not.toThrow()
    expect(modul.katla(patlayan)).toBe('')
    expect(modul.ayniMi(patlayan, patlayan)).toBe(false) // iki taraf da '' → eşit SAYILMAZ
  })

  it('ad(): ayrık yazım 60 sınırından ÖNCE NFC olur — birleştirici işaret tabandan ayrı kesilmez', () => {
    // 59 'a' + ayrık 'Ü' (U + U+0308) + 'x': NFC sonrası 61 kod noktası → 60'a kesilince Ü kalır (küçültülünce 'ü').
    const ad = modul.ad('a'.repeat(59) + 'Üx')
    expect(Array.from(ad).length).toBe(60)
    expect(Array.from(ad).at(-1)).toBe('ü')
  })

  it('ad(): 60 sınırı KOD NOKTASINA göre keser — yetim vekil (surrogate) kalmaz', () => {
    const uzun = 'a'.repeat(59) + '😀' + 'bcd' // 63 kod noktası; 60. kod noktası emoji, 61-63 atılmalı
    const ad = modul.ad(uzun)
    expect(Array.from(ad).length).toBe(60)
    expect(Array.from(ad).at(-1)).toBe('😀')
    expect(() => encodeURIComponent(ad), 'yetim vekil encodeURIComponent atar').not.toThrow()
    // UTF-16 sınırı tam emojinin ortasına denk gelen durum: 59 tek birimlik + emoji (2 birim) → 61 birim
    const orta = modul.ad('b'.repeat(59) + '😀😀')
    expect(() => encodeURIComponent(orta)).not.toThrow()
    expect(Array.from(orta).length).toBe(60)
  })

  it('kanca tabloyu KENDİ İÇİNDE tutmaz: modülü çağırır; tablodaki HİÇBİR ad kancada tırnaklı sabit olarak geçmez', () => {
    const kaynak = fs.readFileSync(KANCA, 'utf8')
    expect(kaynak).toContain('pencere-adlari.cjs')
    // Yorumlar atılır (açıklamalarda adlar geçebilir); geriye kalan KODDA hiçbir tablo değeri tırnaklı sabit olmamalı:
    // dizi, Map, nesne ya da başka biçim — hangi kopya biçimi olursa olsun yakalanır.
    const kod = kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    for (const [, ad] of TABLO) {
      expect(kod, `kancada tablo değeri kopyası: ${ad}`).not.toMatch(new RegExp(`['"\`]${ad}['"\`]`))
    }
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
