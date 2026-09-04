# Boşluk listesi — canlı site / kod / Design 15A (OPS ölçümü, 2026-09-04 13:15)

Yöntem: koddaki müşteri sayfa yolları (47 yol, admin hariç) + canlı sitemap (192 adres: 96 TR + 96 EN) + Design 15A
Menü v13 (18 ekran) + Ana Sayfa v7 yan yana kondu. Bu liste OPS'un sayımıdır; Design aynı sayımı depodan ve
sitemap'ten BAĞIMSIZ yapıp bu listeyle karşılaştırsın — iki sayım tutuyorsa liste doğrudur, tutmuyorsa fark yazılsın.

## A. Canlıda/kodda VAR, Design'da ÇİZİLMEMİŞ (çizilmesi ya da "çizilmeyecek" denmesi gereken)

| Grup | Kod yolları | Design'da | Not |
|---|---|---|---|
| Giriş ve şifre | /auth/login, /auth/register, /auth/forgot-password, /auth/reset-password, /auth/callback | YOK | Recep fark etti (K16). Hesap yaprağı "Giriş yapın" der ama gidilecek ekran çizilmedi. |
| Hesap alanı | /account, /account/profile, /account/quotes, /account/quotes/detail, /account/projects, /account/favorites, /account/addresses, /account/security, /account/data-requests, /account/orders, /account/orders/detail, /account/invoices, /account/returns, /account/shipments | YOK | Teklif odaklı modelde (K1) hangileri kalır: Tekliflerim, Projelerim, Favorilerim, Profil, Güvenlik, Veri talepleri. Sipariş/fatura/iade/kargo satış kipiyle gelir. |
| Markalar | /brands, /brands/[slug] | YOK (menüde "Markalar" satırı var, hedef sayfa çizilmedi) | Beş marka; marka sayfası = liste şablonu (ekran 06) + marka başlığı olabilir. |
| Destek / Bilgi Merkezi | /destek/merkez, /destek/sss, /destek/garanti-servis, /destek/iade-degisim, /destek/teslimat-kargo, /destek/konular/[slug] | YOK (menüde "Bilgi Merkezi" var, sayfa yok) | K14: makale araması Faz 4. Konu sayfası şablonu + merkez sayfası. |
| Hesaplayıcılar | /destek/hesaplayicilar/kanal, /hava-perdesi, /hrv, /jet-fan | YOK | Menüde "Hesaplayıcılar" var. Seçici sayfası (geri-bildirim madde 32, "Hesaplayıcılar altı") da çizilmedi; 07d "seçiciden gelinir" der ama seçici yok. |
| Hukuki | /legal/kvkk, /gizlilik-politikasi, /cerez-politikasi, /kullanim-kosullari, /mesafeli-satis-sozlesmesi, /on-bilgilendirme-formu | YOK | Tek uzun-metin şablonu yeter (Source Serif 4, K2). Mesafeli satış + ön bilgilendirme satış kipine bağlı (K1). |
| Kurumsal | /about, /contact | YOK | Footer'da Hakkımızda ve İletişim var. İletişim = Destek yaprağının masaüstü karşılığı. |
| Tüm ürünler | /products | KISMEN (K13: ekran 06 boş süzgeç + marka×kategori haritası, Faz 3) | Menü alt bölgesi "Tüm ürünler (375)" buraya gider. |
| Hata | 404 / not-found | YOK | 08b boş sonuçla aynı dil olabilir. |
| Satış kipi | /cart (sepet), /checkout, /payment-success | Ekran 10 "Teklif Listesi sepet değildir" | K1 gereği checkout/payment çizilmez; /cart adresi teklif listesine dönüşür (adres kararı açık). |

Sayı: Design'da karşılığı olmayan kod yolu 42 / 47. Çizili olanlar: ana sayfa, kategori, dal, filtreli liste, ürün sayfası (4 hâl), teklif listesi.

## B. Design'da VAR, kodda/canlıda YOK (kodlanacak; Faz 2–3)

| Design ekranı | Kod | Not |
|---|---|---|
| 02/03 Menü paneli (ürüne göre / senaryoya göre) | Eski menü | Faz 2 |
| 08 / 08b / 08c Arama sonucu sayfası (/tr/arama) | Yol YOK; arama bugün kayan katman (SearchOverlay) | Yeni yol + liste şablonu (K14) |
| 09 Senaryo sayfası (/tr/senaryo/<slug>) | Yol YOK | 8 senaryo; içerik kaynağı (DB mi, dosya mı) karar ister |
| 11 Karşılaştırma (/tr/karsilastir) | Yol YOK | K10 |
| 12 Header Teklif paneli · Destek/Hesap yaprakları | #981 (bayrak arkasında, Recep kapısı) | Faz 1c |
| Kısa slug adresler (/tr/fanlar/...) | /tr/category/<slug> | K3, 301 + sitemap |
| 06 Kart/Tablo/Seri üç görünüm (matris) | Yalnız kart | K13, Faz 3 |

## C. Karar bekleyen, ikisinde de belirsiz
- Cihaz/ürün seçiminin YERİ (K15 açık konu): seçici sayfası Hesaplayıcılar altında mı, ürün sayfasındaki panel mi tek giriş, senaryo sayfasından mı?
- Proje katmanı: "Projelerim" klasör mü (listeleri gruplar) kapı mı (giriş şartı)?
- /cart adresinin kaderi: teklif listesi adresi ne olacak (K1 + ekran 10).
- Hesap alanında satış-öncesi kipte hangi bölümler görünür (A tablosu, hesap satırı).
