import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

/**
 * INV-KANCA-DUZELTME-1 · düzeltme algılayıcı (ARC-202, HRT-68).
 *
 * Ölçülmüş kusur: Recep'in "dersler alınmıyor mu" sorusunun gününde OPS'un iki tekrar vakasının dersi
 * sage'de hiç yoktu. Üç söz kilitlenir: (1) kalıp Recep'in KENDİ düzeltme/tekrar cümlesini yakalar,
 * nötr "yine/hala/dedim" cümlelerini, sistem zarflarını ve otomatik inceleme istemlerini YAKALAMAZ;
 * (2) turda işaretten sonra audience.roles DOLU bir sage remember yoksa DERS BORCU doğar ve sonraki
 * istemde görünür; (3) varsayılan kip UYARI (bloklamaz), `blok` kipi tek kez bloklar, vana susturur.
 *
 * Canlı panoya dokunulmaz: her vaka kendi geçici panosunu kurar (VENTHUB_BOARD_DIR).
 */

const req = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KALIP = req(path.join(KOK, 'scripts/hijyen/duzeltme-kalibi.cjs')) as {
  duzeltmeMi: (m: unknown) => { eslesti: boolean; kaliplar: string[] }
}
const BORC = req(path.join(KOK, 'scripts/hijyen/duzeltme-borcu.cjs')) as {
  dersYazanCagri: (j: unknown) => boolean
  dersYazildiMi: (s: string[], ms: number) => boolean
}
const ISARETLE = path.join(KOK, '.claude/hooks/duzeltme-isaretle.cjs')
const KAPI = path.join(KOK, '.claude/hooks/duzeltme-dersi-kapisi.cjs')

describe('INV-KANCA-DUZELTME-1 · kalıp', () => {
  const pozitif = [
    'sen hala bana cevap veremiyorsun ya',
    'neden hala karar bekleyenler bende kokpite var',
    'bunu sana 10 defalarca söyledim, hatırlamıyorsun',
    'iyi ama yine yanlış sıra seçtin',
    'sen yine yabancı oldun kokpit penceresinde',
    'neden aynı veriyi bana 2 kere yazdın',
    'bunu demiştim sana, uyarmıştım',
    'senin hafızan sürekli gittiği için hatırlamıyorsun',
    'hala çok sinirliyim ne oldu', // ASCII indirgemesi: "hala"/"sinirliyim"
    'HALA BANA VERCELDE KAZANÇTAN BAHSETMEDIN', // büyük harf + noktasız ı
  ]
  const negatif = [
    'devam et',
    'ona dedim artır paralel işleri', // çıplak "dedim" nötr
    'tamam ben esc dedim', // çıplak "dedim" nötr
    'sürekli saatler harcamasınlar diye vitest seçtik', // çıplak "sürekli" nötr
    'yine açarız pencereyi sonra', // "yine" olumsuz bağlam olmadan nötr
    'hala 11 Ekim sonrasına park, tamam', // "hala" eksiklik bildirmiyor
    'Review this change for security vulnerabilities. yine yanlış hala yok',
    'You previously flagged these candidate vulnerabilities: yine yanlış',
    '<cross-session-message from="x">hala yok yine yanlış</cross-session-message>',
    'Another Claude session sent a message: yine yanlış hala yok defalarca',
    '/compact sen yine yanlış yaptın',
    '',
  ]
  it.each(pozitif)('YAKALAR: %s', (m) => {
    expect(KALIP.duzeltmeMi(m).eslesti).toBe(true)
  })
  it.each(negatif)('YAKALAMAZ: %s', (m) => {
    expect(KALIP.duzeltmeMi(m).eslesti).toBe(false)
  })
  it('string olmayan girdi çökertmez', () => {
    expect(KALIP.duzeltmeMi(undefined).eslesti).toBe(false)
    expect(KALIP.duzeltmeMi(42).eslesti).toBe(false)
  })
})

const remember = (roles: unknown, ts: string) => ({
  type: 'assistant',
  timestamp: ts,
  message: { content: [{ type: 'tool_use', name: 'mcp__wrongstack-sage__remember', input: { text: 'ders', audience: { roles } } }] },
})

describe('INV-KANCA-DUZELTME-1 · ders yazıldı mı', () => {
  it('audience.roles DOLU remember çağrısı ders sayılır; boş/rolsüz sayılmaz', () => {
    expect(BORC.dersYazanCagri(remember(['ARAC'], '2026-10-19T10:00:00Z'))).toBe(true)
    expect(BORC.dersYazanCagri(remember([], '2026-10-19T10:00:00Z'))).toBe(false)
    expect(BORC.dersYazanCagri(remember(['  '], '2026-10-19T10:00:00Z'))).toBe(false)
    const rolsuz = remember(['ARAC'], 'x') as { message: { content: { input: Record<string, unknown> }[] } }
    delete rolsuz.message.content[0].input.audience
    expect(BORC.dersYazanCagri(rolsuz)).toBe(false)
  })
  it('Bash üzerinden wrongstack-sage remember (roles ile) ders sayılır; başka araç sayılmaz', () => {
    const bash = (command: string) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Bash', input: { command } }] } })
    expect(BORC.dersYazanCagri(bash('wrongstack-sage remember --text x --audience.roles ARAC'))).toBe(true)
    expect(BORC.dersYazanCagri(bash('wrongstack-sage remember --text x'))).toBe(false)
    expect(BORC.dersYazanCagri(bash('ls'))).toBe(false)
  })
  it('işaretten ÖNCEKİ remember ders sayılmaz, SONRAKİ sayılır', () => {
    const isaret = Date.parse('2026-10-19T10:00:00Z')
    const once = JSON.stringify(remember(['ARAC'], '2026-10-19T09:00:00Z'))
    const sonra = JSON.stringify(remember(['ARAC'], '2026-10-19T10:00:05Z'))
    expect(BORC.dersYazildiMi([once], isaret)).toBe(false)
    expect(BORC.dersYazildiMi([once, sonra], isaret)).toBe(true)
    expect(BORC.dersYazildiMi(['{bozuk remember', 'rastgele'], isaret)).toBe(false)
  })
})

function kos(betik: string, girdi: object, pano: string, env: Record<string, string> = {}) {
  return spawnSync(process.execPath, [betik], {
    encoding: 'utf8',
    input: JSON.stringify(girdi),
    env: { ...process.env, VENTHUB_BOARD_DIR: pano, ...env },
  })
}

function kayit(satirlar: object[]): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-duzeltme-kayit-'))
  const yol = path.join(d, 'oturum.jsonl')
  fs.writeFileSync(yol, satirlar.map((s) => JSON.stringify(s)).join('\n') + '\n')
  return yol
}

describe('INV-KANCA-DUZELTME-1 · kanca akışı', () => {
  it('düzeltme → işaret + bağlam satırı; ders yazılmadan tur biterse borç doğar, bloklanmaz, sonraki istemde görünür', () => {
    const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-duzeltme-pano-'))
    const sid = 'oturum-1'
    const r1 = kos(ISARETLE, { session_id: sid, prompt: 'sen yine yanlış sıra seçtin' }, pano)
    expect(r1.status).toBe(0)
    expect(r1.stdout).toContain('DUZELTME-ALGILANDI')
    expect(fs.existsSync(path.join(pano, `duzeltme-isaret-${sid}.json`))).toBe(true)

    const tp = kayit([{ type: 'assistant', timestamp: new Date().toISOString(), message: { content: [{ type: 'text', text: 'tamam' }] } }])
    const r2 = kos(KAPI, { session_id: sid, transcript_path: tp }, pano)
    expect(r2.status).toBe(0) // varsayılan kip UYARI: bloklamaz
    expect(fs.existsSync(path.join(pano, `duzeltme-borc-${sid}.json`))).toBe(true)

    const r3 = kos(ISARETLE, { session_id: sid, prompt: 'devam et' }, pano)
    expect(r3.stdout).toContain('⚠DERS-BORCU')
    fs.rmSync(pano, { recursive: true, force: true })
  })

  it('turda audience.roles dolu remember varsa borç doğmaz, işaret ve eski borç silinir', () => {
    const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-duzeltme-pano-'))
    const sid = 'oturum-2'
    kos(ISARETLE, { session_id: sid, prompt: 'sen hala yapmadın bunu' }, pano)
    const tp = kayit([remember(['ARAC'], new Date(Date.now() + 5000).toISOString())])
    const r = kos(KAPI, { session_id: sid, transcript_path: tp }, pano)
    expect(r.status).toBe(0)
    expect(fs.existsSync(path.join(pano, `duzeltme-borc-${sid}.json`))).toBe(false)
    expect(fs.existsSync(path.join(pano, `duzeltme-isaret-${sid}.json`))).toBe(false)
    const r2 = kos(ISARETLE, { session_id: sid, prompt: 'devam et' }, pano)
    expect(r2.stdout).toBe('')
    fs.rmSync(pano, { recursive: true, force: true })
  })

  it('blok kipi turu bir kez bloklar (exit 2); stop_hook_active ise bloklamaz', () => {
    const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-duzeltme-pano-'))
    const tp = kayit([{ type: 'assistant', timestamp: new Date().toISOString(), message: { content: [] } }])
    kos(ISARETLE, { session_id: 'oturum-3', prompt: 'neden aynı veriyi 2 kere yazdın' }, pano)
    const blok = kos(KAPI, { session_id: 'oturum-3', transcript_path: tp }, pano, { VENTHUB_DUZELTME_KAPISI: 'blok' })
    expect(blok.status).toBe(2)
    expect(blok.stderr).toContain('davranış dersi yazılmadı')
    kos(ISARETLE, { session_id: 'oturum-4', prompt: 'neden aynı veriyi 2 kere yazdın' }, pano)
    const donguyok = kos(KAPI, { session_id: 'oturum-4', transcript_path: tp, stop_hook_active: true }, pano, { VENTHUB_DUZELTME_KAPISI: 'blok' })
    expect(donguyok.status).toBe(0)
    fs.rmSync(pano, { recursive: true, force: true })
  })

  it('kayıt okunamazsa sessiz değil: işaret KORUNUR ve çıkış 0', () => {
    const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-duzeltme-pano-'))
    kos(ISARETLE, { session_id: 'oturum-5', prompt: 'sen yine yanlış yaptın' }, pano)
    const r = kos(KAPI, { session_id: 'oturum-5', transcript_path: path.join(pano, 'yok.jsonl') }, pano)
    expect(r.status).toBe(0)
    expect(r.stderr).toContain('ölçülemedi')
    expect(fs.existsSync(path.join(pano, 'duzeltme-isaret-oturum-5.json'))).toBe(true)
    fs.rmSync(pano, { recursive: true, force: true })
  })

  it('vana: VENTHUB_DUZELTME_KAPISI=kapali iken işaret yazılmaz, satır çıkmaz', () => {
    const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-duzeltme-pano-'))
    const r = kos(ISARETLE, { session_id: 'oturum-6', prompt: 'sen yine yanlış yaptın' }, pano, { VENTHUB_DUZELTME_KAPISI: 'kapali' })
    expect([r.status, r.stdout]).toEqual([0, ''])
    expect(fs.readdirSync(pano)).toEqual([])
    fs.rmSync(pano, { recursive: true, force: true })
  })

  it('cross-session-message işaret üretmez (yalnız Recep sayılır)', () => {
    const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-duzeltme-pano-'))
    const r = kos(ISARETLE, { session_id: 'oturum-7', prompt: '<cross-session-message>sen yine yanlış yaptın hala yok</cross-session-message>' }, pano)
    expect([r.status, r.stdout]).toEqual([0, ''])
    expect(fs.readdirSync(pano)).toEqual([])
    fs.rmSync(pano, { recursive: true, force: true })
  })
})
