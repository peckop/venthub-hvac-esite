# Tasarım → Kod Planı v2.2 (2026-10-05, TASARIM) — TASLAK

> **DURUM: TASLAK — ONAYSIZ, UYGULANMAZ.** Bu belge `tasarim-kod-plani-v2.1-2026-10-05.md` planının yerine geçer; v2 ve v2.1 tarihçedir.
> **Hedef değişti:** v2.1 "11 Ekim'e yalnız Faz 2a" diyordu. Karar 271 (Recep 10-03; kaynak: OPS aktarımı "OPS geçmiş EK #42ca-cb", bu oturumda
> **DOĞRUDAN OKUNMADI**) 11 Ekim'i **TAM KAPSAM** yaptı: adres + YENİ GÖRÜNÜM (Design prototipi: Vitrin 15A / Menü v18), paralel ajanlarla; görünüm ve adres
> **AYRI anahtarla** açılır; 9-10 Ekim yerel önizlemede görünüm hazır değilse adres dilimi tek başına çıkar. Recep 10-05: "prototip hayata geçirilecek yapıyı
> temsil ediyor."
> **Bu belge v2.1'in ölçülmüş olgularını ve düzeltmelerini TEKRAR ETMEZ**; "v2.1 §x" diye atıf verir, yalnız değişeni yazar. Yalnız belgedir: kod, token, Tailwind,
> `index.css`, test dosyalarına dokunulmadı. Migration yok.

**KAYNAK / CETVEL:** v2.1'dekiler (marka-token-eslemesi, storefront-design, adres-semasi, CLAUDE.md 8/10/14, Kararlar 15A) + `execution-method-standard.md` (§2 karar
tablosu, §4 şerit sınırları, §10 müdür modeli) + `collaboration-protocol.md` (K0 worktree, §1 bir-iş-bir-dal, §8.1 ara push yasak) + `docs/roller/*.md` (şerit
dosya alanları) + `docs/audits/tasarim-envanteri-2026-09-25*.md` (52 kare / 33 HAZIR / 19 YARIM) + `src/config/features.ts` + karar 271 · 285.
**YÖNTEM:** §3.5. Plan = elle + bağımsız doğrulama (v2.1, PR #1700'de doğrulayıcı hükmüyle düzeltildi: commit `228ace497`); bu belge de doğrulayıcıya gidecek.

---

## 0 · v2.2 değişiklik özeti

1. **Üç anahtar** (§1): adres (`ADRES_SEMASI_K3B`, mevcut), kabuk (`YENI_KABUK_GEZINMESI`, mevcut), görünüm (`YENI_GORUNUM`, YENİ) + paket başına alt bayrak.
2. **Takvim 5–11 Ekim gün gün** (§2): 6 Salı plan onayı + kapı + token/font; 7-8 paketler; 9 yerel önizleme kabulü; 10 düzeltme; 11 Pazar yayın (adres önce, görünüm sonra).
3. **Ekran işi paketlere bölündü** (§3): 52 kare + G(9) + H(6) → 19 satırlık paket tablosu (10 ekran + 3 tasarım sistemi + 6 tek-sahip/destek); her pakete departman, dosya alanı, bayrak; çakışmasızlık depoya karşı **ölçüldü** (0 çakışma).
4. **9 Ekim kabul ölçütü** (§4): 14 ölçüm maddesi + Recep gözü; hangisi otomatik, hangisi insan.
5. **Yetişmezse düşen dilim** (§5): düşme sırası, "düştü" etkisi, Ops'un 9 Ekim akşamı karar kuralı.
6. **Gerçekçilik** (§6): 5 günde 33+19 karenin koda çevrilmesinin riskleri.

**v2.1'e göre değişen kararlar:**

| Konu | v2.1 | v2.2 | Gerekçe |
|---|---|---|---|
| §4 soru 1 (K36 kabuk) | Recep'e gidecek, öneri "EVET, kayıt yazım izni" | **Recep'e GİTMEZ — "karar 271 ile kararlı"** (kabuk anahtar arkasında yazılır) | Ops onayı 10-05; 271 kapsıyor |
| §4 soru 2 (hangi faz 11 Ekim'e) | Öneri: yalnız 2a | **Kararlı: TAM KAPSAM (271).** v2.1 §4 önerisi (yalnız 2a) geçersiz | Karar 271 |
| Galeri rotası çıkarımı, `token-turet.mjs` çıkarımı, `ds/` yolu | Ops'a bildirilecekti | **ONAYLI** (Ops 10-05) | — |
| ALTYAPI kapı emri (INV-PALET-1 4. kol) | "Ops'a talep" | Emri **Ops açar**; PR Salı sabah (§2) | — |
| Faz 2b görünüm dönüşü | Tek PR, değer doğrudan `:root`'ta çevrilir, Recep "olur" | **Anahtar arkasında:** `:root[data-gorunum='yeni']` kapsamlı üzerine yazma; "olur" = 9 Ekim yerel önizleme hükmü (§1.2) | Anahtar kapalıyken canlıda fark 0 şartı |
| Admin (v2.1 §2.3 öneri A: dahil) | A | **11 Ekim için B: dondur** (§1.4) | Prototip vitrindir; admin 11 Ekim'in kapsamı değil, risk azaltır |
| Uzun metin ölçüsü | Design cevabı bekleniyordu | Kapandı (v2.1 §1.2, düzeltme commit'i `228ace497`) | — |
| Faz 4(2) "adres yayınından sonra" | Ayrı yayın | **Aynı gün, ayrı anahtar, ayrı deploy, adres önce** (§5.3) | 271 + karar 118 birlikte |

---

## 1 · Anahtarlar ve "anahtar kapalı = canlıda fark 0"

### 1.1 Anahtar kümesi

| Anahtar | Yeri | Durum | Yönettiği | Açan |
|---|---|---|---|---|
| `ADRES_SEMASI_K3B` | `src/config/features.ts:130` | `false` (10-05 ölçüldü) | Adres şeması (REC-300/442; URUN/ALTYAPI) | Ops (açılış PR'ı) |
| `YENI_KABUK_GEZINMESI` | `src/config/features.ts:58` | `false`; 3 kilit testi `= false` bekliyor | Mobil alt sekme çubuğu + header "Teklif" paneli, **birlikte** | Ops |
| `YENI_GORUNUM` | `src/config/features.ts` (tek satır, **YENİ**) | yok → `false` doğar | Token/font/DS bileşen görünümünün tümü | Ops |
| Paket alt bayrakları | `src/config/gorunum/<paket>.ts` (YENİ, paket başına bir dosya) | `false` doğar | O paketin yeni yerleşimi | Ops (açılış PR'ı) |

Yeni görünüm = `YENI_GORUNUM && <PAKET>_GORUNUM`. Bayraklar **derleme sabitidir** (mevcut desen: `features.ts` gerekçesi: `NEXT_PUBLIC_` unutulursa sessizce kapalı kalır).
**Bayrak okuma doğrudan sabitle yazılır** (`if (YENI_GORUNUM && ANA_GORUNUM)`), fonksiyon sarmalayıcıyla değil; amaç derleyicinin ölü dalı atmasıdır.
Bunun yeni bileşen kodunu kapalıyken paketten gerçekten çıkardığı **ÖLÇÜLMEDİ** → Salı spike'ı (§2, S3).

### 1.2 Görünüm anahtarının mekanizması (v2.1 Faz 2b'nin değişen biçimi)

- **Renk:** `index.css` `:root` değerleri **değişmez**. Çevirme `:root[data-gorunum='yeni'] { --primary-navy: var(--marka-lacivert); --brand-cyan: var(--marka-turkuaz); … }`
  kapsamında yazılır; `data-gorunum` özniteliğini kök `layout.tsx` yalnız `YENI_GORUNUM` açıkken basar. Üzerine yazma değerleri **`var(--marka-*)` takma adıdır, literal değil**
  → yeni renk kaynağı açılmaz (cetvel §2; v2.1 §2.1 takma ad ilkesi).
- **Sonuç (v2.1'den fark):** çakışan küme (v2.1 §2.2) 11 Ekim'de **boşalmaz**; `INV-TOKEN-PARITE-1`'in küme listesi açılıştan SONRA, eski değerleri silen temizlik PR'ıyla boşalır
  (§2, "11 Ekim sonrası"). Kapıya "küme yalnız `data-gorunum` kapsamlı üzerine yazmayla çözülüyor" kolu yazılır (ALTYAPI).
- **Yazı tipi:** `layout.tsx` üç yeni aileyi (v2.1 §2.5 Faz 2b: değişken eksen, `latin-ext`, serif/mono `preload: false`) tanımlar; `body` sınıfı bayrağa göre **Inter ya da yeni aile**.
  **Bayrak kapalıyken yeni font baytı/`preload` bağlantısı çıkmıyor mu — ÖLÇÜLMEDİ** (Salı spike S1; `next/font` modül kapsamında çağrıldığında önyükleme davranışı belgeden doğrulanmadı).
- **Tuzak (yazılı olsun):** Tailwind `fontFamily.mono/serif` bağlanırken `var(--font-mono)` tanımsızsa `font-family: var(--font-mono), …` bildirimi geçersiz sayılıp özelliği sıfırlar;
  bu yüzden `var(--font-mono, <Tailwind varsayılan mono yığını>)` biçimi kullanılır ki kapalıyken `font-mono` (68 kullanım, v2.1 §2.3) **aynen eski yığını** versin. Kapalıyken
  `font-mono` computed `font-family` eşitliği **ölçülmedi** (S1 ile birlikte).

### 1.3 "Anahtar kapalı = canlıda fark 0" — tanım ve ölçüm

**Tanım:** ziyaretçinin gördüğü fark 0. Dosya baytı özdeş olmak **zorunda değil** (yeni bileşen CSS/JS'i pakete girebilir; bunun boyutu ayrıca bütçelenir, §4 M8).
**İki ölçüm, ikisi de gerekli:**
1. **Statik:** paketin `git diff --numstat origin/master...HEAD` çıktısında, **zaten var olan** dosyalarda **silinen satır = 0**; mevcut dosyaya yalnız seçim satırı + import eklenir
   (`if (YENI_GORUNUM && X_GORUNUM) return <Yeni/>`), eski gövde dokunulmaz; yeni kod yeni dosyadadır. Komut PR raporuna sayı olarak yazılır. Kalıcı kapı önerisi `INV-GORUNUM-KAPALI-1`
   (ALTYAPI: yeni görünüm dizinlerine yalnız bayrak seçim satırından import edilebilir) — kapı adı ve kapsamı **öneri**, ALTYAPI belirler.
2. **Dinamik:** tüm bayraklar `false` iken altı sayfada (ana, kategori, liste, ürün, Bilgi Merkezi, sepet/teklif) × {390, 1280} genişlikte normalize sunucu HTML'i (build kimlikleri ve hash'li adresler
   ayıklanır) ve computed-style dökümü **master ile karşılaştırılır; fark 0**. Araç `e2e/gorunum/**` altında (OLCUM). Bu araç **henüz yok**; Salı yazılır ve kendi doğruluğu için
   bilerek-fark enstrümanı taşır (mevcut `e2e/reflow.e2e.ts` deseni: araç kasıtlı bir farkı GÖREMEZSE kırmızı yanar — ölçülemedi ≠ geçti).

### 1.4 Admin (v2.1 §2.3'ü değiştirir): 11 Ekim için DONDUR

Gerekçe: Design prototipi vitrindir (Vitrin 15A / Menü v18); admin 11 Ekim hedefinde yok. Admin'i dahil etmek 19 `primary-navy` + 63 `font-mono` kullanımını (v2.1 §2.3, sabit yöntemle ölçüldü)
**ek bir QA yüzeyi** yapar ve ADMIN kapılarını (INV-ADMIN-THEME-1..5) 11 Ekim yükünün altına sokar. **Mekanizma (v2.1 §2.3 seçenek B):** `[data-admin-theme]` kapsamında
`--primary-navy`, `--brand-cyan`, `--font-sans` eski değerlere sabitlenir; Inter admin yerleşiminde yüklenir (`src/app/admin/layout.tsx`, ADMIN'in dosyası → emir ADMIN müdürüne gider).
Bedel: Inter admin için yüklenir (vitrinde "Inter 0" ölçütü vitrin köküyle sınırlı kalır, v2.1 §2.5'teki istisna listesine "admin yerleşimi" eklenir) ve açılıştan sonra admin'in DS'e geçişi ayrı ADMIN kararı olur.
**Bilinmeyen (ÖLÇÜLMEDİ):** portal ile gövdeye basılan admin diyalog/toast'ların (kök `body`) yeni fontu alıp almadığı; Salı spike S2 ölçer. **Karar sahibi ADMIN şeridi** (Ops taşır); Salı 12:00'ye kadar karar yoksa
varsayılan **dondur** uygulanır (bu belgedeki varsayım).

---

## 2 · (a) Takvim — 5–11 Ekim (bugün 5 Ekim Pazartesi)

**Süre etiketi:** depoda ölçülmüş ajan verimi/PR hızı **yok**; tablodaki süreler **tahmin**dir ve Ops'un verdiği tarih çerçevesinden (11 Ekim) geriye dağıtılmıştır. Hiçbiri taahhüt değildir.
Dal öneki departmandır (`tasarim/*`, `urun/*`, `satis/*`, `i18n/*`, `altyapi/*`); K-1 komutu yalnız `tasarim/*` için (v2.1 §3). Her push bir Vercel dağıtım kaydıdır
(collaboration-protocol §8.1): ara push yok, push yalnız PR açılırken/güncellenirken.

| Gün | Ne biter | Kim | Ölçü (kanıt) | Süre |
|---|---|---|---|---|
| **5 Pzt** (bugün) | (1) v2.2 yazıldı → doğrulayıcı → Ops. (2) **Design'a soru dosyası** (§6.3: 7 soru) TASARIM hazırlar, OPS gönderir. (3) ALTYAPI kapı emri (INV-PALET-1 4. kol, v2.1 §2.1) Ops açar. (4) Paket kartları + `YÖNTEM:` satırı + claim'ler (§3.2 tablosundaki globlar) Ops açar. (5) ADMIN'e dondurma sorusu (Ops) | TASARIM, Ops | Doğrulayıcı hükmü; açılan kart sayısı = paket sayısı (§3.2'de 19 satır); claim tablosu `board.cjs who` ile ölçülür | akşam |
| **6 Sal** | **Sabah:** Ops plan onayı. **ALTYAPI:** INV-PALET-1 4. kol PR'ı (sabotaj (a)–(d), v2.1 §2.1) → öğleye merge; `INV-GORUNUM-KAPALI-1` + anahtar matrisi iskeleti (§5.2). **TASARIM (TOK):** Faz 2a PR'ı (v2.1 §2.5 Faz 2a adım 2–8) + `src/config/gorunum/index.ts` + `features.ts` tek satır (`YENI_GORUNUM`; URUN claim'i için Ops izni) + font tanımı (bayrak kapalı). **Spike S1/S2/S3** (§1). **I18N:** sözlük iskeleti (§3.4). **ROTA:** yeni rota taslakları (arama, karşılaştırma, teklif-listesi, senaryo) — yalnız adres şemasında YAZILI olanlar (§5.3). **VARLIK:** `public/brand` SVG (30 dosya, K23). **DS:** PR-1 başlar (3 çalışan). **Paketler:** dal açar, DS `.d.ts` sözleşmesini okur | TASARIM, ALTYAPI, I18N, URUN | INV-PALET-1 sabotaj 4/4; INV-TOKEN-PARITE-1 yeşil; K-1 komutu 0; **bayrak kapalı fark 0 ilk koşu (§1.3)**; font `preload` farkı 0; `pnpm type-check` · `lint` · `test -- --run` yeşil | tahmin: gün içi; spike'lar riskli |
| **7 Çar** | **TASARIM:** Faz 2b anahtarlı çevirme (§1.2) merge (kapalı = fark 0; yerel açık = görünür); DS PR-2 (TeknikTablo, KarsilastirmaTablosu, AdetKontrolu, KatliCagriSatiri) ve PR-3 (PQEgrisi). **KABUK, ANA, LISTE, URUNSAYFA, TEKLIF** kodlama (ilk dilim); **SOZLUK dalgası #1 (öğle).** **Master dalgası 17:00** (yalnız kapalı-bayraklı, kapıları yeşil PR'lar; günde en çok 2 dalga, §6.5) | TASARIM, URUN, SATIS, I18N | DS: bileşen başına Vitest render + axe ihlali 0 (v2.1 §2.5 Faz 3 yeni tanım); her paket PR'ında §1.3 statik ölçü; dalga sonrası fark 0 yeniden koşulur | tahmin |
| **8 Per** | **Paketlerin kod-tamam hedefi.** İkincil paketler (ARAMA, KARSILASTIRMA, BILGI, SECICI, SENARYO) bugün biter ya da düşme adayıdır. **SOZLUK dalgası #2 (sabah), #3 (18:00 son).** **TOK dondurma 18:00** (§3.4). **Yerel önizleme dalı** oluşturulur: master + tüm bayraklar `true` tek commit, **push EDİLMEZ**. **İlk tam ölçüm turu** (OLCUM, akşam) | tümü | Ölçüm raporu v0 (§4'ün 14 maddesinin ilk koşusu); kırmızı listesi paket sahiplerine | tahmin; en sıkışık gün |
| **9 Cum** | Sabah düzeltme; **12:00 kod dondurma** (yalnız kırmızı düzeltme). 12:00–15:00 **bağımsız doğrulayıcı ölçümü** (raporu üreten ajan doğrulamaz, §10.3) → rapor v1. 15:00–17:00 **Recep yerel önizlemesi** (kabul gözü, §4). **Akşam: Ops kararı** (§5.2 karar kuralı) | TASARIM + doğrulayıcı, Recep, Ops | §4 tablosu (otomatik maddeler yeşil/kırmızı; Recep hükmü) | tahmin |
| **10 Cmt** | Düzeltme + **yayın hazırlığı:** açılış PR'ları **draft** (adres: `ADRES_SEMASI_K3B=true`; görünüm: `YENI_GORUNUM=true` + geçen paketlerin alt bayrakları); **geri alma provası** (bayrak `false` PR'ı yerelde build); canlı ölçüm komut seti; Vercel kota kontrolü (ALTYAPI); `pnpm build` iki kombinasyon (§5.2) | TASARIM, URUN, ALTYAPI, Ops | Yayın kontrol listesi yeşil; iki kombinasyon build yeşil | tahmin |
| **11 Paz** | **Yayın:** (1) adres açılışı merge → deploy → canlı ölçüm (301, hreflang, sitemap, GSC; URUN/GEO-SEO); (2) **yeşilse** görünüm açılışı merge → deploy → canlı ölçüm (altı sayfa, CSS hash `curl` 3 ISR adresi, Lighthouse). Gözlem penceresi; geri alma kararı Ops | URUN, TASARIM, Ops | Canlı ölçüm raporu; geri alma = bayrak `false` PR'ı | tahmin (gözlem ≥2 saat) |
| **11 Ekim sonrası** | OPS-71 (karar 285, **kod 11 Ekim'den sonra, ÜRÜN ile**); eski değerleri silen temizlik PR'ı (çakışan küme boşalır); Faz 5 borç eritme (INV-BORC-MANDAL-1; `rounded-*`/`shadow-*` — "aynı değişiklik çok hedef" olduğundan **maestro** uygun, §3.5); admin'in DS'e geçişi (ADMIN kararı) | URUN, TASARIM, ADMIN | — | — |

**v2.1 faz tablosu ile eşleme:** ön koşul (kapı) → Sal sabah · Faz 2a → Sal · Faz 3 (DS) → Sal–Çar · Faz 2b → Çar (ölçüm Per) · Faz 1 (kabuk) → Çar–Per, anahtar `YENI_KABUK_GEZINMESI` ·
Faz 4 (sayfalar) → paketler Çar–Per, anahtar paket bayrağı · Faz 5 → 11 Ekim sonrası. **v2.1'den sapma gerekçesi:** v2.1 2b'yi "7-8 Ekim" ile aynı aralıkta öngörüyordu; burada anahtarlı olduğu için
**merge'ü Çarşamba'ya** (ölçümü Perşembe'ye) koydum — anahtar kapalıyken fark 0 olduğundan erken merge güvenli, ölçüm bütçesi (Lighthouse, font baytı) ise paketler hazır olunca anlamlı.

---

## 3 · (b) Ekran işinin paralel bölümü

### 3.1 Kare → paket (envanter: 52 kare, 33 HAZIR / 19 YARIM; G=9 alt kare; H=6 alt kare)

| Paket | Kareler (HAZIR / YARIM) | Sayı H/Y | Design girdisi bekleyen |
|---|---|---|---|
| **KABUK** | A1 A2 A3 A4 A5 B2 D1 D2 E1 / A0 A2b A5b A6 A7 F3 + G: M1 M3 M4 M5 M8 M9 | 9 / 6 | **A6** (T-5 açık karar) · **F3** (T-1: karede çözülmemiş `{{ u3Rozet }}`; K37-c "U3 = PANEL" karar verildi, kare güncellenmedi) |
| **DS + VARLIK** (TASARIM) | — / A8 A9 | 0 / 2 | **A8** ("onay bekler") · **A9** ("öneri, ret gelirse silinir") |
| **ANA** | B1 | 1 / 0 | — |
| **LISTE** | B3 B3b B3c B4 B5 B5b C3 / B1b + G: M2 | 7 / 1 | OPS-71 ile B3b/B3c ilişkisi **ölçülmedi** (§6.4) |
| **URUNSAYFA** | B6 B7 B7b B7c B7d B7e / B7v B7f + G: M7 | 6 / 2 | B7v: "aynı adreste seçilir" tasarımı ↔ kod 308 `?sku=` (adres kararı URUN'un, Design'ın değil) |
| **TEKLIF** (SATIS) | B9 / B9b B10 B11 + G: M6 · H: S1–S6 (K1 kapalı bekler) | 1 / 3 | — |
| **ARAMA** | D3 D4 / D5 | 2 / 1 | — |
| **KARSILASTIRMA** | B8 B8b | 2 / 0 | **B8 "bayat"** (dal başına alan kümesi bekliyor, envanter §2) · B8b "karar karesi, ekran değil" |
| **SECICI** | E2 / E3 | 1 / 1 | — |
| **BILGI** | F1 F2 / F4 | 2 / 1 | F4 sayfası sitede **yok** |
| **SENARYO** | C1 C2 | 2 / 0 | Etiket verisi 0 (envanter §1 birim 12) |
| **KAPSAM DIŞI** | — / B12 F5 | 0 / 2 | **B12** (K62 ERTELENDİ) · **F5** (giriş/kayıt; Google OAuth ölçülmedi) |
| **Toplam** | | **33 / 19 = 52** | |

Sayım, `docs/audits/tasarim-envanteri-2026-09-25-menu.md` tablosundan betikle yeniden üretildi (HAZIR 33, YARIM 19 [18 satır + F3'ün `**YARIM — açık karar**` biçimi]). Envanter ayrıca **27 kareyi "yapısal çelişki"** (çoğu adres)
ve **19 karede site karşılığını "ölçülmedi"** olarak işaretliyor (iç yerleşim bilinmiyor): A0 A1 A2 A2b A3 A5b B2 B5 B5b B7 B7c B7d B7e B7f B9b C1 C2 E1 F2. G (9) ve H (6) başlık düzeyinde okundu, kare kare eşleşme **ölçülmedi**.
**Çekirdek** (görünüm anahtarı bunlar olmadan açılmaz, §5.1): KABUK + ANA + LISTE + URUNSAYFA + TOK/font + DS paketleri; ölçüt olarak **17 kare** (A1–A5, B1, B2, B3, B3b, B3c, B4, B5, B6, B7, B7b, B7d, B7e) + G'nin 8 alt karesi (M1–M5, M7–M9).
Çekirdek paketlerin çekirdek-dışı kareleri (A0, A2b, A5b, A6, A7, D1, D2, E1, F3, B1b, B5b, C3, B7c, B7v, B7f) paketi düşürmez: kare bazında "eski kalır" (§5.1).

### 3.2 Paket tablosu (departman, dosya alanı, bayrak, bağımlılık)

Departman önerileri gerçek şeritlerdendir (`DEPARTMAN-HARITASI.md`). **TASARIM yalnız tasarım sistemi + ölçümdür; sayfa/rota/adres/veri/SEO/kabuk dosyaları URUN'un (rol kartı) — sınır korunur.**
Paralellik **ikiz şerit açarak değil** (§4 şerit sınırları), müdür içi **ekip lideri + çalışan** ile sağlanır (§10.1); canlı şerit tavanı 2–3 (§4) olduğundan canlı müdür penceresi **3**: TASARIM, URUN, SATIS.

| Paket | Departman (müdür) | Ajan önerisi (tahmin; kapasite ölçülmedi) | Dosya alanı (glob) | Alt bayrak | Sıra / bağımlılık |
|---|---|---|---|---|---|
| **TOK** | TASARIM | 1 çalışan + müdür | `src/design-system/**` · `src/index.css` · `tailwind.config.js` · `src/app/layout.tsx` · `src/config/gorunum/index.ts` | `YENI_GORUNUM` | Sal; 18:00 Per dondurulur |
| **DS** | TASARIM | 3 çalışan (DS-A: AnaEylemDugmesi CerceveliDugme Cip Kart HukumKutusu · DS-B: TeknikTablo KarsilastirmaTablosu AdetKontrolu KatliCagriSatiri · DS-C: PQEgrisi) | `src/components/ds/**` (bileşen başına alt klasör) | — (tüketici yok) | TOK'tan sonra; PR-1 Sal, PR-2/3 Çar |
| **VARLIK** | TASARIM (claim Ops'tan) | 1 çalışan | `public/brand/**` | — | Sal; KABUK'tan önce (logo) |
| **KABUK** | URUN | lider A + 2 çalışan | `src/components/{StickyHeader,Footer,MegaMenu,SearchOverlay,LanguageSwitcher}.tsx` · `src/components/layout/**` · `src/components/navigation/**` · `src/app/not-found.tsx` · `src/views/NotFoundView.tsx` · `src/config/gorunum/kabuk.ts` | `YENI_KABUK_GEZINMESI` **ve** alt bayrak | VARLIK + DS-PR1'den sonra |
| **ANA** | URUN | lider A + 1 çalışan | `src/views/HomePage.tsx` · `src/components/home/**` · `src/config/gorunum/ana.ts` | `ANA_GORUNUM` | KABUK'tan bağımsız; `ProductCard` LISTE'den |
| **LISTE** | URUN | lider B + 2 çalışan | `src/views/category/**` · `src/views/{CategoryMasterView,CategoryPage,ProductsDiscoveryView,ProductsPage}.tsx` · `src/components/category/{CategoryFilters,CategoryShowcase,CategoryAuthoritySection,EducationalGuide}.tsx` · `src/components/category/sections/**` · `src/components/ProductCard.tsx` · `src/components/products/{FamilyCard,ProductsHero,ProductsSkeleton}.tsx` · `src/app/_components/{kategoriSayfasi,urunlerSayfasi}.tsx` · `src/config/gorunum/liste.ts` | `LISTE_GORUNUM` | `ProductCard` yeni varyantı **Çar öğle** (ANA/ARAMA/URUNSAYFA tüketir) |
| **URUNSAYFA** | URUN | lider B + 2 çalışan (en büyük paket) | `src/app/_components/{ProductDetailPageView,aileSayfasi}.tsx` · `src/components/products/{VariantSelector,AileKirintisi,AddToProjectModal,RichTextRenderer}.tsx` · `src/components/{QuickViewModal,ImageGallery}.tsx` · `src/config/gorunum/urun.ts` | `URUN_GORUNUM` | DS-PR2 (TeknikTablo, PQEgrisi, KatliCagriSatiri) |
| **SECICI** | URUN | lider B + 1 çalışan | `src/components/category/{EnhancedNeedsWizard,NeedsAnalysisWizard,SilentFanWizard}.tsx` · `src/config/gorunum/secici.ts` | `SECICI_GORUNUM` | `urun-secici/page.tsx` içeriği `views/`e taşıma ROTA'dan (§3.4) |
| **TEKLIF** | **SATIS** (teklif modülü sahibi; Ops teyit) | lider (SATIS müdürü) + 2 çalışan | `src/views/{CartPage,CheckoutPage,PaymentSuccessPage}.tsx` · `src/views/checkout/**` · `src/components/AddToCartToast{,Content}.tsx` · `src/config/gorunum/teklif.ts` | `TEKLIF_GORUNUM` | DS-PR2 (AdetKontrolu); kip kuralı K38/K39 |
| **ARAMA** | URUN | lider C + 1 çalışan | `src/views/arama/**` (YENİ) · `src/config/gorunum/arama.ts` | `ARAMA_GORUNUM` | ROTA taslağı (Sal) + LISTE `ProductCard` |
| **KARSILASTIRMA** | URUN (+KATALOG verisi) | lider C + 1 çalışan | `src/views/karsilastirma/**` (YENİ) · `src/config/gorunum/karsilastirma.ts` | `KARSILASTIRMA_GORUNUM` | DS-PR2 (KarsilastirmaTablosu); KATALOG alan kümesi |
| **BILGI** | URUN | lider C + 1 çalışan | `src/views/knowledge/**` · `src/views/support/**` · `src/config/gorunum/bilgi.ts` | `BILGI_GORUNUM` | URUN Bilgi Merkezi'ni zaten kuruyor |
| **SENARYO** | URUN | lider C + 1 çalışan | `src/views/senaryo/**` (YENİ) · `src/config/gorunum/senaryo.ts` | `SENARYO_GORUNUM` | Veri 0 → ilk düşen |
| **ROTA** (tek sahip) | URUN (adres işinin sahibi) | müdür (elle) | `src/app/[lang]/**` · `src/app/_components/markaSayfasi.tsx` · `src/config/features.ts` · `src/utils/routes.ts` · `src/middleware.ts` · `next.config.mjs` | — | Paketler bu alana **dokunmaz** |
| **SOZLUK** (tek sahip) | I18N | müdür | `src/i18n/dictionaries/{tr,en}.ts` (tek satır) · `src/i18n/dictionaries/gorunum/index.ts` | — | §3.4 |
| **SOZLUK-PARCA** | paket sahibi | — | `src/i18n/dictionaries/gorunum/<paket>.{tr,en}.ts` | — | Kendi paketinin parçası |
| **KAPI** | ALTYAPI | müdür | `src/__tests__/conformance/**` · `package.json` · `pnpm-lock.yaml` · `.github/workflows/**` | — | Sal sabah |
| **OLCUM** | TASARIM | 1 çalışan + bağımsız doğrulayıcı | `e2e/gorunum/**` · `docs/audits/yeni-gorunum-*` · `docs/plans/tasarim-kod-plani-v2*` | — | Sal'dan itibaren |
| **ADMIN** (dondurma) | ADMIN | müdür | `src/app/admin/**` (yalnız dondurma, §1.4) | — | ADMIN kararı Sal 12:00 |

Ekip liderleri `general-purpose` alt ajandır (müdür modeli §10.1): lider A = KABUK+ANA; lider B = LISTE+URUNSAYFA+SECICI; lider C = ARAMA+KARSILASTIRMA+BILGI+SENARYO. Her lider kendi çalışanlarını açar, denetler, bağımsız doğrulayıcı çalıştırır,
müdüre **tek özet** döner; kapı eylemi (merge) müdürdedir. **Çalışan sayıları ve süreler tahmindir; URUN müdürünün gün içinde denetleyebileceği PR hacmi ölçülmedi** (§6).

### 3.3 Çakışmasızlık kanıtı (depoya karşı ölçüldü)

Yukarıdaki globlar bir betikle (`git ls-files` 5042 dosya: 5028 gerçek + 14 sentetik "yeni dosya" yolu) her dosya için **kaç paketin globuna girdiği** sayıldı:

| Ölçüt | Sonuç |
|---|---|
| ≥2 pakete giren dosya | **0** |
| Bir pakete atanan mevcut dosya | 990 (+14 sentetik yolun 14'ü de **tam 1** pakete düştü: `ds/Kart/Kart.tsx→DS`, `public/brand/…→VARLIK`, `views/arama/…→ARAMA`, `config/gorunum/ana.ts→ANA`, `config/gorunum/index.ts→TOK`, `dictionaries/gorunum/ana.tr.ts→SOZLUK-PARCA`, `…/index.ts→SOZLUK`, `e2e/gorunum/…→OLCUM`, `[lang]/arama/page.tsx→ROTA` …) |
| Vitrin alanında (`components/views/app/contexts/hooks`, `.md` ve test hariç) toplam | 487 dosya |
| Bunlardan **hiçbir pakete atanmayan** | **181** — `components/products` 54 (3D `3d/**` dahil; K-4 kapsam dışı), `views/legal` 18, `views/account` 14, `components/calculators` 6, `views/calculators` 4, `components/ui` 4, `app/api` 2, `app/auth` 2, `components/quotes` 2, tekil `components/*.tsx` dosyaları … |

**Kural:** atanmayan dosyaya hiçbir paket PR'ı dokunmaz; ihtiyaç doğarsa **"paylaşılan dosya talebi"** ilgili paketin/rotanın sahibine gider. Doğrulama komutu her PR raporuna yazılır:
`git diff --name-only origin/master...HEAD` çıktısının **tümü** paketin globlarından birine uymalıdır (paketin kendi PR'ında). Kalıcı kapı **öneridir** (`INV-PAKET-SINIR-1`, ALTYAPI belirler; dal öneki → paket globu eşlemesi).
**Sınırlar (adıyla):** (i) globlar mevcut dosya ve sentetik yollara karşı denendi, **gelecekte açılacak her yeni dosya** için değil — yeni dosya adı kuralı (`views/<paket>/**`, `config/gorunum/<paket>.ts`, `gorunum/<paket>.{tr,en}.ts`) çakışmayı kurucu olarak engeller ama bunu bir kapı
doğrulamıyor; (ii) `.md` eşlik dosyaları (`orion-doc` kancası) aynı dizinde üretilir, paketin dizin kapsamındadır, tek dosya globlarında ayrıca sayılmadı; (iii) **dosya içi** (aynı dosyanın iki paket tarafından düzenlenmesi) bu yöntemle değil, "tek sahip" kuralıyla (§3.4) önlenir.

### 3.4 Paylaşılan dosyalar — TEK SAHİP ve sıra kuralı

| Dosya | Tek sahip | Kural |
|---|---|---|
| `tailwind.config.js` · `src/index.css` · `src/design-system/tokens.js` · `src/app/layout.tsx` | **TOK (TASARIM)** | Salı'da DS'in **66 adının tamamı** (v2.1 §2.5 Faz 2a) tek PR'da eklenir; paketler **token talebi** (ad + gerekçe) TASARIM'a yazar. **Per 18:00'da dondurulur**; sonrası yalnız kırmızı düzeltme. Hiçbir paket bu dosyalara dokunmaz |
| `src/config/features.ts` | **ROTA (URUN)** | `YENI_GORUNUM` satırını Salı **tek PR**'da TASARIM ekler (Ops izniyle); sonra **kimse** düzenlemez; açılış PR'ını Ops açar |
| `src/config/gorunum/<paket>.ts` | Paket sahibi | Dosya paket başına ayrı → çakışma yok; `index.ts` TOK'un |
| `src/i18n/dictionaries/{tr,en}.ts` | **SOZLUK (I18N)** | Sözlük `gorunum` kökü **tek satır** (Salı iskelet PR'ı). Paketler yeni anahtarı **kendi parça dosyalarına** yazar (`dictionaries/gorunum/<paket>.{tr,en}.ts`), `tr.ts`/`en.ts`'e dokunmaz. **Sapma talebi (I18N'e):** I18N kuralı "ajanlar sözlüğe yazmaz, müdür merkezi birleştirir"; parça dosyası yöntemi bu kuralla örtüşür mü — I18N müdürü karar verir; yerine geçecek yöntem **merkezi birleştirme dalgaları** (Çar öğle, Per sabah, Per 18:00 son) olur |
| `src/components/ProductCard.tsx` | **LISTE** | ANA/ARAMA/URUNSAYFA yalnız içe aktarır; yeni varyant **Çar öğle**; öncesinde tüketici paketler eski bileşeni kullanır |
| `src/components/ds/index.ts` (barrel) | **DS** | Tüketici paketler barrel'den içe aktarır; bileşen PR'ı barrel'i aynı PR'da günceller |
| `src/utils/routes.ts`, `useLocalizedRoutes` | **ROTA** | Yeni rota girişi talebi ROTA'ya gider; paketler manuel `/tr/` yazamaz (kural 7) |
| `src/app/**` (rota dosyaları) | **ROTA** | **Paketler rota dosyalarına dokunmaz**; seçim (eski/yeni) görünüm bileşeninin **içinde** yapılır. İçeriği `page.tsx`'te duran sayfa (ör. `urun-secici`) için içeriğin `views/`e taşınması ROTA'dan istenir |
| `src/components/StickyHeader.tsx` vb. (KABUK) | **KABUK** | `HeaderTeklifPaneli` sepet sayısını `CartContext`'ten **yalnız okur** (bağlam SATIS/URUN'un) |
| `public/brand/**` | **VARLIK** | Salı biter; KABUK logoyu oradan okur (K23: logo elle çizilmez) |

**Sıra özeti (bağımlılık zinciri):** KAPI(Sal) → TOK(Sal) → {DS-PR1, VARLIK, SOZLUK iskelet, ROTA taslak}(Sal) → {DS-PR2/3, LISTE `ProductCard`}(Çar) → {KABUK, ANA, URUNSAYFA, TEKLIF, SECICI, ARAMA, KARSILASTIRMA, BILGI, SENARYO}(Çar–Per) → OLCUM(Per akşam).

### 3.5 Yöntem (execution-method-standard §2/§3) ve sapma

**YÖNTEM:** *şerit (TASARIM, URUN, SATIS) + şerit içi ekip lideri/çalışan (§10), paket başına ayrık dosya alanı, her paket çıktısı bağımsız doğrulayıcıdan geçer (§10.3); maestro ve Workflow bu iş için KULLANILMAZ.*
**Gerekçe (karar tablosu satırları):** (i) "Aynı yapısal değişiklik çok hedefe → maestro" satırının **kullanılmaz** koşulu "hedefler birbirinden farklı → şerit içinde sıralı": ekran paketleri birbirinden farklı hedeflerdir.
(ii) Pratik tavan 2–3 canlı şerit + şerit içi alt ajan + lider (§4); ikiz şerit yok. (iii) Workflow, kullanıcı opt-in'i ("workflow kullan") ister; bu planda emirde yazılı değil, **açmayı Ops yapar**.
**Sapma (yazılı, hata değil):** Ops'un "maestro/Workflow" ifadesi bu cetvelle tam örtüşmüyor; cetvel yanlışsa cetvel değişir, ama ölçülmemiş bir sapma yerine **kural satırına uyuldu**. **Maestro'nun yeri:** 11 Ekim **sonrası** Faz 5 (`rounded-*` 1.527, `shadow-*` 555 kullanımı, v2.1/envanter) — "aynı değişiklik çok hedef" olduğundan.
**Workflow'un yeri (öneri, Ops opt-in verirse):** 9 Ekim ölçüm turunun çok-eksenli bağımsız çürütmesi (§4); varsayılan olarak bağımsız doğrulayıcı çalışan yeter.

**Paket PR kuralları (her paket):** (1) tek dal, master'dan taze (`urun/<paket>`…); (2) §1.3 statik ölçü PR raporunda sayı; (3) test aynı PR'da (kural 14): boş veri / ağ yok / yetki yok durumları ekran başına test; (4) i18n: TR+EN anahtarları aynı PR'da (dead-key / key-resolution kapıları); (5) rota dosyasına dokunma yok;
(6) ham HEX ve arbitrary değer yeni satırda 0; (7) kabuk bayrağı varsa mevcut 3 kilit testi **güncellenmez** — açılış PR'ının işidir.

---

## 4 · (c) 9 Ekim yerel önizleme KABUL ÖLÇÜTÜ

**Önizleme:** §2 Per'de oluşturulan, push edilmeyen yerel dal; `pnpm build && pnpm start` (Recep'in ekranına erişim yöntemi — aynı makine/ekran paylaşımı — Ops'un; **ölçülmedi**). Push edilmemesinin sebebi Vercel kotasıdır (collaboration-protocol §8.1).
**Kabulü kim verir:** **Recep** önizlemeye bakar ve hükmü OPS penceresinde verir (karar 224: canlı dışı onay OPS'ta); **ölçüm raporu TASARIM müdüründe**, raporu üreten ajan doğrulamaz — **bağımsız doğrulayıcı** yeniden ölçer (§10.3); düşen dilim kararı Ops'ta (§5.2).

**Çekirdek kümesi** (§3.1): 17 kare + G 8 alt kare + token/font. **Eşik kuralı:** çekirdekte tek madde kırmızıysa görünüm anahtarı açılmaz (§5.1). İkincil paket "geçer" = paketin HAZIR karelerinin tümü + Design girdisi **gelmiş** YARIM karelerin tümü; girdisi gelmeyen YARIM kare eski görünümde kalır, paketi düşürmez.

| # | Ölçüt | Yöntem | Eşik | Tür | Sahip |
|---|---|---|---|---|---|
| M1 | **Ekran sayısı** | Her kare için "kare ↔ ekran" yan yana ekran görüntüsü (gerçek tarayıcı) | Çekirdek **17/17 + G 8/8**; ikincil: paket ya tam ya bayrak kapalı | otomatik (görüntü üretimi) + **Recep gözü** (hüküm) | OLCUM → Recep |
| M2 | **Taşma** | Playwright: her çekirdek sayfada `scrollWidth − clientWidth` | **0** (mevcut tolerans 1 px) @ **320** (mevcut INV-REFLOW-1) · **390** · **768** · **1024** · **1280**; `overflow-x: hidden/clip` html/body'de yasak (mevcut kapı kuralı) | otomatik | OLCUM |
| M3 | **Kontrast** | Gerçek tarayıcıda computed renk çifti + WCAG formülü (jsdom ölçemez, cetvel §3); çift listesi DS bileşenlerinden çıkarılır | normal metin **≥ 4,5:1**, büyük metin/arayüz **≥ 3:1**; kiremit düğme zemini `--action-terracotta-deep` + beyaz yazı ≥ 4,5 (cetvel §1.1: 4,71); `--brand-cyan-ink` beyazla ≥ 4,5 (5,65); turkuaz normal metinde **0** (K25); **yeni `--brand-cyan` koyu zeminde** ayrıca (v2.1 §2.2 riski) | otomatik | OLCUM |
| M4 | **Tek dolu kiremit (K5)** | DOM: `data-ds="AnaEylemDugmesi"` (DS bileşeninin bu işareti basması **öneridir**, DS sözleşmesine Salı eklenir) sayısı, her çekirdek sayfada masaüstü + mobil | **≤ 1**; tek fiil "Teklif iste"; "Teklif al" **0** | otomatik | OLCUM |
| M5 | **Ham HEX / arbitrary** | Dal farkında EKLENEN satırlarda HEX, `[…]` Tailwind değeri, `style={{…:'#'}}` taraması + `pnpm lint` + INV-9 (storefront ratchet) | yeni **0**; mevcut borç **artmaz** | otomatik | KAPI/OLCUM |
| M6 | **Anahtar kapalıyken fark 0** | §1.3 (statik silinen-satır 0 + dinamik HTML/computed-style) altı sayfa × {390, 1280} | **0**; font `preload` ve `font-mono` computed eşit | otomatik | OLCUM |
| M7 | **Erişilebilirlik (axe)** | Playwright + axe-core 4.13 sayfa düzeyi + vitest-axe bileşen düzeyi | **kritik 0 · ciddi 0**; (jsdom `color-contrast` koşmaz → M3 ayrı) | otomatik | OLCUM |
| M8 | **Performans** | Lighthouse mobil, yerel `pnpm start`, **master taban ayrı ölçülür** (Salı); font toplam woff2 baytı; `pnpm build` JS payload farkı | **CLS ≤ 0,1** (Web Vitals "iyi" eşiği); **LCP ≤ 2,5 s** ve master tabanına göre kötüleşme **≤ %10** (**bu %10 eşiği TASARIM önerisidir, Recep onaylı eşik değil — Ops teyit**); font bayt tavanı ve payload bütçesi: **bugün sayı yok**, Salı tabanı ölçüldükten sonra yazılır | otomatik (eşik teyit bekler) | OLCUM |
| M9 | **Kapılar** | `pnpm test -- --run` · `type-check` · `lint` · `knip` | **hepsi yeşil**; INV-PALET-1 güncel; INV-TOKEN-PARITE-1; INV-ADMIN-THEME-1..5; i18n kapıları; K-1 komutu (`tasarim/*`) **0** | otomatik (CI + yerel) | KAPI |
| M10 | **TR/EN** | Her çekirdek ekran `/tr` ve `/en` render | 200; boş/eksik anahtar **0**; `{{` kalıntısı **0**; elle `/tr/` **0** | otomatik | I18N/OLCUM |
| M11 | **Kip (K7/K38/K39)** | DOM ölçüm satırı (venthub-tasarim-dili §3): Teklif kipinde `Sepete ekle` 0 · ₺ 0 · "fiyat yok/—" 0; fiyatsız ürün "Teklif iste" ≥ 1; boş teknik alan satırı 0 | skill ölçüm satırı | otomatik | OLCUM |
| M12 | **Admin dondurma** | Altı admin ekranında bayrak açık/kapalı computed-style | **fark 0** (§1.4) | otomatik | OLCUM/ADMIN |
| M13 | **Hata yolları (kural 14)** | Ekran başına boş veri / ağ yok / yetki yok durumu render testi | paket başına **her durum ≥ 1 test** (test dosyası listesi) | otomatik | paket sahibi |
| M14 | **Kare ↔ ekran "his"** | Recep önizleme: ana sayfa, kategori, liste, ürün (panel kapalı/açık), header+footer masaüstü/mobil, Teklif paneli | **Recep'in "olur"u** (v2.1 Faz 2b "olur"unun karşılığı) | **Recep gözü** | Recep |

**Hangisi insan:** M1'in hükmü ve M14 Recep'indir; M8'in %10 eşiği Ops teyidi bekler; geri kalanı otomatik. **Ölçülemeyenler (adıyla):** kareye "birebirlik" tam bir sayı değildir (M1 görüntü üretir, benzerlik hükmünü insan verir);
M3 yalnız listelenen çiftleri kapsar (listede olmayan çift ölçülmez); G alt karelerin kare kare eşleşmesi ölçülmedi; Lighthouse tek koşu değişkendir (üç koşu ortalaması, **yöntem önerisi**).

---

## 5 · (d) Yetişmezse düşen dilim

### 5.1 Düşme sırası (en önce düşen → en son)

**Asla düşmeyenler (taban):** (T1) **adres dilimi tek başına çıkabilir** (anahtar matrisi, §5.2); (T2) Faz 2a **görünmezliği** + INV-PALET-1 güncellemesi + K-1 komutu 0; (T3) "anahtar kapalı = fark 0" (M6) — **hiçbir paket bunu ihlal ederek master'a girmez**; (T4) kapılar gevşetilmez (kural 14: "yetişmedi" bir kapıyı kırmızı bırakma gerekçesi değildir; paket DÜŞER, kapı gevşemez).

| Sıra | Dilim | "Düştü" etkisi (ziyaretçi için) | Not |
|---|---|---|---|
| 1 | **SENARYO** (C1, C2) | **Fark yok** (sayfa zaten sitede yok) | Veri 0 |
| 2 | **H satış kipi** (S1–S6) | Fark yok (K1: kapalı bekler) | Kod hazır kalır |
| 3 | **KARSILASTIRMA** (B8, B8b) | Fark yok (sayfa yok); `KarsilastirmaTablosu` DS'te hazır kalır | B8 "bayat" |
| 4 | **ARAMA** (D3–D5) | Arama sonuç sayfası yok (bugünkü gibi); header arama overlay'i (D1/D2) KABUK'ta kalır | |
| 5 | **BILGI** (F1, F2, F4) | Bilgi Merkezi eski yerleşim + yeni tokenlar; F4 yok | |
| 6 | **SECICI** (E2, E3) | Ürün Seçici eski yerleşim + yeni tokenlar | |
| 7 | **TEKLIF** (B9–B11, M6) | Sepet/teklif sayfaları eski yerleşim + yeni tokenlar; header "Teklif (n)" paneli (A3) mevcut `/cart` adresine bağlanır (adres rota tablosundan) | Ticari akış: düşerse **Recep'e açıkça yazılır** |
| 8 | **ANA** (B1) | Ana sayfa eski yerleşim, yeni kabuk içinde | |
| — | **ÇEKİRDEK:** TOK/font · DS · KABUK(A+G birlikte) · LISTE · URUNSAYFA | **Biri düşerse görünüm anahtarı TOPLUCA kapalı kalır** (yarım çekirdek tutarsız site: yeni header + eski ürün sayfası gibi) | `YENI_KABUK_GEZINMESI` zaten "yarısı açık kabuk kötüdür" der (`features.ts:47-48`) |

Düşen paketin alt bayrağı `false` kalır; **anahtar kapalıyken fark 0** olduğundan düşme canlıda iz bırakmaz (M6'nın kendisi bunu doğrular).

### 5.2 Ops'un 9 Ekim akşamı karar kuralı + adres dilimi tek başına

**Girdi:** ölçüm raporu v1 (bağımsız doğrulayıcı) + Recep'in önizleme hükmü + adres dilimi kabul sonucu (URUN/ALTYAPI).

| Durum | Karar | Anahtarlar |
|---|---|---|
| Çekirdek **tümü yeşil** (M1–M14) + Recep "olur" | Çekirdek + geçen ikincil paketler açılır | `ADRES=true`, `YENI_GORUNUM=true`, `YENI_KABUK_GEZINMESI=true`, geçen paketlerin alt bayrağı `true` |
| Çekirdek yeşil, bir **ikincil paket** kırmızı | O paket düşer, diğerleri açılır | O paketin alt bayrağı `false` |
| **Çekirdekte** bir madde kırmızı ya da Recep "olur" demedi | **Görünüm açılmaz; adres dilimi tek başına çıkar** (karar 271 güvenlik ağı) | `ADRES=true`, `YENI_GORUNUM=false`, `YENI_KABUK_GEZINMESI=false` |
| Adres dilimi kabulü kırmızı, görünüm yeşil | Adres açılmaz; görünüm adres-bağımsız olduğundan **Ops + Recep** karar verir (görünüm URL'leri değiştirmez, K-1 ihlali yok; ancak Recep önceliği adres) | `ADRES=false`; görünüm Ops kararı |
| Her ikisi kırmızı | 11 Ekim'de yalnız Faz 2a (görünmez) + kapı + DS çıkar; Recep'e açık rapor | tüm bayraklar `false` |

**Adres dilimi tek başına — hangi anahtar, hangi test:** anahtar `ADRES_SEMASI_K3B = true`, `YENI_GORUNUM = false`. Testler: mevcut `rota-dili-*`, `kategori-rotasi-statik`, `urunler-rotasi-statik`, `tek-kanonik-kategori-adresi`, `anasayfa-rotasi-statik`, sitemap/robots
testleri (URUN/ALTYAPI'nın) + **yeni `anahtar matrisi` kapısı** (öneri, ALTYAPI; ad belirsiz): {ADRES false/true} × {GORUNUM false/true} = 4 kombinasyonda altı sayfa render (anahtarlar `vi.mock` ile) + **iki gerçek `pnpm build`** (T,F ve T,T; Cum/Cmt). Canlı: 301, hreflang, sitemap, GSC (URUN/GEO-SEO ölçer).
**Ölçülmedi:** `vi.mock` ile derleme sabiti kombinasyonlarının render testinde güvenilir olup olmadığı ve `next build`'in süresi (kombinasyon başına); Salı ALTYAPI ölçer.

### 5.3 K-1 / karar 118 ve Faz 4(2) "adres yayınından sonra" — bu bağlamda yeniden

- **K-1 SÜRER:** `tasarim/*` dalında `src/app` altına rota klasörü ekleme/silme/taşıma **0** (v2.1 §3 komutu, `:(glob)` biçimi). Yeni sayfaların (arama, karşılaştırma, teklif-listesi, senaryo, F4) rota klasörleri **`urun/*` dalında ROTA paketince** (adres işinin sahibi) açılır;
  TASARIM açmaz. Adres işi URUN/ALTYAPI'nındır; bu belge adres şemasını değiştirmez.
- **Adres şemasında YAZILI olmayan adres açılmaz.** `/tr/arama`, `/tr/karsilastir`, `/tr/teklif-listesi` ve senaryo/F4 adreslerinin `adres-semasi-standard.md`'de yazılı olup olmadığı **ölçülmedi** (envanter yalnız Design karelerindeki adresleri listeliyor; K3'te `/tr/teklif-listesi` geçer).
  Yazılı değilse ilgili paket **düşer**; adres kararı tek başına Recep'e sorulur (URUN rol kuralı: paketlenmez).
- **Faz 4(2) yeniden:** v2.1 "ürün/kategori görünüm göçü adres yayınından SONRA, ayrı yayında" diyordu. 271 ile **aynı gün** olur ama **ayrı anahtar, ayrı deploy, ayrı geri alma**: 11 Ekim sabahı önce adres açılışı + canlı ölçüm, **yeşilse** görünüm açılışı. Görünüm bileşenleri
  **rota-bağımsızdır** (`src/views/**`; rota dosyaları seçimi içlerinde yapar, §3.4) → görünüm anahtarı adres anahtarına KOD bağımlılığı taşımaz. URUN'un adres işinin hangi rota dosyalarını yazdığı **ölçülmedi** (mevcut `kategori/[kok]/[[...dal]]`, `urun/[slug]`, `urunler`, `bilgi-merkezi` rota klasörleri depoda var; bayrak `false`).
  Link üretimi rota tablosundan (`useLocalizedRoutes`, kural 7): görünüm hangi adres şemasında çalışırsa çalışsın doğru adrese bağlanır — bu **M10 ve §4 M6** ile ölçülür.
- **Karar 285 (OPS-71, tek aileli alt kategori sayfası) 11 Ekim SONRASIDIR.** Envanterde B3b ("tek alt kategori ANLATIM") ve B3c ("alt kategori yok SERİ LİSTESİ") kareleriyle ilişkisi **ölçülmedi**; Ops/URUN teyit eder, ilişki varsa o kare 11 Ekim'den çıkar (LISTE 8 → 6 kare).

---

## 6 · Gerçekçilik — 5 günde 33 HAZIR + 19 YARIM kareyi koda çevirmenin riskleri

1. **"HAZIR" = çizildi ve karara bağlandı, koda hazır DEĞİL.** Envanter 19 karede site karşılığını "ölçülmedi" işaretlemiş (A1, A2, A3, B2, B7 gibi çekirdek kareler dahil): iç yerleşim bilinmiyor, işin gerçek büyüklüğü ölçülmedi. 27 karede yapısal çelişki var
   (7 kök neden; çoğu adres şeması). **En büyük tek parça URUNSAYFA** (5 varyantlı ürün sayfası + katlı deneyim + varyant seçici): kapasite en çok orada ölçülmedi.
2. **Kapasite ölçülmedi.** Depoda ajan verimi, paket başına PR hızı, URUN müdürünün gün içinde denetleyebileceği PR hacmi için sayı yok. §3.2'deki çalışan sayıları ve §2'deki süreler **tahmindir**. Kaba büyüklük (tahmin): paket başına 1–2 PR + TOK/KAPI/SOZLUK/açılış = **25–30 PR** 4 günde;
   insan bant genişliği (Recep tek hakem, §4 tavanı 2–3 canlı şerit) darboğazdır.
3. **Design girdisi bekleyen kareler — takvimde "Design girdisi bekliyor" işaretlidir, kod yazılmaz, mevcut bileşen yeni tokenla kalır:** A6 · A8 · A9 · F3 · B8/B8b · B12 (K62) · F5. Ayrıca 13 YARIM kare (A0, A2b, A5b, A7, B1b, B7v, B7f, B9b, B10, B11, D5, E3, F4) "rozetli": rozetin "öneri/onay bekler" mi yoksa "kodlanabilir ama işaretli" mi demek olduğu
   **ölçülmedi** → Design'a sorulur. **Soruyu kim sorar:** TASARIM soru dosyasını hazırlar (7 soru: A6 T-5 · F3/A4 T-1+K37-c kare düzeltmesi · A8 onay · A9 kabul/ret · B8/B8b alan kümesi · 13 rozetin anlamı · B7v adres notu), **OPS** emir dosyasını Design projesine gönderir (venthub-tasarim-dili §4; koddan Design'a yazma yok, v2.1 K-7).
   **Kritik yol riski:** Design kendiliğinden tetiklenmez ("Recep 'Linear'a bak' der" — skill §4; bu kuralın bugün geçerliliği **ölçülmedi**) ve **tek yanıt süresi verisi yaklaşık 8–10 gündür** (uzun metin sorusu 09-25'te sorulmuş, Design değişikliği 10-03'te yapılmış; v2 §1 satır 9 ↔ v2.1 §1.2; gönderim saati ölçülmedi). **Bu pencereye sığmaz:** yanıt gelmeyen kare eski bileşen + yeni tokenla kalır.
4. **OPS-71 ↔ B3b/B3c** ilişkisi ölçülmedi (§5.3).
5. **CI ve dağıtım kotası.** Her master merge'ü bir production dağıtım kaydıdır; her push bir önizleme kaydıdır. 09-08 ölçümü: 25 saatte 37 önizleme + 23 production kaydı ve **iki kez kota kilidi**; bu yüzden **11 Ekim yayın günü kota kilidi** gerçek bir risktir. Önlem: ara push yok, günde en çok 2 merge dalgası,
   yerel önizleme dalı push edilmez, **Cmt günü ALTYAPI kota durumunu ölçer** (kota tavanı kilitliyken ölçülemiyor, §8.1; bugünkü kota durumu **ölçülmedi**).
6. **Kapıların yükü.** Her yeni ekran 354 conformance dosyasının (i18n dead-key/key-resolution/ters-yön, storefront ratchet, reflow, ssr-gövde …) altından geçer; paket PR'ı kırmızıya düşerse düzeltme turu takvimde yer tutar. i18n parça-dosya yöntemi kapıların `dictionaries/gorunum/` dosyalarını görüp görmediği **ölçülmedi** (Salı iskelet PR'ı ölçer).
7. **Gerçek tarayıcı ölçümleri otomatik değil elle başlar.** `e2e/gorunum/**` aracı bugün yok; M2'nin 320/768/1024/1280 kısmı mevcut INV-REFLOW-1 ile örtüşür (390 eklenir); M3, M4, M6, M8 için yeni araç Salı–Çar yazılır ve **kendi doğruluğu** (bilerek-fark) kanıtlanmadan ölçüm geçerli sayılmaz.
8. **Dürüst beklenti (tahmin, sayı uydurmadan):** çekirdek (17 kare + G + token/font + DS) 11 Ekim'e girebilir — **orta güven**; çekirdeğin hepsinin ve **ikincil paketlerin tamamının** girmesi **düşük güven**. §5 tam da bu yüzden var: düşme planlıdır, hata değildir. 11 Ekim hedefi 33+19 karenin tamamı değil, **çekirdek + anahtar kapalıyken sıfır risk**tir.
9. **Tam iş ilkesi (kural 14) baskı altında gevşemez:** hata yolları ve testler paketle birlikte; yetişmeyen paket kapıyı kırmızı bırakıp çıkmaz, **düşer** (§5.1 T4).

---

## 7 · Karar ve onay kaydı

- **Karar 271 ile kararlı (Recep'e gitmez):** hangi fazın 11 Ekim'e girdiği (TAM KAPSAM); K36 "kabuk anahtar arkasında yazılır"; galeri çıkarma; `token-turet` çıkarma; `ds/` yolu. (v2.1 §4 soru 1 ve 2 bu belgeyle **kapandı**.)
- **Recep'e kalan tek iş:** 9 Ekim yerel önizleme **hükmü** (§4 M1/M14; Ops penceresinde).
- **Ops'a:** (1) plan v2.2 onayı (Sal sabah); (2) ALTYAPI kapı emri; (3) paket kartları, `YÖNTEM:` satırı ve **claim'ler** (§3.2 globları; `src/config/features.ts` için URUN claim izni; `public/brand/**` için TASARIM claim'i); (4) Design soru dosyasının gönderimi; (5) ADMIN'e dondurma sorusu (§1.4); (6) I18N'e sapma talebi (§3.4);
  (7) SATIS'ın TEKLIF paketini üstlenmesi (öneri); (8) adres şemasında yazılı olmayan yeni adresler için Recep'e tek başına soru (§5.3); (9) M8 eşiğinin (%10) teyidi; (10) Vercel kota kontrolü.

## 8 · Ölçülmeyenler ve açık kalemler (v2.1 §8'e ek; hepsi "ölçülmedi", uydurma değer yok)

| Kalem | Durum | Kim / ne zaman |
|---|---|---|
| Karar 271 metni | doğrudan okunmadı (OPS aktarımı) | Ops |
| Bayrak kapalıyken yeni font baytı/`preload` farkı; `font-mono` computed eşitliği (S1) | ölçülmedi | TASARIM, Sal |
| Admin dondurma: portal diyalog/toast fontu (S2) | ölçülmedi | TASARIM/ADMIN, Sal |
| Sabit bayrak okumanın yeni kodu kapalıyken paketten çıkarması (S3) | ölçülmedi | TASARIM, Sal |
| Ajan verimi, PR hızı, URUN müdürü denetim kapasitesi | ölçülmedi | Ops (Çar–Per gözlem) |
| 19 karenin iç yerleşimi (site karşılığı), G/H kare kare eşleşme | ölçülmedi (envanter) | paket liderleri, Sal–Çar |
| 13 rozetli YARIM karenin anlamı; Design yanıt süresi (tek veri ~8–10 gün) | ölçülmedi | Design/Ops |
| "Design kendiliğinden tetiklenmez" kuralının bugünkü geçerliliği | ölçülmedi | Ops |
| Yeni rotaların (`arama`, `karsilastir`, `teklif-listesi`, senaryo, F4) adres şemasında yazılı olması | ölçülmedi | URUN, Sal |
| URUN'un adres işinin yazdığı rota dosyaları | ölçülmedi | URUN |
| OPS-71 ↔ B3b/B3c | ölçülmedi | Ops/URUN |
| i18n parça dosyalarının kapılarca görülmesi; I18N'in yöntemi kabulü | ölçülmedi | I18N, Sal |
| `vi.mock` ile bayrak kombinasyonu testi güvenilirliği; `next build` süresi | ölçülmedi | ALTYAPI, Sal |
| Vercel kota durumu (bugün) | ölçülmedi | ALTYAPI, Cmt |
| M8 taban sayıları (LCP/CLS, font bayt, JS payload) | bugün sayı yok | OLCUM, Sal |
| Recep'in önizlemeye erişim yöntemi | ölçülmedi | Ops |
| `INV-PAKET-SINIR-1`, `INV-GORUNUM-KAPALI-1`, anahtar matrisi kapı adları | öneri, ALTYAPI belirler | ALTYAPI |
| Çakışmasızlık: gelecekte açılacak yeni dosyalar | ölçülemez (kurucu kural + öneri kapı) | §3.3 sınır (i) |
| Bu belge işinde `pnpm test`/`lint`/`knip` | koşulmadı (yalnız belge) | — |

---

**ÖLÇÜM:** 2026-10-05 · master `fe2a7fa95`; ana depo bugünkü HEAD `74e50d280` (Ops/koordinatör bildirimi); çalışma ağacı tabanı `35224a3c5` (`fe2a7fa95`'in torunu). Bu belgenin sayıları çalışma ağacında üretildi: `git ls-files` 5042 (5028 + 14 sentetik yol) ve paket-glob kesişim betiği
(0 çakışma, 990 atanan mevcut dosya, vitrin alanı 487 / atanmayan 181); envanter tablosu betikle yeniden sayıldı (HAZIR 33 · YARIM 19 · "ölçülmedi" 19 · "VAR" 27); `src/config/features.ts` bayrak değerleri (`ADRES_SEMASI_K3B:130 = false`, `YENI_KABUK_GEZINMESI:58 = false`);
`e2e/reflow.e2e.ts` genişlikleri (320/768/1024/1280) · `DEPARTMAN-HARITASI.md` ve rol kartları · `execution-method-standard.md` §2–§4, §10 · `collaboration-protocol.md` §0.5, §1, §8.1 · v2.1 (`docs/plans/tasarim-kod-plani-v2.1-2026-10-05.md`) · girdi ölçüm notu H bölümü (karar 271, Vitrin 15A karar özeti, Ops onayları; **karar 271 ve Vitrin 15A özeti OPS aktarımıdır, doğrudan okunmadı**).
