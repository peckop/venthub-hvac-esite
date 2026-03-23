---
name: venthub-auditor
description: VentHub'ın mutlak kalite bekçisidir. Mimari bütünlük, Next.js 15/React 19 uyumu, tip güvenliği ve robotik temizlik denetimi yapar.
---

# 🛡️ VentHub Unified Auditor Skill (v10.0)

Bu yetenek, projenin sadece "çalışmasını" değil, "mimari açıdan kusursuz" kalmasını sağlar. Projedeki tüm otonom ajanlar bu skill'in kurallarına biat etmek zorundadır.

## 💎 Mimari Korkuluklar (Architectural Guardrails)
1.  **Metrik Tuzağı Yasağı:** Hata sayılarını düşürmek için kodun mantıksal ve isimlendirme bütünlüğü bozulamaz. `_` öneki ile susturma son çaredir.
2.  **Dörtlü Mühür Denetimi:** Her görev `brainstorm`, `plan` ve `review` aşamalarında karşılıklı teknik kanıtlara (metadata) sahip olmalıdır.
3.  **PascalCase Zorunluluğu:** React bileşenleri her zaman büyük harfle başlamalı ve standart isimlendirmeye sahip olmalıdır.

## 📐 Teknik Teftiş Kriterleri

### 1. Next.js 15 & React 19
- `params` ve `searchParams` nesneleri asenkron (await) kullanılmalıdır.
- `useI18n` hook'u bileşen bütünlüğünü bozmadan, standart şekilde kullanılmalıdır.
- Hydration güvenliği için `window` erişimleri `useEffect` veya `typeof window` ile sarmalanmalıdır.

### 2. Tip Güvenliği (Strict Typing)
- `any` dökümü kesinlikle yasaktır. 
- `unknown` sadece geçici dökümler için kullanılabilir. 
- Veri modelleri için `src/types/` altındaki tanımlar (Source of Truth) zorunludur.

### 3. I18n ve Performans
- Hardcoded Türkçe metinler tespit edildiğinde i18n sistemine taşınmalıdır.
- Three.js objeleri (`geometry`, `material`) `dispose()` edilerek bellek sızıntıları önlenmelidir.

## 🚀 Denetim Araçları (Executables)
Projenin bütünlüğünü denetlemek için şu script kullanılmalıdır:
`python .agent/scripts/check_integrity.py`

## 🏁 Başarı Kriteri
Bir görev ancak `check_integrity.py` scriptinden tam puan (0 hata) alırsa ve mimari bütünlük korunursa "Completed" olarak işaretlenebilir.
