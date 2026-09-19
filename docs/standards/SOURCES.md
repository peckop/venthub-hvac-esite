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

---

## C. LİSANS KAYDI (2026-09-19, Recep kararı — her kaynak için ZORUNLU)

> Kural: bu belgeye giren her kaynağın lisansı ve **kullanım biçimi** (referans/yöntem mi, kod
> mu) burada yazılır. **Kod alınıyorsa** lisans uyumluluğu (MIT/BSD/Apache → uyumlu; GPL/AGPL →
> uyumsuz, kod alınmaz; belirsiz → alınmaz) ve `NOTICE.md` satırı şarttır. Yalnız okuyup öğrenmek
> (referans) lisans yükümlülüğü doğurmaz. "Doğrulanacak" = lisans bugün ölçülmedi, kod
> alınmadan önce bakılır.

| # | Kaynak | Lisans | Kullanım | NOTICE gerekli mi |
|---|--------|--------|----------|-------------------|
| A1 | Refine | MIT | referans (desen) | hayır (kod alınmadı) |
| A2 | Shopify Polaris | MIT (kod) · belge içeriği Shopify © — **doğrulanacak** | referans (UX kalıpları) | hayır |
| A3 | TanStack Table | MIT | kod (npm bağımlılığı) | hayır (npm) |
| A4 | Medusa Admin | MIT | referans | hayır |
| A5 | Saleor Dashboard | BSD-3-Clause | referans | hayır |
| B1 | shadcn/ui | MIT | kod (bileşen temeli) | **evet** — NOTICE'ta |
| B2 | shadcn-admin | MIT | referans (iskelet) | hayır |
| B3 | Origin UI / shadcn Blocks | MIT — **doğrulanacak** (blok bazında) | araç; blok alınırsa kod | alınırsa evet |
| — | 21st.dev bileşen havuzu (2026-09-19 değerlendirmesi) | **bileşen bazında** — havuz karışık; depo MIT ama bileşenlerin kendi lisansı yok, şartlar "yazarların ve 21st Labs'in münhasır mülkiyeti" | **bileşenin KENDİ kaynağında** açık MIT/Apache/BSD ibaresi varsa kod alınır; yoksa **yalnız referans** | kod alınırsa **evet** |

### C.1 Kalıp: lisans HAVUZDA değil, BİLEŞENDE aranır (Recep kararı, 2026-09-19)

Recep'in sözü: *"önerin için ben de evet diyorum."*

Ölçüm şuydu: 21st.dev deposunun kendi lisansı MIT, ama havuzdaki bileşenlerin **tek tek** lisansı
yok ve kullanım şartları içeriğin "yazarların ve 21st Labs'in münhasır mülkiyeti" olduğunu
söylüyor. Yani **havuzun lisansı bileşenin lisansı değildir** — bu, Origin UI'da da geçerli
olan genel kalıptır ve her karışık havuz için aynı şekilde uygulanır:

1. **Kod alınacaksa** bileşenin kendi dosyasında/sayfasında açık bir MIT/Apache/BSD ibaresi
   aranır. Varsa alınır ve `NOTICE.md`'ye satır yazılır.
2. **İbare yoksa alınmaz** — yalnız bakılır, öğrenilir, kendi kodumuz yazılır. Referans lisans
   yükümlülüğü doğurmaz.
3. **Belirsizlik "muhtemelen MIT" diye çözülmez.** Depo PUBLIC; yanlış alınan kod geri alınamaz.
