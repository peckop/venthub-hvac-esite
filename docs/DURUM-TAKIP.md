# DURUM TAKİP — Canlı Çalışma Panosu

> Tek "neredeyiz?" kaynağı. Daldan dala geçince buraya bak. Her önemli adımda güncellenir.
> Son güncelleme: 2026-06-12 — **doküman sistemi temizlendi:** docs/ reorganize (plans/audits/reference + README haritası), standartlar harmonize (mükerrerlik/çelişki giderildi: capabilities→pointer, fiyat=ORG-TIER etiketi, sıra=blueprint'e tabi), CONTEXT twin-denetimli sadeleştirildi (bayat sayı/rol/sync-modeli düzeltildi).

## Büyük Resim (zincir)

```
1. STANDART (cetvel) → 2. ANALİZ (cetvelle ölç) → 3. PLAN (ne onarılır/kurulur)
   → 4. DOSYA YAZ (uygulamadan) → 5. UYGULA (yalnız kullanıcı komutuyla)
```

**Production'a bu güne kadar HİÇBİR ŞEY uygulanmadı.** Tüm migration'lar yalnız git'te dosya + ispat.

---

## Üç İş Kolu (thread)

### A) Standartlar (cetvel) — ✅ büyük ölçüde bitti
- `docs/standards/admin-standard.md` (admin NASIL), `admin-capabilities.md` (NE)
- `docs/standards/dealer-network-standard.md` (B2B domain), `dealer-module-blueprint.md` (R0→B2)

### B) ANALİZ (cetvelle mevcut uygulamayı ölç) — ⚠️ YARIM (asıl eksik)
- ✅ Bayi veri katmanı: `docs/audits/dealer-data-ground-truth-2026-06-11.md` (B2B = "premium yüzey/bozuk")
- ✅ Admin panel ön-denetim: `docs/audits/admin-panel-audit-2026-06-11.md`
- ❌ **Tüm uygulamanın standartlara göre değer/kalite ölçümü — YAPILMADI** (kullanıcının "sıfırdan mı, ekleye ekleye mi" sorusunun kanıtlı cevabı buradan çıkacak)

### C) Bayi Modülü İmplementasyonu (R0→B2) — sırada, B'den sonra netleşecek
| Faz | İş | Durum |
|---|---|---|
| R0 | 5 out-of-band tabloyu versiyonla | ✅ dosya yazıldı + no-op/idempotent **ispatlandı**; **UYGULANMADI** |
| R1 | organization_id FK + app_metadata (Custom Access Token Auth Hook) | ⏳ plan onaylandı, dosya yazılmadı |
| R2 | iki fiyat çözücüyü birleştir + ölü order-validate'i yeniden yaz | ⬜ |
| R3 | cart→order snapshot yazımı (iyzico) | ⬜ |
| R4 | organizations/projects'e tenant_id + RLS | ⬜ |
| R5 | fiyat segment RLS daraltması | ⬜ |
| B1 | bayi/fiyat admin paneli (admin-standard'a göre) | ⬜ |
| B2 | product_prices seed + uçtan-uca kanıt = "Avensair-hazır" | ⬜ |

---

## Anlaşılan Sıra (kullanıcı, 2026-06-12)
1. claim-sync vs canlı-join → **ikna** (Supabase benchmark: join-in-RLS ~11.000ms vs JWT claim ~7ms)
2. **R1'i** aradan çıkar (claim-sync = Custom Access Token Auth Hook ile)
3. **Standart + admin panel ANALİZİ**'ne geç (B kolu)
4. Analiz, R'lerde güncelleme gerektirebilir → buraya işlenir

## Sabit Kararlar (gerekçeli)
- **Bayi kimliği = (B) organization-based, B-minimal** — bayi=şirket; role CHECK'e dokunulmaz.
- **Segment/tier çözümü = JWT claim (app_metadata), Custom Access Token Auth Hook ile** — gerekçe: Supabase resmi benchmark (RLS'te tabloya join ~11.000ms; JWT claim ~7ms) + `user_metadata` yetki için yasak (kullanıcı-değiştirilebilir).
- **Production'a uygulama = yalnız kullanıcının açık komutuyla.**

## Altyapı (bu oturumda bitti, arka plan)
- orion `doc schema` bağlandı + parser (101 RLS) + idempotent doc yazımı.
- NLM sync → milestone modeli (post-commit yerel-only); twin güncel (bayi modülü dahil).
