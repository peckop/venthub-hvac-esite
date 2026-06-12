# Admin Standardı — Kaynak Manifestosu

> `admin-standard.md` cetvelini besleyen otorite kaynaklar + **NotebookLM ikizine nasıl yüklenecekleri.**
> Strateji: bkz. memory `knowledge-infra-pipeline` (kaynak → MD/URL → NLM RAG).

## PDF mi? — Hayır, daha iyisi var

Bu kaynakların çoğunun resmi PDF'i **yok**; ama NLM'e PDF'ten **daha iyi** beslenir:
- **`llms.txt` / `llms-full.txt`** — modern doküman siteleri LLM için tek-dosya özet üretir. NLM'e **URL olarak** direkt eklenir.
- **Repo MD docs** — GitHub'daki `.md` dosyaları (raw URL) doğrudan eklenir.
- **Web sayfası URL'i** — NLM `source_add(type=url)` ile sayfayı kendi indeksler.

→ Yani PDF aramaya gerek yok; URL/MD yeterli ve daha temiz.

---

## A. STANDART kaynakları (cetveli besler — önce bunlar)

| # | Kaynak | Repo / URL | NLM'e en iyi giriş | Ne çıkaracağız |
|---|--------|-----------|--------------------|----------------|
| A1 | **Refine** | `github.com/refinedev/refine` · `refine.dev/docs` | `refine.dev/llms-full.txt` (URL) | access-control `can()`, `useTable`, List/Create/Edit/Show, audit-log/i18n/realtime providers, "what is an admin panel" blog |
| A2 | **Shopify Polaris** | `polaris.shopify.com/patterns` | Pattern sayfa URL'leri (Resource Index, Resource Details, App Settings, Card, Common Actions) | sayfa arketipleri + layout/UX kuralları |
| A3 | **TanStack Table** | `github.com/TanStack/table` | `raw.githubusercontent.com/TanStack/table/main/llms.txt` (URL) | data-table özellik kontratı, client/server kararı |
| A4 🔜 | **Medusa Admin** | `github.com/medusajs/medusa` (`packages/admin`) | repo MD docs + anahtar TSX | gerçek ticari admin React kalıpları (data-table, CRUD, bulk) |
| A5 🔜 | **Saleor Dashboard** | `github.com/saleor/saleor-dashboard` | repo MD docs | ikinci açık-kaynak admin (çapraz doğrulama) |

## B. ARAÇ kaynakları (uygulama fazı — standartla KARIŞTIRMA)

| # | Kaynak | URL | Not |
|---|--------|-----|-----|
| B1 | shadcn/ui | `ui.shadcn.com` | temel framework — zaten stack'te ✓ |
| B2 | shadcn-admin | `github.com/satnaing/shadcn-admin` | Tailwind+Radix admin iskelet referansı |
| B3 | Origin UI / shadcn Blocks | (mevcut `VH_Curated...` dokümanında) | bileşen/blok — standart değil, araç |

---

## Yükleme planı (öneri — onay bekliyor)

1. **A1–A3** (Refine llms, Polaris pattern URL'leri, TanStack llms) → NLM "VentHub Proje Hafizasi" ikizine ekle.
2. İkize ekledikten sonra `admin-standard.md` (bu cetvel) de ikize girsin → RAG ile "X sayfası standarda uyuyor mu?" sorulabilir.
3. A4–A5 (Medusa/Saleor kod) ikinci turda.

> **Not (gürültü kontrolü):** Tüm repoyu değil, yukarıda "ne çıkaracağız" sütunundaki **parçaları** al.
> Kalite > nicelik (NLM kaynak limiti + alaka).
