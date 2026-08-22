# T139-VH — Ürün Görseli: Gün-Sonu Bitim Raporu (2026-08-21)

> Şerit: GORSEL (oturum 4a8eaf9c) · Registry: T135-VH · Cetvel: `product-image-standard.md` v0.2
> (bu günün kararlarıyla yazıldı). Pilot raporu: `t139-urun-gorseli-pilotu-2026-08-21.md`.
> Recep kapanış kararı (OPS üzerinden, 16:47): "görsel işi bu kadar; ÜRÜN şeridi açılıyor."

## Tek satır

**Sabah 0/374, akşam 339/374 ürün görselli CANLI (1042 `product_images` satırı).** Dokuz
koşum, dokuz temiz envanter, sıfır geri-alma. Kalan 35 = kaynak işareti olmayanlar (uydurma
yok). Migration GEREKMEDİ; bütün yazımlar service_role + envanter + `--rollback`.

## Ölçülü hikâye (0 → 339)

| # | Koşum | Kaynak | Eklenen ürün | Satır | Kapı / karar |
|---|---|---|---|---|---|
| 1 | Pilot (5 aile) | vortice.com | 5 | 28 | Recep GO; zincirin ilk gerçek-veri kanıtı (#724) |
| 2 | Vortice-169 | vortice.com crawl+probe | +156 → 161 | 596 | Recep "başlat"; 0-görsel fail-visible; 16 diyagram-kapak bilinçli (#725) |
| 3 | SEAT | seat-ventilation.fr Shopify | 53 | 107 | ad eşlemesi; vekil foto yok |
| 4 | SEAT ATEX | baz-model foto | +27 → 80 | 74 | Recep: "sitede ATEX'te aynı foto" (kaynakta doğruladı) |
| 5 | Nicotra tur-1/2/3 | avensair.com | 33 | 39 | arama sınırı → boyut-bazlı → doğrudan-URL fallback (Recep itirazı haklıydı) |
| 6 | Nicotra DD fill | Recep URL (DD 7/7 150W) | +2 → 35 | 2 | Recep: "2 DD için bu resmi kullan" |
| 7 | AVenS | avensair + Daha-Fazla JSON ucu | 12 | 30 | elle-ölçülmüş eşlemeler (tekil/çoğul, watt eki) |
| 8 | Danfoss FC-101 | avensair + danfoss.com | 16 | 32 | Recep: "iki foto, danfoss'un kendisi kapak" |
| 9a | Danfoss FC-102 | danfoss.com og:image | +17 → 33 | 17 | Recep URL'si |
| 9b | KENTALFAN | **Casals** fanware seri fotoğrafı | +14 | 14 | Recep "bu mu acaba?" → ölçümle doğrulandı (14/14 varyant) |
| 9c | Hız anahtarı + FC-51 | avensair carousel + danfoss.com | +4 | 4 | Recep: "sende olanları eşleştirdiklerini yap" |

Kanıt zinciri her koşumda aynı: yükleme envanteri (nesne+satır id) → `net._http_response`
taze 200'ler (tetik→webhook→revalidate kendiliğinden) → storage public URL 200 `image/webp`
→ DB sayımı. Günün toplam webhook ateşlemesi ≈ 1040 taze 200.

## Marka tablosu (akşam)

| Marka | Görselli / toplam | Kaynak |
|---|---|---|
| Vortice | 161/173 | vortice.com |
| SEAT | 80/81 | seat-ventilation.fr (Shopify) |
| Nicotra Gebhardt | **35/35** | avensair.com |
| Danfoss | **34/34** | avensair + danfoss.com resmi (kapak) |
| AVenS | 29/51 | avensair.com + Casals fanware (KENTALFAN) |
| **Toplam** | **339/374** | |

## Kalan 35 — sınıflı liste (kaynak işareti olmadan kapanmaz)

**A. Kaynak sitede ürün sayfası YOK, fiyat kataloğunda VAR (AVenS 22):**
- Elektrikli ısıtıcı (kanal tipi) 6: 3/6/9/12/15/18 KW — AVE-13037/13032/13033/13034/13038/13039
- AVENS-HF/FW 5: 7/7, 9/9, 10/10, 12/12, 15/15 — AVE-20100/20110/20120/20130/20140
- AVENS-HF/S 7: 250…500 — AVE-20200…20260
- Sulu batarya 2: AVE-13050/13051 · BVU-LS 2: AVE-30110/30111
- Olası yol: fiyat kataloğu PDF'inden görsel kırpma (Recep kararı) ya da Recep arşivi.

**B. Türev, karar yok (SEAT 1):** STORM 10 XRM — baz foto var (STORM 10), ATEX kalıbıyla
bağlanabilir; Recep işaret etmedi.

**C. Kaynakta fotoğraf YOK (Vortice 8):** 16080 + Nordik HVLS ailesi 61181-61190 (sayfada
yalnız placeholder + PDF). Üretici yeni görsel yayımlayana kadar kapalı sınıf.

**D. Hayalet kod (Vortice 4):** 16076-79 — vortice.com'da içerik yok; PRICING şeridinde
"uydurma-kod" bulgusu olarak açık (katalog satırı mı silinecek, kod mu düzelecek).

## Günün kanıtlı dersleri (cetvel v0.2 §8-§10'a işlendi)

1. **Aramada-yok ≠ sitede-yok** — iki kez yaşandı (Nicotra 5 ürün, AVenS "Daha Fazla").
   Recep'in itirazları ikisinde de haklıydı; kapı artık doğrudan-URL + içerik kapısı +
   kontrol kolu.
2. **İki doğru desen, yanlış kesişim** — HEATMASTER/KENTALFAN: motor-boyut şeması IEC
   standardı olduğu için örtüşür; ürün sınıfı ayırır. Bağlamadan sormak doğru akıştı.
3. **Sipariş kodu kaynaklar arası 1↔N yazılır** — eşleme model tanımlayıcısına.
4. **Recep'in kaynak işaretleri en hızlı kapanış yolu** — dokuz koşumun altısı onun verdiği
   URL/siteyle açıldı; fail-visible liste bu yüzden "yapılamadı" değil "işaret bekliyor".

## Çelişen-mevcut / devredilen (GORSEL dokunmadı)

- `product_images`'ta INSERT/DELETE politikası YOK → T069 admin yükleme UI = politika-önce-ekran
  (migration) → **ADMIN şeridi**.
- `image_url` mirası kod yüzeylerinde + PDP resolver kopyası (W2.2) + alt-metin i18n
  tasarımı → **ÜRÜN şeridi**.
- "non-contractual photo" gömülü ibaresi (SEAT) → LEGAL bilgi kalemi (OPS'ta).

## Artefaktlar

- Betikler `scripts/media/`: pilot/crawl/probe/manifest/upload(+rollback) · seat-image-run ·
  seat-atex-manifest · avensair-nicotra-run · nicotra-dd-fill · avensair-avens-run ·
  danfoss-fc101-run · danfoss-fc102-fill · avens-kentalfan-fill · **url-fill-manifest** (genel).
- PR'lar: #724 #725 #726 #727 #728 (hepsi MERGED, migration'sız).
- Kalıcı arşiv: `C:/Users/alize/venthub-media/{vortice,seat,nicotra,avens,danfoss,kalan}-2026-08-21`
  (orijinal + webp + manifest + envanter; envanter = rollback haritası).
