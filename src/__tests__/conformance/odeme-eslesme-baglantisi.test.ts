import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-PAY-ESLESME-2 — VULN-001 onarımının UCA BAĞLANMIŞ olduğunu ölçer (REC-355).
 *
 * ⭐NİÇİN İKİNCİ BİR KAPI: `_shared/__tests__/odeme_eslesme.test.ts` kararın DOĞRU
 * olduğunu ölçüyor (13 gerçek yanıt üzerinde). Ama doğru bir karar fonksiyonu,
 * ÇAĞRILMADIĞI sürece hiçbir şeyi korumaz. Bu dosya bağlantıyı ölçer:
 * çağrılıyor mu, doğru yere mi konmuş, ve kaldırılan tuzaklar geri gelmiş mi.
 *
 * ⚠YASAKLI DESEN KENDİ YORUMUNDA TRİPLER: bu dosya "şu satır geri gelmesin" diye
 * ölçüyor ve o satırı yorumda anmak zorunda. Ölçüm KOD üzerinde yapılır, yorum
 * satırları atılarak — aynı tuzağa 2026-09-16'da üç kez düşüldü.
 */

const KOK = process.cwd()
const CB = resolve(KOK, 'supabase/functions/iyzico-callback/index.ts')
const HK = resolve(KOK, 'supabase/functions/order-housekeeping/index.ts')
const KARAR = resolve(KOK, 'supabase/functions/_shared/odeme_eslesme.ts')

const oku = (p: string): string => readFileSync(p, 'utf8')

/** Yorum satırlarını atar. Yasaklı desen ölçümü YALNIZ kodda yapılır. */
function kodu(p: string): string {
  return oku(p)
    .split('\n')
    .filter((l) => {
      const t = l.trim()
      return !t.startsWith('*') && !t.startsWith('//') && !t.startsWith('/*')
    })
    .join('\n')
}

describe('INV-PAY-ESLESME-2 — karar modülü uca BAĞLI', () => {
  it('karar modülü VAR', () => {
    expect(oku(KARAR).length).toBeGreaterThan(1000)
  })

  it('callback karar modülünü IMPORT ediyor', () => {
    expect(kodu(CB)).toMatch(/import\s*\{[^}]*odemeSiparisleEslesiyorMu[^}]*\}\s*from\s*'\.\.\/_shared\/odeme_eslesme\.ts'/)
  })

  it('callback karar fonksiyonunu GERÇEKTEN ÇAĞIRIYOR (import yetmez)', () => {
    expect(kodu(CB)).toMatch(/odemeSiparisleEslesiyorMu\s*\(/)
  })

  it('⭐`paid` kararı eşleşmeyi İÇERİYOR — tek soruya geri dönülemez', () => {
    // Eski hâl: paid = paymentStatus === SUCCESS. Onarımın tamamı bu tek satırda yaşıyor:
    // aşağıdaki bütün yazım dalları `paid`e bakıyor.
    const k = kodu(CB)
    expect(k).toMatch(/const paid = odemeBasarili && eslesme\.gecti/)
  })
})

describe('INV-PAY-ESLESME-2 — kaldırılan tuzaklar geri GELMEMİŞ', () => {
  it('⛔isteğin `conversationId` değeri retrieve isteğine KONMUYOR (totoloji)', () => {
    // İyzico bu alanı kendi kaydından döndürmüyor, gönderileni YANSITIYOR (ölçüm:
    // gönderilen 11 koşumda var, gönderilmeyen 2 koşumda yok). Geri eklenirse kapı
    // kendi kendini onaylar.
    const k = kodu(CB)
    expect(k).not.toMatch(/retrieveReq\.conversationId\s*=/)
    expect(k).toMatch(/const retrieveReq:\s*\{\s*locale:\s*string;\s*token:\s*string\s*\}/)
  })

  it('⛔`payment_token`, doğrulamadan ÖNCE yazılmıyor', () => {
    // Erken yazım saldırganın herhangi bir siparişe istediği token'ı damgalamasına
    // izin veriyordu. Artık yalnız doğrulanmış yolda, `paid` dalında yazılıyor.
    const k = kodu(CB)
    const eslesmeSatiri = k.indexOf('odemeSiparisleEslesiyorMu(')
    expect(eslesmeSatiri).toBeGreaterThan(0)
    // `payment_token` yazan her yer eşleşme kararından SONRA olmalı.
    const yazimlar: number[] = []
    const desen = /payment_token:\s*token/g
    let m: RegExpExecArray | null
    while ((m = desen.exec(k)) !== null) yazimlar.push(m.index)
    expect(yazimlar.length, 'payment_token hic yazilmiyor — denetim izi kayboldu').toBeGreaterThan(0)
    for (const y of yazimlar) {
      expect(y, 'payment_token DOGRULAMADAN ONCE yaziliyor').toBeGreaterThan(eslesmeSatiri)
    }
  })

  it('⛔eşleşmeyen ödemede siparişe `failed` YAZILMIYOR', () => {
    // Bu dalın açıkça var olması şart: örtük korunma, biri koşulu sadeleştirdiğinde
    // saldırganın istediği siparişi "ödeme başarısız" damgalamasına yol açar.
    const k = kodu(CB)
    expect(k).toMatch(/odemeBasarili && !eslesme\.gecti/)
  })
})

describe('INV-PAY-ESLESME-2 — hata yolu OKUYAN tarafla birlikte yazılmış', () => {
  it('callback üçüncü cevap değerini DÖNDÜRÜYOR', () => {
    expect(kodu(CB)).toMatch(/needs_review/)
  })

  it('⭐order-housekeeping o değeri SONLANDIRMA sebebi SAYMIYOR', () => {
    // ⚠BU KOL BİR GELİR KAYBI YOLUNU KİLİTLER. Bu uç, callback'i yalnız {orderId} ile
    // çağırıyor ve cevap 'success' değilse siparişi cancelled + payment_status=failed
    // yapıyor. Eşleşmeyen ödemede para çekilmiş olabilir; iptal etmek geliri keser.
    const k = kodu(HK)
    const i = k.indexOf("needs_review")
    expect(i, 'order-housekeeping ucuncu degeri HIC TANIMIYOR').toBeGreaterThan(0)
    // ⚠PENCERE DALIN KENDİSİ KADAR: ilk hâlde sabit 900 karakter okunuyordu ve pencere
    // SONRAKİ `else` dalına taşıyordu; orada `sonlandir = true` meşru olarak duruyor ve
    // kol yanlış yere kırmızı verdi. Ölçülen şey "bu dalın gövdesi" olmalı, "bu dalın
    // civarı" değil. ⭐Kapıyı gevşetmedim, PENCEREYİ düzelttim — ikisi aynı şey değil.
    const sonrasi = k.slice(i)
    const dalSonu = sonrasi.indexOf('} else')
    expect(dalSonu, 'dal sonu bulunamadi — pencere olculemedi').toBeGreaterThan(0)
    const dal = sonrasi.slice(0, dalSonu)
    expect(dal).not.toMatch(/sonlandir\s*=\s*true/)
    // Ve dalın gerçekten bir şey YAPTIĞI ölçülür: boş bir dal da bu kolu geçerdi.
    expect(dal).toMatch(/incelemeBekleyen\.push/)
  })

  it('sonlandırılmayan sipariş SESSİZ kalmıyor — raporda ayrı kova var', () => {
    const k = kodu(HK)
    expect(k).toMatch(/incelemeBekleyen/)
    expect(k).toMatch(/inceleme_bekleyen:/)
  })

  it('⭐RAPORA YAZMAK YETMEZ — kova doluysa KALICI bir yere de yazılıyor', () => {
    // Akran bulgusu: `inceleme_bekleyen` gövdeye konuldu ama gövdeyi bir cron çağırıyor
    // ve kimse okumuyor. Eşleşmeyen ödeme artık otomatik iptal edilmediği için sipariş
    // `pending` durumunda sonsuza kadar kalabilir — para çekilmiş, kimse görmemiş.
    // Eski hâlin bir faydası vardı: bir SONUÇ üretirdi. Yeni hâl doğru ama sessiz.
    const k = kodu(HK)
    expect(k).toMatch(/raiseRevenueAlarm/)
    expect(k).toMatch(/PAYMENT_NEEDS_REVIEW_BEKLIYOR/)
    // Ve alarm yalnız kova DOLUYSA atılmalı — her koşumda atan bir alarm okunmaz olur.
    expect(k).toMatch(/incelemeBekleyen\.length > 0/)
  })

  it('eşleşmeyen ödeme ALARMA yazılıyor (sessiz değil)', () => {
    const k = kodu(CB)
    expect(k).toMatch(/raiseRevenueAlarm/)
    expect(k).toMatch(/PAYMENT_ORDER_MISMATCH/)
  })

  it('⭐alarm kaydı DEĞER dökmüyor — denetim izi sır taşıyıcı olmaz', () => {
    const k = kodu(CB)
    const i = k.indexOf('PAYMENT_ORDER_MISMATCH')
    const blok = k.slice(Math.max(0, i - 200), i + 700)
    // Tutar, token ve basketId alanlarının DEĞERİ alarma konmamalı.
    expect(blok).not.toMatch(/total_amount:/)
    expect(blok).not.toMatch(/token:/)
    expect(blok).not.toMatch(/basketId:/)
  })
})

describe('INV-PAY-ESLESME-2 — müşteri yüzü', () => {
  it('eşleşmeyen ödemede müşteriye `failure` GÖNDERİLMİYOR', () => {
    // Parası çekilmiş müşteri hata ekranı görürse ikinci kez öder.
    const k = kodu(CB)
    const i = k.indexOf("searchParams.set(")
    expect(i).toBeGreaterThan(0)
    expect(k).toMatch(/\?\s*'needs_review'\s*:\s*'failure'/)
  })
})

describe('INV-PAY-ESLESME-2 — ölçüm evreni kaybolmamış', () => {
  it('13 gerçek yanıtı taşıyan arşiv dosyası YERİNDE', () => {
    // ⭐Bu kol bir BAĞIMLILIK ilanı: karar testi bu dosyayı okuyor. Dosya taşınırsa
    // o test 0 vakayla sessizce geçebilir; burada yokluğu KIRMIZI verir.
    const p = resolve(KOK, 'docs/archive/db-backup-pre-kademe2/venthub_orders.json')
    const rows = JSON.parse(readFileSync(p, 'utf8')) as Array<{ payment_debug?: { raw?: unknown } }>
    expect(rows.filter((r) => r.payment_debug?.raw).length).toBe(13)
  })
})
