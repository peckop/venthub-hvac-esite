/**
 * INV-SON-KONUSMA-1 — compact'te Recep'in son mesajları özetsiz korunur (Ops 09-28).
 *
 * Kanca: .claude/hooks/son-konusma-dokumu.cjs (PreCompact) + session-board.cjs (SessionStart compact).
 * Satır biçimleri bu oturumun gerçek kaydından ölçüldü: pencere mesajı `isMeta` kullanıcı satırı,
 * iş sürerken yazılan Recep mesajı `queued_command` eki, compact sonrası kopya satırlar.
 */
import { spawnSync } from 'node:child_process'
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
  dokumUret: (yol: string, simdi?: Date, kaynak?: string) => string
  enjeksiyon: (memoryDir: string, sid: string, sinir?: number) => string | null
  dosyaYolu: (memoryDir: string, sid: string) => string
  dokumGerekli: (kayitYolu: string, hedef: string) => boolean
  eskiDokumleriSil: (memoryDir: string, sid: string, simdi?: number) => void
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

  it('kanca PreCompact VE Stop\'a kayıtlı, açılış kancası dökümü enjekte ediyor', () => {
    // Stop kaydı: 09-29'da iki gerçek compact'te PreCompact tek başına dosya yazmadı (JEV yolu).
    const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8'))
    type Grup = Array<{ hooks: Array<{ command: string }> }>
    const komutlar = (olay: string) => (ayar.hooks[olay] as Grup).flatMap((g) => g.hooks.map((h) => h.command))
    expect(komutlar('PreCompact').some((c) => c.includes('son-konusma-dokumu.cjs'))).toBe(true)
    expect(komutlar('Stop').some((c) => c.includes('son-konusma-dokumu.cjs'))).toBe(true)
    const board = fs.readFileSync(path.join(KANCA, 'session-board.cjs'), 'utf8')
    expect(board).toContain("require(path.join(__dirname, 'son-konusma-dokumu.cjs'))")
    expect(board).toContain('SON KONUSMA (ozetsiz')
  })
})

describe('INV-SON-KONUSMA-1 · Stop ve PreCompact olayları', () => {
  const SID = 'sid-deneme-0001'

  /** Gerçek proje düzeni: `<proje>/<sid>.jsonl` + `<proje>/memory/`. */
  function proje() {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'son-konusma-proje-'))
    fs.mkdirSync(path.join(d, 'memory'))
    const kayit = path.join(d, SID + '.jsonl')
    fs.writeFileSync(kayit, [recep('ilk soru', '2026-09-29T07:00:00Z'), cevap('ilk cevap', 'm1')].map((s) => JSON.stringify(s)).join('\n') + '\n')
    return { memory: path.join(d, 'memory'), kayit }
  }
  function kos(kayit: string, olay: string) {
    // Girdi JSON'u kabuktan değil doğrudan stdin'den verilir (ters eğik çizgiler bozulmasın).
    return spawnSync('node', [path.join(KANCA, 'son-konusma-dokumu.cjs')], {
      input: JSON.stringify({ session_id: SID, transcript_path: kayit, hook_event_name: olay }),
      encoding: 'utf8',
    })
  }
  const zamanla = (yol: string, sn: number) => fs.utimesSync(yol, sn, sn)

  it('Stop: sessizce yazar, kaynak Stop; dosya kayıttan yeniyse dokunmaz, kayıt ilerleyince yeniler', () => {
    const { memory, kayit } = proje()
    const hedef = dk.dosyaYolu(memory, SID)
    zamanla(kayit, 1_000)

    let r = kos(kayit, 'Stop')
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('') // Stop her cevapta koşar, gürültü çıkarmaz
    const ilk = fs.readFileSync(hedef, 'utf8')
    expect(ilk).toContain('kaynak Stop')
    expect(ilk).toContain('ilk soru')
    expect(ilk).toContain('ilk cevap')
    expect(fs.existsSync(path.join(memory, `son-konusma-${SID}.yaz.md`))).toBe(false) // geçici dosya kalmaz

    // Dosya kayıttan yeni: ikinci Stop yeniden yazmaz (mtime sabit kalır).
    zamanla(hedef, 2_000)
    r = kos(kayit, 'Stop')
    expect(fs.statSync(hedef).mtimeMs).toBe(2_000_000)

    // Kayıt ilerledi (yeni cevap): Stop dökümü yeniler ve son cevap içeride.
    fs.appendFileSync(kayit, JSON.stringify(recep('ikinci soru', '2026-09-29T07:05:00Z')) + '\n' + JSON.stringify(cevap('SON-CEVAP', 'm2')) + '\n')
    zamanla(kayit, 3_000)
    kos(kayit, 'Stop')
    const son = fs.readFileSync(hedef, 'utf8')
    expect(son).toContain('ikinci soru')
    expect(son).toContain('SON-CEVAP')
  })

  it('PreCompact: her koşulda yazar ve tek satır bildirir; kayıt yoksa nedenini söyler', () => {
    const { memory, kayit } = proje()
    const hedef = dk.dosyaYolu(memory, SID)
    zamanla(kayit, 1_000)
    // Dosya kayıttan YENİ olsa bile PreCompact yeniden yazar (compact anında en taze hâl).
    fs.writeFileSync(hedef, 'eski')
    zamanla(hedef, 9_000)
    const r = kos(kayit, 'PreCompact')
    expect(r.stdout).toContain('[son-konusma] dokum yazildi')
    expect(fs.readFileSync(hedef, 'utf8')).toContain('kaynak PreCompact')

    const yok = kos(path.join(memory, 'yok.jsonl'), 'PreCompact')
    expect(yok.stdout).toContain('kayit yolu yok')
    expect(yok.status).toBe(0)
  })

  it('dokumGerekli: dosya yok ya da kayıttan eskiyse true', () => {
    const { memory, kayit } = proje()
    const hedef = dk.dosyaYolu(memory, SID)
    zamanla(kayit, 5_000)
    expect(dk.dokumGerekli(kayit, hedef)).toBe(true)
    fs.writeFileSync(hedef, 'x')
    zamanla(hedef, 4_000)
    expect(dk.dokumGerekli(kayit, hedef)).toBe(true)
    zamanla(hedef, 6_000)
    expect(dk.dokumGerekli(kayit, hedef)).toBe(false)
  })

  it('eskiDokumleriSil: yalnız 14 günden eski BAŞKA oturum dökümü silinir', () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'son-konusma-sil-'))
    const simdi = Date.now()
    const gun = 86_400_000
    const yaz = (ad: string, yasGun: number) => {
      const y = path.join(d, ad)
      fs.writeFileSync(y, 'x')
      const t = (simdi - yasGun * gun) / 1000
      fs.utimesSync(y, t, t)
      return y
    }
    const eskiBaska = yaz('son-konusma-baska-eski.md', 20)
    const yeniBaska = yaz('son-konusma-baska-yeni.md', 3)
    const eskiKendi = yaz(`son-konusma-${SID}.md`, 20)
    const ilgisiz = yaz('ops-cycle-audit-state.md', 20)
    dk.eskiDokumleriSil(d, SID, simdi)
    expect(fs.existsSync(eskiBaska)).toBe(false)
    expect(fs.existsSync(yeniBaska)).toBe(true)
    expect(fs.existsSync(eskiKendi)).toBe(true) // kendi dosyasını silmez
    expect(fs.existsSync(ilgisiz)).toBe(true) // döküm olmayan dosyaya dokunmaz
  })
})
