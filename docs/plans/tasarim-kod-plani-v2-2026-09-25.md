# Tasarım → Kod Planı v2 (2026-09-25, TASARIM) — TASLAK

> **DURUM: TASLAK — ONAYSIZ, UYGULANMAZ.** plan-challenger (bağımsız red-team) 2026-09-25 öğlen başlatıldı,
> pencere park edilmeden **tamamlanmadı** → bu taslak **çürütme incelemesinden GEÇMEMİŞTİR**. Tasarım haftasının
> (2026-09-28) ilk adımı: plan-challenger'ı bu dosya üzerinde yeniden koşmak, bulguları işlemek, sonra Ops/Recep onayı.
> Ölçülmemiş ön koşullar metinde "ölçülmedi" diye işaretli (özellikle çakışan token kümesinin tamamı ve admin etkisi).

**Ne:** Linear belgesi "Tasarım → Kod Planı" v1'in (OPS, 2026-09-06, `71cb352a`) ve onun Faz 2+3 kaydı REC-165'in
19 günlük değişiklikle tazelenmiş hâli. v1'in fazları, kapı adları ve yöntemi **korunur**; bu belge yalnız
**farkları** ve yeni kısıtları yazar. Uygulama 2026-09-28 haftası (Ops, karar 118 sonrası).

**KAYNAK / CETVEL:** yöneten cetvel `docs/standards/marka-token-eslemesi-standard.md` (palet ayağı yazılı; yazı tipi,
yarıçap/gölge, boşluk ve bileşen ayakları **bu işin kapsamında yazılır** — cetvel kendi "Durum" satırında bunları
"Design export'u geldiğinde eklenecek" diye bekletiyor) + `storefront-design-standard.md` (bileşen kuralı satırı) +
CLAUDE.md kural 8/10 + Kararlar 15A K5 · K11 · K22 · K25/K25-b · K26–K28 · K33 · K35 · K38/K39 + karar 118.
Karne / ölçüm tazeliği: `docs/audits/tasarim-kod-envanteri-2026-09-06.md` (19 gün; komutlarıyla yeniden koşulacak) +
`docs/audits/tasarim-envanteri-2026-09-25*.md` (bugün). DS canlı: `tokens/renk.css`, `tokens/tipografi.css`,
`ds-devir-uygulandi-2026-09-14.md` (DesignSync ile okundu, 2026-09-25).
**YÖNTEM:** plan = elle + plan-challenger (zorunlu). Uygulama: TASARIM şeridi, kendi worktree; Faz 3 bileşenleri alt
ajan ×3 (v1 ile aynı), her faz ayrı PR. Migration 0.

---

## 1 · v1'den bu yana değişen olgular (ölçüldü)

| # | v1 (09-06) | Bugün (09-25) | Plana etkisi |
|---|---|---|---|
| 1 | DS 57 token | **66 token** — `tokens/olcu.css` eklendi: 9 boşluk rol tokenı (`--space-tight` 5 … `--space-page` 40) | Faz 2 eşleme 66; boşluk rolleri `tokens.js`/Tailwind `spacing`'e |
| 2 | 10 bileşen | **11 bileşen** — `HukumKutusu` eklendi (K31 semantik renk çiftleri) | Faz 3 sırasına girer |
| 3 | Kaynak kare v17 | **v18** (52 kare, 8 kanal; v17 arşivde) | Faz 1 kapısı v18 A kanalıyla ölçülür |
| 4 | Yazı tipi yok | DS `tipografi.css`: **Archivo** (arayüz) · **Source Serif 4** (açıklama/uzun metin) · **IBM Plex Mono** (kod, teknik değer, etiket); "dördüncü aile eklenmez, **Inter kullanılmaz**". Site: `src/app/layout.tsx:12` `Inter({ variable: '--font-sans' })` | **YENİ Faz 2b** (aşağıda) |
| 5 | "`--marka-*` → DS adlarına köprü, kırılma yok" | DS adları sitede ZATEN VAR ama değerleri farklı: `--primary-navy` DS `219 48% 20%` (#1A2B4A) ↔ site `226 71% 40%` (#1D3FAE); `--brand-cyan` DS `194 100% 35%` ↔ site `189 78% 53%` | Köprü **görünmez değil**: aynı adın değerini değiştirmek bütün sitenin rengini değiştirir (153 `bg-primary-navy`). Faz 2 ikiye bölünür (§2) |
| 6 | Adres konusu yok | **Karar 118 (Recep, 2026-09-25): adres önce**; tasarım geçişi adres şemasını bir daha değiştirmez | Kısıt K-1 (§3) |
| 7 | Faz 0 = K36 (kabuk kararı) "bugün" | **K36 hiç yazılmadı** (Kararlar aynası satır 389: "verilirse K36 olur"). Recep 09-25: "önümüzdeki hafta site dizaynıyla yoğunlaşacağız" — niyet var, karar kaydı yok | Faz 0 hâlâ kilit; soru Ops üzerinden Recep'e (numarayı Ops verir) |
| 8 | Sahip URUN | TASARIM şeridi kuruldu (Ops, 09-25): tokenlar, yazı, temel bileşenler TASARIM'ın; sayfaların yolu/verisi/SEO URUN'un | §5 sahiplik |
| 9 | — | Design içinde değer çelişkisi: DS uzun metin 16 px / 1.6 / 66ch ↔ Menü v18 F1 17 px / 1.65 / 720 px | Design'a soruldu (TASARIM EMRİ #1 madde 4); Faz 2b bu cevabı bekler, başka hiçbir şey beklemez |
| 10 | — | Bilgi Merkezi URUN tarafından kuruluyor (DS'siz, token sınıflarıyla) | Faz 4'te ilk göç adayı; URUN'dan token dışı sınıf açmaması istendi |

## 2 · Fazlar (v1 numaraları korunur; değişen fazlar yazılı)

**Faz 0 · Kabuk kararı (K36) — Recep.** v1 ile aynı soru, kaynak kare artık v18 A kanalı (A1–A5 HAZIR). Değişmeyen:
"evet" demeden Faz 1 başlamaz; bayrak arkasında, önizlemeli, geri alınabilir.
*Faz 2a ve Faz 3 K36'yı BEKLEMEZ* (görünmezler; aşağıda).

**Faz 1 · Kabuk** — v1 ile aynı; kapı INV-KABUK-V17-1 → **INV-KABUK-V18-1** (v18 A1–A5 ölçüleri). Kod URUN'un yazdığı
kabuk (`StickyHeader`, `HeaderTeklifPaneli`, `MobilAltSekmeCubugu`, `Footer`, `MainLayout`); dosya sahibi URUN kalır,
TASARIM ölçer. Bayrak `YENI_KABUK_GEZINMESI`.

**Faz 2a · Token köprüsü, GÖRÜNMEZ kısım (TASARIM · migration yok · K36 beklemez).**
- DS'teki 66 tokenden sitede **adı olmayanlar** eklenir (ör. `--text-strong`, `--text-body`, `--text-muted`,
  `--text-on-dark*`, `--surface-*` DS adları, `--border-*`, `--space-*`, tipografi ölçeği `--size-*`/`--lh-*`/`--track-*`,
  `--font-serif`, `--font-mono`). Aynı adla farklı değer taşıyan tokenlara (**çakışan küme**: `--primary-navy`,
  `--brand-cyan`, `--font-sans`, ölçülecek diğerleri) **dokunulmaz**.
- Kaynak: DS token dosyalarının depoda **damgalı kopyası** `src/design-system/ds-kaynak/*.css` (DesignSync ile okunur,
  elle değiştirilmez; başlık "kopya · kaynak VentHub Design System 31b0824c · okuma tarihi"). `scripts/design/token-turet.mjs`
  kopyadan `src/index.css` türev bloğunu üretir (kural 8: index.css tek tanım yeri).
- `tailwind.config.js`: yeni adlar `hsl(var(--…) / <alpha-value>)` kalıbıyla; boşluk rolleri `spacing`'e, yazı ölçeği
  `fontSize`'a (`tokens.js` üzerinden).
- Kapı **INV-TOKEN-PARITE-1** (v1 adı): DS kopyası ⊆ index.css; çakışan küme hariç HSL üçlüsü eşit; çakışan küme
  **ad ad listelenir** (liste kapının içinde, Faz 2b'de boşalır). Sabotaj: değer bozulur → kırmızı; çakışan kümeye
  izinsiz ad eklenir → kırmızı.
- ⚠Tazelik: CI Design'a erişemez. "DS yeni sürüm yayınladı mı" CI'da ölçülemez; tazelik TASARIM'ın işi (Design proje
  yorumu → kopya yenilenir → türev yeniden üretilir). v1'in "DS yayin_notu tarihi > türev damgası → kırmızı" kolu
  yalnız kopyanın damgasıyla türev damgasını karşılaştırabilir; bunu olduğu gibi yazıyoruz.

**Faz 2b · GÖRÜNÜM DÖNÜŞÜ (TASARIM · tek PR · K8 önizleme · Recep "olur"u ŞART).**
- Çakışan kümenin değeri DS değerine çekilir: `--primary-navy` → `219 48% 20%`, `--brand-cyan` → `194 100% 35%` (+ ölçülen
  diğerleri). Yazı tipi: `next/font/google` ile Archivo (400/500/600/700), Source Serif 4 (400/600), IBM Plex Mono (400/500),
  `subsets: ['latin', 'latin-ext']` (Türkçe ğ/ş/ı), `display: 'swap'`; Inter kalkar; `--font-sans` Archivo'ya.
- Bu PR **bütün sitenin görünümünü bir kerede** değiştirir; Vercel önizlemesinde Recep görür, "olur" sonrası merge.
- Ölçüm (rapor sayılarla): (a) önce/sonra ekran görüntüsü — ana sayfa, kategori, ürün, Bilgi Merkezi, teklif/sepet,
  admin panosu (admin DEĞİŞMEMELİ); (b) Lighthouse LCP/CLS önce/sonra, üç ailenin toplam font baytı (kural 10);
  (c) gerçek tarayıcıda kontrast oranı — lacivert zemin üzerindeki beyaz metin, turkuaz yüzeyler (jsdom ölçemez,
  cetvel §3); (d) `grep` ile Inter 0.
- ⚠Admin: `[data-admin-theme]` kendi değişkenlerini taşıyor, ama admin'in `--primary-navy`/`bg-primary-navy`
  kullanıp kullanmadığı **ölçülmedi** — Faz 2b'nin ön koşulu bu ölçümdür. Admin görünümü değişecekse ADMIN
  cetveli (`admin-design-standard.md`) kapsamında ayrı karar.
- Geri alma: tek PR revert; veri/adres etkisi yok.

**Faz 3 · Bileşen kütüphanesi `src/components/ds/` (TASARIM · alt ajan ×3 · K36 beklemez).** v1/REC-165 ile aynı;
fark: **11 bileşen** (+`HukumKutusu`), kaynak DS canlı `.jsx`/`.d.ts`/`.prompt.md` (TASARIM kopyalar; alt ajanlar Design'a
erişemez — kaynak dosyalar alt ajana depo içi kopya olarak verilir). Kapılar INV-DS-PROP-1 · INV-DS-GORSEL-1 (galeri
sayfası `/[lang]/ds-galeri`, noindex, bayraklı — **yeni adres** olduğu için karar 118'le çakışmaz: vitrin adresi
değil, dizine girmez). Bileşenler Faz 2a tokenlarını kullanır; Faz 2b'den önce yapılırsa galeri eski renkle çizilir,
sonra kendiliğinden döner (bileşen kodu değişmez).
Yol notu: Ops emri `src/components/ui/**` dedi; v1/REC-165 `src/components/ds/` dedi. **Öneri `ds/`**: `ui/`'de DS ile
ilgisiz 4 primitif var (Pagination, ScrollObserver, Skeleton, VentImage); ayrı klasör "DS'ten gelen" ile "yerel"i ayırır
ve kapının kapsamını tek glob'la sınırlar.

**Faz 4 · Sayfalar** — v1 ile aynı mantık, sıra envanter §3 + karar 118: (1) Bilgi Merkezi (URUN kuruyor; DS bileşenleri
gelince göçer) → (2) ürün sayfası + kategori/liste, **adres işiyle aynı yayında** (URUN, REC-300) → (3) teklif listesi →
(4) arama sayfası → (5) karşılaştırma → (6) senaryo. Sayfanın dosyası URUN'un; TASARIM bileşeni verir, kareyle yan yana ölçer.

**Faz 5 · Borç eritme** — v1 ile aynı (INV-BORC-MANDAL-1: `bg-primary-navy`, `rounded-*`, `shadow-*` yalnız küçülür).
Ek: **vitrin/admin ayrımı** mandalın içinde — admin sayıları (rounded-admin 383, shadow-admin 89) mandala girmez.
Tailwind varsayılan `borderRadius`/`boxShadow` ölçeği **global olarak sıfırlanmaz** (admin'i kırar); vitrin bileşen
göçüyle erir.

## 3 · Kısıtlar

- **K-1 · Karar 118:** tasarım geçişi hiçbir vitrin adresini değiştirmez. Design karelerindeki adres etiketleri
  (`/tr/secici`, `/tr/urunler`, `/tr/teklif-listesi`, `/tr/hesap/*`) **hedef değil, çizim notu** sayılır; adres kararı
  yalnız `adres-semasi-standard.md` / REC-300 (URUN) yolundan. Zorunlu değişiklik: yalnız kalıcı yönlendirmeyle ve
  Recep onayıyla. Kapı: Faz 1–5 PR'larında `src/app/**` altında rota klasörü eklenmesi/silinmesi 0 (galeri hariç).
- **K-2 · Kural 8:** arbitrary Tailwind 0, ham HEX 0 (DS değerleri HSL), `focus-visible:`.
- **K-3 · Admin kapsam dışı** (`[data-admin-theme]`, admin-design-standard) — değişiyorsa ölçülür, ayrı karar.
- **K-4 · 3D kapsam dışı** (kural 9).
- **K-5 · Kip:** bileşenler K38/K39 kip ayrımını prop ile taşır (Teklif ↔ Satış), metin sözlükten (kural 7, `tr.ts` SSOT).
- **K-6 · RSC:** DS bileşenleri varsayılan sunucu bileşeni; etkileşimli olanlar (`AdetKontrolu`, `KatliCagriSatiri`,
  `KarsilastirmaTablosu` "farkı göster") uç `'use client'`.

## 4 · Recep'e gidecek sorular (numarayı Ops verir; ayrı ayrı, pakete gömülmez)

1. **K36 kabuk kararı** — v18 A kanalı kabuğu canlı sitenin kabuğu olsun mu? (Faz 1'in kilidi; yapısal karar, tek başına.)
2. **Faz 2b görünüm dönüşü** — önizlemede görüp "olur" demesi (soru değil onay; PR hazır olunca).

## 5 · Sahiplik

TASARIM: Faz 2a, 2b, 3; Faz 1 ve 4'te ölçüm. URUN: Faz 1 kabuk kodu (dosyalar onun), Faz 4 sayfalar, adres.
Design: kaynak (DS/Marka/Menü). Ops: soruların Recep'e taşınması, REC-165'in yeniden kapsamlanması (TASARIM'a devri).
Claim: `src/design-system/**`, `src/components/ds/**`, `src/index.css` (yalnız `:root` türev bloğu), `tailwind.config.js`,
`src/app/layout.tsx` (yalnız font) — URUN'un geniş `src/**` claim'iyle eşleşerek, Ops üzerinden.

## 6 · Bitti sayılır

INV-TOKEN-PARITE-1 yeşil (çakışan küme boş) · Inter 0 · 11 bileşen `components/ds/` + INV-DS-PROP-1 + INV-DS-GORSEL-1
yeşil · Faz 2b önizleme "olur" + önce/sonra ölçümleri raporda · cetvel `marka-token-eslemesi-standard.md` yazı tipi,
yarıçap/gölge, boşluk, bileşen ayaklarıyla güncel · `storefront-design-standard.md` bileşen satırı + kapı ·
INV-BORC-MANDAL-1 kurulu.
