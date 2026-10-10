/**
 * HAVA PERDESİ SİHİRBAZI KAPISI — GEÇİCİ ÇARE (URN-83, 2026-10-09).
 *
 * NİÇİN KAPALI: `EnhancedNeedsWizard` altı adımlık bir akıştır ama yalnız 1, 2, 3 ve 6. adımların
 * çizimi vardır. 3. adımdan sonra `nextStep()` 4'e gider; 4 ve 5 için hiçbir dal yok, panel
 * BOŞ açılır ve 6. adıma (sonuç) hiçbir yoldan ulaşılmaz. Ziyaretçi bozuk bir akışa sokulmasın diye
 * giriş noktaları kapatıldı. Sihirbazın kendisine DOKUNULMADI; asıl onarım ayrı iştir.
 *
 * GİRİŞ NOKTALARI (hepsi bu tek kapıdan geçer, ayrı ayrı açılıp kapanmaz):
 *   - `BottomCTA` "Seçim Sihirbazını Aç" kartı (CategoryLandingView, CategoryShowcaseView, CategoryShowcase)
 *   - `TypeComparison` "Bana Yardım Et" düğmesi (CategoryLandingView)
 *   - Showcase kahraman bölümündeki "Bana Uygun Modeli Bul" düğmesi (CategoryShowcaseView, CategoryShowcase)
 *
 * KAPSAM SINIRI: yalnız HAVA PERDESİ sihirbazını kapatır. Sessiz fan sihirbazı (`SilentFanWizard`)
 * ayrı bir bileşendir, çalışır ve BU KAPIDAN ETKİLENMEZ.
 *
 * AÇMA: sihirbazın 4. ve 5. adımları çizilip 6. adıma erişim doğrulandığında `true` yapılır ve
 * `HavaPerdesiSihirbazKapali.test.tsx` bilerek tersine çevrilir.
 */
export const AIR_CURTAIN_WIZARD_ENABLED = false
