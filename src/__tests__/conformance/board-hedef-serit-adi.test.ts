import { execFileSync, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

import { describe, expect, it, vi } from 'vitest'

/**
 * AĞIR-SINIF ZAMAN AŞIMI EŞİĞİ — 60 sn (global varsayılan 20 sn).
 * Gerekçe: `docs/standards/fleet-mechanism-standard.md` §13. Bu dosya 8+ `board.cjs`
 * alt süreci doğurur.
 */
vi.setConfig({ testTimeout: 60_000 })

/**
 * INV-BOARD-9 · Teslimat notu alıcının ŞERİT ADINI basar — "sid çözüldü" ≠ "doğru alıcı".
 *
 * ÖLÇÜLMÜŞ VAKA (2026-08-30/31, **üç kez, 24 saat içinde**). Çıktı şöyleydi:
 *   `not bırakıldı → oturum ac03ce11 (kısaltmadan çözüldü)`
 * Bu satırın doğruladığı TEK şey *"bu sid'i çözdüm"*dür. *"Bu sid OPS'tur"* kısmını
 * GÖNDEREN varsaydı; araç onu hiç doğrulamadı. Üç kez yanlış şeride not düştü:
 *   1. bir iş emrinin (REC-95) sıralama talebi — OPS'a hiç ulaşmadı,
 *   2. "bu adres URUN penceresiyse" diye başlayan bir not — ALTYAPI'ya düştü,
 *   3. bir **prod migration GO'su** — yine ALTYAPI'ya düştü.
 * Üçünde de araç `exit 0` verdi ve *"not bırakıldı"* yazdı. **Başarılı teslimat, DOĞRU
 * ALICI kanıtı değildir.** (Aynı aile: `exit 0` + "talep alındı" derken `--globs`'un
 * düşmesi · `is_active=true`'yu görünürlük sanmak · `"status":"SUCCESS"` + `Başarısız: 1`.)
 *
 * ÇÖZÜM UCUZ: hedefi basarken ŞERİDİ de bas. Gönderen "OPS bekliyordum, ALTYAPI yazıyor"
 * diye **gönderim anında** görür — okuyanın fark etmesini beklemeden.
 *
 * ⚠ KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: üç çözüm yolu (tam sid · kısaltma · şerit adı) AYRI
 * kod dallarıdır; birinde şerit basılıp ötekinde basılmaması tam da bu depoda ölçülmüş
 * "süzgeç iki yerde" sınıfıdır. Son kol (gerileme) eski biçimin geri gelmesini yakalar.
 */

const require = createRequire(import.meta.url)
const BOARD = require.resolve('../../../scripts/board/board.cjs')

/** Kimlik taşıyan HER değişken elenir — fikstür kimliği ELİNDE TUTMALI (2026-08-28 dersi). */
const KIMLIK_DEGISKENLERI = new Set(['CLAUDE_SESSION_ID', 'CLAUDE_CODE_SESSION_ID'])

function tmpRoot(): string {
  const raw =
    process.env.RUNNER_TEMP || process.env.TMPDIR || process.env.TEMP || process.env.TMP || '/tmp'
  return raw.replace(/\\/g, '/').replace(/\/$/, '')
}

let sayac = 0
function panoDizini(): string {
  sayac += 1
  return `${tmpRoot()}/board-hedef-${Date.now()}-${Math.random().toString(36).slice(2)}-${sayac}`
}

function kos(pano: string, args: string[]): { kod: number; out: string; err: string } {
  const ciftler = Object.entries(process.env).filter(([ad]) => !KIMLIK_DEGISKENLERI.has(ad))
  ciftler.push(['VENTHUB_BOARD_DIR', pano])
  const env = Object.fromEntries(ciftler) as typeof process.env
  const r = spawnSync(process.execPath, [BOARD, ...args], { encoding: 'utf8', env })
  return { kod: typeof r.status === 'number' ? r.status : -1, out: r.stdout ?? '', err: r.stderr ?? '' }
}

const OPS = 'sinav-ops-111'
const ALTYAPI = 'sinav-altyapi-222'

/** İki şeritli izole pano kurar. */
function kur(): string {
  const pano = panoDizini()
  kos(pano, ['claim', '--sid', OPS, '--lane', 'OPS', '--globs', 'docs/**'])
  kos(pano, ['claim', '--sid', ALTYAPI, '--lane', 'ALTYAPI', '--globs', 'scripts/**'])
  return pano
}

describe('INV-BOARD-9 · teslimat notu alicinin SERIT ADINI basar', () => {
  it('ON KOSUL: board.cjs bu ortamda gercekten kosuyor (olculemedi != gecti)', () => {
    const r = execFileSync(process.execPath, [BOARD], { encoding: 'utf8' })
    expect(r, 'kullanim ciktisi yok — asagidaki kollar bosluk olcerdi').toMatch(/kullanım|kullanim/)
  })

  it('TAM SID ile verilen hedefte serit adi BASILIR', () => {
    const pano = kur()
    const r = kos(pano, ['note', '--sid', OPS, '--to', ALTYAPI, '--text', 'sinav'])
    expect(r.kod, `not basarisiz:\n${r.err}`).toBe(0)
    expect(r.out, 'serit adi basilmadi — gonderen kime yazdigini GORMUYOR').toContain('ALTYAPI')
  })

  it('KISALTMA ile verilen hedefte serit adi BASILIR (asil vakanin bicimi)', () => {
    const pano = kur()
    const r = kos(pano, ['note', '--sid', OPS, '--to', 'sinav-alt', '--text', 'sinav'])
    expect(r.kod).toBe(0)
    expect(r.out).toContain('ALTYAPI')
    expect(r.out, 'kisaltmadan cozuldugu bilgisi de kalmali — iki bilgi birbirinin yerine gecmez')
      .toMatch(/kısaltmadan çözüldü/)
  })

  it('SERIT ADI ile verilen hedefte de serit adi BASILIR', () => {
    const pano = kur()
    const r = kos(pano, ['note', '--sid', OPS, '--to', 'ALTYAPI', '--text', 'sinav'])
    expect(r.kod).toBe(0)
    expect(r.out).toContain('ALTYAPI')
  })

  it('SERIDI BILINMEYEN hedefte SESSIZ KALINMAZ — "serit?" basilir', () => {
    const pano = kur()
    // Claim'i olmayan bir oturum: once bir not yazsin ki pano onu TANISIN.
    kos(pano, ['note', '--sid', 'claimsiz-oturum-333', '--to', OPS, '--text', 'tanis'])

    const r = kos(pano, ['note', '--sid', OPS, '--to', 'claimsiz-oturum-333', '--text', 'sinav'])
    expect(r.kod).toBe(0)
    expect(
      r.out,
      'serit bilinmiyorken SESSIZ gecildi — "bilmiyorum" ile "boyle bir serit yok" ayirt ' +
        'edilemez hale gelir; bu depoda defalarca olculmus ariza bicimi',
    ).toContain('şerit?')
  })

  it('⭐GERILEME KOLU: basarili hedef ciktisi ASLA cipiplak "oturum <8hane>" olamaz', () => {
    const pano = kur()
    const ciktilar = [
      kos(pano, ['note', '--sid', OPS, '--to', ALTYAPI, '--text', 'a']).out,
      kos(pano, ['note', '--sid', OPS, '--to', 'sinav-alt', '--text', 'b']).out,
      kos(pano, ['note', '--sid', OPS, '--to', 'ALTYAPI', '--text', 'c']).out,
    ]
    for (const out of ciktilar) {
      // Eski bicim: `not bırakıldı → oturum sinav-al ...` — serit adi YOK.
      expect(
        out,
        'ESKI BICIM GERI GELDI: hedef yalnizca "oturum <8hane>" olarak basiliyor. Bu biçim ' +
          'gonderene kime yazdigini SOYLEMEZ ve uc kez yanlis sesride nota yol acti (§17).',
      ).not.toMatch(/→\s*oturum\s/)
      // Her basarili ciktida ya gercek serit adi ya acik "serit?" isareti olmali.
      expect(out, 'ne serit adi ne "serit?" isareti var — hedef kimligi olcusuz').toMatch(
        /(ALTYAPI|şerit\?)/,
      )
    }
  })
})
