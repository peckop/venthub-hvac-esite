/**
 * INV-KART-OLCUM-1 — kart sınıfına göre zorunlu ÖLÇÜM satırı kural verisi (HRT-78, ARC-216 B kolu isteği).
 * Veri: scripts/belge/kart-sinif-olcum.json; değerlendirici: kart-plan-kapisi.cjs olcumEksikleri().
 * Ölçtüğü: sınıf tanıma (etiket ya da yalnız başlık), satır biçimi, PLAN başlığı İSTEMEDİĞİ ve verinin
 * rol-gorevleri.json'daki kart-kapisi görevleriyle bağlantısı. Kanban verisine dokunmaz.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

type Sinif = { ad: string; rol: string; gorevBasi: string; etiket: string; baslikKalibi: string | null; ne: string }
type Veri = { satirBicimi: string; asgariSonucKarakter: number; siniflar: Sinif[] }
type Modul = { olcumEksikleri: (k: { baslik?: string; aciklama?: string; etiketler?: string[] }, v?: Veri) => string[] }

const KOK = spawnSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim()
const require = createRequire(import.meta.url)
const K = require(path.join(KOK, 'scripts/belge/kart-plan-kapisi.cjs')) as Modul
const veri = JSON.parse(fs.readFileSync(path.join(KOK, 'scripts/belge/kart-sinif-olcum.json'), 'utf8')) as Veri
const gorevler = JSON.parse(fs.readFileSync(path.join(KOK, 'scripts/belge/rol-gorevleri.json'), 'utf8')) as {
  roller: Record<string, { gorevler?: { gorev: string; tetik: string }[] }>
}

describe('INV-KART-OLCUM-1: kart sınıfı ölçüm satırı', () => {
  it('tanınmayan kart sessiz kalır, PLAN başlığı şart değildir (ARC-220 gürültüsü geri gelmez)', () => {
    expect(K.olcumEksikleri({ baslik: 'HRT-1 · belge düzeni', aciklama: 'KAYNAK/CETVEL: x\nYÖNTEM: elle' })).toEqual([])
    expect(K.olcumEksikleri({})).toEqual([])
  })

  it('etiketle tanınan kartta satır yoksa eksik verir, satır varsa geçer', () => {
    const k = { baslik: 'URN-9 · liste', etiketler: ['olcum-yayin-oncesi'] }
    expect(K.olcumEksikleri({ ...k, aciklama: 'PLAN yok' }).join('\n')).toMatch(/ÖLÇÜM: yayin-oncesi satırı yok/)
    expect(K.olcumEksikleri({ ...k, aciklama: 'ÖLÇÜM: yayin-oncesi — taban 120 adres, ön izleme koşusu temiz' })).toEqual([])
    expect(K.olcumEksikleri({ ...k, aciklama: '- **ÖLÇÜM:** yayin-oncesi - gerekmez: yalnız metin düzeltmesi' })).toEqual([])
  })

  it('çok kısa sonuç ve başka sınıfın satırı eksik sayılır', () => {
    const k = { baslik: 'x', etiketler: ['olcum-yazim-sonrasi'] }
    expect(K.olcumEksikleri({ ...k, aciklama: 'ÖLÇÜM: yazim-sonrasi — tamam' }).join('\n')).toMatch(/çok kısa/)
    expect(K.olcumEksikleri({ ...k, aciklama: 'ÖLÇÜM: kare-kabul — ekran kareyle aynı ölçüldü' }).join('\n')).toMatch(/yazim-sonrasi satırı yok/)
  })

  it('dar sınıflar yalnız BAŞLIKTA tanınır; açıklamada geçen sözcük tetiklemez', () => {
    expect(K.olcumEksikleri({ baslik: 'TSR-3 · ekran kare kabul ölçümü', aciklama: '' }).join('\n')).toMatch(/kare-kabul/)
    expect(K.olcumEksikleri({ baslik: 'HRT-9 · cetvel düzeni', aciklama: 'bu kart kare kabul ve canlı adres matrisi kuralını anar' })).toEqual([])
    expect(K.olcumEksikleri({ baslik: 'ALT-1 · Canlı adres matrisi koş', aciklama: '' }).join('\n')).toMatch(/adres-matrisi/)
  })

  it('geniş sınıflar (yayin-oncesi, yazim-sonrasi) başlık sözcüğüyle tetiklenmez, yalnız etiketle', () => {
    for (const s of veri.siniflar.filter((x) => x.baslikKalibi === null)) {
      expect(K.olcumEksikleri({ baslik: `${s.ad} canlı yazım site haritası adres ağacı`, aciklama: '' }), s.ad).toEqual([])
      expect(K.olcumEksikleri({ baslik: 'x', aciklama: '', etiketler: [s.etiket] }).length, s.ad).toBe(1)
    }
  })

  it('her sınıf rol-gorevleri.json içinde o rolün kart-kapisi görevine bağlıdır ve etiketi sınıf adıyla eşleşir', () => {
    expect(new Set(veri.siniflar.map((s) => s.ad)).size).toBe(veri.siniflar.length)
    for (const s of veri.siniflar) {
      expect(s.etiket, s.ad).toBe(`olcum-${s.ad}`)
      const g = (gorevler.roller[s.rol]?.gorevler ?? []).find((x) => x.gorev.startsWith(s.gorevBasi))
      expect(g, `${s.rol}: "${s.gorevBasi}" görevi`).toBeTruthy()
      expect(g?.tetik, s.ad).toBe('kart-kapisi')
      if (s.baslikKalibi !== null) expect(() => new RegExp(s.baslikKalibi as string), s.ad).not.toThrow()
    }
  })
})
