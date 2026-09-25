# Kararlar — Altyapı, Kapılar ve Belge Hattı (Linear belgesinin TAM dışa aktarımı · 2026-09-25 ayna: K1–K10)

<!-- kaynak_id: 5f43fac5-f2a9-40d7-8da5-86bf5235764e · kaynak_updatedAt: 2026-09-25T12:38:05.226Z · kopya: 2026-09-25T12:43Z -->
<!-- Tazelik yalnız yukarıdaki damgayla ölçülür (kaynak_updatedAt > kopya ise bayat). Tek kopya kuralı: bu dosyanın başka yerde ikinci kopyası tutulmaz. -->

> Karar SSOT'u Linear'dır; bu dosya NotebookLM defteri ve Design projeleri için kopyadır. Çelişkide Linear kazanır.

Tek kaynak; karar buraya yazılmadan verilmiş sayılmaz.

## K1 · Companion taşıyıcısı KAPALI (2026-08-31, teyit 2026-09-03, Recep)

mimo 08-28'de bitti; Haiku açılmaz (abonelik harcar); NLM ikizi de şimdilik kullanılmıyor (CodeGraph + Linear yeter). Companion bayatlığı bilinen ve kabul edilmiş eksik. Bir daha sorulmaz.

## K2 · C4 kapısı sayıma döndü (2026-09-03, Recep kararının sonucu; PR #961)

Companion'sız dosya 7 gün sonra filoyu BLOKLAMAZ; sayılır ve adıyla raporlanır (`scripts/hijyen/companion-sayim.cjs` tek kaynak). Eşik uzatılmaz, kapı silinmez. ~~C5 (bayat companion) bloklamaya devam eder.~~ → **K9 ile değişti (09-05):** C5 de taşıyıcı anahtarına bağlanır.

## K3 · Üretilmiş dosyaya dokunan iş iki commit'tir (2026-09-03)

Kaynağı commit et → derle → manifesti AYRI commit'le. Aynı commit'e koymak INV-DOC-4b'yi yapısal olarak kırmızı yapar (#958, #960 dersi).

## K4 · Kapı değişikliği sabotaj kanıtı ister

Yeni/değişen her kol: sabotajla kırmızı verdiği ve düşen kolun doğru kol olduğu PR'da yazılır. "Kapı var" sanılan ölçmeyen kol yasak.

## K5 · Migration = prod (kural 13)

Migration içeren PR yalnız Recep onayıyla merge edilir. Migration'sız yeşil PR'ı sahibi şerit self-merge eder.

## K6 · Repo PUBLIC (2026-08-15)

Yeni sır geri dönüşsüz; self-hosted runner yok; `permissions:` yazılıyorsa `contents: read` zorunlu.

## K7 · Filo mekanizması

Gözcü + cron + prob/doğrula ritüeli; "koptu" hükmü çift sinyal ister (nabız VE not sessizliği). İş yönetimi Linear; registry salt arşiv.

## K8 · Üretilmiş toplamalar DONDURULUR (2026-09-04; Recep yetkiyi OPS'a bıraktı, OPS kararı)

8 üretilmiş dosya (docs/\*\_master.md, system_tree.md, artefakt_manifest.json) özellik PR'larında YENİDEN ÜRETİLMEZ; depoda kalır. Yeniden üretim yalnız dijital ikize yükleme öncesi tek "belge tazeleme" PR'ında. Kapı kolları dondurulmuş modda uyarı + sayım, tazeleme PR'ında kırmızı. Sıfır tüketicili standards_master.md ve kayitlar_master.md git'ten çıkar. "Hepsi çıkar" (A) ikiz kararı sonrasına ertelendi. Sebep: günde 5 taban tazelemesi; 27 tüketici; INV-DOC-4b'nin "ikize giden = depo hali" güvencesi korunur. İş: REC-132.

## K9 · Companion sistemi UYKU KİPİ — tek taşıyıcı anahtarı (2026-09-05, Recep; emir REC-142)

**Recep'in kararı (URUN'a kendi sözleriyle, OPS'a "işi sen yönet, net çözüm"):** belirli bir süre belge (companion) üretimi YAPILMAZ; yapılacağı zaman KALDIĞIMIZ YERDEN sorunsuz devam edilir. Buradan çıkan hüküm:

* **Tek anahtar:** taşıyıcı durumu tek dosyada (KAPALI); companion'a bakan bütün kapılar (C4, C5, C6/#640, INV-DOC-4b dondurulmuş mod, yoklama sayımı) ve kancalar (post-commit, post-merge) YALNIZ onu okur.
* **Kapalıyken:** kapılar SAYAR + adlarıyla RAPORLAR + BLOKLAMAZ; her koşumda borç listesi dosyası yazılır (URUN eklemesi: "kaldığımız yer" kayıtlı olsun); kancalar HİÇ üretmez (çalışma ağacı artığı sıfır). **Açıkken:** eski bloklayan davranış, tek çevirme (Haiku'ya dönüş REC-67).
* **Yasaklar:** companion .md silinmez (bilgi korunur; silme 57 dosyaya çıkar ve kararla bağdaşmaz); eşik uzatılmaz; kapı silinmez.
* **Niçin (kök sebep):** 08-28'de üretici kapandı, tazelik kapıları ve üretim kancaları açık kaldı → aynı çelişki her hafta başka koldan kilit üretti (09-03 C4, 09-04 INV-DOC-4b, 09-05 C5; 7 gün penceresinde 49 dosya daha). Ölçüm: ALTYAPI + OPS 09-05 (37 worktree'de 412 bekleyen, 368'i .md).
* **Açık soru (1-2 hafta sonra, Recep):** yeni "Venthub Proje Takip" defteri companion'ları dışlıyor, kod soruları CodeGraph'ta → companion sistemi emekliye mi? Bu karar altyapıyı KORUR, o soruyu öne çekmez.

## K10 · Vitrin sayfaları HAZIR DOSYADIR; kiracı sorusu sayfanın DIŞINDA sorulur (2026-09-08, Recep; OPS teklif + URUN görüş)

**Karar:** Ana sayfa, kategori, marka, ürün ve bilgi merkezi sayfaları derleme anında hazır dosya olarak üretilir; tazeleme webhook ile, `revalidate = 3600` yedek (cetvel `rendering-cache-standard.md` §1 zaten böyle diyordu, kod uymuyordu). Bir vitrin sayfası render yolunda `headers()` **/** `cookies()` **/** `searchParams` **OKUMAZ**; okuyan sayfa hazır dosya olamaz ve bu YASAKTIR. Hesap, sepet, ödeme ve admin dinamik kalır (doğru olan bu).

**Kiracı (çok-kiracılı yapı,** REC-88 **parkta):** kiracı bugün DERLEME SABİTİ (DB'de tüm satırlar tek tenant_id, URUN 09-08 ölçtü). Yarın kiracı geri gelince seçim SAYFANIN DIŞINDA kurulur: ya kiracı başına ayrı yayın (aynı kod, kiracı derleme sabiti, ayrı alan adı) ya da kiracı adres/derleme parametresi olup her kiracının sayfaları önceden üretilir. İkisi de sayfaları hazır dosya tutar. Bugünden mekanizma kurulmaz (kullanılmayan yapı çürür). Recep sorusu: "kiracı olsa da olmasa da neden yapılamıyor?" → yapılabiliyor; engel kiracı değil, sorunun sayfanın içinde sorulmuş olmasıydı.

**Uygulama sırası (URUN şartı):** önce kategori PR'ı (tenant sabiti + `?page=` kalkar, sayfa boyu 24→48; ölçüm: en kalabalık kategori 34 aile, ikinci 12; adres değişmez), sonra ana sayfa AYRI PR. Kapılar: (1) `.next/server` altında üretilen kategori + ana sayfa HTML sayısı beklenenle eşit değilse KIRMIZI (build etiketi ayırt etmiyor: 46 yol ● yazıp 0 dosya üretti); (2) en kalabalık kategori > sayfa boyu ise KIRMIZI; (3) HTML boyut kapısı. **Kabul ölçütü (URUN uyarısı):** statiğe geçtikten SONRA canlıda bir DB değişikliği yapılıp webhook tazelemesinin sayfayı gerçekten değiştirdiği ölçülür (hiç sorulmamış adres, MISS/Age 0); bugün her istek taze render olduğu için bozuk webhook maskeli olabilir. Ölçülmeden iş bitmiş sayılmaz.

**Niçin:** 09-08'de ölçüldü: ana sayfa + 46 kategori her ziyarette sunucuda üretiliyor (`x-vercel-cache: MISS`, `age: 0`), sebep iki tane ve VE bağlı (`getTenantConfig` → `headers()`; `?page=` searchParams), biri onarılıp diğeri kalırsa kazanım sıfır. Kullanılmayan bir yetenek için en çok ziyaret edilen iki yüzey hız ve maliyet ödüyordu.

DURUM: İŞ → REC-59 (Backlog; Recep "go" bekliyor). Kiracı şartı → REC-88 yorumunda da var (parktan çıkış şartı).

---

*2026-09-04 ilk sürüm (OPS). 2026-09-05 K9 eklendi, K2 notu (OPS). 2026-09-08 K10 eklendi (OPS, Recep talimatıyla; yorum arşive gider, karar belgesi kalır).*

## 2026-09-16 — Karar 33: migration merge kapısı SINIFLI (Recep EVET)

Recep: "migration konusundaki benden geçer kısmını sana mı devretsem, konuyu tam anlamadığım için süreci uzatıyorum" → "yapma dediğin gibi yap, en azından bana gelenler azalır, gerçekten gelmesi gereken gelmiş olur." Hüküm: tam devir değil, iki sınıf. **Ekleme sınıfı** (yalnız yeni nesne ekleyen, var olana dokunmayan, gölgede geçmiş, kapılar yeşil) şerit ritüelle merge eder, Recep'e bilgi satırı. **Yıkıcı sınıf** (DROP/ALTER/RENAME, DML, var olan fonksiyon-tetik-politika değişimi, GRANT genişletme, security definer, tenant sınırı) Recep kapısında kalır; soru üç ölçülmüş satır: gölge sonucu · geri alma yolu · kilit süresi. Sınıf tespiti betikle (fail-closed: betik yokken her migration yıkıcı). Uygulama: ALTYAPI kaydı (karar defteri REC-318). Kural 13 metni bu kararla güncellenir.

## 2026-09-18 / 09-19 — Karar 43–51 özeti (OPS; ayrıntı ve ölçümler karar defteri REC-318 yorumlarında, sage/pano işleri REC-345'te)

Karar numarasının tek sahibi OPS'tur; şerit kendi kafasından numara vermez (09-18'de bir kez oldu, düzeltildi). Sonraki boş numara **52**.

* **43 · Yetki döngüsü onarımı (ALTYAPI; Recep EVET, 09-18).** Oturum kimliğinde rol bilgisi olmayan kullanıcıda fiyat fonksiyonu kendi kendini çağırıp 54001 (stack depth) veriyordu. `is_admin_claim()` eklendi, `is_admin_user()` değişmedi. Canlı ölçüm: onarım öncesi 15/15 vaka hata, sonrası 15 vaka × 3 rol ihlalsiz; bugün etkilenen yönetici 0. [peckop/venthub-hvac-esite#1258](<https://linear.app/receps-workspace/review/altyapi-rec-355-karar-43-user-profiles-yetki-dongusu-kesildi-claim-c6aebd491df7>).
* **45 · Ürün verisindeki iç notların temizliği (URUN; Recep EVET, 09-18).** 262 parça; veri / liste RPC / detay RPC üç katmanda ziyaretçi (anon) rolüyle ölçüldü, muaf 6 dışında desen 0. Ölçülmeyen: detay 149 ↔ liste 262 parça farkı. [peckop/venthub-hvac-esite#1256](<https://linear.app/receps-workspace/review/urun-rec-206-karar-45-vitrin-aile-blok-metninde-ic-editor-notu-veri-87435c3a83a0>). Yöntem dersi K4.1: olumsuz iddia kaynakta aynen geçmiyorsa doğrulanmış sayılmaz.
* **46 · Ersin Koç'un iş kartı panosu (ALTYAPI; Recep: "bugün hemen başlayalım denemeye, ona göre taşımayı fulleriz", 09-18).** `wrongstack-kanban` MCP kayıtlı, pano "VentHub ALTYAPI" açık, PİLOT sürüyor; Linear yerinde. Kök sebep dersi: paketler yalnız worktree'ye kurulmuştu, `.mcp.json` ana ağaçtan çözülüyor → "kayıtlı her MCP sunucusu ana ağaçta var + el sıkışıyor" kapısı ilk kartın kabul ölçütü. Pano verisi yedeği [peckop/venthub-hvac-esite#1274](<https://linear.app/receps-workspace/review/altyapi-rec-345-yedek-artik-wrongstack-altindaki-her-depoyu-aliyor-is-fa5f2927c740>). mailbox ÖLÇÜM bekliyor. [peckop/venthub-hvac-esite#1268](<https://linear.app/receps-workspace/review/altyapi-rec-345-karar-46-is-karti-panosu-pilotu-kanban-kayitli-mailbox-1812a88d5524>).
* **47 · Yönetim paneli sözlüğünün vitrin paketinden ayrılması (URUN; Recep EVET, 09-18).** Vitrin JS paketinde \~68,7 KB / 901 anahtar admin metni taşınıyordu. Faz 1 canlıda ([peckop/venthub-hvac-esite#1265](<https://linear.app/receps-workspace/review/urun-rec-59-faz-1-admin-sozlugu-anahtari-vitrin-dosyasindan-cikti-inv-1bd84e09d4c7>), kapı INV-ADMIN-SOZLUK-1); Faz 2 [peckop/venthub-hvac-esite#1270](<https://linear.app/receps-workspace/review/urun-rec-59-faz-2-karar-47-admin-sozlugu-vitrin-paketinden-ayrildi-7831ba24164f>) açık, URUN penceresini bekliyor. Faz 3 (dile göre yükleme) AYRI karar, ölçüm ister; arıza değil hafifletme.
* **48 · Katalog veri düzeltmeleri (URUN; Recep EVET, URUN penceresinde).** 48a storm güç aralığı [peckop/venthub-hvac-esite#1263](<https://linear.app/receps-workspace/review/urun-rec-206-karar-48a-storm-guc-araligi-katalogla-eslendi-037-75-kw-29426f5d56f8>) canlıda; 48b fc51 model adı — kaynak ölçümü: katalogda yazım hatası; Recep cevabının teyidi URUN açılınca.
* **49 · Çapalı hafıza ders kancasının ayar kaydı (ALTYAPI; Recep EVET, ALTYAPI penceresinde).** `sage-dosya-dersi.cjs`: dosya düzenlenmeden önce o dosyaya çapalı dersler öne gelir. Bütçe Ersin'in varsayılanı (8 ders / 2800 karakter, kırpma yok); OPS'un ölçümsüz daralttığı bütçe Recep itirazıyla geri alındı ("kaliteyi düşürme riski varsa Ersin'in yaklaşımını tercih ederim"). [peckop/venthub-hvac-esite#1264](<https://linear.app/receps-workspace/review/altyapi-rec-345-sage-dosya-dersi-kancasi-yazilan-hafiza-artik-okunuyor-40f64b5af9f8>), INV-SAGE-DERS-1.
* **50 · Hafıza derslerinin Ersin'in sage deposuna taşınması (OPS; Recep EVET, önce deneme).** 135 yetim dosya damıtılmış ders olarak yazıldı (depo 162 kayıt; dosyalar yerinde). Geri bulma: dersin kendi kelimeleriyle 10/10, anlamca Türkçe soruda 6/10; kabul eşiği ≥9/10. Eşiğe kadar kalan \~360 dosya TAŞINMAZ, MEMORY.md küçültülmez. Çözüm yolu: gömme/LLM köprüsü (A başsız Haiku ↔ B NVIDIA ücretsiz uç; NVIDIA ucu şartları gereği yalnız iç kullanım, canlı sitede YASAK; güvenlik etiketli ders dışarı gönderilmez).
* **51 · Sage yedeğinin oturum kapanışında kendiliğinden alınması (ALTYAPI; Recep EVET).** Düz dosya kopyası WAL yüzünden 6 dersi sessizce kaybediyordu → `VACUUM INTO` + doğrulama; SessionEnd kancası; kök ana ağaca bağlandı (worktree körlüğü). [peckop/venthub-hvac-esite#1267](<https://linear.app/receps-workspace/review/altyapi-rec-345-sage-yedegi-duz-dosya-kopyasi-alti-dersi-sessizce-60520b0b5ea5>), [peckop/venthub-hvac-esite#1269](<https://linear.app/receps-workspace/review/altyapi-rec-345-karar-51-sage-koku-ana-agaca-baglandi-yedek-ve-ders-10d4ee7349fd>). Recep ilkesi: "neden elle, unutulursa ne olacak" → elle kalan bakım tetiğe bağlanır.
* **36 · YENİDEN ÇERÇEVELENDİ (Recep, 09-18): "UnoPim denemesi" değil KATALOG İÇİN PIM ÇÖZÜMÜ.** "PIM sistemine hâkim değiliz, çözüm lazım." OPS'un iptal önerisi geri alındı. İş REC-357, kabul ölçütü 6 adım; ilk ölçüm: Docker var mı.
* **17 · Sentry sunucu tarafı onarımı: EVET (09-18).** Deneme bitince ücretsiz Developer plan; yükseltme YOK (Recep: "pro'ya geçmem"). **16 · hazır inceleme araçları kıyası: haftaya** ("kota yakmayalım").
* **Numarasız · [21st.dev](<http://21st.dev>) satırı (09-19, Recep EVET):** bileşen bazında — bileşenin kendi kaynağında açık lisans (MIT/Apache/BSD) varsa kod + NOTICE, yoksa yalnız referans. Genel üç basamak: bakmak serbest · açık lisanslı kod alınır + atıf · lisansı belirsiz kod alınmaz. [peckop/venthub-hvac-esite#1271](<https://linear.app/receps-workspace/review/lisans-license-tescilli-tum-haklari-sakli-noticemd-sourcesmd-lisans-13b441c9c404>) içinde uygulanır.

*2026-09-19 eklendi (OPS).*

## 2026-09-19 — Karar 52 ve 53 (OPS)

* **52 · Paket sürümü takibi GitHub'ın botuna ve otomatik güvenlik taramasına bağlanır (ALTYAPI; Recep EVET).** Ölçüm: dependabot/renovate yok, güvenlik uyarıları kapalı, otomatik düzeltme kapalı; tarama elle koşan betikteydi ve 4 gün unutuldu. Kapsam: uyarılar + güvenlik güncellemeleri açık · haftalık gruplu `dependabot.yml` (ana sürüm ayrı; 3D + react/next ayrı grup, URUN görsel doğrulama) · CI'da `pnpm audit --audit-level high` (lockfile değişince + haftalık) · "kabul edilmiş açıklar" listesi tabana karşı diff'li (ilk girdiler: 11 yüksek kayıt, hepsi `@sentry/webpack-plugin` zinciri = derleme aracı, Sentry 8→10 ile kapanır) · override satırlarına "kaldırma şartı". Emsal: WrongStack/WrongStack `dependabot.yml` + `audit.yml`. Bot PR'ı self-merge edilmez. Tamamlayıcı kapı: INV-DEP-KARAR-1 (REC-359).
* **53 · "Gözcü/cron KURULMAZ" GENEL YASAK DEĞİLDİR (Recep düzeltmesi).** REC-328 bir dönem için, kendi şeritlerimizde, kota çok sıkışıkken alındı; genelleme olarak geçmiş. Zamanlayıcı / cron / `/loop` ihtiyaç olan her konuda kullanılabilir; önce aramızda konuşulur. "Amacımız canlı dinamik akış." Geçerli kalan: eski gözcü üçlüsü emekli, filo doğrudan mesajla çalışır. **K7 bu kararla okunur.** Ders: karar kayda geçerken gerekçesi ve kapsamı (kim için, hangi dönem, hangi şart) yazılır; yoksa kendi kendine genelleşir.
* **17 · sıra:** Recep "Sentry'yi sona bırak, acelesi yok" → ALTYAPI kuyruğunun en sonu; karar EVET olarak durur.

## 2026-09-21/22 — Karar 52 kurulum sonucu, 54, 55, 56, 57, 58 (OPS)

* **52 · KURULDU (ALTYAPI, 09-21).** `.github/dependabot.yml` (npm haftalık, 4 grup, tavan 3; aksiyonlar tavan 2) + `bagimlilik-denetimi.yml` (`pnpm audit --audit-level high`, lockfile + haftalık) + `docs/standards/bagimlilik-kararlari.md` §7 kabul listesi (11→8 kayıt, tavan yalnız azalır) + §8 override kaldırma şartı + INV-DEP-KARAR-1. **Gerileme ve onarım:** Dependabot pnpm 11 `package.json` içindeki `pnpm.overrides` alanını okumuyordu → bot PR'larında 22 override düştü, 3 yüksek açık geri geldi; override'lar `pnpm-workspace.yaml`'a taşındı, üretim derlemesi doğrulandı. **React tam pininin gerçek sebebi bulundu:** `@react-three/fiber` 9.5.0 peer `react >=19 <19.3` → react \~19.2.8'e gevşetildi (BORÇ→KARAR; kaldırma şartı fiber 19.3'ü kapsayınca). Next 16 = göç, ayrı iş (REC-364), botta ana sürüm ignore. Haftalık sürüm tablosu Recep'e OPS'tan (borç).
* **54 · Pencereler arası posta kutusu — DENEME (Recep 'işle', 09-21).** `@wrongstack/mailbox-mcp`; kimlik sarmalayıcıda (`.mcp.json` içindeki `${…}` genişlemedi). **Kullanım kuralları:** alıcı TAM oturum UUID'si (kısa 8 hane SESSİZCE düşer) · "kutum" `unread` ile okunur, filtresiz `query` herkesinkini listeler · alıcı denetimi YOK → kutuya SIR ve Recep ONAYI yazılmaz, kutu onay kanalı değildir · `online` bayrağı bayatlar, canlılık `board who` · kutu deposu proje kök yolunun karmasından, sürücü harfine duyarlı (kanonikKok ile kapandı). **Ölçüm 2026-09-28:** kullanım \~0 ise kaldırılır.
* **55 · Yönetim paneli KIYAS denetimi — BEKLEMEDE (Recep 09-22: "iş sırasına al, sonra bakacağız").** Kayıt REC-365. Bizimki ↔ Medusa + Saleor (kod, önce lisans ölçümü) + Shopify (belge). Kendi cetvelimize uyum DEĞİL, yan yana kıyas. 'Başla' gelmeden alt ajan açılmaz.
* **56 · OPS penceresine 30 dk uyanış zamanlayıcısı — EVET (Recep 09-22), KURULDU.** Yalnız OPS'ta; Recep şartı: başka pencereye anlatılmaz, kurulması önerilmez. Sebep: 09-21'de iki şerit iş bitince \~55 dk boşta kaldı (OPS sıradaki işi göndermemişti). İçerik: kim boşta, sırada ne, kutu, açık PR; Recep'e yalnız değişiklikte rapor.
* **57 · Hafıza köprüsü (REC-363) — SORULDU, 'kur' bekleniyor.** Kıyas 09-22 (ALTYAPI, `docs/audits/rec363-gomme-kiyasi-2026-09-22.md`): yerel çok dilli model (e5) ilk-10'da 24/24, bedel 0; Haiku 23/24 \~$0,023/soru; hibrit 24/24 \~$0,015; NVIDIA 12/24 elendi; İngilizce model olumsuz soruyu ayıramadı → Türkçe model şart. OPS hükmü: yerel model sage vectorRecall'a; ücretli 2. basamak kapalı başlar. Ön şart: 500 hafızada ilk-10 yeniden ölçüm + sage yedeği; kalıcı kurulum ayrı PR + plan-challenger.
* **58 · Supabase makinesi büyütme — BEKLE (Recep 09-22: "bekle ama doğrulansın").** URUN hükmü: arama takılması = Nano (Free) paylaşımlı işlemci dalgalanması (aynı EXPLAIN ×3: 130/106/34 ms, aynı 3104 blok); plan/indeks/cron değil. Supabase belgesinden: Nano 0$ 0,5 GB · Micro \~10$ 1 GB · Small \~15$ 2 GB · Medium \~60$ 4 GB (hepsi shared/burst) · Large \~110$ dedicated 8 GB; Pro 25$/ay + 10$ kredi (Micro fiilen bedava), makine OTOMATİK büyümez (elle, <2 dk kesinti). Önce URUN'un 3104 blok (\~24 MB/arama) küçültmesi; sonra "Pro+Micro yeter mi" sayıyla.

## 2026-09-22 — Kararlar 59–67 (OPS)

* **59 · Barındırma — ERTELENDİ, sıralama kayıtta (Recep, iki pencerede birinci ağızdan).** REC-367 ölçümü: 3 aday yerelde derlendi. Sıra: 1 Cloudflare Workers + OpenNext ($5; 5/5 sayfa, revalidateTag çalışıyor, TR 70 ms) · 2 DigitalOcean App Platform ($10–12; 53 ms) · 3 Vercel Pro ($20; 25 ms). Hetzner önerilmez (bakım). Tetik: ödeme/fiyat canlıya açılmadan önce ya da Vercel kotası dağıtımı durdurursa. Supabase Pro ayrı: satış açılınca masaya (yedek gerekçesi).
* **60 · Vercel dağıtım depolaması — TAMAM.** Önizleme kapatmak çözmezdi (zaten iptal ediliyor); dolduran üretim sürümleri. 15 eski sürüm silindi (30 gün geri alınabilir); Recep panelde Deployment Retention: canceled/errored/preview 1 gün, production 1 hafta.
* **61 · Tarayıcıda arama dizini — ŞİMDİ HAYIR.** Takılmayı tamamen keser ama iki SSOT riski; önce (3) istemci deneyimi (#1304 indi) + sorgu sayacı ölçümü. 3000 ürüne daha çok var.
* **62 · İçerik hattı (düzenli bilgi yazısı, SEO) — ÖLÇÜM BEKLİYOR.** Recep'in arkadaşının sitesi (günlük blog, Lovable) örnek. Önce Search Console ölçümü (erişim VAR: \~/.claude/gsc-oauth-client.json) + destek konuları sitemap'te mi. Karar sonra.
* **63 · Sonnet 5 ölçüm günü — EVET.** Tüm Opus şeritleri medium effort'ta. 09-23: ALTYAPI Sonnet 5 (medium); ölçütler biten iş · kırmızı CI · OPS düzeltme · /usage; kıyas tabanı 09-22 Opus günü. Belgede effort×maliyet tablosu YOK (ölçüldü); "effort ölçeği model başına kalibre".
* **64 · Arama sorgu sayacı 1 hafta — EVET.** Normalize sorgu + sayaç, kişi verisi yok; migration → plan-challenger + kural 13 (URUN).
* **65 · IPX5→IP45 açıklama metni yazımı (3 ürün) — EVET (OPS penceresi); canlı yazım için Recep'in sözü KATALOG penceresinde bekleniyor** (akran aktarımı onay değil).
* **66 · K3-b yayın şartı — EVET (OPS önerisi):** REC-212 paketi 8 kolon (alt_metin · fiyat net · brut_fiyat · kdv · ust_kategori · alt_kategori · birim · baslik_tr) + CSV katmanı round-trip sıfır fark; yazma kolu ŞART DEĞİL (kararı 36 ile: PIM seçilirse yazan yalnız köprü, iki yazıcı olmaz). K3-b KOD başlar, YAYIN 212'yi bekler.
* **67 · Resend alan doğrulama + DMARC (REC-368) — Recep KENDİSİ yapıyor, ALTYAPI linkleri veriyor.** Kod onarımı (sessiz [onboarding@resend.dev](<mailto:onboarding@resend.dev>) düşüşü → hata + audit) URUN'da, edge deploy Recep kapısı.
* **Bulgu (kapı adayı):** KATALOG 09-10 squash-merge sonrası eski dala 9 commit atmış, 12 gün kayıp (#1305 kurtardı) → merge sonrası kapanan dala push uyarısı ALTYAPI sırasında.
* **Boş karar numarası: 68.**

## 2026-09-22 (öğleden sonra) — 65 uygulandı; 68, 69 açık; 62 içerik kıyası hazırlanıyor

* **65 (UYGULANDI, KATALOG, Recep onayı kendi penceresinde):** 3 üründe açıklama IPX5→IP45 düzeltildi; REC-186 kapsamında 1 üründe ad/slug 6N090P→61090P yazıldı; canlı DB'de doğrulandı.
* **68 (AÇIK):** kategori ağacı + yeni ürün adresleri TEK yayında mı, iki ayrı yayında mı? OPS önerisi: tek yayın, REC-212 (katalog paketi) bittikten sonra. Gerekçe: iki yayın = yönlendirme tablosu iki kez değişir, arama motoru iki kez yeniden tarar.
* **69 (AÇIK, dışa dönük repo ayarı):** GitHub `delete_branch_on_merge=true`. OPS önerisi evet; risk sıfır (merge edilmiş dal her zaman geri getirilebilir), fayda: kapalı dala yanlış push'un kökü (12 gün / 9 commit kaybı) kalkar. Recep GitHub ayarından kendisi açar ya da ALTYAPI'ya yetki verir.
* **62 içerik/blog (AÇIK):** ayrı kayıt REC-369 ile 3 seçenek kıyası; önce Search Console ölçümü (OPS).
* Boş karar numarası: **70**.
* **68 KARAR (2026-09-22 11:05Z): TEK yayın** (kategori ağacı + K3-b adresler birlikte, REC-212 sonrası). ŞART: yayından önce Recep çalışan hâli gözüyle görür (ön izleme kapısı; "gördüm, tamam" olmadan merge yok). URUN REC-191 planına işler.
* **69 KARAR: EVET** — delete_branch_on_merge=true; ALTYAPI açar ve ölçer.
* **62 blog: ORTA YOL** (zamanlanmış üretim + Recep onayıyla yayın) şimdilik kabul. Ek: akademik/bilimsel kaynaklardan beslenen teknik yazılar da kapsamda; kaynak gösterimi zorunlu (uydurma atıf = kırmızı). Ölçüm (Search Console) yine önce.
* Boş numara **70**.

## 2026-09-22 (öğleden sonra 2) — Kararlar 36, 70, 71, 72, 73, 75; açık 74, 76

* **36 AÇIK (düzeltme 13:05Z: OPS erken 'evet' yazdı; Recep fikrini paylaştı, kıyas istedi; eğilim EVET) — PIM (UnoPim) kataloğun KALICI hattı, tüm yetenekleriyle** (görsel eşleştirme, TR dil, dışa aktarım, köprü yazma kolu). Recep: "taşınabilir kataloğu bununla yöneteceğiz; elle tutulur altyapımız yok; güncelleme pratik olsun." Tek yazıcı = köprü; yazma kolu açılışı ayrı kapı. ALTYAPI faz 2 planı + challenger.
* **70 EVET** — 255 ürün TR açıklama: kaynak dizininden taslak → Recep onayı → yazım. REC-146'da yürür (yeni kayıt açılamadı, bkz. Linear sınırı).
* **71a UYGULANDI** (26 belge dizinde, KATALOG penceresinde onay). **71b NOT:** AVenS'in kendi 2 ailesi (dikdörtgen kanal radyal 7, sulu batarya 6) föy isteği + 22 belirsiz değer soru listesi → Recep'e ileride hatırlatılır. **71c EVET** üretici esas + tüm ürünler için gruplu fark raporu (REC-370, AVenS'e gider).
* **72:** Nicotra AT S/SC sürümü bilinmiyor → ağırlık BOŞ kalır (olgu).
* **73 DÜŞTÜ:** LSP bellek sınırı konmaz (Recep: "sınır iyi mi bilmiyoruz").
* **75 EVET:** NIMAX 314 debi + CMS ATEX 35/14 kW/ad/slug üreticiye göre (yazım KATALOG penceresinde).
* **74 AÇIK** (ayrı konuşulacak) · **76 AÇIK** (plan gelince).
* ⚠ **Linear ücretsiz kayıt sınırı doldu (2026-09-22 12:58Z):** yeni issue açılamıyor; kararlar mevcut kayıtlara işlenir → Recep'e (karar 77 adayı: Linear planı ya da kapalı kayıt arşivi).
* **36 KARAR (13:20Z, Recep ALTYAPI penceresinde birinci ağızdan): EVET** — UnoPim ürün verisinin düzenlendiği çalışma tezgâhı (yerel Docker), Supabase canlı DB kalır, köprü tek yazıcı. Alan sahipliği: üretici verisi PIM, ticari veri (fiyat/stok/kiracı) admin paneli. Şartlar: önce yedek + başka makinede geri kurma ölçümü; 73 boş ürün PIM'den bağımsız önce. Plan docs/plans/rec357-faz2-pim-kalici-hat.md (#1326), challenger sonra.
* **77 UYGULANDI:** 40 kapalı kayıt arşivlendi, aktif 275→235; otomatik arşiv zaten 1 ay; 173 Backlog → bayat backlog listesi + iptal önerisi ayrı iş (OPS).
* **78 KAPANDI (karar değil):** 442 adres listesi onaylı kuraldan üretildi; Recep kapısı = 68 ön izleme. Hava perdesi 2 dal slug'ı pazar terimine; korozyon dalı korundu.
* **79 KAPANDI (karar değil, ONARIM):** EN sayfada TR metin gösterilmez; yüzey gizlenir; vitrin-metni-standard maddesi + INV kapısı (URUN). Kural: müşteriye görünen dil/eksik içerik kusuru Recep'e karar olarak gitmez.
* Boş numara **80**.

### 2026-09-23 — Karar 80

**80.** Bayat Linear kayıtlarının kapanışı (ALTYAPI ölçtü, Recep ALTYAPI penceresinde 09-22 akşam "evet"): 11 kayıt kapatıldı — 8 Done, 2 Duplicate, 1 Canceled; her kayda gerekçeli yorum yazıldı. UYGULANDI. Sonraki boş karar numarası 81.

### 2026-09-23 — Kararlar 81, 82 (PIM yedeği, REC-357 §7)

**81.** PIM yedeğinin makine dışı kopyası: yedek makineden çıkmadan önce parolayla şifrelenir (parola/anahtar yedeğin içinde değil ayrı yerde), Recep'in Google Drive'ında özel klasörde durur. Recep OPS penceresinde: "81 mantıklı, drive evet". Uygulayan ALTYAPI.

**82.** Yedek zamanlaması: PIM'e 442 ürünün tamamı yüklenene kadar yalnız toplu düzenleme öncesi elle; tümü yüklendiği gün günlük otomatik yedek başlar (zamanlayıcı kurulumu o gün, karar 53 kapsamında bu karar onaydır). Recep OPS penceresinde: "tümü biter, yedek o zaman alınır". Uygulayan ALTYAPI.

Sonraki boş karar numarası 83.

### 2026-09-23 — Karar 84 (URUN penceresinde verildi; URUN soruyu yerel "34" numarasıyla sordu)

**84.** Korozyon dayanımlı dalın 81 model adresinde tip ifadesi `korozyon-dayanimli-asit-fani` (dal adı Recep'in önceki kararıyla "Korozyon Dayanımlı" kalır; pazarın kullandığı "asit fanı" terimi adrese eklenir; 6 adres 70 karakter sınırına göre kısaltılır). Recep URUN penceresinde: "önerin kabul". Uygulayan URUN (REC-191 plan v3, 442 liste yeniden üretimi).

Karar 83 (WrongStack güvenlik tarayıcısı + oturum sonu inceleme yan yana denemesi) Recep'te açık. Sonraki boş karar numarası 85.

### 2026-09-23 — Kararlar 76, 85, 86 (Recep OPS penceresinde: "76 evet, 85 evet, 86 evet")

**76. EVET.** 4 ailenin (NIMUS, NIMAX, Enkelfan EEC, CMS ATEX; 49-50 ürün) teknik veri çıkarımı başlar: çıkarım deterministik okuyucu, doğrulama bağımsız ajan (kol 1) — metin-yalnız kaynaklarda tek bağımsız yol. Hedef \~480 değer (hayır olsaydı 100+10). Plan: docs/plans/rec172-cikarim-dort-aile-2026-09-22.md v5.1. Canlıya yazım AYRICA Recep'in KATALOG penceresindeki sözüyle (iki anahtar). Uygulayan URUN-KATALOG.

**85. EVET — K7.10 değişti.** Hız anahtarları (2 ürün) ve BVU-LS (2 ürün) için yalnız AVenS 2026 fiyat listesindeki olgulardan (hız anahtarı: en yüksek akım 2,5 A / 5 A + eşleştiği fanlar; BVU-LS: opsiyonel kurşun seperatör + eşleştiği BVU) 1-2 cümlelik kimlik metni yazılır; karar 70'in toplu onay tablosunda Recep'e gelir. 06 Eylül K7.10 gerekçesi ("kaynakta anlatım yok") ölçümle yanlış çıktı. Uygulayan URUN-KATALOG.

**86. EVET — aile adres metni.** K3-b yayınında 47 ailenin 39'unun adres metni Design seo_slug'ına geçer (önek zaten /tr/urun'e geçtiği için tek yönlendirme, ek sıçrama yok). İstisnalar: NIMUS/NIMAX/Enkelfan/plug aileleri K17'ye göre casals-…; iki hava perdesi ailesi 78b pazar terimiyle (elektrikli ısıtıcılı / ısıtıcısız). Uygulayan URUN (REC-191 plan v3 Faz 1-B, REC-331).

Açık: 83 (WrongStack güvenlik tarayıcısı + oturum sonu inceleme yan yana denemesi). Sonraki boş karar numarası 87.

### 2026-09-23 — Karar 83 (Recep OPS penceresinde: "83 evet")

**83. EVET.** WrongStack'in güvenlik tarayıcısı ve oturum sonu inceleme ajanı (Chimera), bizim karşılıklarımızla (security-reviewer + sır tarama + security-check; PR inceleme botu + diff-review/code-review) YAN YANA denenir: WrongStack ajanı ana depoya dokunmadan yalıtılmış kopyaya kurulur, aynı 10 bilinen hata/PR üzerinde koşturulur, sonuç tablo. Gerekçe: 09-17'deki "bizde karşılığı var" hükmü ölçüme değil sahiplik iddiasına dayanıyordu. Diğer üç alınmayan parça (CodeMap, ajanın tamamı, istek kayıt aracı) denenmez. Uygulayan ALTYAPI (kota ALTYAPI'nın).

Sonraki boş karar numarası 87.

### 2026-09-23 — Uygulama notları

* **70 UYGULANDI (09-23):** Recep KATALOG penceresinde toplu tabloyu onayladı; 27/27 aile açıklaması canlıya yazıldı (vitrin EN 27/27, TR 14/14 ölçüldü; 85'in iki ailesi dahil; 4 onaylı TR'de kaynaksız genelleme düzeltildi).
* **76 BAŞLADI:** okuyucu + yükleyici PR #1337 (migration yok), 4 bağımsız doğrulayıcı; canlı yazım ayrıca Recep sözüyle.
* **K11-a örnek düzeltmesi (karar aynı):** cetveldeki örnek "Zone II, Category 3G" → "Zone 2, Category 3G, Directive 94/9/CE" ("II" bölge değil ekipman grubu). Recep'e bilgi, soru değil.

### 2026-09-23 — Karar 87 (Recep OPS penceresinde: "87 evet")

**87. EVET — karar 64'ün revizyonu.** Bir haftalık arama tekrar sayacı YAPILMAZ (pg_stat_statements: arama RPC ≈3.500 çağrı/yıl, ekip ölçümleri dahil → haftalık örneklem gürültü; önbellek Nano duraklamasını da çözmez). Sunucu önbellek planı bu trafikte kapanır; yeniden açma tetiği = aylık ≥5.000 dış arama. Yerine yalnız K10.1 **sonuçsuz arama günlüğü** kalıcı kurulur: kişi verisi süzgeci (telefon/TCKN/e-posta silinir), IP tutulmaz (oran sınırı tuzlu hash), sorgu listeleri PUBLIC depoya girmez (yalnız Linear), kiracı anahtarlı, migration kural 13 (Recep onayı URUN penceresinde). Uygulayan URUN (dal urun/rec340-arama-sayaci). Pazar ölçüm düzeninin (REC-369) site içi talep kolu.

Sonraki boş karar numarası 88.

### 2026-09-23 — Karar 88 + uygulama notları

**88. EVET (Recep ALTYAPI penceresinde birinci ağızdan, \~09:25Z: "önerini uygulayalım").** Worktree'lerin node_modules'u ana depoya junction ile PAYLAŞILMAZ; her worktree kendi `pnpm install --frozen-lockfile --offline`ını kurar (pnpm sabit bağlantı, disk maliyeti \~0, ölçüldü). Sebep: 09-23 junction'lı geçici worktree `git worktree remove` ile silinirken ana deponun node_modules'unu kısmen sildi (onarıldı, lockfile değişmedi). CLAUDE.md satırı değişir (Recep onaylı). Uygulayan ALTYAPI; KATALOG'un kendi ağacına ALTYAPI dokunmaz, talimatı yazar.

* **Stok uyarısı onarımı (REC-376) ONAYLI:** Recep ALTYAPI penceresinde 08:16Z "evet al"; #1334 merge 11:50Z e-posta ölçümünden SONRA.
* **PIM §1:** 442 ürün / 6542 hücre içe alındı, fark 2 (Punto Evo Flexo l/s: kaynak 48,6 ↔ türetme 48,61 — kural KATALOG'a).

Sonraki boş karar numarası 89.

### 2026-09-23 — Karar 74 kapandı (Recep ALTYAPI penceresinde birinci ağızdan, \~09:50Z)

**74 KARAR:** 7 günde çağrısız dört MCP için: **browser-use KALIR** (ajanın ayrı Chrome profiliyle tarayıcı işi ALTYAPI sırasında, öne alındı) · **Sentry KALIR** (Sentry 17 ALTYAPI'da; bağlantı yetkisi OAuth, Recep `/mcp` → sentry → Authenticate) · **testsprite KALIR** (ertelenmiş test işi) · **markitdown PASİF** (kaynak dizini kuralı gereği kullanım yeri yok; Recep: "kullanılmayacaksa pasif"). Pasife alma .mcp.json/ayar değişikliğidir, Recep onayı alındı; uygulayan ALTYAPI.

* Disk: Kiro + gemini_backup_old Recep onayıyla silindi, boş alan 73 GB.

Sonraki boş karar numarası 89.

### 2026-09-23 — Karar 90 (Recep ALTYAPI penceresinde birinci ağızdan, \~11:45Z) + açık numaralar

**90. HAYIR — karar 73 aynen geçerli.** Claude pencerelerindeki kod asistanına (TypeScript sunucusu) bellek tavanı konmaz. Recep: "bu olduğu gibi kalsın bu önemli, buna bir tavan koymak kodda soruna davetiye çıkartmak olur". Bağlam: bugünkü donmada 3 pencerede 9,2 GB ölçüldü; ALTYAPI onaysız eklediği maxTsServerMemory=1536'yı geri aldı (marketplace.json temiz, doğrulandı).

* **89 AÇIK** (URUN penceresinde): sonuçsuz arama günlüğü için veritabanının kendi zamanlayıcısıyla günlük tek temizlik işi (90 gün; KVKK belirli süre).
* **91 AÇIK** (OPS penceresinde): Vercel Pro şimdi (20 $/ay). Tetik: Hobby günlük 100 dağıtım sınırı doldu (son 24 saatte 96; 71'i iptal edilen preview), production dağıtımı \~24 saat reddediliyor; Hobby ticari kullanıma zaten kapalı (09-16 ölçümü); karar 59 erteliydi.
* **74 KAPANDI** yukarıda; **Vercel israfı onarımı** (git.deploymentEnabled, yalnız master) ALTYAPI'da, karar değil.

Sonraki boş karar numarası 92.

* **91 GERİ ÇEKİLDİ (OPS, 2026-09-23):** Recep: "her sıkışıklıkta pro mu diyeceksiniz? kota dolduysa doldu, ne yapalım?" Haklı: dolmanın sebebi kendi israfımız (96 dağıtımın 71'i iptal edilen preview), bedava onarım (vercel.json git.deploymentEnabled, yalnız master) ALTYAPI'da; karar 59 (barındırma) bilerek ertelenmişti ve ticari kullanım notu o gün de biliniyordu. Yol: kayan 24 saatlik pencerenin açılmasını beklemek, ilk yuvada israf onarımı, sonra biriken işler sırayla; migration'lı işler bekler. 91 numarası kullanılmış sayılır; sonraki boş karar numarası 92.

### 2026-09-23 — Karar 89 (Recep URUN penceresinde)

**89. EVET (normal uygulama).** Sonuç vermeyen arama kayıtlarının (karar 87 günlüğü) 90 günü dolanları, veritabanının kendi zamanlayıcısıyla her gece silinir; tuz ve hız sınırı satırları 2 günde. Recep: "normali nasılsa öyle olsun"; URUN normalin gece temizliği olduğunu söyledi, itiraz gelmedi. Migration onayı ayrı soru (kural 13, URUN penceresi).

* **İletişim notu:** Recep numaralarla takip edemiyor ("89/87 neydi" üç kez sordu). Ona giden her soruda numara TEK BAŞINA kullanılmaz; konu her seferinde içeriğiyle yazılır.

Sonraki boş karar numarası 92.

### 2026-09-24 — Kararlar 92, 93 (Recep OPS penceresinde: "92 evet · blog birinci önerin")

**92. EVET — rehber yazıları Bilgi Merkezi'nin kendi adresinde.** /tr/bilgi-merkezi/<yazi> ve /en/knowledge-hub/<article>; bugünkü /destek/merkez + /destek/konular/\* (air-curtain kopyası dahil 10 adres) 308 ile taşınır; sss/iade/kargo/garanti /destek'te kalır; "blog" adı kullanılmaz (Design'da yok, Bilgi Merkezi çizilmiş, ekran 14). Taşıma REC-300 / karar 68 tek yayınından BAĞIMSIZ küçük ayrı yayın (next.config katmanı, DB/harita yok, kural 12'ye dokunmaz), yayından önce Recep ön izlemede görür. Şartlar: sayfa RSC + generateMetadata (canonical + tr/en/x-default), TechArticle + FAQPage JSON-LD, site haritası, çift yönlü iç bağlantı (kategori/aile → yazı), Routes.bilgiMerkezi.\*, INV-ADRES-SEMASI-1 yasak listesine /destek/konular/. Dayanak: URUN olgu önerisi + Fable 5.1 bağımsız ikinci göz (aynı sonuç), REC-369. Uygulayan URUN; içerik BLOG.

**93. EVET — BLOG şeridinin kapsamı: yazı + arama görünürlüğü.** BLOG hem kaynaklı rehber yazılarını üretir hem de sitenin Google'da ve yapay zekâ botlarında nasıl göründüğünü ölçer (bot kalitesi karnesi, GSC, GEO); kusurları sahibine gönderir (sayfa → URUN, robots/başlık/kapı → ALTYAPI); karne tekrar koşulabilir betik olur, ALTYAPI kapıya bağlar. REC-369 (karar 62 orta yol + pazar ölçüm düzeni) BLOG'un kaydıdır. Gerekçe: denetim üreticiden bağımsız (URUN kendi sayfasını denetlemez) + yazı ile görünürlük aynı hedefin iki yarısı.

Sonraki boş karar numarası 94.

* **92 DÜZELTME (2026-09-24, BLOG ölçtü, Fable 3/3 doğruladı):** JSON-LD "TechArticle + FAQPage" değil **Article + BreadcrumbList** — Google Article zengin sonucu yalnız Article/NewsArticle/BlogPosting kabul ediyor; FAQ zengin sonucu yalnız yetkili devlet/sağlık sitelerine gösteriliyor → FAQPage isteğe bağlı, zengin sonuç beklenmez. Karar özü (adres, ayrı yayın, ön izleme) değişmedi.
* **92 DÜZELTME 2 (2026-09-24, BLOG model kıyası):** Google SSS (FAQ) zengin sonucunu 7 Mayıs 2026'da TAMAMEN kaldırdı (faqpage belgesi 301 → updates); önceki "yalnız devlet/sağlık" alıntısı bayattı (Fable onu yanlışlıkla "birebir" doğrulamıştı). FAQPage işaretlemesi kazanç beklenmeyen satır olarak düşer; JSON-LD = **Article + BreadcrumbList**.
* **Model kıyası (BLOG, REC-369):** aynı çürütme işinde birleşik 29 gerçek bulgunun Opus 5.5 26'sını, Fable 5.1 18'ini buldu (ortak 15); Fable 1 yanlış onay verdi; Fable 13,9 dk / 225 bin token, Opus 24,1 dk / 310 bin token, birim fiyat Fable 2,5 kat. Varsayılan çürütme ve doğrulama = **Opus 5.5 + alıntılar ham HTML'den**; Fable yalnız Opus'un gerçek bir şeyi kaçırdığı ölçülürse.

### 2026-09-24 — Kararlar 94, 95 (Recep KATALOG penceresinde, iskonto planı Faz B soruları)

**94. Zarara düşen satış fiyatı → ürün "Teklif Alın"a geçer.** İskonto ya da kur yüzünden hesaplanan satış fiyatı maliyetin altına düşerse ürün satıştan çıkar, teklif moduna geçer. Recep: "zararına satış tehlikelidir, olmaz; ben bilerek yaparsam o ayrı" → İSTİSNA: yönetici elle girdiği fiyata açık zarar onayı verirse (gerekçe + admin_audit_log izi) satış sürer.

**95. Moderatör alış iskontosunu ve maliyeti GÖRMEZ.** (Yalnız yönetici rolü; RLS/kolon yetkisi ve arayüz ikisi birden — REC-140 okuma şüphesiyle aynı yüzey.)

* **İskonto Faz B PARK** (Recep: "iskontolar gelince, şimdinin konusu değil"); açılış şartı AVenS iskonto rakamları. Faz A (motor base'i okur, migration yok) URUN'da yürür. Taslak #1360 (4fa8574ea). Uygulayan URUN; cetvel KATALOG.

Sonraki boş karar numarası 96.

### 2026-09-24 — Açık sorular 96, 97 (OPS penceresinde sorulan; numara ayrıldı)

* **96 AÇIK** (OPS penceresinde): ilk rehber yazısı "Frekans konvertörü nedir, fan ve pompada nasıl seçilir?" olsun mu. Öneri evet (ikinci aday hava perdesi). Uygulayan BLOG (F4: Sonnet araştırma → taslak + iddia tablosu → Opus doğrulama → Recep'e özet); yayın karar 92 sayfası canlıya çıktıktan sonra. REC-369.
* **97 AÇIK** (OPS penceresinde): yasal sayfalar canlıda "Taslak" görünüyor (URUN ölçtü 09-24: KVKK aydınlatma, gizlilik politikası, mesafeli satış sözleşmesi H1'de "(Taslak)" + "test amaçlıdır, hukukçudan teyit alınız" uyarısı; site haritasında ve dizine açık; 6 yasal sayfanın başlığı "(Taslak)"). Soru: gerçek metinleri ekip kanun ve yönetmelik maddelerine dayanarak hazırlasın, son metni hukukçu onaylasın mı. Öneri evet. Şirket bilgileri koddan/kayıtlardan toplanır, eksikler Recep'e tek listede sorulur (REC-77: KVKK başvuru e-postası + KEP hâlâ yer tutucu). "(Taslak)" gizlenmez, noindex geçici çözüm sayılmaz (müşteri yine görür).
* **98 AÇIK** (OPS penceresinde; Recep KATALOG üzerinden sordu "basit konularda neden izin istiyorsun, OPS ne önerir"): filo izin politikası. ÖLÇÜM (OPS, `claude auto-mode config` + \~/.claude/settings.json, 09-24): otomatik izin sınıflandırıcısı autoMode'u YALNIZ kullanıcı ayarından okur (proje .claude/settings\*.json okunmaz — belge: [code.claude.com/docs/en/auto-mode-config](<http://code.claude.com/docs/en/auto-mode-config>)); mevcut autoMode.environment 77 satır, aynı bölümler 4-5 kez tekrarlı, süresi dolmuş oturum izinleri içinde, Supabase projesi "sensitive remote target" yazılı → varsayılan "Production Reads" kuralı salt okumayı durduruyor; autoMode.allow düzyazı değil komut kalıbı taşıyor ve `gh pr merge` koşulsuz serbest (migration'lı PR birleştirme = prod). Recep'in sohbette söylediği sınır kalıcı değil (sınıflandırıcı transkriptten okur, compact'te düşer). ÖNERİ: autoMode tek temiz kopya + düzyazı istisnalar: (1) canlı Supabase'ten salt okuma ölçümü (sayım/kontrol; sır değeri ve müşteri kişisel verisi satır satır basılmaz); (2) şerit dallarına push (master değil); (3) pencereler arası mesaj/pano; (4) migration ve edge fonksiyon içermeyen kendi PR'ını kontroller yeşilken birleştirme (bugünkü koşulsuz izni DARALTIR). Recep'te kalan: canlı yazım, fiyat, silme, migration, migration'lı merge, edge deploy, ayar/CLAUDE.md değişikliği. Uygulayan OPS; metin önce Recep'e gösterilir, `claude auto-mode critique` ile denetlenir, bir gün /permissions "Recently denied" izlenir.

Sonraki boş karar numarası 99.

### 2026-09-24 — Karar 98 (Recep OPS penceresinde: "98 evet")

**98. EVET — filo izin politikası.** Kullanıcı ayarındaki autoMode bölümü tek temiz kopyaya indirilir (tekrarlı ortam tanımları ve süresi dolmuş oturum izinleri çıkar); düzyazı istisnalar: (1) canlı Supabase'ten salt okuma ölçümü (sayım/kontrol; sır değeri ve müşteri kişisel verisi satır satır basılmaz), (2) şerit dallarına push (master değil), (3) pencereler arası mesaj/pano, (4) migration ve edge fonksiyon içermeyen kendi PR'ını kontroller yeşilken birleştirme (bugünkü koşulsuz izin DARALIR). Recep'te kalan: canlı yazım, fiyat, silme, migration ve migration'lı merge, edge deploy, ayar/CLAUDE.md değişikliği. Uygulayan OPS; metin yazılmadan önce Recep'e gösterilir; sonra bir gün /permissions "Recently denied" izlenir.

### 2026-09-24 — Kararlar 96, 97 (Recep OPS penceresinde: "97 evet · 96 evet ama nasıl bir çalışma yapılacağı konusunda veri sunmadınız")

**96. EVET — ilk blog yazısı (rehber yazısı = blog yazısı; karar 92 adı): "Frekans konvertörü nedir, fan ve pompada nasıl seçilir?"** Gerekçe BLOG F1 ölçümü (Search Console + arama önerisi): konu hem satılan bir ürün ailesine bağlı hem sitede bilgi yazısı olmadığı için görünmüyor; sorgu ve sayfa ayrıntısı REC-369 BLOG F1 yorumunda (pazar verisi PUBLIC depoya girmez). Yöntem rehber-yazisi-standard v0.3 (R5 doğrulama akışı); Recep yöntemin kendisine sunulmasını istedi → OPS kıyasla anlattı. Yayın karar 92 sayfası + rehber tablosu sonrası.

**97. EVET — altı yasal metin gerçek metinle değiştirilir.** Grup 1 ŞİMDİ (site kişisel veri topluyor): KVKK aydınlatma, gizlilik, çerez, kullanım koşulları. Grup 2 satış açılmadan önce: mesafeli satış sözleşmesi, ön bilgilendirme formu (canlı checkout: "teklif kipindeyiz; sipariş ve ödeme kapalı"). Taslak BLOG (mevzuata dayalı, kaynaklı); şirket bilgileri koddan/kayıtlardan, eksikler Recep'e tek listede (REC-77 KVKK e-posta + KEP dahil); son metni hukukçu okur (Recep ayarlar); sayfaya URUN yerleştirir; yayın Recep onayıyla. "(Taslak)" gizlenmez, noindex çözüm sayılmaz.

Sonraki boş karar numarası 99.

### 2026-09-24 — Karar 97 GERİ ÇEKİLDİ (OPS; yanlış öncül)

**97 GERİ ÇEKİLDİ.** OPS soruyu "Linear'da kayıt/karar yok, cetvel yok" öncülüyle sordu; YANLIŞ. Var olanlar: `docs/standards/legal-compliance-standard.md` v1.0 (Hukuki Uyum Cetveli, 2026-08-16, sahibi LEGAL-OPS şeridi, 501 satır; §2.2 ön koşul zinciri 1. halka = şirket kuruluşu/mükellefiyet; son bölüm: yer tutucu varken legalReviewCompleted true olamaz, yer tutucu yayına çıkamaz) + Design-BELGE K7 (2026-09-06): "şirket künyesi (unvan, adres, VKN, MERSİS) şirket kuruluşuyla gelir; o güne kadar yer tutucu, uydurma yok". BLOG ölçtü: src/config/legal.ts satıcı alanlarının TAMAMI yer tutucu; hiçbir kayıtta dolu değil. Recep BLOG penceresinde: "yasal metin işine sen başlama, bunun için bizde şerit vardı". SONUÇ: yasal metinler şirket kuruluşuna bağlı; o güne kadar K7 geçerli. Kuruluş tarihi belli olunca LEGAL-OPS penceresi açılır, metin "mevzuattan nasıl yazılır" bölümü Hukuki Uyum Cetveli'ne eklenir (ayrı dosya değil). BLOG'a verilen iş iptal.

Sonraki boş karar numarası 99.

**98 UYGULANDI (2026-09-24).** Recep "98 yaz"; OPS'un ilk denemesini otomatik izin sınıflandırıcısı durdurdu (Claude'un kendi izin ayarını yazması); Recep izin kipini elle değiştirip "şimdi dene" dedi, OPS uyguladı. Doğrulama: autoMode = Recep'e gösterilen taslak (birebir); autoMode dışındaki tüm ayarlar yedekle aynı; `claude auto-mode config` etkin yapılandırmada 4 izin + 3 yasak satırı VAR; koşulsuz `Bash(gh pr merge *)` izni KALKTI; ortam 77→28. `claude auto-mode critique` koşmadı (CLI 2.1.270; Opus 5.5 için 2.1.280+ gerekiyor — ALTYAPI araç borcu). Yedek: OPS scratchpad settings.yedek-2026-09-24.json. Filo bilgilendirildi; bir gün "Recently denied" izlenir. Sonraki boş karar numarası 100 (99 = ALTYAPI'nın sorusu: liste fiyatı vitrinde üstü çizili mi).

### 2026-09-24 — Açık sorular 99–101 (Recep "bekleyen işleri numarayla ver, onay vereyim" listesi)

* **99 AÇIK** (ALTYAPI penceresinde sordu): tedarikçinin iskontosuz liste fiyatı ileride vitrinde üstü çizili gösterilecek mi? ALTYAPI önerisi HAYIR → gizli maliyet tablosuna (REC-140).
* **100 AÇIK** (onay ALTYAPI penceresinde; edge = canlı): #1366 e-posta sistem varsayılanları — gönderen [info@venthub.com.tr](<mailto:info@venthub.com.tr>), logo [venthub.com.tr/images/logo.png](<http://venthub.com.tr/images/logo.png>); notification-service (.com varsayılanı) ve quote-notification-webhook ([resend.dev](<http://resend.dev>) varsayılanı) bu sabite bağlanır. Öneri EVET.
* **101 AÇIK** (öncelik; burada cevaplanabilir): AUTH E5 teklif hazırlama ekranının PLANI (kompozör, revizyon zinciri, teklif→sipariş köprüsü; REC-54) yayım onarımı ve anon migration'ından sonra yazılsın mı. Öneri EVET (site teklif kipinde; teklif akışı tek satış kanalı); plan plan-challenger'dan geçer, kod ayrı onay.

Sonraki boş karar numarası 102.

**101. EVET** (Recep AUTH penceresinde, kendi sözüyle: "101 evet") — E5 teklif hazırlama ekranının PLANI (kompozör, revizyon zinciri, teklif→sipariş köprüsü; REC-54). Sıra: yayım onarımı PR'ı → anon EXECUTE migration (generate_order_number + admin_publish_quote) → E5 planı + plan-challenger; kod ayrı onay. Uygulayan AUTH.

**PARK (Recep 09-24: "zamanı var dediğimde neden aynı gün sürekli karşıma çıkıyor")** — şirket kuruluşu (yasal metinler, KEP, fatura zinciri) ve AVenS iskonto rakamları (REC-55 Faz B) Recep kendisi açana ya da dış tetik gelene kadar Recep'e giden listelerde yer almaz.

### 2026-09-24 — Kararlar 99, 100 + iki onay (Recep ALTYAPI penceresinde, \~09:36Z: "1 evet · 2 evet · 3 evet", \~09:40Z: "99 hayır")

**99 HAYIR — tedarikçinin (AVenS) iskontosuz liste fiyatı vitrinde "üstü çizili liste fiyatı" olarak GÖSTERİLMEZ.** Gerekçe (ALTYAPI önerisi, Recep kabul): liste fiyatı vitrin fiyatıyla yan yana konunca kâr oranımızı rakibe söyler. Sonuç: REC-140 planında liste fiyatı da (`purchase_price`, `purchase_currency`, `purchase_rate_to_base`, `cost_in_base`) gerçek maliyet ve tedarikçiyle birlikte admin-yalnız `product_costs` tablosuna taşınır (plan v3 §0 "hayır" varsayımı doğrulandı; şema değişmez).

**100 EVET — e-posta sistem varsayılanları kanonik alan adına** (PR [peckop/venthub-hvac-esite#1366](<https://linear.app/receps-workspace/review/altyapi-inv-eposta-kimlik-1-e-posta-sistem-varsayilanlari-kanonik-alan-0d48c77ee92c>), EDGE): gönderici son çare `VentHub <info@venthub.com.tr>`, logo `https://venthub.com.tr/images/logo.png`; eski `onboarding@resend.dev`, `noreply@venthub.com` (.tr değil), `vercel.app` varsayılanları kaldırıldı + INV-EPOSTA-KIMLIK-1. Merge 193db7807, fonksiyon yüklemesi başarılı (09:4xZ).

**Onay (numarasız, aynı cevap "1 evet"): tenants.config.brand_logo_url →** `https://venthub.com.tr/images/logo.png` (canlı veri yazımı, admin_audit_log kayıtlı; önceki değer [vercel.app](<http://vercel.app>) adresi). REC-382.

**Onay (numarasız, "3 evet"):** REC-140 **Faz 1 migration** `20260924091500_rec140_product_costs_ekle.sql` (PR [peckop/venthub-hvac-esite#1369](<https://linear.app/receps-workspace/review/altyapi-rec-140-faz-1-maliyet-alanlari-icin-admin-yalniz-product-costs-e94a0918f9ac>), merge 765235da3, uygulandı): admin-yalnız `product_costs` (karar 95), 442/442 birebir kopya, anon/müşteri/moderatör 0 satır, admin 442 (canlı rol ölçümü, rollback). REST sızıntısı Faz 3'te kapanır.

Sonraki boş karar numarası 102 (101 OPS'ta).

* **102 AÇIK** (OPS penceresinde): Google Ads hesabı (reklamsız) + kart/banka bilgisi — pazar ölçüm kol 2 (aylık arama hacmi). BLOG ölçtü (ham kaynak, REC-369): Anahtar Kelime Planlayıcı fatura bilgisi girilmeden açılmıyor ([support.google.com/google-ads/answer/7337243](<http://support.google.com/google-ads/answer/7337243>)); kampanyasız hesap mümkün (answer/6366720); ajanın Ads panelini tarayıcıyla kullanması Google Advertising Program Terms'e aykırı → yol Google Ads API (geliştirici jetonu 2026-09-09'da kalktı, Cloud projesine bağlı; hacim servisi Basic erişim, ön koşul marka doğrulaması). Risk: marka doğrulaması gizlilik politikası adresi istiyor; bizimki yer tutucu (PARK konusuna bağlı) — geçip geçmeyeceği ölçülmedi. Kartta ücret çekilip çekilmediği ölçülmedi. Öneri EVET: 1-2. adım şimdi, 3. adım denenir; takılırsa bekler.

Sonraki boş karar numarası 103.

* **103 AÇIK** (onay AUTH penceresinde; kural 13): #1373 — anon rolünün çağırabildiği iki SECURITY DEFINER fonksiyonun kapatılması (generate_order_number: rol kontrolü yok, çağrı başına günlük sayacı kalıcı artırır, 9999'da günün siparişleri düşer; admin_publish_quote: is_admin kontrolü var, yine kapatılır, authenticated yönetici EXECUTE korunur). plan-challenger koşulları kapandı, kapı 19 test, security-reviewer TEMİZ. Merge öncesi taban tazeleme + tip dosyası bekleniyor. Öneri EVET.
* **104 AÇIK** (onay AUTH penceresinde; canlı veri): #1372 yayım onarımının canlı kabulü — Recep'in 2026-09-01 deneme teklifine fiyat girilip yayımlanması (alıcı Recep'in kendisi). Öneri EVET.

Sonraki boş karar numarası 105.

**103. EVET · 104. EVET** (Recep AUTH penceresinde, kendi sözüyle: "ikisi için de evet") — 103: #1373 migration (generate_order_number + admin_publish_quote anon kapatma) kontroller yeşil olunca (taban tazeleme + tip dosyası onarımından sonra) merge; ardından canlı doğrulama. 104: #1372 inince 09-01 deneme teklifinin canlıda fiyat alıp yayımlanması; kanıt AUTH tarafından yönetici yolundan (Recep panele girmez). Uygulayan AUTH.

* **\[ESKİ — GEÇERSİZ; güncel hâli aşağıda "105 YENİDEN AÇIK"\]** ~~105 AÇIK~~ (Blog penceresinde): ilk blog yazısı "Frekans konvertörü nedir, fan ve pompada nasıl seçilir?" yayınlansın mı. Doğrulama: iki Opus turu, 8/8 tuzak yakalandı, tur 1 üç gerçek hata düzeltildi, tur 2 yeni hata 0; metin + kayıtlar REC-369 ekinde (sha f29ab1c35e26). Yayın ancak URUN bilgi merkezi rotası + rehber tablosu gelince; onay o sha'ya bağlı (R5.5).
* **\[ESKİ — GEÇERSİZ; güncel hâli aşağıda "106. HAYIR"\]** ~~106 AÇIK~~ (Blog penceresinde): yazıda yapay zekâ kullanımı ziyaretçiye belirtilsin mi. OPS önerisi EVET: kısa, sabit bir not (araştırma yapay zekâ destekli, her iddia kaynağına karşı doğrulandı) + kaynak listesi; Google faydalı içerik rehberi otomasyon kullanımının ziyaretçiye açık olmasını soruyor.
* **107 AÇIK** (AUTH penceresinde; PR #1385, REC-295, MIGRATION → merge=Recep): teklif başlığı ve kalemleri tek transaction'da yazan yeni create_quote_with_items fonksiyonu. Bugün başlık ve kalemler iki ayrı yazımla gidiyor; kalem yazımı düşerse kalemsiz teklif kalıcı kalıyor (canlıda bugün 0/1). PR tek başına davranış değiştirmez: fonksiyonu henüz kimse çağırmıyor, çağıranlar prod ölçümünden sonra ayrı PR. Gölge kanıt: aynı kalem hatasında yeni yol 0 başlık, eski yol 1 kalemsiz başlık bırakıyor; enjeksiyon yok sayılıyor, anon reddediliyor. Kapı INV-QUOTE-ATOMIK-1 (9 test, 8 sabotaj). Uygulama sırası sorun değil (ledger modeli). OPS önerisi EVET.

**102. EVET** (Recep OPS penceresinde, 2026-09-24: "hesap açmadım, açarım bugün") — Google Ads hesabını (kampanyasız) Recep bugün açıyor; adımlar OPS'tan Recep'e bağlantıyla gitti. Sonrası (Cloud projesi, Ads API, marka doğrulaması) BLOG paketi REC-369 sırasıyla; Recep'ten yalnız tek seferlik hesap adımları istenir.

**105. ASKIDA** (Recep OPS penceresinde, 2026-09-24: "blog yazısını görmedim, nasıl onay vereceğim, görmeden olmaz"; ayrıca: DEA/Astra başvuru yazısıyla yapı kıyası yapılmadı, başvuruda yapay zekâ açıklaması var mı, ziyaretçiyi ve bizi koruyan yazı ayrıntılarına dikkat edildi mi) — soru Recep'e yazı gösterilmeden soruldu, HATA. OPS ölçümü (taslak sha f29ab1c35e26): 1.820 kelime, 13 bölüm, 5 SSS, 11 kaynak; teknik sorumluluk notu YOK, fiyatı belirleyenler bölümü YOK — ikisi de cetvelin DEA'dan aldığı kalıpta yazılı. Yeniden sorulma şartı: Recep'in okuyabileceği önizleme sayfası + DEA ile bölüm bölüm kıyas tablosu + eksiklerin tamamlanması (BLOG). 106 da DEA'nın yapay zekâ açıklaması ölçümüyle birlikte yeniden sunulur.

**107. EVET** (Recep AUTH penceresinde, 2026-09-24: "107 evet"; AUTH aktardı) — teklif başlığı ve kalemlerini tek transaction'da yazan fonksiyon (PR #1385, migration). Karar düzeyinde onay; merge işlemi karar 98 gereği Recep'in AUTH penceresinde işlem düzeyindeki cümlesini bekliyor (103 ile aynı durum; #1373 merge'ü sınıflandırıcı tarafından durduruldu). Uygulayan AUTH.

* **108 AÇIK** (onay KATALOG penceresinde; karar 98 yalnız venthub-hvac-esite deposunu kapsadığı için): katalog veri deposu (peckop/venthub-pdf-ingestor, ÖZEL depo — OPS ölçtü) yerelde 12 kayıt önde, hiçbiri gönderilmedi. İçerik (09-23/24): canlıya yapılan yazımların yazım öncesi YEDEKLERİ (karar 70, karar 76, REC-172 güç ve ATEX düzeltmeleri), REC-212 iki alış fiyatı düzeltmesi, REC-172 tur 2 aday listeleri, tedarikçiye soru paketi taslağı (gönderilmedi), REC-383 ajan notu, REC-282 görsel çıkarma aracı. 66 dosya; sır adlı dosya yok (OPS taradı). Risk: bugün yedekler yalnız bu makinede; disk kaybında geri dönüş verisi gider. OPS önerisi EVET (tek seferlik gönderim).
* **105 YENİDEN AÇIK** (OPS penceresinde, 2026-09-24): ilk blog yazısı yayınlansın mı — bu kez ÖNİZLEMEYLE. Önizleme (Recep'e özel sayfa): [https://claude.ai/artifact/EYhXcfj1YeqiXWKky4aNyQ](<https://claude.ai/artifact/EYhXcfj1YeqiXWKky4aNyQ>) · onay yeni metne bağlı: sha 0400448c9559 (eski f29ab1c35e26 geçersiz). BLOG askı emrinin beş adımı: DEA ile bölüm bölüm kıyas (REC-369 yorumu + dea/kiyas.md), eklenen bölümler (fiyatı belirleyen etkenler, teklif için gereken bilgiler SSS'i, teknik sorumluluk notu), doğrulama tur 3-4 (IE2 şartı tebliğe yanlış atfediliyordu → yalnız AB tüzüğüne dayandırıldı; tur 4 yeni hata 0), zorunlu bölüm kapısı PR #1388, cetvel v0.4 R5.4 'görmeden onay yok'. OPS önizlemeyi okudu; ürün ve kategori bağlantıları canlıda 200. Öneri EVET.
* **106 YENİDEN AÇIK** (OPS penceresinde): yapay zekâ notu. ÖLÇÜM (BLOG, Playwright, 09-24): DEA yazısında yapay zekâ açıklaması YOK; teknik sorumluluk notu VAR. Önizlemede not 'karar bekliyor' kutusunda. OPS önerisi EVET (sıralama için gerekmediği DEA'da görüldü; karar güven ve açıklık tercihi).

**108. EVET** (Recep KATALOG penceresinde, 2026-09-24: "108 evet"; KATALOG aktardı) — katalog veri deposuna (özel) 12 kayıt gönderildi: 2d06af1..06124f5, yerel = origin. Ön kontrol: sır adlı dosya 0, yeni dosyalarda tedarikçi fiyatı 0; tek fiyat değişikliği 06ba6c7'deki 2 alış hücresi. Uygulayan KATALOG.

**106. HAYIR** (Recep Blog penceresinde, 2026-09-24; BLOG aktardı): "yapay zeka ile hazırlandığının beyanı bence çok önemli değil, asıl kaynak beyanı önemli … bir çalışmayı bir mühendise yaptırınca onun kimliğini ya da 'şu tarafından hazırlanmıştır' demiyoruz." Yapay zekâ notu konmaz; kaynak listesi ve teknik sorumluluk notu kalır. Dayanak (BLOG ölçtü): Google faydalı içerik rehberi açıklamayı zorunlu tutmuyor ("Consider adding these when it would be reasonably expected"); DEA'da da not yok. Önizlemeden kutu kaldırıldı, metin sha 0400448c9559 değişmedi. **105 hâlâ AÇIK** (OPS penceresinde).

**109. EVET** — REC-140 Faz 2-DB (PR #1374, migration): inventory_summary.capital_tied_up, inventory_velocity.supplier_name ve admin_search_products.purchase_price product_costs'tan okur; yönetici olmayan NULL görür (bugün giriş yapmış her müşteriye açıktı). Recep 2026-09-24 \~14:50 TR ALTYAPI penceresi: "evet" (soru işlemin kendisini soruyordu: "depoya girsin mi, migration"). Uygulayan ALTYAPI; canlı kabul + taban aynı saatte.

**105. GERİ ÇEKİLDİ (sorulma zamanı yanlıştı)** — Recep OPS penceresinde, 2026-09-24: "hâlâ 105 karar bekliyor diyorsun, hem sayfa yapılmadı, ürün bekliyor, hem de 105 bir karar; ya verin ya doğru anlatın." OPS hükmü: yazı, Bilgi Merkezi sayfaları (URUN PR-2) kurulmadan yayına giremez; metin onayını şimdi istemek Recep'e boşuna iş. 105 Recep'in bekleyenler listesinden çıkar. Sayfalar hazır olunca yazı GERÇEK sayfasında (ön izleme ortamında) gösterilir ve tek soru olarak yeniden sorulur (metin sha 0400448c9559 o güne kadar değişmezse aynı metin). Kimse bu kararı beklemiyor: BLOG ikinci yazıya, URUN PR-2'ye devam.

**110. EVET** (Recep KATALOG penceresinde, 2026-09-24: "110 evet"; KATALOG aktardı) — 7 ailenin İngilizce adı (NIMUS, NIMAX, ENKELFAN EC plug, VORTICENT CMS ATEX, SEAT ATEX PTC sensör, dikdörtgen kanal radyal, QE-B kasa); kaynaklı 5, kaynaksız 2 (düz teknik terim). Uygulandı 2026-09-24: DB 7/7 geri okundu, canlı /en ürün sayfalarında başlık + h1 7/7, TR değişmedi; yedek ingestor paket/geri-alma/karar110-aile-en-ad-oncesi-2026-09-24.json; paket yeniden üretildi (fark 0). Aile EN adı 47/47 → REC-300 Faz 2 ön koşulu karşılandı. Uygulayan KATALOG.

**104. UYGULANDI** (Recep AUTH penceresinde "104 evet" işlem cümlesi) — canli-kanit-tek-sefer.yml run 35998494186, 1 passed. DENEME teklifi: kimlik 89024b5f, oluşturma 2026-09-01T09:12:06Z, teklif numarası YOK (quote_no boş); draft → quoted 2026-09-24 12:22:40Z; kalem 1000 TRY (deneme fiyatı, OPS teyidi), geçerlilik 2026-10-24; audit 2 satır, RPC 204. Kanıt REC-54. Açık bulgular (AUTH ölçtü): müşteri e-postası GİTMEDİ (bildirim tarayıcıdan yayımdan sonra ateşleniyor, oturum kapanınca kesildi — gerçek kullanımda da kırılgan), sent_at yazılmıyor, quote_no boş.

**111. EVET · UYGULANDI** (Recep KATALOG penceresinde, 2026-09-25: "111 evet"; KATALOG aktardı, ayrıntı REC-357 yorumu f449c759) — 14 teknik özelliksiz ürüne kaynaklı değer yazıldı (AVenS dikdörtgen kanal radyal 7, AVenS sulu batarya 6, Vortice CMS ATEX 14/5 T2 1). İki bağımsız ajan fark 0; DB geri okuma tam; yedekler ingestor'da. Teknik özelliksiz ürün 24 → 10 (kalan aksesuar, cetvel satırı bekliyor). Bilinçli yazılmayanlar tedarikçi park listesinde.

* **112 AÇIK** (OPS penceresinde, 2026-09-25): graphify kancasının dürtü metni. Bugün her dosya okuma ve aramada modele "MANDATORY… You MUST run graphify" yazıyor, kod dışı dosyalarda ve proje dışı klasörlerde de; ayrıca bu kuralı her alt ajan istemine eklemesini istiyor. Recep 09-16: "olduğu gibi istiyorum, yasak felan yok" — metin fiilen düz aramayı yasaklıyor; REC-313 ölçümünde query 5 soruda 2 yanlış 2 eksik. OPS önerisi: araç ve kurulum kalır, yalnız metin sakin dile çekilir (yerel sarmalayıcı kanca) + kod sorusunda ilk araç tek yerde yazılır (CodeGraph, yanında graphify). Kaynak: prompt denetimi 2026-09-25 (memory/prompt-denetimi-2026-09-25.md, B2-B4, A1). Uygulayan ARAÇ.

**113. EVET** (Recep KATALOG penceresinde, 2026-09-25, "112 evet" — KATALOG soruyu 112 numarasıyla sormuştu, OPS'un 112'siyle çakıştı, burada 113 olarak işlendi): PR #1350 (REC-357 §1 UnoPim gölge tam yükleme, 442 ürün / 6542 hücre fark 0) merge edilsin. Uygulama: KATALOG aynı komutu bir kez denedi, izin sınıflandırıcısı reddetti ("Auto-Mode Bypass"); aşılmadı. Recep'in işlemi kendisinin yapması ya da o pencerede izin kipini geçici elle onaya alması bekleniyor.

* **114** (Recep'e KATALOG penceresinde 113 numarasıyla soruldu): yerel Docker motorunun açılması (UnoPim yerel çalışma tezgâhı; Recep 09-19'da ALTYAPI'ya bu yetkiyi vermişti). Durum #1350 ile aynı: sınıflandırıcı engeli, Recep'in işlemi bekleniyor.

Not (OPS): karar numarasını yalnız OPS verir; şerit Recep'e soru sormadan önce numarayı OPS'tan alır (09-25 çakışması).

* **115 AYRILDI** (KATALOG soracak, örnekle): 24 aktif kategorinin İngilizce açıklama metni (EN kategori sayfalarında bugün paragraf yok; karar 70 yöntemi).
* **116 AYRILDI** (KATALOG soracak, örnekle): 166 ürünün EN sayfasındaki Türkçe biçim düzeltmesi (d/dk, ondalık virgül, HIZ ANAHTARI) — çeviri değil, kural tabanlı.
* **117 AÇIK** (ARAÇ penceresinde soruldu): board-brief kancasının her turda "CronCreate ile 30dk recurring tur kur" demesi karar 53 ile çelişiyor; öneri satırı "tekrarlayan tur gerekiyorsa kurmadan önce Recep'e sor" biçimine çevirmek (OPS + ARAÇ önerisi).
* **118 AÇIK** (OPS penceresinde): siteyi yeni Design tasarımına geçirme sırasında ürün sayfası + kategori/liste mi önce (442 adres yayınıyla AYNI yayında, adres işi beklemez), yoksa temel görünüm (yazı, renk, köşe, kabuk) mı önce (ürün sayfası yeni görünümle doğar ama adres işi bekler). TASARIM envanteri 2026-09-25: 15 geçiş birimi. OPS + TASARIM önerisi: adres işini bekletmemek.

**118. ADRES ÖNCE** (Recep OPS penceresinde, 2026-09-25): "Design tarafında bu iş tamamen bitirilmedi, karara bağlanmadı; eldeki verilerle iş yürütülebilir. Benim asıl derdim URL tarafında tekrardan kırmadan işi bitirmek; 442 URL de yürüyor. Çok gerekirse yönlendirme ile yapacağız mecburen. İlk derdim görsel tasarım değil; muhtemelen önümüzdeki hafta genel olarak site dizaynı ile yoğunlaşacağız. Önce eldeki öncelikleri toparlayalım." → Sıra: 442 adres + Bilgi Merkezi önce; tasarıma geçiş sonraki hafta. KISIT: tasarım geçişi adres şemasını bir daha değiştirmez; adresler bu yayında kalıcı olur, değişiklik zorunlu kalırsa yalnız kalıcı yönlendirmeyle.

**109. CANLI KABUL GEÇTİ** (ALTYAPI ölçtü, 2026-09-25): #1374 2026-09-24 12:42Z merge; yönetici stok özeti 442/442 ve arama fiyatı 200/200; moderatör ve müşteri 0/442, 0/200, product_costs 0 satır; yetkiler birebir aynı. Taban tazelemesi 2026-09-25 09:08Z tetiklendi.

**115. EVET · UYGULANDI** (Recep KATALOG penceresinde, 2026-09-25: "benden beklenenlere evet") — 24 kategori EN açıklaması canlıda, geri okuma 24/24.
**116. EVET · UYGULANDI** — 166 ürünün EN adındaki Türkçe biçim düzeltildi (d/dk, ondalık virgül, HIZ ANAHTARI); geri okuma 166/166; EN adı olan ürün 24 → 190.
**119. EVET · UYGULANDI** — santrifüj fanlar kategorisinin TR metni kaynağa göre düzeltildi (salyangoz gövdeli, doğrudan akuple). Paket yeniden üretildi, TAZE. Ayrıntı REC-146 yorumu. Uygulayan KATALOG.

* **120 AYRILDI** (OPS soracak): ilk blog yazısının (frekans konvertörü) Bilgi Merkezi'nde yayını — önce yerel ön izlemede gerçek sayfada gösterilecek.

**121. İÇERİK STRATEJİSİ (Recep OPS penceresinde, 2026-09-24/25)** — (a) Blog üretimi DURMAZ; konu sırası: frekans konvertörü → radyal mı aksiyel mi → Vortice sessiz fanlar → korozyona dayanıklı (asit) fanlar → ısı geri kazanım → çatı fanları → banyo fanları; sırayı yalnız Recep değiştirir, hacim/mevsim verisi gelince OPS öneri götürür. (b) İçerik türleri EVET: "doğrusu ve yanlışı" dizisi, mevzuatı ilk anlatan olmak (MEVZUAT şeridiyle), hesaplayıcılarla birleşen yazılar. Sonraya: saha deneyimi yazıları, Türkçe iklimlendirme terimleri sözlüğü. Tedarikçi yazıları şimdilik YOK. (c) "Profesyonel bilgi, uydurma yok": her iddia kaynağa bağlı (rehber-yazisi-standard). ESKİ destek sayfası içerikleri KULLANILMAZ ("çok kaba bilgiler, faydası yok"); Bilgi Merkezi'ne taşınan 3 eski konu yayından kaldırılır, konu sırası gelince kaynaklı yeni yazıyla aynı adreste döner. (d) ESP yazısı mümkün: Recep'in çalıştığı firmanın iç bilgisi ve firmaya yazılan metin kullanılmaz. Kayıt: REC-369 yorumları 09-24 (konu sırası) ve 09-25 (strateji). Uygulayan BLOG (+URUN yayından kaldırma).

* **122 EVET** (Recep SATIS penceresinde, 2026-09-25: işlem adıyla anlatımdan sonra "üçüne de evet" — 103 #1373, 107 #1385, 122 #1410 REC-384). Merge sonucu SATIS'tan gelecek.
* **123 AYRILDI** (KATALOG): REC-392 enerji etiketi/föy verisinin canlıya yazımı (11 ürün 191 değer, erp\_ önekli, 0 değişen) — URUN başlıkları depoya girdikten sonra sorulur.
  **124. EVET — GEO-SEO ŞERİDİ** (Recep OPS penceresinde, 2026-09-25: "geo-seo olarak açtım"): arama görünürlüğü (SEO/GEO ölçümü, GSC, Ads hacim/mevsim, bot karnesi, REC-300 yayın denetimi, teknik SEO denetimi) BLOG'dan GEO-SEO'ya geçti; karar 93'ün "denetim üreticiden bağımsız" ilkesi korunur (GEO-SEO kod/yazı yazmaz, ölçer ve sahibine iletir). BLOG yazı + MEVZUAT iş birliği.
  **URUN SIRASI (Recep, 2026-09-25: "evet işlesin")**: REC-300 Faz 3b/3c önce merge; küçük onarımlardan yalnız REC-392 başlıkları araya girer.
* **125 AYRILDI** (ALTYAPI): url_takma_adlari için anon kolon düzeyi SELECT + tek tenant politikası (1d, B′; migration) — Faz 3-C öncesi sorulur.

**103 · 107 · 122 UYGULANDI** (SATIS, 2026-09-25; sınıflandırıcı işlem adıyla sorulan sorulara verilen "üçüne de evet" ile geçirdi): #1373 c7f4be2ad 09:46:22Z · #1385 0299ef70a 09:46:57Z · #1410 c423e9da2 09:59:23Z; supabase-migrate üçü success. Canlı ölçüm (salt okuma): 103 generate_order_number anon/authenticated false, publish anon false / authenticated true; 107 create_quote_with_items INVOKER, anon false; 122 tetikler + kalem kilidi var, yetkiler doğru, Vault bayrağı YOK (misafir e-postası kapalı, ALTYAPI webhook + Recep Edge onayından sonra açılır). Açık kol: sonraki siparişte order_number dolu mu (son sipariş 08-18).

**117. EVET** (Recep ARAÇ penceresinde, 2026-09-25: "evet mantıklı, o zaman ihtiyaca göre önce konu bana gelir, gerekiyorsa da gerçekten ölçüm ile karar verilir"): tekrarlayan tur (loop/cron) kendiliğinden kurulmaz; gerekiyorsa önce Recep'e gelir, gereklilik ölçümle gösterilir. board-brief LOOP satırı buna göre değişti (ARAÇ, dal arac/karar-117-dongu-satiri); session-loop-ritual.md'deki CronCreate adımı da iner.

* **126 GERİ ÇEKİLDİ** (KATALOG, 2026-09-25, Recep 'kesin mi' diye sorunca): kaynaksız 'ErP uyumlu' temizliği (önceki öneri KORU 107 / SİL 80) YANLIŞ ÖLÇÜMDEN çıkmıştı. İlk tur ve çürütücü yalnız sayfalar.jsonl'da anahtar kelime aradı; defter ve kaynak dizini SİL listesinde üç şüpheli aile buldu: Vort E ATEX s.3 ve Nordik HVLS s.3'te 'Ecodesign 2019/1781 (motorlar)' (motorun beyanı, fanın değil), vortice-brochure-mev s.3'te 'ErP 2009/125 … 1253/2014' uygunluk cümlesi (5 HR ürününü kapsayıp kapsamadığı ölçülmedi). KATALOG SİL listesini aile aile yeniden denetleyip yeni sayılarla yeni numara isteyecek. Recep'e sorulmaz.
* **127 AYRILDI — DARALTILDI** (GEO-SEO soracak): yapay zekâ cevaplarında görünürlük ölçümü için yalnız **Gemini ücretsiz API anahtarı**; Perplexity alt seçenek, ilk ölçümden sonra ayrıca. Claude ölçümü abonelikle yapılıyor (claude -p, boş klasör, yalnız WebSearch; ölçüldü) → GEO için ayrı ANTHROPIC anahtarı GEREKMEZ (REC-309 beceri sınavı kalemi ayrı kalır). NVIDIA_API_KEY GEO'ya uymaz (açık modeller, arama yok). **→ 127 EVET, UYGULANDI (2026-09-25):** Recep GEMINI_API_KEY + PAGESPEED_API_KEY'i kullanıcı ortam değişkenine koydu (tek soruda iki anahtar); GEO-SEO değer okumadan deneme çağrısıyla ölçtü: PSI 200 (/tr mobil SEO 1,00 · erişilebilirlik 1,00 · iyi uygulama 0,96 · performans 0,76), Gemini çalışıyor (ücretsiz katmanda aramalı cevap yalnız gemini-2.5-flash-lite; sınır cetvele yazılır).
* **128 GERİ ÇEKİLDİ** (GEO-SEO, 2026-09-25): Bing Webmaster Tools 2026-08-29'da zaten kurulmuş (REC-127, PR #959). Kayıt okunmadan soruldu; Recep'e sorulmaz.
* **129 EVET — UYGULANDI** (OPS, Recep'e OPS penceresinde soruldu, 2026-09-25): ekranda 15 dakikada bir açılan komut penceresinin kaynağı Windows Görev Zamanlayıcısı'ndaki \\OrionBoardSync (orion/scripts/board_sync.cmd, pano→Orion taşıyıcısı; 'Interactive only', gizli değil) — ALTYAPI ölçtü, 13:52:25 penceresiyle aynı saniye. Öneri: görev KAPATILMAZ (taşıyıcı hâlâ kullanılıyor), yalnız eylemi pencere açmadan koşacak biçimde değiştirilir (conhost --headless ya da eşdeğeri); değişiklik öncesi görev tanımı dışa aktarılır (geri dönüş). Uygulayan ALTYAPI. Ek not: son koşum sonucu 0x800710E0, taşıyıcının gerçekten başarılı koştuğu ayrıca ölçülecek. **KAPSAM GENİŞLEDİ (ALTYAPI ek ölçümü 14:18 TR):** taşıyıcı BAŞARILI KOŞMUYOR — 13:52 örneği asılı (board sync --days 3, 26 dk+), MultipleInstances=IgnoreNew → sonraki her tetik reddediliyor (0x800710E0), ExecutionTimeLimit=PT72H → asılı örnek 3 gün yaşar; pano→Orion aktarımı fiilen durmuş. 129 tek seferde: (a) görev XML dışa aktarımı, (b) penceresiz eylem, (c) ExecutionTimeLimit PT10M, (d) asılı 13:52 örneğini sonlandırma. Asılma sebebi ayrı ölçüm (ALTYAPI, registry-autosync.log). **→ UYGULANDI (Recep ALTYAPI penceresinde \~14:25 TR: "evet gizli çalışsın ... sen önce gizli yap"; ALTYAPI):** (a) XML yedeği OrionBoardSync-yedek.xml; (b) eylem conhost.exe --headless …board_sync.cmd, Hidden=True; (c) süre sınırı 72 sa → 30 dk (10 dk ölçüme göre yanlıştı: geçmiş koşular 7-30 dk); (d) asılı 13:52 örneği + iki python süreci sonlandırıldı. Emeklilik sorusu (aktarımı okuyan var mı) ayrı ölçümde. Doğrulama: ARAÇ 30 dk pencere izlemesi.
* **130 BEKLE — AVenS CEVABI** (OPS, Recep'e OPS penceresinde soruldu, 2026-09-25; REC-397): üreticinin 'yalnız AB dışı pazar' dediği 10 model (7 CA MD kanal fanı + E 404/504/604 M) satıştan çekilsin mi (sitede pasif, geri açılabilir)? MEVZUAT hükmü: SERBEST DEĞİL — CA MD: SGM 2021/18 Md.5(2) + Ek-III, 1 Ekim 2021'den beri; üretici 'not in compliance with Reg. ErP 2018' (in_line s.33). E M: SVGM 2019/15, 20 Aralık 2020'den beri; üretici açık uyumsuzluk yazmıyor, güçlü işaret. Yükümlülük: 7223 sayılı Kanun Md.9 (ithalatçı) / Md.10(1)(b) (dağıtıcı: 'uygun olmadığını bildiği … durumlarda … piyasada bulunduramaz'). İstisna: yürürlük tarihinden önce TR'ye ilk kez arz edilmiş birim. Canlı durum: 10/10 aktif, fiyatlı; sipariş/teklif/sepet 0. Öneri: satışa kapat; ithalat tarihi ya da uygunluk beyanı gelirse geri aç; AB uyumlu muadiller CA MD EP / CA ES (SATIS değerlendirir). Uygulama KATALOG (yedek → yazım → geri okuma). Ayrı ONARIM: E 404/504/604 M 'ErP Uyumlu: Evet' iddiası dayanaksız → ErP temizliği kararına (126'nın yerine gelecek) dahil. docs/audits/icerik-hatti-taslak-endustriyel-atex-2026-09-06.md s.229 'Türkiye AB dışı pazar' varsayımı YANLIŞ → KATALOG düzeltme notu. **→ KAPSAM DARALDI (MEVZUAT düzeltmesi, REC-397 yorum a4ecabfa, 12:15Z):** 'serbest değil' başlığı E 404/504/604 M için fazla güçlüydü — üretici orada 'uygun değil' demiyor, hüküm BELİRSİZ; bu 3 modelde bugün dayanaklı olan YALNIZ 'ErP Uyumlu' satırının kaldırılması (ErP temizliği kararına). **130 artık yalnız 7 CA MD** (CA 200/250/315 MD: üretici + TR tebliği, kod eşlemesi güçlü çıkarım; CA 100/125/150 Q MD 60–85 W: aynı, ama 'yalnız gövdeli fan' sınıflaması yorumuyla hiçbir tebliğe girmeme yolu da var). E M için üreticiden uygunluk beyanı / AVenS'ten ithalat tarihi istenir. Recep 'anlamadım, varsayım yapıyorsunuz' dedi (KATALOG penceresi) → 130 Recep gerekçeyi anlayana kadar bekler. **→ BEKLE (Recep OPS penceresinde, 2026-09-25):** "130 AVenS'ten cevap gelene kadar bekleyecek." Ürünler satışta kalır; AVenS Soru Paketi 8. bölüm (17 soru) cevabıyla yeniden sorulur. KATALOG hazırlık dalı (urun-katalog/rec397-ca-md-pasif) bekler.
* **131 EVET — UYGULANDI** (OPS, Recep'e OPS penceresinde soruldu, 2026-09-25): kod analiz sunucusuna (tsserver) bellek tavanı. ARAÇ ölçtü: her Claude Code oturumu kullanıcı eklentisi typescript-lsp-win@recep-plugins ile kendi typescript-language-server'ını açıyor, o da tavansız tsserver açıyor (Node varsayılanı \~4 GB); uzun oturumda şişiyor (3,5 / 3,6 / 2,2 GB ölçüldü; tam proje tip denetimi 730 MB). Öneri: \~/claude-plugins/.claude-plugin/marketplace.json → lspServers.typescript.initializationOptions.maxTsServerMemory = 2048 (tsls 5.1.3 belgelenmiş seçenek; Claude Code eklenti şeması initializationOptions'ı belgeliyor). Tavan aşılınca sunucu ölür ve Claude Code aynı dakikada yeniden açar (restartOnCrash, ölçüldü) → pencere bozulmaz. Depo dışı kullanıcı ayarı, yeni açılan oturumlarda geçerli; geri dönüş = satırı silmek. Uygulayan ARAÇ (diff: ARAÇ karalama lsp-bellek-oneri.md). Eşlik: PR #1427 ⚠BELLEK satırı (3 GB üstü tek süreç / 2 GB altı boş). **→ EVET (Recep ARAÇ penceresinde, 2026-09-25: "131 evet"); UYGULANDI + DOĞRULANDI (ARAÇ):** yedek marketplace.json.oncesi-karar131-2026-09-25; yalnız initializationOptions.maxTsServerMemory=2048 (3 satır diff); yeni oturumda iki tsserver komut satırında --max-old-space-size=2048 görüldü. Etki yeni pencerelerde. Ek ölçüm: 7 günde LSP elle neredeyse hiç çağrılmamış, ama düzenleme sonrası tip hatası bildirimi 479 kez → sunucu pasif denetim için gerekli, kapatma önerilmez.
* **132 EVET — UYGULANDI** (ALTYAPI Recep'e ALTYAPI penceresinde numarasız sordu; OPS numaralandırdı, 2026-09-25): komut penceresinin İKİNCİ kaynağı — IDE açılışında her Claude penceresi Playwright eklentisini (npx) ve TestSprite'ı (cmd /c npx) başlatıyor; ikisi 27 Ağustos düzeltmesinden sonra eklenmiş, eski desende. Öneri: ikisini node ile doğrudan başlatmak (npx/cmd sarmalayıcısı olmadan). MCP/eklenti yapılandırması = Recep kapısı. Tur sonu / compact sonrası pencereler: claude.exe'nin kendi git çağrısı ya da claude-mem bun.exe (bizim kancalarımız değil). 129 (OrionBoardSync) ile birlikte uygulanır. **→ UYGULANDI (Recep ALTYAPI penceresinde \~15:15 TR: "evet onaylıyorum"; ALTYAPI):** @playwright/mcp@0.0.82 + @testsprite/testsprite-mcp@0.0.42 npm -g; \~/.claude.json testsprite = node …/dist/index.js (API_KEY korundu), yeni kullanıcı sunucusu playwright = node …/cli.js (el sıkışma çalışıyor); settings.json playwright eklentisi kapatıldı; yedekler claude.json.yedek-132 + settings.json.yedek-132. Etki yeni pencerelerde. Araç adları mcp__plugin_playwright\_\* → mcp__playwright\_\* (ARAÇ tüketicileri tarar).
* **133 AÇIK** (ALTYAPI Recep'e numarasız sordu; OPS numaralandırdı, 2026-09-25): Windows 'varsayılan terminal uygulaması' ayarını 'Windows Konsol Ana Bilgisayarı' yapma denemesi (kalan kısa pencerelerin Windows Terminal yerine klasik konsolda açılması / görünürlüğü üzerine). ALTYAPI compact dönüşünde bu numarayla, etki + geri dönüş ile yeniden sorar.
* **120 EVET (135 ile)** (2026-09-25): Recep ön izlemede ilk yazıyı gördü: "blog gibi, daha kaliteli görünmeli, kapak resmi bile yok". Rehber sayfası görsel olarak yükseltilecek; 120 yükseltme sonrası yeniden sorulur. **→ 135 cevabıyla EVET:** frekans konvertörü yazısı (138df0114e60) mobil taşma onarımından sonra yayına girer; ardından konu sırasıyla radyal/aksiyel (66b819a57e6d) ve sessiz fan (c97c7d929cc5), her biri ön izleme + mobil ölçümüyle.
* **134 KARAR** (URUN Recep'e numarasız sordu; OPS numaralandırdı): rehber yazılarında kapak ve şema/diyagram görsellerinin KAYNAĞI (ör. kendi çizim/üretim, üretici görseli, lisanslı stok, yapay zekâ üretimi — seçenekler URUN'un Recep'e anlattığı hâliyle; telif ve kaynak gösterim kuralı R-cetvelinde). **→ KARAR (Recep OPS penceresinde, 2026-09-25):** "Kapak resmi için ilgili resimlerimiz kullanılsın. Eğer yazı içeriği ile ilgili ürünümüz yoksa demek ki bu yazı bizim dışımızda bir konu içermekte; o zaman biz bir foto bulacağız ya da Gemini'ye yaptırıp size vereceğim." → KURAL: kapak = yazının konusuyla ilgili KENDİ ürün görselimiz (DB product_images); ilgili ürün yoksa kapak Recep'ten gelir (bulunan foto ya da Gemini üretimi). Şema/diyagramlar R3.1 v0.7'ye göre VentHub çizimi.
* **135 EVET — YAYINA GİRSİN** (URUN Recep'e numarasız sordu; OPS numaralandırdı): ilk yazının yayını görsel yükseltmeyi BEKLESİN mi, yoksa yazı şimdiki şablonla yayına girip yükseltme sonra mı gelsin. Plan: TASARIM'ın üç sütun önerisi (a217f9a0) + gelecek haftaki tasarım sistemi geçişi birleşik (URUN). **→ EVET (Recep OPS penceresinde, 2026-09-25):** "Yayına girsin, görsel sonradan da yapılabilir zaten." → yazılar mevcut şablonla yayına girer, kapak/şema yükseltmesi sonra. ÖN KOŞUL (OPS): mobil 390 px 'Kaynaklar' yatay taşma onarımı (müşteriye görünen kusur) yayından ÖNCE. Bu cevap 120'yi de karşılar (aşağıda).
* **136 EVET** (BLOG Recep'e yerel '35' numarasıyla sordu; OPS numaralandırdı, 2026-09-25): sessiz kanal fanı yazısında (sha c97c7d929cc5, MEVZUAT 3g 'onaya gidebilir') genel akustik kural için Nicotra AT kataloğu kaynak \[5\] olarak kalsın mı? BLOG önerisi: kalsın (yalnız genel kural, ürün önerisi değil). **→ EVET (Recep OPS penceresinde, 2026-09-25: "136 evet"):** Nicotra AT kataloğu sessiz fan yazısında genel akustik kural kaynağı \[5\] olarak kalır.

Sonraki boş karar numarası 137.
