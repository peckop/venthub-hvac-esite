# docs/plans — Durum İndeksi

> **Amaç:** Bu klasördeki ~40 plan/brief'in hangisi CANLI, hangisi BİTMİŞ tarihsel evrak — tek bakışta.
> Kaynak: `docs/DURUM-TAKIP.md` panosu (anlatı SSOT). Yeni plan eklerken buraya satır ekle.
> NLM ikizine yalnız **CANLI/REFERANS** satırındakiler gider (`.cc_docs.yaml standalone_files`);
> bitmiş brief'ler bilinçli olarak yüklenmez (RAG'i geçmişe kilitler).

## 🟢 CANLI (aktif iş / güncel SSOT)

| Dosya | Ne | Durum |
|---|---|---|
| `catalog-commerce-pipeline-master-2026-06-20.md` | Katalog→ticaret hattının uçtan-uca panosu | **AKTİF SSOT** — sıradaki: Kademe-2 loader |
| `product-schema-master-implementation-plan.md` | Ürün şeması 6-dalga onarım yol haritası (PS-001…046) | **AKTİF** — dalga sırası: Split-Model → fiyat motoru |
| `slug-localization-2026-08-10.md` | Dile-göre-slug mimarisi + eşleme tablosu | **UYGULANDI** (PR #455-457) — kalıcı referans |
| `avensair-teslim-yol-haritasi-2026-06-15.md` | Ticari teslim sırası (P0 vitrin → P1 bayi → P2 CRM) | **AKTİF** yol haritası |
| `seo-transition-blueprint.md` | Eski siteden sıralama-koruyan geçiş planı | **BEKLİYOR** (canlıya geçişte devreye girer) |
| `faz2-admin-backlog.md` | Admin Faz-2 açık işleri | **AÇIK** backlog |
| `i18n-jsx-literals-cleanup-2026-06-14.md` | i18n literal temizliği makinesi (Workflow+merge3+keycheck) | **KISMEN** — admin bitti; rota süpürmesi + bayi kaldı |

## 📘 REFERANS (strateji/sözleşme — iş değil)

| Dosya | Ne |
|---|---|
| `venthub_saas_master_roadmap.md` | 4-fazlı SaaS ana yol haritası |
| `saas-funding-and-packaging-2026-06.md` | SaaS paketleme + fonlama hazırlığı |
| `faz0-kit-contract-2026-06-13.md` | DataTableKit arayüz sözleşmesi (kit yaşadıkça geçerli) |

## ✅ BİTTİ (tarihsel evrak — iş master'da, brief arşivlik)

| Dosya | Kapanış |
|---|---|
| `j1…j16-*-brief.md` (16 dosya) | Admin DataTableKit göçü + cila dalgaları — TÜMÜ merged (#387, #398-404, #408-421; pano: Controller #1 şeridi) |
| `admin-page-rewrites-brief.md` · `admin-cila-fan-out-2026-06-19.md` | §8 rewrite + cila dalgaları — merged |
| `admin-shell-e1-command-palette-brief.md` · `admin-shell-e2-notification-inbox-brief.md` | E1 #408 · E2 `49c9ca84` — merged |
| `admin-enterprise-roadmap-2026-06-13.md` | Yerini 06-17/06-18 cetvel skorlarına bıraktı (`docs/audits/`) |
| `3d-migration-waves-2026-06-17.md` · `3d-wave3-models-brief.md` | 3D conformance dalgaları bitti (görsel faz ayrı, pano: Controller #2) |
| `faz1-migration-playbook-2026-06-13.md` · `faz1-remaining-divided-2026-06-13.md` | Faz-1 kit göçü 9/9 bitti |
| `product-schema-standard-brief.md` | Ürünü (`docs/standards/product-schema-standard.md`) yazıldı |
| `venthub_hvac_unified_refactor_plan.md` · `venthub_saas_faz1_prompt.md` | Erken dönem planları — sonraki plan/cetvellerce kapsandı |
| `i18n-jsx-literals-cleanup` altındaki `j2` bağlantılı işler | (üstteki KISMEN satırına bakın) |

## ⚠️ ÖZEL DURUM

| Dosya | Not |
|---|---|
| `hvac_relations_migration_plan.md` | **Git'te YOK** (untracked, NLM danışman çıktısı yapıştırması). İçeriği `product-schema-master-implementation-plan.md` çapraz-doğrulamayla kapsadı → ya sil ya `docs/archive/`e commit'le. |
| `014-kategori-ssr-plan.md` vb. | Eski planların bir kısmı zaten `docs/archive/`te — yeni arşivlikler de oraya taşınabilir (link kırma riski nedeniyle taşıma ayrı/bilinçli iş). |
