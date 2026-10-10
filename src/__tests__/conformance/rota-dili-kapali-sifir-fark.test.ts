// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { k3bOku, markaYonlendirmeleri } from '../../config/markaYonlendirmeleri.mjs'
import {
  ROTA_DILI,
  rotaDiliHedefleriniYenile,
  rotaDiliYenidenYazimlari,
  rotaDiliYonlendirmeleri,
  zincirVarMi,
} from '../../config/rotaDili.mjs'

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
 *
 * YENİLEME KAYDI: OPS-51 (karar 264 + 265, 2026-10-05) casals ve flexiva marka 308'lerini bilerek kaldırdı
 * (tr/en × 2 = 4 satır); fikstürden yalnız bu dört kayıt çıktı (49 → 45), başka fark yok.
 *
 * FAZ 3-C (URN-85 2/2) — FİKSTÜR DOSYASI DEĞİŞMEDİ (master anlık görüntüsü kanıt olarak kalır); beklenen küme
 * ondan TÜRETİLİR: (1) config'ten BİLEREK kalkan 25 kural çıkarılır (13 dilsiz kategori + 6 Lineo çap + 6 eski
 * ürün; tek taşıyıcıları eski adres haritası — kapı: `src/lib/adres/__tests__/tohum.test.ts`,
 * `harita-3c-karsiliklari.test.ts`), (2) marka 308'leri bayrağa göre TEK üreticiden (`markaYonlendirmeleri`)
 * yerinde değiştirilir — hedef şeması bayrakla değişir, doğruluğunu `markaKaynagi.test.ts` ölçer. Bunun dışındaki
 * her fark (26. bir kuralın kalkması, sıra, hedef) KIRMIZIDIR; rota dili anahtarının sıfır fark sözleşmesi aynen durur.
 */

const ANAHTAR = 'NEXT_PUBLIC_ADRES_DILI'
const FIKSTUR_YOLU = join(process.cwd(), 'src', '__tests__', 'conformance', 'fikstur', 'master-9ea04a55d-next-config.json')

type Kural = { source: string; destination: string; permanent?: boolean }
const FIKSTUR: { redirects: Kural[]; headers: unknown[] } = JSON.parse(readFileSync(FIKSTUR_YOLU, 'utf8'))

/** `next.config.mjs`in okuduğu bayrak değeri — AYNI okuyucu (`k3bOku`), AYNI dosya: iki taraf ayrışamaz. */
const K3B = k3bOku(readFileSync(join(process.cwd(), 'src', 'config', 'features.ts'), 'utf8'))

/** Faz 3-C'de config'ten bilerek kalkan 25 kural (kaynak desenleri; kapı `tohum.test.ts`). */
const KALDIRILAN_3C: ReadonlySet<string> = new Set([
  // T162 — 6 Lineo çap adresi
  ...['100', '125', '150', '200', '250', '315'].map((cap) => `/:lang(tr|en)/products/vortice-lineo-${cap}-quiet`),
  // 13 dilsiz `/category/<eski-tr>/:path*` kuralı
  ...[
    'fanlar',
    'hava-perdeleri',
    'isi-geri-kazanim-cihazlari',
    'hava-temizleyiciler-anti-viral-urunler',
    'hiz-kontrolu-cihazlari',
    'aksesuarlar',
    'flexible-hava-kanallari',
    'nem-alma-cihazlari',
    'endustriyel-havalandirma',
    'ticari-havalandirma',
    'konut-tipi-havalandirma',
    'duman-egzoz-fanlari',
    'otopark-jet-fanlari',
  ].map((eski) => `/category/${eski}/:path*`),
  // K12 NIC-11921 + REC-146 beş Vortice — 6 eski ürün adresi
  ...[
    'dd-12-12-1500w-3f-4p-2v-6n090p-11921',
    'vortice-ca-il-4020-es-rect-16076',
    'vortice-ca-il-5035-es-rect-16077',
    'vortice-ca-il-6040-es-rect-16078',
    'vortice-ca-il-7050-es-rect-16079',
    'vortice-ca-il-8060-es-rect-16080',
  ].map((eski) => `/:lang(tr|en)/products/${eski}`),
])

/** Marka 308'leri (REC-374): hedefleri bayrağa göre kurulur → beklenen kümede üreticiden gelir. */
const MARKA_KAYNAGI = /^\/(tr|en)\/brands\//

/**
 * Anahtar KAPALIYKEN `next.config`in yayımlaması gereken yönlendirmeler: master fikstürü − bilerek kalkan 25 kural,
 * marka 308'leri yerinde bayrağa uygun üreticiyle değiştirilmiş. Sıra fikstürünkidir (sıra da sözleşmedir).
 */
function beklenenYonlendirmeler(): Kural[] {
  const markaKurallari: Kural[] = markaYonlendirmeleri(K3B)
  const sonuc: Kural[] = []
  let markaYazildi = false
  for (const kural of FIKSTUR.redirects) {
    if (KALDIRILAN_3C.has(kural.source)) continue
    if (MARKA_KAYNAGI.test(kural.source)) {
      if (!markaYazildi) {
        sonuc.push(...markaKurallari)
        markaYazildi = true
      }
      continue
    }
    sonuc.push(kural)
  }
  return sonuc
}
const BEKLENEN = beklenenYonlendirmeler()

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
    expect(FIKSTUR.redirects).toHaveLength(45)
    expect(FIKSTUR.headers).toHaveLength(3)
  })

  it('ÖN KOŞUL — Faz 3-C türetmesi: 25 kural fikstürde VAR (liste çürümez), marka kuralları bayrak kapalıyken fikstürle AYNI', () => {
    expect(KALDIRILAN_3C.size).toBe(25)
    const kaynaklar = new Set(FIKSTUR.redirects.map((k) => k.source))
    for (const kaynak of KALDIRILAN_3C) expect(kaynaklar.has(kaynak), `fikstürde yok: ${kaynak}`).toBe(true)
    // Bayrak KAPALI (master) üreticisi fikstürdeki marka kurallarının AYNISINI verir → yerinde değiştirme master'ı bozmaz.
    expect(markaYonlendirmeleri(false)).toEqual(FIKSTUR.redirects.filter((k) => MARKA_KAYNAGI.test(k.source)))
    // 45 − 25 kalkan − 2 marka (üreticiden yeniden gelir) + üreticinin bugünkü satırı.
    expect(BEKLENEN).toHaveLength(45 - 25 - 2 + markaYonlendirmeleri(K3B).length)
    expect(BEKLENEN.every((k) => !KALDIRILAN_3C.has(k.source))).toBe(true)
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
    expect(cikti.redirects).toEqual(BEKLENEN)
    expect(cikti.headers).toEqual(FIKSTUR.headers)
    expect(cikti.beforeFiles).toEqual([])
    expect(cikti.afterFiles).toEqual([])
    expect(cikti.fallback).toEqual([])
  }, 60_000)

  it('⛔DUYARLILIK: anahtar tam "1" iken çıktı fikstürden FARKLI (karşılaştırma gerçekten ayırt ediyor)', async () => {
    const cikti = await yukle('1')
    expect(cikti.redirects).not.toEqual(BEKLENEN)
    // Fark iki parçadır: (1) mevcut kuralların HEDEFLERİ tabloyla yenilenir (R4), (2) SONA rota dili kuralları eklenir.
    const yenilenmis = rotaDiliHedefleriniYenile(BEKLENEN, true, ROTA_DILI)
    expect(cikti.redirects.slice(0, yenilenmis.length)).toEqual(yenilenmis)
    const fazla = cikti.redirects.slice(yenilenmis.length)
    expect(fazla.length).toBeGreaterThan(0)
    expect(fazla).toEqual(rotaDiliYonlendirmeleri(true))
    // Yenileme yalnız hedefi tablodaki bir klasöre (urun-secici) giden kurallara dokunur; kaynaklar ve gerisi aynen.
    const degisenKaynaklar = new Set(
      BEKLENEN.filter((k) => !yenilenmis.some((y) => y.source === k.source && y.destination === k.destination)).map((k) => k.source),
    )
    for (const k of BEKLENEN) {
      const dokunuldu = degisenKaynaklar.has(k.source)
      expect(dokunuldu, k.source).toBe(/urun-secici/.test(k.destination))
    }
    expect(degisenKaynaklar.size).toBeGreaterThan(0)
    expect(cikti.beforeFiles).toEqual(rotaDiliYenidenYazimlari(true))
    expect(cikti.beforeFiles.length).toBeGreaterThan(0)
    // Başlıklar anahtardan etkilenmez (noindex Aşama 2 başlığı bu işte değişmez).
    expect(cikti.headers).toEqual(FIKSTUR.headers)
  }, 60_000)

  it('açık kipte TÜM next.config yönlendirmeleri (mevcut + rota dili) tek hop: zincir/döngü yok', async () => {
    const cikti = await yukle('1')
    const bulgu = zincirVarMi(cikti.redirects)
    expect(bulgu, bulgu ? `${bulgu.kaynak.source} -> ${bulgu.kaynak.destination} sonra ${bulgu.hedef.source}` : '').toBeNull()
  }, 60_000)

  it('⛔SABOTAJ: kapalı kipte rota dili listesi eklenseydi fikstür karşılaştırması kırmızı yanardı', async () => {
    const cikti = await yukle(undefined)
    const sizinti = [...cikti.redirects, ...rotaDiliYonlendirmeleri(true)]
    expect(sizinti).not.toEqual(BEKLENEN)
  }, 60_000)
})
