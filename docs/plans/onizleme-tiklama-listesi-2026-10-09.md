# Cuma önizlemesi: nereye tıklayacağım (adres listesi)

> v1 · 2026-10-07 · Şerit: ALTYAPI · Kart: ALT-37d (üst kart ALT-37, vade Perşembe 8 Ekim 18:00) · **Durum: LİSTE HAZIR; gerçek sunucuda henüz denenmedi**
> **Yöneten cetveller:** `docs/standards/rota-dili-standard.md` (adres tablosu tek kaynak; eski adres tek yönlendirmeyle yeni adrese gider), `docs/standards/adres-semasi-standard.md`.
> **Kaynaklar:** `src/config/rotaDili.veri.json` (satır 1-10), `docs/plans/rec300-model-adres-listesi-2026-09-23.csv` (satır 11-14), `src/data/eski-adres-tohum.json` (satır 15-17).
> Okuyan: Recep, Cuma 9 Ekim 15:00-18:00. Okuma süresi 2 dakika.

## Ne yapacaksın

Önizleme sunucusu Cuma 14:30'da ayakta olacak; adresini OPS yazar. Aşağıdaki her satır için:

1. Soldaki adresi (bugün canlı sitede açılan adres) önizleme adresinin sonuna yapıştır, Enter.
2. Sayfa açılmalı ve adres çubuğu **sağdaki adrese dönmeli**. Tek seferde dönmeli; arka arkaya iki kez değişmemeli.
3. Sağdaki adresi de bir kez doğrudan yapıştır. Aynen açılmalı, adres değişmemeli.

Biri tutmazsa yalnız o satırın numarasını OPS'a yaz. Başka bir şey yazmana gerek yok.

## Liste (17 adres)

| # | Bugün (canlı sitede) | 11 Ekim'den sonra | Ne görmelisin |
|---|---|---|---|
| 1 | `/tr/about` | `/tr/hakkimizda` | Hakkımızda sayfası açılır. |
| 2 | `/tr/contact` | `/tr/iletisim` | İletişim sayfası açılır. |
| 3 | `/tr/urun-secici` | `/tr/secici` | Ürün seçici açılır. |
| 4 | `/tr/destek/sss` | `/tr/sss` | Sık sorulan sorular açılır. |
| 5 | `/tr/legal/kvkk` | `/tr/yasal/kvkk-aydinlatma-metni` | KVKK aydınlatma metni açılır. |
| 6 | `/tr/legal/mesafeli-satis-sozlesmesi` | `/tr/yasal/mesafeli-satis-sozlesmesi` | Mesafeli satış sözleşmesi açılır. |
| 7 | `/tr/destek/iade-degisim` | `/tr/yasal/iptal-ve-iade` | İptal ve iade sayfası açılır (destek altından yasal altına taşınır). |
| 8 | `/en/destek/sss` | `/en/faq` | İngilizce sık sorulan sorular açılır. |
| 9 | `/en/about` | `/en/about` (değişmez) | İngilizce hakkımızda açılır. Adres **değişmemeli**, yönlendirme olmamalı. |
| 10 | `/legal/kvkk` (dil öneksiz) | `/tr/yasal/kvkk-aydinlatma-metni` | Başa `/tr` eklenir, KVKK metni açılır. Önizleme sunucusunda ölçüldü (tek yönlendirme). |
| 11 | `/tr/products/avens-5-a-hiz-anahtari-01801` | `/tr/urun/avens-hiz-anahtarlari` | AVenS hız anahtarları **ürün ailesi** sayfası açılır; 5 A model bu sayfadan seçilir. Model sayfası yok (aşağıda, madde 2). **Haritaya bağlı.** |
| 12 | `/en/products/avens-5-a-hiz-anahtari-01801` | `/en/products/avens-hiz-anahtarlari` | Aynı ürün ailesi, İngilizce adresle. **Haritaya bağlı.** |
| 13 | `/tr/products/vortice-lineo-100-q-17143` | `/tr/urun/vortice-lineo-kanal-fanlari` | Vortice Lineo kanal fanları ürün ailesi açılır. **Haritaya bağlı.** |
| 14 | `/tr/products/nimax-1004-t4-55kw-nx10034250` | `/tr/urun/casals-nimax` | Casals Nimax ürün ailesi açılır. **Haritaya bağlı.** |
| 15 | `/category/fanlar` | yeni kategori ağacındaki Fanlar adresi (#1352 sonrası yazılır) | **Bekliyor** (#1352). |
| 16 | `/category/hava-perdeleri` | yeni kategori ağacındaki Hava perdeleri adresi | **Bekliyor** (#1352). |
| 17 | `/category/hiz-kontrolu-cihazlari` | yeni kategori ağacındaki Hız kontrol cihazları adresi | **Bekliyor** (#1352). |

## İki şey Cuma'da belirsiz

1. **Satır 15-17 bekliyor.** Yeni kategori ağacı (#1352) birleşmedi; hedef adresler canlı veritabanında henüz yok. #1352 birleşince bu satırlara yeni adresler yazılır. Cuma'da bu üçü sınanamaz.
2. **Satır 11-14 haritaya bağlı ve ürün ailesine gider.** Eski ürün adresleri, eski adresleri yeni adrese eşleyen bir harita dosyasıyla yönlenir. Harita depoda boştur (`src/lib/adres/haritaKaynagi.ts`); önizleme başlatıcısı (ALT-37c, `--adres` kipi) haritayı canlı veritabanından üretip yalnız önizleme ağacına bağlar. Harita girmezse bu dört satır yönlenmez; bu adres kuralının bozuk olduğu anlamına gelmez, harita girmemiştir. Hedef model sayfası değil **ürün ailesi** sayfasıdır: model sayfaları yalnız `src/config/yayindaModeller.veri.json` listesindeki modellerde açılır (karar 259, kısa pilot) ve bu liste bugün boştur. Bir model açılırsa o modelin eski adresi model sayfasına gider; makine taraması listeyi kendisi okuyup beklentisini ona göre kurar, bu belge elle yenilenir.

Satır 1-9 yalnız rota dili tablosuna bağlıdır; harita ya da #1352 gerekmez.

## Makine de ölçüyor

Aynı kuralı 247 adreste tarama betiği (`scripts/adres/onizleme-tarama.cjs`, PR #1744) sınar: tablodan 20 yeni, 20 eski, 2 değişmeyen ve 11 dil öneksiz adres; 47 ürün ailesinden 94 model adresi (pilot liste boşken hepsi 404 olmalı: model sayfası yok) ve 94 eski adres (ürün ailesine tek yönlendirme); 6 eski kategori adresi. Başlatıcı bu taramayı kendisi koşar ve özetini basar. Gerçek önizleme sunucusunda 9 Ekim'de ölçüldü: 241 tamam, 0 kırmızı, 6 bekliyor. Kırmızı çıkarsa satırları adıyla listeler. Betik yalnız okur (GET), hiçbir şeyi değiştirmez.

Bu liste rota dili tablosundan ve model listesinden türetildi; tablo değişirse yeniden üretilir. Tablo tek kaynaktır, bu belge değildir.
