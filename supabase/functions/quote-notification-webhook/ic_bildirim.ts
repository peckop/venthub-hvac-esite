// İÇ BİLDİRİM — yeni teklif talebi operasyona (kiracının destek adresi) haber verilir.
//
// NİÇİN (2026-09-23, ALTYAPI teklif formu hazırlık ölçümü): misafir ya da üye teklif talebi
// gönderildiğinde TEK e-posta çıkıyordu: müşteriye onay. Kiracının kendisine (VentHub'da
// info@venthub.com.tr) hiçbir bildirim gitmiyordu; talep yalnız yönetim panelinde görünüyordu.
// Canlıda o güne dek 1 kayıt vardı (kayıp gerçek talep yok) ama ilk gerçek talep panelde sessizce
// bekleyecekti. Bu dosya SAF: Deno/ağ yok, vitest'ten içe aktarılır (INV-TEKLIF-IC-BILDIRIM-1).

export interface IcBildirimGirdisi {
  quoteId: string
  source: string | null
  contactName: string | null
  contactEmail: string
  contactPhone: string | null
  kalemler: Array<{ product_name: string | null; qty: number | string | null; note?: string | null }>
  panelTabanUrl: string
}

export interface IcBildirim {
  subject: string
  html: string
  text: string
  idempotencyKey: string
}

/** notification-standard §B3.2: anahtar OLAYIN kimliğidir — tür/varlık, zaman ya da rastgele yok. */
export const icBildirimAnahtari = (quoteId: string): string => `teklif-ic/${quoteId}`
export const musteriOnayAnahtari = (quoteId: string): string => `teklif-musteri/${quoteId}`

export const kacir = (s: unknown): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const KAYNAK_ADI: Record<string, string> = { pdp: 'Ürün sayfası', cart: 'Sepet', project: 'Proje' }

/** Panel adresini güvenle kurar: yalnız http(s) taban kabul edilir, sondaki / temizlenir. */
export function panelLinki(taban: string): string {
  const t = (taban || '').trim().replace(/\/+$/, '')
  if (!/^https?:\/\/[^\s/]+/i.test(t)) return 'https://venthub.com.tr/admin/quotes'
  return `${t}/admin/quotes`
}

export function icBildirimOlustur(g: IcBildirimGirdisi): IcBildirim {
  const kisaId = g.quoteId.slice(0, 8).toUpperCase()
  const ad = (g.contactName || '').trim() || 'Adsız'
  const subject = `Yeni teklif talebi #${kisaId} — ${ad}`.slice(0, 200)
  const link = panelLinki(g.panelTabanUrl)
  const kaynak = g.source ? KAYNAK_ADI[g.source] ?? g.source : '—'

  const kalemHtml = g.kalemler
    .map((k) => {
      const not = (k.note || '').trim()
      return `<li>${kacir(k.product_name)} — ${kacir(k.qty)} adet${not ? `<br><em>Not:</em> ${kacir(not)}` : ''}</li>`
    })
    .join('')
  const kalemMetin = g.kalemler
    .map((k) => {
      const not = (k.note || '').trim()
      return `- ${String(k.product_name ?? '')} — ${String(k.qty ?? '')} adet${not ? ` (Not: ${not})` : ''}`
    })
    .join('\n')

  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6">',
    `<h2>Yeni teklif talebi #${kisaId}</h2>`,
    '<table cellpadding="4" style="border-collapse:collapse">',
    `<tr><td><strong>Ad</strong></td><td>${kacir(ad)}</td></tr>`,
    `<tr><td><strong>E-posta</strong></td><td>${kacir(g.contactEmail)}</td></tr>`,
    `<tr><td><strong>Telefon</strong></td><td>${kacir(g.contactPhone || '—')}</td></tr>`,
    `<tr><td><strong>Kaynak</strong></td><td>${kacir(kaynak)}</td></tr>`,
    '</table>',
    kalemHtml ? `<p><strong>Ürünler</strong></p><ul>${kalemHtml}</ul>` : '<p>Kalem bulunamadı.</p>',
    `<p><a href="${kacir(link)}">Yönetim panelinde aç</a></p>`,
    '<p style="color:#666;font-size:12px">Müşteriye onay e-postası ayrıca gönderildi. Bu e-postayı yanıtlarsanız müşteriye gider.</p>',
    '</div>',
  ].join('')

  const text = [
    `Yeni teklif talebi #${kisaId}`,
    `Ad: ${ad}`,
    `E-posta: ${g.contactEmail}`,
    `Telefon: ${g.contactPhone || '—'}`,
    `Kaynak: ${kaynak}`,
    '',
    kalemMetin || 'Kalem bulunamadı.',
    '',
    `Panel: ${link}`,
  ].join('\n')

  return { subject, html, text, idempotencyKey: icBildirimAnahtari(g.quoteId) }
}
