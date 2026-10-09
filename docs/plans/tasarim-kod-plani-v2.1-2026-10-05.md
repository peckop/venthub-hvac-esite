# Tasarım → Kod Planı v2.1 (2026-10-05, TASARIM) — TASLAK

> **YERİNE v2.2 GEÇER:** `docs/plans/tasarim-kod-plani-v2.2-2026-10-05.md` (karar 271: 11 Ekim tam kapsam). Bu dosya tarihçedir; gövdesi değişmedi.

> **DURUM: TASLAK — ONAYSIZ, UYGULANMAZ.** Bu belge `tasarim-kod-plani-v2-2026-09-25.md` planının yerine geçer; v2 dosyası
> tarihçe olarak durur. v2'nin bağımsız denetimi (`red-team-tasarim-kod-plani-v2-2026-09-25.md`: 1 Kritik, 3 Yüksek, DARALT
> hükümleri) bu belgede **tek tek işlendi** (aşağıdaki iki tablo). Uygulama için Ops'un iki kararı gerekir: K36 (kabuk) ve hangi
> fazın 11 Ekim'e gireceği (§4). Bu belge yalnız belgedir: kod, token, Tailwind, `index.css` ve test dosyalarına dokunulmadı.

**KAYNAK / CETVEL:** yöneten cetvel `docs/standards/marka-token-eslemesi-standard.md` (palet ayağı yazılı; yazı tipi, yarıçap/gölge,
boşluk ve bileşen ayakları bu işin kapsamında yazılır — cetvel kendi "Durum" satırında bunları bekletiyor) +
`storefront-design-standard.md` + `admin-design-standard.md` (yalnız Faz 2b admin kararı) + `adres-semasi-standard.md` (K-1) +
CLAUDE.md kural 8/10/14 + Kararlar 15A K5 · K22 · K25/K25-b · K26–K28 · K36 (yazılmadı) · K38/K39 + karar 118 · 271 · 285.
Ölçüm tazeliği: bu belgenin ölçümleri 2026-10-05 (§1.2, §1.3, ÖLÇÜM satırı); envanter `docs/audits/tasarim-envanteri-2026-09-25.md`
(10 gün).
**YÖNTEM:** plan = elle + red-team bulgularının işlenmesi; uygulama TASARIM şeridi, kendi worktree, her faz ayrı PR (`tasarim/*`
dal öneki, §3 K-1 bunu kullanır). Faz 3 bileşenleri alt ajan ×3 (v1 ile aynı). Migration 0.
**DesignSync kuralı:** DesignSync yalnız OKUMA içindir. Koddan Design'a yazma yok (`write_files`, `finalize_plan`,
`create_project` yasak); yön tek taraflı: **Design → kod**. Koddaki bir değer Design'dakinden daha doğruysa düzeltme isteği
OPS emir dosyasıyla Design'a gider (K26: değer emri kaynağa gider), koddan yazılmaz.

---

## v2.1 değişiklik özeti

1. **Takma ad ilkesi (Kritik bulgu).** DS'in sitede değeri zaten var olan adları (`--text-muted`, `--warn-amber`,
   `--action-terracotta`, `--text-strong`, `--text-on-dark`) literal değerle ikinci kez yazılmaz; `var(--steel-gray)`,
   `var(--marka-*)` gibi mevcut tokene takma ad olur. Değer tek kaynakta kalır (§2.1).
2. **INV-PALET-1 çatışması dosyadan ölçüldü; çatışma v2'nin varsaydığından geniş çıktı:** 4. kol adı arıyor, değeri
   okumuyor; yani `--text-muted: var(--steel-gray);` takma adı bile kapıyı kırmızıya düşürür. Kapı güncellemesi (ALTYAPI,
   Faz 2a'dan önce) plan olarak yazıldı (§2.1).
3. **Faz 2a gerçekten görünmez hâle getirildi:** Tailwind'e yalnız YENİ adlı anahtar eklenir; `fontFamily.serif/mono` ve
   `--font-serif/--font-mono` Faz 2b'ye alındı (bağlanınca 68 `font-mono` kullanımı görünür biçimde değişir). Görünmezlik
   ölçülebilir tanıma bağlandı (§2.5, Faz 2a).
4. **Çakışan küme 2-3 değil 4 ad + 1 yazı tipi kolu:** `--primary-navy`, `--brand-cyan`, `--action-terracotta-deep`,
   `--font-sans`. Ayrıştırma: görünmez adlar 2a'da, görünür çevirme 2b'de ve takma adla (§2.2).
5. **Admin kararı Faz 2b'nin ÖN KOŞULU:** "admin değişmemeli" ölçütü kalktı; admin etkilenir (§2.3).
6. **K-1 kapısı ölçülebilir tanıma bağlandı:** "Faz PR'ı" = `tasarim/*` dalı; v2'nin `ds-galeri` rotası **çıkarıldı**
   (v2'den sapma). Red-team çıkarmayı değil noindex + bayrak kilidini istemişti; biz çıkarmayı seçtik çünkü karar 118 kapısı (rota klasörü ekleme 0) istisna açmadan
   sade kalıyor. Riski: izole görsel kapı kaybolur → yerine Vitest render + axe, görsel doğrulama Faz 4'te; CLAUDE.md kural 14 ile gerilim açıkça yazıldı (§2.5 Faz 3, §3, §4).
7. **Faz 4 sırası:** ürün sayfası + kategori/liste görünüm göçü adres yayınından SONRA, ayrı yayında (§2.5).
8. **`ds-kaynak` kopyası kaldı, `token-turet.mjs` üreteci çıkarıldı** (lint dışı, sahipsiz, sahte tazelik; §2.5).
9. **Faz tablosu** (canlıda görünür mü, ölçü, kim onaylar, geri alma) ve **11 Ekim önerisi** eklendi (§2.4, §4).
10. **Yeni olgular (10-05):** DS ölçümü, site token envanteri, DS↔site eşleşme tablosu, kural 8 ihlal sayıları, kapılar (§1);
    karar 285 (OPS-71) faz sırasına "11 Ekim sonrası" satırı olarak girdi; mega menü notu (§6).

### Bulgu → karşılık (red-team §2: ne denildi, planda nasıl karşılandı)

| # | Red-team bulgusu (§, derece) | Ne denildi | v2.1 karşılığı | Bölüm |
|---|---|---|---|---|
| 1 | §2.2 **KRİTİK** | Faz 2a `--text-muted` eklemek INV-PALET-1'in "geri gelmez" kolunu kırar; DS'in `--text-muted`/`--warn-amber`/`--action-terracotta` adları mevcut `--steel-gray`/`--marka-amber`/`--marka-kiremit` değerlerinin ikinci kopyası olur | Takma ad yolu (değer tek kaynakta). Kapı dosyadan okundu: takma ad bile 4. kolu kırar → kapı güncellemesi ALTYAPI PR'ı olarak 2a'nın ön koşulu; yedek yol yazıldı | 2.1 |
| 2 | §2.1 **YÜKSEK** | Çakışan küme 4 ad (+`--action-terracotta-deep`, `--font-sans`); `.light` ikinci tanım; `kenar.css`/`yuzey.css` okunmadı | Küme 4 ad + font kolu olarak yazıldı, ad ad listelenir; `.light` parite kapısının dışında (silme ayrı kayıt); `kenar`/`yuzey` ad listesi **ölçülmedi**, 2a'nın ilk adımı (DesignSync okuması) | 2.2 |
| 3 | §2.3 **YÜKSEK** | "Admin DEĞİŞMEMELİ" yanlış: admin `primary-navy` 19 kullanım/4 dosya, kök `body` fontu, 63 `font-mono`; admin tema bu adları ezmiyor | Ölçüt kalktı. Admin kararı (dahil ya da dondur) Faz 2b'nin ön koşulu; öneri: dahil; ADMIN şeridi onaylar | 2.3 |
| 4 | §2.7 **YÜKSEK** | K-1 kapısında "Faz PR'ı" tanımsız (URUN'un adres/Bilgi Merkezi PR'larını kırar ya da TASARIM'ı durdurmaz); galeri noindex/robots; Faz 4(2) "adres işiyle aynı yayında" karar 118 ile çelişir | "Faz PR'ı" = `tasarim/*` dalı; ölçülebilir komut; galeri rotası çıkarıldı (red-team noindex + bayrak kilidi istemişti; çıkarma bizim seçimimiz, gerekçe/risk §2.5 Faz 3); Faz 4(2) adres yayınından sonra, ayrı yayın | 3 (K-1), 2.5 |
| 5 | §2.4 ORTA | "Inter 0" iki kapsam dışı dosyaya (`InventoryQrLabel`, `Product3DViewer`) dokunur; `\bInter\b` kalıbı; Roboto (PDF) dördüncü aile | Ölçüt `\bInter\b` ile ikiye ayrıldı: vitrin kökü Inter 0 (kapı) + adıyla listelenmiş 3 istisna (QR etiketi, 3D gizmo, PDF Roboto); yeni istisna eklenemez | 2.5 Faz 2b |
| 6 | §2.5 ORTA | Font: CSP uygun, `latin-ext` doğru; 16 woff2 önyüklemesi; `className`+`variable` birlikte; `--font-sans` pariteye giremez; bugünkü ğ/ş kusuru | Değişken eksen (Archivo, Source Serif 4), Plex Mono statik, serif/mono `preload: false`; `className` ve `variable` birlikte değişir; font adı ayrı kol (layout'ta hangi aile); "önce" ölçümüne ğ/ş eklenir | 2.5 Faz 2b |
| 7 | §2.6 ORTA | Tailwind: `theme.extend` açık yazılmalı; `spacing.page` ile `maxWidth.page` aynı ad; `fontSize.display` çakışması; INV-TOKEN-SINIF-1 adlı sınıfları görmez | `extend` zorunlu; boşluk anahtarı `space-*` önekli; DS yazı ölçeği `display` anahtarına yazılmaz (ayrı ad); INV-TOKEN-SINIF-1'e adlı `p/m/gap/text` kolu (ALTYAPI) | 2.5 Faz 2a |
| 8 | §2.8 ORTA | `ds-kaynak` + `token-turet.mjs`: `scripts/**` lint dışı; tazelik kolu aynı betiğin iki damgası olduğu için hep yeşil; DS yuvarlama kayması | Üreteç çıkarıldı; kopya kaldı; kapı çözülmüş RGB ≤2 ile karşılaştırır; kolun adı "kopya↔türev tutarlılığı"; yön: sitenin kapıyla korunan değeri kazanır | 2.5 Faz 2a |
| 9 | §2.9 ORTA | `KabukBandi` ↔ `StickyHeader` aynı iş; `Kart` ↔ `ProductCard`; `ui/` mi `ds/` mi; Faz 2b'nin doğru hamlesi takma ad | `KabukBandi` Faz 1'e bağlandı (tek kabuk); `ds/` sapması Ops'a bildirilir; 2b'de `--primary-navy: var(--marka-lacivert)` | 2.5 Faz 1, 3 |
| 10 | §2.10 ORTA | Sahiplik: URUN claim'i `src/**` değil; `src/index.css`/`tailwind.config.js` sahipsiz; `conformance/**` ve `package.json` ALTYAPI'nın; `scripts/design/**` sahipsiz | §5 yeniden yazıldı: ALTYAPI eklendi, üreteç gittiği için `scripts/design/**` claim'i gerekmedi | 5 |
| 11 | §2.11 DÜŞÜK | Dağıtım sonrası ISR sayfalarının eski CSS adresi gösterip göstermediği ölçülemedi | Faz 2b dağıtımından sonra 3 ISR adresinde `curl` ile CSS hash ölçümü (TASARIM) | 2.5 Faz 2b |
| 12 | §2.12 ORTA | Bayrak ile önizleme yöntemi yok (kilit testleri `= false` bekliyor; galeri bayrağının kilidi yok); `from-primary-navy to-secondary-blue` gradyanı (21 kullanım/15 dosya) | Faz 1 önizleme yöntemi yazıldı (merge edilmeyen önizleme dalı); galeri çıktığı için galeri bayrağı sorusu kalktı; 2b ekran listesine gradyan yüzeyi eklendi | 2.5 Faz 1, Faz 2b |

### Adım hükümleri (red-team §0 tablosu) ve §3 aksiyonları

| Adım | Hüküm | v2.1 karşılığı | Bölüm |
|---|---|---|---|
| Faz 0 · K36 | KALSIN | Değişmedi; 2a ve 3 K36'yı beklemez | 2.4 |
| Faz 1 · Kabuk | DARALT (önizleme yolu) | Önizleme yöntemi + `KabukBandi` bağlantısı yazıldı | 2.5 |
| Faz 2a · Görünmez köprü | DARALT | Takma ad ilkesi; yalnız yeni adlar; görünmezlik ölçülebilir tanıma bağlandı; `serif/mono` 2b'ye | 2.1, 2.5 |
| Faz 2b · Görünüm dönüşü | DARALT | Admin ön koşulu; takma ad ile çevirme; Inter ölçütü; font önyükleme; ISR ölçümü | 2.3, 2.5 |
| Faz 3 · `components/ds/` | DARALT | Galeri rotası çıktı; `KabukBandi` Faz 1'e; 10 bileşen; knip riski yazıldı | 2.5 |
| Faz 4 · Sayfalar | DARALT | Ürün/kategori göçü adres yayınından sonra | 2.5 |
| Faz 5 · Borç mandalı | KALSIN | Değişmedi; kural 8 taban sayıları eklendi | 1.3, 2.5 |
| K-1 kapısı | DARALT | Ölçülebilir tanım | 3 |
| `ds-kaynak` + `token-turet` | DARALT | Üreteç çıktı, kopya + kapı kaldı | 2.5 |

Red-team §3 aksiyon maddeleri: 1 → bulgu 2 · 2 → bulgu 1 · 3 → bulgu 1 ve Faz 2b · 4 → bulgu 3 · 5 → bulgu 5 · 6 → bulgu 6 ·
7 → bulgu 7 · 8 → bulgu 4 · 9 → galeri: noindex + bayrak kilidi yerine rota çıkarıldı, yerine Vitest render + axe (§2.5 Faz 3) · 10 → bulgu 10 · 11 → bulgu 8 · 12 → bulgu 9.

---

## 1 · Olgular (ölçüldü)

### 1.1 · v2'den bu yana değişen olgular

| # | v2 (09-25) | Bugün (10-05) | Plana etkisi |
|---|---|---|---|
| 1 | DS 66 token, 11 bileşen, 27 kart | **Aynı.** DS projesi `updatedAt` 2026-09-14 (plandan önce); manifest 66 token, 11 bileşen, 27 kart | Eşleme hâlâ 66 ad üzerinden; DS kopyası 09-14 sürümüdür |
| 2 | K36 yazılmadı | Karar hâlâ yok; Ops Recep'e götürecek | Faz 1 kilitli; 2a ve 3 beklemez |
| 3 | Adres yayını bekliyor (karar 118) | `ADRES_SEMASI_K3B = false` (`src/config/features.ts:130`); `YENI_KABUK_GEZINMESI = false` (`:58`) | Faz 4(2) için ön koşul: adres yayını canlıda |
| 4 | — | **Karar 285 EVET:** tek aileli alt kategori sayfası (OPS-71). Design prototipte yapıyor | Faz tablosunda "11 Ekim sonrası" satırı |
| 5 | — | **Karar 271:** 11 Ekim kapsamı = dilim 1 | §4 öneri |
| 6 | Uzun metin 16 px/1.6/66ch ↔ 17 px/720 px çelişkisi | **KAPANDI** (Ops aktarımı 10-05, Design cevabı): DS değeri geçerli (16 px · satır 1.6 · 66ch); Menü v18 3 Ekim'de buna döndü (§1.2) | Hiçbir faz bloklanmıyor |
| 7 | `layout.tsx:12` Inter | Dosyada `layout.tsx:5` import, `:12` tanım (girdi notunda `:9` yazıyordu; kod kazanır) | Faz 2b |

### 1.2 · DS ölçümü 2026-10-05

DesignSync ile yalnız okuma. Proje "VentHub Design System" (`31b0824c-8d7e-4a4c-94c7-8c094a1c62b7`).

- **Değişti mi:** `updatedAt` = 2026-09-14T09:30:59Z. Plan v2 2026-09-25 tarihli; DS plandan SONRA değişmemiş → **değişmedi**.
- **Token:** 66 (renk 12, tipografi 33, yüzey 6, kenar 6 [3 renk + 2 yarıçap + 1 gölge], ölçü 9). v2'deki sayı 66 → aynı.
- **Bileşen:** 11 (AnaEylemDugmesi, CerceveliDugme, KatliCagriSatiri, KabukBandi, AdetKontrolu, KarsilastirmaTablosu, PQEgrisi,
  TeknikTablo, Cip, HukumKutusu, Kart). **Kart (card):** 27 (Biçim 4, Bileşen 7, İkon 4, Kabuk 1, Logo 3, Marka 1, Renk 3,
  Tipografi 4).
- **Tipografi:** Archivo (font-sans), Source Serif 4 (font-serif), IBM Plex Mono (font-mono). Ölçek: display 46, h1 34 (mobil 25),
  h2 29, h3 21, body 15, body-small 13.5, caption 12.5, overline 11, editorial 16/1.6 (ölçü 66ch). Yarıçap 0 (panel 8 px), gölge yok.
- **ÖLÇÜLMEDİ:** DS dosyalarının **içerik sürüm farkı**. Yalnız proje `updatedAt` ve token/bileşen/kart sayıları kıyaslandı; aynı
  sayıda ama değeri değişmiş bir token bu ölçümle yakalanmaz. Faz 2a'nın ilk adımı kopyayı okurken bunu kapatır.
- **KAPANAN ÇELİŞKİ (uzun metin ölçüsü):** v2'de DS tip-serif kartı "16 px / 1.6, 66ch" ile Menü v18 F1 17 px / 1.65 / 720 px
  çelişiyordu ve Design'a soruluydu. **Cevap geldi (Ops 10-05 aktarımı; kaynak: Linear yorum `8a37e60b` — bu oturumda yorum DOĞRUDAN
  okunmadı, Ops aktarımına dayanır):** DS değeri geçerlidir — **16 px · satır yüksekliği 1.6 · 66ch**. Menü v18 3 Ekim'de buna
  döndürüldü; 720 px yalnız iki sütun kabıdır (uzun metin ölçüsü değil). Kodda sabit değer yazılmaz, DS tokenı kullanılır:
  `--size-editorial`, `--lh-editorial` (66ch ölçüsünün token adı **ölçülmedi**). Etki: **hiçbir faz bloklanmıyor**; v2'deki "Faz 2b bu cevabı bekler" kaydı da
  kalktı. DS kopyası (Faz 2a) bu değerleri DS'in kendi değeriyle alır (K26). Doğrudan doğrulama (Menü v18'in 3 Ekim sürümünün
  DesignSync ile okunması) **ölçülmedi**; Faz 2a kopyayı okurken `--size-editorial`/`--lh-editorial` değerlerini 16 px/1.6 olarak teyit eder.

### 1.3 · Sitede bugün (2026-10-05, master `fe2a7fa95`)

**Token envanteri.** `src/index.css`: 103 custom property, hepsi `@layer base` içinde; `:root` 35 (30 HSL üçlüsü, 1 `clamp`, 2 `rgba`,
1 HEX `--navy-900 #0A0F1E`, 1 `rem`), `.light` 12, `.dark` 8 (yalnız sidebar), `[data-admin-theme]` 23, `[data-admin-theme='dark']` 23,
`prefers-contrast` 2. İkinci `:root` yok. `:root` marka: `--marka-lacivert 218.8 48% 19.6%`, `--marka-turkuaz 193.6 100% 34.5%`,
`--marka-kiremit 23.3 87.9% 45.3%`, `--marka-amber 38 92% 50%`; AA tonları `--brand-cyan-ink 193 100% 28%`,
`--action-terracotta-deep 24.4 91% 39.2%`.
`tailwind.config.js`: **45 renk anahtarı** (41 `hsl(var(--x)/<alpha-value>)`, 4 sabit HEX: success-green, warning-orange, gold-accent,
silver-accent; dosyada anahtar anahtar sayıldı. Düz `grep hsl(var(--` 42 satır gösterir çünkü 50. satırdaki yorum cümlesi de
`hsl(var(--…))` içerir — o satır anahtar değil; girdi notundaki "47 / 43" sayısı bu yüzden yanlıştı, kod kazanır); `fontFamily` yalnız `sans`; serif/mono tanımı yok; spacing/screens varsayılan. `tokens.js`: 14 export; **renk,
spacing ölçeği ve tipografi ölçeği YOK**.
**Yazı tipi:** `layout.tsx` Inter (`--font-sans`); Archivo / Source Serif 4 / IBM Plex Mono kaynakta hiç geçmiyor. `font-mono`
68 kullanım / 37 dosya (Tailwind varsayılan mono; sabit sayım yöntemi §2.3'te). **Ölçülmedi:** `font-serif` kullanım sayısı.

**DS adı ↔ site eşleşmesi (15 ad ölçüldü; DS'in kalan ~51 adı için ad ad tablo ÖLÇÜLMEDİ — Faz 2a'nın ilk adımı).**

| DS adı | Sitede | Sonuç | v2.1 sınıfı |
|---|---|---|---|
| `--primary-navy` | VAR, FARKLI RENK: site `226 71% 40%` (#1E3FAE canlı mavi), DS `219 48% 20%` (#1B2C4B lacivert) | ÇAKIŞIYOR; 798 eşleşme / 139 dosya (sabit yöntem §2.3) | K3 (2b'de çevrilir) |
| `--brand-cyan` | VAR, FARKLI: site koyu `189 78% 53%`, `.light` `189 78% 40%`; DS `194 100% 35%` | ÇAKIŞIYOR; site `--marka-turkuaz` ≈ DS değeri | K3 (2b'de çevrilir) |
| `--brand-cyan-ink` | var, `193 100% 28%` | EŞİT | K4 (işlem yok) |
| `--action-terracotta` | yok (karşılığı `--marka-kiremit 23.3 87.9% 45.3%`) | ad yok, değer ≈ eşit | K1 takma ad |
| `--action-terracotta-deep` | var `24.4 91% 39.2%` (DS `24 91% 39%`) | yuvarlama farkı, kanal ≤2 | K3 (site kazanır) |
| `--warn-amber` | yok (`--marka-amber 38 92% 50%`) | değer EŞİT, ad yok | K1 takma ad |
| `--accent-air-green` | yok (en yakın `--vortice-green 149 100% 29%`; DS `100 61% 30%`) | değer FARKLI | K2 literal |
| `--text-strong` | yok (DS = primary-navy; `--marka-lacivert` ≈) | ad yok | K1 takma ad |
| `--text-body` | yok (DS `218 17% 35%`; en yakın `--industrial-gray 215 19% 27%`) | en yakını farklı | K2 literal |
| `--text-muted` | yok (DS `220 9% 46%` = site `--steel-gray`) | değer eşit, ad farklı (`steel-gray` 339 eşleşme / 80 dosya, sabit yöntem §2.3) | K1 takma ad |
| `--text-on-dark` | yok (= `--clean-white`) | değer eşit | K1 takma ad |
| `--text-on-dark-muted` | yok (DS `215 26% 65%`) | karşılığı yok | K2 literal |
| `--font-sans` | var (Inter) | DS Archivo → farklı font | K3 (font kolu, 2b) |
| `--font-serif` / `--font-mono` | yok | sitede serif yok, özel mono yok | 2b (font yüklenince) |

**KRİTİK OLGU:** DS değerleri sitede zaten `--marka-*` adlarıyla var, ama Tailwind `--marka-*`'yı renk olarak yayınlamıyor
(**0 sınıf kullanımı**). Canlıda kullanılan `primary-navy` ve `brand-cyan` DS'ten AYRI renktir. DS'i bu adlarla koda eşlemek
798 eşleşmenin (139 dosya) rengini değiştirir (görünür); marka adlarına takma adla eşlemek canlıda görsel değişiklik yaratmaz.

**Kural 8 ihlalleri** (`git ls-files src/**/*.ts(x)`, test/fixture hariç, 722 dosya) — Faz 5 mandalının ve K-2'nin tabanı:
- **Arbitrary değer:** vitrin 4 (NavSearchTrigger, NavShell, ContactPage, CategoryShowcaseView: 3 `shadow-[…]`, 1 `aspect-[4/3]`);
  admin 2 (AdminSozlukKapisi `min-h-[40vh]`, BlockEditor `min-h-[60px]`); diğer 8 (adminUi.ts 4, navigationConfig.ts 4).
  Arbitrary **varyant** (`data-[state=open]` vb.) ayrı: vitrin ~45, admin ~36 (değer değil, seçici).
  `eslint.config.cjs:76` `tailwindcss/no-arbitrary-value=error` → bu 6 ihlalle çelişiyor olabilir; **muafiyet ÖLÇÜLMEDİ, `pnpm lint` koşulmadı.**
- **Ham HEX** (yorum ayıklı): vitrin 53 (10 dosya, 22 tekil; HVACIcons 15, JetFanCalcPage 12, AirCurtainCalcPage 6,
  InfiniteProductsShowcase 6, OrbitalProductsShowcase 4, LoginPage 4 Google renkleri, …); admin 50 (5 dosya; AdminInventoryReportPage 17,
  SalesChart 16, …); 3D 61 (9 dosya); diğer 8. Kısmen gürültü (#fff/#000 gradyan). **Hangi HEX'in DS karşılığı olduğu ÖLÇÜLMEDİ.**
- **Inline style HEX:** vitrin 2 (gradyan), 3D 2, admin 0.
- **Lint:** admin ham HEX `error`, genel `warn`; grafik dosyaları karantinalı.

**Mevcut kapılar (conformance, 354 dosya) ve v2.1'deki durumları:**

| Kapı | Neyi korur | v2.1'de |
|---|---|---|
| INV-PALET-1 `marka-palet-tokenlari.test.ts` | `--marka-*` 4 renk tek kaynak `index.css`; Tailwind'de ikinci kaynak yok; ölü legacy değişkenler geri gelmesin | **GÜNCELLENİR** (§2.1) — ALTYAPI |
| INV-TOKEN-AA-RENK-1 `tailwind-token-aa-renkleri.test.ts` | `--brand-cyan-ink`, `--action-terracotta-deep` değeri + bağlanma | Değişmez; `--action-terracotta-deep`'i DS yuvarlamasından korur |
| INV-TOKEN-SINIF-1 `tailwind-token-sinif-gecerliligi.test.ts` | `h-/w-/min-/max-` önekleri, SAYI+BİRİM | Adlı `p/m/gap/text` kolu eklenir — ALTYAPI |
| INV-ADMIN-THEME-1..5 `admin-theme-invariants.test.ts` | Admin ham renk skalası, `text-white`/glass yasağı, `data-admin-theme` düzeneği, iki temada semantik token | Değişmez; 2a ve 2b'de yeşil kalmalı (ölçü) |
| INV-9 `storefront-style-ratchet.test.ts` | Vitrin legacy desen sayaçları tavan | Değişmez |
| Font/token SSOT kapısı | — | **YOK** (ölçüldü: bulunamadı) → yeni: INV-TOKEN-PARITE-1 ve font kolu |

---

## 2 · Fazlar (v1 numaraları korunur; değişen fazlar yazılı)

### 2.1 · Takma ad ilkesi ve INV-PALET-1 çatışması (KRİTİK bulgunun çözümü)

**İlke.** DS adı, değeri sitede zaten tanımlı bir tokenla aynıysa **o tokene takma ad** olur: `--text-muted: var(--steel-gray)`,
`--text-strong: var(--marka-lacivert)`, `--action-terracotta: var(--marka-kiremit)`, `--warn-amber: var(--marka-amber)`,
`--text-on-dark: var(--clean-white)`. Değer tek kaynakta kalır; `--marka-*` değeri değişirse takma ad onu izler ve INV-PALET-1'in
HEX çevrimi kolları (1. ve 2. kol) takma adı da korur. DS adının değeri sitede **yoksa** (`--text-body`, `--text-on-dark-muted`,
`--accent-air-green`) `index.css` `:root` türev bloğunda **tek literal** olarak yazılır; başka hiçbir dosyada ikinci tanım yok.
Dört sınıf:

| Sınıf | Koşul | Eylem | Canlıda |
|---|---|---|---|
| K1 | Değer sitede aynı, DS adı yok | Takma ad (`var(--mevcut)`) | Görünmez |
| K2 | Değer sitede yok, DS adı yok | `:root`'ta tek literal (HSL üçlüsü) | Görünmez (tüketici 0) |
| K3 | DS adı sitede var, değer farklı (çakışan küme) | 2a'da DOKUNULMAZ; 2b'de çevrilir (§2.2) | 2b'de görünür |
| K4 | Ad ve değer eşit | Eylem yok | — |

**INV-PALET-1 ile çatışma — DOSYADAN ölçüldü** (`src/__tests__/conformance/marka-palet-tokenlari.test.ts`, 129 satır):

1. **4. kol — "ölü legacy HEX değişkenleri geri gelmemiş" (satır 114–128): ÇAKIŞIR.** `SILINENLER` listesi satır 117–121'de ve
   `--text-muted` satır 120'de. Kapı `index.css`te `new RegExp(`${v}\s*:`)` arıyor (satır 122) — yani **adı** arıyor, **değeri
   okumuyor**. Bunu 15 DS adı üzerinde yerel bir betikle ayrıca doğruladım: `--text-muted: var(--steel-gray);` → eşleşir (KIRMIZI),
   `--text-muted: 220 9% 46%;` → eşleşir (KIRMIZI), `--text-on-dark-muted:` → eşleşmez, `--text-muted-foo:` → eşleşmez. DS adları ∩
   `SILINENLER` = **yalnız `--text-muted`** (15 ad üzerinde; kalan ~51 adın aynı kesişim kontrolü Faz 2a'nın ilk adımı).
   **Sonuç: v2'nin kurtarma yolu olan "takma ad" tek başına yetmez — takma ad da kapıyı kırar.** Red-team bunu "SILINENLER yalnız
   literal tanımı yasaklayacak biçimde daraltılsın" diye çözmüştü; bu doğru ve zorunlu.
2. **3. kol — "paletin İKİNCİ kaynağı doğmamış" (satır 99–112): ÇAKIŞMAZ, ama kısıt koyar.** Kapı `tailwind.config.js` metninde
   `marka-lacivert|turkuaz|kiremit|amber` alt dizesini arıyor (`TAILWIND.includes(ad)`, satır 107). Bugün Tailwind'de bu dizeler yok
   (ölçüldü). Kısıt: DS adları Tailwind'e **DS adıyla** bağlanır (ör. `text-strong` anahtarı `hsl(var(--text-strong) / <alpha-value>)`),
   **hiçbir yerde `marka-*` adı yayınlanmaz, yorum satırında bile yazılmaz.**
3. **1. ve 2. kol (satır 75–97): ÇAKIŞMAZ, takma adı korur.** `--marka-*` literal tanımı ve HEX çevrimi (kanal farkı ≤2); takma ad
   bu değerleri miras alır. Kapının regex'i `--marka-lacivert\s*:` aradığından `var(--marka-lacivert)` içindeki ad eşleşmez.

**Kapı güncellemesi (plan olarak; kod yazılmadı):**

- **Ne değişir:** 4. kol "bu ad `index.css`te geçmesin"den **"bu ad LİTERAL değerle tanımlanmasın"**e çevrilir. `SILINENLER`'deki bir
  ad bildirilmişse değeri `var(--<index.css'te tanımlı bir token>)` biçiminde olmalı; literal (HSL/HEX/rgba) → KIRMIZI; hedefi
  `index.css`te tanımlı olmayan `var()` → KIRMIZI.
- **Sabotaj (ölçüm planı):** (a) `--text-muted: 220 9% 46%;` literal → kırmızı; (b) `--text-muted: var(--steel-gray);` → yeşil;
  (c) `--text-muted: var(--yok-boyle-bir-token);` → kırmızı; (d) `--navy-800: 218 48% 20%;` (başka silinen ad, literal) → kırmızı.
- **Aynı kolun hâlâ yasakladığı:** 13 ölü HEX değişkeninin **literal** geri dönüşü. Cetvel §2.1'in kararı ("ölü legacy renk kaynağı
  geri gelmesin") **geri alınmıyor**; değişen yalnız takma adın "kaynak" sayılmamasıdır (takma ad yeni renk değeri açmaz).
- **Kim:** kapı dosyası ALTYAPI'nın (`src/__tests__/conformance/**`); TASARIM cetvelin §2.1 ve §3 4. kol metnini günceller ve ALTYAPI'ya
  PR emri/talebi Ops üzerinden gider. **Sıra:** kapı PR'ı Faz 2a PR'ından ÖNCE merge olur.
- **Onay:** Recep'in 2026-09-04 kararı (§2.1 silinenler) değişmediği için ayrı Recep sorusu açılmıyor; Ops'a bildirilir ve Ops teyit
  eder. Bu yorum TASARIM'ındır (şüpheli nokta: Ops "silinenler listesinden bir adın takma adla geri gelmesi" Recep'e yeniden
  sorulmalı mı derse soru §4'e eklenir).
- **Yedek yol (kapı PR'ı gecikirse):** `--text-muted` CSS değişkeni hiç tanımlanmaz; Tailwind'de DS adı yalnız sınıf anahtarı olarak
  `hsl(var(--steel-gray) / <alpha-value>)`'e bağlanır. Kapıya dokunmaz, ama DS adı ≠ CSS değişken adı olur ve parite kapısında ad
  eşleme tablosu gerekir. **Önerilen yol takma ad + kapı güncellemesidir**; yedek yalnız zaman baskısında.
- **Takma adın miras aldığı davranış (ÖLÇÜLMEDİ):** `--steel-gray` `@media (prefers-contrast: more)` içinde `220 15% 55%`'e değişiyor.
  `--text-muted` takma adı bunu da miras alır. Bunun DS değerine (`220 9% 46%`) göre hangi zeminde kontrastı düşürdüğü gerçek
  tarayıcıda Faz 2a'da ölçülür (jsdom ölçemez; cetvel §3).

### 2.2 · Çakışan küme ve ayrıştırma (YÜKSEK bulgu)

Küme (ölçüldü, 10-05 tablosu §1.3 ile red-team §2.1 aynı): **`--primary-navy`**, **`--brand-cyan`**, **`--action-terracotta-deep`**,
**`--font-sans`** (font kolu ayrı). `--brand-cyan-ink` eşit (küme dışı). `.light` bloğu `--primary-navy` ve `--brand-cyan`'ı ikinci kez
tanımlıyor; kaba grep'te (`classList`, `documentElement`, `setAttribute('class')`) bu sınıfı uygulayan kod bulunmadı → ölü görünüyor,
ama cetvel §2.1 "AdminThemeToggle referans veriyor" diyor; **kesinleştirilmedi**. Karar: parite kapısı yalnız `:root` bloğunu okur;
`.light` silme ayrı kayıt, silmeden önce ölçülür. `prefers-contrast` ve `[data-admin-theme]` DS adlarıyla çakışmıyor (ölçüldü).
`kenar.css` / `yuzey.css` ad listesi ve `--radius` (site `0.5rem`, marka handoff `0`; `var(--radius)` kullanımı 0, red-team) —
**ÖLÇÜLMEDİ**; manifest sayısı var (yüzey 6, kenar 6) ama ad listesi yok. Faz 2a'nın ilk adımı bu iki dosyayı okur ve küme tamamlanır.

**Ayrıştırma (görünür değişiklik nasıl izole edilir):**

| Ad | Site | DS | 2a'da | 2b'de |
|---|---|---|---|---|
| `--primary-navy` | `226 71% 40%` | `219 48% 20%` | Dokunulmaz. Aynı DS rengi **yeni adla** (`--text-strong` → `var(--marka-lacivert)`) görünmez eklenir | `--primary-navy: var(--marka-lacivert)` (tek satır, 798 eşleşme / 139 dosyanın rengi değişir) |
| `--brand-cyan` | `189 78% 53%` (koyu zemin tonu) | `194 100% 35%` | Dokunulmaz | `--brand-cyan: var(--marka-turkuaz)`. **Dikkat:** site değeri `53%` açıklıkta, koyu zeminde okunsun diye; DS değeri `35%`. Koyu zeminde kontrast gerçek tarayıcıda ölçülür (**ÖLÇÜLMEDİ**) |
| `--action-terracotta-deep` | `24.4 91% 39.2%` (#BF5309, K25-b kapalı karar) | `24 91% 39%` | Dokunulmaz | **Dokunulmaz — site değeri kazanır.** Fark kanal ≤2 (INV-TOKEN-AA-RENK-1 payının sınırında); DS'e düzeltme isteği OPS emriyle Design'a gider |
| `--font-sans` | Inter (`next/font` üretilmiş ad) | Archivo | Dokunulmaz | Font kolu (§2.5); DS dizesiyle eşitlik **aranmaz** (üretilmiş ad hiçbir zaman eşit olmaz) |

Neden takma ad, neden değeri doğrudan yazmak değil: `--primary-navy: 219 48% 20%` yazılsa DS'in yuvarlanmış değeri (#1B2C4B) siteye taşınır,
kapalı karar değeri (#1A2B4A) iki yerde olur. `var(--marka-lacivert)` ile değer tek kaynakta kalır ve INV-PALET-1'i miras alır.
**Alternatif (kademeli yol):** çevirmeyi hiç yapmamak, `primary-navy` mavisini Faz 4/5 göçleriyle eritmek. Reddedildi: sitede uzun süre iki
lacivert yaşar, DS "temiz" bir ürün olarak yarım uygulanır. Bu seçim Recep'in önizlemede göreceği şeydir (Faz 2b "olur"u).

### 2.3 · Admin etkisi (YÜKSEK bulgu)

**Ölçü.** `[data-admin-theme]` bloğu yalnız `--admin-*` adlarını tanımlar; `--primary-navy`, `--brand-cyan`, `--font-sans` adlarını
**ezmez**. Admin kök `layout.tsx`'in `body`'si altında render edilir.

**Sayım yöntemi SABİTLENDİ (ölçüldü 2026-10-05).** Dosya kümesi: `git ls-files 'src/*.ts' 'src/*.tsx'` çıktısından test dosyaları
(`__tests__`, `.test.`, `.spec.`) atılır → **717 dosya**; "admin" = yolunda `admin` geçen dosyalar → **210 dosya**. Sayı = dosya içeriğinde
kalıbın **toplam eşleşme sayısı** (`grep -o` mantığı, kalıp `\bprimary-navy\b`, `\bfont-mono\b`, `steel-gray`) / eşleşen dosya sayısı.
Aynı yöntem Faz 2b ön/sonra ölçümünde tekrarlanır. Kapsam `.ts`/`.tsx` ile sınırlıdır (`src` altındaki `.md`/`.json`/`.css` dosyaları sayıma girmez); girdi notundaki ve
red-team'deki sayılar bu yöntemle yeniden üretildi.

| Ölçüm (10-05, sabit yöntem) | Admin (210 dosya) | Tüm site (717 dosya) |
|---|---|---|
| `primary-navy` | **19 eşleşme / 4 dosya** (red-team 09-25 ile birebir) | 798 / 139 |
| `font-mono` | **63 / 33 dosya** (red-team ile birebir) | 68 / 37 |
| `brand-cyan` (`-ink` hariç) | 1 / 1 | 1 / 1 |
| `font-sans` | 3 / 3 (red-team "açık sınıf 2" saymıştı; kalıp değişken adını da yakalıyor, ayrıştırılmadı) | 4 / 4 |
| `steel-gray` | 0 / 0 | 339 / 80 |

Admin'de `font-mono` payı tüm sitenin 63/68'i: `fontFamily.mono` DS'e bağlandığında değişimin neredeyse tamamı admin'dedir.

**Faz bazında etki:**

| Faz | `[data-admin-theme]` bloğu | Admin görünümü | Ölçü |
|---|---|---|---|
| 2a | Etkilenmez (yalnız ekleme; bloğa dokunulmaz) | DEĞİŞMEZ | `[data-admin-theme]` blokları diff 0; INV-ADMIN-THEME-1..5 yeşil; `tailwind.config.js`'te `fontFamily.mono` bağlanmaz |
| 2b | Bloğa dokunulmaz ama admin `primary-navy` kullanımı, kök `body` fontu ve `font-mono` DEĞİŞİR | **DEĞİŞİR** | Önce/sonra admin ekranları; 4 sayı (primary-navy, brand-cyan, font-sans, font-mono) satır satır |

**Karar (Faz 2b'den ÖNCE, ayrı):** (A) admin dahil edilir — admin DS fontuna ve DS lacivertine geçer; (B) admin dondurulur —
`[data-admin-theme]` altında eski `--primary-navy`/`--brand-cyan` sabitlenir ve admin için Inter ayrıca yüklenmeye devam eder.
**Öneri: A.** Gerekçe: B, "Inter 0" ölçütünü bozar (admin için Inter baytı yüklenir), iki lacivert üretir ve her biri için `admin-design-standard`'a
yazılı istisna ister; A'nın görünür maliyeti küçük sayılardır (yukarıdaki dört sayı). Risk: admin'de `font-mono` etiketlerinin (63 kullanım / 33 dosya)
Plex Mono'ya dönmesi tablo hizasını değiştirebilir — önce/sonra ölçümü bunu gösterir.
**Kim onaylar:** ADMIN şeridi (`admin-design-standard.md` sahibi) karar verir, Ops kayda alır; Recep Faz 2b önizlemesinde admin
önce/sonrasını ayrı satır olarak görür. ADMIN kararı olmadan Faz 2b PR'ı açılmaz.

### 2.4 · Faz tablosu

| Faz | Ne | Canlıda görünür mü | Ölçü | Kim onaylar | Geri alma | Bekler |
|---|---|---|---|---|---|---|
| 0 | K36 kabuk kararı | HAYIR (karar) | Karar kaydı | Recep | — | — |
| ön koşul | INV-PALET-1 4. kol güncellemesi + cetvel §2.1/§3 | HAYIR | Sabotaj (a)–(d) kırmızı/yeşil/kırmızı/kırmızı; tam takım yeşil | Ops (ALTYAPI uygular) | PR revert | — |
| 1 | Kabuk (bayrak `YENI_KABUK_GEZINMESI`) | **HAYIR** (bayrak kapalı birleşir); açılış ayrı PR'da **EVET** | INV-KABUK-V18-1 (v18 A1–A5); önizleme dalında bayrak `true` | Recep (K36 + önizleme) | Bayrak `false` | K36 |
| 2a | Token köprüsü, görünmez kısım | **HAYIR** | Diff yalnız ekleme (`:root` ve `tailwind.extend`); 6 sayfada önce/sonra fark 0; INV-TOKEN-PARITE-1; INV-PALET-1 güncel | Ops | PR revert (tüketici 0) | Ön koşul; K36'yı BEKLEMEZ |
| 2b | Görünüm dönüşü (renk + yazı tipi) | **EVET (tüm site + admin)** | Önce/sonra ekran; Lighthouse LCP/CLS; font bayt; gerçek tarayıcı kontrast; `\bInter\b`; ISR CSS hash `curl` | **Recep "olur"** + ADMIN şeridi | Tek PR revert; veri/adres etkisi yok | 2a; ADMIN kararı; Recep olur |
| 3 | `components/ds/` 10 bileşen | **HAYIR** (tüketici yok; galeri rotası yok) | INV-DS-PROP-1; bileşen başına Vitest render + axe (INV-DS-GORSEL-1'in yeni tanımı, kontrast hariç); `pnpm knip` sonucu (§2.5) | Ops | PR revert | 2a (K36'yı BEKLEMEZ) |
| 4 | Sayfa göçleri | **EVET** (sayfa sayfa) | Kareyle yan yana ölçüm (elle, gerçek tarayıcı) | Recep (sıra), URUN (sayfa) | Sayfa PR'ı revert | 2b (renk/font), 3 (bileşen); (2): adres yayını |
| 5 | Borç eritme | EVET (küçük, kademeli) | INV-BORC-MANDAL-1 (yalnız küçülür) | Ops | PR revert | — |
| 11 Ekim sonrası | Tek aileli alt kategori sayfası (OPS-71, karar 285 EVET) | EVET (yayınlandığında) | Design prototipiyle yan yana ölçüm | Recep (ürün kararı verildi), URUN yürütür | URUN belirler (**ölçülmedi**) | Kod: 11 Ekim'den SONRA, ÜRÜN ile |

### 2.5 · Faz ayrıntıları

**Faz 0 · Kabuk kararı (K36) — Recep.** v2 ile aynı. Soru Ops üzerinden gider. *Faz 2a ve Faz 3 K36'yı BEKLEMEZ.*

**Faz 1 · Kabuk.** Kod URUN'un (`StickyHeader`, `HeaderTeklifPaneli`, `MobilAltSekmeCubugu`, `Footer`, `MainLayout`); dosya sahibi URUN,
TASARIM ölçer. Kapı INV-KABUK-V17-1 → **INV-KABUK-V18-1**. **Önizleme yöntemi (red-team §2.12):** bayrak derleme sabiti ve 3 kilit testi
(`header-teklif-paneli`, `mobil-alt-sekme`, `header-urun-secici`) `= false` bekliyor; bayrak `true` yapılırsa 2 kilit kolu kırmızı olur.
Bu yüzden önizleme **merge edilmeyen ayrı dalda** `true` ile yapılır (kilit kollarının o dalda kırmızısı beklenen, rapora yazılır);
Recep önizlemeyi görür; açılış (bayrağı `true` + kilit testlerini güncelleme) ayrı, Recep onaylı PR'dır. **`KabukBandi`** bileşeni Faz 3'te
ayrıca yazılmaz: `StickyHeader`'a bağlanır (tek kabuk).

**Faz 2a · Token köprüsü, GÖRÜNMEZ kısım** (TASARIM · migration yok · K36 beklemez). Adımlar:
1. **Ön koşul:** INV-PALET-1 güncellemesi (§2.1) merge olmuş.
2. **Okuma:** `kenar.css` ve `yuzey.css` DesignSync ile okunur; çakışan küme (`--radius` dahil) tamamlanır; 66 adın **ad ad** eşleşme tablosu
   (§1.3'te 15 ad var) cetvele yazılır; `SILINENLER` ∩ DS adları kesişimi 66 ad üzerinde yeniden doğrulanır.
3. **Kopya:** `src/design-system/ds-kaynak/*.css` damgalı kopya (başlık: "kopya · kaynak VentHub Design System 31b0824c · DS
   `updatedAt` 2026-09-14 · okuma tarihi"); DesignSync ile okunur, elle değiştirilmez. **Üreteç yok:** v2'deki `scripts/design/token-turet.mjs`
   çıkarıldı (red-team §2.8: `scripts/**` lint dışı, dizin sahipsiz, tazelik kolu iki damgayı aynı betik yazdığı için her zaman yeşil).
   Türev blok `index.css` `:root`'a **elle** yazılır (K1 takma ad / K2 literal kararı zaten insan kararı); kopya ile türev arasındaki tutarlılığı
   kapı ölçer.
4. **`index.css`:** yalnız EKLEME — K1 takma adlar, K2 literaller. Mevcut hiçbir değişkenin değeri değişmez. `--font-serif`/`--font-mono`
   **eklenmez** (font yüklenmeden anlamsız; Faz 2b).
5. **`tailwind.config.js`:** `theme.extend` açıkça (red-team §2.6: `theme.spacing`'e yazılırsa varsayılan ölçek silinir). **Yalnız YENİ
   anahtarlar:** renk anahtarları DS adıyla (`marka-*` YOK, §2.1 madde 2); boşluk rolleri `space-*` önekiyle (`w-page` 40 px ile `max-w-page`
   1600 px çakışmasın); yazı ölçeği `fontSize` DS'e özgü adla — **`display` anahtarına yazılmaz** (mevcut akışkan `clamp` anahtarı var,
   `tokens.js`). Her yeni anahtarın mevcut 45 renk anahtarı ve `tokens.js` anahtarlarıyla çakışması PR'da 0 olarak ölçülür.
   **`fontFamily.serif`/`mono` BAĞLANMAZ** (Faz 2b).
6. **Kapı INV-TOKEN-PARITE-1** (ALTYAPI dizininde; lint ve knip görür): her kopya adı için `index.css` `:root`'ta (a) aynı adla ve **çözülmüş
   RGB farkı ≤2** ile (takma ad zinciri çözülür) ya da (b) çakışan küme listesinde. Çakışan küme ad ad listelenir (4 ad; liste kapının içinde, 2b'de
   boşalır; `--font-sans` ayrı kol). Yön: **sitenin kapıyla korunan değeri kazanır** (örn. `--action-terracotta-deep`), DS'e düzeltme isteği
   Design'a OPS emriyle gider. İki kol: "kopya↔türev tutarlılığı" (adı **tazelik DEĞİL**: CI Design'a erişemez; DS yeni sürüm yayınladı mı sorusu
   CI'da ölçülemez ve tazelik TASARIM'ın işidir: Design proje yorumu → kopya yenilenir → kapı kırmızı → türev elle güncellenir) ve "türev blok
   kopyaya eşit, elle bozulmamış". Sabotaj: değer bozulur → kırmızı; çakışan kümeye izinsiz ad girer → kırmızı.
7. **INV-TOKEN-SINIF-1** (ALTYAPI): `p/m/gap/text` önekleri için adlı sınıf kümesi kolu (yazım hatalı adlı sınıf bugün hiçbir kapıya yakalanmıyor).
8. **Görünmezlik ölçüsü:** (i) `:root` ve `theme.extend` diff'i yalnız ekleme satırı; (ii) 6 vitrin sayfasında (ana, kategori, ürün, Bilgi Merkezi,
   teklif/sepet, bir hesaplayıcı) önce/sonra computed-style ve ekran farkı **0** — **ÖLÇÜLMEDİ, Faz 2a PR'ında koşulur**; (iii) admin ekranları aynı.

**Faz 2b · GÖRÜNÜM DÖNÜŞÜ** (TASARIM · tek PR · K8 önizleme · **Recep "olur"u ŞART** · ADMIN kararı ön koşul).
- **Renk:** §2.2 tablosundaki çevirmeler (`--primary-navy: var(--marka-lacivert)`, `--brand-cyan: var(--marka-turkuaz)`). `--action-terracotta-deep` dokunulmaz.
- **Yazı tipi (`next/font/google`):** Archivo ve Source Serif 4 **değişken eksenle** (aile başına 1 dosya × 2 alt küme; 16 woff2 yerine);
  IBM Plex Mono **statik** 400/500; `subsets: ['latin','latin-ext']` (ğ/ş; bugün Inter yalnız `latin` yükleniyor ve ğ/ş fallback fontla çiziliyor — "önce"
  ölçümüne yazılır); `display: 'swap'`; Source Serif 4 ve Plex Mono `preload: false` (ilk ekranda kullanılmıyor). Değişken eksen ve statik/dinamik
  ayrımı kurulum anında `next/font` türleriyle doğrulanır (**ölçülmedi**). `body` hem `inter.variable` hem `inter.className` taşıyor (`layout.tsx:42`):
  ikisi **birlikte** değişir (`className` `--font-sans`'ı atlar). `--font-serif`/`--font-mono` ve Tailwind `fontFamily.serif/mono` bu PR'da bağlanır.
- **"Inter 0" ölçütü iki parça:** (a) vitrin kökü: `\bInter\b` kalıbıyla (çıplak `Inter` `Interface`/`Intersection`'ı da yakalar) `layout.tsx` ve vitrin
  bileşenlerinde **0** — kapı; (b) adıyla listelenmiş **3 istisna**, yeni istisna eklenemez: `InventoryQrLabel.tsx` (admin etiketi; ADMIN kararı),
  `Product3DViewer.tsx` `GizmoViewcube font` (3D, K-4), `pdfGenerator.ts` Roboto (teklif PDF; DS "dördüncü aile yok" kuralına istisna satırı; PDF
  Belge projesinin konusu). E-posta şablonları Arial/system-ui (Inter 0, ölçüldü).
- **Ölçüm (rapor sayılarla):** (a) önce/sonra ekran — ana, kategori, ürün, Bilgi Merkezi, teklif/sepet, admin panosu ve **bir gradyan yüzeyi**
  (`from-primary-navy to-secondary-blue`: 21 kullanım / 15 dosya, red-team 09-25; `--secondary-blue` DS'te yok, DS laciverti DS dışı maviye akar);
  (b) Lighthouse LCP/CLS önce/sonra, üç ailenin toplam font baytı (kural 10); (c) gerçek tarayıcıda kontrast oranı — lacivert zemin üzerinde beyaz,
  turkuaz yüzeyler, **koyu zeminde yeni `--brand-cyan`** (jsdom ölçemez); (d) `\bInter\b` ölçütü; (e) **ISR CSS yayılımı:** dağıtımdan sonra 3 ISR
  adresinde (ana, kategori, ürün) `curl` ile `<link rel=stylesheet>` hash'i yeni build'inkine eşit mi — red-team bunu ölçemedi, TASARIM ölçer.
- **Admin:** §2.3 (karar ön koşul; sayılar PR'da satır satır).
- **Geri alma:** tek PR revert; veri/adres etkisi yok. Risk: önbellekte eski CSS adresi gösteren sayfa (en kötü durumda eski görünüm geçici, stil kırılmaz).

**Faz 3 · Bileşen kütüphanesi `src/components/ds/`** (TASARIM · alt ajan ×3 · K36 beklemez). **10 bileşen**
(AnaEylemDugmesi, CerceveliDugme, KatliCagriSatiri, AdetKontrolu, KarsilastirmaTablosu, PQEgrisi, TeknikTablo, Cip, HukumKutusu, Kart);
**`KabukBandi` Faz 1'e bağlıdır** (`StickyHeader`'a bağlanır, ayrı yazılmaz; red-team §2.9). `Kart` ↔ `ProductCard`/`FamilyCard` yakın işlevli:
`Kart` yazılırken bu iki bileşenle ilişki (mevcut kullanım sayısı) PR'da ölçülür (**ölçülmedi**). Kaynak: DS canlı `.jsx`/`.d.ts`/`.prompt.md`
(TASARIM kopyalar; alt ajanlar Design'a erişemez, depo içi kopya verilir). **Galeri rotası `/[lang]/ds-galeri` ÇIKARILDI (v2'den sapma).**
*Gerekçe (red-team ne istedi, biz ne seçtik):* red-team §2.7 galerinin **çıkarılmasını istemedi**; galeri kalacaksa `generateMetadata`'da `robots: { index: false }`,
bayrak kilidi ve kilit testi istedi. Biz çıkarmayı seçtik, çünkü karar 118'in kapısı ("rota klasörü ekleme 0", §3 K-1) **istisna açılmadan sade** kalıyor: galeri
"hariç" denirse kapı bir adı çakılı istisna taşır, galeri için ayrıca noindex + robots + bayrak kilidi ve bayrak kapalıyken görsel kapının neyi ölçtüğü sorusu doğar.
*Riski:* bileşenlerin görsel eşitliğini izole bir sayfada (gerçek sayfa bağlamı olmadan) ölçen kapı kaybolur.
**Yerine (Faz 3 ölçüsü, INV-DS-GORSEL-1'in yeni tanımı):** her `components/ds/` bileşeni için **Vitest render + axe testi** — bileşen yanında (`components/ds/**`
TASARIM'ın claim'inde), varsayılan hâl + her kip/varyant (Teklif ↔ Satış, K38/K39) render edilir, axe ihlali **0**, `.d.ts` sözleşmesiyle prop uyumu
INV-DS-PROP-1'de. **Bu testin ÖLÇEMEDİĞİ:** kontrast (axe `color-contrast` kuralı jsdom'da koşmaz, cetvel §3) ve karedeki görünüme eşitlik. Görsel doğrulama Faz 4'te gerçek
sayfalarda kareyle yan yana ölçüm olarak (elle, gerçek tarayıcı) kalır.
**CLAUDE.md kural 14 ile gerilim (açıkça adlandırıldı):** kural 14 "testi/kapıyı sonraki işe bırakma" der; görsel eşitlik kapısı Faz 3'ten Faz 4'e kaymış oluyor. Bu bir
kapsam tavizidir, TASARIM'ın savunması: o ölçüm gerçek sayfa bağlamı olmadan anlam taşımaz ve jsdom'da koşamaz; Faz 3'te yapısal + a11y kapı bugün kurulur. Kapatma koşulu:
her bileşenin ilk tüketicisi olan Faz 4 PR'ında kareyle yan yana ölçüm rapora sayıyla yazılır. İstenirse alternatif: K-1'e galeri istisnası + noindex + bayrak kilidi (red-team
yolu) — Ops karar verir (§4, "Ops'a bildirilecekler").
INV-DS-PROP-1 (prop sözleşmesi, `.d.ts`) kalır. **Risk (ÖLÇÜLMEDİ):** tüketicisi olmayan `components/ds/` dosyaları `pnpm knip`'te "kullanılmayan"
çıkabilir; Faz 3 PR'ında `pnpm knip` koşulur, çıkarsa muafiyet/ignore ya da bileşenleri ilk tüketiciyle (Faz 4) birlikte getirme kararı Ops'a gider.
Yol notu: Ops emri `src/components/ui/**` dedi; **`ds/` önerisi sürer** (`ui/`'de DS ile ilgisiz 4 primitif: Pagination, ScrollObserver, Skeleton, VentImage;
ayrı klasör kapının kapsamını tek glob'la sınırlar). Bu sapma Ops'a **bildirilir**.

**Faz 4 · Sayfalar** (sıra envanter §3 + karar 118 + karar 285). Sayfa dosyaları URUN'un; TASARIM bileşeni verir, kareyle yan yana ölçer.
1. **Bilgi Merkezi** (URUN kuruyor; DS bileşenleri gelince göçer). Uzun metin ölçüsü DS tokenıyla (`--size-editorial`, `--lh-editorial`; 16 px · 1.6 · 66ch) bağlanır — **bloklanmıyor** (§1.2, Design cevabı geldi).
2. **Ürün sayfası + kategori/liste görünüm göçü — adres yayınından SONRA, ayrı yayında.** Ön koşul: adres yayını (URUN, REC-300/442 ürün adresi;
   `ADRES_SEMASI_K3B`) canlıda açık ve ölçülmüş. Bugün (10-05) bayrak `false`. v2'nin "adres işiyle aynı yayında" cümlesi **kaldırıldı**:
   görünüm ve adres aynı sürümde değişirse geri alma iki şeyi birden geri alır ve karar 118'in "adres önce" sırasıyla çelişir.
3. teklif listesi → 4. arama sayfası → 5. karşılaştırma → 6. senaryo.
- **11 Ekim sonrası (karar 285, OPS-71):** tek aileli alt kategori sayfası. Design bunu prototipte yapıyor; **KOD tarafı 11 Ekim'den SONRA, ÜRÜN ile
  birlikte**. Sayfa yolu ve veri ÜRÜN'ün; TASARIM yalnız tasarımla ölçer ve bu satırdan dolayı `src/app` altına dosya eklemez (K-1).

**Faz 5 · Borç eritme.** v2 ile aynı (INV-BORC-MANDAL-1: `bg-primary-navy`, `rounded-*`, `shadow-*` yalnız küçülür); vitrin/admin ayrımı mandalın içinde,
admin sayıları (rounded-admin 383, shadow-admin 89) mandala girmez; Tailwind varsayılan `borderRadius`/`boxShadow` ölçeği global sıfırlanmaz.
Taban: §1.3 kural 8 sayıları (arbitrary değer vitrin 4 · admin 2 · diğer 8; ham HEX vitrin 53 · admin 50 · 3D 61 · diğer 8).

## 3 · Kısıtlar

- **K-1 · Karar 118: tasarım geçişi hiçbir vitrin adresini değiştirmez.** Design karelerindeki adres etiketleri (`/tr/secici`, `/tr/urunler`,
  `/tr/teklif-listesi`, `/tr/hesap/*`) hedef değil çizim notudur; adres kararı yalnız `adres-semasi-standard.md` / REC-300 (URUN) yolundan.
  **Bu planın hiçbir fazı `src/app` altına yeni rota klasörü eklemez** (v2'nin galeri rotası çıkarıldı; "galeri hariç" istisnası yok; gerekçe ve riski §2.5 Faz 3'te).
  **Kapının ölçülebilir tanımı:**
  - *Kapsam:* "Faz PR'ı" = dal adı `tasarim/` ile başlayan her PR. URUN'un `urun/*` dalları (adres şeması, Bilgi Merkezi, OPS-71) kapıya tabi DEĞİL.
  - *Komut (çıktı BOŞ olmalı):* `git diff --name-status --diff-filter=ADR <taban>...HEAD -- ':(glob)src/app/**/page.tsx' ':(glob)src/app/**/route.ts'
    ':(glob)src/app/**/layout.tsx' ':(glob)src/app/**/loading.tsx' ':(glob)src/app/**/error.tsx' ':(glob)src/app/**/not-found.tsx' ':(glob)src/app/**/template.tsx'
    ':(glob)src/app/**/default.tsx'`.
    `A` (ekleme), `D` (silme) ve `R` (taşıma) 0; `M` (değişiklik) serbest — Faz 2b'nin `layout.tsx` font değişikliği `M`'dir.
    **Pathspec notu (ölçüldü 10-05):** düz `'src/app/**/layout.tsx'` biçimi kökteki `src/app/layout.tsx` ve `src/app/not-found.tsx` dosyalarını **yakalamaz**
    (`git ls-files` ile denendi: düz biçim bu ikisini listelemiyor, `:(glob)` biçimi listeliyor; düz `**` en az bir alt dizin ister). Bu yüzden komut `:(glob)` biçimindedir.
    Komut `35224a3c5...HEAD` aralığında çalıştırıldı: çıktı **boş** (0 ihlal); aynı aralıkta `:(glob)docs/plans/**/*.md` pathspec'i eklenen belgeyi `A` olarak gösterdi
    (komut biçimi çalışıyor).
  - *İkinci kol:* aynı aralıkta `next.config.mjs`, `src/middleware.ts`, `':(glob)src/app/robots*'` ve `':(glob)src/app/sitemap*'` için diff **boş** (bu dört yol aynı komuta
    pathspec olarak eklenir; 10-05'te çıktı boş).
  - *Durum:* bugün kalıcı test **yok** (⚠SINANMIYOR). Şimdilik her `tasarim/*` PR raporuna komut çıktısı sayı olarak yazılır (0). Kalıcı kapı (CI'da dal adı ölçen
    test) ALTYAPI'dan Ops üzerinden istenir; ad önerisi `INV-ADRES-TASARIM-1`, adı Ops/ALTYAPI verir.
  - Zorunlu bir rota ihtiyacı çıkarsa: yalnız kalıcı yönlendirmeyle ve Recep onayıyla; bu plan değişir (v2.2).
- **K-2 · Kural 8:** arbitrary Tailwind 0, ham HEX 0 (DS değerleri HSL), `focus-visible:`.
- **K-3 · Admin:** v2'de "kapsam dışı" idi; v2.1'de **Faz 2b'de etkilenir** ve ADMIN kararı ön koşuldur (§2.3). Faz 2a'da admin DEĞİŞMEZ.
- **K-4 · 3D kapsam dışı** (kural 9); `Product3DViewer`'daki Inter adı adıyla listelenmiş istisnadır (§2.5).
- **K-5 · Kip:** bileşenler K38/K39 kip ayrımını prop ile taşır (Teklif ↔ Satış), metin sözlükten (kural 7).
- **K-6 · RSC:** DS bileşenleri varsayılan sunucu bileşeni; etkileşimli olanlar (`AdetKontrolu`, `KatliCagriSatiri`, `KarsilastirmaTablosu` "farkı göster") uç `'use client'`.
- **K-7 · DesignSync yalnız OKUMA** (üst bölümde yazılı): koddan Design'a yazma yok; yön Design → kod.

## 4 · 11 Ekim önerisi ve Recep'e gidecek sorular (numarayı Ops verir; ayrı ayrı, pakete gömülmez)

**Karar 271: 11 Ekim kapsamı = dilim 1.** Dilim 1'in içeriği bu belgenin girdilerinde **yok** (**ölçülmedi**); aşağıdaki öneri yalnız "11 Ekim kapsamı dilim 1"
cümlesine ve fazların bağımlılıklarına dayanır. **Karar Recep'indir; TASARIM kararı vermez, tek öneri yazar.**

> **ÖNERİ: 11 Ekim'e yalnız Faz 2a (+ ön koşul olarak INV-PALET-1 güncellemesi) girer. Faz 2b, 3, 4 ve 1 girmez.**
> **Gerekçe:** 2a görünmez, K36'ya bağlı değil, migration/rota/adres içermiyor, tek PR ile geri alınır ve tüketicisi sıfır olduğu için canlıyı
> bozamaz; ölçüsü (diff yalnız ekleme + 6 sayfada fark 0) 6 günde koşulabilir. 2b görünür ve bütün siteyi + admin'i değiştirir: ADMIN kararı, Recep önizlemesi,
> gerçek tarayıcı kontrast ölçümü, Lighthouse ve ISR CSS ölçümü ister; 11 Ekim'e sıkıştırılırsa ölçüm atlanır (kural 14'e aykırı).
> **Risk:** (1) ALTYAPI'nın kapı PR'ı gecikirse 2a kayar (2a o PR'dan önce açılamaz; yedek yol §2.1 var ama DS adı ≠ CSS adı üretir);
> (2) DS yeni sürüm yayınlarsa kopya bayatlar (09-14'ten beri değişmedi; içerik sürüm farkı ÖLÇÜLMEDİ); (3) `kenar`/`yuzey` ad listesi okunana kadar küme
> eksik kalabilir ve 2a'nın ilk adımı bunu kapatır; (4) Recep dilim 1'den **görünür** bir şey bekliyorsa 2a bunu karşılamaz — görünür kazanım için 2b gerekir ve
> o 11 Ekim'den sonradır.

**Sorular:**
1. **K36 kabuk kararı** — v18 A kanalı kabuğu canlı sitenin kabuğu olsun mu? (Faz 1'in kilidi; yapısal karar, tek başına.)
   Karar Recep'indir; TASARIM tek öneri yazar, planın kendi metninden ve özellik bayrağından türetilmiştir:

   > **ÖNERİ (K36): "EVET" de, ama kaydı "kabuğun yazımına izin" olarak oku — canlı kabuğu açmaz; açılış ayrı, Recep onaylı PR'dır.**
   > **Gerekçe (ziyaretçiye etkisi):** `YENI_KABUK_GEZINMESI` kapalı doğuyor ve kodun kendi notu "yarısı açık bir kabuk, kapalı bir kabuktan KÖTÜDÜR" diyor
   > (`src/config/features.ts:47-48`); bayrak mobil alt sekme çubuğunu ve header "Teklif" panelini tek anahtarla yönetiyor ve açmadan önce gözle doğrulama istiyor
   > (`:54-56`). Yani K36'ya "evet" demek tek başına ziyaretçinin gördüğünü değiştirmez: bayrak `false` kalır, kilit testleri `= false` bekler, açılış anı Faz 1
   > önizlemesinden sonra ayrı onaydır (§2.5 Faz 1). K36'nın bağladığı yer yalnız Faz 1 (KabukBandi, bayrak) ve kabuğa bağlı sayfa göçleridir; **Faz 2a ve Faz 3
   > K36'yı beklemez**, karar gecikse de onlar akar. "Hayır/bekle" denirse Faz 1 durur ve kabuk yazımı belirsiz kalır; envanter kabuk kodunun yazılı ama kapalı olduğunu
   > söylüyor (`StickyHeader`, `Footer`, `HeaderTeklifPaneli`, `MobilAltSekmeCubugu`), yani beklemenin getirisi "yazılmış kodu kullanmamak"tır.
   > **Risk:** (1) EVET, v18 A1–A5'in (HAZIR) çekirdeğini taahhüt eder; A0, A2b, A5b, A6, A7 YARIM ve A8/A9 "öneri" (envanter §1 birim 2) — bu karelerin K36 kapsamına
   > girip girmediği **ölçülmedi**; öneri K36'nın yalnız A1–A5'i kapsaması, yarımların ayrı karar olması. (2) Bayrak açılınca mobil alt çubuk ile header aynı işi iki kez
   > sunabilir (kodun kendi uyarısı; kapı semantik çakışmayı göremez) → açılış PR'ında gözle ölçüm şart. (3) Kabuk dosyalarının sahibi URUN; URUN'un Faz 1 takvimi
   > **ölçülmedi**. (4) Recep 09-25'te "önümüzdeki hafta site dizaynıyla yoğunlaşacağız" demişti (niyet var, karar kaydı yok); karar kaydı çıkmadıkça bu niyet plana
   > bağlanamaz.
2. **Hangi faz 11 Ekim'e girsin** — öneri yukarıda (Faz 2a). Karar Recep'in.
3. **Faz 2b görünüm dönüşü** — önizlemede görüp "olur" demesi (soru değil onay; PR hazır olunca; ADMIN kararından sonra).
- *ADMIN kararı* (dahil/dondur) Recep sorusu değil, ADMIN şerit kararıdır (Ops ADMIN'e taşır, kayda alır); Recep önizlemede admin farkını ayrı satırda görür.

**Ops'a bildirilecekler (v2'den sapmalar ve talepler; Recep sorusu değildir):**
1. **Galeri rotası çıkarıldı (v2'den sapma).** Gerekçe, riski ve kural 14 gerilimi §2.5 Faz 3'te; yerine bileşen başına Vitest render + axe, görsel doğrulama Faz 4'te elle.
   Ops isterse alternatif: K-1'e adı çakılı galeri istisnası + `robots: { index: false }` + bayrak kilidi (red-team yolu).
2. `token-turet.mjs` üreteci çıkarıldı; `ds-kaynak` kopyası + kapı kaldı (§2.5 Faz 2a).
3. `components/ds/` yolu (Ops emri `components/ui/**` demişti) sürüyor; `KabukBandi` Faz 1'e bağlandı, Faz 3 = 10 bileşen.
4. INV-PALET-1 4. kol güncellemesi için ALTYAPI emri (Faz 2a'dan önce); kalıcı K-1 kapısı (`INV-ADRES-TASARIM-1` önerisi) talebi.
5. Uzun metin ölçüsü çelişkisi kapandı (Design cevabı; Linear yorumu doğrudan okunmadı, Ops aktarımı) — hiçbir faz bloklanmıyor.

## 5 · Sahiplik

- **TASARIM:** Faz 2a, 2b, 3; Faz 1 ve 4'te ölçüm; cetvel (`marka-token-eslemesi-standard.md`) güncellemesi; DS kopyası.
- **ALTYAPI:** `src/__tests__/conformance/**` (INV-PALET-1 güncellemesi, INV-TOKEN-PARITE-1, INV-TOKEN-SINIF-1 kolu, INV-DS-PROP-1) ve `package.json`.
  Red-team §2.10: v2'nin §5'i ALTYAPI'yı hiç anmıyordu.
- **URUN:** Faz 1 kabuk kodu (dosyalar onun), Faz 4 sayfalar, adres (REC-300/442), OPS-71 sayfa yolu/veri. URUN'un claim'i `src/**` değil, dizin listesidir
  (`src/app/**`, `src/components/**`, `src/design-system/**`, `src/config/**`, `next.config.mjs`, `src/middleware.ts` …; red-team 09-25 ölçümü).
- **ADMIN:** Faz 2b admin kararı (`admin-design-standard.md`).
- **Design:** kaynak (DS/Marka/Menü). **Ops:** soruların Recep'e taşınması, claim eşleşmeleri, REC-165'in TASARIM'a devri, `ds/` sapmasının kaydı.
- **Claim** (Ops üzerinden; ölçüm: `src/index.css` ve kökteki `tailwind.config.js` red-team 09-25'te kimsenin claim'inde değildi; 10-05'te `board.cjs who` **koşulmadı**):
  `src/design-system/**`, `src/components/ds/**`, `src/index.css` (yalnız `:root` türev bloğu), `tailwind.config.js`, `src/app/layout.tsx` (yalnız font).
  `scripts/design/**` claim'i gerekmedi (üreteç çıktı).

## 6 · Mega menü notu (kısa; ürün tarafına devir)

Masaüstünde kökler yatay şerit **değil**: "Kategoriler" düğmesi `CategoryHubOverlay` açar (2 sütunlu kök listesi, **sabit 600 px yükseklik**, iç kaydırmalı).
7. kök (Sığınak) 1024–1280 px aralığında taşma/binme üretmiyor (simülasyon). Sığınak kökü migration #1692 ile gelir ve menüde ancak ≥1 ürünü varsa görünür.
**Devir notu (ürün):** menü yüksekliği 600 px sabit olduğu için kısa pencerede 4. satır kırpılır; çözüm (yükseklik, kaydırma ya da kök sayısı) ürün tarafının
kararıdır. TASARIM'ın ilgisi: bu sabit yükseklik Faz 4/Kabuk ölçümünde kareyle karşılaştırılır.

## 7 · Bitti sayılır

INV-PALET-1 güncel ve yeşil (takma ad izinli, literal yasak) · INV-TOKEN-PARITE-1 yeşil (çakışan küme boş; `--font-sans` ayrı kolda) · `\bInter\b` vitrin kökünde 0,
3 istisna adıyla listeli · 10 bileşen `components/ds/` + INV-DS-PROP-1 yeşil · KabukBandi Faz 1'e bağlı · Faz 2b önizleme "olur" + ADMIN kararı + önce/sonra
ölçümleri raporda (ISR CSS hash dahil) · her `tasarim/*` PR'ında K-1 komutu çıktısı 0 · cetvel `marka-token-eslemesi-standard.md` yazı tipi, yarıçap/gölge, boşluk,
bileşen ayaklarıyla ve takma ad kuralıyla güncel · `storefront-design-standard.md` bileşen satırı + kapı · INV-BORC-MANDAL-1 kurulu.

## 8 · Ölçülmeyenler ve açık kalemler (hepsi "ölçülmedi"; uydurma değer yok)

| Kalem | Durum | Kim / ne zaman |
|---|---|---|
| DS dosya içerik sürüm farkı | ölçülmedi (yalnız `updatedAt` + sayılar) | TASARIM, Faz 2a adım 2 |
| Uzun metin ölçüsü: DS değeri 16 px/1.6/66ch geçerli (Design cevabı, Menü v18 3 Ekim) | **KAPANDI** (Ops aktarımı; Linear yorumu `8a37e60b` bu oturumda DOĞRUDAN okunmadı; Menü v18 3 Ekim sürümü DesignSync ile okunmadı) | Faz 2a kopyayı okurken `--size-editorial`/`--lh-editorial` değerini teyit eder; hiçbir faz bloklanmıyor |
| `kenar.css` / `yuzey.css` ad listesi, `--radius` çakışması | ölçülmedi | TASARIM, Faz 2a adım 2 |
| DS'in kalan ~51 adı için ad ad eşleşme ve `SILINENLER` kesişimi | ölçülmedi | TASARIM, Faz 2a adım 2 |
| `font-serif` kullanım sayısı | ölçülmedi | TASARIM, Faz 2b ön ölçüm |
| Hangi ham HEX'in DS karşılığı olduğu | ölçülmedi | Faz 5 mandalı kurulurken |
| `tailwindcss/no-arbitrary-value` muafiyeti, `pnpm lint` | koşulmadı | Faz 5 |
| Admin kullanım sayıları | **ölçüldü 10-05, yöntem sabitlendi** (§2.3): primary-navy 19/4, font-mono 63/33; admin `font-sans` 3/3'ün ayrıştırması (sınıf mı değişken adı mı) ölçülmedi | TASARIM, Faz 2b ön/sonra (aynı yöntemle) |
| `.light` sınıfı gerçekten ölü mü | kaba grep'te uygulayan kod yok; cetvel "AdminThemeToggle referans veriyor" diyor; kesinleşmedi | ADMIN/ALTYAPI, silmeden önce |
| `--text-muted` takma adının `prefers-contrast` davranışı | ölçülmedi | TASARIM, Faz 2a (gerçek tarayıcı) |
| `--brand-cyan` yeni değerinin koyu zeminde kontrastı | ölçülmedi | TASARIM, Faz 2b |
| Faz 2a "görünmez" ölçüsü (6 sayfada fark 0) | ölçülmedi | TASARIM, Faz 2a PR'ı |
| ISR sayfalarında CSS hash yayılımı | ölçülmedi | TASARIM, Faz 2b dağıtımı sonrası |
| `components/ds/` tüketicisiz → `pnpm knip` | ölçülmedi | TASARIM, Faz 3 PR'ı |
| Menü v18 3 Ekim sürümünün DS değerine döndüğünün DesignSync ile doğrudan teyidi | ölçülmedi (Ops aktarımına dayanır) | TASARIM, Faz 2a kopya okuması |
| Galeri yerine Vitest render + axe kapısının yeterliliği (kural 14 gerilimi) | ölçülmedi; kontrast ve kareye eşitlik jsdom'da ölçülemez | Faz 4 ilk tüketici PR'ı; Ops alternatifi seçerse K-1 istisnası |
| K36 kapsamında A0, A2b, A5b, A6, A7 (YARIM) karelerinin olup olmadığı; URUN'un Faz 1 takvimi | ölçülmedi | Recep/Ops (K36), URUN |
| Karar 271 "dilim 1" içeriği | bu belgenin girdisinde yok | Ops |
| OPS-71 geri alma yöntemi | ürün tarafı belirler | URUN |
| `board.cjs who` claim durumu (10-05) | koşulmadı | Ops |
| Bu belge işinde `pnpm test`/`knip`/`lint` | koşulmadı (yalnız belge; kod yok) | — |

---

**ÖLÇÜM:** 2026-10-05 · master `fe2a7fa95`; ana depo bugünkü HEAD `74e50d280`; ilgili dosyalarda (`src/index.css`, `tailwind.config.js`, `src/design-system`, `src/app/layout.tsx`,
`marka-palet-tokenlari.test.ts`) `fe2a7fa95`→HEAD diff boş (doğrulayıcı ölçtü). Bu belgenin sayımları ve K-1 komutu çalışma ağacında (taban `35224a3c5`, `fe2a7fa95`'in torunu) koşuldu;
aynı dosyalarda `fe2a7fa95`→`35224a3c5` farkı da **0** (`git diff --stat` boş, yazarın ölçümü). Uzun metin ölçüsü kapanışı (Design cevabı) Ops aktarımıdır: Linear yorumu `8a37e60b` bu oturumda
DOĞRUDAN okunmadı · kaynak dosyalar:
`docs/plans/tasarim-kod-plani-v2-2026-09-25.md`, `docs/plans/red-team-tasarim-kod-plani-v2-2026-09-25.md`,
`docs/standards/marka-token-eslemesi-standard.md`, `src/__tests__/conformance/marka-palet-tokenlari.test.ts` (dosyadan okundu; takma ad regex'i yerel betikle örnek
dizeler üzerinde denendi, test koşulmadı), `docs/audits/tasarim-envanteri-2026-09-25.md`, v2.1 girdi ölçüm notu 2026-10-05 (DS `updatedAt`/token/bileşen/kart sayıları, site token
envanteri, DS↔site eşleşmesi, kural 8 sayıları, kapılar, Ops notları), `src/config/features.ts` (bayrak değerleri), `src/app/layout.tsx`, `src/index.css`, `tailwind.config.js`
(satır doğrulamaları).
