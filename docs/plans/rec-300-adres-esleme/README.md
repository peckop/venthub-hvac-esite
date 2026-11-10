# Eski site → yeni site adres eşleştirme tablosu (URN-157)

Sahibi: URUN · Üretim tarihi: 2026-11-10 · Cetvel: `docs/standards/adres-semasi-standard.md` v0.3 (§1A, §3), `docs/standards/departman-defter-standard.md`

**Bu klasör yalnız bir TABLODUR.** Yönlendirme kodu yazılmaz, canlıya hiçbir kural girmez. Recep kararı (10 Kasım): tablo tamamlanmadan yönlendirme yok.
Yeni site adresleri Design `adres.json`'dan gelir (kural Design'ındır); eşleştirme `sku` ve canlı kimlikle yapılır, ad benzerliğiyle değil.

## Dosyalar

| Dosya | İçerik |
|---|---|
| `eski-yeni.csv` | Asıl tablo. Ayraç `;`, başlık `eski;yeni;kod;tur;kaynak;not`. `kod` 308 ya da 410 (410'da `yeni` boş). Model satırlarında eski adres `?sku=<SKU>` taşır, başka satırda `?` yoktur. |
| `degismeyen.txt` | Eski adresi yeni sitede aynı yolla yaşayan satırlar (yönlendirme yok, 200). |
| `eslesmeyen.txt` | Hedefi henüz olmayan adresler ve nedeni (Design adres vermemiş). CSV'ye girmez. |
| `yeni-site-adresleri.txt` | Hedef-200 denetimi için Design'ın yaşayan adres listesi, satır satır yol. |
| `canli-anlik.mjs` | Canlı DB anlık görüntüsü (10 Kasım, yalnız SELECT): aktif ürün 431, aile 47, kategori 36, takma adlar. Yalnız slug ve SKU. |
| `canli-site-haritasi-2026-11-10.txt` | Canlı site haritası (101 adres, 10 Kasım). |
| `uret.mjs` | Üretici: `node docs/plans/rec-300-adres-esleme/uret.mjs --adres <Design adres.json> [--ek <eski adres listesi>] [--yaz]` |

## Kapsam (eski evren)

| Grup | Eski adres | Eşleşen | Not |
|---|---|---|---|
| Canlı site haritası | 101 | 101 | TR adresleri; EN karşılıkları ayrıca |
| Kategori (DB) | 36 (aktif 29, pasif 7) | 36 | Dal adresi (`/category/<üst>/<alt>`) ve 12 takma ad, 17 tohum adı dahil |
| Aile (DB) | 47 | 47 | 40 takma ad ve 6 tohum adı dahil. Bir ailenin aktif modeli yok (ölü yönlendirme, 410) |
| Model (DB) | 431 aktif SKU | 431 | Canlıda model sayfası yok: model, aile sayfasında `?sku=`. Hedef Design `model[sku]` |
| Ürün adı (takma/tohum) | 7 | 7 | `/products/<eski-urun-adi>` |
| Marka | 6 + flexiva + `frekans-konvertoru` | 8 | Son ikisi sitemap'te yok |
| Rehber / bilgi merkezi | 13 yazı + liste + 4 eski konu adresi | tümü | 5 yazı Design'da birebir; 8 yazı geçici olarak `/tr/rehber` listesine (BLOG yazıyı Design'a alınca güncellenir) |
| Sabit sayfalar | destek, yasal, hesaplayıcı, iletişim, hakkımızda | tümü | Destek alt sayfaları Design'da yasal sayfalara karşılık geliyor |

Her satır hem TR hem EN için üretilir (EN canlıda 200 verir, `EN_YAYIN` kapalı ve noindex).

## Geçici ve bekleyen satırlar

- `[gecici]` ile başlayan `not` satırları: hedef Design'da henüz karşılık bulmamış, en yakın sayfa yazıldı. Karşılığı gelince hedef güncellenir. Şu an: 8 rehber yazısı (BLOG), ürün seçici (Design seçici adres vermedi), 4 hesaplayıcı aracı adresi (Design tek `hesapla` sayfası).
- `eslesmeyen.txt`: sepet, ödeme, ödeme sonucu ve giriş/kayıt adresleri. Sepet, ödeme adımları ve ödeme sonucunu Design çizer (6 Kasım yol haritası, karar 4-5); adresleri gelince eklenir. Dördü de bugün noindex.

## Çoktan-bire birleşmeler (9 hedef, kasıtlı)

Farklı eski adres aynı yeni adrese gider. Teknik sorun değildir; anlam kararı bu tabloda yol haritasına göre verildi:

| Yeni hedef | Eski kaynaklar | Karar |
|---|---|---|
| `/tr/urunler` | fanlar, hava-şartlandırma (kök kategoriler), hedefsiz eski kategori adları, ürün seçici | Design'da bu iki kök kategorinin tek karşılığı yok (konut ve ticari fanlar, ısıtıcılar ve nem alma ayrı gruplarda); ürünler kökü. Risk: arama motoru bunu alakasız hedef sayabilir. Alternatif gerekirse tek grup seçilir |
| `/tr/urunler/kontrol-ve-aksesuarlar` | aksesuarlar, elektrik aksesuarları (+ kontrol-sistemleri, kontrol-ve-suruculer takma adları) | Design iki kategoriyi tek grupta birleştirdi |
| `/tr/urunler/kanal-tipi-fanlar` | kanal tipi fanlar + iki pasif kategori (kanal içi, dikdörtgen kanal) | Pasif kategoriler dizinde değil |
| `/tr/urunler/vortice-hava-perdesi` | isıtıcısız ve elektrikli ısıtıcılı hava perdesi aileleri | Design iki aileyi tek seride birleştirdi |
| `/tr/urunler/aksiyel-fanlar` | aksiyel kategori + endüstriyel aksiyel aile | Aile Design'da üç seriye bölündü, tek seri hedefi yok, tür sayfasına |
| `/tr/urunler/frekans-konvertorleri` | frekans konvertörleri kategorisi + `brands/frekans-konvertoru` | Bugün de bu yönlendirme var |
| `/tr/rehber` | bilgi merkezi listesi + 8 geçici yazı + eski destek konuları | Geçici, yazılar Design'a girince ayrılır |
| `/tr/hesapla` | 4 hesaplayıcı aracı + liste | Geçici, Design tek hesapla sayfası |
| `/tr/destek` | `destek/sss` ve destek kökü | SSS Design'da destek sayfasında (#sss) |

## Sınırlar (bu turda kapsam dışı ya da bekleyen)

- **GEO-SEO dondurulmuş dizin listesi (SEO-76):** istendi, gelince `--ek` ile eklenir; listedeki her adres bir kalıba oturmazsa `eslesmeyen.txt`'ye nedeniyle düşer.
- **Dilsiz adresler** (`/category/...`, `/products/...`): önce rota dili kuralıyla (ALTYAPI) dilli adrese gider; tablo dilli adresleri kapsar.
- **Güncel ürün adı adresleri** (`/products/<urun-slug>` 431 adet, takma ad olmayanlar): kodda tanınıyor ama sitemap'te ve takma adlarda yok; dizin listesinde çıkarsa eklenir (DB'den slug listesi alınabilir).
- **Eski SKU biçimi** (`?sku=10911` gibi, Design `cevir` tablosu 1060 giriş, 327'sinin hedefi canlıda aktif): bu adreslerin eski sitede yayında olduğuna dair kanıt yok; GEO-SEO listesinde çıkarsa `eski-sku` olarak girer.
- **Oturum alt sayfaları** (`/account/*`, `/auth/*` diğerleri): noindex, tablo dışı.
- **Design verisi tazeliği:** `adres.json` sha256 `ff91f451189facb106434d8d82e544c023c5775c31613715a1dd231954992f84` (önizleme kopyası, dosya tarihi 6 Kasım; OPS'un 9 Kasım okumasıyla fark ölçülmedi). Design değişince üretici yeniden koşulur.
