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

**Sade dille:** Bugün "bayi" diye bir şey yok; herkes düz kullanıcı. Bunu enterprise distribütör paneline
taşımak Avensair'in kalbi.

> **Otorite bu dosya DEĞİL** (eski hâli varsayımsaldı). Bayi modülünün:
> - **NE'si** (domain: bayi≠kullanıcı, roller, fiyat, CPQ, deal-registration) → **`dealer-network-standard.md`**
> - **NASIL'ı** (R0→B2 sırası, ORG-TIER fiyat kararı, gerçek DB zemini) → **`dealer-module-blueprint.md`**
>
> Burada tekrar etmiyoruz (drift önlemi). Tüm bayi sayfaları yine `admin-standard.md` kontratına uyar
> (Resource Index + Details + RBAC 3 katman + audit + tenant-scope).

---

## 4. Farklılaştırıcılar — "herkesin yaptığı" DEĞİL, bizi ayıran

> İlke: moat = **kod değil domain** (14 yıl HVAC + ESP IP + teknik otorite). Admin bunu **ifade etmeli**.

> **Tek ev:** Farklılaştırıcı/moat sentezi → **`../VISION.md`** (vizyon/moat) + B2B yansıması
> **`dealer-network-standard.md §13`**. Burada listeyi tekrar tutmuyoruz (drift önlemi).

**Stratejik net (bu dosyanın katkısı):** Avensair'i kazandıran çekirdek = **§3 bayi modülü + spec-driven
katalog + teklif hattı**. ESP/DW172 seçim motoru bir sonraki dalga — kopyalanamaz moat ama Avensair
DoD'si için şart değil.

---

## 5. Avensair-önce yol haritası (sıralı)

> ⚠️ **Bayi modülü sıralaması `dealer-module-blueprint.md §3`'e tabidir:** B1-B2 (panel/seed) ÖNCESİ
> R0–R5 ONARIM şarttır. Aşağıdaki "bayi modülü" maddesi, blueprint'in onarım-sonra-inşa sırasına göre
> okunmalı — kırık altyapı üstüne inşa olarak değil.

1. **Bayi modülü** → `dealer-module-blueprint.md` R0–B2 (onarım → panel → seed). *(Avensair DoD çekirdeği)*
2. **Spec-driven katalog** (§4): ürün spec'lerini yapısal veriye al → faceted filtre.
3. Mevcut admin'i `admin-standard.md` cetveline göre **standartlaştır** (ortak tablo kiti, RBAC/audit boşlukları).
4. Refund aksiyonu + CMS/merchandising (ikinci dalga).

> Her yeni sayfa `admin-standard.md §8` cetveline uyar.

## 6. SaaS-hazır (sonra — bugün kurma, hazırlığını yap)

- Tüm yeni tablo/sorgu **tenant-scoped** kolon taşısın (boş geçilebilir) → sonra doldurmak kolay.
- Bayi modülü zaten "organizasyon" kavramı getiriyor → multi-tenant'a doğal köprü.
- Avensair sözleşmesinde kapsamı dondur (scope creep panzehiri — `venthub-vision`).

---

*Kaynak: CodeGraph ile doğrulanmış mevcut durum (projects/price-list/invoice tohumları, dealer katmanı yok)
+ `admin-standard.md` yapısal standardı + `venthub-vision` moat. Strateji: `avensair-dealer-focus`.*
