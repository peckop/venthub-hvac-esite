/**
 * REC-146 · toplu sunum, karar 70 kipi. Ağa/DB'ye çıkmaz: sahte kaynak dizini + taslaklar geçici dizinde.
 *
 * Kilitlenenler:
 *   1. Sunum ve yük AYNI kayıtlardan: tablodaki EN/TR = yükteki kimlik_en/kimlik_tr (referanssız).
 *   2. en kipinde TR tabloya "onaylı, değişmiyor" diye girer, yüke TR yazılmaz.
 *   3. Jeton kapısı KIRMIZI aile tabloya girmez ama yükte kapı alanıyla kalır (yazıcı durdurur).
 *   4. Taslak eksikse ÖNKOŞUL — sunum üretilmez.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync, readFileSync, mkdirSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const BETIK = join(__dirname, '..', 'toplu-sunum.py')
const PY = process.platform === 'win32' ? 'python' : 'python3'
let kok = ''
let taslak = ''

const AVENS = 'ticaret/avensair-fiyat-listesi-2026/01-input/avens_fiyat_listesi_2026_HQ.pdf'
const HARITA = '<!-- KAYNAK-HARITASI: AVenS=avens_fiyat_listesi_2026_HQ.pdf -->\n'

beforeAll(() => {
  kok = mkdtempSync(join(tmpdir(), 'k70-'))
  writeFileSync(join(kok, 'sayfalar.jsonl'), JSON.stringify({
    dosya: AVENS, sayfa: 27, pdf_hash: 'x', metin: 'HIZ ANAHTARI MAKS. AKIM',
    tablo: [{ satirlar: [['60006', 'AVenS 2,5 A HIZ ANAHTARI', '2.5 A']] }],
  }) + '\n')
  writeFileSync(join(kok, 'manifest.json'), JSON.stringify({ sayfa_sayisi: 1 }))
  taslak = join(kok, 'taslak')
  mkdirSync(taslak)
  writeFileSync(join(taslak, 'plan.json'), JSON.stringify([
    { slug: 'seat-serisi', kip: 'en', urun: 40 },
    { slug: 'avens-hiz-anahtarlari', kip: 'b', urun: 2, not: 'canlıda olgu hatası' },
    { slug: 'storm-serisi', kip: 'en', urun: 19 },
  ]))
  writeFileSync(join(taslak, 'seat-serisi.tr.md'), '### Kimlik cümlesi\n> IP55 korumalı, trifaze 380V çatı fanı ailesi.\n')
  writeFileSync(join(taslak, 'seat-serisi.en.md'), '### Kimlik cümlesi\n> Roof fan family with IP 55 protection, three-phase 380 V.\n')
  writeFileSync(join(taslak, 'avens-hiz-anahtarlari.tr.md'), HARITA + '### Kimlik cümlesi\n> En fazla 2,5 A akım taşıyan hız anahtarı. [AVenS s.27]\n')
  writeFileSync(join(taslak, 'avens-hiz-anahtarlari.en.md'), '### Kimlik cümlesi\n> Speed switch carrying up to 2.5 A. [AVenS s.27]\n')
  writeFileSync(join(taslak, 'storm-serisi.tr.md'), '### Kimlik cümlesi\n> IP54 korumalı çatı fanı.\n')
  writeFileSync(join(taslak, 'storm-serisi.en.md'), '### Kimlik cümlesi\n> Roof fan with IP55 protection.\n') // uydurma jeton
})
afterAll(() => rmSync(kok, { recursive: true, force: true }))

const kos = (...ek: string[]) => spawnSync(PY, [BETIK, '--k70', taslak, ...ek],
  { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', VENTHUB_KAYNAK_DIZINI: join(kok, 'sayfalar.jsonl') } })

describe('toplu sunum — karar 70 kipi', () => {
  it('sunum ve yük aynı kayıtlardan; kırmızı aile tabloda yok, yükte kapı alanıyla var', () => {
    const r = kos('--sunum', join(kok, 's.md'), '--yuk', join(kok, 'yuk.json'), '--tarih', '2026-01-01')
    expect(r.status, r.stdout + r.stderr).toBe(1) // storm kırmızı → çıkış 1
    const s = readFileSync(join(kok, 's.md'), 'utf8')
    const yuk = JSON.parse(readFileSync(join(kok, 'yuk.json'), 'utf8'))
    const hiz = yuk.find((y: { slug: string }) => y.slug === 'avens-hiz-anahtarlari')
    expect(hiz.kimlik_tr).toBe('En fazla 2,5 A akım taşıyan hız anahtarı.')
    expect(hiz.kimlik_en).toBe('Speed switch carrying up to 2.5 A.')
    expect(s).toContain(hiz.kimlik_tr)
    expect(s).toContain(hiz.kimlik_en)
    expect(s).not.toMatch(/\[AVenS s\.27\]\s*\|/)
    const seat = yuk.find((y: { slug: string }) => y.slug === 'seat-serisi')
    expect(seat.kimlik_tr).toBeUndefined()
    expect(s).toMatch(/`seat-serisi` \| 40 \| \*\(onaylı, değişmiyor\)\*/)
    const storm = yuk.find((y: { slug: string }) => y.slug === 'storm-serisi')
    expect(storm.kapi.en_kirmizi).toBe(1)
    expect(s).not.toMatch(/\| `storm-serisi` \|/)
    expect(s).toMatch(/`storm-serisi` — .*FAZLA.*IP55/)
    expect(hiz.kapi).toEqual({ dusen: 0, en_kirmizi: 0 })
  })

  it('taslak eksikse ÖNKOŞUL, sunum üretilmez', () => {
    unlinkSync(join(taslak, 'storm-serisi.en.md'))
    const r = kos('--sunum', join(kok, 's2.md'))
    expect(r.status).not.toBe(0)
    expect(r.stdout + r.stderr).toMatch(/ONKOSUL/)
  })
})
