// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-KAYIT-BOYUTU-1..3 · İstem satırında konuşma dosyasının boyutu (ARC-82, 2026-10-11).
 *
 * Ölçülen vaka: konuşma dosyası (`<sid>.jsonl`) compact'a rağmen küçülmez; 2026-10-10'da en büyükleri
 * 2129 MB (OPS), 2043 MB, 773 MB. Büyüdükçe dosyayı okuyan kancalar ve pencere yavaşlıyor. Bu testler
 * üç şeyi sabitler: (1) boyuta göre satırın biçimi ve eşik sınırları, (2) boyutun dosya AÇILMADAN
 * (statSync) ve yalnız gerçek dosya için ölçülmesi, (3) eşik ayarının bozuk değerde varsayılana
 * dönmesi ve istem satırı kancasının bu bloğu çağırması.
 */

interface Baglam {
  kayitBoyutuMb: (yol?: string | null) => number | null
  kayitSatiri: (boyMb: unknown) => string | null
  KAYIT_UYARI_MB: number
  KAYIT_DEVRET_MB: number
}

const KOK = process.cwd()
const KANCA = path.resolve(KOK, '.claude', 'hooks', 'baglam-doluluk.cjs')
const req = createRequire(import.meta.url)
const bd = req(KANCA) as Baglam

let kok: string
beforeAll(() => {
  kok = fs.mkdtempSync(path.join(os.tmpdir(), 'kayit-boyutu-'))
})
afterAll(() => {
  fs.rmSync(kok, { recursive: true, force: true })
})

describe('INV-KAYIT-BOYUTU-1: boyuta göre istem satırı', () => {
  it('ölçülemeyen girdide susar (null)', () => {
    for (const x of [undefined, null, Number.NaN, -1, Number.POSITIVE_INFINITY, '12', {}]) {
      expect(bd.kayitSatiri(x)).toBeNull()
    }
  })

  it('eşik altında düz KAYIT satırı: uyarı simgesi yok, MB aşağı yuvarlanır', () => {
    expect(bd.kayitSatiri(0)).toBe('KAYIT: <1 MB')
    expect(bd.kayitSatiri(0.4)).toBe('KAYIT: <1 MB')
    expect(bd.kayitSatiri(612.7)).toBe('KAYIT: 612 MB')
    // 1023,9 MB "1024 MB" görünmemeli: uyarı eşiği 1024'tür, satır eşiğin altında kalmalı.
    expect(bd.kayitSatiri(1023.9)).toBe('KAYIT: 1023 MB')
  })

  it('sınır değerler: 1 GB ⚠, 1,5 GB ⛔ yeni oturuma devret', () => {
    expect(bd.kayitSatiri(1024)).toMatch(/^⚠KAYIT: 1,0 GB — /)
    // 1535 MB "1,5 GB" görünmemeli (devret eşiğinin altında); aşağı yuvarlama 1,4 der.
    expect(bd.kayitSatiri(1535)).toMatch(/^⚠KAYIT: 1,4 GB — /)
    expect(bd.kayitSatiri(1536)).toMatch(/^⛔KAYIT: 1,5 GB — yeni oturuma DEVRET/)
    // 10-10 ölçümündeki en büyük dosya (OPS, 2129 MB).
    expect(bd.kayitSatiri(2129)).toMatch(/^⛔KAYIT: 2,0 GB — yeni oturuma DEVRET/)
  })

  it('⚠ satırı devret eşiğini söyler; satır tek satırdır ve ASCII metin taşır (kod sayfası güvenli)', () => {
    const uyari = bd.kayitSatiri(1100) ?? ''
    expect(uyari).toMatch(/1,5 GB'ta yeni oturuma devret/)
    for (const s of [uyari, bd.kayitSatiri(1700) ?? '', bd.kayitSatiri(5) ?? '']) {
      expect(s).not.toMatch(/\n/)
      // ⚠ ve ⛔ başlangıç simgesi dışında ASCII: Türkçe harf yok (mevcut BAGLAM/KILIT satırlarıyla aynı kural).
      expect(s.replace(/^[⚠⛔]/u, '')).toMatch(/^[\x20-\x7E—]*$/)
    }
  })
})

describe('INV-KAYIT-BOYUTU-2: boyut dosya AÇILMADAN, yalnız gerçek dosya için ölçülür', () => {
  it('gerçek dosyanın boyutunu MB olarak verir', () => {
    const yol = path.join(kok, 'uc-mb.jsonl')
    fs.writeFileSync(yol, Buffer.alloc(3 * 1024 * 1024, 97))
    expect(bd.kayitBoyutuMb(yol)).toBeCloseTo(3, 6)
  })

  it('yol yoksa, boşsa ya da klasörse null (satır susar, hata vermez)', () => {
    expect(bd.kayitBoyutuMb(path.join(kok, 'yok.jsonl'))).toBeNull()
    expect(bd.kayitBoyutuMb('')).toBeNull()
    expect(bd.kayitBoyutuMb(undefined)).toBeNull()
    expect(bd.kayitBoyutuMb(null)).toBeNull()
    expect(bd.kayitBoyutuMb(kok)).toBeNull()
  })

  it('ölçüm yalnız statSync: dosya açılmaz, okunmaz (2 GB dosyada istem başına maliyet yok)', () => {
    const govde = bd.kayitBoyutuMb.toString()
    expect(govde).toMatch(/statSync/)
    expect(govde).not.toMatch(/readFile|readSync|openSync|createReadStream|\.read\(/)
  })
})

describe('INV-KAYIT-BOYUTU-3: eşik ayarı ve istem satırı kancası', () => {
  const esikler = (env: Record<string, string>): string => {
    // Verilmeyen değişken TANIMSIZ kalır (boş dize değil): Number('') = 0 başka bir yolu sınar.
    const temiz: NodeJS.ProcessEnv = { ...process.env }
    delete temiz.VENTHUB_KAYIT_UYARI_MB
    delete temiz.VENTHUB_KAYIT_DEVRET_MB
    const r = spawnSync(
      process.execPath,
      ['-e', 'const m=require(' + JSON.stringify(KANCA) + ');process.stdout.write(m.KAYIT_UYARI_MB+" "+m.KAYIT_DEVRET_MB)'],
      { encoding: 'utf8', env: { ...temiz, ...env } },
    )
    expect(r.status).toBe(0)
    return r.stdout.trim()
  }

  it('ayar yoksa varsayılan 1024 ve 1536 MB', () => {
    expect(esikler({})).toBe('1024 1536')
  })

  it('geçerli ortam ayarı uygulanır', () => {
    expect(esikler({ VENTHUB_KAYIT_UYARI_MB: '10', VENTHUB_KAYIT_DEVRET_MB: '20' })).toBe('10 20')
  })

  it('bozuk değer (sayı değil, ≤0) varsayılana döner: NaN eşik satırı sessizce öldürmez', () => {
    expect(esikler({ VENTHUB_KAYIT_UYARI_MB: 'abc', VENTHUB_KAYIT_DEVRET_MB: '-5' })).toBe('1024 1536')
    // Boş dize Number() ile 0 olur; 0 eşik her dosyayı ⛔ yapardı.
    expect(esikler({ VENTHUB_KAYIT_UYARI_MB: '', VENTHUB_KAYIT_DEVRET_MB: '' })).toBe('1024 1536')
  })

  it('tek başına sıfır eşik varsayılana döner: "0 MB" her dosyayı ⚠ yapmaz', () => {
    // Sıra denetimi tek başına yetmez: uyarı 0, devret varsayılan (1536) tutarlı görünür; ≤0 ayrıca süzülür.
    expect(esikler({ VENTHUB_KAYIT_UYARI_MB: '0' })).toBe('1024 1536')
  })

  it('sırası ters ayar (devret ≤ uyarı) ikisini de varsayılana döndürür', () => {
    expect(esikler({ VENTHUB_KAYIT_UYARI_MB: '2000', VENTHUB_KAYIT_DEVRET_MB: '1000' })).toBe('1024 1536')
  })

  it('istem satırı kancası KAYIT bloğunu çağırır ve pencerenin kendi transcript_path\'ini verir', () => {
    const kaynak = fs.readFileSync(path.resolve(KOK, '.claude', 'hooks', 'defter-tazelik-satiri.cjs'), 'utf8')
    expect(kaynak).toMatch(/require\(path\.join\(__dirname, 'baglam-doluluk\.cjs'\)\)/)
    // Satır gerçekten yazılır (başka blokların aynı kalıbı bu bloğun yerine geçmez: dizi tek parça aranır)...
    expect(kaynak).toMatch(
      /kayitSatiri\(\s*bd\.kayitBoyutuMb\(girdi\.transcript_path\)\s*\)\s*\n\s*if \(s\) process\.stdout\.write\(s \+ '\\n'\)/,
    )
    // ...ve ölçüm hatası sessiz geçmez.
    expect(kaynak).toMatch(/'⚠KAYIT: OLCULEMEDI \('/)
  })
})
