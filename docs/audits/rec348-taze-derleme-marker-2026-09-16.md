# REC-348 eki · TAZE DERLEME — marker sayıları ÖLÇÜLDÜ, üçüncü ada ÇÖZÜLDÜ

**Tarih:** 2026-09-16 · **Şerit:** URUN · **Kayıt:** REC-348 (ek ölçüm)
**Doğuran borç:** `docs/audits/rec348-rota-sinif-kapsami-2026-09-16.md` §5 madde 1-3 —
*"marker sayıları bu belgede ÖLÇÜLMEDİ, REC-59'dan aktarıldı"* · *"derleme çıktısı 09-14
tarihli"* · *"products/<slug> ve category/** HTML'i yok, sebep ölçülmedi — SORU İŞARETİ"*
**Yöntem:** bu worktree'de `pnpm build` (çıkış 0), üretilen HTML'de doğrudan sayım.
**Derleme damgası:** `.next/BUILD_ID` 2026-09-16 09:26 · git tepesi `e42b2be78`
**Migration:** YOK. **Kod değişikliği:** YOK.

---

## 0 · ÜÇ BORCUN ÜÇÜ DE KAPANDI

| Borç | Sonuç |
|---|---|
| Marker sayıları ölçülmemişti | **ÖLÇÜLDÜ** — 247 HTML'in her biri tek tek sayıldı (§2) |
| Derleme iki gün eskiydi | **TAZELENDİ** — bugünkü tepeden derlendi |
| `products/<slug>` ve `category/**` HTML'i yok görünüyordu | **SORU İŞARETİ ÇÖZÜLDÜ** — §1 |

---

## 1 · ⭐"HTML YOK" BİR BULGU DEĞİLDİ, BAYAT DERLEMEYDİ

| Ölçüt | 09-14 derlemesi | **09-16 taze derleme** |
|---|---:|---:|
| Toplam HTML | 105 | **247** |
| `products/<slug>` HTML | 0 | **94** |
| `category/**` HTML | 0 | **48** |
| `admin/**` HTML | 0 | **0** |

Yani önceki belgenin *"kapı bu iki sınıfı izliyor ama HTML'i yok"* soru işareti **sahte
alarmdı**; o ağaçta duran derleme eksikti. ⭐**Soru işaretini bulgu diye yazmamak doğru
karardı** — yazsaydım olmayan bir arıza için iş emri doğardı.

⚠**Bunun ikinci sonucu:** REC-59'un *"105 vs 245 farkı ÖLÇÜLMEDİ"* notu da artık cevaplı.
Taze sayı **247**; 245'e çok yakın, 105'e uzak. Yani **105 eksik derlemeydi** ve REC-59'un
marka sınıfı sayıları o eksik derlemeden alınmıştı. Marka sınıfı tavanı (2) bu taze ölçümde
de **doğrulandı** (§2), dolayısıyla kapı etkilenmiyor — ama sayının kaynağı artık biliniyor.

`admin/**` için **0 değeri taze derlemede de doğrulandı**: 26 admin rotası HTML üretmiyor,
yani bir önceki belgenin "kapıya alınmaz" hükmü ayakta.

---

## 2 · MARKER DAĞILIMI — 247 HTML, TEK TEK SAYILDI

`BAILOUT_TO_CLIENT_SIDE_RENDERING` geçiş sayısı:

| Marker | HTML sayısı | Hangi rotalar |
|---:|---:|---|
| **0** | 68 | anasayfa · `products` (liste) · `category/**` (24 sınıf) · `about` · `contact` · `legal/**` (6) |
| **2** | 75 | `brands` · `brands/<slug>` · `cart` · `checkout` · `account/**` (13) · `destek/**` (8) · `urun-secici` · `auth/{register,forgot-password,reset-password}` |
| **3** | 104 | `products/<slug>` (47 sınıf) · `auth/login` · `auth/callback` · `payment-success` · `destek/hesaplayicilar/{hrv, hava-perdesi}` |

*(Sayılar TR+EN toplamıdır; sınıf sayıları tek dil içindir.)*

---

## 3 · ⭐ÜÇÜNCÜ ADANIN KİMLİĞİ — ÇÖZÜLDÜ

REC-59 bunu açık bırakmıştı: *"üçüncü marker sayfa düzeyinde doğuyor, `animate-spin` ile
sarılı, hangi bileşen olduğu kesinleştirilmedi."*

### Önce: `animate-spin` izi YANLIŞ İZDİ

| Sayfa | Marker | `animate-spin` |
|---|---:|---:|
| `tr/auth/login` | 3 | 3 |
| `tr/payment-success` | 3 | 1 |
| `tr/destek/hesaplayicilar/hrv` | 3 | 1 |
| `tr/destek/hesaplayicilar/kanal` | 2 | 1 |
| `tr/brands/vortice` | 2 | 1 |
| `tr/about` | **0** | 1 |

`about` sıfır marker verdiği hâlde bir `animate-spin` taşıyor. **Bekleme göstergesi marker'ı
açıklamıyor** — REC-59'un o cümlesi bir gözlemdi, sebep değildi. Adıyla yazıyorum ki kimse o
izi tekrar takip etmesin.

### Gerçek kural — üç ölçümle doğrulandı

> **marker sayısı = (rota `force-static` ilanı taşımıyorsa) × (`useSearchParams` çağıran ada sayısı)**

Kök layout'ta **iki** ada var (`src/app/layout.tsx` ve `src/components/layout/ClientLayout.tsx`
— ikisinde de `useSearchParams` ölçüldü). Üçüncü ada **sayfanın kendi görünümünde**
`useSearchParams` çağıran bileşendir:

| Rota | Sayfa düzeyi adası | Marker |
|---|---|---:|
| `auth/login` | `views/LoginPage.tsx` | 3 |
| `auth/callback` | `views/AuthCallbackPage.tsx` | 3 |
| `payment-success` | `views/PaymentSuccessPage.tsx` | 3 |
| `destek/hesaplayicilar/hrv` | `page.tsx` + `views/calculators/HRVCalcPage.tsx` | 3 |
| `destek/hesaplayicilar/hava-perdesi` | `page.tsx` + `AirCurtainCalcPage.tsx` | 3 |
| `products/<slug>` | `app/_components/ProductDetailPageView.tsx` | 3 |

### ⭐Kuralın ÇÜRÜTME testi — geçti

Kural yalnız "3 verenleri" açıklasaydı sonradan uydurulmuş sayılırdı. **Ters yönde de
sınandı ve tuttu:**

1. **`jet-fan` ve `kanal` hesaplayıcıları 2 marker veriyor, 3 değil** — ölçtüm:
   o iki `page.tsx` `useSearchParams` **çağırmıyor** (`hrv` ve `hava-perdesi` çağırıyor).
   Yani aynı klasördeki dört kardeş sayfa ikiye ayrılıyor ve kural ayrımı **önceden** kesiyor.
2. **`category/<slug>` ve `products` (liste) `useSearchParams` ÇAĞIRIYOR ama marker 0** —
   çünkü ikisi de `force-static` ilanlı. İlan, marker'ı **öldürüyor.**
3. **`brands/<slug>` ilan taşımıyor ve sayfa adası yok** → tam olarak 2. REC-59'un yazdığı
   tavanla birebir.

⭐Bu, REC-59'daki düzeltmenin (#1196) **bağımsız doğrulamasıdır**: *ayırt edici olan bileşen
değil, ROTA SINIFI İLANIDIR.* Aynı bileşen ilanlı rotada marker doğurmuyor, ilansız rotada
doğuruyor.

---

## 4 · BUNUN KAPSAM İŞİNE ETKİSİ

Önceki belgedeki altı kümeden ikisi bu ölçümle **kolaylaştı**:

- **K1 (yasal, 6 rota) ve K2 (`about`+`contact`, 2 rota): marker'ları ölçülmüş 0.**
  Tavan ilanı yazmak için ek ölçüm gerekmiyor; ikisi de `force-static` ilanlı ve sıfır
  marker veriyor. İlk PR bu sekiz rota olmalı.
- **K5 (kimlik, 5 rota) artık yazılabilir.** Engel "üçüncü adanın kimliği bilinmiyor" idi;
  kimlik çözüldü, tavan 3 olarak ilan edilebilir ve ilan **adayla birlikte** yazılabilir.

**K3/K4 (destek + hesaplayıcılar) için yeni bir ayrım doğdu:** dört hesaplayıcı **tek sınıf
değil.** `hrv` ve `hava-perdesi` 3 marker, `jet-fan` ve `kanal` 2 marker veriyor. Tek tavanla
dördünü kapsamak, iki sınıfı birbirine kefil yapardı — REC-59'un marka tavanında adıyla
reddettiği hatanın aynısı. **Ya ikiye ayrılır, ya dördü de aynı ilana getirilir.**

---

## 5 · SINIRLAR (adıyla)

1. **Tek derlemenin çıktısıdır.** Tavanlar bu yüzden ÜST SINIR olarak okunmalı, kesin sayı
   olarak değil — REC-59'un aynı sınırı burada da geçerli.
2. **Bu ölçüm repo derlemesini sayar, canlı yanıtı değil.** Duman kapısı canlıyı ölçer;
   iki sayı ayrışırsa kapı kırmızı verir (fail-closed) ve bu doğru davranıştır.
3. **`useSearchParams` taraması metin aramasıdır.** Bir ada hook'u dolaylı yoldan (başka bir
   hook'un içinden) çağırıyorsa bu tarama onu görmez. Kural üç ölçümle çürütme testinden
   geçti, ama **tarama yöntemi bu sınırı taşıyor.**
4. **Kapı dosyasına hiçbir kol EKLENMEDİ.** Bu belge ölçüm; kolları yazmak ayrı iştir ve
   `tests/smoke/ssr-kurallari.ts` ALTYAPI şeridindedir.

İlgili: REC-348, REC-59

🤖 Generated with [Claude Code](https://claude.com/claude-code)
