# Evren muhafızı olmayan konformans kapıları — ADAY listesi (2026-09-06)

> **Bu bir kusur listesi DEĞİL, sınanmamış aday listesidir.** Ölçüt vekildir; kanıt kapı kapı sabotajdır.
> Ölçüm: master `2ac01f8ae`, 2026-09-06 ~19:45Z, ALTYAPI şeridi.
> İstek: OPS (pano, 19:4xZ) — "54'lük listeni dosya olarak bırak". **Doğru sayı 53** (önceki 54 sayımı
> sıralı gösterimden okunmuştu, betikle yeniden sayıldı).

## 0. Niçin var

URUN 2026-09-06'da `tailwind-token-sinif-gecerliligi` kapısını sabotajla sınadı: yürüme kökünü `src` yerine
`supabase` yapınca evren 941 dosyadan 44'e düştü ve kapı **3/3 YEŞİL kaldı**. Evren sıfır değildi — 44 dosya
gerçekten tarandı, `className` içermedikleri için ihlal listesi boş çıktı. Yani kapı "ihlal yok" derken
kusurun yaşadığı 897 dosyayı hiç görmemişti. Bu, "ölçüt keskin ama evren yanlış" sınıfının kapıya inmiş hâli.

Aynı sınıf başka kapılarda da olabilir. Bu dosya, **nerede bakılacağını** söyler; **ne bulunacağını değil**.

## 1. Ölçüt ve sınırı (okumadan listeye güvenme)

| | |
|---|---|
| Evren | `src/__tests__/conformance/*.test.ts` — **163 dosya** |
| "Ağaç yürüyor" ölçütü | dosyada `readdirSync` / `globSync` / `fast-glob` / `fg(` / `glob(` geçiyor — **99 dosya** |
| "Muhafız var" ölçütü | `length).toBeGreaterThan` / `length).not.toBe(0)` / `toBeGreaterThanOrEqual(1` / `evren` / `length > 0` geçiyor |
| **ADAY** | yürüyor **ve** muhafız görünmüyor — **53 dosya** (aşağıda) |

**Yanlış pozitif kaynakları (beklenir, ayıklanacak):** muhafızı başka biçimde yazan kapı (sabit dosya listesi,
ayrı sayım değişkeni, fixture'la koşan kapı, `expect(files).toMatchInlineSnapshot`). Bu ölçüt onları göremez.

**Yanlış negatif kaynağı:** `length > 0` yazıp o sayıyı hiçbir şeye bağlamayan kapı listeye GİRMEZ ama
korumasızdır. Yani 53, alt sınır sayılmalı.

**Vekilin lehine tek kanıt:** bugün fail-open olduğu SABOTAJLA kanıtlanan tek kapı
(`tailwind-token-sinif-gecerliligi`) bu listede **var**. Bu, ölçütün büsbütün kör olmadığını gösterir;
"doğru" olduğunu göstermez.

## 2. Kanıt nasıl üretilir (URUN'un tasarım uyarısı, aynen geçerli)

Sabotaj **evreni boşaltmaz, DARALTIR**. Evren sıfırlanırsa çoğu kapı zaten kırmızı verir ve gerçek kusur kaçar.
Doğru sabotaj: yürüme kökünü **geçerli ama yanlış** bir kümeye çevir (okunabilen, dosya içeren, ama aranan
kalıbı barındırmayan bir ağaç). Kapı yine YEŞİL kalıyorsa **gerçek bulgu**.

Öneri yöntem (karar OPS'un): kapı başına bir sabotaj koşumu; yeşil kalanlar ayrı bir tur çürütmeye girer.

## 3. Aday kapılar (53)

`yürür` = eşleşen ağaç-yürüme çağrısı sayısı (kaba yoğunluk göstergesi, önem sırası değil).

| kapı | yürür |
|---|---|
| 3d-asset-validity.test.ts | 3 |
| 3d-csp.test.ts | 3 |
| 3d-model-recipe.test.ts | 2 |
| 3d-procedural-env.test.ts | 2 |
| 3d-single-canvas.test.ts | 2 |
| admin-daypicker-classnames.test.ts | 2 |
| admin-export-hygiene.test.ts | 2 |
| admin-fx-lock-crud.test.ts | 2 |
| admin-fx-lock-visibility.test.ts | 2 |
| admin-mutate-real-write.test.ts | 2 |
| admin-shell-invariants.test.ts | 2 |
| admin-status-filter-domain.test.ts | 2 |
| auth-account-surface.test.ts | 2 |
| auth-reset-chain.test.ts | 3 |
| auth-session-security.test.ts | 3 |
| canonical-lang-segment.test.ts | 2 |
| category-metadata-i18n-ssot.test.ts | 3 |
| category-name-ssot.test.ts | 3 |
| config-fail-closed.test.ts | 2 |
| csp-origin-coverage.test.ts | 3 |
| githooks-integrity.test.ts | 3 |
| home-hero-route-ssot.test.ts | 1 |
| i18n-attribute-literals.test.ts | 2 |
| i18n-key-resolution.test.ts | 2 |
| i18n-locale-case.test.ts | 2 |
| i18n-locale-compare.test.ts | 2 |
| i18n-uppercase-proper-noun.test.ts | 2 |
| invoice-ledger-contract.test.ts | 2 |
| jsonld-fiyat-sizintisi.test.ts | 2 |
| kart-yukleme-onceligi.test.ts | 1 |
| kvkk-request-ledger.test.ts | 4 |
| lang-metadata-locale.test.ts | 1 |
| legal-consent-analytics.test.ts | 2 |
| legal-consent-gate.test.ts | 2 |
| legal-en-leftover.test.ts | 3 |
| localized-route-ssot.test.ts | 3 |
| numeric-format-ssot.test.ts | 3 |
| payment-integrity.test.ts | 2 |
| payment-money-move.test.ts | 2 |
| pricing-cache-invariants.test.ts | 3 |
| pricing-fx-lock-contract.test.ts | 2 |
| pricing-fx-rate-single-resolver.test.ts | 2 |
| pricing-money-append-only.test.ts | 2 |
| pricing-segment-source.test.ts | 3 |
| pricing-storefront-source.test.ts | 2 |
| quote-machine-ssot.test.ts | 4 |
| render-price-surface.test.ts | 2 |
| render-revalidation-contract.test.ts | 7 |
| runtime-version-alignment.test.ts | 2 |
| stock-restore-evidence.test.ts | 4 |
| storefront-reflow-guards.test.ts | 2 |
| tailwind-token-sinif-gecerliligi.test.ts | 1 |
| webhook-auth-fail-closed.test.ts | 2 |

**Sahiplik:** bu dosyada YAZILMADI. Şerit claim'leri gün içinde değişiyor; sahibi panodan okumak OPS'un işi.
Kabaca ödeme/fiyat/i18n/admin/3d ailesi URUN'da, birkaçı sahipsiz.

## 4. ALTYAPI'nın kendi kapıları — TEMİZ (aynı ölçüt)

Claim'imdeki 22 konformans dosyası aynı ölçütten geçirildi: **ağaç yürüyüp muhafızı olmayan SIFIR**.
Bu, "kendi işini de aynı sınavdan geçir" kuralının kaydıdır; ayrıcalık değil, ölçüm.

## 5. Değişiklik geçmişi

- 2026-09-06 — v1.0, ALTYAPI. Ölçüm master `2ac01f8ae`. OPS'un panodaki isteği üzerine yazıldı.
  Sayı düzeltmesi: panoda 54 denmişti, betikle **53**.
