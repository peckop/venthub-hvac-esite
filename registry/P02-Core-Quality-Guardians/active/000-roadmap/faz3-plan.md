# FAZ 3 — Plan: SSR-First Modernizasyonu

## Context

FAZ 2 framer-motion temizliği tamamlandı. Bu faz 36 view dosyasındaki gereksiz `'use client'` direktifleerini kaldırmayı hedefliyor. Ancak `useI18n()` hook'u React Context kullandığı için, bu hook'u kullanan tüm dosyalar `'use client'` zorunlu kalıyor.

**Motivasyon:** Server Component'ler JavaScript bundle'ına eklenmez. 'use client' kaldırmak = ~30-50KB bundle küçülmesi + TTFB iyileşmesi.

---

## Gerçek Durum (28 Nisan 2026)

```
'use client' view sayısı: 36
'use client' component sayısı: 56
useI18n kullanan view sayısı: 9 (hepsi zorunlu client)
```

### Kısıt: useI18n = Client Component Zorunlu

```
useI18n() hook'u → React Context → 'use client' ZORUNLU
```

9 view dosyası + 29 component = 38 dosya useI18n kullanıyor ve kesinlikle client kalacak.

### Teorik olarak çevrilebilir dosyalar

Kriterler (HEPSİ sağlanmalı):
1. `'use client'` var
2. `useState`, `useEffect`, `useContext`, `createContext` YOK
3. `useI18n` YOK
4. `useRouter`, `useParams`, `usePathname` YOK
5. Framer-motion YOK (FAZ 2'de temizlendi)

Mevcut duruma göre **sadece 1-2 dosya** çevrilebilir görünüyor.

---

## Scope (Ön Planlama)

```json
{
  "allowed_paths": "tbd — önce tarama yapılacak",
  "max_files_changed": "tbd — tarama sonrası",
  "forbidden_paths": [
    "src/views/account/**/*.tsx",  -- auth gerektiren, useI18n zorunlu
    "src/components/ui/",            -- UI primitives, useI18n kullanıyor
    "src/i18n/**"                    -- i18n context zorunlu
  ]
}
```

---

## ADIM 1: Gerçek Tarama (Yapılacak)

### Tarama Komutları

```bash
# 1. useI18n kullanan view dosyaları
grep -rl "useI18n" src/views/ | wc -l

# 2. 'use client' olan view dosyaları
grep -rl "'use client'" src/views/ | wc -l

# 3. useI18n OLMADAN 'use client' olan view dosyaları
# (bu dosyalar çevrilebilir aday)
for f in $(grep -rl "'use client'" src/views/); do
  if ! grep -q "useI18n" "$f"; then echo "$f"; fi
done

# 4. Component tarama (useI18n yok + hook yok)
for f in $(grep -rl "'use client'" src/components/); do
  if ! grep -q "useI18n\|useState\|useEffect\|useContext\|useRouter\|usePathname" "$f"; then echo "$f"; fi
done
```

### Verify
```bash
# Tarama sonrası hedef dosya listesi oluşturulacak
```

---

## ADIM 2: Tespit Edilen Dosyaları Çevir (Tarama sonrası)

Her dosya için:
1. `'use client'` satırını kaldır
2. Server Component uyumlu olup olmadığını kontrol et
3. `pnpm exec tsc --noEmit` → fail ise geri al

### Muhtemel Adaylar (Tahmin — doğrulanacak)

| Dosya | Durum | Neden |
|-------|-------|-------|
| `src/views/AboutPage.tsx` | ❌ | useI18n kullanıyor |
| `src/views/ContactPage.tsx` | ❌ | useI18n kullanıyor |
| `src/components/admin/dashboard/StatCard.tsx` | ✅ olabilir | Hook yok, useI18n yok |

---

## Doğrulama

```bash
# 1. TSC
pnpm exec tsc --noEmit

# 2. Build
pnpm run build

# 3. 'use client' sayısı (azalma olmalı)
grep -rl "'use client'" src/views/ | wc -l
# Başlangıç: 36 → Hedef: <36
```

---

## Risk Analizi

| Risk | Seviye | Çözüm |
|------|--------|-------|
| useI18n zorunluluğu | ÇOK YÜKSEK | Çoğu dosya çevrilemez |
| useRouter/usePathname | YÜKSEK | Server Component'de çalışmaz |
| Build break | Orta | TSC kontrol et her dosya sonrası |

---

## Gerçekçi Beklenti

**Tahmin:** Sadece 1-3 dosya çevrilebilir. Net kazanç düşük.

**Öneri:** Eğer tarama sonucu <5 dosya çevrilebilirse, FAZ 3'ü atla ve FAZ 4 (Güvenlik) veya FAZ 5 (Dead Code) ile devam et.