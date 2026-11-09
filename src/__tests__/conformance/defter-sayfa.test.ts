/**
 * HRT-127 (OPS-258 adım 6): scripts/belge/defter-sayfa.cjs, defterlerden üretilen Recep sayfası.
 * Sayfa gerçek veriden gelir; bayat/ölçülemeyen defter sessizce taze gösterilmez; metin kaçışlıdır.
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = path.resolve(__dirname, '..', '..', '..')
const req = createRequire(import.meta.url)

interface Kart {
  ad: string
  hal: string
  yas?: number
  sirada?: Array<{ madde: string; oncelik: string; kart: string }>
  siradaToplam?: number
  sonIs?: { tarih: string; is: string } | null
  sonDogrulama?: string | null
}
const ds = req(path.join(KOK, 'scripts', 'belge', 'defter-sayfa.cjs')) as {
  ayikla: (m: string) => { sonDogrulama: string | null; sonIs: { tarih: string; is: string } | null; sirada: Array<{ madde: string; oncelik: string; kart: string }>; siradaToplam: number }
  gunFarki: (a: string, b: string) => number | null
  sayfaUret: (m: unknown, oku: (d: string) => string | null, bugun: string) => { html: string; kartlar: Kart[] }
  hedefDepoIcinde: (h: string, kok: string) => boolean
  calistir: (argv: string[], o?: { kok?: string; bugun?: string }) => { kod: number; kartlar: Kart[] }
}
const dm = req(path.join(KOK, 'scripts', 'belge', 'defter-manifest.cjs')) as { oku: () => unknown }

const DEFTER = `# X defteri

Sahibi: URUN · Son doğrulama: 2026-11-01 · Cetvel: x

## 1 Ne yaptık

| Tarih | İş | Sonuç | Kart |
|---|---|---|---|
| 2026-11-01 | İlk iş <b>kalın</b> | tamam | URN-1 |
| 2026-10-01 | Eski iş | tamam | URN-0 |

## 2 Envanter

| A | B |
|---|---|
| 1 | 2 |

## 3 Sırada ve yapılabilecekler

| Madde | Gerekçe | Öncelik | Kart |
|---|---|---|---|
| Bir | g1 | yüksek | URN-2 |
| İki \\| borulu | g2 | orta | — |
| Üç | g3 | düşük | URN-3 |
| Dört | g4 | düşük | URN-4 |

## 4 Kararlar

| Tarih | Karar |
|---|---|
`

const kayit = (ek: Record<string, unknown> = {}) => ({
  ad: 'x-defter', dosya: 'docs/defter/x.md', sahip: 'URUN', ozet: 'Bir alan özeti', izlenen: ['next.config.mjs'], tazelikGun: 14,
  tetik: ['kart-kapanisi', 'sure'], olcum: null, disKaynak: null, durum: 'pilot', ...ek,
})
const man = (...k: Array<Record<string, unknown>>) => ({ sema: 1, defterler: k })
const okuyucu = (metin: string | null) => () => metin

describe('defter-sayfa: ayıklama', () => {
  it('Son doğrulama, son iş ve sırada ilk üç madde (kaçışlı boru dahil) çıkar; toplam sayılır', () => {
    const v = ds.ayikla(DEFTER)
    expect(v.sonDogrulama).toBe('2026-11-01')
    expect(v.sonIs).toEqual({ tarih: '2026-11-01', is: 'İlk iş <b>kalın</b>' })
    expect(v.sirada.map((s) => s.madde)).toEqual(['Bir', 'İki | borulu', 'Üç'])
    expect(v.sirada[0]).toEqual({ madde: 'Bir', oncelik: 'yüksek', kart: 'URN-2' })
    expect(v.siradaToplam).toBe(4)
  })

  it('bozuk/boş metinde fırlatmaz: alanlar null/boş', () => {
    const v = ds.ayikla('rastgele metin')
    expect(v).toEqual({ sonDogrulama: null, sonIs: null, siradaToplam: 0, sirada: [] })
  })

  it('gunFarki: tam gün, geçmişe dönük negatifse 0, geçersiz tarih null', () => {
    expect(ds.gunFarki('2026-11-01', '2026-11-09')).toBe(8)
    expect(ds.gunFarki('2026-11-10', '2026-11-09')).toBe(0)
    expect(ds.gunFarki('xx', '2026-11-09')).toBeNull()
  })
})

describe('defter-sayfa: kart halleri (kör sayfa değil)', () => {
  it('eşik içinde TAZE; eşiği aşınca BAYAT ve kırmızı sınıf (SABOTAJ: tarih eskitilince hüküm değişir)', () => {
    const taze = ds.sayfaUret(man(kayit()), okuyucu(DEFTER), '2026-11-09')
    expect(taze.kartlar[0].hal).toBe('taze')
    expect(taze.kartlar[0].yas).toBe(8)
    const bayat = ds.sayfaUret(man(kayit()), okuyucu(DEFTER), '2026-12-01')
    expect(bayat.kartlar[0].hal).toBe('bayat')
    expect(bayat.html).toContain('class="kart bayat"')
    expect(taze.html).toContain('class="kart taze"')
  })

  it('tazelikGun defter başına: aynı yaş, kısa eşikte bayat', () => {
    const r = ds.sayfaUret(man(kayit({ tazelikGun: 7 })), okuyucu(DEFTER), '2026-11-09')
    expect(r.kartlar[0].hal).toBe('bayat')
  })

  describe('kaynakIzi (ARC-291): kaynak değişmediyse süre dolsa da bayat değil, AYRI hal', () => {
    const blok = (satir: string) =>
      `<!-- DEFTER-OLCUM:envanter BASLA — x -->\n| Ölçüm | Son sonuç | Ölçüm tarihi | Kaynak izi |\n|---|---|---|---|\n${satir}\n<!-- DEFTER-OLCUM:envanter BITIS -->`
    const metin = (satir: string) => DEFTER.replace('| 1 | 2 |', `| 1 | 2 |\n\n${blok(satir)}`)
    const TEMIZ = '| Fark | 1165 üründe fark 0 | 2026-11-05 | kaynak değişmedi — son ölçüm 2026-11-05 |'
    const izli = kayit({ olcum: 'node x', kaynakIzi: 'node x --iz' })

    it('eşik aşıldı + tüm satırlar temiz → kaynak-degismedi (taze değil, bayat değil); Son doğrulama günü görünür', () => {
      const r = ds.sayfaUret(man(izli), okuyucu(metin(TEMIZ)), '2026-12-01')
      expect(r.kartlar[0].hal).toBe('kaynak-degismedi')
      expect(r.html).toContain('class="kart kaynak-degismedi"')
      expect(r.html).toContain('Son doğrulama 2026-11-01')
    })
    it('sabotaj: bekleyen ya da ölçülemeyen satır varsa yine BAYAT', () => {
      for (const s of ['| Fark | x | 2026-11-05 | ⚠ kaynak DEĞİŞTİ, ölçüm bekliyor |', '| Adres | x | 2026-11-04 | ⚠ ölçülemedi (iz üretilemedi) |']) {
        expect(ds.sayfaUret(man(izli), okuyucu(metin(s)), '2026-12-01').kartlar[0].hal, s).toBe('bayat')
      }
    })
    it('sabotaj: manifestte kaynakIzi yoksa ya da blok yoksa BAYAT; eşik içinde TAZE kalır', () => {
      expect(ds.sayfaUret(man(kayit()), okuyucu(metin(TEMIZ)), '2026-12-01').kartlar[0].hal).toBe('bayat')
      expect(ds.sayfaUret(man(izli), okuyucu(DEFTER), '2026-12-01').kartlar[0].hal).toBe('bayat')
      expect(ds.sayfaUret(man(izli), okuyucu(metin(TEMIZ)), '2026-11-09').kartlar[0].hal).toBe('taze')
    })
  })

  it('Son doğrulama satırı yoksa ya da dosya okunamıyorsa "ölçülemedi" ve kırmızı (taze DEĞİL)', () => {
    const satirsiz = ds.sayfaUret(man(kayit()), okuyucu('# defter\n\n## 1 Ne yaptık\n'), '2026-11-09')
    expect(satirsiz.kartlar[0].hal).toBe('olculemedi')
    expect(satirsiz.html).toContain('class="kart olculemedi"')
    const yok = ds.sayfaUret(man(kayit()), okuyucu(null), '2026-11-09')
    expect(yok.kartlar[0].hal).toBe('olculemedi')
  })

  it('planlı kayıt dosyasızsa "planlı" (gri); dosyası varsa gerçek veri gösterilir (manifest durumu geride kalmış olabilir)', () => {
    expect(ds.sayfaUret(man(kayit({ durum: 'planli' })), okuyucu(null), '2026-11-09').kartlar[0].hal).toBe('planli')
    expect(ds.sayfaUret(man(kayit({ durum: 'planli' })), okuyucu(DEFTER), '2026-11-09').kartlar[0].hal).toBe('taze')
  })

  it('manifest okunamazsa sayfa bunu söyler (boş sayfa "sorun yok" demez)', () => {
    const r = ds.sayfaUret(null, okuyucu(null), '2026-11-09')
    expect(r.html).toContain('Manifest okunamadı')
    expect(r.kartlar).toEqual([])
  })
})

describe('defter-sayfa: güvenlik ve çıktı', () => {
  it('defter metnindeki HTML kaçışlanır; sayfa betik ve dış kaynak içermez', () => {
    const r = ds.sayfaUret(man(kayit()), okuyucu(DEFTER), '2026-11-09')
    expect(r.html).toContain('İlk iş &lt;b&gt;kalın&lt;/b&gt;')
    expect(r.html).not.toContain('<b>kalın</b>')
    expect(r.html).not.toMatch(/<script|src=|href=|@import|url\(/i)
    const kotu = ds.sayfaUret(man(kayit({ ozet: '"><script>alert(1)</script>' })), okuyucu(DEFTER), '2026-11-09')
    expect(kotu.html).not.toContain('<script>alert')
  })

  it('depo içi hedef reddedilir, depo dışı hedefe yazılır ve kod 0 döner', () => {
    expect(ds.hedefDepoIcinde(path.join(KOK, 'docs', 'x.html'), KOK)).toBe(true)
    const dis = fs.mkdtempSync(path.join(os.tmpdir(), 'defter-sayfa-'))
    try {
      const hedef = path.join(dis, 'a', 'defter.html')
      expect(ds.hedefDepoIcinde(hedef, KOK)).toBe(false)
      const sessiz = process.stdout.write.bind(process.stdout)
      process.stdout.write = (() => true) as typeof process.stdout.write
      let sonuc: { kod: number }
      try {
        sonuc = ds.calistir(['--hedef', hedef, '--bugun', '2026-11-09'])
      } finally {
        process.stdout.write = sessiz
      }
      expect(sonuc.kod).toBe(0)
      expect(fs.readFileSync(hedef, 'utf8')).toContain('<title>Departman Defterleri</title>')
    } finally {
      fs.rmSync(dis, { recursive: true, force: true })
    }
  })

  it('gerçek manifest ve gerçek defterlerden sayfa üretilir: her manifest kaydı için bir kart, hiçbiri sessizce atlanmaz', () => {
    const manifest = dm.oku() as { defterler: Array<{ ad: string }> }
    const r = ds.sayfaUret(manifest, (d) => {
      try {
        return fs.readFileSync(path.join(KOK, d), 'utf8')
      } catch {
        return null
      }
    }, '2026-11-09')
    expect(r.kartlar.map((k) => k.ad)).toEqual(manifest.defterler.map((d) => d.ad))
    for (const k of r.kartlar) expect(r.html, `${k.ad} kartı sayfada yok`).toContain(`<h2>${k.ad}</h2>`)
  })
})
