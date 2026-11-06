// Sipariş onay e-postasının Resend isteği tek yerde kurulur; index.ts ve test aynı fonksiyonu kullanır.
// Cetvel: docs/standards/notification-standard.md §B3.1 Katman 1 (Resend Idempotency-Key, 24 saat, en çok 256 karakter).

/** Aynı sipariş için daima aynı anahtar: tekrar çağrıda Resend ikinci e-posta üretmez. */
export const siparisOnayAnahtari = (orderId: string): string => `order-confirmation:${orderId}`.slice(0, 256)

export interface ResendGovdesi {
  from: string
  to: string[]
  bcc?: string[]
  subject: string
  html: string
  text: string
}

export function resendIstegi(apiKey: string, orderId: string, govde: ResendGovdesi): RequestInit {
  return {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': siparisOnayAnahtari(orderId),
    },
    body: JSON.stringify(govde),
  }
}
