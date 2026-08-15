# docs/ — Doküman Sistemi Haritası

> "Bu iş nasıl yapılır?" dendiğinde **ön kapı**. Hangi soru → hangi dosya, ve klasör düzeni.
> Kural: her konunun **tek otoritesi** vardır; diğer dosyalar onu tekrar etmez, **referans verir**.

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
| Hangi sayfa **nasıl üretilir**, veri değişince **ne tazelenir**, fiyat **hangi yüzeyde** görünür? | `standards/rendering-cache-standard.md` |
| Birden çok Claude oturumu **nasıl çakışmadan** çalışır? | `standards/multi-session-coordination-standard.md` |
| **Niçin** / moat / vizyon? | `../VISION.md` |
| Kapsamlı uçtan uca referans | `../CONTEXT.md` (NLM üretir) |

## Şu anki geliştirme adımı (takip)

Aktif iş kolu = **Bayi (dealer) modülü** + standart harmonizasyonu. Canlı durum: **`DURUM-TAKIP.md`**.

## Üretilen vs küratörlü (karıştırma)

- **Üretilen** (kök master'lar): orion pipeline yazar; elle düzenleme — bir sonraki sync ezer.
- **Küratörlü** (alt klasörler): elle yazılır; twin'e milestone'da sync edilir (bkz. `.claude/skills/notebooklm-sync`).
