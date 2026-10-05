# CONTEXT.md — EMEKLİ (2026-09-29)

> **Bu dosya artık kaynak değildir.** 2026-08-17'den beri güncellenmiyordu ve içindeki "Faz 2'ye hazır", "PPR",
> "29 skill", "ilk buraya bak" gibi ifadeler bugünkü durumu yansıtmıyordu. Recep/OPS hükmüyle emekli edildi
> (REC-400, H3). **Ne arıyorsan tek giriş haritası `docs/README.md`.**
>
> Dosya yerinde bırakıldı çünkü kancalar, testler ve yapılandırma dosyaları yolunu anıyor; silinirse kırılırlar.
> Eski tam metin: `docs/archive/CONTEXT-2026-08-17.md` (tarihsel — gövdesi bugünü söylemez).

| Eski bölüm | Bugün nereye bakılır |
|---|---|
| §1–3 Proje kimliği, vizyon, teknoloji | `CLAUDE.md` (Proje Özeti, Teknoloji Yığını) · SaaS yol haritası `docs/plans/venthub_saas_master_roadmap.md` (Faz 2 PARK'ta) |
| §4 Proje yapısı | `CLAUDE.md` (Dizin Yapısı) · üretilen `docs/system_tree.md` |
| §5 Veritabanı | `docs/database_schema_master.md` (otomatik üretilir) |
| §6 İş akışları (ödeme, kargo, iade, stok) | `docs/supabase_functions_master.md` (üretilir) · akış şemaları için arşiv §6 |
| §7 Roller (RBAC) | `src/lib/rbac.ts` (SSOT) |
| §8 i18n | `docs/standards/i18n-localization-standard.md` · `CLAUDE.md` Mutlak Kural 7 |
| §9 Admin paneli | `docs/standards/admin-standard.md` |
| §10 Hesaplayıcılar | `src/lib/hvacCalculations.ts` |
| §11 3D | `docs/standards/3d-webgl-standard.md` · `CLAUDE.md` Mutlak Kural 9 |
| §12 Ortam değişkenleri | `.env.example` |
| §13 Dokümantasyon altyapısı | `docs/standards/belge-yonetimi-standard.md` · `.claude/skills/notebooklm-sync` |
| §14 Geliştirme kuralları (31 madde) | `CLAUDE.md` (çekirdek 14) · tam liste `docs/standards/gelistirme-kurallari-tam-liste.md` |
| §15 Skill ekosistemi | `docs/venthub_skills_master.md` |
| §16 Antigravity oturum kısayolları | yalnız arşivde (kişisel PowerShell profili notu) |

> **Bu dosyayı yeniden yazma.** Yeni bilgi `docs/README.md` haritasındaki doğru cetvele eklenir.
