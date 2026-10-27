import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync,rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

/**
 * ARC-220 (karar 420): açılış satırları pencere başına YALNIZ DURUM DEĞİŞİNCE basılır.
 * Eşikler değişmez; bozuk kayıt, kimliksiz koşu ve compact dönüşü HEPSİNİ basar (fail-open).
 */
const req = createRequire(import.meta.url)
const { suz } = req('../../../.claude/hooks/uyari-susturma.cjs') as {
  suz: (m: string, sid: string, pano: string, simdi?: number, ad?: string) => string
}
const SID = '11111111-2222-3333-4444-555555555555'
const gecici: string[] = []
const pano = () => {
  const d = mkdtempSync(join(tmpdir(), 'uyari-susturma-'))
  gecici.push(d)
  return d
}
afterEach(() => {
  for (const d of gecici.splice(0)) rmSync(d, { recursive: true, force: true })
})

const ILK = 'BAGIMLILIK: son tarama 11 gun · high 1\nTABAN: taban 2026-10-26 (1 gun) · sonrasinda migration yok\nBAGLAM: 180k/1M\n⚠BELGE: CLAUDE.md 18 gun (vekil)\n'

describe('açılış satırı susturma', () => {
  it('ilk mesaj hepsini basar, aynı durum ikinci mesajda susar', () => {
    const p = pano()
    expect(suz(ILK, SID, p)).toBe(ILK)
    expect(suz(ILK, SID, p)).toBe('')
  })

  it('oynak miktar (gün, MB, bağlam, sayaç) yeni durum sayılmaz', () => {
    const p = pano()
    suz(ILK + 'SAGE-YAZIM: son 7 gun 9 yeni kayit · ops 7 · ⚠ 0 kayit: arac\n', SID, p)
    const sonraki = ILK.replace('11 gun', '12 gun').replace('180k', '199k').replace('18 gun', '19 gun') + 'SAGE-YAZIM: son 7 gun 10 yeni kayit · ops 8 · ⚠ 0 kayit: arac\n'
    expect(suz(sonraki, SID, p)).toBe('')
  })

  it('anlamlı değişiklik basılır: high sayısı, ⚠ işareti, yeni migration', () => {
    const p = pano()
    suz(ILK, SID, p)
    const degisti = ILK.replace('high 1', 'high 3').replace('migration yok', 'SONRASINDA 2 migration').replace('⚠BELGE', 'BELGE')
    const cikti = suz(degisti, SID, p)
    expect(cikti).toContain('high 3')
    expect(cikti).toContain('SONRASINDA 2 migration')
    expect(cikti).toContain('BELGE: CLAUDE.md')
    expect(cikti).not.toContain('BAGLAM')
  })

  it('durum düzelip yeniden bozulunca tekrar konuşur', () => {
    const p = pano()
    suz(ILK, SID, p)
    suz(ILK.replace('⚠BELGE: CLAUDE.md 18 gun (vekil)\n', ''), SID, p)
    expect(suz(ILK, SID, p)).toContain('⚠BELGE')
  })

  it('devam satırı (ONARIM) ana satırıyla birlikte gelir', () => {
    const p = pano()
    const m = '⚠TABAN: taban 2026-10-01 · SONRASINDA 1 migration\n  ONARIM: tetikle\n'
    expect(suz(m, SID, p)).toBe(m)
    expect(suz(m, SID, p)).toBe('')
  })

  it('pencereler birbirinden bağımsızdır', () => {
    const p = pano()
    suz(ILK, SID, p)
    expect(suz(ILK, '99999999-2222-3333-4444-555555555555', p)).toBe(ILK)
  })

  it('kancalar ayrı kayıt adıyla yazar: biri ötekinin satırını geri getirmez', () => {
    const p = pano()
    const pano1 = 'PANO: katalog=5afcab26 (2 desen, 750dk) ⚠BAYAT 750dk atış yok, bırakılmadı\nYÖNTEM: emirde YÖNTEM: satırı\n'
    suz(ILK, SID, p)
    suz(pano1, SID, p, Date.now(), 'brief')
    expect(suz(ILK, SID, p)).toBe('')
    expect(suz(pano1.replace('750dk', '763dk').replace('750dk', '763dk'), SID, p, Date.now(), 'brief')).toBe('')
  })

  it('compact dönüşü ("compact sonrasi") hepsini yeniden basar', () => {
    const p = pano()
    suz(ILK, SID, p)
    const don = ILK.replace('BAGLAM: 180k/1M', 'BAGLAM: 20k/1M · compact sonrasi — olcum ilk cevaptan sonra')
    expect(suz(don, SID, p)).toBe(don)
  })

  it('6 saat sonra kayıt yenilenir', () => {
    const p = pano()
    const t = 1_700_000_000_000
    suz(ILK, SID, p, t)
    expect(suz(ILK, SID, p, t + 3600_000)).toBe('')
    expect(suz(ILK, SID, p, t + 7 * 3600_000)).toBe(ILK)
  })

  // ── sabotaj kolları: süzme asla satırı sessizce yutmamalı ──
  it('SABOTAJ: bozuk kayıt dosyası → hepsi basılır', () => {
    const p = pano()
    suz(ILK, SID, p)
    const dosya = readdirSync(p).find((a) => a.startsWith('.uyari-gosterildi.'))!
    writeFileSync(join(p, dosya), '{bozuk')
    expect(suz(ILK, SID, p)).toBe(ILK)
  })

  it('SABOTAJ: oturum kimliği yok → süzme yapılmaz', () => {
    const p = pano()
    expect(suz(ILK, '', p)).toBe(ILK)
    expect(suz(ILK, '', p)).toBe(ILK)
  })

  it('SABOTAJ: kayıt klasörü yazılamaz → satırlar yine basılır', () => {
    const p = pano()
    const dosyaYolu = join(p, 'dosya')
    writeFileSync(dosyaYolu, 'x')
    expect(suz(ILK, SID, join(dosyaYolu, 'alt'))).toBe(ILK)
  })
})

describe('kanca bütünleşmesi', () => {
  it('sage-yazim-sayaci ikinci koşuda aynı durumu bastırır, defter-tazelik süzmeyi bozmadan çıkar', () => {
    const p = pano()
    mkdirSync(p, { recursive: true })
    const kok = join(__dirname, '..', '..', '..')
    const kos = () =>
      spawnSync(process.execPath, [join(kok, '.claude', 'hooks', 'defter-tazelik-satiri.cjs')], {
        input: JSON.stringify({ session_id: SID }),
        encoding: 'utf8',
        env: { ...process.env, VENTHUB_BOARD_DIR: p },
        timeout: 20000,
      })
    const bir = kos()
    const iki = kos()
    expect(bir.status).toBe(0)
    expect(bir.stdout).toContain('BAGIMLILIK')
    expect(iki.status).toBe(0)
    expect(iki.stdout).not.toContain('BAGIMLILIK')
    expect(iki.stdout.length).toBeLessThan(bir.stdout.length)
  })
})
