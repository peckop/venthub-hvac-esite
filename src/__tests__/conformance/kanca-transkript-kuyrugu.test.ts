import { constants as bufferSabitleri } from 'node:buffer'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-KANCA-KUYRUK-1..3 · Tur sonu kancaları konuşma kaydını BÜTÜN okumaz (ARC-83, 2026-10-10).
 *
 * ÖLÇÜLMÜŞ KUSUR: OPS penceresinde `son-soz-gate` ve `kartsiz-beklenti-kapisi` konuşma kaydını
 * `fs.readFileSync(tp, 'utf8')` ile baştan sona okuyordu. Kayıt 1,78 GB'a ulaşınca Node dizge
 * sınırını (~512 MB) aştı ve kanca çöktü: 9 Ekim'de 508 koşunun 504'ü çöktü, iki kapı o pencerede
 * hiç çalışmadı (Recep'in "son söz bana" ve "kartsız istek" kuralları sessizce kapalıydı).
 *
 * ⭐Sınama gerçek sınırı aşan bir kayıtla yapılır: Node'un `MAX_STRING_LENGTH` değerinden büyük,
 * seyrek (sparse) bir dosya + sonuna gerçek kayıtlar. Eski kod bu dosyada ERR_STRING_TOO_LONG ile
 * düşer; yeni kod yalnız kuyruğu okur ve doğru kararı verir.
 *
 * Cetvel: `execution-method-standard.md` §9.7 (okunamayan girdi: bloklama, ölçemediğini söyle) ·
 * `.claude/hooks/transkript-kuyrugu.cjs` başlık yorumu (kural).
 */

const KANCALAR = path.resolve(__dirname, '../../../.claude/hooks')
const SON_SOZ = path.join(KANCALAR, 'son-soz-gate.cjs')
const KARTSIZ = path.join(KANCALAR, 'kartsiz-beklenti-kapisi.cjs')
const require_ = createRequire(import.meta.url)
const { kuyrukSatirlari } = require_(path.join(KANCALAR, 'transkript-kuyrugu.cjs')) as {
  kuyrukSatirlari: (yol: string, maxBayt?: number, maxSatir?: number) => string[]
}

let dizin = ''
beforeAll(() => {
  dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kuyruk-'))
})
afterAll(() => {
  fs.rmSync(dizin, { recursive: true, force: true })
})

const yaz = (ad: string, icerik: string) => {
  const yol = path.join(dizin, ad)
  fs.writeFileSync(yol, icerik, 'utf8')
  return yol
}

describe('INV-KANCA-KUYRUK-1: yardımcı kuyruğu okur, satır bütünlüğünü korur', () => {
  it('küçük dosya: bütün satırlar sırasıyla gelir, boş satırlar atılır', () => {
    const yol = yaz('kucuk.jsonl', 'a\n\nb\n  \nc\n')
    expect(kuyrukSatirlari(yol)).toEqual(['a', 'b', 'c'])
  })

  it('en çok maxSatir satır döner ve bunlar SONDAKİ satırlardır', () => {
    const yol = yaz('cok.jsonl', Array.from({ length: 1000 }, (_, i) => `s${i}`).join('\n') + '\n')
    const r = kuyrukSatirlari(yol, undefined, 400)
    expect(r).toHaveLength(400)
    expect(r[0]).toBe('s600')
    expect(r[399]).toBe('s999')
  })

  it('pencere satır ortasından başlarsa yarım ilk satır atılır; dönen her satır özgün satırdır', () => {
    // Türkçe harfler 2 bayttır: pencere sınırı harfin ortasına da denk gelebilir.
    const satirlar = Array.from({ length: 2000 }, (_, i) => JSON.stringify({ i, metin: 'şğüöçıİ'.repeat(6) }))
    const yol = yaz('ortadan.jsonl', satirlar.join('\n') + '\n')
    for (const pencere of [1000, 4093, 8191, 12345]) {
      const r = kuyrukSatirlari(yol, pencere, 5000)
      expect(r.length, 'pencere ' + pencere).toBeGreaterThan(0)
      expect(r.length, 'pencere ' + pencere).toBeLessThan(2000)
      for (const s of r) expect(() => JSON.parse(s), 'bozuk satır, pencere ' + pencere).not.toThrow()
      expect(r[r.length - 1], 'son satır').toBe(satirlar[satirlar.length - 1])
      expect(satirlar.slice(-r.length), 'bitişik kuyruk').toEqual(r)
    }
  })

  it('tek satır pencereden büyükse pencere büyür (dev araç çıktısı / görüntü kaydı)', () => {
    const buyuk = JSON.stringify({ type: 'user', message: { content: 'x'.repeat(40_000) } })
    const yol = yaz('buyuk-satir.jsonl', 'kucuk-ilk\n' + buyuk + '\n')
    const r = kuyrukSatirlari(yol, 1024)
    expect(r.length, 'dev satır döndürülmedi').toBeGreaterThan(0)
    expect(r[r.length - 1]).toBe(buyuk)
  })

  it('boş dosya [] döner; olmayan dosya fırlatır (çağıran yakalar, fail-open ama sessiz değil)', () => {
    expect(kuyrukSatirlari(yaz('bos.jsonl', ''))).toEqual([])
    expect(() => kuyrukSatirlari(path.join(dizin, 'yok.jsonl'))).toThrow(/ENOENT/)
  })
})

// ---- süreç düzeyi: dizge sınırını aşan gerçek kayıt ----

const DEV_BOY = bufferSabitleri.MAX_STRING_LENGTH + 8 * 1024 * 1024
let devYol = ''

/** Seyrek önek korunur; kuyruk her vakada yeniden yazılır (8 MB'lık dev dosya her vaka için kurulmaz). */
function devKayitYaz(kayitlar: object[]) {
  fs.truncateSync(devYol, DEV_BOY)
  fs.appendFileSync(devYol, '\n' + kayitlar.map((k) => JSON.stringify(k)).join('\n') + '\n', 'utf8')
}

const insan = (metin: string) => ({ type: 'user', message: { content: metin } })
const asistanMetin = (metin: string) => ({ type: 'assistant', message: { content: [{ type: 'text', text: metin }] } })
const asistanArac = () => ({
  type: 'assistant',
  message: { content: [{ type: 'text', text: 'bakiyorum' }, { type: 'tool_use', name: 'Bash', input: {} }] },
})
const UZUN = 'Is bitti: olcum yapildi, kapilar yesil ve sonucu buraya yaziyorum ki cevap gorunur olsun.'

describe('INV-KANCA-KUYRUK-2: dizge sınırını aşan kayıtta iki kanca ÇÖKMEZ, doğru kararı verir', () => {
  beforeAll(() => {
    devYol = path.join(dizin, 'dev-oturum.jsonl')
    fs.closeSync(fs.openSync(devYol, 'w'))
    fs.truncateSync(devYol, DEV_BOY)
  }, 120_000)

  const calistir = (kanca: string, ek: Record<string, string> = {}, oturum = 'kuyruk-' + process.pid) =>
    spawnSync(process.execPath, [kanca], {
      input: JSON.stringify({ transcript_path: devYol, session_id: oturum }),
      encoding: 'utf8',
      timeout: 60_000,
      env: {
        ...process.env,
        KARTSIZ_KAPI_KANBAN: path.join(dizin, 'yok-boyle-betik.cjs'),
        KARTSIZ_KAPI_DURUM_DIZINI: path.join(dizin, 'mod-durum'),
        ...ek,
      },
    })

  it('önkoşul: dosya Node dizge sınırından büyük (eski kod bunu okuyamazdı)', () => {
    expect(fs.statSync(devYol).size).toBeGreaterThan(bufferSabitleri.MAX_STRING_LENGTH)
  })

  it('son-soz-gate: araçla biten tur BLOKLANIR (exit 2), metinle biten tur geçer (exit 0)', () => {
    devKayitYaz([insan('durum ne'), asistanArac()])
    const blok = calistir(SON_SOZ)
    expect(blok.stderr, 'kanca çöktü').not.toMatch(/ERR_STRING_TOO_LONG|Cannot create a string/)
    expect(blok.status, 'araçla biten tur bloklanmadı: ' + blok.stderr).toBe(2)
    expect(blok.stderr).toContain('SON SÖZ')

    devKayitYaz([insan('durum ne'), asistanMetin(UZUN)])
    const gec = calistir(SON_SOZ)
    expect(gec.stderr, 'kanca çöktü').not.toMatch(/ERR_STRING_TOO_LONG|Cannot create a string/)
    expect(gec.status).toBe(0)
  }, 120_000)

  it('kartsiz-beklenti-kapisi: kartsız istek BLOKLANIR (exit 2), kalıpsız mesaj geçer (exit 0)', () => {
    const oturum = 'kuyruk-kartsiz-' + process.pid
    devKayitYaz([insan('devam'), asistanMetin('Tamam.\n\n**Senden beklenenler**\n\n- Design penceresine bak\n')])
    const blok = calistir(KARTSIZ, {}, oturum)
    expect(blok.stderr, 'kanca çöktü').not.toMatch(/ERR_STRING_TOO_LONG|Cannot create a string/)
    expect(blok.status, 'kartsız istek bloklanmadı: ' + blok.stderr).toBe(2)
    expect(blok.stderr).toContain('KARTSIZ')

    devKayitYaz([insan('devam'), asistanMetin('Bitti, hepsi yeşil, ayrıntı kartta.')])
    const gec = calistir(KARTSIZ, {}, oturum + '-b')
    expect(gec.stderr, 'kanca çöktü').not.toMatch(/ERR_STRING_TOO_LONG|Cannot create a string/)
    expect(gec.status).toBe(0)

    for (const o of [oturum, oturum + '-b'])
      fs.rmSync(path.join(os.tmpdir(), 'kartsiz-kapi-gorulen-' + o.replace(/[^A-Za-z0-9-]/g, '').slice(0, 40) + '.json'), { force: true })
  }, 120_000)

  it('okunamayan kayıt (EACCES) turu bloklamaz, kanca çökmez ve sebebi SÖYLER (fail-open ama sessiz değil)', () => {
    // Windows'ta izin bozmak güvenilmez: ön yüklemeyle yalnız bu dosya için openSync EACCES fırlatır.
    const okunamaz = path.join(dizin, 'okunamaz.jsonl')
    fs.writeFileSync(okunamaz, JSON.stringify(insan('x')) + '\n', 'utf8')
    const onYukleme = path.join(dizin, 'engelle.cjs')
    fs.writeFileSync(
      onYukleme,
      [
        "const fs = require('fs')",
        'const gercek = fs.openSync',
        'fs.openSync = function (p, ...r) {',
        "  if (String(p).endsWith('okunamaz.jsonl')) { const e = new Error('EACCES: permission denied'); e.code = 'EACCES'; throw e }",
        '  return gercek.call(this, p, ...r)',
        '}',
      ].join('\n'),
    )
    for (const kanca of [SON_SOZ, KARTSIZ]) {
      const r = spawnSync(process.execPath, ['--require', onYukleme, kanca], {
        input: JSON.stringify({ transcript_path: okunamaz, session_id: 'kuyruk-eacces-' + process.pid }),
        encoding: 'utf8',
        timeout: 30_000,
        env: { ...process.env, KARTSIZ_KAPI_KANBAN: path.join(dizin, 'yok-boyle-betik.cjs'), KARTSIZ_KAPI_DURUM_DIZINI: path.join(dizin, 'mod-durum') },
      })
      expect(r.status, path.basename(kanca) + ': ' + r.stderr).toBe(0)
      expect(r.stderr, path.basename(kanca) + ' sebebi söylemiyor').toContain('transkript okunamadi (EACCES)')
    }
  })
})

describe('INV-KANCA-KUYRUK-3: konuşma kaydını bütün okuyan kanca kalmaz (yapısal)', () => {
  const kancaDosyalari = fs
    .readdirSync(KANCALAR)
    .filter((f) => f.endsWith('.cjs'))
    .map((f) => path.join(KANCALAR, f))

  it('iki kanca ortak kuyruk okuyucuyu kullanır', () => {
    for (const k of [SON_SOZ, KARTSIZ]) {
      const kaynak = fs.readFileSync(k, 'utf8')
      expect(kaynak, path.basename(k)).toContain("require('./transkript-kuyrugu.cjs')")
      expect(kaynak, path.basename(k)).toContain('kuyrukSatirlari(')
    }
  })

  it('hiçbir kanca transkript yolunu readFileSync ile bütün okumaz', () => {
    const kalip = /readFileSync\(\s*(?:tp|transcript_path|transcriptPath|transcript|kayitYolu|input\.transcript_path|girdi\.transcript_path)\b/
    // Yorum satırları taranmaz: yardımcının başlık yorumu eski kusuru kelimesi kelimesine anlatır.
    const yorumSatiri = /^\s*(?:\/\/|\*|\/\*)/
    const koduOku = (f: string) =>
      fs
        .readFileSync(f, 'utf8')
        .split('\n')
        .filter((l) => !yorumSatiri.test(l))
        .join('\n')
    const ihlal = kancaDosyalari.filter((f) => kalip.test(koduOku(f))).map((f) => path.basename(f))
    expect(ihlal, 'konuşma kaydını bütün okuyan kanca: ' + ihlal.join(', ')).toEqual([])
  })
})
