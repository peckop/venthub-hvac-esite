/**
 * Karar 71c · üretici ↔ bizim veri fark tablosu. Ağa ve DB'ye ÇIKMAZ: sahte dizin + sahte ürün
 * verisi geçici dizine yazılır.
 *
 * Kilitlenenler:
 *   1. Üretici değeri farklıysa hüküm "üretici", aynıysa "aynı"; kod boşluğu fark sayılmaz.
 *   2. Bizde karşılaştırılacak değer yoksa satır UYDURULMAZ (AVenS listesi yoksa debi satırı yok).
 *   3. Girdi yoksa ÖLÇÜLEMEDİ (2) — boş tablo "fark yok" gibi görünmez.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const BETIK = join(__dirname, '..', 'uretici-fark-tablosu.mjs')
let kok = ''

const AVENS = 'ticaret/avensair-fiyat-listesi-2026/01-input/avens_fiyat_listesi_2026_HQ.pdf'
const CASALS = 'venthub/markalar/avens/santrifuj-nimus-nimax/01-input/www.casals.com__Casals_catalogue__flipbook__200.txt'
const casalsMetni = 'Code * Model NX314290 NIMAX 314 T2 1,5kW 2865 5,83 3,14 1,50 5.500 60 36,89 1 ' +
  'NX3542100 NIMAX 354 T2 3kW 2880 10,3 5,92 3 7.870 64 50,47 1'
const sayfa = (dosya: string, metin: string, tablo: string[][] = []) =>
  JSON.stringify({ dosya, sayfa: 1, metin, tablo: tablo.length ? [{ satirlar: tablo }] : [], pdf_hash: 'x' })

const yaz = (ad: string, dizinSatirlari: string[]) => {
  const d = join(kok, ad)
  writeFileSync(`${d}.jsonl`, dizinSatirlari.join('\n') + '\n')
  return `${d}.jsonl`
}
const kos = (dizin: string, veri: string | null) => spawnSync(process.execPath,
  [BETIK, '--dizin', dizin, ...(veri ? ['--veri', veri] : []), '--cikti', join(kok, 'fark.csv')], { encoding: 'utf8' })

beforeAll(() => {
  kok = mkdtempSync(join(tmpdir(), 'fark-'))
  writeFileSync(join(kok, 'urunler.json'), JSON.stringify([
    { sku: 'AVE-NX313290', name: 'NIMAX 314 T2 1,5kW', deleted_at: null, technical_specs: {} },
    { sku: 'AVE-NX353290', name: 'NIMAX 354 T2 3kW', deleted_at: null, technical_specs: {} },
  ]))
})
afterAll(() => rmSync(kok, { recursive: true, force: true }))

const avensTablo = [
  ['NX313290', 'NIMAX 314 T2 1,5kW', '5240 m³/h', '1818'],
  ['NX 3542100', 'NIMAX 354 T2 3kW', '7870 m³/h', '2173'],
]

describe('üretici fark tablosu', () => {
  it('farklı debi → "üretici", aynı debi → "aynı", koddaki boşluk fark değil', () => {
    const r = kos(yaz('iyi', [sayfa(CASALS, casalsMetni), sayfa(AVENS, '', avensTablo)]), join(kok, 'urunler.json'))
    expect(r.status, r.stderr).toBe(0)
    const csv = readFileSync(join(kok, 'fark.csv'), 'utf8')
    const satir = (sku: string, alan: string) => csv.split('\n').find(l => l.startsWith(`${sku};`) && l.includes(`;${alan};`)) ?? ''
    expect(satir('AVE-NX313290', 'en yüksek debi')).toMatch(/;5240;.*;5500;.*;üretici;/)
    expect(satir('AVE-NX353290', 'en yüksek debi')).toMatch(/;aynı;/)
    expect(satir('AVE-NX313290', 'üretici kodu')).toMatch(/;belirsiz;/)
    expect(satir('AVE-NX353290', 'üretici kodu')).toMatch(/;aynı;/)
    // ana depo PUBLIC: AVenS fiyat hücresi (1818, 2173) alıntıya sızmaz
    expect(csv).not.toMatch(/1818|2173/)
  })

  it('bizim değer yoksa satır uydurulmaz, özet "bizde yok" sayar', () => {
    const r = kos(yaz('bos', [sayfa(CASALS, casalsMetni)]), join(kok, 'urunler.json'))
    expect(r.status, r.stderr).toBe(0)
    expect(r.stdout).toMatch(/bizde karşılaştırılacak değer yok 0/)
    // ad kW'ı her zaman var → motor gücü satırları yine çıkar, debi satırı ÇIKMAZ
    expect(readFileSync(join(kok, 'fark.csv'), 'utf8')).not.toMatch(/en yüksek debi/)
  })

  it('rapor TÜM ürünleri marka → aile altında listeler; karşılaştırılamayanın NEDENİ yazılır; bayt-eşit', () => {
    const veri = join(kok, 'rapor-urunler.json')
    writeFileSync(veri, JSON.stringify([
      { sku: 'AVE-NX313290', name: 'NIMAX 314 T2 1,5kW', brand: 'AVenS', family_slug: 'avens-nimax', deleted_at: null, technical_specs: {} },
      { sku: 'AVE-1200', name: 'AVENS 40x20', brand: 'AVenS', family_slug: 'avens-dikdortgen-kanal-radyal', deleted_at: null, technical_specs: null },
      { sku: 'VRT-1', name: 'Vortice Punto', brand: 'Vortice', family_slug: 'vortice-punto', deleted_at: null, technical_specs: null },
    ]))
    const dizin = yaz('rapor', [sayfa(CASALS, casalsMetni), sayfa(AVENS, '', avensTablo)])
    const kosR = (ad: string) => spawnSync(process.execPath, [BETIK, '--dizin', dizin, '--veri', veri,
      '--rapor', join(kok, ad), '--tarih', '2026-01-01'], { encoding: 'utf8' })
    expect(kosR('r1.md').status).toBe(0)
    expect(kosR('r2.md').status).toBe(0)
    const r = readFileSync(join(kok, 'r1.md'), 'utf8')
    expect(r).toBe(readFileSync(join(kok, 'r2.md'), 'utf8'))
    expect(r.indexOf('## AVenS')).toBeLessThan(r.indexOf('## Vortice'))
    expect(r).toMatch(/### avens-nimax — 1 ürün[\s\S]*\| en yüksek debi \| 5240 m³\/h \| 5500 m³\/h \|.*\*\*üretici\*\*/)
    expect(r).toMatch(/web'de föy yok — AVenS'ten istendi \(1\): AVE-1200/)
    expect(r).toMatch(/belgesi henüz okunmadı \(1\): VRT-1/)
    expect(r).toMatch(/\| Katalogdaki ürün \| 3 \|/)
    expect(r).not.toMatch(/1818/)
  })

  it('girdi yoksa ÖLÇÜLEMEDİ (2)', () => {
    expect(kos(join(kok, 'yok.jsonl'), join(kok, 'urunler.json')).status).toBe(2)
    expect(kos(yaz('x', [sayfa(CASALS, casalsMetni)]), null).status).toBe(2)
  })
})
