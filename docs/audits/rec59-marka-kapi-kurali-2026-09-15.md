# REC-59 açık kalemi · marka sınıfı kapı kuralı — ÖLÇÜM KAYDI

**Tarih:** 2026-09-15 · **Şerit:** ALTYAPI · **Kayıt:** REC-59 (açık kalem)
**Kapı:** `tests/smoke/ssr-kurallari.ts` · `src/__tests__/conformance/ssr-duman-kilidi.test.ts`
**Yöntem:** ALTYAPI worktree'sinde `pnpm build` (105 HTML), üretilen HTML'lerde doğrudan sayım.

---

## 0 · KAPANAN KALEM

`tests/smoke/ssr-kurallari.ts` kendi içinde şunu yazıyordu:

> ⚠BUNDAN DOĞAN AÇIK KALEM: `brands/[slug]` sınıfının kapı kuralı bu dosyada YOK ve o rota
> bugün 2 marker üretiyor — yani kimse bakmıyor.

**Kalem kapandı:** iki yeni sınıf (`marka-listesi`, `marka`) kural kümesine girdi, ikisi de
zorunlu kapıda koşuyor, tavanları ilandan türetiliyor.

⭐**SAYIYI BU KEZ ALTYAPI KENDİ ÖLÇTÜ.** Anasayfa ilanında marker sayısı URUN'un
derlemesinden aktarılmış ve bu sınır adıyla yazılmıştı ("ALTYAPI bu sayıyı kendi
derlemesiyle TEKRAR ÖLÇMEDİ"). Bu kalemde aynı borç bırakılmadı.

---

## 1 · ÖLÇÜM — MARKA SINIFI

| Dosya | Marker |
|---|---:|
| `tr/brands/{avens,casals,flexiva,frekans-konvertoru,nicotra-gebhardt,vortice}.html` | **2** (altısının altısı) |
| `en/brands/*.html` (aynı altı) | **2** |
| `tr/brands.html` · `en/brands.html` (liste) | **2** |

İki marker da **kök layout** kaynaklı: `vercel-analytics` ve `navigation-tracker` — yani
anasayfa ilanındaki aynı iki ada. Marka sayfasının **kendi sayfa-düzeyi adası YOK**
(HTML'deki iki marker da layout/footer bölgesinde).

### Rota sınıfı ilanı — ayırt edici olan bu

`src/app/[lang]/brands/[slug]/page.tsx` bugün `export const revalidate = 3600` +
`generateStaticParams()` taşıyor, ama **`export const dynamic` ilanı YOK**.

Bu, `#1196`'daki gerekçe düzeltmesiyle birebir uyumlu: ayırt edici şey bileşen değil **rota
sınıfı ilanı.** İlanı olmayan rotada `useSearchParams()` çağıran adalar marker doğurur. Yani
**2 sayısı bu rotanın bugünkü ilan durumunun sonucudur**; rota bir gün `force-static` ilan
ederse sayı 0'a düşer ve tavan (üst sınır olduğu için) yeşil kalır.

### ⚠105 vs 245 FARKI — ADIYLA

Aynı dosyanın anasayfa bölümü "245 HTML'lik tek bir derleme" diyor; benim derlemem **105**
HTML üretti. İki sayı iki farklı ana ait ve **fark ölçülmedi.** Buraya yazıyorum ki ileride
biri iki sayıyı karşılaştırıp birini bozuk sanmasın.

---

## 2 · ⭐ASIL BULGU — MARKA DETAYINDA ÜRÜN LİSTESİ SUNUCUDAN GELMİYOR

`.next/server/app/tr/brands/vortice.html` içinde:

| Aranan | Sayı |
|---|---:|
| `<h1` | 1 |
| "Vortice" (marka adı) | 39 |
| `href="/tr/products/` | **0** |
| `href="/tr/category/` | **0** |
| `animate-pulse` (iskelet) | **4** |

Yani sayfanın **başlığı ve marka anlatısı SSR'da**, **ürün listesi DEĞİL** — istemcide
yükleniyor ve HTML'de yerine dört iskelet duruyor.

### Bunun kapıya etkisi — ve niçin ölçütü gevşetmedim

Marka kuralına "ürün bağlantısı var" işareti **KOYULMADI**. Üç seçenek vardı:

1. İşareti koy → kapı **bugün kırmızı** olur (gerçeği söyler ama kimsenin kararı yok).
2. İşareti koy, sonra ölçütü gevşet → kapı olmayan bir şeyi doğruladığı izlenimi verir.
3. **İşareti koyma, sınırı ADIYLA yaz** → seçilen yol.

Kapı yalnız ölçtüğünü iddia eder. Sınır koda sabit olarak yazıldı
(`MARKA_DETAY_SSR_SINIRI`) ve kural bloğunun yorumunda tekrar edildi.

⭐**BU BİR AÇIK KALEMDİR, SESSİZ GEÇİLMİYOR:** marka detayında ürün listesinin sunucuda
üretilip üretilmemesi gerektiği bir **ÜRÜN kararıdır** (vitrin/SEO ekseni) ve bu dosyanın
işi değil. Karar "SSR olsun" çıkarsa o gün bu bloğun yerine bir işaret eklenir.

**Liste sayfasında durum FARKLI ve orada işaret KOYULDU:** `brands.html` altı
`href="/tr/brands/` bağlantısı basıyor — yani liste SSR'da gerçekten var. Aynı sınıf ailesinde
bir sayfanın verisi sunucudan gelirken diğerinin gelmemesi, ölçülmeden görülmezdi.

---

## 3 · ⛔ÇOK DAHA BÜYÜK BİR BOŞLUK ÖLÇÜLDÜ — AYRI KALEM GEREKTİRİR

Marka sınıfını ölçerken bütün derlemeyi saydım. Sonuç:

| Ölçüt | Değer |
|---|---:|
| Toplam rota sınıfı (HTML üreten) | **49** |
| Marker'ı 0 olan | 11 |
| **Marker'ı > 0 olan** | **38** |
| Bu kapının izlediği sınıf (bu PR'dan sonra) | **7** |

Yani **38 sınıf marker üretiyor ve kapı bunların 7'sine bakıyor.** Kalanı kimse izlemiyor —
bu, kapanan açık kalemin **aynı sınıfından ama otuz kat büyük** bir boşluk.

### Üçüncü bir ada var ve hiçbir yerde ilan edilmemiş

Beş sınıf **3** marker veriyor: `auth/login`, `auth/callback`, `payment-success`,
`destek/hesaplayicilar/hrv`, `destek/hesaplayicilar/hava-perdesi`.

Üçüncü marker **sayfa düzeyinde** doğuyor (girişte `animate-spin` bekleme göstergesiyle
sarılı bir ada). Marka sınıfında o yok — bu yüzden marka tavanı 2, 3 değil.
*İki sınıfın aynı sayıyı vermesi tesadüf olabilir; ayrımı ölçmeden tek tavan yazmak iki
sınıfı birbirine kefil yapardı.*

### Niçin bu PR'da kapatmadım

Bu iş **kapsam genişletmesi** olurdu ve üç sebeple ayrı kayıt gerektirir:

1. 38 sınıfın her biri için **tavan ilanı** yazmak, her birinin adalarını ölçmeyi gerektirir
   (bu kalemde altı HTML için yaptığım işin ~38 katı).
2. `account/**` ve `auth/**` sınıfları **oturum arkasında**; duman kapısının onları nasıl
   ölçeceği ayrı bir tasarım sorusudur (giriş yapmadan çekilen HTML temsili mi?).
3. Hepsini bir kerede kapıya sokmak, kırmızı çıktığında **herkesin merge'ini** bloklardı —
   bu dosyanın kendi doktrini bunu yasaklıyor ("kapıya yalnız SAĞLAM ölçütü olan sınıflar
   girer").

⭐**Ama ölçüm kayda geçti ve bu, boşluğun artık GÖRÜNÜR olduğu anlamına gelir.** Kapanan
kalem "brands/[slug] kimse bakmıyor" idi; yerine daha büyük ve **sayılmış** bir kalem
bırakıyorum: *kapı 38 sınıftan 7'sini izliyor.*

---

## 4 · ÖLÇÜM SIRASINDA ÇIKAN İKİ KENDİ KUSURUM

1. **Yeni kontrolüm eski kontrolün mesajını çaldı.** `zorunluKontrol` içine marka kontrolünü
   **başa** koydum; mevcut beş kol kategori/PDP hata metnini bekliyordu ve benim kontrolüm
   onlardan önce atıp başka metin verdi → 6 kol kırmızı. Sıra sona alındı.
   **Ders: yeni bir kontrol eklerken eski kontrolün mesajını çalmamak da ölçütün parçası.**
2. **Fikstürler gerçek haritaya benzemiyordu.** Marka kontrolü fail-closed olunca yapay
   sitemap'lerde hiç `/tr/brands/<slug>` olmadığı için beş kol daha düştü. İki yol vardı:
   kontrolü gevşetmek ya da fikstürü gerçeğe benzetmek. **Fikstür seçildi** — gerçek site
   haritası marka adreslerini HER ZAMAN ilan ediyor (`sitemap.ts` §3), yani marka yolu
   olmayan harita ilgisiz bir kurguydu. *Kapıyı gevşetmek, olmayan bir dünyayı korumak için
   gerçek bir güvenceyi düşürmek olurdu.*

---

## 5 · SABOTAJ VE MANDAL (koşuldu, iddia değil)

- **Ölçüt ayırt ediyor:** liste kuralının işareti `href="/tr/brands/` → gerçek HTML'de
  **var**; `href="/tr/SABOTAJ/` yapıldığında → **yok**. Yani işaret her şeye yeşil demiyor.
- **Tavan mandal gibi çalışıyor:** iki sayfada da gerçek marker 2, tavan 2 → geçer. İlandan
  **bir ada düşürülse** tavan 1 olur ve ikisi de **İHLAL** verir. Yani tavan ilana bağlı ve
  ilan boşaltılamaz.
- **Temsilci yoksa kapı KIRMIZI:** site haritası marka adresi ilan etmezse `zorunluKontrol`
  ayrı bir hatayla düşer; sebebi (harita kusuru) mesajda yazılı. Ölçememek geçmek değildir.

---

## 6 · SINIRLAR (adıyla)

1. Sayılar **tek derlemenin** çıktısı (105 HTML). Aynı ölçüm başka bir anda başka sayı
   verebilir; tavan bu yüzden **üst sınır** olarak yazıldı, kesin sayı olarak değil.
2. Marka detay temsilcisi **adresten** seçiliyor, içerikten değil — kategori sınıflarındaki
   gibi bir belirsizlik olmadığı için (REC-286). Eğer bir gün iki farklı marka şablonu
   doğarsa bu seçim yetersiz kalır.
3. Bu kapı **repo/derleme** HTML'ini değil, duman koşumunda **canlı yanıtı** ölçer. Buradaki
   sayılar beklentiyi kurmak için kullanıldı; canlıdaki sayı farklıysa kapı kırmızı verir —
   fail-closed, sessiz geçmez.
4. Üçüncü adanın **hangi bileşen** olduğu kesinleştirilmedi; yalnız sayfa düzeyinde doğduğu
   ve `animate-spin` ile sarılı olduğu ölçüldü. Marka sınıfını etkilemediği için burada
   kapatılmadı.
