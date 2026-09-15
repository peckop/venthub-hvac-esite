# Bağımlılık güncelliği ve güvenlik taraması — 2026-09-15

**Şerit:** ALTYAPI · **Kayıt:** REC-345 (mekanizma parçası) · **Ağaç:** ALTYAPI worktree
**Cetvel:** `docs/standards/bagimlilik-guvenlik-yukseltme-standard.md`
**Kapı:** `src/__tests__/conformance/kanca-defter-tazelik.test.ts` (BAĞIMLILIK satırı kolları)

> ⛔**BU KAYIT BİR YÜKSELTME EMRİ DEĞİL.** Yalnız bugünün durumunu ölçer. Hangi paketin
> yükseltileceği Recep'in kararıdır ve bu kayıtta **hiçbir paket yükseltilmedi**
> (`pnpm install` koşulmadı, `pnpm-lock.yaml` değişmedi).

---

## 1 · SAYILAR (kendi ağacımda yeniden ölçüldü)

| Ölçüt | Değer | Komut |
|---|---:|---|
| Güncel olmayan paket | **63** | `pnpm outdated --format json` |
| Bunlardan ana sürüm (major) atlamalı | **26** | aynı çıktı, ilk sürüm hanesi kıyası |
| Yüksek önemde güvenlik kaydı (prod) | **11** | `pnpm audit --prod --json` |
| Orta | 6 | aynı |
| Düşük | 5 | aynı |
| Kritik | **0** | aynı |
| Toplam güvenlik kaydı (prod) | 22 | aynı |

### ⚠OPS'UN SAYISIYLA FARK VAR — ADIYLA YAZILIYOR

OPS aynı gün **66 paket / 40 major / 11 high** ölçtü. Benim ağacımda **63 / 26 / 11**.

- **High sayısı AYNI (11)** — yani güvenlik tablosu iki ağaçta aynı.
- **Paket sayısı 3 fark:** OPS ana ağaçta `pnpm install` koştu (kendi deyişiyle "next
  15.5.24 artık yerelde"); ben worktree'de kurulum **koşturmadım**. Kurulmuş sürüm
  değişince "güncel değil" listesi de değişir. Yani iki sayı **iki farklı ana**.
- **Major sayısı 14 fark:** bu bir ÖLÇÜT farkı olabilir. Benim ölçütüm ilk sürüm hanesinin
  değişmesi. `0.x` paketlerde bu ölçüt eksik kalır: semver'de `0.x` sürümlerde **minor
  hanesi kırıcıdır** (`three` 0.183 → 0.186, `lucide-react` 0.468 → 1.46). OPS'un sayısı
  bunları da sayıyorsa fark oradan gelir.
- ⭐**HANGİSİ DOĞRU SORUSU HENÜZ CEVAPLANMADI.** İki sayı da kendi ölçütüne göre doğru
  olabilir; kapalı olan şey **ölçütün yazılı olmaması.** Cetvele "major nasıl sayılır"
  tanımı yazılmadan bu iki sayı her hafta yeniden tartışılır. (Bkz. §4, borç 1.)

---

## 2 · ⭐ASIL BULGU — 11 YÜKSEK KAYDIN 11'İ DE TEK KAPIDAN GİRİYOR

Güvenlik kayıtlarını modüle göre değil **GİRİŞ KAPISINA** göre saydığımda tablo değişti:

| Doğrudan bağımlılık | Yüksek kayıt yolu |
|---|---:|
| `@sentry/nextjs` | **11 / 11** |
| diğer hepsi | 0 |

Yani yüksek önemli kayıtların **tamamı** tek bir doğrudan bağımlılıktan geliyor:
`@sentry/nextjs` **8.55.2** (güncel: **10.74.0**, yani **iki ana sürüm** geride).

Onun altından gelen paketler ve kayıtları:

| Dolaylı paket | Yüksek | Düzeltildiği sürüm |
|---|---:|---|
| `fast-uri` | 6 | ≥ 3.1.4 |
| `brace-expansion` | 3 | ≥ 5.0.7 |
| `browserslist` | 2 | ≥ 4.28.7 |

⭐**NİÇİN ÖNEMLİ:** "11 yüksek açık var" cümlesi, ele alınacak 11 iş varmış gibi okunur.
Ölçüm başka söylüyor: **tek bir doğrudan bağımlılığın sürümü** bu 11 kaydın hepsinin
sebebi. Bu, işin büyüklüğünü de riskini de değiştirir — ve bir "kova" listesi çıkarmadan
önce sorulacak doğru soru "Sentry yükseltmesi neyi kırar" sorusudur.

⚠**AMA BU BİR YÜKSELTME ÖNERİSİ DEĞİL:** iki ana sürüm atlaması kırıcı değişiklik taşır ve
Sentry bu projede hata izleme yüzeyidir. Yükseltme kararı Recep'in; ölçüm burada duruyor.

### Kalan kayıtların girişleri (yüksek olmayanlar)

| Dolaylı paket | Önem | Giriş | Düzeltildiği sürüm |
|---|---|---|---|
| `dompurify` | 2 orta, 3 düşük | `isomorphic-dompurify` 3.7.1 (güncel 4.2.0) | ≥ 3.4.12 |
| `fflate` | 2 orta | `@react-three/drei`, `@types/three` | ≥ 0.8.3 |
| `@opentelemetry/core` | 1 orta | `@sentry/nextjs` | ≥ 2.8.0 |
| `baseline-browser-mapping` | 1 orta | `@sentry/nextjs` | ≥ 2.11.0 |
| `postcss-selector-parser` | 1 düşük | `tailwindcss` 3.4.19 (güncel 4.3.3) | ≥ 6.1.3 |
| `@babel/core` | 1 düşük | `@sentry/nextjs` | ≥ 7.29.6 |

---

## 3 · BU ÖLÇÜM ARTIK GÖRÜNÜR — KAPIYA BAĞLANDI

Bu kaydın tek başına durması, REC-342'de ölçülen kusurun aynısını üretirdi: **ölçüm vardı,
kimse görmüyordu.** Bu yüzden ölçüm, her turun başında görünen satıra bağlandı
(`.claude/hooks/defter-tazelik-satiri.cjs`, UserPromptSubmit):

```
BAGIMLILIK: son tarama 0 gun · high 11
```

- **Eşik 14 gün** (varsayılan; `VENTHUB_BAGIMLILIK_ESIK_GUN` ile değişir). Aşılırsa satır
  `⚠` ile başlar.
- **`high ≥ 1` tek başına uyarı sebebi DEĞİLDİR** — bugün 11 high var ve bunların hepsi
  bilinen, kayda geçmiş, Recep kararı bekleyen kalemler. Her turda kırmızı yanan bir satır
  üç günde görmezden gelinir; kapı **tarama tazeliğini** ölçer, açıkların varlığını değil.
  Sayı yine de **yazılır**, çünkü gizlenmesi de yanlış olurdu.
- **Yaş ölçütü dosya adındaki tarih:** `docs/audits/bagimlilik-YYYY-MM-DD.md` dosyalarının
  en yenisi. ⚠Sınırı: "tarama yapıldı" ile "tarama kayda geçti" aynı şey değildir; bu
  ölçüt **kaydı** ölçer. Kayıt yazılmadan yapılan bir tarama görünmez — ve bu kasıtlı,
  çünkü kayda geçmeyen ölçüm bir hafta sonra yok sayılır.
- ⛔**Kanca ağa çıkmaz:** `pnpm outdated`/`pnpm audit` kanca içinde **koşturulmaz** (ikisi
  de ağ ister ve saniyeler sürer). Sayı bu kayıttan okunur; iki satırın toplam ek maliyeti
  **4 ms** (ölçüldü: `readdir docs/audits` 126 dosya → 0 ms, kayıt dosyası okuma → 3 ms).
- ⚠**BÜTÇE SAYISI DÜZELTİLDİ:** "300 ms" tavanı **toplam** süre olarak erişilemez —
  bu makinede **çıplak node açılışı tek başına 170-292 ms** (5 koşum). Kancanın toplamı
  355-534 ms, kendi işi ~135-240 ms. Ölçüt "kancanın kendi işi"dir; gerekçesi cetvelde
  (`proje-takip-defteri-standard.md` §5.1). Bir bütçe yazılırken **hangi sürenin ölçüldüğü**
  de yazılır, yoksa sayı ya erişilemez olur ya da sessizce gevşetilir.

---

## 4 · BORÇLAR (adıyla, kapatılmamış)

1. ⭐**"Major nasıl sayılır" tanımı cetvelde YOK** — §1'deki 26 ↔ 40 farkının sebebi bu
   olabilir. `0.x` paketlerde minor hanesi kırıcıdır; ölçüt bunu söylemiyor. Tanım
   yazılmadan bu sayı her taramada tartışılır.
2. **Kova (A/B/C) sınıflandırması YAPILMADI** — Recep'in 13/14 numaralı kararları
   bekleniyor. Bu kayıtta hiçbir paket "yükseltilecek" diye işaretlenmedi.
3. **Sıklık kuralı TASLAK** — cetvel §1'e "iki haftada bir tam tarama + her güvenlik
   olayında anlık" yazıldı ve **TASLAK olarak işaretlendi**; Recep onayı gelmedi.
4. **`pnpm approve-builds` beş paket** için hâlâ bekliyor (ayrı, eski kalem).
5. **`caniuse-lite` yedi ay bayat** — `pnpm lint` her koşumda bunu söylüyor ve kimse
   bakmıyor; ayrı kalem.
6. **Yükseltmenin neyi kırdığı ÖLÇÜLMEDİ.** Bu kayıt sürüm farkını ve açığı ölçer; bir
   yükseltmenin build/test üzerindeki etkisini **ölçmez**. O ayrı bir iştir ve kova kararı
   verildikten sonra yapılır.

---

## 5 · YÖNTEM VE SINIRLAR

- Komutlar ALTYAPI worktree'sinde koştu. **`pnpm install` KOŞTURULMADI**; kilit dosyası
  değişmedi (worktree kuralı: gerekirse yalnız `--lockfile-only`).
- `pnpm audit --prod` yalnız **üretim** ağacını tarar. Geliştirme bağımlılıklarındaki
  açıklar bu tabloda **YOK** — bilinçli: üretim yüzeyi ile geliştirme yüzeyi aynı riski
  taşımaz. Geliştirme tarafı ayrıca ölçülmedi.
- Girişler `audit` çıktısının `findings[].paths` alanından türetildi; yani **kilit
  dosyasının** söylediği ağaç. Aynı paketi iki ayrı yoldan çeken bir durumda ilk iki
  segment alındı, daha derin yollar kısaltıldı.
- Sayılar **tek koşumun** çıktısıdır ve kayıt tabanı (advisory veritabanı) her gün değişir.
  Bu yüzden sayılar tarihiyle birlikte anlamlıdır; dosya adındaki tarih bu yüzden ölçüttür.
