# REC-355 VULN-002 (#1454) — bekçi tetikleri gölge kanıtı (2026-09-29)

Betik: `rec355-siparis-bekcisi-golge-2026-09-29.mjs` (bellek-içi PGlite; Docker gerekmez).
Yeniden koşum: geçici bir klasörde `npm i @electric-sql/pglite`, sonra
`node rec355-siparis-bekcisi-golge-2026-09-29.mjs supabase/migrations/20260927162755_rec355_siparis_kolon_bekcisi.sql`.
Depoya bağımlılık eklenmez.

## Ne sınandı

Canlı politikalar (`pg_policy`), `is_admin_claim`, `is_admin_user`, `jwt_tenant_id` ve iki hassas tetik
fonksiyonu (`sync_payment_status_with_status`, `stamp_order_paid_at`) canlıdan (2026-09-29) birebir alındı;
elle yazılmadı. Tohum: 5 sipariş (A:3, B:2), A'nın ilk siparişinde 1 kalem.

| Faz | Ne | Sonuç |
|---|---|---|
| ÖNCE (migration yok) | Müşteri A, kendi siparişinde 8 yazma dener: `status`, `payment_status`, tutar, sipariş no, sipariş ekleme, kalem ekleme, onaylı iade, yönetici notlu iade | 8/8 GEÇER (açık gerçek) |
| SONRA (gerçek dosya) | Aynı 8 yazma | 8/8 `42501` + `REC355_BEKCI`; sipariş özeti değişmez |
| SONRA (meşru) | Müşteri `status=requested` iade açar; eski damgalar sunucu saatine ezilir; kendi siparişini/kalemini okur | Çalışır |
| SONRA (kural 12) | `user_metadata`'ya `admin` yazmış müşteri | REDDEDİLİR |
| SONRA (başka müşteri, anon) | B, A'nın siparişini günceller; anon INSERT/UPDATE | 0 satır / yetki hatası |
| Meşru yazanlar | Yönetici claim (sipariş + iade onayı), service_role, postgres, SECURITY DEFINER sunucu fonksiyonu | Hepsi GEÇER |
| Guard fikstürü | Bekçi koşulu bilerek bozulur | Migration'ın kendi davranış guard'ı `ATESLENMEDI` ile RAISE eder, bekçi tetikleri atomik geri alınır |
| İdempotans | Migration ikinci kez | Sorunsuz |

## Ölçümde çıkan bulgu (plan metnini düzeltir)

Tek başına `status = 'confirmed'` yazmak `payment_status`'u kendiliğinden `paid` yapar ama `paid_at`'ı
damgalamaz ve ödendi bildirimini üretmez: `trg_stamp_order_paid_at` adı gereği
`trg_sync_payment_status_upd`'dan ÖNCE koşar ve o an `payment_status` hâlâ `pending`tir. `paid_at` + bildirim
zinciri `payment_status = 'paid'` doğrudan yazılınca çalışır. Bekçi ikisini de keser; yalnız açığın
tarifi "status yazınca paid_at" değil, "iki ayrı yol" olarak okunmalıdır.

Ayrıca canlı `venthub_order_items` politikası kalem eklemeyi yalnız sipariş SAHİBİNE açar (yönetici claim
dahil); bekçiden bağımsızdır, migration öncesi ile sonrası aynıdır.

## SınanMAYAN (dürüstlük)

- Gerçek Supabase JWT doğrulaması: claim'ler elle kurulur (`request.jwt.claims`).
- PostgREST katmanı ve gerçek HTTP yolu.
- Canlıdaki diğer sipariş tetikleri (`set_order_number`; `notify_order_paid` burada yalnız "bildirim
  üretildi" kaydı yazan kukla — gerçeği `pg_net` ile e-posta atar).
- İstemcinin gerçekten sipariş/kalem/iade yazmadığı: plan §2 yazma yüzeyi envanterine dayanır (kod okuması),
  bu betik onu yeniden ölçmez.

Docker gölgesi yalnız bu son iki kalem için gerekir (tetik zinciri + pg_net); satış açılışından önce
REC-442'nin gölgesiyle tek oturumda koşulacak.
