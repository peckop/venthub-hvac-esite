# CRM Cetveli — nesne katmanı, doğrudan satış hattı ve SAHA PROJESİ (v0)

> **Durum:** v0 · **Şerit:** ADMIN-CUSTOMER · **İş emri:** T130-VH · **Tarih:** 2026-08-20
> Bu cetvel **nesne katmanını** kurar. Teklif hattını, bayi ağını ve müşteri hesabı
> yüzeyini **kurmaz** — onların cetvelleri var ve bu belge onlara *sınır* çizer.

---

## 1. KAYNAK / CETVEL

**Bu işi yöneten cetvel:** yoktu — bu belge onu yazıyor. Ama **boşlukta yazılmadı**: kapsam
komşu cetveller okunarak daraltıldı (OPS-AUDIT kapsam kararı, 2026-08-20 10:02) ve
**T134-VH araştırması üzerine kuruldu** (yeni araştırma başlatılmadı).

**Üzerine kurulduğu araştırma — T134-VH (OPS-AUDIT, PR #696):**
`docs/research/t134-acik-kaynak-erp-2026-08-20.md` ·
`docs/research/t134-cpq-proposal-saha-2026-08-20.md` ·
`docs/research/t134-sentez-karar-tablosu-2026-08-20.md`.
Bu cetvel T134'ün **karar-9 ve karar-10**'unu uygular; onları yeniden türetmez.

**İç kaynaklar (okundu, adresli):**

| Kaynak | Ne öğrenildi |
|---|---|
| `supabase/migrations/20260612000000_dealer_layer_baseline.sql:26` | `organizations` = id, name, tier_level, is_active. Adres/vergi/cari **yok**. |
| `...dealer_layer_baseline.sql:74-95` | `user_projects` = id, user_id, name, description; `project_items` = project_id, product_id, quantity, notes. **Rol/muhatap kolonu YOK.** |
| `src/types/database.types.ts` (`user_profiles`) | id, role, full_name, phone, tenant_id, organization_id. CRM alanı **yok**. |
| `supabase/migrations/20260816125346_quotes_v1.sql:33,148,185` | `source_project_id → user_projects(id)`; SELECT = `user_id = auth.uid() OR is_admin_user()`. |
| **canlı DB** (`pg_trigger`) | `trg_enforce_quote_status_transition` → `venthub_quotes` üzerinde **CANLI**. |
| `src/lib/quotes/quoteStatusMachine.ts` | Durum geçiş haritası — kod tarafı SSOT. |
| `docs/standards/quote-standard.md` Q1 | Proje = müşterinin **yaşayan çalışma listesi**; `source_project_id` **yalnız izlenebilirlik**. |
| `docs/standards/commerce-domain-map-standard.md` §2, §3, §5 | İki omurga; "Lead/CRM = **eksik**"; **KAPALI köprü listesi** (köprü 3 = lead → teklif, ters yön yok). |
| `docs/standards/dealer-network-standard.md` §1, §5, §7-9 | Bayi ≠ Kullanıcı; RFQ hattı; Deal Registration; tier/territory — **zaten cetvelli**. |
| `src/lib/rbac.ts:9,30,59-71` · canlı `pg_policy` | Sayfa matrisi `moderator`/`viewer` → `'*'`; RLS moderator'a **yalnız 7 tabloda** SELECT veriyor. |

**Kendi dış araştırmam (T134'ü tamamlar, tekrarlamaz):** dört CRM'in **veri modeli**
gerçekten okundu — Twenty (`packages/twenty-server/src/modules/*/standard-objects/*.workspace-entity.ts`),
EspoCRM (`application/Espo/Modules/Crm/Resources/metadata/entityDefs/*.json`),
Odoo (`addons/crm/models/crm_lead.py`, `crm_stage.py`), Frappe CRM (`crm/fcrm/doctype/*/*.json`).
T134 *teklif/proje davranışına* baktı; bu okuma *nesne modeline* bakar.

---

## 2. KAPSAM

**İÇİNDE:** (a) hesap / kişi / etkileşim **nesne katmanı** · (b) **doğrudan satış hattı** ·
(c) ⭐ **saha projesi** (T134 karar-10).

**DIŞINDA** — sahibi var, dokunulmaz:

| Konu | Sahibi |
|---|---|
| RFQ → Teklif → Sipariş hattı, teklif modeli, revizyon zinciri | `dealer-network-standard.md §5` + `quote-standard.md` (AUTH / T131) |
| Deal Registration, çakışma çözümü | `dealer-network-standard.md §8` |
| Tier / territory / lead auto-assignment | `dealer-network-standard.md §9` |
| Müşterinin kendi hesap yüzeyi | `customer-account-standard.md` (AUTH) |
| Kişisel veri sınıflandırması | `legal-compliance-standard.md §3.4` |

⚠ `dealer-network-standard.md` bugün **sahipsiz-park** (bayi modülü T106 bloklu, Recep kararı).
Bu cetvel ona **dokunmaz**.

---

## 3. ÜÇ NESNE

### 3.1 Hesap — `organizations` genişletilir, yeni tablo AÇILMAZ

Dört CRM'in **dördünde de** bir şirket nesnesi var (Twenty `Company`, Espo `Account`,
Odoo `res.partner.is_company`, Frappe `CRM Organization`). Bizde `organizations` zaten var.

**Kural:** hesap kavramının otoritesi `organizations`'tır. İkinci bir "müşteri" tablosu
açılmaz — açılırsa "bu firma kim" sorusunun iki cevabı olur.

### 3.2 Kişi — bugün YOK, ve `user_profiles` onun yerine geçemez

`user_profiles` **giriş yapabilen kullanıcıdır**. CRM'in kişisi **giriş yapmayabilir**:
şantiye şefi, satın almacı, proje müdürü. İkisini aynı tabloda tutmak, kayıt açmak için
hesap açtırmayı zorunlu kılar — saha gerçeğine aykırı.

**Kural:** kişi ayrı nesnedir; `auth.users` bağı **isteğe bağlıdır** (nullable).

**Kişi ↔ hesap ilişkisi — v1'de 1:N, bilinçli.** Dört sistemden **yalnız EspoCRM** çoka-çok
yapıyor (`AccountContact` join, `role`/`isInactive` kolonlu); Twenty ve Odoo tekil FK,
Frappe dolaylı. Sektör uzlaşmıyor → ucuz olanı seçiyoruz ve **sınırı adıyla yazıyoruz**:
taşeron mühendisin iki firmayla çalışması **modellenemez**. Kapanacaksa join tablosu ile
kapanır, `organization_id` çoğaltılarak değil.

### 3.3 Etkileşim — TEK polimorfik defter

Sektör bölünüyor: Twenty tek polimorfik `TimelineActivity`; Espo ve Frappe kanal başına ayrı
tablo; Odoo karma (`mail.thread` mixin + toplantı için ayrı FK).

**Seçimimiz: tek defter.** Gerekçe: kanallarımız **heterojen ve artıyor** (telefon, WhatsApp,
e-posta, site formu); kanal başına tablo her yeni kanalda migration ister.

⚠ **Mevcut `*_email_events` tabloları bu defter DEĞİLDİR.** `order_email_events`,
`quote_email_events`, `shipping_email_events` "**gönderdik mi**" sorusunu cevaplar —
gönderim defteridir. Etkileşim defteri "**müşteriyle ne oldu**" sorusunu cevaplar. Birini
diğerinin yerine kullanmak `commerce-domain-map §5/5`'i ihlal eder (bildirim modülü hiçbir
modülün durumunu **yazamaz**).

---

## 4. SAHA PROJESİ — T134 karar-10'un uygulaması

**Senaryo (Zorlu Center):** tek iş; işveren, ana yüklenici, alt yüklenici ve kiracı ayrı ayrı
fiyat sorar. Bugün bu dört talep birbirinden **habersiz** dört tekliftir.

**Sektör bu sorunu ÇÖZMEMİŞ — T134 iki bağımsız kaynakla doğruladı:** Dolibarr'da proje
**tek-muhatap kilidi** var (`fk_projet` tekil) ve GitHub #13524 *"Multiple Thirdparty under a
single project… needed by most companies"* yıllardır açık; bid-management tarafında da
standart bulunamadı (Procore modeli "tek ihale sahibi, çoklu bidder", bizim tersimiz).
**Bu yüzden burası bizim özgün cetvel alanımız.**

### 4.1 `user_projects` bu iş için KULLANILAMAZ

`user_projects` = id, user_id, name, description (`dealer_layer_baseline.sql:74-95`) —
**tek sahibi vardır**, RLS'i "kendi satırın" üzerine kuruludur, **rol kolonu yoktur**.
Saha projesi **çok taraflıdır**. `quote-standard.md` Q1 zaten `source_project_id`'yi
"**yalnız izlenebilirlik**" diye sınırlamış; o bağa ikinci bir anlam yüklemek
"PROJE ≠ TEKLİF" ayrımını bulanıklaştırır.

### 4.2 Muhatap rolü

Proje ↔ taraf bağı **rol taşır**: `isveren` · `ana_yuklenici` · `alt_yuklenici` · `kiraci`.
Rol, tarafın **o işteki konumudur** — hesabın tipi değil. Aynı firma bir projede ana
yüklenici, başkasında alt yüklenici olabilir.

> Bu terim VentHub belgelerinde daha önce **hiç geçmiyor** (NLM ikizi ve Orion ikizi
> bağımsız doğruladı). En yakın emsal `dealer-network-standard.md §7` Account Team /
> Opportunity Split'tir ama o **çok-BAYİ** senaryosunu çözer (bir işte birden çok bayiyi
> alacaklandırma), **çok-MUHATAP** senaryosunu değil. Aktarılamaz.

### 4.3 ⭐ Proje bir GÖRÜNÜRLÜK KÖPRÜSÜ DEĞİLDİR

**Ölçüm:** `venthub_quotes` SELECT politikası bugün `user_id = auth.uid() OR is_admin_user()`
(`quotes_v1.sql:148`). "Aynı projedeki taraflar birbirini görsün" biçimindeki her kural bu
politikayı **sessizce genişletir** ve rakip firmaların fiyatlarını birbirine açar.

**Kural (T134 karar-10):** her muhatap **yalnız kendi teklifini** görür, **proje çatısını
asla**. Proje **gruplar, yetki VERMEZ**; çatının tamamını yalnız **satıcı taraf** görür.
Gevşetilmesi `commerce-domain-map-standard.md §5` kapalı köprü listesine **yeni madde ekleyen
bir PR** gerektirir — sessizce yapılamaz.

### 4.4 Aynı projede farklı taraflara farklı fiyat — UYARIR, BLOKLAMAZ

T134 karar-9: satıcı-sistemi tarafında sektör pratiği **bulunamadı**. Bizim kuralımız:
kompozör **uyarır** ("bu projede aynı ürün X'e %n farklı fiyatla teklifte"), **bloklamaz** —
ticari karar kullanıcınındır. Aynı çizgi karar-8 ile tutarlıdır: çakışan canlı teklifte
sistem uyarır, kapatma/iptal **daima** kullanıcıda, otomatik iptal **yok**.

---

## 5. DÖRT TASARIM SORUSU — sektör kanıtlı öneri

| # | Soru | Sektör | Önerimiz |
|---|---|---|---|
| 1 | Lead ayrı tablo mu? | Espo/Frappe **evet**, Odoo **hayır** (`type` alanı, aynı satır), Twenty'de Lead **yok** | **Ayrı tablo değil.** `contact_messages` zaten giriş defteri (T104 onu gerçek yazar hâle getiriyor); CRM'e giren kayıt hesap/kişi olur. Bağlayıcı hüküm karne incelemesinde. |
| 2 | Kişi ↔ hesap çoka-çok mu? | Yalnız Espo evet | **Hayır (v1)** — §3.2, sınır adıyla yazılı. |
| 3 | Etkileşim tek tablo mu? | Twenty tek, Espo/Frappe kanal başına, Odoo karma | **Tek defter** — §3.3. |
| 4 | Pipeline aşaması kod mu veri mi? | Odoo/Frappe **veri** (ayrı tablo), Espo JSON-metadata | ⚠ **MEVCUT KARAR VAR, yeniden yasalaştırmıyoruz.** VentHub'ın seçimi **Dual-Enforcement**: SSOT kodda (`quoteStatusMachine.ts`), aynı grafik DB'de trigger + CHECK ile **ayrıca** zorlanıyor — canlı doğrulandı (`trg_enforce_quote_status_transition`). CRM'in kendi hunisi olacaksa **aynı deseni** izler; aşama **tablosu açmaz**. Kiracı-başı aşama ihtiyacı doğarsa **ayrı karardır** ve migration ister. |

---

## 6. ÇELİŞEN-MEVCUT (ölçüldü)

| # | Bulgu | Kanıt | Geri alma planı |
|---|---|---|---|
| Ç1 | Talep formu veriyi **hiçbir yere yazmıyor**, kullanıcıya "başarılı" diyor | `LeadModal.tsx:54-72`; `contact_messages` `src/`'de referanssız | **T104-VH kapsamında, planı onaylı** — burada yalnız envanter |
| Ç2 | Kişi kavramı yok; `user_profiles` giriş yapan kullanıcı | `database.types.ts` (`user_profiles`) | yeni nesne, migration → **Recep kapısı** |
| Ç3 | Not yalnız siparişe bağlı | `order_notes` (`20250915152500_...sql:54`) | polimorfik nota taşınır |
| Ç4 | `organizations` ticari alan taşımıyor (adres/vergi/cari yok) | `dealer_layer_baseline.sql:26` | kolon ekleme, migration |
| Ç5 | Sayfa matrisi `moderator`/`viewer`'a `'*'` verirken RLS **yalnız 7 tabloda** SELECT veriyor → **sessiz-boş** | `rbac.ts:9,30`; canlı `pg_policy`; guard'lar `rbac.ts:59-71`'de **rota rota elle** | `rbac.ts` **AUTH'un**; drift kapısı teklifi AUTH'ta |
| Ç6 | Deal Registration **belge düzeyinde var, canlıda aktif değil** | `dealer-network-standard.md §8` vs `docs/audits/dealer-data-ground-truth-2026-06-11.md` | bu cetvelin işi değil — envanter |

**Bu cetvelin geri alma planı:** belge kod yolunu değiştirmez → geri alma = dosyayı sil.

---

## 7. BU CETVELİN ÖLÇMEDİĞİ *(adıyla)*

- **Şema önerilmedi.** v0 kavram ve sınır koyar; kolon/tip kararı T131 (teklif) ve T134 sentez
  tablosuyla birlikte verilecek. Migration'lı her adım **Recep kapısıdır**.
- **Kişisel veri satırları yazılmadı.** CRM kişi tutmaya başladığında
  `legal-compliance-standard.md §3.4` tablosuna satır eklemek **bu modülün sahibinin
  yükümlülüğüdür** (`commerce-domain-map §4`). Şema olmadığı için henüz eklenmedi.
- **Paketleme kararının ADRESİ bulunamadı.** NLM ikizi "Satış (CRM yok) / Proje (CRM+CPQ+BOM) /
  Satış+Teknik Servis" paketlemesinin **karara bağlandığını** söylüyor ama **dosya atfı
  vermedi**; depoda da bulamadım. Yani *karar var* iddiası bugün **kaynak-adresli değildir** —
  adresi bulunana kadar bu cetvel paketlemeyi **veri** olarak kullanmaz.
- **Twenty'nin `Opportunity.stage` varsayılanlarının nerede seed edildiği ölçülemedi**
  (GitHub kod araması sıfır sonuç; `workspace-entity.ts` yalnız tip tanımı).
- **Frappe çekirdeğinin (`frappe/frappe`) Dynamic-Link ile gerçek çoka-çok yapıp yapmadığı
  ölçülemedi** — yalnız `frappe/crm` app'i okundu.
- **SuiteCRM incelenmedi.**
