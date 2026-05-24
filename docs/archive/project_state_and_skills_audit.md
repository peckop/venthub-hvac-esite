# 🛰️ VENTHUB SİSTEM RAPORU & OTONOM YETENEK (SKILLS) DENETİMİ

Bu rapor, VentHub HVAC E-Ticaret sisteminin mevcut durumunu, dokümantasyon (MD) ağacını ve `.agent/skills/` altında yer alan 21 otonom yeteneği (skills) incelemektedir. 

Kullanıcımız Recep Bey'in (Mimar) teknik kararları en doğru şekilde verebilmesi için, rapordaki tüm yazılımsal süreçler **HVAC (Isıtma, Havalandırma ve İklimlendirme) Sistemleri** ve **Fabrika Otomasyon Analogileri** ile "simultane çeviri" yapılarak açıklanmıştır.

---

## 🦾 ANALOJİ REHBERİ (Translator Modu)
* **Supabase / Database (Veritabanı):** Binanın ana su/akışkan tankı ve boru hattı (Su basıncı = veri bütünlüğü).
* **Next.js 15 / React 19 (Frontend):** Binanın odalarındaki termostatlar ve sıcaklık kontrol panelleri (Kullanıcı arayüzleri).
* **Supabase RLS Güvenliği:** Boru hatlarındaki **Tek Yönlü Çekvalfler (Bypass Valfleri)**. Her dairenin suyu sadece kendi borularından akar, başkasının dairesine sızamaz.
* **Registry Sistemi / PULSE:** Fabrikanın **Master PLC (Programlanabilir Mantıksal Denetleyici) Ekranı**. Hangi hattın (görevin) ne durumda olduğunu gösteren ana kumanda odası.
* **Otonom Yetenekler (Skills):** Fabrikadaki uzman bakım personelleri ve kalibrasyon aletleri (Örn: Basınç ölçer, sızıntı dedektörü).

---

## 1. 🌡️ PROJENİN GENEL DURUMU & FEDERASYON SAĞLIĞI

Sistem genelinde yaptığımız **Master Kontrol (cc health)** taraması sonucunda VentHub ve bağlı olduğu 8 kardeş projenin (Orion Cortex, QValidator, 3D Model Factory vb.) otonom hafıza federasyonu **%100 SAĞLIKLI** ve kusursuz senkronizasyonda çalışmaktadır.

```
┌─ [VENTHUB] (HVAC E-Ticaret Ağı)
│  Sağlık : ██████████ 100/100  🟢 SAĞLIKLI
│  Nodes  : 98 toplam  | 91 aktif  | 7 arşiv
│  Graf   : 1152 otonom ilişki | 12 doğrulanmış düğüm
│  Yazım  : Toplam 2240 kayıt | Son: 2026-05-11
└────────────────────────────────────────────────────
```

### 💨 Sistem Basınç Analizi
Mevcut durumda projenin **Next.js 15 ve React 19** entegrasyonu tamamlanmıştır. Sistem, statik olarak üretilen sayfalar ile dinamik veri çeken bileşenler arasındaki geçişi kusursuz yöneten bir **Değişken Debili Havalandırma Sistemi (VAV)** gibi çalışmaktadır.
* **WhatsApp Entegrasyonu (wa.me):** Müşteri ile ürün stoğu arasında doğrudan bir **Hızlı Tahliye Valfi** görevi görmektedir.
* **Checkout & Sepet Güvenliği:** database.types.ts üzerinden %100 tip güvenliği ile mühürlenmiştir. Bu sayede sipariş tamamlama aşamasında veri sızıntısı (basınç kaybı) engellenmiştir.

---

## 2. 📚 DOKÜMANTASYON (MD DOSYALARI) AĞACI

Projedeki `.md` dosyaları, sistemin işletim kılavuzlarıdır. İki ana grupta incelenmiştir:

### A. Çekirdek Sistem Kılavuzları (Anayasa & Protokoller)
* **[GEMINI.md](file:///c:/Users/alize/venthub-hvac/GEMINI.md) (Proje Anayasası):** Her session başlangıcında çalıştırılması zorunlu olan **9 Adımlık Pre-Flight (Kalkış Öncesi) Kontrol Listesi**'ni içerir. Projenin ana işletim kanunudur.
* **[AGENTS.md](file:///c:/Users/alize/venthub-hvac/AGENTS.md) (Ajan Sınırları):** AI ajanların (bizlerin) hareket alanını kısıtlayan **Kapsam Polisi (Scope Police)** kurallarını barındırır. Tek seferde 100 satırdan fazla kod yazılmasını veya izinsiz dosyalara dokunulmasını engelleyen otonom bir sigortadır (Circuit Breaker).
* **[CLAUDE.md](file:///c:/Users/alize/venthub-hvac/CLAUDE.md) (Geliştirici Rehberi):** Teknoloji yığınını (Next.js 15, Tailwind, Supabase Deno) ve en sık kullanılan komutları özetleyen kompakt bir saha el kitabıdır.
* **[registry/REGISTRY_PROTOCOL.md](file:///c:/Users/alize/venthub-hvac/registry/REGISTRY_PROTOCOL.md) (Görev Protokolü):** `brainstorm.json` ve `plan.json` gibi kalite kapılarının nasıl doğrulanacağını (`engine.py validate`) belirleyen kalibrasyon talimatıdır.

### B. Mimari ve Operasyonel Dökümanlar (`docs/`)
* **[ARCHITECTURE.md](file:///c:/Users/alize/venthub-hvac/docs/ARCHITECTURE.md):** VentHub'ın SSR-First (Sunucu Öncelikli) ve veri dönüşüm (Converter) mimarisini detaylandıran ana tesis planıdır.
* **[CHANGELOG.md](file:///c:/Users/alize/venthub-hvac/docs/CHANGELOG.md):** 2026-03-19 tarihine kadar yapılan tüm büyük güncellemelerin (Checkout güvenliği, index jeneratörü vb.) kayıt tutulduğu **Fabrika Bakım Defteri**'dir.
* **[SEO_I18N.md](file:///c:/Users/alize/venthub-hvac/docs/SEO_I18N.md):** Arama motoru optimizasyonu ve çift dilli (TR/EN) sözlük kullanım standartlarını tanımlayan kılavuzdur.

---

## 3. 🔍 OTONOM YETENEKLER (SKILLS) DENETİM RAPORU

Projenin otonom sinir sisteminde (`.agent/skills/` klasörü) **21 adet yetenek** tanımlıdır. Bu yetenekleri fabrikadaki araçlara ve ustalara benzeterek analiz ettik. Alakasız, mükerrer (gereksiz tekrar eden) veya sadeleştirilmesi gereken elemanları belirledik:

### 🌟 KATEGORİ 1: Çekirdek İş Akışı Yetenekleri (Core Lifecycle)
> ** HVAC Karşılığı:** Ana Kontrol Ünitesi ve Otomasyon Döngüleri (Sıcaklık ayarla -> Basınç ölç -> Vana aç).
* **`superpowers-workflow`:** Brainstorm'dan kapanışa kadar giden ana otonom çarktır.
* **`superpowers-brainstorm` / `superpowers-plan` / `superpowers-review` / `superpowers-finish`:** Sürecin her adımında kalite kontrolü yapan uzman mühendislerdir.
* **`model-dispatcher`:** Görevin zorluğuna göre akıllıca "Gemini Flash" (ucuz elektrik çeken fan) veya "Claude Sonnet" (yüksek verimli ana kompresör) vitesini seçen **Frekans Konvertörlü (İnverter) Akıllı Motor**.
* **Karar:** **%100 AKTİF & ELZEM**. Sistemin çalışması için mutlaka korunmalıdır.

### 🛠️ KATEGORİ 2: Teknik Standartlar (Domain Standards)
> ** HVAC Karşılığı:** Kanalların ve boruların montaj standartları (Örn: Galvaniz sac kalınlığı, kaynak kuralları).
* **`venthub-architecture`:** Dosya düzeni rehberi.
* **`i18n-conventions`:** Yerelleştirme sözlüğü standartları.
* **`supabase-security`:** Supabase RLS (Çekvalf) güvenlik mimarisi kuralları.
* **`ui-ux-pro-max`:** Premium görsel tasarım ve şablon sistemi.
* **Karar:** **%100 AKTİF & GEREKLİ**. Mimari standartlarımızı korur.

### 🚨 KATEGORİ 3: Kalite & Denetim Kapıları (Audit & Verification Gates)
> ** HVAC Karşılığı:** Boru hattındaki sızıntı test cihazları, duman dedektörleri ve basınç test pompaları.
* **`venthub-auditor`:** Bütünlük Kalkanı. 3D modeller ve database tipleri gibi **4 Kritik Varlığı** snapshot almadan elletmeyen **Otonom Basınç Emniyet Ventili**.
* **`venthub-enterprise-audit`:** Teslimat öncesi 11 katmanlı denetim yapan **Tesis Kabul Komisyonu**.
* **`venthub-global-rontgen`:** Kodun kırılıp kırılmadığını 30 saniyede test eden **Hızlı Kaçak Dedektörü**.
* **`diff-review`:** Git diff üzerinden `any` tipi veya yıkıcı `DROP` komutu arayan **Statik Sensör**.
* **`paralel-review`:** Değişiklikleri 3 farklı gözle (Tip, Güvenlik, Performans) inceleyen rehber.
* **Karar:** **KISMEN MÜKERRER! (Sadeleştirme Fırsatı)**
  * > [!WARNING] **Gereksiz Tekrar/Overload Analizi:**
    > `paralel-review` ile `diff-review` büyük oranda çakışmaktadır. `diff-review` bu işi tamamen otomatik bir Python scriptiyle (`check_diff_rules.py`) çözen keskin bir sensördür. `paralel-review` ise ajanın zihinsel kontrol yapması için yazılmış bir kılavuzdur. `paralel-review` yeteneği, `diff-review` ve `venthub-auditor` içerisine yedirilerek bu klasör tamamen arşivlenebilir veya silinebilir.

### ❓ KATEGORİ 4: Alakasız veya Arşivlenmesi Gereken Yetenekler
> ** HVAC Karşılığı:** Fabrikada duran ama artık o hatta hiç kullanılmayan eski üretim kalıpları.
* **`kod-kaynagi-dalisi` (Source Code Diving):** Dışarıdan açık kaynaklı kod blokları tarayıp projeye entegre etmek için yazılmıştır. VentHub şu an kararlı (stable) bir geliştirme aşamasındadır ve dışarıdan rastgele kod sızdırma ihtiyacımız yoktur. 
  * *Tavsiye:* Bu yetenek şu an için **alakasız/aktif dışı** durumdadır. Kafa karışıklığı yaratmaması için yedeklenip kaldırılabilir.
* **`superpowers-python-automation` & `superpowers-rest-automation`:**
  * İkisi de REST API entegrasyonu ve otomasyon senaryoları yazmak içindir. Biri genel kılavuzdur, diğeri Python kütüphaneleri (httpx/requests) üzerinedir. 
  * *Tavsiye:* Bu iki yetenek tek bir çatı altında birleştirilebilir veya VentHub e-ticaret kodlamasında doğrudan REST otomasyonu yazmadığımız için (Supabase JS SDK kullanıyoruz) **arşivlenebilir**.

---

## 4. 🧭 REHBERLİK & TAVSİYELERİMİZ

Sevgili Recep Bey (Mimar), bir sonraki cerrahi işimize (kodlama veya refactoring) başlamadan önce sistemin boru hatlarını temizlemek ve otonom akışı hafifletmek adına şu adımları atabiliriz:

1. 🧹 **Yetenek Pruning (Budama):** 
   - `kod-kaynagi-dalisi` ve `paralel-review` yeteneklerini arşiv dizinine taşıyarak otonom personellerimizin odaklanma kalitesini artırmak.
2. 🔗 **Entegrasyon:**
   - `superpowers-python-automation` yeteneğini `superpowers-rest-automation` ile tek bir güçlü "Otomasyon Alet Çantası" olarak birleştirmek.
3. 🛫 **Sıradaki Adım:**
   - [PULSE.md](file:///c:/Users/alize/venthub-hvac/registry/PULSE.md) dosyamızda bekleyen aktif görevlerden (`020 Fullscreen Category Editor` veya `017 Visual Page Builder`) birini seçerek oradaki vanaları açıp kodlamaya geçebiliriz.

Sistem taramamız tamamlanmıştır. Hangi yönde ilerleyeceğimiz konusunda emir ve onaylarınızı bekliyorum!
