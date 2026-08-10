# VentHub — SaaS Paketleme, Sahiplik & Fonlama Hazırlığı (2026-06-20)

> Tamamlayıcı doküman. **Vizyon SSOT = `VISION.md`** (yeniden yazılmaz). Bu doküman 4 şeyi toplar:
> (1) sahiplik kararı, (2) SaaS persona-paketleme modeli, (3) bulut-kredi fonlama planı, (4) başvuru hazırlık checklist'i.
> Kaynak: VISION.md (§2/§10/§12) + bulut-kredi araştırması (2026-06-20, resmi AWS/Google/Anthropic sayfaları).

---

## 1. SAHİPLİK & YAPI KARARI (kilitli)

- **VentHub = Recep'in erken-evre startup'ı.** Avensair = **ilk müşteri/kiracı**, sahip DEĞİL.
- **Gerekçe (3 kat):**
  1. **Maliyet/kontrol** — kendi adına, düşük taahhüt.
  2. **Fonlama uygunluğu (asıl sebep)** — AWS Activate / Google / Anthropic startup programları **erken-evre startup** ister (pre-Series B, <10 yıl, yeni). **Avensair köklü distribütör → GEÇMEZ.** Temiz yeni startup → geçer. Yani krediyi almak için zaten kendine açman gerek.
  3. **SaaS doğru yapısı** — platformu tek müşterinin defterine gömmezsin; platform = ürün, Avensair = referans kiracı.
- **Model (VISION §10):** Avensair'e hibrit (kurulum bedeli + aylık bakım) → sonra kirala/sat.

## 2. SaaS PERSONA-PAKETLEME (yeni çerçeve — kurucunun gözlemi)

Çekirdek = **modüler ticaret platformu** (VISION §2.4, modüler monolit). Kurucunun gözlemi: farklı kiracılar farklı modül-demeti ister → bu doğrudan **SaaS fiyat-paketi (tier)** olur:

| Paket | Aktif modüller | Kim kullanır |
|---|---|---|
| **Satış** | Katalog/PIM · Arama · Sepet · Checkout · Ödeme · Stok | sadece satış yapan firma |
| **Proje** | + Teklif/CPQ · Proje/BOM · **ESP/DW172 seçim aracı** · projelendirme çıktısı | seçim→teklif→proje yürüten |
| **Satış + Teknik Servis** | + Saha/şantiye takibi · teknik servis iş akışı · (ileride) **IoT telemetri** | uçtan uca yürüten |

> **Mekanizma — resmi SaaS roadmap'e oturur** (`docs/plans/venthub_saas_master_roadmap.md`, 4 Faz; twin'in işaret ettiği SSOT):
> - **Faz 1 (Foundation, "bitti")** feature-flags (JSONB) + `tenants` + RLS → **kiracı-başına modül aktivasyonu** (paketlerin teknik mekanizması).
> - **Faz 3 (Tenant Admin + Billing)** → persona paketleri = **abonelik plan-tier'ları** (asıl paketleme burada satılır).
> - **Faz 2 (White-Label)** → Avensair'in ihtiyacı (kendi marka/renk/**custom domain** `www.avensair.com`).
> - **Faz 4 (Marketplace + Plugin)** → çoklu satıcı/eklenti (uzun vade).
>
> ⚠️ **Önkoşul (gerçek-zemin, VISION §5 + roadmap notu):** Faz 1 izolasyonu bugün **STUB** — `tenantResolver`
> hardcoded `DEFAULT_TENANT_ID`'ye düşüyor, 3 tablo (`organizations`/`user_projects`/`project_items`) `tenant_id`'siz.
> → Gerçek multi-tenant **blueprint R4** onarımına bağlı; **paket-tier'ları ancak izolasyon ENFORCE edilince satılabilir.**

## 3. TAM YAŞAM DÖNGÜSÜ — Kuzey Yıldızı (VISION §12, IoT dahil)

`tasarım → projelendirme → ürün satışı → şantiye/saha → IoT takibi` (kendini-temizleyen ESP doluluk/temizlik telemetrisi).

- **Demir kural:** kuzey yıldızını **ANLAT** (pitch/içerik), her seferinde **TEK dilim İNŞA et** (gelir-önce).
- **IoT en son** — donanım+firmware+telemetri ops en ağır; kurulu cihaz tabanı olmadan anlamsız (monetizasyon finali, giriş değil).
- Persona paketleri = bu döngünün olgunlaşma sırası: **Satış → Proje → Servis → IoT.**

## 4. FONLAMA PLANI — bulut kredileri (araştırma 2026-06-20)

| Program | Tutar | Şirket/hızlandırıcı gerekir mi | Claude'a nasıl uygulanır |
|---|---|---|---|
| **AWS Activate Founders** | **$5.000'a kadar** (çoğu $1k) | ❌ self-serve, sadece web sitesi+domain'li mail | ✅ Bedrock'tan Claude (Nisan 2024+ 3. taraf modeller dahil) |
| **Google Cloud Startups (Bootstrap)** | ~$2.000 | ❌ self-serve | ✅ Vertex AI'dan Claude |
| **AWS Activate Portfolio** | $200.000'a kadar | ✅ Activate Provider (hızlandırıcı/VC) Org-ID'si | ✅ Bedrock |
| **Anthropic Claude for Startups** | $25.000'a kadar (1. taraf API) | ⚠️ fonlu/çekişli startup'a meyilli | ✅ doğrudan Claude Code (Bedrock'suz) |
| **Microsoft/Azure** | — | — | ❌ Claude KAPSAM DIŞI (eleme) |

- **Şirketsiz şu an alınabilir ≈ $7k** (AWS Founders + Google Bootstrap, stack'lenir) → ~1 yıl Claude Code maliyeti.
- **Kullanım:** Bedrock `eu-central-1` (Frankfurt) + `CLAUDE_CODE_USE_BEDROCK=1` → krediden Claude Code.
- **Tuzaklar:** kredilerin son-kullanma (1-2 yıl); AWS Budgets ile bütçe alarmı (aşımı karta yansır); Türkiye uygunluğu resmi sayfada açık değil → başvuruda teyit.

## 5. BAŞVURU HAZIRLIK CHECKLIST'İ (başvurudan ÖNCE — sırayla)

- [ ] **Domain** kaydı (1. tercih `venthub.com`; doluysa `.co/.app/.io`). ~$10-15/yıl.
- [ ] **Domain'li iş e-postası** (`recep@venthub.com`) — **Gmail YASAK** (1 numaralı red sebebi). Zoho Mail (ücretsiz, 1 domain) veya Google Workspace (~$6/ay).
- [ ] **Canlı web sitesi** — mevcut VentHub app'i Vercel'e deploy + custom domain (zaten Vercel stack'te). "Çalışan ürün sitesi" = en güçlü kozumuz (placeholder değil, GERÇEK).
- [ ] **AWS hesabı + ödeme kartı** (paid tier — kredi için zorunlu).
- [ ] (ops.) Google Cloud hesabı.

## 6. SIRA (de-risk)

`domain + mail + site (1-2 gün)` → `AWS Activate Founders + Google Bootstrap başvuru (5-10 iş günü)` → `onay` → `Bedrock+Claude Code kredi-bağlı`. **Paralelde** VISION §9 90-günlük ürün yol haritası (Avensair'e teslim) işler — fonlama onu bloklamaz.

> **Not (twin):** Bu doküman olgunlaşınca `.cc_docs.yaml standalone_files`'a eklenip twin'e sync'lenmeli (sonraki milestone) → "fonlama/paketleme" soruları twin'den cevaplanabilir.
