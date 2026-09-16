# Kaçırma listesi — 2026-08-17 → 2026-09-16 (kod inceleme kıyasının evreni)

**Ne bu:** son 30 günde kapı/inceleme yeşilken gerçek kusur geçen (KAÇIRMA) ya da kapı kırmızıyken kusur olmayan (YANLIŞ ALARM) vakaların kanıtlı listesi. Recep kararı 23 (open-code-review üç kollu kıyas, REC-318 kalem F, Faz 0-b) bu dosyayı ön şart sayar: kıyas evreni = burada **diff: EVET** ve **diff: KISMEN** etiketli vakalar + 4 geçmiş inceleme hatası (CRLF/LF, SSL mode, Türkçe küçültme, kırık işaretçi).

**Nasıl üretildi:** 2026-09-16 sabah 25 ajanlık kıyas koşumunun 'anla:kacirma-listesi' ajanı (Sonnet, salt okuma); kaynaklar hafıza dizini (28 dosya), docs/audits (10), docs/skill-gozlemleri/acik (3), OPS durum dosyası, git log (579 commit) ve 30+ PR gövdesi. Ham çıktı OPS scratchpad `ocr-kiyas-workflow-journal-2026-09-16.jsonl`. Bu dosya o çıktının biçimlendirilmiş hâlidir; metin ajanındır, OPS yalnız sıraladı ve etiketleri saydı.

**Etiket anlamı:** `diff: EVET` = kusur PR diff'inde alan bilgisi gerekmeden görünür (bir LLM inceleyici yakalayabilirdi) · `KISMEN` = diff'te ipucu var ama tam yargı için repo bağlamı/alan bilgisi gerekir · `HAYIR` = diff'te görünmez (canlı ölçüm, veri, zamanlama) — kıyas evrenine GİRMEZ, kapı/ölçüm katmanının işi.

**Sayım:** META (vaka değil, sistem gözlemi): 2 · EVET: 14 · HAYIR: 15 · KISMEN: 19 · toplam 50 · güven dağılımı: BELGEDEN=46, OLCULDU=4

**Ölçülmeyen (ajanın kendi beyanı):** hiçbir vakanın gerçek diff'i henüz bir inceleyiciye KOŞULMADI; etiketler kural metni ve desenden akıl yürütmeyle verildi. Koşum sonuçları ayrı dosyaya (`docs/audits/ocr-kiyas-*.md`) yazılır; bu dosya evren listesidir, sonuç değil.


## Özet tablo

| No | Tarih | Vaka | diff | Güven |
| -- | -- | -- | -- | -- |
| V1 | 09-07 | Ürünler sayfası haftalarca kategorisiz kaldı (REC-94 yan etkisi) | EVET | BELGEDEN |
| V2 | 09-07 | Kategori bloğu DOM'da var, ekranda yok (opacity-0, sağlayıcı taşınmadı) | KISMEN | BELGEDEN |
| V3 | 09-05 | İki hesaplayıcı sayfası Google'a boş göründü (Suspense sayfa kökünde) | KISMEN | BELGEDEN |
| V4 | 09-04 | generateStaticParams hatayı yutuyor → build yeşil, 0 yol | EVET | BELGEDEN |
| V5 | 09-08 | Kategori rotası hiç önceden üretilmiyordu (headers()+searchParams) | KISMEN | BELGEDEN |
| V6 | 09-14 | jwt_role DROP merge oldu, üretilmiş tip dosyası tazelenmedi → 3 PR bloke | EVET | BELGEDEN |
| V7 | 09-14 | DROP POLICY IF EXISTS ×3 var olmayan politikayı sessizce düşürdü | HAYIR | BELGEDEN |
| V8 | 09-13 | Üç SKILL.md bozuk frontmatter ile sessizce boş yükleniyordu; kapılar 10/10 yeşil | EVET | BELGEDEN |
| V9 | 09-13 | Altı ölü migration'da geçersiz `CREATE POLICY IF NOT EXISTS` (11 kez) | KISMEN | BELGEDEN |
| V10 | 09-15 | Şema+veri koşulu+kendi COMMIT tek dosyada → sıfırdan kurulum 25/63 domino | KISMEN | BELGEDEN |
| V11 | 09-13 | 'sharp kullanılmıyor, kaldır' — iki şerit aynı kör grep'le 0 dedi, 8 dinamik import vardı | KISMEN | BELGEDEN |
| V12 | 09-07 | Fan gücü 0.18 W (kW yazılmış): tip/şema/konformans hepsi yeşil, vitrinde bin kat küçük | HAYIR | BELGEDEN |
| V13 | 09-04 | package.json'a mükerrer `test:smoke` anahtarı: ikincisi sessizce öldü | EVET | BELGEDEN |
| V14 | 08-27 | vercel-ignore-build.sh `2>/dev/null || true` ile 10 gün hiç çalışmadı, her push deploy yaktı | EVET | BELGEDEN |
| V15 | 09-08 | vercel.json `"*": false` joker değil; kendi kapısı içeriğe baktı, sonuca değil → 60+ dağıtım, kota doldu | KISMEN | BELGEDEN |
| V16 | 09-07 | Aralık deseni `ile`/`kadar` kelime içinde eşleşti: evrenin %31'i sessizce muaf | KISMEN | BELGEDEN |
| V17 | 09-04 | Dört kapı hedef dala değil dosyadaki ortak dizeye bağlıydı; sabotaj yeşil kaldı | KISMEN | BELGEDEN |
| V18 | 09-07 | 53 kapı × sabotaj: 15 FAIL-OPEN, 2 kapının evreni zaten 0 | KISMEN | BELGEDEN |
| V19 | 09-06 | Fail-open kapı (`if kesin >= 0 and …`) + PostgREST 1000 satır sessiz tavan | EVET | BELGEDEN |
| V20 | 09-07 | Sahte sunucu Content-Range basmıyor, Range'i yok sayıyor: sayfalama aylardır hiç ölçülmemiş | HAYIR | BELGEDEN |
| V21 | 09-09 | Olmayan kategori 200 döndü (soft-404) ve CDN'e yazıldı; preload hata ile yokluğu aynı değere indiriyordu | EVET | BELGEDEN |
| V22 | 08-28 | Politika canlı ama kolon GRANT yok → kimse ulaşamıyor; `revoke from public` anon'u kapatmıyor | KISMEN | BELGEDEN |
| V23 | 08-27 | Migration komşu tablonun kolon adını taşıdı (model_code/metadata), prod koşumu düştü | EVET | BELGEDEN |
| V24 | 08-27 | 'Geri alma' PR'ı (#855) 11 companion'ın 2'sinde içeriği yarıya indirdi, merge oldu | EVET | BELGEDEN |
| V25 | 08-26 | 'PR #680 merge' kanıtıyla kapatılan T104-VH: LeadModal hiçbir yere yazmıyordu, müşteri verisi kayboldu | KISMEN | BELGEDEN |
| V26 | 09-07 | tazelik.py kapısı yazıldı, doğru ölçüyor, fail-closed — ve hiçbir yerden çağrılmıyor | EVET | BELGEDEN |
| V27 | 09-07 | Çıkarım aracı 08-20'de düzeltildi, hiç yeniden koşulmadı; CSV 22 Haziran'da kaldı, 74 ürün 3 hafta eksik | KISMEN | BELGEDEN |
| V28 | 09-08/12 | Yeni dosya eklendi, envanter kapısı yerelde koşulmadı: bir günde 5 şerit aynı kapıya takıldı | EVET | BELGEDEN |
| V29 | 09-15 | İlan dosyası yazılmamış bir ölçüm kaydına işaret ediyordu; 15 kolun hiçbiri varlık ölçmedi (REC-344) | EVET | OLCULDU |
| V30 | 09-01 ve 09-15 | Türkçe küçültme I→ı: kapı İngilizce terimi göremiyor (REC-343); kanca ASCII fikstürle yanlış kırmızı | KISMEN | OLCULDU |
| V31 | 09-16 | .agent manifest bayat → skills:verify 0→25 uyarı gizliydi | KISMEN | BELGEDEN |
| V32 | 09-14 | Linear yorum sayacı 200 + errors yok + nodes [] döndü: 'yeni yorum yok' ile 'sorgu kör' ayrılamıyordu | KISMEN | BELGEDEN |
| V33 | 09-15 | Defter bayatlık kancası vardı, kuruluydu, doğru ölçüyordu — 7 gün kimse görmedi (REC-342) | HAYIR | BELGEDEN |
| V34 | 09-14 | ai-auto-repair zinciri: çağrılıyor, koşuyor, 10 PR açtı — 0/10 merge; envanter üç sorudan geçti | HAYIR | BELGEDEN |
| V35 | 09-07/08 | YANLIŞ ALARM: SSR duman alarmı 15 saat sahte kırmızı (temsilci alfabetik ikinci yol) | KISMEN | BELGEDEN |
| V36 | 09-07 | YANLIŞ ALARM ZİNCİRİ: master 3,5 saat kırmızı (mükerrer '## 6.'), iptal koşular 'yeşil' okundu, tüm açık PR'lar kırmızı | EVET | BELGEDEN |
| V37 | 09-12 | YANLIŞ ALARM: karar-kayit-bagi kapısı K53'ü 8 gün AÇIK saydı, K54 aynı soruyu REC-199'a bağlamıştı | HAYIR | BELGEDEN |
| V38 | 09-14/15 | YANLIŞ ALARM ÜÇLÜSÜ (kapı kendi evrenini yanlış seçti): render-revalidation 00_golge_onsoz.sql·INV-MECH-1 çapasız regex·commit-uyarı kancası tam yol/basename | KISMEN | BELGEDEN |
| V39 | 08-27 | YANLIŞ ALARM: INV-DOC-2 takvimle kırmızıya döndü, suç AUTH'un merge'ine yıkıldı | KISMEN | BELGEDEN |
| V40 | 09-08 | YANLIŞ ALARM (Recep'e gitti): 'site yanlış kategori servis ediyor' — iki farklı /tmp | HAYIR | BELGEDEN |
| V41 | 09-05 | YANLIŞ ALARM (Linear'a iş oldu): '12 aile için kaynak yok, üreticiden metin toplanmalı' — kaynak 74 sayfalık katalogdaydı | HAYIR | BELGEDEN |
| V42 | 09-05 | YANLIŞ ALARM (master'a indi): 'admin koyu tema tokenleri 23/23 tanımsız' — tarayıcı seçici adını varsaymıştı | HAYIR | BELGEDEN |
| V43 | 09-09 | YANLIŞ ALARM (iş emrine döndü): 'catalog-integrity kırmızısı TLS değil gerçek veri ihlali' — ölçüm 1 saat bayattı; üç şerit üç sebep yazdı | HAYIR | BELGEDEN |
| V44 | 09-04 ve 09-16 | YANLIŞ SAYI Recep'e beyan (3 olay): grep -c '3→1 düzeldi'·'analytics betiği canlıda yüklenmiyor'·'441 ürünün 360'ı tek kategoride, veri bozuk' | HAYIR | BELGEDEN |
| V45 | 09-04 | YANLIŞ 'BİTTİ': PR izleyici 'kapılar bitti, düşen 0' dedi; ci hiç koşmamıştı (DIRTY PR, birleşme ref'i yok) | HAYIR | BELGEDEN |
| V46 | 09-06 | KAPI KIRMIZI DEDİ, MERGE OLDU: `ritüel | tail -4 && gh pr merge` çıkış kodunu yuttu (#1027) | HAYIR | BELGEDEN |
| V47 | 09-08/09 | TEST KOŞMADI AMA YEŞİL: `vitest --reporter=basic` Vitest 4'te yok → 0 test, exit 0; 'tüm paket 203/1596' aslında alt küme | HAYIR | BELGEDEN |
| V48 | 09-16 | ÖNLENEN SAHTE ALARM (kontrol örneği): 'products/category HTML yok' — bayat 09-14 derlemesi; taze build 247 HTML | HAYIR | BELGEDEN |
| V49 | META | Kendi diff-review skill'imiz: SKILL.md 8 kural vaat ediyor, betik 7 desen uyguluyor — Suspense kuralı HİÇ YOK (iki ağaçta da) — OLCULDU | META | OLCULDU |
| V50 | META | CI'da otomatik LLM PR incelemesi YOK: Gemini yalnız `@gemini-cli /review` yorumuyla, auto-reviewer yalnız reviewer atar — OLCULDU | META | OLCULDU |

## Vakalar

### V1 · 09-07 · Ürünler sayfası haftalarca kategorisiz kaldı (REC-94 yan etkisi) — diff: EVET

Ne kaçtı: REC-94 3D kategori seçiciyi müşteri yüzeyinden kaldırırken kodda 'yerine gelecek kategori kartları ayrı PR'da' yorumu bırakıldı; o PR hiç gelmedi, /tr/products ham HTML'inde /tr/category bağlantısı 0'a düştü ve hiçbir kapı görmedi. Görmesi gereken katman: REC-94 PR incelemesi (yetenek düşen değişiklik) ve konformans testi. Nasıl yakalandı: URUN şeridinin canlı ham HTML ölçümü (ajan/insan), kapı değil. Diff incelemesi: EVET — silinen bileşen ve ikame vaat eden yorum aynı diff'te; alan bilgisi gerekmez, 'yetenek silindi, ikamesi bu PR'da mı' sorusu yeter.

**Kanıt:** git 387a49eb5 (#1088) gövdesi: 'SEBEBI IHMAL DEGIL, YAN ETKI ... O PR hic gelmedi; arada sayfa kategorisiz kaldi ve hicbir kapi bunu gormedi'

### V2 · 09-07 · Kategori bloğu DOM'da var, ekranda yok (opacity-0, sağlayıcı taşınmadı) — diff: KISMEN

Ne kaçtı: #1088 ile taşınan blok `opacity-0` ile başlıyor ve `data-in-view` gelince açılıyor; niteliği yazan ScrollObserver yalnız HomePage'de mount ediliyordu; 7 öğenin 7'si opaklık 0'da kaldı, 8 konformans kolu yeşildi. Görmesi gereken: test katmanı (jsdom görünürlüğü ölçemez, yapısal kör nokta) ve PR incelemesi. Nasıl yakalandı: insan, gerçek tarayıcı/ekran görüntüsü (ana ağaçta rec213a-masaustu.png vb. duruyor). Diff incelemesi: KISMEN — `opacity-0` + `data-in-view` sınıfı diff'te görünür, ama sağlayıcının yalnız HomePage'de olduğu başka dosyada; çapraz dosya sözleşme bilgisi gerekir.

**Kanıt:** memory yesil-kapi-gorundugunu-kanitlamaz.md: 'Sekiz konformans kolu yesilken /products'taki kategori blogu ekranda HIC GORUNMUYORDU (2026-09-07, REC-213-A) ... ScrollObserver yalniz HomePage'de mount ediliyordu'; git status ana ağaç: rec213a-masaustu.png, rec213a-ust-bosluk-onarildi.png

### V3 · 09-05 · İki hesaplayıcı sayfası Google'a boş göründü (Suspense sayfa kökünde) — diff: KISMEN

Ne kaçtı: hrv ve hava-perdesi rotalarında useSearchParams'ı saran Suspense page.tsx'te sayfanın tamamını sarıyordu; sunucu 0 kelime, jenerik meta description. Kural 5 lafzen sağlanıyordu, her kapı 'Suspense var mı' sorusuna EVET alıyordu. Görmesi gereken: PR incelemesi ve konformans kapısı. Nasıl yakalandı: URUN canlı ölçüm (sunucudan <h1> 0, kelime 0). Diff incelemesi: KISMEN — sayfa-boyu <Suspense> diff'te görünür; 'sınır ağacın tamamını CSR'a düşürür' bilgisi Next.js alan bilgisidir. Not: kendi diff-review SKILL.md kural 8 tam bu sınıfı vaat eder ama betikte yoktur (V49) ve vaat edilen kural bile yalnız varlık sorar, yer sormaz.

**Kanıt:** git d3ab1eae3 (#1014): 'KURAL 5 LAFZEN SAGLANIYORDU ... Hicbir kapi gormedi cunku hepsi "Suspense var mi" sorusuna EVET aliyordu'; CLAUDE.md kural 5 EK (2026-09-05 ölçümü)

### V4 · 09-04 · generateStaticParams hatayı yutuyor → build yeşil, 0 yol — diff: EVET

Ne kaçtı: `catch → return []` ve kategoride `error` okunmadan `data || []`; ağaçta .env yokken placeholder Supabase'e düşüp sıfır yol üretiyor, build yeşil; CI de dummy.supabase.co ile aynı körlükte. Görmesi gereken: bu kodu getiren PR incelemesi ve CI build kapısı (prerender yol sayısı ölçülmüyordu). Nasıl yakalandı: URUN .next artefaktını açıp saydı. Diff incelemesi: EVET — yutulan hata deseni (`catch { return [] }`) diff'te düz görünür, alan bilgisi gerekmez.

**Kanıt:** memory olcut-keskin-ama-evren-yanlis-build.md (2026-09-04, REC-59): 'generateStaticParams hatayı yutuyor (catch → return [], kategoride error hiç okunmadan data || []) → build yeşil, sıfır yol. CI de aynı körlükte (dummy.supabase.co)'

### V5 · 09-08 · Kategori rotası hiç önceden üretilmiyordu (headers()+searchParams) — diff: KISMEN

Ne kaçtı: iki sebep birden (headers() çağrısı ve searchParams okuma) rotayı dinamiğe düşürüyordu; 0 HTML. Üç kollu sabotaj: birini kaldırmak 0, ikisini kaldırmak 46 HTML. Görmesi gereken: PR incelemesi + CI (rota sınıfı ilanı kapısı yoktu). Nasıl yakalandı: URUN ölçüm. Diff incelemesi: KISMEN — headers()/searchParams çağrıları görünür; statik niyetle çeliştiğini görmek Next.js rota sınıfı bilgisi ister.

**Kanıt:** git 7849bbce0 (#1136): 'taban (ikisi de var) -> 0 HTML · yalniz searchParams kaldirildi -> 0 · yalniz headers() kaldirildi -> 0 · IKISI birden -> 46 HTML'

### V6 · 09-14 · jwt_role DROP merge oldu, üretilmiş tip dosyası tazelenmedi → 3 PR bloke — diff: EVET

Ne kaçtı: #1186 migration'ı prod'da jwt_role fonksiyonunu düşürdü; database.types.ts hâlâ taşıyordu; PR kapıları 15/15 yeşil geçti çünkü PR anına bakıyorlar; prod'a inince tip-drift kapısı her PR'da kırmızı yandı (#1187 #1189 #1188 bloke). Görmesi gereken: PR incelemesi ('DROP var, üretilmiş tip dosyası diff'te yok'). Nasıl yakalandı: CI kapısı, ama merge SONRASI. Diff incelemesi: EVET — DROP FUNCTION satırı ile database.types.ts'in diff'te bulunmaması birlikte görünür; proje kuralı bilgisi (supabase:gen) yeter.

**Kanıt:** git f220fb85f (#1190): 'tip-drift kapisi (INV-TIP-DRIFT-1) bu yuzden HER PR da kirmizi veriyordu ve uc PR birden bloke idi'; memory yesil-kapi EK 2026-09-14: '#1186 PR kapılarından 15/15 geçti, prod'a indi; SONRA tip-drift kapısı her PR'da kırmızı'

### V7 · 09-14 · DROP POLICY IF EXISTS ×3 var olmayan politikayı sessizce düşürdü — diff: HAYIR

Ne kaçtı: migration'daki üç DROP POLICY IF EXISTS storage.objects'te olmayan politikaları hedefliyordu; 09-13 ölçümü politika adına bakmış, tabloyu ayırt etmemişti (aynı ad public.product_images'ta ayakta). 'Migration başarıyla uygulandı' ≠ 'değişiklik oldu'. Görmesi gereken: plan-challenger / migration öncesi canlı ölçüm. Nasıl yakalandı: ALTYAPI uygulama sonrası canlı yeniden ölçüm. Diff incelemesi: HAYIR — hangi tabloda hangi politikanın var olduğu canlı DB durumu; diff'te görünmez.

**Kanıt:** memory yesil-kapi-gorundugunu-kanitlamaz.md EK 2026-09-14 (REC-322/335): 'üç DROP POLICY IF EXISTS satırı var olmayan politikaları düşürdü ve sessizce geçti; 09-13 ölçümü politika ADINA bakmış, TABLOYU ayırt etmemişti'

### V8 · 09-13 · Üç SKILL.md bozuk frontmatter ile sessizce boş yükleniyordu; kapılar 10/10 yeşil — diff: EVET

Ne kaçtı: alıntısız YAML düz skalerinde iki nokta (`PPR icin DEGIL:`, `Tetik: katalog oku`) tüm frontmatter'ı düşürüyor; name/description yok olunca skill yönlendirmede hiç seçilemiyor. skill-yuku-butcesi (4 kol) ve skill-bitis-blogu (6 kol) o süre boyunca yeşildi çünkü frontmatter'ı ayrıştırmıyor, metin tarıyorlardı. Görmesi gereken: konformans kapısı / kanca. Nasıl yakalandı: dış yerleşik araç (`claude plugin validate`) ilk koşusunda. Diff incelemesi: EVET — alıntısız iki noktalı description satırı diff'te düz görünür; YAML temel bilgisi yeter.

**Kanıt:** docs/audits/rec319-yerlesik-skill-araclari-2026-09-13.md §1 ve §1.1: 'skill-yuku-butcesi (4 kol) ve skill-bitis-blogu (6 kol) o üç dosya bozukken de 10/10 yeşil veriyordu'; git 6f7bdb9c9 (#1174)

### V9 · 09-13 · Altı ölü migration'da geçersiz `CREATE POLICY IF NOT EXISTS` (11 kez) — diff: KISMEN

Ne kaçtı: PostgreSQL bu sözdizimini desteklemez; dosyalar ledger bootstrap'ı 'görülmüş' saydığı için hiç koşmadı, koşsaydı tur kırmızı olurdu. PR anında SQL içeriğini okuyan hiçbir kapı yoktu (INV-MIGRATION-1 atomiklik, -2 damga). Görmesi gereken: o günkü PR incelemesi ve CI SQL linter'ı (yoktu). Nasıl yakalandı: yeni araç squawk ilk taramasında (#1172). Diff incelemesi: KISMEN — sözdizimi diff'te görünür; geçersiz olduğunu bilmek PostgreSQL alan bilgisi ister.

**Kanıt:** docs/audits/rec315-squawk-ilk-tarama-2026-09-13.md §1 ('Bugüne kadar bu dosyaları PR anında hiçbir kapı içerik olarak okumuyordu') ve §4.3 ('altı dosyada 11 kez'); git b1f19e5cb (#1172)

### V10 · 09-15 · Şema+veri koşulu+kendi COMMIT tek dosyada → sıfırdan kurulum 25/63 domino — diff: KISMEN

Ne kaçtı: 20260811_f2_split_model_schema.sql brands/product_families şemasını yaratıp aynı işlemde 'kategori sayısı 4 değil' diye geri alıyor ve kendi commit'ini yazıyor; boş gölgede şema da geri gidiyor, sonraki ~20 migration düşüyor. Görmesi gereken: create-migration PR incelemesi (dosya pencere dışında yazıldı, kusur pencere içinde keşfedildi). Nasıl yakalandı: ALTYAPI gölge küme replay'i. Diff incelemesi: KISMEN — üç öğe tek dosyada görünür; 'veri koşulu şema ile aynı işleme girmez' migration tasarım bilgisi ister.

**Kanıt:** docs/audits/rec336-baseline-2026-09-15.md §4: '25 DÜŞEN, SUÇLU TEK DOSYA ... 20260811_f2_split_model_schema.sql'; git 53da8f2f4 (#1201)

### V11 · 09-13 · 'sharp kullanılmıyor, kaldır' — iki şerit aynı kör grep'le 0 dedi, 8 dinamik import vardı — diff: KISMEN

Ne kaçtı (yanlış 'kaldır' yönünde): OPS ve ALTYAPI yalnız `from 'sharp'`/`require('sharp')` aradı; scripts/media/*.mjs 8 dosyada `await import('sharp')` kullanıyor; kaldırılsaydı katalog görsel hattı kırılır, betikler CI'da koşmadığı için kapı görmezdi. Görmesi gereken: plan/PR incelemesi (bağımlılık kaldırma). Nasıl yakalandı: ALTYAPI PR aşamasında çıplak ad grep'i. Diff incelemesi: KISMEN — package.json'dan düşen satır diff'te; kullanımı bulmak depo genelinde arama ister, tek diff yetmez.

**Kanıt:** memory statik-import-sifir-kullanilmiyor-demek-degil.md (2026-09-13): 'grep -rn "sharp" scripts/media/*.mjs ile 8 dosya/17 satır ... await import(\'sharp\')'; git 193db1437 (#1178) '"sharp kaldir" CURUTULDU'

### V12 · 09-07 · Fan gücü 0.18 W (kW yazılmış): tip/şema/konformans hepsi yeşil, vitrinde bin kat küçük — diff: HAYIR

Ne kaçtı: max_absorbed_power_w=0.18 sayı, pozitif, geçerli; yanlış olan fizik. Aynı alanda 10'dan küçük 12 değerin 10'u doğru (Vortice ev fanları 4-9 W), yalnız 2'si ad kanıtıyla hatalı. Görmesi gereken: veri kapısı / katalog içe alma doğrulaması (yoktu). Nasıl yakalandı: URUN-KATALOG'un ürün adı kanıtlı ölçümü. Diff incelemesi: HAYIR — veri satırı, kod diff'i yok; makul aralık kararı HVAC alan bilgisi ister.

**Kanıt:** git 3ea52fc0d (#1094): 'DORDUNCU SINIF EN TEHLIKELISI, HICBIR KAPI GORMEZ: 0.18 degeri sayi, pozitif, gecerli ... SEAT 20 ATEX'in gucu artik 0,18 W degil 180 W'

### V13 · 09-04 · package.json'a mükerrer `test:smoke` anahtarı: ikincisi sessizce öldü — diff: EVET

Ne kaçtı: SSR duman kilidine verilen ad satır 23'te zaten vardı (playwright); yeni satır 18'e yazıldı, JSON ayrıştırıcı sonuncuyu aldı; pnpm/tsc/eslint/konformans hiçbiri görmedi; yeni workflow SSR kilidini hiç ölçmeyecekti. Görmesi gereken: PR incelemesi + lint. Nasıl yakalandı: yazar `pnpm test:smoke` koşup playwright'ın çalıştığını gördü (şans). Diff incelemesi: EVET — eklenen anahtar dosyada zaten var; dosya bağlamıyla okunan diff'te düz görünür.

**Kanıt:** memory json-mukerrer-anahtar-sessizce-yutulur.md (2026-09-04, REC-134): 'repo'da o ad ZATEN vardi (playwright test, satir 23). Benimki satir 18'e yazildi ve olu dogdu'

### V14 · 08-27 · vercel-ignore-build.sh `2>/dev/null || true` ile 10 gün hiç çalışmadı, her push deploy yaktı — diff: EVET

Ne kaçtı: atlama listesi tamdı ama taban çözümü iki zincirde düşüyor, kurtarma `git fetch ... 2>/dev/null || true` ile yutuluyordu; betik her kararını günlüğe yazıyor, tek başarısız adımı yazmıyordu. Görmesi gereken: betiği getiren PR incelemesi ve pozitif iz ölçen test. Nasıl yakalandı: Hobby kotası dolup tren durunca I18N kök neden avı (bedelle). Diff incelemesi: EVET — kritik adımı saran `|| true` + `2>/dev/null` çifti klasik görünür anti-desen.

**Kanıt:** memory yutulan-hata-on-gun-gizlenir.md (2026-08-27): 'kurtarma denemesi git fetch ... 2>/dev/null || true ile YUTULUYORDU ... kusur 10 gun boyunca her push'ta bir deploy yakti'

### V15 · 09-08 · vercel.json `"*": false` joker değil; kendi kapısı içeriğe baktı, sonuca değil → 60+ dağıtım, kota doldu — diff: KISMEN

Ne kaçtı: git.deploymentEnabled nesnesinde `*` literal dal adı sanıldı, hiçbir dalla eşleşmedi, her dal açık kaldı; INV-VERCEL-ONIZLEME-1 doğru dizeyi görüp gece boyunca yeşil yandı. Bedel: dokuz saatte 60+ dağıtım, master'ın 3 commit'i 'rate limited' ile reddedildi, site eski derlemeyi servis etti. Görmesi gereken: PR incelemesi ve kapı tasarımı (etki değil metin ölçüyordu). Nasıl yakalandı: ALTYAPI dört commit'te hipotez testi, kota dolduktan sonra. Diff incelemesi: KISMEN — `"*"` diff'te; joker desteklenmediğini bilmek Vercel belge bilgisi ister.

**Kanıt:** git b83e94ada (#1117): 'JOKER YOK ... INV-VERCEL-ONIZLEME-1 vercel.json'un ICERIGINE bakiyor, SONUCUNA bakmiyordu ... dokuz saatte 60+ dagitim, kota 21:14Z'de doldu, master'in UC commit'i ... REDDEDILDI'

### V16 · 09-07 · Aralık deseni `ile`/`kadar` kelime içinde eşleşti: evrenin %31'i sessizce muaf — diff: KISMEN

Ne kaçtı: REC-157 kapısı 'ailesi/edilebilen/ileri' gibi kelimelerde `ile`yi bulup aileyi 'aralık yazmış' sayıp muaf tutuyordu; 13 aileden 8'i muaf (doğrusu 4), muafların ikisi tam da izlenen borç kalemleriydi. Görmesi gereken: kapıyı getiren PR incelemesi. Nasıl yakalandı: yazar borcu kapalı ilan etmeden önce sabotaj koştu, kapı düşmedi. Diff incelemesi: KISMEN — regex'te \b yokluğu görünür; Türkçe'de hangi kelimelerin 'ile' içerdiğini düşünmek dil bilgisi ister.

**Kanıt:** git e11398d00 (#1056): 'ARALIK_IFADESI deseni ile ve kadar'i KELIME ICINDE de esliyordu ... Evrenin %31'i SESSIZCE atlaniyordu'

### V17 · 09-04 · Dört kapı hedef dala değil dosyadaki ortak dizeye bağlıydı; sabotaj yeşil kaldı — diff: KISMEN

Ne kaçtı: INV-DUMAN-4 `/throw new Error/` (üç throw var), anon nöbetçisi `/process.exit\(1\)/` (üç exit), 'ilan dosyasını okuyor mu' için `includes('…ilani.json')` (ad hata mesajında da geçiyor), INV-SIR-BASMA-1 `/exit\(2\)/` (dört exit); hedef dal bozulunca dördü de yeşil kaldı. Görmesi gereken: kapı PR incelemesi. Nasıl yakalandı: yazarın sabotaj turu, 'hiçbirini gözle okuyarak fark etmedim'. Diff incelemesi: KISMEN — zayıf iddia (`toMatch(/throw new Error/)`) görünür; dosyada kaç örnek olduğunu bilmek hedef dosyayı okumayı ister.

**Kanıt:** memory varlik-olcutu-dala-baglanir.md (2026-09-04): 'bu sınıfı dört kez ödedim ... Dördünü de sabotaj turu buldu, hiçbirini gözle okuyarak fark etmedim'

### V18 · 09-07 · 53 kapı × sabotaj: 15 FAIL-OPEN, 2 kapının evreni zaten 0 — diff: KISMEN

Ne kaçtı: yürüme kökü geçerli-ama-yanlış dizine çevrilince (952→44 dosya) 15 kapı yeşil kaldı; stock-restore-evidence'ın çalışma kümesi bugün zaten 0 (stok-restore invaryantı fiilen denetlenmiyor), 3d-asset-validity'nin PUBLIC_3D evreni 0; legal-en-leftover ve i18n-key-resolution boş evrende bile kırmızı vermedi. Görmesi gereken: kapı yazımı (evren muhafızı) ve PR incelemesi. Nasıl yakalandı: OPS'un 6 sonnet + 1 opus sabotaj sınavı (kapı-üstü kapı). Diff incelemesi: KISMEN — `toBeGreaterThan(0)` ya da evren sayımı yokluğu kapı diff'inde görünür, ama sistemik ve fikstür bilgisi ister.

**Kanıt:** docs/audits/rec179-evren-muhafizi-sinavi-2026-09-07.md §1: 'FAIL-OPEN DOĞRULANDI 15 · PAKET KORUYOR 3 · ÇÜRÜDÜ 1 · KORUNUYOR 33 ... stock-restore-evidence — kapının ÇALIŞMA KÜMESİ bugün zaten 0'; git 55eaa0a1f (#1072)

### V19 · 09-06 · Fail-open kapı (`if kesin >= 0 and …`) + PostgREST 1000 satır sessiz tavan — diff: EVET

Ne kaçtı: kesin sayı alınamayınca -1 dönüp denetim atlanıyordu — kapı tam gerektiği anda kapanıyor; aynı gün product_prices 1044 satır 1000'e sessizce kesildi (ilk koşum 334/41, gerçek 348/27). Görmesi gereken: betik PR incelemesi ve iki yönlü sınav (ölçemediği hal). Nasıl yakalandı: ALTYAPI akran bulgusu → yazar kendi kodunda aradı. Diff incelemesi: EVET — 'ölçüm alınamadı → geçti' deseni (`if x >= 0 and kötü`) diff'te düz görünür, alan bilgisi gerekmez.

**Kanıt:** memory fail-open-kapi-kapi-degildir.md (2026-09-06, REC-168): 'if kesin >= 0 and len(top) != kesin ... denetim SESSIZCE ATLANIR'; memory sessiz-tavan-ve-fail-open-kapi.md: 'product_prices 1044 satır → 44 satır düştü; ALTYAPI ilk koşumda 334/41 gördü (gerçek 348/27)'

### V20 · 09-07 · Sahte sunucu Content-Range basmıyor, Range'i yok sayıyor: sayfalama aylardır hiç ölçülmemiş — diff: HAYIR

Ne kaçtı: pricingMaterialize testinin stub'ı gerçek PostgREST'ten iki yerde sapıyordu; paket aylardır yeşildi ama yeşil 'sayfalama sorulmadı' demekti; satır sayısı sayfa boyunu geçse sonsuz döngü olurdu. Görmesi gereken: test katmanı (stub sadakati). Nasıl yakalandı: yeni fail-closed kol eklenince CI 12 testin 5'inde kırmızı verdi. Diff incelemesi: HAYIR — kusur değişiklik diff'inde değil, mevcut stub'da; ancak stub'ı getiren eski PR'da KISMEN görünürdü.

**Kanıt:** memory stub-gercegi-taklit-etmiyorsa-test-kordur.md (2026-09-07, REC-178): 'count=exact istendiginde Content-Range basligini HIC basmiyordu ... Range basligini yok sayip tabloyu OLDUGU GIBI donduruyordu'

### V21 · 09-09 · Olmayan kategori 200 döndü (soft-404) ve CDN'e yazıldı; preload hata ile yokluğu aynı değere indiriyordu — diff: EVET

Ne kaçtı: /tr/category/<uydurma> HTTP 200, noindex yok; statiğe geçişle 'bulunamadı' sayfası HIT olarak CDN'de kaldı. Daha büyük tuzak: preload.ts:157 `if (error || !rows || rows.length === 0) return null` — sorgu hatası ile 'yok' aynı değer; düz 404 üretmek geçici DB arızasını kalıcı 404'e çevirip CDN'e yazardı. Görmesi gereken: PR incelemesi + test. Nasıl yakalandı: URUN canlı ölçüm. Diff incelemesi: EVET — hata/yokluk birleştiren koşul klasik görünür anti-desen.

**Kanıt:** git 365939501 (#1141): 'preload.ts:157 soyleydi -> if (error || !rows || rows.length === 0) return null ... GECICI bir DB arizasini KALICI 404e cevirirdi'

### V22 · 08-28 · Politika canlı ama kolon GRANT yok → kimse ulaşamıyor; `revoke from public` anon'u kapatmıyor — diff: KISMEN

Ne kaçtı: quotes insert politikaları pg_policies'te doğruydu ama `status`/`unit_price` kolonları authenticated'ın INSERT yetkisinde yoktu (iki katman da 42501); ayrıca yeni SECURITY DEFINER RPC'de `revoke all from public; grant to authenticated` yazıldı, merge oldu, anon EXECUTE hâlâ TRUE (Supabase varsayılan yetki anon'a doğrudan verir). Görmesi gereken: migration PR incelemesi + rls-guard CI. Nasıl yakalandı: yazarın merge SONRASI canlı ölçümü; 4 emsal RPC'de anon revoke vardı, yalnız yenisinde yoktu. Diff incelemesi: KISMEN — emsal fonksiyonlarla kıyaslayan bir okuyucu eksik `revoke from anon` satırını görür; Supabase varsayılan yetki bilgisi ister.

**Kanıt:** memory politika-var-grant-yok-ulasilamaz.md (2026-08-28): 'status sütunu authenticated'ın INSERT yetkisinde yok' ve EK: 'has_function_privilege(anon, ..., EXECUTE) = TRUE ... dort emsal RPC'de anon EXECUTE false; yalniz benimki true'

### V23 · 08-27 · Migration komşu tablonun kolon adını taşıdı (model_code/metadata), prod koşumu düştü — diff: EVET

Ne kaçtı: product_families için `model_code` (products'ta) ve `metadata` (categories'te) yazıldı; doğrusu series_code / description; yerel konformans kaynağı tarar şemayı değil. `--single-transaction` kısmi yazımı engelledi. Görmesi gereken: PR incelemesi (database.types.ts depoda, kıyaslanabilir) ve CI şema kontrolü (yoktu). Nasıl yakalandı: prod migration koşumu düştü. Diff incelemesi: EVET — kolon adları diff'te, doğru adlar aynı depoda üretilmiş tip dosyasında.

**Kanıt:** memory measure-db-before-assuming-migration.md EK (2026-08-27): 'column "model_code" of relation "product_families" does not exist ... 13 referans vardı'

### V24 · 08-27 · 'Geri alma' PR'ı (#855) 11 companion'ın 2'sinde içeriği yarıya indirdi, merge oldu — diff: EVET

Ne kaçtı: sembol kaybı sanılan 10 dosya eski haline alındı; toplam +7.705 bayt 'kazanç' göründü ama SnailFanModel.md 12.465→6.171, DehumidifierModel.md 6.583→5.561 bayt düştü (ITHALATLAR/INTERFACES bölümleri silindi). Görmesi gereken: PR incelemesi (dosya bazında --stat). Nasıl yakalandı: yazar merge sonrası kalem kalem ölçtü, #862 ile onardı. Diff incelemesi: EVET — 'geri al/onar' iddialı PR'da iki dosyanın binlerce satır kaybetmesi --stat'ta düz görünür.

**Kanıt:** memory agrega-sayi-ters-gideni-gizler.md (2026-08-27): 'SnailFanModel.md 12.465 -> 6.171 bayt (YARIYA)'; git 89d982abe (#862): '#855'te yanlis geri aldigim 2 companion onarildi'

### V25 · 08-26 · 'PR #680 merge' kanıtıyla kapatılan T104-VH: LeadModal hiçbir yere yazmıyordu, müşteri verisi kayboldu — diff: KISMEN

Ne kaçtı: 72 kapanışın 14'ünün kanıtı yalnız merge atfıydı; T104-VH'de #680 iletişim formunu bağlamış, LeadModal ayrı yüzeydi; kayıt kapalı görünürken veri kaybı sürüyordu. Görmesi gereken: kapanış kanıtı disiplini ve PR kapsam incelemesi ('bu diff kaydın tamamını kapsıyor mu'). Nasıl yakalandı: I18N canlı ölçüm. Diff incelemesi: KISMEN — #680 diff'inde LeadModal'a dokunulmadığı görünür; kaydın kapsamını (iki yüzey) bilmek gerekir.

**Kanıt:** memory merge-canlida-calistigini-kanitlamaz.md (2026-08-26): '14'ünün kanıtı yalnız merge/PR atfıydı ... T104-VH ... LeadModal hâlâ hiçbir yere yazmıyordu: müşteri verisi kayboluyordu'

### V26 · 09-07 · tazelik.py kapısı yazıldı, doğru ölçüyor, fail-closed — ve hiçbir yerden çağrılmıyor — diff: EVET

Ne kaçtı: REC-163 Adım 5'te yazılan kaynak dizini tazelik kapısı ne ingestor'da (CI dizini yok, kanca yok) ne ana repoda (.github/scripts/.githooks grep = 0) çağrılıyordu; Recep'in ilettiği 36 belge diskte ama dizinde değildi. Görmesi gereken: kapıyı getiren PR incelemesi ('çağıranı nerede') + kanca/CI bağlama. Nasıl yakalandı: URUN-KATALOG ölçüm. Diff incelemesi: EVET — kapı betiği eklenen PR'da workflow/kanca değişikliği olmaması diff'te düz görünür.

**Kanıt:** git f92eac69d (#1084): 'GERCEK BOSLUK TETIK: tazelik.py hicbir yerden cagrilmiyor ... grep = 0 cagri. Yazilmis, dogru olcen, fail-closed bir kapi hic kosmuyorsa var olmayan kapidan farki yoktur'

### V27 · 09-07 · Çıkarım aracı 08-20'de düzeltildi, hiç yeniden koşulmadı; CSV 22 Haziran'da kaldı, 74 ürün 3 hafta eksik — diff: KISMEN

Ne kaçtı: 'ürün kodu 5 hane' varsayımı venthub-pdf-ingestor@e7e5f7b ile düzeltildi ama avensair-fiyat.csv yeniden üretilmedi; eksik defalarca raporlandı, Linear'a yazıldı, hiçbir şey kırmızı vermedi. Recep'in 'patinaj' şikâyetinin ölçülmüş kökü. Görmesi gereken: çıktı tazelik kapısı (yoktu; sonra cikti_tazelik.py kuruldu) ve düzeltme PR incelemesi ('kural değişti, üretilmiş çıktı diff'te yok'). Nasıl yakalandı: Recep şikâyeti → ölçüm. Diff incelemesi: KISMEN — kural dosyası değişip CSV'nin dokunulmadığı görünür; CSV'nin bu araçtan üretildiğini bilmek gerekir.

**Kanıt:** memory duzeltilmis-ama-kosulmamis-arac.md (2026-09-07): 'venthub-pdf-ingestor@e7e5f7b ... Araç bir daha hiç koşulmadı. avensair-fiyat.csv 22 Haziran tarihinde kaldı ve içinde 74 ürün eksik olmaya devam etti'

### V28 · 09-08/12 · Yeni dosya eklendi, envanter kapısı yerelde koşulmadı: bir günde 5 şerit aynı kapıya takıldı — diff: EVET

Ne kaçtı: INV-ARAC-1 CI'da koşuyor, ilan eksiği commit'ten sonra görünüyor; 2026-09-08'de #1116 #1118 #1124 #1125 #1131 takıldı, dördüncüsü kapıyı yazan kişiydi; 09-12'de REC-307 aynı tuzak (iki investigate/SKILL.md, envanter 71/fs 73). Görmesi gereken: pre-commit kancası (uyarma ayağı yoktu, #1134 ile eklendi). Nasıl yakalandı: CI kırmızı. Diff incelemesi: EVET — yeni araç dosyası eklenip envanter dosyasına dokunulmaması diff'te düz görünür.

**Kanıt:** git ced9c1585 (#1134): 'ayni kapiya BES ayri serit takildi (#1116 #1118 #1124 #1125 #1131) ve dorduncusu kapiyi YAZAN kisiydi'; memory yeni-dosya-envanter-kapisini-kosar.md (2026-09-12, REC-307)

### V29 · 09-15 · İlan dosyası yazılmamış bir ölçüm kaydına işaret ediyordu; 15 kolun hiçbiri varlık ölçmedi (REC-344) — diff: EVET

Ne kaçtı: sema-replay ilanı henüz yazılmamış docs/audits dosyasını gösteriyordu; ilanı okuyan 'ölçüm var' sanır, dosyayı bulamaz. Görmesi gereken: konformans kapısı (16. kol sonradan eklendi) ve PR incelemesi. Nasıl yakalandı: yazar aynı işte fark etti; REC-344 kırık işaretçi taraması açıldı. Diff incelemesi: EVET — JSON'a eklenen yol dizesi ile aynı PR'da o dosyanın bulunmaması düz görünür.

**Kanıt:** src/__tests__/conformance/sema-tabani-is-akisi.test.ts:222-243 ('ISARETCI KIRIK OLMASIN — GERCEK KUSURDAN SONRA EKLENDI (2026-09-15) ... o ad henuz yazilmamis bir dosyayi gosteriyordu ve hicbir kol bunu olcmuyordu'); ops-cycle-audit-state.md:3583 ('kol (15→16) → REC-344')

### V30 · 09-01 ve 09-15 · Türkçe küçültme I→ı: kapı İngilizce terimi göremiyor (REC-343); kanca ASCII fikstürle yanlış kırmızı — diff: KISMEN

Ne kaçtı: INV-VAAT-SIZINTI-3 yalnız toLocaleLowerCase('tr') kullanıyordu; 'AI-powered' → 'aı-powered', 'installment' → 'ınstallment', 'PCI DSS' → 'pcı dss' hiç eşleşmiyor; kardeş iki kapı da aynı kördü. 09-01'de ters yüzü: PreCompact kancası 'SON GİRDİ'.toLowerCase() = 'son gi̇rdi̇' (U+0307) yüzünden dolu dosyaya iki compact üst üste 'eksik' dedi; 'başlık tanınır' kolu vardı ama tüm fikstürler ASCII'ydi. Görmesi gereken: kapı yazımı ve fikstür tasarımı. Nasıl yakalandı: 09-15 ayırt edici kol sabotajı kırmızı yandı; 09-01 yazar dosyayı kendisi ölçtü. Diff incelemesi: KISMEN — toLocaleLowerCase('tr') + İngilizce terim listesi aynı diff'te; I/ı davranışı Türkçe kasa alan bilgisidir.

**Kanıt:** src/__tests__/conformance/vaat-sizintisi.test.ts:177-190 ('"AI-powered" metni "aı-powered"a dönüyor ... installment / pci dss ... hiç yakalanmıyordu'); ops-cycle-audit-state.md:3581 (REC-343 açıldı); memory dizin-kapi-test-dersleri.md:503-553 (09-01: 'bütün fikstürleri ASCII başlık üretiyordu, oysa saha Türkçe yazıyor')

### V31 · 09-16 · .agent manifest bayat → skills:verify 0→25 uyarı gizliydi — diff: KISMEN

Ne kaçtı: skills-gate'in girdisi olan .agent manifest'i skill değişikliklerine karşı bayatlamış; skills:verify (python scripts/skills-evaluator.py) yeniden üretilince 0 uyarıdan 25 uyarıya çıktı, yani 25 uyarı o zamana dek görünmezdi. Görmesi gereken: skills-gate CI + skill ekleyen PR'ların incelemesi. Nasıl yakalandı: ALTYAPI REC-347 çalışırken yan bulgu. Diff incelemesi: KISMEN — skill ekleyen PR'da manifest'e dokunulmaması görünür; manifestin üretilmiş ve kapı girdisi olduğunu bilmek gerekir. Ayrıntı tek satır kaynaklı; hangi 25 uyarı ve ne zaman bayatladığı ölçülmedi (bkz. ölçülemeyenler).

**Kanıt:** ops-cycle-audit-state.md:3635: 'YAN BULGU: .agent manifest BAYAT → skills:verify 0→25 uyarı gizliydi (ayrı kayıt açılacak)'; package.json:31 '"skills:verify": "python scripts/skills-evaluator.py"'

### V32 · 09-14 · Linear yorum sayacı 200 + errors yok + nodes [] döndü: 'yeni yorum yok' ile 'sorgu kör' ayrılamıyordu — diff: KISMEN

Ne kaçtı: sorgu yanlış alanı (`project(id){comments}` yerine kök `comments` + proje süzgeci) kullanıyordu; fail-open tasarım gereği sessizdi, teşhis kipi yoktu; kabul sınavı toplam dört kusur buldu. Görmesi gereken: kanca testi (sessizliğin sebebini soran kip). Nasıl yakalandı: ALTYAPI kabul sınavı (#1189). Diff incelemesi: KISMEN — GraphQL alan adı diff'te; şemayı bilmeyen okuyucu yanlışlığı göremez.

**Kanıt:** memory dizin-olcum-kanit-dersleri.md:839+ ders 2: 'HTTP 200 + errors YOK + nodes [] ... yanlis alan ... "Yeni yorum yok" ile "sorgu KOR" halleri AYIRT EDILEMIYORDU'; git e0cbfe3ee (#1189) 'kabul sinavi DORT kusur buldu'

### V33 · 09-15 · Defter bayatlık kancası vardı, kuruluydu, doğru ölçüyordu — 7 gün kimse görmedi (REC-342) — diff: HAYIR

Ne kaçtı: defter-bayatlik-olcumu.cjs Stop olayında, async, stderr'e yazıyordu; karar açılışta veriliyor, çıktı akışa girmiyor, 2 saat soğuma var. OPS kaydı 'kural var, kapı yok' yazdı; ölçüm kapının var olduğunu gösterdi. Görmesi gereken: kanca yüzey tasarımı (kararın verildiği yerde görünürlük). Nasıl yakalandı: OPS bayatlığı ölçtü, ALTYAPI kancayı elle koştu. Diff incelemesi: HAYIR — kusur kodda değil, çıktının nereye gittiğinde; hiçbir diff'te iz yok.

**Kanıt:** memory yesil-kapi-gorundugunu-kanitlamaz.md EK 2026-09-15 (REC-342): 'OPS kaydı "kural var, kapı yok" yazdı; ölçüm: .claude/hooks/defter-bayatlik-olcumu.cjs Stop olayında kuruluydu ... Susma sebebi üç: Stop = turun SONU; async + stderr; 2 saat soğuma'

### V34 · 09-14 · ai-auto-repair zinciri: çağrılıyor, koşuyor, 10 PR açtı — 0/10 merge; envanter üç sorudan geçti — diff: HAYIR

Ne kaçtı: AXIOM 3'ün üç sorusu (çağıranı var, koşum izi var, çıktı üretiyor) hepsi EVET; ama ürettiği hiçbir PR kabul edilmedi; araç 'KAL' görünüyordu. Görmesi gereken: araç envanteri (dördüncü soru 'çıktı kabul ediliyor mu' sonradan eklendi). Nasıl yakalandı: REC-333 alt-ajan ölçümü (gh run/pr sorguları). Diff incelemesi: HAYIR — süreç/etki ölçümü, diff dışı.

**Kanıt:** docs/audits/rec314-tetiklenebilirlik-sinavi-2026-09-14.md §8: 'ürettiği 10 PR'ın hepsi CLOSED — 0/10 merge ... araç çalışıyordu, çıktısı kabul edilmiyordu'; docs/audits/rec333-ai-auto-repair-2026-09-14.md

### V35 · 09-07/08 · YANLIŞ ALARM: SSR duman alarmı 15 saat sahte kırmızı (temsilci alfabetik ikinci yol) — diff: KISMEN

Ne oldu: REC-205 iki seviyeli adresi kaldırınca hiyerarşi adresten silindi; temsilci seçimi hâlâ adrese bakıyor, ikiSegmentli küme boşken kategoriler[1]'e (alfabetik ikinci, DB'de fanların altı) düşüyor ve sınıf kendi temsilcisini ihlalci sayıyordu; canlıda arıza yoktu (OPS 42/42 prob doğru sayfa). Dosyanın kendi 171-175 satırları dersi yazmıştı, yarısı işletiliyordu. Görmesi gereken: CI alarmı tasarımı; REC-205 PR incelemesi. Nasıl yakalandı: ALTYAPI kök sebep + OPS probları. Diff incelemesi: KISMEN — REC-205 diff'i adres şemasını değiştirdi; alarmın seçiminin ona bağlı olduğu başka dosyada.

**Kanıt:** git 18649b105 (#1129): 'alarm 15 saattir SAHTE kirmizi veriyordu ... ikiSegmentli kumesi bosken secim kategoriler[1]'e, ALFABETIK IKINCI'ye dusuyordu ... DOSYA BU DERSI KENDI YAZMISTI: 171-175. satirlar'

### V36 · 09-07 · YANLIŞ ALARM ZİNCİRİ: master 3,5 saat kırmızı (mükerrer '## 6.'), iptal koşular 'yeşil' okundu, tüm açık PR'lar kırmızı — diff: EVET

Ne oldu: #1050 execution-method-standard.md'ye ikinci bir '## 6.' başlığı getirdi; standard-section-integrity master'da kırmızı; arka arkaya merge'ler önceki koşuları CANCELLED yaptı, son beşin dördü iptal, belirsizlik 'sorun yok' okundu; CI pull_request'te master ile birleşimi koştuğu için dosyaya dokunmayan PR'lar da kırmızı aldı. Görmesi gereken: #1050 PR incelemesi; CI durumu okuma disiplini. Nasıl yakalandı: URUN 'git diff 0 dokunuş, ci kırmızı' ölçtü. Diff incelemesi: EVET — aynı dosyada iki '## 6.' başlığı dosya bağlamlı diff'te düz görünür.

**Kanıt:** git e18ab7da7 (#1095): 'IKI TANE "## 6." vardi ... son bes kosunun dordu iptal ... master kirmizi oldugu surece ACIK HER PR kirmizi geliyordu'

### V37 · 09-12 · YANLIŞ ALARM: karar-kayit-bagi kapısı K53'ü 8 gün AÇIK saydı, K54 aynı soruyu REC-199'a bağlamıştı — diff: HAYIR

Ne oldu: kapı doğru yakaladı, sınıf yanlıştı; master kırmızıya döndü, #1154 kurban oldu. Görmesi gereken: kapının karar-eşleme mantığı. Nasıl yakalandı: OPS master kırmızı onarımı. Diff incelemesi: HAYIR — anlamsal belge içeriği (iki karar başlığının aynı soruyu taşıması).

**Kanıt:** git 6ac348875 (#1163): 'Master kirmizi: karar-kayit-bagi K53 u 8 gundur ACIK sayiyordu; K54 ayni soruyu REC-199 a baglamisti. Kapi dogru yakaladi, sinif yanlisti ... PR #1154 (kurban)'

### V38 · 09-14/15 · YANLIŞ ALARM ÜÇLÜSÜ (kapı kendi evrenini yanlış seçti): render-revalidation 00_golge_onsoz.sql·INV-MECH-1 çapasız regex·commit-uyarı kancası tam yol/basename — diff: KISMEN

Ne oldu: (a) render-revalidation 'SQL tarihle başlar' kolu baseline önsözünü migration sanıp #1201'i kırmızı yaptı (üç şartlı dar istisna eklendi); (b) INV-MECH-1 sessizlik kolu `if \(([^)]*?)\) process.exit\(0\)` deseniyle dosyadaki ilk erken çıkışı yakalayıp 'terim düşmüş' dedi; (c) REC-325 commit-uyarı kancası yeni cetveli 'ilan edilmemiş' dedi çünkü tam yol arıyor, üretici basename yazıyor — ikinci kez. Görmesi gereken: kapı yazımı. Nasıl yakalandı: CI kırmızısı / yazar. Diff incelemesi: KISMEN — çapasız regex ve yol karşılaştırması diff'te görünür ama yanlış evreni seçtiğini görmek hedef dosyayı bilmeyi ister.

**Kanıt:** ops-cycle-audit-state.md 08:5xZ (09-15): '558482a9a = #1201 CI kırmızısının düzeltmesi (KAPI düzeltildi: render-revalidation "SQL tarihle başlar" kolu 00_golge_onsoz.sql'i yanlış yakaladı)'; memory dizin-olcum-kanit-dersleri.md:839+ ders 4 (INV-MECH-1); memory altyapi-lane-day-2026-09-09.md ~810: 'REC-325 IKINCI KEZ GORULDU: ... kanca TAM YOLU ariyor, uretici BASENAME yaziyor'

### V39 · 08-27 · YANLIŞ ALARM: INV-DOC-2 takvimle kırmızıya döndü, suç AUTH'un merge'ine yıkıldı — diff: KISMEN

Ne oldu: yaş = floor((şimdi − commit günü)/1 gün), ≤7 muaf; 15 dosya 00:00Z geçişinde 8'e düştü; merge commit'i o dosyaların hiçbirine dokunmuyordu (eşleşme 0). Kapının kendi yorumu 'zaman geçmesi yeni ihlal üretmez' diyordu ve yanlıştı. Görmesi gereken: CI kapısı tasarımı (duvar saatine bağlı eşik). Nasıl yakalandı: I18N önceki yeşil commit'te şimdi koşturarak. Diff incelemesi: KISMEN — `yas <= 7` duvar saati hesabı kapı diff'inde görünür; 'hiçbir şey değişmeden kırmızıya döner mi' sorusunu sormak gerekir.

**Kanıt:** memory takvimle-kirmiziya-donen-kapi.md (2026-08-27): '2026-08-26T22:04Z kosumu → yas=7 → YESIL; 2026-08-27T03:49Z → yas=8 → KIRMIZI ... merge commiti o 15 kaynagin hicbirine dokunmuyor (eslesme 0)'

### V40 · 09-08 · YANLIŞ ALARM (Recep'e gitti): 'site yanlış kategori servis ediyor' — iki farklı /tmp — diff: HAYIR

Ne oldu: MSYS_NO_PATHCONV=1 açıkken curl -o /tmp/x Windows köküne (C:/tmp) yazdı, bash grep /tmp/x MSYS Temp'teki 3 saat eski dosyayı okudu; 'aynı adrese iki farklı sayfa' diye sahte ciddi bulgu Recep'e raporlandı, Linear High açıldı, 3 şerit 25 dk kovaladı; boyut uyuşmazlığı (265349 ↔ 248237) ilk komutta ekrandaydı. 09-15'te aynı sınıf ikinci vaka: `git show origin/master:<yol>` yol dönüşümüyle 'geçersiz nesne' → 'dosya YOK' sahte bulgusu (REC-307). Görmesi gereken: ölçüm disiplini (ikinci bağımsız ölçüm). Nasıl yakalandı: ALTYAPI kök sebep (REC-286). Diff incelemesi: HAYIR — kod diff'i yok.

**Kanıt:** memory iki-tmp-aracin-ciktisini-okudugundan-emin-ol.md (2026-09-08 10:18Z→10:46Z ve EK 2026-09-15)

### V41 · 09-05 · YANLIŞ ALARM (Linear'a iş oldu): '12 aile için kaynak yok, üreticiden metin toplanmalı' — kaynak 74 sayfalık katalogdaydı — diff: HAYIR

Ne oldu: anlatım '-\t' madde işaretiyle arandı, katalog düz cümle yazıyor; 6 sayfa sanıldı, 61 çıktı; 40/40 ailenin kodu en az bir PDF'te, 36/40'ın Türkçe anlatımı AVenS listesinde. Sahte bulgu OPS tarafından Linear'a taşındı ve Recep'e 'kaynağımız yok' diye sunuldu. Görmesi gereken: ölçüm disiplini ('bulamadım' ≠ 'yok'). Nasıl yakalandı: yazarın yeniden ölçümü. Diff incelemesi: HAYIR.

**Kanıt:** git 6e9c0a329 (#1017): 'OLCUTUM DORDUNCU KEZ YANILDI ve bu en pahalisiydi cunku EYLEME DONUSMUSTU ... OPS Linear a tasidi, Recep e "kaynagimiz yok" diye sunuldu — kaynak 74 sayfalik AVenS katalogunun icindeydi'

### V42 · 09-05 · YANLIŞ ALARM (master'a indi): 'admin koyu tema tokenleri 23/23 tanımsız' — tarayıcı seçici adını varsaymıştı — diff: HAYIR

Ne oldu: koyu bağlam `.dark`/`prefers-color-scheme`/`data-theme="dark"` isim listesiyle arandı; admin `[data-admin-theme='dark']` kullanıyor; 23/23 aslında tanımlı. Belge master'a inmişti. Görmesi gereken: belge PR incelemesi / ölçüm. Nasıl yakalandı: Recep ('koyu tema sadece admin panelde ve zaten çalışıyor'). Diff incelemesi: HAYIR — iddia bir denetim belgesinde; doğrulamak CSS'i çözmeyi ister, diff okuma değil.

**Kanıt:** git ab6558a49 (#1021): 'Admin renk tokeni koyu temada yeniden tanimli olmayan: 23/23 yaziyordu. YANLIS ... Secici adini VARSAYMISIM ... Hatayi Recep yakaladi'

### V43 · 09-09 · YANLIŞ ALARM (iş emrine döndü): 'catalog-integrity kırmızısı TLS değil gerçek veri ihlali' — ölçüm 1 saat bayattı; üç şerit üç sebep yazdı — diff: HAYIR

Ne oldu: 06:35Z koşumunda veri ihlali gerçekten vardı (exit 1), 07:49Z koşumunda ihlal yok, TLS adımı exit 2 (ölçülemedi); ALTYAPI damgasız ölçümle OPS'u düzeltti, OPS bunu KATALOG'a iş emri yaptı, KATALOG var olmayan ihlali aradı. Ayrıca set -e ilk düşen adımda kesince ikinci arıza (TLS) ilk koşumda hiç görünmedi. Görmesi gereken: raporlama disiplini (ölçüm damgası, adım kırılımı). Nasıl yakalandı: KATALOG adım adım ölçtü. Diff incelemesi: HAYIR.

**Kanıt:** git 131bcb66c (#1150) gövdesi: '34319782643 · 06:35:45Z → Catalog integrity gate FAILURE (exit 1) ... 34325812774 · 07:49:16Z → SUCCESS, Aile-kategori adimi FAILURE (exit 2, TLS) ... olcumum YANLIS degil BAYATTI'; memory is-kirmizi-degil-adim-kirmizi.md

### V44 · 09-04 ve 09-16 · YANLIŞ SAYI Recep'e beyan (3 olay): grep -c '3→1 düzeldi'·'analytics betiği canlıda yüklenmiyor'·'441 ürünün 360'ı tek kategoride, veri bozuk' — diff: HAYIR

Ne oldu: (a) küçültülmüş HTML'de grep -c satır saydı, 1 çıktı, 'bailout 3→1 düzeldi' commit'e ve Recep'e yazıldı, gerçek 3; (b) Vercel Analytics betiği rastgele yoldan servis ediliyor, 'insights' dizesi 0 → 'yüklenmiyor' dendi, çalışıyordu; (c) products'ta yalnız category_id'ye bakıldı, subcategory_id vardı, 433/441 alt kategorili — 'veri bozuk' hükmüyle Recep'e plan değişikliği bile önerildi, Recep: 'hep aynı hatayı yapıyorsun'. Görmesi gereken: ölçüm disiplini (birim, ayırt edici gösterge, şema önce). Nasıl yakalandı: CI çelişkisi / ağ kaydı / Recep. Diff incelemesi: HAYIR.

**Kanıt:** memory grep-c-satir-sayar-olay-degil.md (2026-09-04, #989); memory tabloya-hukum-once-sema-okunur.md (2026-09-16): 'yalnız category_id ... 441 aktif ürünün 433'ü alt kategorili'

### V45 · 09-04 · YANLIŞ 'BİTTİ': PR izleyici 'kapılar bitti, düşen 0' dedi; ci hiç koşmamıştı (DIRTY PR, birleşme ref'i yok) — diff: HAYIR

Ne oldu: #962'de yalnız Vercel kapıları koştu; ci, admin-smoke, rls-role-coverage, advisor, catalog-integrity, db-gate-precheck, boyut denetimi — yedi kapı hiç doğmadı; 'pending yok' ölçütü yokluğa kördü. Görmesi gereken: merge ritüeli (beklenen kapı kümesi ölçümü, sonradan eklendi). Nasıl yakalandı: ALTYAPI ölçüm. Diff incelemesi: HAYIR — süreç aracı.

**Kanıt:** memory var-olmayan-kapi-pending-gorunmez.md (2026-09-04 ~04:30, ALTYAPI #962): 'yedi kapı HİÇ koşmamış. Sebep: PR mergeStateStatus=DIRTY ... kapılar hiç doğmaz → pending bile görünmez'

### V46 · 09-06 · KAPI KIRMIZI DEDİ, MERGE OLDU: `ritüel | tail -4 && gh pr merge` çıkış kodunu yuttu (#1027) — diff: HAYIR

Ne oldu: merge ritüeli ekrana '⛔KIRMIZI — MERGE ETME' bastı, `&&` tail'in kodunu gördü, PR merge oldu; kırmızının sebebi taban bayatlığıydı, zarar çıkmadı (şans). Aynı gün dört merge aynı kalıpla, üçünde göz kapı yerine geçti. Görmesi gereken: merge kapısı kullanımı. Nasıl yakalandı: yazar çıktıyı okudu. Diff incelemesi: HAYIR — komut satırı kullanımı; migration'lı PR'da denk gelseydi prod'a otomatik uygulanırdı.

**Kanıt:** memory pipe-kapinin-cikis-kodunu-yutar.md (2026-09-06): 'merge-ritueli.cjs 1027 … | tail -4 && gh pr merge 1027 ... KIRMIZI ... PR yine de merge oldu'

### V47 · 09-08/09 · TEST KOŞMADI AMA YEŞİL: `vitest --reporter=basic` Vitest 4'te yok → 0 test, exit 0; 'tüm paket 203/1596' aslında alt küme — diff: HAYIR

Ne oldu: geçersiz raportör yüklenemedi, hiçbir test koşmadı, süreç 0 döndü; aynı gün bir ağaçta node_modules bağı ölü, vitest hiç başlamıyor; 09-09'da 'konformans 203 dosya 1596 test yeşil, TÜM paket' denildi, gerçek paket 334/2599 ve fark tam kırmızı dosyayı (jsonld.test.ts) taşıyordu, CI kırmızı döndü. Görmesi gereken: test raporlama disiplini (Test Files N/N sayısı). Nasıl yakalandı: ALTYAPI çıktıdaki sayıları okudu; CI. Diff incelemesi: HAYIR — yerel komut kullanımı.

**Kanıt:** memory cikis-kodu-kanit-degil-sayilar-kanit.md (2026-09-08): 'raportörü yükleyemedi, hiçbir test koşmadı ve exit 0 döndü'; EK 2026-09-09: 'Gercek paket 334 dosya / 2599 test. Aradaki fark tam da kirmizi olan dosyayi tasiyordu'

### V48 · 09-16 · ÖNLENEN SAHTE ALARM (kontrol örneği): 'products/category HTML yok' — bayat 09-14 derlemesi; taze build 247 HTML — diff: HAYIR

Ne oldu: REC-348 ölçümünde 09-14 tarihli .next çıktısında PDP/kategori HTML'i yoktu; kapı ikisini izliyor. URUN bunu bulgu değil soru işareti yazdı, taze `pnpm build` aldı: 247 HTML (PDP 94, kategori 48); aynı ölçüm REC-59'un '105 vs 245' açık notunu kapattı (105 eksik derlemeydi). Ders: derleme çıktısı üstünden sayı verirken derleme tarihi git tepesiyle kıyaslanır. Diff incelemesi: HAYIR — artefakt tazeliği. Bu vaka, disiplinin işlediği yerde yanlış alarmın nasıl önlendiğini gösteren tek kontrol örneğidir.

**Kanıt:** docs/audits/rec348-rota-sinif-kapsami-2026-09-16.md §0 ('Bu bir bulgu değil, bir soru işaretidir ve taze derleme yapılmadan bulguya çevrilmemelidir'); memory olcut-dogru-evren-yanlis-is-emri-dogurur.md 7. vaka; ops-cycle-audit-state.md EK 06:5xZ (09-16): 'SAHTE ALARM (bayat 09-14 derleme) — bulgu yazılmadı, doğru'

### V49 · META · Kendi diff-review skill'imiz: SKILL.md 8 kural vaat ediyor, betik 7 desen uyguluyor — Suspense kuralı HİÇ YOK (iki ağaçta da) — OLCULDU — diff: ?

Ne ölçüldü: .claude/skills/diff-review/SKILL.md satır 56 'useSearchParams Suspense İhlali' kuralını (kural 8) belgeliyor; scripts/check_diff_rules.py (155 satır) yalnız 7 regex taşıyor (any, DROP TABLE/COLUMN, export silme, console.log, localhost, service_role, mock dizi); `grep -i suspense|searchparams` betikte 0 eşleşme; .agent kopyası birebir aynı. Yani V3 sınıfını yakalayacağını söyleyen tek kuralımız yazılı ama kodsuz. Ayrıca belgelenen kural bile 'dosyada Suspense var mı' sorar — V3'te Suspense vardı, yeri yanlıştı; kural yazılsa da yakalamazdı. Tetik sınavı: 09-12 resmi koşumda diff-review 11/12 tetik, 8/8 tetiklemez (GEÇTİ); 09-09 kazara koşumda 8/12 (kısmi örnek). Katman hükmü: bugün 'PR incelemesi' = bu 7 regex + elle ajan incelemesi; bu yüzden V1..V29'daki 'PR incelemesi görmeliydi' hükümleri, o katmanın fiilen ne kadar dar olduğuyla birlikte okunmalı.

**Kanıt:** .claude/skills/diff-review/SKILL.md:56; .claude/skills/diff-review/scripts/check_diff_rules.py satır 17,22,27,32,37,42,47 (7 pattern), `grep -n -i 'suspense|searchparams'` çıkış kodu 1; .agent/skills/diff-review/scripts/check_diff_rules.py diff = AYNI; docs/audits/skills-eval-2026-09-12.json sonuclar[1]: tetik 11/12, tetiklemez 8/8; memory altyapi-lane-day-2026-09-09.md ~810: 'diff-review DUSTU (tetik 8/12)'

### V50 · META · CI'da otomatik LLM PR incelemesi YOK: Gemini yalnız `@gemini-cli /review` yorumuyla, auto-reviewer yalnız reviewer atar — OLCULDU — diff: ?

Ne ölçüldü: gemini-dispatch.yml yalnız yorum/inceleme gövdesi '@gemini-cli' ile başlıyorsa ve yazar OWNER/MEMBER/COLLABORATOR ise koşuyor; gemini-review.yml workflow_call ile ondan çağrılıyor; auto-reviewer.yml pull_request opened'da yalnız peckop'u reviewer olarak atıyor (kendi PR'ında atlıyor). Sonuç: 30 günlük pencerede kaçırılan 34 vakanın hiçbirinde PR'ı otomatik okuyan bir LLM katmanı yoktu; 'PR incelemesi görmeliydi' dediğim yerlerde katman = elle diff-review (V49) + isteğe bağlı ajan incelemeleri (plan-challenger, security-reviewer alt-ajanı, #1143 örneği). Bu, OCR gibi bir aracın kıyas evrenini tanımlar: dolduracağı boşluk 'otomatik ve her PR'da' olma boşluğudur, 'daha akıllı kural' boşluğu değil. Gemini'nin son 30 günde kaç kez tetiklendiği ölçülmedi.

**Kanıt:** .github/workflows/gemini-dispatch.yml:58-59 (startsWith '@gemini-cli' + author_association şartı), :100-101 ('@gemini-cli /review' → command review), :128-132 (review job → gemini-review.yml); .github/workflows/auto-reviewer.yml:3-5 (types: [opened]), :33 (reviewers: ['peckop'])


## Ölçülemeyenler / çekinceler (ajan beyanı)

1. Diff hükümleri (EVET/KISMEN/HAYIR) kural metninden ve desen listesinden akıl yürütmeyle verildi; hiçbir vakanın gerçek diff'i diff-review betiğine, gstack review'a ya da OCR'a KOŞULMADI. Recep kararı 23 (16 üçlü kıyas + 4 geçmiş vaka diff'i) tam bu koşumu istiyor; bu rapor o koşumun aday listesidir, sonucu değil.
2. REC-343 ve REC-344 Linear kayıtları açılmadı; kanıt OPS durum dosyası satırları (3581, 3583, 3613) + kod yorumları (vaat-sizintisi.test.ts:177-190, sema-tabani-is-akisi.test.ts:222-243). Kayıt gövdelerinde ek vaka ayrıntısı olabilir.
3. .agent manifest 0→25 uyarı vakası tek kaynaklı (ops-cycle-audit-state.md:3635, 09-16 07:0xZ). Hangi 25 uyarı, manifest hangi PR'da bayatladı, kaç gün gizli kaldı — ölçülmedi; 'ayrı kayıt açılacak' notu var, açıldı mı bakılmadı.
4. V1'in kök PR'ı (REC-94, 3D kategori seçici kaldırma) ve V10'un dosyası (2026-08-11) 30 günlük pencerenin dışında yazılmış olabilir; keşif tarihleri pencere içinde. Kaç vakanın kusuru pencere dışında doğdu sayılmadı.
5. Her vaka için 'sonradan kapı yazıldı mı' (onarım oranı) sistematik sayılmadı; okuduğum belgelerde çoğunluğunda INV-* kolu eklendiği yazıyor ama liste çıkarılmadı.
6. Gemini review'ın son 30 günde fiilen kaç PR'da tetiklendiği (gh run list --workflow=gemini-dispatch) ölçülmedi.
7. NotebookLM defteri sorgulanamadı (notebooklm ve notebooklm-py MCP bağlantıları bu oturumda kapalı: CONNECTION_CLOSED). Hafıza kuralı 9 'önce deftere sor' bu yüzden uygulanamadı; kaynak olarak hafıza dizini + depo belgeleri kullanıldı.
8. Yanlış alarm sayısı eksik olabilir: git log yalnız 'duzelt/fix/KIRMIZI/sahte/onar/yanlış/kaçır' desenleriyle tarandı (495/579 commit); bu desenlere uymayan başlıklı düzeltmeler listeye girmedi.
9. Bedel (dakika/USD/kayıp müşteri) yalnız belgelerde yazılı olduğu yerde alındı (V14 10 gün, V15 60+ dağıtım, V40 3 şerit 25 dk); geri kalanı için bedel ölçülmedi.
10. İnsan (Recep) tarafından yakalanan vaka sayısı kesin değil: V2, V27, V42, V44(c) belgelerde açıkça Recep'e bağlı; diğerlerinde 'insan/ajan canlı ölçüm' ayrımı belgeden her zaman çıkmıyor.

## Kaynak özeti (ajan)

Pencere 2026-08-17 → 2026-09-16. Kaynaklar: hafıza dizini (28 dosya okundu), docs/audits (10 belge), docs/skill-gozlemleri/acik (3), OPS durum dosyası (REC-343/344/manifest satırları), git log (579 commit; 495'i düzelt/fix/sahte/kırmızı deseniyle eşleşti) ve 30'dan fazla PR gövdesi. Sonuç: 48 kanıtlı vaka — 34 KAÇIRMA (kapı/inceleme yeşil, kusur gerçek), 13 YANLIŞ ALARM (kapı/ölçüm kırmızı, kusur yok ya da başka yerde), 1 ÖNLENEN sahte alarm (kontrol örneği, 09-16). Bir diff incelemesi (OCR gibi) bu 48'in 14'ünü tek başına yakalardı (diff-görünür, alan bilgisi gerekmez: yutulan hata, mükerrer anahtar, çağıransız kapı, tazelenmemiş üretilmiş dosya, dosya yolu var-dosya yok, `|| true`, kolon adı), 19'unu ancak alan bilgisi ya da çapraz dosya bağlamıyla yakalardı (KISMEN: Next.js CSR bailout, PostgreSQL/Supabase sözdizimi ve yetki varsayılanları, Vercel belgesi, Türkçe kasa I/ı, sağlayıcı sözleşmesi), 15'i hiçbir diff'te görünmez (canlı DB durumu, veri fiziği, ölçüm/raporlama disiplini, araç kullanımı, süreç). Yani 33/48 (%69) diff'te iz bırakıyor, 15/48 (%31) diff-dışı katman ister: canlı ölçüm, sabotaj sınavı, tazelik kapısı. En ağır bedelli kaçırmalar: 10 gün yanan deploy kotası (V14), 60+ dağıtımla kota tükenip master'ın 3 commit'inin ekrana çıkmaması (V15), müşteri verisi kaybı (V25), 74 ürünün 3 hafta eksik kalması (V27), fan gücünün vitrinde bin kat küçük görünmesi (V12), 3 PR'ı bloke eden tip-drift (V6). En ağır yanlış alarmlar: Recep'e giden ve Linear High açtıran sahte "site yanlış kategori veriyor" (V40), Linear'a iş yazdıran sahte "12 aile kaynaksız" (V41), 15 saat sahte kırmızı yanan duman alarmı (V35). İnceleme katmanının kendisi hakkında iki ölçülmüş bulgu: (a) kendi diff-review skill'imizin SKILL.md'si 8 kural vaat ediyor, betik 7 desen uyguluyor — kural 8 (useSearchParams/Suspense) betikte HİÇ YOK, iki ağaçta da; (b) CI'da otomatik LLM PR incelemesi yok — Gemini yalnız `@gemini-cli /review` yorumuyla, auto-reviewer yalnız reviewer atar. Bu iki bulgu, "PR incelemesi görmeliydi" dediğim vakalarda o katmanın fiilen 7 regex + elle ajan incelemesi olduğunu söyler. Tekrarlayan kök sınıf (16 vakada): "ölçüt keskin, evren yanlış" — kapı/ölçüm doğru şeyi arıyor ama yanlış kümede; bunu OCR gibi bir diff okuyucu değil, evren muhafızı + sabotaj kolu yakalıyor. Recep'in çerçevesine doğrudan cevap: dış aracın (OCR) katkı alanı 14+19=33 vakanın "diff'te iz bırakan" kısmıdır; 15 vaka için hiçbir diff aracı işe yaramaz ve orada kendi kancalarımız (evren muhafızı, sabotaj sınavı, tazelik satırı, canlı ölçüm) ayırt edici katmandır — bunlar ayrı tutulmalı, dış araçla yer değiştirmemeli.
