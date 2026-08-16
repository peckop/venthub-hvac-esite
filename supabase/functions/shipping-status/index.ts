// Çağıran sınıfı: (c) idi — kimliksiz, halka açık uç. ARTIK HİÇBİR İŞ YAPMIYOR: EMEKLİ.
//
// ─────────────────────────────────────────────────────────────────────────────
// NİÇİN (T058-VH · operasyon döngüsü denetimi 2026-08-15 §4)
// ─────────────────────────────────────────────────────────────────────────────
// Bu uç, `order_id` ya da `tracking_number` verilen isteğe sipariş kargo durumunu
// döndürüyordu. `verify_jwt=false` ile halka açıktı ve tek koruması IP rate-limit'ti
// (`edge-security.test.ts` R5 baseline'ında bu yüzden duruyor).
//
// Ölçüldü (2026-08-16): repoda bu ucu çağıran **tek satır yok** — ne `src/`, ne `e2e/`,
// ne başka bir edge fonksiyonu. Yalnızca `config.toml` kaydı ve conformance listeleri
// adını anıyor. Yani kullanılmayan bir uç, kimliksiz erişime açık duruyordu.
//
// Kullanılmayan bir yüzey, güvenliği "şimdilik" olan bir yüzeyden daha tehlikelidir:
// kimse ona bakmaz, kimse test etmez, ve bir gün biri "zaten var" diye üzerine iş bindirir.
// Takip numarası tahmin edilebilir bir dizedir; bu uç, tahmin eden herkese sipariş
// durumunu veriyordu. Müşterinin kendi kargo bilgisi zaten kimlik doğrulamalı hesap
// sayfasından geliyor (`AccountShipmentsPage`, `OrderDetailPage`).
//
// ── Niçin SİLİNMEDİ, 410'a çevrildi ─────────────────────────────────────────
// Dosyayı silmek prod'daki dağıtılmış fonksiyonu KALDIRMAZ (deploy yalnız değişenleri
// yeniler) — yani kod silinir, açık uç canlı kalırdı. 410 dönen bir sürüm deploy etmek
// ucu GERÇEKTEN kapatır. Ayrıca 410 niyet beyanıdır: 404 "henüz deploy olmadı" ile
// karışır, 410 "vardı, bilerek kapatıldı" der.
//
// `verify_jwt` KASITEN false bırakıldı: bu fonksiyon artık hiçbir veriye dokunmuyor,
// dolayısıyla kimlik doğrulaması korunacak bir şey bulamaz — ama 410 mesajının stray
// bir çağırana ULAŞMASI teşhis değeri taşır. Ayrıca `config.toml` değişikliği TÜM
// fonksiyonları yeniden deploy ettirir (cetvel §3.7 uyarısı); gereksiz yere o riski almayız.

import { getCorsHeaders } from '../_shared/cors.ts'

Deno.serve((req: Request) => {
  const cors = getCorsHeaders(req)

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })

  return new Response(
    JSON.stringify({
      error: 'ENDPOINT_RETIRED',
      message:
        'shipping-status emekliye ayrıldı: kullanılmıyordu ve takip numarasını bilen herkese ' +
        'sipariş durumu döndürüyordu. Kargo bilgisi kimlik doğrulamalı hesap sayfalarından gelir.',
      ref: 'T058-VH · docs/audits/operasyon-dongusu-denetimi-2026-08-15.md §4',
    }),
    { status: 410, headers: { ...cors, 'Content-Type': 'application/json' } },
  )
})
