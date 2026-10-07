# docs/ — Tek Giriş Haritası

> "Bu iş nasıl yapılır / nereye bakılır?" dendiğinde **ön kapı**: hangi soru → hangi harita, hangi dosya.
> `CLAUDE.md` bu dosyayı "Tek Giriş Haritası" bölümüyle gösterir; kendi kısa doküman listesi de karar 159 gereği
> yerinde kalır (`standards/belge-yonetimi-standard.md` B2). Çelişirse bu dosya güncellenir, CLAUDE.md'ye haber verilir.
> Kural: her konunun **tek otoritesi** vardır; diğer dosyalar onu tekrar etmez, **referans verir**.
> Haritada olmayan belge ajan için yoktur: yeni cetvel bu dosyaya satırı eklenmeden bitmiş sayılmaz.
> **Şirket çerçevesi (OPS'un özeti, Recep'in "sen yöneticisin" sözüne dayanır, 2026-10-01):** Recep = şirket sahibi; **OPS = genel müdür** (yürütmenin başı,
> sahibe karşı tek sorumlu yüz; Recep'in onayını aktarabilen tek pencere); departman penceresi = departman müdürü;
> alt ajan = çalışan; skill = uzmanlık. Onay yolu: `standards/fleet-mechanism-standard.md` §17 Kural 4 (karar 224).
> **DURUM (2026-10-01, sahibi OPS, durum değişince OPS günceller):** şirket henüz kurulmadı, sitede gerçek satış yok (Recep'in sözü);
> canlıdaki sipariş/kullanıcı verisi deneme (OPS'un notu, ölçülmedi). Bir bulguyu tart: müşteriye BUGÜN zarar veriyorsa şimdi
> (veri bozulması, sır/gizlilik sızıntısı, ödeme riski bugün zarar sayılır); vermiyorsa kart + "ilk satıştan önce" etiketi,
> Recep'e karar olarak gitmez. Recep kapıları (migration, sır, geçmişi silen git, canlı veritabanı yazımı, para) değişmez.

## Haritaların haritası — hangi soruda hangi harita

| Soru | Harita / araç | Not |
|---|---|---|
| Hangi belge, hangi kural, hangi cetvel? | **bu dosya** (aşağıdaki tablolar) | kırık yol INV-BELGE-1 ile denetlenir |
| Kod: ne çağırıyor, neyi etkiler, nerede? | **CodeGraph** (MCP `codegraph_explore`) | ~1 sn taze, birebir kaynak döndürür |
| Kod + **veritabanı** ilişkisi (tablo, FK, sembol toplulukları) | **graphify** + Supabase şema grafı (`graphify query/path/explain`) | `graphify-out/` üretilmiştir; kurulum ve kural `../CLAUDE.md` "graphify" |
| Kod içinde metin/sembol araması | **WrongStack kod dizini** (MCP `wrongstack-codebase-index`) | dizin elle tazelenir; yaşı ölçülmeden güvenme |
| Bir dosyaya dokununca geçmiş ders | **sage** (kanca dosyaya dokununca kendiliğinden getirir) | `standards/hafiza-kancalari-standard.md` §6 |
| "Konuşmuş muyduk / ne karar vermiştik / niçin" | NotebookLM takip defteri `a5f382a4-b4e7-450c-84e0-9b7c082e2502` + Linear "Kararlar" belgesi (REC-554'e kadar; sonra dosya) | `standards/proje-takip-defteri-standard.md` |
| Kural / niçin / mimari (kod hafızası) | NotebookLM dijital ikiz `235043eb-970f-4a52-9f39-1d02b2621e9c` | snapshot'tır; çelişirse kod kazanır |
| Bütün belgelerde tarama | NotebookLM "VentHub Belgeler" `f503a886-3e2f-4234-8455-ee57c66f9488` | tek başına güvenilmez; bulgu dosyada doğrulanır |
| İş ne durumda, kimde? | **Kanban** (WrongStack panoları; iş kaydının tek kaynağı, karar 219; Linear donuk arşiv) | `standards/is-kayit-duzeni-standard.md` |
| Ajanın kalıcı dersleri | hafıza dizini `MEMORY.md` (depo dışı, oturum açılışında yüklenir) | `standards/hafiza-kancalari-standard.md` |
| Hafızaya ya da talimat dosyasına (`CLAUDE.md`, rol kartı) kim, nereye yazabilir? Günlük dosyası nerede durur ve nasıl döndürülür? Hafızadaki bilgiye tarih ve kaynak nasıl yazılır? | katmanlı model: ortak çekirdek (OPS onaylı) + departman klasörü + ayrı günlük klasörü; §9b günlük döndürme (DEVİR bloğu + `gecmis/`), §12 künye (yazıldı + kaynak) | `standards/hafiza-yazma-duzeni-standard.md` |
| Belge / harita ne kadar taze? | her mesajdaki durum satırları; elle: `node scripts/belge/belge-tazelik.cjs` | `standards/belge-yonetimi-standard.md` B5 |

## Klasör düzeni

| Klasör | İçerik | Elle düzenlenir mi? |
|---|---|---|
| `docs/` (kök) | **Üretilen** master'lar (`*_master.md`, `system_tree.md`, `database_schema_master.md`, `design_system_config.md`) + `DURUM-TAKIP.md` (emekli, yönlendirme sayfası) | ❌ master'lar orion pipeline'ın çıktısı — elle yazma |
| `docs/standards/` | **Cetveller** — "ne iyi demek" (admin/bayi standartları, blueprint) | ✅ küratörlü |
| `docs/audits/` | **Ölçümler** — doğrulanmış gerçek (ground-truth, panel denetimi, lighthouse) | ✅ kanıt |
| `docs/plans/` | **Planlar/roadmap** (SaaS roadmap, refactor planı) | ✅ |
| `docs/reference/` | Dış referans (Supabase resmi dokümanları, Vortice katalog) | ✅ |
| `docs/products/` | Ürün master/SEO | ✅ |
| `docs/archive/` | Eski/legacy — aktif değil | ❄️ dondurulmuş |

## "Bu iş nasıl yapılır?" → rehber haritası (otorite dosya)

| Soru | Otorite |
|---|---|
| Bayi modülü **NE** yapmalı? (B2B domain) | `standards/dealer-network-standard.md` |
| **Nasıl** inşa edilir, hangi sırada, bu DB'de? | `standards/dealer-module-blueprint.md` (R0→B2) |
| Admin **sayfası** nasıl kurulur + nasıl ölçülür? | `standards/admin-standard.md` (+ §8 cetveli) |
| Admin **ne** yapmalı, ne eksik, hangi öncelik? | `standards/admin-capabilities.md` (NE-envanteri) |
| Eski siteden geçişte **SEO sıralaması** nasıl korunur? | `plans/seo-transition-blueprint.md` |
| **Ne ölçülür** (analytics / GA4 / dönüşüm)? | `standards/analytics-standard.md` |
| Şu an **gerçek** ne? | `audits/dealer-data-ground-truth-2026-06-11.md` |
| Fiyat/kur/marj **nasıl hesaplanır**? | `standards/pricing-standard.md` |
| **Katalog PDF'inde ne yazıyor?** (PDF'i AÇMA — dizini oku) | `standards/catalog-ingestion-standard.md` §6.3 → `<ingestor>/kaynak-dizini/sayfalar.jsonl` |
| Hangi sayfa **nasıl üretilir**, veri değişince **ne tazelenir**, fiyat **hangi yüzeyde** görünür? | `standards/rendering-cache-standard.md` |
| Statik sayfaların (hakkımızda, iletişim, destek…) **adres dili**: TR'de Türkçe, EN'de İngilizce yol; eski adresler nereye gider; anahtar nasıl açılır/geri alınır? | `standards/rota-dili-standard.md` (v0.1, OPS-52; kategori/marka adresleri değil, onlar `adres-semasi-standard.md`) |
| Müşterinin gördüğü ürün metnine **ne girer, ne girmez** (iç editör notu, doğrulanmamış değer)? | `standards/vitrin-metni-standard.md` |
| Rehber (bilgi) yazısının **konusu nasıl seçilir, kaynağı ne, nasıl doğrulanır**, yayından sonra ne ölçülür? | `standards/rehber-yazisi-standard.md` (TASLAK, karar 62) |
| Aramada ve pazarda **nasıl göründüğümüz hangi kaynaktan ölçülür**, haftalık takip nasıl, hangi veri depoya girmez? | `standards/pazar-olcum-standard.md` (TASLAK, karar 93 → 124) |
| Bir ürün ailesine **hangi tüzük, tebliğ ya da standart** dokunuyor, ne zaman yürürlüğe giriyor, Türkiye karşılığı ne? | `mevzuat/kayit.json` (veri) + `standards/mevzuat-kaydi-standard.md` (kurallar, TASLAK) |
| Adres/şablon **yayınından önce, yayın günü ve sonra** arama görünürlüğü nasıl denetlenir (eski adres tek 308, kırık bağlantı, SEO puanı), kusur kimin? | `standards/yayin-gorunurluk-denetim-standard.md` (TASLAK, REC-300) |
| **Yapay zekâ cevaplarında** (Claude, Gemini) VentHub geçiyor mu, hangi motorla, hangi soru listesiyle, ne ölçülmez? | `standards/geo-olcum-standard.md` (TASLAK, karar 124) |
| Hangi arama motoru / yapay zekâ ürünü **hangi dizinden beslenir**, hangi bot gelir, bizden ne ister ("Bing'de olmak ChatGPT'de olmak mı")? Sitemizde bot engeli, IndexNow, llms.txt, ölçümün kör noktaları? | `standards/dizin-sistemleri-standard.md` (TASLAK, SEO-1) → ölçüm `audits/dizin-gorunurluk-olcum-2026-10-02.md` |
| Bir kategorinin **adı hangi kolondan** gelir (menüde, başlıkta, kırıntıda)? | `standards/kategori-adlandirma-standard.md` |
| Birden çok Claude oturumu **nasıl çakışmadan** çalışır (şerit sahipliği, worktree izolasyonu, bir-iş-bir-dal)? | `standards/collaboration-protocol.md` (kurallar) · `standards/multi-session-coordination-standard.md` (şerit panosu: kira, yol rezervasyonu, canlılık) · `standards/fleet-mechanism-standard.md` §0 (filo mesajla çalışır), §35 (pano canlılığının gerçek kaynağı `claude agents --json`), §36 (ölçüm için açılan `claude -p` alt süreci) |
| Pencereler yeniden açılınca ne yapılır, tekrarlanan tur (loop/cron) ne zaman ve kimin onayıyla kurulur? | `standards/session-loop-ritual.md` |
| Bir iş **hangi yöntemle** koşar (şerit / alt ajan / Workflow / maestro / skill / elle), emirde `YÖNTEM:` satırı? Alt ajanın modeli, ekip lideri, ekip (agent teams) hangi yüzeyde kurulur? | `standards/execution-method-standard.md` (§10.3 model ve mutasyon istisnası, §10.5 ekip yüzeyi) |
| Bir şeye "**yok / bulunamadı / desteklemiyor**" demeden önce neyi, nerede, hangi yöntemle aramalıyım? | `standards/execution-method-standard.md` §9 (yokluk hükmü) |
| Bir test **nerede koşar** (PR kapısı / master push / zamanlı)? Kırmızısı PR'dan bağımsız (dünya durumu) testler nereye taşınır, PR başlığı ya da gövdesi düzenlenince paketin tamamı neden yeniden koşmaz? PR'da neden yalnız değişenle ilgili testler koşar, belge PR'ında kurulum/Lint/tip neden atlanır (§4.3)? | `standards/test-karnesi-standard.md` (v1.0, ALT-38; §1–§5 çalıştırma düzeni; test karnesi bölümü ikinci teslimle gelir; kapılar INV-TEST-KOSU-1, INV-CI-EDITED-1/2, INV-CI-SECIM-1/2, INV-DUNYA-SATIRI-1; veri `scripts/ci/dunya-durumu-testleri.json`) |
| Kanban kartının **planı nasıl yazılır, kim uygular**, hangi planlar Recep'e tek sayfa özetle gider, işe başlamadan **"daha önce yapıldı mı" nasıl aranıp yazılır** (ÖNCEKİ ÇALIŞMA)? | `standards/kart-plani-standard.md` (karar 241/243, OPS-30; kapı `scripts/belge/kart-plan-kapisi.cjs`, INV-KART-PLAN-1) |
| Bir departmanın **amacı ve düzenli görevleri** neler, hangisinin tetiği gerçekten kurulu? | `standards/duzenli-gorevler-standard.md` (OPS-27, HRT-24; veri `scripts/belge/rol-gorevleri.json`, tablo `docs/roller/<ROL>-gorevler.md`, INV-ROL-1) |
| **Bu iş hangi departmanın?** 16 departmanın görevi, dosya alanı ve **açılış yolu** (masaüstü mü, ekip modu için terminal mi) tek tabloda | `roller/DEPARTMAN-HARITASI.md` (üretilmiş, OPS açılışında kısa özeti gelir; HRT-29; üretici `scripts/belge/rol-karti-uret.cjs`, bayatlık kapısı INV-ROL-1; açılış yolu `scripts/board/pencere-adlari.cjs` tablosundan türer) |
| Bir departmanın (OPS, ARAC, ALTYAPI, HARITA, URUN, ADMIN, KATALOG, GEO-SEO, BLOG, MARKA) görevi, dosyaları, yetkisi ve Recep kapıları ne? | `roller/<DEPARTMAN>.md` (rol kartı; üretici `scripts/belge/rol-karti-uret.cjs`, REC-426) |
| Bir departmanın **çalışan** (alt ajan) tanımı hangi skill'lerle ve hangi araç sınırıyla gelir? | `.claude/agents/<departman>-<tur>.md` (üretilmiş, elle düzenleme yok; üretici `scripts/belge/ajan-tanimi-uret.cjs`, girdi `docs/audits/skill-departman-setleri-2026-09-30.json`, kapı INV-AJAN-TANIM-1). Bağlam maliyeti (ölçüm 2026-10-01): tanım başına ~96 jeton, 50 tanım ≈ 4,8k; her oturumun ve her alt ajanın ilk çağrısında bir kez; tavan 6k jeton (kapıda karakter karşılığı), aşan yeni tür OPS'a gider. |
| Katalogdan ticarete hat — ürün nasıl girer, CSV, fiyat, şema, kategori? | `plans/catalog-commerce-pipeline-master-2026-06-20.md` (uçtan uca pano) + `standards/{catalog-ingestion,csv-import-export,pricing,product-schema,category-taxonomy}-standard.md`; veri deposu kardeş depo `venthub-pdf-ingestor` |
| Bir işi **alt-ajana** ne zaman devrederim, neyi yasaklarım, sonucu neye göre kabul ederim? | `standards/subagent-delegation-standard.md` |
| Hangi tasarım **yeteneği (skill)** kalır/erir/kaldırılır, yenisi nasıl kurulur? | `standards/tasarim-yetenek-standard.md` |
| Depoda **hangi araçlar var** (kanca, betik, skill, CI, cetvel), kimin, canlı mı, ölü aday nasıl sayılır? | `standards/arac-envanteri-standard.md` → envanter `audits/arac-envanteri-<tarih>.md` (betik üretir) |
| Site, veritabanı, DNS, e-posta **nerede barınır**, sağlayıcı değişirse **ne sökülür**? | `standards/barindirma-standard.md` (TASLAK, karar 59) |
| Belgeler **nasıl yazılır** (gövde/tarihçe, sahip), hangi bilgi **hangi katmanda** durur, belge bayatlığı **nasıl görünür**, doğru belge **ne zaman kendiliğinden gelir**? | `standards/belge-yonetimi-standard.md` (TASLAK, REC-400) |
| e-Fatura/e-Arşiv, muhasebe, CRM/ERP, yönetici paneli, PIM ya da "satış olsa çalışır mı" **daha önce ölçüldü mü**? Ölçümü tekrarlamadan önce nereye bakılır? | `olcum/README.md` → konu başına defter (yeniden ölçme yalnız defterdeki tetikleyici oluşunca; sahip OPS) |
| Bir **hesap, panel, anahtar ya da bağlayıcıya erişimimiz var mı** (Resend, Bing, Linear, Supabase, GSC…)? Recep'e sormadan önce nasıl ölçülür? | `olcum/erisim-envanteri.md` (her satırda "Kanıt" yolu; değer yazılmaz; sahip OPS, satırı sahibi pencere ölçer) |
| **Niçin** / moat / vizyon? | `../VISION.md` |
| Kuralların **31 maddelik gerekçeli tam listesi** (çekirdek 14 kural `CLAUDE.md`'de) | `standards/gelistirme-kurallari-tam-liste.md` (GEÇİCİ; REC-433 rol kartlarına dağıtılacak) |
| Eski "uçtan uca referans" (mimari, DB, akışlar) | `../CONTEXT.md` **EMEKLİ (2026-09-29)** — yerinde yönlendirme sayfası; eski metin `archive/CONTEXT-2026-08-17.md` (tarihsel). Bugün: bu harita + `CLAUDE.md` |
| DI ve güvenlik milestone kayıtları, arayüz kontratları | `../PROJECT.md` |
| Durum ve değişiklik geçmişi | `../RECOMMENDATIONS.md` · `../CHANGELOG.md` |

## Belge türü haritası — hangi belge nerede, sahibi kim, bayatlığı neyle görünür

| Belge türü | Yeri | Sahibi | Bayatlık / doğrulama |
|---|---|---|---|
| Cetvel (kural + kapı) | `standards/*.md` | Başlıkta `Sahibi:` ya da `roller/cetvel-sahipligi.md` tablosu (rol kartlarından türetilmiş) | `belge-tazelik`: sahip eksik ve doğrulama eksik AYRI sayılır (taban yalnız küçülür) |
| Rol kartı (görev, dosya, yetki, Recep kapıları) ve rolün kural özetleri | `roller/<DEPARTMAN>.md`, `roller/<DEPARTMAN>-kurallar.md` | HARİTA üretir, OPS onaylar | Üreticiyle bire bir aynılık ve 31 kuralın sayım testi (INV-ROL-1) |
| Ölçüm / denetim kaydı | `audits/*.md` | Ölçümü yapan departman | Tarihi dosya adında; eski ölçüm yeni ölçümün yerine geçmez |
| Plan / yol haritası | `plans/*.md` | İşi yürüten departman | Karar "Kararlar" belgesinde (Linear, REC-554'e kadar), plan yalnız yöntem; bayat plan arşive |
| Çekirdek belge (CLAUDE.md, bu harita) | kök, `docs/README.md` | HARİTA (CLAUDE.md değişikliği OPS kapısı) | Her mesajdaki `BELGE` satırı; kırık yol kapısı (INV-BELGE-1) |
| Üretilmiş master | `docs/*_master.md`, `roller/cetvel-sahipligi.md` | Üretici betik | Elle düzenleme yok; üretici çıktısıyla aynılık testi |
| Arşiv (tarihsel) | `archive/**` | — | Yürürlükte DEĞİL; yönlendirme sayfası asıl belgeyi gösterir |

## Şu anki geliştirme adımı (takip)

İş durumu için tek kaynak **Kanban panoları** (karar 219; Linear 2026-10-01'den beri donuk arşiv); kim hangi dosyada çalışıyor sorusu için WrongStack claim panosu
(`node scripts/board/board.cjs who`). `DURUM-TAKIP.md` 2026-09-29'da emekli edildi (yönlendirme sayfası; eski metin
`archive/DURUM-TAKIP-2026-09-17.md`, tarihsel).

## Üretilen vs küratörlü (karıştırma)

- **Üretilen** (kök master'lar): orion pipeline yazar; elle düzenleme — bir sonraki sync ezer.
- **Küratörlü** (alt klasörler): elle yazılır; twin'e milestone'da sync edilir (bkz. `.claude/skills/notebooklm-sync`).
- Dokümantasyon, Corpus Callosum / Orion CLI ile `*.md` master dosyalarına çevrilip NotebookLM "VentHub Proje
  Hafızası" defterine (dijital ikiz) yüklenir.
- Yetenek ağaçları: `.claude/skills/` = Claude Code, `.agent/skills/` = Antigravity işçisi — **ikisi de aktif ve
  kasıtlı** (çift ağaç); işçi çekirdek kuralı `../AGENTS.md` köprüsüyle okur.
