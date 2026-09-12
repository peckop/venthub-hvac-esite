# Kararlar — Altyapı, Kapılar ve Belge Hattı (Linear belgesinin TAM dışa aktarımı · 2026-09-12 ayna: K1–K10)

<!-- kaynak_id: 5f43fac5-f2a9-40d7-8da5-86bf5235764e · kaynak_updatedAt: 2026-09-08T12:19:34.533Z · kopya: 2026-09-12T10:10Z -->
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

8 üretilmiş dosya (docs/*_master.md, system_tree.md, artefakt_manifest.json) özellik PR'larında YENİDEN ÜRETİLMEZ; depoda kalır. Yeniden üretim yalnız dijital ikize yükleme öncesi tek "belge tazeleme" PR'ında. Kapı kolları dondurulmuş modda uyarı + sayım, tazeleme PR'ında kırmızı. Sıfır tüketicili standards_master.md ve kayitlar_master.md git'ten çıkar. "Hepsi çıkar" (A) ikiz kararı sonrasına ertelendi. Sebep: günde 5 taban tazelemesi; 27 tüketici; INV-DOC-4b'nin "ikize giden = depo hali" güvencesi korunur. İş: REC-132.

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
