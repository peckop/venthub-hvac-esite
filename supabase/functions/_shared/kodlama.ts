// ÇIKTI KODLAMA — güvenilmeyen metin HTML'e girmeden önce buradan geçer.
//
// NİÇİN (güvenlik karnesi 2026-11, kök 3 · bulgu G1): kaçış fonksiyonu yalnız
// `quote-notification-webhook/ic_bildirim.ts`'te vardı; sipariş, kargo, teslimat ve iade
// e-postaları müşteri adını, iade sebebini ve açıklamasını `String(v)` ile ham basıyordu.
// Ödeme yapan biri `name:"<a href=…>"` ve kurbanın adresiyle VentHub göndericisinden
// oltalama HTML'i gönderebiliyordu. Kaçış artık motorun İÇİNDE: çağıranın unutma imkânı yok.
//
// Bu dosya SAF: Deno/ağ yok, vitest'ten içe aktarılır. Cetvel:
// `docs/standards/email-template-standard.md` §2 (motor) ve §2.1 (kaçış).

/** HTML metin ve tırnaklı öznitelik bağlamı için kaçış. `null`/`undefined` → boş dizge. */
export const kacir = (s: unknown): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * `href`/`src` için adres süzgeci: yalnız `http(s)://` kabul edilir, başka her şey
 * (`javascript:`, `data:`, göreli yol, boşluklu değer) boş dizge döner. Sonuç yine
 * `kacir`/motor kaçışından geçer — bu fonksiyon kaçışın yerine geçmez, şemayı denetler.
 */
export function guvenliUrl(u: unknown): string {
  const s = String(u ?? '').trim()
  if (!/^https?:\/\/[^\s"'<>]+$/i.test(s)) return ''
  return s
}

/**
 * `style="color: …"` için renk süzgeci: yalnız `#rgb`, `#rrggbb` (ve alfa'lı biçimleri) geçer, gerisi
 * `yedek` olur. Niçin: `kacir` tırnaktan çıkmayı engeller ama CSS bildirimi enjeksiyonunu
 * (`red;background-image:url(https://…)` → izleme pikseli) engellemez. Değer tenant yapılandırmasından
 * gelir; yazmak yönetici yetkisi ister, yine de e-postaya doğrulanmadan girmez (güvenlik incelemesi 2026-11-03).
 */
export function guvenliRenk(r: unknown, yedek = '#2563eb'): string {
  const s = String(r ?? '').trim()
  return /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s) ? s : yedek
}

/**
 * Şablon motoru — `{{alan}}` + `{{#if alan}}…{{/if}}`. Başka hiçbir şey (döngü YOK, cetvel §2).
 *
 * ⭐Her `{{alan}}` değeri `kacir`dan geçer. Ham HTML basma yolu bilerek yoktur: bugün hiçbir
 * şablon hazır HTML parçası almıyor (ölçüldü, 2026-11-03). Gerekirse ham-HTML türü BURADA,
 * tek yerde eklenir; uca kopyalanmaz.
 *
 * Eskiden dört uçta (`order-confirmation`, `shipping-notification`, `delivery-notification`
 * + `quote-notification-webhook`'ta ayrı `kacir`) kopyalıydı ve kopyalar ayrışmıştı (REC-154).
 */
export function renderTemplate(tpl: string, data: Record<string, unknown>): string {
  const dolu = tpl.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/?if}}/g, (_m, key: string, inner: string) =>
    data[key] ? inner : '',
  )
  return dolu.replace(/{{(\w+)}}/g, (_m, key: string) => kacir(data[key]))
}
