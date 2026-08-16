import { isValidTckn, isValidVkn } from './taxIdentity'

/**
 * Fatura kimliği kuralı — mevzuata bağlı, EŞİKLİ.
 * Cetvel: `docs/standards/legal-compliance-standard.md` §4.
 *
 * NİÇİN SAF FONKSİYON: kural mevzuattan geliyor ve yılda bir değişiyor (had her yıl
 * tebliğle güncelleniyor). Hook'un içine gömülü bir `if` zinciri test edilemez ve
 * değiştiğinde kimse fark etmez. Karar burada, yan etki (toast) çağıranda.
 *
 * ── MEVZUAT (2026-08-16'da araştırıldı) ────────────────────────────────────────
 * TCKN, nihai tüketiciye e-arşiv faturası kesmek için **koşulsuz zorunlu DEĞİLDİR**.
 * GİB, tüketici numarasını vermek istemediğinde alıcı kimlik alanına `11111111111`
 * yazılmasını kabul eder. Zorunluluk tutara bağlıdır:
 *
 *   • ≤ 500 TL                → ad bile yazılmayabilir ("NİHAİ TÜKETİCİ", 515 SN VUK GT)
 *   • 500 TL – fatura haddi   → ad-soyad + adres zorunlu, TCKN zorunlu DEĞİL
 *   • fatura haddinin ÜSTÜ    → ad-soyad **ve TCKN zorunlu** (509 SN VUK GT asgari bilgiler)
 *
 * 2026 fatura düzenleme haddi: 12.000 TL (588 SN VUK GT). Bu yüzden eşik koda değil
 * `legal.ts → invoiceIdentityThreshold` alanına yazılıdır — muhasebeci düzelttiğinde
 * tek satır değişir.
 *
 * Ayrıca 2026'dan itibaren, nihai tüketiciye e-arşiv faturası için TUTAR SINIRI
 * KALDIRILDI: satış kaç TL olursa olsun fatura zorunludur. Yani bu eşik "fatura kesilir mi"
 * sorusunun değil, "alıcı kimliği zorunlu mu" sorusunun eşiğidir. İkisi karıştırılmasın.
 *
 * ⚠️ TUZAK: `isValidTckn`, `11111111111`'i REDDEDER. Bu, **müşteri girdisi** için doğrudur
 * (biz numarayı doğrudan kişiden istiyoruz). Ama GİB'in kendi dolgu değeri de odur —
 * bu fonksiyonu ya da `isValidTckn`'i **giden fatura verisine** uygulayan biri, GİB'in
 * kabul ettiği değeri reddetmiş olur. Fatura üretimi yazıldığında bu ayrım korunmalıdır.
 *
 * KURUMSAL FATURA EŞİKTEN BAĞIMSIZDIR: VKN'siz kurumsal fatura hiçbir tutarda kesilemez
 * ve müşteri "kurumsal"ı bilerek seçmiştir. Orada gevşetme yanlış olur.
 */

export type InvoiceIdentityInput = {
  type: 'individual' | 'corporate'
  tckn?: string
  companyName?: string
  vkn?: string
  taxOffice?: string
}

/** Sözlükteki `checkout.errors.*` anahtarlarıyla birebir aynı adlar. */
export type InvoiceIdentityIssue =
  | 'tcknRequired'
  | 'tcknFormat'
  | 'companyRequired'
  | 'vknRequired'
  | 'vknFormat'
  | 'taxOfficeRequired'

/**
 * Fatura kimliği yeterli mi? Sorun yoksa `null` döner.
 *
 * @param orderTotalWithVat Sipariş toplamı, **KDV dahil** (vitrin fiyatları KDV dahildir —
 *   bkz. `pricing-standard.md`). Sayı değilse kimlik ZORUNLU sayılır: tutarı bilemediğimiz
 *   bir siparişte eşik kararı verilemez, eksik kimlikli fatura riskini almaktansa sorarız.
 * @param identityThreshold Bu tutarın ÜSTÜNDE bireysel kimlik zorunlu. `0` verilirse
 *   her siparişte zorunlu olur (hep-topla tercihi).
 */
export function checkInvoiceIdentity(
  input: InvoiceIdentityInput,
  orderTotalWithVat: number,
  identityThreshold: number,
): InvoiceIdentityIssue | null {
  if (input.type === 'corporate') {
    if (!(input.companyName || '').trim()) return 'companyRequired'

    const vkn = (input.vkn || '').trim()
    if (!vkn) return 'vknRequired'
    if (!isValidVkn(vkn)) return 'vknFormat'

    if (!(input.taxOffice || '').trim()) return 'taxOfficeRequired'
    return null
  }

  const tckn = (input.tckn || '').trim()

  // Girilmişse — tutar ne olursa olsun — geçerli olmak zorunda. Yanlış numara,
  // boş numaradan kötüdür: fatura yanlış kişiye kesilir ve hata sessiz kalır.
  if (tckn) return isValidTckn(tckn) ? null : 'tcknFormat'

  const totalBilinmiyor = !Number.isFinite(orderTotalWithVat)
  return totalBilinmiyor || orderTotalWithVat > identityThreshold ? 'tcknRequired' : null
}
