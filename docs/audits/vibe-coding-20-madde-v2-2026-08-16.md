# Vibe-Coding 20-Madde Denetimi v2 — Delta + Sınır Bölgeleri

> **Tarih:** 2026-08-16 · **Kapsam:** origin/master @ `d044d183` + iki yeni modül (teklif, satınalma) ·
> **Yöntem:** 10 paralel Opus bulucu (Madde 1-19, ikişerli) → hedefli adversaryal doğrulama turu
> (doğrulanmamış her CRITICAL/HIGH bulguya 1 Opus skeptik: dosyayı açıp yeniden üret, savunma katmanı
> ara, şiddeti yer-gerçeğine göre derecele, lansman-engeli mi karar ver). Toplam 40 ajan, ~3.7M token.
> **Öncül:** `docs/audits/vibe-coding-20-madde-denetimi-2026-08-13.md` (v1, 3 PASS/4 PARTIAL/12 FAIL,
> kök neden edge bozulması → o gün onarıldı, T011/#494).

---

## TL;DR — bir cümle

**20 HIGH/CRITICAL aday bulgunun adversaryal doğrulamadan geçen tek gerçek lansman-engeli:
`iyzico-refund` fonksiyonunda müşteri kendi ödenmiş siparişi için admin onayı olmadan gerçek para
iadesi başlatabiliyor (CRITICAL, CONFIRMED).** Geri kalan 19'un tamamı ya bir savunma katmanıyla
sönümlendi ya da tek-tenant/lansman-yakın yer-gerçeğinde MED/LOW borca indi — ama altısı CONFIRMED
gerçek kusur ve lansman-sonrası ilk dalgada kapatılmalı.

## Neden bu denetim değerli — doğrulama disiplininin kanıtı

Bulucular 93 ham bulgu üretti; en tepesi kulağa felaket gibiydi (üç ayrı ajan iyzico-refund'ı CRITICAL
işaretledi, admin.ts "rol-ezme", çoklu-refund yarışı). Adversaryal tur bunların **çoğunun şiddetini
düşürdü** — savunma katmanları (RLS backstop, fail-closed prod dalı, token-refresh sınırı, append-only
alarm) iddiaların yıkıcı kısmını çürüttü. Sonuç: **1 CRITICAL blocker, 6 CONFIRMED-MED, 13 DOWNGRADED,
1 KNOWN-DUP.** Bu, "tabansız denetçi hep bulgu üretir" tuzağının ([[audit-severity-floor-and-stop-rule]])
adversaryal turla nasıl kırıldığının somut örneği.

---

## 🔴 LANSMAN-ENGELİ (1) — ilk gerçek ödeme akışı canlıya alınmadan kapatılmalı

### B1 · iyzico-refund müşteri self-iadesi (CRITICAL · CONFIRMED)
`supabase/functions/iyzico-refund/index.ts:174` — AuthZ kapısı `if (!(isAdmin || isOwner)) return 403`
sipariş sahibini de geçiriyor; kapıdan sonra `payment_status`/`status`/`venthub_returns` üzerinde
**hiçbir koşul yok** (tek şart `total_amount>0` ve `remaining>0`). Fonksiyon tüm DB erişiminde
service-role kullandığı için **RLS backstop yok**; `config.toml`'da ayrı blok olmadığından `verify_jwt`
yalnız geçerli JWT ister (müşteride var); admin UI kapısı ucu korumaz (`functions.invoke` ile doğrudan
çağrılır). **Sonuç:** teslim edilmiş/ödenmiş bir siparişte müşteri kendi JWT'siyle `POST` atarak tam
para iadesi alır, üstelik `process_order_stock_restore` da çağrıldığından stok geri yazılır — ürün ve
para müşteride kalır. Doğrulayıcı kanıtı koddan birebir yeniden üretti.
**Fix:** kapıdan `isOwner`'ı kaldırıp iade başlatmayı yalnız admin'e (ya da admin-onaylı bir
`venthub_returns` kaydına) bağla; müşteri self-iade yolunu tümüyle kapat. *Sahip: EDGE (iyzico-refund
claim'inde).* → **iş emri T071-B1, EDGE'e adresli.**

---

## 🟠 CONFIRMED-MED — gerçek kusur, lansman-sonrası ilk dalga (6)

| # | Yer | Kusur | En küçük fix |
|---|---|---|---|
| M1 | `orderStatusService.ts:253` | `syncOrderFromReturn` 'received' adımında `payment_status='refunded'` yazıyor ama İyzico çağrısı yalnız 'refunded' adımında — mal geldi, para çıkmadı; kayıt yalan (muhasebe bütünlüğü, tüccar-lehine yön). Gerçek iade kaybı YOK (guard `refunded_total`'a bakıyor, `payment_status`'a değil). | `received` girdisini map'ten çıkar / `payment_status`'suz map'le |
| M2 | `order-housekeeping/index.ts:88,97` | Sözlükte olmayan `status:'failed'` PATCH; 400 yutuluyor, sipariş `pending` kalıyor ama `{ok:true,failed:[id]}` raporluyor → kalıcı pending + sonsuz sahte rapor. Kardeş `release-expired` doğru değeri kullanıyor. | `{status:'cancelled', payment_status:'failed'}` (kardeşin deseni) |
| M3 | `ReturnsTableBody.tsx:426` | İade statü geçişinde sunucu-tarafı optimistic-concurrency yok (`.eq('id')` var, `.eq('status',old)` yok, DB tetiği yok) → iki-sekme yarışında terminal `refunded` kaydı `cancelled`'a geri yürüyebilir. | `.eq('status',oldStatus)` + 0-satır = bayat-okuma hatası |
| M4 | 14 edge fn (`notification-service:14` …) | Ölü `'superadmin'` yazımı kapı olarak kullanılıyor; DB kanonik `super_admin` → en yetkili kullanıcı 11+ uçtan 403 alıyor (teklif fiyat e-postası sessizce gitmiyor vb). Bekçi eski sözleşmeyi çiviliyor. | Her kapıya kanonik `'super_admin'` ekle; bekçiyi düzelt |
| M5 | `purchasing_t062_core.sql:436` | `purchase_order_items` kolon-grant yok → `qty_received`/`unit_cost` admin RLS ile doğrudan PATCH'lenebilir ("yalnız RPC yazar" değişmezinin DB karşılığı yok). Teklif modülü kolon-grant kullanmış, satınalma kullanmamış. | quotes_v1 deseni: `revoke update … from authenticated` + kolon-grant |
| M6 | `purchasing_t062_core.sql:57` | `purchase_orders` durum-geçiş tetiği yok (yalnız TS'te zorlanıyor); RLS koşulsuz UPDATE veriyor → elle `status='received'` PATCH'i mal kabulünü kilitleyebilir. Teklif modülü tetik almış, satınalma almamış. | quotes'taki `enforce_quote_status_transition`'ın PO karşılığı |

**Örüntü:** M4/M5/M6 üçü de "aynı gün merge edilen teklif modülü doğru deseni uyguladı, satınalma
uygulamadı" — [[substring-assert-is-not-a-gate]] ailesinden bir kapı-körlüğü: INV-PURCH-1 sözlük
paritesini ve kaynak-tarama assert'lerini geçti ama DB-tarafı tetik/kolon-grant VARLIĞINI hiç sormadı.

## 🟡 DOWNGRADED / KNOWN-DUP — kayıtlı borç, lansman-engeli değil (13)

En dikkat çekenler (savunma katmanı iddiayı neden sönümledi):

- **#11 admin.ts rol-ezme (HIGH→MED):** liste gerçekten istemci rolünü e-postayla `super_admin`
  yapıyor AMA hiçbir sunucu/DB yolu bu listeye güvenmiyor (RLS + `is_admin_user()` gerçek JWT'ye
  bakıyor) → yalnız istemci-UI kabuğu açılır, veri yetkisi yok. Yine de tipo-varyant e-posta + public
  repo temizlenmeli. **Fix:** e-posta-öncelikli dalları ve `isEmailAdmin` bypass'ını sil.
- **#12 IYZICO_BASE_URL fail-open (HIGH→MED):** gerçek asimetrik fail-open, AMA üç fonksiyon da AYNI
  env'i okuyor (split-brain yok) → hepsi ya prod ya sandbox; senin lansman listendeki "İyzico prod +
  BASE_URL BİRLİKTE" maddesi bunu zaten kapatıyor. **Yine de fix ucuz:** BASE_URL'i CONFIG_ERROR
  varlık-kontrolüne ekle (fail-closed). *Bu bulgu senin S5 provanın neden kritik olduğunu kanıtlıyor.*
- **#7 çoklu-refund yarışı (CRITICAL→MED):** genel yarış gerçek (FOR UPDATE yok) ama bulgunun kendi
  senaryosu kendini çürütüyor — aynı `full:<order_id>` anahtarına düşen tam-iptaller zaten unique
  ile bloklanıyor; sömürü yalnız parsiyel + eşzamanlı + farklı-anahtar dar penceresinde. **Fix:**
  `refund_attempts` INSERT'e sipariş-toplamı tetiği.
- **#0 KVKK anonymize RPC (KNOWN-DUP):** kök neden T047 (`is_admin_user()` 3. dalı user_metadata) —
  zaten kayıtlı ve LATENT (hook açıkken 3. dal hiç değerlenmiyor). KVKK RPC onu miras alıyor, yeni
  açık değil. T047 fix'i (fallback dalını sil) bunu ve diğer tüm kapıları birden kapatır.
- **#1 claims-cache exp yok** · **#6 shipping-webhook RANK** (T058 uykuda) · **#10 edge timeout yok** ·
  **#13→M4 ile örtüşür** · **#15 sunucu Sentry başlatılmıyor** (gözlem borcu) · **#16 quote 0-satır
  sahte-başarı** (RLS+tetik+kolon-grant üçlüsü zaten koruyor) · **#19 edge hata-zarfı tüketilmiyor** ·
  **#4 kısmi-düşme maskesi (HIGH→LOW:** append-only alarm kalıcı, "iz yok" iddiası çürük) ·
  **#9 quote arama IN() patlaması** · **#14 A18 audit boşluğu (HIGH→LOW).**

---

## 20-Madde v2 Karnesi (v1 → v2 kıyas)

Başarısızlıkların çoğu v1'de **tek kök nedende (edge bozulması)** toplanmıştı; o kapatıldı. v2'de
tablo dağıldı: kalan kusurlar **yeni modüllerin (teklif/satınalma) DB-tarafı kapı boşlukları** ve
**iade/ödeme akışının authZ/tutarlılık dikişleri**. Ön-yüz/altyapı (3D, bellek, RLS tasarımı, kural-12
cache anahtarları, conformance omurgası) sağlam kaldı. **Tek CRITICAL** (refund IDOR) v1'de üretimde
olmayan `iyzico-refund`'ın bu arada gerçeklenmesiyle doğdu.

> **Bekçi dersi (hepsine ortak):** conformance kapıları KAYNAK-KOD desenini iyi kovalıyor ama
> **DB-tarafı değişmezleri** (durum tetiği var mı, kolon-grant var mı, 0-satır etkisi) ve **runtime
> authZ**'yi (service-role fonksiyonda isOwner) göremiyor. Dalga-2 kapı işi bu eksene odaklanmalı.

## Önerilen iş sırası

1. **Hemen (lansman-engeli):** B1 refund IDOR → EDGE, T071-B1.
2. **İlk dalga (CONFIRMED-MED):** M1-M6 → sahipleri (EDGE: M1/M2/M4, ADMIN: M3, PRICING: M5/M6).
3. **İkinci dalga (DOWNGRADED, ucuz+değerli):** #12 BASE_URL fail-closed · #11 e-posta-rol sil ·
   #7 refund toplam-tetik · #16/#19 zarf tüketimi · #15 Sentry instrumentation.
4. **Kök-sebep tek atış:** T047 fix (`is_admin_user()` user_metadata dalını sil) → #0 + latent sınıfı kapatır.
5. **Kapı genişletme:** DB-tetik-varlığı + kolon-grant-varlığı + 0-satır assert'leri INV-* kapılarına.

> İş emirleri: registry **T071** (bu denetim) + **T071-B1** (refund IDOR, HIGH-öncelik, EDGE).
> Ham çıktı: 20-madde `wf_31722bcf-783`, doğrulama `wf_bb77c7aa-f05` (40 ajan). Migration YOK.
