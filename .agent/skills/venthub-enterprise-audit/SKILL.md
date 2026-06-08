---
name: venthub-enterprise-audit
description: >
  Proje teslimi öncesi "10/10 Onay" denetim motoru.
  11 katmanlı gerçek terminal kanıtına dayalı denetim yapar.
  Deep MRI kapsamını da içerir (L11). Röntgen gibi PASS/BLOCKED karar verir.
---

# VentHub Enterprise Audit Skill (v1.1)

> **Amaç:** Proje lideri "10/10 — teslime hazır" demeden önce çalıştırılan
> bütünleşik denetim motoru. Röntgen'in üst versiyonudur.
> Her katman terminal kanıtına dayanır. Tahmin, varsayım veya zihinsel tarama yasaktır.

---

## 🚨 YASAK (HALLUCINATION MÜHRÜ)
> [!CAUTION]
> Zihinsel tarama ve tahmin yasaktır. Hiçbir kontrol komut çalıştırılmadan
> ve somut log kanıtı elde edilmeden PASS verilemez.
> Bu skill kodu değiştirmez — sadece denetler ve raporlar.

---

## Nerede Duruyoruz? (Denetim Hiyerarşisi)

```
┌──────────────────────────────────────────────────────────────┐
│  Röntgen              → Her commit öncesi      (30sn)       │
│  "Kırık var mı?"        lint + tsc + build + SSOT           │
├──────────────────────────────────────────────────────────────┤
│  Enterprise Audit     → Teslim öncesi          (10-15dk)    │
│  "Müşteriye teslim      11 katman: kod + güvenlik + yasal   │
│   edilebilir mi?"        + ops + performans + erişilebilirlik│
│                          + teknik borç                       │
└──────────────────────────────────────────────────────────────┘
```

---

## Dosya Yapısı

```
.agent/skills/venthub-enterprise-audit/
├── SKILL.md                           # Bu dosya (talimatlar)
├── enterprise-audit-template.json     # 11 katmanlı JSON şablonu
└── run_enterprise_audit.py            # Python otonom motor (v1.1)

.agent/reports/
├── enterprise-audit-YYYY-MM-DD.json   # Ham sonuç (kanıtlarla)
└── enterprise-audit-YYYY-MM-DD.md     # Okunabilir rapor
```

---

## Çalıştırma

### Tam Denetim (Teslim Öncesi — 11 Katman)
```powershell
$env:PYTHONIOENCODING="utf-8"; python .agent/skills/venthub-enterprise-audit/run_enterprise_audit.py
```

### Sadece Belirli Katmanlar
```powershell
# Sadece teknik borç taraması
python run_enterprise_audit.py --layers L11

# Sadece güvenlik
python run_enterprise_audit.py --layers L2

# Kod kalitesi + güvenlik + yasal (hızlı teslim kontrolü)
python run_enterprise_audit.py --layers L1 L2 L3

# Tüm katmanlar
python run_enterprise_audit.py
```

### Ajan Elle (MCP + Browser dahil)
Lighthouse, Supabase MCP, browser testi gibi kontroller Python motoruyla yapılamaz. Ajan bu SKILL.md'yi okuyarak ilgili kontrolleri MCP araçları ve browser tool ile tamamlar.

---

## 11 Katman

### L1 — Teknik Kalite (Build & Code)
Kod derlenebiliyor mu? Testler geçiyor mu?

| Kontrol | Komut | Seviye |
|---------|-------|--------|
| TypeScript | `pnpm exec tsc --noEmit` | 🔴 STRICT |
| ESLint | `pnpm run lint` | 🔴 STRICT |
| Birim Testler | `pnpm test -- --run` | 🔴 STRICT |
| Build | `pnpm run build` | 🔴 STRICT |
| Lockfile | `pnpm install --frozen-lockfile` | 🔴 STRICT |
| Bundle Boyutu | Chunk > 500KB aranır | 🟡 WARNING |

---

### L2 — Güvenlik (OWASP + Supabase)

| Kontrol | Seviye |
|---------|--------|
| CVE Tarama (`pnpm audit`) | 🔴 STRICT |
| Hardcoded Secret (i18n/test hariç) | 🔴 STRICT |
| Security Headers (HSTS, CSP, nosniff) | 🔴 STRICT |
| Console.log hassas veri sızıntısı | 🟡 WARNING |
| Rate Limiting varlığı | 🟡 WARNING |
| Şifre Güç Kuralı varlığı | 🔴 STRICT |

---

### L3 — Yasal Uyumluluk (KVKK / GDPR)

| Kontrol | Seviye |
|---------|--------|
| KVKK Hesap Silme (deleteUser) | 🔴 STRICT |
| Cookie Consent | 🔴 STRICT |
| Yasal Sayfalar (kvkk/gizlilik/cerez) | 🔴 STRICT |
| LICENSE dosyası | 🟡 WARNING |
| GPL Riski | 🟡 WARNING |

---

### L4 — Operasyonel Hazırlık (DevOps)

| Kontrol | Seviye |
|---------|--------|
| /api/health endpoint | 🔴 STRICT |
| Monitoring (Sentry) | 🔴 STRICT |
| CI Pipeline (.github/workflows) | 🔴 STRICT |
| .env.example | 🔴 STRICT |
| Dockerfile | 🟡 WARNING |
| SECURITY.md | 🟡 WARNING |

---

### L5 — Veri & Veritabanı

| Kontrol | Seviye |
|---------|--------|
| RLS (tüm tablolar) | 🔴 STRICT |
| Supabase Security Advisors | 🟡 WARNING |
| Input Validation (Zod/Yup) | 🟡 WARNING |

> [!NOTE]
> L5_01 ve L5_02 ajan tarafından Supabase MCP araçlarıyla doğrulanır.

---

### L6 — Dokümantasyon

| Kontrol | Seviye |
|---------|--------|
| README (200+ satır) | 🟡 WARNING |
| CHANGELOG | 🟡 WARNING |
| CONTRIBUTING.md | 🟡 WARNING |
| llms.txt Standardı (kök dizin veya /public/llms.txt) | 🔴 STRICT [GEÇİŞ AŞAMASINDA] |

---

### L7 — Ürün Tamamlığı

| Kontrol | Seviye |
|---------|--------|
| Kritik Rotalar (/products, /cart, /checkout, /auth, /admin) | 🔴 STRICT |
| E2E Testler | 🟡 WARNING |
| Sitemap & Robots | 🔴 STRICT |
| Error Boundary | 🟡 WARNING |

---

### L8 — Performans & Core Web Vitals

| Kontrol | Seviye |
|---------|--------|
| Image Optimization (`<img>` → `<Image>`) | 🟡 WARNING |
| Client Boundary (layout/page sızıntısı) | 🟡 WARNING |
| Lighthouse (Perf>=60, A11y>=80, BP>=80, SEO>=80) | 🔴 STRICT |
| Skeleton Coverage | 🟡 WARNING |

> [!IMPORTANT]
> Lighthouse ajan tarafından browser tool ile canlı site veya local dev üzerinde çalıştırılır.

---

### L9 — Erişilebilirlik (WCAG 2.1 AA)

| Kontrol | Seviye |
|---------|--------|
| ARIA Kullanımı | 🟡 WARNING |
| Alt Text | 🟡 WARNING |
| Keyboard Nav | 🟡 WARNING |

---

### L10 — Next.js 15 / React 19 Disiplini

| Kontrol | Seviye |
|---------|--------|
| Async Params (await zorunlu) | 🔴 STRICT |
| Route SSOT (hardcoded href yasak) | 🔴 STRICT |
| i18n Leakage | 🟡 WARNING |
| Framer Motion sızıntısı | 🟡 WARNING |
| Supabase ORM Tekilleştirme (RSC içinde React.cache) | 🔴 STRICT [GEÇİŞ AŞAMASINDA] |

---

### L11 — Teknik Borç & Ölü Kod

| Kontrol | Komut | Seviye |
|---------|-------|--------|
| Dead Code (Knip) | `pnpm run knip --reporter compact` | 🟡 WARNING |
| Bundle Analyzer | `pnpm run analyze` | 🟡 WARNING |
| Unused Dependencies | `pnpm run knip --include unlisted,unresolved` | 🟡 WARNING |
| React 19 Compiler Sınırı | Yeni basit bileşenlerde manuel useMemo/useCallback kısıtı | 🟡 WARNING [GEÇİŞ AŞAMASINDA] |

> [!TIP]
> Sadece teknik borç taraması yapmak için: `python run_enterprise_audit.py --layers L11`

---

## Karar Modeli

```
READY      → Tüm 🔴 STRICT kontroller PASS
CONDITIONAL → 🔴 STRICT hepsi PASS ama 🟡 WARNING var
BLOCKED    → Herhangi bir 🔴 STRICT kontrol FAIL → teslim yapılamaz
```

---

## Manuel Tamamlama Gerektiren Kontroller

| Kontrol | Nasıl Yapılır |
|---------|---------------|
| L5_01 (RLS) | `mcp_supabase_execute_sql` ile RLS olmayan tabloları sorgula |
| L5_02 (Security Advisors) | `mcp_supabase_get_advisors type=security` |
| L8_03 (Lighthouse) | Browser tool ile Lighthouse CLI |
| Görsel Denetim | Browser tool ile ana sayfaları aç, mobil ve desktop kontrol et |

---

## Sınırlar

- Bu skill kodu **değiştirmez** — sadece denetler ve raporlar
- Her kontrol **terminal çıktısıyla kanıtlanmalıdır**
- Rapor `.agent/reports/` altına kaydedilir — tarihle versiyonlanır

### Eklenen Denetim Maddeleri (Enrichment v2)

#### L2 Güvenlik Ek
| CORS Wildcard (Access-Control-Allow-Origin: *) auth endpoint'lerde | 🔴 STRICT |
| service_role client bundle sızıntısı | 🔴 STRICT |

#### L5 Veri Ek
| İndekslenmemiş FK sütunları (REFERENCES vs CREATE INDEX) | 🟡 WARNING |
| Column GRANT SELECT uyuşmazlığı (yeni sütun, eksik GRANT) | 🔴 STRICT |

#### L7 Ürün Ek
| Stripe idempotencyKey (checkout.sessions.create) | 🔴 STRICT |
| Webhook Signature doğrulaması (Stripe-Signature) | 🔴 STRICT |
| UI veri sızıntısı ("NaN", "undefined", "[object Object]") | 🟡 WARNING |

#### L8 Performans Ek
| LCP < 2.5s | 🔴 STRICT |
| INP < 200ms (FID yerini aldı — Mart 2024) | 🔴 STRICT |
| CLS < 0.1 | 🔴 STRICT |
