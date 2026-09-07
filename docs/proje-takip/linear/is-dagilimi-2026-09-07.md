<!-- uretilmis: Linear GraphQL disa aktarimi (scripts/nlm/linear_disa_aktar.py) · damga 2026-09-07T09:36:47Z · elle duzenlenmez; yenileme: gun kapanisi ritueli -->
# Linear İş Dağılımı — Şantiye Durumu (2026-09-07)

**Damga:** 2026-09-07T09:36:47Z · **Kaynak:** Linear GraphQL `issues` (sayfalama 3 çağrı) · **Toplam iş:** 203

> Okuma kılavuzu: her proje bir kat, her kilometre taşı bir dükkân sırası, her iş bir dükkân. **% bitti = Done / (Toplam − Canceled)**. Sorumluluk = şerit etiketi (assignee alanı çoğunlukla boş).

Durum dağılımı: Done 58 · In Progress 20 · Todo/Backlog 110 · Canceled 15 → **genel % bitti 31%**

## §1 ÖZET — proje başına

| Proje | Toplam | Done | In Progress | Todo/Backlog | Canceled | % bitti |
|---|---:|---:|---:|---:|---:|---:|
| (projesiz) | 6 | 0 | 0 | 1 | 5 | 0% |
| Altyapı, Kapılar ve Belge Hattı | 68 | 15 | 14 | 38 | 1 | 22% |
| Katalog ve Ürün Verisi | 23 | 1 | 3 | 19 | 0 | 4% |
| Kurumsal Belgeler (DESIGN-BELGE) | 2 | 0 | 0 | 2 | 0 | 0% |
| Marka Kılavuzu (DESIGN-MARKA) | 3 | 0 | 0 | 3 | 0 | 0% |
| Q-Validator | 28 | 20 | 0 | 0 | 8 | 100% |
| SEO ve Yayın | 7 | 3 | 1 | 2 | 1 | 50% |
| Teklif Akışı ve Müşteri Paneli | 22 | 4 | 1 | 17 | 0 | 18% |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | 44 | 15 | 1 | 28 | 0 | 34% |
| **TOPLAM** | 203 | 58 | 20 | 110 | 15 | 31% |

## §2 ŞERİT (etiket) başına

| Etiket | Toplam | Done | In Progress | Todo/Backlog | % bitti |
|---|---:|---:|---:|---:|---:|
| ALTYAPI | 46 | 14 | 6 | 26 | 30% |
| DESIGN | 6 | 0 | 0 | 6 | 0% |
| OPS | 43 | 5 | 5 | 29 | 13% |
| P01-Data | 4 | 3 | 0 | 0 | 100% |
| P02-Constraint | 6 | 6 | 0 | 0 | 100% |
| P03-API | 3 | 0 | 0 | 0 | - |
| P04-Research | 3 | 3 | 0 | 0 | 100% |
| Recep kapısı | 17 | 1 | 6 | 9 | 6% |
| URUN | 77 | 19 | 7 | 50 | 25% |
| URUN-KATALOG | 7 | 0 | 2 | 5 | 0% |
| (etiketsiz) | 14 | 8 | 0 | 0 | 100% |

## §3 Proje → kilometre taşı → iş (açık işler; Done ayrı)

### (projesiz)

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-1 | Canceled | Get familiar with Linear | - | 0 | 2026-09-07 |
| REC-2 | Canceled | Set up your teams | OPS | 0 | 2026-09-07 |
| REC-3 | Canceled | Connect your tools | OPS | 0 | 2026-09-07 |
| REC-4 | Canceled | Import your data | - | 0 | 2026-09-07 |
| REC-33 | Canceled | P07-Enterprise-Search: Faz 0 - Envanter ve Zemin Etüdü | OPS | 0 | 2026-09-07 |
| REC-140 | Backlog | (ALTYAPI) anon rolüne tablo düzeyinde yazma GRANT'ları — derinlik savunması yok, | ALTYAPI | 3 | 2026-09-07 |

### Altyapı, Kapılar ve Belge Hattı

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-141 | Backlog | (OPS) Belge çelişki temizliği paketi — 2026-09-04 taraması (13 kalem, sahipli) | OPS | 3 | 2026-09-07 |
| REC-142 | Backlog | Companion sistemi UYKU KİPİ — tek taşıyıcı anahtarı, tüm kapılar say-raporla, ka | ALTYAPI | 1 | 2026-09-07 |
| REC-144 | Backlog | INV-DOC-3 v2 — küme master TAZELİK paritesi (ad paritesi yerine); bloklamaz, say | ALTYAPI | 3 | 2026-09-07 |
| REC-158 | Backlog | Föy PDF'i ile vitrin AYNI biçimlendiriciyi kullansın (INV-FOY-PARITE-1) — öncül  | ALTYAPI | 3 | 2026-09-07 |
| REC-160 | Backlog | Satınalma belge kimlikleri: purchase_orders.po_no + goods_receipts.grn_no (K19 k | ALTYAPI | 4 | 2026-09-06 |
| REC-162 | In Review | Vercel günlük derleme sınırı: kapıda "rate limited" kolu = ÖLÇÜLEMEZ (madde 3 dı | ALTYAPI | 2 | 2026-09-07 |
| REC-167 | Backlog | KVKK başvuru kaydı şeması: başvuru no (K19 önek KV), talep metni, ad soyad, tele | ALTYAPI | 4 | 2026-09-06 |
| REC-168 | In Review | ALTYAPI: Satış kipine TEK ANAHTARLA geçiş — hide_price (37 kategori) + NEXT_PUBL | ALTYAPI, Recep kapısı | 3 | 2026-09-07 |
| REC-173 | Backlog | Tasarım arşivi ve taşınabilirlik: 4 Claude Design projesi depoya günlük çekilir, | ALTYAPI, Recep kapısı | 2 | 2026-09-07 |
| REC-174 | In Review | Model yönlendirme cetvel satırı (WrongStack 2/3): mekanik iş ucuz modele/betiğe, | ALTYAPI | 3 | 2026-09-07 |
| REC-175 | In Progress | Tek ekran pano (WrongStack 3/3): gün kapanışı betiği her akşam tek dosya üretir  | OPS | 3 | 2026-09-06 · BEKLİYOR: REC-141 |
| REC-176 | In Review | venthub-tasarim-dili skill DOĞRULAMA: 14 kural × Kararlar gövdesi × Design dosya | OPS | 2 | 2026-09-07 |
| REC-177 | In Review | Hafıza kancaları: eylem defteri (mv/rm → state) · soru yönlendirme (hatırlıyor m | ALTYAPI | 2 | 2026-09-07 |
| REC-178 | In Review | 1000 satır tavanı — sahipsiz 8 kalemin sahip ataması (pricingMaterialize:126 YAZ | OPS | 2 | 2026-09-07 |
| REC-179 | In Review | Evren muhafızı sınavı: 53 aday konformans kapısı × sabotaj (evreni daralt, yeşil | OPS | 2 | 2026-09-07 |
| REC-180 | In Review | Araç envanteri: 27 hook (9'u bağlı) · 119 betik · 64 skill · 5 git kancası · 29  | OPS | 2 | 2026-09-07 |
| REC-181 | Backlog | 20 eksen denetimi 3. koşum (v3): 2. koşumdan beri 466 commit, edge ortak katman  | OPS | 3 | 2026-09-06 |
| REC-182 | In Review | REC-178/URUN: pricingMaterialize.ts:126 refreshCostInBase (YAZMA yolu) + :317 +  | URUN | 2 | 2026-09-07 |
| REC-183 | In Review | REC-178/ALTYAPI: supabase/functions order-housekeeping:63 (limit 1000, cron) + s | ALTYAPI | 3 | 2026-09-07 |
| REC-184 | In Review | REC-178/Katalog: generate-sitemap.mjs (limit 5000, çağıran yok = ÖLÜ ADAY ölçümü | Recep kapısı, URUN-KATALOG | 3 | 2026-09-07 |
| REC-185 | Todo | REC-180/ALTYAPI: araç envanteri KAPISI — scripts/hijyen/arac-envanteri.cjs (fs t | ALTYAPI | 3 | 2026-09-07 |
| REC-186 | In Review | URUN (K12): DD ailesi 6N090P → 61090P ad + slug düzeltmesi, eski slug 301, kanon | Recep kapısı, URUN | 3 | 2026-09-07 |
| REC-187 | Todo | Gün kapanışı v2: şerit dilim kaydı (DEVAM+ANLAM, numaralı) · iş kalemi sipariş y | OPS | 2 | 2026-09-07 |
| REC-188 | Todo | REC-179/URUN: 11 fail-open konformans kapısına evren muhafızı — 3d-asset-validit | URUN | 2 | 2026-09-07 |
| REC-189 | Todo | REC-179/ALTYAPI: 3 fail-open kapıya evren muhafızı — pricing-money-append-only · | ALTYAPI | 3 | 2026-09-07 |
| REC-192 | In Progress | ALTYAPI: mekanizma teslimat kanıtı "atıldı" ile "ULAŞTI"yı ayırt etmiyor — gözcü | ALTYAPI | 2 | 2026-09-07 |
| REC-194 | Backlog | Mekanizma CRON katmanı: Recep 2026-09-06 "cron kurulmasın, irtibat kopuyor, ayrı | OPS, Recep kapısı | 4 | 2026-09-07 |
| REC-201 | Backlog | ALTYAPI (Kurumsal Belgeler K13 + SEO K4): PDF üreticide sayfa no / nakli yekûn f | ALTYAPI | 3 | 2026-09-07 |

**Belge hattı**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-64 | Backlog | İkiz taraması: 20 aday eksik — koda karşı doğrula, haritaya işle | OPS | 3 | 2026-09-07 |
| REC-67 | Backlog | Companion üreteci taşıyıcısı — mimo üyeliği iptal, 28'inden sonra Haiku masada | OPS | 3 | 2026-09-07 |
| REC-69 | Backlog | T021 — Üretilen belge tazelik kapıları, venthub ayağı (Kapı A + Kapı C + cetvel) | ALTYAPI | 0 | 2026-09-07 |
| REC-84 | Backlog | Belge Tazeleme — companion + master MD + NLM ikizi, SIFIRLANANA KADAR | OPS | 0 | 2026-09-07 |
| REC-102 | Backlog | Orion companion üreteci: 3 kalem — çıkış kodu dürüstlüğü, defter/batch yolu, mut | ALTYAPI | 3 | 2026-09-07 |
| REC-132 | Backlog | Üretilmiş toplamalar (master md + manifest) özellik PR'larında yol almasın; mast | ALTYAPI | 2 | 2026-09-07 |

**Kapı kör kolları**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-51 | Canceled | Supabase "leaked password protection" AÇ | OPS, Recep kapısı | 2 | 2026-09-04 |
| REC-52 | Backlog | whsec_ webhook secret rotasyonu (repo PUBLIC) | ALTYAPI, Recep kapısı | 2 | 2026-09-07 |
| REC-58 | Backlog | Onaysız tehlikeli butonlar: tekil iade + tekil rol değişikliği | ALTYAPI | 1 | 2026-09-07 |
| REC-74 | Backlog | Güvenlik açık işleri (registry taşıması) | OPS | 0 | 2026-09-07 |
| REC-119 | Backlog | Sistematik ölü kod temizliği: knip 30 dosya + 67 export — CodeGraph çapraz doğru | ALTYAPI | 3 | 2026-09-07 |
| REC-121 | Todo | Tip-drift kapısı: migration inince database.types.ts canlı şemayla senkron mu —  | ALTYAPI | 0 | 2026-09-03 |
| REC-130 | Backlog | Ölçüm komutları çalışma dizinini beyan eder; oturum dizini şerit ağacından ayrış | ALTYAPI | 2 | 2026-09-07 |
| REC-133 | Backlog | Ölü anahtar kapısı: bileşene devredilen sözlük alt ağacı (dictionary={dict.home} | URUN | 4 | 2026-09-07 |
| REC-137 | Backlog | İLAN EDİLMEMİŞ KAYNAK hiçbir kapının evreninde değil — REC-132 bu pencereyi UZAT | ALTYAPI | 3 | 2026-09-03 |
| REC-138 | Backlog | SSR duman kilidi PR KAPISI olarak: CI kendi sunucusunu kaldırır — ama gerçek Sup | ALTYAPI, Recep kapısı | 3 | 2026-09-07 |

**Kolsuz cetveller**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-120 | Backlog | INV-CETVEL-YAPI iki kapsam kusuru: HÜKÜM başlığı dosya-çapında tekil sanılıyor + | ALTYAPI | 0 | 2026-09-07 |

**Orion köprüsü ve filo mekanizması**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-70 | Backlog | T019 — 21 zaman-aşımısız dış çağrıya bütçe + AST konformans kapısı | ALTYAPI | 0 | 2026-09-07 |
| REC-71 | Backlog | T018 — Köprü içe alma açıklığı: 129 raporlandı / 126 oluştu | ALTYAPI | 0 | 2026-09-07 |
| REC-76 | Backlog | Altyapı & Araç açık işleri (registry taşıması) | OPS | 0 | 2026-09-07 |
| REC-78 | Backlog | Sayaç üçlüsü: atılan ölçümleri yakala (T018 ardılı) | ALTYAPI | 0 | 2026-09-07 |
| REC-82 | Backlog | Pano v2: adresli görünürlük — yetkisiz oturum panonun tamamını görmez | ALTYAPI | 2 | 2026-09-03 |
| REC-86 | Backlog | Ajan hafıza sistemi — araştırma, karar ve Faz 1 (PreCompact kapısı) | OPS | 2 | 2026-09-07 |
| REC-107 | Backlog | Hijyen: ortak depoda 36 worktree + 83 stash birikti — envanter ve bilinçli temiz | OPS | 4 | 2026-09-05 |
| REC-126 | Backlog | Jules Darwin/Bolt önerileri — kapatılan #879/#878'in fikir kaydı (atama değil, d | OPS | 0 | 2026-09-07 |

<details><summary>Done (15)</summary>

- REC-34 · PR #799 — Bash yazma kapısı: üç katman + E1 pre-commit şerit kapısı · 2026-08-27
- REC-35 · PR #804 — INV-EDGE-DRIFT-1: paylaşılan girdiye dokunan PR prod'u master'a karşı  · 2026-08-27
- REC-37 · PR #800 — Gözcü onarımı: sessiz kırpma + arşiv patlaması + iki sessiz atlama · 2026-08-27
- REC-38 · PR #801 — T160 §2.3: test ADA değil PARAGRAFA · 2026-08-27
- REC-41 · Companion hattı: istem revizyonu + model mimo-2.5-pro + kirli 86 dosyanın yenide · 2026-08-25
- REC-42 · Köprü Faz 2 tasarımı (ters yön) + [OPS] görev yönetimi Linear'a geçiş kararı · 2026-08-26
- REC-53 · Registry göçü: kalan ~80 açık kaydın triyajı · 2026-08-26
- REC-63 · PR envanteri eşitleme — 14 kayıtsız açık PR'ın triyajı · 2026-08-24
- REC-66 · venthub companion+master CJK süpürmesi — ikize giden master'larda 4.519, 191 com · 2026-08-25
- REC-68 · Tasarım gerekçesi companion'a BİREBİR taşınsın — T019 istem ailesi (Txxx: NİÇİN/ · 2026-08-25
- REC-83 · Companion sembol kaybı — ayrıştırıcı keşfi sembolleri düşürüyor, kalite kapısı k · 2026-08-28
- REC-87 · Duman dedektörleri Faz-1.5: deploy bekçisi + NLM tazelik bekçisi + rozet bekçisi · 2026-08-30
- REC-118 · PR #640 [BILINCLI-KIRMIZI] INV-DOC-3 yaml-defter paritesi — parkta; silahlandırm · 2026-09-05
- REC-131 · Merge ritüeli betiği depoya alınır: 5 ölçüm (DIRTY değil · 7 kol listede · düşen · 2026-09-06
- REC-134 · SSR boş-kabuk kilidi CI'da HİÇ koşmuyor — SMOKE_BASE_URL hiçbir workflow'da tanı · 2026-09-06

</details>

### Katalog ve Ürün Verisi

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-139 | Backlog | Katalog metin hijyeni ingest kapısı: aynı sınıf kusur temizlenip GERİ GELİYOR (ç | URUN | 4 | 2026-09-04 |
| REC-145 | Backlog | Belge deposu: ürün/aile teknik belgeleri (katalog PDF · veri sayfası · kılavuz · | URUN-KATALOG | 2 | 2026-09-07 |
| REC-146 | Todo | İçerik hattı: 40 aile anlatımı + yapısal altı blok (Gövde·Çark·Motor·Koruma·Kont | URUN-KATALOG | 3 | 2026-09-07 |
| REC-155 | Todo | CANLI: 126/375 ürün sayfasında "Ürün Açıklaması" altında iç kademe notu görünüyo | URUN | 1 | 2026-09-07 |
| REC-157 | In Review | Konformans kapısı: aile açıklamasındaki sayısal değer, ailenin ürünlerinden türe | URUN | 2 | 2026-09-07 |
| REC-161 | In Review | Kategori açıklaması i18n yolu: metadata.description_i18n {tr,en} + getCategoryDe | URUN | 2 | 2026-09-07 |
| REC-163 | Backlog | KAYNAK DİZİNİ: tedarikçi PDF'leri bir kez, deterministik, sayfa+tablo düzeyinde  | URUN-KATALOG | 1 | 2026-09-07 |
| REC-164 | Backlog | Aile sayfasında altı yapısal blok (Gövde · Çark · Motor · Koruma · Kontrol · Mon | URUN | 2 | 2026-09-06 |
| REC-166 | Backlog | Admin kategori formu description_i18n {tr,en} yazamıyor — kategori paragrafları  | URUN | 4 | 2026-09-07 |
| REC-172 | In Progress | KATALOG + OPS: Teknik özellik tamamlama hattı — boşluk haritası (aile × alan) →  | Recep kapısı, URUN-KATALOG | 2 | 2026-09-07 |
| REC-190 | Todo | Katalog: canlıda 38 teknik hücre sayısal anahtarda birim-gömülü metin taşıyor (m | URUN-KATALOG | 3 | 2026-09-07 |
| REC-193 | Backlog | KATALOG: AVE-20150 fiyatı canlıda 0,00 — içe alımda düşen tek satır; yazımı Rece | Recep kapısı, URUN-KATALOG | 3 | 2026-09-07 |

**Görsel tamamlama**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-44 | Backlog | Ürün görseli edinme hattı — 35 ürün kaldı (339/374 tamam) | URUN | 2 | 2026-09-07 |
| REC-91 | Backlog | Görsel hattı gerçek çözümü: ön-üretilmiş boyutlar + bağımsız yedek yol (402 kriz | URUN | 2 | 2026-09-07 |
| REC-96 | Backlog | ADMIN: depo adresi elle kurulan iki kopya — kategori-görsel tek-kaynak desenine  | URUN | 4 | 2026-09-03 |

**İkinci çıkarım turu — SEAT, Nicotra, AVenS**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-56 | Backlog | Ürün-katalog hattı — cetveller indi, içerik/derinlik işleri açık | OPS | 2 | 2026-09-07 |
| REC-60 | Backlog | Kapsama: ~210 eksik kod + sürekli sayım kapısı | URUN | 2 | 2026-09-07 |
| REC-109 | Backlog | 16 ailenin EN adı eksik/sahte (9 hiç yok + 7 en==tr) — çeviri üretimi + Recep iç | URUN | 2 | 2026-09-07 |
| REC-122 | Backlog | EN marka şeridinde "Frekans Konvertörü" marka olarak listeleniyor + 6 marka 3x t | URUN | 0 | 2026-09-07 |
| REC-124 | Backlog | Katalog veri kusurları paketi: "Frenkans"/"Inventoru" yazımları CANLIDA + DAN-80 | URUN | 0 | 2026-09-07 |
| REC-135 | Todo | Kategori ağacı boşlukları: 10 dalsız ürün + 7 boş alt dal (365/375 zaten dalında | Recep kapısı, URUN | 2 | 2026-09-07 |
| REC-136 | Backlog | Katalog sayımı TEK KAYNAK: sitenin okuduğu yolla sayan betik + günlük tablo; say | URUN | 2 | 2026-09-07 |

<details><summary>Done (1)</summary>

- REC-39 · PR #803 — Lineo birleşimi sonrası bayat taban temizliği (36→34) · 2026-08-27

</details>

### Kurumsal Belgeler (DESIGN-BELGE)

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-153 | Backlog | Sorular — DESIGN-BELGE (sürekli açık soru/öneri kaydı) | DESIGN, OPS | 0 | 2026-09-06 |
| REC-170 | Backlog | ALTYAPI: Keşif raporu veri modeli — site_surveys tablosu (KS-YYYYMMDD-NNNN numar | ALTYAPI | 4 | 2026-09-06 |

### Marka Kılavuzu (DESIGN-MARKA)

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-149 | Backlog | Projeler arası tasarım ayarı eşitleme — VentHub design system olarak üretilsin,  | DESIGN, OPS | 2 | 2026-09-06 |
| REC-151 | Backlog | Sorular — DESIGN-MARKA (sürekli açık soru/öneri kaydı) | DESIGN, OPS | 0 | 2026-09-05 |
| REC-202 | Backlog | DESIGN-MARKA (K2): Marka projesi CLAUDE.md aynasında fiil düzeltmesi "Teklif al" | DESIGN, OPS | 4 | 2026-09-07 |

### Q-Validator

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-19 | Canceled | 001: Hypothesis Engine Scoring API | P03-API | 0 | 2026-09-07 |
| REC-20 | Canceled | 002: Root Profiler API | P03-API | 0 | 2026-09-07 |
| REC-21 | Canceled | 003: Hypothesis Test API | P03-API | 0 | 2026-09-07 |
| REC-23 | Canceled | 004: Populate Technical Function Flags | P01-Data | 3 | 2026-09-07 |
| REC-28 | Canceled | Implement Remaining 5 Constraint Engines (Phase 1 / V1) | - | 0 | 2026-09-07 |
| REC-29 | Canceled | Enforce Principle 4: Semantic Void and Randomness Check (Opposition Constraint) | - | 0 | 2026-09-07 |
| REC-30 | Canceled | Research & Implement Adaptive Alpha (Distance Decay) for Higher Orbits | - | 0 | 2026-09-07 |
| REC-31 | Canceled | Topological Network Visualization (API & Next.js Bridge) | - | 0 | 2026-09-07 |

<details><summary>Done (20)</summary>

- REC-5 · [P01-001] Python venv + requirements.txt kurulumu · 2026-03-27
- REC-6 · [P01-002] Klasör yapısı (models, importers, engine, api) setup · 2026-03-27
- REC-7 · [P01-003] SQLAlchemy Modelleri (SQL schema mapping) · 2026-03-27
- REC-8 · [P01-004] FastAPI Minimal Iskelet (Açılış) · 2026-03-27
- REC-9 · [P01-005] Pytest Smoke Test Setup · 2026-03-27
- REC-10 · 001: Full Schema — 10 Veri Modeli · 2026-03-28
- REC-11 · 002: Tanzil Text Importer · 2026-03-28
- REC-12 · 003: Quranic Corpus Morphology Importer · 2026-03-28
- REC-13 · 001: Morphology Constraint · 2026-03-28
- REC-14 · 002: Syntax Constraint · 2026-03-28
- REC-15 · 003: Opposition Constraint · 2026-03-28
- REC-16 · 004: Local Context Constraint · 2026-03-28
- REC-17 · 005: Global Distribution Constraint · 2026-03-28
- REC-18 · 006: Technical Function Constraint · 2026-03-28
- REC-22 · 007: ConstraintBase ABC Refactoring · 2026-03-29
- REC-24 · 008: Sentinel Guard Quality Gates (Coverage + Complexity) · 2026-03-29
- REC-25 · 009: ConstraintBase ABC Refactoring (Kod Tekrarı Eliminasyonu) · 2026-03-28
- REC-26 · P04-001: Gravity Engine (Semantic Neighborhood) Entegrasyonu · 2026-03-31
- REC-27 · P04-005: Faz 2 - Kelime Form Çekim Desenleri · 2026-03-31
- REC-32 · P04-007: Faz 4 - Harf Seviyesi α Tutarlılık Testi · 2026-03-31

</details>

### SEO ve Yayın

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-191 | In Review | URUN: Adres şeması + kategori ağacı + nitelik katmanı TEK YAYIN — geçiş planı (K | Recep kapısı, URUN | 2 | 2026-09-07 |

**Bing kökü ve hreflang**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-50 | Todo | venthub.com.tr DNS + kanonik SITE_URL | OPS, Recep kapısı | 2 | 2026-09-03 |
| REC-105 | Canceled | Sitemap /tr/destek ve /en/destek ilan ediyor — ikisi de canlıda 404 | URUN | 3 | 2026-09-03 |
| REC-127 | Backlog | Bing kökü dizinleyemiyor: / → /tr 307 GEÇİCİ yönlendirme + hreflang x-default YO | URUN | 2 | 2026-09-07 |

<details><summary>Done (3)</summary>

- REC-90 · SEO + dürüstlük gece paketi: 5 PR (#894-#898) — domain açılışı ertesi vitrin kim · 2026-08-30
- REC-100 · SEO: canlıda çift canonical + localhost:3000 — istemci Seo bileşeni yazılı kural · 2026-08-31
- REC-111 · JSON-LD fiyat sızıntısı: 72/80 ürün sayfası Google'a fiyat beyan ediyor (696 ala · 2026-09-01

</details>

### Teklif Akışı ve Müşteri Paneli

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-143 | Backlog | Teklif kalemine seçim kaynağı (tür · girdiler · dayanak) kolonu + quote_no'nun t | OPS | 3 | 2026-09-07 |
| REC-154 | Backlog | E-posta şablonu kod tarafı: sipariş no biçimi e-postada kırpık (#000318 ≠ 2026-0 | URUN | 3 | 2026-09-07 |
| REC-156 | In Review | Sipariş numarası saatten değil günlük sayaçtan üretilsin — generate_order_number | Recep kapısı, URUN | 2 | 2026-09-07 |
| REC-159 | Backlog | İade şeması dar: venthub_returns'e kalem tablosu + refund_amount + return_no (IA | URUN | 3 | 2026-09-06 |

**Bayi ve segment**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-45 | Backlog | Teklif→Sipariş dönüşüm köprüsü | URUN | 3 | 2026-09-03 |
| REC-46 | Backlog | Bayi segment-atama ekranı | URUN | 3 | 2026-09-03 |
| REC-62 | Backlog | ERP çalışma alanı + CRM nesne katmanı — cetveller yazılı, kod sıfır | OPS | 2 | 2026-09-07 |
| REC-88 | Todo | Açık kaynak CRM/ERP taraması + wacrm incelemesi — karar bekliyor | OPS, Recep kapısı | 0 | 2026-09-07 |

**Proje ve panel**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-43 | Backlog | KVKK: hesap silme/anonimleştirme + veri sahibi talep akışı | URUN | 3 | 2026-09-07 |
| REC-77 | Backlog | applicationEmail + kepAddress hâlâ yer tutucu — kanal olmadan KVKK defteri çalış | OPS | 4 | 2026-09-07 |

**Satış kipi (şirket sonrası)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-47 | Backlog | Kargo ücreti: sepet+checkout sabit "Ücretsiz" | URUN | 2 | 2026-09-07 |
| REC-48 | Backlog | Fatura belgesi üretilmiyor (e-arşiv taahhüdü açıkta) | URUN | 2 | 2026-09-07 |
| REC-49 | Backlog | Admin UX elden geçirme — kalan fazlar | URUN | 3 | 2026-09-03 |
| REC-55 | Backlog | Satınalma modülü — v1 tamam, karne + v2 kalemleri açık | OPS | 3 | 2026-09-07 |
| REC-57 | Backlog | LANSMAN ENGELİ: iyzico-refund müşteri self-iadesi | URUN | 1 | 2026-09-07 |
| REC-73 | Backlog | Ödeme & Finans açık işleri (registry taşıması) | OPS | 0 | 2026-09-07 |
| REC-75 | Backlog | ERP & Admin açık işleri (registry taşıması) | OPS | 0 | 2026-09-07 |

**Teklif kipi**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-117 | Backlog | Misafir teklif akışı: teklif için üyelik zorunluluğu kalkıyor (Recep kararı) — a | Recep kapısı, URUN | 2 | 2026-09-07 |

<details><summary>Done (4)</summary>

- REC-36 · PR #806 — Defter ADIM-1 GENİŞLET (MIGRATION — merge yalnız Recep) · 2026-08-27
- REC-40 · PR #805 — Defter cetveli §6: "aynı PR" dağıtım garantisi değil, genişlet-daralt  · 2026-08-27
- REC-54 · Teklif/RFQ modülü — v1 canlı, v2 uygulama açık · 2026-08-28
- REC-112 · Google ile giriş kırık: "Error 401: deleted_client" — OAuth client Google tarafı · 2026-09-01

</details>

### Vitrin 15A Yeniden Tasarım (DESIGN-MENU)

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-148 | Backlog | Vitrin vaat envanteri ve mükerrer girişler — ölçülmüş bulgu listesi | URUN | 3 | 2026-09-07 |
| REC-150 | Backlog | Çift title: Seo bileşeni ile App Router metadata tek yazıcıya iner (generateMeta | URUN | 2 | 2026-09-07 |
| REC-152 | Backlog | Sorular — DESIGN-MENU (sürekli açık soru/öneri kaydı) | DESIGN, OPS | 0 | 2026-09-07 |
| REC-165 | Backlog | Tasarım→Kod Faz 2+3: DS token köprüsü (57 token → index.css türev + tailwind eşl | URUN | 2 | 2026-09-07 |
| REC-169 | Backlog | URUN: Satış kipinin GÖRÜNEN YÜZÜ — kapalı/açık metinleri, sepet ve PDP vaat satı | URUN | 3 | 2026-09-06 · BEKLİYOR: REC-168 |
| REC-171 | Backlog | URUN + KATALOG: Ürün Seçici kural tablosu v2 — kişi başına debi (ASHRAE 62.1), S | URUN | 4 | 2026-09-07 |
| REC-195 | Backlog | URUN (K4 Vitrin): menü/kategori NEGATİF LİSTE kapısı — Atıksu Arıtma ve Hava Arı | URUN | 3 | 2026-09-07 |
| REC-196 | Backlog | URUN (K5+K38): kiremit/düğme disiplini konformans kapısı — sayfada tek dolu kire | URUN | 3 | 2026-09-07 |
| REC-197 | Backlog | URUN (K10): karşılaştırma ekranı (≤4 model, farklı değer vurgulu, Ekran 11) + li | URUN | 3 | 2026-09-07 |
| REC-198 | Backlog | URUN (K18/K18-c/K24/K37/K37-a): Ürün Seçici üretim entegrasyonu — A+C motoru `se | DESIGN, URUN | 2 | 2026-09-07 |
| REC-199 | Backlog | URUN (K19): mobil kabuk v2 kodlaması — 4 sekme alt çubuk + İletişim header simge | URUN | 3 | 2026-09-07 |
| REC-200 | Backlog | URUN (K21): "örnek ürün değişirse her şey veriden" konformans kapısı — PDP kimli | URUN | 3 | 2026-09-07 |
| REC-203 | In Review | URUN: INV-TOKEN-SINIF-1 fail-open çıktı — sabotajla ölçüldü, boşluk muhafızı ekl | URUN | 3 | 2026-09-07 |

**Faz 1 — Kabuk**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-89 | Backlog | Mobil vitrin kusurları: hero buton metinleri görünmüyor + PDP scroll'da görsel/m | URUN | 0 | 2026-09-07 |
| REC-125 | Backlog | Consul bot bulguları: hardcoded TR literal → sözlük — SecurityRibbon, OrderSumma | URUN | 0 | 2026-09-07 |

**Faz 2 — Ana Sayfa, Menü ve Adresler**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-59 | Backlog | SSG/ISR Dalga-2: 4 ana rota gerçekten statik olsun + SSR kapısı CI'a | URUN | 2 | 2026-09-07 |
| REC-61 | Backlog | Sayfa görselleri Gemini üretim hattı — hava perdesi şablonundaki gibi | URUN | 3 | 2026-09-07 |
| REC-72 | Backlog | Vitrin & Ürün açık işleri (registry taşıması) | OPS | 0 | 2026-09-07 |
| REC-92 | Backlog | Ana sayfa ticari blokları veri-dayanaksız: "Çok Satanlar" uydurma dilim + görsel | URUN | 2 | 2026-09-03 |
| REC-93 | Backlog | Site geneli dekoratif görsel–başlık uyum envanteri (ürün görselleri HARİÇ) | URUN | 3 | 2026-09-03 |
| REC-94 | Backlog | Ana sayfa yeniden tasarımı — tam kapsamlı tarama + tasarım programı (Faz B yüzey | URUN | 2 | 2026-09-07 |
| REC-99 | Backlog | Sayfa iki aşamada yükleniyor: sunucu kategoriyi göremiyor, arayüz açıldıktan son | URUN | 0 | 2026-09-03 |
| REC-106 | Backlog | DEĞERLENDİRME: Sayfa kompozisyon mimarisi — "Lego + SSOT" hedefine mesafe ve 15A | OPS | 2 | 2026-09-05 |
| REC-123 | Backlog | Arama/filtre eşleşmesi ham TR ad üzerinden — EN yazan müşteri eşleşmez (iki işte | URUN | 0 | 2026-09-07 |
| REC-128 | Backlog | Ana sayfa /tr ve /en DİNAMİK render: Cache-Control no-store + X-Vercel-Cache MIS | URUN | 0 | 2026-09-07 |

**Faz 3 — Ürün Sayfası ve Kartlar**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-65 | Backlog | Ürün kartı + PDP fiyat/teknik özellik düzeni revizyonu | URUN | 2 | 2026-09-07 |
| REC-95 | Backlog | Ürün özelliği katmanı: ATEX / mini aksiyel / asit dayanımlı kategori DEĞİL — roz | URUN | 3 | 2026-09-07 |

**Faz 4 — Teklif Listesi ve Hesap**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-116 | Backlog | Kayıt sayfası revizyonu: Google-ile-kayıt YOK (girişte var, kayıtta yok) + tasar | URUN | 3 | 2026-09-07 |

**Tasarım Onayı**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-129 | Backlog | Kimlik + vitrin yeniden tasarımı — tek dil, fazlı üretim (logo/palet/ikon KAPALI | OPS | 2 | 2026-09-07 |

<details><summary>Done (15)</summary>

- REC-79 · Arama önerileri UUID'li dilsiz URL üretiyor — tıklanan öneri ölü sayfaya gidiyor · 2026-08-27
- REC-80 · İletişim formu hiçbir şey kaydetmiyor — sahte başarı ekranı (KVKK riski) · 2026-08-27
- REC-81 · Alt kategorisiz showcase sayfası hiçbir ürün göstermiyor — 27 ürün erişilemez · 2026-08-26
- REC-85 · Sessiz kanal fanı anlatısı migration sonrası hiç açılmıyor (CategoryLandingView) · 2026-08-28
- REC-97 · PDP fiyat sızıntısı: teklif-modlu üründe statik HTML fiyat basıyor, istemci sonr · 2026-09-02
- REC-98 · Marka sayfası i18n karışımı: /en/brands/avens EN sayfada TR içerik (karma sözlük · 2026-09-02
- REC-101 · Ana sayfadaki Otopark kartı BOŞ sayfaya gidiyor — kart kaldırılacak (kategori pa · 2026-08-31
- REC-103 · EN ana sayfada kategori vitrini TR adlarla — kökten çözüm (ham name render kural · 2026-09-01
- REC-104 · Eski ödeme vaadi kalıntıları: "12 ay taksit", "güvenli ödeme" — site geneli tara · 2026-09-01
- REC-108 · EN sayfalarda TR ürün/aile adı — çeviri DB'de VAR, zincir kopuk (RPC taşımıyor + · 2026-09-01
- REC-110 · Varyant adları için i18n şeması YOK — products.name_i18n kolonu (MIGRATION, Rece · 2026-09-02
- REC-113 · Ters yön i18n taraması: TR sayfalarda EN sızıntısı var mı? (REC-103'ün ayna iddi · 2026-09-01
- REC-114 · Arama önerilerinde ham kategori adı: get_search_suggestions SQL'de c.name basıyo · 2026-09-01
- REC-115 · INV-7 çözücü genişlemesi eski iki ihlali görünür kıldı: CategoryHero + PDP 4. ih · 2026-09-02
- REC-147 · DEĞERLENDİRME: Tasarım yetenek (skill) envanteri — 31 dış yetenek kuruldu, bizde · 2026-09-07

</details>

## §4 BAYAT AÇIK İŞLER (started/unstarted, updatedAt > 7 gün)

(yok)

## §5 Ölçüm satırı

çağrı 3 · kayıt 203 · proje 9 · etiket 10 · bayat açık 0/31 · damga 2026-09-07T09:36:47Z

