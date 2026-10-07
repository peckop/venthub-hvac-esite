/**
 * ÖDEME ↔ SİPARİŞ EŞLEŞMESİ — VULN-001'in kapısı (REC-355).
 *
 * NİÇİN VAR
 * =========
 * `iyzico-callback`, İyzico'ya *"bu fiş geçerli mi"* diye soruyor, `SUCCESS` cevabını alıyor
 * ve **isteğin yanında gelen `orderId`'yi** ödenmiş işaretliyor. Fişin HANGİ siparişe ait
 * olduğunu hiç sormuyor. Saldırgan kendi 1 TL'lik ödemesinin fişini alıp başka bir sipariş
 * numarasıyla POST eder ve o siparişi ödenmiş yapar.
 *
 * ⭐ÇAPA NİÇİN `basketId` — VE NİÇİN `conversationId` DEĞİL
 * ========================================================
 * İlk tasarımım `conversationId`'yi çapa yapmıştı ve **totolojiydi**: uç, İSTEĞİN verdiği
 * `conversationId`'yi `retrieve` isteğine koyuyor, İyzico onu yanıtta geri veriyor, kapı da
 * o yansımayı siparişin kendi değeriyle karşılaştırıyordu. Saldırgan kurbanın
 * `conversation_id`'sini de verirse kapı AÇILIR.
 *
 * Ölçümle kanıtlandı (`docs/archive/db-backup-pre-kademe2/venthub_orders.json`, 13 gerçek
 * yanıt): `conversationId` gönderilen 11 koşumda yanıtta VAR, gönderilmeyen 2 koşumda
 * HİÇ YOK. Yani İyzico kendi kayıtlı değerini döndürmüyor, bizim verdiğimizi YANSITIYOR.
 *
 * `basketId` farklı: `iyzico-callback` onu isteğe HİÇ koymuyor (ölçüldü: dosyada `basketId`
 * geçmiyor). Dolayısıyla yanıttaki `basketId`, İyzico'nun O TOKEN için kendi tuttuğu
 * değerdir — saldırganın dokunamadığı tek kimlik alanı.
 *
 * ⭐İKİ BİÇİM, İKİSİ DE ÖLÇÜLDÜ
 * =============================
 * `iyzico-payment` bugün İyzico'ya `basketId` olarak `VH-<epoch-ms>-<rnd6>` gönderiyor ve bu
 * dize **hiçbir kolona yazılmıyor** — siparişin `id`si ayrı bir UUID. Ölçüm: `basketId`,
 * `id` ya da `order_number` ile **0/13** eşleşiyor. Yani "basketId'yi id ile karşılaştır"
 * demek tek başına ÇALIŞMAZ.
 *
 * Ama aynı ölçüm bir bağ buldu: `conversation_id` = `CONV-<epoch-ms>` ve `basketId` =
 * `VH-<AYNI epoch-ms>-<rnd>`. İkisi de ödeme kurulurken aynı `Date.now()` çağrısından
 * doğuyor. **Epoch bağı 13/13 tuttu.** Bu yüzden iki biçim desteklenir:
 *
 *   · BİÇİM A (yeni): `basketId` siparişin `id`si — doğrudan eşitlik.
 *   · BİÇİM B (miras): `basketId`in epoch'u, `conversation_id`in epoch'u ile aynı.
 *
 * Biçim A, `iyzico-payment` düzeltildikten sonra üretilen siparişler için geçerli olacak.
 * Biçim B, bugün canlıda duran bütün siparişler için çalışıyor. ⚠Geçiş penceresi
 * DÜŞMÜYOR: iki biçim aynı anda kabul edilir.
 *
 * ⚠BİÇİM B'NİN SINIRI ADIYLA: `Date.now()` aynı milisaniyede iki sipariş üretirse epoch
 * çakışır. Bu yüzden biçim B tek başına yeterli sayılmaz — TUTAR kapısı da geçilmek
 * zorundadır. Biçim A'da böyle bir çakışma yok (UUID).
 *
 * ⭐TUTAR ÇAPASI `price`, `paidPrice` DEĞİL
 * =========================================
 * `iyzico-payment`in kendi yorumu şunu yazıyor: *"price == basketItems toplamı olmalı,
 * paidPrice >= price olabilir"*. Taksit açık (`[1,2,3,6,9,12]`), yani vade farkı müşteriye
 * yansıyan bir kurulumda `paidPrice > price` olur. `paidPrice`i sipariş toplamıyla
 * karşılaştıran bir kapı **gerçek taksitli ödemeyi reddeder.**
 *
 * Bu yüzden: `price == total_amount` (tam eşitlik) ve `paidPrice >= price`.
 * ⚠Tam eşitlik TAHMİN DEĞİL: iki değer aynı formülün aynı girdilerle iki kez koşumu
 * (`order-validate` kuruş bazında toplayıp /100 veriyor; `iyzico-payment` aynı kalemler
 * üzerinde aynı hesabı yineliyor). Ölçüm: 13/13 birebir. Tolerans EKLENMEDİ, çünkü
 * toleransın gerekçesi ölçümle çürüdü.
 *
 * ⚠KUPON BAĞIMLILIĞI, ADIYLA: kupon indirimi bugün ödemeden SONRA ayrı kolona yazılıyor,
 * `total_amount` düşürülmüyor — eşitlik bu yüzden tutuyor. Kupon tahsilata yansıtıldığı gün
 * bu kapı kuponlu her ödemeyi reddeder ve o gün kıyas `total_amount - coupon_discount`
 * olmalıdır. Bu satır o günü hatırlatmak için var.
 *
 * ⛔İMZA DOĞRULAMASI BU DOSYADA YOK — VE SEBEBİ BORÇ OLARAK YAZILDI
 * ================================================================
 * `CLAUDE.md` kural 11 webhook'lar için HMAC istiyor ve İyzico kendi imzasını 13/13 yanıtta
 * GÖNDERİYOR (`signature`). Doğru olan onu doğrulamaktır. Ama doğrulama gizli anahtar
 * gerektiriyor ve anahtar bu makinede YOK (ölçüldü: iki `.env` dosyasında da
 * `IYZICO_SECRET_KEY` satırı 0). ⭐Doğrulayamadığım bir kriptografik kontrolü koda yazmam:
 * "yazdım ama sınamadım" bir kapı değil, kapı GÖRÜNTÜSÜDÜR.
 * Bu eksik REC-355 kaydında ADIYLA duruyor; kapatılması ayrı iştir.
 * ⭐Ve bu dosyanın çapası imzaya BAĞLI DEĞİL: `basketId` isteğe hiç konmadığı için imza
 * olmadan da saldırganın erişemediği bir değerdir.
 */

/** Siparişten gereken alanlar — çağıran bunları TEK sorguda çeker. */
export type SiparisSatiri = {
  id?: string | null
  conversation_id?: string | null
  total_amount?: number | string | null
  currency?: string | null
  payment_status?: string | null
}

/**
 * İyzico `checkoutForm.retrieve` yanıtından gereken alanlar.
 *
 * ⭐`conversationId` ve `signature` BİLEREK burada DURUYOR ama KULLANILMIYOR. Tipte
 * görünmeleri kasıtlı: ikisi de gerçek yanıtta var (`conversationId` 11/13, `signature`
 * 13/13) ve ikisinin de niçin çapa yapılmadığı dosya başlığında yazılı. Tipten silmek,
 * bir sonraki okuyucunun "bunlar hiç yok" sanmasına yol açar.
 */
export type OdemeSonucu = {
  basketId?: unknown
  price?: unknown
  paidPrice?: unknown
  currency?: unknown
  paymentId?: unknown
  /** ⛔ÇAPA OLARAK KULLANILMAZ — isteğin yansıması (totoloji). Bkz. dosya başlığı. */
  conversationId?: unknown
  /** ⛔HENÜZ DOĞRULANMIYOR — gizli anahtar bu makinede yok; borç REC-355'te adıyla. */
  signature?: unknown
}

export type EslesmeKarari = {
  /** true ise ödeme bu siparişe yazılabilir. */
  gecti: boolean
  /** Hangi biçimle eşleşti — denetim izi için. */
  bicim: 'id' | 'epoch' | null
  /**
   * Geçmediyse NİÇİN geçmediği. ⭐Değerler DEĞİL, yalnız hangi alanın uymadığı yazılır:
   * bu metin log'a ve alarm kaydına gidiyor, tutar/kimlik dökmek denetim izini sır taşıyıcı
   * yapar.
   */
  sebep: string | null
}

const EPOCH_BASKET = /^VH-(\d{10,})-/
const EPOCH_CONV = /^CONV-(\d{10,})$/

function sayi(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * Ödeme sonucu ile sipariş satırının AYNI işe ait olup olmadığına karar verir.
 *
 * ⭐FAIL-CLOSED: karar verilemiyorsa `gecti: false`. Eksik alan "atla" değil "geçmedi"dir —
 * yoksa kapı, alanın yokluğunda kendiliğinden açılır ve saldırgan alanı düşürerek geçer.
 *
 * ⚠Bu fonksiyon HİÇBİR ŞEY YAZMAZ ve ağa çıkmaz; saf karar. Sebebi test edilebilirlik:
 * 13 gerçek arşiv yanıtı üzerinde çevrimdışı koşturulabiliyor.
 */
export function odemeSiparisleEslesiyorMu(
  sonuc: OdemeSonucu | null,
  satir: SiparisSatiri | null,
): EslesmeKarari {
  if (!sonuc) return { gecti: false, bicim: null, sebep: 'odeme_sonucu_yok' }
  if (!satir) return { gecti: false, bicim: null, sebep: 'siparis_satiri_yok' }

  const basketId = typeof sonuc.basketId === 'string' ? sonuc.basketId : null
  if (!basketId) return { gecti: false, bicim: null, sebep: 'basketId_yok' }

  // ── KİMLİK ──────────────────────────────────────────────────────────────────
  let bicim: 'id' | 'epoch' | null = null

  if (satir.id && basketId === satir.id) {
    bicim = 'id'
  } else {
    const b = EPOCH_BASKET.exec(basketId)
    const c = EPOCH_CONV.exec(String(satir.conversation_id ?? ''))
    if (b && c && b[1] === c[1]) bicim = 'epoch'
  }

  if (!bicim) return { gecti: false, bicim: null, sebep: 'kimlik_eslesmedi' }

  // ── TUTAR ───────────────────────────────────────────────────────────────────
  // Biçim A'da da koşar: kimlik tuttuğu hâlde tutar tutmuyorsa yazmak yanlıştır.
  const price = sayi(sonuc.price)
  const paid = sayi(sonuc.paidPrice)
  const total = sayi(satir.total_amount)

  if (price === null) return { gecti: false, bicim, sebep: 'price_okunamadi' }
  if (total === null) return { gecti: false, bicim, sebep: 'siparis_tutari_okunamadi' }
  if (price !== total) return { gecti: false, bicim, sebep: 'tutar_eslesmedi' }

  // `paidPrice >= price` — taksitte vade farkı yukarı doğru olabilir, aşağı doğru OLAMAZ.
  if (paid === null) return { gecti: false, bicim, sebep: 'paidPrice_okunamadi' }
  if (paid < price) return { gecti: false, bicim, sebep: 'paidPrice_price_altinda' }

  // ── PARA BİRİMİ ─────────────────────────────────────────────────────────────
  // İşlem para birimi daima TRY (pricing-standard 4.1). Alan varsa ölçülür; yoksa
  // bu tek başına red sebebi değil — çünkü kimlik ve tutar zaten geçildi ve ölçümde
  // alanın 13/13 geldiği görüldü, yani yokluğu bir BİÇİM DEĞİŞİKLİĞİ işaretidir,
  // saldırı işareti değil. ⚠Uyuşmazlık ise reddedilir.
  const cur = typeof sonuc.currency === 'string' ? sonuc.currency.toUpperCase() : null
  if (cur && cur !== 'TRY') return { gecti: false, bicim, sebep: 'para_birimi_eslesmedi' }
  const satirCur = typeof satir.currency === 'string' ? satir.currency.toUpperCase() : null
  if (cur && satirCur && cur !== satirCur) {
    return { gecti: false, bicim, sebep: 'para_birimi_siparisle_eslesmedi' }
  }

  return { gecti: true, bicim, sebep: null }
}
