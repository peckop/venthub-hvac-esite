# VentHub ERP Çalışma Alanı Tasarım Cetveli

> **SSOT.** İşletmenin bütün modüllerinin (teklif, sipariş, CRM, satın alma, stok, fatura…)
> içinde yaşadığı **tek çalışma alanı kabuğunun** yapısı, ekran dilbilgisi ve görünürlük modeli.
> **Kapsam:** ERP çalışma alanı kabuğu + içindeki modül ekranları.
> **Kardeş cetveller:** `admin-design-standard.md` — görsel dil, overlay taksonomisi, scroll/zoom
> mekaniği. **Bu cetvel onu değiştirmez, üstüne biner:** oradaki her kural burada da geçerlidir;
> burada yalnızca *"ekranlar hangi desende kurulur ve kime görünür"* tanımlanır.
> `storefront-design-standard.md` — kapsamı *"`src/` eksi admin"*, yani burayı kapsamaz.
>
> v0 · 2026-08-20 · İş: **T133-VH** · Şerit: ADMIN-CUSTOMER
> **v0 demek:** yapı ve sözlük sabitlenmiştir, ölçüm sayıları henüz yoktur — bu cetvelin
> ratchet baseline'ı ilk uygulama (teklif kompozörü, T131) inince yazılacak.

---

## 1. KAYNAK / CETVEL

Yeni filo kuralı (#695, `CLAUDE.md` Mutlak Kural 1 genişletmesi): her iş emri ve her cetvel,
kendisini yöneten kaynakları **adıyla** taşır.

### 1.1 İç kaynaklar (emsal ve bağlayıcı)

| Kaynak | Ne için | Tazelik |
|---|---|---|
| `docs/standards/admin-design-standard.md` v1.2 | Görsel dil, yoğunluk, overlay taksonomisi, katman ölçeği, scroll/zoom | 2026-08-17 |
| `src/design-system/tokens.js` | `zIndex`, `maxWidth`, `borderRadius.admin-*`, `boxShadow` — SSOT | canlı |
| `docs/standards/storefront-design-standard.md` | Kardeş kapsam sınırı (admin hariç) | canlı |
| `src/config/admin-resources.ts` | Bugünkü kaynak registry'si (nav + komut paleti + breadcrumb) | canlı |

### 1.2 Dış araştırma (bağlayıcı şart — Recep kararı 08-20)

Üç bağımsız tarama yapıldı; **her iddia kaynak-adreslidir, bulunamayanlar "ölçülemedi" olarak
işaretlidir.** Ham raporlar: `t133-odoo.md`, `t133-frappe.md`, `t133-ticari.md`.

| Sistem | Yöntem | Referans |
|---|---|---|
| **Odoo** | Kod okundu | `odoo/odoo` @ `19.0` |
| **Frappe / ERPNext** | Kod okundu | `frappe/frappe`, `frappe/erpnext` @ `develop` |
| **SAP Fiori · Power Apps · Salesforce** | Resmî dokümantasyon | URL'ler ham raporda; SAP sayfalarının çoğu 403 verdi, o kısımlar işaretli |

---

## 2. TEMEL KARAR — TEK KABUK, ÇOK MODÜL

**Kural 2.1 — Tek çalışma alanı.** İşletme modülleri ayrı ayrı uygulamalar değildir. Hepsi
**tek bir kabuğun** içinde yaşar: aynı navigasyon, aynı breadcrumb, aynı komut paleti, aynı
bildirim yüzeyi, aynı tema kapsamı.

Bu karar dışarıdan doğrulandı:

- **Odoo:** `WebClient` bir kez mount edilir; ekran değişimi `ActionContainer`'ın
  `ACTION_MANAGER:UPDATE` olayıyla bileşen takasıdır — tam sayfa yenilemesi yoktur
  (`addons/web/static/src/webclient/webclient.js`, `.../actions/action_container.js`).
- **Frappe:** Desk tek SPA; `Container.change_to()` DOM düğümlerini gizleyip gösterir, reload yok
  (`frappe/public/js/frappe/views/container.js`, `.../router.js`).

**Kural 2.2 — Ama biz onların mekanizmasını kopyalamıyoruz, ve bu bilinçlidir.**
Odoo ve Frappe istemci-tarafı SPA'dir; ekran takası bir JS bus olayıdır. Bizde kabuk bir
**paylaşılan Next.js layout**'udur ve ekranlar RSC rota parçalarıdır. Yani "tek kabuk" bizde
*"tek `layout.tsx` bütün krom'a sahiptir"* demektir, *"tek JS uygulaması ekran takas eder"*
demek değildir.

**Bu ayrımı yazmamın sebebi var:** SPA action-manager desenini taklit etmek, RSC sınırını
istemciye kaydırır ve `CLAUDE.md` Mutlak Kural 4'ü (RSC öncelikli, `ssr: false` yasak) çiğner.
Dış kaynak *neyi çözdüğünü* gösterir, *nasıl kodlayacağımızı* değil.

**Kural 2.3 — Krom tek yerdedir.** Modül ekranı kendi navigasyonunu, kendi breadcrumb'ını,
kendi toast'ını, kendi tema sarmalayıcısını **kurmaz**. Bunlar kabuğun malıdır. Modül yalnız
kendi içeriğini verir. (Emsal kusur: `admin-design-standard.md` D1 — üç kat iç içe tam-ekran
kabuk; D11 — `<Toaster/>` mount edilmediği için 127 `toast.*` çağrısı ölüydü.)

---

## 3. BEŞ KANONİK EKRAN DESENİ

Yeni bir modül ekranı **bu beşten biridir**. Altıncı bir desen icat etmek serbest değildir;
gerekiyorsa önce bu cetvel değişir.

Desenler üç sistemin kesişiminden çıkarıldı — farklı isimler aynı şeyi anlatıyordu, eşleştirildi:

| # | VentHub deseni | Fiori | Salesforce | Power Apps / Odoo |
|---|---|---|---|---|
| **E1** | **Kayıt Defteri** | List Report | List View | View / list |
| **E2** | **Kayıt Detayı** | Object Page | Record Page | Form / form |
| **E3** | **Çalışma Kuyruğu** | Worklist | *(eşleniği bulunamadı)* | *(ölçülemedi)* |
| **E4** | **Pano** | Overview Page | App/Home Page | Dashboard |
| **E5** | **Kompozör** | *(yok)* | *(en yakını: console workspace)* | *(yok)* |

### E1 — Kayıt Defteri
Bir varlığın filtrelenebilir listesi. **Zorunlu parçalar:** filtre çubuğu, kaydedilmiş görünüm,
sütun yönetimi, satır seçimine bağlı toplu işlem, sayfalama.

*Kaydedilmiş görünüm üç sistemde de var* — Fiori'de "variant management", Salesforce'ta List
View'ın kendisi zaten adlandırılmış bir filtre setidir. Bizde de **birinci sınıf kavram olacak**:
kullanıcı filtresini adlandırıp kaydedebilmeli. Bugün yok (§8/Ç4).

Toplu işlem konumu: **tablo araç çubuğunda**, hiçbir satır seçili değilken **disabled**.

### E2 — Kayıt Detayı
Tek bir iş nesnesi. **Yapı:** üstte kimlik başlığı (ad, durum rozeti, anahtar alanlar) → bölümler
(sections) → altta **kalıcı eylem çubuğu**.

**Sonlandırıcı eylemler ALTTA.** Fiori bunu açıkça böyle kuruyor: footer toolbar "closing or
finalizing actions that impact the whole page" içindir (Save, Post, Approve, Reject); üst başlık
**bilgi** alanıdır, eylem barı değildir. Biz de bu ayrımı alıyoruz — üstte kimlik, altta karar.

### E3 — Çalışma Kuyruğu
İşlenecek maddeler. Kayıt Defteri'nden farkı **amaçtır**: defter *filtreleyerek liste kurmak*
içindir, kuyruk *listedeki neredeyse her maddeyi işlemek* içindir. Fiori bu ayrımı adıyla yapıyor
ve Worklist'i **filtre çubuğu olmayan** sadeleştirilmiş bir List Report olarak kuruyor.

Bizdeki ilk uygulaması: **teklif onay kuyruğu** (LLM/temsilci taslakları insan onayına düşer).

### E4 — Pano
Bir rol veya iş alanı için giriş noktası; kartlardan oluşur ve iş süreçlerine kapı açar.
**Pano bir rapor ekranı değildir** — her kartın bir eylemi ya da bir hedefi olmalıdır.

### E5 — Kompozör *(VentHub'a özgü)*
Karmaşık bir belgeyi (teklif, sipariş, fatura) **bağlamı kaybetmeden** kurmak için.

**Bu deseni dış kaynakta bulamadım ve bunu adıyla yazıyorum.** Fiori'de karşılığı yok; Power
Apps'te yok; en yakın akraba Salesforce'un console workspace/subtab mekanizması ve o da farklı
bir sorunu (çok kayıtlı çalışma) çözüyor. Yani E5 **ödünç değil, bizim tasarımımız** — ve ödünç
olmadığı için ilk uygulamasında (T131) dikkatle ölçülmeli.

**Yerleşim (T131 teklif kompozörü, Recep kararı):**

```
┌──────────────────────────────────────────────────────────────┐
│  DURUM ŞERİDİ · revizyon no · sahip · son değişiklik         │
├────────────┬─────────────────────────────┬───────────────────┤
│ SOL        │ ORTA                        │ SAĞ               │
│ bağlam     │ kalem tablosu               │ canlı önizleme    │
│ müşteri    │ katalog arama +             │ (PDF)             │
│ proje/saha │ katalog-dışı hızlı kayıt    │                   │
│ geçmiş     │                             │                   │
├────────────┴─────────────────────────────┴───────────────────┤
│  EYLEM ÇUBUĞU (altta)  · Taslak kaydet · Onaya gönder        │
└──────────────────────────────────────────────────────────────┘
```

**Kompozör kuralları:**
- Üç sütun da **aynı kaydın** görünümüdür; sağ önizleme ayrı bir "rapor" değil, ortadaki verinin
  canlı çıktısıdır.
- Sol sütun **salt bağlam**: okunur, düzenlenmez. Düzenleme kendi ekranında yapılır.
- Dar ekranda üç sütun **yığılır**, gizlenmez. Önizleme sekmeye düşebilir; bağlam düşemez.
- Eylem çubuğu E2 ile aynı kuraldadır: sonlandırıcı eylemler altta.

---

## 4. GÖRÜNÜRLÜK — PAKET İLE ROL AYRI ŞEYLERDİR

Bu bölüm bu cetvelin en önemli kuralıdır, çünkü ikisini karıştırmak çok kiracılı bir üründe
**veri sızıntısı ya da yanlış faturalama** üretir.

**Kural 4.1 — İki ayrı soru, iki ayrı mekanizma.**

| Soru | Kavram | Kaynak |
|---|---|---|
| Bu modül bu **kiracıda** var mı? | **PAKET** | kiracı yapılandırması |
| Bu kullanıcı bu modülde ne **yapabilir**? | **ROL** | `app_metadata` (Mutlak Kural 12) |

Üç sistem de bu ayrımı yapıyor ve **hiçbiri tek mekanizmaya indirmiyor**:

- **Odoo:** kurulu olmayan modülün menü kaydı **veritabanında yoktur** (`ir_module.py`
  `module_uninstall()` → `_module_data_uninstall`); yetkisiz modülünki **vardır ama sorguda
  filtrelenir** (`ir_ui_menu.py` `_visible_menu_ids()`). Aynı belirti, iki mekanizma.
- **Frappe:** devre dışı modül `get_disabled_modules()` ile **Workspace Manager'a bile** gizlenir;
  yetki ayrı katmandır (`Workspace.is_permitted()`).
- **Salesforce:** **License** üst sınırı, **Profile/Permission Set** o sınır içindeki fiili yetkiyi
  belirler — açıkça ayrı kavramlar.

**Kural 4.2 — Paket dışı modül gizlenmez, YOKTUR.** Menüden saklamak yetmez; rotası, verisi ve
API ucu da kapalı olmalıdır. Gizlemek bir sunum kararıdır, kapatmak bir güvenlik kararıdır.

**Kural 4.3 — Görünürlük kararı SUNUCUDA verilir.** Kabuk, kullanıcının göreceği modül listesini
sunucuda hesaplar ve **hazır** gönderir. İstemciye tam liste gönderip orada filtrelemek yasaktır.

Odoo bunu iki kez yapıyor: menü ağacı `/web/webclient/load_menus`'tan **zaten filtrelenmiş** gelir,
ve yetkisiz alanlar view XML'inden **fiziksel olarak silinir** (`ir_ui_view.py`
`_postprocess_access_rights()`) — CSS ile gizleme değil. Frappe'de karar tamamen Python'dadır;
istemci `frappe.boot`'tan geleni filtresiz render eder.

> **Bugün bizde böyle DEĞİL.** Ölçüm ve geri alma planı §8/Ç1'de.

**Kural 4.4 — UI izni ⊆ DB izni.** `admin-design-standard.md` §6.1 zaten bunu zorunlu kılıyor;
burada tekrarlanır çünkü yeni modüller bu cetvele bakarak açılacak.

---

## 5. DURUM, KİMLİK VE GEZİNME

**Kural 5.1 — Durum şeridi.** Bir iş belgesinin durumu (taslak → onayda → onaylı → …) ekranın
**üstünde**, kimlik başlığının parçası olarak durur. Power Apps süreç çubuğunu (BPF) forma göre
üstte konumlandırıyor; biz de kimliği üstte, kararı altta tutuyoruz.

**Kural 5.2 — Revizyon görünür.** Revizyonlanabilir belgelerde (teklif) revizyon numarası durum
şeridinde okunur. Hangi revizyona bakıldığı hiçbir zaman örtük olmaz.

**Kural 5.3 — Breadcrumb kabuğundur.** Modül kendi breadcrumb'ını çizmez (§2.3).

**Kural 5.4 — Çok bağlamlı çalışma v0'da YOK.** Salesforce'un workspace tab / subtab mekanizması
bu sorunu en açık çözen tasarım ve API düzeyinde dokümante (`lightning:workspaceAPI`); Fiori ve
Power Apps'te eşdeğeri **bulunamadı (ölçülemedi)**. Bizde v0'da sekme yığını **kurulmayacak**:
kompozör (E5) bağlamı tek ekranda tuttuğu için ihtiyaç henüz kanıtlanmadı. Kanıt çıkarsa —
kullanıcı iki teklifi yan yana karşılaştırmak zorunda kalırsa — bu madde yeniden açılır.

---

## 6. TEMA, KATMAN, YOĞUNLUK

Bu başlıklar **`admin-design-standard.md`'ye devredilmiştir**, burada kopyalanmaz:

- Katman ölçeği → `tokens.js` `zIndex` (`sticky` 90 · `modal` 100 · `popover` 110 · `toast` 9999)
- Köşe yarıçapı → `borderRadius.admin-sm|md|lg`
- Yoğunluk, tipografi rolleri, yüzey/gölge → §3
- Overlay taksonomisi (modal · panel · popover) → §4
- **Portal tema kapsamı** → §4.11 — portal'a çıkan yüzeyler tema kapsamının dışında kalır;
  kompozörün sağ önizlemesi ve katalog arama açılırları bu tuzağın tam ortasındadır.

**Tek ek kural (6.1):** kompozörün üç sütunu `maxWidth.page` (1600px) içinde kalır; sütun
genişlikleri ham `w-[..]` ile değil token'la verilir (Mutlak Kural 8).

---

## 7. YENİ MODÜL AÇARKEN — ZORUNLU ADIMLAR

1. Modülün ekranlarını **§3'teki beş desenden** birine oturt. Oturmuyorsa cetveli değiştir.
2. **Paket** kaydını yaz (kiracı bu modülü aldı mı) — **rolden ayrı**.
3. `src/config/admin-resources.ts`'e kaydını ekle; `labelKey` **iki sözlükte de** var olmalı,
   `route` **gerçekten** var olmalı (§8/Ç3'teki boşluk kapanana kadar bu insan disiplinidir).
4. UI izni ⊆ DB izni ölçümünü yap (`admin-design-standard.md` §6.1).
5. Ekranın **kullanıldığını** kanıtla — render olduğunu değil. (K13: varlık ≠ kullanım.)

---

## 8. ÇELİŞEN-MEVCUT *(zorunlu bölüm — Recep kararı 08-20)*

Bu cetvelin kurallarıyla **çelişen canlı davranışlar**, ölçümüyle ve geri alma planıyla.

### Ç1 — Menü görünürlüğü İSTEMCİDE karar veriliyor · **Kural 4.3 ile çelişir**

**Ölçüm:** `src/components/admin/shell/AdminSidebar.tsx:1` → `'use client'`; satır 63 →
`r.inNav && r.group === group.key && canAccess(r.requiredAccess)`. `ADMIN_RESOURCES` statik
modül olarak import edildiği için **modül listesinin tamamı role bakılmaksızın tarayıcıya iner**;
istemci sadece görüntülemez.

**Ağırlık:** bugün *güvenlik açığı değil* — asıl kapı RLS/DB tarafındadır ve `admin-design-standard.md`
§6.1 bunu zorunlu ölçüm yapmıştır. Ama **paket** kavramı geldiğinde ağırlaşır: "bu kiracı hangi
modülleri satın aldı" bilgisi ticari bilgidir ve her tarayıcıya inmemelidir.

**Geri alma planı:** modül listesi RSC'de hesaplanıp kabuğa prop olarak geçilir; `AdminSidebar`
filtrelemeyi bırakır, verileni çizer. Migration gerekmez. Paket modeli inmeden önce yapılmalı.

### Ç2 — Paket kavramının VERİ MODELİ YOK · **Kural 4.1 ile çelişir**

**Ölçüm:** `src/utils/tenantServer.ts:8-26` → `TenantConfig.features` yalnız üç bayrak taşıyor
(`viewer3d`, `engineeringCalculators`, `pdfExports`) artı serbest `[key: string]: unknown`.
**Modül/paket kaydı yok.** Yani "bu kiracıda CRM var mı" sorusunun bugün cevaplanacağı bir yer
yok; `features` serbest sözlüğüne sıkıştırmak da paket ile bayrağı karıştırır.

**Geri alma planı:** paket, `features` içine gömülmez; ayrı ve adı konmuş bir kavram olarak
tasarlanır. **Migration gerektirir → Recep kapısı.** Bu cetvel v0'da yalnız kuralı koyar,
şemayı önermez — şema T130 (CRM) ve T131 (teklif) veri modelleriyle birlikte kararlaştırılmalı.

### Ç3 — Kaynak registry'sini koruyan KAPI YOK · **§7 adım 3 ile çelişir**

**Ölçüm:** `ADMIN_RESOURCES`'i tüketen yalnız `AdminSidebar.tsx` ve `CommandPalette.tsx`;
`src/__tests__/` altında tüketen **hiçbir dosya yok**. `labelKey`'in sözlükte bulunduğunu ya da
`route`'un gerçek olduğunu ölçen bir test yok.

**Sonuç:** menüye sözlükte karşılığı olmayan bir anahtar konursa ekranda **ham anahtar dizesi**
çizilir ve hiçbir kapı görmez. Bu sınıf 08-19'da T108'de bir kez ödendi (sipariş durum etiketleri
ham DB dizesi basıyordu).

**KAPATILDI — bu cetvelle AYNI PR'da:** `INV-ERP-RESOURCE-1`
(`src/__tests__/conformance/admin-erp-resource-registry.test.ts`). Cetvel ile onu zorlayan test
**tek kontroldür**; ayrı PR'a bölmek cetveli dişsiz bırakırdı.

Kapı üç şey ölçer: (1) her `labelKey` **hem tr hem en** sözlüğünde çözülüyor mu — gerçek çözücü
`getDictValue` ile, ham anahtar dönerse KIRMIZI; (2) her `route` `src/app/admin/**` altında
gerçek bir `page.tsx`'e karşılık geliyor mu; (3) registry ya da rota listesi boşsa KIRMIZI
(sessiz-boş sınıfı — boş liste üzerinde ilk iki test geçerdi).

⚠ **İlk yazımdaki bir netlik hatası düzeltildi:** anahtarların hepsi `admin/menu.{tr,en}.ts`'te
yaşamıyor — ör. `quotes.admin.navLabel` başka bir sözlük ağacından geliyor. Kapı bu yüzden **tam
tr/en sözlüğüne** karşı çözüm yapar, tek bir dosyaya değil.

**Kanıt:** iki kasıtlı sabotaj da KIRMIZI verdi (`labelKey` → var olmayan anahtar;
`route` → `/admin/hayali-rota`). **Şu an yeşil:** 33 kaydın 33'ü, 24 benzersiz rotanın 24'ü.
Kapı bir kusuru değil, bir **seviyeyi** kilitliyor.

**Geri alma planı:** test dosyasını sil — hiçbir üretim kodu ona bağlı değil.

### Ç4 — Kaydedilmiş görünüm kavramı YOK · **E1 ile çelişir**

**Ölçüm:** admin tablolarında filtre durumu URL/bileşen state'inde yaşıyor; adlandırılıp
kaydedilen bir görünüm nesnesi yok. Üç dış sistemin üçünde de var.

**Geri alma planı:** yokluk, yanlışlık değil — E1 bunu **hedef** olarak koyar, borç olarak
işaretlenir. Kapatılması ayrı iş emri ister.

### Ç5 — Müşterinin kabulü KANITSIZ · *(çelişen davranış değil, eksik kanıt)*

**Bu maddeyi AUTH düzeltti ve düzeltme haklı; ilk yazdığım hâli yanlıştı.**

Yanlış yazmıştım: *"müşterinin siteden kendi teklifini kabul edebilmesi yeni modelle çelişiyor."*
**Çelişmiyor.** Recep'in 08-20 kabul-mekanizması kararı site tıklamasını **birincil dijital kanal**
olarak açıkça koruyor: kabul **tek kavramdır**, üç kanalı vardır — site · e-posta beyanı · telefon.

Çelişen şey kabulün **kendisi** değil, kabulün **kanıtsız** olması: bugün yalnız `status` yazılıyor;
damga, IP, kanal, beyan sürümü ve revizyon bağı **hiçbiri tutulmuyor**. Yani "kim, ne zaman, hangi
kanaldan, hangi revizyonu kabul etti" sorusunun canlıda cevabı yok.

**Yön:** mevcut politika geri alınmaz, **sertleştirilir** (AUTH'un quote cetveli §7.2, beş şart).
**Migration'lı → Recep kapısı.** *(Kalem AUTH/T131 kapsamındadır; envanter tam olsun diye burada.)*

**Bu düzeltmenin dersi bu cetvele de yazılıyor:** bir davranışı "çelişiyor" diye işaretlemeden önce
onu **yürüten kararı** okumak gerekir. Ben ekranı ölçüp kararı okumadan hüküm kurdum.

---

## 9. BU CETVELİN ÖLÇMEDİĞİ *(adıyla)*

- **Ratchet baseline yok.** v0 yapı koyar, sayı koymaz. İlk uygulama inince ölçülecek.
- **Performans bütçesi yok.** Kompozörün canlı önizlemesi her tuş vuruşunda PDF üretmemeli,
  ama eşiği burada sayıyla vermiyorum — ölçmeden sayı yazmak uydurmaktır.
- **Mobil sözleşme eksik.** Kompozörün dar ekran davranışı §3/E5'te ilkeyle verildi, kırılma
  noktalarıyla değil.
- **Dış araştırmanın kör noktaları:** Fiori Launchpad'in rol/space görünürlük modeli ve Power
  Apps'in çok-kayıtlı çalışma mekanizması **ölçülemedi** (SAP sayfaları 403 verdi, ham raporda
  liste hâlinde).

---

## 10. PROVENANCE

- **v0 · 2026-08-20 · T133-VH** — ilk sürüm. Üç dış tarama (Odoo kodu, Frappe kodu, ticari
  dokümantasyon) + iç emsal (`admin-design-standard.md` v1.2).
- Karar sahibi: Recep. Kabuk kararı ve kompozör yerleşimi Recep talimatıdır; bu belge onu
  dilbilgisine çevirir.
- İlk uygulaması: **T131** (teklif kompozörü, AUTH şeridi).
