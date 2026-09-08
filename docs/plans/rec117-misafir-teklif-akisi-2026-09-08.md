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
   doğrudan tabloya yazma yolu açılır. Hız limiti, honeypot, e-posta doğrulama gibi şeylerin
   **hiçbiri** RLS'te ifade edilemez — `with check` bir yüklem yazar, bir davranış ölçemez.
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
| 1 | `quote-request-guest` Edge Function — doğrulama + hız limiti + INSERT | `supabase/functions/quote-request-guest/**` | HAYIR |
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

1. **`enforce_quote_status_transition` tetiği INSERT'i de görüyor** (v2 §6'da yazılı).
   `user_id IS NULL` + `status='requested'` girişini reddediyor mu? Tetik gövdesinde
   `if new.status in ('accepted','converted') and new.user_id is null` dalı var — `requested`
   o dalın dışında görünüyor, ama **gövdenin tamamı okunmadan geçti denmez.**
2. **`quote_request_notification` tetiği** (2026-08-17) misafir kaydında da e-posta üretiyor mu?
   Üretmiyorsa Recep'in *"bilgilendirme yürümez"* şartı karşılanmaz — bu iş kapsamına girer.
3. **`source` CHECK kısıtı** `pdp|cart|project`. Misafir girişleri hangi değeri yazacak?
4. **`tenant_id` varsayılanı** service_role bağlamında ne değer alıyor (`jwt_tenant_id()` fallback)?
5. **Admin yüzeyi** — yukarıdaki madde 5 ölçümü.

---

## 4) KAPILAR — ne ölçecek, nasıl sabote edilecek

> Bu dosyalar **ALTYAPI şeridinde** (`src/__tests__/conformance/**`). Kapılar bu plandan
> emirle istenir; URUN tek başına yazmaz. (Cetvel: şerit sahipliği.)

| Kapı | Korunan değişmez | Sabotaj kolu |
|---|---|---|
| INV-MISAFIR-YAZIM-1 | `quote-request-guest` yalnız `status='requested'` ve `user_id=null` yazar; başka tabloya/duruma yazan satır YOK | gövdeye `'draft'` yaz → kırmızı olmalı |
| INV-MISAFIR-KIMLIK-1 | Üç kimlik alanı da doğrulanmadan INSERT'e gidilmez | doğrulamayı kaldır → kırmızı |
| INV-MISAFIR-HIZ-1 | Hız limiti dalı gövdede mevcut ve devre dışı bırakılamaz | limiti sonsuz yap → kırmızı |
| Mevcut `quote-insert-policy-guard` | **Değişmemeli.** Yol B politika eklemediği için bu kapı yeşil kalmalı | politika eklenirse ratchet kırmızı verir — bu ISTENEN davranış |

⭐ **Ratchet notu:** mevcut kapının 4. testi politika adı kümesini çiviliyor. Yol B'de o küme
hiç değişmiyor — yani kapının kırmızı vermemesi, migration yazmadığımızın **bağımsız kanıtı** olur.

---

## 5) RİSKLER

| Risk | Etki | Karşılık |
|---|---|---|
| `service_role` RLS'i atlar | fonksiyon hatası = korumasız yazma | §4 kapıları + plan-challenger + OPS bağımsız çürütmesi |
| Anon uç = spam yüzeyi | çöp teklif, e-posta maliyeti | hız limiti + honeypot + e-posta doğrulama (kalem 1) |
| Login kapısı kalkarken oturumlu akış bozulabilir | mevcut müşteri teklif veremez | oturumlu dal DEĞİŞMEZ; her iki dal ayrı ayrı ölçülür |
| Cetvel Q4 ile kod ayrışır | belge yalan söyler | kalem 7 aynı PR'da (ayrı PR'a bırakılmaz) |
| i18n düz nokta-key | ham anahtar render (tsc/lint/build GÖRMEZ) | nested + `keycheck` |

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
- Tetik gövdeleri (`enforce_quote_status_transition`, `quote_request_notification`) **tam olarak
  okunmadı** — §3'ün 1. ve 2. maddesi tam bu boşluk için var.
- Hız limitinin nerede tutulacağı (bellek / tablo / Upstash) **kararlaştırılmadı**; kalem 1'in
  içinde netleşir ve o seçim tabloysa **migration geri gelir** — o hâlde bu planın hükmü yeniden açılır.
