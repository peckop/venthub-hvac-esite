# Teklif/RFQ Standardı (cetvel) — v0.1

> **Kapsam:** Teklif talebi (RFQ) yaşam döngüsü — müşteri talebi, admin fiyatlaması,
> kabul/ret; `venthub_quotes` + `venthub_quote_items` şeması ve yüzeyleri.
> **Bekçi:** `src/__tests__/conformance/quote-machine-ssot.test.ts` (INV-QUOTE-1).
> **Doğuş sebebi:** T067-VH (2026-08-16) — "Teklif Alın" vitrinde tamamen görseldi:
> `quoteMode` hesaplanıyor, etiket basılıyor ama tıklanabilir akış/tablo/kuyruk YOKTU
> (grep boş ölçüldü). HVAC'ta fiyatı görünmeyen ürünün ticari yolu teklif olduğundan
> bu boşluk "satılamayan katalog" demekti.

## Q1 — Proje ≠ Teklif; teklif DONDURULMUŞ bir ticari nesnedir

İki kavram birleştirilmez (mimari karar, Recep 2026-08-16):

- **Proje** (`user_projects` + `project_items`) = müşterinin YAŞAYAN çalışma listesi.
  Düzenlenebilir, durumsuz. Mevcut servis korunur.
- **Teklif** (`venthub_quotes` + `venthub_quote_items`) = talep ANINDAKİ snapshot.
  `quote_items` içerik kopyasıdır (`product_id` bağı + `product_name`/`qty` snapshot);
  `project_items` satır ID'leri KOPYALANMAZ. Sipariş-kalemi ilkesiyle aynı sebep:
  fiyatlanan liste, müşteri projeyi/ürün adını değiştirince KAYMAMALI.
- `source_project_id` yalnız izlenebilirliktir (`ON DELETE SET NULL`) — proje silinse
  teklif yaşar. Aynı projeden birden çok teklif istenebilir.

## Q2 — Durum makinesi TEK SSOT'tan yaşar; terminaller soğurucudur

Makine: `requested → quoted → accepted | rejected | expired` (+ `requested → rejected`).

- **SSOT = `src/lib/quotes/quoteStatusMachine.ts`** (`QUOTE_TRANSITIONS` haritası).
  UI aksiyonları `allowedNextQuoteStatuses()` üzerinden türer; ikinci bir geçiş listesi
  (kopya switch/if zinciri) yazılamaz.
- **DB tetiği aynı haritayı zorlar** (`enforce_quote_status_transition`). UI bypass
  edilse bile (doğrudan PostgREST çağrısı) izinsiz geçiş DB'de patlar.
- **Terminaller SOĞURUCU:** `accepted`/`rejected`/`expired`'dan ÇIKIŞ YOKTUR — iade
  makinesi dersi (geri yürüyen statü, para/söz tutarlılığını bozar).
- Rol ayrımı: `requested→quoted` ve `requested→rejected` admin aksiyonudur;
  `quoted→accepted` ve `quoted→rejected` müşteri kararıdır; `quoted→expired`
  `valid_until` geçince admin/operasyon aksiyonudur (v1'de otomatik cron yok).

## Q3 — Sahiplik + tenant RLS İLK GÜNDEN; fiyat alanlarını yalnız admin yazar

- `venthub_quotes`: SELECT = sahip (`user_id = auth.uid()`) VEYA admin
  (`is_admin_user()`); tüm politikalar `tenant_id = jwt_tenant_id()` kapsamında.
  İade regresyonu dersi (T057): sahiplik şartı "sonra optimize ederiz" diye
  düşürülmez — politika değiştiren migration şartı AYNEN taşımak zorundadır.
- INSERT = müşteri yalnız KENDİ adına (`user_id = auth.uid()`) ve yalnız
  `status='requested'` ile açar. Müşterinin UPDATE politikası kabul/ret kararıyla
  sınırlıdır (yalnız `quoted` durumundaki kendi teklifinde); fiyat kolonlarına
  (`unit_price`, `currency`, `valid_until`) müşteri yazamaz — bu kolonlar admin
  UPDATE yolundan doldurulur.
- `venthub_quote_items` sahipliği quote üzerinden türer (EXISTS bağı); kalem ekleme
  yalnız `requested` durumundaki kendi teklifine yapılabilir (fiyatlanmış listeye
  sonradan kalem sokulamaz — snapshot ilkesinin devamı).

## Q4 — v1 giriş kapıları: PDP + sepet; teklif LOGIN'lidir

- Teklif isteme CTA'sı `quoteMode` ürünlerde PDP'de ve sepette yaşar (misafir teklifi
  v1'de YOK; oturum yoksa CTA login'e yönlendirir, `?redirect=` dönüş yolu ile).
- Proje→teklif köprüsü v1.1'dir: `/account/projects` listelemesi master'a indikten
  sonra proje detayına tek buton (o anki kalemleri kopyalar; Q1 gereği yalnız OKUR).
- Rotalar SSOT'tan: `Routes.account.quotes()` / `quoteDetail(id)` — INV-AUTH-2 R1
  gereği rota ile sayfası AYNI PR'da gelir.

## Q5 — Render/önbellek ilişkisi: GEREKÇELİ YOK

`rendering-cache-standard.md`'nin "statik yüzeyde görünen her tablonun DB tetiği +
revalidate dalı olmalı" şartı bu modüle **uygulanmaz**, çünkü teklif verisi hiçbir
statik/ISR yüzeyde görünmez: `/account/quotes*` ve `/admin/quotes` client-fetch
`force-dynamic` sayfalardır; vitrin yalnız fiyat-yokluğundan türeyen `quoteMode`
BAYRAĞINI gösterir (o bayrağın tazeliği pricing cetvelinin işidir, bu tablonun değil).
**Sınır şartı:** teklif verisi bir gün statik yüzeye çıkarsa (ör. "son teklifler"
bloğu), o PR aynı gün DB tetiği + revalidate dalını da getirmek zorundadır.

## Q6 — Bildirim: v1'de yalnız admin→müşteri yönü çalışır

- "Teklifiniz hazır/sonuçlandı" → admin tarayıcısından `notification-service`
  (Resend) çağrılır; kapısı (`resolveCaller` → service_role|admin) bunu zaten geçirir.
  Best-effort'tur: e-posta hatası statüyü geri almaz (iade deseniyle aynı).
- "Talebiniz alındı" müşteri e-postası v1'de **BİLEREK YOK**: müşteri tarayıcısı
  `notification-service` kapısından geçemez. Çözüm (yeni edge fonksiyonu ya da pg_net
  tetiği) EDGE-OPS mülküdür → v1.1 iş emri (registry). Bu boşluk "yapıldı sanılan
  boşluğa" dönüşmesin diye burada ve registry'de KAYITLIDIR.

## Q7 — Admin yüzeyi ev desenlerinden çıkmaz

`/admin/quotes` = DataTableKit + `useAdminTable` (server-mode) + `mutateWithAudit`
(her statü geçişi `admin_audit_log`'a düşer) + `admin-resources.ts` kaydı (S1: kayıtsız
rota menüde görünmez). Yeni sayfalar kendi dizininde (`views/admin/quotes/`) kalır;
MainLayout/kit çekirdeğine dokunulmaz.

## Q8 — Kapsam dışı (v1) — bilinçli kesimler

Bayi/CPQ fiyat merdiveni entegrasyonu (R2) · PDF teklif çıktısı · teklif→sipariş
otomatik dönüşüm/ödeme (v1'de kabul yalnız statüdür; sipariş dönüşümü iskeleti v2) ·
misafir teklifi · otomatik expiry cron'u · proje→teklif köprüsü (v1.1).

---

## INV-QUOTE-1 kuralları (bekçi sözleşmesi)

| # | Kural | Sebep |
|---|-------|-------|
| R1 | `QUOTE_TRANSITIONS` haritası kaynak kodda TEK yerde tanımlanır; `views/`/`components/` içinde quote statü-geçiş listesi/switch'i yazılamaz | Q2 — kopya makine drift eder |
| R2 | Migration'daki `enforce_quote_status_transition` gövdesi SSOT'taki TÜM geçişleri içerir, fazlasını içermez | Q2 — UI/DB simetrisi |
| R3 | Terminal durumlardan (`accepted`,`rejected`,`expired`) çıkan geçiş ne SSOT'ta ne migration'da bulunur | Q2 — soğurucu terminal |
| R4 | `venthub_quotes`/`venthub_quote_items` RLS politikaları sahiplik (`auth.uid()`) VE `tenant_id` şartını birlikte taşır | Q3 — T057 regresyon dersi |
| R5 | Müşteri yüzü (`views/account`, `components/quotes`) fiyat kolonlarına (`unit_price`,`currency`,`valid_until`) YAZMAZ (insert/update payload'ında geçmez) | Q3 — fiyat otoritesi admin |
| R6 | `Routes.account.quotes` tanımlıysa `/[lang]/account/quotes` sayfası mevcuttur (INV-AUTH-2 R1 ile aynı sınıf) | Q4 — 404 sınıfı |

Bekçi çağrı-bazlı yazılır; yorum sıyırma `[^\r\n]` ile yapılır (CRLF fantomu,
T017/LEGAL dersi: `/--.*$/` bu depoda hiçbir şeyi temizlemez). Bekçinin kendisi
bilerek-boz kanıtıyla gelir (her kural en az bir kez kırmızı gösterilmiş olmalı).
