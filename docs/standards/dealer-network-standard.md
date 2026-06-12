# VentHub B2B Bayi-Ağı Domain Standardı

> **Bu dosya nedir?** `admin-standard.md` jenerik admin'in **NASIL**'ını anlatır. Bu dosya, onun
> kapsamadığı **B2B bayi-ağı domain'inin** standardıdır — "bir distribütör + bayi ağı platformu NE'dir."
> Dört otorite kaynak-domain'inden araştırılarak damıtıldı (provenance §15).
>
> **Epistemik sınır (önemli):** Bu doküman **kanıtlanmış B2B/PRM/CPQ pratiğine** dayanır — Avensair
> hakkında bir iddia DEĞİLDİR. "Bunların ne kadarı Avensair'e uygun, onların gerçeği nedir" → bu bilgi
> sadece kullanıcıdadır; bu standart o gerçeğe göre **budanacak/önceliklenecek**. Bkz. memory `avensair-dealer-focus`.
>
> Bu, `admin-capabilities.md`'nin **varsayıma dayalı** bayi bölümünün yerine geçer (o bölüm araştırma değildi).

---

## 0. Sade dille: bu standart neden ayrı?

Jenerik e-ticaret admin standardı (Shopify/Polaris) "tabloyu, formu, yetkiyi nasıl kurarsın"ı anlatır —
ama "bir **bayi ağını** nasıl yönetirsin"i bilmez. O bambaşka bir domain: B2B commerce + **PRM** (Partner
Relationship Management) + **CPQ** (Configure-Price-Quote). Türkiye'de çoğu firma bunu mail/Excel/genel-CRM
ile yapar; e-ticarete gömülü şeffaf bir bayi-ağı az görülür. İşte bu standart, o az görülen şeyi
**kanıtlanmış temeller üzerine** kurmak için.

---

## 1. Çekirdek model: **Bayi (hesap) ≠ Kullanıcı** (en kritik kavram)

Dört kaynağın da birleştiği temel: alıcı bir *kişi* değil, bir *şirkettir*.

| Varlık | Ne | VentHub karşılığı |
|---|---|---|
| **Bayi (Dealer/Account)** | Satın alan şirket. Self-referential `parent_dealer_id` → hiyerarşi (ulusal→bölge→şube). | ❌ YOK (en büyük eksik) |
| **Bayi Lokasyonu** | Bir bayinin şubeleri; katalog/fiyat/vade lokasyona bağlanabilir. | ❌ yok |
| **Bayi Kullanıcısı** | Bayi adına işlem yapan kişi (çok kişi / bir bayi). Atanmış satış temsilcisi. | bugün `user_projects.user_id` (org'suz) |
| **Bayi Grubu** | Ortak config paylaşan bayiler (fiyat listesi, görünürlük). | ❌ yok |

> **VentHub tohumu:** Projeler bugün tek kullanıcıya bağlı. Standart = araya **bayi-organizasyonu** katmanı
> koymak: `dealer (parent) → dealer_user (roller) → dealer_location`. Hepsi **tenant-scoped**.

## 2. Bayi içi roller & self-service (delege yönetim)

- Bir bayide çok kullanıcı; **bayi kendi kullanıcılarını yönetir** (merchant yükü azalır).
- Standart rol kademeleri: **Bayi Admini** (tam: kullanıcı/onay/satınalma), **Kıdemli Alıcı** (satınalma+onay),
  **Junior Alıcı** (onaya gönderir, doğrudan alamaz). İzinler **rollerden birikir** (OroCommerce ACL).
- Erişim seviyesi taksonomisi: None → Basic (kendi) → Local (birim) → Deep (alt birimler) → Global → System.

## 3. Bayiye özel fiyatlandırma (price list resolution)

- **Price List** = ürün fiyatları + **miktar kademeleri** + para birimi + atama kuralı + priority.
- **Override sırası (düşük→yüksek): Config < Website < Bayi Grubu < Bayi.** Her seviyede *fallback* + *merge*.
- Çözülmüş sonuç **Combined Price List**'e materialize edilir; storefront onu okur.

> **VentHub tohumu:** `priceListId` + `getEffectiveUnitPrice` **zaten var** — eksik olan, fiyat listesini
> **admin'den yönetip tier'a atayan** UI. Tohum doğru, katman eksik.

> ⚠️ **Uygulanan model ≠ bu domain ideali (çelişki değil, kapsam kararı).** Yukarısı PRM/B2B teorisinin
> tam hâli (çok-katman override, per-account). VentHub'ın **faz-1'de inşa ettiği** model
> `dealer-module-blueprint.md §2`'deki **ORG-TIER tek sözleşme**: segment = `organizations.tier_level`
> (role değil), fiyat tier'a göre çözülür. Per-account / çok-katman = ileride additive — bugün kurulmaz.

## 4. Katalog görünürlüğü (gated catalog)

Hangi ürün, hangi bayiye, hangi fiyatla görünür → per-bayi/lokasyon katalog. (Adobe Shared Catalogs,
Shopify Catalogs+Price Lists.) HVAC'ta bayiye-özel net fiyat için kritik.

## 5. Teklif hattı: **RFQ → Teklif → Sipariş** (CPQ)

- **RFQ** (teklif talebi) → **Quote** (temsilci pazarlık eder) → kabul → **Order**'a dönüşür (pazarlıklı fiyat taşınır).
- **Quote modeli:** header → satırlar → **gruplar** (bina/kat/faz) → **bundle** (ana+opsiyon = kit/montaj).
- **8 fiyat alanı** sırayla: List → Regular → Customer → Partner → Net (her indirim aşaması ayrı izlenir).
- **Versiyonlama:** yeni versiyon = yeni kayıt + revizyon geçmişi (edit-in-place değil).
- **Onay kuralı:** marj/iskonto eşiğini aşan teklif çok-seviyeli onaya gider (ad-hoc Excel iskontosu = gelir kaçağı; bunu durdurur).
- **Monoton durum** (sadece ileri) — `CLAUDE.md kural 11` ile birebir.

> **VentHub tohumu:** `user_projects` BOM + "teklif iste" var → bunu **yönetilen pipeline** yap.

## 6. Proje/BOM bazlı teklif (HVAC'a birebir)

Üç bağlı artefakt: **MTO** (metraj, +%5-10 fire) → **BOQ** (malzeme+işçilik, karşılaştırılabilir teklif) →
**BOM** (sadece malzeme, kat/zon/sistem'e paketli, kuruluma hazır).
- **BOM satır şeması:** part_number (katalog SKU), açıklama, miktar, birim, konum/zon designator,
  **hiyerarşi (parent-child / çok-seviyeli montaj)**, maliyet, tedarik süresi.
- **Katalog eşleme:** metraj satırı → senin ürün SKU'na otomatik bağlanır (manuel hata biter).
- Model: `Project ≈ Opportunity + Quote header`; `ProjectLine ≈ Quote/BOM line`.

## 7. **Ortak proje havuzu** & işbirlikli satış (senin vizyonun — isimlendirilmiş)

Senin "ortak proje havuzu" dediğin şeyin kanıtlanmış karşılığı:
- **Shopping/Requisition list** — çok liste / kullanıcı; **paylaşım izin-tabanlı** (erişim seviyesi yükselt →
  aynı birimdekiler birbirinin listesini görür; ayrı share tablosu gerekmez). Listeden Order'a **veya** RFQ'ya.
- **Account Team** — kalıcı; hesaba + cascaded fırsat/teklife erişim verir; paylaşılan **takım rolleri** picklist'i.
- **Opportunity Split** (toplam %100): **revenue/overlay/product split** → bir ortak projede **birden çok bayiyi/temsilciyi** alacaklandırma. (Şeffaflık + adil paylaşım.)

## 8. ⭐ **Deal Registration** — şeffaflık & çakışma çözümü (FARKLILAŞTIRICI)

> Senin #1 derdinin (bayilerin birbirine salça olması, ölçülememesi, şeffaflık) kanıtlanmış, **enforce edilebilir** çözümü.

- **Tanım:** Bayi bir işi/projeyi **kaydeder**; sistem zaman damgasıyla sahipliği mühürler ("first come").
  Onaylanınca, o bayi o hesapta **tek yetkili** olur; diğer bayiler VE firmanın direkt ekibi o işten men edilir.
- **Yaşam döngüsü:** `Gönderildi → (duplicate/çakışma kontrolü) → İncelemede → Onay | Ret → Kazanıldı | Kayıp | Süresi-doldu` (+ Uzatma).
- **Çakışma koruması (asıl mekanizma):** gönderimde **duplicate tespiti** (son-müşteri + ortak ürün eşleşmesi);
  aktif kayıt varken duplicate **onaylanamaz**; tek yetkili sahip; ayrı **partner pipeline** (direkt satış karışamaz).
- **Onay:** kanal yöneticisi, 24-48s SLA; temiz/yüksek-tier işler **auto-approve**; karmaşık olanlar territory/tier/değere göre yönlenir.
- **Süre (exclusivity window):** 90-180 gün; bitmeden kapanmazsa `Expired` → iş serbest kalır ("squatting" önlenir); süresi dolan yeniden gönderemez, yeni kayıt açar.
- **Kayıt verisi:** bayi, son-müşteri, iş adı, ürün(ler), tahmini büyüklük, tip (yeni/upsell), kapanış tarihi, durum, zaman damgaları, ekler.

**Bu, "e-ticaret üzerinden şeffaf bayi ağı" vizyonunun çekirdeğidir.** Kanıtlanmış mekanizma + HVAC/proje bağlamı = kopyalanması zor.

## 9. Kademeler (tier) + Territory / Rules of Engagement

- **Tier (Gümüş/Altın/Platin):** 3-4 ideal; nicel eşik (ciro, sertifika, deal-reg/çeyrek) + nitel. Tier → farklı fiyat listesi, **daha uzun deal-reg exclusivity**, öncelikli lead. Tier = çakışma **tiebreaker**'ı.
- **Çakışma tipleri/çözümleri:** yatay (bayi-bayi)→deal-reg; dikey→account mapping; direkt→PRM↔CRM görünürlüğü.
- **Rules of Engagement** portalda yayınlanır (kim neyi, hangi bölgeye, hangi eşikte satabilir). **Territory** 1:1 → lead/deal auto-assignment.

## 10. Onboarding + Performans skorkartı + Şeffaflık paneli

- **Onboarding:** Başvuru (self-register) → Onay/Aktivasyon → Eğitim/sertifika → ilk-iş desteği. Hedef: 90-gün aktivasyon ≥%60, ilk-işe <30 gün.
- **Skorkart:** Ciro (bayi-kaynaklı ciro, kayıtlı deal sayısı), Engagement (eğitim, portal girişi), Lead (dönüşüm). **Leading** göstergeleri izle, sadece lagging ciroyu değil.
- **Şeffaflık paneli:** bayi kendi deal-reg durumunu, son tarihini, skorunu (akranlara karşı), komisyonunu **canlı** görür → güven → sadakat.

## 11. Cari / Kredi / Vade + Fatura

`credit_account` (limit, bakiye, vade enum: Net 30/60...), `invoice` (durum, vade tarihi, çoklu-ödeme). Tüm cari mutasyonu **audit-log**.

## 12. Satış-temsilcisi "masquerade" / assisted selling

Temsilci **bayi adına** işlem yapar (login as → sipariş ver), **temsilci kimliği siparişte** tutulur (atıf/komisyon). HVAC B2B siparişlerinin çoğu hâlâ temsilci/telefonla gelir → bu şart.

---

## 13. Farklılaştırma sentezi — "herkesin yaptığı" vs "bizim moat"

| Kanıtlanmış (temel — uydurmuyoruz) | Bizim novel sentezimiz (moat) |
|---|---|
| Deal Registration (PRM) | **HVAC e-ticaretine gömülü** deal-reg → şeffaf, ölçülebilir bayi ağı |
| B2B price list / quote / BOM | **Spec-driven HVAC katalog** (debi/basınç/ses/filtre) + proje/BOM eşleme |
| Account teams / shared lists | **Ortak proje havuzu** — mekanik/proje firmaları aynı havuzda, splits ile adil alacak |
| Generic CRM | 14-yıl HVAC otoritesi + (ileride) ESP/DW172 seçim motoru — domain moat |

**Dürüst çizgi:** Yapı taşları kanıtlanmış (bu yüzden sağlam temel). Ayıran şey, bu taşların **HVAC + bayi-ağı + e-ticaret** kombinasyonu — senin sektör bilgin olmadan kurulamaz. Fayda için, hatır için değil.

## 14. Epistemik sınır & sıradaki adım

Bu doküman **domain gerçeği** (araştırma). **Avensair gerçeği değil.** Sıradaki: sen Avensair'i anlat
(bayi ağı pratikte nasıl işliyor, hangi parçalar onlara uyuyor, "amatör" ile neyi kastettin) → bu standardı
Avensair'e **budayıp önceliklendiririz**. Sonra `admin-standard.md §8` cetveliyle inşa.

## 15. Provenance

| Kaynak-domain | Ne verdi |
|---|---|
| **OroCommerce** (doc.oroinc.com) | Customer≠CustomerUser, hiyerarşi, ACL roller, price-list resolution (CPL), RFQ→Quote, shareable shopping lists |
| **Adobe/Magento + Shopify + BigCommerce B2B** | Company account, çok-lokasyon, delege rol (Admin/Senior/Junior), gated catalog, negotiable quote, requisition, approval workflow, kredi/vade, rep masquerade |
| **PRM / Deal Registration** (Salesforce, Oracle PRM, Magentrix, Channeltivity) | Deal registration (yaşam döngüsü, duplicate koruma, expiry), tier, territory/RoE, onboarding, skorkart, şeffaflık paneli |
| **CPQ / Quote-to-Cash + B2B CRM** (Salesforce CPQ, Procore BOM/BOQ) | Quote header→line→group→bundle, 8 fiyat alanı, versiyon, onay eşiği, proje/BOM (MTO→BOQ→BOM), Account/Contact/Opportunity, account teams, splits |

*Yakınsama: "Bayi ≠ kullanıcı", "per-account price list", "RFQ→quote→order", "monoton durum", "deal registration"
birden çok bağımsız kaynakta tekrarlandığı için standarttır — tek ürünün tercihi değil.*
