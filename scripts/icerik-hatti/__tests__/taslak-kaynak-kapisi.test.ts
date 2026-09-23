/**
 * REC-146 · taslak kaynak kapısı — kaynak dizininden okur, PDF AÇMAZ (§6.3). Ağa/DB'ye çıkmaz:
 * sahte `sayfalar.jsonl` + `manifest.json` + taslak geçici dizine yazılır.
 *
 * Kilitlenenler:
 *   1. Sayfa metni dizinden gelir; kaynakta olan jeton YEŞİL, uydurma jeton KIRMIZI.
 *   2. Akım (2,5 A · 5 A · 300 mA) ve EN "90%" jetondur — sessizce "ölçülemeyen"e düşmez.
 *   3. Dizin yoksa ÖNKOŞUL (2); manifest'le uyuşmayan (daraltılmış) dizin hüküm üretmez.
 *   4. Betik `fitz` içe aktarmaz.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const BETIK = join(__dirname, '..', 'taslak-kaynak-kapisi.py')
const PY = process.platform === 'win32' ? 'python' : 'python3'
let kok = ''

const sayfa = (dosya: string, no: number, metin: string, tablo: string[][] = []) =>
  JSON.stringify({ dosya, sayfa: no, metin, tablo: tablo.length ? [{ satirlar: tablo }] : [], pdf_hash: 'x' })

const dizinYaz = (ad: string, satirlar: string[], manifestSayfa = satirlar.length) => {
  const d = join(kok, ad)
  writeFileSync(join(kok, `${ad}.jsonl`), satirlar.join('\n') + '\n')
  // _kaynak.taban_dogrula manifest'i dizinle AYNI klasörde arar
  writeFileSync(join(kok, 'manifest.json'), JSON.stringify({ sayfa_sayisi: manifestSayfa }))
  return `${d}.jsonl`
}
const taslakYaz = (ad: string, metin: string) => {
  const y = join(kok, ad)
  writeFileSync(y, `<!-- KAYNAK-HARITASI: AVenS=avens_fiyat_listesi_2026_HQ.pdf -->\n${metin}\n`)
  return y
}
const kos = (taslak: string, dizin: string) =>
  spawnSync(PY, [BETIK, taslak, '--dizin', dizin], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } })

const AVENS = 'ticaret/avensair-fiyat-listesi-2026/01-input/avens_fiyat_listesi_2026_HQ.pdf'

beforeAll(() => { kok = mkdtempSync(join(tmpdir(), 'kapi-')) })
afterAll(() => rmSync(kok, { recursive: true, force: true }))

describe('taslak kaynak kapısı (kaynak dizini)', () => {
  it('kaynaktaki akım jetonu YEŞİL; EN "90%" jeton sayılır', () => {
    const dizin = dizinYaz('iyi', [
      sayfa(AVENS, 27, 'HIZ ANAHTARI MAKS. AKIM', [['60006', 'AVenS 2,5 A HIZ ANAHTARI', '2.5 A'], ['01801', 'AVenS 5 A HIZ ANAHTARI', '5 A']]),
      sayfa(AVENS, 58, 'Recovers almost 90% of the thermal energy'),
    ])
    const t = taslakYaz('iyi.md', 'Hız anahtarı en fazla 2,5 A akım taşır. [AVenS s.27]\n\nIt recovers 90% of the heat. [AVenS s.58]')
    const r = kos(t, dizin)
    expect(r.status, r.stdout + r.stderr).toBe(0)
    expect(r.stdout).toMatch(/dogrulanan 2 · DUSEN 0/)
  })

  it('uydurma akım ve uydurma yüzde KIRMIZI (sessiz atlama yok)', () => {
    const dizin = dizinYaz('iyi2', [
      sayfa(AVENS, 27, 'HIZ ANAHTARI', [['60006', 'AVenS 2,5 A HIZ ANAHTARI', '2.5 A']]),
      sayfa(AVENS, 58, 'Recovers almost 90% of the thermal energy'),
    ])
    const t = taslakYaz('uydurma.md', 'Hız anahtarı 10 A taşır. [AVenS s.27]\n\nIt recovers 95% of the heat. [AVenS s.58]')
    const r = kos(t, dizin)
    expect(r.status).toBe(1)
    expect(r.stdout).toMatch(/sayfada YOK: 10 A/)
    expect(r.stdout).toMatch(/sayfada YOK: 95%/)
  })

  it('dizin yoksa ÖNKOŞUL (2); manifest ile uyuşmayan dizin hüküm üretmez', () => {
    const t = taslakYaz('x.md', 'Hız anahtarı 2,5 A. [AVenS s.27]')
    expect(kos(t, join(kok, 'yok.jsonl')).status).toBe(2)
    const dar = dizinYaz('dar', [sayfa(AVENS, 27, '2,5 A')], 999)
    const r = kos(t, dar)
    expect(r.status).not.toBe(0)
    expect(r.stdout + r.stderr).toMatch(/EVREN EKSIK/)
  })

  it('rakamlı kısaltma ([CAS191 s.1]) referans sayılır — "ref 0" ile düşmez', () => {
    const dizin = dizinYaz('rakam', [sayfa('web/www.casals.com__Casals_catalogue__flipbook__191.txt', 1, 'IEC motor with IP-55 protection')])
    const t = join(kok, 'rakam.md')
    writeFileSync(t, '<!-- KAYNAK-HARITASI: CAS191=www.casals.com__Casals_catalogue__flipbook__191.txt -->\nIP-55 koruma sınıflı motorla çalışır. [CAS191 s.1]\n')
    const r = kos(t, dizin)
    expect(r.status, r.stdout + r.stderr).toBe(0)
    expect(r.stdout).toMatch(/dogrulanan 1 · DUSEN 0/)
  })

  it('TR binlik noktası: "25.000 m³/h" ↔ kaynak "25000m³/h" YEŞİL; kaynak ondalığı 1000 kat kaydırılamaz', () => {
    const dizin = dizinYaz('binlik', [sayfa(AVENS, 28, 'AVENS-HF/S 500 11KW 25000m³/h · yardımcı fan 1.125 kW')])
    expect(kos(taslakYaz('binlik.md', 'Ailede 25.000 m³/h debiye kadar model vardır. [AVenS s.28]'), dizin).status).toBe(0)
    expect(kos(taslakYaz('binlik2.md', 'Ailede 26.000 m³/h debiye kadar model vardır. [AVenS s.28]'), dizin).status).toBe(1)
    // kaynaktaki "1.125 kW" (ondalık) taslaktaki "1125 kW" ile eşleşmemeli
    const r = kos(taslakYaz('binlik3.md', 'Yardımcı fan 1125 kW. [AVenS s.28]'), dizin)
    expect(r.status, r.stdout).toBe(1)
  })

  it('betik PDF açmaz (fitz içe aktarılmaz)', () => {
    expect(readFileSync(BETIK, 'utf8')).not.toMatch(/^\s*import fitz|^\s*from fitz/m)
  })
})
