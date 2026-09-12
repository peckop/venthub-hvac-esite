# Kararlar — SEO ve Yayın (Linear belgesinin TAM dışa aktarımı · 2026-09-12 ayna: K1–K6)

<!-- kaynak_id: 2eb6c0f6-8cc6-4197-9e91-527c59a2e16e · kaynak_updatedAt: 2026-09-11T10:45:50.681Z · kopya: 2026-09-12T10:10Z -->
<!-- Tazelik yalnız yukarıdaki damgayla ölçülür (kaynak_updatedAt > kopya ise bayat). Tek kopya kuralı: bu dosyanın başka yerde ikinci kopyası tutulmaz. -->

> Karar SSOT'u Linear'dır; bu dosya NotebookLM defteri ve Design projeleri için kopyadır. Çelişkide Linear kazanır.

Tek kaynak; karar buraya yazılmadan verilmiş sayılmaz.

## K1 · Kanonik alan adı

[venthub.com.tr](<http://venthub.com.tr>) (www'suz); www → apex 308; [vercel.app](<http://vercel.app>) müşteriye verilmez.

## K2 · Kök yönlendirme (2026-09-03, REC-127)

Kök ve admin 308 (kalıcı); dil-algılamalı derin yollar 307 (bilinçli sapma, gerekçe kodda). hreflang tek desen: tr / en / x-default, layout tüm alt sayfaları besler. Ürün sayfası H1 etiketi zorunlu (INV-SEO-H1-1).

## K3 · Kategori adres geçişi (2026-09-03, Recep)

Kısa slug (`/tr/fanlar/korozyon-dayanimli`), `/category/` kalkar. Eski adresler 301; hreflang, sitemap, GSC aynı yayında. Vitrin Faz 2 ile birlikte gider. Ürün adresleri değişmez.

**K3-b · K3 İPTAL, ürün adresi yeniden (2026-09-11, Recep KARARI; kaynak: Drive "SKU" belgesi, Gemini görüşmesi):** Kısa slug OLMAYACAK; önekler KALIR (önek kaldırmanın SEO faydası yok, çakışma riski ve fazladan sorgu var). **Önek TÜRKÇELEŞİR (Recep 09-11 öğleden sonra, Design-Menü penceresi):** TR yüzey `/tr/kategori/<kategori>` · `/tr/kategori/<kategori>/<dal>` · `/tr/urun/<aile-slug>` · `/tr/urun/<uzun-slug>-p-<sku>` · `/tr/urunler`; EN yüzey değişmez (`/en/category/…` · `/en/products/…`, kanonik kimlik EN slug). Bedel: 33 kategori/dal adresi 308 (TR), aynı yayında. **SKU adreste küçük harf** (`-p-vrt-17161`); büyük harfli gelen adres 200 vermez, kanoniğe 308; ölçüm: 442 SKU `^[A-Z0-9-]+$`, `lower(sku)` tekil 442/442. **Sayfa birimi (Design-Menü v18, Recep 09-08/09-11):** iki sayfa: AİLE sayfası anlatır ve modelleri listeler (`/tr/products/<aile-slug>`, kodsuz, DEĞİŞMEZ); MODEL sayfası kanoniktir ve satar: `/tr/products/<teknik-uzun-slug>-p-<sku>` (slug = marka + model + tip + 2-3 kritik teknik değer; adres SONDAKİ SKU ile çözülür, slug metni serbest). `?sku=` parametresi KALKAR; K3'ün "model adresleri Faz 3'te" maddesi bu kararla KAPANIR. Kod = `products.sku` (marka öneki + üretici kodu, tekil); kod düzeltilirse tek 308 (K12). Etki: 442 model adresi tek yayında; kategori/dal/aile/marka adresleri değişmez. OPS'un "-p-<aile-no> + ?sku=" önerisi GERİ ÇEKİLDİ (ailede kısa numara yok, kanonik nesne model). Eski adresler 301/308; kanonik, sitemap, hreflang, GSC aynı yayında (K4 IndexNow aynı yayın). ZAMANI: katalog paketi bitince, TEK yayında; öncesinde adres değişmez. Paket sözleşmesine `seo_slug` + `adres_kodu` kolonları öneri olarak girer (DESIGN-KATALOG). REC-270 bu kararla kapanır. Design-Menü'nün kategori DB bulgusu (09-11, Linear'a gelecek) bu maddeye eklenir.

## K4 · IndexNow (2026-09-03, Recep)

Anahtar ve `public/<anahtar>.txt` ŞİMDİ DEĞİL; kategori adres geçişiyle AYNI yayında (Bing'i değişecek adreslerle beslemeyelim). Modül anahtar yokken sessiz no-op, yanıtta "atlandı" görünür (INV-INDEXNOW-1).

## K5 · GSC

Kuruldu; sitemap 192 URL başarılı (2026-08-29).

## K6 · Yapısal veri

Teklif modunda JSON-LD fiyat beyan etmez (REC-111 kapandı).

---

*2026-09-04 ilk sürüm (OPS).*
