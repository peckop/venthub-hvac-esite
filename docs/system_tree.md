# VENTHUB HVAC SYSTEM ARCHITECTURE TREE

---
project_name: venthub-hvac
compiled_at: 2026-09-09T12:24:55.683613+00:00
standard: Enterprise-Ready (5N1K + Axioms)
---

Bu belge, otonom derleyici tarafından 2026-09-09T12:24:55.683613+00:00 tarihinde sistemdeki kaynak kod dosyalarının (.py/.ts/.tsx/.js/.jsx) eşleşen `.md` (mimari dokümantasyon) dosyalarına sahip olup olmadığını göstermek amacıyla otonom olarak derlenmiştir.

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
│   │   ├── ⚪ `lighthouse_performance_fix_plan_merged_2026-06-10.md`
│   │   ├── ⚪ `plan-and-tasklist-current.md`
│   │   ├── ⚪ `plan-and-tasklist.md`
│   │   └── ⚪ `project_state_and_skills_audit.md`
│   ├── 📂 **audits/**
│   │   ├── ⚪ `3d-surfaces-audit-2026-06-16.md`
│   │   ├── ⚪ `admin-cetvel-scores-2026-06-13.md`
│   │   ├── ⚪ `admin-cetvel-scores-2026-06-17.md`
│   │   ├── ⚪ `admin-cetvel-scores-2026-06-18.md`
│   │   ├── ⚪ `admin-panel-audit-2026-06-11.md`
│   │   ├── ⚪ `aile-adi-en-cevirileri-2026-08-23.md`
│   │   ├── ⚪ `arac-envanteri-2026-09-07.md`
│   │   ├── ⚪ `build-skip-canli-olcum-2026-08-28.md`
│   │   ├── ⚪ `canliya-alma-hazirlik-2026-08-15.md`
│   │   ├── ⚪ `dealer-data-ground-truth-2026-06-11.md`
│   │   ├── ⚪ `fiyatsiz-27-ayrim-2026-09-06.md`
│   │   ├── ⚪ `i18n-sozluk-render-denetimi-2026-08-23.md`
│   │   ├── ⚪ `icerik-hatti-1000-satir-tavani-filo-notu-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-anlatim-derinligi-2026-09-05.md`
│   │   ├── ⚪ `icerik-hatti-aralik-hucresi-2026-09-07.md`
│   │   ├── ⚪ `icerik-hatti-atex-malzeme-kanit-2026-09-07.md`
│   │   ├── ⚪ `icerik-hatti-avens-csv-kaynak-olcumu-2026-09-09.md`
│   │   ├── ⚪ `icerik-hatti-avens-katalog-hatalari-2026-09-05.md`
│   │   ├── ⚪ `icerik-hatti-birim-olcek-kusurlari-2026-09-07.md`
│   │   ├── ⚪ `icerik-hatti-bolum-aile-eslemesi-2026-09-05.md`
│   │   ├── ⚪ `icerik-hatti-faz2-inceleme-2026-09-07.md`
│   │   ├── ⚪ `icerik-hatti-faz4-canli-yazim-2026-09-07.md`
│   │   ├── ⚪ `icerik-hatti-faz4-hazirlik-2026-09-07.md`
│   │   ├── ⚪ `icerik-hatti-gorsel-envanteri-2026-09-08.md`
│   │   ├── ⚪ `icerik-hatti-kanit-daraltma-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-kategori-gorsel-2026-09-08.md`
│   │   ├── ⚪ `icerik-hatti-kategori-olcumu-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-kayip-urun-aktarimi-2026-09-07.md`
│   │   ├── ⚪ `icerik-hatti-kaynak-dizini-olcumu-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-kaynak-dizini-tazeleme-2026-09-07.md`
│   │   ├── ⚪ `icerik-hatti-musteri-belgeleri-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-pdf-yapisi-2026-09-05.md`
│   │   ├── ⚪ `icerik-hatti-rec178-olu-aday-olcumu-2026-09-07.md`
│   │   ├── ⚪ `icerik-hatti-recep-kararlari-uygulama-2026-09-08.md`
│   │   ├── ⚪ `icerik-hatti-sayfa-araliklari-2026-09-05.md`
│   │   ├── ⚪ `icerik-hatti-sensor-kategorisi-yazimi-2026-09-09.md`
│   │   ├── ⚪ `icerik-hatti-seri-metni-tek-model-kusuru-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-sessiz-bosluk-2026-09-05.md`
│   │   ├── ⚪ `icerik-hatti-tasinabilir-katalog-2026-09-07.md`
│   │   ├── ⚪ `icerik-hatti-taslak-avens-hucreli-siginak-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-avens-isitici-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-avens-plug-hrv-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-commercial-inline-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-danfoss-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-endustriyel-atex-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-hava-perdesi-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-heatmaster-slimroof-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-isi-geri-kazanim-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-kategori-rehber-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-lineo-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-nicotra-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-radon-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-seat-storm-jet-2026-09-05.md`
│   │   ├── ⚪ `icerik-hatti-taslak-vortice-konut-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-vortice-tekiller-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-taslak-vortice-ticari-2026-09-06.md`
│   │   ├── ⚪ `icerik-hatti-toplu-sunum-2026-09-06.md`
│   │   ├── ⚪ `karar-kayit-bagi-vitrin-15a-2026-09-07.md`
│   │   ├── ⚪ `kasa-ve-siralama-denetimi-2026-08-23.md`
│   │   ├── ⚪ `katalog-karnesi-2026-09-09.md`
│   │   ├── ⚪ `katalog-sayim-2026-09-03.md`
│   │   ├── ⚪ `legal-i18n-scope-antigravity-2026-06-16.md`
│   │   ├── ⚪ `lighthouse_diagnostic_2026-06-10.md`
│   │   ├── ⚪ `locale-kasa-envanteri-2026-08-23.md`
│   │   ├── ⚪ `matris-sutun-doluluk-2026-09-05.md`
│   │   ├── ⚪ `odeme-yolu-denetimi-2026-08-15.md`
│   │   ├── ⚪ `olu-sozluk-anahtari-olcumu-2026-09-06.md`
│   │   ├── ⚪ `operasyon-dongusu-denetimi-2026-08-15.md`
│   │   ├── ⚪ `product-schema-ground-truth-2026-06-21.md`
│   │   ├── ⚪ `rec124-katalog-veri-kusurlari-2026-09-04.md`
│   │   ├── ⚪ `rec146-kod-cakismasi-11936-2026-09-09.md`
│   │   ├── ⚪ `rec146-kodsuz-urun-cikarim-yolu-2026-09-09.md`
│   │   ├── ⚪ `rec146-red-team-csv-plani-2026-09-09.md`
│   │   ├── ⚪ `rec146-uydurma-kimlik-canli-yazim-2026-09-09.md`
│   │   ├── ⚪ `rec162-evren-muhafizi-adaylari-2026-09-06.md`
│   │   ├── ⚪ `rec176-skill-dogrulama-2026-09-07.md`
│   │   ├── ⚪ `rec179-evren-muhafizi-sinavi-2026-09-07.md`
│   │   ├── ⚪ `registry-triyaj-2026-08-26.md`
│   │   ├── ⚪ `render-stratejisi-denetimi-2026-08-16.md`
│   │   ├── ⚪ `secret-exposure-audit-2026-08-15.md`
│   │   ├── ⚪ `sir-ekrana-basma-olayi-2026-09-04.md`
│   │   ├── ⚪ `skill-envanteri-2026-09-05.md`
│   │   ├── ⚪ `t021-analytics-coverage-2026-08-19.md`
│   │   ├── ⚪ `t077-ad-arayan-iddia-taramasi-2026-08-17.md`
│   │   ├── ⚪ `t099-aile-icerik-uyumu-2026-08-18.md`
│   │   ├── ⚪ `t101-view-grant-hygiene-2026-08-19.md`
│   │   ├── ⚪ `t104-vaat-dayanagi-olcumu-2026-08-20.md`
│   │   ├── ⚪ `t114-payment-status-trigger-2026-08-19.md`
│   │   ├── ⚪ `t119-katalog-cikarim-dogrulama-2026-08-20.md`
│   │   ├── ⚪ `t128-erp-satinalma-karne-2026-08-20.md`
│   │   ├── ⚪ `t129-erp-stok-gerceklesme-karnesi-2026-08-20.md`
│   │   ├── ⚪ `t132-invoice-ledger-2026-08-20.md`
│   │   ├── ⚪ `t134-rbac-ui-db-parity-2026-08-20.md`
│   │   ├── ⚪ `t138-hiyerarsi-calismasi.md`
│   │   ├── ⚪ `t139-gun-sonu-raporu-2026-08-21.md`
│   │   ├── ⚪ `t139-urun-gorseli-pilotu-2026-08-21.md`
│   │   ├── ⚪ `t140-icerik-olcumu-2026-08-21.md`
│   │   ├── ⚪ `t143-hesaplama-motoru-envanteri-2026-08-21.md`
│   │   ├── ⚪ `t146-csv-import-kategori-slug-2026-08-23.md`
│   │   ├── ⚪ `t150-wizard-i18n-anahtarlari-2026-08-23.md`
│   │   ├── ⚪ `t162-lineo-birlestirme-2026-08-23.md`
│   │   ├── ⚪ `tasarim-kod-envanteri-2026-09-06.md`
│   │   ├── ⚪ `tasarim-sozlesmesi-fark-2026-09-05.md`
│   │   ├── ⚪ `teknik-bosluk-2026-09-06.md`
│   │   ├── ⚪ `vibe-coding-20-madde-denetimi-2026-08-13.md`
│   │   ├── ⚪ `vibe-coding-20-madde-v2-2026-08-16.md`
│   │   └── ⚪ `yetki-katmani-denetimi-2026-08-15.md`
│   ├── ⚪ `database_schema_master.md`
│   ├── ⚪ `design_system_config.md`
│   ├── ⚪ `kayitlar_master.md`
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
│   │   ├── ⚪ `claude-mem-deneme-plani-2026-09-08.md`
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
│   │   ├── ⚪ `kategori-esleme-2026-09-04.md`
│   │   ├── ⚪ `kategori-gorsel-tedarik-2026-09-08.md`
│   │   ├── ⚪ `lansman-oncesi-dayaniklilik-plani-2026-09-08.md`
│   │   ├── ⚪ `product-schema-master-implementation-plan.md`
│   │   ├── ⚪ `product-schema-standard-brief.md`
│   │   ├── ⚪ `rec-adres-agac-tek-yayin-2026-09-07.md`
│   │   ├── ⚪ `rec108-aile-adi-dil-zinciri-2026-09-01.md`
│   │   ├── ⚪ `rec110-114-117-migration-paketi-2026-09-01.md`
│   │   ├── ⚪ `rec117-misafir-teklif-akisi-2026-09-08.md`
│   │   ├── ⚪ `rec129-faz1-kabuk-plani-2026-09-04.md`
│   │   ├── ⚪ `rec146-avens-csv-yeniden-uretim-2026-09-09.md`
│   │   ├── ⚪ `rec158-foy-vitrin-bicim-paritesi-2026-09-06.md`
│   │   ├── ⚪ `rec162-vercel-kapisi-2026-09-06.md`
│   │   ├── ⚪ `rec168-migration-taslagi-2026-09-06.md`
│   │   ├── ⚪ `rec292-denetim-izi-2026-09-09.md`
│   │   ├── ⚪ `rec296-koken-allowlist-2026-09-09.md`
│   │   ├── ⚪ `rec52-whsec-rotasyon-plani-2026-09-06.md`
│   │   ├── ⚪ `red-team-rec129-faz1-2026-09-04.md`
│   │   ├── ⚪ `red-team-teklif-modu-2026-09-04.md`
│   │   ├── ⚪ `render-dalga1-plan-2026-08-17.md`
│   │   ├── ⚪ `saas-funding-and-packaging-2026-06.md`
│   │   ├── ⚪ `seo-transition-blueprint.md`
│   │   ├── ⚪ `slug-localization-2026-08-10.md`
│   │   ├── ⚪ `t047-role-source-plan-2026-08-17.md`
│   │   ├── ⚪ `t080-odeme-ekrani-bos-2026-08-17.md`
│   │   ├── ⚪ `t093-adres-il-ilce-2026-08-18.md`
│   │   ├── ⚪ `t116-odeme-defteri-tasarim-2026-08-20.md`
│   │   ├── ⚪ `teklif-modu-tutarlilik-paketi-2026-09-04.md`
│   │   ├── ⚪ `tenant-id-hardening-2026-08-15.md`
│   │   ├── ⚪ `urun-kimlik-duzeltme-2026-08-22.md`
│   │   ├── ⚪ `venthub-hikaye-sayfasi-skill-taslak-2026-09-05.md`
│   │   ├── ⚪ `venthub_hvac_unified_refactor_plan.md`
│   │   ├── ⚪ `venthub_saas_faz1_prompt.md`
│   │   └── ⚪ `venthub_saas_master_roadmap.md`
│   ├── 📂 **products/**
│   │   ├── ⚪ `AIR_DOOR_AD_900_MASTER.md`
│   │   └── ⚪ `AIR_DOOR_AD_900_SEO.md`
│   ├── 📂 **proje-takip/**
│   │   ├── ⚪ `celiski-mukerrerlik-analizi-2026-09-04.md`
│   │   ├── ⚪ `defter-hijyen-2026-09-06.md`
│   │   ├── 📂 **design/**
│   │   │   ├── ⚪ `INDEX-2026-09-06.md`
│   │   │   ├── 📂 **belge/**
│   │   │   │   ├── ⚪ `CLAUDE.md`
│   │   │   │   ├── ⚪ `alan-envanteri-2026-09-05.md`
│   │   │   │   ├── ⚪ `anahtar-ve-kip-haritasi-2026-09-04.md`
│   │   │   │   ├── ⚪ `antetli-ve-imza-notlar-2026-09-06.md`
│   │   │   │   ├── ⚪ `bayat-2026-09-05.md`
│   │   │   │   ├── ⚪ `bayat-2026-09-06.md`
│   │   │   │   ├── ⚪ `bekleyen-hukumler-2026-09-06.md`
│   │   │   │   ├── ⚪ `belge-kabugu-notlar.md`
│   │   │   │   ├── 📂 **brand/**
│   │   │   │   │   └── 📂 **logo/**
│   │   │   │   │       └── ⚪ `README.md`
│   │   │   │   ├── ⚪ `design-eklemeleri-e13-e17-2026-09-05.md`
│   │   │   │   ├── ⚪ `eposta-sablonlari-notlar.md`
│   │   │   │   ├── ⚪ `github.md`
│   │   │   │   ├── ⚪ `kapsam-ve-belge-sistemi-onerisi-2026-09-05.md`
│   │   │   │   ├── ⚪ `kararlar-katalog-2026-09-06.md`
│   │   │   │   ├── ⚪ `kararlar-kurumsal-belgeler-2026-09-06.md`
│   │   │   │   ├── ⚪ `kararlar-vitrin-15a-2026-09-04.md`
│   │   │   │   ├── ⚪ `kararlar-vitrin-15a-2026-09-06.md`
│   │   │   │   ├── ⚪ `kartvizit-notlar-2026-09-06.md`
│   │   │   │   ├── ⚪ `kvkk-seti-notlar-2026-09-06.md`
│   │   │   │   ├── ⚪ `linear-turu-2026-09-06-2.md`
│   │   │   │   ├── ⚪ `linear-turu-2026-09-06-3.md`
│   │   │   │   ├── ⚪ `ops-cevap-2026-09-06-belge-153-28-30.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-05-1-belge.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-05-2-cip.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-05-3-belge.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-05-4-belge.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-05-5-belge.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-1-belge.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-2-belge.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-3-belge.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-4-belge.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-5-belge.md`
│   │   │   │   ├── ⚪ `ops-iletisim-protokolu.md`
│   │   │   │   ├── ⚪ `satinalma-seti-notlar-2026-09-06.md`
│   │   │   │   ├── ⚪ `sorular-2026-09-06-2.md`
│   │   │   │   ├── ⚪ `sorular-2026-09-06-3.md`
│   │   │   │   ├── ⚪ `sorular-2026-09-06.md`
│   │   │   │   ├── ⚪ `urun-teknik-foyu-notlar.md`
│   │   │   │   ├── ⚪ `venthub-canli-durum.md`
│   │   │   │   └── ⚪ `yasal-set-notlar-2026-09-06.md`
│   │   │   ├── 📂 **ds/**
│   │   │   │   ├── ⚪ `SKILL.md`
│   │   │   │   ├── ⚪ `bayat-2026-09-05.md`
│   │   │   │   ├── ⚪ `bayat-2026-09-06.md`
│   │   │   │   ├── 📂 **brand/**
│   │   │   │   │   └── ⚪ `README.md`
│   │   │   │   ├── ⚪ `cip-cevrildi-denetim-istegi-2026-09-06.md`
│   │   │   │   ├── 📂 **components/**
│   │   │   │   │   ├── 📂 **dugme/**
│   │   │   │   │   │   ├── ⚪ `AnaEylemDugmesi.prompt.md`
│   │   │   │   │   │   ├── ⚪ `CerceveliDugme.prompt.md`
│   │   │   │   │   │   └── ⚪ `KatliCagriSatiri.prompt.md`
│   │   │   │   │   ├── 📂 **kabuk/**
│   │   │   │   │   │   └── ⚪ `KabukBandi.prompt.md`
│   │   │   │   │   ├── 📂 **veri/**
│   │   │   │   │   │   ├── ⚪ `AdetKontrolu.prompt.md`
│   │   │   │   │   │   ├── ⚪ `KarsilastirmaTablosu.prompt.md`
│   │   │   │   │   │   ├── ⚪ `PQEgrisi.prompt.md`
│   │   │   │   │   │   └── ⚪ `TeknikTablo.prompt.md`
│   │   │   │   │   └── 📂 **yuzey/**
│   │   │   │   │       ├── ⚪ `Cip.prompt.md`
│   │   │   │   │       └── ⚪ `Kart.prompt.md`
│   │   │   │   ├── ⚪ `design-marka-ds-kurulum-notlar-2026-09-05.md`
│   │   │   │   ├── ⚪ `ds-duzeltme-notlar-2026-09-05.md`
│   │   │   │   ├── ⚪ `emir-5-kapanis-notlar-2026-09-06.md`
│   │   │   │   ├── ⚪ `emir-6-notlar-2026-09-06.md`
│   │   │   │   ├── ⚪ `kararlar-katalog-2026-09-06.md`
│   │   │   │   ├── ⚪ `kararlar-kurumsal-belgeler-2026-09-06.md`
│   │   │   │   ├── ⚪ `kararlar-vitrin-15a-2026-09-06.md`
│   │   │   │   ├── ⚪ `karsilastirma-tablosu-karari-2026-09-06.md`
│   │   │   │   ├── ⚪ `ops-cevap-2026-09-06-ds-s1-s4.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-05-1-ds.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-05-2-cip.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-05-3-ds-kapanis.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-1-ds.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-2-ds.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-3-ds.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-4-ds.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-5-ds.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-6-ds.md`
│   │   │   │   ├── ⚪ `ops-iletisim-protokolu.md`
│   │   │   │   ├── ⚪ `readme.md`
│   │   │   │   ├── ⚪ `sorular-2026-09-06.md`
│   │   │   │   ├── 📂 **templates/**
│   │   │   │   │   └── 📂 **kabuk/**
│   │   │   │   │       └── ⚪ `README.md`
│   │   │   │   └── 📂 **ui_kits/**
│   │   │   │       └── 📂 **kabuk/**
│   │   │   │           └── ⚪ `README.md`
│   │   │   ├── 📂 **marka/**
│   │   │   │   ├── ⚪ `0 OKU-BENI.md`
│   │   │   │   ├── ⚪ `CLAUDE.md`
│   │   │   │   ├── ⚪ `bayat-2026-09-05.md`
│   │   │   │   ├── ⚪ `bayat-2026-09-06.md`
│   │   │   │   ├── 📂 **brand/**
│   │   │   │   │   ├── ⚪ `README.md`
│   │   │   │   │   └── 📂 **logo/**
│   │   │   │   │       └── ⚪ `README.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-b.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-c.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-d.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-e.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-f.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-g.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-h.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-i.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-j.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-k.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-l.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-m.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-n.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-p.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05-r.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-05.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-06-b.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-06-c.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-06-d.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-06-e.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-06-f.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-06-g.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-06-h.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-06-i.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-06-j.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-06-k.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-06-l.md`
│   │   │   │   ├── ⚪ `design-marka-ops-notu-2026-09-06.md`
│   │   │   │   ├── ⚪ `github.md`
│   │   │   │   ├── 📂 **handoff/**
│   │   │   │   │   └── ⚪ `README.md`
│   │   │   │   ├── ⚪ `kararlar-katalog-2026-09-06.md`
│   │   │   │   ├── ⚪ `kararlar-kurumsal-belgeler-2026-09-06.md`
│   │   │   │   ├── ⚪ `kararlar-vitrin-15a-2026-09-06.md`
│   │   │   │   ├── ⚪ `marka-deney-brief-1.md`
│   │   │   │   ├── ⚪ `ops-cevap-marka-2026-09-05.md`
│   │   │   │   ├── ⚪ `ops-cevap-marka-b-2026-09-05.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-05-1-marka.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-05-2-cip.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-05-2-marka.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-2-ds.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-3-ds.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-4-marka.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-5-marka.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-6-marka.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-7-marka.md`
│   │   │   │   ├── ⚪ `ops-emir-2026-09-06-8-marka.md`
│   │   │   │   ├── ⚪ `ops-iletisim-protokolu.md`
│   │   │   │   ├── ⚪ `venthub-canli-durum.md`
│   │   │   │   └── ⚪ `venthub-proje-ayarlari.md`
│   │   │   └── 📂 **menu/**
│   │   │       ├── ⚪ `CLAUDE.md`
│   │   │       ├── ⚪ `DEVIR.md`
│   │   │       ├── ⚪ `ana-sayfa-brief.md`
│   │   │       ├── ⚪ `bayat-2026-09-05.md`
│   │   │       ├── ⚪ `bayat-2026-09-06.md`
│   │   │       ├── ⚪ `bosluk-listesi-2026-09-04.md`
│   │   │       ├── ⚪ `bosluk-listesi-v2.md`
│   │   │       ├── 📂 **brand/**
│   │   │       │   └── 📂 **logo/**
│   │   │       │       └── ⚪ `README.md`
│   │   │       ├── ⚪ `desen-envanteri-2026-09-06.md`
│   │   │       ├── ⚪ `geri-bildirim-1.md`
│   │   │       ├── ⚪ `geri-bildirim-10.md`
│   │   │       ├── ⚪ `geri-bildirim-2.md`
│   │   │       ├── ⚪ `geri-bildirim-3.md`
│   │   │       ├── ⚪ `geri-bildirim-4.md`
│   │   │       ├── ⚪ `geri-bildirim-5.md`
│   │   │       ├── ⚪ `geri-bildirim-6.md`
│   │   │       ├── ⚪ `geri-bildirim-7.md`
│   │   │       ├── ⚪ `geri-bildirim-8.md`
│   │   │       ├── ⚪ `geri-bildirim-9.md`
│   │   │       ├── ⚪ `github.md`
│   │   │       ├── ⚪ `gozden-gecirme-brief.md`
│   │   │       ├── ⚪ `gozden-gecirme-bulgular-v1.md`
│   │   │       ├── ⚪ `gozden-gecirme-eleme-v1.md`
│   │   │       ├── ⚪ `ham-hex-beyani-2026-09-06.md`
│   │   │       ├── ⚪ `kabuk-v2-notlar.md`
│   │   │       ├── ⚪ `kararlar-katalog-2026-09-06.md`
│   │   │       ├── ⚪ `kararlar-kurumsal-belgeler-2026-09-06.md`
│   │   │       ├── ⚪ `kararlar-vitrin-15a-2026-09-04.md`
│   │   │       ├── ⚪ `kararlar-vitrin-15a-2026-09-06.md`
│   │   │       ├── ⚪ `kararlar-vitrin-15a.md`
│   │   │       ├── ⚪ `kart-mount-olcumu-2026-09-06.md`
│   │   │       ├── ⚪ `madde82-denetim-2026-09-05.md`
│   │   │       ├── ⚪ `menu-v17-olcum-2026-09-06.md`
│   │   │       ├── ⚪ `mobil-kisayol-oneriler.md`
│   │   │       ├── ⚪ `ops-devir-eki-2026-09-06-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-05-1-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-05-2-cip.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-05-3-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-05-4-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-05-5-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-05-6-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-05-7-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-05-8-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-06-1-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-06-10-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-06-2-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-06-3-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-06-4-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-06-5-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-06-6-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-06-7-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-06-8-menu.md`
│   │   │       ├── ⚪ `ops-emir-2026-09-06-9-menu.md`
│   │   │       ├── ⚪ `ops-iletisim-protokolu.md`
│   │   │       ├── ⚪ `secim-motoru-kapsam-haritasi-taslak.md`
│   │   │       ├── ⚪ `sogukgiris-oneriler.md`
│   │   │       ├── ⚪ `systemair-incelemesi-ve-kabuk-v2.md`
│   │   │       ├── ⚪ `systemair-olcum-raporu.md`
│   │   │       ├── ⚪ `tasarim-sozlesmesi-notlar.md`
│   │   │       ├── ⚪ `tasarim-sozlesmesi-sema.md`
│   │   │       ├── ⚪ `urun-sayfasi-v2-notlar.md`
│   │   │       ├── ⚪ `v14-notlar.md`
│   │   │       ├── ⚪ `v15-notlar.md`
│   │   │       ├── ⚪ `v3-notlar.md`
│   │   │       ├── ⚪ `venthub-canli-durum.md`
│   │   │       └── ⚪ `zorunlu-icerik-haritasi.md`
│   │   ├── 📂 **design-15a/**
│   │   │   ├── ⚪ `DESIGN-gozden-gecirme-bulgular-v1.md`
│   │   │   ├── ⚪ `DESIGN-mobil-kisayol-oneriler.md`
│   │   │   ├── ⚪ `DESIGN-sogukgiris-oneriler.md`
│   │   │   ├── ⚪ `DESIGN-v14-notlar.md`
│   │   │   ├── ⚪ `DESIGN-v15-notlar.md`
│   │   │   ├── ⚪ `DESIGN-zorunlu-icerik-haritasi.md`
│   │   │   ├── ⚪ `bosluk-listesi-2026-09-04.md`
│   │   │   ├── ⚪ `geri-bildirim-5.md`
│   │   │   ├── ⚪ `geri-bildirim-6.md`
│   │   │   ├── ⚪ `geri-bildirim-7.md`
│   │   │   ├── ⚪ `geri-bildirim-8.md`
│   │   │   ├── ⚪ `geri-bildirim-9.md`
│   │   │   ├── ⚪ `gozden-gecirme-brief.md`
│   │   │   ├── ⚪ `secim-motoru-kapsam-haritasi-taslak.md`
│   │   │   └── ⚪ `venthub-canli-durum.md`
│   │   ├── ⚪ `gun-kapanisi-2026-09-07.md`
│   │   ├── ⚪ `hafiza-sinavi-sonuc.md`
│   │   ├── ⚪ `is-dagilimi.md`
│   │   ├── 📂 **linear/**
│   │   │   ├── ⚪ `anahtar-ve-kip-haritasi-2026-09-04.md`
│   │   │   ├── ⚪ `is-dagilimi-2026-09-07.md`
│   │   │   ├── ⚪ `is-dagilimi-2026-09-09.md`
│   │   │   ├── ⚪ `kararlar-altyapi-2026-09-09.md`
│   │   │   ├── ⚪ `kararlar-katalog-2026-09-09.md`
│   │   │   ├── ⚪ `kararlar-kurumsal-belgeler-2026-09-09.md`
│   │   │   ├── ⚪ `kararlar-marka-kilavuzu-2026-09-09.md`
│   │   │   ├── ⚪ `kararlar-seo-ve-yayin-2026-09-09.md`
│   │   │   ├── ⚪ `kararlar-teklif-akisi-2026-09-09.md`
│   │   │   ├── ⚪ `kararlar-vitrin-15a-2026-09-09.md`
│   │   │   └── ⚪ `venthub-yol-haritasi-ve-durum.md`
│   │   ├── ⚪ `recep-bekleyen.md`
│   │   └── ⚪ `yol-haritasi-durum.md`
│   ├── ⚪ `recep-komut-rehberi.md`
│   ├── 📂 **reference/**
│   │   ├── 📂 **supabase/**
│   │   │   ├── ⚪ `auth-hooks.md`
│   │   │   ├── ⚪ `custom-claims-and-role-based-access-control-rbac.md`
│   │   │   ├── ⚪ `realtime-authorization.md`
│   │   │   └── ⚪ `row-level-security.md`
│   │   └── ⚪ `vortice_catalogs.md`
│   ├── 📂 **research/**
│   │   ├── ⚪ `t134-acik-kaynak-erp-2026-08-20.md`
│   │   ├── ⚪ `t134-cpq-proposal-saha-2026-08-20.md`
│   │   └── ⚪ `t134-sentez-karar-tablosu-2026-08-20.md`
│   ├── 📂 **screenshots/**
│   │   └── ⚪ `README.md`
│   ├── 📂 **skill-gozlemleri/**
│   │   ├── ⚪ `README.md`
│   │   ├── 📂 **acik/**
│   │   │   ├── ⚪ `2026-09-08-kaynak-alinan-bizden.md`
│   │   │   ├── ⚪ `2026-09-08-olcmeden-hukum-verme.md`
│   │   │   └── ⚪ `2026-09-09-bilgi-kaynagini-kod-gibi-degerlendirme.md`
│   │   └── 📂 **arsiv/**
│   ├── 📂 **standards/**
│   │   ├── ⚪ `3d-scene-lighting-research.md`
│   │   ├── ⚪ `3d-showroom-ux-research.md`
│   │   ├── ⚪ `3d-webgl-standard.md`
│   │   ├── ⚪ `SOURCES.md`
│   │   ├── ⚪ `admin-capabilities.md`
│   │   ├── ⚪ `admin-design-standard.md`
│   │   ├── ⚪ `admin-standard.md`
│   │   ├── ⚪ `aile-metni-sayisal-standard.md`
│   │   ├── ⚪ `analytics-standard.md`
│   │   ├── ⚪ `arac-envanteri-standard.md`
│   │   ├── ⚪ `auth-account-standard.md`
│   │   ├── ⚪ `canonical-url-standard.md`
│   │   ├── ⚪ `catalog-depth-standard.md`
│   │   ├── ⚪ `catalog-ingestion-standard.md`
│   │   ├── ⚪ `category-taxonomy-standard.md`
│   │   ├── ⚪ `checkout-payment-standard.md`
│   │   ├── ⚪ `ci-runner-install-standard.md`
│   │   ├── ⚪ `collaboration-protocol.md`
│   │   ├── ⚪ `commerce-domain-map-standard.md`
│   │   ├── ⚪ `companion-doc-standard.md`
│   │   ├── ⚪ `crm-standard.md`
│   │   ├── ⚪ `csp-standard.md`
│   │   ├── ⚪ `csv-import-export-standard.md`
│   │   ├── ⚪ `customer-account-standard.md`
│   │   ├── ⚪ `db-grant-hygiene-standard.md`
│   │   ├── ⚪ `dealer-module-blueprint.md`
│   │   ├── ⚪ `dealer-network-standard.md`
│   │   ├── ⚪ `denetim-izi-standard.md`
│   │   ├── ⚪ `dependency-integrity-standard.md`
│   │   ├── ⚪ `deploy-build-skip-standard.md`
│   │   ├── ⚪ `document-numbering-standard.md`
│   │   ├── ⚪ `edge-function-security-standard.md`
│   │   ├── ⚪ `email-template-standard.md`
│   │   ├── ⚪ `erp-workspace-design-standard.md`
│   │   ├── ⚪ `execution-method-standard.md`
│   │   ├── ⚪ `fleet-mechanism-standard.md`
│   │   ├── ⚪ `form-submission-standard.md`
│   │   ├── ⚪ `hafiza-kancalari-standard.md`
│   │   ├── ⚪ `i18n-localization-standard.md`
│   │   ├── ⚪ `i18n-ters-yon-standard.md`
│   │   ├── ⚪ `is-kayit-duzeni-standard.md`
│   │   ├── ⚪ `katalog-sayim-standard.md`
│   │   ├── ⚪ `kategori-adlandirma-standard.md`
│   │   ├── ⚪ `legal-compliance-standard.md`
│   │   ├── ⚪ `marka-token-eslemesi-standard.md`
│   │   ├── ⚪ `matris-gorunum-standard.md`
│   │   ├── ⚪ `measurement-discipline-standard.md`
│   │   ├── ⚪ `migration-safety-standard.md`
│   │   ├── ⚪ `mockup-gelisim-hatti-standardi.md`
│   │   ├── ⚪ `multi-session-coordination-standard.md`
│   │   ├── ⚪ `notification-standard.md`
│   │   ├── ⚪ `pano-orion-koprusu-standardi.md`
│   │   ├── ⚪ `payment-ledger-standard.md`
│   │   ├── ⚪ `pricing-standard.md`
│   │   ├── ⚪ `product-image-standard.md`
│   │   ├── ⚪ `product-schema-standard.md`
│   │   ├── ⚪ `proje-takip-defteri-standard.md`
│   │   ├── ⚪ `purchasing-standard.md`
│   │   ├── ⚪ `quote-standard.md`
│   │   ├── ⚪ `rendering-cache-standard.md`
│   │   ├── ⚪ `runtime-version-alignment-standard.md`
│   │   ├── ⚪ `satis-kipi-gecis-standard.md`
│   │   ├── ⚪ `session-loop-ritual.md`
│   │   ├── ⚪ `settled-work-standard.md`
│   │   ├── ⚪ `spec-axis-standard.md`
│   │   ├── ⚪ `storefront-design-standard.md`
│   │   ├── ⚪ `storefront-reflow-standard.md`
│   │   ├── ⚪ `subagent-delegation-standard.md`
│   │   ├── ⚪ `tasarim-yetenek-standard.md`
│   │   ├── ⚪ `uretilmis-artefakt-standard.md`
│   │   ├── ⚪ `urun-yapisal-veri-standard.md`
│   │   ├── ⚪ `vaat-butunlugu-standard.md`
│   │   └── ⚪ `work-tracking-ssot-standard.md`
│   ├── ⚪ `standards_master.md`
│   ├── ⚪ `supabase_functions_master.md`
│   ├── ⚪ `system_tree.md`
│   ├── ⚪ `venthub_hvac_master.md`
│   └── ⚪ `venthub_skills_master.md`
├── 📂 **e2e/**
│   ├── ✅ `admin-smoke.e2e.ts`
│   ├── ✅ `checkout-smoke.e2e.ts`
│   ├── ✅ `reflow.e2e.ts`
│   └── ✅ `ssr-html.e2e.ts`
├── ⚠️ `eslint.config.md`
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
│   │   │   │   ├── 📂 **data-requests/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **favorites/**
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
│   │   │   │   ├── 📂 **projects/**
│   │   │   │   │   └── ✅ `page.tsx`
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
│   │   │   ├── 📂 **products/**
│   │   │   │   ├── 📂 **[slug]/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   └── ✅ `page.tsx`
│   │   │   └── 📂 **urun-secici/**
│   │   │       └── ❌ `page.tsx`
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
│   │   │   ├── 📂 **data-requests/**
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
│   │   │   ├── 📂 **invoices/**
│   │   │   │   └── ✅ `page.tsx`
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
│   │   │   │   ├── 📂 **policies/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   ├── 📂 **preview/**
│   │   │   │   │   └── ✅ `page.tsx`
│   │   │   │   └── 📂 **rules/**
│   │   │   │       └── ✅ `page.tsx`
│   │   │   ├── 📂 **products/**
│   │   │   │   └── ✅ `page.tsx`
│   │   │   ├── 📂 **purchasing/**
│   │   │   │   └── ✅ `page.tsx`
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
│   │   │   │   └── ✅ `route.ts`
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
│   │   │   │   ├── ✅ `DataTablePagination.tsx`
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
│   │   │   │   ├── ✅ `PricingPolicyFormModal.tsx`
│   │   │   │   ├── ✅ `PricingRuleFormModal.tsx`
│   │   │   │   ├── ✅ `PricingSettingsFormModal.tsx`
│   │   │   │   └── ✅ `RuleScopeTargetPicker.tsx`
│   │   │   ├── 📂 **products/**
│   │   │   │   ├── ✅ `ProductCsvImport.tsx`
│   │   │   │   ├── ✅ `ProductFormModal.tsx`
│   │   │   │   └── ✅ `ProductHealthBadge.tsx`
│   │   │   ├── 📂 **purchasing/**
│   │   │   │   └── ✅ `CreatePurchaseOrderPanel.tsx`
│   │   │   ├── 📂 **settings/**
│   │   │   │   └── ✅ `SettingsFormModal.tsx`
│   │   │   └── 📂 **shell/**
│   │   │       ├── ✅ `AdminPageHeader.tsx`
│   │   │       ├── ✅ `AdminSidebar.tsx`
│   │   │       ├── ✅ `AdminThemeToggle.tsx`
│   │   │       ├── ✅ `navCookie.ts`
│   │   │       ├── ✅ `themeCookie.ts`
│   │   │       └── ✅ `useAdminThemeBodyScope.ts`
│   │   ├── 📂 **analytics/**
│   │   │   └── ✅ `ConsentGatedAnalytics.tsx`
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
│   │   │   ├── ✅ `StepIndicator.tsx`
│   │   │   └── ❌ `UrlParametreOkuyucu.tsx`
│   │   ├── 📂 **category/**
│   │   │   ├── ✅ `CategoryAuthoritySection.tsx`
│   │   │   ├── ✅ `CategoryFilters.tsx`
│   │   │   ├── ✅ `CategoryShowcase.tsx`
│   │   │   ├── ✅ `EducationalGuide.tsx`
│   │   │   ├── ✅ `EnhancedNeedsWizard.tsx`
│   │   │   ├── ✅ `NeedsAnalysisWizard.tsx`
│   │   │   ├── ✅ `SilentFanWizard.test.tsx`
│   │   │   ├── ✅ `SilentFanWizard.tsx`
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
│   │   │   └── ✅ `CookiePreferencesButton.tsx`
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
│   │   │   ├── ❌ `HeaderTeklifPaneli.tsx`
│   │   │   ├── ✅ `MegaMenu3DBackground.tsx`
│   │   │   ├── ❌ `MobilAltSekmeCubugu.tsx`
│   │   │   ├── ✅ `NavActionButton.tsx`
│   │   │   ├── ✅ `NavBrand.tsx`
│   │   │   ├── ✅ `NavPrimaryRail.tsx`
│   │   │   ├── ✅ `NavSearchTrigger.tsx`
│   │   │   ├── ✅ `NavSecondaryRail.tsx`
│   │   │   ├── ✅ `NavShell.tsx`
│   │   │   ├── ✅ `NavUtilityRail.tsx`
│   │   │   └── ❌ `TeklifPaneliIcerigi.tsx`
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
│   │   │   ├── ✅ `VariantSelector.tsx`
│   │   │   └── 📂 **visual-models/**
│   │   ├── 📂 **quotes/**
│   │   │   ├── ✅ `QuoteRequestButton.tsx`
│   │   │   └── ✅ `QuoteRequestModal.tsx`
│   │   └── 📂 **ui/**
│   │       ├── ✅ `Pagination.tsx`
│   │       ├── ✅ `ScrollObserver.tsx`
│   │       ├── ✅ `Skeleton.tsx`
│   │       └── ✅ `VentImage.tsx`
│   ├── 📂 **config/**
│   │   ├── ✅ `admin-resources.ts`
│   │   ├── ✅ `admin.ts`
│   │   ├── ✅ `applications.ts`
│   │   ├── ✅ `features.ts`
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
│   │   ├── ✅ `useCalculatorUsage.ts`
│   │   ├── ✅ `useCartHook.ts`
│   │   ├── ✅ `useCategoryGateway.ts`
│   │   ├── ✅ `useCategoryViewModel.ts`
│   │   ├── ✅ `useCheckoutCoupon.ts`
│   │   ├── ✅ `useCheckoutOrchestrator.ts`
│   │   ├── ✅ `useCheckoutPayment.ts`
│   │   ├── ✅ `useDragScroll.ts`
│   │   ├── ✅ `useFavorites.ts`
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
│   │   ├── ✅ `case.ts`
│   │   ├── ✅ `currency.ts`
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
│   │   │   │   ├── ✅ `dataRequests.en.ts`
│   │   │   │   ├── ✅ `dataRequests.tr.ts`
│   │   │   │   ├── ✅ `dataTable.en.ts`
│   │   │   │   ├── ✅ `dataTable.tr.ts`
│   │   │   │   ├── ✅ `en.ts`
│   │   │   │   ├── ✅ `errorGroups.en.ts`
│   │   │   │   ├── ✅ `errorGroups.tr.ts`
│   │   │   │   ├── ✅ `errors.en.ts`
│   │   │   │   ├── ✅ `errors.tr.ts`
│   │   │   │   ├── ✅ `inventory.en.ts`
│   │   │   │   ├── ✅ `inventory.tr.ts`
│   │   │   │   ├── ✅ `invoices.en.ts`
│   │   │   │   ├── ✅ `invoices.tr.ts`
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
│   │   │   │   ├── ✅ `purchasing.en.ts`
│   │   │   │   ├── ✅ `purchasing.tr.ts`
│   │   │   │   ├── ✅ `returns.en.ts`
│   │   │   │   ├── ✅ `returns.tr.ts`
│   │   │   │   ├── ✅ `search.en.ts`
│   │   │   │   ├── ✅ `search.tr.ts`
│   │   │   │   ├── ✅ `settings.en.ts`
│   │   │   │   ├── ✅ `settings.tr.ts`
│   │   │   │   ├── ✅ `theme.en.ts`
│   │   │   │   ├── ✅ `theme.tr.ts`
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
│   │   ├── ✅ `getDictValue.ts`
│   │   ├── ✅ `sort.ts`
│   │   └── ❌ `yoldanDil.ts`
│   ├── 📂 **lib/**
│   │   ├── 📂 **admin/**
│   │   │   ├── ✅ `csvProductMapping.ts`
│   │   │   ├── ✅ `inboxCounts.ts`
│   │   │   ├── ✅ `mutateWithAudit.ts`
│   │   │   ├── ✅ `orderStatusDomain.ts`
│   │   │   ├── ✅ `orderStatusLabels.ts`
│   │   │   ├── ✅ `orderStatusMachine.ts`
│   │   │   ├── ✅ `returnStatusMachine.ts`
│   │   │   └── 📂 **search/**
│   │   │       └── ✅ `resourceSearchers.ts`
│   │   ├── ✅ `audit.ts`
│   │   ├── 📂 **cache/**
│   │   │   └── ✅ `tags.ts`
│   │   ├── 📂 **consent/**
│   │   ├── 📂 **data/**
│   │   │   ├── ✅ `csvImportGuard.ts`
│   │   │   ├── ✅ `preload.ts`
│   │   │   ├── ✅ `productRoute.ts`
│   │   │   └── ✅ `selectVariant.ts`
│   │   ├── ✅ `ensureSessionFresh.ts`
│   │   ├── ✅ `errorReporter.ts`
│   │   ├── 📂 **hvac/**
│   │   │   ├── ✅ `ductFanSelection.ts`
│   │   │   └── ✅ `ductPressure.ts`
│   │   ├── ✅ `hvacCalculations.ts`
│   │   ├── 📂 **i18n/**
│   │   │   └── ❌ `familyName.ts`
│   │   ├── 📂 **images/**
│   │   │   ├── ❌ `categoryImage.ts`
│   │   │   └── ✅ `productImage.ts`
│   │   ├── 📂 **kip/**
│   │   │   └── ❌ `satisKipi.ts`
│   │   ├── 📂 **kvkk/**
│   │   │   └── ✅ `dueState.ts`
│   │   ├── ✅ `order.ts`
│   │   ├── ✅ `orderStatusService.ts`
│   │   ├── ✅ `pdfAssets.ts`
│   │   ├── ✅ `pdfGenerator.ts`
│   │   ├── 📂 **pricing/**
│   │   │   └── ❌ `quoteMode.ts`
│   │   ├── 📂 **purchasing/**
│   │   │   └── ✅ `poStatusMachine.ts`
│   │   ├── 📂 **quotes/**
│   │   │   └── ✅ `quoteStatusMachine.ts`
│   │   ├── ✅ `rbac.ts`
│   │   ├── 📂 **seo/**
│   │   │   ├── ❌ `canonicalOrigin.ts`
│   │   │   ├── ❌ `indexnow.ts`
│   │   │   └── ✅ `jsonld.ts`
│   │   ├── 📂 **services/**
│   │   │   ├── ✅ `address.service.ts`
│   │   │   ├── ✅ `cart.service.ts`
│   │   │   ├── ✅ `category.service.ts`
│   │   │   ├── ✅ `contactMessageService.ts`
│   │   │   ├── ✅ `dataSubjectRequest.service.ts`
│   │   │   ├── ✅ `displayPrice.service.ts`
│   │   │   ├── ✅ `family.service.ts`
│   │   │   ├── ✅ `fxLockAdmin.service.ts`
│   │   │   ├── ✅ `fxRate.service.ts`
│   │   │   ├── ✅ `inventoryReport.service.ts`
│   │   │   ├── ✅ `invoice.service.ts`
│   │   │   ├── ✅ `orderInvoice.service.ts`
│   │   │   ├── ✅ `pricing.service.ts`
│   │   │   ├── ✅ `pricingAdmin.service.ts`
│   │   │   ├── ✅ `pricingMaterialize.service.ts`
│   │   │   ├── ✅ `pricingPolicy.service.ts`
│   │   │   ├── ✅ `product.columns.ts`
│   │   │   ├── ✅ `product.service.ts`
│   │   │   ├── ✅ `project.service.ts`
│   │   │   ├── ✅ `purchasing.service.ts`
│   │   │   ├── ✅ `quoteService.ts`
│   │   │   ├── ✅ `registry.ts`
│   │   │   └── ✅ `wizard.service.ts`
│   │   ├── 📂 **supabase/**
│   │   │   ├── ✅ `client.ts`
│   │   │   ├── ✅ `server.ts`
│   │   │   ├── ✅ `static.ts`
│   │   │   └── ❌ `tumSatirlar.ts`
│   │   ├── ✅ `supabase.ts`
│   │   ├── ✅ `tenantResolver.ts`
│   │   ├── ✅ `type-converters.ts`
│   │   ├── ✅ `utils.ts`
│   │   └── 📂 **validation/**
│   │       ├── ✅ `invoiceIdentity.ts`
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
│   │   ├── ✅ `jsdom.d.ts`
│   │   ├── ✅ `media.types.ts`
│   │   └── ✅ `ui-models.ts`
│   ├── 📂 **utils/**
│   │   ├── ✅ `3dModelOffsets.ts`
│   │   ├── ✅ `adminQueryFilters.ts`
│   │   ├── ✅ `adminShipping.ts`
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
│   │   ├── ❌ `icIngestNotu.ts`
│   │   ├── ✅ `imageUtils.ts`
│   │   ├── ✅ `navigationConfig.ts`
│   │   ├── ✅ `passwordSecurity.ts`
│   │   ├── ✅ `prefetch.ts`
│   │   ├── ✅ `productHelpers.ts`
│   │   ├── ✅ `router.ts`
│   │   ├── ✅ `routes.ts`
│   │   ├── ✅ `searchHighlight.tsx`
│   │   ├── ❌ `siparisNo.ts`
│   │   ├── ✅ `specLabel.ts`
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
│       ├── ✅ `ResetPasswordPage.tsx`
│       ├── 📂 **account/**
│       │   ├── ✅ `AccountAddressesPage.tsx`
│       │   ├── ✅ `AccountInvoicesPage.tsx`
│       │   ├── ✅ `AccountLayout.tsx`
│       │   ├── ✅ `AccountOverviewPage.tsx`
│       │   ├── ✅ `AccountProfilePage.tsx`
│       │   ├── ✅ `AccountReturnsPage.tsx`
│       │   ├── ✅ `AccountSecurityPage.tsx`
│       │   ├── ✅ `AccountShipmentsPage.tsx`
│       │   ├── ✅ `DataRequestsPage.tsx`
│       │   ├── ✅ `FavoritesPage.tsx`
│       │   ├── ✅ `OrderDetailPage.tsx`
│       │   ├── ✅ `ProjectsPage.tsx`
│       │   └── 📂 **quotes/**
│       │       ├── ✅ `AccountQuotesPage.tsx`
│       │       └── ✅ `QuoteDetailPage.tsx`
│       ├── 📂 **admin/**
│       │   ├── ✅ `AdminAuditLogPage.tsx`
│       │   ├── ✅ `AdminCategoriesPage.tsx`
│       │   ├── ✅ `AdminCouponsPage.tsx`
│       │   ├── ✅ `AdminDashboardPage.tsx`
│       │   ├── ✅ `AdminDataRequestsPage.tsx`
│       │   ├── ✅ `AdminDataRequestsTableBody.tsx`
│       │   ├── ✅ `AdminErrorGroupsPage.tsx`
│       │   ├── ✅ `AdminErrorsPage.tsx`
│       │   ├── ✅ `AdminInventoryPage.tsx`
│       │   ├── ✅ `AdminInventoryReportPage.tsx`
│       │   ├── ✅ `AdminInventorySettingsPage.tsx`
│       │   ├── ✅ `AdminInvoicesPage.tsx`
│       │   ├── ✅ `AdminInvoicesTableBody.tsx`
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
│       │   ├── ✅ `PricingPoliciesTableBody.tsx`
│       │   ├── ✅ `PricingRulesTableBody.tsx`
│       │   ├── ✅ `ProductsTableBody.tsx`
│       │   ├── ✅ `ReturnsTableBody.tsx`
│       │   ├── ✅ `WebhookEventsTableBody.tsx`
│       │   ├── 📂 **purchasing/**
│       │   │   ├── ✅ `AdminPurchasingPage.tsx`
│       │   │   └── ✅ `PurchasingTableBody.tsx`
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
│       │   ├── ✅ `CategoryShowcaseView.tsx`
│       │   └── ✅ `SeriesLandingView.tsx`
│       ├── 📂 **checkout/**
│       │   ├── ✅ `AddressFormModal.tsx`
│       │   ├── ✅ `AddressSelectModal.tsx`
│       │   ├── ✅ `CheckoutProgress.tsx`
│       │   ├── ✅ `InvoiceProfileModal.tsx`
│       │   ├── ✅ `OdemeKapaliBilgi.tsx`
│       │   ├── ✅ `OrderSummarySidebar.tsx`
│       │   ├── ✅ `PaymentIframeContainer.tsx`
│       │   ├── ✅ `ReviewSummary.tsx`
│       │   ├── ✅ `SecurePaymentOverlay.tsx`
│       │   ├── ✅ `StepAddressInfo.tsx`
│       │   ├── ✅ `StepCustomerInfo.tsx`
│       │   ├── ✅ `buildPaymentRequest.ts`
│       │   └── ✅ `injectCheckoutForm.ts`
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
│   │   │   ├── ✅ `config_audit.ts`
│   │   │   ├── ✅ `cors.ts`
│   │   │   ├── ✅ `notify.ts`
│   │   │   ├── ✅ `origins.ts`
│   │   │   ├── ✅ `rate_limit.ts`
│   │   │   ├── ✅ `refund_guard.ts`
│   │   │   ├── ✅ `return_transitions.ts`
│   │   │   ├── ✅ `revenue_alarm.ts`
│   │   │   ├── ✅ `sentry.ts`
│   │   │   ├── ✅ `tenant.ts`
│   │   │   ├── ✅ `tenant_config.ts`
│   │   │   └── ❌ `tum_satirlar.ts`
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
│   │   ├── 📂 **order-paid-webhook/**
│   │   ├── 📂 **order-validate/**
│   │   ├── 📂 **quote-notification-webhook/**
│   │   ├── 📂 **quote-request-guest/**
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
├── ✅ `tailwind.config.js`
├── 📂 **testsprite_tests/**
│   └── 📂 **tmp/**
└── ✅ `vitest.smoke.config.ts`
```

## Eksik Dokümantasyonlar
- [ ] `src\app\[lang]\urun-secici\page.tsx`
- [ ] `src\components\calculators\UrlParametreOkuyucu.tsx`
- [ ] `src\components\navigation\HeaderTeklifPaneli.tsx`
- [ ] `src\components\navigation\MobilAltSekmeCubugu.tsx`
- [ ] `src\components\navigation\TeklifPaneliIcerigi.tsx`
- [ ] `src\i18n\yoldanDil.ts`
- [ ] `src\lib\i18n\familyName.ts`
- [ ] `src\lib\images\categoryImage.ts`
- [ ] `src\lib\kip\satisKipi.ts`
- [ ] `src\lib\pricing\quoteMode.ts`
- [ ] `src\lib\seo\canonicalOrigin.ts`
- [ ] `src\lib\seo\indexnow.ts`
- [ ] `src\lib\supabase\tumSatirlar.ts`
- [ ] `src\utils\icIngestNotu.ts`
- [ ] `src\utils\siparisNo.ts`
- [ ] `supabase\functions\_shared\tum_satirlar.ts`
- [ ] `src\app\[lang]\urun-secici\page.tsx`
- [ ] `src\components\calculators\UrlParametreOkuyucu.tsx`
- [ ] `src\components\navigation\HeaderTeklifPaneli.tsx`
- [ ] `src\components\navigation\MobilAltSekmeCubugu.tsx`
- [ ] `src\components\navigation\TeklifPaneliIcerigi.tsx`
- [ ] `src\i18n\yoldanDil.ts`
- [ ] `src\lib\i18n\familyName.ts`
- [ ] `src\lib\images\categoryImage.ts`
- [ ] `src\lib\kip\satisKipi.ts`
- [ ] `src\lib\pricing\quoteMode.ts`
- [ ] `src\lib\seo\canonicalOrigin.ts`
- [ ] `src\lib\seo\indexnow.ts`
- [ ] `src\lib\supabase\tumSatirlar.ts`
- [ ] `src\utils\icIngestNotu.ts`
- [ ] `src\utils\siparisNo.ts`
- [ ] `supabase\functions\_shared\tum_satirlar.ts`

## Sahipsiz (Orphan) MD Dosyaları
Aşağıdaki `.md` dosyaları bir `.py` koduyla eşleşmiyor. Düzeltmek için `python cli/docs_tree.py --fix` çalıştırabilirsiniz.
- [⚠️] ` .agents\explorer_m4_1_gen2\handoff.md`
- [⚠️] `ORIGINAL_REQUEST.md`
- [⚠️] `TEST_INFRA.md`
- [⚠️] `TEST_READY.md`
- [⚠️] `eslint.config.md`
- [⚠️] `explorer_m2_3\analysis.md`
- [⚠️] `implementation_plan.md`
- [⚠️] `next.config.md`

## Geçersiz Şablon (Invalid Format)
Harika! Tüm MD belgeleri Enterprise-Ready (5N1K + Axioms) şablonuna uygun. ✅