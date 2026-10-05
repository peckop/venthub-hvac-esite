/**
 * Fiyat değişiklik günlüğünün YÖNTEM etiketi (REC-412 Faz 0.5, PR-B).
 *
 * Fiyat tablolarına (`pricing_rule`, `pricing_policy`, `price_lists`, `currency_rates`, `product_prices`) yapılan her
 * yazım DB tetiğiyle `admin_audit_log`'a düşer (migration 20260929110000, cetvel denetim-izi-standard §8). Tetik
 * "kim, ne zaman, eski→yeni"yi kendisi bilir; "hangi yoldan" bilgisini yalnız İSTEMCİ söyleyebilir ve bunu istek
 * başlığıyla söyler. Başlık yoksa günlüğe `yontem=BILINMIYOR` yazılır (zararsız ama bilgisiz).
 *
 * ⚠Yöntem istemci BEYANIDIR, kanıt değil. Tetik hiçbir sayım ya da eleme kararını başlığa bağlamaz.
 *
 * Bu modül saftır: supabase istemcisi import ETMEZ (DI kuralı — servisler istemciyi parametre alır).
 * Kapı: src/__tests__/conformance/fiyat-gunlugu-yontem-basligi.test.ts (INV-FIYAT-GUNLUGU-1).
 */

// Dışa AÇILMAZ: başlık adını tek yerde tutmak yeter; çağıranlar `yontemli()` kullanır (kapı: iki kabul biçimi).
const YONTEM_BASLIGI = 'x-degisiklik-yontemi'
const OTURUM_BASLIGI = 'x-degisiklik-oturumu'

/** Migration'daki beyaz listeyle AYNI (dışındaki değer tetikte yok sayılır → BILINMIYOR). */
export type DegisiklikYontemi = 'panel' | 'liste' | 'csv' | 'yeniden_hesap' | 'maliyet_yenileme' | 'sistem'

/** postgrest-js sorgu oluşturucularının ortak yüzü (`setHeader` hepsinde var, `this` döner). */
interface BaslikTasiyan<B> {
  setHeader(name: string, value: string): B
}

/**
 * Bir yazma sorgusuna yöntem (ve varsa koşu) başlığını ekler. Sorguyu SARAR: `await yontemli(sorgu, 'panel')`.
 * `oturum`: bir koşunun (ör. katalog yeniden hesabı) birden çok isteğini günlükte birleştiren uuid.
 */
export function yontemli<B extends BaslikTasiyan<B>>(sorgu: B, yontem: DegisiklikYontemi, oturum?: string): B {
  const etiketli = sorgu.setHeader(YONTEM_BASLIGI, yontem)
  return oturum === undefined ? etiketli : etiketli.setHeader(OTURUM_BASLIGI, oturum)
}

/** Yeni bir koşu kimliği (uuid). Tetik yalnız uuid biçimini kabul eder. */
export function yeniOturumKimligi(): string {
  return crypto.randomUUID()
}
