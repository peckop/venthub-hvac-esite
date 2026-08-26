import { readFileSync } from 'node:fs'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-DELIVERY-ONCE-1 — **teslimat e-postası tekilleştirilir ve kaydı TÜRÜYLE tutulur.**
 * (T118 · Ref REC-74 · 2026-08-26)
 *
 * NİÇİN VAR
 * ---------
 * Ölçüm (26 Ağustos, canlı DB): `delivery-notification` kaydını `shipping_email_events`'e
 * yazıyordu. O tablonun sütunları ölçüldü — `carrier`, `tracking_number` var ama **tür sütunu
 * yok**, durum/hata sütunu yok, tekillik kısıtı yok. Yani teslimat e-postası kargo biçimli bir
 * deftere, türü belirtilmeden düşüyordu ve "teslimat e-postası kaç kez gitti" sorusu ancak
 * `subject` metnine — i18n'e bağlı kırılgan bir vekile — bakarak cevaplanabiliyordu.
 *
 * Asıl tehlike sayım değil, MÜKERRER GÖNDERİMDİ. Bu ucu iki ayrı yol tetikliyor:
 *   (a) `orderStatusService.ts` — `delivered_at` damgası ilk yazıldığında (korumalıydı)
 *   (b) `shipping-webhook/index.ts` — taşıyıcı webhook'undan doğrudan (KORUMASIZDI)
 * Taşıyıcı "teslim edildi" derken admin de statüyü çevirirse müşteriye iki e-posta gidiyordu —
 * ve defter türü ayırt etmediği için bunu kimse göremiyordu. Görünmeyen kusur, olmayan kusur
 * gibi davranır.
 *
 * NİÇİN MIGRATION YOK
 * -------------------
 * Gereken tekillik prod'da ZATEN kurulu (canlı olarak `pg_index` üzerinden ölçüldü):
 *     uq_order_email_events_sent_once = UNIQUE (order_id, kind) WHERE status = 'sent'
 * Kısıt T137'de ödeme onayı için kurulmuştu; TÜR bazlı olduğu için teslimat bedavaya yararlanır.
 * Bu yüzden iş yeni tablo/sütun/indeks İSTEMEZ — yapılan tek şey doğru deftere yazmaktır.
 *
 * NİÇİN AST
 * ---------
 * Bu kapı KAYNAK tarar. Metin taraması yorumla tatmin olur: sabotaj gerçek çağrıyı silse bile
 * onu anlatan yorum satırı dosyada kalır ve düz `grep` yeşil döner — bu tuzağa filo daha önce
 * düştü. Bu yüzden aşağıdaki iddialar YORUMU değil, AST'deki gerçek `CallExpression`'ları sayar.
 */

const KAYNAK_YOLU = 'supabase/functions/delivery-notification/index.ts'
const kaynak = readFileSync(KAYNAK_YOLU, 'utf8')

const sf = ts.createSourceFile(KAYNAK_YOLU, kaynak, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

/** Dosyadaki tüm çağrıları (isim, konum) olarak toplar — yorumlar AST'de yoktur. */
function cagrilar(): { ad: string; pos: number }[] {
  const out: { ad: string; pos: number }[] = []
  const gez = (n: ts.Node): void => {
    if (ts.isCallExpression(n)) {
      const e = n.expression
      const ad = ts.isIdentifier(e) ? e.text : ts.isPropertyAccessExpression(e) ? e.name.text : ''
      if (ad) out.push({ ad, pos: n.getStart(sf) })
    }
    ts.forEachChild(n, gez)
  }
  ts.forEachChild(sf, gez)
  return out
}

const CAGRILAR = cagrilar()
const ilkCagri = (ad: string) => CAGRILAR.find((c) => c.ad === ad)?.pos ?? -1

describe('INV-DELIVERY-ONCE-1 — teslimat e-postası tekilleştirme', () => {
  it('KAPSAM KANARYASI: kaynak okundu ve AST gerçekten ayrıştı', () => {
    // Bu iddia olmazsa, dosya yolu bozulduğunda kaynak boş okunur ve ALTTAKİ HER ŞEY yeşil kalır.
    expect(kaynak.length, 'kaynak boş okundu — yol bozulmuş olabilir').toBeGreaterThan(2000)
    expect(CAGRILAR.length, 'AST hiç çağrı görmedi — ayrıştırma başarısız').toBeGreaterThan(20)
  })

  it('gönderimden ÖNCE "zaten gitti mi" diye SORAR (yorum değil, gerçek çağrı)', () => {
    const kapi = ilkCagri('alreadySent')
    const gonderim = CAGRILAR.find((c) => c.ad === 'fetch' && kaynak.slice(c.pos, c.pos + 200).includes('api.resend.com'))?.pos ?? -1

    expect(kapi, 'alreadySent ÇAĞRILMIYOR — kapı yalnız tanımlı, devrede değil').toBeGreaterThan(-1)
    expect(gonderim, 'resend gönderimi bulunamadı — dosya beklenenden farklı').toBeGreaterThan(-1)
    expect(kapi, 'tekilleştirme kapısı gönderimden SONRA çalışıyor — mükerrer e-postayı engellemez').toBeLessThan(gonderim)
  })

  it('deneme satırı gönderimden ÖNCE yazılır, sonuç SONRA damgalanır', () => {
    const deneme = ilkCagri('denemeYaz')
    const gonderim = CAGRILAR.find((c) => c.ad === 'fetch' && kaynak.slice(c.pos, c.pos + 200).includes('api.resend.com'))?.pos ?? -1
    const damga = ilkCagri('damgala')

    expect(deneme, 'deneme satırı yazılmıyor — gönderim kayıtsız kalır').toBeGreaterThan(-1)
    expect(deneme, 'deneme gönderimden sonra yazılıyor — çökerse "gitti mi" cevapsız kalır').toBeLessThan(gonderim)
    expect(damga, 'sonuç damgalanmıyor — satır sonsuza dek attempt kalır').toBeGreaterThan(gonderim)
  })

  it('defter order_email_events, tür delivery, ve başarısızlık YUTULMUYOR', () => {
    expect(kaynak, 'yeni defter kullanılmıyor').toContain('/rest/v1/order_email_events')
    expect(kaynak, "kind sabiti 'delivery' değil — tür ayrımı kaybolur").toMatch(/EMAIL_KIND\s*=\s*'delivery'/)
    expect(kaynak, "başarısız gönderim defterde 'failed' olarak damgalanmıyor").toMatch(/damgala\([^)]*'failed'/)
    expect(kaynak, "başarılı gönderim defterde 'sent' olarak damgalanmıyor").toMatch(/damgala\([^)]*'sent'/)
  })

  it('kargo defteri KALDIRILMADI — iki defter ayrı soruyu cevaplar', () => {
    // Plan bunu açıkça taahhüt etti: carrier/tracking_number alanları shipping defterinde anlamlı.
    // Kapı taahhüdü kilitler ki "temizlik" adına sessizce silinmesin.
    expect(kaynak, 'shipping_email_events yazımı kaldırılmış — kargo alanları kayboldu').toContain('/rest/v1/shipping_email_events')
  })
})
