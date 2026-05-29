# VENTHUB HVAC SYSTEM ARCHITECTURE TREE

---
project_name: venthub-hvac
compiled_at: 2026-05-29T19:23:49.239639+00:00
standard: Enterprise-Ready (5N1K + Axioms)
---

Bu belge, otonom derleyici tarafından 2026-05-29T19:23:49.239639+00:00 tarihinde sistemdeki kaynak kod dosyalarının (.py/.ts/.tsx/.js/.jsx) eşleşen `.md` (mimari dokümantasyon) dosyalarına sahip olup olmadığını göstermek amacıyla otonom olarak derlenmiştir.

## Dokümantasyon Durumu
```text
📂 venthub-hvac/
├── 📂 **src/**
│   ├── 📂 **actions/**
│   │   └── ✅ `auth.ts`
│   ├── 📂 **app/**
│   │   ├── 📂 **[lang]/**
│   │   │   ├── 📂 **about/**
│   │   │   │   └── ❌ `page.tsx`
│   │   │   ├── 📂 **account/**
│   │   │   │   ├── 📂 **addresses/**
│   │   │   │   │   └── ✅ `page.tsx`
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
│   │   │   │   └── 📂 **register/**
│   │   │   │       └── ✅ `page.tsx`
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
│   │   │   │       └── ❌ `page.tsx`
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
│   │   │   └── ❌ `ProductDetailPageView.tsx`
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
│   │   │   ├── 📂 **products/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **returns/**
│   │   │   │   └── ❌ `page.tsx`
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
│   │   │           └── ❌ `route.ts`
│   │   ├── ✅ `layout.tsx`
│   │   ├── ✅ `robots.ts`
│   │   └── ✅ `sitemap.ts`
│   ├── 📂 **assets/**
│   │   └── 📂 **images/**
│   ├── 📂 **components/**
│   │   ├── ✅ `AddToCartToast.tsx`
│   │   ├── ✅ `BackToTopButton.tsx`
│   │   ├── ✅ `BeforeAfterSlider.tsx`
│   │   ├── ✅ `BentoGrid.tsx`
│   │   ├── ✅ `BrandsShowcase.tsx`
│   │   ├── ✅ `BuildTag.tsx`
│   │   ├── ✅ `CartToast.tsx`
│   │   ├── ✅ `CaseStudySection.tsx`
│   │   ├── ✅ `CategoriesShowcase.tsx`
│   │   ├── ✅ `CategoryFlow.tsx`
│   │   ├── ✅ `ErrorBoundary.tsx`
│   │   ├── ✅ `FAQShortSection.tsx`
│   │   ├── ✅ `Footer.tsx`
│   │   ├── ✅ `HVACIcons.tsx`
│   │   ├── ✅ `HeroCarousel.tsx`
│   │   ├── ✅ `HeroSection.tsx`
│   │   ├── ✅ `HeroSkeleton.tsx`
│   │   ├── ✅ `ImageGallery.tsx`
│   │   ├── ✅ `InViewCounter.tsx`
│   │   ├── ✅ `LanguageSwitcher.tsx`
│   │   ├── ✅ `LazyBrandsShowcase.tsx`
│   │   ├── ✅ `LazyInView.tsx`
│   │   ├── ✅ `LeadModal.tsx`
│   │   ├── ✅ `LoadingSpinner.tsx`
│   │   ├── ✅ `MagneticCTA.tsx`
│   │   ├── ✅ `MegaMenu.tsx`
│   │   ├── ❌ `PaymentWatcher.tsx`
│   │   ├── ✅ `ProductCard.tsx`
│   │   ├── ✅ `QuickViewModal.tsx`
│   │   ├── ✅ `ResourcesSection.tsx`
│   │   ├── ✅ `ScrollLinkedProcess.tsx`
│   │   ├── ✅ `ScrollReveal.tsx`
│   │   ├── ✅ `ScrollToTop.tsx`
│   │   ├── ✅ `SearchOverlay.tsx`
│   │   ├── ✅ `SecurityRibbon.tsx`
│   │   ├── ✅ `Seo.tsx`
│   │   ├── ✅ `SimpleProductGallery.tsx`
│   │   ├── ✅ `SpotlightHeroOverlay.tsx`
│   │   ├── ✅ `SpotlightList.tsx`
│   │   ├── ✅ `StickyHeader.tsx`
│   │   ├── ✅ `SubcategoryFlow.tsx`
│   │   ├── ❌ `TiltCard.tsx`
│   │   ├── ✅ `TrustSection.tsx`
│   │   ├── ✅ `UndecidedUserCTA.tsx`
│   │   ├── ✅ `VisualShowcase.tsx`
│   │   ├── ✅ `WhatsAppFloat.tsx`
│   │   ├── ✅ `WhyVentHubEnhanced.tsx`
│   │   ├── 📂 **admin/**
│   │   │   ├── ✅ `AccessDenied.tsx`
│   │   │   ├── ✅ `AdminEmptyState.tsx`
│   │   │   ├── ✅ `AdminRealtimeNotifications.tsx`
│   │   │   ├── ✅ `AdminSkeleton.tsx`
│   │   │   ├── ✅ `AdminToolbar.tsx`
│   │   │   ├── ✅ `BulkActionToolbar.tsx`
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
│   │   │   │   ├── ❌ `AbcPieChart.tsx`
│   │   │   │   ├── ✅ `ActivityHeatmap.tsx`
│   │   │   │   ├── ✅ `RecentOrdersTable.tsx`
│   │   │   │   ├── ✅ `SalesChart.tsx`
│   │   │   │   └── ✅ `StatCard.tsx`
│   │   │   └── 📂 **products/**
│   │   │       ├── ✅ `ProductCsvImport.tsx`
│   │   │       ├── ✅ `ProductFormModal.tsx`
│   │   │       └── ✅ `ProductHealthBadge.tsx`
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
│   │   ├── 📂 **home/**
│   │   │   ├── ✅ `ApplicationSolutions.tsx`
│   │   │   ├── ✅ `CinematicProductShowcase.tsx`
│   │   │   ├── ✅ `ClientLeadButton.tsx`
│   │   │   ├── ✅ `EliteHero.tsx`
│   │   │   ├── ✅ `FeaturedCommercialBlocks.tsx`
│   │   │   ├── ✅ `FinalCTA.tsx`
│   │   │   ├── ✅ `GuidedCategoryDiscovery.tsx`
│   │   │   ├── ✅ `HomePageClientWrapper.tsx`
│   │   │   ├── ✅ `HomeSinevizyon.tsx`
│   │   │   ├── ✅ `KnowledgeBlock.tsx`
│   │   │   ├── ✅ `QuickEntryRail.tsx`
│   │   │   ├── ✅ `RevealSection.tsx`
│   │   │   ├── ✅ `StrategicBrands.tsx`
│   │   │   └── ✅ `TrustProofSection.tsx`
│   │   ├── 📂 **layout/**
│   │   │   ├── ✅ `ClientLayout.tsx`
│   │   │   ├── ✅ `CookieConsent.tsx`
│   │   │   ├── ✅ `MainLayout.tsx`
│   │   │   └── ❌ `PageShell.tsx`
│   │   ├── 📂 **navigation/**
│   │   │   ├── ✅ `Breadcrumb.tsx`
│   │   │   ├── ✅ `CategoryCard3D.tsx`
│   │   │   ├── ✅ `CategoryHubOverlay.tsx`
│   │   │   ├── ✅ `CategorySpotlightScene.tsx`
│   │   │   ├── ✅ `EliteMegaMenu.tsx`
│   │   │   ├── ✅ `MegaMenu3DBackground.tsx`
│   │   │   ├── ✅ `NavActionButton.tsx`
│   │   │   ├── ✅ `NavBrand.tsx`
│   │   │   ├── ✅ `NavPrimaryRail.tsx`
│   │   │   ├── ✅ `NavSearchTrigger.tsx`
│   │   │   ├── ❌ `NavSecondaryRail.tsx`
│   │   │   ├── ❌ `NavShell.tsx`
│   │   │   └── ✅ `NavUtilityRail.tsx`
│   │   ├── 📂 **product/**
│   │   │   └── ❌ `ProductSmartInference.tsx`
│   │   ├── 📂 **products/**
│   │   │   ├── 📂 **3d/**
│   │   │   │   ├── ✅ `AutoCenter.tsx`
│   │   │   │   ├── ✅ `FanRenderer.tsx`
│   │   │   │   ├── ✅ `Product3DViewer.tsx`
│   │   │   │   ├── ✅ `SmartCenterScale.tsx`
│   │   │   │   ├── 📂 **factory/**
│   │   │   │   │   ├── ❌ `Assembler.tsx`
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
│   │   │   ├── ✅ `ApplicationCards.tsx`
│   │   │   ├── ✅ `BentPlaneGeometry.tsx`
│   │   │   ├── ✅ `BlueprintCanvas.tsx`
│   │   │   ├── ✅ `Category3DIcon.tsx`
│   │   │   ├── ✅ `CategoryOrbitCarousel.tsx`
│   │   │   ├── ❌ `CategoryPreviewPanel.tsx`
│   │   │   ├── ✅ `CategoryShowcaseCards.tsx`
│   │   │   ├── ✅ `InfiniteProductsShowcase.tsx`
│   │   │   ├── ✅ `OrbitalProductsShowcase.tsx`
│   │   │   ├── ✅ `ProductsGrid.tsx`
│   │   │   ├── ✅ `ProductsHero.tsx`
│   │   │   ├── ✅ `ProductsSkeleton.tsx`
│   │   │   ├── ✅ `RadialActionMenu.tsx`
│   │   │   ├── ✅ `RichTextRenderer.tsx`
│   │   │   ├── ❌ `SeriesCard.tsx`
│   │   │   └── 📂 **visual-models/**
│   │   └── 📂 **ui/**
│   │       ├── ✅ `ScrollObserver.tsx`
│   │       ├── ✅ `Skeleton.tsx`
│   │       └── ✅ `VentImage.tsx`
│   ├── 📂 **config/**
│   │   ├── ✅ `admin.ts`
│   │   ├── ✅ `applications.ts`
│   │   ├── ✅ `legal.ts`
│   │   ├── ❌ `orbitalCarouselConfig.ts`
│   │   └── ✅ `siteUrl.ts`
│   ├── 📂 **contexts/**
│   │   ├── ❌ `AuthContext.tsx`
│   │   ├── ✅ `AuthContextDefinition.ts`
│   │   ├── ✅ `CartContext.tsx`
│   │   ├── ✅ `CartProvider.tsx`
│   │   ├── ✅ `CategoryContext.tsx`
│   │   ├── ✅ `ProjectContext.tsx`
│   │   └── ✅ `ProjectProvider.tsx`
│   ├── 📂 **design-system/**
│   │   └── ❌ `tokens.js`
│   ├── 📂 **hooks/**
│   │   ├── ✅ `use-mobile.tsx`
│   │   ├── ✅ `useApiCall.ts`
│   │   ├── ✅ `useAuth.ts`
│   │   ├── ✅ `useCartHook.ts`
│   │   ├── ✅ `useCategoryGateway.ts`
│   │   ├── ✅ `useCategoryViewModel.ts`
│   │   ├── ✅ `useCheckoutCoupon.ts`
│   │   ├── ✅ `useCheckoutOrchestrator.ts`
│   │   ├── ✅ `useCheckoutPayment.ts`
│   │   ├── ✅ `useDragScroll.ts`
│   │   ├── ✅ `useHideOnScroll.ts`
│   │   ├── ✅ `useIsMounted.ts`
│   │   ├── ✅ `useLocalizedRoutes.ts`
│   │   ├── ✅ `useManualScrollRestoration.ts`
│   │   ├── ✅ `useNavigationState.ts`
│   │   ├── ✅ `useProjectLists.ts`
│   │   ├── ✅ `useRole.ts`
│   │   ├── ✅ `useScrollAnimation.ts`
│   │   ├── ✅ `useScrollThrottle.tsx`
│   │   └── ✅ `useSettings.ts`
│   ├── 📂 **i18n/**
│   │   ├── ✅ `I18nContext.ts`
│   │   ├── ✅ `I18nProvider.tsx`
│   │   ├── ✅ `datetime.ts`
│   │   ├── 📂 **dictionaries/**
│   │   │   ├── ✅ `en.ts`
│   │   │   └── ✅ `tr.ts`
│   │   └── ✅ `format.ts`
│   ├── 📂 **lib/**
│   │   ├── ✅ `audit.ts`
│   │   ├── ✅ `brands.ts`
│   │   ├── 📂 **data/**
│   │   │   └── ✅ `preload.ts`
│   │   ├── ✅ `ensureSessionFresh.ts`
│   │   ├── ✅ `errorReporter.ts`
│   │   ├── ✅ `hvacCalculations.ts`
│   │   ├── ✅ `order.ts`
│   │   ├── ✅ `orderStatusService.ts`
│   │   ├── ❌ `pdfAssets.ts`
│   │   ├── ✅ `pdfGenerator.ts`
│   │   ├── ✅ `productsApi.ts`
│   │   ├── ✅ `rbac.ts`
│   │   ├── 📂 **services/**
│   │   │   ├── ✅ `address.service.ts`
│   │   │   ├── ✅ `cart.service.ts`
│   │   │   ├── ❌ `category.service.ts`
│   │   │   ├── ✅ `invoice.service.ts`
│   │   │   ├── ❌ `pricing.service.ts`
│   │   │   ├── ✅ `product.service.ts`
│   │   │   └── ❌ `project.service.ts`
│   │   ├── ✅ `supabase.ts`
│   │   ├── ✅ `type-converters.ts`
│   │   └── ✅ `utils.ts`
│   ├── ✅ `middleware.ts`
│   ├── 📂 **test/**
│   ├── 📂 **types/**
│   │   ├── ✅ `admin-shared.ts`
│   │   ├── ✅ `authority.ts`
│   │   ├── ❌ `database.ts`
│   │   ├── ✅ `database.types.ts`
│   │   ├── ✅ `db-rows.ts`
│   │   ├── ✅ `inventory.ts`
│   │   ├── ✅ `media.types.ts`
│   │   └── ✅ `ui-models.ts`
│   ├── 📂 **utils/**
│   │   ├── ✅ `3dModelOffsets.ts`
│   │   ├── ✅ `adminUi.ts`
│   │   ├── ❌ `analytics.ts`
│   │   ├── ✅ `applicationLinks.ts`
│   │   ├── ❌ `applicationUi.tsx`
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
│   │   ├── ✅ `routes.ts`
│   │   ├── ✅ `searchHighlight.tsx`
│   │   ├── ✅ `testA11y.tsx`
│   │   ├── ✅ `three-utils.ts`
│   │   ├── ✅ `type-converters.ts`
│   │   └── ✅ `whatsapp.ts`
│   └── 📂 **views/**
│       ├── ✅ `AboutPage.tsx`
│       ├── ✅ `AuthCallbackPage.tsx`
│       ├── ✅ `BrandDetailPage.tsx`
│       ├── ❌ `BrandsPage.tsx`
│       ├── ✅ `CartPage.tsx`
│       ├── ✅ `CategoryMasterView.tsx`
│       ├── ✅ `CategoryPage.tsx`
│       ├── ✅ `CheckoutPage.tsx`
│       ├── ✅ `ContactPage.tsx`
│       ├── ❌ `ForgotPasswordPage.tsx`
│       ├── ✅ `HomePage.tsx`
│       ├── ✅ `LoginPage.tsx`
│       ├── ✅ `OrdersPage.tsx`
│       ├── ❌ `PaymentSuccessPage.tsx`
│       ├── ✅ `ProductDetailPage.tsx`
│       ├── ❌ `ProductsDiscoveryView.tsx`
│       ├── ❌ `ProductsPage.tsx`
│       ├── ✅ `RegisterPage.tsx`
│       ├── 📂 **account/**
│       │   ├── ✅ `AccountAddressesPage.tsx`
│       │   ├── ✅ `AccountInvoicesPage.tsx`
│       │   ├── ✅ `AccountLayout.tsx`
│       │   ├── ✅ `AccountOverviewPage.tsx`
│       │   ├── ❌ `AccountProfilePage.tsx`
│       │   ├── ❌ `AccountReturnsPage.tsx`
│       │   ├── ✅ `AccountSecurityPage.tsx`
│       │   ├── ✅ `AccountShipmentsPage.tsx`
│       │   ├── ✅ `AdminStockPage.tsx`
│       │   └── ❌ `OrderDetailPage.tsx`
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
│       │   ├── ✅ `AdminMovementsPage.tsx`
│       │   ├── ❌ `AdminOrdersBoard.tsx`
│       │   ├── ✅ `AdminOrdersPage.tsx`
│       │   ├── ✅ `AdminProductsPage.tsx`
│       │   ├── ✅ `AdminReturnsPage.tsx`
│       │   ├── ✅ `AdminSettingsPage.tsx`
│       │   ├── ✅ `AdminUsersPage.tsx`
│       │   ├── ✅ `AdminWebhookEventsPage.tsx`
│       │   └── ✅ `CategoryBuilderView.tsx`
│       ├── 📂 **calculators/**
│       │   ├── ❌ `AirCurtainCalcPage.tsx`
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
│       │   └── ❌ `buildPaymentRequest.ts`
│       ├── 📂 **knowledge/**
│       │   ├── ✅ `HubPage.tsx`
│       │   └── ✅ `TopicPage.tsx`
│       ├── 📂 **legal/**
│       │   ├── ✅ `CookiePolicyPage.tsx`
│       │   ├── ✅ `DistanceSalesAgreementPage.tsx`
│       │   ├── ✅ `KVKKPage.tsx`
│       │   ├── ✅ `PreInformationPage.tsx`
│       │   ├── ✅ `PrivacyPolicyPage.tsx`
│       │   └── ✅ `TermsOfUsePage.tsx`
│       └── 📂 **support/**
│           ├── ✅ `FAQPage.tsx`
│           ├── ✅ `ReturnsPage.tsx`
│           ├── ✅ `ShippingPage.tsx`
│           ├── ✅ `SupportHomePage.tsx`
│           └── ✅ `WarrantyPage.tsx`
└── 📂 **supabase/**
    └── 📂 **functions/**
        ├── 📂 **_shared/**
        │   ├── ✅ `cors.ts`
        │   ├── ✅ `notify.ts`
        │   ├── ❌ `rate_limit.ts`
        │   └── ✅ `sentry.ts`
        ├── 📂 **admin-create-coupon/**
        ├── 📂 **admin-iyzico-reconcile/**
        ├── 📂 **admin-order-inspect/**
        ├── 📂 **admin-orders-latest/**
        ├── 📂 **admin-update-order/**
        ├── 📂 **admin-update-shipping/**
        ├── 📂 **apply-coupon/**
        ├── 📂 **delivery-notification/**
        │   └── 📂 **templates/**
        │       └── 📂 **email/**
        ├── 📂 **healthz/**
        ├── 📂 **iyzico-callback/**
        ├── 📂 **iyzico-payment/**
        ├── 📂 **iyzico-refund/**
        ├── 📂 **log-client-error/**
        ├── 📂 **notification-service/**
        ├── 📂 **order-confirmation/**
        │   └── 📂 **templates/**
        │       └── 📂 **email/**
        ├── 📂 **order-housekeeping/**
        ├── 📂 **order-validate/**
        ├── 📂 **refund-order-mock/**
        ├── 📂 **release-expired-reservations/**
        ├── 📂 **return-status-notification/**
        ├── 📂 **returns-webhook/**
        ├── 📂 **shipping-notification/**
        │   └── 📂 **templates/**
        │       └── 📂 **email/**
        ├── 📂 **shipping-status/**
        ├── 📂 **shipping-webhook/**
        └── 📂 **stock-alert/**
```

## Eksik Dokümantasyonlar
Tebrikler! Tüm çekirdek `.py` dosyalarının eşleşen `.md` belgeleri mevcut. 🎉

## Sahipsiz (Orphan) MD Dosyaları
Harika! Eşleşmeyen başıboş bir `.md` dosyası bulunmuyor. ✅

## Geçersiz Şablon (Invalid Format)
Aşağıdaki `.md` dosyalarında '5N1K' veya 'AXIOM' yapıları eksik. Enterprise standardı için güncelleyin:
- [❌] `src\app\[lang]\about\page.md`
- [❌] `src\app\[lang]\category\[categorySlug]\page.md`
- [❌] `src\app\_components\ProductDetailPageView.md`
- [❌] `src\app\admin\returns\page.md`
- [❌] `src\app\api\webhook\supabase\route.md`
- [❌] `src\components\PaymentWatcher.md`
- [❌] `src\components\TiltCard.md`
- [❌] `src\components\admin\dashboard\AbcPieChart.md`
- [❌] `src\components\layout\PageShell.md`
- [❌] `src\components\navigation\NavSecondaryRail.md`
- [❌] `src\components\navigation\NavShell.md`
- [❌] `src\components\product\ProductSmartInference.md`
- [❌] `src\components\products\3d\factory\Assembler.md`
- [❌] `src\components\products\CategoryPreviewPanel.md`
- [❌] `src\components\products\SeriesCard.md`
- [❌] `src\config\orbitalCarouselConfig.md`
- [❌] `src\contexts\AuthContext.md`
- [❌] `src\design-system\tokens.md`
- [❌] `src\lib\pdfAssets.md`
- [❌] `src\lib\services\category.service.md`
- [❌] `src\lib\services\pricing.service.md`
- [❌] `src\lib\services\project.service.md`
- [❌] `src\types\database.md`
- [❌] `src\utils\analytics.md`
- [❌] `src\utils\applicationUi.md`
- [❌] `src\views\BrandsPage.md`
- [❌] `src\views\ForgotPasswordPage.md`
- [❌] `src\views\PaymentSuccessPage.md`
- [❌] `src\views\ProductsDiscoveryView.md`
- [❌] `src\views\ProductsPage.md`
- [❌] `src\views\account\AccountProfilePage.md`
- [❌] `src\views\account\AccountReturnsPage.md`
- [❌] `src\views\account\OrderDetailPage.md`
- [❌] `src\views\admin\AdminOrdersBoard.md`
- [❌] `src\views\calculators\AirCurtainCalcPage.md`
- [❌] `src\views\checkout\buildPaymentRequest.md`
- [❌] `supabase\functions\_shared\rate_limit.md`