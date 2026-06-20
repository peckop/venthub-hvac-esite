# VentHub Admin — Yetenek Kapsamı, Bayi/Enterprise Modülü & Farklılaştırıcılar

> **Bu dosya nedir?** `admin-standard.md` "NASIL kurulur"u anlatır; bu dosya **"NE olmalı"yı** anlatır:
> hangi yetenekler bulunmalı, neyimiz eksik, **bizi ayıran ne**, ve **önce Avensair** için yol haritası.
> İkisi birlikte = VentHub admin'inin tam standardı.
>
> **Çapa kararlar:** Avensair-önce (tek-kiracı, bayi-ağı) → sonra SaaS-hazır. Farklılaşma = domain moat.
> Strateji memory: `avensair-dealer-focus`, `standard-first-strategy`, `venthub-vision`.
>
> ⛔ **SIRALAMA GÜNCELLENDİ (2026-06-17 · SSOT = `docs/DURUM-TAKIP.md`):** Yürütme önceliği artık
> **admin-önce, bayi-son** (enterprise admin shell → yeni admin özellikleri → müşteri-hesap standardı →
> **bayi R1–B2 EN SON**). Bu, `dealer-pivot-decision`'ı tersine çevirir. Bu dosyadaki "önce Avensair / §5
> Avensair-önce yol haritası" **yürütme sırası olarak HÜKÜMSÜZDÜR**; içerik *ne-olmalı yetenek envanteri*
> olarak geçerli kalır.

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

## 4.5 Enterprise admin-platform yetenekleri — dünya standardı, bizde yok/embriyon

> **Kaynak/karar:** Shopify · Stripe · Linear · Vercel · Retool · Medusa · Saleor enterprise admin desenleri
> → NLM ikiz **kapsam-açığı denetimi** → **CodeGraph mevcut-durum doğrulaması** (2026-06-17). Bu bölüm,
> `admin-feature-recommendations-2026-06-17.md`'nin net-new kısmını **tek SSOT** olarak buraya taşır (o dosya
> silindi — mükerrerdi).
> **SINIR:** Bunlar platformu enterprise yapan **ikinci kat** — Avensair DoD P0'ı DEĞİL (o = §3 bayi A1-A4).
> Sıralama: bayi P0 → bunlar. Scope creep panzehiri.

### Grup 1 — HİÇ YOK (CodeGraph-doğrulandı)

| # | Yetenek | Mevcut durum (kanıt) | Neden değerli | Boyut |
|---|---|---|---|---|
| **N1** | Özel rol + granüler izin-matrisi editörü | Roller `src/lib/rbac.ts` kod-sabiti (`ROLE_WRITE_ACCESS`, `ADMIN_ROLES`) — UI/şema yok | Avensair "bu temsilci sadece şunu görsün" diyemez | L |
| **N2** | Uygulama-içi çeviri/lokalizasyon yönetimi | Sadece statik `i18n/dictionaries/admin/{tr,en}.ts` — admin editörü yok | Yeni dil/metin için deploy gerekiyor; i18n'i operasyona açar | M |
| **N3** | Rapor oluşturucu + kayıtlı/zamanlanmış raporlar | Statik dashboard + CSV export var; kullanıcı-tanımlı şablon/zamanlama yok | "Her Pazartesi şu raporu e-postala" = enterprise standart | L |
| **N4** | API anahtarı / PAT yönetimi | Sadece edge-fn iç `apiKey` config; admin yüzeyi/tablosu yok | Entegrasyon + SaaS için şart; üret/iptal/scope + audit | M |

### Grup 2 — EMBRİYON (kodda tohum var → dünya-standardına çıkar; en yüksek kaldıraç)

| # | Yetenek | Mevcut (doğrulandı) | Dünya-standardına ne lazım | Boyut |
|---|---|---|---|---|
| **E1** | Komut paleti (⌘K) + global federe arama | `components/admin/CommandPalette.tsx` (nav+ürün) | Tüm kaynaklarda (sipariş/iade/bayi/SKU) typeahead + aksiyon | M |
| **E2** | Aksiyon-alınabilir bildirim inbox'ı | `AdminRealtimeNotifications` (toast) | Atanabilir/okundu/çözüldü merkezi inbox | M |
| **E3** | Onay / maker-checker iş akışı motoru | sadece deal-reg planı | Eşik-üstü iade/iskonto/cari → çok-seviyeli onay (jenerik) | L |
| **E4** | Kayıt-başı aktivite zaman-tüneli | global `admin_audit_log` | "Bu siparişe ne oldu" birleşik kronoloji (diff+not+durum) | M |
| **E5** | Medya/varlık kütüphanesi (DAM) | storage bucket'lar | Merkezi ara/etiketle/yeniden-kullan görsel yönetimi | M |
| **E6** | Toplu grid editörü | `EditableCell` (tek hücre) | Excel-vari çoklu-satır toplu düzenle/yapıştır | M |
| **E7** | Impersonation / "şu rol/müşteri gözüyle gör" | bayi masquerade (planlı) | Support için genel impersonation modu | M |
| **E8** | Klavye-nav sistemi + kısayollar | ⌘K, `/`, Esc | `g+o`/`g+p` power-user navigasyon haritası | S |
| **E9** | Kayıt-içi dahili not + @bahsetme | sipariş notu | @mention + kayıt-içi işbirliği katmanı | M |
| **E10** | CSV içe-aktarma sihirbazı | `ProductCsvImport` (katı şablon) | Kolon→şema drag-drop eşleme + önizleme | M |

> **Enterprise admin shell (UI/menü modernizasyonu):** **E1 + E2 + E8 + modern sol-nav** = Linear/Vercel/Stripe
> hissi. "Menü sistemini yenilikçi bulmuyorum" derdinin doğrudan karşılığı. Görsel yön = **VENTHUB DESIGN SYSTEM**
> defteri (`a1ca5476-c6c6-42aa-b5b8-3eb565b3f100`). Build edilince her birinin **yapısal kontratı `admin-standard.md`'ye** eklenir (NASIL).

> **Ayrıca bekleyen veri-doğruluk borcu:** AdminDashboardPage `SalesChart` hâlâ **dummy** veri besliyor
> (`src/views/admin/AdminDashboardPage.tsx:60-67`, "to pass build" yorumu) + rota `ssr:false` (kural 4) →
> gerçek `venthub_orders` zaman-serisine bağla.

---

## 5. Avensair-önce yol haritası (sıralı) — ⛔ YÜRÜTME SIRASI HÜKÜMSÜZ (2026-06-17)

> ⛔ **SUPERSEDED (yürütme sırası):** Güncel öncelik **admin-önce, bayi-son** (`docs/DURUM-TAKIP.md`).
> Aşağıdaki numaralı "bayi-önce" sıra **artık geçerli değil** — madde **içerikleri** referans kalır, **sırası** değil.
>
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
