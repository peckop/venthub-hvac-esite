# VentHub Paralel Ajan Sistemi — Rehber

> Bu dosyayı OKU: Yeni bir session açtığında veya paralel çalışma başlatmadan önce.
> Hem insanlar hem de ajanlar için yazılmıştır.

---

## 1. Sistem Ne Yapar? (Restoran Analojisi)

Normalde tek garson hem sipariş alır, hem mutfağa iletir, hem servis yapar — sırayla.

Paralel sistemde:
- **Sen** = Müşteri (ne istediğini söylüyorsun)
- **Orkestratör Ajan (ben)** = Şef (işi böler, kime ne gideceğine karar verir)
- **Subagent'lar** = Uzman aşçılar (her biri kendi işini aynı anda yapar)
- **Registry** = Şantiye defteri (ne yapıldı, kim yaptı, ne zaman — hepsi kayıt altında)

---

## 2. Roller — Kim Ne Yapar?

| Rol | Dosya | Görevi | YOLO? |
|---|---|---|---|
| Orkestratör | Ben (ana ajan) | Görevi böler, subagent'ları fırlatır, sonuçları toplar | — |
| `denetci` | `paralel-review` skill | Tip + kod kalitesi + import hataları | ✅ Evet |
| `guvenlik-nobet` | `supabase-security` skill | RLS, auth.uid(), SQL güvenliği | ✅ Evet |
| `test-yazari` | `superpowers-tdd` skill | Vitest/Playwright testi yazar | ✅ Evet |
| `mimar` | `superpowers-plan` skill | Plan üretir, KOD YAZMAZ | ✅ Evet |

> **Önemli:** Hangi modelin (Gemini Pro/Flash) her ajana atanacağı **Gemini CLI'nin kararıdır**.  
> Biz sadece "iş tanımını" (SKILL.md) yazarız, "hangi çalışan gelecek" bizde değil.  
> Bu yüzden SKILL.md kalitesi kritiktir — kim gelirse gelsin doğru çalışsın.

---

## 3. Tam Akış (Adım Adım)

```
┌─────────────────────────────────────────────────────────┐
│  Sen: "Şu kodu review et" / "Paralel çalıştır"          │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│  Orkestratör (ben): Hangi rol gerekli? → Görevi böl      │
└────────┬─────────────────────────┬───────────────────────┘
         ↓                         ↓
  spawn_subagent.py          spawn_subagent.py
  → Ajan A (gemini --yolo)   → Ajan B (gemini --yolo)
  → SKILL içeriği aktarılır  → SKILL içeriği aktarılır
         ↓                         ↓
  artifacts/superpowers/     artifacts/superpowers/
  subagents/A.log            subagents/B.log
         └──────────┬──────────────┘
                    ↓
  Orkestratör: Log'ları oku → Sonuçları birleştir
                    ↓
  python registry/manage_registry.py record-parallel \
    P02 004 --agents 2 --status passed
                    ↓
  registry/PXX/YYY/parallel_review.json  ← kayıt
  registry/PULSE.md                       ← görev satırı güncellendi
```

---

## 4. YOLO Modu — Ne Anlama Geliyor?

Normalde Gemini CLI her tool çağrısında onay sorar. `--yolo` aktif olduğunda:

```
YOLO mode is enabled. All tool calls will be automatically approved.
```

**Subagent'lar her zaman `--yolo` ile başlar** — sen onay vermek zorunda değilsin.
`spawn_subagent.py` içinde `yolo=True` varsayılan değerdir.

**Güvenli:** Review/analiz görevleri → sadece okur, bozacak bir şey yok.  
**Dikkat:** Kod yazma görevlerinde SKILL.md içinde `allowed_paths` sınırı tanımlanmalı.  
**Yasak:** Supabase migration → `--no-yolo` kullan, insan gözü şart.

---

## 5. Hazır Orkestrasyon Paketleri

### Paket A — Commit Öncesi Kalkan (2 Ajan, ~3-5 dk)
```powershell
# Ajan 1 — Tip & Kod Kalitesi
python .agent/skills/superpowers-workflow/scripts/spawn_subagent.py `
  --skill paralel-review `
  --task "Şu dosyaları incele: <liste>. Tip hataları, any kullanımı, unused import ara."

# Ajan 2 — Güvenlik (aynı anda)
python .agent/skills/superpowers-workflow/scripts/spawn_subagent.py `
  --skill supabase-security `
  --task "Şu değişiklikleri RLS ve auth güvenliği açısından incele: <içerik>"

# İkisi bitince → Registry'e kaydet
python registry/manage_registry.py record-parallel P0X 00X --agents 2 --status passed
```

### Paket B — Özellik Tamamlama (3 Ajan, ~5-8 dk)
```
Ajan 1: denetci     → paralel-review skill
Ajan 2: test-yazari → superpowers-tdd skill
Ajan 3: guvenlik    → supabase-security skill
```

### Paket C — Sprint Sonu (4 Ajan)
```
Ajan 1: mimar       → superpowers-plan (plan doğrula)
Ajan 2: denetci     → paralel-review
Ajan 3: test-yazari → superpowers-tdd
Ajan 4: guvenlik    → supabase-security
```

---

## 6. Subagent Sonuçlarını Nerede Bulursun?

```
artifacts/superpowers/subagents/
  ├── paralel-review-20260405-171854-66114256.log   ← Ajan A
  ├── supabase-security-20260405-171855-ab12cd34.log ← Ajan B
  └── ...
```

Her log'un sonunda:
```
---SUBAGENT-RESULT-START---
[bulgu veya TEMIZ]
---SUBAGENT-RESULT-END---
```
Sadece bu bloğu oku — geri kalanı teknik meta-veri.

---

## 7. Registry Entegrasyonu — Neden Önemli?

Registry olmadan paralel sistem çalışır ama **hafızası yoktur**:
- Bir dahaki session: "Bu görevi review ettik mi?" → Bilinmiyor
- PULSE.md: Boş → Ajan ne durumda olduğunu bilmiyor

Registry ile:
```
PULSE.md görev satırı:
| `004` | Ürün Listesi | 🔄 RUN | Paralel Review: 05.04 ✅ 2 ajan |
```

`record-parallel` komutu Sentinel Guard kuralını korur:
- Subagent → `artifacts/` yazar (registry dışı ✅)
- `manage_registry.py` → `registry/PXX/` günceller (yetkili script ✅)
- Hiçbir ajan doğrudan `registry/PXX/` klasörüne dokunmaz ✅

---

## 8. Bilinen Sınırlar

| Sınır | Neden | Çözüm |
|---|---|---|
| Model seçimi (Pro/Flash) elimizde değil | Gemini CLI CLI kararı | SKILL.md kalitesini yüksek tut |
| Her subagent ~85sn baseline | MCP sunucuları yeniden init oluyor | Kısa görevleri birleştir |
| Skill adı yanlışsa ajan başlamaz | `spawn_subagent.py` doğrular | `takim-rolleri/SKILL.md`'deki isim listesini kullan |
| DB migration → asla YOLO | Geri alınamaz | `--no-yolo` flag ekle |

---

## 9. Hızlı Başvuru

```bash
# Paralel review başlat (Paket A)
/paralel-review komutunu kullan VEYA manuel:
python .agent/skills/superpowers-workflow/scripts/spawn_subagent.py --skill paralel-review --task "..."

# Sonucu registry'e kaydet
python registry/manage_registry.py record-parallel <PROJE> <GOREV> --agents <N> --status <passed|bugs_found|failed>

# Mevcut skill listesi
ls .agent/skills/

# Subagent logları
ls artifacts/superpowers/subagents/
```

---

*Bu dosya: `.agent/PARALEL-SISTEM.md` — Son güncelleme: 2026-04-05*
