# docs/ — Tek Giriş Haritası

> "Bu iş nasıl yapılır / nereye bakılır?" dendiğinde **ön kapı**: hangi soru → hangi harita, hangi dosya.
> `CLAUDE.md` yalnız bu dosyayı gösterir; harita kopyası tutmaz (`standards/belge-yonetimi-standard.md` B2).
> Kural: her konunun **tek otoritesi** vardır; diğer dosyalar onu tekrar etmez, **referans verir**.
> Haritada olmayan belge ajan için yoktur: yeni cetvel bu dosyaya satırı eklenmeden bitmiş sayılmaz.

## Haritaların haritası — hangi soruda hangi harita

| Soru | Harita / araç | Not |
|---|---|---|
| Hangi belge, hangi kural, hangi cetvel? | **bu dosya** (aşağıdaki tablolar) | kırık yol INV-BELGE-1 ile denetlenir |
| Kod: ne çağırıyor, neyi etkiler, nerede? | **CodeGraph** (MCP `codegraph_explore`) | ~1 sn taze, birebir kaynak döndürür |
| Kod + **veritabanı** ilişkisi (tablo, FK, sembol toplulukları) | **graphify** + Supabase şema grafı (`graphify query/path/explain`) | `graphify-out/` üretilmiştir; kurulum ve kural `../CLAUDE.md` "graphify" |
| Kod içinde metin/sembol araması | **WrongStack kod dizini** (MCP `wrongstack-codebase-index`) | dizin elle tazelenir; yaşı ölçülmeden güvenme |
| Bir dosyaya dokununca geçmiş ders | **sage** (kanca dosyaya dokununca kendiliğinden getirir) | `standards/hafiza-kancalari-standard.md` §6 |
| "Konuşmuş muyduk / ne karar vermiştik / niçin" | NotebookLM takip defteri `a5f382a4-b4e7-450c-84e0-9b7c082e2502` + Linear "Kararlar" belgesi | `standards/proje-takip-defteri-standard.md` |
| Kural / niçin / mimari (kod hafızası) | NotebookLM dijital ikiz `235043eb-970f-4a52-9f39-1d02b2621e9c` | snapshot'tır; çelişirse kod kazanır |
| Bütün belgelerde tarama | NotebookLM "VentHub Belgeler" `f503a886-3e2f-4234-8455-ee57c66f9488` | tek başına güvenilmez; bulgu dosyada doğrulanır |
| İş ne durumda, kimde? | **Linear** (iş kaydının tek kaynağı) | `standards/is-kayit-duzeni-standard.md` |
| Ajanın kalıcı dersleri | hafıza dizini `MEMORY.md` (depo dışı, oturum açılışında yüklenir) | `standards/hafiza-kancalari-standard.md` |
| Belge / harita ne kadar taze? | her mesajdaki durum satırları; elle: `node scripts/belge/belge-tazelik.cjs` | `standards/belge-yonetimi-standard.md` B5 |

## Klasör düzeni

| Klasör | İçerik | Elle düzenlenir mi? |
|---|---|---|
| `docs/` (kök) | **Üretilen** master'lar (`*_master.md`, `system_tree.md`, `database_schema_master.md`, `design_system_config.md`) + `DURUM-TAKIP.md` | ❌ master'lar orion pipeline'ın çıktısı — elle yazma |
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
| Müşterinin gördüğü ürün metnine **ne girer, ne girmez** (iç editör notu, doğrulanmamış değer)? | `standards/vitrin-metni-standard.md` |
| Rehber (bilgi) yazısının **konusu nasıl seçilir, kaynağı ne, nasıl doğrulanır**, yayından sonra ne ölçülür? | `standards/rehber-yazisi-standard.md` (TASLAK, karar 62) |
| Aramada ve pazarda **nasıl göründüğümüz hangi kaynaktan ölçülür**, haftalık takip nasıl, hangi veri depoya girmez? | `standards/pazar-olcum-standard.md` (TASLAK, karar 93 → 124) |
| Bir ürün ailesine **hangi tüzük, tebliğ ya da standart** dokunuyor, ne zaman yürürlüğe giriyor, Türkiye karşılığı ne? | `mevzuat/kayit.json` (veri) + `standards/mevzuat-kaydi-standard.md` (kurallar, TASLAK) |
| Adres/şablon **yayınından önce, yayın günü ve sonra** arama görünürlüğü nasıl denetlenir (eski adres tek 308, kırık bağlantı, SEO puanı), kusur kimin? | `standards/yayin-gorunurluk-denetim-standard.md` (TASLAK, REC-300) |
| **Yapay zekâ cevaplarında** (Claude, Gemini) VentHub geçiyor mu, hangi motorla, hangi soru listesiyle, ne ölçülmez? | `standards/geo-olcum-standard.md` (TASLAK, karar 124) |
| Bir kategorinin **adı hangi kolondan** gelir (menüde, başlıkta, kırıntıda)? | `standards/kategori-adlandirma-standard.md` |
| Birden çok Claude oturumu **nasıl çakışmadan** çalışır (şerit sahipliği, worktree izolasyonu, bir-iş-bir-dal)? | `standards/collaboration-protocol.md` · ⚠`standards/multi-session-coordination-standard.md` eski modeli anlatıyor (belge taraması YÜKSEK bulgu 4; düzeltmesi REC-400 D5) |
| Bir iş **hangi yöntemle** koşar (şerit / alt ajan / Workflow / maestro / skill / elle), emirde `YÖNTEM:` satırı? | `standards/execution-method-standard.md` |
| Katalogdan ticarete hat — ürün nasıl girer, CSV, fiyat, şema, kategori? | `plans/catalog-commerce-pipeline-master-2026-06-20.md` (uçtan uca pano) + `standards/{catalog-ingestion,csv-import-export,pricing,product-schema,category-taxonomy}-standard.md`; veri deposu kardeş depo `venthub-pdf-ingestor` |
| `CLAUDE.md`'deki bir kural **niçin** var? | `standards/claude-md-gerekceler.md` |
| Bir işi **alt-ajana** ne zaman devrederim, neyi yasaklarım, sonucu neye göre kabul ederim? | `standards/subagent-delegation-standard.md` |
| Hangi tasarım **yeteneği (skill)** kalır/erir/kaldırılır, yenisi nasıl kurulur? | `standards/tasarim-yetenek-standard.md` |
| Depoda **hangi araçlar var** (kanca, betik, skill, CI, cetvel), kimin, canlı mı, ölü aday nasıl sayılır? | `standards/arac-envanteri-standard.md` → envanter `audits/arac-envanteri-<tarih>.md` (betik üretir) |
| Site, veritabanı, DNS, e-posta **nerede barınır**, sağlayıcı değişirse **ne sökülür**? | `standards/barindirma-standard.md` (TASLAK, karar 59) |
| Belgeler **nasıl yazılır** (gövde/tarihçe, sahip), hangi bilgi **hangi katmanda** durur, belge bayatlığı **nasıl görünür**, doğru belge **ne zaman kendiliğinden gelir**? | `standards/belge-yonetimi-standard.md` (TASLAK, REC-400) |
| **Niçin** / moat / vizyon? | `../VISION.md` |
| Kapsamlı uçtan uca referans (mimari, DB, akışlar; kuralların 31 maddelik gerekçeli listesi §14) | `../CONTEXT.md` (NLM üretir, elle yeniden yazılmaz) · ⚠2026-08-17'den beri güncellenmedi — tazeliği durum satırında; rolü REC-400 D5'te Recep kararı |
| DI ve güvenlik milestone kayıtları, arayüz kontratları | `../PROJECT.md` |
| Durum ve değişiklik geçmişi | `../RECOMMENDATIONS.md` · `../CHANGELOG.md` |

## Şu anki geliştirme adımı (takip)

İş durumu için tek kaynak **Linear**. `DURUM-TAKIP.md` ("neredeyiz" + şerit panosu) ⚠2026-09-17'den beri
güncellenmedi; bu bölümdeki eski "aktif iş kolu = bayi modülü" bilgisi de bayat (düzeltmesi REC-400 D5).

## Üretilen vs küratörlü (karıştırma)

- **Üretilen** (kök master'lar): orion pipeline yazar; elle düzenleme — bir sonraki sync ezer.
- **Küratörlü** (alt klasörler): elle yazılır; twin'e milestone'da sync edilir (bkz. `.claude/skills/notebooklm-sync`).
- Dokümantasyon, Corpus Callosum / Orion CLI ile `*.md` master dosyalarına çevrilip NotebookLM "VentHub Proje
  Hafızası" defterine (dijital ikiz) yüklenir.
- Yetenek ağaçları: `.claude/skills/` = Claude Code, `.agent/skills/` = Antigravity işçisi — **ikisi de aktif ve
  kasıtlı** (çift ağaç); işçi çekirdek kuralı `../AGENTS.md` köprüsüyle okur.
