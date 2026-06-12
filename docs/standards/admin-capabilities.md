# VentHub Admin — Yetenek Kapsamı, Bayi/Enterprise Modülü & Farklılaştırıcılar

> **Bu dosya nedir?** `admin-standard.md` "NASIL kurulur"u anlatır; bu dosya **"NE olmalı"yı** anlatır:
> hangi yetenekler bulunmalı, neyimiz eksik, **bizi ayıran ne**, ve **önce Avensair** için yol haritası.
> İkisi birlikte = VentHub admin'inin tam standardı.
>
> **Çapa kararlar:** Avensair-önce (tek-kiracı, bayi-ağı) → sonra SaaS-hazır. Farklılaşma = domain moat.
> Strateji memory: `avensair-dealer-focus`, `standard-first-strategy`, `venthub-vision`.

---

## 1. Yetenek kapsam haritası (NE) — gerçek duruma göre

| Alan | Yetenek | Durum (kanıtlı) |
|---|---|---|
| **Satış** | Siparişler (liste/pano, kargo, not, e-posta log, durum, audit) | ✅ zengin |
| | İadeler (RMA) | ✅ var |
| | Kargo/Lojistik | ✅ var |
| | Refund **aksiyonu** (durum değil işlem) | ⚠️ doğrulanmalı |
| **Katalog** | Ürünler (CRUD, CSV, health) | ✅ var |
| | Kategoriler + Authority içerik | ✅ var (HVAC teknik içerik) |
| | Stok/Envanter (rapor, hareket, QR, rezerv) | ✅ zengin |
| | **Spec-driven katalog** (debi/basınç/ses/filtre yapısal) | ⚠️ kısmi — farklılaştırıcı fırsat (§4) |
| | Kupon | ✅ var; kampanya/price-list yönetim UI ⚠️ yok |
| **Müşteri/B2B** | **Bayi/Dealer yönetimi (enterprise)** | ❌ **yok — kritik (§3)** |
| | Müşteri/CRM kartı, sipariş geçmişi | ❌ ayrı sayfa yok |
| | Proje/BOM → **Teklif → Sipariş hattı** | ⚠️ tohum var (`user_projects`), pipeline yok |
| | Bayiye özel fiyat listesi | ⚠️ veri tohumu var (`priceListId`), yönetim yok |
| **İçerik** | CMS/merchandising (banner, anasayfa) | ⚠️ sınırlı |
| **Operasyon** | Dashboard, audit, hata izleme, webhook, ayarlar | ✅ hepsi var |
| **Erişim** | Admin kullanıcı + roller (RBAC) | ✅ var |
| **SaaS** | Tenant/plan/white-label | ❌ stub — **Avensair için sonra** |

---

## 2. Öncelik çerçevesi — ÖNCE AVENSAIR

> Avensair = Vortice TR distribütörü + **bayi ağı**. Tek-kiracı. Hibrit model (kurulum + bakım).

**"Avensair'e hazır" tanımı (Definition of Done):** Avensair kendi bayi ağını bu panelden
**profesyonelce yönetebiliyor** — bayi tanımla, bayiye özel fiyat ver, bayinin projesini/teklifini
görüp siparişe çevir, bayi performansını izle. Bu olmadan "satışa hazır" değiliz.

**Sonra (talep gelirse) SaaS-hazır:** multi-tenant'ı *bugün kurmuyoruz* ama mimariyi tenant-scoped
yazıyoruz ki sonra açmak refactor değil, anahtar çevirmek olsun (bkz. `admin-standard.md §6.7`).

---

## 3. Bayi/Dealer Enterprise Modülü (en büyük boşluk — Avensair'in kalbi)

**Sade dille:** Bugün "bayi" diye bir şey yok; herkes düz kullanıcı. Enterprise bir distribütör paneli
şunları ZORUNLU ister:

1. **Bayi organizasyonu** (entity) — bir bayi = bir şirket; altında **birden çok kullanıcı** (satınalmacı,
   muhasebe). Bugünkü `user_projects.user_id` yerine `dealer_id`/org bağı.
2. **Bayi kademeleri (tier)** — Gümüş/Altın/Platin → farklı iskonto/fiyat listesi.
3. **Bayiye özel fiyat listesi** — mevcut `priceListId` tohumunu **admin'den yönetilebilir** yap: liste
   oluştur, ürünlere özel fiyat, bayiye/tier'a ata. (`getEffectiveUnitPrice` zaten okuyor.)
4. **Cari/kredi limiti** — bakiye, vade, limit aşımı uyarısı (B2B'nin olmazsa olmazı).
5. **Proje → Teklif → Sipariş hattı** — bayinin `user_projects` BOM'unu admin görür → teklif (PDF/onay) →
   siparişe çevir. Mevcut "teklif iste" tohumunu **yönetilen pipeline** yap.
6. **Bayi performans paneli** — ciro, sipariş sıklığı, ABC, hedef.
7. **Bayi onboarding** — başvuru → onay → fiyat listesi ata → davet.

Hepsi `admin-standard.md` kontratına uyar (Resource Index + Details + RBAC 3 katman + audit + tenant-scope).

---

## 4. Farklılaştırıcılar — "herkesin yaptığı" DEĞİL, bizi ayıran

> İlke: jenerik mağaza admin'i ürün+sipariş+müşteri yönetir. Bizim moat'ımız **kod değil domain** —
> 14 yıl HVAC + ESP IP + teknik otorite (bkz. `venthub-vision`). Admin bunu **ifade etmeli**.

| Herkes bunu yapar | **VentHub farkı (fayda için, hatır için değil)** |
|---|---|
| Ürün listesi | **Spec-driven HVAC katalog** — debi/basınç/ses/filtre-sınıfı/ESP yapısal veri → faceted filtre + seçim zekâsı. (Başta dediğin PDF→spec→Supabase altyapısı bunu besler.) |
| Genel müşteri | **B2B HVAC distribütör kokpiti** — bayi ağı enablement (§3), distribütör iş modeline birebir |
| Sepet→ödeme | **Proje/BOM → Teklif → Sipariş** — HVAC proje-bazlı satılır, impuls değil |
| Statik açıklama | **Authority içerik motoru** (var) + ileride **ESP/DW172 seçim motoru** (asıl IP — moat) |
| 2D foto | **3D prosedürel vitrin** (30+ model, var) |

**Stratejik net:** Avensair'i kazandıran farklılaştırıcılar = **§3 bayi modülü + spec-driven katalog +
teklif hattı**. Seçim motoru (ESP) bir sonraki dalga — kopyalanamaz moat ama Avensair DoD'si için şart değil.

---

## 5. Avensair-önce yol haritası (sıralı)

1. **Bayi modülü temeli** (§3.1–3.3): dealer org + tier + bayiye-özel fiyat listesi yönetimi. *(Avensair DoD çekirdeği)*
2. **Proje→Teklif→Sipariş hattı** (§3.5): mevcut `user_projects` tohumunu admin pipeline'a bağla.
3. **Cari/limit** (§3.4) + **bayi performans paneli** (§3.6).
4. **Spec-driven katalog** (§4): ürün spec'lerini yapısal veriye al → faceted filtre.
5. Mevcut admin'i `admin-standard.md` cetveline göre **standartlaştır** (ortak tablo kiti, RBAC/audit boşlukları).
6. Refund aksiyonu + CMS/merchandising (değerlendirmeye alındı, ikinci dalga).

> Her madde için `admin-standard.md §8` cetveli geçerli; her yeni sayfa o kontrata uyar.

## 6. SaaS-hazır (sonra — bugün kurma, hazırlığını yap)

- Tüm yeni tablo/sorgu **tenant-scoped** kolon taşısın (boş geçilebilir) → sonra doldurmak kolay.
- Bayi modülü zaten "organizasyon" kavramı getiriyor → multi-tenant'a doğal köprü.
- Avensair sözleşmesinde kapsamı dondur (scope creep panzehiri — `venthub-vision`).

---

*Kaynak: CodeGraph ile doğrulanmış mevcut durum (projects/price-list/invoice tohumları, dealer katmanı yok)
+ `admin-standard.md` yapısal standardı + `venthub-vision` moat. Strateji: `avensair-dealer-focus`.*
