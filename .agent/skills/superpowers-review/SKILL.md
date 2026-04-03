---
name: superpowers-review
description: Task (görev) bazlı, lokal kapanış incelemesi yapar. Yapılan son değişikliklerin planla uyumunu, diff temizliğini ve komşu dosyalara etkisini denetler. Global audit yapmaz.
---

# Superpowers Task-Level Code Review

## When to use this skill
- At the end of the `Implement` phase in the superpowers workflow.
- Before running the `Finish` step for a specific task.
- To review the local diff of the changes *just made*.

## 🎯 Review Kapsamı (Scope)
Bu skill **yalnızca** üzerinde çalışılan mevcut görevin (PR'ın) değiştirdiği dosyaları kapsar.
Proje geneli tarama (Global Audit) BURADA YAPILMAZ. Eğer global tarama gerekiyorsa `venthub-global-audit` aracını kullan.

## 📋 The Local Review Checklist

### 1. Plan Uyumu
- Görev (Task) planında hedeflenen tüm "Acceptance Criteria" (Kabul Kriterleri) karşılandı mı?
- İstenenden **fazlası** (scope creep - sınır aşımı) yapılmış mı? Ekstra ve gereksiz özellik eklendi mi?

### 2. Diff Temizliği (Code Quality)
- Sadece değiştirilmesi gereken satırlara mı dokunuldu?
- `console.log`, yorum satırı kalıntıları (`// TODO`, `// Test edildi`) veya kullanılmayan importlar var mı?
- Hardcoded Türkçe metin bırakıldı mı? (TSX içinde metin varsa `useI18n` kullanılmalı)

### 3. Komşu Etkisi (Neighbor Impact)
- Değişen fonksiyonun argümanları veya dönüş değeri, onu çağıran diğer dosyaları bozuyor mu?
- Değişiklik başka bir view/component içinde Layout Shift (düzen kayması) veya Type error yaratma riski taşıyor mu?

### 4. İstisnai Güvenlik & Standart Kontrolü
- Eğer görev Next.js dynamic route (`[slug]`, `[id]`) değiştiriyorsa, `params` nesnesi kurallara uygun olarak `await` edildi mi?
- Eğer görev DB sorgusu eklediyse, gereksiz geniş (`SELECT *`) sorgularından kaçınıldı mı?

## 🚦 Command Gate (Zorunlu Kalkış Engeli)
Review "tamamlandı" denmeden önce bu görev türü için geçerli olan linter/test kontrollerinin geçtiğine emin ol. Standart zorunlu kontrol:
`pnpm run lint:ci` VEYA `pnpm run lint`

## 📝 Output Format
Aşağıdaki formatta kısa ve net bir rapor üret:
- **Diff Analizi:** (Neler değişti, temiz mi?)
- **Plan Uyumu:** (Eksik veya scope creep var mı?)
- **Bulgular:** (Eğer varsa, hatalı satır ve düzeltme önerisi)
- **Karar:** (Ready to Finish / Needs Fixes)
