import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

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
 */

const KOK = join(__dirname, '..', '..', '..')
const CONFIG = join(KOK, 'next.config.mjs')

/** `/tr/products/<aile-slug>?sku=...` biçimi — aile sayfası + varyant seçimi. */
const AILE_HEDEFI = /^\/:lang\/products\/[a-z0-9-]+(\?sku=[A-Za-z0-9._-]+)?$/

type Kural = { source: string; destination: string }

/** `next.config.mjs`'ten ÜRÜN yönlendirmelerini çıkarır (kategori kuralları kapsam dışı). */
function urunYonlendirmeleri(): Kural[] {
  const metin = readFileSync(CONFIG, 'utf8')
  expect(metin.length, 'BOŞ EVREN: next.config.mjs okunamadı').toBeGreaterThan(1000)

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
  it('K1: BOŞ EVREN DEĞİL — en az bir ürün yönlendirmesi bulundu', () => {
    const kurallar = urunYonlendirmeleri()
    expect(
      kurallar.length,
      'next.config.mjs içinde HİÇ ürün yönlendirmesi bulunamadı — kapı boş evreni ölçüyor ' +
        '(desen değişmiş olabilir).',
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
})
