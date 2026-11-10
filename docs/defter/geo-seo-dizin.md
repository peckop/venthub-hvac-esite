# GEO-SEO dizin defteri — hangi sayfa hangi arama motorunda, ne yaptık, sırada ne var

Sahibi: GEO-SEO · Son doğrulama: 2026-11-09 · Cetvel: `docs/standards/departman-defter-standard.md` · Alan cetveli: `docs/standards/dizin-sistemleri-standard.md` (D7, D8) · Kayıt: OPS-258, SEO-101

Bu defter depoya girebilen **özettir**: sayı, tarih, sha256. Ham adres×motor tablosu, arama sorgusu, tıklama ve sıra verisi burada durmaz (P6, cetvel D5); onlar depo dışı arşivde kalır (`~/VentHub-Olcum-Arsiv/geo-seo/dizin-takip/`: `hareketler.jsonl` işlem defteri, `dizin-takip-<gün>.json` günlük anlık görüntü, `yedek/` günlük kopya). Tutarlılık: `node scripts/seo/dizin-defter-kontrol.mjs` (0 tutarlı, 1 sapma, 2 ölçülemedi); özeti yenilemek için `--ozet`.

## 1. Ne yaptık

<!-- DEFTER-KANBAN:ne-yaptik BASLA — Kanban'dan üretilir (defter:geo-seo-dizin etiketi), elle düzenleme; node scripts/hijyen/defter-kartlari.cjs geo-seo-dizin --yaz · Üretildi: 2026-11-10 -->
| Kapanış | Kart | İş | Sahip |
|---|---|---|---|
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
  "anlikGoruntu": "dizin-takip-2026-11-09.json",
  "gun": "2026-11-09",
  "sha256": "ee9171f51abca8234f6bc6b7706bab63fce83502963a885884fb7216b8e3aa4f",
  "adresSayisi": 101,
  "kapsam": {
    "about": 1,
    "bilgi-merkezi": 14,
    "brands": 7,
    "category": 29,
    "contact": 1,
    "diger": 1,
    "products": 47,
    "urun-secici": 1
  },
  "kararlar": {
    "google": {
      "TAMAM": 72,
      "BEKLE": 12,
      "TEKRAR": 0,
      "YAP": 17,
      "ATLA": 0,
      "ESKI": 0,
      "OLCULEMEDI": 0
    },
    "bing": {
      "TAMAM": 68,
      "BEKLE": 18,
      "TEKRAR": 0,
      "YAP": 8,
      "ATLA": 0,
      "ESKI": 0,
      "OLCULEMEDI": 7
    },
    "indexnow": {
      "TAMAM": 33,
      "BEKLE": 0,
      "TEKRAR": 0,
      "YAP": 1,
      "ATLA": 0,
      "ESKI": 67,
      "OLCULEMEDI": 0
    },
    "yandex": {
      "TAMAM": 0,
      "BEKLE": 15,
      "TEKRAR": 4,
      "YAP": 17,
      "ATLA": 0,
      "ESKI": 65,
      "OLCULEMEDI": 0
    }
  },
  "olculemeyen": {
    "bing: ThrottleHost": 7
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
| Günlük kotalar | Google elle istek ~11/gün (9 Kasım ölçüldü: 11. istekte kota doldu), Bing 100/gün, Yandex elle istek kullanılmıyor | 2026-11-09 | `docs/standards/yayin-gorunurluk-denetim-standard.md` Y2.1; `bing-url-gonder.mjs --kota` |
| İşlem defteri | 1 Kasım 2026'dan beri her istek/gönderim satırı (motor, eylem, adres, tarih) | 2026-11-09 | `scripts/seo/dizin-takip.mjs --kaydet`; depo dışı `hareketler.jsonl` |
| Açılış satırı | GEO-SEO penceresi açılışında YAP/TEKRAR sayıları | 2026-11-09 | `scripts/seo/dizin-acilis.mjs`, `.claude/hooks/dizin-acilis.cjs` |
| Ölçüm arşivi | Konu başına "daha önce ölçüldü mü" kaydı | 2026-11-06 | `scripts/seo/olcum-defteri.mjs`, D8 |

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
| 308 yönlendirme geçişinin arama motoru ölçümü | Geçiş öncesi eski adres + dizin durumu, geçiş günü tek sıçrama, sonra 14 gün dizin takibi; kural adres-semasi-standard A9/A6 | orta, geçiş tarihi gelince | SEO-76 |
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
