# OPS-52 — Adres dili mekanizması (kapalı anahtar arkasında) — ölçüm + plan

> v1 · 2026-10-04 akşam · Şerit: ALTYAPI · Kart: OPS-52 (vade 7 Ekim) · **Durum: PLAN, kod yok — OPS onayı bekliyor.**
> **Kararlar:** 267 (hakkımızda), 269 (iletişim), 270 (iki aşama: 11 Ekim vitrin, hesap/sepet/ödeme sonra).
> **Yöneten cetveller:** `docs/standards/adres-semasi-standard.md` (A5 tek kanonik, A6 sağlayıcıya özgü özellik yok,
> A9 sıçrama bütçesi, A11 308 → `max-age=0, must-revalidate`), `docs/standards/canonical-url-standard.md`
> (kanonik = sitemap = yönlendirmesiz tek adres), `docs/standards/rendering-cache-standard.md`,
> `docs/plans/slug-localization-2026-08-10.md`, CLAUDE.md kural 7 (URL'ler `useLocalizedRoutes`) ve kural 12
> (middleware'de DB yok). **Rota dili cetveli yok** (OPS-36 de böyle yazdı): yazımı bu işin kapsamında, PR-A'da.

## 1. Ölçülen bugünkü durum (master 9ea04a55d)

| Ne | Ölçüm |
|---|---|
| Sayfa sayısı | `src/app/[lang]` altında **54** `page.tsx`; klasör adları iki dilde ortak |
| Var olan adres hattı (REC-300 Faz 3) | `ADRES_SEMASI_K3B = false` (`features.ts`, derleme sabiti); `src/utils/adresUret.ts` tek üretici; `yuzeyAdresleri.ts` yüzey katmanı; `src/lib/adres/eslestirici.ts` + middleware'de eski-adres haritası; `ESKI_ADRES_HARITASI = null` (üretilmiş JSON henüz bağlı değil) |
| Kapsamı | **yalnız** kategori / ürün / marka / tüm ürünler (`/tr/kategori`, `/tr/urun`, `/tr/markalar`, `/tr/urunler`). `about`, `contact`, `destek/*`, `legal/*`, `urun-secici` bu hatta **yok** |
| `next.config.mjs` | `redirects()` derleme anında; tek üretici `.mjs` deseni emsali: `bilgiMerkeziYonlendirmeleri.mjs` (karar 92, 132 satır, test yayındaki kuralı doğrudan çağırır). Cetvel A: veriye bağlı eski ürün/aile/kategori deseni config'e YASAK; **veriden bağımsız birkaç desen serbest** |
| `EN_YAYIN = false` | `/en/*` site haritasında ve hreflang'da YOK, `noindex`. EN adres işi bu bayrakla ayrı bir eksen |
| noindex başlığı | `/:lang(tr\|en)/:yuzey(auth\|account\|cart\|checkout\|payment-success)` — Aşama 2 yüzeyleri, bu işte DEĞİŞMEZ |
| Sitemap | `src/app/sitemap.ts` 244 satır; adresler `adresRotalari` üzerinden |

OPS-36'dan Aşama 1 kapsamı (karar 270): kategori, ürün, marka, /markalar, hakkımızda, iletişim, destek/sss ve kardeşleri,
legal, bilgi merkezi, ürün seçici, teklif. **Aşama 2 hiç dokunulmaz:** account/*, cart, checkout, auth/*, payment-success.

## 2. Tasarım

### 2.1 Tek tablo, üç çıktı

`src/config/rotaDili.mjs` (`.mjs`: `next.config.mjs` TS içe aktaramaz — `bilgiMerkeziYonlendirmeleri.mjs` emsali) +
veri dosyası `src/config/rotaDili.veri.json`. Satır: `{ id, klasor, tr, en, eskiAdresler[] }` (örnek: `{ id:'hakkimizda',
klasor:'about', tr:'hakkimizda', en:'about' }`). Tablo **veri**dir; Design'ın adres listesi (OPS-48, vade 6 Ekim) gelince
yalnız bu dosya dolar. Aynı tablodan:

1. **Eski → yeni tek hop 308** (kalıcı, A9): `rotaDiliYonlendirmeleri(acik)` (config) + saf `rotaDiliEsle(yol)` (dilsiz kol için).
2. **Yeni adres → mevcut klasör iç yeniden yazım** (`rotaDiliYenidenYazimlari(acik)`): klasör adları değişmez, sayfa kopyası yok.
3. **Adres üretimi**: iç bağlantı, kanonik, hreflang, site haritası satırı `yuzeyAdresleri.ts` / `Routes` üzerinden
   (kural 7 + cetvel `INV-ADRES-SEMASI-1`); `rotaDili` tablosunu okuyan **tek** `yuzeyYolu(id, dil)` eklenir.

### 2.2 Nerede çalışır: dilli kurallar `next.config`, dilsiz eski adresler middleware

**Dilli kurallar (`/tr/about` → `/tr/hakkimizda`, `/en/destek/sss` → `/en/support/faq` …) `next.config.mjs` `redirects()` + `rewrites()`
içinde**, tablodan üretilir: emsal var (`bilgiMerkeziYonlendirmeleri(EN_YAYIN)`, `markaYonlendirmeleri(ADRES_SEMASI_K3B)` — bayrakla
açılıp kapanan liste, test yayındaki fonksiyonu doğrudan çağırır) ve cetvel A §3 "veriden bağımsız birkaç desen" config'e serbest;
bu kurallar veriye bağlı DEĞİL (statik sayfalar). Anahtar kapalıyken iki fonksiyon `[]` döner.

**ÖLÇÜLDÜ, ilk düşüncemi çürüttü (2026-10-04, canlı):** config 308'leri de `Cache-Control: public, max-age=0, must-revalidate`
taşıyor (`/tr/destek/merkez`, `/tr/destek/hesaplayicilar`, `/tr/products/vortice-lineo-100-quiet`; Vercel kendisi ekliyor).
Yani "config başlık veremez, geri alınan anahtar tarayıcıya çivilenir" kaygısı **geçersiz** (başlık platform davranışı; Cloudflare'e
taşınırsa A11 için ayrıca ölçülür).

**Gerçek sorun dilsiz eski adreste (ölçüldü):** bugün `/about` → **307** `/tr/about` (200); `/destek/sss` → 307 `/tr/destek/sss`.
Yalnız config kuralıyla yeni adreste bu `307 → 308` = **2 sıçrama**, A9 bütçesi 1. Çözüm yolu PR-C'de ölçülerek seçilir:
(a) middleware'e, mevcut `ADRES_SEMASI_K3B` kolunun yanına, aynı kalıpla (saf tablo araması, DB yok) dilsiz eski adresi tek adımda
`/<dil>/<yeni>` yapan küçük kol; (b) dilsiz eski adreslerin hiç dışarıda yaşamadığı (arama motoru/dış bağlantı yok) kanıtlanırsa
2 sıçrama kabul edilip cetvele yazılır. Önerim (a): ucuz, A9'a uyar.

Mevcut config kuralları (ör. `/destek/hesaplayicilar` → `/urun-secici`, karar 92 listesi) hedef olarak **eski** adresi gösteriyor;
yeni adrese geçince zincir olur. Tablo bunları da yeniden yazar; zincir testi (§3.4) arar.

### 2.3 Anahtar

**Öneri: `NEXT_PUBLIC_ADRES_DILI=1` ortam değişkeni, derleme anında okunur** (istemci bileşenleri link üretiyor → `NEXT_PUBLIC_`
zorunlu; aynı derleme çıktısı middleware, sitemap ve linklerde tutarlı). Vercel'de Preview=1, Production=0. Yayın günü Production=1 +
yeniden dağıtım (kod PR'ı gerekmez); geri alma = 0 + yeniden dağıtım ya da Vercel'in önceki yayına anında dönüşü.
Değişken yok / bozuk = **kapalı** (güvenli yön).

| Seçenek | Artı | Eksi |
|---|---|---|
| **Ortam değişkeni (öneri)** | taşınabilir (A6, karar 59); önizlemede açık, canlıda kapalı; PR'sız | `features.ts` geleneği (REC-94: sabit, env değil) ile ayrışır; yayın günü "açmayı unutma" riski → yayın listesine canlı-matris ölçümü eklenir (§3.3) |
| Derleme sabiti (`features.ts`) | repo geleneği, sessizce yanlış değere düşmez | önizlemeyi canlıdan ayırmak için ayrı dal/dağıtım; açmak PR + dağıtım |
| Edge Config | dağıtımsız anlık | Vercel'e özgü (A6, karar 59); `next.config` onu okuyamaz → çifte mekanizma |

**OPS'tan karar: ortam değişkeni mi, derleme sabiti mi?** Önerim ortam değişkeni; sabit seçilirse §3 aynen geçerli.

### 2.4 K3B ile ilişki

K3B (kategori/ürün/marka, eski-adres haritası, **migration gerektiren slug işleri**) bu işte **değişmez**; benim işim yalnız
`rotaDili`. Yayın günü iki anahtar **tek listede, birlikte** açılır; çakışma testi iki kural kümesinin birleşiminde zincir arar.
ÜRÜN bu akşam Casals/Flexiva/Sığınak migration PR'ını hazırlıyor: marka/kategori adreslerine **dokunmuyorum**, ÜRÜN'e yazacağım.
**Bu iş migration içermiyor.**

## 3. "Anahtar kapalı → canlıda sıfır adres farkı" nasıl ölçülür

### 3.1 Kapı 1 — kural kümesi dondurulmuş fikstürle birebir (CI, her PR)
Master 9ea04a55d'den bir kez alınır, commit'lenir: `nextConfig.redirects()` + `headers()` JSON'u ve `sitemap()` modelinin
(sahte DB fikstürüyle, `sitemapModel.test.ts` emsali) adres listesi. Anahtar kapalıyken `rotaDili` çıktısı **boş**, config ve
sitemap çıktısı fikstürle **derin eşit**. Mutasyon: tabloya bir satır eklenip anahtar kapalı bırakılırsa test kırmızı olmalı.

### 3.2 Kapı 2 — yerel derlenmiş uygulamada HTTP matrisi (anahtar=0, master'la fark = ∅)
Betik `scripts/adres/matris.cjs` (yeni, salt okuma): rota listesi **iki kaynaktan**:
1. `find "src/app/[lang]" -name page.tsx` → 54 şablon × {tr, en}; dinamik segmentlere sitemap'ten **sabitlenmiş** örnekler
   (ilk 3 kategori, 3 aile, 3 marka, 3 bilgi merkezi yazısı) — örnekler dosyaya yazılır, canlı veri değişse de matris sabit kalır.
2. Bilinen eski adresler (config + `eskiAdresler` + K3B tohumu).
Her adres için `HTTP durum + Location + cache-control`. **Ortam:** (a) `pnpm build && next start`, sahte-DB değil **gerçek
Supabase salt okuma anahtarı** (sitemap ve sayfalar gerçek veri ister); (b) aynı komutlar master'da → iki matris `diff` boş olmalı.

### 3.3 Kapı 3 — CANLI salt-okuma matrisi (birleşmeden önce ve sonra)
Aynı betik `https://venthub.com.tr` karşısında (yalnız GET/HEAD, 108+ istek, tek sefer): birleşme öncesi ve sonrası iki matris →
fark boş olmalı. Aynı betik yayın günü anahtar açıldıktan sonra **açık** matrisle karşılaştırılır (açmayı unutma/yanlış açma kapanır).

### 3.4 Açık kip kapıları (önizleme, anahtar=1)
Her eski adres → hedefe **tek hop** ve hedef 200; hedef hiçbir kuralla yeniden eşleşmez (döngü/zincir 0); hreflang çiftleri
karşılıklı ve `x-default`; kanonik = sitemap adresi = kendi adresi; sitemap'te eski adres 0; render edilmiş HTML'de eski adrese
giden `href` 0 (kırık adres 0); Aşama 2 önekleri hâlâ eski adreste 200.

## 4. Ölçülecek riskler (spike, kod yazmadan önce küçük deneme)

| Risk | Nasıl ölçülür |
|---|---|
| `rewrites()` sonrası `usePathname()` / dil değiştirici / aktif menü hangi yolu görüyor? (ÜRÜN kabuğu bunlara bağlı) | tek sayfalık deney (`/tr/hakkimizda` → `about`), 3 çağrının çıktısı yazılır. Yanlışsa yedek: klasörü fiziksel yeniden adlandırma (ÜRÜN şeridi, ayrı karar) |
| Dilsiz eski adres sıçrama sayısı (§2.2) | matris betiği her dilsiz adres için hop sayar; >1 ise kol (a) |
| `typedRoutes: true` yeni adreslerde tip hatası | tek `Link` ile `pnpm type-check` |
| Mevcut config 308'leri yeni adrese zincir kurar | zincir testi (§3.4) |
| EN adresler `EN_YAYIN=false` iken sitemap/hreflang'da yok: yayın günü EN açılıyor mu? | **OPS'a soru** (aşağıda) |

## 5. İş paketleri ve takvim (OPS-52 vade Çar 7 Ekim)

| PR | İçerik | Canlıya etkisi | Zaman |
|---|---|---|---|
| A | `rota-dili-standard.md` (cetvel) + tablo/saf fonksiyon + Kapı 1 fikstürü + spike sonucu | sıfır (anahtar kapalı) | Pzt 5 Ekim |
| B | `scripts/adres/matris.cjs` + Kapı 2/3 (yalnız ölçüm betiği) | sıfır | Pzt–Sal |
| C | config `redirects()`/`rewrites()` + dilsiz kol kararı (§2.2) + `yuzeyYolu` + sitemap/hreflang bağlama | sıfır (Kapı 1+2+3 kanıtlı) | Salı 6 Ekim |
| D | Design listesi (OPS-48, vade Salı) → `rotaDili.veri.json` + açık-kip kapıları | sıfır (anahtar kapalı) | Çar 7 Ekim |
| — | Cuma 10 Ekim önizleme: anahtar Preview=1; yayın günü Production=1 | — | OPS-59 |

**YÖNTEM** (cetvel `execution-method-standard.md`): uygulayıcı **ekip üyesi** (Agent `name`, sonnet); denetçi ve doğrulayıcı
**düz alt ajan, name'siz** (karar 251); kritik kod (kural üretici, zincir/döngü, dilsiz kol) için `mutasyon-testi` bağımsız doğrulama.
Migration içeren PR birleştirilmez; çıkarsa PR açılır, durulur, OPS'a yazılır (Salı onayı, OPS-54).

## 6. OPS'a açık sorular

1. **Anahtar türü:** ortam değişkeni (öneri) mi, derleme sabiti mi? (§2.3)
2. **`EN_YAYIN`:** 11 Ekim'de açılıyor mu? Kapalıysa EN adresler çalışır ama sitemap/hreflang'da yoktur; testler iki kipte yazılır.
3. **Tek yayın listesi:** `ADRES_SEMASI_K3B` ve `NEXT_PUBLIC_ADRES_DILI` yayın günü birlikte mi açılır? (önerim evet, K3B'nin eski kararı: Recep önizlemede "gördüm, tamam", karar 68)
4. Design'ın adres listesi (OPS-48) Salı'ya kadar gelmezse D PR'ı Çarşamba'ya kayar; A–C bağımsız ilerler.
