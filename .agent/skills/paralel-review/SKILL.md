---
name: paralel-review
description: git diff çıktısını 3 bağımsız uzmana aynı anda göndererek tip/güvenlik/performans denetimi yapar ve raporları birleştirir.
when_to_use: >
  Kullan: Bir görev tamamlandıktan sonra, commit öncesinde kapsamlı kod incelemesi yapılacaksa.
  Örnekler: 'kodu incele', 'commit öncesi review yap', 'paralel denetle', 'lint ve güvenlik kontrolü'.
  superpowers-review'dan farkı: Tek ajan yerine eş zamanlı 3 uzman — daha hızlı ve kapsamlı.
allowed-tools:
  - run_command
  - view_file
  - grep_search
  - multi_replace_file_content
  - replace_file_content
---

# Paralel Review Skill

Claude Code'un `/simplify` komutundan ilham alınmıştır.
Bir garson, şef ve kasiyer yerine; her iş kendi uzmanına gider ve sonuçlar masada birleşir.

## Hedef
Görev farkını 3 eksen boyunca tarayıp "Ready to Commit / Needs Fixes" kararı üretmek.
Her eksen bağımsız — biri "temiz" dese bile diğeri sorun bulabilir.

---

## Adım 1 — Diff'i Al

```
git diff HEAD          # Taahhüt edilmemiş değişiklikler
# veya
git diff <sha>..HEAD   # Belirli commit'ten bu yana
```

Diff çıktısını elde et. Değişen dosyaların listesini görsel olarak sun.

**Başarı kriteri:** Hangi dosyaların değiştiği belli.

---

## Adım 2 — 3 Uzmanı Aynı Anda Tetikle

Aşağıdaki 3 analizi eş zamanlı yürüt (sıralı değil — hepsini birden başlat):

### 🔵 Uzman 1 — Tip & Import Dedektifi (`venthub-auditor` bilgisiyle)
Kontrol listesi:
- `any` kullanan satır var mı?
- Kullanılmayan import var mı?
- `console.log` / `debugger` kalıntısı var mı?
- Next.js 15: dinamik rotalarda `params` `await` ediliyor mu?
- `window` / `document` direkt kullanımı (useEffect dışında) var mı?

### 🟡 Uzman 2 — Güvenlik & Supabase Nöbetçisi (`supabase-security` bilgisiyle)
Kontrol listesi:
- Yeni tablo eklendiyse `ENABLE ROW LEVEL SECURITY` var mı?
- `auth.uid()` direkt mi, `(SELECT auth.uid())` sarmalı mı?
- `SELECT *` gibi geniş sorgu var mı?
- Hardcoded API key veya secret var mı?
- Kullanıcı girdisi sanitize ediliyor mu?

### 🔴 Uzman 3 — Performans & Kalite Kılavuzu (`venthub-architecture` bilgisiyle)
Kontrol listesi:
- Kopyala-yapıştır kod blokları var mı? (aynı mantık 2+ yerde)
- Gereksiz `useEffect` dependency var mı?
- N+1 sorgu riski var mı? (döngü içinde await/fetch)
- LCP kritik görsel için `width/height` + `priority` prop var mı?
- Yeni component doğru klasörde mi? (`src/components/<kategori>/`)

---

## Adım 3 — Raporları Birleştir

Her uzmanın bulduklarını tek tabloya dök:

| # | Dosya | Satır | Sorun | Uzman | Önem |
|---|---|---|---|---|---|
| 1 | `foo.tsx` | 42 | `any` kullanımı | 🔵 Tip | ⚠️ Orta |
| 2 | `bar.ts` | 87 | `SELECT *` sorgusu | 🟡 Güvenlik | 🚨 Kritik |

**Başarı kriteri:** Tablo boş veya tüm satırlar düzeltildi.

---

## Adım 4 — Düzelt (Bulgu Varsa)

Her bulguyu sırasıyla düzelt. Düzeltme sonunda o satırı tabloda `✅` ile işaretle.

**Kural:** Sadece diff'teki dosyalara dokun — scope creep yasak.

---

## Adım 5 — Kapanış Kararı

```
// turbo
pnpm run lint
```

Lint geçiyorsa:

> **Karar:** ✅ Ready to Commit
> **Özet:** X dosya, Y değişiklik, Z sorun bulundu, hepsi düzeltildi.

Lint geçmiyorsa hata giderilene kadar geri dön.

---

## Kurallar
- `any` → `unknown` veya gerçek tipe çevir, direkt silme
- Güvenlik bulgularını düzeltmeden "temiz" raporu verme
- Her uzman bulgusu "dosya + satır numarası" seviyesinde olmalı, "genel" değil
- Sadece diff kapsamındaki dosyalar — proje geneli tarama bu skill'in işi değil
