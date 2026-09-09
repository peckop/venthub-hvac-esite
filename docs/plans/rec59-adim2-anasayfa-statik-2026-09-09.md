# REC-59 Adım 2 — Ana sayfa ve ürünler rotası GERÇEKTEN statik olsun (+ REC-297)

**Tarih:** 2026-09-09 · **Şerit:** URUN (4a8eaf9c) · **Durum:** PLAN, onay bekliyor

## KAYNAK / CETVEL

- **Yöneten cetvel:** `docs/standards/rendering-cache-standard.md` (REC-59 kaydının kendisi bu
  cetveli adıyla veriyor). Ek: `CLAUDE.md` kural 4 (RSC öncelikli), kural 5 (Suspense sınırı
  yalnız uç bileşeni sarar), kural 12 (`tenantId` önbellek anahtarında).
- **İkinci kayıt:** REC-297 (`marketing_title` RSC yükü, Low) — OPS hükmüyle **aynı PR'a**
  alınıyor. Benim önerim ayrı PR idi; OPS sıralamayı kurdu, uyuyorum.
- **Birlikte okunacak:** REC-128.

### ⭐DAYANAK KARAR — atfı DÜZELTTİM (kendim okuyarak)

OPS bu işi *"K10 mimari kararı, 09-08"* diye dayandırdı ve ben o belgeyi okumadan
kabul etmemiştim. Okudum: **atıf yanlış, hüküm doğru.**

- `docs/audits/karar-kayit-bagi-vitrin-15a-2026-09-07.md:39` → **K10 = "Liste ve
  karşılaştırma — Ekran 11" (2026-09-04), bağlı kayıt REC-197.** Render/statik ile ilgisi
  yok. (`K10` deposu genelinde ÜÇ ayrı konuda kullanılmış — Nicotra basınç kararı, bu, ve
  satınalma belgeleri. Ad ölçüt değildir.)
- **Gerçek dayanak** `docs/proje-takip/design/belge/kararlar-vitrin-15a-2026-09-04.md:102-103`,
  Recep'in 2026-09-04 tarihli **numarasız** kararı, kaydın kendi dilinde "Adım B":
  - **B/1 (satır 102):** *"kiracı çözümü derleme anında sabit; `getTenantConfig` istek başlığı
    okumaz; çok kiracılı yetenek kodda kalır, kapalı. Hedef: ana sayfa önceden üretilir."*
  - **B/2 (satır 103):** *"1. sayfa statik, `?page=N` ayrı dinamik yol, **adres değişmez**."*

Sonuç: Recep'e yeni yapısal soru GİTMEZ — karar zaten verilmiş. OPS'un hükmü ayakta,
yalnız gerekçesi başka bir belgeye aitti.

### ⚠BU OKUMA PLANA EKSİK BİR ŞART GETİRDİ

Kararın B/2 maddesi **"adres değişmez"** diyor; benim ilk taslağımda bu şart YOKTU.
Yani sayfalamayı uç bileşene indirirken `?page=N` adres biçimi korunacak — `/products/2`
gibi bir yola geçmek KARARA AYKIRI olurdu ve ilk taslağım bunu yasaklamıyordu.
Ölçüt: mevcut `?page=N` adresleri merge sonrası aynı içeriği vermeye devam eder.

## 1 · BUGÜN ÖLÇÜLEN DURUM (08-24 notuna DEĞİL, 09-09 ölçümüne dayanır)

Canlı `X-Vercel-Cache` + `Cache-Control`, 2026-09-09 ~09:1xZ:

| Rota | Cache-Control | X-Vercel-Cache | Hüküm |
|---|---|---|---|
| `/tr` | `private, no-cache, no-store` | MISS | **İSTEK BAŞINA** |
| `/tr/products` | `private, no-cache, no-store` | MISS | **İSTEK BAŞINA** |
| `/tr/category/fanlar` | `public, max-age=0, must-revalidate` | **HIT** | statik/ISR ✔ |

Kategori rotası PR #1136 ile çözülmüştü; **çözümün deseni depoda hazır** ve
`category/[categorySlug]/page.tsx:208`'de gerekçesiyle yazılı: *"DERLEME SABİTİ, `headers()`
DEĞİL"*.

## 2 · KÖK SEBEP (ölçüldü, tahmin değil)

| Rota | Sebep | Kanıt |
|---|---|---|
| `/tr` | `await getTenantConfig()` | `src/app/[lang]/page.tsx:120` → `src/utils/tenantServer.ts:51` `await headers()` |
| `/tr/products` | **İKİ** sebep: aynı `getTenantConfig()` **ve** gövdede `searchParams` | `products/page.tsx:85` ve `:77-83` |

⚠**İki sebep ayrı ayrı yeterlidir.** Yalnız birini kaldırmak rotayı statik YAPMAZ; ürünler
rotasında ikisi de kalkmadan ölçüm yeşile dönmez. (Bugünün dersi: "iş kırmızı" demek yetmez,
hangi ADIM sorulur.)

## 3 · YAPILACAK

1. **`/tr` — tenant kimliği derleme sabitine.** Kategori rotasındaki desen aynen uygulanır.
   `headers()` okumak RSC render yolundan çıkar; çok-kiracı gerekirse kiracı başına ayrı
   yayın olur (kural 12 bozulmaz, cetvelin kendi hükmü bu).
2. **`/tr/products` — aynı sabit + sayfa-1 statik deseni.** `searchParams` gövdeden çıkar;
   sayfa 1 statik üretilir, sayfalama uç bileşene iner ve `<Suspense>` **yalnız o ucu** sarar
   (kural 5 — sınır sayfa köküne konursa sunucu gövdeyi boş verir, 09-05'te ölçüldü).
   ⛔**ADRES DEĞİŞMEZ** (Recep kararı B/2): `?page=N` biçimi korunur; yol-tabanlı sayfalamaya
   (`/products/2`) GEÇİLMEZ. Merge sonrası mevcut `?page=N` adresleri aynı içeriği verir.
3. **REC-297 — `select` kolon listesi daraltılır.** `CATEGORY_COLUMNS` (`preload.ts:69`) ve
   kategori sayfasındaki eşi (`page.tsx:232`) emekli `marketing_title`'ı taşımayı bırakır.
   ⚠**Tuzak, önceden ölçüldü:** `type-converters.ts:42` hâlâ
   `marketing_title: String(dbCat.marketing_title || dbCat.name || '')` yazıyor ve
   `page.tsx:253` alanı eşliyor — kolon listesinden çıkarmak bu iki yeri **kırar**. Sıra:
   önce okuyucular, sonra kolon. Admin yüzeylerine (`CategoriesTableBody`,
   `CategoryBuilderView`, `ProductFormModal`) **DOKUNULMAZ** — orası veriyi yönetim için
   okur, vitrin değil.

## 4 · KAPILAR (hepsi sabotajla doğrulanır)

| Kapı | Ne ölçer | Sabotaj |
|---|---|---|
| `INV-RENDER-*` (mevcut) | yasak liste | — |
| **YENİ** `INV-ANASAYFA-STATIK-1` | `/[lang]/page.tsx` ve `products/page.tsx` RSC yolunda `getTenantConfig`/`headers()` çağırmaz | çağrıyı geri koy → kırmızı |
| **YENİ** `INV-MARKETING-YUK-1` | kategori `select` listesi `marketing_title` içermez | listeye geri ekle → kırmızı |
| `pnpm build` | REC-59'un kendi kabul ölçütü: 4 rota Static/ISR işaretli | — |

⚠**Statik kapı bu işi TEK BAŞINA göremez:** "rota statik mi" sorusunun cevabı `tsc`/`lint`/
`vitest` çıktısında yoktur, yalnız `next build` çıktısında ve canlı `X-Vercel-Cache`'te vardır.
Bu yüzden kabul ölçütü **iki katmanlı**: build çıktısı + merge sonrası canlı ölçüm.

## 5 · RİSK

- **En büyük risk sessiz:** rota statik görünüp içeriğin bayatlaması. Emniyet ağı `revalidate`
  zaten var (3600) ve birincil yol webhook. Yeni tablo bağlamıyorum, o yüzden cetvelin
  "her tablonun tetiği olacak" hükmüne yeni borç doğmuyor.
- **Ürünler rotası daha riskli:** sayfalama davranışı değişiyor. Sayfa 2+ istek başına kalır;
  bu KASITLI ve cetvele yazılır.
- **Migration YOK.** Prod DB'ye yazım YOK.

## 6 · ÖLÇÜM BEYANI

Paket iddiası **sayıyla** yazılacak (bugün "tüm paket" dedim, alt kümeydi ve CI kırmızı
döndü): dosya sayısı + test sayısı, tam paket.
