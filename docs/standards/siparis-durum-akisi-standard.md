# Sipariş Durum Akışı Cetveli

> **Durum:** v1.0 · 2026-10-01
> **Sahibi:** ALTYAPI (admin yüzeyi için ADMIN, müşteri yüzeyi için URUN, Edge için EDGE ikincil)
> **Son doğrulama:** 2026-10-01 (canlı sipariş sayımı salt okuma; §4 yüzey tablosu kaynak dosyalardan, işi yapmamış bir doğrulayıcıyla teyit edildi; mutasyon 8/8 öldü)
> **Niçin var:** Sipariş durumunun hangi sırayla ilerlediği yalnız `orderStatusMachine.ts` içindeki
> bir yorumda yazılıydı. 2026-10-01 ölçümünde aynı kuralın **beş ayrı yerde beş ayrı kopyası**
> bulundu ve hiçbiri diğeriyle aynı değildi (§4). Recep'in 221 numaralı kararı ("ödeme alınır,
> ürün hazırlanır ve kargoya verilir; hazırlanıyor bilgisi müşteri ekranında da görünebilir")
> kuralı değiştirdi; kuralın yazılı tek yeri olmadığı için değişiklik tek satırla bitmiyordu.
> Bu dosya o yeri kurar.

## KAYNAK / CETVEL

| | |
|---|---|
| **Karar** | 221 (Recep, 2026-10-01): "hazırlanıyor" adımı zorunlu; onaylandı → kargoda kestirmesi kalkar. |
| **Üst kural** | CLAUDE.md kural 11: sipariş ve iade durumları monoton (yalnız ileri). |
| **Ölçüm kaydı** | Mutasyon testi ilk koşusu (REC-535, mutant S08) ve ALT-1 ölçümü (2026-10-01): canlıda `confirmed` durumunda 0 sipariş. |
| **Komşu cetveller** | `admin-standard.md` (admin sayfası) · `edge-function-security-standard.md` (Edge) · `payment-ledger-standard.md` (ödeme defteri; ödeme durumu oradan türer) |
| **Kapsamadığı** | İade durum akışı (`returnStatusMachine.ts`) · ödeme durumu (`payment_status`) · teklif durumları. |

## 1. Tek akış

```
pending ─┐
         ├─→ confirmed ─→ processing ─→ shipped ─→ delivered
paid ────┘   (Onaylandı)  (Hazırlanıyor) (Kargoda)  (Teslim edildi)
```

| Durum | Anlamı | Veritabanı kolonu |
|---|---|---|
| `pending` | Sipariş alındı, ödeme bekleniyor | `venthub_orders.status` |
| `paid` | Ödeme alındı (panoda "Yeni" sütunu) | `payment_status`tan türer; `status` değeri DEĞİLDİR |
| `confirmed` | Sipariş onaylandı | `status` |
| `processing` | Ürün hazırlanıyor | `status` |
| `shipped` | Kargoya verildi | `status` |
| `delivered` | Teslim edildi | `status` |
| `cancelled` | İptal (terminal) | `status` |
| `refunded` / `partial_refunded` | İade (terminal / tam iadeye tamamlanabilir) | `payment_status` |

Değer kümelerinin otoritesi `src/lib/admin/orderStatusDomain.ts`tir (canlı CHECK kısıtından ölçülmüştür).

## 2. Değişmezler

1. **Yalnız ileri.** Hiçbir durumdan zincirde geriye gidilmez (kural 11).
2. **Kargoya yalnız `processing`ten girilir** (karar 221). `pending`, `paid` ve `confirmed`
   durumundaki sipariş doğrudan `shipped` yapılamaz.
3. **İptal** teslimden önce her aşamadan mümkündür; teslimden sonra tek çıkış iadedir.
4. **İade** (tam ya da kısmi) her aşamadan mümkündür; kısmi iade yalnız tam iadeye tamamlanır.
5. `cancelled` ve `refunded` terminaldir.
6. Bilinmeyen durum kilitlidir (fail-closed): hiçbir geçişe izin verilmez.

## 3. Tek kaynak

Geçiş kuralının TEK kaynağı `src/lib/admin/orderStatusMachine.ts` içindeki `TRANSITIONS` haritasıdır.

- Durum yazan her web yolu `canTransitionOrder` üzerinden geçer; kendi sıra listesini YAZMAZ.
- Asıl kapı serviste durur (`orderStatusService.updateOrderStatus`). Arayüzdeki kontrol kullanıcıya
  sebebini söyleyen nezaket katmanıdır; tek koruma orada olursa bileşen değişince sessizce düşer.
- Edge fonksiyonu (Deno) `src/` altını içe aktaramaz. Edge'de kural kopyası gerekiyorsa kopya TEK
  sabit olarak durur ve bir **parite testi** onu makineyle karşılaştırır (emsal: iade tarafında `supabase/functions/_shared/return_transitions.ts` ↔ `returnStatusMachine.ts`, kapısı `returns-webhook-transitions.test.ts`).
- Müşteriye gösterilen adım çubuğu ve durum etiketi tek bir eşleme yardımcısından üretilir;
  bilinmeyen durum ham olarak basılmaz.

## 4. Kuralın bugünkü kopyaları ve borç (2026-10-01 ölçümü)

| Yüzey | Dosya | Tek kaynağa bağlı mı | Sahip · kart |
|---|---|---|---|
| Durum servisi | `src/lib/orderStatusService.ts` | EVET | ALTYAPI · ALT-1 |
| Sipariş panosu | `src/views/admin/AdminOrdersBoard.tsx` | EVET, ama siparişi `processing`e alan hedef sütun yok | ADMIN · ADM-1 |
| Sipariş düzenleme formu | `src/components/admin/orders/OrderFormModal.tsx` | HAYIR: kendi `STATUS_FLOW` listesi, `processing` yok | ADMIN · ADM-1 |
| Kargo gönder / Lojistik → `admin-update-shipping` | `supabase/functions/admin-update-shipping/index.ts` | HAYIR: mevcut duruma bakmadan `shipped` yazar | EDGE · EDG-1 |
| Kargo firması webhook'u | `supabase/functions/shipping-webhook/index.ts` | HAYIR: kendi `RANK` tablosu, `processing` yok | EDGE · EDG-2 |
| Müşteri sipariş ekranları | `src/views/OrdersPage.tsx`, `src/views/account/OrderDetailPage.tsx` | HAYIR: 4 adım, `processing` ham basılıyor | URUN · URN-1 |
| Veritabanı | `venthub_orders` | Geçiş sırasını denetleyen tetik yok | ALTYAPI · ALT-3 (migration) |

**Birleşme sırası (çıkmaz yol olmasın):** admin arayüzü (ADM-1) ve müşteri ekranı (URN-1) önce;
makine değişikliği (ALT-1) onlar canlıda ölçüldükten sonra; Edge bekçisi (EDG-1) en son. Makine
önce girerse onaylanmış sipariş panodan kargoya verilemez; Edge bekçisi önce girerse admin
"Kargo gönder" ekranında reddedilir ve siparişi hazırlığa alacak düğmesi olmaz.

## 5. Kapılar

| Kapı | Dosya | Neyi tutar |
|---|---|---|
| Değişmez 2 | `src/lib/admin/__tests__/statusMachines.test.ts` ("hazırlanıyor adımı ATLANAMAZ") | Dokuz durumdan yalnız `processing` `shipped`e girebilir. Herhangi bir kestirme eklenirse kırmızı (mutasyon S08 dahil). |
| Değişmez 1 | aynı dosya ("hiçbir aşamadan geriye gidilemez") | Geri geçiş eklenirse kırmızı. |
| Servis kapısı | `src/lib/__tests__/orderStatusService.test.ts` ("hazırlanıyor atlanarak kargoya verilemez") | Kural serviste uygulanır ve reddedilen geçişte veritabanına yazılmaz. |

Yeni bir yüzey durum yazmaya başlarsa §4 tablosuna satırı eklenmeden iş bitmiş sayılmaz.
