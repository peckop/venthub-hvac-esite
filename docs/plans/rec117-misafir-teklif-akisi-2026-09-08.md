# REC-117 — Misafir teklif akışı: PLAN (kod yok)

> **Durum:** taslak · **Şerit:** URUN (`4a8eaf9c`) · **Tarih:** 2026-09-08
> **Kayıt:** [REC-117](https://linear.app/receps-workspace/issue/REC-117) (Recep kararı 2026-09-01, yazılı)
> **YÖNTEM:** şerit (URUN) — cetvel `docs/standards/execution-method-standard.md`
> **KAYNAK/CETVEL:** `docs/standards/quote-standard.md` (Q4 · §2.5 · §3.3 · §7.2 · §8 · §15/R17) ·
> `CLAUDE.md` kural 2/3/7/11/12/13 · konformans ailesi `quote-*-policy-guard`, `quote-machine-ssot`
> **Karne tazeliği:** veri modeli + RLS **bu plan için 2026-09-08'de prod'dan YENİDEN ölçüldü** (yalnız SELECT).

---

## 0) BAŞLIK YANLIŞ — ve bunu ölçüm söylüyor

Kaydın başlığı **"anon INSERT/RLS = MIGRATION"** diyor. Ölçtüm: **migration gerekmiyor.**
Bu bir görüş değil, dört ölçümün sonucu. Başlıktaki varsayım 2026-09-01'de yazıldı; o tarihte
`quote_v2_schema` (2026-08-26) migration'ının misafir tarafına ne kadar yaklaştığı kayda geçmemişti.

**Ölçüm 1 — kimlik üçlüsü zaten zorunlu, hesap zaten opsiyonel.**
Prod `information_schema.columns`, `venthub_quotes`, NOT NULL kolonlar:

| Kolon | NOT NULL | Varsayılan |
|---|---|---|
| `contact_name` | EVET | yok |
| `contact_email` | EVET | yok |
| `contact_phone` | EVET | yok |
| `source`, `status`, `tenant_id`, `revision_no`, `id`, `created_at`, `updated_at` | EVET | `source` hariç hepsinde var |

`user_id` bu listede **YOK** → nullable. Yani şema şu an tam olarak Recep'in cümlesini taşıyor:
*"belirli bilgiler olmadan da teklif ve bilgilendirme yürümez"* → üçlü zorunlu;
*"zorunlu olmamalı, kullanıcı rahat hissetmeli"* → hesap opsiyonel.

**Ölçüm 2 — hesapsız belge kavramı cetvelde yazılı ve KASITLI.**
`20260826233000_quote_v2_schema.sql` §7 yorumu:
> *"R17 (hesapsız belge müşteri yüzünde görünmez) EK BİR POLİTİKA İSTEMEZ: sahiplik yüklemi
> `user_id = auth.uid()` NULL ile eşleşmez, yani prospect belge zaten yalnız satıcı yüzünde yaşar.
> Yeni bir şart eklemek yerine bunu yazıya geçiriyoruz ki sonradan 'eksik' sanılıp gevşetilmesin."*

Bu satır bugünkü işi doğrudan ilgilendiriyor: **misafir kaydının admin yüzünde görünüp müşteri
yüzünde görünmemesi bir eksiklik değil, çivilenmiş bir tasarım.** REC-117 madde 5 (admin yüzeyi)
bu yüzden ek iş istemez — yalnız ölçülür.

**Ölçüm 3 — `anon` yolu hiç yok.** Prod `pg_policies`: teklif tablolarında 9 politika,
**dokuzunun da rolü `{authenticated}`**. Depodaki hiçbir teklif migration'ında `anon` kelimesi geçmiyor.

**Ölçüm 4 — kolon GRANT'leri de yalnız `authenticated`'a.** `quote_v2_schema` §8:
`grant insert (contact_name, contact_email, contact_phone) ... to authenticated`.

**Sonuç:** eksik olan tek şey **misafirin yazabildiği bir yol**. Bunun iki yapılışı var ve
aralarındaki fark bu planın en önemli kararı.

---

## 1) HÜKÜM — Edge Function yolu, anon RLS politikası DEĞİL

### Yol A (kayıtta önerilen): `anon` rolüne INSERT politikası + kolon GRANT'i

Ne gerektirir: `venthub_quotes` ve `venthub_quote_items` için `to anon` INSERT politikaları,
artı `anon` rolüne kolon düzeyi `grant insert`. **Migration** → prod'a otomatik uygulanır → Recep onayı.

Neden reddediyorum, üç ölçülmüş sebeple:

1. **Yüzey genişler ve geri alması pahalıdır.** `anon` = internetteki herkes. PostgREST üzerinden
   doğrudan tabloya yazma yolu açılır.
   ⭐ **DÜZELTİLDİ (red-team Bulgu 6):** ilk yazdığım gerekçe *"hız limiti RLS'te ifade edilemez"*
   idi ve **teknik olarak yanlıştı** — `with check` bir fonksiyon çağırabilir ve depoda
   `bump_rate_limit` zaten tam bu deseni taşıyor. Doğru itiraz daha dar: yan etkili bir sayacı
   politika yükleminde koşmak, yüklemin kaç kez değerlendirileceği garanti olmadığı için
   güvenilmezdir. Red kararı bu satıra değil, aşağıdaki 3. gerekçeye dayanır.
2. **REC-216 tam da bu şişmeyi temizliyor.** İlgili kayıt: *"RLS politika şişmesi (153 katman)"*.
   Temizlik sürerken aynı yüzeye iki yeni politika eklemek, komşu şeridin işini büyütür.
3. **Kolon GRANT'i rol bazlıdır, politika bazlı değil.** `quote_v2_schema` §8'in kendi uyarısı:
   *"kolon grant'i admin'e ve müşteriye AYNI ANDA verilir"*. `anon`'a INSERT grant'i vermek,
   o kolonları **her ziyaretçiye** açar; hangi politikanın onu dizginlediği ayrı bir okuma işi olur.

### Yol B (HÜKMÜM): `quote-request-guest` Edge Function'ı, service_role ile yazar

Ne gerektirir: **migration YOK.** Yeni bir Edge Function; şema, politika, GRANT hiç değişmez.

Neden bu:

- **RLS yüzeyi büyümez.** `anon` hiçbir teklif tablosuna erişemez — bugünkü hâli aynen kalır.
  Yazan tek şey, gövdesi gözden geçirilebilir tek bir fonksiyondur.
- **Spam koruması yazılabilir bir yere gelir.** Hız limiti, honeypot alanı, e-posta biçim ve
  MX doğrulaması, `source` beyaz listesi — hepsi fonksiyon gövdesinde, testi yazılabilir hâlde.
- **Desen zaten kurulu.** Depoda 28 Edge Function var; `quote-notification-webhook` teklif
  yüzeyinde hâlihazırda çalışıyor. Yeni bir kalıp icat etmiyoruz.
- **Recep'in onay turunu harcamıyoruz.** Migration onayı kıt bir kaynak (REC-110/114 turu bekliyor).
  Bu iş onu tüketmeden bitiyor.

**Bedeli, adıyla:** `service_role` RLS'i atlar. Yani fonksiyonun gövdesi artık *tek* koruma
katmanıdır — orada yapılan bir hata, RLS'in yakalayacağı bir hata değildir. Bunun karşılığı
§4'teki kapılar: fonksiyonun yalnız `status='requested'` + `user_id=null` yazabildiği, başka
tablo/kolona dokunamadığı **testle çivilenir**. Kabul edilen risk budur ve yazılıdır.

---

## 2) İŞ KALEMLERİ (sıralı)

| # | Kalem | Yüzey | Migration? |
|---|---|---|---|
| 1 | `quote-request-guest` Edge Function — doğrulama + hız limiti + INSERT. **`tenant_id` AÇIKÇA yazılır** (DEFAULT'a yaslanılmaz), **idempotency anahtarı alır**, hız limiti için `_shared/rate_limit.ts` → `bump_rate_limit` kullanılır (bellek-içi limit Deno izolatları arasında paylaşılmaz, koruma değildir) | `supabase/functions/quote-request-guest/**` | HAYIR |
| 1b | ⭐**`quote-notification-webhook` misafir dalı** — bugün alıcıyı `auth.admin.getUserById(quote.user_id)` ile okuyor; `user_id` NULL'da 503 döner ve **e-posta hiç gitmez**. `contact_email`'e düşen dal eklenir; SELECT listesine `contact_email` girer | `supabase/functions/quote-notification-webhook/index.ts` | HAYIR |
| 2 | `QuoteRequestButton` login kapısının kaldırılması (oturumlu akış korunur) | `src/components/quotes/QuoteRequestButton.tsx` | HAYIR |
| 3 | `QuoteRequestModal` misafir alanları (ad/firma/e-posta/telefon) + oturumluda otomatik dolum | `src/components/quotes/QuoteRequestModal.tsx` | HAYIR |
| 4 | `quoteService` misafir dalı — DI kuralı 2 aynen (ilk parametre `supabase`) | `src/lib/services/quoteService.ts` | HAYIR |
| 5 | Kayıt teşviki: gönderim sonrası "hesabını oluştur, talebini takip et" | modal | HAYIR |
| 6 | i18n TR/EN anahtarları — **nested**, düz nokta-key YASAK (`getDictValue` nested-only) | `src/i18n/dictionaries/*` | HAYIR |
| 7 | Cetvel Q4 hükmünün güncellenmesi (login şartı → misafir kabulü) | `docs/standards/quote-standard.md` | HAYIR |
| 8 | Kapılar (§4) | `src/__tests__/conformance/**` — **ALTYAPI şeridi, emir gerekir** | HAYIR |

**Madde 5 (admin yüzeyi) iş değil, ÖLÇÜM:** `quotes_select_own_or_admin` admin dalı `user_id`
şartı taşımıyor → misafir kaydı admin yüzünde zaten görünmeli. Kod yazmadan önce ölçülür;
görünmüyorsa o zaman iş açılır.

---

## 3) ÖLÇÜLECEKLER — plan onaylanmadan önce (hiçbiri iddia değil)

> **Bu bölümün beş maddesi de bağımsız red-team denetiminde ÖLÇÜLDÜ (2026-09-08).** Sonuçlar aşağıda;
> hiçbiri artık "bekleyen ölçüm" değil.

1. ✅ **Tetik geçiriyor.** `enforce_quote_status_transition` INSERT dalı `status not in
   ('draft','requested')` dışını reddedip **`return new` ile erken çıkıyor**; muhatap kilidi
   (`user_id is null`) o dönüşün ALTINDA, yalnız UPDATE yolunda yaşıyor. Prod `prosrc` birebir aynı.
   `service_role`'ün tablo düzeyi INSERT yetkisi var, `anon`'un **hiçbir** yetkisi yok.
2. ⛔ **Bildirim misafirde ÖLÜYOR — ve sessizce.** Tetik `AFTER INSERT`, koşulsuz, misafir kaydında
   da ateşliyor. Ama uç alıcıyı `auth.admin.getUserById(quote.user_id)` ile okuyor → `user_id` NULL'da
   **503 `user_lookup_failed`**. SELECT listesi `contact_email`'i hiç çekmiyor. Üstelik `pg_net`
   ateşle-unut ve uç `quote_email_events` defterine yazmıyor → **arıza hiçbir yerde satır bırakmaz.**
   Yani Recep'in *"bilgilendirme yürümez"* şartı bugünkü kodla karşılanmıyor. **Kalem 1b oldu**
   (erteleme değil, iş).
3. ✅ **`source` kısıtlamıyor** (`pdp|cart|project` misafire yeter).
   ⚠ Ama `venthub_quote_items.product_id` v2'de NOT NULL'a çekilmiş → **misafir akışı katalog-dışı
   serbest kalem KABUL EDEMEZ.** Bu bir sınır, formda karşılığı olmalı.
4. ⚠ **Soru yanlış çerçevelenmişti.** INSERT sırasında `jwt_tenant_id()` **hiç çağrılmıyor**;
   `tenant_id` kolon DEFAULT'undan geliyor (sabit UUID). `jwt_tenant_id()` claim yoksa aynı UUID'ye
   düşüyor, yani bugün iki yol örtüşüyor ve sızıntı yok (prod: 1 tenant, ayrık claim taşıyan 0
   kullanıcı). **Ama bu tesadüf.** service_role RLS'i atladığı için fonksiyon tenant'ı **açıkça**
   yazmalı; DEFAULT'a yaslanmak Faz 2 açıldığı gün sessizce yanlış tenant üretir. → kalem 1'e girdi.
5. ✅ **Admin yüzeyi hazır.** Prod `polqual`: admin dalı `user_id` şartsız. Kod tarafında NULL zaten
   ele alınmış ve `user_id === null` için ayrı bir **"prospect" rozeti** var. Çökmüyor. Madde 5 iş değil.

---

## 4) KAPILAR — ne ölçecek, nasıl sabote edilecek

> Bu dosyalar **ALTYAPI şeridinde** (`src/__tests__/conformance/**`). Kapılar bu plandan
> emirle istenir; URUN tek başına yazmaz. (Cetvel: şerit sahipliği.)

| Kapı | Korunan değişmez | Sabotaj kolu |
|---|---|---|
| INV-MISAFIR-YAZIM-1 | `quote-request-guest` yalnız `status='requested'` ve `user_id=null` yazar; başka tabloya/duruma yazan satır YOK | gövdeye `'draft'` yaz → kırmızı olmalı |
| INV-MISAFIR-KIMLIK-1 | Üç kimlik alanı da doğrulanmadan INSERT'e gidilmez | doğrulamayı kaldır → kırmızı |
| INV-MISAFIR-HIZ-1 | Hız limiti dalı gövdede mevcut ve devre dışı bırakılamaz | limiti sonsuz yap → kırmızı |
| Mevcut `quote-insert-policy-guard` | Değişmemeli — ama aşağıdaki şerhle | politika eklenirse ratchet kırmızı verir |
| `edge-security` R7 | Yeni fonksiyon `config.toml`'da `[functions."quote-request-guest"]` bloğu ister | blok yazılmazsa KIRMIZI (beklenen) |
| `edge-security` R10 | Dosya başında `// Çağıran sınıfı:` beyanı ister — *"YENİ fonksiyon beyansız eklenemez"* | beyan yazılmazsa KIRMIZI (beklenen) |

⛔ **ÖNCEKİ RATCHET İDDİAM GERİ ÇEKİLDİ (red-team Bulgu 3).** Şöyle yazmıştım: *"kapının kırmızı
vermemesi, migration yazmadığımızın bağımsız kanıtıdır."* **Yanlış.** Kapı yalnız
`create|alter policy ... on venthub_quote(s|_items)` bloklarını tarar ve ratchet'i yalnız politika
ADLARINI çiviler. `grant`, `alter table`, yeni tablo, yeni tetik — hatta `grant insert (...) to anon`
— bu kapıya **görünmez**. Yani yeşilliği "migration yok" demez, "teklif tablolarında yeni politika
yok" der. Kapıya ölçmediği bir şeyi söyletmek, bu deponun kendi *fail-open kapı* dersinin tekrarıydı.
Migration olmadığının kanıtı kapı değil, **`supabase/migrations/` altında yeni dosya bulunmamasıdır**.

⭐ **Yeni fonksiyon iki kapıyı kırmızıya düşürür (Bulgu 4)** ve bu ISTENEN davranıştır — ikisi de
"beyansız fonksiyon eklenemez" diyor. Karşılamak **iş kalemidir**, sürpriz değil; `config.toml`
değişimi ayrıca `edge-shared-input-drift` yüzeyini tetikler.

---

## 5) RİSKLER

| Risk | Etki | Karşılık |
|---|---|---|
| `service_role` RLS'i atlar | fonksiyon hatası = korumasız yazma | §4 kapıları + plan-challenger + OPS bağımsız çürütmesi |
| Anon uç = spam yüzeyi | çöp teklif, e-posta maliyeti | hız limiti + honeypot + e-posta doğrulama (kalem 1) |
| Login kapısı kalkarken oturumlu akış bozulabilir | mevcut müşteri teklif veremez | oturumlu dal DEĞİŞMEZ; her iki dal ayrı ayrı ölçülür |
| Cetvel Q4 ile kod ayrışır | belge yalan söyler | kalem 7 aynı PR'da (ayrı PR'a bırakılmaz) |
| i18n düz nokta-key | ham anahtar render (tsc/lint/build GÖRMEZ) | nested + `i18n-key-resolution.test.ts` — ⭐önce `keycheck` yazmıştım, **o araç depoda YOK** (red-team Bulgu 10); var olmayan araca dayanan risk satırı karşılıksız güvencedir |
| **Çift gönderim** — aynı form iki kez gönderilir | iki teklif kaydı, iki e-posta; `createQuoteRequest` başlık+kalemi iki ayrı INSERT ile yazıyor ve idempotency anahtarı yok, misafirde oturum de yok | kalem 1'de idempotency anahtarı; hız limiti bunu TEK BAŞINA engellemez (kaba kalkan) |
| **`tenant_id` DEFAULT'a bırakılır** | bugün doğru değeri verir (tesadüf), Faz 2'de sessizce yanlış tenant | fonksiyon tenant'ı açıkça yazar (kural 12) |

---

## 6) SIRA VE ONAY

1. Bu plan → **plan-challenger** (skill) → **OPS bağımsız çürütme** (alt-ajan).
2. Çürütme sonrası **Recep'e tek karar sorusu**: Yol B (Edge Function, migration yok) kabul mü?
   — Migration olmadığı için bu bir *merge onayı* değil, bir *yön onayı*. Yapısal karar
   olduğu için tek başına sorulur, paket içinde değil.
3. Onay gelirse kod; kapılar için ALTYAPI'ya emir.
4. REC-59 canlı ölçümü Vercel kotasına bağlı; bu iş ona bağımlı DEĞİL, paralel yürür.

---

## 7) BU PLANIN ÖLÇMEDİĞİ (sınırı gizlemiyorum)

- Prod ölçümleri **yalnız SELECT** ile alındı; hiçbir yazma denenmedi. Yani "misafir INSERT'i
  bugün reddediliyor" iddiası **politika listesinden çıkarım**, davranışsal kanıt değil.
- ~~Tetik gövdeleri tam okunmadı~~ → **kapandı**: red-team ikisini de prod `prosrc`'tan okudu (§3/1, §3/2).
- ~~Hız limiti tabloysa migration geri gelir, hüküm yeniden açılır~~ → **bu kaçış kapısı GEREKSİZ ÇIKTI**
  (red-team Bulgu 5): DB destekli hız limiti **zaten var ve canlı** — `public.rate_limits` tablosu +
  `bump_rate_limit()` RPC + `_shared/rate_limit.ts`; `apply-coupon` ve `iyzico-payment` kullanıyor,
  prod'da tablo dolu. Yani hız limiti için migration gerekmiyor ve hüküm **yeniden açılmıyor**.
  Tersi de doğru ve bağlayıcı: bellek-içi limit Deno izolatları arasında paylaşılmadığı için gerçek
  koruma değildir, kalem 1 bu paylaşılan yardımcıyı kullanmak **zorundadır**.

---

## 8) BAĞIMSIZ ÇÜRÜTME — sonuç ve neyi değiştirdi

Plan, yazıldıktan sonra bağımsız bir denetçiye verildi (skill A2: üretici ≠ yargıç). **Sonuç: KOŞULLU.**

**Merkezî hüküm AYAKTA** — ve denetim onu sandığımdan sağlam buldu: §3'ün beş maddesi de ölçüldü,
beşi de hükmü destekledi, üstelik §7'deki kaçış şartım ölçümle çöktü (hız limiti altyapısı zaten var).

**Ama dört düzeltme getirdi ve hepsi işlendi:**
1. Bildirim zinciri misafirde ölüyor → **kalem 1b** (erteleme değil, iş)
2. "Yeşil ratchet = migration yok" iddiam yanlıştı → **geri çekildi**, doğrusu §4'te
3. Yeni Edge Function `edge-security` R7/R10'u kırmızıya düşürür → **§4'e yazıldı**
4. `tenant_id` açıkça yazılmalı + idempotency anahtarı → **kalem 1 ve §5'e girdi**

Bu bölüm silinmeyecek: bir planın nerede yanıldığı, doğru çıktığı yer kadar bilgi taşır.
