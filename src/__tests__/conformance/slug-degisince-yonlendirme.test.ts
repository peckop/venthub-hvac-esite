import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import tohumHam from '@/data/eski-adres-tohum.json'
import { eskiAdresEsle } from '@/lib/adres/eslestirici'
import { ESKI_ADRES_HARITASI } from '@/lib/adres/haritaKaynagi'
import { tohumDogrula } from '@/lib/adres/tohum'
import { modelAdresiCoz } from '@/utils/adresUret'

/**
 * INV-ESKI-SLUG-YONLENDIRME-1 — kalıcı ürün yönlendirmesinin hedefi VERİYE BAĞLI OLMAZ
 *
 * KORUNAN DEĞİŞMEZ:
 *   "`next.config.mjs` içindeki kalıcı (308) ürün yönlendirmelerinin hedefi, DB'deki bir
 *    varyant slug'ı DEĞİL, adlandırmadan bağımsız olan AİLE sayfasıdır."
 *
 * NİÇİN — AYNI HATA İKİ KEZ YAŞANDI, ÜÇÜNCÜSÜ OLMASIN:
 *
 *  1) K12 (2026-09-07, NIC-11921): kural hedefi YENİ VARYANT slug'ı yapıldı, gerekçesi
 *     "yeniden adlandırma aynı yayında olacak" varsayımıydı. Olmadı; kural veriden ÖNCE
 *     indi ve zincir `308 → 404`'e döndü. Merge öncesi ÇALIŞAN bir adres merge sonrası öldü.
 *
 *  2) REC-146 (2026-09-09, beş Vortice ürünü): Katalog `slug`u canlıda değiştirdi, beş eski
 *     adres anında **404** oldu (ölçüldü). Bu kez hedef doğrudan aile sayfası seçildi.
 *
 * ⭐SINIFIN ADI: `next.config` yönlendirmesi, uygulamanın VERİ-SÜRÜCÜLÜ çözümünden (
 * `resolveProductRoute` → `variantBySlug`) ÖNCE koşar. Bu yüzden hedefi bir varyant slug'ı
 * yapmak, kalıcı bir yönlendirmeyi geçici bir veriye bağlamaktır. Kalıcı (308) yanıt
 * tarayıcıda önbelleklenir: hedefi "yarın doğru olacak" değil, "bugün de yarın da doğru"
 * bir adres olmalıdır.
 *
 * BU KAPININ ÖLÇMEDİĞİ: yönlendirmenin canlıda gerçekten 308 verdiğini ölçmez — o,
 * merge sonrası canlı ölçümün işidir (kabul ölçütü PR gövdesinde). Burada ölçülen, HEDEFİN
 * BİÇİMİ; yani kuralın kendi içinde kırılgan olup olmadığı.
 *
 * FAZ 3-C (URN-85 2/2) — TAŞIYICI DEĞİŞTİ: altı Lineo çap adresi ve altı eski ürün adresi
 * `next.config.mjs`'ten KALKTI; tek taşıyıcıları eski adres haritasıdır (tohum → üretilmiş harita →
 * middleware; plan §6 satır 5/5b/8). Değişmez AYNI kalır, yeri değişti: bu dosya (1) `next.config`
 * tarafında K2/K3'ü (bir ürün kuralı geri gelirse kapı canlıdır — kör değil, K1 çıkarıcıyı sentetik
 * kuralla kanıtlar) ve (2) YENİ taşıyıcıda K4'ü (eski ürün/aile adresinin hedefi aile sayfası ya da
 * yayındaki modelin adresi; varyant slug'ı DEĞİL) ölçer.
 */

const KOK = join(__dirname, '..', '..', '..')
const CONFIG = join(KOK, 'next.config.mjs')

/** `/tr/products/<aile-slug>?sku=...` biçimi — aile sayfası + varyant seçimi. */
const AILE_HEDEFI = /^\/:lang\/products\/[a-z0-9-]+(\?sku=[A-Za-z0-9._-]+)?$/

/** Varyant slug'ı biçimi: sonu `-<4+ hane>` (ör. `…-6n090p-11921`); aile slug'ları böyle bitmez. */
const VARYANT_SLUG = /-\d{4,}$/

type Kural = { source: string; destination: string }

/**
 * Verilen `next.config` metninden ÜRÜN yönlendirmelerini çıkarır (kategori kuralları kapsam dışı).
 * `metin` verilmezse gerçek dosya okunur; sentetik metin çıkarıcının KÖR OLMADIĞINI kanıtlamak içindir (K1).
 */
function urunYonlendirmeleri(metin: string = readFileSync(CONFIG, 'utf8')): Kural[] {
  const kurallar: Kural[] = []
  // `source: '...'` ve onu izleyen `destination: '...'` çiftleri.
  const desen = /source:\s*'([^']+)'\s*,\s*destination:\s*'([^']+)'/g
  let m: RegExpExecArray | null
  while ((m = desen.exec(metin)) !== null) {
    const [, source, destination] = m
    if (source.includes('/products/')) kurallar.push({ source, destination })
  }
  return kurallar
}

describe('INV-ESKI-SLUG-YONLENDIRME-1 — kalıcı ürün yönlendirmesi veriye bağlanmaz', () => {
  it('K1: BOŞ EVREN DEĞİL — config okunabilir, çıkarıcı sentetik kuralı tanır; ürün yönlendirmesi en az bir taşıyıcıda var', () => {
    // (a) Dosya gerçekten okundu (boş/yanlış yol sessizce "kural yok" demesin).
    expect(readFileSync(CONFIG, 'utf8').length, 'BOŞ EVREN: next.config.mjs okunamadı').toBeGreaterThan(1000)

    // (b) Çıkarıcı AYIRT EDER: sentetik bir ürün kuralı bulunur, kategori kuralı bulunmaz. `next.config` bugün
    // ürün kuralı taşımasa da kapı kör değildir — bir kural geri eklenirse K2/K3 onu ölçer.
    const sentetik = `
      { source: '/:lang(tr|en)/products/eski-urun-12345', destination: '/:lang/products/yeni-aile?sku=ABC-1', permanent: true },
      { source: '/category/fanlar/:path*', destination: '/category/fans/:path*', permanent: true },
    `
    expect(urunYonlendirmeleri(sentetik)).toEqual([
      { source: '/:lang(tr|en)/products/eski-urun-12345', destination: '/:lang/products/yeni-aile?sku=ABC-1' },
    ])

    // (c) Evren boş olabilir ama TAŞIYICI boş olamaz: kurallar config'te kalmadıysa harita tohumunda durur.
    const tohum = tohumDogrula(tohumHam)
    const configKurallari = urunYonlendirmeleri()
    expect(
      configKurallari.length + tohum.urunler.length + tohum.aileler.length,
      'ürün yönlendirmesi HİÇBİR taşıyıcıda yok — kapı boş evreni ölçüyor (config boşaldı ve tohum da boş)',
    ).toBeGreaterThan(0)
  })

  it('K2: her ürün yönlendirmesinin hedefi AİLE sayfası biçiminde', () => {
    const ihlaller = urunYonlendirmeleri()
      .filter((k) => !AILE_HEDEFI.test(k.destination))
      .map((k) => `${k.source}  →  ${k.destination}`)

    expect(
      ihlaller,
      'Bir kalıcı ürün yönlendirmesinin hedefi aile sayfası biçiminde DEĞİL. Hedef bir ' +
        'varyant slug\'ı ise kural DB verisine bağlanmış olur; slug değişince aynı adres ' +
        '404\'e düşer (K12 2026-09-07 ve REC-146 2026-09-09, ikisi de sahada ölçüldü).\n' +
        ihlaller.join('\n'),
    ).toEqual([])
  })

  it('K3: hedef, kaynağın KENDİSİNE ya da başka bir yönlendirme kaynağına gitmiyor (döngü/zincir)', () => {
    const kurallar = urunYonlendirmeleri()
    const kaynakYollari = new Set(kurallar.map((k) => k.source.split('?')[0]))
    const zincirler = kurallar
      .filter((k) => kaynakYollari.has(k.destination.split('?')[0].replace('/:lang/', '/:lang(tr|en)/')))
      .map((k) => `${k.source}  →  ${k.destination}`)

    expect(
      zincirler,
      'Bir yönlendirmenin hedefi BAŞKA bir yönlendirmenin kaynağı — 308 zinciri doğar ve ' +
        'zincirin ikinci halkası kırılırsa ilk adres de ölür.\n' + zincirler.join('\n'),
    ).toEqual([])
  })

  it('K4: YENİ TAŞIYICI — eski ürün/aile adresinin hedefi AİLE sayfası ya da yayındaki modelin adresi (varyant slug\'ı DEĞİL)', () => {
    const tohum = tohumDogrula(tohumHam)
    const harita = ESKI_ADRES_HARITASI?.kiracilar[tohum.kiraci]
    if (!harita) throw new Error('eski adres haritası bağlı değil ya da tohumun kiracısı haritada yok (BOŞ EVREN)')
    expect(
      tohum.urunler.length + tohum.aileler.length,
      'BOŞ EVREN: tohumda eski ürün/aile adresi yok — kapı hiçbir şeyi ölçmüyor',
    ).toBeGreaterThan(0)

    const eskiSluglar = [...tohum.urunler.map((u) => u.eski), ...tohum.aileler.map((a) => a.eski)]
    const ihlaller: string[] = []
    for (const eski of eskiSluglar) {
      for (const dil of ['tr', 'en'] as const) {
        const yol = `/${dil}/products/${eski}`
        const sonuc = eskiAdresEsle(harita, { yol, sku: null, dilTespit: () => dil })
        if (!sonuc) {
          ihlaller.push(`${yol} → haritada YOK (404'e düşer)`)
          continue
        }
        if (sonuc.durum !== 308) ihlaller.push(`${yol} → ${sonuc.durum}: kalıcı (308) değil`)
        const m = sonuc.hedef.match(/^\/(?:tr\/urun|en\/products)\/([^/?#]+)$/)
        if (!m) {
          ihlaller.push(`${yol} → ${sonuc.hedef}: aile/model adresi biçiminde değil (sorgu ya da başka bölüm)`)
          continue
        }
        const parca = m[1]
        const model = modelAdresiCoz(parca)
        if (model) {
          // Yayındaki modelin kendi adresi: SKU haritada tanınmalı (yoksa hedef 404'tür).
          if (!(model.sku in harita.modeller)) ihlaller.push(`${yol} → ${sonuc.hedef}: model SKU'su haritada yok`)
        } else if (!harita.aileler.includes(parca)) {
          ihlaller.push(`${yol} → ${sonuc.hedef}: aile haritada yok`)
        } else if (VARYANT_SLUG.test(parca)) {
          ihlaller.push(`${yol} → ${sonuc.hedef}: aile slug'ı varyant slug biçiminde (-<4+ hane>)`)
        }
      }
    }

    expect(
      ihlaller,
      'Bir eski ürün/aile adresinin hedefi yaşayan bir aile sayfası ya da yayındaki modelin adresi DEĞİL. ' +
        'Kalıcı (308) hedef "bugün de yarın da doğru" olmalı (K12 2026-09-07, REC-146 2026-09-09).\n' +
        ihlaller.join('\n'),
    ).toEqual([])
  })
})
