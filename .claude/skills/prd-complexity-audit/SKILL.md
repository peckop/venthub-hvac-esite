---
name: prd-complexity-audit
description: Kod tabanını kendi vizyon/PRD'sine karşı denetleyip "neyi silebiliriz/sadeleştirebiliriz,
  vizyona ne kadar sadık" sorusuna KANITA DAYALI, önceliklendirilmiş bir rapor üreten çok-ajanlı
  workflow. Tetikle "prd denetimi", "karmaşıklık azalt", "vizyona sadakat", "neyi silebiliriz/kesebiliriz",
  "scaffold mu vizyon mu". SADECE OKUMA + RAPOR (kod silmez). Birim test, git branch, db reset için KULLANMA.
category: intelligence
metadata:
  triggers:
  - prd denetimi
  - karmaşıklık azalt
  - vizyona sadakat denetimi
  - neyi silebiliriz
  - scaffold mu vizyon mu
  inputs:
  - VISION.md
  - docs/standards/*.md
  - docs/audits/*.md
  outputs:
  - docs/reviews/<TARIH>-prd-complexity-review.md
  reusable: true
---

# PRD Sadakat & Karmaşıklık Azaltma Denetimi

Kod tabanını **kendi vizyon/PRD belgesine** karşı denetler; "premium yüzey / fazlalık (scaffold) nerede,
ne kesilir/birleştirilir, ne tutulur" sorusuna **PRD satırına bağlı kanıtla** cevap verir.
**Çok-ajanlı bir Workflow** olarak koşar (Workflow aracı). **SALT-OKUMA:** kod silmez, bir rapor üretir;
kullanıcı raporu okuyup neyi uygulayacağına karar verir.

> Motor zaten mevcut (Workflow/ultracode). Bu skill = o motoru bu denetime yönlendiren kayıtlı reçete.
> Doğrulama/sentez adımlarını **en güçlü modele** yönlendir (Opus 4.8 / seçiliyse Fable 5); mekanik
> fan-out daha hafif modelde olabilir.

## ⚠️ Ön-koşul: keskin non-goal'lar (en değerli girdi)
Denetimin gücü, **açık non-goal listesine** (kasıtlı YAPILMAYACAKLAR) bağlıdır. VentHub'da tıkız bir PRD
yok; sözleşmeyi şunlardan **damıt** (Faz 1):
- `VISION.md` (vizyon/ticari niyet + §6 verdict + "var/yok" tablosu),
- `docs/standards/*` (admin/bayi standartları, blueprint = MVP kapsamı),
- memory: `commerce-first-thesis`, `avensair-dealer-focus`, `venthub-vision`, `hold-full-scope`.
**Kritik:** Sözleşme **HEDEF-DURUMU** kodlamalı — bayi modülü/SaaS-iskelesi "çöp" değil, **tamamlanacak
çekirdek**. Yoksa audit, bitireceğimiz şeyleri "sil" diye işaretler. Bilinen non-goal sinyalleri:
CFD analizi (kapsam tuzağı), ESP/DW172 seçim motoru (sonraki dalga, Avensair DoD'si için şart değil),
tam multi-tenant'ı BUGÜN kurmak (R4'e kadar stub), jenerik mağaza özellikleri.

## VentHub Yapılandırması (doldurulmuş — başka repoda bu bölümü değiştir)

| Alan | Değer |
|---|---|
| PRD / vizyon | `VISION.md` + `docs/standards/*` (+ yukarıdaki memory'ler) |
| Geçmiş incelemeler | `docs/audits/dealer-data-ground-truth-2026-06-11.md`, `docs/audits/admin-panel-audit-2026-06-11.md` |
| Rapor çıktısı | `docs/reviews/<TARIH>-prd-complexity-review.md` |
| Kanıt katmanı | NotebookLM twin (`235043eb-970f-4a52-9f39-1d02b2621e9c`) + CodeGraph ("load-bearing mı") |

### Faz 3 alanları (VentHub)
- `app/` + `views/` — rotalar / sayfa görünümleri
- `components/` (özellikle `products/3d/` — 3D modeller, çok dosya)
- `lib/services/` — DI'lı servis katmanı
- `supabase/functions/` — Edge Functions (~30)
- `supabase/migrations/` + `supabase/baselines/`
- Hesaplayıcılar (`hvacCalculations.ts` — 4 hesaplayıcı, TESTSİZ)
- **Bayi/B2B katmanı** (yarı-kurulu — "çöp mü, tamamlanacak çekirdek mi" PRD'ye göre puanla)
- `admin/` paneli
- `docs/` (PRD'nin listelediğinden fazla/eski/çakışan var mı? — *artık harmonize, tekrar puanla*)
- Süreç/dogfooding artifact'ları (`.agents/` kalıntıları, checked-in test çıktıları repoya ait mi?)

## Workflow (çalıştırma planı)

**Faz 1 — PRD sözleşmesi (1 ajan):** Yukarıdaki PRD kaynaklarını oku → "sadakat sözleşmesi" çıkar:
çekirdek tez, MVP kapsamı, **açık non-goal'lar**, olması-gereken dosya/klasör listesi. Bunu sonraki
ajanların puanlayacağı **KONTROL LİSTESİ** olarak yaz.

**Faz 2 — Geçmiş çalışma tabanı (1 ajan, Faz 1 ile paralel):** `docs/audits/*` oku → daha önce ne
bulunmuş, ne "düzeltildi"/ertelendi çıkar (aynı bulguyu tekrar keşfetme).

**Faz 3 — Alan denetimi (alan başına 1 ajan):** Her alanı PRD'ye karşı puanla. Her denetçi:
*Bu öğe asıl iş akışına hizmet ediyor mu? Vizyon mu fazlalık (scaffold) mı? MVP hikâyesinden kayıp
olmadan silinebilir/birleştirilebilir mi?* Her bulguyu **çakıştığı PRD satırıyla** gerekçelendir.

**Faz 4 — Karşıt doğrulama (her bulgu için 1 doğrulayıcı, GÜÇLÜ modele yönlendir):** Önerilen her azaltma
için bağımsız bir ajan **"TUT" tezini** savunsun: dosyaları + PRD'yi yeniden oku, **git geçmişine bak**
(neden eklenmiş?), alpha/MVP için **load-bearing** mı yoksa Faz 2'de "düzeltildi" denen bir şey mi.
Testi geçemeyen bulguyu ele veya önceliğini düşür. (CodeGraph `impact` ile "neyi kırar" doğrula.)

**Faz 5 — Sentez (1 ajan, GÜÇLÜ modele yönlendir):** Hayatta kalan bulguları
(**sadakate etki × kaldırma kolaylığı**) ile sırala. Her madde: gözlemlenen karmaşıklık, PRD kanıtı,
önerilen sadeleştirme, tahmini diff boyutu, risk. Sırayla: **SİL listesi** (doğrudan silinebilir),
**BİRLEŞTİR**, **YENİDEN-YAZ**. Repo yerine **PRD'nin kendisinin** değişmesi gereken yerleri AYRI bölümde
belirt. Raporu `docs/reviews/<TARIH>-prd-complexity-review.md`'e yaz, özet döndür.

## Kurallar
- **Salt-okuma:** Bu skill kod silmez/değiştirmez — rapor üretir. Uygulama, kullanıcının ayrı kararı +
  No-Plan-No-Code (önce dallanmış branch).
- **Kanıt zorunlu:** Her bulgu bir PRD satırına + (mümkünse) git geçmişine/CodeGraph'a bağlı.
- **Twin-önce:** "niçin/tasarım/load-bearing mı" sorularında önce twin'e sor (auth düşükse headless-refresh).
- **Küçük repo / hızlı tur:** Faz 1+3+5 tek başına yeter; Faz 4 (karşıt doğrulama) orta/büyük repolarda değer katar.
