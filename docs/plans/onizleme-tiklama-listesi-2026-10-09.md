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
| 10 | `/legal/kvkk` (dil öneksiz) | `/tr/yasal/kvkk-aydinlatma-metni` | Başa `/tr` eklenir, KVKK metni açılır. Kuraldan yazıldı, ilk kez Cuma denenecek. |
| 11 | `/tr/products/avens-5-a-hiz-anahtari-01801` | `/tr/urun/avens-5a-hiz-anahtari-p-ave-01801` | AVenS 5 A hız anahtarı sayfası. **Haritaya bağlı** (aşağıda). |
| 12 | `/en/products/avens-5-a-hiz-anahtari-01801` | `/en/products/avens-5a-speed-controller-p-ave-01801` | Aynı ürün, İngilizce adresle. **Haritaya bağlı.** |
| 13 | `/tr/products/vortice-lineo-100-q-17143` | `/tr/urun/vortice-lineo-100-q-kanal-tipi-fan-74pa-200m3h-p-vrt-17143` | Vortice Lineo 100 Q kanal tipi fan. **Haritaya bağlı.** |
| 14 | `/tr/products/nimax-1004-t4-55kw-nx10034250` | `/tr/urun/casals-nimax-1004-t4-55kw-radyal-fan-p-ave-nx10034250` | Casals Nimax 1004 T4 radyal fan. **Haritaya bağlı.** |
| 15 | `/category/fanlar` | yeni kategori ağacındaki Fanlar adresi (#1352 sonrası yazılır) | **Bekliyor** (#1352). |
| 16 | `/category/hava-perdeleri` | yeni kategori ağacındaki Hava perdeleri adresi | **Bekliyor** (#1352). |
| 17 | `/category/hiz-kontrolu-cihazlari` | yeni kategori ağacındaki Hız kontrol cihazları adresi | **Bekliyor** (#1352). |

## Üç şey Cuma'da belirsiz

1. **Satır 15-17 bekliyor.** Yeni kategori ağacı (#1352) birleşmedi; hedef adresler canlı veritabanında henüz yok. #1352 birleşince bu satırlara yeni adresler yazılır. Cuma'da bu üçü sınanamaz.
2. **Satır 11-14 haritaya bağlı.** Eski ürün adresleri, eski adresleri yeni adrese eşleyen bir harita dosyasıyla yönlenir. Harita bugün depoda boş (`src/lib/adres/haritaKaynagi.ts`); onu üreten iş akışı (PR #1728) ve önizleme başlatıcısı (ALT-37c) OPS hükmünde. Harita önizleme derlemesine girmezse bu dört satır yönlenmez; bu adres kuralının bozuk olduğu anlamına gelmez, harita girmemiştir.
3. **Satır 10 (dil öneksiz adres) ilk kez denenecek.** Beklenti kuraldan yazıldı, gerçek sunucuda ölçülmedi.

Satır 1-9 yalnız rota dili tablosuna bağlıdır; harita ya da #1352 gerekmez.

## Makine de ölçüyor

Aynı kuralı 247 adreste tarama betiği (`scripts/adres/onizleme-tarama.cjs`, PR #1744) sınar: tablodan 20 yeni, 20 eski, 2 değişmeyen ve 11 dil öneksiz adres; 47 ürün ailesinden 94 yeni ve 94 eski adres; 6 eski kategori adresi. Kusursuz sahte sunucuda sonuç: 241 tamam, 0 kırmızı, 6 bekliyor. Gerçek önizleme sunucusunda koşunca kırmızı sayısı 0 olmalı; değilse kırmızı satırları adıyla listeler. Betik yalnız okur (GET), hiçbir şeyi değiştirmez.

Bu liste rota dili tablosundan ve model listesinden türetildi; tablo değişirse yeniden üretilir. Tablo tek kaynaktır, bu belge değildir.
