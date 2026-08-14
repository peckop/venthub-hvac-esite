# Canlıya Alma Hazırlık Denetimi — 2026-08-15

> **Şerit:** LAUNCH (oturum `eda80084`) · **Kapsam:** salt-okuma. Prod DB + repo ölçüldü, hiçbir şey değiştirilmedi.
> **Amaç:** İki eş-Controller (PRICING, EDGE) dikey işlerini yürütürken kimsenin bakmadığı **yatay** soruyu
> cevaplamak: *"Bu site bugün canlıya çıkarsa müşteri ürün alabilir mi, hukuken satabilir miyiz?"*
> **Yöntem:** iddia yok — her madde prod DB sorgusu veya dosya/satır referansıyla kanıtlı.

## 0. Tek cümlelik cevap

**Hayır.** Teknik altyapı (fiyat motoru, RLS, SEO, e2e kapıları) beklenenden iyi durumda; **canlıya çıkışı
engelleyen şeyler kod değil İÇERİK ve TİCARİ/HUKUKİ hazırlık** — 0 görsel, 0 fiyat satırı, taslak damgalı
sözleşmeler, sahte iletişim bilgisi. Bunların hiçbiri açık iki şeridin kapsamında değil.

---

## 1. KIRMIZI — bunlar çözülmeden canlıya çıkılmaz

### K1 · Katalogda tek bir ürün görseli yok
**Kanıt (prod DB, 2026-08-15):**
```
active_products = 374 · product_images = 0 · products_with_image = 0
```
374 aktif ürünün tamamı görselsiz. HVAC vitrininde ürün görseli olmadan satış hunisi çalışmaz;
kategori/PDP/aile kartlarının tamamı boş çerçeve gösterir.
**Not:** CSV'ler 187 görsel dosyası beyan ediyordu, ingestor diskinde bulunamamıştı (bkz. DURUM-TAKIP "Bulgular").
**İş emri:** `T003-VH` (open, sahipsiz) · **Kilit:** Recep'ten görsel dosyaları.

### K2 · Fiyat tablosu boş → tüm katalog "Teklif Alın"
**Kanıt (prod DB):**
```
product_prices = 0 satır · products_priced = 0 · pricing_rule = 1
```
Fiyat **motoru** canlı (W0–W4b prod'da) ama **veri** yok. Yani bugün site açılsa 374 ürünün hiçbirinde
fiyat görünmez, sepet/checkout fiilen ölü — e-ticaret değil katalog sitesi olur.
**Sahibi:** PRICING şeridi (`f68f03d8`). Sıradaki adımı zaten bu: seed (348 ürün × 3 segment).
**Kilit:** Recep'in tek "evet"i (prod-yazım kapısı). **Bu, satışın açılıp açılmadığını belirleyen tek anahtar.**

### K3 · Hukuki metinler canlıda "TASLAK" damgalı, satıcı kimliği hiç yok
**Kanıt:** `src/i18n/dictionaries/tr.ts:839`
> *"Bu metin taslaktır ve test amaçlıdır. Canlıya çıkmadan önce şirketinizin gerçek bilgileri ile
> güncelleyiniz ve bir hukukçudan teyit alınız."*

Bu uyarı 6 hukuki sayfanın **hepsinde sarı bantla ziyaretçiye gösteriliyor**
(`src/views/legal/*.tsx` — Mesafeli Satış, Ön Bilgilendirme, KVKK, Gizlilik, Çerez, Kullanım Koşulları).

> **⚠️ DÜZELTME (aynı gün, iş başlarken fark edildi):** Bu maddenin ilk hâli *"satıcı ünvanı, MERSİS,
> vergi no hiçbir metinde yok"* diyordu. **Yanlıştı.** `grep`'i sayfa dosyaları ve sözlükler üzerinde
> koşturmuştum; gerçek metinler bir katman altta — `src/views/legal/components/{tr,en}/*.tsx` — ve
> alanlar **var**, merkezî `src/config/legal.ts`'ten geliyor (`sellerTitle`, `mersis`, `taxNumber`…).
> Yani eksik olan **alanlar değil, içlerindeki değerler** (`'[SATICI_UNVAN]'` gibi placeholder'lar).
> Metinler de sanılandan iyi: 6502, MSY m.15, KVKK m.5/m.11 atıfları yerli yerinde.
> *(Bu tam olarak hafızadaki `KAPSAM≠GERÇEK` dersi: yanlış-negatif grep deseni. Kapsam değişmiyor —
> canlıya çıkış hâlâ engelli — ama iş "sıfırdan yaz" değil "boşlukları kapat + değerleri doldur".)*
**Risk:** Mesafeli Sözleşmeler Yönetmeliği + 6502 sayılı TKHK, satıcı kimliğini ve ön bilgilendirmeyi
**zorunlu** kılar. Eksik/taslak metinle satış = idari para cezası + cayma süresinin uzaması riski.
**Kilit:** Recep (şirket bilgileri) + hukukçu teyidi. **Kod işi değil, içerik işi.**

> **✅ DURUM (aynı gün, `T019-VH`):** Metin tarafı **yazıldı ve bu PR'da**. 6 metin × 2 dil mevzuata
> karşı denetlendi ve boşlukları kapatıldı: MSY m.5 zorunlu bilgi listesi tamamlandı, **örnek cayma formu**
> eklendi (yoktu), iade kargo masrafının kime ait olduğu açıkça yazıldı (yoktu), cayma istisnaları
> HVAC'a somutlandı (özel ölçü kanal / açılmış filtre / uygulanmış izolasyon), ETBİS-MERSİS-ticaret sicil-KEP
> alanları eklendi, KVKK yurt dışı aktarım metni 2024 rejimine güncellendi, İYS/ticari elektronik ileti ve
> VERBİS bölümleri eklendi, çerez tablosu gerçek çerezlerle dolduruldu, garanti/kullanım ömrü/yetkili servis
> eklendi, fiyat-hatası hükmü eklendi.
> **Geriye kalan iki şey Recep'te:** (1) `src/config/legal.ts`'teki 18 placeholder'ın doldurulması,
> (2) hukukçu teyidi → `legalReviewCompleted: true`. **İkisi tamamlanana kadar taslak bandı kendiliğinden
> görünmeye devam eder** (`isLegalContentReady()`); ikisi de tamamlanınca kendiliğinden kalkar.

### K4 · Sitede sahte iletişim bilgisi
**Kanıt:** `src/i18n/dictionaries/tr.ts:856-857`
```
phone: '+90 (216) 123-45-67'
email: 'info@venthub.com.tr'
```
Placeholder telefon canlıda görünüyor. (Hafızada `user-side-open-items` olarak zaten duruyordu — kapanmamış.)

### K5 · Edge fonksiyon güvenlik açığı (devam eden iş, bilgi amaçlı)
`admin-order-inspect` prod'daki donmuş sürümde `verify_jwt=false` + gövdede auth yok + service_role ile
sipariş döndürüyor. **Sahibi:** EDGE şeridi (`61104be3`, T018-VH) — aktif çalışılıyor, LAUNCH şeridi karışmıyor.

---

## 2. SARI — canlıdan önce kapatılmalı, ama satışı bloklamıyor

| # | Bulgu | Kanıt | Sahibi |
|---|---|---|---|
| S1 | ~~Leaked-password koruması KAPALI~~ **YAPILAMAZ** | advisor `auth_leaked_password_protection` uyarıyor ama bu özellik **ücretsiz Supabase planında yok** — plan yükseltilmeden kapatılamaz. Advisor'ı kalıcı gürültü kabul et. | — (kapalı madde) |
| S2 | `_migration_ledger` RLS açık ama **0 politika** | advisor `rls_enabled_no_policy` | LAUNCH (migration, onaya tabi) |
| S3 | `.env.example`'da `NEXT_PUBLIC_IYZICO_SECRET_KEY` satırı | `.env.example:22` | LAUNCH (doc) |
| S4 | İyzico prod anahtarları / merchant onayı doğrulanmadı | `.env.example` sandbox URL varsayılan | Recep |
| S5 | 0 sipariş / 2 kullanıcı — uçtan uca gerçek satın alma **hiç** denenmedi | `venthub_orders = 0` | LAUNCH + PRICING (K2 sonrası) |
| S6 | **Çerez onay bandı hiçbir şeyi kapatmıyor** — "Reddet"e basmak yalnız `vh_cookie_consent='rejected'` yazıp bandı gizliyor; hiçbir çerez/izleyici bu tercihe bağlanmamış | `src/components/layout/CookieConsent.tsx:35` | LAUNCH (T019 takibi) |

**S6 açıklaması ve neden bugün KIRMIZI değil:** Onay bandı bugün dekoratif — ama sitede
analitik/pazarlama çerezi de **yok** (GA/GTM script'i hiçbir yere enjekte edilmiyor; `src/utils/analytics.ts`
yalnız `window.gtag` zaten varsa ateşliyor, ki yok). Yani şu an rızaya bağlanması gereken bir çerez
bulunmadığı için fiilî ihlal doğmuyor. **Ancak** GA/Meta Pixel benzeri bir şey eklendiği **an** bu
sessiz bir KVKK ihlaline döner: kullanıcı "Reddet" demiş olacak, izleyici yine de çalışacak.
Bu yüzden yazdığım Çerez Politikası bilerek *"Site hâlihazırda analitik/pazarlama çerezi kullanmamaktadır"*
diyor — mevcut gerçeği yazdım, olmayan bir rıza mekanizmasını var gibi göstermedim.
**Yapılacak:** izleyici eklenmeden ÖNCE bandı gerçek bir rıza kapısına bağla (kategori bazlı tercih +
reddedilen kategorinin script'ini hiç yükleme).

**S3 açıklaması:** kod bu değişkenleri **kullanmıyor** — İyzico sırları yalnız edge fonksiyonlarında
(`Deno.env.get("IYZICO_SECRET_KEY")`). Yani sızıntı YOK; ama `.env.example` birinin gerçek secret'ı
`NEXT_PUBLIC_` ile koymasını davet eden bir tuzak. Satır silinmeli.

---

## 3. YEŞİL — doğrulandı, iyi durumda (yanlış alarmlar dahil)

- **SECURITY DEFINER uyarıları YANLIŞ ALARM.** Advisor 6 fonksiyonu işaretledi
  (`adjust_stock` ×2, `set_stock` ×2, `admin_list_users`, `set_user_admin_role`).
  Dördünün gövdesi prod'dan okundu: hepsinde `service_role OR user_profiles.role IN
  ('super_admin','admin','warehouse','moderator')` guard'ı **var**. Sıradan müşteri stok değiştiremez.
  *(Kozmetik: rol listesinde `super_admin` ve `moderator` mükerrer yazılmış.)*
- **SEO altyapısı sağlam.** `src/app/sitemap.ts` kategorileri/aileleri/markaları hreflang'li (tr/en) üretiyor,
  ürünsüz kategorileri eliyor; `src/app/robots.ts` `/admin/ /auth/ /account/ /checkout/` engelliyor + sitemap veriyor.
- **Hukuki sayfa iskeleti var** — 6 sayfa, TR/EN ayrı içerik bileşenleri. Eksik olan yalnız **içerik**, yapı değil.
- **Taksonomi tutarlı:** 31 kategori / 32 aile / 374 ürün, yetim yok (F0-F5 temiz kuruluşundan).

---

## 4. Öneri: canlıya çıkış sırası

Bağımlılık zinciri — sıra kritik, çünkü her adım öncekini gerektirir:

```
1. Recep kararı: FİYAT SEED "evet"    → K2 çözülür, site satış yapabilir hale gelir
2. Recep içeriği: şirket bilgileri     → K3 + K4 (hukuki metin + iletişim) kapanır
3. Recep dosyaları: ürün görselleri     → K1 kapanır (vitrin satılabilir görünür)
4. EDGE şeridi bitişi                   → K5 kapanır
5. Uçtan uca gerçek satın alma provası  → S5 (İyzico TEST → sonra prod anahtar)
6. Sarı liste süpürmesi (S2-S4; S1 yapılamaz)
```

**Kritik yol Recep'tedir, kodda değil.** 1-3 arası maddeler geliştirme değil karar/içerik gerektiriyor;
bunlar gelene kadar iki dikey şerit (fiyat motoru + edge güvenliği) paralel devam edebilir.

---

## 5. Bu denetimin sınırları (dürüst kapsam)

Bakılmadı, çünkü kanıta erişilemedi veya başka şeridin mülkü:
- **Vercel prod ortam değişkenleri** (`.vercel/project.json` yok, CLI kurulu değil) → İyzico/Resend/Twilio
  anahtarlarının prod'da doğru mu olduğu **doğrulanamadı**. S4 bu yüzden "doğrulanmadı" diyor, "kırık" demiyor.
- **Gerçek tarayıcı taraması** (Lighthouse/CLS/mobil) yapılmadı — `src/**` PRICING şeridinde.
- **Edge fonksiyon iç denetimi** yapılmadı — EDGE şeridinin mülkü, çakışmamak için elleşilmedi.
- **E-posta/SMS teslimi** (Resend/Twilio) canlı test edilmedi — sipariş akışı K2'ye bağlı.
