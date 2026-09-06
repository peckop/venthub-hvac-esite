# Tasarım Yetenek (Skill) Kullanım Cetveli — v0.1 (taslak)

> **Bu dosya nedir?** Hangi Claude Code / Design **yeteneğinin** (skill) VentHub işinde kalacağına,
> hangisinin yalnız **kuralı** alınıp motoruyla birlikte silineceğine, hangisinin hiç
> kullanılmayacağına karar verirken bakılan tablo. Yöntem cetveli (`execution-method-standard.md`)
> "iş hangi ARAÇLA koşar" sorusuna bakar; bu cetvel "hangi hazır YETENEK bize hizmet eder" sorusuna.
>
> **Durum:** v0.1 taslak — Recep gözden geçirince küratörlü sayılır (bu dosyanın kendisi de aynı
> üç sorudan geçmiş sayılmaz; kaynağı olan envanterin biçimlendirilmiş hâlidir).

---

## 0 · Niçin var — ölçülmüş olay

2026-09-05'te `~/.claude/skills` (kullanıcı kapsamı) ölçüldü: **31 dış yetenek dizini, 12,4 MB**
(`du -sk`). Hiçbiri VentHub için yazılmamış — üçüncü taraf paketler (sanat üretimi, marka kiti,
sunum, GSAP/Stitch reçeteleri vb.). Ölçüm sonucu (`docs/audits/skill-envanteri-2026-09-05.md`):

| Sınıf | Sayı | Not |
|---|---|---|
| **KAL** | 8 (2'si düşük öncelik) | olduğu gibi kullanılır |
| **ERİT** | 3 | yalnız kural alınır, motor atılır (üçü birden 540K) |
| **KALDIR** | 20 | ≈ 7,4 MB / 12,4 MB |

Cetvel yoktu — sınıflandırma her seferinde yeniden icat edilecekti. Bu dosya, envanterin §1 ve §4
bölümündeki ham cetvel taslağını kalıcı hâle getirir; sayılar doğrudan envanterden alınmıştır,
burada yeniden ölçülmemiştir.

---

## 1 · Üç soru ve sınıf tanımları

Bir yetenek (yeni kurulacak ya da elde var olan) sırayla üç sorudan geçer; **ilk "hayır" sınıfı
belirler**:

| # | Soru | Hayır ise |
|---|---|---|
| 1 | **VentHub yönetimine hizmet ediyor mu?** (vitrin · katalog · belge · altyapı · ölçüm) | **KALDIR** |
| 2 | **Yaptığı şey bizde zaten kural olarak var mı, ya da kararlarımızla çelişiyor mu?** (palet, yarıçap 0, gölge yok, `tokens.js` SSOT, görsel/video üretimi yok, R3F dışı 3D yok) | **KALDIR** (çelişki) ya da **ERİT** (yalnız kural alınır, motor alınmaz) |
| 3 | **Bütünüyle, olduğu gibi kullanılır mı?** (belge dönüştürücü, referans kılavuzu, test aracı) | değilse **ERİT** |

Ek kural: yeteneğin kendi "ne için değil" beyanı bizim aleyhimizeyse (örn. bir yetenek kendini
"dashboards, data tables, multi-step product UI için değil" diye tanımlıyorsa) bütün olarak
alınmaz.

**Tanımlar:**
- **KAL** — yetenek olduğu gibi, dosyasıyla kalır; ilgili şeritte kullanılabilir.
- **ERİT** — yeteneğin **kuralı** (kısıtlar, kontrol listesi, düğme/parametre seti) bir VentHub
  yeteneğine yazılır ve kaynağı satır başında anılır; **motoru/betikleri/kütüphane seçimi alınmaz**.
  Eritilen dış dosya sonra kaldırılır.
- **KALDIR** — dosya tamamen silinir; kalıcı gerekçe envanterde durur.

---

## 2 · KAL listesi (8)

| Yetenek | Ne için | Hangi şerit | Sınır |
|---|---|---|---|
| `design-dna` | referans → 3 katlı JSON (token · stil · efekt) üretimi; sözleşme v1'in şema iskeleti | URUN | Faz 1–2 (şema) ile sınırlı; **Faz 3 üretim KULLANILMAZ** (kural 8: `tokens.js` SSOT) |
| `pdf` | PDF okuma/birleştirme/metin çıkarımı | OPS (katalog ölçümü REC-146) + DESIGN-BELGE | yalnız okuma/dönüştürme; tasarım/ticari karar üretmez |
| `xlsx` | tablo dosyası okuma/yazma/formül | ALTYAPI | İngestor CSV'leri, fiyat listeleri, teklif tabloları ile sınırlı |
| `docx` | Word belgesi okuma/yazma | OPS (düşük öncelik) | yedek yol; bugün iş yok — KALDIR değil çünkü satınalma/teklif akışı ileride gerekebilir |
| `webapp-testing` | Playwright ile yerel uygulama testi, ekran görüntüsü, konsol | URUN | Hikâye sayfası 3 hâl doğrulaması (masaüstü · mobil · reduced-motion); playwright eklentisini tamamlar, yerini almaz |
| `mcp-builder` | MCP sunucusu yazım kılavuzu | OPS | Orion MCP geliştirmesiyle sınırlı (orion kapsamı = VentHub yönetimi) |
| `claude-api` | Claude API/SDK referansı (model, fiyat, araç kullanımı) | OPS | Companion taşıyıcısı Haiku (REC-67) ve API çağıran betiklerle sınırlı |
| `web-artifacts-builder` | React + Tailwind + shadcn ile çok bileşenli artifact | OPS (düşük öncelik) | yalnız OPS rapor sayfaları; **vitrin kodu için KULLANILMAZ** |

Kaynak: `docs/audits/skill-envanteri-2026-09-05.md` §2 (satırlar taşındı, yeniden ölçülmedi).
"Hangi şerit" sütunu envanterin gerekçe metninden çıkarıldı; envanterde ayrı bir sütun olarak
yoktu — belirsiz kalan hiçbir satır yok, hepsi gerekçedeki isimlerden (REC numarası, proje adı)
doğrudan okunabiliyordu.

---

## 3 · ERİT listesi (3)

| Yetenek | Hangi kural alındı | Motor niçin alınmadı |
|---|---|---|
| `scroll-craft` | Bölümlü editoryal gramer (bölüm davranış aileleri), cihaz aileleri, tek imza hareketi, 3 hâl doğrulama (masaüstü · mobil · reduced-motion) — hepsi `venthub-hikaye-sayfasi` taslağı §1/§5/§6'ya geçti | Kendi scroll motoru + kie.ai video üretimi + ffmpeg; VentHub'da video/görsel üretim yeteneği yok ve "Framer Motion + R3F yeter" kararı zaten var (bkz. `docs/plans/venthub-hikaye-sayfasi-skill-taslak-2026-09-05.md` §7 "Yapılmaz") |
| `taste-skill` | Üç düğme (VARIANCE · MOTION · DENSITY) + design read + anti-default listesi + audit-first — `venthub-hikaye-sayfasi` §2/§3'e geçti | Kendi kütüphane seçimleri (Carbon, shadcn, motion/react) ve "next/font zorunlu" gibi kararlar VentHub yığınıyla (Next.js 15.5 + Tailwind 3.4 + Framer Motion) çakışır — envanter satırı bunu açıkça alınmayan kısım olarak işaretliyor |
| `redesign-skill` | "Jenerik AI kalıbı" denetim listesi — Design gözden geçirme ölçütü olarak `venthub-hikaye-sayfasi` §3'e (anti-default) girdi | Uygulama tarafı (kendi düzeltme/otomasyon akışı) alınmadı; VentHub'da uygulama zaten DI/RSC/`tokens.js` disipliniyle kod tarafında yapılıyor |

Eritilen üç dosyanın toplamı 540K (envanter §2 sonu); kural VentHub yeteneğine geçtikten sonra
eritilen dış dosyalar kaldırılır (bkz. §5).

---

## 4 · KALDIR (20) — yalnız sayı + gerekçe sınıfları

**20 dış yetenek** §1'deki üç sorudan "hayır" alarak kaldırılır (≈ 7,4 MB / 12,4 MB). Tek tek adı
burada tekrar edilmez — otorite `docs/audits/skill-envanteri-2026-09-05.md` §2'dir; kaldırma
kararı ve tam liste orada durur. Envanterden çıkan gerekçe sınıfları (üst kategori, örnek isimlerle):

1. **Kapsam dışı — soru 1 "hayır"** (VentHub yönetimine hizmet etmiyor): sanat/görsel/video
   üretimi, sosyal medya, kurs önerisi türü genel yetenekler (örn. `canvas-design`,
   `algorithmic-art`, `slack-gif-creator`, `academy-guide`, `discernment-nudge`).
2. **Yabancı marka/format — soru 1 "hayır"**: başka bir kuruluşun kimliği ya da şirket-içi format
   (örn. `brand-guidelines`, `internal-comms`, `brandkit`).
3. **Kararımızla çelişen stil/palet/motor reçetesi — soru 2 "hayır" → çelişki**: palet/gölge/
   yarıçap kararı zaten verilmişken yeniden reçete sunan yetenekler (örn. `soft-skill`,
   `minimalist-skill`, `brutalist-skill`, `theme-factory`, `gpt-tasteskill` — GSAP yok).
4. **Kullanılmayan araç/platform**: bağlı olmadığımız bir platforma özel üretim (örn.
   `stitch-skill` — Stitch kullanılmıyor) ya da bugün iş yokken kurulu duran paket (örn. `pptx` —
   pazarlama paketi gündeme gelince yeniden kurulur).
5. **Görsel üretim yeteneği bizde yok**: `imagegen-frontend-web`, `imagegen-frontend-mobile`,
   `image-to-code-skill` — hepsi "önce görsel üret" akışına dayanıyor.
6. **Genel davranış eklentisi, disiplinimizle çakışıyor — soru 3 "hayır"**: bütünüyle
   kullanılmayan, davranışı ezen paketler (örn. `doc-coauthoring`, `output-skill`).

Tam liste + her satırın tekil gerekçesi: envanter §2. Kaldırma işlemi Recep onayı gerektirir (§5).

---

## 5 · Yeni yetenek kurma / kaldırma kuralı

1. **Kapsam:** kullanıcı kapsamı (`~/.claude/skills`) depoya girmez (repo PUBLIC, üçüncü taraf
   kod). Proje ağaçları iki tanedir (`.claude/skills` · `.agent/skills`) — kasıtlı, birleştirme
   önerilmez (CLAUDE.md doküman haritası).
2. **Ekleme:** §1'deki üç sorudan geçen yetenek eklenir. Linear kaydında **KAYNAK** (depo URL +
   commit) yazılır; ilk okuma tablosu (ne yapar · bize ne için · hangi kuralla çakışıyor) zorunlu.
3. **Çıkarma:** KALDIR kararı **Recep onayıyla** uygulanır; kaldırma komutu Recep'in terminalinde
   (`permissions.deny rm -rf` sınırı) ya da OPS'un `cmd /c rmdir` betiğiyle — önce silinecek liste,
   sonra sayım (dizin sayısı öncesi/sonrası) kanıt olarak yazılır.
4. **Eritme:** dış yeteneğin **kuralı** hedef VentHub yeteneğine yazılır, kaynağı satır başında
   anılır; **motor/betik alınmaz**. Kural taşındıktan sonra eritilen dış dosya kaldırılır (aynı
   Recep onayı gerekir — eritme de bir tür kaldırmadır).
5. **Yeniden başlatma:** yetenek değişimi yalnız **yeni oturumda** görünür (Recep 2026-09-05
   ölçtü); değişiklik günü pano notuyla duyurulur.
6. **Tazelik:** her VentHub yeteneğinin başında `kaynak_updatedAt` alanı bulunur (bağlı
   karar/sözleşme tarihi); o karar/sözleşme değişince yetenek gözden geçirilir — bayatlık
   sinyaliyle aynı mekanizma.

**KAL/KALDIR/KUR kararı için Recep onayı zorunludur** — bu üç sorudan geçmiş olmak öneriyi
oluşturur, onay ayrı adımdır (REC-147 adım 4).

---

## 6 · Design (claude.ai/design) `/` yetenekleri — proje bazlı tablo

Bu tablo Design ajanlarının (DESIGN-MENU/MARKA/BELGE/DS) kendi `/` menüsünden çağırdığı yetenekler
içindir — §1–5'teki Claude Code skill'lerinden **ayrı** bir yüzeydir. Kaynak: OPS↔Design iletişim
protokolü, "Şablon, çip ve `/` yetenekleri" bölümü (OPS hükmü, 2026-09-05). Design ajanı hangisini
çağırdığını kendi tur sonu yorumuna yazar; listede olmayan bir yeteneği kullanmadan önce yorumda
gerekçe verir.

| Proje | Çip | Şablon | Kullanılacak `/` yetenekleri | KULLANILMAZ |
|---|---|---|---|---|
| **DESIGN-MENU** (vitrin) | VentHub (DS hazır olunca) | Blank · UI mockups · Wireframe | Interactive prototype · Make tweakable · Web research · Save as standalone HTML · Handoff to Claude Code | Animated video · 3D object · Maps · Slides |
| **DESIGN-MARKA** (kimlik) | VentHub | Blank | Create design system (DS projesinde) · Handoff to Claude Code · Save as PDF · Make a deck | Color + type pairing · Frontend design |
| **VentHub Design System** | (kendisi) | — | Create design system · Make tweakable | UI kit tam ekranları |
| **DESIGN-BELGE** (basılı) | VentHub | Document · Blank | Save as PDF · Make tweakable · HTML email | Slides · Wireframe · Interactive prototype |
| **DENEY-MARKA-1/2/3** | VentHub | Blank | hiçbiri (kör deney) | tümü |

Genel: **Claude API in prototypes** şimdi hiçbir Design projesinde kullanılmaz. **Web research**
yalnız ölçüm amaçlı; bulgu "rakip böyle yapıyor" olarak yazılır, karar sayılmaz.

---

## 7 · Değişiklik kaydı

| Sürüm | Tarih | Değişiklik |
|---|---|---|
| v0.1 | 2026-09-06 | İlk taslak — `docs/audits/skill-envanteri-2026-09-05.md` + `docs/plans/venthub-hikaye-sayfasi-skill-taslak-2026-09-05.md` + OPS↔Design iletişim protokolü §Şablon/çip kaynak alınarak yazıldı. Recep gözden geçirince küratörlü sayılır. |

---

İlgili: `execution-method-standard.md` (araç seçimi) · `docs/audits/skill-envanteri-2026-09-05.md`
(kaynak envanter, tam liste + gerekçe) · `docs/plans/venthub-hikaye-sayfasi-skill-taslak-2026-09-05.md`
(ERİT'lerin taşındığı hedef yetenek) · CLAUDE.md kural 1 (No-Plan-No-Code: her plan hangi cetvelle
yönetildiğini söyler) · kural 8/9 (`tokens.js` SSOT, R3F).
