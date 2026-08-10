# Kategori Taksonomisi Cetveli (Category Taxonomy Standard)

> **SSOT.** Ürün kategori iskeleti + yerleşim + gösterim kuralları. Full ürün yüklemesinin OMURGASI.
> Çelişirse kod/DB kazanır; bu cetvel niçin/nasıl'ı sabitler.
> v1.2 · 2026-08-10 — **ingestor fork'u kapatıldı:** §6 kanonik ağaç 11→**12 dal** (`parking-jet-fan` eklendi),
> §6.1 katalog-hattı yeni kategorileri (acid-resistant-fans / frequency-converters / electric-duct-heaters) karara bağlandı.
> (v1.1 · 2026-06-19 — canlı DB ile yeniden doğrulandı; §3'teki yanlış "üste yığılı" önermesi düzeltildi.)

---

## 1. İlke: extensible/plugin iskele (kategori ASLA "boş diye silinmez")

Kategori sistemi **bilinçli olarak genişletilebilir** tasarlandı (admin `CategoryFormModal` ile ekle/düzenle;
`CategoryContext` dinamik yükler; ürün `category_id`/`subcategory_id` ile bağlanır):
- **Boş kategori = gelecekteki ürün için hazır iskele**, hata değil. (air-conditioning, smart-home,
  electric-heating, hygiene = Vortice'in gerçek ürün aileleri, henüz yüklenmedi.)
- ❌ **Boş diye kategori SİLME.** İskele DB'de tam kalır.

## 2. Gösterim kuralı: "doluysa göster" (müşteri) / "hepsi" (admin)

> ⚠️ MEVCUT EKSİK (2026-06-19): `EliteMegaMenu`/`MobileMegaMenu` **tüm üst kategorileri** gösteriyor,
> ürün-sayısı filtresi YOK → 6 boş üst kategori müşteriye boş sayfa olarak görünüyor. KÖTÜ.

- **Müşteri menüsü/nav/anasayfa:** SADECE **ürünü olan** (kendisi veya alt-ağacı dolu) kategoriler.
- **Admin:** hepsini görür/yönetir (boşlar dahil).
- Ürün gelince kategori **kendiliğinden** görünür — manuel iş yok.
- **Uygulama:** `getCategories` ürün sayısı taşımıyor → kategorileri ürün-sayısıyla döndüren view/RPC
  (ör. `categories_with_counts`) + nav'da `count>0` filtresi. (Migration → prod.)

## 3. Yerleşim: tek model + GERÇEK durum (2026-06-19 canlı DB doğrulaması)

- **TEK model:** `products.category_id` = ÜST, `products.subcategory_id` = ALT. Tutarlı uygula.
- **GERÇEK DURUM (359 ürün, canlı Supabase):** ürünler büyük oranda **zaten alt-kategorilere dağılmış**.
  Kesin sınıflandırma:
  - **217** doğru (üst + doğru alt) ✅
  - **67** `category_id` doğrudan bir ALT-kategoriyi gösteriyor (model tutarsızlığı — ürün yine görünür ama yanlış kurguda)
  - **63** üst-var/alt-yok → bunların ~**60'ı meşru** (accessories 48 + summer 12 = alt-kategorisi olmayan yaprak üst), sadece ~3 industrial gerçekten takılı
  - **12** hiç kategorisiz (orphan — hiçbir kategori altında GÖRÜNMEZ, gerçek bug)
- **⛔ DÜZELTME:** *"136 üstte yığılı / altlar boş / oto-motor hiç çalışmadı"* önermesi **YANLIŞTI.**
  O ilk ölçüm yalnız `category_id`'yi saymış, ürünleri alt'a bağlayan `subcategory_id`'yi atlamıştı →
  altları boş sanmış. Veri değişmedi (kullanıcı DB'ye dokunmadı, motor koşmadı); **ölçüm hatalıydı.**
  **Kütle yeniden-dağıtımına GEREK YOK.**
- **Gerçek cleanup (küçük, hedefli):** (a) 12 orphan'a kategori ata · (b) 67 `category_id=alt` kaydını
  normalize et (`category_id`=üst, `subcategory_id`=alt) · (c) ~3 takılı industrial ürününe alt ata.
- `category_mapping_rules` + `fn_auto_categorize_products()` motoru duruyor; **mevcut veride büyük iş yok** —
  asıl faydası **yeni full-load'da** otomatik yerleştirme.

## 4. Dil: KANONİK slug EN, görünen URL dile göre, TR gösterim render'da

> ⭐ **2026-08-10 GÜNCELLEME:** Bu bölümün "yapılacak"ları KAPANDI ve kural genişledi —
> tam SSOT: `docs/plans/slug-localization-2026-08-10.md`.
- **Kanonik kimlik = EN slug** (`categories.slug`; DB/CSV/kod hep bunu konuşur). **Görünen URL dile göre:**
  `metadata.slug={tr,en}` → `/tr/` Türkçe, `/en/` İngilizce slug; yanlış-dil URL'si **308** (PR #457, prod'da).
- Kategori ADI daima `translation_key` + `getCategoryDisplayName` SSOT'undan. **Ham `c.name`/`c.slug` render YASAK**
  (Aksiyom 5: çeviri JSONB `metadata->>lang`).
- ✅ TR sızıntı düzeltildi (PR #456: PDP breadcrumb+özellik, Footer, kategori SEO metadata) ·
  ✅ eksik/bozuk `translation_key`'ler onarıldı (PR #457 migration).

## 5. HRV slug tekilleştir + seed

- `heat-recovery-vmc` BOŞ ama mimari en olgun dal (EN 308 hesaplayıcı + HRVModel 3D + katalog entegrasyonu kurulu).
- Kodda slug `heat-recovery`/`hrv`/`heat-recovery-vmc` farklı geçiyor olabilir → **yükleme öncesi tek değere sabitle.**
- Avensair "Isı Geri Kazanım" grubundan seed et.

## 6. Kanonik ağaç referansı (Vortice ne var × Avensair ne satıyor, TR)

**12 ana dal** (Avensair TR isim tabanı + Vortice ürün-aile derinliği): Konut Havalandırma · Ticari Havalandırma ·
Endüstriyel Havalandırma · Çatı Fanları (yatay/dikey/F400 ayrı) · **Isı Geri Kazanım (boş→doldur)** ·
Hava Perdeleri · Yaz Vantilatörleri · Endüstriyel Tavan Vant. · **Otopark Jet Fanları (`parking-jet-fan`)** ·
Hava Şartlandırma · Aksesuar · (+ az-dolu: hijyen/elektrikli-ısıtma/akıllı-ev = iskele, gelecek).
Tam aile listesi → [[catalog-ingestion-system]] hafıza + NLM Vortice/Avensair defterleri.

> `parking-jet-fan` gerekçesi (ingestor cetvelinden devralındı, 2026-08-10): Vortice VORT JET R / JET-A gibi
> gerçek indüksiyon jet fanları için bağımsız üst dal. Avensair listesinde olmasalar da SaaS vizyonu
> (marka-nötr taksonomi, diğer HVAC markalarının listelemeleri) bu ayrımı zorunlu kılar; fiyatsız girişler
> `confidence=missing` + `purchase_price_eur=NULL` ile aktarılır.

### 6.1 Katalog-hattı kategori kararları (2026-08-10 — CSV normalizasyonu ile kilitli)

Ingestor CSV'lerindeki 230 satırlık slug sapması canlı DB'ye hizalandı; karara bağlanan **yeni** kategoriler
(hepsi EN slug + `translation_key` kuralıyla, DB'de Kademe-2 loader öncesi migration ile açılacak):

| Yeni kategori | Slug (üst/alt) | Kapsam | Gerekçe |
|---|---|---|---|
| Asit-dayanımlı fanlar | `industrial-ventilation` / `acid-resistant-fans` | Seat/Storm/Jet, 81 ürün | 81 ürün tek alt'a (`radyal-fanlar`) yığılmaz; kimyasal/asit ortam = net alıcı niyeti |
| Frekans konvertörleri | `accessories` / `frequency-converters` | Danfoss FC101/FC102, 34 ürün | Fan kontrol cihazı = aksesuar doğası; yeni ana dal gerektirmez |
| Elektrikli kanal ısıtıcıları | `electric-heating` / `electric-duct-heaters` | Avens, 14 ürün | Mevcut `electric-heating` iskeleti tam bu iş için bekliyordu; HRV'ye gömmek yanlış raf |

Mekanik hizalamalar (karar değil): hücreli aspiratör + davlumbaz → `industrial-ventilation/radyal-fanlar`
(Avensair Bölüm 28/36 haritası) · Nicotra → `industrial-ventilation/radyal-fanlar` · banyo fanları →
`banyo-ve-tuvalet-fanlari` · Lineo → `residential-ventilation/kanal-ici-hayalet-fanlar` · sığınak →
`industrial-ventilation/siginak-havalandirma` · HRV/smart-home alt-slug'sız. `tier_c` (yerel icat) → `missing`.

**Slug dili kuralı (teyit):** mevcut TR alt-slug'lar yerinde kalır (301 normalizasyonu ertelendi, ithalatı
bloklamaz); **her YENİ slug İngilizce açılır** + `translation_key` zorunlu (§4).

## 7. AÇIK UYGULAMA GÖREVLERİ (compact sonrası — TAM yap, yarım değil)

1. `categories_with_counts` view/RPC + nav'da boş-gizle filtresi (müşteri). **[gerçek + görünür — #1]**
2. **Veri cleanup (kütle dağıtım DEĞİL — gerekçe §3):** 12 orphan'a kategori ata + 67 `category_id=alt`
   kaydını normalize et + ~3 takılı industrial'a alt ata.
3. **TR/EN gösterimini CANLI sitede DOĞRULA önce:** SSOT `wrapCategory` zaten `translation_key`
   → `common.categoryList.*` çözüyor ve TR sözlük TAM. Yani önceki "slug ile bakıp köprüyü atlıyor"
   teşhisi de şüpheli → ekranı gör, gerçekten sızıyorsa SSOT'u atlayan belirli yüzeyi bul, sonra düzelt.
4. HRV slug (`heat-recovery-vmc` zaten kanonik; `heat-recovery`/`hrv` varyantları kodda kontrol) + seed.
5. Çatı fanlarını yatay/dikey/F400 ayır (taksonomi kararı → ben).
> Sıra: bunlar bitince → full ürün load (catalog-ingestion-standard) güvenle başlar.
