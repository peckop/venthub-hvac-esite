# Aday skill tablosu: üç ihtiyaç, kurulum yok (REC-515, YTN-18, 2026-10-12)

Yazan: YETENEK. Emir: OPS 12 Ekim 14:25 ve 15:00 yönü (REC-515 yalnız üç ihtiyaçla sınırlı, bugün yalnız aday tablosu).
Kurulum YAPILMADI; dış kod kurulumu ayrı onay ister (güvenlik + lisans).

> **OPS onayı 12 Ekim 2026 (Recep: "alacaklarımız varsa alalım, gereksiz denetleme yok"):** yukarıdaki "kurulum yok" hükmü
> bu emirle değişti. İlk dalga (PR #1898, tek geçiş inceleme: lisans + gövdede betik/ağ çağrısı): `web-performance`, `tech-stack`,
> `payments-webhooks`, `database-migrations`, `geo-fundamentals`, `write-seo-geo-content`; hepsi "adıyla çağır". `nextjs-modern`
> alınmaz. `chart-data-extractor` **ölçüldü (§7) ve alınmaz**: KATALOG'da deterministik eğri hattı (KTL-7 `egri_cikar.py`) zaten var. Aşağıdaki tablo kurulum
> öncesi durumu anlatır; kurulu olanlar belge `skill-departman-setleri-2026-09-30.md` §6.3'tedir.
Cetvel: `docs/standards/execution-method-standard.md`, `docs/audits/skill-departman-setleri-2026-09-30.md` (set bağları, 35 KB / 8 skill sınırı),
`docs/audits/gstack-skill-envanteri-2026-09-15.md` (lisans/kurulum ölçütü), kapı `INV-SKILL-BAGLI-1`.

## 1. Üç ihtiyaç, tek bakışta hüküm

| İhtiyaç | Hüküm | Önerim |
|---|---|---|
| **KATALOG**: PDF tablo ve eğri verisi çıkarma (OCR dahil) | Tablo + OCR için yeni skill gerekmiyor: kullanıcı düzeyinde kurulu `pdf` zaten pdfplumber ile tablo, pytesseract ile OCR anlatıyor. **Eğri** (fan P-Q eğrisi) için **KATALOG'da deterministik hat zaten var**: `venthub-pdf-ingestor/scripts/kaynak_dizini/egri_cikar.py` (KTL-7, karar 318/319; vektör çizim ya da piksel izleme, çıpa kapısı ±%2, çıktı `kaynak-dizini/egriler.jsonl`). Bulunan tek dış aday görüntüyü model okuyarak çıkarıyor, algoritmik izleme değil; ölçüldü, §7. | `pdf`'i KATALOG'a bağla (yeni kurulum yok); eğri için `egri-profilleri.json`'a profil eklenir, **`chart-data-extractor` alınmaz** |
| **GEO-SEO**: uygulayıcı çalışan skill seti (HRT-23) | Parçalar var: `web-performance` (1.1.0 paketi, MIT) + kurulu SEO eklentileri; eksik olan GEO (yapay zekâ alıntılanabilirliği) için küçük, ağ çağrısı yapmayan bir aday bulundu | Uygulayıcı seti: web-performance + geo-fundamentals (+ improve-aeo-geo ikinci dalga) |
| **BLOG**: teknik rehber yazısı ve yapılandırılmış veri | Rehber yazısı çerçevesi ve JSON-LD üreten iki aday bulundu, ikisi de MIT, ağ çağrısı yok | write-seo-geo-content önce; create-geo-charts ikinci |

## 2. Okuma ve dürüstlük notu

- **"SKILL.md okundu" sütunu üç düzeydir:** **Tam okundu** = ham dosya `gh api` ile indirilip satır satır okundu; **Yapı okundu** = ham dosya indirildi, açıklama satırı, tüm başlıklar ve riskli kalıp taraması yapıldı, gövde satır satır okunmadı; **Yalnız açıklama** = yalnız tanım satırı görüldü. Betik dosyaları (`.py`, `.mjs`) yalnız kalıp taramasından geçti, satır satır okunmadı.
- Dış taramanın ölçüsü: 4 arama (PDF tablo/OCR, eğri sayısallaştırma, GEO/teknik SEO, teknik rehber + JSON-LD) ve 9 ham dosya. Arama motoru özeti **kanıt sayılmadı**; her satırın düzeyi ham dosyaya dayanır.
- **Kurulumdan önce** "Yapı okundu" düzeyindeki dosyalar baştan sona okunur (OPS onayı sonrası, ayrı güvenlik adımı).
- **Yargı kimin:** departman eşlemesi benim (YETENEK), kullanımla ölçülmüş değil. Dış skill'lerin çalışma kalitesi (çıktı doğruluğu) hiçbirinde ölçülmedi.
- **Güvenlik taraması** her dosyada aynı kalıp: ağ çağrısı, kurulum komutu, silme, süreç başlatma, ortam değişkeni. Sonuç tabloda ayrıca yazılı.

## 3. Aday tablosu (departman başına en fazla 3)

| Skill | Kaynak (depo, lisans) | SKILL.md okundu mu | Departman | Hangi iş türünü hızlandırır | Güvenlik taraması | Önerim |
|---|---|---|---|---|---|---|
| `pdf` | anthropics/skills, `skills/pdf`; lisans: **Proprietary** (LICENSE.txt şartları okunmadı, yeniden dağıtım varsayılmaz). Zaten kullanıcı düzeyinde kurulu | Yapı okundu (315 satır; başlıklar ve ilk bölüm) | KATALOG | Metin katmanı olan PDF'ten tablo çıkarma (pdfplumber); taranmış sayfada OCR (pytesseract + pdf2image) | Tek kurulum satırı `pip install pytesseract pdf2image` (OCR için); başka yok | **Kullan, kopyalama.** Bağımlılığın `venthub-pdf-ingestor` ortamında kurulu olduğu ölçülmedi |
| `pdf-extractor` | jmagly/aiwg, `agentic/code/addons/doc-intelligence/skills/pdf-extractor`; depo MIT, dosyada lisans satırı yok | Yapı okundu (230 satır; özet + kalıp taraması) | KATALOG | Taranmış PDF için OCR akışı: 300 DPI üstü, güven eşiği, karmaşık tablo için camelot yönlendirmesi | Ağ yok; örnekte parola komut satırında düz metin (bizde kullanılmaz) | Öncelik 2: `pdf`'ten farkı yalnız OCR güven eşiği ve çözünürlük notları; yöntem notu olarak al, kurulumu gerekmez |
| `chart-data-extractor` | mohitagw15856/pm-claude-skills, `plugins/pm-data/skills/chart-data-extractor`; MIT | **Tam okundu** (102 satır) | KATALOG | Grafik görüntüsünden (çizgi, çubuk, saçılım) x-y değerleri, güven düzeyi (yüksek/orta/düşük) ve CSV; fan eğrisi için tek aday | Ağ, kurulum, silme yok | **Ölçüldü (§7), alınmaz:** yöntem model görme yeteneği, algoritmik izleme değil; skill kendisi "gridline aralığından ince değer uydurma" ve "log eksen yanlış okunursa büyüklük mertebesi kayar" uyarısını yapıyor. Değerler katalogdaki tablo değeriyle çapraz kontrol edilmeden veriye yazılmaz |
| `web-performance` | WrongStack `@wrongstack/core` 1.1.0 paketi (yerelde), MIT | Evet (gövde okundu, 12 Ekim) | GEO-SEO (ve URUN) | LCP/INP/CLS eşikleri, "üretimde aynı koşulda önce/sonra" ölçüm yöntemi | Ağ yok (yerel paket) | **Öncelik 1.** Uygulayıcı setine bağla; bizde `vercel-react-best-practices` yalnız kural listesi |
| `geo-fundamentals` | vudovn/ag-kit, `.agents/skills/geo-fundamentals`; MIT | **Tam okundu** (159 satır); `geo_checker.py` (274 satır) yalnız kalıp taraması | GEO-SEO | GEO ile SEO farkı, yapay zekâ alıntısı için içerik ve teknik kontrol listesi (Article/Person/FAQPage şeması, tarih damgası, tarayıcı erişimi); yerel dizini tarayan denetim betiği | Betik: ağ, kurulum, silme, süreç kalıbı yok; skill `allowed-tools: Read, Glob, Grep` (salt okuma) | **Öncelik 1.** 3,6 KB, set bütçesini zorlamaz. **Dikkat:** "RAG ağırlıkları (~%40, ~%20…)" tablosu kaynaksız; bu yüzdeler içeriğe ya da rapora sayı olarak taşınmaz |
| `improve-aeo-geo` | onvoyage-ai/gtm-engineer-skills; MIT | Yapı okundu (561 satır, 20,8 KB; tüm başlıklar) | GEO-SEO | Kodda JSON-LD, `llms.txt`, `robots` düzeltmeleri; Next.js örneği var | Ağ yok; "hosted aeo-audit.sh" dış hizmetine atıf var (kullanılmaz) | Öncelik 2: **kodu değiştirir** (yalnız uygulayıcı rolü), 20 KB yer kaplar; set bütçesi dolarsa alınmaz |
| `write-seo-geo-content` | onvoyage-ai/gtm-engineer-skills; MIT | Yapı okundu (419 satır, 18,4 KB; tüm başlıklar) | BLOG | Sayfa tipi çerçeveleriyle (karşılaştırma, rehber, kullanım, öğrenme) frontmatter'lı markdown taslağı | Ağ, kurulum, silme yok | **Öncelik 1.** Ürün odaklı satış dilinde; teknik rehber için "guide" çerçevesi kullanılır. Yönetmelik/sertifika iddiası ek kuralla resmi kaynaktan doğrulanır |
| `create-geo-charts` | onvoyage-ai/gtm-engineer-skills; MIT | Yapı okundu (399 satır, 17,4 KB; tüm başlıklar) | BLOG | Satır içi SVG grafik + tablo + JSON-LD ile alıntılanabilir veri: ölçü ve kapasite tabloları | Ağ yok; örnek JSON-LD'de `license: CC BY 4.0` yazıyor (bizim içerik lisansımız değil, ek kuralla değiştirilir) | Öncelik 2 |
| `doc-coauthoring` | WrongStack 1.1.0 paketi, MIT | **Yalnız açıklama** | BLOG, HARITA | Uzun teknik belge/RFC yazımı; blog için zayıf (belge odaklı) | Ağ yok (yerel paket) | Öncelik 3: alma |

Ek, aynı üç ihtiyaca bağlı ama bu tabloda **değerlendirilmeyen**: `audit-website-aeo` (onvoyage-ai, MIT; 11,7 KB; tarayıcı betiği 45 KB):
ağ ve süreç kalıpları tarandı, yalnız hedef URL'ye `fetch` eder, `--out` dosyasına yazar; betik **tam okunmadı**. GEO-SEO için denetim ölçümü gerektiğinde ikinci dalgada ele alınır.

## 4. Departman setine yansıması (HRT-23 için taslak)

- **GEO-SEO uygulayıcı seti (öneri):** `web-performance` + `geo-fundamentals` + mevcut `venthub-architecture`, `supabase`, `react-modern`; ikinci dalga: `improve-aeo-geo`.
  Kurulu eklentiler (`searchfit-seo`: seo-audit, schema-markup, technical-seo, on-page-seo; `seo-ecommerce`; `search-console`) **gövdesi bu turda okunmadı**; uygulayıcı seti kurulurken çakışma ölçülür.
- **BLOG:** `write-seo-geo-content` + `create-geo-charts` (ikinci dalga); JSON-LD için kurulu `searchfit-seo:schema-markup` ile çakışması ölçülmedi.
- **KATALOG:** `pdf` bağlanır; `chart-data-extractor` yalnız ölçümden sonra.
- Set bütçesi (35 KB / 8 skill) ve oturum yükü bütçesi (`skill-yuku-butcesi`, 24 KB açıklama) kurulum PR'ında ölçülür; bu belge bütçeyi değiştirmez.

## 5. Ayrı bulgu: 24 skill'in gövdeleri bizde olmayan skill'lere atıf yapıyor

12 Ekim doğrulamasında (24/24 skill yüklendi, hepsi 1.1.0) gövdelerde şu atıflar çıktı; hepsi paketin `skills/` dizininde **var**, bizde kurulu değil:

| Atıf yapılan | Atıf yapan skill'ler | Not |
|---|---|---|
| `tech-stack` | research-web, security-scanner, web-platform-baseline | Üç skill'in atfı; en yüksek öncelikli |
| `output-standards` | bug-hunter, multi-agent, prompt-engineering | Araç eşlemesinde bir kısmı "yok sayılır" yazıyor |
| `audit-log`, `evidence-audit` | data-governance, multi-agent | |
| `design-system`, `design-craft`, `design-critique` | react-modern, web-platform-baseline | Yerelde `venthub-tasarim-dili` var |
| `code-quality` | refactor-planner | Bizde `fallow`, `pnpm knip` |
| `mailbox-bridge`, `wrongstack-mailbox`, `auto-review` | wrongstack-mailbox-mcp, mnemosyne | `mailbox-bridge` bizde kapalı (HTTP köprüsü) |

Kural: atıf, hedef skill'i yüklemeden **sessizce yok sayılır**; bu bir hata değil ama ajanın gövdede "şu skill'e bak" dediği yerde boşluğa düşer. Çözüm iki yönlü: (a) en çok atıf alan `tech-stack` alınır; (b) kalanlar için ilgili skill'in "Araç eşlemesi"ne "bizde yok, şunu kullan" satırı eklenir. Karar OPS/Recep'te; bu belge yalnız ölçümü yazar.

## 6. Elenenler ve önceki sürüm

- 1.1.0 paketindeki 78 yeni skill'in 52'si bu üç ihtiyaç dışında ya da bizim yığınla uyumsuz; `nextjs-modern` **uyumsuz** ("en son kararlı sürümü hedefle: Next 16", bizde 15.5).
- WrongStack `pdf` yalnız PDF **üretim** (headless Chromium baskı); çıkarma yok, KATALOG için uygun değil.
- İlk sürüm (26 adaylı, 16 departmanlı tablo) PR geçmişinde, commit `b95efdc3c`'de duruyor; OPS yönüyle bu belge üç ihtiyaca daraltıldı.

## 7. `chart-data-extractor` ölçümü (12 Ekim 2026): alınmaz

**Soru:** görme tabanlı bir skill KATALOG'un eğri ihtiyacına yarar mı? **Referans:** KTL-7 hattının kapıdan geçmiş çıktısı
(`venthub-pdf-ingestor/kaynak-dizini/egriler.jsonl`: LINEO 315 V0 kod 17010, `Commercial_Ventilation_in_Line_1.pdf` s.12, iki eğri: maks ve min hız).

**Yöntem:** sayfa 4x büyütmeyle görüntüye çevrildi; skill'in tarif ettiği yöntemle (eksen etiketi ve ızgara çizgisinden piksel→değer) 9 noktada
basınç gözle okundu; okunan değer hattın doğrusal örneklenmiş eğrisiyle karşılaştırıldı (tam ölçek 826 Pa).

| Eğri | Q (m³/h) | Gözle (Pa) | Hat (Pa) | Fark (Pa) |
|---|---|---|---|---|
| maks hız | 0 | 736 | 734,9 | +1,1 |
| maks hız | 520 | 490 | 484,7 | +5,3 |
| maks hız | 1040 | 323 | 323,0 | 0,0 |
| maks hız | 1560 | 193 | 191,4 | +1,6 |
| maks hız | 2080 | 46 | 45,6 | +0,4 |
| min hız | 0 | 423 | 424,7 | -1,7 |
| min hız | 520 | 244 | 244,9 | -0,9 |
| min hız | 1040 | 117 | 114,7 | +2,3 |
| min hız | 1560 | 17 | 18,0 | -1,0 |

**Sonuç:** temiz, ızgaralı vektör grafikte görme okuması hatta yakındır: en büyük fark 5,3 Pa (tam ölçeğin %0,64), ortalama 1,6 Pa.
Yani yöntem kaba değildir; **sorun doğruluk değil, yerine kimin geçeceği:**

- **Referans zaten var ve daha sıkı.** Hat deterministiktir (aynı girdi, aynı çıktı), çıpaya (kitapçıktaki azami debi ve basınç) ±%2 kapısı ve
  monotonluk kapısı vardır, "nokta uydurulmaz" kuralı kodda yazılıdır. Görme okuması bunların hiçbirini vermez.
- **Tekrarlanamaz.** Aynı grafik her okumada birkaç Pa oynar; veritabanına giren değer yeniden üretilebilir olmalıdır (`catalog-ingestion-standard.md` §6.3).
- **Ölçüm sınırı.** Tek sayfa, temiz vektör grafik, ızgaralı. OPS "3 eğri" istedi; yalnız **2 eğrinin** kapıdan geçmiş referansı var. Üçüncü
  eğri için referans ve çıpa olmadığından **ölçülemedi**. OPS'un andığı "Lineo Quiet katalog s.18" (`LINEO_QUITE_KATALOG.pdf`, 12 Ekim ölçüldü):
  min/med/max debi, basınç ve güç **tablosu** ("TECHNICAL AND PERFORMANCE DATA"); sayfadaki 283 vektör çizimi tablo çizgisi, eğri grafiği değil.
  Yani s.18 eğri değil **tablo** konusudur (pdfplumber ile çıkarılır); ölçülen eğriler `Commercial_Ventilation_in_Line_1.pdf` s.12'dedir.
- **Olası tek yeri:** hattın okuyamadığı (çıpasız, raster) sayfada danışma amaçlı hızlı bakış; veriye yazılmaz.

Karar: **alınmaz.** KATALOG yeni eğri istediğinde `egri-profilleri.json`'a profil eklenir (sahibi KATALOG/ARAÇ).
