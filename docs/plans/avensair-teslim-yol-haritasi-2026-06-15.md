# Avensair Teslim Yol Haritası

> **Ne bu?** "Şu an" → "Avensair'e teslim" arası TEK harita. Mevcut standart/plan dosyalarını
> + yeni iş kalemlerini **teslim-önceliğine** göre bağlar. Detayları TEKRARLAMAZ — ilgili dosyaya işaret eder.
> Oluşturma: 2026-06-15 · Sahibi: Recep · Güncellik: kalemler ilerledikçe elle.

---

## 0. Yönetici İlke — Teslim Filtresi

Her iş kalemi için tek soru: **"Bu, Avensair'in EVET'ini geciktiriyor mu, yoksa EVET sonrası mı?"**

İlk müşteri **çalışan bir bayi kokpiti + utandırmayan bir site** ister; CRM/teklif modülü/her-yer-90+'ı
siteyi **kullanarak** ister. "Hazır" tanımını büyütmek = teslimi geciktirmek (VISION riski:
*"bitirip teslim edememe"*). Bu yüzden iş **3 katmana** bölünür. Yeni bir "harika fikir" gelince
önce sor: **"P0 mı?"** Değilse listeye yaz, teslimi geciktirme.

---

## 1. İş Kalemi Envanteri (hepsi — hiçbiri kaybolmasın)

| # | İş | Durum (2026-06-15) | Detay / kaynak |
|---|---|---|---|
| **A** | Görünür bug'lar / kalite | kategori-i18n ✓ · conformance Faz 1 ✓ (INV-1) | `src/__tests__/conformance/category-name-ssot.test.ts` |
| **B** | i18n literal göçü | kapsam-içi ✓ · **admin (~256) + legal (~235) bekliyor** | `docs/plans/i18n-jsx-literals-cleanup-2026-06-14.md` |
| **C** | **Bayi modülü (çekirdek)** | **KIRIK** — R0-R5 onarım → B1-B2 inşa | `docs/standards/dealer-module-blueprint.md` · `docs/audits/dealer-data-ground-truth-2026-06-11.md` |
| **D** | Lighthouse / performans | homepage ~75 → **hedef 90+** · products/categories (3D/three.js) | `docs/audits/lighthouse_diagnostic_2026-06-10.md` |
| **E** | Ürün detayları | **altyapı hazır** (PDF + LLM çıkarımı denendi) · içerik bekliyor | (yeni — doc gerekebilir) |
| **F** | SEO geçişi | blueprint var · Avensair input bekliyor | `docs/plans/seo-transition-blueprint.md` |
| **G** | Analytics / GA4 | standart var · kurulum bekliyor | `docs/standards/analytics-standard.md` |
| **H** | LLM danışman chatbot | **YENİ** — teknik satış danışmanı, tüm ürünleri bilir | (yeni) |
| **I** | Teklif hazırlama modülü | **YENİ** — LLM + şablon, ciddi zaman kazancı | (yeni) |
| **J** | CRM | **YENİ** — SaaS fazlarında vardı | `docs/plans/venthub_saas_master_roadmap.md` (ref) |
| **K** | Güvenlik / bağımlılık | audit 0 ✓ (2026-06-15) · rutin | commit `8e74d8c5` |

---

## 2. Katmanlar (öncelik)

### 🔴 P0 — Avensair teslim-blokeri (EVET'i geciktiren)
Yalnız bunlar teslimi engeller:
- **C** Bayi çekirdeği çalışır (R0-R5 onarım, en az **B2 seed**) — *asıl ürün, twin'e göre #1 açık*
- **A** Utandıran görünür bug yok
- **D** *Kabul edilebilir* performans (kritik sayfalar makul; "her yerde 90+" değil, **"utandırmayan"** yeter)
- **E** Katalogda ürün detayları (Avensair ürünlerini görsün)
- **F** SEO korunur (7-8 yıllık sıralamalar dağılmaz)
- **G** Temel analytics (ziyaretçi/dönüşüm görünür)

### 🟡 P1 — Hızlı-takip (teslimden HEMEN sonra, Avensair kullanırken)
- **H** LLM danışman chatbot (teknik satış)
- **I** Teklif hazırlama modülü
- **B** admin + legal i18n tamamlanması
- **D** Lighthouse 90+ tüm sayfalarda (cila katmanı)
- conformance Faz 2/3 (RSC build gate + render smoke + living inventory)

### ⚪ P2 — SaaS ölçek (sonra)
- **J** CRM
- Multi-tenant white-label, tenant billing (SaaS Faz 2-3 — `venthub_saas_master_roadmap.md`)

---

## 3. Açık Kararlar (girdi bekliyor)
- **Bayi kimlik ekseni (R1)** — blueprint §2 kararı (teslim öncesi netleşmeli)
- **SEO:** eski site erişimi · domain stratejisi · cutover tarihi → **Avensair input**
- **Teslim minimum kapsamı:** yukarıdaki P0 listesi onayı
- **H/I (LLM danışman + teklif):** hangi model · şablon seti · hangi faz

---

## 4. Not — Disiplin
Bu harita aynı zamanda bir öteleme-frenidir. Kapsam genişlemesi = teslimi geciktiren
mükemmelliyetçilik kalıbı (2026-06-15 değerlendirmesi). İlaç: **daha azını teslim et,
gerisini müşteriyle yap.** İlgili memory: `venthub-vision`, `dealer-pivot-decision`,
`standard-first-strategy`, `hold-full-scope`.
