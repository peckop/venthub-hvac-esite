# Kararlar — Altyapı, Kapılar ve Belge Hattı (Linear belgesinin TAM dışa aktarımı · 2026-09-24 ayna: K1–K10)

<!-- kaynak_id: 5f43fac5-f2a9-40d7-8da5-86bf5235764e · kaynak_updatedAt: 2026-09-24T08:59:52.924Z · kopya: 2026-09-24T08:59Z -->
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
