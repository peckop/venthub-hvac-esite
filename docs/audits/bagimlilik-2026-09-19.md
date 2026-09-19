# Bağımlılık güvenlik taraması — 2026-09-19 · **11 yüksek kaydın ETKİSİ ölçüldü**

**Şerit:** ALTYAPI · **Kayıt:** REC-345 · **Cetvel:** `docs/standards/bagimlilik-guvenlik-yukseltme-standard.md`
**Önceki ölçüm:** `bagimlilik-2026-09-15.md` (sayılar aynı çıktı, aşağıda karşılaştırıldı)

> ⛔**BU KAYIT BİR YÜKSELTME EMRİ DEĞİL.** Hiçbir paket yükseltilmedi, `pnpm install`
> koşturulmadı, `pnpm-lock.yaml` değişmedi. Kayıt yalnız bugünün durumunu ve **etkisini** ölçer.

---

## 1 · SAYILAR (üretim ağacı, `pnpm audit --prod --json`)

| Ölçüt | Değer | 09-15 ölçümü |
|---|---:|---:|
| Yüksek önemde güvenlik kaydı (prod) | **11** | 11 |
| Orta | 6 | 6 |
| Düşük | 5 | 5 |
| Kritik | **0** | 0 |
| Toplam güvenlik kaydı (prod) | 22 | 22 |

> ⛔**İLK SATIRIN YAZILIŞI BİR SÖZLEŞMEDİR.** İstem başındaki `BAGIMLILIK:` satırı `high`
> sayısını **bu tablodan** okur (`defter-tazelik-satiri.cjs`). Satır başlığı değişirse sayı
> okunamaz ve satır "high OKUNAMADI" der. Bu kayıt yazılırken tam olarak bu oldu ve kanca
> dürüstçe söyledi; kapı kolu eklendi (`kanca-defter-tazelik.test.ts`).

Dört günde tablo değişmedi. Bu, "kayıt veritabanı her gün değişir" uyarısına rağmen bu
kalemlerin **duran borç** olduğunu gösterir, hareketli bir tehdit değil.

---

## 2 · ⭐ASIL SORUNUN CEVABI — 11 YÜKSEK KAYDIN ÜRETİM ETKİSİ

Kuyrukta duran soru şuydu: *"11 yüksek kaydın prod etkisi ne?"* Cevap, kayıtların **giriş
yolundan** çıkıyor. Yollar `audit` çıktısının `findings[].paths` alanından alındı:

| Paket | Adet | Tam yol |
|---|---:|---|
| `fast-uri` | 6 | `@sentry/nextjs` → `@sentry/webpack-plugin` → `webpack` → `schema-utils` → `ajv` → `fast-uri` |
| `brace-expansion` | 3 | `@sentry/nextjs` → `@sentry/webpack-plugin` → `@sentry/bundler-plugin-core` → `glob` → `minimatch` → `brace-expansion` |
| `browserslist` | 2 | `@sentry/nextjs` → `@sentry/webpack-plugin` → `@sentry/bundler-plugin-core` → `@babel/core` → `@babel/helper-compilation-targets` → `browserslist` |

⭐**ÜÇÜNÜN DE ORTAK ATASI `@sentry/webpack-plugin` — yani DERLEME ARACI.** Webpack eklentisi
paketleyicinin içinde koşar; Next.js paketleyiciyi sunucuya göndermez ve tarayıcıya hiç
göndermez. Dolayısıyla bu on bir kaydın hiçbiri **müşteriye hizmet veren çalışma zamanında
değildir**: ne sunucu yanıt yolunda, ne tarayıcı paketinde.

### Kayıtların cinsi de aynı şeyi söylüyor

| Paket | Kayıt cinsi | Beslendiği girdi |
|---|---|---|
| `brace-expansion` ×3 | Hizmet dışı bırakma (CWE-400/407/770) — üstel genişleme, sınırsız ara dizi | **bizim** dosya kalıplarımız (glob) |
| `browserslist` ×2 | Sınırsız bellek büyümesi · güvenilmeyen yapılandırmayla çökme (CWE-770, CWE-1321) | **bizim** `browserslist` yapılandırmamız |
| `fast-uri` ×6 | SSRF ve sunucu adı karıştırma (CWE-918, CWE-436, CWE-177) | **webpack yapılandırma şeması** (ajv doğrulaması) |

Üçünde de girdi **depomuzun kendi içeriğidir**, müşteriden gelen veri değil. `fast-uri`'nin
SSRF kayıtları ilk bakışta en ağırı görünür; ama o paket burada kullanıcı URL'i değil, webpack
yapılandırma şeması ayrıştırıyor.

### Hüküm

**Canlı sitenin risk yüzeyi bu kayıtlardan ETKİLENMİYOR.** Kalan gerçek yüzey **derleme
makinesidir** (Vercel derlemesi + GitHub Actions). Orada da sömürü, saldırganın derleme
sırasında bu araçlara girdi ulaştırabilmesini gerektirir; girdi depodan geldiği için bu, önce
depoya yazabilmek demektir — o noktada zaten daha büyük bir sorun vardır.

⚠**Bu "önemsiz" demek DEĞİLDİR, "acil değil" demektir.** Kayıtlar durmaya devam eder ve
sayıları her turda görünür.

---

## 3 · ONARIM SEÇENEKLERİ (karar Recep'in, burada yalnız ölçüm)

| Seçenek | Ne yapar | Bedeli | Değerlendirme |
|---|---|---|---|
| **A · `@sentry/nextjs` 8 → 10** | On birini birden kapatır (hepsi bu paketin altından geliyor) | **İki ana sürüm** atlaması, kırıcı değişiklik taşır; hata izleme yüzeyini ellemek gerekir | Sentry işinin (karar 17) **içinde** yapılır — ayrı yapılırsa aynı iş iki kez ölçülür |
| **B · `pnpm.overrides` ile yamalı alt sürümleri zorla** | Kayıtları kapatır, ana sürüme dokunmaz | Kilit dosyası değişir; zorlanan sürüm webpack/babel ile uyumsuz çıkarsa derleme kırılır ve sebebi derinde kalır | Derleme-zamanı bir risk için derlemeyi riske atmak **orantısız** |
| **C · Bırak, görünür tut** | Hiçbir şey | Sayı her turda yazılı kalır | Ölçüm "canlıya etkisi yok" dediği için **savunulabilir** |

**Önerim: A, ama Sentry işiyle birlikte.** Recep 2026-09-19'da *"Sentry'yi sona bırak,
acelesi yok"* dedi; bu ölçüm o kararla **çelişmiyor, onu destekliyor**: erteleme müşteriye
dönük bir riski beklemeye almıyor.

---

## 4 · SINIRLAR (adıyla)

- `pnpm audit --prod` yalnız **üretim** ağacını tarar; geliştirme bağımlılıkları bu tabloda yok.
- Yollar **kilit dosyasının** söylediği ağaçtır. "Derleme aracı" hükmü bu ağaca ve webpack
  eklentisinin ne olduğuna dayanır; **üretilmiş çıktının içi ayrıca taranmadı** (derleme
  koşturulmadı). Hüküm bu yüzden "paketleyici sunucuya gönderilmez" olgusuna dayanıyor, tek tek
  dosya araması yapılmadı — kanıt derecesi bu kadardır.
- Sayılar tek koşumun çıktısıdır; kayıt veritabanı her gün değişir. 09-15 ile aynı çıkması
  tesadüf değil ama garanti de değil.
- 09-15 kaydındaki **borç 1** (cetvelde "major nasıl sayılır" tanımı yok) bu koşumda da
  kapatılmadı; bu kayıt yalnız güvenlik tarafını ölçtü, güncellik tarafını değil.
