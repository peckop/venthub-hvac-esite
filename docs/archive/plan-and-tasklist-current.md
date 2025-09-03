# VentHub — Plan ve Görev Listesi (Taşındı)

Bu belge ROADMAP'e taşınmıştır. Güncel tek kaynak: `docs/ROADMAP.md`.

Arşivlenmiş kopya: `docs/archive/plan-and-tasklist.md`.

---

## 1) Hedefler ve Başarı Kriterleri

- Hedefler
  - Ana Sayfa kurumsal “platform” hissi versin; uzmanlık ve değer önermesini net anlatsın.
  - Keşfet sayfası ürün bulmayı hızlandırsın; filtreleme, arama, karşılaştırmayı optimize etsin.
  - İleride “Endüstriyel Mutfak” gibi çözüm sayfaları rahatça eklenebilsin (bugün gizli).
- Başarı kriterleri (örnek)
  - Ana Sayfa: Çözümler kart CTR > %8, Hero CTA CTR > %5, Alt CTA lead > %2
  - Keşfet: Uygulama kart tıklamaları, arama/filtre/karşılaştırma kullanım oranı artışı
  - PDP: Teklif modal açılışı ve gönderim denemesi oranı artışı

---

## 2) Sayfa Rolleri (Ayrım)

- Ana Sayfa (kurumsal/çözüm odaklı)
  - Hero + 2/3 CTA (Ürünleri Keşfet, Teklif/Uzmanla Konuş, Uygulamaya Göre)
  - Uygulamaya Göre Çözümler (3–6 kart) — bugün: Otopark, Hava Perdesi, Isı Geri Kazanım
  - Güven/Değer şeridi (sertifika, rakamlar, marka logoları)
  - Vaka çalışması/başarı hikayesi (1–2 blok)
  - Ürün teaser (temsil niteliğinde 4 kart) + “Tümünü Keşfet” CTA
  - Kaynaklar/Kılavuzlar mini alanı (opsiyonel, fakat önerilir)
  - Alt CTA (Proje/teklif çağrısı)
- Keşfet (ürün keşfi/PLP)
  - Keşfet modu: kısa hero/şerit + Uygulamaya Göre kartlar + Popüler Kategoriler + Öne Çıkan/Yeni ürün vitrinleri
  - Tüm Ürünler modu: yalnızca liste/arama/filtre/karşılaştırma/sıralama; noindex + canonical doğru
  - Breadcrumb + ItemList yapılandırılmış veri; PDP’ye geçişi güçlendirir

---

## 3) Bilgi Mimarisi ve Navigasyon

- Üst menü (yakın vade)
  - Ürünler → /products?all=1 (tam liste)
  - Keşfet → /products (keşif modu)
  - Markalar, Destek, Hakkımızda, İletişim/Teklif
  - “Çözümler” menüsü: Şimdilik gizli; Endüstriyel Mutfak hazır olduğunda eklenecek.
- Alt menü/footerde kurumsal ve yasal sayfalar (mevcut)

---

## 4) Uygulamaya Göre Kartlar — İçerik Operasyon Modeli

- Konfigürasyon: `src/config/applications.ts`
  - Alanlar: key, title, subtitle, href, icon, accent, active
  - Aktif kartlar: `APPLICATION_CARDS.filter(c => c.active)`
  - “Endüstriyel Mutfak” şimdilik `active:false`; ileride `true` yapınca otomatik yayına çıkar.
- UI yardımcıları: `src/utils/applicationUi.tsx`
  - `iconFor()`, `accentOverlayClass()`, `gridColsClass()` (Tailwind purge güvenli)
- Kullanım yerleri
  - Ana Sayfa: Hero altındaki “Uygulamaya Göre Çözümler”
  - Keşfet: “Uygulamaya Göre Çözümler” (id=by-application)

---

## 5) SEO Planı (özet)

- Ana Sayfa: Organization + WebSite (SearchAction) schema (ileride)
- Keşfet/PLP: BreadcrumbList + ItemList (sayfalama kurgusu); canonical `/products`, parametreli full liste `noindex`
- PDP: Product JSON‑LD (Brand/Offer/Manufacturer; AggregateRating hazır olunca)
- Site haritası ve robots.txt (mevcut)

---

## 6) Analytics (opsiyonel, hazır altyapı)

- Hafif helper: `src/utils/analytics.ts` (GA4 → GTM → dev log; `window.DEBUG_ANALYTICS = true` ile görünür)
- Mevcutta kablo: “Uygulamaya Göre” kart tıklamaları
- Gelecek (opsiyonel): Hero CTA, Nav, Popüler Kategori tıklaması, PLP filtre/sıralama/karşılaştırma, PDP lead açılışı/gönderimi

---

## 7) Uygulama Planı — Fazlar ve Görevler

Aşağıdaki görevler, kurumsal‑keşif ayrımını güçlendirmek ve sürdürülebilir içerik yönetimi sağlamak için planlanmıştır.

### Faz 0 (Tamamlandı)
- [x] Uygulama kartlarını merkezi konfige taşı
- [x] Home ve Keşfet sayfalarını bu konfig ile render et
- [x] Tailwind dynamic class riskini kaldır (gridColsClass)
- [x] Docs: NEXT_STEPS’e içerik‑operasyon notu

### Faz 1 — Ana Sayfa Kurumsal Güçlendirme
1) Vaka çalışması (Case Study) blokları (1–2 adet)
   - [ ] Bileşen: görsel/başlık/kısa özet/sonuç metrikleri
   - [ ] Yerleşim: Güven şeridi sonrası, ürün teaser’dan önce
   - [ ] Placeholder içerikle başla; gerçek içerik gelince güncelle
2) Kaynaklar/Kılavuzlar mini alanı
   - [ ] Başlık + 2–3 link kartı (örn. “Otopark Jet Fan seçimi”, “Hava perdesi seçimi”)
   - [ ] PDF linkleri veya blog/knowledge sayfalarına yönlendirme
3) Ürün teaser düzeni (teyit)
   - [x] En fazla 4 kart; “Tümünü Keşfet” CTA’yı vurgula
4) Alt CTA (mevcut)
   - [ ] Metin/copy gözden geçir; lead modal tetikleme teyidi

### Faz 1 — Keşfet (PLP) Netleştirme
1) Keşfet hero ve şerit
   - [x] Kısa kopye gözden geçir; “İhtiyacına Göre Seç” anchor bağlantısı test
2) Uygulamaya Göre / Popüler Kategoriler
   - [x] İkonografi ve micro‑copy temel kurulum (ince ayar TBD)
   - [ ] Kart hover, focus, a11y teyit
3) Vitrinler
   - [x] “Öne Çıkanlar” ve “Yeni Ürünler” dengesi; grid/list modlarıyla uyum

### Faz 2 — Navigasyon ve IA
1) “Çözümler” menüsü (ileride)
   - [ ] “Endüstriyel Mutfak” hazır olunca dropdown ekle
   - [ ] URL: `/solutions/kitchen-ventilation` (landing)
2) Site haritası güncellemesi
   - [ ] Çözümler sayfası canlı olduğunda sitemap’a ekle

### Faz 2 — Analytics (opsiyonel)
1) Data‑attribute tabanlı delegasyon (tek listener)
   - [ ] data-analytics-event + data-analytics-props ile tıklama/event standardı
2) Olaylar
   - [ ] hero_cta_click, nav_click, application_click, category_click
   - [ ] search_submit, filter_change, sort_change, compare_add/remove
   - [ ] lead_open, lead_submit

### Faz 3 — “Endüstriyel Mutfak” Çözüm Sayfası (gelecek)
1) Landing yapısı
   - [ ] Sorun/standartlar çerçevesi, bileşenler, önerilen ürün aileleri
   - [ ] Basit hesaplayıcılar (hava debisi/kanal hızı/basınç kaybı — başlangıç)
   - [ ] Case study + dokümanlar (CAD/BIM/PDF)
   - [ ] CTA: proje yükle/teklif iste
2) SEO ve içerik
   - [ ] İçerik başlıkları hiyerarşisi, schema (FAQ/HowTo/Article uygun olanlar)

---

## 8) QA Kontrol Listesi

- Genel
  - [ ] Ana Sayfa ve Keşfet görev ayrımı net; tekrar içerik yok
  - [ ] Uygulama kartları sayısı değiştiğinde grid ve görünüm sağlıklı
  - [ ] “Endüstriyel Mutfak” kartı gizli (active:false)
- Ana Sayfa
  - [ ] Case Study ve Kaynaklar blokları responsive, erişilebilir
  - [ ] Hero ve Alt CTA butonları hatasız
- Keşfet
  - [ ] Keşfet ↔ Tüm Ürünler modları doğru davranıyor
  - [ ] Breadcrumb, canonical/noindex kuralları doğru
- Performans/A11y
  - [ ] Görseller lazy; kontrast/focus durumları uygun
- Konsol
  - [ ] Hata/warn yok (dev uyarıları hariç)

---

## 9) Kabul Kriterleri (Örnek)

- Ana Sayfa, kurumsal odaklı akışla (Hero → Çözümler → Güven → Case Study → Ürün Teaser → Alt CTA) sağlıklı render olur.
- Keşfet’te Uygulamaya Göre kartlar ve Popüler Kategoriler öne çıkar; Tüm Ürünler modunda yalnızca liste odaklı UI görünür.
- Uygulama kartları tek konfig kaynağından yönetilir; “Mutfak” active:true olduğunda başka kod değişmeden görünür hale gelir.
- SEO canonical/noindex kuralları uygulanır; structured data (BreadcrumbList/ItemList/Product) planlanan yerlerde bulunur.

---

## 10) Zamanlama (Öneri)

- Faz 1 (1–2 gün)
  - Ana Sayfa: Case Study + Kaynaklar blokları (placeholder içerikli)
  - Keşfet: micro‑copy/ikon ince ayarları
- Faz 2 (1–2 gün)
  - Navigasyon (Çözümler menüsü — hazır olunca), analytics delegasyon (opsiyonel)
- Faz 3 (4–7 gün)
  - “Endüstriyel Mutfak” çözüm sayfası iskeleti + içerik (kademeli)

---

## 11) Notlar ve Bağımlılıklar

- Supabase şeması: Şimdilik kartları etkilemiyor (konfig üzerinden ilerliyoruz). PDP/PLP teknik alanlar genişletmeleri için Supabase hazır olunca veri kaynakları bağlanır.
- GA4/GTM: Analitik platformu yoksa eventler dev log’a düşer. Sonradan kolay eklenir.
- Marka görselleri ve case study içerikleri geldikçe güncellenecek.

---

## Ek: Dosya ve Yol Referansları (mevcut)

- Uygulama kartları konfig: `src/config/applications.ts`
- UI yardımcıları: `src/utils/applicationUi.tsx`
- Analytics helper: `src/utils/analytics.ts`
- Ana Sayfa: `src/pages/HomePage.tsx`
- Keşfet/Ürünler: `src/pages/ProductsPage.tsx`
- Not: “Mutfak” kartı konfigde `active:false`; ileride `true` yapılarak etkinleşir.

