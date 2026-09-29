# Cetvel sahipliği (rol kartlarından türetilmiş)

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri: `scripts/belge/cetvel-sahipligi.json`); elle düzenleme. Sahibi cetvel başlığında yazılı olanlar burada değildir.
> **Sahip (doğrulanacak)** = düşük güvenli atama: sahip pencere ilk dokunuşta teyit eder.

Rol başına: ADMIN 9 · ALTYAPI 21 · ARAC 4 · GEO-SEO 1 · KATALOG 7 · OPS 10 · URUN 19

| Cetvel | Sahip | Durum | Dayanak |
|---|---|---|---|
| admin-capabilities.md | ADMIN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| admin-design-standard.md | ADMIN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| admin-standard.md | ADMIN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| commerce-domain-map-standard.md | ADMIN | teyitli | OPS onayı 2026-09-29 (iki role bölünen cetvel) |
| crm-standard.md | ADMIN | teyitli | alt ajan sınıflandırması (orta güven), OPS onaylı |
| dealer-module-blueprint.md | ADMIN | Sahip (doğrulanacak) | düşük güven: sahip ilk dokunuşta teyit eder |
| dealer-network-standard.md | ADMIN | Sahip (doğrulanacak) | düşük güven: sahip ilk dokunuşta teyit eder |
| erp-workspace-design-standard.md | ADMIN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| purchasing-standard.md | ADMIN | Sahip (doğrulanacak) | düşük güven: sahip ilk dokunuşta teyit eder |
| analytics-standard.md | ALTYAPI | teyitli | OPS sahipsiz alan kuralı: analytics |
| auth-account-standard.md | ALTYAPI | teyitli | OPS sahipsiz alan kuralı: auth/hesap altyapısı |
| bagimlilik-guvenlik-yukseltme-standard.md | ALTYAPI | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| bagimlilik-kararlari.md | ALTYAPI | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| barindirma-standard.md | ALTYAPI | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| checkout-payment-standard.md | ALTYAPI | teyitli | OPS onayı 2026-09-29 (iki role bölünen cetvel) |
| ci-runner-install-standard.md | ALTYAPI | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| collaboration-protocol.md | ALTYAPI | teyitli | alt ajan sınıflandırması (orta güven), OPS onaylı |
| companion-doc-standard.md | ALTYAPI | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| csp-standard.md | ALTYAPI | teyitli | OPS onayı 2026-09-29 (iki role bölünen cetvel) |
| db-grant-hygiene-standard.md | ALTYAPI | teyitli | alt ajan sınıflandırması (orta güven), OPS onaylı |
| denetim-izi-standard.md | ALTYAPI | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| deploy-build-skip-standard.md | ALTYAPI | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| edge-function-security-standard.md | ALTYAPI | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| ledger-ve-olu-migration-standard.md | ALTYAPI | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| migration-safety-standard.md | ALTYAPI | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| notification-standard.md | ALTYAPI | teyitli | OPS sahipsiz alan kuralı: bildirim/e-posta |
| payment-ledger-standard.md | ALTYAPI | teyitli | OPS sahipsiz alan kuralı: ödeme defteri |
| rls-yetki-karari-standard.md | ALTYAPI | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| satis-kipi-gecis-standard.md | ALTYAPI | teyitli | alt ajan sınıflandırması (orta güven), OPS onaylı |
| uretilmis-artefakt-standard.md | ALTYAPI | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| arac-envanteri-standard.md | ARAC | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| hafiza-kancalari-standard.md | ARAC | teyitli | OPS onayı 2026-09-29 (iki role bölünen cetvel) |
| pano-orion-koprusu-standardi.md | ARAC | teyitli | OPS onayı 2026-09-29 (iki role bölünen cetvel) |
| tasarim-yetenek-standard.md | ARAC | teyitli | OPS onayı 2026-09-29 (iki role bölünen cetvel) |
| canonical-url-standard.md | GEO-SEO | teyitli | OPS onayı 2026-09-29 (iki role bölünen cetvel); kapalı pencere: sahiplik kayıtta durur, pencere açılınca üstlenir |
| catalog-ingestion-standard.md | KATALOG | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| category-taxonomy-standard.md | KATALOG | teyitli | OPS onayı 2026-09-29 (iki role bölünen cetvel); kapalı pencere: sahiplik kayıtta durur, pencere açılınca üstlenir |
| csv-import-export-standard.md | KATALOG | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| katalog-sayim-standard.md | KATALOG | teyitli | OPS onayı 2026-09-29 (iki role bölünen cetvel); kapalı pencere: sahiplik kayıtta durur, pencere açılınca üstlenir |
| pricing-standard.md | KATALOG | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| product-image-standard.md | KATALOG | teyitli | OPS onayı 2026-09-29 (iki role bölünen cetvel); kapalı pencere: sahiplik kayıtta durur, pencere açılınca üstlenir |
| product-schema-standard.md | KATALOG | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| execution-method-standard.md | OPS | teyitli | OPS onayı 2026-09-29 (iki role bölünen cetvel) |
| hukum-kaynak-standard.md | OPS | teyitli | OPS onayı 2026-09-29 (iki role bölünen cetvel) |
| is-kayit-duzeni-standard.md | OPS | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| legal-compliance-standard.md | OPS | teyitli | OPS sahipsiz alan kuralı: hukuk (Recep kapısı; ayrı HUKUK rolü açılana kadar OPS) |
| measurement-discipline-standard.md | OPS | teyitli | alt ajan sınıflandırması (orta güven), OPS onaylı |
| mockup-gelisim-hatti-standardi.md | OPS | teyitli | OPS onayı 2026-09-29 (iki role bölünen cetvel) |
| proje-takip-defteri-standard.md | OPS | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| settled-work-standard.md | OPS | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| subagent-delegation-standard.md | OPS | teyitli | OPS onayı 2026-09-29 (iki role bölünen cetvel) |
| work-tracking-ssot-standard.md | OPS | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| 3d-scene-lighting-research.md | URUN | teyitli | alt ajan sınıflandırması (orta güven), OPS onaylı |
| 3d-showroom-ux-research.md | URUN | teyitli | alt ajan sınıflandırması (orta güven), OPS onaylı |
| adres-semasi-standard.md | URUN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| aile-metni-sayisal-standard.md | URUN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| customer-account-standard.md | URUN | teyitli | OPS sahipsiz alan kuralı: müşteri yüzü (müşteri hesabı) |
| document-numbering-standard.md | URUN | teyitli | alt ajan sınıflandırması (orta güven), OPS onaylı |
| email-template-standard.md | URUN | teyitli | alt ajan sınıflandırması (orta güven), OPS onaylı |
| form-submission-standard.md | URUN | teyitli | OPS sahipsiz alan kuralı: müşteri yüzü (form gönderimi) |
| i18n-ters-yon-standard.md | URUN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| kategori-adlandirma-standard.md | URUN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| marka-token-eslemesi-standard.md | URUN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| matris-gorunum-standard.md | URUN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| quote-standard.md | URUN | teyitli | OPS sahipsiz alan kuralı: müşteri yüzü (teklif akışının müşteri tarafı); ADMIN ikincil (yönetici tarafı) |
| rendering-cache-standard.md | URUN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| spec-axis-standard.md | URUN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| storefront-design-standard.md | URUN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| storefront-reflow-standard.md | URUN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
| urun-yapisal-veri-standard.md | URUN | teyitli | alt ajan sınıflandırması (orta güven), OPS onaylı |
| vaat-butunlugu-standard.md | URUN | teyitli | alt ajan sınıflandırması (yüksek güven), OPS onaylı |
