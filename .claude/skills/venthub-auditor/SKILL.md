---
name: venthub-auditor
description: VentHub'ın mutlak kalite bekçisidir. Mimari bütünlük, pre-commit kontrolleri,
  bütünlük denetimi (bütünlük denetle) ve integrity check gerçekleştirir. Birim testlerini
  çalıştırmak (Vitest), git branch oluşturmak veya veritabanı sıfırlamak için KULLANMAYIN.
category: audit
metadata:
  triggers:
  - integrity check
  - bütünlük denetle
  - pre-commit check
  inputs:
  - working directory state
  outputs:
  - integrity verification status
  commands:
    validate: python -c "import pathlib; assert pathlib.Path('.agent/skills/venthub-auditor/scripts/run_audit.py').exists(), 'Audit script missing'; print('Venthub auditor skill ready.')"
depends_on:
- venthub-architecture
next_steps:
- venthub-enterprise-audit
run_last: false
exclusions: []
---

## 🛫 Prerequisites (Ön Koşul Kontrolü)

Bu skill'i kullanmadan önce aşağıdaki kontrolleri yap. Herhangi biri başarısızsa, **DURMA** ve kullanıcıya bildir.

1. **Bütünlük Scripti Erişimi:**
   - `.agent/scripts/check_integrity.py` dosyasının mevcut olduğunu doğrula.
   - Dosya yoksa veya çalıştırılamıyorsa → ❌ DURMA.

2. **Git Durumu:**
   - `git status` çalıştır. Eğer "not a git repository" hatası gelirse → ❌ DURMA.
   - Commit edilmemiş kritik değişiklikler varsa, önce kullanıcıyı uyar.

3. **Korunan Varlık Kontrolü:**
   - Görevdeki dosyaların `src/components/products/visual-models/` veya `src/types/database.types.ts` içerip içermediğini kontrol et.
   - İçeriyorsa → Adım 1 (Snapshot Zorunluluğu) otomatik tetiklenir. Yedekleme yapılmadan devam etme.

# 🛡️ VentHub Unified Auditor Skill (v11.0 - Sentinel Edition)

Bu yetenek, projenin sadece "çalışmasını" değil, **"mimari açıdan kusursuz" kalmasını ve "kritik dosyaların kazara silinmemesini" sağlar**. Projedeki tüm otonom ajanlar bu skill'in kurallarına biat etmek zorundadır.

## 🚨 BÖLÜM 1: BÜTÜNLÜK KALKANI (Integrity Guard)

Aşağıdaki klasörler/dosyalar "Kritik Varlık" (Protected) sınıfındadır ve ajanın "hafıza yanılsamalarına" karşı nihai koruma altındadır:

### KORUNAN VARLIKLAR (Protected Objects)
1. `src/components/products/visual-models/` (3D Modeller ve Orbital Sistemler)
2. `src/components/navigation/` (Kategori Carousel ve Akış Mimarı)
3. `src/types/database.types.ts` (Veritabanı İskeleti)
4. `.agent/`, `registry/` ve `.gemini/hooks/` dizinleri (Otonom Sinir Sistemi)

### 🚧 ZORUNLU EYLEM PROTOKOLLERİ (Hard Rules)

#### 1. Snapshot Zorunluluğu (Backup First)
Eğer yukarıdaki kritik dosyalardan birine dokunulacaksa (veya Git üzerinden `revert/reset/checkout` yapılacaksa), ajan (sen) plana İLK adım olarak şunu yazmak zorundasın:
- **Komut:** Mevcut çalışan dosyaları `artifacts/backups/CURRENT_WORK/` klasörüne yedekle (kopyala). 

#### 2. Zaman Damgası Doğrulaması (Time-Stamp Check)
Dosyaları Git üzerinden geri getirirken "dün" veya "eski versiyon" gibi muğlak ifadeler KULLANILAMAZ. Kesinlikle `git log` üzerinden **Commit Hash** ve **Tam Tarih/Saat** ile doğrulama yapılmalı ve Mimara (Kullanıcıya) onaylatılmalıdır.

#### 3. Yıkıcı Eylem Koruması (No-Overwrite)
Mevcut büyük bir çalışmayı silip yerine bir yedek koymak "Yıkıcı Eylem"dir ve Mimar'dan açık onay (`/override`) alınmadan ASLA yapılamaz.

---

## 💎 BÖLÜM 2: MİMARİ KORKULUKLAR (Architectural Guardrails)

1. **Metrik Tuzağı Yasağı:** Hata sayılarını düşürmek için kodun mantıksal ve isimlendirme bütünlüğü bozulamaz. `_` öneki ile susturma son çaredir.
2. **Dörtlü Mühür Denetimi:** Her görev `brainstorm`, `plan` ve `review` aşamalarında karşılıklı teknik kanıtlara (metadata) sahip olmalıdır.
3. **PascalCase Zorunluluğu:** React bileşenleri her zaman büyük harfle başlamalı ve standart isimlendirmeye sahip olmalıdır.

---

## 📐 BÖLÜM 3: TEKNİK TEFTİŞ KRİTERLERİ

### 1. Next.js 15 & React 19
- `params` ve `searchParams` nesneleri asenkron (await) kullanılmalıdır.
- `useI18n` hook'u bileşen bütünlüğünü bozmadan kullanılmalıdır.
- Hydration güvenliği için `window` erişimleri `useEffect` veya `typeof window` ile sarmalanmalıdır.

### 2. Tip Güvenliği (Strict Typing)
- `as any`, `@ts-ignore`, `as unknown as` dökümü **KESİNLİKLE yasaktır** (Linter kızsa bile).
- Veri modelleri için `src/types/` altındaki tanımlar (Source of Truth) zorunludur. JSON veriler `isRecord` ile çözümlenmelidir.

### 3. I18n ve Performans
- JSX içindeki 2 kelimeden uzun Türkçe hardcoded metinler tespit edildiğinde i18n sistemine (veya `useI18n`) taşınmalıdır.
- Üretim kodunda `console.log` bırakılması mimari bir suçtur.
- Three.js objeleri (`geometry`, `material`) `dispose()` edilerek bellek sızıntıları önlenmelidir.

---

## 🚀 BÖLÜM 4: DENETİM MOTORU (Check Engine)

Projenin bütünlüğünü doğrulamak için (ve bir PR'dan / kod bloğundan önce) MİMARİ CEZA yememek adına şu script kullanılmalıdır:
**`python .agent/scripts/check_integrity.py`** (Belirli hedef: `python .agent/scripts/check_integrity.py src/hooks` gibi). 

Eğer bu script terminalde **[BLOCKER]** uyarısı döndürürse; o sorunu çözmeden görev mühürlenemez!

---

## 🏁 BAŞARI KRİTERİ
Bir görev ancak `check_integrity.py` V5 üzerinden 0 (sıfır) BLOCKER aldığında (exit code 0), Dörtlü Mühür uygulanarak "Completed" statüsüne geçebilir.
