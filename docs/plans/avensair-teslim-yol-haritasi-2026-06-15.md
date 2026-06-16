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
| **B** | i18n literal göçü | kapsam-içi ✓ · **admin ✓ (master #364/#363/#365, 0 uyarı) + INV-5 kapısı ✓** · legal prose/EN açık (avukat) · ~55 rota + 17 borç-anahtar bekliyor | `docs/plans/i18n-jsx-literals-cleanup-2026-06-14.md` · `docs/legal/en-yasal-ceviri-inceleme-2026-06-16.md` |
| **C** | **Bayi modülü (çekirdek)** | **KIRIK** — R0-R5 onarım → B1-B2 inşa | `docs/standards/dealer-module-blueprint.md` · `docs/audits/dealer-data-ground-truth-2026-06-11.md` |
| **D** | Lighthouse / performans | homepage ~75 → **hedef 90+** · products/categories (3D/three.js) | `docs/audits/lighthouse_diagnostic_2026-06-10.md` |
| **E** | Ürün detayları | **altyapı hazır** (PDF + LLM çıkarımı denendi) · içerik bekliyor | (yeni — doc gerekebilir) |
| **F** | SEO geçişi (**7-8 yıllık site sıralaması** korunur) | blueprint var · Avensair input bekliyor | `docs/plans/seo-transition-blueprint.md` |
| **G** | Analytics / GA4 + **raporlama** | standart var (config + olay taksonomisi + §Raporlama) · kurulum bekliyor | `docs/standards/analytics-standard.md` |
| **H** | LLM danışman chatbot | **YENİ** — teknik satış danışmanı, tüm ürünleri bilir | (yeni) |
| **I** | Teklif hazırlama modülü | **YENİ** — LLM + şablon, ciddi zaman kazancı | (yeni) |
| **J** | CRM | **YENİ** — SaaS fazlarında vardı | `docs/plans/venthub_saas_master_roadmap.md` (ref) |
| **K** | Güvenlik / bağımlılık | audit 0 ✓ (2026-06-15) · rutin | commit `8e74d8c5` |
| **L** | **3D ürün showroom (vizyon)** | **YENİ** — kullanıcının 3D ürünlerin yanına gidip incelediği, teknik özellikleri gördüğü sanal showroom; selection→commerce köprüsü + P0 vitrin "wow". Çökmeyen 3D viewer = ÖN KOŞUL (3D crash-fix = 0. adım) | `3d-roadmap-crash-then-standards` memory · ilham: Three.js tiny-planet site |

---

## 2. Katmanlar (öncelik) — 2026-06-15 TİCARİ REVİZE

> **Revize:** Distribütörü kazandıran şey yarı-bitmiş bayi paneli değil, arzu-yaratan **VİTRİN**
> (hız+3D+LLM danışman+teklif). Bayi yönetimi = satıştan SONRA *"bunu bayilerime de yayayım"*
> diye istenecek upsell. Commerce-first tezle birebir uyumlu (çekirdek=ticaret, bayi=modül).
>
> **KRİTİK koruma:** WOW'u yaratan **H (LLM danışman)** + **I (teklif)** aynı zamanda en BÜYÜK
> yeni inşalar. Gerçek soru "hangi katman önce" değil → **"bu ikisini WOW'u bozmadan ne kadar
> İNCE MVP'ye sıkıştırırız?"** Kötü MVP'lenirse "P1 önce" = mükemmelliyetçilik tuzağı, teslim aylara kayar.

### 🔴 P0 — Avensair'i KAZANAN vitrin (teslim hedefi)
Arzu yaratan demo + onu "içi dolu" kılan enabler'lar. Her kalem **DEMO-KIVAMINDA MVP** (tam ürün değil):
- **D** Hız + 3D: vitrin sayfaları (home/products/category/ürün-detay) hızlı + çarpıcı (her yer 90+ DEĞİL)
- **H** LLM danışman — MVP: çekirdek katalogda teknik satış
- **I** Teklif modülü — MVP: temiz şablon çıktısı (tam CRM-entegre değil)
- **E** Ürün detayları — danışman+teklif için veri (PDF→LLM altyapı hazır)
- **G** Temel analytics — müşteri trafiği görünür
- **A** Utandıran bug yok · **F** SEO korunur (mevcut sıralamalar = gerçek para)

### 🟡 P1 — Satıştan SONRA (Avensair "bayilerime de yayayım" deyince)
- **C** Bayi modülü (R0-R5→B2) — artık AÇILIŞ değil **UPSELL**
- **B** admin + legal i18n · Lighthouse 90+ heryerde (cila) · conformance Faz 2/3

### ⚪ P2 — SaaS ölçek
- **J** CRM (tam) · multi-tenant white-label · billing (`venthub_saas_master_roadmap.md`)

---

## 3. Açık Kararlar (girdi bekliyor)
- **Teslim tipi:** "Avensair'i KAZANAN vitrin" mi / "1. günden ÜZERİNDE iş yapılan sistem" mi? → P0'daki ticaret-backend derinliğini belirler (vitrin=minimal sipariş, sistem=gerçek sipariş+ödeme akışı)
- **H/I MVP sınırı:** LLM danışman + teklif ne kadar ince olacak? (WOW yeter, "tam ürün" değil) — **teslim süresini esas bu belirler**
- **SEO:** eski site erişimi · domain stratejisi · cutover tarihi → **Avensair input**
- **Bayi kimlik ekseni (R1):** blueprint §2 kararı — artık **P1'de** (satış sonrası), teslim öncesi değil
- **EN yasal metin (LLM çevirisi, prod'da CANLI, avukat onaysız):** disclaimer'la mı tutalım / profesyonel çeviri mi / kaldıralım mı? + checkout onayı TR sözleşmeye bağlanmalı → **avukat girdisi bekliyor** · brief + yapılacaklar: `docs/legal/en-yasal-ceviri-inceleme-2026-06-16.md`

---

## 4. Not — Disiplin
Bu harita aynı zamanda bir öteleme-frenidir. Kapsam genişlemesi = teslimi geciktiren
mükemmelliyetçilik kalıbı (2026-06-15 değerlendirmesi). İlaç: **daha azını teslim et,
gerisini müşteriyle yap.** İlgili memory: `venthub-vision`, `dealer-pivot-decision`,
`standard-first-strategy`, `hold-full-scope`.
