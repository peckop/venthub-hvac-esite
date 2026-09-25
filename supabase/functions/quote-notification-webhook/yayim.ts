// YAYIM DALI — "Teklifiniz hazır" müşteri e-postası (REC-384, 2026-09-25).
//
// NİÇİN (karar 104 canlı koşumu, 2026-09-24): teklif ekrandan yayımlandı ama müşteri e-postası
// GİTMEDİ — bildirim tarayıcıdan, yayım döndükten SONRA ateşleniyordu; oturum kapanınca istek yolda
// kesildi. Misafir müşteriye bu yol hiç gitmiyordu. Yayım artık DB tetiğinden
// (`_quote_published_enqueue`) bu uca `{"event":"quote_published","quote_id":…}` gövdesiyle gelir.
//
// NİÇİN AYRI DOSYA VE PORTLAR: talep dalından AYRI kurallar (red-team iki tur, REC-384):
//   · `request_email_sent_at`, kullanıcı hız sınırı ve iç bildirim bu dalda YOKTUR — yayım bir
//     personel eylemidir, müşteri döngüsü değil; iç bildirim personelin kendi eylemini ona bildirirdi.
//   · Idempotency-Key `teklif-yayim/{id}`. Talep dalının anahtarını (`musteriOnayAnahtari`) kullanmak
//     Resend'e FARKLI gövdeyle aynı anahtarı yollar → 24 saat boyunca 409 ve e-posta hiç gitmez.
//   · 409 yalnız defterde aynı olayın `sent` satırı varsa "gitti" sayılır.
// Dosya SAF tutulur (esm.sh/Deno API yok): DB, Resend ve kiracı okuması PORT olarak içeri verilir,
// vitest sahte portlarla dalın davranışını uçtan uca koşar (INV-TEKLIF-YAYIM-1).

import { kacir, temizle } from './ic_bildirim.ts'

/** notification-standard §B3.2: anahtar OLAYIN kimliğidir — talep dalının anahtarından AYRI. */
export const yayimAnahtari = (quoteId: string): string => `teklif-yayim/${quoteId}`

export const YAYIM_OLAYI = 'quote_published'

export type Olay = 'talep' | 'yayim' | 'bilinmeyen'

/**
 * Gövdedeki `event` alanını dala çevirir. Alan YOKSA bugünkü talep dalı (geriye uyum: mevcut
 * INSERT tetiği `event` göndermez). Tanımadığımız her değer 'bilinmeyen' → 400; "bilmediğim olayı
 * talep sayayım" demek yeni bir tetiğin yanlış e-posta üretmesine kapı açardı.
 */
export function olayCoz(payload: { event?: unknown }): Olay {
  if (!('event' in payload) || payload.event === undefined) return 'talep'
  if (payload.event === YAYIM_OLAYI) return 'yayim'
  return 'bilinmeyen'
}

/**
 * Müşteriye görünen belge numarası. `quote_no` yayımda sunucuda atanır (TK-YYYYMMDD-NNNN); revizyon
 * ya da eski kayıtta boş olabilir → id'nin SON 8 hanesi (talep e-postası İLK 8 + `#` kullanır;
 * iki biçim bilerek ayrı, müşteri iki belgeyi karıştırmasın — REC-389).
 */
export function belgeNumarasi(quoteId: string, quoteNo: string | null | undefined): string {
  const no = temizle(quoteNo)
  return no || quoteId.slice(-8).toUpperCase()
}

export function yayimKonusu(quoteId: string, quoteNo: string | null | undefined): string {
  return `Teklifiniz hazır: ${belgeNumarasi(quoteId, quoteNo)}`
}

/**
 * Resend 409 kararı. 409 = aynı Idempotency-Key daha önce kullanıldı ya da eşzamanlı istek sürüyor.
 * Tek başına "gitti" KANITI DEĞİLDİR: önceki deneme Resend'e ulaşıp düşmüş, anahtar yine de
 * tüketilmiş olabilir. Yalnız defterde aynı teklif + aynı olay için `sent` satırı varsa gitti sayılır.
 */
export function kararVer409(defterdeGonderildi: boolean): 'gonderildi_say' | 'basarisiz' {
  return defterdeGonderildi ? 'gonderildi_say' : 'basarisiz'
}

/** Portal adresi: yalnız http(s) taban; müşteri e-postası Türkçe → `/tr` öneki (localizedHref kuralı). */
export function portalLinki(taban: string | null | undefined, quoteId: string): string | null {
  const t = (taban || '').trim().replace(/\/+$/, '')
  if (!/^https?:\/\/[^\s/]+/i.test(t)) return null
  return `${t}/tr/account/quotes/detail?id=${encodeURIComponent(quoteId)}`
}

export interface YayimKalemi {
  product_name: string | null
  qty: number | null
  unit_price: number | null
}

export interface YayimIcerikGirdisi {
  quoteId: string
  quoteNo: string | null
  kalemler: YayimKalemi[]
  toplam: number | null
  paraBirimi: string | null
  gecerlilik: string | null
  /** Dolu ise "Teklifi görüntüle" bağlantısı; boşsa "yanıtlayın ya da arayın" metni. */
  portalLinki: string | null
  /** Hesaplı müşteri ama bağlantı kurulamadı (SITE_URL yok / varsayılan dışı kiracı). */
  hesapli: boolean
}

export interface YayimIcerigi {
  subject: string
  html: string
  text: string
}

export const YANIT_METNI = 'Kabul için bu e-postayı yanıtlayın ya da bizi arayın.'

export function paraBicimle(tutar: number | null | undefined, paraBirimi: string | null | undefined): string {
  if (tutar === null || tutar === undefined || !Number.isFinite(Number(tutar))) return '—'
  const pb = (paraBirimi || '').trim().toUpperCase()
  if (/^[A-Z]{3}$/.test(pb)) {
    try {
      return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: pb }).format(Number(tutar))
    } catch {
      // Tanınmayan kod: sayı + kod (sessizce başka birime düşülmez)
    }
  }
  const sayi = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(tutar))
  return pb ? `${sayi} ${pb}` : sayi
}

export function tarihBicimle(iso: string | null | undefined): string {
  if (!iso) return '—'
  const t = new Date(iso)
  if (Number.isNaN(t.getTime())) return '—'
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long', timeZone: 'Europe/Istanbul' }).format(t)
}

/** Satır tutarı DB toplamıyla aynı formülden: qty × unit_price, 2 haneye yuvarlı (stamp_quote_published). */
const satirTutari = (k: YayimKalemi): number | null =>
  k.qty === null || k.unit_price === null ? null : Math.round(Number(k.qty) * Number(k.unit_price) * 100) / 100

export function yayimIcerigiOlustur(g: YayimIcerikGirdisi): YayimIcerigi {
  const no = belgeNumarasi(g.quoteId, g.quoteNo)
  const subject = yayimKonusu(g.quoteId, g.quoteNo)
  const toplam = paraBicimle(g.toplam, g.paraBirimi)
  const gecerlilik = tarihBicimle(g.gecerlilik)

  // ⭐KAÇIŞ ZORUNLU (talep dalıyla aynı kapı, güvenlik incelemesi 2026-09-09 bulgu 1): ürün adı
  // kullanıcı girdisinden gelebilir; kaçışsız girerse VentHub alan adından kimlik avı bağlantısı olur.
  const satirlarHtml = g.kalemler
    .map(
      (k) =>
        `<tr><td>${kacir(k.product_name)}</td><td align="right">${kacir(k.qty)}</td>` +
        `<td align="right">${kacir(paraBicimle(k.unit_price, g.paraBirimi))}</td>` +
        `<td align="right">${kacir(paraBicimle(satirTutari(k), g.paraBirimi))}</td></tr>`,
    )
    .join('')
  const satirlarMetin = g.kalemler
    .map(
      (k) =>
        `- ${temizle(k.product_name)} — ${String(k.qty ?? '')} adet × ${paraBicimle(k.unit_price, g.paraBirimi)} = ${paraBicimle(satirTutari(k), g.paraBirimi)}`,
    )
    .join('\n')

  // Bağlantı yalnız hesaplı müşteriye (misafirin hesabı yok, prospect belge portalda görünmez — §7/R17).
  const eylemHtml = g.portalLinki
    ? `<p><a href="${kacir(g.portalLinki)}">Teklifi görüntüleyin</a> — hesabınızdaki <em>Tekliflerim</em> sayfasından onaylayabilir ya da reddedebilirsiniz.</p>`
    : g.hesapli
      ? `<p>Teklifi hesabınızdaki <em>Tekliflerim</em> sayfasından görüntüleyebilirsiniz. ${kacir(YANIT_METNI)}</p>`
      : `<p>${kacir(YANIT_METNI)}</p>`
  const eylemMetin = g.portalLinki
    ? `Teklifi görüntüleyin: ${g.portalLinki}`
    : g.hesapli
      ? `Teklifi hesabınızdaki Tekliflerim sayfasından görüntüleyebilirsiniz. ${YANIT_METNI}`
      : YANIT_METNI

  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6">',
    `<h2>Teklifiniz hazır: ${kacir(no)}</h2>`,
    satirlarHtml
      ? '<table cellpadding="4" style="border-collapse:collapse">' +
        '<tr><th align="left">Ürün</th><th align="right">Adet</th><th align="right">Birim fiyat</th><th align="right">Tutar</th></tr>' +
        `${satirlarHtml}</table>`
      : '',
    `<p><strong>Toplam: ${kacir(toplam)}</strong> (KDV hariç)</p>`,
    `<p>Geçerlilik: ${kacir(gecerlilik)} tarihine kadar</p>`,
    eylemHtml,
    '<p>Teşekkürler,<br><strong>VentHub Ekibi</strong></p>',
    '</div>',
  ].join('')

  const text = [
    `Teklifiniz hazır: ${no}`,
    '',
    satirlarMetin,
    '',
    `Toplam: ${toplam} (KDV hariç)`,
    `Geçerlilik: ${gecerlilik} tarihine kadar`,
    '',
    eylemMetin,
  ].join('\n')

  return { subject, html, text }
}

// ─── Dal akışı (portlarla) ────────────────────────────────────────────────────────────────

export interface YayimTeklif {
  id: string
  tenant_id: string
  user_id: string | null
  status: string
  quote_no: string | null
  total_amount: number | null
  currency: string | null
  valid_until: string | null
  contact_email: string | null
  published_email_sent_at: string | null
}

export interface DefterSatiri {
  email_to: string
  subject: string
  status: 'sent' | 'failed' | 'mismatch'
  provider: 'resend' | 'guard'
  provider_message_id?: string | null
  error?: string | null
}

export interface ResendYaniti {
  ok: boolean
  status: number
  text(): Promise<string>
  json(): Promise<unknown>
}

/** Hata alanı `string | null`: port DB hata mesajını düz metin döner (null = başarılı). */
export interface YayimPortlari {
  teklifOku(quoteId: string): Promise<{ data: YayimTeklif | null; error: string | null }>
  kalemleriOku(quoteId: string): Promise<{ data: YayimKalemi[] | null; error: string | null }>
  authEpostasi(userId: string): Promise<string | null>
  /** Varsayılan dışı kiracının `tenants.config` destek adresi (okunamazsa error dolu). */
  kiraciDestekAdresi(tenantId: string): Promise<{ adres: string | null; error: string | null }>
  marka(tenantId: string): Promise<{ emailFrom: string; supportEmail: string }>
  /** `event='quote_published'` ile yazar. */
  deftereYaz(quoteId: string, satir: DefterSatiri): Promise<string | null>
  /** quote_id + event='quote_published' + status='sent' satırı var mı? */
  gonderimSatiriVarMi(quoteId: string): Promise<{ var: boolean; error: string | null }>
  /** published_email_sent_at = now() (yalnız hâlâ boşsa). */
  damgala(quoteId: string): Promise<string | null>
  resendGonder(govde: Record<string, unknown>, anahtar: string): Promise<ResendYaniti>
}

export interface YayimOrtami {
  varsayilanKiraciId: string
  siteUrl: string | null
}

export interface DalSonucu {
  durum: number
  govde: Record<string, unknown>
}

const LOG = '[quote-notification-webhook:yayim]'

export async function yayimDaliniIsle(quoteId: string, p: YayimPortlari, o: YayimOrtami): Promise<DalSonucu> {
  const { data: quote, error: quoteErr } = await p.teklifOku(quoteId)
  // "Bakamadım" ile "yok" aynı cevaba düşmez (talep dalıyla aynı; pg_net tek atımlık).
  if (quoteErr) return { durum: 503, govde: { error: 'quote_lookup_failed' } }
  if (!quote) return { durum: 404, govde: { error: 'quote_not_found' } }

  // İDEMPOTENCY katman 2: damga DB'de. `request_email_sent_at` BURADA OKUNMAZ — talep e-postası
  // gitmiş her teklifte yayım e-postası da düşerdi.
  if (quote.published_email_sent_at) {
    return { durum: 200, govde: { ok: true, skipped: 'already_sent', quote_id: quote.id } }
  }
  // Yalnız yayımlanmış belge: elle/yanlış çağrıda taslak fiyatı müşteriye gitmesin.
  if (quote.status !== 'quoted') {
    console.warn(`${LOG} yayimlanmamis teklif icin cagri, e-posta YOK`, { quote_id: quote.id, status: quote.status })
    return { durum: 409, govde: { error: 'not_published', quote_id: quote.id } }
  }

  const to = (quote.contact_email || '').trim()
  if (!to) return { durum: 422, govde: { error: 'quote_has_no_contact_email' } }

  const subject = yayimKonusu(quote.id, quote.quote_no)
  const yaz = async (satir: DefterSatiri) => {
    const hata = await p.deftereYaz(quote.id, satir)
    if (hata) console.error(`${LOG} defter yazilamadi`, { quote_id: quote.id, status: satir.status, detay: hata })
    return hata
  }

  // Bulgu 7 (talep dalıyla aynı): oturumlu kayıtta contact_email auth e-postasından ayrışıyorsa
  // gönderim ENGELLENMEZ, deftere yazılır.
  if (quote.user_id) {
    const authEposta = ((await p.authEpostasi(quote.user_id)) || '').trim().toLowerCase()
    if (authEposta && authEposta !== to.toLowerCase()) {
      await yaz({
        email_to: to,
        subject: 'contact_email auth e-postasindan AYRISIYOR',
        provider: 'guard',
        status: 'mismatch',
        error: 'contact_email != auth.email (bulgu 7 — kayit, engelleme degil)',
      })
    }
  }

  // ⛔YANIT ADRESİ FAIL-CLOSED: müşteri "yanıtlayın" metniyle kiracının destek kutusuna yönlendirilir.
  // Varsayılan dışı kiracıda adres kendi config'inden; okunamaz/boşsa GÖNDERİLMEZ (VentHub kutusuna
  // başka kiracının müşterisi yazmasın — kural 12, talep dalı bulgu 2 ile aynı).
  const marka = await p.marka(quote.tenant_id)
  let replyTo = ''
  const varsayilanKiraci = quote.tenant_id === o.varsayilanKiraciId
  if (varsayilanKiraci) {
    replyTo = (marka.supportEmail || '').trim()
  } else {
    const k = await p.kiraciDestekAdresi(quote.tenant_id)
    if (k.error) return { durum: 503, govde: { error: 'tenant_lookup_failed', quote_id: quote.id } }
    replyTo = (k.adres || '').trim()
  }
  if (!replyTo) {
    console.error(`${LOG} kiracinin destek adresi yok — yayim e-postasi GONDERILMEDI`, { quote_id: quote.id })
    await yaz({ email_to: to, subject, provider: 'resend', status: 'failed', error: 'reply_to (supportEmail) bos — gonderilmedi' })
    return { durum: 500, govde: { error: 'reply_to_missing', quote_id: quote.id } }
  }

  const { data: kalemler, error: kalemErr } = await p.kalemleriOku(quote.id)
  if (kalemErr) return { durum: 503, govde: { error: 'items_lookup_failed' } }

  // Portal bağlantısı yalnız hesaplı müşteri + varsayılan kiracı (SITE_URL VentHub'ındır; başka
  // kiracının müşterisi VentHub portalına yönlenmez). SITE_URL yoksa bağlantı konmaz ve log'a düşer.
  let link: string | null = null
  if (quote.user_id && varsayilanKiraci) {
    link = portalLinki(o.siteUrl, quote.id)
    if (!link) console.warn(`${LOG} SITE_URL tanimsiz/gecersiz — portal baglantisi YOK`, { quote_id: quote.id })
  }
  const icerik = yayimIcerigiOlustur({
    quoteId: quote.id,
    quoteNo: quote.quote_no,
    kalemler: kalemler ?? [],
    toplam: quote.total_amount,
    paraBirimi: quote.currency,
    gecerlilik: quote.valid_until,
    portalLinki: link,
    hesapli: Boolean(quote.user_id),
  })

  const resp = await p.resendGonder(
    { from: marka.emailFrom, to: [to], reply_to: replyTo, subject: icerik.subject, html: icerik.html, text: icerik.text },
    yayimAnahtari(quote.id),
  )

  if (resp.status === 409) {
    const kanit = await p.gonderimSatiriVarMi(quote.id)
    if (kanit.error) console.error(`${LOG} 409 sonrasi defter okunamadi — gitmedi sayiliyor`, { quote_id: quote.id, detay: kanit.error })
    if (kararVer409(!kanit.error && kanit.var) === 'basarisiz') {
      console.error(`${LOG} resend 409 ve defterde gonderim kaniti yok — damga ATILMADI`, { quote_id: quote.id })
      await yaz({
        email_to: to,
        subject,
        provider: 'resend',
        status: 'failed',
        error: 'resend 409: idempotency anahtari kullanilmis ama defterde sent satiri yok — gonderildi SAYILMADI',
      })
      return { durum: 502, govde: { error: 'send_conflict_unverified', status: 409, quote_id: quote.id } }
    }
    // Defterde `sent` var: e-posta önceki denemede gitti, damga o gün düşmüştü → şimdi bas.
    const damgaHata = await p.damgala(quote.id)
    if (damgaHata) {
      console.error(`${LOG} damga yazilamadi (409 kurtarma)`, { quote_id: quote.id, detay: damgaHata })
      return { durum: 500, govde: { error: 'stamp_failed_email_sent', quote_id: quote.id } }
    }
    return { durum: 200, govde: { ok: true, idempotent: true, quote_id: quote.id } }
  }

  if (!resp.ok) {
    const govde = await resp.text().catch(() => '')
    console.error(`${LOG} resend basarisiz`, { quote_id: quote.id, status: resp.status, govde: govde.slice(0, 300) })
    await yaz({ email_to: to, subject, provider: 'resend', status: 'failed', error: `resend ${resp.status}: ${govde.slice(0, 300)}` })
    return { durum: 502, govde: { error: 'send_failed', status: resp.status } }
  }

  const sonuc = (await resp.json().catch(() => null)) as { id?: string } | null
  // Defter DAMGADAN ÖNCE: damga düşerse sonraki çağrı 409 alır ve bu `sent` satırı onu kurtarır.
  const defterHata = await yaz({
    email_to: to,
    subject,
    provider: 'resend',
    status: 'sent',
    provider_message_id: sonuc?.id ?? null,
  })
  const damgaHata = await p.damgala(quote.id)
  if (damgaHata) {
    // E-posta GİTTİ ama damga düştü: yutulmaz, görünür kılınır (talep dalıyla aynı tutum).
    console.error(`${LOG} damga yazilamadi`, { quote_id: quote.id, detay: damgaHata })
    return { durum: 500, govde: { error: 'stamp_failed_email_sent', quote_id: quote.id } }
  }
  return {
    durum: 200,
    govde: {
      ok: true,
      quote_id: quote.id,
      sent_to_domain: to.split('@')[1] ?? null,
      ...(defterHata ? { ledger_write_failed: true } : {}),
    },
  }
}
