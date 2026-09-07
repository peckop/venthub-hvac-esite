// @vitest-environment node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SOGUK-OKUYUCU — `.claude/hooks/soguk-okuyucu-sinavi.cjs`
 *
 * NİÇİN VAR: 2026-09-06'da Recep ölçtü — "aldığın notları geriye dönük okuduğunda kendin bile
 * anlamıyorsun". Aynı gün iki vaka: bir kısaltma defterde "yapıldı"ya döndü, bir envanter
 * belgesinden ne yapıldığı çıkarılamadı (40 dk kayıp). Çare mekanik: notu bağlamsız bir ajan
 * okuyup NE/DURUM/KANIT/KİMDE söyleyemiyorsa not GEÇMEZ.
 *
 * ⭐KAPININ İKİ İŞİ VAR ve ikincisi daha kolay kaçar:
 *   1. Doğru yüzeyde ÖTMELİ (compact dilim ANLAM'ı + gün kapanışı).
 *   2. Diğer her yazmada SUSMALI — OPS hükmü 2026-09-07. Her yazmada öten kanca üç günde
 *      görmezden gelinir ve o andan sonra VAR ama YOK sayılır.
 * ⛔ÜÇÜNCÜ İŞ, BİR ŞEYİN OLMADIĞINI ölçer: kanca modeli/alt-ajanı KENDİ ÇAĞIRMAZ.
 */

const KOK = process.cwd()
const KANCA = path.join(KOK, '.claude', 'hooks', 'soguk-okuyucu-sinavi.cjs')

/** Bugünün dersi (üç kez tekrarlandı): metin tarayan kapı ÖNCE yorumları çıkarır. */
function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function pano(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'inv-soguk-'))
}

function kostur(
  dosyaIcerigi: string | null,
  opts: { arac?: string; ad?: string; panoDizini?: string; env?: Record<string, string>; yol?: string } = {},
): string {
  const p = opts.panoDizini ?? pano()
  let yol = opts.yol ?? ''
  if (!yol) {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-soguk-not-'))
    yol = path.join(d, opts.ad ?? 'not.md')
    if (dosyaIcerigi !== null) fs.writeFileSync(yol, dosyaIcerigi, 'utf8')
  }
  const cikti = execFileSync(process.execPath, [KANCA], {
    input: JSON.stringify({
      session_id: 'aaaaaaaa-1111-4111-8111-111111111111',
      tool_name: opts.arac ?? 'Edit',
      tool_input: { file_path: yol },
    }),
    encoding: 'utf8',
    env: { ...process.env, VENTHUB_BOARD_DIR: p, ...(opts.env ?? {}) },
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  if (!cikti.trim()) return ''
  const j = JSON.parse(cikti) as { hookSpecificOutput?: { additionalContext?: string } }
  return j.hookSpecificOutput?.additionalContext ?? ''
}

const GUN_SONU = '# gun\n\n## GUN SONU 5 SATIR\nBITTI: x\n'
const DILIM = '# kayit\n\n## COMPACT DILIMI 1\n\n### ANLAM\nne oldu, nicin\n'
const DUZ_NOT = '# not\n\nsiradan bir hafiza notu; hicbir kayit yuzeyi yok\n'

describe('INV-SOGUK-OKUYUCU: not SINANIR, sinavi kanca KOSMAZ', () => {
  it('kanca dosyası VAR (kapı kör koşmasın)', () => {
    expect(fs.existsSync(KANCA)).toBe(true)
  })

  it('GÜN KAPANIŞI notunda öter ve DÖRT ALANI söyler', () => {
    const c = kostur(GUN_SONU)
    expect(c, 'gün kapanışı notunda sessiz kaldı').toContain('SOĞUK OKUYUCU SINAVI')
    for (const alan of ['NE', 'DURUM', 'KANIT', 'KIMDE']) {
      expect(c, `sınav ölçütünde "${alan}" alanı yok — ölçütsüz sınav geçer not üretir`).toContain(alan)
    }
    expect(c, '"çıkaramadım" izni yok — alt-ajan boşluğu TAHMİNLE doldurur').toMatch(/cikaramadim/i)
  })

  it('COMPACT DİLİMİ ANLAM kısmında öter', () => {
    expect(kostur(DILIM)).toContain('SOĞUK OKUYUCU SINAVI')
  })

  it('⛔SIRADAN NOTTA SUSAR (OPS hükmü: her nota DEĞİL)', () => {
    expect(kostur(DUZ_NOT), 'her notta öten kanca üç günde görmezden gelinir').toBe('')
  })

  it('okuma aracında SUSAR', () => {
    expect(kostur(GUN_SONU, { arac: 'Read' })).toBe('')
  })

  it('md olmayan dosyada SUSAR', () => {
    expect(kostur(GUN_SONU, { ad: 'not.ts' })).toBe('')
  })

  it('AYNI DOSYA ikinci kez SUSAR (bir kayıt 5-10 kez düzenlenir)', () => {
    const p = pano()
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-soguk-tekrar-'))
    const yol = path.join(d, 'gun.md')
    fs.writeFileSync(yol, GUN_SONU, 'utf8')
    expect(kostur(null, { panoDizini: p, yol }), 'ilk yazmada ötmedi').toContain('SOĞUK OKUYUCU')
    expect(kostur(null, { panoDizini: p, yol }), 'aynı dosyada tekrar öttü').toBe('')
  })

  it('⭐AYIRT EDER: farklı dizinlerde AYNI ADLI iki not, ikisi de sınanır', () => {
    // Ölçüt basename olsaydı ikinci şeridin notu SESSİZCE muaf kalırdı.
    const p = pano()
    const a = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-soguk-a-'))
    const b = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-soguk-b-'))
    for (const d of [a, b]) fs.writeFileSync(path.join(d, 'state.md'), GUN_SONU, 'utf8')
    expect(kostur(null, { panoDizini: p, yol: path.join(a, 'state.md') })).toContain('SOĞUK OKUYUCU')
    expect(
      kostur(null, { panoDizini: p, yol: path.join(b, 'state.md') }),
      'aynı adlı ikinci not sessizce muaf tutuldu — ayırt etmeyen ölçüt ölçüm değildir',
    ).toContain('SOĞUK OKUYUCU')
  })

  it('GÜNLÜK ÜST SINIR uygulanır (OPS: 6)', () => {
    const p = pano()
    const yap = (ad: string) => {
      const d = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-soguk-sinir-'))
      const y = path.join(d, ad)
      fs.writeFileSync(y, GUN_SONU, 'utf8')
      return y
    }
    const env = { VENTHUB_SOGUK_SINIR: '1' }
    expect(kostur(null, { panoDizini: p, yol: yap('bir.md'), env })).toContain('SOĞUK OKUYUCU')
    expect(kostur(null, { panoDizini: p, yol: yap('iki.md'), env }), 'üst sınır aşıldığı hâlde öttü').toBe('')
    expect(fs.readFileSync(KANCA, 'utf8'), 'varsayılan sınır 6 değil — OPS emri kodda yok').toMatch(
      /VENTHUB_SOGUK_SINIR\s*\|\|\s*6/,
    )
  })

  it('MSYS yolu (/c/...) Windows yoluna çevrilir — sessizlik "yüzey yok" gibi okunmasın', () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-soguk-msys-'))
    const win = path.join(d, 'gun.md').replace(/\\/g, '/')
    fs.writeFileSync(win, GUN_SONU, 'utf8')
    const msys = win.replace(/^([A-Za-z]):\//, (_m, h: string) => '/' + h.toLowerCase() + '/')
    expect(kostur(null, { yol: msys }), 'MSYS yolunda okuyamayıp sessiz kaldı (fail-open yüz)').toContain('SOĞUK OKUYUCU')
  })

  it('⛔KANCA SINAVI KENDİ KOŞMAZ: kaynakta model/alt-ajan çağrısı yok', () => {
    const kaynak = yorumsuz(fs.readFileSync(KANCA, 'utf8'))
    for (const yasak of ['execFileSync', 'execSync', 'spawn', 'fetch(', 'http']) {
      expect(kaynak.includes(yasak), `kanca ${yasak} kullanıyor — her yazmaya gecikme ve jeton biner`).toBe(false)
    }
  })

  it('MODEL AÇIKÇA YAZILI (boş model = Fable = pahalı; Recep 2026-09-06)', () => {
    const c = kostur(GUN_SONU)
    expect(c, 'model söylenmemiş — model boş bırakılırsa pahalı modele düşer').toContain('sonnet')
  })

  it('TURU BLOKLAMAZ: daima çıkış 0', () => {
    // execFileSync sıfırdan farklı çıkışta fırlatır; buraya varmak kanıttır.
    expect(() => kostur(DUZ_NOT)).not.toThrow()
    expect(() => kostur(GUN_SONU)).not.toThrow()
  })
})
