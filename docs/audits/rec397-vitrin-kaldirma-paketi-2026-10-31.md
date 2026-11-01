# REC-397 — Seçenek B (geçici vitrinden indirme) paketi ve seçenek A (üretici teyidi) e-posta taslağı

Karar: Recep, 31 Ekim, OPS penceresinde: B ile A birlikte. Bu belge paket; canlı yazımı OPS koşar. Canlıya yazılmadı.
Yöntem: elle, kuru koşu zorunlu. Kaynak/cetvel: `rec397-yalniz-ab-disi-pazar-karar-ozeti-2026-10-31.md`, `catalog-ingestion-standard.md`, `rendering-cache-standard.md`.

## 1. Yazım paketi

- Dosya: `scripts/db/product-data/rec397-yayindan-kaldir.sql`; dört blok, ayrı ayrı çalıştırılır: (1) kuru koşu SELECT, (2) yaz, (3) geri alma, (4) yazım sonrası ölçüm.
- Mekanizma: `products.status` değerini `active` yerine `archived` yapmak. Emsal: SEA-61102010, 19 Ekim 2026'dan beri arşivli. Yeni alan ve migration yok.
- Kuru koşu çıktısı beklentisi (canlıdan 31 Ekim ölçüldü): 10 satır, hepsi `eski_deger = active`, `yeni_deger = archived`:

| SKU | Aile | Eski → yeni |
|---|---|---|
| VRT-16107, 16108, 16109, 16153, 16155, 16156, 16157 (7) | vortice-vort-commercial-in-line-yuvarlak-kanal-fanlari | active → archived |
| VRT-40903, 41219, 41459 (3) | vortice-aksiyel-endustriyel-fanlar | active → archived |

- Yazım bloğu içte sayar: tam 10 satır güncellenmezse hata verir ve işlem geri döner.
- Ortam değişkeni yok: SQL, OPS'un Supabase SQL aracında çalıştırılır (proje tnofewwkwlyjsqgwjjga). Ayrı betik ya da anahtar gerekmez.
- Geri alma: blok 3, aynı 10 SKU'yu `active` yapar (silme yok, veri kaybı yok); aynı 10 satır sayacıyla.

## 2. Etki listesi

Ölçülen (31 Ekim, canlı):

| Yüzey | Şimdi | Yazımdan sonra |
|---|---|---|
| Kanal fanı ailesi (`/tr/products/vortice-vort-commercial-in-line-yuvarlak-kanal-fanlari`) | 200, 7 model | Ailenin 7 ürününün 7'si iniyor: aktif ürün 0. Sayfanın 404 mü boş 200 mü döneceği ölçülmedi (yazmadan ölçülemez). Sitemap ve kategori listesi koduna göre aileyi dışarıda bırakır (aşağıdaki iki satır). |
| Aksiyel endüstriyel ailesi (`/tr/products/vortice-aksiyel-endustriyel-fanlar`) | 200, 16 ürün | 16'dan yalnız 3 model iniyor; 13 ürünle sayfa AYAKTA kalır, yalnız 3 model düşer |
| Model adresi (`?sku=VRT-…`) | Aile sayfasında parametre, ayrı adres değil | Ürün arşivlenince aile sayfasındaki model listesinden düşer |
| Site haritası | İki aile adresi `/tr/products/...` olarak var (EN karşılığı ölçülmedi); model satırı yok | Kanal fanı ailesi: kod, aktif ürünü olmayan aileyi haritadan çıkarır (`family.service.ts` ~satır 716, `haritaUret.ts` ~satır 134 `status='active'`). Aksiyel aile haritada kalır |
| Arama indeksi | Ürünler indeksli | `arama_urun_tazele` tetiği ürün güncellenince indeksi yeniler; etkisi yazımdan sonra ölçülür |
| Önbellek/yenileme | — | `products` güncellemesi `on_products_change` tetiğini ateşler; sayfa ve harita yenilemesi bu yoldan. Gecikme olursa yenileme komutu OPS'ta |
| Siparişler, teklifler, sepetler | 0 / 0 / 0 | Etkilenen kayıt yok |

IndexNow: kod tabanında IndexNow'un otomatik tetiklendiği bir yer bulmadım (yalnız `src/middleware.ts` ve rol belgelerinde anılıyor); dizin bildirimi GEO-SEO'nun elle işi gibi görünüyor. Bu ölçülmedi; GEO-SEO'ya sorulmalı.

Geo-SEO için kalkan adres listesi:
- `/tr/products/vortice-vort-commercial-in-line-yuvarlak-kanal-fanlari` (ve varsa `/en/…`): aile sayfası inecek ya da boş kalacak; yönlendirme kararı gerekir (bu paketin kapsamı dışı: yeni adres/yönlendirme = Recep kararı).
- `?sku=VRT-16107, 16108, 16109, 16153, 16155, 16156, 16157` (kanal fanı ailesi) ve `?sku=VRT-40903, 41219, 41459` (aksiyel aile): arama motorunda indeksli parametreli adres varsa yazımdan sonra düşecek; hangilerinin indeksli olduğu ölçülmedi.

## 3. Seçenek A — üreticiden yazılı teyit: e-posta taslağı (göndermeyi OPS, Recep'e sorarak yapar)

### Türkçe

Konu: Türkiye'ye gelen CA MD ve E 404/504/604 M serileri için ErP uygunluk teyidi

Merhaba,

Türkiye'de satışını yaptığımız aşağıdaki Vortice ürünleri için katalogunuzda "yalnız AB dışı pazar" ve CA MD serisi için "AB ErP 2018 tüzüğüne uygun değil" ibaresi yer alıyor (Commercial in-line fans broşürü s.33 ve s.39; Industrial ventilation broşürü s.4 ve s.5).

Ürün kodlarımız:
- CA MD: 16107, 16108, 16109, 16153, 16155, 16156, 16157
- E M serisi: 40903 (E 404 M), 41219 (E 504 M), 41459 (E 604 M)

Rica ediyoruz, yazılı olarak teyit eder misiniz:
1. Türkiye'ye tedarik edilen bu kodlar ErP (ilgili ekotasarım) tüzüğüne uygun mu, uygun değilse hangi tüzük ve neden?
2. Uygun değilse Türkiye için uygunluk taşıyan muadil kodlar nelerdir (ör. AB içi CA MD EP serisi)?
3. Uygunluğu gösteren belgeyi (uygunluk beyanı ve teknik dosya özeti) paylaşabilir misiniz?

Cevabınıza göre bu ürünlerin satışına devam edip etmeyeceğimize karar vereceğiz.

Teşekkürler,
[Ad Soyad, Şirket, telefon]

### English

Subject: ErP compliance confirmation for CA MD and E 404/504/604 M models supplied to Türkiye

Hello,

For the following Vortice products we sell in Türkiye, your catalogue states "available only for the extra-EU market", and for the CA MD range "not in compliance with Reg. ErP 2018" (Commercial in-line fans brochure p.33 and p.39; Industrial ventilation brochure p.4 and p.5).

Our product codes:
- CA MD: 16107, 16108, 16109, 16153, 16155, 16156, 16157
- E M range: 40903 (E 404 M), 41219 (E 504 M), 41459 (E 604 M)

Could you please confirm in writing:
1. Are these codes, as supplied to Türkiye, compliant with the applicable ecodesign (ErP) regulation? If not, which regulation and why?
2. If not compliant, which equivalent codes carry compliance for Türkiye (e.g. the EU-market CA MD EP range)?
3. Can you share the supporting documents (declaration of conformity and technical file summary)?

We will decide whether to continue selling these products based on your answer.

Kind regards,
[Name, Company, phone]

## 4. Ölçülmeyenler

- Aktif ürünü kalmayan kanal fanı ailesi sayfasının davranışı (404 ya da boş sayfa): yazmadan ölçülemez.
- IndexNow bildirimi ve hangi parametreli adreslerin indeksli olduğu.
- EN sayfaların site haritası satırları.
- Arama indeksinin yazımdan sonraki durumu.
