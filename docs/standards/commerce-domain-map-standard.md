# Ticaret Alan Haritası (Commerce Domain Map) — Standart

Durum: **TASLAK v0.3** (2026-08-19, OPS-AUDIT / T110-VH). v0.2 = EDGE'in üç ölçülmüş
itirazı (tablo adları prod'dan doğrulandı; bildirim köprüsü; iki-çalışma-zamanı gerçeği).
v0.3 = ADMIN'in status/payment_status ayrımı itirazı (DB kısıtlarından ölçüldü).
v0.4 = AUTH'un KVKK itirazı: eksik modül satırı + kolon-kapsamlı köprü biçimi (prod
fonksiyon gövdesinden ölçüldü). v0.5 = köprü-1 "HEDEF tasarım" olarak işaretlendi —
harita var olmayan bir DB değerini şart koşamaz (AUTH T105 ölçümü); T105 taslak-sipariş
tasarımı yansıtıldı. NLM danışması ve kalan itirazlar üzerine v1.0 olur.

## 1. Amaç ve kapsam

Bu cetvel, VentHub'daki ticari modüllerin **sınırlarını** ve aralarındaki **izinli
köprüleri** tanımlar. "Sipariş ekranında 'Teklif bekliyor' görünüyor" sınıfı sızıntıların
(bir modülün kavramının başka modülün yüzeyinde görünmesi) yapısal engeli budur.

Kural: kod ile bu harita çelişirse **sessiz sapma yasak** — ya kod haritaya uydurulur
ya harita gerekçeli bir PR ile güncellenir.

## 2. İki omurga

- **SATIŞ HATTI:** katalog → sepet → ödeme (İyzico) → sipariş → kargo → fatura → bildirim.
  Self-servis, B2C ağırlıklı. Durum otoritesi: sipariş durum makinesi.
- **PROJE HATTI:** lead (form/iletişim) → CRM → proje → teklif (RFQ) → *(köprü)* sipariş.
  Keşifli/B2B satış. Durum otoritesi: teklif durum makinesi.

İki omurga **ayrı durum makineleri** taşır. Birinin durumu diğerinin yüzeyinde ancak
§5'teki tanımlı köprülerden görünür; başka her görünüm ihlaldir.

## 3. Modül envanteri ve mevcut durum (2026-08-19 ölçümü)

| Modül | Durum | Ana veri | Açık iş |
|---|---|---|---|
| Katalog | canlı | products, categories, product_variants | ürün-adı çözücü (T098) |
| Sepet + Ödeme | canlı | venthub_orders, venthub_order_items | — |
| Sipariş yönetimi | canlı | venthub_orders (durum makinesi) | sözlük-etiket kaçağı (T108) |
| Kargo/Lojistik | canlı | shipping_* | — |
| İade | kısmi | returns | gerçek iade akışı eksik |
| Satınalma | v1 (T062) | purchasing_* | stok motor köprüsü kapalı |
| Teklif/RFQ | v1 (T067) | venthub_quotes | sipariş köprüsü YOK (T105) |
| Zamanlanmış bakım | yeni (#675) | cron.job (pg_cron) | order-housekeeping + release-expired-reservations; sipariş durumu **yazan** aktördür, 08-19'a kadar hiç çağrılmıyordu |
| Lead/CRM | **eksik** | contact_messages (kısmi) | formlar sahteydi (T104); CRM modülü yok |
| Bayi | kısmi | pricing segmentleri | bayi-atama ekranı yok (T106) |
| Fatura/Muhasebe | **yok** (ama `user_invoice_profiles` tablosu canlı ve KVKK kapsamında) | user_invoice_profiles | karar paketi T107 (hukuki boyutlu, Recep kararı) |
| Bildirim | kısmi | — | sipariş-yaşamdöngüsü bildirimleri eksik |
| Hukuki uyum / KVKK | canlı | data_subject_requests, anonymize_user_personal_data() | cetveli: `legal-compliance-standard.md`; admin defteri #612, müşteri kanalı #637 |

## 4. Kavram otoriteleri (tek kaynak)

- **Sipariş durumu İKİ AYRI SÖZLÜKTÜR, karıştırmak sessiz kusur üretir:**
  - `status` otoritesi = DB kısıtı `venthub_orders_status_check` (**6 değer:** pending,
    confirmed, processing, shipped, delivered, cancelled);
  - `payment_status` otoritesi = `venthub_orders_payment_status_check` (**5 değer:** pending,
    paid, failed, refunded, partial_refunded).
  - `orderStatusMachine.ts` (OrderBoardStatus) bu iki kolonun **birleşimidir** — panonun
    efektif kümesidir, `status` kolonunun SSOT'u DEĞİLDİR. Ödenen bedel yaşandı: stok
    düşürme kapısı `status IN (paid, processing)` yazılmıştı; `paid` hiçbir zaman geçerli
    bir `status` olmadığı için **satışta stok hiç düşmedi** ve işlem "başarılı" damgalandı.
  UI'da durum listesi otoriteden **türetilir**; elle kopyalanmış küme (switch/enum
  kopyası) yasaktır. Etiket her zaman sözlükten gelir; ham DB dizesi basılamaz. (T108 dersi.)
  **İki çalışma zamanı uyarısı:** otorite TS modülüdür ama sözlüğü iki çalışma zamanı paylaşır
  (web + Deno edge fonksiyonları); Deno tarafı bu modülü import **edemez**, sözlüğü tekrarlar.
  Bağlayıcı olan INV kapısıdır (`order-status-dictionary.test.ts`), import değil — aksi
  yaşandı: order-housekeeping DB kısıtında olmayan `failed` yazıyor, hata yutuluyordu.
- **Teklif kavramı** yalnız PROJE HATTI yüzeylerinde yaşar: sipariş-yüzeyi sözlük
  anahtarlarında "teklif/quote" kavramı geçemez.
- **Para birimi:** `currency` zorunlu argümandır, arayüz dilinden türetilmez (INV-CURRENCY-1).
- **Ürün görünen adı:** çözücü fonksiyon üzerinden (T098); `model_code || sku` gibi ham
  geri-düşüşler müşteri yüzeyinde yasak.
- **Kişisel veri kavramı:** otorite `legal-compliance-standard.md` §3.4 tablosudur (hangi
  veri silinir / anonimleştirilir / ellenmez). Yeni bir modül kişisel veri tutmaya
  başlarsa o tabloya satır eklemek modül sahibinin yükümlülüğüdür — sessiz sapma buradan girer.

## 5. İzinli köprüler (kapalı liste)

1. **teklif → sipariş** (T105, **HEDEF tasarım — bugün mevcut DEĞİL**): teklif kabul
   edilince sipariş *taslak olarak yaratılır* ve mevcut ödeme akışına devredilir (ikinci
   para yolu açılmaz); sipariş teklife yalnız `converted` durumu ve `converted_order_id`
   yazabilir, teklif siparişin durumuna dokunamaz. DB gerçeği (AUTH ölçümü 08-19):
   `venthub_quotes_status_check`'te `converted` değeri ve `converted_order_id` kolonu
   YOK — köprü migration ister (Recep kapısı); prod'da 0 teklif olduğundan göç yükü sıfır.
2. **bayi → fiyat:** bayi segmenti fiyat çözümlemesine girdi verir (pricing servis katmanı).
3. **lead → teklif:** CRM lead'i tekliflendirilebilir; ters yön yok.
4. **satınalma → stok:** alış kaydı stok girişi üretir (motor köprüsü v1'de bilinçli kapalı).
5. **X → bildirim (tek yönlü):** modüller bildirim ucunu tetikleyebilir (örn. venthub_quotes
   INSERT → pg_net → quote-notification-webhook → e-posta; sipariş → order-confirmation).
   Bildirim modülü hiçbir modülün durumunu **yazamaz** — yalnız okur; tek istisna kendi
   idempotency damgası (örn. `request_email_sent_at`).
6. **KVKK anonimleştirme → tüm kişisel-veri taşıyan modüller (tek yönlü, kolon-kapsamlı,
   koşullu):** veri sahibi silme talebi kabul edilince `anonymize_user_personal_data()`
   dokuz tablodaki kişisel alanları siler ya da anonimleştirir. Üç sınır: (a) saklama
   yükümlülüğü altındaki kayda DOKUNULMAZ (VUK/TTK; KVKK m.7 istisnası); (b) süresi dolmuş
   kayıtta yalnız kişisel alanlar değişir — tutar, tarih, kalemler KORUNUR; (c) hiçbir
   modülün DURUM MAKİNESİNE yazılmaz. Ters yön yok; yetki kapısı gövdededir
   (SECURITY DEFINER + is_admin_user), varsayılan kuru çalışmadır. Davranışı Konfigürasyon'dan
   okur (`legal.ts` saklama süreleri). Cetvel: `legal-compliance-standard.md` §3.4.

Köprü ifade biçimi: bir köprü yalnız "X, Y'ye yazar" değil, **"X, Y'nin ŞU kolonlarına
ŞU koşulda yazar"** biçiminde (kolon-kapsamlı, koşullu) da tanımlanabilir — 6. madde örnektir.
Bu listede olmayan her modüller-arası yazım/okuma bağımlılığı ihlaldir; yeni köprü
ancak bu cetvele madde ekleyen bir PR ile açılır.

## 6. Kapılar

- Mevcut: `order-status-dictionary.test.ts`, INV-CURRENCY-1, INV-KVKK-1, INV-LEGAL-3.
- Hedef **INV-DOMAIN-1:** sipariş-yüzeyi sözlük anahtarlarında teklif kavramı taraması.
- Hedef **INV-DOMAIN-2:** durum-kümesi kopyası taraması (ilk biçimi T108 PR'ında).
- Hedef **INV-PRODUCT-IDENTITY:** ham ürün-kimliği render yasağı (T098 PR'ında).

## 7. Canlıya çıkış için boşluk kapatma sırası

T104 (formlar gerçek yazsın) → T105 (teklif→sipariş köprüsü) → T106 (bayi-atama ekranı) →
T107 (fatura karar paketi) → bildirim tamamlama → gerçek iade akışı.

Gerekçe: önce müşteri girdisi kaybolmasın (T104), sonra iki omurga birbirine tek köprüyle
bağlansın (T105), sonra B2B farklılaştırıcı (T106); fatura hukuki karar istediği için
paralel karar paketi olarak ilerler.
