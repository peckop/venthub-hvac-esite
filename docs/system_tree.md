# VENTHUB HVAC SYSTEM ARCHITECTURE TREE

---
project_name: venthub-hvac
compiled_at: 2026-08-17T11:53:18.194976+00:00
standard: Enterprise-Ready (5N1K + Axioms)
---

Bu belge, otonom derleyici tarafından 2026-08-17T11:53:18.194976+00:00 tarihinde sistemdeki kaynak kod dosyalarının (.py/.ts/.tsx/.js/.jsx) eşleşen `.md` (mimari dokümantasyon) dosyalarına sahip olup olmadığını göstermek amacıyla otonom olarak derlenmiştir.

## Dokümantasyon Durumu
```text
📂 venthub-hvac/
├── 📂 ** .agents/**
│   └── 📂 **explorer_m4_1_gen2/**
│       └── ⚠️ `handoff.md`
├── ⚪ `CHANGELOG.md`
├── ⚪ `CLAUDE.md`
├── ⚪ `CONTEXT.md`
├── ⚠️ `ORIGINAL_REQUEST.md`
├── ⚪ `PROJECT.md`
├── ⚪ `README.md`
├── ⚪ `RECOMMENDATIONS.md`
├── ⚠️ `TEST_INFRA.md`
├── ⚠️ `TEST_READY.md`
├── ⚪ `VISION.md`
├── 📂 **cache/**
├── 📂 **docs/**
│   ├── ⚪ `DURUM-TAKIP.md`
│   ├── ⚪ `README.md`
│   ├── 📂 **archive/**
│   │   ├── ⚪ `014-kategori-ssr-plan.md`
│   │   ├── ⚪ `JULES_PROMPT.md`
│   │   ├── ⚪ `NEXT_STEPS.md`
│   │   ├── ⚪ `VENTHUB_ULTIMATE_PROMPT.md`
│   │   ├── ⚪ `WARP.md`
│   │   ├── ⚪ `ajanlar_ve_karmasa_3d_carousel_casestudy.md`
│   │   ├── ⚪ `architectural_vision.md`
│   │   ├── ⚪ `changelog_2025_legacy.md`
│   │   ├── 📂 **db-backup-pre-kademe2/**
│   │   ├── ⚪ `legacy-vite-seo-report.md`
│   │   ├── ⚪ `legacy_homepage_enhancements_2025.md`
│   │   ├── ⚪ `legacy_smart_routing_plan.md`
│   │   ├── ⚪ `plan-and-tasklist-current.md`
│   │   ├── ⚪ `plan-and-tasklist.md`
│   │   └── ⚪ `project_state_and_skills_audit.md`
│   ├── 📂 **audits/**
│   │   ├── ⚪ `3d-surfaces-audit-2026-06-16.md`
│   │   ├── ⚪ `admin-cetvel-scores-2026-06-13.md`
│   │   ├── ⚪ `admin-cetvel-scores-2026-06-17.md`
│   │   ├── ⚪ `admin-cetvel-scores-2026-06-18.md`
│   │   ├── ⚪ `admin-panel-audit-2026-06-11.md`
│   │   ├── ⚪ `canliya-alma-hazirlik-2026-08-15.md`
│   │   ├── ⚪ `dealer-data-ground-truth-2026-06-11.md`
│   │   ├── ⚪ `legal-i18n-scope-antigravity-2026-06-16.md`
│   │   ├── ⚪ `lighthouse_diagnostic_2026-06-10.md`
│   │   ├── ⚪ `odeme-yolu-denetimi-2026-08-15.md`
│   │   ├── ⚪ `operasyon-dongusu-denetimi-2026-08-15.md`
│   │   ├── ⚪ `product-schema-ground-truth-2026-06-21.md`
│   │   ├── ⚪ `render-stratejisi-denetimi-2026-08-16.md`
│   │   ├── ⚪ `secret-exposure-audit-2026-08-15.md`
│   │   ├── ⚪ `vibe-coding-20-madde-denetimi-2026-08-13.md`
│   │   ├── ⚪ `vibe-coding-20-madde-v2-2026-08-16.md`
│   │   └── ⚪ `yetki-katmani-denetimi-2026-08-15.md`
│   ├── ⚪ `database_schema_master.md`
│   ├── ⚪ `design_system_config.md`
│   ├── 📂 **legal/**
│   │   └── ⚪ `en-yasal-ceviri-inceleme-2026-06-16.md`
│   ├── 📂 **plans/**
│   │   ├── ⚪ `3d-migration-waves-2026-06-17.md`
│   │   ├── ⚪ `3d-wave3-models-brief.md`
│   │   ├── ⚪ `README.md`
│   │   ├── ⚪ `admin-cila-fan-out-2026-06-19.md`
│   │   ├── ⚪ `admin-enterprise-roadmap-2026-06-13.md`
│   │   ├── ⚪ `admin-page-rewrites-brief.md`
│   │   ├── ⚪ `admin-shell-e1-command-palette-brief.md`
│   │   ├── ⚪ `admin-shell-e2-notification-inbox-brief.md`
│   │   ├── ⚪ `avensair-teslim-yol-haritasi-2026-06-15.md`
│   │   ├── ⚪ `catalog-commerce-pipeline-master-2026-06-20.md`
│   │   ├── ⚪ `f5b-family-architecture-plan.md`
│   │   ├── ⚪ `faz0-kit-contract-2026-06-13.md`
│   │   ├── ⚪ `faz1-migration-playbook-2026-06-13.md`
│   │   ├── ⚪ `faz1-remaining-divided-2026-06-13.md`
│   │   ├── ⚪ `faz2-admin-backlog.md`
│   │   ├── ⚪ `fiyat-motoru-plan-2026-08-13.md`
│   │   ├── ⚪ `i18n-jsx-literals-cleanup-2026-06-14.md`
│   │   ├── ⚪ `j1-dashboard-data-brief.md`
│   │   ├── ⚪ `j10-inventorysettings-refactor-brief.md`
│   │   ├── ⚪ `j11-ordersboard-refactor-brief.md`
│   │   ├── ⚪ `j12-logistics-refactor-brief.md`
│   │   ├── ⚪ `j13-inventoryreport-refactor-brief.md`
│   │   ├── ⚪ `j14-inventory-kit-brief.md`
│   │   ├── ⚪ `j15-cila-group-a-brief.md`
│   │   ├── ⚪ `j16-cila-group-b-brief.md`
│   │   ├── ⚪ `j2-settings-i18n-brief.md`
│   │   ├── ⚪ `j3-csv-export-pair-brief.md`
│   │   ├── ⚪ `j4-orders-refactor-brief.md`
│   │   ├── ⚪ `j5-categories-refactor-brief.md`
│   │   ├── ⚪ `j6-users-refactor-brief.md`
│   │   ├── ⚪ `j7-returns-refactor-brief.md`
│   │   ├── ⚪ `j8-coupons-refactor-brief.md`
│   │   ├── ⚪ `j9-categorybuilder-refactor-brief.md`
│   │   ├── ⚪ `kademe2-clean-rebuild-2026-08-11.md`
│   │   ├── ⚪ `product-schema-master-implementation-plan.md`
│   │   ├── ⚪ `product-schema-standard-brief.md`
│   │   ├── ⚪ `saas-funding-and-packaging-2026-06.md`
│   │   ├── ⚪ `seo-transition-blueprint.md`
│   │   ├── ⚪ `slug-localization-2026-08-10.md`
│   │   ├── ⚪ `tenant-id-hardening-2026-08-15.md`
│   │   ├── ⚪ `venthub_hvac_unified_refactor_plan.md`
│   │   ├── ⚪ `venthub_saas_faz1_prompt.md`
│   │   └── ⚪ `venthub_saas_master_roadmap.md`
│   ├── 📂 **products/**
│   │   ├── ⚪ `AIR_DOOR_AD_900_MASTER.md`
│   │   └── ⚪ `AIR_DOOR_AD_900_SEO.md`
│   ├── 📂 **reference/**
│   │   ├── 📂 **supabase/**
│   │   │   ├── ⚪ `auth-hooks.md`
│   │   │   ├── ⚪ `custom-claims-and-role-based-access-control-rbac.md`
│   │   │   ├── ⚪ `realtime-authorization.md`
│   │   │   └── ⚪ `row-level-security.md`
│   │   └── ⚪ `vortice_catalogs.md`
│   ├── 📂 **screenshots/**
│   │   └── ⚪ `README.md`
│   ├── 📂 **standards/**
│   │   ├── ⚪ `3d-scene-lighting-research.md`
│   │   ├── ⚪ `3d-showroom-ux-research.md`
│   │   ├── ⚪ `3d-webgl-standard.md`
│   │   ├── ⚪ `SOURCES.md`
│   │   ├── ⚪ `admin-capabilities.md`
│   │   ├── ⚪ `admin-design-standard.md`
│   │   ├── ⚪ `admin-standard.md`
│   │   ├── ⚪ `analytics-standard.md`
│   │   ├── ⚪ `auth-account-standard.md`
│   │   ├── ⚪ `catalog-ingestion-standard.md`
│   │   ├── ⚪ `category-taxonomy-standard.md`
│   │   ├── ⚪ `collaboration-protocol.md`
│   │   ├── ⚪ `csv-import-export-standard.md`
│   │   ├── ⚪ `customer-account-standard.md`
│   │   ├── ⚪ `dealer-module-blueprint.md`
│   │   ├── ⚪ `dealer-network-standard.md`
│   │   ├── ⚪ `edge-function-security-standard.md`
│   │   ├── ⚪ `i18n-localization-standard.md`
│   │   ├── ⚪ `legal-compliance-standard.md`
│   │   ├── ⚪ `migration-safety-standard.md`
│   │   ├── ⚪ `multi-session-coordination-standard.md`
│   │   ├── ⚪ `pricing-standard.md`
│   │   ├── ⚪ `product-schema-standard.md`
│   │   ├── ⚪ `purchasing-standard.md`
│   │   ├── ⚪ `quote-standard.md`
│   │   ├── ⚪ `rendering-cache-standard.md`
│   │   ├── ⚪ `storefront-design-standard.md`
│   │   ├── ⚪ `storefront-reflow-standard.md`
│   │   └── ⚪ `work-tracking-ssot-standard.md`
│   ├── ⚪ `supabase_functions_master.md`
│   ├── ⚪ `system_tree.md`
│   ├── ⚪ `venthub_hvac_master.md`
│   └── ⚪ `venthub_skills_master.md`
├── 📂 **e2e/**
│   ├── ✅ `admin-smoke.e2e.ts`
│   ├── ✅ `checkout-smoke.e2e.ts`
│   └── ❌ `reflow.e2e.ts`
├── 📂 **explorer_m2_3/**
│   └── ⚠️ `analysis.md`
├── ⚠️ `implementation_plan.md`
├── 📂 **memory-engine/**
│   └── ⚪ `README.md`
├── ⚠️ `next.config.md`
├── ✅ `playwright.config.ts`
├── ✅ `sentry.client.config.ts`
├── ✅ `sentry.edge.config.ts`
├── ✅ `sentry.server.config.ts`
├── 📂 **src/**
│   ├── 📂 **app/**
│   │   ├── 📂 **[lang]/**
│   │   │   ├── 📂 **about/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **account/**
│   │   │   │   ├── 📂 **addresses/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **favorites/**
│   │   │   │   │   └── ❌ `page.tsx`
│   │   │   │   ├── 📂 **invoices/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── ✅ `layout.tsx`
│   │   │   │   ├── 📂 **orders/**
│   │   │   │   │   ├── 📂 **detail/**
│   │   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── ✅ `page.tsx`
│   │   │   │   ├── 📂 **profile/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **projects/**
│   │   │   │   │   └── ❌ `page.tsx`
│   │   │   │   ├── 📂 **quotes/**
│   │   │   │   │   ├── 📂 **detail/**
│   │   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **returns/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **security/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   └── 📂 **shipments/**
│   │   │   │       └── ✅ `page.tsx`
│   │   │   ├── 📂 **auth/**
│   │   │   │   ├── 📂 **callback/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **forgot-password/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **login/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **register/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   └── 📂 **reset-password/**
│   │   │   │       └── ❌ `page.tsx`
│   │   │   ├── 📂 **brands/**
│   │   │   │   ├── 📂 **[slug]/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **cart/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **category/**
│   │   │   │   └── 📂 **[categorySlug]/**
│   │   │   │       ├── 📂 **[subCategorySlug]/**
│   │   │   │       │   └── ✅ `page.tsx`
│   │   │   │       └── ✅ `page.tsx`
│   │   │   ├── 📂 **checkout/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **contact/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **destek/**
│   │   │   │   ├── 📂 **garanti-servis/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **hesaplayicilar/**
│   │   │   │   │   ├── 📂 **hava-perdesi/**
│   │   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   │   ├── 📂 **hrv/**
│   │   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   │   ├── 📂 **jet-fan/**
│   │   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   │   └── 📂 **kanal/**
│   │   │   │   │       └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **iade-degisim/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **konular/**
│   │   │   │   │   └── 📂 **[slug]/**
│   │   │   │   │       └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **merkez/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **sss/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   └── 📂 **teslimat-kargo/**
│   │   │   │       └── ✅ `page.tsx`
│   │   │   ├── ✅ `layout.tsx`
│   │   │   ├── 📂 **legal/**
│   │   │   │   ├── 📂 **cerez-politikasi/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **gizlilik-politikasi/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **kullanim-kosullari/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **kvkk/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **mesafeli-satis-sozlesmesi/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   └── 📂 **on-bilgilendirme-formu/**
│   │   │   │       └── ✅ `page.tsx`
│   │   │   ├── ✅ `page.tsx`
│   │   │   ├── 📂 **payment-success/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   └── 📂 **products/**
│   │   │       ├── 📂 **[slug]/**
│   │   │       │   └── ✅ `page.tsx`
│   │   │       └── ✅ `page.tsx`
│   │   ├── 📂 **_components/**
│   │   │   └── ✅ `ProductDetailPageView.tsx`
│   │   ├── 📂 **admin/**
│   │   │   ├── 📂 **audit-logs/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **categories/**
│   │   │   │   ├── 📂 **[id]/**
│   │   │   │   │   └── 📂 **builder/**
│   │   │   │   │       └── ✅ `page.tsx`
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **coupons/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **error-groups/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **errors/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **inventory/**
│   │   │   │   ├── ✅ `page.tsx`
│   │   │   │   ├── 📂 **report/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   └── 📂 **settings/**
│   │   │   │       └── ✅ `page.tsx`
│   │   │   ├── ✅ `layout.tsx`
│   │   │   ├── 📂 **logistics/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **movements/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **orders/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── ✅ `page.tsx`
│   │   │   ├── 📂 **pricing/**
│   │   │   │   ├── ✅ `page.tsx`
│   │   │   │   ├── 📂 **preview/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   └── 📂 **rules/**
│   │   │   │       └── ✅ `page.tsx`
│   │   │   ├── 📂 **products/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **purchasing/**
│   │   │   │   └── ❌ `page.tsx`
│   │   │   ├── 📂 **quotes/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **returns/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **settings/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **users/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   └── 📂 **webhook-events/**
│   │   │       └── ✅ `page.tsx`
│   │   ├── 📂 **api/**
│   │   │   ├── 📂 **health/**
│   │   │   │   └── ✅ `route.ts`
│   │   │   └── 📂 **webhook/**
│   │   │       └── 📂 **supabase/**
│   │   │           └── ✅ `route.ts`
│   │   ├── 📂 **auth/**
│   │   │   ├── 📂 **callback/**
│   │   │   │   └── ❌ `route.ts`
│   │   │   └── 📂 **signout/**
│   │   │       └── ✅ `route.ts`
│   │   ├── ✅ `layout.tsx`
│   │   ├── ✅ `robots.ts`
│   │   └── ✅ `sitemap.ts`
│   ├── 📂 **assets/**
│   │   └── 📂 **images/**
│   ├── 📂 **components/**
│   │   ├── ✅ `AddToCartToast.tsx`
│   │   ├── ✅ `AddToCartToastContent.tsx`
│   │   ├── ✅ `BackToTopButton.tsx`
│   │   ├── ✅ `BeforeAfterSlider.tsx`
│   │   ├── ✅ `BrandsShowcase.tsx`
│   │   ├── ✅ `BuildTag.tsx`
│   │   ├── ✅ `CaseStudySection.tsx`
│   │   ├── ✅ `ErrorBoundary.tsx`
│   │   ├── ✅ `Footer.tsx`
│   │   ├── ✅ `HVACIcons.tsx`
│   │   ├── ✅ `ImageGallery.tsx`
│   │   ├── ✅ `InViewCounter.tsx`
│   │   ├── ✅ `LanguageSwitcher.tsx`
│   │   ├── ✅ `LazyInView.tsx`
│   │   ├── ✅ `LeadModal.tsx`
│   │   ├── ✅ `LoadingSpinner.tsx`
│   │   ├── ✅ `MagneticCTA.tsx`
│   │   ├── ✅ `MegaMenu.tsx`
│   │   ├── ✅ `PaymentWatcher.tsx`
│   │   ├── ✅ `ProductCard.tsx`
│   │   ├── ✅ `QuickViewModal.tsx`
│   │   ├── ✅ `ScrollLinkedProcess.tsx`
│   │   ├── ✅ `ScrollReveal.tsx`
│   │   ├── ✅ `ScrollToTop.tsx`
│   │   ├── ✅ `SearchOverlay.tsx`
│   │   ├── ✅ `SecurityRibbon.tsx`
│   │   ├── ✅ `Seo.tsx`
│   │   ├── ✅ `SpotlightHeroOverlay.tsx`
│   │   ├── ✅ `StickyHeader.tsx`
│   │   ├── ✅ `TiltCard.tsx`
│   │   ├── ✅ `UndecidedUserCTA.tsx`
│   │   ├── ✅ `VisualShowcase.tsx`
│   │   ├── ✅ `WhatsAppFloat.tsx`
│   │   ├── 📂 **admin/**
│   │   │   ├── ✅ `AccessDenied.tsx`
│   │   │   ├── ✅ `AdminEmptyState.tsx`
│   │   │   ├── ✅ `AdminRealtimeNotifications.tsx`
│   │   │   ├── ✅ `AdminSkeleton.tsx`
│   │   │   ├── ✅ `AdminToolbar.tsx`
│   │   │   ├── ✅ `ColumnsMenu.tsx`
│   │   │   ├── ✅ `CommandPalette.tsx`
│   │   │   ├── ✅ `DateRangePicker.tsx`
│   │   │   ├── ✅ `EditableCell.tsx`
│   │   │   ├── ✅ `ExportMenu.tsx`
│   │   │   ├── ✅ `InfoTooltip.tsx`
│   │   │   ├── ✅ `InventoryCsvImport.tsx`
│   │   │   ├── ✅ `InventoryDetailDrawer.tsx`
│   │   │   ├── ✅ `InventoryMovementHistory.tsx`
│   │   │   ├── ✅ `InventoryQrLabel.tsx`
│   │   │   ├── ✅ `InventoryReservedTable.tsx`
│   │   │   ├── ✅ `InventoryStockAdjust.tsx`
│   │   │   ├── ✅ `InventoryTable.tsx`
│   │   │   ├── ✅ `JsonDiffViewer.tsx`
│   │   │   ├── 📂 **authority-builder/**
│   │   │   │   ├── ✅ `AuthorityBuilder.tsx`
│   │   │   │   └── ✅ `BlockEditor.tsx`
│   │   │   ├── 📂 **categories/**
│   │   │   │   └── ✅ `CategoryFormModal.tsx`
│   │   │   ├── 📂 **dashboard/**
│   │   │   │   ├── ✅ `AbcPieChart.tsx`
│   │   │   │   ├── ✅ `ActivityHeatmap.tsx`
│   │   │   │   ├── ✅ `RecentOrdersTable.tsx`
│   │   │   │   ├── ✅ `SalesChart.tsx`
│   │   │   │   └── ✅ `StatCard.tsx`
│   │   │   ├── 📂 **data-table/**
│   │   │   │   ├── ✅ `BulkBar.tsx`
│   │   │   │   ├── ✅ `BulkPricePanel.tsx`
│   │   │   │   ├── ✅ `BulkRolePanel.tsx`
│   │   │   │   ├── ✅ `DataTableHead.tsx`
│   │   │   │   ├── ✅ `DataTableKit.tsx`
│   │   │   │   ├── ✅ `FacetedFilter.tsx`
│   │   │   │   ├── ✅ `persist.ts`
│   │   │   │   └── ✅ `types.ts`
│   │   │   ├── 📂 **orders/**
│   │   │   │   └── ✅ `OrderFormModal.tsx`
│   │   │   ├── 📂 **overlay/**
│   │   │   │   ├── ✅ `AdminModal.tsx`
│   │   │   │   ├── ✅ `AdminSidePanel.tsx`
│   │   │   │   └── ✅ `ConfirmProvider.tsx`
│   │   │   ├── 📂 **pricing/**
│   │   │   │   ├── ✅ `CostRefreshModal.tsx`
│   │   │   │   ├── ✅ `CurrencyRatesCard.tsx`
│   │   │   │   ├── ✅ `MaterializePricesModal.tsx`
│   │   │   │   ├── ✅ `PricingRuleFormModal.tsx`
│   │   │   │   ├── ✅ `PricingSettingsFormModal.tsx`
│   │   │   │   └── ✅ `RuleScopeTargetPicker.tsx`
│   │   │   ├── 📂 **products/**
│   │   │   │   ├── ✅ `ProductCsvImport.tsx`
│   │   │   │   ├── ✅ `ProductFormModal.tsx`
│   │   │   │   └── ✅ `ProductHealthBadge.tsx`
│   │   │   ├── 📂 **purchasing/**
│   │   │   │   └── ❌ `CreatePurchaseOrderPanel.tsx`
│   │   │   ├── 📂 **settings/**
│   │   │   │   └── ✅ `SettingsFormModal.tsx`
│   │   │   └── 📂 **shell/**
│   │   │       ├── ✅ `AdminPageHeader.tsx`
│   │   │       ├── ✅ `AdminSidebar.tsx`
│   │   │       ├── ✅ `AdminThemeToggle.tsx`
│   │   │       ├── ✅ `navCookie.ts`
│   │   │       └── ✅ `themeCookie.ts`
│   │   ├── 📂 **analytics/**
│   │   │   └── ❌ `ConsentGatedAnalytics.tsx`
│   │   ├── 📂 **authority/**
│   │   │   ├── ✅ `AuthorityRenderer.tsx`
│   │   │   ├── ⚪ `README.md`
│   │   │   ├── ✅ `TechnicalDrawingAuthority.tsx`
│   │   │   ├── ✅ `ThreeDAuthority.tsx`
│   │   │   └── ✅ `VideoAuthority.tsx`
│   │   ├── 📂 **calculators/**
│   │   │   ├── ✅ `CalculatorLayout.tsx`
│   │   │   ├── ✅ `InputField.tsx`
│   │   │   ├── ✅ `ResultCard.tsx`
│   │   │   └── ✅ `StepIndicator.tsx`
│   │   ├── 📂 **category/**
│   │   │   ├── ✅ `CategoryAuthoritySection.tsx`
│   │   │   ├── ✅ `CategoryFilters.tsx`
│   │   │   ├── ✅ `CategoryHero.tsx`
│   │   │   ├── ✅ `CategoryShowcase.tsx`
│   │   │   ├── ✅ `EducationalGuide.tsx`
│   │   │   ├── ✅ `EnhancedNeedsWizard.tsx`
│   │   │   ├── ✅ `NeedsAnalysisWizard.tsx`
│   │   │   └── 📂 **sections/**
│   │   │       ├── ✅ `BottomCTA.tsx`
│   │   │       ├── ✅ `FAQ.tsx`
│   │   │       ├── ✅ `HowItWorks.tsx`
│   │   │       ├── ✅ `ProblemSection.tsx`
│   │   │       ├── ✅ `TrustSignals.tsx`
│   │   │       ├── ✅ `TypeComparison.tsx`
│   │   │       ├── ✅ `VorticeBrand.tsx`
│   │   │       └── 📂 **silent-fan/**
│   │   │           ├── ✅ `SilentFanFAQ.tsx`
│   │   │           ├── ✅ `SilentFanHowItWorks.tsx`
│   │   │           ├── ✅ `SilentFanProblem.tsx`
│   │   │           ├── ✅ `SilentFanTypeComparison.tsx`
│   │   │           └── ✅ `SilentFanVorticeBrand.tsx`
│   │   ├── 📂 **consent/**
│   │   │   └── ❌ `CookiePreferencesButton.tsx`
│   │   ├── 📂 **home/**
│   │   │   ├── ✅ `ApplicationSolutions.tsx`
│   │   │   ├── ✅ `CinematicProductShowcase.tsx`
│   │   │   ├── ✅ `ClientLeadButton.tsx`
│   │   │   ├── ✅ `FeaturedCommercialBlocks.tsx`
│   │   │   ├── ✅ `GuidedCategoryDiscovery.tsx`
│   │   │   ├── ✅ `HomePageClientWrapper.tsx`
│   │   │   ├── ✅ `HomeSinevizyon.tsx`
│   │   │   ├── ✅ `KnowledgeBlock.tsx`
│   │   │   ├── ✅ `RevealSection.tsx`
│   │   │   ├── ✅ `StrategicBrands.tsx`
│   │   │   └── ✅ `TrustProofSection.tsx`
│   │   ├── 📂 **layout/**
│   │   │   ├── ✅ `ClientLayout.tsx`
│   │   │   ├── ✅ `CookieConsent.tsx`
│   │   │   ├── ✅ `MainLayout.tsx`
│   │   │   └── ✅ `PageShell.tsx`
│   │   ├── 📂 **navigation/**
│   │   │   ├── ✅ `Breadcrumb.tsx`
│   │   │   ├── ✅ `CategoryHubOverlay.tsx`
│   │   │   ├── ✅ `EliteMegaMenu.tsx`
│   │   │   ├── ✅ `MegaMenu3DBackground.tsx`
│   │   │   ├── ✅ `NavActionButton.tsx`
│   │   │   ├── ✅ `NavBrand.tsx`
│   │   │   ├── ✅ `NavPrimaryRail.tsx`
│   │   │   ├── ✅ `NavSearchTrigger.tsx`
│   │   │   ├── ✅ `NavSecondaryRail.tsx`
│   │   │   ├── ✅ `NavShell.tsx`
│   │   │   └── ✅ `NavUtilityRail.tsx`
│   │   ├── 📂 **product/**
│   │   │   └── ✅ `ProductSmartInference.tsx`
│   │   ├── 📂 **products/**
│   │   │   ├── 📂 **3d/**
│   │   │   │   ├── ✅ `AutoCenter.tsx`
│   │   │   │   ├── ✅ `Product3DViewer.tsx`
│   │   │   │   ├── ✅ `ProductModelRenderer.tsx`
│   │   │   │   ├── ✅ `SmartCenterScale.tsx`
│   │   │   │   ├── 📂 **core/**
│   │   │   │   │   ├── ✅ `ContextLossRecovery.tsx`
│   │   │   │   │   ├── ✅ `ResilientCanvasBoundary.tsx`
│   │   │   │   │   ├── ✅ `SceneLightingRig.tsx`
│   │   │   │   │   ├── ✅ `VentHubCanvas.tsx`
│   │   │   │   │   ├── ✅ `assetRegistry.ts`
│   │   │   │   │   ├── ✅ `disposeSceneObject.ts`
│   │   │   │   │   ├── ✅ `tenantScene.tsx`
│   │   │   │   │   └── ✅ `useDeviceDpr.ts`
│   │   │   │   ├── 📂 **factory/**
│   │   │   │   │   ├── ✅ `Assembler.tsx`
│   │   │   │   │   ├── ✅ `VorticeLineoModel.tsx`
│   │   │   │   │   ├── 📂 **blueprints/**
│   │   │   │   │   └── 📂 **parts/**
│   │   │   │   │       ├── ✅ `BoxAndBase.tsx`
│   │   │   │   │       ├── ✅ `GreenClamps.tsx`
│   │   │   │   │       ├── ✅ `InternalFanRotor.tsx`
│   │   │   │   │       └── ✅ `MainChassis.tsx`
│   │   │   │   ├── 📂 **materials/**
│   │   │   │   │   └── ✅ `useFanMaterials.ts`
│   │   │   │   ├── 📂 **parts/**
│   │   │   │   │   ├── ✅ `Housing.tsx`
│   │   │   │   │   ├── ✅ `Impeller.tsx`
│   │   │   │   │   ├── ✅ `Motor.tsx`
│   │   │   │   │   └── ✅ `Silencer.tsx`
│   │   │   │   └── 📂 **types/**
│   │   │   │       ├── ✅ `AccessoryModel.tsx`
│   │   │   │       ├── ✅ `AirCurtainModel.tsx`
│   │   │   │       ├── ✅ `AirPurifierModel.tsx`
│   │   │   │       ├── ✅ `AxialFanModel.tsx`
│   │   │   │       ├── ✅ `CentrifugalFanModel.tsx`
│   │   │   │       ├── ✅ `DehumidifierModel.tsx`
│   │   │   │       ├── ✅ `DomesticFanModel.tsx`
│   │   │   │       ├── ✅ `DuctFanModel.tsx`
│   │   │   │       ├── ✅ `ExproofFanModel.tsx`
│   │   │   │       ├── ✅ `FlexibleDuctModel.tsx`
│   │   │   │       ├── ✅ `HRVModel.tsx`
│   │   │   │       ├── ✅ `JetFanModel.tsx`
│   │   │   │       ├── ✅ `NicotraFanModel.tsx`
│   │   │   │       ├── ✅ `PlugFanModel.tsx`
│   │   │   │       ├── ✅ `RoofFanModel.tsx`
│   │   │   │       ├── ✅ `RoundDuctFanModel.tsx`
│   │   │   │       ├── ✅ `SilentChannelFanModel.tsx`
│   │   │   │       ├── ✅ `SmokeExhaustFanModel.tsx`
│   │   │   │       ├── ✅ `SnailFanModel.tsx`
│   │   │   │       ├── ✅ `SpeedControlModel.tsx`
│   │   │   │       └── ✅ `WallMountedCompactFanModel.tsx`
│   │   │   ├── ✅ `AddToProjectModal.tsx`
│   │   │   ├── ✅ `BentPlaneGeometry.tsx`
│   │   │   ├── ✅ `BlueprintCanvas.tsx`
│   │   │   ├── ✅ `Category3DIcon.tsx`
│   │   │   ├── ✅ `CategoryOrbitCarousel.tsx`
│   │   │   ├── ✅ `FamilyCard.tsx`
│   │   │   ├── ✅ `InfiniteProductsShowcase.tsx`
│   │   │   ├── ✅ `OrbitalProductsShowcase.tsx`
│   │   │   ├── ✅ `ProductsHero.tsx`
│   │   │   ├── ✅ `ProductsSkeleton.tsx`
│   │   │   ├── ✅ `RadialActionMenu.tsx`
│   │   │   ├── ✅ `RichTextRenderer.tsx`
│   │   │   ├── ❌ `VariantSelector.tsx`
│   │   │   └── 📂 **visual-models/**
│   │   ├── 📂 **quotes/**
│   │   │   ├── ✅ `QuoteRequestButton.tsx`
│   │   │   └── ✅ `QuoteRequestModal.tsx`
│   │   └── 📂 **ui/**
│   │       ├── ❌ `Pagination.tsx`
│   │       ├── ✅ `ScrollObserver.tsx`
│   │       ├── ✅ `Skeleton.tsx`
│   │       └── ✅ `VentImage.tsx`
│   ├── 📂 **config/**
│   │   ├── ✅ `admin-resources.ts`
│   │   ├── ✅ `admin.ts`
│   │   ├── ✅ `applications.ts`
│   │   ├── ✅ `legal.ts`
│   │   ├── ✅ `orbitalCarouselConfig.ts`
│   │   └── ✅ `siteUrl.ts`
│   ├── 📂 **contexts/**
│   │   ├── ✅ `AuthContext.tsx`
│   │   ├── ✅ `AuthContextDefinition.ts`
│   │   ├── ✅ `CartContext.tsx`
│   │   ├── ✅ `CartProvider.tsx`
│   │   ├── ✅ `CategoryContext.tsx`
│   │   ├── ✅ `ProjectContext.tsx`
│   │   └── ✅ `ProjectProvider.tsx`
│   ├── 📂 **data/**
│   │   └── ✅ `brands.ts`
│   ├── 📂 **design-system/**
│   │   └── ✅ `tokens.js`
│   ├── 📂 **hooks/**
│   │   ├── ✅ `use-mobile.tsx`
│   │   ├── ✅ `useAdminTable.ts`
│   │   ├── ✅ `useApiCall.ts`
│   │   ├── ✅ `useAuth.ts`
│   │   ├── ✅ `useCartHook.ts`
│   │   ├── ✅ `useCategoryGateway.ts`
│   │   ├── ✅ `useCategoryViewModel.ts`
│   │   ├── ✅ `useCheckoutCoupon.ts`
│   │   ├── ✅ `useCheckoutOrchestrator.ts`
│   │   ├── ✅ `useCheckoutPayment.ts`
│   │   ├── ✅ `useDragScroll.ts`
│   │   ├── ❌ `useFavorites.ts`
│   │   ├── ✅ `useHideOnScroll.ts`
│   │   ├── ✅ `useInventoryDetail.ts`
│   │   ├── ✅ `useIsMounted.ts`
│   │   ├── ✅ `useLocalizedRoutes.ts`
│   │   ├── ✅ `useManualScrollRestoration.ts`
│   │   ├── ✅ `useNavigationState.ts`
│   │   ├── ✅ `useProjectLists.ts`
│   │   ├── ✅ `useRole.ts`
│   │   ├── ✅ `useScrollAnimation.ts`
│   │   ├── ✅ `useScrollThrottle.tsx`
│   │   ├── ✅ `useSettings.ts`
│   │   └── ✅ `useTenant.tsx`
│   ├── 📂 **i18n/**
│   │   ├── ✅ `I18nContext.ts`
│   │   ├── ✅ `I18nProvider.tsx`
│   │   ├── ✅ `datetime.ts`
│   │   ├── 📂 **dictionaries/**
│   │   │   ├── 📂 **admin/**
│   │   │   │   ├── ✅ `a11y.en.ts`
│   │   │   │   ├── ✅ `a11y.tr.ts`
│   │   │   │   ├── ✅ `audit.en.ts`
│   │   │   │   ├── ✅ `audit.tr.ts`
│   │   │   │   ├── ✅ `authority.en.ts`
│   │   │   │   ├── ✅ `authority.tr.ts`
│   │   │   │   ├── ✅ `categories.en.ts`
│   │   │   │   ├── ✅ `categories.tr.ts`
│   │   │   │   ├── ✅ `common.en.ts`
│   │   │   │   ├── ✅ `common.tr.ts`
│   │   │   │   ├── ✅ `confirm.en.ts`
│   │   │   │   ├── ✅ `confirm.tr.ts`
│   │   │   │   ├── ✅ `coupons.en.ts`
│   │   │   │   ├── ✅ `coupons.tr.ts`
│   │   │   │   ├── ✅ `dashboard.en.ts`
│   │   │   │   ├── ✅ `dashboard.tr.ts`
│   │   │   │   ├── ✅ `dataTable.en.ts`
│   │   │   │   ├── ✅ `dataTable.tr.ts`
│   │   │   │   ├── ✅ `en.ts`
│   │   │   │   ├── ✅ `errorGroups.en.ts`
│   │   │   │   ├── ✅ `errorGroups.tr.ts`
│   │   │   │   ├── ✅ `errors.en.ts`
│   │   │   │   ├── ✅ `errors.tr.ts`
│   │   │   │   ├── ✅ `inventory.en.ts`
│   │   │   │   ├── ✅ `inventory.tr.ts`
│   │   │   │   ├── ✅ `logistics.en.ts`
│   │   │   │   ├── ✅ `logistics.tr.ts`
│   │   │   │   ├── ✅ `menu.en.ts`
│   │   │   │   ├── ✅ `menu.tr.ts`
│   │   │   │   ├── ✅ `movements.en.ts`
│   │   │   │   ├── ✅ `movements.tr.ts`
│   │   │   │   ├── ✅ `orders.en.ts`
│   │   │   │   ├── ✅ `orders.tr.ts`
│   │   │   │   ├── ✅ `pricing.en.ts`
│   │   │   │   ├── ✅ `pricing.tr.ts`
│   │   │   │   ├── ✅ `products.en.ts`
│   │   │   │   ├── ✅ `products.tr.ts`
│   │   │   │   ├── ❌ `purchasing.en.ts`
│   │   │   │   ├── ❌ `purchasing.tr.ts`
│   │   │   │   ├── ✅ `returns.en.ts`
│   │   │   │   ├── ✅ `returns.tr.ts`
│   │   │   │   ├── ✅ `search.en.ts`
│   │   │   │   ├── ✅ `search.tr.ts`
│   │   │   │   ├── ✅ `settings.en.ts`
│   │   │   │   ├── ✅ `settings.tr.ts`
│   │   │   │   ├── ✅ `theme.en.ts`
│   │   │   │   ├── ❌ `theme.tr.ts`
│   │   │   │   ├── ✅ `titles.en.ts`
│   │   │   │   ├── ✅ `titles.tr.ts`
│   │   │   │   ├── ✅ `toolbar.en.ts`
│   │   │   │   ├── ✅ `toolbar.tr.ts`
│   │   │   │   ├── ✅ `tr.ts`
│   │   │   │   ├── ✅ `ui.en.ts`
│   │   │   │   ├── ✅ `ui.tr.ts`
│   │   │   │   ├── ✅ `users.en.ts`
│   │   │   │   ├── ✅ `users.tr.ts`
│   │   │   │   ├── ✅ `webhooks.en.ts`
│   │   │   │   └── ✅ `webhooks.tr.ts`
│   │   │   ├── ✅ `en.ts`
│   │   │   └── ✅ `tr.ts`
│   │   ├── ✅ `format.ts`
│   │   └── ✅ `getDictValue.ts`
│   ├── 📂 **lib/**
│   │   ├── 📂 **admin/**
│   │   │   ├── ✅ `inboxCounts.ts`
│   │   │   ├── ✅ `mutateWithAudit.ts`
│   │   │   ├── ✅ `orderStatusMachine.ts`
│   │   │   ├── ✅ `returnStatusMachine.ts`
│   │   │   └── 📂 **search/**
│   │   │       └── ✅ `resourceSearchers.ts`
│   │   ├── ✅ `audit.ts`
│   │   ├── 📂 **cache/**
│   │   │   └── ❌ `tags.ts`
│   │   ├── 📂 **consent/**
│   │   ├── 📂 **data/**
│   │   │   └── ✅ `preload.ts`
│   │   ├── ✅ `ensureSessionFresh.ts`
│   │   ├── ✅ `errorReporter.ts`
│   │   ├── ✅ `hvacCalculations.ts`
│   │   ├── 📂 **images/**
│   │   │   └── ❌ `productImage.ts`
│   │   ├── ✅ `order.ts`
│   │   ├── ✅ `orderStatusService.ts`
│   │   ├── ✅ `pdfAssets.ts`
│   │   ├── ✅ `pdfGenerator.ts`
│   │   ├── 📂 **purchasing/**
│   │   │   └── ❌ `poStatusMachine.ts`
│   │   ├── 📂 **quotes/**
│   │   │   └── ✅ `quoteStatusMachine.ts`
│   │   ├── ✅ `rbac.ts`
│   │   ├── 📂 **seo/**
│   │   │   └── ❌ `jsonld.ts`
│   │   ├── 📂 **services/**
│   │   │   ├── ✅ `address.service.ts`
│   │   │   ├── ✅ `cart.service.ts`
│   │   │   ├── ✅ `category.service.ts`
│   │   │   ├── ❌ `displayPrice.service.ts`
│   │   │   ├── ❌ `family.service.ts`
│   │   │   ├── ✅ `inventoryReport.service.ts`
│   │   │   ├── ✅ `invoice.service.ts`
│   │   │   ├── ✅ `pricing.service.ts`
│   │   │   ├── ✅ `pricingAdmin.service.ts`
│   │   │   ├── ✅ `pricingMaterialize.service.ts`
│   │   │   ├── ❌ `pricingPolicy.service.ts`
│   │   │   ├── ❌ `product.columns.ts`
│   │   │   ├── ✅ `product.service.ts`
│   │   │   ├── ✅ `project.service.ts`
│   │   │   ├── ❌ `purchasing.service.ts`
│   │   │   ├── ✅ `quoteService.ts`
│   │   │   └── ✅ `registry.ts`
│   │   ├── 📂 **supabase/**
│   │   │   ├── ✅ `client.ts`
│   │   │   ├── ✅ `server.ts`
│   │   │   └── ✅ `static.ts`
│   │   ├── ✅ `supabase.ts`
│   │   ├── ✅ `tenantResolver.ts`
│   │   ├── ✅ `type-converters.ts`
│   │   ├── ✅ `utils.ts`
│   │   └── 📂 **validation/**
│   │       ├── ❌ `invoiceIdentity.ts`
│   │       └── ✅ `taxIdentity.ts`
│   ├── ✅ `middleware.ts`
│   ├── 📂 **providers/**
│   │   └── ✅ `SupabaseProvider.tsx`
│   ├── 📂 **test/**
│   ├── 📂 **types/**
│   │   ├── ✅ `admin-shared.ts`
│   │   ├── ✅ `authority.ts`
│   │   ├── ✅ `cart.ts`
│   │   ├── ✅ `database.ts`
│   │   ├── ✅ `database.types.ts`
│   │   ├── ✅ `db-rows.ts`
│   │   ├── ✅ `inventory.ts`
│   │   ├── ✅ `media.types.ts`
│   │   └── ✅ `ui-models.ts`
│   ├── 📂 **utils/**
│   │   ├── ✅ `3dModelOffsets.ts`
│   │   ├── ✅ `adminUi.ts`
│   │   ├── ✅ `analytics.ts`
│   │   ├── ✅ `applicationLinks.ts`
│   │   ├── ✅ `applicationUi.tsx`
│   │   ├── ✅ `breadcrumbUtils.ts`
│   │   ├── ✅ `categoryHelpers.ts`
│   │   ├── ✅ `checkoutHelpers.ts`
│   │   ├── ✅ `crypto.ts`
│   │   ├── ✅ `engineeringIntelligence.ts`
│   │   ├── ✅ `getCategoryIcon.tsx`
│   │   ├── ✅ `imageUtils.ts`
│   │   ├── ✅ `navigationConfig.ts`
│   │   ├── ✅ `passwordSecurity.ts`
│   │   ├── ✅ `prefetch.ts`
│   │   ├── ✅ `productHelpers.ts`
│   │   ├── ✅ `router.ts`
│   │   ├── ✅ `routes.ts`
│   │   ├── ✅ `searchHighlight.tsx`
│   │   ├── ❌ `specLabel.ts`
│   │   ├── ✅ `tenantConstants.ts`
│   │   ├── ✅ `tenantServer.ts`
│   │   ├── ✅ `testA11y.tsx`
│   │   ├── ✅ `type-converters.ts`
│   │   └── ✅ `whatsapp.ts`
│   └── 📂 **views/**
│       ├── ✅ `AboutPage.tsx`
│       ├── ✅ `AuthCallbackPage.tsx`
│       ├── ✅ `BrandDetailPage.tsx`
│       ├── ✅ `BrandsPage.tsx`
│       ├── ✅ `CartPage.tsx`
│       ├── ✅ `CategoryMasterView.tsx`
│       ├── ✅ `CategoryPage.tsx`
│       ├── ✅ `CheckoutPage.tsx`
│       ├── ✅ `ContactPage.tsx`
│       ├── ✅ `ForgotPasswordPage.tsx`
│       ├── ✅ `HomePage.tsx`
│       ├── ✅ `LoginPage.tsx`
│       ├── ✅ `OrdersPage.tsx`
│       ├── ✅ `PaymentSuccessPage.tsx`
│       ├── ✅ `ProductsDiscoveryView.tsx`
│       ├── ✅ `ProductsPage.tsx`
│       ├── ✅ `RegisterPage.tsx`
│       ├── ❌ `ResetPasswordPage.tsx`
│       ├── 📂 **account/**
│       │   ├── ✅ `AccountAddressesPage.tsx`
│       │   ├── ✅ `AccountInvoicesPage.tsx`
│       │   ├── ✅ `AccountLayout.tsx`
│       │   ├── ✅ `AccountOverviewPage.tsx`
│       │   ├── ✅ `AccountProfilePage.tsx`
│       │   ├── ✅ `AccountReturnsPage.tsx`
│       │   ├── ✅ `AccountSecurityPage.tsx`
│       │   ├── ✅ `AccountShipmentsPage.tsx`
│       │   ├── ❌ `FavoritesPage.tsx`
│       │   ├── ✅ `OrderDetailPage.tsx`
│       │   ├── ❌ `ProjectsPage.tsx`
│       │   └── 📂 **quotes/**
│       │       ├── ✅ `AccountQuotesPage.tsx`
│       │       └── ✅ `QuoteDetailPage.tsx`
│       ├── 📂 **admin/**
│       │   ├── ✅ `AdminAuditLogPage.tsx`
│       │   ├── ✅ `AdminCategoriesPage.tsx`
│       │   ├── ✅ `AdminCouponsPage.tsx`
│       │   ├── ✅ `AdminDashboardPage.tsx`
│       │   ├── ✅ `AdminErrorGroupsPage.tsx`
│       │   ├── ✅ `AdminErrorsPage.tsx`
│       │   ├── ✅ `AdminInventoryPage.tsx`
│       │   ├── ✅ `AdminInventoryReportPage.tsx`
│       │   ├── ✅ `AdminInventorySettingsPage.tsx`
│       │   ├── ✅ `AdminLayout.tsx`
│       │   ├── ✅ `AdminLogisticsPage.tsx`
│       │   ├── ✅ `AdminLogisticsTableBody.tsx`
│       │   ├── ✅ `AdminMovementsPage.tsx`
│       │   ├── ✅ `AdminOrdersBoard.tsx`
│       │   ├── ✅ `AdminOrdersPage.tsx`
│       │   ├── ✅ `AdminPricePreviewPage.tsx`
│       │   ├── ✅ `AdminPricingRulesPage.tsx`
│       │   ├── ✅ `AdminPricingSettingsPage.tsx`
│       │   ├── ✅ `AdminProductsPage.tsx`
│       │   ├── ✅ `AdminReturnsPage.tsx`
│       │   ├── ✅ `AdminSettingsPage.tsx`
│       │   ├── ✅ `AdminUsersPage.tsx`
│       │   ├── ✅ `AdminUsersTableBody.tsx`
│       │   ├── ✅ `AdminWebhookEventsPage.tsx`
│       │   ├── ✅ `AuditLogTableBody.tsx`
│       │   ├── ✅ `CategoriesTableBody.tsx`
│       │   ├── ✅ `CategoryBuilderView.tsx`
│       │   ├── ✅ `CouponsTableBody.tsx`
│       │   ├── ✅ `ErrorGroupsTableBody.tsx`
│       │   ├── ✅ `ErrorsTableBody.tsx`
│       │   ├── ✅ `InventoryTableBody.tsx`
│       │   ├── ✅ `MovementsTableBody.tsx`
│       │   ├── ✅ `OrdersTableBody.tsx`
│       │   ├── ✅ `PricePreviewPanel.tsx`
│       │   ├── ✅ `PricingRulesTableBody.tsx`
│       │   ├── ✅ `ProductsTableBody.tsx`
│       │   ├── ✅ `ReturnsTableBody.tsx`
│       │   ├── ✅ `WebhookEventsTableBody.tsx`
│       │   ├── 📂 **purchasing/**
│       │   │   ├── ❌ `AdminPurchasingPage.tsx`
│       │   │   └── ❌ `PurchasingTableBody.tsx`
│       │   └── 📂 **quotes/**
│       │       ├── ✅ `AdminQuotesPage.tsx`
│       │       └── ✅ `QuotesTableBody.tsx`
│       ├── 📂 **calculators/**
│       │   ├── ✅ `AirCurtainCalcPage.tsx`
│       │   ├── ✅ `DuctCalcPage.tsx`
│       │   ├── ✅ `HRVCalcPage.tsx`
│       │   └── ✅ `JetFanCalcPage.tsx`
│       ├── 📂 **category/**
│       │   ├── ✅ `CategoryGridView.tsx`
│       │   ├── ✅ `CategoryLandingView.tsx`
│       │   ├── ✅ `CategorySeriesView.tsx`
│       │   └── ✅ `CategoryShowcaseView.tsx`
│       ├── 📂 **checkout/**
│       │   ├── ✅ `AddressFormModal.tsx`
│       │   ├── ✅ `AddressSelectModal.tsx`
│       │   ├── ✅ `CheckoutProgress.tsx`
│       │   ├── ✅ `InvoiceProfileModal.tsx`
│       │   ├── ✅ `OrderSummarySidebar.tsx`
│       │   ├── ✅ `PaymentIframeContainer.tsx`
│       │   ├── ✅ `ReviewSummary.tsx`
│       │   ├── ✅ `SecurePaymentOverlay.tsx`
│       │   ├── ✅ `StepAddressInfo.tsx`
│       │   ├── ✅ `StepCustomerInfo.tsx`
│       │   └── ✅ `buildPaymentRequest.ts`
│       ├── 📂 **knowledge/**
│       │   ├── ✅ `HubPage.tsx`
│       │   └── ✅ `TopicPage.tsx`
│       ├── 📂 **legal/**
│       │   ├── ✅ `CookiePolicyPage.tsx`
│       │   ├── ✅ `DistanceSalesAgreementPage.tsx`
│       │   ├── ✅ `KVKKPage.tsx`
│       │   ├── ✅ `PreInformationPage.tsx`
│       │   ├── ✅ `PrivacyPolicyPage.tsx`
│       │   ├── ✅ `TermsOfUsePage.tsx`
│       │   └── 📂 **components/**
│       │       ├── 📂 **en/**
│       │       │   ├── ✅ `CookiePolicyContent.tsx`
│       │       │   ├── ✅ `DistanceSalesAgreementContent.tsx`
│       │       │   ├── ✅ `KvkkContent.tsx`
│       │       │   ├── ✅ `PreInformationContent.tsx`
│       │       │   ├── ✅ `PrivacyPolicyContent.tsx`
│       │       │   └── ✅ `TermsOfUseContent.tsx`
│       │       └── 📂 **tr/**
│       │           ├── ✅ `CookiePolicyContent.tsx`
│       │           ├── ✅ `DistanceSalesAgreementContent.tsx`
│       │           ├── ✅ `KvkkContent.tsx`
│       │           ├── ✅ `PreInformationContent.tsx`
│       │           ├── ✅ `PrivacyPolicyContent.tsx`
│       │           └── ✅ `TermsOfUseContent.tsx`
│       └── 📂 **support/**
│           ├── ✅ `FAQPage.tsx`
│           ├── ✅ `ReturnsPage.tsx`
│           ├── ✅ `ShippingPage.tsx`
│           └── ✅ `WarrantyPage.tsx`
├── 📂 **supabase/**
│   ├── 📂 **baselines/**
│   │   └── ⚪ `README.md`
│   ├── 📂 **functions/**
│   │   ├── 📂 **_shared/**
│   │   │   ├── ✅ `caller.ts`
│   │   │   ├── ✅ `cors.ts`
│   │   │   ├── ✅ `notify.ts`
│   │   │   ├── ❌ `origins.ts`
│   │   │   ├── ✅ `rate_limit.ts`
│   │   │   ├── ❌ `refund_guard.ts`
│   │   │   ├── ❌ `return_transitions.ts`
│   │   │   ├── ❌ `revenue_alarm.ts`
│   │   │   ├── ✅ `sentry.ts`
│   │   │   ├── ✅ `tenant.ts`
│   │   │   └── ✅ `tenant_config.ts`
│   │   ├── 📂 **admin-create-coupon/**
│   │   ├── 📂 **admin-iyzico-reconcile/**
│   │   ├── 📂 **admin-order-inspect/**
│   │   ├── 📂 **admin-orders-latest/**
│   │   ├── 📂 **admin-update-order/**
│   │   ├── 📂 **admin-update-shipping/**
│   │   ├── 📂 **apply-coupon/**
│   │   ├── 📂 **delivery-notification/**
│   │   │   └── 📂 **templates/**
│   │   │       └── 📂 **email/**
│   │   ├── 📂 **healthz/**
│   │   ├── 📂 **iyzico-callback/**
│   │   ├── 📂 **iyzico-payment/**
│   │   ├── 📂 **iyzico-refund/**
│   │   ├── 📂 **log-client-error/**
│   │   ├── 📂 **notification-service/**
│   │   ├── 📂 **order-confirmation/**
│   │   │   └── 📂 **templates/**
│   │   │       └── 📂 **email/**
│   │   ├── 📂 **order-housekeeping/**
│   │   ├── 📂 **order-validate/**
│   │   ├── 📂 **refund-order-mock/**
│   │   ├── 📂 **release-expired-reservations/**
│   │   ├── 📂 **return-status-notification/**
│   │   ├── 📂 **returns-webhook/**
│   │   ├── 📂 **shipping-notification/**
│   │   │   └── 📂 **templates/**
│   │   │       └── 📂 **email/**
│   │   ├── 📂 **shipping-status/**
│   │   ├── 📂 **shipping-webhook/**
│   │   ├── 📂 **stock-alert/**
│   │   └── 📂 **tcmb-rates-sync/**
│   └── 📂 **migrations/**
├── 📂 **support/**
└── ✅ `tailwind.config.js`
```

## Eksik Dokümantasyonlar
- [ ] `e2e\reflow.e2e.ts`
- [ ] `src\app\[lang]\account\favorites\page.tsx`
- [ ] `src\app\[lang]\account\projects\page.tsx`
- [ ] `src\app\[lang]\auth\reset-password\page.tsx`
- [ ] `src\app\admin\purchasing\page.tsx`
- [ ] `src\app\auth\callback\route.ts`
- [ ] `src\components\admin\purchasing\CreatePurchaseOrderPanel.tsx`
- [ ] `src\components\analytics\ConsentGatedAnalytics.tsx`
- [ ] `src\components\consent\CookiePreferencesButton.tsx`
- [ ] `src\components\products\VariantSelector.tsx`
- [ ] `src\components\ui\Pagination.tsx`
- [ ] `src\hooks\useFavorites.ts`
- [ ] `src\i18n\dictionaries\admin\purchasing.en.ts`
- [ ] `src\i18n\dictionaries\admin\purchasing.tr.ts`
- [ ] `src\i18n\dictionaries\admin\theme.tr.ts`
- [ ] `src\lib\cache\tags.ts`
- [ ] `src\lib\images\productImage.ts`
- [ ] `src\lib\purchasing\poStatusMachine.ts`
- [ ] `src\lib\seo\jsonld.ts`
- [ ] `src\lib\services\displayPrice.service.ts`
- [ ] `src\lib\services\family.service.ts`
- [ ] `src\lib\services\pricingPolicy.service.ts`
- [ ] `src\lib\services\product.columns.ts`
- [ ] `src\lib\services\purchasing.service.ts`
- [ ] `src\lib\validation\invoiceIdentity.ts`
- [ ] `src\utils\specLabel.ts`
- [ ] `src\views\ResetPasswordPage.tsx`
- [ ] `src\views\account\FavoritesPage.tsx`
- [ ] `src\views\account\ProjectsPage.tsx`
- [ ] `src\views\admin\purchasing\AdminPurchasingPage.tsx`
- [ ] `src\views\admin\purchasing\PurchasingTableBody.tsx`
- [ ] `supabase\functions\_shared\origins.ts`
- [ ] `supabase\functions\_shared\refund_guard.ts`
- [ ] `supabase\functions\_shared\return_transitions.ts`
- [ ] `supabase\functions\_shared\revenue_alarm.ts`
- [ ] `src\app\[lang]\account\favorites\page.tsx`
- [ ] `src\app\[lang]\account\projects\page.tsx`
- [ ] `src\app\[lang]\auth\reset-password\page.tsx`
- [ ] `src\app\admin\purchasing\page.tsx`
- [ ] `src\app\auth\callback\route.ts`
- [ ] `src\components\admin\purchasing\CreatePurchaseOrderPanel.tsx`
- [ ] `src\components\analytics\ConsentGatedAnalytics.tsx`
- [ ] `src\components\consent\CookiePreferencesButton.tsx`
- [ ] `src\components\products\VariantSelector.tsx`
- [ ] `src\components\ui\Pagination.tsx`
- [ ] `src\hooks\useFavorites.ts`
- [ ] `src\i18n\dictionaries\admin\purchasing.en.ts`
- [ ] `src\i18n\dictionaries\admin\purchasing.tr.ts`
- [ ] `src\i18n\dictionaries\admin\theme.tr.ts`
- [ ] `src\lib\cache\tags.ts`
- [ ] `src\lib\images\productImage.ts`
- [ ] `src\lib\purchasing\poStatusMachine.ts`
- [ ] `src\lib\seo\jsonld.ts`
- [ ] `src\lib\services\displayPrice.service.ts`
- [ ] `src\lib\services\family.service.ts`
- [ ] `src\lib\services\pricingPolicy.service.ts`
- [ ] `src\lib\services\product.columns.ts`
- [ ] `src\lib\services\purchasing.service.ts`
- [ ] `src\lib\validation\invoiceIdentity.ts`
- [ ] `src\utils\specLabel.ts`
- [ ] `src\views\ResetPasswordPage.tsx`
- [ ] `src\views\account\FavoritesPage.tsx`
- [ ] `src\views\account\ProjectsPage.tsx`
- [ ] `src\views\admin\purchasing\AdminPurchasingPage.tsx`
- [ ] `src\views\admin\purchasing\PurchasingTableBody.tsx`
- [ ] `supabase\functions\_shared\origins.ts`
- [ ] `supabase\functions\_shared\refund_guard.ts`
- [ ] `supabase\functions\_shared\return_transitions.ts`
- [ ] `supabase\functions\_shared\revenue_alarm.ts`

## Sahipsiz (Orphan) MD Dosyaları
Aşağıdaki `.md` dosyaları bir `.py` koduyla eşleşmiyor. Düzeltmek için `python cli/docs_tree.py --fix` çalıştırabilirsiniz.
- [⚠️] ` .agents\explorer_m4_1_gen2\handoff.md`
- [⚠️] `ORIGINAL_REQUEST.md`
- [⚠️] `TEST_INFRA.md`
- [⚠️] `TEST_READY.md`
- [⚠️] `explorer_m2_3\analysis.md`
- [⚠️] `implementation_plan.md`
- [⚠️] `next.config.md`

## Geçersiz Şablon (Invalid Format)
Harika! Tüm MD belgeleri Enterprise-Ready (5N1K + Axioms) şablonuna uygun. ✅