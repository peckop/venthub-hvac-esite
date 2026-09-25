<!-- uretilmis: Linear GraphQL disa aktarimi (scripts/nlm/linear_disa_aktar.py) · damga 2026-09-25T17:58:56Z · elle duzenlenmez; yenileme: gun kapanisi ritueli -->
# Linear İş Dağılımı — Şantiye Durumu (2026-09-25)

**Damga:** 2026-09-25T17:58:56Z · **Kaynak:** Linear GraphQL `issues` (sayfalama 4 çağrı) · **Toplam iş:** 397

> Okuma kılavuzu: her proje bir kat, her kilometre taşı bir dükkân sırası, her iş bir dükkân. **% bitti = Done / (Toplam − Canceled)**. Sorumluluk = şerit etiketi (assignee alanı çoğunlukla boş).

Durum dağılımı: Done 125 · In Progress 65 · Todo/Backlog 180 · Canceled 23 → **genel % bitti 33%**

## §1 ÖZET — proje başına

| Proje | Toplam | Done | In Progress | Todo/Backlog | Canceled | % bitti |
|---|---:|---:|---:|---:|---:|---:|
| (projesiz) | 27 | 3 | 11 | 7 | 6 | 14% |
| Altyapı, Kapılar ve Belge Hattı | 177 | 59 | 27 | 83 | 7 | 35% |
| Katalog ve Ürün Verisi | 44 | 10 | 10 | 22 | 1 | 23% |
| Kurumsal Belgeler (DESIGN-BELGE) | 2 | 0 | 0 | 2 | 0 | 0% |
| Marka Kılavuzu (DESIGN-MARKA) | 3 | 0 | 0 | 3 | 0 | 0% |
| Q-Validator | 28 | 20 | 0 | 0 | 8 | 100% |
| SEO ve Yayın | 13 | 6 | 5 | 1 | 1 | 50% |
| Teklif Akışı ve Müşteri Paneli | 35 | 6 | 4 | 25 | 0 | 17% |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | 68 | 21 | 8 | 37 | 0 | 31% |
| **TOPLAM** | 397 | 125 | 65 | 180 | 23 | 33% |

## §2 ŞERİT (etiket) başına

| Etiket | Toplam | Done | In Progress | Todo/Backlog | % bitti |
|---|---:|---:|---:|---:|---:|
| ALTYAPI | 108 | 29 | 18 | 58 | 28% |
| DESIGN | 6 | 0 | 0 | 6 | 0% |
| OPS | 56 | 16 | 3 | 29 | 33% |
| P01-Data | 4 | 3 | 0 | 0 | 100% |
| P02-Constraint | 6 | 6 | 0 | 0 | 100% |
| P03-API | 3 | 0 | 0 | 0 | - |
| P04-Research | 3 | 3 | 0 | 0 | 100% |
| Recep kapısı | 19 | 3 | 5 | 8 | 19% |
| URUN | 114 | 33 | 20 | 58 | 29% |
| URUN-KATALOG | 20 | 4 | 10 | 5 | 21% |
| (etiketsiz) | 84 | 31 | 15 | 30 | 40% |

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
| REC-140 | In Review | (ALTYAPI) anon rolüne tablo düzeyinde yazma GRANT'ları — derinlik savunması yok, | ALTYAPI | 3 | 2026-09-25 |
| REC-269 | In Review | URUN (SEO ölçümü): Search Console + 3 aile PDP yapısal veri taraması — 8 günlük  | URUN | 0 | 2026-09-08 |
| REC-271 | In Review | FİLO: kararla kod arasında kapı yok — 57 karar ölçüldü, 14'ü numarasız, 3 numara | URUN | 2 | 2026-09-07 |
| REC-272 | In Review | URUN: uydurma kod SLUG'da da var — adres kararı + yönlendirme (VRT-16076..16080) | URUN | 3 | 2026-09-07 |
| REC-275 | In Review | KATALOG: kodsuz ürün yükleme hattından GEÇEMİYOR — cetvelin kaçış valfi araçta y | URUN-KATALOG | 2 | 2026-09-22 |
| REC-276 | Canceled | OPS: Linear kayıt sınırı ölçüm kaydı — arşiv sonrası deneme (Canceled'a çekilece | OPS | 0 | 2026-09-07 |
| REC-283 | Backlog | URUN (ölçüm): pasif kategori vitrini KAPATMIYOR — is_active=false sayfa açık, di | URUN | 0 | 2026-09-08 |
| REC-285 | In Review | URUN: altbilgideki DÖRT sosyal bağlantı bizim değil, platformların ana sayfasına | URUN | 0 | 2026-09-24 |
| REC-294 | Backlog | rate_limits tablosunda HAM IP süresiz saklanıyor — KVKK: IP kişisel veridir, tem | ALTYAPI | 3 | 2026-09-23 |
| REC-295 | In Review | Teklif yazımı iki ayrı INSERT — transaction yok; kalem yazımı düşerse admin kuyr | URUN | 3 | 2026-09-24 |
| REC-359 | In Review | ALTYAPI (Recep ilkesi 2026-09-19): sürüm/bağımlılık kararları ÇAPALANIR ve BAYAT | ALTYAPI | 2 | 2026-09-21 |
| REC-365 | Backlog | OPS: YÖNETİM PANELİ KIYAS DENETİMİ — bizimki ↔ Medusa + Saleor (kod) + Shopify ( | - | 3 | 2026-09-21 |
| REC-369 | In Review | İçerik hattı (karar 62): blog/rehber üretimi için yöntem kıyası — Search Console | - | 3 | 2026-09-25 |
| REC-375 | Backlog | ALTYAPI: iki hata sınıfı için EYLEM ANI kapısı — plan dosyası "okunanlar" kapısı | ALTYAPI | 2 | 2026-09-22 |
| REC-379 | Backlog | quote_email_events 'mismatch' satırı hiç yazılmıyor — CHECK yalnız sent/failed | - | 3 | 2026-09-23 |
| REC-380 | In Review | Oturumlu teklif yolu hız sınırsız — her satır info@ + müşteriye e-posta tetikler | - | 2 | 2026-09-23 |
| REC-381 | Backlog | Dal önizlemesi kapanınca: birleşme sonrası üretim dağıtım sonucu izlenmeli + bui | - | 2 | 2026-09-24 |
| REC-382 | In Review | E-posta logosu kırık: tenants.config.brand_logo_url 404 (vercel.app/images/logo. | - | 3 | 2026-09-24 |
| REC-386 | Backlog | Sipariş numarası sayacı kiracısız (order_number_counters PK yalnız gun) — Faz 2  | OPS | 4 | 2026-09-24 |

<details><summary>Done (3)</summary>

- REC-266 · URUN: Kategori kartındaki açıklama paragrafı yalnız hover'da açılıyor — dokunmat · 2026-09-07
- REC-270 · URUN (K3): kategori adresinden /category/ kalkacaktı — karar 4 gündür kodda yok, · 2026-09-11
- REC-280 · ALTYAPI: MEMORY.md ortak hafıza indeksi — bayt tavanı uyarı kolu (eşik 15800) +  · 2026-09-17

</details>

### Altyapı, Kapılar ve Belge Hattı

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-141 | Backlog | (OPS) Belge çelişki temizliği paketi — 2026-09-04 taraması (13 kalem, sahipli) | OPS | 3 | 2026-09-07 |
| REC-144 | Backlog | INV-DOC-3 v2 — küme master TAZELİK paritesi (ad paritesi yerine); bloklamaz, say | ALTYAPI | 3 | 2026-09-07 |
| REC-160 | Backlog | Satınalma belge kimlikleri: purchase_orders.po_no + goods_receipts.grn_no (K19 k | ALTYAPI | 4 | 2026-09-07 |
| REC-162 | In Review | Vercel günlük derleme sınırı: kapıda "rate limited" kolu = ÖLÇÜLEMEZ (madde 3 dı | ALTYAPI | 2 | 2026-09-07 |
| REC-167 | Backlog | KVKK başvuru kaydı şeması: başvuru no (K19 önek KV), talep metni, ad soyad, tele | ALTYAPI | 4 | 2026-09-06 |
| REC-168 | In Review | ALTYAPI: Satış kipine TEK ANAHTARLA geçiş — hide_price (37 kategori) + NEXT_PUBL | ALTYAPI, Recep kapısı | 3 | 2026-09-24 |
| REC-173 | Canceled | Tasarım arşivi ve taşınabilirlik: 4 Claude Design projesi depoya günlük çekilir, | ALTYAPI, Recep kapısı | 2 | 2026-09-09 |
| REC-177 | In Review | Hafıza kancaları: eylem defteri (mv/rm → state) · soru yönlendirme (hatırlıyor m | ALTYAPI | 2 | 2026-09-07 |
| REC-178 | Backlog | 1000 satır tavanı — sahipsiz 8 kalemin sahip ataması (pricingMaterialize:126 YAZ | OPS | 2 | 2026-09-17 |
| REC-181 | Todo | 20 eksen denetimi 3. koşum (v3): 2. koşumdan beri 466 commit, edge ortak katman  | OPS | 3 | 2026-09-16 |
| REC-182 | In Review | REC-178/URUN: pricingMaterialize.ts:126 refreshCostInBase (YAZMA yolu) + :317 +  | URUN | 2 | 2026-09-24 |
| REC-184 | In Review | REC-178/Katalog: generate-sitemap.mjs (limit 5000, çağıran yok = ÖLÜ ADAY ölçümü | URUN-KATALOG | 3 | 2026-09-22 |
| REC-186 | In Review | URUN (K12): DD ailesi 6N090P → 61090P ad + slug düzeltmesi, eski slug 301, kanon | URUN | 3 | 2026-09-22 |
| REC-187 | Backlog | Gün kapanışı v2: şerit dilim kaydı (DEVAM+ANLAM, numaralı) · iş kalemi sipariş y | OPS | 2 | 2026-09-17 |
| REC-188 | Todo | REC-179/URUN: 11 fail-open konformans kapısına evren muhafızı — 3d-asset-validit | URUN | 2 | 2026-09-07 |
| REC-194 | Canceled | Mekanizma CRON katmanı: Recep 2026-09-06 "cron kurulmasın, irtibat kopuyor, ayrı | OPS, Recep kapısı | 4 | 2026-09-24 |
| REC-201 | Backlog | ALTYAPI (Kurumsal Belgeler K13 + SEO K4): PDF üreticide sayfa no / nakli yekûn f | ALTYAPI | 3 | 2026-09-09 |
| REC-215 | Todo | Ingestor deposu PUBLIC yapılacak (Recep kararı 09-07) — ÖNCE 2 sır rotasyonu: Su | OPS, Recep kapısı | 2 | 2026-09-24 |
| REC-216 | In Review | RLS politika şişmesi (153 katman) — kök sebep 7 izlenmeyen 8-haneli migration +  | ALTYAPI, Recep kapısı | 1 | 2026-09-07 |
| REC-217 | In Review | Vercel önizleme deploy'ları KAPANIR — yalnız master deploy (git.deploymentEnable | ALTYAPI | 2 | 2026-09-08 |
| REC-232 | Backlog | ALTYAPI: 20-madde v2 denetiminin M1-M6 CONFIRMED-MED düzeltmeleri | ALTYAPI | 4 | 2026-09-07 |
| REC-233 | Backlog | ALTYAPI: Güvenlik sertleştirme kalanları (auth/webhook/tenant/rol, %45'te) | ALTYAPI | 4 | 2026-09-07 |
| REC-234 | Backlog | ALTYAPI: enforce_role_change v2 kapsam dışı kalanlar (admin→admin, düşürme gecik | ALTYAPI, Recep kapısı | 4 | 2026-09-07 |
| REC-238 | Backlog | ALTYAPI: registry-sync GitHub merge'lerinde koşmuyor (Action yok) | ALTYAPI | 4 | 2026-09-07 |
| REC-239 | Backlog | ALTYAPI: Master merge dağıtım gözcüsü (READY parite kapısı) | ALTYAPI | 4 | 2026-09-07 |
| REC-240 | Canceled | ALTYAPI: Companion commit borcu temizliği (118 dosya, taşıyıcı kararına bağlı) | ALTYAPI | 4 | 2026-09-24 |
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
| REC-254 | Backlog | ALTYAPI: bağımlılık CVE taraması mekanizması yok (pip-audit/dependabot) | ALTYAPI | 4 | 2026-09-15 |
| REC-255 | Backlog | ALTYAPI: cc_search'e exclude_source_type negatif filtresi | ALTYAPI | 4 | 2026-09-07 |
| REC-256 | Backlog | ALTYAPI: "P02" veri-alım kolon-kayması sınıfı — alan-doğrulama kapısı | ALTYAPI | 4 | 2026-09-07 |
| REC-257 | Backlog | ALTYAPI: I18N atlama-listesi — scripts/board/** + .claude/hooks/** Vercel build- | ALTYAPI | 4 | 2026-09-07 |
| REC-258 | Backlog | ALTYAPI: docs_migrator_lite.py sessizce bayat bırakıyor (kalite eşiği altı) | ALTYAPI | 4 | 2026-09-07 |
| REC-259 | Backlog | ALTYAPI: Companion CR-only round-trip — LF zorunluluğu üretici tarafta | ALTYAPI | 4 | 2026-09-07 |
| REC-260 | Backlog | ALTYAPI: ORION vekil-kanıt damgası — arşivdeki merge/PR-atıflı kapanışlara işare | ALTYAPI | 4 | 2026-09-07 |
| REC-261 | Backlog | ALTYAPI: INV-DOC-4b kapı tasarım onarımı — bayat artefakt vs meşru kaynak değişi | ALTYAPI | 4 | 2026-09-07 |
| REC-262 | Backlog | ALTYAPI: E1 kimlik backfill — 15/24 worktree'de venthub-sid yok | ALTYAPI | 4 | 2026-09-07 |
| REC-263 | Backlog | ALTYAPI: bash-write-guard betik-aracılı yazma körlüğü | ALTYAPI | 4 | 2026-09-08 |
| REC-267 | Todo | ALTYAPI (REC-185 ardılı): araç envanteri elle değil, merge sonrası otomatik üret | ALTYAPI | 3 | 2026-09-25 |
| REC-273 | Backlog | ALTYAPI (REC-179 ardılı): evren muhafızı sınavı KALAN kapılara — 53 sınandı (15  | ALTYAPI | 2 | 2026-09-07 |
| REC-274 | In Review | ALTYAPI: INV-KARAR-KAYIT-1 — karar belgesindeki her başlıkta DURUM satırı zorunl | ALTYAPI | 2 | 2026-09-07 |
| REC-289 | Backlog | Kural 12 ihlali: middleware.ts Edge'de DB sorgusu yapıyor (/products/&lt;UUID&gt | - | 3 | 2026-09-11 |
| REC-290 | In Review | Kapı: ürün ile ailesinin subcategory_id'si ayrışınca KIRMIZI — kategori vitrini  | - | 3 | 2026-09-08 |
| REC-293 | Backlog | ALTYAPI: 6 katalog tablosunda TRUNCATE yetkisi anon/authenticated/service_role r | - | 3 | 2026-09-09 |
| REC-298 | Backlog | ALTYAPI: site_settings değişimi vitrine ULAŞMIYOR — webhook tetiği 0 + handler d | - | 3 | 2026-09-09 |
| REC-299 | Backlog | ALTYAPI: beş kararsız konformans kolu (kanca/pano) — aynı pakette bir koşum kırm | - | 3 | 2026-09-09 |
| REC-309 | Backlog | gstack-2b: sınavdan düşen find-skills tetiği (6/12) + sınavsız 11 .claude skill' | - | 3 | 2026-09-15 |
| REC-310 | In Progress | OPS: gstack BENİMSEME PLANI — kur, gerçek işte yan yana koştur, sayıyla al/bırak | - | 2 | 2026-09-17 |
| REC-311 | Todo | OPS: BİLGİ KATMANI PLANI — codegraph güncelle, graphify dene, Obsidian ile belge | - | 2 | 2026-09-12 |
| REC-312 | Todo | OPS: KEŞİF DÜZENİ — "neler var da bilmiyoruz": ajan hafızası (Obsidian benzeri), | - | 2 | 2026-09-15 |
| REC-313 | In Progress | ALTYAPI (bilgi-katmanı Faz 1): graphify denemesi — kod haritası LLM'siz, 5 sorud | - | 3 | 2026-09-17 |
| REC-316 | Todo | ALTYAPI (deneme-2): gitleaks — PUBLIC repoda sır taraması; mevcut 18 imzalı beti | - | 2 | 2026-09-13 |
| REC-317 | Todo | URUN (deneme-3): linkinator + unlighthouse — K3-b adres yayını sonrası site gene | - | 2 | 2026-09-12 |
| REC-318 | In Progress | OPS: DENEME PROGRAMI 2026-09-12 — 12 deneme kaleminin tek sırası (üst kayıt; hiç | - | 1 | 2026-09-21 |
| REC-321 | In Review | ALTYAPI: depoda geçersiz SQL taşıyan altı ölü migration dosyası — beşi `CREATE P | - | 3 | 2026-09-15 |
| REC-324 | Duplicate | ALTYAPI: sentry + postcss zinciri güvenlik yükseltmesi (5 paket, 23 high'ın kala | - | 3 | 2026-09-15 |
| REC-325 | Backlog | ALTYAPI: commit uyarı kancası cetvel sınıfında YAPISAL yanlış pozitif veriyor | - | 3 | 2026-09-16 |
| REC-326 | In Review | ALTYAPI: kalan bağımlılık açıkları — @sentry/nextjs ve postcss zincirleri (brace | - | 3 | 2026-09-15 |
| REC-329 | In Review | ALTYAPI: Linear yeni-yorum sayacı kancası — UserPromptSubmit'te "son okumadan be | - | 2 | 2026-09-15 |
| REC-332 | Backlog | ALTYAPI: @sentry/nextjs MAJOR yükseltmesi (9.x/10.x) — tek gerçek runtime bulgu  | - | 3 | 2026-09-19 |
| REC-337 | Backlog | ALTYAPI: dış güvenlik taraması (OWASP ZAP pasif baseline) — venthub.com.tr; açıl | - | 3 | 2026-09-14 |
| REC-342 | In Review | ALTYAPI: DEFTER BAYATLIK KAPISI — OPS açılış satırında "defter son eşitleme N gü | ALTYAPI | 2 | 2026-09-19 |
| REC-343 | Backlog | ALTYAPI: TÜRKÇE KÜÇÜLTME KÖRLÜĞÜ TARAMASI — toLocaleLowerCase('tr') büyük I'yı ı | ALTYAPI | 3 | 2026-09-16 |
| REC-344 | Backlog | ALTYAPI: KIRIK İŞARETÇİ TARAMASI — ilan/JSON dosyalarında yol gösteren her alan  | ALTYAPI | 3 | 2026-09-16 |
| REC-345 | In Review | ALTYAPI + OPS: BAĞIMLILIK GÜNCELLİĞİ PROGRAMI (çatı) — 66 güncel olmayan paket,  | ALTYAPI | 2 | 2026-09-25 |
| REC-349 | Backlog | ALTYAPI (Recep karar 15): Agent-Reach DAR KAPSAM kurulumu — yalnız X + Reddit +  | ALTYAPI | 3 | 2026-09-15 |
| REC-350 | Backlog | ALTYAPI (Recep 09-15 "bizde var iddiası objektif değil, haftaya unutmayacak mıyı | ALTYAPI | 3 | 2026-09-16 |
| REC-351 | In Review | ALTYAPI (REC-336 ardılı): ŞEMA TABANI TAZELİK SATIRI — en yeni baseline'ın yaşı  | ALTYAPI | 4 | 2026-09-18 |
| REC-352 | In Review | ALTYAPI (Recep 09-15 "bu önemli, çözüm ne"): MİGRATION ZİNCİRİNE YENİ SIFIR NOKT | ALTYAPI | 2 | 2026-09-16 |
| REC-353 | In Review | ALTYAPI: Gemini + Jules düzeneğini TAMAMEN KALDIR (Recep 09-17: "evet temizle de | ALTYAPI | 2 | 2026-09-17 |
| REC-354 | Backlog | URUN: shadcn/ui yapılandırması cetvellerle ters — components.json rsc:false + cs | URUN | 4 | 2026-09-16 |
| REC-355 | In Review | ALTYAPI (security-check v3 güvenlik koşumu, 2026-09-16): 11 CONFIRMED — 1 CRITIC | ALTYAPI | 1 | 2026-09-24 |
| REC-356 | Canceled | ALTYAPI (karar 33, Recep 09-16): MIGRATION MERGE KAPISI SINIFLI — ekleme sınıfı  | ALTYAPI | 2 | 2026-09-24 |
| REC-358 | Backlog | ALTYAPI: venthub.com.tr'den ödeme/kupon/admin Edge çağrıları 403 forbidden_origi | - | 1 | 2026-09-17 |
| REC-360 | Backlog | ALTYAPI: şema grafı aşama 2 — fonksiyon çağrı grafiği + rol yetkisi (EXECUTE) | ALTYAPI | 3 | 2026-09-21 |
| REC-361 | Backlog | ALTYAPI: kanıt avı — investigate skill'ine "önce başarısız test" şartı (tek tur  | ALTYAPI | 4 | 2026-09-21 |
| REC-362 | Backlog | ALTYAPI: kod iskeleti (gövdesiz özet) — @wrongstack/tools sarmalayıcısı; ÖNCE 5  | ALTYAPI | 4 | 2026-09-21 |
| REC-364 | Backlog | URUN + ALTYAPI: Next.js 15 → 16 GÖÇÜ (bot #1279 ana sürüm; gevşetme değil göç) | ALTYAPI | 3 | 2026-09-21 |
| REC-366 | Backlog | ALTYAPI: sage sözcük araması — 09-18 "anlamca 6/10" ile 09-22 "7/8" farkının seb | ALTYAPI | 4 | 2026-09-22 |
| REC-367 | In Review | ALTYAPI: BARINDIRMA KARARI ÖLÇÜMÜ — Vercel Pro ↔ Cloudflare (Workers/OpenNext) ↔ | ALTYAPI | 2 | 2026-09-22 |
| REC-368 | In Review | E-posta gönderim kimliği: Resend alan adı doğrulanmamış, DMARC yok, bir fonksiyo | ALTYAPI | 3 | 2026-09-24 |
| REC-376 | In Review | ALTYAPI: stok uyarısı her gün 60 sahte "KRİTİK" e-posta — teklif ürünleri evrend | - | 2 | 2026-09-23 |
| REC-377 | Backlog | OPS + KATALOG: Recep'e sunulan onay sayfaları (artifact) Design-Katalog tasarım  | - | 3 | 2026-09-23 |
| REC-378 | Backlog | ALTYAPI: disk temizliği kalanları — uv önbelleği (pencereler kapalıyken), Docker | - | 3 | 2026-09-23 |
| REC-383 | Backlog | KATALOG: maliyet/liste alanlarına yazan betik ve SQL paketlerini product_costs'a | URUN-KATALOG | 0 | 2026-09-24 |
| REC-390 | Backlog | ARAÇ: sage geri bulma farkı — 09-18 "anlamca 6/10" ile 09-22 "sözcük araması 7/8 | - | 4 | 2026-09-25 |
| REC-391 | Todo | ARAÇ: WrongStack üretici geri bildirim listesi (Ersin'e iletilecek) — kanban, ma | - | 3 | 2026-09-25 |
| REC-394 | In Progress | ARAÇ: prompt denetimi 2026-09-25 — bulgu ilerleme tablosu (B/C/D, 65 bulgu + ekl | - | 2 | 2026-09-25 |
| REC-396 | Backlog | Migration yazarının yerel araç eksikleri: squawk yok, gölge DB'de pg_net/vault/a | - | 3 | 2026-09-25 |
| REC-399 | Backlog | kanca-defter-tazelik BÜTÇE kolu makine yükünde kırmızı — tavan mı gevşemeli, ölç | - | 4 | 2026-09-25 |

**Belge hattı**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-64 | Backlog | İkiz taraması: 20 aday eksik — koda karşı doğrula, haritaya işle | OPS | 3 | 2026-09-07 |
| REC-67 | Canceled | Companion üreteci taşıyıcısı — mimo üyeliği iptal, 28'inden sonra Haiku masada | OPS | 3 | 2026-09-24 |
| REC-84 | Canceled | Belge Tazeleme — companion + master MD + NLM ikizi, SIFIRLANANA KADAR | OPS | 0 | 2026-09-23 |
| REC-102 | Backlog | Orion companion üreteci: 3 kalem — çıkış kodu dürüstlüğü, defter/batch yolu, mut | ALTYAPI | 3 | 2026-09-07 |

**Kapı kör kolları**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-51 | Canceled | Supabase "leaked password protection" AÇ | OPS, Recep kapısı | 2 | 2026-09-07 |
| REC-52 | Backlog | whsec_ webhook secret rotasyonu (repo PUBLIC) | ALTYAPI, Recep kapısı | 2 | 2026-09-08 |
| REC-58 | Backlog | Onaysız tehlikeli butonlar: tekil iade + tekil rol değişikliği | ALTYAPI | 1 | 2026-09-07 |
| REC-119 | Backlog | Sistematik ölü kod temizliği: knip 30 dosya + 67 export — CodeGraph çapraz doğru | ALTYAPI | 3 | 2026-09-07 |
| REC-121 | In Review | Tip-drift kapısı: migration inince database.types.ts canlı şemayla senkron mu —  | ALTYAPI | 0 | 2026-09-18 |
| REC-133 | Backlog | Ölü anahtar kapısı: bileşene devredilen sözlük alt ağacı (dictionary={dict.home} | URUN | 4 | 2026-09-07 |
| REC-137 | Backlog | İLAN EDİLMEMİŞ KAYNAK hiçbir kapının evreninde değil — REC-132 bu pencereyi UZAT | ALTYAPI | 3 | 2026-09-03 |

**Orion köprüsü ve filo mekanizması**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-70 | Backlog | T019 — 21 zaman-aşımısız dış çağrıya bütçe + AST konformans kapısı | ALTYAPI | 0 | 2026-09-07 |
| REC-71 | Backlog | T018 — Köprü içe alma açıklığı: 129 raporlandı / 126 oluştu | ALTYAPI | 0 | 2026-09-07 |
| REC-78 | Backlog | Sayaç üçlüsü: atılan ölçümleri yakala (T018 ardılı) | ALTYAPI | 0 | 2026-09-07 |
| REC-82 | Backlog | Pano v2: adresli görünürlük — yetkisiz oturum panonun tamamını görmez | ALTYAPI | 2 | 2026-09-03 |
| REC-107 | Backlog | Hijyen: ortak depoda 36 worktree + 83 stash birikti — envanter ve bilinçli temiz | OPS | 4 | 2026-09-14 |
| REC-126 | Backlog | Jules Darwin/Bolt önerileri — kapatılan #879/#878'in fikir kaydı (atama değil, d | OPS | 0 | 2026-09-07 |

<details><summary>Done (59)</summary>

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
- REC-69 · T021 — Üretilen belge tazelik kapıları, venthub ayağı (Kapı A + Kapı C + cetvel) · 2026-09-23
- REC-74 · Güvenlik açık işleri (registry taşıması) · 2026-09-07
- REC-76 · Altyapı & Araç açık işleri (registry taşıması) · 2026-09-07
- REC-83 · Companion sembol kaybı — ayrıştırıcı keşfi sembolleri düşürüyor, kalite kapısı k · 2026-08-28
- REC-86 · Ajan hafıza sistemi — araştırma, karar ve Faz 1 (PreCompact kapısı) · 2026-09-23
- REC-87 · Duman dedektörleri Faz-1.5: deploy bekçisi + NLM tazelik bekçisi + rozet bekçisi · 2026-08-30
- REC-118 · PR #640 [BILINCLI-KIRMIZI] INV-DOC-3 yaml-defter paritesi — parkta; silahlandırm · 2026-09-05
- REC-120 · INV-CETVEL-YAPI iki kapsam kusuru: HÜKÜM başlığı dosya-çapında tekil sanılıyor + · 2026-09-07
- REC-130 · Ölçüm komutları çalışma dizinini beyan eder; oturum dizini şerit ağacından ayrış · 2026-09-17
- REC-131 · Merge ritüeli betiği depoya alınır: 5 ölçüm (DIRTY değil · 7 kol listede · düşen · 2026-09-06
- REC-132 · Üretilmiş toplamalar (master md + manifest) özellik PR'larında yol almasın; mast · 2026-09-23
- REC-134 · SSR boş-kabuk kilidi CI'da HİÇ koşmuyor — SMOKE_BASE_URL hiçbir workflow'da tanı · 2026-09-06
- REC-138 · SSR duman kilidi PR KAPISI olarak: CI kendi sunucusunu kaldırır — ama gerçek Sup · 2026-09-23
- REC-142 · Companion sistemi UYKU KİPİ — tek taşıyıcı anahtarı, tüm kapılar say-raporla, ka · 2026-09-23
- REC-158 · Föy PDF'i ile vitrin AYNI biçimlendiriciyi kullansın (INV-FOY-PARITE-1) — öncül  · 2026-09-23
- REC-174 · Model yönlendirme cetvel satırı (WrongStack 2/3): mekanik iş ucuz modele/betiğe, · 2026-09-07
- REC-175 · Tek ekran pano (WrongStack 3/3): gün kapanışı betiği her akşam tek dosya üretir  · 2026-09-25
- REC-176 · venthub-tasarim-dili skill DOĞRULAMA: 14 kural × Kararlar gövdesi × Design dosya · 2026-09-07
- REC-179 · Evren muhafızı sınavı: 53 aday konformans kapısı × sabotaj (evreni daralt, yeşil · 2026-09-07
- REC-180 · Araç envanteri: 27 hook (9'u bağlı) · 119 betik · 64 skill · 5 git kancası · 29  · 2026-09-07
- REC-183 · REC-178/ALTYAPI: supabase/functions order-housekeeping:63 (limit 1000, cron) + s · 2026-09-07
- REC-185 · REC-180/ALTYAPI: araç envanteri KAPISI — scripts/hijyen/arac-envanteri.cjs (fs t · 2026-09-07
- REC-189 · REC-179/ALTYAPI: 3 fail-open kapıya evren muhafızı — pricing-money-append-only · · 2026-09-07
- REC-192 · ALTYAPI: mekanizma teslimat kanıtı "atıldı" ile "ULAŞTI"yı ayırt etmiyor — gözcü · 2026-09-17
- REC-286 · SSR duman alarmı yanlış temsilci seçiyor: "kök kategori" = alfabetik ikinci yol  · 2026-09-08
- REC-287 · Mekanizma probu "bağımsız tanık" değil: jeton hedef dışı her gözcü bildirimine d · 2026-09-17
- REC-292 · ALTYAPI: betikle yapılan doğrudan DB yazımları admin_audit_log'a DÜŞMÜYOR — bugü · 2026-09-09
- REC-296 · ALTYAPI: Edge CORS allowlist'i *.vercel.app son-ekini kabul ediyor — yalnız kend · 2026-09-17
- REC-301 · OPS: gstack (Garry Tan, 23 skill) ile bizim skill/kanca setimizin ÖNYARGISIZ kar · 2026-09-12
- REC-302 · ALTYAPI (gstack-1/6): "İŞİ TAM YAP" ilkesi cetvele — testi erteleme, %90 çözüm s · 2026-09-15
- REC-303 · ALTYAPI (gstack-2/6): 60 evals.json'ı GERÇEKTEN KOŞ — yönlendirme sınavı betiği  · 2026-09-15
- REC-304 · ALTYAPI (gstack-3/6): oturum başı skill yükü ölçümü ve eşiği — .claude 7.4K toke · 2026-09-15
- REC-305 · ALTYAPI (gstack-4/6): skill'lere ortak "Bitiş Durumu + Karışıklık + Kanıtsız Kıs · 2026-09-15
- REC-306 · ALTYAPI (gstack-5/6): testsiz 5 fail-closed kanca — board-release, lane-guard, p · 2026-09-15
- REC-307 · ALTYAPI (gstack-6/6): `investigate` skill'i — kök sebep bulmadan yama YOK, 3 den · 2026-09-15
- REC-308 · ALTYAPI (gstack-5b): bozuk stdin kuralı cetvele — fail-open ama SESSİZ DEĞİL; se · 2026-09-15
- REC-314 · ALTYAPI: ATIL ARAÇ KAPISI — envantere "bağlı adım + son kullanım + sürüm tazeliğ · 2026-09-15
- REC-315 · ALTYAPI (deneme-1): squawk — Postgres migration linter PR kapısı (migration merg · 2026-09-13
- REC-319 · ALTYAPI (deneme-4): Claude Code YERLEŞİK skill sınavı (claude plugin eval) + /sk · 2026-09-13
- REC-320 · OPS: hafıza dizini ÖZEL git deposuna — sürüm geçmişi + yedek (09-07 kırpılma kay · 2026-09-13
- REC-322 · ALTYAPI: jwt_role() uygulama rolu yerine Postgres rolunu okuyor; storage.objects · 2026-09-17
- REC-323 · ALTYAPI: Next.js 15.5.24 güvenlik yükseltmesi (2 CRITICAL) — PLAN · 2026-09-13
- REC-327 · ALTYAPI: Jules workflow'ları (7 dosya) KALDIR — Mart'tan beri 4'ü kırmızı, zaman · 2026-09-17
- REC-328 · ALTYAPI: Gözcü/prob/doğrula üçlüsü KAPATILIYOR — filo doğrudan mesajla çalışır;  · 2026-09-17
- REC-333 · ALTYAPI: ai-auto-repair.yml GitHub'da disabled_manually ama depoda duruyor + ci. · 2026-09-17
- REC-335 · ALTYAPI: products/inventory/stok RPC yetkileri — REC-322 ilanındaki 6 kalemin 3' · 2026-09-14
- REC-336 · ALTYAPI: migration geçmişi prod şemasını YENİDEN ÜRETEMİYOR — client_errors · er · 2026-09-15
- REC-347 · ALTYAPI (gstack Faz 2 çıktısı): plan-challenger'a DÖRT SORU — "bu adım gerekli m · 2026-09-17
- REC-363 · ALTYAPI: LLM / gömme köprüsü — çapalı hafızada Türkçe anlamca arama (A başsız Ha · 2026-09-25

</details>

### Katalog ve Ürün Verisi

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-139 | Backlog | Katalog metin hijyeni ingest kapısı: aynı sınıf kusur temizlenip GERİ GELİYOR (ç | URUN | 4 | 2026-09-04 |
| REC-145 | Backlog | Belge deposu: ürün/aile teknik belgeleri (katalog PDF · veri sayfası · kılavuz · | URUN-KATALOG | 2 | 2026-09-14 |
| REC-146 | In Review | İçerik hattı: 40 aile anlatımı + yapısal altı blok (Gövde·Çark·Motor·Koruma·Kont | URUN-KATALOG | 2 | 2026-09-25 |
| REC-161 | In Review | Kategori açıklaması i18n yolu: metadata.description_i18n {tr,en} + getCategoryDe | URUN | 2 | 2026-09-23 |
| REC-164 | Backlog | Aile sayfasında altı yapısal blok (Gövde · Çark · Motor · Koruma · Kontrol · Mon | URUN | 2 | 2026-09-18 |
| REC-166 | Backlog | Admin kategori formu description_i18n {tr,en} yazamıyor — kategori paragrafları  | URUN | 4 | 2026-09-07 |
| REC-172 | In Review | KATALOG + OPS: Teknik özellik tamamlama hattı — boşluk haritası (aile × alan) →  | URUN-KATALOG | 2 | 2026-09-25 |
| REC-206 | In Review | KATALOG HATTI (çatı): kaynak belge → dizin → teknik/metin/görsel/belge → vitrin  | URUN-KATALOG | 2 | 2026-09-25 |
| REC-208 | Backlog | KOL 3b — Dil yedeklemesi tek kurala insin: aynı sayfada üç farklı fallback çalış | URUN-KATALOG | 3 | 2026-09-07 |
| REC-209 | In Review | KOL 6 — Yükleme yolları + kapılar + KATALOG KARNESİ betiği (en büyük yazıcı test | URUN-KATALOG | 2 | 2026-09-24 |
| REC-211 | Todo | FAZ 4 artığı: yüklenmeyen 16 teknik değer — dört ayrı karar (ağırlık · çelişen g | Recep kapısı, URUN-KATALOG | 3 | 2026-09-22 |
| REC-212 | In Review | TAŞINABİLİR KATALOG YOK: bugün USB/yeni makine ile 375 ürün baştan kurulamıyor — | URUN-KATALOG | 2 | 2026-09-25 |
| REC-214 | Duplicate | Kategori doluluğu hangi sorguyla ölçülür — cetvelde yazılı değil; üç ölçüt üç fa | URUN | 3 | 2026-09-23 |
| REC-264 | Canceled | URUN-KATALOG: İçerik kalite denetimi (spec/açıklama kapsama + PDF-DB örnekleme) | URUN-KATALOG | 4 | 2026-09-22 |
| REC-265 | Backlog | OPS: Admin ürün formu — technical_specs düzenleme UI | OPS | 4 | 2026-09-07 |
| REC-282 | In Review | KATALOG: altı SULU BATARYA ürünü YANLIŞ fotoğrafla satılıyor — ısı geri kazanım  | - | 2 | 2026-09-24 |
| REC-284 | Backlog | KATALOG: kategori görselinin tek bir yolu yok — iki taşıyıcı yan yana, hiçbir ka | - | 3 | 2026-09-08 |
| REC-330 | Backlog | KATALOG: föy boşlukları — 5 kodsuz ürün tek ailede + 7 aile teknik/fiyat sıfır ( | - | 3 | 2026-09-14 |
| REC-331 | Backlog | URUN: `seo_slug` 47 ailenin 39'unda bugünkü slug'dan farklı — marka çift geçişi  | - | 3 | 2026-09-22 |
| REC-334 | Backlog | KATALOG/URUN: kategori ağacında 3 kusur — 2 kök İngilizce adlı ve boş · ATEX alt | - | 2 | 2026-09-14 |
| REC-357 | In Review | KATALOG İÇİN PIM ÇÖZÜMÜ — aday araçlar ölçülür (ilk aday UnoPim, yerel Docker);  | ALTYAPI, URUN-KATALOG | 2 | 2026-09-25 |
| REC-370 | In Review | Üretici ↔ bizim veri fark tablosu (karar 71c) | URUN-KATALOG | 0 | 2026-09-22 |
| REC-374 | Backlog | URUN: marka listesi (src/data/brands.ts) DB ile uyumsuz — "frekans-konvertoru" m | URUN | 3 | 2026-09-22 |
| REC-392 | In Review | Isı geri kazanım (konut) ürünlerinde enerji etiketi + ürün bilgi föyü yok — AB 1 | - | 2 | 2026-09-25 |
| REC-393 | Backlog | MEVZUAT şeridi — kayıt ve takip | - | 3 | 2026-09-25 |
| REC-395 | Todo | Teknik özellik kaynak kapsamı denetimi — 442 ürünün TÜM technical_specs değerler | - | 0 | 2026-09-25 |
| REC-397 | Todo | Satıştaki 10 ürün için üretici "yalnız AB dışı pazar / ErP 2018'e uygun değil" d | - | 2 | 2026-09-25 |

**Görsel tamamlama**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-44 | Backlog | Ürün görseli edinme hattı — 35 ürün kaldı (339/374 tamam) | URUN | 2 | 2026-09-07 |
| REC-91 | Backlog | Görsel hattı gerçek çözümü: ön-üretilmiş boyutlar + bağımsız yedek yol (402 kriz | URUN | 2 | 2026-09-13 |
| REC-96 | Backlog | ADMIN: depo adresi elle kurulan iki kopya — kategori-görsel tek-kaynak desenine  | URUN | 4 | 2026-09-03 |

**İkinci çıkarım turu — SEAT, Nicotra, AVenS**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-60 | Backlog | Kapsama: ~210 eksik kod + sürekli sayım kapısı | URUN | 2 | 2026-09-07 |
| REC-109 | Backlog | 16 ailenin EN adı eksik/sahte (9 hiç yok + 7 en==tr) — çeviri üretimi + Recep iç | URUN | 2 | 2026-09-07 |
| REC-122 | Backlog | EN marka şeridinde "Frekans Konvertörü" marka olarak listeleniyor + 6 marka 3x t | URUN | 2 | 2026-09-07 |
| REC-135 | Todo | Kategori ağacı boşlukları: 10 dalsız ürün + 7 boş alt dal (365/375 zaten dalında | URUN | 2 | 2026-09-23 |

<details><summary>Done (10)</summary>

- REC-39 · PR #803 — Lineo birleşimi sonrası bayat taban temizliği (36→34) · 2026-08-27
- REC-56 · Ürün-katalog hattı — cetveller indi, içerik/derinlik işleri açık · 2026-09-07
- REC-124 · Katalog veri kusurları paketi: "Frenkans"/"Inventoru" yazımları CANLIDA + DAN-80 · 2026-09-23
- REC-136 · Katalog sayımı TEK KAYNAK: sitenin okuduğu yolla sayan betik + günlük tablo; say · 2026-09-23
- REC-155 · CANLI: 126/375 ürün sayfasında "Ürün Açıklaması" altında iç kademe notu görünüyo · 2026-09-07
- REC-157 · Konformans kapısı: aile açıklamasındaki sayısal değer, ailenin ürünlerinden türe · 2026-09-17
- REC-163 · KAYNAK DİZİNİ: tedarikçi PDF'leri bir kez, deterministik, sayfa+tablo düzeyinde  · 2026-09-22
- REC-190 · Katalog: canlıda 38 teknik hücre sayısal anahtarda birim-gömülü metin taşıyor (m · 2026-09-22
- REC-193 · KATALOG: AVE-20150 fiyatı canlıda 0,00 — içe alımda düşen tek satır; yazımı Rece · 2026-09-24
- REC-207 · KOL 1 — Kaynak dizini tazeliği: 36 belge dizin dışında; yeni PDF inince dizin ba · 2026-09-07

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
| REC-149 | Backlog | Projeler arası tasarım ayarı eşitleme — VentHub design system olarak üretilsin,  | DESIGN, OPS | 2 | 2026-09-14 |
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
| REC-191 | In Review | URUN: Adres şeması + kategori ağacı + nitelik katmanı TEK YAYIN — geçiş planı (K | Recep kapısı, URUN | 2 | 2026-09-23 |
| REC-204 | In Review | URUN: İngilizce vitrin GEÇİCİ olarak dizinden çekilir — açılma şartı ölçülebilir | URUN | 2 | 2026-09-07 |
| REC-205 | In Review | URUN: GSC dizinleme kusurları — çift adres kanonikleştirme (34 adres) + giriş sa | URUN | 1 | 2026-09-13 |
| REC-297 | In Review | URUN: kategori sorgusu satırın tamamını çekiyor — emekli marketing_title kolonu  | - | 4 | 2026-09-09 |
| REC-300 | In Review | URUN (K3-b): ADRES YAYINI — Türkçe önek (33×308) + model sayfası -p-<sku> (442 a | URUN | 2 | 2026-09-25 · BEKLİYOR: REC-212 |
| REC-373 | Backlog | URUN: EN sayfalar <html lang="tr"> basıyor — kök layout dili sabit (çoklu kök la | URUN | 3 | 2026-09-22 |

**Bing kökü ve hreflang**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-105 | Canceled | Sitemap /tr/destek ve /en/destek ilan ediyor — ikisi de canlıda 404 | URUN | 3 | 2026-09-03 |

<details><summary>Done (6)</summary>

- REC-50 · venthub.com.tr DNS + kanonik SITE_URL · 2026-09-07
- REC-90 · SEO + dürüstlük gece paketi: 5 PR (#894-#898) — domain açılışı ertesi vitrin kim · 2026-08-30
- REC-100 · SEO: canlıda çift canonical + localhost:3000 — istemci Seo bileşeni yazılı kural · 2026-08-31
- REC-111 · JSON-LD fiyat sızıntısı: 72/80 ürün sayfası Google'a fiyat beyan ediyor (696 ala · 2026-09-01
- REC-127 · Bing kökü dizinleyemiyor: / → /tr 307 GEÇİCİ yönlendirme + hreflang x-default YO · 2026-09-24
- REC-268 · URUN: erişilebilirlik (a11y) — canlı anasayfa 96/100, 3 kırmızı denetim; accessi · 2026-09-17

</details>

### Teklif Akışı ve Müşteri Paneli

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-143 | Backlog | Teklif kalemine seçim kaynağı (tür · girdiler · dayanak) kolonu + quote_no'nun t | OPS | 3 | 2026-09-07 |
| REC-154 | Backlog | E-posta şablonu kod tarafı: sipariş no biçimi e-postada kırpık (#000318 ≠ 2026-0 | URUN | 3 | 2026-09-14 |
| REC-156 | In Review | Sipariş numarası saatten değil günlük sayaçtan üretilsin — generate_order_number | Recep kapısı, URUN | 2 | 2026-09-24 |
| REC-159 | Backlog | İade şeması dar: venthub_returns'e kalem tablosu + refund_amount + return_no (IA | URUN | 3 | 2026-09-06 |
| REC-228 | Backlog | ALTYAPI: Ödeme doğrulama fail-closed — sentetik yoklama + health cron | ALTYAPI | 4 | 2026-09-07 |
| REC-229 | Backlog | ALTYAPI: payment_transactions defteri hiç yazılmıyor | ALTYAPI | 4 | 2026-09-07 |
| REC-230 | Backlog | ALTYAPI: Migration ledger backfill (parça 3) — Recep kapısı | ALTYAPI, Recep kapısı | 4 | 2026-09-07 |
| REC-231 | Backlog | OPS: Fatura karar paketi (mükellefiyet eşiği) — Recep kararı | OPS, Recep kapısı | 4 | 2026-09-07 |
| REC-235 | Backlog | OPS: CRM modül tasarımı (karne v0 var, modül yok) | OPS | 4 | 2026-09-07 |
| REC-236 | Backlog | OPS: Admin ürün listesi görselsiz-ürün filtresi — Recep kapısı | OPS, Recep kapısı | 4 | 2026-09-07 |
| REC-237 | Backlog | OPS: contact_messages sessiz posta kutusu — admin okuma yüzeyi yok | OPS | 4 | 2026-09-07 |
| REC-339 | Backlog | ALTYAPI: teklif SNAPSHOT alanları — venthub_quote_items.product_code + venthub_q | ALTYAPI | 3 | 2026-09-14 |
| REC-385 | Backlog | Teklif webhook: 'mismatch' güvenlik kaydı CHECK'e takılıp yutuluyor (bulgu 7 hiç | OPS | 2 | 2026-09-24 |
| REC-387 | Backlog | Teklif süresi doldu (expired) bildirimi tarayıcıda ve misafire hiç gitmiyor | OPS | 3 | 2026-09-24 |
| REC-388 | Backlog | Teklif PDF'i yok — cetvel §12 "yayım PDF üretir"; misafir kalemleri hiçbir yerde | OPS | 3 | 2026-09-24 |
| REC-389 | Backlog | "Talebiniz alındı" e-postası kimliğin İLK 8 hanesini basıyor; cetvel SON 8 hane  | OPS | 4 | 2026-09-24 |

**Bayi ve segment**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-45 | Backlog | Teklif→Sipariş dönüşüm köprüsü | URUN | 3 | 2026-09-07 |
| REC-46 | Backlog | Bayi segment-atama ekranı | URUN | 3 | 2026-09-07 |
| REC-62 | Backlog | ERP çalışma alanı + CRM nesne katmanı — cetveller yazılı, kod sıfır | OPS | 2 | 2026-09-07 |
| REC-88 | Todo | Açık kaynak CRM/ERP taraması + wacrm incelemesi — karar bekliyor | OPS, Recep kapısı | 0 | 2026-09-25 |

**Proje ve panel**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-43 | Backlog | KVKK: hesap silme/anonimleştirme + veri sahibi talep akışı | URUN | 3 | 2026-09-24 |
| REC-77 | Backlog | applicationEmail + kepAddress hâlâ yer tutucu — kanal olmadan KVKK defteri çalış | OPS | 4 | 2026-09-24 |

**Satış kipi (şirket sonrası)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-47 | Backlog | Kargo ücreti: sepet+checkout sabit "Ücretsiz" | URUN | 2 | 2026-09-07 |
| REC-48 | Backlog | Fatura belgesi üretilmiyor (e-arşiv taahhüdü açıkta) | URUN | 2 | 2026-09-07 |
| REC-49 | Backlog | Admin UX elden geçirme — kalan fazlar | URUN | 3 | 2026-09-23 |
| REC-55 | In Review | Satınalma modülü — v1 tamam, karne + v2 kalemleri açık | OPS | 3 | 2026-09-24 |
| REC-57 | Backlog | LANSMAN ENGELİ: iyzico-refund müşteri self-iadesi | URUN | 1 | 2026-09-07 |

**Teklif kipi**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-54 | In Review | Teklif/RFQ modülü — v1 canlı, v2 uygulama açık | OPS | 2 | 2026-09-24 |
| REC-384 | In Review | Teklif yayımı: müşteri bildirimi + sent_at + quote_no sunucu tarafında (tarayıcı | OPS | 2 | 2026-09-25 |

<details><summary>Done (6)</summary>

- REC-36 · PR #806 — Defter ADIM-1 GENİŞLET (MIGRATION — merge yalnız Recep) · 2026-08-27
- REC-40 · PR #805 — Defter cetveli §6: "aynı PR" dağıtım garantisi değil, genişlet-daralt  · 2026-08-27
- REC-73 · Ödeme & Finans açık işleri (registry taşıması) · 2026-09-07
- REC-75 · ERP & Admin açık işleri (registry taşıması) · 2026-09-07
- REC-112 · Google ile giriş kırık: "Error 401: deleted_client" — OAuth client Google tarafı · 2026-09-01
- REC-117 · Misafir teklif akışı: teklif için üyelik zorunluluğu kalkıyor (Recep kararı) — a · 2026-09-17

</details>

### Vitrin 15A Yeniden Tasarım (DESIGN-MENU)

**(kilometre taşı yok)**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-148 | Backlog | Vitrin vaat envanteri ve mükerrer girişler — ölçülmüş bulgu listesi | URUN | 2 | 2026-09-07 |
| REC-150 | In Review | Çift title: Seo bileşeni ile App Router metadata tek yazıcıya iner (generateMeta | URUN | 2 | 2026-09-24 |
| REC-152 | Backlog | Sorular — DESIGN-MENU (sürekli açık soru/öneri kaydı) | DESIGN, OPS | 0 | 2026-09-07 |
| REC-165 | Backlog | Tasarım→Kod Faz 2+3: DS token köprüsü (57 token → index.css türev + tailwind eşl | URUN | 2 | 2026-09-12 |
| REC-169 | Backlog | URUN: Satış kipinin GÖRÜNEN YÜZÜ — kapalı/açık metinleri, sepet ve PDP vaat satı | URUN | 3 | 2026-09-06 · BEKLİYOR: REC-168 |
| REC-171 | Backlog | URUN + KATALOG: Ürün Seçici kural tablosu v2 — kişi başına debi (ASHRAE 62.1), S | URUN | 4 | 2026-09-15 |
| REC-195 | Backlog | URUN (K4 Vitrin): menü/kategori NEGATİF LİSTE kapısı — Atıksu Arıtma ve Hava Arı | URUN | 3 | 2026-09-14 |
| REC-196 | Backlog | URUN (K5+K38): kiremit/düğme disiplini konformans kapısı — sayfada tek dolu kire | URUN | 3 | 2026-09-07 |
| REC-197 | Backlog | URUN (K10): karşılaştırma ekranı (≤4 model, farklı değer vurgulu, Ekran 11) + li | URUN | 3 | 2026-09-07 |
| REC-198 | Backlog | URUN (K18/K18-c/K24/K37/K37-a): Ürün Seçici üretim entegrasyonu — A+C motoru `se | DESIGN, URUN | 2 | 2026-09-15 |
| REC-199 | In Review | URUN (K19): mobil kabuk v2 kodlaması — 4 sekme alt çubuk + İletişim header simge | URUN | 3 | 2026-09-17 |
| REC-200 | Backlog | URUN (K21): "örnek ürün değişirse her şey veriden" konformans kapısı — PDP kimli | URUN | 3 | 2026-09-07 |
| REC-213 | In Review | URUN (K19): menüde TEK KAPI — "Kategoriler" rayı bırakır, kategoriler "Ürünler"  | URUN | 2 | 2026-09-07 |
| REC-218 | Backlog | URUN-KATALOG: SEAT mega-aile ayrışması → model bazlı aileler (SEO/taksonomi) | URUN-KATALOG | 4 | 2026-09-22 |
| REC-219 | Backlog | URUN: Marka detay sayfası detaylandırma (kategori-gruplu kart, marka hikayesi) | URUN | 4 | 2026-09-07 |
| REC-220 | Backlog | URUN: VariantSelector kademeli eksen seçici | URUN | 4 | 2026-09-07 |
| REC-221 | Backlog | URUN: Landing-first ürün sayfa mimarisi (varyant→landing→kart) | URUN | 4 | 2026-09-07 |
| REC-222 | Backlog | URUN: PageKit storefront göçü | URUN | 4 | 2026-09-07 |
| REC-223 | Backlog | URUN: 3D görsel kalite fazı (ışık rig, framing; %25'te) | URUN | 4 | 2026-09-07 |
| REC-224 | Backlog | URUN: Checkout adres formu il/ilçe SSOT (4 yüzey serbest metin) | URUN | 3 | 2026-09-07 |
| REC-225 | Backlog | URUN: EN sayfada lang="tr" düzeltmesi + name_i18n bağlanması | URUN | 3 | 2026-09-14 |
| REC-226 | In Review | URUN-KATALOG: Katalog içe aktarımı Aşama-2 (74 kayıp + 15 sahte + model_code) | Recep kapısı, URUN-KATALOG | 4 | 2026-09-23 |
| REC-227 | Backlog | URUN: hardcoded slug kalıntıları (URL üretimi SSOT'a taşındı) | URUN | 4 | 2026-09-07 |
| REC-277 | Backlog | URUN: Vitrin 15A kural-tipi kararlar için eksik kapılar — 17 karar (K7 K11 K22 K | URUN | 3 | 2026-09-07 |
| REC-278 | Backlog | K42 uygulaması: Arama sonucu sayfası (ekran 08) | URUN | 3 | 2026-09-07 |
| REC-279 | Backlog | K50 uygulaması: Gözden geçirme v1 kararları — /tr/teklif-listesi adresi, aylık e | URUN | 3 | 2026-09-07 |
| REC-288 | Duplicate | Kategori rotası HİÇ prerender edilmiyor: revalidate=3600 ve ISR vaadi ölü, her i | - | 3 | 2026-09-08 |
| REC-340 | In Review | URUN: ARAMA işlevsiz — Türkçe karakter (unaccent yok) ve yazım hatası (trgm yok) | URUN | 1 | 2026-09-23 |
| REC-341 | Backlog | URUN + OPS: SİTE İÇİ DİL MODELİ ASİSTANI (sohbet · ürün seçim yardımcısı · tekni | URUN | 3 | 2026-09-18 |
| REC-346 | Backlog | URUN: ARAMA metin motoru A/B — pgroonga vs tsvector+unaccent+rum, aynı dokuz vak | URUN | 3 | 2026-09-15 |
| REC-348 | In Review | URUN + ALTYAPI (REC-59 ardılı): ROTA SINIFI KAPSAMI — 49 rota sınıfının 38'i CSR | URUN | 3 | 2026-09-16 |
| REC-398 | Backlog | Mobil hız puanı 0,76 (/tr, PSI) — ayrı iş: teşhis → şablon başına onarım → yenid | - | 2 | 2026-09-25 |

**Faz 1 — Kabuk**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-89 | In Review | Mobil vitrin kusurları: hero buton metinleri görünmüyor + PDP scroll'da görsel/m | URUN | 2 | 2026-09-24 |
| REC-125 | Backlog | Consul bot bulguları: hardcoded TR literal → sözlük — SecurityRibbon, OrderSumma | URUN | 0 | 2026-09-07 |

**Faz 2 — Ana Sayfa, Menü ve Adresler**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-59 | In Review | SSG/ISR Dalga-2: 4 ana rota gerçekten statik olsun + SSR kapısı CI'a | URUN | 2 | 2026-09-22 |
| REC-61 | Backlog | Sayfa görselleri Gemini üretim hattı — hava perdesi şablonundaki gibi | URUN | 3 | 2026-09-07 |
| REC-92 | Backlog | Ana sayfa ticari blokları veri-dayanaksız: "Çok Satanlar" uydurma dilim + görsel | URUN | 2 | 2026-09-03 |
| REC-93 | Backlog | Site geneli dekoratif görsel–başlık uyum envanteri (ürün görselleri HARİÇ) | URUN | 3 | 2026-09-03 |
| REC-94 | Backlog | Ana sayfa yeniden tasarımı — tam kapsamlı tarama + tasarım programı (Faz B yüzey | URUN | 2 | 2026-09-07 |
| REC-99 | Backlog | Sayfa iki aşamada yükleniyor: sunucu kategoriyi göremiyor, arayüz açıldıktan son | URUN | 0 | 2026-09-03 |
| REC-106 | Backlog | DEĞERLENDİRME: Sayfa kompozisyon mimarisi — "Lego + SSOT" hedefine mesafe ve 15A | OPS | 2 | 2026-09-05 |
| REC-123 | Backlog | Arama/filtre eşleşmesi ham TR ad üzerinden — EN yazan müşteri eşleşmez (iki işte | URUN | 0 | 2026-09-07 |
| REC-128 | Backlog | Ana sayfa /tr ve /en DİNAMİK render: Cache-Control no-store + X-Vercel-Cache MIS | URUN | 0 | 2026-09-25 |

**Faz 3 — Ürün Sayfası ve Kartlar**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-65 | Duplicate | Ürün kartı + PDP fiyat/teknik özellik düzeni revizyonu | URUN | 2 | 2026-09-23 |
| REC-95 | Backlog | Ürün özelliği katmanı: ATEX / mini aksiyel / asit dayanımlı kategori DEĞİL — roz | URUN | 3 | 2026-09-23 |

**Faz 4 — Teklif Listesi ve Hesap**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-116 | Backlog | Kayıt sayfası revizyonu: Google-ile-kayıt YOK (girişte var, kayıtta yok) + tasar | URUN | 2 | 2026-09-07 |

**Tasarım Onayı**

| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |
|---|---|---|---|---:|---|
| REC-129 | Backlog | Kimlik + vitrin yeniden tasarımı — tek dil, fazlı üretim (logo/palet/ikon KAPALI | OPS | 2 | 2026-09-23 |

<details><summary>Done (21)</summary>

- REC-72 · Vitrin & Ürün açık işleri (registry taşıması) · 2026-09-07
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
- REC-203 · URUN: INV-TOKEN-SINIF-1 fail-open çıktı — sabotajla ölçüldü, boşluk muhafızı ekl · 2026-09-07
- REC-210 · URUN: Site çatısı (menü + altbilgi) dil sağlayıcısının DIŞINDA — EN sayfada Türk · 2026-09-07
- REC-281 · URUN: Ana sayfa kategori vitrini — mobilde yatay kaydırma karuseli UX gözden geç · 2026-09-17
- REC-291 · URUN: "Alt Ürün Grupları" kartlarında GÖRSEL YOK — bölüm yalnız başlık + metin,  · 2026-09-17
- REC-338 · URUN: /[lang]/products liste sayfasında generateMetadata YOK — canlıda kendi <ti · 2026-09-14

</details>

## §4 BAYAT AÇIK İŞLER (started/unstarted, updatedAt > 7 gün)

| İş | Durum | Başlık | Şerit | Son güncelleme |
|---|---|---|---|---|
| REC-121 | In Review | Tip-drift kapısı: migration inince database.types.ts canlı şemayla senkron mu —  | ALTYAPI | 2026-09-18 |
| REC-162 | In Review | Vercel günlük derleme sınırı: kapıda "rate limited" kolu = ÖLÇÜLEMEZ (madde 3 dı | ALTYAPI | 2026-09-07 |
| REC-177 | In Review | Hafıza kancaları: eylem defteri (mv/rm → state) · soru yönlendirme (hatırlıyor m | ALTYAPI | 2026-09-07 |
| REC-181 | Todo | 20 eksen denetimi 3. koşum (v3): 2. koşumdan beri 466 commit, edge ortak katman  | OPS | 2026-09-16 |
| REC-188 | Todo | REC-179/URUN: 11 fail-open konformans kapısına evren muhafızı — 3d-asset-validit | URUN | 2026-09-07 |
| REC-199 | In Review | URUN (K19): mobil kabuk v2 kodlaması — 4 sekme alt çubuk + İletişim header simge | URUN | 2026-09-17 |
| REC-204 | In Review | URUN: İngilizce vitrin GEÇİCİ olarak dizinden çekilir — açılma şartı ölçülebilir | URUN | 2026-09-07 |
| REC-205 | In Review | URUN: GSC dizinleme kusurları — çift adres kanonikleştirme (34 adres) + giriş sa | URUN | 2026-09-13 |
| REC-213 | In Review | URUN (K19): menüde TEK KAPI — "Kategoriler" rayı bırakır, kategoriler "Ürünler"  | URUN | 2026-09-07 |
| REC-216 | In Review | RLS politika şişmesi (153 katman) — kök sebep 7 izlenmeyen 8-haneli migration +  | ALTYAPI, Recep kapısı | 2026-09-07 |
| REC-217 | In Review | Vercel önizleme deploy'ları KAPANIR — yalnız master deploy (git.deploymentEnable | ALTYAPI | 2026-09-08 |
| REC-269 | In Review | URUN (SEO ölçümü): Search Console + 3 aile PDP yapısal veri taraması — 8 günlük  | URUN | 2026-09-08 |
| REC-271 | In Review | FİLO: kararla kod arasında kapı yok — 57 karar ölçüldü, 14'ü numarasız, 3 numara | URUN | 2026-09-07 |
| REC-272 | In Review | URUN: uydurma kod SLUG'da da var — adres kararı + yönlendirme (VRT-16076..16080) | URUN | 2026-09-07 |
| REC-274 | In Review | ALTYAPI: INV-KARAR-KAYIT-1 — karar belgesindeki her başlıkta DURUM satırı zorunl | ALTYAPI | 2026-09-07 |
| REC-290 | In Review | Kapı: ürün ile ailesinin subcategory_id'si ayrışınca KIRMIZI — kategori vitrini  | - | 2026-09-08 |
| REC-297 | In Review | URUN: kategori sorgusu satırın tamamını çekiyor — emekli marketing_title kolonu  | - | 2026-09-09 |
| REC-310 | In Progress | OPS: gstack BENİMSEME PLANI — kur, gerçek işte yan yana koştur, sayıyla al/bırak | - | 2026-09-17 |
| REC-311 | Todo | OPS: BİLGİ KATMANI PLANI — codegraph güncelle, graphify dene, Obsidian ile belge | - | 2026-09-12 |
| REC-312 | Todo | OPS: KEŞİF DÜZENİ — "neler var da bilmiyoruz": ajan hafızası (Obsidian benzeri), | - | 2026-09-15 |
| REC-313 | In Progress | ALTYAPI (bilgi-katmanı Faz 1): graphify denemesi — kod haritası LLM'siz, 5 sorud | - | 2026-09-17 |
| REC-316 | Todo | ALTYAPI (deneme-2): gitleaks — PUBLIC repoda sır taraması; mevcut 18 imzalı beti | - | 2026-09-13 |
| REC-317 | Todo | URUN (deneme-3): linkinator + unlighthouse — K3-b adres yayını sonrası site gene | - | 2026-09-12 |
| REC-321 | In Review | ALTYAPI: depoda geçersiz SQL taşıyan altı ölü migration dosyası — beşi `CREATE P | - | 2026-09-15 |
| REC-326 | In Review | ALTYAPI: kalan bağımlılık açıkları — @sentry/nextjs ve postcss zincirleri (brace | - | 2026-09-15 |
| REC-329 | In Review | ALTYAPI: Linear yeni-yorum sayacı kancası — UserPromptSubmit'te "son okumadan be | - | 2026-09-15 |
| REC-348 | In Review | URUN + ALTYAPI (REC-59 ardılı): ROTA SINIFI KAPSAMI — 49 rota sınıfının 38'i CSR | URUN | 2026-09-16 |
| REC-351 | In Review | ALTYAPI (REC-336 ardılı): ŞEMA TABANI TAZELİK SATIRI — en yeni baseline'ın yaşı  | ALTYAPI | 2026-09-18 |
| REC-352 | In Review | ALTYAPI (Recep 09-15 "bu önemli, çözüm ne"): MİGRATION ZİNCİRİNE YENİ SIFIR NOKT | ALTYAPI | 2026-09-16 |
| REC-353 | In Review | ALTYAPI: Gemini + Jules düzeneğini TAMAMEN KALDIR (Recep 09-17: "evet temizle de | ALTYAPI | 2026-09-17 |

## §5 Ölçüm satırı

çağrı 4 · kayıt 397 · proje 9 · etiket 10 · bayat açık 30/79 · damga 2026-09-25T17:58:56Z

