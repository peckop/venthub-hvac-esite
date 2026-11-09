/**
 * INV-KANCA-DEFTER-TAZELIK-1 — departman defteri tazelik satırı ve defter kaynağı (ARC-288, OPS-258 adım 4).
 *
 * Çekirdek: scripts/hijyen/defter-tazelik.cjs · kanca: .claude/hooks/gorev-tazelik-satiri.cjs (⚠DEFTER) · susturma: uyari-susturma.cjs
 * Tüketiciler: scripts/arac/onceki-calisma.cjs (defter kaynağı), scripts/board/onceki-calisma-adaylari.cjs (defter adayı).
 * Manifest şeması: docs/plans/departman-defter-duzeni-2026-11-09.md §4.1 (HARİTA). Manifest depoda yokken şemaya karşı fixture.
 *
 * SABOTAJ (elle koşuldu, PR gövdesinde): tazelik önceliği (son doğrulama > ad > git) bozulursa, mtime'a dönülürse, eşik karşılaştırması
 * kayarsa, bozuk manifest sessiz kalırsa, defter ÖLÇÜLEMEDİ iken "YOK" denirse, susturma sayıyı imzaya katarsa bu dosya kırmızı olur.
 */
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')

interface Manifest {
  durum: 'yok' | 'tamam' | 'bozuk'
  sebep?: string
  defterler: { ad: string; dosya: string; sahip: string; izlenen?: string[]; tazelikGun?: number; durum?: string }[]
}
interface Taze {
  ad: string
  esik: number
  gun?: number
  kaynak?: string
  tarih?: string
  bayat?: boolean
  olculemedi?: string
}
interface Modul {
  manifestOku: (kok: string, o?: { oku?: (y: string) => string }) => Manifest
  sonDogrulama: (m: string) => string | null
  tazelik: (d: Manifest['defterler'][number], o: { kok: string; simdi: number; oku?: (y: string) => string; gitTarihi?: (k: string, d: string) => string | null }) => Taze
  satir: (rol: string, s: Taze[], yeni?: number | null) => string
  rolSatiri: (
    rol: string,
    kok: string,
    k?: { manifest?: Manifest; simdi?: number; oku?: (y: string) => string; gitTarihi?: () => string | null; izlenenSay?: () => number | null },
  ) => string
  aranacakSatirlar: (m: string) => { bolum: string; satir: string }[]
  defterIcerikleri: (kok: string, o?: { oku?: (y: string) => string }) => { durum: string; sebep?: string; defterler: { ad: string; metin: string }[] }
  rolKatla: (s: string) => string
}
const z = gerek(path.join(KOK, 'scripts', 'hijyen', 'defter-tazelik.cjs')) as Modul
const susturma = gerek(path.join(KOK, '.claude', 'hooks', 'uyari-susturma.cjs')) as { suz: (m: string, sid: string, pano: string, simdi: number, ad: string) => string }

const GUN = 86400000
const SIMDI = Date.parse('2026-11-09T12:00:00Z')
const bayt = (s: string) => Buffer.byteLength(s, 'utf8')

/** Sahte dosya sistemi: yol → metin; olmayan yol ENOENT fırlatır. */
function fs(dosyalar: Record<string, string>) {
  return (yol: string) => {
    const k = Object.keys(dosyalar).find((a) => yol.replace(/\\/g, '/').endsWith(a))
    if (k === undefined) throw Object.assign(new Error('yok'), { code: 'ENOENT' })
    return dosyalar[k]
  }
}
const manifestJson = (defterler: unknown) => JSON.stringify({ defterler })

describe('INV-KANCA-DEFTER-TAZELIK-1a: manifest okuma (HARİTA §4.1 şeması)', () => {
  it('dosya yok → "yok" (düzen kurulmamış, satır sessiz)', () => {
    expect(z.manifestOku(KOK, { oku: fs({}) }).durum).toBe('yok')
  })
  it('geçerli manifest → tamam', () => {
    const m = z.manifestOku(KOK, { oku: fs({ 'docs/defter/manifest.json': manifestJson([{ ad: 'urun-adres', dosya: 'docs/defter/urun-adres.md', sahip: 'URUN' }]) }) })
    expect(m.durum).toBe('tamam')
    expect(m.defterler).toHaveLength(1)
  })
  it.each([
    ['JSON hatası', '{bozuk'],
    ['defterler dizisi yok', '{"x":1}'],
    ['sahip eksik', manifestJson([{ ad: 'a', dosya: 'docs/defter/a.md' }])],
    ['ad eksik', manifestJson([{ dosya: 'docs/defter/a.md', sahip: 'URUN' }])],
    ['mutlak yol', manifestJson([{ ad: 'a', dosya: '/etc/passwd', sahip: 'URUN' }])],
    ['sürücü harfli yol', manifestJson([{ ad: 'a', dosya: 'C:/x/a.md', sahip: 'URUN' }])],
    ['.. içeren yol', manifestJson([{ ad: 'a', dosya: '../gizli/a.md', sahip: 'URUN' }])],
  ])('%s → bozuk (sessizlik "taze" demek değildir)', (_ad, ham) => {
    const m = z.manifestOku(KOK, { oku: fs({ 'docs/defter/manifest.json': ham }) })
    expect(m.durum).toBe('bozuk')
    expect(m.sebep).toBeTruthy()
  })
  it('ENOENT dışı okuma hatası → bozuk (yok sayılmaz)', () => {
    const m = z.manifestOku(KOK, {
      oku: () => {
        throw Object.assign(new Error('izin'), { code: 'EACCES' })
      },
    })
    expect(m.durum).toBe('bozuk')
  })
})

describe('INV-KANCA-DEFTER-TAZELIK-1b: tazelik kaynağı sırası ve eşik', () => {
  const d = { ad: 'urun-adres', dosya: 'docs/defter/urun-adres.md', sahip: 'URUN' }
  const t = (metin: string, dosya = d.dosya, ek: Partial<typeof d> & { tazelikGun?: number } = {}, git: string | null = null) =>
    z.tazelik({ ...d, dosya, ...ek }, { kok: KOK, simdi: SIMDI, oku: fs({ [dosya]: metin }), gitTarihi: () => git })

  it('"Son doğrulama" satırı, dosya adı tarihini ve git tarihini yener', () => {
    const r = t('# D\nSon doğrulama: 2026-11-01\n', 'docs/defter/urun-adres-2026-01-01.md', {}, '2026-02-02')
    expect(r.kaynak).toBe('son-dogrulama')
    expect(r.gun).toBe(8)
  })
  it('kalın yazılmış "**Son doğrulama:** …" ve ASCII yazım da okunur', () => {
    expect(z.sonDogrulama('**Son doğrulama:** 2026-11-01')).toBe('2026-11-01')
    expect(z.sonDogrulama('Son dogrulama: 2026-11-01')).toBe('2026-11-01')
    expect(z.sonDogrulama('doğrulama yok')).toBeNull()
  })
  it('doğrulama satırı yoksa dosya adındaki tarih; o da yoksa git içerik commit tarihi', () => {
    const ad = t('gövde', 'docs/defter/urun-adres-2026-10-01.md', {}, '2026-11-08')
    expect(ad.kaynak).toBe('dosya-adi')
    expect(ad.gun).toBe(39)
    const git = t('gövde', 'docs/defter/urun-adres.md', {}, '2026-10-20')
    expect(git.kaynak).toBe('git')
    expect(git.gun).toBe(20)
  })
  it('hiç tarih bulunamazsa ölçülemedi (taze sayılmaz)', () => {
    expect(t('gövde').olculemedi).toBe('tarih bulunamadı')
  })
  it('defter dosyası okunamazsa ölçülemedi', () => {
    const r = z.tazelik(d, { kok: KOK, simdi: SIMDI, oku: fs({}), gitTarihi: () => '2026-11-08' })
    expect(r.olculemedi).toBe('dosya okunamadı')
  })
  it('gelecek tarihli doğrulama ölçülemedi (yazım hatası bayatlığı gizlemesin)', () => {
    expect(t('Son doğrulama: 2027-01-01').olculemedi).toBe('gelecek tarihli doğrulama')
  })
  it('eşik: varsayılan 14, tam eşikte taze, bir gün sonra bayat; defter başına eşik geçerli', () => {
    const on = (gun: number) => new Date(SIMDI - gun * GUN).toISOString().slice(0, 10)
    expect(t(`Son doğrulama: ${on(14)}`).bayat).toBe(false)
    expect(t(`Son doğrulama: ${on(15)}`).bayat).toBe(true)
    expect(t(`Son doğrulama: ${on(40)}`, d.dosya, { tazelikGun: 90 }).bayat).toBe(false)
    expect(t(`Son doğrulama: ${on(40)}`, d.dosya, { tazelikGun: 30 }).bayat).toBe(true)
  })
  it('mtime kullanılmaz: oku/gitTarihi dışında bir zaman kaynağı sonucu değiştirmez', () => {
    // Aynı içerik, aynı sahte git tarihi → aynı sonuç; dosya sistemi zamanı hiç sorulmaz (sahte oku yalnız metin döner).
    expect(t('gövde', d.dosya, {}, '2026-11-01')).toEqual(t('gövde', d.dosya, {}, '2026-11-01'))
  })
})

describe('INV-KANCA-DEFTER-TAZELIK-1c: ⚠DEFTER satırı', () => {
  const eski = '2026-10-01'
  const taze = '2026-11-08'
  const mf = (defterler: Manifest['defterler']): Manifest => ({ durum: 'tamam', defterler })
  const d = (ad: string, sahip = 'URUN', ek = {}) => ({ ad, dosya: `docs/defter/${ad}.md`, sahip, ...ek })
  const dosya = (ad: string, tarih: string) => [`docs/defter/${ad}.md`, `# ${ad}\nSon doğrulama: ${tarih}\n`] as const
  const oku = (...ciftler: (readonly [string, string])[]) => fs(Object.fromEntries(ciftler))

  it('hepsi taze → sessiz', () => {
    expect(z.rolSatiri('URUN', KOK, { manifest: mf([d('a')]), simdi: SIMDI, oku: oku(dosya('a', taze)) })).toBe('')
  })
  it('manifest yok → sessiz; bozuk → ölçülemedi satırı (taze demek değil)', () => {
    expect(z.rolSatiri('URUN', KOK, { manifest: { durum: 'yok', defterler: [] } })).toBe('')
    expect(z.rolSatiri('URUN', KOK, { manifest: { durum: 'bozuk', sebep: 'JSON ayrıştırılamadı', defterler: [] } })).toMatch(/^⚠DEFTER \(URUN\): ölçülemedi \(manifest bozuk/)
  })
  it('bayat defter → tek satır, tavan altında, beklenen biçim', () => {
    const s = z.rolSatiri('URUN', KOK, { manifest: mf([d('urun-adres')]), simdi: SIMDI, oku: oku(dosya('urun-adres', eski)), izlenenSay: () => null })
    expect(s).toBe('⚠DEFTER (URUN): urun-adres 39 gün doğrulanmadı (eşik 14)')
    expect(s.includes('\n')).toBe(false)
    expect(bayt(s)).toBeLessThanOrEqual(160)
  })
  it('izlenen yolda defterden yeni commit sayısı satıra girer; sayılamazsa girmez', () => {
    const k = { manifest: mf([d('urun-adres', 'URUN', { izlenen: ['next.config.mjs'] })]), simdi: SIMDI, oku: oku(dosya('urun-adres', eski)) }
    expect(z.rolSatiri('URUN', KOK, { ...k, izlenenSay: () => 3 })).toContain('izlenen yolda 3 commit defterden yeni')
    expect(z.rolSatiri('URUN', KOK, { ...k, izlenenSay: () => null })).not.toContain('izlenen')
    expect(z.rolSatiri('URUN', KOK, { ...k, izlenenSay: () => 0 })).not.toContain('izlenen')
  })
  it('birden çok sorun: ölçülemedi önce, sonra eşiği en çok aşan; "+N defter" eki', () => {
    const k = { manifest: mf([d('a'), d('b'), d('c')]), simdi: SIMDI, izlenenSay: () => null }
    const a = z.rolSatiri('URUN', KOK, { ...k, oku: oku(dosya('a', '2026-10-20'), dosya('b', '2026-09-01'), dosya('c', taze)) })
    expect(a).toBe('⚠DEFTER (URUN): b 69 gün doğrulanmadı (eşik 14) (+1 defter)')
    const o = z.rolSatiri('URUN', KOK, { ...k, oku: oku(dosya('a', '2026-10-20'), dosya('c', taze)) })
    expect(o).toBe('⚠DEFTER (URUN): b ölçülemedi (dosya okunamadı) (+1 defter)')
  })
  it('yalnız rolün kendi defterleri; sahip ARAÇ = ARAC, emekli atlanır', () => {
    const k = { manifest: mf([d('a', 'GEO-SEO'), d('b', 'ARAÇ'), d('c', 'ARAC', { durum: 'emekli' })]), simdi: SIMDI, izlenenSay: () => null }
    const hepsi = oku(dosya('a', eski), dosya('b', eski), dosya('c', eski))
    expect(z.rolSatiri('URUN', KOK, { ...k, oku: hepsi })).toBe('')
    expect(z.rolSatiri('ARAC', KOK, { ...k, oku: hepsi })).toContain('b 39 gün')
    expect(z.rolSatiri('ARAC', KOK, { ...k, oku: hepsi })).not.toContain('+')
    expect(z.rolSatiri('GEO-SEO', KOK, { ...k, oku: hepsi })).toContain('a 39 gün')
    expect(z.rolKatla('ARAÇ')).toBe('ARAC')
  })
  it('çok uzun ad: 160 bayt tavanı, geçerli UTF-8 (yarım karakter yok)', () => {
    const ad = 'çok-uzun-defter-adı-'.repeat(8)
    const s = z.rolSatiri('URUN', KOK, { manifest: mf([d(ad)]), simdi: SIMDI, oku: oku(dosya(ad, eski)), izlenenSay: () => 5 })
    expect(bayt(s)).toBeLessThanOrEqual(160)
    expect(Buffer.from(s, 'utf8').toString('utf8')).toBe(s)
    expect(s.startsWith('⚠DEFTER (URUN): ')).toBe(true)
  })
  it('okuma fırlatsa bile fırlatmaz (fail-open): sessiz', () => {
    const k = {
      manifest: mf([d('a')]),
      simdi: SIMDI,
      oku: () => {
        throw new Error('disk')
      },
      gitTarihi: () => {
        throw new Error('git')
      },
    }
    expect(() => z.rolSatiri('URUN', KOK, k)).not.toThrow()
  })
  it('rol yok → sessiz', () => {
    expect(z.rolSatiri('', KOK, { manifest: mf([d('a')]) })).toBe('')
  })
})

describe('INV-KANCA-DEFTER-TAZELIK-1d: susturma (ARC-220) ve kanca', () => {
  const sid = 'a1b2c3d4-0000-0000-0000-000000000000'
  const pano = path.join(os.tmpdir(), 'defter-test-' + process.pid)
  it('aynı defter bayatken gün sayısı değişse de ikinci kez basılmaz; başka defter bayatlayınca basılır', () => {
    const ilk = susturma.suz('⚠DEFTER (URUN): urun-adres 21 gün doğrulanmadı (eşik 14); izlenen yolda 3 commit defterden yeni\n', sid, pano, SIMDI, 'defter')
    expect(ilk).toContain('urun-adres')
    const ikinci = susturma.suz('⚠DEFTER (URUN): urun-adres 22 gün doğrulanmadı (eşik 14); izlenen yolda 4 commit defterden yeni\n', sid, pano, SIMDI + 1000, 'defter')
    expect(ikinci).toBe('')
    const baska = susturma.suz('⚠DEFTER (URUN): adres-gecis 30 gün doğrulanmadı (eşik 14)\n', sid, pano, SIMDI + 2000, 'defter')
    expect(baska).toContain('adres-gecis')
  })
  it('oturum kimliği yoksa süzme yok (elle koşu): satır her seferinde basılır', () => {
    const s = '⚠DEFTER (URUN): urun-adres 21 gün doğrulanmadı (eşik 14)\n'
    expect(susturma.suz(s, '', pano, SIMDI, 'defter')).toBe(s)
    expect(susturma.suz(s, '', pano, SIMDI + 1, 'defter')).toBe(s)
  })
  const kos = (env: Record<string, string>, girdi: string) =>
    spawnSync(process.execPath, [path.join(KOK, '.claude', 'hooks', 'gorev-tazelik-satiri.cjs')], { input: girdi, encoding: 'utf8', env: { ...process.env, ...env } })
  it('kanca: vana (VENTHUB_DEFTER_SATIRI_KAPAT=1) satırı kapatır, çıkış 0', () => {
    const r = kos({ VENTHUB_DEFTER_SATIRI_KAPAT: '1' }, JSON.stringify({ cwd: KOK, session_id: '' }))
    expect(r.status).toBe(0)
    expect(r.stdout).not.toContain('⚠DEFTER')
  })
  it('kanca: bozuk girdi ve bilinmeyen pencerede çökmez (fail-open), çıkış 0', () => {
    expect(kos({}, '{bozuk').status).toBe(0)
    expect(kos({}, JSON.stringify({ cwd: os.tmpdir() })).status).toBe(0)
  })
})

describe('INV-KANCA-DEFTER-TAZELIK-1e: aranacak satırlar ve defter içerikleri', () => {
  const metin = ['# Defter', '## Adres şeması', '- bu madde aranmaz', '## Sırada', '- URN-157 geçiş tablosu', '1. ikinci iş', '', 'düz paragraf aranmaz', '## Kapanış', '- kapanış maddesi aranmaz'].join('\n')
  it('tüm başlıklar + yalnız Sırada/Envanter bölümlerinin liste satırları', () => {
    const s = z.aranacakSatirlar(metin).map((x) => x.satir)
    expect(s).toEqual(['Defter', 'Adres şeması', 'Sırada', '- URN-157 geçiş tablosu', '1. ikinci iş', 'Kapanış'])
    expect(z.aranacakSatirlar(metin).find((x) => x.satir.includes('URN-157'))?.bolum).toBe('Sırada')
  })
  const mfHam = manifestJson([{ ad: 'urun-adres', dosya: 'docs/defter/urun-adres.md', sahip: 'URUN' }])
  it('defterIcerikleri: yok / bozuk / okunamayan defter → ölçülemedi / tamam', () => {
    expect(z.defterIcerikleri(KOK, { oku: fs({}) }).durum).toBe('yok')
    expect(z.defterIcerikleri(KOK, { oku: fs({ 'docs/defter/manifest.json': '{x' }) }).durum).toBe('bozuk')
    const eksik = z.defterIcerikleri(KOK, { oku: fs({ 'docs/defter/manifest.json': mfHam }) })
    expect(eksik.durum).toBe('olculemedi')
    expect(eksik.sebep).toContain('urun-adres')
    const tamam = z.defterIcerikleri(KOK, { oku: fs({ 'docs/defter/manifest.json': mfHam, 'docs/defter/urun-adres.md': metin }) })
    expect(tamam.durum).toBe('tamam')
    expect(tamam.defterler[0].ad).toBe('urun-adres')
  })
})

// ───────────────────────── onceki-calisma defter kaynağı ─────────────────────────

interface DefterBaglari {
  durum: string
  sebep?: string
  defterler?: { ad: string; dosya: string; sahip: string; metin: string }[]
}
interface OncekiSonuc {
  sonuc: string
  ilk: string
  kaynaklar: Record<string, { durum: string; sebep?: string; bulgular: { tur: string; ad?: string; bolum?: string }[] }>
}
const onceki = gerek(path.join(KOK, 'scripts', 'arac', 'onceki-calisma.cjs')) as {
  tara: (metin: string, o: { baglar: object }) => Promise<OncekiSonuc>
  KAYNAKLAR: string[]
}
const adaylar = gerek(path.join(KOK, 'scripts', 'board', 'onceki-calisma-adaylari.cjs')) as {
  adaylariBul: (g: { baslik: string; defterler?: { ad: string; metin: string }[] }) => { defter: { id: string; ad: string }[]; hepsi: { tur: string; id: string; ad: string }[] }
  metinler: (a: object, aciklama?: string) => string[]
}

const DEFTER_METNI = ['# Adres defteri', '## Adres şeması', '- canlı adres sayıları', '## Sırada', '- URN-157 eski yeni adres geçiş tablosu yönlendirme (beklemede)'].join('\n')
const bos = {
  dosyalar: async () => [] as string[],
  gitLog: async () => [],
  silinmisYollar: async () => [],
  kanban: async () => [],
  daemonCanli: () => false,
  portAc: async () => null,
  linearAnahtar: '',
  linearGetir: async () => [],
}
const EMIR = 'URN-157 eski yeni adres geçiş tablosu yönlendirme işi'

describe('INV-KANCA-DEFTER-TAZELIK-2: onceki-calisma defter kaynağı (çekirdeğe yakın)', () => {
  it('KAYNAKLAR sırası: defter kanbandan sonra', () => {
    expect(onceki.KAYNAKLAR).toEqual(['dosya', 'git', 'kanban', 'defter', 'sage', 'linear'])
  })
  it('Sırada maddesi eşleşince BULUNDU ve etiket defter + bölümü gösterir', async () => {
    const d: DefterBaglari = { durum: 'tamam', defterler: [{ ad: 'urun-adres', dosya: 'docs/defter/urun-adres.md', sahip: 'URUN', metin: DEFTER_METNI }] }
    const s = await onceki.tara(EMIR, { baglar: { ...bos, defterler: async () => d } })
    expect(s.sonuc).toBe('bulgu-var')
    expect(s.kaynaklar.defter.bulgular[0]).toMatchObject({ tur: 'defter', ad: 'urun-adres', bolum: 'Sırada' })
    expect(s.ilk).toContain('defter urun-adres §Sırada')
  })
  it('manifest yok → atlandı, diğer kaynaklar tamamsa "YOK" denebilir', async () => {
    const s = await onceki.tara(EMIR, { baglar: { ...bos, defterler: async () => ({ durum: 'yok' }) } })
    expect(s.kaynaklar.defter.durum).toBe('atlandi')
    expect(s.sonuc).toBe('bulgu-yok')
  })
  it('manifest bozuk → defter ÖLÇÜLEMEDİ ve sonuç "YOK" olamaz', async () => {
    const s = await onceki.tara(EMIR, { baglar: { ...bos, defterler: async () => ({ durum: 'bozuk', sebep: 'JSON ayrıştırılamadı' }) } })
    expect(s.kaynaklar.defter.durum).toBe('olculemedi')
    expect(s.sonuc).toBe('olculemedi')
    expect(s.ilk).toContain('ÖLÇÜLEMEDİ')
    expect(s.ilk).toContain('defter')
  })
  it('defter dosyası okunamadı → ölçülemedi; defter bağı fırlatırsa da ölçülemedi', async () => {
    const a = await onceki.tara(EMIR, { baglar: { ...bos, defterler: async () => ({ durum: 'olculemedi', sebep: 'defter dosyası okunamadı: urun-adres' }) } })
    expect(a.sonuc).toBe('olculemedi')
    const b = await onceki.tara(EMIR, {
      baglar: {
        ...bos,
        defterler: async () => {
          throw new Error('disk')
        },
      },
    })
    expect(b.kaynaklar.defter.durum).toBe('olculemedi')
    expect(b.sonuc).toBe('olculemedi')
  })
  it('bulgu varken defter ölçülemedi olsa da BULUNDU korunur (mevcut davranış)', async () => {
    const s = await onceki.tara(EMIR, {
      baglar: { ...bos, dosyalar: async () => ['docs/plans/urn157-gecis-tablosu-yonlendirme.md'], defterler: async () => ({ durum: 'bozuk', sebep: 'x' }) },
    })
    expect(s.sonuc).toBe('bulgu-var')
  })
})

describe('INV-KANCA-DEFTER-TAZELIK-3: onceki-calisma-adaylari aynı manifestten defter adayı', () => {
  it('başlıkla eşleşen Sırada maddesi defter adayı olur ve metinler() basar', () => {
    const a = adaylar.adaylariBul({ baslik: 'ARC-9 · adres geçiş tablosu yönlendirme', defterler: [{ ad: 'urun-adres', metin: DEFTER_METNI }] })
    expect(a.defter).toHaveLength(1)
    expect(a.hepsi.find((x) => x.tur === 'defter')?.id).toBe('urun-adres')
    const m = adaylar.metinler(a)
    expect(m[0]).toContain('defter: urun-adres §Sırada')
  })
  it('kartın ÖNCEKİ ÇALIŞMA satırı defteri anmıyorsa mevcut "aday anılmadı" uyarısı çıkar', () => {
    const a = adaylar.adaylariBul({ baslik: 'ARC-9 · adres geçiş tablosu yönlendirme', defterler: [{ ad: 'urun-adres', metin: DEFTER_METNI }] })
    const m = adaylar.metinler(a, 'KAYNAK/CETVEL: yok\nÖNCEKİ ÇALIŞMA: tarandı, bir şey yok.\nNE: x')
    expect(m.join('\n')).toContain('ÖNCEKİ ÇALIŞMA UYARI')
    const anan = adaylar.metinler(a, 'ÖNCEKİ ÇALIŞMA: defter urun-adres okundu.\nNE: x')
    expect(anan.join('\n')).not.toContain('ÖNCEKİ ÇALIŞMA UYARI')
  })
  it('ilgisiz başlık defter adayı üretmez; defter listesi yoksa eski davranış', () => {
    expect(adaylar.adaylariBul({ baslik: 'ARC-9 · kanca bellek sayacı', defterler: [{ ad: 'urun-adres', metin: DEFTER_METNI }] }).defter).toHaveLength(0)
    expect(adaylar.adaylariBul({ baslik: 'ARC-9 · adres geçiş tablosu yönlendirme' }).defter).toHaveLength(0)
  })
})
