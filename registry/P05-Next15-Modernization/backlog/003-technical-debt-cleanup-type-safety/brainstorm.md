# Brainstorm: Technical Debt Cleanup & Type Safety

## 🎯 Goal
Next.js 15 ve React 19 modernizasyonu sırasında "hızlı ilerlemek" adına eklenen `as any` casting ve geçici tip tanımlarının (Technical Debt) temizlenmesi.

## 🛡️ Constraints & Risks
- **Deneysel Özellik Riski**: İptal edildi. `unstable_after` kullanılmayacak, stabilite öncelikli.
- **Tip Karmaşası**: React 19 ile değişen `Ref` ve `ComponentProps` tiplerinin Lucide ikonları ile uyumu sarsıntısız sağlanmalı.
- **Regresyon Risk**: Tip düzeltmeleri sırasında çalışma mantığının bozulmaması için `pnpm build` sürekli kontrol edilmeli.

## 💡 Options & Recommendation
- **Tavsiye**: 'Any Casting Protokolü' (v8) kapsamında eklenen ara değişkenleri, `src/types/` altındaki kalıcı tanımlarla değiştirerek ilerlemek.

## ✅ Acceptance Criteria
- `SearchOverlay`, `TopicPage` ve `LoginPage` bileşenlerinde `as any` kullanımı %90 azaltıldı.
- `pnpm exec tsc -b` komutu sıfır hata ile tamamlandı.
