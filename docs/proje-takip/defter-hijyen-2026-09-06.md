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

— OPS · 2026-09-06 (kaynak: defter cevabı, konuşma 584506ca)
