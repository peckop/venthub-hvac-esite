/**
 * İÇ INGEST NOTU MUHAFIZI — iç kayıt notu müşteriye ÇİZİLMEZ.
 *
 * OLAY (canlı, ölçüldü 2026-09-05): müşteri ürün sayfasında "Ürün Açıklaması" başlığının
 * altında şunu okuyordu:
 *
 *     "Avensair 2026 fiyat listesinden aktarılan temel ürün (Tier C)."
 *
 * Bu bir ürün tanıtımı değil, **içeri aktarma sırasında yazılmış iç kayıt notudur**: hangi
 * fiyat listesinden geldiğini ve iç kademesini (Tier) söyler. Müşteriye iki zarar verir —
 * ürün hakkında hiçbir şey anlatmaz, ve tedarik/kademe bilgimizi dışarı sızdırır.
 *
 * ÖLÇÜM (prod DB, SELECT):
 *   • `products.description_i18n` → **187 / 375** satır (tr VE en aynı kalıpta)
 *   • `product_families.description` → **11 / 40**
 *
 * ⚠NİÇİN GÖZDEN KAÇTI — `curl` bu metni GÖRMÜYOR: ürün adresi aile sayfasına yönleniyor ve
 * açıklama varyant seçildikten sonra istemcide çiziliyor. Sunucu yanıtında metin YOK; ekranda
 * VAR. Tarayıcıyla (Playwright) doğrulandı. Ders: "sunucu yanıtında yok" ≠ "ekranda yok".
 *
 * ⭐BU DOSYA BİR YAMA DEĞİL, SON SAVUNMA HATTIDIR. Asıl çözüm veriyi temizlemektir (ayrı iş,
 * prod yazımı → Recep kapısı). Muhafız kalıcıdır: veri yarın yeniden içeri aktarılırsa aynı
 * not yeniden doğar; o gün vitrin yine korunur. İki katman birbirinin yerine geçmez.
 *
 * KAPSAM: yalnız **müşteriye görünen** metin (açıklama gövdesi + meta açıklama zinciri).
 * Admin yüzeyleri bu notu GÖRMEYE devam etmeli — orası iç yüzeydir, notun yeri orasıdır.
 */

/**
 * İçeri aktarma şablonunun imzası. İKİ işaret birden aranır ki normal bir ürün metni
 * yanlışlıkla gizlenmesin:
 *   1. "… fiyat listesinden aktarılan …" (TR) / "imported from … price list" (EN)
 *   2. "(Tier X)" kademe damgası
 * Tek işaret yetmez: gerçek bir açıklama "fiyat listesi" ifadesini masum bağlamda
 * kullanabilir; "(Tier C)" damgası ise şablonun kendi imzasıdır.
 */
const IC_NOT_DESENLERI: RegExp[] = [
  /fiyat\s+listesinden\s+aktar/i,
  /imported\s+from\s+.{0,40}price\s+list/i,
]
const KADEME_DAMGASI = /\(\s*tier\s+[a-z0-9]+\s*\)/i

/**
 * Metin, içeri aktarma sırasında yazılmış bir İÇ NOT mu?
 *
 * `true` dönerse metin müşteriye **çizilmemelidir** — açıklama YOKMUŞ gibi davranılır
 * (yerine yedek cümle yazılmaz: REC-148 A4 kararı, "yakında eklenecek" gibi tutulacağı
 * garanti olmayan vaat cümlesi vitrine yazılmaz).
 */
export function icIngestNotuMu(metin: string | null | undefined): boolean {
  if (!metin) return false
  const g = metin.trim()
  if (!g) return false
  return IC_NOT_DESENLERI.some((d) => d.test(g)) && KADEME_DAMGASI.test(g)
}

/**
 * Müşteriye çizilecek metni süzer: iç not ise `null`, değilse metnin kendisi.
 * Çağıran taraf `null`'ı "açıklama yok" olarak ele alır ve satırı hiç çizmez.
 */
export function musteriyeGorunurAciklama(metin: string | null | undefined): string | null {
  if (!metin) return null
  return icIngestNotuMu(metin) ? null : metin
}
