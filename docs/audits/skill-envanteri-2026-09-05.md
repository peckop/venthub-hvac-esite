# Yetenek (skill) envanteri — KAL / KALDIR / ERİT — 2026-09-05

**Kayıt:** REC-147 · **Şerit:** OPS · **Ölçüm:** `~/.claude/skills` (kullanıcı kapsamı, 31 dizin, 12,4 MB `du -sk`) + proje
ağaçları `.claude/skills` (30) ve `.agent/skills` (34). Açıklamalar her yeteneğin kendi `SKILL.md` ön-bloğundan okundu;
boyutlar `du -sk`. **Bu belge öneri listesidir; kaldırma Recep onayıyla uygulanır** (REC-147 adım 4).

## 1 · Sınıflandırma ölçütü (cetvel yoktu — bu bölüm cetvelin ham maddesi)

Bir yetenek üç sorudan geçer, sırayla; ilk "hayır" sınıfı belirler:

| # | Soru | Hayır ise |
|---|---|---|
| 1 | **VentHub yönetimine hizmet ediyor mu?** (vitrin · katalog · belge · altyapı · ölçüm). Başka markanın kimliği, sosyal medya GIF'i, sanat üretimi → hayır. | **KALDIR** |
| 2 | **Yaptığı şey bizde zaten kural olarak var mı, ya da bizim kararlarımızla çelişiyor mu?** (palet, yarıçap 0, gölge yok, `tokens.js` SSOT, görsel üretimi yok, R3F dışı 3D yok) | **KALDIR** (çelişki) ya da **ERİT** (yalnız kuralı alınır, motor alınmaz) |
| 3 | **Bütünüyle, olduğu gibi kullanılır mı?** (belge dönüştürücü, referans kılavuzu, test aracı) | değilse **ERİT** |

Ek kural: yeteneğin kendi "ne için değil" beyanı bizim aleyhimizeyse (taste-skill: "dashboards, data tables, multi-step
product UI için değil") bütün olarak alınmaz.

## 2 · 31 dış yetenek

| Yetenek | Boyut | Ne yapar (kendi beyanı, kısaltılmış) | Sınıf | Gerekçe |
|---|---|---|---|---|
| design-dna | 89K | referans → 3 katlı JSON (token · stil · efekt), sonra üretim | **KAL (kısıtlı: Faz 1–2)** | Şema bugün sözleşme v1'in iskeleti oldu; Faz 3 üretim kullanılmaz (kural 8: tokens.js SSOT) |
| pdf | 85K | PDF okuma/birleştirme/metin çıkarımı | **KAL** | Katalog PDF ölçümü (REC-146) + Kurumsal Belgeler provası |
| xlsx | 1226K | tablo dosyası okuma/yazma/formül | **KAL** | İngestor CSV'leri, fiyat listeleri, teklif tabloları |
| docx | 1272K | Word belgesi okuma/yazma | **KAL (düşük)** | Satınalma/teklif belgeleri için yedek yol; bugün iş yok |
| webapp-testing | 36K | Playwright ile yerel uygulama testi, ekran görüntüsü, konsol | **KAL** | Hikâye sayfası doğrulaması 3 hâl (masaüstü · mobil · reduced-motion); playwright eklentisini tamamlar |
| mcp-builder | 153K | MCP sunucusu yazım kılavuzu | **KAL** | Orion MCP geliştirmesi (orion kapsamı = VentHub yönetimi) |
| claude-api | 1340K | Claude API/SDK referansı (model, fiyat, araç kullanımı) | **KAL** | Companion taşıyıcısı Haiku (REC-67), API çağıran betikler |
| web-artifacts-builder | 56K | React+Tailwind+shadcn ile çok bileşenli artifact | **KAL (düşük)** | OPS rapor sayfaları; vitrin kodu için DEĞİL |
| scroll-craft | 436K | kaydırma güdümlü sayfa: 8 gramer, imza hareketi, ≥4 cihaz ailesi, reduced-motion, 3 hâl doğrulama; kendi motoru + kie.ai video + ffmpeg | **ERİT** | Kurallar `venthub-hikaye-sayfasi`'na (§3); motor, video üretimi, "Nate'in hero tercihi" alınmaz |
| taste-skill | 88K | üç düğme (VARIANCE · MOTION · DENSITY) + design read + anti-default listesi + audit-first | **ERİT** | Düğmeler (4 · 3 · 7) ve anti-default listesi alınır; kendi kütüphane seçimleri (Carbon, shadcn, motion/react) ve "next/font zorunlu" gibi kararlar bizim yığınla çakışır, alınmaz |
| redesign-skill | 16K | mevcut siteyi denetler, "jenerik AI kalıbı" bulur, bozmadan yükseltir | **ERİT** | Denetim listesi Design gözden geçirme ölçütü olur; uygulama tarafı alınmaz |
| soft-skill | 12K | "pahalı görünen" font/gölge/kart reçetesi | KALDIR | Gölge ve kart reçetesi sözleşmeyle (gölge yok, yarıçap 0) çelişir |
| minimalist-skill | 8K | sıcak monokrom, pastel, bento | KALDIR | Palet kararı verildi (K2); yeniden seçilmez |
| brutalist-skill | 12K | İsviçre tipografi + terminal estetiği | KALDIR | Tasarım dili kararı verildi; stil reçetesi |
| stitch-skill | 24K | Google Stitch için DESIGN.md üretir | KALDIR | Stitch kullanılmıyor |
| gpt-tasteskill | 8K | GSAP ScrollTrigger + Python rastgelelik + AIDA | KALDIR | GSAP yok (Framer Motion), rastgelelik vaat/ölçüm kültürüyle çelişir |
| theme-factory | 154K | 10 hazır tema (Broadsheet vb.) | KALDIR | Kendi Design System'imiz yayında; hazır tema Broadsheet'i elle ezme dönemi bitti |
| brand-guidelines | 16K | **Anthropic** marka renk/tipografisi | KALDIR | Yabancı marka; VentHub kimliği Marka Kılavuzu'nda |
| brandkit | 20K | marka kiti **görsel üretimi** (board, logo sistemi) | KALDIR | Görsel üretim yeteneği yok (memory); logo seti Marka'da 28 SVG |
| imagegen-frontend-web | 40K | bölüm başına görsel referans üretimi | KALDIR | Görsel üretim yok; referans Claude Design'da |
| imagegen-frontend-mobile | 44K | mobil ekran görsel üretimi | KALDIR | aynı |
| image-to-code-skill | 40K | önce görsel üret, sonra koda çevir (Codex) | KALDIR | Görsel üretim yok; koda çevirme Handoff ile |
| canvas-design | 5692K | poster/sanat .png/.pdf | KALDIR | Sanat üretimi; en büyük dizin (5,7 MB) |
| algorithmic-art | 64K | p5.js üretken sanat | KALDIR | Kapsam dışı |
| slack-gif-creator | 57K | Slack GIF | KALDIR | Kapsam dışı |
| pptx | 1270K | sunum dosyaları | KALDIR (şimdilik) | Pazarlama paketi (LinkedIn) gündeme gelince yeniden kurulur; bugün iş yok |
| internal-comms | 36K | şirket-içi iletişim formatları (Anthropic'in) | KALDIR | Yabancı format |
| doc-coauthoring | 16K | belge birlikte yazma akışı | KALDIR | Belge disiplinimiz cetvellerde; ek akış çakışır |
| discernment-nudge | 24K | her cevaptan sonra "emin misin" dürtüsü | KALDIR | Ölçüm disiplini zaten kuralda; genel davranış eklentisi gürültü |
| academy-guide | 20K | Claude Academy kurs önerisi | KALDIR | Kapsam dışı |
| output-skill | 4K | kırpmayı yasaklar, tam çıktı zorlar | KALDIR | Genel davranış ezmesi; uzun çıktıyı dosyaya yazma kuralımız var |

**Sayım:** KAL 8 (2 düşük) · ERİT 3 · KALDIR 20. KALDIR toplamı ≈ 7,4 MB / 12,4 MB. ERİT'lerin dosyası, kural
`venthub-hikaye-sayfasi`'na geçince kaldırılır (üçü birden 540K).

## 3 · Bizde kurulu olanlar (proje ağaçları) — yalnız ölçüm

- Tasarımla ilgili 6 (`ui-ux-pro-max` 310 satır · `typography` 177 · `web-design-guidelines` 62 · `threejs-webgl-performance`
  330 · `vercel-composition-patterns` 100 · `venthub-architecture` 78): **KAL**, VentHub'a bağlı. `ui-ux-pro-max`'in
  palet/HSL bölümü sözleşme v1 ile **karşılaştırılmalı** (bayat değer riski) — bu, REC-147 fark belgesinin (URUN) yan çıktısı.
- **Boşluk doğrulandı:** hareket · sayfa grameri · imza hareketi · brief düğmeleri · 3 hâl doğrulama hiçbirinde yok →
  `venthub-hikaye-sayfasi` bu boşluğu doldurur (taslak: `docs/plans/venthub-hikaye-sayfasi-skill-taslak-2026-09-05.md`).
- **Mükerrer adayı (ölçüm, karar değil):** `skills-creator` (iki ağaçta) ↔ `skill-creator` eklentisi. İki ağaç kasıtlı (CLAUDE.md),
  silme önerilmez; içerik farkı ölçülmedi.
- İki ağaç farkı 12 (REC-147 açıklamasında listeli) bu değerlendirmenin kapsamı dışı.

## 4 · Cetvel taslağı — "Yetenek ekleme/çıkarma" (docs/standards adayı, Recep gözden geçirince taşınır)

1. **Kapsam:** kullanıcı kapsamı (`~/.claude/skills`) depoya girmez (repo PUBLIC, üçüncü taraf kod). Proje ağaçları iki
   (`.claude` · `.agent`), kasıtlı.
2. **Ekleme:** §1 üç sorudan geçen yetenek eklenir; Linear kaydında KAYNAK (depo URL + commit) yazılır; ilk okuma
   tablosu (ne yapar · bize · çakışma) zorunlu.
3. **Çıkarma:** KALDIR listesi Recep onayıyla; kaldırma komutu Recep'in terminalinde (permissions.deny `rm -rf`) ya da
   OPS `cmd /c rmdir` betiğiyle, önce liste, sonra sayım (dizin sayısı öncesi/sonrası).
4. **Eritme:** dış yeteneğin **kuralı** VentHub yeteneğine yazılır, kaynağı satır başında anılır; **motoru/betikleri**
   alınmaz. Eritilen dosya kaldırılır.
5. **Yeniden başlatma:** yetenek değişimi yeni oturumda görünür (Recep 09-05 ölçtü); değişiklik günü pano notuyla duyurulur.
6. **Tazelik:** her VentHub yeteneği başında `kaynak_updatedAt` (bağlı karar/sözleşme tarihi); sözleşme değişince
   yetenek gözden geçirilir (bayatlık sinyaliyle aynı mantık).

— OPS · 2026-09-05
