# Defter hijyeni — 2026-09-06 (defterin KENDİ denetimi; Recep: "defteri temiz tut, bayatlığını deftere ölçtür")

**Yöntem:** `notebooklm ask --notebook a5f382a4-b4e7-450c-84e0-9b7c082e2502` ile deftere kendi kaynaklarını değerlendirmesi soruldu (danışman kullanımı). Kaynak listesi `notebooklm source list` ile ölçüldü: **20 kaynak**, 17'si 2026-09-06 10:50–10:52 damgalı (bu akşamki `esitle`), 3'ü 09-04/09-05 (değişmeyen demetler: 05-arsiv · 09-linear-anahtar · 10-design-15a; 12-konusma-gunlugu-1..6 09-05). Cevap kaynak numaralı geldi; aşağısı OPS'un süzgecinden geçmiş hâli, her madde bir işe bağlı.

## 1 · Çelişen / bayat kaynaklar (defter buldu, OPS doğruladı-doğrulayacak)

| # | Kaynak | Çelişki | İş |
|---|---|---|---|
| 1 | `docs/standards/work-tracking-ssot-standard.md` | SSOT=Registry (Model A) hükümleri hâlâ gövdede; 08-26'dan beri SSOT=Linear | Cetvel gövdesi temizlenir, yalnız "yürürlük notu" kalır (OPS, belge-only) |
| 2 | `docs/standards/quote-standard.md` Q4 | "teklif login'li" ↔ REC-117 misafir teklif (anon INSERT, sunucu uç) | Q4'e "REC-117 ile değişir, migration Recep kapısı" satırı (Teklif Akışı şeridi) |
| 3 | `docs/standards/companion-doc-standard.md` C5/C6 | Bloklayan C5 ve C6 v1 tarihçe olarak duruyor; yürürlük §C9 uyku kipi + C6.1 | Tarihçe bölümü "ESKİ" başlığı altına, yürürlük başa (ALTYAPI, #1050 sınıfı) |
| 4 | `.claude/skills/venthub-architecture/` | PPR kurulumu öğretiyor; PPR hiç açılmadı (CLAUDE.md ölçümü 08-15) | Skill metni düzeltilir (OPS; skill envanteri REC-147 kapsamı) |
| 5 | `docs/standards/checkout-payment-standard.md` | Başlıkta "A/B kararı beklemede", gövdede 08-18 karar (gömülü form) | Başlık satırı düzeltilir (ALTYAPI claim'i) |
| 6 | `05-arsiv` demeti | Eski planlar (014-kategori-ssr-plan, legacy_homepage_enhancements_2025) güncel ölçümlerle çelişiyor | Arşiv demeti defterden ÇIKAR ya da her dosyanın başına "ARŞİV — karar değildir" damgası (OPS; manifest) |

**Aynı gece kapananlar (alt ajan, `git diff --stat` ile ölçüldü):** #1 YAPILDI — yürürlük bloğu dosyanın başına, §2–§7 başlıklarına `[ESKİ — tarihçe]` (25 satır) · #2 NOT EKLENDİ — quote-standard satır 478'in altına REC-117 notu (aynı login şartı 611 ve 634'te de var, migration inince üçü birlikte güncellenir) · #4 ÇÜRÜDÜ — `venthub-architecture` SKILL.md zaten "PPR KULLANILMIYOR" diyor (grep 4/4, kurulum adımı yok): defter BAYAT kopyayı görmüştü; bu, eşitlemenin niçin günlük olması gerektiğinin kanıtı · #3 ve #5 ALTYAPI claim'i (yarın) · #6 05-arşiv demeti manifestten düşürüldü (aşağıda §5).

## 2 · Gürültü

- **Konuşma günlükleri (12-konusma-gunlugu-1..6, ~4,2 MB):** "Recep ne demişti" için kıymetli, ama RAG'de gürültü. Karar: **kalır**, ancak yalnız son 14 gün; eskisi ayrı "arşiv defteri"ne (OPS, `konusma_gunlugu.py` pencere parametresi).
- **Arşiv demeti:** yukarıda #6.
- **Koddan üretilen master dosyalar:** defter "gürültü" dedi; manifest ölçümü bu dosyada §4'te. Kural zaten var: üretilmiş `.md` bu deftere yüklenmez (Recep 09-04); ihlal varsa manifestten düşer.

## 3 · Temizlik kuralı (defterin önerisi, OPS kabul; cetvel `proje-takip-defteri-standard.md` §8 olarak girer)

1. Yalnız `docs/proje-takip/manifest.json`'daki demetler yüklenir; üretilmiş `.md` (`*_master.md`, `system_tree.md`, `design_system_config.md`, `*.config.md`, `artefakt_manifest.json`) asla.
2. Eşitleme betikle (`proje_takip_sync.py esitle`), **her gün kapanışta** (YH-47); kapsamdaki dosya master'a inince ya da Kararlar değişince aynı gün.
3. Haftada bir bu denetim tekrarlanır (aynı soru, aynı defter); çelişki listesi bu dosyaya tarihli bölüm olarak eklenir; kapanan satır silinmez, "KAPANDI + PR" yazılır.
4. Her kaynağın başında kaynak damgası (`kaynak_updatedAt`, `kopya`) bulunur; deftere "hangi kaynağın damgası en eski" sorusu bayatlık ölçümüdür.

## 4 · Eksik kaynak türleri (defter söyledi, OPS'un yarınki üç demeti)

- **Pano notları** (`C:/tmp/venthub-board` olay dosyaları) → `13-pano-olaylari` (son 7 gün, TTL'li notlar ayıklanmış).
- **Tasarım proje notları** (DESIGN-MENU/MARKA/BELGE/DS `*.md`, `design_dl.py` ile indirilir) → `14-design-notlari`.
- **Linear proje yorumları** (şerit tur sonu yorumları; Kararlar zaten var) → `15-linear-yorumlari` (dışa aktarım OPS).
- `docs/DURUM-TAKIP.md` (şerit panosu) → 01-çekirdek demetine (manifest ölçümüyle: içeride mi).

## 5 · Manifest ölçümü (üretilmiş dosya sızmış mı)

Ölçüm komutu: manifest demetlerinde `_master|system_tree|CONTEXT|design_system_config|\.config\.md` deseni. **Ölçüm (2026-09-06):** 12 demette tek isabet: `01-cekirdek-ve-durum` → `CONTEXT.md`. CONTEXT.md NotebookLM'in koddan ürettiği belgedir (CLAUDE.md: "elle yeniden yazma"); Recep kuralı (09-04) gereği bu deftere girmez, kod hafızası defterinde (235043eb) zaten vardır. **Karar: manifestten düşürüldü**, bir sonraki `esitle` ile defterden çıkar. `*_master.md` / `system_tree.md` isabeti 0.

## 6 · Kapsam denetimi (alt ajan, HEAD a209183f; komutları ajan raporunda, özet burada)

Depoda 2045 `.md`: **427 kapsanan / 1618 kapsanmayan**. Kapsanmayanın sınıfı: üretilmiş sidecar 871 · üretilmiş master/registry briefing/audit motoru 26 · araç yapılandırması (skill/hook/agent/workflow) 285 · donmuş arşiv (`registry/` 331 · `.archive/` 51 · `docs/archive/` 15 · `artifacts/` 5) 399 · üçüncü taraf 4 · kasıtlı hariç 19 · **elle yazılmış aday 4** (+7 kararsız). Ölçüm semantiği: eşitleyici `glob.glob` kullanır, `*` `/` geçmez; `fnmatch` ile ölçüm yanlış "kapsandı" verir.

**Sızma:** sıkı damgayla 0; ama **demet 10 (`design-15a/`, 09-04 donmuş fotoğraf) 15 dosyanın 15'i demet 14'teki canlı sürümle aynı adda farklı içerikti** → iki sürüm, çelişki üretir → **demet 10 KALDIRILDI**, `design-15a/*.md` `asla_dahil_etme`'ye girdi (repoda tarihçe olarak kalır).

**README kararı (16 dosya):** GİRER 5 (kök README, docs/README, docs/plans/README, iki logo şartnamesi) · **GİRMELİ 3 → demet 16** (`.githooks/README.md` kanca politikası + ölçülmüş olay · `supabase/baselines/README.md` baseline/drift karar kaydı · `public/decoders/README.md` yerel wasm kararı) + `kapanmis-bulgular.md` (kapanmış bulgu cetveli) · GİRMEZ 8 (screenshots kullanım notu, memory-engine başka proje, src modül README kural yasağı, registry kartı arşiv, 4 dış kaynak skill README). `supabase/**` yasağı `functions/` + `migrations/`'a daraltıldı (baselines README girsin diye); `registry/ .archive/ docs/archive/ artifacts/ docs/reference/supabase/` yasağa **yazılı** olarak eklendi (davranış değişmez, niyet yazılı).

**Çelişki bulundu ve düzeltildi:** `docs/plans/README.md` "NLM ikizine yalnız CANLI/REFERANS gider" derken manifest demet 03 klasörün tamamını yüklüyordu → iki defter iki kapsam olarak netleştirildi (kod hafızası ikizi vs. takip defteri). Cetvel §10 (temizlik kuralı) yazıldı.

— OPS · 2026-09-06 (kaynak: defter cevabı, konuşma 584506ca; kapsam denetimi alt ajan raporu)

## 7 · İkinci tarama (2026-09-06 13:05Z, Recep: "mükerrerlik/çelişki/tutarsızlık, dosyaları güncelle") — 4 soru, 32 madde; OPS her maddeyi kodda/dosyada ÖLÇTÜ

Sorgu betiği `scratchpad/defter_celiski_sorgu.py` (4 soru: günün özeti · çelişki · mükerrer · tutarsızlık). Sınıflandırma:

| Sınıf | Adet | Ne | Eylem |
|---|---:|---|---|
| **Gerçek, düzeltildi (bu PR)** | 2 | `linear/kararlar-vitrin-15a-2026-09-04.md` ikinci kopya (kaynak_updatedAt 09-05, 28 başlık; 09-06 kopyası 52 başlık) — §10.2 tek kopya ihlali · defter kopyaları bayat (work-tracking [ESKİ] başlıkları, quote-standard REC-117 notu, K37-c/K38 — hepsi #1059'la master'da, defter esitle koşmamıştı) | dosya SİLİNDİ · `esitle` koştu |
| **Gerçek, sahibine** | 2 | REC-52 whsec rotasyonu: registry arşivi `kayitlar_master` "YAPILMIŞ" der, Linear **In Progress** (kanonik Linear; registry donmuş — kural var, eylem yok) · Katalog ölçüm belgelerinde varsayım→ölçüm çiftleri etiketsiz (AD 2000 debi 2.700/3.600 · CA hız kademesi · HF/FW tahrik · V0 gövde) | Katalog: §10.9(a) [ÇÜRÜDÜ] etiketi, kendi PR'ında |
| **Belge içi tarihçe (çelişki değil)** | 9 | checkout başlık bloğu "beklemede" (satır 174 zaten düzeltmeyi anlatıyor) · quote Ç10/Ç11 (belgenin kendi çelişki tablosu, v2'de çözülmüş) · DURUM-TAKIP 06-19 moderator satırları · vortice MEV PDF · FC-51/FC-101 · Danfoss · çağrı sayısı 7/3/5→1 · pano kimlik doğrulama (08-24 test) | §10.9 kuralı yazıldı; belgelere dokunulmadı |
| **ÇÜRÜDÜ (defter yanıldı)** | 2 | "CategoryShowcase ölü kod" — `CategoryShowcaseView.tsx` ve `CategoryMasterView.tsx` import ediyor (grep 7 dosya) · "design/menu/kararlar-*.md kopyaları" — dosya sisteminde YOK (find: yalnız linear/ altında 4), defter hijyen raporundaki anmayı kaynak sandı (§10.9(c)) | yok |
| **Kanonik açıklaması (sorun değil)** | 8 | Linear canlı belge > repo aynası · CLAUDE.md > CONTEXT.md · tokens.js/index.css SSOT · pano anlık / Linear kalıcı · csv-standard ana depo · SaaS planları git | yok |
| **Günün özeti** | — | K7.10 · K17/K17-a/K17-b · K18/K37 · K24 · K25/K25-b · K28 · K30 · K35 eki doğru; **K37-b/K37-c/K38 YOK** (esitle öncesi bayatlık, beklenen) | esitle sonrası yeniden sorulur |

**Ders:** "çelişki" sorusu belge tarihçesini yakalıyor; kaynak ayrımı sorguya yazılmalı (§10.9(b)). Defterin 32 maddesinden **4'ü** iş doğurdu; ölçülmeden hiçbiri işe dönüşmedi.
