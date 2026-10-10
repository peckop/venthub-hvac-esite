/**
 * INV-BELGE-DEFTER-1 — "VentHub Belgeler" NotebookLM defteri tazeleme betiği (`scripts/belge/belge-defteri.cjs`,
 * REC-473, H5/D8; cetvel: docs/standards/belge-yonetimi-standard.md).
 *
 * NİÇİN VAR: defteri üreten üç geçici betik hafıza klasöründe yaşıyordu; kalıcılaşırken iki şey sessizce bozulabilir:
 *   (a) dosya adı üretimi değişirse defterdeki 15 kaynak yetim kalır ve her yükleme MÜKERRER kaynak üretir,
 *   (b) yeni kaynak hazır olmadan eskisi silinirse defter boş kalır.
 * Bu paket ikisini ölçer. Sahte `notebooklm` komutunun `source list` çıktısı CANLIDAN alınmış gerçek fikstürdür
 * (2026-09-30); sahte gerçeği taklit etmiyorsa test kördür. `source add/delete` çıktıları yalnız çıkış koduyla
 * okunur (betik başarıyı listeden doğrular), bu yüzden sahte metinleri sözleşmeye girmez.
 *
 * Ayırt edici çiftler: grup kuralı ↔ atanmamış · kural ↔ plan (06a/06b) · yeni plan ↔ eski plan (tarihçe) ·
 * yeni hazır ↔ hazır değil (eski silinir ↔ eski KORUNUR) · liste hatası ↔ liste tamam (hiçbir şey yazılmaz ↔ yazılır).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

type Kaynak = { id: string; title: string; status: string }
type Modul = {
  DEFTER_BAYAT_GUN: number
  slug: (g: string) => string
  dosyaAdi: (g: string) => string
  grupBul: (yol: string, tur: string) => string
  bol: (grup: string, tur: string, tarih: string) => string
  durumOku: (simdi?: number, yol?: string) => { gun: number; kaynak: number; esitleme: string } | null
  yukle: (s?: { kuru?: boolean; kok?: string; uyu?: (sn: number) => void }) => number
}

const KOK = spawnSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim()
const require = createRequire(import.meta.url)
const BETIK = path.join(KOK, 'scripts/belge/belge-defteri.cjs')
const B = require(BETIK) as Modul
const CANLI = JSON.parse(
  fs.readFileSync(path.join(KOK, 'src/__tests__/fixtures/belge-defteri-source-list-2026-09-30.json'), 'utf8'),
) as { sources: Kaynak[] }

const BILINEN_GRUPLAR = [
  '01 Çekirdek ve harita',
  '02 Çalışma yöntemi, filo, iş kaydı',
  '03 Ölçüm, kanıt, kapı disiplini',
  '04 Araçlar, skill, CI, bağımlılık',
  '05 Veritabanı, migration, RLS, güvenlik',
  '06a Katalog ve ürün verisi: kurallar',
  '06b Katalog ve ürün verisi: plan, ölçüm, başvuru',
  '07 İçerik hattı: ölçümler ve taslaklar',
  '08 Fiyat, ödeme, sipariş, teklif',
  '09a Vitrin: kurallar',
  '09b Vitrin: plan, ölçüm, başvuru',
  '10 Yönetim paneli, ERP, CRM, bayi',
  '11 Mevzuat, yasal, AVenS',
  '12 SaaS, yol haritası, stratejik plan',
  '13 Tarihçe: bitmiş/eski planlar',
]

describe('INV-BELGE-DEFTER-1 · dosya adı kararlılığı (yetim/mükerrer kaynağı önler)', () => {
  it('15 bilinen grup adı, canlı defterdeki 15 kaynak başlığıyla BİREBİR aynı dosya adını üretir', () => {
    const uretilen = BILINEN_GRUPLAR.map((g) => B.dosyaAdi(g)).sort()
    const canli = CANLI.sources.map((k) => k.title).sort()
    expect(uretilen).toEqual(canli)
  })

  it('ASCII indirgemesi bilinçli: Türkçe harf düşer (adı "düzeltmek" tüm kaynakları yetim bırakır)', () => {
    expect(B.slug('01 Çekirdek ve harita')).toBe('01-ekirdek-ve-harita')
    expect(B.slug('13 Tarihçe: bitmiş/eski planlar')).toBe('13-tarihe-bitmi-eski-planlar')
  })
})

describe('INV-BELGE-DEFTER-1 · grup kuralları (ayırt edici çiftler)', () => {
  it('kurala uyan → grubu; hiçbir kurala uymayan → atanmamış (içerik kaybolmaz, uyarı basılır)', () => {
    expect(B.grupBul('docs/standards/fleet-mechanism-standard.md', 'kural')).toBe('02 Çalışma yöntemi, filo, iş kaydı')
    expect(B.grupBul('docs/standards/zzz-bilinmeyen.md', 'kural')).toMatch(/^14 Atanmam/)
  })

  it('yeni klasörler: docs/olcum → 03, docs/roller → 02 (yol önekiyle; ad kuralı gerekmez)', () => {
    expect(B.grupBul('docs/olcum/erisim-envanteri.md', 'olcum')).toBe('03 Ölçüm, kanıt, kapı disiplini')
    expect(B.grupBul('docs/roller/HARITA.md', 'kural')).toBe('02 Çalışma yöntemi, filo, iş kaydı')
  })

  it('06 ve 09 grupları tür ile bölünür: kural ↔ plan', () => {
    const g06 = B.grupBul('docs/standards/catalog-ingestion-standard.md', 'kural')
    expect(B.bol(g06, 'kural', '2026-09-01')).toBe('06a Katalog ve ürün verisi: kurallar')
    expect(B.bol(g06, 'plan', '2026-09-01')).toBe('06b Katalog ve ürün verisi: plan, ölçüm, başvuru')
  })

  it('tarihçe: 2026-08-01 öncesi PLAN → 13; yeni plan ve eski KURAL tarihçeye gitmez', () => {
    const g = '12 SaaS, yol haritası, stratejik plan'
    expect(B.bol(g, 'plan', '2026-06-01')).toBe('13 Tarihçe: bitmiş/eski planlar')
    expect(B.bol(g, 'plan', '2026-09-01')).toBe(g)
    expect(B.bol(g, 'kural', '2026-06-01')).toBe(g)
  })
})

// ───────── yukle: sahte `notebooklm` ile ─────────

const SAHTE = `
const fs = require('fs'); const path = require('path')
const p = process.env.FAKE_DUNYA
const d = JSON.parse(fs.readFileSync(p, 'utf8'))
const a = process.argv.slice(2)
d.cagrilar.push(a.slice(0, 2).join(' '))
const kaydet = () => fs.writeFileSync(p, JSON.stringify(d))
if (a[0] === 'source' && a[1] === 'list') {
  kaydet()
  if (d.listeHata) { console.log(JSON.stringify({ error: true, code: 'NETWORK_ERROR', message: 'Network error: Request timed out calling GET_NOTEBOOK' })); process.exit(1) }
  console.log(JSON.stringify({ notebook_id: 'x', notebook_title: 't', sources: d.kaynaklar, count: d.kaynaklar.length })); process.exit(0)
}
if (a[0] === 'source' && a[1] === 'add') {
  d.n = (d.n || 0) + 1
  d.kaynaklar.push({ index: d.kaynaklar.length + 1, id: 'yeni-' + d.n, title: path.basename(a[2]), type: 'markdown', url: null,
    status: d.hazirOlmaz ? 'processing' : 'ready', status_id: d.hazirOlmaz ? 1 : 2, created_at: new Date().toISOString(),
    drive_document_id: null, drive_status: null, is_drive_degraded: false })
  kaydet(); console.log('Added source'); process.exit(0)
}
if (a[0] === 'source' && a[1] === 'delete') { d.kaynaklar = d.kaynaklar.filter((k) => k.id !== a[2]); kaydet(); console.log('Deleted'); process.exit(0) }
process.exit(2)
`

const temizle: string[] = []
afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.NOTEBOOKLM_KOMUT
  delete process.env.FAKE_DUNYA
  delete process.env.VENTHUB_BELGE_DEFTERI_STATE
  delete process.env.NLM_ZAMAN
  for (const d of temizle.splice(0)) fs.rmSync(d, { recursive: true, force: true })
})

function git(cwd: string, args: string[], tarih?: string) {
  const env = { ...process.env, ...(tarih ? { GIT_AUTHOR_DATE: tarih, GIT_COMMITTER_DATE: tarih } : {}) }
  const r = spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...args], { cwd, env, encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`)
}

function minikDepo() {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'belge-defteri-test-'))
  temizle.push(kok)
  git(kok, ['init', '-q'])
  const yaz = (yol: string, metin: string, tarih: string) => {
    fs.mkdirSync(path.dirname(path.join(kok, yol)), { recursive: true })
    fs.writeFileSync(path.join(kok, yol), metin)
    git(kok, ['add', yol])
    git(kok, ['commit', '-q', '-m', yol], tarih)
  }
  yaz('README.md', '# Kök\nmetin', '2026-09-01T10:00:00Z')
  yaz('docs/standards/fleet-mechanism-standard.md', '# Filo\nkural', '2026-09-01T10:00:00Z')
  yaz('docs/plans/eski-saas-plan.md', '# Eski\nplan', '2026-06-01T10:00:00Z')
  yaz('docs/audits/zzz-bilinmeyen.md', '# Bilinmeyen\nölçüm', '2026-09-01T10:00:00Z')
  return kok
}

const BEKLENEN = [
  B.dosyaAdi('01 Çekirdek ve harita'),
  B.dosyaAdi('02 Çalışma yöntemi, filo, iş kaydı'),
  B.dosyaAdi('13 Tarihçe: bitmiş/eski planlar'),
  B.dosyaAdi('14 Atanmamış (kural eşleşmedi)'),
]

function dunyaKur(o: { eski?: string[]; hazirOlmaz?: boolean; listeHata?: boolean } = {}) {
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'belge-defteri-dunya-'))
  temizle.push(dizin)
  const p = path.join(dizin, 'dunya.json')
  const ornek = CANLI.sources[0]
  const kaynaklar = (o.eski ?? []).map((t, i) => ({ ...ornek, id: `eski-${i + 1}`, title: t, status: 'ready' }))
  fs.writeFileSync(p, JSON.stringify({ kaynaklar, cagrilar: [], hazirOlmaz: !!o.hazirOlmaz, listeHata: !!o.listeHata }))
  const sahte = path.join(dizin, 'sahte-nlm.cjs')
  fs.writeFileSync(sahte, SAHTE)
  process.env.NOTEBOOKLM_KOMUT = JSON.stringify([process.execPath, sahte])
  process.env.FAKE_DUNYA = p
  process.env.VENTHUB_BELGE_DEFTERI_STATE = path.join(dizin, 'durum.json')
  const oku = () => JSON.parse(fs.readFileSync(p, 'utf8')) as { kaynaklar: Kaynak[]; cagrilar: string[] }
  return { oku, durum: process.env.VENTHUB_BELGE_DEFTERI_STATE }
}

describe('INV-BELGE-DEFTER-1 · yukle (sahte notebooklm, canlı biçimli liste)', () => {
  it('TAM: yeni hazır → aynı adlı eski silinir, mükerrer yok, yetim SİLİNMEZ, durum yazılır, çıkış 0', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const yetim = 'venthub-belgeler-99-eski-grup.md'
    const d = dunyaKur({ eski: [...BEKLENEN, yetim] })
    const kod = B.yukle({ kok: minikDepo(), uyu: () => {} })
    expect(kod).toBe(0)
    const k = d.oku().kaynaklar
    for (const ad of BEKLENEN) expect(k.filter((x) => x.title === ad).map((x) => x.id), ad).toEqual([expect.stringMatching(/^yeni-/)])
    expect(k.some((x) => x.title === yetim && x.id.startsWith('eski-'))).toBe(true)
    const durum = JSON.parse(fs.readFileSync(d.durum, 'utf8'))
    expect(durum.kaynak).toBe(4)
  })

  it('YENİ HAZIR DEĞİL: eski KORUNUR, silme çağrısı yok, durum yazılmaz, çıkış 2 (ayırt edici: TAM ile aynı kurulum)', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    process.env.NLM_ZAMAN = '1'
    const d = dunyaKur({ eski: BEKLENEN, hazirOlmaz: true })
    const kod = B.yukle({ kok: minikDepo(), uyu: () => {} })
    expect(kod).toBe(2)
    const dunya = d.oku()
    expect(dunya.cagrilar.some((c) => c === 'source delete')).toBe(false)
    for (const ad of BEKLENEN) expect(dunya.kaynaklar.some((x) => x.title === ad && x.id.startsWith('eski-')), ad).toBe(true)
    expect(fs.existsSync(d.durum)).toBe(false)
  })

  it('LİSTE HATASI (canlı hata sözleşmesi { error:true }): hiçbir şey yazılmaz, çıkış 1', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const d = dunyaKur({ eski: BEKLENEN, listeHata: true })
    const kod = B.yukle({ kok: minikDepo(), uyu: () => {} })
    expect(kod).toBe(1)
    const c = d.oku().cagrilar
    expect(c.some((x) => x === 'source add' || x === 'source delete')).toBe(false)
    expect(fs.existsSync(d.durum)).toBe(false)
  })

  it('--kuru: yalnız okur (add/delete yok), çıkış 3', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const d = dunyaKur({ eski: BEKLENEN })
    expect(B.yukle({ kuru: true, kok: minikDepo(), uyu: () => {} })).toBe(3)
    const c = d.oku().cagrilar
    expect(c.every((x) => x === 'source list')).toBe(true)
  })
})

describe('INV-BELGE-DEFTER-1 · olc (durum dosyası; ağa çıkmaz)', () => {
  function olc(durum?: object) {
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'belge-defteri-olc-'))
    temizle.push(dizin)
    const yol = path.join(dizin, 'durum.json')
    if (durum) fs.writeFileSync(yol, JSON.stringify(durum))
    return spawnSync(process.execPath, [BETIK, 'olc'], { encoding: 'utf8', env: { ...process.env, VENTHUB_BELGE_DEFTERI_STATE: yol } })
  }
  const gunOnce = (n: number) => new Date(Date.now() - n * 86400000 - 3600000).toISOString()

  it('taze → 0; bayat (> eşik) → 1; dosya yok → 2 ve SAYI UYDURULMAZ', () => {
    const taze = olc({ esitleme: gunOnce(0), kaynak: 15 })
    expect(taze.status).toBe(0)
    expect(taze.stdout).toMatch(/\(0 gun\)/)
    const bayat = olc({ esitleme: gunOnce(B.DEFTER_BAYAT_GUN + 1), kaynak: 15 })
    expect(bayat.status).toBe(1)
    expect(bayat.stdout).toMatch(/BAYAT/)
    const yok = olc()
    expect(yok.status).toBe(2)
    expect(yok.stdout).toMatch(/OLCULEMEDI/)
    expect(yok.stdout).not.toMatch(/\d+ gun/)
  })

  it('belge-tazelik önbelleğine girer: taze → { bayat:false }; bayat → { bayat:true }; dosya yok → null', () => {
    const T = require(path.join(KOK, 'scripts/belge/belge-tazelik.cjs')) as {
      olc: (kok?: string, simdi?: number) => { belgelerDefteri: { gun: number; kaynak: number; bayat: boolean } | null }
    }
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'belge-defteri-tazelik-'))
    temizle.push(dizin)
    const yol = path.join(dizin, 'durum.json')
    process.env.VENTHUB_BELGE_DEFTERI_STATE = yol
    const simdi = Date.parse('2026-09-30T12:00:00Z')
    expect(T.olc(KOK, simdi).belgelerDefteri).toBeNull()
    fs.writeFileSync(yol, JSON.stringify({ esitleme: '2026-09-30T06:00:00Z', kaynak: 15 }))
    expect(T.olc(KOK, simdi).belgelerDefteri).toEqual({ gun: 0, kaynak: 15, bayat: false })
    fs.writeFileSync(yol, JSON.stringify({ esitleme: '2026-09-26T06:00:00Z', kaynak: 15 }))
    expect(T.olc(KOK, simdi).belgelerDefteri).toEqual({ gun: 4, kaynak: 15, bayat: true })
  })

  it('bozuk durum dosyası → null (ölçülemedi), yorum yok', () => {
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'belge-defteri-bozuk-'))
    temizle.push(dizin)
    const yol = path.join(dizin, 'durum.json')
    fs.writeFileSync(yol, '{bozuk')
    expect(B.durumOku(Date.now(), yol)).toBeNull()
  })
})
