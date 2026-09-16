# REC-348 · rota sınıfı kapsamı — ÖLÇÜM KAYDI

**Tarih:** 2026-09-16 · **Şerit:** URUN · **Kayıt:** REC-348
**Doğuran kalem:** `docs/audits/rec59-marka-kapi-kurali-2026-09-15.md` §3 — *"kapı 38 sınıftan
7'sini izliyor"*
**Kapı:** `tests/smoke/ssr-kurallari.ts` (salt OKUNDU, değiştirilmedi — dosya ALTYAPI şeridinde)
**Yöntem:** ELLE. Alt-ajan kullanılmadı; 74 `page.tsx` tek bash taramasıyla çıktı, fan-out
gerekmedi. *(Cetvel `execution-method-standard.md`: sapma bir cümleyle yazılır — bu o cümledir.)*
**Migration:** YOK. **Kod değişikliği:** YOK. Yalnız ölçüm belgesi.

---

## 0 · ⭐ÖNCE EVREN — 74 ile 38/49 AYNI ŞEYİ SAYMIYOR

Bu bölüm başa konuldu çünkü **evren yazılmadan sayılar karşılaştırılamaz.** Aynı tuzağa bu
depoda iki kez düşüldü (Agent-Reach kapsamı, migration 112/233), üçüncüsü olmasın.

| Sayı | Birimi | Kaynağı |
|---:|---|---|
| **74** | `src/app/**/page.tsx` **dosyası** = rota TANIMI | bu ölçüm, kaynak ağacı |
| **49** | derlemede **HTML üreten** rota sınıfı | REC-59 ölçümü, 105 HTML'lik derleme |
| **38** | o 49'un **marker'ı > 0** olan alt kümesi | aynı ölçüm |
| **7** | kapının bugün izlediği sınıf | `Sinif` union'ı, aşağıda sayıldı |

### Farkın sebebi ÖLÇÜLDÜ: admin paneli

Bu ağaçtaki derleme çıktısında (`.next/server/app`) doğrudan saydım:

| Aranan | Sayı |
|---|---:|
| Toplam `.html` | 105 |
| `admin` yolu altında `.html` | **0** |
| `account` yolu altında `.html` | 26 |

**26 admin rotası hiç HTML üretmiyor** (hepsi `dynamic = 'force-dynamic'`). Yani:

> 74 rota tanımı − 26 admin rotası = **48** ≈ REC-59'un **49**'u.

Kalan bir birimlik fark `_not-found` benzeri çerçeve sayfalarından geliyor; **kesinleştirilmedi**
ve bu belgenin sonucunu değiştirmiyor.

**Dil çarpanı YOK:** TR ve EN aynı `page.tsx`'i paylaşıyor (`[lang]` parametresi). 105 HTML
sayısındaki ikilik dil çarpanıdır, 74 sayısında yoktur. İki sayıyı bölerek/çarparak
eşitlemeye çalışmak hatalıdır.

### ⚠BU BÖLÜMÜN SINIRI — ADIYLA

Yukarıdaki HTML sayımı **2026-09-14 tarihli** bir derlemeden geliyor (`.next/BUILD_ID` damgası);
bu ağacın git tepesi ise **1d4c05714** (2026-09-16). Aradaki iki günün derlemeyi değiştirip
değiştirmediği **ölçülmedi** — taze derleme yapılmadı. Rakamlar evren farkını açıklamak için
yeterli, ama **kapı beklentisi kurmak için kullanılamaz.**

⛔Ayrıca o bayat derlemede `products/<slug>` ve `category/**` HTML'i **YOK**, oysa kapı bu iki
sınıfı izliyor. Sebep ölçülmedi (veritabanısız derlemede `generateStaticParams` boş dönmüş
olabilir). **Bu bir bulgu değil, bir soru işaretidir** ve taze derleme yapılmadan bulguya
çevrilmemelidir.

---

## 1 · KAPININ BUGÜN İZLEDİĞİ 7 SINIF

`tests/smoke/ssr-kurallari.ts` içindeki `Sinif` union'ı:

`anasayfa` · `liste` · `altgruplu-kategori` · `yaprak-kategori` · `pdp` · `marka-listesi` · `marka`

Kural kollarında `kapida: true` olan **6**, `kapida: false` olan **1**
(`altgruplu-kategori` — bilinçli, dosyanın kendi yorumunda gerekçesi yazılı: kırılgan ölçüt
zorunlu kapıyı bloklamasın).

Yedisinin **tamamı vitrin** sınıfı. Yani kapı bugün yalnız müşterinin gördüğü ve Google'ın
taradığı yüzeyi izliyor; bu bir eksiklik değil, **bilinçli bir öncelik** — ama sınırı adıyla
bilinmeli.

---

## 2 · 74 ROTANIN TAMAMI — SINIF İLANI DURUMU

Ölçülen alanlar: `export const dynamic` · `export const revalidate` · `generateStaticParams`
varlığı · dosya başında `'use client'`.

### 2.1 · Vitrin — 13 rota (kapının evreni burası)

| Rota | `dynamic` | `revalidate` | Kapıda? | Kapıya girmesi için ne gerekir |
|---|---|---|---|---|
| `/[lang]` | `force-static` | 3600 | ✅ `anasayfa` | — |
| `/[lang]/products` | `force-static` | 3600 | ✅ `liste` | — |
| `/[lang]/products/[slug]` | **YOK** | 3600 | ✅ `pdp` | ilan eksik ama kapıda — §4 madde A |
| `/[lang]/category/[c]` | `force-static` | 3600 | ✅ `yaprak-kategori` | — |
| `/[lang]/category/[c]/[s]` | **YOK** | YOK | ⚠ `altgruplu-kategori`, `kapida: false` | ilan + ölçüt sağlamlaştırma — §4 madde A |
| `/[lang]/brands` | **YOK** | YOK | ✅ `marka-listesi` | ilan eksik ama kapıda — §4 madde A |
| `/[lang]/brands/[slug]` | **YOK** | 3600 | ✅ `marka` | ilan eksik ama kapıda — §4 madde A |
| `/[lang]/about` | `force-static` | YOK | ❌ | temsilci + marker tavanı ilanı (kolay) |
| `/[lang]/contact` | `force-static` | YOK | ❌ | temsilci + marker tavanı ilanı (kolay) |
| `/[lang]/urun-secici` | **YOK** | YOK | ❌ | önce sınıf ilanı, sonra tavan |
| `/[lang]/cart` | **YOK** | YOK | ❌ | sepet durumu istemcide — ölçüt tasarımı gerekir |
| `/[lang]/checkout` | **YOK** | YOK | ❌ | ödeme akışı — ölçüt tasarımı gerekir |
| `/[lang]/payment-success` | **YOK** | YOK (`'use client'`) | ❌ | 3 marker'lı grup — §4 madde C |

### 2.2 · Destek/bilgi — 10 rota, **hiçbirinde sınıf ilanı YOK**

`destek/garanti-servis` · `destek/iade-degisim` · `destek/merkez` · `destek/sss` ·
`destek/teslimat-kargo` · `destek/konular/[slug]` ·
`destek/hesaplayicilar/{hava-perdesi, hrv, jet-fan, kanal}`

Onunun da `dynamic` ilanı yok, `revalidate` yok. Yedisi `'use client'` taşıyor.
Dördü (hesaplayıcılar) REC-150'de zaten ölçülmüş bir Suspense sınırı sorunu taşıyordu.

⭐**Bu grup SEO açısından değerli** — "jet fan hesaplama" gibi aramalar buraya düşer.
İlansız olmaları, marker doğurmalarına ve sunucu gövdesinin zayıflamasına açık kapı bırakıyor.

### 2.3 · Yasal — 6 rota, **altısında da ilan TAM**

`legal/{cerez-politikasi, gizlilik-politikasi, kullanim-kosullari, kvkk,
mesafeli-satis-sozlesmesi, on-bilgilendirme-formu}` — hepsi `force-static`.

İlanı en temiz grup bu. Kapıya girmeleri için ek iş neredeyse yok; tek gereken temsilci seçimi
ve tavan ilanı.

### 2.4 · Kimlik — 5 rota, **hiçbirinde ilan YOK**

`auth/{callback, forgot-password, login, register, reset-password}`

REC-59 ölçümünde `auth/login` ve `auth/callback` **3 marker** veren beş sınıftan ikisiydi.
Üçüncü marker sayfa düzeyinde doğuyor ve **hangi bileşenden geldiği hâlâ kesinleştirilmedi.**

### 2.5 · Hesap — 14 rota, hepsi `force-dynamic`

`account` ve altındaki 13 sayfa. İlan **var** ve tutarlı. Ama oturum arkasında olduğu için
duman kapısının bunları nasıl ölçeceği ayrı bir tasarım sorusu (giriş yapmadan çekilen HTML
temsili mi sayılır?). REC-59 bu soruyu adıyla bırakmıştı, burada da açık kalıyor.

### 2.6 · Yönetim — 26 rota, hepsi `force-dynamic`, **HTML üretmiyor**

`admin` ve altındaki 25 sayfa. Ölçtüm: derlemede admin HTML sayısı **0**.

⭐**Bu grup kapıya HİÇ girmemeli** ve bu bir eksiklik değil: prerender edilmeyen bir rotada
prerender marker'ı doğmaz, dolayısıyla ölçülecek bir şey yoktur. Kapıyı bunlarla genişletmek,
ölçmediği bir şeyi ölçüyormuş gibi görünen bir kapı üretirdi.

---

## 3 · TEK PR'DA ALINABİLECEK KÜMELER

Kümeleme ölçütü: **aynı kalıp + aynı ölçüt tasarımı + aynı risk sınıfı.** Ayrı kalıp ayrı PR.

| # | Küme | Rota | Niçin tek PR | Tahmini zorluk |
|---:|---|---:|---|---|
| **K1** | Yasal sayfalar | 6 | Altısı da `force-static` ilanlı, içerik statik, ölçüt tek kalıp (`<h1` + gövde kelime sayısı) | düşük |
| **K2** | Vitrin bilgi sayfaları (`about`, `contact`) | 2 | İkisi de `force-static` ilanlı, K1 ile aynı ölçüt kalıbı ama ayrı sınıf adı gerekir | düşük |
| **K3** | Destek içerik sayfaları | 6 | Aynı şablon ailesi; önce **sınıf ilanı yazılmalı**, sonra tavan | orta |
| **K4** | Hesaplayıcılar | 4 | Aynı kalıp; REC-150'nin Suspense sınırı dersi doğrudan geçerli | orta |
| **K5** | Kimlik sayfaları | 5 | Üçüncü ada burada; **önce o adanın kimliği ölçülmeli**, tavan ondan sonra yazılır | orta-yüksek |
| **K6** | Hesap sayfaları | 14 | Tek kalıp ama **oturum arkası ölçüt tasarımı** açık soru | yüksek |
| **—** | Yönetim sayfaları | 26 | **Kapsam dışı**, kapıya alınmaz (HTML üretmiyor) | — |

Toplam kapıya alınabilir: **37 rota**, altı PR. Bugün kapıda olan 7 sınıfla birlikte vitrin ve
bilgi yüzeyinin tamamı izlenmiş olur.

**Sıra önerisi:** K1 → K2 → K3 → K4 → K5 → K6. Gerekçe: ilanı zaten tam olan gruplar önce
gelir, çünkü onlarda iş yalnız kapı kolu yazmaktır; ilanı olmayan gruplarda **önce ilan
kararı** gerekir ve o karar ayrı bir eksendir.

---

## 4 · KARAR GEREKTİREN MADDELER

*(Numaralama bu belgede YAPILMAZ — Recep'e giden numarayı OPS verir. Burada harflendirildi.)*

**A — Kapıda olduğu hâlde sınıf ilanı olmayan dört vitrin rotası.**
`products/[slug]`, `brands`, `brands/[slug]`, `category/[c]/[s]` bugün kapıda ama
`export const dynamic` ilanı taşımıyor. REC-59'un kendi gerekçesi *"ayırt edici olan bileşen
değil rota sınıfı ilanıdır"* diyor. İlan yazılırsa marker sayısı düşer ve tavanlar (üst sınır
oldukları için) yeşil kalır. **Karar gerekir:** bu dördüne `force-static` ilanı yazılsın mı?
*Bu bir ÜRÜN kararıdır çünkü ISR davranışını ve veri tazeliğini etkiler.*

**B — Destek grubunun (10 rota) sınıf ilanı boşluğu.**
Onunda da ilan yok ve bunlar SEO değeri olan sayfalar. **Karar gerekir:** destek grubu
statik ilan edilsin mi, yoksa dinamik mi kalsın?

**C — Üçüncü adanın kimliği hâlâ ölçülmedi.**
REC-59 bunu açık bıraktı: beş sınıf 3 marker veriyor, üçüncüsü sayfa düzeyinde doğuyor,
`animate-spin` ile sarılı, **hangi bileşen olduğu bilinmiyor.** K5 kümesi bu ölçüm yapılmadan
yazılamaz. **Karar gerekmez, ölçüm gerekir** — ayrı bir kalem.

**D — Hesap sayfalarının ölçüt tasarımı.**
14 rota oturum arkasında. Giriş yapmadan çekilen HTML'i temsili saymak meşru mu?
**Karar gerekir** ve bu bir kapı tasarımı kararıdır (ALTYAPI ekseni), ürün kararı değil.

---

## 5 · BU ÖLÇÜMÜN SINIRLARI

1. **Sınıf ilanı okuması statiktir.** `export const dynamic` satırını metin olarak aradım;
   bir rota ilanını dolaylı yoldan (layout'tan, `generateStaticParams` davranışından) alıyorsa
   bu tarama onu görmez. Derleme çıktısıyla çapraz doğrulama **yapılmadı.**
2. **Marker sayıları bu belgede ÖLÇÜLMEDİ.** §0'daki sayılar REC-59'dan aktarıldı, taze
   derlemeyle tekrar ölçülmedi. REC-59'un kendi dersi *"sayıyı kendin ölç"* idi; bu belge o
   dersi **yerine getirmiyor** ve bunu adıyla yazıyor.
3. **Derleme çıktısı iki gün eski** (§0 uyarısı). Evren farkını açıklamak için yeterli,
   beklenti kurmak için değil.
4. **`_not-found` ve çerçeve sayfaları sınıflandırılmadı.** 48 ile 49 arasındaki bir birimlik
   fark buradan geliyor olabilir; kesinleştirilmedi.
5. **Zorluk tahminleri ölçüm değildir.** §3'teki "düşük/orta/yüksek" sütunu benim yargım;
   hiçbiri koşularak doğrulanmadı.

İlgili: REC-348, REC-59

🤖 Generated with [Claude Code](https://claude.com/claude-code)
