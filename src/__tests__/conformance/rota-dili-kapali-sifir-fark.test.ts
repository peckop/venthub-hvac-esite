// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { rotaDiliYenidenYazimlari, rotaDiliYonlendirmeleri, zincirVarMi } from '../../config/rotaDili.mjs'

/**
 * INV-ROTA-DILI-KAPALI-1 — Kapı 1: anahtar KAPALIYKEN canlıda sıfır adres farkı (OPS-52 plan §3.1).
 *
 * `NEXT_PUBLIC_ADRES_DILI` yok ya da tam `1` dışında bir değerken `next.config.mjs`'in yayımladığı
 * yönlendirme ve başlık listesi, master'dan (9ea04a55d) bir kez alınıp commit'lenen FİKSTÜRLE derin
 * eşit olmalı; yeniden yazım listesi boş olmalı. Test yayındaki dosyayı aynen içe aktarır (kopya yok).
 *
 * DUYARLILIK KANITI: anahtar `1` iken çıktı fikstürden FARKLIDIR. Fikstür karşılaştırması ayırt
 * etmeseydi (örn. iki taraf da aynı boş listeyi okusaydı) kapalı kipteki yeşil hiçbir şey kanıtlamazdı.
 *
 * FİKSTÜRÜ YENİLEMEK: yalnız başka bir kapı bilerek adres değiştirdiğinde (örn. karar 92 listesi büyüdü).
 * Üretim: next.config.mjs'i anahtarsız içe aktar, `{ redirects: await redirects(), headers: await headers() }`
 * JSON'unu yaz. Rota dili satırı eklemek fikstürü DEĞİŞTİRMEZ (kapalı kipte hiçbir etkisi yok).
 */

const ANAHTAR = 'NEXT_PUBLIC_ADRES_DILI'
const FIKSTUR_YOLU = join(process.cwd(), 'src', '__tests__', 'conformance', 'fikstur', 'master-9ea04a55d-next-config.json')

type Kural = { source: string; destination: string; permanent?: boolean }
const FIKSTUR: { redirects: Kural[]; headers: unknown[] } = JSON.parse(readFileSync(FIKSTUR_YOLU, 'utf8'))

const ilkDeger = process.env[ANAHTAR]

afterEach(() => {
  if (ilkDeger === undefined) delete process.env[ANAHTAR]
  else process.env[ANAHTAR] = ilkDeger
})

/** Anahtarı ayarlayıp (`undefined` = tanımsız) next.config.mjs'i TAZE içe aktarır ve üç listeyi okur. */
async function yukle(anahtar: string | undefined) {
  if (anahtar === undefined) delete process.env[ANAHTAR]
  else process.env[ANAHTAR] = anahtar
  vi.resetModules()
  const { default: yapilandirma } = await import('../../../next.config.mjs')
  const rewrites = await yapilandirma.rewrites?.()
  const rewriteListesi = Array.isArray(rewrites) ? { beforeFiles: [], afterFiles: rewrites, fallback: [] } : rewrites
  return {
    redirects: (await yapilandirma.redirects?.()) ?? [],
    headers: (await yapilandirma.headers?.()) ?? [],
    beforeFiles: rewriteListesi?.beforeFiles ?? [],
    afterFiles: rewriteListesi?.afterFiles ?? [],
    fallback: rewriteListesi?.fallback ?? [],
  }
}

describe('INV-ROTA-DILI-KAPALI-1 — anahtar kapalı → canlıda sıfır adres farkı', () => {
  it('ÖN KOŞUL — fikstür dolu evren (boş evrende yeşil kapı ölçüm değildir)', () => {
    expect(FIKSTUR.redirects).toHaveLength(49)
    expect(FIKSTUR.headers).toHaveLength(3)
  })

  it.each([
    ['tanımsız', undefined],
    ['boş', ''],
    ['0', '0'],
    ['true', 'true'],
    ['TRUE', 'TRUE'],
    [' 1 (boşluklu)', ' 1 '],
    ['01', '01'],
  ])('anahtar %s → redirects + headers fikstürle DERİN EŞİT, yeniden yazım BOŞ', async (_ad, deger) => {
    const cikti = await yukle(deger)
    expect(cikti.redirects).toEqual(FIKSTUR.redirects)
    expect(cikti.headers).toEqual(FIKSTUR.headers)
    expect(cikti.beforeFiles).toEqual([])
    expect(cikti.afterFiles).toEqual([])
    expect(cikti.fallback).toEqual([])
  }, 60_000)

  it('⛔DUYARLILIK: anahtar tam "1" iken çıktı fikstürden FARKLI (karşılaştırma gerçekten ayırt ediyor)', async () => {
    const cikti = await yukle('1')
    expect(cikti.redirects).not.toEqual(FIKSTUR.redirects)
    // Fark yalnız SONA eklenen rota dili kuralları: önceki 49 satır bozulmaz.
    expect(cikti.redirects.slice(0, FIKSTUR.redirects.length)).toEqual(FIKSTUR.redirects)
    const fazla = cikti.redirects.slice(FIKSTUR.redirects.length)
    expect(fazla.length).toBeGreaterThan(0)
    expect(fazla).toEqual(rotaDiliYonlendirmeleri(true))
    expect(cikti.beforeFiles).toEqual(rotaDiliYenidenYazimlari(true))
    expect(cikti.beforeFiles.length).toBeGreaterThan(0)
    // Başlıklar anahtardan etkilenmez (noindex Aşama 2 başlığı bu işte değişmez).
    expect(cikti.headers).toEqual(FIKSTUR.headers)
  }, 60_000)

  it('açık kipte TÜM next.config yönlendirmeleri (49 mevcut + rota dili) tek hop: zincir/döngü yok', async () => {
    const cikti = await yukle('1')
    const bulgu = zincirVarMi(cikti.redirects)
    expect(bulgu, bulgu ? `${bulgu.kaynak.source} -> ${bulgu.kaynak.destination} sonra ${bulgu.hedef.source}` : '').toBeNull()
  }, 60_000)

  it('⛔SABOTAJ: kapalı kipte rota dili listesi eklenseydi fikstür karşılaştırması kırmızı yanardı', async () => {
    const cikti = await yukle(undefined)
    const sizinti = [...cikti.redirects, ...rotaDiliYonlendirmeleri(true)]
    expect(sizinti).not.toEqual(FIKSTUR.redirects)
  }, 60_000)
})
