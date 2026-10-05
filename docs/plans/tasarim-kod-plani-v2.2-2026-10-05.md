# Tasarım → Kod Planı v2.2 (2026-10-05, TASARIM) — TASLAK

> **DURUM: TASLAK — ONAYSIZ, UYGULANMAZ.** Bu belge `tasarim-kod-plani-v2.1-2026-10-05.md` planının yerine geçer; v2 ve v2.1 tarihçedir.
> **Hedef değişti:** v2.1 "11 Ekim'e yalnız Faz 2a" diyordu. Karar 271 (Recep 10-03; kaynak: OPS aktarımı "OPS geçmiş EK #42ca-cb", bu oturumda
> **DOĞRUDAN OKUNMADI**) 11 Ekim'i **TAM KAPSAM** yaptı: adres + YENİ GÖRÜNÜM (Design prototipi: Vitrin 15A / Menü v18), paralel ajanlarla; görünüm ve adres
> **AYRI anahtarla** açılır; 9-10 Ekim yerel önizlemede görünüm hazır değilse adres dilimi tek başına çıkar. Recep 10-05: "prototip hayata geçirilecek yapıyı
> temsil ediyor."
> **Bu belge v2.1'in ölçülmüş olgularını ve düzeltmelerini TEKRAR ETMEZ**; "v2.1 §x" diye atıf verir, yalnız değişeni yazar. Yalnız belgedir: kod, token, Tailwind,
> `index.css`, test dosyalarına dokunulmadı. Migration yok.
> **Adres işi TASARIM'ın değil URUN/ALTYAPI'nındır** (adres planı: `rec-adres-agac-tek-yayin-2026-09-07.md`, `rec-300-plan-tazeleme-2026-09-29.md`, `adres-semasi-standard.md`).
> Bu belge adres ölçütlerini **o planlardan alır ve yalnız takvime yerleştirir**; adres şemasını, adres ölçütlerini ve adres geri alma tarifini TASARIM belirlemez.

**KAYNAK / CETVEL:** v2.1'dekiler (marka-token-eslemesi, storefront-design, adres-semasi, CLAUDE.md 8/10/14, Kararlar 15A) + `execution-method-standard.md` (§2 karar
tablosu, §4 şerit sınırları, satır 486/491 eşzamanlı alt ajan sınırı, §10 müdür modeli) + `collaboration-protocol.md` (K0 worktree, §1 bir-iş-bir-dal, §8.1 ara push yasak) +
`docs/roller/*.md` (şerit dosya alanları) + `docs/audits/tasarim-envanteri-2026-09-25*.md` (52 kare / 33 HAZIR / 19 YARIM) + `src/config/features.ts` + `vercel.json` + karar 271 · 285.
**YÖNTEM:** §3.5. Plan = elle + bağımsız doğrulama; v2.2'nin ilk sürümü doğrulayıcı (DÜZELTME GEREKLİ) ve çürütücüden geçti, bu sürüm onların bulgularını işler (§9).

---

## 0 · v2.2 değişiklik özeti

1. **Üç anahtar** (§1): adres (`ADRES_SEMASI_K3B`, mevcut, **geri dönüşsüz**), kabuk (`YENI_KABUK_GEZINMESI`, mevcut), görünüm (`YENI_GORUNUM`, YENİ) + paket alt bayrağı.
2. **Takvim 5–11 Ekim gün gün** (§2): 6 Salı plan onayı + kapı + token/font; 7-8 paketler; 9 yerel önizleme kabulü; 10 düzeltme; 11 Pazar yayın (adres önce, görünüm sonra).
3. **Ekran işi paketlere bölündü** (§3): 52 kare + G(9) + H(6) → 19 satırlık paket tablosu; çakışmasızlık depoya karşı **ölçüldü** (0 çakışma). **10 kare yeni adres gerektirdiği için baştan "KOD YOK"** (§3.1, §5.3).
4. **9 Ekim kabul ölçütü** (§4): görünüm için 14 madde, **adres için ayrı M-A1..M-A8**; M2/M3/M7 çekirdek değil **tüm 54 vitrin sayfası** için.
5. **Yetişmezse düşen dilim** (§5): düşme sırası, Ops'un 9 Ekim akşamı karar kuralı, **Pazar günü adres kırmızı çıkarsa** tablosu.
6. **Gerçekçilik** (§6): güven yargısı açık yazıldı (11 Ekim tam kapsam: DÜŞÜK; adres tek başına: ORTA).

**v2.1'e göre değişen kararlar:**

| Konu | v2.1 | v2.2 | Gerekçe |
|---|---|---|---|
| §4 soru 1 (K36 kabuk) | Recep'e gidecek, öneri "EVET, kayıt yazım izni" | **Recep'e GİTMEZ — "karar 271 ile kararlı"** (kabuk anahtar arkasında yazılır) | Ops onayı 10-05; 271 kapsıyor |
| §4 soru 2 (hangi faz 11 Ekim'e) | Öneri: yalnız 2a | **Kararlı: TAM KAPSAM (271).** v2.1 §4 önerisi (yalnız 2a) geçersiz | Karar 271 |
| Galeri rotası çıkarımı, `token-turet.mjs` çıkarımı, `ds/` yolu | Ops'a bildirilecekti | **ONAYLI** (Ops 10-05) | — |
| ALTYAPI kapı emri (INV-PALET-1 4. kol) | "Ops'a talep" | Emri **Ops açar**; PR Salı sabah (§2) | — |
| Faz 2b görünüm dönüşü | Tek PR, değer doğrudan `:root`'ta çevrilir, Recep "olur" | **Anahtar arkasında:** `:root[data-gorunum='yeni']` kapsamlı üzerine yazma; "olur" = 9 Ekim yerel önizleme hükmü (§1.2) | Anahtar kapalıyken canlıda fark 0 şartı |
| Font | Serif/mono `preload: false` | **Üç aile `preload: false`**, açılış PR'ı Archivo'yu `true` yapar (§1.2) | Next 15.5.25 kaynağı: kullanılmasa da önyüklenir |
| Admin (v2.1 §2.3 öneri A: dahil) | A | **11 Ekim için B: dondur** (§1.4) | Prototip vitrindir; risk azaltır |
| Uzun metin ölçüsü | Design cevabı bekleniyordu | Kapandı (v2.1 §1.2, commit `228ace497`) | — |
| Faz 4(2) "adres yayınından sonra" | Ayrı yayın | **Aynı gün, ayrı anahtar, ayrı deploy, adres önce** (§5.3) | 271 + karar 118 |
| "Geri alma = bayrak `false` PR'ı" | Hem adres hem görünüm için | **Yalnız görünüm için.** Adres açılışı geri dönüşsüz (§5.4) | `features.ts:127-128`; adres planı §11 |
| Yeni sayfa rotaları (arama, karşılaştırma, senaryo, F4, teklif-listesi alt adresleri) | "Adres şemasında yazılı mı: ölçülmedi" | **Ölçüldü: yazılı DEĞİL** → baştan KOD YOK (§5.3) | `adres-semasi-standard.md` grep'i |

---

## 1 · Anahtarlar ve "anahtar kapalı = canlıda fark 0"

### 1.1 Anahtar kümesi

| Anahtar | Yeri | Durum | Yönettiği | Açan |
|---|---|---|---|---|
| `ADRES_SEMASI_K3B` | `src/config/features.ts:130` | `false` (10-05). **Yorum (`:127-128`): "AÇMA (Faz 3-C, tek PR, geri dönüşsüz adım): yalnız Faz 4 ön izlemesinde Recep 'gördüm, tamam' dedikten sonra (karar 68). Aynı PR eski-adres haritasını ve `next.config`'ten silinecek satırları taşır."** | Adres şeması (REC-300/442; URUN/ALTYAPI) | Ops (açılış PR'ı; adres planına göre) |
| `YENI_KABUK_GEZINMESI` | `src/config/features.ts:58` | `false`; 3 kilit testi `= false` bekliyor | Mobil alt sekme çubuğu + header "Teklif" paneli, **birlikte** | Ops |
| `YENI_GORUNUM` | `src/config/features.ts` (tek satır, **YENİ**) | yok → `false` doğar | Token/font/DS bileşen görünümünün tümü | Ops |
| Paket alt bayrakları | `src/config/gorunum/<paket>.ts` (YENİ, paket başına bir dosya) | `false` doğar | O paketin yeni yerleşimi | Ops (açılış PR'ı) |

Yeni görünüm = `YENI_GORUNUM && <PAKET>_GORUNUM`. Bayraklar **derleme sabitidir** (`features.ts` gerekçesi: `NEXT_PUBLIC_` unutulursa sessizce kapalı kalır).
**Bayrak okuma doğrudan sabitle yazılır** (`if (YENI_GORUNUM && ANA_GORUNUM)`), fonksiyon sarmalayıcıyla değil; amaç derleyicinin ölü dalı atmasıdır.
Bunun yeni bileşen kodunu kapalıyken paketten gerçekten çıkardığı **ÖLÇÜLMEDİ** → Salı spike S3 (§2).
**Anahtar asimetrisi (önemli):** görünüm anahtarı **geri alınabilir** (bayrak `false` PR'ı veri/adres etkisi yaratmaz); adres anahtarı **geri alınamaz** (§5.4). İki "açılış" aynı güvenlik sınıfında değildir.

### 1.2 Görünüm anahtarının mekanizması (v2.1 Faz 2b'nin değişen biçimi)

- **Renk:** `index.css` `:root` değerleri **değişmez**. Çevirme `:root[data-gorunum='yeni'] { --primary-navy: var(--marka-lacivert); --brand-cyan: var(--marka-turkuaz); … }`
  kapsamında yazılır; `data-gorunum` özniteliğini kök `layout.tsx` yalnız `YENI_GORUNUM` açıkken basar. Üzerine yazma değerleri **`var(--marka-*)` takma adıdır, literal değil**
  → yeni renk kaynağı açılmaz (cetvel §2; v2.1 §2.1). **Sonuç:** çakışan küme (v2.1 §2.2) 11 Ekim'de **boşalmaz**; `INV-TOKEN-PARITE-1` küme listesi açılıştan SONRA, eski değerleri
  silen temizlik PR'ıyla boşalır. Kapıya "küme yalnız `data-gorunum` kapsamlı üzerine yazmayla çözülüyor" kolu yazılır (ALTYAPI).
- **Yazı tipi — üç aile `preload: false` ile tanımlanır; açılış PR'ı yalnız Archivo'yu `true` yapar.** Gerekçe, kaynaktan okundu (Next **15.5.25**,
  `node_modules/next/dist/build/webpack/plugins/next-font-manifest-plugin.js` satır 58–80): eklenti, uygulama giriş noktasının modül grafiğindeki **her** `next-font-loader` modülünü tarar
  ve fontun render'da kullanılıp kullanılmadığına **bakmaz**; `preload: true` ile tanımlı font dosyaları (`.p.` adlı) manifest girdisine yazılır (satır 22–30: "preload true by default … `[name].p.[ext]`").
  Yani `layout.tsx`'te `preload: true` bir font, bayrak kapalıyken de **önyüklenir**. Manifest girdisinin HTML'de `<link rel=preload>` olarak basıldığı render tarafı **okunmadı**; bu yüzden
  S1 spike'ı "kaynaktan okundu; ölçüyle teyit edilir" diye yazılır. **Kalan bedel (kabul):** `preload: false` fontların `@font-face` CSS'i bayrak kapalıyken de CSS'e girer → CSS baytı/hash farkı **kabul**,
  `preload` bağlantısı ve font dosyası isteği **0** şartı (§4 M6). `body` sınıfı bayrağa göre **Inter ya da yeni aile**; `body` hem `inter.variable` hem `inter.className` taşıyor (`layout.tsx:42`), ikisi birlikte değişir.
- **Tuzak:** Tailwind `fontFamily.mono/serif` bağlanırken `var(--font-mono)` tanımsızsa `font-family: var(--font-mono), …` bildirimi geçersiz sayılıp özelliği sıfırlar;
  bu yüzden `var(--font-mono, <Tailwind varsayılan mono yığını>)` biçimi kullanılır ki kapalıyken `font-mono` (68 kullanım, v2.1 §2.3) **aynen eski yığını** versin.
  Kapalıyken `font-mono` computed `font-family` eşitliği **ölçülmedi** (S1 ile birlikte).

### 1.3 "Anahtar kapalı = canlıda fark 0" — tanım ve ölçüm

**Tanım:** ziyaretçinin gördüğü fark 0. Dosya baytı özdeş olmak **zorunda değil**: yeni bileşen CSS/JS'i ve `@font-face` CSS'i pakete girebilir (bütçelenir, §4 M8); **font `preload` bağlantısı ve font dosyası isteği 0** olmalıdır.
**İki ölçüm, ikisi de gerekli:**
1. **Statik:** paketin `git diff --numstat origin/master...HEAD` çıktısında, **zaten var olan** dosyalarda **silinen satır = 0**; mevcut dosyaya yalnız seçim satırı + import eklenir
   (`if (YENI_GORUNUM && X_GORUNUM) return <Yeni/>`), eski gövde dokunulmaz; yeni kod yeni dosyadadır. Komut PR raporuna sayı olarak yazılır. Kalıcı kapı önerisi `INV-GORUNUM-KAPALI-1`
   (ALTYAPI belirler).
2. **Dinamik:** tüm bayraklar `false` iken altı referans sayfada (ana, kategori, liste, ürün, Bilgi Merkezi, sepet) × {390, 1280} normalize sunucu HTML'i (build kimlikleri ve hash'li adresler
   ayıklanır) ve computed-style dökümü **master ile karşılaştırılır; fark 0**. Araç `e2e/gorunum/**` altında (OLCUM); bilerek-fark enstrümanı taşır (mevcut `e2e/reflow.e2e.ts` deseni: araç kasıtlı farkı GÖREMEZSE kırmızı).
   **Ara durumlar** (anahtar kısmen açıkken) §4 M6'da ayrıca tanımlıdır; "kapalı = fark 0" yalnız **tüm bayraklar kapalı** durumunu kapsar.

### 1.4 Admin (v2.1 §2.3'ü değiştirir): 11 Ekim için DONDUR

Gerekçe: Design prototipi vitrindir (Vitrin 15A / Menü v18); admin 11 Ekim hedefinde yok. Admin'i dahil etmek 19 `primary-navy` + 63 `font-mono` kullanımını (v2.1 §2.3, sabit yöntemle ölçüldü)
**ek bir QA yüzeyi** yapar. **Mekanizma (v2.1 §2.3 seçenek B), eksiksiz hâli:**
- **Renk/değişken:** `[data-admin-theme]` kapsamında `--primary-navy`, `--brand-cyan`, `--font-sans` eski değerlere sabitlenir.
- **Font-family (yalnız `--font-sans` yetmez):** kök `body` hem `inter.variable` hem **`inter.className`** taşır (`layout.tsx:42`); `className` `font-family`'yi doğrudan yazar ve `--font-sans`'ı atlar. Yeni fontlar bayrakla `body`'ye geçince admin'in `font-family`'si de değişir.
  Admin yerleşimi bu yüzden kendi Inter nesnesinin `className`'ini ve `variable`'ını taşır (`src/app/admin/layout.tsx`).
- **Kim yazar:** `index.css` `[data-admin-theme]` satırları TOK dosyasıdır → **TOK (TASARIM) yazar, ADMIN onaylar**; `src/app/admin/layout.tsx` ADMIN'in dosyasıdır → emir ADMIN müdürüne gider, ADMIN yazar.
- **Bedel:** Inter admin için yüklenir ("Inter 0" ölçütü vitrin köküyle sınırlı, v2.1 §2.5 istisna listesine "admin yerleşimi" eklenir); açılıştan sonra admin'in DS'e geçişi ayrı ADMIN kararı.
**Bilinmeyen (ÖLÇÜLMEDİ):** portal ile gövdeye basılan admin diyalog/toast'ların (kök `body`) yeni fontu alıp almadığı; Salı spike S2 ölçer. **Karar sahibi ADMIN şeridi** (Ops taşır); Salı 12:00'ye kadar karar yoksa varsayılan **dondur**.

---

## 2 · (a) Takvim — 5–11 Ekim (bugün 5 Ekim Pazartesi)

**Süre etiketi:** depoda ölçülmüş ajan verimi/PR hızı **yok**; süreler **tahmin**dir, Ops'un verdiği tarih çerçevesinden geriye dağıtılmıştır, taahhüt değildir.
Dal öneki departmandır (`tasarim/*`, `urun/*`, `satis/*`, `i18n/*`, `altyapi/*`); K-1 komutu yalnız `tasarim/*` için (v2.1 §3).
**Design girdisi KESİMİ:** Design'a bağlı kareler (§3.1: A4+F3, A6, A8, A9) için son cevap günü **Çar 12:00** (öneri; Ops teyit). Sonra gelen cevap **kodlanmaz** (11 Ekim sonrasına); cevap gelmeyen kare eski bileşen + yeni tokenla kalır.

| Gün | Ne biter | Kim | Ölçü (kanıt) | Süre |
|---|---|---|---|---|
| **5 Pzt** (bugün) | (1) v2.2 → doğrulayıcı → Ops. (2) **Design'a soru dosyası** (§6.3) TASARIM hazırlar, OPS gönderir; **kesim Çar 12:00**. (3) ALTYAPI kapı emri (INV-PALET-1 4. kol, v2.1 §2.1) Ops açar. (4) Paket kartları + `YÖNTEM:` satırı + claim'ler (§3.2 globları) Ops açar. (5) ADMIN'e dondurma sorusu (Ops). (6) **Recep'e adres sorusu** (§5.3: arama/karşılaştırma/senaryo/F4/teklif-listesi alt adresleri) Ops taşır; kesim Çar 12:00 | TASARIM, Ops | Doğrulayıcı hükmü; açılan kart sayısı = §3.2 satır sayısı (19); claim tablosu `board.cjs who` ile | akşam |
| **6 Sal** — **sıra önemli** | **09:00 S1 spike (font manifest/`preload`, §1.2) ÖNCE koşar — sonucu font tanımını geçersiz kılabilir; S3 (ölü dal) yanında.** Paralel: **ALTYAPI** INV-PALET-1 4. kol PR'ı (sabotaj (a)–(d)) → öğleye merge; **ALTYAPI** `package.json`: Lighthouse bağımlılığı kararı (§4 M8); **OLCUM** yalnız **fark-0 koşucusu + enstrümanı** (§1.3; "bayrak kapalı ilk koşu" bunu ister); **VARLIK** `public/brand` SVG; **I18N** sözlük iskeleti. **Öğleden sonra TOK:** Faz 2a PR'ı (v2.1 §2.5 Faz 2a adım 2–8; DS 66 adı) + `src/config/gorunum/index.ts` + `features.ts` tek satır (`YENI_GORUNUM`) + S2 spike. **DS:** PR-1 başlar (3 çalışan). Paketler dal açar. **ADRES (URUN, ayrılmış kapasite):** adres önizleme paketi hazırlığı + Faz 1-B/3-C durum ölçümü (09-29'dan sonraki ilerleme **ölçülmedi**) | TASARIM, ALTYAPI, I18N, URUN | INV-PALET-1 sabotaj 4/4; K-1 komutu 0; fark-0 aracı kendi enstrümanıyla çalışır + **ilk koşu**; S1/S2/S3 sonuçları; `type-check` · `lint` · `test -- --run` yeşil. **INV-TOKEN-PARITE-1 (ALTYAPI) Salı akşam ya da Çar sabah — kayma riski var (tahmin)**; font tanımı PR'ı S1 sonrası, **Çar sabah** | yük yüksek; **tahmin: Salı'ya sığmayanlar Çar sabahına kayar** |
| **7 Çar** | **Sabah:** font tanımı + Faz 2b anahtarlı çevirme (§1.2) merge; PARITE kapısı (kaydıysa). **12:00 Design/adres-kararı KESİMİ.** DS PR-2 (TeknikTablo, KarsilastirmaTablosu, AdetKontrolu, KatliCagriSatiri) ve PR-3 (PQEgrisi). **KABUK, ANA, LISTE, URUNSAYFA, TEKLIF(B9/B9b)** kodlama; **ölçüm araçları** (§4 tablosu: reflow genişletme, kontrast, axe kablolama). **SOZLUK dalgası #1 (öğle).** **Master dalgası 17:00** (yalnız kapalı-bayraklı, kapıları yeşil; günde en çok 2) | TASARIM, URUN, SATIS, I18N | DS: bileşen başına Vitest render + axe 0; her paket PR'ında §1.3 statik ölçü; dalga sonrası fark 0 yeniden koşulur | tahmin |
| **8 Per** | **Kod-tamam hedefi.** İkincil paketler (BILGI, SECICI) bugün biter ya da düşme adayıdır. **SOZLUK dalgası #2 (sabah), #3 (18:00 son).** **TOK dondurma 18:00** (§3.4). **Yerel önizleme dalı:** master + tüm bayraklar `true` tek commit, **push EDİLMEZ**. **İlk tam ölçüm turu** (OLCUM, akşam) | tümü | Ölçüm raporu v0 (§4'ün ilk koşusu); kırmızı listesi paket sahiplerine | tahmin; en sıkışık gün |
| **9 Cum** | **09:00 SOZLUK dalgası #4 (son; düzeltme anahtarları)**. **12:00 kod dondurma** (yalnız kırmızı düzeltme). 12:00–15:00 **bağımsız doğrulayıcı ölçümü** (§10.3) → rapor v1. **15:00–18:00 Recep yerel önizlemeleri — iki AYRI blok** (öneri, Ops'a bırakılır): **(1) ADRES önizlemesi** (karar 68/161: adres planı Faz 4 gezinme listesi; "gördüm, tamam" ayrı kaydedilir), **(2) GÖRÜNÜM önizlemesi** (M14; ara durum "yalnız token+font" da gösterilir, §5.2). Gerekçe: iki karar iki ayrı anahtardır, onayları da ayrı olmalı; aynı oturumda ama ayrı hüküm. **Akşam: Ops kararı** (§5.2) | TASARIM + doğrulayıcı, URUN/ALTYAPI (adres), Recep, Ops | §4 (M1–M14) + adres ölçütleri (M-A1..M-A8) | tahmin |
| **10 Cmt** | **Yalnız kırmızı düzeltme + ilgili M ölçümünün yeniden koşulması** (kabul sonrası başka değişiklik yok). Yayın hazırlığı: açılış PR'ları **draft**; **açılış kombinasyonu** (Cuma'da onaylanan alt küme) ayrıca `pnpm build` + M2/M3/M6/M7/M9 yeniden — Cuma önizlemesi "hepsi `true`" dalıydı, açılış kombinasyonu ondan **farklı olabilir** (düşen paket `false`); Recep'in görmediği kombinasyon yayınlanmaz → Ops, farkı Recep'e yazar (yeniden onay gerekir mi kararı Ops'ta); **görünüm geri alma provası** (bayrak `false` PR'ı yerelde build); **adres açılış kontrol listesi** (§4 M-A) URUN/ALTYAPI'dan; canlı ölçüm komut seti; Vercel merge kapasitesi kontrolü (ALTYAPI) | TASARIM, URUN, ALTYAPI, Ops | Yayın kontrol listesi yeşil; açılış kombinasyonu build + M ölçümleri yeşil | tahmin |
| **11 Paz** | **ADRES ÖNCE (adres planı "YAYIN GÜNÜ listesi", `rec-300-plan-tazeleme` §4):** Faz 1-B merge (Recep "şimdi yap"; **migration → prod DB, kural 13**) → canlı ölçüm (40 eski aile adresi tek 308) → Faz 3-C merge → deploy → yayın ölçümü → IndexNow + GSC. **Yeşilse GÖRÜNÜM:** açılış PR'ı → deploy → canlı ölçüm (6 referans sayfa, CSS hash `curl` 3 ISR adresi, Lighthouse). Gözlem; **Pazar adres kırmızıysa tablo §5.2**. Adres adımlarının toplam süresi **ölçülmedi** (adres planında yalnız "pencere dakikalarla sınırlı" yazılı) | URUN/ALTYAPI/GEO-SEO (adres), TASARIM (görünüm), Ops, **Recep (Faz 1-B onayı)** | Adres: ana plan §7 ölçümü; görünüm: canlı ölçüm raporu | tahmin; **tek günde ikisi sığmayabilir** |
| **11 Ekim sonrası** | OPS-71 (karar 285, **kod 11 Ekim'den sonra, ÜRÜN ile**); eski değerleri silen temizlik PR'ı; Faz 5 borç eritme (INV-BORC-MANDAL-1; "aynı değişiklik çok hedef" → **maestro** uygun, §3.5); admin'in DS'e geçişi (ADMIN kararı); "KOD YOK" paketler adres kararıyla (§5.3); Design cevabı kesimden sonra gelen kareler | URUN, TASARIM, ADMIN | — | — |

**v2.1 faz tablosu ile eşleme:** ön koşul (kapı) → Sal sabah · Faz 2a → Sal · Faz 3 (DS) → Sal–Çar · Faz 2b → Çar (ölçüm Per) · Faz 1 (kabuk) → Çar–Per, anahtar `YENI_KABUK_GEZINMESI` ·
Faz 4 (sayfalar) → paketler Çar–Per, anahtar paket bayrağı · Faz 5 → 11 Ekim sonrası. **Sapma gerekçesi:** 2b anahtarlı olduğundan merge'ü Çarşamba'ya (ölçümü Perşembe'ye) koydum; font tanımı S1'e bağlı olduğu için Salı değil Çar sabah.

---

## 3 · (b) Ekran işinin paralel bölümü

### 3.1 Kare → paket (envanter: 52 kare, 33 HAZIR / 19 YARIM; G=9 alt kare; H=6 alt kare)

| Paket | Kareler (HAZIR / YARIM) | Sayı H/Y | Durum |
|---|---|---|---|
| **KABUK** | A1 A2 A3 A4 A5 B2 D1 D2 E1 / A0 A2b A5b A6 A7 F3 + G: M1 M3 M4 M5 M8 M9 | 9 / 6 | **Design'a bağlı:** **A4 + F3** (T-1: karede çözülmemiş `{{ u3Rozet }}`; K37-c "U3 = PANEL" karar verildi, kare güncellenmedi; A4 "panel vs sayfa" aynı soru) · **A6** (T-5 açık karar) |
| **DS + VARLIK** (TASARIM) | — / A8 A9 | 0 / 2 | **Design'a bağlı:** **A8** ("onay bekler") · **A9** ("öneri, ret gelirse silinir") |
| **ANA** | B1 | 1 / 0 | — |
| **LISTE** | B3 B3b B3c B4 B5 B5b C3 / B1b + G: M2 | 7 / 1 | OPS-71 ile B3b/B3c ilişkisi **ölçülmedi** (§5.3) |
| **URUNSAYFA** | B6 B7 B7b B7c B7d B7e / B7v B7f + G: M7 | 6 / 2 | B7v: tasarım "aynı adreste seçilir" ↔ kod 308 `?sku=` (adres kararı URUN'un) |
| **TEKLIF** (SATIS) | **kod yazılacak:** B9 / B9b (mevcut `/cart` adresinde yeniden çizim) + G: M6. **KOD YOK:** B10 B11 (yeni adres). H: S1–S6 (K1 kapalı bekler) | 1 / 3 | B10/B11 **adres kararı gelene dek KOD YOK** |
| **ARAMA** | D3 D4 / D5 | 2 / 1 | **KOD YOK — yeni adres kararı yok** (§5.3). D1/D2 (header overlay) KABUK'ta |
| **KARSILASTIRMA** | B8 B8b | 2 / 0 | **KOD YOK — yeni adres kararı yok**; B8 ayrıca "bayat" (alan kümesi) |
| **SECICI** | E2 / E3 | 1 / 1 | Mevcut `urun-secici` adresi |
| **BILGI** | **kod yazılacak:** F1 F2. **KOD YOK:** F4 | 2 / 1 | F4 sayfası sitede yok; **yeni adres kararı yok** |
| **SENARYO** | C1 C2 | 2 / 0 | **KOD YOK — yeni adres kararı yok**; ayrıca etiket verisi 0 |
| **KAPSAM DIŞI** | — / B12 F5 | 0 / 2 | **B12** (K62 ERTELENDİ) · **F5** (giriş/kayıt; Google OAuth ölçülmedi) |
| **Toplam** | | **33 / 19 = 52** | |

Sayım `docs/audits/tasarim-envanteri-2026-09-25-menu.md` tablosundan betikle yeniden üretildi (HAZIR 33, YARIM 19 [18 satır + F3'ün `**YARIM — açık karar**` biçimi]). Envanter ayrıca **27 kareyi "yapısal çelişki"** (çoğu adres) ve **19 karede site karşılığını "ölçülmedi"** işaretliyor
(A0 A1 A2 A2b A3 A5b B2 B5 B5b B7 B7c B7d B7e B7f B9b C1 C2 E1 F2). G (9) ve H (6) başlık düzeyinde okundu, kare kare eşleşme **ölçülmedi**.

**Kod kapsamı sayıları:** 52 kareden **10 kare baştan KOD YOK** (adres kararı: D3 D4 D5 · B8 B8b · C1 C2 · F4 · B10 B11) ve **2 kapsam dışı** (B12, F5) → **40 kare koda girebilir**; bunlardan **5'i Design girdisine bağlı** (A4, F3, A6, A8, A9) → **35 kare hemen girilebilir**; 35'in içinde 9 "rozetli" YARIM kare var (A0 A2b A5b A7 B1b B7v B7f B9b E3; rozetin anlamı **ölçülmedi**).

**ÇEKİRDEK — TEK TANIM (başka yerde yeniden tanımlanmaz):** çekirdek paketler = **TOK/font · DS · KABUK · ANA · LISTE · URUNSAYFA**. Çekirdek **ölçüt kümesi** = **17 kare** (A1–A5, B1, B2, B3, B3b, B3c, B4, B5, B6, B7, B7b, B7d, B7e) + G'nin **8 alt karesi** (M1–M5, M7–M9).
Çekirdek-dışı kareler (A0, A2b, A5b, A6, A7, D1, D2, E1, F3, B1b, B5b, C3, B7c, B7v, B7f) çekirdek paketi düşürmez: kare bazında "eski kalır". **Çekirdeğin 3 karesi dış koşula bağlıdır:** A4 (Design cevabı, kesim Çar 12:00) ve B3b/B3c (OPS-71 ile ilişkisi ölçülmedi);
bunlar çıkarsa çekirdek ölçüt kümesi **14 kareye** iner (§4 M1). Çekirdek dışındakiler (TEKLIF, SECICI, BILGI, H, KARSILASTIRMA, ARAMA, SENARYO) **ikincil**dir.

### 3.2 Paket tablosu (departman, dosya alanı, bayrak, bağımlılık)

Departman önerileri gerçek şeritlerdendir (`DEPARTMAN-HARITASI.md`). **TASARIM yalnız tasarım sistemi + ölçümdür; sayfa/rota/adres/veri/SEO/kabuk dosyaları URUN'un (rol kartı) — sınır korunur.**
Paralellik **ikiz şerit açarak değil** (§4 şerit sınırları), müdür içi **ekip lideri + çalışan** ile sağlanır (§10.1); canlı müdür penceresi **3**: TASARIM, URUN, SATIS.

| Paket | Departman (müdür) | Ajan önerisi (tahmin) | Dosya alanı (glob; her tek-dosya globu **eşlik `.md` ve colocated test**ini de kapsar, §3.3) | Alt bayrak | Sıra / bağımlılık |
|---|---|---|---|---|---|
| **TOK** | TASARIM | 1 çalışan + müdür | `src/design-system/**` · `src/index.css` · `tailwind.config.js` · `src/app/layout.tsx` · `src/config/gorunum/index.ts` | `YENI_GORUNUM` | Sal; 18:00 Per dondurulur |
| **DS** | TASARIM | 3 çalışan (DS-A: AnaEylemDugmesi CerceveliDugme Cip Kart HukumKutusu · DS-B: TeknikTablo KarsilastirmaTablosu AdetKontrolu KatliCagriSatiri · DS-C: PQEgrisi) | `src/components/ds/**` | — | TOK'tan sonra; PR-1 (DS-A) Sal, PR-2 (DS-B) Çar, **PR-3 (DS-C: PQEgrisi) Çar** |
| **VARLIK** | TASARIM (claim Ops'tan) | 1 çalışan | `public/brand/**` | — | Sal; KABUK'tan önce |
| **KABUK** | URUN | lider A + 2 çalışan | `src/components/{StickyHeader,Footer,MegaMenu,SearchOverlay,LanguageSwitcher}.tsx` · `src/components/layout/**` · `src/components/navigation/**` · `src/app/not-found.tsx` · `src/views/NotFoundView.tsx` · `src/config/gorunum/kabuk.ts` | `YENI_KABUK_GEZINMESI` **ve** alt bayrak | VARLIK + DS-PR1 |
| **ANA** | URUN | lider A + 1 çalışan | `src/views/HomePage.tsx` · `src/components/home/**` · `src/config/gorunum/ana.ts` | `ANA_GORUNUM` | `ProductCard` LISTE'den |
| **LISTE** | URUN | lider B + 2 çalışan | `src/views/category/**` · `src/views/{CategoryMasterView,CategoryPage,ProductsDiscoveryView,ProductsPage}.tsx` · `src/components/category/{CategoryFilters,CategoryShowcase,CategoryAuthoritySection,EducationalGuide}.tsx` · `src/components/category/sections/**` · `src/components/ProductCard.tsx` · `src/components/products/{FamilyCard,ProductsHero,ProductsSkeleton}.tsx` · `src/app/_components/{kategoriSayfasi,urunlerSayfasi}.tsx` · `src/config/gorunum/liste.ts` | `LISTE_GORUNUM` | `ProductCard` yeni varyantı **Çar öğle** |
| **URUNSAYFA** | URUN | lider B + 2 çalışan | `src/app/_components/{ProductDetailPageView,aileSayfasi}.tsx` · `src/components/products/{VariantSelector,AileKirintisi,AddToProjectModal,RichTextRenderer}.tsx` · `src/components/{QuickViewModal,ImageGallery}.tsx` · `src/config/gorunum/urun.ts` | `URUN_GORUNUM` | **DS-PR2 (TeknikTablo, KatliCagriSatiri) ve DS-PR3 (PQEgrisi)** |
| **SECICI** | URUN | lider B + 1 çalışan | `src/components/category/{EnhancedNeedsWizard,NeedsAnalysisWizard,SilentFanWizard}.tsx` · `src/config/gorunum/secici.ts` | `SECICI_GORUNUM` | `urun-secici/page.tsx` içeriğini `views/`e taşıma ROTA'dan (§3.4) |
| **TEKLIF** | **SATIS** (teklif modülü sahibi; Ops teyit) | lider (SATIS müdürü) + 2 çalışan | `src/views/{CartPage,CheckoutPage,PaymentSuccessPage}.tsx` · `src/views/checkout/**` · `src/components/AddToCartToast{,Content}.tsx` · `src/config/gorunum/teklif.ts` | `TEKLIF_GORUNUM` | DS-PR2 (AdetKontrolu); yalnız B9/B9b/M6; B10/B11 KOD YOK |
| **BILGI** | URUN | lider C + 1 çalışan | `src/views/knowledge/**` · `src/views/support/**` · `src/config/gorunum/bilgi.ts` | `BILGI_GORUNUM` | F1/F2; F4 KOD YOK |
| **ARAMA · KARSILASTIRMA · SENARYO** | URUN | **atanmış lider/çalışan YOK** — adres kararı gelirse lider C açar | `src/views/arama/**` · `src/views/karsilastirma/**` · `src/views/senaryo/**` · ilgili `src/config/gorunum/*.ts` | alt bayraklar | **"karar gelirse" koşulu:** Çar 12:00 kesimine kadar adres kararı + route açılışı (ROTA) yoksa 11 Ekim sonrası |
| **ROTA/ADRES** (tek sahip) | URUN (adres işinin sahibi) | müdür + ayrılmış adres kapasitesi (§3.5) | `src/app/[lang]/**` · `src/app/_components/markaSayfasi.tsx` · `src/app/{sitemap,robots}.ts` · `src/config/features.ts` · `src/utils/{routes,adresUret,yuzeyAdresleri,applicationLinks}.ts` · `src/hooks/useLocalizedRoutes.ts` · `src/lib/adres/**` · `src/lib/seo/**` · `src/lib/data/productRoute.ts` · `src/middleware.ts` · `next.config.mjs` | — | Paketler bu alana **dokunmaz** |
| **SOZLUK** (tek sahip) | I18N | müdür | `src/i18n/dictionaries/{tr,en}.ts` (tek satır) · `src/i18n/dictionaries/gorunum/index.ts` | — | §3.4 |
| **SOZLUK-PARCA** | paket sahibi | — | `src/i18n/dictionaries/gorunum/<paket>.{tr,en}.ts` | — | Kendi paketinin parçası |
| **KAPI** | ALTYAPI | müdür | `src/__tests__/conformance/**` · `package.json` · `pnpm-lock.yaml` · `.github/workflows/**` | — | Sal sabah |
| **OLCUM** | TASARIM | 1 çalışan + bağımsız doğrulayıcı | `e2e/gorunum/**` · `docs/audits/yeni-gorunum-*` · `docs/plans/tasarim-kod-plani-v2*` | — | Sal'dan itibaren |
| **ADMIN** (dondurma) | ADMIN | müdür | `src/app/admin/**` (yalnız dondurma, §1.4) | — | ADMIN kararı Sal 12:00 |

Ekip liderleri `general-purpose` alt ajandır (§10.1): lider A = KABUK+ANA; lider B = LISTE+URUNSAYFA+SECICI; lider C = BILGI (+ karar gelirse ARAMA/KARSILASTIRMA/SENARYO).
Her lider kendi çalışanlarını açar, denetler, bağımsız doğrulayıcı çalıştırır, müdüre **tek özet** döner; merge müdürdedir.

### 3.3 Çakışmasızlık kanıtı (depoya karşı ölçüldü)

**Yöntem:** `git ls-files` (5029 izlenen dosya, bu belgenin eklendiği çalışma ağacı) + **picomatch 4.0.4** ile §3.2 globları; her dosya için kaç paketin globuna girdiği sayıldı. Tek-dosya globları için **eşlik kuralı** uygulandı:
`<ad>.md` (orion-doc eşlik dosyası), `<dizin>/<ad>.test.*`, `<dizin>/__tests__/<ad>.*` ve `<dizin>/__tests__/<ad>*.test.*` aynı pakete aittir (ilk sürümdeki "dizin kapsamındadır" cümlesi **yanlıştı**: tek-dosya globu eşlik dosyasını ve `src/components/__tests__/Footer.test.tsx` gibi colocated testi yakalamıyordu; düzeltildi, `Footer.test.tsx → KABUK` ve `Footer.md → KABUK` doğrulandı).

| Ölçüt | Sonuç |
|---|---|
| ≥2 pakete giren dosya | **0** |
| Bir pakete atanan **mevcut** dosya (eşlik + colocated test dahil) | **861** (KAPI 381 · ROTA/ADRES 184 · LISTE 67 · ADMIN 54 · KABUK 50 · TEKLIF 40 · ANA 27 · BILGI 19 · URUNSAYFA 16 · TOK 8 · SECICI 8 · SOZLUK 4 · OLCUM 3) |
| Sentetik "yeni dosya" yolları (14) | hepsi **tam 1** pakete düştü (`ds/Kart/Kart.tsx→DS`, `public/brand/…→VARLIK`, `views/arama/…→ARAMA`, `config/gorunum/ana.ts→ANA`, `config/gorunum/index.ts→TOK`, `dictionaries/gorunum/ana.tr.ts→SOZLUK-PARCA`, `…/index.ts→SOZLUK`, `e2e/gorunum/…→OLCUM`, `[lang]/arama/page.tsx→ROTA/ADRES` …) |
| Vitrin alanı (`components/views/app/contexts/hooks`, `.md` ve test hariç) | 482 dosya; **hiçbir pakete atanmayan 284** — bunların 107'si yolunda `admin` geçen (ADMIN şeridinin alanı, plan kapsamı dışı), **177'si admin dışı** (46'sı `components/products/3d/**`, K-4 kapsam dışı; `views/legal` 18, `views/account` 14, `components/calculators` 6, `views/calculators` 4, `components/ui` 4, `components/authority` 4 …) |

**Düzeltme kaydı:** ilk sürümde "990 atanan" yazıyordu; bu sayı betiğin ADMIN globunun belgedekinden geniş olmasından (3 dizin yerine yalnız `src/app/admin/**`) doğan **hataydı**; doğrulayıcı belgedeki globlarla **737** buldu (KAPI 381, ROTA 108, ADMIN 54, KABUK 40, TEKLIF 35, LISTE 53, ANA 26, BILGI 19, URUNSAYFA 8, TOK 7, SECICI 3, SOZLUK 2, OLCUM 1). Bu sürümde globlar genişletildi
(ROTA/ADRES'e `useLocalizedRoutes.ts`, `adresUret.ts`, `yuzeyAdresleri.ts`, `applicationLinks.ts`, `src/lib/adres/**`, `src/lib/seo/**`, `productRoute.ts`, `sitemap/robots`; eşlik/test kuralı) ve **861** olarak yeniden sayıldı; "0 çakışma" korundu.

**Kural:** atanmayan dosyaya hiçbir paket PR'ı dokunmaz; ihtiyaç → **"paylaşılan dosya talebi"**. Her PR raporuna: `git diff --name-only origin/master...HEAD` çıktısının **tümü** paketin globlarına (eşlik/test dahil) uymalı. Kalıcı kapı **öneridir** (`INV-PAKET-SINIR-1`, ALTYAPI belirler).
**Sınırlar:** (i) globlar mevcut dosya ve sentetik yollara karşı denendi, **gelecekte açılacak her dosya** için değil — yeni dosya adı kuralı (`views/<paket>/**`, `config/gorunum/<paket>.ts`, `gorunum/<paket>.{tr,en}.ts`) çakışmayı kurucu olarak engeller ama bunu bir kapı doğrulamıyor; (ii) **dosya içi** çakışma bu yöntemle değil "tek sahip" kuralıyla (§3.4) önlenir.

### 3.4 Paylaşılan dosyalar — TEK SAHİP ve sıra kuralı

| Dosya | Tek sahip | Kural |
|---|---|---|
| `tailwind.config.js` · `src/index.css` · `src/design-system/tokens.js` · **`src/app/layout.tsx` (kök)** | **TOK (TASARIM)** | Salı'da DS'in **66 adının tamamı** tek PR'da; paketler **token talebi** (ad + gerekçe) TASARIM'a yazar. **Per 18:00'da dondurulur**; sonrası yalnız kırmızı düzeltme. Paketler dokunmaz |
| `src/config/features.ts` | **ROTA/ADRES (URUN)** | `YENI_GORUNUM` satırını Salı **tek PR**'da TASARIM ekler (Ops izniyle); sonra **kimse** düzenlemez; açılış PR'ını Ops açar |
| `src/config/gorunum/<paket>.ts` | Paket sahibi | Dosya paket başına ayrı; `index.ts` TOK'un |
| `src/i18n/dictionaries/{tr,en}.ts` | **SOZLUK (I18N)** | Sözlük `gorunum` kökü **tek satır** (Salı iskelet). Paketler yeni anahtarı **kendi parça dosyalarına** yazar (`dictionaries/gorunum/<paket>.{tr,en}.ts`). **ÇELİŞKİ (adlandırıldı):** `docs/roller/I18N.md:15` "tr.ts'i fiilen düzenleyen URUN" ve `:18` "ajanlar sözlüğe yazmaz, müdür merkezi birleştirir"; bu plan "tek sahip SOZLUK" diyor ve paket ajanlarının parça dosyasına yazmasını öneriyor. **Sapma talebi I18N müdürüne**; kabul edilmezse yerine **yalnız merkezi birleştirme dalgaları** geçerli |
| **Sözlük dalgaları ↔ paket PR'ı zamanlaması** | I18N | Paket PR'ı kendi anahtarları olmadan `i18n-key-resolution`/`dead-key` kapılarında **kırmızı kalır**. Dalgalar: **Çar öğle (#1), Per sabah (#2), Per 18:00 (#3), Cum 09:00 (#4, son)**; paket PR'ı anahtarlarını **bir sonraki dalgadan önce** I18N'e iletir; parça dosyası yöntemi kabul edilirse anahtar PR'la birlikte gider ve dalga yalnız doğrulama olur. Cuma 09:00'dan sonra yeni anahtar yok |
| `src/components/ProductCard.tsx` | **LISTE** | ANA/URUNSAYFA yalnız içe aktarır; yeni varyant **Çar öğle** |
| `src/components/ds/index.ts` (barrel) | **DS** | Tüketici paketler barrel'den içe aktarır |
| `src/utils/routes.ts`, `useLocalizedRoutes.ts`, `adresUret.ts` | **ROTA/ADRES** | Yeni rota girişi talebi ROTA'ya; paketler manuel `/tr/` yazamaz (kural 7) |
| **`src/app/[lang]/**` (rota dosyaları)** | **ROTA/ADRES** | Paketler rota dosyalarına **dokunmaz**; seçim (eski/yeni) görünüm bileşeninin **içinde** yapılır. (Kök `src/app/layout.tsx` ROTA'nın değil **TOK'un**: ilk sürümdeki "`src/app/**` ROTA" cümlesi bununla çelişiyordu, düzeltildi.) İçeriği `page.tsx`'te duran sayfa (ör. `urun-secici`) için içeriğin `views/`e taşınması ROTA'dan istenir |
| **`ADRES_SEMASI_K3B`'yi doğrudan okuyan 4 görünüm dosyası:** `src/app/_components/kategoriSayfasi.tsx` (LISTE) · `aileSayfasi.tsx` ve `ProductDetailPageView.tsx` (URUNSAYFA) · `src/components/home/ApplicationSolutions.tsx` (ANA) | **Dosya içi: ADRES işi önce** | URUN'un adres işi bu dosyalara paralel dokunur → **sıra:** adres PR'ı master'a **önce** iner; görünüm paketi bu dosyalarda yalnız **ayrı yeni dosya + seçim satırı** ekler ve adres PR'ından **sonra rebase** eder; seçim satırı adres bayrağı bloğundan ayrı yerde durur. Adres işinin bu dosyalara hâlâ dokunup dokunmayacağı **ölçülmedi** (09-29 durum tablosunda 3d "Bitti"); dokunmayacaksa kural kendiliğinden boşalır |
| `src/components/StickyHeader.tsx` vb. (KABUK) | **KABUK** | `HeaderTeklifPaneli` sepet sayısını `CartContext`'ten **yalnız okur** |
| `public/brand/**` | **VARLIK** | Salı biter; KABUK logoyu oradan okur (K23) |

**Sıra özeti:** KAPI(Sal) → TOK(Sal; font Çar sabah) → {DS-PR1, VARLIK, SOZLUK iskelet}(Sal) → {DS-PR2/3, LISTE `ProductCard`}(Çar) → {KABUK, ANA, URUNSAYFA, TEKLIF, SECICI, BILGI}(Çar–Per) → OLCUM(Per akşam).

### 3.5 Yöntem (execution-method-standard §2/§3), sapma ve kapasite

**YÖNTEM:** *şerit (TASARIM, URUN, SATIS) + şerit içi ekip lideri/çalışan (§10), paket başına ayrık dosya alanı, her paket çıktısı bağımsız doğrulayıcıdan geçer (§10.3); maestro ve Workflow bu iş için KULLANILMAZ.*
**Gerekçe (karar tablosu):** (i) "Aynı yapısal değişiklik çok hedefe → maestro" satırının **kullanılmaz** koşulu "hedefler birbirinden farklı → şerit içinde sıralı": ekran paketleri farklı hedeflerdir. (ii) Pratik tavan 2–3 canlı şerit + şerit içi alt ajan + lider (§4); ikiz şerit yok.
(iii) Workflow kullanıcı opt-in'i ("workflow kullan") ister; açmayı Ops yapar. **Sapma (yazılı):** Ops'un "maestro/Workflow" ifadesi bu cetvelle örtüşmüyor; kural satırına uyuldu. **Maestro'nun yeri:** 11 Ekim **sonrası** Faz 5 (`rounded-*` 1.527, `shadow-*` 555 kullanımı). **Workflow'un yeri (Ops opt-in verirse):** 9 Ekim ölçüm turunun çok-eksenli bağımsız çürütmesi.

**Kapasite sınırları (kaynak: `execution-method-standard.md:486,491`, ARAÇ 09-30 ölçümü):** eşzamanlı alt ajan **20** — iç içe olanlar ve **liderler dahil, oturum genelinde** sayılır; aşan çağrı "Concurrent subagent limit reached" ile **reddedilir ve kuyruğa girmez**.
- **URUN penceresinde aynı anda en çok 16 ajan, dalga dalga** (öneri): §3.2'ye göre 3 lider + 9 çalışan = 12; bunun 4 slotu **adres işine ayrılmıştır** (ROTA/ADRES çalışanı/doğrulayıcısı); bağımsız doğrulayıcılar dalgalar arasında koşar, aynı anda değil. Reddedilen çağrı yeniden denenir (kuyruk yok).
- **Adres/ROTA işine AYRI kapasite ve AYRILMIŞ GÜN:** Cmt–Paz URUN müdürü **yeni görünüm paketi açmaz**, yalnız adres açılışı + düzeltme; Çar–Per'de adres hazırlığı yukarıdaki 4 slottan yürür.
- **TASARIM penceresi:** TOK 1 + DS 3 + VARLIK 1 + OLCUM 1 + doğrulayıcı 1–2 = 7–8. **SATIS:** lider + 2.
- **Yerel makine kaynağı (eşzamanlı worktree + `pnpm install` + `build`/`test`):** `pnpm install --frozen-lockfile --offline` disk maliyeti ~0 (CLAUDE.md, karar 88); **eşzamanlı build/test sayısının CPU/bellek sınırı ÖLÇÜLMEDİ** ("bu makinede bellek de sınırlar", execution-method §10). Öneri (tahmin): aynı anda en çok 2–3 `pnpm build`/`test`; Per akşamı ölçüm turunda tek koşu.

**Paket PR kuralları:** (1) tek dal, master'dan taze; (2) §1.3 statik ölçü PR raporunda sayı; (3) test aynı PR'da (kural 14): boş veri / ağ yok / yetki yok; (4) i18n: TR+EN anahtarları (§3.4 zamanlama); (5) rota dosyasına dokunma yok; (6) yeni satırda ham HEX ve arbitrary değer 0; (7) mevcut 3 kabuk kilit testi **güncellenmez** — açılış PR'ının işidir.

---

## 4 · (c) 9 Ekim yerel önizleme KABUL ÖLÇÜTÜ

**Önizleme:** §2 Per'de oluşturulan yerel dal (`pnpm build && pnpm start`); push edilmez (271: yerel önizleme; ayrıca "hepsi `true`" dalı master dışı karışıklık yaratmasın). Recep'in ekranına erişim yöntemi (aynı makine/ekran paylaşımı) Ops'un; **ölçülmedi**.
**Kabulü kim verir:** **Recep** önizlemeye bakar, hükmü OPS penceresinde verir (karar 224); **ölçüm raporu TASARIM müdüründe**; raporu üreten ajan doğrulamaz — **bağımsız doğrulayıcı** yeniden ölçer (§10.3); düşen dilim kararı Ops'ta (§5.2).

### 4.1 Sayfa envanteri (M2/M3/M7 kapsamı = TÜM vitrin sayfaları)

Token ve font **küreseldir**: 181 pakete atanmayan dosya ve 34 atanmamış sayfa da etkilenir; bu yüzden M2/M3/M7 çekirdek değil **bütün `src/app/[lang]/**/page.tsx` rotaları** (54 sayfa, `git ls-files` ile sayıldı) için koşar. Dinamik segmentler (`[slug]`, `[categorySlug]`, `[kok]`, `[yazi]`) için **bir örnek adres**.

| Grup | Sayfa | Sayı | Yerleşim |
|---|---|---|---|
| Paket sahipli (yeni yerleşim bayrakla) | ana · category/× 2 · kategori · products · urunler · products/[slug] · urun/[slug] · urun-secici · cart · checkout · payment-success · bilgi-merkezi × 2 · knowledge-hub × 2 · destek/{garanti-servis, iade-degisim, sss, teslimat-kargo} | **20** | paket bayrağı açıkken yeni; kapalıyken **eski yerleşim + yeni token/font** |
| **Atanmamış** (yalnız yeni token/font; yerleşim değişmez) | about · contact · brands × 2 + markalar · destek/hesaplayicilar × 4 · legal × 6 · account × 14 · auth × 5 | **34** | **yalnız** token/font farkı |
| Toplam | | **54** | |

`account/*` (14) ve `auth/*` (5) oturum/akış ister: giriş gerektiren sayfaların tarayıcı ölçümü için test oturumu **yok**; bu 14 sayfa **ölçülmedi** olarak raporlanır, test kullanıcısı kurulursa kapsama girer (URUN/ALTYAPI; Recep kapısı değil, veri yazımı olmadan).

### 4.2 Görünüm ölçütleri (çekirdek eşiği: tek madde kırmızıysa görünüm anahtarı açılmaz, §5.1)

| # | Ölçüt | Yöntem | Eşik | Tür | Sahip |
|---|---|---|---|---|---|
| M1 | **Ekran sayısı** | Her kare için "kare ↔ ekran" yan yana ekran görüntüsü (gerçek tarayıcı) | Çekirdek **17/17 + G 8/8**; **A4 çıkarsa (Design cevabı yok) 16; B3b/B3c çıkarsa (OPS-71 ilişkisi) 14 + G 8/8** — eşik Salı Ops teyidiyle sabitlenir; ikincil paket ya tam ya bayrak kapalı | otomatik (görüntü) + **Recep gözü** | OLCUM → Recep |
| M2 | **Taşma** | Playwright, **54 sayfa × 5 genişlik**; mevcut `e2e/reflow.e2e.ts` `ROUTES` yalnız **5** (`/tr`, `/tr/products`, `/tr/cart`, `/tr/support`, `/tr/hakkimizda`) ve **390 px yok** → genişletilir: kategori, ürün, Bilgi Merkezi, seçici + atanmamış sayfalar + **390** | `scrollWidth − clientWidth` **0** (tolerans 1 px) @ **320** (mevcut INV-REFLOW-1 genişliği, doğru) · **390** · 768 · 1024 · 1280; html/body'de `overflow-x: hidden/clip` yasak (mevcut kapı kuralı) | otomatik | OLCUM |
| M3 | **Kontrast** | Gerçek tarayıcıda computed renk çifti + WCAG formülü, **54 sayfa**; çift listesi DS bileşenleri + atanmamış sayfaların başlıca metin/zemin çiftlerinden çıkar. Cetveldeki 5,65/4,71 değerleri "gerekçe, kapı çıktısı DEĞİL" (marka-token-eslemesi §1.1) → **tarayıcı ölçümü yeni araç** | normal metin **≥ 4,5:1**, büyük metin/arayüz **≥ 3:1**; kiremit düğme zemini + beyaz ≥ 4,5; turkuaz normal metinde **0** (K25); **yeni `--brand-cyan` koyu zeminde** ayrıca | otomatik (yeni araç) | OLCUM |
| M4 | **Tek dolu kiremit (K5)** | DOM **computed arka plan rengi**: `--action-terracotta-deep` ve eski kiremit (`--marka-kiremit`) ile dolu eylem öğesi sayısı (`data-ds` işareti **yalnız yardımcı**, DS dışı eski dolu düğmeyi görmez) | paketli sayfalarda **≤ 1**; tek fiil "Teklif iste"; "Teklif al" **0** | otomatik | OLCUM |
| M5 | **Ham HEX / arbitrary** | Dal farkında EKLENEN satırlarda HEX, `[…]` Tailwind değeri, `style={{…:'#'}}` + `pnpm lint` + INV-9 | yeni **0**; mevcut borç **artmaz** | otomatik | KAPI/OLCUM |
| M6 | **Anahtar durumları** | §1.3 aracı. **Dört durum:** (a) **tüm bayraklar kapalı** → master ile **fark 0** (6 referans sayfa × {390, 1280}; `@font-face` CSS baytı farkı kabul; **font `preload` bağlantısı 0, font dosyası isteği 0**; `font-mono` computed eşit); (b) **`YENI_GORUNUM` açık, tüm paket alt bayrakları kapalı** → DOM **yapısı** (etiket ağacı + sınıf listesi) özdeş, yalnız computed renk/font-family farklı; (c) **`YENI_GORUNUM` açık, bir paket kapalı** → o paketin sayfalarında (b) gibi, diğerlerinde yeni; (d) **atanmamış 34 sayfa** açıkken DOM yapısı özdeş, taşma 0 (M2), kontrast ≥ eşik (M3) | **(a) 0; (b)–(d) tanımlı farklar dışında 0** | otomatik | OLCUM |
| M7 | **Erişilebilirlik (axe)** | **54 sayfa**; depoda `axe-core ^4.13` ve `vitest-axe` var, **Playwright'ta axe bağlantısı ve `@axe-core/playwright` YOK** → yeni kablolama işi (mevcut `axe-core`'u sayfaya enjekte etmek yeni bağımlılık istemez; `@axe-core/playwright` eklenecekse `package.json` ALTYAPI'nın) + bileşen düzeyinde vitest-axe | **kritik 0 · ciddi 0**; (jsdom `color-contrast` koşmaz → M3 ayrı) | otomatik | OLCUM/ALTYAPI |
| M8 | **Performans** | Lighthouse mobil, yerel `pnpm start`, **master taban ayrı ölçülür (Salı)**; font toplam woff2 baytı; JS payload farkı. **Lighthouse bağımlılığı depoda YOK** (`package.json` ALTYAPI'nın) → Sal ALTYAPI kararı (ekle ya da geçici `npx`) | **CLS ≤ 0,1**; **LCP ≤ 2,5 s** ve master tabanına göre kötüleşme **≤ %10** (**%10 TASARIM önerisi, Recep onaylı değil — Ops teyit**); bayt/payload bütçesi: **bugün sayı yok**, Salı tabanından sonra yazılır | otomatik (araç + eşik teyit bekler) | OLCUM/ALTYAPI |
| M9 | **Kapılar** | `pnpm test -- --run` · `type-check` · `lint` · `knip` | **hepsi yeşil**; INV-PALET-1 güncel; INV-TOKEN-PARITE-1; INV-ADMIN-THEME-1..5; i18n kapıları; K-1 komutu (`tasarim/*`) **0** | otomatik (CI + yerel) | KAPI |
| M10 | **TR/EN** | Her çekirdek ekran `/tr` ve `/en` render | 200; boş/eksik anahtar **0**; `{{` kalıntısı **0**; elle `/tr/` **0** | otomatik | I18N/OLCUM |
| M11 | **Kip (K7/K38/K39)** | DOM ölçüm satırı (venthub-tasarim-dili §3): Teklif kipinde `Sepete ekle` 0 · ₺ 0 · "fiyat yok/—" 0; fiyatsız ürün "Teklif iste" ≥ 1; boş teknik alan satırı 0 | skill ölçüm satırı | otomatik | OLCUM |
| M12 | **Admin dondurma** | Altı admin ekranında bayrak açık/kapalı computed-style | **fark 0** (§1.4) | otomatik | OLCUM/ADMIN |
| M13 | **Hata yolları (kural 14)** | Ekran başına boş veri / ağ yok / yetki yok durumu render testi | paket başına **her durum ≥ 1 test** | otomatik | paket sahibi |
| M14 | **Kare ↔ ekran "his"** | Recep önizleme: ana sayfa, kategori, liste, ürün (panel kapalı/açık), header+footer masaüstü/mobil, Teklif paneli | **Recep'in "olur"u** | **Recep gözü** | Recep |

**Ölçüm araçları — sahip ve gün (hiçbiri bugün hazır değil):** fark-0 koşucusu (OLCUM, **Sal**) · reflow genişletme (54 sayfa + 390; OLCUM, Çar) · kontrast ölçer (OLCUM, Çar–Per) · axe kablolama (OLCUM, Çar; `@axe-core/playwright` kararı ALTYAPI Sal) · Lighthouse (ALTYAPI karar Sal, OLCUM koşar Çar–Per). Her araç **kendi doğruluğunu** (bilerek-fark) kanıtlamadan geçerli sayılmaz.
**Hangisi insan:** M1 hükmü ve M14 Recep'indir; M8'in %10 eşiği Ops teyidi bekler; kalan otomatik. **Ölçülemeyenler:** "birebirlik" tam sayı değildir (benzerlik hükmünü insan verir); M3 yalnız listelenen çiftleri kapsar; G alt karelerin kare kare eşleşmesi ölçülmedi; Lighthouse tek koşu değişkendir (üç koşu ortalaması önerisi).

### 4.3 ADRES kabul ölçütleri (M-A) — **adres planından alınır; TASARIM yalnız takvime yerleştirir**

Kaynak: `adres-semasi-standard.md` §8 (satır 103–107) + `rec-adres-agac-tek-yayin-2026-09-07.md` Faz 4/Faz 5 + `rec-300-plan-tazeleme-2026-09-29.md` §4. **Sahibi URUN/ALTYAPI (GEO-SEO ölçer).** Aşağıdaki durum sütunu **10-05'te ölçülmedi** (en son durum tablosu 09-29 tarihlidir); ölçüm ve tarif URUN/ALTYAPI'dan gelir.

| # | Ölçüt (standart §8 / adres planı) | Durum (10-05) | Takvimde yeri |
|---|---|---|---|
| M-A1 | REC-212 katalog paketi bitti | ölçülmedi | Cum öncesi |
| M-A2 | 7 ailenin EN adı dolu | ölçülmedi | Cum öncesi |
| M-A3 | GSC taban ölçümü alındı (karar 86; erişim ALTYAPI/GEO-SEO) | ölçülmedi | Per–Cum |
| M-A4 | linkinator + unlighthouse yayın öncesi taraması (**ikisi de `package.json`'da yok**; araç kaynağı ölçülmedi) | ölçülmedi | Cmt |
| M-A5 | **Recep ön izleme onayı (karar 68/161): "gördüm, tamam"** — olmadan Faz 3-C merge edilmez (adres planı Faz 4) | bekliyor | **Cum 15:00–18:00, ayrı blok (§2)** |
| M-A6 | §7 HEDEF kapıların hepsi yeşil: INV-ADRES-SEMASI-1 · -CAKISMA-1 · -COZUCU-1 · -HARITA-1 · -TEK-KANONIK-1 · INV-OZEL-AD-BUYUK-HARF-1 (+ takma ad gölge senaryoları, PR #1338 "Recep onayı bekler"). Depoda bu adların **ancak** `src/lib/adres/envanter.ts` ve `src/lib/data/kategoriSegmenti.ts` (+testleri) içinde geçtiği görüldü; kalan kapıların varlığı **ölçülmedi** | ölçülmedi | Per akşam raporu |
| M-A7 | Eski adres envanteri (eski → yeni, her satır) commit'li | ölçülmedi | Cmt |
| M-A8 | Faz 1-B (migration, **kural 13: prod DB'ye otomatik uygulanır; Recep onayı**) ve Faz 3-C sırası ve arası pencere (adres planı: "dakikalarla sınırlı") | ölçülmedi (#1352 durumu 09-29'da "AÇIK PR") | Paz sabah |

---

## 5 · (d) Yetişmezse düşen dilim

### 5.1 Düşme sırası (en önce düşen → en son) — çekirdek tanımı §3.1'dedir

**Asla düşmeyenler (taban):** (T1) **adres dilimi tek başına çıkabilir** (anahtar matrisi, §5.2); (T2) Faz 2a **görünmezliği** + INV-PALET-1 güncellemesi + K-1 komutu 0; (T3) "tüm bayraklar kapalı = fark 0" (M6a) — hiçbir paket bunu ihlal ederek master'a girmez; (T4) kapılar gevşetilmez (kural 14): paket DÜŞER, kapı gevşemez.

**Baştan düşmüş (adres kararı yok, §5.3):** ARAMA (D3–D5), KARSILASTIRMA (B8, B8b), SENARYO (C1, C2), F4, B10/B11 — "KOD YOK". Etkisi: **fark yok** (bu sayfalar zaten sitede yok).

| Sıra | Düşen dilim (kod yazılacaklar) | "Düştü" etkisi (ziyaretçi için) | Not |
|---|---|---|---|
| 1 | **H satış kipi** (S1–S6) | Fark yok (K1: kapalı bekler) | Kod hazır kalır |
| 2 | **BILGI** (F1, F2) | Bilgi Merkezi: `YENI_GORUNUM` açıkken **yeni token/font, eski yerleşim** | |
| 3 | **SECICI** (E2, E3) | Ürün Seçici: yeni token/font, eski yerleşim | |
| 4 | **TEKLIF** (B9, B9b, M6) | Sepet/teklif: yeni token/font, eski yerleşim; header "Teklif (n)" paneli (A3) mevcut `/cart` adresine bağlanır | Ticari akış: düşerse **Recep'e açıkça yazılır** |
| — | **ÇEKİRDEK** (TOK/font · DS · KABUK(A+G birlikte) · ANA · LISTE · URUNSAYFA) | **Biri düşerse görünüm anahtarı TOPLUCA kapalı kalır** (yarım çekirdek tutarsız site) | `features.ts:47-48` "yarısı açık kabuk kötüdür" |

**Önemli düzeltme:** düşen paketin alt bayrağı `false` kaldığında "canlıda iz yok" **değildir**: `YENI_GORUNUM` açıkken o paketin sayfasında **yeni token/font görünür** (yalnız yerleşim eski kalır). Bu "iz" ayrıca ölçülür (§4.2 M6 durum (b)/(c)); "anahtar kapalı = fark 0" yalnız **tüm bayraklar kapalıyken** geçerlidir.

### 5.2 Ops'un 9 Ekim akşamı karar kuralı ve Pazar günü adres sonucu

**Girdi:** ölçüm raporu v1 (bağımsız doğrulayıcı) + Recep'in iki önizleme hükmü (adres M-A5; görünüm M14) + adres kabul sonucu (URUN/ALTYAPI).

| Durum (Cuma akşamı) | Karar | Anahtarlar |
|---|---|---|
| Çekirdek **tümü yeşil** (M1–M14) + Recep görünüm "olur" | Çekirdek + geçen ikincil paketler açılır | `YENI_GORUNUM=true`, `YENI_KABUK_GEZINMESI=true`, geçen paketlerin alt bayrağı `true` |
| Çekirdek yeşil, bir **ikincil paket** kırmızı | O paket düşer, diğerleri açılır | O paketin alt bayrağı `false` (yeni token/font, eski yerleşim) |
| **Çekirdekte** madde kırmızı, **ama TOK/DS/font yeşil** ve Recep "token+font tek başına olur" der | **Ara durum:** yeni token/font açık, yeni yerleşim yok | `YENI_GORUNUM=true`, **tüm paket alt bayrakları `false`**, `YENI_KABUK_GEZINMESI=false`. Bu durum Cuma önizlemesinde **ayrıca gösterilmiş** olmalı (Recep'in görmediği kombinasyon yayınlanmaz) |
| **Çekirdekte** madde kırmızı ve ara durum da kabul edilmedi / Recep "olur" demedi | **Görünüm açılmaz; adres dilimi tek başına çıkar** (karar 271 güvenlik ağı) | `YENI_GORUNUM=false`, `YENI_KABUK_GEZINMESI=false`; adres: adres planına göre |
| Adres kabulü kırmızı (M-A1..M-A8), görünüm yeşil | Adres açılmaz; görünüm adres-bağımsızdır (URL değiştirmez, K-1 ihlali yok) → **Ops + Recep** karar verir (Recep önceliği adres) | `ADRES=false`; görünüm Ops kararı |
| İkisi de kırmızı | 11 Ekim'de yalnız Faz 2a (görünmez) + kapı + DS çıkar; Recep'e açık rapor | tüm bayraklar `false` |

**Pazar günü (11 Ekim) adres canlı ölçümü kırmızı çıkarsa görünüm yayını ne olur:**

| Pazar sonucu | Görünüm yayını | Gerekçe |
|---|---|---|
| Faz 1-B canlı ölçümü yeşil (40 eski aile adresi tek 308), Faz 3-C yayın ölçümü yeşil | **Açılır** (adres sonrası, ayrı deploy) | Sıra karar 118 |
| **Faz 1-B canlı ölçümü kırmızı** | Faz 3-C merge **EDİLMEZ**; **görünüm Pazar'da AÇILMAZ** (öneri) | Adres yarım uygulanmış (migration prod'da, 3-C yok) belirsiz bir durumdur; iki değişkeni aynı anda belirsizken değiştirmeyiz. Risk: görünüm Pazartesi'ye kayar; alternatif (Ops+Recep): görünüm adres-bağımsız olduğundan açılabilir |
| 1-B yeşil, **Faz 3-C yayın ölçümü kırmızı** (404/zincir/sitemap) | **İleri düzeltme** esastır (adres planı §11); görünüm **açılmaz** | 3-C geri dönüşsüzdür (§5.4); düzeltme adres işinin; görünümün açılması düzeltmeyi karıştırır |
| 3-C yeşil, **IndexNow/GSC adımı** gecikir | Görünüm açılabilir (bu adımlar canlıyı değiştirmez); Ops kararı | — |
| Pazar günü adres adımları **süre olarak bitmezse** (ölçülmedi) | Görünüm **Pazartesi**; 11 Ekim'de yalnız adres | Adres adımlarının toplam süresi adres planında yazılı değil |

**Adres dilimi tek başına — hangi anahtar, hangi test:** anahtar `ADRES_SEMASI_K3B = true`, `YENI_GORUNUM = false`. Testler: mevcut `rota-dili-*`, `kategori-rotasi-statik`, `urunler-rotasi-statik`, `tek-kanonik-kategori-adresi`, `anasayfa-rotasi-statik`, sitemap/robots testleri (URUN/ALTYAPI'nın) + **yeni anahtar matrisi kapısı** (öneri, ALTYAPI; ad belirsiz):
{ADRES false/true} × {GORUNUM false/true} = 4 kombinasyonda altı sayfa render (`vi.mock`) + **iki gerçek `pnpm build`** (T,F ve T,T). Canlı: M-A ölçütleri. **Ölçülmedi:** `vi.mock` ile derleme sabiti kombinasyonlarının güvenilirliği ve `next build` süresi (ALTYAPI Salı).

### 5.3 K-1 / karar 118, Faz 4(2) ve **yeni rotalar (ÖLÇÜLDÜ: adres kararı yok)**

- **K-1 SÜRER:** `tasarim/*` dalında `src/app` altına rota klasörü ekleme/silme/taşıma **0** (v2.1 §3 komutu, `:(glob)` biçimi). Adres işi URUN/ALTYAPI'nındır; bu belge adres şemasını değiştirmez.
- **ÖLÇÜLDÜ (doğrulayıcı grep'i; bu oturumda yeniden doğrulandı):** `docs/standards/adres-semasi-standard.md` içinde **arama, karşılaştırma, senaryo, teklif-listesi adresleri YOK** (standart §1 şeması yalnız urunler/kategori/dal/aile/model/marka). Bu adresler yalnız
  **Design v3 planında** geçer: `docs/plans/rec300-design-adres-semasi-v3-2026-09-11.md` — senaryo `:58`, teklif listesi `:61` (`/tr/teklif-listesi`, EN `/en/quote-list`), karşılaştırma `:62` (`/tr/karsilastir?m=…`), `arama` ise yalnız rezerve kelime listesinde `:97`. Design v3 **standart değildir**; yazılı adres kararı yok.
- **Sonuç:** **ARAMA, KARSILASTIRMA, SENARYO, F4 ve B9–B11'in yeni `teklif-listesi` alt adresleri (`/gonder`, `/alindi`) paketleri "adres kararı gelene dek KOD YOK / düşer" olarak BAŞTAN işaretlidir** (§3.1). **Recep'e adres sorusu** (URUN rol kuralı: adres şeması değişikliği tek başına sorulur, paketlenmez) — Ops taşır, kesim **Çar 12:00**.
  **"Karar gelirse" koşulu:** karar + URUN'un rota klasörlerini `urun/*` dalında açması Çar 12:00'ye kadar gelmezse paket 11 Ekim sonrasına kalır. Salı'daki "ROTA: yeni rota taslakları" görevi **kaldırıldı**.
  **B9/B9b** (teklif listesi) mevcut `/cart` adresinde yeniden çizilir (adres değişmez) → kod yazılır.
- **Yeni rota klasörü şartı (karar gelirse):** rota klasörü **bayrak kapalıyken `notFound()` döner ve indekslenmez** (sitemap'te yok, `noindex`); §4.2 M6'ya bu rotaların "bayrak kapalı → 404 + sitemap'te yok" ölçümü eklenir.
- **Faz 4(2) yeniden:** v2.1 "adres yayınından SONRA, ayrı yayın" diyordu. 271 ile **aynı gün** ama **ayrı anahtar, ayrı deploy**: önce adres açılışı + canlı ölçüm, **yeşilse** görünüm. Görünüm bileşenleri **rota-bağımsızdır** (`src/views/**`; seçim içlerinde, §3.4) → görünüm anahtarı adres anahtarına KOD bağımlılığı taşımaz.
  Link üretimi rota tablosundan (`useLocalizedRoutes`, kural 7). Mevcut `kategori/[kok]/[[...dal]]`, `urun/[slug]`, `urunler`, `bilgi-merkezi` rota klasörleri depoda var (bayrak `false`).
- **Karar 285 (OPS-71) 11 Ekim SONRASIDIR.** B3b/B3c ile ilişkisi **ölçülmedi**; ilişki varsa o kareler çekirdekten çıkar (§3.1, M1: 14).

### 5.4 Adres açılışı GERİ DÖNÜŞSÜZDÜR — "geri alma = bayrak `false` PR'ı" yalnız görünüm için

`features.ts:127-128` ve adres planı Faz 3-C: *"tek geri dönüşsüz adım"*; **aynı PR bayrağı `true` yapar, eski-adres haritasını ve `next.config`'ten 19 satırı siler** (`rec-300-plan-tazeleme` §2: "3-C bayrak `true` + harita + config'ten 19 satır silme"). Bu yüzden **adres için bayrağı `false` yapmak temiz geri alma DEĞİLDİR**: eski-adres haritası ve config satırları gitmiştir, 301'ler ve GSC/IndexNow bildirimleri geri alınamaz.
**Adres için gerçek geri alma tarifi (adres planı §11 "Geri alma", satır 348–351'den):** *ileri düzeltme esastır* (harita ve envanter commit'li; yanlış satır düzeltilir, yeniden derlenir); **3-C geri alınırsa yeni adresler 404 olur (dizine girmişse kayıp)** → geri alma **yalnız kitlesel hata hâlinde ve Recep kararıyla**, **3-C PR'ının tamamını revert** ederek (yalnız bayrak değil: harita + config satırları aynı PR'daydı) yapılır; Faz 1-A/1-B/2/3 tek başına geri alınabilir.
**Ölçülmedi — URUN/ALTYAPI tarifi gerekir:** revert PR'ının build+deploy süresi, GSC/IndexNow'a bildirilmiş adreslerin geri dönüşteki etkisi, Faz 1-B migration'ının (prod DB, kural 13) geri alma yolu, kim/ne kadar sürer. **Görünüm geri alması** ise temizdir (bayrak `false` PR'ı; veri/adres etkisi yok; ISR/CDN yayılımı v2.1 §2.11'de ölçülmedi).

---

## 6 · Gerçekçilik — 5 günde 33 HAZIR + 19 YARIM kareyi koda çevirmenin riskleri

1. **"HAZIR" = çizildi ve karara bağlandı, koda hazır DEĞİL.** Envanter 19 karede site karşılığını "ölçülmedi" işaretlemiş (A1, A2, A3, B2, B7 gibi çekirdek kareler dahil); 27 karede yapısal çelişki var (7 kök neden; çoğu adres). **URUNSAYFA hem en büyük hem en az ölçülmüş paket**
   (5 varyantlı ürün sayfası + katlı deneyim + varyant seçici; B7 iç yerleşimi "ölçülmedi") — çekirdeğin en riskli parçasıdır.
2. **Kapasite ölçülmedi.** Ajan verimi, PR hızı, URUN müdürünün denetim hacmi için depoda sayı yok; §3.2 ajan sayıları ve §2 süreleri **tahmin**dir. Kaba büyüklük (tahmin): paket başına 1–2 PR + TOK/KAPI/SOZLUK/açılış = **25–30 PR** 4 günde; Recep tek hakem, canlı şerit tavanı 2–3 (§4). Eşzamanlı ajan **20** sınırı ve yerel makine kaynağı §3.5'te.
3. **Design girdisi bekleyen kareler** (A4+F3, A6, A8, A9) takvimde **"Design girdisi bekliyor"** olarak işaretlidir; **kesim Çar 12:00**. Kodlanmaz, mevcut bileşen yeni tokenla kalır. Ayrıca 9 rozetli YARIM kare kod yazılabilir sayıldı: rozetin anlamı **ölçülmedi**.
   **Design'a 7 soru** — TASARIM hazırlar, **OPS** emir dosyasını Design projesine gönderir (venthub-tasarim-dili §4; koddan Design'a yazma yok, v2.1 K-7): (1) A6 T-5 · (2) A4/F3 T-1 + K37-c kare düzeltmesi · (3) A8 onay · (4) A9 kabul/ret · (5) B8/B8b alan kümesi (KOD YOK olsa da) · (6) 9+4 rozetin anlamı · (7) B7v adres notu.
   **Kritik yol riski:** Design kendiliğinden tetiklenmez ("Recep 'Linear'a bak' der", skill §4; bugünkü geçerliliği **ölçülmedi**) ve **tek yanıt süresi verisi yaklaşık 8–10 gündür** (uzun metin sorusu 09-25 → Design değişikliği 10-03; gönderim saati ölçülmedi). Bu pencereye sığmaz; kesim bu yüzden vardır.
4. **OPS-71 ↔ B3b/B3c** ilişkisi ölçülmedi: çekirdek 17'den 14'e inebilir (M1 riski, §3.1).
5. **Dağıtım yükü (KOTA — güncellendi).** İlk sürümdeki 09-08 verisi (37 önizleme + 23 production, iki kez kota kilidi) **bayattır**: `vercel.json` (10-05 okundu) `git.deploymentEnabled`'da `*/**` dahil bütün dal önekleri için dal dağıtımını **kapatıyor** (`tasarim/*`, `urun/*`, `i18n/*`, `altyapi/*` hepsi kapsanıyor). Yani (yazılı yapılandırmaya göre) dal push'u önizleme dağıtımı üretmiyor; **yükün asıl kaynağı master merge'leri (production dağıtımı)**. **Ölçülmedi:** `*/**` joker deseninin Vercel'de gerçekten eşleştiği (collaboration-protocol §8.1, 09-08'de "joker yok" demişti; `vercel.json` sonradan değişmiş) — bir dal push'unda dağıtım oluşup oluşmadığı canlı ölçümle teyit edilmedi.
   Önlem: günde en çok 2 merge dalgası (§2), Cmt günü ALTYAPI merge kapasitesini ölçer (bugünkü kota durumu **ölçülmedi**). Ara push yasağı (§8.1) PR güncelleme dışında sürer.
6. **Kapıların yükü.** Her yeni ekran 354 conformance dosyasının (i18n dead-key/key-resolution/ters-yön, storefront ratchet, reflow, ssr-gövde …) altından geçer; paket PR'ı kırmızıya düşerse düzeltme turu takvimde yer tutar. i18n parça-dosya yönteminin kapılarca görülmesi **ölçülmedi** (§3.4).
7. **Gerçek tarayıcı ölçümleri otomatik başlamaz.** Fark-0, genişletilmiş reflow, kontrast, axe-Playwright, Lighthouse araçları **bugün yok** (§4.2 tablosu: sahip ve gün) — Fark-0 Salı, diğerleri Çar–Per; kendi doğrulukları kanıtlanmadan ölçüm geçerli sayılmaz.
8. **ÇÜRÜTÜCÜ HÜKMÜ — GÜVEN (yargıdır, ölçüm değil):**
   - **11 Ekim TAM KAPSAM güveni: DÜŞÜK.** Nedenler: ilk tam ölçüm turu **Per gecesi**, bağımsız doğrulama **Cum 12:00–15:00**, Recep bakışı **Cum 15:00–18:00**, ardından **tek düzeltme turu (Cmt)**; ölçüm araçlarının hiçbiri hazır değil; URUNSAYFA en az ölçülmüş paket; Design cevabı penceresi (≈8–10 gün) sığmıyor; adres açılışı kendi içinde çok adımlı ve geri dönüşsüz.
   - **Adres tek başına güveni: ORTA** — **koşullu:** M-A ölçütleri kapanırsa ve URUN kapasitesi adrese ayrılırsa (§3.5: Cmt–Paz yeni görünüm işi yok). M-A'nın 10-05 durumu ölçülmediği için bu da yargıdır.
   - **Çekirdek (17 kare + G + token/font + DS) için ayrı güven sayısı vermiyorum:** ilk sürümdeki "orta güven" ifadesi, URUNSAYFA'nın "en büyük, en az ölçülmüş" olmasıyla çelişiyordu; geri çekildi. 11 Ekim hedefi 33+19 kare değil, **çekirdek + tüm bayraklar kapalıyken sıfır risk + adres tek başına çıkabilirlik**tir.
9. **Tam iş ilkesi (kural 14) baskı altında gevşemez:** hata yolları ve testler paketle birlikte; yetişmeyen paket kapıyı kırmızı bırakıp çıkmaz, **düşer** (§5.1 T4).

---

## 7 · Karar ve onay kaydı

- **Karar 271 ile kararlı (Recep'e gitmez):** hangi fazın 11 Ekim'e girdiği (TAM KAPSAM); K36 "kabuk anahtar arkasında yazılır"; galeri çıkarma; `token-turet` çıkarma; `ds/` yolu. (v2.1 §4 soru 1 ve 2 bu belgeyle **kapandı**.)
- **Recep'e kalan:** (1) 9 Ekim **iki ayrı önizleme hükmü** — adres (karar 68/161) ve görünüm (M14), Ops penceresinde; (2) **adres sorusu** (arama/karşılaştırma/senaryo/F4/teklif-listesi alt adresleri; tek başına; kesim Çar 12:00); (3) Pazar sabahı **Faz 1-B migration onayı** (kural 13; adres planına göre); (4) "token+font tek başına" ara durum seçeneği (§5.2).
- **ROL KARTI SAPMASI (Ops teyidi ve rol kartı güncellemesi gerekir):** `docs/roller/TASARIM.md` "Yasak ve sınır": *"K36 kabuk kararı ve Faz 2b Recep onayı olmadan başlamaz"*; "Durum": *"K36 yazılmamış"*; `layout.tsx` için *"yalnız yazı tipi"*. **Planın yaptığı:** Faz 2b'yi anahtar arkasında **Çarşamba merge** eder; K36'yı **karar 271 ile kararlı** sayar; `layout.tsx`'e `data-gorunum` özniteliği + `body` sınıf seçimi ekler (yalnız yazı tipinin ötesi).
  **Dayanak:** Ops 10-05 mesajı: *"K36 271 kapsamında, Recep'e gitmez"*; **karar 271 metni DOĞRUDAN okunmadı (Ops aktarımı)**. **Rol kartının güncellenmesi** (Yasak/Durum/Dosyalar satırları) Ops/HARİTA'ya aittir; bu belge rol kartını yazmaz.
- **Ops'a:** (1) plan v2.2 onayı (Sal sabah); (2) ALTYAPI kapı emri; (3) paket kartları, `YÖNTEM:` satırı ve **claim'ler** (§3.2 globları; `features.ts` için URUN claim izni; `public/brand/**` için TASARIM claim'i); (4) Design soru dosyasının gönderimi (kesim Çar 12:00); (5) ADMIN'e dondurma sorusu; (6) I18N'e sapma talebi; (7) SATIS'ın TEKLIF paketini üstlenmesi (öneri); (8) M8 eşiği (%10) teyidi; (9) Vercel merge kapasitesi; (10) Recep'e iki önizleme bloğunun ayrı yapılması önerisi (§2 Cum).

## 8 · Ölçülmeyenler ve açık kalemler (v2.1 §8'e ek; hepsi "ölçülmedi", uydurma değer yok)

| Kalem | Durum | Kim / ne zaman |
|---|---|---|
| Karar 271 metni | doğrudan okunmadı (OPS aktarımı) | Ops |
| Font manifest girdisinin HTML'de `<link rel=preload>` olarak basıldığı (render tarafı); `font-mono` computed eşitliği (S1) | manifest tarafı **kaynaktan okundu**; render tarafı ve ölçüm yok | TASARIM, Sal 09:00 |
| Admin dondurma: portal diyalog/toast fontu (S2) | ölçülmedi | TASARIM/ADMIN, Sal |
| Sabit bayrak okumanın yeni kodu kapalıyken paketten çıkarması (S3) | ölçülmedi | TASARIM, Sal |
| Ajan verimi, PR hızı, URUN müdürü denetim kapasitesi; eşzamanlı build/test CPU-bellek sınırı | ölçülmedi | Ops (Çar–Per gözlem) |
| 19 karenin iç yerleşimi, G/H kare kare eşleşme | ölçülmedi (envanter) | paket liderleri |
| 9 rozetli YARIM karenin anlamı; Design yanıt süresi (tek veri ~8–10 gün) | ölçülmedi | Design/Ops |
| "Design kendiliğinden tetiklenmez" kuralının bugünkü geçerliliği | ölçülmedi | Ops |
| **Yeni adresler (arama, karşılaştırma, senaryo, F4, teklif-listesi alt adresleri) adres standardında** | **ÖLÇÜLDÜ: yazılı değil** (§5.3) | Ops → Recep |
| Adres açılışı M-A1..M-A8'in 10-05 durumu; Faz 1-B (#1352) durumu; 09-29'dan sonraki adres ilerlemesi | ölçülmedi | URUN/ALTYAPI |
| Adres gerçek geri alma tarifi: revert build+deploy süresi, GSC/IndexNow etkisi, Faz 1-B migration geri alma | ölçülmedi — **URUN/ALTYAPI tarifi gerekir** | URUN/ALTYAPI |
| Adres işinin 4 görünüm dosyasına hâlâ dokunup dokunmayacağı | ölçülmedi | URUN |
| linkinator/unlighthouse aracının kaynağı (ikisi de `package.json`'da yok) | ölçülmedi | ALTYAPI |
| OPS-71 ↔ B3b/B3c | ölçülmedi | Ops/URUN |
| i18n parça dosyalarının kapılarca görülmesi; I18N'in yöntemi kabulü | ölçülmedi | I18N, Sal |
| `vi.mock` ile bayrak kombinasyonu testi güvenilirliği; `next build` süresi | ölçülmedi | ALTYAPI, Sal |
| Vercel merge kapasitesi / bugünkü kota durumu | ölçülmedi | ALTYAPI, Cmt |
| M8 taban sayıları (LCP/CLS, font bayt, JS payload) | bugün sayı yok | OLCUM, Sal |
| Giriş gerektiren 19 sayfanın (account 14, auth 5) tarayıcı ölçümü | test oturumu yok → ölçülmedi | URUN/ALTYAPI |
| Recep'in önizlemeye erişim yöntemi | ölçülmedi | Ops |
| `INV-PAKET-SINIR-1`, `INV-GORUNUM-KAPALI-1`, anahtar matrisi, `INV-ADRES-TASARIM-1` kapı adları | öneri, ALTYAPI belirler | ALTYAPI |
| Çakışmasızlık: gelecekte açılacak yeni dosyalar | ölçülemez (kurucu kural + öneri kapı) | §3.3 sınır (i) |
| Bu belge işinde `pnpm test`/`lint`/`knip` | koşulmadı (yalnız belge) | — |

## 9 · Doğrulayıcı + çürütücü kaydı (2026-10-05)

**DOĞRULAYICI + ÇÜRÜTÜCÜ GEÇTİ 10-05** — hüküm: doğrulayıcı **DÜZELTME GEREKLİ**, çürütücü **engelleyici bulgu** (kabul kapsamı) içerdi; bu sürüm tüm bulguları işler. **Düzeltmelerin yeniden doğrulaması bekliyor** (bu sürümü yazan ajan kendi düzeltmesini doğrulamış sayılmaz).

| Harf | Bulgu | Karşılık | Bölüm |
|---|---|---|---|
| A | Adres açılışı geri dönüşsüz; standart §8 ön koşulları; "geri alma = bayrak" yanlış | Geri alma cümlesi silindi; adres için gerçek tarif (adres planı §11) ve "ölçülmedi, URUN/ALTYAPI tarifi"; M-A1..M-A8; karar 68 onayı Cuma ayrı blok; Pazar kırmızı tablosu; adres ölçütleri adres planından, TASARIM yalnız takvime yerleştirir | §1.1, §2, §4.3, §5.2, §5.4 |
| B | Yeni rotalar adres standardında yok (ölçüldü) | ARAMA/KARSILASTIRMA/SENARYO/F4/B10-B11 baştan KOD YOK; ROTA taslak görevi ve atanmış lider/çalışan kaldırıldı; Recep'e adres sorusu; `notFound()`+indekssiz şartı ve M6 | §3.1, §3.2, §5.3, §2 |
| C | Kabul kapsamı çekirdekle sınırlı; 181 atanmamış dosya, token/font global | M2/M3/M7 54 sayfa için; sayfa envanteri tablosu; M6 dört durum (ara durumlar dahil); §5.1 "iz yok" cümlesi düzeltildi | §4.1, §4.2, §5.1 |
| D | Font preload: kapalıyken de önyüklenir | Next 15.5.25 kaynağı okundu (manifest tarafı teyit; render tarafı ölçülmedi); üç aile `preload:false`; M6 tanımı; S1 spike güncel | §1.2, §1.3, §4.2 M6, §8 |
| E | Design kesimi; çekirdek tek tanım; A4; güven; ara satır | Kesim Çar 12:00; çekirdek yalnız §3.1; ANA düşme listesinden çıktı; A4 Design'a bağlı; B3b/B3c riski M1'de; "TOK+DS+token" ara durumu; güven DÜŞÜK/ORTA açıkça | §2, §3.1, §4.2, §5.1–§5.2, §6.8 |
| F | Eşzamanlı ajan sınırı 20; adres için ayrı kapasite | URUN en çok 16, 4 slot adrese; Cmt–Paz URUN yeni paket açmaz; makine kaynağı ölçülmedi | §3.5 |
| G | Sahiplik boşlukları | 861 sayısı + yöntem; ROTA/ADRES genişledi; eşlik/test kuralı; 4 dosya sırası; I18N çelişkisi + dalga zamanlaması (Cum 09:00 dalgası); `src/app/[lang]/**` vs kök `layout.tsx` | §3.2–§3.4 |
| H | Takvim/araç | PQEgrisi DS-PR3; Salı yükü yeniden sıralandı (S1 önce, araç Salı); admin dondurma yazarı ve font-family; Cmt yalnız kırmızı düzeltme + kombinasyon farkı | §1.4, §2, §3.2 |
| I | Ölçüt araçları | M2 54 sayfa+390; M4 computed renk; M7 axe-Playwright kablolama; M8 Lighthouse bağımlılığı ALTYAPI; M3 yeni tarayıcı aracı; araç sahip/gün | §4.2 |
| J | Rol kartı sapması | Sapma satırı: madde, planın yaptığı, Ops teyidi, kartı güncelleyen Ops/HARİTA | §7 |
| K | Kota bayat | `vercel.json` dal önizlemelerini kapatıyor; yük master merge'leri | §6.5 |
| L | Güven, INV-REFLOW-1, kayıt | 320 bilgisi doğru (korundu); güven §6.8; bu tablo | §4.2, §6.8, §9 |

---

**ÖLÇÜM:** 2026-10-05 · master `fe2a7fa95`; ana depo bugünkü HEAD `74e50d280` (Ops/koordinatör bildirimi); çalışma ağacı tabanı `35224a3c5` (`fe2a7fa95`'in torunu). Bu belgenin sayıları çalışma ağacında üretildi: `git ls-files` 5029 + 14 sentetik yol, **picomatch 4.0.4** ile paket-glob kesişim betiği (0 çakışma; 861 atanan mevcut dosya; vitrin alanı 482 / atanmayan 284, bunun 177'si admin dışı); envanter tablosu betikle yeniden sayıldı (HAZIR 33 · YARIM 19 · "ölçülmedi" 19 · "VAR" 27);
54 `src/app/[lang]/**/page.tsx`; `src/config/features.ts` (`ADRES_SEMASI_K3B:130 = false`, yorum `:127-128`; `YENI_KABUK_GEZINMESI:58 = false`); `docs/standards/adres-semasi-standard.md` §1, §8; `docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md` Faz 3-C/4/5, §11; `docs/plans/rec-300-plan-tazeleme-2026-09-29.md` §2, §4; `docs/plans/rec300-design-adres-semasi-v3-2026-09-11.md:58,61,62,97`;
`node_modules/next/dist/build/webpack/plugins/next-font-manifest-plugin.js` (Next 15.5.25, satır 22–30, 58–80); `vercel.json`; `package.json` (axe-core, vitest-axe var; `@axe-core/playwright`, lighthouse, linkinator, unlighthouse yok); `e2e/reflow.e2e.ts` (`ROUTES` 5, genişlikler 320/768/1024/1280); `docs/standards/execution-method-standard.md:486,491`; `docs/roller/I18N.md:15,18`, `docs/roller/TASARIM.md`; `DEPARTMAN-HARITASI.md`; v2.1; girdi ölçüm notu H bölümü (**karar 271 ve Vitrin 15A özeti OPS aktarımıdır, doğrudan okunmadı**).
Fark kontrolü: ilgili dosyalarda `fe2a7fa95`→HEAD diff boş (doğrulayıcı ölçtü; v2.1 ÖLÇÜM satırı).
