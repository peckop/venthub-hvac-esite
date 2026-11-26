# GEO-SEO dizin defteri — hangi sayfa hangi arama motorunda, ne yaptık, sırada ne var

Sahibi: GEO-SEO · Son doğrulama: 2026-11-26 · Cetvel: `docs/standards/departman-defter-standard.md` · Alan cetveli: `docs/standards/dizin-sistemleri-standard.md` (D7, D8, D8.1) · Kayıt: OPS-258, SEO-101, SEO-147

Bu defter depoya girebilen **özettir**: sayı, tarih, sha256. Ham adres×motor tablosu, arama sorgusu, tıklama ve sıra verisi burada durmaz (P6, cetvel D5); onlar depo dışı arşivde kalır (`~/VentHub-Olcum-Arsiv/geo-seo/dizin-takip/`: `hareketler.jsonl` işlem defteri, `dizin-takip-<gün>.json` günlük anlık görüntü, `yedek/` günlük kopya). Tutarlılık: `node scripts/seo/dizin-defter-kontrol.mjs` (0 tutarlı, 1 sapma, 2 ölçülemedi); özeti yenilemek için `--ozet`.

## 1. Ne yaptık

<!-- DEFTER-KANBAN:ne-yaptik BASLA — Kanban'dan üretilir (defter:geo-seo-dizin etiketi), elle düzenleme; node scripts/hijyen/defter-kartlari.cjs geo-seo-dizin --yaz · Üretildi: 2026-11-10 -->
| Kapanış | Kart | İş | Sahip |
|---|---|---|---|
| 2026-11-10 | SEO-103 | Sabah özeti girdisi | SEO |
| 2026-11-09 | SEO-102 | Bing durum ölçümü tam kapsamda ThrottleHost veriyor | SEO |
| 2026-11-09 | SEO-101 | OPS-258 pilot defteri geo-seo-dizin | SEO |
| 2026-11-09 | SEO-100 | Dizin takibi | SEO |
| 2026-11-08 | SEO-99 | dizin-acilis satır tarihi Türkiye gününe çevrilsin | GEO-SEO |
| 2026-11-08 | SEO-98 | Dizin sürecini otomatiğe bağla | GEO-SEO |
| 2026-11-08 | SEO-84 | Dizin takip düzeni | GEO-SEO |
| 2026-11-08 | ARC-282 | dizin-takip defterinin ikinci disk kopyası | ARAÇ |
| 2026-11-07 | SEO-87 | Ölçüm arşivi takip düzeni | GEO-SEO |
<!-- DEFTER-KANBAN:ne-yaptik BITIS -->

| Tarih | İş | Neden | Sonuç | Kart |
|---|---|---|---|---|
| 2026-11-26 | Etki defteri: değişiklik başına tek satır (kart, PR, hipotez, önce, 3/7/14/28. gün vadeleri, çakışma, hüküm), geriye dönük doldurma, adres başına zaman çizgisi | Bir değişikliğin etkisi hatırlamaya bağlıydı; çakışan değişiklikler birbirine karışıyordu | `dizin-takip.mjs --etki-doldur` ve `--etki`, `dizin-etki.mjs`, `dizin-etki-doldur.mjs`, `etki-son-kosu.mjs`, D8.1 | SEO-147 |
| 2026-11-21 | Google kalan sırası önce hiç istek almamış adres; Bilgi Merkezi liste sayfası otomatik istek dışı | Kota yaklaşık 11 iken daha önce istek almış adresler sırayı karıştırıyordu, liste sayfası her yeni yazıda yeniden YAP oluyordu | `kalanListe` sırası, `OTOMATIK_GOOGLE_ISTEK_DISI`, D7 madde 15; değişim başına bir istek kuralı aynı | SEO-134 |
| 2026-11-09 | Bing durum ölçümü tam kapsamda yavaş okur; OLCULEMEDI 61 → 7 | Tam kapsam Bing hız sınırına takılıyordu | `BING_ARALIK_MS` [1000, 2000, 3500] | SEO-102 |
| 2026-11-09 | Defter ve tutarlılık kontrolü | Alanın bugünkü hâli tek yerde, depo-güvenli | Bu dosya + `dizin-defter-kontrol.mjs` | SEO-101 |
| 2026-11-09 | Takip kapsamı tüm site haritası; Google "dizinde" olmadan TAMAM vermez | Tablo 101 adresin 40'ını izliyordu; taranmış ama dizinde olmayan sayfa TAMAM görünüyordu | 101 adresin 87'si Google dizininde, 14'ü değil; 7 ürün sayfası hiç istek almamıştı | SEO-100 |
| 2026-11-09 | Eski tarihli lastmod ve açılış satırı gününün Türkiye günü olması | Gece yarısından sonra UTC bir önceki günü yazıyordu | Açılış satırı TR günü | SEO-99 |
| 2026-11-08/09 | Dizin sürecini otomatiğe bağlama: açılış satırı, tarayıcı parçacık seti, Yandex kararı | Dizin isteği listenin önünde; günün ilk işi elle hatırlanıyordu | `dizin-acilis.mjs` (SessionStart kancası ARC-282), `tarayici-parcaciklari.mjs`, D7 madde 9-11 | SEO-98 |
| 2026-11-06/08 | Dizin takip düzeni: tek işlem defteri, adres×motor karar tablosu, günlük yedek | İstekler dağınık kayıtlıydı, aynı adrese tekrar istek atılıyordu | `dizin-takip.mjs`, defter 1 Kasım'dan, D7 | SEO-84 |
| 2026-11-06 | Ölçüm arşivi: "daha önce ölçüldü mü" | Aynı ölçüm tekrar yapılıyordu | `olcum-defteri.mjs`, D8 | SEO-87 |

## 2. Envanter

Özet bloğu `dizin-defter-kontrol.mjs --ozet` çıktısıdır; elle düzenlenmez. Dayandığı anlık görüntü depo dışıdır, defterde yalnız adı, günü ve sha256'sı durur.

<!-- OZET:BASLA -->
```json
{
  "anlikGoruntu": "dizin-takip-2026-11-26.json",
  "gun": "2026-11-26",
  "sha256": "ac08842d5da408e5b661f8d384837c81625ee53bc0672f5b047a57c7b07777f4",
  "adresSayisi": 110,
  "kapsam": {
    "about": 1,
    "bilgi-merkezi": 19,
    "brands": 7,
    "category": 30,
    "contact": 1,
    "diger": 2,
    "products": 49,
    "urun-secici": 1
  },
  "kararlar": {
    "google": {
      "TAMAM": 57,
      "BEKLE": 13,
      "TEKRAR": 0,
      "YAP": 40,
      "ATLA": 0,
      "ESKI": 0,
      "OLCULEMEDI": 0
    },
    "bing": {
      "TAMAM": 0,
      "BEKLE": 0,
      "TEKRAR": 0,
      "YAP": 0,
      "ATLA": 0,
      "ESKI": 0,
      "OLCULEMEDI": 110
    },
    "indexnow": {
      "TAMAM": 101,
      "BEKLE": 0,
      "TEKRAR": 0,
      "YAP": 9,
      "ATLA": 0,
      "ESKI": 0,
      "OLCULEMEDI": 0
    },
    "yandex": {
      "TAMAM": 0,
      "BEKLE": 6,
      "TEKRAR": 27,
      "YAP": 77,
      "ATLA": 0,
      "ESKI": 0,
      "OLCULEMEDI": 0
    }
  },
  "olculemeyen": {
    "bing: ThrottleHost": 110
  }
}
```
<!-- OZET:BITIS -->

| Parça | Ne | Son doğrulama | Dayandığı yol / komut |
|---|---|---|---|
| İzlenen adres kümeleri | Site haritasının tamamı: 101 adres (14 bilgi merkezi, 29 kategori, 47 ürün, 7 marka, 4 sabit sayfa) | 2026-11-09 | `node scripts/seo/dizin-takip.mjs --durum`; yukarıdaki özet |
| Google dizin durumu (canlı) | 87 adres dizinde, 14'ü değil: 11 Google'ın bilmediği (4 bilgi merkezi yazısı, 7 ürün sayfası), 2 keşfedildi-dizinde değil, 1 tarandı-dizinde değil | 2026-11-09 | `node scripts/seo/gsc-url-denetim.mjs --cikti <depo dışı>` (URL Inspection `verdict`) |
| Bing ölçümü | Kapsam 101'e çıkınca 61 adresin durumu `ThrottleHost` ile okunamadı; SEO-102 ile (adresler arası 1 sn, iki yavaş yeniden deneme) 7'ye indi, kalan 7 OLCULEMEDI (sessiz sıfır değil) | 2026-11-09 | `scripts/seo/dizin-takip.mjs` `bingOlc`, `BING_ARALIK_MS`; özetteki `olculemeyen` |
| Yandex | API yok; IndexNow ortak uç noktası Yandex'e iletir, elle istek bırakıldı; tarama bilgisi yalnız elle okunan ölçümle | 2026-11-08 | `dizin-sistemleri-standard.md` D7 madde 11 |
| IndexNow | Günlük görev + değişen adres bildirici; anahtar kamuya açık | 2026-11-09 | `scripts/seo/degisen-adres-bildir.mjs`, `.github/workflows/dizin-tetigi.yml` |
| Eski site adres evreni (donmuş, 308 geçişi girdisi) | 208 adres: 167 TR, 38 EN, 3 dil öneksiz; 179'u Google dizininde (PASS), 29'u dizinde değil ama 90 günde gösterim almış (10 yönlendirmeli, 8 noindex, 7 Google'ın bilmediği, 4 diğer); ?sku= biçimli adres 0. Kaynak: site haritası 101 + Search Console 202 sayfa (10 Ağustos–7 Kasım). sha256 `561084da34cbb7d1f0ab10cd46750cefd6618ac70062116c21e5e4ff30aaca4c` | 2026-11-10 | Depo dışı `~/VentHub-Olcum-Arsiv/geo-seo/seo76-evren-2026-11-10/adres-evreni-2026-11-10.csv` (+ `.json`, `.sha256`); `scripts/seo/evren-dondur.mjs` (SEO-76, URN-157 girdisi) |
| Günlük kotalar | Google elle istek ~11/gün (9 Kasım ölçüldü: 11. istekte kota doldu), Bing 100/gün, Yandex elle istek kullanılmıyor | 2026-11-09 | `docs/standards/yayin-gorunurluk-denetim-standard.md` Y2.1; `bing-url-gonder.mjs --kota` |
| İşlem defteri | 1 Kasım 2026'dan beri her istek/gönderim satırı (motor, eylem, adres, tarih) | 2026-11-09 | `scripts/seo/dizin-takip.mjs --kaydet`; depo dışı `hareketler.jsonl` |
| Açılış satırı | GEO-SEO penceresi açılışında YAP/TEKRAR sayıları | 2026-11-09 | `scripts/seo/dizin-acilis.mjs`, `.claude/hooks/dizin-acilis.cjs` |
| Ölçüm arşivi | Konu başına "daha önce ölçüldü mü" kaydı | 2026-11-06 | `scripts/seo/olcum-defteri.mjs`, D8 |
| Etki defteri | `degisim` satırı etki satırıdır; vadeler yalnız vadesi gelince dolar, hüküm olumlu/olumsuz/notr/ayrilamiyor/bekliyor. Çıktılar depo dışı: `dizin-takip/sayfa-zaman/<slug>.json`, `ozet.json`; son koşu saati INDEKS.md'de ve aşağıdaki blokta | 2026-11-26 | `node scripts/seo/dizin-takip.mjs --etki`; `--etki-doldur` tek seferlik; D8.1 |

Etki defteri son koşu bloğu `dizin-takip --etki` çıktısıdır; elle düzenlenmez. Yalnız saat ve sayı taşır (adres, sorgu, sıra, tıklama, gösterim bu bloğa girmez, P6).

<!-- ETKI:BASLA -->
Etki defteri son koşu: 2026-11-26T08:35:00.914Z
- etki satırı: 272 (git geçmişinden eklenen: 138)
- hüküm: olumlu 1, olumsuz 1, notr 2, ayrilamiyor 131, bekliyor 137
<!-- ETKI:BITIS -->

## 3. Sırada ve yapılabilecekler

<!-- DEFTER-KANBAN:sirada BASLA — Kanban'dan üretilir (defter:geo-seo-dizin etiketi), elle düzenleme; node scripts/hijyen/defter-kartlari.cjs geo-seo-dizin --yaz · Üretildi: 2026-11-10 -->
| Kart | İş | Durum | Sahip |
|---|---|---|---|
| SEO-76 | Tek önekli adres şeması yayın öncesi ölçüm | Backlog | GEO-SEO |
| SEO-90 | Dizin isteği kuyruğu | Backlog | GEO-SEO |
| SEO-91 | 10 Kasım ölçümü | Backlog | GEO-SEO |
<!-- DEFTER-KANBAN:sirada BITIS -->

| Madde | Gerekçe | Öncelik | Kart |
|---|---|---|---|
| Google dizin isteği: 14 dizinde olmayan adres (4 bilgi merkezi yazısı, 7 ürün sayfası, 2 keşfedildi, 1 tarandı) + BLG-56'nın 2 güncellenmiş yazısı; günde ~11 istek, 10 ve 11 Kasım | Google'ın elle kotası dolduğu için bugün atılamadı; önce kota artığı, sonra yeni yazı (D7 madde 9) | yüksek | SEO-90 |
| Bing ölçümünde kalan 7 adres (ThrottleHost) | SEO-102 düzeltmesiyle 61'den 7'ye indi; kalanlar hız sınırında, bir sonraki ölçümde yeniden denenir. Yine yüksek kalırsa aralık artırılır | düşük | SEO-102 |
| Hava perdesi ve ısı geri kazanım sıra etkisi | Sayfalar dizinde ama aramada üst sırada çıkmadığı gözlemi; dizin değil sıra sorunu olabilir | orta | SEO-91 |
| 308 yönlendirme geçişinin arama motoru ölçümü | Geçiş öncesi eski adres + dizin durumu, geçiş günü tek sıçrama, sonra 14 gün dizin takibi; kural adres-semasi-standard A9/A6. Geçiş tarihi yok (OPS 16 Kasım); geçişe kadar günlük Google ve Yandex turları eski adreslere sürer, 308 sinyali yeni adrese taşır. Plan SEO-117 (alt iş): yayın günü IndexNow eski+yeni, Bing yeni, yeni haritayı Search Console ve Bing'e ver, Google isteği gösterimi çok olandan günde ~11 | orta, geçiş tarihi gelince | SEO-106 (SEO-76 evreni Done; SEO-117 alt iş) |
| "Taranmış, dizinde değil" sayfalar için kalite/iç bağlantı bakışı | İstek bu durumu değiştirmeyebilir; sonsuz istek atılmaz (D7 madde 12) | orta | — |
| Defterin ikinci diske kopyası | Yedekler aynı makinede | düşük | ARAÇ'la |

## 4. Kararlar

| Tarih | Karar | Not |
|---|---|---|
| 2026-11-09 | Takip kapsamı tüm site haritasıdır; Google TAMAM yalnız dizindeyse | OPS onayı, D7 madde 12 (SEO-100) |
| 2026-11-09 | 308 göçü: URUN eşleştirme tablosu ve kural, ALTYAPI üreten iş akışı ve CI kapıları, GEO-SEO arama motoru ölçümü | OPS kararı, SEO-76 |
| 2026-11-08 | Yandex elle isteği ve API jetonu bırakıldı; IndexNow ortak uç noktası yeterli, 14 gün sonra aramada olmayan adres çıkarsa yeniden getirilir | OPS kararı, D7 madde 11 (SEO-98) |
| 2026-11-08 | Öncelik sırası: kota yüzünden atılamayan istekler, sonra yeni yazılar, sonra kontrol ve takip; dizin isteği için ayrıca onay sorulmaz | Recep, D7 madde 9 |
| 2026-11-06 | Yalnız YAP ve TEKRAR olan adres×motor'a istek atılır | D7 madde 3 (SEO-84) |
