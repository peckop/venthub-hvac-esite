/**
 * INV-SON-KONUSMA-1 — compact'te Recep'in son mesajları özetsiz korunur (Ops 09-28).
 *
 * Kanca: .claude/hooks/son-konusma-dokumu.cjs (PreCompact) + session-board.cjs (SessionStart compact).
 * Satır biçimleri bu oturumun gerçek kaydından ölçüldü: pencere mesajı `isMeta` kullanıcı satırı,
 * iş sürerken yazılan Recep mesajı `queued_command` eki, compact sonrası kopya satırlar.
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks')

interface Tur {
  recep: string
  zaman: string
  cevap: string
}
interface Dokum {
  sirSuz: (s: string) => string
  turlar: (satirlar: unknown[]) => Tur[]
  dokumUret: (yol: string, simdi?: Date) => string
  enjeksiyon: (memoryDir: string, sid: string, sinir?: number) => string | null
  dosyaYolu: (memoryDir: string, sid: string) => string
  RECEP_SAYI: number
  CEVAP_SAYI: number
}
const dk = gerek(path.join(KANCA, 'son-konusma-dokumu.cjs')) as Dokum

const recep = (t: string, ts: string) => ({ type: 'user', timestamp: ts, message: { content: [{ type: 'text', text: t }] } })
const cevap = (t: string, id: string) => ({ type: 'assistant', message: { id, content: [{ type: 'text', text: t }] } })

describe('INV-SON-KONUSMA-1 · tur ayrıştırma', () => {
  it('Recep mesajı + turun SON metni; tool_result, sistem önekleri ve yan ajan sayılmaz', () => {
    const t = dk.turlar([
      recep('merhaba', 't1'),
      cevap('ara metin', 'a1'),
      { type: 'user', message: { content: [{ type: 'tool_result', content: 'x' }] } },
      cevap('son cevap', 'a2'),
      { ...recep('yan ajan', 't2'), isSidechain: true },
      { type: 'user', message: { content: '<command-name>/compact</command-name>' } },
    ])
    expect(t).toEqual([{ recep: 'merhaba', zaman: 't1', cevap: 'son cevap' }])
  })

  it('pencere mesajı (isMeta) ve bildirim turu KAPATIR; sonraki cevap Recep sorusuna yazılmaz', () => {
    const t = dk.turlar([
      recep('kapatıp açmaya ne oldu?', 't1'),
      cevap('Karıştırdım.', 'a1'),
      { type: 'user', isMeta: true, message: { content: 'Another Claude session sent a message:\n<cross-session-message>…' } },
      cevap('Ops mesajının cevabı', 'a2'),
      { type: 'user', message: { content: '<task-notification>…' } },
      cevap('bildirimin cevabı', 'a3'),
    ])
    expect(t).toHaveLength(1)
    expect(t[0].cevap).toBe('Karıştırdım.')
  })

  it('iş sürerken yazılan Recep mesajı (queued_command prompt) turdur; pencere mesajı eki değildir', () => {
    const t = dk.turlar([
      { type: 'attachment', timestamp: 't1', attachment: { type: 'queued_command', commandMode: 'prompt', prompt: 'araya yazdım' } },
      cevap('cevabım', 'a1'),
      { type: 'attachment', attachment: { type: 'queued_command', commandMode: 'prompt', prompt: '<cross-session-message from="x">' } },
      cevap('pencereye cevap', 'a2'),
      { type: 'attachment', attachment: { type: 'queued_command', commandMode: 'task-notification', prompt: 'x' } },
    ])
    expect(t.map((x) => [x.recep, x.cevap])).toEqual([['araya yazdım', 'cevabım']])
  })

  it('compact sonrası kopya satırlar (aynı saat+metin, aynı mesaj kimliği) tur çoğaltmaz, cevabı ezmez', () => {
    const t = dk.turlar([recep('soru', 't1'), cevap('cevap', 'a1'), recep('soru', 't1'), cevap('cevap', 'a1')])
    expect(t).toEqual([{ recep: 'soru', zaman: 't1', cevap: 'cevap' }])
  })

  it('<system-reminder> blokları Recep metninden silinir', () => {
    const t = dk.turlar([recep('<system-reminder>gizli</system-reminder>asıl soru', 't1')])
    expect(t[0].recep).toBe('asıl soru')
  })
})

describe('INV-SON-KONUSMA-1 · döküm ve enjeksiyon', () => {
  function kayit(satirlar: unknown[]): string {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'son-konusma-'))
    const y = path.join(d, 'kayit.jsonl')
    fs.writeFileSync(y, satirlar.map((s) => JSON.stringify(s)).join('\n') + '\n')
    return y
  }

  it('son 30 Recep mesajı, cevap yalnız son 5 turda', () => {
    const satir: unknown[] = []
    for (let i = 0; i < 40; i++) satir.push(recep('mesaj-' + i, 't' + i), cevap('cevap-' + i, 'a' + i))
    const s = dk.dokumUret(kayit(satir), new Date('2026-09-28T10:00:00Z'))
    expect((s.match(/^### Recep/gm) || []).length).toBe(dk.RECEP_SAYI)
    expect((s.match(/^#### Cevap/gm) || []).length).toBe(dk.CEVAP_SAYI)
    expect(s).not.toContain('mesaj-9\n')
    expect(s).toContain('mesaj-10\n')
    expect(s).not.toContain('cevap-34')
    expect(s).toContain('cevap-35')
  })

  it('sır süzgeci: bilinen anahtar biçimleri ve ANAHTAR=değer kalıbı', () => {
    const s = dk.sirSuz(
      'gh: ghp_' + 'a'.repeat(30) + ' · nv: nvapi-' + 'b'.repeat(30) + ' · LINEAR_API_KEY=lin_api_' + 'c'.repeat(30) + ' · parola: kısa',
    )
    expect(s).not.toMatch(/ghp_a|nvapi-b|lin_api_c/)
    expect(s).toContain('[SIR-SUZULDU]')
    expect(s).toContain('parola: kısa') // anahtar biçimi olmayan düz metin dokunulmaz
  })

  it('enjeksiyon üst sınırı: EN YENİ kısım kalır, eski kısım kesilir, başlık korunur', () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'son-konusma-mem-'))
    const govde = '# başlık\nyazildi: x\n' + 'ESKİ\n'.repeat(5_000) + 'EN-YENİ-SATIR\n'
    fs.writeFileSync(dk.dosyaYolu(d, 'sid1'), govde)
    const e = dk.enjeksiyon(d, 'sid1', 2_000) as string
    expect(e.length).toBeLessThanOrEqual(2_000)
    expect(e.startsWith('# başlık')).toBe(true)
    expect(e).toContain('eski kısım kesildi')
    expect(e.trimEnd().endsWith('EN-YENİ-SATIR')).toBe(true)
    expect(dk.enjeksiyon(d, 'yok', 2_000)).toBeNull()
  })

  it('kanca PreCompact\'a kayıtlı ve açılış kancası dökümü enjekte ediyor', () => {
    const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8'))
    const komutlar = (ayar.hooks.PreCompact as Array<{ hooks: Array<{ command: string }> }>).flatMap((g) => g.hooks.map((h) => h.command))
    expect(komutlar.some((c) => c.includes('son-konusma-dokumu.cjs'))).toBe(true)
    const board = fs.readFileSync(path.join(KANCA, 'session-board.cjs'), 'utf8')
    expect(board).toContain("require(path.join(__dirname, 'son-konusma-dokumu.cjs'))")
    expect(board).toContain('SON KONUSMA (ozetsiz')
  })
})
