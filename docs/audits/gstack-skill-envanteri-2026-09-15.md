# gstack skill paketi — tam envanter ve hüküm (70 skill)

**Niçin:** Recep 2026-09-15: *"gstack paketinde adetlice skills var. tümünü değerlendirmek lazım."*
Tek bir skill'i (`/plan-eng-review`) koşturup paket hakkında hüküm vermek ölçüsüzdü; bu dosya
paketin **tamamını** aynı ölçütlerle tarar.

**Yöntem:** dört salt-okuma alt ajan, paralel. Her skill için beş soru — ne yapar · ne zaman
tetiklenir · bizde karşılığı var mı · neye bağımlı · VentHub'a uygun mu. Sonra tek hüküm.
Hiçbir skill **çalıştırılmadı**, hiçbir dosya değiştirilmedi, ağa çıkılmadı.

> ⚠**Bu envanterin sınırı, okuyan için:** ölçüm her skill'in `SKILL.md` dosyasının **ilk ~60
> satırını** okudu. gstack skill'lerinde o satırlardan sonrası büyük ölçüde ortak "preamble"
> (telemetri, onboarding, soru ayarı) kalıbıdır ve **asıl mekanik 60. satırın ötesindedir.**
> Yani bu envanter "ne yaptığını" bilir, "nasıl yaptığını" tam bilmez. **DENE** hükmü verilen her
> skill, kullanılmadan önce baştan sona okunur — özellikle veritabanına, dala ya da CLAUDE.md'ye
> dokunacak olanlar.

---

## 1. Sayım

| Hüküm | Adet | Ne demek |
|---|---|---|
| **DENE** | 9 | Bugün gerçek bir boşluğu dolduruyor |
| **ÇAKIŞIYOR** | 20 | Bizde karşılığı var; ikincisi veri/karar bölünmesi üretir |
| **ATLA** | 29 | Bu projeye uygun değil |
| **BELİRSİZ** | 12 | Tanıtımdan anlaşılmadı ya da bugün ihtiyaç yok |

## 2. DENE — dokuz skill, öncelik sırasıyla

| # | Skill | Doldurduğu boşluk | Bağımlılık | Risk |
|---|---|---|---|---|
| 1 | `accessibility` | Erişilebilirlik (WCAG) denetimi — bizde **hiç yok**; CLAUDE.md kural 8 a11y istiyor ama ölçen kapı yok | Lighthouse / axe, dış API yok | Düşük |
| 2 | `seo-ecommerce` (yalnız on-page) | Ürün sayfası şema/başlık/meta denetimi — e-ticaretiz, bizde ayrı bir ürün şeması denetimi yok | On-page modülü **dış API'siz**; marketplace modülü ücretli (DataForSEO) ve bize uymuyor | Düşük, **yalnız on-page** |
| 3 | `careful` + `guard` | Yıkıcı komut kapısı (`rm -rf`, `DROP TABLE`, `push -f`, `reset --hard`) — bugün bu disiplin **yazılı kurala** dayanıyor, otomatik kapıya değil | Yerel bash hook | Düşük; kural 13'ü **sertleştirir**, gevşetmez |
| 4 | `xlsx` | Excel okuma/yazma/formül — fiyat listesi ve admin raporu gibi işler için karşılığımız yok | openpyxl/pandas/LibreOffice, hepsi yerel | Düşük |
| 5 | `diagram` | Metinden mermaid + düzenlenebilir `.excalidraw` + SVG üretimi | **Hiç dış bağımlılık yok** | Düşük |
| 6 | `benchmark` | Core Web Vitals / paket boyutu için taban çizgisi ve PR başına karşılaştırma | Lighthouse; **çıktısını proje dışına yazıyor** | Orta — çıktı projeye taşınmalı |
| 7 | `make-pdf` | Markdown → yayın kalitesinde PDF (Recep'e sunulacak raporlar) | pandoc benzeri | Düşük |
| 8 | `freeze` | Oturum boyunca düzenlemeyi tek dizinle sınırlama | Yerel hook | Düşük |
| 9 | `plan-ceo-review` | Ticari/kapsam ekseni — `plan-challenger` teknik, bu "yeterince iddialı mı" diye soruyor | Yok | Orta — kapsam kaymasına davet edebilir |

## 3. TEHLİKELİ ÜÇLÜ — bunlar "işe yaramaz" değil, **kapı deler**

Bu üçü kendi başına karar verip uygulama eğiliminde ve doğrudan bizim onay kapılarımıza çarpıyor.
Ayrı başlık hak ediyorlar çünkü "atla" demek yetmez — **niçin** atlandığı yazılı olmalı.

**`ship`** — "kod hazır" denince kendi başına test koşturup sürüm numarası artırıp commit atıp
push edip PR açıyor, üstelik bunu proaktif yapmayı teşvik ediyor. Bizde migration içeren bir PR
master'a merge edilince **prod veritabanına otomatik uygulanıyor** (kural 13) ve tam bu yüzden o
adım Recep'in açık onayına bağlı. Bu skill o onayı devre dışı bırakabilecek tek araç.

**`land-and-deploy`** — PR'ı merge edip dağıtımı bekleyip canlıyı doğruluyor. Aynı gerekçe:
merge kararı bizde otomatik değil, olamaz.

**`spec`** — belirsiz isteği **GitHub Issue**'ya çeviriyor. Bizim iş takibimiz Linear ve bu
yazılı bir karar. Bu skill yanlış sisteme kayıt açar; "gereksiz" değil, **aktif olarak yanlış**.

## 4. PARALEL HAFIZA ADASI — beş skill, tek sorun

`retro` · `context-save` · `context-restore` · `learn` · `setup-gbrain` / `sync-gbrain`

Beşi de kendi kalıcı kaydını tutuyor (`~/.gstack/...`, `.context/retros/*.json`,
`timeline.jsonl`, `learnings.jsonl`) ve bunlar bizim kayıtlarımızla **hiç konuşmuyor**.
Bugün zaten Linear (iş) + NotebookLM defteri (bilgi) + `MEMORY.md` (ders) + `DURUM-TAKIP.md`
(durum) + CodeGraph (kod) var. Altıncı bir ada eklemek, hafızadaki *"kayıt sistemim dağınık"*
notunun tam tersi yönde bir adımdır.

**Hüküm:** bu beşi kullanmıyoruz. Aynı ihtiyacı bizim kendi kayıtlarımız karşılıyor.

## 5. HAM SÜRÜMLER — üç skill, sessiz risk

`gstack-qa` · `gstack-office-hours` · `gstack-investigate`

Bu üçünün VentHub'a **uyarlanmış** sürümü zaten `.claude/skills/` altında duruyor (`qa`,
`office-hours`, `investigate`). Paketteki ham sürümler bizim kurallarımızı, Türkçeyi, kapı
düzenimizi ve "plan önce onay sonra kod" ilkesini **bilmiyor** — üstelik kendi başına commit
atma davranışı taşıyorlar.

**Hüküm:** ham sürümler çalıştırılmaz. Yanlışlıkla çağrılma riski var çünkü adları benzer.

## 6. ATLA — 29 skill, üç gerekçe kümesi

- **Mobil uygulama yok (5):** `ios-clean`, `ios-design-review`, `ios-fix`, `ios-qa`, `ios-sync`.
- **Hedef kitlemiz geliştirici değil (2):** `devex-review`, `plan-devex-review` — VentHub bir
  müşteriye dönük e-ticaret sitesi; dışarıya API/SDK sunmuyoruz.
- **Bizde karşılığı zaten var ya da bize uymuyor (22):** `browse` / `connect-chrome` /
  `open-gstack-browser` / `scrape` / `setup-browser-cookies` (Playwright zaten kurulu) ·
  `search-console` (aynısı zaten kurulu) · `review` (bizim `diff-review` VentHub'a özel beş
  başlığı biliyor, bu bilmiyor) · `codex` (ikinci görüş mekanizmamız var) · `cso` (güvenlik
  denetim ailemiz var) · `design-*` ailesi (kendi tasarım dilimiz ve Design ajanımız var) ·
  `document-generate` / `document-release` (belge zincirimiz CLAUDE.md'yi elle yönetiyor, bu
  skill onu yeniden yazmaya kalkar) · `setup-deploy` (aynı sebep) · `scroll-craft` (pazarlama
  sayfası paradigması, mimarimizle uyumsuz) · `skillify` (girdisi `scrape`, kullanmıyoruz) ·
  `claude-api` (üretim kodumuz LLM API çağırmıyor) · `benchmark-models` · `plan-tune` ·
  `gstack-upgrade` · `_gstack-command` · `pair-agent` (dış ajana tarayıcı erişimi — güvenlik
  yüzeyi büyütür) · `landing-report` (versiyon slotu kavramı bizde yok) · `taste-skill` (kendi
  kapsamını "dashboard ve veri tablosu değil" diye tanımlıyor; bizim sayfalarımız tam öyle).

## 7. Sistemik bulgu: ortak başlangıç betiği

İki ayrı alt ajan **bağımsız olarak** aynı şeyi buldu: skill'lerin çoğu
`~/.claude/skills/gstack/bin/gstack-skill-start` adlı ortak bir betiğe bağlı ve o betik kendi
telemetrisini, onboarding'ini ve oturum izlemesini çalıştırıyor.

Bu, **DENE** hükmü verilenler için bile geçerli. Yani paketten tek bir skill kullansak bile
yanında gstack'in kendi durum katmanı geliyor. Bugünkü turda bu katman kapatıldı (gerekçeleri
`gstack-yan-yana-2026-09-15.md`'de); kapalı olduğu sürece araç bu projede **birikmiyor**, açık
olduğunda ise ikinci bir durum kaydı doğuyor.

**Hüküm:** kullanacağımız skill'lerin çıktısı **bizim** kayıt yüzeylerimize taşınır
(`docs/audits/`, Linear). gstack'in kendi deposu referans kabul edilmez.

## 8. Sıradaki adım

Bu envanter bir **hüküm** dosyasıdır, emir değil. **DENE** listesindeki dokuz skill için sıra ve
kapsam kararı Recep'e aittir; her biri kullanılmadan önce `SKILL.md`'si baştan sona okunur ve
"bizim kayıt yüzeyimize yazar" şartı sağlanır.

İlgili: `gstack-yan-yana-2026-09-15.md` (aynı gün, `/plan-eng-review` ile `plan-challenger`
karşılaştırması ve dört sorunun taşınması hükmü).
