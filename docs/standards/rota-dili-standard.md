# Rota Dili Standardı (statik sayfa adresleri: TR Türkçe, EN İngilizce)

> **Sahibi:** ALTYAPI
> **Son doğrulama:** 2026-10-04 (PR-A: kapılar yeşil, bağımsız doğrulayıcı geçti)
> **Durum:** v0.1 · 2026-10-04 · Şerit: ALTYAPI · Kart: OPS-52 · **Uygulama öncesi cetvel**: bugün canlıda olan kısımlar "CANLI",
> yayını bekleyenler "HEDEF" diye işaretlidir. Anahtar kapalıyken canlıda hiçbir adres değişmez.
> **Kararlar:** 267 (hakkımızda), 269 (iletişim), 270 (iki aşama: 11 Ekim vitrin, hesap/sepet/ödeme sonra); Recep ilkesi 10-03:
> *TR'de Türkçe, EN'de İngilizce adres* (OPS-36).
> **Bağlı cetveller:** `adres-semasi-standard.md` (A5 tek kanonik, A6 sağlayıcıya özgü özellik yok, A9 sıçrama bütçesi, A11 308 önbelleği) ·
> `canonical-url-standard.md` (kanonik = sitemap = yönlendirmesiz tek adres) · `rendering-cache-standard.md` ·
> `slug-localization-2026-08-10.md`. **Plan:** `docs/plans/ops52-adres-dili-mekanizma-plani-2026-10-04.md`.

## 0. Kapsam: bu cetvel neyi yönetir, neyi yönetmez

| Yönetir (Aşama 1) | Yönetmez |
|---|---|
| Veriden bağımsız **statik sayfalar**: hakkımızda, iletişim, destek/*, legal/*, ürün seçici, teklif, bilgi merkezi çatısı (Design listesinden 27 sayfa) | Kategori / dal / aile / marka / model adresleri: **K3B hattı** (`adres-semasi-standard.md`, `adresUret`) |
| | **Aşama 2** yüzeyleri: `account/*`, `cart`, `checkout`, `auth/*`, `payment-success` (karar 270; Supabase auth dönüş adresleri, İyzico callback ve e-posta bağlantıları birlikte taşınır, ayrı iş) |

## 1. Kurallar

**R1 — Tek tablo.** Adres dilinin tek kaynağı `src/config/rotaDili.veri.json`. Satır: `{ id, klasor, tr, en, altYollar? }`. `klasor` bugünkü
(iki dilde ortak) klasör yoludur; `tr`/`en` o dilde görünecek yeni yoldur. Tablo **veridir**; mekanizma (`src/config/rotaDili.mjs`) veriden bağımsızdır.
Aynı tablodan üç çıktı: eski → yeni 308, yeni → klasör yeniden yazım (rewrite), adres üretimi (iç bağlantı, kanonik, hreflang, sitemap).
Klasör adı değiştirilmez, sayfa kopyalanmaz.

**R2 — Anahtar.** `NEXT_PUBLIC_ADRES_DILI`, derleme anında okunur. **Yalnız tam `1` açar**; yok, boş, `true`, `0` ya da bozuk değer **kapalıdır**
(güvenli yön). Vercel'de Preview=1, Production=0. Açma: Production=1 + yeniden dağıtım (yayın günü). **Geri alma: değişkeni `0` yap + yeniden dağıt;
kod değişikliği gerekmez** (ya da Vercel'in önceki yayına anında dönüşü). `ADRES_SEMASI_K3B` ve `EN_YAYIN` **ayrı** anahtarlardır; kodda birbirine
bağlanmaz (biri tek başına geri alınabilmeli). Yayın günü aynı listede açılırlar.

**R3 — Anahtar kapalı = sıfır fark.** Kapalıyken `rotaDili` çıktıları boş listedir; `next.config` yönlendirme ve başlık listesi ile site haritası
adresleri master 9ea04a55d fikstürüyle **derin eşit** kalır. Bu bir iddia değil ölçümdür (R9).

**R4 — Tek sıçrama.** Eski adres tek 308 ile yeni adrese gider; hedef hiçbir kuralla yeniden eşleşmez (zincir, döngü yok). Mevcut kuralların
hedefleri (ör. karar 92, `/destek/hesaplayicilar`) yeni adrese tabloyla yeniden yazılır. Dilsiz eski adres (`/about`) için A9 bütçesi 1:
config tek başına 307 + 308 = 2 sıçrama üretir; bu yüzden middleware'de, `ADRES_SEMASI_K3B` kolunun yanında saf tablo aramasıyla çalışan
dilsiz kol kullanılır (DB yok, kural 12). Karar PR-C'de hop sayımıyla kesinleşir.

**R5 — Aşama 2 tabloya giremez.** `account`, `cart`, `checkout`, `auth`, `payment-success` önekleri doğrulayıcıda hata verir; sessiz yutulmaz.

**R6 — Kanonik, hreflang, sitemap tek üreticiden.** İç bağlantılar `useLocalizedRoutes` / `yuzeyAdresleri` üzerinden (CLAUDE.md kural 7);
elle `/tr/…` yazmak yasak. Kanonik adres sitemap'in bildirdiği adresle birebir aynıdır. **EN adresleri** `EN_YAYIN=false` iken çalışır ama
site haritasında ve hreflang'da yoktur; `EN_YAYIN` ayrı eksendir ve 11 Ekim'de kapalı kalır (OPS kararı, EN makale metni yok). Testler iki kipte yazılır.

**R7 — Veriye bağlı eski adres config'e girmez** (A §3). `rotaDili` yalnız statik sayfaları kapsar; kategori/ürün/marka eski adresleri K3B'nin
middleware haritasındadır.

## 2. Kapılar

| Kapı | Ne ölçer | Durum |
|---|---|---|
| INV-ROTA-DILI-KAPALI-1 (`src/__tests__/conformance/rota-dili-kapali-sifir-fark.test.ts`) | env yok / `0` / `true` iken `next.config` redirects + headers master fikstürüyle derin eşit, rewrites boş; env `1` iken fark var (duyarlılık kanıtı) | PR-A (HEDEF) |
| `src/lib/adres/__tests__/rotaDili.test.ts` | kapalı=boş, açık kip tam değerler, `altYollar`, zincir/döngü, Aşama 2 reddi, tablo doğrulayıcı | PR-A (HEDEF) |
| Kapı 2 — HTTP matrisi (`scripts/adres/matris.cjs`, yerel derleme, anahtar=0, master'la fark ∅) | 54 şablon × {tr,en} + sabit örnekler + bilinen eski adresler: durum + Location + cache-control | PR-B (HEDEF) |
| Kapı 3 — CANLI salt-okuma matrisi (birleşmeden önce/sonra; yayın günü açık matris) | canlıda tek adres değişmedi / yayın günü beklenen değişim | PR-B/yayın (HEDEF) |
| Açık kip kapıları (önizleme) | tek hop, hedef 200, hreflang karşılıklı, kanonik = sitemap, eski adrese `href` 0, Aşama 2 önekleri eski adreste 200 | PR-D (HEDEF) |

## 3. Yayın günü kontrol listesi

1. Production'da `NEXT_PUBLIC_ADRES_DILI=1` + yeniden dağıtım (K3B ve `EN_YAYIN` kararları ayrıca, aynı listede).
2. Kapı 3 canlı matrisi **açık** beklenen matrisle eşleşir (açmayı unutma / yanlış açma kapanır).
3. Search Console'a yeni site haritası bildirilir; birkaç örnek adres için indeksleme istenir (`canonical-url-standard.md`).
4. Geri alma hazır: değişkeni `0` yap + yeniden dağıt; sonra Kapı 3 kapalı matrisle fark ∅.
