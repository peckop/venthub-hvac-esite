// supabase/functions/refund-order-mock/index.ts
//
// Çağıran sınıfı: (a) — ama artık HİÇBİR İŞ YAPMIYOR. Bu uç EMEKLİYE AYRILDI.
//
// ─────────────────────────────────────────────────────────────────────────────
// NİÇİN (T053-VH · operasyon döngüsü denetimi 2026-08-15 §3)
// ─────────────────────────────────────────────────────────────────────────────
// Bu fonksiyon kendi başlığında *"no real PSP call, only DB state updates"* diyordu ve
// bunu dürüstçe yapıyordu. Sorun fonksiyonun kendisi değil, ÇAĞRILDIĞI YERDİ: admin
// panelindeki iade akışı `refunded` derken bunu çağırıyordu. Sonuç, denetimin
// "sessiz sahte-başarı" dediği sınıfın en pahalı örneğiydi:
//
//   · `payment_status = 'refunded'` yazılıyordu,
//   · denetim kaydı düşüyordu,
//   · müşteriye **"iadeniz tamamlandı"** e-postası gidiyordu,
//   · ve İyzico'ya **tek bir istek bile gitmiyordu.**
//
// Yani sistem, parayı iade ettiğini söylüyordu; etmiyordu. Gerçek uç (`iyzico-refund`)
// repoda vardı ama onu çağıran tek satır yoktu — yetimdi.
//
// Ayrıca bu dosyanın stok geri-ekleme yolu da bozuktu (denetimin saymadığı dördüncü yol):
// PostgREST'e `stock_qty` için `{"increment": N}` biçiminde bir gövde gönderiyordu. Bu
// geçerli bir PostgREST sözdizimi DEĞİL — 400 dönüyor ve `catch {}` içinde yutuluyordu.
// Yani iade stoğu da hiç artmıyordu; "çalışıyor" görüntüsü tamamen kayıtsızlıktandı.
//
// ── Niçin SİLİNMEDİ, 410'a çevrildi ─────────────────────────────────────────
// Fonksiyonu tamamen silmek, dağıtılmış bir uçta 404 üretir ve 404 "henüz deploy olmadı"
// ile karışır. 410 Gone ise niyet beyanıdır: *bu uç vardı, bilerek kapatıldı.* Gövdedeki
// mesaj çağıranı doğru yere yönlendirir. Eski çağıran (admin UI) hâlâ buraya gelirse
// **gürültülü biçimde** başarısız olur — yalan söylemektense patlaması yeğdir.
//
// Yerine: `iyzico-refund` (gerçek PSP çağrısı + `refund_attempts` talep defteri ile
// çift-iade koruması + kanıta bağlı stok geri-verme RPC'si).
// Cetvel: docs/standards/edge-function-security-standard.md §3.10.

import { getCorsHeaders } from '../_shared/cors.ts'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve((req: Request) => {
  const cors = getCorsHeaders(req)

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })

  return new Response(
    JSON.stringify({
      error: 'ENDPOINT_RETIRED',
      message:
        'refund-order-mock emekliye ayrıldı: sahte iade yapıyor ama müşteriye "iadeniz tamamlandı" ' +
        'dedirtiyordu. Gerçek para iadesi için iyzico-refund kullanın.',
      replacement: 'iyzico-refund',
      contract: {
        body: { order_id: 'uuid', amount: 'number (opsiyonel; yoksa kalanın tamamı)', reason: 'string?', idempotency_key: 'parsiyel iadede ZORUNLU' },
        note: 'Tam iptalde anahtar sunucuda türetilir. 409 = zaten işleniyor/işlenmiş; 200 already_refunded = tekrar çağrı, para iki kez çıkmaz.',
      },
      ref: 'T053-VH · docs/audits/operasyon-dongusu-denetimi-2026-08-15.md §3',
    }),
    { status: 410, headers: { ...cors, 'Content-Type': 'application/json' } },
  )
})
