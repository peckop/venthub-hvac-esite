# Brainstorm: 001-modernization-roadmap

## 🎯 Goal
VentHub projesini Next.js 15 ve React 19'un en yeni yetenekleriyle (Server-Only, PPR, Modern Actions) donatarak hem güvenlik hem de performans açısından "Tier-1" seviyesine taşımak.

## 🛡️ Constraints & Risks
- **Async Params Constraint:** Next.js 15 zorunlu asenkron `params` yapısı nedeniyle tüm dinamik rotaların (`[id]`, `[slug]`) kontrol edilmesi gerekiyor.
- **Hydration Sync Risk:** React 19 ile gelen yeni hata ayıklama overlay'i sayesinde sızıntılar daha görünür olacak, bu nedenle client/server ayrımı keskin olmalı.
- **Dependency Compatibility:** Mevcut kütüphanelerin React 19 ile uyum sorunu (peer dependency) yaşamaması için `pnpm` override veya uyumluluk kontrolü şart.

## 💡 Options & Recommendation
1. **Server-Only Lockdown (Öncelikli):** API anahtarlarının ve DB servislerinin sızmasını önlemek için `server-only` paketini tüm `lib` katmanına yaymak.
2. **Action Modernization:** `useFormStatus` yerine yeni `useActionState` (React 19) kancasına geçiş.
3. **PPR (Partial Prerendering):** Dinamik sepet ve kullanıcı verilerini statik kabuklar içinde sarmalamak.

## ✅ Acceptance Criteria
- `server-only` bariyerleri kuruldu ve build hata vermedi.
- Next.js 15 asenkron params kuralına aykırı dosya kalmadı.
- `pnpm run lint` ve `pnpm run build` %100 temiz çıktı verdi.
- Geliştirme ekranında "Hydration Overlay" ve "Static Indicator" aktif olarak görülüyor.
