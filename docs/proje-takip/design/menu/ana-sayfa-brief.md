
# ANA SAYFA BRİEFİ — VentHub (Claude Code / OPS yazdı, 2026-09-03)

Önce `venthub-canli-durum.md` oku. Bu brief onun üstüne gelir; çelişirse canlı durum dosyası kazanır.
Recep'e soru sorma: kararlar aşağıda. Açık kalan tek şey görsel tercihtir, onu çizerek sun.

## Ana sayfanın birinci işi
Mühendisin/satın almacının 10 saniyede "doğru ürünü burada bulurum" demesi: ÜRÜN BULMA.
İkinci iş: yetkinlik kanıtı (markalar, teknik derinlik). Proje desteği ve senaryodan giriş üçüncü;
senaryo bölümü bu turda YOK (ürünler senaryo etiketi almadı; etiketsiz senaryo yayınlanmaz).

## Dil ve çizgi
Kurumsal, profesyonel, sade. "Apple dili": az ama vurucu bölüm. Pazarlama sloganı yok, uydurma sayı yok.
Elimizde olmayan hiçbir şey konmaz: ortam fotoğrafı yok, müşteri logosu yok, referans projesi yok,
"çok satanlar" yok (veri dayanağı yok), kampanya/indirim yok, fiyat yok.
Elimizde olan: 867 beyaz fonlu ürün fotoğrafı, 5 marka, 7 kategori, 16 ikon, teknik hesaplayıcılar, bilgi merkezi.

## Kabuk (kılavuz C bölümü aynen)
Koyu lacivert header (logo 14A-3 + VentHub wordmark, Ürünler paneli, Hesaplayıcılar, Teklif İste, arama, TR/EN,
Teklif Listesi sayacı) · aydınlık gövde · koyu lacivert footer. Kiremit yalnız birincil buton.

## Bölümler — bu sırayla, başka bölüm ekleme
1. **Hero (aydınlık zemin):** tek cümle vaat + tek birincil eylem "Teklif al" (kiremit) + ikincil "Ürünleri keşfet".
   Görsel: beyaz fonlu ürün fotoğrafı (kılavuz görsel kutusu kuralı), ortam fotoğrafı YOK.
   Sayılar/etiketler yer tutucu: [marka] / [ürün] / [teslim] — gerçek değerler veritabanından gelir.
2. **Kategoriler (7):** kategori ikonu + ad + dal sayısı; 15A kategori kartı düzeni. Boş kategori gösterilmez.
3. **Markalar (5):** Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss. Logo şeridi, sıra ürün sayısına göre.
4. **Ürün bulma yardımı:** arama (model kodu + ürün adı) + hesaplayıcılar bağlantısı. Kısa, tek satır.
5. **Bilgi Merkezi (3 kart):** gerçek makale başlıkları veritabanından; tasarımda [başlık] yer tutucu.
6. **Teklif çağrısı:** "Projeniz mi var?" + "Teknik destek iste" (kılavuzdaki CTA kutusu).
Footer: iletişim, kategoriler, kurumsal bağlantılar, KVKK/legal.

## Yer tutucu kuralı
Gerçek olmayan her metin köşeli parantezle yazılır: [ürün adı], [makale başlığı], [sayı]. Uydurma yok.

## Çıktı
BU projede ("E-ticaret menü tasarımı" = 15A) yeni dosya `Venthub Ana Sayfa.dc.html`; kabuk, kılavuz diliyle yeniden çizilen menüyle aynı: masaüstü 1440 + mobil 390.
Aynı dosyada iki hero varyantı yan yana (A: ürün fotoğrafı solda, B: sağda); kalan bölümler tek sürüm.
Bitince projenin CLAUDE.md'sine "Ana sayfa — çizildi, kararlar" bloğu ekle; Claude Code oradan okur.

