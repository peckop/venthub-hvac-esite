# Test karnesi — 2026-10-09

> ÜRETİLMİŞ BELGE: elle düzenleme. Kaynak: `node scripts/test-karnesi/karne-uret.cjs` (cetvel: `docs/standards/test-karnesi-standard.md`).
> Bu belge HÜKÜM VERMEZ: `oneri` sütunu bir ADAYDIR. Silme/taşıma kararı insanındır; silme listesi Recep onayıyla, sensiz test silinmez.
> CI geçmişi penceresi: 2026-07-06..2026-10-07. "ölçülmedi" = ölçüm yapılmadı (tahmin yazılmadı).

## Özet

| Konu | Sayı |
|---|---|
| test dosyası (git ls-files) | 654 |
| · betik | 46 |
| · conformance | 361 |
| · birim | 222 |
| · edge | 7 |
| · e2e | 17 |
| · smoke | 1 |
| sabotajla ÖLÇÜLEN dosya | 347 |
| sabotajla ÖLÇÜLMEYEN dosya | 307 |
| sabotajda ÇELİŞKİ (aynı test için farklı hüküm, çözülmedi) | 0 |
| KISMİ koruma (kırmızı veriyor ama ölçülen bir bozulmaya yeşil kalıyor) | 221 |
| 8. soru: TETİK beyanı yazılı dosya (kesin) | 2 |
| 8. soru: yalnız statik okumadan (kesin DEĞİL) | 292 |
| 8. soru: ÖLÇÜLMEDİ (beyan yok, okunan yol yok) | 360 |
| CI penceresinde kırmızı veren dosya | 70 |
| CI penceresinde HİÇ kırmızı vermeyen dosya | 584 |

### Sabotaj hükümleri (ölçülen dosyalarda)

| Hüküm | Dosya |
|---|---|
| KIRMIZI | 345 |
| TABAN_KIRMIZI | 1 |
| YESIL | 1 |

### Ortama bağlılık

| Hüküm | Dosya |
|---|---|
| supheli | 174 |
| bagimsiz | 471 |
| bagli | 9 |

### Öneri adayları (KARAR DEĞİL)

| Aday | Dosya |
|---|---|
| OLCULMEDI | 306 |
| KISMI-KORUMA | 218 |
| KORU | 117 |
| COKLU-KORUMA-ADAYI | 3 |
| ORTAM-INCELE | 1 |
| TASI-ADAYI-DUNYA-DURUMU | 7 |
| SAHTE-YESIL-ADAYI | 1 |
| TASINDI | 1 |

### CI koşuları (ci.yml, pencere içi)

| Sonuç | Koşu |
|---|---|
| success | 2087 |
| cancelled | 717 |
| failure | 351 |

Test adımı süresi medyanı: 190 sn (örnek 374 başarılı koşu).

## PR kapısından çıkan (dünya durumu) testler ve yeni yerleri (1)

| Test | Yeni yer | Neden | Kanıt |
|---|---|---|---|
| `src/__tests__/conformance/taban-tazeligi-dunya.test.ts` | master-push + zamanli | Şema tabanının en yeni migration'dan geri kalıp kalmadığını ölçer. Cevap pull request'in koduna değil master'ın o anki durumuna ve tabanın son dökülme tarihine bağlıdır; taban prod'dan elle dökülür (sema-tabani-uret.yml), yani suçsuz bir PR'ın yazarı düzeltemez. Dosya, kapının KENDİ koduna ait kollardan ayrıldı: onlar (evren, kısmi taban, damga biçimi, README) taban-tazeligi.test.ts'te PR kapısında KALDI. | CI geçmişi 2026-07-06..10-06 (ALT-38 ölçümü; karne belgesi ALT-38b PR'ı ile depoya girer): bu kapı 55 kırmızı koşuda, 39 farklı dalda kırmızı verdi; 52'si dünya olayı kümesinde (altı küme: aynı test ≥3 dalda 12 saat içinde), 11'i master push. OPS ölçümü 2026-10-06: son 10 kırmızının 5'i (#1692 migrate sonrası suçsuz PR'lar). |

## ÇELİŞKİLER (aynı test için farklı sabotaj hükmü; çözülmedi, sessizce seçilmedi) (0)

Yok.

## Yerine geçen ölçümler (bilinçli tekrar: önceki kaydın yerine açıkça ilan edilmiş yeniden ölçüm) (1)

| Test | Seçilen kayıt | Neden | Kayıtlar |
|---|---|---|---|
| `src/__tests__/conformance/companion-doc-parity.test.ts` | g99.jsonl | Koşucu sınırı: test `git ls-files` (indeks) okuyor; sabotaj koşucusu 'ekle' sabotajını indekse yazmadığı için ilk ölçüm YEŞİL çıkmıştı. Koşucu 'ekle' adımını indekse de yazacak (ve geri alacak) şekilde düzeltildi, test yeniden ölçüldü: KIRMIZI. Bilinçli tekrar, rastgele değil. | g04.jsonl=YESIL; g99.jsonl=KIRMIZI |

## Sahte yeşil adayları (sabotajların hiçbiri yakalanmadı) (1)

| Test | Korur | Denenen | Not |
|---|---|---|---|
| `src/__tests__/conformance/instruction-surface-ppr.test.ts` | Canlı talimat yüzeylerinin (.claude/skills, .agent/skills, .agent/rules) var olmayan PPR özelliğini yürürlükteki kural g | 2 | kısmi sahte yeşil: commit'siz (calisma agaci / indeks) PPR ihlali YAKALANMADI - iki sabotaj da GECTI (SKILL.md sonuna 'PPR config ... zorunludur' satiri; indeks |

## Sabotajsız bile kırmızı (ortam ya da gerçek hata) (1)

| Test | Ortam notu |
|---|---|
| `src/__tests__/conformance/belge-kart-plan-kapisi.test.ts` | Windows çalışma ağacında .md dosyaları CRLF (text=auto + core.eol=native; git ls-files --eol: i/lf w/crlf): ŞABLON bloğu kolu kırmızı. Ayrıca node:sqlite (Node 22+, deneysel), git rev-parse, geçici di |

## Çoklu koruma adayları (aynı sabotajı başka test de yakalıyor, pencerede hiç kırmızı vermedi) (3)

| Test | Birlikte yakalayan |
|---|---|
| `src/__tests__/conformance/bash-write-audit-uretilmis-sinifi.test.ts` | `bash-write-audit-claude-deposu.test.ts`, `bash-write-audit-merge-muafiyeti.test.ts`, `bash-write-audit-tree.test.ts` |
| `src/__tests__/conformance/e1-kimlik-kontrolu.test.ts` | `lane-precommit-merge.test.ts` |
| `src/__tests__/conformance/storage-yazma-nobetcisi.test.ts` | `anon-yazma-nobetcisi.test.ts` |

## Kısmi koruma (test kırmızı veriyor ama bazı bozulmalara yeşil kalıyor: silme adayı DEĞİL, güçlendirme adayı) (221)

| Test | Yakalanmayan bozulma |
|---|---|
| `scripts/ci/__tests__/edited-ayna.test.ts` | güvenlik payı 120 sn -> 0 sn; calistir: api.kosular(sha) yerine api.kosular(baseRef); calistir: api.tabanTarihi(baseRef) yerine api.tabanTarihi(sha); gercekApi: head_sha süzgeci URL'den düşer; main.catch: beklenmeyen hatada atla=true yazar; yaz: çıktı anahtarı atla -> atlama; calistir: adaylar eskid |
| `scripts/test-karnesi/__tests__/ci-gecmis.test.ts` | ansiSoy: ';' içeren çok parametreli renk kodları (38;5;196m) soyulmaz; basarisizTestleriAyikla: ad tekilleştirme (Set) kalkar; basarisizDosyaSayisiOku: yalnız tek haneli sayı (10+ başarısız = null); argumanlar: --pencere-gun >= 1 doğrulaması kalkar; argumanlar: --is-akisi yanlış alana (repo) yazılır |
| `scripts/test-karnesi/__tests__/karne-uret.test.ts` | kumele: tam 12 saat aralık yeni kümeye bölünür (> yerine >=); KUMELEME_SAAT 12 -> 20; ciOzeti: küme için tam MIN_DAL (3) dal yetmez (>= yerine >); imzaListesi: ağ çağrısı imzası alan adı bozulur (ortam.ag -> ortam.ağ); oneriVer: dünya durumu aday oranı tam %50'de tetiklenmez (>= yerine >); oneriVer: |
| `scripts/test-karnesi/__tests__/sabotaj.test.ts` | vitestSinifla: çıkış kodu doğrulaması kalkar (kodu !=0 ama test kırık yok -> GECTI); vitestSinifla: GECTI sınıfı yanlış yazılır (GEÇTİ) -> hukumVer tanımaz; main: bağlı worktree reddi (ana ağaçta koşmama) kalkar; testKos: alt süreç ortamı temizlenmez (env: process.env, sırlar ve gerçek ev görünür);  |
| `src/__tests__/conformance/3d-model-recipe.test.ts` | jsx-prop-metalness-sayisi |
| `src/__tests__/conformance/3d-single-canvas.test.ts` | canvas-takma-adla (ek yoklama) |
| `src/__tests__/conformance/admin-csv-hucre.test.ts` | replaceAll-ile-satir-ici-kacis |
| `src/__tests__/conformance/admin-customer-surface.test.ts` | offset-sabit-sifir-belirtec-yerinde |
| `src/__tests__/conformance/admin-daypicker-classnames.test.ts` | tirnakli-v8-anahtari |
| `src/__tests__/conformance/admin-export-hygiene.test.ts` | cok-satirli-export-as-default (ek yoklama) |
| `src/__tests__/conformance/admin-fx-lock-crud.test.ts` | elle-kur-girdisi-onChange-sonra-value |
| `src/__tests__/conformance/admin-fx-lock-visibility.test.ts` | sayi-gosterimi-silindi-ucluk-kaldi |
| `src/__tests__/conformance/admin-istemci-yazma-politikasi.test.ts` | degisken-tablo-adiyla-yazma |
| `src/__tests__/conformance/admin-list-search.test.ts` | filtre-degiskende-kurulup-or-a-verildi |
| `src/__tests__/conformance/admin-mutate-real-write.test.ts` | fn-yalniz-await-sleep |
| `src/__tests__/conformance/admin-overlay-invariants.test.ts` | ciplak-confirm |
| `src/__tests__/conformance/admin-refund-real.test.ts` | yardimci-hata-dalinda-ok-true |
| `src/__tests__/conformance/admin-shell-invariants.test.ts` | h-screen-cok-satirli-cn-icinde |
| `src/__tests__/conformance/admin-status-filter-domain.test.ts` | odeme-degeri-baska-satirdaki-sabitle-eklendi |
| `src/__tests__/conformance/admin-status-label-coverage.test.ts` | bilesen-ham-return-s-ye-dondu-olayin-kendisi |
| `src/__tests__/conformance/admin-theme-invariants.test.ts` | gradyan-fill-keyfi-hex-onekleri |
| `src/__tests__/conformance/aile-adi-tek-kaynak.test.ts` | yikici-atama-const-name-family |
| `src/__tests__/conformance/aile-kategori-kapisi.test.ts` | workflow-adimi-or-true-ile-bloklamaz |
| `src/__tests__/conformance/ajan-skill-cozulur.test.ts` | tanim-dosyasinda-olmayan-skill-adi |
| `src/__tests__/conformance/altgrup-kart-baglanti.test.tsx` | href-sahte-diyez-degeri |
| `src/__tests__/conformance/altgrup-kart-gorsel.test.tsx` | src-baska-alana-cevrildi-kosul-image_url |
| `src/__tests__/conformance/ana-agac-tazelik.test.ts` | ff-only-bayragi-dustu (ek yoklama) |
| `src/__tests__/conformance/analitik-yerlesimi.test.ts` | dogrudan-gtag-betigi-riza-kapisini-atliyor (ek yoklama) |
| `src/__tests__/conformance/analytics-event-taxonomy.test.ts` | dogrudan-gtag-olayi (ek yoklama) |
| `src/__tests__/conformance/anasayfa-rotasi-statik.test.ts` | unstable-noStore-sizdi (ek yoklama) |
| `src/__tests__/conformance/anon-definer-yetki.test.ts` | yeni-definer-fonksiyon-revoke-yok (ek yoklama) |
| `src/__tests__/conformance/anon-yazma-nobetcisi.test.ts` | nobetci-adimi-or-true-ile-yutuluyor |
| `src/__tests__/conformance/arama-davranisi.test.ts` | ihlal-dali-hic-tetiklenmiyor; workflow-adimi-or-true-ile-yutuluyor |
| `src/__tests__/conformance/auth-session-security.test.ts` | a9-captcha-bolumu-silindi-yalniz-satir-202-kaldi (ek yoklama) |
| `src/__tests__/conformance/bash-write-audit-merge-muafiyeti.test.ts` | olculemeyen-agac-muaf-sayiliyor-fail-open |
| `src/__tests__/conformance/bash-write-gate.test.ts` | yorumlayici-listesi-node-python-ile-daraldi (ek yoklama) |
| `src/__tests__/conformance/belge-defteri.test.ts` | supabase-yol-oneki-kurali-olu (ek yoklama) |
| `src/__tests__/conformance/belge-yonlendirici.test.ts` | varsayilan-maks-2den-5e; tekrarsiz-yol-suzgeci-kalkti |
| `src/__tests__/conformance/bellek-yoklama.test.ts` | bos-bellek-esigi-2048den-1024e |
| `src/__tests__/conformance/beyansiz-olcum-lambasi.test.ts` | beyan-kalibi-git-C-ve-cd-kollari-kalkti; beyansiz-olcum-kaydi-tur-basina-tuketilmiyor (ek yoklama) |
| `src/__tests__/conformance/board-globs-tekrarlanan-bayrak.test.ts` | claim-glob-ayirici-virgulden-noktalivirguluye |
| `src/__tests__/conformance/board-invariants.test.ts` | beyansiz-olcum-kaydi-tur-basina-tuketilmiyor |
| `src/__tests__/conformance/board-pencere-adi.test.ts` | bayat-serit-ad-cakismasina-sayiliyor |
| `src/__tests__/conformance/bos-sku-render.test.ts` | model-etiketi-yardimcisi-sku-ya-dusuyor |
| `src/__tests__/conformance/build-skip-positive-logic.test.ts` | hijyen-sinifi-sondaki-slash-dustu |
| `src/__tests__/conformance/canli-kanit-yalitimi.test.ts` | onay-kilidi-run-blogunda-girdi-gomuldu-enjeksiyon; e2e-smoke-her-pr-de-canli-spec-kosuyor |
| `src/__tests__/conformance/canonical-lang-segment.test.ts` | marka sayfası trUrl dil öneksiz (üçlü yüzünden kör nokta yoklaması) |
| `src/__tests__/conformance/canonical-url-ssot.test.ts` | marka sayfası kanonik yüzeyinde çıplak location.origin (window. öneksiz kör nokta yoklaması) |
| `src/__tests__/conformance/category-metadata-i18n-ssot.test.ts` | destructuring ile ham okuma (nokta erişimi yok, kör nokta yoklaması) |
| `src/__tests__/conformance/category-view-reach.test.ts` | çağrı noktasında alt kategori sayısı sabit 1 verildi (düzeltme prod'da devre dışı, kör nokta yoklaması) |
| `src/__tests__/conformance/cati-dil-saglayicisi.test.ts` | yoldanDilCoz'a yol yerine null veriliyor (çatı hep varsayılan dil, kör nokta yoklaması) |
| `src/__tests__/conformance/ci-edited-ayna.test.ts` | ci işi edited'de job düzeyinde atlanır (job-level if) |
| `src/__tests__/conformance/ci-install-bounded.test.ts` | apt-get'siz `apt install` sarmalayıcısız ve zaman sınırsız adım eklendi (kör nokta yoklaması) |
| `src/__tests__/conformance/ci-pr-kayit-kapisi.test.ts` | kapı adımına continue-on-error: true eklendi (kapı koşar ama hiçbir şeyi kırmızı yapamaz, kör nokta yoklaması) |
| `src/__tests__/conformance/comment-scrubber-scheme-safety.test.ts` | şema-güvensiz sıyırıcı, karakter sınıfı sırası ters ([^\n\r]) — kör nokta yoklaması |
| `src/__tests__/conformance/commit-oncesi-uyarilar-kilidi.test.ts` | `// true` komut yerine yorum satırı ekine taşındı (kanca artık bloklayabilir, kör nokta yoklaması) |
| `src/__tests__/conformance/companion-defter.test.ts` | post-commit'te defter çağrısı ölü koşula bağlandı (`if false &&`) — metin kalır davranış gider |
| `src/__tests__/conformance/config-fail-closed.test.ts` | iki adımlı sessiz sandbox varsayılanı (Deno.env.get ayrı satırda, // varsayılan sonraki satırda, kör nokta yoklaması) |
| `src/__tests__/conformance/currency-not-from-language.test.ts` | çağrı noktasında para birimi dilden türetildi (currency kelimesi var, kör nokta yoklaması) |
| `src/__tests__/conformance/db-view-grant-hygiene.test.ts` | REVOKE'suz CREATE MATERIALIZED VIEW (varsayılan yetkiler açık, kör nokta yoklaması) |
| `src/__tests__/conformance/defter-bayatlik-olcumu.test.ts` | kancanın python çağrısına esitle fiili eklendi (`path.join(...)` sonrası, regex'in ilk ')'inin ötesinde, kör nokta yoklaması) |
| `src/__tests__/conformance/denetim-izi-kapisi.test.ts` | kapı gevşedi: PRODUCTS_ZORUNLU_KOLON listesinden sku düşürüldü; yontemli() sarmalayıcısı başlığı hiç eklemiyor (ek yoklama) |
| `src/__tests__/conformance/dunya-durumu-satiri.test.ts` | BAYAT_OLCUM_SAAT 36 -> 11; ILK_KOSU_BEKLEME_SAAT 24 -> 3; IS_AKISI adı gerçek dosyadan ayrılır (dunya-durumu-eski.yml); olc: son koşu yerine listenin SON elemanı (en eski) alınır; gerekirseTazele: 30 dk tazelik denetimi kalkar (API her mesajda çağrılır); kanca: satır hesaplanır ama stdout'a YAZILMAZ |
| `src/__tests__/conformance/durum-dondur.test.ts` | diskten doğrulamada bayt eşitliği kontrolü devre dışı (doğrulayıcı içi boşaltıldı) |
| `src/__tests__/conformance/edge-delivery-idempotency.test.ts` | tekilleştirme kapısı kısa devreyle devre dışı (alreadySent çağrısı koşulda duruyor, hiç çalışmıyor) |
| `src/__tests__/conformance/edge-drift-yeniden-dene.test.ts` | drift-check fatal() artık çıkış 2 yerine 0 veriyor (başarısız indirme sessiz yeşil) |
| `src/__tests__/conformance/edge-koken-allowlist.test.ts` | karar satırı joker son eke döndü: isVercel artık origin.includes('.vercel.app') (kalıp sabiti yerinde duruyor) |
| `src/__tests__/conformance/edge-sayfalama.test.ts` | yardımcıda üst sınır kontrolü devre dışı (fırlatma metni yerinde, koşul hiç doğru olmuyor) |
| `src/__tests__/conformance/edge-security.test.ts` | admin-orders-latest rol kapısı genişledi: sıradan 'user' rolü de geçiyor (admin ve super_admin literalleri yerinde) |
| `src/__tests__/conformance/edge-shared-input-drift.test.ts` | rc=$? yerine rc=0 (kapı her zaman yeşil, metinler yerinde) (ek yoklama) |
| `src/__tests__/conformance/env-yazma-kapisi.test.ts` | main() permissionDecision ask yerine allow basıyor (ek yoklama) |
| `src/__tests__/conformance/eposta-defter-yazici-zorunlu-kolon.test.ts` | defterHatasiniBildir hiçbir şey bildirmiyor (hata alınıyor ama yutuluyor) (ek yoklama) |
| `src/__tests__/conformance/eposta-kimlik-varsayilan.test.ts` | HTML şablonuna vercel.app logosu (tarayıcı yalnız .ts okur: kapsam sınırı yoklaması) |
| `src/__tests__/conformance/fiyat-gunlugu-yontem-basligi.test.ts` | yontemli() sarmalayıcısı başlığı hiç eklemiyor (statik kapı çağrı yerini görür, gövdeyi görmez) |
| `src/__tests__/conformance/font-preload-olcumu.test.ts` | main() kırmızı durumda çıkış 0 veriyor (CI adımı kırmızıyı yeşil görür) (ek yoklama) |
| `src/__tests__/conformance/form-submission-standard.test.ts` | ContactPage: gerçek yazma yerine sahte gecikme + Promise.resolve (yorumsuz sahte başarı) |
| `src/__tests__/conformance/gh-api-kapisi.test.ts` | main() permissionDecision ask yerine allow basıyor (ek yoklama) |
| `src/__tests__/conformance/golge-kurucu.test.ts` | ad denetimi devre dışı (if false &&), desen ve exit(2) metinde duruyor (ek yoklama) |
| `src/__tests__/conformance/gsc-token.test.ts` | jeton() içindeki depo-içi anahtar reddi devre dışı (yüklem duruyor, uygulama yok) |
| `src/__tests__/conformance/hafiza-enjeksiyonu.test.ts` | sidechain-alt-ajan-mesaji-kullanim-sayilir (ek yoklama); compact-sifirlama-kopuk (ek yoklama); matcher-Edit-cikti (ek yoklama) |
| `src/__tests__/conformance/hafiza-indeks-bekcisi-kilidi.test.ts` | yumusak-satir-esigi-tam-160-da-susar-off-by-one (ek yoklama) |
| `src/__tests__/conformance/hafiza-sorusu-yonlendirme.test.ts` | satis-hazirligi-siparis-zinciri-kalibi-dusuruldu (ek yoklama) |
| `src/__tests__/conformance/hardcoded-category-slug-ssot.test.ts` | taranmayan-yeni-dosyada-olmayan-slug (ek yoklama); cift-tirnakli-slug-yazimi (ek yoklama) |
| `src/__tests__/conformance/hesaplayici-alt-metin-sahiplik.test.ts` | jsx-metin-dugumu-ifadeyle-karisik-sabit-metin |
| `src/__tests__/conformance/home-hero-route-ssot.test.ts` | elle-dil-onekli-ham-url-tr-category |
| `src/__tests__/conformance/hook-referential-stability.test.ts` | inline-fn-iceren-nesne-degiskene-atanip-doner |
| `src/__tests__/conformance/i18n-attribute-literals.test.ts` | attribute-ifade-kapsayicisinda-ham-turkce |
| `src/__tests__/conformance/i18n-key-resolution.test.ts` | utils-icinde-olmayan-anahtar-SCOPE-disi |
| `src/__tests__/conformance/i18n-locale-case.test.ts` | cok-satirli-zincir-toLowerCase-satir-basinda |
| `src/__tests__/conformance/i18n-locale-compare.test.ts` | cok satirli dilsiz localeCompare cagrisi (ek yoklama) |
| `src/__tests__/conformance/i18n-ters-yon.test.ts` | tr degeri genel Ingilizce yapildi (nav.knowledgeHub = Knowledge Hub) |
| `src/__tests__/conformance/ic-kod-sizintisi.test.ts` | ara degisken uzerinden model_code ?? sku (ek yoklama) |
| `src/__tests__/conformance/invoice-ledger-contract.test.ts` | rbac /admin/invoices kapisi moderator'a acildi (kapi govdesi bozuldu, return false yerinde) |
| `src/__tests__/conformance/kanban-anlik.test.ts` | yalniz readOnly bayragi kaldirildi, yazma YOK (ek yoklama) |
| `src/__tests__/conformance/kanca-verify-on-stop.test.ts` | beyansiz-olcum-kaydi-tur-basina-tuketilmiyor (ek yoklama); tur-sonu-uyarisi-beyansiz-kayit-sartini-yitirdi (ek yoklama) |
| `src/__tests__/conformance/kanonik-kok-istemci.test.ts` | 'use client' dosyasinda require('@/config/siteUrl') (ek yoklama) |
| `src/__tests__/conformance/karar-kayit-bagi.test.ts` | UYARI kipindeki belgede (altyapi) DURUM satiri bicimsiz |
| `src/__tests__/conformance/kart-aciklama-mobil.test.ts` | ust-kutu-gizli-baslar (aciklamayi 2 seviye ustten saran kutuya max-h-0 opacity-0) |
| `src/__tests__/conformance/kart-yukleme-onceligi.test.ts` | takma-adla-import-onceliksiz-cagri (yeni dosya: import Kart from FamilyCard; <Kart .../>) |
| `src/__tests__/conformance/kartsiz-kayit-sayaci.test.ts` | pano-yok-sessiz-sifir (pano dosyasi yoksa OLCULEMEDI yerine 0/0 sessiz sifir); pano-yazmaya-acik (readOnly kaldirildi); iptal-kart-acik-sayilir (cancelled/canceled kapali durumlardan cikti) |
| `src/__tests__/conformance/katalog-sayim-tls.test.ts` | tls-dogrulama-kapali (rejectUnauthorized true -> false) |
| `src/__tests__/conformance/kategori-aciklama-dil-cozumu.test.ts` | vm-sabit-tr-dil (useCategoryViewModel cozucuye lang yerine sabit 'tr' geciriyor); ham-i18n-destructuring (yeni dosya metadata.description_i18n'i parcalayarak ham okur) |
| `src/__tests__/conformance/kategori-adi-marketing-emekli.test.ts` | taranmayan-dizinden-dolayli-okuma (src/lib/seo yardimcisi marketing_title okur, view yalniz yardimciyi cagirip h1 basar) |
| `src/__tests__/conformance/kategori-adi-tek-kaynak.test.ts` | ham-ad-fallbackli (yeni dosya {category.menu_label // category.name} basar); yorumla-aklama (oneriEtiketi cozucuyu cagirmaz, adi yorumda kalir) |
| `src/__tests__/conformance/kategori-bilinmeyen-slug.test.ts` | hata-null-doner (sorgu hatasi null'a cevrilir, throw olu dalda kalir; dosyada baska throw'lar var) |
| `src/__tests__/conformance/kategori-cozucu-oncelik.test.ts` | cagri-yeri-bypass (getCachedCategoryData cozucuyu atlayip rows[0] alir: eski kusur geri geldi) |
| `src/__tests__/conformance/kategori-gorsel-tek-kaynak.test.ts` | render-image-ucu-elle (yeni dosya storage/v1/render/image/public donusum adresini elle kurar) |
| `src/__tests__/conformance/kategori-rotasi-statik.test.ts` | force-dynamic (rota sinifi force-static -> force-dynamic: prerender tamamen kapanir) |
| `src/__tests__/conformance/kategori-sayilari-onbellek.test.ts` | rota-dosyasinda-dogrudan-rpc (kategoriSayfasi.tsx disinda, rota page.tsx icinde onbelleksiz RPC cagrisi); webhook-tazeleme-yorumda (products dalinda revalidateTag(PRODUCTS_DISCOVERY_TAG) yorum satirina alindi) |
| `src/__tests__/conformance/kimlik-kurali-kapisi.test.ts` | yukleyici-sku-sablon-literaliyle (load.mjs prefix-model_code'u sablon dizesiyle kendisi kurar) |
| `src/__tests__/conformance/kopuk-surec-pencere.test.ts` | detached-ts-dosyasinda (yeni scripts/**/*.ts dosyasi detached:true kullanir; tarayici yalniz cjs/mjs/js tarar) |
| `src/__tests__/conformance/kume-master-tazeligi.test.ts` | canli-olcum-hep-taze (olc() sonraki kaynaklari bos verir: fikstur cekirdegi saglam, git ayagi kopuk) |
| `src/__tests__/conformance/kvkk-request-ledger.test.ts` | sonraki-migration-musteri-update-politikasi (yeni *_dsr_customer_* migration musteriye UPDATE politikasi verir; test yalniz ILK migration'i okur); outcome-zorunlulugu-kismen-kalkti (rejected icin outcome artik zorunlu degil; kaynak metni regex'i hala eslesir) |
| `src/__tests__/conformance/lane-precommit-merge.test.ts` | cherry-pick-revert-muafiyeti-kalkti (yalniz MERGE_HEAD muaf; test yalniz MERGE_HEAD'i dener) |
| `src/__tests__/conformance/lang-metadata-locale.test.ts` | og-baslik-aciklama-sabit-tr (openGraph.title/description her dilde Turkce sozluk) |
| `src/__tests__/conformance/legal-consent-analytics.test.ts` | riza-sonucu-yok-sayilir (hasConsent soruluyor ama && false ile engellemiyor); yukleyici-baslangicta-izinli (useState(false) -> useState(true): ilk render rizasiz script basar); baska-ga-sunucusu (yeni dosya google-analytics.com/analytics.js yukler; kapi yalniz googletagmanager.com arar) |
| `src/__tests__/conformance/legal-consent-gate.test.ts` | dogrulama-hic-engellemez (validateLegalConsents icinde false && ile kosul devre disi); preinfo-yorum-satirina-alindi (zorunlu listeden preInfo yorumla cikarildi) |
| `src/__tests__/conformance/legal-en-leftover.test.ts` | url-arkasinda-turkce-lf (ek yoklama); ozel-harfsiz-turkce-lf (ek yoklama) |
| `src/__tests__/conformance/legal-promise-backing.test.ts` | en-fatura-suresi-30-gun (legalConfigEn.invoiceDeliveryTime 7 days -> 30 days; VUK arm yalniz TR degeri okur); kismi-ret-notu-yazilmaz (retained_data_note kosulu v_saklanan < 0: not hic yazilmaz; kolon tanimi adi tatmin eder) |
| `src/__tests__/conformance/linear-arsiv.test.ts` | kanca-baslat-noop; anahtar-konsola-yazilir-sozcuksuz |
| `src/__tests__/conformance/linear-yeni-yorum.test.ts` | durum-sorgusu-proje-filtreli |
| `src/__tests__/conformance/localized-route-ssot.test.ts` | app-components-sabit-yol; router-push-sabit-yol; views-href-urunler-listede-yok (ek yoklama) |
| `src/__tests__/conformance/maliyet-yazici-kurali.test.ts` | from-ve-update-ayri-ifadede (ek yoklama) |
| `src/__tests__/conformance/marka-i18n-butunlugu.test.ts` | BRAND_DETAILS-story-en-metni-bos (ek yoklama) |
| `src/__tests__/conformance/marka-palet-tokenlari.test.ts` | dark-blogunda-yanlis-renkli-ikinci-tanim (ek yoklama) |
| `src/__tests__/conformance/marketing-title-yuk.test.ts` | listede-olmayan-vitrin-sorgusuna-marketing-title (ek yoklama) |
| `src/__tests__/conformance/migration-atomicity.test.ts` | workflow-gercek-dongude-LC_ALL-C-silindi |
| `src/__tests__/conformance/migration-ledger-model.test.ts` | uygulama-yolunda-ledger-yazimi-silindi |
| `src/__tests__/conformance/misafir-teklif-ucu.test.ts` | kvkk-kapisi-tersine-cevrildi |
| `src/__tests__/conformance/mobil-alt-sekme.test.ts` | perde-katmani-className-ifade-bicimine-gecti-ve-md-hidden-dustu (ek yoklama) |
| `src/__tests__/conformance/mutlak-yol-sizintisi.test.ts` | kacisli-cift-ters-egik-cizgili-kimlik-yolu (ek yoklama) |
| `src/__tests__/conformance/notice-kapsami.test.ts` | lisansli-skill-adi-notice-icinde-baska-sozcugun-parcasi (ek yoklama) |
| `src/__tests__/conformance/numeric-format-ssot.test.ts` | mjs-dosyasinda-ham-toLocaleString (ek yoklama) |
| `src/__tests__/conformance/onizleme-yalitimi.test.ts` | rol-denetimi-uyariya-dusurulmus |
| `src/__tests__/conformance/order-status-dictionary.test.ts` | update-degisken-yuku-ile-sozluk-disi-status (ek yoklama) |
| `src/__tests__/conformance/pano-sayfasi.test.ts` | bilinmeyen-sutunlu-kart-sayfadan-dusuyor |
| `src/__tests__/conformance/payment-money-move.test.ts` | farkli-degisken-adiyla-psp-iadesi-sahiplik-yetkili-claimsiz (ek yoklama) |
| `src/__tests__/conformance/payment-render-surface.test.ts` | hata-dali-olu-kod (ek yoklama) |
| `src/__tests__/conformance/payment-status-trigger-contract.test.ts` | tetik-silindi-fonksiyon-kaldi (ek yoklama) |
| `src/__tests__/conformance/pim-unopim-yedek.test.ts` | app-key-korumasi-yorum-satirina-alindi; yeni-anahtar-algilama-olu-kod (ek yoklama) |
| `src/__tests__/conformance/postgrest-filter-grammar.test.ts` | degisken-uzerinden-gomme; dize-birlestirme-ile-gomme |
| `src/__tests__/conformance/precompact-durum-kapisi.test.ts` | matcher-hic-eslesmez-baglanti-olu |
| `src/__tests__/conformance/pricing-cache-invariants.test.ts` | edge-function-dogrudan-fiyat-yazar; elle-ezme-koruma-mantigi-kapatildi |
| `src/__tests__/conformance/pricing-fx-lock-contract.test.ts` | refresh-halkasi-kilit-sonucunu-yoksayar |
| `src/__tests__/conformance/pricing-fx-rate-single-resolver.test.ts` | ikinci-kopya-order-limit-lte-yok |
| `src/__tests__/conformance/pricing-money-append-only.test.ts` | currency-rates-for-all-policy; fiyat-kolonu-alter-type-float |
| `src/__tests__/conformance/pricing-order-snapshot-contract.test.ts` | yeni-yazma-yolu-alanlar-yalniz-yorumda |
| `src/__tests__/conformance/pricing-segment-source.test.ts` | ucuncu-cozucu-edge-user-profiles-okur; tablo-adi-sabit-uzerinden-user-profiles |
| `src/__tests__/conformance/pricing-storefront-source.test.ts` | select-degisken-uzerinden-price |
| `src/__tests__/conformance/prob-bekleyen-kuyruk.test.ts` | bagimsiz-prob-jetonu-basar-ama-yazi-durur |
| `src/__tests__/conformance/product-identity-resolver.test.ts` | jsonld-cagrisi-yoruma-alindi-ham-ad; pdp-ham-ad-istege-bagli-zincirle |
| `src/__tests__/conformance/promise-backing-behavior.test.tsx` | yazma-yerine-ilgisiz-izleme-fetch |
| `src/__tests__/conformance/purchasing-machine-and-evidence.test.ts` | goods-receipts-dogrudan-update |
| `src/__tests__/conformance/quote-atomik-yazim.test.ts` | toplu-grant-tum-fonksiyonlar-anon |
| `src/__tests__/conformance/quote-insert-policy-guard.test.ts` | bosluklu-tirnakli-politika-adi; tablo-adi-public-onekisiz |
| `src/__tests__/conformance/quote-items-policy-guard.test.ts` | bosluklu-tirnakli-update-politikasi |
| `src/__tests__/conformance/quote-machine-ssot.test.ts` | rakamli-ad-tenantsiz-select-politikasi |
| `src/__tests__/conformance/quote-yayim-sunucu.test.ts` | sonraki-migration-damga-tetigini-siler; toplu-grant-yardimci-fonksiyon-acilir |
| `src/__tests__/conformance/rec355-yetki-dongusu.test.ts` | yeni-migration-is_admin_claim-yeniden-tanimlandi-tablo-okuyor (ek yoklama) |
| `src/__tests__/conformance/recep-sozu-defteri.test.ts` | kapali-cross-session-regexi-silindi |
| `src/__tests__/conformance/registry-autosync-pencere.test.ts` | spawnSync-windowsHide-olmadan-eklendi |
| `src/__tests__/conformance/render-revalidation-contract.test.ts` | product_prices-dal-basi-duruyor-govde-tazelemiyor |
| `src/__tests__/conformance/required-checks-merge-ref.test.ts` | mergeref-adimi-hic-kosmuyor |
| `src/__tests__/conformance/returns-webhook-transitions.test.ts` | webhook-verdikt-yok-sayiliyor-cagri-duruyor |
| `src/__tests__/conformance/rls-coverage-ci-binding.test.ts` | is-kosulu-false-ile-etkisiz |
| `src/__tests__/conformance/rls-politika-sarma.test.ts` | sarma-adimi-DB_URL-envsiz-yorum-kaliyor |
| `src/__tests__/conformance/rls-yetki-karari.test.ts` | yeni-migration-auth.role()-admin-karari |
| `src/__tests__/conformance/rota-dili-dil-degistirici.test.tsx` | window-location-render-aninda-okunuyor (ek yoklama) |
| `src/__tests__/conformance/sage-ana-kok.test.ts` | kanca-dbKok-satira-gecmiyor |
| `src/__tests__/conformance/sage-dosya-dersi.test.ts` | matcher-Edit-cikti; compact-sifirlama-kopuk |
| `src/__tests__/conformance/sage-yedek.test.ts` | dogrulama-etkisiz-true-or |
| `src/__tests__/conformance/santiye-kanban.test.ts` | pano-yazma-kipinde-aciliyor |
| `src/__tests__/conformance/satis-kipi-acilis-onkosullari.test.ts` | ret-cikisi-yorumlandi |
| `src/__tests__/conformance/satis-kipi-anahtari.test.ts` | env-koseli-parantezle-okunuyor; ret-cikisi-yorumlandi (ek yoklama); checkout-yalniz-anahtara-bagli-esitlik-bicimi (ek yoklama) |
| `src/__tests__/conformance/satis-kipi-edge.test.ts` | yeni-uc-supabasejs-ile-siparis-yaziyor |
| `src/__tests__/conformance/satis-kipi-webhook-dali.test.ts` | dal-general-anahtarinda-da-tazeler |
| `src/__tests__/conformance/satis-kipi-yasal-kapi.test.ts` | checkout-yalniz-anahtara-bagli-esitlik-bicimi |
| `src/__tests__/conformance/scheduled-invoker-presence.test.ts` | cron-satiri-yorumlandi-schedule-kaldi |
| `src/__tests__/conformance/search-route-ssot.test.ts` | replace-ile-ham-adres |
| `src/__tests__/conformance/sema-graf-uretici.test.ts` | sir-degeri-loga-yaziliyor; tablo-paritesi-kapali-metin-duruyor; sslmode-sokulmuyor-kalip-metni-duruyor |
| `src/__tests__/conformance/sema-tabani-is-akisi.test.ts` | bos-dokum-reddi-devre-disi-metin-duruyor; supabase-db-push-adimi-eklendi |
| `src/__tests__/conformance/seo-h1-tekilligi.test.tsx` | kategori-landing-ikinci-h1 |
| `src/__tests__/conformance/seo-yonlendirme-hedefi.test.ts` | varyant-hedef-sablon-dizesiyle-yazildi |
| `src/__tests__/conformance/shipping-alarm-ops.test.ts` | EK: mükerrer takip kontrolü ölü ama dizgiler yerinde (if (false)) (ek yoklama) |
| `src/__tests__/conformance/silme-baglanti-kapisi.test.ts` | EK: tarama sınırı aşılınca durdurma kolu ölü (if (false)) (ek yoklama); EK: tarama derinliği 3 yerine 0 (iç içe bağlantı görülmez) (ek yoklama) |
| `src/__tests__/conformance/siparis-no-tek-bicim.test.ts` | EK: takma ad (alias) ile kesme: const no = order_number; no.split('-')[1] (ek yoklama) |
| `src/__tests__/conformance/skill-bitis-blogu.test.ts` | EK: bir skill'in bloğunda ENGELLI TANIMI silindi, kelime başka cümlede kalıyor (ek yoklama) |
| `src/__tests__/conformance/skill-python-yedegi.test.ts` | graphify-else-kolu-python3-TEK-kopya (ek yoklama) |
| `src/__tests__/conformance/skills-eval-puanlama.test.ts` | ikinci-claude-spawn-sade-bayraksiz (ek yoklama) |
| `src/__tests__/conformance/skills-hazir.test.ts` | README-satir-adlari-silindi (ek yoklama) |
| `src/__tests__/conformance/slug-degisince-yonlendirme.test.ts` | hedef-varyant-slug-adresi-oldu-K12-REC146-sinifi; lineo-hedefi-dil-sabit-yazildi (ek yoklama) |
| `src/__tests__/conformance/soguk-okuyucu-sinavi.test.ts` | kancaya-exec-alt-surec-eklendi (ek yoklama) |
| `src/__tests__/conformance/son-konusma-dokumu.test.ts` | sir-suzgeci-AWS-AKIA-deseni-etkisiz (ek yoklama) |
| `src/__tests__/conformance/spec-unit-order.test.ts` | harf-koruma-satiri-silindi (ek yoklama) |
| `src/__tests__/conformance/sql-etki.test.ts` | sayim-zaman-asimi-5sn-yerine-5000sn (ek yoklama) |
| `src/__tests__/conformance/sql-yazma-kapisi.test.ts` | settings-sql-yazma-kapisi-async-true (ek yoklama); pg_terminate_backend-yazma-sozcuklerinden-cikti (ek yoklama) |
| `src/__tests__/conformance/ssr-duman-kilidi.test.ts` | alarm-adimi-if-false (ek yoklama); alarm-cron-hic-tetiklenmez-(31-subat) (ek yoklama) |
| `src/__tests__/conformance/stok-uyari-teklif-paritesi.test.ts` | toplu yol ürün başına özet gönderiyor (map + Promise.all; for-of yok) (ek yoklama) |
| `src/__tests__/conformance/storefront-fiyat-sizintisi.test.ts` | PDP quoteMode hükmünü çağırmıyor (sabit false: fiyat her zaman basılır) (ek yoklama) |
| `src/__tests__/conformance/storefront-kategori-vitrin-izgara.test.ts` | className={'flex overflow-x-auto snap-x'} biçiminde yatay kaydırma eklendi (ek yoklama) |
| `src/__tests__/conformance/storefront-metadata-tek-yazici.test.ts` | src/components altına ./Seo göreli yoluyla Seo'yu içe aktaran yeni dosya (ek yoklama) |
| `src/__tests__/conformance/taban-tazeligi.test.ts` | tabandan yeni damgalı bir migration eklendi (dalda eklenen, indekse yazılan) |
| `src/__tests__/conformance/teklif-ic-bildirim.test.ts` | alıcı yokken defter 'failed' yerine 'sent' yazıyor (5 failed yazımından biri bozuldu) (ek yoklama) |
| `src/__tests__/conformance/test-kosu-kapsami.test.ts` | vitest.config: dislan dışlaması exclude listesine bağlı değil; vitest.config: yalniz kipinin include'u bağlı değil; vitest.config: ** ile başlayan belgesiz dışlama (taban-tazeligi); dunya-durumu.yml: test kırmızısı // true ile yutulur; dunya-durumu.yml: shell: bash (pipefail) bloğu silinir; dunya-du |
| `src/__tests__/conformance/uc-boyut-musteri-yuzeyi.test.ts` | listede olmayan yeni dosyada bayraksız VentHubCanvas (yeni müşteri 3D giriş noktası) (ek yoklama) |
| `src/__tests__/conformance/uretilmis-artefakt-ilan-kapsami.test.ts` | docs altına compiled_at damgalı, manifestte/istisnada olmayan üretilmiş dosya eklendi (indekse yazılan) (ek yoklama) |
| `src/__tests__/conformance/uretilmis-artefakt-tazeligi.test.ts` | üretilmiş venthub_hvac_master.md elle düzenlendi (çalışma ağacında) (ek yoklama) |
| `src/__tests__/conformance/urun-secici-girisi.test.ts` | arac-sayfasinda-permanentRedirect (ek yoklama) |
| `src/__tests__/conformance/urunler-kategori-kapisi.test.tsx` | zincirde-sabit-bos-dizi-geciriliyor (ek yoklama) |
| `src/__tests__/conformance/urunler-rotasi-statik.test.ts` | revalidate-sifira-cekildi (ek yoklama) |
| `src/__tests__/conformance/vaat-sizintisi.test.ts` | en-sozlukte-free-shipping-vaadi (ek yoklama); footer-metni-ucretsiz-kargo-vaadi (ek yoklama) |
| `src/__tests__/conformance/variant-selector-threshold.test.ts` | pdp-sabit-sayi-eski-ifade-yorumda (ek yoklama) |
| `src/__tests__/conformance/veri-tavani-sayfalama.test.ts` | elle-sayfalama-sayfa-boyu-tavani-asti (ek yoklama) |
| `src/__tests__/conformance/webhook-auth-fail-closed.test.ts` | baseline-sql-duz-metin-whsec-sirri (ek yoklama) |
| `src/__tests__/conformance/workflow-model-yonlendirme.test.ts` | bos-model-dizesi (ek yoklama) |
| `src/__tests__/conformance/wrongstack-kanonik-kok.test.ts` | cliDogrula: ".." kaçış (paket dışı) kontrolü kaldırıldı — node_modules/dist/cli.js gibi paket-dışı yol geçer (ek yoklama) |
| `src/__tests__/conformance/wrongstack-kurulum-betigi.test.ts` | kur(): yabancı pencere varken throw yerine yalnız yazıyor (DURMAZ; "if (yabanci.length)" metni ve sırası aynı) (ek yoklama) |
| `src/__tests__/conformance/wrongstack-sage-yama.test.ts` | yama eski satırı değişti (gerçek paketteki satırla uyuşmaz; yamanın kendi içinde tutarlı kalır) (ek yoklama) |
| `src/__tests__/conformance/wrongstack-surum-satiri.test.ts` | sonSurumuOlc: GitHub isteğinden zaman aşımı sinyali (AbortSignal.timeout) kaldırıldı (ek yoklama) |
| `src/__tests__/conformance/yayinda-model-tek-nokta.test.ts` | yeni üretim dosyası ayırıcıyı ["-","p","-"].join("") ile kuruyor (ek yoklama) |
| `src/__tests__/conformance/yokluk-hukmu-cetveli.test.ts` | §9 c satırı: "aynı yöntemin tekrarı da yeterlidir" (kural tersine; anahtar ifade "En az iki FARKLI yöntem" durur) (ek yoklama); §9 hüküm cümlesi: "biri eksik olsa da hüküm yazılabilir" (bakılmadı / bilmiyorum ifadesi durur) (ek yoklama) |

## Tüm dosyalar

Ayrıntı (sekiz soru, her dosya için) `test-karnesi-*.json` içindedir. Bu tablo yalnız özet sütunlarını verir.

| Dosya | Küme | CI kırmızı | Sabotaj | Ortam | Süre (ms) | Tetik | Aday |
|---|---|---|---|---|---|---|---|
| `scripts/ci/__tests__/degisiklik-sinifi.test.ts` | betik | 0 | ölçülmedi | supheli | ölçülmedi | statik (40) | OLCULMEDI |
| `scripts/ci/__tests__/dunya-durumu.test.ts` | betik | 0 | ölçülmedi | supheli | ölçülmedi | statik (24) | OLCULMEDI |
| `scripts/ci/__tests__/edited-ayna.test.ts` | betik | 0 | KIRMIZI (1/9) | supheli | ölçülmedi | statik (40) | KISMI-KORUMA |
| `scripts/ci/__tests__/test-haritasi-kaydedici.test.ts` | betik | 0 | ölçülmedi | supheli | ölçülmedi | statik (19) | OLCULMEDI |
| `scripts/ci/__tests__/test-haritasi-uret.test.ts` | betik | 0 | ölçülmedi | supheli | ölçülmedi | statik (32) | OLCULMEDI |
| `scripts/ci/__tests__/test-sec-geriye.test.ts` | betik | 0 | ölçülmedi | bagimsiz | ölçülmedi | statik (25) | OLCULMEDI |
| `scripts/ci/__tests__/test-sec.test.ts` | betik | 0 | ölçülmedi | bagimsiz | ölçülmedi | statik (40) | OLCULMEDI |
| `scripts/ci/__tests__/test-shard-bekle.test.ts` | betik | 0 | ölçülmedi | bagimsiz | ölçülmedi | statik (1) | OLCULMEDI |
| `scripts/ci/__tests__/test-shard-secim.test.ts` | betik | 0 | ölçülmedi | bagimsiz | ölçülmedi | statik (6) | OLCULMEDI |
| `scripts/ci/__tests__/test-shard.test.ts` | betik | 0 | ölçülmedi | bagimsiz | ölçülmedi | statik (11) | OLCULMEDI |
| `scripts/db/product-data/__tests__/identity-fix-kurallar.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 5 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/aile-metni-yaz.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 1208 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/en-jeton-kapisi.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 2514 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/faz4-teknik-yukle.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 4379 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/fiyat-bosluk.test.ts` | betik | 0 | ölçülmedi | supheli | 7 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/fiyat-kaynak-esle.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 9 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/gorsel-alt.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 5 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/gorsel-sozlesme.test.ts` | betik | 0 | ölçülmedi | supheli | 14 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/katalog-yukle.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 1631 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/kategori-en.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 8 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/paket-sozlesme.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 515 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/paket-tazelik.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 9 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/rec172-cikarim.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 1351 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/taslak-kaynak-kapisi.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 1426 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/teknik-duzelt.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 4158 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/toplu-sunum-k70.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 1815 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/uretici-fark-tablosu.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 554 | ölçülmedi | OLCULMEDI |
| `scripts/icerik-hatti/__tests__/urun-ad-en.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 5 | ölçülmedi | OLCULMEDI |
| `scripts/kademe2-load/__tests__/planla.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 11 | ölçülmedi | OLCULMEDI |
| `scripts/media/__tests__/gorsel-mukerrer.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 4 | ölçülmedi | OLCULMEDI |
| `scripts/media/__tests__/gorsel-uc-yuzey.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 8 | ölçülmedi | OLCULMEDI |
| `scripts/rehber/__tests__/alinti-dogrula.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 13 | ölçülmedi | OLCULMEDI |
| `scripts/rehber/__tests__/gsc-taban.test.ts` | betik | 0 | ölçülmedi | supheli | 5 | ölçülmedi | OLCULMEDI |
| `scripts/rehber/__tests__/ic-baglanti.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 9 | ölçülmedi | OLCULMEDI |
| `scripts/rehber/__tests__/rehber-denetim.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 46 | ölçülmedi | OLCULMEDI |
| `scripts/seo/__tests__/adres-yayin-denetim.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 11 | ölçülmedi | OLCULMEDI |
| `scripts/seo/__tests__/bot-karnesi-en-yayin.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 10 | statik (1) | OLCULMEDI |
| `scripts/seo/__tests__/canli-kapi.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 65 | ölçülmedi | OLCULMEDI |
| `scripts/seo/__tests__/gsc-url-denetim.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 4 | ölçülmedi | OLCULMEDI |
| `scripts/seo/__tests__/tarama-sarmalayici.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 14 | ölçülmedi | OLCULMEDI |
| `scripts/seo/__tests__/yayinda-model-ag-kapisi.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 84 | statik (1) | OLCULMEDI |
| `scripts/seo/__tests__/yayinda-model-veri-uret.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 13 | ölçülmedi | OLCULMEDI |
| `scripts/seo/__tests__/yetim-tara.test.ts` | betik | 0 | ölçülmedi | bagimsiz | 9 | ölçülmedi | OLCULMEDI |
| `scripts/test-karnesi/__tests__/ci-gecmis.test.ts` | betik | 0 | KIRMIZI (1/9) | bagimsiz | ölçülmedi | statik (17) | KISMI-KORUMA |
| `scripts/test-karnesi/__tests__/karne-uret.test.ts` | betik | 0 | KIRMIZI (1/7) | bagimsiz | ölçülmedi | statik (7) | KISMI-KORUMA |
| `scripts/test-karnesi/__tests__/sabotaj.test.ts` | betik | 0 | KIRMIZI (1/9) | supheli | ölçülmedi | statik (14) | KISMI-KORUMA |
| `src/__tests__/conformance/3d-asset-validity.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 15 | ölçülmedi | KORU |
| `src/__tests__/conformance/3d-csp.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 19 | statik (1) | KORU |
| `src/__tests__/conformance/3d-model-recipe.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 4 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/3d-procedural-env.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 23 | ölçülmedi | KORU |
| `src/__tests__/conformance/3d-single-canvas.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 27 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/admin-csv-hucre.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 12 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/admin-csv-import-mapping.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 12 | statik (2) | KORU |
| `src/__tests__/conformance/admin-customer-surface.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 5 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/admin-datatable-pagination.test.tsx` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 163 | statik (1) | KORU |
| `src/__tests__/conformance/admin-daypicker-classnames.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 5 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/admin-erp-resource-registry.test.ts` | conformance | 1 | KIRMIZI (1/1) | bagimsiz | 4 | statik (2) | KORU |
| `src/__tests__/conformance/admin-export-hygiene.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/admin-fx-lock-crud.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 6 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/admin-fx-lock-visibility.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 4 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/admin-istemci-yazma-politikasi.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 5 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/admin-list-search.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 3 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/admin-mutate-real-write.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 16 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/admin-overlay-invariants.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 15 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/admin-rbac-ui-db-drift.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 36 | ölçülmedi | KORU |
| `src/__tests__/conformance/admin-refund-real.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 3 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/admin-returns-concurrency.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 5 | ölçülmedi | KORU |
| `src/__tests__/conformance/admin-shell-invariants.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 10 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/admin-status-filter-domain.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 8 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/admin-status-label-coverage.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 5 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/admin-theme-invariants.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 16 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/aile-adi-tek-kaynak.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 463 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/aile-kategori-kapisi.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 488 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/aile-metni-sayisal-deger.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 6 | ölçülmedi | KORU |
| `src/__tests__/conformance/ajan-skill-cozulur.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 55 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/ajan-tanimlari.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 284 | statik (3) | KORU |
| `src/__tests__/conformance/aksiyon-sha-pin.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 12 | statik (2) | KORU |
| `src/__tests__/conformance/altgrup-kart-baglanti.test.tsx` | conformance | 0 | KIRMIZI (1/2) | supheli | 51 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/altgrup-kart-gorsel.test.tsx` | conformance | 0 | KIRMIZI (1/2) | supheli | 58 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/ana-agac-tazelik.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 28900 | statik (7) | KISMI-KORUMA |
| `src/__tests__/conformance/analitik-yerlesimi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 4 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/analytics-event-taxonomy.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 308 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/anasayfa-rotasi-statik.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 54 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/anon-definer-yetki.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 478 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/anon-yazma-nobetcisi.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 211 | statik (4) | KISMI-KORUMA |
| `src/__tests__/conformance/arac-envanteri.test.ts` | conformance | 30 | KIRMIZI (1/1) | bagli | 14023 | statik (14) | KORU |
| `src/__tests__/conformance/arama-davranisi.test.ts` | conformance | 0 | KIRMIZI (1/3) | supheli | 339 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/auth-account-surface.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | ölçülmedi | KORU |
| `src/__tests__/conformance/auth-reset-chain.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | ölçülmedi | KORU |
| `src/__tests__/conformance/auth-role-source.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 29 | statik (3) | KORU |
| `src/__tests__/conformance/auth-session-security.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 7 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/bagimlilik-denetimi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 351 | statik (4) | KORU |
| `src/__tests__/conformance/bagimlilik-karar-kaydi.test.ts` | conformance | 7 | KIRMIZI (1/1) | bagimsiz | 7 | beyan (2) | KORU |
| `src/__tests__/conformance/baglam-pencere-dosyasi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 1033 | ölçülmedi | KORU |
| `src/__tests__/conformance/bash-write-audit-claude-deposu.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 1010 | ölçülmedi | KORU |
| `src/__tests__/conformance/bash-write-audit-merge-muafiyeti.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 13735 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/bash-write-audit-tree.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 31056 | statik (2) | KORU |
| `src/__tests__/conformance/bash-write-audit-uretilmis-sinifi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 8386 | statik (3) | COKLU-KORUMA-ADAYI |
| `src/__tests__/conformance/bash-write-gate.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 9 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/bash-write-guard-muafiyet.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 6299 | ölçülmedi | KORU |
| `src/__tests__/conformance/belge-defteri.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 7162 | statik (10) | KISMI-KORUMA |
| `src/__tests__/conformance/belge-kart-plan-kapisi.test.ts` | conformance | 0 | TABAN_KIRMIZI (0/0) | bagli | 2468 | statik (4) | ORTAM-INCELE |
| `src/__tests__/conformance/belge-tazelik.test.ts` | conformance | 2 | KIRMIZI (1/1) | supheli | 592 | statik (13) | KORU |
| `src/__tests__/conformance/belge-yonlendirici.test.ts` | conformance | 0 | KIRMIZI (1/3) | bagimsiz | 10 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/bellek-yoklama.test.ts` | conformance | 1 | KIRMIZI (1/2) | supheli | 770 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/beyansiz-olcum-lambasi.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 4214 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/board-globs-tekrarlanan-bayrak.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 868 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/board-hedef-serit-adi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 3431 | statik (3) | KORU |
| `src/__tests__/conformance/board-invariants.test.ts` | conformance | 5 | KIRMIZI (1/2) | supheli | 25058 | statik (28) | KISMI-KORUMA |
| `src/__tests__/conformance/board-pencere-adi.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 1647 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/bos-sku-render.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 637 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/build-skip-positive-logic.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 16961 | statik (40) | KISMI-KORUMA |
| `src/__tests__/conformance/canli-kanit-yalitimi.test.ts` | conformance | 0 | KIRMIZI (1/3) | bagimsiz | 6 | statik (4) | KISMI-KORUMA |
| `src/__tests__/conformance/canonical-lang-segment.test.ts` | conformance | 1 | KIRMIZI (1/2) | bagimsiz | 64 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/canonical-url-ssot.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 51 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/catalog-integrity-gate.test.ts` | conformance | 1 | KIRMIZI (1/1) | supheli | 1197 | statik (1) | KORU |
| `src/__tests__/conformance/category-metadata-i18n-ssot.test.ts` | conformance | 1 | KIRMIZI (1/2) | bagimsiz | 21 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/category-name-ssot.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 16 | ölçülmedi | KORU |
| `src/__tests__/conformance/category-view-reach.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 28 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/cati-dil-saglayicisi.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 6 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/ci-degisiklik-sinifi.test.ts` | conformance | 0 | ölçülmedi | supheli | ölçülmedi | statik (26) | OLCULMEDI |
| `src/__tests__/conformance/ci-edited-ayna.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | ölçülmedi | statik (5) | KISMI-KORUMA |
| `src/__tests__/conformance/ci-install-bounded.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 7 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/ci-kilitli-kurulum.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 10 | statik (2) | KORU |
| `src/__tests__/conformance/ci-pr-kayit-kapisi.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 8 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/ci-test-secimi-hizli.test.ts` | conformance | 0 | ölçülmedi | supheli | ölçülmedi | statik (23) | OLCULMEDI |
| `src/__tests__/conformance/ci-test-secimi-ifade.test.ts` | conformance | 0 | ölçülmedi | bagimsiz | ölçülmedi | statik (5) | OLCULMEDI |
| `src/__tests__/conformance/ci-test-secimi-kapsam.test.ts` | conformance | 0 | ölçülmedi | supheli | ölçülmedi | statik (11) | OLCULMEDI |
| `src/__tests__/conformance/ci-test-secimi-uyum.test.ts` | conformance | 0 | ölçülmedi | bagimsiz | ölçülmedi | statik (9) | OLCULMEDI |
| `src/__tests__/conformance/ci-test-secimi.test.ts` | conformance | 0 | ölçülmedi | supheli | ölçülmedi | statik (7) | OLCULMEDI |
| `src/__tests__/conformance/ci-test-shard.test.ts` | conformance | 0 | ölçülmedi | supheli | ölçülmedi | statik (12) | OLCULMEDI |
| `src/__tests__/conformance/claim-yenile.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 18423 | statik (13) | KORU |
| `src/__tests__/conformance/comment-scrubber-scheme-safety.test.ts` | conformance | 11 | KIRMIZI (1/2) | bagli | 132 | statik (16) | TASI-ADAYI-DUNYA-DURUMU |
| `src/__tests__/conformance/commit-oncesi-uyarilar-kilidi.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 1291 | statik (4) | KISMI-KORUMA |
| `src/__tests__/conformance/companion-defter.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 1273 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/companion-doc-parity.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 132 | statik (15) | KORU |
| `src/__tests__/conformance/companion-dondurulmus.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 1238 | statik (3) | KORU |
| `src/__tests__/conformance/companion-parity-coverage.test.ts` | conformance | 13 | KIRMIZI (1/1) | bagli | 2833 | statik (10) | TASI-ADAYI-DUNYA-DURUMU |
| `src/__tests__/conformance/config-fail-closed.test.ts` | conformance | 3 | KIRMIZI (1/2) | bagimsiz | 41 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/csp-origin-coverage.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 5 | statik (4) | KORU |
| `src/__tests__/conformance/currency-not-from-language.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 76 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/db-view-grant-hygiene.test.ts` | conformance | 2 | KIRMIZI (1/2) | bagimsiz | 9 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/defter-bayatlik-olcumu.test.ts` | conformance | 1 | KIRMIZI (1/2) | supheli | 3469 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/denetim-izi-kapisi.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 183 | statik (5) | KISMI-KORUMA |
| `src/__tests__/conformance/denetim-model-yonlendirme.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 48 | ölçülmedi | KORU |
| `src/__tests__/conformance/departman-ac-kapat.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 42416 | statik (15) | KORU |
| `src/__tests__/conformance/dependency-pins.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 5 | statik (2) | KORU |
| `src/__tests__/conformance/depo-dokum-kapisi-uctan-uca.test.ts` | conformance | 0 | ölçülmedi | supheli | ölçülmedi | statik (5) | OLCULMEDI |
| `src/__tests__/conformance/depo-dokum-kapisi.test.ts` | conformance | 0 | ölçülmedi | supheli | ölçülmedi | beyan (2) | OLCULMEDI |
| `src/__tests__/conformance/diff-review-taban.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 4225 | statik (1) | KORU |
| `src/__tests__/conformance/dunya-durumu-satiri.test.ts` | conformance | 0 | KIRMIZI (1/8) | supheli | ölçülmedi | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/durum-dondur.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 4296 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/e1-kimlik-kontrolu.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 7492 | statik (5) | COKLU-KORUMA-ADAYI |
| `src/__tests__/conformance/edge-delivery-idempotency.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 6 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/edge-drift-yeniden-dene.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 12 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/edge-koken-allowlist.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 7 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/edge-sayfalama.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 19 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/edge-security.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 39 | statik (14) | KISMI-KORUMA |
| `src/__tests__/conformance/edge-select-columns.test.ts` | conformance | 1 | KIRMIZI (1/1) | bagimsiz | 40 | ölçülmedi | KORU |
| `src/__tests__/conformance/edge-shared-input-drift.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 5 | statik (4) | KISMI-KORUMA |
| `src/__tests__/conformance/en-alt-kategori-terim.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 162 | ölçülmedi | KORU |
| `src/__tests__/conformance/en-yayin-anahtari.test.ts` | conformance | 1 | KIRMIZI (1/1) | bagimsiz | 209 | statik (3) | KORU |
| `src/__tests__/conformance/env-yazma-kapisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 7 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/eol-normalization.test.ts` | conformance | 6 | KIRMIZI (1/1) | supheli | 2551 | statik (2) | KORU |
| `src/__tests__/conformance/eposta-defter-yazici-zorunlu-kolon.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 5 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/eposta-kimlik-varsayilan.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 26 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/eposta-sablon-alanlari.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 7 | statik (1) | KORU |
| `src/__tests__/conformance/eski-adres-yonlendirme-yeni-slug.test.ts` | conformance | 0 | ölçülmedi | bagimsiz | ölçülmedi | statik (2) | OLCULMEDI |
| `src/__tests__/conformance/eylem-defteri.test.ts` | conformance | 1 | KIRMIZI (1/1) | supheli | 588 | statik (2) | KORU |
| `src/__tests__/conformance/favicon-baglantisi.test.ts` | conformance | 0 | ölçülmedi | bagimsiz | ölçülmedi | statik (3) | OLCULMEDI |
| `src/__tests__/conformance/fiyat-gunlugu-yontem-basligi.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 60 | statik (6) | KISMI-KORUMA |
| `src/__tests__/conformance/fleet-mechanism-integrity.test.ts` | conformance | 1 | KIRMIZI (1/1) | supheli | 338 | statik (7) | KORU |
| `src/__tests__/conformance/font-preload-olcumu.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 7 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/form-submission-standard.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 9 | statik (5) | KISMI-KORUMA |
| `src/__tests__/conformance/foy-vitrin-parite.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 9 | ölçülmedi | KORU |
| `src/__tests__/conformance/gh-api-kapisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/githooks-doc-scope.test.ts` | conformance | 6 | KIRMIZI (1/1) | bagli | 18283 | statik (6) | TASI-ADAYI-DUNYA-DURUMU |
| `src/__tests__/conformance/githooks-integrity.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | statik (1) | KORU |
| `src/__tests__/conformance/golge-kurucu.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 9 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/gorsel-yedegi.test.ts` | conformance | 0 | ölçülmedi | bagimsiz | ölçülmedi | statik (4) | OLCULMEDI |
| `src/__tests__/conformance/gorunum-anahtari-faz-2b.test.tsx` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 43 | ölçülmedi | KORU |
| `src/__tests__/conformance/gozcu-oz-not-eleme.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 36145 | statik (1) | KORU |
| `src/__tests__/conformance/gozlemci-sozlesmesi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 679 | ölçülmedi | KORU |
| `src/__tests__/conformance/gsc-token.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 7 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/gun-kapanisi-belge-defteri.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 5109 | statik (1) | KORU |
| `src/__tests__/conformance/hafiza-baglam-ve-belge-satiri.test.ts` | conformance | 1 | KIRMIZI (1/1) | supheli | 338 | statik (3) | KORU |
| `src/__tests__/conformance/hafiza-enjeksiyonu.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 4874 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/hafiza-indeks-bekcisi-kilidi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 2975 | statik (4) | KISMI-KORUMA |
| `src/__tests__/conformance/hafiza-sorusu-yonlendirme.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 2997 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/hardcoded-category-slug-ssot.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 7 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/harita-uret-is-akisi.test.ts` | conformance | 0 | ölçülmedi | bagimsiz | ölçülmedi | statik (4) | OLCULMEDI |
| `src/__tests__/conformance/header-teklif-paneli.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 7 | ölçülmedi | KORU |
| `src/__tests__/conformance/header-urun-secici.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 5 | statik (1) | KORU |
| `src/__tests__/conformance/hesaplayici-alt-metin-sahiplik.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 65 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/home-hero-route-ssot.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 4 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/hook-referential-stability.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 116 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/i18n-attribute-literals.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 81 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/i18n-dead-key.test.ts` | conformance | 5 | KIRMIZI (1/1) | bagimsiz | 300 | statik (22) | KORU |
| `src/__tests__/conformance/i18n-key-resolution.test.ts` | conformance | 1 | KIRMIZI (1/2) | bagimsiz | 25 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/i18n-locale-case.test.ts` | conformance | 1 | KIRMIZI (1/2) | bagimsiz | 31 | statik (17) | KISMI-KORUMA |
| `src/__tests__/conformance/i18n-locale-compare.test.ts` | conformance | 1 | KIRMIZI (1/1) | bagimsiz | 5 | statik (8) | KISMI-KORUMA |
| `src/__tests__/conformance/i18n-ters-yon.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 10 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/i18n-uppercase-proper-noun.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 4 | statik (14) | KORU |
| `src/__tests__/conformance/i18n-yedek-literal.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 7 | statik (1) | KORU |
| `src/__tests__/conformance/ic-kod-sizintisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 130 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/ic-not-vitrine-cikamaz.test.ts` | conformance | 1 | KIRMIZI (1/1) | bagimsiz | 5 | ölçülmedi | KORU |
| `src/__tests__/conformance/instruction-surface-ppr.test.ts` | conformance | 1 | YESIL (0/2) | supheli | 392 | statik (6) | SAHTE-YESIL-ADAYI |
| `src/__tests__/conformance/invoice-ledger-contract.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 7 | statik (4) | KISMI-KORUMA |
| `src/__tests__/conformance/izin-reddi-gunlugu.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 1479 | ölçülmedi | KORU |
| `src/__tests__/conformance/jsonld-fiyat-sizintisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 295 | ölçülmedi | KORU |
| `src/__tests__/conformance/jsonld-urungrubu-gorsel.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | statik (1) | KORU |
| `src/__tests__/conformance/kanban-anlik.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 1187 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/kanban-toplu.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 4 | statik (1) | KORU |
| `src/__tests__/conformance/kanca-board-brief.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 1618 | statik (1) | KORU |
| `src/__tests__/conformance/kanca-board-release.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 777 | statik (2) | KORU |
| `src/__tests__/conformance/kanca-defter-tazelik.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 17705 | statik (4) | KORU |
| `src/__tests__/conformance/kanca-kartsiz-beklenti-kapisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 1842 | ölçülmedi | KORU |
| `src/__tests__/conformance/kanca-lane-guard.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 1542 | statik (11) | KORU |
| `src/__tests__/conformance/kanca-protect-config.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 1588 | statik (6) | KORU |
| `src/__tests__/conformance/kanca-sensitive-path-guard.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 18417 | statik (7) | KORU |
| `src/__tests__/conformance/kanca-son-soz-gate.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 1415 | ölçülmedi | KORU |
| `src/__tests__/conformance/kanca-verify-on-stop.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 5 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/kanonik-kok-istemci.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 53 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/kapali-dal-push.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 1133 | statik (1) | KORU |
| `src/__tests__/conformance/kapi-import-guvenligi.test.ts` | conformance | 2 | KIRMIZI (1/1) | supheli | 71 | statik (2) | KORU |
| `src/__tests__/conformance/karar-kayit-bagi.test.ts` | conformance | 4 | KIRMIZI (1/2) | supheli | 25 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/kart-aciklama-mobil.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 5 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/kart-yukleme-onceligi.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 4 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/kartsiz-kayit-sayaci.test.ts` | conformance | 0 | KIRMIZI (1/4) | supheli | 121 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/katalog-sayim-tls.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 515 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/kategori-aciklama-dil-cozumu.test.ts` | conformance | 3 | KIRMIZI (1/3) | bagimsiz | 41 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/kategori-adi-marketing-emekli.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 14 | statik (7) | KISMI-KORUMA |
| `src/__tests__/conformance/kategori-adi-tek-kaynak.test.ts` | conformance | 0 | KIRMIZI (1/3) | supheli | 2592 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/kategori-bilinmeyen-slug.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 85 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/kategori-cozucu-oncelik.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 5 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/kategori-gorsel-tek-kaynak.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 162 | statik (9) | KISMI-KORUMA |
| `src/__tests__/conformance/kategori-rotasi-statik.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 69 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/kategori-sayilari-onbellek.test.ts` | conformance | 0 | KIRMIZI (1/3) | bagimsiz | 5 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/kimlik-kurali-kapisi.test.ts` | conformance | 5 | KIRMIZI (1/2) | bagimsiz | 165 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/kopuk-surec-pencere.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 261 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/kume-master-tazeligi.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 1993 | statik (7) | KISMI-KORUMA |
| `src/__tests__/conformance/kvkk-request-ledger.test.ts` | conformance | 0 | KIRMIZI (1/3) | bagimsiz | 8 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/lane-precommit-merge.test.ts` | conformance | 2 | KIRMIZI (1/2) | supheli | 1530 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/lang-metadata-locale.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 20 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/legal-consent-analytics.test.ts` | conformance | 0 | KIRMIZI (1/4) | bagimsiz | 11 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/legal-consent-gate.test.ts` | conformance | 0 | KIRMIZI (1/3) | bagimsiz | 4 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/legal-en-leftover.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 3 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/legal-promise-backing.test.ts` | conformance | 0 | KIRMIZI (1/3) | bagimsiz | 10 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/linear-arsiv.test.ts` | conformance | 0 | KIRMIZI (1/3) | bagimsiz | 129 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/linear-yeni-yorum.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 1092 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/localized-route-ssot.test.ts` | conformance | 1 | KIRMIZI (1/3) | bagimsiz | 43 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/maliyet-yazici-kurali.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 131 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/marka-i18n-butunlugu.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 8 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/marka-palet-tokenlari.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/marketing-title-yuk.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 97 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/merge-ritueli.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 25 | statik (3) | KORU |
| `src/__tests__/conformance/merge-sonrasi-ileri-sar.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 67043 | ölçülmedi | KORU |
| `src/__tests__/conformance/migration-atomicity.test.ts` | conformance | 1 | KIRMIZI (1/2) | bagimsiz | 25 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/migration-ledger-model.test.ts` | conformance | 1 | KIRMIZI (1/2) | bagimsiz | 1465 | statik (4) | KISMI-KORUMA |
| `src/__tests__/conformance/misafir-teklif-ucu.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 99 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/mobil-alt-sekme.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/mutasyon-kosucu.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 1499 | statik (17) | KORU |
| `src/__tests__/conformance/mutlak-yol-sizintisi.test.ts` | conformance | 27 | KIRMIZI (1/1) | supheli | 4448 | statik (4) | KISMI-KORUMA |
| `src/__tests__/conformance/notice-kapsami.test.ts` | conformance | 1 | KIRMIZI (1/1) | bagimsiz | 131 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/notification-standard.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 106 | statik (2) | KORU |
| `src/__tests__/conformance/numeric-format-ssot.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 21 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/odeme-eslesme-baglantisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 12 | statik (4) | KORU |
| `src/__tests__/conformance/onizleme-adres-kipi.test.ts` | conformance | 0 | ölçülmedi | supheli | ölçülmedi | statik (2) | OLCULMEDI |
| `src/__tests__/conformance/onizleme-tarama.test.ts` | conformance | 0 | ölçülmedi | supheli | ölçülmedi | statik (2) | OLCULMEDI |
| `src/__tests__/conformance/onizleme-yalitimi.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 7 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/order-status-dictionary.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 5 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/pano-canlilik-claude-agents.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 4147 | statik (1) | KORU |
| `src/__tests__/conformance/pano-sayfasi.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 256 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/payment-edge-integrity.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | statik (6) | KORU |
| `src/__tests__/conformance/payment-integrity.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | statik (4) | KORU |
| `src/__tests__/conformance/payment-ledger-vocabulary.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 79 | statik (2) | KORU |
| `src/__tests__/conformance/payment-money-move.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/payment-render-surface.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 7 | statik (6) | KISMI-KORUMA |
| `src/__tests__/conformance/payment-status-trigger-contract.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 3 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/peer-dependency-integrity.test.ts` | conformance | 1 | KIRMIZI (1/1) | supheli | 7 | statik (2) | KORU |
| `src/__tests__/conformance/pim-unopim-csv.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 9 | ölçülmedi | KORU |
| `src/__tests__/conformance/pim-unopim-yedek.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 8 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/postgrest-filter-grammar.test.ts` | conformance | 0 | KIRMIZI (1/3) | bagimsiz | 128 | statik (10) | KISMI-KORUMA |
| `src/__tests__/conformance/pr-kayit-kapisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 403 | statik (2) | KORU |
| `src/__tests__/conformance/precompact-durum-kapisi.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 3303 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/precompact-hafiza-dizinleri.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 1080 | statik (3) | KORU |
| `src/__tests__/conformance/pricing-cache-invariants.test.ts` | conformance | 0 | KIRMIZI (1/3) | bagimsiz | 23 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/pricing-fx-lock-contract.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 11 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/pricing-fx-rate-single-resolver.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 16 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/pricing-money-append-only.test.ts` | conformance | 0 | KIRMIZI (1/3) | bagimsiz | 32 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/pricing-order-snapshot-contract.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 6 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/pricing-segment-source.test.ts` | conformance | 0 | KIRMIZI (1/3) | bagimsiz | 4 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/pricing-storefront-source.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 8 | statik (7) | KISMI-KORUMA |
| `src/__tests__/conformance/prob-bekleyen-kuyruk.test.ts` | conformance | 1 | KIRMIZI (1/2) | supheli | 13 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/product-identity-resolver.test.ts` | conformance | 0 | KIRMIZI (1/3) | supheli | 37 | statik (5) | KISMI-KORUMA |
| `src/__tests__/conformance/promise-backing-behavior.test.tsx` | conformance | 0 | KIRMIZI (1/2) | supheli | 342 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/purchasing-machine-and-evidence.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 89 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/quote-atomik-yazim.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 69 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/quote-insert-policy-guard.test.ts` | conformance | 0 | KIRMIZI (1/3) | bagimsiz | 4 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/quote-items-policy-guard.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 4 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/quote-machine-ssot.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 24 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/quote-yayim-sunucu.test.ts` | conformance | 0 | KIRMIZI (1/3) | supheli | 137 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/rec355-yetki-dongusu.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 8 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/recep-sozu-defteri-yedek.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 727 | statik (3) | KORU |
| `src/__tests__/conformance/recep-sozu-defteri.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 3607 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/registry-autosync-pencere.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 3 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/rehber-aile-slug-gecmisi.test.ts` | conformance | 0 | ölçülmedi | bagimsiz | ölçülmedi | ölçülmedi | OLCULMEDI |
| `src/__tests__/conformance/render-price-surface.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 12 | statik (22) | KORU |
| `src/__tests__/conformance/render-revalidation-contract.test.ts` | conformance | 2 | KIRMIZI (1/2) | bagimsiz | 1403 | statik (7) | KISMI-KORUMA |
| `src/__tests__/conformance/required-checks-merge-ref.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 4 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/returns-webhook-transitions.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 7 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/rls-coverage-ci-binding.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 3 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/rls-politika-sarma.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 1709 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/rls-yetki-karari.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 65 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/rol-kartlari.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 18244 | statik (16) | KORU |
| `src/__tests__/conformance/rota-dili-acik-kip.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 4463 | ölçülmedi | KORU |
| `src/__tests__/conformance/rota-dili-adres-uretimi.test.ts` | conformance | 1 | KIRMIZI (1/1) | supheli | 1039 | ölçülmedi | KORU |
| `src/__tests__/conformance/rota-dili-dil-degistirici.test.tsx` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 471 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/rota-dili-kapali-sifir-fark.test.ts` | conformance | 1 | KIRMIZI (1/1) | bagimsiz | 1594 | statik (1) | KORU |
| `src/__tests__/conformance/rota-dili-matris.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 867 | ölçülmedi | KORU |
| `src/__tests__/conformance/runtime-version-alignment.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 246 | statik (4) | KORU |
| `src/__tests__/conformance/sage-ana-kok.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 1129 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/sage-dosya-dersi.test.ts` | conformance | 0 | KIRMIZI (1/3) | supheli | 1080 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/sage-yedek.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 1860 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/santiye-kanban.test.ts` | conformance | 0 | KIRMIZI (1/2) | supheli | 3037 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/satis-kipi-acilis-onkosullari.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 438 | statik (5) | KISMI-KORUMA |
| `src/__tests__/conformance/satis-kipi-anahtari.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 597 | statik (5) | KISMI-KORUMA |
| `src/__tests__/conformance/satis-kipi-edge.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 550 | statik (5) | KISMI-KORUMA |
| `src/__tests__/conformance/satis-kipi-webhook-dali.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 6 | statik (4) | KISMI-KORUMA |
| `src/__tests__/conformance/satis-kipi-yasal-kapi.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 59 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/scheduled-invoker-presence.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 6 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/search-route-ssot.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 142 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/sema-graf-uretici.test.ts` | conformance | 0 | KIRMIZI (1/4) | bagimsiz | 232 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/sema-tabani-is-akisi.test.ts` | conformance | 0 | KIRMIZI (1/3) | bagimsiz | 20 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/seo-h1-tekilligi.test.tsx` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 368 | statik (4) | KISMI-KORUMA |
| `src/__tests__/conformance/seo-yonlendirme-hedefi.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 4 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/sessionstart-pencere-adi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 71005 | statik (2) | KORU |
| `src/__tests__/conformance/sessionstart-tavan.test.ts` | conformance | 4 | KIRMIZI (1/1) | bagli | 130403 | statik (3) | TASI-ADAYI-DUNYA-DURUMU |
| `src/__tests__/conformance/shipping-alarm-ops.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 12 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/silent-fan-series-binding.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 13 | statik (1) | KORU |
| `src/__tests__/conformance/silme-baglanti-kapisi.test.ts` | conformance | 2 | KIRMIZI (1/1) | supheli | 541 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/siparis-istemci-yazma-bekcisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 219 | ölçülmedi | KORU |
| `src/__tests__/conformance/siparis-no-tek-bicim.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 11 | statik (5) | KISMI-KORUMA |
| `src/__tests__/conformance/sir-basan-kalip.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 10 | statik (3) | KORU |
| `src/__tests__/conformance/skill-ad-cakismasi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 103 | statik (2) | KORU |
| `src/__tests__/conformance/skill-bagli.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 50 | statik (2) | KORU |
| `src/__tests__/conformance/skill-bitis-blogu.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/skill-frontmatter-ayrisir.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 51 | statik (7) | KORU |
| `src/__tests__/conformance/skill-katalog-tazeligi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 26 | statik (5) | KORU |
| `src/__tests__/conformance/skill-listesi-say.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 4 | statik (1) | KORU |
| `src/__tests__/conformance/skill-python-yedegi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 54 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/skill-yuku-butcesi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 7 | statik (6) | KORU |
| `src/__tests__/conformance/skills-eval-puanlama.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 10 | statik (4) | KISMI-KORUMA |
| `src/__tests__/conformance/skills-hazir.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 8 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/slug-degisince-yonlendirme.test.ts` | conformance | 0 | KIRMIZI (1/2) | bagimsiz | 5 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/soguk-okuyucu-sinavi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 1006 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/son-konusma-dokumu.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 366 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/spec-axis-gate.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | ölçülmedi | KORU |
| `src/__tests__/conformance/spec-label-coverage.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 9 | statik (1) | KORU |
| `src/__tests__/conformance/spec-unit-order.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 4 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/sql-etki.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 9 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/sql-yazma-kapisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 47 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/ssr-duman-kilidi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 3503 | statik (6) | KISMI-KORUMA |
| `src/__tests__/conformance/standard-section-integrity.test.ts` | conformance | 13 | KIRMIZI (1/1) | bagli | 123 | statik (2) | TASI-ADAYI-DUNYA-DURUMU |
| `src/__tests__/conformance/stock-restore-evidence.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 37 | statik (5) | KORU |
| `src/__tests__/conformance/stok-uyari-teklif-paritesi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/storage-yazma-nobetcisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 187 | statik (4) | COKLU-KORUMA-ADAYI |
| `src/__tests__/conformance/storefront-fiyat-sizintisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 3 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/storefront-kategori-vitrin-izgara.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 5 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/storefront-metadata-tek-yazici.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 265 | statik (3) | KISMI-KORUMA |
| `src/__tests__/conformance/storefront-reflow-guards.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 4 | statik (3) | KORU |
| `src/__tests__/conformance/storefront-ssr-govde.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 127 | statik (3) | KORU |
| `src/__tests__/conformance/storefront-style-ratchet.test.ts` | conformance | 13 | KIRMIZI (1/1) | bagimsiz | 46 | statik (2) | KORU |
| `src/__tests__/conformance/taban-tazele.test.ts` | conformance | 1 | KIRMIZI (1/1) | supheli | 37952 | statik (13) | KORU |
| `src/__tests__/conformance/taban-tazeligi-dunya.test.ts` | conformance | 0 | ölçülmedi | supheli | ölçülmedi | statik (5) | TASINDI |
| `src/__tests__/conformance/taban-tazeligi.test.ts` | conformance | 55 | KIRMIZI (1/2) | bagli | 245 | statik (4) | TASI-ADAYI-DUNYA-DURUMU |
| `src/__tests__/conformance/tailwind-token-aa-renkleri.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 136 | statik (1) | KORU |
| `src/__tests__/conformance/tailwind-token-sinif-gecerliligi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 473 | ölçülmedi | KORU |
| `src/__tests__/conformance/tek-kanonik-kategori-adresi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | statik (4) | KORU |
| `src/__tests__/conformance/teklif-ic-bildirim.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 16 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/test-kosu-kapsami.test.ts` | conformance | 0 | KIRMIZI (1/9) | supheli | ölçülmedi | statik (13) | KISMI-KORUMA |
| `src/__tests__/conformance/tip-drift-kapisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 94 | statik (2) | KORU |
| `src/__tests__/conformance/uc-boyut-musteri-yuzeyi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 9 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/uretilmis-artefakt-ilan-kapsami.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 1461 | statik (9) | KISMI-KORUMA |
| `src/__tests__/conformance/uretilmis-artefakt-tazeligi.test.ts` | conformance | 36 | KIRMIZI (1/1) | bagli | 754 | statik (4) | TASI-ADAYI-DUNYA-DURUMU |
| `src/__tests__/conformance/url-takma-adlari-listele.test.ts` | conformance | 0 | ölçülmedi | bagimsiz | ölçülmedi | ölçülmedi | OLCULMEDI |
| `src/__tests__/conformance/urun-secici-girisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 63 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/urunler-kategori-kapisi.test.tsx` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 370 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/urunler-rotasi-statik.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 78 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/vaat-sizintisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 1663 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/variant-selector-threshold.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 4 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/vercel-json-kapsam.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 9 | statik (2) | KORU |
| `src/__tests__/conformance/veri-tavani-sayfalama.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 9 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/vitest-defter-ortami.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 13 | statik (2) | KORU |
| `src/__tests__/conformance/vitrin-a11y-etiket-gorsel.test.tsx` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 406 | ölçülmedi | KORU |
| `src/__tests__/conformance/webhook-auth-fail-closed.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 45 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/workflow-model-yonlendirme.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 6 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/wrongstack-kanban-yama.test.ts` | conformance | 1 | KIRMIZI (1/1) | supheli | 11 | ölçülmedi | KORU |
| `src/__tests__/conformance/wrongstack-kanonik-kok.test.ts` | conformance | 1 | KIRMIZI (1/1) | supheli | 356 | statik (6) | KISMI-KORUMA |
| `src/__tests__/conformance/wrongstack-kurulum-betigi.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 7 | ölçülmedi | KISMI-KORUMA |
| `src/__tests__/conformance/wrongstack-mcp-kurulum.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 411 | statik (6) | KORU |
| `src/__tests__/conformance/wrongstack-sage-yama.test.ts` | conformance | 1 | KIRMIZI (1/1) | supheli | 359 | statik (2) | KISMI-KORUMA |
| `src/__tests__/conformance/wrongstack-surum-satiri.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 882 | statik (1) | KISMI-KORUMA |
| `src/__tests__/conformance/yayinda-model-kapali-kip.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 8 | ölçülmedi | KORU |
| `src/__tests__/conformance/yayinda-model-tek-nokta.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 117 | statik (11) | KISMI-KORUMA |
| `src/__tests__/conformance/yazi-govdesi-ikame-kapisi.test.ts` | conformance | 0 | KIRMIZI (1/1) | supheli | 155 | ölçülmedi | KORU |
| `src/__tests__/conformance/yokluk-hukmu-cetveli.test.ts` | conformance | 0 | KIRMIZI (1/1) | bagimsiz | 3 | statik (1) | KISMI-KORUMA |
| `src/__tests__/middlewareAdminOnek.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 13 | ölçülmedi | OLCULMEDI |
| `src/__tests__/middlewareKokDosya.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 19 | statik (2) | OLCULMEDI |
| `src/__tests__/middlewareMatcher.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 3 | ölçülmedi | OLCULMEDI |
| `src/app/__tests__/aramaAciklamalari.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 12 | ölçülmedi | OLCULMEDI |
| `src/app/__tests__/kategoriMarkaRotalari.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 21 | statik (1) | OLCULMEDI |
| `src/app/__tests__/kategoriMarkaRotalariK3b.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 27 | ölçülmedi | OLCULMEDI |
| `src/app/__tests__/langGecersizDil.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 7 | ölçülmedi | OLCULMEDI |
| `src/app/__tests__/modelSayfasiVeriYok.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 5 | ölçülmedi | OLCULMEDI |
| `src/app/__tests__/sitemapAdresUret.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 79 | ölçülmedi | OLCULMEDI |
| `src/app/__tests__/sitemapHataKirar.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 180 | ölçülmedi | OLCULMEDI |
| `src/app/__tests__/sitemapLastmod.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 64 | ölçülmedi | OLCULMEDI |
| `src/app/__tests__/sitemapModel.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 1472 | ölçülmedi | OLCULMEDI |
| `src/app/__tests__/sitemapYayindaModel.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 190 | ölçülmedi | OLCULMEDI |
| `src/app/__tests__/urunRotasi.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 6 | ölçülmedi | OLCULMEDI |
| `src/app/api/webhook/supabase/__tests__/route.family-fanout.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 47 | ölçülmedi | OLCULMEDI |
| `src/app/api/webhook/supabase/__tests__/route.model-yolu.acik.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 952 | ölçülmedi | OLCULMEDI |
| `src/app/api/webhook/supabase/__tests__/route.model-yolu.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 49 | ölçülmedi | OLCULMEDI |
| `src/app/api/webhook/supabase/__tests__/route.tags.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 92 | ölçülmedi | OLCULMEDI |
| `src/components/__tests__/Footer.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 50 | ölçülmedi | OLCULMEDI |
| `src/components/__tests__/FooterKategoriler.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | ölçülmedi | ölçülmedi | OLCULMEDI |
| `src/components/__tests__/SearchOverlayKesintisiz.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 3430 | ölçülmedi | OLCULMEDI |
| `src/components/__tests__/SearchOverlayTekListe.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 2017 | ölçülmedi | OLCULMEDI |
| `src/components/__tests__/SearchOverlayYedekCip.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 556 | ölçülmedi | OLCULMEDI |
| `src/components/__tests__/aramaOnHazirlik.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 138 | ölçülmedi | OLCULMEDI |
| `src/components/__tests__/dilSeciciKirilim.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 3 | ölçülmedi | OLCULMEDI |
| `src/components/__tests__/yuzenDugmeKatmani.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 3 | statik (1) | OLCULMEDI |
| `src/components/admin/__tests__/AdminRealtimeNotifications.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 411 | ölçülmedi | OLCULMEDI |
| `src/components/admin/__tests__/AdminToolbar.persist.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 1269 | ölçülmedi | OLCULMEDI |
| `src/components/admin/__tests__/CommandPalette.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 815 | ölçülmedi | OLCULMEDI |
| `src/components/admin/__tests__/DateRangePicker.behavior.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 954 | ölçülmedi | OLCULMEDI |
| `src/components/admin/categories/__tests__/CategoryFormModal.fieldErrors.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 451 | ölçülmedi | OLCULMEDI |
| `src/components/admin/orders/__tests__/OrderFormModal.fieldErrors.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 472 | ölçülmedi | OLCULMEDI |
| `src/components/admin/overlay/__tests__/ConfirmProvider.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 964 | ölçülmedi | OLCULMEDI |
| `src/components/admin/pricing/__tests__/PricingRuleFormModal.fieldErrors.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 421 | ölçülmedi | OLCULMEDI |
| `src/components/admin/pricing/__tests__/PricingRuleFormModal.uniqueViolation.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 368 | ölçülmedi | OLCULMEDI |
| `src/components/admin/pricing/__tests__/PricingSettingsFormModal.fieldErrors.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 298 | ölçülmedi | OLCULMEDI |
| `src/components/admin/products/__tests__/ProductFormModal.alisFiyati.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 300 | ölçülmedi | OLCULMEDI |
| `src/components/admin/settings/__tests__/SettingsFormModal.fieldErrors.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 382 | ölçülmedi | OLCULMEDI |
| `src/components/admin/shell/__tests__/useAdminThemeBodyScope.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 247 | statik (1) | OLCULMEDI |
| `src/components/category/SilentFanWizard.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 478 | ölçülmedi | OLCULMEDI |
| `src/components/category/__tests__/showcaseOluSlug.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 3 | ölçülmedi | OLCULMEDI |
| `src/components/category/sections/HowItWorks.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 600 | ölçülmedi | OLCULMEDI |
| `src/components/home/__tests__/AnimationPerformance.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 144 | ölçülmedi | OLCULMEDI |
| `src/components/home/__tests__/ApplicationSolutionsAdres.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 95 | ölçülmedi | OLCULMEDI |
| `src/components/home/__tests__/HomeSinevizyonLCP.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 152 | ölçülmedi | OLCULMEDI |
| `src/components/products/__tests__/AileKirintisi.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 17 | ölçülmedi | OLCULMEDI |
| `src/components/products/__tests__/ProductsHero.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 184 | ölçülmedi | OLCULMEDI |
| `src/components/products/__tests__/VariantSelector.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 329 | ölçülmedi | OLCULMEDI |
| `src/components/ui/__tests__/VentImage.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | ölçülmedi | ölçülmedi | OLCULMEDI |
| `src/config/__tests__/siteUrl.test.ts` | birim | 0 | ölçülmedi | supheli | 8 | ölçülmedi | OLCULMEDI |
| `src/config/__tests__/yayindaModeller.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 19 | ölçülmedi | OLCULMEDI |
| `src/data/__tests__/markaKaynagi.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 56 | statik (1) | OLCULMEDI |
| `src/design-system/__tests__/ds-takma-adlari-faz-2a.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 24 | ölçülmedi | OLCULMEDI |
| `src/hooks/__tests__/use-mobile.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 23 | ölçülmedi | OLCULMEDI |
| `src/hooks/__tests__/useAdminTable.sortMode.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 265 | ölçülmedi | OLCULMEDI |
| `src/hooks/__tests__/useAdminTable.urlSync.test.ts` | birim | 1 | ölçülmedi | bagimsiz | 2543 | ölçülmedi | OLCULMEDI |
| `src/hooks/__tests__/useApiCall.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 28 | ölçülmedi | OLCULMEDI |
| `src/hooks/__tests__/useCalculatorUsage.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 37 | ölçülmedi | OLCULMEDI |
| `src/hooks/__tests__/useCartHook.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 25 | ölçülmedi | OLCULMEDI |
| `src/hooks/__tests__/useHideOnScroll.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 26 | ölçülmedi | OLCULMEDI |
| `src/hooks/__tests__/useIsMounted.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 17 | ölçülmedi | OLCULMEDI |
| `src/hooks/__tests__/useLocalizedRoutes.test.tsx` | birim | 1 | ölçülmedi | bagimsiz | 34 | ölçülmedi | OLCULMEDI |
| `src/hooks/__tests__/useNavigationState.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 31 | ölçülmedi | OLCULMEDI |
| `src/hooks/__tests__/useRole.effect-stability.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 19 | ölçülmedi | OLCULMEDI |
| `src/hooks/__tests__/useRole.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 32 | ölçülmedi | OLCULMEDI |
| `src/i18n/__tests__/admin-sozlugu-gec-yuklenir.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 424 | ölçülmedi | OLCULMEDI |
| `src/i18n/__tests__/admin-sozlugu-vitrin-dosyasinda-kullanilmaz.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 252 | ölçülmedi | OLCULMEDI |
| `src/i18n/__tests__/admin-sozlugu-vitrin-paketine-girmez.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 26 | statik (1) | OLCULMEDI |
| `src/i18n/__tests__/case.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 9 | statik (1) | OLCULMEDI |
| `src/i18n/__tests__/i18n.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 25 | ölçülmedi | OLCULMEDI |
| `src/i18n/__tests__/sort.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 5 | statik (1) | OLCULMEDI |
| `src/i18n/__tests__/sozluk-rsc-yukune-gecmez.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 47 | statik (3) | OLCULMEDI |
| `src/lib/__tests__/audit.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 10 | ölçülmedi | OLCULMEDI |
| `src/lib/__tests__/cart.service.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 8 | ölçülmedi | OLCULMEDI |
| `src/lib/__tests__/diSignature.test.ts` | birim | 7 | ölçülmedi | bagimsiz | 180 | statik (1) | OLCULMEDI |
| `src/lib/__tests__/ensureSessionFresh.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 10 | ölçülmedi | OLCULMEDI |
| `src/lib/__tests__/errorReporter.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 518 | ölçülmedi | OLCULMEDI |
| `src/lib/__tests__/hvacCalculations.pressure.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 5 | ölçülmedi | OLCULMEDI |
| `src/lib/__tests__/hvacCalculations.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 8 | ölçülmedi | OLCULMEDI |
| `src/lib/__tests__/order.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 19 | ölçülmedi | OLCULMEDI |
| `src/lib/__tests__/orderStatusService.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 17 | ölçülmedi | OLCULMEDI |
| `src/lib/__tests__/pdfAssets.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 3 | ölçülmedi | OLCULMEDI |
| `src/lib/__tests__/pdfGeneratorFallback.test.ts` | birim | 0 | ölçülmedi | supheli | 12 | ölçülmedi | OLCULMEDI |
| `src/lib/__tests__/rbac.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 7 | ölçülmedi | OLCULMEDI |
| `src/lib/__tests__/type-converters.test.ts` | birim | 1 | ölçülmedi | bagimsiz | 6 | ölçülmedi | OLCULMEDI |
| `src/lib/__tests__/utils.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 4 | ölçülmedi | OLCULMEDI |
| `src/lib/admin/__tests__/csvProductMapping.fiyat.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 5 | ölçülmedi | OLCULMEDI |
| `src/lib/admin/__tests__/mutateWithAudit.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 11 | ölçülmedi | OLCULMEDI |
| `src/lib/admin/__tests__/statusMachines.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 9 | ölçülmedi | OLCULMEDI |
| `src/lib/adres/__tests__/bayrak-kapisi.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 5 | statik (4) | OLCULMEDI |
| `src/lib/adres/__tests__/envanter.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 41 | ölçülmedi | OLCULMEDI |
| `src/lib/adres/__tests__/eslestirici.test.ts` | birim | 0 | ölçülmedi | supheli | 21 | ölçülmedi | OLCULMEDI |
| `src/lib/adres/__tests__/eslestiriciYayinda.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 11 | ölçülmedi | OLCULMEDI |
| `src/lib/adres/__tests__/faz1b-aile-tek-sicrama.test.ts` | birim | 0 | ölçülmedi | bagimsiz | ölçülmedi | ölçülmedi | OLCULMEDI |
| `src/lib/adres/__tests__/haritaUret.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 7085 | statik (1) | OLCULMEDI |
| `src/lib/adres/__tests__/kategori-ad-sozluk-migration-uyumu.test.ts` | birim | 0 | ölçülmedi | bagimsiz | ölçülmedi | statik (1) | OLCULMEDI |
| `src/lib/adres/__tests__/korozyon-tek-sicrama.test.ts` | birim | 0 | ölçülmedi | bagimsiz | ölçülmedi | ölçülmedi | OLCULMEDI |
| `src/lib/adres/__tests__/middleware-bayrak-acik.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 18 | ölçülmedi | OLCULMEDI |
| `src/lib/adres/__tests__/middleware-bayrak-kapali.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 17 | statik (1) | OLCULMEDI |
| `src/lib/adres/__tests__/middleware-rota-dili-acik.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 367 | ölçülmedi | OLCULMEDI |
| `src/lib/adres/__tests__/middleware-rota-dili-kapali.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 214 | ölçülmedi | OLCULMEDI |
| `src/lib/adres/__tests__/middleware-rota-dili-zincir.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 2139 | ölçülmedi | OLCULMEDI |
| `src/lib/adres/__tests__/middleware-uuid.acik.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 129 | statik (1) | OLCULMEDI |
| `src/lib/adres/__tests__/middleware-uuid.kapali.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 24 | ölçülmedi | OLCULMEDI |
| `src/lib/adres/__tests__/perde-ailesi-ad-adres-uyumu.test.ts` | birim | 0 | ölçülmedi | bagimsiz | ölçülmedi | statik (2) | OLCULMEDI |
| `src/lib/adres/__tests__/rotaDili.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 31 | statik (1) | OLCULMEDI |
| `src/lib/adres/__tests__/rotaDiliCekirdek.test.ts` | birim | 0 | ölçülmedi | supheli | 31 | ölçülmedi | OLCULMEDI |
| `src/lib/adres/__tests__/tazelemeYollari.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 7 | ölçülmedi | OLCULMEDI |
| `src/lib/adres/__tests__/tohum.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 7 | statik (1) | OLCULMEDI |
| `src/lib/adres/__tests__/yayindaModelYollari.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 9 | ölçülmedi | OLCULMEDI |
| `src/lib/bilgiMerkezi/__tests__/bosDurum.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 284 | ölçülmedi | OLCULMEDI |
| `src/lib/bilgiMerkezi/__tests__/icBaglanti.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 18 | ölçülmedi | OLCULMEDI |
| `src/lib/bilgiMerkezi/__tests__/icerik.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 19 | ölçülmedi | OLCULMEDI |
| `src/lib/bilgiMerkezi/__tests__/markdown.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 10 | ölçülmedi | OLCULMEDI |
| `src/lib/bilgiMerkezi/__tests__/tersDizin.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 30 | ölçülmedi | OLCULMEDI |
| `src/lib/bilgiMerkezi/__tests__/ustVeriHarita.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 7 | statik (1) | OLCULMEDI |
| `src/lib/bilgiMerkezi/__tests__/yonlendirmeler.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 12 | statik (1) | OLCULMEDI |
| `src/lib/data/__tests__/csvImportGuard.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 5 | ölçülmedi | OLCULMEDI |
| `src/lib/data/__tests__/eskiKategoriHedefi.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 6 | ölçülmedi | OLCULMEDI |
| `src/lib/data/__tests__/eskiTrUrunAdresi.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 12 | ölçülmedi | OLCULMEDI |
| `src/lib/data/__tests__/kategoriSegmenti.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 22 | ölçülmedi | OLCULMEDI |
| `src/lib/data/__tests__/productRoute.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 12 | ölçülmedi | OLCULMEDI |
| `src/lib/data/__tests__/selectVariant.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 4 | ölçülmedi | OLCULMEDI |
| `src/lib/data/__tests__/urunSegmenti.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 11 | ölçülmedi | OLCULMEDI |
| `src/lib/data/__tests__/urunSegmentiYayinda.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 15 | ölçülmedi | OLCULMEDI |
| `src/lib/hvac/__tests__/ductFanSelection.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 13 | ölçülmedi | OLCULMEDI |
| `src/lib/hvac/__tests__/ductPressure.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 7 | ölçülmedi | OLCULMEDI |
| `src/lib/kip/__tests__/satisKipi.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 26 | ölçülmedi | OLCULMEDI |
| `src/lib/purchasing/__tests__/poStatusMachine.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 6 | ölçülmedi | OLCULMEDI |
| `src/lib/seo/__tests__/aciklamaKirp.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 10 | ölçülmedi | OLCULMEDI |
| `src/lib/seo/__tests__/enYayinHreflangNoindex.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 1620 | ölçülmedi | OLCULMEDI |
| `src/lib/seo/__tests__/gorselVar.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 336 | statik (1) | OLCULMEDI |
| `src/lib/seo/__tests__/indexnow-middleware.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 9 | ölçülmedi | OLCULMEDI |
| `src/lib/seo/__tests__/indexnow.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 23 | statik (1) | OLCULMEDI |
| `src/lib/seo/__tests__/indexnowBetikKapisi.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 92 | statik (2) | OLCULMEDI |
| `src/lib/seo/__tests__/indexnowSuzgec.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 1122 | statik (1) | OLCULMEDI |
| `src/lib/seo/__tests__/jsonld.breadcrumb.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 9 | ölçülmedi | OLCULMEDI |
| `src/lib/seo/__tests__/jsonld.test.ts` | birim | 1 | ölçülmedi | bagimsiz | 12 | ölçülmedi | OLCULMEDI |
| `src/lib/seo/__tests__/kirinti.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 9 | statik (1) | OLCULMEDI |
| `src/lib/seo/__tests__/markaUrunDurumu.test.ts` | birim | 0 | ölçülmedi | bagimsiz | ölçülmedi | ölçülmedi | OLCULMEDI |
| `src/lib/seo/__tests__/ovguAyikla.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 10 | statik (1) | OLCULMEDI |
| `src/lib/services/__tests__/adminQuoteService.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 35 | ölçülmedi | OLCULMEDI |
| `src/lib/services/__tests__/category.service.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 9 | ölçülmedi | OLCULMEDI |
| `src/lib/services/__tests__/displayPrice.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 29 | ölçülmedi | OLCULMEDI |
| `src/lib/services/__tests__/family.service.detail-category.test.ts` | birim | 1 | ölçülmedi | bagimsiz | 32 | ölçülmedi | OLCULMEDI |
| `src/lib/services/__tests__/family.service.slugs.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 46 | ölçülmedi | OLCULMEDI |
| `src/lib/services/__tests__/family.service.vitrin-sozlesmesi.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 20 | ölçülmedi | OLCULMEDI |
| `src/lib/services/__tests__/familyRpcEszamanlilik.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 567 | ölçülmedi | OLCULMEDI |
| `src/lib/services/__tests__/fxLockAdmin.service.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 7 | ölçülmedi | OLCULMEDI |
| `src/lib/services/__tests__/orderInvoice.service.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 10 | ölçülmedi | OLCULMEDI |
| `src/lib/services/__tests__/pricing.resolve.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 32 | ölçülmedi | OLCULMEDI |
| `src/lib/services/__tests__/pricingAdmin.service.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 79 | ölçülmedi | OLCULMEDI |
| `src/lib/services/__tests__/pricingMaterialize.test.ts` | birim | 2 | ölçülmedi | bagimsiz | 125 | ölçülmedi | OLCULMEDI |
| `src/lib/services/__tests__/pricingProductPrice.service.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 126 | ölçülmedi | OLCULMEDI |
| `src/lib/services/__tests__/vitrin-maliyet-kolonu.test.ts` | birim | 0 | ölçülmedi | supheli | 303 | ölçülmedi | OLCULMEDI |
| `src/lib/validation/__tests__/invoiceIdentity.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 6 | ölçülmedi | OLCULMEDI |
| `src/lib/validation/__tests__/taxIdentity.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 4 | ölçülmedi | OLCULMEDI |
| `src/test/dil-dususu-yok.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 308 | ölçülmedi | OLCULMEDI |
| `src/test/dil-tespiti.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 5 | statik (1) | OLCULMEDI |
| `src/test/eposta-sessiz-dusus-yok.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 33 | statik (1) | OLCULMEDI |
| `src/utils/__tests__/3dModelOffsets.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 4 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/adminQueryFilters.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 5 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/adminShipping.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 13 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/adresUret.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 9 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/adresUretYayindaModel.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 14 | statik (1) | OLCULMEDI |
| `src/utils/__tests__/analytics.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 12 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/applicationLinks.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 5 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/applicationUi.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 45 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/breadcrumbUtils.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 5 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/categoryHelpers.test.ts` | birim | 1 | ölçülmedi | bagimsiz | 10 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/checkoutHelpers.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 6 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/crypto.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 7 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/csvHucre.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 8 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/engineeringIntelligence.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 8 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/getCategoryIcon.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 66 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/imageNormalization.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 8 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/imageUtils.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 132 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/kategoriArgumanlari.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 7 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/modelBaglantiAdresi.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 5 | statik (1) | OLCULMEDI |
| `src/utils/__tests__/orderStatusDisplay.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 7 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/passwordSecurity.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 15 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/prefetch.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 8 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/productHelpers.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 6 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/routes.test.ts` | birim | 1 | ölçülmedi | bagimsiz | 13 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/searchHighlight.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 49 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/specLabel.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 6 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/type-converters.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 5 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/whatsapp.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 9 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/yuzeyAdresleri.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 28 | ölçülmedi | OLCULMEDI |
| `src/utils/__tests__/yuzeyAdresleriK3b.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 37 | ölçülmedi | OLCULMEDI |
| `src/views/__tests__/BrandDetailPage.urunsuz.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | ölçülmedi | ölçülmedi | OLCULMEDI |
| `src/views/__tests__/NotFoundView.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 275 | ölçülmedi | OLCULMEDI |
| `src/views/__tests__/OrdersPage.test.tsx` | birim | 0 | ölçülmedi | supheli | 0 | ölçülmedi | OLCULMEDI |
| `src/views/__tests__/PaymentSuccessReview.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 263 | ölçülmedi | OLCULMEDI |
| `src/views/__tests__/ProductsDiscoveryView.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 56 | ölçülmedi | OLCULMEDI |
| `src/views/account/__tests__/AccountSecurityPage.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 3930 | ölçülmedi | OLCULMEDI |
| `src/views/account/__tests__/OrderDetailPageModelKodu.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 1113 | ölçülmedi | OLCULMEDI |
| `src/views/account/__tests__/OrderDetailPageTabs.test.tsx` | birim | 0 | ölçülmedi | supheli | 0 | ölçülmedi | OLCULMEDI |
| `src/views/account/__tests__/ReturnsModalClose.test.tsx` | birim | 0 | ölçülmedi | supheli | 99 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/AdminAuditLogPage.integration.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 703 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/AdminCategoriesPage.integration.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 657 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/AdminCouponsPage.integration.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 879 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/AdminErrorGroupsPage.integration.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 724 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/AdminErrorsPage.integration.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 602 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/AdminInventoryPage.integration.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 1390 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/AdminLogisticsTableBody.sharedTracking.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 994 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/AdminMovementsPage.integration.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 815 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/AdminOrdersBoard.detailPanel.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 812 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/AdminOrdersBoard.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 5 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/AdminOrdersPage.integration.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 1113 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/AdminProductsPage.integration.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 1130 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 736 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/AdminUsersPage.integration.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 970 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/OrdersTableBody.bulkShipping.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 6856 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/OrdersTableBody.overlay.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 2409 | ölçülmedi | OLCULMEDI |
| `src/views/admin/__tests__/OrdersTableBody.sharedTracking.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 4526 | ölçülmedi | OLCULMEDI |
| `src/views/category/__tests__/CategoryLandingSessizFan.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | ölçülmedi | ölçülmedi | OLCULMEDI |
| `src/views/category/__tests__/SeriesLandingView.test.tsx` | birim | 1 | ölçülmedi | bagimsiz | 383 | ölçülmedi | OLCULMEDI |
| `src/views/checkout/__tests__/ReviewSummary.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 56 | ölçülmedi | OLCULMEDI |
| `src/views/checkout/__tests__/buildPaymentRequest.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 4 | ölçülmedi | OLCULMEDI |
| `src/views/checkout/__tests__/injectCheckoutForm.test.ts` | birim | 0 | ölçülmedi | bagimsiz | 226 | ölçülmedi | OLCULMEDI |
| `src/views/knowledge/__tests__/rehberGovdesiKirilma.test.tsx` | birim | 0 | ölçülmedi | bagimsiz | 73 | ölçülmedi | OLCULMEDI |
| `supabase/functions/_shared/__tests__/config_audit.test.ts` | edge | 0 | ölçülmedi | supheli | 7 | ölçülmedi | OLCULMEDI |
| `supabase/functions/_shared/__tests__/db_saglik.test.ts` | edge | 0 | ölçülmedi | supheli | 53 | ölçülmedi | OLCULMEDI |
| `supabase/functions/_shared/__tests__/odeme_eslesme.test.ts` | edge | 0 | ölçülmedi | bagimsiz | 25 | statik (3) | OLCULMEDI |
| `supabase/functions/_shared/__tests__/origins.test.ts` | edge | 0 | ölçülmedi | supheli | 7 | ölçülmedi | OLCULMEDI |
| `supabase/functions/_shared/__tests__/satis_kipi.test.ts` | edge | 0 | ölçülmedi | supheli | 282 | ölçülmedi | OLCULMEDI |
| `supabase/functions/_shared/__tests__/tenant.test.ts` | edge | 0 | ölçülmedi | bagimsiz | 6 | statik (1) | OLCULMEDI |
| `supabase/functions/_shared/__tests__/tum_satirlar.test.ts` | edge | 0 | ölçülmedi | bagimsiz | 9 | ölçülmedi | OLCULMEDI |
| `tests/e2e/adversarial.test.ts` | e2e | 3 | ölçülmedi | supheli | 174 | ölçülmedi | OLCULMEDI |
| `tests/e2e/auth.test.ts` | e2e | 1 | ölçülmedi | supheli | 24 | ölçülmedi | OLCULMEDI |
| `tests/e2e/cache.test.ts` | e2e | 0 | ölçülmedi | supheli | 32 | ölçülmedi | OLCULMEDI |
| `tests/e2e/challenger_security.test.ts` | e2e | 0 | ölçülmedi | supheli | 11 | ölçülmedi | OLCULMEDI |
| `tests/e2e/empirical_db.test.ts` | e2e | 4 | ölçülmedi | supheli | ölçülmedi | ölçülmedi | OLCULMEDI |
| `tests/e2e/empirical_db_audit_2.test.ts` | e2e | 4 | ölçülmedi | supheli | ölçülmedi | ölçülmedi | OLCULMEDI |
| `tests/e2e/empirical_db_subset.test.ts` | e2e | 4 | ölçülmedi | supheli | ölçülmedi | ölçülmedi | OLCULMEDI |
| `tests/e2e/empirical_rls_audit.test.ts` | e2e | 4 | ölçülmedi | supheli | ölçülmedi | ölçülmedi | OLCULMEDI |
| `tests/e2e/empirical_rls_status.test.ts` | e2e | 4 | ölçülmedi | supheli | ölçülmedi | ölçülmedi | OLCULMEDI |
| `tests/e2e/features.test.ts` | e2e | 0 | ölçülmedi | bagimsiz | 9 | ölçülmedi | OLCULMEDI |
| `tests/e2e/helpers/sanity.test.ts` | e2e | 0 | ölçülmedi | supheli | 46 | ölçülmedi | OLCULMEDI |
| `tests/e2e/isolation.test.ts` | e2e | 0 | ölçülmedi | supheli | 8 | ölçülmedi | OLCULMEDI |
| `tests/e2e/pairwise.test.ts` | e2e | 0 | ölçülmedi | supheli | 9 | ölçülmedi | OLCULMEDI |
| `tests/e2e/realtimeSecurity.test.ts` | e2e | 0 | ölçülmedi | supheli | 7 | ölçülmedi | OLCULMEDI |
| `tests/e2e/resolution.test.ts` | e2e | 0 | ölçülmedi | supheli | 9 | ölçülmedi | OLCULMEDI |
| `tests/e2e/scenarios.test.ts` | e2e | 1 | ölçülmedi | supheli | 47 | ölçülmedi | OLCULMEDI |
| `tests/e2e/webhooks.test.ts` | e2e | 0 | ölçülmedi | supheli | 49 | ölçülmedi | OLCULMEDI |
| `tests/smoke/ssr-html.spec.ts` | smoke | 0 | ölçülmedi | supheli | ölçülmedi | statik (1) | OLCULMEDI |

