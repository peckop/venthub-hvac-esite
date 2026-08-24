# T116 — Ödeme Defteri (payment_transactions) Tasarımı

> **Tarih:** 2026-08-20 · **Şerit:** PRICING-STOK · **Durum:** tasarım — uygulama YOK
> **Kapsam:** defterin ne olduğu, neyi kaydettiği, hangi sözlüğü kullandığı.
> Migration ve kod **bu belgenin kapsamı dışında**; ikisi de ayrı Recep kapısı.

## KAYNAK / CETVEL

| | |
|---|---|
| **Yöneten cetvel** | `docs/standards/checkout-payment-standard.md` — **VAR ama BU İŞİ KAPSAMIYOR** |
| **Kapsam boşluğu** | Cetvelin §1–§7'si tamamen ödeme **yüzeyini** yönetiyor (render, CSP, gömülü form, K1–K7). `payment_transactions` kelimesi dosyada **hiç geçmiyor**. |
| **Sonuç** | Bu iş, defter bölümünün **yazımını da kapsar**. "Cetvel yok" demeden önce baktım — dosya var, konu yok. |
| **Komşu cetveller** | `pricing-standard.md §4.1` (çoklu-para satış sözleşmesi) · `order-status` sözlüğü (`venthub_orders`) |
| **Ölçüm** | Canlı prod DB, 2026-08-20 10:45Z |

## 1. Ölçülen durum

| Tablo | Satır | Görülen değerler |
|---|---|---|
| `venthub_orders` | 5 | `payment_status` = **hepsi `pending`** |
| `payment_transactions` | **0** | — |
| `order_refund_events` | 0 | — |
| `order_invoices` | 0 | — |

`payment_transactions` şeması **var** (11 kolon, RLS açık, 2 politika `service_role_only`,
4 indeks, `transaction_id` UNIQUE, `order_id`/`user_id` FK). Eksik olan şema değil.

**Eksik olan yazıcı.** `payment_transactions` yalnızca `supabase/baselines/` içindeki şema
dökümünde geçiyor: hiçbir Edge fonksiyonu, hiçbir migration, hiçbir servis ona yazmıyor.
Ödeme durumu tek yerde tutuluyor — `venthub_orders.payment_status`.

> ⚠ **Ölçüm notu:** ilk taramam `.from('payment_transactions')` arıyordu ve **boş döndü**.
> Sebep: Edge fonksiyonları Supabase client kullanmıyor, doğrudan REST çağırıyor
> (`${supabaseUrl}/rest/v1/venthub_orders?...`). Yanlış araçla "hiçbir şey yazmıyor"
> sonucuna doğru sebeple değil, **tesadüfen** varacaktım. Doğru yöntemle yeniden ölçüldü.

**Boş defter tek başına kusur değildir.** Kusur, defterin **yazılmıyor** olmasıdır: ödeme
hattı çalıştığında bile para hareketinin bağımsız bir kaydı oluşmaz.

## 2. ⭐ En sert bulgu — iki sözlük, ve defter iadeyi tanımıyor

Canlı DB'deki CHECK kısıtları:

| Alan | İzin verilen değerler |
|---|---|
| `payment_transactions.status` | `pending` · **`success`** · `failed` · **`cancelled`** |
| `venthub_orders.payment_status` | `pending` · **`paid`** · `failed` · **`refunded`** · **`partial_refunded`** |

Üç ayrı sorun:

1. **Aynı olayın iki adı:** başarılı tahsilat defterde `success`, siparişte `paid`.
   Hangisinin otorite olduğu **hiçbir yerde yazılı değil**.
2. **Defter iadeyi temsil EDEMEZ:** `refunded` ve `partial_refunded` `payment_transactions`
   kısıtında **yok**. Oysa iade akışı canlı — `iyzico-refund` fonksiyonu, `refund_guard.ts`,
   `order_refund_events` tablosu mevcut. Defter dolmaya başladığı anda iade hareketleri
   **sığmaz** ve ya kısıt patlar ya da iade defterin dışında kalır.
3. **`cancelled` karşılıksız:** defterde var, `payment_status` sözlüğünde yok.

Bu, siparis-durumu / odeme-durumu ayrımının bir katman aşağısı: orada *sipariş durumu ≠
ödeme durumu* ayrımı vardı; burada **ödeme durumu ≠ ödeme OLAYI** ayrımı eksik.

## 3. Tasarım önerisi — defter olay kaydeder, sipariş durum taşır

Doğru ayrım şu: **`venthub_orders.payment_status` türetilmiş bir ÖZETTİR;
`payment_transactions` ise PSP olaylarının değişmez kaydıdır.** İkisi aynı sözlüğü
paylaşmamalı — ama aralarındaki eşleme **yazılı** olmalı.

Önerilen defter sözlüğü (PSP olay ekseni):

| Olay | Anlamı | Siparişe etkisi |
|---|---|---|
| `authorized` | Tutar bloke, tahsil edilmedi | `payment_status` değişmez (`pending`) |
| `captured` | Tahsil edildi | → `paid` |
| `failed` | PSP reddetti | → `failed` |
| `voided` | Otorizasyon iptal, tahsilat yok | → `failed` |
| `refunded` | Tam iade | → `refunded` |
| `partial_refunded` | Kısmi iade | → `partial_refunded` |

**Neden `success` yerine `captured`:** "başarı" bir yorum, "tahsil edildi" bir olgudur.
İyzico akışında otorizasyon ve tahsilat ayrı adımlar; tek bir `success` ikisini birbirine
karıştırır ve mutabakatı imkânsızlaştırır.

**Monotonluk:** CLAUDE.md §11 sipariş/iade durumlarının **yalnız ileri** gitmesini şart
koşuyor. Defter zaten append-only olmalı — satır **güncellenmez**, yeni olay satırı eklenir.
`updated_at` kolonunun varlığı bu ilkeye aykırı sinyal veriyor; defter satırı güncelleniyorsa
o defter değil, durum tablosudur.

### 3.1 `currency` varsayılanı `'TRY'` — kaldırılmalı

Kolon tanımı `currency text NOT NULL DEFAULT 'TRY'`. Bu, T094-VH'de kapatılan kusurun
veri katmanındaki eşdeğeri: **para birimi türetilmez, taşınır.** Varsayılan bir değer,
çağıranın para birimini yazmayı unutmasını **sessiz** hale getirir ve çoklu-para satış
sözleşmesini (`pricing-standard.md §4.1`) bozar. Varsayılan kaldırılmalı, alan zorunlu
argüman gibi davranmalı.

### 3.2 `order_id` NULLABLE — ölçmeden kapatmıyorum

`order_id uuid NULL` (FK `venthub_orders`, `ON DELETE CASCADE`). Bu, siparişe bağlı olmayan
ödeme kaydına izin verir — yetim satır riski. **Ama** ön-otorizasyon veya sipariş
oluşmadan başlayan ödeme akışı varsa nullable **doğru** olabilir.

Şu an 0 satır olduğu için **davranışsal kanıt yok**. Kararı ödeme akışının gerçek sırası
ölçülmeden vermiyorum: sipariş mi önce oluşuyor, ödeme kaydı mı? Bu, uygulama aşamasının
ilk ölçümü olmalı.

> ⚠ `ON DELETE CASCADE` ayrıca dikkat ister: sipariş silinince **para hareketi kaydı da
> silinir**. Bir defter için bu yanlıştır — defterin amacı tam olarak "kayıt kalsın"dır.

## 4. Ne YAPILMAYACAK

- **Geriye dönük doldurma yok.** Mevcut 5 siparişin ödeme olayları defterlenemez: Edge
  fonksiyon logları 24 saatlik pencereyi aştı, PSP yanıtları elimizde yok. Uydurma kayıt
  üretmek defterin amacını baştan bozar.
- **Bu belge migration yazmaz.** Sözlük değişikliği, `DEFAULT` kaldırma ve CASCADE düzeltmesi
  **DDL** gerektirir; migration merge'i prod'a otomatik iner (CLAUDE.md §13) → Recep kapısı.

## 5. ÇELİŞEN-MEVCUT

| # | Çelişen şey | Nerede | Çözüm |
|---|---|---|---|
| 1 | `checkout-payment-standard.md` ödeme cetveli sayılıyor ama defteri kapsamıyor | Cetvel §1–§7 | Defter bölümü eklenecek. **Sahibi belirsiz** — dosya hiçbir şeridin glob'unda görünmüyor; AUDIT'e sordum. |
| 2 | `payment_transactions.status` iadeyi tanımıyor | Canlı CHECK kısıtı | Sözlük genişletilmeli → **migration, Recep kapısı** |
| 3 | `currency DEFAULT 'TRY'` | Canlı şema | Varsayılan kaldırılmalı → **migration, Recep kapısı** |
| 4 | `ON DELETE CASCADE` para hareketi kaydını siler | Canlı FK | Defter için yanlış; `RESTRICT`/`SET NULL` tartışılmalı → **migration** |
| 5 | `updated_at` kolonu append-only ilkesine aykırı sinyal | Canlı şema | Defter satırı güncellenmemeli; kolon kalacaksa gerekçesi yazılmalı |
| 6 | `admin-iyzico-reconcile` mutabakat yapıyor ama defter yok | Edge fonksiyonu | Mutabakat şu an `fn_admin_get_orders` üzerinden sipariş tablosuna bakıyor — yani **kendi kaydına değil, türetilmiş özete** karşı mutabakat. Defter gelince asıl kaynak değişmeli. |

## 6. Recep'ten beklenen

1. **Sözlük kararı** — defter PSP olay ekseninde mi olacak (§3 önerisi), yoksa sipariş
   sözlüğüyle mi hizalanacak?
2. **Migration onayı** — §5'teki 2, 3, 4 numaralı kalemler DDL gerektiriyor.
3. **Cetvel sahipliği** — defter bölümü `checkout-payment-standard.md`'ye mi eklenecek,
   ayrı `payment-ledger-standard.md` mi olacak?

Hiçbiri tek başıma verilecek karar değil. Uygulama, bu üç cevap gelmeden başlamaz.
