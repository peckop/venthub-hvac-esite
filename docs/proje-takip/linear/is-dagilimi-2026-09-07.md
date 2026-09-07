<!-- uretilmis: Linear GraphQL disa aktarimi (scripts/nlm/linear_disa_aktar.py) · damga 2026-09-07T21:02:54Z · elle duzenlenmez; yenileme: gun kapanisi ritueli -->
# Linear İş Dağılımı — Şantiye Durumu (2026-09-07)

**Damga:** 2026-09-07T21:02:54Z · **Kaynak:** Linear GraphQL `issues` (sayfalama 2 çağrı) · **Toplam iş:** 186

> Okuma kılavuzu: her proje bir kat, her kilometre taşı bir dükkân sırası, her iş bir dükkân. **% bitti = Done / (Toplam − Canceled)**. Sorumluluk = şerit etiketi (assignee alanı çoğunlukla boş).

Durum dağılımı: Done 0 · In Progress 29 · Todo/Backlog 157 · Canceled 0 → **genel % bitti 0%**

## §1 ÖZET — proje başına

| Proje | Toplam | Done | In Progress | Todo/Backlog | Canceled | % bitti |
|---|---:|---:|---:|---:|---:|---:|
| (projesiz) | 7 | 0 | 3 | 4 | 0 | 0% |
| Altyapı, Kapılar ve Belge Hattı | 76 | 0 | 14 | 62 | 0 | 0% |
| Katalog ve Ürün Verisi | 28 | 0 | 6 | 22 | 0 | 0% |
| Kurumsal Belgeler (DESIGN-BELGE) | 2 | 0 | 0 | 2 | 0 | 0% |
| Marka Kılavuzu (DESIGN-MARKA) | 3 | 0 | 0 | 3 | 0 | 0% |
| SEO ve Yayın | 5 | 0 | 3 | 2 | 0 | 0% |
| Teklif Akışı ve Müşteri Paneli | 23 | 0 | 1 | 22 | 0 | 0% |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | 42 | 0 | 2 | 40 | 0 | 0% |
| **TOPLAM** | 186 | 0 | 29 | 157 | 0 | 0% |

## §2 ŞERİT (etiket) başına

| Etiket | Toplam | Done | In Progress | Todo/Backlog | % bitti |
|---|---:|---:|---:|---:|---:|
| ALTYAPI | 64 | 0 | 8 | 56 | 0% |
| DESIGN | 6 | 0 | 0 | 6 | 0% |
| OPS | 30 | 0 | 3 | 27 | 0% |
| Recep kapısı | 17 | 0 | 5 | 12 | 0% |
| URUN | 76 | 0 | 11 | 65 | 0% |
| URUN-KATALOG | 16 | 0 | 7 | 9 | 0% |
| (etiketsiz) | 0 | 0 | 0 | 0 | - |

## §3 Proje → kilometre taşı → iş (açık işler; Done ayrı)

### (projesiz)

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-140 | Backlog | (ALTYAPI) anon rolüne tablo düzeyinde yazma GRANT'ları — derinlik savunması yok, | ALTYAPI | 3 | 2026-09-07 |
| REC-269 | Backlog | URUN (SEO ölçümü): Search Console + 3 aile PDP yapısal veri taraması — 8 günlük  | URUN | 0 | 2026-09-07 |
| REC-270 | Backlog | URUN (K3): kategori adresinden /category/ kalkacaktı — karar 4 gündür kodda yok, | URUN | 2 | 2026-09-07 |
| REC-271 | In Review | FİLO: kararla kod arasında kapı yok — 57 karar ölçüldü, 14'ü numarasız, 3 numara | URUN | 2 | 2026-09-07 |
| REC-272 | In Review | URUN: uydurma kod SLUG'da da var — adres kararı + yönlendirme (VRT-16076..16080) | URUN | 3 | 2026-09-07 |
| REC-275 | In Review | KATALOG: kodsuz ürün yükleme hattından GEÇEMİYOR — cetvelin kaçış valfi araçta y | URUN-KATALOG | 2 | 2026-09-07 |
| REC-280 | Backlog | ALTYAPI: MEMORY.md ortak hafıza indeksi — bayt tavanı uyarı kolu (eşik 15800) +  | ALTYAPI | 3 | 2026-09-07 |

### Altyapı, Kapılar ve Belge Hattı

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-141 | Backlog | (OPS) Belge çelişki temizliği paketi — 2026-09-04 taraması (13 kalem, sahipli) | OPS | 3 | 2026-09-07 |
| REC-142 | Backlog | Companion sistemi UYKU KİPİ — tek taşıyıcı anahtarı, tüm kapılar say-raporla, ka | ALTYAPI | 1 | 2026-09-07 |
| REC-144 | Backlog | INV-DOC-3 v2 — küme master TAZELİK paritesi (ad paritesi yerine); bloklamaz, say | ALTYAPI | 3 | 2026-09-07 |
| REC-158 | Backlog | Föy PDF'i ile vitrin AYNI biçimlendiriciyi kullansın (INV-FOY-PARITE-1) — öncül  | ALTYAPI | 3 | 2026-09-07 |
| REC-160 | Backlog | Satınalma belge kimlikleri: purchase_orders.po_no + goods_receipts.grn_no (K19 k | ALTYAPI | 4 | 2026-09-07 |
| REC-162 | In Review | Vercel günlük derleme sınırı: kapıda "rate limited" kolu = ÖLÇÜLEMEZ (madde 3 dı | ALTYAPI | 2 | 2026-09-07 |
| REC-167 | Backlog | KVKK başvuru kaydı şeması: başvuru no (K19 önek KV), talep metni, ad soyad, tele | ALTYAPI | 4 | 2026-09-06 |
| REC-168 | In Review | ALTYAPI: Satış kipine TEK ANAHTARLA geçiş — hide_price (37 kategori) + NEXT_PUBL | ALTYAPI, Recep kapısı | 3 | 2026-09-07 |
| REC-173 | Backlog | Tasarım arşivi ve taşınabilirlik: 4 Claude Design projesi depoya günlük çekilir, | ALTYAPI, Recep kapısı | 2 | 2026-09-07 |
| REC-175 | In Progress | Tek ekran pano (WrongStack 3/3): gün kapanışı betiği her akşam tek dosya üretir  | OPS | 3 | 2026-09-06 · BEKLİYOR: REC-141 |
| REC-177 | In Review | Hafıza kancaları: eylem defteri (mv/rm → state) · soru yönlendirme (hatırlıyor m | ALTYAPI | 2 | 2026-09-07 |
| REC-178 | In Review | 1000 satır tavanı — sahipsiz 8 kalemin sahip ataması (pricingMaterialize:126 YAZ | OPS | 2 | 2026-09-07 |
| REC-181 | Backlog | 20 eksen denetimi 3. koşum (v3): 2. koşumdan beri 466 commit, edge ortak katman  | OPS | 3 | 2026-09-06 |
| REC-182 | In Review | REC-178/URUN: pricingMaterialize.ts:126 refreshCostInBase (YAZMA yolu) + :317 +  | URUN | 2 | 2026-09-07 |
| REC-184 | In Review | REC-178/Katalog: generate-sitemap.mjs (limit 5000, çağıran yok = ÖLÜ ADAY ölçümü | URUN-KATALOG | 3 | 2026-09-07 |
| REC-186 | In Review | URUN (K12): DD ailesi 6N090P → 61090P ad + slug düzeltmesi, eski slug 301, kanon | URUN | 3 | 2026-09-07 |
| REC-187 | In Review | Gün kapanışı v2: şerit dilim kaydı (DEVAM+ANLAM, numaralı) · iş kalemi sipariş y | OPS | 2 | 2026-09-07 |
| REC-192 | In Review | ALTYAPI: mekanizma teslimat kanıtı "atıldı" ile "ULAŞTI"yı ayırt etmiyor — gözcü | ALTYAPI | 2 | 2026-09-07 |
| REC-194 | Backlog | Mekanizma CRON katmanı: Recep 2026-09-06 "cron kurulmasın, irtibat kopuyor, ayrı | OPS, Recep kapısı | 4 | 2026-09-07 |
| REC-201 | Backlog | ALTYAPI (Kurumsal Belgeler K13 + SEO K4): PDF üreticide sayfa no / nakli yekûn f | ALTYAPI | 3 | 2026-09-07 |
| REC-215 | Todo | Ingestor deposu PUBLIC yapılacak (Recep kararı 09-07) — ÖNCE 2 sır rotasyonu: Su | OPS, Recep kapısı | 2 | 2026-09-07 |
| REC-216 | In Review | RLS politika şişmesi (153 katman) — kök sebep 7 izlenmeyen 8-haneli migration +  | ALTYAPI, Recep kapısı | 1 | 2026-09-07 |
| REC-217 | In Progress | Vercel önizleme deploy'ları KAPANIR — yalnız master deploy (git.deploymentEnable | ALTYAPI | 2 | 2026-09-07 |
| REC-232 | Backlog | ALTYAPI: 20-madde v2 denetiminin M1-M6 CONFIRMED-MED düzeltmeleri | ALTYAPI | 4 | 2026-09-07 |
| REC-233 | Backlog | ALTYAPI: Güvenlik sertleştirme kalanları (auth/webhook/tenant/rol, %45'te) | ALTYAPI | 4 | 2026-09-07 |
| REC-234 | Backlog | ALTYAPI: enforce_role_change v2 kapsam dışı kalanlar (admin→admin, düşürme gecik | ALTYAPI, Recep kapısı | 4 | 2026-09-07 |
| REC-238 | Backlog | ALTYAPI: registry-sync GitHub merge'lerinde koşmuyor (Action yok) | ALTYAPI | 4 | 2026-09-07 |
| REC-239 | Backlog | ALTYAPI: Master merge dağıtım gözcüsü (READY parite kapısı) | ALTYAPI | 4 | 2026-09-07 |
| REC-240 | Backlog | ALTYAPI: Companion commit borcu temizliği (118 dosya, taşıyıcı kararına bağlı) | ALTYAPI | 4 | 2026-09-07 |
| REC-241 | Backlog | ALTYAPI: Belgesiz-defter worktree körlüğü (.git dosya, is_dir() False dönüyor) | ALTYAPI | 4 | 2026-09-07 |
| REC-242 | Backlog | ALTYAPI: Ana-dizin kaza önlemi yapısal katman | ALTYAPI | 4 | 2026-09-07 |
| REC-243 | Backlog | ALTYAPI: Araç-zinciri sürüm süpürmesi (ruff/pnpm) | ALTYAPI | 4 | 2026-09-07 |
| REC-244 | Backlog | ALTYAPI: SessionStart bayat-atış raporu kancası | ALTYAPI | 4 | 2026-09-07 |
| REC-245 | Backlog | URUN: HVAC Hesaplama Cetveli (formül/kaynak standardı, 4 motor) | URUN | 4 | 2026-09-07 |
| REC-246 | Backlog | ALTYAPI: orion-cortex server.py hardcoded yollar | ALTYAPI | 4 | 2026-09-07 |
| REC-247 | Backlog | ALTYAPI: orion-cortex DB indeks optimizasyonu | ALTYAPI | 4 | 2026-09-07 |
| REC-248 | Backlog | ALTYAPI: Stratejik triyaj/brifing otomasyonu | ALTYAPI | 4 | 2026-09-07 |
| REC-249 | Backlog | ALTYAPI: F3 dispatcher tam kapsam (%60'ta) | ALTYAPI | 4 | 2026-09-07 |
| REC-250 | Backlog | ALTYAPI: Orion yazım raporu sayaç kırılımı düzeltmesi | ALTYAPI | 4 | 2026-09-07 |
| REC-251 | Backlog | ALTYAPI: orion reposuna minimal CI (ruff+pytest) | ALTYAPI | 4 | 2026-09-07 |
| REC-252 | Backlog | ALTYAPI: orion feature-flag'li/kullanılmayan dosya denetimi | ALTYAPI | 4 | 2026-09-07 |
| REC-253 | Backlog | ALTYAPI: F4 Otonom Fabrika kalanı (%40: Docker Sandbox + Proxy Observatory) | ALTYAPI | 4 | 2026-09-07 |
| REC-254 | Backlog | ALTYAPI: bağımlılık CVE taraması mekanizması yok (pip-audit/dependabot) | ALTYAPI | 4 | 2026-09-07 |
| REC-255 | Backlog | ALTYAPI: cc_search'e exclude_source_type negatif filtresi | ALTYAPI | 4 | 2026-09-07 |
| REC-256 | Backlog | ALTYAPI: "P02" veri-alım kolon-kayması sınıfı — alan-doğrulama kapısı | ALTYAPI | 4 | 2026-09-07 |
| REC-257 | Backlog | ALTYAPI: I18N atlama-listesi — scripts/board/** + .claude/hooks/** Vercel build- | ALTYAPI | 4 | 2026-09-07 |
| REC-258 | Backlog | ALTYAPI: docs_migrator_lite.py sessizce bayat bırakıyor (kalite eşiği altı) | ALTYAPI | 4 | 2026-09-07 |
| REC-259 | Backlog | ALTYAPI: Companion CR-only round-trip — LF zorunluluğu üretici tarafta | ALTYAPI | 4 | 2026-09-07 |
| REC-260 | Backlog | ALTYAPI: ORION vekil-kanıt damgası — arşivdeki merge/PR-atıflı kapanışlara işare | ALTYAPI | 4 | 2026-09-07 |
| REC-261 | Backlog | ALTYAPI: INV-DOC-4b kapı tasarım onarımı — bayat artefakt vs meşru kaynak değişi | ALTYAPI | 4 | 2026-09-07 |
| REC-262 | Backlog | ALTYAPI: E1 kimlik backfill — 15/24 worktree'de venthub-sid yok | ALTYAPI | 4 | 2026-09-07 |
| REC-263 | Backlog | ALTYAPI: bash-write-guard betik-aracılı yazma körlüğü | ALTYAPI | 4 | 2026-09-07 |
| REC-267 | Backlog | ALTYAPI (REC-185 ardılı): araç envanteri elle değil, merge sonrası otomatik üret | ALTYAPI | 3 | 2026-09-07 |
| REC-273 | Backlog | ALTYAPI (REC-179 ardılı): evren muhafızı sınavı KALAN kapılara — 53 sınandı (15  | ALTYAPI | 2 | 2026-09-07 |
| REC-274 | In Review | ALTYAPI: INV-KARAR-KAYIT-1 — karar belgesindeki her başlıkta DURUM satırı zorunl | ALTYAPI | 2 | 2026-09-07 |

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
| REC-52 | Backlog | whsec_ webhook secret rotasyonu (repo PUBLIC) | ALTYAPI, Recep kapısı | 2 | 2026-09-07 |
| REC-58 | Backlog | Onaysız tehlikeli butonlar: tekil iade + tekil rol değişikliği | ALTYAPI | 1 | 2026-09-07 |
| REC-119 | Backlog | Sistematik ölü kod temizliği: knip 30 dosya + 67 export — CodeGraph çapraz doğru | ALTYAPI | 3 | 2026-09-07 |
| REC-121 | Todo | Tip-drift kapısı: migration inince database.types.ts canlı şemayla senkron mu —  | ALTYAPI | 0 | 2026-09-07 |
| REC-130 | In Review | Ölçüm komutları çalışma dizinini beyan eder; oturum dizini şerit ağacından ayrış | ALTYAPI | 2 | 2026-09-07 |
| REC-133 | Backlog | Ölü anahtar kapısı: bileşene devredilen sözlük alt ağacı (dictionary={dict.home} | URUN | 4 | 2026-09-07 |
| REC-137 | Backlog | İLAN EDİLMEMİŞ KAYNAK hiçbir kapının evreninde değil — REC-132 bu pencereyi UZAT | ALTYAPI | 3 | 2026-09-03 |
| REC-138 | Backlog | SSR duman kilidi PR KAPISI olarak: CI kendi sunucusunu kaldırır — ama gerçek Sup | ALTYAPI, Recep kapısı | 3 | 2026-09-07 |

**Orion köprüsü ve filo mekanizması**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-70 | Backlog | T019 — 21 zaman-aşımısız dış çağrıya bütçe + AST konformans kapısı | ALTYAPI | 0 | 2026-09-07 |
| REC-71 | Backlog | T018 — Köprü içe alma açıklığı: 129 raporlandı / 126 oluştu | ALTYAPI | 0 | 2026-09-07 |
| REC-78 | Backlog | Sayaç üçlüsü: atılan ölçümleri yakala (T018 ardılı) | ALTYAPI | 0 | 2026-09-07 |
| REC-82 | Backlog | Pano v2: adresli görünürlük — yetkisiz oturum panonun tamamını görmez | ALTYAPI | 2 | 2026-09-03 |
| REC-86 | Backlog | Ajan hafıza sistemi — araştırma, karar ve Faz 1 (PreCompact kapısı) | OPS | 2 | 2026-09-07 |
| REC-107 | Backlog | Hijyen: ortak depoda 36 worktree + 83 stash birikti — envanter ve bilinçli temiz | OPS | 4 | 2026-09-05 |
| REC-126 | Backlog | Jules Darwin/Bolt önerileri — kapatılan #879/#878'in fikir kaydı (atama değil, d | OPS | 0 | 2026-09-07 |

### Katalog ve Ürün Verisi

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-139 | Backlog | Katalog metin hijyeni ingest kapısı: aynı sınıf kusur temizlenip GERİ GELİYOR (ç | URUN | 4 | 2026-09-04 |
| REC-145 | Backlog | Belge deposu: ürün/aile teknik belgeleri (katalog PDF · veri sayfası · kılavuz · | URUN-KATALOG | 2 | 2026-09-07 |
| REC-146 | In Review | İçerik hattı: 40 aile anlatımı + yapısal altı blok (Gövde·Çark·Motor·Koruma·Kont | URUN-KATALOG | 3 | 2026-09-07 |
| REC-157 | In Review | Konformans kapısı: aile açıklamasındaki sayısal değer, ailenin ürünlerinden türe | URUN | 2 | 2026-09-07 |
| REC-161 | In Review | Kategori açıklaması i18n yolu: metadata.description_i18n {tr,en} + getCategoryDe | URUN | 2 | 2026-09-07 |
| REC-163 | Backlog | KAYNAK DİZİNİ: tedarikçi PDF'leri bir kez, deterministik, sayfa+tablo düzeyinde  | URUN-KATALOG | 1 | 2026-09-07 |
| REC-164 | Backlog | Aile sayfasında altı yapısal blok (Gövde · Çark · Motor · Koruma · Kontrol · Mon | URUN | 2 | 2026-09-06 |
| REC-166 | Backlog | Admin kategori formu description_i18n {tr,en} yazamıyor — kategori paragrafları  | URUN | 4 | 2026-09-07 |
| REC-172 | In Review | KATALOG + OPS: Teknik özellik tamamlama hattı — boşluk haritası (aile × alan) →  | URUN-KATALOG | 2 | 2026-09-07 |
| REC-190 | In Review | Katalog: canlıda 38 teknik hücre sayısal anahtarda birim-gömülü metin taşıyor (m | URUN-KATALOG | 3 | 2026-09-07 |
| REC-193 | Backlog | KATALOG: AVE-20150 fiyatı canlıda 0,00 — içe alımda düşen tek satır; yazımı Rece | URUN-KATALOG | 3 | 2026-09-07 |
| REC-206 | Backlog | KATALOG HATTI (çatı): kaynak belge → dizin → teknik/metin/görsel/belge → vitrin  | URUN-KATALOG | 2 | 2026-09-07 |
| REC-208 | Backlog | KOL 3b — Dil yedeklemesi tek kurala insin: aynı sayfada üç farklı fallback çalış | URUN-KATALOG | 3 | 2026-09-07 |
| REC-209 | Backlog | KOL 6 — Yükleme yolları + kapılar + KATALOG KARNESİ betiği (en büyük yazıcı test | URUN-KATALOG | 2 | 2026-09-07 |
| REC-211 | Todo | FAZ 4 artığı: yüklenmeyen 16 teknik değer — dört ayrı karar (ağırlık · çelişen g | Recep kapısı, URUN-KATALOG | 3 | 2026-09-07 |
| REC-212 | In Review | TAŞINABİLİR KATALOG YOK: bugün USB/yeni makine ile 375 ürün baştan kurulamıyor — | URUN-KATALOG | 2 | 2026-09-07 |
| REC-214 | Todo | Kategori doluluğu hangi sorguyla ölçülür — cetvelde yazılı değil; üç ölçüt üç fa | URUN | 3 | 2026-09-07 |
| REC-264 | Backlog | URUN-KATALOG: İçerik kalite denetimi (spec/açıklama kapsama + PDF-DB örnekleme) | URUN-KATALOG | 4 | 2026-09-07 |
| REC-265 | Backlog | OPS: Admin ürün formu — technical_specs düzenleme UI | OPS | 4 | 2026-09-07 |

**Görsel tamamlama**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-44 | Backlog | Ürün görseli edinme hattı — 35 ürün kaldı (339/374 tamam) | URUN | 2 | 2026-09-07 |
| REC-91 | Backlog | Görsel hattı gerçek çözümü: ön-üretilmiş boyutlar + bağımsız yedek yol (402 kriz | URUN | 2 | 2026-09-07 |
| REC-96 | Backlog | ADMIN: depo adresi elle kurulan iki kopya — kategori-görsel tek-kaynak desenine  | URUN | 4 | 2026-09-03 |

**İkinci çıkarım turu — SEAT, Nicotra, AVenS**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-60 | Backlog | Kapsama: ~210 eksik kod + sürekli sayım kapısı | URUN | 2 | 2026-09-07 |
| REC-109 | Backlog | 16 ailenin EN adı eksik/sahte (9 hiç yok + 7 en==tr) — çeviri üretimi + Recep iç | URUN | 2 | 2026-09-07 |
| REC-122 | Backlog | EN marka şeridinde "Frekans Konvertörü" marka olarak listeleniyor + 6 marka 3x t | URUN | 2 | 2026-09-07 |
| REC-124 | Backlog | Katalog veri kusurları paketi: "Frenkans"/"Inventoru" yazımları CANLIDA + DAN-80 | URUN | 2 | 2026-09-07 |
| REC-135 | Todo | Kategori ağacı boşlukları: 10 dalsız ürün + 7 boş alt dal (365/375 zaten dalında | URUN | 2 | 2026-09-07 |
| REC-136 | Backlog | Katalog sayımı TEK KAYNAK: sitenin okuduğu yolla sayan betik + günlük tablo; say | URUN | 2 | 2026-09-07 |

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

### SEO ve Yayın

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-191 | In Review | URUN: Adres şeması + kategori ağacı + nitelik katmanı TEK YAYIN — geçiş planı (K | Recep kapısı, URUN | 2 | 2026-09-07 |
| REC-204 | In Review | URUN: İngilizce vitrin GEÇİCİ olarak dizinden çekilir — açılma şartı ölçülebilir | URUN | 2 | 2026-09-07 |
| REC-205 | In Review | URUN: GSC dizinleme kusurları — çift adres kanonikleştirme (34 adres) + giriş sa | URUN | 1 | 2026-09-07 |
| REC-268 | Backlog | URUN: erişilebilirlik (a11y) — canlı anasayfa 96/100, 3 kırmızı denetim; accessi | URUN | 2 | 2026-09-07 |

**Bing kökü ve hreflang**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-127 | Backlog | Bing kökü dizinleyemiyor: / → /tr 307 GEÇİCİ yönlendirme + hreflang x-default YO | URUN | 2 | 2026-09-07 |

### Teklif Akışı ve Müşteri Paneli

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-143 | Backlog | Teklif kalemine seçim kaynağı (tür · girdiler · dayanak) kolonu + quote_no'nun t | OPS | 3 | 2026-09-07 |
| REC-154 | Backlog | E-posta şablonu kod tarafı: sipariş no biçimi e-postada kırpık (#000318 ≠ 2026-0 | URUN | 3 | 2026-09-07 |
| REC-156 | In Review | Sipariş numarası saatten değil günlük sayaçtan üretilsin — generate_order_number | Recep kapısı, URUN | 2 | 2026-09-07 |
| REC-159 | Backlog | İade şeması dar: venthub_returns'e kalem tablosu + refund_amount + return_no (IA | URUN | 3 | 2026-09-06 |
| REC-228 | Backlog | ALTYAPI: Ödeme doğrulama fail-closed — sentetik yoklama + health cron | ALTYAPI | 4 | 2026-09-07 |
| REC-229 | Backlog | ALTYAPI: payment_transactions defteri hiç yazılmıyor | ALTYAPI | 4 | 2026-09-07 |
| REC-230 | Backlog | ALTYAPI: Migration ledger backfill (parça 3) — Recep kapısı | ALTYAPI, Recep kapısı | 4 | 2026-09-07 |
| REC-231 | Backlog | OPS: Fatura karar paketi (mükellefiyet eşiği) — Recep kararı | OPS, Recep kapısı | 4 | 2026-09-07 |
| REC-235 | Backlog | OPS: CRM modül tasarımı (karne v0 var, modül yok) | OPS | 4 | 2026-09-07 |
| REC-236 | Backlog | OPS: Admin ürün listesi görselsiz-ürün filtresi — Recep kapısı | OPS, Recep kapısı | 4 | 2026-09-07 |
| REC-237 | Backlog | OPS: contact_messages sessiz posta kutusu — admin okuma yüzeyi yok | OPS | 4 | 2026-09-07 |

**Bayi ve segment**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-45 | Backlog | Teklif→Sipariş dönüşüm köprüsü | URUN | 3 | 2026-09-07 |
| REC-46 | Backlog | Bayi segment-atama ekranı | URUN | 3 | 2026-09-07 |
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

**Teklif kipi**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-117 | Backlog | Misafir teklif akışı: teklif için üyelik zorunluluğu kalkıyor (Recep kararı) — a | Recep kapısı, URUN | 2 | 2026-09-07 |

### Vitrin 15A Yeniden Tasarım (DESIGN-MENU)

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-148 | Backlog | Vitrin vaat envanteri ve mükerrer girişler — ölçülmüş bulgu listesi | URUN | 2 | 2026-09-07 |
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
| REC-213 | In Review | URUN (K19): menüde TEK KAPI — "Kategoriler" rayı bırakır, kategoriler "Ürünler"  | URUN | 2 | 2026-09-07 |
| REC-218 | Backlog | URUN-KATALOG: SEAT mega-aile ayrışması → model bazlı aileler (SEO/taksonomi) | URUN-KATALOG | 4 | 2026-09-07 |
| REC-219 | Backlog | URUN: Marka detay sayfası detaylandırma (kategori-gruplu kart, marka hikayesi) | URUN | 4 | 2026-09-07 |
| REC-220 | Backlog | URUN: VariantSelector kademeli eksen seçici | URUN | 4 | 2026-09-07 |
| REC-221 | Backlog | URUN: Landing-first ürün sayfa mimarisi (varyant→landing→kart) | URUN | 4 | 2026-09-07 |
| REC-222 | Backlog | URUN: PageKit storefront göçü | URUN | 4 | 2026-09-07 |
| REC-223 | Backlog | URUN: 3D görsel kalite fazı (ışık rig, framing; %25'te) | URUN | 4 | 2026-09-07 |
| REC-224 | Backlog | URUN: Checkout adres formu il/ilçe SSOT (4 yüzey serbest metin) | URUN | 3 | 2026-09-07 |
| REC-225 | Backlog | URUN: EN sayfada lang="tr" düzeltmesi + name_i18n bağlanması | URUN | 3 | 2026-09-07 |
| REC-226 | In Review | URUN-KATALOG: Katalog içe aktarımı Aşama-2 (74 kayıp + 15 sahte + model_code) | Recep kapısı, URUN-KATALOG | 4 | 2026-09-07 |
| REC-227 | Backlog | URUN: hardcoded slug kalıntıları (URL üretimi SSOT'a taşındı) | URUN | 4 | 2026-09-07 |
| REC-277 | Backlog | URUN: Vitrin 15A kural-tipi kararlar için eksik kapılar — 17 karar (K7 K11 K22 K | URUN | 3 | 2026-09-07 |
| REC-278 | Backlog | K42 uygulaması: Arama sonucu sayfası (ekran 08) | URUN | 3 | 2026-09-07 |
| REC-279 | Backlog | K50 uygulaması: Gözden geçirme v1 kararları — /tr/teklif-listesi adresi, aylık e | URUN | 3 | 2026-09-07 |
| REC-281 | Backlog | URUN: Ana sayfa kategori vitrini — mobilde yatay kaydırma karuseli UX gözden geç | URUN | 3 | 2026-09-07 |

**Faz 1 — Kabuk**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-89 | Backlog | Mobil vitrin kusurları: hero buton metinleri görünmüyor + PDP scroll'da görsel/m | URUN | 2 | 2026-09-07 |
| REC-125 | Backlog | Consul bot bulguları: hardcoded TR literal → sözlük — SecurityRibbon, OrderSumma | URUN | 0 | 2026-09-07 |

**Faz 2 — Ana Sayfa, Menü ve Adresler**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-59 | Backlog | SSG/ISR Dalga-2: 4 ana rota gerçekten statik olsun + SSR kapısı CI'a | URUN | 2 | 2026-09-07 |
| REC-61 | Backlog | Sayfa görselleri Gemini üretim hattı — hava perdesi şablonundaki gibi | URUN | 3 | 2026-09-07 |
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
| REC-116 | Backlog | Kayıt sayfası revizyonu: Google-ile-kayıt YOK (girişte var, kayıtta yok) + tasar | URUN | 2 | 2026-09-07 |

**Tasarım Onayı**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-129 | Backlog | Kimlik + vitrin yeniden tasarımı — tek dil, fazlı üretim (logo/palet/ikon KAPALI | OPS | 2 | 2026-09-07 |

## §4 BAYAT AÇIK İŞLER (started/unstarted, updatedAt > 7 gün)

(yok)

## §5 Ölçüm satırı

çağrı 2 · kayıt 186 · proje 8 · etiket 6 · bayat açık 0/35 · damga 2026-09-07T21:02:54Z

