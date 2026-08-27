# Teklif Modülü Standardı — v2 (ERP semantiği)

> **KAYNAK/CETVEL**
> - `docs/standards/quote-standard.md` v0.1 (Q1–Q8 + QD ertelemeleri) — bu dosyanın öncülü
> - `docs/standards/dealer-network-standard.md` §5 (RFQ→Quote→Order, versiyonlama, onay eşiği)
> - `docs/standards/legal-compliance-standard.md` §3.6 (iki-kapı deseni: satır + değer kapısı)
> - `docs/standards/commerce-domain-map-standard.md` §5 (izinli köprüler)
> - T134-VH dış kaynak araştırması (Odoo/ERPNext/Dolibarr/Metasfresh/Axelor + PandaDoc/Proposify/DocuSign/SF-CPQ + deal-registration) — 12 maddelik otonom/config/kullanıcı karar tablosu
> - Recep kararları 2026-08-20 (ERP semantiği · hibrit kabul · eşik · müşteri portalı · pasif ürün · V1.1 köprü · V2 LLM kuyruğu)
>
> **Cetvel durumu:** v0.1 CANLI ve bu belge onu **değiştirir**; v0.1'in Q1/Q3/Q5 çekirdeği korunur,
> Q2/Q4/Q6/Q8 yeniden yazılır. Karne tazeliği: veri modeli ve RLS **2026-08-20'de prod'dan ölçüldü**.
>
> **Bekçi:** INV-QUOTE-1 (mevcut, `quote-machine-ssot.test.ts`) → **INV-QUOTE-2** ile genişler (§15).
>
> **Durum:** v2 TASARIM — uygulama Recep onayına bağlı. Şema değişikliği **tek migration** (§16).

## 0) v1 nereye çarptı, v2 niçin var

v0.1 bir **RFQ** cetveliydi: teklifi müşteri ister, admin fiyatlar. Recep'in 2026-08-20
kararıyla model **ERP semantiğine** döndü: **teklifi satıcı hazırlar.** Bu, tek bir alan
eklemesi değil; giriş noktasını, durum makinesini, RLS'i ve müşteri yüzünü birlikte değiştirir.

Aşağıdaki §1 bu değişimin **bugünkü canlı davranışla nerede çeliştiğini** ölçümle sayar —
çünkü bu cetvelin en pahalı hatası, "yazdık sanmak" olur.

## 1) ÇELİŞEN-MEVCUT — bugün canlı olan ve v2 ile çelişen her şey (ölçüldü)

Tümü 2026-08-20'de **prod şemasından / prod politikalarından / master kodundan** okundu.
"Ölçemedim" işaretleri korunmuştur.

| # | Bugün canlı olan | Ölçüm | v2 kararı | Çelişkinin sınıfı |
|---|---|---|---|---|
| Ç1 | **Admin bir teklif OLUŞTURAMAZ** | `venthub_quotes` üzerinde INSERT politikası tek: `quotes_insert_own_requested` (`user_id = auth.uid()` **ve** `status='requested'`). Admin INSERT politikası **YOK** | Satıcı `draft` teklif açar | **Yapısal imkânsızlık** — eksik yetenek, bozuk yetenek değil |
| Ç2 | **Admin bir kalem EKLEYEMEZ** | `quote_items_insert_own_requested` aynı desende; admin için yalnız UPDATE var | Satıcı kalem ekler/çıkarır | Yapısal imkânsızlık |
| Ç3 | Giriş kapıları yalnız müşteri | `venthub_quotes_source_check` = `pdp \| cart \| project` — satıcı-başlatmalı kaynak **yok** | `admin` kaynağı eklenir | Kısıt, yeni akışı reddeder |
| Ç4 | Durum makinesi 5 durumlu, `draft` yok | `venthub_quotes_status_check` = requested/quoted/accepted/rejected/expired; tetik `enforce_quote_status_transition` aynı haritayı zorlar | §4'teki genişletilmiş makine | Cetvel + tetik + kısıt üçü birden |
| Ç5 | **Revizyon kavramı yok** | `venthub_quotes` kolonları: id, user_id, source, source_project_id, status, tenant_id, created_at, updated_at, request_email_sent_at. `revision_no` / `amended_from` **yok** | Amend zinciri (§5) | Eksik veri modeli |
| Ç6 | **Kabul kanıtı tutulmuyor** | Kabul yalnız `status='accepted'` yazımıdır; damga/IP/kanal/beyan-sürümü kolonu yok | Kanıt seti zorunlu (§7) | Hukuki ispat boşluğu |
| Ç7 | **Süre başlıkta değil, KALEMDE** | `venthub_quote_items.valid_until` (nullable); `venthub_quotes`'ta süre kolonu yok | Süre belge düzeyine taşınır | Yanlış katman |
| Ç8 | Başlıkta **toplam ve para birimi yok** | Toplam kolonu yok; `currency` kalem düzeyinde ve nullable | Başlıkta para birimi zorunlu | INV-CURRENCY-1 ile gerilim |
| Ç9 | Otomatik expiry **yok** | Cetvel Q2 "v1'de otomatik cron yok" diyor; ölçüm doğruluyor | Çift kapı (§6) | Bilinçli boşluk, artık kapanıyor |
| Ç10 | Q6: "Talebiniz alındı" e-postası **bilinçli YOK** | Oysa `request_email_sent_at` kolonu **CANLI** (T068 ile geldi) | Q6 bayat; iletim §12'de yeniden yazılır | **Cetvel gerçeğin gerisinde** |
| Ç11 | Q8: PDF **kapsam dışı** | — | PDF + iletim zorunlu (§12) | Kapsam kararı değişti |
| Ç12 | Müşteri kabul politikası dar | `quotes_update_customer_decision`: `quoted` → `accepted\|rejected`, sahip. Revizyon bağı, süre kontrolü, beyan sürümü **yok** | Politika **geri alınmaz, sertleştirilir** (§7) | Kapı var ama değer kapısı yok |
| Ç13 | Katalog-dışı kalem = serbest metin | `venthub_quote_items.product_id` **nullable**, FK `ON DELETE SET NULL` | Katalog-dışı kalem = **pasif ürün kaydı** (§3.2) | Model değişikliği |
| Ç14 | Modül üretimde **hiç kullanılmadı** | `venthub_quotes` **0 satır**, `venthub_quote_items` **0 satır** (08-19 ve 08-20 ölçümü) | Göç yükü sıfır — şema serbestçe düzeltilir | Fırsat, kusur değil |

**Ç1+Ç2 birlikte okunmalı:** bugün satıcı-hazırlamalı teklif **UI eksikliği değil, RLS
düzeyinde imkânsızlık**. "Admin ekranı yazalım" demek yetmez; politika gelmeden ekran
sessizce boş döner — bu deponun tekrar eden *yetkisi yok yerine veri yok* sınıfı.

**Ç10 ayrıca bir ders:** cetvel, kendi kapsam-dışı ilanını canlı koda karşı denetlemiyordu.
v2 bu yüzden §14'teki her kesimi **ölçülebilir bitiş kriteriyle** yazar.

## 2) Kavram katmanı — Satış Projesi, Teklif, Muhatap

v0.1 iki kavram tanıyordu: **Proje** (müşterinin yaşayan listesi) ve **Teklif** (dondurulmuş
ticari nesne). Q1 aynen korunur. v2 **üçüncü** bir kavram ekler ve bunun sebebi ölçülmüş bir
**endüstri boşluğudur**.

**Satış Projesi (saha)** — bir inşaat/tesis işi. Birden çok **muhatap** aynı saha için ayrı
ayrı teklif ister: işveren, ana yüklenici, alt yüklenici, kiracı. T134 araştırması iki
bağımsız kaynakla ölçtü: bu senaryonun yerleşik desteği **hiçbir ürün ailesinde yok**
(Dolibarr'da proje tek-muhatap kilidi; talep #13524 yıllardır açık, "most companies need it").
Procore hattında da baskın model "tek ihale sahibi, çoklu bidder" — bizim ihtiyacımızın tersi.

Bu yüzden Satış Projesi **VentHub'ın özgün cetvel alanıdır** ve şu kurallarla tanımlanır:

1. **Satış Projesi ≠ `user_projects`.** `user_projects` müşterinin kendi BOM listesidir
   (Q1). Satış Projesi **satıcı tarafının** sahayı temsil eden CRM nesnesidir. İkisi
   karıştırılmaz; bağ kurulacaksa yönü satıcıdan müşteriye doğrudur ve izlenebilirliktir.
2. **Muhatap rolü zorunludur.** Bir teklif bir Satış Projesine bağlanıyorsa muhatabın rolü
   (`isveren` / `ana_yuklenici` / `alt_yuklenici` / `kiraci`) yazılır. Rolsüz bağ kurulamaz —
   çünkü çakışma uyarısı (§9) ve fiyat tutarlılığı bu role dayanır.
3. **⭐ ÇATI GÖRÜNMEZ.** Her muhatap **yalnız kendi teklifini** görür; Satış Projesinin
   varlığını, diğer muhatapları, onların fiyatlarını **asla** göremez. Bu bir yüzey kararı
   değil **RLS şartıdır** — sızması ticari felakettir (aynı sahada rakip tarafların fiyatı).
4. Satış Projesi **isteğe bağlıdır.** Projesiz tek seferlik teklif tam yetkili bir tekliftir;
   proje bağı yalnız çoklu-taraf senaryosunu ve çakışma uyarısını açar.

> **Sınır — bu cetvelin yazmadığı:** Satış Projesi nesnesinin CRM tarafındaki tam alan seti
> (aşama, tahmini bütçe, sorumlu temsilci) **T130 CRM tasarımının işidir**. Burada yalnız
> teklifle kesişen üç şey bağlanır: kimlik, muhatap rolü, RLS izolasyonu.

## 2.5) Muhatap kimliği — **hesapsız teklif OLUR, kimliksiz teklif OLMAZ**

Recep kararı (08-20), iki cümlede ve bu cetvelin en sert ayrımlarından biri:

1. *"Müşterinin teklif sürecinde olabilmesi için cari/iletişim/isim bilgileri sistemde girili
   olmalı — kimliksiz birine teklif iletilemez."*
2. *"Kişinin teklifini ONAYLAYABİLMESİ veya TAKİP EDEBİLMESİ için sisteme KAYIT olması gerekir."*

Buradan **iki ayrı eksen** çıkar ve karıştırılmaları v1'in en pahalı hatası olurdu:

| Eksen | Şart | Niçin |
|---|---|---|
| **Kimlik** (teklifin var olabilmesi) | isim + e-posta + telefon **zorunlu** | Kime teklif verildiği belgede yazmalı; ERP'de muhatapsız belge yoktur |
| **Hesap** (teklifin onaylanabilmesi/takip edilebilmesi) | `user_id` dolu | Kabul hukuki bir eylemdir (§7.1); kimin kabul ettiği kimliklenmiş bir oturuma bağlanmalı |

**Sonuç — prospect (hesapsız cari) teklifi:**

- `venthub_quotes.user_id` **NULLABLE** olur. Satıcı, hesabı olmayan bir muhatap için teklif
  hazırlayıp e-postayla iletebilir. Bu **RFQ yolunun tersi** bir giriştir ve §4'teki `draft`
  girişinin doğal genişlemesidir.
- İletilen jeton-linki **yalnız GÖRÜNTÜLEMEdir**: PDF/özet açılır, **kabul aksiyonu taşımaz**.
  Kabul etmek isteyen kayıt olur; **aynı e-posta** ile açılan hesap teklifle eşleşir (`user_id`
  dolar), ondan sonra §7.2'nin değer kapısından geçerek kabul edebilir.
- ⭐ **Kapı DB'dedir, ekranda değil.** `user_id IS NULL` iken durum makinesi **onay yönüne
  geçemez**: `quoted → accepted` ve `accepted → converted` geçişleri `enforce_quote_status_transition`
  içinde reddedilir. Jeton-linkinden kabul düğmesini kaldırmak bir yüzey kararıdır ve **tek
  başına sayılmaz** — bu belgenin §6'da yazdığı "üçüncü kapı" kuralının aynısı.

> **Bu kilit bir bulgunun kökten panzehiridir.** T134 ölçümünde şunu kanıtlamıştım: §3.3 ile
> admin INSERT politikası açıldığında, giriş-durumu kilidi olmasa admin bir belgeyi doğrudan
> `converted` yazabilirdi (R8 onu `draft` ile kapatır). `user_id` kilidi ikinci ve bağımsız
> bir kapıdır: belge doğru durumdan başlasa bile, **muhatabı hesapsızken** kabul/dönüşüm
> yönüne yürüyemez.

**Eşleşme kuralı — e-posta tekilliği.** Hesap açılışında teklifle eşleşme `contact_email`
üzerinden yapılır ve **tenant kapsamında** çalışır. Eşleşme **otomatik doldurma değil,
sahiplenmedir**: `user_id` bir kez dolar, geri alınmaz (satıcı iptali ayrı eksendir).

**Sınır — bu cetvelin yazmadığı:** cari kartın CRM tarafındaki tam alan seti (vergi no, adres,
ödeme koşulu) **T130'un işidir**. Burada yalnız teklifin var olabilmesi için gereken üçlü
bağlanır: isim, e-posta, telefon.

## 3) Veri modeli v2

### 3.1 Başlık (`venthub_quotes`) — eklenecek alanlar

| Alan | Tip | Niçin | Kaynak |
|---|---|---|---|
| `quote_no` | text, benzersiz | Belge numarası; PDF ve müşteri iletişimi ondan konuşur | ERP normu |
| `revision_no` | int, NOT NULL, default 1 | Amend zinciri (§5) | ERPNext amend |
| `amended_from` | uuid → `venthub_quotes(id)` | Bir önceki revizyon | ERPNext amend |
| `root_quote_id` | uuid → `venthub_quotes(id)` | Zincir başı; portalda gruplama | türetildi |
| `superseded_by` | uuid → `venthub_quotes(id)` | Yerine geçen revizyon; **NULL = güncel** | türetildi |
| `valid_until` | timestamptz | Belge düzeyinde süre (Ç7) | Odoo/PandaDoc |
| `currency` | char(3), **NULLABLE** (şart tetikte) | Para birimi **türetilmez** | INV-CURRENCY-1 |
| `total_amount` | numeric | Belge toplamı (kalemlerden türetilir, snapshot'lanır) | fatura hattı |
| `user_id` | uuid → `auth.users`, **NULLABLE** | Hesapsız (prospect) muhatap; hesap açılınca dolar (§2.5) | Recep 08-20 |
| `contact_name` · `contact_email` · `contact_phone` | text, **NOT NULL** | Kimlik üçlüsü; kimliksiz teklif olmaz (§2.5) | Recep 08-20 |
| `sales_project_id` | uuid, nullable | Satış Projesi bağı (§2) | özgün |
| `party_role` | text, nullable | Muhatap rolü; proje bağı varsa NOT NULL | özgün |
| `sent_at` | timestamptz | İletim damgası (§12) | — |
| `accepted_at` · `accept_channel` · `accept_ip` · `accept_declaration_version` · `accept_evidence_ref` · `accept_recorded_by` · `accepted_revision_no` | — | Kabul kanıt seti (§7) | Dolibarr alan seti |
| `accept_confirmed_at` · `accept_confirmed_by` | — | Eşik aşıldığında satıcı teyidi (§7.3) | SF CPQ / ERPNext Authorization Rule |
| `cancelled_at` · `cancel_reason` | — | Satıcı iptali | — |
| `converted_order_id` | uuid → `venthub_orders(id)`, **UNIQUE** | Köprü (§10); tekillik şema kısıtıyla | T105 ölçümü |

### 3.2 Kalem (`venthub_quote_items`) ve **katalog-dışı kalem**

Recep kararı: katalog-dışı kalem **serbest metin değil, pasif ürün kaydıdır.**

**Ölçüm — bunun için yeni kolon GEREKMİYOR:** `products.status` bugün zaten
`active | draft | archived` değerlerini taşıyor ve **varsayılanı `draft`**. Vitrin sorguları
`product.service.ts` içinde altı yerde `status='active'` ile süzüyor. Yani "vitrine çıkmayan
ürün" **bugün mevcut bir yetenektir**; kompozördeki *hızlı pasif ürün kaydı* eylemi
`status='draft'` bir `products` satırı yaratır, kalem ona bağlanır.

Bunun üç sonucu var:
1. `venthub_quote_items.product_id` artık **NOT NULL** olabilir — her kalemin gerçek bir
   ürün kimliği olur.
2. **T105'in sert engeli çözülür.** Köprü raporunda "serbest-metin kalem sipariş kalemine
   dönüşemez, çünkü `venthub_order_items.product_id` NOT NULL" demiştim ve dönüşümü
   bloklamayı önermiştim. Pasif ürün kararı o engeli **ortadan kaldırır**; blok kuralına
   artık gerek yoktur.
3. ⚠ **Yeni tehlike, adıyla:** vitrin süzmesi tek bir kapıda değil, **sorgu başına**
   tekrarlanıyor (altı yer). Pasif ürünler çoğaldıkça, süzmeyi unutan yeni bir sorgu
   katalog-dışı kalemleri vitrine sızdırır. Bunu §15/R7 ölçer.

Kalem tarafına eklenecekler: `line_no` (sıra), `discount_rate`, `tax_rate`, `line_total`,
ve `group_label` (bina/kat/faz — dealer-network §5'in grup kavramı). Bundle/kit **v2 kapsamı
dışıdır** (§14).

### 3.3 RLS — v2 şartları

- **Ç1/Ç2 kapanır:** `venthub_quotes` ve `venthub_quote_items` için **admin INSERT**
  politikası gelir; admin yalnız `status='draft'` ile açabilir (giriş durumu kilidi).
- Müşteri INSERT politikası **korunur** (`requested`) — RFQ girişi yaşamaya devam eder (§4).
- Müşteri kabul politikası **geri alınmaz, sertleştirilir** (§7.2).
- **Satış Projesi izolasyonu:** muhatap yalnız kendi tekliflerini görür. `sales_project_id`
  üzerinden JOIN ile "aynı projedeki diğer teklifler" **müşteri yüzüne asla açılmaz**.
- **Prospect kapsamı (§2.5):** `user_id IS NULL` olan teklif **hiçbir müşteri politikasında**
  görünmez — sahiplik yüklemi (`user_id = auth.uid()`) NULL ile eşleşmez, bu yüzden hesapsız
  belge yalnız satıcı yüzünde yaşar. Jeton-linki bir RLS yolu **değildir**: belgeyi sunucu
  tarafında, yalnız okuma amaçlı üretir (§12) ve kabul aksiyonu taşımaz.
- Tüm politikalar `tenant_id = jwt_tenant_id()` kapsamında kalır (v0.1 Q3, T057 dersi).

## 4) Durum makinesi v2

```
GİRİŞLER
  (satıcı)   → draft
  (müşteri)  → requested            [RFQ yolu korunur]

GEÇİŞLER
  requested  → draft | rejected
  draft      → quoted | cancelled
  quoted     → accepted | rejected | expired | superseded | cancelled
  accepted   → converted

SOĞURUCU TERMİNALLER
  rejected · expired · cancelled · superseded · converted
```

**İki giriş durumu vardır ve bu bilinçlidir.** `draft` satıcının başlattığı ERP yoludur;
`requested` müşterinin vitrinden başlattığı RFQ yoludur ve **canlıdır** (PDP/sepet CTA'sı
sevk edilmiş durumda). RFQ'yu kaldırmak yeni bir çelişki üretirdi; onun yerine `requested`
artık bir **gelen kutusu** durumudur: satıcı talebi alır, `draft`'a çekip teklifi hazırlar.

**Adlandırma kararı — `quoted` korunuyor, `sent` eklenmiyor.** "Fiyatlandı ama iletilmedi"
hâli artık `draft`'tır; `quoted` = **fiyatlandı VE müşteriye iletildi**. Reddedilen alternatif
`draft → sent → …` üçlemesiydi: canlı `quotes_update_customer_decision` politikası, SSOT
haritası ve INV-QUOTE-1 bekçisi `quoted` üzerine kurulu; yeniden adlandırmanın karşılığında
kazanılan tek şey terim güzelliği olurdu. `sent_at` damgası zaten iletim anını taşır.

**`superseded` niçin ayrı bir terminal:** revizyon yayımlandığında eski revizyon ne
reddedilmiştir ne süresi dolmuştur — **yerine geçilmiştir**. Bunu `rejected`'a katlamak
müşteri portalındaki geçmişi yalan söyler hâle getirirdi (§8).

**⭐ MUHATAP KİLİDİ (§2.5) — geçiş haritasının üstünde ikinci bir şart.** `user_id IS NULL`
iken `quoted → accepted` ve `accepted → converted` geçişleri **reddedilir**. Kilit
`enforce_quote_status_transition` içindedir; ekranda kabul düğmesini gizlemek üçüncü kapıdır
ve tek başına sayılmaz (§6 ile aynı gerekçe). Harita diğer yönlerde hesapsız belge için
**açık kalır**: satıcı hesapsız muhataba teklif hazırlar, iletir, gerekirse iptal eder —
yalnız **kabul ve dönüşüm** hesap ister.

**SSOT değişmez:** `src/lib/quotes/quoteStatusMachine.ts` tek kaynaktır; DB tetiği
`enforce_quote_status_transition` aynı haritanın aynasıdır (INV-QUOTE-1 R1–R3 aynen geçerli,
yalnız harita büyür).

## 5) Revizyon — amend zinciri

**Seçilen desen: ERPNext amend zinciri.** Revizyon = **yeni kayıt** + önceki revizyona bağ.
Edit-in-place YOK (dealer-network §5 ile birebir).

Kurallar:

1. Revizyon açıldığında yeni satır: `revision_no = önceki + 1`, `amended_from = önceki.id`,
   `root_quote_id` zincir başı olarak taşınır.
2. Yeni revizyon **yayımlandığında** (`draft → quoted`) önceki revizyon
   `superseded` olur ve `superseded_by` yeni kaydı gösterir. Bu **tek işlemde** olur;
   yarım kalırsa iki canlı revizyon oluşur — bu §15/R4'ün ölçtüğü hâldir.
3. **Yalnız güncel revizyon kabul edilebilir** (`superseded_by is null`). Recep'in kararı
   bunu açıkça söylüyor: rev-2 yayındayken rev-1 kabul edilemez. Kapı **DB'dedir**, UI'da değil.
4. **⭐ Proje ve muhatap bağı KORUNUR.** Bu madde bir anti-örnekten yazıldı: Dolibarr'ın
   `createFromClone` yolu yeni belgeyi bağımsız üretir ve **proje bağını sıfırlar**. Aynı
   hatayı yapan bir revizyon, çoklu-taraf senaryosunda muhatabı kaybeder.
5. **Eski revizyon linki ölmez.** T134 bu davranışı sektörde **ölçemedi** — yani burada
   taklit edecek bir norm yok, kararı biz veriyoruz: eski revizyonun linki *"bu teklifin
   yeni sürümü var"* sayfasına düşer, eski PDF portalda **arşiv olarak görünür kalır**.
   Gerekçe: müşteri neyi kabul ettiğini/etmediğini geriye dönük görebilmelidir (§8).

## 6) Süre ve expiry — çift kapı

T134 ölçümü: üç ERP'den **yalnız ERPNext'te gerçek otomatik expiry var** (günlük cron);
Odoo'da `is_expired` sadece görsel bayrak, Dolibarr'da yıllardır açık talep. Proposify'ın
**lazy expiry** fikri (erişim anında) ikinci bir kapı olarak değerlidir.

**Karar: ikisi birden.**

- **Kapı 1 — cron.** Zamanlanmış bakım modülü (`pg_cron`, canlı) günlük koşar:
  `status='quoted'` ve `valid_until < now()` olan teklifleri `expired` yapar.
- **Kapı 2 — erişim/kabul anı.** Kabul yolunun **`with check`** ifadesi `valid_until >= now()`
  şartını taşır. Yani cron gecikse, düşse, hiç koşmasa bile **süresi geçmiş teklif kabul
  edilemez** — reddi DB verir, arayüz değil.

Kapı 2 niçin şart: kapı 1 tek başına, "cron koştu mu" sorusunu ticari bir garantiye çevirir.
Bu deponun bugüne kadarki en pahalı sınıfı tam olarak budur (iş akışı sessizce koşmaz ve
kimse kırmızı görmez). Arayüzdeki kapalı düğme **üçüncü** bir kapıdır ve tek başına sayılmaz.

**Süre değeri:** global varsayılan (config) + **teklif başına override** (T134/12).
`valid_until`, `draft → quoted` geçişinde **NOT NULL** olmak zorundadır — süresiz teklif
yayımlanamaz.

## 7) Kabul — tek kavram, üç kanal, zorunlu kanıt

### 7.1 Üç kanal

Kabul **tek bir kavramdır**; değişen yalnız kanaldır ve her kanal kendi kanıtını taşır.

| Kanal | Kim işler | Zorunlu kanıt |
|---|---|---|
| **site** (birincil dijital) | Müşteri, oturumla | beyan metni + `accept_ip` + `accept_declaration_version` + kabul edilen `revision_no` + damga |
| **e-posta beyanı** | Admin işler | `accept_evidence_ref` (ekli dosya/mesaj referansı) + `accept_recorded_by` |
| **telefon** | Admin işler | `accept_evidence_ref` (not/kayıt referansı) + `accept_recorded_by` |

**⭐ Üç kanalın ortak ön şartı: `user_id` DOLU olmalıdır (§2.5).** E-posta ve telefon
kanallarında kabulü admin işler, ama **kimin adına** işlediği hesaplı bir muhataba bağlanır;
hesapsız muhatabın kabulü hiçbir kanaldan kaydedilemez. Admin bu durumda önce muhatabı
hesaba bağlar (aynı e-posta ile davet), sonra kabulü işler. Bu, kanal sayısını değil
**kanıt zincirinin kime bağlandığını** korur.

**Site kanalı için beyan metni:** *"teklifi ve satış şartlarını kabul ediyorum."* Bu bir
checkbox/clickwrap'tir ve T134'ün hukuki bulgusuna göre **çizilmiş imzayla eşdeğer
bağlayıcılıktadır** (ESIGN/UETA; Meyer v. Uber 2017). Üç koşul cetvele bağlanır: şartlar
kabul eyleminden **önce** gösterilir, kabul eylemi **belirsiz olmaz** (tek amaçlı düğme),
ve **kayıt tutulur** (kanıt seti). Çizim imza **gerekmez** — bu, kanıtlı bir sadeleştirmedir.

### 7.2 Değer kapısı — mevcut politika sertleştirilir, geri alınmaz

Canlı `quotes_update_customer_decision` politikası (`quoted` → `accepted|rejected`, sahip)
**korunur** ve `with check` bloğu şu şartlarla genişletilir:

- `superseded_by is null` — yalnız güncel revizyon (§5/3)
- `valid_until >= now()` — süre kapısı (§6, kapı 2)
- `accept_channel = 'site'` ve `accept_ip`, `accept_declaration_version` **NOT NULL**
- `accept_recorded_by is null` — müşteri, admin-işlenmiş bir kabulü kendi adına yazamaz
- `accepted_revision_no = revision_no` — hangi revizyonun kabul edildiği belgeye pinlenir

Bu, `legal-compliance-standard.md` §3.6'daki **iki-kapı** deseninin birebir uygulamasıdır:
satır kapısı sahipliği, değer kapısı süreç alanlarını bağlar. O bölümün ölçülmüş dersi burada
da geçerlidir: **kolon-GRANT bir kapı değildir**, kısıt politikanın `with check` bloğuna yazılır.

### 7.2.1 Kalem tablosunun korunması — **tek bacaklı ve o bacak artık kapılı** (T164-VH)

Yukarıdaki §7.2 **başlık** tablosunu bağlar. **Kalem** tablosu (`venthub_quote_items`)
farklı bir mekanizmayla korunur ve bu fark yazılmazsa sessizce kaybolur.

**Ölçüm (canlı prod, 2026-08-27):** `authenticated` rolünün kalem tablosundaki UPDATE
kolon yetkisi **8 kolondur** ve içinde `unit_price, currency, discount_rate, tax_rate,
line_total` **vardır**. Grant'in geniş olması **zorunludur**: admin de `authenticated`'tır,
yani kolon yetkisi admin'e ve müşteriye aynı anda verilir (bkz. migration §8 yorumu).

O hâlde müşterinin bugün teklif tutarını değiştirememesinin **tek** sebebi şudur:

> Kalem tablosunda UPDATE politikası yalnızca `quote_items_update_admin`'dir ve
> `is_admin_user()` şartı taşır. Admin şartı taşımayan UPDATE politikası sayısı **0**.

**DEĞİŞMEZ:** `venthub_quote_items` **asla** müşterinin sağlayabileceği bir UPDATE
politikası kazanmayacak.

Bu değişmez daha önce hiçbir kapı tarafından tutulmuyordu. Biri "müşteri kendi
`requested` kalemlerini düzeltebilsin" diye bir politika eklerse fiyat kolonları **aynı
anda** yazılabilir olur — grant katmanı zaten açıktır ve §7.2'nin `with check` deseni
burada **işe yaramaz**, çünkü eski değere referans veremez.

**Niçin mevcut R5 yetmez:** R5 *koddaki* fiyat-kolonu yazımını yasaklar; buradaki tehlike
kod değil **politika eklenmesi**. Farklı yüzey, farklı kapı.

**Çözüm grant'i daraltmak DEĞİLDİR** (bilinçli kapsam dışı): daraltmak admin fiyat
girişini kırar. Mesele grant değil politika disiplinidir.

**Bekçi:** `src/__tests__/conformance/quote-items-policy-guard.test.ts` — bütün
migration'lar okunur (seçim **ada değil içeriğe** bağlı, R2'nin T134 dersi), `create` ve
`alter policy` blokları çıkarılır, `for update`/`for all` olan her blokta `is_admin_user()`
aranır. SQL yorumları CRLF-güvenli sıyrılır: `-- is_admin_user()` yazan bir yorum kapıyı
yeşil tutardı. Ayrıca **boş evren koruması** vardır — hiç politika bulunamazsa bu "ihlal
yok" değil "ölçüm yok" demektir ve bekçi yeşile kaçmaz, kırmızı verir.

**Kanıt (sabotaj, üç kol):** admin şartsız politika → **kırmızı** · aynı politikaya şart
eklendi → admin kolu **yeşil** (kabul kolu; ret gözlemi tek başına kanıt değildir) ·
şart yalnız **yorumda** → **kırmızı kaldı**.

**Bu bekçinin ölçmediği (adıyla):** politikanın *çalıştığını* değil, *yazıldığını* ölçer.
Davranışsal kanıt gerçek JWT bağlamı ister; ayrıcalıklı bağlantı §15'in dediği gibi
yanlış yeşil üretir.

### 7.2.2 INSERT tarafı — korunan şey admin tekeli değil, **durum sınırı** (INV-QUOTE-3)

§7.2.1 UPDATE yüzeyini kapattı. **INSERT yüzeyi ayrı bir yüzeydir ve aynı reçete burada
YANLIŞ olurdu:** müşterinin `'requested'` teklif açması ve kendi `'requested'` teklifine
kalem eklemesi **meşrudur** (v1'den beri canlı). "INSERT eden her politika admin şartı
taşısın" deseydik bugünkü doğru politikaları kırmızıya düşürürdük.

**Korunan değişmez:** teklif tablolarına INSERT eden her politika **ya `is_admin_user()`
şartı taşır, ya da yazdığı/bağlandığı teklifin durumunu `'requested'` değerine çiviler.**

**Niçin bu sınır (canlı ölçüm, 2026-08-27):** `'draft'` admin'in teklifi yazdığı,
**fiyatın oluştuğu** durumdur. `authenticated` rolünün INSERT kolon yetkisi
`venthub_quotes`'ta **7**, `venthub_quote_items`'ta **8** kolondur ve grant admin ile
müşteriye **aynı anda** verilir — admin de `authenticated`'tır. Durumu çivilemeyen bir
müşteri-INSERT politikası eklenirse müşteri kendine doğrudan `'draft'` teklif üretip
fiyat yazabilir ve akışın tamamını atlar. **Grant daraltmak çözüm değildir** (admin'i
kırar); koruma politikanın gövdesindeki `status = 'requested'` çivisidir.

**Bekçi:** `src/__tests__/conformance/quote-insert-policy-guard.test.ts`. Bütün
migration'ları okur, seçimi **ada değil içeriğe** göre yapar (yeniden adlandırma
atlatamaz), `create` **ve** `alter` yakalar (şart gevşetmek de tehlikelidir), `for`
yazılmamış politikayı PostgreSQL varsayılanı `ALL` sayar, SQL yorumlarını CRLF-güvenli
sıyırır ve **boş evren koruması** taşır.

**Kanıt (sabotaj, üç kol):** ne admin ne çivi taşıyan politika → **kırmızı** · aynı
politikaya `is_admin_user()` eklendi → şart kolu **yeşil** (kabul kolu; ret gözlemi tek
başına kanıt değildir) · şart yalnız **yorumda** → **kırmızı kaldı**.

**Bu bekçinin ölçmediği (adıyla, iki kalem):** (1) politikanın canlıda *etkin* olduğunu
değil, *yazıldığını* ölçer — davranışsal kanıt §15 ve `begin … rollback` kolundadır.
(2) Şartların konjonksiyon içinde olduğunu ispatlamaz: `status = 'requested'` bir `or`
dalında dursaydı çivi işlevi görmez ama bekçi yeşil kalırdı. **Bu boşluğun bekçisi
ratchet'tir** — politika adı kümesi sabitlenmiştir, yeni ya da yeniden adlandırılmış her
politika kırmızı yakar ve insan gözden geçirmesini zorlar. Sessizce eklenemez.

**Ayrıca ölçüldü (2026-08-27):** admin INSERT politikaları `#844` ile canlıya indi, ancak
bugün **sıfır çağıranı** vardır — depoda admin `'draft'` teklif üreten kod yolu yoktur
(tek INSERT yolu `quoteService.ts` `createQuoteRequest`, o da müşteri yoludur). Kapı
açıktır, geçen henüz yoktur; geçişi E5 Kompozör (REC-54 Kalem 2) yazacaktır.

### 7.3 Eşik — mekanizma otonom, değer config

T134/4: hiçbir üründe insan-tanımsız eşik yok; mekanizma platform sabiti, değer admin config.
Recep kararı bununla birebir örtüşüyor ve bir adım ileri gidiyor: **opt-in ve müşteri-bazlı**.

- Global varsayılan: açık/kapalı + tutar eşiği.
- Müşteri başına override değişkenleri.
- Eşik aşılırsa **site kabulü tek başına yetmez**: `accept_confirmed_at` / `accept_confirmed_by`
  ile **satıcı teyidi ikinci anahtardır**. Teyit yoksa geçiş `quoted` durumunda bekler.
- Bu ayrı bir durum **değildir** (durum patlaması yaratmamak için) — aynı durumda bekleyen bir
  onay alanıdır. Onay kuyruğu ekranı bu alanı okur.
## 8) Müşteri Teklif Portalı — "Tekliflerim"

Teklif iletilen **her** müşteri, kendi tekliflerini **korumalı girişle geçmişe dönük** izler.

- **Giriş:** mevcut hesap oturumu. E-postadaki teklif linki, oturum yoksa **hesap girişine
  düşer** (dönüş yoluyla) — v0.1 Q4'ün login şartı korunur, misafir kabul yok.
- **Yüzey:** `views/account` altında yeni bir alan; SaaS **Proje paketi bayrağına** bağlanır.
- **İçerik:** durumlar · **revizyon geçmişi** (arşiv PDF'ler dahil, §5/5) · güncel PDF ·
  kabul/red eylemleri (yalnız güncel revizyonda ve süre içindeyse etkin).
- **⭐ İzolasyon:** portal **yalnız o muhatabın tekliflerini** gösterir. Satış Projesi çatısı,
  diğer muhataplar ve onların fiyatları **hiçbir koşulda** görünmez (§2/3). Bu bir filtre
  tercihi değil, RLS şartıdır.

**Render/önbellek (v0.1 Q5'in devamı):** portal client-fetch `force-dynamic` yüzeydir; teklif
verisi hiçbir statik/ISR yüzeyde görünmez, dolayısıyla `rendering-cache-standard.md`'nin
tetik + revalidate şartı **bu modüle uygulanmaz.** Sınır şartı aynen taşınır: teklif verisi bir
gün statik bir yüzeye çıkarsa, o PR aynı gün DB tetiği + revalidate dalını getirmek zorundadır.
## 8.5) Ekran yerleşimi — E5 Kompozör (T133 bağı)

> **Kaynak:** `erp-workspace-design-standard.md` v0 (T133-VH, commit `44def9e8`, 318 satır).
> Bu belge yazıldığında o cetvel **henüz gönderilmemişti**; kararlar ADMIN'in 08-20 08:50
> panosundan alındı ve dosya indiğinde birebir aynısı okunacak. Dosya inince bu bölümün
> kaynağı **dosya adına** çevrilir.

Teklif kompozörü, T133'ün beş kanonik ekran deseninden **E5 (Kompozör)**'dür ve teklif modülü
o desenin **ilk uygulamasıdır**. ADMIN bunu adıyla işaretledi: E5 ödünç bir desen değil —
Fiori'de ve Power Apps'te karşılığı yok, en yakın akraba (Salesforce console workspace) başka
bir sorunu çözüyor. **Ödünç olmadığı için ilk uygulamasında şablona güvenilmez, davranış ölçülür.**

**Yerleşim (Recep kararı, T133'te sabit):**

| Bölge | İçerik |
|---|---|
| üst | durum şeridi · revizyon no · sahip · son değişiklik |
| sol | bağlam: müşteri / proje-saha / geçmiş — **salt okunur** |
| orta | kalem tablosu: katalog arama + katalog-dışı **hızlı pasif ürün kaydı** (§3.2) |
| sağ | **canlı PDF önizleme** |
| alt | eylem çubuğu: Taslak kaydet · Onaya gönder |

**Dört kural (T133'ten, teklif yüzeyine bağlanmış hâli):**

1. **Sonlandırıcı eylemler altta.** Üst şerit bilgi alanıdır, eylem barı değildir: üstte kimlik,
   altta karar. Yayımlama (`draft → quoted`) alt çubuktan yapılır.
2. **Sol sütun salt bağlamdır.** Müşteri/proje kaydı kompozörden düzenlenmez — iki farklı
   nesneyi aynı anda yazmak kaydetme semantiğini bozar.
3. **Sağ sütun ayrı bir rapor değildir.** Canlı PDF önizleme ortadaki verinin çıktısıdır;
   *"Önizleme üret"* düğmesi **olmaz**, önizleme veriyle aynı anda yaşar.
4. **Dar ekranda üç sütun yığılır, gizlenmez.** Önizleme sekmeye düşebilir; **bağlam düşemez** —
   bağlamı gizlemek kompozörün varlık sebebini siler.

⚠ **Tuzak — portal tema kapsamı.** Sağ önizleme ve katalog arama açılırları portala çıkıyorsa
`admin-design-standard.md` §4.11'in tema kapsamı **dışında** kalır; 2026-08-19'da #659'da tam bu
yaşandı (modal şeffaf, menü okunmaz). Önizlemeyi portal'a çıkarmadan önce o bölüm okunur.

**Çok-bağlamlı çalışma (iki teklifi yan yana) v0'da YOKTUR** — ihtiyaç henüz kanıtlanmadı.
Kompozör bağlamı tek ekranda tuttuğu için madde kapalıdır; kullanıcı iki teklifi karşılaştırmak
zorunda kalırsa **kanıtı bu modül üretir** ve madde yeniden açılır.

> **T133'ün C5 envanter maddesine cevap (kapsam bende):** ADMIN, "müşterinin siteden kendi
> teklifini kabul edebilmesi yeni modelle çelişiyor" diye işaretledi. **Çelişmiyor** — Recep'in
> 08-20 kabul kararı site-tıklamasını *birincil dijital kanal* olarak açıkça korur (§7.1).
> Çelişen şey kabulün kendisi değil, kabulün **kanıtsız** olmasıydı; §7.2 onu kapatıyor.
> Migration'lı olduğu ve Recep kapısı olduğu tespiti ise doğrudur (§16).
## 9) Çakışma ve fiyat tutarlılığı — UYAR, bloklama

T134/8 ve /9: üç ERP'nin **hiçbiri** çakışan teklifi engellemiyor ya da uyarmıyor; deal
registration dünyasında desen "varsayılan otonom kural + istisnada **insan hakemliği**".
Aynı projede farklı taraflara farklı fiyat uyarısı için satıcı-tarafı pratiği **ölçülemedi**.

**Karar:**

- Aynı Satış Projesinde **canlı başka teklif** varsa kompozör **uyarır**. Uyarı otonomdur.
- Aynı projede aynı ürün **farklı fiyatla** teklif edilmişse kompozör farkı **yüzdeyle** gösterir.
- **Otomatik iptal, otomatik kilit, otomatik fiyat eşitleme YOKTUR.** Kapatma/iptal/devam
  kararı **daima kullanıcıdadır**. Ticari karar sistemin değil satıcınındır.
- Aynı projeye **çoklu teklif serbesttir** (T134/7); kazanan işareti kullanıcıda (SF'in Primary
  deseninin karşılığı), sistem bloklamaz.

> Bu bölüm bilerek **muhafazakâr**: sektörde karşılığı olmayan otonom bir kural icat etmek,
> ilk yanlış iptalde ticari zarar üretir. Uyarı ucuz, yanlış otomasyon pahalıdır.
## 10) Köprü — kabul → TASLAK sipariş (V1.1)

`commerce-domain-map-standard.md` §5'in **1 numaralı köprüsü** budur ve sınırları oradan gelir.

- Kabul edilen teklif **checkout'suz bir TASLAK sipariş** doğurur. Kupon yok; ödeme anlaşmayla
  ilerler (Recep kararı).
- **Yön tektir:** sipariş teklife yalnız `converted` durumunu ve `converted_order_id` alanını
  yazar. Teklif, siparişin durumuna **hiçbir şey** yazamaz. İki durum makinesi ayrı kalır.
- **Fiyat otoritesi TEKLİFTİR.** Kabul anındaki kalem fiyatı sipariş kalemine snapshot'lanır;
  fiyat listesinden **yeniden çözülmez**. Aksi hâlde müşteri kabul ettiğinden başka bir tutar
  görür — anlaşmanın kendisi bozulur.
- **Dönüşüm bir kezdir.** Garanti şema kısıtından gelir: `converted_order_id` UNIQUE +
  `accepted` → `converted` monoton geçiş.
- **Adres/fatura bilgisi teklifte YOKTUR** (T105 ölçümü: `venthub_orders.shipping_address` ve
  `billing_address` NOT NULL, teklifte karşılıkları yok). Köprü bunları **uydurmaz**; taslak
  sipariş bu alanlar tamamlanana kadar sevk edilemez.
- **İkinci para yolu açılmaz** — bu köprünün en önemli güvenlik özelliğidir.

> **T105'ten değişen:** o raporda `product_id` NULL kalemler için dönüşümü bloklamayı
> önermiştim. §3.2'deki **pasif ürün** kararı o engeli ortadan kaldırdı; blok kuralı v2'de
> **yoktur**.
## 11) V2 — LLM taslak hazırlar, insan onaylar

- LLM (VISION danışman hattı) bir teklif **taslağı** hazırlayabilir.
- **⭐ LLM müşteriye doğrudan fiyat İLETEMEZ.** Taslak **onay kuyruğuna** düşer; iletim yalnız
  insan onayından sonra olur. Bu bir ürün tercihi değil, ticari güvenlik kuralıdır.
- Onay kuyruğu **ayrı bir ekrandır** (T133 kabuğunun Onay Kuyruğu kanonik deseni). Temsilci
  taslakları da aynı kuyruğa düşer.
- Kuyruk kararı `admin_audit_log` kaydı üretir: kim, hangi taslağı, hangi gerekçeyle onayladı.
## 12) PDF ve iletim

- Yayımlama (`draft` → `quoted`) **PDF üretir** ve `sent_at` damgasını yazar. PDF revizyona
  aittir; her revizyonun kendi PDF'i portalda arşiv olarak kalır (§5/5).
- İletim e-posta iledir; link **hesap girişine** düşer (§8).
- **Q6 yeniden yazıldı.** v0.1 "talebiniz alındı" e-postasını bilinçli boşluk sayıyordu; oysa
  `request_email_sent_at` kolonu canlı (Ç10). v2'de iletim yönleri: admin → müşteri (teklif
  hazır / güncellendi / süre yaklaşıyor) ve sistem → müşteri (talep alındı).
- **Kabul bildirimi ZORUNLUDUR.** Dolibarr'ın bilinen kusuru (#20204: imza sonrası bildirim
  bazı sürümlerde gitmiyor) bu maddeyi doğurdu — kabul gerçekleşir ama satıcı haberdar olmaz.
  §15/R6 bunu ölçer.
- Bildirim **best-effort** kalır: e-posta hatası statüyü geri almaz (iade deseniyle aynı). R6
  bildirimin **çağrıldığını** ölçer, teslim edildiğini değil.
## 13) Otonom / Config / Kullanıcı haritası

T134 sentez tablosunun bu modüle düşen hâli. Kural: **sektörde tam-otonom kritik karar yok;
biz de icat etmiyoruz.**

| Karar | Konum | Cetvel |
|---|---|---|
| Süre değeri | CONFIG (global varsayılan + teklif başına override) | §6 |
| Süre dolunca davranış | OTONOM (cron) + OTONOM (erişim/kabul anı kapısı) | §6 |
| Kabul kimlik seviyesi | Taban OTONOM (login zorunlu) · eşik üstü CONFIG | §7 |
| Kabul kanıt seti | OTONOM (her kabulde otomatik yazılır) | §7.1 |
| Onay eşiği | Mekanizma OTONOM, değer CONFIG + müşteri-bazlı override | §7.3 |
| Revizyon modeli | OTONOM (amend zinciri; yalnız güncel kabul edilebilir) | §5 |
| Eski revizyon linki | OTONOM (yeni sürüm sayfasına yönlenir, arşiv görünür) | §5/5 |
| Projeye çoklu teklif | SERBEST; kazanan işareti KULLANICI | §9 |
| Çakışan teklif tepkisi | OTONOM uyarı + KULLANICI kararı (otomatik iptal YOK) | §9 |
| Aynı projede farklı fiyat | OTONOM uyarı, blok YOK | §9 |
| Çoklu-taraf-tek-proje | OTONOM izolasyon (RLS) | §2 |
| Kabul → sipariş | CONFIG (varsayılan: taslak sipariş doğar, sevke insan onayı) | §10 |
| LLM taslağı | İNSAN ONAYI zorunlu, otomatik iletim YOK | §11 |

**Referans uygulama:** ERPNext'in iki deseni (günlük expiry cron + Authorization Rule config
katmanı) mimarimize en yakın olanıdır; §6 ve §7.3 bilerek onlara benzer.
## 14) Kapsam dışı (v2) — bilinçli kesimler, **bitiş kriteriyle**

v0.1'in Q8 kesimleri gerekçesizdi ve bir tanesi (Ç10) canlı kodun gerisinde kaldı. v2'de her
kesim **ölçülebilir bir bitiş kriteriyle** yazılır:

| Kesim | Niçin | Bitiş kriteri (bu sağlanınca kesim düşer) |
|---|---|---|
| Bundle / kit (ana + opsiyon) | Kalem modeli önce düz çalışsın | dealer-network §5'in bundle kavramı ayrı iş emrine bağlandığında |
| 8 basamaklı fiyat merdiveni (List→Net) | Bayi hattı **PARK** (Recep 08-20) | Bayi hattı parktan çıktığında |
| Misafir (hesapsız) teklif | Kabul kanıtı oturuma dayanıyor (§7) | Ayrı bir kimlik doğrulama akışı tasarlandığında |
| Çok-seviyeli onay zinciri | v2'de tek seviye yeter (§7.3) | Eşik iki kademeye çıktığında |
| ~~Ekran yerleşimi~~ **DÜŞTÜ** | T133 v0 yazıldı (`44def9e8`) | §8.5 eklendi; T133 dosyası inince kaynak dosya adına çevrilir |
| E-imza (çizim) | Clickwrap hukuken eşdeğer (§7.1) | Karşı taraf sözleşmesi çizim imza şart koşarsa |

**Bu tablo bir söz senedidir:** bir kesimin bitiş kriteri sağlandığı hâlde cetvel
güncellenmemişse, bu Ç10 sınıfının tekrarıdır ve kod incelemesinde adıyla anılır.
## 15) Bekçi sözleşmesi — INV-QUOTE-2

INV-QUOTE-1'in R1–R6 kuralları **aynen geçerlidir** (SSOT tekliği, UI/DB simetrisi, soğurucu
terminaller, sahiplik+tenant, fiyat kolonlarına müşteri yazamaz, rota↔sayfa). v2 şunları ekler:

| # | Kural | Sebep |
|---|---|---|
| R7 | Vitrine ürün getiren her sorgu `status='active'` süzmesini taşır | §3.2 — pasif ürün sızıntısı; süzme bugün **sorgu başına** tekrarlanıyor (6 yer, ölçüldü), tek kapı yok |
| R8 | `quotes` INSERT politikalarında admin yolu **yalnız** `status='draft'` kabul eder | §4 — giriş durumu kilidi; admin `quoted` bir belgeyi doğrudan var edemez |
| R9 | Müşteri kabul politikasının `with check` bloğu §7.2'nin **beş şartını** taşır | §7.2 — değer kapısı; biri düşerse kabul kanıtsız/eski revizyonda/süresi geçmiş olabilir |
| R10 | `draft → quoted` geçişinde `valid_until` ve `currency` NOT NULL | §6, §8 — süresiz/para birimsiz belge yayımlanamaz |
| R11 | Yayımlanan revizyon, öncekini **aynı işlemde** `superseded` yapar; iki canlı revizyon oluşamaz | §5/2 |
| R12 | Kabul, `superseded_by is null` olan kayıtta gerçekleşir | §5/3 — rev-2 yayındayken rev-1 kabul edilemez |
| R13 | Kabul gerçekleştiğinde bildirim ucu **çağrılır** | §12 — Dolibarr #20204 sınıfı |
| R14 | Müşteri yüzü sorgularında `sales_project_id` üzerinden **başka muhatabın** teklifi görünmez | §2/3 — çoklu-taraf izolasyonu; ihlali ticari felaket |

| R15 | `user_id IS NULL` iken `accepted` ve `converted` yönüne geçiş **DB tarafından** reddedilir | §2.5 — muhatap kilidi; ekran kapısı sayılmaz |
| R16 | `contact_name`/`contact_email`/`contact_phone` NOT NULL; kimliksiz teklif satırı oluşamaz | §2.5 — kimlik ekseni |
| R17 | Hesapsız teklif hiçbir müşteri SELECT politikasından dönmez | §3.3 — sahiplik yüklemi NULL ile eşleşmemeli |

**⚠ R9'un İKİ ŞARTI HENÜZ POLİTİKADA DEĞİL — adıyla, gizlenmeden (2026-08-26).**
`accept_ip` ve `accept_declaration_version` NOT NULL şartı `quotes_update_customer_decision`
politikasına **yazılmadı**. Gerekçe ölçüldü, tercih değil: bu iki alanı yazabilecek tek
taraf istemcidir (kolon-grant `authenticated`'a verilir), ve **istemciden gelen IP kanıt
değil BEYANdır**. Şartı koymak kanıt üretmez; istemciyi değer uydurmaya zorlar ve ortaya
*kanıt gibi görünen* bir alan çıkarır — bu, hiç alan olmamasından daha tehlikelidir.
Doğru çözüm **sunucu tarafında damgalayan bir kabul ucu**dur (RPC/Edge) ve o **ayrı bir
kalemdir**. O uç inene kadar R9 üç şartla koşar (`superseded_by is null`,
`valid_until >= now()`, `accept_recorded_by is null` + kanal/revizyon pini) ve bu satır
eksiğin **bitiş kriteridir**: sunucu damgalı uç indiği gün iki şart politikaya girer ve
bu paragraf silinir.

**⚠ §3.1 `currency` hücresi ile R10 arasındaki fark bilinçlidir.** Kolon NULLABLE'dır;
NOT NULL şartı `draft → quoted` geçişinde tetiktedir. Kolon düzeyinde NOT NULL, DEFAULT
gerektirirdi ve DEFAULT bir **türetmedir** — INV-CURRENCY-1'in yasakladığı şey. DEFAULT'suz
NOT NULL ise canlı RFQ yazma yolunu kırardı (ölçüldü: `quoteService.ts` currency göndermiyor).

**Ölçüm biçimi zorunlu:** kurallar **etki** ölçer, metin değil. R9/R12 için ayırt edici kol
şarttır — yalnız ret gözlemi "kanal kapalı" hâlinden ayırt edilemez; **kabul eden bir kol**
da denenmelidir. R15 için kabul eden kol: `user_id` dolduruldu → AYNI geçiş **geçmeli**;
yalnız ret gözlemi "tetik hiç çalışmıyor" hâlinden ayırt edilemez. R17 için: hesap bağlanınca
AYNI belge müşteri sorgusundan **dönmeli**. Yöntem (KVKK §3.6 kapanış kanıtının yöntemi: `begin … rollback`, prod'a sıfır yazma).

Bekçinin kendisi **bilerek bozularak** kırmızı gösterilir; geçmesi çalıştığını kanıtlamaz.
Yorum sıyırma `[^\r\n]` ile yapılır (CRLF fantomu, T017 dersi).
## 16) Migration planı — TEK migration, Recep kapısı

**Dar `converted` migration'ı İPTAL** (Recep 08-20). Şema değişikliği v2 tasarımı onaylandıktan
sonra **tek bir migration** olarak iner:

1. `venthub_quotes_status_check` → §4'ün genişletilmiş kümesi
2. `enforce_quote_status_transition` → §4 haritasının aynası
3. Başlık alanları (§3.1) — revizyon, süre, para birimi/toplam, kabul kanıt seti, proje/muhatap, köprü
4. Kalem alanları (§3.2) + `product_id` NOT NULL'a çekilir
5. RLS: admin INSERT politikaları (Ç1/Ç2), müşteri kabul politikasının sertleştirilmesi (§7.2),
   Satış Projesi izolasyonu (§2/3)
6. Expiry cron işi (§6, kapı 1) — ⚠ **AYRI ONAYLA KURULUR, bu migration'ın parçası
   DEĞİLDİR.** Karar OPS/AUTH 2026-08-26: cron kurulduğu an **periyodik prod yazımı**
   başlar; bu, tek seferlik bir şema değişikliğinden farklı bir risk sınıfıdır ve
   kendi Recep onayını hak eder. Şemayı kuran migration cron'suz iner; §6'nın
   **kapı 2'si** (kabul anındaki `valid_until >= now()` şartı) zaten tetikte ve
   politikada olduğu için süresi geçmiş teklif cron hiç koşmasa bile kabul edilemez
7. **Muhatap kimliği (§2.5):** `user_id` NULLABLE'a çekilir; `contact_name`/`contact_email`/
   `contact_phone` NOT NULL eklenir; muhatap kilidi `enforce_quote_status_transition` içine yazılır

⚠ **NOT NULL kısıtı MEVCUT satırlarda da koşar.** Bugün `venthub_quotes` 0 satır olduğu için
bedeli sıfır; modül kullanılmaya başladıktan sonra aynı kısıt geriye dönük ihlal üretir. Kısıt
eklenmeden önce canlı DB'de ihlal sayısı **merge öncesi** ölçülür.

**Bugünkü şema — ölçüldü (2026-08-23, canlı `information_schema.columns`):** `venthub_quotes.user_id`
şu an **NOT NULL**. Yani §2.5 kilidi bir ekleme değil, önce bir **gevşetmedir** (`drop not null`)
ve ardından gelen kilit tetikte kurulur. Sıra tersine çevrilirse hesapsız belge hiç oluşamaz.

**Göç riski SIFIR — ölçüldü:** `venthub_quotes` 0 satır, `venthub_quote_items` 0 satır. **Yeniden ölçüldü 2026-08-23: hâlâ 0/0** (bu iddia
zamanla bayatlar; kısıt eklenmeden önce tekrar ölçülür). Bu,
şemayı bugün doğru kurmak için elimizdeki en ucuz penceredir; modül kullanılmaya başladıktan
sonra aynı değişikliklerin bedeli veri göçüyle birlikte artar.

⚠ **Migration merge edildiği an prod'a uygulanır** (CLAUDE.md kural 13). Bu PR yalnız
**tasarımdır**; migration ayrı PR'dır ve merge kararı **yalnız Recep'e** aittir.

---

## İlişkili cetveller

`commerce-domain-map-standard.md` (§5 köprü-1) · `dealer-network-standard.md` (§5 CPQ hattı) ·
`legal-compliance-standard.md` (§3.6 iki-kapı deseni) · `pricing-standard.md` (fiyat otoritesi) ·
`erp-workspace-design-standard.md` (T133 — ekran yerleşimi buraya bağlanacak) ·
`measurement-discipline-standard.md` (K1–K13; bu belgedeki her ölçüm o kurallara tabidir).
